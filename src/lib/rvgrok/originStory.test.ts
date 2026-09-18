import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ABOUT_RVFOX,
  ORIGIN_STORY,
  ORIGIN_STORY_BLOCK,
  RVFOX_FOUNDER,
  RVFOX_PRODUCT,
  RVFOX_TAGLINE_KNOW,
  RVFOX_TAGLINE_VERIFIED,
  formatOriginGroundingBlock,
  looksLikeOriginQuestion,
} from "./originStory.ts";
import { needsWebFallback } from "./webIntent.ts";
import { decideVoiceWebResearch } from "./voiceWeb.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

const ORIGIN_ASKS = [
  "Who built this?",
  "Who built RV Grok?",
  "Who founded RvFOX?",
  "What's the origin story?",
  "Why was this app built?",
  "What is RvFOX?",
  "About this app",
  "What's your mission?",
  "What's the tagline?",
  "Verified & True",
  "Know before you buy",
  "Who are you?",
  "Tell me about David Hansen",
];

function assertOriginFacts(text: string, label: string) {
  assert.match(text, /David Hansen/, `${label} names David Hansen`);
  assert.match(text, /RvFOX/, `${label} names RvFOX`);
  assert.match(text, /Verified & True/, `${label} has Verified & True`);
  assert.match(text, /Know before you buy/, `${label} has Know before you buy`);
  assert.match(text, /buyer-first/i, `${label} is buyer-first`);
  assert.match(
    text,
    /never say "I don't know" about this/i,
    `${label} forbids I-don't-know on origin`,
  );
}

test("origin KB is David Hansen / RvFOX / Verified & True / buyer-first", () => {
  assert.equal(RVFOX_FOUNDER, "David Hansen");
  assert.equal(RVFOX_PRODUCT, "RvFOX");
  assert.equal(RVFOX_TAGLINE_VERIFIED, "Verified & True");
  assert.equal(RVFOX_TAGLINE_KNOW, "Know before you buy");
  assertOriginFacts(ABOUT_RVFOX, "ABOUT_RVFOX");
  assert.match(ORIGIN_STORY, /ritual of fog/);
  assert.match(ORIGIN_STORY, /RvGrok\. The co-pilot/);
  assert.match(ORIGIN_STORY, /nobody has to buy blind/);
  assert.doesNotMatch(ORIGIN_STORY, /I don't know/);
  assertOriginFacts(ORIGIN_STORY_BLOCK, "ORIGIN_STORY_BLOCK");
  assertOriginFacts(formatOriginGroundingBlock(), "formatOriginGroundingBlock");
});

test("origin / about / mission / tagline asks match and never web-hold", () => {
  for (const q of ORIGIN_ASKS) {
    assert.equal(looksLikeOriginQuestion(q), true, q);
    assert.equal(needsWebFallback(null, q), false, q);
    assert.equal(
      decideVoiceWebResearch({ transcript: q, specs: null }).action,
      "pass",
      q,
    );
  }
  assert.equal(
    looksLikeOriginQuestion("What's the HP on a 2023 Entegra Vision?"),
    false,
  );
  assert.equal(
    looksLikeOriginQuestion("Tell me about the 2027 Grand Design Lineage"),
    false,
  );
});

test("origin ask injects the official story — never I don't know", () => {
  const block = formatOriginGroundingBlock();
  assertOriginFacts(block, "origin grounding block");
  assert.match(block, /OFFICIAL RVFOX ORIGIN STORY/);
  assert.doesNotMatch(block, /I don't have that/);
  const grounding = src("grounding.ts");
  assert.match(grounding, /withOriginBlock/);
  assert.match(grounding, /formatOriginGroundingBlock/);
  assert.match(grounding, /looksLikeOriginQuestion/);
});

test("chat, voice, and grounding wire the origin KB; DialaBot stays out", () => {
  assert.match(src("prompts.ts"), /ABOUT_RVFOX/);
  assert.match(src("voice.ts"), /ABOUT_RVFOX/);
  assert.match(src("grounding.ts"), /withOriginBlock/);
  assert.match(src("grounding.ts"), /looksLikeOriginQuestion/);
  assert.match(src("webIntent.ts"), /looksLikeOriginQuestion/);
  assert.match(src("speechPolicy.ts"), /Verified & True \/ Know before you buy/);
  assert.match(
    src("speechPolicy.ts"),
    /I'm RV Grok, here to help you with all your RV needs/,
  );
  assert.doesNotMatch(src("speechPolicy.ts"), /Only say "Let me check that"/);
  const ownLot = src("ownLotInventory.test.ts");
  assert.match(ownLot, /DialaBot stays out/);
});
