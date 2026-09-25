import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AGENT_SYSTEM_PROMPT,
  RV_SYSTEM_PROMPT,
} from "./prompts.ts";
import {
  RV_GROK_LEAN_CORE,
  sessionIntroLine,
  visitorPersonalizationBlock,
} from "./speechPolicy.ts";
import { RV_VOICE_INSTRUCTIONS } from "./voice.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

test("chat, agent, and voice share David's lean standing core", () => {
  assert.equal(RV_SYSTEM_PROMPT, RV_GROK_LEAN_CORE);
  assert.equal(AGENT_SYSTEM_PROMPT, RV_GROK_LEAN_CORE);
  assert.ok(
    RV_VOICE_INSTRUCTIONS.startsWith(RV_GROK_LEAN_CORE),
    "voice instructions start with the lean core",
  );
  assert.match(RV_VOICE_INSTRUCTIONS, /CAMERA: say what is actually in frame/);

  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const live = src("liveVoice.ts");
  const speech = src("speechPolicy.ts");

  assert.match(prompts, /RV_GROK_LEAN_CORE/);
  assert.match(voice, /RV_GROK_LEAN_CORE/);
  assert.match(live, /RV_VOICE_INSTRUCTIONS/);
  assert.match(speech, /RV_GROK_LEAN_CORE/);
});

test("lean core is David's verbatim standing prompt", () => {
  assert.match(
    RV_GROK_LEAN_CORE,
    /the assistant in an experienced RV salesman's pocket/,
  );
  assert.match(RV_GROK_LEAN_CORE, /You are RV Grok/);
  assert.match(RV_GROK_LEAN_CORE, /You also answer the rest of what he asks/);
  assert.match(
    RV_GROK_LEAN_CORE,
    /Never invent GVWR, UVW, payload, hitch weight, price, tank sizes, or a recall/,
  );
  assert.match(RV_GROK_LEAN_CORE, /the catalog pin in this turn wins/);
  assert.match(RV_GROK_LEAN_CORE, /not a menu/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /Pin every verified field/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /sales-floor wingman/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /CARFAX-style coach report/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /only occasionally/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /If Matched is 0/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /on our lot/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /say that last part again/);
});

test("voice rules stay in the lean core; DialaBot stays out", () => {
  assert.match(RV_GROK_LEAN_CORE, /one natural follow-up/);
  assert.match(RV_GROK_LEAN_CORE, /No hype/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /rotating acknowledgment/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /never the same phrase twice in a row/);

  const voice = src("voice.ts");
  assert.match(voice, /CAMERA:/);
  assert.match(voice, /GROK_VOICES/);
  assert.match(voice, /LIVE_VOICE_KEY/);
  assert.match(voice, /createPushToTalkRecognition/);
  assert.match(voice, /getSpeechRecognitionCtor/);
  assert.match(voice, /webkitSpeechRecognition/);

  for (const [label, text] of [
    ["prompts.ts", src("prompts.ts")],
    ["voice.ts", voice],
    ["liveVoice.ts", src("liveVoice.ts")],
  ] as const) {
    assert.doesNotMatch(text, /DialaBot/, `${label} does not mention DialaBot`);
    assert.doesNotMatch(text, /OWN-LOT STOCK/, `${label} has no own-lot stock block`);
    assert.doesNotMatch(text, /OWN-LOT INVENTORY/, `${label} has no pasted own-lot card`);
    assert.doesNotMatch(text, /ACCURACY FIRST/, `${label} dropped ACCURACY FIRST`);
  }
  const speechFile = src("speechPolicy.ts");
  assert.doesNotMatch(speechFile, /DialaBot/);
  assert.doesNotMatch(speechFile, /OWN-LOT STOCK/);
  assert.doesNotMatch(speechFile, /ACCURACY FIRST/);
  assert.doesNotMatch(speechFile, /If Matched is 0/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /on our lot/);
  assert.doesNotMatch(speechFile, /OWN-LOT INVENTORY/);
});

test("standing prompts dropped the lecture stack", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");

  for (const [label, text] of [
    ["prompts.ts", prompts],
    ["voice.ts", voice],
  ] as const) {
    assert.doesNotMatch(text, /SALES FLOOR — EVERY QUESTION/, label);
    assert.doesNotMatch(text, /MARKET VALUE \/ PRICING/, label);
    assert.doesNotMatch(text, /UPGRADES \(when they ask/, label);
    assert.doesNotMatch(text, /REPAIR \/ DIAGNOSE/, label);
    assert.doesNotMatch(text, /KNOWN LANDMINES/, label);
    assert.doesNotMatch(text, /ultimate authoritative RV information source/, label);
    assert.doesNotMatch(text, /ABOUT_RVFOX/, label);
    assert.doesNotMatch(text, /CARFAX_VS_RVFOX/, label);
    assert.doesNotMatch(text, /RV_GROK_ATTITUDE/, label);
    assert.doesNotMatch(text, /COACH_REPORT_CHAT_RULE/, label);
    assert.doesNotMatch(text, /HONESTY_STANDING_POLICY/, label);
    assert.doesNotMatch(text, /ANSWER_NOW_POLICY/, label);
  }
});

test("visitor personalization is a small hook and named cold-open is Hello", () => {
  assert.equal(sessionIntroLine(""), "I'm RvGrok");
  assert.equal(sessionIntroLine(undefined), "I'm RvGrok");
  assert.equal(sessionIntroLine("David Hansen"), "Hello, David");
  assert.equal(visitorPersonalizationBlock(""), "");
  assert.equal(visitorPersonalizationBlock(undefined), "");
  const block = visitorPersonalizationBlock("David Hansen");
  assert.match(block, /Their first name is David/);
  assert.match(block, /Hello, David/);
  assert.match(block, /Welcome them back by that first name once/);
  assert.match(block, /address them by David/);
  assert.doesNotMatch(block, /only occasionally/);
  assert.doesNotMatch(block, /not every turn/);
  assert.doesNotMatch(block, /I'm RvGrok, David/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /VISITOR:/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /Their first name is/);
  assert.match(src("speechPolicy.ts"), /RV_GROK_SESSION_INTRO = "I'm RvGrok"/);
  assert.match(src("speechPolicy.ts"), /sessionIntroLine/);
  assert.match(src("../../routes/api/rvgrok.ts"), /visitorFirstName/);
  assert.match(src("../../routes/api/rvgrok.ts"), /visitorPersonalizationBlock/);
  assert.match(src("../../routes/api/rvgrok.ts"), /loadVisitorMemoryBlockFromRequest/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /VISITOR MEMORY/);
  assert.match(src("stream.ts"), /visitorFirstName/);
  assert.match(src("liveVoice.ts"), /visitorPersonalizationBlock/);
});

test("speechPolicy still owns intro, hold, and sales-mission detectors", () => {
  const speech = src("speechPolicy.ts");
  assert.match(speech, /RV_GROK_SESSION_INTRO = "I'm RvGrok"/);
  assert.match(speech, /VOICE_RESEARCH_HOLD_PHRASE = "give me one second"/);
  assert.match(speech, /SALES_MISSION_POLICY/);
  assert.match(speech, /HONESTY_STANDING_POLICY/);
  assert.match(speech, /This is SALES/);
  assert.match(speech, /Every question matters/);
  assert.match(speech, /WHATEVER the customer asks/);
  assert.match(speech, /I only focus on this coach/);
  assert.match(speech, /I only focus on RVs/);
  assert.match(speech, /That\\?'s outside my scope/);
  assert.match(speech, /sticky lock that ignores a new question/);
  assert.match(speech, /This might take a second to get that for you/);
  assert.match(speech, /VOICE_RESEARCH_HOLD_ALT/);
  assert.match(speech, /ESTIMATE_STANDING_POLICY/);
  assert.match(speech, /isForbiddenScopeNarrow/);
  assert.match(
    speech,
    /ACCURACY_AIM_POLICY =\s*\n\s*"Get as accurate as possible, but not gospel\."/,
  );
  assert.doesNotMatch(speech, /Only say "Let me check that"/);
  assert.doesNotMatch(
    speech,
    /I'm RV Grok — ask me anything\. Name a year, make, and model for the spec report/,
  );
  assert.doesNotMatch(speech, /Web search is last resort/);
  assert.doesNotMatch(speech, /GAP over invent/);
  assert.match(src("estimatePolicy.ts"), /MUST run WEB RESEARCH this turn before answering/);
  assert.match(src("originStory.ts"), /David Hansen/);
  assert.match(src("originStory.ts"), /buyer-first/);
});

test("market comps machinery stays in research code, not the standing prompt", () => {
  const webSearch = src("webSearch.ts");
  const webIntent = src("webIntent.ts");
  const voiceWeb = src("voiceWeb.ts");

  assert.match(webSearch, /year ±2/);
  assert.match(webSearch, /Low \/ Average \/ High/);
  assert.match(webSearch, /competitor-latest/);
  assert.match(webSearch, /nightly/);
  assert.match(webSearch, /sample listings CSV/);
  assert.match(webSearch, /NADA/);
  assert.match(voiceWeb, /Low \/ Average \/ High/);
  assert.match(voiceWeb, /competitor-latest/);
  assert.match(webIntent, /looksLikeMarketValueQuestion/);
  assert.match(webIntent, /year ±2/);
  assert.match(src("speechPolicy.ts"), /give me one second/);
  assert.doesNotMatch(src("prompts.ts"), /Facts public-listing comps/);
  assert.doesNotMatch(src("voice.ts"), /Facts public-listing comps/);
});

test("sales floor: no scope-narrow or general-assistant refuse", () => {
  const prompts = src("prompts.ts");
  const voice = src("voice.ts");
  const live = src("liveVoice.ts");

  for (const [label, text] of [
    ["prompts.ts", prompts],
    ["voice.ts", voice],
    ["liveVoice.ts", live],
  ] as const) {
    assert.doesNotMatch(
      text,
      /not a general assistant/i,
      `${label} must not refuse as a general assistant`,
    );
    assert.doesNotMatch(
      text,
      /redirect off-topic/i,
      `${label} must not redirect off-topic`,
    );
    assert.doesNotMatch(
      text,
      /Redirect lifestyle, classifieds, and general-assistant asks/,
      `${label} must not redirect lifestyle asks back to the coach`,
    );
  }

  assert.match(RV_GROK_LEAN_CORE, /Do not turn a factory, brand, or campground question into a year-make-model demand/);
  assert.match(src("voiceWeb.ts"), /give me one second/);
  assert.doesNotMatch(src("voiceWeb.ts"), /Let me check that/);
});
