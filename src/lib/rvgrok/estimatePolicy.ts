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

/**
 * After the research loop is exhausted (N genuine rephrased attempts, all
 * unconfirmed) — or search stays unavailable after those attempts — still
 * answer. Never EST after a single miss.
 */
export const LABELED_ESTIMATE_RULE =
  "A labeled estimate is allowed ONLY after the research loop has exhausted its rephrased attempts without a confirming fact (or search stays unavailable after those attempts): mark it EST / estimate / typical class range, low confidence. Never EST after a single miss. Never present an estimate as an OEM pin or brochure fact. Never silent-invent a number as fact.";

/** Injection / speech line when the loop is exhausted and still unconfirmed. */
export const LOW_CONFIDENCE_EST_RULE =
  "You MAY give a labeled EST / typical class range, low confidence — never as an OEM pin. Do not write EST onto the desk.";

export type EstimateGateInput = {
  /** Accumulated notes confirmed the queried field. */
  confirmed: boolean;
  /** Loop cannot start another genuine rephrased attempt. */
  exhausted: boolean;
};

/**
 * EST fallback is gated: a confirming fact wins; a single miss / empty
 * search / WEB SEARCH NOT AVAILABLE does not unlock EST. Only an
 * exhausted research loop may fire a labeled low-confidence estimate.
 */
export function mayEmitLabeledEstimate(input: EstimateGateInput): boolean {
  return !input.confirmed && input.exhausted;
}

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
  confidence: "low" | "normal" = "low",
): string {
  const v = (value || "").trim();
  if (confidence === "low") {
    return `${v} (EST — ${kind}, low confidence)`;
  }
  return `${v} (EST — ${kind})`;
}
