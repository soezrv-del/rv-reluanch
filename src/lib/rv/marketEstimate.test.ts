import assert from "node:assert/strict";
import test from "node:test";
import type { RVSpec } from "./rvTypes.ts";
import {
  brandTierRetainFactor,
  detectMarketSegment,
  estimateMarket,
  retainForAge,
} from "./marketEstimate.ts";

const ASOF = 2026;

function spec(partial: Partial<RVSpec> & Pick<RVSpec, "type" | "fuelType">): RVSpec {
  return {
    floorplans: ["24D"],
    lengthRange: [24, 28],
    weightRange: [9000, 14000],
    slideouts: 1,
    sleeps: 4,
    msrpRange: [150000, 200000],
    recalls: 0,
    rating: 4,
    image: "",
    ...partial,
  };
}

test("detectMarketSegment: class / fuel strings", () => {
  assert.equal(detectMarketSegment("Class B", "Diesel"), "class-b");
  assert.equal(detectMarketSegment("Class A Diesel", "Diesel"), "diesel-a");
  assert.equal(detectMarketSegment("Class A Gas", "Gas"), "gas-a");
  assert.equal(detectMarketSegment("Class A", "Gas"), "gas-a");
  assert.equal(detectMarketSegment("Class C", "Gas"), "class-c");
  assert.equal(detectMarketSegment("Super C", "Diesel"), "super-c");
  assert.equal(detectMarketSegment("Fifth Wheel", "Towable"), "fifth-wheel");
  assert.equal(detectMarketSegment("Travel Trailer", "Towable"), "travel-trailer");
  assert.equal(detectMarketSegment("Toy Hauler", "Towable"), "toy-hauler");
});

test("Class B vs gas Class A retain curves diverge at age 0 / 5 / 10", () => {
  const b0 = retainForAge(0, "class-b");
  const g0 = retainForAge(0, "gas-a");
  const b5 = retainForAge(5, "class-b");
  const g5 = retainForAge(5, "gas-a");
  const b10 = retainForAge(10, "class-b");
  const g10 = retainForAge(10, "gas-a");

  assert.ok(b0 > g0, `age 0: Class B ${b0} should beat gas A ${g0}`);
  assert.ok(b5 > g5, `age 5: Class B ${b5} should beat gas A ${g5}`);
  assert.ok(b10 > g10, `age 10: Class B ${b10} should beat gas A ${g10}`);
  assert.ok(b5 - g5 > b0 - g0, "gap widens by year 5 (gas early drop)");
  assert.ok(b10 >= 0.5, "Class B floor stays near 0.50");
  assert.ok(g10 < 0.45, "gas A is well below Class B by year 10");
});

test("estimateMarket: same MSRP, Class B holds more than gas A at 5 and 10 years", () => {
  const classB = spec({ type: "Class B", fuelType: "Diesel" });
  const gasA = spec({ type: "Class A Gas", fuelType: "Gas" });
  const b5 = estimateMarket(classB, "2021", undefined, { asOfYear: ASOF });
  const g5 = estimateMarket(gasA, "2021", undefined, { asOfYear: ASOF });
  const b10 = estimateMarket(classB, "2016", undefined, { asOfYear: ASOF });
  const g10 = estimateMarket(gasA, "2016", undefined, { asOfYear: ASOF });

  assert.equal(b5.segment, "Class B");
  assert.equal(g5.segment, "Gas Class A");
  assert.ok(b5.retailHigh > g5.retailHigh);
  assert.ok(b10.retailHigh > g10.retailHigh);
  assert.equal(b5.source, "catalog");
  assert.equal(b5.sourceLabel, "Catalog estimate");
});

test("estimateMarket: trade < retailLow < retailHigh", () => {
  const s = spec({ type: "Class A Diesel", fuelType: "Diesel" });
  for (const year of ["2026", "2021", "2016"]) {
    const m = estimateMarket(s, year, undefined, { asOfYear: ASOF });
    assert.ok(m.tradeIn > 0, `${year} trade`);
    assert.ok(
      m.tradeIn <= m.retailLow,
      `${year} trade ${m.tradeIn} <= retailLow ${m.retailLow}`,
    );
    assert.ok(
      m.retailLow < m.retailHigh,
      `${year} retailLow ${m.retailLow} < retailHigh ${m.retailHigh}`,
    );
  }
});

test("estimateMarket: floorplan length bias still applies", () => {
  const s = spec({ type: "Fifth Wheel", fuelType: "Towable" });
  const short = estimateMarket(s, "2022", "24RL", { asOfYear: ASOF });
  const long = estimateMarket(s, "2022", "42RL", { asOfYear: ASOF });
  assert.ok(long.msrpHi > short.msrpHi);
  assert.ok(long.retailHigh > short.retailHigh);
});

test("brand tier bump uses rating tables only and stays mild", () => {
  const flag = brandTierRetainFactor("Newmar", "King Aire");
  const entry = brandTierRetainFactor("Thor", "Chateau");
  assert.ok(flag > 1);
  assert.ok(entry < 1);
  assert.ok(flag <= 1.04);
  assert.ok(entry >= 0.96);
});

test("toy hauler retain is weaker than fifth wheel at the same age", () => {
  assert.ok(retainForAge(5, "fifth-wheel") > retainForAge(5, "toy-hauler"));
  assert.ok(retainForAge(10, "fifth-wheel") > retainForAge(10, "toy-hauler"));
});
