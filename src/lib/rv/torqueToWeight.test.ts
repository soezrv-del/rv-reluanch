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

test("ratio is lb-ft per 1,000 lb GVWR (never UVW)", () => {
  assert.equal(torqueToWeightRatio(468, 24_000), 19.5);
  assert.ok(
    Math.abs((torqueToWeightRatio(800, 31_000) ?? 0) - 25.806451612903224) <
      1e-9,
  );
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
  assert.equal(seneca.color, "green");

  const p31 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assertNear(p31.ratio, 21.3, 0.05);
  assertNear(p31.score, 5.0);
  assert.equal(p31.color, "green");

  const p36 = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
  });
  assertNear(p36.ratio, 19.5, 0.05);
  assertNear(p36.score, 4.5);
  assert.equal(p36.color, "green");

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
  assert.equal(isb.color, "green");
});

test("bar color: red < 3.0, yellow [3.0, 4.0), green ≥ 4.0", () => {
  assert.equal(barColorFromScore(2.99), "red");
  assert.equal(barColorFromScore(3.0), "yellow");
  assert.equal(barColorFromScore(3.9), "yellow");
  assert.equal(barColorFromScore(4.0), "green");
  assert.equal(barColorFromScore(4.5), "green");
  assert.equal(barColorFromScore(null), null);
});

test("missing torque|GVWR → GAP; towables N/A", () => {
  assert.equal(formatTorqueToWeightScore(computeTorqueToWeight({})), "GAP");
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ torqueLbFt: 468 })),
    "GAP",
  );
  assert.equal(
    formatTorqueToWeightScore(computeTorqueToWeight({ gvwrLbs: 22_000 })),
    "GAP",
  );
  assert.equal(isTowableForTorqueRating("Travel Trailer"), true);
  assert.equal(isTowableForTorqueRating("Class A Diesel"), false);
  const tt = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Travel Trailer",
  });
  assert.equal(tt.na, true);
  assert.equal(tt.score, null);
  assert.equal(formatTorqueToWeightScore(tt), "N/A");
});

test("never uses horsepower as torque; UVW is not the denominator", () => {
  assert.equal(parseTorqueLbFt("450 HP"), null);
  assert.equal(parseTorqueLbFt("450 HP / 1,250 lb-ft"), 1250);
  assert.equal(parseGvwrLb("22,000 lbs GVWR"), 22_000);
  assert.equal(parseGvwrLb("18,000 lbs UVW"), null);
  assert.equal(
    computeTorqueToWeight({ torqueRaw: "450 HP", gvwrLbs: 22_000 }).gap,
    true,
  );
});

test("Facts Ratings: Torque-to-Weight bar + X/10; other rows keep stars", () => {
  const src = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.match(src, /torqueLbFt \/ gvwrLb/);
  assert.doesNotMatch(src, /torqueLbFt \/ uvwLb/);
  assert.match(src, /score < 3/);
  assert.match(src, /score < 4/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /Torque-to-Weight/);
  assert.match(detail, /formatTorqueToWeightScore/);
  assert.match(detail, /data-testid="facts-tqwt-bar"/);
  assert.match(detail, /score \/ 10/);
  assert.doesNotMatch(detail, /torqueToWeight\.stars/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /ratingStars\(row\.stars\)/);
});
