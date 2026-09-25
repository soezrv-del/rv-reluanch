/**
 * What a Live Voice hangup is allowed to keep.
 * Her replies never enter. Status bubbles and cut-off fragments never enter.
 * A correction becomes a pending lesson. It is not injected until approved.
 */

import {
  applyQueuePendingLesson,
  type PromptLesson,
} from "./promptLessons.ts";

const STATUS_LINE =
  /^(?:🎤\s*)?listening(?:…|\.\.\.)?$|^give me one second$/i;

export function isVoiceStatusLine(text: string): boolean {
  return STATUS_LINE.test(text.replace(/\s+/g, " ").trim());
}

export function lessonFromCorrection(text: string): string | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t || t.length > 400) return null;
  if (
    /\b(that'?s all you got|that'?s it|you wouldn'?t point out|is that all)\b/i.test(
      t,
    )
  ) {
    return "On a brand or lineup ask, give who owns it, what they build, and who it fits, then stop.";
  }
  if (
    /\b(why did you repeat|don'?t repeat|do not repeat|you repeated|repeat me|repeated me)\b/i.test(
      t,
    )
  ) {
    return "Never speak his sentence back.";
  }
  if (
    /\b(don'?t open with|do not open with|not the (?:lot|inventory)|stop (?:reading|listing) (?:the )?(?:lot|inventory))\b/i.test(
      t,
    )
  ) {
    return "Do not open with stock unless he asked inventory, do we have, or on the lot.";
  }
  if (/\b(that'?s wrong|no that'?s not|you'?re wrong|incorrect)\b/i.test(t)) {
    return `He corrected her: ${t}`.slice(0, 280);
  }
  return null;
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** User lines only. Drops her speech, status bubbles, and VAD fragments. */
export function userLinesForMemory(lines: readonly string[]): string[] {
  const out: string[] = [];
  for (const raw of lines) {
    const t = String(raw || "").replace(/\s+/g, " ").trim();
    if (!t || isVoiceStatusLine(t)) continue;
    if (out.length && out[out.length - 1]!.toLowerCase() === t.toLowerCase()) {
      continue;
    }
    const keepShort = t.includes("?") || Boolean(lessonFromCorrection(t));
    if (wordCount(t) < 4 && !keepShort) continue;
    out.push(t.slice(0, 800));
  }
  return out;
}

export function pendingLessonsFromUserLines(
  pending: readonly PromptLesson[],
  lines: readonly string[],
  now?: string,
): PromptLesson[] {
  let next = [...pending];
  for (const line of userLinesForMemory(lines)) {
    const lesson = lessonFromCorrection(line);
    if (!lesson) continue;
    next = applyQueuePendingLesson(next, lesson, now);
  }
  return next;
}
