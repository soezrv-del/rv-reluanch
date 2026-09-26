/**
 * Facts torque-to-weight rating. Pure — no imports.
 *
 * ratio = torque (lb-ft) / (weight lb / 1000)
 * weight = published UVW, else published dry weight. Never GVWR,
 * never a tiered estimate, never a guessed midpoint.
 * Missing torque, or missing both weights → GAP and no bar.
 *
 * GREAT is the 90th percentile (Excel PERCENTILE.INC) of real catalog
 * ratios. GOOD = 0.75 × GREAT. Bar fill = clamp(ratio / GREAT, 0, 1).
 *
 * Census 2026-09-26, main 2894e63, sources src/lib/rv/rvData.ts and
 * src/lib/rv/floorplanSpecs.ts (series uvwLbs, OEM UVW pins, brochure
 * floorplan uvwLbs). The catalog has no separate dry-weight column;
 * brochure dry weights that were pinned are already stored as uvwLbs.
 * No GVWR and no estimated weight entered the sample.
 * n = 77 distinct make / model / floorplan / torque / UVW pairs
 * (21 models). PERCENTILE.INC index = 0.9 × (77 − 1) = 68.4, between
 * Thor Vegas 24.1 at 420/10500 = 40 and Newmar Mountain Aire 3823 at
 * 1695/41000 = 41.34146341463415.
 * GREAT = 40 × 0.6 + 41.34146341463415 × 0.4 = 40.53658536585367.
 * Ratio range in that sample: min 20.48140043763676 (Newmar Bay Star
 * 3811, 468/22850) to max 52.23798526338942 (Grand Design Lineage
 * Series F 31ZW, 950/18186).
 * GAP: 548 of 569 catalog models have no real pair (missing torque
 * only 52, missing UVW/dry weight only 188, missing both 308).
 */

/** 90th percentile of published catalog ratios (lb-ft per 1,000 lb). */
export const TORQUE_WEIGHT_GREAT = 40.53658536585367;

/** 0.75 × GREAT. Green bar starts here. */
export const TORQUE_WEIGHT_GOOD = TORQUE_WEIGHT_GREAT * 0.75;

/** Single label for whichever published weight the ratio used. */
export const TORQUE_WEIGHT_RATING_WEIGHT_LABEL = "UVW / dry weight";

const COLOR_GREEN = "var(--color-green)";
const COLOR_YELLOW = "var(--color-amber)";
const COLOR_RED = "var(--color-ruby)";

/** Theme solids: --color-amber #e0a04a, --color-ruby #d42535. */
const YELLOW_RGB = [0xe0, 0xa0, 0x4a] as const;
const RED_RGB = [0xd4, 0x25, 0x35] as const;

export type TorqueWeightKind = "uvw" | "dry";

export type TorqueWeightRatingInput = {
  torqueLbFt?: number | null;
  uvwLbs?: number | null;
  dryWeightLbs?: number | null;
};

export type TorqueWeightRating = {
  gap: boolean;
  ratio: number | null;
  /** clamp(ratio / GREAT, 0, 1). Null on GAP — do not draw a bar. */
  fill: number | null;
  color: string | null;
  weightLb: number | null;
  weightKind: TorqueWeightKind | null;
};

function positive(n: number | null | undefined): number | null {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  return n;
}

/** Bar fill. Values above GREAT clamp to 1. Non-positive ratios clamp to 0. */
export function torqueWeightRatingFill(ratio: number): number {
  if (!Number.isFinite(ratio) || ratio <= 0) return 0;
  const fill = ratio / TORQUE_WEIGHT_GREAT;
  if (fill <= 0) return 0;
  if (fill >= 1) return 1;
  return fill;
}

/**
 * Green at fill ≥ 0.75. Yellow on [0.50, 0.75). Linear yellow→red on
 * (0.25, 0.50). Solid red at and below 0.25 (the blend's red end).
 */
export function torqueWeightRatingColor(fill: number): string {
  if (!Number.isFinite(fill) || fill <= 0.25) return COLOR_RED;
  if (fill >= 0.75) return COLOR_GREEN;
  if (fill >= 0.5) return COLOR_YELLOW;
  const t = (0.5 - fill) / 0.25;
  const channels = YELLOW_RGB.map((channel, i) =>
    Math.round(channel + (RED_RGB[i]! - channel) * t),
  );
  return `rgb(${channels[0]}, ${channels[1]}, ${channels[2]})`;
}

export function rateTorqueToWeight(
  input: TorqueWeightRatingInput,
): TorqueWeightRating {
  const torque = positive(input.torqueLbFt);
  const uvw = positive(input.uvwLbs);
  const dry = positive(input.dryWeightLbs);
  const weightLb = uvw ?? dry;
  const weightKind: TorqueWeightKind | null =
    uvw != null ? "uvw" : dry != null ? "dry" : null;

  if (torque == null || weightLb == null) {
    return {
      gap: true,
      ratio: null,
      fill: null,
      color: null,
      weightLb,
      weightKind,
    };
  }

  const ratio = torque / (weightLb / 1000);
  const fill = torqueWeightRatingFill(ratio);
  return {
    gap: false,
    ratio,
    fill,
    color: torqueWeightRatingColor(fill),
    weightLb,
    weightKind,
  };
}

export function formatTorqueWeightRatingRatio(
  rating: TorqueWeightRating,
): string {
  if (rating.gap || rating.ratio == null) return "GAP";
  return rating.ratio.toFixed(1);
}

export function formatTorqueWeightRatingWeight(
  rating: TorqueWeightRating,
): string {
  if (rating.weightLb == null) return "GAP";
  return `${Math.round(rating.weightLb).toLocaleString("en-US")} lbs`;
}
