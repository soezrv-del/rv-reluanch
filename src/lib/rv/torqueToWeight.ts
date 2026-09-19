/**
 * Torque-to-weight rating for the Facts report Ratings section.
 *
 * Weight metric: GVWR in pounds — never UVW (often unpublished).
 * Prefer numeric powertrainGuard / brochure hard torque when present;
 * else parse specs.torque. Parse GVWR from specs.gvwr / gvwrLbs
 * (strip commas/units). Torque is lb-ft only — never horsepower.
 *
 * Ratio: r = (torqueLbFt / gvwrLb) * 1000  →  lb-ft per 1,000 lb GVWR
 *
 * Motorhome bands (half-open):
 *   GAP / N/A  torque missing OR gvwr missing OR ≤0 OR towable
 *   1★  [0, 10)
 *   2★  [10, 15)
 *   3★  [15, 20)
 *   4★  [20, 30)
 *   5★  [30, ∞)
 */

export type TorqueToWeightStars = 1 | 2 | 3 | 4 | 5;

export type TorqueToWeightInput = {
  /** Brochure / powertrainGuard hard torque (lb-ft). Preferred when > 0. */
  torqueLbFt?: number | null;
  /** Display / specs.torque string (may include "lb-ft"). Never HP. */
  torqueRaw?: string | number | null;
  /** Numeric GVWR pounds when already parsed (live.gvwrLbs). */
  gvwrLbs?: number | null;
  /** Display / specs.gvwr string (commas + units stripped). */
  gvwrRaw?: string | number | null;
  /** Coach type / fuel — towables are N/A (no engine torque rating). */
  rvType?: string | null;
  fuelType?: string | null;
};

export type TorqueToWeightResult = {
  torqueLbFt: number | null;
  gvwrLb: number | null;
  /** (torqueLbFt / gvwrLb) * 1000, or null on GAP. */
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
 * Parse GVWR pounds. Strips commas/units. A weight *range* (two numbers)
 * or a UVW-labeled string is unparseable → null (GAP).
 */
export function parseGvwrLb(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  if (typeof raw === "number") return positiveInt(raw);
  const s = String(raw).trim();
  if (!s || EMPTY.test(s) || /^n\/a\b/i.test(s) || /\buvw\b/i.test(s)) {
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
  gvwrLb: number,
): number | null {
  if (!(torqueLbFt > 0) || !(gvwrLb > 0)) return null;
  return (torqueLbFt / gvwrLb) * 1000;
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
  if (ratio >= 30) return 5;
  if (ratio >= 20) return 4;
  if (ratio >= 15) return 3;
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
      gvwrLb: null,
      ratio: null,
      stars: null,
      gap: true,
      na: true,
    };
  }
  const torqueLbFt =
    positiveInt(input.torqueLbFt ?? 0) ?? parseTorqueLbFt(input.torqueRaw);
  const gvwrLb = positiveInt(input.gvwrLbs ?? 0) ?? parseGvwrLb(input.gvwrRaw);
  const ratio =
    torqueLbFt != null && gvwrLb != null
      ? torqueToWeightRatio(torqueLbFt, gvwrLb)
      : null;
  const stars = starsFromTorqueToWeightRatio(ratio);
  return {
    torqueLbFt,
    gvwrLb,
    ratio,
    stars,
    gap: stars == null,
    na: false,
  };
}

/** Integer 1–5 ★ string; N/A on towables, GAP when missing. */
export function formatTorqueToWeightStars(
  result: TorqueToWeightResult,
): string {
  if (result.na) return "N/A";
  if (result.gap || result.stars == null) return "GAP";
  return "★".repeat(result.stars) + "☆".repeat(5 - result.stars);
}
