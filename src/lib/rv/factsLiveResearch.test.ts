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
  shouldServeFactsDossierCache,
  shouldStoreFactsDossierCache,
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
  const gapPlan = src("factsDossierGapPlan.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const live = src("liveDossier.ts");

  assert.match(helper, /executeWebResearch/);
  assert.match(helper, /skipGate: true/);
  assert.match(helper, /WEB_SEARCH_MODELS/);
  assert.match(helper, /FACTS_GAP_RESEARCH_TIMEOUT_MS = 90_000/);
  assert.match(helper, /FACTS_SOFT_RESEARCH_TIMEOUT_MS = 20_000/);
  assert.match(helper, /planFactsDossierResearch/);
  assert.match(helper, /from "\.\/factsDossierGapPlan\.ts"/);
  assert.match(helper, /researchProvider: "xai"/);
  assert.match(helper, /researchFactsSoftNotes/);
  assert.match(helper, /mergeSoftFieldsIntoDossier/);
  assert.match(gapPlan, /candidate\?\.freshWaterGal/);
  assert.match(gapPlan, /candidate\?\.grayWaterGal/);
  assert.match(gapPlan, /candidate\?\.blackWaterGal/);
  assert.match(gapPlan, /candidate\?\.overallLength/);
  assert.match(gapPlan, /planFactsDossierResearch/);
  assert.doesNotMatch(gapPlan, /executeWebResearch/);
  assert.doesNotMatch(helper, /researchOrder\s*:/);
  assert.doesNotMatch(helper, /Give me the full specs report/);
  assert.doesNotMatch(helper, /SPEC_REPORT_RESEARCH_TIMEOUT_MS/);
  assert.doesNotMatch(
    helper,
    /coachKnowledge|loadCoachKnowledge|planCoachKnowledgeWrite/,
  );

  assert.match(dossier, /researchFactsDossierNotes/);
  assert.match(dossier, /parseFactsSoftNotes/);
  assert.match(dossier, /if \(plan\.skipLive\)/);
  assert.match(dossier, /mergeSoftFieldsIntoDossier/);
  assert.doesNotMatch(dossier, /researchFactsSoftNotes/);
  assert.doesNotMatch(dossier, /Promise\.all\(\[/);
  assert.match(dossier, /denyUnlessWhitelisted/);
  assert.match(dossier, /web-research-then-extract/);
  assert.match(dossier, /catalog-pins/);
  assert.match(dossier, /grok-4\.7/);
  assert.match(dossier, /research\.skipped/);
  assert.match(dossier, /skipLive: twoStep\.skipLive/);
  assert.match(dossier, /gaps: twoStep\.gaps/);
  assert.match(dossier, /shouldServeFactsDossierCache\(cachedPlan\)/);
  assert.match(dossier, /shouldStoreFactsDossierCache/);
  assert.match(dossier, /v28-gap-cache-bypass/);
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
  assert.match(detail, /planFactsDossierResearch/);
  assert.match(detail, /factsDetailSearchingFields/);
  assert.match(detail, /facts-gap-spinner/);
  assert.doesNotMatch(
    detail,
    /if\s*\(!.*catalog[\s\S]{0,80}fetchLiveDossier/,
    "report open still POSTs; server decides whether to browse",
  );

  assert.match(live, /\/api\/rvfax\/dossier/);
  assert.match(live, /LIVE_DOSSIER_TIMEOUT_MS = 180_000/);
  assert.match(live, /researchAccessHeaders/);
  assert.match(live, /lockPowertrainFromCatalog/);
  assert.match(live, /applyPowertrainPin/);
});

test("gap query is a full coach report and still names only the empty field", () => {
  const query = factsDossierResearchQuery({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    gaps: ["torque"],
  });
  assert.match(query, /torque/i);
  assert.match(query, /2023 American Coach American Dream 45A/);
  assert.match(query, /coach report/i);
  assert.match(query, /Overview/i);
  assert.doesNotMatch(query, /Give me the full specs report/);
  // Facts passes FACTS_GAP_RESEARCH_TIMEOUT_MS explicitly — never
  // researchTimeoutMs("chat", query), which is the 52s SPEC_REPORT path.
  assert.equal(SPEC_REPORT_RESEARCH_TIMEOUT_MS, 52_000);
  assert.equal(FACTS_GAP_RESEARCH_TIMEOUT_MS, 90_000);
  assert.equal(FACTS_SOFT_RESEARCH_TIMEOUT_MS, 20_000);
  assert.ok(FACTS_SOFT_RESEARCH_TIMEOUT_MS < FACTS_GAP_RESEARCH_TIMEOUT_MS);
  assert.ok(FACTS_GAP_RESEARCH_TIMEOUT_MS < 180_000);
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
  assert.equal(calls.length, 1);
  assert.match(calls[0]!.query, /dry weight/i);
  assert.ok(notes);
  assert.equal(notes!.skipped, false);
  assert.deepEqual(notes!.gaps, ["uvw"]);
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
  assert.deepEqual(plan.gaps, ["torque", "uvw"]);
  assert.equal(plan.skipLive, false);
  assert.match(plan.query || "", /torque/i);
  assert.match(plan.query || "", /coach report/i);
  assert.doesNotMatch(plan.query || "", /Give me the full specs report/);

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
  assert.equal(calls[0]!.researchProvider, "xai");
  assert.match(calls[0]!.query, /coach report/i);
  assert.ok(notes);
  assert.equal(notes!.skipped, false);
  assert.deepEqual(notes!.gaps, ["torque", "uvw"]);
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

test("catalogCandidate *Gal tank keys + complete pins skip hard browse", async () => {
  const candidate: FactsCatalogCandidate = {
    engine: "Acme SuperDuty 380HP",
    horsepower: 380,
    torque: "860 lb-ft",
    chassis: "Freightliner M2",
    transmission: "Allison 2500",
    fuelType: "Diesel",
    lengthFt: "36 ft",
    gvwrLbs: 26000,
    uvwLbs: 21000,
    uvwEstimated: false,
    freshWaterGal: 80,
    grayWaterGal: 40,
    blackWaterGal: 40,
  };
  const pins = resolveFactsCatalogPins({
    year: "2018",
    make: "Unknown Coachworks",
    model: "Phantom",
    floorplan: "32X",
    candidate,
  });
  assert.equal(pins.freshWaterGal, 80);
  assert.equal(pins.grayWaterGal, 40);
  assert.equal(pins.blackWaterGal, 40);
  const plan = planFactsDossierResearch({
    year: "2018",
    make: "Unknown Coachworks",
    model: "Phantom",
    floorplan: "32X",
    candidate,
  });
  assert.equal(plan.skipLive, false);
  assert.deepEqual(plan.gaps, ["uvw"]);
  assert.match(plan.query || "", /dry weight/i);

  const calls: ExecuteWebResearchOpts[] = [];
  const notes = await researchFactsDossierNotes({
    year: "2018",
    make: "Unknown Coachworks",
    model: "Phantom",
    floorplan: "32X",
    candidate,
    execute: async (opts) => {
      calls.push(opts);
      return {
        ok: true,
        notes: "hard should not run",
        model: "grok-4.7",
        kind: "success",
        durationMs: 12,
      };
    },
  });
  assert.equal(calls.length, 1);
  assert.match(calls[0]!.query, /dry weight/i);
  assert.ok(notes);
  assert.equal(notes!.skipped, false);
  assert.deepEqual(notes!.gaps, ["uvw"]);
});

test("Dream probe without Gal/length aliases still gaps tanks + length", () => {
  const plan = planFactsDossierResearch({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: {
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Spartan K3",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      gvwrLbs: 54000,
      uvwLbs: 42000,
      uvwEstimated: false,
    },
  });
  assert.deepEqual(plan.gaps, ["uvw", "tanks", "length"]);
  assert.equal(plan.skipLive, false);
});

test("Dream probe LiveDossier aliases (Gal + overallLength + torqueLbFt) skip hard browse", () => {
  const before = planFactsDossierResearch({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: {
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torqueLbFt: 1950,
      chassis: "Spartan K3",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      overallLength: `44' 11"`,
      gvwrLbs: 54000,
      uvwLbs: 42000,
      uvwEstimated: false,
      freshWaterGal: 100,
      grayWaterGal: 50,
      blackWaterGal: 50,
    },
  });
  assert.equal(before.skipLive, false);
  assert.deepEqual(before.gaps, ["uvw"]);

  const pins = resolveFactsCatalogPins({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: {
      overallLength: `44' 11"`,
      gvwrLbs: 54000,
      uvwLbs: 42000,
      uvwEstimated: false,
      freshWaterGal: 100,
      grayWaterGal: 50,
      blackWaterGal: 50,
    },
  });
  assert.equal(pins.lengthFt, `44' 11"`);
  assert.equal(pins.freshWaterGal, 100);
  assert.equal(pins.grayWaterGal, 50);
  assert.equal(pins.blackWaterGal, 50);
  assert.equal(pins.gvwrLbs, 54000);
  assert.equal(pins.uvwLbs, 42000);
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
  assert.equal(plan.skipLive, false);
  assert.deepEqual(plan.gaps, ["uvw"]);
  assert.match(plan.query || "", /dry weight/i);
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

test("complete pins → no hard browse; a separate soft search is not required", async () => {
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
  assert.equal(hardCalls.length, 1);
  assert.match(hardCalls[0]!.query, /dry weight/i);
  assert.equal(hard!.skipped, false);
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

test("cache hit with complete pins still serves cache / skipLive true", async () => {
  const plan = planFactsDossierResearch({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: COMPLETE_CANDIDATE,
  });
  assert.equal(plan.skipLive, false);
  assert.deepEqual(plan.gaps, ["uvw"]);
  assert.equal(shouldServeFactsDossierCache(plan), false);
  assert.equal(shouldStoreFactsDossierCache({ skipLive: true }), true);

  const calls: ExecuteWebResearchOpts[] = [];
  const notes = await researchFactsDossierNotes({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: COMPLETE_CANDIDATE,
    execute: async (opts) => {
      calls.push(opts);
      return {
        ok: true,
        notes: "complete pins must not browse",
        model: "grok-4.7",
        kind: "success",
        durationMs: 4,
      };
    },
  });
  assert.equal(shouldServeFactsDossierCache(plan), false);
  assert.equal(calls.length, 1);
  assert.match(calls[0]!.query, /dry weight/i);
  assert.equal(notes!.skipped, false);
});

test("cache hit with hard gaps must browse — not return stale cache as final", async () => {
  const incomplete: FactsCatalogCandidate = {
    engine: "Cummins X15 605HP",
    horsepower: 605,
    torque: "1950 lb-ft",
    chassis: "Spartan K3",
    transmission: "Allison 4000 MH",
    fuelType: "Diesel",
    type: "Class A Diesel",
  };
  const plan = planFactsDossierResearch({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: incomplete,
  });
  assert.ok(plan.gaps.includes("gvwr"));
  assert.ok(plan.gaps.includes("uvw"));
  assert.ok(plan.gaps.includes("tanks"));
  assert.ok(plan.gaps.includes("length"));
  assert.equal(plan.skipLive, false);
  assert.equal(
    shouldServeFactsDossierCache(plan),
    false,
    "stale cache must not be the final answer when hard gaps remain",
  );
  assert.equal(
    shouldStoreFactsDossierCache({
      skipLive: false,
      remainingHardGaps: plan.gaps,
    }),
    false,
  );
  assert.equal(
    shouldStoreFactsDossierCache({
      skipLive: false,
      remainingHardGaps: [],
    }),
    true,
    "store after browse fills the last hard gaps",
  );

  const calls: ExecuteWebResearchOpts[] = [];
  const notes = await researchFactsDossierNotes({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: incomplete,
    execute: async (opts) => {
      calls.push(opts);
      return {
        ok: true,
        notes: "CONFIRMED: OEM GVWR 54000 UVW 42000 length 44'11 tanks 100/50/50.",
        model: "grok-4.7",
        kind: "success",
        durationMs: 18,
      };
    },
  });
  assert.equal(calls.length, 1, "gap browse must run executeWebResearch");
  assert.equal(calls[0]!.skipGate, true);
  assert.match(calls[0]!.query, /GVWR|UVW|holding tanks|length/);
  assert.ok(notes);
  assert.equal(notes!.skipped, false);
  assert.ok(notes!.gaps.includes("gvwr"));

  const dossier = src("../../routes/api/rvfax.dossier.ts");
  assert.match(
    dossier,
    /shouldServeFactsDossierCache\(cachedPlan\)/,
    "route must gate cache return on skipLive, not hit alone",
  );
  assert.doesNotMatch(
    dossier,
    /if \(hit && Date\.now\(\) - hit\.at < TTL_MS\) \{\s*let data/,
    "unconditional cache return is the production bug",
  );
});

test("DialaBot / Bland / phonebook stay untouched by this Facts path", () => {
  const helper = src("factsDossierResearch.ts");
  const gapPlan = src("factsDossierGapPlan.ts");
  const spinners = src("factsDetailGapSpinners.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const live = src("liveDossier.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  for (const text of [helper, gapPlan, spinners, dossier, live]) {
    assert.doesNotMatch(text, /dial_phonebook|DialaBot|bland/i);
    assert.doesNotMatch(text, /CHAT_MAY_WRITE_FACTS_CACHE/);
    assert.doesNotMatch(text, /researchOrder\s*:/);
  }
  assert.doesNotMatch(detail, /dial_phonebook|DialaBot|bland/i);
});
