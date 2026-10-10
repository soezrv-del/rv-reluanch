/**
 * Code guarantee: a reply that states a lot number (a count, price or stock
 * number for our inventory) needs a search_lot result this turn. The route
 * retries once with search_lot forced, then strips the unsupported sentences.
 */
const LOT_WORDS =
  /\b(?:on (?:the|our) lot|in stock|in inventory|our inventory|we have|we've got|we got|i see|i found|stock\s*(?:number|no\.?|#)|stk)\b/i;
const YEAR = /^(?:19[89]\d|20[0-3]\d)$/;

function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\n+/).filter((s) => s.trim());
}

function hasNonYearNumber(s: string): boolean {
  return (s.match(/\d[\d,]*/g) || []).some((n) => !YEAR.test(n.replace(/,/g, "")));
}

/** Sentences that state an inventory number. */
export function lotClaimSentences(text: string): string[] {
  return sentences(text || "").filter((s) => LOT_WORDS.test(s) && hasNonYearNumber(s));
}

export function hasLotClaim(text: string): boolean {
  return lotClaimSentences(text).length > 0;
}

export const LOT_CLAIM_STRIPPED_LINE =
  "I couldn't pull the lot just now, so I won't quote a count or price. Ask again and I'll search it.";

/** Drop unsupported lot-number sentences; never leave an empty reply. */
export function stripLotClaims(text: string): string {
  const bad = new Set(lotClaimSentences(text));
  const kept = sentences(text).filter((s) => !bad.has(s)).join(" ").trim();
  return kept ? `${kept} ${LOT_CLAIM_STRIPPED_LINE}` : LOT_CLAIM_STRIPPED_LINE;
}
