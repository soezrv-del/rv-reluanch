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
import { findPowertrainCorrection } from "./powertrainCorrections.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

test("Facts open always attempts the shared internet research path", () => {
  const helper = src("factsDossierResearch.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const live = src("liveDossier.ts");

  assert.match(helper, /executeWebResearch/);
  assert.match(helper, /skipGate: true/);
  assert.match(helper, /WEB_SEARCH_MODELS/);
  assert.match(dossier, /getResearchProviderOverride/);
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
    /if\s*\(!.*catalog[\s\S]{0,80}fetchLiveDossier/,
    "report open must not skip live research when catalog has a row",
  );

  assert.match(live, /\/api\/rvfax\/dossier/);
  assert.match(live, /researchAccessHeaders/);
  assert.match(live, /lockPowertrainFromCatalog/);
  assert.match(live, /applyPowertrainPin/);
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

  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const live = src("liveDossier.ts");
  assert.match(dossier, /if \(!twoStep\)/);
  assert.match(dossier, /status: 502/);
  assert.match(dossier, /catalog year-band remains on screen/);
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
  assert.ok(
    Math.abs(450 - pin!.horsepower) >= 40,
    "live L9 450 vs pin 605 is a >=40 HP miss — applyBrochurePin must restamp",
  );

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

test("DialaBot / Bland / phonebook stay untouched by this Facts path", () => {
  const helper = src("factsDossierResearch.ts");
  const dossier = src("../../routes/api/rvfax.dossier.ts");
  const live = src("liveDossier.ts");
  for (const text of [helper, dossier, live]) {
    assert.doesNotMatch(text, /dial_phonebook|DialaBot|bland/i);
    assert.doesNotMatch(text, /CHAT_MAY_WRITE_FACTS_CACHE/);
  }
});
