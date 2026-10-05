/**
 * Oct 4, 6:04 PM PT: she said "What's got you thinking this morning?" and
 * "I don't have a clock". The session instructions carry the Pacific time.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { buildRealtimeSessionUpdate, voiceLocalTimeLine } from "./liveVoice.ts";

const EVENING = new Date("2026-10-05T01:04:00Z"); // Sun Oct 4, 6:04 PM PDT

test("local time line is Pacific, not UTC or the device zone", () => {
  const line = voiceLocalTimeLine(EVENING);
  assert.match(line, /Sunday, October 4, 2026/, line);
  assert.match(line, /6:04\s?PM/, line);
  assert.match(line, /America\/Los_Angeles/, line);
  assert.match(line, /Never say you do not have a clock/, line);
});

test("session instructions include the local time", () => {
  const msg = buildRealtimeSessionUpdate("ara", 1, "", "", "", undefined, "", EVENING) as {
    session: { instructions: string };
  };
  assert.match(msg.session.instructions, /LOCAL TIME: It is Sunday, October 4, 2026[^\n]*6:04\s?PM Pacific/, "clock line");
  const morning = buildRealtimeSessionUpdate("ara", 1, "", "", "", undefined, "", new Date("2026-10-05T16:30:00Z")) as {
    session: { instructions: string };
  };
  assert.match(morning.session.instructions, /Monday, October 5, 2026[^\n]*9:30\s?AM Pacific/, "morning clock line");
});

test("a bad clock adds no line", () => {
  assert.equal(voiceLocalTimeLine(new Date(Number.NaN)), "");
});
