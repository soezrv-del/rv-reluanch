import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  CATALOG_ESTIMATE_LABEL,
  LOW_CONFIDENCE_LISTINGS_MESSAGE,
  SOLD_COMPS_LABEL,
} from "./publicListingComps.ts";
import {
  JD_POWER_BLEND_LABEL,
  JD_POWER_PUBLIC_LABEL,
} from "./jdPowerPublic.ts";
import {
  FACTS_MARKET_ERROR_MESSAGE,
  FACTS_MARKET_IDLE_HEADLINE,
  FACTS_MARKET_LOADING_MESSAGE,
  factsMarketAverageCaption,
  factsMarketAverageUsd,
  factsMarketBandSlots,
  factsMarketIsBareJdPower,
  factsMarketIsThinSample,
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

test("Average is marketValue; absent uses retailLow/retailHigh midpoint", () => {
  assert.equal(
    factsMarketAverageUsd({
      marketValue: 150000,
      retailLow: 140000,
      retailHigh: 165000,
    }),
    150000,
  );
  assert.equal(
    factsMarketAverageUsd({
      retailLow: 140000,
      retailHigh: 160000,
    }),
    150000,
  );
  assert.equal(
    factsMarketAverageUsd({
      marketValue: 0,
      retailLow: 100000,
      retailHigh: 120000,
    }),
    110000,
  );
});

test("thin-sample: confidence low or public sample < 2", () => {
  assert.equal(factsMarketIsThinSample({ confidence: "low" }), true);
  assert.equal(factsMarketIsThinSample({ confidence: "medium" }), false);
  assert.equal(factsMarketIsThinSample({ confidence: "high" }), false);
  assert.equal(factsMarketIsThinSample({ soldSampleSize: 1 }), true);
  assert.equal(factsMarketIsThinSample({ sampleSize: 0 }), true);
  assert.equal(factsMarketIsThinSample({ soldSampleSize: 2 }), false);
  assert.equal(
    factsMarketIsThinSample({ confidence: "medium", soldSampleSize: 3 }),
    false,
  );
});

test("Med/High sold comps paint the existing Low / Average / High dollars", () => {
  const slots = factsMarketBandSlots({
    retailLow: "$140,000",
    average: "$150,000",
    retailHigh: "$165,000",
    hideRetailHigh: false,
    confidence: "medium",
    soldSampleSize: 3,
    thinSampleMessage: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
  assert.deepEqual(slots.low, { label: "Low", value: "$140,000" });
  assert.deepEqual(slots.average, { label: "Average", value: "$150,000" });
  assert.deepEqual(slots.high, { label: "High", value: "$165,000" });
  assert.equal(slots.thinSample, null);
});

test("hideRetailHigh omits High; low confidence shows thin-sample copy", () => {
  const slots = factsMarketBandSlots({
    retailLow: "$141,000",
    average: "$145,000",
    retailHigh: "$219,000",
    hideRetailHigh: true,
    confidence: "low",
    soldSampleSize: 1,
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
});

test("hideRetailHigh is the only High gate — low confidence still flags thin", () => {
  const slots = factsMarketBandSlots({
    retailLow: "$90,000",
    average: "$95,000",
    retailHigh: "$160,000",
    hideRetailHigh: false,
    confidence: "low",
    thinSampleMessage: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
  assert.deepEqual(slots.high, { label: "High", value: "$160,000" });
  assert.deepEqual(slots.thinSample, {
    label: "Thin sample",
    message: LOW_CONFIDENCE_LISTINGS_MESSAGE,
  });
});

test("caption: Catalog estimate on thin; blend sublabel; never bare J.D. Power", () => {
  assert.equal(factsMarketIsBareJdPower("J.D. Power"), true);
  assert.equal(factsMarketIsBareJdPower("JD Power"), true);
  assert.equal(factsMarketIsBareJdPower("Catalog estimate"), false);
  assert.equal(factsMarketIsBareJdPower(JD_POWER_BLEND_LABEL), false);
  assert.equal(
    JD_POWER_BLEND_LABEL,
    "Avg of public J.D. Power estimate + asking comps",
  );
  assert.doesNotMatch(JD_POWER_BLEND_LABEL, /sold comps/i);
  assert.equal(
    factsMarketAverageCaption({
      confidence: "low",
      source: "catalog",
      sourceLabel: CATALOG_ESTIMATE_LABEL,
    }),
    "Catalog estimate",
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "low",
      sourceLabel: "J.D. Power",
    }),
    "Catalog estimate",
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "high",
      sourceLabel: "J.D. Power",
    }),
    undefined,
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "medium",
      sourceLabel: SOLD_COMPS_LABEL,
    }),
    undefined,
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "medium",
      sourceLabel: "Sold comps + public book",
    }),
    "Sold comps + public book",
  );
});

test("caption: blend active → blend cue even when sourceLabel is still Catalog estimate", () => {
  assert.equal(
    factsMarketAverageCaption({
      confidence: "low",
      thin: true,
      source: "jd_power_blend",
      sourceLabel: CATALOG_ESTIMATE_LABEL,
    }),
    JD_POWER_BLEND_LABEL,
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "medium",
      source: "jd_power_blend",
      sourceLabel: JD_POWER_BLEND_LABEL,
    }),
    JD_POWER_BLEND_LABEL,
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "low",
      source: "jd_power_public",
      sourceLabel: CATALOG_ESTIMATE_LABEL,
    }),
    JD_POWER_PUBLIC_LABEL,
  );
  assert.notEqual(
    factsMarketAverageCaption({
      source: "jd_power_blend",
      sourceLabel: CATALOG_ESTIMATE_LABEL,
    }),
    "J.D. Power",
  );
  assert.notEqual(
    factsMarketAverageCaption({
      source: "jd_power_blend",
      sourceLabel: CATALOG_ESTIMATE_LABEL,
    }),
    "NADA",
  );
});

test("caption: JD GAP → Catalog estimate (or comps-only when that is the path)", () => {
  assert.equal(
    factsMarketAverageCaption({
      confidence: "low",
      thin: true,
      source: "catalog",
      sourceLabel: CATALOG_ESTIMATE_LABEL,
    }),
    CATALOG_ESTIMATE_LABEL,
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "low",
      sourceLabel: CATALOG_ESTIMATE_LABEL,
    }),
    "Catalog estimate",
  );
  assert.equal(
    factsMarketAverageCaption({
      confidence: "medium",
      source: "public_listings",
      sourceLabel: SOLD_COMPS_LABEL,
    }),
    undefined,
  );
});

test("Facts bands UI + detail wire the locked MarketEstimate fields", () => {
  const bands = readFileSync(
    join(root, "../../components/rvfax/FactsMarketBands.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  const live = readFileSync(join(root, "factsMarketBands.ts"), "utf8");
  assert.match(bands, /data-facts-market-bands/);
  assert.match(bands, /data-thin-sample/);
  assert.match(bands, /MARKET_BAND_LOW_LABEL/);
  assert.match(bands, /MARKET_BAND_AVERAGE_LABEL/);
  assert.match(bands, /MARKET_BAND_HIGH_LABEL/);
  assert.match(bands, /THIN_SAMPLE_FLAG_LABEL/);
  assert.match(bands, /factsMarketBandSlots/);
  assert.match(bands, /soldSampleSize/);
  assert.match(bands, /sampleSize/);
  assert.match(bands, /slots\.high \?/);
  assert.match(bands, /slots\.thinSample/);
  assert.doesNotMatch(bands, /JD Power|J\.D\. Power|NADA|MarketCheck/);
  assert.doesNotMatch(bands, /estimateMarket|retailHighMult|LOW_THIN_FREE_PATH/);

  assert.match(detail, /FactsMarketBands/);
  assert.match(detail, /factsMarketAverageUsd\(deskMarket\)/);
  assert.match(detail, /retailLow=\{formatMoney\(deskMarket\.retailLow\)\}/);
  assert.match(detail, /average=\{factsMoneyHeadline\(bandAverage\)\}/);
  assert.match(detail, /retailHigh=\{formatMoney\(deskMarket\.retailHigh\)\}/);
  assert.match(detail, /hideRetailHigh=\{hideRetailHigh\}/);
  assert.match(detail, /confidence=\{marketConfidence\}/);
  assert.match(detail, /soldSampleSize=\{compsSoldSample\}/);
  assert.match(detail, /sampleSize=\{compsSample\}/);
  assert.match(detail, /thinSampleMessage=\{LOW_CONFIDENCE_LISTINGS_MESSAGE\}/);
  assert.match(detail, /deskMarket\.sourceLabel/);
  assert.match(detail, /source: deskMarket\.source/);
  assert.match(detail, /PUBLIC_SOLD_DISCLAIMER/);
  assert.match(detail, /fetchFactsMarketLive/);
  assert.match(detail, /if \(!marketOpen\) return/);
  assert.match(live, /fresh: true/);
  assert.match(live, /cache: "no-store"/);
  assert.match(detail, /data-facts-market-loading/);
  assert.match(detail, /data-facts-market-error/);
  assert.match(detail, /data-facts-market-gap/);
  assert.match(detail, /FACTS_MARKET_LOADING_MESSAGE/);
  assert.match(detail, /FACTS_MARKET_ERROR_MESSAGE/);
  assert.match(detail, /FACTS_MARKET_IDLE_HEADLINE/);
  assert.match(detail, /useState\(false\)/);
  assert.doesNotMatch(detail, /Updating…/);
  assert.doesNotMatch(detail, /nightly/);
  assert.doesNotMatch(detail, /cached bands/i);
  assert.doesNotMatch(detail, /book refresh/i);
  assert.doesNotMatch(detail, /title="J\.D\. Power"/);
  assert.doesNotMatch(detail, /factsDeskMarketTileLabel/);
  assert.doesNotMatch(detail, /label="Retail low"/);
  assert.doesNotMatch(detail, /label="Retail high"/);
  assert.doesNotMatch(detail, /JD Power|J\.D\. Power|NADA book/);
  assert.equal(CATALOG_ESTIMATE_LABEL, "Catalog estimate");
  assert.equal(FACTS_MARKET_LOADING_MESSAGE, "Loading");
  assert.equal(FACTS_MARKET_ERROR_MESSAGE, "Live market lookup failed");
  assert.equal(FACTS_MARKET_IDLE_HEADLINE, "Tap to check");

  const api = readFileSync(
    join(root, "../../routes/api/rvfax.public-comps.ts"),
    "utf8",
  );
  assert.match(api, /fresh/);
  assert.match(api, /!fresh && hit/);
});
