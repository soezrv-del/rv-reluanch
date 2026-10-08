import assert from "node:assert/strict";
import test from "node:test";
import {
  CHAT_HISTORY_WINDOW,
  CHAT_IDLE_MS,
  chatIdleDue,
  takeChatHistory,
} from "./chatSession.ts";

test("chat history sent to the assistant is the last ten messages", () => {
  const all = Array.from({ length: 14 }, (_, i) => i);
  assert.equal(CHAT_HISTORY_WINDOW, 10);
  assert.deepEqual(takeChatHistory(all), [4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  assert.deepEqual(takeChatHistory([1, 2]), [1, 2]);
});

test("the chat session closes after four minutes without input", () => {
  assert.equal(CHAT_IDLE_MS, 4 * 60 * 1000);
  const at = 1_000;
  assert.equal(chatIdleDue(at, at + CHAT_IDLE_MS - 1), false);
  assert.equal(chatIdleDue(at, at + CHAT_IDLE_MS), true);
});
