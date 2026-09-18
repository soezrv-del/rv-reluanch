/**
 * Public year-range listing comps — free web research path for market value.
 *
 * Prefer public SOLD / sold-status listings (RV Trader, RVUSA, classifieds)
 * for the same make + model (optional floorplan) across coach year ±2.
 * Asking-only comps are demoted: they never become invented sold prices.
 * Mileage, when present on a listing, weights the median (low/mid/high
 * odometer bands). Missing miles stay neutral — never invent odometer.
 *
 * Confidence (sold count only):
 *   High   ≥5 sold → show range
 *   Medium 2–4 sold → show range with a wider spread
 *   Low    <2 sold → "Not enough public listings" — never fill with a guess
 *
 * This module is the reducer + client fetch only. It must NEVER import
 * MarketCheck. Paid inventory search stays a separate side panel and
 * does not feed this ladder. Not JD Power. Not NADA.
 */

import { clampTradeToRetailLow } from "./marketClamp.ts";
import {
  CATALOG_ESTIMATE_LABEL,
  paintFactsLowDeskMarket,
  type MarketConfidence,
  type MarketEstimate,
} from "./marketEstimate.ts";

export { CATALOG_ESTIMATE_LABEL };

/** Live Grok ladder already merged by the caller — not computed here. */
export type LiveMarketLadder = {
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  msrpLo?: number;
  msrpHi?: number;
} | null;

export const DEFAULT_YEAR_PAD = 2;
export const YEAR_MIN = 1990;
/** Medium / prefer bar — two confirmed sold comps. */
export const PUBLIC_COMPS_MIN_SAMPLE = 2;
/** High confidence — five confirmed sold comps. */
export const SOLD_COMPS_HIGH_SAMPLE = 5;
/** Ignore junk / placeholder prices under $1,000. */
export const MIN_ASK_USD = 1000;
/** Hard ceiling — Prevost / bus-conversion outliers still fit under this. */
export const MAX_ASK_USD = 2_500_000;
/** Band threshold only — never written onto a listing as invented miles. */
export const TYPICAL_MILES_PER_YEAR = 10_000;
export const MAX_PLAUSIBLE_MILES = 500_000;

export const SOLD_COMPS_LABEL = "Sold comps";
export const ASKING_COMPS_LABEL = "Asking comps";
/** One Facts-detail footer — never appended to per-comp notes or line items. */
export const PUBLIC_SOLD_DISCLAIMER =
  "Values are estimates from public listings. Not JD Power or NADA book value.";
export const LOW_CONFIDENCE_LISTINGS_MESSAGE = "Not enough public listings";
/** Med/High Market tile — sold median. Low uses Catalog estimate instead. */
export const SOLD_MARKET_TILE_LABEL = "Market value";

/**
 * Facts Market tile caption. Low desk paints Catalog estimate (or the
 * live estimate label) so the haircut mid is not read as sold book.
 * Med/High stay "Market value".
 */
export function factsDeskMarketTileLabel(
  showSoldRange: boolean,
  sourceLabel?: string,
): string {
  if (showSoldRange) return SOLD_MARKET_TILE_LABEL;
  const label = sourceLabel?.trim();
  return label || CATALOG_ESTIMATE_LABEL;
}

export type ListingPriceKind = "sold" | "asking";
export type MileageBand = "low" | "mid" | "high" | "neutral";
export type CompConfidence = MarketConfidence;

export const MILEAGE_WEIGHT: Record<MileageBand, number> = {
  low: 1.35,
  mid: 1.0,
  high: 0.65,
  neutral: 1.0,
};

export type ListingAsk = {
  year: number | null;
  askUsd: number;
  source?: string;
  raw?: string;
  /** Confirmed sold vs advertised ask. Omit = asking — never invent sold. */
  kind?: ListingPriceKind;
  /** Odometer when the listing published one. Omit / null = unknown. */
  miles?: number | null;
  condition?: string;
};

export type YearRange = { from: number; to: number };

export type PublicListingComps = {
  source: "public_listings";
  yearRange: YearRange;
  sampleSize: number;
  soldSampleSize: number;
  askingSampleSize: number;
  priceKind: ListingPriceKind;
  confidence: CompConfidence;
  medianAsk: number;
  privateMid: number;
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  notes: string;
  tradeCappedAtRetailLow?: boolean;
};

export function coachYearRange(
  year: number,
  pad = DEFAULT_YEAR_PAD,
  asOfYear = new Date().getFullYear(),
): YearRange {
  const y = Math.round(Number(year));
  if (!Number.isFinite(y)) {
    return { from: asOfYear - pad, to: asOfYear };
  }
  const from = Math.max(YEAR_MIN, y - pad);
  const to = Math.min(asOfYear + 1, y + pad);
  return { from: Math.min(from, to), to: Math.max(from, to) };
}

export function parseUsdAsk(raw: string): number | null {
  const t = String(raw || "").replace(/[$,\s]/g, "");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

export function parseListedMiles(raw: string): number | null {
  const chunk = String(raw || "");
  const tagged = chunk.match(/MILES\s*=\s*(-|\u2014)?\s*([\d,]+)?/i);
  if (tagged) {
    if (!tagged[2] || tagged[1]) return null;
    return sanitizeMiles(tagged[2]);
  }
  const prose = chunk.match(
    /(\d{1,3}(?:,\d{3}){1,2}|\d{2,6})\s*(?:mi|miles|odometer)\b/i,
  );
  if (!prose) return null;
  return sanitizeMiles(prose[1]);
}

function sanitizeMiles(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0 || n > MAX_PLAUSIBLE_MILES) return null;
  return Math.round(n);
}

function parseCondition(raw: string): string | undefined {
  const m = String(raw || "").match(/CONDITION\s*=\s*([^\n|]+)/i);
  const t = m?.[1]?.trim();
  if (!t || t === "-" || t === "—") return undefined;
  return t;
}

function isPlausibleAsk(n: number): boolean {
  return n >= MIN_ASK_USD && n <= MAX_ASK_USD;
}

/**
 * Mileage band from a published odometer. Missing miles → neutral.
 * Thresholds use typical miles/year for the listing year — they do not
 * invent an odometer on the listing.
 */
export function mileageBand(
  miles: number | null | undefined,
  year: number | null | undefined,
  asOfYear = new Date().getFullYear(),
  yearRange?: YearRange,
): MileageBand {
  if (miles == null || !Number.isFinite(miles) || miles < 0) return "neutral";
  const y =
    year != null && Number.isFinite(year)
      ? year
      : yearRange
        ? Math.round((yearRange.from + yearRange.to) / 2)
        : null;
  const age = y != null ? Math.max(1, asOfYear - y) : 5;
  const expected = age * TYPICAL_MILES_PER_YEAR;
  if (miles < expected * 0.7) return "low";
  if (miles > expected * 1.3) return "high";
  return "mid";
}

export function mileageWeight(band: MileageBand): number {
  return MILEAGE_WEIGHT[band];
}

/** Optional condition multiplier. Missing condition → 1. */
export function conditionWeight(condition?: string): number {
  if (!condition?.trim()) return 1;
  const c = condition.toLowerCase();
  if (/excellent|like\s*new|mint/.test(c)) return 1.15;
  if (/poor|fair|project|rough/.test(c)) return 0.85;
  return 1;
}

export function listingWeight(
  listing: ListingAsk,
  asOfYear = new Date().getFullYear(),
  yearRange?: YearRange,
): number {
  const band = mileageBand(listing.miles, listing.year, asOfYear, yearRange);
  return mileageWeight(band) * conditionWeight(listing.condition);
}

export function soldCompsConfidence(soldCount: number): CompConfidence {
  if (soldCount >= SOLD_COMPS_HIGH_SAMPLE) return "high";
  if (soldCount >= PUBLIC_COMPS_MIN_SAMPLE) return "medium";
  return "low";
}

export function compsConfidenceLabel(
  confidence: CompConfidence,
): "High" | "Medium" | "Low" {
  if (confidence === "high") return "High";
  if (confidence === "medium") return "Medium";
  return "Low";
}

function inferKind(chunk: string, explicit?: ListingPriceKind): ListingPriceKind {
  if (explicit === "sold") return "sold";
  if (explicit === "asking") {
    if (/STATUS\s*=\s*sold\b/i.test(chunk)) return "sold";
    return "asking";
  }
  if (/STATUS\s*=\s*sold\b/i.test(chunk)) return "sold";
  if (/\bsold\s+for\b/i.test(chunk)) return "sold";
  return "asking";
}

/**
 * Pull SOLD: / ASK: YEAR=… PRICE=… MILES=… SOURCE=… lines first, then
 * conservative loose amounts. "Typically sold around $X" is NOT a sold
 * price. Never invent sold prices or miles.
 */
export function extractListingAsks(text: string): ListingAsk[] {
  const byKey = new Map<string, ListingAsk>();
  const push = (ask: ListingAsk) => {
    if (!isPlausibleAsk(ask.askUsd)) return;
    const key = `${ask.year ?? "?"}:${ask.askUsd}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, ask);
      return;
    }
    const kind: ListingPriceKind =
      existing.kind === "sold" || ask.kind === "sold" ? "sold" : "asking";
    byKey.set(key, {
      ...existing,
      kind,
      miles: existing.miles ?? ask.miles ?? null,
      condition: existing.condition || ask.condition,
      source: existing.source || ask.source,
    });
  };

  const pricedLine =
    /(SOLD|ASK):\s*(?:YEAR\s*=\s*(\d{4}))?[^\n]{0,180}?PRICE\s*=\s*\$?\s*([\d,]+(?:\.\d+)?)([^\n]*)/gi;
  let m: RegExpExecArray | null;
  while ((m = pricedLine.exec(text))) {
    const tag = (m[1] || "").toUpperCase();
    const year = m[2] ? parseInt(m[2], 10) : null;
    const askUsd = parseUsdAsk(m[3] || "");
    if (askUsd == null) continue;
    const line = m[0];
    const srcMatch = line.match(/SOURCE\s*=\s*([^\n|]+)/i);
    const explicit: ListingPriceKind = tag === "SOLD" ? "sold" : "asking";
    push({
      year: year && year >= YEAR_MIN ? year : null,
      askUsd,
      source: srcMatch?.[1]?.trim(),
      raw: line.trim(),
      kind: inferKind(line, explicit),
      miles: parseListedMiles(line),
      condition: parseCondition(line),
    });
  }

  // Conservative sold-for only — not "typically sold around".
  const soldFor =
    /\b((?:19|20)\d{2})\b[^\n$]{0,80}\bsold\s+for\s+\$?\s*(\d{1,3}(?:,\d{3}){1,2}|\d{4,7})\b/gi;
  while ((m = soldFor.exec(text))) {
    const askUsd = parseUsdAsk(m[2] || "");
    if (askUsd == null) continue;
    push({
      year: parseInt(m[1]!, 10),
      askUsd,
      raw: m[0].trim().slice(0, 120),
      kind: "sold",
      miles: parseListedMiles(m[0]),
    });
  }

  // Fallback asking: "2022 Winnebago Revel … $129,900"
  const loose =
    /(?:\b(19|20)\d{2}\b)?[^\n$]{0,80}\$\s*(\d{1,3}(?:,\d{3}){1,2}|\d{4,7})\b/g;
  while ((m = loose.exec(text))) {
    const yearBits = m[0].match(/\b((?:19|20)\d{2})\b/);
    const askUsd = parseUsdAsk(m[2] || "");
    if (askUsd == null) continue;
    if (/\bsold\s+for\b/i.test(m[0])) continue;
    push({
      year: yearBits ? parseInt(yearBits[1]!, 10) : null,
      askUsd,
      raw: m[0].trim().slice(0, 120),
      kind: "asking",
      miles: parseListedMiles(m[0]),
    });
  }

  return [...byKey.values()];
}

export function filterAsksForRange(
  asks: ListingAsk[],
  yearRange: YearRange,
): ListingAsk[] {
  return asks.filter((a) => {
    if (!isPlausibleAsk(a.askUsd)) return false;
    if (a.year == null) return true;
    return a.year >= yearRange.from && a.year <= yearRange.to;
  });
}

/** Drop IQR-style extremes once we have 3+ usable prices. */
export function dropAskOutliers(asks: ListingAsk[]): ListingAsk[] {
  if (asks.length < 3) return asks;
  const sorted = [...asks].sort((a, b) => a.askUsd - b.askUsd);
  const mid = medianUsd(sorted.map((a) => a.askUsd));
  if (mid <= 0) return asks;
  const lo = mid * 0.35;
  const hi = mid * 3.5;
  const kept = asks.filter((a) => a.askUsd >= lo && a.askUsd <= hi);
  return kept.length >= 2 ? kept : asks;
}

export function medianUsd(values: number[]): number {
  const nums = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (!nums.length) return 0;
  const mid = Math.floor(nums.length / 2);
  if (nums.length % 2 === 1) return nums[mid]!;
  return Math.round((nums[mid - 1]! + nums[mid]!) / 2);
}

/**
 * Weighted median. Equal weights (including all-neutral miles) match
 * {@link medianUsd}. Weights never invent a price that was not listed.
 */
export function weightedMedianUsd(
  items: { usd: number; weight: number }[],
): number {
  const usable = items.filter(
    (i) => Number.isFinite(i.usd) && i.usd > 0 && Number.isFinite(i.weight) && i.weight > 0,
  );
  if (!usable.length) return 0;
  const w0 = usable[0]!.weight;
  if (usable.every((i) => i.weight === w0)) {
    return medianUsd(usable.map((i) => i.usd));
  }
  const sorted = [...usable].sort((a, b) => a.usd - b.usd);
  const total = sorted.reduce((s, i) => s + i.weight, 0);
  let acc = 0;
  for (const item of sorted) {
    acc += item.weight;
    if (acc >= total / 2) return item.usd;
  }
  return sorted[sorted.length - 1]!.usd;
}

function roundUsd(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 1000) * 1000;
}

/**
 * Sold (or asking-fallback) median → ladder.
 * High: retailHigh ≈ median, retailLow ≈ median × 0.88
 * Medium: wider spread (0.80–1.12) — fewer sold comps.
 * Low: not shown as a sold range (caller must not fill a guess).
 */
export function ladderFromMedianAsk(
  medianAsk: number,
  confidence: CompConfidence = "high",
): {
  privateMid: number;
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  tradeCappedAtRetailLow?: boolean;
} {
  const median = Math.max(0, medianAsk);
  const medium = confidence === "medium" || confidence === "low";
  const privateMid = roundUsd(median * (medium ? 0.9 : 0.92));
  const retailHigh = roundUsd(median * (medium ? 1.12 : 1));
  const retailLow = roundUsd(median * (medium ? 0.8 : 0.88));
  const rawTrade = roundUsd(median * (medium ? 0.72 : 0.78));
  const lo = Math.min(retailLow, retailHigh);
  const hi = Math.max(retailLow, retailHigh);
  const trade = clampTradeToRetailLow(rawTrade, lo);
  return {
    privateMid,
    tradeIn: trade.tradeIn,
    retailLow: lo,
    retailHigh: hi,
    tradeCappedAtRetailLow: trade.capped || undefined,
  };
}

export function listingKind(listing: ListingAsk): ListingPriceKind {
  return listing.kind === "sold" ? "sold" : "asking";
}

/**
 * Sold listings win the sample when any exist. Asking-only is kept only
 * when sold is unavailable — still low confidence, never labeled sold.
 */
export function selectCompListings(asks: ListingAsk[]): {
  used: ListingAsk[];
  priceKind: ListingPriceKind;
  sold: ListingAsk[];
  asking: ListingAsk[];
} {
  const sold = asks.filter((a) => listingKind(a) === "sold");
  const asking = asks.filter((a) => listingKind(a) !== "sold");
  if (sold.length > 0) {
    return { used: sold, priceKind: "sold", sold, asking };
  }
  return { used: asking, priceKind: "asking", sold, asking };
}

function sampleNotes(
  selected: ReturnType<typeof selectCompListings>,
  usedCount: number,
  yearRange: YearRange,
  confidence: CompConfidence,
): string {
  if (selected.priceKind === "sold") {
    if (confidence === "low") {
      return `Only ${usedCount} public sold price${usedCount === 1 ? "" : "s"} across ${yearRange.from}–${yearRange.to}. ${LOW_CONFIDENCE_LISTINGS_MESSAGE}.`;
    }
    if (confidence === "medium") {
      return `${usedCount} public sold prices for the same coach across ${yearRange.from}–${yearRange.to}. Medium confidence — wider range.`;
    }
    return `${usedCount} public sold prices for the same coach across ${yearRange.from}–${yearRange.to}.`;
  }
  return `${usedCount} public asking price${usedCount === 1 ? "" : "s"} only — no confirmed sold comps. ${LOW_CONFIDENCE_LISTINGS_MESSAGE}. Asking prices are not sold prices.`;
}

export function reducePublicComps(
  asks: ListingAsk[],
  yearRange: YearRange,
  notes?: string,
  opts?: { asOfYear?: number },
): PublicListingComps | null {
  const inRange = filterAsksForRange(asks, yearRange);
  const selected = selectCompListings(inRange);
  const filtered = dropAskOutliers(selected.used);
  if (filtered.length < 1) return null;
  const asOfYear = opts?.asOfYear ?? new Date().getFullYear();
  const medianAsk = weightedMedianUsd(
    filtered.map((a) => ({
      usd: a.askUsd,
      weight: listingWeight(a, asOfYear, yearRange),
    })),
  );
  if (medianAsk < MIN_ASK_USD) return null;
  const soldSampleSize = selected.sold.length;
  const confidence =
    selected.priceKind === "sold"
      ? soldCompsConfidence(soldSampleSize)
      : "low";
  const ladder = ladderFromMedianAsk(medianAsk, confidence);
  return {
    source: "public_listings",
    yearRange,
    sampleSize: filtered.length,
    soldSampleSize,
    askingSampleSize: selected.asking.length,
    priceKind: selected.priceKind,
    confidence,
    medianAsk,
    ...ladder,
    notes: [notes?.trim(), sampleNotes(selected, filtered.length, yearRange, confidence)]
      .filter(Boolean)
      .join(" "),
  };
}

export function prefersPublicComps(
  comps: PublicListingComps | null | undefined,
): boolean {
  return Boolean(
    comps &&
      comps.source === "public_listings" &&
      comps.priceKind === "sold" &&
      comps.confidence !== "low" &&
      comps.soldSampleSize >= PUBLIC_COMPS_MIN_SAMPLE &&
      comps.medianAsk >= MIN_ASK_USD,
  );
}

export function publicCompsSourceLabel(comps: PublicListingComps): string {
  if (comps.priceKind === "sold" && comps.soldSampleSize >= PUBLIC_COMPS_MIN_SAMPLE) {
    return SOLD_COMPS_LABEL;
  }
  if (comps.priceKind === "asking") return ASKING_COMPS_LABEL;
  return SOLD_COMPS_LABEL;
}

export function resolvePrimaryMarket(opts: {
  catalog: MarketEstimate;
  liveLadder?: LiveMarketLadder;
  comps?: PublicListingComps | null;
}): MarketEstimate {
  const { catalog, liveLadder, comps } = opts;
  if (prefersPublicComps(comps) && comps) {
    const trade = clampTradeToRetailLow(comps.tradeIn, comps.retailLow);
    return {
      tradeIn: trade.tradeIn,
      retailLow: comps.retailLow,
      retailHigh: comps.retailHigh,
      msrpLo: catalog.msrpLo,
      msrpHi: catalog.msrpHi,
      segment: catalog.segment,
      ageYears: catalog.ageYears,
      tradeCappedAtRetailLow:
        trade.capped || comps.tradeCappedAtRetailLow || undefined,
      source: "public_listings",
      sourceLabel: publicCompsSourceLabel(comps),
      confidence: comps.confidence,
      /** Hug the public sold median — not the Catalog estimate seed. */
      marketValue: comps.medianAsk,
      hideRetailHigh: false,
    };
  }

  /**
   * Low / not-enough-listings: paint from the fat catalog band via
   * paintFactsLowDeskMarket (0.66 haircut). A confirmed thin sold may
   * pull Market down; a fat lone sold / tight $219k mid cannot keep
   * Catalog optimistic. Asking-only is not a sold price. Never invent.
   */
  return paintFactsLowDeskMarket(catalog, {
    thinSoldUsd: thinSoldAskUsd(comps),
    live: liveLadder,
  });
}

/** One confirmed sold ask on a Low / thin ladder — not asking, not invent. */
export function thinSoldAskUsd(
  comps: PublicListingComps | null | undefined,
): number | undefined {
  if (
    comps &&
    (comps.confidence === "low" || !prefersPublicComps(comps)) &&
    comps.priceKind === "sold" &&
    comps.medianAsk >= MIN_ASK_USD
  ) {
    return comps.medianAsk;
  }
  return undefined;
}

export function buildListingCompsPrompt(input: {
  year: number;
  make: string;
  model: string;
  floorplan?: string;
  yearRange: YearRange;
}): { system: string; user: string } {
  const coach = [input.year, input.make, input.model, input.floorplan]
    .filter(Boolean)
    .join(" ");
  const system = [
    "You research PUBLIC SOLD prices for one RV coach. Return RESEARCH NOTES only — no JSON.",
    "Find concrete USED sold / sold-status listings for the SAME make + model (and floorplan when given).",
    `Year window: ${input.yearRange.from}–${input.yearRange.to} (coach year ±2).`,
    "Prefer RV Trader, RVUSA, dealer sold pages, and public classifieds that mark the unit SOLD.",
    "Each confirmed SOLD listing MUST be a line:",
    "SOLD: YEAR=<yyyy> MAKE=<make> MODEL=<model> FLOORPLAN=<code or -> PRICE=<usd> MILES=<n or -> CONDITION=<or -> SOURCE=<site>",
    "PRICE is the public sold price in USD. Do NOT invent sold prices. If you did not see a sold price, do not write a SOLD line.",
    "MILES only when the listing shows an odometer. Never invent miles. Use MILES=- when unknown.",
    "If a listing is asking-only (not sold), use ASK: … not SOLD:. Do not relabel an ask as sold.",
    "ASK: YEAR=<yyyy> MAKE=<make> MODEL=<model> PRICE=<usd> MILES=<n or -> SOURCE=<site>",
    "Include ASK lines only as fallback when sold-status is unavailable.",
    "Never use MarketCheck, NADA, J.D. Power, or any paid book as a price.",
    "Never output guidebook / wholesale book values.",
    "Ignore junk under $1000, parts, junkyard, and obvious outliers (wrong class).",
    "If you cannot find two real SOLD listings, say INSUFFICIENT and list only what you found. Do not guess sold prices.",
  ].join("\n");
  const user = [
    `Find public sold prices for: ${coach}`,
    `Same coach across ${input.yearRange.from}–${input.yearRange.to}.`,
    input.floorplan
      ? `Prefer floorplan ${input.floorplan} when the listing names it; still include same model other plans if needed.`
      : "Floorplan unknown — same make + model is enough.",
    "List every confirmed SOLD line. ASK lines only if sold is unavailable.",
  ].join("\n");
  return { system, user };
}

export async function fetchPublicListingComps(
  input: {
    year: string;
    make: string;
    model: string;
    floorplan?: string;
  },
  signal?: AbortSignal,
): Promise<PublicListingComps | null> {
  if (!input.year.trim() || !input.make.trim() || !input.model.trim()) {
    return null;
  }
  try {
    const resp = await fetch("/api/rvfax/public-comps", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        year: input.year.trim(),
        make: input.make.trim(),
        model: input.model.trim(),
        floorplan: input.floorplan?.trim() || undefined,
      }),
      signal,
    });
    if (!resp.ok) return null;
    const json = (await resp.json()) as {
      data?: PublicListingComps;
      ok?: boolean;
    };
    if (json?.data?.source === "public_listings" && json.data.medianAsk > 0) {
      return json.data;
    }
    return null;
  } catch {
    return null;
  }
}
