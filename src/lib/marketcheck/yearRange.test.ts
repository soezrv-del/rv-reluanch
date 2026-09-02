import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_YEAR_PAD,
  YEAR_MIN,
  clampYear,
  formatYearRange,
  inventoryYearQuery,
  medianListingPrice,
  parseFourDigitYear,
  parseYearRangeString,
  resolveSearchYears,
  yearMaxBound,
  yearRangeFromCenter,
} from "./yearRange.ts";

const NOW = new Date("2026-09-02T00:00:00Z");
const YEAR_MAX = yearMaxBound(NOW);

test("parseFourDigitYear accepts only YYYY", () => {
  assert.equal(parseFourDigitYear("2022"), 2022);
  assert.equal(parseFourDigitYear(2022), 2022);
  assert.equal(parseFourDigitYear("22"), null);
  assert.equal(parseFourDigitYear("2022-2024"), null);
  assert.equal(parseFourDigitYear(""), null);
});

test("parseYearRangeString clamps to sane bounds and rejects min > max", () => {
  assert.deepEqual(parseYearRangeString("2020-2025"), {
    min: 2020,
    max: 2025,
  });
  assert.equal(parseYearRangeString("2025-2020"), null);
  assert.equal(parseYearRangeString("2020"), null);
  assert.deepEqual(parseYearRangeString("1970-1985"), {
    min: YEAR_MIN,
    max: 1985,
  });
});

test("yearRangeFromCenter pads and clamps", () => {
  assert.deepEqual(yearRangeFromCenter(2022, 2, NOW), {
    min: 2020,
    max: 2024,
  });
  assert.deepEqual(yearRangeFromCenter(1982, 2, NOW), {
    min: YEAR_MIN,
    max: 1984,
  });
  assert.deepEqual(yearRangeFromCenter(YEAR_MAX, 2, NOW), {
    min: YEAR_MAX - 2,
    max: YEAR_MAX,
  });
  assert.equal(DEFAULT_YEAR_PAD, 2);
});

test("resolveSearchYears: year_range wins and does not use exact year mode", () => {
  const resolved = resolveSearchYears({
    year: "2022",
    yearRange: "2020-2024",
  });
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.useRange, true);
  assert.equal(resolved.year, "2022");
  assert.deepEqual(resolved.range, { min: 2020, max: 2024 });
  assert.equal(formatYearRange(resolved.range), "2020-2024");
});

test("resolveSearchYears: year_min + year_max", () => {
  const resolved = resolveSearchYears({
    yearMin: "2019",
    yearMax: "2023",
  });
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.useRange, true);
  assert.deepEqual(resolved.range, { min: 2019, max: 2023 });
});

test("resolveSearchYears: lone year stays exact-year (backward compatible)", () => {
  const resolved = resolveSearchYears({ year: "2022" });
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  assert.equal(resolved.useRange, false);
  assert.equal(resolved.year, "2022");
  assert.deepEqual(resolved.range, { min: 2022, max: 2022 });
});

test("resolveSearchYears: missing year filter is an error", () => {
  const resolved = resolveSearchYears({});
  assert.equal(resolved.ok, false);
  if (resolved.ok) return;
  assert.match(resolved.error, /year or year_range/i);
});

test("resolveSearchYears: year_min without year_max is invalid", () => {
  const resolved = resolveSearchYears({ yearMin: "2020" });
  assert.equal(resolved.ok, false);
});

test("clampYear stays within 1981–currentYear+1", () => {
  assert.equal(clampYear(1975, NOW), YEAR_MIN);
  assert.equal(clampYear(2099, NOW), YEAR_MAX);
  assert.equal(clampYear(2022, NOW), 2022);
});

test("inventoryYearQuery defaults to ±2 around the coach year", () => {
  const q = inventoryYearQuery({ year: 2022 });
  assert.equal(q.year, "2022");
  assert.equal(q.year_range, "2020-2024");
  assert.deepEqual(q.yearRange, { min: 2020, max: 2024 });
});

test("inventoryYearQuery accepts explicit min/max", () => {
  const q = inventoryYearQuery({
    year: 2022,
    yearMin: 2018,
    yearMax: 2021,
  });
  assert.equal(q.year_range, "2018-2021");
});

test("medianListingPrice ignores junk $1 / missing prices", () => {
  assert.equal(medianListingPrice([1, 120000, 140000, 160000]), 140000);
  assert.equal(medianListingPrice([null, 1, 999, undefined]), null);
  assert.equal(medianListingPrice([80000, 100000]), 90000);
});

test("proxy sends year_range without year when a range is present", () => {
  const root = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(
    join(root, "../../routes/api/marketcheck.search.ts"),
    "utf8",
  );
  assert.match(src, /year_range/);
  assert.match(src, /if \(years\.useRange\)/);
  assert.match(src, /mc\.searchParams\.set\("year_range"/);
  assert.match(src, /else if \(years\.year\)/);
  assert.match(src, /yearRange: years\.range/);
  assert.match(src, /medianListingPrice/);
  assert.match(src, /Math\.min\(\s*100/);
});

test("Facts client builds year_range from coach year ± pad", () => {
  const root = dirname(fileURLToPath(import.meta.url));
  const client = readFileSync(join(root, "client.ts"), "utf8");
  const ui = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(client, /year_range: years\.year_range/);
  assert.match(client, /yearPad/);
  assert.match(ui, /Years \{invYearWindow\.min\}–\{invYearWindow\.max\}/);
  assert.match(ui, /yearPad: invYearPad/);
});
