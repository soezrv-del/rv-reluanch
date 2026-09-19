/**
 * Torque-to-weight rating for the Facts report Ratings section.
 *
 * Weight metric: published OEM **GVWR only**. Never prefer UVW, never
 * use estimated UVW (weightForFloorplan mid×0.82). GAP if torque is
 * missing or GVWR is missing — do not invent a weight. Prefer numeric
 * powertrainGuard / brochure hard torque when present; else parse
 * specs.torque. Torque is lb-ft only — never horsepower.
 *
 * Range-only GVWR (display band / weightRange [lo,hi], e.g.
 * "39,500–44,005 lbs"): for **TTW scoring only**, use the **HIGH**
 * number. Heavier published weight → lower (more conservative) score.
 * A single published pin (oem.gvwrLbs / findOemGvwrLbs / snap.gvwrLbs /
 * live.gvwrLbs) still wins over the range. Do not invent UVW.
 *
 * Ratio: r = (torqueLbFt / gvwrLb) * 1000  →  lb-ft per 1,000 lb GVWR
 *
 * Continuous 1–10 (piecewise-linear on the David envelope):
 *   GAP / N/A  torque missing OR GVWR missing OR ≤0 OR towable
 *   r < 10        → [1, 2)
 *   10 ≤ r < 17   → [3, 4)
 *   17 ≤ r < 28   → [4.0, 6.5)   Seneca 800/31000 ≈ 25.8 → ~6.0
 *   28 ≤ r < 45   → [7.0, 9.3)
 *   r ≥ 45        → [8.75, 10]   clamped
 *
 * Must-pass GVWR anchors:
 *   Precept 31UL  468 / 22,000 → ~5.0
 *   Precept 36    468 / 24,000 → ~4.6
 *   Seneca        800 / 31,000 → ~6.0
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
  /** Numeric UVW / unloaded pounds — display/honesty only, never the TTW basis. */
  uvwLbs?: number | null;
  /** Display / specs.uvw string — display/honesty only, never the TTW basis. */
  uvwRaw?: string | number | null;
  /** Numeric published OEM GVWR pounds (live.gvwrLbs). Required for a score. */
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
  /** Coach type / fuel — towables are N/A (no engine torque rating). */
  rvType?: string | null;
  fuelType?: string | null;
};

export type TorqueToWeightResult = {
  torqueLbFt: number | null;
  uvwLb: number | null;
  gvwrLb: number | null;
  /** GVWR pounds used for the score. Null on GAP / N/A. */
  weightLb: number | null;
  /** Always "GVWR" when scored. Null on GAP / N/A — never "UVW". */
  weightBasis: TorqueWeightBasis | null;
  /** (torqueLbFt / gvwrLb) * 1000, or null on GAP. */
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
  // Published numeric pin wins. Range string / weightRange → high end only.
  const gvwrLb =
    positiveInt(input.gvwrLbs ?? 0) ??
    parseGvwrLb(input.gvwrRaw) ??
    parseGvwrLb(input.weightRange);
  // GVWR-only scoring. UVW is retained for honesty/display — never the basis.
  const weightLb = gvwrLb;
  const weightBasis: TorqueWeightBasis | null = gvwrLb != null ? "GVWR" : null;
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

/** Display "X.X/10 · GVWR"; N/A on towables, GAP when torque or GVWR missing. */
export function formatTorqueToWeightScore(
  result: TorqueToWeightResult,
): string {
  if (result.na) return "N/A";
  if (result.gap || result.score == null || result.weightBasis == null) {
    return "GAP";
  }
  return `${result.score.toFixed(1)}/10 · ${result.weightBasis}`;
}
