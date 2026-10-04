import test from "node:test";
import assert from "node:assert/strict";
import {
  initialLotReplyGate,
  lotAnswerAlreadyGiven,
  lotAnswerInstructions,
  reduceLotReply,
  LOT_REPLY_WINDOW_MS,
} from "./voiceTurnGate";

test("after a lot result, the first reply speaks and a second one is dropped", () => {
  let s = reduceLotReply(initialLotReplyGate, { type: "tool-output" }).state;
  const first = reduceLotReply(s, { type: "response-created", now: 1000 });
  assert.equal(first.action, "allow");
  s = first.state;
  assert.equal(lotAnswerAlreadyGiven(s), true);
  const second = reduceLotReply(s, { type: "response-created", now: 3000 });
  assert.equal(second.action, "cancel");
});

test("his next real question resets it, and a dropped reply to it is asked again", () => {
  let s = reduceLotReply(initialLotReplyGate, { type: "tool-output" }).state;
  s = reduceLotReply(s, { type: "response-created", now: 1000 }).state;
  s = reduceLotReply(s, { type: "response-created", now: 2000 }).state;
  const turn = reduceLotReply(s, { type: "user-turn" });
  assert.equal(turn.action, "reask");
  assert.equal(reduceLotReply(turn.state, { type: "response-created", now: 2500 }).action, "allow");
});

test("no lot result, no gate; and the window expires", () => {
  assert.equal(reduceLotReply(initialLotReplyGate, { type: "response-created", now: 1 }).action, "allow");
  let s = reduceLotReply(initialLotReplyGate, { type: "tool-output" }).state;
  s = reduceLotReply(s, { type: "response-created", now: 1000 }).state;
  assert.equal(
    reduceLotReply(s, { type: "response-created", now: 1000 + LOT_REPLY_WINDOW_MS + 1 }).action,
    "allow",
  );
  assert.equal(reduceLotReply(initialLotReplyGate, { type: "user-turn" }).action, null);
});

test("her lot instructions ask for her own words, once, ending with the details offer", () => {
  const text = lotAnswerInstructions("Matching units: 2 Winnebago View, all used.");
  assert.match(text, /own words/);
  assert.match(text, /once/);
  assert.match(text, /Do not say the words "Matching units"/);
  assert.match(text, /asking if he wants the details/);
  assert.match(text, /2 Winnebago View/);
});
