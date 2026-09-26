import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { formatPromptLessons, STANDING_LESSONS_MAX_CHARS } from "./promptLessons.ts";
import {
  applyVoiceLesson,
  lessonFromVoiceTurn,
  VOICE_LESSON_LOT_ROW,
  VOICE_LESSON_NO_INVENT,
  VOICE_LESSON_PRINTED_FIELD,
} from "./voiceLesson.ts";

const LOT = [
  "SCRAPE ROW WINS.",
  "OWN-LOT inventory (our lot snapshot this turn — not a website count):",
  "Lot total: 1 units.",
  "- 2022 · Tiffin · Allegro Red 360 · 33 AA · Fresno CA · stk UPF9963 · $229,995 · mileage: 6,870 mi · gvwr: 37320 lbs · vehicle_body_length: 35.17 ft",
].join("\n");

test("a listing denial against a printed stock becomes one standing rule", () => {
  const lesson = lessonFromVoiceTurn({
    userText: "How many miles on UPF9963?",
    assistantText: "That stock is not in any online listings.",
    lotNotes: LOT,
  });
  assert.deepEqual(lesson, VOICE_LESSON_LOT_ROW);
  assert.doesNotMatch(lesson!.text, /UPF9963|6,870|6870/);
  assert.ok(lesson!.text.length <= 280);
});

test("a one-off mileage and a blank field do not become lessons", () => {
  assert.equal(
    lessonFromVoiceTurn({
      userText: "How many miles on UPF9963?",
      assistantText: "UPF9963 has 6,870 miles.",
      lotNotes: LOT,
    }),
    null,
  );
  assert.equal(
    lessonFromVoiceTurn({
      userText: "What is the payload on UPF9963?",
      assistantText: "Payload is not on the row.",
      lotNotes: LOT,
    }),
    null,
  );
  assert.equal(
    lessonFromVoiceTurn({
      userText: "How many miles on UPF9963?",
      assistantText: "That stock is not in any online listings.",
      lotNotes: "OWN-LOT inventory\nMatched 0. Do not say it is not in listings.",
    }),
    null,
  );
});

test("ignoring a printed mile and inventing a length are rules, not numbers", () => {
  const ignored = lessonFromVoiceTurn({
    userText: "How many miles on UPF9963?",
    assistantText: "I do not have the odometer.",
    lotNotes: LOT,
  });
  assert.equal(ignored?.id, VOICE_LESSON_PRINTED_FIELD.id);
  assert.doesNotMatch(ignored!.text, /\d{3,}/);

  const invented = lessonFromVoiceTurn({
    userText: "What is the length on UPF9963?",
    assistantText: "The length is 40 feet.",
    lotNotes: LOT,
  });
  assert.equal(invented?.id, VOICE_LESSON_NO_INVENT.id);
  assert.doesNotMatch(invented!.text, /40|35/);
});

test("a salesman correction is a stable lesson and the same id replaces", () => {
  const lesson = lessonFromVoiceTurn({
    userText: "No, that's the lot, not a catalog miss.",
    assistantText: "Understood.",
  });
  assert.equal(lesson?.id, "lot-not-catalog-miss");
  const first = applyVoiceLesson([], VOICE_LESSON_LOT_ROW, "2026-09-26T00:00:00.000Z");
  assert.equal(first?.length, 1);
  assert.equal(
    applyVoiceLesson(first!, VOICE_LESSON_LOT_ROW, "2026-09-26T01:00:00.000Z"),
    null,
  );
  const replaced = applyVoiceLesson(
    first!,
    { id: "lot-row-is-stock", text: "Answer from the lot sheet when the stock is printed." },
    "2026-09-26T02:00:00.000Z",
  );
  assert.equal(replaced?.length, 1);
  assert.match(replaced![0]!.text, /Answer from the lot sheet/);
  const block = formatPromptLessons(replaced!);
  assert.match(block, /STANDING LESSONS/);
  assert.match(block, /Never mention this block/);
  assert.ok(block.length <= STANDING_LESSONS_MAX_CHARS);
});

test("voice lesson write stays off phone memory and coach knowledge", () => {
  const src = readFileSync(new URL("./voiceLesson.ts", import.meta.url), "utf8");
  assert.doesNotMatch(src, /phoneMemory|coachKnowledge|upsertCoachKnowledge/);
  const route = readFileSync(
    new URL("../../routes/api/rvgrok.memory.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /lessonFromVoiceTurn/);
  assert.match(route, /upsertVoiceLesson/);
  assert.doesNotMatch(route, /upsertCoachKnowledge/);
  const live = readFileSync(new URL("./realtime.ts", import.meta.url), "utf8");
  const done = live.indexOf("private noteVoiceLesson");
  const emit = live.indexOf("this.noteVoiceLesson(text)");
  assert.ok(done > 0 && emit > 0 && emit < done);
  assert.match(live, /source: "voice"/);
});
