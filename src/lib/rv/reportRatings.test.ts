import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatStarsOrGap,
  groundedStars,
  mapReportRatings,
} from "./reportRatings.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("groundedStars maps existing 1–5 scores only — no invented bands", () => {
  assert.equal(groundedStars(5), 5);
  assert.equal(groundedStars(4.4), 4);
  assert.equal(groundedStars(4.5), 5);
  assert.equal(groundedStars(1), 1);
  assert.equal(groundedStars(null), null);
  assert.equal(groundedStars(undefined), null);
  assert.equal(groundedStars(0), null);
  assert.equal(groundedStars(-1), null);
  assert.equal(groundedStars(5.1), null);
  assert.equal(groundedStars(8.5), null);
  assert.equal(groundedStars(Number.NaN), null);
  assert.equal(formatStarsOrGap(4), "★★★★☆");
  assert.equal(formatStarsOrGap(null), "GAP");
});

test("mapReportRatings: unknown make is GAP; seeded brand is owner reviews", () => {
  const empty = mapReportRatings({});
  assert.equal(empty.quality.score, null);
  assert.equal(empty.reliability.score, null);
  assert.equal(empty.customerSatisfaction.score, null);

  const unknown = mapReportRatings({ make: "Palomino", model: "SolAire" });
  assert.equal(unknown.quality.score, null);
  assert.equal(unknown.reliability.score, null);
  assert.equal(unknown.customerSatisfaction.score, null);
  assert.equal(unknown.quality.caption, null);

  const forest = mapReportRatings({ make: "Forest River", model: "Georgetown" });
  assert.equal(forest.quality.score, 3.1);
  assert.equal(forest.reliability.score, null);
  assert.equal(forest.reliability.stars, null);
  assert.equal(forest.customerSatisfaction.score, 3.6);
  assert.equal(forest.quality.grain, "brand");
  assert.match(forest.quality.caption ?? "", /Owner reviews · overall quality · brand-level/);
  assert.equal(forest.reliability.caption, null);
  assert.match(
    forest.customerSatisfaction.caption ?? "",
    /Owner reviews \(combined\) · brand-level/,
  );
  assert.notEqual(forest.quality.score, forest.customerSatisfaction.score);
});

test("Facts Ratings section wires owner reviews and does not invent from live/warranty", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /mapReportRatings\(\{\s*make,\s*model\s*\}\)/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /label:\s*"Reliability"/);
  assert.match(detail, /label:\s*"Customer satisfaction"/);
  assert.match(detail, /Torque-to-Weight/);
  assert.match(detail, /gvwrRaw:\s*specs\.gvwr/);
  assert.match(detail, /overrideUvwLbs/);
  assert.match(detail, /OWNER_REVIEW_FOOTER/);
  assert.match(detail, /formatOwnerReviewScore/);
  assert.match(detail, /R = GAP \(no Insider category\)/);
  assert.doesNotMatch(detail, /qualityScore:\s*live\?\.live\s*\?\s*live\.ratingEstimate/);
  assert.doesNotMatch(detail, /qualityScore:\s*displayRating/);
  assert.doesNotMatch(detail, /reliabilityScore:\s*data\.warrantyYears/);
  assert.doesNotMatch(detail, /satisfactionScore:\s*displayRating/);
  const ratingsBlock = detail.slice(
    detail.indexOf('data-testid="facts-ratings"'),
    detail.indexOf('data-facts-market-value'),
  );
  assert.doesNotMatch(ratingsBlock, /J\.D\. Power/);
  assert.doesNotMatch(ratingsBlock, /Consumer Reports/);
  assert.doesNotMatch(ratingsBlock, /Dealer support index/);
});
