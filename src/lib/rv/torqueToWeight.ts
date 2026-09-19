/**
 * Torque-to-weight rating for the Facts report Ratings section.
 *
 * Weight metric: UVW (unloaded) when available; GVWR only when UVW is
 * missing. GAP if torque is missing or both weights are missing.
 * Prefer numeric powertrainGuard / brochure hard torque when present;
 * else parse specs.torque. Torque is lb-ft only — never horsepower.
 *
 * Ratio: r = (torqueLbFt / weightLb) * 1000  →  lb-ft per 1,000 lb
 *
 * Continuous 1–10 (piecewise-linear on the David envelope):
 *   GAP / N/A  torque missing OR both weights missing OR ≤0 OR towable
 *   r < 10        → [1, 2)
 *   10 ≤ r < 17   → [3, 4)
 *   17 ≤ r < 28   → [4.0, 6.5)   Seneca 800/31000 ≈ 25.8 → ~6.0
 *   28 ≤ r < 45   → [7.0, 9.3)
 *   r ≥ 45        → [8.75, 10]   clamped
 *
 * Bar color (score, not ratio):
 *   red     score < 6.0
 *   yellow  6.0 ≤ score < 7.5
 *   green   score ≥ 7.5
 */

export type TorqueBarColor = "red" | "yellow" | "green";

export type TorqueWeightBasis = "UVW" | "GVWR";

export type TorqueToWeightInput = {
  /** Brochure / powertrainGuard hard torque (lb-ft). Preferred when > 0. */
  torqueLbFt?: number | null;
  /** Display / specs.torque string (may include "lb-ft"). Never HP. */
  torqueRaw?: string | number | null;
  /** Numeric UVW / unloaded pounds when already parsed (live.uvwLbs). */
  uvwLbs?: number | null;
  /** Display / specs.uvw string (commas + units stripped). */
  uvwRaw?: string | number | null;
  /** Numeric GVWR pounds when already parsed (live.gvwrLbs). Fallback. */
  gvwrLbs?: number | null;
  /** Display / specs.gvwr string (commas + units stripped). Fallback. */
  gvwrRaw?: string | number | null;
  /** Coach type / fuel — towables are N/A (no engine torque rating). */
  rvType?: string | null;
  fuelType?: string | null;
};

export type TorqueToWeightResult = {
  torqueLbFt: number | null;
  uvwLb: number | null;
  gvwrLb: number | null;
  /** UVW when present, otherwise GVWR. Null on GAP / N/A. */
  weightLb: number | null;
  weightBasis: TorqueWeightBasis | null;
  /** (torqueLbFt / weightLb) * 1000, or null on GAP. */
  ratio: number | null;
  /** Continuous 1–10, or null on GAP / N/A. */
  score: number | null;
  color: TorqueBarColor | null;
  gap: boolean;
  /** Towable (trailer / fifth wheel) — N/A, not a motorhome score. */
  na: boolean;
};

const EMPTY = /^[—–\-]$/;

function positiveInt(n: number): number | null {
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function clampScore(n: number): number {
  return Math.min(10, Math.max(1, n));
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
 * Parse GVWR pounds. Strips commas/units. A weight *range* (two numbers)
 * or a UVW / unloaded-labeled string is unparseable → null (GAP).
 */
export function parseGvwrLb(
  raw: string | number | null | undefined,
): number | null {
  return parseSingleWeightLb(raw, /\buvw\b|\bunloaded\b/i);
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
 * Envelope: <10 → 1–2; 10–17 → 3–4; 17–28 → 5–6; 28–45 → 7–8; 45+ → 9–10.
 * Interior slopes are set so the must-pass anchors land within ±0.15.
 */
export function scoreFromTorqueToWeightRatio(
  ratio: number | null | undefined,
): number | null {
  if (ratio == null || !Number.isFinite(ratio) || ratio < 0) return null;
  if (ratio < 10) return clampScore(1 + ratio / 10);
  if (ratio < 17) return clampScore(3 + (ratio - 10) / 7);
  if (ratio < 28) return clampScore(4 + ((ratio - 17) / 11) * 2.5);
  if (ratio < 45) return clampScore(7 + ((ratio - 28) / 17) * 2.3);
  return clampScore(8.75 + (ratio - 45) / 5);
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
  ratio: null,
  score: null,
  color: null,
  gap: true,
  na: true,
};

export function computeTorqueToWeight(
  input: TorqueToWeightInput,
): TorqueToWeightResult {
  if (isTowableForTorqueRating(input.rvType, input.fuelType)) {
    return { ...NA_RESULT };
  }
  const torqueLbFt =
    positiveInt(input.torqueLbFt ?? 0) ?? parseTorqueLbFt(input.torqueRaw);
  const uvwLb = positiveInt(input.uvwLbs ?? 0) ?? parseUvwLb(input.uvwRaw);
  const gvwrLb = positiveInt(input.gvwrLbs ?? 0) ?? parseGvwrLb(input.gvwrRaw);
  const weightLb = uvwLb ?? gvwrLb;
  const weightBasis: TorqueWeightBasis | null =
    uvwLb != null ? "UVW" : gvwrLb != null ? "GVWR" : null;
  const ratio =
    torqueLbFt != null && weightLb != null
      ? torqueToWeightRatio(torqueLbFt, weightLb)
      : null;
  const score = scoreFromTorqueToWeightRatio(ratio);
  return {
    torqueLbFt,
    uvwLb,
    gvwrLb,
    weightLb,
    weightBasis,
    ratio,
    score,
    color: barColorFromScore(score),
    gap: score == null,
    na: false,
  };
}

/** Display "X.X/10 · UVW" or "· GVWR"; N/A on towables, GAP when missing. */
export function formatTorqueToWeightScore(
  result: TorqueToWeightResult,
): string {
  if (result.na) return "N/A";
  if (result.gap || result.score == null || result.weightBasis == null) {
    return "GAP";
  }
  return `${result.score.toFixed(1)}/10 · ${result.weightBasis}`;
}
