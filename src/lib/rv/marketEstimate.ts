/**
 * Offline used-market estimate — catalog path, no paid APIs.
 *
 * One retain curve for every RV was wrong: Class B vans hold, gas Class A/C
 * drop hard in the first years, toy haulers lag fifth wheels. This module
 * is a segment-aware *catalog estimate* — not NADA, not J.D. Power, not
 * MarketCheck.
 *
 * Shape:
 *   private-party fair mid = MSRP_mid × retain(age, segment) × brandTier
 *   trade-in   ≈ private × 0.85   (dealer trade ~15% under private)
 *   retail low ≈ private × 0.95
 *   retail high≈ private × 1.15–1.25 (dealer ask band by segment)
 * Trade is then clamped so it never sits above retail low.
 */

import { clampTradeToRetailLow } from "./marketClamp.ts";
import {
  getModelTier,
  MANUFACTURER_BASE_SCORES,
} from "./ratingSystem.ts";
import type { RVSpec } from "./rvTypes.ts";

export type MarketValueSource = "catalog" | "public_listings" | "live_dossier";

export type MarketEstimate = {
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  msrpLo: number;
  msrpHi: number;
  segment: string;
  ageYears: number;
  /** True when trade-in was lowered so it cannot sit above retail low. */
  tradeCappedAtRetailLow?: boolean;
  /** Which ladder produced these numbers. Default catalog. */
  source?: MarketValueSource;
  /** Honest UI label — never NADA / J.D. Power / MarketCheck. */
  sourceLabel?: string;
};

/**
 * Segments we actually curve. Detection uses catalog type + fuel strings
 * already on the spec (same signals as the class tabs).
 */
export type MarketSegmentId =
  | "class-b"
  | "diesel-a"
  | "gas-a"
  | "class-c"
  | "super-c"
  | "fifth-wheel"
  | "travel-trailer"
  | "toy-hauler"
  | "motorhome";

/**
 * Retain curves — documented, not NADA.
 *
 * start  = typical year-0 used retain vs when-new MSRP mid (first-year hit).
 * rate   = linear decay after the early window (except gas-a / class-c).
 * floor  = long-term residual floor vs MSRP mid.
 * earlyYears / earlyRate = steeper drop for gas MH (first 3 years).
 * retailHighMult = dealer ask vs private mid.
 *
 * Class B: vans (Sprinter/Transit) hold; floor ~0.50.
 * Diesel A: moderate diesel-pusher curve; floor ~0.42.
 * Gas A / Class C: steeper early drop (gas MH glut); floor ~0.36.
 * Super C: between diesel A and gas C.
 * Fifth wheel / TT: mid towable curves; toy hauler a bit weaker.
 */
export type SegmentCurve = {
  id: MarketSegmentId;
  label: string;
  start: number;
  rate: number;
  floor: number;
  earlyYears?: number;
  earlyRate?: number;
  retailHighMult: number;
};

export const SEGMENT_CURVES: Record<MarketSegmentId, SegmentCurve> = {
  "class-b": {
    id: "class-b",
    label: "Class B",
    start: 0.9,
    rate: 0.032,
    floor: 0.5,
    retailHighMult: 1.18,
  },
  "diesel-a": {
    id: "diesel-a",
    label: "Diesel Class A",
    start: 0.88,
    rate: 0.04,
    floor: 0.42,
    retailHighMult: 1.22,
  },
  "gas-a": {
    id: "gas-a",
    label: "Gas Class A",
    start: 0.86,
    earlyYears: 3,
    earlyRate: 0.07,
    rate: 0.035,
    floor: 0.36,
    retailHighMult: 1.25,
  },
  "class-c": {
    id: "class-c",
    label: "Class C",
    start: 0.86,
    earlyYears: 3,
    earlyRate: 0.068,
    rate: 0.036,
    floor: 0.36,
    retailHighMult: 1.24,
  },
  "super-c": {
    id: "super-c",
    label: "Super C",
    start: 0.88,
    rate: 0.042,
    floor: 0.4,
    retailHighMult: 1.2,
  },
  "fifth-wheel": {
    id: "fifth-wheel",
    label: "Fifth wheel",
    start: 0.88,
    rate: 0.042,
    floor: 0.38,
    retailHighMult: 1.18,
  },
  "travel-trailer": {
    id: "travel-trailer",
    label: "Travel trailer",
    start: 0.86,
    rate: 0.044,
    floor: 0.36,
    retailHighMult: 1.18,
  },
  "toy-hauler": {
    id: "toy-hauler",
    label: "Toy hauler",
    start: 0.84,
    rate: 0.046,
    floor: 0.34,
    retailHighMult: 1.2,
  },
  motorhome: {
    id: "motorhome",
    label: "Motorhome",
    start: 0.86,
    rate: 0.042,
    floor: 0.38,
    retailHighMult: 1.2,
  },
};

export function detectMarketSegment(
  type: string | undefined,
  fuelType: string | undefined,
): MarketSegmentId {
  const t = (type || "").toLowerCase();
  const f = (fuelType || "").toLowerCase();
  if (/toy\s*hauler/.test(t)) return "toy-hauler";
  if (/class\s*b/.test(t)) return "class-b";
  if (/super\s*c/.test(t)) return "super-c";
  if (/class\s*c/.test(t)) return "class-c";
  if (/fifth/.test(t)) return "fifth-wheel";
  if (/travel\s*trailer|trailer/.test(t) && !/fifth/.test(t)) {
    return "travel-trailer";
  }
  const isA =
    /class\s*a/.test(t) || /diesel\s*pusher/.test(t) || /gas\s*pusher/.test(t);
  if (isA) {
    if (/gas/.test(t) || (/^gas$/.test(f) && !/diesel/.test(t))) return "gas-a";
    if (/diesel/.test(t) || /diesel/.test(f) || /pusher/.test(t)) {
      return "diesel-a";
    }
    return "diesel-a";
  }
  if (/diesel/.test(f) && /motor/.test(t)) return "diesel-a";
  return "motorhome";
}

/** Retain vs MSRP mid for this age + segment. Clamped to the segment floor. */
export function retainForAge(ageYears: number, segment: MarketSegmentId): number {
  const age = Math.max(0, ageYears);
  const c = SEGMENT_CURVES[segment];
  let retain: number;
  if (c.earlyYears && c.earlyRate && age <= c.earlyYears) {
    retain = c.start - age * c.earlyRate;
  } else if (c.earlyYears && c.earlyRate) {
    const afterEarly = c.start - c.earlyYears * c.earlyRate;
    retain = afterEarly - (age - c.earlyYears) * c.rate;
  } else {
    retain = c.start - age * c.rate;
  }
  return Math.max(c.floor, retain);
}

/**
 * Mild brand/tier bump from existing rating tables only.
 * Flagship / high manufacturer base hold a bit more; entry a bit less.
 * Capped at ±4% — not a fake NADA book.
 */
export function brandTierRetainFactor(make?: string, model?: string): number {
  if (!make?.trim()) return 1;
  const tier = getModelTier(make, model || "");
  const base = MANUFACTURER_BASE_SCORES[make] ?? 3.5;
  let bump = 0;
  if (tier === "flagship") bump += 0.03;
  else if (tier === "upper_mid") bump += 0.015;
  else if (tier === "entry") bump -= 0.015;
  if (base >= 4.1) bump += 0.01;
  else if (base <= 2.95) bump -= 0.01;
  return 1 + Math.max(-0.04, Math.min(0.04, bump));
}

/** Floorplan codes that encode length (e.g. 37BH) nudge MSRP around 32 ft. */
export function applyFloorplanLengthBias(
  msrpLo: number,
  msrpHi: number,
  floorplan?: string,
): [number, number] {
  if (!floorplan) return [msrpLo, msrpHi];
  const m = floorplan.match(/(\d{2})/);
  if (!m) return [msrpLo, msrpHi];
  const ft = parseInt(m[1]!, 10);
  if (ft < 20 || ft > 50) return [msrpLo, msrpHi];
  const mid = (msrpLo + msrpHi) / 2;
  const bias = (ft - 32) * 1200;
  const half = (msrpHi - msrpLo) / 2;
  return [
    Math.max(20000, Math.round(mid + bias - half)),
    Math.round(mid + bias + half),
  ];
}

export function roundMarketUsd(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 1000) * 1000;
}

export type EstimateMarketOpts = {
  make?: string;
  model?: string;
  /** Pin the "now" year so tests don't drift. Default: calendar year. */
  asOfYear?: number;
};

/**
 * Catalog used-market ladder. Export shape stays compatible with the
 * previous flat-curve `estimateMarket`.
 */
export function estimateMarket(
  spec: RVSpec,
  year: string,
  floorplan?: string,
  opts?: EstimateMarketOpts,
): MarketEstimate {
  const asOf = opts?.asOfYear ?? new Date().getFullYear();
  const y = parseInt(year, 10) || asOf;
  const age = Math.max(0, asOf - y);
  const [msrpLo0, msrpHi0] = spec.msrpRange || [80000, 200000];
  const [msrpLo, msrpHi] = applyFloorplanLengthBias(msrpLo0, msrpHi0, floorplan);
  const segmentId = detectMarketSegment(spec.type, spec.fuelType);
  const curve = SEGMENT_CURVES[segmentId];

  if (!msrpLo && !msrpHi) {
    return {
      tradeIn: 0,
      retailLow: 0,
      retailHigh: 0,
      msrpLo: 0,
      msrpHi: 0,
      segment: curve.label,
      ageYears: age,
      source: "catalog",
      sourceLabel: "Catalog estimate",
    };
  }

  const mid = (msrpLo + msrpHi) / 2;
  const retain =
    retainForAge(age, segmentId) * brandTierRetainFactor(opts?.make, opts?.model);
  const privateMid = mid * retain;
  const retailHigh = roundMarketUsd(privateMid * curve.retailHighMult);
  const retailLow = roundMarketUsd(privateMid * 0.95);
  const rawTrade = roundMarketUsd(privateMid * 0.85);
  const lo = Math.min(retailLow, retailHigh);
  const hi = Math.max(retailLow, retailHigh);
  const trade = clampTradeToRetailLow(rawTrade, lo);

  return {
    tradeIn: trade.tradeIn,
    retailLow: lo,
    retailHigh: hi,
    msrpLo,
    msrpHi,
    segment: curve.label,
    ageYears: age,
    tradeCappedAtRetailLow: trade.capped || undefined,
    source: "catalog",
    sourceLabel: "Catalog estimate",
  };
}
