/**
 * Torque-to-weight rating for the Facts report Ratings section.
 *
 * Weight metric — UVW preferred, GVWR fallback. Never invent UVW from
 * estimated mid×0.82 (weightForFloorplan). GAP if torque is missing or
 * no usable weight remains. Prefer numeric powertrainGuard / brochure
 * hard torque when present; else parse specs.torque. Torque is lb-ft
 * only — never horsepower.
 *
 * Active weight (first hit wins):
 *   1. Manual UVW override
 *   2. Published / pinned UVW (oem pin, OEM floorplan, catalog snap)
 *   3. Estimated UVW via the tiered GVWR formula (nearest 100 lb)
 *      when a usable single GVWR exists (OEM pin, parseable single,
 *      or already-resolved HIGH-of-range). Never overwrites a pin.
 *   4. Manual GVWR override (raw — only if no GVWR to estimate from)
 *   5. Published GVWR (oem.gvwrLbs / findOemGvwrLbs / snap / live)
 *   6. Range-only GVWR HIGH end (display band / weightRange [lo,hi])
 *   7. GAP
 *
 * Range-only GVWR (e.g. "39,500–44,005 lbs"): for **TTW scoring only**,
 * use the **HIGH** number as the GVWR source for the tiered estimate
 * (or as raw GVWR if the estimate cannot run). Heavier published
 * weight → lower (more conservative) score. A single published GVWR
 * pin still wins over the range. Do not invent UVW from mid×0.82.
 *
 * Ratio: r = (torqueLbFt / weightLb) * 1000  →  lb-ft per 1,000 lb
 *
 * Four motorized coach types each score against their own champion ratio
 * R* (the 10.0 ceiling). Same piecewise shape as the global envelope;
 * thresholds scale by R-star over 45 (global high breakpoint was 45):
 *   t1 = 0.222 * R*     → [1, 2)
 *   t2 = 0.378 * R*     → [3, 4)
 *   t3 = 0.622 * R*     → [4.0, 6.5)
 *   t4 = R*             → [7.0, 9.3) then 10.0 at/above champion
 *
 * Locked champions (do not recompute from catalog drift):
 *   Class A Diesel  American Dream 45A X15     R* = 38.2  (1950 / 51000)
 *   Class A Gas     Jayco Alante 27A           R* = 26.0  (468 / 18000)
 *   Super C         Grand Design Lineage F 31ZW R* = 43.2  (950 / 22000)
 *   Class C         Forest River Sunseeker TS  R* = 38.6  (400 / 10360)
 *
 * Class B / unknown motorized: GLOBAL curve (unscaled 10/17/28/45,
 * including 8.75 + (r−45)/5 above 45). Towables stay N/A.
 *
 * Score uses the active #358 weight (published UVW → tiered UVW_EST →
 * GVWR). 2022 Dream 39RK stays pinned 39,237 (not estimated).
 *
 * Bar color (score, not ratio) — unchanged bands:
 *   red     score < 6.0
 *   yellow  6.0 ≤ score < 7.5
 *   green   score ≥ 7.5
 */

export type TorqueBarColor = "red" | "yellow" | "green";

export type TorqueWeightBasis = "UVW" | "UVW_EST" | "GVWR";

/** Diesel-pusher (Freightliner / Spartan) factor. Same as the old flat formula. */
export const UVW_FROM_GVWR_DIESEL_PUSHER = 0.835;

/** @deprecated Use UVW_FROM_GVWR_DIESEL_PUSHER. Kept as the diesel-pusher alias. */
export const UVW_FROM_GVWR_RATIO = UVW_FROM_GVWR_DIESEL_PUSHER;

export const UVW_FROM_GVWR_GAS_UNDER_20K = 0.88;
export const UVW_FROM_GVWR_GAS_20K_24K = 0.82;
export const UVW_FROM_GVWR_GAS_26K_UP = 0.87;

/** Gas 20–24k CCC/OCCC/NCC under this many pounds → thin-CCC flag (still ×0.82). */
export const THIN_CCC_THRESHOLD_LB = 3000;

export const THIN_CCC_FLAG = "thin-CCC";

/** Specs / Ratings tag — distinct from OEM pin / sticker / salesman override. */
export const UVW_ESTIMATE_LABEL = "estimated via tiered GVWR formula";

export type UvwEstimateTier =
  | "diesel-pusher"
  | "gas-under-20k"
  | "gas-20k-24k"
  | "gas-26k-up";

export type UvwEstimateHint = {
  chassis?: string | null;
  fuelType?: string | null;
  rvType?: string | null;
  /** CCC / OCCC / NCC pounds when known — used only for the thin-CCC flag. */
  cccLbs?: number | null;
};

export type UvwEstimateDetail = {
  uvwLbs: number;
  factor: number;
  tier: UvwEstimateTier;
  thinCcc: boolean;
  /**
   * True when GVWR sat in the unpublished 24,001–25,999 gas gap and we
   * snapped to a published tier (no silent fourth factor).
   */
  gapBand: boolean;
  gvwrLbs: number;
};

export type TorqueToWeightInput = {
  /** Brochure / powertrainGuard hard torque (lb-ft). Preferred when > 0. */
  torqueLbFt?: number | null;
  /** Display / specs.torque string (may include "lb-ft"). Never HP. */
  torqueRaw?: string | number | null;
  /** Numeric published / pinned UVW pounds. Preferred over GVWR when > 0. */
  uvwLbs?: number | null;
  /** Display / specs.uvw string — published UVW only, never mid×0.82. */
  uvwRaw?: string | number | null;
  /** Salesman UVW override — wins over published UVW. */
  overrideUvwLbs?: number | null;
  /** Numeric published OEM GVWR pounds (live.gvwrLbs). Fallback basis. */
  gvwrLbs?: number | null;
  /**
   * Display / specs.gvwr string (commas + units stripped), or a [lo,hi]
   * band. Two-number ranges use the HIGH end for TTW only.
   */
  gvwrRaw?: string | number | readonly [number, number] | null;
  /**
   * Catalog weightRange [lo,hi] when the listing shows a band and no
   * single published GVWR. HIGH end only; published gvwrLbs still wins.
   */
  weightRange?: readonly [number, number] | null;
  /** Salesman GVWR override — wins over published GVWR; loses to any UVW. */
  overrideGvwrLbs?: number | null;
  /** Coach type / fuel — towables are N/A (no engine torque rating). */
  rvType?: string | null;
  fuelType?: string | null;
  /** Chassis — diesel-pusher UVW factor and per-type formula hints. */
  chassis?: string | null;
  /** Engine hint (Cummins L9/X15/ISB, Godzilla, …) for type detection. */
  engine?: string | null;
  /** CCC / OCCC / NCC pounds — thin-CCC flag on 20–24k gas estimates. */
  cccLbs?: number | null;
  /** Display / specs.ccc string when a numeric CCC is not already resolved. */
  cccRaw?: string | number | null;
};

export type TorqueToWeightResult = {
  torqueLbFt: number | null;
  uvwLb: number | null;
  gvwrLb: number | null;
  /** Pounds used for the score. Null on GAP / N/A. */
  weightLb: number | null;
  /** "UVW", "UVW_EST", or "GVWR" when scored. Null on GAP / N/A. */
  weightBasis: TorqueWeightBasis | null;
  /** True when the active weight came from a manual override. */
  weightOverridden: boolean;
  /** True when the active UVW is the tiered GVWR estimate. */
  weightEstimated: boolean;
  /** True when a 20–24k gas estimate has CCC/OCCC/NCC under 3,000 lb. */
  thinCcc: boolean;
  /** Tier used for an estimated UVW. Null when not estimated. */
  uvwEstimateTier: UvwEstimateTier | null;
  /** (torqueLbFt / weightLb) * 1000, or null on GAP. */
  ratio: number | null;
  /** Continuous 1–10, or null on GAP / N/A. */
  score: number | null;
  color: TorqueBarColor | null;
  /** Which piecewise envelope produced the score. Null on GAP / N/A. */
  formula: TorqueScoreFormula | null;
  gap: boolean;
  /** Towable (trailer / fifth wheel) — N/A, not a motorhome score. */
  na: boolean;
};

/** Per-type TTW envelope. `global` is the unscaled 10/17/28/45 fallback. */
export type TorqueScoreFormula =
  | "class-a-diesel"
  | "class-a-gas"
  | "super-c"
  | "class-c"
  | "global";

/**
 * Locked champion ratios R* (lb-ft per 1,000 lb GVWR).
 * Scale thresholds by R-star over 45 from the global 10/17/28/45 breakpoints.
 */
export const TORQUE_SCORE_CHAMPIONS = {
  "class-a-diesel": 38.2,
  "class-a-gas": 26.0,
  "super-c": 43.2,
  "class-c": 38.6,
} as const satisfies Record<Exclude<TorqueScoreFormula, "global">, number>;

/** Global (Class B / unknown) breakpoints — do not scale these. */
export const GLOBAL_TORQUE_BREAKPOINTS = {
  t1: 10,
  t2: 17,
  t3: 28,
  t4: 45,
} as const;

const THRESHOLD_T1 = 0.222;
const THRESHOLD_T2 = 0.378;
const THRESHOLD_T3 = 0.622;

export type TorqueScoreThresholds = {
  t1: number;
  t2: number;
  t3: number;
  t4: number;
};

/** Scaled breakpoints for a champion ratio. t4 = R* (score 10.0). */
export function torqueScoreThresholds(
  championRatio: number,
): TorqueScoreThresholds {
  return {
    t1: THRESHOLD_T1 * championRatio,
    t2: THRESHOLD_T2 * championRatio,
    t3: THRESHOLD_T3 * championRatio,
    t4: championRatio,
  };
}

export function thresholdsForFormula(
  formula: TorqueScoreFormula,
): TorqueScoreThresholds {
  if (formula === "global") return { ...GLOBAL_TORQUE_BREAKPOINTS };
  return torqueScoreThresholds(TORQUE_SCORE_CHAMPIONS[formula]);
}

/**
 * Pick the per-type envelope.
 * Super C (including diesel Super C) wins over Class C / Class A.
 * Class A + diesel / diesel pusher / Freightliner / Spartan /
 * Cummins L9, X15, ISB → Class A Diesel.
 * Class A + gas / F53 → Class A Gas.
 * Class B and unknown motorized → global fallback.
 */
export function resolveTorqueScoreFormula(
  input: Pick<
    TorqueToWeightInput,
    "rvType" | "fuelType" | "chassis" | "engine"
  >,
): TorqueScoreFormula {
  const type = `${input.rvType || ""}`.toLowerCase();
  const fuel = `${input.fuelType || ""}`.toLowerCase();
  const chassis = `${input.chassis || ""}`.toLowerCase();
  const engine = `${input.engine || ""}`.toLowerCase();
  const blob = `${type} ${fuel} ${chassis} ${engine}`;

  if (/super\s*c/.test(blob)) return "super-c";
  if (/class\s*c/.test(blob)) return "class-c";

  const isClassA = /class\s*a/.test(type) || /diesel\s*pusher/.test(blob);
  if (isClassA) {
    const namedGas = /class\s*a\s*gas/.test(type);
    const namedDiesel = /class\s*a\s*diesel/.test(type);
    const dieselHint =
      namedDiesel ||
      /diesel/.test(fuel) ||
      /diesel\s*pusher/.test(blob) ||
      /freightliner|spartan/.test(chassis) ||
      /cummins\s*(l9|x15|isb)|\bl9\b|\bx15\b|\bisb\b/.test(engine);
    const gasHint =
      namedGas ||
      /gas|gasoline/.test(fuel) ||
      /f-?53|godzilla|triton/.test(`${chassis} ${engine}`);
    if (dieselHint && !namedGas) return "class-a-diesel";
    if (gasHint) return "class-a-gas";
    return "global";
  }

  return "global";
}

const EMPTY = /^[—–\-]$/;

function positiveInt(n: number): number | null {
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function clampScore(n: number): number {
  return Math.min(10, Math.max(1, n));
}

function hintFromInput(input: TorqueToWeightInput): UvwEstimateHint {
  return {
    chassis: input.chassis,
    fuelType: input.fuelType,
    rvType: input.rvType,
    cccLbs: positiveInt(input.cccLbs ?? 0) ?? parseCccLb(input.cccRaw),
  };
}

/**
 * Gas / van / cutaway chassis — never the diesel-pusher factor, even
 * when the coach is diesel-fueled (Sprinter) or the type string is vague.
 */
export function isGasOrVanChassis(
  chassis?: string | null,
  extra?: string | null,
): boolean {
  const s = `${chassis || ""} ${extra || ""}`.toLowerCase();
  return /f-?53|\bf53\b|godzilla|e-?350|e-?450|e-?550|sprinter|promaster|transit|chevy\s*3500|chevy\s*4500|chevrolet\s*3500|chevrolet\s*4500/.test(
    s,
  );
}

/**
 * Diesel pushers: Freightliner or Spartan chassis, or Class A Diesel /
 * "diesel pusher" without a gas/van chassis. Sprinter / F-53 / cutaway
 * stay on the gas/other tiers.
 */
export function isDieselPusherForUvwEstimate(
  hint?: UvwEstimateHint | null,
): boolean {
  if (!hint) return false;
  if (isGasOrVanChassis(hint.chassis, hint.rvType)) return false;
  if (/freightliner|spartan/i.test(hint.chassis || "")) return true;
  const type = `${hint.rvType || ""} ${hint.fuelType || ""}`.toLowerCase();
  if (/diesel\s*pusher/.test(type)) return true;
  if (/class\s*a/.test(type) && /diesel/.test(type)) return true;
  return false;
}

function roundUvwNearest100(gvwrLb: number, factor: number): number {
  return Math.round((gvwrLb * factor) / 100) * 100;
}

/**
 * Legacy flat 0.835 stand-in — delta reports only. Not the live formula.
 */
export function estimateUvwFromGvwrFlat835(
  gvwrLb: number | null | undefined,
): number | null {
  const g = positiveInt(gvwrLb ?? 0);
  if (g == null) return null;
  return roundUvwNearest100(g, UVW_FROM_GVWR_DIESEL_PUSHER);
}

/**
 * Catalog-wide UVW stand-in when no published / pinned / sticker UVW exists.
 * Nearest 100 lb. Null when GVWR is missing or not a usable single figure.
 *
 * Diesel pushers (Freightliner / Spartan, or Class A Diesel without a
 * gas/van chassis): GVWR × 0.835.
 *
 * Gas / other (Ford F-53, Sprinter, cutaway, unlabeled):
 *   GVWR < 20,000            → × 0.88
 *   GVWR 20,000–24,000       → × 0.82  (thin-CCC if CCC < 3,000)
 *   GVWR 26,000+             → × 0.87
 *   GVWR 24,001–25,000       → × 0.82  (nearest published tier; 25k noted)
 *   GVWR 25,001–25,999       → × 0.87  (nearest published tier)
 */
export function estimateUvwFromGvwrDetailed(
  gvwrLb: number | null | undefined,
  hint?: UvwEstimateHint | null,
): UvwEstimateDetail | null {
  const g = positiveInt(gvwrLb ?? 0);
  if (g == null) return null;

  if (isDieselPusherForUvwEstimate(hint)) {
    return {
      uvwLbs: roundUvwNearest100(g, UVW_FROM_GVWR_DIESEL_PUSHER),
      factor: UVW_FROM_GVWR_DIESEL_PUSHER,
      tier: "diesel-pusher",
      thinCcc: false,
      gapBand: false,
      gvwrLbs: g,
    };
  }

  let factor: number;
  let tier: UvwEstimateTier;
  let gapBand = false;
  if (g < 20_000) {
    factor = UVW_FROM_GVWR_GAS_UNDER_20K;
    tier = "gas-under-20k";
  } else if (g <= 24_000) {
    factor = UVW_FROM_GVWR_GAS_20K_24K;
    tier = "gas-20k-24k";
  } else if (g <= 25_000) {
    // 24,001–25,000 inclusive: stay on the 20–24k published tier. Exactly
    // 25,000 is documented as ×0.82 — no silent fourth factor.
    factor = UVW_FROM_GVWR_GAS_20K_24K;
    tier = "gas-20k-24k";
    gapBand = g > 24_000;
  } else if (g < 26_000) {
    factor = UVW_FROM_GVWR_GAS_26K_UP;
    tier = "gas-26k-up";
    gapBand = true;
  } else {
    factor = UVW_FROM_GVWR_GAS_26K_UP;
    tier = "gas-26k-up";
  }

  const ccc = positiveInt(hint?.cccLbs ?? 0);
  const thinCcc =
    tier === "gas-20k-24k" && ccc != null && ccc < THIN_CCC_THRESHOLD_LB;

  return {
    uvwLbs: roundUvwNearest100(g, factor),
    factor,
    tier,
    thinCcc,
    gapBand,
    gvwrLbs: g,
  };
}

export function estimateUvwFromGvwr(
  gvwrLb: number | null | undefined,
  hint?: UvwEstimateHint | null,
): number | null {
  return estimateUvwFromGvwrDetailed(gvwrLb, hint)?.uvwLbs ?? null;
}

/**
 * Parse torque in lb-ft. Never uses a horsepower figure.
 * Prefers a number labeled lb-ft / ft-lb; unlabeled HP-only strings → null.
 */
export function parseTorqueLbFt(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return positiveInt(raw);
  const s = String(raw).trim();
  if (!s || EMPTY.test(s) || /^n\/a\b/i.test(s)) return null;

  const compact = s.replace(/,/g, "");
  const labeled = compact.match(
    /(\d+(?:\.\d+)?)\s*(?:lb[-\s]?ft|ft[-\s]?lbf?s?)/i,
  );
  if (labeled) return positiveInt(Number(labeled[1]));

  // "450 HP" / "450 hp" with no torque unit — do not invent from HP.
  if (/\bhp\b/i.test(compact)) return null;

  const m = compact.match(/(\d+(?:\.\d+)?)/);
  return m ? positiveInt(Number(m[1])) : null;
}

function parseSingleWeightLb(
  raw: string | number | null | undefined,
  reject: RegExp,
): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return positiveInt(raw);
  const s = String(raw).trim();
  if (!s || EMPTY.test(s) || /^n\/a\b/i.test(s) || reject.test(s)) {
    return null;
  }

  const compact = s.replace(/,/g, "").replace(/lbs?\.?/gi, " ");
  const nums = [...compact.matchAll(/(\d+(?:\.\d+)?)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length !== 1) return null;
  return Math.round(nums[0]!);
}

/**
 * Parse UVW / unloaded pounds. Strips commas/units. A weight *range*
 * (two numbers) or a GVWR-labeled string is unparseable → null (GAP).
 */
export function parseUvwLb(
  raw: string | number | null | undefined,
): number | null {
  return parseSingleWeightLb(raw, /\bgvwr\b/i);
}

/**
 * Parse CCC / OCCC / NCC pounds. Confirm-brochure / range strings → null.
 */
export function parseCccLb(
  raw: string | number | null | undefined,
): number | null {
  return parseSingleWeightLb(raw, /\bgvwr\b|\buvw\b|\bunloaded\b/i);
}

/**
 * Parse GVWR pounds for TTW. Strips commas/units. UVW / unloaded-labeled
 * strings stay unparseable → null (GAP).
 *
 * A two-number range ("39500-44005", "39,500–44,005 lbs", or [lo,hi])
 * uses **Math.max(lo, hi)** — the high end — so the score is not
 * inflated. Three-or-more numbers stay GAP. A single published figure
 * ("47000") is unchanged. Callers still prefer oem / findOem / snap /
 * live numeric pins over this parse.
 */
export function parseGvwrLb(
  raw: string | number | readonly [number, number] | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return positiveInt(raw);
  if (
    Array.isArray(raw) &&
    raw.length === 2 &&
    Number.isFinite(raw[0]) &&
    Number.isFinite(raw[1]) &&
    raw[0] > 0 &&
    raw[1] > 0
  ) {
    return Math.round(Math.max(raw[0], raw[1]));
  }
  if (typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s || EMPTY.test(s) || /^n\/a\b/i.test(s) || /\buvw\b|\bunloaded\b/i.test(s)) {
    return null;
  }

  const compact = s.replace(/,/g, "").replace(/lbs?\.?/gi, " ");
  const nums = [...compact.matchAll(/(\d+(?:\.\d+)?)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length === 1) return Math.round(nums[0]!);
  // TTW-only: high end of a two-number band. Conservative — heavier GVWR.
  if (nums.length === 2) return Math.round(Math.max(nums[0]!, nums[1]!));
  return null;
}

export function torqueToWeightRatio(
  torqueLbFt: number,
  weightLb: number,
): number | null {
  if (!(torqueLbFt > 0) || !(weightLb > 0)) return null;
  return (torqueLbFt / weightLb) * 1000;
}

/**
 * Towables have no coach engine torque. Motorized Class C toy haulers
 * stay rateable; a bare "Toy Hauler" / fifth wheel / TT is N/A.
 */
export function isTowableForTorqueRating(
  rvType?: string | null,
  fuelType?: string | null,
): boolean {
  const t = `${rvType || ""} ${fuelType || ""}`.toLowerCase();
  if (!t.trim()) return false;
  if (/class\s*[abc]|super\s*c|motorhome|diesel\s*pusher/.test(t)) {
    return false;
  }
  return /travel\s*trailer|fifth\s*wheel|5th\s*wheel|toy\s*hauler|truck\s*camper|pop-?up|teardrop|\btowable\b/.test(
    t,
  );
}

/**
 * Continuous 1–10 from r = (lb-ft / weight) × 1000.
 * Default `global` envelope: <10 → 1–2; 10–17 → 3–4; 17–28 → 5–6;
 * 28–45 → 7–8; 45+ → 9–10 (8.75 + (r−45)/5).
 * Typed formulas use the same interior slopes on scaled t1..t4, and
 * score 10.0 at/above the champion ratio R*.
 */
export function scoreFromTorqueToWeightRatio(
  ratio: number | null | undefined,
  formula: TorqueScoreFormula = "global",
): number | null {
  if (ratio == null || !Number.isFinite(ratio) || ratio < 0) return null;
  const { t1, t2, t3, t4 } = thresholdsForFormula(formula);
  if (ratio < t1) return clampScore(1 + ratio / t1);
  if (ratio < t2) return clampScore(3 + (ratio - t1) / (t2 - t1));
  if (ratio < t3) return clampScore(4 + ((ratio - t2) / (t3 - t2)) * 2.5);
  if (formula !== "global") {
    // Locked R* is one-decimal. Published champion pairs can sit just
    // under that (950/22000 = 43.1818 vs 43.2). Treat ±0.05 as 10.0.
    if (ratio + 0.05 >= t4) return 10;
  }
  if (ratio < t4) return clampScore(7 + ((ratio - t3) / (t4 - t3)) * 2.3);
  if (formula === "global") {
    return clampScore(8.75 + (ratio - t4) / 5);
  }
  return 10;
}

export function barColorFromScore(
  score: number | null | undefined,
): TorqueBarColor | null {
  if (score == null || !Number.isFinite(score)) return null;
  if (score < 6) return "red";
  if (score < 7.5) return "yellow";
  return "green";
}

const NA_RESULT: TorqueToWeightResult = {
  torqueLbFt: null,
  uvwLb: null,
  gvwrLb: null,
  weightLb: null,
  weightBasis: null,
  weightOverridden: false,
  weightEstimated: false,
  thinCcc: false,
  uvwEstimateTier: null,
  ratio: null,
  score: null,
  color: null,
  formula: null,
  gap: true,
  na: true,
};

export type ResolvedTorqueWeight = {
  uvwLb: number | null;
  gvwrLb: number | null;
  weightLb: number | null;
  weightBasis: TorqueWeightBasis | null;
  weightOverridden: boolean;
  weightEstimated: boolean;
  thinCcc: boolean;
  uvwEstimateTier: UvwEstimateTier | null;
};

/**
 * Pick the TTW weight: override UVW → published UVW → estimated UVW
 * (tiered GVWR formula) → override GVWR → published GVWR → GAP.
 * Callers must not pass mid×0.82 estimates as UVW.
 */
export function resolveTorqueWeight(
  input: TorqueToWeightInput,
): ResolvedTorqueWeight {
  const overrideUvw = positiveInt(input.overrideUvwLbs ?? 0);
  const publishedUvw =
    positiveInt(input.uvwLbs ?? 0) ?? parseUvwLb(input.uvwRaw);
  const overrideGvwr = positiveInt(input.overrideGvwrLbs ?? 0);
  const publishedGvwr =
    positiveInt(input.gvwrLbs ?? 0) ??
    parseGvwrLb(input.gvwrRaw) ??
    parseGvwrLb(input.weightRange);
  const gvwrLb = overrideGvwr ?? publishedGvwr;
  const estimated = estimateUvwFromGvwrDetailed(gvwrLb, hintFromInput(input));
  const estimatedUvw = estimated?.uvwLbs ?? null;
  const uvwLb = overrideUvw ?? publishedUvw ?? estimatedUvw;

  if (overrideUvw != null) {
    return {
      uvwLb,
      gvwrLb,
      weightLb: overrideUvw,
      weightBasis: "UVW",
      weightOverridden: true,
      weightEstimated: false,
      thinCcc: false,
      uvwEstimateTier: null,
    };
  }
  if (publishedUvw != null) {
    return {
      uvwLb,
      gvwrLb,
      weightLb: publishedUvw,
      weightBasis: "UVW",
      weightOverridden: false,
      weightEstimated: false,
      thinCcc: false,
      uvwEstimateTier: null,
    };
  }
  if (estimatedUvw != null) {
    return {
      uvwLb: estimatedUvw,
      gvwrLb,
      weightLb: estimatedUvw,
      weightBasis: "UVW_EST",
      weightOverridden: false,
      weightEstimated: true,
      thinCcc: estimated?.thinCcc ?? false,
      uvwEstimateTier: estimated?.tier ?? null,
    };
  }
  if (overrideGvwr != null) {
    return {
      uvwLb,
      gvwrLb,
      weightLb: overrideGvwr,
      weightBasis: "GVWR",
      weightOverridden: true,
      weightEstimated: false,
      thinCcc: false,
      uvwEstimateTier: null,
    };
  }
  if (publishedGvwr != null) {
    return {
      uvwLb,
      gvwrLb,
      weightLb: publishedGvwr,
      weightBasis: "GVWR",
      weightOverridden: false,
      weightEstimated: false,
      thinCcc: false,
      uvwEstimateTier: null,
    };
  }
  return {
    uvwLb,
    gvwrLb,
    weightLb: null,
    weightBasis: null,
    weightOverridden: false,
    weightEstimated: false,
    thinCcc: false,
    uvwEstimateTier: null,
  };
}

export function computeTorqueToWeight(
  input: TorqueToWeightInput,
): TorqueToWeightResult {
  if (isTowableForTorqueRating(input.rvType, input.fuelType)) {
    return { ...NA_RESULT };
  }
  const torqueLbFt =
    positiveInt(input.torqueLbFt ?? 0) ?? parseTorqueLbFt(input.torqueRaw);
  const resolved = resolveTorqueWeight(input);
  const ratio =
    torqueLbFt != null && resolved.weightLb != null
      ? torqueToWeightRatio(torqueLbFt, resolved.weightLb)
      : null;
  const formula = resolveTorqueScoreFormula(input);
  const score = scoreFromTorqueToWeightRatio(ratio, formula);
  return {
    torqueLbFt,
    uvwLb: resolved.uvwLb,
    gvwrLb: resolved.gvwrLb,
    weightLb: resolved.weightLb,
    weightBasis: resolved.weightBasis,
    weightOverridden: resolved.weightOverridden,
    weightEstimated: resolved.weightEstimated,
    thinCcc: resolved.thinCcc,
    uvwEstimateTier: resolved.uvwEstimateTier,
    ratio,
    score,
    color: barColorFromScore(score),
    formula: score == null ? null : formula,
    gap: score == null,
    na: false,
  };
}

/** Display "X.X/10"; N/A on towables, GAP when torque or weight missing. */
export function formatTorqueToWeightScore(
  result: TorqueToWeightResult,
): string {
  if (result.na) return "N/A";
  if (result.gap || result.score == null || result.weightBasis == null) {
    return "GAP";
  }
  return `${result.score.toFixed(1)}/10`;
}

/**
 * Retired from UI — weight basis / estimate method is internal.
 * Kept so existing call sites can stay null-safe.
 */
export function formatTorqueWeightBasisChip(
  _result: TorqueToWeightResult,
): string | null {
  return null;
}
