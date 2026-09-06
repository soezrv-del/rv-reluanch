import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { getRating, getTrims } from "./towVehicles.ts";
import {
  DEFAULT_TOW_VEHICLE,
  LEGACY_FAKE_TOW_TRIM,
  filterTrimsForYear,
  formatTrimYearRange,
  getTrimsForYear,
  isCatalogTrimForYear,
  parseTrimYears,
  pickSuccessorTrim,
  resolveDefaultTowVehicle,
  trimCoversYear,
  trimStem,
} from "./towYear.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("parseTrimYears reads catalog year notes", () => {
  assert.deepEqual(parseTrimYears("LS — 5.3L V8 (2005–2006)"), {
    start: 2005,
    end: 2006,
  });
  assert.deepEqual(parseTrimYears("ZR2 Bison — 2.7L Turbo (2024)"), {
    start: 2024,
    end: 2024,
  });
  assert.deepEqual(parseTrimYears("2.4L (2018 last year)"), {
    start: 2018,
    end: 2018,
  });
  assert.deepEqual(parseTrimYears("WT — 2.5L I4 (2015–2018 redesign)"), {
    start: 2015,
    end: 2018,
  });
  assert.deepEqual(parseTrimYears("XL SRW — 6.8L Gas V8 (2023-2026)"), {
    start: 2023,
    end: 2026,
  });
  assert.equal(parseTrimYears("XL SRW — 6.8L Gas V8"), null);
  assert.equal(formatTrimYearRange("Lariat SRW — 6.7L Power Stroke Diesel (2023–2026)"), "2023–2026");
  assert.equal(trimStem("Lariat SRW — 6.7L Power Stroke Diesel (2023–2026)"), "Lariat SRW — 6.7L Power Stroke Diesel");
});

test("legacy fake XL diesel string is not in the Ford F-350 table", () => {
  const labels = getTrims("Ford", "F-350 Super Duty").map((t) => t.label);
  assert.ok(labels.length > 0);
  assert.equal(labels.includes(LEGACY_FAKE_TOW_TRIM), false);
  assert.equal(
    isCatalogTrimForYear("Ford", "F-350 Super Duty", LEGACY_FAKE_TOW_TRIM, "2024"),
    false,
  );
});

test("default first-paint vehicle is a real year-covering catalog trim", () => {
  const d = resolveDefaultTowVehicle();
  assert.equal(d.year, "2024");
  assert.equal(d.make, "Ford");
  assert.equal(d.model, "F-350 Super Duty");
  assert.ok(d.trim, "default trim must resolve from the table");
  assert.notEqual(d.trim, LEGACY_FAKE_TOW_TRIM);
  assert.equal(isCatalogTrimForYear(d.make, d.model, d.trim, d.year), true);
  assert.equal(trimCoversYear(d.trim, d.year), true);

  const rating = getRating(d.make, d.model, d.trim);
  assert.ok(rating.maxTow > 0);
  assert.ok(rating.payload > 0);
  assert.notEqual(rating.label, "Unknown");
  assert.equal(rating.label, d.trim);
  assert.deepEqual(DEFAULT_TOW_VEHICLE, d);
});

test("Year 2024 vs 2016 F-350 Super Duty expose different catalog rows", () => {
  const y2024 = getTrimsForYear("Ford", "F-350 Super Duty", "2024");
  const y2016 = getTrimsForYear("Ford", "F-350 Super Duty", "2016");
  const avalanche2024 = getTrimsForYear("Chevrolet", "Avalanche", "2024");

  assert.ok(y2024.length > 0, "2024 should have year-banded Super Duty rows");
  assert.ok(y2016.length > 0, "2016 should have year-banded Super Duty rows");
  assert.equal(
    avalanche2024.length,
    0,
    "year with no labeled row stays empty — no invented rating",
  );

  const labels2024 = new Set(y2024.map((t) => t.label));
  const labels2016 = new Set(y2016.map((t) => t.label));
  const overlap = [...labels2024].filter((l) => labels2016.has(l));
  assert.equal(overlap.length, 0);

  const diesel24 = y2024.find((t) => /Lariat SRW/i.test(t.label) && /Power Stroke/i.test(t.label));
  const gas16 = y2016.find((t) => /XL SRW/i.test(t.label));
  assert.ok(diesel24);
  assert.ok(gas16);
  assert.notEqual(diesel24!.maxTow, gas16!.maxTow);
});

test("year-banded models hide unlabeled current-gen rows when Year is set", () => {
  const all = getTrims("Ford", "F-350 Super Duty");
  const unlabeled = all.filter((t) => !parseTrimYears(t.label));
  assert.ok(unlabeled.length > 0, "fixture: Super Duty still has unlabeled rows");

  const y2024 = getTrimsForYear("Ford", "F-350 Super Duty", "2024");
  assert.equal(y2024.some((t) => !parseTrimYears(t.label)), false);
  assert.ok(y2024.every((t) => trimCoversYear(t.label, 2024)));
});

test("models with no year notes stay unfiltered", () => {
  const unlabeledOnly = [
    { label: "WT — 2.7L Turbo", maxTow: 3500, payload: 1570, gcwr: 8500, hitch: "Class III" },
    { label: "LT — 2.7L Turbo", maxTow: 7700, payload: 1620, gcwr: 12500, hitch: "Class IV" },
  ];
  const filtered = filterTrimsForYear(unlabeledOnly, "2011");
  assert.equal(filtered.length, 2);
});

test("empty year returns every trim", () => {
  const all = getTrims("Ford", "F-350 Super Duty");
  assert.equal(getTrimsForYear("Ford", "F-350 Super Duty", "").length, all.length);
  assert.equal(getTrimsForYear("Ford", "F-350 Super Duty", null).length, all.length);
});

test("pickSuccessorTrim keeps the same stem across years, never SRW→DRW", () => {
  const y2019 = getTrimsForYear("Ford", "F-350 Super Duty", "2019");
  const from2024 = "Lariat SRW — 6.7L Power Stroke Diesel (2023–2026)";
  assert.equal(pickSuccessorTrim(from2024, y2019), undefined);

  const y2025 = getTrimsForYear("Ford", "F-350 Super Duty", "2025");
  const same = pickSuccessorTrim(from2024, y2025);
  assert.ok(same);
  assert.equal(same.label, from2024);

  const xl2016 = "XL SRW — 6.2L Gas V8 (2015–2016)";
  const y2018 = getTrimsForYear("Ford", "F-350 Super Duty", "2018");
  const xl2018 = pickSuccessorTrim(xl2016, y2018);
  assert.ok(xl2018);
  assert.equal(trimStem(xl2018.label), "XL SRW — 6.2L Gas V8");
  assert.equal(/DRW/.test(xl2018.label), false);
});

test("RvTowApp no longer hard-codes the fake XL diesel trim", () => {
  const src = readFileSync(join(root, "../../components/rvtow/RvTowApp.tsx"), "utf8");
  assert.equal(src.includes(LEGACY_FAKE_TOW_TRIM), false);
  assert.equal(src.includes("DEFAULT_TOW_VEHICLE"), true);
  assert.equal(src.includes("getTrimsForYear"), true);
});
