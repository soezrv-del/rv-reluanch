import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  TORQUE_WEIGHT_GOOD,
  TORQUE_WEIGHT_GREAT,
  TORQUE_WEIGHT_RATING_WEIGHT_LABEL,
  formatTorqueWeightRatingRatio,
  rateTorqueToWeight,
  torqueWeightRatingColor,
  torqueWeightRatingFill,
} from "./torqueWeightRating.ts";

const root = dirname(fileURLToPath(import.meta.url));

function atFill(fill: number) {
  return rateTorqueToWeight({
    torqueLbFt: fill * TORQUE_WEIGHT_GREAT,
    uvwLbs: 1000,
  });
}

test("GOOD is 0.75 × GREAT", () => {
  assert.equal(TORQUE_WEIGHT_GOOD, TORQUE_WEIGHT_GREAT * 0.75);
  assert.equal(TORQUE_WEIGHT_RATING_WEIGHT_LABEL, "UVW / dry weight");
});

test("bar fill and color at 0.25, 0.50, 0.75, 1.0, and above GREAT", () => {
  const red = atFill(0.25);
  assert.equal(red.gap, false);
  assert.equal(red.fill, 0.25);
  assert.equal(red.color, "var(--color-ruby)");
  assert.equal(torqueWeightRatingColor(0.25), "var(--color-ruby)");
  assert.equal(torqueWeightRatingColor(0.24), "var(--color-ruby)");

  const yellow = atFill(0.5);
  assert.equal(yellow.fill, 0.5);
  assert.equal(yellow.color, "var(--color-amber)");
  assert.equal(torqueWeightRatingColor(0.5), "var(--color-amber)");
  assert.equal(torqueWeightRatingColor(0.749), "var(--color-amber)");

  const good = atFill(0.75);
  assert.equal(good.fill, 0.75);
  assert.equal(good.color, "var(--color-green)");

  const great = atFill(1);
  assert.equal(great.fill, 1);
  assert.equal(great.color, "var(--color-green)");
  assert.equal(torqueWeightRatingFill(TORQUE_WEIGHT_GREAT), 1);

  const above = atFill(1.4);
  assert.equal(above.fill, 1);
  assert.equal(above.color, "var(--color-green)");
  assert.equal(torqueWeightRatingFill(TORQUE_WEIGHT_GREAT * 3), 1);

  // Mid-blend: yellow #e0a04a → red #d42535 at fill 0.375 (t = 0.5).
  assert.equal(torqueWeightRatingColor(0.375), "rgb(218, 99, 64)");
});

test("GAP when torque is missing — no ratio, no fill, no bar color", () => {
  const missing = rateTorqueToWeight({ torqueLbFt: null, uvwLbs: 18_186 });
  assert.equal(missing.gap, true);
  assert.equal(missing.ratio, null);
  assert.equal(missing.fill, null);
  assert.equal(missing.color, null);
  assert.equal(formatTorqueWeightRatingRatio(missing), "GAP");

  const zero = rateTorqueToWeight({ torqueLbFt: 0, uvwLbs: 18_186 });
  assert.equal(zero.gap, true);
  assert.equal(zero.fill, null);
  assert.equal(zero.color, null);
});

test("GAP when both UVW and dry weight are missing", () => {
  const missing = rateTorqueToWeight({
    torqueLbFt: 950,
    uvwLbs: null,
    dryWeightLbs: null,
  });
  assert.equal(missing.gap, true);
  assert.equal(missing.weightLb, null);
  assert.equal(missing.weightKind, null);
  assert.equal(missing.fill, null);
  assert.equal(missing.color, null);

  const zeros = rateTorqueToWeight({ torqueLbFt: 950, uvwLbs: 0, dryWeightLbs: 0 });
  assert.equal(zeros.gap, true);
  assert.equal(zeros.weightLb, null);
  assert.equal(zeros.fill, null);
});

test("dry weight is the fallback; published UVW wins when both exist", () => {
  const dry = rateTorqueToWeight({
    torqueLbFt: 950,
    uvwLbs: null,
    dryWeightLbs: 18_186,
  });
  assert.equal(dry.gap, false);
  assert.equal(dry.weightKind, "dry");
  assert.equal(dry.weightLb, 18_186);
  assert.ok(Math.abs((dry.ratio ?? 0) - 950 / 18.186) < 1e-9);
  assert.equal(dry.fill, torqueWeightRatingFill(dry.ratio ?? 0));
  assert.ok(dry.color);

  const uvw = rateTorqueToWeight({
    torqueLbFt: 950,
    uvwLbs: 20_000,
    dryWeightLbs: 18_186,
  });
  assert.equal(uvw.weightKind, "uvw");
  assert.equal(uvw.weightLb, 20_000);
  assert.ok(Math.abs((uvw.ratio ?? 0) - 950 / 20) < 1e-9);
  assert.notEqual(uvw.ratio, dry.ratio);
});

test("helper stays import-free and Facts paints one UVW / dry weight row", () => {
  const src = readFileSync(join(root, "torqueWeightRating.ts"), "utf8");
  assert.equal(
    src.split("\n").some((line) => /^\s*import\b/.test(line) || /\bfrom\s+["']/.test(line)),
    false,
  );
  assert.doesNotMatch(src, /ensureCatalogLoaded|from ["']@\/lib\/rv\/rvData/);
  assert.match(src, /n = 77/);
  assert.match(src, /2026-09-26/);
  assert.match(src, /2894e63/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /rateTorqueToWeight/);
  assert.match(detail, /TORQUE_WEIGHT_RATING_WEIGHT_LABEL/);
  assert.match(detail, /data-testid="facts-torque-weight-rating"/);
  assert.match(detail, /data-testid="facts-torque-weight-rating-bar"/);
  assert.match(detail, /torqueWeightRating\.gap \?/);
  assert.match(detail, />\s*Power-to-weight\s*</);
  const ratingsBlock = detail.slice(
    detail.indexOf('data-testid="facts-ratings"'),
    detail.indexOf("data-facts-market-value"),
  );
  assert.doesNotMatch(ratingsBlock, /Torque-to-Weight/);
  assert.doesNotMatch(ratingsBlock, /facts-tqwt-bar/);
  assert.doesNotMatch(detail, /formatTorqueToWeightScore/);
  assert.doesNotMatch(
    detail.slice(
      detail.indexOf('data-testid="facts-torque-weight-rating"'),
      detail.indexOf("data-facts-market-value"),
    ),
    /facts-torque-weight-rating-bar[\s\S]*torqueWeightRating\.gap/,
  );
});
