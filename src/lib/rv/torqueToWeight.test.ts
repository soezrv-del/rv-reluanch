import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findOemFloorplanSpec } from "./floorplanSpecs.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";
import {
  THIN_CCC_FLAG,
  barColorFromScore,
  colorFromGvwrRatio,
  computeTorqueToWeight,
  dryWeightBarColor,
  estimateUvwFromGvwr,
  estimateUvwFromGvwrDetailed,
  estimateUvwFromGvwrFlat835,
  formatTorqueToWeightScore,
  formatTorqueWeightBasisChip,
  isDieselPusherForUvwEstimate,
  isTowableForTorqueRating,
  parseGvwrLb,
  parseTorqueLbFt,
  parseUvwLb,
  resolveTorqueScoreFormula,
  resolveTorqueWeight,
  scoreFromTorqueToWeightRatio,
  torqueToWeightRatio,
} from "./torqueToWeight.ts";

const root = dirname(fileURLToPath(import.meta.url));

function assertNear(actual: number | null, expected: number, tol = 0.05) {
  assert.ok(actual != null, `expected ~${expected}, got null`);
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} ±${tol}, got ${actual}`,
  );
}

function rated(torqueLbFt: number, gvwrLbs: number, extra: Record<string, unknown> = {}) {
  return computeTorqueToWeight({
    torqueLbFt,
    gvwrLbs,
    rvType: "Class A Diesel",
    ...extra,
  });
}

test("GVWR ratio bands: 22 is 6 yellow, 28 is 8 green, 34 is 10", () => {
  assertNear(scoreFromTorqueToWeightRatio(22), 6.0, 1e-9);
  assertNear(scoreFromTorqueToWeightRatio(28), 8.0, 1e-9);
  assertNear(scoreFromTorqueToWeightRatio(34), 10.0, 1e-9);
  assert.equal(scoreFromTorqueToWeightRatio(40), 10);
  assert.equal(scoreFromTorqueToWeightRatio(0), 1);
  assert.equal(scoreFromTorqueToWeightRatio(null), null);
  assert.equal(scoreFromTorqueToWeightRatio(-1), null);

  assert.equal(colorFromGvwrRatio(28), "green");
  assert.equal(colorFromGvwrRatio(27.99), "yellow");
  assert.equal(colorFromGvwrRatio(22), "yellow");
  assert.equal(colorFromGvwrRatio(21.99), "red");
  assert.equal(dryWeightBarColor(30.5), "green");
  assert.equal(dryWeightBarColor(24.6), "yellow");
  assert.equal(dryWeightBarColor(21.3), "red");
  assert.equal(dryWeightBarColor(0.04), "red");
  assert.equal(dryWeightBarColor(0.0132), "red");

  assert.equal(barColorFromScore(5.99), "red");
  assert.equal(barColorFromScore(6.0), "yellow");
  assert.equal(barColorFromScore(7.99), "yellow");
  assert.equal(barColorFromScore(8.0), "green");
});

test("named coaches score torque against published GVWR", () => {
  const anthem = rated(1250, 41_000);
  assert.equal(anthem.weightBasis, "GVWR");
  assert.equal(anthem.weightLb, 41_000);
  assert.equal(anthem.weightEstimated, false);
  assert.equal(anthem.ratio!.toFixed(1), "30.5");
  assert.equal(anthem.color, "green");
  assert.ok((anthem.score ?? 0) >= 8);

  const dutch = rated(1250, 44_460);
  assert.equal(dutch.ratio!.toFixed(1), "28.1");
  assert.equal(dutch.color, "green");

  const bus = rated(1250, 50_800);
  assert.equal(bus.ratio!.toFixed(1), "24.6");
  assert.equal(bus.color, "yellow");
  assert.ok((bus.score ?? 0) >= 6 && (bus.score ?? 0) < 8);

  const incline = rated(450, 14_500, { rvType: "Class C", fuelType: "Gas" });
  assert.equal(incline.ratio!.toFixed(1), "31.0");
  assert.equal(incline.color, "green");

  const fr3 = rated(468, 22_000, { rvType: "Class A Gas", chassis: "Ford F-53" });
  assert.equal(fr3.ratio!.toFixed(1), "21.3");
  assert.equal(fr3.color, "red");
  assert.ok((fr3.score ?? 10) < 6);
});

test("UVW never scores; missing torque or GVWR is GAP", () => {
  const uvwOnly = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwLbs: 34_200,
    rvType: "Class A Diesel",
  });
  assert.equal(uvwOnly.weightLb, null);
  assert.equal(uvwOnly.weightBasis, null);
  assert.equal(uvwOnly.gap, true);
  assert.equal(formatTorqueToWeightScore(uvwOnly), "GAP");

  const torqueMissing = computeTorqueToWeight({
    gvwrLbs: 41_000,
    uvwLbs: 34_200,
    rvType: "Class A Diesel",
  });
  assert.equal(torqueMissing.gap, true);
  assert.equal(torqueMissing.weightBasis, null);
  assert.equal(formatTorqueToWeightScore(torqueMissing), "GAP");

  const both = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwLbs: 34_200,
    gvwrLbs: 41_000,
    rvType: "Class A Diesel",
  });
  assert.equal(both.weightLb, 41_000);
  assert.equal(both.uvwLb, 34_200);
  assert.equal(both.weightBasis, "GVWR");
  assert.equal(both.weightEstimated, false);
  assert.notEqual(both.weightLb, 34_200);
});

test("salesman GVWR wins over published GVWR; UVW override does not", () => {
  const order = resolveTorqueWeight({
    overrideUvwLbs: 17_500,
    uvwLbs: 18_000,
    overrideGvwrLbs: 21_000,
    gvwrLbs: 22_000,
  });
  assert.equal(order.weightLb, 21_000);
  assert.equal(order.weightBasis, "GVWR");
  assert.equal(order.weightOverridden, true);
  assert.equal(order.weightEstimated, false);
  assert.equal(order.uvwLb, 17_500);

  const published = resolveTorqueWeight({
    uvwLbs: 18_000,
    gvwrLbs: 22_000,
    gvwrRaw: "39,500–44,005 lbs",
  });
  assert.equal(published.weightLb, 22_000);
  assert.equal(published.gvwrLb, 22_000);
  assert.equal(published.weightEstimated, false);

  const parsed = resolveTorqueWeight({
    gvwrRaw: "39,500–44,005 lbs",
  });
  assert.equal(parsed.weightLb, 44005);
  assert.equal(parsed.weightBasis, "GVWR");
});

test("a two-number GVWR band scores the high end", () => {
  assert.equal(parseGvwrLb("39500-44005"), 44005);
  assert.equal(parseGvwrLb("39,500–44,005 lbs"), 44005);
  assert.equal(parseGvwrLb([39_500, 44_005]), 44005);
  assert.equal(parseGvwrLb("47,000 lbs GVWR"), 47000);
  assert.equal(parseGvwrLb("18,000 lbs UVW"), null);

  const band = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrRaw: "39500-44005",
    rvType: "Class A Diesel",
  });
  assert.equal(band.weightLb, 44005);
  assert.equal(band.weightBasis, "GVWR");
  assert.equal(band.weightEstimated, false);
  assert.equal(band.gap, false);

  const pinWins = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwLbs: 39_200,
    gvwrLbs: 47_000,
    gvwrRaw: "39,500–44,005 lbs",
    weightRange: [39_500, 44_005],
    rvType: "Class A Diesel",
  });
  assert.equal(pinWins.gvwrLb, 47_000);
  assert.equal(pinWins.weightLb, 47_000);
  assert.equal(pinWins.weightBasis, "GVWR");
});

test("Hideout and other towables are N/A; Class C toy hauler still rates", () => {
  assert.equal(isTowableForTorqueRating("Travel Trailer"), true);
  assert.equal(isTowableForTorqueRating("Fifth Wheel"), true);
  assert.equal(isTowableForTorqueRating("Truck Camper"), true);
  assert.equal(isTowableForTorqueRating("Hideout Mini"), true);
  assert.equal(isTowableForTorqueRating("Toy Hauler"), true);
  assert.equal(isTowableForTorqueRating("Class C Toy Hauler"), false);
  assert.equal(isTowableForTorqueRating("Class A Diesel"), false);

  const hideout = computeTorqueToWeight({
    torqueLbFt: 400,
    gvwrLbs: 7_000,
    rvType: "Hideout Mini",
  });
  assert.equal(hideout.na, true);
  assert.equal(hideout.score, null);
  assert.equal(formatTorqueToWeightScore(hideout), "N/A");

  const fifth = computeTorqueToWeight({
    torqueLbFt: 400,
    gvwrLbs: 12_000,
    rvType: "Fifth Wheel",
  });
  assert.equal(fifth.na, true);

  const classCToy = computeTorqueToWeight({
    torqueLbFt: 450,
    gvwrLbs: 14_500,
    rvType: "Class C Toy Hauler",
    fuelType: "Gas",
  });
  assert.equal(classCToy.na, false);
  assert.equal(classCToy.weightBasis, "GVWR");
  assert.equal(classCToy.gap, false);
});

test("ratio is lb-ft per 1,000 lb GVWR and never uses horsepower", () => {
  assert.equal(torqueToWeightRatio(1250, 41_000)!.toFixed(1), "30.5");
  assert.equal(torqueToWeightRatio(0, 22_000), null);
  assert.equal(parseTorqueLbFt("450 HP"), null);
  assert.equal(parseTorqueLbFt("450 HP / 1,250 lb-ft"), 1250);
  assert.equal(
    computeTorqueToWeight({ torqueRaw: "450 HP", gvwrLbs: 22_000 }).gap,
    true,
  );
  assert.equal(parseUvwLb("22,000 lbs GVWR"), null);
});

test("type label is recorded and does not change the GVWR score", () => {
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Super C", fuelType: "Diesel" }),
    "super-c",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Class A Diesel" }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Class A Gas", chassis: "Ford F53" }),
    "class-a-gas",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Class C", fuelType: "Gas" }),
    "class-c",
  );

  const diesel = rated(800, 31_000, { rvType: "Class A Diesel" });
  const superC = rated(800, 31_000, {
    rvType: "Super C",
    fuelType: "Diesel",
    chassis: "Freightliner S2RV",
  });
  assert.equal(diesel.formula, "class-a-diesel");
  assert.equal(superC.formula, "super-c");
  assertNear(diesel.score, superC.score ?? 0, 1e-9);
  assert.equal(diesel.color, superC.color);
});

test("published UVW pin does not replace GVWR on the rating", () => {
  const pin = findPowertrainCorrection("2023", "Tiffin", "Phaeton", "40IH");
  assert.ok(pin);
  assert.equal(pin!.torqueLbFt, 1150);
  const oem = findOemFloorplanSpec("2023", "Tiffin", "Phaeton", "40IH");
  assert.ok(oem);
  assert.equal(oem!.uvwLbs, 33_500);
  assert.equal(oem!.gvwrLbs, 39_600);

  const ttw = computeTorqueToWeight({
    torqueLbFt: pin!.torqueLbFt,
    uvwLbs: oem!.uvwLbs,
    gvwrLbs: oem!.gvwrLbs,
    rvType: "Class A Diesel",
    fuelType: "Diesel",
    chassis: pin!.chassis,
    engine: pin!.engine,
  });
  assert.equal(ttw.weightLb, 39_600);
  assert.equal(ttw.uvwLb, 33_500);
  assert.equal(ttw.weightBasis, "GVWR");
  assert.equal(ttw.weightEstimated, false);
  assert.equal(ttw.ratio!.toFixed(1), "29.0");
  assert.equal(ttw.color, "green");
  assert.equal(formatTorqueWeightBasisChip(ttw), null);

  const bus = findPowertrainCorrection("2023", "Tiffin", "Allegro Bus", "45OPP");
  assert.ok(bus);
  assert.equal(bus!.torqueLbFt, undefined);
  assert.equal(
    computeTorqueToWeight({
      torqueLbFt: bus!.torqueLbFt,
      torqueRaw: "—",
      gvwrLbs: 50_000,
      rvType: "Class A Diesel",
      engine: bus!.engine,
    }).gap,
    true,
  );
});

test("tiered UVW estimate stays off the rating", () => {
  assert.equal(
    estimateUvwFromGvwr(52_000, { rvType: "Class A Diesel", chassis: "Spartan" }),
    43_400,
  );
  assert.equal(
    estimateUvwFromGvwr(22_000, { rvType: "Class A Gas", chassis: "Ford F-53" }),
    18_000,
  );
  assert.equal(estimateUvwFromGvwr(null), null);
  assert.equal(estimateUvwFromGvwrFlat835(22_000), 18_400);

  const diesel = estimateUvwFromGvwrDetailed(52_000, {
    chassis: "Freightliner",
    rvType: "Class A Diesel",
  });
  assert.equal(diesel?.uvwLbs, 43_400);
  assert.equal(
    isDieselPusherForUvwEstimate({ chassis: "Ford F-53", rvType: "Class A Diesel" }),
    false,
  );

  const scored = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 52_000,
    rvType: "Class A Diesel",
    chassis: "Spartan K2",
  });
  assert.equal(scored.weightLb, 52_000);
  assert.equal(scored.weightEstimated, false);
  assert.notEqual(scored.weightLb, 43_400);
  assert.equal(THIN_CCC_FLAG, "thin-CCC");
});

test("Facts Ratings bar uses the GVWR color, not the dry-weight 0.04 scale", () => {
  const src = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.match(src, /published GVWR only/);
  assert.match(src, /UVW never scores/);
  assert.match(src, /weightBasis = "GVWR"/);
  assert.match(src, /weightEstimated = false/);
  assert.match(src, /6 \+ \(ratio - 22\) \/ 3/);
  assert.match(src, /ratio >= 28/);
  assert.match(src, /ratio >= 22/);
  assert.match(src, /Math\.max\(nums\[0]!, nums\[1]!\)/);
  assert.doesNotMatch(src, /TORQUE_SCORE_CHAMPIONS/);
  assert.doesNotMatch(src, /38\.2/);
  assert.doesNotMatch(src, /28\.9/);
  assert.doesNotMatch(src, /52\.2/);
  assert.doesNotMatch(src, /38\.6/);
  assert.doesNotMatch(src, /10\/17\/28\/45/);
  assert.doesNotMatch(src, /0\.222 \* R\*/);
  assert.doesNotMatch(src, /ratio >= 0\.04/);
  assert.doesNotMatch(src, /0\.0132\)/);

  const compute = src.slice(
    src.indexOf("export function computeTorqueToWeight"),
    src.indexOf("export function formatTorqueToWeightScore"),
  );
  assert.doesNotMatch(compute, /estimateUvwFromGvwr/);
  assert.doesNotMatch(compute, /classAGasScoredWeightLb/);
  assert.match(compute, /colorFromGvwrRatio/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /Torque \/ GVWR/);
  assert.match(detail, /torqueToWeight\.color/);
  assert.match(detail, /data-testid="facts-tqwt-bar"/);
  assert.match(detail, /data-fill="left-to-right"/);
  assert.doesNotMatch(detail, /UVW \/ dry weight/);
  assert.doesNotMatch(detail, /dryWeightBarColor/);
  assert.doesNotMatch(detail, /formatDryWeightRatio/);
  assert.doesNotMatch(detail, /950 \/ 18000/);
  assert.doesNotMatch(detail, /data-fill="right-to-left"/);
  assert.match(detail, /overrideGvwrLbs:\s*weightOverride\?\.gvwrLbs/);
  assert.match(detail, /gvwrRaw:\s*specs\.gvwr/);
  assert.doesNotMatch(detail, /formatTorqueWeightBasisChip/);
  assert.doesNotMatch(detail, /UVW_ESTIMATE_LABEL/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /ratingStars\(row\.score\)/);

  const brochure = readFileSync(join(root, "brochureSpecs.ts"), "utf8");
  assert.doesNotMatch(brochure, /UVW_ESTIMATE_LABEL/);
  assert.doesNotMatch(brochure, /THIN_CCC_FLAG/);
});
