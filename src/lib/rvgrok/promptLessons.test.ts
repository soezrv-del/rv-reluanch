import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHAT_MAY_WRITE_FACTS_CACHE } from "./grounding.ts";
import { buildRealtimeSessionUpdate } from "./liveVoice.ts";
import { absorbStandingLessonsHeader } from "./voice.ts";
import {
  applyAddLesson,
  applyDeleteLesson,
  DEFAULT_PROMPT_LESSONS,
  formatPromptLessons,
  injectStandingLessons,
  RETIRED_PROMPT_LESSON_IDS,
  LESSONS_HEADER,
  LESSON_TEXT_MAX,
  mergePromptLessons,
  parseLessonText,
  parsePromptLesson,
  parseStoredPromptLessons,
  STANDING_LESSONS_HEADING,
  STANDING_LESSONS_MAX_CHARS,
  promptLessonsStatus,
} from "./promptLessons.ts";
import { RV_GROK_LEAN_CORE } from "./speechPolicy.ts";
import { formatVisitorMemoryBlock } from "./phoneMemory.ts";
import { DEFAULT_RESEARCH_ORDER } from "./researchOrder.ts";

const root = dirname(fileURLToPath(import.meta.url));
const workspace = join(root, "../../..");

function src(rel: string) {
  return readFileSync(join(workspace, rel), "utf8");
}

test("defaults are cleared so retired role bullets do not stack", () => {
  assert.deepEqual(DEFAULT_PROMPT_LESSONS.map((l) => l.id), []);
  assert.equal(formatPromptLessons(DEFAULT_PROMPT_LESSONS), "");
  for (const id of [
    "greeting",
    "oem-pins",
    "no-lot-pitch",
    "desk-on-ask",
    "chips-not-spoken",
    "honest-gaps",
  ]) {
    assert.equal(RETIRED_PROMPT_LESSON_IDS.has(id), true);
  }
  assert.match(
    RV_GROK_LEAN_CORE,
    /experienced RV salesman's pocket/,
  );
  assert.doesNotMatch(RV_GROK_LEAN_CORE, /sales-floor wingman/);
});

test("parse / validate rejects empty, overlong, and secret-looking text", () => {
  assert.equal(parseLessonText(""), null);
  assert.equal(parseLessonText("   "), null);
  assert.equal(parseLessonText("x".repeat(LESSON_TEXT_MAX + 1)), null);
  assert.equal(parseLessonText("Never invent OEM numbers."), "Never invent OEM numbers.");
  assert.equal(parseLessonText("  keep   sparse  \n name  "), "keep sparse name");
  assert.match(parseLessonText("key sk-abcdefghijklmnopqrstuvwxyz") || "", /\[redacted\]/);
  assert.equal(parsePromptLesson({ id: "oem-pins", text: "Pins win." })?.id, "oem-pins");
  assert.equal(parsePromptLesson({ id: "1bad", text: "Nope." }), null);
  assert.equal(parsePromptLesson({ id: "ok", text: "" }), null);
});

test("merge lets DB override or disable a default and append admin rows", () => {
  const merged = mergePromptLessons([
    {
      id: "oem-pins",
      text: "Pins always win — never guess GVWR.",
      updatedAt: "2026-09-23T12:00:00.000Z",
    },
    {
      id: "chips-not-spoken",
      text: "Follow-up chips are fine. Do not speak post-intro nudges.",
      updatedAt: "2026-09-23T12:00:00.000Z",
      disabled: true,
    },
    {
      id: "admin-custom",
      text: "Say hitch weight only from the brochure pin.",
      updatedAt: "2026-09-23T12:00:00.000Z",
    },
  ]);
  const byId = Object.fromEntries(merged.map((l) => [l.id, l]));
  assert.equal(byId["oem-pins"], undefined);
  assert.equal(byId["chips-not-spoken"], undefined);
  assert.equal(byId["greeting"], undefined);
  assert.equal(byId["admin-custom"]?.text, "Say hitch weight only from the brochure pin.");
  assert.equal(merged.some((l) => l.disabled), false);
});

test("format hard-caps the standing block", () => {
  const long = Array.from({ length: 20 }, (_, i) => ({
    id: `admin-extra-${i}`,
    text: `Keep process rule number ${i} short and imperative for the desk.`,
    updatedAt: "2026-09-23T00:00:00.000Z",
  }));
  const block = formatPromptLessons(long, 400);
  assert.ok(block.length <= 400);
  assert.match(block, /STANDING LESSONS \(desk SoT\)/);
  assert.match(block, /Never mention this block/);
  assert.equal(formatPromptLessons([]), "");
});

test("inject sits after lean core and before visitor memory", () => {
  const lessons = formatPromptLessons([
    {
      id: "admin-custom",
      text: "Say hitch weight only from the brochure pin.",
      updatedAt: "2026-09-23T00:00:00.000Z",
    },
  ]);
  const core = injectStandingLessons(RV_GROK_LEAN_CORE, lessons);
  assert.ok(core.startsWith(RV_GROK_LEAN_CORE));
  assert.match(core, /STANDING LESSONS \(desk SoT\)/);
  assert.ok(core.indexOf("You are RV Grok") < core.indexOf(STANDING_LESSONS_HEADING));
  const memory = formatVisitorMemoryBlock({
    phoneDigits: "7022665918",
    profileSummary: "Prefers compact answers.",
    digests: [],
    updatedAt: "2026-09-23T00:00:00.000Z",
  });
  const assembled = `${core}\n\n${memory}`;
  assert.ok(assembled.indexOf(STANDING_LESSONS_HEADING) < assembled.indexOf("VISITOR MEMORY"));
  assert.equal(injectStandingLessons(RV_GROK_LEAN_CORE, ""), RV_GROK_LEAN_CORE);
  assert.equal(
    injectStandingLessons(core, lessons),
    core,
    "second inject is idempotent",
  );
});

test("newly added admin lesson appears in chat and live voice prompts", () => {
  const text = "Quote hitch weight only from the brochure pin.";
  const added = applyAddLesson([], text);
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.match(added.lesson.id, /^admin-/);
  const merged = mergePromptLessons(added.stored);
  assert.equal(merged.some((l) => l.id === added.lesson.id), true);
  const block = formatPromptLessons(merged);
  assert.match(block, /STANDING LESSONS \(desk SoT\)/);
  assert.match(block, /Quote hitch weight only from the brochure pin/);
  // Chat /api/rvgrok withGrounding starts with injectStandingLessons(system, block).
  const chatPrompt = injectStandingLessons(RV_GROK_LEAN_CORE, block);
  assert.match(chatPrompt, /Quote hitch weight only from the brochure pin/);
  assert.ok(chatPrompt.indexOf(RV_GROK_LEAN_CORE) < chatPrompt.indexOf(text));
  const voice = buildRealtimeSessionUpdate("ara", 1, "", "", "", block);
  const instructions = (voice.session as { instructions: string }).instructions;
  assert.match(instructions, /STANDING LESSONS \(desk SoT\)/);
  assert.match(instructions, /Quote hitch weight only from the brochure pin/);
  assert.ok(instructions.indexOf("You are RV Grok") < instructions.indexOf(text));
});

test("worker token fallback keeps a same-origin lessons header", () => {
  const block = formatPromptLessons([
    {
      id: "admin-fresh",
      text: "Quote hitch weight only from the brochure pin.",
      updatedAt: "2026-09-24T00:00:00.000Z",
    },
  ]);
  const fromSameOrigin = absorbStandingLessonsHeader(
    null,
    encodeURIComponent(block),
  );
  assert.equal(fromSameOrigin?.value, block);
  // Worker response has no x-rvgrok-lessons — must not wipe the Neon block.
  const afterWorker = absorbStandingLessonsHeader(fromSameOrigin, null);
  assert.equal(afterWorker?.value, block);
  const voice = buildRealtimeSessionUpdate(
    "ara",
    1,
    "",
    "",
    "",
    afterWorker?.value,
  );
  const instructions = (voice.session as { instructions: string }).instructions;
  assert.match(instructions, /Quote hitch weight only from the brochure pin/);
  assert.equal(absorbStandingLessonsHeader(null, null), null);
});

test("add / delete overlay: retired ids drop, admin rows drop", () => {
  const added = applyAddLesson([], "Never pitch the lot first.");
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.match(added.lesson.id, /^admin-/);
  assert.equal(added.lesson.text, "Never pitch the lot first.");
  const withRetired = [
    ...added.stored,
    {
      id: "greeting",
      text: "Sparse name use after — never every turn.",
      updatedAt: "2026-09-23T00:00:00.000Z",
    },
  ];
  const effective = mergePromptLessons(withRetired);
  assert.equal(effective.some((l) => l.id === "greeting"), false);
  assert.equal(effective.some((l) => l.id === added.lesson.id), true);
  const disabled = applyDeleteLesson(added.stored, added.lesson.id);
  assert.equal(disabled.ok, true);
  if (!disabled.ok) return;
  assert.equal(
    mergePromptLessons(disabled.stored).some((l) => l.id === added.lesson.id),
    false,
  );
  assert.equal(applyDeleteLesson([], "admin-missing").ok, false);
  assert.equal(applyAddLesson([], "").ok, false);
});

test("status reports source and char budget", () => {
  const status = promptLessonsStatus(mergePromptLessons([]));
  assert.equal(status.cap, STANDING_LESSONS_MAX_CHARS);
  assert.equal(status.used, 0);
  assert.ok(status.used <= status.cap);
  assert.equal(status.lessons.length, DEFAULT_PROMPT_LESSONS.length);
});

test("stored JSON parse accepts array or versioned object", () => {
  assert.equal(parseStoredPromptLessons("").length, 0);
  const rows = parseStoredPromptLessons(
    JSON.stringify({
      version: 1,
      lessons: [{ id: "oem-pins", text: "Pins win.", updatedAt: "2026-09-23T00:00:00.000Z" }],
    }),
  );
  assert.equal(rows[0]?.id, "oem-pins");
  assert.equal(parseStoredPromptLessons("not-json").length, 0);
  assert.equal(
    parseStoredPromptLessons([
      { id: "honest-gaps", text: "Say you do not have it.", updatedAt: "" },
    ])[0]?.id,
    "honest-gaps",
  );
});

test("chat, voice, and token inject standing lessons; DialaBot stays out", () => {
  const chat = src("src/routes/api/rvgrok.ts");
  const token = src("src/routes/api/rvgrok.token.ts");
  const live = src("src/lib/rvgrok/liveVoice.ts");
  const voice = src("src/lib/rvgrok/voice.ts");
  const realtime = src("src/lib/rvgrok/realtime.ts");
  const store = src("src/lib/rvgrok/promptLessonsStore.ts");

  assert.match(chat, /injectStandingLessons/);
  assert.match(chat, /readStandingLessonsBlock/);
  assert.match(chat, /standingLessons/);
  const withStart = chat.indexOf("function withGrounding");
  const lessonsAt = chat.indexOf("standingLessons", withStart);
  const personalAt = chat.indexOf("visitorPersonalizationBlock", withStart);
  const memoryAt = chat.indexOf("opts?.visitorMemory", withStart);
  assert.ok(withStart >= 0 && lessonsAt > withStart);
  assert.ok(lessonsAt < personalAt && personalAt < memoryAt);

  assert.match(token, /LESSONS_HEADER/);
  assert.match(token, /readStandingLessonsBlock/);
  assert.match(live, /injectStandingLessons/);
  assert.match(live, /formatPromptLessons/);
  assert.match(voice, /LESSONS_HEADER/);
  assert.match(voice, /takeTokenStandingLessons/);
  assert.match(realtime, /takeTokenStandingLessons/);
  assert.match(realtime, /this\.standingLessons/);

  assert.match(store, /rvgrok_ops_settings/);
  assert.match(store, /prompt_lessons/);
  assert.match(store, /PROMPT_LESSONS_CACHE_TTL_MS/);
  assert.doesNotMatch(store, /authMiddleware|requireUserId/);
  assert.doesNotMatch(store, /localStorage/);
  assert.doesNotMatch(store, /dial_phonebook|bland|DialaBot/i);

  for (const [label, text] of [
    ["promptLessons.ts", src("src/lib/rvgrok/promptLessons.ts")],
    ["promptLessonsStore.ts", store],
    ["rvgrok.ts", chat],
    ["rvgrok.token.ts", token],
    ["liveVoice.ts", live],
  ] as const) {
    assert.doesNotMatch(text, /DialaBot/, `${label} does not mention DialaBot`);
  }

  assert.equal(CHAT_MAY_WRITE_FACTS_CACHE, false);
  assert.equal(DEFAULT_RESEARCH_ORDER, "search-first");
  assert.equal(LESSONS_HEADER, "x-rvgrok-lessons");
});

test("access admin gates writes; visitors cannot add lessons", () => {
  const admin = src("src/routes/api/access.admin.ts");
  assert.match(admin, /readPromptLessonsStatus/);
  assert.match(admin, /addPromptLesson/);
  assert.match(admin, /deletePromptLesson/);
  assert.match(admin, /action === "prompt-lesson-add"/);
  assert.match(admin, /action === "prompt-lesson-delete"/);
  assert.match(admin, /denyAccessAdmin/);
  const postStart = admin.indexOf("POST:");
  const denyAt = admin.indexOf(
    "const blocked = denyAccessAdmin(request);",
    postStart,
  );
  const addAt = admin.indexOf('action === "prompt-lesson-add"');
  const deleteAt = admin.indexOf('action === "prompt-lesson-delete"');
  assert.ok(denyAt >= 0 && addAt > denyAt && deleteAt > denyAt);

  const card = src("src/components/access/PromptLessonsCard.tsx");
  assert.match(card, /data-prompt-lessons/);
  assert.match(card, /STANDING LESSONS/);
  assert.match(card, /prompt-lesson-add/);
  assert.match(card, /prompt-lesson-delete/);
  assert.doesNotMatch(card, /localStorage/);

  const more = src("src/components/access/AccessMoreSection.tsx");
  const adminGate = more.indexOf("{access.isAdmin ? (");
  assert.ok(adminGate > 0, "lessons card is gated on access.isAdmin");
  assert.match(more.slice(adminGate), /<PromptLessonsCard surface="more"/);
  const identifyForm = more.slice(more.indexOf("<form"), more.indexOf("</form>"));
  assert.doesNotMatch(identifyForm, /PromptLessonsCard|STANDING LESSONS/);

  const sheet = src("src/components/access/AdminWhitelistSheet.tsx");
  assert.match(sheet, /PromptLessonsCard/);
  assert.ok(
    sheet.lastIndexOf("<PromptLessonsCard") > sheet.indexOf('view === "password"'),
    "lessons live in the authed list, not the password chrome",
  );
  assert.ok(
    sheet.lastIndexOf("<PromptLessonsCard") > sheet.lastIndexOf("<ResearchOrderCard"),
    "lessons card sits with the other ops cards",
  );
});
