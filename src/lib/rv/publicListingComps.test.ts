import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  PUBLIC_COMPS_MIN_SAMPLE,
  YEAR_MIN,
  buildListingCompsPrompt,
  coachYearRange,
  extractListingAsks,
  filterAsksForRange,
  ladderFromMedianAsk,
  medianUsd,
  prefersPublicComps,
  reducePublicComps,
  resolvePrimaryMarket,
} from "./publicListingComps.ts";
import { estimateMarket } from "./marketEstimate.ts";
import type { RVSpec } from "./rvTypes.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function spec(): RVSpec {
  return {
    type: "Class B",
    fuelType: "Diesel",
    floorplans: ["24D"],
    lengthRange: [24, 24],
    weightRange: [9000, 11000],
    slideouts: 0,
    sleeps: 2,
    msrpRange: [150000, 200000],
    recalls: 0,
    rating: 4,
    image: "",
  };
}

test("valuation modules never import the MarketCheck client", () => {
  for (const name of [
    "publicListingComps.ts",
    "marketEstimate.ts",
    "researchPublicComps.ts",
  ]) {
    const text = src(name);
    assert.doesNotMatch(
      text,
      /from\s+["'][^"']*marketcheck[^"']*["']/,
      `${name} must not import MarketCheck`,
    );
  }
});

test("junk $1 asks are filtered", () => {
  const notes = [
    "ASK: YEAR=2022 MAKE=Winnebago MODEL=Revel PRICE=1 SOURCE=spam",
    "ASK: YEAR=2022 MAKE=Winnebago MODEL=Revel PRICE=129900 SOURCE=rvtrader.com",
    "ASK: YEAR=2023 MAKE=Winnebago MODEL=Revel PRICE=500 SOURCE=parts",
    "ASK: YEAR=2021 MAKE=Winnebago MODEL=Revel PRICE=118500 SOURCE=rvusa.com",
  ].join("\n");
  const asks = extractListingAsks(notes);
  assert.ok(asks.every((a) => a.askUsd >= 1000));
  assert.equal(asks.length, 2);
});

test("median math: odd and even counts", () => {
  assert.equal(medianUsd([10, 30, 20]), 20);
  assert.equal(medianUsd([10, 20, 30, 40]), 25);
  assert.equal(medianUsd([]), 0);
});

test("year range clamps to ±2 and a reasonable floor/ceiling", () => {
  assert.deepEqual(coachYearRange(2022, 2, 2026), { from: 2020, to: 2024 });
  assert.deepEqual(coachYearRange(1991, 2, 2026), { from: YEAR_MIN, to: 1993 });
  assert.deepEqual(coachYearRange(2026, 2, 2026), { from: 2024, to: 2027 });
});

test("asks outside the year window are dropped", () => {
  const range = { from: 2020, to: 2024 };
  const kept = filterAsksForRange(
    [
      { year: 2018, askUsd: 90000 },
      { year: 2022, askUsd: 120000 },
      { year: null, askUsd: 110000 },
      { year: 2025, askUsd: 140000 },
    ],
    range,
  );
  assert.equal(kept.length, 2);
  assert.ok(kept.some((a) => a.year === 2022));
  assert.ok(kept.some((a) => a.year == null));
});

test("reducePublicComps: median + ladder + sample size", () => {
  const range = { from: 2020, to: 2024 };
  const comps = reducePublicComps(
    [
      { year: 2021, askUsd: 100000 },
      { year: 2022, askUsd: 120000 },
      { year: 2023, askUsd: 140000 },
      { year: 2010, askUsd: 40000 },
    ],
    range,
  );
  assert.ok(comps);
  assert.equal(comps.sampleSize, 3);
  assert.equal(comps.medianAsk, 120000);
  assert.equal(comps.source, "public_listings");
  const ladder = ladderFromMedianAsk(120000);
  assert.equal(comps.tradeIn, ladder.tradeIn);
  assert.equal(comps.retailLow, ladder.retailLow);
  assert.equal(comps.retailHigh, ladder.retailHigh);
  assert.ok(comps.tradeIn < comps.retailLow);
  assert.ok(comps.retailLow < comps.retailHigh);
  assert.ok(prefersPublicComps(comps));
});

test("prefer threshold is 2 samples (sparse same-coach listings)", () => {
  assert.equal(PUBLIC_COMPS_MIN_SAMPLE, 2);
  const one = reducePublicComps(
    [{ year: 2022, askUsd: 120000 }],
    { from: 2020, to: 2024 },
  );
  assert.ok(one);
  assert.equal(prefersPublicComps(one), false);
  const two = reducePublicComps(
    [
      { year: 2022, askUsd: 120000 },
      { year: 2021, askUsd: 110000 },
    ],
    { from: 2020, to: 2024 },
  );
  assert.ok(two);
  assert.equal(prefersPublicComps(two), true);
});

test("resolvePrimaryMarket prefers public comps over live and catalog", () => {
  const catalog = estimateMarket(spec(), "2022", undefined, { asOfYear: 2026 });
  const comps = reducePublicComps(
    [
      { year: 2021, askUsd: 210000 },
      { year: 2022, askUsd: 220000 },
      { year: 2023, askUsd: 230000 },
    ],
    { from: 2020, to: 2024 },
  );
  const resolved = resolvePrimaryMarket({
    catalog,
    liveLadder: { tradeIn: 50000, retailLow: 60000, retailHigh: 70000 },
    comps,
  });
  assert.equal(resolved.source, "public_listings");
  assert.match(resolved.sourceLabel || "", /Public listing asks \(2020–2024\)/);
  assert.equal(resolved.retailHigh, comps!.retailHigh);
});

test("resolvePrimaryMarket falls back to catalog when comps are thin", () => {
  const catalog = estimateMarket(spec(), "2022", undefined, { asOfYear: 2026 });
  const thin = reducePublicComps(
    [{ year: 2022, askUsd: 220000 }],
    { from: 2020, to: 2024 },
  );
  const resolved = resolvePrimaryMarket({ catalog, comps: thin });
  assert.equal(resolved.source, "catalog");
  assert.equal(resolved.sourceLabel, "Catalog estimate");
  assert.equal(resolved.tradeIn, catalog.tradeIn);
});

test("listing prompt demands asks and forbids paid books", () => {
  const p = buildListingCompsPrompt({
    year: 2022,
    make: "Winnebago",
    model: "Revel",
    yearRange: { from: 2020, to: 2024 },
  });
  assert.match(p.system, /ASK:/);
  assert.match(p.system, /MarketCheck/);
  assert.match(p.system, /NADA/);
  assert.match(p.system, /asking/i);
});
