/**
 * Dated public snapshot of RV Insider *manufacturer* aggregates.
 *
 * This is NOT a live scrape of the ~21k owner reviews. Each row was read
 * from the public manufacturer page on asOf (header score + n, plus the
 * five category averages RV Insider prints on that page).
 *
 * RV Insider categories (when present):
 *   overallQuality, livability, floorplan, drivingTowing, factoryWarranty
 * There is no named Reliability or Customer Satisfaction sub-score.
 *
 * Facts slot map (combined at most once — see ownerReviewRatings.ts):
 *   Quality      ← overallQuality only. Null → GAP (no silent combined).
 *   Reliability  ← not from this seed. Facts uses RvFOX reputation
 *                  (ratingSystem.ts). Do not paint combined here.
 *   Satisfaction ← combined header average, labeled "(combined)".
 * livability / floorplan / drivingTowing stay unused — never relabeled as
 * Reliability or Satisfaction. factoryWarranty is factory support — not
 * RVDA DSI, not owner reliability, not satisfaction — audit only.
 *
 * Do not invent numbers. Do not copy a brand row onto a different make.
 */

export const OWNER_REVIEW_SNAPSHOT_AS_OF = "2026-09-19";

export const OWNER_REVIEW_SOURCE_NAME = "RV Insider manufacturer page";

/** Brand floor before a number is shown. Below → GAP. */
export const OWNER_REVIEW_BRAND_FLOOR = 15;

/** Model floor before a model-grain number is shown. Below → brand or GAP. */
export const OWNER_REVIEW_MODEL_FLOOR = 8;

export type OwnerReviewGrain = "brand" | "model";

export type OwnerReviewSeedRow = {
  /** Canonical display name (catalog make or RV Insider manufacturer). */
  name: string;
  grain: OwnerReviewGrain;
  /** Parent brand when grain is model (unused in v1 — no model rows). */
  brand?: string;
  /** Combined owner-review average printed in the page header. */
  combined: number;
  /** Review count printed next to the header average. */
  n: number;
  /** "Overall quality" category average, when the page prints one. */
  overallQuality: number | null;
  livability: number | null;
  floorplan: number | null;
  drivingTowing: number | null;
  /** Factory warranty/support — not DSI, not shown as satisfaction. */
  factoryWarranty: number | null;
  asOf: string;
  sourceUrl: string;
};

/**
 * Catalog / search aliases → seed `name`.
 * "Thor" is the catalog make for Thor Motor Coach. Do not map Thor Industries.
 */
export const OWNER_REVIEW_BRAND_ALIASES: Record<string, string> = {
  thor: "Thor Motor Coach",
  "thor motor coach": "Thor Motor Coach",
  "thor motorcoach": "Thor Motor Coach",
  entegra: "Entegra Coach",
  "entegra coach": "Entegra Coach",
  "tiffin motorhomes": "Tiffin",
  "tiffin motor homes": "Tiffin",
  coachman: "Coachmen",
  "newmar classic": "Newmar",
  "winnebago classic": "Winnebago",
  "fleetwood classic": "Fleetwood",
};

const AS_OF = OWNER_REVIEW_SNAPSHOT_AS_OF;

/**
 * High-volume demo brands. Header n is the sample — not the "ratings and
 * reviews" list count RV Insider sometimes prints below (that list mixes
 * other makes).
 */
export const OWNER_REVIEW_BRAND_SEED: OwnerReviewSeedRow[] = [
  {
    name: "Forest River",
    grain: "brand",
    combined: 3.6,
    n: 3156,
    overallQuality: 3.1,
    livability: 3.7,
    floorplan: 4.3,
    drivingTowing: 4.1,
    factoryWarranty: 2.7,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Forest-River-RV-Reviews?make=Forest+River",
  },
  {
    name: "Keystone",
    grain: "brand",
    combined: 3.5,
    n: 2161,
    overallQuality: 3.0,
    livability: 3.8,
    floorplan: 4.3,
    drivingTowing: 4.1,
    factoryWarranty: 2.5,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Keystone-RV-Reviews?make=Keystone",
  },
  {
    name: "Jayco",
    grain: "brand",
    combined: 3.7,
    n: 1321,
    overallQuality: 3.3,
    livability: 3.9,
    floorplan: 4.3,
    drivingTowing: 4.2,
    factoryWarranty: 2.9,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Jayco-RV-Reviews?make=Jayco",
  },
  {
    name: "Thor Motor Coach",
    grain: "brand",
    combined: 3.4,
    n: 1225,
    overallQuality: 2.9,
    livability: 3.7,
    floorplan: 4.1,
    drivingTowing: 3.9,
    factoryWarranty: 2.6,
    asOf: AS_OF,
    sourceUrl:
      "https://www.rvinsider.com/Thor-Motor-Coach-RV-Reviews?make=Thor+Motor+Coach",
  },
  {
    name: "Grand Design",
    grain: "brand",
    combined: 3.8,
    n: 950,
    overallQuality: 3.4,
    livability: 3.9,
    floorplan: 4.5,
    drivingTowing: 4.2,
    factoryWarranty: 3.1,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Grand-Design-RV-Reviews?make=Grand+Design",
  },
  {
    name: "Winnebago",
    grain: "brand",
    combined: 4.1,
    n: 1235,
    overallQuality: 4.0,
    livability: 4.3,
    floorplan: 4.6,
    drivingTowing: 4.5,
    factoryWarranty: 3.3,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Winnebago-RV-Reviews?make=Winnebago",
  },
  {
    name: "Coachmen",
    grain: "brand",
    combined: 3.8,
    n: 838,
    overallQuality: 3.5,
    livability: 4.1,
    floorplan: 4.4,
    drivingTowing: 4.3,
    factoryWarranty: 3.0,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Coachmen-RV-Reviews?make=Coachmen",
  },
  {
    name: "Heartland",
    grain: "brand",
    combined: 3.2,
    n: 963,
    overallQuality: 2.7,
    livability: 3.4,
    floorplan: 4.1,
    drivingTowing: 3.8,
    factoryWarranty: 2.3,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Heartland-RV-Reviews?make=Heartland",
  },
  {
    name: "Fleetwood",
    grain: "brand",
    combined: 4.1,
    n: 801,
    overallQuality: 4.2,
    livability: 4.6,
    floorplan: 4.6,
    drivingTowing: 4.5,
    factoryWarranty: 2.8,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Fleetwood-RV-Reviews?make=Fleetwood",
  },
  {
    name: "Tiffin",
    grain: "brand",
    combined: 4.3,
    n: 588,
    overallQuality: 4.4,
    livability: 4.6,
    floorplan: 4.7,
    drivingTowing: 4.7,
    factoryWarranty: 3.4,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Tiffin-RV-Reviews?make=Tiffin",
  },
  {
    name: "Entegra Coach",
    grain: "brand",
    combined: 4.1,
    n: 162,
    overallQuality: 3.8,
    livability: 4.2,
    floorplan: 4.5,
    drivingTowing: 4.5,
    factoryWarranty: 3.5,
    asOf: AS_OF,
    sourceUrl:
      "https://www.rvinsider.com/Entegra-Coach-RV-Reviews?make=Entegra+Coach",
  },
  {
    name: "Newmar",
    grain: "brand",
    combined: 4.3,
    n: 389,
    overallQuality: 4.4,
    livability: 4.6,
    floorplan: 4.6,
    drivingTowing: 4.6,
    factoryWarranty: 3.4,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Newmar-RV-Reviews?make=Newmar",
  },
  {
    name: "Airstream",
    grain: "brand",
    combined: 4.3,
    n: 214,
    overallQuality: 4.2,
    livability: 4.2,
    floorplan: 4.6,
    drivingTowing: 4.7,
    factoryWarranty: 3.6,
    asOf: AS_OF,
    sourceUrl: "https://www.rvinsider.com/Airstream-RV-Reviews?make=Airstream",
  },
];

/** v1: no model-grain rows. Thin model pages stay brand-level or GAP. */
export const OWNER_REVIEW_MODEL_SEED: OwnerReviewSeedRow[] = [];
