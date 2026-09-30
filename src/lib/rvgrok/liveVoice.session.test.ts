import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRealtimeSessionUpdate,
  buildSessionIntroResponse,
  isNativeRealtimeTool,
  REALTIME_SESSION_TOOLS,
} from "./liveVoice.ts";
import { buildVoiceGrounding } from "./grounding.ts";
import { RV_SYSTEM_PROMPT } from "./prompts.ts";
import { RV_GROK_LEAN_CORE } from "./speechPolicy.ts";
import {
  isIgnorableVoiceTranscript,
  isSameLotLine,
  repeatsLotLine,
} from "./voiceTurnGate.ts";
import {
  DEFAULT_VOICE,
  GROK_VOICES,
  PCM_SAMPLE_RATE,
  avatarForVoice,
} from "./voice.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("unlocked session.update does not inject standing CATALOG GAP", () => {
  const standing = /CATALOG GAP — no verified row is loaded/;
  const unlocked = buildRealtimeSessionUpdate("ara");
  const unlockedSession = unlocked.session as { instructions: string };
  assert.doesNotMatch(unlockedSession.instructions, standing);
  const factsEmpty = buildRealtimeSessionUpdate(
    "ara",
    1,
    buildVoiceGrounding({ facts: null }),
  );
  const factsSession = factsEmpty.session as { instructions: string };
  assert.doesNotMatch(factsSession.instructions, standing);
  assert.match(factsSession.instructions, /native web_search/);
  assert.match(factsSession.instructions, /I'm RvGrok/);
});

test("session.update enables native web_search on the Realtime session", () => {
  const msg = buildRealtimeSessionUpdate("ara", 1.25);
  assert.equal(msg.type, "session.update");
  const session = msg.session as {
    instructions: string;
    voice: string;
    tools: Array<{ type: string; name?: string }>;
    turn_detection: { type: string };
    audio: {
      input: { format: { type: string; rate: number } };
      output: { format: { type: string; rate: number }; speed: number };
    };
  };
  assert.deepEqual(session.tools, [...REALTIME_SESSION_TOOLS]);
  assert.equal(session.tools[0]?.type, "web_search");
  assert.equal(
    (session.tools[1] as { name?: string } | undefined)?.name,
    "query_lot",
  );
  assert.match(session.instructions, /query_lot/);
  assert.equal(session.voice, "ara");
  assert.equal(session.turn_detection.type, "server_vad");
  assert.equal(session.audio.input.format.type, "audio/pcm");
  assert.equal(session.audio.input.format.rate, PCM_SAMPLE_RATE);
  assert.equal(session.audio.output.format.type, "audio/pcm");
  assert.equal(session.audio.output.format.rate, PCM_SAMPLE_RATE);
  assert.equal(session.audio.output.speed, 1.25);
  assert.match(session.instructions, /native web_search/);
  assert.match(session.instructions, /He did not found RV Country/);
  assert.match(session.instructions, /Paul Evert founded RV Country in 1961/);
  assert.match(
    session.instructions,
    /never mix in details from the app's own notes/,
  );
  assert.match(
    session.instructions,
    /experienced RV salesman's pocket/,
  );
  assert.match(session.instructions, /closest saved pin when one exists/);
  assert.doesNotMatch(session.instructions, /the catalog pin in this turn wins/);
  assert.match(session.instructions, /give me one second/);
  assert.match(session.instructions, /only when research is actually running/);
  assert.doesNotMatch(session.instructions, /LIVE VOICE ACKNOWLEDGMENT/);
  assert.doesNotMatch(session.instructions, /rotating acknowledgment/);
  assert.match(session.instructions, /I'm RvGrok/);
  const introAt = session.instructions.indexOf("Never repeat this intro.");
  const micAt = session.instructions.indexOf("say that last part again");
  const energyAt = session.instructions.indexOf("VOICE LOT ENERGY");
  assert.ok(micAt > introAt, "mic rules stay at the end of the voice prompt");
  assert.ok(energyAt > micAt, "lot energy sits with the mic rules, not in chat");
  assert.doesNotMatch(session.instructions, /STANDING LESSONS \(desk SoT\)/);
  assert.doesNotMatch(session.instructions, /sales-floor wingman/);
  assert.doesNotMatch(session.instructions, /CARFAX-style coach report/);
  assert.doesNotMatch(session.instructions, /Their first name is/);
});

test("lot energy coaches one spoken line and stays out of chat", () => {
  const msg = buildRealtimeSessionUpdate("ara");
  const session = msg.session as { instructions: string };
  assert.match(
    session.instructions,
    /never invent a spec, price, or lot unit to stay upbeat/,
  );
  assert.match(session.instructions, /We'll figure this out/);
  assert.match(session.instructions, /good thing you checked — here's how we solve it/);
  assert.match(session.instructions, /Never lead with "that's a problem\."/);
  assert.match(session.instructions, /It does not mean you go silent/);
  assert.match(session.instructions, /Hand him ONE line he can say out loud\. Then stop\./);
  assert.match(session.instructions, /The sit is a look, not a buy/);
  assert.match(
    session.instructions,
    /I'm not asking you to buy it\. Two minutes, no credit app/,
  );
  assert.match(session.instructions, /what do I have to do today/);
  assert.match(session.instructions, /this one will be gone/);
  assert.match(session.instructions, /your wife will love it/);
  assert.match(session.instructions, /Never invent a number to get them in the chair/);
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /VOICE LOT ENERGY/);
  assert.doesNotMatch(RV_SYSTEM_PROMPT, /VOICE LOT ENERGY/);
  assert.doesNotMatch(RV_SYSTEM_PROMPT, /just looking/);
});

test("named visitor cold-open is Hello, first name — not I'm RvGrok", () => {
  const msg = buildRealtimeSessionUpdate("ara", 1, "", "David Hansen");
  const session = msg.session as { instructions: string };
  assert.match(session.instructions, /Their first name is David/);
  assert.match(session.instructions, /Welcome them back by that first name once/);
  assert.match(session.instructions, /address them by David/);
  assert.doesNotMatch(session.instructions, /only occasionally/);
  assert.doesNotMatch(session.instructions, /not every turn/);
  assert.match(session.instructions, /Say exactly: Hello, David/);
  assert.doesNotMatch(session.instructions, /Say exactly: I'm RvGrok/);
  assert.doesNotMatch(session.instructions, /I'm RvGrok, David/);
  assert.equal(session.instructions.includes(`I'm RvGrok, David`), false);
  const cue = buildSessionIntroResponse("David Hansen") as {
    response: { instructions: string };
  };
  assert.match(cue.response.instructions, /Hello, David/);
  assert.doesNotMatch(cue.response.instructions, /I'm RvGrok/);
});

test("visitor memory is additive and does not change the spoken intro", () => {
  const memory =
    "VISITOR MEMORY (this unlocked phone only). Use silently for continuity. Never dump it in the greeting. Cold-open stays exactly I'm RvGrok.\nProfile: Prefers compact answers. Watching Newmar.";
  const msg = buildRealtimeSessionUpdate("ara", 1, "", "David", memory);
  const session = msg.session as { instructions: string };
  assert.match(session.instructions, /VISITOR MEMORY/);
  assert.match(session.instructions, /Prefers compact answers/);
  assert.ok(
    session.instructions.indexOf("You are RV Grok") <
      session.instructions.indexOf("VISITOR MEMORY"),
  );
  assert.doesNotMatch(session.instructions, /STANDING LESSONS/);
  assert.match(session.instructions, /Say exactly: Hello, David/);
  assert.doesNotMatch(session.instructions, /Say exactly: I'm RvGrok/);
  assert.doesNotMatch(session.instructions, /I'm RvGrok, David/);
});

test("catalog lock session.update still ships voice, VAD, audio, and web_search", () => {
  const lock = "VERIFIED CATALOG — 2022 Newmar Dutch Star 4369";
  const msg = buildRealtimeSessionUpdate("eve", 1, lock);
  const session = msg.session as {
    instructions: string;
    voice: string;
    tools: Array<{ type: string; name?: string }>;
    turn_detection: { type: string; threshold: number };
    audio: { output: { speed: number } };
  };
  assert.equal(msg.type, "session.update");
  assert.equal(session.voice, "eve");
  assert.deepEqual(session.tools, [...REALTIME_SESSION_TOOLS]);
  assert.equal(
    (session.tools[1] as { name?: string } | undefined)?.name,
    "query_lot",
  );
  assert.equal(session.turn_detection.type, "server_vad");
  assert.equal(session.turn_detection.threshold, 0.45);
  assert.equal(session.audio.output.speed, 1);
  assert.match(session.instructions, /2022 Newmar Dutch Star 4369/);
  assert.match(session.instructions, /native web_search/);
});

test("standing lessons no longer stack the retired desk bullets", () => {
  const skipped = buildRealtimeSessionUpdate("ara", 1, "", "", "", "");
  const skippedSession = skipped.session as { instructions: string };
  assert.doesNotMatch(skippedSession.instructions, /STANDING LESSONS \(desk SoT\)/);
  const defaults = buildRealtimeSessionUpdate("ara");
  const defaultSession = defaults.session as { instructions: string };
  assert.doesNotMatch(defaultSession.instructions, /STANDING LESSONS \(desk SoT\)/);
  assert.doesNotMatch(defaultSession.instructions, /Sparse name use/);
  assert.doesNotMatch(defaultSession.instructions, /CARFAX-style/);
  assert.match(defaultSession.instructions, /experienced RV salesman's pocket/);
});

test("onopen / lock-refresh path still calls buildRealtimeSessionUpdate", () => {
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  assert.match(realtime, /ws\.onopen[\s\S]*buildRealtimeSessionUpdate/);
  assert.match(realtime, /pushCatalogLockToSession[\s\S]*buildRealtimeSessionUpdate/);
  assert.match(realtime, /decideVoiceWebResearch/);
  assert.match(realtime, /formatVoiceWebSearchInjection/);
  assert.match(realtime, /ensureCatalogLoaded/);
  assert.match(realtime, /visitorFirstName/);
  assert.match(realtime, /setVisitorFirstName/);
  assert.match(realtime, /buildSessionIntroResponse\(this\.visitorFirstName\)/);
  assert.match(realtime, /takeTokenVisitorMemory/);
  assert.match(realtime, /takeTokenStandingLessons/);
  assert.match(realtime, /visitorMemory/);
  assert.match(realtime, /standingLessons/);
  assert.match(realtime, /response\.function_call_arguments\.done/);
  assert.match(realtime, /\/api\/rvgrok\/query-lot/);
  assert.match(realtime, /function_call_output/);
  assert.doesNotMatch(realtime, /None\. Unknown tool/);
  assert.match(realtime, /isNativeRealtimeTool/);
  assert.match(realtime, /unrecognized tool/);
  assert.equal(isNativeRealtimeTool("web_search"), true);
  assert.equal(isNativeRealtimeTool("query_lot"), false);
});

test("session.update injects the active screen guide and forbids a blind-screen excuse", () => {
  const msg = buildRealtimeSessionUpdate(
    "ara",
    1,
    "PIN GVWR 39600",
    "",
    "",
    undefined,
    "Lot",
  );
  const instructions = (msg.session as { instructions: string }).instructions;
  assert.match(instructions, /APP SCREEN AWARENESS/);
  assert.match(instructions, /Never say you can't see his screen/);
  assert.match(instructions, /ACTIVE SCREEN: Lot/);
  assert.match(instructions, /FEATURED REPORT/);
  assert.match(instructions, /PIN GVWR 39600/);
  assert.doesNotMatch(instructions, /DID YOU MEAN\?/);
  assert.doesNotMatch(instructions, /You cannot see the screen/);
  assert.doesNotMatch(instructions, /I can't see the screen/);
  const bare = buildRealtimeSessionUpdate("ara");
  const bareText = (bare.session as { instructions: string }).instructions;
  assert.match(bareText, /APP SCREEN AWARENESS/);
  assert.doesNotMatch(bareText, /SCREEN GUIDE:/);
});

test("Altair is a male voice and session.update sends that id", () => {
  const altair = GROK_VOICES.find((v) => v.id === "altair");
  assert.ok(altair);
  assert.equal(altair.gender, "male");
  assert.equal(GROK_VOICES.find((v) => v.id === "sal")?.gender, "male");
  assert.equal(GROK_VOICES.find((v) => v.id === "helix")?.gender, "male");
  const msg = buildRealtimeSessionUpdate("altair");
  assert.equal((msg.session as { voice: string }).voice, "altair");
  assert.equal(DEFAULT_VOICE, "eve");
  assert.equal(avatarForVoice("ara"), "/assets/brand/icon-rvgrok-female.png");
  assert.equal(avatarForVoice("eve"), "/assets/brand/icon-rvgrok-female.png");
  for (const id of ["leo", "rex", "sal", "helix", "altair"]) {
    assert.equal(avatarForVoice(id), "/assets/brand/icon-rvgrok-male.png");
  }
  assert.equal(
    avatarForVoice({ gender: "neutral" }),
    "/assets/brand/icon-rvgrok.png",
  );
  const publicDir = join(root, "../../../public/assets/brand");
  assert.equal(existsSync(join(publicDir, "icon-rvgrok-female.png")), true);
  assert.equal(existsSync(join(publicDir, "icon-rvgrok-male.png")), true);
});

test("empty or noise transcripts do not start a lot reply, and a lot line is not said twice", () => {
  assert.equal(isIgnorableVoiceTranscript(""), true);
  assert.equal(isIgnorableVoiceTranscript("   "), true);
  assert.equal(isIgnorableVoiceTranscript("uh"), true);
  assert.equal(isIgnorableVoiceTranscript("hmm"), true);
  assert.equal(isIgnorableVoiceTranscript("[noise]"), true);
  assert.equal(isIgnorableVoiceTranscript("those aren't toy haulers"), false);
  assert.equal(isIgnorableVoiceTranscript("Recommendations."), false);
  const line = "Matching units: 8 Keystone Montana High Country, stk 47709.";
  assert.equal(isSameLotLine(line, line), true);
  assert.equal(isSameLotLine(line, `None. ${line}`), true);
  assert.equal(repeatsLotLine(`${line} ${line}`), true);
  assert.equal(repeatsLotLine(line), false);
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  assert.match(realtime, /isIgnorableVoiceTranscript/);
  assert.match(realtime, /cancelAutoReply/);
  assert.match(realtime, /repeatsLotLine/);
  const session = buildRealtimeSessionUpdate("ara").session as { instructions: string };
  assert.match(session.instructions, /at most 3 units/);
  assert.match(session.instructions, /Never say None and then list units/);
  assert.match(session.instructions, /Do not describe this screen/);
  assert.match(session.instructions, /Recommendations/);
});
