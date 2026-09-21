import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ABOUT_RVFOX,
  DAVID_HANSEN_STORY,
  ORIGIN_STORY,
  ORIGIN_STORY_BLOCK,
  RVFOX_FOUNDER,
  RVFOX_FOUNDER_LAST,
  RVFOX_PRODUCT,
  RVFOX_TAGLINE_KNOW,
  RVFOX_TAGLINE_VERIFIED,
  VERIFIED_TRUE_PROMISE,
  WHY_RVFOX_CREATED,
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
  "Who founded Grok?",
  "What's the origin story?",
  "Why was this app built?",
  "Why was Grok created?",
  "Why does Grok exist?",
  "Why does RV Grok exist?",
  "Why was RvFOX created?",
  "What is RvFOX?",
  "About this app",
  "What's your mission?",
  "What's the tagline?",
  "Verified & True",
  "Know before you buy",
  "Who are you?",
  "Who is David Hansen?",
  "Who is David?",
  "Tell me about David Hansen",
  "Tell me about the founder",
];

function assertNoIDontKnow(text: string, label: string) {
  const stripped = text.replace(/never say "I don't know"[^.]*\./gi, "");
  assert.doesNotMatch(
    stripped,
    /I don't know/,
    `${label} never answers I don't know`,
  );
  assert.doesNotMatch(stripped, /I don't have that/, `${label} never I-don't-have`);
}

function assertHansenSpelling(text: string, label: string) {
  assert.match(text, /David Hansen/, `${label} names David Hansen`);
  assert.doesNotMatch(text, /Hanson/, `${label} never misspells Hansen as Hanson`);
}

function assertLotStory(text: string, label: string) {
  assert.match(text, /dealer lot/, `${label} has the dealer-lot story`);
  assert.match(text, /Class A diesel/, `${label} names Class A diesel`);
  assert.match(text, /clipboard/, `${label} has the clipboard`);
  assert.match(text, /fact-checking/, `${label} fact-checks the salesman`);
  assert.match(text, /No recalls/, `${label} has the false no-recalls beat`);
  assert.match(text, /wished he hadn'?t/, `${label} bought and regretted`);
}

function assertWhyCreated(text: string, label: string) {
  assert.match(text, /buyer-dealer/, `${label} names the broken buyer-dealer relationship`);
  assert.match(text, /conglomerates/, `${label} names corporate conglomerates`);
  assert.match(text, /revolving[- ]door/, `${label} names the revolving door`);
  assert.match(text, /NHTSA/, `${label} names live NHTSA recalls`);
  assert.match(text, /market pricing/, `${label} names real market pricing`);
  assert.match(
    text,
    /total cost of ownership/,
    `${label} names true total cost of ownership`,
  );
  assert.match(text, /trust, not pressure/, `${label} deal on trust not pressure`);
  assert.match(text, /bring back the fun/i, `${label} bring back the fun`);
}

function assertVerifiedTruePromise(text: string, label: string) {
  assert.match(text, /Verified & True/, `${label} has Verified & True`);
  assert.match(text, /not a tagline/, `${label} says Verified & True is not a tagline`);
  assert.match(
    text,
    /family's biggest purchase/,
    `${label} family's biggest purchase`,
  );
  assert.match(text, /gamble/, `${label} stops being a gamble`);
}

function assertOriginFacts(text: string, label: string) {
  assertHansenSpelling(text, label);
  assert.match(text, /RvFOX/, `${label} names RvFOX`);
  assert.match(text, /Verified & True/, `${label} has Verified & True`);
  assert.match(text, /Know before you buy/, `${label} has Know before you buy`);
  assert.match(text, /buyer-first/i, `${label} is buyer-first`);
  assert.match(
    text,
    /never say "I don't know" about this/i,
    `${label} forbids I-don't-know on origin`,
  );
  assertLotStory(text, label);
  assertWhyCreated(text, label);
  assertVerifiedTruePromise(text, label);
}

test("origin KB is David Hansen / RvFOX / Verified & True / buyer-first", () => {
  assert.equal(RVFOX_FOUNDER, "David Hansen");
  assert.equal(RVFOX_FOUNDER_LAST, "Hansen");
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

test("founder KB locks Hansen, lot story, why created, Verified & True promise", () => {
  assertHansenSpelling(DAVID_HANSEN_STORY, "DAVID_HANSEN_STORY");
  assertLotStory(DAVID_HANSEN_STORY, "DAVID_HANSEN_STORY");
  assertNoIDontKnow(DAVID_HANSEN_STORY, "DAVID_HANSEN_STORY");

  assertWhyCreated(WHY_RVFOX_CREATED, "WHY_RVFOX_CREATED");
  assert.match(WHY_RVFOX_CREATED, /privately owned dealerships/i);
  assertNoIDontKnow(WHY_RVFOX_CREATED, "WHY_RVFOX_CREATED");

  assertVerifiedTruePromise(VERIFIED_TRUE_PROMISE, "VERIFIED_TRUE_PROMISE");
  assertNoIDontKnow(VERIFIED_TRUE_PROMISE, "VERIFIED_TRUE_PROMISE");

  for (const [label, text] of [
    ["ABOUT_RVFOX", ABOUT_RVFOX],
    ["ORIGIN_STORY_BLOCK", ORIGIN_STORY_BLOCK],
    ["formatOriginGroundingBlock", formatOriginGroundingBlock()],
  ] as const) {
    assertHansenSpelling(text, label);
    assertLotStory(text, label);
    assertWhyCreated(text, label);
    assertVerifiedTruePromise(text, label);
    assertNoIDontKnow(text, label);
  }
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
    /I'm RV Grok — ask me anything\. Name a year, make, and model for the spec report/,
  );
  assert.doesNotMatch(src("speechPolicy.ts"), /Only say "Let me check that"/);
  assert.doesNotMatch(src("originStory.ts"), /[Dd]ialaBot/);
  const ownLot = src("ownLotInventory.test.ts");
  assert.match(ownLot, /DialaBot stays out/);
});
