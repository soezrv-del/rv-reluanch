/**
 * Product / tell-me-about / YMM asks must never get lot-first answers.
 * Standing prompts stay free of lot coaching. Own-lot snapshot is injected
 * only on explicit stock asks (API + voice research), not product grounding.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildChatGrounding, buildVoiceGrounding } from "./grounding.ts";
import {
  looksLikeInventoryOrCountQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeCoachFactAsk,
  needsWebFallback,
} from "./webIntent.ts";
import {
  formatOwnLotInjection,
  looksLikeOwnLotStockQuestion,
  shouldSkipWebForOwnLot,
} from "./ownLotInventory.ts";
import {
  isForbiddenLotFirstDeflection,
  isForbiddenScopeNarrow,
} from "./speechPolicy.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

const SENECA = "Tell me about a 2025 Jayco Seneca 37K.";
const LOT_ASK = "Do we have a Seneca on the lot?";
const BAD_REPLY =
  "None of the 2025 Jayco Seneca 37K on our lot right now. Zero diesel units too.";

const LOT_INSTRUCTION_RE =
  /OWN-LOT|own-lot|in stock|stock counts?|stock numbers?|Matched is 0|none on our lot|zero diesel|do we have|OWN-LOT INVENTORY/i;

test("Tell me about a 2025 Jayco Seneca 37K is a product ask, not inventory", () => {
  assert.equal(looksLikeInventoryOrCountQuestion(SENECA), false);
  assert.equal(looksLikeOwnLotStockQuestion(SENECA), false);
  assert.equal(looksLikeNamedCoachProductQuestion(SENECA), true);
  assert.equal(looksLikeCoachFactAsk(SENECA), true);
  assert.equal(needsWebFallback(null, SENECA), true);
  assert.equal(shouldSkipWebForOwnLot(SENECA), false);
});

test("tell me about the Entegra Vision SE stays product — not a lot search", () => {
  const q = "tell me about the Entegra Vision SE";
  assert.equal(looksLikeOwnLotStockQuestion(q), false);
  assert.equal(looksLikeInventoryOrCountQuestion(q), false);
  assert.equal(looksLikeNamedCoachProductQuestion(q), true);
});

test("Seneca product turn grounding requires web/catalog and never lot-miss copy", () => {
  const chat = buildChatGrounding({ query: SENECA });
  assert.equal(chat.needsWeb, true);
  assert.doesNotMatch(chat.block || "", /say none of that coach is on our lot/i);
  assert.doesNotMatch(chat.block || "", /on our lot/);
  assert.doesNotMatch(chat.block || "", /OWN-LOT INVENTORY/);
  assert.doesNotMatch(chat.block || "", /INVENTORY \/ IN-STOCK ASK/);
  assert.doesNotMatch(chat.block || "", /Matched is 0/);
  assert.match(chat.block || "", /WEB RESEARCH|CATALOG|BROCHURE/);

  const voice = buildVoiceGrounding({ query: SENECA });
  assert.doesNotMatch(voice, /say none of that coach is on our lot/i);
  assert.doesNotMatch(voice, /on our lot/);
  assert.doesNotMatch(voice, /OWN-LOT INVENTORY/);
});

test("Do we have a Seneca on the lot? is inventory; snapshot data is readable", async () => {
  assert.equal(looksLikeOwnLotStockQuestion(LOT_ASK), true);
  assert.equal(looksLikeInventoryOrCountQuestion(LOT_ASK), true);
  const chat = buildChatGrounding({ query: LOT_ASK });
  assert.doesNotMatch(chat.block || "", /OWN-LOT INVENTORY/);
  assert.doesNotMatch(chat.block || "", /INVENTORY \/ IN-STOCK ASK/);
  const notes = await formatOwnLotInjection(LOT_ASK);
  assert.doesNotMatch(notes, /UNAVAILABLE/);
  assert.match(notes, /source=own/);
  assert.match(notes, /Lot total: [1-9]/);
  assert.match(notes, /Seneca|Matched:/);
});

test("forbidden lot-first deflection matches the Seneca miss shape", () => {
  assert.equal(isForbiddenLotFirstDeflection(BAD_REPLY), true);
  assert.equal(
    isForbiddenLotFirstDeflection(
      "The 2025 Jayco Seneca 37K is a Super C on a Freightliner chassis.",
    ),
    false,
  );
  assert.equal(isForbiddenLotFirstDeflection("None of those coaches on our lot"), true);
  assert.equal(isForbiddenLotFirstDeflection("zero diesel units"), true);
  assert.equal(isForbiddenLotFirstDeflection("not on our lot right now"), true);
  assert.equal(isForbiddenScopeNarrow(BAD_REPLY), false);
});

test("standing prompts have no lot coaching; lean core has no lot ban", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const speech = src("speechPolicy.ts").replace(
    /isForbiddenLotFirstDeflection[\s\S]*?^}/m,
    "",
  );
  const grounding = src("grounding.ts");
  const live = src("liveVoice.ts");
  const voiceWeb = src("voiceWeb.ts");
  const api = src("../../routes/api/rvgrok.ts");

  for (const [label, text] of [
    ["prompts.ts", prompts],
    ["voice.ts", voice],
    ["speechPolicy.ts (minus detector)", speech],
    ["grounding.ts", grounding],
    ["liveVoice.ts", live],
    ["voiceWeb.ts", voiceWeb],
  ] as const) {
    assert.doesNotMatch(text, /OWN-LOT INVENTORY/, label);
    assert.doesNotMatch(text, /OWN-LOT STOCK/, label);
    assert.doesNotMatch(text, /on our lot/, label);
    assert.doesNotMatch(text, /none of that coach is on our lot/, label);
    assert.doesNotMatch(text, /If Matched is 0, say none/, label);
    assert.doesNotMatch(text, LOT_INSTRUCTION_RE, label);
    assert.doesNotMatch(text, /ACCURACY FIRST/, label);
    assert.doesNotMatch(text, /DialaBot/, label);
  }

  assert.doesNotMatch(
    src("speechPolicy.ts"),
    /No lot, inventory, stock, or "on our lot" language/,
  );
  assert.match(api, /loadOwnLotSnapshot/);
  assert.match(api, /looksLikeOwnLotStockQuestion/);
  assert.doesNotMatch(api, /[Dd]ialaBot/);

  const speechFull = src("speechPolicy.ts");
  assert.match(
    speechFull,
    /ACCURACY_AIM_POLICY =\s*\n\s*"Get as accurate as possible, but not gospel\."/,
  );
  assert.match(speechFull, /Get as accurate as possible, but not gospel\./);
  assert.match(speechFull, /Empty beats invented/);
  assert.match(speechFull, /ultimate sales assistant for RV salesmen/);
  assert.match(src("voice.ts"), /RV_GROK_LEAN_CORE/);
  assert.match(src("voice.ts"), /CAMERA:/);
  assert.match(src("voice.ts"), /GROK_VOICES/);
  assert.match(src("voice.ts"), /LIVE_VOICE_KEY/);
  assert.match(src("voice.ts"), /createPushToTalkRecognition/);
  assert.match(src("voice.ts"), /getSpeechRecognitionCtor/);
});
