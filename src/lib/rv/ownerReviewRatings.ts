/**
 * Facts Ratings — owner-review Quality / Reliability / Satisfaction.
 *
 * Primary source: dated RV Insider manufacturer aggregates (seed snapshot).
 * Not a live scrape. Not J.D. Power. Not Consumer Reports. Not RvFOX editorial.
 *
 * Mapping (honest):
 *   Quality      ← Overall quality when that category exists; else combined
 *                  with an "Owner reviews (combined)" label.
 *   Reliability  ← no Reliability category on RV Insider → combined mapped
 *                  into the slot with "Owner reviews (combined)".
 *   Satisfaction ← combined owner-review average, labeled "Owner reviews".
 *
 * Sample floors: brand n≥15, model n≥8. Below → GAP.
 * Brand score on a model is labeled "brand-level" — never silent.
 */

import {
  OWNER_REVIEW_BRAND_ALIASES,
  OWNER_REVIEW_BRAND_FLOOR,
  OWNER_REVIEW_BRAND_SEED,
  OWNER_REVIEW_MODEL_FLOOR,
  OWNER_REVIEW_MODEL_SEED,
  OWNER_REVIEW_SNAPSHOT_AS_OF,
  OWNER_REVIEW_SOURCE_NAME,
  type OwnerReviewGrain,
  type OwnerReviewSeedRow,
} from "./ownerReviewRatings.seed.ts";

export {
  OWNER_REVIEW_BRAND_FLOOR,
  OWNER_REVIEW_MODEL_FLOOR,
  OWNER_REVIEW_SNAPSHOT_AS_OF,
  OWNER_REVIEW_SOURCE_NAME,
};

export type OwnerReviewBasis = "overall_quality" | "combined";

export type OwnerReviewSlot = {
  score: number | null;
  grain: OwnerReviewGrain | null;
  basis: OwnerReviewBasis | null;
  sampleN: number | null;
  /** Visible source cue. Always includes "Owner reviews". */
  caption: string | null;
  asOf: string | null;
  sourceUrl: string | null;
};

export type OwnerReviewRatings = {
  quality: OwnerReviewSlot;
  reliability: OwnerReviewSlot;
  customerSatisfaction: OwnerReviewSlot;
  snapshotAsOf: string | null;
  sourceName: typeof OWNER_REVIEW_SOURCE_NAME;
  matchedName: string | null;
};

const GAP_SLOT: OwnerReviewSlot = {
  score: null,
  grain: null,
  basis: null,
  sampleN: null,
  caption: null,
  asOf: null,
  sourceUrl: null,
};

export const OWNER_REVIEW_FOOTER =
  "Owner reviews are a dated snapshot of public RV Insider manufacturer averages — not a live scrape of every review. GAP below n≥15 brand or n≥8 model. Brand-level when the model sample is thin. Torque-to-Weight is separate hard math.";

export function normOwnerReviewName(s: string): string {
  return s
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalBrandName(make: string): string | null {
  const want = normOwnerReviewName(make);
  if (!want) return null;
  if (OWNER_REVIEW_BRAND_ALIASES[want]) return OWNER_REVIEW_BRAND_ALIASES[want]!;
  for (const row of OWNER_REVIEW_BRAND_SEED) {
    if (normOwnerReviewName(row.name) === want) return row.name;
  }
  return null;
}

export function lookupOwnerReviewBrand(
  make: string | null | undefined,
): OwnerReviewSeedRow | null {
  if (!make) return null;
  const name = canonicalBrandName(make);
  if (!name) return null;
  return (
    OWNER_REVIEW_BRAND_SEED.find(
      (row) => normOwnerReviewName(row.name) === normOwnerReviewName(name),
    ) ?? null
  );
}

export function lookupOwnerReviewModel(
  make: string | null | undefined,
  model: string | null | undefined,
): OwnerReviewSeedRow | null {
  if (!make || !model) return null;
  const brand = canonicalBrandName(make);
  if (!brand) return null;
  const modelNorm = normOwnerReviewName(model);
  if (!modelNorm) return null;
  return (
    OWNER_REVIEW_MODEL_SEED.find((row) => {
      if (row.grain !== "model") return false;
      if (normOwnerReviewName(row.brand ?? row.name) !== normOwnerReviewName(brand)) {
        return false;
      }
      return normOwnerReviewName(row.name) === modelNorm;
    }) ?? null
  );
}

function meetsFloor(row: OwnerReviewSeedRow): boolean {
  if (row.grain === "model") return row.n >= OWNER_REVIEW_MODEL_FLOOR;
  return row.n >= OWNER_REVIEW_BRAND_FLOOR;
}

function grainLabel(grain: OwnerReviewGrain): string {
  return grain === "brand" ? "brand-level" : "model-level";
}

function captionFor(
  basis: OwnerReviewBasis,
  grain: OwnerReviewGrain,
  kind: "quality" | "reliability" | "satisfaction",
): string {
  const grainBit = grainLabel(grain);
  if (kind === "quality" && basis === "overall_quality") {
    return `Owner reviews · overall quality · ${grainBit}`;
  }
  if (kind === "satisfaction" && basis === "combined") {
    return `Owner reviews · ${grainBit}`;
  }
  return `Owner reviews (combined) · ${grainBit}`;
}

function slotFrom(
  row: OwnerReviewSeedRow,
  score: number,
  basis: OwnerReviewBasis,
  kind: "quality" | "reliability" | "satisfaction",
): OwnerReviewSlot {
  return {
    score,
    grain: row.grain,
    basis,
    sampleN: row.n,
    caption: captionFor(basis, row.grain, kind),
    asOf: row.asOf,
    sourceUrl: row.sourceUrl,
  };
}

function pickRow(
  make: string | null | undefined,
  model: string | null | undefined,
): OwnerReviewSeedRow | null {
  const modelRow = lookupOwnerReviewModel(make, model);
  if (modelRow && meetsFloor(modelRow)) return modelRow;
  const brandRow = lookupOwnerReviewBrand(make);
  if (brandRow && meetsFloor(brandRow)) return brandRow;
  return null;
}

export function resolveOwnerReviewRatings(
  make: string | null | undefined,
  model?: string | null,
): OwnerReviewRatings {
  const row = pickRow(make, model);
  if (!row) {
    return {
      quality: GAP_SLOT,
      reliability: GAP_SLOT,
      customerSatisfaction: GAP_SLOT,
      snapshotAsOf: null,
      sourceName: OWNER_REVIEW_SOURCE_NAME,
      matchedName: null,
    };
  }

  const qualityScore = row.overallQuality;
  const qualityBasis: OwnerReviewBasis =
    qualityScore != null ? "overall_quality" : "combined";
  const qualityValue = qualityScore ?? row.combined;

  return {
    quality: slotFrom(row, qualityValue, qualityBasis, "quality"),
    reliability: slotFrom(row, row.combined, "combined", "reliability"),
    customerSatisfaction: slotFrom(row, row.combined, "combined", "satisfaction"),
    snapshotAsOf: row.asOf,
    sourceName: OWNER_REVIEW_SOURCE_NAME,
    matchedName: row.name,
  };
}

export function formatOwnerReviewScore(score: number | null): string {
  if (score == null || !Number.isFinite(score)) return "GAP";
  return score.toFixed(1);
}
