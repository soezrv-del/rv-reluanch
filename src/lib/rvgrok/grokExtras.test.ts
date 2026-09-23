import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectGrokExtraKinds,
  extrasToOffer,
  grokExtrasForPrompt,
  shouldShowGrokExtra,
  voiceSpecExtraPrompts,
} from "./grokExtras.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

const LINEAGE = {
  year: "2026",
  make: "Grand Design",
  model: "Lineage Series F",
  floorplan: "31ZW",
  type: "Super C",
};

test("spec report alone does not unlock Grok extras", () => {
  const q = "2026 Grand Design Lineage 31ZW spec report";
  assert.deepEqual(detectGrokExtraKinds(q), []);
  assert.deepEqual(grokExtrasForPrompt(q, LINEAGE), []);
});

test("Want a video? gates the video extra like the Facts card", () => {
  const q = "Want a video of the 2026 Lineage 31ZW?";
  assert.deepEqual(detectGrokExtraKinds(q), ["video"]);
  assert.equal(shouldShowGrokExtra("video", q, LINEAGE), true);
  assert.equal(shouldShowGrokExtra("nhtsa", q, LINEAGE), false);
  assert.equal(shouldShowGrokExtra("video", q, { year: "2026" }), false);
});

test("recalls / market / reviews / maintenance / VIN / share are prompt-gated", () => {
  assert.deepEqual(detectGrokExtraKinds("any NHTSA recalls on this chassis?"), [
    "nhtsa",
  ]);
  assert.deepEqual(detectGrokExtraKinds("what's this coach worth on the market?"), [
    "market",
  ]);
  assert.deepEqual(detectGrokExtraKinds("owner reviews?"), ["reviews"]);
  assert.deepEqual(detectGrokExtraKinds("maintenance schedule please"), [
    "maintenance",
  ]);
  assert.deepEqual(detectGrokExtraKinds("decode this VIN 1F65F5DY0N0A12345"), [
    "vin",
  ]);
  assert.deepEqual(detectGrokExtraKinds("share this coach"), ["share"]);
  assert.equal(
    shouldShowGrokExtra("nhtsa", "any recalls?", LINEAGE),
    true,
  );
});

test("voice spec card offers extras as prompts without a keyword", () => {
  const q = "2026 Grand Design Lineage Series F 31ZW UVW dry weight";
  assert.deepEqual(grokExtrasForPrompt(q, LINEAGE), []);
  assert.deepEqual(voiceSpecExtraPrompts(LINEAGE), [
    "nhtsa",
    "market",
    "video",
    "reviews",
    "maintenance",
  ]);
  assert.deepEqual(extrasToOffer({ query: q, coach: LINEAGE }), []);
  assert.deepEqual(
    extrasToOffer({ query: q, coach: LINEAGE, offerVoiceExtras: true }),
    ["nhtsa", "market", "video", "reviews", "maintenance"],
  );
  assert.deepEqual(voiceSpecExtraPrompts({ year: "2026" }), []);
});

test("Facts still auto-loads extras; Grok mounts the prompt rail", () => {
  const facts = src("../../components/rvfax/RvDetail.tsx");
  const grok = src("../../components/rvgrok/RvGrokApp.tsx");
  const bubble = src("../../components/rvgrok/MessageBubble.tsx");
  assert.match(facts, /shouldShowRvVideoPrompt/);
  assert.match(facts, /fetchRecallsViaApi/);
  assert.match(facts, /getMaintenanceSchedule/);
  assert.match(facts, /getMockReviews/);
  assert.match(facts, /RvShareKit/);
  assert.match(grok, /GrokExtrasRail|grokExtrasForPrompt|offerVoiceExtras/);
  assert.match(bubble, /GrokExtrasRail/);
  assert.match(bubble, /offerVoiceExtras/);
  assert.match(src("../../components/rvgrok/GrokExtrasRail.tsx"), /extrasToOffer/);
  assert.match(src("../../components/rvgrok/GrokExtrasRail.tsx"), /useState<Phase>\("prompt"\)/);
  assert.doesNotMatch(src("grokExtras.ts"), /[Gg]emini/);
  assert.doesNotMatch(src("grokExtras.ts"), /[Dd]ialaBot/);
});
