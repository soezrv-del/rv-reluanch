/**
 * Facts report Ratings rows other than torque-to-weight.
 *
 * Quality / Reliability / Customer satisfaction come from the dated
 * RV Insider owner-review snapshot (see ownerReviewRatings.ts).
 * Missing / below sample floor / unknown brand → GAP.
 *
 * Do not invent from warranty years, NHTSA counts, mock reviews,
 * RvFOX editorial scores, Grok ratingEstimate, or ownerSentiment prose.
 * Factory warranty is not Reliability and is not "Dealer support index".
 */

import {
  formatOwnerReviewScore,
  resolveOwnerReviewRatings,
  type OwnerReviewRatings,
  type OwnerReviewSlot,
} from "./ownerReviewRatings.ts";

export type GroundedStars = 1 | 2 | 3 | 4 | 5;

export type GroundedScore = number | null | undefined;

export type ReportRatingsInput = {
  make?: string | null;
  model?: string | null;
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

export function mapReportRatings(input: ReportRatingsInput): ReportRatings {
  const resolved: OwnerReviewRatings = resolveOwnerReviewRatings(
    input.make,
    input.model,
  );
  return {
    quality: withStars(resolved.quality),
    reliability: withStars(resolved.reliability),
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
