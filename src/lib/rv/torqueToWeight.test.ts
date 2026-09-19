import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  barColorFromScore,
  computeTorqueToWeight,
  formatTorqueToWeightScore,
  isTowableForTorqueRating,
  parseGvwrLb,
  parseTorqueLbFt,
  parseUvwLb,
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

test("must-pass 1–10 anchors (±0.15)", () => {
  const seneca = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Class A Gas",
  });
  assertNear(seneca.ratio, 25.8, 0.05);
  assertNear(seneca.score, 6.0);
  assert.equal(seneca.weightBasis, "GVWR");
  assert.equal(seneca.color, "yellow");

  const p31 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assertNear(p31.ratio, 21.3, 0.05);
  assertNear(p31.score, 5.0);
  assert.equal(p31.weightBasis, "GVWR");
  assert.equal(p31.color, "red");

  const p36 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
  });
  assertNear(p36.ratio, 19.5, 0.05);
  assertNear(p36.score, 4.6);
  assert.equal(p36.weightBasis, "GVWR");
  assert.equal(p36.color, "red");

  const cornerstone = computeTorqueToWeight({
    torqueLbFt: 1950,
    gvwrLbs: 54_000,
    rvType: "Class A Diesel",
  });
  assertNear(cornerstone.ratio, 36.1, 0.05);
  assertNear(cornerstone.score, 8.0);
  assert.equal(cornerstone.color, "green");

  const d1250 = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 32_000,
    rvType: "Class A Diesel",
  });
  assertNear(d1250.ratio, 39.1, 0.05);
  assertNear(d1250.score, 8.5);
  assert.equal(d1250.color, "green");

  const d1950 = computeTorqueToWeight({
    torqueLbFt: 1950,
    gvwrLbs: 40_000,
    rvType: "Class A Diesel",
  });
  assertNear(d1950.ratio, 48.8, 0.1);
  assertNear(d1950.score, 9.5);
  assert.equal(d1950.color, "green");

  const classC = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 10_000,
    rvType: "Class C",
  });
  assertNear(classC.ratio, 46.8, 0.05);
  assertNear(classC.score, 9.0);
  assert.equal(classC.color, "green");

  const isb = computeTorqueToWeight({
    torqueLbFt: 700,
    gvwrLbs: 30_000,
    rvType: "Class A Diesel",
  });
  assertNear(isb.ratio, 23.3, 0.05);
  assertNear(isb.score, 5.5);
  assert.equal(isb.color, "red");
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

test("GVWR-only basis; UVW never wins; GAP if torque or GVWR missing", () => {
  const ignoreUvw = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 20_000,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
  });
  assert.equal(ignoreUvw.weightBasis, "GVWR");
  assert.equal(ignoreUvw.weightLb, 24_000);
  assert.equal(ignoreUvw.uvwLb, 20_000);
  assert.ok(Math.abs((ignoreUvw.ratio ?? 0) - 19.5) < 1e-9);
  assert.match(formatTorqueToWeightScore(ignoreUvw), /^[0-9.]+\/10 · GVWR$/);
  assert.doesNotMatch(formatTorqueToWeightScore(ignoreUvw), /UVW/);

  const unloadedRaw = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwRaw: "18,000 lbs unloaded",
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assert.equal(unloadedRaw.weightBasis, "GVWR");
  assert.equal(unloadedRaw.weightLb, 22_000);
  assert.equal(unloadedRaw.uvwLb, 18_000);
  assertNear(unloadedRaw.score, 5.0);

  const gvwrOnly = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Class A Gas",
  });
  assert.equal(gvwrOnly.weightBasis, "GVWR");
  assert.equal(gvwrOnly.weightLb, 31_000);
  assert.equal(formatTorqueToWeightScore(gvwrOnly), "6.0/10 · GVWR");

  assert.equal(formatTorqueToWeightScore(computeTorqueToWeight({})), "GAP");
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ torqueLbFt: 468 })),
    "GAP",
  );
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ gvwrLbs: 22_000 })),
    "GAP",
  );
  // UVW alone is not a weight basis — missing GVWR is GAP.
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ uvwLbs: 18_000 })),
    "GAP",
  );
  assert.equal(
    formatTorqueToWeightScore(
      computeTorqueToWeight({ torqueLbFt: 468, uvwLbs: 18_000 }),
    ),
    "GAP",
  );
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
  // Range-only catalog/display band → max(lo,hi). Conservative (heavier).
  assert.equal(parseGvwrLb("39500-44005"), 44005);
  assert.equal(parseGvwrLb("39,500–44,005 lbs"), 44005);
  assert.equal(parseGvwrLb("39,500—44,005 lbs GVWR"), 44005);
  assert.equal(parseGvwrLb([39_500, 44_005]), 44005);
  assert.equal(parseGvwrLb([44_005, 39_500]), 44005);
  // Single published figure unchanged.
  assert.equal(parseGvwrLb("47000"), 47000);
  assert.equal(parseGvwrLb("47,000 lbs GVWR"), 47000);
  // UVW still never parsed as GVWR; messy 3-number strings stay GAP.
  assert.equal(parseGvwrLb("39,500–44,005 lbs UVW"), null);
  assert.equal(parseUvwLb("39,500–44,005 lbs"), null);

  const rangeOnly = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrRaw: "39500-44005",
    rvType: "Class A Diesel",
  });
  assert.equal(rangeOnly.weightLb, 44005);
  assert.equal(rangeOnly.gvwrLb, 44005);
  assert.equal(rangeOnly.weightBasis, "GVWR");
  assert.match(formatTorqueToWeightScore(rangeOnly), /^[0-9.]+\/10 · GVWR$/);
  assert.doesNotMatch(formatTorqueToWeightScore(rangeOnly), /UVW|range/i);

  const displayBand = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrRaw: "39,500–44,005 lbs",
    rvType: "Class A Diesel",
  });
  assert.equal(displayBand.weightLb, 44005);

  const tupleBand = computeTorqueToWeight({
    torqueLbFt: 1250,
    weightRange: [39_500, 44_005],
    rvType: "Class A Diesel",
  });
  assert.equal(tupleBand.weightLb, 44005);

  // Published OEM pin (e.g. Tradition 42Q/42V brochure 47,000) wins the
  // catalog/display band. Pinning 42V→47000 in catalog is a separate task.
  const publishedWins = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 47_000,
    gvwrRaw: "39,500–44,005 lbs",
    weightRange: [39_500, 44_005],
    rvType: "Class A Diesel",
  });
  assert.equal(publishedWins.weightLb, 47_000);
  assert.equal(publishedWins.gvwrLb, 47_000);
  assert.equal(publishedWins.weightBasis, "GVWR");
  assert.match(formatTorqueToWeightScore(publishedWins), /^[0-9.]+\/10 · GVWR$/);
});

test("Facts Ratings: Torque-to-Weight bar + X/10 · GVWR; other rows keep stars", () => {
  const src = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.match(src, /torqueLbFt \/ gvwrLb/);
  assert.match(src, /weightLb = gvwrLb/);
  assert.doesNotMatch(src, /uvwLb \?\? gvwrLb/);
  assert.match(src, /Math\.max\(nums\[0]!, nums\[1]!\)/);
  assert.match(src, /HIGH end/);
  assert.doesNotMatch(src, /Math\.min\(nums\[0]!, nums\[1]!\)/);
  assert.match(src, /score < 6/);
  assert.match(src, /score < 7\.5/);
  assert.doesNotMatch(src, /score < 3/);
  assert.doesNotMatch(src, /score < 4[^.0-9]/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /Torque-to-Weight/);
  assert.match(detail, /formatTorqueToWeightScore/);
  assert.match(detail, /data-testid="facts-tqwt-bar"/);
  assert.match(detail, /score \/ 10/);
  assert.match(detail, /uvwLbs:\s*live\?\.uvwLbs/);
  assert.match(detail, /uvwRaw:\s*specs\.uvw/);
  assert.match(detail, /gvwrLbs:\s*live\?\.gvwrLbs/);
  assert.match(detail, /gvwrRaw:\s*specs\.gvwr/);
  assert.doesNotMatch(detail, /torqueToWeight\.stars/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /ratingStars\(row\.stars\)/);
});
