import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  RV_GROK_ATTITUDE,
  RV_GROK_CONFIDENCE,
  RV_GROK_PROTECTIVE,
  RV_GROK_SOLVE_IT,
} from "./attitude.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function assertNoDoom(text: string, label: string) {
  assert.match(text, /Never doom/, `${label} forbids doom`);
  assert.match(
    text,
    /Never "that's a problem."/,
    `${label} forbids that's-a-problem default`,
  );
  assert.doesNotMatch(
    text,
    /(?:lead with|default to|open with) (?:doom|bad news|that's a problem)/i,
    `${label} must not default to doom`,
  );
}

function assertProtectiveFraming(text: string, label: string) {
  assert.match(text, /good thing you checked/, `${label} protective phrase`);
  assert.match(text, /protective, not scary/, `${label} protective not scary`);
  assert.match(text, /Relieved, not anxious/, `${label} relieved not anxious`);
}

function assertAttitudeVoice(text: string, label: string) {
  assert.match(text, /We'll figure this out/, `${label} confidence energy`);
  assert.match(text, /here's how we solve it/, `${label} solve-it framing`);
  assert.match(text, /brings the fun back/, `${label} fun-bringing mission`);
  assert.match(text, /not just camping/, `${label} whole buying experience`);
  assert.match(text, /compliance lecture/, `${label} not a lecture`);
  assert.match(text, /dodge a bullet/, `${label} celebrates good finds`);
  assert.match(text, /corporate-speak/, `${label} bans corporate-speak`);
  assert.match(text, /showroom, phone in hand/, `${label} tight showroom answers`);
  assert.match(text, /hype past credibility/, `${label} no hype past credibility`);
  assert.match(
    text,
    /sharpest tool in the room/,
    `${label} stays the sharpest tool`,
  );
  assert.match(
    text,
    /never invent facts to stay upbeat/i,
    `${label} never invents to stay upbeat`,
  );
  assertNoDoom(text, label);
  assertProtectiveFraming(text, label);
}

test("attitude is optimistic lot-friend — no doom, protective framing", () => {
  assert.equal(RV_GROK_CONFIDENCE, "We'll figure this out");
  assert.equal(RV_GROK_SOLVE_IT, "here's how we solve it");
  assert.equal(RV_GROK_PROTECTIVE, "good thing you checked");
  assertAttitudeVoice(RV_GROK_ATTITUDE, "RV_GROK_ATTITUDE");
  assert.match(RV_GROK_ATTITUDE, /ATTITUDE \(every answer — behavioral, not facts\)/);
  assert.match(RV_GROK_ATTITUDE, /Hansen/);
  assert.match(RV_GROK_ATTITUDE, /CARFAX/);
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
