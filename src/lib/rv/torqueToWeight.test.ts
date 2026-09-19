import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  computeTorqueToWeight,
  formatTorqueToWeightStars,
  parseTorqueLbFt,
  parseUvwLb,
  starsFromTorqueToWeightRatio,
  torqueToWeightRatio,
} from "./torqueToWeight.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("ratio is lb-ft per 1,000 lb UVW", () => {
  assert.equal(torqueToWeightRatio(1250, 25_000), 50);
  assert.equal(torqueToWeightRatio(800, 20_000), 40);
  assert.equal(torqueToWeightRatio(320, 20_000), 16);
  assert.equal(torqueToWeightRatio(0, 20_000), null);
  assert.equal(torqueToWeightRatio(800, 0), null);
});

test("star bands: 40 / 32 / 24 / 16 → 5–1", () => {
  assert.equal(starsFromTorqueToWeightRatio(40), 5);
  assert.equal(starsFromTorqueToWeightRatio(39.999), 4);
  assert.equal(starsFromTorqueToWeightRatio(32), 4);
  assert.equal(starsFromTorqueToWeightRatio(31.999), 3);
  assert.equal(starsFromTorqueToWeightRatio(24), 3);
  assert.equal(starsFromTorqueToWeightRatio(23.999), 2);
  assert.equal(starsFromTorqueToWeightRatio(16), 2);
  assert.equal(starsFromTorqueToWeightRatio(15.999), 1);
  assert.equal(starsFromTorqueToWeightRatio(0), 1);
  assert.equal(starsFromTorqueToWeightRatio(null), null);
  assert.equal(starsFromTorqueToWeightRatio(undefined), null);
  assert.equal(starsFromTorqueToWeightRatio(Number.NaN), null);
});

test("computeTorqueToWeight prefers hard torque, parses specs, GAP when missing", () => {
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
    uvwLbs: 20_001,
  });
  assert.equal(four.stars, 4);

  const one = computeTorqueToWeight({
    torqueLbFt: 300,
    uvwLbs: 20_000,
  });
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
  assert.equal(
    computeTorqueToWeight({
      torqueRaw: "450 HP",
      uvwLbs: 12_000,
    }).gap,
    true,
  );
  const labeled = computeTorqueToWeight({
    torqueRaw: "450 HP / 1,250 lb-ft",
    uvwLbs: 25_000,
  });
  assert.equal(labeled.torqueLbFt, 1250);
  assert.equal(labeled.stars, 5);
});

test("parse UVW strips commas/units; range is unparseable (GAP)", () => {
  assert.equal(parseUvwLb("25,000 lbs"), 25_000);
  assert.equal(parseUvwLb("18000"), 18_000);
  assert.equal(parseUvwLb(22_400), 22_400);
  assert.equal(parseUvwLb("—"), null);
  assert.equal(parseUvwLb("24,000–26,000 lbs"), null);
  assert.equal(parseUvwLb(""), null);
  assert.equal(parseTorqueLbFt(468), 468);
  assert.equal(parseTorqueLbFt("468"), 468);
  assert.equal(parseTorqueLbFt("1,250 lb-ft"), 1250);
});

test("Facts Ratings section wires torque helper — not MiniStat chips", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /computeTorqueToWeight/);
  assert.match(detail, /data-testid="facts-ratings"/);
  assert.match(detail, /Torque-to-weight/);
  assert.doesNotMatch(detail, /<MiniStat[^>]*[Tt]orque/);
  assert.doesNotMatch(detail, /<MiniStat[^>]*Tq\/wt/);
});
