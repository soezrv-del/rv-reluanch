import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { PDFDocument } from "pdf-lib";
import type { RVSpec } from "./rvTypes.ts";
import type { LotUnit } from "../lot/ownLotPage.ts";
import { buildShareReportPdf } from "./shareReportPdf.ts";
import { defaultParseSearch, defaultStringifySearch } from "@tanstack/router-core";
import {
  buildFactsShareReport,
  buildUnitShareReport,
  factsReportPath,
  factsReportSearch,
  findLotUnit,
  isOmittedReportValue,
  plainQueryText,
  REPORT_MARK_URL,
  reportYear,
  unitReportPath,
} from "./shareReport.ts";

const NOW = new Date("2026-09-27T15:00:00Z");

function sampleSpec(): RVSpec {
  return {
    type: "Class A Diesel",
    floorplans: ["ZZ9"],
    lengthRange: [40, 45],
    weightRange: [22000, 26000],
    slideouts: 3,
    sleeps: 6,
    msrpRange: [400000, 500000],
    engine: "Cummins X15",
    horsepower: 605,
    torqueLbFt: 1950,
    chassis: "Spartan",
    fuelType: "Diesel",
    recalls: 0,
    rating: 4.5,
    image: "",
    freshWater: 90,
    grayWater: 60,
    blackWater: 40,
  };
}

function blankSpec(): RVSpec {
  return {
    type: "Travel Trailer",
    floorplans: [],
    lengthRange: [0, 0],
    weightRange: [0, 0],
    slideouts: 0,
    sleeps: 0,
    msrpRange: [0, 0],
    fuelType: "",
    recalls: 0,
    rating: 0,
    image: "",
  };
}

function lotUnit(overrides: Partial<LotUnit> = {}): LotUnit {
  return {
    year: "2027",
    make: "Thor Motor Coach",
    model: "Gemini AWD",
    trim: "22MT",
    body_type: "Class C",
    location: "Bend",
    stock_number: "47516",
    vin: "1FDRU8PG5TKA51981",
    source: "own",
    dealer: "RV Country",
    price: 132995,
    title: "2027 Thor Motor Coach Gemini AWD",
    condition: "New",
    url: "https://dealer.example/vdp.html",
    lot_status: "available",
    photo:
      "https://storage.googleapis.com/stealth_inventory_public_images/inventory_images/b4b7509aa3b6ebb001599cfb634f233c/2.jpg",
    mileage: "",
    gvwr: 11000,
    dry_weight: null,
    hitch_weight: null,
    payload: null,
    length_ft: 23,
    height_ft: null,
    width_ft: null,
    sleeps: 4,
    slides: 1,
    fresh_gal: null,
    gray_gal: null,
    black_gal: null,
    propane_lbs: null,
    propane_gal: null,
    engine: "3.5L EcoBoost",
    chassis: "Ford Transit",
    fuel_type: "Gas",
    printed: {
      gvwr: "11,000 lb",
      vehicle_body_length: "23 ft",
      sleeps: "4",
      slides: "1",
      engine: "3.5L EcoBoost",
      chassis: "Ford Transit",
      fuel_type: "Gas",
      horsepower: "310 hp",
      scraped_at: "2026-01-01",
      id: "internal-9",
      lot_code: "BEND-A",
      paint_swatch_filename: "white.png",
      detail_fetched: "yes",
      image_count: "12",
      received_date: "2026-02-01",
    },
    ...overrides,
  };
}

function allValues(report: { headlines: { value: string }[]; sections: { rows: { label: string; value: string }[] }[] }) {
  return [
    ...report.headlines.map((row) => `${row.value}`),
    ...report.sections.flatMap((section) =>
      section.rows.map((row) => `${row.label}: ${row.value}`),
    ),
  ].join("\n");
}

test("omits blanks, GAP, and confirm-brochure stand-ins", () => {
  assert.equal(isOmittedReportValue(""), true);
  assert.equal(isOmittedReportValue("  "), true);
  assert.equal(isOmittedReportValue("—"), true);
  assert.equal(isOmittedReportValue("GAP"), true);
  assert.equal(isOmittedReportValue("N/A"), true);
  assert.equal(isOmittedReportValue("Confirm brochure"), true);
  assert.equal(isOmittedReportValue("Confirm door sticker"), true);
  assert.equal(
    isOmittedReportValue("22,000 lbs · smallest in series · confirm sticker"),
    false,
  );
});

test("facts report keeps real brochure values and drops missing ones", () => {
  const report = buildFactsShareReport({
    year: "2031",
    make: "Test Coach",
    series: "Sample",
    floorplan: "ZZ9",
    spec: sampleSpec(),
    now: NOW,
  });
  assert.equal(report.kind, "facts");
  assert.equal(report.title, "2031 Test Coach Sample ZZ9");
  assert.match(report.generatedLabel, /September 27, 2026/);
  assert.equal(report.photoUrl, null);
  const text = allValues(report);
  assert.match(text, /smallest in series · confirm sticker/);
  assert.match(text, /Cummins X15|605/);
  assert.doesNotMatch(text, /Confirm brochure/);
  assert.doesNotMatch(text, /^Propane:/m);
  assert.doesNotMatch(text, /Highway MPG/);
  assert.equal(report.path, factsReportPath({
    year: "2031",
    make: "Test Coach",
    series: "Sample",
    floorplan: "ZZ9",
  }));
  assert.match(report.shareText, /RvFAX vehicle report/);
  assert.ok(report.headlines.length >= 1 && report.headlines.length <= 4);
  assert.equal(report.footerNote.includes("unit sticker"), true);
});

test("facts report with no pins omits guessed blanks", () => {
  const report = buildFactsShareReport({
    year: "2031",
    make: "Test Coach",
    series: "Empty",
    spec: blankSpec(),
    now: NOW,
  });
  const text = allValues(report);
  assert.doesNotMatch(text, /Confirm brochure/);
  assert.doesNotMatch(text, /GAP/);
  assert.doesNotMatch(text, /Power to weight/);
  assert.equal(report.sources, null);
  for (const section of report.sections) {
    for (const row of section.rows) {
      assert.notEqual(row.value.trim(), "");
    }
  }
});

test("lot unit report uses card facts and drops back-office fields", () => {
  const unit = lotUnit();
  const report = buildUnitShareReport(unit, NOW);
  assert.equal(report.kind, "unit");
  assert.equal(report.title, "2027 Thor Motor Coach Gemini AWD 22MT");
  assert.match(report.photoUrl || "", /2\.jpg$/);
  const labels = report.headlines.map((row) => row.label);
  assert.ok(labels.includes("Price"));
  assert.ok(labels.includes("Stock number"));
  assert.match(allValues(report), /\$132,995|132,995/);
  assert.match(allValues(report), /47516/);
  assert.match(allValues(report), /11,000 lb/);
  assert.match(allValues(report), /1FDRU8PG5TKA51981/);
  const blob = JSON.stringify(report).toLowerCase();
  assert.equal(blob.includes("scraped"), false);
  assert.equal(blob.includes("lot_code") || blob.includes("lot code"), false);
  assert.equal(blob.includes("paint_swatch") || blob.includes("paint swatch"), false);
  assert.equal(blob.includes("detail fetched") || blob.includes("detail_fetched"), false);
  assert.equal(blob.includes("image count") || blob.includes("image_count"), false);
  assert.equal(blob.includes("received date") || blob.includes("received_date"), false);
  assert.equal(report.path, unitReportPath("47516"));
  assert.equal(report.sources, null);
});

test("lot unit with missing price and gvwr omits those lines", () => {
  const report = buildUnitShareReport(
    lotUnit({
      price: null,
      gvwr: null,
      photo: "",
      printed: {
        sleeps: "2",
        scraped_at: "yesterday",
        id: "x",
      },
      engine: "",
      chassis: "",
      fuel_type: "",
      length_ft: null,
      sleeps: null,
      slides: null,
    }),
    NOW,
  );
  const labels = [
    ...report.headlines.map((row) => row.label),
    ...report.sections.flatMap((section) => section.rows.map((row) => row.label)),
  ];
  assert.equal(labels.includes("Price"), false);
  assert.equal(labels.includes("GVWR"), false);
  assert.equal(report.photoUrl, null);
  assert.ok(labels.includes("Sleeps"));
  assert.equal(JSON.stringify(report).toLowerCase().includes("scraped"), false);
  assert.equal(findLotUnit([lotUnit()], "47516")?.stock_number, "47516");
  assert.equal(findLotUnit([lotUnit()], "1FDRU8PG5TKA51981")?.vin, "1FDRU8PG5TKA51981");
  assert.equal(findLotUnit([lotUnit()], "missing"), null);
});

test("facts year is a number so share URLs and titles are not JSON-quoted", () => {
  assert.equal(plainQueryText('"2026"'), "2026");
  assert.equal(plainQueryText('"\\"2026\\""'), "2026");
  assert.equal(reportYear('"2026"'), 2026);
  assert.equal(reportYear(2026), 2026);

  const legacy = defaultParseSearch(
    "?year=%222026%22&make=Entegra%20Coach&series=Cornerstone&floorplan=45B",
  );
  const search = factsReportSearch(legacy);
  assert.equal(search.year, 2026);
  const rewritten = defaultStringifySearch(search);
  assert.match(rewritten, /(?:^|\?|&)year=2026(?:&|$)/);
  assert.doesNotMatch(rewritten, /year=%22/);
  assert.doesNotMatch(rewritten, /year="/);

  const report = buildFactsShareReport({
    year: '"2026"',
    make: "Entegra Coach",
    series: "Cornerstone",
    floorplan: "45B",
    spec: sampleSpec(),
    now: NOW,
  });
  assert.equal(report.title.startsWith("2026 "), true);
  assert.doesNotMatch(report.title, /"/);
  assert.equal(report.path, factsReportPath({
    year: 2026,
    make: "Entegra Coach",
    series: "Cornerstone",
    floorplan: "45B",
  }));
  assert.match(report.path, /year=2026/);
  assert.doesNotMatch(report.path, /%22/);
  assert.equal(report.shareTitle, report.title);
});

test("share report surfaces use the chrome RvFAX mark", () => {
  assert.equal(REPORT_MARK_URL, "/assets/brand/rvfax-mark.png");
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "../../..");
  const files = [
    join(here, "shareReportPdf.ts"),
    join(here, "reportOgImage.ts"),
    join(root, "src/components/report/ShareReportPage.tsx"),
  ];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.match(src, /REPORT_MARK_URL/);
    assert.doesNotMatch(src, /icon-rvfax\.png/);
  }
});

test("a long share report still prints as one PDF page", async () => {
  const rows = Array.from({ length: 36 }, (_, index) => ({
    label: `Spec ${index + 1}`,
    value: `Value ${index + 1}`,
  }));
  const bytes = await buildShareReportPdf({
    kind: "unit",
    title: "2027 Long Coach Example 40Z",
    eyebrow: "Vehicle report",
    generatedLabel: "September 27, 2026",
    photoUrl: null,
    headlines: [
      { label: "Price", value: "$100,000" },
      { label: "Stock number", value: "1" },
    ],
    sections: [{ title: "Details", rows }],
    sources: null,
    path: "/report/unit/1",
    shareTitle: "2027 Long Coach Example 40Z",
    shareText: "2027 Long Coach Example 40Z — RvFAX vehicle report",
    footerNote: "Specs should be confirmed on the unit sticker.",
    siteLabel: "rvmax.app",
    siteUrl: "https://rvmax.app",
  });
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
});
