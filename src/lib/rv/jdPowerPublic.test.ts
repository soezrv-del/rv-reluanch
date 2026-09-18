import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { RVSpec } from "./rvTypes.ts";
import { estimateMarket } from "./marketEstimate.ts";
import { CATALOG_ESTIMATE_LABEL } from "./marketEstimate.ts";
import {
  applyJdPowerDeskMarket,
  blendJdPowerPublicBands,
  discoverJdPowerValuesUrl,
  htmlToPlainText,
  isJdPowerBlendEligible,
  isJdPowerMarketSource,
  jdPowerFloorplanSlug,
  jdPowerSourceLabel,
  JD_POWER_BLEND_LABEL,
  JD_POWER_PUBLIC_LABEL,
  knownPalazzoJdPowerValuesUrl,
  PALAZZO_33_5_2021_VALUES_URL,
  PALAZZO_JD_POWER_TEST_UNIT,
  parseJdPowerPublicHtml,
  roundJdPublicUsd,
  type JdPowerPublicEstimate,
} from "./jdPowerPublic.ts";
import {
  prefersPublicComps,
  reducePublicComps,
  resolvePrimaryMarket,
} from "./publicListingComps.ts";
import { factsMarketAverageCaption } from "./factsMarketBands.ts";

const root = dirname(fileURLToPath(import.meta.url));

/** Captured shape of the free public 2021 Palazzo 33.5 values page. */
const PALAZZO_2021_33_5_FIXTURE = `
  <h1>2021 Thor Motor Coach Palazzo Series M-33.5 Freightliner Values</h1>
  <section>
    <h2>Pricing &amp; Values</h2>
    <p>Suggested List Price (MSRP) $250,425</p>
    <p>Low Retail Value $120,200</p>
    <p>Average Retail Value $144,800</p>
  </section>
`;

const palazzoJd: JdPowerPublicEstimate = {
  source: "jd_power_public",
  year: 2021,
  make: "Thor",
  model: "Palazzo",
  floorplan: "33.5",
  lowRetail: 120_200,
  averageRetail: 144_800,
  highRetail: null,
  sourceUrl: PALAZZO_33_5_2021_VALUES_URL,
  sourceLabel: JD_POWER_PUBLIC_LABEL,
};

function dieselSpec(): RVSpec {
  return {
    type: "Class A Diesel",
    fuelType: "Diesel",
    floorplans: ["33.5"],
    lengthRange: [33, 38],
    weightRange: [28000, 36000],
    slideouts: 3,
    sleeps: 6,
    msrpRange: [249000, 389000],
    recalls: 0,
    rating: 4.4,
    image: "",
  };
}

function sold(year: number, askUsd: number) {
  return { year, askUsd, kind: "sold" as const };
}

test("Palazzo-first gate: Thor Palazzo only — not GT, not Aria", () => {
  assert.equal(isJdPowerBlendEligible("Thor", "Palazzo"), true);
  assert.equal(isJdPowerBlendEligible("thor", "palazzo"), true);
  assert.equal(isJdPowerBlendEligible("Thor", "Palazzo GT"), false);
  assert.equal(isJdPowerBlendEligible("Thor", "Aria"), false);
  assert.equal(isJdPowerBlendEligible("Winnebago", "Palazzo"), false);
  assert.deepEqual(PALAZZO_JD_POWER_TEST_UNIT, {
    year: 2021,
    make: "Thor",
    model: "Palazzo",
    floorplan: "33.5",
  });
});

test("locked Catalog honesty labels — never a bare book title", () => {
  assert.equal(JD_POWER_PUBLIC_LABEL, "Public J.D. Power estimate");
  assert.equal(
    JD_POWER_BLEND_LABEL,
    "Avg of public J.D. Power estimate + asking comps",
  );
  assert.match(JD_POWER_BLEND_LABEL, /asking comps/);
  assert.doesNotMatch(JD_POWER_BLEND_LABEL, /sold comps/i);
  assert.notEqual(JD_POWER_PUBLIC_LABEL, "J.D. Power");
  assert.notEqual(JD_POWER_PUBLIC_LABEL, "JD Power value");
  assert.notEqual(JD_POWER_PUBLIC_LABEL, "NADA");
  assert.notEqual(JD_POWER_BLEND_LABEL, "J.D. Power");
  assert.equal(jdPowerSourceLabel("jd_power_blend"), JD_POWER_BLEND_LABEL);
  assert.equal(jdPowerSourceLabel("jd_power_public"), JD_POWER_PUBLIC_LABEL);
  assert.equal(jdPowerSourceLabel("catalog"), undefined);
});

test("parse fixture: 2021 Palazzo 33.5 Low 120200 / Avg 144800 — no invented High", () => {
  const parsed = parseJdPowerPublicHtml(PALAZZO_2021_33_5_FIXTURE);
  assert.ok(parsed);
  assert.equal(parsed.lowRetail, 120_200);
  assert.equal(parsed.averageRetail, 144_800);
  assert.equal(parsed.highRetail, null);
});

test("parse: High only when the public page prints it", () => {
  const parsed = parseJdPowerPublicHtml(`
    Low Retail Value $100,000
    Average Retail Value $120,000
    High Retail Value $140,000
  `);
  assert.ok(parsed);
  assert.equal(parsed.highRetail, 140_000);
});

test("parse GAP: missing labels never invent dollars", () => {
  assert.equal(parseJdPowerPublicHtml(""), null);
  assert.equal(parseJdPowerPublicHtml("<p>No values here</p>"), null);
  assert.equal(
    parseJdPowerPublicHtml("Average Retail Value $144,800"),
    null,
    "Low missing → GAP",
  );
  assert.equal(
    parseJdPowerPublicHtml("Low Retail Value $120,200"),
    null,
    "Average missing → GAP",
  );
  assert.equal(parseJdPowerPublicHtml("Typically around $155,000"), null);
});

test("discover values URL from a year listing page", () => {
  const html = `
    <a href="/rvs/2021/thor-motor-coach/m-33-5-freightliner/6606180">M-33.5</a>
    <a href="/rvs/2021/thor-motor-coach/m-37-5-freightliner/6606183/values">M-37.5</a>
  `;
  assert.equal(
    discoverJdPowerValuesUrl(html, 2021, "33.5"),
    PALAZZO_33_5_2021_VALUES_URL,
  );
  assert.match(
    discoverJdPowerValuesUrl(html, 2021, "37.5") || "",
    /m-37-5-freightliner\/6606183\/values/,
  );
  assert.equal(discoverJdPowerValuesUrl(html, 2021, "33.6"), null);
  assert.equal(jdPowerFloorplanSlug("33.5"), "m-33-5");
  assert.equal(knownPalazzoJdPowerValuesUrl(2021, "33.5"), PALAZZO_33_5_2021_VALUES_URL);
  assert.equal(knownPalazzoJdPowerValuesUrl(2022, "33.5"), null);
});

test("blend: Average = mean(JD mid, sold median); Low/High from available bands", () => {
  const bands = blendJdPowerPublicBands({
    jdLow: 120_200,
    jdAverage: 144_800,
    jdHigh: null,
    soldMedian: 208_000,
    compsRetailLow: 166_000,
    compsRetailHigh: 233_000,
    compsTradeIn: 150_000,
  });
  assert.equal(bands.blendedSold, true);
  assert.equal(bands.marketValue, roundJdPublicUsd((144_800 + 208_000) / 2));
  assert.equal(bands.marketValue, 176_000);
  assert.equal(bands.retailLow, roundJdPublicUsd((120_200 + 166_000) / 2));
  assert.equal(bands.retailLow, 143_000);
  // No JD high → do not invent one; use sold high, then caller may pin.
  assert.equal(bands.retailHigh, 233_000);
  assert.ok(bands.tradeIn <= bands.retailLow);
});

test("blend JD-only: no sold → public JD Low/Average, no invented High", () => {
  const bands = blendJdPowerPublicBands({
    jdLow: 120_200,
    jdAverage: 144_800,
    jdHigh: null,
  });
  assert.equal(bands.blendedSold, false);
  assert.equal(bands.marketValue, 145_000);
  assert.equal(bands.retailLow, 120_000);
  assert.equal(bands.retailHigh, 145_000);
});

test("thin JD × sold: hide High, blend Average, do not haircut JD by 0.66", () => {
  const catalog = estimateMarket(dieselSpec(), "2021", "33.5", {
    asOfYear: 2026,
    make: "Thor",
    model: "Palazzo",
  });
  const thin = reducePublicComps(
    [sold(2021, 208_000)],
    { from: 2019, to: 2023 },
  );
  assert.ok(thin);
  assert.equal(thin.confidence, "low");
  assert.equal(prefersPublicComps(thin), false);

  const desk = applyJdPowerDeskMarket({
    catalog,
    jd: palazzoJd,
    comps: thin,
    prefersSoldRange: false,
  });
  assert.equal(desk.source, "jd_power_blend");
  assert.equal(desk.sourceLabel, JD_POWER_BLEND_LABEL);
  assert.equal(desk.confidence, "low");
  assert.equal(desk.hideRetailHigh, true);
  assert.equal(desk.soldSampleSize, 1);
  assert.equal(desk.marketValue, 176_000);
  assert.equal(desk.retailHigh, 176_000);
  assert.ok(
    (desk.marketValue ?? 0) > 145_000,
    "must not apply catalog 0.66 haircut on real JD",
  );
  assert.ok(isJdPowerMarketSource(desk.source));
});

test("resolvePrimaryMarket: JD + Med sold blends; JD GAP keeps sold / catalog", () => {
  const catalog = estimateMarket(dieselSpec(), "2021", "33.5", {
    asOfYear: 2026,
    make: "Thor",
    model: "Palazzo",
  });
  const med = reducePublicComps(
    [sold(2020, 140_000), sold(2021, 145_000), sold(2022, 150_000)],
    { from: 2019, to: 2023 },
  );
  assert.ok(med);
  assert.equal(prefersPublicComps(med), true);

  const blended = resolvePrimaryMarket({
    catalog,
    comps: med,
    jdPower: palazzoJd,
  });
  assert.equal(blended.source, "jd_power_blend");
  assert.equal(blended.sourceLabel, JD_POWER_BLEND_LABEL);
  assert.equal(blended.confidence, "medium");
  assert.equal(blended.hideRetailHigh, false);
  assert.equal(
    blended.marketValue,
    roundJdPublicUsd((144_800 + med.medianAsk) / 2),
  );
  assert.equal(blended.soldSampleSize, 3);

  const noJd = resolvePrimaryMarket({ catalog, comps: med });
  assert.equal(noJd.source, "public_listings");
  assert.equal(noJd.sourceLabel, "Sold comps");
  assert.equal(noJd.marketValue, med.medianAsk);
  assert.equal(noJd.hideRetailHigh, false);
});

test("Average caption: blend source wins over leftover Catalog estimate; GAP stays Catalog", () => {
  const catalog = estimateMarket(dieselSpec(), "2021", "33.5", {
    asOfYear: 2026,
    make: "Thor",
    model: "Palazzo",
  });
  const med = reducePublicComps(
    [sold(2020, 140_000), sold(2021, 145_000), sold(2022, 150_000)],
    { from: 2019, to: 2023 },
  );
  assert.ok(med);
  const blended = resolvePrimaryMarket({
    catalog,
    comps: med,
    jdPower: palazzoJd,
  });
  assert.equal(blended.source, "jd_power_blend");
  assert.equal(
    factsMarketAverageCaption({
      confidence: blended.confidence,
      source: blended.source,
      sourceLabel: CATALOG_ESTIMATE_LABEL,
      thin: false,
    }),
    JD_POWER_BLEND_LABEL,
  );

  const gap = resolvePrimaryMarket({ catalog, comps: med });
  assert.equal(gap.source, "public_listings");
  assert.equal(
    factsMarketAverageCaption({
      confidence: gap.confidence,
      source: gap.source,
      sourceLabel: gap.sourceLabel,
    }),
    undefined,
  );

  const thinGap = resolvePrimaryMarket({ catalog });
  assert.equal(thinGap.source, "catalog");
  assert.equal(
    factsMarketAverageCaption({
      confidence: thinGap.confidence ?? "low",
      source: thinGap.source,
      sourceLabel: thinGap.sourceLabel,
      thin: true,
    }),
    CATALOG_ESTIMATE_LABEL,
  );
});

test("resolvePrimaryMarket: JD GAP + thin Palazzo still Catalog estimate 145k", () => {
  const fatCatalog = estimateMarket(dieselSpec(), "2021", "33.5", {
    asOfYear: 2026,
    make: "Thor",
    model: "Palazzo",
  });
  const thin = reducePublicComps(
    [sold(2021, 208_000)],
    { from: 2019, to: 2023 },
  );
  const resolved = resolvePrimaryMarket({ catalog: fatCatalog, comps: thin });
  assert.equal(resolved.source, "catalog");
  assert.equal(resolved.sourceLabel, CATALOG_ESTIMATE_LABEL);
  assert.equal(resolved.hideRetailHigh, true);
  assert.equal(resolved.confidence, "low");
  assert.equal(resolved.marketValue, 145_000);
  assert.equal(isJdPowerMarketSource(resolved.source), false);
});

test("resolvePrimaryMarket: JD-only Palazzo uses public estimate, not Catalog", () => {
  const catalog = estimateMarket(dieselSpec(), "2021", "33.5", {
    asOfYear: 2026,
    make: "Thor",
    model: "Palazzo",
  });
  const resolved = resolvePrimaryMarket({
    catalog,
    jdPower: palazzoJd,
  });
  assert.equal(resolved.source, "jd_power_public");
  assert.equal(resolved.sourceLabel, JD_POWER_PUBLIC_LABEL);
  assert.equal(resolved.confidence, "low");
  assert.equal(resolved.hideRetailHigh, true);
  assert.equal(resolved.marketValue, 145_000);
  assert.equal(resolved.retailLow, 120_000);
});

test("ineligible make/model ignores a leaked JD payload — never invent for Aria", () => {
  const catalog = estimateMarket(dieselSpec(), "2021", "3401", {
    asOfYear: 2026,
    make: "Thor",
    model: "Aria",
  });
  const leaked: JdPowerPublicEstimate = {
    ...palazzoJd,
    make: "Thor",
    model: "Aria",
  };
  const resolved = resolvePrimaryMarket({ catalog, jdPower: leaked });
  assert.equal(resolved.sourceLabel, CATALOG_ESTIMATE_LABEL);
  assert.equal(isJdPowerMarketSource(resolved.source), false);
});

test("module never imports MarketCheck and never ships invented snapshot dollars", () => {
  const src = readFileSync(join(root, "jdPowerPublic.ts"), "utf8");
  assert.doesNotMatch(src, /from\s+["'][^"']*marketcheck[^"']*["']/);
  assert.doesNotMatch(src, /setInterval|node-cron|node_cron/);
  assert.match(src, /never invent/i);
  assert.match(src, /On-demand/);
  assert.match(src, /No cron, no nightly batch/);
  assert.match(htmlToPlainText("<b>Low Retail Value</b> $120,200"), /Low Retail Value \$120,200/);
});
