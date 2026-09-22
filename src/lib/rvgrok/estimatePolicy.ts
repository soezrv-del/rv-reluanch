/**
 * Conversational estimate + catalog-miss search contract.
 *
 * Desk / SPEC REPORT stays on the Facts brochure snapshot (#419).
 * Chat + live voice may guesstimate missing coach fields — labeled estimate
 * for catalog option-bands only, never silent OEM fact, never when a live
 * source exists.
 */

/** Catalog miss / no OEM pin: search is required, not optional. */
export const CATALOG_MISS_MUST_SEARCH =
  "When the catalog / OEM pin does not have the answer, you MUST run WEB RESEARCH this turn before answering — not optional, not last resort.";

/**
 * Specs / GVWR / engine / pricing / year-make-model: live search first,
 * even when the catalog already has a pin. Training data is not an answer.
 */
export const SPEC_ASK_MUST_SEARCH =
  "When the user asks for specs, GVWR, engine, horsepower, chassis, or pricing on any coach — or names a year, make, and model — you MUST run live WEB RESEARCH this turn BEFORE answering. Prefer OEM / factory brochure / dealer listings. Never answer from training data alone. Catalog lock may confirm a live number; it must not skip the search.";

/**
 * After the research loop is exhausted (N genuine rephrased attempts, all
 * unconfirmed) — or search stays unavailable after a retry — say so
 * plainly. Never EST after a single miss. Never EST when a live source
 * exists. Never invent brochure numbers from training.
 */
export const LABELED_ESTIMATE_RULE =
  "Never EST after a single miss. Never EST / typical class range / low confidence when live OEM / brochure / dealer notes confirm a fact. If search returns nothing after a retry, say so plainly — do not invent brochure numbers from training. Never present an estimate as an OEM pin or brochure fact. Catalog option-band fields may still be marked EST / estimate / typical class range (not a single locked number). Never silent-invent a number as fact.";

/** Injection / speech line when live notes confirm, or search missed. */
export const LOW_CONFIDENCE_EST_RULE =
  "Never emit EST / typical class range / low confidence when live WEB RESEARCH notes confirm a fact. If search returned nothing after a retry, say so plainly — do not invent brochure numbers from training. Do not write EST onto the desk.";

export type EstimateGateInput = {
  /** Accumulated notes confirmed the queried field. */
  confirmed: boolean;
  /** Loop cannot start another genuine rephrased attempt. */
  exhausted: boolean;
};

/**
 * EST fallback is gated: a confirming fact wins; a single miss / empty
 * search / WEB SEARCH NOT AVAILABLE does not unlock EST from training.
 * A labeled estimate is for catalog option-band fields only — never when
 * live notes confirm a fact.
 */
export function mayEmitLabeledEstimate(input: EstimateGateInput): boolean {
  return !input.confirmed && input.exhausted;
}

/** #419 — desk sheet matches Facts. Estimates stay off the desk. */
export const DESK_STAYS_FACTS =
  "Desk spec sheet / Grok SPEC REPORT stays on the Facts brochure snapshot. Do not write EST numbers onto the desk. Do not re-GAP a VERIFIED or Facts number.";

export const ESTIMATE_STANDING_POLICY = `${DESK_STAYS_FACTS} Conversational chat + live voice: ${SPEC_ASK_MUST_SEARCH} ${CATALOG_MISS_MUST_SEARCH} ${LABELED_ESTIMATE_RULE}`;

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
