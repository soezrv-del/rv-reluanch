import assert from "node:assert/strict";
import test from "node:test";
import { findOemGvwrLbs, findOemUvwLbs, oemGvwrPinCount } from "./floorplanSpecs.ts";
import {
  UVW_ESTIMATE_LABEL,
  computeTorqueToWeight,
  estimateUvwFromGvwr,
} from "./torqueToWeight.ts";
import {
  americanDream39rkPin,
  listEstimatedUvwFromGvwrPins,
  scoreEstimatedTtw,
} from "./uvwEstimateCoverage.ts";

test("39RK Family RVing pin stays 39,237 and is not the diesel-pusher estimate", () => {
  const pin = americanDream39rkPin();
  assert.equal(pin.uvwLbs, 39_237);
  assert.equal(pin.estimateFrom47000, 39_200);
  assert.notEqual(pin.uvwLbs, pin.estimateFrom47000);
  assert.equal(
    findOemUvwLbs("2022", "American Coach", "American Dream", "39RK"),
    39_237,
  );

  const ttw = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwLbs: 39_237,
    gvwrLbs: 47_000,
    rvType: "Class A Diesel",
    chassis: "Spartan",
  });
  assert.equal(ttw.weightLb, 39_237);
  assert.equal(ttw.weightEstimated, false);
  assert.equal(ttw.weightBasis, "UVW");
});

test("Anthem 44R / Precept 31UL / Alante / Open Road 34PA use the tiered formula", () => {
  assert.equal(findOemUvwLbs("2025", "Entegra Coach", "Anthem", "44R"), null);
  assert.equal(findOemGvwrLbs("2025", "Entegra Coach", "Anthem", "44R"), 52_000);
  const anthem = scoreEstimatedTtw({
    torqueLbFt: 1250,
    gvwrLbs: 52_000,
    rvType: "Class A Diesel",
    chassis: "Spartan K2",
  });
  assert.equal(anthem.estimatedUvwLbs, 43_400);
  assert.equal(anthem.tier, "diesel-pusher");
  assert.ok(anthem.score != null && Math.abs(anthem.score - 7.11) <= 0.15);
  assert.equal(anthem.color, "yellow");

  assert.equal(findOemUvwLbs("2025", "Jayco", "Precept", "31UL"), null);
  assert.equal(findOemGvwrLbs("2025", "Jayco", "Precept", "31UL"), 22_000);
  const precept = scoreEstimatedTtw({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(precept.estimatedUvwLbs, 18_000);
  assert.equal(precept.tier, "gas-20k-24k");
  assert.ok(precept.score != null && Math.abs(precept.score - 6.05) <= 0.15);
  assert.equal(precept.color, "yellow");

  const alante = scoreEstimatedTtw({
    torqueLbFt: 468,
    gvwrLbs: 18_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(alante.estimatedUvwLbs, 15_800);
  assert.equal(alante.tier, "gas-under-20k");

  const openRoad = scoreEstimatedTtw({
    torqueLbFt: 468,
    gvwrLbs: 26_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(openRoad.estimatedUvwLbs, 22_600);
  assert.equal(openRoad.tier, "gas-26k-up");
});

test("GVWR-pin coverage: estimates skip published UVW pins; missing GVWR stays unset", () => {
  const estimated = listEstimatedUvwFromGvwrPins();
  assert.ok(estimated.length > 0);
  assert.ok(estimated.length <= oemGvwrPinCount());

  const anthem44 = estimated.find(
    (r) =>
      r.modelIncludes === "anthem" &&
      r.floorplan.toUpperCase() === "44R" &&
      r.gvwrLbs === 52_000,
  );
  assert.ok(anthem44);
  assert.equal(anthem44!.estimatedUvwLbs, 43_400);
  assert.equal(anthem44!.tier, "diesel-pusher");

  const precept31 = estimated.find(
    (r) => r.modelIncludes === "precept" && r.floorplan.toUpperCase() === "31UL",
  );
  assert.ok(precept31);
  assert.equal(precept31!.estimatedUvwLbs, 18_000);
  assert.equal(precept31!.tier, "gas-20k-24k");

  const alante27 = estimated.find(
    (r) => r.modelIncludes === "alante" && r.floorplan.toUpperCase() === "27A",
  );
  assert.ok(alante27);
  assert.equal(alante27!.estimatedUvwLbs, 15_800);
  assert.equal(alante27!.tier, "gas-under-20k");

  const openRoad34 = estimated.find(
    (r) =>
      r.modelIncludes === "open road" && r.floorplan.toUpperCase() === "34PA",
  );
  assert.ok(openRoad34);
  assert.equal(openRoad34!.estimatedUvwLbs, 22_600);
  assert.equal(openRoad34!.tier, "gas-26k-up");

  const dutch3836 = estimated.find(
    (r) =>
      r.modelIncludes === "dutch star" && r.floorplan.toUpperCase() === "3836",
  );
  assert.equal(dutch3836, undefined, "published Dutch Star 3836 UVW must not be estimated");

  const seneca37k = estimated.find(
    (r) => r.modelIncludes === "seneca" && r.floorplan.toUpperCase() === "37K",
  );
  assert.equal(seneca37k, undefined, "published Seneca 37K UVW must not be estimated");

  const dream39 = estimated.find((r) => r.floorplan.toUpperCase() === "39RK");
  assert.equal(dream39, undefined, "39RK is a UVW pin, not an estimate row");

  assert.equal(estimateUvwFromGvwr(null), null);
  assert.equal(UVW_ESTIMATE_LABEL, "estimated via tiered GVWR formula");
});
