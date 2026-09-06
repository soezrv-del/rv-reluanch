/**
 * When chat should fire the xAI web_search sidecar.
 * Kept catalog-free so tests and the sidecar prompt can import it.
 *
 * Standing rule: browse whenever the catalog cannot answer the ask.
 * Skip only hi / lifestyle / payment / image-only turns.
 */

import { parseCoachFromText } from "./parseCoach.ts";

export type WebFallbackSpecs = {
  missingHard: boolean;
} | null;

export type WebFallbackOpts = {
  /** Agent mode may browse a bit more often — still skips hi / lifestyle / payment. */
  agentMode?: boolean;
};

const SPEC_QUESTION_RE =
  /\b(hp|horsepower|engine|chassis|torque|transmission|fuel|gvwr|gcwr|uvw|ccc|tow|hitch|mpg|length|weight|spec|brochure|powertrain|godzilla|cummins|f-?53)\b/i;

const LIVE_RESEARCH_RE =
  /\b(troubleshoot(?:ing)?|diagnos(?:e|is|ing)|problems?|issues?|errors?|codes?|alarm|fault|dtc|check[- ]engine|tsb|bulletins?|won'?t\s+start|will\s+not\s+start|doesn'?t\s+start|leaking|leaks?|repair|fix(?:es|ing)?|how\s+do\s+i|how\s+to|why\s+is|why\s+won'?t|why\s+does(?:n'?t)?|what\s+should\s+i\s+(?:check|do|try|inspect)|what(?:'s|\s+is)\s+wrong|manual|owners?\s+manual|service\s+manual|recall|nhtsa|install(?:ing|ation)?|wiring|wires?|fuse|breaker|batter(?:y|ies)|propane|lp\s?gas|lpg|slides?|slide[- ]out|jacks?|level(?:ing|ers?)|generator|genset|inverter|converter|starlink|awning|water\s+heater|furnace|air\s+cond(?:itioner)?|refrigerator|fridge|toilet|black\s+tank|gray\s+tank|fresh\s+water|water\s+pump|short(?:ed|ing)?|overheat(?:ing)?|not\s+working|stopped\s+working|won'?t\s+(?:retract|extend|open|close|work|reset)|will\s+not\s+(?:retract|extend|open|close|work)|stuck|jammed|look(?:\s+(?:this|it))?\s+up|look\s+up|search(?:\s+(?:the\s+)?(?:web|online|forums?))|web\s+search|research|owners?\s+forums?|what\s+do\s+owners|irv2|reddit|common\s+(?:fix|cause|issue|problem)|known\s+(?:issue|problem|recall)|latest\s+(?:tsb|bulletin|recall|fix|firmware))\b/i;

const STRONG_FAULT_RE =
  /\b(troubleshoot|diagnos|error|code|alarm|leak|repair|fix|won'?t|will\s+not|slide|fuse|batter(?:y|ies)|propane|generator|inverter|wiring|tsb|recall|manual|retract|extend)\b/i;

const LIFESTYLE_PITCH_RE =
  /\b(full[- ]?tim(?:e|ing)|snowbird|lifestyle|worth\s+it|vs\.?\s+hotels?|van\s+life|why\s+rv|weekend\s+warrior|retiring\s+on\s+the\s+road|second\s+home)\b/i;

const PAYMENT_MATH_RE =
  /\b(monthly\s+payment|loan\s+payment|apr\b|interest\s+rate|amortiz|out[- ]the[- ]door|\botd\b|financing|payment\s+on\s+\$)\b/i;

const CASUAL_CHAT_RE =
  /^(hi|hey|hello|thanks|thank you|ok|okay|yo|sup|morning|cool|nice|got it|sounds good|good (morning|evening|afternoon))[\s!.]*$/i;

const AGENT_EXTRA_LOOKUP_RE =
  /\b(look(?:\s+(?:this|it))?\s+up|search|research|forum|owners?\s+say|latest|current|compare reviews|what(?:'s|\s+is) the (?:latest|current|word))\b/i;

/** "tell me about / what about / I'd like to know about [coach]" — not spec keywords. */
const PRODUCT_ABOUT_RE =
  /\b((?:i(?:'d| would) like to |can you |please )?(?:tell me |know |learn |hear )about|what about|how about|info(?:rmation)? (?:on|about|for)|details (?:on|about|for)|looking (?:at|into|up)|anything (?:on|about)|overview of|walk me through|break down|brief me on)\b/i;

const IMAGE_ONLY_RE =
  /\b(draw|generate|illustrate|sketch|visualize|paint)\b/i;

/** Places / conditions the catalog never stores — still browse when a coach is locked. */
const OFF_CATALOG_RE =
  /\b(fish(?:ing)?|campgrounds?|rv parks?|dump stations?|boondock(?:ing)?|national parks?|state parks?|lakes?|rivers?|piers?|hiking|trailheads?|weather|road closures?|propane stations?)\b/i;

/** Curly quotes in “won’t” / “how do I” from phones. */
export function normalizeAskText(text: string): string {
  return (text || "").replace(/[\u2018\u2019\u201B\u2032]/g, "'");
}

export function looksLikeSpecQuestion(text: string): boolean {
  return SPEC_QUESTION_RE.test(normalizeAskText(text));
}

/** Lifestyle sell or payment math with no hardware/fault cue. */
export function looksLikePureLifestyleOrPayment(text: string): boolean {
  const t = normalizeAskText(text);
  if (!LIFESTYLE_PITCH_RE.test(t) && !PAYMENT_MATH_RE.test(t)) return false;
  return !STRONG_FAULT_RE.test(t);
}

/** Greetings, thanks, and pitch/payment asks that should not burn a web call. */
export function looksLikeCasualNonResearch(text: string): boolean {
  const t = normalizeAskText(text).trim();
  if (!t) return true;
  if (looksLikePureLifestyleOrPayment(t)) return true;
  if (CASUAL_CHAT_RE.test(t)) return true;
  // "hi how are you" / short small-talk — not a catalog miss.
  if (
    t.length < 40 &&
    /^(hi|hey|hello|thanks|thank you|yo|sup)\b/i.test(t) &&
    !looksLikeSpecQuestion(t) &&
    !looksLikeLiveResearchQuestion(t) &&
    !parseCoachFromText(t).make
  ) {
    return true;
  }
  return false;
}

/** Draw / generate / illustrate — not a research turn. */
export function looksLikeImageOnlyAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!IMAGE_ONLY_RE.test(t)) return false;
  if (looksLikeLiveResearchQuestion(t) || looksLikeSpecQuestion(t)) return false;
  return true;
}

/** Destinations / fishing / parks — never in the coach catalog. */
export function looksLikeOffCatalogQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  return OFF_CATALOG_RE.test(t);
}

/**
 * Troubleshooting, how-to, error codes, TSB/recall research, OEM/forum
 * lookup — anything that needs live web beyond a locked catalog row.
 */
export function looksLikeLiveResearchQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  if (!LIVE_RESEARCH_RE.test(t)) return false;
  if (looksLikePureLifestyleOrPayment(t)) return false;
  return true;
}

/**
 * Named year/make/model (or about-this-coach phrasing). Catalog miss or
 * missing hard fields should browse — not invent a dealer dead-end.
 */
export function looksLikeNamedCoachProductQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  const parsed = parseCoachFromText(t);
  const yearMakeModel = Boolean(parsed.year && parsed.make && parsed.model);
  const yearMake = Boolean(parsed.year && parsed.make);
  const makeModel = Boolean(parsed.make && parsed.model);
  if (!yearMake && !makeModel) return false;
  if (yearMakeModel) return true;
  return PRODUCT_ABOUT_RE.test(t);
}

function catalogGapNeedsWeb(specs: WebFallbackSpecs): boolean {
  if (!specs) return true;
  return specs.missingHard;
}

/**
 * Browse whenever the catalog cannot answer — unresolved coach, missing
 * hard fields / empty year row, or an ask the catalog never covers.
 * Hi / lifestyle / payment / image-only stay offline.
 */
export function needsWebFallback(
  specs: WebFallbackSpecs,
  userText: string,
  opts?: WebFallbackOpts,
): boolean {
  if (looksLikeCasualNonResearch(userText)) return false;
  if (looksLikeImageOnlyAsk(userText)) return false;
  if (looksLikeLiveResearchQuestion(userText)) return true;
  // Resolved hard row → do not browse. A "no catalog" web note must not
  // overwrite a pin the catalog already answered (Lineage Series M, etc.).
  if (specs && !specs.missingHard) {
    if (looksLikeOffCatalogQuestion(userText)) return true;
    if (
      opts?.agentMode &&
      AGENT_EXTRA_LOOKUP_RE.test(normalizeAskText(userText))
    ) {
      return true;
    }
    return false;
  }
  if (catalogGapNeedsWeb(specs)) return true;
  if (looksLikeOffCatalogQuestion(userText)) return true;
  if (
    opts?.agentMode &&
    AGENT_EXTRA_LOOKUP_RE.test(normalizeAskText(userText))
  ) {
    return true;
  }
  return false;
}
