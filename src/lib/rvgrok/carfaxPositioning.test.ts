import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CARFAX_POSITIONING,
  CARFAX_POSITIONING_BLOCK,
  CARFAX_PRODUCT,
  CARFAX_PROOF_CAMPAIGN,
  CARFAX_PROOF_COMPONENT,
  CARFAX_PROOF_UNITS,
  CARFAX_VS_RVFOX,
  formatCarfaxGroundingBlock,
  looksLikeCarfaxQuestion,
} from "./carfaxPositioning.ts";
import { needsWebFallback } from "./webIntent.ts";
import { decideVoiceWebResearch } from "./voiceWeb.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

const CARFAX_ASKS = [
  "CARFAX",
  "What is CARFAX?",
  "Is there a Carfax for motorhomes?",
  "Carfax for motorhomes",
  "RvFOX vs CARFAX",
  "CARFAX vs RvFOX",
  "How does this compare to Carfax?",
  "Are you like Carfax?",
  "Do I need a Carfax?",
  "Is Carfax good for a motorhome?",
];

const NOT_CARFAX_ASKS = [
  "What's the HP on a 2023 Entegra Vision?",
  "Tell me about the 2027 Grand Design Lineage",
  "Who built this?",
  "What's the origin story?",
];

function assertNoOverclaim(text: string, label: string) {
  assert.match(text, /Complements, not substitutes/i, `${label} complements`);
  assert.match(
    text,
    /Never invent CARFAX-scale history/,
    `${label} forbids inventing a ledger`,
  );
  assert.match(
    text,
    /Never say RvFOX replaces CARFAX/,
    `${label} forbids replace-CARFAX`,
  );
  assert.match(
    text,
    /OVERCLAIM if it implies a 40-year event ledger/,
    `${label} marks 40-year ledger as overclaim`,
  );
  assert.doesNotMatch(
    text,
    /(?:we are|RvFOX is|this is) (?:the |a )?CARFAX/i,
    `${label} must not claim to be CARFAX`,
  );
  assert.doesNotMatch(
    text,
    /(?:we|RvFOX) (?:have|keep|offer|provide).{0,40}40-year/i,
    `${label} must not claim a 40-year ledger`,
  );
}

function assertStandingFacts(text: string, label: string) {
  assert.match(text, /lousy motorhome buying tool/, `${label} chassis-vs-coach`);
  assert.match(text, /Ford/, `${label} names Ford chassis`);
  assert.match(text, /Freightliner/, `${label} names Freightliner`);
  assert.match(text, /Spartan/, `${label} names Spartan`);
  assert.match(text, /Winnebago/, `${label} names Winnebago coach`);
  assert.match(text, /Tiffin/, `${label} names Tiffin`);
  assert.match(text, /Newmar/, `${label} names Newmar`);
  assert.match(text, /should I buy this coach/, `${label} buy question`);
  assert.match(text, /50-state payment/, `${label} 50-state payment`);
  assert.match(text, /RVchex/, `${label} RVchex in the stack`);
  assert.match(text, /paid inspection/, `${label} inspection`);
  assert.match(text, /07V031000/, `${label} NHTSA campaign`);
  assert.match(text, /Dometic/, `${label} Dometic fridge`);
  assert.match(text, /Country Coach/, `${label} Country Coach count`);
  assertNoOverclaim(text, label);
}

test("CARFAX KB is chassis ledger + coach buy tool — never an overclaim", () => {
  assert.equal(CARFAX_PRODUCT, "CARFAX");
  assert.equal(CARFAX_PROOF_CAMPAIGN, "07V031000");
  assert.equal(CARFAX_PROOF_COMPONENT, "Dometic two-door fridge boiler-tube fire");
  assert.equal(CARFAX_PROOF_UNITS, "~2406 Country Coach");
  assertStandingFacts(CARFAX_VS_RVFOX, "CARFAX_VS_RVFOX");
  assertStandingFacts(CARFAX_POSITIONING, "CARFAX_POSITIONING");
  assertStandingFacts(CARFAX_POSITIONING_BLOCK, "CARFAX_POSITIONING_BLOCK");
  assertStandingFacts(formatCarfaxGroundingBlock(), "formatCarfaxGroundingBlock");
  assert.match(CARFAX_POSITIONING_BLOCK, /OFFICIAL CARFAX VS RVFOX/);
});

test("CARFAX / Carfax for motorhomes / vs CARFAX asks match and never web-hold", () => {
  for (const q of CARFAX_ASKS) {
    assert.equal(looksLikeCarfaxQuestion(q), true, q);
    assert.equal(needsWebFallback(null, q), false, q);
    assert.equal(
      decideVoiceWebResearch({ transcript: q, specs: null }).action,
      "pass",
      q,
    );
  }
  for (const q of NOT_CARFAX_ASKS) {
    assert.equal(looksLikeCarfaxQuestion(q), false, q);
  }
});

test("CARFAX ask injects official positioning — no invented ledger", () => {
  const block = formatCarfaxGroundingBlock();
  assertStandingFacts(block, "carfax grounding block");
  assert.doesNotMatch(block, /I don't have that/);
  const grounding = src("grounding.ts");
  assert.match(grounding, /withOriginBlock/);
  assert.match(grounding, /formatCarfaxGroundingBlock/);
  assert.match(grounding, /looksLikeCarfaxQuestion/);
  assert.match(grounding, /standingKnowledgeBlocks/);
});

test("chat, voice, and grounding wire CARFAX positioning; DialaBot stays out", () => {
  assert.match(src("prompts.ts"), /CARFAX_VS_RVFOX/);
  assert.match(src("voice.ts"), /CARFAX_VS_RVFOX/);
  assert.match(src("grounding.ts"), /formatCarfaxGroundingBlock/);
  assert.match(src("grounding.ts"), /looksLikeCarfaxQuestion/);
  assert.match(src("webIntent.ts"), /looksLikeCarfaxQuestion/);
  assert.match(src("voiceWeb.ts"), /looksLikeCarfaxQuestion/);
  assert.doesNotMatch(src("carfaxPositioning.ts"), /[Dd]ialaBot/);
  assert.doesNotMatch(src("prompts.ts"), /[Dd]ialaBot/);
  const ownLot = src("ownLotInventory.test.ts");
  assert.match(ownLot, /DialaBot stays out/);
});
