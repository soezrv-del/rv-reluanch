/**
 * Desk review of prompt_lessons_pending (admin only).
 *
 * Pending rows are never injected, spoken, or auto-promoted. Approve copies the
 * same lesson id into prompt_lessons within the 280 / 1,800-char caps; Reject
 * drops the pending row. Same rvgrok_ops_settings row store as the lessons.
 */

import { getSql } from "@/lib/db";
import {
  applyApprovePendingLesson,
  applyRejectPendingLesson,
  mergePromptLessons,
  parseStoredPendingLessons,
  pendingLessonViews,
  promptLessonsStatus,
  type PendingLessonView,
  type PendingPromptLesson,
  type PromptLessonsStatus,
} from "./promptLessons.ts";
import {
  PENDING_PROMPT_LESSONS_KEY,
  readPromptLessonsStatus,
  readStoredPromptLessonsForWrite,
  setStoredPromptLessons,
} from "./promptLessonsStore.ts";

type DeskResult =
  | { ok: true; status: PromptLessonsStatus; pending: PendingLessonView[] }
  | { ok: false; error: string; unavailable?: boolean };

const PENDING_UNAVAILABLE = {
  ok: false as const,
  error: "Could not load pending lessons. Try again shortly.",
  unavailable: true,
};

/** Fresh read. Throws on a DB miss so a write never lands on a fail-open []. */
async function readPendingForWrite(): Promise<PendingPromptLesson[]> {
  const sql = await getSql();
  const rows = await sql<{ value: string }>`
    select value
    from rvgrok_ops_settings
    where key = ${PENDING_PROMPT_LESSONS_KEY}
    limit 1
  `;
  const raw = rows[0]?.value;
  if (typeof raw === "string" && raw.trim()) JSON.parse(raw);
  return parseStoredPendingLessons(raw);
}

async function writePending(pending: readonly PendingPromptLesson[]): Promise<void> {
  const sql = await getSql();
  const value = JSON.stringify({ version: 1, lessons: pending });
  await sql`
    insert into rvgrok_ops_settings (key, value, updated_at)
    values (${PENDING_PROMPT_LESSONS_KEY}, ${value}, now())
    on conflict (key) do update set
      value = excluded.value,
      updated_at = now()
  `;
}

/** Admin card list. Fail-open → [] (read only; nothing is written). */
export async function readPendingLessonsStatus(): Promise<PendingLessonView[]> {
  try {
    return pendingLessonViews(await readPendingForWrite());
  } catch {
    return [];
  }
}

export async function approvePendingPromptLesson(id: string): Promise<DeskResult> {
  let stored;
  let pending: PendingPromptLesson[];
  try {
    [stored, pending] = await Promise.all([
      readStoredPromptLessonsForWrite(),
      readPendingForWrite(),
    ]);
  } catch {
    return PENDING_UNAVAILABLE;
  }
  const planned = applyApprovePendingLesson(stored, pending, id);
  if (!planned.ok) return planned;
  const saved = await setStoredPromptLessons(planned.stored);
  if (!saved.ok) return saved;
  // Lesson is saved. If clearing the pending row fails, approving again is
  // idempotent (same id replaces in place).
  try {
    await writePending(planned.pending);
  } catch {
    return {
      ok: true,
      status: promptLessonsStatus(mergePromptLessons(saved.stored)),
      pending: pendingLessonViews(pending),
    };
  }
  return {
    ok: true,
    status: promptLessonsStatus(mergePromptLessons(saved.stored)),
    pending: pendingLessonViews(planned.pending),
  };
}

export async function rejectPendingPromptLesson(id: string): Promise<DeskResult> {
  let pending: PendingPromptLesson[];
  try {
    pending = await readPendingForWrite();
  } catch {
    return PENDING_UNAVAILABLE;
  }
  const planned = applyRejectPendingLesson(pending, id);
  if (!planned.ok) return planned;
  try {
    await writePending(planned.pending);
  } catch {
    return {
      ok: false,
      error: "Could not save pending lessons. Try again shortly.",
      unavailable: true,
    };
  }
  return {
    ok: true,
    status: await readPromptLessonsStatus(),
    pending: pendingLessonViews(planned.pending),
  };
}
