import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildRealtimeSessionUpdate } from "./liveVoice.ts";
import { formatVoiceSpecEngineSpeech } from "./voiceSpecTurn.ts";
import {
  LIVE_VOICE_ACK_POOL,
  advanceLiveVoiceAck,
  createLiveVoiceAckState,
  liveVoiceAckSessionLine,
  nextAckFromPool,
  prefixLiveVoiceAck,
  takeLiveVoiceAck,
  withLiveVoiceAckInstructions,
} from "./voiceAck.ts";

const root = dirname(fileURLToPath(import.meta.url));

const REQUIRED = [
  "Of course, right away.",
  "Absolutely, one moment.",
  "Sure thing, I'll be right back.",
  "On it.",
  "You got it, give me a second.",
  "Right away.",
  "Happy to — one moment.",
];

test("ack pool keeps the short openers and does not repeat inside the pool", () => {
  for (const phrase of REQUIRED) {
    assert.ok(LIVE_VOICE_ACK_POOL.includes(phrase), phrase);
  }
  assert.equal(new Set(LIVE_VOICE_ACK_POOL).size, LIVE_VOICE_ACK_POOL.length);
  for (const phrase of LIVE_VOICE_ACK_POOL) {
    assert.ok(phrase.length < 48, phrase);
  }
});

test("rotation never uses the same acknowledgment twice in a row", () => {
  const state = createLiveVoiceAckState();
  let prev = "";
  for (let i = 0; i < LIVE_VOICE_ACK_POOL.length * 3; i++) {
    const ack = takeLiveVoiceAck(state);
    assert.equal(takeLiveVoiceAck(state), "", "one ack per question");
    assert.notEqual(ack, "");
    assert.notEqual(ack, prev);
    assert.equal(ack, LIVE_VOICE_ACK_POOL[i % LIVE_VOICE_ACK_POOL.length]);
    prev = ack;
    const next = advanceLiveVoiceAck(state);
    assert.notEqual(next, ack);
    assert.equal(next, LIVE_VOICE_ACK_POOL[(i + 1) % LIVE_VOICE_ACK_POOL.length]);
  }
});

test("a VAD answer that never takes still rotates, and a duplicate candidate is skipped", () => {
  const state = createLiveVoiceAckState();
  const first = state.armed;
  const second = advanceLiveVoiceAck(state);
  const third = advanceLiveVoiceAck(state);
  assert.notEqual(first, second);
  assert.notEqual(second, third);
  assert.equal(second, LIVE_VOICE_ACK_POOL[1]);
  assert.equal(third, LIVE_VOICE_ACK_POOL[2]);

  const cursor = { last: null as string | null };
  const pool = ["On it.", "On it.", "Right away."];
  assert.equal(nextAckFromPool(pool, cursor), "On it.");
  assert.equal(nextAckFromPool(pool, cursor), "Right away.");
  assert.equal(nextAckFromPool(pool, cursor), "On it.");
  assert.notEqual(cursor.last, "Right away.");
});

test("prefix and instructions put the ack before the substance", () => {
  assert.equal(
    prefixLiveVoiceAck("GVWR is 18,186 pounds.", "On it."),
    "On it. GVWR is 18,186 pounds.",
  );
  assert.equal(prefixLiveVoiceAck("On it. Already there.", "On it."), "On it. Already there.");
  assert.equal(prefixLiveVoiceAck("body", ""), "body");
  const wrapped = withLiveVoiceAckInstructions("Answer the question.", "Right away.");
  assert.match(wrapped, /first spoken words are exactly "Right away\."/);
  assert.ok(wrapped.indexOf("Right away.") < wrapped.indexOf("Answer the question."));
  assert.equal(withLiveVoiceAckInstructions("Answer the question.", " "), "Answer the question.");
});

test("session line pins the VAD opener and stays off the intro-only update", () => {
  const line = liveVoiceAckSessionLine("Sure, here we go.");
  assert.match(line, /Sure, here we go\./);
  assert.match(line, /Never jump straight into the substance/);
  assert.match(line, /SPEC ENGINE SCRIPT/);
  assert.equal(liveVoiceAckSessionLine("  "), "");
  const withAck = buildRealtimeSessionUpdate(
    "ara",
    1,
    "",
    "",
    "",
    "",
    "Sure, here we go.",
  );
  const session = withAck.session as { instructions: string };
  assert.match(session.instructions, /LIVE VOICE ACKNOWLEDGMENT/);
  assert.match(session.instructions, /Sure, here we go\./);
  assert.match(session.instructions, /Say exactly: I'm RvGrok/);
  const plain = buildRealtimeSessionUpdate("ara");
  const plainSession = plain.session as { instructions: string };
  assert.doesNotMatch(plainSession.instructions, /LIVE VOICE ACKNOWLEDGMENT/);
});

test("Live Voice answer paths prefix the shared ack; hold and intro do not", () => {
  const realtime = readFileSync(join(root, "realtime.ts"), "utf8");
  const live = readFileSync(join(root, "liveVoice.ts"), "utf8");
  const spec = readFileSync(join(root, "voiceSpecTurn.ts"), "utf8");
  const ack = readFileSync(join(root, "voiceAck.ts"), "utf8");
  assert.match(
    realtime,
    /formatVoiceSpecEngineSpeech\(\s*tagged,\s*pending\.transcript,\s*takeLiveVoiceAck\(this\.ackState\),/,
  );
  assert.ok((realtime.match(/this\.voiced\(/g) || []).length >= 4);
  assert.match(realtime, /private voiced\(base: string\)/);
  assert.match(realtime, /withLiveVoiceAckInstructions/);
  assert.match(realtime, /this\.ackState\.armed/);
  const holdStart = realtime.indexOf("private speakResearchHold()");
  const holdEnd = realtime.indexOf("private finishResearchHoldIfNeeded");
  const hold = realtime.slice(holdStart, holdEnd);
  assert.match(hold, /VOICE_RESEARCH_HOLD_INSTRUCTIONS/);
  assert.doesNotMatch(hold, /takeLiveVoiceAck|this\.voiced/);
  assert.match(live, /liveVoiceAckSessionLine/);
  assert.match(live, /ackPhrase\?: string/);
  assert.match(spec, /prefixLiveVoiceAck/);
  assert.match(spec, /say that first, once, then the specs/);
  assert.doesNotMatch(ack, /[Gg]emini|[Dd]ialaBot/);
  assert.doesNotMatch(spec, /[Gg]emini|[Dd]ialaBot/);
  assert.doesNotMatch(realtime, /[Dd]ialaBot/);
  const speech = formatVoiceSpecEngineSpeech(null, "uvw", "On it.");
  assert.match(speech, /^On it\. /);
});
