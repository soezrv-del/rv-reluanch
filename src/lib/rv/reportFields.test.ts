import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { LotUnit } from "../lot/ownLotPage.ts";
import { parseLotSnapshotJson } from "../lot/ownLotPage.ts";
import { buildUnitShareReport } from "./shareReport.ts";
import {
  buildBuyerUnitReport,
  formatReportBeds,
  formatReportFeetInches,
  formatReportHorsepower,
  formatReportPounds,
  formatReportPropane,
  formatReportTorque,
  isHiddenReportValue,
} from "./reportFields.ts";

const NOW = new Date("2026-09-27T15:00:00Z");

function unit(printed: Record<string, string>, extra: Partial<LotUnit> = {}): LotUnit {
  return {
    year: "2027",
    make: "Thor Motor Coach",
    model: "Inception",
    trim: "38DX",
    body_type: "Class Super C",
    location: "Mesa AZ",
    stock_number: "47492",
    vin: "4UZADVFC7VCWZ8275",
    source: "own",
    dealer: "RV Country",
    price: 305995,
    title: "2027 Thor Motor Coach Inception 38DX",
    condition: "New",
    url: "",
    lot_status: "Available",
    photo: "",
    mileage: "",
    gvwr: null,
    dry_weight: null,
    hitch_weight: null,
    payload: null,
    length_ft: null,
    height_ft: null,
    width_ft: null,
    sleeps: null,
    slides: null,
    fresh_gal: null,
    gray_gal: null,
    black_gal: null,
    propane_lbs: null,
    propane_gal: null,
    engine: "",
    chassis: "",
    fuel_type: "",
    printed,
    ...extra,
  };
}

function sectionRows(report: { sections: { rows: { label: string; value: string }[] }[] }) {
  return report.sections.flatMap((section) => section.rows);
}

test("feet-inches, horsepower, and torque drop pipe-joined raw numbers", () => {
  assert.equal(formatReportFeetInches("478 | 39'10\""), "39'10\"");
  assert.equal(formatReportFeetInches("13'3\" | 159"), "13'3\"");
  assert.equal(formatReportFeetInches("8'5\" | 101"), "8'5\"");
  assert.equal(formatReportFeetInches("23'3\" | 279"), "23'3\"");
  assert.equal(formatReportFeetInches("16.5 ft | 198 in"), "16'6\"");
  assert.equal(formatReportFeetInches("23 ft"), "23'");
  assert.equal(formatReportHorsepower("2600 | 360 HP"), "360 HP");
  assert.equal(formatReportHorsepower("310 hp"), "310 HP");
  assert.equal(formatReportHorsepower("2600"), null);
  assert.equal(formatReportTorque("1800 | 800 | 800 lb-ft"), "800 lb-ft");
  assert.equal(formatReportTorque("400 lb-ft"), "400 lb-ft");
});

test("weights use thousands commas and lb", () => {
  assert.equal(formatReportPounds("32700"), "32,700 lb");
  assert.equal(formatReportPounds("15,000 lbs"), "15,000 lb");
  assert.equal(formatReportPounds("37320 lbs"), "37,320 lb");
  assert.equal(formatReportPounds("0"), null);
  assert.equal(isHiddenReportValue("0 gal"), true);
  assert.equal(isHiddenReportValue("0"), true);
});

test("beds line keeps bunks and bed type and drops zero counts", () => {
  assert.equal(
    formatReportBeds({
      number_of_king_size_beds: "1",
      number_of_queen_size_beds: "0",
      number_of_bunk_beds: "2",
      number_of_double_beds: "0",
    }),
    "King · 2 bunks",
  );
  assert.equal(
    formatReportBeds({ number_of_queen_size_beds: "1", number_of_bunk_beds: "0" }),
    "Queen",
  );
  assert.equal(formatReportBeds({ number_of_king_size_beds: "1" }), "King");
  assert.equal(formatReportBeds({ number_of_bunk_beds: "0", number_of_queen_size_beds: "0" }), null);
});

test("propane and gvwr collapse to one row, and junk rows stay off the report", () => {
  const report = buildBuyerUnitReport(
    unit({
      gvwr: "32700",
      gross_vehicle_weight_rating: "32,700 lbs",
      propane_lbs: "105",
      propane_gal: "24.8",
      total_propane_tank_capacity: "105 lbs | 24.8",
      engine: "Cummins / In-Line",
      engine_type: "Cummins B6.7L",
      transmission: "6",
      transmission_type: "6",
      transmission_brand: "Allison",
      lot_status: "Available",
      number_of_sofas: "1",
      sofa_material: "Vinyl",
      document_fee: "399",
      dealer_prep_fee: "3995",
      price_current_incl_fees: "310389",
      price_biweekly: "1003.35",
      heater_btu: "35000",
      awning_length: "20",
      number_of_axles: "1",
      number_of_fresh_water_holding_tanks: "1",
      water_heater_tank_capacity: "0",
      slides: "0",
      number_of_king_size_beds: "1",
      number_of_bunk_beds: "0",
      horsepower: "2600 | 360 HP",
      vehicle_body_length: "478 | 39'10\"",
      fuel_type: "Regular Diesel",
    }),
  );
  const rows = sectionRows(report);
  const labels = rows.map((row) => row.label);
  assert.equal(labels.filter((label) => label === "GVWR").length, 1);
  assert.equal(labels.filter((label) => label === "Propane").length, 1);
  assert.equal(rows.find((row) => row.label === "GVWR")?.value, "32,700 lb");
  assert.equal(rows.find((row) => row.label === "Propane")?.value, "105 lb");
  assert.equal(rows.find((row) => row.label === "Engine Type")?.value, "Cummins B6.7L");
  assert.equal(rows.find((row) => row.label === "Transmission")?.value, "Allison");
  assert.equal(rows.find((row) => row.label === "Length")?.value, "39'10\"");
  assert.equal(rows.find((row) => row.label === "Horsepower")?.value, "360 HP");
  assert.equal(rows.find((row) => row.label === "Fuel")?.value, "Diesel");
  assert.equal(rows.find((row) => row.label === "Beds")?.value, "King");
  assert.equal(labels.includes("Status"), false);
  for (const banned of [
    "Sofa Material",
    "Number Of Sofas",
    "Document Fee",
    "Dealer Prep Fee",
    "Price Current Incl Fees",
    "Price Biweekly",
    "Heater Btu",
    "Awning Length",
    "Number Of Axles",
    "Number Of Fresh Water Holding Tanks",
    "Water Heater Tank Capacity",
    "Engine",
  ]) {
    assert.equal(labels.includes(banned), false, banned);
  }
  const blob = rows.map((row) => `${row.label} ${row.value}`).join("\n");
  assert.equal(blob.includes("|"), false);
  assert.equal(blob.includes("Cummins / In-Line"), false);
  assert.doesNotMatch(blob, /(?:^|\n)\S.*\b0\b/);
  assert.equal(rows.some((row) => row.value.trim() === "6"), false);
});

test("status shows only for pending, and propane keeps gallons when that is the source unit", () => {
  const pending = buildBuyerUnitReport(
    unit({ lot_status: "Sale Pending" }, { lot_status: "Sale Pending" }),
  );
  assert.equal(sectionRows(pending).find((row) => row.label === "Status")?.value, "Sale Pending");

  const gallons = buildBuyerUnitReport(
    unit({ propane_gal: "24.8", propane_lbs: "" }),
  );
  assert.equal(sectionRows(gallons).find((row) => row.label === "Propane")?.value, "24.8 gal");
  assert.equal(
    formatReportPropane({ combined: "24.8 gal | 105", gal: "24.8", lbs: "105" }),
    "24.8 gal",
  );
});

test("a bare inline engine and a bare transmission number are omitted", () => {
  const report = buildBuyerUnitReport(
    unit({
      engine: "Cummins / In-line",
      transmission: "6",
    }),
  );
  const labels = sectionRows(report).map((row) => row.label);
  assert.equal(labels.includes("Engine Type"), false);
  assert.equal(labels.includes("Engine"), false);
  assert.equal(labels.includes("Transmission"), false);
});

test("2027 Thor Inception 38DX stock 47492 is a short buyer report", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const snap = parseLotSnapshotJson(
    JSON.parse(
      readFileSync(join(here, "../../../public/inventory/own-lot-latest.json"), "utf8"),
    ),
  );
  const coach = snap.units.find((item) => item.stock_number === "47492");
  assert.ok(coach);
  assert.match(coach.title, /2027 Thor Motor Coach Inception 38DX/);
  const report = buildUnitShareReport(coach, NOW);
  const rows = sectionRows(report);
  const byLabel = new Map(rows.map((row) => [row.label, row.value]));
  assert.equal(rows.length, 28);
  assert.equal(report.title, "2027 Thor Motor Coach Inception 38DX");
  assert.equal(report.headlines.find((row) => row.label === "Price")?.value, "$305,995");
  assert.equal(report.headlines.find((row) => row.label === "Stock number")?.value, "47492");
  assert.equal(byLabel.get("VIN"), "4UZADVFC7VCWZ8275");
  assert.equal(byLabel.get("Condition"), "New");
  assert.equal(byLabel.get("Location"), "Mesa AZ");
  assert.equal(byLabel.get("Type"), "Class Super C");
  assert.equal(byLabel.get("MSRP"), "$378,889");
  assert.equal(byLabel.get("Price Monthly"), "$2,174");
  assert.equal(byLabel.get("Length"), "39'10\"");
  assert.equal(byLabel.get("Height"), "13'3\"");
  assert.equal(byLabel.get("Width"), "8'5\"");
  assert.equal(byLabel.get("Wheelbase"), "23'3\"");
  assert.equal(byLabel.get("Sleeps"), "4");
  assert.equal(byLabel.get("Slides"), "3");
  assert.equal(byLabel.get("Beds"), "King · Full · Sofa bed");
  assert.equal(byLabel.get("Chassis"), "Freightliner S2RV");
  assert.equal(byLabel.get("Engine Type"), "Cummins B6.7L");
  assert.equal(byLabel.get("Horsepower"), "360 HP");
  assert.equal(byLabel.get("Torque"), "800 lb-ft");
  assert.equal(byLabel.get("Transmission"), "Allison");
  assert.equal(byLabel.get("Fuel"), "Diesel");
  assert.equal(byLabel.get("GVWR"), "32,700 lb");
  assert.equal(byLabel.get("Towing"), "15,000 lb");
  assert.equal(byLabel.get("Hitch"), "15,000 lb");
  assert.equal(byLabel.get("Fresh"), "100 gal");
  assert.equal(byLabel.get("Gray"), "40F / 40R gal");
  assert.equal(byLabel.get("Black"), "40F / 40R gal");
  assert.equal(byLabel.get("Fuel tank"), "100 gal");
  assert.equal(byLabel.get("Propane"), "105 lb");
  assert.equal(byLabel.get("Generator"), "Diesel");
  assert.equal(byLabel.get("Status"), undefined);
  assert.equal(rows.filter((row) => row.label === "Propane").length, 1);
  assert.equal(rows.filter((row) => row.label === "GVWR").length, 1);
  const blob = [
    ...report.headlines.map((row) => row.value),
    ...rows.map((row) => `${row.label} ${row.value}`),
  ].join("\n");
  assert.equal(blob.includes("|"), false);
  assert.equal(/Cummins\s*\/\s*In-?Line/i.test(blob), false);
  for (const banned of [
    "Sofa Material",
    "Number Of Sofas",
    "Number of Sofas",
    "Document Fee",
    "Dealer Prep",
    "Incl Fees",
    "Biweekly",
    "Heater",
    "Awning",
    "Axles",
    "Holding Tanks",
    "Oven",
    "Seat Material",
    "Driveline",
  ]) {
    assert.equal(blob.includes(banned), false, banned);
  }
  assert.equal(rows.some((row) => isHiddenReportValue(row.value)), false);
});
