/**
 * Conversational estimate + catalog-miss search contract.
 *
 * Desk / SPEC REPORT stays on the Facts brochure snapshot (#419).
 * Chat + live voice may guesstimate missing coach fields — labeled,
 * never silent OEM fact.
 */

/** Catalog miss / no OEM pin: search is required, not optional. */
export const CATALOG_MISS_MUST_SEARCH =
  "When the catalog / OEM pin does not have the answer, you MUST run WEB RESEARCH this turn before answering — not optional, not last resort.";

/** After research (or if search fails), still answer — labeled, never silent invent. */
export const LABELED_ESTIMATE_RULE =
  "After research (or if search is unavailable), YOU still answer with a labeled estimate: mark it EST / estimate / typical class range. Never present an estimate as an OEM pin or brochure fact. Never silent-invent a number as fact.";

/** #419 — desk sheet matches Facts. Estimates stay off the desk. */
export const DESK_STAYS_FACTS =
  "Desk spec sheet / Grok SPEC REPORT stays on the Facts brochure snapshot. Do not write EST numbers onto the desk. Do not re-GAP a VERIFIED or Facts number.";

export const ESTIMATE_STANDING_POLICY = `${DESK_STAYS_FACTS} Conversational chat + live voice: ${CATALOG_MISS_MUST_SEARCH} ${LABELED_ESTIMATE_RULE}`;

const ESTIMATE_LABEL_RE = /\b(EST\.?|estimate|typical class range)\b/i;
const OEM_PIN_CLAIM_RE =
  /\b(OEM pin|verified catalog|brochure fact|brochure pin)\b/i;

/** True when the answer is marked EST / estimate / typical class range. */
export function isLabeledEstimateAnswer(text: string): boolean {
  return ESTIMATE_LABEL_RE.test(text || "");
}

/**
 * True when a number is framed as an OEM / brochure pin without an
 * estimate label — the silent-invent path David rejected.
 */
export function presentsEstimateAsOemPin(text: string): boolean {
  const t = text || "";
  if (!/\d/.test(t)) return false;
  if (isLabeledEstimateAnswer(t)) return false;
  return OEM_PIN_CLAIM_RE.test(t);
}

export function formatLabeledEstimate(
  value: string,
  kind = "typical class range",
): string {
  const v = (value || "").trim();
  return `${v} (EST — ${kind})`;
}
