/**
 * Torque-to-weight rating for the Facts report Ratings section.
 *
 * Weight metric: UVW in pounds (empty/dry coach weight) — never GVWR.
 * Prefer numeric powertrainGuard / brochure hard torque when present;
 * else parse specs.torque. Parse UVW from specs.uvw / uvwLbs
 * (strip commas/units). Torque is lb-ft only — never horsepower.
 *
 * Ratio: r = (torqueLbFt / uvwLb) * 1000  →  lb-ft per 1,000 lb UVW
 *
 * Motorhome bands (half-open):
 *   GAP / N/A  torque missing OR uvw missing OR ≤0 OR towable
 *   1★  [0, 10)
 *   2★  [10, 18)
 *   3★  [18, 30)
 *   4★  [30, 50)
 *   5★  [50, ∞)
 */

export type TorqueToWeightStars = 1 | 2 | 3 | 4 | 5;

export type TorqueToWeightInput = {
  /** Brochure / powertrainGuard hard torque (lb-ft). Preferred when > 0. */
  torqueLbFt?: number | null;
  /** Display / specs.torque string (may include "lb-ft"). Never HP. */
  torqueRaw?: string | number | null;
  /** Numeric UVW pounds when already parsed (live.uvwLbs). */
  uvwLbs?: number | null;
  /** Display / specs.uvw string (commas + units stripped). */
  uvwRaw?: string | number | null;
  /** Coach type / fuel — towables are N/A (no engine torque rating). */
  rvType?: string | null;
  fuelType?: string | null;
};

export type TorqueToWeightResult = {
  torqueLbFt: number | null;
  uvwLb: number | null;
  /** (torqueLbFt / uvwLb) * 1000, or null on GAP. */
  ratio: number | null;
  stars: TorqueToWeightStars | null;
  gap: boolean;
  /** Towable (trailer / fifth wheel) — N/A, not a motorhome score. */
  na: boolean;
};

const EMPTY = /^[—–\-]$/;

function positiveInt(n: number): number | null {
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
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

/**
 * Parse UVW pounds. Strips commas/units. A weight *range* (two numbers) is
 * unparseable → null (GAP), not an average.
 */
export function parseUvwLb(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return positiveInt(raw);
  const s = String(raw).trim();
  if (!s || EMPTY.test(s) || /^n\/a\b/i.test(s) || /\bgvwr\b/i.test(s)) {
    return null;
  }

  const compact = s.replace(/,/g, "").replace(/lbs?\.?/gi, " ");
  const nums = [...compact.matchAll(/(\d+(?:\.\d+)?)/g)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (nums.length !== 1) return null;
  return Math.round(nums[0]!);
}

export function torqueToWeightRatio(
  torqueLbFt: number,
  uvwLb: number,
): number | null {
  if (!(torqueLbFt > 0) || !(uvwLb > 0)) return null;
  return (torqueLbFt / uvwLb) * 1000;
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

export function starsFromTorqueToWeightRatio(
  ratio: number | null | undefined,
): TorqueToWeightStars | null {
  if (ratio == null || !Number.isFinite(ratio) || ratio < 0) return null;
  if (ratio >= 50) return 5;
  if (ratio >= 30) return 4;
  if (ratio >= 18) return 3;
  if (ratio >= 10) return 2;
  return 1;
}

export function computeTorqueToWeight(
  input: TorqueToWeightInput,
): TorqueToWeightResult {
  const na = isTowableForTorqueRating(input.rvType, input.fuelType);
  if (na) {
    return {
      torqueLbFt: null,
      uvwLb: null,
      ratio: null,
      stars: null,
      gap: true,
      na: true,
    };
  }
  const torqueLbFt =
    positiveInt(input.torqueLbFt ?? 0) ?? parseTorqueLbFt(input.torqueRaw);
  const uvwLb = positiveInt(input.uvwLbs ?? 0) ?? parseUvwLb(input.uvwRaw);
  const ratio =
    torqueLbFt != null && uvwLb != null
      ? torqueToWeightRatio(torqueLbFt, uvwLb)
      : null;
  const stars = starsFromTorqueToWeightRatio(ratio);
  return {
    torqueLbFt,
    uvwLb,
    ratio,
    stars,
    gap: stars == null,
    na: false,
  };
}

/** Integer 1–5 ★ string; GAP when missing. Matches ratingStars() for whole stars. */
export function formatTorqueToWeightStars(
  result: TorqueToWeightResult,
): string {
  if (result.na) return "N/A";
  if (result.gap || result.stars == null) return "GAP";
  return "★".repeat(result.stars) + "☆".repeat(5 - result.stars);
}
