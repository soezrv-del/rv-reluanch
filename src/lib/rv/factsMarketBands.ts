/**
 * Facts Market value field contract — display only.
 *
 * Paints MarketEstimate fields already on the desk. Does not invent
 * dollars, does not call JD Power / NADA, and does not change scrape math.
 *
 *   retailLow     → Low
 *   marketValue   → Average (else midpoint of retailLow / retailHigh)
 *   retailHigh    → High, omitted when hideRetailHigh
 *   confidence    → thin-sample when "low" (or public sample < 2)
 *   sourceLabel   → Average caption when confidence is low
 */

import { PUBLIC_COMPS_MIN_SAMPLE } from "./publicListingComps.ts";

export const MARKET_BAND_LOW_LABEL = "Low";
export const MARKET_BAND_AVERAGE_LABEL = "Average";
export const MARKET_BAND_HIGH_LABEL = "High";
/** Visible when sold comps are Low / thin — never a guessed High dollar. */
export const THIN_SAMPLE_FLAG_LABEL = "Thin sample";

export type FactsMarketBandSlot = {
  label:
    | typeof MARKET_BAND_LOW_LABEL
    | typeof MARKET_BAND_AVERAGE_LABEL
    | typeof MARKET_BAND_HIGH_LABEL;
  value: string;
};

export type FactsThinSampleFlag = {
  label: typeof THIN_SAMPLE_FLAG_LABEL;
  message: string;
};

/**
 * Average dollar: `marketValue` when Facts already has one.
 * If absent, midpoint of the existing retailLow / retailHigh pair.
 * GAP (0) beats inventing a third number.
 */
export function factsMarketAverageUsd(est: {
  marketValue?: number;
  retailLow: number;
  retailHigh: number;
}): number {
  if (typeof est.marketValue === "number" && est.marketValue > 0) {
    return est.marketValue;
  }
  const lo = est.retailLow > 0 ? est.retailLow : 0;
  const hi = est.retailHigh > 0 ? est.retailHigh : 0;
  if (lo > 0 && hi > 0) return (lo + hi) / 2;
  return lo || hi || 0;
}

/**
 * Thin-sample: MarketEstimate confidence "low", or public_listings
 * soldSampleSize / sampleSize under the existing 2-comp bar.
 */
export function factsMarketIsThinSample(input: {
  confidence?: "high" | "medium" | "low";
  soldSampleSize?: number;
  sampleSize?: number;
}): boolean {
  if (input.confidence === "low") return true;
  const n =
    typeof input.soldSampleSize === "number"
      ? input.soldSampleSize
      : input.sampleSize;
  return typeof n === "number" && n < PUBLIC_COMPS_MIN_SAMPLE;
}

/**
 * Map already-formatted desk fields onto Low / Average / High.
 * High is omitted only when `hideRetailHigh` is set — do not invent High.
 * Thin-sample flag is separate (confidence low / sample < 2).
 */
export function factsMarketBandSlots(input: {
  retailLow: string;
  average: string;
  retailHigh: string;
  hideRetailHigh: boolean;
  confidence?: "high" | "medium" | "low";
  soldSampleSize?: number;
  sampleSize?: number;
  thinSampleMessage: string;
}): {
  low: FactsMarketBandSlot;
  average: FactsMarketBandSlot;
  high: FactsMarketBandSlot | null;
  thinSample: FactsThinSampleFlag | null;
} {
  const thinSample = factsMarketIsThinSample({
    confidence: input.confidence,
    soldSampleSize: input.soldSampleSize,
    sampleSize: input.sampleSize,
  });
  return {
    low: { label: MARKET_BAND_LOW_LABEL, value: input.retailLow },
    average: { label: MARKET_BAND_AVERAGE_LABEL, value: input.average },
    high: input.hideRetailHigh
      ? null
      : { label: MARKET_BAND_HIGH_LABEL, value: input.retailHigh },
    thinSample: thinSample
      ? {
          label: THIN_SAMPLE_FLAG_LABEL,
          message: input.thinSampleMessage,
        }
      : null,
  };
}
