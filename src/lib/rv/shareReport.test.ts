import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { inflateSync } from "node:zlib";
import { createRequire } from "node:module";
import { PDFArray, PDFDocument, PDFRawStream, PDFStream, decodePDFRawStream } from "pdf-lib";
import { initWasm, Resvg } from "@resvg/resvg-wasm";
import type { RVSpec } from "./rvTypes.ts";
import type { LotUnit } from "../lot/ownLotPage.ts";
import { parseLotSnapshotJson } from "../lot/ownLotPage.ts";
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
  splitHeadlineNote,
  formatReportDate,
  REPORT_ICON_URL,
  REPORT_MARK_URL,
  REPORT_TOUCH_ICON_URL,
  reportShareIconLinks,
  reportYear,
  unitReportPath,
} from "./shareReport.ts";
import {
  layoutShareTitle,
  shareTitleMaxWidth,
  ttfTextWidth,
} from "./reportOgLayout.ts";

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
    join(root, "src/components/report/ShareReportPage.tsx"),
  ];
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    assert.match(src, /REPORT_MARK_URL/);
    assert.doesNotMatch(src, /icon-rvfax\.png/);
  }
  const og = readFileSync(join(here, "reportOgImage.ts"), "utf8");
  assert.match(og, /rvfax-mark-og\.png\?inline/);
  assert.doesNotMatch(og, /REPORT_MARK_URL/);
  assert.doesNotMatch(og, /icon-rvfax\.png/);
  const lookup = readFileSync(join(here, "reportRequestMeta.ts"), "utf8");
  assert.match(lookup, /own-lot-latest\.json/);
  assert.doesNotMatch(lookup, /fetch\(new URL\(LOT_SNAPSHOT_URL/);
  assert.equal(REPORT_ICON_URL, "/assets/brand/rvfax-mark-32.png");
  assert.equal(REPORT_TOUCH_ICON_URL, "/assets/brand/rvfax-mark-180.png");
  const links = reportShareIconLinks();
  assert.equal(links[0]?.rel, "icon");
  assert.equal(links[0]?.sizes, "32x32");
  assert.equal(links[1]?.rel, "apple-touch-icon");
  assert.equal(links[1]?.sizes, "180x180");
  for (const file of [
    join(root, "src/routes/report/facts.tsx"),
    join(root, "src/routes/report/unit/$id.tsx"),
  ]) {
    assert.match(readFileSync(file, "utf8"), /reportShareIconLinks\(\)/);
  }
});

test("report date is the Pacific day, not the next UTC day", () => {
  assert.equal(formatReportDate(new Date("2026-09-28T02:30:00Z")), "September 27, 2026");
  assert.equal(formatReportDate(new Date("2026-09-28T07:30:00Z")), "September 28, 2026");
});

test("headline notes split off the figure", () => {
  assert.deepEqual(splitHeadlineNote("50,000 lbs · smallest in series · confirm sticker"), {
    value: "50,000 lbs",
    note: "smallest in series · confirm sticker",
  });
  assert.deepEqual(splitHeadlineNote("12,000 lbs · confirm sticker"), {
    value: "12,000 lbs",
    note: "confirm sticker",
  });
  assert.deepEqual(splitHeadlineNote("46' 7\""), { value: "46' 7\"", note: null });
  assert.deepEqual(splitHeadlineNote("$132,995"), { value: "$132,995", note: null });
});

test("facts pdf keeps the headline note and the full source line", async () => {
  const sources =
    "OEM MY19–26 Cornerstone / Reserve: X15 605 / 1,950 · Spartan K3 · hitch 20k. SL is an option. · Tire / AC / generator are class-typical when no brochure pin — confirm door sticker.";
  const bytes = await buildShareReportPdf({
    kind: "facts",
    title: "2026 Entegra Coach Cornerstone 45B",
    eyebrow: "Vehicle report",
    generatedLabel: "September 28, 2026",
    photoUrl: null,
    headlines: [
      { label: "GVWR", value: "50,000 lbs · smallest in series · confirm sticker" },
      { label: "Length", value: "46' 7\"" },
      { label: "Horsepower", value: "605 HP" },
      { label: "Engine", value: "Cummins X15 605HP" },
    ],
    sections: [
      {
        title: "Weights and Capacities",
        rows: [{ label: "GVWR", value: "50,000 lbs · smallest in series · confirm sticker" }],
      },
    ],
    sources,
    path: "/report/facts?make=Entegra+Coach&series=Cornerstone&year=2026",
    shareTitle: "2026 Entegra Coach Cornerstone 45B",
    shareText: "2026 Entegra Coach Cornerstone 45B — RvFAX vehicle report",
    footerNote: "Specs should be confirmed on the unit sticker.",
    siteLabel: "rvmax.app",
    siteUrl: "https://rvmax.app",
  });
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
  const text = pdfLiterals(doc);
  assert.ok(text.includes("50,000 lbs"));
  assert.ok(text.includes("smallest in series · confirm sticker"));
  assert.equal(/smallest in s…|smallest in s\.\.\./.test(text), false);
  assert.ok(text.includes("confirm door"));
  assert.ok(text.includes("sticker."));
  assert.equal(text.includes("…"), false);
});

test("unit share title stays clear of the photo", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "../../..");
  const semibold = readFileSync(join(root, "public/fonts/Geist-SemiBold.ttf"));
  const regular = readFileSync(join(root, "public/fonts/Geist-Regular.ttf"));
  const title = "2027 Thor Motor Coach Gemini AWD 22MT";
  const max = shareTitleMaxWidth(true);
  assert.equal(max, 748 - 56 - 24);
  const measure = (text: string, size: number) => ttfTextWidth(semibold, text, size);
  assert.ok(measure(title, 40) > max);
  const laid = layoutShareTitle(title, max, measure);
  assert.equal(laid.lines.join(" "), title);
  for (const line of laid.lines) {
    assert.ok(measure(line, laid.size) <= max + 0.01, line);
    assert.equal(line.includes("…"), false);
  }
  const facts = layoutShareTitle("2026 Entegra Coach Cornerstone 45B", shareTitleMaxWidth(false), measure);
  assert.deepEqual(facts, { lines: ["2026 Entegra Coach Cornerstone 45B"], size: 46 });

  const require = createRequire(import.meta.url);
  await initWasm(readFileSync(require.resolve("@resvg/resvg-wasm/index_bg.wasm")));
  for (const line of laid.lines) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="80" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="60" fill="#142033" font-family="Geist" font-size="${laid.size}" font-weight="600">${line}</text>
</svg>`;
    const png = new Resvg(svg, {
      font: { fontBuffers: [regular, semibold], defaultFontFamily: "Geist" },
    }).render().asPng();
    const ink = pngInkRight(png);
    assert.ok(ink <= max + 1, `${line} ink ${ink}px exceeds ${max}`);
  }
});

function pdfPlacedText(doc: PDFDocument, pageIndex: number): Array<{ text: string; y: number }> {
  const page = doc.getPages()[pageIndex];
  if (!page) return [];
  const contents = page.node.Contents();
  const streams: PDFStream[] = [];
  if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i += 1) {
      const obj = doc.context.lookup(contents.get(i));
      if (obj instanceof PDFStream) streams.push(obj);
    }
  } else if (contents instanceof PDFStream) {
    streams.push(contents);
  }
  const raw = streams
    .map((stream) => {
      const decoded =
        stream instanceof PDFRawStream ? decodePDFRawStream(stream).decode() : stream.getContents();
      return Buffer.from(decoded).toString("latin1");
    })
    .join("\n");
  const placed: Array<{ text: string; y: number }> = [];
  for (const chunk of raw.split("BT")) {
    const end = chunk.indexOf("ET");
    const body = end >= 0 ? chunk.slice(0, end) : chunk;
    const td = [...body.matchAll(/([0-9.+\-]+)\s+([0-9.+\-]+)\s+Td/g)].at(-1);
    const tm = [
      ...body.matchAll(
        /([0-9.+\-]+)\s+([0-9.+\-]+)\s+([0-9.+\-]+)\s+([0-9.+\-]+)\s+([0-9.+\-]+)\s+([0-9.+\-]+)\s+Tm/g,
      ),
    ].at(-1);
    const y = td ? Number(td[2]) : tm ? Number(tm[6]) : null;
    if (y == null || Number.isNaN(y)) continue;
    const text = decodePdfHex(body);
    if (!text.trim()) continue;
    placed.push({ text: text.replace(/\n/g, ""), y });
  }
  return placed;
}

function pdfLiterals(doc: PDFDocument): string {
  const page = doc.getPages()[0];
  if (!page) return "";
  const contents = page.node.Contents();
  const streams: PDFStream[] = [];
  if (contents instanceof PDFArray) {
    for (let i = 0; i < contents.size(); i += 1) {
      const obj = doc.context.lookup(contents.get(i));
      if (obj instanceof PDFStream) streams.push(obj);
    }
  } else if (contents instanceof PDFStream) {
    streams.push(contents);
  }
  const raw = streams
    .map((stream) => {
      const decoded =
        stream instanceof PDFRawStream ? decodePDFRawStream(stream).decode() : stream.getContents();
      return Buffer.from(decoded).toString("latin1");
    })
    .join("\n");
  return decodePdfHex(raw);
}

/** pdf-lib writes WinAnsi text as hex strings. */
function decodePdfHex(src: string): string {
  const parts: string[] = [];
  for (const match of src.matchAll(/<([0-9A-Fa-f\s]+)>/g)) {
    const digits = match[1]?.replace(/\s+/g, "") ?? "";
    let text = "";
    for (let i = 0; i + 1 < digits.length; i += 2) {
      text += String.fromCharCode(parseInt(digits.slice(i, i + 2), 16));
    }
    parts.push(text);
  }
  return parts.join("\n");
}

function pngInkRight(png: Uint8Array): number {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  let offset = 8;
  let width = 0;
  let height = 0;
  const idat: Uint8Array[] = [];
  while (offset + 8 < png.byteLength) {
    const length = view.getUint32(offset);
    const type = Buffer.from(png.subarray(offset + 4, offset + 8)).toString("ascii");
    if (type === "IHDR") {
      width = view.getUint32(offset + 8);
      height = view.getUint32(offset + 12);
    } else if (type === "IDAT") {
      idat.push(png.subarray(offset + 8, offset + 8 + length));
    } else if (type === "IEND") break;
    offset += 12 + length;
  }
  const inflated = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = width * bpp;
  const rows = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y += 1) {
    const filter = inflated[y * (stride + 1)] ?? 0;
    const src = y * (stride + 1) + 1;
    const dest = y * stride;
    for (let i = 0; i < stride; i += 1) {
      const raw = inflated[src + i] ?? 0;
      const left = i >= bpp ? rows[dest + i - bpp]! : 0;
      const up = y > 0 ? rows[dest - stride + i]! : 0;
      const upLeft = y > 0 && i >= bpp ? rows[dest - stride + i - bpp]! : 0;
      let value = raw;
      if (filter === 1) value = raw + left;
      else if (filter === 2) value = raw + up;
      else if (filter === 3) value = raw + Math.floor((left + up) / 2);
      else if (filter === 4) value = raw + paeth(left, up, upLeft);
      rows[dest + i] = value & 0xff;
    }
  }
  let right = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = width - 1; x >= right; x -= 1) {
      if ((rows[y * stride + x * bpp + 3] ?? 0) > 10) {
        right = x + 1;
        break;
      }
    }
  }
  return right;
}

function paeth(left: number, up: number, upLeft: number): number {
  const estimate = left + up - upLeft;
  const dl = Math.abs(estimate - left);
  const du = Math.abs(estimate - up);
  const dul = Math.abs(estimate - upLeft);
  if (dl <= du && dl <= dul) return left;
  if (du <= dul) return up;
  return upLeft;
}

test("PDF rows stay above the footer url on every page", async () => {
  const rows = Array.from({ length: 80 }, (_, index) => ({
    label: index === 79 ? "Sofa Material" : `Spec ${index + 1}`,
    value: index === 79 ? "Vinyl" : `Value ${index + 1}`,
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
  assert.ok(doc.getPageCount() >= 2);
  for (let pageIndex = 0; pageIndex < doc.getPageCount(); pageIndex += 1) {
    const placed = pdfPlacedText(doc, pageIndex);
    const url = placed.find((item) => item.text.includes("rvmax.app"));
    assert.ok(url, `page ${pageIndex} missing footer url`);
    const body = placed.filter(
      (item) => !item.text.includes("rvmax.app") && !item.text.includes("unit sticker"),
    );
    for (const item of body) {
      assert.ok(
        item.y >= url.y + 30,
        `page ${pageIndex} "${item.text}" at ${item.y} overlaps ${url.text} at ${url.y}`,
      );
    }
    const joined = placed.map((item) => item.text).join("");
    assert.equal(joined.includes("rvmax.appSofa"), false);
  }
  const all = Array.from({ length: doc.getPageCount() }, (_, index) =>
    pdfPlacedText(doc, index).map((item) => item.text).join("\n"),
  ).join("\n");
  assert.ok(all.includes("Sofa Material"));
  assert.ok(all.includes("Vinyl"));
});

test("a long feature list prints in full above the footer", async () => {
  const items = Array.from({ length: 28 }, (_, index) => `Feature Item ${index + 1}`);
  const included = items.join(" · ");
  const rows = [
    ...Array.from({ length: 70 }, (_, index) => ({
      label: `Spec ${index + 1}`,
      value: `Value ${index + 1}`,
    })),
    { label: "Included", value: included },
  ];
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
    sections: [{ title: "Features", rows }],
    sources: null,
    path: "/report/unit/1",
    shareTitle: "2027 Long Coach Example 40Z",
    shareText: "2027 Long Coach Example 40Z — RvFAX vehicle report",
    footerNote: "Specs should be confirmed on the unit sticker.",
    siteLabel: "rvmax.app",
    siteUrl: "https://rvmax.app",
  });
  const doc = await PDFDocument.load(bytes);
  assert.ok(doc.getPageCount() >= 2);
  const all: string[] = [];
  for (let pageIndex = 0; pageIndex < doc.getPageCount(); pageIndex += 1) {
    const placed = pdfPlacedText(doc, pageIndex);
    const url = placed.find((item) => item.text.includes("rvmax.app"));
    assert.ok(url, `page ${pageIndex} missing footer url`);
    for (const item of placed) {
      if (item.text.includes("rvmax.app") || item.text.includes("unit sticker")) continue;
      assert.ok(item.y >= url.y + 30, `"${item.text}" at ${item.y}`);
      assert.equal(item.text.includes("…"), false);
    }
    all.push(...placed.map((item) => item.text));
  }
  const joined = all.join(" ");
  for (const item of items) assert.ok(joined.includes(item), item);
  assert.ok(all.filter((text) => text === "Included").length >= 1);
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

test("stock 47492 RvFAX PDF is one page", async () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const snap = parseLotSnapshotJson(
    JSON.parse(readFileSync(join(here, "../../../public/inventory/own-lot-latest.json"), "utf8")),
  );
  const coach = snap.units.find((item) => item.stock_number === "47492");
  assert.ok(coach);
  const report = buildUnitShareReport(coach, NOW);
  const bytes = await buildShareReportPdf(report);
  const doc = await PDFDocument.load(bytes);
  assert.equal(doc.getPageCount(), 1);
  const text = pdfLiterals(doc);
  assert.ok(text.includes("47492"));
  assert.ok(text.includes("32,700"));
  assert.equal(text.includes("Price Monthly"), false);
  assert.equal(text.includes("Wallpaper"), false);
  assert.equal(text.includes("Wheelbase"), false);
});
