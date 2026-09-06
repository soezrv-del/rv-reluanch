import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  honestHorsepowerLabel,
  isAmbiguousCatalogValue,
} from "../rv/catalogHonesty.ts";
import { findPowertrainCorrection } from "../rv/powertrainCorrections.ts";
import {
  catalogYearIsListed,
  matchCatalogModelName,
  parseCoachFromText,
} from "./parseCoach.ts";
import {
  looksLikeCasualNonResearch,
  looksLikeImageOnlyAsk,
  looksLikeLiveResearchQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeOffCatalogQuestion,
  needsWebFallback,
} from "./webIntent.ts";
import { CATALOG_INDEX } from "../rv/rvCatalogIndex.ts";
import {
  WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
  CHAT_WEB_SEARCH_TIMEOUT_MS,
  buildWebSearchRequest,
  extractResponsesText,
  formatWebSearchHttpFailure,
  formatWebSearchInjection,
  truncateApiErrorBody,
} from "./webSearch.ts";

const root = dirname(fileURLToPath(import.meta.url));
const rvRoot = join(root, "../rv");

function src(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8");
}

test("parses Lineage M series letters and last-make self-corrections", () => {
  const about = parseCoachFromText(
    "I'd like to know about the 2027 Grand Design Lineage M series.",
  );
  assert.equal(about.year, "2027");
  assert.equal(about.make, "Grand Design");
  assert.match(about.model, /lineage/i);
  assert.match(about.model, /\bM\b/i);
  assert.doesNotMatch(about.model, /^Lineage series$/i);

  const stutter = parseCoachFromText(
    "I'm afraid to ask this, but what about the 2026 Grand Design Limin, uh, Grand Design Lineage M series?",
  );
  assert.equal(stutter.year, "2026");
  assert.equal(stutter.make, "Grand Design");
  assert.match(stutter.model, /lineage/i);
  assert.match(stutter.model, /\bM\b/i);
  assert.doesNotMatch(stutter.model, /limin/i);
});

test("parses David’s test coach from a spec question", () => {
  const p = parseCoachFromText(
    "What engine and HP does a 2023 American Coach American Dream 45A have?",
  );
  assert.equal(p.year, "2023");
  assert.equal(p.make, "American Coach");
  assert.match(p.model, /american dream/i);
  assert.equal(p.floorplan, "45A");
});

test("2023 American Dream pin is an option band — not a single invented HP", () => {
  const pin = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "45A",
  );
  assert.ok(pin, "expected a brochure pin for American Dream");
  assert.equal(pin!.fuelType, "Diesel");
  assert.match(pin!.engine, /L9/);
  assert.match(pin!.engine, /X15|605|opt/i);
  assert.match(pin!.chassis || "", /Spartan/i);
  assert.doesNotMatch(pin!.engine, /Liberty Bridge|F-?53|Godzilla/i);
  assert.equal(isAmbiguousCatalogValue(pin!.engine), true);
  assert.ok(
    pin!.horsepower <= 0,
    "Dream pin must not lock horsepower at 450",
  );
  assert.equal(
    pin!.torqueLbFt == null || pin!.torqueLbFt <= 0,
    true,
    "Dream pin must not lock L9-only torque",
  );

  const hp = honestHorsepowerLabel({
    engine: pin!.engine,
    horsepower: 450,
  });
  assert.match(hp || "", /450/);
  assert.match(hp || "", /605|opt/i);
  assert.doesNotMatch(hp || "", /^450 HP$/);
});

test("sibling American Tradition pin is not applied to a Dream", () => {
  const dream = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "45B",
  );
  assert.doesNotMatch(dream?.chassis || "", /Liberty Bridge/i);
});

test("Entegra Vision pin stays gas F-53 Godzilla", () => {
  const pin = findPowertrainCorrection("2023", "Entegra Coach", "Vision", "");
  assert.ok(pin);
  assert.equal(pin!.fuelType, "Gas");
  assert.match(pin!.engine, /Godzilla|7\.3/i);
  assert.doesNotMatch(pin!.engine, /Cummins|L9/i);
});

test("chat must not write Facts cache; Live must not fill hard fields", () => {
  const grounding = src(root, "grounding.ts");
  const guard = src(rvRoot, "livePowertrainGuard.ts");
  const cache = src(rvRoot, "verifiedCatalogCache.ts");
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(grounding, /CHAT_MAY_WRITE_FACTS_CACHE = false/);
  assert.match(grounding, /needsWebFallback/);
  assert.match(src(root, "webIntent.ts"), /looksLikeLiveResearchQuestion/);
  assert.match(guard, /Live Grok never writes engine/);
  assert.match(cache, /Chat answers must never call saveVerifiedDossier/);
  assert.match(api, /catalogContext/);
  assert.match(api, /executeWebResearch/);
  assert.doesNotMatch(api, /search_parameters/);
});

test("Live Voice instructions are accuracy-first; gesture order untouched", () => {
  const voice = src(root, "voice.ts");
  const live = src(root, "liveVoice.ts");
  assert.match(voice, /ACCURACY FIRST/);
  assert.match(voice, /never invent/i);
  assert.match(voice, /American Dream ≠ Tradition/);
  assert.match(voice, /Comfort Drive/);
  assert.doesNotMatch(voice, /You do not have a separate research step/);
  assert.match(live, /liveVoiceStartOrder/);
  assert.match(live, /gesture-capture/);
  assert.match(live, /catalogContext/);
});

test("web search sidecar uses Responses web_search tool", () => {
  const body = buildWebSearchRequest({
    model: "grok-4.6",
    query: "2023 American Coach American Dream engine HP chassis",
    catalogBlock: "engine: Cummins L9 450 std / X15 605 opt",
  });
  assert.equal(body.model, "grok-4.6");
  assert.deepEqual(body.tools, [{ type: "web_search" }]);
  assert.equal("search_parameters" in body, false);
  assert.equal("temperature" in body, false);
  assert.equal("max_output_tokens" in body, false);
  assert.equal(body.max_tool_calls, 1);
  assert.equal(body.tool_choice, "required");
  assert.deepEqual(body.reasoning, { effort: "low" });
  assert.ok(!("role" in (body as { role?: string })));
  const input = body.input as Array<{ role: string; content: string }>;
  assert.equal(input.length, 1);
  assert.equal(input[0].role, "user");
  assert.match(input[0].content, /Catalog lock/);
  assert.match(input[0].content, /American Dream engine HP/);
  assert.doesNotMatch(JSON.stringify(body), /"role":"system"/);
  const notes = extractResponsesText({
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: "UNKNOWN — confirm brochure" }],
      },
    ],
  });
  assert.match(notes, /UNKNOWN/);
});

test("web search model fallbacks are current Responses + web_search ids", () => {
  assert.deepEqual([...WEB_SEARCH_MODELS], [
    "grok-4-1-fast-reasoning",
    "grok-4-1-fast-non-reasoning",
  ]);
  assert.equal((WEB_SEARCH_MODELS as readonly string[]).includes("grok-4.6"), false);
  assert.deepEqual([...VOICE_WEB_SEARCH_MODELS], ["grok-4-1-fast-reasoning"]);
  assert.equal(VOICE_WEB_SEARCH_TIMEOUT_MS, 10_000);
  assert.equal(CHAT_WEB_SEARCH_TIMEOUT_MS, 12_000);
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(api, /executeWebResearch/);
  assert.match(api, /CHAT_WEB_SEARCH_TIMEOUT_MS/);
  assert.doesNotMatch(api, /VOICE_WEB_SEARCH/);
});

test("web search HTTP failure includes a truncated API body", () => {
  const long = `{"error":{"message":"${"x".repeat(300)}","type":"invalid_request_error"}}`;
  const reason = formatWebSearchHttpFailure(400, long);
  assert.match(reason, /^web search HTTP 400: /);
  assert.ok(reason.length <= "web search HTTP 400: ".length + 200);
  assert.doesNotMatch(reason, /Bearer /);
  const leaked = formatWebSearchHttpFailure(
    400,
    'Bearer sk-secret {"error":"model grok-4 not supported"} xai-ABCDEFGH123456',
  );
  assert.match(leaked, /web search HTTP 400:/);
  assert.doesNotMatch(leaked, /sk-secret|xai-ABCDEFGH123456/);
  assert.match(truncateApiErrorBody("  too   much   space  "), /too much space/);
});

test("looksLikeLiveResearchQuestion is true for troubleshooting and lookup", () => {
  const yes = [
    "My 2018 Keystone Passport slide won’t retract — what should I check?",
    "My 2018 Keystone Passport slide won't retract — what should I check?",
    "Troubleshoot a coach that will not start",
    "Why is my generator overheating?",
    "How do I reset a lippert slide error code?",
    "Look up the TSB for a leaking propane fitting",
    "Recall research on my inverter if NHTSA is thin",
    "Starlink install wiring and fuse size",
    "Battery jack leveling alarm will not clear",
    "Search the web for common slide motor fixes",
  ];
  for (const q of yes) {
    assert.equal(looksLikeLiveResearchQuestion(q), true, q);
    assert.equal(needsWebFallback(null, q), true, q);
  }
});

test("looksLikeLiveResearchQuestion is false for lifestyle, payment, and hi", () => {
  const casual = [
    "hi",
    "thanks",
    "Is full-timing worth it?",
    "Sell me the RV lifestyle vs hotels",
    "What's the monthly payment on $80000 at 7% for 15 years?",
  ];
  for (const q of casual) {
    assert.equal(looksLikeLiveResearchQuestion(q), false, q);
    assert.equal(looksLikeCasualNonResearch(q), true, q);
    assert.equal(needsWebFallback(null, q), false, q);
    assert.equal(needsWebFallback(null, q, { agentMode: true }), false, q);
  }
  assert.equal(looksLikeLiveResearchQuestion("Draw a Class A at sunset"), false);
  assert.equal(looksLikeImageOnlyAsk("Draw a Class A at sunset"), true);
  assert.equal(needsWebFallback(null, "Draw a Class A at sunset"), false);
  assert.equal(needsWebFallback(null, "hi how are you"), false);
});

test("Passport slide retract wants web even when powertrain is locked", () => {
  const locked = {
    identity: {
      year: "2018",
      make: "Keystone",
      model: "Passport",
      floorplan: "",
      source: "message" as const,
    },
    engine: { value: null, trust: "empty" as const },
    horsepower: { value: null, trust: "empty" as const },
    torque: { value: null, trust: "empty" as const },
    chassis: { value: "Keystone trailer", trust: "catalog" as const },
    transmission: { value: null, trust: "empty" as const },
    fuelType: { value: null, trust: "empty" as const },
    rvType: { value: "Travel Trailer", trust: "catalog" as const },
    note: null,
    weightBand: null,
    hasHardLock: true,
    missingHard: false,
  };
  const q =
    "My 2018 Keystone Passport slide won’t retract — what should I check?";
  assert.equal(needsWebFallback(locked, q), true);
});

test("spec miss still wants web; locked Vision engine question does not", () => {
  assert.equal(
    needsWebFallback(null, "What HP does a 2023 American Dream have?"),
    true,
  );
  assert.equal(
    needsWebFallback(
      { missingHard: true },
      "What engine and HP does a 2023 American Coach American Dream 45A have?",
    ),
    true,
  );

  const lockedSpec = {
    identity: {
      year: "2023",
      make: "Entegra Coach",
      model: "Vision",
      floorplan: "",
      source: "message" as const,
    },
    engine: { value: "7.3 Godzilla", trust: "pin" as const },
    horsepower: { value: "350 HP", trust: "pin" as const },
    torque: { value: "468 lb-ft", trust: "pin" as const },
    chassis: { value: "Ford F-53", trust: "pin" as const },
    transmission: { value: "6R140", trust: "pin" as const },
    fuelType: { value: "Gas", trust: "pin" as const },
    rvType: { value: "Class A", trust: "catalog" as const },
    note: null,
    weightBand: null,
    hasHardLock: true,
    missingHard: false,
  };
  assert.equal(
    needsWebFallback(
      lockedSpec,
      "What engine and HP does a 2023 Entegra Vision have?",
    ),
    false,
  );
});

test("agent mode can request web for lookup without forcing hi", () => {
  assert.equal(
    needsWebFallback(null, "What's the latest word on Keystone quality?", {
      agentMode: true,
    }),
    true,
  );
  assert.equal(
    needsWebFallback(null, "hi", { agentMode: true }),
    false,
  );
});

test("troubleshooting web prompt asks for symptoms and bulletins", () => {
  const body = buildWebSearchRequest({
    model: "grok-4.6",
    query: "My 2018 Keystone Passport slide won't retract — what should I check?",
  });
  const packed = JSON.stringify(body);
  assert.match(packed, /symptoms|bulletin|TSB|troubleshooting/i);
  assert.match(packed, /slide won't retract/i);
  assert.deepEqual(body.tools, [{ type: "web_search" }]);
  const input = body.input as Array<{ role: string; content: string }>;
  assert.equal(input.length, 1);
  assert.equal(input[0].role, "user");
});

test("web injection stays honest when search fails", () => {
  const fail = formatWebSearchInjection({
    ok: false,
    reason: "no XAI_API_KEY on the server",
  });
  assert.match(fail, /WEB SEARCH NOT AVAILABLE/);
  assert.match(fail, /do not invent/i);
  const ok = formatWebSearchInjection({
    ok: true,
    notes: "Check slide lock pins first.",
    model: "grok-4.6",
  });
  assert.match(ok, /WEB RESEARCH NOTES/);
  assert.match(ok, /do not claim you have no internet/i);
});

test("RvGROK chat client injects catalog grounding", () => {
  const app = src(join(root, "../../components/rvgrok"), "RvGrokApp.tsx");
  const stream = src(root, "stream.ts");
  assert.match(app, /buildChatGrounding/);
  assert.match(app, /catalogContext/);
  assert.match(app, /buildVoiceGrounding/);
  assert.match(app, /agentMode,/);
  assert.match(stream, /catalogContext/);
  assert.match(stream, /wantsWebFallback/);
});

test("system prompts know injected web research is live internet", () => {
  const prompts = src(root, "prompts.ts");
  assert.match(prompts, /WEB RESEARCH notes/);
  assert.match(prompts, /no internet/i);
  assert.match(prompts, /WEB SEARCH NOT AVAILABLE/);
  assert.match(prompts, /no catalog data/i);
  assert.match(prompts, /OEM site or a dealer/);
  const voice = src(root, "voice.ts");
  assert.match(voice, /WEB RESEARCH notes/);
  assert.match(voice, /WEB SEARCH NOT AVAILABLE/);
  assert.match(voice, /no catalog data/i);
  const live = src(root, "liveVoice.ts");
  assert.doesNotMatch(live, /wantsWebFallback/);
  const realtime = src(root, "realtime.ts");
  assert.match(realtime, /buildChatGrounding/);
  assert.match(realtime, /decideVoiceWebResearch/);
  assert.match(realtime, /formatVoiceWebSearchInjection/);
  assert.match(realtime, /maybeEnrichWithWebResearch/);
  const grounding = src(root, "grounding.ts");
  assert.match(grounding, /no catalog data/i);
  assert.match(grounding, /do not send the user to the OEM site/i);
  assert.match(src(root, "webIntent.ts"), /looksLikeNamedCoachProductQuestion/);
  assert.match(src(root, "webIntent.ts"), /catalogGapNeedsWeb/);
  assert.match(src(root, "webIntent.ts"), /looksLikeOffCatalogQuestion/);
  assert.match(src(root, "grounding.ts"), /catalogYearIsListed/);
  assert.match(src(root, "grounding.ts"), /hasYearRow/);
});

test("know about / what about a named coach wants web when catalog is missing", () => {
  const q2027 =
    "I'd like to know about the 2027 Grand Design Lineage M series.";
  const q2026 =
    "I'm afraid to ask this, but what about the 2026 Grand Design Lineage M series?";
  for (const q of [q2027, q2026]) {
    assert.equal(looksLikeNamedCoachProductQuestion(q), true, q);
    assert.equal(needsWebFallback(null, q), true, q);
    assert.equal(needsWebFallback({ missingHard: true }, q), true, q);
  }
  assert.equal(
    needsWebFallback({ missingHard: false }, q2027),
    false,
    "locked catalog should not browse a plain about-this-coach ask",
  );
  assert.equal(
    looksLikeNamedCoachProductQuestion("Is full-timing worth it?"),
    false,
  );
  assert.equal(looksLikeNamedCoachProductQuestion("hi"), false);
});

test("Lineage M / Lineage M series resolve to catalog Lineage Series M", () => {
  const gd = Object.keys(CATALOG_INDEX["Grand Design"] || {});
  assert.ok(gd.includes("Lineage Series M"));
  for (const spoken of [
    "Lineage M",
    "Lineage M series",
    "Lineage Series M",
    "lineage series m",
  ]) {
    assert.equal(matchCatalogModelName(spoken, gd), "Lineage Series M", spoken);
  }
  assert.equal(matchCatalogModelName("Lineage E series", gd), "Lineage Series E");
  assert.notEqual(matchCatalogModelName("Lineage M", gd), "Lineage Series E");
  assert.notEqual(matchCatalogModelName("Lineage M", gd), "Lineage Series F");
  assert.match(src(root, "grounding.ts"), /matchCatalogModelName/);
});

test("2027 Lineage M about-ask grounds from catalog and does not claim no data", () => {
  const q = "I'd like to know about the 2027 Grand Design Lineage M series.";
  const parsed = parseCoachFromText(q);
  const gd = Object.keys(CATALOG_INDEX["Grand Design"] || {});
  const model = matchCatalogModelName(parsed.model, gd);
  assert.equal(parsed.year, "2027");
  assert.equal(parsed.make, "Grand Design");
  assert.equal(model, "Lineage Series M");

  const pin = findPowertrainCorrection(parsed.year, parsed.make, model);
  assert.ok(pin, "expected a locked Series M pin for 2027");
  assert.match(pin!.engine, /208|Sprinter/i);
  assert.equal(pin!.fuelType, "Diesel");
  assert.doesNotMatch(pin!.note || "", /no catalog data/i);

  assert.equal(needsWebFallback({ missingHard: false }, q), false);
  assert.equal(
    needsWebFallback({ missingHard: true }, q),
    true,
    "gaps still browse",
  );
  const pin26 = findPowertrainCorrection(
    "2026",
    "Grand Design",
    "Lineage Series M",
  );
  assert.ok(pin26, "MY2026 Series M is in the catalog pin, not empty");
});

test("unresolved named coach about-ask still fires web instead of a dealer dead-end", () => {
  const q = "I'd like to know about the 2027 Grand Design Unicorn Deluxe.";
  assert.equal(looksLikeNamedCoachProductQuestion(q), true);
  const gd = Object.keys(CATALOG_INDEX["Grand Design"] || {});
  const model = matchCatalogModelName("Unicorn Deluxe", gd);
  assert.notEqual(model, "Lineage Series M");
  const pin = findPowertrainCorrection("2027", "Grand Design", model);
  assert.equal(pin, null);
  assert.equal(needsWebFallback(null, q), true);
  assert.equal(needsWebFallback({ missingHard: true }, q), true);
  const grounding = src(root, "grounding.ts");
  assert.match(grounding, /WEB RESEARCH notes/i);
  assert.match(grounding, /do not send the user to the OEM site/i);
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(api, /wantsWebFallback/);
  assert.match(api, /executeWebResearch/);
});

test("catalog miss fires web without about-phrasing", () => {
  const tow =
    "What's the tow rating on a 2019 XYZ Phantom that's not in catalog?";
  assert.equal(looksLikeNamedCoachProductQuestion(tow), false);
  assert.equal(needsWebFallback(null, tow), true);
  assert.equal(needsWebFallback({ missingHard: true }, tow), true);

  const fish = "Best fishing spots near Moab for an RV";
  assert.equal(looksLikeOffCatalogQuestion(fish), true);
  assert.equal(needsWebFallback(null, fish), true);
  assert.equal(
    needsWebFallback({ missingHard: false }, fish),
    true,
    "locked coach still browses fishing — catalog never has spots",
  );

  const eYears = CATALOG_INDEX["Grand Design"]?.["Lineage Series E"]?.years;
  assert.equal(catalogYearIsListed("2027", eYears), true);
  assert.equal(catalogYearIsListed("2026", eYears), false);
  assert.equal(
    needsWebFallback(
      { missingHard: true },
      "2026 Grand Design Lineage Series E hitch rating",
    ),
    true,
  );
});
