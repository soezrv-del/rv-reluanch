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
  assert.equal(nm["Super Star"]?.yearStart, 2023);
  assert.equal(nm["Super Star"]?.years?.includes(2023), true);
  assert.equal(nm["Super Star"]?.years?.includes(2024), true);
  assert.equal(nm["Supreme Aire"]?.yearStart, 2023);
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
