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
import { parseCoachFromText } from "./parseCoach.ts";
import {
  buildChatGrounding,
  looksLikeCasualNonResearch,
  looksLikeLiveResearchQuestion,
  needsWebFallback,
} from "./grounding.ts";
import {
  buildWebSearchRequest,
  extractResponsesText,
  formatWebSearchInjection,
} from "./webSearch.ts";

const root = dirname(fileURLToPath(import.meta.url));
const rvRoot = join(root, "../rv");

function src(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8");
}

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
  assert.match(grounding, /looksLikeLiveResearchQuestion/);
  assert.match(grounding, /needsWebFallback/);
  assert.match(guard, /Live Grok never writes engine/);
  assert.match(cache, /Chat answers must never call saveVerifiedDossier/);
  assert.match(api, /catalogContext/);
  assert.match(api, /fetchWebSearchNotes/);
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
    model: "grok-4.5",
    query: "2023 American Coach American Dream engine HP chassis",
    catalogBlock: "engine: Cummins L9 450 std / X15 605 opt",
  });
  assert.deepEqual(body.tools, [{ type: "web_search" }]);
  assert.equal("search_parameters" in body, false);
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
  assert.equal(needsWebFallback(null, "Draw a Class A at sunset"), false);
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
  const grounded = buildChatGrounding({ query: q });
  assert.equal(grounded.needsWeb, true);
});

test("spec miss still wants web; locked Vision engine question does not", () => {
  assert.equal(
    needsWebFallback(null, "What HP does a 2023 American Dream have?"),
    true,
  );
  const miss = buildChatGrounding({
    query: "What engine and HP does a 2023 American Coach American Dream 45A have?",
  });
  assert.equal(miss.needsWeb, true);

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
    model: "grok-4.5",
    query: "My 2018 Keystone Passport slide won't retract — what should I check?",
  });
  const packed = JSON.stringify(body);
  assert.match(packed, /symptoms|bulletin|TSB|troubleshooting/i);
  assert.match(packed, /slide won't retract/i);
  assert.deepEqual(body.tools, [{ type: "web_search" }]);
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
    model: "grok-4.5",
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
  const live = src(root, "liveVoice.ts");
  assert.doesNotMatch(live, /wantsWebFallback/);
});
