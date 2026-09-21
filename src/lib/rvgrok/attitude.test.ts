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

test("chat, agent, and voice prompts carry the attitude standing block", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  assert.match(prompts, /RV_GROK_ATTITUDE/, "chat/agent interpolates attitude");
  assert.match(voice, /RV_GROK_ATTITUDE/, "voice interpolates attitude");
  assert.match(prompts, /ABOUT_RVFOX/);
  assert.match(prompts, /CARFAX_VS_RVFOX/);
  assert.match(voice, /ABOUT_RVFOX/);
  assert.match(voice, /CARFAX_VS_RVFOX/);
  assert.equal(
    (prompts.match(/\$\{RV_GROK_ATTITUDE\}/g) || []).length,
    2,
    "chat and agent both interpolate the attitude block",
  );
  assert.equal(
    (voice.match(/\$\{RV_GROK_ATTITUDE\}/g) || []).length,
    1,
    "voice interpolates the attitude block once",
  );
});

test("intro, stall, origin, CARFAX, Hansen stay intact; DialaBot stays out", () => {
  const speech = src("speechPolicy.ts");
  const origin = src("originStory.ts");
  const carfax = src("carfaxPositioning.ts");
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");

  assert.match(
    speech,
    /I'm RV Grok — give me year, make, and model, and I'll speak the spec report on that exact coach/,
  );
  assert.match(speech, /VOICE_RESEARCH_HOLD_PHRASE = "give me one second"/);
  assert.doesNotMatch(speech, /Only say "Let me check that"/);
  assert.match(origin, /David Hansen/);
  assert.match(origin, /bring back the fun/);
  assert.match(origin, /Verified & True/);
  assert.match(carfax, /Complements, not substitutes/);
  assert.match(carfax, /lousy motorhome buying tool/);
  assert.match(prompts, /SESSION_INTRO_POLICY/);
  assert.match(prompts, /VOICE_RESEARCH_HOLD_PHRASE/);
  assert.match(voice, /SESSION_INTRO_POLICY/);
  assert.match(voice, /VOICE_RESEARCH_HOLD_PHRASE/);
  assert.doesNotMatch(src("attitude.ts"), /[Dd]ialaBot/);
  assert.doesNotMatch(prompts, /[Dd]ialaBot/);
  assert.doesNotMatch(voice, /[Dd]ialaBot/);
  const ownLot = src("ownLotInventory.test.ts");
  assert.match(ownLot, /DialaBot stays out/);
});
