import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  UVW_ESTIMATE_LABEL,
  barColorFromScore,
  computeTorqueToWeight,
  estimateUvwFromGvwr,
  formatTorqueToWeightScore,
  formatTorqueWeightBasisChip,
  isTowableForTorqueRating,
  parseGvwrLb,
  parseTorqueLbFt,
  parseUvwLb,
  resolveTorqueWeight,
  scoreFromTorqueToWeightRatio,
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

test("must-pass 1–10 anchors (±0.15) use estimated UVW when published UVW is missing", () => {
  const seneca = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Class A Gas",
  });
  assert.equal(seneca.weightLb, 25_900);
  assert.equal(seneca.weightBasis, "UVW_EST");
  assert.equal(seneca.weightEstimated, true);
  assertNear(seneca.ratio, 30.89, 0.05);
  assertNear(seneca.score, 7.39);
  assert.equal(seneca.color, "yellow");

  const p31 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assert.equal(p31.weightLb, 18_400);
  assert.equal(p31.weightBasis, "UVW_EST");
  assertNear(p31.ratio, 25.43, 0.05);
  assertNear(p31.score, 5.92);
  assert.equal(p31.color, "red");

  const p36 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
  });
  assert.equal(p36.weightLb, 20_000);
  assert.equal(p36.weightBasis, "UVW_EST");
  assertNear(p36.ratio, 23.4, 0.05);
  assertNear(p36.score, 5.45);
  assert.equal(p36.color, "red");

  const cornerstone = computeTorqueToWeight({
    torqueLbFt: 1950,
    gvwrLbs: 54_000,
    rvType: "Class A Diesel",
  });
  assert.equal(cornerstone.weightLb, 45_100);
  assert.equal(cornerstone.weightBasis, "UVW_EST");
  assertNear(cornerstone.ratio, 43.24, 0.05);
  assertNear(cornerstone.score, 9.06);
  assert.equal(cornerstone.color, "green");

  const d1250 = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 32_000,
    rvType: "Class A Diesel",
  });
  assert.equal(d1250.weightLb, 26_700);
  assert.equal(d1250.weightBasis, "UVW_EST");
  assertNear(d1250.ratio, 46.82, 0.05);
  assertNear(d1250.score, 9.11);
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
  assert.equal(classC.weightLb, 8_400);
  assert.equal(classC.weightBasis, "UVW_EST");
  assertNear(classC.ratio, 55.71, 0.05);
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
  assertNear(isb.score, 6.47);
  assert.equal(isb.color, "yellow");
});

test("bar color: red < 6.0, yellow [6.0, 7.5), green ≥ 7.5", () => {
  assert.equal(barColorFromScore(5.99), "red");
  assert.equal(barColorFromScore(6.0), "yellow");
  assert.equal(barColorFromScore(7.0), "yellow");
  assert.equal(barColorFromScore(7.4), "yellow");
  assert.equal(barColorFromScore(7.49), "yellow");
  assert.equal(barColorFromScore(7.5), "green");
  assert.equal(barColorFromScore(8.0), "green");
  assert.equal(barColorFromScore(null), null);
});

test("UVW preferred over GVWR; GAP if torque and both weights missing", () => {
  const preferUvw = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 20_000,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
  });
  assert.equal(preferUvw.weightBasis, "UVW");
  assert.equal(preferUvw.weightOverridden, false);
  assert.equal(preferUvw.weightLb, 20_000);
  assert.equal(preferUvw.uvwLb, 20_000);
  assert.equal(preferUvw.gvwrLb, 24_000);
  assert.ok(Math.abs((preferUvw.ratio ?? 0) - 23.4) < 1e-9);
  assert.match(formatTorqueToWeightScore(preferUvw), /^[0-9.]+\/10 · UVW$/);
  assert.equal(formatTorqueWeightBasisChip(preferUvw), "UVW");

  const unloadedRaw = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwRaw: "18,000 lbs unloaded",
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assert.equal(unloadedRaw.weightBasis, "UVW");
  assert.equal(unloadedRaw.weightLb, 18_000);
  assert.equal(unloadedRaw.uvwLb, 18_000);

  const gvwrOnly = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Class A Gas",
  });
  assert.equal(gvwrOnly.weightBasis, "UVW_EST");
  assert.equal(gvwrOnly.weightEstimated, true);
  assert.equal(gvwrOnly.weightLb, 25_900);
  assert.equal(
    formatTorqueToWeightScore(gvwrOnly),
    `${gvwrOnly.score?.toFixed(1)}/10 · ${UVW_ESTIMATE_LABEL}`,
  );
  assert.equal(formatTorqueWeightBasisChip(gvwrOnly), UVW_ESTIMATE_LABEL);

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
  assert.equal(uvwAlone.weightBasis, "UVW");
  assert.equal(uvwAlone.weightLb, 18_000);
  assert.equal(uvwAlone.gap, false);
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
  });
  assert.equal(estimated.weightLb, 17_500);
  assert.equal(estimated.weightBasis, "UVW_EST");
  assert.equal(estimated.weightEstimated, true);
  assert.equal(estimated.weightOverridden, false);

  const publishedGvwr = resolveTorqueWeight({ gvwrLbs: 22_000 });
  assert.equal(publishedGvwr.weightLb, 18_400);
  assert.equal(publishedGvwr.weightBasis, "UVW_EST");
  assert.equal(publishedGvwr.weightEstimated, true);

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
  assert.equal(formatTorqueToWeightScore(scored), `${scored.score?.toFixed(1)}/10 · UVW override`);
  assert.equal(formatTorqueWeightBasisChip(scored), "Override");
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
    new RegExp(`^[0-9.]+/10 · ${UVW_ESTIMATE_LABEL.replace(/[×.]/g, "\\$&")}$`),
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

test("estimateUvwFromGvwr is nearest 100 lb at 0.835; missing GVWR stays unset", () => {
  assert.equal(estimateUvwFromGvwr(52_000), 43_400);
  assert.equal(estimateUvwFromGvwr(22_000), 18_400);
  assert.equal(estimateUvwFromGvwr(47_000), 39_200);
  assert.equal(estimateUvwFromGvwr(0), null);
  assert.equal(estimateUvwFromGvwr(null), null);
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
  assertNear(pinned.score, 7.52);
  assert.equal(pinned.color, "green");
  assert.equal(formatTorqueWeightBasisChip(pinned), "UVW");

  const wouldEstimate = estimateUvwFromGvwr(47_000);
  assert.equal(wouldEstimate, 39_200);
  assert.notEqual(pinned.weightLb, wouldEstimate);
});

test("Anthem 44R sample: 52,000 × 0.835 → 43,400 at 1,250 lb-ft", () => {
  const anthem = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 52_000,
    rvType: "Class A Diesel",
  });
  assert.equal(anthem.weightLb, 43_400);
  assert.equal(anthem.weightBasis, "UVW_EST");
  assert.equal(anthem.weightEstimated, true);
  assertNear(anthem.ratio, 28.80, 0.02);
  assertNear(anthem.score, 7.11);
  assert.equal(anthem.color, "yellow");
  assert.equal(formatTorqueWeightBasisChip(anthem), UVW_ESTIMATE_LABEL);
});

test("Facts Ratings: Torque-to-Weight bar + X/10 · UVW|GVWR; other rows keep stars", () => {
  const src = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.match(src, /override UVW → published UVW → estimated UVW/);
  assert.match(src, /0\.835/);
  assert.match(src, /estimated via GVWR/);
  assert.match(src, /torqueLbFt \/ weightLb/);
  assert.match(src, /Math\.max\(nums\[0]!, nums\[1]!\)/);
  assert.match(src, /HIGH end/);
  assert.doesNotMatch(src, /Math\.min\(nums\[0]!, nums\[1]!\)/);
  assert.match(src, /score < 6/);
  assert.match(src, /score < 7\.5/);
  assert.doesNotMatch(src, /score < 3/);
  assert.doesNotMatch(src, /score < 4[^.0-9]/);
  assert.doesNotMatch(src, /mid\s*\*\s*0\.82/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /Torque-to-Weight/);
  assert.match(detail, /formatTorqueToWeightScore/);
  assert.match(detail, /formatTorqueWeightBasisChip/);
  assert.match(detail, /data-testid="facts-tqwt-bar"/);
  assert.match(detail, /score \/ 10/);
  assert.match(detail, /overrideUvwLbs:\s*weightOverride\?\.uvwLbs/);
  assert.match(detail, /overrideGvwrLbs:\s*weightOverride\?\.gvwrLbs/);
  assert.match(detail, /WeightOverrideRow/);
  assert.match(detail, /UVW_ESTIMATE_LABEL/);
  assert.match(detail, /estimatedLbs/);
  assert.doesNotMatch(detail, /torqueToWeight\.stars/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /ratingStars\(row\.score\)/);
});
