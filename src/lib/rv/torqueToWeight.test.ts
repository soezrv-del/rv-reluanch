import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeTorqueToWeight,
  formatTorqueToWeightStars,
  isTowableForTorqueRating,
  parseTorqueLbFt,
  parseUvwLb,
  starsFromTorqueToWeightRatio,
  torqueToWeightRatio,
} from "./torqueToWeight.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("ratio is lb-ft per 1,000 lb UVW (never GVWR)", () => {
  assert.ok(Math.abs((torqueToWeightRatio(468, 20_000) ?? 0) - 23.4) < 1e-9);
  assert.equal(torqueToWeightRatio(1250, 25_000), 50);
  assert.equal(torqueToWeightRatio(0, 20_000), null);
  assert.equal(torqueToWeightRatio(468, 0), null);
});

test("retuned motorhome bands are half-open: 10 / 18 / 30 / 50", () => {
  assert.equal(starsFromTorqueToWeightRatio(0), 1);
  assert.equal(starsFromTorqueToWeightRatio(9.999), 1);
  assert.equal(starsFromTorqueToWeightRatio(10), 2);
  assert.equal(starsFromTorqueToWeightRatio(17.999), 2);
  assert.equal(starsFromTorqueToWeightRatio(18), 3);
  assert.equal(starsFromTorqueToWeightRatio(29.999), 3);
  assert.equal(starsFromTorqueToWeightRatio(30), 4);
  assert.equal(starsFromTorqueToWeightRatio(49.999), 4);
  assert.equal(starsFromTorqueToWeightRatio(50), 5);
  assert.equal(starsFromTorqueToWeightRatio(80), 5);
  assert.equal(starsFromTorqueToWeightRatio(null), null);
  assert.equal(starsFromTorqueToWeightRatio(undefined), null);
  assert.equal(starsFromTorqueToWeightRatio(-1), null);
  assert.equal(starsFromTorqueToWeightRatio(Number.NaN), null);
});

test("468 lb-ft / 20,000 lb UVW → 23.4 → 3★", () => {
  const r = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 20_000,
    rvType: "Class A Gas",
  });
  assert.equal(r.gap, false);
  assert.equal(r.na, false);
  assert.ok(Math.abs((r.ratio ?? 0) - 23.4) < 1e-9);
  assert.equal(r.stars, 3);
  assert.equal(formatTorqueToWeightStars(r), "★★★☆☆");
});

test("computeTorqueToWeight prefers hard torque, parses UVW specs, GAP when missing", () => {
  const five = computeTorqueToWeight({
    torqueLbFt: 1250,
    uvwRaw: "25,000 lbs",
  });
  assert.equal(five.gap, false);
  assert.equal(five.stars, 5);
  assert.equal(five.ratio, 50);
  assert.equal(formatTorqueToWeightStars(five), "★★★★★");

  const fromSpecs = computeTorqueToWeight({
    torqueRaw: "1,250 lb-ft",
    uvwRaw: "25,000 lbs",
  });
  assert.equal(fromSpecs.stars, 5);
  assert.equal(fromSpecs.torqueLbFt, 1250);
  assert.equal(fromSpecs.uvwLb, 25_000);

  const four = computeTorqueToWeight({
    torqueLbFt: 800,
    uvwLbs: 20_000,
  });
  assert.equal(four.ratio, 40);
  assert.equal(four.stars, 4);

  const one = computeTorqueToWeight({
    torqueLbFt: 150,
    uvwLbs: 20_000,
  });
  assert.equal(one.ratio, 7.5);
  assert.equal(one.stars, 1);
  assert.equal(formatTorqueToWeightStars(one), "★☆☆☆☆");

  assert.equal(computeTorqueToWeight({ uvwRaw: "18,000 lbs" }).gap, true);
  assert.equal(computeTorqueToWeight({ torqueLbFt: 800 }).gap, true);
  assert.equal(
    computeTorqueToWeight({ torqueLbFt: 800, uvwLbs: 0 }).gap,
    true,
  );
  assert.equal(
    computeTorqueToWeight({ torqueRaw: "—", uvwRaw: "—" }).gap,
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
      uvwLbs: 12_000,
    }).gap,
    true,
  );
});

test("parse UVW strips commas/units; GVWR-labeled and ranges are GAP", () => {
  assert.equal(parseUvwLb("25,000 lbs"), 25_000);
  assert.equal(parseUvwLb("18000"), 18_000);
  assert.equal(parseUvwLb(20_000), 20_000);
  assert.equal(parseUvwLb("—"), null);
  assert.equal(parseUvwLb("24,000–26,000 lbs"), null);
  assert.equal(parseUvwLb("22,000 lbs GVWR"), null);
  assert.equal(parseUvwLb(""), null);
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
    uvwLbs: 20_000,
    rvType: "Travel Trailer",
  });
  assert.equal(tt.na, true);
  assert.equal(tt.gap, true);
  assert.equal(tt.stars, null);
  assert.equal(formatTorqueToWeightStars(tt), "N/A");
});

test("Facts Ratings section wires UVW (not GVWR) and is not MiniStat chips", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /computeTorqueToWeight/);
  assert.match(detail, /uvwLbs:\s*live\?\.uvwLbs/);
  assert.match(detail, /uvwRaw:\s*specs\.uvw/);
  assert.match(detail, /data-testid="facts-ratings"/);
  assert.match(detail, /Torque-to-weight/);
  assert.doesNotMatch(detail, /uvwRaw:\s*specs\.gvwr/);
  assert.doesNotMatch(detail, /uvwLbs:\s*live\?\.gvwrLbs/);
  assert.doesNotMatch(detail, /<MiniStat[^>]*[Tt]orque/);
  assert.doesNotMatch(detail, /<MiniStat[^>]*Tq\/wt/);
  assert.match(detail, /torqueToWeight\.na/);
});
