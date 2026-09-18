/**
 * Facts Market value band labels — display only.
 *
 * Paints fields Facts already exposes. Does not invent dollars, does not
 * call JD Power / NADA, and does not change scrape / MarketCheck math.
 */

export const MARKET_BAND_LOW_LABEL = "Low";
export const MARKET_BAND_AVERAGE_LABEL = "Average";
export const MARKET_BAND_HIGH_LABEL = "High";
/** Visible when sold comps are Low / thin — never a guessed High dollar. */
export const THIN_SAMPLE_FLAG_LABEL = "Thin sample";

export type FactsMarketBandSlot = {
  label: typeof MARKET_BAND_LOW_LABEL | typeof MARKET_BAND_AVERAGE_LABEL | typeof MARKET_BAND_HIGH_LABEL;
  value: string;
};

export type FactsThinSampleFlag = {
  label: typeof THIN_SAMPLE_FLAG_LABEL;
  message: string;
};

/**
 * Map already-formatted desk fields onto Low / Average / High.
 * High is omitted when `hideRetailHigh` is set (Low confidence / thin comps).
 * Thin-sample flag sits in that third slot instead of an invented High.
 */
export function factsMarketBandSlots(input: {
  retailLow: string;
  average: string;
  retailHigh: string;
  hideRetailHigh: boolean;
  confidence?: "high" | "medium" | "low";
  thinSampleMessage: string;
}): {
  low: FactsMarketBandSlot;
  average: FactsMarketBandSlot;
  high: FactsMarketBandSlot | null;
  thinSample: FactsThinSampleFlag | null;
} {
  const thinSample =
    input.hideRetailHigh || input.confidence === "low";
  return {
    low: { label: MARKET_BAND_LOW_LABEL, value: input.retailLow },
    average: { label: MARKET_BAND_AVERAGE_LABEL, value: input.average },
    high: thinSample
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
