/**
 * On-demand free public J.D. Power RV values — every coach, same two-leg path.
 *
 * Fetched when Facts opens Market value. No cron, no nightly batch, no
 * stored dollar snapshots. Dollars come only from a live public HTML
 * parse. If the fetch or parse fails, return GAP — never invent book
 * values, never a paid J.D. Power Price Guide / NADA API.
 *
 * Public source: jdpower.com/rvs values pages
 * (e.g. 2021 Thor Palazzo 33.5, 2022 American Dream 45A, 2022 Allegro Bus 37AP).
 */

import { clampRetailHighToMarketValue, clampTradeToRetailLow } from "./marketClamp.ts";
import type { MarketEstimate, MarketValueSource } from "./marketEstimate.ts";

/** Locked Catalog chip — never bare "J.D. Power" / "NADA" as a desk title. */
export const JD_POWER_PUBLIC_LABEL = "Public J.D. Power estimate";
/** Locked blend sub/sourceLabel when public JD × live nationwide asks both exist. */
export const JD_POWER_BLEND_LABEL =
  "Avg of public J.D. Power estimate + asking comps";

/** Verified public values page — shortcut only, not an exclusivity gate. */
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

/** Listing-path tokens that are too generic to fetch on their own. */
const GENERIC_LISTING_SLUGS = new Set([
  "american",
  "coach",
  "motor",
  "new",
  "super",
  "the",
  "rv",
  "series",
]);

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

/** JD public path segment: "Thor Motor Coach" → thor-motor-coach. */
export function jdPowerPathSlug(raw: string): string {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Public listing-page slugs for a catalog make + model.
 * JD brand segments are inconsistent (thor-motor-coach, american-dream,
 * allegro) — we try derived slugs, never a fabricated values-page id.
 */
export function jdPowerListingSlugs(make?: string, model?: string): string[] {
  const slugs: string[] = [];
  const push = (slug: string) => {
    if (!slug || GENERIC_LISTING_SLUGS.has(slug) || slugs.includes(slug)) return;
    slugs.push(slug);
  };

  const modelSlug = jdPowerPathSlug(model || "");
  const makeSlug = jdPowerPathSlug(make || "");
  push(modelSlug);

  const modelTokens = String(model || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (modelTokens.length > 1) {
    push(jdPowerPathSlug(modelTokens[0]!));
  }

  if (/^thor(\s+motor(\s+coach)?)?$/i.test(String(make || "").trim())) {
    push("thor-motor-coach");
  }
  push(makeSlug);
  return slugs;
}

/**
 * Floorplan prefixes used on JD values paths.
 * 33.5 → m-33-5; 45A → m-45a; 37AP → m-37ap; 45OPP → m-45opp + m-45op.
 */
export function jdPowerFloorplanSlugs(floorplan: string): string[] {
  const raw = String(floorplan || "")
    .trim()
    .replace(/^m[-\s.]?/i, "");
  if (!raw) return [];
  const slugs = new Set<string>();
  const dotted = raw.match(/^(\d{2})\.(\d)$/);
  if (dotted) slugs.add(`m-${dotted[1]}-${dotted[2]}`);

  const compact = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact) {
    slugs.add(`m-${compact}`);
    const split = compact.match(/^(\d{2,3})([a-z]{1,6})$/);
    if (split) {
      slugs.add(`m-${split[1]}-${split[2]}`);
      if (split[2].length >= 3) {
        slugs.add(`m-${split[1]}${split[2].slice(0, 2)}`);
      }
    }
  }
  return [...slugs];
}

/** 33.5 → m-33-5 (JD Power used-values slug). Other plans use {@link jdPowerFloorplanSlugs}. */
export function jdPowerFloorplanSlug(floorplan: string): string | null {
  return jdPowerFloorplanSlugs(floorplan)[0] ?? null;
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

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Discover a public values URL from a year listing page.
 * Matches any brand/model segment — not Thor Motor Coach only.
 * Never invents the numeric id; GAP when the floorplan is absent.
 */
export function discoverJdPowerValuesUrl(
  listingHtml: string,
  year: number,
  floorplan: string,
): string | null {
  const prefixes = jdPowerFloorplanSlugs(floorplan);
  if (!prefixes.length) return null;
  const prefixRe = prefixes.map(escapeRe).join("|");
  const re = new RegExp(
    `/rvs/${year}/[a-z0-9-]+/(${prefixRe})[-a-z0-9]*/(\\d+)(?:/values)?`,
    "gi",
  );
  let best: { path: string; prefixLen: number } | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(listingHtml))) {
    const prefix = (m[1] || "").toLowerCase();
    const path = m[0].replace(/\/values$/i, "") + "/values";
    if (!best || prefix.length > best.prefixLen) {
      best = { path, prefixLen: prefix.length };
    }
  }
  if (!best) return null;
  return `${JD_POWER_PUBLIC_ORIGIN}${best.path.startsWith("/") ? best.path : `/${best.path}`}`;
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

/** Verified Palazzo shortcut only when the unit is that coach — not a make gate. */
export function knownJdPowerValuesUrl(
  year: string | number,
  make: string,
  model: string,
  floorplan?: string,
): string | null {
  if (
    /^thor$/i.test(make.trim()) &&
    /^palazzo$/i.test(model.trim())
  ) {
    return knownPalazzoJdPowerValuesUrl(year, floorplan);
  }
  return null;
}

export function candidateJdPowerListingUrls(
  year: number,
  make: string,
  model: string,
): string[] {
  const urls: string[] = [];
  for (const slug of jdPowerListingSlugs(make, model)) {
    urls.push(`${JD_POWER_PUBLIC_ORIGIN}/rvs/${year}/${slug}`);
    urls.push(`${JD_POWER_PUBLIC_ORIGIN}/rvs/${year}/used/${slug}`);
  }
  return urls;
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
 * Live public fetch for any year/make/model/floorplan. Never invents
 * dollars on GAP. Does not restrict to Thor Palazzo.
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
  const make = input.make.trim();
  const model = input.model.trim();
  if (!make || !model) {
    return {
      ok: false,
      reason: "make and model are required for a public J.D. Power lookup",
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
  const known = knownJdPowerValuesUrl(yearNum, make, model, floorplan);
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
      make,
      model,
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

  for (const listing of candidateJdPowerListingUrls(yearNum, make, model)) {
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
