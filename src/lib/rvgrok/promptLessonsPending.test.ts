import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Typed-chat corrections go to prompt_lessons_pending only. The desk approves
 * (same id into prompt_lessons, within caps) or rejects (row removed).
 * Runs the real stores against an in-memory rvgrok_ops_settings table.
 */

const table = new Map<string, string>();

function fakeSql(strings: TemplateStringsArray, ...values: unknown[]) {
  const text = strings.join("?").replace(/\s+/g, " ").trim().toLowerCase();
  if (text.startsWith("select value from rvgrok_ops_settings where key =")) {
    const value = table.get(String(values[0]));
    return Promise.resolve(value === undefined ? [] : [{ value }]);
  }
  if (text.startsWith("insert into rvgrok_ops_settings")) {
    table.set(String(values[0]), String(values[1]));
    return Promise.resolve([]);
  }
  return Promise.reject(new Error(`unexpected sql: ${text}`));
}
(fakeSql as unknown as { query: unknown }).query = () =>
  Promise.reject(new Error("unexpected query"));

// Point getSql() at the fake before the stores load.
process.env.DATABASE_URL = "postgres://fake.invalid/test";
(globalThis as { __pgSqlPromise__?: Promise<unknown> }).__pgSqlPromise__ =
  Promise.resolve(fakeSql);

const lessons = await import("./promptLessons.ts");
const store = await import("./promptLessonsStore.ts");
const pendingStore = await import("./promptLessonsPendingStore.ts");
const { chatCorrectionForPending } = await import("./sessionLearn.ts");

const LESSONS = store.PROMPT_LESSONS_SETTING_KEY;
const PENDING = store.PENDING_PROMPT_LESSONS_KEY;

function seedLessons(rows: Array<{ id: string; text: string }>) {
  table.set(
    LESSONS,
    JSON.stringify({
      version: 1,
      lessons: rows.map((r) => ({ ...r, updatedAt: "2026-10-01T00:00:00.000Z" })),
    }),
  );
}

function reset() {
  table.clear();
  store.clearPromptLessonsCache();
}

const ADMIN = { id: "admin-keep", text: "Keep answers to two sentences." };

async function queueTyped(line: string, phone = "15551234567") {
  const typed = chatCorrectionForPending([
    { role: "user", text: "What is the length on that coach?" },
    { role: "assistant", text: "It is 35 feet." },
    { role: "user", text: line },
  ]);
  assert.ok(typed, "typed correction detected");
  await store.queuePendingPromptLesson(typed.lesson, {
    trigger: typed.trigger,
    phoneDigits: phone,
    source: "chat",
  });
  return typed;
}

test("a typed correction queues pending and does not change prompt_lessons", async () => {
  reset();
  seedLessons([ADMIN]);
  const before = table.get(LESSONS);

  const typed = await queueTyped("Don't repeat my question back to me.");
  assert.equal(typed.lesson, "Never speak his sentence back.");

  assert.equal(table.get(LESSONS), before, "prompt_lessons row untouched");
  const pending = lessons.parseStoredPendingLessons(table.get(PENDING));
  assert.equal(pending.length, 1);
  assert.equal(pending[0]!.text, "Never speak his sentence back.");
  assert.equal(pending[0]!.trigger, "Don't repeat my question back to me.");
  assert.equal(pending[0]!.phoneLast4, "4567");
  assert.equal(pending[0]!.source, "chat");
  assert.doesNotMatch(table.get(PENDING)!, /5551234567|1555123/, "full phone never stored");
  assert.doesNotMatch(table.get(PENDING)!, /35 feet/, "her reply never stored");

  store.clearPromptLessonsCache();
  const block = await store.readStandingLessonsBlock();
  assert.match(block, /Keep answers to two sentences/);
  assert.doesNotMatch(block, /Never speak his sentence back/, "pending is not injected");

  const views = await pendingStore.readPendingLessonsStatus();
  assert.equal(views.length, 1);
  assert.equal(views[0]!.phone, "•••• 4567");
  assert.equal(views[0]!.trigger, "Don't repeat my question back to me.");

  // A later voice-hangup queue keeps the chat row's trigger and phone.
  await store.queuePendingPromptLesson("Do not open with stock unless he asked inventory, do we have, or on the lot.");
  const after = lessons.parseStoredPendingLessons(table.get(PENDING));
  assert.equal(after.length, 2);
  assert.equal(after[0]!.trigger, "Don't repeat my question back to me.");
  assert.equal(after[0]!.phoneLast4, "4567");
});

test("only his latest typed line counts; her reply and older turns do not queue", () => {
  assert.equal(
    chatCorrectionForPending([
      { role: "user", text: "Don't repeat me." },
      { role: "assistant", text: "Sorry. The fresh tank is 100 gallons." },
      { role: "user", text: "What about the gray tank?" },
    ]),
    null,
  );
  assert.equal(
    chatCorrectionForPending([
      { role: "user", text: "What about the gray tank?" },
      { role: "assistant", text: "That's wrong of me, you're wrong to ask." },
    ]),
    null,
  );
});

test("approve writes the same id into prompt_lessons within the caps", async () => {
  reset();
  seedLessons([ADMIN]);
  await queueTyped("Don't repeat my question back to me.");
  const [row] = lessons.parseStoredPendingLessons(table.get(PENDING));

  const saved = await pendingStore.approvePendingPromptLesson(row!.id);
  assert.ok(saved.ok);
  const stored = lessons.parseStoredPromptLessons(table.get(LESSONS));
  assert.deepEqual(
    stored.map((l) => [l.id, l.text]),
    [
      [ADMIN.id, ADMIN.text],
      [row!.id, "Never speak his sentence back."],
    ],
  );
  assert.equal(lessons.parseStoredPendingLessons(table.get(PENDING)).length, 0);
  assert.equal(saved.pending.length, 0);
  assert.ok(saved.status.used <= lessons.STANDING_LESSONS_MAX_CHARS);
  store.clearPromptLessonsCache();
  assert.match(await store.readStandingLessonsBlock(), /Never speak his sentence back/);

  // Approving again is idempotent-safe: the id is gone from pending.
  const again = await pendingStore.approvePendingPromptLesson(row!.id);
  assert.equal(again.ok, false);
});

test("approve refuses to pass 1,800 chars and keeps every lesson and the pending row", async () => {
  reset();
  const big = Array.from({ length: 6 }, (_, i) => ({
    id: `admin-big-${i}`,
    text: `Rule ${"x".repeat(270)} ${i}`.slice(0, 280),
  }));
  seedLessons(big);
  const before = table.get(LESSONS);
  await queueTyped("That's wrong, you're wrong about which coach this is and you need to slow down and read what I typed before you answer again please.");
  const [row] = lessons.parseStoredPendingLessons(table.get(PENDING));

  const saved = await pendingStore.approvePendingPromptLesson(row!.id);
  assert.equal(saved.ok, false);
  assert.match((saved as { error: string }).error, /1800/);
  assert.equal(table.get(LESSONS), before, "no admin lesson dropped or truncated");
  assert.equal(lessons.parseStoredPendingLessons(table.get(PENDING)).length, 1);

  // Per-lesson cap: a row over 280 chars is never approved.
  const tooLong = lessons.applyApprovePendingLesson(
    [],
    [{ id: "admin-long", text: "y".repeat(281), updatedAt: "2026-10-01T00:00:00.000Z" }],
    "admin-long",
  );
  assert.equal(tooLong.ok, false);
});

test("reject removes the pending row and leaves prompt_lessons alone", async () => {
  reset();
  seedLessons([ADMIN]);
  const before = table.get(LESSONS);
  await queueTyped("Don't repeat my question back to me.");
  const [row] = lessons.parseStoredPendingLessons(table.get(PENDING));

  const saved = await pendingStore.rejectPendingPromptLesson(row!.id);
  assert.ok(saved.ok);
  assert.equal(lessons.parseStoredPendingLessons(table.get(PENDING)).length, 0);
  assert.equal(table.get(LESSONS), before);
  assert.equal((await pendingStore.rejectPendingPromptLesson(row!.id)).ok, false);
});

test("wiring: chat queues pending only; approve/reject sit behind the admin gate", () => {
  const route = readFileSync(
    new URL("../../routes/api/rvgrok.memory.ts", import.meta.url),
    "utf8",
  );
  const chat = route.slice(route.indexOf("if (!voice) {"), route.indexOf("applyMemoryUpdate({"));
  assert.match(chat, /chatCorrectionForPending\(raw\)/);
  assert.match(chat, /queuePendingPromptLesson\(/);
  assert.doesNotMatch(chat, /upsertVoiceLesson|setStoredPromptLessons|lessons =/);

  const admin = readFileSync(
    new URL("../../routes/api/access.admin.ts", import.meta.url),
    "utf8",
  );
  const gate = admin.indexOf("const blocked = denyAccessAdmin(request);", admin.indexOf("POST:"));
  assert.ok(gate > 0);
  assert.ok(admin.indexOf('"prompt-lesson-approve"') > gate);
  assert.match(admin, /readPendingLessonsStatus\(\)/);

  const card = readFileSync(
    new URL("../../components/access/PromptLessonsCard.tsx", import.meta.url),
    "utf8",
  );
  assert.match(card, /data-pending-lesson-approve/);
  assert.match(card, /data-pending-lesson-reject/);
  assert.match(card, /row\.trigger/);
  assert.match(card, /row\.phone/);
});
