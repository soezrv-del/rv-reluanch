import assert from "node:assert/strict";
import test from "node:test";
import { CONFIRM_BROCHURE, type BrochureSpecs } from "./brochureSpecs.ts";
import {
  agreeingLotSpecs,
  fillBrochureHolesFromLot,
  findLotRowsForCoach,
} from "./lotCatalogFill.ts";
import { LOT_CATALOG_SEED } from "./lotCatalogSeed.ts";
import { getLotCatalogUnits } from "./lotCatalogUnits.ts";

function blankSheet(): BrochureSpecs {
  return {
    lengthFt: CONFIRM_BROCHURE,
    lengthIn: CONFIRM_BROCHURE,
    exteriorWidth: CONFIRM_BROCHURE,
    exteriorHeight: CONFIRM_BROCHURE,
    interiorHeight: CONFIRM_BROCHURE,
    wheelbase: CONFIRM_BROCHURE,
    gvwr: CONFIRM_BROCHURE,
    uvw: CONFIRM_BROCHURE,
    gvwrLbs: null,
    uvwLbs: null,
    ccc: CONFIRM_BROCHURE,
    gcwr: CONFIRM_BROCHURE,
    hitchOrPin: CONFIRM_BROCHURE,
    hitchLabel: "Hitch",
    fuelType: "Towable",
    engine: CONFIRM_BROCHURE,
    horsepower: CONFIRM_BROCHURE,
    torque: CONFIRM_BROCHURE,
    transmission: "N/A (towable)",
    chassis: CONFIRM_BROCHURE,
    mpgCity: CONFIRM_BROCHURE,
    mpgHighway: CONFIRM_BROCHURE,
    mpgCombined: CONFIRM_BROCHURE,
    mpgNote: CONFIRM_BROCHURE,
    fuelCapacity: CONFIRM_BROCHURE,
    rangeMiles: "Tow vehicle",
    sleeps: CONFIRM_BROCHURE,
    slideouts: CONFIRM_BROCHURE,
    seatBelts: CONFIRM_BROCHURE,
    awning: CONFIRM_BROCHURE,
    freshWater: CONFIRM_BROCHURE,
    grayWater: CONFIRM_BROCHURE,
    blackWater: CONFIRM_BROCHURE,
    propane: CONFIRM_BROCHURE,
    waterHeater: CONFIRM_BROCHURE,
    generator: CONFIRM_BROCHURE,
    electricalService: CONFIRM_BROCHURE,
    acUnits: CONFIRM_BROCHURE,
    furnaceBtu: CONFIRM_BROCHURE,
    converter: CONFIRM_BROCHURE,
    axles: CONFIRM_BROCHURE,
    tireSize: CONFIRM_BROCHURE,
    type: "Fifth Wheel",
    warranty: CONFIRM_BROCHURE,
    construction: CONFIRM_BROCHURE,
    accuracyNote: CONFIRM_BROCHURE,
    dataSource: "catalog",
    isToyHauler: false,
    garageLength: "—",
    garageWidth: "—",
    garageHeight: "—",
    garageCapacity: "—",
    rampWidth: "—",
    fuelStation: "—",
    generatorFuel: "—",
    garageFits: "—",
  };
}

test("46553 Reflection 337RLS fills empty brochure holes from the lot record", () => {
  const rows = findLotRowsForCoach(
    getLotCatalogUnits(),
    2026,
    "Grand Design",
    "Reflection",
    "337RLS",
  );
  assert.ok(rows.some((r) => r.stock_number === "46553"));

  const merged = fillBrochureHolesFromLot(
    blankSheet(),
    getLotCatalogUnits(),
    2026,
    "Grand Design",
    "Reflection",
    "337RLS",
  );
  assert.ok(merged.filled.includes("GVWR"));
  assert.ok(merged.filled.includes("PROPANE"));
  assert.equal(merged.specs.gvwrLbs, 13995);
  assert.equal(merged.specs.uvwLbs, 11475);
  assert.match(merged.specs.freshWater, /74/);
  assert.match(merged.specs.grayWater, /87/);
  assert.match(merged.specs.blackWater, /47/);
  assert.equal(merged.specs.propane, "60 lb");
});

test("OEM pin wins over the lot number", () => {
  const sheet = blankSheet();
  sheet.propane = "40 lb";
  sheet.gvwr = "15,000 lbs";
  sheet.gvwrLbs = 15000;
  const merged = fillBrochureHolesFromLot(
    sheet,
    getLotCatalogUnits(),
    2026,
    "Grand Design",
    "Reflection",
    "337RLS",
  );
  assert.equal(merged.specs.propane, "40 lb");
  assert.equal(merged.specs.gvwrLbs, 15000);
  assert.ok(!merged.filled.includes("PROPANE"));
  assert.ok(!merged.filled.includes("GVWR"));
});

test("337RLS numbers do not become a Reflection class average", () => {
  const rows = findLotRowsForCoach(
    getLotCatalogUnits(),
    2026,
    "Grand Design",
    "Reflection",
    "303RLS",
  );
  assert.equal(rows.length, 0);
  const merged = fillBrochureHolesFromLot(
    blankSheet(),
    getLotCatalogUnits(),
    2026,
    "Grand Design",
    "Reflection",
    "303RLS",
  );
  assert.equal(merged.filled.length, 0);
  assert.equal(merged.specs.propane, CONFIRM_BROCHURE);
});

test("disagreeing lot numbers leave the hole", () => {
  const units = [
    {
      year: 2026,
      make: "Grand Design",
      model: "Reflection",
      trim: "337RLS",
      propane_lbs: 60,
      gvwr: 13995,
    },
    {
      year: 2026,
      make: "Grand Design",
      model: "Reflection",
      trim: "337RLS",
      propane_lbs: 40,
      gvwr: 13995,
    },
  ];
  const agreed = agreeingLotSpecs(units);
  assert.equal(agreed?.gvwrLbs, 13995);
  assert.equal(agreed?.propaneLbs ?? null, null);
});

test("Hideout Mini 161BH agreeing units keep printed tanks and 20 lb propane", () => {
  const seed = LOT_CATALOG_SEED.filter((r) => r.trim === "161BH");
  assert.equal(seed.length, 2);
  const merged = fillBrochureHolesFromLot(
    blankSheet(),
    seed,
    2027,
    "Keystone",
    "Hideout Mini",
    "161BH",
  );
  assert.equal(merged.specs.propane, "20 lb");
  assert.match(merged.specs.freshWater, /21/);
});
