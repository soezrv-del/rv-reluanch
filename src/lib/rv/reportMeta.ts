import type { RVSpec } from "./rvTypes";
import type { MarketEstimate } from "./catalog";

/** Stable-looking report id (not a secret) */
export function buildReportId(year: string, make: string, model: string): string {
  const raw = `${year}|${make}|${model}|${Date.now().toString(36)}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 33 + raw.charCodeAt(i)) >>> 0;
  return `RVF-${h.toString(36).toUpperCase().slice(0, 8)}`;
}

// subRatingsFor / sampleReviews removed — they invented reviewCount,
// satisfactionPct, and fake named owners. Do not reintroduce.

export type ValueFactor = { label: string; positive: boolean };

export function valueFactors(
  market: MarketEstimate,
  rating: number,
  recallCount: number,
  warrantyYears?: number,
): ValueFactor[] {
  const pos: ValueFactor[] = [];
  const neg: ValueFactor[] = [];
  if (rating >= 4.3) pos.push({ label: `High RvFOX rating ${rating.toFixed(1)}/5.0`, positive: true });
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
