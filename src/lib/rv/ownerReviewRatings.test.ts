import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  OWNER_REVIEW_BRAND_FLOOR,
  OWNER_REVIEW_FOOTER,
  OWNER_REVIEW_MODEL_FLOOR,
  countCombinedPaints,
  formatOwnerReviewScore,
  lookupOwnerReviewBrand,
  lookupOwnerReviewModel,
  mapOwnerReviewSlots,
  resolveOwnerReviewRatings,
} from "./ownerReviewRatings.ts";
import {
  OWNER_REVIEW_BRAND_SEED,
  OWNER_REVIEW_MODEL_SEED,
  OWNER_REVIEW_SNAPSHOT_AS_OF,
} from "./ownerReviewRatings.seed.ts";

const root = dirname(fileURLToPath(import.meta.url));

const DEMO_BRANDS = [
  "Forest River",
  "Keystone",
  "Jayco",
  "Thor Motor Coach",
  "Grand Design",
  "Winnebago",
  "Coachmen",
  "Heartland",
  "Fleetwood",
  "Tiffin",
  "Entegra Coach",
  "Newmar",
  "Airstream",
] as const;

test("sample floors are brand n≥15 and model n≥8", () => {
  assert.equal(OWNER_REVIEW_BRAND_FLOOR, 15);
  assert.equal(OWNER_REVIEW_MODEL_FLOOR, 8);
});

test("every seeded brand meets the brand floor and cites a public manufacturer page", () => {
  assert.equal(OWNER_REVIEW_BRAND_SEED.length, DEMO_BRANDS.length);
  for (const name of DEMO_BRANDS) {
    const row = lookupOwnerReviewBrand(name);
    assert.ok(row, `missing seed for ${name}`);
    assert.ok(row!.n >= OWNER_REVIEW_BRAND_FLOOR, `${name} n=${row!.n}`);
    assert.ok(row!.combined >= 1 && row!.combined <= 5);
    assert.ok(row!.overallQuality != null);
    assert.equal(row!.asOf, OWNER_REVIEW_SNAPSHOT_AS_OF);
    assert.match(row!.sourceUrl, /^https:\/\/www\.rvinsider\.com\//);
    assert.doesNotMatch(row!.sourceUrl, /jdpower|consumerreports/i);
  }
  assert.equal(OWNER_REVIEW_MODEL_SEED.length, 0);
});

test("catalog aliases resolve without inventing a second brand", () => {
  assert.equal(lookupOwnerReviewBrand("Thor")?.name, "Thor Motor Coach");
  assert.equal(lookupOwnerReviewBrand("thor motor coach")?.name, "Thor Motor Coach");
  assert.equal(lookupOwnerReviewBrand("Entegra")?.name, "Entegra Coach");
  assert.equal(lookupOwnerReviewBrand("Newmar Classic")?.name, "Newmar");
  assert.equal(lookupOwnerReviewBrand("Thor Industries"), null);
  assert.equal(lookupOwnerReviewBrand("Palomino"), null);
  assert.equal(lookupOwnerReviewBrand("Crossroads"), null);
  assert.equal(lookupOwnerReviewModel("Forest River", "Georgetown"), null);
});

test("Insider helper: Quality = overallQuality; Satisfaction = combined once; Reliability GAP", () => {
  const tiffin = resolveOwnerReviewRatings("Tiffin", "Phaeton");
  assert.equal(tiffin.quality.score, 4.4);
  assert.equal(tiffin.quality.basis, "overall_quality");
  assert.match(tiffin.quality.caption ?? "", /Owner reviews · overall quality · brand-level/);
  assert.equal(tiffin.reliability.score, null);
  assert.equal(tiffin.reliability.basis, null);
  assert.equal(tiffin.reliability.caption, null);
  assert.equal(tiffin.customerSatisfaction.score, 4.3);
  assert.equal(tiffin.customerSatisfaction.basis, "combined");
  assert.match(
    tiffin.customerSatisfaction.caption ?? "",
    /Owner reviews \(combined\) · brand-level/,
  );
  assert.equal(tiffin.matchedName, "Tiffin");
  assert.equal(countCombinedPaints(tiffin), 1);
  assert.notEqual(tiffin.quality.score, tiffin.customerSatisfaction.score);

  const gap = resolveOwnerReviewRatings("Alliance RV", "Paradigm");
  assert.equal(gap.quality.score, null);
  assert.equal(gap.reliability.score, null);
  assert.equal(gap.customerSatisfaction.score, null);
  assert.equal(gap.quality.caption, null);
  assert.equal(countCombinedPaints(gap), 0);
});

test("Quality GAPs when overallQuality is null — no silent combined fallback", () => {
  const row = {
    ...OWNER_REVIEW_BRAND_SEED[0]!,
    name: "Null Quality Brand",
    overallQuality: null,
    combined: 3.9,
  };
  const slots = mapOwnerReviewSlots(row);
  assert.equal(slots.quality.score, null);
  assert.equal(slots.quality.basis, null);
  assert.equal(slots.quality.caption, null);
  assert.equal(slots.reliability.score, null);
  assert.equal(slots.customerSatisfaction.score, 3.9);
  assert.equal(slots.customerSatisfaction.basis, "combined");
  assert.match(
    slots.customerSatisfaction.caption ?? "",
    /Owner reviews \(combined\) · brand-level/,
  );
  assert.equal(countCombinedPaints(slots), 1);
});

test("seeded brands never paint combined on more than one slot", () => {
  for (const row of OWNER_REVIEW_BRAND_SEED) {
    const slots = mapOwnerReviewSlots(row);
    assert.equal(countCombinedPaints(slots), 1, row.name);
    assert.equal(slots.reliability.score, null, row.name);
    assert.notEqual(slots.quality.basis, "combined", row.name);
    if (row.overallQuality != null) {
      assert.equal(slots.quality.score, row.overallQuality, row.name);
      assert.equal(slots.quality.basis, "overall_quality", row.name);
    }
    assert.equal(slots.customerSatisfaction.score, row.combined, row.name);
  }
});

test("thin brand below floor is GAP — never a silent number", () => {
  const thin = {
    ...OWNER_REVIEW_BRAND_SEED[0]!,
    name: "Thin Brand",
    n: OWNER_REVIEW_BRAND_FLOOR - 1,
    combined: 4.9,
    overallQuality: 4.8,
  };
  assert.ok(thin.n < OWNER_REVIEW_BRAND_FLOOR);
  assert.equal(lookupOwnerReviewBrand("Thin Brand"), null);
});

test("footer and Facts UI never claim J.D. Power or Consumer Reports", () => {
  assert.match(OWNER_REVIEW_FOOTER, /Owner reviews/);
  assert.match(OWNER_REVIEW_FOOTER, /n≥15 brand/);
  assert.match(OWNER_REVIEW_FOOTER, /n≥8 model/);
  assert.match(OWNER_REVIEW_FOOTER, /[Bb]rand-level/);
  assert.match(OWNER_REVIEW_FOOTER, /Reliability is RvFOX reputation/);
  assert.doesNotMatch(OWNER_REVIEW_FOOTER, /Reliability is an Insider/);
  assert.doesNotMatch(OWNER_REVIEW_FOOTER, /J\.D\. Power/);
  assert.doesNotMatch(OWNER_REVIEW_FOOTER, /Consumer Reports/);
  assert.doesNotMatch(OWNER_REVIEW_FOOTER, /Dealer support/);
  assert.equal(formatOwnerReviewScore(3.6), "3.6");
  assert.equal(formatOwnerReviewScore(null), "GAP");

  const src = readFileSync(join(root, "ownerReviewRatings.ts"), "utf8");
  assert.doesNotMatch(src, /displayRating|ratingEstimate|computeRating/);
  assert.doesNotMatch(src, /overallQuality \?\? row\.combined|qualityScore \?\? row\.combined/);
  assert.doesNotMatch(src, /row\.factoryWarranty|livability|drivingTowing/);
  assert.match(src, /Owner reviews \(combined\)/);
});

test("DialaBot / Bland / SMS stay out of owner-review ratings", () => {
  const files = [
    "ownerReviewRatings.ts",
    "ownerReviewRatings.seed.ts",
    "reportRatings.ts",
    "../../components/rvfax/RvDetail.tsx",
  ];
  for (const rel of files) {
    const src = readFileSync(join(root, rel), "utf8");
    assert.doesNotMatch(src, /DialaBot|Bland|twilio|SMS gateway/i);
  }
});
