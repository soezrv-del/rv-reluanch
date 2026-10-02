import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { RV_GROK_ATTITUDE } from "./attitude.ts";
import { RV_GROK_LEAN_CORE } from "./speechPolicy.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

test("one voice: fun, playful, and the same words in the core", () => {
  assert.match(RV_GROK_ATTITUDE, /fun and playful/);
  assert.match(RV_GROK_ATTITUDE, /enjoy knowing the coach/);
  assert.match(RV_GROK_ATTITUDE, /enjoy buying/);
  assert.match(RV_GROK_ATTITUDE, /Never invent a weight/);
  assert.match(RV_GROK_LEAN_CORE, /fun and playful/);
  assert.match(RV_GROK_LEAN_CORE, /enjoy knowing the coach/);
  assert.match(RV_GROK_LEAN_CORE, /The first sentence is the answer/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /Dry, not cute/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /No hype/);
  assert.doesNotMatch(RV_GROK_ATTITUDE, /We'll figure this out/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /We'll figure this out/);
});

test("attitude module stays intact; standing prompts stay lean", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  assert.match(src("attitude.ts"), /RV_GROK_ATTITUDE/);
  assert.match(src("originStory.ts"), /ABOUT_RVFOX/);
  assert.match(src("carfaxPositioning.ts"), /CARFAX_VS_RVFOX/);
  assert.match(src("grounding.ts"), /formatOriginGroundingBlock/);
  assert.match(src("grounding.ts"), /formatCarfaxGroundingBlock/);
  assert.doesNotMatch(prompts, /RV_GROK_ATTITUDE/);
  assert.doesNotMatch(voice, /RV_GROK_ATTITUDE/);
  assert.doesNotMatch(prompts, /ABOUT_RVFOX/);
  assert.doesNotMatch(voice, /ABOUT_RVFOX/);
  assert.doesNotMatch(prompts, /CARFAX_VS_RVFOX/);
  assert.doesNotMatch(voice, /CARFAX_VS_RVFOX/);
});

test("intro, stall, origin, CARFAX, Hansen stay intact; DialaBot stays out", () => {
  const speech = src("speechPolicy.ts");
  const origin = src("originStory.ts");
  const carfax = src("carfaxPositioning.ts");
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");

  assert.match(speech, /RV_GROK_SESSION_INTRO = "I'm RvGrok"/);
  assert.doesNotMatch(
    speech,
    /I'm RV Grok — ask me anything\. Name a year, make, and model for the spec report/,
  );
  assert.match(speech, /VOICE_RESEARCH_HOLD_PHRASE = "give me one second"/);
  assert.doesNotMatch(speech, /Only say "Let me check that"/);
  assert.match(origin, /David Hansen/);
  assert.match(origin, /bring back the fun/);
  assert.match(origin, /Verified & True/);
  assert.match(carfax, /Complements, not substitutes/);
  assert.match(carfax, /lousy motorhome buying tool/);
  assert.match(speech, /SESSION_INTRO_POLICY/);
  assert.match(speech, /VOICE_RESEARCH_HOLD_PHRASE/);
  assert.match(speech, /RV_GROK_LEAN_CORE/);
  assert.match(prompts, /RV_GROK_LEAN_CORE/);
  assert.match(voice, /RV_GROK_LEAN_CORE/);
  assert.doesNotMatch(src("attitude.ts"), /[Dd]ialaBot/);
  assert.doesNotMatch(prompts, /[Dd]ialaBot/);
  assert.doesNotMatch(voice, /[Dd]ialaBot/);
  const ownLot = src("ownLotInventory.test.ts");
  assert.match(ownLot, /DialaBot stays out/);
});
