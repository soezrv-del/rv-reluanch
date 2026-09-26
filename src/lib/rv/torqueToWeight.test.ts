import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findOemFloorplanSpec } from "./floorplanSpecs.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";
import {
  THIN_CCC_FLAG,
  CLASS_A_GAS_TTW_WEIGHT_OFFSET_LB,
  barColorFromScore,
  classAGasScoredWeightLb,
  computeTorqueToWeight,
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
  TORQUE_SCORE_CHAMPIONS,
  torqueScoreThresholds,
  torqueToWeightRatio,
} from "./torqueToWeight.ts";

const root = dirname(fileURLToPath(import.meta.url));

function assertNear(actual: number | null, expected: number, tol = 0.15) {
  assert.ok(actual != null, `expected ~${expected}, got null`);
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `expected ${expected} ±${tol}, got ${actual}`,
  );
}

test("ratio is lb-ft per 1,000 lb weight (never HP)", () => {
  assert.equal(torqueToWeightRatio(468, 24_000), 19.5);
  assert.ok(
    Math.abs((torqueToWeightRatio(800, 31_000) ?? 0) - 25.806451612903224) <
      1e-9,
  );
  assert.ok(Math.abs((torqueToWeightRatio(468, 20_000) ?? 0) - 23.4) < 1e-9);
  assert.equal(torqueToWeightRatio(0, 22_000), null);
  assert.equal(torqueToWeightRatio(468, 0), null);
});

test("Class B / unknown keep the GLOBAL curve (r=45 → 8.75, not 10.0)", () => {
  // Published UVW isolates the global envelope from the #358 estimate.
  const classB = computeTorqueToWeight({
    torqueLbFt: 450,
    uvwLbs: 10_000,
    gvwrLbs: 10_000,
    rvType: "Class B",
    fuelType: "Diesel",
  });
  assert.equal(classB.formula, "global");
  assert.equal(classB.weightBasis, "UVW");
  assertNear(classB.ratio, 45, 0.05);
  assertNear(classB.score, 8.75, 0.05);

  const unknown = computeTorqueToWeight({
    torqueLbFt: 450,
    uvwLbs: 10_000,
    gvwrLbs: 10_000,
  });
  assert.equal(unknown.formula, "global");
  assertNear(unknown.score, 8.75, 0.05);
});

test("1–10 envelope: <10 → 1–2; 10–17 → 3–4; 17–28 → 5–6; 28–45 → 7–8; 45+ → 9–10", () => {
  assertNear(scoreFromTorqueToWeightRatio(0), 1.0);
  assertNear(scoreFromTorqueToWeightRatio(9.999), 2.0, 0.05);
  const midLow = scoreFromTorqueToWeightRatio(13.5);
  assert.ok(midLow != null && midLow >= 3 && midLow < 4);
  const midMid = scoreFromTorqueToWeightRatio(22.5);
  assert.ok(midMid != null && midMid >= 5 && midMid <= 6.2);
  const midHigh = scoreFromTorqueToWeightRatio(36);
  assert.ok(midHigh != null && midHigh >= 7 && midHigh <= 8.3);
  assertNear(scoreFromTorqueToWeightRatio(45), 8.75, 0.05);
  assert.equal(scoreFromTorqueToWeightRatio(null), null);
  assert.equal(scoreFromTorqueToWeightRatio(-1), null);
});

test("locked champion ratios R* (do not drift)", () => {
  assert.equal(TORQUE_SCORE_CHAMPIONS["class-a-diesel"], 38.2);
  assert.equal(TORQUE_SCORE_CHAMPIONS["class-a-gas"], 28.9);
  assert.equal(TORQUE_SCORE_CHAMPIONS["super-c"], 43.2);
  assert.equal(TORQUE_SCORE_CHAMPIONS["class-c"], 38.6);
  const gas = torqueScoreThresholds(28.9);
  assertNear(gas.t1, 0.222 * 28.9, 1e-9);
  assertNear(gas.t2, 0.378 * 28.9, 1e-9);
  assertNear(gas.t3, 0.622 * 28.9, 1e-9);
  assert.equal(gas.t4, 28.9);
});

test("must-pass 1–10 anchors: class-a-gas scores GVWR−1800; other types keep #358 UVW_EST", () => {
  const seneca = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(seneca.weightLb, 29_200);
  assert.equal(seneca.weightBasis, "GVWR");
  assert.equal(seneca.weightEstimated, false);
  assert.equal(seneca.uvwLb, 27_000);
  assert.equal(seneca.uvwEstimateTier, "gas-26k-up");
  assert.equal(seneca.formula, "class-a-gas");
  assertNear(seneca.ratio, 27.4, 0.05);
  assertNear(seneca.score, 8.98);
  assert.equal(seneca.color, "green");
});

test("type detection: Super C / Class C / Class A diesel|gas / global fallback", () => {
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Super C", fuelType: "Diesel" }),
    "super-c",
  );
  assert.equal(
    resolveTorqueScoreFormula({
      rvType: "Class C",
      fuelType: "Diesel",
      chassis: "Freightliner S2RV",
    }),
    "class-c",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Class C", fuelType: "Gas" }),
    "class-c",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Class A Diesel" }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({
      rvType: "Class A",
      fuelType: "Diesel",
    }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({
      rvType: "Class A",
      chassis: "Freightliner XC",
    }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({
      rvType: "Class A",
      chassis: "Spartan K3",
      engine: "Cummins X15 605HP",
    }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({
      rvType: "Class A",
      engine: "Cummins L9 450HP",
    }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({
      rvType: "Class A",
      engine: "Cummins ISB 6.7",
    }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "diesel pusher" }),
    "class-a-diesel",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Class A Gas" }),
    "class-a-gas",
  );
  assert.equal(
    resolveTorqueScoreFormula({
      rvType: "Class A",
      fuelType: "Gas",
      chassis: "Ford F53",
    }),
    "class-a-gas",
  );
  assert.equal(
    resolveTorqueScoreFormula({ rvType: "Class B", fuelType: "Diesel" }),
    "global",
  );
  assert.equal(resolveTorqueScoreFormula({ rvType: "Motorhome" }), "global");
  assert.equal(resolveTorqueScoreFormula({}), "global");
});

test("champions land at 10.0 on the #358 weight; peers use the matching type formula", () => {
  const dream = computeTorqueToWeight({
    torqueLbFt: 1950,
    gvwrLbs: 51_000,
    rvType: "Class A Diesel",
    chassis: "Spartan K3",
    engine: "Cummins X15 605HP",
  });
  assert.equal(dream.weightBasis, "UVW_EST");
  assert.equal(dream.weightLb, 42_600);
  assertNear(dream.ratio, 45.77, 0.05);
  assertNear(dream.score, 10.0, 0.05);
  assert.equal(dream.formula, "class-a-diesel");
  assert.equal(dream.color, "green");

  const alante = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 18_000,
    rvType: "Class A Gas",
    chassis: "Ford F53",
  });
  assert.equal(alante.weightBasis, "GVWR");
  assert.equal(alante.weightLb, 16_200);
  assert.equal(alante.uvwLb, 15_800);
  assertNear(alante.ratio, 28.89, 0.02);
  assertNear(alante.score, 10.0, 0.05);
  assert.equal(alante.formula, "class-a-gas");
  assert.equal(alante.color, "green");

  const lineage = computeTorqueToWeight({
    torqueLbFt: 950,
    gvwrLbs: 22_000,
    rvType: "Super C",
    fuelType: "Diesel",
    chassis: "Ford F-600",
  });
  assert.equal(lineage.weightBasis, "UVW_EST");
  assert.equal(lineage.weightLb, 18_000);
  assertNear(lineage.ratio, 52.78, 0.05);
  assertNear(lineage.score, 10.0, 0.05);
  assert.equal(lineage.formula, "super-c");
  assert.equal(lineage.color, "green");

  const sunseeker = computeTorqueToWeight({
    torqueLbFt: 400,
    gvwrLbs: 10_360,
    rvType: "Class C",
    fuelType: "Gas",
    chassis: "Ford Transit",
  });
  assert.equal(sunseeker.weightBasis, "UVW_EST");
  assert.equal(sunseeker.weightLb, 9_100);
  assertNear(sunseeker.ratio, 43.96, 0.05);
  assertNear(sunseeker.score, 10.0, 0.05);
  assert.equal(sunseeker.formula, "class-c");
  assert.equal(sunseeker.color, "green");

  // Precept 31UL — Class A Gas scores 22,000 − 1,800 = 20,200 (below R* 28.9).
  const p31 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(p31.weightLb, 20_200);
  assert.equal(p31.weightBasis, "GVWR");
  assert.equal(p31.weightEstimated, false);
  assert.equal(p31.uvwLb, 18_000);
  assert.equal(p31.uvwEstimateTier, "gas-20k-24k");
  assertNear(p31.ratio, 23.17, 0.05);
  assertNear(p31.score, 8.09);
  assert.ok((p31.score ?? 0) < 10, `Precept must sit below the Alante R* ceiling`);
  assert.equal(p31.formula, "class-a-gas");
  assert.equal(p31.color, "green");

  const p36 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(p36.weightLb, 22_200);
  assert.equal(p36.weightBasis, "GVWR");
  assert.equal(p36.uvwLb, 19_700);
  assertNear(p36.ratio, 21.08, 0.05);
  assertNear(p36.score, 7.65);
  assert.equal(p36.formula, "class-a-gas");
  assert.equal(p36.color, "yellow");

  // Seneca Super C — Freightliner uses diesel-pusher UVW, Super C curve.
  const seneca = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Super C",
    fuelType: "Diesel",
    chassis: "Freightliner S2RV Plus",
    engine: "Cummins ISB 6.7L 360HP",
  });
  assert.equal(seneca.weightBasis, "UVW_EST");
  assert.equal(seneca.weightLb, 25_900);
  assertNear(seneca.ratio, 30.89, 0.05);
  assertNear(seneca.score, 7.57);
  assert.equal(seneca.formula, "super-c");
  assert.equal(seneca.color, "yellow");

  // Same numbers typed Class A Diesel (ISB on Class A).
  const senecaDiesel = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Class A Diesel",
    engine: "Cummins ISB 6.7",
  });
  assert.equal(senecaDiesel.formula, "class-a-diesel");
  assert.equal(senecaDiesel.weightLb, 25_900);
  assertNear(senecaDiesel.score, 8.14);

  // Greyhawk — Class C E-450, 14,500 × 0.88 → 12,800.
  const greyhawk = computeTorqueToWeight({
    torqueLbFt: 450,
    gvwrLbs: 14_500,
    rvType: "Class C",
    chassis: "Ford E-450",
  });
  assert.equal(greyhawk.weightLb, 12_800);
  assert.equal(greyhawk.weightBasis, "UVW_EST");
  assertNear(greyhawk.ratio, 35.16, 0.05);
  assertNear(greyhawk.score, 8.76);
  assert.equal(greyhawk.formula, "class-c");
  assert.equal(greyhawk.color, "green");

  const cornerstone = computeTorqueToWeight({
    torqueLbFt: 1950,
    gvwrLbs: 54_000,
    rvType: "Class A Diesel",
  });
  assert.equal(cornerstone.weightLb, 45_100);
  assert.equal(cornerstone.weightBasis, "UVW_EST");
  assertNear(cornerstone.ratio, 43.24, 0.05);
  assertNear(cornerstone.score, 10.0);
  assert.equal(cornerstone.color, "green");

  const d1250 = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 32_000,
    rvType: "Class A Diesel",
  });
  assert.equal(d1250.weightLb, 26_700);
  assert.equal(d1250.weightBasis, "UVW_EST");
  assertNear(d1250.ratio, 46.82, 0.05);
  assertNear(d1250.score, 10.0);
  assert.equal(d1250.color, "green");

  const d1950 = computeTorqueToWeight({
    torqueLbFt: 1950,
    gvwrLbs: 40_000,
    rvType: "Class A Diesel",
  });
  assert.equal(d1950.weightLb, 33_400);
  assert.equal(d1950.weightBasis, "UVW_EST");
  assertNear(d1950.ratio, 58.38, 0.1);
  assertNear(d1950.score, 10.0);
  assert.equal(d1950.color, "green");

  const classC = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 10_000,
    rvType: "Class C",
  });
  assert.equal(classC.weightLb, 8_800);
  assert.equal(classC.weightBasis, "UVW_EST");
  assert.equal(classC.uvwEstimateTier, "gas-under-20k");
  assertNear(classC.ratio, 53.18, 0.05);
  assertNear(classC.score, 10.0);
  assert.equal(classC.color, "green");

  const isb = computeTorqueToWeight({
    torqueLbFt: 700,
    gvwrLbs: 30_000,
    rvType: "Class A Diesel",
  });
  assert.equal(isb.weightLb, 25_100);
  assert.equal(isb.weightBasis, "UVW_EST");
  assertNear(isb.ratio, 27.89, 0.05);
  assertNear(isb.score, 7.66);
  assert.equal(isb.color, "yellow");
});

test("bar color: red < 6.0, yellow [6.0, 8.0), green ≥ 8.0", () => {
  assert.equal(barColorFromScore(5.99), "red");
  assert.equal(barColorFromScore(6.0), "yellow");
  assert.equal(barColorFromScore(7.0), "yellow");
  assert.equal(barColorFromScore(7.4), "yellow");
  assert.equal(barColorFromScore(7.49), "yellow");
  assert.equal(barColorFromScore(7.5), "yellow");
  assert.equal(barColorFromScore(7.99), "yellow");
  assert.equal(barColorFromScore(8.0), "green");
  assert.equal(barColorFromScore(null), null);
});

test("UVW preferred over GVWR except class-a-gas; GAP if torque and both weights missing", () => {
  const preferUvw = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 20_000,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
  });
  assert.equal(preferUvw.weightBasis, "GVWR");
  assert.equal(preferUvw.weightOverridden, false);
  assert.equal(preferUvw.weightLb, 22_200);
  assert.equal(preferUvw.uvwLb, 20_000);
  assert.equal(preferUvw.gvwrLb, 24_000);
  assert.ok(Math.abs((preferUvw.ratio ?? 0) - 21.08108108108108) < 1e-9);
  assert.match(formatTorqueToWeightScore(preferUvw), /^[0-9.]+\/10$/);
  assert.equal(formatTorqueWeightBasisChip(preferUvw), null);

  const unloadedRaw = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwRaw: "18,000 lbs unloaded",
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assert.equal(unloadedRaw.weightBasis, "GVWR");
  assert.equal(unloadedRaw.weightLb, 20_200);
  assert.equal(unloadedRaw.uvwLb, 18_000);
  assertNear(unloadedRaw.score, 8.09);

  const gvwrOnly = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Super C",
    fuelType: "Diesel",
  });
  assert.equal(gvwrOnly.weightBasis, "UVW_EST");
  assert.equal(gvwrOnly.weightEstimated, true);
  assert.equal(gvwrOnly.weightLb, 27_000);
  assert.equal(gvwrOnly.formula, "super-c");
  assert.equal(
    formatTorqueToWeightScore(gvwrOnly),
    `${gvwrOnly.score?.toFixed(1)}/10`,
  );
  assert.equal(formatTorqueWeightBasisChip(gvwrOnly), null);

  assert.equal(formatTorqueToWeightScore(computeTorqueToWeight({})), "GAP");
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ torqueLbFt: 468 })),
    "GAP",
  );
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ gvwrLbs: 22_000 })),
    "GAP",
  );
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ uvwLbs: 18_000 })),
    "GAP",
  );
  const uvwAlone = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 18_000,
    rvType: "Class A Gas",
  });
  assert.equal(uvwAlone.weightBasis, null);
  assert.equal(uvwAlone.weightLb, null);
  assert.equal(uvwAlone.uvwLb, 18_000);
  assert.equal(uvwAlone.gap, true);
  assert.equal(formatTorqueToWeightScore(uvwAlone), "GAP");
});

test("override preference: UVW override → UVW → estimated UVW → GVWR → GAP", () => {
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

  const publishedUvw = resolveTorqueWeight({
    uvwLbs: 18_000,
    overrideGvwrLbs: 21_000,
    gvwrLbs: 22_000,
  });
  assert.equal(publishedUvw.weightLb, 18_000);
  assert.equal(publishedUvw.weightBasis, "UVW");
  assert.equal(publishedUvw.weightOverridden, false);
  assert.equal(publishedUvw.weightEstimated, false);

  const estimated = resolveTorqueWeight({
    overrideGvwrLbs: 21_000,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(estimated.weightLb, 19_200);
  assert.equal(estimated.weightBasis, "GVWR");
  assert.equal(estimated.weightEstimated, false);
  assert.equal(estimated.weightOverridden, true);
  assert.equal(estimated.uvwLb, 17_200);

  const publishedGvwr = resolveTorqueWeight({
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(publishedGvwr.weightLb, 20_200);
  assert.equal(publishedGvwr.weightBasis, "GVWR");
  assert.equal(publishedGvwr.weightEstimated, false);
  assert.equal(publishedGvwr.uvwLb, 18_000);

  assert.equal(resolveTorqueWeight({}).weightLb, null);
  assert.equal(resolveTorqueWeight({}).weightEstimated, false);

  const scored = computeTorqueToWeight({
    torqueLbFt: 800,
    uvwLbs: 26_000,
    gvwrLbs: 31_000,
    overrideUvwLbs: 25_000,
    rvType: "Class C",
  });
  assert.equal(scored.weightLb, 25_000);
  assert.equal(formatTorqueToWeightScore(scored), `${scored.score?.toFixed(1)}/10`);
  assert.equal(formatTorqueWeightBasisChip(scored), null);
});

test("missing torque|weight → GAP; towables N/A", () => {
  assert.equal(isTowableForTorqueRating("Travel Trailer"), true);
  assert.equal(isTowableForTorqueRating("Class A Diesel"), false);
  const tt = computeTorqueToWeight({
    torqueLbFt: 800,
    uvwLbs: 20_000,
    gvwrLbs: 31_000,
    rvType: "Travel Trailer",
  });
  assert.equal(tt.na, true);
  assert.equal(tt.score, null);
  assert.equal(formatTorqueToWeightScore(tt), "N/A");
});

test("never uses horsepower as torque; UVW labeled vs GVWR labeled", () => {
  assert.equal(parseTorqueLbFt("450 HP"), null);
  assert.equal(parseTorqueLbFt("450 HP / 1,250 lb-ft"), 1250);
  assert.equal(parseUvwLb("18,000 lbs UVW"), 18_000);
  assert.equal(parseUvwLb("18,000 lbs unloaded"), 18_000);
  assert.equal(parseUvwLb("22,000 lbs GVWR"), null);
  assert.equal(parseGvwrLb("22,000 lbs GVWR"), 22_000);
  assert.equal(parseGvwrLb("18,000 lbs UVW"), null);
  assert.equal(parseGvwrLb("18,000 lbs unloaded"), null);
  assert.equal(
    computeTorqueToWeight({ torqueRaw: "450 HP", uvwLbs: 20_000 }).gap,
    true,
  );
});

test("TTW range GVWR uses HIGH end; published pin wins over range", () => {
  assert.equal(parseGvwrLb("39500-44005"), 44005);
  assert.equal(parseGvwrLb("39,500–44,005 lbs"), 44005);
  assert.equal(parseGvwrLb("39,500—44,005 lbs GVWR"), 44005);
  assert.equal(parseGvwrLb([39_500, 44_005]), 44005);
  assert.equal(parseGvwrLb([44_005, 39_500]), 44005);
  assert.equal(parseGvwrLb("47000"), 47000);
  assert.equal(parseGvwrLb("47,000 lbs GVWR"), 47000);
  assert.equal(parseGvwrLb("39,500–44,005 lbs UVW"), null);
  assert.equal(parseUvwLb("39,500–44,005 lbs"), null);

  const rangeOnly = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrRaw: "39500-44005",
    rvType: "Class A Diesel",
  });
  assert.equal(rangeOnly.gvwrLb, 44005);
  assert.equal(rangeOnly.weightLb, 36_700);
  assert.equal(rangeOnly.weightBasis, "UVW_EST");
  assert.equal(rangeOnly.weightEstimated, true);
  assert.match(
    formatTorqueToWeightScore(rangeOnly),
    /^[0-9.]+\/10$/,
  );

  const displayBand = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrRaw: "39,500–44,005 lbs",
    rvType: "Class A Diesel",
  });
  assert.equal(displayBand.gvwrLb, 44005);
  assert.equal(displayBand.weightLb, 36_700);

  const tupleBand = computeTorqueToWeight({
    torqueLbFt: 1250,
    weightRange: [39_500, 44_005],
    rvType: "Class A Diesel",
  });
  assert.equal(tupleBand.gvwrLb, 44005);
  assert.equal(tupleBand.weightLb, 36_700);

  const publishedWins = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 47_000,
    gvwrRaw: "39,500–44,005 lbs",
    weightRange: [39_500, 44_005],
    rvType: "Class A Diesel",
  });
  assert.equal(publishedWins.gvwrLb, 47_000);
  assert.equal(publishedWins.weightLb, 39_200);
  assert.equal(publishedWins.weightBasis, "UVW_EST");
});

test("estimateUvwFromGvwr uses the three-tier formula; missing GVWR stays unset", () => {
  assert.equal(
    estimateUvwFromGvwr(52_000, { rvType: "Class A Diesel", chassis: "Spartan" }),
    43_400,
  );
  assert.equal(
    estimateUvwFromGvwr(22_000, { rvType: "Class A Gas", chassis: "Ford F-53" }),
    18_000,
  );
  assert.equal(
    estimateUvwFromGvwr(18_000, { rvType: "Class A Gas", chassis: "Ford F-53" }),
    15_800,
  );
  assert.equal(
    estimateUvwFromGvwr(26_000, { rvType: "Class A Gas", chassis: "Ford F-53" }),
    22_600,
  );
  assert.equal(
    estimateUvwFromGvwr(47_000, { rvType: "Class A Diesel", chassis: "Spartan" }),
    39_200,
  );
  assert.equal(estimateUvwFromGvwr(0), null);
  assert.equal(estimateUvwFromGvwr(null), null);
  assert.equal(estimateUvwFromGvwrFlat835(22_000), 18_400);
});

test("2022 American Dream 39RK stays pinned 39,237 — not re-estimated", () => {
  const pinned = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwLbs: 39_237,
    gvwrLbs: 47_000,
    rvType: "Class A Diesel",
  });
  assert.equal(pinned.weightLb, 39_237);
  assert.equal(pinned.uvwLb, 39_237);
  assert.equal(pinned.weightBasis, "UVW");
  assert.equal(pinned.weightEstimated, false);
  assertNear(pinned.ratio, 31.86, 0.02);
  assertNear(pinned.score, 8.29);
  assert.equal(pinned.color, "green");
  assert.equal(formatTorqueWeightBasisChip(pinned), null);

  const wouldEstimate = estimateUvwFromGvwr(47_000, {
    rvType: "Class A Diesel",
    chassis: "Spartan",
  });
  assert.equal(wouldEstimate, 39_200);
  assert.notEqual(pinned.weightLb, wouldEstimate);
});

test("Anthem 44R sample: 52,000 × 0.835 → 43,400 at 1,250 lb-ft", () => {
  const anthem = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 52_000,
    rvType: "Class A Diesel",
    chassis: "Spartan K2",
  });
  assert.equal(anthem.weightLb, 43_400);
  assert.equal(anthem.weightBasis, "UVW_EST");
  assert.equal(anthem.weightEstimated, true);
  assertNear(anthem.ratio, 28.80, 0.02);
  assertNear(anthem.score, 7.80);
  assert.equal(anthem.color, "yellow");
  assert.equal(formatTorqueWeightBasisChip(anthem), null);
});

test("2023 Phaeton 40IH: option-band pin still scores published L9 380 / 1,150 on OEM UVW", () => {
  const pin = findPowertrainCorrection("2023", "Tiffin", "Phaeton", "40IH");
  assert.ok(pin);
  assert.equal(pin!.horsepower, 0);
  assert.match(pin!.engine, /380HP std \/ L9 450HP opt/);
  assert.equal(pin!.torqueLbFt, 1150);

  const oem = findOemFloorplanSpec("2023", "Tiffin", "Phaeton", "40IH");
  assert.ok(oem);
  assert.equal(oem!.uvwLbs, 33_500);
  assert.equal(oem!.gvwrLbs, 39_600);

  const guardSrc = readFileSync(join(root, "livePowertrainGuard.ts"), "utf8");
  assert.match(guardSrc, /pin\.torqueLbFt != null && pin\.torqueLbFt > 0/);
  assert.match(guardSrc, /engineOmitsLoneTorque\(pin\.engine\) \? null : base\.torqueLbFt/);
  assert.match(
    readFileSync(join(root, "../../components/rvfax/RvDetail.tsx"), "utf8"),
    /torqueLbFt:\s*powertrainGuard\.hard\.torqueLbFt/,
  );

  const ttw = computeTorqueToWeight({
    torqueLbFt: pin!.torqueLbFt,
    uvwLbs: oem!.uvwLbs,
    gvwrLbs: oem!.gvwrLbs,
    rvType: "Class A Diesel",
    fuelType: "Diesel",
    chassis: pin!.chassis,
    engine: pin!.engine,
  });
  assert.equal(ttw.gap, false);
  assert.equal(ttw.torqueLbFt, 1150);
  assert.equal(ttw.weightLb, 33_500);
  assert.equal(ttw.weightBasis, "UVW");
  assert.equal(ttw.formula, "class-a-diesel");
  assertNear(ttw.ratio, 34.33, 0.02);
  assertNear(ttw.score, 8.68);
  assert.equal(ttw.color, "green");
  assert.equal(formatTorqueToWeightScore(ttw), "8.7/10");
  assert.equal(formatTorqueWeightBasisChip(ttw), null);

  // True L9/X15 option-band with no published pin torque stays GAP.
  const bus = findPowertrainCorrection("2023", "Tiffin", "Allegro Bus", "45OPP");
  assert.ok(bus);
  assert.equal(bus!.torqueLbFt, undefined);
  assert.match(bus!.engine, /L9 450HP std \/ X15 605HP opt/);
  assert.equal(
    computeTorqueToWeight({
      torqueLbFt: bus!.torqueLbFt,
      torqueRaw: "—",
      gvwrLbs: 50_000,
      rvType: "Class A Diesel",
      fuelType: "Diesel",
      engine: bus!.engine,
    }).gap,
    true,
  );
});

test("Facts Ratings: Torque-to-Weight bar + X/10 only; other rows keep stars", () => {
  const src = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.match(src, /override UVW → published UVW → estimated UVW/);
  assert.match(src, /class-a-gas: scored weightLb is GVWR/);
  assert.match(src, /CLASS_A_GAS_TTW_WEIGHT_OFFSET_LB = 1800/);
  assert.match(src, /0\.835/);
  assert.match(src, /0\.88/);
  assert.match(src, /0\.82/);
  assert.match(src, /0\.87/);
  assert.match(src, /estimated via tiered GVWR formula/);
  assert.match(src, /torqueLbFt \/ weightLb/);
  assert.match(src, /Math\.max\(nums\[0]!, nums\[1]!\)/);
  assert.match(src, /HIGH end/);
  assert.doesNotMatch(src, /Math\.min\(nums\[0]!, nums\[1]!\)/);
  assert.match(src, /score < 6/);
  assert.match(src, /score < 8/);
  assert.match(src, /Class B \/ unknown motorized: GLOBAL/);
  assert.match(src, /t4 = R\*/);
  assert.match(src, /0\.222 \* R\*/);
  assert.doesNotMatch(src, /score < 3/);
  assert.doesNotMatch(src, /score < 4[^.0-9]/);
  assert.doesNotMatch(src, /mid\s*\*\s*0\.82/);
  assert.match(src, /result\.score\.toFixed\(1\)\}\/10`/);
  assert.doesNotMatch(src, /\/10 · \$\{/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /Torque-to-Weight/);
  assert.match(detail, /formatTorqueToWeightScore/);
  assert.match(detail, /data-testid="facts-tqwt-bar"/);
  assert.match(detail, /data-fill="left-to-right"/);
  assert.doesNotMatch(detail, /data-fill="right-to-left"/);
  assert.match(detail, /score \/ 10/);
  assert.match(detail, /overrideUvwLbs:\s*weightOverride\?\.uvwLbs/);
  assert.match(detail, /overrideGvwrLbs:\s*weightOverride\?\.gvwrLbs/);
  assert.match(detail, /WeightOverrideRow/);
  assert.match(detail, /estimatedLbs/);
  assert.match(detail, /uvwRaw:[\s\S]{0,160}brochure\.uvwEstimated/);
  assert.match(detail, /gvwrRaw:\s*specs\.gvwr/);
  assert.match(detail, /chassis:\s*powertrainGuard\.hard\.chassis/);
  assert.match(detail, /engine:\s*powertrainGuard\.hard\.engine/);
  assert.match(detail, /OWNER_REVIEW_FOOTER/);
  const ratingsAt = detail.indexOf('data-testid="facts-ratings"');
  const ratingsBlock = detail.slice(
    ratingsAt,
    detail.indexOf("data-facts-market-value", ratingsAt),
  );
  assert.doesNotMatch(ratingsBlock, /OWNER_REVIEW_FOOTER/);
  assert.doesNotMatch(ratingsBlock, /n≥15|n≥8|RV Insider|hard math/);
  assert.doesNotMatch(detail, /formatTorqueWeightBasisChip/);
  assert.doesNotMatch(detail, /UVW_ESTIMATE_LABEL/);
  assert.doesNotMatch(detail, /THIN_CCC_FLAG/);
  assert.doesNotMatch(detail, /facts-tqwt-thin-ccc/);
  assert.doesNotMatch(detail, /facts-tqwt-basis/);
  assert.doesNotMatch(detail, /estimatedLabel/);
  assert.doesNotMatch(detail, /torqueToWeight\.stars/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /ratingStars\(row\.score\)/);

  const brochure = readFileSync(join(root, "brochureSpecs.ts"), "utf8");
  assert.doesNotMatch(brochure, /UVW_ESTIMATE_LABEL/);
  assert.doesNotMatch(brochure, /THIN_CCC_FLAG/);
  assert.doesNotMatch(brochure, /thinCccNote/);
});

test("tiered UVW: diesel pusher vs gas/other; 25k gap; thin-CCC", () => {
  assert.equal(
    isDieselPusherForUvwEstimate({ chassis: "Freightliner XC", rvType: "Class A" }),
    true,
  );
  assert.equal(
    isDieselPusherForUvwEstimate({ chassis: "Spartan K2", rvType: "Class A Diesel" }),
    true,
  );
  assert.equal(
    isDieselPusherForUvwEstimate({ chassis: "Ford F-53", rvType: "Class A Diesel" }),
    false,
  );
  assert.equal(
    isDieselPusherForUvwEstimate({
      chassis: "Mercedes-Benz Sprinter 3500XD",
      rvType: "Class C",
      fuelType: "Diesel",
    }),
    false,
  );

  const diesel = estimateUvwFromGvwrDetailed(52_000, {
    chassis: "Freightliner",
    rvType: "Class A Diesel",
  });
  assert.equal(diesel?.tier, "diesel-pusher");
  assert.equal(diesel?.factor, 0.835);
  assert.equal(diesel?.uvwLbs, 43_400);

  const under20 = estimateUvwFromGvwrDetailed(18_000, {
    chassis: "Ford F-53",
    rvType: "Class A Gas",
  });
  assert.equal(under20?.tier, "gas-under-20k");
  assert.equal(under20?.factor, 0.88);
  assert.equal(under20?.uvwLbs, 15_800);

  const midGas = estimateUvwFromGvwrDetailed(22_000, {
    chassis: "Ford F-53",
    rvType: "Class A Gas",
    cccLbs: 2_400,
  });
  assert.equal(midGas?.tier, "gas-20k-24k");
  assert.equal(midGas?.factor, 0.82);
  assert.equal(midGas?.uvwLbs, 18_000);
  assert.equal(midGas?.thinCcc, true);

  const midGasRoomy = estimateUvwFromGvwrDetailed(22_000, {
    chassis: "Ford F-53",
    rvType: "Class A Gas",
    cccLbs: 4_000,
  });
  assert.equal(midGasRoomy?.thinCcc, false);

  const heavyGas = estimateUvwFromGvwrDetailed(26_000, {
    chassis: "Ford F-53",
    rvType: "Class A Gas",
  });
  assert.equal(heavyGas?.tier, "gas-26k-up");
  assert.equal(heavyGas?.factor, 0.87);
  assert.equal(heavyGas?.uvwLbs, 22_600);

  const exactly25k = estimateUvwFromGvwrDetailed(25_000, {
    chassis: "Ford F-53",
    rvType: "Class A Gas",
  });
  assert.equal(exactly25k?.factor, 0.82);
  assert.equal(exactly25k?.tier, "gas-20k-24k");
  assert.equal(exactly25k?.gapBand, true);
  assert.equal(exactly25k?.uvwLbs, 20_500);

  const justOver25k = estimateUvwFromGvwrDetailed(25_001, {
    chassis: "Ford F-53",
    rvType: "Class A Gas",
  });
  assert.equal(justOver25k?.factor, 0.87);
  assert.equal(justOver25k?.tier, "gas-26k-up");
  assert.equal(justOver25k?.gapBand, true);

  const thinScored = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
    cccLbs: 2_800,
  });
  assert.equal(thinScored.thinCcc, true);
  assert.equal(thinScored.weightLb, 20_200);
  assert.equal(thinScored.uvwLb, 18_000);
  assert.equal(THIN_CCC_FLAG, "thin-CCC");
});

test("class-a-gas scores GVWR−1800 across the board; other formulas keep #358 weight", () => {
  assert.equal(CLASS_A_GAS_TTW_WEIGHT_OFFSET_LB, 1800);
  assert.equal(classAGasScoredWeightLb(18_000), 16_200);
  assert.equal(classAGasScoredWeightLb(22_000), 20_200);
  assert.equal(classAGasScoredWeightLb(1_800), null);
  assert.equal(classAGasScoredWeightLb(1_000), null);
  assert.equal(classAGasScoredWeightLb(null), null);

  const gasOverride = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 18_040,
    gvwrLbs: 22_000,
    overrideUvwLbs: 17_000,
    rvType: "Class A Gas",
  });
  assert.equal(gasOverride.weightLb, 20_200);
  assert.equal(gasOverride.weightBasis, "GVWR");
  assert.equal(gasOverride.weightEstimated, false);
  assert.equal(gasOverride.uvwLb, 17_000);
  assertNear(gasOverride.ratio, 23.17, 0.05);

  const dieselUnchanged = computeTorqueToWeight({
    torqueLbFt: 1950,
    gvwrLbs: 51_000,
    rvType: "Class A Diesel",
    chassis: "Spartan K3",
  });
  assert.equal(dieselUnchanged.weightLb, 42_600);
  assert.equal(dieselUnchanged.weightBasis, "UVW_EST");
  assert.equal(dieselUnchanged.formula, "class-a-diesel");

  const classCUnchanged = computeTorqueToWeight({
    torqueLbFt: 400,
    gvwrLbs: 10_360,
    rvType: "Class C",
    chassis: "Ford Transit",
  });
  assert.equal(classCUnchanged.weightLb, 9_100);
  assert.equal(classCUnchanged.weightBasis, "UVW_EST");
  assert.equal(classCUnchanged.formula, "class-c");

  const superCUnchanged = computeTorqueToWeight({
    torqueLbFt: 950,
    gvwrLbs: 22_000,
    rvType: "Super C",
    fuelType: "Diesel",
  });
  assert.equal(superCUnchanged.weightLb, 18_000);
  assert.equal(superCUnchanged.weightBasis, "UVW_EST");
  assert.equal(superCUnchanged.formula, "super-c");
});
