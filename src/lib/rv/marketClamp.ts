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

/**
 * Low / thin sold comps: the catalog retain-curve mid is optimistic vs
 * public book (Palazzo-style ~$219k vs ~$145k). Haircut the free-path
 * midpoint only — do not invent sold prices, do not call JD Power / NADA.
 * Med/High never enter this path (they hug sold median).
 *
 * 0.66 × $219k → $145k after $1k rounding. Documented factor, not a silent invent.
 */
export const LOW_THIN_FREE_PATH_HAIRCUT = 0.66;

export function roundClampUsd(n: number): number {
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n / 1000) * 1000;
}

/** Low-only conservative mid. Empty / 0 stays 0 — GAP beats invent. */
export function applyLowThinFreePathHaircut(midpoint: number): number {
  if (!Number.isFinite(midpoint) || midpoint <= 0) return 0;
  return roundClampUsd(midpoint * LOW_THIN_FREE_PATH_HAIRCUT);
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
 * Low-only desk mid: conservative free-path, optionally capped by a
 * confirmed thin sold. Never invent a sold price and never invent UP
 * from a cheaper sold — a fat lone sold cannot keep Market optimistic.
 */
export function conservativeLowMidpoint(
  retailLow: number,
  retailHigh: number,
  marketValue?: number,
): number {
  const freeMid = freePathMidpoint(retailLow, retailHigh);
  const conservativeFree = applyLowThinFreePathHaircut(freeMid);
  if (marketValue && marketValue > 0) {
    const sold = roundClampUsd(marketValue);
    return conservativeFree > 0 ? Math.min(sold, conservativeFree) : sold;
  }
  return conservativeFree;
}

/**
 * Collapse a fat catalog retail band toward a conservative free-path mid.
 * Always flags hideRetailHigh — Low comps must not lead with Retail High.
 * Rebuilds the band around the haircut mid so Low cannot keep a fat $219k.
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
  const midpoint = conservativeLowMidpoint(retailLow, retailHigh, marketValue);
  if (midpoint <= 0) {
    return {
      retailLow,
      retailHigh,
      tradeIn,
      hideRetailHigh: true,
      midpoint: 0,
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
