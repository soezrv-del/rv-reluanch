/**
 * Live Voice spec turns speak from the shared spec engine.
 * Catalog first, then empty-field fallback. Never a memory snippet.
 * A coach or spec ask opens with the choice line. Full uses this engine.
 * Extras stay prompts — one at a time — the script does not load them.
 */

import type { DeskSheetPayload, DeskSheetRow } from "./deskSheet.ts";
import { looksLikeDeskSheetAsk } from "./deskSheetPolicy.ts";
import { looksLikeCoachReportAsk } from "./coachReport.ts";
import { GROK_EXTRA_PROMPTS, voiceSpecExtraPrompts } from "./grokExtras.ts";
import {
  looksLikeNamedCoachProductQuestion,
  normalizeAskText,
} from "./webIntent.ts";

export const VOICE_SPEC_ENGINE_INSTRUCTIONS =
  "Say exactly the SPEC ENGINE SCRIPT and then stop. Those numbers are the catalog and fallback chain for this turn. Do not add, replace, or estimate any spec from memory. Do not load NHTSA recalls, market value, videos, owner reviews, or a maintenance schedule. Those are on-screen prompts the user picks. If the script says a field was missed, say that and do not guess a number.";

/** First spoken line on any Live Voice coach or spec ask. */
export const VOICE_COACH_CHOICE_LINE =
  "Of course, right away — would you like a full report or a quick overview?";

export const VOICE_COACH_CHOICE_INSTRUCTIONS = `Say only this, then stop: ${VOICE_COACH_CHOICE_LINE}`;

export type VoiceCoachDepth = "full" | "quick";

const EXTRAS_OFFER =
  "Spec sheet is on the desk. You can pick recalls, market value, videos, owner reviews, or maintenance. I won't load those until you choose.";

function coachLine(sheet: DeskSheetPayload): string {
  return [sheet.year, sheet.make, sheet.model, sheet.floorplan]
    .filter(Boolean)
    .join(" ");
}

function isEmptyValue(value: string): boolean {
  const s = (value || "").trim();
  return (
    !s ||
    s === "GAP" ||
    s === "—" ||
    s === "–" ||
    s === "-" ||
    /confirm brochure/i.test(s)
  );
}

/** Spoken source for a painted row. Catalog when the fallback chain did not fill it. */
export function voiceSpecSourcePhrase(row: Pick<DeskSheetRow, "sourceUrl">): string {
  const url = row.sourceUrl || "";
  if (!url) return "from the catalog";
  if (/brochure|\.pdf(?:\?|$)/i.test(url)) return "from the OEM brochure";
  if (/rvusa\.com/i.test(url)) return "from RVUSA";
  if (/rvguide\.com/i.test(url)) return "from RV Guide";
  return "from dealer inventory";
}

function speakValue(value: string): string {
  const v = value.replace(/\*+$/g, "").trim();
  if (/\blbs?\b/i.test(v)) return v.replace(/\blbs?\b/i, "pounds");
  if (/\bgal\b/i.test(v)) return v.replace(/\bgal\b/i, "gallons");
  return v;
}

function askedLabels(query: string): string[] {
  const labels: string[] = [];
  if (/\b(uvw|dry\s+weight|unloaded)\b/i.test(query)) labels.push("UVW");
  if (/\bgvwr\b/i.test(query)) labels.push("GVWR");
  if (/\bccc\b|\bncc\b|\bpayload\b/i.test(query)) labels.push("CCC");
  if (/\bfuel\b/i.test(query)) labels.push("Fuel capacity");
  if (/\bfresh\b/i.test(query)) labels.push("Fresh");
  if (/\bgr[ae]y\b/i.test(query)) labels.push("Gray");
  if (/\bblack\b/i.test(query)) labels.push("Black");
  if (!labels.length && /\bweight\b/i.test(query)) {
    labels.push("GVWR", "UVW");
  }
  return labels;
}

function rowSpeech(row: DeskSheetRow, query: string): string {
  const dry =
    row.label === "UVW" &&
    (row.asterisk || /\bdry\s+weight\b/i.test(query))
      ? " dry weight"
      : "";
  return `${row.label}${dry} is ${speakValue(row.value)}, ${voiceSpecSourcePhrase(row)}.`;
}

const CHOICE_FILLER =
  /\b(of course|right away|would you like|i(?:'d| would)?|like|want|give me|the|a|an|or|please|just|yes|yeah|yep|sure)\b/gi;

/**
 * A short follow-up that picks full or quick. A coach name in the same
 * line is a new ask, not a pick.
 */
export function classifyVoiceCoachDepth(text: string): VoiceCoachDepth | null {
  const t = normalizeAskText(text).trim();
  if (!t || t.length > 120) return null;
  const wantsFull =
    /\bfull(?:\s+desk)?\s+report\b/i.test(t) || /^\s*full\s*[.!?]*$/i.test(t);
  const wantsQuick =
    /\bquick(?:\s+overview)?\b/i.test(t) || /^\s*overview\s*[.!?]*$/i.test(t);
  if (wantsFull === wantsQuick) return null;
  const rest = t
    .replace(/\bfull(?:\s+desk)?\s+report\b/gi, " ")
    .replace(/\bquick(?:\s+overview)?\b/gi, " ")
    .replace(/\b(overview|full|desk|report)\b/gi, " ")
    .replace(CHOICE_FILLER, " ")
    .replace(/[^a-z0-9]+/gi, "");
  if (rest.length > 0) return null;
  return wantsFull ? "full" : "quick";
}

/** Coach or spec ask — the choice line comes before any report. */
export function looksLikeVoiceCoachOrSpecAsk(text: string): boolean {
  const t = text || "";
  if (!t.trim()) return false;
  if (looksLikeDeskSheetAsk(t)) return true;
  if (looksLikeCoachReportAsk(t)) return true;
  if (looksLikeNamedCoachProductQuestion(t)) return true;
  return false;
}

/** Yes/no/next while extras are being offered. Not a new coach ask. */
export function isVoiceExtraNudge(text: string): boolean {
  const t = normalizeAskText(text).trim();
  if (!t || t.length > 48) return false;
  if (classifyVoiceCoachDepth(t)) return false;
  if (looksLikeVoiceCoachOrSpecAsk(t)) return false;
  return /^(yes|yeah|yep|yup|sure|ok|okay|no|nope|nah|next|skip|not now|go on|continue)([.!\s]|$)/i.test(
    t,
  );
}

export function isVoiceExtraDecline(text: string): boolean {
  return /^(no|nope|nah|next|skip|not now)\b/i.test(normalizeAskText(text).trim());
}

/** Existing Facts prompt title at this index. Null when the list is done. */
export function voiceExtraPromptLine(
  sheet: Pick<DeskSheetPayload, "year" | "make" | "model" | "floorplan"> | null,
  index: number,
): string | null {
  if (!sheet || index < 0) return null;
  const kind = voiceSpecExtraPrompts(sheet)[index];
  if (!kind) return null;
  return GROK_EXTRA_PROMPTS[kind].title;
}

/**
 * Exact words for a Live Voice spec turn. Empty / GAP stays a miss.
 * Does not invent a number the painted sheet does not contain.
 * `all` is the full report: every painted spec, no bundled extras line.
 */
export function formatVoiceSpecEngineSpeech(
  sheet: DeskSheetPayload | null,
  query: string,
  scope: "asked" | "all" = "asked",
): string {
  if (!sheet) {
    return "Catalog and the fallback chain both missed this coach. I won't guess a number.";
  }
  const lines: string[] = [];
  const coach = coachLine(sheet);
  if (coach) lines.push(`${coach}.`);
  if (scope === "all") {
    const painted = sheet.rows.filter(
      (r) => !r.gap && !isEmptyValue(r.value) && r.value !== "N/A",
    );
    if (!painted.length) {
      lines.push(
        "Catalog and the fallback chain both missed the spec fields. I won't guess.",
      );
    } else {
      for (const row of painted) lines.push(rowSpeech(row, query));
    }
    return lines.join(" ");
  }
  const asked = askedLabels(query);
  if (asked.length) {
    for (const label of asked) {
      const row = sheet.rows.find((r) => r.label === label);
      if (!row || row.gap || isEmptyValue(row.value)) {
        lines.push(
          `${label} is still missing after the catalog and the fallback chain. I won't guess.`,
        );
        continue;
      }
      lines.push(rowSpeech(row, query));
    }
  } else {
    const painted = sheet.rows.filter(
      (r) => !r.gap && !isEmptyValue(r.value) && r.value !== "N/A",
    );
    if (!painted.length) {
      lines.push(
        "Catalog and the fallback chain both missed the spec fields. I won't guess.",
      );
    } else {
      for (const row of painted.slice(0, 8)) lines.push(rowSpeech(row, query));
      if (painted.length > 8) {
        lines.push("The rest of the spec sheet is on the desk.");
      }
    }
  }
  lines.push(EXTRAS_OFFER);
  return lines.join(" ");
}

/** Quick overview — the catalog coach line only. No spec dump, no extras. */
export function formatVoiceQuickOverview(
  sheet: DeskSheetPayload | null,
): string {
  if (!sheet) {
    return "Catalog and the fallback chain both missed this coach. I won't guess a number.";
  }
  const coach = coachLine(sheet);
  return coach
    ? `${coach}.`
    : "Catalog and the fallback chain both missed this coach. I won't guess a number.";
}

/** Live Voice spec cards offer extras. Chat sheets stay keyword-gated. */
export function withVoiceSpecExtras<T extends DeskSheetPayload>(
  sheet: T | null,
  query: string,
  opts?: { force?: boolean; step?: number },
): T | null {
  if (!sheet) return sheet;
  if (!opts?.force && !looksLikeDeskSheetAsk(query)) return sheet;
  const next: T = { ...sheet, offerVoiceExtras: true };
  if (typeof opts?.step === "number") next.voiceExtraStep = opts.step;
  return next;
}
