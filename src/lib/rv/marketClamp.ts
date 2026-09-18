/** Desk sanity: a trade number above retail low is not a usable lot figure. */
export function clampTradeToRetailLow(
  tradeIn: number,
  retailLow: number,
): { tradeIn: number; capped: boolean } {
  if (retailLow > 0 && tradeIn > retailLow) {
    return { tradeIn: retailLow, capped: true };
  }
  return { tradeIn, capped: false };
}

/**
 * Fat catalog retail spans are not desk truth when sold comps are Low / thin.
 * A $60k+ Catalog estimate band reads like an invented book range.
 */
export const THIN_COMP_MAX_RETAIL_BAND_USD = 20_000;

export function roundClampUsd(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 1000) * 1000;
}

/**
 * Facts Market value — hide Retail High when Sold comps are Low or the
 * public ladder did not win. Keyed on soldConfidence === "low" so a
 * missing hideRetailHigh flag cannot paint the fat catalog ask.
 */
export function hideRetailHighForDesk(input: {
  soldConfidence?: "high" | "medium" | "low" | null;
  showSoldRange?: boolean;
  hideRetailHigh?: boolean;
}): boolean {
  if (input.soldConfidence === "low" || input.soldConfidence == null) {
    return true;
  }
  if (!input.showSoldRange) return true;
  return Boolean(input.hideRetailHigh);
}

/**
 * Low-confidence desk truth: Retail High cannot sit a fat band above
 * Market value / midpoint. Pin High to the desk number — do not invent
 * a sold price and do not keep a $60k catalog ask.
 */
export function clampRetailHighToMarketValue(
  retailHigh: number,
  marketValue: number,
): { retailHigh: number; clamped: boolean } {
  const mid = roundClampUsd(marketValue);
  if (mid <= 0) {
    return {
      retailHigh: roundClampUsd(retailHigh),
      clamped: false,
    };
  }
  const hi = retailHigh > 0 ? retailHigh : mid;
  if (hi - mid > THIN_COMP_MAX_RETAIL_BAND_USD || hi > mid) {
    return { retailHigh: mid, clamped: hi !== mid };
  }
  return { retailHigh: hi, clamped: false };
}

/**
 * Recover the catalog private-party midpoint from a retail band.
 *
 * Catalog tiles use retailLow ≈ 0.95 × private mid and a dealer-ask
 * retailHigh (about 1.18–1.25×). The painted band center is therefore
 * ask-weighted. When the span is fat, prefer the retain-curve mid
 * (retailLow / 0.95) — the typical free-path midpoint.
 */
export function freePathMidpoint(retailLow: number, retailHigh: number): number {
  if (retailLow > 0 && retailHigh > retailLow) {
    const band = retailHigh - retailLow;
    if (band >= THIN_COMP_MAX_RETAIL_BAND_USD) {
      return roundClampUsd(retailLow / 0.95);
    }
    return roundClampUsd((retailLow + retailHigh) / 2);
  }
  if (retailLow > 0) return roundClampUsd(retailLow);
  if (retailHigh > 0) return roundClampUsd(retailHigh);
  return 0;
}

/**
 * Collapse a fat catalog retail band toward a single free-path midpoint.
 * Always flags hideRetailHigh — Low comps must not lead with Retail High.
 */
export function tightenRetailBandTowardMid(
  retailLow: number,
  retailHigh: number,
  tradeIn: number,
  marketValue?: number,
): {
  retailLow: number;
  retailHigh: number;
  tradeIn: number;
  tradeCappedAtRetailLow?: boolean;
  hideRetailHigh: boolean;
  midpoint: number;
} {
  const midpoint =
    marketValue && marketValue > 0
      ? roundClampUsd(marketValue)
      : freePathMidpoint(retailLow, retailHigh);
  if (midpoint <= 0) {
    return {
      retailLow,
      retailHigh,
      tradeIn,
      hideRetailHigh: true,
      midpoint: 0,
    };
  }

  const band = Math.max(0, retailHigh - retailLow);
  if (band > 0 && band <= THIN_COMP_MAX_RETAIL_BAND_USD) {
    const lo = retailLow > 0 ? retailLow : midpoint;
    const trade = clampTradeToRetailLow(tradeIn, lo);
    return {
      retailLow: lo,
      retailHigh: midpoint,
      tradeIn: trade.tradeIn,
      tradeCappedAtRetailLow: trade.capped || undefined,
      hideRetailHigh: true,
      midpoint,
    };
  }

  const lo = roundClampUsd(midpoint * 0.97) || midpoint;
  const trade = clampTradeToRetailLow(tradeIn, lo);
  return {
    retailLow: lo,
    retailHigh: midpoint,
    tradeIn: trade.tradeIn,
    tradeCappedAtRetailLow: trade.capped || undefined,
    hideRetailHigh: true,
    midpoint,
  };
}
