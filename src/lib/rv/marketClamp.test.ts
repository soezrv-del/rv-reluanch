import assert from "node:assert/strict";
import test from "node:test";
import {
  THIN_COMP_MAX_RETAIL_BAND_USD,
  clampTradeToRetailLow,
  freePathMidpoint,
  tightenRetailBandTowardMid,
} from "./marketClamp.ts";

test("clampTradeToRetailLow caps trade at retail low", () => {
  assert.deepEqual(clampTradeToRetailLow(90_000, 80_000), {
    tradeIn: 80_000,
    capped: true,
  });
  assert.deepEqual(clampTradeToRetailLow(70_000, 80_000), {
    tradeIn: 70_000,
    capped: false,
  });
});

test("freePathMidpoint prefers retain-curve mid on a fat catalog band", () => {
  // retailLow ≈ 0.95 × private mid → 200k / 0.95 ≈ 211k
  const mid = freePathMidpoint(200_000, 270_000);
  assert.equal(mid, 211_000);
  assert.ok(mid < (200_000 + 270_000) / 2, "not the ask-weighted band center");
});

test("tightenRetailBandTowardMid hides Retail High and kills a $70k band", () => {
  const tight = tightenRetailBandTowardMid(200_000, 270_000, 180_000);
  assert.equal(tight.hideRetailHigh, true);
  assert.ok(tight.retailHigh - tight.retailLow <= THIN_COMP_MAX_RETAIL_BAND_USD);
  assert.equal(tight.retailHigh, tight.midpoint);
  assert.ok(tight.tradeIn <= tight.retailLow);
  assert.ok(tight.midpoint < 270_000);
});
