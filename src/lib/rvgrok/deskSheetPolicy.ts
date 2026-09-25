/**
 * When speech may claim a desk spec sheet — no catalog / React imports.
 *
 * Mount gate is looksLikeDeskSheetAsk: a full report, spec report, or
 * CARFAX-style sheet. Naming a coach, a GVWR, or a lineup overview does
 * not open the desk. Paint rules once mounted live in deskSheet.ts.
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

/** Explicit full report / CARFAX-style sheet — including common misspellings. */
const DESK_REPORT_RE =
  /\b(?:full\s+report|tell me everything about|specs on|spe[ck]k?s?\s+report|facts\s+(?:sheet|report)|carfax[- ]?(?:style\s+)?(?:report|sheet)|carfax\s+on|desk\s+report|spec\s+sheet|put\s+(?:the\s+)?(?:spec\s+)?sheet\s+on\s+(?:the\s+)?desk|give\s+me\s+(?:a\s+|the\s+)?(?:full\s+)?report)\b/i;

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
 * Full report / CARFAX-style sheet only.
 * A coach mention, look-up, GVWR, or other single spec stays an overview
 * in the chat — it does not mount the desk.
 */
export function looksLikeDeskSheetAsk(text: string): boolean {
  const t = text || "";
  if (!t.trim()) return false;
  if (looksLikeCasualNonResearch(t)) return false;
  if (looksLikeOriginQuestion(t) && !DESK_REPORT_RE.test(t)) return false;
  if (looksLikeInventoryOrCountQuestion(t) && !DESK_REPORT_RE.test(t)) {
    return false;
  }
  if (looksLikeRepairQuestion(t) && !DESK_REPORT_RE.test(t)) return false;
  if (looksLikeLineupOverviewAsk(t) && !DESK_REPORT_RE.test(t)) return false;
  if (looksLikeCarfaxQuestion(t) && !DESK_REPORT_RE.test(t)) return false;
  // Spec words alone (GVWR, engine, tanks) are an overview, not the desk.
  if (looksLikeSpecQuestion(t) && !DESK_REPORT_RE.test(t)) return false;
  return DESK_REPORT_RE.test(t);
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

export const DESK_SHEET_FORBIDDEN_LINE = `DESK SPEC SHEET NOT MOUNTED. Never say the spec sheet / report is on the desk, or that a sheet is visible. Speak the answer. A follow-up on the same thread is fine.`;

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
