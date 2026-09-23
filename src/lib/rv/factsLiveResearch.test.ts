import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { looksLikeCoachReportAsk } from "../rvgrok/coachReport.ts";
import {
  researchTimeoutMs,
  SPEC_REPORT_RESEARCH_TIMEOUT_MS,
  WEB_SEARCH_MODELS,
} from "../rvgrok/webSearch.ts";
import type { ExecuteWebResearchOpts } from "../rvgrok/webResearchTelemetry.ts";
import {
  factsDossierResearchQuery,
  researchFactsDossierNotes,
} from "./factsDossierResearch.ts";
import { applyPowertrainPin } from "./verifiedCatalogCache.ts";
import {
  fetchLiveDossier,
  mergeLiveIntoDisplay,
  type LiveDossier,
  type SpecDisplay,
} from "./liveDossier.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function stubDossier(over: Partial<LiveDossier> = {}): LiveDossier {
  return {
    year: 2023,
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    rvType: "Class A Diesel",
    engine: "Cummins L9 450HP",
    horsepower: 450,
    torqueLbFt: 1250,
    transmission: "Allison 3000",
    chassis: "Freightliner",
    fuelType: "Diesel",
    towingCapacityLbs: null,
    fuelCapacityGal: null,
    overallLength: "45 ft",
    exteriorWidth: null,
    exteriorHeight: null,
    interiorHeight: null,
    gvwrLbs: null,
    uvwLbs: null,
    cccLbs: null,
    slideouts: null,
    sleeps: null,
    freshWaterGal: null,
    grayWaterGal: null,
    blackWaterGal: null,
    generator: null,
    mpgHighwayEst: null,
    warranty: null,
    floorplansThisYear: [],
    overview: "Live invented an L9 on 45A.",
    keyFeatures: [],
    reliabilitySummary: null,
    commonIssues: [],
    servicePriorities: [],
    ownerSentiment: null,
    ratingEstimate: null,
    marketNotes: null,
    tradeInUsd: null,
    retailLowUsd: null,
    retailHighUsd: null,
    msrpLowUsd: null,
    msrpHighUsd: null,
    confidence: "medium",
    sourcesNote: "forum guess",
    fetchedAt: new Date().toISOString(),
    live: true,
    ...over,
  };
}

test("Facts open always attempts the shared internet research path", () => {
  const helper = src("factsDossierResearch.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const live = src("liveDossier.ts");

  assert.match(helper, /executeWebResearch/);
  assert.match(helper, /skipGate: true/);
  assert.match(helper, /getResearchProviderOverride/);
  assert.match(helper, /WEB_SEARCH_MODELS/);
  assert.match(helper, /researchTimeoutMs\("chat"/);
  assert.doesNotMatch(
    helper,
    /if\s*\(.*catalog.*\)\s*return/,
    "catalog having a row must not skip browse",
  );

  assert.match(dossier, /researchFactsDossierNotes/);
  assert.match(dossier, /denyUnlessWhitelisted/);
  assert.match(dossier, /web-research-then-extract/);
  assert.match(dossier, /grok-4\.7/);
  assert.doesNotMatch(dossier, /grok-3|grok-2-1212/);
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
  assert.doesNotMatch(
    detail,
    /if\s*\(.*catalog.*\)\s*return[\s\S]{0,80}fetchLiveDossier/,
    "report open must not skip live research when catalog has a row",
  );

  assert.match(live, /\/api\/rvfax\/dossier/);
  assert.match(live, /researchAccessHeaders/);
  assert.match(live, /saveVerifiedDossier/);
});

test("research query is a coach-report ask so the spec budget applies", () => {
  const query = factsDossierResearchQuery({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
  });
  assert.match(query, /full specs report/);
  assert.match(query, /2023 American Coach American Dream 45A/);
  assert.equal(looksLikeCoachReportAsk(query), true);
  assert.equal(researchTimeoutMs("chat", query), SPEC_REPORT_RESEARCH_TIMEOUT_MS);
  assert.deepEqual([...WEB_SEARCH_MODELS], ["grok-4.7"]);
});

test("Facts research always calls executeWebResearch even when catalog pins exist", async () => {
  const calls: ExecuteWebResearchOpts[] = [];
  const notes = await researchFactsDossierNotes({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    catalogBlock:
      "CATALOG CANDIDATE TRUTH\n- engine: Cummins X15 605HP\n- horsepower: 605",
    researchProvider: "xai",
    execute: async (opts) => {
      calls.push(opts);
      return {
        ok: true,
        notes: "CONFIRMED: yes. OEM brochure X15 605. SOURCES: American Coach PDF.",
        model: "grok-4.7",
        kind: "success",
        durationMs: 12,
      };
    },
  });
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.skipGate, true);
  assert.match(calls[0]!.query, /full specs report/);
  assert.match(calls[0]!.catalogBlock || "", /Cummins X15/);
  assert.equal(calls[0]!.researchProvider, "xai");
  assert.ok(notes);
  assert.match(notes!.text, /X15 605/);
  assert.equal(notes!.model, "grok-4.7");
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

  const prior = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        error: "Live dossier unavailable — catalog year-band remains on screen.",
        meta: { pipeline: "web-research-then-extract", model: null },
      }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;
  try {
    const res = await fetchLiveDossier("1998", "Unknown Coachworks", "Phantom");
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.match(res.error, /catalog year-band remains/);
      assert.equal(res.status, 502);
    }
  } finally {
    globalThis.fetch = prior;
  }
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

  const live = stubDossier();
  const pinned = applyPowertrainPin(
    "2023",
    "American Coach",
    "American Dream",
    "45A",
    live,
  );
  assert.match(pinned.engine || "", /X15/);
  assert.equal(pinned.horsepower, 605);
  assert.notEqual(pinned.engine, live.engine);

  const catalog: SpecDisplay = {
    engine: pin!.engine,
    horsepower: `${pin!.horsepower} HP`,
    torque: "1,950 lb-ft",
    transmission: pin!.transmission || "Allison 4000 MH",
    chassis: pin!.chassis || "Spartan K3",
    hitchOrPin: "—",
    fuelCapacity: "—",
    lengthFt: "45 ft",
    exteriorWidth: "—",
    exteriorHeight: "—",
    interiorHeight: "—",
    gvwr: "—",
    uvw: "—",
    ccc: "—",
    slideouts: "—",
    sleeps: "—",
    freshWater: "—",
    grayWater: "—",
    blackWater: "—",
    generator: "—",
    mpgHighway: "—",
    warranty: "—",
  };
  const merged = mergeLiveIntoDisplay(catalog, live, {
    lockPowertrainFromCatalog: true,
  });
  assert.equal(merged.engine, catalog.engine);
  assert.equal(merged.horsepower, catalog.horsepower);
  assert.equal(merged.chassis, catalog.chassis);
  assert.equal(merged.lengthFt, "45 ft");
});

test("DialaBot / Bland / phonebook stay untouched by this Facts path", () => {
  const helper = src("factsDossierResearch.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const live = src("liveDossier.ts");
  for (const text of [helper, dossier, live]) {
    assert.doesNotMatch(text, /dial_phonebook|DialaBot|bland/i);
    assert.doesNotMatch(text, /CHAT_MAY_WRITE_FACTS_CACHE/);
  }
});
