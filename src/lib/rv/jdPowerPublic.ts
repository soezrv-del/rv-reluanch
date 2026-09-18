/**
 * On-demand free public J.D. Power RV values — Palazzo-first test path.
 *
 * Fetched when Facts opens Market value. No cron, no nightly batch, no
 * stored dollar snapshots. Dollars come only from a live public HTML
 * parse. If the fetch or parse fails, return GAP — never invent book
 * values, never a paid J.D. Power Price Guide / NADA API.
 *
 * Public source: jdpower.com/rvs values pages
 * (e.g. 2021 Thor Palazzo 33.5 Freightliner).
 */

import { clampRetailHighToMarketValue, clampTradeToRetailLow } from "./marketClamp.ts";
import type { MarketEstimate, MarketValueSource } from "./marketEstimate.ts";

/** Locked Catalog chip — never bare "J.D. Power" / "NADA" as a desk title. */
export const JD_POWER_PUBLIC_LABEL = "Public J.D. Power estimate";
/** Locked blend sub/sourceLabel when public JD × live nationwide asks both exist. */
export const JD_POWER_BLEND_LABEL =
  "Avg of public J.D. Power estimate + asking comps";

export const PALAZZO_JD_POWER_TEST_UNIT = {
  year: 2021,
  make: "Thor",
  model: "Palazzo",
  floorplan: "33.5",
} as const;

/** Public values page for the Palazzo test unit — URL only, not dollars. */
export const PALAZZO_33_5_2021_VALUES_URL =
  "https://www.jdpower.com/rvs/2021/thor-motor-coach/m-33-5-freightliner/6606180/values";

export const JD_POWER_PUBLIC_ORIGIN = "https://www.jdpower.com";

export type JdPowerPublicEstimate = {
  source: "jd_power_public";
  year: number;
  make: string;
  model: string;
  floorplan?: string;
  lowRetail: number;
  averageRetail: number;
  /** Null when the public page omits High — never invent. */
  highRetail: number | null;
  sourceUrl: string;
  sourceLabel: typeof JD_POWER_PUBLIC_LABEL;
};

export type JdPowerFetchResult =
  | { ok: true; data: JdPowerPublicEstimate }
  | { ok: false; reason: string; data: null };

const MIN_BOOK_USD = 1_000;
const MAX_BOOK_USD = 2_500_000;

export function isJdPowerBlendEligible(make?: string, model?: string): boolean {
  return (
    /^thor$/i.test((make || "").trim()) &&
    /^palazzo$/i.test((model || "").trim())
  );
}

export function isJdPowerMarketSource(
  source?: MarketValueSource | string | null,
): boolean {
  return source === "jd_power_public" || source === "jd_power_blend";
}

/**
 * Locked Average sublabel from the ladder source. Prefer this over a
 * leftover Catalog estimate chip — #283 can set `source` to the blend
 * while `sourceLabel` still reads Catalog estimate on the thin desk.
 */
export function jdPowerSourceLabel(
  source?: MarketValueSource | string | null,
): string | undefined {
  if (source === "jd_power_blend") return JD_POWER_BLEND_LABEL;
  if (source === "jd_power_public") return JD_POWER_PUBLIC_LABEL;
  return undefined;
}

/** 33.5 → m-33-5 (JD Power used-values slug). */
export function jdPowerFloorplanSlug(floorplan: string): string | null {
  const t = floorplan.trim();
  const m = t.match(/^(\d{2})\.(\d)$/);
  if (!m) return null;
  return `m-${m[1]}-${m[2]}`;
}

export function roundJdPublicUsd(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 1000) * 1000;
}

function parseUsdAmount(raw: string): number | null {
  const n = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < MIN_BOOK_USD || n > MAX_BOOK_USD) return null;
  return Math.round(n);
}

export function htmlToPlainText(html: string): string {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#36;/g, "$")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function labeledUsd(text: string, label: RegExp): number | null {
  const re = new RegExp(
    `${label.source}[^$]{0,48}\\$\\s*(\\d{1,3}(?:,\\d{3}){1,2}|\\d{4,7})`,
    "i",
  );
  const m = text.match(re);
  return m?.[1] ? parseUsdAmount(m[1]) : null;
}

/**
 * Extract Low / Average / optional High from a public JD Power values page.
 * Missing Low or Average → GAP. Missing High → null (do not invent).
 */
export function parseJdPowerPublicHtml(html: string): {
  lowRetail: number;
  averageRetail: number;
  highRetail: number | null;
} | null {
  const text = htmlToPlainText(html);
  if (!text) return null;
  const lowRetail = labeledUsd(text, /low\s+retail\s+value/);
  const averageRetail = labeledUsd(text, /average\s+retail\s+value/);
  if (lowRetail == null || averageRetail == null) return null;
  if (lowRetail > averageRetail) return null;
  const highRetail = labeledUsd(text, /high\s+retail\s+value/);
  if (highRetail != null && highRetail < averageRetail) {
    return { lowRetail, averageRetail, highRetail: null };
  }
  return { lowRetail, averageRetail, highRetail };
}

export function discoverJdPowerValuesUrl(
  listingHtml: string,
  year: number,
  floorplan: string,
): string | null {
  const slug = jdPowerFloorplanSlug(floorplan);
  if (!slug) return null;
  const re = new RegExp(
    `/rvs/${year}/thor-motor-coach/${slug}[-a-z0-9]*/(\\d+)(?:/values)?`,
    "i",
  );
  const m = listingHtml.match(re);
  if (!m?.[0]) return null;
  const path = m[0].replace(/\/values$/i, "") + "/values";
  return `${JD_POWER_PUBLIC_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

export function knownPalazzoJdPowerValuesUrl(
  year: string | number,
  floorplan?: string,
): string | null {
  const y = String(year).trim();
  const fp = (floorplan || "").trim();
  if (
    y === String(PALAZZO_JD_POWER_TEST_UNIT.year) &&
    fp === PALAZZO_JD_POWER_TEST_UNIT.floorplan
  ) {
    return PALAZZO_33_5_2021_VALUES_URL;
  }
  return null;
}

function listingUrlsFor(year: number): string[] {
  return [
    `${JD_POWER_PUBLIC_ORIGIN}/rvs/${year}/used/thor-motor-coach`,
    `${JD_POWER_PUBLIC_ORIGIN}/rvs/${year}/thor-motor-coach`,
  ];
}

async function fetchPublicHtml(
  url: string,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<{ ok: true; html: string } | { ok: false; reason: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const resp = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent":
          "Mozilla/5.0 (compatible; RVFaxFacts/1.0; +https://www.rvmax.app)",
      },
      signal: ctrl.signal,
    });
    if (!resp.ok) {
      return {
        ok: false,
        reason: `public J.D. Power page returned ${resp.status}`,
      };
    }
    const html = await resp.text();
    if (!html.trim()) return { ok: false, reason: "empty public J.D. Power page" };
    return { ok: true, html };
  } catch (e) {
    if (signal?.aborted || (e instanceof Error && e.name === "AbortError")) {
      return { ok: false, reason: "public J.D. Power fetch aborted" };
    }
    return {
      ok: false,
      reason:
        e instanceof Error ? e.message : "public J.D. Power fetch failed",
    };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

export type BlendJdPowerBandsInput = {
  jdLow: number;
  jdAverage: number;
  jdHigh: number | null;
  soldMedian?: number;
  compsRetailLow?: number;
  compsRetailHigh?: number;
  compsTradeIn?: number;
};

/**
 * Blend formula (Facts Low / Average / High):
 *   Average = mean(JD average retail, sold median) when both exist
 *   Low     = mean(JD low retail, sold retailLow) when both exist
 *   High    = mean(JD high retail, sold retailHigh) when JD high exists;
 *             else the available source only — never invent a JD high
 *   Trade   = sold trade when present, else 0.85 × Average, clamped to Low
 * Dollars round to the nearest $1,000 like the rest of Facts.
 */
export function blendJdPowerPublicBands(input: BlendJdPowerBandsInput): {
  retailLow: number;
  marketValue: number;
  retailHigh: number;
  tradeIn: number;
  tradeCapped: boolean;
  blendedSold: boolean;
} {
  const jdAvg = input.jdAverage;
  const sold = input.soldMedian && input.soldMedian > 0 ? input.soldMedian : 0;
  const blendedSold = sold > 0;
  const marketValue = roundJdPublicUsd(blendedSold ? (jdAvg + sold) / 2 : jdAvg);

  const compsLow =
    input.compsRetailLow && input.compsRetailLow > 0
      ? input.compsRetailLow
      : 0;
  let retailLow = roundJdPublicUsd(
    compsLow > 0 ? (input.jdLow + compsLow) / 2 : input.jdLow,
  );

  const compsHigh =
    input.compsRetailHigh && input.compsRetailHigh > 0
      ? input.compsRetailHigh
      : 0;
  let retailHigh: number;
  if (input.jdHigh != null && input.jdHigh > 0 && compsHigh > 0) {
    retailHigh = roundJdPublicUsd((input.jdHigh + compsHigh) / 2);
  } else if (input.jdHigh != null && input.jdHigh > 0) {
    retailHigh = roundJdPublicUsd(input.jdHigh);
  } else if (compsHigh > 0) {
    retailHigh = roundJdPublicUsd(compsHigh);
  } else {
    retailHigh = marketValue;
  }

  if (retailLow > marketValue && marketValue > 0) retailLow = marketValue;
  if (retailHigh < marketValue) retailHigh = marketValue;

  const rawTrade =
    input.compsTradeIn && input.compsTradeIn > 0
      ? input.compsTradeIn
      : roundJdPublicUsd(marketValue * 0.85);
  const trade = clampTradeToRetailLow(rawTrade, retailLow);
  return {
    retailLow,
    marketValue,
    retailHigh,
    tradeIn: trade.tradeIn,
    tradeCapped: trade.capped,
    blendedSold,
  };
}

export function applyJdPowerDeskMarket(input: {
  catalog: MarketEstimate;
  jd: JdPowerPublicEstimate;
  comps?: {
    priceKind: "sold" | "asking";
    confidence: "high" | "medium" | "low";
    medianAsk: number;
    retailLow: number;
    retailHigh: number;
    tradeIn: number;
    soldSampleSize: number;
    tradeCappedAtRetailLow?: boolean;
  } | null;
  prefersSoldRange: boolean;
}): MarketEstimate {
  const { catalog, jd, comps, prefersSoldRange } = input;
  const soldOk =
    Boolean(comps) &&
    comps!.priceKind === "sold" &&
    comps!.medianAsk >= MIN_BOOK_USD;
  const bands = blendJdPowerPublicBands({
    jdLow: jd.lowRetail,
    jdAverage: jd.averageRetail,
    jdHigh: jd.highRetail,
    soldMedian: soldOk ? comps!.medianAsk : undefined,
    compsRetailLow: soldOk ? comps!.retailLow : undefined,
    compsRetailHigh: soldOk ? comps!.retailHigh : undefined,
    compsTradeIn: soldOk ? comps!.tradeIn : undefined,
  });

  const thin = !prefersSoldRange;
  let retailHigh = bands.retailHigh;
  let hideRetailHigh = thin;
  if (thin) {
    // #275–#280: Low / thin never paints a fat High. Prefer Catalog
    // honesty over a wide blended ask — pin High to Average.
    const pinned = clampRetailHighToMarketValue(retailHigh, bands.marketValue);
    retailHigh = pinned.retailHigh;
    hideRetailHigh = true;
  }

  return {
    tradeIn: bands.tradeIn,
    retailLow: bands.retailLow,
    retailHigh,
    msrpLo: catalog.msrpLo,
    msrpHi: catalog.msrpHi,
    segment: catalog.segment,
    ageYears: catalog.ageYears,
    tradeCappedAtRetailLow:
      bands.tradeCapped || comps?.tradeCappedAtRetailLow || undefined,
    source: soldOk ? "jd_power_blend" : "jd_power_public",
    sourceLabel: jdPowerSourceLabel(soldOk ? "jd_power_blend" : "jd_power_public"),
    confidence: prefersSoldRange && comps ? comps.confidence : "low",
    marketValue: bands.marketValue,
    hideRetailHigh,
    soldSampleSize: comps?.soldSampleSize ?? 0,
  };
}

/**
 * Live public fetch. Palazzo-first. Never invents dollars on GAP.
 */
export async function fetchJdPowerPublicEstimate(
  input: {
    year: string | number;
    make: string;
    model: string;
    floorplan?: string;
  },
  signal?: AbortSignal,
): Promise<JdPowerFetchResult> {
  if (!isJdPowerBlendEligible(input.make, input.model)) {
    return {
      ok: false,
      reason: "J.D. Power public blend is Palazzo-first",
      data: null,
    };
  }
  const yearNum =
    typeof input.year === "number"
      ? input.year
      : parseInt(String(input.year), 10);
  const floorplan = input.floorplan?.trim();
  if (!Number.isFinite(yearNum) || !floorplan) {
    return {
      ok: false,
      reason: "year and floorplan are required for a public J.D. Power lookup",
      data: null,
    };
  }

  const tried = new Set<string>();
  const queue: string[] = [];
  const known = knownPalazzoJdPowerValuesUrl(yearNum, floorplan);
  if (known) queue.push(known);

  const takeParsed = (
    html: string,
    sourceUrl: string,
  ): JdPowerPublicEstimate | null => {
    const parsed = parseJdPowerPublicHtml(html);
    if (!parsed) return null;
    return {
      source: "jd_power_public",
      year: yearNum,
      make: input.make.trim(),
      model: input.model.trim(),
      floorplan,
      lowRetail: parsed.lowRetail,
      averageRetail: parsed.averageRetail,
      highRetail: parsed.highRetail,
      sourceUrl,
      sourceLabel: JD_POWER_PUBLIC_LABEL,
    };
  };

  for (const url of queue) {
    if (tried.has(url) || signal?.aborted) continue;
    tried.add(url);
    const page = await fetchPublicHtml(url, 8_000, signal);
    if (!page.ok) continue;
    const parsed = takeParsed(page.html, url);
    if (parsed) return { ok: true, data: parsed };
  }

  for (const listing of listingUrlsFor(yearNum)) {
    if (signal?.aborted) break;
    const page = await fetchPublicHtml(listing, 8_000, signal);
    if (!page.ok) continue;
    const found = discoverJdPowerValuesUrl(page.html, yearNum, floorplan);
    if (!found || tried.has(found)) continue;
    tried.add(found);
    const values = await fetchPublicHtml(found, 8_000, signal);
    if (!values.ok) continue;
    const parsed = takeParsed(values.html, found);
    if (parsed) return { ok: true, data: parsed };
  }

  return {
    ok: false,
    reason:
      "public J.D. Power values not found or scrape blocked — using comps/catalog",
    data: null,
  };
}
