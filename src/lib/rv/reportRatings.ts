/**
 * Facts report Ratings rows other than torque-to-weight.
 *
 * Maps existing grounded 1–5 numeric fields → integer stars.
 * Missing / unparseable / out of range → GAP.
 *
 * No invented bands. Warranty years, NHTSA recall counts, mock reviews,
 * ownerSentiment prose, and reliabilitySummary prose are not scores.
 *
 * Grounded fields on the live dossier today:
 *   quality              live.ratingEstimate (1–5) when present
 *   reliability          none (narrative only) → GAP
 *   customerSatisfaction none (ownerSentiment is prose) → GAP
 */

export type GroundedStars = 1 | 2 | 3 | 4 | 5;

export type GroundedScore = number | null | undefined;

export type ReportRatingsInput = {
  /** Live dossier ratingEstimate — only existing numeric quality-ish score. */
  qualityScore?: GroundedScore;
  /** No numeric reliability field on catalog / live dossier today. */
  reliabilityScore?: GroundedScore;
  /** No numeric satisfaction field (ownerSentiment is prose). */
  satisfactionScore?: GroundedScore;
};

export type ReportRatings = {
  quality: GroundedStars | null;
  reliability: GroundedStars | null;
  customerSatisfaction: GroundedStars | null;
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

export function mapReportRatings(input: ReportRatingsInput): ReportRatings {
  return {
    quality: groundedStars(input.qualityScore),
    reliability: groundedStars(input.reliabilityScore),
    customerSatisfaction: groundedStars(input.satisfactionScore),
  };
}

export function formatStarsOrGap(stars: GroundedStars | null): string {
  if (stars == null) return "GAP";
  return "★".repeat(stars) + "☆".repeat(5 - stars);
}
