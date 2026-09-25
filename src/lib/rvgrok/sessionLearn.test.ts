import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { applyQueuePendingLesson } from "./promptLessons.ts";
import {
  lessonFromCorrection,
  pendingLessonsFromUserLines,
  userLinesForMemory,
} from "./sessionLearn.ts";

test("voice memory keeps what he said and drops fragments and status", () => {
  const lines = userLinesForMemory([
    "Listening…",
    "Newmar factory",
    "Newmar factory",
    "What can you tell me about the Newmar factory?",
    "That's all you got?",
  ]);
  assert.deepEqual(lines, [
    "What can you tell me about the Newmar factory?",
    "That's all you got?",
  ]);
});

test("a correction becomes one pending lesson and is not injected by itself", () => {
  assert.equal(
    lessonFromCorrection("Why did you repeat me?"),
    "Never speak his sentence back.",
  );
  const pending = pendingLessonsFromUserLines(
    [],
    ["That's all you got?", "That's all you got?"],
    "2026-09-25T00:00:00.000Z",
  );
  assert.equal(pending.length, 1);
  assert.match(pending[0]!.text, /who owns it/);
  const again = applyQueuePendingLesson(pending, pending[0]!.text);
  assert.equal(again.length, 1);
});

test("her spoken specs are not a lesson and voice memory does not write coach knowledge", () => {
  assert.equal(
    lessonFromCorrection(
      "The Lineage H is a Mercedes-Benz 2.0L with lithium lithium.",
    ),
    null,
  );
  const route = readFileSync(
    new URL("../../routes/api/rvgrok.memory.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /source === "voice"/);
  assert.match(route, /userLinesForMemory/);
  assert.match(route, /queuePendingPromptLesson/);
  assert.doesNotMatch(route, /upsertCoachKnowledge/);
  const standing = readFileSync(
    new URL("./promptLessonsStore.ts", import.meta.url),
    "utf8",
  );
  const inject = standing.slice(
    standing.indexOf("export async function readStandingLessonsBlock"),
    standing.indexOf("export async function readPromptLessonsStatus"),
  );
  assert.doesNotMatch(inject, /prompt_lessons_pending/);
});
