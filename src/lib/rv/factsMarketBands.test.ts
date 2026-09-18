import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { LOW_CONFIDENCE_LISTINGS_MESSAGE } from "./publicListingComps.ts";
import {
  factsMarketBandSlots,
  MARKET_BAND_AVERAGE_LABEL,
  MARKET_BAND_HIGH_LABEL,
  MARKET_BAND_LOW_LABEL,
  THIN_SAMPLE_FLAG_LABEL,
} from "./factsMarketBands.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("band labels are Low / Average / High — not paid book brands", () => {
  assert.equal(MARKET_BAND_LOW_LABEL, "Low");
  assert.equal(MARKET_BAND_AVERAGE_LABEL, "Average");
  assert.equal(MARKET_BAND_HIGH_LABEL, "High");
  assert.equal(THIN_SAMPLE_FLAG_LABEL, "Thin sample");
});

test("Med/High sold comps paint the existing Low / Average / High dollars", () => {
  const slots = factsMarketBandSlots({
    retailLow: "$140,000",
    average: "$150,000",
    retailHigh: "$165,000",
    hideRetailHigh: false,
    confidence: "medium",
    thinSampleMessage: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
  assert.deepEqual(slots.low, { label: "Low", value: "$140,000" });
  assert.deepEqual(slots.average, { label: "Average", value: "$150,000" });
  assert.deepEqual(slots.high, { label: "High", value: "$165,000" });
  assert.equal(slots.thinSample, null);
});

test("Low / thin comps hide High and show the thin-sample flag", () => {
  const slots = factsMarketBandSlots({
    retailLow: "$141,000",
    average: "$145,000",
    retailHigh: "$219,000",
    hideRetailHigh: true,
    confidence: "low",
    thinSampleMessage: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
  assert.equal(slots.low.label, "Low");
  assert.equal(slots.low.value, "$141,000");
  assert.equal(slots.average.label, "Average");
  assert.equal(slots.average.value, "$145,000");
  assert.equal(slots.high, null);
  assert.deepEqual(slots.thinSample, {
    label: "Thin sample",
    message: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
  assert.notEqual(slots.thinSample?.message, slots.high?.value);
});

test("Low confidence hides High even if hideRetailHigh is missing", () => {
  const slots = factsMarketBandSlots({
    retailLow: "$90,000",
    average: "$95,000",
    retailHigh: "$160,000",
    hideRetailHigh: false,
    confidence: "low",
    thinSampleMessage: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
  assert.equal(slots.high, null, "flag cannot miss — do not invent High");
  assert.deepEqual(slots.thinSample, {
    label: "Thin sample",
    message: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
});

test("Facts bands UI + detail wire existing fields only", () => {
  const bands = readFileSync(
    join(root, "../../components/rvfax/FactsMarketBands.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(bands, /data-facts-market-bands/);
  assert.match(bands, /data-thin-sample/);
  assert.match(bands, /MARKET_BAND_LOW_LABEL/);
  assert.match(bands, /MARKET_BAND_AVERAGE_LABEL/);
  assert.match(bands, /MARKET_BAND_HIGH_LABEL/);
  assert.match(bands, /THIN_SAMPLE_FLAG_LABEL/);
  assert.match(bands, /factsMarketBandSlots/);
  assert.match(bands, /slots\.high \?/);
  assert.match(bands, /slots\.thinSample/);
  assert.doesNotMatch(bands, /JD Power|J\.D\. Power|NADA|MarketCheck/);
  assert.doesNotMatch(bands, /estimateMarket|retailHighMult|LOW_THIN_FREE_PATH/);

  assert.match(detail, /FactsMarketBands/);
  assert.match(detail, /retailLow=\{formatMoney\(deskMarket\.retailLow\)\}/);
  assert.match(detail, /average=\{factsMoneyHeadline\(deskMarketValue\)\}/);
  assert.match(detail, /retailHigh=\{formatMoney\(deskMarket\.retailHigh\)\}/);
  assert.match(detail, /hideRetailHigh=\{hideRetailHigh\}/);
  assert.match(detail, /confidence=\{soldConfidence\}/);
  assert.match(detail, /thinSampleMessage=\{LOW_CONFIDENCE_LISTINGS_MESSAGE\}/);
  assert.match(detail, /factsDeskMarketTileLabel\(true\)/);
  assert.match(detail, /factsDeskMarketTileLabel\(\s*false,\s*marketSourceLabel/);
  assert.doesNotMatch(detail, /label="Retail low"/);
  assert.doesNotMatch(detail, /label="Retail high"/);
});
