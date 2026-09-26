/**
 * Standing rules learned from a Live Voice turn.
 * Not fine-tuning. Not phone memory. Not a pinned coach spec.
 * One imperative line, stable id, injected on the next turn.
 * A mileage, GVWR, or price never goes in the lesson text.
 */

import { looksLikeOwnLotStockQuestion, parseOwnLotStockNumber } from "./ownLotAsk.ts";
import {
  formatPromptLessons,
  mergePromptLessons,
  parseLessonId,
  parseLessonText,
  STANDING_LESSONS_FOOTER,
  STANDING_LESSONS_HEADING,
  type PromptLesson,
} from "./promptLessons.ts";

export type VoiceLessonDraft = {
  id: string;
  text: string;
};

export type VoiceTurnForLesson = {
  userText: string;
  assistantText: string;
  /** Lot snapshot text injected for this turn, if any. */
  lotNotes?: string;
};

export const VOICE_LESSON_LOT_ROW: VoiceLessonDraft = {
  id: "lot-row-is-stock",
  text: "If the stock number is on the RV Country lot sheet, answer from that row. Do not say it is not in online listings.",
};

export const VOICE_LESSON_PRINTED_FIELD: VoiceLessonDraft = {
  id: "read-printed-lot-field",
  text: "If a field is printed on the lot row, answer with that printed value. If it is not on the row, say it is not on the row. Do not guess.",
};

export const VOICE_LESSON_NO_INVENT: VoiceLessonDraft = {
  id: "do-not-invent-spec",
  text: "Do not invent a factory number, a tank, or a length. If it is not printed on the lot row or pinned, say it is not on the row.",
};

export const VOICE_LESSON_LOT_NOT_MISS: VoiceLessonDraft = {
  id: "lot-not-catalog-miss",
  text: "When he says the coach is on the lot, answer from the lot sheet. Do not call it a catalog miss.",
};

const LISTING_DENIAL =
  /not in (?:any )?online listings|not on the lot|not in the catalog|not in listings/i;

const HOLD_ONLY = /^(?:🎤\s*)?give me one second\.?$/i;

function clean(text: string): string {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function lessonTextHasCoachNumber(text: string): boolean {
  const bare = text.replace(/,/g, "");
  if (/\b\d{3,}\b/.test(bare)) return true;
  if (/\b[a-z]{2,6}\d{3,7}[a-z]{0,3}\b/i.test(text)) return true;
  return false;
}

export function voiceLessonDraft(raw: VoiceLessonDraft): VoiceLessonDraft | null {
  const id = parseLessonId(raw.id);
  const text = parseLessonText(raw.text);
  if (!id || !text) return null;
  if (lessonTextHasCoachNumber(text)) return null;
  return { id, text };
}

function rowWasThere(lotNotes: string): boolean {
  if (!lotNotes.trim()) return false;
  const hasStock = /\bstk\s+[A-Za-z0-9]/i.test(lotNotes);
  if (/Matched\s+0\b/i.test(lotNotes) && !hasStock) return false;
  return hasStock;
}

function notesCoverAsk(userText: string, lotNotes: string): boolean {
  if (!rowWasThere(lotNotes)) return false;
  const stock = parseOwnLotStockNumber(userText);
  if (stock) return lotNotes.toUpperCase().includes(stock.toUpperCase());
  if (looksLikeOwnLotStockQuestion(userText)) return true;
  return /\b(miles|mileage|odometer|length|tank|fresh|gray|grey|black|propane|gvwr)\b/i.test(
    userText,
  );
}

function printedValue(lotNotes: string, key: string): string | null {
  const re = new RegExp(`(?:^|[·\\n])\\s*${key}:\\s*([^·\\n]+)`, "i");
  const match = lotNotes.match(re);
  const value = match?.[1]?.replace(/\s+/g, " ").trim();
  return value || null;
}

function answerHasFigure(assistant: string, printed: string): boolean {
  const match = printed.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return assistant.toLowerCase().includes(printed.toLowerCase());
  const raw = match[0];
  const n = Number(raw);
  if (!Number.isFinite(n)) return false;
  const grouped = Math.round(n).toLocaleString("en-US");
  return (
    assistant.includes(raw) ||
    assistant.includes(grouped) ||
    assistant.includes(String(Math.round(n)))
  );
}

function askedMiles(userText: string): boolean {
  return (
    /\b(miles|mileage|odometer)\b/i.test(userText) &&
    !/\bmiles\s+(?:to|from|away|per)\b/i.test(userText)
  );
}

function ignoredPrintedField(userText: string, assistant: string, lotNotes: string): boolean {
  if (!notesCoverAsk(userText, lotNotes)) return false;
  const checks: Array<{ ask: boolean; key: string }> = [
    { ask: askedMiles(userText), key: "mileage" },
    { ask: /\blength\b/i.test(userText), key: "vehicle_body_length" },
    { ask: /\bfresh\b/i.test(userText), key: "total_fresh_water_tank_capacity" },
    {
      ask: /\b(gray|grey)\b/i.test(userText),
      key: "total_gray_water_tank_capacity",
    },
    { ask: /\bblack\b/i.test(userText), key: "total_black_water_tank_capacity" },
    { ask: /\bpropane\b/i.test(userText), key: "propane_lbs" },
    { ask: /\bpropane\b/i.test(userText), key: "total_propane_tank_capacity" },
  ];
  for (const check of checks) {
    if (!check.ask) continue;
    const printed = printedValue(lotNotes, check.key);
    if (!printed) continue;
    if (!answerHasFigure(assistant, printed)) return true;
  }
  return false;
}

function inventedSpec(assistant: string, lotNotes: string, userText: string): boolean {
  if (!notesCoverAsk(userText, lotNotes)) return false;
  const re =
    /\b(gvwr|uvw|dry weight|hitch|payload|fresh(?: water)?|gray(?: water)?|grey(?: water)?|black(?: water)?|propane|(?:body )?length)\b[^.]{0,48}?(\d[\d,]*(?:\.\d+)?)/gi;
  for (const match of assistant.matchAll(re)) {
    const figure = match[2]!.replace(/,/g, "");
    const grouped = Number(figure).toLocaleString("en-US");
    const notes = lotNotes.replace(/,/g, "");
    if (!notes.includes(figure) && !lotNotes.includes(grouped)) return true;
  }
  return false;
}

function salesmanCorrection(userText: string): VoiceLessonDraft | null {
  if (
    /\bnot a catalog miss\b/i.test(userText) ||
    /\bthat'?s the lot\b/i.test(userText) ||
    /\blot,\s*not (?:a )?catalog\b/i.test(userText)
  ) {
    return VOICE_LESSON_LOT_NOT_MISS;
  }
  if (
    /\b(you made that up|you invented|don'?t invent|do not invent|that number is not on the row)\b/i.test(
      userText,
    )
  ) {
    return VOICE_LESSON_NO_INVENT;
  }
  if (
    /\b(it'?s|that'?s|that is) on (?:our |the )?lot(?: sheet)?\b/i.test(userText) ||
    /\bread the (?:lot )?sheet\b/i.test(userText) ||
    /\bnot in (?:any )?online listings\b/i.test(userText)
  ) {
    return VOICE_LESSON_LOT_ROW;
  }
  return null;
}

/**
 * One standing lesson from this turn, or null.
 * A correct mileage, a blank field, or a one-off number writes nothing.
 */
export function lessonFromVoiceTurn(
  turn: VoiceTurnForLesson,
): VoiceLessonDraft | null {
  const userText = clean(turn.userText);
  const assistant = clean(turn.assistantText);
  const lotNotes = String(turn.lotNotes || "");
  if (!assistant || HOLD_ONLY.test(assistant)) return null;

  const corrected = salesmanCorrection(userText);
  if (corrected) return voiceLessonDraft(corrected);

  if (LISTING_DENIAL.test(assistant) && rowWasThere(lotNotes) && notesCoverAsk(userText, lotNotes)) {
    return voiceLessonDraft(VOICE_LESSON_LOT_ROW);
  }
  if (inventedSpec(assistant, lotNotes, userText)) {
    return voiceLessonDraft(VOICE_LESSON_NO_INVENT);
  }
  if (ignoredPrintedField(userText, assistant, lotNotes)) {
    return voiceLessonDraft(VOICE_LESSON_PRINTED_FIELD);
  }
  return null;
}

/**
 * Same id replaces the older rule and moves to the front.
 * Identical text is a no-op (null). Newest line stays inside the 1,800 cap.
 */
export function applyVoiceLesson(
  stored: readonly PromptLesson[],
  draft: VoiceLessonDraft,
  now = new Date().toISOString(),
): PromptLesson[] | null {
  const ready = voiceLessonDraft(draft);
  if (!ready) return null;
  const same = stored.find((lesson) => lesson.id === ready.id && !lesson.disabled);
  if (same && same.text === ready.text) return null;
  const lesson: PromptLesson = {
    id: ready.id,
    text: ready.text,
    updatedAt: now,
  };
  let next = [lesson, ...stored.filter((row) => row.id !== ready.id)];
  while (
    next.length > 1 &&
    !formatPromptLessons(mergePromptLessons(next)).includes(ready.text)
  ) {
    next = [lesson, ...next.slice(1, -1)];
  }
  return next;
}

/** Put one lesson line in front of the inject block. No-op if it is already there. */
export function appendStandingLessonLine(block: string, text: string): string {
  const line = parseLessonText(text);
  if (!line || lessonTextHasCoachNumber(line)) return block;
  if (block.includes(line)) return block;
  const bullets = block
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.startsWith("- "))
    .map((row) => row.slice(2).trim())
    .filter(Boolean);
  const lessons: PromptLesson[] = [line, ...bullets.filter((row) => row !== line)].map(
    (row, index) => ({
      id: `line-${index}`,
      text: row,
      updatedAt: "1970-01-01T00:00:00.000Z",
    }),
  );
  const formatted = formatPromptLessons(lessons);
  if (!formatted.includes(STANDING_LESSONS_HEADING)) return block;
  if (!formatted.includes(STANDING_LESSONS_FOOTER)) return block;
  return formatted;
}
