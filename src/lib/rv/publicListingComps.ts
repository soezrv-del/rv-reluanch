/**
 * Public year-range listing comps — free web research path for market value.
 *
 * Asking prices for the same make + model (optional floorplan) across
 * coach year ±2. This module is the reducer + client fetch only.
 * It must NEVER import MarketCheck. Paid inventory search stays a
 * separate side panel and does not feed this ladder.
 *
 * Threshold: prefer this ladder when sampleSize >= PUBLIC_COMPS_MIN_SAMPLE
 * (2). Three asks is higher confidence; two is the accept bar because
 * same-coach year-range listings are often sparse.
 */

import { clampTradeToRetailLow } from "./marketClamp.ts";
import type { MarketEstimate } from "./marketEstimate.ts";

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
/** Accept bar — documented in the file header. */
export const PUBLIC_COMPS_MIN_SAMPLE = 2;
/** Ignore junk / placeholder asks under $1,000. */
export const MIN_ASK_USD = 1000;
/** Hard ceiling — Prevost / bus-conversion outliers still fit under this. */
export const MAX_ASK_USD = 2_500_000;

export type ListingAsk = {
  year: number | null;
  askUsd: number;
  source?: string;
  raw?: string;
};

export type YearRange = { from: number; to: number };

export type PublicListingComps = {
  source: "public_listings";
  yearRange: YearRange;
  sampleSize: number;
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

function isPlausibleAsk(n: number): boolean {
  return n >= MIN_ASK_USD && n <= MAX_ASK_USD;
}

/**
 * Pull ASK: YEAR=… PRICE=… SOURCE=… lines first, then loose $ amounts
 * that look like listing prices (not NADA book cites).
 */
export function extractListingAsks(text: string): ListingAsk[] {
  const out: ListingAsk[] = [];
  const seen = new Set<string>();
  const push = (ask: ListingAsk) => {
    if (!isPlausibleAsk(ask.askUsd)) return;
    const key = `${ask.year ?? "?"}:${ask.askUsd}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(ask);
  };

  const askLine =
    /ASK:\s*(?:YEAR\s*=\s*(\d{4}))?[\s\S]{0,180}?PRICE\s*=\s*\$?\s*([\d,]+(?:\.\d+)?)/gi;
  let m: RegExpExecArray | null;
  while ((m = askLine.exec(text))) {
    const year = m[1] ? parseInt(m[1], 10) : null;
    const askUsd = parseUsdAsk(m[2] || "");
    if (askUsd == null) continue;
    const srcMatch = m[0].match(/SOURCE\s*=\s*([^\n|]+)/i);
    push({
      year: year && year >= YEAR_MIN ? year : null,
      askUsd,
      source: srcMatch?.[1]?.trim(),
      raw: m[0].trim(),
    });
  }

  // Fallback: "2022 Winnebago Revel … $129,900"
  const loose =
    /(?:\b(19|20)\d{2}\b)?[^\n$]{0,80}\$\s*(\d{1,3}(?:,\d{3}){1,2}|\d{4,7})\b/g;
  while ((m = loose.exec(text))) {
    const yearBits = m[0].match(/\b((?:19|20)\d{2})\b/);
    const askUsd = parseUsdAsk(m[2] || "");
    if (askUsd == null) continue;
    push({
      year: yearBits ? parseInt(yearBits[1]!, 10) : null,
      askUsd,
      raw: m[0].trim().slice(0, 120),
    });
  }

  return out;
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

/** Drop IQR-style extremes once we have 3+ usable asks. */
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

function roundUsd(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 1000) * 1000;
}

/**
 * Asks are list prices, not closed deals.
 * private mid = median × 0.92
 * retailHigh  ≈ median ask
 * retailLow   ≈ median × 0.88
 * tradeIn     ≈ median × 0.78
 */
export function ladderFromMedianAsk(medianAsk: number): {
  privateMid: number;
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  tradeCappedAtRetailLow?: boolean;
} {
  const median = Math.max(0, medianAsk);
  const privateMid = roundUsd(median * 0.92);
  const retailHigh = roundUsd(median);
  const retailLow = roundUsd(median * 0.88);
  const rawTrade = roundUsd(median * 0.78);
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

export function reducePublicComps(
  asks: ListingAsk[],
  yearRange: YearRange,
  notes?: string,
): PublicListingComps | null {
  const filtered = dropAskOutliers(filterAsksForRange(asks, yearRange));
  if (filtered.length < 1) return null;
  const medianAsk = medianUsd(filtered.map((a) => a.askUsd));
  if (medianAsk < MIN_ASK_USD) return null;
  const ladder = ladderFromMedianAsk(medianAsk);
  const sampleNote =
    filtered.length >= PUBLIC_COMPS_MIN_SAMPLE
      ? `${filtered.length} public asking prices for the same coach across ${yearRange.from}–${yearRange.to}. Asks are list prices, not closed sales.`
      : `Only ${filtered.length} usable public ask — below the prefer threshold of ${PUBLIC_COMPS_MIN_SAMPLE}.`;
  return {
    source: "public_listings",
    yearRange,
    sampleSize: filtered.length,
    medianAsk,
    ...ladder,
    notes: [notes?.trim(), sampleNote].filter(Boolean).join(" "),
  };
}

export function prefersPublicComps(
  comps: PublicListingComps | null | undefined,
): boolean {
  return Boolean(
    comps &&
      comps.source === "public_listings" &&
      comps.sampleSize >= PUBLIC_COMPS_MIN_SAMPLE &&
      comps.medianAsk >= MIN_ASK_USD,
  );
}

export function publicCompsSourceLabel(comps: PublicListingComps): string {
  return `Public listing asks (${comps.yearRange.from}–${comps.yearRange.to})`;
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
    };
  }

  if (liveLadder) {
    const merged = {
      tradeIn: liveLadder.tradeIn > 0 ? liveLadder.tradeIn : catalog.tradeIn,
      retailLow:
        liveLadder.retailLow > 0 ? liveLadder.retailLow : catalog.retailLow,
      retailHigh:
        liveLadder.retailHigh > 0 ? liveLadder.retailHigh : catalog.retailHigh,
    };
    const trade = clampTradeToRetailLow(merged.tradeIn, merged.retailLow);
    return {
      tradeIn: trade.tradeIn,
      retailLow: merged.retailLow,
      retailHigh: merged.retailHigh,
      msrpLo: liveLadder.msrpLo ?? catalog.msrpLo,
      msrpHi: liveLadder.msrpHi ?? catalog.msrpHi,
      segment: catalog.segment,
      ageYears: catalog.ageYears,
      tradeCappedAtRetailLow: trade.capped || catalog.tradeCappedAtRetailLow,
      source: "live_dossier",
      sourceLabel: "Live research estimate",
    };
  }

  return {
    ...catalog,
    source: catalog.source ?? "catalog",
    sourceLabel: catalog.sourceLabel ?? "Catalog estimate",
  };
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
    "You research PUBLIC asking prices for one RV coach. Return RESEARCH NOTES only — no JSON.",
    "Find concrete USED listing asks for the SAME make + model (and floorplan when given).",
    `Year window: ${input.yearRange.from}–${input.yearRange.to} (coach year ±2).`,
    "Each confirmed listing MUST be a line:",
    "ASK: YEAR=<yyyy> MAKE=<make> MODEL=<model> FLOORPLAN=<code or -> PRICE=<usd> SOURCE=<site>",
    "PRICE is the advertised asking price in USD. Do not invent listings.",
    "Prefer RV Trader, RVUSA, dealer sites, public classifieds. Name the source site.",
    "Never use MarketCheck, NADA, J.D. Power, or any paid book as a price.",
    "Never output guidebook / wholesale book values. Asking prices only.",
    "Ignore junk under $1000, parts, junkyard, and obvious outliers (wrong class).",
    "If you cannot find two real asks, say INSUFFICIENT and list what you found.",
  ].join("\n");
  const user = [
    `Find used asking prices for: ${coach}`,
    `Same coach across ${input.yearRange.from}–${input.yearRange.to}.`,
    input.floorplan
      ? `Prefer floorplan ${input.floorplan} when the listing names it; still include same model other plans if needed.`
      : "Floorplan unknown — same make + model is enough.",
    "List every concrete ASK line you can confirm.",
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
