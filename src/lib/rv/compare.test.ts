import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RVSpec } from "./rvTypes.ts";
import type { RVResult } from "./catalog.ts";
import {
  CATALOG_ESTIMATE_LABEL,
  reducePublicComps,
  SOLD_COMPS_LABEL,
} from "./publicListingComps.ts";
import {
  buildCompareReport,
  capCompareItems,
  COMPARE_KEY_FACT_ROW_IDS,
  COMPARE_MARKET_ROW_IDS,
  compareDeskHideRetailHigh,
  compareDeskMarketValue,
  compareHonestSourceLabel,
  compareRowSection,
  compareSelectionKey,
  suggestComparePeers,
} from "./compare.ts";
import type { MarketEstimate } from "./marketEstimate.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function spec(partial: Partial<RVSpec> = {}): RVSpec {
  return {
    type: "Class A Diesel",
    floorplans: ["45A"],
    lengthRange: [44, 45],
    weightRange: [40000, 46000],
    slideouts: 4,
    sleeps: 6,
    msrpRange: [450000, 620000],
    engine: "Cummins L9",
    horsepower: 450,
    chassis: "Spartan",
    fuelType: "Diesel",
    recalls: 0,
    rating: 4.6,
    image: "",
    ...partial,
  };
}

function coach(
  year: string,
  make: string,
  model: string,
  floorplan: string,
  extra: Partial<RVSpec> = {},
): RVResult {
  return {
    year,
    make,
    model,
    floorplan,
    data: spec(extra),
  };
}

function sold(year: number, askUsd: number) {
  return { year, askUsd, kind: "sold" as const };
}

const catalogLow: MarketEstimate = {
  tradeIn: 180000,
  retailLow: 200000,
  retailHigh: 267000,
  msrpLo: 400000,
  msrpHi: 500000,
  segment: "Diesel Class A",
  ageYears: 5,
  source: "catalog",
  sourceLabel: CATALOG_ESTIMATE_LABEL,
  confidence: "low",
  hideRetailHigh: true,
  marketValue: 145000,
};

test("compareHonestSourceLabel: Catalog estimate — never a bare book title", () => {
  assert.equal(compareHonestSourceLabel(undefined), CATALOG_ESTIMATE_LABEL);
  assert.equal(compareHonestSourceLabel(""), CATALOG_ESTIMATE_LABEL);
  assert.equal(compareHonestSourceLabel("J.D. Power"), CATALOG_ESTIMATE_LABEL);
  assert.equal(compareHonestSourceLabel("JD Power"), CATALOG_ESTIMATE_LABEL);
  assert.equal(compareHonestSourceLabel("JD Power value"), CATALOG_ESTIMATE_LABEL);
  assert.equal(compareHonestSourceLabel("NADA"), CATALOG_ESTIMATE_LABEL);
  assert.equal(compareHonestSourceLabel(SOLD_COMPS_LABEL), SOLD_COMPS_LABEL);
  assert.equal(
    compareHonestSourceLabel(CATALOG_ESTIMATE_LABEL),
    CATALOG_ESTIMATE_LABEL,
  );
});

test("compareDeskHideRetailHigh: Low / missing comps hide High", () => {
  assert.equal(compareDeskHideRetailHigh(catalogLow), true);
  assert.equal(
    compareDeskHideRetailHigh({
      ...catalogLow,
      source: "public_listings",
      confidence: "medium",
      hideRetailHigh: false,
    }),
    false,
  );
  assert.equal(
    compareDeskHideRetailHigh({
      ...catalogLow,
      source: "public_listings",
      confidence: "low",
      hideRetailHigh: false,
    }),
    true,
  );
});

test("compareDeskMarketValue prefers marketValue and does not use fat High on Low", () => {
  assert.equal(compareDeskMarketValue(catalogLow), 145000);
  assert.equal(
    compareDeskMarketValue({
      ...catalogLow,
      marketValue: undefined,
    }),
    200000,
  );
});

test("capCompareItems: 3 columns max, no duplicate keys", () => {
  const a = coach("2021", "Thor Motor Coach", "Palazzo", "33.5");
  const b = coach("2022", "Newmar", "Dutch Star", "4081");
  const c = coach("2020", "Tiffin", "Phaeton", "36SH");
  const d = coach("2019", "Winnebago", "Forza", "38W");
  const capped = capCompareItems([a, a, b, c, d]);
  assert.equal(capped.length, 3);
  assert.equal(compareSelectionKey(capped[0]!), compareSelectionKey(a));
  assert.equal(compareSelectionKey(capped[2]!), compareSelectionKey(c));
});

test("compareRowSection: Market + lean key Facts", () => {
  for (const id of COMPARE_MARKET_ROW_IDS) {
    assert.equal(compareRowSection(id), "market");
  }
  for (const id of COMPARE_KEY_FACT_ROW_IDS) {
    assert.equal(compareRowSection(id), "facts");
  }
  assert.equal(compareRowSection("engine"), "more");
});

test("buildCompareReport: catalog path hides High and labels Catalog estimate", () => {
  const a = coach("2021", "Thor Motor Coach", "Palazzo", "33.5");
  const b = coach("2020", "Tiffin", "Phaeton", "36SH");
  const report = buildCompareReport([a, b]);
  assert.equal(report.columns.length, 2);
  assert.ok(report.columns.every((c) => c.hideRetailHigh));
  assert.ok(
    report.columns.every((c) => c.sourceLabel === CATALOG_ESTIMATE_LABEL),
  );
  const hi = report.rows.find((r) => r.id === "retailHi");
  assert.ok(hi);
  assert.ok(hi.cells.every((cell) => cell.value === "—" && cell.raw == null));
  const srcRow = report.rows.find((r) => r.id === "valueSource");
  assert.ok(srcRow);
  assert.ok(srcRow.cells.every((cell) => cell.value === CATALOG_ESTIMATE_LABEL));
  const market = report.rows.find((r) => r.id === "marketValue");
  assert.ok(market);
  assert.ok(market.cells.every((cell) => cell.value !== "—"));
  for (const id of [...COMPARE_MARKET_ROW_IDS, ...COMPARE_KEY_FACT_ROW_IDS]) {
    assert.ok(
      report.rows.some((r) => r.id === id),
      `missing key row ${id}`,
    );
  }
});

test("buildCompareReport: Med sold comps keep High and Sold comps label", () => {
  const a = coach("2022", "Newmar", "Dutch Star", "4081");
  const b = coach("2021", "Thor Motor Coach", "Palazzo", "33.5");
  const comps = reducePublicComps(
    [sold(2021, 290000), sold(2022, 301000), sold(2023, 310000)],
    { from: 2020, to: 2024 },
  );
  assert.ok(comps);
  const key = compareSelectionKey(a);
  const report = buildCompareReport([a, b], undefined, { [key]: comps });
  const dutch = report.columns[0]!;
  assert.equal(dutch.hideRetailHigh, false);
  assert.equal(dutch.sourceLabel, SOLD_COMPS_LABEL);
  const hi = report.rows.find((r) => r.id === "retailHi")!;
  assert.notEqual(hi.cells[0]!.value, "—");
  assert.ok((hi.cells[0]!.raw ?? 0) > 0);
  assert.equal(hi.cells[1]!.value, "—");
});

test("suggestComparePeers: extras first, never includes the anchor", () => {
  const anchor = coach("2021", "Thor Motor Coach", "Palazzo", "33.5");
  const peer = coach("2020", "Tiffin", "Phaeton", "36SH");
  const peers = suggestComparePeers(anchor, [anchor, peer]);
  assert.ok(peers.some((p) => compareSelectionKey(p) === compareSelectionKey(peer)));
  assert.ok(
    peers.every((p) => compareSelectionKey(p) !== compareSelectionKey(anchor)),
  );
});

test("Lot Desk compare UI: Market + key Facts + one-tap Facts entry", () => {
  const compareUi = readFileSync(
    join(root, "../../components/rvfax/RvCompare.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );

  assert.match(compareUi, /data-lot-desk-compare/);
  assert.match(compareUi, /data-compare-section=\{section\}/);
  assert.match(compareUi, /"Market"/);
  assert.match(compareUi, /"Key Facts"/);
  assert.match(compareUi, /hideRetailHigh/);
  assert.match(compareUi, /CATALOG_ESTIMATE_LABEL/);
  assert.doesNotMatch(compareUi, /title="J\.D\. Power"/);
  assert.doesNotMatch(compareUi, />JD Power</);

  assert.match(detail, /data-facts-compare/);
  assert.match(detail, /onStartCompare/);
  assert.match(detail, /Compare with another unit/);

  assert.match(fax, /startCompareFromFacts/);
  assert.match(fax, /suggestComparePeers/);
  assert.match(fax, /data-compare-peer-picker/);
  assert.match(fax, /onStartCompare=\{\(\) => startCompareFromFacts\(detail\)\}/);
  assert.match(fax, /capCompareItems\(comparePick\)/);
});

test("compare.ts uses resolvePrimaryMarket and hideRetailHighForDesk", () => {
  const text = src("compare.ts");
  assert.match(text, /resolvePrimaryMarket/);
  assert.match(text, /hideRetailHighForDesk/);
  assert.match(text, /CATALOG_ESTIMATE_LABEL/);
  assert.match(text, /compareHonestSourceLabel/);
  assert.doesNotMatch(text, /from\s+["'][^"']*marketcheck[^"']*["']/);
});
