import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  ASKING_COMPS_LABEL,
  CATALOG_ESTIMATE_LABEL,
  LOW_CONFIDENCE_LISTINGS_MESSAGE,
  PUBLIC_COMPS_MIN_SAMPLE,
  PUBLIC_SOLD_DISCLAIMER,
  SOLD_COMPS_HIGH_SAMPLE,
  SOLD_COMPS_LABEL,
  YEAR_MIN,
  buildListingCompsPrompt,
  coachYearRange,
  compsConfidenceLabel,
  extractListingAsks,
  filterAsksForRange,
  ladderFromMedianAsk,
  listingWeight,
  medianUsd,
  mileageBand,
  prefersPublicComps,
  reducePublicComps,
  resolvePrimaryMarket,
  selectCompListings,
  soldCompsConfidence,
  weightedMedianUsd,
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

function sold(
  year: number,
  askUsd: number,
  miles?: number | null,
): { year: number; askUsd: number; kind: "sold"; miles?: number | null } {
  return { year, askUsd, kind: "sold", miles };
}

test("labels: Sold comps, Catalog estimate, low-confidence copy, disclaimer", () => {
  assert.equal(SOLD_COMPS_LABEL, "Sold comps");
  assert.equal(CATALOG_ESTIMATE_LABEL, "Catalog estimate");
  assert.equal(ASKING_COMPS_LABEL, "Asking comps");
  assert.equal(LOW_CONFIDENCE_LISTINGS_MESSAGE, "Not enough public listings");
  assert.equal(
    PUBLIC_SOLD_DISCLAIMER,
    "Values are estimates from public listings. Not JD Power or NADA book value.",
  );
});

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
  assert.ok(asks.every((a) => a.kind === "asking"));
});

test("extractListingAsks: SOLD lines are sold; ASK lines stay asking", () => {
  const notes = [
    "SOLD: YEAR=2022 MAKE=Winnebago MODEL=Revel PRICE=119900 MILES=28400 SOURCE=rvtrader.com",
    "ASK: YEAR=2021 MAKE=Winnebago MODEL=Revel PRICE=129900 MILES=19000 SOURCE=rvusa.com",
    "A 2020 Revel sold for $108,500 at a dealer.",
    "Typically sold around $155,000 in this market.",
  ].join("\n");
  const rows = extractListingAsks(notes);
  const solds = rows.filter((r) => r.kind === "sold");
  const asks = rows.filter((r) => r.kind === "asking");
  assert.ok(solds.some((s) => s.askUsd === 119900 && s.miles === 28400));
  assert.ok(solds.some((s) => s.askUsd === 108500));
  assert.ok(asks.some((a) => a.askUsd === 129900));
  assert.ok(
    !solds.some((s) => s.askUsd === 155000),
    "must not invent a sold price from 'typically sold around'",
  );
});

test("extractListingAsks: never invents miles", () => {
  const rows = extractListingAsks(
    "SOLD: YEAR=2022 MAKE=Winnebago MODEL=Revel PRICE=119900 MILES=- SOURCE=rvtrader.com",
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.kind, "sold");
  assert.equal(rows[0]!.miles, null);
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

test("sold comps beat asking prices — asking is dropped when sold exists", () => {
  const range = { from: 2020, to: 2024 };
  const picked = selectCompListings([
    { year: 2022, askUsd: 220000, kind: "asking" },
    { year: 2021, askUsd: 210000, kind: "asking" },
    { year: 2023, askUsd: 230000, kind: "asking" },
    sold(2022, 140000),
    sold(2021, 135000),
  ]);
  assert.equal(picked.priceKind, "sold");
  assert.equal(picked.used.length, 2);
  assert.ok(picked.used.every((u) => u.kind === "sold"));
  assert.ok(picked.used.every((u) => u.askUsd < 200000));

  const comps = reducePublicComps(
    [
      { year: 2022, askUsd: 220000, kind: "asking" },
      { year: 2021, askUsd: 210000, kind: "asking" },
      { year: 2023, askUsd: 230000, kind: "asking" },
      sold(2022, 140000),
      sold(2021, 135000),
    ],
    range,
    undefined,
    { asOfYear: 2026 },
  );
  assert.ok(comps);
  assert.equal(comps.priceKind, "sold");
  assert.equal(comps.soldSampleSize, 2);
  assert.equal(comps.askingSampleSize, 3);
  assert.equal(comps.medianAsk, 137500);
  assert.ok(comps.medianAsk < 200000);
});

test("asking-only comps stay asking and are never labeled sold", () => {
  const comps = reducePublicComps(
    [
      { year: 2022, askUsd: 120000, kind: "asking" },
      { year: 2021, askUsd: 110000, kind: "asking" },
      { year: 2023, askUsd: 130000, kind: "asking" },
    ],
    { from: 2020, to: 2024 },
  );
  assert.ok(comps);
  assert.equal(comps.priceKind, "asking");
  assert.equal(comps.soldSampleSize, 0);
  assert.equal(comps.confidence, "low");
  assert.equal(prefersPublicComps(comps), false);
  assert.equal(comps.notes.includes(LOW_CONFIDENCE_LISTINGS_MESSAGE), true);
  assert.match(comps.notes, /not sold/i);
});

test("mileage bands: missing miles are neutral; published miles band", () => {
  assert.equal(mileageBand(null, 2022, 2026), "neutral");
  assert.equal(mileageBand(undefined, 2022, 2026), "neutral");
  // 2022 coach in 2026 → 4 × 10k = 40k expected
  assert.equal(mileageBand(18000, 2022, 2026), "low");
  assert.equal(mileageBand(40000, 2022, 2026), "mid");
  assert.equal(mileageBand(80000, 2022, 2026), "high");
});

test("mileage weights beat equal weight when odometer is present", () => {
  const range = { from: 2020, to: 2024 };
  const equal = reducePublicComps(
    [sold(2022, 100000), sold(2022, 200000)],
    range,
    undefined,
    { asOfYear: 2026 },
  );
  const weighted = reducePublicComps(
    [sold(2022, 100000, 90000), sold(2022, 200000, 12000)],
    range,
    undefined,
    { asOfYear: 2026 },
  );
  assert.ok(equal);
  assert.ok(weighted);
  assert.equal(equal.medianAsk, 150000);
  assert.equal(listingWeight(sold(2022, 100000), 2026), 1);
  assert.ok(listingWeight(sold(2022, 100000, 90000), 2026) < 1);
  assert.ok(listingWeight(sold(2022, 200000, 12000), 2026) > 1);
  assert.equal(weighted.medianAsk, 200000);
  assert.ok(weighted.medianAsk > equal.medianAsk);
});

test("weighted median equals unweighted when miles are missing", () => {
  assert.equal(
    weightedMedianUsd([
      { usd: 100, weight: 1 },
      { usd: 200, weight: 1 },
    ]),
    medianUsd([100, 200]),
  );
});

test("confidence tiers: High ≥5, Medium 2–4, Low <2 sold", () => {
  assert.equal(SOLD_COMPS_HIGH_SAMPLE, 5);
  assert.equal(PUBLIC_COMPS_MIN_SAMPLE, 2);
  assert.equal(soldCompsConfidence(0), "low");
  assert.equal(soldCompsConfidence(1), "low");
  assert.equal(soldCompsConfidence(2), "medium");
  assert.equal(soldCompsConfidence(4), "medium");
  assert.equal(soldCompsConfidence(5), "high");
  assert.equal(compsConfidenceLabel("high"), "High");
  assert.equal(compsConfidenceLabel("medium"), "Medium");
  assert.equal(compsConfidenceLabel("low"), "Low");

  const range = { from: 2020, to: 2024 };
  const low = reducePublicComps([sold(2022, 120000)], range);
  assert.ok(low);
  assert.equal(low.confidence, "low");
  assert.equal(prefersPublicComps(low), false);
  assert.match(low.notes, /Not enough public listings/);

  const medium = reducePublicComps(
    [sold(2021, 110000), sold(2022, 120000), sold(2023, 130000)],
    range,
  );
  assert.ok(medium);
  assert.equal(medium.confidence, "medium");
  assert.equal(prefersPublicComps(medium), true);
  assert.match(medium.notes, /Medium confidence — wider range/);
  assert.doesNotMatch(medium.notes, /JD Power|NADA|book value/i);

  const high = reducePublicComps(
    [
      sold(2020, 100000),
      sold(2021, 110000),
      sold(2022, 120000),
      sold(2023, 130000),
      sold(2024, 140000),
    ],
    range,
  );
  assert.ok(high);
  assert.equal(high.confidence, "high");
  assert.equal(prefersPublicComps(high), true);
  assert.match(high.notes, /public sold prices for the same coach/);
  assert.doesNotMatch(high.notes, /JD Power|NADA|book value/i);
  assert.doesNotMatch(low.notes, /JD Power|NADA|book value/i);
});

test("medium confidence uses a wider retail spread than high", () => {
  const high = ladderFromMedianAsk(120000, "high");
  const medium = ladderFromMedianAsk(120000, "medium");
  assert.ok(medium.retailHigh - medium.retailLow > high.retailHigh - high.retailLow);
  assert.ok(medium.retailLow < high.retailLow);
  assert.ok(medium.retailHigh > high.retailHigh);
});

test("reducePublicComps: sold median + ladder + sample size", () => {
  const range = { from: 2020, to: 2024 };
  const comps = reducePublicComps(
    [
      sold(2021, 100000),
      sold(2022, 120000),
      sold(2023, 140000),
      sold(2010, 40000),
    ],
    range,
  );
  assert.ok(comps);
  assert.equal(comps.sampleSize, 3);
  assert.equal(comps.soldSampleSize, 3);
  assert.equal(comps.medianAsk, 120000);
  assert.equal(comps.source, "public_listings");
  assert.equal(comps.confidence, "medium");
  const ladder = ladderFromMedianAsk(120000, "medium");
  assert.equal(comps.tradeIn, ladder.tradeIn);
  assert.equal(comps.retailLow, ladder.retailLow);
  assert.equal(comps.retailHigh, ladder.retailHigh);
  assert.ok(comps.tradeIn <= comps.retailLow);
  assert.ok(comps.retailLow < comps.retailHigh);
  assert.ok(prefersPublicComps(comps));
});

test("resolvePrimaryMarket prefers sold comps over live and catalog", () => {
  const catalog = estimateMarket(spec(), "2022", undefined, { asOfYear: 2026 });
  const comps = reducePublicComps(
    [sold(2021, 210000), sold(2022, 220000), sold(2023, 230000)],
    { from: 2020, to: 2024 },
  );
  const resolved = resolvePrimaryMarket({
    catalog,
    liveLadder: { tradeIn: 50000, retailLow: 60000, retailHigh: 70000 },
    comps,
  });
  assert.equal(resolved.source, "public_listings");
  assert.equal(resolved.sourceLabel, SOLD_COMPS_LABEL);
  assert.equal(resolved.confidence, "medium");
  assert.equal(resolved.retailHigh, comps!.retailHigh);
});

test("resolvePrimaryMarket falls back to catalog when sold comps are thin", () => {
  const catalog = estimateMarket(spec(), "2022", undefined, { asOfYear: 2026 });
  const thin = reducePublicComps([sold(2022, 220000)], { from: 2020, to: 2024 });
  const resolved = resolvePrimaryMarket({ catalog, comps: thin });
  assert.equal(resolved.source, "catalog");
  assert.equal(resolved.sourceLabel, CATALOG_ESTIMATE_LABEL);
  assert.equal(resolved.sourceLabel, "Catalog estimate");
  assert.equal(resolved.tradeIn, catalog.tradeIn);
});

test("asking-only does not win the primary market over catalog", () => {
  const catalog = estimateMarket(spec(), "2022", undefined, { asOfYear: 2026 });
  const asks = reducePublicComps(
    [
      { year: 2021, askUsd: 210000, kind: "asking" },
      { year: 2022, askUsd: 220000, kind: "asking" },
      { year: 2023, askUsd: 230000, kind: "asking" },
    ],
    { from: 2020, to: 2024 },
  );
  const resolved = resolvePrimaryMarket({ catalog, comps: asks });
  assert.equal(resolved.source, "catalog");
  assert.equal(resolved.sourceLabel, "Catalog estimate");
});

test("listing prompt demands sold lines and forbids inventing or paid books", () => {
  const p = buildListingCompsPrompt({
    year: 2022,
    make: "Winnebago",
    model: "Revel",
    yearRange: { from: 2020, to: 2024 },
  });
  assert.match(p.system, /SOLD:/);
  assert.match(p.system, /Do NOT invent sold prices/);
  assert.match(p.system, /Never invent miles/);
  assert.match(p.system, /MarketCheck/);
  assert.match(p.system, /NADA/);
  assert.match(p.system, /J\.D\. Power/);
  assert.match(p.system, /ASK:/);
});

test("research fetch path prefers sold and does not invent prices", () => {
  const text = src("researchPublicComps.ts");
  assert.match(text, /sold/i);
  assert.match(text, /extractListingAsks/);
  assert.match(text, /reducePublicComps/);
  assert.match(text, /never rewritten as sold prices/i);
  assert.match(text, /Never claims NADA \/ J\.D\. Power/);
});

test("Facts detail market UX: sold comps labels, confidence, low copy", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /SOLD_COMPS_LABEL/);
  assert.match(detail, /CATALOG_ESTIMATE_LABEL/);
  assert.match(detail, /LOW_CONFIDENCE_LISTINGS_MESSAGE/);
  assert.match(detail, /PUBLIC_SOLD_DISCLAIMER/);
  assert.match(detail, /compsConfidenceLabel/);
  assert.match(detail, /prefersPublicComps/);
  assert.doesNotMatch(detail, /Public listing asks/);
  const disclaimerHits = detail.match(/PUBLIC_SOLD_DISCLAIMER/g) ?? [];
  assert.equal(disclaimerHits.length, 2, "import + one footer");
  assert.match(
    detail,
    /PUBLIC_SOLD_DISCLAIMER[\s\S]{0,160}<SuiteDisclaimer/,
    "values footer sits once, above SuiteDisclaimer",
  );
});

test("sample notes never append the book-value disclaimer", () => {
  const compsSrc = src("publicListingComps.ts");
  const sampleNotes = compsSrc.slice(
    compsSrc.indexOf("function sampleNotes"),
    compsSrc.indexOf("export function reducePublicComps"),
  );
  assert.doesNotMatch(sampleNotes, /PUBLIC_SOLD_DISCLAIMER/);
  assert.doesNotMatch(sampleNotes, /JD Power|NADA|book value/);
});
