/**
 * When chat should fire the web-research sidecar.
 * Spec-catalog-free (no rvData). Coach-vs-coach compare skip uses the
 * thin CATALOG_INDEX names in coachCompare.ts.
 *
 * Memory first. The model answers from its own knowledge (and a catalog
 * pin already in hand) before any browse. Catalog, search, and internet
 * are fallbacks — not a step before the first token.
 * Browse only when the ask needs something memory cannot honestly pin:
 * repair / forum / manual / TSB, live market value, inventory counts,
 * an OEM spec the catalog does not already pin (no row, UNKNOWN hard
 * fields, missing OEM weight pin on a weight ask), or a live condition
 * (weather, road closures). A locked pin does not wait on search.
 * Do not invent OEM numbers. If search returns nothing, say so — never
 * EST when a live OEM / brochure / dealer source exists.
 * Inventory / diesel-count / in-stock still trip this detector so voice+chat
 * can inject the own-lot snapshot; a *hit* skips public web, a miss browses.
 * Skip hi / lifestyle / payment / image-only turns, named-coach small talk,
 * and catalog-answerable coach-vs-coach compares.
 * Market value / pricing always browses (live nationwide asking, year ±2).
 * Repair / forum / manual asks still browse even on a compare.
 */

import { askNamesCoachIdentity } from "./coachIdentity.ts";
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
  /\b(hp|horsepower|engine|chassis|torque|transmission|fuel|gvwr|gcwr|uvw|ccc|tow|hitch|mpg|length|weight|spec|brochure|powertrain|godzilla|cummins|f-?53|holding\s+tanks?|fresh\s+water|gr[ae]y\s+(?:water|tank)|black\s+(?:water|tank))\b/i;

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

/** Places the catalog never stores. Model memory answers these; they do not block the first token. */
const OFF_CATALOG_RE =
  /\b(fish(?:ing)?|campgrounds?|rv parks?|dump stations?|boondock(?:ing)?|national parks?|state parks?|lakes?|rivers?|piers?|hiking|trailheads?|weather|road closures?|propane stations?)\b/i;

/** Live conditions memory cannot pin — weather and closures still browse. */
const LIVE_CONDITION_RE = /\b(weather|road closures?)\b/i;

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
 * Detection only. A locked catalog pin answers from memory; browse is
 * for a catalog GAP on an OEM-number ask, not every coach mention.
 */
export function looksLikeCoachFactAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  if (looksLikeSpecQuestion(t)) return true;
  if (looksLikeMarketValueQuestion(t)) return true;
  // Two known coaches side-by-side stay a catalog compare — not a
  // single-unit product browse. Repair / spec already returned above.
  if (looksLikeCatalogAnswerableCoachCompare(t)) return false;
  if (looksLikeNamedCoachProductQuestion(t)) return true;
  return false;
}

/**
 * Year-only / "tell me about a 2026" — not enough identity to burn a
 * search that times out and claims empty. Wait for make + model.
 */
export function looksLikeIncompleteCoachIdentityAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  if (looksLikeSpecQuestion(t)) return false;
  if (looksLikeRepairQuestion(t)) return false;
  if (looksLikeMarketValueQuestion(t)) return false;
  if (looksLikeInventoryOrCountQuestion(t)) return false;
  if (looksLikeLiveResearchQuestion(t)) return false;
  const parsed = parseCoachFromText(t);
  if (askNamesCoachIdentity(parsed)) return false;
  return Boolean(parsed.year && !parsed.make && !parsed.model);
}

export const INCOMPLETE_COACH_IDENTITY_CUE =
  "INCOMPLETE COACH IDENTITY (year only). Ask the make and model (and floorplan if they have it). Do not run or claim a web search. Do not say search timed out or returned nothing. Do not invent a coach or OEM numbers.";

/**
 * Named coach ask — salesman shorthand counts. Year/make/model do not
 * all have to be present or spelled as the OEM string. "American Dream 42Q",
 * "Phaeton 40IH", "Lineage 31ZW" are product asks. Catalog miss or missing
 * hard fields should browse — not invent a dealer dead-end.
 *
 * Still skip hi / lifestyle. Full year+make+model is enough without
 * "tell me about". About-phrasing still helps a year+make / make+model
 * fragment that is not already a designation.
 */
export function looksLikeNamedCoachProductQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  const parsed = parseCoachFromText(t);
  // Model+floorplan / make+model / year+make — do not require "tell me about"
  // or a complete year+make+model tuple.
  if (askNamesCoachIdentity(parsed)) return true;
  const yearMake = Boolean(parsed.year && parsed.make);
  const makeModel = Boolean(parsed.make && parsed.model);
  if (!yearMake && !makeModel) return false;
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

/** No catalog row, unknown / catalog GAP, or a weight ask with no OEM pin. Chat does not block the first token on this. */
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

/** Weather / road closures — not fishing or parks, which memory can answer. */
export function looksLikeLiveConditionQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim() || looksLikeCasualNonResearch(t)) return false;
  return LIVE_CONDITION_RE.test(t);
}

/**
 * Browse only when the ask needs an external fact memory cannot pin.
 * Hi / lifestyle / payment / image-only / named-coach small talk stay
 * offline and stream immediately. Coach and spec asks — pinned or not —
 * also stream from memory and the catalog. Resolved hard row or a gap,
 * they must not invent an OEM
 * pin; they do not wait on search. Own-lot *hit* skips the browse in the API.
 * Repair, market, inventory, and live conditions still browse.
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
  if (looksLikeIncompleteCoachIdentityAsk(userText)) return false;
  if (looksLikeLiveResearchQuestion(userText)) return true;
  if (looksLikeInventoryOrCountQuestion(userText)) return true;
  // Both coaches identifiable — answer from catalog now.
  // Forum / repair already returned above.
  if (looksLikeCatalogAnswerableCoachCompare(userText)) return false;
  if (looksLikeLiveConditionQuestion(userText)) return true;
  if (
    opts?.agentMode &&
    AGENT_EXTRA_LOOKUP_RE.test(normalizeAskText(userText))
  ) {
    return true;
  }
  return false;
}
