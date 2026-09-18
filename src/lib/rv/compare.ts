import type { RVResult } from "./catalog";
import {
  compareSelectionKey,
  getFloorplansForYear,
  getSpec,
  relatedModelsWithFloorplansInYear,
} from "./catalog";
import { hydrateShareCoachResult } from "./shareCoachHydrate";
import { buildBrochureSpecs } from "./brochureSpecs";
import { findOemFloorplanSpec } from "./floorplanSpecs";
import { unverifiedLayoutLabel } from "./promptRules";
import { estimateMarket, formatMoney, ratingFor } from "./catalog";
import { bestCalPrice } from "./activeCoach";
import type { LiveDossier } from "./liveDossier";
import { liveMarketLadder, mergeLiveIntoDisplay } from "./liveDossier";
import {
  CATALOG_ESTIMATE_LABEL,
  resolvePrimaryMarket,
  type PublicListingComps,
} from "./publicListingComps";
import { hideRetailHighForDesk } from "./marketClamp";
import type { MarketConfidence, MarketEstimate } from "./marketEstimate";
import {
  formatHardHorsepower,
  formatHardTorque,
  resolveHardPowertrain,
} from "./livePowertrainGuard";
import {
  formatFactsHorsepower,
  formatFactsTorque,
  omitInventPolicyProse,
} from "./catalogHonesty";

/** Direction for “better” highlighting */
export type BetterDir = "higher" | "lower" | "neutral";

export type CompareCell = {
  value: string;
  raw: number | null;
  /** relative to peers: better | worse | equal | na */
  tone: "better" | "worse" | "equal" | "na";
};

export type CompareRow = {
  id: string;
  label: string;
  direction: BetterDir;
  cells: CompareCell[];
};

export type CompareColumn = {
  key: string;
  year: string;
  make: string;
  model: string;
  floorplan: string;
  type: string;
  shortTitle: string;
  result: RVResult;
  /** Live Grok filled this column */
  live?: boolean;
  rating: number;
  /** Desk Market value — resolvePrimaryMarket, never invented. */
  marketValue: number;
  retailLow: number;
  retailHigh: number;
  tradeIn: number;
  sourceLabel: string;
  hideRetailHigh: boolean;
  confidence: MarketConfidence | null;
};

/** Lot Desk Market rows — Low/Avg/High + honesty label. */
export const COMPARE_MARKET_ROW_IDS = [
  "marketValue",
  "retailLo",
  "retailHi",
  "trade",
  "valueSource",
] as const;

/** Lean key Facts — not the whole brochure. */
export const COMPARE_KEY_FACT_ROW_IDS = [
  "rating",
  "type",
  "length",
  "gvwr",
  "uvw",
  "sleeps",
] as const;

export type CompareRowSection = "market" | "facts" | "more";

export function compareRowSection(id: string): CompareRowSection {
  if ((COMPARE_MARKET_ROW_IDS as readonly string[]).includes(id)) return "market";
  if ((COMPARE_KEY_FACT_ROW_IDS as readonly string[]).includes(id)) return "facts";
  return "more";
}

/** Bare book titles are not desk labels — Catalog estimate wins (#275–#285). */
const BARE_BOOK_TITLE =
  /^(j\.?\s*d\.?\s*power|jd\s*power|nada)(\s+(value|estimate|book))?$/i;

export function compareHonestSourceLabel(label?: string | null): string {
  const t = String(label || "").trim();
  if (!t || BARE_BOOK_TITLE.test(t)) return CATALOG_ESTIMATE_LABEL;
  return t;
}

export function compareDeskHideRetailHigh(market: MarketEstimate): boolean {
  const soldConfidence = market.confidence ?? "low";
  const showSoldRange =
    market.source === "public_listings" && soldConfidence !== "low";
  return hideRetailHighForDesk({
    soldConfidence,
    showSoldRange,
    hideRetailHigh: market.hideRetailHigh,
  });
}

/** Same desk number as Facts — marketValue, else Low (never invent High on Low). */
export function compareDeskMarketValue(market: MarketEstimate): number {
  if (market.marketValue && market.marketValue > 0) return market.marketValue;
  return bestCalPrice({
    retailLow: market.retailLow,
    retailHigh: compareDeskHideRetailHigh(market) ? 0 : market.retailHigh,
    msrpLo: market.msrpLo,
    msrpHi: market.msrpHi,
  });
}

export type CompareReport = {
  columns: CompareColumn[];
  rows: CompareRow[];
  generatedAt: string;
  /** Index of highest / lowest RVFAX rating in this set */
  highestRatingIndex: number;
  lowestRatingIndex: number;
  liveCount: number;
};

function keyOf(r: RVResult) {
  return compareSelectionKey(r);
}

export { compareSelectionKey };

function shortTitle(r: RVResult) {
  return `${r.year} ${r.make.split(" ")[0]} ${r.model}${r.floorplan ? ` ${r.floorplan}` : ""}`;
}

function parseNum(s: string | number | null | undefined): number | null {
  if (s == null || s === "" || s === "—") return null;
  if (typeof s === "number") return Number.isFinite(s) ? s : null;
  const cleaned = String(s).replace(/[$,]/g, "").replace(/[^\d.-]/g, " ");

  const m = cleaned.match(/-?\d+(?:\.\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0]!);
  return Number.isFinite(n) ? n : null;
}

function parseRangeMid(s: string): number | null {
  const nums = String(s)
    .replace(/,/g, "")
    .match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return null;
  const vals = nums.map(Number).filter((n) => Number.isFinite(n));
  if (!vals.length) return null;
  if (vals.length === 1) return vals[0]!;
  return (Math.min(...vals) + Math.max(...vals)) / 2;
}

function tones(
  values: (number | null)[],
  direction: BetterDir,
): CompareCell["tone"][] {
  if (direction === "neutral") {
    return values.map((v) => (v == null ? "na" : "equal"));
  }
  const present = values
    .map((v, i) => (v != null ? { v, i } : null))
    .filter(Boolean) as { v: number; i: number }[];
  if (present.length < 2) {
    return values.map((v) => (v == null ? "na" : "equal"));
  }
  const best =
    direction === "higher"
      ? Math.max(...present.map((p) => p.v))
      : Math.min(...present.map((p) => p.v));
  const worst =
    direction === "higher"
      ? Math.min(...present.map((p) => p.v))
      : Math.max(...present.map((p) => p.v));

  if (Math.abs(best - worst) < Math.max(0.05, Math.abs(best) * 0.005)) {
    return values.map((v) => (v == null ? "na" : "equal"));
  }

  return values.map((v) => {
    if (v == null) return "na";
    if (v === best) return "better";
    if (v === worst) return "worse";
    return "equal";
  });
}

function row(
  id: string,
  label: string,
  direction: BetterDir,
  pairs: { display: string; raw: number | null }[],
): CompareRow {
  const raws = pairs.map((p) => p.raw);
  const t = tones(raws, direction);
  return {
    id,
    label,
    direction,
    cells: pairs.map((p, i) => ({
      value: p.display,
      raw: p.raw,
      tone: t[i]!,
    })),
  };
}

/** Brand / model prestige — used only as a badge tie-break, never to mutate scores. */
function prestigeScore(make: string, model: string): number {
  const s = `${make} ${model}`.toLowerCase();
  if (
    /prevost|newell|marathon|liberty coach|foretravel|american dream|allegro bus|anthem|cornerstone|london aire|mountain aire|dutch star|ventana limited|encante/.test(
      s,
    )
  ) {
    if (/allegro bus|american dream|anthem|cornerstone|prevost|newell/.test(s))
      return 96;
    if (/dutch star|london aire|mountain aire|ventana limited/.test(s))
      return 93;
    return 90;
  }
  if (
    /tiffin|newmar|entegra|american coach|fleetwood discovery lxe|monaco|holiday rambler|renegade|brinkley|jayco|winnebago/.test(
      s,
    )
  ) {
    if (/tiffin|newmar|entegra|american coach/.test(s)) return 86;
    return 78;
  }
  if (/class a|diesel|pusher|powerglide|spartan/.test(s)) return 72;
  return 65;
}

/**
 * High-line diesel pushers often list L9 450 standard with X15 605 optional.
 * Show base + option when the brochure/live line doesn't already spell it out.
 */
function hpDisplayAndRank(
  engine: string,
  hpStr: string,
  make: string,
  model: string,
  year: string,
): { display: string; raw: number | null; engineDisplay: string } {
  const baseHp = parseNum(hpStr);
  const blob = `${engine} ${hpStr}`.toLowerCase();
  const y = parseInt(year, 10) || 0;
  const mm = `${make} ${model}`.toLowerCase();

  const alreadyDual =
    /\bopt(?:ion(?:al)?)?\b|\bstd\b|\bstandard\b|\/\s*605|605\s*\/|450\s*[–—-]\s*605|450\s*or\s*605/.test(
      blob,
    );

  const highLineDiesel =
    y >= 2018 &&
    y <= 2027 &&
    (/allegro bus|american dream|american eagle|dutch star|anthem|cornerstone|ventana|london aire|mountain aire|discovery lxe|embassy|aspire|phoebe|phoebe|allegro red|phaeton/.test(
      mm,
    ) ||
      /cummins\s*(l9|isl|isx|x12|x15)/i.test(engine));

  const mentions605 = /\b605\b/.test(blob) || /x15/i.test(blob);
  const mentions450 =
    /\b450\b/.test(blob) || /l9|isl\b/i.test(blob) || baseHp === 450;

  const cleanHp = omitInventPolicyProse(hpStr);
  let display = cleanHp || "—";
  let engineDisplay = engine && engine !== "—" ? engine : "—";
  let raw = baseHp;

  if (highLineDiesel && !alreadyDual) {
    if (mentions450 && !mentions605 && baseHp != null && baseHp <= 500) {
      display = `${baseHp} HP std · 605 HP opt`;
      if (!/x15|605/i.test(engineDisplay)) {
        engineDisplay = /l9|isl/i.test(engineDisplay)
          ? `${engineDisplay.replace(/\s*$/, "")} (X15 605 opt)`
          : `${engineDisplay} · X15 605 opt`;
      }
      // Rank on standard HP so optional 605 doesn't falsely equalize the set
      raw = baseHp;
    } else if (mentions605 && baseHp != null && baseHp >= 550) {
      // Configured / standard as 605 — note 450 base exists on many peers
      if (!/std|opt|450/.test(blob)) {
        display = `${baseHp} HP (often 450 std · 605 opt on series)`;
      }
      raw = baseHp;
    } else if (baseHp != null && baseHp >= 400 && baseHp <= 500 && highLineDiesel) {
      display = `${baseHp} HP std · 605 HP opt`;
      raw = baseHp;
    }
  }

  // Normalize bare numbers
  if (display !== "—" && !/hp/i.test(display) && baseHp != null) {
    display = `${display} HP`;
  }

  return { display, raw, engineDisplay };
}

/** Highest / lowest badge only — never changes the displayed RvFOX score. */
function ratingBadgeIndexes(
  ratings: number[],
  prestige: number[],
): { highest: number; lowest: number } {
  let highest = 0;
  let lowest = 0;
  ratings.forEach((v, i) => {
    const hi = ratings[highest]!;
    const lo = ratings[lowest]!;
    if (v > hi || (v === hi && (prestige[i] ?? 0) > (prestige[highest] ?? 0))) {
      highest = i;
    }
    if (v < lo || (v === lo && (prestige[i] ?? 0) < (prestige[lowest] ?? 0))) {
      lowest = i;
    }
  });
  return { highest, lowest };
}

export type LiveMap = Record<string, LiveDossier | null | undefined>;
export type CompsMap = Record<string, PublicListingComps | null | undefined>;

/** Build structured side-by-side compare matrix (2–3 coaches). Live Grok overlays when present. */
export function buildCompareReport(
  items: RVResult[],
  liveMap?: LiveMap,
  compsMap?: CompsMap,
): CompareReport {
  const cols = capCompareItems(items).map((raw) => {
    const r = hydrateShareCoachResult(raw, getSpec);
    const key = keyOf(r);
    const live = liveMap?.[key] ?? null;
    const baseBrochure = buildBrochureSpecs(
      r.data,
      r.year,
      r.make,
      r.model,
      r.floorplan,
    );
    const guard = resolveHardPowertrain({
      year: r.year,
      make: r.make,
      model: r.model,
      floorplan: r.floorplan,
      catalog: {
        engine: baseBrochure.engine,
        horsepower: baseBrochure.horsepower,
        torque: baseBrochure.torque,
        chassis: baseBrochure.chassis,
        transmission: baseBrochure.transmission,
        fuelType: r.data.fuelType,
        type: r.data.type,
      },
      live: live?.live ? live : null,
    });
    const brochure = mergeLiveIntoDisplay(
      {
        engine: baseBrochure.engine,
        horsepower: baseBrochure.horsepower,
        torque: baseBrochure.torque,
        transmission: baseBrochure.transmission,
        chassis: baseBrochure.chassis,
        hitchOrPin: baseBrochure.hitchOrPin,
        fuelCapacity: baseBrochure.fuelCapacity,
        lengthFt: baseBrochure.lengthFt,
        exteriorWidth: baseBrochure.exteriorWidth,
        exteriorHeight: baseBrochure.exteriorHeight,
        interiorHeight: baseBrochure.interiorHeight,
        gvwr: baseBrochure.gvwr,
        uvw: baseBrochure.uvw,
        ccc: baseBrochure.ccc,
        slideouts: baseBrochure.slideouts,
        sleeps: baseBrochure.sleeps,
        freshWater: baseBrochure.freshWater,
        grayWater: baseBrochure.grayWater,
        blackWater: baseBrochure.blackWater,
        generator: baseBrochure.generator,
        mpgHighway: baseBrochure.mpgHighway,
        warranty: baseBrochure.warranty,
      },
      live?.live ? live : null,
      {
        lockPowertrainFromCatalog: true,
        hardOverride: {
          engine: guard.hard.engine || baseBrochure.engine,
          horsepower: formatFactsHorsepower({
            engine: guard.hard.engine || baseBrochure.engine,
            horsepower:
              formatHardHorsepower(guard.hard.horsepower) ||
              omitInventPolicyProse(baseBrochure.horsepower),
          }),
          torque: formatFactsTorque({
            engine: guard.hard.engine || baseBrochure.engine,
            torqueLbFt:
              formatHardTorque(guard.hard.torqueLbFt) ||
              omitInventPolicyProse(baseBrochure.torque),
          }),
          chassis: guard.hard.chassis || baseBrochure.chassis,
          transmission: guard.hard.transmission || baseBrochure.transmission,
        },
      },
    );
    const oem = findOemFloorplanSpec(r.year, r.make, r.model, r.floorplan);
    const catalogMarket = estimateMarket(r.data, r.year, r.floorplan, {
      make: r.make,
      model: r.model,
    });
    const ladder = liveMarketLadder(live?.live ? live : null);
    const market = resolvePrimaryMarket({
      catalog: catalogMarket,
      liveLadder: ladder,
      comps: compsMap?.[key] ?? null,
    });
    const hideRetailHigh = compareDeskHideRetailHigh(market);
    const deskValue = compareDeskMarketValue(market);
    const valueSource = compareHonestSourceLabel(
      market.sourceLabel || CATALOG_ESTIMATE_LABEL,
    );

    const rawRating = ratingFor(r.make, r.model, r.year);

    const typeLabel = live?.rvType || r.data.type;
    const fuelLabel = live?.fuelType || r.data.fuelType;

    const hpMeta = hpDisplayAndRank(
      brochure.engine,
      brochure.horsepower,
      r.make,
      r.model,
      r.year,
    );

    return {
      r,
      brochure: {
        ...brochure,
        engine: hpMeta.engineDisplay,
        horsepower: hpMeta.display,
      },
      hpRaw: hpMeta.raw,
      market,
      deskValue,
      hideRetailHigh,
      rawRating,
      typeLabel,
      fuelLabel,
      live: Boolean(live?.live),
      key,
      valueSource,
      prestige: prestigeScore(r.make, r.model),
      layoutNote: oem?.layoutNote || "",
      oemSleeps: oem?.sleeps ?? null,
      oemSlides: oem?.slideouts ?? null,
    };
  });

  const colsWithRating = cols.map((c) => ({
    ...c,
    rating: Math.round(c.rawRating * 10) / 10,
  }));

  const ratings = colsWithRating.map((c) => c.rating);
  const badges = ratingBadgeIndexes(
    ratings,
    colsWithRating.map((c) => c.prestige),
  );
  const highestRatingIndex = badges.highest;
  const lowestRatingIndex = badges.lowest;

  const columns: CompareColumn[] = colsWithRating.map(
    ({
      r,
      rating,
      live,
      typeLabel,
      key,
      deskValue,
      hideRetailHigh,
      market,
      valueSource,
    }) => ({
      key,
      year: r.year,
      make: r.make,
      model: r.model,
      floorplan: r.floorplan,
      type: typeLabel,
      shortTitle: shortTitle(r),
      result: r,
      live,
      rating,
      marketValue: deskValue,
      retailLow: market.retailLow,
      retailHigh: hideRetailHigh ? 0 : market.retailHigh,
      tradeIn: market.tradeIn,
      sourceLabel: valueSource,
      hideRetailHigh,
      confidence: market.confidence ?? null,
    }),
  );

  const rows: CompareRow[] = [
    row(
      "marketValue",
      "Market value",
      "higher",
      colsWithRating.map((c) => ({
        display: formatMoney(c.deskValue),
        raw: c.deskValue > 0 ? c.deskValue : null,
      })),
    ),
    row(
      "retailLo",
      "Retail Low",
      "lower",
      colsWithRating.map((c) => ({
        display: formatMoney(c.market.retailLow),
        raw: c.market.retailLow > 0 ? c.market.retailLow : null,
      })),
    ),
    row(
      "retailHi",
      "Retail High",
      "lower",
      colsWithRating.map((c) => ({
        display: c.hideRetailHigh ? "—" : formatMoney(c.market.retailHigh),
        raw: c.hideRetailHigh || c.market.retailHigh <= 0 ? null : c.market.retailHigh,
      })),
    ),
    row(
      "trade",
      "Trade-in",
      "higher",
      colsWithRating.map((c) => ({
        display: formatMoney(c.market.tradeIn),
        raw: c.market.tradeIn > 0 ? c.market.tradeIn : null,
      })),
    ),
    row(
      "valueSource",
      "Value source",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.valueSource,
        raw: null,
      })),
    ),
    row(
      "rating",
      "RVFAX Rating",
      "higher",
      colsWithRating.map((c) => ({
        display: `${c.rating.toFixed(1)} / 5.0`,
        raw: c.rating,
      })),
    ),
    row(
      "type",
      "Class / Type",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.typeLabel,
        raw: null,
      })),
    ),
    row(
      "length",
      "Length",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.lengthFt,
        raw:
          parseRangeMid(c.brochure.lengthFt) ??
          parseNum(c.brochure.lengthFt),
      })),
    ),
    row(
      "gvwr",
      "GVWR",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.gvwr,
        raw: parseRangeMid(c.brochure.gvwr),
      })),
    ),
    row(
      "uvw",
      "UVW",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.uvw,
        raw: parseRangeMid(c.brochure.uvw),
      })),
    ),
    row(
      "sleeps",
      "Sleeps",
      "higher",
      colsWithRating.map((c) => ({
        display: c.oemSleeps != null ? String(c.oemSleeps) : c.brochure.sleeps,
        raw: c.oemSleeps ?? parseNum(c.brochure.sleeps),
      })),
    ),
    row(
      "fuel",
      "Fuel",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.fuelLabel,
        raw: null,
      })),
    ),
    row(
      "engine",
      "Engine",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.engine,
        raw: c.hpRaw,
      })),
    ),
    row(
      "hp",
      "Horsepower",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.horsepower,
        // Rank on standard HP (opt noted in display) so optional 605 doesn't fake a tie
        raw: c.hpRaw,
      })),
    ),
    row(
      "chassis",
      "Chassis",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.chassis,
        raw: null,
      })),
    ),
    row(
      "ccc",
      "Cargo Carrying (CCC)",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.ccc,
        raw: parseNum(c.brochure.ccc),
      })),
    ),
    row(
      "slides",
      "Slideouts",
      "higher",
      colsWithRating.map((c) => ({
        display:
          c.oemSlides != null ? String(c.oemSlides) : c.brochure.slideouts,
        raw: c.oemSlides ?? parseNum(c.brochure.slideouts),
      })),
    ),
    row(
      "layout",
      "Layout",
      "neutral",
      colsWithRating.map((c) => ({
        display: unverifiedLayoutLabel(c.layoutNote),
        raw: null,
      })),
    ),
    row(
      "fresh",
      "Fresh Water",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.freshWater,
        raw: parseNum(c.brochure.freshWater),
      })),
    ),
    row(
      "mpg",
      "Highway MPG (est.)",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.mpgHighway,
        raw: parseNum(c.brochure.mpgHighway),
      })),
    ),
    row(
      "tow",
      "Tow / Hitch",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.hitchOrPin,
        raw: parseNum(c.brochure.hitchOrPin),
      })),
    ),
    row(
      "gen",
      "Generator",
      "neutral",
      colsWithRating.map((c) => ({
        display: c.brochure.generator,
        raw: parseNum(c.brochure.generator),
      })),
    ),
    row(
      "warranty",
      "Warranty",
      "higher",
      colsWithRating.map((c) => ({
        display: c.brochure.warranty,
        raw: c.r.data.warrantyYears || parseNum(c.brochure.warranty),
      })),
    ),
    row(
      "msrp",
      "When-new MSRP ref.",
      "neutral",
      colsWithRating.map((c) => ({
        display: `${formatMoney(c.r.data.msrpRange[0])}–${formatMoney(c.r.data.msrpRange[1])}`,
        raw: (c.r.data.msrpRange[0] + c.r.data.msrpRange[1]) / 2,
      })),
    ),
  ];

  return {
    columns,
    rows,
    generatedAt: new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
    highestRatingIndex,
    lowestRatingIndex,
    liveCount: colsWithRating.filter((c) => c.live).length,
  };
}

const COMPARE_MAX = 3;

/** Cap Lot Desk compare at 3 columns — never invent a fourth. */
export function capCompareItems(items: RVResult[]): RVResult[] {
  const seen = new Set<string>();
  const out: RVResult[] = [];
  for (const r of items) {
    const k = keyOf(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
    if (out.length >= COMPARE_MAX) break;
  }
  return out;
}

function catalogPeer(
  year: string,
  make: string,
  model: string,
  floorplan: string,
): RVResult | null {
  const data = getSpec(make, model);
  if (!data) return null;
  return {
    year,
    make,
    model,
    floorplan,
    rvType: data.type,
    data,
  };
}

/**
 * Peers for one-tap Facts compare: saved / search extras first, then same-year
 * catalog floorplans and related models. Never invent a custom coach.
 */
export function suggestComparePeers(
  anchor: RVResult,
  extras: RVResult[] = [],
  limit = 8,
): RVResult[] {
  const seen = new Set([keyOf(anchor)]);
  const out: RVResult[] = [];
  const push = (r: RVResult | null | undefined) => {
    if (!r || out.length >= limit) return;
    const k = keyOf(r);
    if (seen.has(k)) return;
    seen.add(k);
    out.push(r);
  };

  for (const r of extras) push(r);

  const year = anchor.year;
  const make = anchor.make;
  const model = anchor.model;
  for (const fp of getFloorplansForYear(year, make, model)) {
    if (fp && fp !== (anchor.floorplan || "")) {
      push(catalogPeer(year, make, model, fp));
    }
  }
  for (const name of relatedModelsWithFloorplansInYear(make, model, year)) {
    const fps = getFloorplansForYear(year, make, name);
    if (fps[0]) push(catalogPeer(year, make, name, fps[0]));
  }
  return out;
}
