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

test("two scales: UVW 32/40/48 and GVWR 22/28/34", () => {
  assertNear(scoreFromTorqueToWeightRatio(32, "UVW"), 6.0, 1e-9);
  assertNear(scoreFromTorqueToWeightRatio(40, "UVW"), 8.0, 1e-9);
  assertNear(scoreFromTorqueToWeightRatio(48, "UVW"), 10.0, 1e-9);
  assert.equal(scoreFromTorqueToWeightRatio(60, "UVW"), 10);
  assert.equal(scoreFromTorqueToWeightRatio(0, "UVW"), 1);

  assertNear(scoreFromTorqueToWeightRatio(22, "GVWR"), 6.0, 1e-9);
  assertNear(scoreFromTorqueToWeightRatio(28, "GVWR"), 8.0, 1e-9);
  assertNear(scoreFromTorqueToWeightRatio(34, "GVWR"), 10.0, 1e-9);
  assert.equal(scoreFromTorqueToWeightRatio(40, "GVWR"), 10);
  assert.equal(scoreFromTorqueToWeightRatio(0, "GVWR"), 1);
  assert.equal(scoreFromTorqueToWeightRatio(null, "UVW"), null);
  assert.equal(scoreFromTorqueToWeightRatio(-1, "GVWR"), null);

  // 36 is yellow on the UVW ruler and green on the GVWR ruler.
  const uvw36 = scoreFromTorqueToWeightRatio(36, "UVW");
  const gvwr36 = scoreFromTorqueToWeightRatio(36, "GVWR");
  assert.equal(barColorFromScore(uvw36), "yellow");
  assert.equal(barColorFromScore(gvwr36), "green");
  assert.notEqual(barColorFromScore(uvw36), colorFromGvwrRatio(36));

  assert.equal(barColorFromScore(5.99), "red");
  assert.equal(barColorFromScore(6.0), "yellow");
  assert.equal(barColorFromScore(7.99), "yellow");
  assert.equal(barColorFromScore(8.0), "green");

  assert.equal(dryWeightBarColor(47.4), "green");
  assert.equal(dryWeightBarColor(36), "yellow");
  assert.equal(dryWeightBarColor(31.9), "red");
  assert.equal(dryWeightBarColor(0.04), "red");
  assert.equal(dryWeightBarColor(0.0132), "red");
});

test("same torque and GVWR do not tie when UVW differs", () => {
  const short = computeTorqueToWeight({
    torqueLbFt: 450,
    uvwLbs: 9_500,
    gvwrLbs: 14_500,
    rvType: "Class C",
    fuelType: "Gas",
    chassis: "Ford E-450",
  });
  const long = computeTorqueToWeight({
    torqueLbFt: 450,
    uvwLbs: 12_500,
    gvwrLbs: 14_500,
    rvType: "Class C",
    fuelType: "Gas",
    chassis: "Ford E-450",
  });
  assert.equal(short.weightBasis, "UVW");
  assert.equal(long.weightBasis, "UVW");
  assert.equal(short.weightEstimated, false);
  assert.equal(long.weightEstimated, false);
  assert.equal(short.ratio!.toFixed(1), "47.4");
  assert.equal(long.ratio!.toFixed(1), "36.0");
  assert.equal(short.color, "green");
  assert.equal(long.color, "yellow");
  assert.notEqual(short.score, long.score);
  assert.equal(formatTorqueWeightBasisChip(short), "Torque / UVW");
  assert.equal(formatTorqueWeightBasisChip(long), "Torque / UVW");

  const shortFallback = computeTorqueToWeight({
    torqueLbFt: 450,
    gvwrLbs: 14_500,
    rvType: "Class C",
    fuelType: "Gas",
  });
  const longFallback = computeTorqueToWeight({
    torqueLbFt: 450,
    gvwrLbs: 14_500,
    rvType: "Class C",
    fuelType: "Gas",
  });
  assert.equal(shortFallback.weightBasis, "GVWR");
  assert.equal(longFallback.weightBasis, "GVWR");
  assert.equal(shortFallback.weightLb, 14_500);
  assert.equal(shortFallback.ratio!.toFixed(1), "31.0");
  assert.equal(longFallback.ratio!.toFixed(1), "31.0");
  assert.equal(shortFallback.color, "green");
  assert.equal(shortFallback.score, longFallback.score);
  assert.equal(formatTorqueWeightBasisChip(shortFallback), "Torque / GVWR");
});

test("GVWR fallback and printed UVW use different chips", () => {
  const gvwr = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 41_000,
    rvType: "Class A Diesel",
  });
  assert.equal(gvwr.weightBasis, "GVWR");
  assert.equal(gvwr.weightLb, 41_000);
  assert.equal(gvwr.weightEstimated, false);
  assert.equal(gvwr.ratio!.toFixed(1), "30.5");
  assert.equal(gvwr.color, "green");
  assert.equal(formatTorqueWeightBasisChip(gvwr), "Torque / GVWR");

  const uvw = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwLbs: 33_000,
    gvwrLbs: 41_000,
    rvType: "Class A Diesel",
  });
  assert.equal(uvw.weightBasis, "UVW");
  assert.equal(uvw.weightLb, 33_000);
  assert.equal(uvw.uvwLb, 33_000);
  assert.equal(uvw.gvwrLb, 41_000);
  assert.equal(uvw.weightEstimated, false);
  assert.equal(uvw.ratio!.toFixed(1), "37.9");
  assert.equal(uvw.color, "yellow");
  assert.notEqual(uvw.score, gvwr.score);
  assert.equal(formatTorqueWeightBasisChip(uvw), "Torque / UVW");

  const fr3 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(fr3.weightBasis, "GVWR");
  assert.equal(fr3.ratio!.toFixed(1), "21.3");
  assert.equal(fr3.color, "red");
  assert.ok((fr3.score ?? 10) < 6);
  assert.equal(formatTorqueWeightBasisChip(fr3), "Torque / GVWR");
});

test("missing torque or both weights is GAP; do not estimate UVW", () => {
  const bothMissing = computeTorqueToWeight({
    torqueLbFt: 1250,
    rvType: "Class A Diesel",
  });
  assert.equal(bothMissing.weightLb, null);
  assert.equal(bothMissing.weightBasis, null);
  assert.equal(bothMissing.gap, true);
  assert.equal(formatTorqueToWeightScore(bothMissing), "GAP");
  assert.equal(formatTorqueWeightBasisChip(bothMissing), null);

  const torqueMissing = computeTorqueToWeight({
    gvwrLbs: 41_000,
    uvwLbs: 33_000,
    rvType: "Class A Diesel",
  });
  assert.equal(torqueMissing.gap, true);
  assert.equal(torqueMissing.weightBasis, null);
  assert.equal(formatTorqueToWeightScore(torqueMissing), "GAP");
  assert.equal(formatTorqueWeightBasisChip(torqueMissing), null);

  const estimated = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 52_000,
    rvType: "Class A Diesel",
    chassis: "Spartan K2",
  });
  assert.equal(estimated.weightBasis, "GVWR");
  assert.equal(estimated.weightLb, 52_000);
  assert.equal(estimated.weightEstimated, false);
  assert.notEqual(estimated.weightLb, 43_400);
});

test("salesman UVW wins; GVWR override is only the fallback", () => {
  const order = resolveTorqueWeight({
    overrideUvwLbs: 17_500,
    uvwLbs: 18_000,
    overrideGvwrLbs: 21_000,
    gvwrLbs: 22_000,
  });
  assert.equal(order.weightLb, 17_500);
  assert.equal(order.weightBasis, "UVW");
  assert.equal(order.weightOverridden, true);
  assert.equal(order.weightEstimated, false);
  assert.equal(order.uvwLb, 17_500);
  assert.equal(order.gvwrLb, 21_000);

  const published = resolveTorqueWeight({
    uvwLbs: 18_000,
    gvwrLbs: 22_000,
    gvwrRaw: "39,500–44,005 lbs",
  });
  assert.equal(published.weightLb, 18_000);
  assert.equal(published.weightBasis, "UVW");
  assert.equal(published.gvwrLb, 22_000);
  assert.equal(published.weightEstimated, false);

  const parsed = resolveTorqueWeight({
    gvwrRaw: "39,500–44,005 lbs",
  });
  assert.equal(parsed.weightLb, 44005);
  assert.equal(parsed.weightBasis, "GVWR");
  assert.equal(parsed.weightEstimated, false);
});

test("a two-number GVWR band scores the high end only when UVW is missing", () => {
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
  assert.equal(formatTorqueWeightBasisChip(band), "Torque / GVWR");

  const pinWins = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwLbs: 39_200,
    gvwrLbs: 47_000,
    gvwrRaw: "39,500–44,005 lbs",
    weightRange: [39_500, 44_005],
    rvType: "Class A Diesel",
  });
  assert.equal(pinWins.gvwrLb, 47_000);
  assert.equal(pinWins.uvwLb, 39_200);
  assert.equal(pinWins.weightLb, 39_200);
  assert.equal(pinWins.weightBasis, "UVW");
  assert.equal(formatTorqueWeightBasisChip(pinWins), "Torque / UVW");
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
    uvwLbs: 4_200,
    gvwrLbs: 7_000,
    rvType: "Hideout Mini",
  });
  assert.equal(hideout.na, true);
  assert.equal(hideout.score, null);
  assert.equal(formatTorqueToWeightScore(hideout), "N/A");
  assert.equal(formatTorqueWeightBasisChip(hideout), null);

  const fifth = computeTorqueToWeight({
    torqueLbFt: 400,
    gvwrLbs: 12_000,
    rvType: "Fifth Wheel",
  });
  assert.equal(fifth.na, true);

  const classCToy = computeTorqueToWeight({
    torqueLbFt: 450,
    uvwLbs: 9_500,
    gvwrLbs: 14_500,
    rvType: "Class C Toy Hauler",
    fuelType: "Gas",
  });
  assert.equal(classCToy.na, false);
  assert.equal(classCToy.weightBasis, "UVW");
  assert.equal(classCToy.weightLb, 9_500);
  assert.equal(classCToy.gap, false);
  assert.equal(formatTorqueWeightBasisChip(classCToy), "Torque / UVW");
});

test("ratio is lb-ft per 1,000 lb of the weight used, never horsepower", () => {
  assert.equal(torqueToWeightRatio(450, 9_500)!.toFixed(1), "47.4");
  assert.equal(torqueToWeightRatio(450, 12_500)!.toFixed(1), "36.0");
  assert.equal(torqueToWeightRatio(1250, 33_000)!.toFixed(1), "37.9");
  assert.equal(torqueToWeightRatio(0, 22_000), null);
  assert.equal(parseTorqueLbFt("450 HP"), null);
  assert.equal(parseTorqueLbFt("450 HP / 1,250 lb-ft"), 1250);
  assert.equal(
    computeTorqueToWeight({ torqueRaw: "450 HP", gvwrLbs: 22_000, uvwLbs: 18_000 }).gap,
    true,
  );
  assert.equal(parseUvwLb("22,000 lbs GVWR"), null);
  assert.equal(parseUvwLb("Confirm brochure"), null);
});

test("type label is recorded and does not change either scale", () => {
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

  const diesel = computeTorqueToWeight({
    torqueLbFt: 800,
    uvwLbs: 28_000,
    gvwrLbs: 31_000,
    rvType: "Class A Diesel",
  });
  const superC = computeTorqueToWeight({
    torqueLbFt: 800,
    uvwLbs: 28_000,
    gvwrLbs: 31_000,
    rvType: "Super C",
    fuelType: "Diesel",
    chassis: "Freightliner S2RV",
  });
  assert.equal(diesel.formula, "class-a-diesel");
  assert.equal(superC.formula, "super-c");
  assert.equal(diesel.weightBasis, "UVW");
  assert.equal(superC.weightBasis, "UVW");
  assertNear(diesel.score, superC.score ?? 0, 1e-9);
  assert.equal(diesel.color, superC.color);
});

test("published UVW pin scores; an option-band with no torque stays GAP", () => {
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
  assert.equal(ttw.weightLb, 33_500);
  assert.equal(ttw.uvwLb, 33_500);
  assert.equal(ttw.gvwrLb, 39_600);
  assert.equal(ttw.weightBasis, "UVW");
  assert.equal(ttw.weightEstimated, false);
  assert.equal(ttw.ratio!.toFixed(1), "34.3");
  assert.equal(ttw.color, "yellow");
  assert.equal(formatTorqueWeightBasisChip(ttw), "Torque / UVW");

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
  assert.equal(scored.weightBasis, "GVWR");
  assert.equal(scored.weightEstimated, false);
  assert.notEqual(scored.weightLb, 43_400);
  assert.equal(THIN_CCC_FLAG, "thin-CCC");
});

test("Facts Ratings bar names the weight that scored and does not use the 0.04 scale", () => {
  const src = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.match(src, /Prefer dry weight/);
  assert.match(src, /weightBasis = "UVW"/);
  assert.match(src, /weightBasis = "GVWR"/);
  assert.match(src, /weightEstimated = false/);
  assert.match(src, /6 \+ \(ratio - 32\) \/ 4/);
  assert.match(src, /6 \+ \(ratio - 22\) \/ 3/);
  assert.match(src, /ratio >= 40/);
  assert.match(src, /ratio >= 32/);
  assert.match(src, /ratio >= 28/);
  assert.match(src, /ratio >= 22/);
  assert.match(src, /Torque \/ UVW/);
  assert.match(src, /Torque \/ GVWR/);
  assert.match(src, /Math\.max\(nums\[0]!, nums\[1]!\)/);
  assert.doesNotMatch(src, /UVW never scores/);
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
  assert.match(compute, /barColorFromScore/);
  assert.doesNotMatch(compute, /colorFromGvwrRatio/);
  assert.doesNotMatch(compute, /dryWeightBarColor/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /formatTorqueWeightBasisChip/);
  assert.match(detail, /torqueToWeight\.color/);
  assert.match(detail, /data-testid="facts-tqwt-bar"/);
  assert.match(detail, /data-fill="left-to-right"/);
  assert.doesNotMatch(detail, /UVW \/ dry weight/);
  assert.doesNotMatch(detail, /dryWeightBarColor/);
  assert.doesNotMatch(detail, /formatDryWeightRatio/);
  assert.doesNotMatch(detail, /950 \/ 18000/);
  assert.doesNotMatch(detail, /data-fill="right-to-left"/);
  assert.match(detail, /overrideUvwLbs:\s*weightOverride\?\.uvwLbs/);
  assert.match(detail, /overrideGvwrLbs:\s*weightOverride\?\.gvwrLbs/);
  assert.match(detail, /gvwrRaw:\s*specs\.gvwr/);
  assert.match(detail, /brochure\.uvwEstimated \? null/);
  assert.doesNotMatch(detail, /UVW_ESTIMATE_LABEL/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /ratingStars\(row\.score\)/);

  const brochure = readFileSync(join(root, "brochureSpecs.ts"), "utf8");
  assert.doesNotMatch(brochure, /UVW_ESTIMATE_LABEL/);
  assert.doesNotMatch(brochure, /THIN_CCC_FLAG/);
});
