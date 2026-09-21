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
  COACH_BRANDS,
  consonantBrandShape,
  matchCatalogModelName,
  parseCoachFromText,
  seriesAliasEquals,
} from "./parseCoach.ts";
import {
  buildChatGrounding,
  buildVoiceGrounding,
  lookupGroundedSpecs,
} from "./grounding.ts";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import {
  looksLikeCasualNonResearch,
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeImageOnlyAsk,
  looksLikeInventoryOrCountQuestion,
  looksLikeLiveResearchQuestion,
  looksLikeMarketValueQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeOffCatalogQuestion,
  catalogGapNeedsWeb,
  needsWebFallback,
} from "./webIntent.ts";
import { findComparableCatalogCoaches } from "./coachCompare.ts";
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
  assert.doesNotMatch(p.model, /\bhave\b/i);
  assert.equal(p.floorplan, "45A");
});

test("Integra is an Entegra Coach alias and 27A still parses before the brand", () => {
  assert.ok(!COACH_BRANDS.includes("Integra"));
  const a = parseCoachFromText("27A Integra Vision");
  assert.equal(a.make, "Entegra Coach");
  assert.match(a.model, /vision/i);
  assert.equal(a.floorplan, "27A");
  const b = parseCoachFromText("Integra Vision 27A");
  assert.equal(b.make, "Entegra Coach");
  assert.match(b.model, /vision/i);
  assert.equal(b.floorplan, "27A");
  const plural = parseCoachFromText(
    "any Integras with a E Vision 27As in our inventory",
  );
  assert.equal(plural.make, "Entegra Coach");
  assert.match(plural.model, /vision/i);
  assert.match(plural.floorplan, /27A/i);
  const brandless = parseCoachFromText("look in my inventory for a 27A Vision");
  assert.match(brandless.make, /Entegra/i);
  assert.match(brandless.model, /vision/i);
  assert.equal(brandless.floorplan, "27A");
});

test("fuzzy brand shape maps Tifin → Tiffin and keeps Integra as the alias fast path", () => {
  assert.equal(consonantBrandShape("Tifin"), consonantBrandShape("Tiffin"));
  assert.equal(parseCoachFromText("36L Tifin Phaeton").make, "Tiffin");
  assert.equal(parseCoachFromText("Tifin Allegro Bus").make, "Tiffin");
  assert.equal(parseCoachFromText("Newmr Dutch Star").make, "Newmar");
  assert.equal(parseCoachFromText("Integra Vision 27A").make, "Entegra Coach");
  assert.equal(parseCoachFromText("integrity check on the propane").make, "");
});

test("catalog GAP tells inventory asks to prefer own-lot over manufacturer", () => {
  const grounding = src(root, "grounding.ts");
  assert.match(grounding, /OWN-LOT INVENTORY is source-of-truth this turn/);
  assert.match(grounding, /Never say check your own lot listing/);
  assert.match(grounding, /manufacturer for inventory/);
  const stockAsk = "look in my inventory for a M series 25FW";
  const voice = buildVoiceGrounding({ query: stockAsk });
  assert.match(voice, /OWN-LOT INVENTORY/);
  assert.match(voice, /manufacturer for inventory/);
  const chat = buildChatGrounding({ query: stockAsk });
  assert.match(chat.block || "", /manufacturer/i);
  const catalogAsk = buildChatGrounding({ query: "M series 25FW" });
  assert.doesNotMatch(catalogAsk.block || "", /INVENTORY \/ IN-STOCK ASK/);
});

test("2023 American Dream 45A pin is X15 605 / 1,950 — not L9 option-band", () => {
  const pin = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "45A",
  );
  assert.ok(pin, "expected a brochure pin for American Dream 45A");
  assert.equal(pin!.fuelType, "Diesel");
  assert.match(pin!.engine, /X15/);
  assert.doesNotMatch(pin!.engine, /\bL9\b/);
  assert.match(pin!.chassis || "", /Spartan/i);
  assert.doesNotMatch(pin!.engine, /Liberty Bridge|F-?53|Godzilla/i);
  assert.equal(isAmbiguousCatalogValue(pin!.engine), false);
  assert.equal(pin!.horsepower, 605);
  assert.equal(pin!.torqueLbFt, 1950);

  const hp = honestHorsepowerLabel({
    engine: pin!.engine,
    horsepower: pin!.horsepower,
  });
  assert.equal(hp, "605 HP");
});

test("2023 American Dream 42Q pin is L9 450 / 1,250 — not 45A X15", () => {
  const pin = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "42Q",
  );
  assert.ok(pin, "expected a brochure pin for American Dream 42Q");
  assert.match(pin!.engine, /L9/);
  assert.doesNotMatch(pin!.engine, /X15/);
  assert.equal(pin!.horsepower, 450);
  assert.equal(pin!.torqueLbFt, 1250);
  assert.equal(isAmbiguousCatalogValue(pin!.engine), false);
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

test("market value / pricing asks fire live research even when catalog is locked", () => {
  const yes = [
    "What's the market value of a 2019 Newmar Dutch Star?",
    "What is a 2015 Newmar Ventana worth?",
    "Pricing on a 2018 Keystone Passport",
    "How much is a used 2020 Entegra Aspire?",
    "What are they asking for a 2016 Tiffin Phaeton?",
  ];
  const locked = { missingHard: false };
  for (const q of yes) {
    assert.equal(looksLikeMarketValueQuestion(q), true, q);
    assert.equal(looksLikeLiveResearchQuestion(q), true, q);
    assert.equal(needsWebFallback(null, q), true, q);
    assert.equal(needsWebFallback(locked, q), true, q);
  }
  assert.equal(looksLikeMarketValueQuestion("Is full-timing worth it?"), false);
  assert.equal(
    looksLikeMarketValueQuestion(
      "What's the monthly payment on $80000 at 7% for 15 years?",
    ),
    false,
  );
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
  assert.match(packed, /Market value \/ pricing/);
  assert.match(packed, /competitor-latest/);
  assert.match(packed, /year ±2/);
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
  assert.match(app, /filter\(\(m\) => m\.role === "user"\)/);
  assert.match(stream, /catalogContext/);
  assert.match(stream, /wantsWebFallback/);
});

test("repair-mode playbook is wired through chat, voice, and browse", () => {
  assert.match(src(root, "repairMode.ts"), /REPAIR PLAYBOOK/);
  assert.match(src(root, "repairMode.ts"), /torque spec/);
  assert.match(src(root, "repairMode.ts"), /part number/);
  assert.match(src(root, "repairMode.ts"), /wiring color/);
  assert.match(src(root, "repairMode.ts"), /bypass the sensor/);
  assert.match(src(root, "grounding.ts"), /repairMode/);
  assert.match(src(root, "grounding.ts"), /formatRepairGroundingBlock/);
  assert.match(src(root, "webIntent.ts"), /looksLikeRepairQuestion/);
  assert.match(src(root, "prompts.ts"), /REPAIR \/ DIAGNOSE/);
  assert.match(src(root, "voice.ts"), /Not a certified RV tech/);
  assert.match(src(root, "webSearch.ts"), /torque spec, part number, wiring color/);
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(api, /buildChatGrounding/);
});

test("system prompts never deflect to website / OEM / dealer — unconditional", () => {
  const prompts = src(root, "prompts.ts");
  assert.match(prompts, /WEB RESEARCH notes/);
  assert.match(prompts, /no internet/i);
  assert.match(prompts, /WEB SEARCH NOT AVAILABLE/);
  assert.match(prompts, /no catalog data/i);
  assert.match(prompts, /OEM site, or dealer/);
  assert.match(prompts, /UNCONDITIONAL/);
  assert.match(prompts, /check the website/);
  assert.match(prompts, /look it up yourself/);
  assert.match(prompts, /go check the OEM site/);
  assert.match(prompts, /ask the dealer/);
  assert.match(prompts, /facts and numbers first/);
  assert.doesNotMatch(
    prompts,
    /as the primary answer when WEB RESEARCH notes are present/,
  );
  assert.doesNotMatch(
    prompts,
    /as the primary answer when notes are present/,
  );
  const voice = src(root, "voice.ts");
  assert.match(voice, /WEB RESEARCH notes/);
  assert.match(voice, /WEB SEARCH NOT AVAILABLE/);
  assert.match(voice, /no catalog data/i);
  assert.match(voice, /UNCONDITIONAL/);
  assert.match(voice, /check the website/);
  assert.doesNotMatch(
    voice,
    /as the whole answer when WEB RESEARCH notes are present/,
  );
  const live = src(root, "liveVoice.ts");
  assert.doesNotMatch(live, /wantsWebFallback/);
  const realtime = src(root, "realtime.ts");
  assert.match(realtime, /buildChatGrounding/);
  assert.match(realtime, /decideVoiceWebResearch/);
  assert.match(realtime, /formatVoiceWebSearchInjection/);
  assert.match(realtime, /maybeEnrichWithWebResearch/);
  const grounding = src(root, "grounding.ts");
  assert.match(grounding, /no catalog data/i);
  assert.match(grounding, /never send the user to the OEM site/i);
  assert.match(grounding, /check the website/);
  assert.match(grounding, /look it up yourself/);
  assert.match(grounding, /go check the OEM site/);
  assert.doesNotMatch(grounding, /verify-after only/);
  assert.match(grounding, /Never send them to a brochure, door sticker, dealer, or website/);
  assert.doesNotMatch(
    grounding,
    /never the whole answer when research notes are present/,
  );
  assert.match(grounding, /IS in the verified catalog/);
  assert.match(src(root, "coachIdentity.ts"), /fromQuery/);
  assert.match(src(root, "coachIdentity.ts"), /namedCoachConflictsLock/);
  assert.match(src(root, "coachIdentity.ts"), /askNamesCoachIdentity/);
  assert.match(grounding, /namedCoachConflictsLock/);
  assert.match(grounding, /askNamesCoachIdentity/);
  assert.match(grounding, /THIS turn's lock/);
  assert.match(src(root, "webIntent.ts"), /Resolved hard row/);
  assert.match(src(root, "webIntent.ts"), /looksLikeNamedCoachProductQuestion/);
  assert.match(src(root, "webIntent.ts"), /catalogGapNeedsWeb/);
  assert.match(src(root, "webIntent.ts"), /looksLikeOffCatalogQuestion/);
  assert.match(src(root, "webIntent.ts"), /looksLikeInventoryOrCountQuestion/);
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
    "Lineage M have",
  ]) {
    assert.equal(matchCatalogModelName(spoken, gd), "Lineage Series M", spoken);
    assert.equal(seriesAliasEquals(spoken, "Lineage Series M"), true, spoken);
  }
  assert.equal(matchCatalogModelName("Lineage E series", gd), "Lineage Series E");
  assert.notEqual(matchCatalogModelName("Lineage M", gd), "Lineage Series E");
  assert.notEqual(matchCatalogModelName("Lineage M", gd), "Lineage Series F");
  assert.match(src(root, "coachIdentity.ts"), /matchCatalogModelName/);
  assert.match(src(root, "coachIdentity.ts"), /fromQuery/);
  assert.match(src(root, "coachIdentity.ts"), /namedCoachConflictsLock/);
});

function assertLineageSeriesMLock(
  q: string,
  year: string,
  spokenModel: RegExp,
) {
  const parsed = parseCoachFromText(q);
  const gd = Object.keys(CATALOG_INDEX["Grand Design"] || {});
  const model = matchCatalogModelName(parsed.model, gd);
  const index = CATALOG_INDEX["Grand Design"]?.[model];
  assert.equal(parsed.year, year, q);
  assert.equal(parsed.make, "Grand Design", q);
  assert.match(parsed.model, spokenModel);
  assert.doesNotMatch(parsed.model, /\bhave\b/i);
  assert.equal(model, "Lineage Series M", q);
  assert.equal(index?.type, "Class C", q);
  assert.equal(index?.fuelType, "Diesel", q);
  assert.doesNotMatch(index?.type || "", /fifth[- ]wheel/i);

  // Spoken form must hit the pin — chat used to miss "Lineage M series".
  const pinSpoken = findPowertrainCorrection(parsed.year, parsed.make, parsed.model);
  const pinCatalog = findPowertrainCorrection(parsed.year, parsed.make, model);
  assert.ok(pinSpoken, `spoken pin missing for ${JSON.stringify(parsed)}`);
  assert.ok(pinCatalog, `catalog pin missing for ${model}`);
  assert.equal(pinSpoken!.horsepower, 208);
  assert.equal(pinCatalog!.horsepower, 208);
  assert.match(pinSpoken!.engine, /208|Sprinter|2\.0/i);
  assert.equal(pinSpoken!.fuelType, "Diesel");
  assert.match(pinSpoken!.chassis || "", /Sprinter 4500/i);
  assert.doesNotMatch(pinSpoken!.note || "", /no catalog data/i);
  assert.doesNotMatch(pinSpoken!.engine, /fifth[- ]wheel/i);

  assert.equal(
    needsWebFallback({ missingHard: false }, q),
    false,
    "locked Series M must not browse into a no-catalog narrative",
  );
  assert.equal(
    needsWebFallback({ missingHard: true }, q),
    true,
    "gaps still browse",
  );
}

test("David live fail: 2027 Lineage M series about-ask locks Series M Class C 208HP", () => {
  assertLineageSeriesMLock(
    "I'd like to know about the 2027 Grand Design Lineage M series.",
    "2027",
    /lineage m series/i,
  );
});

test("David live fail: 2026 Lineage M engine/HP locks Series M not fifth-wheel", () => {
  assertLineageSeriesMLock(
    "What engine and HP does a 2026 Grand Design Lineage M have?",
    "2026",
    /^Lineage M$/i,
  );
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
  assert.match(grounding, /never send the user to the OEM site/i);
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(api, /wantsWebFallback/);
  assert.match(api, /executeWebResearch/);
  assert.match(api, /buildChatGrounding/);
  assert.match(api, /serverGrounded/);
  assert.match(api, /lastNamesCoach/);
  assert.match(api, /askNamesCoachIdentity/);
});

test("inventory / diesel count asks still trip the detector when catalog is locked", () => {
  const locked = { missingHard: false };
  const inventory = "How many diesel Newmar Dutch Stars are in inventory?";
  const dieselCount = "What's the diesel count for 2024 Tiffin Allegro?";
  const lot = "Any Entegra inventory near Dallas?";
  const weHave = "How many diesels do we have in stock?";
  const stock = "stock number 45282";
  const bareStock = "45282";
  const entegraFresno = "How many Entegra coaches do we have in Fresno?";
  for (const q of [inventory, dieselCount, lot, weHave, stock, bareStock, entegraFresno]) {
    assert.equal(looksLikeInventoryOrCountQuestion(q), true, q);
    assert.equal(needsWebFallback(locked, q), true, q);
    assert.equal(needsWebFallback(null, q), true, q);
  }
  assert.equal(
    looksLikeInventoryOrCountQuestion("How many slides does a 2023 Dream have?"),
    false,
    "slide count is a spec, not lot inventory",
  );
  assert.equal(
    looksLikeInventoryOrCountQuestion("How many nights should we plan?"),
    false,
  );
  assert.equal(
    needsWebFallback(
      locked,
      "What engine and HP does a 2023 Entegra Vision have?",
    ),
    false,
    "locked fuel/engine spec still does not browse",
  );
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(api, /loadOwnLotSnapshot/);
  assert.match(api, /shouldSkipWebForOwnLot/);
  assert.match(api, /OWN-LOT INVENTORY/);
});

test("unknown / catalog GAP always browses — locked specs still do not", () => {
  assert.equal(catalogGapNeedsWeb(null), true);
  assert.equal(catalogGapNeedsWeb({ missingHard: true }), true);
  assert.equal(catalogGapNeedsWeb({ missingHard: false }), false);
  assert.equal(
    needsWebFallback(null, "What hitch rating does a 2019 XYZ Phantom have?"),
    true,
    "no catalog row → search",
  );
  assert.equal(
    needsWebFallback(
      { missingHard: true },
      "What engine does a 2026 Lineage Series E have?",
    ),
    true,
    "UNKNOWN hard fields → search",
  );
  assert.equal(
    needsWebFallback(
      { missingHard: false },
      "What engine and HP does a 2023 Entegra Vision have?",
    ),
    false,
    "locked catalog still answers without browse",
  );
  assert.equal(needsWebFallback(null, "hi"), false);
  const intent = src(root, "webIntent.ts");
  assert.match(intent, /catalogGapNeedsWeb/);
  assert.match(intent, /unknown \/ catalog GAP/i);
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

test("David voice compare: Allegro Bus vs American Dream locks both, skips web hold", () => {
  const q = "Compare the Allegro Bus to the American Dream.";
  assert.equal(looksLikeCatalogAnswerableCoachCompare(q), true);
  assert.equal(needsWebFallback(null, q), false);
  const hits = findComparableCatalogCoaches(q);
  assert.equal(hits.length, 2);
  const models = hits.map((h) => h.model).sort();
  assert.deepEqual(models, ["Allegro Bus", "American Dream"]);
  assert.equal(
    hits.find((h) => h.model === "Allegro Bus")?.make,
    "Tiffin Bus",
  );
  assert.equal(
    hits.find((h) => h.model === "American Dream")?.make,
    "American Coach",
  );
  const tiffin = CATALOG_INDEX["Tiffin Bus"]?.["Allegro Bus"];
  const dream = CATALOG_INDEX["American Coach"]?.["American Dream"];
  assert.equal(tiffin?.type, "Class A Diesel");
  assert.equal(dream?.type, "Class A Diesel");
  const grounding = src(root, "grounding.ts");
  assert.match(grounding, /COMPARE_GROUNDING_RULES/);
  assert.match(grounding, /COMPARE THIS TURN/);
  assert.match(grounding, /findComparableCatalogCoaches/);
  assert.match(grounding, /Let me check that/);
  assert.match(grounding, /give me one second/);
  assert.match(grounding, /NEVER send the user to a website/);
  assert.match(src(root, "webIntent.ts"), /looksLikeCatalogAnswerableCoachCompare/);
  assert.doesNotMatch(src(root, "voiceWeb.ts"), /Let me check that/);
  assert.match(src(root, "speechPolicy.ts"), /give me one second/);
});

test("inventory ask with yearless Vision catalog GAP answers from own-lot, not deflection", () => {
  const asks = [
    "Can you look in my inventory for a 27A Vision?",
    "I need to know if we have any Integras with a E Vision 27As in our inventory.",
  ];
  for (const q of asks) {
    assert.equal(looksLikeInventoryOrCountQuestion(q), true, q);
    const chat = buildChatGrounding({ query: q });
    assert.ok(chat.identity, q);
    assert.match(chat.identity!.make, /Entegra/i, q);
    assert.match(chat.identity!.model, /vision/i, q);
    assert.doesNotMatch(chat.identity!.model, /lineage/i, q);
    assert.equal(chat.specs?.missingHard, true, q);
    assert.match(chat.block || "", /INVENTORY \/ IN-STOCK ASK/, q);
    assert.match(chat.block || "", /Never say catalog gap/, q);
    assert.match(chat.block || "", /Never say check your own lot listing/, q);
    assert.doesNotMatch(
      chat.block || "",
      /No model year in the ask/,
      q,
    );
    const voice = buildVoiceGrounding({ query: q });
    assert.match(voice, /INVENTORY \/ IN-STOCK ASK/, q);
    assert.match(voice, /Never say check your own lot listing/, q);
  }

  const specsOnly = buildChatGrounding({
    query: "What engine and HP does a 2027 Entegra Anthem 45W have?",
  });
  assert.equal(looksLikeInventoryOrCountQuestion(
    "What engine and HP does a 2027 Entegra Anthem 45W have?",
  ), false);
  if (specsOnly.specs?.missingHard) {
    assert.match(specsOnly.block || "", /CATALOG GAP/);
    assert.doesNotMatch(specsOnly.block || "", /INVENTORY \/ IN-STOCK ASK/);
  }
});

test("2025 Aspire 44R grounding injects VERIFIED GVWR 49000 — never teach I-don't-have GVWR", () => {
  const q = "2025 Entegra Coach Aspire 44R";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  const specs = lookupGroundedSpecs(identity!);
  assert.equal(specs.oemGvwrLbs, 49000);
  assert.equal(specs.oemUvwLbs, null);
  assert.match(specs.weightBand || "", /49,000 lbs GVWR/);

  const chat = buildChatGrounding({ query: q });
  assert.equal(chat.specs?.oemGvwrLbs, 49000);
  assert.match(chat.block, /VERIFIED GVWR 49000 from OEM pin/);
  assert.match(chat.block, /LOCKED WEIGHTS/);
  assert.match(chat.block, /Do not say you lack GVWR/i);
  assert.match(chat.block, /UVW: GAP — no OEM pin/);

  const voice = buildVoiceGrounding({ query: q });
  assert.match(voice, /VERIFIED GVWR 49000 from OEM pin/);
  assert.match(voice, /Never say you don't have a VERIFIED GVWR/i);

  const live = src(root, "liveVoice.ts");
  const prompts = src(root, "prompts.ts");
  const voiceSrc = src(root, "voice.ts");
  const speech = src(root, "speechPolicy.ts");
  for (const [label, text] of [
    ["liveVoice.ts", live],
    ["prompts.ts", prompts],
    ["voice.ts", voiceSrc],
    ["speechPolicy.ts", speech],
  ] as const) {
    assert.match(
      text,
      /never say you don't have/i,
      `${label} forbids claiming lack of a locked field`,
    );
    assert.match(text, /LOCKED WEIGHTS/, `${label} names LOCKED WEIGHTS`);
  }
  assert.doesNotMatch(
    live,
    /GAP over invent; say "I don't have that\."/,
    "live voice must not teach blanket I-don't-have when pins exist",
  );
});
