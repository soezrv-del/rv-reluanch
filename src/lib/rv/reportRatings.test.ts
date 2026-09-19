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

test("mapReportRatings: quality from ratingEstimate; others GAP unless a numeric score is passed", () => {
  const empty = mapReportRatings({});
  assert.deepEqual(empty, {
    quality: null,
    reliability: null,
    customerSatisfaction: null,
  });

  const liveQuality = mapReportRatings({ qualityScore: 4.2 });
  assert.equal(liveQuality.quality, 4);
  assert.equal(liveQuality.reliability, null);
  assert.equal(liveQuality.customerSatisfaction, null);

  const allGrounded = mapReportRatings({
    qualityScore: 4,
    reliabilityScore: 3,
    satisfactionScore: 5,
  });
  assert.deepEqual(allGrounded, {
    quality: 4,
    reliability: 3,
    customerSatisfaction: 5,
  });
});

test("Facts Ratings section shows four rows and does not invent reliability/satisfaction", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /mapReportRatings/);
  assert.match(detail, /qualityScore:\s*live\?\.live\s*\?\s*live\.ratingEstimate/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /label:\s*"Reliability"/);
  assert.match(detail, /label:\s*"Customer satisfaction"/);
  assert.match(detail, /label:\s*"Torque-to-weight"/);
  // Do not invent from warranty / NHTSA / mock reviews / RvFOX displayRating.
  assert.doesNotMatch(
    detail,
    /qualityScore:\s*displayRating/,
  );
  assert.doesNotMatch(detail, /reliabilityScore:\s*data\.warrantyYears/);
  assert.doesNotMatch(detail, /satisfactionScore:\s*displayRating/);
});
