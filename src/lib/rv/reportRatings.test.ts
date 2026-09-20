import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { countCombinedPaints } from "./ownerReviewRatings.ts";
import {
  formatStarsOrGap,
  groundedStars,
  mapReportRatings,
} from "./reportRatings.ts";
import { UNKNOWN_MAKE_BASE, computeRating } from "./ratingSystem.ts";

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

test("mapReportRatings: Q/S from owner reviews; Reliability from reputation", () => {
  const empty = mapReportRatings({});
  assert.equal(empty.quality.score, null);
  assert.equal(empty.reliability.score, null);
  assert.equal(empty.customerSatisfaction.score, null);

  const unknown = mapReportRatings({
    make: "Mystery Coach",
    model: "Phantom",
  });
  assert.equal(unknown.quality.score, null);
  assert.equal(unknown.reliability.score, null);
  assert.equal(unknown.reliability.stars, null);
  assert.equal(unknown.reliability.caption, null);
  assert.equal(unknown.customerSatisfaction.score, null);
  assert.notEqual(unknown.reliability.score, UNKNOWN_MAKE_BASE);

  const palomino = mapReportRatings({ make: "Palomino", model: "SolAire" });
  assert.equal(palomino.quality.score, null);
  assert.equal(palomino.customerSatisfaction.score, null);
  assert.equal(palomino.reliability.score, computeRating("Palomino", "SolAire", ""));
  assert.equal(palomino.reliability.basis, "reputation");
  assert.equal(palomino.reliability.caption, "RvFOX reputation · brand");
  assert.doesNotMatch(palomino.reliability.caption ?? "", /Owner reviews/);

  const forest = mapReportRatings({ make: "Forest River", model: "Georgetown" });
  assert.equal(forest.quality.score, 3.1);
  assert.equal(
    forest.reliability.score,
    computeRating("Forest River", "Georgetown", ""),
  );
  assert.ok(forest.reliability.stars != null);
  assert.equal(forest.reliability.basis, "reputation");
  assert.match(
    forest.reliability.caption ?? "",
    /RvFOX reputation · Georgetown · Standard/,
  );
  assert.doesNotMatch(forest.reliability.caption ?? "", /Owner reviews/);
  assert.equal(forest.customerSatisfaction.score, 3.6);
  assert.equal(forest.quality.grain, "brand");
  assert.match(forest.quality.caption ?? "", /Owner reviews · overall quality · brand-level/);
  assert.match(
    forest.customerSatisfaction.caption ?? "",
    /Owner reviews \(combined\) · brand-level/,
  );
  assert.notEqual(forest.quality.score, forest.customerSatisfaction.score);
  assert.equal(countCombinedPaints(forest), 1);
  assert.notEqual(forest.reliability.basis, "combined");
});

test("mapReportRatings: known brands get numeric Reliability; year uses computeRating", () => {
  const tiffin = mapReportRatings({ make: "Tiffin", model: "Phaeton" });
  assert.equal(tiffin.quality.score, 4.4);
  assert.equal(tiffin.quality.basis, "overall_quality");
  assert.equal(tiffin.reliability.score, computeRating("Tiffin", "Phaeton", ""));
  assert.equal(tiffin.reliability.basis, "reputation");
  assert.match(
    tiffin.reliability.caption ?? "",
    /RvFOX reputation · Phaeton · Upper Mid-Range/,
  );
  assert.equal(tiffin.customerSatisfaction.score, 4.3);
  assert.equal(tiffin.customerSatisfaction.basis, "combined");
  assert.equal(countCombinedPaints(tiffin), 1);

  const tiffinYear = mapReportRatings({
    make: "Tiffin",
    model: "Phaeton",
    year: "2022",
  });
  assert.equal(
    tiffinYear.reliability.score,
    computeRating("Tiffin", "Phaeton", "2022"),
  );
  assert.notEqual(tiffinYear.reliability.score, tiffin.reliability.score);
  assert.equal(tiffinYear.quality.score, 4.4);
  assert.equal(tiffinYear.customerSatisfaction.score, 4.3);

  const newmar = mapReportRatings({
    make: "Newmar",
    model: "Dutch Star",
    year: "2019",
  });
  assert.equal(
    newmar.reliability.score,
    computeRating("Newmar", "Dutch Star", "2019"),
  );
  assert.match(
    newmar.reliability.caption ?? "",
    /RvFOX reputation · Dutch Star · Upper Mid-Range/,
  );
});

test("Facts Ratings section wires owner reviews and does not invent from live/warranty", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /mapReportRatings\(\{\s*make,\s*model,\s*year\s*\}\)/);
  assert.match(detail, /score:\s*reportRatings\.reliability\.score/);
  assert.match(detail, /label:\s*"Quality"/);
  assert.match(detail, /label:\s*"Reliability"/);
  assert.match(detail, /label:\s*"Customer satisfaction"/);
  assert.match(detail, /Torque-to-Weight/);
  assert.match(detail, /gvwrRaw:\s*specs\.gvwr/);
  assert.match(detail, /overrideUvwLbs/);
  assert.match(detail, /OWNER_REVIEW_FOOTER/);
  assert.match(detail, /formatOwnerReviewScore/);
  assert.match(detail, /R = RvFOX reputation/);
  assert.doesNotMatch(detail, /qualityScore:\s*live\?\.live\s*\?\s*live\.ratingEstimate/);
  assert.doesNotMatch(detail, /qualityScore:\s*displayRating/);
  assert.doesNotMatch(detail, /reliabilityScore:\s*data\.warrantyYears/);
  assert.doesNotMatch(detail, /satisfactionScore:\s*displayRating/);
  const ratingsBlock = detail.slice(
    detail.indexOf('data-testid="facts-ratings"'),
    detail.indexOf('data-facts-market-value'),
  );
  assert.doesNotMatch(ratingsBlock, /OWNER_REVIEW_FOOTER/);
  assert.doesNotMatch(ratingsBlock, /J\.D\. Power/);
  assert.doesNotMatch(ratingsBlock, /Consumer Reports/);
  assert.doesNotMatch(ratingsBlock, /Dealer support index/);
  assert.doesNotMatch(ratingsBlock, /n≥15 brand|n≥8 model|RV Insider snapshot/);
  assert.doesNotMatch(ratingsBlock, /Torque-to-Weight is separate hard math/);

  const reportSrc = readFileSync(join(root, "reportRatings.ts"), "utf8");
  assert.match(reportSrc, /getRatingMetadata/);
  assert.match(reportSrc, /isKnownManufacturer/);
  assert.doesNotMatch(reportSrc, /getMockReviews|live\?\.ratingEstimate/);
  assert.doesNotMatch(reportSrc, /row\.factoryWarranty|row\.livability/);
});
