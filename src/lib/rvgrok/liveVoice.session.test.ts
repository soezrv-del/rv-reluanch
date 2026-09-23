import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildRealtimeSessionUpdate,
  buildSessionIntroResponse,
  REALTIME_SESSION_TOOLS,
} from "./liveVoice.ts";
import { buildVoiceGrounding } from "./grounding.ts";
import { PCM_SAMPLE_RATE } from "./voice.ts";

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
    tools: Array<{ type: string }>;
    turn_detection: { type: string };
    audio: {
      input: { format: { type: string; rate: number } };
      output: { format: { type: string; rate: number }; speed: number };
    };
  };
  assert.deepEqual(session.tools, [{ type: "web_search" }]);
  assert.deepEqual([...REALTIME_SESSION_TOOLS], [{ type: "web_search" }]);
  assert.equal(session.voice, "ara");
  assert.equal(session.turn_detection.type, "server_vad");
  assert.equal(session.audio.input.format.type, "audio/pcm");
  assert.equal(session.audio.input.format.rate, PCM_SAMPLE_RATE);
  assert.equal(session.audio.output.format.type, "audio/pcm");
  assert.equal(session.audio.output.format.rate, PCM_SAMPLE_RATE);
  assert.equal(session.audio.output.speed, 1.25);
  assert.match(session.instructions, /native web_search/);
  assert.match(session.instructions, /sales-floor wingman/);
  assert.match(session.instructions, /CARFAX-style coach report/);
  assert.match(session.instructions, /give me one second/);
  assert.match(session.instructions, /I'm RvGrok/);
  assert.match(session.instructions, /STANDING LESSONS \(desk SoT\)/);
  assert.match(session.instructions, /Never invent OEM numbers/);
  assert.doesNotMatch(session.instructions, /Their first name is/);
});

test("named visitor cold-open is Hello, first name — not I'm RvGrok", () => {
  const msg = buildRealtimeSessionUpdate("ara", 1, "", "David Hansen");
  const session = msg.session as { instructions: string };
  assert.match(session.instructions, /Their first name is David/);
  assert.match(session.instructions, /only occasionally/);
  assert.match(session.instructions, /not every turn/);
  assert.match(session.instructions, /never as a mechanical prefix/);
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
    session.instructions.indexOf("STANDING LESSONS") <
      session.instructions.indexOf("VISITOR MEMORY"),
  );
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
    tools: Array<{ type: string }>;
    turn_detection: { type: string; threshold: number };
    audio: { output: { speed: number } };
  };
  assert.equal(msg.type, "session.update");
  assert.equal(session.voice, "eve");
  assert.deepEqual(session.tools, [{ type: "web_search" }]);
  assert.equal(session.turn_detection.type, "server_vad");
  assert.equal(session.turn_detection.threshold, 0.45);
  assert.equal(session.audio.output.speed, 1);
  assert.match(session.instructions, /2022 Newmar Dutch Star 4369/);
  assert.match(session.instructions, /native web_search/);
});

test("explicit empty standing lessons skip the block; omitted uses defaults", () => {
  const skipped = buildRealtimeSessionUpdate("ara", 1, "", "", "", "");
  const skippedSession = skipped.session as { instructions: string };
  assert.doesNotMatch(skippedSession.instructions, /STANDING LESSONS \(desk SoT\)/);
  const defaults = buildRealtimeSessionUpdate("ara");
  const defaultSession = defaults.session as { instructions: string };
  assert.match(defaultSession.instructions, /STANDING LESSONS \(desk SoT\)/);
  assert.ok(
    defaultSession.instructions.indexOf("You are RV Grok") <
      defaultSession.instructions.indexOf("STANDING LESSONS"),
  );
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
});
