/**
 * When speech may claim a desk spec sheet — no catalog / React imports.
 */

import {
  askNamesCoachIdentity,
  type CoachIdentity,
} from "./coachIdentity.ts";
import {
  looksLikeCasualNonResearch,
  looksLikeNamedCoachProductQuestion,
  looksLikeSpecQuestion,
} from "./webIntent.ts";

export const DESK_SHEET_PHRASE = "Spec sheet is on the desk";

const DESK_CLAIM_RE =
  /\b(?:spec\s+sheet|spec\s+card|facts\s+(?:sheet|report)|report)\s+is\s+(?:right\s+)?on\s+(?:the\s+)?desk\b|\bon\s+the\s+desk\b|\bput\s+(?:the\s+)?(?:spec\s+)?sheet\s+on\s+(?:the\s+)?desk\b/i;

export function claimsDeskSpecSheet(text: string): boolean {
  return DESK_CLAIM_RE.test(text || "");
}

export function shouldMountDeskSheet(
  query: string,
  identity: CoachIdentity | null | undefined,
): boolean {
  if (!identity?.make?.trim() || !identity.model?.trim()) return false;
  const q = query || "";
  if (looksLikeCasualNonResearch(q) && !askNamesCoachIdentity(identity)) {
    return false;
  }
  if (askNamesCoachIdentity(identity)) return true;
  if (looksLikeSpecQuestion(q) || looksLikeNamedCoachProductQuestion(q)) {
    return true;
  }
  if (/\blook(?:ing)?\s+up\b|\breport\b|\bspec(?:s| sheet)?\b/i.test(q)) {
    return true;
  }
  return identity.source === "facts" && Boolean(q.trim());
}

export function formatDeskSheetMountedLine(identity: CoachIdentity): string {
  const coach = [identity.year, identity.make, identity.model, identity.floorplan]
    .filter(Boolean)
    .join(" ");
  return `DESK SPEC SHEET MOUNTED for ${coach}. You may say exactly: "${DESK_SHEET_PHRASE}." Speak THIS coach — never a prior series. Incomplete fields show as GAP on the sheet; do not invent UVW, GVWR, or torque.`;
}

export const DESK_SHEET_FORBIDDEN_LINE = `DESK SPEC SHEET NOT MOUNTED. Never say the spec sheet / report is on the desk, or that a sheet is visible. Speak the answer only.`;

export function withDeskSheetSpeechRule(
  block: string,
  query: string,
  identity: CoachIdentity | null | undefined,
): string {
  const extra = shouldMountDeskSheet(query, identity)
    ? formatDeskSheetMountedLine(identity!)
    : DESK_SHEET_FORBIDDEN_LINE;
  const body = (block || "").trim();
  return body ? `${body}\n\n${extra}` : extra;
}
