/**
 * Live Voice spec turns speak from the shared spec engine.
 * Catalog first, then empty-field fallback. Never a memory snippet.
 * A coach or spec ask opens with the choice line unless they already
 * chose full/report or short/quick/overview. Full uses this engine.
 * After either length, offer all five extras at once. The script does not load them.
 */

import type { DeskSheetPayload, DeskSheetRow } from "./deskSheet.ts";
import { looksLikeDeskSheetAsk } from "./deskSheetPolicy.ts";
import { looksLikeCoachReportAsk, stripSpokenSourceTags } from "./coachReport.ts";
import { formatChatSpecMissReply, mappedWeightFields } from "./chatSpecBlock.ts";
export { formatChatSpecMissReply };
import {
  GROK_EXTRA_PROMPTS,
  VOICE_EXTRAS_OFFER_LINE,
  voiceSpecExtraPrompts,
  type GrokExtraKind,
} from "./grokExtras.ts";
import {
  looksLikeCompanyOrPlantAsk,
  looksLikeNamedCoachProductQuestion,
  normalizeAskText,
} from "./webIntent.ts";
import { parseCoachFromText } from "./parseCoach.ts";

export const VOICE_SPEC_ENGINE_INSTRUCTIONS =
  "Say exactly the SPEC ENGINE SCRIPT and then stop. Those numbers are the catalog and fallback chain for this turn. Do not add, replace, or estimate any spec from memory. Never speak a GVWR, UVW, CCC, fuel, fresh, gray, or black number unless that exact figure is in the script. If the script says a field is still missing or that you are checking live sources, say that and do not invent a number. Do not load NHTSA recalls, market value, videos, owner reviews, or a maintenance schedule. Those are on-screen prompts the user picks. Feature-to-benefit lines apply only to numbers in the script.";

/** First spoken line on any Live Voice coach or spec ask. */
export const VOICE_COACH_CHOICE_LINE =
  "Would you like a full report or a quick overview?";

export const VOICE_COACH_CHOICE_INSTRUCTIONS = `Say only this, then stop: ${VOICE_COACH_CHOICE_LINE}`;

export type VoiceCoachDepth = "full" | "quick";

const EXTRAS_OFFER = VOICE_EXTRAS_OFFER_LINE;

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

/**
 * Spoken source tag for a painted row.
 * Always empty: the desk pin holds provenance. Bubbles must not say
 * "from the catalog" / "per the catalog" / brochure / dealer on each field.
 */
export function voiceSpecSourcePhrase(_row: Pick<DeskSheetRow, "sourceUrl">): string {
  return "";
}

function speakValue(value: string): string {
  const v = value.replace(/\*+$/g, "").trim();
  if (/\blbs?\b/i.test(v)) return v.replace(/\blbs?\b/i, "pounds");
  if (/\bgal\b/i.test(v)) return v.replace(/\bgal\b/i, "gallons");
  return v;
}

function askedLabels(query: string): string[] {
  const labels: string[] = [...mappedWeightFields(query)];
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

/** Full-report feature→benefit. Numbers stay the painted value; no invented specs. */
function featureBenefit(label: string): string {
  if (label === "Torque") return " That's hill power and pull off the line.";
  if (label === "Horsepower") return " That's passing power.";
  if (/tow/i.test(label)) return " That's what they can pull.";
  if (label === "Fuel capacity" || label === "Fresh" || label === "Gray" || label === "Black") {
    return " That means fewer stops.";
  }
  return "";
}

function rowSpeech(row: DeskSheetRow, query: string, withBenefit: boolean): string {
  const dry =
    row.label === "UVW" &&
    (row.asterisk || /\bdry\s+weight\b/i.test(query))
      ? " dry weight"
      : "";
  const benefit = withBenefit ? featureBenefit(row.label) : "";
  return stripSpokenSourceTags(
    `${row.label}${dry} is ${speakValue(row.value)}.${benefit}`,
  );
}

function missingOnce(labels: string[]): string | null {
  const unique = [...new Set(labels.map((l) => l.trim()).filter(Boolean))];
  if (!unique.length) return null;
  const checking = "I'm checking live sources.";
  if (unique.length === 1) {
    return `${unique[0]} is still missing. ${checking} I won't guess.`;
  }
  const last = unique[unique.length - 1];
  return `Still missing: ${unique.slice(0, -1).join(", ")} and ${last}. ${checking} I won't guess.`;
}

const LIVE_FIELD_RE =
  /\b(gvwr?|tvwr|gross\s+vehicle\s+weight|uvw|ccc|ncc|payload|fuel|fresh|gr[ae]y|black|dry\s+weight|unloaded)\b/i;

/** "Why didn't you pull GVWR" / "why isn't the UVW there". */
const META_FIELD_RE =
  /\bwhy\b[\s\S]{0,80}\b(pull|didn'?t|did not|missing|isn'?t|wasn'?t|not (?:pull|get|have|show|there))\b/i;

/**
 * Explicit report asks only. Same set as the Coach knowledge trigger.
 * 'full report,' 'tell me everything about,' 'specs on,' or 'CARFAX on.'
 */
const EXPLICIT_REPORT_RE =
  /\bfull\s+report\b|\btell me everything about\b|\bspecs on\b|\bcarfax on\b/i;

export function looksLikeExplicitVoiceReportAsk(text: string): boolean {
  return EXPLICIT_REPORT_RE.test(normalizeAskText(text || ""));
}

/**
 * "tell me about [coach]" — a short coach turn.
 * Distinct from "tell me everything about", which is an explicit report.
 */
export function looksLikeVoiceTellMeAboutAsk(text: string): boolean {
  const t = normalizeAskText(text || "").trim();
  if (!t || looksLikeExplicitVoiceReportAsk(t)) return false;
  if (looksLikeCompanyOrPlantAsk(t)) return false;
  return /\b(?:tell me|know|learn|hear) about\b/i.test(t);
}

/** "The 35K" / "35K" after a series is already locked. Not a new coach name. */
export function looksLikeFloorplanOnlyPick(text: string): boolean {
  const t = normalizeAskText(text || "").trim();
  if (!t || t.length > 32 || looksLikeExplicitVoiceReportAsk(t)) return false;
  const parsed = parseCoachFromText(t);
  if (!parsed.floorplan) return false;
  return !parsed.year && !parsed.make && !parsed.model;
}

/**
 * Field-only or meta follow-up, including a named coach plus one field.
 * "just the GVWR", "what's the GVWR", "the UVW", "why didn't you pull X".
 */
export function looksLikeVoiceFieldOrMetaAsk(text: string): boolean {
  const t = normalizeAskText(text).trim();
  if (!t) return false;
  if (looksLikeExplicitVoiceReportAsk(t)) return false;
  if (voiceDepthAlreadyChosen(t) && !LIVE_FIELD_RE.test(t)) return false;
  if (META_FIELD_RE.test(t)) return true;
  return LIVE_FIELD_RE.test(t);
}

/**
 * Choice line only for an explicit report ask whose length is still ambiguous.
 * Bare coach mention, single-field, and locked field follow-ups do not ask.
 */
export function shouldSpeakVoiceCoachChoice(opts: {
  transcript: string;
  coachLocked: boolean;
}): boolean {
  if (!looksLikeExplicitVoiceReportAsk(opts.transcript)) return false;
  if (voiceDepthAlreadyChosen(opts.transcript)) return false;
  if (opts.coachLocked && looksLikeVoiceFieldOrMetaAsk(opts.transcript)) {
    return false;
  }
  return true;
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
    /\bfull(?:\s+desk)?\s+report\b/i.test(t) ||
    /\breport\b/i.test(t) ||
    /^\s*full\s*[.!?]*$/i.test(t);
  const wantsQuick =
    /\b(short|quick)(?:\s+overview)?\b/i.test(t) ||
    /\boverview\b/i.test(t);
  if (wantsFull === wantsQuick) return null;
  const rest = t
    .replace(/\bfull(?:\s+desk)?\s+report\b/gi, " ")
    .replace(/\b(short|quick)(?:\s+overview)?\b/gi, " ")
    .replace(/\b(overview|full|desk|report|short|quick)\b/gi, " ")
    .replace(CHOICE_FILLER, " ")
    .replace(/[^a-z0-9]+/gi, "");
  if (rest.length > 0) return null;
  return wantsFull ? "full" : "quick";
}

/**
 * Depth already named in this utterance, even with a coach in the same line.
 * Both lengths at once is ambiguous — ask. Otherwise skip the choice line.
 */
export function voiceDepthAlreadyChosen(text: string): VoiceCoachDepth | null {
  const t = normalizeAskText(text).trim();
  if (!t) return null;
  const wantsQuick = /\b(short|quick|overview)\b/i.test(t);
  const wantsFull = /\b(full|report)\b/i.test(t);
  if (wantsQuick === wantsFull) return null;
  return wantsQuick ? "quick" : "full";
}

/** One of the five extras, and not a new coach ask. */
export function classifyVoiceExtraPick(text: string): GrokExtraKind | null {
  const t = normalizeAskText(text).trim();
  if (!t || t.length > 80) return null;
  if (looksLikeVoiceCoachOrSpecAsk(t)) return null;
  const hits: GrokExtraKind[] = [];
  if (/\bratings?\b|\btorque[-\s]?to[-\s]?weight\b/i.test(t)) hits.push("ratings");
  if (/\bmarket(?:\s+value)?\b|\bworth\b/i.test(t)) hits.push("market");
  if (/\bvideos?\b|\byoutube\b|\bwalkthrough\b/i.test(t)) hits.push("video");
  if (/\bnhtsa\b|\brecalls?\b|\bsafety\b/i.test(t)) hits.push("nhtsa");
  if (/\bmaintenance\b|\bservice\b/i.test(t)) hits.push("maintenance");
  if (hits.length !== 1) return null;
  return hits[0]!;
}

/** Coach or spec ask — the choice line comes before any report. */
export function looksLikeVoiceCoachOrSpecAsk(text: string): boolean {
  const t = text || "";
  if (!t.trim()) return false;
  if (looksLikeCompanyOrPlantAsk(t)) return false;
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
 * Exact words for a Live Voice spec turn. A weight ask calls get_coach_facts
 * (via formatChatSpecMissReply) before any "still missing" sentence.
 * Extras only on an explicit full report.
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
    const missed = sheet.rows
      .filter((r) => r.gap || isEmptyValue(r.value))
      .map((r) => r.label);
    if (!painted.length) {
      lines.push("The spec fields are still missing. I won't guess.");
    } else {
      for (const row of painted) lines.push(rowSpeech(row, query, true));
      const once = missingOnce(missed);
      if (once) lines.push(once);
    }
    lines.push(EXTRAS_OFFER);
    return stripSpokenSourceTags(lines.join(" "));
  }
  const asked = askedLabels(query);
  const weightAsk = asked.some((label) => label === "GVWR" || label === "UVW");
  if (weightAsk) {
    const reply = formatChatSpecMissReply({
      query,
      year: sheet.year,
      make: sheet.make,
      model: sheet.model,
      floorplan: sheet.floorplan,
    });
    if (reply) return stripSpokenSourceTags(reply);
  }
  if (asked.length) {
    const missed: string[] = [];
    for (const label of asked) {
      const row = sheet.rows.find((r) => r.label === label);
      if (!row || row.gap || isEmptyValue(row.value)) {
        missed.push(label);
        continue;
      }
      lines.push(rowSpeech(row, query, false));
    }
    const once = missingOnce(missed);
    if (once) lines.push(once);
  } else {
    const painted = sheet.rows.filter(
      (r) => !r.gap && !isEmptyValue(r.value) && r.value !== "N/A",
    );
    if (!painted.length) {
      lines.push("The spec fields are still missing. I won't guess.");
    } else {
      for (const row of painted.slice(0, 8)) lines.push(rowSpeech(row, query, false));
      if (painted.length > 8) {
        lines.push("The rest of the spec sheet is on the desk.");
      }
    }
  }
  return stripSpokenSourceTags(lines.join(" "));
}

/**
 * Quick overview — the catalog coach line only. No spec dump.
 * Extras are spoken only after an explicit report's quick overview.
 */
export function formatVoiceQuickOverview(
  sheet: DeskSheetPayload | null,
  opts?: { offerExtras?: boolean },
): string {
  if (!sheet) {
    return "Catalog and the fallback chain both missed this coach. I won't guess a number.";
  }
  const coach = coachLine(sheet);
  const line = coach
    ? `${coach}.`
    : "Catalog and the fallback chain both missed this coach. I won't guess a number.";
  if (!opts?.offerExtras) {
    const clip = shortCoachClip(sheet);
    return clip ? `${line} ${clip}` : line;
  }
  return `${line} ${EXTRAS_OFFER}`;
}

/** Two locked facts. Not a report. */
function shortCoachClip(sheet: DeskSheetPayload): string {
  const bits: string[] = [];
  for (const label of ["Engine", "Chassis"]) {
    const row = sheet.rows.find(
      (r) => r.label === label && !r.gap && r.value && r.value !== "N/A",
    );
    if (!row) continue;
    bits.push(`${label} is ${row.value.replace(/\*$/, "").trim()}.`);
    if (bits.length === 2) break;
  }
  return bits.join(" ");
}

/** Live Voice spec cards offer extras. Chat sheets stay keyword-gated. */
export function withVoiceSpecExtras<T extends DeskSheetPayload>(
  sheet: T | null,
  query: string,
  opts?: { force?: boolean; step?: number; pick?: GrokExtraKind },
): T | null {
  if (!sheet) return sheet;
  if (!opts?.force && !looksLikeDeskSheetAsk(query)) return sheet;
  const next: T = { ...sheet, offerVoiceExtras: true };
  if (opts?.pick) next.voiceExtraPick = opts.pick;
  return next;
}
