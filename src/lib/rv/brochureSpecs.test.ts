import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  honestAcUnits,
  honestElectricalService,
  honestGenerator,
  honestHorsepowerForCoach,
  honestHorsepowerLabel,
  honestTireSize,
  honestTorqueForCoach,
  honestTorqueLabel,
  parseHp,
} from "./catalogHonesty.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";
import { CATALOG_INDEX } from "./rvCatalogIndex.ts";

const DREAM_ENGINE = "Cummins L9 450 std / X15 605 opt";
const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

test("parseHp: option-band engine + numeric 450 must not return lone 450 HP", () => {
  const out = parseHp(DREAM_ENGINE, 450);
  assert.notEqual(out, "450 HP");
  assert.doesNotMatch(out, /^450\s*HP$/i);
  assert.match(out, /450/);
  assert.match(out, /605|opt/i);
});

test("parseHp: std/opt without HP suffix still surfaces both ratings", () => {
  const out = parseHp("Cummins L9 450 std / X15 605 opt", 450);
  assert.match(out, /450/);
  assert.match(out, /605/);
  assert.doesNotMatch(out, /^450\s*HP$/);
});

test("parseHp: single locked L9 450 still returns 450 HP", () => {
  assert.equal(parseHp("Cummins L9 450HP", 450), "450 HP");
});

test("buildBrochureSpecs uses honesty helpers so Facts HP follows the engine option band", () => {
  const spec = src("brochureSpecs.ts");
  assert.match(spec, /honestHorsepowerForCoach/);
  assert.match(spec, /honestTireSize/);
  assert.match(spec, /honestAcUnits/);
  assert.match(spec, /honestElectricalService/);
  assert.match(spec, /honestGenerator/);
  assert.match(spec, /from "\.\/catalogHonesty"/);
  assert.match(src("catalogHonesty.ts"), /export function parseHp/);
});

test("honestTorqueLabel does not pretend L9-only when X15 opt exists", () => {
  const tq = honestTorqueLabel({
    engine: DREAM_ENGINE,
    torqueLbFt: 1250,
  });
  assert.ok(tq);
  assert.doesNotMatch(tq || "", /^1,?250 lb-ft$/);
  assert.match(tq || "", /X15|opt|varies|confirm/i);
});

test("Grok catalog injection helpers do not lock horsepower: 450 alone", () => {
  const pin = findPowertrainCorrection(
    "2023",
    "American Coach",
    "American Dream",
    "45A",
  );
  assert.ok(pin);
  const hp = honestHorsepowerLabel({
    engine: pin!.engine,
    horsepower: 450,
  });
  const tq = honestTorqueLabel({
    engine: pin!.engine,
    torqueLbFt: 1250,
  });
  assert.doesNotMatch(hp || "", /^450 HP$/);
  assert.match(hp || "", /450/);
  assert.match(hp || "", /605|opt/i);
  assert.doesNotMatch(tq || "", /^1,?250 lb-ft$/);

  const grounding = readFileSync(
    join(root, "../rvgrok/grounding.ts"),
    "utf8",
  );
  assert.match(grounding, /honestHorsepowerLabel/);
  assert.match(grounding, /honestTorqueLabel/);
  assert.match(grounding, /engineAmbiguous/);
});

test("American Dream catalog source does not lock horsepower: 450 on 2020–2026 band", () => {
  const block = src("rvData.ts");
  const start = block.indexOf('"American Dream"');
  assert.ok(start > 0);
  const next = block.indexOf('"Entegra Coach"', start);
  const dream = block.slice(start, next > start ? next : start + 2500);
  assert.match(dream, /Cummins L9 450 std \/ X15 605 opt/);
  const bandAt = dream.lastIndexOf("from: 2020");
  assert.ok(bandAt >= 0, "expected 2020–2026 Dream year-band");
  const band = dream.slice(bandAt, bandAt + 400);
  assert.match(band, /X15 605 opt/);
  assert.doesNotMatch(band, /horsepower:\s*450/);
});

test("Class C never hash-picks bus tires or triple 15k A/C", () => {
  assert.match(
    honestTireSize({ type: "Class C", chassis: "Ford E-450" }),
    /LT225\/75R16E/,
  );
  assert.doesNotMatch(
    honestTireSize({ type: "Class C", chassis: "Ford E-450" }),
    /275\/70R22\.5|22\.5/,
  );
  assert.match(honestAcUnits({ type: "Class C", lengthFt: 26 }), /1\s*×\s*15,000/);
  assert.doesNotMatch(honestAcUnits({ type: "Class C", lengthFt: 26 }), /3\s*×/);
  const spec = src("brochureSpecs.ts");
  assert.doesNotMatch(spec, /pick\(seed,\s*\[\s*"225\/75R16"/);
  assert.doesNotMatch(spec, /"3 × 15,000 BTU"/);
  assert.match(spec, /honestTireSize/);
  assert.match(spec, /honestAcUnits/);
});

test("gas chassis rewrites Diesel/Gas generator; diesel does not get gas-only", () => {
  assert.match(
    honestGenerator({
      generator: "Onan Diesel / Gas",
      fuelType: "Gas",
      chassis: "Ford E-450",
      type: "Class C",
    }),
    /gas/i,
  );
  assert.doesNotMatch(
    honestGenerator({
      generator: "Onan Diesel / Gas",
      fuelType: "Gas",
      chassis: "Ford E-450",
      type: "Class C",
    }),
    /Diesel \/ Gas/,
  );
  const diesel = honestGenerator({
    generator: "Onan Diesel / Gas",
    fuelType: "Diesel",
    chassis: "Freightliner XC",
    type: "Class A Diesel",
  });
  assert.match(diesel, /diesel/i);
  assert.doesNotMatch(diesel, /4\.0 kW gas/i);
});

test("E-450 7.3 does not present F53 350/468 as certified", () => {
  const hp = honestHorsepowerForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 350,
    chassis: "Ford E-450",
    type: "Class C",
  });
  assert.notEqual(hp, "350 HP");
  assert.match(hp, /325|confirm/i);
  const tq = honestTorqueForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    chassis: "Ford E-450",
    type: "Class C",
    torqueLbFt: 468,
  });
  assert.doesNotMatch(tq, /^468 lb-ft/);
  assert.match(tq, /450|confirm/i);
});

test("Sprinter Class C does not inherit E-450 tires / 50A / triple AC", () => {
  const tires = honestTireSize({
    type: "Class C",
    chassis: "Mercedes-Benz Sprinter 3500XD",
  });
  assert.match(tires, /215\/85/);
  assert.doesNotMatch(tires, /225\/75|22\.5/);
  const ac = honestAcUnits({
    type: "Class C",
    chassis: "Mercedes-Benz Sprinter 3500XD",
    lengthFt: 25.5,
  });
  assert.match(ac, /13,?500/);
  assert.doesNotMatch(ac, /3\s*[×x]/);
  assert.equal(
    honestElectricalService({
      type: "Class C",
      chassis: "Mercedes-Benz Sprinter 3500XD",
    }),
    "30 amp",
  );
  assert.equal(
    honestElectricalService({
      type: "Class C",
      chassis: "Ford E-450",
    }),
    "50 amp",
  );
});

test("year cascade: 2025 Fleetwood drops Tioga; 2015 still offers it", () => {
  const tioga = CATALOG_INDEX.Fleetwood?.Tioga;
  assert.ok(tioga, "Tioga remains in catalog for historic years");
  assert.equal(tioga!.yearEnd, 2016);
  assert.equal(tioga!.years?.includes(2025), false);
  assert.equal(tioga!.years?.includes(2015), true);
  const jamboree = CATALOG_INDEX.Fleetwood?.Jamboree;
  assert.ok(jamboree);
  assert.equal(jamboree!.yearEnd, 2016);
  assert.equal(jamboree!.years?.includes(2025), false);
  assert.equal(jamboree!.years?.includes(2015), true);

  const block = src("rvData.ts");
  const t0 = block.indexOf("    Tioga: {");
  const t1 = block.indexOf("    \"Tioga Ranger\"");
  const tiogaSrc = block.slice(t0, t1);
  assert.match(tiogaSrc, /yearEnd:\s*2016/);
  assert.doesNotMatch(tiogaSrc, /"2025"/);
  assert.doesNotMatch(tiogaSrc, /25CE|Onan Diesel \/ Gas/);
  assert.doesNotMatch(tiogaSrc, /engine: "Ford 7\.3L/);
});

test("Fleetwood 2025–2026 live lines: Altitude / Insight / Fortis; Bounder OEM plans", () => {
  const fw = CATALOG_INDEX.Fleetwood;
  assert.ok(fw?.Altitude, "Altitude Class C must be in catalog");
  assert.equal(fw!.Altitude.yearStart, 2025);
  assert.equal(fw!.Altitude.years?.includes(2025), true);
  assert.equal(fw!.Altitude.years?.includes(2026), true);
  assert.ok(fw?.Insight, "Insight Class C diesel must be in catalog");
  assert.equal(fw!.Insight.yearStart, 2025);
  assert.equal(fw!.Insight.years?.includes(2025), true);
  assert.ok(fw?.Fortis, "Fortis live Class A");
  assert.ok(fw?.["Altitude FS600D"], "Altitude FS600D Super C");
  assert.equal(fw!["Altitude FS600D"]!.type, "Super C");
  assert.equal(fw!.Flex?.yearEnd, 2025);
  assert.equal(fw!["Frontier GTX"]?.yearEnd, 2025);
  assert.equal(fw!.Storm?.yearEnd, 2018);
  assert.equal(fw!["Pace Arrow"]?.yearEnd, 2023);
  assert.equal(fw!["Tioga Ranger"]?.yearEnd, 2016);
  assert.equal(fw!.Storm?.years?.includes(2025), false);
  assert.equal(fw!["Pace Arrow"]?.years?.includes(2025), false);

  const block = src("rvData.ts");
  const a0 = block.indexOf("    Altitude: {");
  const a1 = block.indexOf("    Insight: {");
  const alt = block.slice(a0, a1);
  assert.match(alt, /"2025": \["27U", "29F", "31W"\]/);
  assert.match(alt, /"2026": \["27U", "29F", "29H", "31W"\]/);
  assert.match(alt, /horsepower: 325/);
  assert.match(alt, /torqueLbFt: 450/);
  assert.match(alt, /Ford E-450/);
  assert.match(alt, /Onan 4000W Quiet gas/);
  assert.doesNotMatch(alt, /Onan Diesel \/ Gas/);
  assert.doesNotMatch(alt, /chassis: "Ford F53"/);

  const b0 = block.indexOf("    Bounder: {");
  const b1 = block.indexOf('    "Bounder Classic"');
  const bounder = block.slice(b0, b1);
  assert.match(bounder, /35GL/);
  assert.doesNotMatch(bounder, /"33P"/);
});

test("Fleetwood 2023–2024 walk-back: OEM plans, no invented ghosts", () => {
  const fw = CATALOG_INDEX.Fleetwood;
  assert.ok(fw);
  assert.equal(fw.Flex?.yearStart, 2023);
  assert.equal(fw.Flex?.years?.includes(2023), true);
  assert.equal(fw.Flex?.years?.includes(2024), true);
  assert.equal(fw.Fortis?.yearStart, 2023);
  assert.equal(fw.Fortis?.years?.includes(2023), true);
  assert.equal(fw.Fortis?.years?.includes(2024), true);
  assert.equal(fw.Frontier?.yearStart, 2023);
  assert.equal(fw.Frontier?.years?.includes(2023), true);
  assert.equal(fw.Frontier?.years?.includes(2024), true);
  assert.equal(fw["Frontier GTX"]?.yearStart, 2023);
  assert.equal(fw["Frontier GTX"]?.years?.includes(2023), true);
  assert.equal(fw["Frontier GTX"]?.years?.includes(2024), true);
  assert.equal(fw.Southwind?.yearEnd, 2023);
  assert.equal(fw.Southwind?.years?.includes(2024), false);
  assert.equal(fw["Pace Arrow"]?.yearEnd, 2023);
  assert.equal(fw["Pace Arrow"]?.years?.includes(2024), false);
  assert.equal(fw.Storm?.years?.includes(2023), false);
  assert.equal(fw.Altitude?.years?.includes(2023), false);
  assert.equal(fw.Altitude?.years?.includes(2024), false);
  assert.equal(fw.Insight?.years?.includes(2024), false);
  assert.equal(fw.Xcursion?.yearEnd, 2024);
  assert.equal(fw.Xcursion?.years?.includes(2025), false);
  assert.equal(fw.Palisade?.years?.includes(2024), false);

  const block = src("rvData.ts");
  const disc0 = block.indexOf("    Discovery: {");
  const disc1 = block.indexOf('    "Discovery LXE"');
  const disc = block.slice(disc0, disc1);
  assert.match(disc, /"2023": \["36Q", "38K", "38N", "38W"\]/);
  assert.match(disc, /"2024": \["38N", "38W"\]/);

  const lxe0 = block.indexOf('    "Discovery LXE": {');
  const lxe1 = block.indexOf("    Frontier: {");
  const lxe = block.slice(lxe0, lxe1);
  assert.match(lxe, /"2023": \["36HQ", "40G", "40M", "44B", "44S"\]/);
  assert.match(lxe, /"2024": \["40G", "40M", "44B", "44S"\]/);

  const b0 = block.indexOf("    Bounder: {");
  const b1 = block.indexOf('    "Bounder Classic"');
  const bounder = block.slice(b0, b1);
  assert.match(bounder, /"2023": \["33C", "35GL", "35K", "36F"\]/);
  assert.match(bounder, /"2024": \["33C", "35GL", "35K", "36F"\]/);

  const fl0 = block.indexOf("    Flair: {");
  const fl1 = block.indexOf("    Fortis: {");
  const flair = block.slice(fl0, fl1);
  assert.match(flair, /"2023": \["28A", "29M", "32N", "33B6"\]/);
  assert.match(flair, /"2024": \["28A", "29M", "32N", "33B6"\]/);
  assert.doesNotMatch(flair, /Onan Diesel \/ Gas/);

  const ft0 = block.indexOf("    Fortis: {");
  const ft1 = block.indexOf("    Flex: {");
  const fortis = block.slice(ft0, ft1);
  assert.match(fortis, /"2023": \["32RW", "33HB", "34MB", "36DB", "36Y"\]/);
  assert.match(fortis, /"2024": \["32RW", "33HB", "34MB", "36Y"\]/);
  assert.match(fortis, /"2025": \["32RW", "33HB", "34MB", "36Y"\]/);

  const x0 = block.indexOf("    Xcursion: {");
  const xcursion = block.slice(x0, x0 + 1800);
  assert.match(xcursion, /floorplans: \["AL2", "SL2", "SL2E", "SL4E"\]/);
  assert.match(xcursion, /"2024": \["AL2", "SL2", "SL2E", "SL4E"\]/);
  assert.doesNotMatch(xcursion, /"19CB"|"24CB"/);
  assert.match(xcursion, /yearEnd:\s*2024/);

  const pace = findPowertrainCorrection("2023", "Fleetwood", "Pace Arrow", "33D");
  assert.ok(pace);
  assert.equal(pace!.fuelType, "Diesel");
  assert.equal(pace!.horsepower, 300);
  assert.match(pace!.chassis || "", /XCS|Freightliner/);
  const pace36 = findPowertrainCorrection("2023", "Fleetwood", "Pace Arrow", "36U");
  assert.equal(pace36!.horsepower, 340);

  const bounder23 = findPowertrainCorrection("2023", "Fleetwood", "Bounder", "35GL");
  assert.equal(bounder23!.horsepower, 350);
  const bounder24 = findPowertrainCorrection("2024", "Fleetwood", "Bounder", "35GL");
  assert.equal(bounder24!.horsepower, 335);

  const lxe40g = findPowertrainCorrection("2024", "Fleetwood", "Discovery LXE", "40G");
  assert.equal(lxe40g!.horsepower, 380);
  const lxe44s = findPowertrainCorrection("2024", "Fleetwood", "Discovery LXE", "44S");
  assert.equal(lxe44s!.horsepower, 450);

  const gtx = findPowertrainCorrection("2024", "Fleetwood", "Frontier GTX", "37RT");
  assert.equal(gtx!.horsepower, 360);
  const frontier = findPowertrainCorrection("2024", "Fleetwood", "Frontier", "34GT");
  assert.equal(frontier!.horsepower, 340);
  assert.doesNotMatch(frontier!.engine, /360HP/);
});

test("Altitude E-450 pin is 325/450 and does not apply to FS550", () => {
  const pin = findPowertrainCorrection("2026", "Fleetwood", "Altitude", "29H");
  assert.ok(pin);
  assert.equal(pin!.horsepower, 325);
  assert.equal(pin!.torqueLbFt, 450);
  assert.match(pin!.chassis || "", /E-450/);
  const superC = findPowertrainCorrection(
    "2026",
    "Fleetwood",
    "Altitude FS550",
    "30SB",
  );
  assert.ok(superC);
  assert.equal(superC!.horsepower, 335);
  assert.match(superC!.chassis || "", /F-550/);
});
