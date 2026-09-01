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
