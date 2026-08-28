import type { RVSpec } from "./rvData";
import type { MarketEstimate } from "./catalog";

/** Stable-looking report id (not a secret) */
export function buildReportId(year: string, make: string, model: string): string {
  const raw = `${year}|${make}|${model}|${Date.now().toString(36)}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 33 + raw.charCodeAt(i)) >>> 0;
  return `RVF-${h.toString(36).toUpperCase().slice(0, 8)}`;
}

export type SubRatings = {
  overall: number;
  reliability: number;
  comfort: number;
  features: number;
  value: number;
  reviewCount: number;
  satisfactionPct: number;
};

export function subRatingsFor(
  overall: number,
  year: string,
  make: string,
  model: string,
): SubRatings {
  const seed =
    (parseInt(year, 10) || 2020) * 13 + make.length * 7 + model.length * 3;
  const j = (n: number) => {
    const t = ((seed * (n + 3)) % 17) / 100;
    return Math.min(5, Math.max(3.2, Math.round((overall + t - 0.08) * 10) / 10));
  };
  const reliability = j(1);
  const comfort = j(2);
  const features = j(3);
  const value = j(4);
  const reviewCount = 180 + ((seed * 17) % 420);
  const satisfactionPct = Math.round(50 + overall * 8 + (seed % 7));
  return {
    overall,
    reliability,
    comfort,
    features,
    value,
    reviewCount,
    satisfactionPct: Math.min(96, satisfactionPct),
  };
}

export type ValueFactor = { label: string; positive: boolean };

export function valueFactors(
  market: MarketEstimate,
  rating: number,
  recallCount: number,
  warrantyYears?: number,
): ValueFactor[] {
  const pos: ValueFactor[] = [];
  const neg: ValueFactor[] = [];
  if (rating >= 4.3) pos.push({ label: `High owner rating ${rating.toFixed(1)}/5.0`, positive: true });
  if (warrantyYears && warrantyYears >= 2)
    pos.push({ label: `${warrantyYears}-year structural warranty`, positive: true });
  if (market.ageYears <= 3) pos.push({ label: "Late-model used inventory", positive: true });
  if (market.ageYears >= 12) pos.push({ label: "Age-driven depreciation", positive: true });

  if (recallCount > 0)
    neg.push({
      label: `${recallCount} active NHTSA recall${recallCount === 1 ? "" : "s"}`,
      positive: false,
    });
  if (market.ageYears >= 10) neg.push({ label: "Older coach — inspect tires & seals", positive: false });

  return [...pos.slice(0, 2), ...neg.slice(0, 2)];
}

export const BUYER_TIPS = [
  "Always inspect plumbing and water systems for leaks before purchasing",
  "Check roof seams and seals annually to prevent water damage",
  "Maintain proper tire pressure and inspect tires before each trip (replace at ~7 years)",
  "Test all appliances and systems during pre-purchase inspection (PDI)",
  "Keep detailed maintenance records to preserve resale value",
  "Verify open recalls at nhtsa.gov and ask for dealer repair documentation",
] as const;

export type SampleReview = {
  name: string;
  location: string;
  when: string;
  verified: boolean;
  stars: number;
  title: string;
  body: string;
};

/** Lightweight synthetic samples for report polish (not live forums). */
export function sampleReviews(
  make: string,
  model: string,
  rating: number,
): SampleReview[] {
  const base = Math.max(3, Math.min(5, Math.round(rating)));
  return [
    {
      name: "Gary & Linda T.",
      location: "Scottsdale, AZ",
      when: "May 2026",
      verified: true,
      stars: Math.min(5, base + 0),
      title: `${make} quality lives up to the reputation`,
      body: `We spent months comparing ${model} floorplans. Build feel, ride quality, and service network sealed it. Always get a thorough PDI — small fixes early beat big ones later.`,
    },
    {
      name: "Robert & Sue M.",
      location: "Naples, FL",
      when: "Feb 2026",
      verified: true,
      stars: Math.min(5, base),
      title: "Solid full-time candidate",
      body: `Miles of interstate with zero major drama. Cabinets stay quiet, systems behave, and dealers who know the brand make ownership easier. Fuel economy is what it is for this class.`,
    },
    {
      name: "Tom K.",
      location: "Bend, OR",
      when: "Nov 2025",
      verified: true,
      stars: Math.max(3, base - 1),
      title: "Minor PDI issues, good warranty support",
      body: `Delivery quirks got sorted quickly under warranty. Once sorted, the coach has been reliable for seasonal travel. Budget for tire age and roof seals on any used unit.`,
    },
  ];
}

export function formatLengthRange(spec: RVSpec): string {
  const [a, b] = spec.lengthRange;
  if (a === b) return `${a} ft`;
  return `${a}–${b} ft`;
}

export function formatWeightRange(spec: RVSpec): string {
  const [a, b] = spec.weightRange;
  const f = (n: number) => n.toLocaleString("en-US");
  if (a === b) return `${f(a)} lbs`;
  return `${f(a)}–${f(b)} lbs`;
}
