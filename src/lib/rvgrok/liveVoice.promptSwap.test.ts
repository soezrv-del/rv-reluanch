import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  buildRealtimeSessionUpdate,
  buildSessionIntroResponse,
  LIVE_VOICE_PROMPT,
  QUERY_LOT_TOOL,
} from "./liveVoice.ts";
import { RV_GROK_LEAN_CORE } from "./speechPolicy.ts";
import { RV_SYSTEM_PROMPT } from "./prompts.ts";

const root = dirname(fileURLToPath(import.meta.url));

function instructionsFor(...args: Parameters<typeof buildRealtimeSessionUpdate>): string {
  return (buildRealtimeSessionUpdate(...args).session as { instructions: string }).instructions;
}

test("Live Voice prompt uses the voice-guide sections once each", () => {
  for (const heading of [
    "ROLE & PERSONA",
    "OBJECTIVE",
    "CONVERSATION FLOW",
    "GUARDRAILS",
    "VOICE STYLE",
    "CRITICAL",
  ]) {
    const count = LIVE_VOICE_PROMPT.split(`${heading}\n`).length - 1;
    assert.equal(count, 1, `${heading} appears once`);
  }
  const text = instructionsFor("ara");
  assert.ok(text.startsWith(LIVE_VOICE_PROMPT), "session instructions open with the Live Voice prompt");
});

test("Live Voice instructions carry the key rules", () => {
  const text = instructionsFor("ara");
  const rules: RegExp[] = [
    /The first sentence is the answer/,
    /Be candid when a floorplan, brand, or deal is weak/,
    /Off-topic asks \(the weather, a headline, a drive, his day\): answer them\. Do not drag the talk back to inventory/,
    /Ask about a truck only when he named a towable or a truck/,
    /Photo: describe only what is in it/,
    /Camera: say only what is actually in frame/,
    /"How does this app work\?"[^\n]*answer from the app's real behavior/,
    /If this turn says to say only a script, say exactly that and stop/,
    /Before query_lot or web_search, say one short hold line \("give me one second"\) and make the tool call in that same turn/,
    /A named visitor gets one welcome, then is addressed by first name/,
    /Phone memory is for continuity only\. It is never spec truth/,
    /hand him one line he can say, then stop\. No second ask/,
    /On matched 0, say the friendly miss line and the closest units it returns\. Never a bare "none"/,
    /only in the listing text, tags, or page text is "may have it, check the floorplan" and is not counted/,
    /a unit counts only when a spec-sheet field confirms it/,
    /Our unit's price comes from query_lot\. The web is only for MSRP or a market range/,
    /a saved pin from this session, else the exact figure web search found and its source\. Otherwise say "not verified", and never estimate/,
    /English only/,
  ];
  for (const rule of rules) assert.match(text, rule, `missing rule ${rule}`);
});

test("Live Voice instructions drop the pin guess, the session-start line, and the greeting", () => {
  for (const text of [
    instructionsFor("ara"),
    instructionsFor("ara", 1, "", "David Hansen", "Profile: Watching Newmar."),
  ]) {
    assert.doesNotMatch(text, /closest pin/i);
    assert.doesNotMatch(text, /closest saved pin/i);
    assert.doesNotMatch(text, /85/);
    assert.doesNotMatch(text, /SESSION START/);
    assert.doesNotMatch(text, /Say exactly/);
    assert.doesNotMatch(text, /Speak only these words/);
    assert.doesNotMatch(text, /Hello, David/);
    assert.doesNotMatch(text, /I'm RvGrok/);
  }
  const cue = buildSessionIntroResponse("David Hansen") as { response: { instructions: string } };
  assert.match(cue.response.instructions, /Hello, David/);
  const plain = buildSessionIntroResponse() as { response: { instructions: string } };
  assert.match(plain.response.instructions, /I'm RvGrok/);
});

test("Live Voice instructions stay short", () => {
  assert.ok(LIVE_VOICE_PROMPT.length < 5000, `prompt is ${LIVE_VOICE_PROMPT.length} chars`);
  const bare = instructionsFor("ara", 1, "", "", "", "", undefined, new Date("2026-10-04T19:30:00-07:00"));
  assert.ok(bare.length < 8000, `bare session instructions are ${bare.length} chars`);
});

test("Live Voice instructions are not the chat lean core", () => {
  const text = instructionsFor("ara");
  assert.notEqual(text, RV_GROK_LEAN_CORE);
  assert.equal(text.includes(RV_GROK_LEAN_CORE), false, "lean core is not embedded");
  assert.equal(LIVE_VOICE_PROMPT.includes(RV_GROK_LEAN_CORE), false, "prompt does not embed lean core");
});

test("query_lot description keeps parameter docs and drops the speech rules", () => {
  const tool = QUERY_LOT_TOOL as {
    description: string;
    parameters: { properties: Record<string, { description?: string }> };
  };
  for (const speech of [
    /Speak the summary/,
    /Never say None/,
    /Say none only when/,
    /did_you_mean/,
    /Never invent a unit/,
    /Never tell the user/,
    /Then offer more/,
    /Call this tool once per question/,
  ]) {
    assert.doesNotMatch(tool.description, speech, `tool description still has ${speech}`);
  }
  assert.match(tool.description, /not web search/);
  for (const key of ["query", "condition", "status"]) {
    assert.ok(tool.parameters.properties[key], `parameter ${key} stays`);
  }
});

test("chat core is unchanged and Live Voice no longer imports the old voice rule stack", () => {
  assert.equal(RV_SYSTEM_PROMPT, RV_GROK_LEAN_CORE);
  assert.match(RV_GROK_LEAN_CORE, /You are RV Grok/);
  assert.match(RV_GROK_LEAN_CORE, /closest saved pin when one exists/);
  const live = readFileSync(join(root, "liveVoice.ts"), "utf8");
  for (const old of ["RV_VOICE_INSTRUCTIONS", "VOICE_MIC_RULES", "VOICE_LOT_ENERGY", "sessionIntroLine", "visitorPersonalizationBlock"]) {
    assert.equal(live.includes(old), false, `liveVoice.ts no longer uses ${old}`);
  }
});
