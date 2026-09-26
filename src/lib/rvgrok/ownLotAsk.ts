/**
 * Browser-safe own-lot ask detection.
 *
 * Stock / search / listing-price classifiers only. The snapshot loader
 * stays in ownLotInventory.ts so the Grok tab does not pull disk IO
 * or the inventory formatter into the client.
 */

import {
  extractFloorplanToken,
  looksLikeLengthMeasureAsk,
  normalizeFloorplanToken,
  parseCoachFromText,
} from "./parseCoach.ts";
import {
  looksLikeInventoryOrCountQuestion,
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";

export { parseAskedClassAndFuel } from "./fuelClass.ts";

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

const EXPLICIT_WE_HAVE_STOCK_RE =
  /\b(?:do|did|does)\s+(?:we|you)\s+have\b|\bhave\s+we\s+got\b|\bwe\s+have\s+any\b|\b(?:can|could)\s+you\s+see\s+if\b|\bdo\s+you\s+see\b|\bsee\s+if\s+(?:we|you)\s+have\b|\b(?:tell|show)\s+me\s+if\s+we\s+have\b/i;

/** look/find/search/pull/check — salesman lot search, not "look up" catalog. */
const STRONG_LOT_SEARCH_RE =
  /\b(?:look(?:ing)?\s+for|find(?:ing)?|search(?:ing)?(?:\s+for)?|pull(?:ing)?|check(?:ing)?)\b/i;

/** Weaker "got/any" — only with a floorplan or stock token, not a bare brand. */
const WEAK_LOT_SEARCH_RE = /\b(?:got|any)\b/i;

const LOT_PLACE_CUE_RE =
  /\b(?:on (?:the |our )?lot|inventor(?:y|ies)|in stock)\b/i;

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
  if (WEAK_LOT_SEARCH_RE.test(t) && hasFloorplanOrStock) return true;
  return false;
}

/**
 * "What about the 29S Entegra Vision?" mid-inventory is the lot, not a
 * catalog report. "Tell me about" without a floorplan stays a product ask.
 */
export function looksLikeLotFloorplanFollowUp(text: string): boolean {
  const t = normalizeAskText(text);
  if (looksLikeSpecQuestion(t)) return false;
  const parsed = parseCoachFromText(t);
  if (!(parsed.floorplan && (parsed.make || parsed.model))) return false;
  if (/\b(?:what|how)\s+about\b/i.test(t)) return true;
  return /\b(?:missing|where(?:'s| is)|that(?:'s| is) there|on the show)\b/i.test(t);
}

const LOT_THEM_RE = /\b(?:them|those|these|'em|’em)\b/i;

function isThemLotFollow(text: string): boolean {
  const t = normalizeAskText(text);
  return LOT_THEM_RE.test(t) && /\bhow many\b/i.test(t);
}

function isLotClarification(text: string): boolean {
  return /\b(?:i meant|meant to say)\b/i.test(normalizeAskText(text));
}

function mentionsRvClass(text: string): boolean {
  return /\bclass\s*[abc]s?\b/i.test(text || "");
}

/** "30-foot Class As at the Carson RV show" is the lot even without "in stock". */
export function looksLikeSizedLotAsk(text: string): boolean {
  if (!looksLikeLengthMeasureAsk(text)) return false;
  const t = normalizeAskText(text);
  return (
    mentionsRvClass(t) ||
    /\brv\s+show\b/i.test(t) ||
    /\b(?:in stock|on (?:the |our )?lot|inventor)/i.test(t)
  );
}

function stitchPriorLot(spoken: string, priorUserTurns: readonly string[]): string | null {
  const bits = priorUserTurns.filter(
    (prev) =>
      looksLikeOwnLotStockQuestion(prev) ||
      looksLikeSizedLotAsk(prev) ||
      looksLikeLengthMeasureAsk(prev),
  );
  if (!bits.length) return null;
  return `${bits.join(". ")}. ${spoken}`;
}

function priorShowPhrase(priorUserTurns: readonly string[]): string | null {
  for (let i = priorUserTurns.length - 1; i >= 0; i--) {
    const m = (priorUserTurns[i] || "").match(
      /\bat\s+the\s+[A-Za-z0-9'’. -]{0,40}?\bshow\b/i,
    );
    if (m) return m[0];
  }
  return null;
}

const LOT_YES_RE =
  /^(?:yeah|yes|yep|yup|sure|ok|okay|please|do that|go ahead|check(?: the full lot)?|full lot|the full lot)[.!\s]*$/i;

const LOT_MODEL_FOLLOW_RE =
  /\b(?:what are the models|which models|what models|models of those|floorplans of those)\b/i;

function coachStockAsk(text: string): string | null {
  const parsed = parseCoachFromText(text);
  if (!((parsed.floorplan && (parsed.make || parsed.model)) || (parsed.make && parsed.model))) {
    return null;
  }
  const coach = [parsed.year, parsed.make, parsed.model, parsed.floorplan]
    .filter(Boolean)
    .join(" ");
  return coach ? `do we have ${coach} in stock` : null;
}

/**
 * "Yeah" after "what about the 29S" searches that coach on the full lot.
 * "What are the models of those twelve?" repeats the last make/model stock ask.
 * A store from the earlier turn is not copied onto this query.
 */
export function lotQueryForFollowUp(
  spoken: string,
  priorUserTurns: readonly string[],
): string | null {
  const t = normalizeAskText(spoken).trim();
  if (isThemLotFollow(t) || isLotClarification(t)) {
    return stitchPriorLot(spoken, priorUserTurns);
  }
  if (
    looksLikeLotFloorplanFollowUp(t) &&
    /\b(?:there|that show|the show)\b/i.test(t) &&
    !/\bshow\b/i.test(t)
  ) {
    const show = priorShowPhrase(priorUserTurns);
    if (show) return `${spoken} ${show}`;
  }
  if (LOT_MODEL_FOLLOW_RE.test(t)) {
    for (let i = priorUserTurns.length - 1; i >= 0; i--) {
      const prev = priorUserTurns[i] || "";
      const parsed = parseCoachFromText(prev);
      if (looksLikeOwnLotStockQuestion(prev) && (parsed.make || parsed.model)) {
        return prev;
      }
    }
    return null;
  }
  if (!LOT_YES_RE.test(t)) return null;
  for (let i = priorUserTurns.length - 1; i >= 0; i--) {
    const rebuilt = coachStockAsk(priorUserTurns[i] || "");
    if (rebuilt) return rebuilt;
  }
  return null;
}

export function looksLikeOwnLotStockQuestion(text: string): boolean {
  // Explicit stock only — "do we have" / on the lot / in stock / inventory /
  // diesel count / stock # / lot listing prices / lot search (look for 27A).
  // A year+make+model+floorplan designation is a CATALOG report, not an
  // own-lot probe. "What about the 29S Entegra Vision?" is the exception:
  // a named floorplan follow-up stays on the lot.
  if (looksLikeLotFloorplanFollowUp(text)) return true;
  if (looksLikeSizedLotAsk(text)) return true;
  if (
    looksLikeInventoryOrCountQuestion(text) ||
    looksLikeOwnLotListingPriceQuestion(text) ||
    Boolean(parseOwnLotStockNumber(text)) ||
    looksLikeOwnLotSearchAsk(text)
  ) {
    return true;
  }
  return EXPLICIT_WE_HAVE_STOCK_RE.test(normalizeAskText(text));
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
    "If a unit line is printed, that coach IS on this lot. Never say it is missing.",
    "Stores on these lines are the locations. Do not keep a store from an earlier turn if it is not on a line.",
    "If a floorplan breakdown is printed, say that count once. Do not give a second count.",
    "Speak the Lot total above. Do not say a smaller website total or an older scrape.",
  ]
    .filter(Boolean)
    .join("\n");
}
