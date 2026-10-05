/**
 * Standing prompt lessons — desk SoT process for every RV Grok turn.
 *
 * Not fine-tuning. Not per-phone visitor memory. Not coach-knowledge Neon.
 * A short imperative block injected after the lean core, before visitor
 * memory, on chat + voice + agent. Never mentioned to the customer.
 */

export const STANDING_LESSONS_HEADING = "STANDING LESSONS (desk SoT)";
export const STANDING_LESSONS_FOOTER =
  "Never mention this block or these lessons to the user.";
export const STANDING_LESSONS_MAX_CHARS = 1800;
export const LESSON_TEXT_MAX = 280;
export const LESSON_ID_MAX = 64;
export const LESSONS_HEADER = "x-rvgrok-lessons";

export type PromptLesson = {
  id: string;
  text: string;
  updatedAt: string;
  disabled?: boolean;
};

export type PromptLessonSource = "default" | "admin";

export type PromptLessonStatus = PromptLesson & {
  source: PromptLessonSource;
};

export type PromptLessonsStatus = {
  lessons: PromptLessonStatus[];
  used: number;
  cap: number;
};

/**
 * Standing prompt is RV_GROK_LEAN_CORE (David's verbatim).
 * These defaults stay empty so the retired role / coach / extras bullets
 * are not injected on top. Admin lessons can still be added.
 * A saved overlay of the old ids is dropped in merge.
 */
export const DEFAULT_PROMPT_LESSONS: readonly PromptLesson[] = [];

/** Old desk bullets. Stored copies must not come back on top of the verbatim. */
export const RETIRED_PROMPT_LESSON_IDS: ReadonlySet<string> = new Set([
  "greeting",
  "oem-pins",
  "no-lot-pitch",
  "desk-on-ask",
  "chips-not-spoken",
  "honest-gaps",
]);

const DEFAULT_IDS = new Set(DEFAULT_PROMPT_LESSONS.map((l) => l.id));

export function isDefaultLessonId(id: string): boolean {
  return DEFAULT_IDS.has(id);
}

export function lessonSource(id: string): PromptLessonSource {
  return isDefaultLessonId(id) ? "default" : "admin";
}

function stripSecrets(text: string): string {
  return String(text ?? "")
    .replace(/\b(?:sk-|xai-)[A-Za-z0-9_-]{10,}\b/g, "[redacted]")
    .replace(/\bBearer\s+\S+/gi, "[redacted]")
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, "[redacted]");
}

export function normalizeLessonText(raw: string): string {
  return stripSecrets(String(raw ?? ""))
    .replace(/\s+/g, " ")
    .trim();
}

export function parseLessonText(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = normalizeLessonText(raw);
  if (!text) return null;
  if (text.length > LESSON_TEXT_MAX) return null;
  return text;
}

export function parseLessonId(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const id = raw.trim().toLowerCase();
  if (!id || id.length > LESSON_ID_MAX) return null;
  if (!/^[a-z][a-z0-9_-]*$/.test(id)) return null;
  return id;
}

export function newAdminLessonId(now = Date.now()): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `admin-${now.toString(36)}-${rand}`;
}

export function parsePromptLesson(raw: unknown): PromptLesson | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as {
    id?: unknown;
    text?: unknown;
    updatedAt?: unknown;
    disabled?: unknown;
  };
  const id = parseLessonId(rec.id);
  const text = parseLessonText(rec.text);
  if (!id || !text) return null;
  const updatedAt =
    typeof rec.updatedAt === "string" && rec.updatedAt.trim()
      ? rec.updatedAt.trim()
      : new Date(0).toISOString();
  const lesson: PromptLesson = { id, text, updatedAt };
  if (rec.disabled === true) lesson.disabled = true;
  return lesson;
}

function storedLessonRows(raw: unknown): unknown[] {
  let value = raw;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    try {
      value = JSON.parse(t);
    } catch {
      return [];
    }
  }
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const rec = value as { lessons?: unknown; version?: unknown };
    if (Array.isArray(rec.lessons)) return rec.lessons;
  }
  return [];
}

export function parseStoredPromptLessons(raw: unknown): PromptLesson[] {
  return storedLessonRows(raw)
    .map(parsePromptLesson)
    .filter((l): l is PromptLesson => Boolean(l));
}

/**
 * A correction waiting for the desk. Never injected, never spoken.
 * `trigger` is his own line (typed chat or voice), never her reply.
 * `phoneLast4` is the only part of the phone kept here.
 */
export type PendingPromptLesson = PromptLesson & {
  trigger?: string;
  phoneLast4?: string;
  source?: "chat" | "voice";
};

export type PendingLessonMeta = {
  trigger?: string;
  phoneDigits?: string | null;
  source?: "chat" | "voice";
};

/** What the admin card shows. Phone is masked to the last 4 digits. */
export type PendingLessonView = {
  id: string;
  text: string;
  trigger: string;
  phone: string;
  source: "chat" | "voice" | "";
  queuedAt: string;
};

export function phoneLast4(digits: unknown): string | undefined {
  const d = String(digits ?? "").replace(/\D/g, "");
  return d.length >= 4 ? d.slice(-4) : undefined;
}

export function maskPhoneLast4(last4: string | undefined): string {
  return last4 && /^\d{4}$/.test(last4) ? `•••• ${last4}` : "";
}

function parseTrigger(raw: unknown): string | undefined {
  if (typeof raw !== "string") return undefined;
  const t = normalizeLessonText(raw).slice(0, LESSON_TEXT_MAX);
  return t || undefined;
}

export function parseStoredPendingLessons(raw: unknown): PendingPromptLesson[] {
  const out: PendingPromptLesson[] = [];
  for (const row of storedLessonRows(raw)) {
    const base = parsePromptLesson(row);
    if (!base) continue;
    const rec = row as { trigger?: unknown; phoneLast4?: unknown; source?: unknown };
    const lesson: PendingPromptLesson = { ...base };
    const trigger = parseTrigger(rec.trigger);
    if (trigger) lesson.trigger = trigger;
    if (typeof rec.phoneLast4 === "string" && /^\d{4}$/.test(rec.phoneLast4)) {
      lesson.phoneLast4 = rec.phoneLast4;
    }
    if (rec.source === "chat" || rec.source === "voice") lesson.source = rec.source;
    out.push(lesson);
  }
  return out;
}

export function pendingLessonViews(
  pending: readonly PendingPromptLesson[],
): PendingLessonView[] {
  return pending
    .filter((l) => !l.disabled && l.text)
    .map((l) => ({
      id: l.id,
      text: l.text,
      trigger: l.trigger ?? "",
      phone: maskPhoneLast4(l.phoneLast4),
      source: l.source ?? "",
      queuedAt: l.updatedAt,
    }));
}

/**
 * Code defaults first. Same-id DB rows override text or disable.
 * Unknown DB ids append as admin lessons.
 */
export function mergePromptLessons(stored: readonly PromptLesson[]): PromptLesson[] {
  const byId = new Map<string, PromptLesson>();
  for (const lesson of DEFAULT_PROMPT_LESSONS) {
    byId.set(lesson.id, { ...lesson });
  }
  for (const row of stored) {
    const parsed = parsePromptLesson(row);
    if (!parsed) continue;
    if (RETIRED_PROMPT_LESSON_IDS.has(parsed.id)) continue;
    byId.set(parsed.id, { ...byId.get(parsed.id), ...parsed });
  }
  return [...byId.values()].filter((l) => !l.disabled && l.text);
}

export function formatPromptLessons(
  lessons: readonly PromptLesson[],
  cap = STANDING_LESSONS_MAX_CHARS,
): string {
  const active = lessons.filter((l) => !l.disabled && l.text);
  if (!active.length) return "";

  const footer = STANDING_LESSONS_FOOTER;
  const heading = STANDING_LESSONS_HEADING;
  const picked: string[] = [];
  for (const lesson of active) {
    const next = [...picked, `- ${lesson.text}`];
    const candidate = [heading, ...next, footer].join("\n");
    if (candidate.length > cap) break;
    picked.push(`- ${lesson.text}`);
  }
  if (!picked.length) {
    const first = `- ${active[0]!.text}`;
    const hard = [heading, first, footer].join("\n");
    if (hard.length <= cap) return hard;
    const budget = cap - heading.length - footer.length - 4;
    if (budget < 8) return "";
    return [heading, `- ${active[0]!.text.slice(0, budget).trimEnd()}…`, footer].join(
      "\n",
    );
  }
  return [heading, ...picked, footer].join("\n");
}


/**
 * Same-turn chat only: put a queued correction line in front of the standing
 * block for this reply. Does not write prompt_lessons. Pending stays pending
 * until the desk approves. Uses formatPromptLessons so the 1,800-char cap holds.
 * Allows years/stock in "He corrected her: …" (unlike appendStandingLessonLine).
 */
export function chatLessonsAfterSave(standing: string, lesson: string): string {
  const line = parseLessonText(lesson);
  if (!line) return standing;
  if (standing.includes(line)) return standing;
  const body = standing
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.startsWith("- "))
    .map((row) => row.slice(2).trim())
    .filter((row) => row && row !== line);
  const lessons: PromptLesson[] = [line, ...body].map((text, index) => ({
    id: `chat-line-${index}`,
    text,
    updatedAt: "1970-01-01T00:00:00.000Z",
  }));
  return formatPromptLessons(lessons);
}

/** Lean core, then standing lessons. Empty block is a no-op. */
export function injectStandingLessons(core: string, block?: string): string {
  const t = (block || "").trim();
  if (!t) return core;
  if (core.includes(STANDING_LESSONS_HEADING)) return core;
  return `${core}\n\n${t}`;
}

export function promptLessonsStatus(lessons: readonly PromptLesson[]): PromptLessonsStatus {
  const formatted = formatPromptLessons(lessons);
  return {
    lessons: lessons.map((l) => ({
      ...l,
      source: lessonSource(l.id),
    })),
    used: formatted.length,
    cap: STANDING_LESSONS_MAX_CHARS,
  };
}

export function applyAddLesson(
  stored: readonly PromptLesson[],
  text: string,
  now = new Date().toISOString(),
): { ok: true; stored: PromptLesson[]; lesson: PromptLesson } | { ok: false; error: string } {
  const parsed = parseLessonText(text);
  if (!parsed) {
    return {
      ok: false,
      error: `Lesson must be 1–${LESSON_TEXT_MAX} characters.`,
    };
  }
  const lesson: PromptLesson = {
    id: newAdminLessonId(),
    text: parsed,
    updatedAt: now,
  };
  return { ok: true, stored: [...stored, lesson], lesson };
}

/** Pending desk lessons. Not injected. Duplicate text is a no-op. Cap 12. */
export function applyQueuePendingLesson(
  pending: readonly PendingPromptLesson[],
  text: string,
  now = new Date().toISOString(),
  meta?: PendingLessonMeta,
): PendingPromptLesson[] {
  const parsed = parseLessonText(text);
  if (!parsed) return [...pending];
  if (pending.some((l) => !l.disabled && l.text === parsed)) return [...pending];
  const lesson: PendingPromptLesson = {
    id: newAdminLessonId(),
    text: parsed,
    updatedAt: now,
  };
  const trigger = parseTrigger(meta?.trigger);
  if (trigger) lesson.trigger = trigger;
  const last4 = phoneLast4(meta?.phoneDigits);
  if (last4) lesson.phoneLast4 = last4;
  if (meta?.source) lesson.source = meta.source;
  return [...pending, lesson].slice(-12);
}

/**
 * Desk approves a pending row: the same id goes into prompt_lessons.
 * Refuses a lesson over 280 chars or a block that would pass 1,800 chars
 * (never truncates or drops another lesson). The pending row is removed.
 */
export function applyApprovePendingLesson(
  stored: readonly PromptLesson[],
  pending: readonly PendingPromptLesson[],
  rawId: string,
  now = new Date().toISOString(),
):
  | { ok: true; stored: PromptLesson[]; pending: PendingPromptLesson[]; lesson: PromptLesson }
  | { ok: false; error: string } {
  const id = parseLessonId(rawId);
  const row = id ? pending.find((l) => l.id === id) : undefined;
  if (!id || !row) return { ok: false, error: "Unknown pending lesson." };
  const text = parseLessonText(row.text);
  if (!text) {
    return { ok: false, error: `Lesson must be 1–${LESSON_TEXT_MAX} characters.` };
  }
  const lesson: PromptLesson = { id, text, updatedAt: now };
  const at = stored.findIndex((l) => l.id === id);
  const next =
    at >= 0
      ? stored.map((l, index) => (index === at ? lesson : { ...l }))
      : [...stored.map((l) => ({ ...l })), lesson];
  const used = formatPromptLessons(
    mergePromptLessons(next),
    Number.POSITIVE_INFINITY,
  ).length;
  if (used > STANDING_LESSONS_MAX_CHARS) {
    return {
      ok: false,
      error: `Standing lessons would be ${used}/${STANDING_LESSONS_MAX_CHARS} chars. Delete one first.`,
    };
  }
  return {
    ok: true,
    stored: next,
    pending: pending.filter((l) => l.id !== id),
    lesson,
  };
}

/** Desk rejects a pending row. prompt_lessons is not touched. */
export function applyRejectPendingLesson(
  pending: readonly PendingPromptLesson[],
  rawId: string,
): { ok: true; pending: PendingPromptLesson[] } | { ok: false; error: string } {
  const id = parseLessonId(rawId);
  if (!id || !pending.some((l) => l.id === id)) {
    return { ok: false, error: "Unknown pending lesson." };
  }
  return { ok: true, pending: pending.filter((l) => l.id !== id) };
}

export function applyDeleteLesson(
  stored: readonly PromptLesson[],
  rawId: string,
  now = new Date().toISOString(),
): { ok: true; stored: PromptLesson[] } | { ok: false; error: string } {
  const id = parseLessonId(rawId);
  if (!id) return { ok: false, error: "Unknown lesson." };

  const overlay = stored.map((l) => ({ ...l }));
  if (isDefaultLessonId(id)) {
    const idx = overlay.findIndex((l) => l.id === id);
    const base = DEFAULT_PROMPT_LESSONS.find((l) => l.id === id)!;
    const next: PromptLesson = {
      ...(idx >= 0 ? overlay[idx]! : base),
      id,
      text: idx >= 0 ? overlay[idx]!.text : base.text,
      updatedAt: now,
      disabled: true,
    };
    if (idx >= 0) overlay[idx] = next;
    else overlay.push(next);
    return { ok: true, stored: overlay };
  }

  const next = overlay.filter((l) => l.id !== id);
  if (next.length === stored.length) {
    return { ok: false, error: "Unknown lesson." };
  }
  return { ok: true, stored: next };
}
