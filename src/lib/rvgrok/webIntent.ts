/**
 * When chat should fire the xAI web_search sidecar.
 * Spec-catalog-free (no rvData). Coach-vs-coach compare skip uses the
 * thin CATALOG_INDEX names in coachCompare.ts.
 *
 * Standing rule: specs / GVWR / engine / pricing / year-make-model coach
 * asks ALWAYS browse first — even when the catalog already has a pin.
 * Training data is not an answer. Catalog lock may confirm a live number;
 * it must not skip the search. Search is also required on a catalog GAP
 * (no row, UNKNOWN hard fields, missing OEM weight pin on a weight ask)
 * or own-lot miss. After notes: use the live hit; never EST when a live
 * OEM / brochure / dealer source exists. If search returns nothing, say
 * so and retry once — do not invent brochure numbers from training.
 * Inventory / diesel-count / in-stock still trip this detector so voice+chat
 * can inject the own-lot snapshot; a *hit* skips public web, a miss browses.
 * Skip only hi / lifestyle / payment / image-only turns, and
 * catalog-answerable coach-vs-coach compares that are not spec/price asks
 * (both makes/models known).
 * Market value / pricing always browses (live nationwide asking, year ±2)
 * — catalog, nightly scrape, and competitor-latest are not price SoT.
 * Repair / forum / manual asks still browse even on a compare.
 */

import { parseCoachFromText } from "./parseCoach.ts";
import { looksLikeCarfaxQuestion } from "./carfaxPositioning.ts";
import { looksLikeOriginQuestion } from "./originStory.ts";
import { looksLikeRepairQuestion } from "./repairMode.ts";
import { looksLikeCatalogAnswerableCoachCompare } from "./coachCompare.ts";

export { looksLikeCarfaxQuestion } from "./carfaxPositioning.ts";
export { looksLikeOriginQuestion } from "./originStory.ts";

export { looksLikeRepairQuestion } from "./repairMode.ts";
export {
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeCoachCompareQuestion,
} from "./coachCompare.ts";

export type WebFallbackSpecs = {
  missingHard: boolean;
  /** True when GVWR or UVW has no Facts / OEM published number. */
  missingOemWeightPin?: boolean;
  oemGvwrLbs?: number | null;
  oemUvwLbs?: number | null;
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

/**
 * Used-market / asking-price asks — not lifestyle "worth it", not loan math.
 * These must browse live nationwide listings (year ±2). Catalog has no live asks.
 */
const MARKET_VALUE_RE =
  /\b(market\s+value|used\s+(?:market\s+)?(?:price|values?|pricing)|asking\s+pric(?:e|es|ing)|fair\s+(?:market\s+)?(?:price|value)|street\s+price|going\s+for|sell(?:s|ing)?\s+for|comparables?|\bcomps?\b|book\s+value|retail\s+(?:low|high|value|price)|trade[- ]?in\s+(?:value|price)|pric(?:e|ing)\s+(?:on|for|of)|value\s+of\s+(?:a|an|my|this|the)|what(?:'s|\s+is)\s+(?:it|this|that|a|an|my|the)\b.{0,80}\bworth\b|how\s+much\s+(?:is|are)\s+(?:a|an|my|this|that|the)\b.{0,80}\b(?:worth|asking|going|sell|used|price)|how\s+much\s+(?:should|would|does|do).{0,60}\b(?:sell|ask|go(?:ing)?\s+for|worth)|what\s+(?:are|is)\s+(?:they\s+)?asking|go(?:es|ing)?\s+for)\b/i;

/** "tell me about / what about / I'd like to know about [coach]" — not spec keywords. */
const PRODUCT_ABOUT_RE =
  /\b((?:i(?:'d| would) like to |can you |please )?(?:tell me |know |learn |hear )about|what about|how about|info(?:rmation)? (?:on|about|for)|details (?:on|about|for)|looking (?:at|into|up)|anything (?:on|about)|overview of|walk me through|break down|brief me on)\b/i;

const IMAGE_ONLY_RE =
  /\b(draw|generate|illustrate|sketch|visualize|paint)\b/i;

/** Places / conditions the catalog never stores — still browse when a coach is locked. */
const OFF_CATALOG_RE =
  /\b(fish(?:ing)?|campgrounds?|rv parks?|dump stations?|boondock(?:ing)?|national parks?|state parks?|lakes?|rivers?|piers?|hiking|trailheads?|weather|road closures?|propane stations?)\b/i;

/** Own-lot / diesel-count / in-stock — catalog has no inventory. */
const INVENTORY_OR_COUNT_RE =
  /\b(inventor(?:y|ies)|in stock|on (?:the |our )?lot|on hand|units? available|our (?:lot|inventory|stock)|diesel counts?|(?:how many|count of)\s+(?:\w+\s+){0,8}(?:diesels?|gas|coaches?|units?|rvs?|pushers?|motorhomes?|class\s*a|super\s*c?s?|are there|in stock|on (?:the )?lot|do we have)|(?:look|check|search|pull|find)\s+(?:\w+\s+){0,6}in(?:\s+(?:my|our|the))?\s+inventory|(?:stock(?:\s*(?:#|number|no\.?|num))?|stk)\s*[:#-]?\s*[A-Za-z0-9-]{3,12})\b/i;

/** Bare lot stock # ("45282") — not a model year. */
const BARE_STOCK_NUMBER_RE = /^\s*#?\s*([A-Za-z]{0,4}\d{4,7}[A-Za-z]{0,3})\s*$/;
const YEAR_ONLY_RE = /^\s*(?:19[89]\d|20[0-2]\d)\s*$/;

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

/** Inventory / diesel counts / how-many-on-the-lot — never in the coach catalog. */
export function looksLikeInventoryOrCountQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  if (INVENTORY_OR_COUNT_RE.test(t)) return true;
  if (BARE_STOCK_NUMBER_RE.test(t.trim()) && !YEAR_ONLY_RE.test(t.trim())) {
    return true;
  }
  return false;
}

/**
 * Market value / used pricing — live nationwide asking prices, year ±2.
 * Lifestyle "is it worth it" is stripped so it does not fire a price search.
 */
export function looksLikeMarketValueQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  const pricingText = t.replace(/\bworth\s+it\b/gi, " ");
  if (MARKET_VALUE_RE.test(pricingText)) return true;
  if (
    /\bhow\s+much\s+(?:is|are)\s+(?:a|an|my|this|that|the)\b/i.test(pricingText)
  ) {
    const parsed = parseCoachFromText(t);
    if (parsed.year || parsed.make) return true;
  }
  return false;
}

/**
 * Troubleshooting, how-to, error codes, TSB/recall research, OEM/forum
 * lookup — anything that needs live web beyond a locked catalog row.
 */
export function looksLikeLiveResearchQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  if (looksLikePureLifestyleOrPayment(t)) return false;
  // Repair / diagnose always needs live notes — catalog has no procedure.
  if (looksLikeRepairQuestion(t)) return true;
  // Market value always needs live listings — catalog / nightly scrape is not SoT.
  if (looksLikeMarketValueQuestion(t)) return true;
  if (!LIVE_RESEARCH_RE.test(t)) return false;
  return true;
}

/**
 * Specs, GVWR, engine, pricing, or a clear year/make/model coach ask.
 * These MUST run live web_search before the model finalizes — catalog
 * lock does not skip the browse.
 */
export function looksLikeCoachFactAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  if (looksLikeSpecQuestion(t)) return true;
  if (looksLikeMarketValueQuestion(t)) return true;
  if (looksLikeNamedCoachProductQuestion(t)) return true;
  return false;
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

const WEIGHT_ASK_RE =
  /\b(gvwr|gcwr|uvw|ncc|ccc|hitch|payload|weight)\b/i;

function missingOemWeightPinOf(specs: WebFallbackSpecs): boolean {
  if (!specs) return true;
  if (typeof specs.missingOemWeightPin === "boolean") {
    return specs.missingOemWeightPin;
  }
  if ("oemGvwrLbs" in specs || "oemUvwLbs" in specs) {
    return specs.oemGvwrLbs == null || specs.oemUvwLbs == null;
  }
  return false;
}

/** No catalog row, UNKNOWN hard fields, or a weight ask with no OEM pin. */
export function catalogGapNeedsWeb(
  specs: WebFallbackSpecs,
  userText?: string,
): boolean {
  if (!specs) return true;
  if (specs.missingHard) return true;
  if (
    missingOemWeightPinOf(specs) &&
    userText &&
    WEIGHT_ASK_RE.test(normalizeAskText(userText))
  ) {
    return true;
  }
  return false;
}

/**
 * Browse whenever the ask needs a live fact — specs / GVWR / engine /
 * pricing / year-make-model, unresolved coach, missing hard fields,
 * unknown/GAP, or an ask the catalog never covers.
 * Hi / lifestyle / payment / image-only stay offline.
 * Resolved hard row still browses for coach-fact asks. Catalog lock is
 * injected so a "no catalog" web note cannot overwrite a pin
 * (Lineage Series M, etc.). Own-lot *hit* skips the actual browse in the API.
 */
export function needsWebFallback(
  specs: WebFallbackSpecs,
  userText: string,
  opts?: WebFallbackOpts,
): boolean {
  if (looksLikeCasualNonResearch(userText)) return false;
  if (looksLikeOriginQuestion(userText)) return false;
  if (looksLikeCarfaxQuestion(userText)) return false;
  if (looksLikeImageOnlyAsk(userText)) return false;
  if (looksLikeLiveResearchQuestion(userText)) return true;
  if (looksLikeInventoryOrCountQuestion(userText)) return true;
  // Specs / GVWR / engine / pricing / YMM — search first, even on a lock.
  if (looksLikeCoachFactAsk(userText)) return true;
  // Both coaches identifiable — answer class / powertrain from catalog
  // now. Do not stall for a web hold. Forum / repair / spec already returned.
  if (looksLikeCatalogAnswerableCoachCompare(userText)) return false;
  // Unknown / catalog GAP (no identity, UNKNOWN hard fields, missing
  // OEM weight pin on a weight ask) → search is required this turn.
  if (catalogGapNeedsWeb(specs, userText)) return true;
  if (looksLikeOffCatalogQuestion(userText)) return true;
  if (
    opts?.agentMode &&
    AGENT_EXTRA_LOOKUP_RE.test(normalizeAskText(userText))
  ) {
    return true;
  }
  return false;
}
