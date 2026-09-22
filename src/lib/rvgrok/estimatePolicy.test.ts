import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATALOG_MISS_MUST_SEARCH,
  CATALOG_PIN_WINS_SEARCH_MISS,
  DESK_STAYS_FACTS,
  ESTIMATE_STANDING_POLICY,
  extractVerifiedPinsFromText,
  formatCatalogPinWinsSearchMiss,
  formatLabeledEstimate,
  isLabeledEstimateAnswer,
  LABELED_ESTIMATE_RULE,
  LOW_CONFIDENCE_EST_RULE,
  mayEmitLabeledEstimate,
  presentsEstimateAsOemPin,
  SPEC_ASK_MUST_SEARCH,
} from "./estimatePolicy.ts";
import { ANSWER_NOW_POLICY, HONESTY_STANDING_POLICY } from "./speechPolicy.ts";
import {
  catalogGapNeedsWeb,
  looksLikeCoachFactAsk,
  needsWebFallback,
} from "./webIntent.ts";
import { decideVoiceWebResearch } from "./voiceWeb.ts";
import {
  formatLockedWeightLine,
  formatLockedWeightsBlock,
} from "./lockedWeights.ts";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import { resolveDeskSheet } from "./deskSheet.ts";
import { formatWebSearchInjection } from "./webSearch.ts";
import { buildBrochureSpecs } from "../rv/brochureSpecs.ts";
import { installCatalog, peekCatalog } from "../rv/catalogLoad.ts";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

test("catalog miss triggers web-research path (chat + live voice)", () => {
  const miss = "What's the hitch rating on a 2019 XYZ Phantom?";
  assert.equal(catalogGapNeedsWeb(null, miss), true);
  assert.equal(needsWebFallback(null, miss), true);
  assert.equal(
    decideVoiceWebResearch({ transcript: miss, specs: null }).action,
    "research",
  );

  const weightGap = "What's the UVW on a 2025 Entegra Coach Aspire 44R?";
  assert.equal(
    catalogGapNeedsWeb(
      { missingHard: false, missingOemWeightPin: true },
      weightGap,
    ),
    true,
    "missing OEM weight pin on a weight ask must browse",
  );
  assert.equal(
    needsWebFallback(
      { missingHard: false, missingOemWeightPin: true },
      weightGap,
    ),
    true,
  );
  assert.equal(
    needsWebFallback(
      { missingHard: false, missingOemWeightPin: true },
      "What engine and HP does a 2023 Entegra Vision have?",
    ),
    true,
    "engine / HP spec ask must browse even when the catalog is locked",
  );
  assert.equal(
    looksLikeCoachFactAsk("What engine and HP does a 2023 Entegra Vision have?"),
    true,
  );

  const api = src(join("..", "..", "routes", "api", "rvgrok.ts"));
  assert.match(src("grounding.ts"), /needsWebFallback\(specs/);
  assert.match(api, /serverGrounded\.needsWeb/);
  assert.match(api, /executeWebResearch/);
  assert.match(api, /MUST browse this turn/);
  const voiceApi = src(join("..", "..", "routes", "api", "rvgrok.web-research.ts"));
  assert.match(voiceApi, /skipGate: true/);
  const voiceWeb = src("voiceWeb.ts");
  assert.match(voiceWeb, /always run the sidecar/);
  assert.doesNotMatch(
    voiceWeb,
    /if \(!speakHold && !inventory\)/,
    "voice must not skip research when the hold is off",
  );
});

test("estimate answers are labeled, not presented as OEM pin", () => {
  const labeled = formatLabeledEstimate("32,000 lb UVW");
  assert.match(labeled, /EST/);
  assert.match(labeled, /typical class range/);
  assert.match(labeled, /low confidence/);
  assert.equal(isLabeledEstimateAnswer(labeled), true);
  assert.equal(presentsEstimateAsOemPin(labeled), false);
  assert.equal(mayEmitLabeledEstimate({ confirmed: true, exhausted: false }), false);
  assert.equal(mayEmitLabeledEstimate({ confirmed: false, exhausted: false }), false);
  assert.equal(mayEmitLabeledEstimate({ confirmed: false, exhausted: true }), true);
  assert.match(LOW_CONFIDENCE_EST_RULE, /low confidence/);
  assert.match(LABELED_ESTIMATE_RULE, /Never EST after a single miss/);
  assert.equal(
    presentsEstimateAsOemPin("UVW 32000 from OEM pin"),
    true,
    "bare OEM-pin framing without EST is the silent-invent path",
  );

  const gapLine = formatLockedWeightLine("UVW", null);
  assert.match(gapLine, /GAP — no OEM pin/);
  assert.match(gapLine, /labeled EST \/ typical class range/);
  assert.match(gapLine, /never as an OEM pin/);
  assert.doesNotMatch(gapLine, /from OEM pin/);

  assert.match(HONESTY_STANDING_POLICY, /labeled estimate|EST \/ estimate/);
  assert.match(ANSWER_NOW_POLICY, /MUST run WEB RESEARCH|MUST run live WEB RESEARCH/);
  assert.doesNotMatch(HONESTY_STANDING_POLICY, /GAP over invent/);
  assert.doesNotMatch(ANSWER_NOW_POLICY, /Web search is last resort/);
  assert.match(ESTIMATE_STANDING_POLICY, /EST \/ estimate \/ typical class range/);
  assert.match(LABELED_ESTIMATE_RULE, /Never present an estimate as an OEM pin/);
  assert.match(CATALOG_MISS_MUST_SEARCH, /not last resort/);
  assert.match(SPEC_ASK_MUST_SEARCH, /BEFORE answering/);
  assert.match(SPEC_ASK_MUST_SEARCH, /Never answer from training data alone/);
  assert.match(LOW_CONFIDENCE_EST_RULE, /low confidence/);
  assert.match(LOW_CONFIDENCE_EST_RULE, /do not invent brochure numbers from training/i);
  assert.match(CATALOG_PIN_WINS_SEARCH_MISS, /SEARCH MISS DOES NOT OVERRIDE A CATALOG PIN/);
  assert.match(HONESTY_STANDING_POLICY, /SEARCH MISS DOES NOT OVERRIDE A CATALOG PIN/);

  assert.match(src("speechPolicy.ts"), /ESTIMATE_STANDING_POLICY/);
  assert.match(src("speechPolicy.ts"), /LABELED_ESTIMATE_RULE/);
  for (const [label, text] of [
    ["prompts.ts", src("prompts.ts")],
    ["voice.ts", src("voice.ts")],
    ["liveVoice.ts", src("liveVoice.ts")],
    ["webSearch.ts", src("webSearch.ts")],
  ] as const) {
    assert.match(
      text,
      /labeled EST \/ typical class range/,
      `${label} teaches labeled estimates`,
    );
    assert.doesNotMatch(
      text,
      /GAP over invent for specs/,
      `${label} no longer blocks estimates with GAP-only`,
    );
  }
});

test("desk still matches Facts for 2022 Tiffin Phaeton 40IH weights", async () => {
  const live = await loadLiveCatalog();
  installCatalog({ RV_DATA: live.RV_DATA, MAKES: live.MAKES });
  const spec = peekCatalog()?.RV_DATA?.Tiffin?.Phaeton;
  assert.ok(spec, "expected Tiffin Phaeton in the live catalog");
  const brochure = buildBrochureSpecs(spec, "2022", "Tiffin", "Phaeton", "40IH");
  assert.equal(brochure.gvwrLbs, 39_600);
  assert.equal(brochure.uvwLbs, 33_500);

  const q = "2022 Tiffin Phaeton 40IH";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  const sheet = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(sheet);
  const val = (label: string) =>
    sheet!.rows.find((r) => r.label === label)?.value;
  assert.equal(val("GVWR"), brochure.gvwr);
  assert.equal(val("UVW"), brochure.uvw);
  assert.match(val("GVWR") || "", /39,?600/);
  assert.match(val("UVW") || "", /33,?500/);
  assert.doesNotMatch(val("GVWR") || "", /\bEST\b/);
  assert.doesNotMatch(val("UVW") || "", /\bEST\b/);
  assert.match(DESK_STAYS_FACTS, /Facts brochure snapshot/);
  assert.doesNotMatch(src("deskSheet.ts"), /[Dd]ialaBot/);
  assert.doesNotMatch(src("estimatePolicy.ts"), /[Dd]ialaBot/);
});

test("search timeout + verified pin speaks the pin — no factory-GVWR refuse", async () => {
  const live = await loadLiveCatalog();
  installCatalog({ RV_DATA: live.RV_DATA, MAKES: live.MAKES });

  const q = "What's the gvwr of a 2020 pheaton 40ih";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(identity!.year, "2020");
  assert.equal(identity!.make, "Tiffin");
  assert.equal(identity!.model, "Phaeton");
  assert.match(identity!.floorplan, /40ih/i);

  const locked = formatLockedWeightsBlock(identity!);
  assert.match(locked, /VERIFIED GVWR 39600/);
  assert.match(locked, /VERIFIED UVW 33500/);
  assert.deepEqual(extractVerifiedPinsFromText(locked), [
    "GVWR 39600",
    "UVW 33500",
  ]);

  const miss = formatCatalogPinWinsSearchMiss(locked);
  assert.match(miss, /SEARCH MISS DOES NOT OVERRIDE A CATALOG PIN/);
  assert.match(miss, /GVWR 39600/);
  assert.match(miss, /never emit/i);
  assert.match(CATALOG_PIN_WINS_SEARCH_MISS, /won't invent that number/);

  const injection = formatWebSearchInjection(
    {
      ok: false,
      reason: "The operation was aborted due to timeout",
      confirmed: false,
      attempts: 2,
      exhausted: true,
      query: q,
    },
    { query: q, catalogBlock: locked },
  );
  assert.match(injection, /WEB SEARCH NOT AVAILABLE/);
  assert.match(injection, /Search returned nothing after a retry/);
  assert.match(injection, /VERIFIED pins still in context: GVWR 39600/);
  assert.match(injection, /Speak those OEM numbers now/);
  assert.doesNotMatch(injection, /You MAY give a labeled EST/);
  assert.match(LOW_CONFIDENCE_EST_RULE, /don't have a factory GVWR/);

  const sheet = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(sheet);
  assert.match(sheet!.rows.find((r) => r.label === "GVWR")?.value || "", /39,?600/);
  assert.doesNotMatch(sheet!.rows.find((r) => r.label === "GVWR")?.value || "", /\bEST\b/);
});
