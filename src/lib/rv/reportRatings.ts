/**
 * Facts report Ratings rows other than torque-to-weight.
 *
 * Quality / Customer satisfaction come from the dated RV Insider
 * owner-review snapshot (see ownerReviewRatings.ts).
 * Quality = overallQuality or GAP. Satisfaction = combined, painted once.
 * Missing / below sample floor / unknown Insider brand → GAP for Q/S.
 *
 * Reliability comes from the RvFOX editorial reputation tables in
 * ratingSystem.ts (manufacturer base + model tier + year band when year
 * is passed). Known make → 1–5 score. Unknown make → GAP — never paint
 * the silent UNKNOWN_MAKE_BASE 3.5 as if it were reputation.
 *
 * Do not invent Reliability from warranty years, NHTSA counts, mock
 * reviews, livability / floorplan / drivingTowing, combined (again),
 * Grok ratingEstimate, or ownerSentiment prose.
 * Factory warranty is not Reliability and is not "Dealer support index".
 */

import {
  formatOwnerReviewScore,
  resolveOwnerReviewRatings,
  type OwnerReviewRatings,
  type OwnerReviewSlot,
} from "./ownerReviewRatings.ts";
import {
  getRatingMetadata,
  isKnownManufacturer,
} from "./ratingSystem.ts";

export type GroundedStars = 1 | 2 | 3 | 4 | 5;

export type GroundedScore = number | null | undefined;

export type ReportRatingsInput = {
  make?: string | null;
  model?: string | null;
  /** Wizard / report year. Empty or omitted → brand + model tier only. */
  year?: string | null;
};

export type ReportRatingSlot = OwnerReviewSlot & {
  /** Nearest integer star for compact display. Null on GAP. */
  stars: GroundedStars | null;
};

export type ReportRatings = {
  quality: ReportRatingSlot;
  reliability: ReportRatingSlot;
  customerSatisfaction: ReportRatingSlot;
  snapshotAsOf: string | null;
  matchedName: string | null;
};

/**
 * Display conversion only: an existing 1–5 score → nearest integer star.
 * Does not invent a scale from warranty, recalls, or narrative.
 */
export function groundedStars(score: GroundedScore): GroundedStars | null {
  if (score == null || typeof score !== "number") return null;
  if (!Number.isFinite(score) || score <= 0 || score > 5) return null;
  const n = Math.round(score);
  if (n < 1 || n > 5) return null;
  return n as GroundedStars;
}

function withStars(slot: OwnerReviewSlot): ReportRatingSlot {
  return { ...slot, stars: groundedStars(slot.score) };
}

const GAP_REPUTATION: OwnerReviewSlot = {
  score: null,
  grain: null,
  basis: null,
  sampleN: null,
  caption: null,
  asOf: null,
  sourceUrl: null,
};

/**
 * RvFOX editorial reputation for the Reliability slot.
 * Unknown make → GAP. Do not surface UNKNOWN_MAKE_BASE.
 */
export function reputationReliability(
  make?: string | null,
  model?: string | null,
  year?: string | null,
): OwnerReviewSlot {
  const makeStr = make?.trim() ?? "";
  if (!makeStr || !isKnownManufacturer(makeStr)) return GAP_REPUTATION;

  const yearStr = year?.trim() ?? "";
  const meta = getRatingMetadata(makeStr, model?.trim() ?? "", yearStr);
  if (!meta.knownMake) return GAP_REPUTATION;

  const caption =
    meta.tierMatched && meta.matchedModelKey
      ? `RvFOX reputation · ${meta.matchedModelKey} · ${meta.tierLabel}`
      : "RvFOX reputation · brand";

  return {
    score: meta.score,
    grain: meta.tierMatched ? "model" : "brand",
    basis: "reputation",
    sampleN: null,
    caption,
    asOf: null,
    sourceUrl: null,
  };
}

export function mapReportRatings(input: ReportRatingsInput): ReportRatings {
  const resolved: OwnerReviewRatings = resolveOwnerReviewRatings(
    input.make,
    input.model,
  );
  return {
    quality: withStars(resolved.quality),
    reliability: withStars(
      reputationReliability(input.make, input.model, input.year),
    ),
    customerSatisfaction: withStars(resolved.customerSatisfaction),
    snapshotAsOf: resolved.snapshotAsOf,
    matchedName: resolved.matchedName,
  };
}

export function formatStarsOrGap(stars: GroundedStars | null): string {
  if (stars == null) return "GAP";
  return "★".repeat(stars) + "☆".repeat(5 - stars);
}

export { formatOwnerReviewScore };
export { OWNER_REVIEW_FOOTER } from "./ownerReviewRatings.ts";
