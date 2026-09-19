import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeTorqueToWeight,
  formatTorqueToWeightStars,
  isTowableForTorqueRating,
  parseGvwrLb,
  parseTorqueLbFt,
  starsFromTorqueToWeightRatio,
  torqueToWeightRatio,
} from "./torqueToWeight.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("ratio is lb-ft per 1,000 lb GVWR (never UVW)", () => {
  assert.equal(torqueToWeightRatio(468, 24_000), 19.5);
  assert.ok(Math.abs((torqueToWeightRatio(468, 22_000) ?? 0) - 21.272727272727273) < 1e-9);
  assert.equal(torqueToWeightRatio(0, 22_000), null);
  assert.equal(torqueToWeightRatio(468, 0), null);
});

test("rebuilt motorhome bands are half-open: 10 / 17 / 28 / 45", () => {
  assert.equal(starsFromTorqueToWeightRatio(0), 1);
  assert.equal(starsFromTorqueToWeightRatio(9.999), 1);
  assert.equal(starsFromTorqueToWeightRatio(10), 2);
  assert.equal(starsFromTorqueToWeightRatio(16.999), 2);
  assert.equal(starsFromTorqueToWeightRatio(17), 3);
  assert.equal(starsFromTorqueToWeightRatio(27.999), 3);
  assert.equal(starsFromTorqueToWeightRatio(28), 4);
  assert.equal(starsFromTorqueToWeightRatio(44.999), 4);
  assert.equal(starsFromTorqueToWeightRatio(45), 5);
  assert.equal(starsFromTorqueToWeightRatio(80), 5);
  assert.equal(starsFromTorqueToWeightRatio(null), null);
  assert.equal(starsFromTorqueToWeightRatio(undefined), null);
  assert.equal(starsFromTorqueToWeightRatio(-1), null);
  assert.equal(starsFromTorqueToWeightRatio(Number.NaN), null);
});

test("Seneca 800/31000 ≈ 25.81 → 3★ (must not exceed 3★)", () => {
  const r = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 31_000,
    rvType: "Class A Gas",
  });
  assert.equal(r.gap, false);
  assert.ok(Math.abs((r.ratio ?? 0) - 25.81) < 0.01);
  assert.equal(r.stars, 3);
  assert.ok((r.stars ?? 5) <= 3);
  assert.equal(formatTorqueToWeightStars(r), "★★★☆☆");
});

test("Precept 31UL 468/22000 ≈ 21.27 → 3★", () => {
  const r = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assert.equal(r.gap, false);
  assert.equal(r.na, false);
  assert.equal(r.gvwrLb, 22_000);
  assert.equal(r.torqueLbFt, 468);
  assert.ok(Math.abs((r.ratio ?? 0) - 21.27) < 0.01);
  assert.equal(r.stars, 3);
  assert.equal(formatTorqueToWeightStars(r), "★★★☆☆");
});

test("Precept 36 468/24000 ≈ 19.5 → 3★", () => {
  const a = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 24_000,
    rvType: "Class A Gas",
  });
  const c = computeTorqueToWeight({
    torqueRaw: "468 lb-ft",
    gvwrRaw: "24,000 lbs GVWR",
    rvType: "Class A Gas",
  });
  assert.equal(a.gap, false);
  assert.equal(a.ratio, 19.5);
  assert.equal(a.stars, 3);
  assert.equal(c.stars, 3);
  assert.equal(c.gvwrLb, 24_000);
  assert.equal(formatTorqueToWeightStars(a), "★★★☆☆");
});

test("Diesel 1250/32000 ≈ 39.06 → 4★", () => {
  const r = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrLbs: 32_000,
    rvType: "Class A Diesel",
  });
  assert.ok(Math.abs((r.ratio ?? 0) - 39.06) < 0.01);
  assert.equal(r.stars, 4);
  assert.equal(formatTorqueToWeightStars(r), "★★★★☆");
});

test("Diesel 700/29000 ≈ 24.14 → 3★", () => {
  const r = computeTorqueToWeight({
    torqueLbFt: 700,
    gvwrLbs: 29_000,
    rvType: "Class A Diesel",
  });
  assert.ok(Math.abs((r.ratio ?? 0) - 24.14) < 0.01);
  assert.equal(r.stars, 3);
  assert.equal(formatTorqueToWeightStars(r), "★★★☆☆");
});

test("computeTorqueToWeight prefers hard torque, parses GVWR specs, GAP when missing", () => {
  const five = computeTorqueToWeight({
    torqueLbFt: 1250,
    gvwrRaw: "25,000 lbs",
  });
  assert.equal(five.gap, false);
  assert.equal(five.stars, 5);
  assert.equal(five.ratio, 50);
  assert.equal(formatTorqueToWeightStars(five), "★★★★★");

  const four = computeTorqueToWeight({
    torqueLbFt: 800,
    gvwrLbs: 20_000,
  });
  assert.equal(four.ratio, 40);
  assert.equal(four.stars, 4);

  const one = computeTorqueToWeight({
    torqueLbFt: 150,
    gvwrLbs: 20_000,
  });
  assert.equal(one.ratio, 7.5);
  assert.equal(one.stars, 1);
  assert.equal(formatTorqueToWeightStars(one), "★☆☆☆☆");

  assert.equal(computeTorqueToWeight({ gvwrRaw: "22,000 lbs" }).gap, true);
  assert.equal(computeTorqueToWeight({ torqueLbFt: 468 }).gap, true);
  assert.equal(
    computeTorqueToWeight({ torqueLbFt: 468, gvwrLbs: 0 }).gap,
    true,
  );
  assert.equal(
    computeTorqueToWeight({ torqueRaw: "—", gvwrRaw: "—" }).gap,
    true,
  );
  assert.equal(formatTorqueToWeightStars(computeTorqueToWeight({})), "GAP");
});

test("never uses horsepower as torque", () => {
  assert.equal(parseTorqueLbFt("450 HP"), null);
  assert.equal(parseTorqueLbFt("340 hp"), null);
  assert.equal(parseTorqueLbFt("450 HP / 1,250 lb-ft"), 1250);
  assert.equal(parseTorqueLbFt("N/A (towable)"), null);
  assert.equal(
    computeTorqueToWeight({
      torqueRaw: "450 HP",
      gvwrLbs: 22_000,
    }).gap,
    true,
  );
});

test("parse GVWR strips commas/units; UVW-labeled and ranges are GAP", () => {
  assert.equal(parseGvwrLb("22,000 lbs"), 22_000);
  assert.equal(parseGvwrLb("22,000 lbs GVWR"), 22_000);
  assert.equal(parseGvwrLb(24_000), 24_000);
  assert.equal(parseGvwrLb("—"), null);
  assert.equal(parseGvwrLb("22,000–24,000 lbs"), null);
  assert.equal(parseGvwrLb("18,000 lbs UVW"), null);
  assert.equal(parseGvwrLb(""), null);
  assert.equal(parseTorqueLbFt(468), 468);
  assert.equal(parseTorqueLbFt("468"), 468);
  assert.equal(parseTorqueLbFt("468 lb-ft"), 468);
});

test("towables are N/A / GAP — not a motorhome torque rating", () => {
  assert.equal(isTowableForTorqueRating("Travel Trailer"), true);
  assert.equal(isTowableForTorqueRating("Fifth Wheel"), true);
  assert.equal(isTowableForTorqueRating("Toy Hauler"), true);
  assert.equal(isTowableForTorqueRating(null, "N/A (towable)"), true);
  assert.equal(isTowableForTorqueRating("Class A Diesel"), false);
  assert.equal(isTowableForTorqueRating("Class C Toy Hauler"), false);

  const tt = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 22_000,
    rvType: "Travel Trailer",
  });
  assert.equal(tt.na, true);
  assert.equal(tt.gap, true);
  assert.equal(tt.stars, null);
  assert.equal(formatTorqueToWeightStars(tt), "N/A");
});

test("Facts Ratings section wires GVWR (not UVW) and is not MiniStat chips", () => {
  const src = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.match(src, /torqueLbFt \/ gvwrLb/);
  assert.match(src, /\[10, 17\)/);
  assert.match(src, /\[17, 28\)/);
  assert.match(src, /\[28, 45\)/);
  assert.match(src, /\[45, ∞\)/);
  assert.doesNotMatch(src, /torqueLbFt \/ uvwLb/);
  assert.doesNotMatch(src, /parseUvwLb/);
  assert.doesNotMatch(src, /\[10, 15\)/);
  assert.doesNotMatch(src, /\[20, 30\)/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /computeTorqueToWeight/);
  assert.match(detail, /gvwrLbs:\s*live\?\.gvwrLbs/);
  assert.match(detail, /gvwrRaw:\s*specs\.gvwr/);
  assert.match(detail, /data-testid="facts-ratings"/);
  assert.match(detail, /Torque-to-weight/);
  assert.doesNotMatch(detail, /uvwRaw:\s*specs\.uvw/);
  assert.doesNotMatch(detail, /uvwLbs:\s*live\?\.uvwLbs/);
  assert.doesNotMatch(detail, /<MiniStat[^>]*[Tt]orque/);
  assert.doesNotMatch(detail, /<MiniStat[^>]*Tq\/wt/);
  assert.match(detail, /torqueToWeight\.na/);
});
