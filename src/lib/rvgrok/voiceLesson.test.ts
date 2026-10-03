import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  applyAddLesson,
  applyDeleteLesson,
  formatPromptLessons,
  mergePromptLessons,
  STANDING_LESSONS_MAX_CHARS,
  type PromptLesson,
} from "./promptLessons.ts";
import {
  applyVoiceLesson,
  lessonFromVoiceTurn,
  VOICE_LESSON_LOT_NOT_MISS,
  VOICE_LESSON_LOT_ROW,
  VOICE_LESSON_NO_INVENT,
  VOICE_LESSON_PRINTED_FIELD,
} from "./voiceLesson.ts";

const LOT = [
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

function adminLesson(n: number, len: number): PromptLesson {
  const head = `Admin rule ${String.fromCharCode(97 + n)}: `;
  return {
    id: `admin-test-${String.fromCharCode(97 + n)}`,
    text: (head + "keep this desk rule word for word ".repeat(20)).slice(0, len).trim(),
    updatedAt: `2026-01-0${n + 1}T00:00:00.000Z`,
  };
}

/** Admin lessons that nearly fill the 1,800-char block. */
function nearlyFullAdmin(): PromptLesson[] {
  const rows = [0, 1, 2, 3, 4, 5].map((n) => adminLesson(n, 270));
  const used = formatPromptLessons(rows).length;
  assert.ok(used > STANDING_LESSONS_MAX_CHARS - 150 && used <= STANDING_LESSONS_MAX_CHARS);
  return rows;
}

test("a voice lesson never drops or truncates admin lessons near the cap", () => {
  const admin = nearlyFullAdmin();
  const next = applyVoiceLesson(admin, VOICE_LESSON_LOT_ROW, "2026-09-27T00:00:00.000Z");
  const result = next ?? admin;
  for (const row of admin) {
    const kept = result.find((l) => l.id === row.id);
    assert.ok(kept, `admin lesson ${row.id} was removed`);
    assert.equal(kept.text, row.text);
  }
  // It does not fit, so nothing is saved rather than evicting admin lessons.
  assert.equal(next, null);
  const block = formatPromptLessons(mergePromptLessons(result));
  for (const row of admin) assert.ok(block.includes(row.text));
});

test("a voice lesson that fits is added and every admin lesson is kept in order", () => {
  const admin = [adminLesson(0, 200), adminLesson(1, 200)];
  const next = applyVoiceLesson(admin, VOICE_LESSON_LOT_ROW, "2026-09-27T00:00:00.000Z");
  assert.ok(next);
  assert.deepEqual(
    next.filter((l) => l.id.startsWith("admin-")),
    admin,
  );
  assert.ok(next.some((l) => l.id === VOICE_LESSON_LOT_ROW.id));
});

test("updating an existing voice lesson id replaces it in place", () => {
  const admin = [adminLesson(0, 200), adminLesson(1, 200)];
  const stored: PromptLesson[] = [
    admin[0]!,
    { ...VOICE_LESSON_NO_INVENT, updatedAt: "2026-09-01T00:00:00.000Z" },
    admin[1]!,
  ];
  const next = applyVoiceLesson(
    stored,
    { id: VOICE_LESSON_NO_INVENT.id, text: "Do not invent a spec. Say it is not on the row." },
    "2026-09-27T00:00:00.000Z",
  );
  assert.ok(next);
  assert.deepEqual(
    next.map((l) => l.id),
    stored.map((l) => l.id),
  );
  assert.equal(next[1]!.text, "Do not invent a spec. Say it is not on the row.");
  assert.equal(next[1]!.updatedAt, "2026-09-27T00:00:00.000Z");
  assert.deepEqual(next[0], admin[0]);
  assert.deepEqual(next[2], admin[1]);
});

test("a voice lesson evicts an older voice lesson but never an admin one", () => {
  const admin = [0, 1, 2, 3, 4].map((n) => adminLesson(n, 275));
  const oldVoice: PromptLesson = {
    ...VOICE_LESSON_LOT_NOT_MISS,
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
  const newerVoice: PromptLesson = {
    ...VOICE_LESSON_NO_INVENT,
    updatedAt: "2026-09-10T00:00:00.000Z",
  };
  const stored = [newerVoice, oldVoice, ...admin];
  // Precondition: the block is full enough that a third voice line cannot just be added.
  assert.ok(
    formatPromptLessons([VOICE_LESSON_LOT_ROW as PromptLesson, ...stored], Infinity).length >
      STANDING_LESSONS_MAX_CHARS,
  );
  const next = applyVoiceLesson(stored, VOICE_LESSON_LOT_ROW, "2026-09-27T00:00:00.000Z");
  assert.ok(next);
  assert.ok(next.some((l) => l.id === VOICE_LESSON_LOT_ROW.id));
  assert.ok(!next.some((l) => l.id === oldVoice.id), "oldest voice lesson is evicted first");
  assert.deepEqual(
    next.filter((l) => l.id.startsWith("admin-")),
    admin,
  );
  const block = formatPromptLessons(mergePromptLessons(next));
  assert.ok(block.length <= STANDING_LESSONS_MAX_CHARS);
  for (const row of admin) assert.ok(block.includes(row.text));
});

test("a voice draft cannot overwrite an admin lesson id", () => {
  const admin = [adminLesson(0, 120)];
  assert.equal(
    applyVoiceLesson(admin, { id: admin[0]!.id, text: "Overwrite the admin rule." }),
    null,
  );
});

test("admin add and delete still work alongside voice lessons", () => {
  const voice = applyVoiceLesson([], VOICE_LESSON_LOT_ROW, "2026-09-27T00:00:00.000Z")!;
  const added = applyAddLesson(voice, "Always confirm the stock number before quoting.");
  assert.ok(added.ok);
  assert.equal(added.stored.length, 2);
  assert.equal(added.stored[1]!.text, "Always confirm the stock number before quoting.");
  assert.equal(added.stored[0]!.id, VOICE_LESSON_LOT_ROW.id);
  const deleted = applyDeleteLesson(added.stored, added.lesson.id);
  assert.ok(deleted.ok);
  assert.deepEqual(deleted.stored, voice);
  assert.equal(applyDeleteLesson(deleted.stored, "admin-missing").ok, false);
});
