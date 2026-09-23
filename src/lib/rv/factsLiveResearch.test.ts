import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  SPEC_REPORT_RESEARCH_TIMEOUT_MS,
  WEB_SEARCH_MODELS,
} from "../rvgrok/webSearch.ts";
import type { ExecuteWebResearchOpts } from "../rvgrok/webResearchTelemetry.ts";
import {
  FACTS_GAP_RESEARCH_TIMEOUT_MS,
  FACTS_SOFT_RESEARCH_TIMEOUT_MS,
  catalogPinsToLiveDossier,
  factsDossierResearchQuery,
  factsDossierSoftQuery,
  mergeSoftFieldsIntoDossier,
  parseFactsSoftNotes,
  planFactsDossierResearch,
  researchFactsDossierNotes,
  researchFactsSoftNotes,
  resolveFactsCatalogPins,
  type FactsCatalogCandidate,
} from "./factsDossierResearch.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

const COMPLETE_CANDIDATE: FactsCatalogCandidate = {
  engine: "Cummins X15 605HP",
  horsepower: 605,
  torque: "1950 lb-ft",
  chassis: "Spartan K3",
  transmission: "Allison 4000 MH",
  fuelType: "Diesel",
  type: "Class A Diesel",
  lengthFt: `44' 11"`,
  gvwr: "54,000 lbs",
  gvwrLbs: 54000,
  uvw: "42,000 lbs",
  uvwLbs: 42000,
  uvwEstimated: false,
  freshWater: "100 gal",
  grayWater: "75 gal",
  blackWater: "50 gal",
};

test("Facts wires catalog-first gap browse — not always-on full report", () => {
  const helper = src("factsDossierResearch.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const live = src("liveDossier.ts");

  assert.match(helper, /executeWebResearch/);
  assert.match(helper, /skipGate: true/);
  assert.match(helper, /WEB_SEARCH_MODELS/);
  assert.match(helper, /FACTS_GAP_RESEARCH_TIMEOUT_MS = 22_000/);
  assert.match(helper, /FACTS_SOFT_RESEARCH_TIMEOUT_MS = 14_000/);
  assert.match(helper, /planFactsDossierResearch/);
  assert.match(helper, /researchFactsSoftNotes/);
  assert.match(helper, /mergeSoftFieldsIntoDossier/);
  assert.doesNotMatch(helper, /researchOrder\s*:/);
  assert.doesNotMatch(helper, /Give me the full specs report/);
  assert.doesNotMatch(helper, /SPEC_REPORT_RESEARCH_TIMEOUT_MS/);
  assert.doesNotMatch(
    helper,
    /coachKnowledge|loadCoachKnowledge|planCoachKnowledgeWrite/,
  );

  assert.match(dossier, /getResearchProviderOverride/);
  assert.match(dossier, /researchFactsDossierNotes/);
  assert.match(dossier, /researchFactsSoftNotes/);
  assert.match(dossier, /mergeSoftFieldsIntoDossier/);
  assert.match(dossier, /Promise\.all/);
  assert.match(dossier, /denyUnlessWhitelisted/);
  assert.match(dossier, /web-research-then-extract/);
  assert.match(dossier, /catalog-pins/);
  assert.match(dossier, /grok-4\.7/);
  assert.match(dossier, /research\.skipped/);
  assert.doesNotMatch(dossier, /grok-3|grok-2-1212/);
  assert.doesNotMatch(dossier, /researchOrder\s*:/);
  assert.doesNotMatch(
    dossier,
    /callGrok\(RESEARCH_SYSTEM/,
    "research notes must not come from chat-only completions",
  );
  assert.match(
    dossier,
    /applyBrochurePin/,
    "brochure pins still run after live extract",
  );

  assert.match(detail, /fetchLiveDossier\(/);
  assert.match(detail, /uvwEstimated/);
  assert.doesNotMatch(
    detail,
    /if\s*\(!.*catalog[\s\S]{0,80}fetchLiveDossier/,
    "report open still POSTs; server decides whether to browse",
  );

  assert.match(live, /\/api\/rvfax\/dossier/);
  assert.match(live, /researchAccessHeaders/);
  assert.match(live, /lockPowertrainFromCatalog/);
  assert.match(live, /applyPowertrainPin/);
});

test("narrow gap query names only the missing field and avoids the 52s report budget", () => {
  const query = factsDossierResearchQuery({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    gaps: ["torque"],
  });
  assert.match(query, /torque/i);
  assert.match(query, /2023 American Coach American Dream 45A/);
  assert.doesNotMatch(query, /full specs report/);
  assert.doesNotMatch(query, /spec sheet|carfax|coach report/i);
  // Facts passes FACTS_GAP_RESEARCH_TIMEOUT_MS explicitly — never
  // researchTimeoutMs("chat", query), which is the 52s SPEC_REPORT path.
  assert.equal(SPEC_REPORT_RESEARCH_TIMEOUT_MS, 52_000);
  assert.ok(FACTS_GAP_RESEARCH_TIMEOUT_MS < SPEC_REPORT_RESEARCH_TIMEOUT_MS);
  assert.ok(FACTS_GAP_RESEARCH_TIMEOUT_MS <= 24_000);
  assert.ok(FACTS_GAP_RESEARCH_TIMEOUT_MS >= 20_000);
  assert.ok(FACTS_SOFT_RESEARCH_TIMEOUT_MS <= 15_000);
  assert.ok(FACTS_SOFT_RESEARCH_TIMEOUT_MS <= 20_000);
  assert.ok(FACTS_SOFT_RESEARCH_TIMEOUT_MS < FACTS_GAP_RESEARCH_TIMEOUT_MS);
  assert.deepEqual([...WEB_SEARCH_MODELS], ["grok-4.7"]);
});

test("full catalog pin → no executeWebResearch", async () => {
  const calls: ExecuteWebResearchOpts[] = [];
  const notes = await researchFactsDossierNotes({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: COMPLETE_CANDIDATE,
    catalogBlock: "CATALOG CANDIDATE TRUTH\n- engine: Cummins X15 605HP",
    researchProvider: "xai",
    execute: async (opts) => {
      calls.push(opts);
      return {
        ok: true,
        notes: "should not run",
        model: "grok-4.7",
        kind: "success",
        durationMs: 12,
      };
    },
  });
  assert.equal(calls.length, 0);
  assert.ok(notes);
  assert.equal(notes!.skipped, true);
  assert.equal(notes!.model, "catalog-pin");
  assert.equal(notes!.text, "");
  assert.deepEqual(notes!.gaps, []);
  assert.match(notes!.pins.engine || "", /X15/);
  assert.equal(notes!.pins.horsepower, 605);
  assert.equal(notes!.pins.torqueLbFt, 1950);
});

test("missing torque only → narrow query mentions torque; other pins stay", async () => {
  const calls: ExecuteWebResearchOpts[] = [];
  const candidate: FactsCatalogCandidate = {
    engine: "Acme SuperDuty 380HP",
    horsepower: 380,
    chassis: "Freightliner M2",
    transmission: "Allison 2500",
    fuelType: "Diesel",
    lengthFt: "36 ft",
    gvwrLbs: 26000,
    uvwLbs: 21000,
    uvwEstimated: false,
    freshWater: "80 gal",
    grayWater: "40 gal",
    blackWater: "40 gal",
  };
  const plan = planFactsDossierResearch({
    year: "2018",
    make: "Unknown Coachworks",
    model: "Phantom",
    floorplan: "32X",
    candidate,
  });
  assert.deepEqual(plan.gaps, ["torque"]);
  assert.equal(plan.skipLive, false);
  assert.match(plan.query || "", /torque/i);
  assert.doesNotMatch(plan.query || "", /full specs report/);
  assert.doesNotMatch(plan.query || "", /GVWR|UVW|holding tanks|engine/i);

  const notes = await researchFactsDossierNotes({
    year: "2018",
    make: "Unknown Coachworks",
    model: "Phantom",
    floorplan: "32X",
    candidate,
    researchProvider: "xai",
    execute: async (opts) => {
      calls.push(opts);
      return {
        ok: true,
        notes: "CONFIRMED: yes. OEM brochure torque 860 lb-ft.",
        model: "grok-4.7",
        kind: "success",
        durationMs: 9,
      };
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.skipGate, true);
  assert.equal(calls[0]!.timeoutMs, FACTS_GAP_RESEARCH_TIMEOUT_MS);
  assert.equal(calls[0]!.maxAttempts, 1);
  assert.equal(calls[0]!.researchOrder, undefined);
  assert.match(calls[0]!.query, /torque/i);
  assert.doesNotMatch(calls[0]!.query, /full specs report/);
  assert.ok(notes);
  assert.equal(notes!.skipped, false);
  assert.deepEqual(notes!.gaps, ["torque"]);
  assert.equal(notes!.pins.engine, "Acme SuperDuty 380HP");
  assert.equal(notes!.pins.horsepower, 380);
  assert.equal(notes!.pins.torqueLbFt, null);
  assert.match(notes!.text, /860/);
});

test("estimated UVW is not a pin — still a UVW gap", () => {
  const pins = resolveFactsCatalogPins({
    year: "2018",
    make: "Unknown Coachworks",
    model: "Phantom",
    floorplan: "32X",
    candidate: {
      ...COMPLETE_CANDIDATE,
      engine: "Acme SuperDuty 380HP",
      horsepower: 380,
      torque: "860 lb-ft",
      chassis: "Freightliner M2",
      uvw: "21,000 lbs",
      uvwLbs: 21000,
      uvwEstimated: true,
    },
  });
  const plan = planFactsDossierResearch({
    year: "2018",
    make: "Unknown Coachworks",
    model: "Phantom",
    floorplan: "32X",
    pins,
  });
  assert.equal(pins.uvwLbs, null);
  assert.ok(plan.gaps.includes("uvw"));
  assert.match(plan.query || "", /UVW/);
});

test("catalog miss / research failure soft-fails — no invented notes", async () => {
  const notes = await researchFactsDossierNotes({
    year: "1998",
    make: "Unknown Coachworks",
    model: "Phantom",
    researchProvider: "xai",
    execute: async () => ({
      ok: false,
      reason: "no XAI_API_KEY on the server",
      kind: "missing_key",
      durationMs: 1,
    }),
  });
  assert.equal(notes, null);

  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const live = src("liveDossier.ts");
  assert.match(dossier, /if \(!twoStep\)/);
  assert.match(dossier, /status: 502/);
  assert.match(dossier, /catalog year-band remains on screen/);
  assert.match(dossier, /pinsHaveHardFacts/);
  assert.match(live, /if \(json && json\.data && typeof json\.data === "object"\)/);
  assert.match(live, /Live lookup failed/);
  assert.match(
    live,
    /catalog year-band remains/,
    "client soft-fail keeps catalog paint",
  );
});

test("brochure powertrain pins are not stomped by live research fields", () => {
  const pin = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "45A",
  );
  assert.ok(pin);
  assert.match(pin!.engine, /X15/);
  assert.equal(pin!.horsepower, 605);
  assert.equal(pin!.torqueLbFt, 1950);
  assert.ok(
    Math.abs(450 - pin!.horsepower) >= 40,
    "live L9 450 vs pin 605 is a >=40 HP miss — applyBrochurePin must restamp",
  );

  const pins = resolveFactsCatalogPins({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: {
      engine: "Cummins L9 450HP",
      horsepower: 450,
      torque: "1250",
    },
  });
  assert.match(pins.engine || "", /X15/);
  assert.equal(pins.horsepower, 605);
  assert.equal(pins.torqueLbFt, 1950);

  const dossierData = catalogPinsToLiveDossier({
    year: 2023,
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    pins,
  });
  assert.match(dossierData.engine || "", /X15/);
  assert.equal(dossierData.horsepower, 605);
  assert.equal(dossierData.torqueLbFt, 1950);

  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const live = src("liveDossier.ts");
  const cache = src("verifiedCatalogCache.ts");
  assert.match(dossier, /parsed = applyBrochurePin\(parsed\)/);
  assert.match(dossier, /applyCatalogCandidateTruth/);
  assert.match(dossier, /engine: pin\.engine/);
  assert.match(dossier, /horsepower: pin\.horsepower/);
  assert.match(live, /lockPowertrainFromCatalog !== false/);
  assert.match(cache, /export function applyPowertrainPin/);
  assert.match(live, /return applyPowertrainPin\(/);
});

test("2023 American Dream 45A brochure pin plus complete weights skips hard browse", () => {
  const plan = planFactsDossierResearch({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: {
      gvwrLbs: 54000,
      uvwLbs: 42000,
      lengthFt: `44' 11"`,
      freshWater: "100 gal",
      grayWater: "50 gal",
      blackWater: "50 gal",
      fuelType: "Diesel",
    },
  });
  assert.equal(plan.skipLive, true);
  assert.deepEqual(plan.gaps, []);
  assert.equal(plan.query, null);
});

test("soft query is narrative-only and avoids the 52s report budget", () => {
  const query = factsDossierSoftQuery({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
  });
  assert.match(query, /OVERVIEW/);
  assert.match(query, /ISSUES/);
  assert.match(query, /SENTIMENT/);
  assert.match(query, /MARKET/);
  assert.match(query, /SOURCES/);
  assert.doesNotMatch(query, /full specs report|spec sheet|carfax|coach report/i);
  assert.doesNotMatch(
    query,
    /\b(engine|horsepower|\bhp\b|torque|chassis|transmission|gvwr|uvw|holding tanks|length|powertrain|brochure)\b/i,
  );
});

test("complete pins → no hard browse; soft pass may still run", async () => {
  const hardCalls: ExecuteWebResearchOpts[] = [];
  const softCalls: ExecuteWebResearchOpts[] = [];
  const hard = await researchFactsDossierNotes({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: COMPLETE_CANDIDATE,
    execute: async (opts) => {
      hardCalls.push(opts);
      return {
        ok: true,
        notes: "hard should not run",
        model: "grok-4.7",
        kind: "success",
        durationMs: 12,
      };
    },
  });
  const soft = await researchFactsSoftNotes({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: COMPLETE_CANDIDATE,
    execute: async (opts) => {
      softCalls.push(opts);
      return {
        ok: true,
        notes:
          "OVERVIEW: Flagship diesel pusher bath-and-a-half suite.\nISSUES: Aftertreatment; slide seals.\nSENTIMENT: Owners like the ride.\nMARKET: Used asks stay high.\nSOURCES: IRV2 owner thread.",
        model: "grok-4.7",
        kind: "success",
        durationMs: 8,
      };
    },
  });
  assert.equal(hardCalls.length, 0);
  assert.equal(hard!.skipped, true);
  assert.equal(softCalls.length, 1);
  assert.equal(softCalls[0]!.timeoutMs, FACTS_SOFT_RESEARCH_TIMEOUT_MS);
  assert.equal(softCalls[0]!.maxAttempts, 1);
  assert.equal(softCalls[0]!.researchOrder, undefined);
  assert.match(softCalls[0]!.query, /OVERVIEW/);
  assert.doesNotMatch(softCalls[0]!.query, /full specs report/);
  assert.ok(soft);
  assert.match(soft!.fields.overview || "", /Flagship diesel/);
  assert.ok(soft!.fields.commonIssues.some((i) => /aftertreatment/i.test(i)));
});

test("soft fail leaves hard pins; merge never stomps powertrain", async () => {
  const pins = resolveFactsCatalogPins({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: COMPLETE_CANDIDATE,
  });
  const base = catalogPinsToLiveDossier({
    year: 2023,
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    pins,
  });
  const softMiss = await researchFactsSoftNotes({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: COMPLETE_CANDIDATE,
    execute: async () => ({
      ok: false,
      reason: "aborted due to timeout",
      kind: "timeout",
      durationMs: 14,
    }),
  });
  assert.equal(softMiss, null);
  assert.match(base.engine || "", /X15/);
  assert.equal(base.horsepower, 605);
  assert.equal(base.torqueLbFt, 1950);
  assert.equal(base.overview, null);

  const merged = mergeSoftFieldsIntoDossier(base, {
    overview: "Cummins L9 450 is the only engine.",
    commonIssues: ["DEF heater"],
    ownerSentiment: "Loved.",
    marketNotes: "Asks are firm.",
    sourcesNote: "Forum note",
  });
  assert.match(merged.engine || "", /X15/);
  assert.equal(merged.horsepower, 605);
  assert.equal(merged.torqueLbFt, 1950);
  assert.equal(merged.chassis, pins.chassis);
  assert.equal(merged.gvwrLbs, 54000);
  assert.match(merged.overview || "", /L9 450/);
  assert.deepEqual(merged.commonIssues, ["DEF heater"]);

  const parsed = parseFactsSoftNotes(
    "OVERVIEW: Bath-and-a-half luxury coach.\nISSUES: Slide seals\nSENTIMENT: Strong\nMARKET: Thin sample\nSOURCES: Dealer listing",
  );
  assert.match(parsed.overview || "", /Bath-and-a-half/);
  assert.deepEqual(parsed.commonIssues, ["Slide seals"]);
});

test("DialaBot / Bland / phonebook stay untouched by this Facts path", () => {
  const helper = src("factsDossierResearch.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const live = src("liveDossier.ts");
  for (const text of [helper, dossier, live]) {
    assert.doesNotMatch(text, /dial_phonebook|DialaBot|bland/i);
    assert.doesNotMatch(text, /CHAT_MAY_WRITE_FACTS_CACHE/);
    assert.doesNotMatch(text, /researchOrder\s*:/);
  }
});
