/**
 * Server check for a Live Voice auto-lesson before it reaches the global
 * prompt_lessons row (every phone reads it).
 *
 * The phone posts its own `assistant` text and `lotNotes`. Neither is
 * trusted here. The server rebuilds the lot row from its own snapshot
 * (the stock in the user line must be a real unit), adds the catalog desk
 * sheet for that coach, and re-runs the detector on that. Only one of the
 * four voice auto-rule ids can be upserted. Anything else is pending only.
 */

import { resolveDeskSheet } from "./deskSheet.ts";
import { parseOwnLotStockNumber } from "./ownLotAsk.ts";
import {
  formatOwnLotBlock,
  ownLotIsUnavailable,
  type OwnLotSnapshot,
  type OwnLotUnit,
} from "./ownLotInventory.ts";
import {
  isVoiceLessonId,
  lessonFromVoiceTurn,
  type VoiceLessonDraft,
} from "./voiceLesson.ts";

function stockKey(raw: string): string {
  return String(raw || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}

function escapeRe(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The one real lot unit the user line names by stock number, or null. */
export function serverLotUnitForVoiceLine(
  userText: string,
  snapshot: OwnLotSnapshot | null | undefined,
): OwnLotUnit | null {
  if (!snapshot || ownLotIsUnavailable(snapshot)) return null;
  const asked = stockKey(parseOwnLotStockNumber(userText) || "");
  if (!asked) return null;
  const hits = snapshot.units.filter((unit) => stockKey(unit.stock_number) === asked);
  return hits.length === 1 ? hits[0]! : null;
}

function deskSheetLines(unit: OwnLotUnit): string[] {
  try {
    const query = [unit.year, unit.make, unit.model, unit.trim].filter(Boolean).join(" ");
    const sheet = resolveDeskSheet({
      query,
      identity: null,
      specs: null,
      mountForVoiceReport: true,
    });
    if (!sheet) return [];
    return sheet.rows
      .filter((row) => !row.gap && row.value.trim())
      .map((row) => `Desk sheet ${row.label} = ${row.value}`);
  } catch {
    return [];
  }
}

/**
 * Lot notes the server builds for this user line: the snapshot row for the
 * named stock plus the catalog desk sheet. Null when the line names no real unit.
 */
export function serverLotNotesForVoiceLine(
  userText: string,
  snapshot: OwnLotSnapshot | null | undefined,
): string | null {
  const unit = serverLotUnitForVoiceLine(userText, snapshot);
  if (!unit || !snapshot) return null;
  const stk = new RegExp(`\\bstk\\s+${escapeRe(unit.stock_number)}(?:\\s|·|$)`, "i");
  const rows = formatOwnLotBlock(snapshot, userText)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") && stk.test(line));
  if (!rows.length) return null;
  return [
    "OWN-LOT inventory (server check):",
    `Lot total: ${snapshot.units.length} units.`,
    ...rows.slice(0, 1),
    ...deskSheetLines(unit),
  ].join("\n");
}

/**
 * The voice lesson the server itself can stand behind, or null.
 * `assistantText` is still the phone's words, but the lot row, the desk
 * sheet, and the stock come from the server, and only an auto-rule id passes.
 */
export function verifyVoiceLessonOnServer(opts: {
  userText: string;
  assistantText: string;
  snapshot: OwnLotSnapshot | null | undefined;
}): VoiceLessonDraft | null {
  const lotNotes = serverLotNotesForVoiceLine(opts.userText, opts.snapshot);
  if (!lotNotes) return null;
  const lesson = lessonFromVoiceTurn({
    userText: opts.userText,
    assistantText: opts.assistantText,
    lotNotes,
  });
  if (!lesson || !isVoiceLessonId(lesson.id)) return null;
  return lesson;
}

export type VoiceLessonPostDeps = {
  loadSnapshot: () => Promise<OwnLotSnapshot>;
  upsertVoiceLesson: (draft: VoiceLessonDraft) => Promise<string>;
  queuePendingPromptLesson: (text: string) => Promise<void>;
};

/**
 * POST /api/rvgrok/memory voice path. A server-verified miss upserts the
 * global standing lesson. A lesson only the phone's text supports goes to
 * pending for admin review and never touches prompt_lessons.
 */
export async function learnVoiceLessonFromPost(
  turn: {
    userText: string;
    assistantText: string;
    /** Built on the phone from its own lotNotes. Pending only. */
    clientLesson: VoiceLessonDraft | null;
  },
  deps: VoiceLessonPostDeps,
): Promise<{ lessons: string; verified: VoiceLessonDraft | null }> {
  let snapshot: OwnLotSnapshot | null = null;
  if (parseOwnLotStockNumber(turn.userText)) {
    try {
      snapshot = await deps.loadSnapshot();
    } catch {
      snapshot = null;
    }
  }
  const verified = verifyVoiceLessonOnServer({
    userText: turn.userText,
    assistantText: turn.assistantText,
    snapshot,
  });
  if (verified) {
    return { lessons: await deps.upsertVoiceLesson(verified), verified };
  }
  if (turn.clientLesson) await deps.queuePendingPromptLesson(turn.clientLesson.text);
  return { lessons: "", verified: null };
}
