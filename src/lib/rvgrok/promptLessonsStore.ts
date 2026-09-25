/**
 * Neon-persisted admin overlay for RV Grok standing prompt lessons.
 *
 * Same rvgrok_ops_settings row store as research-provider / research-order.
 * Missing row / DB blip → empty overlay; code defaults still merge in.
 * Never a visitor header or client storage.
 */

import { getSql } from "@/lib/db";
import {
  applyAddLesson,
  applyDeleteLesson,
  applyQueuePendingLesson,
  DEFAULT_PROMPT_LESSONS,
  formatPromptLessons,
  mergePromptLessons,
  parseStoredPromptLessons,
  promptLessonsStatus,
  type PromptLesson,
  type PromptLessonsStatus,
} from "./promptLessons.ts";

export const PROMPT_LESSONS_SETTING_KEY = "prompt_lessons";
export const PENDING_PROMPT_LESSONS_KEY = "prompt_lessons_pending";
export const PROMPT_LESSONS_CACHE_TTL_MS = 2_000;

type Cache = { value: PromptLesson[]; at: number };

let cache: Cache | null = null;

export function clearPromptLessonsCache(): void {
  cache = null;
}

export function peekPromptLessonsCache(): Cache | null {
  return cache;
}

function serializeLessons(lessons: readonly PromptLesson[]): string {
  return JSON.stringify({ version: 1, lessons });
}

/** Raw DB overlay. Fail-open → [] so merge still ships code defaults. */
export async function getStoredPromptLessons(): Promise<PromptLesson[]> {
  if (cache && Date.now() - cache.at < PROMPT_LESSONS_CACHE_TTL_MS) {
    return cache.value;
  }
  try {
    const sql = await getSql();
    const rows = await sql<{ value: string }>`
      select value
      from rvgrok_ops_settings
      where key = ${PROMPT_LESSONS_SETTING_KEY}
      limit 1
    `;
    const value = parseStoredPromptLessons(rows[0]?.value);
    cache = { value, at: Date.now() };
    return value;
  } catch {
    return cache?.value ?? [];
  }
}

export async function setStoredPromptLessons(
  lessons: readonly PromptLesson[],
): Promise<
  | { ok: true; stored: PromptLesson[] }
  | { ok: false; error: string; unavailable?: boolean }
> {
  try {
    const sql = await getSql();
    const stored = [...lessons];
    await sql`
      insert into rvgrok_ops_settings (key, value, updated_at)
      values (${PROMPT_LESSONS_SETTING_KEY}, ${serializeLessons(stored)}, now())
      on conflict (key) do update set
        value = excluded.value,
        updated_at = now()
    `;
    cache = { value: stored, at: Date.now() };
    return { ok: true, stored };
  } catch {
    clearPromptLessonsCache();
    return {
      ok: false,
      error: "Could not save standing lessons. Try again shortly.",
      unavailable: true,
    };
  }
}

export async function readEffectivePromptLessons(): Promise<PromptLesson[]> {
  try {
    return mergePromptLessons(await getStoredPromptLessons());
  } catch {
    return DEFAULT_PROMPT_LESSONS.map((l) => ({ ...l }));
  }
}

/** Formatted inject block. Fail-open → code defaults, never a thrown miss. */
export async function readStandingLessonsBlock(): Promise<string> {
  try {
    return formatPromptLessons(await readEffectivePromptLessons());
  } catch {
    return formatPromptLessons(DEFAULT_PROMPT_LESSONS);
  }
}

export async function readPromptLessonsStatus(): Promise<PromptLessonsStatus> {
  return promptLessonsStatus(await readEffectivePromptLessons());
}

/** Hangup corrections wait here. Standing lessons do not read this key. */
export async function queuePendingPromptLesson(text: string): Promise<void> {
  try {
    const sql = await getSql();
    const rows = await sql<{ value: string }>`
      select value
      from rvgrok_ops_settings
      where key = ${PENDING_PROMPT_LESSONS_KEY}
      limit 1
    `;
    const pending = applyQueuePendingLesson(
      parseStoredPromptLessons(rows[0]?.value),
      text,
    );
    await sql`
      insert into rvgrok_ops_settings (key, value, updated_at)
      values (${PENDING_PROMPT_LESSONS_KEY}, ${serializeLessons(pending)}, now())
      on conflict (key) do update set
        value = excluded.value,
        updated_at = now()
    `;
  } catch {
    /* pending is optional; continuity still saves */
  }
}

export async function addPromptLesson(text: string): Promise<
  | { ok: true; status: PromptLessonsStatus }
  | { ok: false; error: string; unavailable?: boolean }
> {
  const planned = applyAddLesson(await getStoredPromptLessons(), text);
  if (!planned.ok) return planned;
  const saved = await setStoredPromptLessons(planned.stored);
  if (!saved.ok) return saved;
  return { ok: true, status: promptLessonsStatus(mergePromptLessons(saved.stored)) };
}

export async function deletePromptLesson(id: string): Promise<
  | { ok: true; status: PromptLessonsStatus }
  | { ok: false; error: string; unavailable?: boolean }
> {
  const planned = applyDeleteLesson(await getStoredPromptLessons(), id);
  if (!planned.ok) return planned;
  const saved = await setStoredPromptLessons(planned.stored);
  if (!saved.ok) return saved;
  return { ok: true, status: promptLessonsStatus(mergePromptLessons(saved.stored)) };
}
