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
  assert.equal(fw.Fortis?.yearStart, 2020);
  assert.equal(fw.Fortis?.years?.includes(2023), true);
  assert.equal(fw.Fortis?.years?.includes(2024), true);
  assert.equal(fw.Frontier?.yearStart, 2022);
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

test("Fleetwood 2021–2022 walk-back: OEM plans, no invented ghosts", () => {
  const fw = CATALOG_INDEX.Fleetwood;
  assert.ok(fw);

  assert.equal(fw.Storm?.years?.includes(2021), false);
  assert.equal(fw.Storm?.years?.includes(2022), false);
  assert.equal(fw["Bounder Classic"]?.yearEnd, 2015);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2021), false);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2022), false);
  assert.equal(fw.Flex?.years?.includes(2021), false);
  assert.equal(fw.Flex?.years?.includes(2022), false);
  assert.equal(fw.Altitude?.years?.includes(2021), false);
  assert.equal(fw.Altitude?.years?.includes(2022), false);
  assert.equal(fw.Insight?.years?.includes(2022), false);
  assert.equal(fw.Palisade?.years?.includes(2022), false);
  assert.equal(fw["Frontier GTX"]?.years?.includes(2022), false);
  assert.equal(fw.Frontier?.yearStart, 2022);
  assert.equal(fw.Frontier?.years?.includes(2022), true);
  assert.equal(fw.Frontier?.years?.includes(2021), false);
  assert.equal(fw.Fortis?.yearStart, 2020);
  assert.equal(fw.Fortis?.years?.includes(2021), true);
  assert.equal(fw.Fortis?.years?.includes(2022), true);
  assert.equal(fw.Southwind?.yearStart, 2017);
  assert.equal(fw.Southwind?.years?.includes(2021), true);
  assert.equal(fw.Southwind?.years?.includes(2022), true);

  const block = src("rvData.ts");

  const disc0 = block.indexOf("    Discovery: {");
  const disc1 = block.indexOf('    "Discovery LXE"');
  const disc = block.slice(disc0, disc1);
  assert.match(disc, /"2021": \["36Q", "38F", "38K", "38N", "38W"\]/);
  assert.match(disc, /"2022": \["36Q", "38K", "38N", "38W"\]/);

  const lxe0 = block.indexOf('    "Discovery LXE": {');
  const lxe1 = block.indexOf("    Frontier: {");
  const lxe = block.slice(lxe0, lxe1);
  assert.match(lxe, /"2021": \["36HQ", "40D", "40G", "40M", "44B", "44H", "44S"\]/);
  assert.match(lxe, /"2022": \["36HQ", "40G", "40M", "44B", "44S"\]/);

  const b0 = block.indexOf("    Bounder: {");
  const b1 = block.indexOf('    "Bounder Classic"');
  const bounder = block.slice(b0, b1);
  assert.match(bounder, /"2021": \["33C", "35K", "35P", "36F"\]/);
  assert.match(bounder, /"2022": \["33C", "35GL", "35K", "36F"\]/);
  assert.doesNotMatch(bounder, /"2021": \["33C", "35K", "36H"/);

  const classic0 = block.indexOf('    "Bounder Classic": {');
  const classic1 = block.indexOf("    Southwind: {");
  const classic = block.slice(classic0, classic1);
  assert.match(classic, /yearEnd:\s*2015/);
  assert.doesNotMatch(classic, /"2021"|"2022"/);
  assert.doesNotMatch(classic, /Onan Diesel \/ Gas/);

  const sw0 = block.indexOf("    Southwind: {");
  const sw1 = block.indexOf('    "Pace Arrow"');
  const southwind = block.slice(sw0, sw1);
  assert.match(southwind, /"2021": \["34C", "35K", "36P", "37F"\]/);
  assert.match(southwind, /"2022": \["34C", "35K", "36GL", "37F"\]/);

  const pa0 = block.indexOf('    "Pace Arrow": {');
  const pa1 = block.indexOf("    Storm: {");
  const pace = block.slice(pa0, pa1);
  assert.match(pace, /"2021": \["33D", "35QS", "35RB", "35S", "36U"\]/);
  assert.match(pace, /"2022": \["33D", "36U"\]/);
  assert.doesNotMatch(pace.slice(pace.indexOf('"2021"'), pace.indexOf('"2023"')), /"35R"/);

  const fl0 = block.indexOf("    Flair: {");
  const fl1 = block.indexOf("    Fortis: {");
  const flair = block.slice(fl0, fl1);
  assert.match(flair, /"2021": \["28A", "29M", "32S", "34J", "35R"\]/);
  assert.match(flair, /"2022": \["28A", "29M", "32S", "34J", "35R"\]/);
  assert.doesNotMatch(flair, /"2021": \["28A", "30U"/);

  const ft0 = block.indexOf("    Fortis: {");
  const ft1 = block.indexOf("    Flex: {");
  const fortis = block.slice(ft0, ft1);
  assert.match(fortis, /"2021": \["32RW", "33HB", "34MB", "36DB"\]/);
  assert.match(fortis, /"2022": \["32RW", "33HB", "34MB", "36DB"\]/);
  assert.doesNotMatch(fortis, /"2021": \[.*"36Y"/);

  const fr0 = block.indexOf("    Frontier: {");
  const fr1 = block.indexOf('    "Frontier GTX"');
  const frontierSrc = block.slice(fr0, fr1);
  assert.match(frontierSrc, /"2022": \["34GT", "36SS"\]/);
  assert.doesNotMatch(frontierSrc, /"2021"/);

  const bounder21 = findPowertrainCorrection("2021", "Fleetwood", "Bounder", "35K");
  assert.equal(bounder21!.horsepower, 350);
  assert.equal(bounder21!.fuelType, "Gas");
  const bounder22 = findPowertrainCorrection("2022", "Fleetwood", "Bounder", "35GL");
  assert.equal(bounder22!.horsepower, 350);

  const lxe36 = findPowertrainCorrection("2021", "Fleetwood", "Discovery LXE", "36HQ");
  assert.equal(lxe36!.horsepower, 380);
  const lxe44s = findPowertrainCorrection("2022", "Fleetwood", "Discovery LXE", "44S");
  assert.equal(lxe44s!.horsepower, 450);
  const lxe40d = findPowertrainCorrection("2022", "Fleetwood", "Discovery LXE", "40D");
  assert.equal(lxe40d?.horsepower, 0);

  const pace33 = findPowertrainCorrection("2021", "Fleetwood", "Pace Arrow", "33D");
  assert.ok(pace33);
  assert.equal(pace33!.fuelType, "Diesel");
  assert.equal(pace33!.horsepower, 300);
  const pace35qs = findPowertrainCorrection("2021", "Fleetwood", "Pace Arrow", "35QS");
  assert.equal(pace35qs!.horsepower, 340);
  const pace35s = findPowertrainCorrection("2021", "Fleetwood", "Pace Arrow", "35S");
  assert.equal(pace35s!.horsepower, 340);
  assert.notEqual(pace35s!.engine, pace33!.engine);
  const pace22gas = findPowertrainCorrection("2022", "Fleetwood", "Pace Arrow", "33D");
  assert.equal(pace22gas!.fuelType, "Diesel");
  const pace22u = findPowertrainCorrection("2022", "Fleetwood", "Pace Arrow", "36U");
  assert.equal(pace22u!.horsepower, 340);

  const flair21 = findPowertrainCorrection("2021", "Fleetwood", "Flair", "28A");
  assert.equal(flair21!.horsepower, 350);
  const fortis21 = findPowertrainCorrection("2021", "Fleetwood", "Fortis", "32RW");
  assert.equal(fortis21!.horsepower, 350);
  const frontier22 = findPowertrainCorrection("2022", "Fleetwood", "Frontier", "34GT");
  assert.equal(frontier22!.horsepower, 340);
  assert.equal(frontier22!.fuelType, "Diesel");
  const south21 = findPowertrainCorrection("2021", "Fleetwood", "Southwind", "36P");
  assert.equal(south21!.horsepower, 350);
  assert.equal(south21!.fuelType, "Gas");
});

test("Fleetwood 2019–2020 walk-back: OEM plans, no invented ghosts", () => {
  const fw = CATALOG_INDEX.Fleetwood;
  assert.ok(fw);

  assert.equal(fw.Storm?.yearEnd, 2018);
  assert.equal(fw.Storm?.years?.includes(2019), false);
  assert.equal(fw.Storm?.years?.includes(2020), false);
  assert.equal(fw["Bounder Classic"]?.yearEnd, 2015);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2019), false);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2020), false);
  assert.equal(fw.Flex?.years?.includes(2019), false);
  assert.equal(fw.Flex?.years?.includes(2020), false);
  assert.equal(fw.Altitude?.years?.includes(2020), false);
  assert.equal(fw.Insight?.years?.includes(2020), false);
  assert.equal(fw.Frontier?.years?.includes(2020), false);
  assert.equal(fw["Frontier GTX"]?.years?.includes(2020), false);
  assert.equal(fw.Palisade?.years?.includes(2020), false);
  assert.equal(fw.Fortis?.yearStart, 2020);
  assert.equal(fw.Fortis?.years?.includes(2020), true);
  assert.equal(fw.Fortis?.years?.includes(2019), false);
  assert.equal(fw.Southwind?.yearStart, 2017);
  assert.equal(fw.Southwind?.years?.includes(2019), true);
  assert.equal(fw.Southwind?.years?.includes(2020), true);
  assert.equal(fw.Pulse?.yearEnd, 2019);
  assert.equal(fw.Pulse?.years?.includes(2019), true);
  assert.equal(fw.Pulse?.years?.includes(2020), false);

  const block = src("rvData.ts");

  const disc0 = block.indexOf("    Discovery: {");
  const disc1 = block.indexOf('    "Discovery LXE"');
  const disc = block.slice(disc0, disc1);
  assert.match(disc, /"2019": \["38F", "38K", "38N", "38W"\]/);
  assert.match(disc, /"2020": \["38F", "38K", "38N", "38W"\]/);
  assert.doesNotMatch(disc, /"2019": \["36G"/);
  assert.doesNotMatch(disc, /"2020": \["36Q"/);

  const lxe0 = block.indexOf('    "Discovery LXE": {');
  const lxe1 = block.indexOf("    Frontier: {");
  const lxe = block.slice(lxe0, lxe1);
  assert.match(lxe, /"2019": \["40D", "40G", "40M", "44B", "44H"\]/);
  assert.match(lxe, /"2020": \["40D", "40G", "40M", "44B", "44H"\]/);

  const b0 = block.indexOf("    Bounder: {");
  const b1 = block.indexOf('    "Bounder Classic"');
  const bounder = block.slice(b0, b1);
  assert.match(bounder, /"2019": \["33C", "35K", "35P", "36F", "36FP"\]/);
  assert.match(bounder, /"2020": \["33C", "35K", "35P", "36F", "36FP"\]/);
  assert.doesNotMatch(bounder, /"2019": \["33C", "35K", "36H"/);
  assert.doesNotMatch(bounder, /"2020": \["33C", "35K", "36H"/);

  const classic0 = block.indexOf('    "Bounder Classic": {');
  const classic1 = block.indexOf("    Southwind: {");
  const classic = block.slice(classic0, classic1);
  assert.match(classic, /yearEnd:\s*2015/);
  assert.doesNotMatch(classic, /"2019"|"2020"/);

  const sw0 = block.indexOf("    Southwind: {");
  const sw1 = block.indexOf('    "Pace Arrow"');
  const southwind = block.slice(sw0, sw1);
  assert.match(southwind, /"2019": \["34C", "35K", "36P", "37F", "37FP"\]/);
  assert.match(southwind, /"2020": \["34C", "35K", "36P", "37F", "37FP"\]/);

  const pa0 = block.indexOf('    "Pace Arrow": {');
  const pa1 = block.indexOf("    Storm: {");
  const pace = block.slice(pa0, pa1);
  assert.match(pace, /"2019": \["33D", "35E", "35QS", "36U"\]/);
  assert.match(pace, /"2020": \["33D", "35QS", "35RB", "35S", "36U"\]/);
  assert.doesNotMatch(pace.slice(pace.indexOf('"2019"'), pace.indexOf('"2021"')), /"35R"/);

  const fl0 = block.indexOf("    Flair: {");
  const fl1 = block.indexOf("    Fortis: {");
  const flair = block.slice(fl0, fl1);
  assert.match(flair, /"2019": \["28A", "29M", "32S", "34J", "35R"\]/);
  assert.match(flair, /"2020": \["28A", "29M", "32S", "34J", "35R"\]/);
  assert.doesNotMatch(flair, /"2019": \["28A", "30U"/);
  assert.doesNotMatch(flair, /"2020": \["28A", "30U"/);

  const ft0 = block.indexOf("    Fortis: {");
  const ft1 = block.indexOf("    Flex: {");
  const fortis = block.slice(ft0, ft1);
  assert.match(fortis, /"2020": \["33HB", "34MB"\]/);
  assert.doesNotMatch(fortis, /"2019"/);
  assert.doesNotMatch(fortis, /"2020": \[.*"32RW"/);
  assert.doesNotMatch(fortis, /"2020": \[.*"36DB"/);

  const pulse0 = block.indexOf("    Pulse: {");
  const pulse1 = block.indexOf("    Altitude: {");
  const pulse = block.slice(pulse0, pulse1);
  assert.match(pulse, /"2019": \["24A", "24B"\]/);
  assert.match(pulse, /yearEnd:\s*2019/);
  assert.doesNotMatch(pulse, /"2019": \["24A", "24D"/);

  const storm0 = block.indexOf("    Storm: {");
  const storm1 = block.indexOf("    Flair: {");
  const storm = block.slice(storm0, storm1);
  assert.match(storm, /yearEnd:\s*2018/);
  assert.doesNotMatch(storm, /"2019"|"2020"/);

  const bounder19 = findPowertrainCorrection("2019", "Fleetwood", "Bounder", "35K");
  assert.equal(bounder19!.horsepower, 320);
  assert.equal(bounder19!.torqueLbFt, 460);
  assert.equal(bounder19!.fuelType, "Gas");
  assert.match(bounder19!.engine, /V10|6\.8/);
  const bounder20 = findPowertrainCorrection("2020", "Fleetwood", "Bounder", "35P");
  assert.equal(bounder20!.horsepower, 320);
  assert.notEqual(bounder20!.horsepower, 335);

  const lxe40g = findPowertrainCorrection("2019", "Fleetwood", "Discovery LXE", "40G");
  assert.equal(lxe40g!.horsepower, 380);
  const lxe44b = findPowertrainCorrection("2020", "Fleetwood", "Discovery LXE", "44B");
  assert.equal(lxe44b!.horsepower, 450);
  const lxe36 = findPowertrainCorrection("2020", "Fleetwood", "Discovery LXE", "36HQ");
  assert.equal(lxe36?.horsepower, 0);

  const pace33 = findPowertrainCorrection("2019", "Fleetwood", "Pace Arrow", "33D");
  assert.ok(pace33);
  assert.equal(pace33!.fuelType, "Diesel");
  assert.equal(pace33!.horsepower, 300);
  const pace35e = findPowertrainCorrection("2019", "Fleetwood", "Pace Arrow", "35E");
  assert.equal(pace35e!.horsepower, 340);
  assert.equal(pace35e!.fuelType, "Diesel");
  const pace35qs = findPowertrainCorrection("2019", "Fleetwood", "Pace Arrow", "35QS");
  assert.equal(pace35qs!.horsepower, 340);
  const pace20s = findPowertrainCorrection("2020", "Fleetwood", "Pace Arrow", "35S");
  assert.equal(pace20s!.horsepower, 340);
  assert.equal(pace20s!.fuelType, "Diesel");
  const pace20gas = findPowertrainCorrection("2020", "Fleetwood", "Pace Arrow", "33D");
  assert.equal(pace20gas!.fuelType, "Diesel");
  const pace19r = findPowertrainCorrection("2019", "Fleetwood", "Pace Arrow", "35R");
  assert.equal(pace19r?.horsepower, 0);

  const flair19 = findPowertrainCorrection("2019", "Fleetwood", "Flair", "28A");
  assert.equal(flair19!.horsepower, 320);
  assert.match(flair19!.engine, /V10|6\.8/);
  const flair20 = findPowertrainCorrection("2020", "Fleetwood", "Flair", "34J");
  assert.equal(flair20!.horsepower, 320);

  const fortis20 = findPowertrainCorrection("2020", "Fleetwood", "Fortis", "33HB");
  assert.equal(fortis20!.horsepower, 320);
  assert.equal(fortis20!.fuelType, "Gas");
  assert.match(fortis20!.engine, /V10|6\.8/);

  const south19 = findPowertrainCorrection("2019", "Fleetwood", "Southwind", "37FP");
  assert.equal(south19!.horsepower, 320);
  assert.equal(south19!.fuelType, "Gas");
  const south20 = findPowertrainCorrection("2020", "Fleetwood", "Southwind", "36P");
  assert.equal(south20!.horsepower, 320);
});

test("Fleetwood 2017–2018 walk-back: OEM plans, no invented ghosts", () => {
  const fw = CATALOG_INDEX.Fleetwood;
  assert.ok(fw);

  assert.equal(fw.Storm?.yearEnd, 2018);
  assert.equal(fw.Storm?.years?.includes(2017), true);
  assert.equal(fw.Storm?.years?.includes(2018), true);
  assert.equal(fw.Storm?.years?.includes(2019), false);
  assert.equal(fw["Bounder Classic"]?.yearEnd, 2015);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2017), false);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2018), false);
  assert.equal(fw.Fortis?.yearStart, 2020);
  assert.equal(fw.Fortis?.years?.includes(2017), false);
  assert.equal(fw.Fortis?.years?.includes(2018), false);
  assert.equal(fw.Flex?.years?.includes(2017), false);
  assert.equal(fw.Altitude?.years?.includes(2018), false);
  assert.equal(fw.Insight?.years?.includes(2018), false);
  assert.equal(fw.Frontier?.years?.includes(2018), false);
  assert.equal(fw.Jamboree?.yearEnd, 2016);
  assert.equal(fw.Jamboree?.years?.includes(2017), false);
  assert.equal(fw.Tioga?.yearEnd, 2016);
  assert.equal(fw.Tioga?.years?.includes(2017), false);
  assert.equal(fw["Tioga Ranger"]?.yearEnd, 2016);
  assert.equal(fw.Southwind?.yearStart, 2017);
  assert.equal(fw.Southwind?.years?.includes(2017), true);
  assert.equal(fw.Southwind?.years?.includes(2018), true);
  assert.equal(fw.Pulse?.years?.includes(2017), false);
  assert.equal(fw.Pulse?.years?.includes(2018), true);
  assert.equal(fw.Pulse?.yearEnd, 2019);

  const block = src("rvData.ts");

  const disc0 = block.indexOf("    Discovery: {");
  const disc1 = block.indexOf('    "Discovery LXE"');
  const disc = block.slice(disc0, disc1);
  assert.match(disc, /"2017": \["37R", "38K", "39F", "39G"\]/);
  assert.match(disc, /"2018": \["37R", "38K", "39F", "39G"\]/);
  assert.doesNotMatch(disc, /"2017": \["36G"/);
  assert.doesNotMatch(disc, /"2018": \["36G"/);

  const lxe0 = block.indexOf('    "Discovery LXE": {');
  const lxe1 = block.indexOf("    Frontier: {");
  const lxe = block.slice(lxe0, lxe1);
  assert.match(lxe, /"2017": \["40D", "40E", "40G", "40X"\]/);
  assert.match(lxe, /"2018": \["38K", "39F", "40D", "40E", "40G", "40X", "44H"\]/);
  assert.doesNotMatch(lxe, /"2017": \["40G", "40M"/);
  assert.doesNotMatch(lxe, /"2018": \["40G", "40M"/);

  const b0 = block.indexOf("    Bounder: {");
  const b1 = block.indexOf('    "Bounder Classic"');
  const bounder = block.slice(b0, b1);
  assert.match(bounder, /"2017": \["33C", "34T", "35K", "35P", "36H"\]/);
  assert.match(bounder, /"2018": \["33C", "35K", "35P", "36H"\]/);
  assert.doesNotMatch(bounder, /"2017": \["33C", "35K", "36H"\]/);
  assert.doesNotMatch(bounder, /"2018": \["33C", "35K", "36H"\]/);

  const classic0 = block.indexOf('    "Bounder Classic": {');
  const classic1 = block.indexOf("    Southwind: {");
  const classic = block.slice(classic0, classic1);
  assert.match(classic, /yearEnd:\s*2015/);
  assert.doesNotMatch(classic, /"2017"|"2018"/);

  const sw0 = block.indexOf("    Southwind: {");
  const sw1 = block.indexOf('    "Pace Arrow"');
  const southwind = block.slice(sw0, sw1);
  assert.match(southwind, /"2017": \["32VS", "34A", "36L"\]/);
  assert.match(southwind, /"2018": \["34C", "35K", "36P", "37H"\]/);

  const pa0 = block.indexOf('    "Pace Arrow": {');
  const pa1 = block.indexOf("    Storm: {");
  const pace = block.slice(pa0, pa1);
  assert.match(pace, /"2017": \["33D", "35E", "35M", "36U"\]/);
  assert.match(pace, /"2018": \["33D", "35E", "35M", "36U"\]/);
  assert.doesNotMatch(pace.slice(pace.indexOf('"2017"'), pace.indexOf('"2019"')), /"35R"/);

  const fl0 = block.indexOf("    Flair: {");
  const fl1 = block.indexOf("    Fortis: {");
  const flair = block.slice(fl0, fl1);
  assert.match(flair, /"2017": \["26D", "30P", "31A", "31E"\]/);
  assert.match(flair, /"2018": \["30P", "31A", "31E"\]/);
  assert.doesNotMatch(flair, /"2017": \["28A"/);
  assert.doesNotMatch(flair, /"2018": \["28A"/);

  const ft0 = block.indexOf("    Fortis: {");
  const ft1 = block.indexOf("    Flex: {");
  const fortis = block.slice(ft0, ft1);
  assert.doesNotMatch(fortis, /"2017"/);
  assert.doesNotMatch(fortis, /"2018"/);

  const pulse0 = block.indexOf("    Pulse: {");
  const pulse1 = block.indexOf("    Altitude: {");
  const pulse = block.slice(pulse0, pulse1);
  assert.match(pulse, /"2018": \["24A", "24B", "24C", "24D"\]/);
  assert.match(pulse, /"2019": \["24A", "24B"\]/);
  assert.doesNotMatch(pulse, /"2017"/);

  const storm0 = block.indexOf("    Storm: {");
  const storm1 = block.indexOf("    Flair: {");
  const storm = block.slice(storm0, storm1);
  assert.match(storm, /"2017": \["32A", "34S", "36D", "36F"\]/);
  assert.match(storm, /"2018": \["32A", "34S", "36D", "36F"\]/);
  assert.match(storm, /yearEnd:\s*2018/);
  assert.doesNotMatch(storm, /"2017": \["28F"/);

  const bounder17 = findPowertrainCorrection("2017", "Fleetwood", "Bounder", "35K");
  assert.equal(bounder17!.horsepower, 320);
  assert.equal(bounder17!.torqueLbFt, 460);
  assert.equal(bounder17!.fuelType, "Gas");
  assert.match(bounder17!.engine, /V10|6\.8/);
  const bounder18 = findPowertrainCorrection("2018", "Fleetwood", "Bounder", "35P");
  assert.equal(bounder18!.horsepower, 320);
  assert.notEqual(bounder18!.horsepower, 335);

  const disc17 = findPowertrainCorrection("2017", "Fleetwood", "Discovery", "38K");
  assert.equal(disc17!.horsepower, 360);
  assert.equal(disc17!.fuelType, "Diesel");
  const lxe17 = findPowertrainCorrection("2017", "Fleetwood", "Discovery LXE", "40G");
  assert.equal(lxe17!.horsepower, 380);
  const lxe18k = findPowertrainCorrection("2018", "Fleetwood", "Discovery LXE", "38K");
  assert.equal(lxe18k!.horsepower, 360);
  const lxe18h = findPowertrainCorrection("2018", "Fleetwood", "Discovery LXE", "44H");
  assert.equal(lxe18h!.horsepower, 450);
  const lxe17m = findPowertrainCorrection("2017", "Fleetwood", "Discovery LXE", "40M");
  assert.equal(lxe17m?.horsepower, 0);

  const pace33 = findPowertrainCorrection("2017", "Fleetwood", "Pace Arrow", "33D");
  assert.ok(pace33);
  assert.equal(pace33!.fuelType, "Diesel");
  assert.equal(pace33!.horsepower, 300);
  const pace35m = findPowertrainCorrection("2018", "Fleetwood", "Pace Arrow", "35M");
  assert.equal(pace35m!.horsepower, 340);
  assert.equal(pace35m!.fuelType, "Diesel");
  const pace18gas = findPowertrainCorrection("2018", "Fleetwood", "Pace Arrow", "33D");
  assert.equal(pace18gas!.fuelType, "Diesel");
  const pace17r = findPowertrainCorrection("2017", "Fleetwood", "Pace Arrow", "35R");
  assert.equal(pace17r?.horsepower, 0);

  const flair17 = findPowertrainCorrection("2017", "Fleetwood", "Flair", "30P");
  assert.equal(flair17!.horsepower, 320);
  assert.match(flair17!.engine, /V10|6\.8/);
  const flair18 = findPowertrainCorrection("2018", "Fleetwood", "Flair", "31A");
  assert.equal(flair18!.horsepower, 320);

  const south17 = findPowertrainCorrection("2017", "Fleetwood", "Southwind", "32VS");
  assert.equal(south17!.horsepower, 320);
  assert.equal(south17!.fuelType, "Gas");
  const south18 = findPowertrainCorrection("2018", "Fleetwood", "Southwind", "37H");
  assert.equal(south18!.horsepower, 320);

  const storm17 = findPowertrainCorrection("2017", "Fleetwood", "Storm", "32A");
  assert.equal(storm17!.horsepower, 320);
  assert.equal(storm17!.fuelType, "Gas");

  const pulse18 = findPowertrainCorrection("2018", "Fleetwood", "Pulse", "24A");
  assert.equal(pulse18!.horsepower, 188);
  assert.equal(pulse18!.fuelType, "Diesel");
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

test("Newmar 2025–2027 OEM DigiBrochure floorplans + yearEnds", () => {
  const nm = CATALOG_INDEX.Newmar;
  assert.ok(nm);

  assert.equal(nm["Ventana LE"]?.yearEnd, 2019);
  assert.equal(nm["Ventana LE"]?.years?.includes(2025), false);
  assert.equal(nm["Kountry Star"]?.yearEnd, 2024);
  assert.equal(nm["Kountry Star"]?.years?.includes(2025), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2024), true);
  assert.equal(nm["Northern Star"]?.yearStart, 2025);
  assert.equal(nm["Northern Star"]?.years?.includes(2025), true);
  assert.equal(nm["Northern Star"]?.years?.includes(2027), true);

  assert.equal(nm["Dutch Aire"], undefined);
  assert.equal(nm["All Star"], undefined);
  assert.equal(CATALOG_INDEX["Newmar Classic"]?.["Dutch Aire"], undefined);
  assert.equal(CATALOG_INDEX["Newmar Classic"]?.["All Star"], undefined);

  assert.ok(nm["London Aire"]);
  assert.equal(nm["London Aire"].yearEnd, undefined);
  assert.equal(nm["London Aire"].years?.includes(2025), true);
  assert.equal(nm["London Aire"].years?.includes(2027), true);
  assert.equal(nm["London Aire"].years?.includes(2018), true);

  assert.equal(nm["Freedom Aire"]?.type, "Class C");
  assert.equal(nm["Super Star"]?.type, "Super C");
  assert.equal(nm["Summit Aire"]?.type, "Super C");
  assert.equal(nm["Supreme Aire"]?.type, "Super C");
  assert.equal(nm["Grand Star"]?.type, "Super C");
  assert.equal(nm["Bay Star"]?.fuelType, "Gas");
  assert.equal(nm["Bay Star Sport"]?.fuelType, "Gas");
  assert.match(nm["Canyon Star"]?.type || "", /Diesel/);

  const block = src("rvData.ts");
  const n0 = block.indexOf("  Newmar: {");
  const n1 = block.indexOf("  Tiffin: {");
  const newmar = block.slice(n0, n1);

  assert.match(newmar, /"2027": \["3836", "4081", "4311", "4325", "4340", "4345", "4369"\]/);
  assert.match(newmar, /"2027": \["4545", "4551", "4569", "4595"\]/);
  assert.match(newmar, /"2027": \["4531", "4545", "4596"\]/);
  assert.match(newmar, /"2027": \["3823", "3825", "4118", "4551"\]/);
  assert.match(newmar, /"2027": \["3543", "3545", "3547"\]/);
  assert.match(newmar, /"2027": \["3512","3809","4037","4340","4345","4369"\]/);
  assert.match(newmar, /"2027": \["4540", "4545", "4551", "4569", "4595"\]/);
  assert.match(newmar, /"2027": \["3114", "3225", "3609", "3626", "3639", "3640", "3811"\]/);
  assert.match(newmar, /"2027": \["2813", "3014", "3225"\]/);
  assert.match(newmar, /"2027": \["3947"\]/);
  assert.match(newmar, /"2027": \["2515","2512"\]/);
  assert.match(newmar, /"2027": \["3418","3709","4011","4037"\]/);
  assert.doesNotMatch(newmar, /"2025": \["3712"/);
  assert.doesNotMatch(newmar, /"2026": \["3712"/);

  const essex27 = findPowertrainCorrection("2027", "Newmar", "Essex", "4551");
  assert.equal(essex27!.horsepower, 605);
  assert.equal(essex27!.torqueLbFt, 1950);
  const ds27 = findPowertrainCorrection("2027", "Newmar", "Dutch Star", "4081");
  assert.equal(ds27!.horsepower, 450);
  assert.equal(ds27!.torqueLbFt, 1250);
  const ma27 = findPowertrainCorrection("2027", "Newmar", "Mountain Aire", "4551");
  assert.equal(ma27!.horsepower, 525);
  assert.equal(ma27!.torqueLbFt, 1695);
  const vt27 = findPowertrainCorrection("2027", "Newmar", "Ventana", "3512");
  assert.equal(vt27!.horsepower, 380);
  assert.match(vt27!.engine, /B6\.7/);
  const bay27 = findPowertrainCorrection("2027", "Newmar", "Bay Star", "3626");
  assert.equal(bay27!.horsepower, 335);
  assert.equal(bay27!.fuelType, "Gas");
  assert.doesNotMatch(bay27!.engine, /Cummins|L9|diesel/i);
  const fa26 = findPowertrainCorrection("2026", "Newmar", "Freedom Aire", "2515");
  assert.equal(fa26!.horsepower, 208);
  const fa27 = findPowertrainCorrection("2027", "Newmar", "Freedom Aire", "2515");
  assert.equal(fa27!.horsepower, 211);
  assert.match(fa27!.chassis || "", /Sprinter/);

  assert.match(newmar, /Onan 12\.5kW Quiet Diesel/);
  assert.match(newmar, /acUnits: "3 × 15,000 BTU heat pump"/);
  const kaAc = honestAcUnits({
    oem: "3 × 15,000 BTU heat pump",
    type: "Class A Diesel",
    lengthFt: 45,
    chassis: "Spartan K3",
  });
  assert.match(kaAc, /3\s*[×x]\s*15/);
  assert.doesNotMatch(kaAc, /typ\./i);

  const ns27 = findPowertrainCorrection("2027", "Newmar", "Northern Star", "3418");
  assert.equal(ns27!.horsepower, 360);
  assert.equal(ns27!.torqueLbFt, 800);
  const cs27 = findPowertrainCorrection("2027", "Newmar", "Canyon Star", "3947");
  assert.equal(cs27!.horsepower, 340);
  assert.match(cs27!.chassis || "", /front-engine|FED|Freightliner/i);
});

test("Newmar 2023–2024 walk-back: OEM plans, no invented ghosts", () => {
  const nm = CATALOG_INDEX.Newmar;
  assert.ok(nm);

  assert.equal(nm["Kountry Star"]?.yearEnd, 2024);
  assert.equal(nm["Kountry Star"]?.years?.includes(2023), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2024), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2025), false);
  assert.equal(nm["Northern Star"]?.yearStart, 2025);
  assert.equal(nm["Northern Star"]?.years?.includes(2023), false);
  assert.equal(nm["Northern Star"]?.years?.includes(2024), false);
  assert.equal(nm["Freedom Aire"]?.yearStart, 2026);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2023), false);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2024), false);
  assert.equal(nm["Summit Aire"]?.yearStart, 2026);
  assert.equal(nm["Summit Aire"]?.years?.includes(2024), false);
  assert.equal(nm["Grand Star"]?.yearStart, 2026);
  assert.equal(nm["Grand Star"]?.years?.includes(2024), false);
  assert.equal(nm["Super Star"]?.yearStart, 2020);
  assert.equal(nm["Super Star"]?.years?.includes(2020), true);
  assert.equal(nm["Super Star"]?.years?.includes(2021), true);
  assert.equal(nm["Super Star"]?.years?.includes(2023), true);
  assert.equal(nm["Super Star"]?.years?.includes(2024), true);
  assert.equal(nm["Supreme Aire"]?.yearStart, 2020);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2020), true);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2021), true);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2023), true);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2024), true);
  assert.equal(nm["London Aire"]?.years?.includes(2023), true);
  assert.equal(nm["London Aire"]?.years?.includes(2024), true);
  assert.equal(nm["London Aire"]?.yearEnd, undefined);
  assert.equal(nm["Bay Star"]?.fuelType, "Gas");
  assert.equal(nm["Bay Star Sport"]?.fuelType, "Gas");

  const block = src("rvData.ts");
  const n0 = block.indexOf("  Newmar: {");
  const n1 = block.indexOf("  Tiffin: {");
  const newmar = block.slice(n0, n1);

  const essex0 = newmar.indexOf("    Essex: {");
  const essex = newmar.slice(essex0, newmar.indexOf('    "King Aire"'));
  assert.match(essex, /"2023": \["4521", "4551", "4569", "4578", "4595"\]/);
  assert.match(essex, /"2024": \["4521", "4551", "4569", "4595"\]/);
  assert.doesNotMatch(essex, /"2023": \["4551", "4544"/);

  const ka0 = newmar.indexOf('    "King Aire": {');
  const ka = newmar.slice(ka0, newmar.indexOf('    "Mountain Aire"'));
  assert.match(ka, /"2023": \["4521", "4531", "4558", "4596"\]/);
  assert.match(ka, /"2024": \["4521", "4531", "4558", "4596"\]/);
  assert.doesNotMatch(ka, /"2023": \["45AHQ"/);

  const ma0 = newmar.indexOf('    "Mountain Aire": {');
  const ma = newmar.slice(ma0, newmar.indexOf('    "Dutch Star"'));
  assert.match(ma, /"2023": \["4118", "4521", "4535", "4551", "4586", "4591"\]/);
  assert.match(ma, /"2024": \["3823", "3825", "4118", "4551", "4591"\]/);
  assert.doesNotMatch(ma, /"2023": \["4526"/);

  const ds0 = newmar.indexOf('    "Dutch Star": {');
  const ds = newmar.slice(ds0, newmar.indexOf('    "New Aire"'));
  assert.match(
    ds,
    /"2023": \["3709", "3717", "3736", "4071", "4081", "4310", "4311", "4325", "4326", "4328", "4369", "4370"\]/,
  );
  assert.match(
    ds,
    /"2024": \["3817", "3836", "4071", "4081", "4310", "4311", "4325", "4326", "4369", "4370"\]/,
  );
  assert.doesNotMatch(ds, /"2024": \["3836", "4071", "4081", "4311", "4325", "4340", "4345"/);

  const na0 = newmar.indexOf('    "New Aire": {');
  const na = newmar.slice(na0, newmar.indexOf("    Ventana: {"));
  assert.match(na, /"2023": \["3543", "3545", "3547", "3549"\]/);
  assert.match(na, /"2024": \["3539", "3543", "3547", "3549"\]/);

  const vt0 = newmar.indexOf("    Ventana: {");
  const vt = newmar.slice(vt0, newmar.indexOf('    "Ventana LE"'));
  assert.match(
    vt,
    /"2023": \["3407","3412","3709","3717","4037","4068","4310","4326","4328","4334","4369"\]/,
  );
  assert.match(
    vt,
    /"2024": \["3507","3512","3809","3817","4037","4068","4310","4326","4328","4369"\]/,
  );
  assert.doesNotMatch(vt, /"2024": \["3717","4037","4041"\]/);

  const la0 = newmar.indexOf('    "London Aire": {');
  const la = newmar.slice(la0, newmar.indexOf('    "Kountry Star"'));
  assert.match(la, /"2023": \["4521", "4535", "4551", "4569", "4579", "4586"\]/);
  assert.match(la, /"2024": \["4521", "4535", "4551", "4569", "4579"\]/);
  assert.doesNotMatch(la, /yearEnd:\s*\d+/);

  const ks0 = newmar.indexOf('    "Kountry Star": {');
  const ks = newmar.slice(ks0, newmar.indexOf('    "Bay Star": {'));
  assert.match(
    ks,
    /"2023": \["3412", "3426", "3709", "3717", "4011", "4037", "4068", "4070"\]/,
  );
  assert.match(
    ks,
    /"2024": \["3418", "3426", "3709", "3717", "4011", "4037", "4068", "4070"\]/,
  );
  assert.match(ks, /yearEnd:\s*2024/);
  assert.doesNotMatch(ks, /"2023": \["3712"/);

  const bs0 = newmar.indexOf('    "Bay Star": {');
  const bs = newmar.slice(bs0, newmar.indexOf('    "Bay Star Sport"'));
  assert.match(
    bs,
    /"2023": \["3014", "3020", "3124", "3225", "3401", "3408", "3609", "3616", "3626", "3629", "3811"\]/,
  );
  assert.match(
    bs,
    /"2024": \["3014", "3116", "3225", "3423", "3618", "3626", "3629", "3811"\]/,
  );
  assert.match(bs, /fuelType:\s*"Gas"/);

  const bss0 = newmar.indexOf('    "Bay Star Sport": {');
  const bss = newmar.slice(bss0);
  assert.match(bss, /"2023": \["2720", "2813", "2920", "3014", "3225"\]/);
  assert.match(bss, /"2024": \["2720", "2813", "2912", "2920", "3014", "3225"\]/);

  const ss0 = newmar.indexOf('    "Super Star": {');
  const ss = newmar.slice(ss0, newmar.indexOf('    "Supreme Aire"'));
  assert.match(ss, /"2023": \["3727","3729","4059","4061","4065"\]/);
  assert.match(ss, /"2024": \["3727","3729","3731","4059","4061","4065"\]/);

  const sa0 = newmar.indexOf('    "Supreme Aire": {');
  const sa = newmar.slice(sa0, newmar.indexOf('    "Summit Aire"'));
  assert.match(sa, /"2023": \["4051","4061","4065","4509","4530","4575"\]/);
  assert.match(sa, /"2024": \["4051","4504","4509","4530"\]/);

  const cs0 = newmar.indexOf('    "Canyon Star": {');
  const cs = newmar.slice(cs0, newmar.indexOf('    "London Aire"'));
  assert.match(cs, /"2023": \["3737", "3947", "3957"\]/);
  assert.match(cs, /"2024": \["3947", "3957"\]/);

  const fa0 = newmar.indexOf('    "Freedom Aire": {');
  const fa = newmar.slice(fa0, newmar.indexOf('    "Canyon Star"'));
  assert.doesNotMatch(fa, /"2023"/);
  assert.doesNotMatch(fa, /"2024"/);

  const ns0 = newmar.indexOf('    "Northern Star": {');
  const ns = newmar.slice(ns0, newmar.indexOf('    "Grand Star"'));
  assert.doesNotMatch(ns, /"2023"/);
  assert.doesNotMatch(ns, /"2024"/);

  const essex23 = findPowertrainCorrection("2023", "Newmar", "Essex", "4551");
  assert.equal(essex23!.horsepower, 605);
  assert.equal(essex23!.torqueLbFt, 1950);
  const ka23 = findPowertrainCorrection("2023", "Newmar", "King Aire", "4531");
  assert.equal(ka23!.horsepower, 605);
  const ma23 = findPowertrainCorrection("2023", "Newmar", "Mountain Aire", "4551");
  assert.equal(ma23!.horsepower, 500);
  assert.match(ma23!.engine, /X12/);
  const ma24 = findPowertrainCorrection("2024", "Newmar", "Mountain Aire", "3825");
  assert.equal(ma24!.horsepower, 525);
  const ds23 = findPowertrainCorrection("2023", "Newmar", "Dutch Star", "4081");
  assert.equal(ds23!.horsepower, 450);
  assert.equal(ds23!.torqueLbFt, 1250);
  const vt23 = findPowertrainCorrection("2023", "Newmar", "Ventana", "3412");
  assert.equal(vt23!.horsepower, 360);
  assert.match(vt23!.engine, /B6\.7/);
  const vt23long = findPowertrainCorrection("2023", "Newmar", "Ventana", "4369");
  assert.equal(vt23long!.horsepower, 400);
  const vt24 = findPowertrainCorrection("2024", "Newmar", "Ventana", "3512");
  assert.equal(vt24!.horsepower, 380);
  assert.match(vt24!.engine, /L 380/);
  const bay23 = findPowertrainCorrection("2023", "Newmar", "Bay Star", "3626");
  assert.equal(bay23!.horsepower, 350);
  assert.equal(bay23!.fuelType, "Gas");
  assert.doesNotMatch(bay23!.engine, /Cummins|L9|diesel/i);
  const bay24 = findPowertrainCorrection("2024", "Newmar", "Bay Star", "3626");
  assert.equal(bay24!.horsepower, 335);
  assert.equal(bay24!.fuelType, "Gas");
  const sport23 = findPowertrainCorrection("2023", "Newmar", "Bay Star Sport", "2813");
  assert.equal(sport23!.horsepower, 350);
  assert.equal(sport23!.fuelType, "Gas");
  const ks23 = findPowertrainCorrection("2023", "Newmar", "Kountry Star", "4011");
  assert.equal(ks23!.horsepower, 360);
  assert.equal(ks23!.torqueLbFt, 800);
  assert.match(ks23!.engine, /B6\.7|ISB/);
  assert.doesNotMatch(ks23!.engine, /7\.3|Godzilla|F53/i);
  const sa23 = findPowertrainCorrection("2023", "Newmar", "Supreme Aire", "4051");
  assert.equal(sa23!.horsepower, 505);
  const sa24 = findPowertrainCorrection("2024", "Newmar", "Supreme Aire", "4530");
  assert.equal(sa24!.horsepower, 525);
  const ss23 = findPowertrainCorrection("2023", "Newmar", "Super Star", "3729");
  assert.equal(ss23!.horsepower, 360);
  assert.match(ss23!.chassis || "", /M2-106/);
  const cs23 = findPowertrainCorrection("2023", "Newmar", "Canyon Star", "3947");
  assert.equal(cs23!.horsepower, 340);
  const la23 = findPowertrainCorrection("2023", "Newmar", "London Aire", "4551");
  assert.equal(la23!.horsepower, 605);

  assert.equal(findPowertrainCorrection("2023", "Newmar", "Northern Star", "3418"), null);
  assert.equal(findPowertrainCorrection("2024", "Newmar", "Freedom Aire", "2515"), null);
});

test("Newmar 2021–2022 walk-back: OEM plans, no invented ghosts", () => {
  const nm = CATALOG_INDEX.Newmar;
  assert.ok(nm);

  assert.equal(nm["Kountry Star"]?.yearEnd, 2024);
  assert.equal(nm["Kountry Star"]?.years?.includes(2021), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2022), true);
  assert.equal(nm["Northern Star"]?.yearStart, 2025);
  assert.equal(nm["Northern Star"]?.years?.includes(2021), false);
  assert.equal(nm["Northern Star"]?.years?.includes(2022), false);
  assert.equal(nm["Freedom Aire"]?.yearStart, 2026);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2021), false);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2022), false);
  assert.equal(nm["Summit Aire"]?.yearStart, 2026);
  assert.equal(nm["Summit Aire"]?.years?.includes(2022), false);
  assert.equal(nm["Grand Star"]?.yearStart, 2026);
  assert.equal(nm["Grand Star"]?.years?.includes(2022), false);
  assert.equal(nm["Super Star"]?.yearStart, 2020);
  assert.equal(nm["Super Star"]?.years?.includes(2020), true);
  assert.equal(nm["Super Star"]?.years?.includes(2021), true);
  assert.equal(nm["Super Star"]?.years?.includes(2022), true);
  assert.equal(nm["Supreme Aire"]?.yearStart, 2020);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2020), true);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2021), true);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2022), true);
  assert.equal(nm["London Aire"]?.years?.includes(2021), true);
  assert.equal(nm["London Aire"]?.years?.includes(2022), true);
  assert.equal(nm["London Aire"]?.years?.includes(2019), true);
  assert.equal(nm["London Aire"]?.years?.includes(2020), true);
  assert.equal(nm["London Aire"]?.yearEnd, undefined);
  assert.equal(nm["Ventana LE"]?.yearEnd, 2019);
  assert.equal(nm["Ventana LE"]?.years?.includes(2021), false);
  assert.equal(nm["Bay Star"]?.fuelType, "Gas");
  assert.equal(nm["Bay Star Sport"]?.fuelType, "Gas");

  const block = src("rvData.ts");
  const n0 = block.indexOf("  Newmar: {");
  const n1 = block.indexOf("  Tiffin: {");
  const newmar = block.slice(n0, n1);

  const essex0 = newmar.indexOf("    Essex: {");
  const essex = newmar.slice(essex0, newmar.indexOf('    "King Aire"'));
  assert.match(essex, /"2021": \["4533", "4543", "4551", "4569", "4578", "4583"\]/);
  assert.match(essex, /"2022": \["4533", "4551", "4569", "4578"\]/);
  assert.doesNotMatch(essex, /"2021": \["4551", "4544"/);

  const ka0 = newmar.indexOf('    "King Aire": {');
  const ka = newmar.slice(ka0, newmar.indexOf('    "Mountain Aire"'));
  assert.match(ka, /"2021": \["4531", "4533", "4553"\]/);
  assert.match(ka, /"2022": \["4531", "4533", "4578"\]/);
  assert.doesNotMatch(ka, /"2021": \["45AHQ"/);

  const ma0 = newmar.indexOf('    "Mountain Aire": {');
  const ma = newmar.slice(ma0, newmar.indexOf('    "Dutch Star"'));
  assert.match(ma, /"2021": \["4102", "4118", "4533", "4535", "4543", "4551", "4583"\]/);
  assert.match(ma, /"2022": \["4118", "4533", "4535", "4543", "4551", "4589"\]/);
  assert.doesNotMatch(ma, /"2021": \["4526"/);

  const ds0 = newmar.indexOf('    "Dutch Star": {');
  const ds = newmar.slice(ds0, newmar.indexOf('    "New Aire"'));
  assert.match(
    ds,
    /"2021": \["3709", "3717", "3736", "4020", "4081", "4310", "4311", "4326", "4328", "4354", "4362", "4363", "4369"\]/,
  );
  assert.match(
    ds,
    /"2022": \["3709", "3717", "3736", "4020", "4081", "4310", "4311", "4326", "4328", "4363", "4369"\]/,
  );
  assert.doesNotMatch(ds, /"2021": \["4081", "4369", "4311", "4052"/);

  const na0 = newmar.indexOf('    "New Aire": {');
  const na = newmar.slice(na0, newmar.indexOf("    Ventana: {"));
  assert.match(na, /"2021": \["3341", "3343", "3541", "3543", "3545"\]/);
  assert.match(na, /"2022": \["3541", "3543", "3545"\]/);

  const vt0 = newmar.indexOf("    Ventana: {");
  const vt = newmar.slice(vt0, newmar.indexOf('    "Ventana LE"'));
  assert.match(
    vt,
    /"2021": \["3407","3412","3426","3709","3717","4002","4037","4311","4326","4329","4354","4362","4369"\]/,
  );
  assert.match(
    vt,
    /"2022": \["3407","3412","3426","3709","3717","4002","4037","4310","4326","4334","4369"\]/,
  );

  const la0 = newmar.indexOf('    "London Aire": {');
  const la = newmar.slice(la0, newmar.indexOf('    "Kountry Star"'));
  assert.match(la, /"2021": \["4533", "4535", "4543", "4551", "4579", "4583"\]/);
  assert.match(la, /"2022": \["4533", "4535", "4551", "4579", "4589"\]/);
  assert.doesNotMatch(la, /yearEnd:\s*\d+/);

  const ks0 = newmar.indexOf('    "Kountry Star": {');
  const ks = newmar.slice(ks0, newmar.indexOf('    "Bay Star": {'));
  assert.match(
    ks,
    /"2021": \["3412", "3426", "3709", "3717", "4002", "4011", "4037", "4045", "4067"\]/,
  );
  assert.match(
    ks,
    /"2022": \["3412", "3426", "3709", "3717", "4002", "4011", "4037", "4045"\]/,
  );
  assert.match(ks, /yearEnd:\s*2024/);
  assert.doesNotMatch(ks, /"2021": \["3712"/);

  const bs0 = newmar.indexOf('    "Bay Star": {');
  const bs = newmar.slice(bs0, newmar.indexOf('    "Bay Star Sport"'));
  assert.match(
    bs,
    /"2021": \["3005", "3014", "3124", "3226", "3312", "3401", "3408", "3414", "3609", "3616", "3626", "3811"\]/,
  );
  assert.match(
    bs,
    /"2022": \["3005", "3014", "3124", "3226", "3401", "3408", "3416", "3609", "3616", "3626", "3811"\]/,
  );
  assert.match(bs, /fuelType:\s*"Gas"/);

  const bss0 = newmar.indexOf('    "Bay Star Sport": {');
  const bss = newmar.slice(bss0);
  assert.match(bss, /"2021": \["2702", "2813", "2905", "3008", "3014", "3112", "3226", "3315"\]/);
  assert.match(bss, /"2022": \["2702", "2813", "2905", "3014", "3226", "3315", "3316"\]/);

  const ss0 = newmar.indexOf('    "Super Star": {');
  const ss = newmar.slice(ss0, newmar.indexOf('    "Supreme Aire"'));
  assert.match(ss, /"2021": \["3746","4051","4058","4061"\]/);
  assert.match(ss, /"2022": \["3727","4059","4061","4065"\]/);
  assert.match(ss, /yearStart:\s*2020/);

  const sa0 = newmar.indexOf('    "Supreme Aire": {');
  const sa = newmar.slice(sa0, newmar.indexOf('    "Summit Aire"'));
  assert.match(sa, /"2021": \["4051","4061","4573","4575","4577"\]/);
  assert.match(sa, /"2022": \["4051","4061","4573","4575","4590"\]/);
  assert.match(sa, /yearStart:\s*2020/);

  const cs0 = newmar.indexOf('    "Canyon Star": {');
  const cs = newmar.slice(cs0, newmar.indexOf('    "London Aire"'));
  assert.match(cs, /"2021": \["3513", "3710", "3719", "3722", "3747", "3911", "3927", "3929"\]/);
  assert.match(cs, /"2022": \["3513", "3710", "3722", "3927", "3929"\]/);
  assert.doesNotMatch(cs.slice(cs.indexOf('"2021"'), cs.indexOf('"2023"')), /"3947"/);

  const fa0 = newmar.indexOf('    "Freedom Aire": {');
  const fa = newmar.slice(fa0, newmar.indexOf('    "Canyon Star"'));
  assert.doesNotMatch(fa, /"2021"/);
  assert.doesNotMatch(fa, /"2022"/);

  const ns0 = newmar.indexOf('    "Northern Star": {');
  const ns = newmar.slice(ns0, newmar.indexOf('    "Grand Star"'));
  assert.doesNotMatch(ns, /"2021"/);
  assert.doesNotMatch(ns, /"2022"/);

  const sm0 = newmar.indexOf('    "Summit Aire": {');
  const sm = newmar.slice(sm0, newmar.indexOf('    "Freedom Aire"'));
  assert.doesNotMatch(sm, /"2021"/);
  assert.doesNotMatch(sm, /"2022"/);

  const gs0 = newmar.indexOf('    "Grand Star": {');
  const gs = newmar.slice(gs0, newmar.indexOf('    "Super Star"'));
  assert.doesNotMatch(gs, /"2021"/);
  assert.doesNotMatch(gs, /"2022"/);

  const essex21 = findPowertrainCorrection("2021", "Newmar", "Essex", "4551");
  assert.equal(essex21!.horsepower, 605);
  const ka21 = findPowertrainCorrection("2021", "Newmar", "King Aire", "4531");
  assert.equal(ka21!.horsepower, 605);
  const ma21 = findPowertrainCorrection("2021", "Newmar", "Mountain Aire", "4551");
  assert.equal(ma21!.horsepower, 500);
  assert.match(ma21!.engine, /X12/);
  const ma22 = findPowertrainCorrection("2022", "Newmar", "Mountain Aire", "4118");
  assert.equal(ma22!.horsepower, 500);
  const ds21 = findPowertrainCorrection("2021", "Newmar", "Dutch Star", "4081");
  assert.equal(ds21!.horsepower, 450);
  const vt21short = findPowertrainCorrection("2021", "Newmar", "Ventana", "3412");
  assert.equal(vt21short!.horsepower, 360);
  assert.match(vt21short!.engine, /B6\.7/);
  const vt21long = findPowertrainCorrection("2021", "Newmar", "Ventana", "4369");
  assert.equal(vt21long!.horsepower, 400);
  const na21short = findPowertrainCorrection("2021", "Newmar", "New Aire", "3343");
  assert.equal(na21short!.horsepower, 360);
  const na21long = findPowertrainCorrection("2021", "Newmar", "New Aire", "3543");
  assert.equal(na21long!.horsepower, 450);
  const na22 = findPowertrainCorrection("2022", "Newmar", "New Aire", "3543");
  assert.equal(na22!.horsepower, 450);
  const bay21 = findPowertrainCorrection("2021", "Newmar", "Bay Star", "3626");
  assert.equal(bay21!.horsepower, 350);
  assert.equal(bay21!.fuelType, "Gas");
  assert.doesNotMatch(bay21!.engine, /Cummins|L9|diesel/i);
  const bay22 = findPowertrainCorrection("2022", "Newmar", "Bay Star", "3811");
  assert.equal(bay22!.horsepower, 350);
  assert.equal(bay22!.fuelType, "Gas");
  const sport21 = findPowertrainCorrection("2021", "Newmar", "Bay Star Sport", "2813");
  assert.equal(sport21!.horsepower, 350);
  assert.equal(sport21!.fuelType, "Gas");
  const ks21 = findPowertrainCorrection("2021", "Newmar", "Kountry Star", "4011");
  assert.equal(ks21!.horsepower, 360);
  assert.match(ks21!.engine, /B6\.7|ISB/);
  assert.doesNotMatch(ks21!.engine, /7\.3|Godzilla|F53/i);
  const ss21 = findPowertrainCorrection("2021", "Newmar", "Super Star", "3746");
  assert.equal(ss21!.horsepower, 350);
  assert.match(ss21!.chassis || "", /M2-106/);
  const ss22 = findPowertrainCorrection("2022", "Newmar", "Super Star", "3727");
  assert.equal(ss22!.horsepower, 360);
  const sa21 = findPowertrainCorrection("2021", "Newmar", "Supreme Aire", "4051");
  assert.equal(sa21!.horsepower, 505);
  const cs21 = findPowertrainCorrection("2021", "Newmar", "Canyon Star", "3927");
  assert.equal(cs21!.horsepower, 340);
  const la21 = findPowertrainCorrection("2021", "Newmar", "London Aire", "4551");
  assert.equal(la21!.horsepower, 605);

  assert.equal(findPowertrainCorrection("2021", "Newmar", "Northern Star", "3418"), null);
  assert.equal(findPowertrainCorrection("2022", "Newmar", "Freedom Aire", "2515"), null);
});

test("Newmar 2019–2020 walk-back: OEM plans, no invented ghosts", () => {
  const nm = CATALOG_INDEX.Newmar;
  assert.ok(nm);

  assert.equal(nm["London Aire"]?.years?.includes(2019), true);
  assert.equal(nm["London Aire"]?.years?.includes(2020), true);
  assert.equal(nm["London Aire"]?.yearEnd, undefined);
  assert.equal(nm["Ventana LE"]?.yearEnd, 2019);
  assert.equal(nm["Ventana LE"]?.years?.includes(2019), true);
  assert.equal(nm["Ventana LE"]?.years?.includes(2020), false);
  assert.equal(nm["Super Star"]?.yearStart, 2020);
  assert.equal(nm["Super Star"]?.years?.includes(2019), false);
  assert.equal(nm["Super Star"]?.years?.includes(2020), true);
  assert.equal(nm["Supreme Aire"]?.yearStart, 2020);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2019), false);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2020), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2019), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2020), true);
  assert.equal(nm["Northern Star"]?.years?.includes(2019), false);
  assert.equal(nm["Northern Star"]?.years?.includes(2020), false);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2019), false);
  assert.equal(nm["Summit Aire"]?.years?.includes(2020), false);
  assert.equal(nm["Grand Star"]?.years?.includes(2020), false);
  assert.equal(nm["Bay Star"]?.fuelType, "Gas");
  assert.equal(nm["Bay Star Sport"]?.fuelType, "Gas");

  const block = src("rvData.ts");
  const n0 = block.indexOf("  Newmar: {");
  const n1 = block.indexOf("  Tiffin: {");
  const newmar = block.slice(n0, n1);

  const essex0 = newmar.indexOf("    Essex: {");
  const essex = newmar.slice(essex0, newmar.indexOf('    "King Aire"'));
  assert.match(essex, /"2019": \["4533", "4534", "4543", "4550", "4551", "4576", "4579", "4598"\]/);
  assert.match(essex, /"2020": \["4533", "4543", "4551", "4559", "4569", "4579"\]/);
  assert.doesNotMatch(essex, /"2019": \["4551", "4544"/);

  const ka0 = newmar.indexOf('    "King Aire": {');
  const ka = newmar.slice(ka0, newmar.indexOf('    "Mountain Aire"'));
  assert.match(ka, /"2019": \["4531", "4533", "4534", "4546", "4549", "4550", "4553", "4598"\]/);
  assert.match(ka, /"2020": \["4531", "4533", "4549", "4553", "4559", "4569"\]/);
  assert.doesNotMatch(ka, /"2019": \["45AHQ"/);

  const ma0 = newmar.indexOf('    "Mountain Aire": {');
  const ma = newmar.slice(ma0, newmar.indexOf('    "Dutch Star"'));
  assert.match(ma, /"2019": \["4018", "4533", "4534", "4535", "4543", "4550", "4551", "4576", "4579"\]/);
  assert.match(ma, /"2020": \["4002", "4018", "4533", "4535", "4543", "4551", "4569", "4579"\]/);
  assert.doesNotMatch(ma, /"2019": \["4526"/);

  const ds0 = newmar.indexOf('    "Dutch Star": {');
  const ds = newmar.slice(ds0, newmar.indexOf('    "New Aire"'));
  assert.match(
    ds,
    /"2019": \["3717", "3736", "4002", "4018", "4054", "4310", "4311", "4326", "4328", "4362", "4363", "4369"\]/,
  );
  assert.match(
    ds,
    /"2020": \["3709", "3717", "3736", "4020", "4054", "4081", "4310", "4311", "4326", "4328", "4362", "4363", "4369"\]/,
  );

  const na0 = newmar.indexOf('    "New Aire": {');
  const na = newmar.slice(na0, newmar.indexOf("    Ventana: {"));
  assert.match(na, /"2019": \["3341", "3343", "3345"\]/);
  assert.match(na, /"2020": \["3341", "3343", "3345", "3541", "3543", "3545"\]/);
  assert.doesNotMatch(na, /"2019": \["3543"/);

  const vt0 = newmar.indexOf("    Ventana: {");
  const vt = newmar.slice(vt0, newmar.indexOf('    "Ventana LE"'));
  assert.match(
    vt,
    /"2019": \["3407","3412","3426","3709","3717","4002","4037","4054","4310","4311","4326","4348","4369"\]/,
  );
  assert.match(
    vt,
    /"2020": \["3407","3412","3426","3709","3717","4002","4037","4054","4311","4326","4348","4362","4369"\]/,
  );
  assert.doesNotMatch(vt.slice(vt.indexOf('"2020"'), vt.indexOf('"2021"')), /"4310"/);

  const le0 = newmar.indexOf('    "Ventana LE": {');
  const le = newmar.slice(le0, newmar.indexOf('    "Northern Star"'));
  assert.match(le, /"2019": \["3412","3426","3709","3717","4002","4037","4045","4048"\]/);
  assert.match(le, /yearEnd:\s*2019/);
  assert.doesNotMatch(le, /"2020"/);

  const la0 = newmar.indexOf('    "London Aire": {');
  const la = newmar.slice(la0, newmar.indexOf('    "Kountry Star"'));
  assert.match(la, /"2019": \["4533", "4534", "4535", "4543", "4550", "4551", "4576", "4579"\]/);
  assert.match(la, /"2020": \["4533", "4535", "4543", "4551", "4559", "4569", "4579"\]/);
  assert.doesNotMatch(la, /yearEnd:\s*\d+/);

  const ks0 = newmar.indexOf('    "Kountry Star": {');
  const ks = newmar.slice(ks0, newmar.indexOf('    "Bay Star": {'));
  assert.match(
    ks,
    /"2020": \["3412", "3426", "3709", "3717", "4002", "4037", "4045", "4054"\]/,
  );
  assert.doesNotMatch(ks, /"2019"/);

  const bs0 = newmar.indexOf('    "Bay Star": {');
  const bs = newmar.slice(bs0, newmar.indexOf('    "Bay Star Sport"'));
  assert.match(
    bs,
    /"2019": \["3014", "3124", "3226", "3401", "3408", "3414", "3419", "3609", "3626", "3628"\]/,
  );
  assert.match(
    bs,
    /"2020": \["3005", "3014", "3124", "3226", "3312", "3401", "3408", "3414", "3609", "3616", "3626"\]/,
  );
  assert.doesNotMatch(bs.slice(bs.indexOf('"2019"'), bs.indexOf('"2021"')), /"3811"/);

  const bss0 = newmar.indexOf('    "Bay Star Sport": {');
  const bss = newmar.slice(bss0);
  assert.match(bss, /"2019": \["2702", "2813", "3008", "3014", "3226", "3307"\]/);
  assert.match(bss, /"2020": \["2702", "2813", "2905", "3008", "3014", "3112", "3226", "3315"\]/);

  const ss0 = newmar.indexOf('    "Super Star": {');
  const ss = newmar.slice(ss0, newmar.indexOf('    "Supreme Aire"'));
  assert.match(ss, /"2020": \["3746","4051","4058","4061"\]/);
  assert.match(ss, /yearStart:\s*2020/);
  assert.doesNotMatch(ss, /"2019"/);

  const sa0 = newmar.indexOf('    "Supreme Aire": {');
  const sa = newmar.slice(sa0, newmar.indexOf('    "Summit Aire"'));
  assert.match(sa, /"2020": \["4573","4575","4577"\]/);
  assert.match(sa, /yearStart:\s*2020/);
  assert.doesNotMatch(sa, /"2019"/);

  const cs0 = newmar.indexOf('    "Canyon Star": {');
  const cs = newmar.slice(cs0, newmar.indexOf('    "London Aire"'));
  assert.match(cs, /"2019": \["3513", "3608", "3627", "3646", "3710", "3719", "3722", "3723", "3911", "3924", "3927"\]/);
  assert.match(cs, /"2020": \["3513", "3627", "3710", "3719", "3722", "3747", "3911", "3927", "3929"\]/);
  assert.doesNotMatch(cs.slice(cs.indexOf('"2019"'), cs.indexOf('"2021"')), /"3947"/);

  const essex19 = findPowertrainCorrection("2019", "Newmar", "Essex", "4551");
  assert.equal(essex19!.horsepower, 605);
  const ka19 = findPowertrainCorrection("2019", "Newmar", "King Aire", "4531");
  assert.equal(ka19!.horsepower, 605);
  const la19 = findPowertrainCorrection("2019", "Newmar", "London Aire", "4551");
  assert.equal(la19!.horsepower, 605);
  const ma19 = findPowertrainCorrection("2019", "Newmar", "Mountain Aire", "4551");
  assert.equal(ma19!.horsepower, 500);
  assert.match(ma19!.engine, /X12/);
  const ma20 = findPowertrainCorrection("2020", "Newmar", "Mountain Aire", "4579");
  assert.equal(ma20!.horsepower, 500);
  const ds19 = findPowertrainCorrection("2019", "Newmar", "Dutch Star", "4369");
  assert.equal(ds19!.horsepower, 450);
  const na19 = findPowertrainCorrection("2019", "Newmar", "New Aire", "3343");
  assert.equal(na19!.horsepower, 360);
  const na20short = findPowertrainCorrection("2020", "Newmar", "New Aire", "3345");
  assert.equal(na20short!.horsepower, 360);
  const na20long = findPowertrainCorrection("2020", "Newmar", "New Aire", "3543");
  assert.equal(na20long!.horsepower, 450);
  const vt19short = findPowertrainCorrection("2019", "Newmar", "Ventana", "3412");
  assert.equal(vt19short!.horsepower, 360);
  const vt19long = findPowertrainCorrection("2019", "Newmar", "Ventana", "4369");
  assert.equal(vt19long!.horsepower, 400);
  const vt20 = findPowertrainCorrection("2020", "Newmar", "Ventana", "4362");
  assert.equal(vt20!.horsepower, 400);
  const le19short = findPowertrainCorrection("2019", "Newmar", "Ventana LE", "3412");
  assert.equal(le19short!.horsepower, 340);
  const le193709 = findPowertrainCorrection("2019", "Newmar", "Ventana LE", "3709");
  assert.equal(le193709!.horsepower, 360);
  const bay19 = findPowertrainCorrection("2019", "Newmar", "Bay Star", "3626");
  assert.equal(bay19!.horsepower, 320);
  assert.equal(bay19!.fuelType, "Gas");
  assert.match(bay19!.engine, /V10|Triton/i);
  assert.doesNotMatch(bay19!.engine, /7\.3|Godzilla|Cummins|L9|diesel/i);
  const bay20 = findPowertrainCorrection("2020", "Newmar", "Bay Star", "3626");
  assert.equal(bay20!.horsepower, 320);
  assert.equal(bay20!.fuelType, "Gas");
  const sport20 = findPowertrainCorrection("2020", "Newmar", "Bay Star Sport", "2813");
  assert.equal(sport20!.horsepower, 320);
  assert.equal(sport20!.fuelType, "Gas");
  const cs19 = findPowertrainCorrection("2019", "Newmar", "Canyon Star", "3927");
  assert.equal(cs19!.horsepower, 320);
  assert.equal(cs19!.fuelType, "Gas");
  assert.match(cs19!.engine, /V10|Triton/i);
  const cs20 = findPowertrainCorrection("2020", "Newmar", "Canyon Star", "3513");
  assert.equal(cs20!.horsepower, 320);
  assert.equal(cs20!.fuelType, "Gas");
  const ss20 = findPowertrainCorrection("2020", "Newmar", "Super Star", "3746");
  assert.equal(ss20!.horsepower, 350);
  assert.match(ss20!.chassis || "", /M2-106/);
  const sa20 = findPowertrainCorrection("2020", "Newmar", "Supreme Aire", "4573");
  assert.equal(sa20!.horsepower, 505);
  const ks20 = findPowertrainCorrection("2020", "Newmar", "Kountry Star", "4054");
  assert.equal(ks20!.horsepower, 360);

  assert.equal(findPowertrainCorrection("2019", "Newmar", "Super Star", "3746"), null);
  assert.equal(findPowertrainCorrection("2019", "Newmar", "Supreme Aire", "4573"), null);
  assert.equal(findPowertrainCorrection("2019", "Newmar", "Northern Star", "3418"), null);
  assert.equal(findPowertrainCorrection("2020", "Newmar", "Ventana LE", "3709"), null);
});

test("Newmar 2017–2018 walk-back: OEM plans, no invented ghosts", () => {
  const nm = CATALOG_INDEX.Newmar;
  assert.ok(nm);

  assert.equal(nm["London Aire"]?.years?.includes(2017), true);
  assert.equal(nm["London Aire"]?.years?.includes(2018), true);
  assert.equal(nm["London Aire"]?.yearEnd, undefined);
  assert.equal(nm["Ventana LE"]?.yearEnd, 2019);
  assert.equal(nm["Ventana LE"]?.years?.includes(2017), true);
  assert.equal(nm["Ventana LE"]?.years?.includes(2018), true);
  assert.equal(nm["Ventana LE"]?.years?.includes(2020), false);
  assert.equal(nm["New Aire"]?.years?.includes(2017), false);
  assert.equal(nm["New Aire"]?.years?.includes(2018), true);
  assert.equal(nm["Super Star"]?.yearStart, 2020);
  assert.equal(nm["Super Star"]?.years?.includes(2017), false);
  assert.equal(nm["Super Star"]?.years?.includes(2018), false);
  assert.equal(nm["Supreme Aire"]?.yearStart, 2020);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2017), false);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2018), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2017), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2018), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2020), true);
  assert.equal(nm["Northern Star"]?.years?.includes(2017), false);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2018), false);
  assert.equal(nm["Summit Aire"]?.years?.includes(2018), false);
  assert.equal(nm["Grand Star"]?.years?.includes(2018), false);

  const block = src("rvData.ts");
  const n0 = block.indexOf("  Newmar: {");
  const n1 = block.indexOf("  Tiffin: {");
  const newmar = block.slice(n0, n1);

  const essex0 = newmar.indexOf("    Essex: {");
  const essex = newmar.slice(essex0, newmar.indexOf('    "King Aire"'));
  assert.match(essex, /"2017": \["4513", "4519", "4533", "4553", "4584", "4598"\]/);
  assert.match(essex, /"2018": \["4531", "4533", "4534", "4536", "4537", "4553", "4598"\]/);
  assert.doesNotMatch(essex, /"2017": \["4551", "4544"/);

  const ka0 = newmar.indexOf('    "King Aire": {');
  const ka = newmar.slice(ka0, newmar.indexOf('    "Mountain Aire"'));
  assert.match(ka, /"2017": \["4513", "4519", "4533", "4553", "4584", "4598"\]/);
  assert.match(ka, /"2018": \["4531", "4533", "4534", "4536", "4537", "4553", "4598"\]/);
  assert.doesNotMatch(ka, /"2017": \["45AHQ"/);

  const ma0 = newmar.indexOf('    "Mountain Aire": {');
  const ma = newmar.slice(ma0, newmar.indexOf('    "Dutch Star"'));
  assert.match(ma, /"2017": \["4513", "4519", "4525", "4533", "4553", "4584"\]/);
  assert.match(ma, /"2018": \["4047", "4531", "4533", "4534", "4535", "4536", "4537", "4553"\]/);
  assert.doesNotMatch(ma, /"2017": \["4526"/);

  const ds0 = newmar.indexOf('    "Dutch Star": {');
  const ds = newmar.slice(ds0, newmar.indexOf('    "New Aire"'));
  assert.match(
    ds,
    /"2017": \["3724", "3736", "4002", "4018", "4041", "4054", "4310", "4311", "4369", "4381"\]/,
  );
  assert.match(
    ds,
    /"2018": \["3718", "3736", "4002", "4018", "4052", "4310", "4311", "4326", "4327", "4362", "4369"\]/,
  );
  assert.doesNotMatch(ds, /"2017": \["4018", "4081"/);

  const na0 = newmar.indexOf('    "New Aire": {');
  const na = newmar.slice(na0, newmar.indexOf("    Ventana: {"));
  assert.match(na, /"2018": \["3341", "3343"\]/);
  assert.doesNotMatch(na, /"2017"/);
  assert.doesNotMatch(na, /"2018": \["3543"/);

  const vt0 = newmar.indexOf("    Ventana: {");
  const vt = newmar.slice(vt0, newmar.indexOf('    "Ventana LE"'));
  assert.match(
    vt,
    /"2017": \["3412","3436","3709","3724","4002","4037","4041","4310","4311","4322","4369"\]/,
  );
  assert.match(
    vt,
    /"2018": \["3407","3412","3436","3709","3715","4002","4037","4046","4049","4308","4310","4311","4326","4369"\]/,
  );
  assert.doesNotMatch(vt, /"2017": \["3436","3717"/);

  const le0 = newmar.indexOf('    "Ventana LE": {');
  const le = newmar.slice(le0, newmar.indexOf('    "Northern Star"'));
  assert.match(le, /"2017": \["3412","3436","3709","3724","4002","4037","4042","4044"\]/);
  assert.match(le, /"2018": \["3412","3413","3436","3709","3713","4002","4037","4042","4048"\]/);
  assert.match(le, /yearEnd:\s*2019/);

  const la0 = newmar.indexOf('    "London Aire": {');
  const la = newmar.slice(la0, newmar.indexOf('    "Kountry Star"'));
  assert.match(la, /"2017": \["4513", "4519", "4525", "4533", "4553", "4584"\]/);
  assert.match(la, /"2018": \["4531", "4533", "4534", "4535", "4536", "4537", "4553"\]/);
  assert.doesNotMatch(la, /yearEnd:\s*\d+/);

  const ks0 = newmar.indexOf('    "Kountry Star": {');
  const ks = newmar.slice(ks0, newmar.indexOf('    "Bay Star": {'));
  assert.doesNotMatch(ks, /"2017"/);
  assert.doesNotMatch(ks, /"2018"/);
  assert.match(ks, /yearEnd:\s*2024/);

  const bs0 = newmar.indexOf('    "Bay Star": {');
  const bs = newmar.slice(bs0, newmar.indexOf('    "Bay Star Sport"'));
  assert.match(
    bs,
    /"2017": \["3009", "3113", "3124", "3208", "3306", "3333", "3401", "3403", "3516", "3518"\]/,
  );
  assert.match(
    bs,
    /"2018": \["3009", "3113", "3124", "3333", "3401", "3403", "3406", "3414", "3518", "3532"\]/,
  );
  assert.match(bs, /fuelType:\s*"Gas"/);

  const bss0 = newmar.indexOf('    "Bay Star Sport": {');
  const bss = newmar.slice(bss0);
  assert.match(bss, /"2017": \["2702", "2812", "2903", "3013", "3208", "3210", "3306"\]/);
  assert.match(bss, /"2018": \["2702", "2812", "2903", "3113", "3307", "3312"\]/);

  const ss0 = newmar.indexOf('    "Super Star": {');
  const ss = newmar.slice(ss0, newmar.indexOf('    "Supreme Aire"'));
  assert.doesNotMatch(ss, /"2017"/);
  assert.doesNotMatch(ss, /"2018"/);
  assert.match(ss, /yearStart:\s*2020/);

  const sa0 = newmar.indexOf('    "Supreme Aire": {');
  const sa = newmar.slice(sa0, newmar.indexOf('    "Summit Aire"'));
  assert.doesNotMatch(sa, /"2017"/);
  assert.doesNotMatch(sa, /"2018"/);
  assert.match(sa, /yearStart:\s*2020/);

  const cs0 = newmar.indexOf('    "Canyon Star": {');
  const cs = newmar.slice(cs0, newmar.indexOf('    "London Aire"'));
  assert.match(
    cs,
    /"2017": \["3513", "3710", "3902", "3911", "3914", "3921", "3923", "3925", "3953"\]/,
  );
  assert.match(
    cs,
    /"2018": \["3513", "3710", "3716", "3901", "3911", "3918", "3921", "3923", "3924", "3926", "3928", "3953"\]/,
  );
  assert.doesNotMatch(cs.slice(cs.indexOf('"2017"'), cs.indexOf('"2019"')), /"3947"/);

  const essex17 = findPowertrainCorrection("2017", "Newmar", "Essex", "4533");
  assert.equal(essex17!.horsepower, 600);
  assert.match(essex17!.engine, /ISX/);
  const essex18 = findPowertrainCorrection("2018", "Newmar", "Essex", "4533");
  assert.equal(essex18!.horsepower, 605);
  assert.match(essex18!.engine, /X15/);
  const ka17 = findPowertrainCorrection("2017", "Newmar", "King Aire", "4553");
  assert.equal(ka17!.horsepower, 600);
  const ka18 = findPowertrainCorrection("2018", "Newmar", "King Aire", "4531");
  assert.equal(ka18!.horsepower, 605);
  const la17 = findPowertrainCorrection("2017", "Newmar", "London Aire", "4533");
  assert.equal(la17!.horsepower, 600);
  const la18 = findPowertrainCorrection("2018", "Newmar", "London Aire", "4531");
  assert.equal(la18!.horsepower, 605);
  const ma17 = findPowertrainCorrection("2017", "Newmar", "Mountain Aire", "4533");
  assert.equal(ma17!.horsepower, 500);
  assert.match(ma17!.engine, /ISX/);
  assert.doesNotMatch(ma17!.engine, /L9|450/);
  const ma18 = findPowertrainCorrection("2018", "Newmar", "Mountain Aire", "4047");
  assert.equal(ma18!.horsepower, 500);
  assert.doesNotMatch(ma18!.engine, /L9|450|525/);
  const ds17 = findPowertrainCorrection("2017", "Newmar", "Dutch Star", "3736");
  assert.equal(ds17!.horsepower, 450);
  assert.match(ds17!.engine, /ISL/);
  const ds18 = findPowertrainCorrection("2018", "Newmar", "Dutch Star", "3718");
  assert.equal(ds18!.horsepower, 450);
  const vt17short = findPowertrainCorrection("2017", "Newmar", "Ventana", "3412");
  assert.equal(vt17short!.horsepower, 360);
  const vt17long = findPowertrainCorrection("2017", "Newmar", "Ventana", "4369");
  assert.equal(vt17long!.horsepower, 400);
  const vt18short = findPowertrainCorrection("2018", "Newmar", "Ventana", "3407");
  assert.equal(vt18short!.horsepower, 360);
  const vt18long = findPowertrainCorrection("2018", "Newmar", "Ventana", "4308");
  assert.equal(vt18long!.horsepower, 400);
  const le17short = findPowertrainCorrection("2017", "Newmar", "Ventana LE", "3412");
  assert.equal(le17short!.horsepower, 340);
  const le17long = findPowertrainCorrection("2017", "Newmar", "Ventana LE", "4044");
  assert.equal(le17long!.horsepower, 360);
  const le18short = findPowertrainCorrection("2018", "Newmar", "Ventana LE", "3713");
  assert.equal(le18short!.horsepower, 340);
  const le18long = findPowertrainCorrection("2018", "Newmar", "Ventana LE", "4048");
  assert.equal(le18long!.horsepower, 360);
  const na18 = findPowertrainCorrection("2018", "Newmar", "New Aire", "3343");
  assert.equal(na18!.horsepower, 360);
  assert.doesNotMatch(na18!.engine, /L9|450/);
  const bay17 = findPowertrainCorrection("2017", "Newmar", "Bay Star", "3124");
  assert.equal(bay17!.horsepower, 320);
  assert.equal(bay17!.fuelType, "Gas");
  assert.match(bay17!.engine, /V10|Triton/i);
  const bay18 = findPowertrainCorrection("2018", "Newmar", "Bay Star", "3414");
  assert.equal(bay18!.horsepower, 320);
  assert.equal(bay18!.fuelType, "Gas");
  const sport17 = findPowertrainCorrection("2017", "Newmar", "Bay Star Sport", "2702");
  assert.equal(sport17!.horsepower, 320);
  assert.equal(sport17!.fuelType, "Gas");
  const sport18 = findPowertrainCorrection("2018", "Newmar", "Bay Star Sport", "3307");
  assert.equal(sport18!.horsepower, 320);
  assert.equal(sport18!.fuelType, "Gas");
  const cs17 = findPowertrainCorrection("2017", "Newmar", "Canyon Star", "3911");
  assert.equal(cs17!.horsepower, 320);
  assert.equal(cs17!.fuelType, "Gas");
  assert.match(cs17!.engine, /V10|Triton/i);
  assert.doesNotMatch(cs17!.engine, /Cummins|B6\.7|FED|diesel/i);
  const cs18 = findPowertrainCorrection("2018", "Newmar", "Canyon Star", "3513");
  assert.equal(cs18!.horsepower, 320);
  assert.equal(cs18!.fuelType, "Gas");

  assert.equal(findPowertrainCorrection("2017", "Newmar", "Super Star", "3746"), null);
  assert.equal(findPowertrainCorrection("2018", "Newmar", "Supreme Aire", "4573"), null);
  assert.equal(findPowertrainCorrection("2017", "Newmar", "Kountry Star", "3712"), null);
  assert.equal(findPowertrainCorrection("2018", "Newmar", "Northern Star", "3418"), null);
  assert.equal(findPowertrainCorrection("2017", "Newmar", "New Aire", "3341"), null);
});

test("Newmar 2015–2016 walk-back: OEM plans, no invented ghosts", () => {
  const nm = CATALOG_INDEX.Newmar;
  assert.ok(nm);

  assert.equal(nm["London Aire"]?.years?.includes(2015), true);
  assert.equal(nm["London Aire"]?.years?.includes(2016), true);
  assert.equal(nm["London Aire"]?.yearEnd, undefined);
  assert.equal(nm["Ventana LE"]?.yearEnd, 2019);
  assert.equal(nm["Ventana LE"]?.years?.includes(2015), true);
  assert.equal(nm["Ventana LE"]?.years?.includes(2016), true);
  assert.equal(nm["New Aire"]?.years?.includes(2015), false);
  assert.equal(nm["New Aire"]?.years?.includes(2016), false);
  assert.equal(nm["New Aire"]?.years?.includes(2014), true);
  assert.equal(nm["New Aire"]?.years?.includes(2018), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2015), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2016), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2014), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2020), true);
  assert.equal(nm["Kountry Star"]?.yearEnd, 2024);
  assert.equal(nm["Super Star"]?.years?.includes(2015), false);
  assert.equal(nm["Super Star"]?.years?.includes(2016), false);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2015), false);
  assert.equal(nm["Northern Star"]?.years?.includes(2016), false);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2016), false);
  assert.equal(nm["Summit Aire"]?.years?.includes(2016), false);
  assert.equal(nm["Grand Star"]?.years?.includes(2016), false);

  const block = src("rvData.ts");
  const n0 = block.indexOf("  Newmar: {");
  const n1 = block.indexOf("  Tiffin: {");
  const newmar = block.slice(n0, n1);

  const essex0 = newmar.indexOf("    Essex: {");
  const essex = newmar.slice(essex0, newmar.indexOf('    "King Aire"'));
  assert.match(essex, /"2015": \["4501", "4503", "4553", "4568", "4599"\]/);
  assert.match(essex, /"2016": \["4503", "4507", "4518", "4519", "4553", "4565", "4598"\]/);
  assert.doesNotMatch(essex, /"2015": \["4551", "4544"/);
  assert.match(essex, /"2017": \["4513", "4519", "4533", "4553", "4584", "4598"\]/);

  const ka0 = newmar.indexOf('    "King Aire": {');
  const ka = newmar.slice(ka0, newmar.indexOf('    "Mountain Aire"'));
  assert.match(ka, /"2015": \["4501", "4503", "4553", "4568", "4599"\]/);
  assert.match(ka, /"2016": \["4503", "4507", "4518", "4519", "4553", "4565", "4598"\]/);
  assert.doesNotMatch(ka, /"2015": \["45AHQ"/);

  const ma0 = newmar.indexOf('    "Mountain Aire": {');
  const ma = newmar.slice(ma0, newmar.indexOf('    "Dutch Star"'));
  assert.match(ma, /"2015": \["4501", "4503", "4553", "4568", "4599"\]/);
  assert.match(ma, /"2016": \["4503", "4518", "4519", "4553", "4565", "4598"\]/);
  assert.doesNotMatch(ma, /"2015": \["4536", "4553", "4304"\]/);

  const ds0 = newmar.indexOf('    "Dutch Star": {');
  const ds = newmar.slice(ds0, newmar.indexOf('    "New Aire"'));
  assert.match(
    ds,
    /"2015": \["3736", "3745", "4002", "4018", "4311", "4312", "4313", "4360", "4366", "4369", "4372", "4375", "4381"\]/,
  );
  assert.match(
    ds,
    /"2016": \["3726", "3736", "4002", "4018", "4041", "4311", "4312", "4313", "4369", "4381"\]/,
  );
  assert.doesNotMatch(ds, /"2015": \["4018", "4081"/);

  const na0 = newmar.indexOf('    "New Aire": {');
  const na = newmar.slice(na0, newmar.indexOf("    Ventana: {"));
  assert.doesNotMatch(na, /"2015"/);
  assert.doesNotMatch(na, /"2016"/);
  assert.match(na, /"2014": \["3543", "3545", "3831"\]/);
  assert.match(na, /"2018": \["3341", "3343"\]/);

  const vt0 = newmar.indexOf("    Ventana: {");
  const vt = newmar.slice(vt0, newmar.indexOf('    "Ventana LE"'));
  assert.match(
    vt,
    /"2015": \["3436","3437","3635","3636","4002","4003","4037","4311","4315","4360","4369","4375","4381"\]/,
  );
  assert.match(
    vt,
    /"2016": \["3427","3436","3709","3725","4002","4037","4041","4311","4316","4322","4369","4381"\]/,
  );
  assert.doesNotMatch(vt, /"2015": \["3436","3717"/);

  const le0 = newmar.indexOf('    "Ventana LE": {');
  const le = newmar.slice(le0, newmar.indexOf('    "Northern Star"'));
  assert.match(le, /"2015": \["3436","3437","3635","3636","3802","3812","3849","3850"\]/);
  assert.match(le, /"2016": \["3427","3436","3709","3725","4002","4037","4040","4044"\]/);
  assert.match(le, /yearEnd:\s*2019/);
  assert.doesNotMatch(le.slice(le.indexOf('"2015"'), le.indexOf('"2016"')), /"4002"/);

  const la0 = newmar.indexOf('    "London Aire": {');
  const la = newmar.slice(la0, newmar.indexOf('    "Kountry Star"'));
  assert.match(la, /"2015": \["4501", "4503", "4553", "4568", "4599"\]/);
  assert.match(la, /"2016": \["4503", "4518", "4519", "4553", "4565", "4598"\]/);
  assert.doesNotMatch(la, /"2016": \["4503", "4507"/);
  assert.doesNotMatch(la, /yearEnd:\s*\d+/);

  const ks0 = newmar.indexOf('    "Kountry Star": {');
  const ks = newmar.slice(ks0, newmar.indexOf('    "Bay Star": {'));
  assert.doesNotMatch(ks, /"2015"/);
  assert.doesNotMatch(ks, /"2016"/);
  assert.match(ks, /yearEnd:\s*2024/);

  const bs0 = newmar.indexOf('    "Bay Star": {');
  const bs = newmar.slice(bs0, newmar.indexOf('    "Bay Star Sport"'));
  assert.match(
    bs,
    /"2015": \["2903", "3103", "3124", "3215", "3308", "3401", "3402"\]/,
  );
  assert.match(
    bs,
    /"2016": \["3004", "3124", "3227", "3401", "3402", "3403", "3404", "3518"\]/,
  );
  assert.match(bs, /fuelType:\s*"Gas"/);
  assert.doesNotMatch(bs, /"2015": \["3124", "3401", "3626"\]/);

  const bss0 = newmar.indexOf('    "Bay Star Sport": {');
  const bss = newmar.slice(bss0);
  assert.match(bss, /"2015": \["2702", "2707", "2903", "3022", "3220", "3306", "3309"\]/);
  assert.match(bss, /"2016": \["2702", "2705", "2903", "3004", "3227", "3306", "3404"\]/);

  const cs0 = newmar.indexOf('    "Canyon Star": {');
  const cs = newmar.slice(cs0, newmar.indexOf('    "London Aire"'));
  assert.match(
    cs,
    /"2015": \["3424", "3610", "3612", "3650", "3911", "3913", "3914", "3919", "3920", "3921", "3941", "3953"\]/,
  );
  assert.match(
    cs,
    /"2016": \["3710", "3712", "3755", "3903", "3911", "3914", "3921", "3922", "3944", "3953"\]/,
  );
  assert.doesNotMatch(cs.slice(cs.indexOf('"2015"'), cs.indexOf('"2017"')), /"3947"/);
  assert.doesNotMatch(cs, /"2015": \["3710", "3927"\]/);

  const essex15 = findPowertrainCorrection("2015", "Newmar", "Essex", "4553");
  assert.equal(essex15!.horsepower, 600);
  assert.match(essex15!.engine, /ISX/);
  const essex16 = findPowertrainCorrection("2016", "Newmar", "Essex", "4507");
  assert.equal(essex16!.horsepower, 600);
  const ka15 = findPowertrainCorrection("2015", "Newmar", "King Aire", "4599");
  assert.equal(ka15!.horsepower, 600);
  const ka16 = findPowertrainCorrection("2016", "Newmar", "King Aire", "4518");
  assert.equal(ka16!.horsepower, 600);
  const la15 = findPowertrainCorrection("2015", "Newmar", "London Aire", "4501");
  assert.equal(la15!.horsepower, 600);
  const la16 = findPowertrainCorrection("2016", "Newmar", "London Aire", "4598");
  assert.equal(la16!.horsepower, 600);
  const ma15 = findPowertrainCorrection("2015", "Newmar", "Mountain Aire", "4553");
  assert.equal(ma15!.horsepower, 500);
  assert.match(ma15!.engine, /ISX/);
  assert.doesNotMatch(ma15!.engine, /L9|450/);
  const ma16 = findPowertrainCorrection("2016", "Newmar", "Mountain Aire", "4519");
  assert.equal(ma16!.horsepower, 500);
  assert.doesNotMatch(ma16!.engine, /L9|450|525/);
  const ds15 = findPowertrainCorrection("2015", "Newmar", "Dutch Star", "3736");
  assert.equal(ds15!.horsepower, 450);
  assert.match(ds15!.engine, /ISL/);
  const ds16 = findPowertrainCorrection("2016", "Newmar", "Dutch Star", "3726");
  assert.equal(ds16!.horsepower, 450);
  const vt15short = findPowertrainCorrection("2015", "Newmar", "Ventana", "3436");
  assert.equal(vt15short!.horsepower, 360);
  const vt15long = findPowertrainCorrection("2015", "Newmar", "Ventana", "4369");
  assert.equal(vt15long!.horsepower, 400);
  const vt16short = findPowertrainCorrection("2016", "Newmar", "Ventana", "3427");
  assert.equal(vt16short!.horsepower, 360);
  const vt16long = findPowertrainCorrection("2016", "Newmar", "Ventana", "4316");
  assert.equal(vt16long!.horsepower, 400);
  const le15 = findPowertrainCorrection("2015", "Newmar", "Ventana LE", "3436");
  assert.equal(le15!.horsepower, 340);
  const le15b = findPowertrainCorrection("2015", "Newmar", "Ventana LE", "3850");
  assert.equal(le15b!.horsepower, 340);
  const le16short = findPowertrainCorrection("2016", "Newmar", "Ventana LE", "3427");
  assert.equal(le16short!.horsepower, 340);
  const le16long = findPowertrainCorrection("2016", "Newmar", "Ventana LE", "4044");
  assert.equal(le16long!.horsepower, 360);
  const bay15 = findPowertrainCorrection("2015", "Newmar", "Bay Star", "3124");
  assert.equal(bay15!.horsepower, 362);
  assert.equal(bay15!.fuelType, "Gas");
  assert.match(bay15!.engine, /V10|Triton/i);
  const bay16 = findPowertrainCorrection("2016", "Newmar", "Bay Star", "3518");
  assert.equal(bay16!.horsepower, 362);
  assert.equal(bay16!.fuelType, "Gas");
  const bay17 = findPowertrainCorrection("2017", "Newmar", "Bay Star", "3124");
  assert.equal(bay17!.horsepower, 320);
  const sport15 = findPowertrainCorrection("2015", "Newmar", "Bay Star Sport", "2702");
  assert.equal(sport15!.horsepower, 362);
  assert.equal(sport15!.fuelType, "Gas");
  const sport16 = findPowertrainCorrection("2016", "Newmar", "Bay Star Sport", "3404");
  assert.equal(sport16!.horsepower, 362);
  const cs15 = findPowertrainCorrection("2015", "Newmar", "Canyon Star", "3911");
  assert.equal(cs15!.horsepower, 362);
  assert.equal(cs15!.fuelType, "Gas");
  assert.match(cs15!.engine, /V10|Triton/i);
  assert.doesNotMatch(cs15!.engine, /Cummins|B6\.7|FED|diesel/i);
  const cs16 = findPowertrainCorrection("2016", "Newmar", "Canyon Star", "3710");
  assert.equal(cs16!.horsepower, 362);
  assert.equal(cs16!.fuelType, "Gas");

  assert.equal(findPowertrainCorrection("2015", "Newmar", "Super Star", "3746"), null);
  assert.equal(findPowertrainCorrection("2016", "Newmar", "Supreme Aire", "4573"), null);
  assert.equal(findPowertrainCorrection("2015", "Newmar", "Kountry Star", "3712"), null);
  assert.equal(findPowertrainCorrection("2016", "Newmar", "Kountry Star", "3712"), null);
  assert.equal(findPowertrainCorrection("2015", "Newmar", "New Aire", "3543"), null);
  assert.equal(findPowertrainCorrection("2016", "Newmar", "New Aire", "3341"), null);
  assert.equal(findPowertrainCorrection("2016", "Newmar", "Northern Star", "3418"), null);
});

test("Tiffin 2025–2027 OEM year-first floorplans + yearEnds", () => {
  const tf = CATALOG_INDEX.Tiffin;
  assert.ok(tf);

  assert.equal(tf["Allegro Red 340"]?.yearEnd, 2023);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2024), false);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2025), false);
  assert.equal(tf["Allegro Red 360"]?.yearEnd, 2023);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2025), false);
  assert.equal(tf["Allegro Red"]?.yearEnd, undefined);
  assert.equal(tf["Allegro Red"]?.years?.includes(2017), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2023), false);
  assert.equal(tf["Allegro Red"]?.years?.includes(2024), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2025), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2027), true);

  assert.equal(tf["Allegro Breeze"]?.yearEnd, 2026);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2023), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2024), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2026), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2027), false);
  assert.equal(tf.Cahaba?.yearEnd, 2023);
  assert.equal(tf.Cahaba?.years?.includes(2023), true);
  assert.equal(tf.Cahaba?.years?.includes(2024), false);
  assert.equal(tf.Cahaba?.years?.includes(2025), false);
  assert.equal(tf.Allegro?.yearEnd, 2022);
  assert.equal(tf.Allegro?.years?.includes(2025), false);
  assert.equal(tf["Wayfarer 25"]?.yearEnd, 2024);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2025), false);
  assert.equal(tf["Allegro Bus 45OPP"]?.yearEnd, 2026);
  assert.equal(tf["Allegro 45OPP"]?.yearEnd, 2026);
  assert.equal(tf["Allegro 45OPP"]?.years?.includes(2027), false);

  assert.equal(tf["Allegro Bay"]?.type, "Super C");
  assert.equal(tf["Allegro Bay"]?.fuelType, "Diesel");
  assert.equal(tf["Allegro Bay"]?.yearStart, 2022);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2023), true);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2024), true);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2025), true);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2027), true);
  assert.equal(tf["Open Trail"]?.type, "Class C");
  assert.equal(tf["Open Trail"]?.years?.includes(2027), true);
  assert.equal(tf["Open Trail"]?.years?.includes(2026), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Tiffin: {");
  const t1 = block.indexOf("  Thor: {");
  const tiffin = block.slice(t0, t1);

  const ze0 = tiffin.indexOf("    Zephyr: {");
  const ze = tiffin.slice(ze0, tiffin.indexOf('    "Allegro Bus": {'));
  assert.match(ze, /"2025": \["45FZ", "45PZ"\]/);
  assert.match(ze, /"2026": \["45FZ", "45PZ"\]/);
  assert.match(ze, /"2027": \["45FZ", "45PZ"\]/);
  assert.doesNotMatch(ze, /"2025": \["45NZ"/);
  assert.doesNotMatch(ze, /"2027": \["45NZ"/);

  assert.match(ze, /"2023": \["45FZ"\]/);
  assert.match(ze, /"2024": \["45FZ"\]/);
  assert.doesNotMatch(ze, /"2023": \["45NZ"/);
  assert.doesNotMatch(ze, /"2024": \["45NZ"/);

  const bus0 = tiffin.indexOf('    "Allegro Bus": {');
  const bus = tiffin.slice(bus0, tiffin.indexOf('    "Allegro Bus 45OPP"'));
  assert.match(bus, /"2023": \["35CP", "40IP", "45FP", "45OPP"\]/);
  assert.match(bus, /"2024": \["35CP", "40IP", "45FP", "45OPP"\]/);
  assert.match(bus, /"2025": \["35CP", "40IP", "45FP", "45OPP", "45BTP"\]/);
  assert.match(bus, /"2026": \["36AP", "40IP", "45OPP", "45BP"\]/);
  assert.match(bus, /"2027": \["36AP", "40IP", "45OPP", "45BP"\]/);
  assert.doesNotMatch(bus, /"2025": \["36AP"/);
  assert.doesNotMatch(bus, /"2025": \["45BP"/);

  const ph0 = tiffin.indexOf("    Phaeton: {");
  const ph = tiffin.slice(ph0, tiffin.indexOf('    "Allegro Red 340"'));
  assert.match(ph, /"2023": \["36SH", "37BH", "40IH", "44OH"\]/);
  assert.match(ph, /"2024": \["35CH", "37BH", "40IH", "44OH"\]/);
  assert.match(ph, /"2025": \["35CH", "37BH", "40IH", "44OH"\]/);
  assert.match(ph, /"2026": \["35CH", "37BH", "40IH", "44OH"\]/);
  assert.match(ph, /"2027": \["35CH", "37BH", "40IH", "44OH"\]/);
  assert.doesNotMatch(ph, /"2025": \["37BH", "40AH"/);

  const red0 = tiffin.indexOf('    "Allegro Red": {');
  const red = tiffin.slice(red0, tiffin.indexOf('    "Allegro Breeze"'));
  assert.match(red, /"2024": \["33AA", "37BA", "38KA"\]/);
  assert.match(red, /"2025": \["33AA", "37BA", "38KA"\]/);
  assert.match(red, /"2027": \["33AA", "37BA", "38KA"\]/);

  const or0 = tiffin.indexOf('    "Open Road": {');
  const or = tiffin.slice(or0, tiffin.indexOf("    Wayfarer: {"));
  assert.match(or, /"2023": \["32FA", "32SA", "34PA", "36LA", "36UA"\]/);
  assert.match(or, /"2024": \["32FA", "32SA", "34PA", "36LA", "36UA"\]/);
  assert.match(or, /"2025": \["32FA", "32SA", "34PA", "36LA", "36UA"\]/);
  assert.match(or, /"2026": \["29NA", "32SA", "34PA", "36LA"\]/);
  assert.match(or, /"2027": \["29NA", "34PA"\]/);
  assert.doesNotMatch(or, /"2025": \["29NA"/);
  assert.doesNotMatch(or, /"2027": \["32SA"/);

  const wf0 = tiffin.indexOf("    Wayfarer: {");
  const wf = tiffin.slice(wf0, tiffin.indexOf('    "Wayfarer 25"'));
  assert.match(wf, /"2023": \["25JW", "25TW", "25LW", "25RW"\]/);
  assert.match(wf, /"2024": \["25JW", "25LW", "25RLW", "25RW"\]/);
  assert.match(wf, /"2025": \["25XLW", "25XRW"\]/);
  assert.match(wf, /"2026": \["25XRW", "25XLW", "25XPW", "25RW"\]/);
  assert.match(wf, /"2027": \["25RW", "25PW", "25XLW"\]/);
  assert.doesNotMatch(wf, /"2026": \["25RW", "25JW", "24QB"\]/);

  const bay0 = tiffin.indexOf('    "Allegro Bay": {');
  const bay = tiffin.slice(bay0, tiffin.indexOf('    "Open Trail"'));
  assert.match(bay, /"2023": \["38AB", "38BB", "38CB"\]/);
  assert.match(bay, /"2024": \["38AB", "38BB", "38CB"\]/);
  assert.match(bay, /"2025": \["38AB", "38BB", "38CB"\]/);
  assert.match(bay, /"2026": \["38AB", "38BB", "34DB"\]/);
  assert.match(bay, /"2027": \["34DB", "38AB", "38BB", "38EB"\]/);
  assert.doesNotMatch(bay, /"2025": \["34DB"/);
  assert.doesNotMatch(bay, /"2026": \["38EB"/);

  const z27 = findPowertrainCorrection("2027", "Tiffin", "Zephyr", "45PZ");
  assert.equal(z27!.horsepower, 605);
  assert.equal(z27!.torqueLbFt, 1950);
  const bus25 = findPowertrainCorrection("2025", "Tiffin", "Allegro Bus", "40IP");
  assert.equal(bus25!.horsepower, 450);
  const bus27short = findPowertrainCorrection("2027", "Tiffin", "Allegro Bus", "36AP");
  assert.equal(bus27short!.horsepower, 450);
  const bus27opp = findPowertrainCorrection("2027", "Tiffin", "Allegro Bus", "45OPP");
  assert.equal(bus27opp!.horsepower, 0);
  assert.match(bus27opp!.engine, /X15/);
  const ph24 = findPowertrainCorrection("2024", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph24!.horsepower, 450);
  assert.equal(ph24!.torqueLbFt, 1250);
  const ph23 = findPowertrainCorrection("2023", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph23!.horsepower, 380);
  const ph27 = findPowertrainCorrection("2027", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph27!.horsepower, 450);
  assert.equal(ph27!.torqueLbFt, 1250);
  const red27 = findPowertrainCorrection("2027", "Tiffin", "Allegro Red", "33AA");
  assert.equal(red27!.horsepower, 380);
  assert.equal(red27!.torqueLbFt, 1150);
  assert.doesNotMatch(red27!.engine, /B6\.7|F53|V10/i);
  const red340 = findPowertrainCorrection("2023", "Tiffin", "Allegro Red 340", "38LL");
  assert.equal(red340!.horsepower, 340);
  assert.equal(red340!.torqueLbFt, 700);
  assert.equal(findPowertrainCorrection("2025", "Tiffin", "Allegro Red 340", "33AA"), null);
  const or27 = findPowertrainCorrection("2027", "Tiffin", "Open Road", "34PA");
  assert.equal(or27!.horsepower, 350);
  assert.equal(or27!.torqueLbFt, 468);
  assert.equal(or27!.fuelType, "Gas");
  const wf27 = findPowertrainCorrection("2027", "Tiffin", "Wayfarer", "25RW");
  assert.equal(wf27!.horsepower, 208);
  const bay27 = findPowertrainCorrection("2027", "Tiffin", "Allegro Bay", "38AB");
  assert.equal(bay27!.horsepower, 360);
  assert.equal(bay27!.torqueLbFt, 800);
  const ot27 = findPowertrainCorrection("2027", "Tiffin", "Open Trail", "25CO");
  assert.equal(ot27!.horsepower, 208);
});

test("Tiffin 2023–2024 OEM year-first floorplans + powertrain pins", () => {
  const tf = CATALOG_INDEX.Tiffin;
  assert.ok(tf);
  assert.equal(tf["Allegro Red"]?.years?.includes(2024), true);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2024), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2024), false);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2023), true);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2024), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2023), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2024), true);
  assert.equal(tf.Cahaba?.yearEnd, 2023);
  assert.equal(tf.Cahaba?.type, "Class B");

  const z23 = findPowertrainCorrection("2023", "Tiffin", "Zephyr", "45FZ");
  assert.equal(z23!.horsepower, 605);
  assert.equal(z23!.torqueLbFt, 1950);
  assert.doesNotMatch(z23!.chassis || "", /SL/);

  const bus23short = findPowertrainCorrection("2023", "Tiffin", "Allegro Bus", "35CP");
  assert.equal(bus23short!.horsepower, 450);
  const bus24opp = findPowertrainCorrection("2024", "Tiffin", "Allegro Bus", "45OPP");
  assert.equal(bus24opp!.horsepower, 0);
  assert.match(bus24opp!.engine, /X15/);

  const ph23_37 = findPowertrainCorrection("2023", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph23_37!.horsepower, 380);
  const ph23_44 = findPowertrainCorrection("2023", "Tiffin", "Phaeton", "44OH");
  assert.equal(ph23_44!.horsepower, 450);
  const ph24_37 = findPowertrainCorrection("2024", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph24_37!.horsepower, 450);

  const red24 = findPowertrainCorrection("2024", "Tiffin", "Allegro Red", "33AA");
  assert.equal(red24!.horsepower, 380);
  assert.equal(red24!.torqueLbFt, 1150);
  const red360 = findPowertrainCorrection("2023", "Tiffin", "Allegro Red 360", "38KA");
  assert.equal(red360!.horsepower, 360);
  assert.doesNotMatch(red360!.engine, /L9/i);

  const or23 = findPowertrainCorrection("2023", "Tiffin", "Open Road", "32FA");
  assert.equal(or23!.horsepower, 350);
  assert.equal(or23!.fuelType, "Gas");
  const wf23 = findPowertrainCorrection("2023", "Tiffin", "Wayfarer", "25RW");
  assert.equal(wf23!.horsepower, 188);
  const breeze24 = findPowertrainCorrection("2024", "Tiffin", "Allegro Breeze", "33BR");
  assert.equal(breeze24!.horsepower, 340);
  const bay23 = findPowertrainCorrection("2023", "Tiffin", "Allegro Bay", "38AB");
  assert.equal(bay23!.horsepower, 360);
  const cahaba = findPowertrainCorrection("2023", "Tiffin", "Cahaba", "19 SC");
  assert.equal(cahaba!.horsepower, 188);
  assert.equal(findPowertrainCorrection("2024", "Tiffin", "Cahaba", "19 SC"), null);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Tiffin: {");
  const t1 = block.indexOf("  Thor: {");
  const tiffin = block.slice(t0, t1);
  const red340 = tiffin.slice(
    tiffin.indexOf('    "Allegro Red 340"'),
    tiffin.indexOf('    "Allegro Red 360"'),
  );
  assert.match(red340, /"2023": \["33AL", "38LL"\]/);
  assert.doesNotMatch(red340, /"2024":/);
  const breeze = tiffin.slice(
    tiffin.indexOf('    "Allegro Breeze"'),
    tiffin.indexOf('    "Open Road"'),
  );
  assert.match(breeze, /"2023": \["33BR"\]/);
  assert.match(breeze, /"2024": \["33BR"\]/);
});

test("Tiffin 2021–2022 OEM year-first floorplans + powertrain pins", () => {
  const tf = CATALOG_INDEX.Tiffin;
  assert.ok(tf);
  assert.equal(tf["Allegro Bay"]?.yearStart, 2022);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2022), true);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2021), false);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2021), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2022), true);
  assert.equal(tf.Zephyr?.years?.includes(2021), false);
  assert.equal(tf.Zephyr?.years?.includes(2022), true);
  assert.equal(tf.Cahaba?.years?.includes(2021), false);
  assert.equal(tf.Cahaba?.years?.includes(2022), false);
  assert.equal(tf.Allegro?.yearEnd, 2022);
  assert.equal(tf.Allegro?.years?.includes(2021), true);
  assert.equal(tf.Allegro?.years?.includes(2022), true);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Tiffin: {");
  const t1 = block.indexOf("  Thor: {");
  const tiffin = block.slice(t0, t1);

  const ze = tiffin.slice(tiffin.indexOf("    Zephyr: {"), tiffin.indexOf('    "Allegro Bus": {'));
  assert.match(ze, /"2022": \["45PZ"\]/);
  assert.doesNotMatch(ze, /"2021":/);
  assert.doesNotMatch(ze, /"2022": \["45NZ"/);
  assert.doesNotMatch(ze, /"2022": \["45FZ"/);
  assert.match(ze, /"2023": \["45FZ"\]/);

  const bus = tiffin.slice(tiffin.indexOf('    "Allegro Bus": {'), tiffin.indexOf('    "Allegro Bus 45OPP"'));
  assert.match(bus, /"2021": \["35CP", "37AP", "40AP", "40IP", "45OPP"\]/);
  assert.match(bus, /"2022": \["35CP", "37AP", "40AP", "40IP", "45OPP", "45FP"\]/);
  assert.doesNotMatch(bus, /"2021": \["37TS"/);
  assert.doesNotMatch(bus, /"2022": \["37TS"/);
  assert.match(bus, /"2023": \["35CP", "40IP", "45FP", "45OPP"\]/);

  const ph = tiffin.slice(tiffin.indexOf("    Phaeton: {"), tiffin.indexOf('    "Allegro Red 340"'));
  assert.match(ph, /"2021": \["36SH", "37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"\]/);
  assert.match(ph, /"2022": \["36SH", "37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"\]/);
  assert.doesNotMatch(ph, /"2021": \["37BH", "40AH".*45OH/);
  assert.match(ph, /"2023": \["36SH", "37BH", "40IH", "44OH"\]/);

  const red340 = tiffin.slice(tiffin.indexOf('    "Allegro Red 340"'), tiffin.indexOf('    "Allegro Red 360"'));
  assert.match(red340, /"2021": \["33AL", "38LL"\]/);
  assert.match(red340, /"2022": \["33AL", "38LL"\]/);
  assert.doesNotMatch(red340, /"2021": \["33AA"/);
  assert.match(red340, /"2023": \["33AL", "38LL"\]/);

  const red360 = tiffin.slice(tiffin.indexOf('    "Allegro Red 360"'), tiffin.indexOf('    "Allegro Red": {'));
  assert.match(red360, /"2021": \["33AA", "37BA", "37PA", "38KA"\]/);
  assert.match(red360, /"2022": \["33AA", "37BA", "37PA", "38KA"\]/);
  assert.doesNotMatch(red360, /"2021": \["33AA", "36UA"/);
  assert.match(red360, /"2023": \["33AA", "37BA", "38KA"\]/);

  const breeze = tiffin.slice(tiffin.indexOf('    "Allegro Breeze"'), tiffin.indexOf('    "Open Road"'));
  assert.match(breeze, /"2021": \["31BR", "33BR"\]/);
  assert.match(breeze, /"2022": \["31BR", "33BR"\]/);
  assert.match(breeze, /"2023": \["33BR"\]/);

  const or = tiffin.slice(tiffin.indexOf('    "Open Road": {'), tiffin.indexOf("    Wayfarer: {"));
  assert.match(or, /"2021": \["32SA", "34PA", "36LA", "36UA"\]/);
  assert.match(or, /"2022": \["32FA", "32SA", "34PA", "36LA", "36UA"\]/);
  assert.doesNotMatch(or, /"2021": \["32FA"/);
  assert.doesNotMatch(or, /"2021": \["34PR"/);
  assert.match(or, /"2023": \["32FA", "32SA", "34PA", "36LA", "36UA"\]/);

  const wf = tiffin.slice(tiffin.indexOf("    Wayfarer: {"), tiffin.indexOf('    "Wayfarer 25"'));
  assert.match(wf, /"2021": \["25TW", "25RW", "25LW", "25SW"\]/);
  assert.match(wf, /"2022": \["25TW", "25RW", "25LW", "25SW"\]/);
  assert.doesNotMatch(wf, /"2021": \["25JW"/);
  assert.match(wf, /"2023": \["25JW", "25TW", "25LW", "25RW"\]/);

  const bay = tiffin.slice(tiffin.indexOf('    "Allegro Bay": {'), tiffin.indexOf('    "Open Trail"'));
  assert.match(bay, /"2022": \["38AB", "38BB"\]/);
  assert.doesNotMatch(bay, /"2022": \["38AB", "38BB", "38CB"\]/);
  assert.match(bay, /"2023": \["38AB", "38BB", "38CB"\]/);

  const z22 = findPowertrainCorrection("2022", "Tiffin", "Zephyr", "45PZ");
  assert.equal(z22!.horsepower, 605);
  assert.equal(z22!.torqueLbFt, 1950);
  assert.doesNotMatch(z22!.chassis || "", /SL/);
  assert.equal(findPowertrainCorrection("2021", "Tiffin", "Zephyr", "45PZ"), null);

  const bus21short = findPowertrainCorrection("2021", "Tiffin", "Allegro Bus", "35CP");
  assert.equal(bus21short!.horsepower, 450);
  const bus21opp = findPowertrainCorrection("2021", "Tiffin", "Allegro Bus", "45OPP");
  assert.equal(bus21opp!.horsepower, 0);
  assert.match(bus21opp!.engine, /X15/);
  const bus22fp = findPowertrainCorrection("2022", "Tiffin", "Allegro Bus", "45FP");
  assert.equal(bus22fp!.horsepower, 0);
  assert.match(bus22fp!.engine, /X15/);

  const ph21_37 = findPowertrainCorrection("2021", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph21_37!.horsepower, 380);
  const ph22_37 = findPowertrainCorrection("2022", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph22_37!.horsepower, 380);
  const ph21_44 = findPowertrainCorrection("2021", "Tiffin", "Phaeton", "44OH");
  assert.equal(ph21_44!.horsepower, 450);
  const ph22_44 = findPowertrainCorrection("2022", "Tiffin", "Phaeton", "44OH");
  assert.equal(ph22_44!.horsepower, 450);
  const ph21_40 = findPowertrainCorrection("2021", "Tiffin", "Phaeton", "40IH");
  assert.equal(ph21_40!.horsepower, 0);
  assert.match(ph21_40!.engine, /450/);

  const red340_21 = findPowertrainCorrection("2021", "Tiffin", "Allegro Red 340", "38LL");
  assert.equal(red340_21!.horsepower, 340);
  assert.equal(red340_21!.torqueLbFt, 700);
  assert.doesNotMatch(red340_21!.engine, /L9/i);
  const red360_22 = findPowertrainCorrection("2022", "Tiffin", "Allegro Red 360", "38KA");
  assert.equal(red360_22!.horsepower, 360);
  assert.doesNotMatch(red360_22!.engine, /L9/i);

  const or21 = findPowertrainCorrection("2021", "Tiffin", "Open Road", "32SA");
  assert.equal(or21!.horsepower, 350);
  assert.equal(or21!.torqueLbFt, 468);
  assert.equal(or21!.fuelType, "Gas");
  const or22 = findPowertrainCorrection("2022", "Tiffin", "Open Road", "32FA");
  assert.equal(or22!.fuelType, "Gas");

  const wf21 = findPowertrainCorrection("2021", "Tiffin", "Wayfarer", "25RW");
  assert.equal(wf21!.horsepower, 188);
  assert.equal(wf21!.torqueLbFt, 325);
  const wf22 = findPowertrainCorrection("2022", "Tiffin", "Wayfarer", "25SW");
  assert.equal(wf22!.horsepower, 188);
  assert.doesNotMatch(wf22!.engine, /2\.0|208/);

  const breeze21 = findPowertrainCorrection("2021", "Tiffin", "Allegro Breeze", "31BR");
  assert.equal(breeze21!.horsepower, 340);
  const breeze22 = findPowertrainCorrection("2022", "Tiffin", "Allegro Breeze", "33BR");
  assert.equal(breeze22!.horsepower, 340);

  const bay22 = findPowertrainCorrection("2022", "Tiffin", "Allegro Bay", "38AB");
  assert.equal(bay22!.horsepower, 360);
  assert.equal(bay22!.torqueLbFt, 800);
  assert.match(bay22!.chassis || "", /S2RV/);
});

test("Tiffin 2017–2018 OEM year-first floorplans + powertrain pins", () => {
  const tf = CATALOG_INDEX.Tiffin;
  assert.ok(tf);

  assert.equal(tf["Allegro Bay"]?.yearStart, 2022);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2017), false);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2018), false);

  assert.equal(tf.Zephyr?.years?.includes(2017), true);
  assert.equal(tf.Zephyr?.years?.includes(2018), false);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2017), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2018), false);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2017), false);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2018), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2017), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2018), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2017), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2018), true);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2018), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Tiffin: {");
  const t1 = block.indexOf("  Thor: {");
  const tiffin = block.slice(t0, t1);

  const ze = tiffin.slice(tiffin.indexOf("    Zephyr: {"), tiffin.indexOf('    "Allegro Bus": {'));
  assert.match(ze, /"2017": \["45OZ"\]/);
  assert.doesNotMatch(ze, /"2018":/);
  assert.doesNotMatch(ze, /"2017": \["45NZ"/);
  assert.match(ze, /"2019": \["45MZ", "45PZ"\]/);

  const bus = tiffin.slice(tiffin.indexOf('    "Allegro Bus": {'), tiffin.indexOf('    "Allegro Bus 45OPP"'));
  assert.match(bus, /"2017": \["37AP", "40AP", "40SP", "45OP", "45OPP"\]/);
  assert.match(bus, /"2018": \["37AP", "40AP", "40SP", "45OP", "45OPP", "45MP"\]/);
  assert.doesNotMatch(bus, /"2017": \["37AP", "40AP", "45LP"/);
  assert.doesNotMatch(bus, /"2018": \["37TS"/);
  assert.match(bus, /"2019": \["37AP", "40AP", "40IP", "45OPP", "45MP"\]/);

  const ph = tiffin.slice(tiffin.indexOf("    Phaeton: {"), tiffin.indexOf('    "Allegro Red 340"'));
  assert.match(ph, /"2017": \["36GH", "40AH", "40QBH", "40QKH", "44OH"\]/);
  assert.match(ph, /"2018": \["36GH", "37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"\]/);
  assert.doesNotMatch(ph, /"2017": \["36GH", "37BH"/);
  assert.match(ph, /"2019": \["37BH", "40AH", "40IH", "40QBH", "40QKH", "44OH"\]/);

  const red340 = tiffin.slice(tiffin.indexOf('    "Allegro Red 340"'), tiffin.indexOf('    "Allegro Red 360"'));
  assert.doesNotMatch(red340, /"2017":/);
  assert.doesNotMatch(red340, /"2018":/);
  assert.match(red340, /"2019": \["33AA"\]/);

  const red360 = tiffin.slice(tiffin.indexOf('    "Allegro Red 360"'), tiffin.indexOf('    "Allegro Red": {'));
  assert.match(red360, /"2018": \["33AA", "37BA", "37PA", "38QBA", "38QRA"\]/);
  assert.doesNotMatch(red360, /"2018": \["33AA", "36UA"/);
  assert.match(red360, /"2019": \["33AA", "37BA", "37PA"\]/);

  const red = tiffin.slice(tiffin.indexOf('    "Allegro Red": {'), tiffin.indexOf('    "Allegro Breeze"'));
  assert.match(red, /"2017": \["33AA", "37PA", "38QBA", "38QRA"\]/);
  assert.match(red, /"2018": \["33AA", "37BA", "37PA", "38QBA", "38QRA"\]/);

  const breeze = tiffin.slice(tiffin.indexOf('    "Allegro Breeze"'), tiffin.indexOf('    "Open Road"'));
  assert.match(breeze, /"2017": \["31BR", "32BR"\]/);
  assert.doesNotMatch(breeze, /"2018":/);
  assert.doesNotMatch(breeze, /"2017": \["28BR"/);
  assert.match(breeze, /"2019": \["31BR", "33BR"\]/);

  const or = tiffin.slice(tiffin.indexOf('    "Open Road": {'), tiffin.indexOf("    Wayfarer: {"));
  assert.match(or, /"2017": \["31MA", "31SA", "32SA", "34PA", "35QBA", "36LA", "36UA"\]/);
  assert.match(or, /"2018": \["31MA", "32SA", "34PA", "36LA", "36UA"\]/);
  assert.doesNotMatch(or, /"2017": \["32SA", "34PA", "34PR"/);
  assert.match(or, /"2019": \["32SA", "34PA", "36LA"\]/);

  const wf = tiffin.slice(tiffin.indexOf("    Wayfarer: {"), tiffin.indexOf('    "Wayfarer 25"'));
  assert.match(wf, /"2017": \["24QW"\]/);
  assert.match(wf, /"2018": \["24BW", "24QW", "24TW"\]/);
  assert.doesNotMatch(wf, /"2017": \["24BW"/);
  assert.doesNotMatch(wf, /"2018": \["24BW", "25RW"/);
  assert.match(wf, /"2019": \["24BW", "24FW", "25QW", "24TW", "25RW"\]/);

  const z17 = findPowertrainCorrection("2017", "Tiffin", "Zephyr", "45OZ");
  assert.equal(z17!.horsepower, 600);
  assert.equal(z17!.torqueLbFt, 1950);
  assert.match(z17!.engine, /ISL 600/);
  assert.doesNotMatch(z17!.chassis || "", /SL/);
  assert.equal(findPowertrainCorrection("2018", "Tiffin", "Zephyr", "45OZ"), null);

  const bus17short = findPowertrainCorrection("2017", "Tiffin", "Allegro Bus", "37AP");
  assert.equal(bus17short!.horsepower, 0);
  assert.match(bus17short!.engine, /ISX15/);
  const bus17opp = findPowertrainCorrection("2017", "Tiffin", "Allegro Bus", "45OPP");
  assert.equal(bus17opp!.horsepower, 450);
  assert.doesNotMatch(bus17opp!.engine, /ISX15|X15/);
  const bus18 = findPowertrainCorrection("2018", "Tiffin", "Allegro Bus", "37AP");
  assert.equal(bus18!.horsepower, 0);
  assert.match(bus18!.engine, /ISL9/);
  assert.match(bus18!.engine, /X15/);

  const ph17 = findPowertrainCorrection("2017", "Tiffin", "Phaeton", "40AH");
  assert.equal(ph17!.horsepower, 0);
  assert.match(ph17!.engine, /ISL/);
  assert.doesNotMatch(ph17!.engine, /L9/);
  const ph18 = findPowertrainCorrection("2018", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph18!.horsepower, 0);
  assert.match(ph18!.engine, /ISL/);
  const ph19 = findPowertrainCorrection("2019", "Tiffin", "Phaeton", "37BH");
  assert.equal(ph19!.horsepower, 380);
  assert.match(ph19!.engine, /L9/);

  const red17 = findPowertrainCorrection("2017", "Tiffin", "Allegro Red", "33AA");
  assert.equal(red17!.horsepower, 360);
  assert.equal(red17!.torqueLbFt, 800);
  assert.equal(red17!.fuelType, "Diesel");
  assert.doesNotMatch(red17!.engine, /L9|V10|F53/i);
  const red18 = findPowertrainCorrection("2018", "Tiffin", "Allegro Red 360", "37BA");
  assert.equal(red18!.horsepower, 360);
  assert.doesNotMatch(red18!.engine, /L9/i);
  assert.equal(findPowertrainCorrection("2017", "Tiffin", "Allegro Red 340", "33AA"), null);
  assert.equal(findPowertrainCorrection("2018", "Tiffin", "Allegro Red 340", "33AA"), null);

  const breeze17 = findPowertrainCorrection("2017", "Tiffin", "Allegro Breeze", "31BR");
  assert.equal(breeze17!.horsepower, 275);
  assert.equal(breeze17!.torqueLbFt, 560);
  assert.match(breeze17!.engine, /ISV5\.0/);
  assert.doesNotMatch(breeze17!.engine, /B6\.7|340/);
  assert.equal(findPowertrainCorrection("2018", "Tiffin", "Allegro Breeze", "31BR"), null);

  const or17 = findPowertrainCorrection("2017", "Tiffin", "Open Road", "32SA");
  assert.equal(or17!.horsepower, 320);
  assert.equal(or17!.torqueLbFt, 460);
  assert.equal(or17!.fuelType, "Gas");
  assert.doesNotMatch(or17!.engine, /7\.3|diesel/i);
  const or18 = findPowertrainCorrection("2018", "Tiffin", "Open Road", "36UA");
  assert.equal(or18!.fuelType, "Gas");
  const alg17 = findPowertrainCorrection("2017", "Tiffin", "Allegro", "32SA");
  assert.equal(alg17!.fuelType, "Gas");
  assert.equal(alg17!.horsepower, 320);

  const wf17 = findPowertrainCorrection("2017", "Tiffin", "Wayfarer", "24QW");
  assert.equal(wf17!.horsepower, 0);
  assert.match(wf17!.engine, /3\.0/);
  assert.doesNotMatch(wf17!.engine, /2\.0|208/);
  const wf18 = findPowertrainCorrection("2018", "Tiffin", "Wayfarer", "24BW");
  assert.equal(wf18!.horsepower, 188);
  assert.equal(wf18!.torqueLbFt, 325);
  assert.doesNotMatch(wf18!.engine, /2\.0|208/);
});
