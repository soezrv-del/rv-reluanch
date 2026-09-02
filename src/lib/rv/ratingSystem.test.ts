import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  UNKNOWN_MAKE_BASE,
  computeRating,
  getModelTier,
  getRatingMetadata,
  getYearAdjustment,
  ratingStars,
  resolveModelTier,
} from "./ratingSystem.ts";
import { getMockReviews } from "./rvReviews.ts";

const root = dirname(fileURLToPath(import.meta.url));
function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

test("King Aire and London Aire share flagship tier; Dutch Star is a step below", () => {
  assert.equal(getModelTier("Newmar", "King Aire"), "flagship");
  assert.equal(getModelTier("Newmar", "London Aire"), "flagship");
  assert.equal(getModelTier("Newmar", "Dutch Star"), "upper_mid");
  const king = computeRating("Newmar", "King Aire", "2022");
  const london = computeRating("Newmar", "London Aire", "2022");
  const dutch = computeRating("Newmar", "Dutch Star", "2022");
  assert.equal(king, london);
  assert.ok(king > dutch);
});

test("Allegro Red 340 aliases to Allegro Red (upper_mid)", () => {
  const parent = resolveModelTier("Tiffin", "Allegro Red");
  const variant = resolveModelTier("Tiffin", "Allegro Red 340");
  const red360 = resolveModelTier("Tiffin", "Allegro Red 360");
  assert.equal(parent.tier, "upper_mid");
  assert.equal(variant.tier, "upper_mid");
  assert.equal(red360.tier, "upper_mid");
  assert.equal(variant.matchedKey, "Allegro Red");
  assert.equal(
    computeRating("Tiffin", "Allegro Red", "2022"),
    computeRating("Tiffin", "Allegro Red 340", "2022"),
  );
});

test("Allegro Bus 45OPP aliases to Allegro Bus (flagship)", () => {
  const bus = resolveModelTier("Tiffin", "Allegro Bus");
  const opp = resolveModelTier("Tiffin", "Allegro Bus 45OPP");
  assert.equal(bus.tier, "flagship");
  assert.equal(opp.tier, "flagship");
  assert.equal(opp.matchedKey, "Allegro Bus");
});

test("unknown make uses default base and Low confidence", () => {
  const meta = getRatingMetadata("Unknown Brand", "Whatever", "2020");
  assert.equal(meta.knownMake, false);
  assert.equal(meta.confidence, "Low");
  assert.equal(meta.base, UNKNOWN_MAKE_BASE);
  assert.equal(meta.tier, "standard");
  assert.equal(meta.score, computeRating("Unknown Brand", "Whatever", "2020"));
  assert.match(meta.sources[0]!, /RvFOX model/);
  assert.doesNotMatch(meta.sources.join(" "), /iRV2|Reddit|NHTSA complaint/);
});

test("year bands: 2019 peak vs 2021 COVID vs 2025 recovery", () => {
  assert.equal(getYearAdjustment("2019"), 0.15);
  assert.equal(getYearAdjustment("2021"), -0.3);
  assert.equal(getYearAdjustment("2025"), 0.1);
  const bus2019 = computeRating("Tiffin", "Allegro Bus", "2019");
  const bus2021 = computeRating("Tiffin", "Allegro Bus", "2021");
  const bus2025 = computeRating("Tiffin", "Allegro Bus", "2025");
  assert.ok(bus2019 > bus2021);
  assert.ok(bus2025 > bus2021);
  assert.equal(bus2019, 4.8);
  assert.equal(bus2021, 4.3);
  assert.equal(bus2025, 4.7);
});

test("ratingFor / Facts / share stay wired to computeRating", () => {
  const catalog = src("catalog.ts");
  assert.match(catalog, /return computeRating\(make, model, year\)/);
  assert.match(catalog, /rating: computeRating\(make, model, ""\)/);
  const detail = src("../../components/rvfax/RvDetail.tsx");
  assert.match(detail, /ratingFor\(make, model, year\)/);
  assert.match(detail, /displayRating = rating/);
});

test("ratingStars tracks nearest half-star", () => {
  assert.equal(ratingStars(4.4), "★★★★½");
  assert.equal(ratingStars(3.5), "★★★½☆");
  assert.notEqual(ratingStars(4.4), ratingStars(3.5));
  assert.equal(ratingStars(5), "★★★★★");
  assert.equal(ratingStars(4.0), "★★★★☆");
});

test("Compare does not mutate RvFOX scores or prefer live ratingEstimate", () => {
  const compare = src("compare.ts");
  assert.equal(compare.includes("function finalizeRatings"), false);
  assert.match(compare, /const rawRating = ratingFor\(r\.make, r\.model, r\.year\)/);
  assert.doesNotMatch(
    compare,
    /live\?\.ratingEstimate && live\.ratingEstimate > 0/,
  );
  assert.match(compare, /function ratingBadgeIndexes/);
});

test("mock reviews are never verified and unknown make has no Winnebago fallback", () => {
  const tiffin = getMockReviews("Tiffin", "Phaeton", 4.4);
  assert.ok(tiffin.length > 0);
  for (const r of tiffin) {
    assert.equal(r.verified, false);
  }
  const unknown = getMockReviews("Unknown Brand", "Whatever", 3.5);
  assert.deepEqual(unknown, []);
  const emptyCopy = getMockReviews("NotARealMake", "NoPool", 4);
  assert.equal(emptyCopy.length, 0);
});
