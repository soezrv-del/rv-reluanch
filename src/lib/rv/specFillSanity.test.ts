import assert from "node:assert/strict";
import test from "node:test";
import {
  isImplausibleWaterFill,
  rejectImplausibleSpecFills,
  tankGallonLooksPrinted,
} from "./specFillSanity.ts";
import type { SpecFieldFill } from "./specFieldFallback.ts";

function fill(
  field: SpecFieldFill["field"],
  value: number,
): SpecFieldFill {
  return {
    field,
    value,
    unit: "gal",
    source: "rvusa",
    sourceUrl: "https://example.test",
  };
}

test("printed lot tanks stay: 74/87/47", () => {
  assert.equal(tankGallonLooksPrinted(74), true);
  assert.equal(tankGallonLooksPrinted(87), true);
  assert.equal(tankGallonLooksPrinted(47), true);
  assert.equal(isImplausibleWaterFill("grayWater", 87), false);
});

test("24.1 gray is scrape debris, not a tank", () => {
  assert.equal(isImplausibleWaterFill("grayWater", 24.1), true);
  const kept = rejectImplausibleSpecFills([
    fill("grayWater", 24.1),
    fill("blackWater", 100),
  ]);
  assert.equal(kept.length, 0);
});

test("100 black alone without a real gray is dropped", () => {
  const kept = rejectImplausibleSpecFills([fill("blackWater", 100)]);
  assert.equal(kept.length, 0);
});

test("real 100 black with printed 80 gray stays", () => {
  const kept = rejectImplausibleSpecFills([
    fill("grayWater", 80),
    fill("blackWater", 100),
  ]);
  assert.equal(kept.length, 2);
});
