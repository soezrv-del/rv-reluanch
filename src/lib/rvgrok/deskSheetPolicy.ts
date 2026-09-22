/**
 * When speech may claim a desk spec sheet — no catalog / React imports.
 *
 * Mount gate is looksLikeDeskSheetAsk (explicit spec / weights / tanks /
 * engine / report). Naming a coach or a lineup overview does not open
 * the CARFAX desk. Paint rules once mounted live in deskSheet.ts.
 */

import { type CoachIdentity } from "./coachIdentity.ts";
import { parseCoachFromText } from "./parseCoach.ts";
import {
  looksLikeCarfaxQuestion,
  looksLikeCasualNonResearch,
  looksLikeInventoryOrCountQuestion,
  looksLikeOriginQuestion,
  looksLikeRepairQuestion,
  looksLikeSpecQuestion,
} from "./webIntent.ts";

export const DESK_SHEET_PHRASE = "Spec sheet is on the desk";

const DESK_CLAIM_RE =
  /\b(?:spec\s+sheet|spec\s+card|facts\s+(?:sheet|report)|report)\s+is\s+(?:right\s+)?on\s+(?:the\s+)?desk\b|\bon\s+the\s+desk\b|\bput\s+(?:the\s+)?(?:spec\s+)?sheet\s+on\s+(?:the\s+)?desk\b/i;

/** Explicit CARFAX-style / spec-report phrasing — including common misspellings. */
const DESK_REPORT_RE =
  /\b(?:full\s+report|spe[ck]k?s?\s+report|facts\s+(?:sheet|report)|carfax[- ]?(?:style\s+)?(?:report|sheet)|spec\s+sheet|put\s+(?:the\s+)?(?:spec\s+)?sheet\s+on\s+(?:the\s+)?desk|give\s+me\s+(?:a\s+|the\s+)?(?:full\s+)?report)\b/i;

/** Weights / tanks / written sheet — enough to keep a repair turn on the desk. */
const DESK_WEIGHT_OR_SHEET_RE =
  /\b(gvwr|gcwr|uvw|ccc|ncc|hitch|payload|weight|spec|brochure|full\s+report|spe[ck]k?s?\s+report|spec\s+sheet|facts\s+(?:sheet|report)|holding\s+tanks?)\b/i;

const LINEUP_OVERVIEW_RE =
  /\b(line[- ]?up|series overview|how many floorplans|floorplans?\s+(?:does|are|has)|motorized (?:line[- ]?up|series)|(?:what|which)\s+series\s+are\s+in|series\s+are\s+in)\b/i;

const SERIES_IN_LINEUP_RE =
  /\bseries\s+in\b.{0,80}\b(?:line[- ]?up|lineage|motorized)\b/i;

/** Lineage / series-in-lineup overview — chat-only unless they also ask specs. */
export function looksLikeLineupOverviewAsk(text: string): boolean {
  const t = text || "";
  if (!t.trim()) return false;
  return LINEUP_OVERVIEW_RE.test(t) || SERIES_IN_LINEUP_RE.test(t);
}

export function claimsDeskSpecSheet(text: string): boolean {
  return DESK_CLAIM_RE.test(text || "");
}

/** Year + make + model in the ask (floorplan optional). Identity helper — not a mount trigger. */
export function queryNamesYearMakeModel(query: string): boolean {
  const parsed = parseCoachFromText(query || "");
  return Boolean(
    parsed.year?.trim() && parsed.make?.trim() && parsed.model?.trim(),
  );
}

/**
 * Explicit specs / weights / tanks / engine / CARFAX-style report ask.
 * Lineup, lifestyle, repair-without-weights, inventory, origin, and
 * naming a coach without a spec ask stay chat-only.
 */
export function looksLikeDeskSheetAsk(text: string): boolean {
  const t = text || "";
  if (!t.trim()) return false;
  if (looksLikeCasualNonResearch(t)) return false;
  if (looksLikeOriginQuestion(t) && !looksLikeSpecQuestion(t)) return false;
  if (
    looksLikeInventoryOrCountQuestion(t) &&
    !looksLikeSpecQuestion(t) &&
    !DESK_REPORT_RE.test(t)
  ) {
    return false;
  }
  if (looksLikeRepairQuestion(t) && !DESK_WEIGHT_OR_SHEET_RE.test(t)) {
    return false;
  }
  if (
    looksLikeLineupOverviewAsk(t) &&
    !looksLikeSpecQuestion(t) &&
    !/\b(full\s+report|spe[ck]k?s?\s+report|spec\s+sheet)\b/i.test(t)
  ) {
    return false;
  }
  if (
    looksLikeCarfaxQuestion(t) &&
    !looksLikeSpecQuestion(t) &&
    !/\b(full\s+report|spe[ck]k?s?\s+report|spec\s+sheet|gvwr|uvw)\b/i.test(t)
  ) {
    return false;
  }
  if (looksLikeSpecQuestion(t)) return true;
  if (DESK_REPORT_RE.test(t)) return true;
  // Complete Y/M/M + "look up" is an explicit coach-fact pull, not lineup talk.
  if (/\blook(?:ing)?\s+up\b/i.test(t) && queryNamesYearMakeModel(t)) {
    return true;
  }
  return false;
}

export function shouldMountDeskSheet(
  query: string,
  identity: CoachIdentity | null | undefined,
): boolean {
  const q = query || "";
  if (!looksLikeDeskSheetAsk(q)) return false;
  if (identity?.make?.trim() && identity.model?.trim()) return true;
  if (queryNamesYearMakeModel(q)) return true;
  const parsed = parseCoachFromText(q);
  if (parsed.make?.trim() && parsed.model?.trim()) return true;
  return false;
}

export function formatDeskSheetMountedLine(identity: CoachIdentity): string {
  const coach = [identity.year, identity.make, identity.model, identity.floorplan]
    .filter(Boolean)
    .join(" ");
  return `DESK SPEC SHEET MOUNTED for ${coach}. You may say exactly: "${DESK_SHEET_PHRASE}." Speak THIS coach — never a prior series. Incomplete fields show as GAP on the sheet — do not write EST onto the desk or re-GAP a Facts number. Conversational answers may give a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin. If a field is non-GAP on the sheet or VERIFIED in LOCKED WEIGHTS, speak that number — never say you don't have it.`;
}

export const DESK_SHEET_FORBIDDEN_LINE = `DESK SPEC SHEET NOT MOUNTED. Never say the spec sheet / report is on the desk, or that a sheet is visible. Speak the answer only.`;

export function withDeskSheetSpeechRule(
  block: string,
  query: string,
  identity: CoachIdentity | null | undefined,
): string {
  const extra =
    shouldMountDeskSheet(query, identity) &&
    identity?.make?.trim() &&
    identity.model?.trim()
      ? formatDeskSheetMountedLine(identity)
      : DESK_SHEET_FORBIDDEN_LINE;
  const body = (block || "").trim();
  return body ? `${body}\n\n${extra}` : extra;
}
