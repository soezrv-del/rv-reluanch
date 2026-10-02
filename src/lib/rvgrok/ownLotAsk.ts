/**
 * Browser-safe own-lot ask detection.
 *
 * Stock / search / listing-price classifiers only. The snapshot loader
 * stays in ownLotInventory.ts so the Grok tab does not pull disk IO
 * or the inventory formatter into the client.
 */

import {
  extractFloorplanToken,
  normalizeFloorplanToken,
  parseCoachFromText,
} from "./parseCoach.ts";
import {
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";
import { isLotListExpansion, normalizeLotSearchQuery } from "../lot/lotSearch.ts";

/**
 * Own-lot listing prices / budget / "show prices too" — not nationwide
 * market-value comps (those stay on looksLikeMarketValueQuestion).
 */
const OWN_LOT_LISTING_PRICE_RE =
  /\b((?:show|include|have|with|see|need|want|any|should).{0,40}prices?|prices?\s+(?:too|data|as well|also|included|please)|(?:unit|listing|lot|inventory|stock|our)\s+prices?|prices?\s+(?:on|for|of|in|from)\b|(?:around|about|near|approx(?:imately)?|under|below|over|above|less\s+than|more\s+than|up\s+to)\s+\$?\s*\d|budget\b|\$\d|(?:\$|around|about|near|approx(?:imately)?|under|below|over|above|up\s+to|budget)\s*\$?\s*\d{2,3}\s*k\b|(?:around|about|near|approx(?:imately)?)\s+(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten)\s+thousand|\b(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\s+thousand\s+dollars?)\b/i;

/** "list / deep dive / show me / which ones" — inject concrete rows, not counts only. */
const OWN_LOT_UNIT_LIST_RE =
  /\b(list(?:ing|s)?|deep[- ]?dive|show\s+me|which\s+ones|specific\s+units?|name\s+them|what\s+units|pull\s+(?:me\s+)?(?:a\s+|the\s+)?(?:specific\s+)?(?:units?|list)|look(?:\s+\w+){0,6}\s+in(?:\s+(?:my|our|the))?\s+inventory|(?:do|did|does)\s+we\s+have|any\s+\w[\w\s]{0,40}\bin(?:ventory)?\b)\b/i;

export function looksLikeOwnLotListingPriceQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  return OWN_LOT_LISTING_PRICE_RE.test(t);
}

export function looksLikeOwnLotUnitListQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  return OWN_LOT_UNIT_LIST_RE.test(t);
}

/**
 * Inventory phrases that open lot mode. One list. Word boundaries,
 * case-insensitive. A model or series name without one of these is a
 * catalog / spec question, not a lot question.
 */
export const LOT_INVENTORY_PHRASES = [
  "on the lot",
  "in inventory",
  "in stock",
  "do we have",
  "what do we have",
  "we got",
] as const;

const LOT_INVENTORY_PHRASE_RE = new RegExp(
  `\\b(?:${LOT_INVENTORY_PHRASES.map((phrase) =>
    phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})\\b`,
  "i",
);

export function looksLikeLotInventoryPhrase(text: string): boolean {
  return LOT_INVENTORY_PHRASE_RE.test(normalizeAskText(text));
}

/** look/find/search/pull/check — salesman lot search, not "look up" catalog. */
const STRONG_LOT_SEARCH_RE =
  /\b(?:look(?:ing)?\s+for|find(?:ing)?|search(?:ing)?(?:\s+for)?|pull(?:ing)?|check(?:ing)?)\b/i;

/** Weaker "got/any" — only with a floorplan or stock token, not a bare brand. */
const WEAK_LOT_SEARCH_RE = /\b(?:got|any)\b/i;

const LOT_PLACE_CUE_RE =
  /\b(?:on (?:the |our )?lot|in (?:the |our )?lot|inventor(?:y|ies)|in stock)\b/i;

/** A number the lot sheet prints: horsepower, or a displacement such as 8.9. */
export function mentionsPrintedLotSpec(text: string): boolean {
  return /\b(?:\d{2,4}\s*(?:hp|horsepower)|(?:hp|horsepower)\s*\d{2,4}|\d{1,2}\.\d\s*(?:l|liters?|litres?)?|displacement)\b/i.test(
    normalizeAskText(text),
  );
}

const PRODUCT_ABOUT_OR_REPORT_RE =
  /\b((?:tell me |know |learn |hear )about|what about|how about|info(?:rmation)? (?:on|about|for)|details (?:on|about|for)|overview of|walk me through|break down|brief me on|give me a report|report on|looking (?:at|into|up))\b/i;

const WEB_SEARCH_CUE_RE =
  /\b(?:search(?:ing)?|look(?:ing)?)\s+(?:the\s+)?(?:web|online|forums?|internet)\b/i;

const LOOK_UP_CATALOG_RE = /\blook(?:ing)?\s+up\b/i;

/** 27A / 27ASE / 25FW — not a 4–7 digit stock #. */
const BARE_FLOORPLAN_RE = /^\d{2,3}[A-Za-z]{1,4}$/;

/**
 * Grok-only lot-ask stopwords. Stripped before Lot's token AND-match so
 * salesman filler never becomes a required haystack token. Do not reuse
 * on the Lot page search box — typed "stock" there is a real query.
 */
export const LOT_ASK_STOP = new Set([
  "look",
  "looking",
  "looks",
  "find",
  "finding",
  "search",
  "searching",
  "pull",
  "pulling",
  "check",
  "checking",
  "got",
  "any",
  "a",
  "an",
  "the",
  "for",
  "me",
  "please",
  "can",
  "you",
  "on",
  "in",
  "at",
  "our",
  "my",
  "lot",
  "inventory",
  "inventories",
  "do",
  "we",
  "have",
  "has",
  "is",
  "are",
  "there",
  "to",
  "know",
  "if",
  "whether",
  "i",
  "need",
  "see",
  "seeing",
  "seen",
  "stock",
  "stocks",
  "stocking",
  "show",
  "shows",
  "showing",
  "hello",
  "hi",
  "hey",
  "yeah",
  "yes",
  "yep",
  "yup",
  "yo",
  "ok",
  "okay",
  "um",
  "uh",
  "thanks",
  "thank",
  "just",
  "also",
  "like",
  "could",
  "would",
  "will",
  "should",
  "does",
  "did",
  "was",
  "were",
  "be",
  "been",
  "being",
  "this",
  "that",
  "those",
  "these",
  "and",
  "or",
  "but",
  "not",
  "of",
  "from",
  "with",
  "by",
  "about",
  "so",
  "well",
  "then",
  "now",
  "right",
  "currently",
  "current",
  "available",
  "unit",
  "units",
  "ones",
  "some",
  "them",
  "they",
  "it",
  "its",
  "your",
  "what",
  "which",
  "where",
  "when",
  "how",
  "many",
  "here",
  "near",
  "coach",
  "coaches",
  "im",
  "ive",
  "youre",
  "whats",
  "s",
  "es",
]);

export function isBareFloorplanCode(text: string): boolean {
  const t = normalizeAskText(text)
    .trim()
    .replace(/[?!.,;:'"]+$/g, "");
  if (!t) return false;
  if (parseOwnLotStockNumber(t)) return false;
  return BARE_FLOORPLAN_RE.test(t);
}

function leftoverFloorplanQuery(tokens: string[]): string {
  for (const raw of tokens) {
    const normalized = normalizeFloorplanToken(raw);
    if (!normalized) continue;
    if (BARE_FLOORPLAN_RE.test(normalized)) return normalized.toLowerCase();
  }
  return "";
}

/**
 * Remaining tokens after stripping search verbs / lot filler.
 * "look for a 27A" → "27a" so Lot search matches the page box.
 * A leftover floorplan (27As → 27A) is preferred so "27as stock" does
 * not AND-fail against unit haystacks.
 */
export function lotSearchQueryFromAsk(text: string): string {
  const cleaned = normalizeAskText(text)
    .replace(/['’]/g, "")
    .replace(/[?!.,;:]+/g, " ");
  const tokens = cleaned
    .toLowerCase()
    .split(/[\s,/|]+/)
    .map((t) => t.trim())
    .filter((t) => t && !LOT_ASK_STOP.has(t));

  const spokenFp = extractFloorplanToken(cleaned);
  if (spokenFp) {
    const compact = normalizeFloorplanToken(spokenFp).toLowerCase();
    const leftoverHasFp = tokens.some((t) => {
      const n = normalizeFloorplanToken(t).toLowerCase();
      return Boolean(n) && (n === compact || n.startsWith(compact) || compact.startsWith(n));
    });
    if (leftoverHasFp) return compact;
  }

  return leftoverFloorplanQuery(tokens) || tokens.join(" ");
}

/**
 * Lot/inventory *search* — look/find/search/pull/check/got/any + floorplan
 * or coach tokens, "on the lot", or a bare floorplan code. Product / YMM /
 * spec "tell me about" reports stay catalog-first (#449).
 */
export function looksLikeOwnLotSearchAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  if (looksLikeSpecQuestion(t) && !LOT_PLACE_CUE_RE.test(t)) return false;
  if (
    PRODUCT_ABOUT_OR_REPORT_RE.test(t) &&
    !LOT_PLACE_CUE_RE.test(t) &&
    !STRONG_LOT_SEARCH_RE.test(t)
  ) {
    return false;
  }
  if (WEB_SEARCH_CUE_RE.test(t)) return false;
  if (LOOK_UP_CATALOG_RE.test(t) && !LOT_PLACE_CUE_RE.test(t)) return false;

  const stripped = t.trim().replace(/[?!.,;:'"]+$/g, "");
  if (isBareFloorplanCode(stripped)) return true;

  const hasFloorplanOrStock =
    Boolean(extractFloorplanToken(t)) || Boolean(parseOwnLotStockNumber(t));
  const parsed = parseCoachFromText(t);
  const hasCoach = Boolean(parsed.make || parsed.model);

  if (LOT_PLACE_CUE_RE.test(t) && (hasFloorplanOrStock || hasCoach)) {
    return true;
  }
  if (STRONG_LOT_SEARCH_RE.test(t) && (hasFloorplanOrStock || hasCoach)) {
    return true;
  }
  if (LOT_PLACE_CUE_RE.test(t) && mentionsPrintedLotSpec(t)) return true;
  if (WEAK_LOT_SEARCH_RE.test(t) && hasFloorplanOrStock) return true;
  return false;
}

export type OwnLotSortBy = "price" | "length" | "year" | "type";
export type OwnLotSortDir = "asc" | "desc";

export type OwnLotSort = {
  by: OwnLotSortBy;
  dir: OwnLotSortDir;
};

/**
 * Rank words on a lot follow-up. "top 10 cheapest" is price ascending,
 * limit 10. Not a nationwide market ask.
 */
export function parseLotRank(text: string): { sort?: OwnLotSort; limit?: number } {
  const t = normalizeAskText(text);
  let sort: OwnLotSort | undefined;
  if (/\b(?:cheapest|lowest|least\s+expensive)\b/i.test(t)) {
    sort = { by: "price", dir: "asc" };
  } else if (/\b(?:priciest|most\s+expensive|highest\s+priced?)\b/i.test(t)) {
    sort = { by: "price", dir: "desc" };
  } else if (/\bshortest\b/i.test(t)) {
    sort = { by: "length", dir: "asc" };
  } else if (/\blongest\b/i.test(t)) {
    sort = { by: "length", dir: "desc" };
  } else if (/\bnewest\b/i.test(t)) {
    sort = { by: "year", dir: "desc" };
  } else if (/\boldest\b/i.test(t)) {
    sort = { by: "year", dir: "asc" };
  } else if (/\border\b/i.test(t)) {
    if (/\bprice\b/i.test(t)) {
      sort = { by: "price", dir: /\bdesc|highest|expensive\b/i.test(t) ? "desc" : "asc" };
    } else if (/\blength|foot|feet\b/i.test(t)) {
      sort = { by: "length", dir: /\blongest|desc\b/i.test(t) ? "desc" : "asc" };
    } else if (/\byear\b/i.test(t)) {
      sort = { by: "year", dir: /\boldest|asc\b/i.test(t) ? "asc" : "desc" };
    }
  }
  const top = t.match(/\b(?:top|first)\s+(\d{1,2})\b/i);
  const limit = top ? Number(top[1]) : undefined;
  return { sort, limit };
}

/** Cheapest / shortest / top N — our lot, not a web price search. */
export function looksLikeOwnLotRankQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  if (/\b(?:recall|tsb|gvwr|horsepower|\bengine\b|nationwide|market\s+value)\b/i.test(t)) {
    return false;
  }
  return Boolean(parseLotRank(t).sort) || /\b(?:top|first)\s+\d{1,2}\b/i.test(t);
}

/**
 * A count, cheapest, availability, or stock question about OUR lot.
 * These never go to web research. A market-value ask is not one of these.
 */
export function looksLikeOwnLotCountOrRankAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  if (/\b(?:market\s+value|nationwide|book\s+value|trade[- ]?in|\bworth\b)\b/i.test(t)) {
    return false;
  }
  if (looksLikeLotInventoryPhrase(t)) return true;
  if (parseOwnLotStockNumber(t)) return true;
  if (looksLikeOwnLotRankQuestion(t)) return true;
  if (
    /\bhow many\b/i.test(t) &&
    /\b(?:diesel|deisel|gas|gasoline|coaches?|units?|class|super|inventory|stock|lot|freightliner|we have|trailer|towable|fifth|fiver|popup|hauler|pusher|wheel)\b/i.test(t)
  ) {
    return true;
  }
  if (/\b(?:on our lot|in our lot|in our inventory|our inventory|entire inventory)\b/i.test(t)) {
    return true;
  }
  if (
    /\b(?:diesel|diesels|deisel|gasoline)\b/i.test(t) &&
    /\b(?:around|about|roughly|under|over|between|cheapest|lowest|priciest)\b/i.test(t)
  ) {
    return true;
  }
  if (
    /\b(?:fivers?|fifth wheels?|5th wheels?|towables?|pull behinds?|pop(?:\s|-)?ups?|toy haulers?|diesel pushers?|trailers?)\b/i.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

/** "prices on those" is the lot list, not a nationwide asking-price search. */
export function looksLikeOwnLotPriceOnThose(text: string): boolean {
  return /\bprices?\s+on\s+(?:those|these|them|the ones|ours?)\b/i.test(
    normalizeAskText(text),
  );
}

/** "No, on our lot" corrects a market list. It is a new lot ask, not the last spoken coaches. */
export function looksLikeLotCorrection(text: string): boolean {
  const t = normalizeAskText(text).trim();
  return /^(?:no|nope|wrong|not that)\b/i.test(t) && /\b(?:lot|inventory|in stock)\b/i.test(t);
}

function looksLikeCheapestLotAsk(text: string): boolean {
  const t = normalizeAskText(text);
  if (!/\b(?:cheapest|least\s+expensive)\b/i.test(t)) return false;
  return /\b(?:inventory|lot|we have|in stock)\b/i.test(t);
}

/** The whole turn is the lot, as in a correction: "our inventory", "on our lot". */
function looksLikeBareLotPlace(text: string): boolean {
  return /^(?:on (?:our|the) lot|our inventory|in our inventory|in inventory|in stock)[.!\s]*$/i.test(
    normalizeAskText(text).trim(),
  );
}
export function looksLikeBareLotConfirm(text: string): boolean {
  return /^(?:yeah|yes|yep|yup|sure|ok|okay|please|do that|go ahead|check(?: the full lot)?|full lot|the full lot)[.!\s]*$/i.test(
    normalizeAskText(text).trim(),
  );
}

/**
 * A follow-up that does not restate the subject: "those", "the ones",
 * "cheapest", "around 30 foot", "how many miles does it have".
 * The session filter supplies the subject.
 */
export function looksLikeOwnLotFollowUp(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  if (isLotListExpansion(t)) return true;
  if (looksLikeLotCorrection(t)) return false;
  if (looksLikeBareLotConfirm(t)) return true;
  if (looksLikeOwnLotRankQuestion(t) || looksLikeOwnLotPriceOnThose(t)) return true;
  if (/\b(?:i meant|meant to say)\b/i.test(t)) return true;
  if (/\byou (?:just )?(?:told|said)\b/i.test(t)) return true;
  if (
    (/\b(?:odometer|mileage)\b/i.test(t) ||
      (/\bhow many miles\b/i.test(t) &&
        !/\bmiles\s+(?:to|from|away|per)\b/i.test(t))) &&
    !parseOwnLotStockNumber(t)
  ) {
    return true;
  }
  if (
    /\b(?:the ones|those|these|them|em|that's there|that show|the show|(?:the\s+)?(?:used|new)\s+ones)\b/i.test(
      t,
    ) ||
    /['’]em\b/i.test(t)
  ) {
    return true;
  }
  if (looksLikeSeriesOnlyAsk(text)) return true;
  return false;
}

/** "Do we have a five?" is the series on the coach already in hand. */
function looksLikeSeriesOnlyAsk(text: string): boolean {
  const noise = new Set([
    "do",
    "we",
    "have",
    "has",
    "any",
    "of",
    "a",
    "an",
    "the",
    "those",
    "these",
    "them",
    "em",
    "are",
    "is",
    "it",
    "or",
    "in",
    "stock",
    "our",
    "inventory",
    "yeah",
    "yes",
    "yep",
    "series",
  ]);
  const words = normalizeLotSearchQuery(text).split(/\s+/).filter(Boolean);
  const content = words.filter((word) => !noise.has(word));
  if (!content.length) return false;
  return content.every((word) =>
    /^(?:[2-9]|10|two|three|four|five|six|seven|eight|nine|ten)$/.test(word),
  );
}

/** Lot mode for a fresh question: an inventory phrase, a cheapest ask, or a correction. */
export function looksLikeOwnLotStockQuestion(text: string): boolean {
  if (looksLikeLotInventoryPhrase(text)) return true;
  if (looksLikeCheapestLotAsk(text)) return true;
  if (looksLikeLotCorrection(text)) return true;
  if (looksLikeBareLotPlace(text)) return true;
  return false;
}

/**
 * Lot mode for this turn. A fresh inventory phrase, or a follow-up while
 * a lot filter from an earlier lot question is still active.
 */
export function looksLikeLotQuestion(
  text: string,
  memory?: { filter?: object } | null,
): boolean {
  if (looksLikeOwnLotStockQuestion(text)) return true;
  const filter = memory?.filter;
  if (!filter) return false;
  const active = Object.values(filter).some(
    (value) => value !== undefined && value !== false && value !== "",
  );
  if (!active) return false;
  return looksLikeOwnLotFollowUp(text);
}


function isYearToken(raw: string): boolean {
  return /^(?:19[89]\d|20[0-2]\d)$/.test(raw.trim());
}

/**
 * Words that sit between "stock number" and the actual id in voice transcripts
 * ("stock number for me, it's U P A U K …"). Never a stock id.
 */
const STOCK_FILLER = new Set([
  "a",
  "an",
  "for",
  "me",
  "my",
  "its",
  "it",
  "is",
  "the",
  "uh",
  "um",
  "please",
  "number",
  "num",
  "no",
  "stock",
  "stk",
  "of",
  "on",
  "in",
  "our",
  "lot",
  "this",
  "that",
]);

function isStockToken(raw: string): boolean {
  if (!raw || isYearToken(raw)) return false;
  if (STOCK_FILLER.has(raw.toLowerCase())) return false;
  if (!/^[A-Za-z0-9-]{3,14}$/.test(raw)) return false;
  // Lot stocks are numeric (47407) or mixed (UPAUK9782). A bare word is filler.
  return /\d/.test(raw);
}

/**
 * "45282" as one token, or voice spacing "4 7 4 0 7" / "U P A U K 9 7 8 2".
 * A spelled letter "A" is not the word "a". "It's" must not glue an s
 * onto the front or stop the id. Stops at a real word so "45282 on the
 * lot" does not swallow "on".
 */
function stockFromFragment(fragment: string): string | undefined {
  const cleaned = fragment
    .replace(/['’]/g, "")
    .replace(/\bit(?:s|\s+is)\b/gi, " ");
  const tokens = cleaned
    .split(/[^A-Za-z0-9#]+/)
    .map((t) => t.replace(/^#+/, ""))
    .filter(Boolean);
  const parts: string[] = [];
  for (const tok of tokens) {
    const low = tok.toLowerCase();
    // Single letters are spelled stock ids ("A" in UPAUK). Words stay filler.
    const wordFiller = tok.length > 1 && STOCK_FILLER.has(low);
    if (wordFiller) {
      if (!parts.length) continue;
      break;
    }
    if (isYearToken(tok)) {
      if (!parts.length) continue;
      break;
    }
    if (isStockToken(tok) && tok.length >= 4) {
      // "a 45282" — the article is not part of the id.
      if (
        parts.length === 0 ||
        (parts.length === 1 && parts[0]!.toLowerCase() === "a")
      ) {
        return tok;
      }
    }
    if (/^[A-Za-z0-9]{1,3}$/.test(tok)) {
      parts.push(tok);
      if (parts.join("").length > 14) break;
      continue;
    }
    break;
  }
  const joined = parts.join("");
  if (parts.length >= 2 && isStockToken(joined)) return joined;
  return undefined;
}

/**
 * Id spoken before the cue: "47407 in stock", "46049B on the lot",
 * "U P A U K 9 7 8 2 in stock". Not a model year and not a 4-digit
 * floorplan (3401). Diesel-count asks have no id here.
 */
function isCompactStockId(raw: string): boolean {
  if (!raw || isYearToken(raw)) return false;
  if (STOCK_FILLER.has(raw.toLowerCase())) return false;
  if (/^\d{5,7}[A-Za-z]{0,3}$/.test(raw)) return true;
  return (
    /^[A-Za-z]{1,6}\d{3,7}[A-Za-z]{0,3}$/.test(raw) && raw.length >= 5
  );
}

function stockBeforeKeyword(before: string): string | undefined {
  const cleaned = before
    .replace(/['’]/g, "")
    .replace(/\bit(?:s|\s+is)\b/gi, " ");
  const tokens = cleaned
    .split(/[^A-Za-z0-9]+/)
    .map((t) => t.replace(/^#+/, ""))
    .filter(Boolean);
  const parts: string[] = [];
  for (let i = tokens.length - 1; i >= 0; i--) {
    const tok = tokens[i]!;
    if (tok.length > 1 && STOCK_FILLER.has(tok.toLowerCase())) {
      if (!parts.length) continue;
      break;
    }
    if (isYearToken(tok)) break;
    if (parts.length === 0 && isCompactStockId(tok)) return tok;
    // Spelled ids are one character at a time. "40 QTH" is a floorplan.
    if (/^[A-Za-z0-9]$/.test(tok)) {
      parts.push(tok);
      if (parts.length > 14) return undefined;
      continue;
    }
    break;
  }
  if (parts.length >= 4) {
    const joined = parts.reverse().join("");
    if (isCompactStockId(joined)) return joined;
  }
  return undefined;
}

/**
 * Stock # from the ask. "45282", "stock number 45282", "stk #45282",
 * spaced voice ids ("stock number 4 7 4 0 7", "U P A U K 9 7 8 2"),
 * and an id that comes before the cue ("47407 in stock").
 * Does not treat a model year as a stock number. "num" must not eat
 * the front of "number" and leave "ber" as the id.
 */
export function parseOwnLotStockNumber(text: string): string | undefined {
  const t = normalizeAskText(text);
  if (!t.trim()) return undefined;
  const kw = t.match(/\b(?:stk|stock(?:\s+(?:number|no\.?)|\s*#)?)\b/i);
  if (kw && kw.index != null) {
    const fromKw = stockFromFragment(t.slice(kw.index + kw[0].length));
    if (fromKw) return fromKw;
    const beforeKw = stockBeforeKeyword(t.slice(0, kw.index));
    if (beforeKw) return beforeKw;
  }
  const hashed = t.match(/#\s*([A-Za-z0-9-]{3,12})\b/);
  if (hashed?.[1] && isStockToken(hashed[1])) return hashed[1];
  const bare = t.trim().match(/^#?\s*([A-Za-z]{0,4}\d{4,7}[A-Za-z]{0,3})\s*$/);
  if (bare?.[1] && !isYearToken(bare[1])) return bare[1];
  // Letter-prefixed lot ids ("UPF9963") even when the ask is "how many miles".
  // A bare 5-digit price or floorplan is not a stock number.
  const letterStock = t.match(/\b([A-Za-z]{2,6}\d{3,7}[A-Za-z]{0,3})\b/);
  if (letterStock?.[1] && isCompactStockId(letterStock[1])) return letterStock[1];
  return undefined;
}

/** Live-search notes that are actually the own-lot snapshot, not a web scrape. */
export function isOwnLotResearchNotes(notes: string): boolean {
  const t = notes || "";
  return /Lot total:\s*\d+\s+units/i.test(t) || /OWN-LOT INVENTORY/i.test(t);
}

const VOICE_COACH_LOCK_RE =
  /^VOICE COACH LOCK:\s*([^|\n]*)\|\s*([^|\n]*)\|\s*([^|\n]*)\|\s*([^\n]*)$/im;

/**
 * The one unit a stock/lot hit just named. A later "report on that coach"
 * has no year/make/model in the words — this lock is the coach.
 * Absent when the match was not exactly one unit.
 */
export function ownLotVoiceCoachLock(notes: string): {
  year: string;
  make: string;
  model: string;
  floorplan: string;
} | null {
  const m = (notes || "").match(VOICE_COACH_LOCK_RE);
  if (!m) return null;
  const year = (m[1] || "").trim();
  const make = (m[2] || "").trim();
  const model = (m[3] || "").trim();
  const floorplan = (m[4] || "").trim();
  if (!make || !model) return null;
  return { year, make, model, floorplan };
}

/**
 * Voice must hear the lot total and the matched unit. Do not trim this
 * down to a short web-note slice — that cut used to drop the stock line
 * and leave an older website total in the spoken answer.
 */
export function ownLotNotesForSpeech(notes: string): string {
  const text = notes || "";
  const total = text.match(/Lot total:[^\n]*/i)?.[0]?.trim() ?? "";
  const breakdown =
    text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("Floorplan breakdown")) || "";
  const placeNotes = text
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        /^No \S+ at /.test(line) ||
        /\bis on the lot at:/.test(line) ||
        /different floorplan/.test(line),
    );
  const units = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- ") && /stk\s+/i.test(line))
    .slice(0, 12);
  return [
    "OWN-LOT inventory (our lot snapshot this turn — not a website count):",
    total,
    breakdown,
    ...placeNotes,
    ...units,
    "Stores on these lines are the locations. Do not keep a store from an earlier turn if it is not on a line.",
    "If a floorplan breakdown is printed, say that count once. Do not give a second count.",
    "Speak the Lot total above. Do not say a smaller website total or an older scrape.",
  ]
    .filter(Boolean)
    .join("\n");
}
