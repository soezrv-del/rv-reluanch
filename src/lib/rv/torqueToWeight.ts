/**
 * Torque rating for the Facts Ratings bar.
 *
 * Prefer dry weight. Fall back to GVWR only when dry weight is missing.
 * A short Class C and a long Class C on the same chassis share torque
 * and GVWR; printed UVW is what separates them.
 *
 * Do not invent UVW from GVWR. Do not use the tiered factors or the
 * Class A gas GVWR − 1800 scored weight. UVW_EST is not a score.
 * weightEstimated = false either way.
 *
 * Active weight (first hit wins):
 *   1. Salesman UVW override
 *   2. Published / pinned UVW (uvwLbs, then parseUvwLb)
 *   3. If no UVW: salesman GVWR override, then published gvwrLbs,
 *      then parseGvwrLb. A two-number band uses the high end.
 *   4. If neither: GAP. Do not estimate either number.
 *
 * Ratio: r = (torqueLbFt / weightLb) * 1000
 * weightBasis = "UVW" when dry weight scored.
 * weightBasis = "GVWR" when the fallback scored.
 *
 * Two color scales. Do not put a GVWR ratio on the UVW ruler.
 * Color comes from the score: red under 6, yellow from 6 up to 8,
 * green at 8 and up.
 *
 * UVW: green ratio >= 40, yellow ratio >= 32 and under 40, red below.
 *      score = clamp(6 + (ratio - 32) / 4, 1, 10)
 *      32 is 6.0. 40 is 8.0. 48 is 10.0.
 * GVWR: green ratio >= 28, yellow ratio >= 22 and under 28, red below.
 *       score = clamp(6 + (ratio - 22) / 3, 1, 10)
 *       22 is 6.0. 28 is 8.0. 34 is 10.0.
 *
 * Towables stay N/A. A Class C toy hauler is still rateable. A fifth
 * wheel, travel trailer, truck camper, or Hideout is not.
 *
 * Tiered UVW helpers below are for the spec sheet only. This rating
 * does not call them.
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

/**
 * Class A Gas TTW scoring weight: GVWR − 1800 lb across the board.
 * Heavier than UVW_EST (e.g. 22k × 0.82 = 18k) so a 22k Precept does
 * not inherit the Alante 27A champion pair. Displayed Facts UVW / GVWR
 * are unchanged.
 */
export const CLASS_A_GAS_TTW_WEIGHT_OFFSET_LB = 1800;

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
  /** "UVW" when dry weight scored, "GVWR" on the fallback. Null on GAP / N/A. */
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

/** Coach class label only. The 1–10 score does not change by class. */
export type TorqueScoreFormula =
  | "class-a-diesel"
  | "class-a-gas"
  | "super-c"
  | "class-c"
  | "global";

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

/**
 * Retired from the rating. GVWR − 1800 is not a scored weight.
 * Kept so older callers can still ask; computeTorqueToWeight ignores it.
 */
export function classAGasScoredWeightLb(
  gvwrLb: number | null | undefined,
): number | null {
  const g = positiveInt(gvwrLb ?? 0);
  if (g == null) return null;
  const weightLb = g - CLASS_A_GAS_TTW_WEIGHT_OFFSET_LB;
  return weightLb > 0 ? weightLb : null;
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

/** 950 lb-ft ÷ 18,000 lb UVW. The bar is full at this ratio. */
export const TTW_TOP_RATIO = 950 / 18_000;

/** torque lb-ft ÷ UVW lbs. Not per-thousand. */
export function dryWeightRatio(
  torqueLbFt: number | null | undefined,
  uvwLb: number | null | undefined,
): number | null {
  if (torqueLbFt == null || uvwLb == null) return null;
  if (!(torqueLbFt > 0) || !(uvwLb > 0)) return null;
  return torqueLbFt / uvwLb;
}

export function dryWeightBarFill(ratio: number): number {
  return Math.min(100, Math.max(0, (ratio / TTW_TOP_RATIO) * 100));
}

/**
 * Not used by the Ratings bar. UVW scale only — do not pass a GVWR ratio,
 * and do not paint 0.04 / 0.0132 thresholds.
 */
export function dryWeightBarColor(ratio: number): TorqueBarColor {
  return barColorFromScore(scoreFromTorqueToWeightRatio(ratio, "UVW")) ?? "red";
}

export function formatDryWeightRatio(
  torqueLbFt: number | null | undefined,
  uvwLb: number | null | undefined,
): string {
  const ratio = dryWeightRatio(torqueLbFt, uvwLb);
  if (ratio == null) return "GAP";
  return ratio.toFixed(4);
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
  return /travel\s*trailer|fifth\s*wheel|5th\s*wheel|toy\s*hauler|truck\s*camper|pop-?up|teardrop|\btowable\b|\bhideout\b/.test(
    t,
  );
}

/**
 * 1–10 on the scale of the weight that scored.
 * UVW:  clamp(6 + (ratio - 32) / 4, 1, 10) — 32 → 6.0, 40 → 8.0, 48 → 10.0
 * GVWR: clamp(6 + (ratio - 22) / 3, 1, 10) — 22 → 6.0, 28 → 8.0, 34 → 10.0
 * Class does not move the number. A missing basis uses the GVWR scale
 * only so a GVWR ratio is never painted on the UVW ruler.
 */
export function scoreFromTorqueToWeightRatio(
  ratio: number | null | undefined,
  basis?: TorqueWeightBasis | null,
): number | null {
  if (ratio == null || !Number.isFinite(ratio) || ratio < 0) return null;
  if (basis === "UVW") return clampScore(6 + (ratio - 32) / 4);
  return clampScore(6 + (ratio - 22) / 3);
}

/** Green ≥ 28, yellow [22, 28), red < 22. Same bands as the score. */
export function colorFromGvwrRatio(
  ratio: number | null | undefined,
): TorqueBarColor | null {
  if (ratio == null || !Number.isFinite(ratio)) return null;
  if (ratio >= 28) return "green";
  if (ratio >= 22) return "yellow";
  return "red";
}

export function barColorFromScore(
  score: number | null | undefined,
): TorqueBarColor | null {
  if (score == null || !Number.isFinite(score)) return null;
  if (score < 6) return "red";
  if (score < 8) return "yellow";
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
 * Pick the rating weight. Printed UVW wins. GVWR is only the fallback.
 * No UVW estimate.
 */
export function resolveTorqueWeight(
  input: TorqueToWeightInput,
): ResolvedTorqueWeight {
  const overrideUvw = positiveInt(input.overrideUvwLbs ?? 0);
  const publishedUvw =
    positiveInt(input.uvwLbs ?? 0) ?? parseUvwLb(input.uvwRaw);
  const uvwLb = overrideUvw ?? publishedUvw;
  const overrideGvwr = positiveInt(input.overrideGvwrLbs ?? 0);
  const publishedGvwr = positiveInt(input.gvwrLbs ?? 0);
  const parsedGvwr =
    parseGvwrLb(input.gvwrRaw) ?? parseGvwrLb(input.weightRange);
  const gvwrLb = overrideGvwr ?? publishedGvwr ?? parsedGvwr;

  if (uvwLb != null) {
    return {
      uvwLb,
      gvwrLb,
      weightLb: uvwLb,
      weightBasis: "UVW",
      weightOverridden: overrideUvw != null,
      weightEstimated: false,
      thinCcc: false,
      uvwEstimateTier: null,
    };
  }
  if (gvwrLb == null) {
    return {
      uvwLb: null,
      gvwrLb: null,
      weightLb: null,
      weightBasis: null,
      weightOverridden: false,
      weightEstimated: false,
      thinCcc: false,
      uvwEstimateTier: null,
    };
  }
  return {
    uvwLb: null,
    gvwrLb,
    weightLb: gvwrLb,
    weightBasis: "GVWR",
    weightOverridden: overrideGvwr != null,
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
  const score = scoreFromTorqueToWeightRatio(ratio, resolved.weightBasis);
  const scored = score != null;
  return {
    torqueLbFt,
    uvwLb: resolved.uvwLb,
    gvwrLb: resolved.gvwrLb,
    weightLb: scored ? resolved.weightLb : null,
    weightBasis: scored ? resolved.weightBasis : null,
    weightOverridden: scored ? resolved.weightOverridden : false,
    weightEstimated: false,
    thinCcc: false,
    uvwEstimateTier: null,
    ratio,
    score,
    color: barColorFromScore(score),
    formula: scored ? formula : null,
    gap: !scored,
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

/** "Torque / UVW" or "Torque / GVWR". Null on GAP / N/A — never an estimate label. */
export function formatTorqueWeightBasisChip(
  result: TorqueToWeightResult,
): string | null {
  if (result.na || result.gap || result.weightBasis == null) return null;
  if (result.weightBasis === "UVW") return "Torque / UVW";
  if (result.weightBasis === "GVWR") return "Torque / GVWR";
  return null;
}
