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

test("brochureSpecs source no longer hash-seeds tanks, MPG, heater, construction, wheelbase, propane", () => {
  const spec = src("brochureSpecs.ts");
  assert.doesNotMatch(spec, /function hashSeed/);
  assert.doesNotMatch(spec, /function pick\s*</);
  assert.doesNotMatch(spec, /pick\(seed/);
  assert.doesNotMatch(spec, /40 \+ \(seed % 40\)/);
  assert.doesNotMatch(spec, /30 \+ \(seed % 30\)/);
  assert.doesNotMatch(spec, /28 \+ \(seed % 28\)/);
  assert.doesNotMatch(spec, /266 \+ \(seed % 20\)/);
  assert.doesNotMatch(spec, /16 \+ \(seed % 10\)/);
  assert.doesNotMatch(spec, /"6 gal gas\/electric"/);
  assert.doesNotMatch(spec, /Aluminum frame · laminated walls/);
  assert.doesNotMatch(spec, /diesel \? 100 : 80/);
  assert.doesNotMatch(spec, /const seed = hashSeed/);
  assert.match(spec, /CONFIRM_BROCHURE/);
  assert.match(spec, /tankOrConfirm/);
});

test("seeded filler is gone: tanks / MPG / fuel / PDF-only fields say Confirm brochure", () => {
  const spec = src("brochureSpecs.ts");
  assert.match(spec, /freshWater:\s*tankOrConfirm\(oem\?\.freshWater \?\? snap\.freshWater\)/);
  assert.match(spec, /grayWater:\s*tankOrConfirm\(oem\?\.grayWater \?\? snap\.grayWater\)/);
  assert.match(spec, /blackWater:\s*tankOrConfirm\(oem\?\.blackWater \?\? snap\.blackWater\)/);
  assert.match(spec, /waterHeater:\s*CONFIRM_BROCHURE/);
  assert.match(spec, /construction:\s*CONFIRM_BROCHURE/);
  assert.match(spec, /wheelbase:\s*isTowable \? "N\/A \(towable\)" : CONFIRM_BROCHURE/);
  assert.match(spec, /propane:\s*oem\?\.propaneLbs/);
  assert.match(spec, /: CONFIRM_BROCHURE/);
  assert.match(spec, /mpgCity:[\s\S]*?CONFIRM_BROCHURE/);
  assert.match(spec, /mpgHighway:[\s\S]*?CONFIRM_BROCHURE/);
  assert.match(spec, /mpgCombined:[\s\S]*?CONFIRM_BROCHURE/);
  assert.match(spec, /fuelCapacity:[\s\S]*?CONFIRM_BROCHURE/);
  assert.match(spec, /rangeMiles:[\s\S]*?CONFIRM_BROCHURE/);
  assert.match(spec, /converter:\s*CONFIRM_BROCHURE/);
  assert.match(spec, /seatBelts:\s*CONFIRM_BROCHURE/);
  assert.match(spec, /warranty:[\s\S]*?: CONFIRM_BROCHURE/);
  // Catalog / OEM pins still win when present — no class-average invent
  assert.match(spec, /snap\.fuelCapacityGal && snap\.fuelCapacityGal > 0/);
  assert.match(spec, /mpgOverride && mpgOverride > 0/);
  assert.match(spec, /Tow vehicle dependent/);
  assert.doesNotMatch(spec, /eco\.fuelGal/);
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
  assert.equal(fw.Southwind?.yearStart, 2013);
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
  assert.equal(fw.Southwind?.yearStart, 2013);
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
  assert.equal(fw.Southwind?.yearStart, 2013);
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

test("Fleetwood 2015–2016 walk-back: OEM plans, no invented ghosts", () => {
  const fw = CATALOG_INDEX.Fleetwood;
  assert.ok(fw);

  assert.equal(fw.Southwind?.yearStart, 2013);
  assert.equal(fw.Southwind?.years?.includes(2015), true);
  assert.equal(fw.Southwind?.years?.includes(2016), true);
  assert.equal(fw["Bounder Classic"]?.yearEnd, 2015);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2015), true);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2016), false);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2017), false);
  assert.equal(fw.Jamboree?.yearEnd, 2016);
  assert.equal(fw.Jamboree?.years?.includes(2015), true);
  assert.equal(fw.Jamboree?.years?.includes(2016), true);
  assert.equal(fw.Tioga?.yearEnd, 2016);
  assert.equal(fw.Tioga?.years?.includes(2015), true);
  assert.equal(fw["Tioga Ranger"]?.yearEnd, 2016);
  assert.equal(fw["Tioga Ranger"]?.years?.includes(2015), true);
  assert.equal(fw.Storm?.years?.includes(2015), true);
  assert.equal(fw.Storm?.years?.includes(2016), true);
  assert.equal(fw.Flair?.years?.includes(2015), true);
  assert.equal(fw["Pace Arrow"]?.years?.includes(2015), false);
  assert.equal(fw["Pace Arrow"]?.years?.includes(2016), false);
  assert.equal(fw["Discovery LXE"]?.years?.includes(2015), false);
  assert.equal(fw["Discovery LXE"]?.years?.includes(2016), false);
  assert.equal(fw.Pulse?.years?.includes(2015), false);
  assert.equal(fw.Pulse?.years?.includes(2016), false);
  assert.equal(fw.Fortis?.years?.includes(2015), false);
  assert.equal(fw.Flex?.years?.includes(2016), false);
  assert.equal(fw.Frontier?.years?.includes(2016), false);
  assert.equal(fw.Altitude?.years?.includes(2016), false);
  assert.equal(fw.Insight?.years?.includes(2016), false);

  const block = src("rvData.ts");

  const disc0 = block.indexOf("    Discovery: {");
  const disc1 = block.indexOf('    "Discovery LXE"');
  const disc = block.slice(disc0, disc1);
  assert.match(disc, /"2015": \["37R", "40E", "40G", "40X"\]/);
  assert.match(disc, /"2016": \["37R", "40E", "40G", "40X"\]/);
  assert.doesNotMatch(disc, /"2015": \["36G"/);
  assert.doesNotMatch(disc, /"2016": \["36G"/);
  assert.doesNotMatch(disc.slice(disc.indexOf('"2015"'), disc.indexOf('"2017"')), /"38F"/);

  const lxe0 = block.indexOf('    "Discovery LXE": {');
  const lxe1 = block.indexOf("    Frontier: {");
  const lxe = block.slice(lxe0, lxe1);
  assert.doesNotMatch(lxe, /"2013"/);
  assert.doesNotMatch(lxe, /"2014"/);
  assert.doesNotMatch(lxe, /"2015"/);
  assert.doesNotMatch(lxe, /"2016"/);
  assert.match(lxe, /"2012": \["40G", "40M", "44H"\]/);
  assert.match(lxe, /"2017": \["40D", "40E", "40G", "40X"\]/);

  const b0 = block.indexOf("    Bounder: {");
  const b1 = block.indexOf('    "Bounder Classic"');
  const bounder = block.slice(b0, b1);
  assert.match(bounder, /"2015": \["33C", "34T", "35K", "36E"\]/);
  assert.match(bounder, /"2016": \["33C", "34T", "35K", "36E", "36H"\]/);
  assert.doesNotMatch(bounder, /"2015": \["33C", "35K", "36H"\]/);
  assert.doesNotMatch(bounder, /"2016": \["33C", "35K", "36H"\]/);

  const classic0 = block.indexOf('    "Bounder Classic": {');
  const classic1 = block.indexOf("    Southwind: {");
  const classic = block.slice(classic0, classic1);
  assert.match(classic, /"2015": \["34B", "34M", "36H", "36R"\]/);
  assert.match(classic, /yearEnd:\s*2015/);
  assert.doesNotMatch(classic, /"2016"/);
  assert.doesNotMatch(classic, /"2017"/);

  const sw0 = block.indexOf("    Southwind: {");
  const sw1 = block.indexOf('    "Pace Arrow"');
  const southwind = block.slice(sw0, sw1);
  assert.match(southwind, /"2015": \["32VS", "34A", "36L"\]/);
  assert.match(southwind, /"2016": \["32VS", "34A", "36L"\]/);
  assert.match(southwind, /yearStart:\s*2013/);

  const pa0 = block.indexOf('    "Pace Arrow": {');
  const pa1 = block.indexOf("    Storm: {");
  const pace = block.slice(pa0, pa1);
  assert.doesNotMatch(pace, /"2013"/);
  assert.doesNotMatch(pace, /"2014"/);
  assert.doesNotMatch(pace, /"2015"/);
  assert.doesNotMatch(pace, /"2016"/);
  assert.match(pace, /"2012": \["33D", "35R", "36U"\]/);
  assert.match(pace, /"2017": \["33D", "35E", "35M", "36U"\]/);

  const storm0 = block.indexOf("    Storm: {");
  const storm1 = block.indexOf("    Flair: {");
  const storm = block.slice(storm0, storm1);
  assert.match(storm, /"2015": \["28F", "28MS", "30L", "32H", "32V"\]/);
  assert.match(storm, /"2016": \["28MS", "30L", "32H", "32V", "35SK"\]/);
  assert.doesNotMatch(storm, /"2015": \["28F", "32V", "36F"\]/);
  assert.doesNotMatch(storm, /"2016": \["28F", "32V", "36F"\]/);

  const fl0 = block.indexOf("    Flair: {");
  const fl1 = block.indexOf("    Fortis: {");
  const flair = block.slice(fl0, fl1);
  assert.match(flair, /"2015": \["26D", "26E"\]/);
  assert.match(flair, /"2016": \["26D", "26E", "29T"\]/);
  assert.doesNotMatch(flair, /"2015": \["28A"/);
  assert.doesNotMatch(flair, /"2016": \["28A"/);
  assert.doesNotMatch(flair.slice(flair.indexOf('"2015"'), flair.indexOf('"2017"')), /"30U"/);

  const jam0 = block.indexOf("    Jamboree: {");
  const jam1 = block.indexOf("    Tioga: {");
  const jamboree = block.slice(jam0, jam1);
  assert.match(jamboree, /"2015": \["25G", "31A", "31D", "31M"\]/);
  assert.match(jamboree, /"2016": \["25G", "31A", "31D", "31M"\]/);
  assert.doesNotMatch(jamboree, /"2015": \["25B"/);
  assert.doesNotMatch(jamboree.slice(jamboree.indexOf('"2015"'), jamboree.indexOf("yearStart")), /"23B"/);

  const t0 = block.indexOf("    Tioga: {");
  const t1 = block.indexOf('    "Tioga Ranger"');
  const tioga = block.slice(t0, t1);
  assert.match(tioga, /"2015": \["23B", "25K", "29A", "31M"\]/);
  assert.match(tioga, /"2016": \["23B", "25K", "29A", "31M"\]/);
  assert.doesNotMatch(tioga, /"2015": \["24K"/);

  const tr0 = block.indexOf('    "Tioga Ranger": {');
  const tr1 = block.indexOf("    Pulse: {");
  const ranger = block.slice(tr0, tr1);
  assert.match(ranger, /"2015": \["25G", "31A", "31D", "31M"\]/);
  assert.match(ranger, /"2016": \["25G", "31A", "31D", "31M"\]/);

  const pulse0 = block.indexOf("    Pulse: {");
  const pulse1 = block.indexOf("    Altitude: {");
  const pulse = block.slice(pulse0, pulse1);
  assert.doesNotMatch(pulse, /"2013"/);
  assert.doesNotMatch(pulse, /"2014"/);
  assert.doesNotMatch(pulse, /"2015"/);
  assert.doesNotMatch(pulse, /"2016"/);
  assert.match(pulse, /yearStart:\s*2018/);

  const disc15 = findPowertrainCorrection("2015", "Fleetwood", "Discovery", "37R");
  assert.equal(disc15!.horsepower, 380);
  assert.equal(disc15!.fuelType, "Diesel");
  assert.match(disc15!.engine, /ISL9|ISL/);
  assert.notEqual(disc15!.horsepower, 360);
  const disc16 = findPowertrainCorrection("2016", "Fleetwood", "Discovery", "40X");
  assert.equal(disc16!.horsepower, 380);

  const lxe15 = findPowertrainCorrection("2015", "Fleetwood", "Discovery LXE", "40G");
  assert.equal(lxe15, null);
  const lxe16 = findPowertrainCorrection("2016", "Fleetwood", "Discovery LXE", "40M");
  assert.equal(lxe16, null);

  const bounder15 = findPowertrainCorrection("2015", "Fleetwood", "Bounder", "35K");
  assert.equal(bounder15!.horsepower, 362);
  assert.equal(bounder15!.torqueLbFt, 457);
  assert.equal(bounder15!.fuelType, "Gas");
  assert.match(bounder15!.engine, /V10|6\.8/);
  assert.notEqual(bounder15!.horsepower, 335);
  const bounder16 = findPowertrainCorrection("2016", "Fleetwood", "Bounder", "36H");
  assert.equal(bounder16!.horsepower, 362);

  const classic15 = findPowertrainCorrection("2015", "Fleetwood", "Bounder Classic", "34B");
  assert.equal(classic15!.horsepower, 362);
  assert.equal(classic15!.fuelType, "Gas");
  const classic16 = findPowertrainCorrection("2016", "Fleetwood", "Bounder Classic", "34B");
  assert.equal(classic16, null);

  const south15 = findPowertrainCorrection("2015", "Fleetwood", "Southwind", "32VS");
  assert.equal(south15!.horsepower, 362);
  assert.equal(south15!.fuelType, "Gas");
  const south16 = findPowertrainCorrection("2016", "Fleetwood", "Southwind", "36L");
  assert.equal(south16!.horsepower, 362);

  const pace15 = findPowertrainCorrection("2015", "Fleetwood", "Pace Arrow", "33D");
  assert.equal(pace15, null);
  const pace16 = findPowertrainCorrection("2016", "Fleetwood", "Pace Arrow", "35R");
  assert.equal(pace16, null);

  const flair15 = findPowertrainCorrection("2015", "Fleetwood", "Flair", "26D");
  assert.equal(flair15!.horsepower, 362);
  assert.match(flair15!.engine, /V10|6\.8/);
  const flair16 = findPowertrainCorrection("2016", "Fleetwood", "Flair", "29T");
  assert.equal(flair16!.horsepower, 362);

  const storm15 = findPowertrainCorrection("2015", "Fleetwood", "Storm", "28MS");
  assert.equal(storm15!.horsepower, 362);
  assert.equal(storm15!.fuelType, "Gas");
  const storm16 = findPowertrainCorrection("2016", "Fleetwood", "Storm", "35SK");
  assert.equal(storm16!.horsepower, 362);
  assert.equal(storm16!.fuelType, "Gas");

  const jam15 = findPowertrainCorrection("2015", "Fleetwood", "Jamboree", "25G");
  assert.ok(jam15);
  assert.equal(jam15!.fuelType, "Gas");
  assert.doesNotMatch(jam15!.engine, /7\.3/);
  assert.notEqual(jam15!.horsepower, 335);
  const tioga15 = findPowertrainCorrection("2015", "Fleetwood", "Tioga", "23B");
  assert.ok(tioga15);
  assert.equal(tioga15!.fuelType, "Gas");
  assert.doesNotMatch(tioga15!.engine, /7\.3/);
  const ranger15 = findPowertrainCorrection("2015", "Fleetwood", "Tioga Ranger", "25G");
  assert.ok(ranger15);
  assert.equal(ranger15!.fuelType, "Gas");
  assert.doesNotMatch(ranger15!.engine, /7\.3/);
  assert.match(ranger15!.engine, /E-450|V10|6\.8/);

  const pulse15 = findPowertrainCorrection("2015", "Fleetwood", "Pulse", "24A");
  assert.equal(pulse15, null);
  const pulse16 = findPowertrainCorrection("2016", "Fleetwood", "Pulse", "24D");
  assert.equal(pulse16, null);
});

test("Fleetwood 2013–2014 walk-back: OEM plans, no invented ghosts", () => {
  const fw = CATALOG_INDEX.Fleetwood;
  assert.ok(fw);

  assert.equal(fw.Southwind?.yearStart, 2013);
  assert.equal(fw.Southwind?.years?.includes(2013), true);
  assert.equal(fw.Southwind?.years?.includes(2014), true);
  assert.equal(fw.Bounder?.years?.includes(2013), true);
  assert.equal(fw.Bounder?.years?.includes(2014), true);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2013), true);
  assert.equal(fw["Bounder Classic"]?.years?.includes(2014), true);
  assert.equal(fw.Storm?.years?.includes(2013), true);
  assert.equal(fw.Storm?.years?.includes(2014), true);
  assert.equal(fw.Discovery?.years?.includes(2013), true);
  assert.equal(fw.Discovery?.years?.includes(2014), true);
  assert.equal(fw.Jamboree?.years?.includes(2013), true);
  assert.equal(fw.Jamboree?.years?.includes(2014), true);
  assert.equal(fw.Tioga?.years?.includes(2013), true);
  assert.equal(fw.Tioga?.years?.includes(2014), true);
  assert.equal(fw["Tioga Ranger"]?.years?.includes(2013), true);
  assert.equal(fw["Tioga Ranger"]?.years?.includes(2014), true);

  assert.equal(fw["Discovery LXE"]?.years?.includes(2013), false);
  assert.equal(fw["Discovery LXE"]?.years?.includes(2014), false);
  assert.equal(fw["Pace Arrow"]?.years?.includes(2013), false);
  assert.equal(fw["Pace Arrow"]?.years?.includes(2014), false);
  assert.equal(fw.Flair?.years?.includes(2013), false);
  assert.equal(fw.Flair?.years?.includes(2014), false);
  assert.equal(fw.Pulse?.years?.includes(2013), false);
  assert.equal(fw.Pulse?.years?.includes(2014), false);
  assert.equal(fw.Pulse?.yearStart, 2018);
  assert.equal(fw.Fortis?.years?.includes(2013), false);
  assert.equal(fw.Flex?.years?.includes(2014), false);
  assert.equal(fw.Frontier?.years?.includes(2014), false);
  assert.equal(fw.Altitude?.years?.includes(2014), false);
  assert.equal(fw.Insight?.years?.includes(2014), false);
  assert.ok(!fw.Terra);
  assert.ok(!fw.Expedition);
  assert.ok(!fw["Jamboree Searcher"]);
  assert.ok(!fw["Pace Arrow LXE"]);

  const block = src("rvData.ts");
  const fw0 = block.indexOf("  Fleetwood: {");
  const fw1 = block.indexOf("  Jayco: {");
  const fleet = block.slice(fw0, fw1);

  const disc = fleet.slice(fleet.indexOf("    Discovery: {"), fleet.indexOf('    "Discovery LXE"'));
  assert.match(disc, /"2013": \["36J", "40E", "40G", "40X", "42A", "42D", "42M"\]/);
  assert.match(disc, /"2014": \["36J", "40E", "40G", "40X"\]/);
  assert.doesNotMatch(disc, /"2013": \["36G"/);
  assert.doesNotMatch(disc, /"2014": \["36G"/);
  assert.doesNotMatch(disc.slice(disc.indexOf('"2013"'), disc.indexOf('"2015"')), /"38F"/);

  const lxe = fleet.slice(fleet.indexOf('    "Discovery LXE": {'), fleet.indexOf("    Frontier: {"));
  assert.doesNotMatch(lxe, /"2013"/);
  assert.doesNotMatch(lxe, /"2014"/);
  assert.match(lxe, /"2012": \["40G", "40M", "44H"\]/);

  const bounder = fleet.slice(fleet.indexOf("    Bounder: {"), fleet.indexOf('    "Bounder Classic"'));
  assert.match(bounder, /"2013": \["33C", "35K", "36E"\]/);
  assert.match(bounder, /"2014": \["33C", "35K", "36E"\]/);
  assert.doesNotMatch(bounder, /"2013": \["33C", "35K", "36H"\]/);
  assert.doesNotMatch(bounder, /"2014": \["33C", "35K", "36H"\]/);
  assert.doesNotMatch(bounder.slice(bounder.indexOf('"2013"'), bounder.indexOf('"2015"')), /"34T"/);

  const classic = fleet.slice(fleet.indexOf('    "Bounder Classic": {'), fleet.indexOf("    Southwind: {"));
  assert.match(classic, /"2013": \["30T", "34B", "34M", "36H", "36R"\]/);
  assert.match(classic, /"2014": \["30T", "34B", "34M", "36H", "36R"\]/);
  assert.doesNotMatch(classic, /"2013": \["33C", "35K"\]/);
  assert.doesNotMatch(classic, /"2014": \["33C", "35K"\]/);

  const southwind = fleet.slice(fleet.indexOf("    Southwind: {"), fleet.indexOf('    "Pace Arrow"'));
  assert.match(southwind, /"2013": \["32VS", "36D", "36L", "36S"\]/);
  assert.match(southwind, /"2014": \["32VS", "34A", "36D", "36L"\]/);
  assert.doesNotMatch(southwind, /"2014": .*"36S"/);
  assert.match(southwind, /yearStart:\s*2013/);

  const pace = fleet.slice(fleet.indexOf('    "Pace Arrow": {'), fleet.indexOf("    Storm: {"));
  assert.doesNotMatch(pace, /"2013"/);
  assert.doesNotMatch(pace, /"2014"/);

  const storm = fleet.slice(fleet.indexOf("    Storm: {"), fleet.indexOf("    Flair: {"));
  assert.match(storm, /"2013": \["28F", "28MS", "32BH", "32V", "33Q"\]/);
  assert.match(storm, /"2014": \["28F", "28MS", "32H", "32V", "33Q"\]/);
  assert.doesNotMatch(storm, /"2013": \["28F", "32V", "36F"\]/);
  assert.doesNotMatch(storm, /"2014": \["28F", "32V", "36F"\]/);
  assert.doesNotMatch(storm.slice(storm.indexOf('"2013"'), storm.indexOf('"2015"')), /"30L"/);

  const flair = fleet.slice(fleet.indexOf("    Flair: {"), fleet.indexOf("    Fortis: {"));
  assert.doesNotMatch(flair, /"2013"/);
  assert.doesNotMatch(flair, /"2014"/);
  assert.match(flair, /"2012": \["28A", "30U", "32S"\]/);

  const jamboree = fleet.slice(fleet.indexOf("    Jamboree: {"), fleet.indexOf("    Tioga: {"));
  assert.match(jamboree, /"2013": \["25G", "28Y", "28Z", "31M", "31N", "31W"\]/);
  assert.match(jamboree, /"2014": \["25G", "28Z", "31A", "31D", "31M"\]/);
  assert.doesNotMatch(jamboree, /"2013": \["25B"/);
  assert.doesNotMatch(jamboree.slice(jamboree.indexOf('"2013"'), jamboree.indexOf('"2015"')), /"23B"/);

  const tioga = fleet.slice(fleet.indexOf("    Tioga: {"), fleet.indexOf('    "Tioga Ranger"'));
  assert.match(tioga, /"2013": \["23B", "25K"\]/);
  assert.match(tioga, /"2014": \["23B", "25K", "31M"\]/);
  assert.doesNotMatch(tioga, /"2013": \["24K"/);
  assert.doesNotMatch(tioga.slice(tioga.indexOf('"2013"'), tioga.indexOf('"2015"')), /"25G"/);

  const ranger = fleet.slice(fleet.indexOf('    "Tioga Ranger": {'), fleet.indexOf("    Pulse: {"));
  assert.match(ranger, /"2013": \["25G", "28Y", "28Z", "31M", "31N", "31W"\]/);
  assert.match(ranger, /"2014": \["25G", "28Z", "31A", "31D", "31M"\]/);
  assert.doesNotMatch(ranger, /"2013": \["25K", "31N"\]/);

  const pulse = fleet.slice(fleet.indexOf("    Pulse: {"), fleet.indexOf("    Altitude: {"));
  assert.doesNotMatch(pulse, /"2013"/);
  assert.doesNotMatch(pulse, /"2014"/);
  assert.match(pulse, /yearStart:\s*2018/);

  const disc13 = findPowertrainCorrection("2013", "Fleetwood", "Discovery", "36J");
  assert.equal(disc13!.horsepower, 380);
  assert.equal(disc13!.torqueLbFt, 1050);
  assert.equal(disc13!.fuelType, "Diesel");
  assert.match(disc13!.engine, /ISC|8\.3/);
  assert.doesNotMatch(disc13!.engine, /ISL|ISB/);
  const disc14 = findPowertrainCorrection("2014", "Fleetwood", "Discovery", "40X");
  assert.equal(disc14!.horsepower, 380);
  assert.equal(disc14!.torqueLbFt, 1150);
  assert.match(disc14!.engine, /ISL/);
  assert.doesNotMatch(disc14!.engine, /ISC|ISB/);

  assert.equal(findPowertrainCorrection("2013", "Fleetwood", "Discovery LXE", "40G"), null);
  assert.equal(findPowertrainCorrection("2014", "Fleetwood", "Discovery LXE", "40M"), null);

  const bounder13 = findPowertrainCorrection("2013", "Fleetwood", "Bounder", "35K");
  assert.equal(bounder13!.horsepower, 362);
  assert.equal(bounder13!.torqueLbFt, 457);
  assert.equal(bounder13!.fuelType, "Gas");
  assert.match(bounder13!.engine, /V10|6\.8/);
  assert.notEqual(bounder13!.horsepower, 320);
  const bounder14 = findPowertrainCorrection("2014", "Fleetwood", "Bounder", "36E");
  assert.equal(bounder14!.horsepower, 362);

  const classic13gas = findPowertrainCorrection("2013", "Fleetwood", "Bounder Classic", "30T");
  assert.equal(classic13gas!.horsepower, 362);
  const classic13opt = findPowertrainCorrection("2013", "Fleetwood", "Bounder Classic", "34B");
  assert.equal(classic13opt!.horsepower, 0);
  const classic14 = findPowertrainCorrection("2014", "Fleetwood", "Bounder Classic", "36R");
  assert.equal(classic14!.horsepower, 362);
  assert.equal(classic14!.fuelType, "Gas");

  const south13 = findPowertrainCorrection("2013", "Fleetwood", "Southwind", "36S");
  assert.equal(south13!.horsepower, 362);
  const south14 = findPowertrainCorrection("2014", "Fleetwood", "Southwind", "34A");
  assert.equal(south14!.horsepower, 362);

  assert.equal(findPowertrainCorrection("2013", "Fleetwood", "Pace Arrow", "33D"), null);
  assert.equal(findPowertrainCorrection("2014", "Fleetwood", "Pace Arrow", "35R"), null);

  const storm13 = findPowertrainCorrection("2013", "Fleetwood", "Storm", "32BH");
  assert.equal(storm13!.horsepower, 362);
  assert.equal(storm13!.fuelType, "Gas");
  const storm14 = findPowertrainCorrection("2014", "Fleetwood", "Storm", "32H");
  assert.equal(storm14!.horsepower, 362);

  assert.equal(findPowertrainCorrection("2013", "Fleetwood", "Flair", "28A"), null);
  assert.equal(findPowertrainCorrection("2014", "Fleetwood", "Flair", "30U"), null);

  const jam13 = findPowertrainCorrection("2013", "Fleetwood", "Jamboree", "25G");
  assert.equal(jam13!.horsepower, 305);
  assert.equal(jam13!.torqueLbFt, 420);
  assert.equal(jam13!.fuelType, "Gas");
  assert.doesNotMatch(jam13!.engine, /7\.3/);
  const jam14 = findPowertrainCorrection("2014", "Fleetwood", "Jamboree", "31A");
  assert.equal(jam14!.horsepower, 305);

  const tioga13 = findPowertrainCorrection("2013", "Fleetwood", "Tioga", "23B");
  assert.equal(tioga13!.horsepower, 0);
  assert.equal(tioga13!.fuelType, "Gas");
  const tioga14 = findPowertrainCorrection("2014", "Fleetwood", "Tioga", "31M");
  assert.equal(tioga14!.horsepower, 0);

  const ranger13 = findPowertrainCorrection("2013", "Fleetwood", "Tioga Ranger", "28Y");
  assert.equal(ranger13!.horsepower, 305);
  assert.equal(ranger13!.torqueLbFt, 420);
  const ranger14 = findPowertrainCorrection("2014", "Fleetwood", "Tioga Ranger", "31D");
  assert.equal(ranger14!.horsepower, 305);

  assert.equal(findPowertrainCorrection("2014", "Fleetwood", "Pulse", "24A"), null);
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
  assert.equal(nm["New Aire"]?.years?.includes(2014), false);
  assert.equal(nm["New Aire"]?.years?.includes(2018), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2015), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2016), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2014), false);
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
  assert.doesNotMatch(na, /"2014"/);
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

test("Newmar 2013–2014 walk-back: OEM plans, no invented ghosts", () => {
  const nm = CATALOG_INDEX.Newmar;
  assert.ok(nm);

  assert.equal(nm["London Aire"]?.years?.includes(2013), false);
  assert.equal(nm["London Aire"]?.years?.includes(2014), false);
  assert.equal(nm["London Aire"]?.years?.includes(2015), true);
  assert.equal(nm["London Aire"]?.yearEnd, undefined);
  assert.equal(nm["Ventana LE"]?.yearEnd, 2019);
  assert.equal(nm["Ventana LE"]?.years?.includes(2013), true);
  assert.equal(nm["Ventana LE"]?.years?.includes(2014), true);
  assert.equal(nm["New Aire"]?.years?.includes(2013), false);
  assert.equal(nm["New Aire"]?.years?.includes(2014), false);
  assert.equal(nm["New Aire"]?.yearStart, 2018);
  assert.equal(nm["New Aire"]?.years?.includes(2018), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2013), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2014), false);
  assert.equal(nm["Kountry Star"]?.years?.includes(2012), true);
  assert.equal(nm["Kountry Star"]?.years?.includes(2020), true);
  assert.equal(nm["Kountry Star"]?.yearEnd, 2024);
  assert.equal(nm["Super Star"]?.years?.includes(2013), false);
  assert.equal(nm["Super Star"]?.years?.includes(2014), false);
  assert.equal(nm["Supreme Aire"]?.years?.includes(2013), false);
  assert.equal(nm["Northern Star"]?.years?.includes(2014), false);
  assert.equal(nm["Freedom Aire"]?.years?.includes(2014), false);
  assert.equal(nm["Summit Aire"]?.years?.includes(2014), false);
  assert.equal(nm["Grand Star"]?.years?.includes(2014), false);

  const block = src("rvData.ts");
  const n0 = block.indexOf("  Newmar: {");
  const n1 = block.indexOf("  Tiffin: {");
  const newmar = block.slice(n0, n1);

  const essex0 = newmar.indexOf("    Essex: {");
  const essex = newmar.slice(essex0, newmar.indexOf('    "King Aire"'));
  assert.match(essex, /"2013": \["4542", "4544", "4547", "4548"\]/);
  assert.match(essex, /"2014": \["4544", "4552", "4553", "4554", "4557"\]/);
  assert.doesNotMatch(essex, /"2013": \["4551", "4544"/);
  assert.match(essex, /"2015": \["4501", "4503", "4553", "4568", "4599"\]/);

  const ka0 = newmar.indexOf('    "King Aire": {');
  const ka = newmar.slice(ka0, newmar.indexOf('    "Mountain Aire"'));
  assert.match(ka, /"2013": \["4582", "4584", "4587", "4588"\]/);
  assert.match(ka, /"2014": \["4584", "4592", "4593", "4594", "4597", "4599"\]/);
  assert.doesNotMatch(ka, /"2013": \["45AHQ"/);

  const ma0 = newmar.indexOf('    "Mountain Aire": {');
  const ma = newmar.slice(ma0, newmar.indexOf('    "Dutch Star"'));
  assert.match(ma, /"2013": \["4018", "4038", "4314", "4319", "4336", "4344", "4347"\]/);
  assert.match(ma, /"2014": \["4018", "4038", "4360", "4361", "4364", "4369", "4372", "4374"\]/);
  assert.doesNotMatch(ma, /"2013": \["4536", "4553", "4304"\]/);

  const ds0 = newmar.indexOf('    "Dutch Star": {');
  const ds = newmar.slice(ds0, newmar.indexOf('    "New Aire"'));
  assert.match(
    ds,
    /"2013": \["3734", "3735", "4018", "4038", "4318", "4324", "4338", "4344", "4347", "4353"\]/,
  );
  assert.match(
    ds,
    /"2014": \["3736", "3738", "4018", "4038", "4360", "4364", "4369", "4372", "4373", "4374"\]/,
  );
  assert.doesNotMatch(ds, /"2013": \["4018", "4081"/);

  const na0 = newmar.indexOf('    "New Aire": {');
  const na = newmar.slice(na0, newmar.indexOf("    Ventana: {"));
  assert.doesNotMatch(na, /"2013"/);
  assert.doesNotMatch(na, /"2014"/);
  assert.match(na, /"2018": \["3341", "3343"\]/);
  assert.match(na, /yearStart:\s*2018/);

  const vt0 = newmar.indexOf("    Ventana: {");
  const vt = newmar.slice(vt0, newmar.indexOf('    "Ventana LE"'));
  assert.match(
    vt,
    /"2013": \["3433","3434","3634","4018","4038","4324","4337","4346"\]/,
  );
  assert.match(
    vt,
    /"2014": \["3433","3436","3634","4036","4037","4039","4360","4369","4373","4377"\]/,
  );
  assert.doesNotMatch(vt, /"2013": \["3436","3717"/);

  const le0 = newmar.indexOf('    "Ventana LE": {');
  const le = newmar.slice(le0, newmar.indexOf('    "Northern Star"'));
  assert.match(le, /"2013": \["3433","3434","3634","3843","3862"\]/);
  assert.match(le, /"2014": \["3433","3436","3634","3845","3847","3849","3850"\]/);
  assert.match(le, /yearEnd:\s*2019/);
  assert.doesNotMatch(le.slice(le.indexOf('"2013"'), le.indexOf('"2015"')), /"4002"|"4037"/);

  const la0 = newmar.indexOf('    "London Aire": {');
  const la = newmar.slice(la0, newmar.indexOf('    "Kountry Star"'));
  assert.doesNotMatch(la, /"2013"/);
  assert.doesNotMatch(la, /"2014"/);
  assert.match(la, /"2015": \["4501", "4503", "4553", "4568", "4599"\]/);
  assert.doesNotMatch(la, /yearEnd:\s*\d+/);

  const ks0 = newmar.indexOf('    "Kountry Star": {');
  const ks = newmar.slice(ks0, newmar.indexOf('    "Bay Star": {'));
  assert.doesNotMatch(ks, /"2013"/);
  assert.doesNotMatch(ks, /"2014"/);
  assert.match(ks, /yearEnd:\s*2024/);

  const bs0 = newmar.indexOf('    "Bay Star": {');
  const bs = newmar.slice(bs0, newmar.indexOf('    "Bay Star Sport"'));
  assert.match(
    bs,
    /"2013": \["2901", "3002", "3012", "3209", "3302", "3305"\]/,
  );
  assert.match(
    bs,
    /"2014": \["2903", "3103", "3124", "3215", "3308", "3309"\]/,
  );
  assert.match(bs, /fuelType:\s*"Gas"/);
  assert.doesNotMatch(bs, /"2013": \["3124", "3401", "3626"\]/);

  const bss0 = newmar.indexOf('    "Bay Star Sport": {');
  const bss = newmar.slice(bss0);
  assert.match(bss, /"2013": \["2702", "2901", "3209", "3310"\]/);
  assert.match(bss, /"2014": \["2702", "2903", "3220", "3306"\]/);

  const cs0 = newmar.indexOf('    "Canyon Star": {');
  const cs = newmar.slice(cs0, newmar.indexOf('    "London Aire"'));
  assert.match(
    cs,
    /"2013": \["3313", "3515", "3610", "3810", "3856", "3911", "3920", "3940", "3953"\]/,
  );
  assert.match(
    cs,
    /"2014": \["3424", "3610", "3630", "3650", "3910", "3911", "3920", "3921", "3940", "3953", "3956"\]/,
  );
  assert.doesNotMatch(cs.slice(cs.indexOf('"2013"'), cs.indexOf('"2015"')), /"3947"/);
  assert.doesNotMatch(cs, /"2013": \["3710", "3927"\]/);

  const essex13 = findPowertrainCorrection("2013", "Newmar", "Essex", "4544");
  assert.equal(essex13!.horsepower, 500);
  assert.match(essex13!.engine, /ISX/);
  assert.doesNotMatch(essex13!.engine, /600|X15|605/);
  const essex14 = findPowertrainCorrection("2014", "Newmar", "Essex", "4553");
  assert.equal(essex14!.horsepower, 500);
  const ka13 = findPowertrainCorrection("2013", "Newmar", "King Aire", "4587");
  assert.equal(ka13!.horsepower, 600);
  const ka14 = findPowertrainCorrection("2014", "Newmar", "King Aire", "4599");
  assert.equal(ka14!.horsepower, 600);
  const ma13 = findPowertrainCorrection("2013", "Newmar", "Mountain Aire", "4344");
  assert.equal(ma13!.horsepower, 450);
  assert.match(ma13!.engine, /ISL/);
  assert.doesNotMatch(ma13!.engine, /ISX|500|L9/);
  const ma14 = findPowertrainCorrection("2014", "Newmar", "Mountain Aire", "4369");
  assert.equal(ma14!.horsepower, 450);
  assert.doesNotMatch(ma14!.engine, /ISX|500|525/);
  const ds13short = findPowertrainCorrection("2013", "Newmar", "Dutch Star", "3734");
  assert.equal(ds13short!.horsepower, 400);
  assert.match(ds13short!.engine, /ISL/);
  const ds13long = findPowertrainCorrection("2013", "Newmar", "Dutch Star", "4318");
  assert.equal(ds13long!.horsepower, 450);
  const ds14 = findPowertrainCorrection("2014", "Newmar", "Dutch Star", "3736");
  assert.equal(ds14!.horsepower, 450);
  const vt13short = findPowertrainCorrection("2013", "Newmar", "Ventana", "3433");
  assert.equal(vt13short!.horsepower, 360);
  const vt13long = findPowertrainCorrection("2013", "Newmar", "Ventana", "4346");
  assert.equal(vt13long!.horsepower, 380);
  assert.match(vt13long!.engine, /ISC/);
  const vt14short = findPowertrainCorrection("2014", "Newmar", "Ventana", "3436");
  assert.equal(vt14short!.horsepower, 360);
  const vt14long = findPowertrainCorrection("2014", "Newmar", "Ventana", "4369");
  assert.equal(vt14long!.horsepower, 400);
  const le13 = findPowertrainCorrection("2013", "Newmar", "Ventana LE", "3862");
  assert.equal(le13!.horsepower, 340);
  const le14 = findPowertrainCorrection("2014", "Newmar", "Ventana LE", "3850");
  assert.equal(le14!.horsepower, 340);
  const le14shared = findPowertrainCorrection("2014", "Newmar", "Ventana LE", "3436");
  assert.equal(le14shared!.horsepower, 340);
  const bay13 = findPowertrainCorrection("2013", "Newmar", "Bay Star", "3209");
  assert.equal(bay13!.horsepower, 362);
  assert.equal(bay13!.fuelType, "Gas");
  assert.match(bay13!.engine, /V10|Triton/i);
  const bay14 = findPowertrainCorrection("2014", "Newmar", "Bay Star", "3124");
  assert.equal(bay14!.horsepower, 362);
  assert.equal(bay14!.fuelType, "Gas");
  const sport13 = findPowertrainCorrection("2013", "Newmar", "Bay Star Sport", "2702");
  assert.equal(sport13!.horsepower, 362);
  assert.equal(sport13!.fuelType, "Gas");
  const sport14 = findPowertrainCorrection("2014", "Newmar", "Bay Star Sport", "3306");
  assert.equal(sport14!.horsepower, 362);
  const cs13 = findPowertrainCorrection("2013", "Newmar", "Canyon Star", "3911");
  assert.equal(cs13!.horsepower, 362);
  assert.equal(cs13!.fuelType, "Gas");
  assert.match(cs13!.engine, /V10|Triton/i);
  assert.doesNotMatch(cs13!.engine, /Cummins|B6\.7|FED|diesel/i);
  const cs14 = findPowertrainCorrection("2014", "Newmar", "Canyon Star", "3424");
  assert.equal(cs14!.horsepower, 362);
  assert.equal(cs14!.fuelType, "Gas");

  assert.equal(findPowertrainCorrection("2013", "Newmar", "Super Star", "3746"), null);
  assert.equal(findPowertrainCorrection("2014", "Newmar", "Supreme Aire", "4573"), null);
  assert.equal(findPowertrainCorrection("2013", "Newmar", "Kountry Star", "3712"), null);
  assert.equal(findPowertrainCorrection("2014", "Newmar", "Kountry Star", "3712"), null);
  assert.equal(findPowertrainCorrection("2013", "Newmar", "New Aire", "3543"), null);
  assert.equal(findPowertrainCorrection("2014", "Newmar", "New Aire", "3543"), null);
  assert.equal(findPowertrainCorrection("2013", "Newmar", "London Aire", "4551"), null);
  assert.equal(findPowertrainCorrection("2014", "Newmar", "London Aire", "4551"), null);
  assert.equal(findPowertrainCorrection("2014", "Newmar", "Northern Star", "3418"), null);
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

test("Entegra 2025–2027 OEM year-first floorplans + yearEnds", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);

  assert.equal(eg.Cornerstone?.yearEnd, 2026);
  assert.equal(eg.Cornerstone?.years?.includes(2026), true);
  assert.equal(eg.Cornerstone?.years?.includes(2027), false);
  assert.equal(eg.Anthem?.yearEnd, 2026);
  assert.equal(eg.Anthem?.years?.includes(2027), false);
  assert.equal(eg.Aspire?.yearEnd, 2026);
  assert.equal(eg.Aspire?.years?.includes(2027), false);
  assert.equal(eg.Reatta?.yearEnd, 2025);
  assert.equal(eg.Reatta?.years?.includes(2026), false);
  assert.equal(eg["Reatta XL"]?.yearEnd, 2025);
  assert.equal(eg["Reatta XL"]?.years?.includes(2026), false);
  assert.equal(eg["Cornerstone Reserve"]?.yearStart, 2026);
  assert.equal(eg["Cornerstone Reserve"]?.yearEnd, 2026);
  assert.equal(eg.Esteem?.yearEnd, 2026);
  assert.equal(eg.Esteem?.years?.includes(2025), false);
  assert.equal(eg.Esteem?.years?.includes(2027), false);

  assert.equal(eg.Vision?.years?.includes(2027), true);
  assert.equal(eg["Vision XL"]?.years?.includes(2027), true);
  assert.equal(eg["Vision SE"]?.yearStart, 2026);
  assert.equal(eg["Vision SE"]?.years?.includes(2027), true);
  assert.equal(eg.Emblem?.yearStart, 2019);
  assert.equal(eg.Emblem?.years?.includes(2023), true);
  assert.equal(eg.Emblem?.years?.includes(2027), true);
  assert.equal(eg.Accolade?.years?.includes(2027), true);
  assert.equal(eg["Accolade XL"]?.years?.includes(2027), true);
  assert.equal(eg["Accolade XT"]?.yearStart, 2023);
  assert.equal(eg["Accolade XT"]?.years?.includes(2023), true);
  assert.equal(eg["Accolade XT"]?.years?.includes(2025), false);
  assert.equal(eg["Accolade XT"]?.type, "Super C");
  assert.equal(eg["Accolade XT"]?.fuelType, "Diesel");
  assert.equal(eg["Esteem XL"]?.type, "Super C");
  assert.equal(eg["Esteem XL"]?.yearStart, 2026);
  assert.equal(eg.Centurion?.years?.includes(2027), true);

  assert.equal(eg.Expanse?.type, "Class B");
  assert.equal(eg.Expanse?.fuelType, "Gas");
  assert.equal(eg.Expanse?.yearStart, 2023);
  assert.equal(eg.Expanse?.years?.includes(2020), false);
  assert.equal(eg.Expanse?.years?.includes(2023), true);
  assert.equal(eg.Expanse?.years?.includes(2025), false);
  assert.equal(eg.Launch?.type, "Class B");
  assert.equal(eg.Ethos?.type, "Class B");
  assert.equal(eg.Insignia?.type, "Class B");
  assert.equal(eg.Arc?.type, "Class B");
  assert.equal(eg.Condor?.type, "Class C");
  assert.equal(eg["Odyssey SE"]?.yearStart, 2024);
  assert.equal(eg["Odyssey SE"]?.years?.includes(2023), false);
  assert.equal(eg["Odyssey SE"]?.years?.includes(2025), false);
  assert.equal(eg["Odyssey Esteem Edition"]?.yearStart, 2027);
  assert.equal(eg["Qwest SE"]?.yearStart, 2026);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);

  const cs0 = entegra.indexOf('    "Cornerstone": {');
  const cs = entegra.slice(cs0, entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2024": \["45B", "45D", "45R", "45W", "45Z"\]/);
  assert.match(cs, /"2025": \["45B", "45D", "45R", "45W", "45Z"\]/);
  assert.match(cs, /"2026": \["45B", "45D", "45R", "45V", "45Z"\]/);
  assert.doesNotMatch(cs, /"2025": \["45A"/);
  assert.doesNotMatch(cs, /"2026": \["45C"/);
  assert.doesNotMatch(cs, /"2027":/);

  const an0 = entegra.indexOf('    "Anthem": {');
  const an = entegra.slice(an0, entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2025": \["37K", "44B", "44D", "44R", "44W", "44Z"\]/);
  assert.match(an, /"2026": \["37K", "44B", "44D", "44R", "44V", "44Z"\]/);
  assert.doesNotMatch(an, /"2026": \["44F"/);
  assert.doesNotMatch(an, /"2027":/);

  const as0 = entegra.indexOf('    "Aspire": {');
  const as = entegra.slice(as0, entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2025": \["40P", "44B", "44D", "44R", "44W", "44Z"\]/);
  assert.match(as, /"2026": \["44B", "44D", "44R", "44V", "44Z"\]/);
  assert.doesNotMatch(as, /"2026": \["40P"/);
  assert.doesNotMatch(as, /37JT/);

  const re0 = entegra.indexOf('    "Reatta": {');
  const re = entegra.slice(re0, entegra.indexOf('    "Reatta XL"'));
  assert.match(re, /"2025": \["37K", "39BH", "39T2"\]/);
  assert.doesNotMatch(re, /"2026":/);

  const rxl0 = entegra.indexOf('    "Reatta XL": {');
  const rxl = entegra.slice(rxl0, entegra.indexOf('    "Vision": {'));
  assert.match(rxl, /"2025": \["37K", "39BH", "39T2", "40Q3"\]/);
  assert.doesNotMatch(rxl, /"2026":/);

  const vi0 = entegra.indexOf('    "Vision": {');
  const vi = entegra.slice(vi0, entegra.indexOf('    "Vision XL"'));
  assert.match(vi, /"2024": \["27A", "29F", "29S"\]/);
  assert.match(vi, /"2025": \["27A", "29F", "29S"\]/);
  assert.match(vi, /"2027": \["27A", "29F", "29S"\]/);
  assert.doesNotMatch(vi, /"2025": \["27A", "29S", "31B"\]/);
  assert.doesNotMatch(vi, /"2027": \["31F"/);

  const vxl0 = entegra.indexOf('    "Vision XL": {');
  const vxl = entegra.slice(vxl0, entegra.indexOf('    "Accolade": {'));
  assert.match(vxl, /"2025": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.match(vxl, /"2027": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.doesNotMatch(vxl, /"2027": \["29S"/);

  const ac0 = entegra.indexOf('    "Accolade": {');
  const ac = entegra.slice(ac0, entegra.indexOf('    "Accolade XL"'));
  assert.match(ac, /"2026": \["37K", "37L", "37M"\]/);
  assert.match(ac, /"2027": \["37K", "37L", "37M"\]/);
  assert.doesNotMatch(ac, /"2025": .*(37RB|37TS|39WB)/);
  assert.doesNotMatch(ac, /"2026": .*(37RB|37TS|39WB)/);
  assert.doesNotMatch(ac, /"2027": .*(37RB|37TS|39WB)/);
  assert.doesNotMatch(ac, /39WB/);

  const axl0 = entegra.indexOf('    "Accolade XL": {');
  const axl = entegra.slice(axl0, entegra.indexOf('    "Centurion": {'));
  assert.match(axl, /"2025": \["37M", "37K"\]/);
  assert.match(axl, /"2026": \["37K", "37L", "37M"\]/);
  assert.match(axl, /"2027": \["37K", "37L", "37M"\]/);
  assert.doesNotMatch(axl, /37TSR|39TBR/);

  const od0 = entegra.indexOf('    "Odyssey": {');
  const od = entegra.slice(od0, entegra.indexOf('    "Esteem": {'));
  assert.match(od, /"2024": \["24B", "25R", "26M", "27U", "29V", "30Z", "31F"\]/);
  assert.match(od, /"2025": \["24B", "25R", "26M", "27U", "29V", "30Z", "31F"\]/);
  assert.match(od, /"2027": \["24B", "25R", "26M", "27G", "27U", "29V", "30Z", "31F"\]/);
  assert.doesNotMatch(od, /"2026": \["24B".*"27G"/);

  const es0 = entegra.indexOf('    "Esteem": {');
  const es = entegra.slice(es0, entegra.indexOf('    "Qwest": {'));
  assert.match(es, /"2024": \["27U", "29V", "31F"\]/);
  assert.match(es, /"2026": \["27U", "29V", "31F"\]/);
  assert.doesNotMatch(es, /"2025":/);
  assert.doesNotMatch(es, /26E|27P/);
  assert.doesNotMatch(es, /"2024": .*"30X"/);
  assert.doesNotMatch(es, /"2026": .*"30X"/);

  const qw0 = entegra.indexOf('    "Qwest": {');
  const qw = entegra.slice(qw0, entegra.indexOf('    "Cornerstone Reserve"'));
  assert.match(qw, /"2025": \["24L", "24R"\]/);
  assert.match(qw, /"2026": \["25L", "25M", "25R"\]/);
  assert.match(qw, /"2027": \["25L", "25M", "25R"\]/);
  assert.doesNotMatch(qw, /"2026": \["24L"/);

  const ex0 = entegra.indexOf('    "Expanse": {');
  const ex = entegra.slice(ex0, entegra.indexOf('    "Odyssey": {'));
  assert.match(ex, /"2026": \["21B", "21T"\]/);
  assert.match(ex, /"2027": \["21L", "21T"\]/);
  assert.doesNotMatch(ex, /26RB|33LB|35RKT/);

  const et0 = entegra.indexOf('    "Ethos": {');
  const et = entegra.slice(et0, entegra.indexOf('    "Insignia": {'));
  assert.match(et, /"2026": \["20A", "20E", "20T"\]/);
  assert.match(et, /"2027": \["20E", "20T"\]/);
  assert.doesNotMatch(et, /"2027": \["20A"/);

  const acc = findPowertrainCorrection("2027", "Entegra Coach", "Accolade", "37K");
  assert.equal(acc!.horsepower, 360);
  assert.equal(acc!.torqueLbFt, 800);
  assert.match(acc!.engine, /ISB/);
  const xt = findPowertrainCorrection("2027", "Entegra Coach", "Accolade XT", "29T");
  assert.equal(xt!.horsepower, 330);
  assert.equal(xt!.torqueLbFt, 950);
  assert.match(xt!.engine, /Power Stroke/);
  const vis27 = findPowertrainCorrection("2027", "Entegra Coach", "Vision", "27A");
  assert.equal(vis27!.horsepower, 335);
  assert.equal(vis27!.fuelType, "Gas");
  const vis24 = findPowertrainCorrection("2024", "Entegra Coach", "Vision", "27A");
  assert.equal(vis24!.horsepower, 335);
  const vxl27 = findPowertrainCorrection("2027", "Entegra Coach", "Vision XL", "36C");
  assert.equal(vxl27!.horsepower, 335);
  const vse = findPowertrainCorrection("2027", "Entegra Coach", "Vision SE", "27ASE");
  assert.equal(vse!.horsepower, 335);
  const emb = findPowertrainCorrection("2027", "Entegra Coach", "Emblem", "36B");
  assert.equal(emb!.horsepower, 335);
  const rxl25 = findPowertrainCorrection("2025", "Entegra Coach", "Reatta XL", "37K");
  assert.equal(rxl25!.horsepower, 380);
  assert.equal(rxl25!.torqueLbFt, 1150);
  const re25 = findPowertrainCorrection("2025", "Entegra Coach", "Reatta", "37K");
  assert.equal(re25!.horsepower, 360);
  const od27 = findPowertrainCorrection("2027", "Entegra Coach", "Odyssey", "27G");
  assert.equal(od27!.horsepower, 325);
  assert.equal(od27!.torqueLbFt, 450);
  const odse27 = findPowertrainCorrection("2027", "Entegra Coach", "Odyssey SE", "22AF");
  assert.equal(odse27!.horsepower, 0);
  assert.match(odse27!.engine, /Chevy|401/);
  const c22 = findPowertrainCorrection("2027", "Entegra Coach", "Condor", "22T");
  assert.equal(c22!.horsepower, 310);
  assert.equal(c22!.fuelType, "Gas");
  const c23 = findPowertrainCorrection("2027", "Entegra Coach", "Condor", "23S");
  assert.equal(c23!.horsepower, 211);
  assert.equal(c23!.fuelType, "Diesel");
  const exp = findPowertrainCorrection("2027", "Entegra Coach", "Expanse", "21T");
  assert.equal(exp!.horsepower, 310);
  assert.equal(exp!.fuelType, "Gas");
  const cen = findPowertrainCorrection("2027", "Entegra Coach", "Centurion", "39N");
  assert.equal(cen!.horsepower, 525);
  const cen45 = findPowertrainCorrection("2027", "Entegra Coach", "Centurion", "45D");
  assert.equal(cen45!.horsepower, 600);
});

test("Jayco 2025–2027 OEM year-first floorplans + yearEnds", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Embark?.yearEnd, 2023);
  assert.equal(jc.Embark?.years?.includes(2023), true);
  assert.equal(jc.Embark?.years?.includes(2024), false);
  assert.equal(jc.Embark?.years?.includes(2027), false);
  assert.equal(jc.Embark?.type, "Class A Diesel");
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.yearStart, 2009);
  assert.equal(jc["Embark Super C"]?.yearEnd, 2012);
  assert.equal(jc["Embark Super C"]?.years?.includes(2012), true);
  assert.equal(jc["Embark Super C"]?.years?.includes(2019), false);

  assert.equal(jc.Precept?.years?.includes(2027), true);
  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2019), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2020), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2021), false);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2022), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2023), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2025), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2027), true);
  assert.equal(jc.Alante?.years?.includes(2027), true);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);
  assert.equal(jc["Alante SE"]?.years?.includes(2027), true);
  assert.equal(jc.Seneca?.years?.includes(2027), true);
  assert.equal(jc["Seneca Super C"]?.years?.includes(2027), true);
  assert.equal(jc["Seneca Prestige"]?.type, "Super C");
  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca XT"]?.type, "Super C");
  assert.equal(jc["Seneca XT"]?.fuelType, "Diesel");
  assert.equal(jc["Greyhawk XL"]?.type, "Super C");
  assert.equal(jc["Greyhawk XL"]?.fuelType, "Diesel");
  assert.equal(jc["Greyhawk Prestige"]?.yearStart, 2018);
  assert.equal(jc["Greyhawk Prestige"]?.yearEnd, 2022);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Terrain?.yearStart, 2022);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);
  assert.equal(jc["Granite Ridge"]?.type, "Class C");
  assert.equal(jc.Comet?.type, "Class B");
  assert.equal(jc.Swift?.type, "Class B");
  assert.equal(jc.Solstice?.type, "Class B");
  assert.equal(jc.Terrain?.type, "Class B");
  assert.equal(jc.Comet?.fuelType, "Gas");
  assert.equal(jc.Terrain?.fuelType, "Diesel");

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr0 = jayco.indexOf("    Precept: {");
  const pr = jayco.slice(pr0, jayco.indexOf("    Alante: {"));
  assert.match(pr, /"2025": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.match(pr, /"2027": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.doesNotMatch(pr, /"2026": .*"29V"/);
  assert.doesNotMatch(pr, /"2025": \["31UL", "34G", "36A"\]/);

  const al0 = jayco.indexOf("    Alante: {");
  const al = jayco.slice(al0, jayco.indexOf("    Embark: {"));
  assert.match(al, /"2025": \["27A", "29F", "29S"\]/);
  assert.match(al, /"2027": \["27A", "29F", "29S"\]/);
  assert.doesNotMatch(al, /"2025": \["26X"/);
  assert.doesNotMatch(al, /"2026": .*"28H"/);

  const em0 = jayco.indexOf("    Embark: {");
  const em = jayco.slice(em0, jayco.indexOf("    Seneca: {"));
  assert.doesNotMatch(em, /"2024":/);
  assert.doesNotMatch(em, /"2025":/);
  assert.doesNotMatch(em, /"2026":/);
  assert.doesNotMatch(em, /"2027":/);

  const se0 = jayco.indexOf("    Seneca: {");
  const se = jayco.slice(se0, jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2025": \["37K", "37L", "37M"\]/);
  assert.match(se, /"2026": \["37K", "37L", "37M"\]/);
  assert.match(se, /"2027": \["33J", "37K", "37L", "37M"\]/);
  assert.doesNotMatch(se, /"2026": .*"33J"/);

  const gh0 = jayco.indexOf("    Greyhawk: {");
  const gh = jayco.slice(gh0, jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2025": \["27U", "29MV", "30Z", "31F"\]/);
  assert.match(gh, /"2027": \["27U", "29MV", "30Z", "31F"\]/);
  assert.doesNotMatch(gh, /"2025": .*"30X"/);
  assert.doesNotMatch(gh, /"2026": .*"26Y"/);

  const rh0 = jayco.indexOf("    Redhawk: {");
  const rh = jayco.slice(rh0, jayco.indexOf("    Melbourne: {"));
  assert.match(rh, /"2025": \["24B", "26M", "29XK", "31F"\]/);
  assert.match(rh, /"2026": \["24B", "26M", "29XK", "31F"\]/);
  assert.match(rh, /"2027": \["24B", "26M", "27G"\]/);
  assert.doesNotMatch(rh, /"2027": .*"29XK"/);
  assert.doesNotMatch(rh, /"2026": .*"27G"/);

  const mb0 = jayco.indexOf("    Melbourne: {");
  const mb = jayco.slice(mb0, jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2025": \["24L", "24R"\]/);
  assert.match(mb, /"2026": \["24L", "24R"\]/);
  assert.match(mb, /"2027": \["25L", "25R"\]/);
  assert.doesNotMatch(mb, /"2026": \["25L"/);
  assert.doesNotMatch(mb, /"2027": \["24L"/);
  assert.doesNotMatch(mb, /"2025": .*"24K"/);

  const mp0 = jayco.indexOf('    "Melbourne Prestige": {');
  const mp = jayco.slice(mp0, jayco.indexOf('    "Alante SE"'));
  assert.match(mp, /"2025": \["24LP", "24RP"\]/);
  assert.match(mp, /"2026": \["25LP", "25MP", "25RP"\]/);
  assert.match(mp, /"2027": \["25LP", "25MP", "25RP"\]/);
  assert.doesNotMatch(mp, /"2025": .*"25LP"/);
  assert.match(mp, /melburne-prestige/);

  const ase0 = jayco.indexOf('    "Alante SE": {');
  const ase = jayco.slice(ase0, jayco.indexOf('    "Precept Prestige"'));
  assert.match(ase, /"2027": \["27ASE"\]/);
  assert.doesNotMatch(ase, /"2024":/);

  const gxl0 = jayco.indexOf('    "Greyhawk XL": {');
  const gxl = jayco.slice(gxl0, jayco.indexOf('    "Granite Ridge"'));
  assert.match(gxl, /"2025": \["30M", "32U", "33F"\]/);
  assert.match(gxl, /"2027": \["32U", "33F"\]/);
  assert.doesNotMatch(gxl, /"2027": .*"30M"/);

  const sxt0 = jayco.indexOf('    "Seneca XT": {');
  const sxt = jayco.slice(sxt0, jayco.indexOf('    "Seneca Prestige"'));
  assert.match(sxt, /"2025": \["29T", "32U", "35L"\]/);
  assert.match(sxt, /"2027": \["32U", "35L"\]/);
  assert.doesNotMatch(sxt, /"2027": .*"29T"/);

  const sw0 = jayco.indexOf("    Swift: {");
  const sw = jayco.slice(sw0, jayco.indexOf("    Solstice: {"));
  assert.match(sw, /"2025": \["20A", "20E", "20T", "20Y"\]/);
  assert.match(sw, /"2026": \["20A", "20E", "20T"\]/);
  assert.match(sw, /"2027": \["20E", "20T"\]/);
  assert.doesNotMatch(sw, /"2027": .*"20A"/);

  const so0 = jayco.indexOf("    Solstice: {");
  const so = jayco.slice(so0, jayco.indexOf("    Terrain: {"));
  assert.match(so, /"2025": \["21B"\]/);
  assert.match(so, /"2026": \["21B", "21L", "21T"\]/);
  assert.match(so, /"2027": \["21L", "21T"\]/);
  assert.doesNotMatch(so, /"2027": .*"21B"/);

  const co0 = jayco.indexOf("    Comet: {");
  const co = jayco.slice(co0, jayco.indexOf("    Swift: {"));
  assert.match(co, /"2025": \["18C"\]/);
  assert.match(co, /"2027": \["18C", "18L"\]/);
  assert.doesNotMatch(co, /"2026": .*"18L"/);

  const te0 = jayco.indexOf("    Terrain: {");
  const te = jayco.slice(te0, jayco.indexOf('    "Jay Feather"'));
  assert.match(te, /"2025": \["19Y", "19YG"\]/);
  assert.match(te, /"2027": \["19A", "19AG", "19Y", "19YG"\]/);
  assert.doesNotMatch(te, /"2025": .*"19A"/);

  const rse0 = jayco.indexOf('    "Redhawk SE": {');
  const rse = jayco.slice(rse0, jayco.indexOf('    "Greyhawk XL"'));
  assert.match(rse, /"2025": \["22A", "22AF", "22C", "22CF", "22E", "22EF", "22T", "22TF", "31FF"\]/);
  assert.doesNotMatch(rse, /"2025": .*"20LF"/);
  assert.doesNotMatch(rse, /"2026": .*"20SF"/);

  const sen = findPowertrainCorrection("2027", "Jayco", "Seneca", "37K");
  assert.equal(sen!.horsepower, 360);
  assert.equal(sen!.torqueLbFt, 800);
  assert.match(sen!.engine, /ISB/);
  const sxtPin = findPowertrainCorrection("2027", "Jayco", "Seneca XT", "32U");
  assert.equal(sxtPin!.horsepower, 330);
  assert.equal(sxtPin!.torqueLbFt, 950);
  assert.match(sxtPin!.engine, /Power Stroke/);
  const gxlPin = findPowertrainCorrection("2027", "Jayco", "Greyhawk XL", "32U");
  assert.equal(gxlPin!.horsepower, 330);
  const ghPin = findPowertrainCorrection("2027", "Jayco", "Greyhawk", "27U");
  assert.equal(ghPin!.horsepower, 325);
  assert.equal(ghPin!.torqueLbFt, 450);
  assert.equal(ghPin!.fuelType, "Gas");
  const rhPin = findPowertrainCorrection("2027", "Jayco", "Redhawk", "24B");
  assert.equal(rhPin!.horsepower, 325);
  const rsePin = findPowertrainCorrection("2027", "Jayco", "Redhawk SE", "22AF");
  assert.equal(rsePin!.horsepower, 0);
  assert.match(rsePin!.engine, /Chevy|401/);
  const prPin = findPowertrainCorrection("2027", "Jayco", "Precept", "31UL");
  assert.equal(prPin!.horsepower, 335);
  const ppPin = findPowertrainCorrection("2027", "Jayco", "Precept Prestige", "36B");
  assert.equal(ppPin!.horsepower, 335);
  const alPin = findPowertrainCorrection("2027", "Jayco", "Alante", "27A");
  assert.equal(alPin!.horsepower, 335);
  const asePin = findPowertrainCorrection("2027", "Jayco", "Alante SE", "27ASE");
  assert.equal(asePin!.horsepower, 335);
  const mbPin = findPowertrainCorrection("2027", "Jayco", "Melbourne", "25L");
  assert.equal(mbPin!.horsepower, 211);
  assert.equal(mbPin!.torqueLbFt, 332);
  const mpPin = findPowertrainCorrection("2027", "Jayco", "Melbourne Prestige", "25LP");
  assert.equal(mpPin!.horsepower, 211);
  const gr22 = findPowertrainCorrection("2027", "Jayco", "Granite Ridge", "22T");
  assert.equal(gr22!.horsepower, 310);
  assert.equal(gr22!.fuelType, "Gas");
  const gr23 = findPowertrainCorrection("2027", "Jayco", "Granite Ridge", "23S");
  assert.equal(gr23!.horsepower, 211);
  assert.equal(gr23!.fuelType, "Diesel");
  const emb23 = findPowertrainCorrection("2023", "Jayco", "Embark", "37K");
  assert.equal(emb23!.horsepower, 360);
  assert.match(emb23!.chassis || "", /Spartan K1/);
  const embSc = findPowertrainCorrection("2012", "Jayco", "Embark Super C", "QX390");
  assert.equal(embSc!.horsepower, 330);
  assert.equal(embSc!.torqueLbFt, 1000);
  const comet = findPowertrainCorrection("2027", "Jayco", "Comet", "18C");
  assert.equal(comet!.horsepower, 276);
  assert.equal(comet!.fuelType, "Gas");
  const terr = findPowertrainCorrection("2027", "Jayco", "Terrain", "19Y");
  assert.equal(terr!.horsepower, 211);
  assert.equal(terr!.fuelType, "Diesel");
});

test("Thor 2025–2027 OEM year-first floorplans + yearEnds", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  assert.equal(th.Tuscany?.yearEnd, 2023);
  assert.equal(th.Tuscany?.years?.includes(2023), true);
  assert.equal(th.Tuscany?.years?.includes(2024), false);
  assert.equal(th.Tuscany?.years?.includes(2027), false);
  assert.equal(th.Challenger?.yearEnd, 2024);
  assert.equal(th.Challenger?.years?.includes(2024), true);
  assert.equal(th.Challenger?.years?.includes(2025), false);
  assert.equal(th.Hurricane?.yearEnd, undefined);
  assert.equal(th.Hurricane?.years?.includes(2025), true);
  assert.equal(th.Hurricane?.years?.includes(2027), true);
  assert.equal(th.Seneca?.yearEnd, 2024);
  assert.equal(th.Seneca?.years?.includes(2025), false);
  assert.equal(th.Geneva?.yearEnd, 2024);
  assert.equal(th.Outlaw?.yearEnd, 2024);
  assert.equal(th["Magnitude XG"]?.yearEnd, 2024);
  assert.equal(th["Four Winds Siesta"]?.yearEnd, 2024);
  assert.equal(th["Rize Plus"]?.yearEnd, 2024);
  assert.equal(th["Palazzo GT"]?.yearEnd, 2026);
  assert.equal(th["Magnitude Grand"]?.yearEnd, 2026);
  assert.equal(th["Omni Trail"]?.yearEnd, 2026);
  assert.equal(th["Outlaw Wild West"]?.yearEnd, 2026);
  assert.equal(th.Dazzle?.yearEnd, 2025);
  assert.equal(th.Twist?.yearEnd, 2025);
  assert.equal(th["Inception HD"]?.yearStart, 2026);
  assert.equal(th["Pasadena SV"]?.yearStart, 2026);
  assert.equal(th.Resonate?.yearStart, 2023);
  assert.equal(th.Sequence?.fuelType, "Gas");
  assert.equal(th.Rize?.type, "Class B");
  assert.equal(th.Rize?.fuelType, "Gas");
  assert.equal(th.Gemini?.type, "Class C");

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const ace0 = thor.indexOf("    ACE: {");
  const ace = thor.slice(ace0, thor.indexOf("    Vegas: {"));
  assert.match(ace, /"2025": \["29D", "29G", "30C", "32B"\]/);
  assert.match(ace, /"2027": \["29D", "29G", "30C", "32B"\]/);
  assert.doesNotMatch(ace, /"2025": \["27.1"/);
  assert.doesNotMatch(ace, /"2026": .*"27.2"/);

  const ax0 = thor.indexOf("    Axis: {");
  const ax = thor.slice(ax0, thor.indexOf("    Sereno: {"));
  assert.match(ax, /"2025": \["24.1", "26.1", "26.2"\]/);
  assert.match(ax, /"2026": \["24.1", "26.1", "26.2", "28.1"\]/);
  assert.match(ax, /"2027": \["24.1", "26.1", "26.2", "28.1"\]/);
  assert.doesNotMatch(ax, /"2025": .*"28.1"/);

  const hu0 = thor.indexOf("    Hurricane: {");
  const hu = thor.slice(hu0, thor.indexOf('    "Four Winds Majestic"'));
  assert.match(hu, /"2025": \["29L", "35G", "35J", "35R"\]/);
  assert.match(hu, /"2027": \["29L", "35A", "35J", "36H"\]/);
  assert.doesNotMatch(hu, /"2026": .*"35A"/);
  assert.doesNotMatch(hu, /yearEnd:\s*2020/);

  const ws0 = thor.indexOf("    Windsport: {");
  const ws = thor.slice(ws0, thor.indexOf("    Challenger: {"));
  assert.match(ws, /"2025": \["29L", "35G", "35J", "35R"\]/);
  assert.match(ws, /"2027": \["29L", "35A", "35J", "36H"\]/);

  const ch0 = thor.indexOf("    Challenger: {");
  const ch = thor.slice(ch0, thor.indexOf("    Magnitude: {"));
  assert.doesNotMatch(ch, /"2025":/);
  assert.doesNotMatch(ch, /"2026":/);
  assert.match(ch, /yearEnd:\s*2024/);

  const tu0 = thor.indexOf("    Tuscany: {");
  const tu = thor.slice(tu0, thor.indexOf("    Palazzo: {"));
  assert.doesNotMatch(tu, /"2024":/);
  assert.doesNotMatch(tu, /"2025":/);
  assert.doesNotMatch(tu, /"2027":/);
  assert.match(tu, /yearEnd:\s*2023/);

  const pa0 = thor.indexOf("    Palazzo: {");
  const pa = thor.slice(pa0, thor.indexOf("    Aria: {"));
  assert.match(pa, /"2027": \["33.5", "33.6", "37.4", "37.5"\]/);
  assert.doesNotMatch(pa, /"2025":/);
  assert.doesNotMatch(pa, /"2026":/);

  const ar0 = thor.indexOf("    Aria: {");
  const ar = thor.slice(ar0, thor.indexOf("    ACE: {"));
  assert.match(ar, /"2025": \["3401", "3702", "3901", "4000"\]/);
  assert.match(ar, /"2027": \["3702", "3901", "4000"\]/);
  assert.doesNotMatch(ar, /"2026": .*"3401"/);

  const fw0 = thor.indexOf('    "Four Winds": {');
  const fw = thor.slice(fw0, thor.indexOf("    Chateau: {"));
  assert.match(fw, /"2025": \["19Z", "21Z", "22Z", "25Z", "27P", "28A", "28Z", "29K", "31EV", "31MV", "31WV"\]/);
  assert.match(fw, /"2026": \["19X", "19Z", "21Z", "22Z", "25Z", "28G", "28Z", "29K", "31E", "31H"\]/);
  assert.doesNotMatch(fw, /"2025": .*"28G"/);

  const seq0 = thor.indexOf("    Sequence: {");
  const seq = thor.slice(seq0, thor.indexOf("    Sanctuary: {"));
  assert.match(seq, /"2025": \["20H", "20J", "20L"\]/);
  assert.match(seq, /"2027": \["20L", "20U", "20Y"\]/);
  assert.doesNotMatch(seq, /"2025": .*"20U"/);
  assert.doesNotMatch(seq, /"2026": .*"20H"/);

  const rz0 = thor.indexOf("    Rize: {");
  const rz = thor.slice(rz0, thor.indexOf('    "Rize Plus"'));
  assert.match(rz, /"2025": \["18G", "18M"\]/);
  assert.match(rz, /"2027": \["18M", "18Z"\]/);
  assert.doesNotMatch(rz, /"2026": .*"18G"/);
  assert.match(rz, /type: "Class B"/);

  const mag0 = thor.indexOf("    Magnitude: {");
  const mag = thor.slice(mag0, thor.indexOf('    "Magnitude XG"'));
  assert.match(mag, /"2025": \["AX29", "XG32", "LV35", "RS36"\]/);
  assert.match(mag, /"2027": \["Z30", "X32", "L35", "R36"\]/);
  assert.doesNotMatch(mag, /"2026":/);

  const in0 = thor.indexOf("    Indigo: {");
  const indigo = thor.slice(in0, thor.indexOf("    Luminate: {"));
  assert.match(indigo, /"2025": \["MM30", "CC35", "DD35"\]/);
  assert.match(indigo, /"2026": \["MM30", "CC35", "GG35"\]/);
  assert.match(indigo, /"2027": \["MM30", "AA35", "HH36"\]/);
  assert.doesNotMatch(indigo, /"2025": .*"GG35"/);
  assert.doesNotMatch(indigo, /"2026": .*"AA35"/);

  const ps0 = thor.indexOf("    Pasadena: {");
  const ps = thor.slice(ps0, thor.indexOf("    Inception: {"));
  assert.match(ps, /"2025": \["34XG", "38DA", "38FX", "38XL"\]/);
  assert.match(ps, /"2026": \["34XG", "38DX", "38FX", "38XL"\]/);
  assert.doesNotMatch(ps, /"2025": .*"38DX"/);
  assert.doesNotMatch(ps, /"2026": .*"38DA"/);

  const acePin = findPowertrainCorrection("2027", "Thor", "ACE", "32B");
  assert.equal(acePin!.horsepower, 335);
  assert.equal(acePin!.torqueLbFt, 468);
  const resPin = findPowertrainCorrection("2027", "Thor", "Resonate", "29D");
  assert.equal(resPin!.horsepower, 335);
  const axPin = findPowertrainCorrection("2027", "Thor", "Axis", "24.1");
  assert.equal(axPin!.horsepower, 325);
  assert.equal(axPin!.torqueLbFt, 450);
  const pal27 = findPowertrainCorrection("2027", "Thor", "Palazzo", "37.4");
  assert.equal(pal27!.horsepower, 0);
  assert.match(pal27!.engine, /300|340/);
  const pgt = findPowertrainCorrection("2026", "Thor", "Palazzo GT", "33.5");
  assert.equal(pgt!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2025", "Thor", "Palazzo", "33.5"), null);
  const aria = findPowertrainCorrection("2027", "Thor", "Aria", "3702");
  assert.equal(aria!.horsepower, 360);
  assert.equal(aria!.torqueLbFt, 800);
  const riv = findPowertrainCorrection("2027", "Thor", "Riviera", "34SD");
  assert.equal(riv!.horsepower, 340);
  const chPin = findPowertrainCorrection("2027", "Thor", "Chateau", "28G");
  assert.equal(chPin!.horsepower, 0);
  assert.match(chPin!.engine, /Chevy|401/);
  assert.equal(chPin!.fuelType, "Gas");
  const fws = findPowertrainCorrection("2027", "Thor", "Four Winds Sprinter", "24LT");
  assert.equal(fws!.horsepower, 211);
  assert.equal(fws!.fuelType, "Diesel");
  const fwPin = findPowertrainCorrection("2027", "Thor", "Four Winds", "28Z");
  assert.equal(fwPin!.horsepower, 0);
  assert.equal(fwPin!.fuelType, "Gas");
  const qs = findPowertrainCorrection("2026", "Thor", "Quantum Sprinter", "GL24");
  assert.equal(qs!.horsepower, 0);
  assert.equal(qs!.fuelType, "Diesel");
  const qPin = findPowertrainCorrection("2027", "Thor", "Quantum", "LC19");
  assert.equal(qPin!.horsepower, 0);
  assert.equal(qPin!.fuelType, "Gas");
  const mag27 = findPowertrainCorrection("2027", "Thor", "Magnitude", "Z30");
  assert.equal(mag27!.horsepower, 330);
  assert.equal(mag27!.torqueLbFt, 950);
  const mag25 = findPowertrainCorrection("2025", "Thor", "Magnitude", "AX29");
  assert.equal(mag25!.horsepower, 0);
  const mg = findPowertrainCorrection("2026", "Thor", "Magnitude Grand", "S29");
  assert.equal(mg!.horsepower, 0);
  const seqPin = findPowertrainCorrection("2027", "Thor", "Sequence", "20L");
  assert.equal(seqPin!.horsepower, 276);
  assert.equal(seqPin!.fuelType, "Gas");
  const ss = findPowertrainCorrection("2026", "Thor", "Sequence Sport", "20LS");
  assert.equal(ss, null);
  const rizePin = findPowertrainCorrection("2027", "Thor", "Rize", "18M");
  assert.equal(rizePin!.horsepower, 276);
  assert.equal(rizePin!.fuelType, "Gas");
  const rp = findPowertrainCorrection("2025", "Thor", "Rize Plus", "26B");
  assert.equal(rp, null);
  const san27 = findPowertrainCorrection("2027", "Thor", "Sanctuary", "19A");
  assert.equal(san27!.horsepower, 211);
  const san25 = findPowertrainCorrection("2025", "Thor", "Sanctuary", "19A");
  assert.equal(san25!.horsepower, 0);
  const oca = findPowertrainCorrection("2027", "Thor", "Outlaw Class A", "38K");
  assert.equal(oca!.horsepower, 335);
  const occ = findPowertrainCorrection("2027", "Thor", "Outlaw Class C", "29T");
  assert.equal(occ!.horsepower, 325);
  const incHd = findPowertrainCorrection("2027", "Thor", "Inception HD", "38FX");
  assert.equal(incHd!.horsepower, 360);
  const inc = findPowertrainCorrection("2027", "Thor", "Inception", "34XG");
  assert.equal(inc!.horsepower, 360);
  assert.equal(findPowertrainCorrection("2025", "Thor", "Inception HD", "34XG"), null);
  const huPin = findPowertrainCorrection("2027", "Thor", "Hurricane", "35J");
  assert.equal(huPin!.horsepower, 335);
});

test("Thor 2023–2024 OEM year-first floorplans + powertrain pins", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  assert.equal(th.Resonate?.yearStart, 2023);
  assert.equal(th.Indigo?.yearStart, 2023);
  assert.equal(th.Luminate?.yearStart, 2023);
  assert.equal(th.Riviera?.yearStart, 2023);
  assert.equal(th.Scope?.yearStart, 2022);
  assert.equal(th.Tellaro?.yearStart, 2020);
  assert.equal(th.Echelon?.yearStart, 2022);
  assert.equal(th["Four Winds Sprinter"]?.yearStart, 2017);
  assert.equal(th["Chateau Sprinter"]?.yearStart, 2017);
  assert.equal(th["Quantum Sprinter"]?.yearStart, 2017);
  assert.equal(th["Echelon Sprinter"]?.yearStart, 2022);
  assert.equal(th.Delano?.yearStart, 2020);
  assert.equal(th.Tiburon?.yearStart, 2020);
  assert.equal(th["Compass AWD"]?.yearStart, 2021);
  assert.equal(th.Omni?.yearStart, 2019);
  assert.equal(th.Pasadena?.yearStart, 2022);
  assert.equal(th.Inception?.yearStart, 2022);
  assert.equal(th["Outlaw Class A"]?.yearStart, 2010);
  assert.equal(th["Outlaw Class C"]?.yearStart, 2015);
  assert.equal(th.Tranquility?.yearStart, 2022);
  assert.equal(th.Dazzle?.yearStart, 2023);
  assert.equal(th.Twist?.yearStart, 2023);
  assert.equal(th["Palazzo GT"]?.yearStart, 2024);
  assert.equal(th.Palladium?.yearStart, 2024);
  assert.equal(th.Talavera?.yearStart, 2024);
  assert.equal(th["Outlaw Wild West"]?.yearStart, 2024);
  assert.equal(th["Inception HD"]?.yearStart, 2026);
  assert.equal(th["Pasadena SV"]?.yearStart, 2026);
  assert.equal(th["Gemini TRIP"]?.yearStart, 2025);
  assert.equal(th["Compass GO"]?.yearStart, 2025);

  assert.equal(th.Hurricane?.years?.includes(2023), true);
  assert.equal(th.Hurricane?.years?.includes(2024), true);
  assert.equal(th.Tuscany?.years?.includes(2023), true);
  assert.equal(th.Tuscany?.years?.includes(2024), false);
  assert.equal(th.Challenger?.yearEnd, 2024);
  assert.equal(th.Geneva?.yearEnd, 2024);
  assert.equal(th["Four Winds Siesta"]?.yearEnd, 2024);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const ace = thor.slice(thor.indexOf("    ACE: {"), thor.indexOf("    Vegas: {"));
  assert.match(ace, /"2023": \["29D", "29G", "30C", "32B"\]/);
  assert.match(ace, /"2024": \["29D", "29G", "30C", "32B"\]/);
  assert.doesNotMatch(ace, /"2023": \["27.1"/);

  const ax = thor.slice(thor.indexOf("    Axis: {"), thor.indexOf("    Sereno: {"));
  assert.match(ax, /"2023": \["24.1", "24.3", "24.4", "25.7"\]/);
  assert.match(ax, /"2024": \["24.1", "25.7", "26.1"\]/);
  assert.doesNotMatch(ax, /"2023": .*"28.1"/);
  assert.doesNotMatch(ax, /"2024": .*"28.1"/);
  assert.doesNotMatch(ax, /"2025": .*"28.1"/);
  assert.match(ax, /"2026": \["24.1", "26.1", "26.2", "28.1"\]/);

  const vg = thor.slice(thor.indexOf("    Vegas: {"), thor.indexOf("    Axis: {"));
  assert.match(vg, /"2023": \["24.1", "24.3", "24.4", "25.7"\]/);
  assert.doesNotMatch(vg, /"2023": .*"28.1"/);
  assert.doesNotMatch(vg, /"2024": .*"28.1"/);

  const hu = thor.slice(thor.indexOf("    Hurricane: {"), thor.indexOf('    "Four Winds Majestic"'));
  assert.match(hu, /"2023": \["29M", "34A", "34J", "34R", "35M"\]/);
  assert.match(hu, /"2024": \["29M", "34A", "34J", "34R", "35M"\]/);
  assert.doesNotMatch(hu, /"2023": .*"35A"/);
  assert.doesNotMatch(hu, /"2024": .*"35A"/);
  assert.doesNotMatch(hu, /"2023": .*"36H"/);

  const seq = thor.slice(thor.indexOf("    Sequence: {"), thor.indexOf("    Sanctuary: {"));
  assert.match(seq, /"2023": \["20A", "20J", "20K", "20L"\]/);
  assert.match(seq, /"2024": \["20A", "20J", "20K", "20L"\]/);
  assert.doesNotMatch(seq, /"2023": .*"20U"/);
  assert.doesNotMatch(seq, /"2024": .*"20U"/);
  assert.match(seq, /"2025": \["20H", "20J", "20L"\]/);

  const fw = thor.slice(thor.indexOf('    "Four Winds": {'), thor.indexOf("    Chateau: {"));
  assert.match(fw, /"2023": \["22B", "22E", "24F", "25M", "25V", "26X", "27R", "28A", "28Z", "31E", "31EV", "31M", "31MV", "31W", "31WV"\]/);
  assert.match(fw, /"2024": \["22B", "22E", "24F", "25V", "26X", "27P", "28A", "28Z", "31EV", "31MV", "31WV"\]/);
  assert.doesNotMatch(fw, /"2023": .*"27P"/);
  assert.doesNotMatch(fw, /"2024": .*"27R"/);
  assert.doesNotMatch(fw, /"2023": .*"19Z"/);
  assert.doesNotMatch(fw, /"2024": .*"19Z"/);

  const tu = thor.slice(thor.indexOf("    Tuscany: {"), thor.indexOf("    Palazzo: {"));
  assert.match(tu, /"2023": \["40RT", "45BX", "45MX"\]/);
  assert.doesNotMatch(tu, /"2024":/);

  const pa = thor.slice(thor.indexOf("    Palazzo: {"), thor.indexOf("    Aria: {"));
  assert.match(pa, /"2023": \["33.5", "33.6", "37.4", "37.5", "37.6"\]/);
  assert.match(pa, /"2024": \["33.5", "33.6", "37.4", "37.5", "37.6"\]/);

  const ace23 = findPowertrainCorrection("2023", "Thor", "ACE", "32B");
  assert.equal(ace23!.horsepower, 350);
  assert.equal(ace23!.torqueLbFt, 468);
  const ace27 = findPowertrainCorrection("2027", "Thor", "ACE", "32B");
  assert.equal(ace27!.horsepower, 335);
  const ax23 = findPowertrainCorrection("2023", "Thor", "Axis", "24.1");
  assert.equal(ax23!.horsepower, 0);
  const ax27 = findPowertrainCorrection("2027", "Thor", "Axis", "24.1");
  assert.equal(ax27!.horsepower, 325);
  const seq23 = findPowertrainCorrection("2023", "Thor", "Sequence", "20A");
  assert.equal(seq23!.horsepower, 276);
  assert.equal(seq23!.fuelType, "Gas");
  const ch24 = findPowertrainCorrection("2024", "Thor", "Challenger", "35MQ");
  assert.equal(ch24!.horsepower, 335);
  const mag23 = findPowertrainCorrection("2023", "Thor", "Magnitude", "XG32");
  assert.equal(mag23!.horsepower, 330);
  assert.equal(mag23!.torqueLbFt, 825);
  const mag24 = findPowertrainCorrection("2024", "Thor", "Magnitude", "AX29");
  assert.equal(mag24!.horsepower, 0);
  const pal23 = findPowertrainCorrection("2023", "Thor", "Palazzo", "33.5");
  assert.equal(pal23!.horsepower, 0);
  const fw23 = findPowertrainCorrection("2023", "Thor", "Four Winds", "28A");
  assert.equal(fw23!.horsepower, 0);
  assert.equal(fw23!.fuelType, "Gas");
  const fws23 = findPowertrainCorrection("2023", "Thor", "Four Winds Sprinter", "24LT");
  assert.equal(fws23!.horsepower, 188);
  const fws24 = findPowertrainCorrection("2024", "Thor", "Four Winds Sprinter", "24LT");
  assert.equal(fws24!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2023", "Thor", "Inception HD", "34XG"), null);
  assert.equal(findPowertrainCorrection("2024", "Thor", "Pasadena SV", "34XG"), null);
});

test("Thor 2021–2022 OEM year-first floorplans + powertrain pins", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  assert.equal(th.Tellaro?.yearStart, 2020);
  assert.equal(th.Omni?.yearStart, 2019);
  assert.equal(th.Delano?.yearStart, 2020);
  assert.equal(th.Tiburon?.yearStart, 2020);
  assert.equal(th["Compass AWD"]?.yearStart, 2021);
  assert.equal(th["Four Winds Sprinter"]?.yearStart, 2017);
  assert.equal(th["Chateau Sprinter"]?.yearStart, 2017);
  assert.equal(th["Outlaw Class A"]?.yearStart, 2010);
  assert.equal(th["Outlaw Class C"]?.yearStart, 2015);
  assert.equal(th["Quantum Sprinter"]?.yearStart, 2017);
  assert.equal(th.Sequence?.yearStart, 2020);
  assert.equal(th.Venetian?.yearStart, 2016);
  assert.equal(th.Venetian?.yearEnd, 2022);
  assert.equal(th.Miramar?.yearStart, 2015);
  assert.equal(th.Miramar?.yearEnd, 2022);
  assert.equal(th.Scope?.yearStart, 2022);
  assert.equal(th.Tranquility?.yearStart, 2022);
  assert.equal(th.Echelon?.yearStart, 2022);
  assert.equal(th["Echelon Sprinter"]?.yearStart, 2022);
  assert.equal(th.Pasadena?.yearStart, 2022);
  assert.equal(th.Inception?.yearStart, 2022);
  assert.equal(th.Rize?.years?.includes(2021), false);
  assert.equal(th.Rize?.years?.includes(2022), true);
  assert.equal(th.Sanctuary?.years?.includes(2021), false);
  assert.equal(th.Sanctuary?.years?.includes(2022), true);
  assert.equal(th.Resonate?.yearStart, 2023);
  assert.equal(th.Indigo?.yearStart, 2023);
  assert.equal(th.Luminate?.yearStart, 2023);
  assert.equal(th.Riviera?.yearStart, 2023);
  assert.equal(th.Dazzle?.yearStart, 2023);
  assert.equal(th.Twist?.yearStart, 2023);
  assert.equal(th["Inception HD"]?.yearStart, 2026);
  assert.equal(th["Pasadena SV"]?.yearStart, 2026);
  assert.equal(th["Gemini TRIP"]?.yearStart, 2025);
  assert.equal(th["Compass GO"]?.yearStart, 2025);
  assert.equal(th.Hurricane?.years?.includes(2021), true);
  assert.equal(th.Hurricane?.years?.includes(2022), true);
  assert.equal(th.Geneva?.years?.includes(2021), false);
  assert.equal(th.Geneva?.years?.includes(2022), false);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2021), false);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2022), false);
  assert.equal(th["Rize Plus"]?.years?.includes(2021), false);
  assert.equal(th["Rize Plus"]?.years?.includes(2022), false);
  assert.ok(!(th["Magnitude XG"]?.years || []).includes(2021));
  assert.ok(!(th["Magnitude XG"]?.years || []).includes(2022));
  assert.equal(th.Seneca?.years?.includes(2021), false);
  assert.equal(th.Seneca?.years?.includes(2022), false);
  assert.equal(th.Outlaw?.years?.includes(2021), false);
  assert.equal(th.Outlaw?.years?.includes(2022), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const ace = thor.slice(thor.indexOf("    ACE: {"), thor.indexOf("    Vegas: {"));
  assert.match(ace, /"2021": \["27.2", "29.5", "30.3", "32.3", "33.1"\]/);
  assert.match(ace, /"2022": \["27.2", "29.5", "30.3", "32.3", "33.1"\]/);
  assert.doesNotMatch(ace, /"2021": \["27.1"/);
  assert.doesNotMatch(ace, /"2021": .*"29.3"/);
  assert.doesNotMatch(ace, /"2021": .*"29D"/);

  const ax = thor.slice(thor.indexOf("    Axis: {"), thor.indexOf("    Sereno: {"));
  assert.match(ax, /"2021": \["24.1", "24.3", "25.6", "27.7"\]/);
  assert.match(ax, /"2022": \["24.1", "24.3", "24.4"\]/);
  assert.doesNotMatch(ax, /"2021": .*"26.1"/);
  assert.doesNotMatch(ax, /"2021": .*"26.2"/);
  assert.doesNotMatch(ax, /"2021": .*"28.1"/);
  assert.doesNotMatch(ax, /"2022": .*"26.1"/);
  assert.doesNotMatch(ax, /"2022": .*"28.1"/);

  const vg = thor.slice(thor.indexOf("    Vegas: {"), thor.indexOf("    Axis: {"));
  assert.match(vg, /"2021": \["24.1", "24.3", "25.6", "27.7"\]/);
  assert.match(vg, /"2022": \["24.1", "24.3", "24.4"\]/);
  assert.doesNotMatch(vg, /"2021": .*"28.1"/);
  assert.doesNotMatch(vg, /"2022": .*"28.1"/);

  const hu = thor.slice(thor.indexOf("    Hurricane: {"), thor.indexOf('    "Four Winds Majestic"'));
  assert.match(hu, /"2021": \["29M", "31C", "34J", "34R", "35M"\]/);
  assert.match(hu, /"2022": \["29M", "31C", "34J", "34R", "35M"\]/);
  assert.doesNotMatch(hu, /"2021": .*"35A"/);
  assert.doesNotMatch(hu, /"2022": .*"36H"/);

  const seq = thor.slice(thor.indexOf("    Sequence: {"), thor.indexOf("    Sanctuary: {"));
  assert.match(seq, /"2021": \["20A", "20K", "20L"\]/);
  assert.match(seq, /"2022": \["20A", "20J", "20K", "20L"\]/);
  assert.doesNotMatch(seq, /"2021": .*"20U"/);
  assert.doesNotMatch(seq, /"2022": .*"20U"/);

  const fw = thor.slice(thor.indexOf('    "Four Winds": {'), thor.indexOf("    Chateau: {"));
  assert.match(fw, /"2021": \["22B", "22E", "24F", "25M", "25V", "26B", "27R", "28A", "28Z", "31B", "31E", "31W", "31BV", "31EV", "31WV"\]/);
  assert.match(fw, /"2022": \["22B", "22E", "24F", "25M", "25V", "26B", "27R", "28A", "28Z", "31B", "31E", "31W", "31BV", "31EV", "31WV"\]/);
  assert.doesNotMatch(fw, /"2021": .*"19Z"/);
  assert.doesNotMatch(fw, /"2022": .*"19Z"/);
  assert.doesNotMatch(fw, /"2021": .*"26X"/);

  const tu = thor.slice(thor.indexOf("    Tuscany: {"), thor.indexOf("    Venetian: {"));
  assert.match(tu, /"2021": \["40RT", "45MX"\]/);
  assert.match(tu, /"2022": \["40RT", "45BX", "45MX"\]/);
  assert.doesNotMatch(tu, /"2021": .*"40IX"/);
  assert.doesNotMatch(tu, /"2021": .*"42RQ"/);

  const pa = thor.slice(thor.indexOf("    Palazzo: {"), thor.indexOf("    Aria: {"));
  assert.match(pa, /"2021": \["33.5", "33.6", "37.4", "37.5"\]/);
  assert.match(pa, /"2022": \["33.5", "33.6", "37.4", "37.5"\]/);
  assert.doesNotMatch(pa, /"2021": .*"33.2"/);
  assert.doesNotMatch(pa, /"2022": .*"37.6"/);

  const ar = thor.slice(thor.indexOf("    Aria: {"), thor.indexOf("    ACE: {"));
  assert.match(ar, /"2021": \["3401", "3701", "3901", "4000"\]/);
  assert.match(ar, /"2022": \["3401", "3701", "3901", "4000"\]/);
  assert.doesNotMatch(ar, /"2021": .*"3601"/);
  assert.doesNotMatch(ar, /"2021": .*"3702"/);
  assert.doesNotMatch(ar, /"2022": .*"3702"/);

  const ch = thor.slice(thor.indexOf("    Challenger: {"), thor.indexOf("    Miramar: {"));
  assert.match(ch, /"2021": \["35MQ", "37DS", "37FH"\]/);
  assert.match(ch, /"2022": \["35MQ", "37DS", "37FH"\]/);
  assert.doesNotMatch(ch, /"2021": .*"35KT"/);
  assert.doesNotMatch(ch, /"2022": .*"36FA"/);

  const mi = thor.slice(thor.indexOf("    Miramar: {"), thor.indexOf("    Magnitude: {"));
  assert.match(mi, /"2021": \["34.6", "35.2", "35.4", "37.1"\]/);
  assert.match(mi, /"2022": \["34.6", "35.2", "37.1"\]/);
  assert.doesNotMatch(mi, /"2022": .*"35.4"/);
  assert.doesNotMatch(mi, /"2023":/);

  const ve = thor.slice(thor.indexOf("    Venetian: {"), thor.indexOf("    Palazzo: {"));
  assert.match(ve, /"2021": \["L40", "R40", "B42", "F42"\]/);
  assert.match(ve, /"2022": \["L40", "R40", "B42", "F42"\]/);
  assert.doesNotMatch(ve, /"2023":/);

  const mag = thor.slice(thor.indexOf("    Magnitude: {"), thor.indexOf('    "Magnitude XG"'));
  assert.match(mag, /"2021": \["XG32", "RB34", "SV34", "BH35"\]/);
  assert.match(mag, /"2022": \["XG32", "SV34", "BT36", "RS36"\]/);
  assert.doesNotMatch(mag, /"2021": .*"SV38"/);
  assert.doesNotMatch(mag, /"2022": .*"AX29"/);

  const oca = thor.slice(thor.indexOf('    "Outlaw Class A": {'), thor.indexOf('    "Outlaw Class C"'));
  assert.match(oca, /"2021": \["38MB", "38KB"\]/);
  assert.match(oca, /"2022": \["38MB", "38KB"\]/);

  const occ = thor.slice(thor.indexOf('    "Outlaw Class C": {'), thor.indexOf('    "Outlaw Wild West"'));
  assert.match(occ, /"2021": \["29J"\]/);
  assert.match(occ, /"2022": \["29J"\]/);
  assert.doesNotMatch(occ, /"2021": .*"29T"/);
  assert.doesNotMatch(occ, /"2022": .*"29T"/);

  const ace21 = findPowertrainCorrection("2021", "Thor", "ACE", "27.2");
  assert.equal(ace21!.horsepower, 0);
  const ace22 = findPowertrainCorrection("2022", "Thor", "ACE", "27.2");
  assert.equal(ace22!.horsepower, 350);
  assert.equal(ace22!.torqueLbFt, 468);
  const ax21 = findPowertrainCorrection("2021", "Thor", "Axis", "24.1");
  assert.equal(ax21!.horsepower, 0);
  const ax22 = findPowertrainCorrection("2022", "Thor", "Axis", "24.1");
  assert.equal(ax22!.horsepower, 0);
  const vg21 = findPowertrainCorrection("2021", "Thor", "Vegas", "24.1");
  assert.equal(vg21!.horsepower, 0);
  const seq21 = findPowertrainCorrection("2021", "Thor", "Sequence", "20A");
  assert.equal(seq21!.horsepower, 280);
  assert.equal(seq21!.fuelType, "Gas");
  const seq22 = findPowertrainCorrection("2022", "Thor", "Sequence", "20J");
  assert.equal(seq22!.horsepower, 280);
  assert.equal(seq22!.fuelType, "Gas");
  const fw21 = findPowertrainCorrection("2021", "Thor", "Four Winds", "28A");
  assert.equal(fw21!.horsepower, 0);
  assert.equal(fw21!.fuelType, "Gas");
  const mag21 = findPowertrainCorrection("2021", "Thor", "Magnitude", "XG32");
  assert.equal(mag21!.horsepower, 330);
  assert.equal(mag21!.torqueLbFt, 825);
  const tus21 = findPowertrainCorrection("2021", "Thor", "Tuscany", "40RT");
  assert.equal(tus21!.horsepower, 450);
  assert.match(tus21!.engine, /ISL/);
  const ven21 = findPowertrainCorrection("2021", "Thor", "Venetian", "L40");
  assert.equal(ven21!.horsepower, 0);
  const mi21 = findPowertrainCorrection("2021", "Thor", "Miramar", "34.6");
  assert.equal(mi21!.horsepower, 0);
  const mi22 = findPowertrainCorrection("2022", "Thor", "Miramar", "34.6");
  assert.equal(mi22!.horsepower, 350);
  const oca21 = findPowertrainCorrection("2021", "Thor", "Outlaw Class A", "38MB");
  assert.equal(oca21!.horsepower, 0);
  const oca22 = findPowertrainCorrection("2022", "Thor", "Outlaw Class A", "38MB");
  assert.equal(oca22!.horsepower, 350);
  const occ21 = findPowertrainCorrection("2021", "Thor", "Outlaw Class C", "29J");
  assert.equal(occ21!.horsepower, 350);
  assert.equal(occ21!.torqueLbFt, 468);
  const pal21 = findPowertrainCorrection("2021", "Thor", "Palazzo", "33.5");
  assert.equal(pal21!.horsepower, 0);
  const gem21 = findPowertrainCorrection("2021", "Thor", "Gemini", "23TE");
  assert.equal(gem21!.horsepower, 310);
  assert.equal(gem21!.torqueLbFt, 400);
  const inc21 = findPowertrainCorrection("2021", "Thor", "Inception", "38BX");
  assert.equal(inc21, null);
  const pas21 = findPowertrainCorrection("2021", "Thor", "Pasadena", "38BX");
  assert.equal(pas21, null);
  assert.equal(findPowertrainCorrection("2021", "Thor", "Inception HD", "34XG"), null);
  assert.equal(findPowertrainCorrection("2022", "Thor", "Pasadena SV", "34XG"), null);
  assert.equal(findPowertrainCorrection("2021", "Thor", "Resonate", "29D"), null);
  assert.equal(findPowertrainCorrection("2022", "Thor", "Indigo", "BB35"), null);
});

test("Thor 2019–2020 OEM year-first floorplans + powertrain pins", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  assert.equal(th.Venetian?.yearStart, 2016);
  assert.equal(th.Venetian?.yearEnd, 2022);
  assert.equal(th.Miramar?.yearStart, 2015);
  assert.equal(th.Miramar?.yearEnd, 2022);
  assert.equal(th.Omni?.yearStart, 2019);
  assert.equal(th["Outlaw Class A"]?.yearStart, 2010);
  assert.equal(th["Outlaw Class C"]?.yearStart, 2015);
  assert.equal(th["Four Winds Sprinter"]?.yearStart, 2017);
  assert.equal(th["Chateau Sprinter"]?.yearStart, 2017);
  assert.equal(th["Quantum Sprinter"]?.yearStart, 2017);
  assert.equal(th.Sequence?.yearStart, 2020);
  assert.equal(th.Tellaro?.yearStart, 2020);
  assert.equal(th.Delano?.yearStart, 2020);
  assert.equal(th.Tiburon?.yearStart, 2020);
  assert.equal(th.Compass?.yearStart, 2017);
  assert.equal(th.Compass?.yearEnd, 2020);
  assert.equal(th["Compass AWD"]?.yearStart, 2021);
  assert.equal(th.Pasadena?.yearStart, 2022);
  assert.equal(th.Inception?.yearStart, 2022);
  assert.equal(th.Scope?.yearStart, 2022);
  assert.equal(th.Tranquility?.yearStart, 2022);
  assert.equal(th.Echelon?.yearStart, 2022);
  assert.equal(th["Rize Plus"]?.yearStart, 2023);
  assert.equal(th.Hurricane?.years?.includes(2019), true);
  assert.equal(th.Hurricane?.years?.includes(2020), true);
  assert.equal(th.Geneva?.years?.includes(2019), false);
  assert.equal(th.Geneva?.years?.includes(2020), false);
  assert.equal(th.Rize?.years?.includes(2019), false);
  assert.equal(th.Rize?.years?.includes(2020), false);
  assert.equal(th.Sanctuary?.years?.includes(2019), false);
  assert.equal(th.Sanctuary?.years?.includes(2020), false);
  assert.equal(th.Seneca?.years?.includes(2019), false);
  assert.equal(th.Seneca?.years?.includes(2020), false);
  assert.equal(th.Outlaw?.years?.includes(2019), false);
  assert.equal(th.Outlaw?.years?.includes(2020), false);
  assert.equal(th["Rize Plus"]?.years?.includes(2020), false);
  assert.ok(!(th["Magnitude XG"]?.years || []).includes(2020));
  assert.equal(th.Magnitude?.years?.includes(2019), false);
  assert.equal(th.Magnitude?.years?.includes(2020), true);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const ace = thor.slice(thor.indexOf("    ACE: {"), thor.indexOf("    Vegas: {"));
  assert.match(ace, /"2019": \["27.2", "29.3", "30.2", "30.3", "30.4", "32.1"\]/);
  assert.match(ace, /"2020": \["27.2", "30.2", "30.3", "30.4", "32.3", "33.1"\]/);
  assert.doesNotMatch(ace, /"2019": \["27.1"/);
  assert.doesNotMatch(ace, /"2020": .*"29.3"/);

  const ax = thor.slice(thor.indexOf("    Axis: {"), thor.indexOf("    Sereno: {"));
  assert.match(ax, /"2019": \["24.1", "25.2", "25.5", "25.6", "27.7"\]/);
  assert.match(ax, /"2020": \["24.1", "25.6", "27.7"\]/);
  assert.doesNotMatch(ax, /"2020": .*"25.2"/);
  assert.doesNotMatch(ax, /"2019": .*"26.1"/);

  const vg = thor.slice(thor.indexOf("    Vegas: {"), thor.indexOf("    Axis: {"));
  assert.match(vg, /"2019": \["24.1", "25.2", "25.5", "25.6", "27.7"\]/);
  assert.match(vg, /"2020": \["24.1", "25.6", "27.7"\]/);
  assert.doesNotMatch(vg, /"2020": .*"25.2"/);

  const hu = thor.slice(thor.indexOf("    Hurricane: {"), thor.indexOf('    "Four Winds Majestic"'));
  assert.match(hu, /"2019": \["27B", "29M", "34J", "34R", "35M"\]/);
  assert.match(hu, /"2020": \["29M", "33X", "34J", "34R", "35M"\]/);
  assert.doesNotMatch(hu, /"2019": .*"31C"/);
  assert.doesNotMatch(hu, /"2020": .*"27B"/);

  const tu = thor.slice(thor.indexOf("    Tuscany: {"), thor.indexOf("    Venetian: {"));
  assert.match(tu, /"2019": \["38SQ", "40RT", "42GX", "45MX"\]/);
  assert.match(tu, /"2020": \["40RT", "45JA", "45MX"\]/);
  assert.doesNotMatch(tu, /"2019": .*"40IX"/);
  assert.doesNotMatch(tu, /"2020": .*"38SQ"/);

  const ve = thor.slice(thor.indexOf("    Venetian: {"), thor.indexOf("    Palazzo: {"));
  assert.match(ve, /"2019": \["G36", "M37", "J40", "S40"\]/);
  assert.match(ve, /"2020": \["L40", "R40", "B42"\]/);
  assert.doesNotMatch(ve, /"2019": .*"L40"/);
  assert.doesNotMatch(ve, /"2020": .*"F42"/);

  const pa = thor.slice(thor.indexOf("    Palazzo: {"), thor.indexOf("    Aria: {"));
  assert.match(pa, /"2019": \["33.2", "33.3", "33.5", "36.1", "36.3", "37.4"\]/);
  assert.match(pa, /"2020": \["33.2", "33.5", "36.3", "37.4"\]/);
  assert.doesNotMatch(pa, /"2020": .*"33.3"/);

  const ar = thor.slice(thor.indexOf("    Aria: {"), thor.indexOf("    ACE: {"));
  assert.match(ar, /"2019": \["3401", "3601", "3901", "4000"\]/);
  assert.match(ar, /"2020": \["3401", "3601", "3901", "3902", "4000"\]/);
  assert.doesNotMatch(ar, /"2019": .*"3902"/);

  const ch = thor.slice(thor.indexOf("    Challenger: {"), thor.indexOf("    Miramar: {"));
  assert.match(ch, /"2019": \["37FH", "37KT", "37TB", "37YT"\]/);
  assert.match(ch, /"2020": \["35MQ", "37FH", "37TB", "37YT"\]/);
  assert.doesNotMatch(ch, /"2019": .*"35KT"/);
  assert.doesNotMatch(ch, /"2020": .*"35KT"/);

  const mi = thor.slice(thor.indexOf("    Miramar: {"), thor.indexOf("    Magnitude: {"));
  assert.match(mi, /"2019": \["34.2", "35.2", "35.3", "37.1"\]/);
  assert.match(mi, /"2020": \["32.2", "35.2", "35.3", "37.1"\]/);
  assert.doesNotMatch(mi, /"2019": .*"34.6"/);
  assert.doesNotMatch(mi, /"2020": .*"34.6"/);

  const mag = thor.slice(thor.indexOf("    Magnitude: {"), thor.indexOf('    "Magnitude XG"'));
  assert.match(mag, /"2020": \["SV34", "BB35", "BH35"\]/);
  assert.doesNotMatch(mag, /"2019":/);
  assert.doesNotMatch(mag, /"2020": .*"SV38"/);

  const fw = thor.slice(thor.indexOf('    "Four Winds": {'), thor.indexOf("    Chateau: {"));
  assert.match(fw, /"2019": \["22B", "22E", "23U", "24F", "25V", "26B", "28E", "28Z", "30D", "31E", "31W", "31Y"\]/);
  assert.match(fw, /"2020": \["22B", "22E", "23U", "24F", "25V", "26B", "27R", "28E", "28Z", "30D", "31E", "31W", "31Y"\]/);
  assert.doesNotMatch(fw, /"2019": .*"19Z"/);
  assert.doesNotMatch(fw, /"2020": .*"19Z"/);
  assert.doesNotMatch(fw, /"2019": .*"27R"/);

  const gem = thor.slice(thor.indexOf("    Gemini: {"), thor.indexOf("    Rize: {"));
  assert.match(gem, /"2019": \["23TB", "23TK", "23TR", "24LP", "24TF"\]/);
  assert.match(gem, /"2020": \["23TW", "24TF", "24SX"\]/);
  assert.doesNotMatch(gem, /"2019": .*"22TF"/);
  assert.doesNotMatch(gem, /"2020": .*"24KB"/);

  const oca = thor.slice(thor.indexOf('    "Outlaw Class A": {'), thor.indexOf('    "Outlaw Class C"'));
  assert.match(oca, /"2019": \["37GP", "37RB"\]/);
  assert.match(oca, /"2020": \["37RB", "38MB"\]/);

  const occ = thor.slice(thor.indexOf('    "Outlaw Class C": {'), thor.indexOf('    "Outlaw Wild West"'));
  assert.match(occ, /"2019": \["29J"\]/);
  assert.match(occ, /"2020": \["29J", "29S"\]/);

  const ace19 = findPowertrainCorrection("2019", "Thor", "ACE", "27.2");
  assert.equal(ace19!.horsepower, 320);
  assert.equal(ace19!.torqueLbFt, 460);
  const ace20 = findPowertrainCorrection("2020", "Thor", "ACE", "27.2");
  assert.equal(ace20!.horsepower, 320);
  const ax19 = findPowertrainCorrection("2019", "Thor", "Axis", "24.1");
  assert.equal(ax19!.horsepower, 305);
  const vg20 = findPowertrainCorrection("2020", "Thor", "Vegas", "24.1");
  assert.equal(vg20!.horsepower, 305);
  const hu19 = findPowertrainCorrection("2019", "Thor", "Hurricane", "29M");
  assert.equal(hu19!.horsepower, 320);
  const pal19 = findPowertrainCorrection("2019", "Thor", "Palazzo", "33.2");
  assert.equal(pal19!.horsepower, 0);
  const ven19 = findPowertrainCorrection("2019", "Thor", "Venetian", "G36");
  assert.equal(ven19!.horsepower, 400);
  const ven20 = findPowertrainCorrection("2020", "Thor", "Venetian", "L40");
  assert.equal(ven20!.horsepower, 0);
  const tus19 = findPowertrainCorrection("2019", "Thor", "Tuscany", "40RT");
  assert.equal(tus19!.horsepower, 450);
  assert.match(tus19!.engine, /ISL/);
  const fw19 = findPowertrainCorrection("2019", "Thor", "Four Winds", "22B");
  assert.equal(fw19!.horsepower, 0);
  assert.equal(fw19!.fuelType, "Gas");
  const fws19 = findPowertrainCorrection("2019", "Thor", "Four Winds Sprinter", "24BL");
  assert.equal(fws19!.horsepower, 188);
  const gem19 = findPowertrainCorrection("2019", "Thor", "Gemini", "23TB");
  assert.equal(gem19!.horsepower, 0);
  assert.equal(gem19!.fuelType, "Diesel");
  const cmp19 = findPowertrainCorrection("2019", "Thor", "Compass", "23TB");
  assert.equal(cmp19!.horsepower, 0);
  assert.equal(cmp19!.fuelType, "Diesel");
  const cmpAwd = findPowertrainCorrection("2019", "Thor", "Compass AWD", "23TE");
  assert.equal(cmpAwd, null);
  const seq20 = findPowertrainCorrection("2020", "Thor", "Sequence", "20L");
  assert.equal(seq20!.horsepower, 0);
  assert.equal(seq20!.fuelType, "Gas");
  const mag20 = findPowertrainCorrection("2020", "Thor", "Magnitude", "SV34");
  assert.equal(mag20!.horsepower, 330);
  assert.equal(mag20!.torqueLbFt, 750);
  const mag19 = findPowertrainCorrection("2019", "Thor", "Magnitude", "SV34");
  assert.equal(mag19, null);
  const omni19 = findPowertrainCorrection("2019", "Thor", "Omni", "SV34");
  assert.equal(omni19!.horsepower, 300);
  const omni20 = findPowertrainCorrection("2020", "Thor", "Omni", "SV34");
  assert.equal(omni20!.horsepower, 330);
  assert.equal(findPowertrainCorrection("2019", "Thor", "Inception", "38BX"), null);
  assert.equal(findPowertrainCorrection("2020", "Thor", "Pasadena", "38BX"), null);
  assert.equal(findPowertrainCorrection("2019", "Thor", "Rize", "18M"), null);
  assert.equal(findPowertrainCorrection("2020", "Thor", "Sanctuary", "19P"), null);
  assert.equal(findPowertrainCorrection("2019", "Thor", "Geneva", "25VT"), null);
});

test("Thor 2010–2012 OEM year-first floorplans + powertrain pins", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  // First OEM card years — do not invent missing MY10 (or MY12 Palazzo / Siesta / Tuscany).
  assert.equal(th.Hurricane?.yearStart, 2011);
  assert.equal(th.Windsport?.yearStart, 2008);
  assert.equal(th.ACE?.yearStart, 2012);
  assert.equal(th.Palazzo?.yearStart, 2013);
  assert.equal(th["Four Winds"]?.yearStart, 2011);
  assert.equal(th.Chateau?.yearStart, 2011);
  assert.equal(th["Four Winds Siesta"]?.yearStart, 2011);
  assert.equal(th["Outlaw Class A"]?.yearStart, 2010);
  assert.equal(th.Seneca?.yearStart, 2023);
  assert.equal(th.Outlaw?.yearStart, 2023);

  assert.equal(th.Hurricane?.years?.includes(2010), false);
  assert.equal(th.Hurricane?.years?.includes(2011), true);
  assert.equal(th.Hurricane?.years?.includes(2012), true);
  assert.equal(th.Windsport?.years?.includes(2010), false);
  assert.equal(th.Windsport?.years?.includes(2011), true);
  assert.equal(th.Windsport?.years?.includes(2012), true);
  assert.equal(th.ACE?.years?.includes(2010), false);
  assert.equal(th.ACE?.years?.includes(2011), false);
  assert.equal(th.ACE?.years?.includes(2012), true);
  assert.equal(th.Tuscany?.years?.includes(2010), true);
  assert.equal(th.Tuscany?.years?.includes(2011), true);
  assert.equal(th.Tuscany?.years?.includes(2012), false);
  assert.equal(th.Palazzo?.years?.includes(2012), false);
  assert.equal(th["Four Winds"]?.years?.includes(2010), false);
  assert.equal(th.Chateau?.years?.includes(2010), false);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2010), false);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2012), false);
  assert.equal(th.Seneca?.years?.includes(2010), false);
  assert.equal(th.Seneca?.years?.includes(2011), false);
  assert.equal(th.Seneca?.years?.includes(2012), false);
  assert.equal(th.Outlaw?.years?.includes(2012), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const hu = thor.slice(thor.indexOf("    Hurricane: {"), thor.indexOf('    "Four Winds Majestic"'));
  assert.doesNotMatch(hu, /"2010":/);
  assert.match(hu, /"2011": \["30Q", "31G", "31J", "32A", "32D", "34T"\]/);
  assert.match(hu, /"2012": \["30Q", "31G", "31J", "32A", "32D", "34T"\]/);
  assert.match(hu, /from: 2000,\s*to: 2009/);

  const ws = thor.slice(thor.indexOf("    Windsport: {"), thor.indexOf("    Challenger: {"));
  assert.doesNotMatch(ws, /"2010":/);
  assert.match(ws, /"2011": \["30Q", "31G", "31J", "32A", "32D", "34T"\]/);
  assert.match(ws, /"2012": \["30Q", "31G", "31J", "32A", "32D", "34T"\]/);
  assert.match(ws, /from: 2008,\s*to: 2009/);

  const ace = thor.slice(thor.indexOf("    ACE: {"), thor.indexOf("    Vegas: {"));
  assert.doesNotMatch(ace, /"2010":/);
  assert.doesNotMatch(ace, /"2011":/);
  assert.match(ace, /"2012": \["29\.1", "29\.2", "30\.1"\]/);

  const tu = thor.slice(thor.indexOf("    Tuscany: {"), thor.indexOf("    Venetian: {"));
  assert.match(tu, /"2010": \["3680", "4051", "4072", "4078", "42RQ"\]/);
  assert.match(tu, /"2011": \["40WD", "40LX", "42RQ", "42FK"\]/);
  assert.doesNotMatch(tu, /"2012":/);

  const pa = thor.slice(thor.indexOf("    Palazzo: {"), thor.indexOf("    Aria: {"));
  assert.doesNotMatch(pa, /"2012":/);

  const fw = thor.slice(thor.indexOf('    "Four Winds": {'), thor.indexOf("    Chateau: {"));
  assert.doesNotMatch(fw, /"2010":/);
  assert.match(fw, /"2011": \["19G", "21RB", "23U", "25C", "28A", "28Z", "31A", "31K", "31P"\]/);
  assert.match(fw, /"2012": \["19G", "23U", "25C", "28A", "28Z", "31A", "31F", "31K"\]/);
  assert.doesNotMatch(fw, /"2011": .*"23S"/);
  assert.doesNotMatch(fw, /"2012": .*"23S"/);

  const cha = thor.slice(thor.indexOf("    Chateau: {"), thor.indexOf("    Quantum: {"));
  assert.doesNotMatch(cha, /"2010":/);
  assert.match(cha, /"2011": \["19G", "21RB", "23U", "25C", "28A", "28Z", "31A", "31K", "31P"\]/);
  assert.match(cha, /"2012": \["19G", "23U", "25C", "28A", "28Z", "31A", "31F", "31K"\]/);

  const fws = thor.slice(thor.indexOf('    "Four Winds Siesta": {'), thor.indexOf("    Geneva: {"));
  assert.doesNotMatch(fws, /"2010":/);
  assert.match(fws, /"2011": \["24SA", "24SB"\]/);
  assert.doesNotMatch(fws, /"2012":/);
  assert.doesNotMatch(fws, /"2011": .*"21BC"/);

  const sen = thor.slice(thor.indexOf("    Seneca: {"), thor.indexOf('    "Four Winds": {'));
  assert.doesNotMatch(sen, /"2010":/);
  assert.doesNotMatch(sen, /"2011":/);
  assert.doesNotMatch(sen, /"2012":/);

  const mix = thor.slice(thor.indexOf("    Outlaw: {"), thor.indexOf("    Sequence: {"));
  assert.doesNotMatch(mix, /"2010":/);
  assert.doesNotMatch(mix, /"2011":/);
  assert.doesNotMatch(mix, /"2012":/);

  // Hurricane 2011–12 from Hurricane cards; unprinted HP = 0. No 2010 pin.
  assert.equal(findPowertrainCorrection("2010", "Thor", "Hurricane", "30Q"), null);
  const hu11 = findPowertrainCorrection("2011", "Thor", "Hurricane", "30Q");
  assert.equal(hu11!.horsepower, 0);
  const hu12 = findPowertrainCorrection("2012", "Thor", "Hurricane", "34T");
  assert.equal(hu12!.horsepower, 0);

  // Windsport twin: independently printed; HP 0 — do not copy Hurricane 362 (or any Hurricane HP).
  assert.equal(findPowertrainCorrection("2010", "Thor", "Windsport", "30Q"), null);
  const ws11 = findPowertrainCorrection("2011", "Thor", "Windsport", "30Q");
  assert.equal(ws11!.horsepower, 0);
  const ws12 = findPowertrainCorrection("2012", "Thor", "Windsport", "34T");
  assert.equal(ws12!.horsepower, 0);

  const ace12 = findPowertrainCorrection("2012", "Thor", "ACE", "29.1");
  assert.equal(ace12!.horsepower, 0);
  const tus10 = findPowertrainCorrection("2010", "Thor", "Tuscany", "3680");
  assert.equal(tus10!.horsepower, 360);
  assert.equal(tus10!.torqueLbFt, 1050);
  const tus11 = findPowertrainCorrection("2011", "Thor", "Tuscany", "40WD");
  assert.equal(tus11!.horsepower, 0);
  const fw11 = findPowertrainCorrection("2011", "Thor", "Four Winds", "19G");
  assert.equal(fw11!.horsepower, 0);
  assert.equal(fw11!.fuelType, "Gas");
  const cha11 = findPowertrainCorrection("2011", "Thor", "Chateau", "19G");
  assert.equal(cha11!.horsepower, 0);
  const siesta11 = findPowertrainCorrection("2011", "Thor", "Four Winds Siesta", "24SA");
  assert.equal(siesta11!.horsepower, 0);
  assert.equal(siesta11!.fuelType, "Diesel");
  assert.equal(findPowertrainCorrection("2012", "Thor", "Four Winds Siesta", "24SA"), null);
  assert.equal(findPowertrainCorrection("2012", "Thor", "Seneca", "37SS"), null);
  assert.equal(findPowertrainCorrection("2012", "Thor", "Outlaw", "29H"), null);
});

test("Thor 2013–2014 OEM year-first floorplans + powertrain pins", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  assert.equal(th.Aria?.yearStart, 2017);
  assert.equal(th.Magnitude?.yearStart, 2020);
  assert.equal(th.Quantum?.yearStart, 2016);
  assert.equal(th.Gemini?.yearStart, 2016);
  assert.equal(th["Four Winds Siesta"]?.yearStart, 2011);
  assert.equal(th["Outlaw Class A"]?.yearStart, 2010);
  assert.equal(th["Outlaw Class C"]?.yearStart, 2015);
  assert.equal(th.Vegas?.yearStart, 2014);
  assert.equal(th.Axis?.yearStart, 2014);
  assert.equal(th.Palazzo?.yearStart, 2013);
  assert.equal(th.Seneca?.yearStart, 2023);

  assert.equal(th.ACE?.years?.includes(2013), true);
  assert.equal(th.ACE?.years?.includes(2014), true);
  assert.equal(th.Hurricane?.years?.includes(2013), true);
  assert.equal(th.Hurricane?.years?.includes(2014), true);
  assert.equal(th.Windsport?.years?.includes(2013), true);
  assert.equal(th.Windsport?.years?.includes(2014), true);
  assert.equal(th.Tuscany?.years?.includes(2013), true);
  assert.equal(th.Tuscany?.years?.includes(2014), true);
  assert.equal(th.Palazzo?.years?.includes(2013), true);
  assert.equal(th.Palazzo?.years?.includes(2014), true);
  assert.equal(th.Challenger?.years?.includes(2013), true);
  assert.equal(th.Challenger?.years?.includes(2014), true);
  assert.equal(th["Four Winds"]?.years?.includes(2013), true);
  assert.equal(th["Four Winds"]?.years?.includes(2014), true);
  assert.equal(th.Chateau?.years?.includes(2013), true);
  assert.equal(th.Chateau?.years?.includes(2014), true);
  assert.equal(th.Vegas?.years?.includes(2014), true);
  assert.equal(th.Axis?.years?.includes(2014), true);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2013), true);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2014), true);
  assert.equal(th["Outlaw Class A"]?.years?.includes(2013), true);
  assert.equal(th["Outlaw Class A"]?.years?.includes(2014), true);
  assert.equal(th["Outlaw Class C"]?.years?.includes(2013), false);
  assert.equal(th["Outlaw Class C"]?.years?.includes(2014), false);
  assert.equal(th.Aria?.years?.includes(2013), false);
  assert.equal(th.Aria?.years?.includes(2014), false);
  assert.equal(th.Magnitude?.years?.includes(2013), false);
  assert.equal(th.Magnitude?.years?.includes(2014), false);
  assert.equal(th.Quantum?.years?.includes(2013), false);
  assert.equal(th.Quantum?.years?.includes(2014), false);
  assert.equal(th.Gemini?.years?.includes(2013), false);
  assert.equal(th.Gemini?.years?.includes(2014), false);
  assert.equal(th.Seneca?.years?.includes(2013), false);
  assert.equal(th.Seneca?.years?.includes(2014), false);
  assert.equal(th.Outlaw?.years?.includes(2013), false);
  assert.equal(th.Outlaw?.years?.includes(2014), false);
  assert.equal(th.Venetian?.years?.includes(2013), false);
  assert.equal(th.Venetian?.years?.includes(2014), false);
  assert.equal(th.Miramar?.years?.includes(2013), false);
  assert.equal(th.Miramar?.years?.includes(2014), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const ace = thor.slice(thor.indexOf("    ACE: {"), thor.indexOf("    Vegas: {"));
  assert.match(ace, /"2013": \["27.1", "29.2", "30.1"\]/);
  assert.match(ace, /"2014": \["27.1", "29.2", "30.1", "30.2"\]/);
  assert.doesNotMatch(ace, /"2013": .*"32.1"/);
  assert.doesNotMatch(ace, /"2014": .*"32.1"/);

  const ax = thor.slice(thor.indexOf("    Axis: {"), thor.indexOf("    Sereno: {"));
  assert.match(ax, /"2014": \["24.1"\]/);
  assert.doesNotMatch(ax, /"2014": .*"25.2"/);
  assert.doesNotMatch(ax, /"2014": .*"25.6"/);

  const vg = thor.slice(thor.indexOf("    Vegas: {"), thor.indexOf("    Axis: {"));
  assert.match(vg, /"2014": \["24.1"\]/);
  assert.doesNotMatch(vg, /"2014": .*"25.2"/);
  assert.doesNotMatch(vg, /"2014": .*"25.6"/);

  const hu = thor.slice(thor.indexOf("    Hurricane: {"), thor.indexOf('    "Four Winds Majestic"'));
  assert.match(hu, /"2013": \["29X", "32A", "33G", "34E", "34F"\]/);
  assert.match(hu, /"2014": \["27K", "32N", "34E", "34F", "34J"\]/);
  assert.doesNotMatch(hu, /"2013": .*"27R"/);

  const ws = thor.slice(thor.indexOf("    Windsport: {"), thor.indexOf("    Challenger: {"));
  assert.match(ws, /"2013": \["29X", "32A", "33G", "34E", "34F"\]/);
  assert.match(ws, /"2014": \["27K", "32A", "34E", "34F", "34J"\]/);
  assert.doesNotMatch(ws, /"2013": .*"27R"/);
  assert.doesNotMatch(ws, /"2014": .*"27R"/);

  const tu = thor.slice(thor.indexOf("    Tuscany: {"), thor.indexOf("    Venetian: {"));
  assert.match(tu, /"2013": \["42RQ", "42WX", "45LT"\]/);
  assert.match(tu, /"2014": \["40KQ", "40RX", "42WX", "44MT", "45LT"\]/);
  assert.doesNotMatch(tu, /"2013": .*"40IX"/);
  assert.doesNotMatch(tu, /"2014": .*"45AT"/);

  const pa = thor.slice(thor.indexOf("    Palazzo: {"), thor.indexOf("    Aria: {"));
  assert.match(pa, /"2013": \["33.1", "33.2", "33.3", "36.1"\]/);
  assert.match(pa, /"2014": \["33.2", "33.3", "35.1", "36.1"\]/);
  assert.doesNotMatch(pa, /"2014": .*"33.1"/);

  const ar = thor.slice(thor.indexOf("    Aria: {"), thor.indexOf("    ACE: {"));
  assert.doesNotMatch(ar, /"2013":/);
  assert.doesNotMatch(ar, /"2014":/);

  const ch = thor.slice(thor.indexOf("    Challenger: {"), thor.indexOf("    Miramar: {"));
  assert.match(ch, /"2013": \["36FD", "37DT", "37GT", "37KT"\]/);
  assert.match(ch, /"2014": \["35HT", "37DT", "37GT", "37KT", "37LX"\]/);
  assert.doesNotMatch(ch, /"2013": .*"35KT"/);
  assert.doesNotMatch(ch, /"2014": .*"37FH"/);
  assert.doesNotMatch(ch, /"2014": .*"37TB"/);

  const mag = thor.slice(thor.indexOf("    Magnitude: {"), thor.indexOf('    "Magnitude XG"'));
  assert.doesNotMatch(mag, /"2013":/);
  assert.doesNotMatch(mag, /"2014":/);

  const sen = thor.slice(thor.indexOf("    Seneca: {"), thor.indexOf('    "Four Winds": {'));
  assert.doesNotMatch(sen, /"2012":/);
  assert.doesNotMatch(sen, /"2013":/);
  assert.doesNotMatch(sen, /"2014":/);

  const fw = thor.slice(thor.indexOf('    "Four Winds": {'), thor.indexOf("    Chateau: {"));
  assert.match(fw, /"2013": \["22E", "23U", "24C", "28A", "28Z", "31A", "31F", "31L"\]/);
  assert.match(fw, /"2014": \["22E", "23U", "24C", "26A", "28F", "28Z", "31E", "31L", "31W"\]/);
  assert.doesNotMatch(fw, /"2013": .*"24F"/);
  assert.doesNotMatch(fw, /"2014": .*"33SW"/);
  assert.doesNotMatch(fw, /"2014": .*"35SK"/);

  const cha = thor.slice(thor.indexOf("    Chateau: {"), thor.indexOf("    Quantum: {"));
  assert.match(cha, /"2013": \["22E", "23U", "24C", "28A", "28Z", "31A", "31F", "31L"\]/);
  assert.match(cha, /"2014": \["22E", "23U", "24C", "26A", "28Z", "31E", "31L", "31W"\]/);
  assert.doesNotMatch(cha, /"2014": .*"28F"/);
  assert.doesNotMatch(cha, /"2014": .*"33SW"/);

  const qu = thor.slice(thor.indexOf("    Quantum: {"), thor.indexOf('    "Four Winds Siesta"'));
  assert.doesNotMatch(qu, /"2013":/);
  assert.doesNotMatch(qu, /"2014":/);

  const gem = thor.slice(thor.indexOf("    Gemini: {"), thor.indexOf("    Rize: {"));
  assert.doesNotMatch(gem, /"2013":/);
  assert.doesNotMatch(gem, /"2014":/);

  const oca = thor.slice(thor.indexOf('    "Outlaw Class A": {'), thor.indexOf('    "Outlaw Class C"'));
  assert.match(oca, /"2013": \["37LS"\]/);
  assert.match(oca, /"2014": \["37LS", "37MD"\]/);
  assert.doesNotMatch(oca, /"2013": .*"37MD"/);
  assert.doesNotMatch(oca, /"2014": .*"35SG"/);

  const occ = thor.slice(thor.indexOf('    "Outlaw Class C": {'), thor.indexOf('    "Outlaw Wild West"'));
  assert.doesNotMatch(occ, /"2013":/);
  assert.doesNotMatch(occ, /"2014":/);

  const fws = thor.slice(thor.indexOf('    "Four Winds Siesta": {'), thor.indexOf("    Geneva: {"));
  assert.match(fws, /"2013": \["24SA", "24SR"\]/);
  assert.match(fws, /"2014": \["24SA", "24SR", "24ST"\]/);
  assert.doesNotMatch(fws, /"2013": .*"29TB"/);
  assert.doesNotMatch(fws, /"2014": .*"29GB"/);

  const mix = thor.slice(thor.indexOf("    Outlaw: {"), thor.indexOf("    Sequence: {"));
  assert.doesNotMatch(mix, /"2012":/);
  assert.doesNotMatch(mix, /"2013": \["29H"/);
  assert.doesNotMatch(mix, /"2014": \["29H"/);

  const ace13 = findPowertrainCorrection("2013", "Thor", "ACE", "27.1");
  assert.equal(ace13!.horsepower, 0);
  const ace14 = findPowertrainCorrection("2014", "Thor", "ACE", "30.2");
  assert.equal(ace14!.horsepower, 362);
  assert.equal(ace14!.torqueLbFt, 457);
  const hu13 = findPowertrainCorrection("2013", "Thor", "Hurricane", "29X");
  assert.equal(hu13!.horsepower, 0);
  const hu14 = findPowertrainCorrection("2014", "Thor", "Hurricane", "27K");
  assert.equal(hu14!.horsepower, 362);
  const ws13 = findPowertrainCorrection("2013", "Thor", "Windsport", "29X");
  assert.equal(ws13!.horsepower, 0);
  const ws14 = findPowertrainCorrection("2014", "Thor", "Windsport", "27K");
  assert.equal(ws14!.horsepower, 0);
  const ch13 = findPowertrainCorrection("2013", "Thor", "Challenger", "36FD");
  assert.equal(ch13!.horsepower, 0);
  const ch14 = findPowertrainCorrection("2014", "Thor", "Challenger", "35HT");
  assert.equal(ch14!.horsepower, 362);
  const tus13 = findPowertrainCorrection("2013", "Thor", "Tuscany", "42RQ");
  assert.equal(tus13!.horsepower, 450);
  assert.match(tus13!.engine, /ISL/);
  const tus14 = findPowertrainCorrection("2014", "Thor", "Tuscany", "40KQ");
  assert.equal(tus14!.horsepower, 450);
  const pal13 = findPowertrainCorrection("2013", "Thor", "Palazzo", "33.1");
  assert.equal(pal13!.horsepower, 300);
  assert.equal(pal13!.torqueLbFt, 660);
  const pal14 = findPowertrainCorrection("2014", "Thor", "Palazzo", "35.1");
  assert.equal(pal14!.horsepower, 300);
  const vg14 = findPowertrainCorrection("2014", "Thor", "Vegas", "24.1");
  assert.equal(vg14!.horsepower, 0);
  const ax14 = findPowertrainCorrection("2014", "Thor", "Axis", "24.1");
  assert.equal(ax14!.horsepower, 0);
  const fw13 = findPowertrainCorrection("2013", "Thor", "Four Winds", "22E");
  assert.equal(fw13!.horsepower, 0);
  assert.equal(fw13!.fuelType, "Gas");
  const cha13 = findPowertrainCorrection("2013", "Thor", "Chateau", "22E");
  assert.equal(cha13!.horsepower, 0);
  const siesta13 = findPowertrainCorrection("2013", "Thor", "Four Winds Siesta", "24SA");
  assert.equal(siesta13!.horsepower, 0);
  assert.equal(siesta13!.fuelType, "Diesel");
  const oca13 = findPowertrainCorrection("2013", "Thor", "Outlaw Class A", "37LS");
  assert.equal(oca13!.horsepower, 0);
  const oca14 = findPowertrainCorrection("2014", "Thor", "Outlaw Class A", "37MD");
  assert.equal(oca14!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2013", "Thor", "Outlaw Class C", "29H"), null);
  assert.equal(findPowertrainCorrection("2014", "Thor", "Aria", "3601"), null);
  assert.equal(findPowertrainCorrection("2014", "Thor", "Magnitude", "SV34"), null);
  assert.equal(findPowertrainCorrection("2014", "Thor", "Quantum", "WS31"), null);
  assert.equal(findPowertrainCorrection("2014", "Thor", "Gemini", "23TR"), null);
  assert.equal(findPowertrainCorrection("2013", "Thor", "Seneca", "37SS"), null);
});

test("Thor 2015–2016 OEM year-first floorplans + powertrain pins", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  assert.equal(th.Venetian?.yearStart, 2016);
  assert.equal(th.Miramar?.yearStart, 2015);
  assert.equal(th["Outlaw Class A"]?.yearStart, 2010);
  assert.equal(th["Outlaw Class C"]?.yearStart, 2015);
  assert.equal(th["Four Winds Siesta"]?.yearStart, 2011);
  assert.equal(th.Sanctuary?.yearStart, 2022);
  assert.equal(th.Sequence?.yearStart, 2020);
  assert.equal(th.Tellaro?.yearStart, 2020);
  assert.equal(th.Pasadena?.yearStart, 2022);
  assert.equal(th.Inception?.yearStart, 2022);
  assert.equal(th.Compass?.yearStart, 2017);
  assert.equal(th["Compass AWD"]?.yearStart, 2021);
  assert.equal(th.Rize?.yearStart, 2022);
  assert.equal(th.Omni?.yearStart, 2019);
  assert.equal(th.Delano?.yearStart, 2020);
  assert.equal(th.Tiburon?.yearStart, 2020);
  assert.equal(th.Echelon?.yearStart, 2022);
  assert.equal(th.Geneva?.yearStart, 2018);

  assert.equal(th.ACE?.years?.includes(2015), true);
  assert.equal(th.ACE?.years?.includes(2016), true);
  assert.equal(th.Hurricane?.years?.includes(2015), true);
  assert.equal(th.Hurricane?.years?.includes(2016), true);
  assert.equal(th.Venetian?.years?.includes(2015), false);
  assert.equal(th.Venetian?.years?.includes(2016), true);
  assert.equal(th["Outlaw Class A"]?.years?.includes(2015), true);
  assert.equal(th["Outlaw Class A"]?.years?.includes(2016), false);
  assert.equal(th["Outlaw Class C"]?.years?.includes(2015), true);
  assert.equal(th["Outlaw Class C"]?.years?.includes(2016), false);
  assert.equal(th.Magnitude?.years?.includes(2015), false);
  assert.equal(th.Magnitude?.years?.includes(2016), false);
  assert.equal(th.Omni?.years?.includes(2015), false);
  assert.equal(th.Seneca?.years?.includes(2015), false);
  assert.equal(th.Seneca?.years?.includes(2016), false);
  assert.equal(th.Geneva?.years?.includes(2015), false);
  assert.equal(th.Geneva?.years?.includes(2016), false);
  assert.equal(th.Sequence?.years?.includes(2015), false);
  assert.equal(th.Aria?.years?.includes(2015), false);
  assert.equal(th.Aria?.years?.includes(2016), false);
  assert.equal(th.Sanctuary?.years?.includes(2015), false);
  assert.equal(th.Sanctuary?.years?.includes(2016), false);
  assert.equal(th.Gemini?.years?.includes(2015), false);
  assert.equal(th.Gemini?.years?.includes(2016), true);
  assert.equal(th.Quantum?.years?.includes(2015), false);
  assert.equal(th.Quantum?.years?.includes(2016), true);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2015), true);
  assert.equal(th["Four Winds Siesta"]?.years?.includes(2016), false);
  assert.equal(th.Outlaw?.years?.includes(2015), false);
  assert.equal(th.Outlaw?.years?.includes(2016), false);
  assert.equal(th.Pasadena?.years?.includes(2015), false);
  assert.equal(th.Inception?.years?.includes(2016), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const ace = thor.slice(thor.indexOf("    ACE: {"), thor.indexOf("    Vegas: {"));
  assert.match(ace, /"2015": \["27.1", "29.2", "29.3", "30.1", "30.2"\]/);
  assert.match(ace, /"2016": \["27.1", "27.2", "29.2", "29.3", "29.4", "30.1", "30.2"\]/);
  assert.doesNotMatch(ace, /"2015": .*"32.1"/);
  assert.doesNotMatch(ace, /"2016": .*"32.1"/);

  const ax = thor.slice(thor.indexOf("    Axis: {"), thor.indexOf("    Sereno: {"));
  assert.match(ax, /"2015": \["24.1", "24.2", "25.1", "25.2"\]/);
  assert.match(ax, /"2016": \["24.1", "25.2", "25.3", "25.4"\]/);
  assert.doesNotMatch(ax, /"2015": .*"25.6"/);
  assert.doesNotMatch(ax, /"2016": .*"27.7"/);

  const vg = thor.slice(thor.indexOf("    Vegas: {"), thor.indexOf("    Axis: {"));
  assert.match(vg, /"2015": \["24.1", "24.2", "25.1", "25.2"\]/);
  assert.match(vg, /"2016": \["24.1", "25.2", "25.3", "25.4"\]/);
  assert.doesNotMatch(vg, /"2015": .*"25.6"/);
  assert.doesNotMatch(vg, /"2016": .*"27.7"/);

  const hu = thor.slice(thor.indexOf("    Hurricane: {"), thor.indexOf('    "Four Winds Majestic"'));
  assert.match(hu, /"2015": \["27K", "31S", "32N", "34E", "34F", "34J", "35C"\]/);
  assert.match(hu, /"2016": \["29M", "31S", "34F", "34J", "35C"\]/);
  assert.doesNotMatch(hu, /"2016": .*"27K"/);
  assert.doesNotMatch(hu, /"2015": .*"29M"/);

  const ws = thor.slice(thor.indexOf("    Windsport: {"), thor.indexOf("    Challenger: {"));
  assert.match(ws, /"2015": \["27K", "31S", "32N", "34E", "34F", "34J", "35C"\]/);
  assert.match(ws, /"2016": \["29M", "31S", "34F", "34J", "35C"\]/);
  assert.doesNotMatch(ws, /"2015": .*"27R"/);

  const tu = thor.slice(thor.indexOf("    Tuscany: {"), thor.indexOf("    Venetian: {"));
  assert.match(tu, /"2015": \["40DX", "42HQ", "44MT", "45AT"\]/);
  assert.match(tu, /"2016": \["40DX", "42GX", "44MT", "45AT"\]/);
  assert.doesNotMatch(tu, /"2015": .*"40IX"/);
  assert.doesNotMatch(tu, /"2016": .*"42RQ"/);

  const ve = thor.slice(thor.indexOf("    Venetian: {"), thor.indexOf("    Palazzo: {"));
  assert.match(ve, /"2016": \["M37", "A40"\]/);
  assert.doesNotMatch(ve, /"2015":/);
  assert.doesNotMatch(ve, /"2016": .*"G36"/);

  const pa = thor.slice(thor.indexOf("    Palazzo: {"), thor.indexOf("    Aria: {"));
  assert.match(pa, /"2015": \["33.2", "33.3", "35.1", "36.1", "36.2"\]/);
  assert.match(pa, /"2016": \["33.2", "33.3", "33.4", "35.1", "36.1"\]/);
  assert.doesNotMatch(pa, /"2016": .*"36.2"/);

  const ar = thor.slice(thor.indexOf("    Aria: {"), thor.indexOf("    ACE: {"));
  assert.doesNotMatch(ar, /"2015":/);
  assert.doesNotMatch(ar, /"2016":/);

  const ch = thor.slice(thor.indexOf("    Challenger: {"), thor.indexOf("    Miramar: {"));
  assert.match(ch, /"2015": \["35HT", "37GT", "37KT", "37LX", "37ND", "37TB"\]/);
  assert.match(ch, /"2016": \["36TL", "37GT", "37KT", "37LX", "37TB"\]/);
  assert.doesNotMatch(ch, /"2015": .*"35KT"/);
  assert.doesNotMatch(ch, /"2015": .*"37FH"/);

  const mi = thor.slice(thor.indexOf("    Miramar: {"), thor.indexOf("    Magnitude: {"));
  assert.match(mi, /"2015": \["33.5", "34.1", "34.2", "34.3"\]/);
  assert.match(mi, /"2016": \["33.5", "34.1", "34.2", "34.3", "34.4", "35.2"\]/);

  const mag = thor.slice(thor.indexOf("    Magnitude: {"), thor.indexOf('    "Magnitude XG"'));
  assert.doesNotMatch(mag, /"2015":/);
  assert.doesNotMatch(mag, /"2016":/);

  const fw = thor.slice(thor.indexOf('    "Four Winds": {'), thor.indexOf("    Chateau: {"));
  assert.match(fw, /"2015": \["22E", "23U", "24C", "26A", "28F", "28Z", "29G", "31E", "31L", "31W"\]/);
  assert.match(fw, /"2016": \["22B", "22E", "23U", "24C", "26A", "28Z", "29G", "31E", "31L", "31W"\]/);
  assert.doesNotMatch(fw, /"2015": .*"24F"/);
  assert.doesNotMatch(fw, /"2015": .*"28A"/);
  assert.doesNotMatch(fw, /"2016": .*"32A"/);
  assert.doesNotMatch(fw, /"2016": .*"33SW"/);

  const cha = thor.slice(thor.indexOf("    Chateau: {"), thor.indexOf("    Quantum: {"));
  assert.match(cha, /"2015": \["22E", "23U", "24C", "26A", "28F", "28Z", "29G", "31E", "31L", "31W"\]/);
  assert.match(cha, /"2016": \["22B", "22E", "23U", "24C", "26A", "28Z", "29G", "31E", "31L", "31W"\]/);
  assert.doesNotMatch(cha, /"2016": .*"28F"/);
  assert.doesNotMatch(cha, /"2016": .*"35SB"/);

  const qu = thor.slice(thor.indexOf("    Quantum: {"), thor.indexOf('    "Four Winds Siesta"'));
  assert.doesNotMatch(qu, /"2015":/);
  assert.match(qu, /"2016": \["RS26", "PD31", "WS31"\]/);
  assert.doesNotMatch(qu, /"2016": .*"KW29"/);

  const gem = thor.slice(thor.indexOf("    Gemini: {"), thor.indexOf("    Rize: {"));
  assert.doesNotMatch(gem, /"2015":/);
  assert.match(gem, /"2016": \["23TR"\]/);
  assert.doesNotMatch(gem, /"2016": .*"22TF"/);

  const oca = thor.slice(thor.indexOf('    "Outlaw Class A": {'), thor.indexOf('    "Outlaw Class C"'));
  assert.match(oca, /"2015": \["37LS", "37MD", "38RE"\]/);
  assert.doesNotMatch(oca, /"2016":/);

  const occ = thor.slice(thor.indexOf('    "Outlaw Class C": {'), thor.indexOf('    "Outlaw Wild West"'));
  assert.match(occ, /"2015": \["29H"\]/);
  assert.doesNotMatch(occ, /"2016":/);

  const fws = thor.slice(thor.indexOf('    "Four Winds Siesta": {'), thor.indexOf("    Geneva: {"));
  assert.match(fws, /"2015": \["24SA", "24SL", "24SR", "24ST"\]/);
  assert.doesNotMatch(fws, /"2016":/);

  const sct = thor.slice(thor.indexOf("    Sanctuary: {"), thor.indexOf("    Gemini: {"));
  assert.doesNotMatch(sct, /"2015":/);
  assert.doesNotMatch(sct, /"2016":/);

  const ace15 = findPowertrainCorrection("2015", "Thor", "ACE", "27.1");
  assert.equal(ace15!.horsepower, 362);
  assert.equal(ace15!.torqueLbFt, 457);
  const ace16 = findPowertrainCorrection("2016", "Thor", "ACE", "27.2");
  assert.equal(ace16!.horsepower, 362);
  const ax15 = findPowertrainCorrection("2015", "Thor", "Axis", "24.1");
  assert.equal(ax15!.horsepower, 305);
  const ax16 = findPowertrainCorrection("2016", "Thor", "Axis", "24.1");
  assert.equal(ax16!.horsepower, 305);
  const vg15 = findPowertrainCorrection("2015", "Thor", "Vegas", "24.1");
  assert.equal(vg15!.horsepower, 305);
  const hu15 = findPowertrainCorrection("2015", "Thor", "Hurricane", "27K");
  assert.equal(hu15!.horsepower, 362);
  const pal15 = findPowertrainCorrection("2015", "Thor", "Palazzo", "33.2");
  assert.equal(pal15!.horsepower, 0);
  const pal16 = findPowertrainCorrection("2016", "Thor", "Palazzo", "36.1");
  assert.equal(pal16!.horsepower, 0);
  const ven16 = findPowertrainCorrection("2016", "Thor", "Venetian", "M37");
  assert.equal(ven16!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Venetian", "M37"), null);
  const tus15 = findPowertrainCorrection("2015", "Thor", "Tuscany", "40DX");
  assert.equal(tus15!.horsepower, 450);
  assert.match(tus15!.engine, /ISL/);
  const fw15 = findPowertrainCorrection("2015", "Thor", "Four Winds", "22E");
  assert.equal(fw15!.horsepower, 0);
  assert.equal(fw15!.fuelType, "Gas");
  const cha15 = findPowertrainCorrection("2015", "Thor", "Chateau", "22E");
  assert.equal(cha15!.horsepower, 0);
  const qu16 = findPowertrainCorrection("2016", "Thor", "Quantum", "RS26");
  assert.equal(qu16!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Quantum", "WS31"), null);
  const gem16 = findPowertrainCorrection("2016", "Thor", "Gemini", "23TR");
  assert.equal(gem16!.horsepower, 185);
  assert.equal(gem16!.fuelType, "Diesel");
  assert.equal(findPowertrainCorrection("2015", "Thor", "Gemini", "23TR"), null);
  const siesta15 = findPowertrainCorrection("2015", "Thor", "Four Winds Siesta", "24SA");
  assert.equal(siesta15!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2016", "Thor", "Four Winds Siesta", "24SR"), null);
  const oca15 = findPowertrainCorrection("2015", "Thor", "Outlaw Class A", "37LS");
  assert.equal(oca15!.horsepower, 362);
  const occ15 = findPowertrainCorrection("2015", "Thor", "Outlaw Class C", "29H");
  assert.equal(occ15!.horsepower, 305);
  assert.equal(findPowertrainCorrection("2016", "Thor", "Outlaw Class A", "38RE"), null);
  assert.equal(findPowertrainCorrection("2016", "Thor", "Outlaw Class C", "29H"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Inception", "38BX"), null);
  assert.equal(findPowertrainCorrection("2016", "Thor", "Pasadena", "38BX"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Rize", "18M"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Sanctuary", "19P"), null);
  assert.equal(findPowertrainCorrection("2016", "Thor", "Sanctuary", "24G"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Geneva", "25VT"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Magnitude", "SV34"), null);
  assert.equal(findPowertrainCorrection("2016", "Thor", "Magnitude", "SV38"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Omni", "SV34"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Compass AWD", "23TE"), null);
  assert.equal(findPowertrainCorrection("2015", "Thor", "Aria", "3601"), null);
  assert.equal(findPowertrainCorrection("2016", "Thor", "Aria", "3601"), null);
});

test("Thor 2017–2018 OEM year-first floorplans + powertrain pins", () => {
  const th = CATALOG_INDEX.Thor;
  assert.ok(th);

  assert.equal(th.Venetian?.yearStart, 2016);
  assert.equal(th.Miramar?.yearStart, 2015);
  assert.equal(th["Outlaw Class A"]?.yearStart, 2010);
  assert.equal(th["Outlaw Class C"]?.yearStart, 2015);
  assert.equal(th["Four Winds Sprinter"]?.yearStart, 2017);
  assert.equal(th["Chateau Sprinter"]?.yearStart, 2017);
  assert.equal(th["Quantum Sprinter"]?.yearStart, 2017);
  assert.equal(th.Compass?.yearStart, 2017);
  assert.equal(th.Compass?.yearEnd, 2020);
  assert.equal(th["Compass AWD"]?.yearStart, 2021);
  assert.equal(th.Sequence?.yearStart, 2020);
  assert.equal(th.Tellaro?.yearStart, 2020);
  assert.equal(th.Pasadena?.yearStart, 2022);
  assert.equal(th.Inception?.yearStart, 2022);
  assert.equal(th.Rize?.yearStart, 2022);
  assert.equal(th.Omni?.yearStart, 2019);
  assert.equal(th.Delano?.yearStart, 2020);
  assert.equal(th.Tiburon?.yearStart, 2020);

  assert.equal(th.ACE?.years?.includes(2017), true);
  assert.equal(th.ACE?.years?.includes(2018), true);
  assert.equal(th.Hurricane?.years?.includes(2017), true);
  assert.equal(th.Hurricane?.years?.includes(2018), true);
  assert.equal(th.Miramar?.years?.includes(2017), true);
  assert.equal(th.Miramar?.years?.includes(2018), false);
  assert.equal(th.Chateau?.years?.includes(2017), false);
  assert.equal(th.Chateau?.years?.includes(2018), true);
  assert.equal(th.Geneva?.years?.includes(2017), false);
  assert.equal(th.Geneva?.years?.includes(2018), false);
  assert.equal(th.Rize?.years?.includes(2017), false);
  assert.equal(th.Rize?.years?.includes(2018), false);
  assert.equal(th.Sanctuary?.years?.includes(2017), false);
  assert.equal(th.Sanctuary?.years?.includes(2018), false);
  assert.equal(th.Sequence?.years?.includes(2017), false);
  assert.equal(th.Sequence?.years?.includes(2018), false);
  assert.equal(th.Seneca?.years?.includes(2017), false);
  assert.equal(th.Seneca?.years?.includes(2018), false);
  assert.equal(th.Magnitude?.years?.includes(2017), false);
  assert.equal(th.Magnitude?.years?.includes(2018), false);
  assert.equal(th.Omni?.years?.includes(2017), false);
  assert.equal(th.Omni?.years?.includes(2018), false);
  assert.equal(th.Outlaw?.years?.includes(2017), false);
  assert.equal(th.Outlaw?.years?.includes(2018), false);
  assert.equal(th.Pasadena?.years?.includes(2017), false);
  assert.equal(th.Inception?.years?.includes(2018), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Thor: {");
  const t1 = block.indexOf("  Coachmen: {");
  const thor = block.slice(t0, t1);

  const ace = thor.slice(thor.indexOf("    ACE: {"), thor.indexOf("    Vegas: {"));
  assert.match(ace, /"2017": \["27.2", "29.3", "29.4", "30.2", "30.3", "30.4"\]/);
  assert.match(ace, /"2018": \["27.2", "29.3", "29.4", "30.2", "30.3", "30.4"\]/);
  assert.doesNotMatch(ace, /"2017": \["27.1"/);
  assert.doesNotMatch(ace, /"2018": .*"32.1"/);

  const ax = thor.slice(thor.indexOf("    Axis: {"), thor.indexOf("    Sereno: {"));
  assert.match(ax, /"2017": \["24.1", "25.2", "25.3", "25.4"\]/);
  assert.match(ax, /"2018": \["24.1", "25.2", "25.3", "25.4", "25.5"\]/);
  assert.doesNotMatch(ax, /"2017": .*"25.6"/);
  assert.doesNotMatch(ax, /"2018": .*"27.7"/);

  const vg = thor.slice(thor.indexOf("    Vegas: {"), thor.indexOf("    Axis: {"));
  assert.match(vg, /"2017": \["24.1", "25.2", "25.3", "25.4"\]/);
  assert.match(vg, /"2018": \["24.1", "25.2", "25.3", "25.4", "25.5", "25.6", "27.7"\]/);
  assert.doesNotMatch(vg, /"2017": .*"25.6"/);

  const hu = thor.slice(thor.indexOf("    Hurricane: {"), thor.indexOf('    "Four Winds Majestic"'));
  assert.match(hu, /"2017": \["29M", "31S", "34F", "34J", "34P", "35M"\]/);
  assert.match(hu, /"2018": \["29M", "31S", "31Z", "34J", "34P", "35M"\]/);
  assert.doesNotMatch(hu, /"2018": .*"34F"/);
  assert.doesNotMatch(hu, /"2017": .*"31Z"/);

  const tu = thor.slice(thor.indexOf("    Tuscany: {"), thor.indexOf("    Venetian: {"));
  assert.match(tu, /"2017": \["38SQ", "40DX", "42GX", "44MT", "45AT"\]/);
  assert.match(tu, /"2018": \["38SQ", "40DX", "42GX", "45AT", "45MX"\]/);
  assert.doesNotMatch(tu, /"2017": .*"40IX"/);
  assert.doesNotMatch(tu, /"2018": .*"40IX"/);
  assert.doesNotMatch(tu, /"2018": .*"44MT"/);

  const ve = thor.slice(thor.indexOf("    Venetian: {"), thor.indexOf("    Palazzo: {"));
  assert.match(ve, /"2017": \["G36", "M37", "A40", "T42"\]/);
  assert.match(ve, /"2018": \["G36", "M37", "A40", "S40"\]/);
  assert.doesNotMatch(ve, /"2017": .*"S40"/);
  assert.doesNotMatch(ve, /"2018": .*"T42"/);
  assert.doesNotMatch(ve, /"2017": .*"L40"/);

  const pa = thor.slice(thor.indexOf("    Palazzo: {"), thor.indexOf("    Aria: {"));
  assert.match(pa, /"2017": \["33.2", "33.3", "33.4", "36.1", "36.3"\]/);
  assert.match(pa, /"2018": \["33.2", "33.3", "36.1", "36.3", "37.4"\]/);
  assert.doesNotMatch(pa, /"2018": .*"33.4"/);

  const ar = thor.slice(thor.indexOf("    Aria: {"), thor.indexOf("    ACE: {"));
  assert.match(ar, /"2017": \["3601", "3901"\]/);
  assert.match(ar, /"2018": \["3401", "3601", "3901", "4000"\]/);
  assert.doesNotMatch(ar, /"2017": .*"3401"/);

  const ch = thor.slice(thor.indexOf("    Challenger: {"), thor.indexOf("    Miramar: {"));
  assert.match(ch, /"2017": \["36TL", "37KT", "37LX", "37TB", "37YT"\]/);
  assert.match(ch, /"2018": \["37FH", "37KT", "37TB", "37YT"\]/);
  assert.doesNotMatch(ch, /"2017": .*"35KT"/);
  assert.doesNotMatch(ch, /"2017": .*"37FH"/);

  const mi = thor.slice(thor.indexOf("    Miramar: {"), thor.indexOf("    Magnitude: {"));
  assert.match(mi, /"2017": \["34.1", "34.2", "34.4", "35.2", "37.1"\]/);
  assert.doesNotMatch(mi, /"2018":/);
  assert.doesNotMatch(mi, /"2017": .*"34.6"/);

  const mag = thor.slice(thor.indexOf("    Magnitude: {"), thor.indexOf('    "Magnitude XG"'));
  assert.doesNotMatch(mag, /"2017":/);
  assert.doesNotMatch(mag, /"2018":/);

  const fw = thor.slice(thor.indexOf('    "Four Winds": {'), thor.indexOf("    Chateau: {"));
  assert.match(fw, /"2017": \["22B", "22E", "23U", "24F", "26B", "28Z", "29G", "30D", "31E", "31L", "31W"\]/);
  assert.match(fw, /"2018": \["22B", "22E", "23U", "24F", "26B", "28Z", "29G", "30D", "31E", "31W", "31Y"\]/);
  assert.doesNotMatch(fw, /"2017": .*"28A"/);
  assert.doesNotMatch(fw, /"2018": .*"31L"/);
  assert.doesNotMatch(fw, /"2018": .*"25M"/);

  const cha = thor.slice(thor.indexOf("    Chateau: {"), thor.indexOf("    Quantum: {"));
  assert.doesNotMatch(cha, /"2017":/);
  assert.match(cha, /"2018": \["22B", "22E", "23U", "24F", "26B", "28Z", "29G", "30D", "31E", "31W", "31Y"\]/);

  const qu = thor.slice(thor.indexOf("    Quantum: {"), thor.indexOf('    "Four Winds Siesta"'));
  assert.match(qu, /"2017": \["GR22", "RS26", "RQ29", "LF31", "PD31", "WS31"\]/);
  assert.match(qu, /"2018": \["GR22", "RS26", "RQ29", "LF31", "PD31", "WS31"\]/);
  assert.doesNotMatch(qu, /"2017": .*"KW29"/);
  assert.doesNotMatch(qu, /"2017": .*"KM24"/);

  const gem = thor.slice(thor.indexOf("    Gemini: {"), thor.indexOf("    Rize: {"));
  assert.match(gem, /"2017": \["23TB", "23TK", "23TR", "24TX"\]/);
  assert.match(gem, /"2018": \["23TB", "23TK", "23TR", "24TX"\]/);
  assert.doesNotMatch(gem, /"2017": .*"22TF"/);

  const oca = thor.slice(thor.indexOf('    "Outlaw Class A": {'), thor.indexOf('    "Outlaw Class C"'));
  assert.match(oca, /"2017": \["37BG", "37RB", "38RE"\]/);
  assert.match(oca, /"2018": \["37BG", "37RB", "38RE"\]/);

  const occ = thor.slice(thor.indexOf('    "Outlaw Class C": {'), thor.indexOf('    "Outlaw Wild West"'));
  assert.match(occ, /"2017": \["29H"\]/);
  assert.match(occ, /"2018": \["29H"\]/);

  const ace17 = findPowertrainCorrection("2017", "Thor", "ACE", "27.2");
  assert.equal(ace17!.horsepower, 320);
  assert.equal(ace17!.torqueLbFt, 460);
  const ace18 = findPowertrainCorrection("2018", "Thor", "ACE", "27.2");
  assert.equal(ace18!.horsepower, 320);
  const ax17 = findPowertrainCorrection("2017", "Thor", "Axis", "24.1");
  assert.equal(ax17!.horsepower, 305);
  const vg18 = findPowertrainCorrection("2018", "Thor", "Vegas", "24.1");
  assert.equal(vg18!.horsepower, 305);
  const hu17 = findPowertrainCorrection("2017", "Thor", "Hurricane", "29M");
  assert.equal(hu17!.horsepower, 320);
  const pal17 = findPowertrainCorrection("2017", "Thor", "Palazzo", "33.2");
  assert.equal(pal17!.horsepower, 0);
  const pal18 = findPowertrainCorrection("2018", "Thor", "Palazzo", "37.4");
  assert.equal(pal18!.horsepower, 0);
  const ven17 = findPowertrainCorrection("2017", "Thor", "Venetian", "G36");
  assert.equal(ven17!.horsepower, 0);
  const ven18 = findPowertrainCorrection("2018", "Thor", "Venetian", "S40");
  assert.equal(ven18!.horsepower, 400);
  const tus17 = findPowertrainCorrection("2017", "Thor", "Tuscany", "40DX");
  assert.equal(tus17!.horsepower, 450);
  assert.match(tus17!.engine, /ISL/);
  const aria17 = findPowertrainCorrection("2017", "Thor", "Aria", "3601");
  assert.equal(aria17!.horsepower, 360);
  const fw17 = findPowertrainCorrection("2017", "Thor", "Four Winds", "22B");
  assert.equal(fw17!.horsepower, 0);
  assert.equal(fw17!.fuelType, "Gas");
  const fws17 = findPowertrainCorrection("2017", "Thor", "Four Winds Sprinter", "24FS");
  assert.equal(fws17!.horsepower, 0);
  const fws18 = findPowertrainCorrection("2018", "Thor", "Four Winds Sprinter", "24HL");
  assert.equal(fws18!.horsepower, 188);
  const qs17 = findPowertrainCorrection("2017", "Thor", "Quantum Sprinter", "KM24");
  assert.equal(qs17!.horsepower, 0);
  const gem17 = findPowertrainCorrection("2017", "Thor", "Gemini", "23TB");
  assert.equal(gem17!.horsepower, 0);
  assert.equal(gem17!.fuelType, "Diesel");
  const cmp17 = findPowertrainCorrection("2017", "Thor", "Compass", "23TB");
  assert.equal(cmp17!.horsepower, 185);
  const cmp18 = findPowertrainCorrection("2018", "Thor", "Compass", "23TB");
  assert.equal(cmp18!.horsepower, 0);
  const cmpAwd = findPowertrainCorrection("2017", "Thor", "Compass AWD", "23TE");
  assert.equal(cmpAwd, null);
  assert.equal(findPowertrainCorrection("2017", "Thor", "Inception", "38BX"), null);
  assert.equal(findPowertrainCorrection("2018", "Thor", "Pasadena", "38BX"), null);
  assert.equal(findPowertrainCorrection("2017", "Thor", "Rize", "18M"), null);
  assert.equal(findPowertrainCorrection("2018", "Thor", "Sanctuary", "19P"), null);
  assert.equal(findPowertrainCorrection("2017", "Thor", "Geneva", "25VT"), null);
  assert.equal(findPowertrainCorrection("2017", "Thor", "Magnitude", "SV34"), null);
  assert.equal(findPowertrainCorrection("2018", "Thor", "Omni", "SV34"), null);
  assert.equal(findPowertrainCorrection("2018", "Thor", "Miramar", "34.2"), null);
});

test("Jayco 2023–2024 OEM year-first floorplans + powertrain pins", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Embark?.yearEnd, 2023);
  assert.equal(jc.Embark?.years?.includes(2023), true);
  assert.equal(jc.Embark?.years?.includes(2024), false);
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.years?.includes(2023), false);

  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2022), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2023), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2024), true);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);
  assert.equal(jc["Alante SE"]?.years?.includes(2023), false);
  assert.equal(jc["Alante SE"]?.years?.includes(2024), false);

  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca XT"]?.yearStart, 2023);
  assert.equal(jc["Seneca XT"]?.years?.includes(2023), true);
  assert.equal(jc["Greyhawk XL"]?.yearStart, 2024);
  assert.equal(jc["Greyhawk XL"]?.years?.includes(2023), false);
  assert.equal(jc["Greyhawk XL"]?.years?.includes(2024), true);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);
  assert.equal(jc["Granite Ridge"]?.years?.includes(2023), false);
  assert.equal(jc.Comet?.yearStart, 2024);
  assert.equal(jc.Comet?.years?.includes(2023), false);
  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Solstice?.yearStart, 2023);
  assert.equal(jc.Terrain?.yearStart, 2022);

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr = jayco.slice(jayco.indexOf("    Precept: {"), jayco.indexOf("    Alante: {"));
  assert.match(pr, /"2023": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.match(pr, /"2024": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.match(pr, /"2022": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.doesNotMatch(pr, /"2023": \["31UL", "34G", "36A", "36T"\]/);
  assert.doesNotMatch(pr, /"2024": \["31UL", "34G", "36A"\]/);

  const al = jayco.slice(jayco.indexOf("    Alante: {"), jayco.indexOf("    Embark: {"));
  assert.match(al, /"2023": \["27A", "29F", "29S"\]/);
  assert.match(al, /"2024": \["27A", "29F", "29S"\]/);
  assert.match(al, /"2022": \["26X", "27A", "29F", "29S", "31V"\]/);
  assert.doesNotMatch(al, /"2023": \["26X"/);
  assert.doesNotMatch(al, /"2024": \["26X"/);

  const em = jayco.slice(jayco.indexOf("    Embark: {"), jayco.indexOf("    Seneca: {"));
  assert.match(em, /"2023": \["37K", "39BH", "39T2"\]/);
  assert.match(em, /"2022": \["37K", "39BH", "39T2"\]/);
  assert.doesNotMatch(em, /"2023": \["37K", "38N", "39Z"\]/);
  assert.doesNotMatch(em, /"2024":/);

  const se = jayco.slice(jayco.indexOf("    Seneca: {"), jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2023": \["37K", "37L", "37M"\]/);
  assert.match(se, /"2024": \["37K", "37L", "37M"\]/);
  assert.match(se, /"2022": \["37K", "37L", "37M", "37RB", "37TS"\]/);
  assert.doesNotMatch(se, /"2023": .*"33J"/);
  assert.doesNotMatch(se, /"2024": .*"33J"/);

  const gh = jayco.slice(jayco.indexOf("    Greyhawk: {"), jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2023": \["27U", "29MV", "30Z", "31F"\]/);
  assert.match(gh, /"2024": \["27U", "29MV", "30Z", "31F"\]/);
  assert.match(gh, /"2022": \["27U", "29MV", "30X", "30Z", "31F"\]/);
  assert.doesNotMatch(gh, /"2023": .*"30X"/);
  assert.doesNotMatch(gh, /"2024": .*"32S"/);

  const rh = jayco.slice(jayco.indexOf("    Redhawk: {"), jayco.indexOf("    Melbourne: {"));
  assert.match(rh, /"2023": \["24B", "26M", "26XD", "29XK", "31F"\]/);
  assert.match(rh, /"2024": \["24B", "26M", "26XD", "29XK", "31F"\]/);
  assert.match(rh, /"2022": \["24B", "25R", "26M", "26XD", "29XK", "31F"\]/);
  assert.doesNotMatch(rh, /"2023": \["22J"/);
  assert.doesNotMatch(rh, /"2025": .*"26XD"/);

  const mb = jayco.slice(jayco.indexOf("    Melbourne: {"), jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2023": \["24L", "24R", "24T"\]/);
  assert.match(mb, /"2024": \["24L", "24R", "24T"\]/);
  assert.match(mb, /"2022": \["24L", "24R", "24T"\]/);
  assert.match(mb, /"2025": \["24L", "24R"\]/);
  assert.doesNotMatch(mb, /"2023": .*"24K"/);
  assert.doesNotMatch(mb, /"2025": .*"24T"/);
  assert.doesNotMatch(mb, /"2024": \["25L"/);

  const mp = jayco.slice(jayco.indexOf('    "Melbourne Prestige": {'), jayco.indexOf('    "Alante SE"'));
  assert.match(mp, /"2023": \["24LP", "24NP", "24RP", "24TP"\]/);
  assert.match(mp, /"2024": \["24LP", "24NP", "24RP", "24TP"\]/);
  assert.match(mp, /"2022": \["24LP", "24NP", "24RP", "24TP"\]/);
  assert.match(mp, /"2025": \["24LP", "24RP"\]/);
  assert.doesNotMatch(mp, /"2023": .*"24KP"/);
  assert.doesNotMatch(mp, /"2025": .*"24NP"/);

  const pp = jayco.slice(jayco.indexOf('    "Precept Prestige": {'), jayco.indexOf('    "Embark Super C"'));
  assert.match(pp, /"2022": \["36B", "36H", "36U"\]/);
  assert.match(pp, /"2023": \["36B", "36H", "36U"\]/);
  assert.match(pp, /"2024": \["36B", "36H", "36U"\]/);
  assert.doesNotMatch(pp, /"2021":/);

  const ase = jayco.slice(jayco.indexOf('    "Alante SE": {'), jayco.indexOf('    "Precept Prestige"'));
  assert.doesNotMatch(ase, /"2023":/);
  assert.doesNotMatch(ase, /"2024":/);

  const gxl = jayco.slice(jayco.indexOf('    "Greyhawk XL": {'), jayco.indexOf('    "Granite Ridge"'));
  assert.match(gxl, /"2024": \["32U"\]/);
  assert.match(gxl, /"2025": \["30M", "32U", "33F"\]/);
  assert.doesNotMatch(gxl, /"2023":/);
  assert.doesNotMatch(gxl, /"2024": .*"30M"/);
  assert.doesNotMatch(gxl, /"2024": .*"33F"/);

  const sxt = jayco.slice(jayco.indexOf('    "Seneca XT": {'), jayco.indexOf('    "Seneca Prestige"'));
  assert.match(sxt, /"2023": \["32U", "35L"\]/);
  assert.match(sxt, /"2024": \["29T", "32U", "35L"\]/);
  assert.doesNotMatch(sxt, /"2023": .*"29T"/);

  const spr = jayco.slice(jayco.indexOf('    "Seneca Prestige": {'), jayco.indexOf("    Comet: {"));
  assert.match(spr, /"2021": \["37K", "37L", "37M"\]/);
  assert.match(spr, /"2022": \["37K", "37L", "37M"\]/);
  assert.match(spr, /"2023": \["37K", "37L", "37M"\]/);
  assert.match(spr, /"2024": \["37K", "37L", "37M"\]/);
  assert.doesNotMatch(spr, /"2023": .*"33J"/);

  const rse = jayco.slice(jayco.indexOf('    "Redhawk SE": {'), jayco.indexOf('    "Greyhawk XL"'));
  assert.match(rse, /"2022": \["22A", "22C", "27N"\]/);
  assert.match(rse, /"2023": \["22A", "22AF", "22C", "22CF", "27N", "27NF"\]/);
  assert.match(rse, /"2024": \["22A", "22AF", "22C", "22CF", "27N", "27NF"\]/);
  assert.doesNotMatch(rse, /"2022": .*"22AF"/);
  assert.doesNotMatch(rse, /"2023": .*"22E"/);
  assert.doesNotMatch(rse, /"2024": .*"31FF"/);
  assert.doesNotMatch(rse, /"2025": .*"27N"/);

  const gr = jayco.slice(jayco.indexOf('    "Granite Ridge": {'), jayco.indexOf('    "Seneca XT"'));
  assert.match(gr, /"2024": \["22T"\]/);
  assert.match(gr, /"2025": \["22T", "23S"\]/);
  assert.doesNotMatch(gr, /"2023":/);
  assert.doesNotMatch(gr, /"2024": .*"23S"/);

  const sw = jayco.slice(jayco.indexOf("    Swift: {"), jayco.indexOf("    Solstice: {"));
  assert.match(sw, /"2022": \["20A", "20T"\]/);
  assert.match(sw, /"2023": \["20A", "20D", "20T"\]/);
  assert.match(sw, /"2024": \["20A", "20D", "20T"\]/);
  assert.match(sw, /"2025": \["20A", "20E", "20T", "20Y"\]/);
  assert.doesNotMatch(sw, /"2022": .*"20D"/);
  assert.doesNotMatch(sw, /"2023": .*"20E"/);
  assert.doesNotMatch(sw, /"2025": .*"20D"/);

  const so = jayco.slice(jayco.indexOf("    Solstice: {"), jayco.indexOf("    Terrain: {"));
  assert.match(so, /"2023": \["21B"\]/);
  assert.match(so, /"2024": \["21B"\]/);
  assert.doesNotMatch(so, /"2023": .*"21L"/);
  assert.doesNotMatch(so, /"2024": .*"21T"/);

  const co = jayco.slice(jayco.indexOf("    Comet: {"), jayco.indexOf("    Swift: {"));
  assert.match(co, /"2024": \["18C"\]/);
  assert.doesNotMatch(co, /"2023":/);
  assert.doesNotMatch(co, /"2024": .*"18L"/);

  const te = jayco.slice(jayco.indexOf("    Terrain: {"), jayco.indexOf('    "Jay Feather"'));
  assert.match(te, /"2022": \["19Y"\]/);
  assert.match(te, /"2023": \["19Y"\]/);
  assert.match(te, /"2024": \["19Y"\]/);
  assert.match(te, /"2025": \["19Y", "19YG"\]/);
  assert.doesNotMatch(te, /"2023": .*"19YG"/);
  assert.doesNotMatch(te, /"2024": .*"19A"/);

  const pr23 = findPowertrainCorrection("2023", "Jayco", "Precept", "31UL");
  assert.equal(pr23!.horsepower, 335);
  assert.equal(pr23!.torqueLbFt, 468);
  assert.equal(pr23!.fuelType, "Gas");
  const pr24 = findPowertrainCorrection("2024", "Jayco", "Precept", "36C");
  assert.equal(pr24!.horsepower, 335);
  const pp23 = findPowertrainCorrection("2023", "Jayco", "Precept Prestige", "36B");
  assert.equal(pp23!.horsepower, 335);
  const al23 = findPowertrainCorrection("2023", "Jayco", "Alante", "27A");
  assert.equal(al23!.horsepower, 335);

  const emb23 = findPowertrainCorrection("2023", "Jayco", "Embark", "39BH");
  assert.equal(emb23!.horsepower, 360);
  assert.match(emb23!.chassis || "", /Spartan K1/);
  assert.equal(findPowertrainCorrection("2024", "Jayco", "Embark", "37K"), null);

  const sen23 = findPowertrainCorrection("2023", "Jayco", "Seneca", "37K");
  assert.equal(sen23!.horsepower, 360);
  assert.match(sen23!.chassis || "", /S2RV/);
  assert.doesNotMatch(sen23!.chassis || "", /Plus/);
  const sen24 = findPowertrainCorrection("2024", "Jayco", "Seneca", "37L");
  assert.match(sen24!.chassis || "", /S2RV Plus/);
  const spr23 = findPowertrainCorrection("2023", "Jayco", "Seneca Prestige", "37M");
  assert.match(spr23!.chassis || "", /S2RV/);
  assert.doesNotMatch(spr23!.chassis || "", /Plus/);

  const sxt23 = findPowertrainCorrection("2023", "Jayco", "Seneca XT", "32U");
  assert.equal(sxt23!.horsepower, 330);
  assert.equal(sxt23!.torqueLbFt, 825);
  assert.match(sxt23!.engine, /Power Stroke/);
  const sxt24 = findPowertrainCorrection("2024", "Jayco", "Seneca XT", "29T");
  assert.equal(sxt24!.torqueLbFt, 950);
  const gxl24 = findPowertrainCorrection("2024", "Jayco", "Greyhawk XL", "32U");
  assert.equal(gxl24!.horsepower, 330);
  assert.equal(gxl24!.torqueLbFt, 950);

  const gh23 = findPowertrainCorrection("2023", "Jayco", "Greyhawk", "27U");
  assert.equal(gh23!.horsepower, 350);
  assert.equal(gh23!.torqueLbFt, 468);
  assert.equal(gh23!.fuelType, "Gas");
  const gh24 = findPowertrainCorrection("2024", "Jayco", "Greyhawk", "30Z");
  assert.equal(gh24!.horsepower, 325);
  assert.equal(gh24!.torqueLbFt, 450);

  const rh23 = findPowertrainCorrection("2023", "Jayco", "Redhawk", "24B");
  assert.equal(rh23!.horsepower, 325);
  const rse23 = findPowertrainCorrection("2023", "Jayco", "Redhawk SE", "22AF");
  assert.equal(rse23!.horsepower, 0);
  assert.match(rse23!.chassis || "", /Chevy 3500/);
  const rse24 = findPowertrainCorrection("2024", "Jayco", "Redhawk SE", "27NF");
  assert.equal(rse24!.horsepower, 0);
  assert.match(rse24!.chassis || "", /4500/);

  const mb23 = findPowertrainCorrection("2023", "Jayco", "Melbourne", "24T");
  assert.equal(mb23!.horsepower, 188);
  assert.equal(mb23!.torqueLbFt, 325);
  const mb24 = findPowertrainCorrection("2024", "Jayco", "Melbourne", "24L");
  assert.equal(mb24!.horsepower, 211);
  assert.equal(mb24!.torqueLbFt, 332);
  const mp23 = findPowertrainCorrection("2023", "Jayco", "Melbourne Prestige", "24LP");
  assert.equal(mp23!.horsepower, 188);
  assert.match(mp23!.chassis || "", /3500/);
  const mp24 = findPowertrainCorrection("2024", "Jayco", "Melbourne Prestige", "24RP");
  assert.equal(mp24!.horsepower, 211);
  assert.match(mp24!.chassis || "", /3500/);

  const gr22 = findPowertrainCorrection("2024", "Jayco", "Granite Ridge", "22T");
  assert.equal(gr22!.horsepower, 310);
  assert.equal(gr22!.fuelType, "Gas");
  assert.equal(findPowertrainCorrection("2024", "Jayco", "Granite Ridge", "23S"), null);

  const sw23 = findPowertrainCorrection("2023", "Jayco", "Swift", "20D");
  assert.equal(sw23!.horsepower, 276);
  assert.equal(sw23!.fuelType, "Gas");
  const so23 = findPowertrainCorrection("2023", "Jayco", "Solstice", "21B");
  assert.equal(so23!.horsepower, 310);
  const te23 = findPowertrainCorrection("2023", "Jayco", "Terrain", "19Y");
  assert.equal(te23!.horsepower, 188);
  assert.equal(te23!.fuelType, "Diesel");
  const te24 = findPowertrainCorrection("2024", "Jayco", "Terrain", "19Y");
  assert.equal(te24!.horsepower, 211);
  const comet24 = findPowertrainCorrection("2024", "Jayco", "Comet", "18C");
  assert.equal(comet24!.horsepower, 276);
});

test("Jayco 2021–2022 OEM year-first floorplans + powertrain pins", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Embark?.yearEnd, 2023);
  assert.equal(jc.Embark?.years?.includes(2021), true);
  assert.equal(jc.Embark?.years?.includes(2022), true);
  assert.equal(jc.Embark?.years?.includes(2023), true);
  assert.equal(jc.Embark?.years?.includes(2024), false);
  assert.equal(jc.Embark?.type, "Class A Diesel");
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.yearStart, 2009);
  assert.equal(jc["Embark Super C"]?.yearEnd, 2012);
  assert.equal(jc["Embark Super C"]?.years?.includes(2021), false);
  assert.equal(jc["Embark Super C"]?.years?.includes(2022), false);

  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2021), false);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2022), true);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);
  assert.equal(jc["Alante SE"]?.years?.includes(2021), false);
  assert.equal(jc["Alante SE"]?.years?.includes(2022), false);

  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2021), true);
  assert.equal(jc["Seneca XT"]?.yearStart, 2023);
  assert.equal(jc["Seneca XT"]?.years?.includes(2021), false);
  assert.equal(jc["Seneca XT"]?.years?.includes(2022), false);
  assert.equal(jc["Greyhawk XL"]?.yearStart, 2024);
  assert.equal(jc["Greyhawk XL"]?.years?.includes(2021), false);
  assert.equal(jc["Greyhawk XL"]?.years?.includes(2022), false);
  assert.equal(jc["Greyhawk Prestige"]?.yearStart, 2018);
  assert.equal(jc["Greyhawk Prestige"]?.yearEnd, 2022);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2021), true);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2022), true);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2023), false);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2021), true);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);
  assert.equal(jc["Granite Ridge"]?.years?.includes(2021), false);
  assert.equal(jc["Granite Ridge"]?.years?.includes(2022), false);
  assert.equal(jc.Comet?.yearStart, 2024);
  assert.equal(jc.Comet?.years?.includes(2021), false);
  assert.equal(jc.Comet?.years?.includes(2022), false);
  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Swift?.years?.includes(2021), true);
  assert.equal(jc.Solstice?.yearStart, 2023);
  assert.equal(jc.Solstice?.years?.includes(2021), false);
  assert.equal(jc.Solstice?.years?.includes(2022), false);
  assert.equal(jc.Terrain?.yearStart, 2022);
  assert.equal(jc.Terrain?.years?.includes(2021), false);
  assert.equal(jc.Terrain?.years?.includes(2022), true);

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr = jayco.slice(jayco.indexOf("    Precept: {"), jayco.indexOf("    Alante: {"));
  assert.match(pr, /"2021": \["29V", "31UL", "34B", "34G", "36A"\]/);
  assert.match(pr, /"2022": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.match(pr, /"2020": \["29V", "31UL", "34B", "34G", "36A"\]/);
  assert.doesNotMatch(pr, /"2021": .*"36C"/);
  assert.doesNotMatch(pr, /"2022": .*"29V"/);
  assert.doesNotMatch(pr, /"2021": .*"36T"/);
  assert.doesNotMatch(pr, /"2020": .*"36C"/);

  const al = jayco.slice(jayco.indexOf("    Alante: {"), jayco.indexOf("    Embark: {"));
  assert.match(al, /"2021": \["26X", "27A", "29F", "29S", "31V"\]/);
  assert.match(al, /"2022": \["26X", "27A", "29F", "29S", "31V"\]/);
  assert.match(al, /"2020": \["26X", "27A", "29F", "29S", "31V"\]/);
  assert.doesNotMatch(al, /"2023": \["26X"/);
  assert.doesNotMatch(al, /"2020": .*"31R"/);

  const em = jayco.slice(jayco.indexOf("    Embark: {"), jayco.indexOf("    Seneca: {"));
  assert.match(em, /"2021": \["37K", "39BH", "39T2"\]/);
  assert.match(em, /"2022": \["37K", "39BH", "39T2"\]/);
  assert.match(em, /yearEnd:\s*2023/);
  assert.doesNotMatch(em, /"2021": .*"38N"/);
  assert.doesNotMatch(em, /"2022": .*"39Z"/);
  assert.doesNotMatch(em, /"2024":/);

  const se = jayco.slice(jayco.indexOf("    Seneca: {"), jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2021": \["37HJ", "37K", "37L", "37M", "37RB", "37TS"\]/);
  assert.match(se, /"2022": \["37K", "37L", "37M", "37RB", "37TS"\]/);
  assert.doesNotMatch(se, /"2022": .*"37HJ"/);
  assert.doesNotMatch(se, /"2023": .*"37RB"/);

  const gh = jayco.slice(jayco.indexOf("    Greyhawk: {"), jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2021": \["27U", "29MV", "30X", "30Z", "31F"\]/);
  assert.match(gh, /"2022": \["27U", "29MV", "30X", "30Z", "31F"\]/);
  assert.match(gh, /"2020": \["27U", "29MV", "30X", "30Z", "31F"\]/);
  assert.doesNotMatch(gh, /"2023": .*"30X"/);
  assert.doesNotMatch(gh, /"2020": .*"26Y"/);
  assert.doesNotMatch(gh, /"2021": .*"32S"/);

  const ghp = jayco.slice(jayco.indexOf('    "Greyhawk Prestige": {'), jayco.indexOf("    Redhawk: {"));
  assert.match(ghp, /"2021": \["29MVP", "30XP", "31FP"\]/);
  assert.match(ghp, /"2022": \["29MVP", "30XP", "31FP"\]/);
  assert.match(ghp, /yearEnd:\s*2022/);
  assert.doesNotMatch(ghp, /"2023":/);
  assert.match(ghp, /"2020": \["29MVP", "30XP", "31FP"\]/);

  const rh = jayco.slice(jayco.indexOf("    Redhawk: {"), jayco.indexOf("    Melbourne: {"));
  assert.match(rh, /"2021": \["22J", "24B", "25R", "26M", "26XD", "29XK", "31F"\]/);
  assert.match(rh, /"2022": \["24B", "25R", "26M", "26XD", "29XK", "31F"\]/);
  assert.match(rh, /"2020": \["22J", "24B", "25R", "26XD", "29XK", "31F"\]/);
  assert.doesNotMatch(rh, /"2022": .*"22J"/);
  assert.doesNotMatch(rh, /"2023": .*"25R"/);
  assert.doesNotMatch(rh, /"2020": .*"26M"/);

  const mb = jayco.slice(jayco.indexOf("    Melbourne: {"), jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2021": \["24K", "24L", "24T"\]/);
  assert.match(mb, /"2022": \["24L", "24R", "24T"\]/);
  assert.match(mb, /"2020": \["24K", "24L"\]/);
  assert.doesNotMatch(mb, /"2021": .*"24R"/);
  assert.doesNotMatch(mb, /"2022": .*"24K"/);
  assert.doesNotMatch(mb, /"2020": .*"24T"/);

  const mp = jayco.slice(jayco.indexOf('    "Melbourne Prestige": {'), jayco.indexOf('    "Alante SE"'));
  assert.match(mp, /"2021": \["24KP", "24LP", "24RP", "24TP"\]/);
  assert.match(mp, /"2022": \["24LP", "24NP", "24RP", "24TP"\]/);
  assert.match(mp, /"2020": \["24AP", "24KP", "24LP", "24TP"\]/);
  assert.doesNotMatch(mp, /"2021": .*"24NP"/);
  assert.doesNotMatch(mp, /"2022": .*"24KP"/);

  const pp = jayco.slice(jayco.indexOf('    "Precept Prestige": {'), jayco.indexOf('    "Embark Super C"'));
  assert.match(pp, /"2022": \["36B", "36H", "36U"\]/);
  assert.doesNotMatch(pp, /"2021":/);
  assert.match(pp, /yearStart:\s*2019/);

  const ase = jayco.slice(jayco.indexOf('    "Alante SE": {'), jayco.indexOf('    "Precept Prestige"'));
  assert.doesNotMatch(ase, /"2021":/);
  assert.doesNotMatch(ase, /"2022":/);

  const gxl = jayco.slice(jayco.indexOf('    "Greyhawk XL": {'), jayco.indexOf('    "Granite Ridge"'));
  assert.doesNotMatch(gxl, /"2021":/);
  assert.doesNotMatch(gxl, /"2022":/);

  const sxt = jayco.slice(jayco.indexOf('    "Seneca XT": {'), jayco.indexOf('    "Seneca Prestige"'));
  assert.doesNotMatch(sxt, /"2021":/);
  assert.doesNotMatch(sxt, /"2022":/);

  const spr = jayco.slice(jayco.indexOf('    "Seneca Prestige": {'), jayco.indexOf("    Comet: {"));
  assert.match(spr, /"2021": \["37K", "37L", "37M"\]/);
  assert.match(spr, /"2022": \["37K", "37L", "37M"\]/);
  assert.doesNotMatch(spr, /"2021": .*"37HJ"/);
  assert.doesNotMatch(spr, /"2021": .*"37RB"/);

  const rse = jayco.slice(jayco.indexOf('    "Redhawk SE": {'), jayco.indexOf('    "Greyhawk XL"'));
  assert.match(rse, /"2021": \["22A", "22C", "27N"\]/);
  assert.match(rse, /"2022": \["22A", "22C", "27N"\]/);
  assert.doesNotMatch(rse, /"2021": .*"22AF"/);
  assert.doesNotMatch(rse, /"2022": .*"22CF"/);
  assert.doesNotMatch(rse, /"2021": .*"27NF"/);

  const gr = jayco.slice(jayco.indexOf('    "Granite Ridge": {'), jayco.indexOf('    "Seneca XT"'));
  assert.doesNotMatch(gr, /"2021":/);
  assert.doesNotMatch(gr, /"2022":/);

  const sw = jayco.slice(jayco.indexOf("    Swift: {"), jayco.indexOf("    Solstice: {"));
  assert.match(sw, /"2021": \["20A", "20T"\]/);
  assert.match(sw, /"2022": \["20A", "20T"\]/);
  assert.doesNotMatch(sw, /"2021": .*"20D"/);
  assert.doesNotMatch(sw, /"2022": .*"20D"/);

  const so = jayco.slice(jayco.indexOf("    Solstice: {"), jayco.indexOf("    Terrain: {"));
  assert.doesNotMatch(so, /"2021":/);
  assert.doesNotMatch(so, /"2022":/);

  const co = jayco.slice(jayco.indexOf("    Comet: {"), jayco.indexOf("    Swift: {"));
  assert.doesNotMatch(co, /"2021":/);
  assert.doesNotMatch(co, /"2022":/);

  const te = jayco.slice(jayco.indexOf("    Terrain: {"), jayco.indexOf('    "Jay Feather"'));
  assert.match(te, /"2022": \["19Y"\]/);
  assert.doesNotMatch(te, /"2021":/);
  assert.doesNotMatch(te, /"2022": .*"19YG"/);

  const pr21 = findPowertrainCorrection("2021", "Jayco", "Precept", "29V");
  assert.equal(pr21!.horsepower, 350);
  assert.equal(pr21!.torqueLbFt, 468);
  assert.equal(pr21!.fuelType, "Gas");
  const pr22 = findPowertrainCorrection("2022", "Jayco", "Precept", "36C");
  assert.equal(pr22!.horsepower, 350);
  const pr23 = findPowertrainCorrection("2023", "Jayco", "Precept", "31UL");
  assert.equal(pr23!.horsepower, 335);
  const pp21 = findPowertrainCorrection("2021", "Jayco", "Precept Prestige", "36B");
  assert.equal(pp21, null);
  const pp22 = findPowertrainCorrection("2022", "Jayco", "Precept Prestige", "36B");
  assert.equal(pp22!.horsepower, 350);
  const pp23 = findPowertrainCorrection("2023", "Jayco", "Precept Prestige", "36B");
  assert.equal(pp23!.horsepower, 335);
  const al21 = findPowertrainCorrection("2021", "Jayco", "Alante", "26X");
  assert.equal(al21!.horsepower, 350);
  const al23 = findPowertrainCorrection("2023", "Jayco", "Alante", "27A");
  assert.equal(al23!.horsepower, 335);

  const emb21 = findPowertrainCorrection("2021", "Jayco", "Embark", "37K");
  assert.equal(emb21!.horsepower, 360);
  assert.match(emb21!.chassis || "", /Spartan K1/);
  const emb22 = findPowertrainCorrection("2022", "Jayco", "Embark", "39BH");
  assert.equal(emb22!.horsepower, 360);
  {
    const embScPin = findPowertrainCorrection("2012", "Jayco", "Embark Super C", "QX390");
    assert.equal(embScPin!.horsepower, 330);
    assert.equal(embScPin!.torqueLbFt, 1000);
  }

  const sen21 = findPowertrainCorrection("2021", "Jayco", "Seneca", "37HJ");
  assert.equal(sen21!.horsepower, 360);
  assert.match(sen21!.chassis || "", /S2RV/);
  assert.doesNotMatch(sen21!.chassis || "", /Plus/);
  const sen22 = findPowertrainCorrection("2022", "Jayco", "Seneca", "37RB");
  assert.match(sen22!.chassis || "", /S2RV/);
  assert.doesNotMatch(sen22!.chassis || "", /Plus/);
  const spr21 = findPowertrainCorrection("2021", "Jayco", "Seneca Prestige", "37K");
  assert.match(spr21!.chassis || "", /S2RV/);
  assert.doesNotMatch(spr21!.chassis || "", /Plus/);
  assert.equal(findPowertrainCorrection("2021", "Jayco", "Seneca XT", "32U"), null);
  assert.equal(findPowertrainCorrection("2022", "Jayco", "Seneca XT", "32U"), null);

  const gh21 = findPowertrainCorrection("2021", "Jayco", "Greyhawk", "27U");
  assert.equal(gh21!.horsepower, 350);
  assert.equal(gh21!.torqueLbFt, 468);
  assert.equal(gh21!.fuelType, "Gas");
  const ghp21 = findPowertrainCorrection("2021", "Jayco", "Greyhawk Prestige", "29MVP");
  assert.equal(ghp21!.horsepower, 350);
  assert.equal(ghp21!.torqueLbFt, 468);
  assert.equal(findPowertrainCorrection("2021", "Jayco", "Greyhawk XL", "32U"), null);
  const gh23 = findPowertrainCorrection("2023", "Jayco", "Greyhawk", "27U");
  assert.equal(gh23!.horsepower, 350);
  const gh24 = findPowertrainCorrection("2024", "Jayco", "Greyhawk", "30Z");
  assert.equal(gh24!.horsepower, 325);

  const rh21 = findPowertrainCorrection("2021", "Jayco", "Redhawk", "22J");
  assert.equal(rh21!.horsepower, 350);
  const rh22 = findPowertrainCorrection("2022", "Jayco", "Redhawk", "25R");
  assert.equal(rh22!.horsepower, 350);
  const rh23 = findPowertrainCorrection("2023", "Jayco", "Redhawk", "24B");
  assert.equal(rh23!.horsepower, 325);
  const rse21 = findPowertrainCorrection("2021", "Jayco", "Redhawk SE", "22A");
  assert.equal(rse21!.horsepower, 342);
  assert.equal(rse21!.torqueLbFt, 373);
  assert.match(rse21!.chassis || "", /Chevy 4500/);
  const rse22 = findPowertrainCorrection("2022", "Jayco", "Redhawk SE", "22C");
  assert.equal(rse22!.horsepower, 401);
  assert.equal(rse22!.torqueLbFt, 464);
  assert.match(rse22!.chassis || "", /Chevy 4500/);
  const rse23 = findPowertrainCorrection("2023", "Jayco", "Redhawk SE", "22AF");
  assert.equal(rse23!.horsepower, 0);

  const mb21 = findPowertrainCorrection("2021", "Jayco", "Melbourne", "24K");
  assert.equal(mb21!.horsepower, 188);
  assert.equal(mb21!.torqueLbFt, 325);
  const mb22 = findPowertrainCorrection("2022", "Jayco", "Melbourne", "24R");
  assert.equal(mb22!.horsepower, 188);
  const mp21 = findPowertrainCorrection("2021", "Jayco", "Melbourne Prestige", "24KP");
  assert.equal(mp21!.horsepower, 188);
  const mp22 = findPowertrainCorrection("2022", "Jayco", "Melbourne Prestige", "24NP");
  assert.equal(mp22!.horsepower, 188);

  assert.equal(findPowertrainCorrection("2021", "Jayco", "Swift", "20A"), null);
  assert.equal(findPowertrainCorrection("2022", "Jayco", "Swift", "20T"), null);
  const sw23 = findPowertrainCorrection("2023", "Jayco", "Swift", "20D");
  assert.equal(sw23!.horsepower, 276);
  assert.equal(findPowertrainCorrection("2021", "Jayco", "Terrain", "19Y"), null);
  const te22 = findPowertrainCorrection("2022", "Jayco", "Terrain", "19Y");
  assert.equal(te22!.horsepower, 188);
  assert.equal(te22!.fuelType, "Diesel");
  assert.equal(findPowertrainCorrection("2021", "Jayco", "Comet", "18C"), null);
  assert.equal(findPowertrainCorrection("2022", "Jayco", "Comet", "18C"), null);
  assert.equal(findPowertrainCorrection("2021", "Jayco", "Solstice", "21B"), null);
  assert.equal(findPowertrainCorrection("2022", "Jayco", "Solstice", "21B"), null);
  assert.equal(findPowertrainCorrection("2021", "Jayco", "Granite Ridge", "22T"), null);
});

test("Jayco 2019–2020 OEM year-first floorplans + powertrain pins", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Embark?.yearEnd, 2023);
  assert.equal(jc.Embark?.years?.includes(2019), false);
  assert.equal(jc.Embark?.years?.includes(2020), false);
  assert.equal(jc.Embark?.years?.includes(2021), true);
  assert.equal(jc.Embark?.type, "Class A Diesel");
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.yearStart, 2009);
  assert.equal(jc["Embark Super C"]?.yearEnd, 2012);
  assert.equal(jc["Embark Super C"]?.years?.includes(2019), false);
  assert.equal(jc["Embark Super C"]?.years?.includes(2020), false);

  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2019), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2020), true);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2021), false);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);
  assert.equal(jc["Alante SE"]?.years?.includes(2019), false);
  assert.equal(jc["Alante SE"]?.years?.includes(2020), false);

  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2019), false);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2020), false);
  assert.equal(jc["Seneca XT"]?.yearStart, 2023);
  assert.equal(jc["Seneca XT"]?.years?.includes(2019), false);
  assert.equal(jc["Greyhawk XL"]?.yearStart, 2024);
  assert.equal(jc["Greyhawk XL"]?.years?.includes(2019), false);
  assert.equal(jc["Greyhawk Prestige"]?.yearStart, 2018);
  assert.equal(jc["Greyhawk Prestige"]?.yearEnd, 2022);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2019), true);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2020), true);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2019), true);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2020), true);
  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Swift?.years?.includes(2019), false);
  assert.equal(jc.Swift?.years?.includes(2020), false);
  assert.equal(jc.Terrain?.yearStart, 2022);
  assert.equal(jc.Terrain?.years?.includes(2019), false);
  assert.equal(jc.Terrain?.years?.includes(2020), false);
  assert.equal(jc.Comet?.yearStart, 2024);
  assert.equal(jc.Solstice?.yearStart, 2023);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr = jayco.slice(jayco.indexOf("    Precept: {"), jayco.indexOf("    Alante: {"));
  assert.match(pr, /"2019": \["29V", "31UL", "33U", "34G", "36A"\]/);
  assert.match(pr, /"2020": \["29V", "31UL", "34B", "34G", "36A"\]/);
  assert.doesNotMatch(pr, /"2019": .*"34B"/);
  assert.doesNotMatch(pr, /"2020": .*"33U"/);
  assert.doesNotMatch(pr, /"2019": .*"36C"/);
  assert.doesNotMatch(pr, /"2020": .*"36C"/);
  assert.doesNotMatch(pr, /"2018": \["29V", "31UL", "33U", "34G", "36A"\]/);

  const al = jayco.slice(jayco.indexOf("    Alante: {"), jayco.indexOf("    Embark: {"));
  assert.match(al, /"2019": \["26X", "29F", "29S", "31R", "31V"\]/);
  assert.match(al, /"2020": \["26X", "27A", "29F", "29S", "31V"\]/);
  assert.doesNotMatch(al, /"2019": .*"27A"/);
  assert.doesNotMatch(al, /"2020": .*"31R"/);

  const em = jayco.slice(jayco.indexOf("    Embark: {"), jayco.indexOf("    Seneca: {"));
  assert.doesNotMatch(em, /"2019":/);
  assert.doesNotMatch(em, /"2020":/);
  assert.match(em, /"2021": \["37K", "39BH", "39T2"\]/);
  assert.doesNotMatch(em, /"2018": .*"39BH"/);

  const se = jayco.slice(jayco.indexOf("    Seneca: {"), jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2019": \["37FS", "37HJ", "37K", "37RB", "37TS"\]/);
  assert.match(se, /"2020": \["37HJ", "37K", "37L", "37RB", "37TS"\]/);
  assert.doesNotMatch(se, /"2019": .*"37L"/);
  assert.doesNotMatch(se, /"2020": .*"37FS"/);
  assert.doesNotMatch(se, /"2020": .*"37M"/);

  const gh = jayco.slice(jayco.indexOf("    Greyhawk: {"), jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2019": \["26Y", "29MV", "30X", "30Z", "31F", "31FS"\]/);
  assert.match(gh, /"2020": \["27U", "29MV", "30X", "30Z", "31F"\]/);
  assert.doesNotMatch(gh, /"2019": .*"27U"/);
  assert.doesNotMatch(gh, /"2020": .*"26Y"/);
  assert.doesNotMatch(gh, /"2020": .*"31FS"/);

  const ghp = jayco.slice(jayco.indexOf('    "Greyhawk Prestige": {'), jayco.indexOf("    Redhawk: {"));
  assert.match(ghp, /"2019": \["29MVP", "30XP", "31FP", "31FSP"\]/);
  assert.match(ghp, /"2020": \["29MVP", "30XP", "31FP"\]/);
  assert.match(ghp, /yearStart:\s*2018/);
  assert.match(ghp, /yearEnd:\s*2022/);
  assert.doesNotMatch(ghp, /"2020": .*"31FSP"/);

  const rh = jayco.slice(jayco.indexOf("    Redhawk: {"), jayco.indexOf("    Melbourne: {"));
  assert.match(rh, /"2019": \["22J", "24B", "25R", "26XD", "29XK", "31F", "31XL"\]/);
  assert.match(rh, /"2020": \["22J", "24B", "25R", "26XD", "29XK", "31F"\]/);
  assert.doesNotMatch(rh, /"2019": .*"26M"/);
  assert.doesNotMatch(rh, /"2020": .*"31XL"/);
  assert.doesNotMatch(rh, /"2020": .*"26M"/);

  const mb = jayco.slice(jayco.indexOf("    Melbourne: {"), jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2019": \["24K", "24L"\]/);
  assert.match(mb, /"2020": \["24K", "24L"\]/);
  assert.doesNotMatch(mb, /"2019": .*"24T"/);
  assert.doesNotMatch(mb, /"2020": .*"24N"/);
  assert.doesNotMatch(mb, /"2020": .*"24T"/);

  const mp = jayco.slice(jayco.indexOf('    "Melbourne Prestige": {'), jayco.indexOf('    "Alante SE"'));
  assert.match(mp, /"2019": \["24AP", "24KP", "24LP"\]/);
  assert.match(mp, /"2020": \["24AP", "24KP", "24LP", "24TP"\]/);
  assert.doesNotMatch(mp, /"2019": .*"24TP"/);
  assert.doesNotMatch(mp, /"2020": .*"24NP"/);

  const pp = jayco.slice(jayco.indexOf('    "Precept Prestige": {'), jayco.indexOf('    "Embark Super C"'));
  assert.match(pp, /"2019": \["36B", "36H", "36U"\]/);
  assert.match(pp, /"2020": \["36B", "36H", "36U"\]/);
  assert.doesNotMatch(pp, /"2021":/);
  assert.match(pp, /yearStart:\s*2019/);

  const ase = jayco.slice(jayco.indexOf('    "Alante SE": {'), jayco.indexOf('    "Precept Prestige"'));
  assert.doesNotMatch(ase, /"2019":/);
  assert.doesNotMatch(ase, /"2020":/);

  const spr = jayco.slice(jayco.indexOf('    "Seneca Prestige": {'), jayco.indexOf("    Comet: {"));
  assert.doesNotMatch(spr, /"2019":/);
  assert.doesNotMatch(spr, /"2020":/);

  const rse = jayco.slice(jayco.indexOf('    "Redhawk SE": {'), jayco.indexOf('    "Greyhawk XL"'));
  assert.match(rse, /"2019": \["22A", "22C", "27N"\]/);
  assert.match(rse, /"2020": \["22A", "22C", "27N"\]/);
  assert.doesNotMatch(rse, /"2019": .*"22AF"/);
  assert.doesNotMatch(rse, /"2020": .*"22CF"/);
  assert.match(rse, /yearStart:\s*2019/);

  const sw = jayco.slice(jayco.indexOf("    Swift: {"), jayco.indexOf("    Solstice: {"));
  assert.doesNotMatch(sw, /"2019":/);
  assert.doesNotMatch(sw, /"2020":/);

  const so = jayco.slice(jayco.indexOf("    Solstice: {"), jayco.indexOf("    Terrain: {"));
  assert.doesNotMatch(so, /"2019":/);
  assert.doesNotMatch(so, /"2020":/);

  const co = jayco.slice(jayco.indexOf("    Comet: {"), jayco.indexOf("    Swift: {"));
  assert.doesNotMatch(co, /"2019":/);
  assert.doesNotMatch(co, /"2020":/);

  const te = jayco.slice(jayco.indexOf("    Terrain: {"), jayco.indexOf('    "Jay Feather"'));
  assert.doesNotMatch(te, /"2019":/);
  assert.doesNotMatch(te, /"2020":/);

  const gxl = jayco.slice(jayco.indexOf('    "Greyhawk XL": {'), jayco.indexOf('    "Granite Ridge"'));
  assert.doesNotMatch(gxl, /"2019":/);
  assert.doesNotMatch(gxl, /"2020":/);

  const sxt = jayco.slice(jayco.indexOf('    "Seneca XT": {'), jayco.indexOf('    "Seneca Prestige"'));
  assert.doesNotMatch(sxt, /"2019":/);
  assert.doesNotMatch(sxt, /"2020":/);

  const gr = jayco.slice(jayco.indexOf('    "Granite Ridge": {'), jayco.indexOf('    "Seneca XT"'));
  assert.doesNotMatch(gr, /"2019":/);
  assert.doesNotMatch(gr, /"2020":/);

  assert.equal(findPowertrainCorrection("2019", "Jayco", "Precept", "29V"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Precept", "34B"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Precept Prestige", "36B"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Precept Prestige", "36U"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Alante", "26X"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Alante", "27A"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Embark", "37K"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Embark", "39BH"), null);
  {
    const embScPin = findPowertrainCorrection("2012", "Jayco", "Embark Super C", "QX390");
    assert.equal(embScPin!.horsepower, 330);
    assert.equal(embScPin!.torqueLbFt, 1000);
  }

  const sen19 = findPowertrainCorrection("2019", "Jayco", "Seneca", "37FS");
  assert.equal(sen19!.horsepower, 360);
  assert.equal(sen19!.torqueLbFt, 800);
  assert.match(sen19!.chassis || "", /S2RV/);
  assert.doesNotMatch(sen19!.chassis || "", /Plus/);
  const sen20 = findPowertrainCorrection("2020", "Jayco", "Seneca", "37L");
  assert.match(sen20!.chassis || "", /S2RV/);
  assert.doesNotMatch(sen20!.chassis || "", /Plus/);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Seneca XT", "32U"), null);

  assert.equal(findPowertrainCorrection("2019", "Jayco", "Greyhawk", "26Y"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Greyhawk", "27U"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Greyhawk Prestige", "29MVP"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Greyhawk Prestige", "31FP"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Greyhawk XL", "32U"), null);

  assert.equal(findPowertrainCorrection("2019", "Jayco", "Redhawk", "24B"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Redhawk", "25R"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Redhawk SE", "22A"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Redhawk SE", "27N"), null);

  assert.equal(findPowertrainCorrection("2019", "Jayco", "Melbourne", "24K"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Melbourne", "24L"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Melbourne Prestige", "24AP"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Melbourne Prestige", "24TP"), null);

  assert.equal(findPowertrainCorrection("2019", "Jayco", "Swift", "20A"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Terrain", "19Y"), null);
  assert.equal(findPowertrainCorrection("2019", "Jayco", "Comet", "18C"), null);
  assert.equal(findPowertrainCorrection("2020", "Jayco", "Solstice", "21B"), null);
});

test("Jayco 2017–2018 OEM year-first floorplans + powertrain pins", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Embark?.yearEnd, 2023);
  assert.equal(jc.Embark?.years?.includes(2017), false);
  assert.equal(jc.Embark?.years?.includes(2018), false);
  assert.equal(jc.Embark?.years?.includes(2021), true);
  assert.equal(jc.Embark?.type, "Class A Diesel");
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.yearStart, 2009);
  assert.equal(jc["Embark Super C"]?.yearEnd, 2012);
  assert.equal(jc["Embark Super C"]?.years?.includes(2017), false);
  assert.equal(jc["Embark Super C"]?.years?.includes(2018), false);

  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2017), false);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2018), false);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);
  assert.equal(jc["Alante SE"]?.years?.includes(2017), false);
  assert.equal(jc["Alante SE"]?.years?.includes(2018), false);

  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2017), false);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2018), false);
  assert.equal(jc["Seneca XT"]?.yearStart, 2023);
  assert.equal(jc["Greyhawk XL"]?.yearStart, 2024);
  assert.equal(jc["Greyhawk Prestige"]?.yearStart, 2018);
  assert.equal(jc["Greyhawk Prestige"]?.yearEnd, 2022);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2017), false);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2018), true);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2017), false);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2018), false);
  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Swift?.years?.includes(2017), false);
  assert.equal(jc.Swift?.years?.includes(2018), false);
  assert.equal(jc.Terrain?.yearStart, 2022);
  assert.equal(jc.Comet?.yearStart, 2024);
  assert.equal(jc.Solstice?.yearStart, 2023);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr = jayco.slice(jayco.indexOf("    Precept: {"), jayco.indexOf("    Alante: {"));
  assert.match(pr, /"2017": \["31UL", "35S", "35UP", "36T"\]/);
  assert.match(pr, /"2018": \["29V", "31UL", "33U", "35S", "36T"\]/);
  assert.doesNotMatch(pr, /"2017": .*"29V"/);
  assert.doesNotMatch(pr, /"2017": .*"33U"/);
  assert.doesNotMatch(pr, /"2018": .*"35UP"/);
  assert.doesNotMatch(pr, /"2018": .*"34G"/);
  assert.doesNotMatch(pr, /"2018": .*"36A"/);
  assert.match(pr, /"2016": \["29UR", "31UL", "35S", "35UN", "35UP"\]/);

  const al = jayco.slice(jayco.indexOf("    Alante: {"), jayco.indexOf("    Embark: {"));
  assert.match(al, /"2017": \["26X", "26Y", "31P", "31V", "32N"\]/);
  assert.match(al, /"2018": \["26X", "29S", "31P", "31R", "31V"\]/);
  assert.doesNotMatch(al, /"2017": .*"29S"/);
  assert.doesNotMatch(al, /"2017": .*"31R"/);
  assert.doesNotMatch(al, /"2018": .*"26Y"/);
  assert.doesNotMatch(al, /"2018": .*"32N"/);
  assert.doesNotMatch(al, /"2018": .*"27A"/);
  assert.doesNotMatch(al, /"2018": .*"29F"/);

  const em = jayco.slice(jayco.indexOf("    Embark: {"), jayco.indexOf("    Seneca: {"));
  assert.doesNotMatch(em, /"2017":/);
  assert.doesNotMatch(em, /"2018":/);
  assert.match(em, /"2021": \["37K", "39BH", "39T2"\]/);

  const se = jayco.slice(jayco.indexOf("    Seneca: {"), jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2017": \["36FK", "37FS", "37HJ", "37RB", "37TS"\]/);
  assert.match(se, /"2018": \["37FS", "37HJ", "37K", "37RB", "37TS"\]/);
  assert.doesNotMatch(se, /"2017": .*"37K"/);
  assert.doesNotMatch(se, /"2018": .*"36FK"/);
  assert.doesNotMatch(se, /"2018": .*"37L"/);

  const gh = jayco.slice(jayco.indexOf("    Greyhawk: {"), jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2017": \["29ME", "29MV", "29W", "31DS", "31FK", "31FS"\]/);
  assert.match(gh, /"2018": \["26Y", "29ME", "29MV", "29W", "30X", "31DS", "31FS"\]/);
  assert.doesNotMatch(gh, /"2017": .*"26Y"/);
  assert.doesNotMatch(gh, /"2017": .*"30X"/);
  assert.doesNotMatch(gh, /"2018": .*"31FK"/);
  assert.doesNotMatch(gh, /"2018": .*"30Z"/);
  assert.match(gh, /"2016": \["29KS", "29ME", "29MV", "31DS", "31FK", "31FS"\]/);

  const ghp = jayco.slice(jayco.indexOf('    "Greyhawk Prestige": {'), jayco.indexOf("    Redhawk: {"));
  assert.match(ghp, /"2018": \["29MVP", "30XP", "31FSP"\]/);
  assert.match(ghp, /yearStart:\s*2018/);
  assert.match(ghp, /yearEnd:\s*2022/);
  assert.doesNotMatch(ghp, /"2017":/);
  assert.doesNotMatch(ghp, /"2018": .*"31FP"/);

  const rh = jayco.slice(jayco.indexOf("    Redhawk: {"), jayco.indexOf("    Melbourne: {"));
  assert.match(rh, /"2017": \["23X2", "23XM", "26X1", "26XD", "29XK", "31XL"\]/);
  assert.match(rh, /"2018": \["22J", "25R", "26X1", "26XD", "29XK", "31XL"\]/);
  assert.doesNotMatch(rh, /"2017": .*"22J"/);
  assert.doesNotMatch(rh, /"2018": .*"23X2"/);
  assert.doesNotMatch(rh, /"2018": .*"23XM"/);
  assert.doesNotMatch(rh, /"2018": .*"24B"/);
  assert.doesNotMatch(rh, /"2018": .*"26M"/);

  const mb = jayco.slice(jayco.indexOf("    Melbourne: {"), jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2017": \["24K", "24L", "24M"\]/);
  assert.match(mb, /"2018": \["24K", "24L"\]/);
  assert.doesNotMatch(mb, /"2018": .*"24M"/);
  assert.doesNotMatch(mb, /"2018": .*"24T"/);
  assert.doesNotMatch(mb, /"2016": .*"24M"/);

  const mp = jayco.slice(jayco.indexOf('    "Melbourne Prestige": {'), jayco.indexOf('    "Alante SE"'));
  assert.match(mp, /"2018": \["24KP", "24LP"\]/);
  assert.doesNotMatch(mp, /"2017":/);
  assert.doesNotMatch(mp, /"2018": .*"24AP"/);
  assert.doesNotMatch(mp, /"2018": .*"24TP"/);

  const pp = jayco.slice(jayco.indexOf('    "Precept Prestige": {'), jayco.indexOf('    "Embark Super C"'));
  assert.doesNotMatch(pp, /"2017":/);
  assert.doesNotMatch(pp, /"2018":/);
  assert.match(pp, /yearStart:\s*2019/);

  const ase = jayco.slice(jayco.indexOf('    "Alante SE": {'), jayco.indexOf('    "Precept Prestige"'));
  assert.doesNotMatch(ase, /"2017":/);
  assert.doesNotMatch(ase, /"2018":/);

  const spr = jayco.slice(jayco.indexOf('    "Seneca Prestige": {'), jayco.indexOf("    Comet: {"));
  assert.doesNotMatch(spr, /"2017":/);
  assert.doesNotMatch(spr, /"2018":/);

  const rse = jayco.slice(jayco.indexOf('    "Redhawk SE": {'), jayco.indexOf('    "Greyhawk XL"'));
  assert.doesNotMatch(rse, /"2017":/);
  assert.doesNotMatch(rse, /"2018":/);
  assert.match(rse, /yearStart:\s*2019/);

  const sw = jayco.slice(jayco.indexOf("    Swift: {"), jayco.indexOf("    Solstice: {"));
  assert.doesNotMatch(sw, /"2017":/);
  assert.doesNotMatch(sw, /"2018":/);

  const so = jayco.slice(jayco.indexOf("    Solstice: {"), jayco.indexOf("    Terrain: {"));
  assert.doesNotMatch(so, /"2017":/);
  assert.doesNotMatch(so, /"2018":/);

  const co = jayco.slice(jayco.indexOf("    Comet: {"), jayco.indexOf("    Swift: {"));
  assert.doesNotMatch(co, /"2017":/);
  assert.doesNotMatch(co, /"2018":/);

  const te = jayco.slice(jayco.indexOf("    Terrain: {"), jayco.indexOf('    "Jay Feather"'));
  assert.doesNotMatch(te, /"2017":/);
  assert.doesNotMatch(te, /"2018":/);

  const gxl = jayco.slice(jayco.indexOf('    "Greyhawk XL": {'), jayco.indexOf('    "Granite Ridge"'));
  assert.doesNotMatch(gxl, /"2017":/);
  assert.doesNotMatch(gxl, /"2018":/);

  const sxt = jayco.slice(jayco.indexOf('    "Seneca XT": {'), jayco.indexOf('    "Seneca Prestige"'));
  assert.doesNotMatch(sxt, /"2017":/);
  assert.doesNotMatch(sxt, /"2018":/);

  const gr = jayco.slice(jayco.indexOf('    "Granite Ridge": {'), jayco.indexOf('    "Seneca XT"'));
  assert.doesNotMatch(gr, /"2017":/);
  assert.doesNotMatch(gr, /"2018":/);

  const pr17 = findPowertrainCorrection("2017", "Jayco", "Precept", "31UL");
  assert.equal(pr17!.horsepower, 320);
  assert.equal(pr17!.torqueLbFt, 460);
  assert.match(pr17!.engine, /6\.8|Triton/);
  const pr18 = findPowertrainCorrection("2018", "Jayco", "Precept", "29V");
  assert.equal(pr18!.horsepower, 320);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Precept Prestige", "36B"), null);
  assert.equal(findPowertrainCorrection("2018", "Jayco", "Precept Prestige", "36U"), null);

  const al17 = findPowertrainCorrection("2017", "Jayco", "Alante", "26X");
  assert.equal(al17!.horsepower, 320);
  assert.equal(al17!.torqueLbFt, 460);
  const al18 = findPowertrainCorrection("2018", "Jayco", "Alante", "31R");
  assert.equal(al18!.horsepower, 320);

  assert.equal(findPowertrainCorrection("2017", "Jayco", "Embark", "37K"), null);
  assert.equal(findPowertrainCorrection("2018", "Jayco", "Embark", "38N"), null);
  {
    const embScPin = findPowertrainCorrection("2012", "Jayco", "Embark Super C", "QX390");
    assert.equal(embScPin!.horsepower, 330);
    assert.equal(embScPin!.torqueLbFt, 1000);
  }

  const sen17 = findPowertrainCorrection("2017", "Jayco", "Seneca", "37HJ");
  assert.equal(sen17!.horsepower, 340);
  assert.equal(sen17!.torqueLbFt, undefined);
  assert.match(sen17!.chassis || "", /M2/);
  assert.doesNotMatch(sen17!.chassis || "", /S2RV/);
  const sen18 = findPowertrainCorrection("2018", "Jayco", "Seneca", "37K");
  assert.equal(sen18!.horsepower, 360);
  assert.equal(sen18!.torqueLbFt, 800);
  assert.match(sen18!.chassis || "", /S2RV/);
  assert.doesNotMatch(sen18!.chassis || "", /Plus/);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2018", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Seneca XT", "32U"), null);

  const gh17 = findPowertrainCorrection("2017", "Jayco", "Greyhawk", "29MV");
  assert.equal(gh17!.horsepower, 305);
  assert.equal(gh17!.torqueLbFt, 420);
  const gh18 = findPowertrainCorrection("2018", "Jayco", "Greyhawk", "26Y");
  assert.equal(gh18!.horsepower, 305);
  const ghp18 = findPowertrainCorrection("2018", "Jayco", "Greyhawk Prestige", "29MVP");
  assert.equal(ghp18!.horsepower, 305);
  assert.equal(ghp18!.torqueLbFt, 420);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Greyhawk Prestige", "29MVP"), null);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Greyhawk XL", "32U"), null);

  const rh17 = findPowertrainCorrection("2017", "Jayco", "Redhawk", "26XD");
  assert.equal(rh17!.horsepower, 0);
  assert.match(rh17!.engine, /Chevy|342/);
  assert.match(rh17!.engine, /305|Ford/);
  const rh18 = findPowertrainCorrection("2018", "Jayco", "Redhawk", "22J");
  assert.equal(rh18!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Redhawk SE", "22A"), null);
  assert.equal(findPowertrainCorrection("2018", "Jayco", "Redhawk SE", "27N"), null);

  const mb17 = findPowertrainCorrection("2017", "Jayco", "Melbourne", "24M");
  assert.equal(mb17!.horsepower, 188);
  assert.equal(mb17!.torqueLbFt, 325);
  const mb18 = findPowertrainCorrection("2018", "Jayco", "Melbourne", "24L");
  assert.equal(mb18!.horsepower, 188);
  const mp18 = findPowertrainCorrection("2018", "Jayco", "Melbourne Prestige", "24KP");
  assert.equal(mp18!.horsepower, 188);
  assert.equal(mp18!.torqueLbFt, 325);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Melbourne Prestige", "24KP"), null);

  assert.equal(findPowertrainCorrection("2017", "Jayco", "Swift", "20A"), null);
  assert.equal(findPowertrainCorrection("2018", "Jayco", "Terrain", "19Y"), null);
  assert.equal(findPowertrainCorrection("2017", "Jayco", "Comet", "18C"), null);
  assert.equal(findPowertrainCorrection("2018", "Jayco", "Solstice", "21B"), null);
});

test("Jayco 2015–2016 OEM year-first floorplans + powertrain pins", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Precept?.yearStart, 2014);
  assert.equal(jc.Precept?.years?.includes(2015), true);
  assert.equal(jc.Precept?.years?.includes(2016), true);
  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2015), false);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2016), false);

  assert.equal(jc.Alante?.yearStart, 2016);
  assert.equal(jc.Alante?.years?.includes(2015), false);
  assert.equal(jc.Alante?.years?.includes(2016), true);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);
  assert.equal(jc["Alante SE"]?.years?.includes(2015), false);
  assert.equal(jc["Alante SE"]?.years?.includes(2016), false);

  assert.equal(jc.Embark?.yearStart, 2021);
  assert.equal(jc.Embark?.yearEnd, 2023);
  assert.equal(jc.Embark?.years?.includes(2015), false);
  assert.equal(jc.Embark?.years?.includes(2016), false);
  assert.equal(jc.Embark?.years?.includes(2021), true);
  assert.equal(jc.Embark?.type, "Class A Diesel");
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.yearStart, 2009);
  assert.equal(jc["Embark Super C"]?.yearEnd, 2012);
  assert.equal(jc["Embark Super C"]?.years?.includes(2015), false);
  assert.equal(jc["Embark Super C"]?.years?.includes(2016), false);

  assert.equal(jc.Seneca?.years?.includes(2015), true);
  assert.equal(jc.Seneca?.years?.includes(2016), true);
  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2015), false);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2016), false);
  assert.equal(jc["Seneca XT"]?.yearStart, 2023);

  assert.equal(jc["Greyhawk Prestige"]?.yearStart, 2018);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2015), false);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2016), false);
  assert.equal(jc["Greyhawk XL"]?.yearStart, 2024);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2015), false);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2016), false);

  assert.equal(jc["Melbourne Prestige"]?.years?.includes(2015), false);
  assert.equal(jc["Melbourne Prestige"]?.years?.includes(2016), false);
  assert.equal(jc["Melbourne Prestige"]?.years?.includes(2018), true);

  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Swift?.years?.includes(2015), false);
  assert.equal(jc.Swift?.years?.includes(2016), false);
  assert.equal(jc.Terrain?.yearStart, 2022);
  assert.equal(jc.Comet?.yearStart, 2024);
  assert.equal(jc.Solstice?.yearStart, 2023);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr = jayco.slice(jayco.indexOf("    Precept: {"), jayco.indexOf("    Alante: {"));
  assert.match(pr, /"2015": \["29UM", "29UR", "31UL", "35UN", "35UP"\]/);
  assert.match(pr, /"2016": \["29UR", "31UL", "35S", "35UN", "35UP"\]/);
  assert.doesNotMatch(pr.slice(pr.indexOf('"2015"'), pr.indexOf('"2016"')), /"35S"/);
  assert.doesNotMatch(pr, /"2015": .*"36T"/);
  assert.doesNotMatch(pr, /"2016": .*"29UM"/);
  assert.doesNotMatch(pr, /"2016": .*"36T"/);
  assert.doesNotMatch(pr, /"2016": .*"29V"/);
  assert.match(pr, /"2017": \["31UL", "35S", "35UP", "36T"\]/);

  const al = jayco.slice(jayco.indexOf("    Alante: {"), jayco.indexOf("    Embark: {"));
  assert.doesNotMatch(al, /"2015":/);
  assert.match(al, /"2016": \["26X", "26Y", "31L", "31V"\]/);
  assert.match(al, /yearStart:\s*2016/);
  assert.doesNotMatch(al, /"2016": .*"29F"/);
  assert.doesNotMatch(al, /"2016": .*"31P"/);
  assert.doesNotMatch(al, /"2016": .*"32N"/);
  assert.doesNotMatch(al, /"2016": .*"27A"/);
  assert.match(al, /"2017": \["26X", "26Y", "31P", "31V", "32N"\]/);

  const em = jayco.slice(jayco.indexOf("    Embark: {"), jayco.indexOf("    Seneca: {"));
  assert.doesNotMatch(em, /"2015":/);
  assert.doesNotMatch(em, /"2016":/);
  assert.match(em, /yearStart:\s*2021/);
  assert.match(em, /"2021": \["37K", "39BH", "39T2"\]/);

  const se = jayco.slice(jayco.indexOf("    Seneca: {"), jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2015": \["36FK", "37FS", "37HJ", "37RB", "37TS"\]/);
  assert.match(se, /"2016": \["36FK", "37FS", "37HJ", "37RB", "37TS"\]/);
  assert.doesNotMatch(se, /"2015": .*"37K"/);
  assert.doesNotMatch(se, /"2016": .*"37K"/);

  const gh = jayco.slice(jayco.indexOf("    Greyhawk: {"), jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2015": \["29KS", "29ME", "29MV", "31DS", "31FK", "31FS"\]/);
  assert.match(gh, /"2016": \["29KS", "29ME", "29MV", "31DS", "31FK", "31FS"\]/);
  assert.doesNotMatch(gh, /"2015": .*"29W"/);
  assert.doesNotMatch(gh, /"2016": .*"29W"/);
  assert.doesNotMatch(gh, /"2015": .*"30X"/);
  assert.doesNotMatch(gh, /"2016": .*"26Y"/);
  assert.match(gh, /"2017": \["29ME", "29MV", "29W", "31DS", "31FK", "31FS"\]/);

  const ghp = jayco.slice(jayco.indexOf('    "Greyhawk Prestige": {'), jayco.indexOf("    Redhawk: {"));
  assert.doesNotMatch(ghp, /"2015":/);
  assert.doesNotMatch(ghp, /"2016":/);
  assert.match(ghp, /yearStart:\s*2018/);

  const rh = jayco.slice(jayco.indexOf("    Redhawk: {"), jayco.indexOf("    Melbourne: {"));
  assert.match(rh, /"2015": \["23XM", "26XD", "29XK", "31XL"\]/);
  assert.match(rh, /"2016": \["23X2", "23XM", "26X1", "26XD", "29XK", "31XL"\]/);
  assert.doesNotMatch(rh, /"2015": .*"22J"/);
  assert.doesNotMatch(rh, /"2015": .*"23X2"/);
  assert.doesNotMatch(rh, /"2016": .*"22J"/);
  assert.doesNotMatch(rh, /"2016": .*"25R"/);

  const mb = jayco.slice(jayco.indexOf("    Melbourne: {"), jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2015": \["29D"\]/);
  assert.match(mb, /"2016": \["24K", "24L"\]/);
  assert.doesNotMatch(mb, /"2015": .*"24K"/);
  assert.doesNotMatch(mb, /"2016": .*"29D"/);
  assert.doesNotMatch(mb, /"2016": .*"24M"/);

  const mp = jayco.slice(jayco.indexOf('    "Melbourne Prestige": {'), jayco.indexOf('    "Alante SE"'));
  assert.doesNotMatch(mp, /"2015":/);
  assert.doesNotMatch(mp, /"2016":/);
  assert.match(mp, /"2018": \["24KP", "24LP"\]/);

  const pp = jayco.slice(jayco.indexOf('    "Precept Prestige": {'), jayco.indexOf('    "Embark Super C"'));
  assert.doesNotMatch(pp, /"2015":/);
  assert.doesNotMatch(pp, /"2016":/);
  assert.match(pp, /yearStart:\s*2019/);

  const spr = jayco.slice(jayco.indexOf('    "Seneca Prestige": {'), jayco.indexOf("    Comet: {"));
  assert.doesNotMatch(spr, /"2015":/);
  assert.doesNotMatch(spr, /"2016":/);

  const rse = jayco.slice(jayco.indexOf('    "Redhawk SE": {'), jayco.indexOf('    "Greyhawk XL"'));
  assert.doesNotMatch(rse, /"2015":/);
  assert.doesNotMatch(rse, /"2016":/);

  const sw = jayco.slice(jayco.indexOf("    Swift: {"), jayco.indexOf("    Solstice: {"));
  assert.doesNotMatch(sw, /"2015":/);
  assert.doesNotMatch(sw, /"2016":/);

  const so = jayco.slice(jayco.indexOf("    Solstice: {"), jayco.indexOf("    Terrain: {"));
  assert.doesNotMatch(so, /"2015":/);
  assert.doesNotMatch(so, /"2016":/);

  const co = jayco.slice(jayco.indexOf("    Comet: {"), jayco.indexOf("    Swift: {"));
  assert.doesNotMatch(co, /"2015":/);
  assert.doesNotMatch(co, /"2016":/);

  const te = jayco.slice(jayco.indexOf("    Terrain: {"), jayco.indexOf('    "Jay Feather"'));
  assert.doesNotMatch(te, /"2015":/);
  assert.doesNotMatch(te, /"2016":/);

  const gxl = jayco.slice(jayco.indexOf('    "Greyhawk XL": {'), jayco.indexOf('    "Granite Ridge"'));
  assert.doesNotMatch(gxl, /"2015":/);
  assert.doesNotMatch(gxl, /"2016":/);

  const sxt = jayco.slice(jayco.indexOf('    "Seneca XT": {'), jayco.indexOf('    "Seneca Prestige"'));
  assert.doesNotMatch(sxt, /"2015":/);
  assert.doesNotMatch(sxt, /"2016":/);

  const gr = jayco.slice(jayco.indexOf('    "Granite Ridge": {'), jayco.indexOf('    "Seneca XT"'));
  assert.doesNotMatch(gr, /"2015":/);
  assert.doesNotMatch(gr, /"2016":/);

  const pr15 = findPowertrainCorrection("2015", "Jayco", "Precept", "31UL");
  assert.equal(pr15!.horsepower, 362);
  assert.equal(pr15!.torqueLbFt, 457);
  assert.match(pr15!.engine, /6\.8|Triton/);
  const pr16 = findPowertrainCorrection("2016", "Jayco", "Precept", "35S");
  assert.equal(pr16!.horsepower, 320);
  assert.equal(pr16!.torqueLbFt, 460);
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Precept Prestige", "36B"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Precept Prestige", "36U"), null);

  assert.equal(findPowertrainCorrection("2015", "Jayco", "Alante", "26X"), null);
  const al16 = findPowertrainCorrection("2016", "Jayco", "Alante", "26Y");
  assert.equal(al16!.horsepower, 362);
  assert.equal(al16!.torqueLbFt, 457);

  assert.equal(findPowertrainCorrection("2015", "Jayco", "Embark", "37K"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Embark", "38N"), null);
  {
    const embScPin = findPowertrainCorrection("2012", "Jayco", "Embark Super C", "QX390");
    assert.equal(embScPin!.horsepower, 330);
    assert.equal(embScPin!.torqueLbFt, 1000);
  }

  const sen15 = findPowertrainCorrection("2015", "Jayco", "Seneca", "37HJ");
  assert.equal(sen15!.horsepower, 340);
  assert.equal(sen15!.torqueLbFt, 700);
  assert.match(sen15!.chassis || "", /M2/);
  const sen16 = findPowertrainCorrection("2016", "Jayco", "Seneca", "36FK");
  assert.equal(sen16!.horsepower, 340);
  assert.equal(sen16!.torqueLbFt, undefined);
  assert.match(sen16!.chassis || "", /M2/);
  assert.doesNotMatch(sen16!.chassis || "", /S2RV/);
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Seneca XT", "32U"), null);

  const gh15 = findPowertrainCorrection("2015", "Jayco", "Greyhawk", "29MV");
  assert.equal(gh15!.horsepower, 305);
  assert.equal(gh15!.torqueLbFt, 420);
  const gh16 = findPowertrainCorrection("2016", "Jayco", "Greyhawk", "29KS");
  assert.equal(gh16!.horsepower, 305);
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Greyhawk Prestige", "29MVP"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Greyhawk Prestige", "29MVP"), null);
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Greyhawk XL", "32U"), null);

  const rh15 = findPowertrainCorrection("2015", "Jayco", "Redhawk", "26XD");
  assert.equal(rh15!.horsepower, 305);
  assert.equal(rh15!.torqueLbFt, 420);
  assert.doesNotMatch(rh15!.engine, /Chevy|342/);
  const rh16 = findPowertrainCorrection("2016", "Jayco", "Redhawk", "23X2");
  assert.equal(rh16!.horsepower, 0);
  assert.match(rh16!.engine, /Chevy|342/);
  assert.match(rh16!.engine, /305|Ford/);
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Redhawk SE", "22A"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Redhawk SE", "27N"), null);

  const mb15 = findPowertrainCorrection("2015", "Jayco", "Melbourne", "29D");
  assert.equal(mb15!.horsepower, 305);
  assert.equal(mb15!.torqueLbFt, 420);
  assert.match(mb15!.engine, /Ford|Triton|6\.8/);
  assert.equal(mb15!.fuelType, "Gas");
  const mb16 = findPowertrainCorrection("2016", "Jayco", "Melbourne", "24K");
  assert.equal(mb16!.horsepower, 188);
  assert.equal(mb16!.torqueLbFt, 325);
  assert.match(mb16!.engine, /Mercedes|188/);
  assert.equal(mb16!.fuelType, "Diesel");
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Melbourne Prestige", "24KP"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Melbourne Prestige", "24LP"), null);

  assert.equal(findPowertrainCorrection("2015", "Jayco", "Swift", "20A"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Terrain", "19Y"), null);
  assert.equal(findPowertrainCorrection("2015", "Jayco", "Comet", "18C"), null);
  assert.equal(findPowertrainCorrection("2016", "Jayco", "Solstice", "21B"), null);
});

test("Jayco 2013–2014 OEM year-first floorplans + powertrain pins", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Precept?.yearStart, 2014);
  assert.equal(jc.Precept?.years?.includes(2013), false);
  assert.equal(jc.Precept?.years?.includes(2014), true);
  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2013), false);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2014), false);

  assert.equal(jc.Alante?.yearStart, 2016);
  assert.equal(jc.Alante?.years?.includes(2013), false);
  assert.equal(jc.Alante?.years?.includes(2014), false);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);

  assert.equal(jc.Embark?.yearStart, 2021);
  assert.equal(jc.Embark?.years?.includes(2013), false);
  assert.equal(jc.Embark?.years?.includes(2014), false);
  assert.equal(jc.Embark?.type, "Class A Diesel");
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.yearStart, 2009);
  assert.equal(jc["Embark Super C"]?.yearEnd, 2012);
  assert.equal(jc["Embark Super C"]?.years?.includes(2013), false);
  assert.equal(jc["Embark Super C"]?.years?.includes(2014), false);

  assert.equal(jc.Seneca?.yearStart, 2010);
  assert.equal(jc.Seneca?.years?.includes(2013), true);
  assert.equal(jc.Seneca?.years?.includes(2014), true);
  assert.equal(jc["Seneca Super C"]?.yearStart, 2010);
  assert.equal(jc["Seneca Super C"]?.years?.includes(2013), true);
  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2013), false);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2014), false);
  assert.equal(jc["Seneca XT"]?.yearStart, 2023);

  assert.equal(jc["Greyhawk Prestige"]?.yearStart, 2018);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2013), false);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2014), false);
  assert.equal(jc["Greyhawk XL"]?.yearStart, 2024);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2013), false);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2014), false);

  assert.equal(jc["Melbourne Prestige"]?.yearStart, 2018);
  assert.equal(jc["Melbourne Prestige"]?.years?.includes(2013), false);
  assert.equal(jc["Melbourne Prestige"]?.years?.includes(2014), false);
  assert.equal(jc["Melbourne Prestige"]?.years?.includes(2018), true);

  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Swift?.years?.includes(2013), false);
  assert.equal(jc.Swift?.years?.includes(2014), false);
  assert.equal(jc.Terrain?.yearStart, 2022);
  assert.equal(jc.Comet?.yearStart, 2024);
  assert.equal(jc.Solstice?.yearStart, 2023);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr = jayco.slice(jayco.indexOf("    Precept: {"), jayco.indexOf("    Alante: {"));
  assert.doesNotMatch(pr, /"2013":/);
  assert.match(pr, /"2014": \["29UM", "31UL"\]/);
  assert.doesNotMatch(pr, /"2014": .*"35S"/);
  assert.doesNotMatch(pr, /"2014": .*"36T"/);
  assert.doesNotMatch(pr, /"2014": .*"29UR"/);
  assert.match(pr, /"2015": \["29UM", "29UR", "31UL", "35UN", "35UP"\]/);

  const al = jayco.slice(jayco.indexOf("    Alante: {"), jayco.indexOf("    Embark: {"));
  assert.doesNotMatch(al, /"2013":/);
  assert.doesNotMatch(al, /"2014":/);
  assert.match(al, /yearStart:\s*2016/);

  const em = jayco.slice(jayco.indexOf("    Embark: {"), jayco.indexOf("    Seneca: {"));
  assert.doesNotMatch(em, /"2013":/);
  assert.doesNotMatch(em, /"2014":/);
  assert.match(em, /yearStart:\s*2021/);

  const se = jayco.slice(jayco.indexOf("    Seneca: {"), jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2013": \["36FK", "37FS", "37RB", "37TS"\]/);
  assert.match(se, /"2014": \["36FK", "37FS", "37RB", "37TS"\]/);
  assert.doesNotMatch(se, /"2013": .*"37HJ"/);
  assert.doesNotMatch(se, /"2014": .*"37HJ"/);
  assert.match(se, /"2015": \["36FK", "37FS", "37HJ", "37RB", "37TS"\]/);

  const gh = jayco.slice(jayco.indexOf("    Greyhawk: {"), jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2013": \["26DS", "29KS", "31DS", "31FK", "31FS", "31SS"\]/);
  assert.match(gh, /"2014": \["29KS", "29MV", "31DS", "31FK", "31FS", "31SS"\]/);
  assert.doesNotMatch(gh, /"2013": .*"29MV"/);
  assert.doesNotMatch(gh, /"2014": .*"26DS"/);
  assert.doesNotMatch(gh, /"2013": .*"29ME"/);
  assert.doesNotMatch(gh, /"2014": .*"29ME"/);
  assert.match(gh, /"2015": \["29KS", "29ME", "29MV", "31DS", "31FK", "31FS"\]/);

  const ghp = jayco.slice(jayco.indexOf('    "Greyhawk Prestige": {'), jayco.indexOf("    Redhawk: {"));
  assert.doesNotMatch(ghp, /"2013":/);
  assert.doesNotMatch(ghp, /"2014":/);
  assert.match(ghp, /yearStart:\s*2018/);

  const rh = jayco.slice(jayco.indexOf("    Redhawk: {"), jayco.indexOf("    Melbourne: {"));
  assert.match(rh, /"2013": \["26XS", "29XK", "31XL"\]/);
  assert.match(rh, /"2014": \["23XM", "26XS", "29XK", "31XL"\]/);
  assert.doesNotMatch(rh, /"2013": .*"23XM"/);
  assert.doesNotMatch(rh, /"2013": .*"22J"/);
  assert.doesNotMatch(rh, /"2013": .*"26XD"/);
  assert.doesNotMatch(rh, /"2014": .*"22J"/);
  assert.doesNotMatch(rh, /"2014": .*"26XD"/);
  assert.match(rh, /"2015": \["23XM", "26XD", "29XK", "31XL"\]/);

  const mb = jayco.slice(jayco.indexOf("    Melbourne: {"), jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2013": \["26A", "28F", "29D"\]/);
  assert.match(mb, /"2014": \["26A", "28F", "29D", "29X"\]/);
  assert.doesNotMatch(mb, /"2013": .*"29X"/);
  assert.doesNotMatch(mb, /"2013": .*"24K"/);
  assert.doesNotMatch(mb, /"2014": .*"24K"/);
  assert.match(mb, /"2015": \["29D"\]/);

  const mp = jayco.slice(jayco.indexOf('    "Melbourne Prestige": {'), jayco.indexOf('    "Alante SE"'));
  assert.doesNotMatch(mp, /"2013":/);
  assert.doesNotMatch(mp, /"2014":/);
  assert.match(mp, /yearStart:\s*2018/);
  assert.match(mp, /"2018": \["24KP", "24LP"\]/);

  const pp = jayco.slice(jayco.indexOf('    "Precept Prestige": {'), jayco.indexOf('    "Embark Super C"'));
  assert.doesNotMatch(pp, /"2013":/);
  assert.doesNotMatch(pp, /"2014":/);

  const spr = jayco.slice(jayco.indexOf('    "Seneca Prestige": {'), jayco.indexOf("    Comet: {"));
  assert.doesNotMatch(spr, /"2013":/);
  assert.doesNotMatch(spr, /"2014":/);

  const rse = jayco.slice(jayco.indexOf('    "Redhawk SE": {'), jayco.indexOf('    "Greyhawk XL"'));
  assert.doesNotMatch(rse, /"2013":/);
  assert.doesNotMatch(rse, /"2014":/);

  const sw = jayco.slice(jayco.indexOf("    Swift: {"), jayco.indexOf("    Solstice: {"));
  assert.doesNotMatch(sw, /"2013":/);
  assert.doesNotMatch(sw, /"2014":/);

  const so = jayco.slice(jayco.indexOf("    Solstice: {"), jayco.indexOf("    Terrain: {"));
  assert.doesNotMatch(so, /"2013":/);
  assert.doesNotMatch(so, /"2014":/);

  const co = jayco.slice(jayco.indexOf("    Comet: {"), jayco.indexOf("    Swift: {"));
  assert.doesNotMatch(co, /"2013":/);
  assert.doesNotMatch(co, /"2014":/);

  const te = jayco.slice(jayco.indexOf("    Terrain: {"), jayco.indexOf('    "Jay Feather"'));
  assert.doesNotMatch(te, /"2013":/);
  assert.doesNotMatch(te, /"2014":/);

  const gxl = jayco.slice(jayco.indexOf('    "Greyhawk XL": {'), jayco.indexOf('    "Granite Ridge"'));
  assert.doesNotMatch(gxl, /"2013":/);
  assert.doesNotMatch(gxl, /"2014":/);

  const sxt = jayco.slice(jayco.indexOf('    "Seneca XT": {'), jayco.indexOf('    "Seneca Prestige"'));
  assert.doesNotMatch(sxt, /"2013":/);
  assert.doesNotMatch(sxt, /"2014":/);

  const gr = jayco.slice(jayco.indexOf('    "Granite Ridge": {'), jayco.indexOf('    "Seneca XT"'));
  assert.doesNotMatch(gr, /"2013":/);
  assert.doesNotMatch(gr, /"2014":/);

  assert.equal(findPowertrainCorrection("2013", "Jayco", "Precept", "31UL"), null);
  const pr14 = findPowertrainCorrection("2014", "Jayco", "Precept", "31UL");
  assert.equal(pr14!.horsepower, 362);
  assert.equal(pr14!.torqueLbFt, 457);
  assert.match(pr14!.engine, /6\.8|Triton/);
  assert.equal(pr14!.fuelType, "Gas");
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Precept Prestige", "36B"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Precept Prestige", "36U"), null);

  assert.equal(findPowertrainCorrection("2013", "Jayco", "Alante", "26X"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Alante", "26Y"), null);

  assert.equal(findPowertrainCorrection("2013", "Jayco", "Embark", "37K"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Embark", "38N"), null);
  {
    const embScPin = findPowertrainCorrection("2012", "Jayco", "Embark Super C", "QX390");
    assert.equal(embScPin!.horsepower, 330);
    assert.equal(embScPin!.torqueLbFt, 1000);
  }

  const sen13 = findPowertrainCorrection("2013", "Jayco", "Seneca", "36FK");
  assert.equal(sen13!.horsepower, 340);
  assert.equal(sen13!.torqueLbFt, undefined);
  assert.match(sen13!.chassis || "", /M2/);
  const sen14 = findPowertrainCorrection("2014", "Jayco", "Seneca", "37FS");
  assert.equal(sen14!.horsepower, 340);
  assert.equal(sen14!.torqueLbFt, undefined);
  assert.match(sen14!.chassis || "", /M2/);
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Seneca XT", "32U"), null);

  const gh13 = findPowertrainCorrection("2013", "Jayco", "Greyhawk", "29KS");
  assert.equal(gh13!.horsepower, 305);
  assert.equal(gh13!.torqueLbFt, undefined);
  assert.equal(gh13!.fuelType, "Gas");
  const gh14 = findPowertrainCorrection("2014", "Jayco", "Greyhawk", "29MV");
  assert.equal(gh14!.horsepower, 305);
  assert.equal(gh14!.torqueLbFt, 420);
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Greyhawk Prestige", "29MVP"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Greyhawk Prestige", "29MVP"), null);
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Greyhawk XL", "32U"), null);

  const rh13 = findPowertrainCorrection("2013", "Jayco", "Redhawk", "26XS");
  assert.equal(rh13!.horsepower, 305);
  assert.equal(rh13!.torqueLbFt, 420);
  assert.doesNotMatch(rh13!.engine, /Chevy|342/);
  const rh14 = findPowertrainCorrection("2014", "Jayco", "Redhawk", "23XM");
  assert.equal(rh14!.horsepower, 305);
  assert.equal(rh14!.torqueLbFt, 420);
  assert.doesNotMatch(rh14!.engine, /Chevy|342/);
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Redhawk SE", "22A"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Redhawk SE", "27N"), null);

  const mb13 = findPowertrainCorrection("2013", "Jayco", "Melbourne", "29D");
  assert.equal(mb13!.horsepower, 305);
  assert.equal(mb13!.torqueLbFt, undefined);
  assert.match(mb13!.engine, /Ford|Triton|6\.8/);
  assert.equal(mb13!.fuelType, "Gas");
  const mb14 = findPowertrainCorrection("2014", "Jayco", "Melbourne", "26A");
  assert.equal(mb14!.horsepower, 305);
  assert.equal(mb14!.torqueLbFt, 420);
  assert.equal(mb14!.fuelType, "Gas");
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Melbourne Prestige", "24KP"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Melbourne Prestige", "24LP"), null);

  assert.equal(findPowertrainCorrection("2013", "Jayco", "Swift", "20A"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Terrain", "19Y"), null);
  assert.equal(findPowertrainCorrection("2013", "Jayco", "Comet", "18C"), null);
  assert.equal(findPowertrainCorrection("2014", "Jayco", "Solstice", "21B"), null);
});

test("Jayco 2010–2012 OEM year-first floorplans + powertrain pins", () => {
  const jc = CATALOG_INDEX.Jayco;
  assert.ok(jc);

  assert.equal(jc.Precept?.yearStart, 2014);
  assert.equal(jc.Precept?.years?.includes(2010), false);
  assert.equal(jc.Precept?.years?.includes(2011), false);
  assert.equal(jc.Precept?.years?.includes(2012), false);
  assert.equal(jc["Precept Prestige"]?.yearStart, 2019);
  assert.equal(jc["Precept Prestige"]?.years?.includes(2010), false);

  assert.equal(jc.Alante?.yearStart, 2016);
  assert.equal(jc.Alante?.years?.includes(2010), false);
  assert.equal(jc.Alante?.years?.includes(2012), false);
  assert.equal(jc["Alante SE"]?.yearStart, 2025);

  assert.equal(jc.Embark?.yearStart, 2021);
  assert.equal(jc.Embark?.years?.includes(2010), false);
  assert.equal(jc.Embark?.years?.includes(2012), false);
  assert.equal(jc.Embark?.type, "Class A Diesel");
  assert.equal(jc["Embark Super C"]?.type, "Super C");
  assert.equal(jc["Embark Super C"]?.yearStart, 2009);
  assert.equal(jc["Embark Super C"]?.yearEnd, 2012);
  assert.equal(jc["Embark Super C"]?.years?.includes(2010), true);
  assert.equal(jc["Embark Super C"]?.years?.includes(2011), true);
  assert.equal(jc["Embark Super C"]?.years?.includes(2012), true);
  assert.equal(jc["Embark Super C"]?.years?.includes(2009), false);
  assert.equal(jc["Embark Super C"]?.years?.includes(2013), false);

  assert.equal(jc.Seneca?.yearStart, 2010);
  assert.equal(jc.Seneca?.years?.includes(2010), true);
  assert.equal(jc.Seneca?.years?.includes(2011), false);
  assert.equal(jc.Seneca?.years?.includes(2012), true);
  assert.equal(jc["Seneca Super C"]?.yearStart, 2010);
  assert.equal(jc["Seneca Super C"]?.years?.includes(2011), false);
  assert.equal(jc["Seneca Prestige"]?.yearStart, 2021);
  assert.equal(jc["Seneca Prestige"]?.years?.includes(2010), false);
  assert.equal(jc["Seneca XT"]?.yearStart, 2023);

  assert.equal(jc.Greyhawk?.yearStart, 2010);
  assert.equal(jc.Greyhawk?.years?.includes(2010), true);
  assert.equal(jc.Greyhawk?.years?.includes(2009), false);
  assert.equal(jc["Greyhawk Prestige"]?.yearStart, 2018);
  assert.equal(jc["Greyhawk Prestige"]?.years?.includes(2010), false);
  assert.equal(jc["Greyhawk XL"]?.yearStart, 2024);

  assert.equal(jc.Redhawk?.yearStart, 2013);
  assert.equal(jc.Redhawk?.years?.includes(2010), false);
  assert.equal(jc.Redhawk?.years?.includes(2011), false);
  assert.equal(jc.Redhawk?.years?.includes(2012), false);
  assert.equal(jc["Redhawk SE"]?.yearStart, 2019);
  assert.equal(jc["Redhawk SE"]?.years?.includes(2010), false);

  assert.equal(jc.Melbourne?.yearStart, 2010);
  assert.equal(jc.Melbourne?.years?.includes(2010), true);
  assert.equal(jc.Melbourne?.years?.includes(2011), true);
  assert.equal(jc.Melbourne?.years?.includes(2012), true);
  assert.equal(jc["Melbourne Prestige"]?.yearStart, 2018);
  assert.equal(jc["Melbourne Prestige"]?.years?.includes(2010), false);

  assert.equal(jc.Swift?.yearStart, 2021);
  assert.equal(jc.Swift?.years?.includes(2010), false);
  assert.equal(jc.Terrain?.yearStart, 2022);
  assert.equal(jc.Comet?.yearStart, 2024);
  assert.equal(jc.Solstice?.yearStart, 2023);
  assert.equal(jc["Granite Ridge"]?.yearStart, 2024);

  const block = src("rvData.ts");
  const j0 = block.indexOf("  Jayco: {");
  const j1 = block.indexOf('  "American Coach": {');
  const jayco = block.slice(j0, j1);

  const pr = jayco.slice(jayco.indexOf("    Precept: {"), jayco.indexOf("    Alante: {"));
  assert.doesNotMatch(pr, /"2010":/);
  assert.doesNotMatch(pr, /"2011":/);
  assert.doesNotMatch(pr, /"2012":/);
  assert.match(pr, /yearStart:\s*2014/);

  const al = jayco.slice(jayco.indexOf("    Alante: {"), jayco.indexOf("    Embark: {"));
  assert.doesNotMatch(al, /"2010":/);
  assert.doesNotMatch(al, /"2011":/);
  assert.doesNotMatch(al, /"2012":/);

  const em = jayco.slice(jayco.indexOf("    Embark: {"), jayco.indexOf("    Seneca: {"));
  assert.doesNotMatch(em, /"2010":/);
  assert.doesNotMatch(em, /"2011":/);
  assert.doesNotMatch(em, /"2012":/);
  assert.match(em, /yearStart:\s*2021/);

  const se = jayco.slice(jayco.indexOf("    Seneca: {"), jayco.indexOf('    "Seneca Super C"'));
  assert.match(se, /"2010": \["35GS", "36FS", "36MS"\]/);
  assert.doesNotMatch(se, /"2011":/);
  assert.match(se, /"2012": \["36FK", "37FS", "37RB", "37TS"\]/);
  assert.doesNotMatch(se, /"2010": .*"36FK"/);
  assert.doesNotMatch(se, /"2012": .*"35GS"/);
  assert.match(se, /"2013": \["36FK", "37FS", "37RB", "37TS"\]/);

  const gh = jayco.slice(jayco.indexOf("    Greyhawk: {"), jayco.indexOf('    "Greyhawk Prestige"'));
  assert.match(gh, /"2010": \["31FK", "31FS", "31GS", "31SS"\]/);
  assert.match(gh, /"2011": \["26DS", "31DS", "31FK", "31FS", "31SS"\]/);
  assert.match(gh, /"2012": \["26DS", "31DS", "31FK", "31FS", "31SS"\]/);
  assert.doesNotMatch(gh, /"2010": .*"26DS"/);
  assert.doesNotMatch(gh, /"2010": .*"31DS"/);
  assert.doesNotMatch(gh, /"2011": .*"31GS"/);
  assert.doesNotMatch(gh, /"2011": .*"31TS"/);
  assert.doesNotMatch(gh, /"2008":/);
  assert.doesNotMatch(gh, /"2009":/);

  const ghp = jayco.slice(jayco.indexOf('    "Greyhawk Prestige": {'), jayco.indexOf("    Redhawk: {"));
  assert.doesNotMatch(ghp, /"2010":/);
  assert.doesNotMatch(ghp, /"2011":/);
  assert.doesNotMatch(ghp, /"2012":/);

  const rh = jayco.slice(jayco.indexOf("    Redhawk: {"), jayco.indexOf("    Melbourne: {"));
  assert.doesNotMatch(rh, /"2010":/);
  assert.doesNotMatch(rh, /"2011":/);
  assert.doesNotMatch(rh, /"2012":/);
  assert.match(rh, /yearStart:\s*2013/);
  assert.match(rh, /"2013": \["26XS", "29XK", "31XL"\]/);

  const mb = jayco.slice(jayco.indexOf("    Melbourne: {"), jayco.indexOf('    "Melbourne Prestige"'));
  assert.match(mb, /"2010": \["24E", "26A", "29C", "29D"\]/);
  assert.match(mb, /"2011": \["24E", "26A", "29C", "29D"\]/);
  assert.match(mb, /"2012": \["26A", "28F", "29C", "29D"\]/);
  assert.doesNotMatch(mb, /"2010": .*"24K"/);
  assert.doesNotMatch(mb, /"2012": .*"24K"/);
  assert.doesNotMatch(mb, /"2012": .*"24L"/);
  assert.doesNotMatch(mb, /"2012": .*"24E"/);
  assert.doesNotMatch(mb, /"2009":/);

  const mp = jayco.slice(jayco.indexOf('    "Melbourne Prestige": {'), jayco.indexOf('    "Alante SE"'));
  assert.doesNotMatch(mp, /"2010":/);
  assert.doesNotMatch(mp, /"2011":/);
  assert.doesNotMatch(mp, /"2012":/);

  const esc = jayco.slice(jayco.indexOf('    "Embark Super C": {'), jayco.indexOf('    "Redhawk SE"'));
  assert.match(esc, /"2010": \["QX390", "TB390"\]/);
  assert.match(esc, /"2011": \["QX390", "TB390"\]/);
  assert.match(esc, /"2012": \["QX390", "TB390"\]/);
  assert.doesNotMatch(esc, /"2009":/);
  assert.match(esc, /yearEnd:\s*2012/);

  const rse = jayco.slice(jayco.indexOf('    "Redhawk SE": {'), jayco.indexOf('    "Greyhawk XL"'));
  assert.doesNotMatch(rse, /"2010":/);
  assert.doesNotMatch(rse, /"2011":/);
  assert.doesNotMatch(rse, /"2012":/);

  const sw = jayco.slice(jayco.indexOf("    Swift: {"), jayco.indexOf("    Solstice: {"));
  assert.doesNotMatch(sw, /"2010":/);
  assert.doesNotMatch(sw, /"2011":/);
  assert.doesNotMatch(sw, /"2012":/);

  const so = jayco.slice(jayco.indexOf("    Solstice: {"), jayco.indexOf("    Terrain: {"));
  assert.doesNotMatch(so, /"2010":/);
  assert.doesNotMatch(so, /"2012":/);

  const co = jayco.slice(jayco.indexOf("    Comet: {"), jayco.indexOf("    Swift: {"));
  assert.doesNotMatch(co, /"2010":/);
  assert.doesNotMatch(co, /"2012":/);

  const te = jayco.slice(jayco.indexOf("    Terrain: {"), jayco.indexOf('    "Jay Feather"'));
  assert.doesNotMatch(te, /"2010":/);
  assert.doesNotMatch(te, /"2012":/);

  const gxl = jayco.slice(jayco.indexOf('    "Greyhawk XL": {'), jayco.indexOf('    "Granite Ridge"'));
  assert.doesNotMatch(gxl, /"2010":/);
  assert.doesNotMatch(gxl, /"2012":/);

  const sxt = jayco.slice(jayco.indexOf('    "Seneca XT": {'), jayco.indexOf('    "Seneca Prestige"'));
  assert.doesNotMatch(sxt, /"2010":/);
  assert.doesNotMatch(sxt, /"2012":/);

  const gr = jayco.slice(jayco.indexOf('    "Granite Ridge": {'), jayco.indexOf('    "Seneca XT"'));
  assert.doesNotMatch(gr, /"2010":/);
  assert.doesNotMatch(gr, /"2012":/);

  assert.equal(findPowertrainCorrection("2010", "Jayco", "Precept", "31UL"), null);
  assert.equal(findPowertrainCorrection("2012", "Jayco", "Precept", "29UM"), null);
  assert.equal(findPowertrainCorrection("2010", "Jayco", "Alante", "26X"), null);
  assert.equal(findPowertrainCorrection("2012", "Jayco", "Embark", "37K"), null);

  const sen10 = findPowertrainCorrection("2010", "Jayco", "Seneca", "35GS");
  assert.equal(sen10!.horsepower, 330);
  assert.equal(sen10!.torqueLbFt, undefined);
  assert.match(sen10!.chassis || "", /Kodiak/);
  assert.match(sen10!.engine, /Duramax|6\.6/);
  assert.equal(findPowertrainCorrection("2011", "Jayco", "Seneca", "36FS"), null);
  const sen12 = findPowertrainCorrection("2012", "Jayco", "Seneca", "36FK");
  assert.equal(sen12!.horsepower, 340);
  assert.equal(sen12!.torqueLbFt, undefined);
  assert.match(sen12!.chassis || "", /M2/);
  assert.match(sen12!.note || "", /12k/);
  assert.equal(findPowertrainCorrection("2010", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findPowertrainCorrection("2012", "Jayco", "Seneca XT", "32U"), null);

  const gh10 = findPowertrainCorrection("2010", "Jayco", "Greyhawk", "31FK");
  assert.equal(gh10!.horsepower, 305);
  assert.equal(gh10!.torqueLbFt, undefined);
  assert.equal(gh10!.chassis, undefined);
  assert.equal(gh10!.fuelType, "Gas");
  const gh11 = findPowertrainCorrection("2011", "Jayco", "Greyhawk", "26DS");
  assert.equal(gh11!.horsepower, 305);
  assert.equal(gh11!.torqueLbFt, undefined);
  assert.match(gh11!.chassis || "", /E-450/);
  const gh12 = findPowertrainCorrection("2012", "Jayco", "Greyhawk", "31SS");
  assert.equal(gh12!.horsepower, 305);
  assert.equal(gh12!.torqueLbFt, undefined);
  assert.equal(findPowertrainCorrection("2010", "Jayco", "Greyhawk Prestige", "29MVP"), null);
  assert.equal(findPowertrainCorrection("2012", "Jayco", "Greyhawk XL", "32U"), null);

  assert.equal(findPowertrainCorrection("2010", "Jayco", "Redhawk", "22J"), null);
  assert.equal(findPowertrainCorrection("2011", "Jayco", "Redhawk", "26XD"), null);
  assert.equal(findPowertrainCorrection("2012", "Jayco", "Redhawk", "29XK"), null);
  assert.equal(findPowertrainCorrection("2010", "Jayco", "Redhawk SE", "22A"), null);

  const mb10 = findPowertrainCorrection("2010", "Jayco", "Melbourne", "24E");
  assert.equal(mb10!.horsepower, 305);
  assert.equal(mb10!.torqueLbFt, undefined);
  assert.match(mb10!.engine, /Ford|Triton|6\.8/);
  assert.equal(mb10!.fuelType, "Gas");
  const mb12 = findPowertrainCorrection("2012", "Jayco", "Melbourne", "28F");
  assert.equal(mb12!.horsepower, 305);
  assert.equal(mb12!.torqueLbFt, undefined);
  assert.equal(mb12!.fuelType, "Gas");
  assert.doesNotMatch(mb12!.engine, /Mercedes|188|Sprinter/);
  assert.equal(findPowertrainCorrection("2010", "Jayco", "Melbourne Prestige", "24KP"), null);

  const emb10 = findPowertrainCorrection("2010", "Jayco", "Embark Super C", "QX390");
  assert.equal(emb10!.horsepower, 330);
  assert.equal(emb10!.torqueLbFt, 1000);
  assert.match(emb10!.engine, /ISC/);
  const emb11 = findPowertrainCorrection("2011", "Jayco", "Embark Super C", "TB390");
  assert.equal(emb11!.horsepower, 350);
  assert.equal(emb11!.torqueLbFt, 1000);
  const emb12 = findPowertrainCorrection("2012", "Jayco", "Embark Super C", "QX390");
  assert.equal(emb12!.horsepower, 330);
  assert.equal(emb12!.torqueLbFt, 1000);
  assert.match(emb12!.chassis || "", /M2/);
  assert.equal(findPowertrainCorrection("2009", "Jayco", "Embark Super C", "QX390"), null);
  assert.equal(findPowertrainCorrection("2012", "Jayco", "Embark", "QX390"), null);

  assert.equal(findPowertrainCorrection("2010", "Jayco", "Swift", "20A"), null);
  assert.equal(findPowertrainCorrection("2011", "Jayco", "Terrain", "19Y"), null);
  assert.equal(findPowertrainCorrection("2012", "Jayco", "Comet", "18C"), null);
  assert.equal(findPowertrainCorrection("2010", "Jayco", "Solstice", "21B"), null);
});

test("Entegra 2023–2024 OEM year-first floorplans + powertrain pins", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);
  assert.equal(eg.Emblem?.years?.includes(2023), true);
  assert.equal(eg.Emblem?.years?.includes(2024), true);
  assert.equal(eg["Accolade XT"]?.years?.includes(2023), true);
  assert.equal(eg["Accolade XT"]?.years?.includes(2024), true);
  assert.equal(eg["Accolade XT"]?.years?.includes(2025), false);
  assert.equal(eg.Expanse?.years?.includes(2023), true);
  assert.equal(eg.Expanse?.years?.includes(2024), true);
  assert.equal(eg.Launch?.yearStart, 2022);
  assert.equal(eg.Ethos?.yearStart, 2021);
  assert.equal(eg["Odyssey SE"]?.years?.includes(2024), true);
  assert.equal(eg["Odyssey SE"]?.years?.includes(2023), false);
  assert.equal(eg.Condor?.years?.includes(2023), false);
  assert.equal(eg.Condor?.years?.includes(2024), false);
  assert.equal(eg.Arc?.years?.includes(2024), false);
  assert.equal(eg.Centurion?.years?.includes(2023), false);
  assert.equal(eg.Centurion?.years?.includes(2024), false);
  assert.equal(eg["Esteem XL"]?.years?.includes(2024), false);
  assert.equal(eg["Qwest SE"]?.years?.includes(2024), false);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);

  const cs = entegra.slice(entegra.indexOf('    "Cornerstone": {'), entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2023": \["45B", "45D", "45R", "45W", "45Z"\]/);
  assert.match(cs, /"2024": \["45B", "45D", "45R", "45W", "45Z"\]/);
  assert.doesNotMatch(cs, /"2023": \["45B", "45W", "45Z"\]/);
  assert.doesNotMatch(cs, /"2024": \["45A"/);

  const an = entegra.slice(entegra.indexOf('    "Anthem": {'), entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2023": \["44B", "44D", "44R", "44W", "44Z"\]/);
  assert.match(an, /"2024": \["37K", "44B", "44D", "44R", "44W", "44Z"\]/);
  assert.doesNotMatch(an, /"2023": \["37K"/);

  const as = entegra.slice(entegra.indexOf('    "Aspire": {'), entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2023": \["40P", "44B", "44D", "44R", "44W", "44Z"\]/);
  assert.match(as, /"2024": \["40P", "44B", "44D", "44R", "44W", "44Z"\]/);
  assert.doesNotMatch(as, /"2023": \["42D"/);

  const re = entegra.slice(entegra.indexOf('    "Reatta": {'), entegra.indexOf('    "Reatta XL"'));
  assert.match(re, /"2023": \["37K", "39BH", "39T2"\]/);
  assert.match(re, /"2024": \["37K", "39BH", "39T2"\]/);

  const rxl = entegra.slice(entegra.indexOf('    "Reatta XL": {'), entegra.indexOf('    "Vision": {'));
  assert.match(rxl, /"2023": \["37K", "39BH", "39T2", "40Q2"\]/);
  assert.match(rxl, /"2024": \["37K", "39BH", "39T2", "40Q2", "40Q3"\]/);
  assert.doesNotMatch(rxl, /"2023": \["37K", "39BH", "39W"\]/);

  const vi = entegra.slice(entegra.indexOf('    "Vision": {'), entegra.indexOf('    "Vision XL"'));
  assert.match(vi, /"2023": \["27A", "29F", "29S"\]/);
  assert.match(vi, /"2024": \["27A", "29F", "29S"\]/);
  assert.doesNotMatch(vi, /"2023": \["27A", "29S", "31B"/);

  const vxl = entegra.slice(entegra.indexOf('    "Vision XL": {'), entegra.indexOf('    "Accolade": {'));
  assert.match(vxl, /"2023": \["34B", "34G", "36A", "36C"\]/);
  assert.match(vxl, /"2024": \["31UL", "34B", "34G", "36A", "36C"\]/);
  assert.doesNotMatch(vxl, /"2023": \["31UL"/);

  const ac = entegra.slice(entegra.indexOf('    "Accolade": {'), entegra.indexOf('    "Accolade XL"'));
  assert.match(ac, /"2023": \["37K", "37L", "37M"\]/);
  assert.match(ac, /"2024": \["37K", "37L", "37M"\]/);

  const axl = entegra.slice(entegra.indexOf('    "Accolade XL": {'), entegra.indexOf('    "Centurion": {'));
  assert.match(axl, /"2023": \["37K", "37L", "37M"\]/);
  assert.match(axl, /"2024": \["37K", "37L", "37M"\]/);
  assert.match(axl, /"2025": \["37M", "37K"\]/);

  const emb = entegra.slice(entegra.indexOf('    "Emblem": {'), entegra.indexOf('    "Vision SE"'));
  assert.match(emb, /"2023": \["36H", "36T", "36U"\]/);
  assert.match(emb, /"2024": \["36H", "36T", "36U"\]/);
  assert.match(emb, /"2025": \["36B", "36H", "36U"\]/);
  assert.doesNotMatch(emb, /"2023": \["36B"/);
  assert.doesNotMatch(emb, /"2024": \["36B"/);

  const xt = entegra.slice(entegra.indexOf('    "Accolade XT": {'), entegra.indexOf('    "Esteem XL"'));
  assert.match(xt, /"2023": \["32U", "35L"\]/);
  assert.match(xt, /"2024": \["29T", "32U", "35L"\]/);
  assert.doesNotMatch(xt, /"2025":/);
  assert.doesNotMatch(xt, /"2023": \["29T"/);

  const od = entegra.slice(entegra.indexOf('    "Odyssey": {'), entegra.indexOf('    "Esteem": {'));
  assert.match(od, /"2023": \["24B", "25R", "26M", "27U", "29V", "30Z", "31F"\]/);
  assert.doesNotMatch(od, /"2023": \["24A"/);

  const es = entegra.slice(entegra.indexOf('    "Esteem": {'), entegra.indexOf('    "Qwest": {'));
  assert.match(es, /"2023": \["27U", "29V", "31F"\]/);
  assert.doesNotMatch(es, /"2023": \["26U"/);

  const qw = entegra.slice(entegra.indexOf('    "Qwest": {'), entegra.indexOf('    "Cornerstone Reserve"'));
  assert.match(qw, /"2023": \["24L", "24N", "24R", "24T"\]/);
  assert.match(qw, /"2024": \["24L", "24N", "24R", "24T"\]/);
  assert.match(qw, /"2025": \["24L", "24R"\]/);

  const ex = entegra.slice(entegra.indexOf('    "Expanse": {'), entegra.indexOf('    "Odyssey": {'));
  assert.match(ex, /"2023": \["21B"\]/);
  assert.match(ex, /"2024": \["21B"\]/);
  assert.doesNotMatch(ex, /"2023": \["21B", "21T"\]/);
  assert.doesNotMatch(ex, /"2025":/);

  const ln = entegra.slice(entegra.indexOf('    "Launch": {'), entegra.indexOf('    "Ethos": {'));
  assert.match(ln, /"2023": \["19Y"\]/);
  assert.match(ln, /"2024": \["19Y"\]/);
  assert.doesNotMatch(ln, /"2023": \["19A"/);

  const et = entegra.slice(entegra.indexOf('    "Ethos": {'), entegra.indexOf('    "Insignia": {'));
  assert.match(et, /"2023": \["20A", "20D", "20T"\]/);
  assert.match(et, /"2024": \["20A", "20D", "20T"\]/);
  assert.doesNotMatch(et, /"2023": \["20A", "20E"/);

  const odse = entegra.slice(entegra.indexOf('    "Odyssey SE": {'), entegra.indexOf('    "Qwest SE"'));
  assert.match(odse, /"2024": \["22A", "22AF", "22C", "22CF", "27N", "27NF"\]/);
  assert.doesNotMatch(odse, /"2023":/);
  assert.doesNotMatch(odse, /"2025":/);

  const cs23 = findPowertrainCorrection("2023", "Entegra Coach", "Cornerstone", "45B");
  assert.equal(cs23!.horsepower, 605);
  assert.equal(cs23!.torqueLbFt, 1950);
  const an23 = findPowertrainCorrection("2023", "Entegra Coach", "Anthem", "44B");
  assert.equal(an23!.horsepower, 450);
  assert.match(an23!.chassis || "", /K2/);
  const as23 = findPowertrainCorrection("2023", "Entegra Coach", "Aspire", "40P");
  assert.equal(as23!.horsepower, 450);
  const re23 = findPowertrainCorrection("2023", "Entegra Coach", "Reatta", "37K");
  assert.equal(re23!.horsepower, 360);
  const rxl23 = findPowertrainCorrection("2023", "Entegra Coach", "Reatta XL", "37K");
  assert.equal(rxl23!.horsepower, 380);
  assert.equal(rxl23!.torqueLbFt, 1150);
  assert.match(rxl23!.engine, /L9/);
  const vis23 = findPowertrainCorrection("2023", "Entegra Coach", "Vision", "27A");
  assert.equal(vis23!.horsepower, 350);
  assert.equal(vis23!.fuelType, "Gas");
  const vis24 = findPowertrainCorrection("2024", "Entegra Coach", "Vision", "27A");
  assert.equal(vis24!.horsepower, 335);
  const vxl23 = findPowertrainCorrection("2023", "Entegra Coach", "Vision XL", "36A");
  assert.equal(vxl23!.horsepower, 350);
  const emb23 = findPowertrainCorrection("2023", "Entegra Coach", "Emblem", "36H");
  assert.equal(emb23!.horsepower, 350);
  const emb24 = findPowertrainCorrection("2024", "Entegra Coach", "Emblem", "36H");
  assert.equal(emb24!.horsepower, 335);
  const acc23 = findPowertrainCorrection("2023", "Entegra Coach", "Accolade", "37K");
  assert.equal(acc23!.horsepower, 360);
  assert.match(acc23!.chassis || "", /S2RV/);
  const xt23 = findPowertrainCorrection("2023", "Entegra Coach", "Accolade XT", "32U");
  assert.equal(xt23!.horsepower, 330);
  assert.equal(xt23!.torqueLbFt, 825);
  assert.match(xt23!.engine, /Power Stroke/);
  const xt24 = findPowertrainCorrection("2024", "Entegra Coach", "Accolade XT", "29T");
  assert.equal(xt24!.torqueLbFt, 950);
  const od23 = findPowertrainCorrection("2023", "Entegra Coach", "Odyssey", "24B");
  assert.equal(od23!.horsepower, 350);
  const od24 = findPowertrainCorrection("2024", "Entegra Coach", "Odyssey", "24B");
  assert.equal(od24!.horsepower, 325);
  const es23 = findPowertrainCorrection("2023", "Entegra Coach", "Esteem", "27U");
  assert.equal(es23!.horsepower, 350);
  const es24 = findPowertrainCorrection("2024", "Entegra Coach", "Esteem", "27U");
  assert.equal(es24!.horsepower, 325);
  const qw23 = findPowertrainCorrection("2023", "Entegra Coach", "Qwest", "24L");
  assert.equal(qw23!.horsepower, 188);
  const qw24 = findPowertrainCorrection("2024", "Entegra Coach", "Qwest", "24L");
  assert.equal(qw24!.horsepower, 211);
  const exp23 = findPowertrainCorrection("2023", "Entegra Coach", "Expanse", "21B");
  assert.equal(exp23!.horsepower, 0);
  assert.equal(exp23!.fuelType, "Gas");
  const ln23 = findPowertrainCorrection("2023", "Entegra Coach", "Launch", "19Y");
  assert.equal(ln23!.horsepower, 188);
  const et23 = findPowertrainCorrection("2023", "Entegra Coach", "Ethos", "20A");
  assert.equal(et23!.horsepower, 0);
  const et24 = findPowertrainCorrection("2024", "Entegra Coach", "Ethos", "20A");
  assert.equal(et24!.horsepower, 276);
  const odse24 = findPowertrainCorrection("2024", "Entegra Coach", "Odyssey SE", "22AF");
  assert.equal(odse24!.horsepower, 0);
  assert.match(odse24!.engine, /Chevy|401/);
  assert.equal(findPowertrainCorrection("2024", "Entegra Coach", "Condor", "22T"), null);
  assert.equal(findPowertrainCorrection("2024", "Entegra Coach", "Arc", "18C"), null);
});

test("Entegra 2021–2022 OEM year-first floorplans + powertrain pins", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);
  assert.equal(eg.Emblem?.yearStart, 2019);
  assert.equal(eg.Emblem?.years?.includes(2021), true);
  assert.equal(eg.Emblem?.years?.includes(2022), true);
  assert.equal(eg.Launch?.yearStart, 2022);
  assert.equal(eg.Launch?.years?.includes(2021), false);
  assert.equal(eg.Launch?.years?.includes(2022), true);
  assert.equal(eg.Ethos?.yearStart, 2021);
  assert.equal(eg.Ethos?.years?.includes(2021), true);
  assert.equal(eg.Ethos?.years?.includes(2022), true);
  assert.equal(eg.Expanse?.yearStart, 2023);
  assert.equal(eg.Expanse?.years?.includes(2021), false);
  assert.equal(eg.Expanse?.years?.includes(2022), false);
  assert.equal(eg["Accolade XT"]?.yearStart, 2023);
  assert.equal(eg["Accolade XT"]?.years?.includes(2021), false);
  assert.equal(eg["Accolade XT"]?.years?.includes(2022), false);
  assert.equal(eg["Ethos Li"], undefined);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);

  const cs = entegra.slice(entegra.indexOf('    "Cornerstone": {'), entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2021": \["45B", "45F", "45R", "45W", "45X", "45Y", "45Z"\]/);
  assert.match(cs, /"2022": \["45B", "45D", "45F", "45R", "45W", "45Z"\]/);
  assert.doesNotMatch(cs, /"2021": \["45B", "45W", "45Z"\]/);

  const an = entegra.slice(entegra.indexOf('    "Anthem": {'), entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2021": \["42DEQ", "44B", "44F", "44R", "44W", "44Z"\]/);
  assert.match(an, /"2022": \["44B", "44D", "44F", "44R", "44W", "44Z"\]/);
  assert.doesNotMatch(an, /"2021": .*"44D"/);

  const as = entegra.slice(entegra.indexOf('    "Aspire": {'), entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2021": \["38M", "40P", "42DEQ", "44B", "44F", "44R", "44W", "44Z"\]/);
  assert.match(as, /"2022": \["40P", "44B", "44D", "44F", "44R", "44W", "44Z"\]/);
  assert.doesNotMatch(as, /"2021": \["38R"/);
  assert.doesNotMatch(as, /"2022": \["42D"/);

  const re = entegra.slice(entegra.indexOf('    "Reatta": {'), entegra.indexOf('    "Reatta XL"'));
  assert.match(re, /"2021": \["37K", "39BH", "39T2"\]/);
  assert.match(re, /"2022": \["37K", "39BH", "39T2"\]/);
  assert.doesNotMatch(re, /"2021": .*"39W"/);
  assert.doesNotMatch(re, /"2022": \["37K", "39BH"\]/);

  const rxl = entegra.slice(entegra.indexOf('    "Reatta XL": {'), entegra.indexOf('    "Vision": {'));
  assert.match(rxl, /"2021": \["37K", "39BH", "39T2", "40Q2"\]/);
  assert.match(rxl, /"2022": \["37K", "39BH", "39T2", "40Q3"\]/);
  assert.doesNotMatch(rxl, /"2021": .*"40Q3"/);
  assert.doesNotMatch(rxl, /"2022": .*"40Q2"/);
  assert.doesNotMatch(rxl, /"2021": .*"39W"/);

  const vi = entegra.slice(entegra.indexOf('    "Vision": {'), entegra.indexOf('    "Vision XL"'));
  assert.match(vi, /"2021": \["26X", "27A", "29F", "29S", "31V"\]/);
  assert.match(vi, /"2022": \["27A", "29F", "29S"\]/);
  assert.doesNotMatch(vi, /"2022": .*"26X"/);
  assert.doesNotMatch(vi, /"2022": .*"31V"/);
  assert.doesNotMatch(vi, /"2021": .*"31B"/);

  const vxl = entegra.slice(entegra.indexOf('    "Vision XL": {'), entegra.indexOf('    "Accolade": {'));
  assert.match(vxl, /"2021": \["34B", "34G", "36A"\]/);
  assert.match(vxl, /"2022": \["34B", "34G", "36A", "36C"\]/);
  assert.doesNotMatch(vxl, /"2021": .*"31UL"/);
  assert.doesNotMatch(vxl, /"2022": .*"31UL"/);

  const ac = entegra.slice(entegra.indexOf('    "Accolade": {'), entegra.indexOf('    "Accolade XL"'));
  assert.match(ac, /"2021": \["37K", "37L", "37M", "37RB", "37TS"\]/);
  assert.match(ac, /"2022": \["37K", "37L", "37M"\]/);
  assert.doesNotMatch(ac, /"2021": .*"37HJ"/);
  assert.doesNotMatch(ac, /"2022": .*"37TS"/);
  // Accolade XT must not appear as a 2021–22 Accolade plan
  const xt = entegra.slice(entegra.indexOf('    "Accolade XT": {'), entegra.indexOf('    "Esteem XL"'));
  assert.doesNotMatch(xt, /"2021":/);
  assert.doesNotMatch(xt, /"2022":/);

  const axl = entegra.slice(entegra.indexOf('    "Accolade XL": {'), entegra.indexOf('    "Centurion": {'));
  assert.match(axl, /"2021": \["37K", "37L", "37M"\]/);
  assert.match(axl, /"2022": \["37K", "37L", "37M"\]/);

  const emb = entegra.slice(entegra.indexOf('    "Emblem": {'), entegra.indexOf('    "Vision SE"'));
  assert.match(emb, /"2021": \["36H", "36T", "36U"\]/);
  assert.match(emb, /"2022": \["36H", "36T", "36U"\]/);
  assert.doesNotMatch(emb, /"2021": .*"36B"/);
  assert.doesNotMatch(emb, /"2022": .*"36B"/);

  const od = entegra.slice(entegra.indexOf('    "Odyssey": {'), entegra.indexOf('    "Esteem": {'));
  assert.match(od, /"2021": \["24B", "25R", "26D", "26M", "27U", "29K", "29V", "30Z", "31F"\]/);
  assert.match(od, /"2022": \["24B", "25R", "26M", "27U", "29V", "30Z", "31F"\]/);
  assert.doesNotMatch(od, /"2022": .*"26D"/);
  assert.doesNotMatch(od, /"2022": .*"29K"/);

  const es = entegra.slice(entegra.indexOf('    "Esteem": {'), entegra.indexOf('    "Qwest": {'));
  assert.match(es, /"2021": \["27U", "29V", "30X", "31F"\]/);
  assert.match(es, /"2022": \["27U", "29V", "31F"\]/);
  assert.doesNotMatch(es, /"2022": .*"30X"/);

  const qw = entegra.slice(entegra.indexOf('    "Qwest": {'), entegra.indexOf('    "Cornerstone Reserve"'));
  assert.match(qw, /"2021": \["24L", "24R", "24T"\]/);
  assert.match(qw, /"2022": \["24L", "24N", "24R", "24T"\]/);
  assert.doesNotMatch(qw, /"2021": .*"24K"/);

  const ln = entegra.slice(entegra.indexOf('    "Launch": {'), entegra.indexOf('    "Ethos": {'));
  assert.match(ln, /"2022": \["19Y"\]/);
  assert.doesNotMatch(ln, /"2021":/);

  const et = entegra.slice(entegra.indexOf('    "Ethos": {'), entegra.indexOf('    "Insignia": {'));
  assert.match(et, /"2021": \["20A", "20T"\]/);
  assert.match(et, /"2022": \["20A", "20T"\]/);
  assert.doesNotMatch(et, /"2021": .*"20D"/);
  assert.doesNotMatch(et, /"2022": .*"20D"/);

  const ex = entegra.slice(entegra.indexOf('    "Expanse": {'), entegra.indexOf('    "Odyssey": {'));
  assert.doesNotMatch(ex, /"2021":/);
  assert.doesNotMatch(ex, /"2022":/);

  const cs21 = findPowertrainCorrection("2021", "Entegra Coach", "Cornerstone", "45B");
  assert.equal(cs21!.horsepower, 605);
  assert.equal(cs21!.torqueLbFt, 1950);
  assert.match(cs21!.chassis || "", /K3/);
  const an21 = findPowertrainCorrection("2021", "Entegra Coach", "Anthem", "44B");
  assert.equal(an21!.horsepower, 450);
  assert.equal(an21!.torqueLbFt, 1250);
  assert.match(an21!.chassis || "", /K2/);
  assert.doesNotMatch(an21!.engine, /X12/);
  const as21 = findPowertrainCorrection("2021", "Entegra Coach", "Aspire", "40P");
  assert.equal(as21!.horsepower, 450);
  const re21 = findPowertrainCorrection("2021", "Entegra Coach", "Reatta", "37K");
  assert.equal(re21!.horsepower, 360);
  assert.match(re21!.engine, /B6\.7/);
  const rxl21 = findPowertrainCorrection("2021", "Entegra Coach", "Reatta XL", "40Q2");
  assert.equal(rxl21!.horsepower, 380);
  assert.equal(rxl21!.torqueLbFt, 1150);
  assert.match(rxl21!.engine, /L9/);
  const rxl22 = findPowertrainCorrection("2022", "Entegra Coach", "Reatta XL", "40Q3");
  assert.equal(rxl22!.horsepower, 380);
  const vis21 = findPowertrainCorrection("2021", "Entegra Coach", "Vision", "27A");
  assert.equal(vis21!.horsepower, 350);
  assert.equal(vis21!.fuelType, "Gas");
  const vis22 = findPowertrainCorrection("2022", "Entegra Coach", "Vision", "27A");
  assert.equal(vis22!.horsepower, 350);
  const vxl21 = findPowertrainCorrection("2021", "Entegra Coach", "Vision XL", "34B");
  assert.equal(vxl21!.horsepower, 350);
  assert.equal(vxl21!.fuelType, "Gas");
  const emb21 = findPowertrainCorrection("2021", "Entegra Coach", "Emblem", "36H");
  assert.equal(emb21!.horsepower, 350);
  assert.equal(emb21!.fuelType, "Gas");
  const acc21 = findPowertrainCorrection("2021", "Entegra Coach", "Accolade", "37K");
  assert.equal(acc21!.horsepower, 360);
  assert.match(acc21!.chassis || "", /S2RV/);
  assert.doesNotMatch(acc21!.chassis || "", /Plus/);
  const acc22 = findPowertrainCorrection("2022", "Entegra Coach", "Accolade", "37M");
  assert.equal(acc22!.horsepower, 360);
  assert.doesNotMatch(acc22!.chassis || "", /Plus/);
  const axl21 = findPowertrainCorrection("2021", "Entegra Coach", "Accolade XL", "37L");
  assert.equal(axl21!.horsepower, 360);
  assert.doesNotMatch(axl21!.engine, /Power Stroke/);
  assert.equal(findPowertrainCorrection("2021", "Entegra Coach", "Accolade XT", "32U"), null);
  const od21 = findPowertrainCorrection("2021", "Entegra Coach", "Odyssey", "24B");
  assert.equal(od21!.horsepower, 350);
  assert.equal(od21!.fuelType, "Gas");
  const es21 = findPowertrainCorrection("2021", "Entegra Coach", "Esteem", "27U");
  assert.equal(es21!.horsepower, 350);
  const qw21 = findPowertrainCorrection("2021", "Entegra Coach", "Qwest", "24L");
  assert.equal(qw21!.horsepower, 188);
  const qw22 = findPowertrainCorrection("2022", "Entegra Coach", "Qwest", "24N");
  assert.equal(qw22!.horsepower, 188);
  assert.notEqual(qw22!.horsepower, 208);
  const ln22 = findPowertrainCorrection("2022", "Entegra Coach", "Launch", "19Y");
  assert.equal(ln22!.horsepower, 188);
  assert.match(ln22!.chassis || "", /4x4/);
  const et21 = findPowertrainCorrection("2021", "Entegra Coach", "Ethos", "20A");
  assert.equal(et21!.horsepower, 0);
  assert.equal(et21!.fuelType, "Gas");
  const et22 = findPowertrainCorrection("2022", "Entegra Coach", "Ethos", "20T");
  assert.equal(et22!.horsepower, 0);
  assert.equal(findPowertrainCorrection("2021", "Entegra Coach", "Expanse", "21B"), null);
  assert.equal(findPowertrainCorrection("2022", "Entegra Coach", "Expanse", "21B"), null);
});

test("Entegra 2019–2020 OEM year-first floorplans + powertrain pins", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);
  assert.equal(eg.Emblem?.yearStart, 2019);
  assert.equal(eg.Emblem?.years?.includes(2019), true);
  assert.equal(eg.Emblem?.years?.includes(2020), true);
  assert.equal(eg["Vision XL"]?.yearStart, 2020);
  assert.equal(eg["Vision XL"]?.years?.includes(2019), false);
  assert.equal(eg["Vision XL"]?.years?.includes(2020), true);
  assert.equal(eg.Accolade?.years?.includes(2019), false);
  assert.equal(eg.Accolade?.years?.includes(2020), true);
  assert.equal(eg["Accolade XL"]?.years?.includes(2019), false);
  assert.equal(eg["Accolade XL"]?.years?.includes(2020), false);
  assert.equal(eg["Reatta XL"]?.years?.includes(2019), false);
  assert.equal(eg["Reatta XL"]?.years?.includes(2020), true);
  assert.equal(eg["Accolade XT"]?.yearStart, 2023);
  assert.equal(eg["Accolade XT"]?.years?.includes(2019), false);
  assert.equal(eg["Accolade XT"]?.years?.includes(2020), false);
  assert.equal(eg.Expanse?.yearStart, 2023);
  assert.equal(eg.Launch?.yearStart, 2022);
  assert.equal(eg.Ethos?.yearStart, 2021);
  assert.equal(eg.Ethos?.years?.includes(2019), false);
  assert.equal(eg.Ethos?.years?.includes(2020), false);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);

  const cs = entegra.slice(entegra.indexOf('    "Cornerstone": {'), entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2019": \["45A", "45B", "45F", "45W", "45X", "45Y"\]/);
  assert.match(cs, /"2020": \["45A", "45B", "45F", "45W", "45X", "45Y"\]/);
  assert.doesNotMatch(cs, /"2019": \["45B", "45W", "45Z"\]/);
  assert.doesNotMatch(cs, /"2020": .*"45Z"/);

  const an = entegra.slice(entegra.indexOf('    "Anthem": {'), entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2019": \["42DEQ", "44A", "44B", "44F", "44W"\]/);
  assert.match(an, /"2020": \["42DEQ", "44A", "44B", "44F", "44W"\]/);
  assert.doesNotMatch(an, /"2019": .*"44D"/);
  assert.doesNotMatch(an, /"2020": .*"44D"/);

  const as = entegra.slice(entegra.indexOf('    "Aspire": {'), entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2019": \["38M", "40P", "42DEQ", "44B", "44R", "44W"\]/);
  assert.match(as, /"2020": \["38M", "40P", "42DEQ", "44B", "44F", "44R", "44W"\]/);
  assert.doesNotMatch(as, /"2019": .*"44F"/);
  assert.doesNotMatch(as, /"2019": \["38R"/);

  const re = entegra.slice(entegra.indexOf('    "Reatta": {'), entegra.indexOf('    "Reatta XL"'));
  assert.match(re, /"2019": \["37MB", "39BH", "39T2"\]/);
  assert.match(re, /"2020": \["37K", "39BH", "39T2"\]/);
  assert.doesNotMatch(re, /"2020": .*"37MB"/);
  assert.doesNotMatch(re, /"2019": .*"37K"/);

  const rxl = entegra.slice(entegra.indexOf('    "Reatta XL": {'), entegra.indexOf('    "Vision": {'));
  assert.match(rxl, /"2020": \["37K", "39BH", "39T2", "40Q2"\]/);
  assert.doesNotMatch(rxl, /"2019":/);

  const vi = entegra.slice(entegra.indexOf('    "Vision": {'), entegra.indexOf('    "Vision XL"'));
  assert.match(vi, /"2019": \["26X", "29F", "29S", "31R", "31V"\]/);
  assert.match(vi, /"2020": \["26X", "27A", "29F", "29S", "31V"\]/);
  assert.doesNotMatch(vi, /"2019": .*"27A"/);
  assert.doesNotMatch(vi, /"2020": .*"31R"/);

  const vxl = entegra.slice(entegra.indexOf('    "Vision XL": {'), entegra.indexOf('    "Accolade": {'));
  assert.match(vxl, /"2020": \["34B", "34G", "36A"\]/);
  assert.doesNotMatch(vxl, /"2019":/);
  assert.doesNotMatch(vxl, /"2020": .*"31UL"/);

  const ac = entegra.slice(entegra.indexOf('    "Accolade": {'), entegra.indexOf('    "Accolade XL"'));
  assert.match(ac, /"2020": \["37HJ", "37K", "37L", "37RB", "37TS"\]/);
  assert.doesNotMatch(ac, /"2019":/);
  assert.doesNotMatch(ac, /"2020": .*"37M"/);

  const axl = entegra.slice(entegra.indexOf('    "Accolade XL": {'), entegra.indexOf('    "Centurion": {'));
  assert.doesNotMatch(axl, /"2019":/);
  assert.doesNotMatch(axl, /"2020":/);

  const emb = entegra.slice(entegra.indexOf('    "Emblem": {'), entegra.indexOf('    "Vision SE"'));
  assert.match(emb, /"2019": \["36H", "36T", "36U"\]/);
  assert.match(emb, /"2020": \["36H", "36T", "36U"\]/);
  assert.doesNotMatch(emb, /"2019": .*"36B"/);
  assert.doesNotMatch(emb, /"2020": .*"36B"/);

  const od = entegra.slice(entegra.indexOf('    "Odyssey": {'), entegra.indexOf('    "Esteem": {'));
  assert.match(od, /"2019": \["22J", "24B", "25R", "26D", "29K", "29V", "30Z", "31F"\]/);
  assert.match(od, /"2020": \["24B", "25R", "26D", "29K", "29V", "30Z", "31F"\]/);
  assert.doesNotMatch(od, /"2019": .*"31L"/);
  assert.doesNotMatch(od, /"2020": .*"22J"/);

  const es = entegra.slice(entegra.indexOf('    "Esteem": {'), entegra.indexOf('    "Qwest": {'));
  assert.match(es, /"2019": \["26D", "29V", "30X", "31F"\]/);
  assert.match(es, /"2020": \["27U", "29V", "30X", "31F"\]/);
  assert.doesNotMatch(es, /"2019": .*"31L"/);
  assert.doesNotMatch(es, /"2020": .*"26D"/);

  const qw = entegra.slice(entegra.indexOf('    "Qwest": {'), entegra.indexOf('    "Cornerstone Reserve"'));
  assert.match(qw, /"2019": \["24A", "24K", "24L"\]/);
  assert.match(qw, /"2020": \["24A", "24K", "24L", "24R", "24T"\]/);

  const xt = entegra.slice(entegra.indexOf('    "Accolade XT": {'), entegra.indexOf('    "Esteem XL"'));
  assert.doesNotMatch(xt, /"2019":/);
  assert.doesNotMatch(xt, /"2020":/);

  const ln = entegra.slice(entegra.indexOf('    "Launch": {'), entegra.indexOf('    "Ethos": {'));
  assert.doesNotMatch(ln, /"2019":/);
  assert.doesNotMatch(ln, /"2020":/);

  const et = entegra.slice(entegra.indexOf('    "Ethos": {'), entegra.indexOf('    "Insignia": {'));
  assert.doesNotMatch(et, /"2019":/);
  assert.doesNotMatch(et, /"2020":/);

  const ex = entegra.slice(entegra.indexOf('    "Expanse": {'), entegra.indexOf('    "Odyssey": {'));
  assert.doesNotMatch(ex, /"2019":/);
  assert.doesNotMatch(ex, /"2020":/);

  const cs19 = findPowertrainCorrection("2019", "Entegra Coach", "Cornerstone", "45B");
  assert.equal(cs19!.horsepower, 605);
  assert.equal(cs19!.torqueLbFt, 1950);
  assert.match(cs19!.chassis || "", /K3/);
  const an19 = findPowertrainCorrection("2019", "Entegra Coach", "Anthem", "44B");
  assert.equal(an19!.horsepower, 450);
  assert.equal(an19!.torqueLbFt, 1250);
  assert.match(an19!.chassis || "", /K2/);
  assert.doesNotMatch(an19!.engine, /X12/);
  const an20 = findPowertrainCorrection("2020", "Entegra Coach", "Anthem", "44A");
  assert.equal(an20!.horsepower, 450);
  assert.doesNotMatch(an20!.engine, /X12/);
  const as19 = findPowertrainCorrection("2019", "Entegra Coach", "Aspire", "40P");
  assert.equal(as19!.horsepower, 450);
  const re19 = findPowertrainCorrection("2019", "Entegra Coach", "Reatta", "37MB");
  assert.equal(re19!.horsepower, 360);
  assert.match(re19!.engine, /B6\.7/);
  const rxl19 = findPowertrainCorrection("2019", "Entegra Coach", "Reatta XL", "37K");
  assert.equal(rxl19, null);
  const rxl20 = findPowertrainCorrection("2020", "Entegra Coach", "Reatta XL", "40Q2");
  assert.equal(rxl20!.horsepower, 380);
  assert.equal(rxl20!.torqueLbFt, 1150);
  assert.match(rxl20!.engine, /L9/);
  const vis19 = findPowertrainCorrection("2019", "Entegra Coach", "Vision", "29S");
  assert.equal(vis19!.horsepower, 320);
  assert.equal(vis19!.fuelType, "Gas");
  assert.match(vis19!.engine, /6\.8|Triton/);
  const vis20 = findPowertrainCorrection("2020", "Entegra Coach", "Vision", "27A");
  assert.equal(vis20!.horsepower, 0);
  assert.equal(vis20!.fuelType, "Gas");
  const vxl19 = findPowertrainCorrection("2019", "Entegra Coach", "Vision XL", "34B");
  assert.equal(vxl19, null);
  const vxl20 = findPowertrainCorrection("2020", "Entegra Coach", "Vision XL", "34B");
  assert.equal(vxl20!.horsepower, 0);
  assert.equal(vxl20!.fuelType, "Gas");
  const emb19 = findPowertrainCorrection("2019", "Entegra Coach", "Emblem", "36H");
  assert.equal(emb19!.horsepower, 320);
  assert.equal(emb19!.fuelType, "Gas");
  const emb20 = findPowertrainCorrection("2020", "Entegra Coach", "Emblem", "36H");
  assert.equal(emb20!.horsepower, 0);
  const acc19 = findPowertrainCorrection("2019", "Entegra Coach", "Accolade", "37K");
  assert.equal(acc19, null);
  const acc20 = findPowertrainCorrection("2020", "Entegra Coach", "Accolade", "37K");
  assert.equal(acc20!.horsepower, 360);
  assert.match(acc20!.chassis || "", /S2RV/);
  assert.doesNotMatch(acc20!.chassis || "", /Plus/);
  assert.equal(findPowertrainCorrection("2020", "Entegra Coach", "Accolade XL", "37K"), null);
  assert.equal(findPowertrainCorrection("2019", "Entegra Coach", "Accolade XT", "32U"), null);
  const od19 = findPowertrainCorrection("2019", "Entegra Coach", "Odyssey", "24B");
  assert.equal(od19!.horsepower, 305);
  assert.equal(od19!.fuelType, "Gas");
  const od20 = findPowertrainCorrection("2020", "Entegra Coach", "Odyssey", "24B");
  assert.equal(od20!.horsepower, 0);
  const es19 = findPowertrainCorrection("2019", "Entegra Coach", "Esteem", "29V");
  assert.equal(es19!.horsepower, 305);
  const es20 = findPowertrainCorrection("2020", "Entegra Coach", "Esteem", "27U");
  assert.equal(es20!.horsepower, 0);
  const qw19 = findPowertrainCorrection("2019", "Entegra Coach", "Qwest", "24L");
  assert.equal(qw19!.horsepower, 188);
  assert.match(qw19!.transmission || "", /5-speed/);
  const qw20 = findPowertrainCorrection("2020", "Entegra Coach", "Qwest", "24T");
  assert.equal(qw20!.horsepower, 188);
  assert.match(qw20!.transmission || "", /7-speed/);
  assert.equal(findPowertrainCorrection("2019", "Entegra Coach", "Expanse", "21B"), null);
  assert.equal(findPowertrainCorrection("2020", "Entegra Coach", "Launch", "19Y"), null);
  assert.equal(findPowertrainCorrection("2020", "Entegra Coach", "Ethos", "20A"), null);
});

test("Entegra 2017–2018 OEM year-first floorplans + powertrain pins", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);
  assert.equal(eg.Cornerstone?.years?.includes(2017), true);
  assert.equal(eg.Cornerstone?.years?.includes(2018), true);
  assert.equal(eg.Anthem?.years?.includes(2017), true);
  assert.equal(eg.Aspire?.years?.includes(2017), true);
  assert.equal(eg.Reatta?.years?.includes(2016), false);
  assert.equal(eg.Reatta?.years?.includes(2017), false);
  assert.equal(eg.Reatta?.years?.includes(2018), false);
  assert.equal(eg.Reatta?.years?.includes(2019), true);
  assert.equal(eg.Reatta?.yearStart, 2019);
  assert.equal(eg["Reatta XL"]?.yearStart, 2020);
  assert.equal(eg["Reatta XL"]?.years?.includes(2017), false);
  assert.equal(eg["Reatta XL"]?.years?.includes(2018), false);
  assert.equal(eg.Vision?.years?.includes(2016), false);
  assert.equal(eg.Vision?.years?.includes(2017), false);
  assert.equal(eg.Vision?.years?.includes(2018), false);
  assert.equal(eg["Vision XL"]?.yearStart, 2020);
  assert.equal(eg["Vision XL"]?.years?.includes(2017), false);
  assert.equal(eg["Vision XL"]?.years?.includes(2018), false);
  assert.equal(eg.Emblem?.yearStart, 2019);
  assert.equal(eg.Emblem?.years?.includes(2017), false);
  assert.equal(eg.Emblem?.years?.includes(2018), false);
  assert.equal(eg.Accolade?.years?.includes(2016), false);
  assert.equal(eg.Accolade?.years?.includes(2017), false);
  assert.equal(eg.Accolade?.years?.includes(2018), false);
  assert.equal(eg.Accolade?.yearStart, 2020);
  assert.equal(eg["Accolade XL"]?.yearStart, 2021);
  assert.equal(eg["Accolade XL"]?.years?.includes(2018), false);
  assert.equal(eg.Odyssey?.yearStart, 2018);
  assert.equal(eg.Odyssey?.years?.includes(2017), false);
  assert.equal(eg.Odyssey?.years?.includes(2018), true);
  assert.equal(eg.Esteem?.years?.includes(2016), false);
  assert.equal(eg.Esteem?.years?.includes(2017), false);
  assert.equal(eg.Esteem?.years?.includes(2018), true);
  assert.equal(eg.Qwest?.years?.includes(2016), false);
  assert.equal(eg.Qwest?.years?.includes(2017), false);
  assert.equal(eg.Qwest?.years?.includes(2018), true);
  assert.equal(eg.Qwest?.yearStart, 2018);
  assert.equal(eg.Insignia?.yearStart, 2026);
  assert.equal(eg.Insignia?.years?.includes(2017), false);
  assert.equal(eg.Insignia?.years?.includes(2018), false);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);

  const cs = entegra.slice(entegra.indexOf('    "Cornerstone": {'), entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2017": \["45A", "45B", "45J", "45K", "45W"\]/);
  assert.match(cs, /"2018": \["45A", "45B", "45F", "45W", "45X", "45Y"\]/);
  assert.doesNotMatch(cs, /"2017": \["45B", "45W", "45Z"\]/);
  assert.doesNotMatch(cs, /"2017": .*"45F"/);
  assert.doesNotMatch(cs, /"2018": .*"45J"/);
  assert.doesNotMatch(cs, /"2018": .*"45Z"/);

  const an = entegra.slice(entegra.indexOf('    "Anthem": {'), entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2017": \["42DEQ", "42RBQ", "44A", "44B", "44DLQ"\]/);
  assert.match(an, /"2018": \["42DEQ", "42RBQ", "44A", "44B", "44F", "44W"\]/);
  assert.doesNotMatch(an, /"2017": .*"44F"/);
  assert.doesNotMatch(an, /"2017": .*"44W"/);

  const as = entegra.slice(entegra.indexOf('    "Aspire": {'), entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2017": \["38M", "40P", "42DEQ", "42RBQ", "44B", "44R", "44U", "44W"\]/);
  assert.match(as, /"2018": \["38M", "40P", "42DEQ", "42RBQ", "44B", "44R", "44U", "44W"\]/);
  assert.doesNotMatch(as, /"2017": \["38R"/);
  assert.doesNotMatch(as, /"2018": \["38R"/);

  const re = entegra.slice(entegra.indexOf('    "Reatta": {'), entegra.indexOf('    "Reatta XL"'));
  assert.doesNotMatch(re, /"2016":/);
  assert.doesNotMatch(re, /"2017":/);
  assert.doesNotMatch(re, /"2018":/);

  const rxl = entegra.slice(entegra.indexOf('    "Reatta XL": {'), entegra.indexOf('    "Vision": {'));
  assert.doesNotMatch(rxl, /"2017":/);
  assert.doesNotMatch(rxl, /"2018":/);
  assert.doesNotMatch(rxl, /"2019":/);

  const vi = entegra.slice(entegra.indexOf('    "Vision": {'), entegra.indexOf('    "Vision XL"'));
  assert.doesNotMatch(vi, /"2016":/);
  assert.doesNotMatch(vi, /"2017":/);
  assert.doesNotMatch(vi, /"2018":/);

  const vxl = entegra.slice(entegra.indexOf('    "Vision XL": {'), entegra.indexOf('    "Accolade": {'));
  assert.doesNotMatch(vxl, /"2017":/);
  assert.doesNotMatch(vxl, /"2018":/);

  const ac = entegra.slice(entegra.indexOf('    "Accolade": {'), entegra.indexOf('    "Accolade XL"'));
  assert.doesNotMatch(ac, /"2016":/);
  assert.doesNotMatch(ac, /"2017":/);
  assert.doesNotMatch(ac, /"2018":/);

  const axl = entegra.slice(entegra.indexOf('    "Accolade XL": {'), entegra.indexOf('    "Centurion": {'));
  assert.doesNotMatch(axl, /"2017":/);
  assert.doesNotMatch(axl, /"2018":/);

  const emb = entegra.slice(entegra.indexOf('    "Emblem": {'), entegra.indexOf('    "Vision SE"'));
  assert.doesNotMatch(emb, /"2017":/);
  assert.doesNotMatch(emb, /"2018":/);

  const od = entegra.slice(entegra.indexOf('    "Odyssey": {'), entegra.indexOf('    "Esteem": {'));
  assert.match(od, /"2018": \["22J", "26D", "29V", "31L"\]/);
  assert.doesNotMatch(od, /"2017":/);
  assert.doesNotMatch(od, /"2018": \["24A"/);

  const es = entegra.slice(entegra.indexOf('    "Esteem": {'), entegra.indexOf('    "Qwest": {'));
  assert.match(es, /"2018": \["29V", "30X", "31L"\]/);
  assert.doesNotMatch(es, /"2017":/);
  assert.doesNotMatch(es, /"2018": \["26U"/);

  const qw = entegra.slice(entegra.indexOf('    "Qwest": {'), entegra.indexOf('    "Cornerstone Reserve"'));
  assert.match(qw, /"2018": \["24K", "24L"\]/);
  assert.doesNotMatch(qw, /"2017":/);
  assert.doesNotMatch(qw, /"2018": .*"24R"/);

  const cs17 = findPowertrainCorrection("2017", "Entegra Coach", "Cornerstone", "45B");
  assert.equal(cs17!.horsepower, 600);
  assert.equal(cs17!.torqueLbFt, 1950);
  assert.match(cs17!.engine, /ISX/);
  assert.doesNotMatch(cs17!.engine, /X15/);
  const cs18 = findPowertrainCorrection("2018", "Entegra Coach", "Cornerstone", "45A");
  assert.equal(cs18!.horsepower, 605);
  assert.equal(cs18!.torqueLbFt, 1950);
  assert.match(cs18!.engine, /ISX/);
  assert.doesNotMatch(cs18!.engine, /X15/);
  const an17 = findPowertrainCorrection("2017", "Entegra Coach", "Anthem", "44B");
  assert.equal(an17!.horsepower, 450);
  assert.equal(an17!.torqueLbFt, 1250);
  assert.match(an17!.engine, /ISL/);
  assert.doesNotMatch(an17!.engine, /L9/);
  const an18 = findPowertrainCorrection("2018", "Entegra Coach", "Anthem", "44W");
  assert.equal(an18!.horsepower, 450);
  assert.match(an18!.engine, /ISL/);
  const as17 = findPowertrainCorrection("2017", "Entegra Coach", "Aspire", "38M");
  assert.equal(as17!.horsepower, 450);
  assert.match(as17!.engine, /ISL/);
  assert.doesNotMatch(as17!.engine, /L9/);
  const as18 = findPowertrainCorrection("2018", "Entegra Coach", "Aspire", "40P");
  assert.equal(as18!.horsepower, 450);
  assert.match(as18!.engine, /ISL/);
  assert.equal(findPowertrainCorrection("2017", "Entegra Coach", "Reatta", "37K"), null);
  assert.equal(findPowertrainCorrection("2018", "Entegra Coach", "Reatta", "37K"), null);
  assert.equal(findPowertrainCorrection("2018", "Entegra Coach", "Reatta XL", "37K"), null);
  assert.equal(findPowertrainCorrection("2017", "Entegra Coach", "Vision", "27A"), null);
  assert.equal(findPowertrainCorrection("2018", "Entegra Coach", "Vision", "27A"), null);
  assert.equal(findPowertrainCorrection("2017", "Entegra Coach", "Vision XL", "34B"), null);
  assert.equal(findPowertrainCorrection("2018", "Entegra Coach", "Emblem", "36H"), null);
  assert.equal(findPowertrainCorrection("2017", "Entegra Coach", "Accolade", "37L"), null);
  assert.equal(findPowertrainCorrection("2018", "Entegra Coach", "Accolade", "37L"), null);
  assert.equal(findPowertrainCorrection("2018", "Entegra Coach", "Accolade XL", "37K"), null);
  const od18 = findPowertrainCorrection("2018", "Entegra Coach", "Odyssey", "31L");
  assert.equal(od18!.horsepower, 305);
  assert.equal(od18!.torqueLbFt, 420);
  assert.equal(od18!.fuelType, "Gas");
  assert.equal(findPowertrainCorrection("2017", "Entegra Coach", "Odyssey", "22J"), null);
  const es18 = findPowertrainCorrection("2018", "Entegra Coach", "Esteem", "29V");
  assert.equal(es18!.horsepower, 305);
  assert.equal(es18!.torqueLbFt, 420);
  assert.equal(findPowertrainCorrection("2017", "Entegra Coach", "Esteem", "29V"), null);
  const qw18 = findPowertrainCorrection("2018", "Entegra Coach", "Qwest", "24L");
  assert.equal(qw18!.horsepower, 188);
  assert.equal(qw18!.torqueLbFt, 325);
  assert.match(qw18!.transmission || "", /5-speed/);
  assert.equal(findPowertrainCorrection("2017", "Entegra Coach", "Qwest", "24L"), null);
});

test("Entegra 2015–2016 OEM year-first floorplans + powertrain pins", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);
  assert.equal(eg.Cornerstone?.years?.includes(2015), true);
  assert.equal(eg.Cornerstone?.years?.includes(2016), true);
  assert.equal(eg.Anthem?.years?.includes(2015), true);
  assert.equal(eg.Aspire?.years?.includes(2015), true);
  assert.equal(eg.Aspire?.yearStart, 2010);
  assert.equal(eg.Reatta?.years?.includes(2015), false);
  assert.equal(eg.Reatta?.years?.includes(2016), false);
  assert.equal(eg.Reatta?.yearStart, 2019);
  assert.equal(eg["Reatta XL"]?.yearStart, 2020);
  assert.equal(eg["Reatta XL"]?.years?.includes(2015), false);
  assert.equal(eg["Reatta XL"]?.years?.includes(2016), false);
  assert.equal(eg.Vision?.years?.includes(2014), false);
  assert.equal(eg.Vision?.years?.includes(2015), false);
  assert.equal(eg.Vision?.years?.includes(2016), false);
  assert.equal(eg.Vision?.yearStart, 2019);
  assert.equal(eg["Vision XL"]?.yearStart, 2020);
  assert.equal(eg["Vision XL"]?.years?.includes(2015), false);
  assert.equal(eg["Vision XL"]?.years?.includes(2016), false);
  assert.equal(eg.Emblem?.yearStart, 2019);
  assert.equal(eg.Emblem?.years?.includes(2015), false);
  assert.equal(eg.Emblem?.years?.includes(2016), false);
  assert.equal(eg.Accolade?.years?.includes(2015), false);
  assert.equal(eg.Accolade?.years?.includes(2016), false);
  assert.equal(eg.Accolade?.yearStart, 2020);
  assert.equal(eg["Accolade XL"]?.yearStart, 2021);
  assert.equal(eg.Odyssey?.yearStart, 2018);
  assert.equal(eg.Odyssey?.years?.includes(2015), false);
  assert.equal(eg.Odyssey?.years?.includes(2016), false);
  assert.equal(eg.Esteem?.years?.includes(2014), false);
  assert.equal(eg.Esteem?.years?.includes(2015), false);
  assert.equal(eg.Esteem?.years?.includes(2016), false);
  assert.equal(eg.Esteem?.yearStart, 2018);
  assert.equal(eg.Qwest?.yearStart, 2018);
  assert.equal(eg.Qwest?.years?.includes(2015), false);
  assert.equal(eg.Qwest?.years?.includes(2016), false);
  assert.equal(eg.Insignia?.yearStart, 2026);
  assert.equal(eg.Insignia?.years?.includes(2015), false);
  assert.equal(eg.Insignia?.years?.includes(2016), false);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);

  const cs = entegra.slice(entegra.indexOf('    "Cornerstone": {'), entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2015": \["45B", "45J", "45K"\]/);
  assert.match(cs, /"2016": \["45A", "45B", "45J", "45K"\]/);
  assert.doesNotMatch(cs, /"2015": \["45B", "45W", "45Z"\]/);
  assert.doesNotMatch(cs, /"2015": .*"45A"/);
  assert.doesNotMatch(cs, /"2016": .*"45W"/);
  assert.doesNotMatch(cs, /"2016": .*"45Z"/);

  const an = entegra.slice(entegra.indexOf('    "Anthem": {'), entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2015": \["42DEQ", "42DLQ", "42RBQ", "44B", "44DLQ", "44L", "44SL"\]/);
  assert.match(an, /"2016": \["42DEQ", "42RBQ", "44A", "44B", "44DLQ"\]/);
  assert.doesNotMatch(an, /"2015": .*"44F"/);
  assert.doesNotMatch(an, /"2016": .*"44L"/);
  assert.doesNotMatch(an, /"2016": .*"44SL"/);
  assert.doesNotMatch(an, /"2015": \["42DEQ", "44B", "44W"\]/);

  const as = entegra.slice(entegra.indexOf('    "Aspire": {'), entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2015": \["39E", "42DEQ", "42DLQ", "42RBQ", "44B", "44U"\]/);
  assert.match(as, /"2016": \["38M", "40P", "42DEQ", "42RBQ", "44B", "44R", "44U"\]/);
  assert.doesNotMatch(as, /"2015": \["38R"/);
  assert.doesNotMatch(as, /"2016": \["38R"/);
  assert.doesNotMatch(as, /"2015": .*"44R"/);
  assert.doesNotMatch(as, /"2016": .*"44W"/);
  assert.doesNotMatch(as, /"2016": .*"39S"/);

  const re = entegra.slice(entegra.indexOf('    "Reatta": {'), entegra.indexOf('    "Reatta XL"'));
  assert.doesNotMatch(re, /"2015":/);
  assert.doesNotMatch(re, /"2016":/);

  const rxl = entegra.slice(entegra.indexOf('    "Reatta XL": {'), entegra.indexOf('    "Vision": {'));
  assert.doesNotMatch(rxl, /"2015":/);
  assert.doesNotMatch(rxl, /"2016":/);

  const vi = entegra.slice(entegra.indexOf('    "Vision": {'), entegra.indexOf('    "Vision XL"'));
  assert.doesNotMatch(vi, /"2015":/);
  assert.doesNotMatch(vi, /"2016":/);

  const vxl = entegra.slice(entegra.indexOf('    "Vision XL": {'), entegra.indexOf('    "Accolade": {'));
  assert.doesNotMatch(vxl, /"2015":/);
  assert.doesNotMatch(vxl, /"2016":/);

  const ac = entegra.slice(entegra.indexOf('    "Accolade": {'), entegra.indexOf('    "Accolade XL"'));
  assert.doesNotMatch(ac, /"2015":/);
  assert.doesNotMatch(ac, /"2016":/);

  const axl = entegra.slice(entegra.indexOf('    "Accolade XL": {'), entegra.indexOf('    "Centurion": {'));
  assert.doesNotMatch(axl, /"2015":/);
  assert.doesNotMatch(axl, /"2016":/);

  const emb = entegra.slice(entegra.indexOf('    "Emblem": {'), entegra.indexOf('    "Vision SE"'));
  assert.doesNotMatch(emb, /"2015":/);
  assert.doesNotMatch(emb, /"2016":/);

  const od = entegra.slice(entegra.indexOf('    "Odyssey": {'), entegra.indexOf('    "Esteem": {'));
  assert.doesNotMatch(od, /"2015":/);
  assert.doesNotMatch(od, /"2016":/);

  const es = entegra.slice(entegra.indexOf('    "Esteem": {'), entegra.indexOf('    "Qwest": {'));
  assert.doesNotMatch(es, /"2015":/);
  assert.doesNotMatch(es, /"2016":/);

  const qw = entegra.slice(entegra.indexOf('    "Qwest": {'), entegra.indexOf('    "Cornerstone Reserve"'));
  assert.doesNotMatch(qw, /"2015":/);
  assert.doesNotMatch(qw, /"2016":/);

  const cs15 = findPowertrainCorrection("2015", "Entegra Coach", "Cornerstone", "45B");
  assert.equal(cs15!.horsepower, 600);
  assert.equal(cs15!.torqueLbFt, 1950);
  assert.match(cs15!.engine, /ISX/);
  assert.doesNotMatch(cs15!.engine, /X15/);
  assert.match(cs15!.chassis || "", /K3/);
  const cs16 = findPowertrainCorrection("2016", "Entegra Coach", "Cornerstone", "45A");
  assert.equal(cs16!.horsepower, 600);
  assert.equal(cs16!.torqueLbFt, 1950);
  assert.match(cs16!.engine, /ISX/);
  assert.doesNotMatch(cs16!.engine, /X15|605/);
  const an15 = findPowertrainCorrection("2015", "Entegra Coach", "Anthem", "44B");
  assert.equal(an15!.horsepower, 450);
  assert.equal(an15!.torqueLbFt, 1250);
  assert.match(an15!.engine, /ISL/);
  assert.doesNotMatch(an15!.engine, /L9/);
  assert.match(an15!.chassis || "", /Mountain Master/);
  assert.doesNotMatch(an15!.chassis || "", /K2/);
  const an16 = findPowertrainCorrection("2016", "Entegra Coach", "Anthem", "44A");
  assert.equal(an16!.horsepower, 450);
  assert.match(an16!.engine, /ISL/);
  assert.doesNotMatch(an16!.chassis || "", /K2/);
  const as15 = findPowertrainCorrection("2015", "Entegra Coach", "Aspire", "44U");
  assert.equal(as15!.horsepower, 450);
  assert.match(as15!.engine, /ISL/);
  assert.doesNotMatch(as15!.engine, /L9/);
  const as16 = findPowertrainCorrection("2016", "Entegra Coach", "Aspire", "38M");
  assert.equal(as16!.horsepower, 450);
  assert.match(as16!.engine, /ISL/);
  assert.doesNotMatch(as16!.engine, /L9/);
  assert.equal(findPowertrainCorrection("2015", "Entegra Coach", "Reatta", "37K"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Reatta", "37K"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Reatta XL", "37K"), null);
  assert.equal(findPowertrainCorrection("2015", "Entegra Coach", "Vision", "27A"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Vision", "27A"), null);
  assert.equal(findPowertrainCorrection("2015", "Entegra Coach", "Vision XL", "34B"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Emblem", "36H"), null);
  assert.equal(findPowertrainCorrection("2015", "Entegra Coach", "Accolade", "37L"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Accolade", "37L"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Accolade XL", "37K"), null);
  assert.equal(findPowertrainCorrection("2015", "Entegra Coach", "Odyssey", "22J"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Odyssey", "22J"), null);
  assert.equal(findPowertrainCorrection("2015", "Entegra Coach", "Esteem", "29V"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Esteem", "29V"), null);
  assert.equal(findPowertrainCorrection("2015", "Entegra Coach", "Qwest", "24L"), null);
  assert.equal(findPowertrainCorrection("2016", "Entegra Coach", "Qwest", "24L"), null);
});

test("Entegra 2013–2014 OEM year-first floorplans + powertrain pins", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);
  assert.equal(eg.Cornerstone?.years?.includes(2013), true);
  assert.equal(eg.Cornerstone?.years?.includes(2014), true);
  assert.equal(eg.Cornerstone?.yearStart, 2010);
  assert.equal(eg.Anthem?.years?.includes(2013), true);
  assert.equal(eg.Anthem?.years?.includes(2014), true);
  assert.equal(eg.Anthem?.yearStart, 2010);
  assert.equal(eg.Aspire?.years?.includes(2013), true);
  assert.equal(eg.Aspire?.years?.includes(2014), true);
  assert.equal(eg.Aspire?.yearStart, 2010);
  assert.equal(eg.Reatta?.years?.includes(2013), false);
  assert.equal(eg.Reatta?.years?.includes(2014), false);
  assert.equal(eg.Reatta?.yearStart, 2019);
  assert.equal(eg["Reatta XL"]?.yearStart, 2020);
  assert.equal(eg["Reatta XL"]?.years?.includes(2013), false);
  assert.equal(eg["Reatta XL"]?.years?.includes(2014), false);
  assert.equal(eg.Vision?.years?.includes(2013), false);
  assert.equal(eg.Vision?.years?.includes(2014), false);
  assert.equal(eg.Vision?.yearStart, 2019);
  assert.equal(eg["Vision XL"]?.yearStart, 2020);
  assert.equal(eg["Vision XL"]?.years?.includes(2013), false);
  assert.equal(eg["Vision XL"]?.years?.includes(2014), false);
  assert.equal(eg.Emblem?.yearStart, 2019);
  assert.equal(eg.Emblem?.years?.includes(2013), false);
  assert.equal(eg.Emblem?.years?.includes(2014), false);
  assert.equal(eg.Accolade?.years?.includes(2013), false);
  assert.equal(eg.Accolade?.years?.includes(2014), false);
  assert.equal(eg.Accolade?.yearStart, 2020);
  assert.equal(eg["Accolade XL"]?.yearStart, 2021);
  assert.equal(eg.Odyssey?.yearStart, 2018);
  assert.equal(eg.Odyssey?.years?.includes(2013), false);
  assert.equal(eg.Odyssey?.years?.includes(2014), false);
  assert.equal(eg.Esteem?.years?.includes(2013), false);
  assert.equal(eg.Esteem?.years?.includes(2014), false);
  assert.equal(eg.Esteem?.yearStart, 2018);
  assert.equal(eg.Qwest?.yearStart, 2018);
  assert.equal(eg.Qwest?.years?.includes(2013), false);
  assert.equal(eg.Qwest?.years?.includes(2014), false);
  assert.equal(eg.Insignia?.yearStart, 2026);
  assert.equal(eg.Insignia?.years?.includes(2013), false);
  assert.equal(eg.Insignia?.years?.includes(2014), false);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);

  const cs = entegra.slice(entegra.indexOf('    "Cornerstone": {'), entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2013": \["45J", "45K"\]/);
  assert.match(cs, /"2014": \["45B", "45J", "45K"\]/);
  assert.doesNotMatch(cs, /"2013": .*"45B"/);
  assert.doesNotMatch(cs, /"2014": \["45B", "45W", "45Z"\]/);
  assert.doesNotMatch(cs, /"2014": .*"45W"/);
  assert.doesNotMatch(cs, /"2014": .*"45Z"/);

  const an = entegra.slice(entegra.indexOf('    "Anthem": {'), entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2013": \["42DEQ", "42DLQ", "42RBQ", "44DLQ", "44SL"\]/);
  assert.match(an, /"2014": \["42DEQ", "42DLQ", "42RBQ", "44B", "44DLQ", "44SL"\]/);
  assert.doesNotMatch(an, /"2013": .*"44B"/);
  assert.doesNotMatch(an, /"2014": \["42DEQ", "44B", "44W"\]/);
  assert.doesNotMatch(an, /"2014": .*"44W"/);
  assert.doesNotMatch(an, /"2014": .*"44F"/);
  assert.doesNotMatch(an, /"2014": .*"44L"/);

  const as = entegra.slice(entegra.indexOf('    "Aspire": {'), entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2013": \["42DEQ", "42DLQ", "42RBQ"\]/);
  assert.match(as, /"2014": \["39E", "42DEQ", "42DLQ", "42RBQ", "44B", "44U"\]/);
  assert.doesNotMatch(as, /"2013": .*"39E"/);
  assert.doesNotMatch(as, /"2013": .*"44B"/);
  assert.doesNotMatch(as, /"2013": .*"44U"/);
  assert.doesNotMatch(as, /"2014": \["38R"/);

  const re = entegra.slice(entegra.indexOf('    "Reatta": {'), entegra.indexOf('    "Reatta XL"'));
  assert.doesNotMatch(re, /"2013":/);
  assert.doesNotMatch(re, /"2014":/);

  const rxl = entegra.slice(entegra.indexOf('    "Reatta XL": {'), entegra.indexOf('    "Vision": {'));
  assert.doesNotMatch(rxl, /"2013":/);
  assert.doesNotMatch(rxl, /"2014":/);

  const vi = entegra.slice(entegra.indexOf('    "Vision": {'), entegra.indexOf('    "Vision XL"'));
  assert.doesNotMatch(vi, /"2013":/);
  assert.doesNotMatch(vi, /"2014":/);

  const vxl = entegra.slice(entegra.indexOf('    "Vision XL": {'), entegra.indexOf('    "Accolade": {'));
  assert.doesNotMatch(vxl, /"2013":/);
  assert.doesNotMatch(vxl, /"2014":/);

  const ac = entegra.slice(entegra.indexOf('    "Accolade": {'), entegra.indexOf('    "Accolade XL"'));
  assert.doesNotMatch(ac, /"2013":/);
  assert.doesNotMatch(ac, /"2014":/);

  const axl = entegra.slice(entegra.indexOf('    "Accolade XL": {'), entegra.indexOf('    "Centurion": {'));
  assert.doesNotMatch(axl, /"2013":/);
  assert.doesNotMatch(axl, /"2014":/);

  const emb = entegra.slice(entegra.indexOf('    "Emblem": {'), entegra.indexOf('    "Vision SE"'));
  assert.doesNotMatch(emb, /"2013":/);
  assert.doesNotMatch(emb, /"2014":/);

  const od = entegra.slice(entegra.indexOf('    "Odyssey": {'), entegra.indexOf('    "Esteem": {'));
  assert.doesNotMatch(od, /"2013":/);
  assert.doesNotMatch(od, /"2014":/);

  const es = entegra.slice(entegra.indexOf('    "Esteem": {'), entegra.indexOf('    "Qwest": {'));
  assert.doesNotMatch(es, /"2013":/);
  assert.doesNotMatch(es, /"2014":/);

  const qw = entegra.slice(entegra.indexOf('    "Qwest": {'), entegra.indexOf('    "Cornerstone Reserve"'));
  assert.doesNotMatch(qw, /"2013":/);
  assert.doesNotMatch(qw, /"2014":/);

  const cs13 = findPowertrainCorrection("2013", "Entegra Coach", "Cornerstone", "45J");
  assert.equal(cs13!.horsepower, 600);
  assert.equal(cs13!.torqueLbFt, 1950);
  assert.match(cs13!.engine, /ISX/);
  assert.doesNotMatch(cs13!.engine, /X15|605/);
  assert.match(cs13!.chassis || "", /K3/);
  assert.doesNotMatch(cs13!.chassis || "", /Raised Rail/);
  const cs14 = findPowertrainCorrection("2014", "Entegra Coach", "Cornerstone", "45B");
  assert.equal(cs14!.horsepower, 600);
  assert.equal(cs14!.torqueLbFt, 1950);
  assert.match(cs14!.engine, /ISX/);
  assert.doesNotMatch(cs14!.engine, /X15|605/);
  assert.match(cs14!.chassis || "", /K3/);
  assert.match(cs14!.chassis || "", /Raised Rail/);
  const an13 = findPowertrainCorrection("2013", "Entegra Coach", "Anthem", "42DEQ");
  assert.equal(an13!.horsepower, 450);
  assert.equal(an13!.torqueLbFt, 1250);
  assert.match(an13!.engine, /ISL/);
  assert.doesNotMatch(an13!.engine, /L9/);
  assert.match(an13!.chassis || "", /Mountain Master/);
  assert.doesNotMatch(an13!.chassis || "", /K2|Raised Rail/);
  const an14 = findPowertrainCorrection("2014", "Entegra Coach", "Anthem", "44B");
  assert.equal(an14!.horsepower, 450);
  assert.match(an14!.engine, /ISL/);
  assert.doesNotMatch(an14!.engine, /L9/);
  assert.match(an14!.chassis || "", /Mountain Master/);
  assert.match(an14!.chassis || "", /Raised Rail/);
  assert.doesNotMatch(an14!.chassis || "", /K2/);
  const as13 = findPowertrainCorrection("2013", "Entegra Coach", "Aspire", "42DEQ");
  assert.equal(as13!.horsepower, 450);
  assert.match(as13!.engine, /ISL/);
  assert.doesNotMatch(as13!.engine, /L9/);
  const as14 = findPowertrainCorrection("2014", "Entegra Coach", "Aspire", "39E");
  assert.equal(as14!.horsepower, 450);
  assert.match(as14!.engine, /ISL/);
  assert.doesNotMatch(as14!.engine, /L9/);
  assert.match(as14!.chassis || "", /Raised Rail/);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Reatta", "37K"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Reatta", "37K"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Reatta XL", "37K"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Reatta XL", "37K"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Vision", "27A"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Vision", "27A"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Vision XL", "34B"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Vision XL", "34B"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Emblem", "36H"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Emblem", "36H"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Accolade", "37L"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Accolade", "37L"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Accolade XL", "37K"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Odyssey", "22J"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Odyssey", "22J"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Esteem", "29V"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Esteem", "29V"), null);
  assert.equal(findPowertrainCorrection("2013", "Entegra Coach", "Qwest", "24L"), null);
  assert.equal(findPowertrainCorrection("2014", "Entegra Coach", "Qwest", "24L"), null);
});

test("Entegra 2010–2012 OEM year-first floorplans + powertrain pins", () => {
  const eg = CATALOG_INDEX["Entegra Coach"];
  assert.ok(eg);
  assert.equal(eg.Cornerstone?.years?.includes(2010), true);
  assert.equal(eg.Cornerstone?.years?.includes(2011), true);
  assert.equal(eg.Cornerstone?.years?.includes(2012), true);
  assert.equal(eg.Cornerstone?.years?.includes(2009), false);
  assert.equal(eg.Cornerstone?.yearStart, 2010);
  assert.equal(eg.Anthem?.years?.includes(2010), true);
  assert.equal(eg.Anthem?.years?.includes(2011), true);
  assert.equal(eg.Anthem?.years?.includes(2012), true);
  assert.equal(eg.Anthem?.years?.includes(2009), false);
  assert.equal(eg.Anthem?.yearStart, 2010);
  assert.equal(eg.Aspire?.years?.includes(2010), true);
  assert.equal(eg.Aspire?.years?.includes(2011), true);
  assert.equal(eg.Aspire?.years?.includes(2012), true);
  assert.equal(eg.Aspire?.years?.includes(2009), false);
  assert.equal(eg.Aspire?.yearStart, 2010);
  assert.equal(eg.Reatta?.yearStart, 2019);
  assert.equal(eg.Reatta?.years?.includes(2010), false);
  assert.equal(eg.Reatta?.years?.includes(2011), false);
  assert.equal(eg.Reatta?.years?.includes(2012), false);
  assert.equal(eg["Reatta XL"]?.yearStart, 2020);
  assert.equal(eg["Reatta XL"]?.years?.includes(2010), false);
  assert.equal(eg.Vision?.yearStart, 2019);
  assert.equal(eg.Vision?.years?.includes(2010), false);
  assert.equal(eg.Vision?.years?.includes(2011), false);
  assert.equal(eg.Vision?.years?.includes(2012), false);
  assert.equal(eg["Vision XL"]?.yearStart, 2020);
  assert.equal(eg["Vision XL"]?.years?.includes(2010), false);
  assert.equal(eg.Emblem?.yearStart, 2019);
  assert.equal(eg.Emblem?.years?.includes(2010), false);
  assert.equal(eg.Emblem?.years?.includes(2011), false);
  assert.equal(eg.Emblem?.years?.includes(2012), false);
  assert.equal(eg.Accolade?.yearStart, 2020);
  assert.equal(eg.Accolade?.years?.includes(2010), false);
  assert.equal(eg.Accolade?.years?.includes(2012), false);
  assert.equal(eg["Accolade XL"]?.yearStart, 2021);
  assert.equal(eg.Odyssey?.yearStart, 2018);
  assert.equal(eg.Odyssey?.years?.includes(2010), false);
  assert.equal(eg.Odyssey?.years?.includes(2012), false);
  assert.equal(eg.Esteem?.yearStart, 2018);
  assert.equal(eg.Esteem?.years?.includes(2010), false);
  assert.equal(eg.Esteem?.years?.includes(2012), false);
  assert.equal(eg.Qwest?.yearStart, 2018);
  assert.equal(eg.Qwest?.years?.includes(2010), false);
  assert.equal(eg.Qwest?.years?.includes(2012), false);
  assert.equal(eg.Insignia?.yearStart, 2026);
  assert.equal(eg.Insignia?.years?.includes(2010), false);
  assert.equal(eg.Insignia?.years?.includes(2011), false);
  assert.equal(eg.Insignia?.years?.includes(2012), false);

  const block = src("rvData.ts");
  const e0 = block.indexOf('  "Entegra Coach": {');
  const e1 = block.indexOf('  "Monaco Coach": {');
  const entegra = block.slice(e0, e1);
  assert.doesNotMatch(entegra, /"2009":/);

  const cs = entegra.slice(entegra.indexOf('    "Cornerstone": {'), entegra.indexOf('    "Anthem": {'));
  assert.match(cs, /"2010": \["45DL", "45RB", "45SL"\]/);
  assert.match(cs, /"2011": \["45DLQ", "45RB", "45SL"\]/);
  assert.match(cs, /"2012": \["45DLQ", "45RBQ"\]/);
  assert.doesNotMatch(cs, /"2010": .*"45DLQ"/);
  assert.doesNotMatch(cs, /"2011": .*"45RBQ"/);
  assert.doesNotMatch(cs, /"2012": .*"45SL"/);
  assert.doesNotMatch(cs, /"2012": .*"45J"/);
  assert.doesNotMatch(cs, /"2012": .*"45K"/);
  assert.doesNotMatch(cs, /"2009":/);

  const an = entegra.slice(entegra.indexOf('    "Anthem": {'), entegra.indexOf('    "Aspire": {'));
  assert.match(an, /"2010": \["42DL", "42RB", "42SK", "44SL"\]/);
  assert.match(an, /"2011": \["42DLQ", "42RBQ", "44DLQ"\]/);
  assert.match(an, /"2012": \["42DLQ", "42RBQ", "44DLQ", "44SL"\]/);
  assert.doesNotMatch(an, /"2011": .*"44SL"/);
  assert.doesNotMatch(an, /"2010": .*"42DLQ"/);
  assert.doesNotMatch(an, /"2010": .*"44DLQ"/);
  assert.doesNotMatch(an, /"2012": .*"42DEQ"/);
  assert.doesNotMatch(an, /"2009":/);

  const as = entegra.slice(entegra.indexOf('    "Aspire": {'), entegra.indexOf('    "Reatta": {'));
  assert.match(as, /"2010": \["40DRQ", "40SKT", "42DL", "42RB", "42SA"\]/);
  assert.match(as, /"2011": \["40DRQ", "40SKT", "42DLQ", "42RBQ"\]/);
  assert.match(as, /"2012": \["40DRQ", "40SKT", "42DEQ", "42DLQ", "42RBQ"\]/);
  assert.doesNotMatch(as, /"2010": .*"42DEQ"/);
  assert.doesNotMatch(as, /"2010": .*"42DLQ"/);
  assert.doesNotMatch(as, /"2011": .*"42DEQ"/);
  assert.doesNotMatch(as, /"2011": .*"42SA"/);
  assert.match(as, /"2013": \["42DEQ", "42DLQ", "42RBQ"\]/);
  assert.doesNotMatch(as, /"2009":/);

  const re = entegra.slice(entegra.indexOf('    "Reatta": {'), entegra.indexOf('    "Reatta XL"'));
  assert.doesNotMatch(re, /"2010":/);
  assert.doesNotMatch(re, /"2011":/);
  assert.doesNotMatch(re, /"2012":/);

  const rxl = entegra.slice(entegra.indexOf('    "Reatta XL": {'), entegra.indexOf('    "Vision": {'));
  assert.doesNotMatch(rxl, /"2010":/);
  assert.doesNotMatch(rxl, /"2011":/);
  assert.doesNotMatch(rxl, /"2012":/);

  const vi = entegra.slice(entegra.indexOf('    "Vision": {'), entegra.indexOf('    "Vision XL"'));
  assert.doesNotMatch(vi, /"2010":/);
  assert.doesNotMatch(vi, /"2011":/);
  assert.doesNotMatch(vi, /"2012":/);

  const vxl = entegra.slice(entegra.indexOf('    "Vision XL": {'), entegra.indexOf('    "Accolade": {'));
  assert.doesNotMatch(vxl, /"2010":/);
  assert.doesNotMatch(vxl, /"2011":/);
  assert.doesNotMatch(vxl, /"2012":/);

  const ac = entegra.slice(entegra.indexOf('    "Accolade": {'), entegra.indexOf('    "Accolade XL"'));
  assert.doesNotMatch(ac, /"2010":/);
  assert.doesNotMatch(ac, /"2011":/);
  assert.doesNotMatch(ac, /"2012":/);

  const axl = entegra.slice(entegra.indexOf('    "Accolade XL": {'), entegra.indexOf('    "Centurion": {'));
  assert.doesNotMatch(axl, /"2010":/);
  assert.doesNotMatch(axl, /"2011":/);
  assert.doesNotMatch(axl, /"2012":/);

  const emb = entegra.slice(entegra.indexOf('    "Emblem": {'), entegra.indexOf('    "Vision SE"'));
  assert.doesNotMatch(emb, /"2010":/);
  assert.doesNotMatch(emb, /"2011":/);
  assert.doesNotMatch(emb, /"2012":/);

  const od = entegra.slice(entegra.indexOf('    "Odyssey": {'), entegra.indexOf('    "Esteem": {'));
  assert.doesNotMatch(od, /"2010":/);
  assert.doesNotMatch(od, /"2011":/);
  assert.doesNotMatch(od, /"2012":/);

  const es = entegra.slice(entegra.indexOf('    "Esteem": {'), entegra.indexOf('    "Qwest": {'));
  assert.doesNotMatch(es, /"2010":/);
  assert.doesNotMatch(es, /"2011":/);
  assert.doesNotMatch(es, /"2012":/);

  const qw = entegra.slice(entegra.indexOf('    "Qwest": {'), entegra.indexOf('    "Cornerstone Reserve"'));
  assert.doesNotMatch(qw, /"2010":/);
  assert.doesNotMatch(qw, /"2011":/);
  assert.doesNotMatch(qw, /"2012":/);

  const ins = entegra.slice(entegra.indexOf('    "Insignia": {'), entegra.indexOf('    "Arc": {'));
  assert.doesNotMatch(ins, /"2010":/);
  assert.doesNotMatch(ins, /"2011":/);
  assert.doesNotMatch(ins, /"2012":/);
  assert.doesNotMatch(ins, /floorplans: \[.*"36CKFL"/);
  assert.doesNotMatch(ins, /"2026": \[.*"36CKFL"/);

  const cs10 = findPowertrainCorrection("2010", "Entegra Coach", "Cornerstone", "45DL");
  assert.equal(cs10!.horsepower, 500);
  assert.equal(cs10!.torqueLbFt, 1550);
  assert.match(cs10!.engine, /ISM/);
  assert.doesNotMatch(cs10!.engine, /ISX|X15|600/);
  assert.match(cs10!.chassis || "", /K2/);
  assert.doesNotMatch(cs10!.chassis || "", /K3/);
  const cs11 = findPowertrainCorrection("2011", "Entegra Coach", "Cornerstone", "45DLQ");
  assert.equal(cs11, null);
  const cs12 = findPowertrainCorrection("2012", "Entegra Coach", "Cornerstone", "45DLQ");
  assert.equal(cs12!.horsepower, 500);
  assert.match(cs12!.chassis || "", /K2/);
  assert.doesNotMatch(cs12!.engine, /ISX|X15/);
  assert.doesNotMatch(cs12!.engine, /600/);
  assert.equal(cs12!.torqueLbFt, undefined);

  const an10 = findPowertrainCorrection("2010", "Entegra Coach", "Anthem", "42DL");
  assert.equal(an10!.horsepower, 425);
  assert.equal(an10!.torqueLbFt, 1200);
  assert.match(an10!.engine, /ISL/);
  assert.doesNotMatch(an10!.engine, /450|L9/);
  assert.match(an10!.chassis || "", /Mountain Master/);
  const an11 = findPowertrainCorrection("2011", "Entegra Coach", "Anthem", "42DLQ");
  assert.equal(an11, null);
  const an12 = findPowertrainCorrection("2012", "Entegra Coach", "Anthem", "44SL");
  assert.equal(an12!.horsepower, 450);
  assert.equal(an12!.torqueLbFt, 1250);
  assert.match(an12!.engine, /ISL/);
  assert.doesNotMatch(an12!.engine, /L9/);
  assert.match(an12!.chassis || "", /Mountain Master/);
  assert.doesNotMatch(an12!.chassis || "", /K2/);

  const as10 = findPowertrainCorrection("2010", "Entegra Coach", "Aspire", "40DRQ");
  assert.equal(as10, null);
  const as11 = findPowertrainCorrection("2011", "Entegra Coach", "Aspire", "42DLQ");
  assert.equal(as11!.horsepower, 400);
  assert.equal(as11!.torqueLbFt, 1250);
  assert.match(as11!.engine, /ISL/);
  assert.doesNotMatch(as11!.engine, /450|L9/);
  assert.match(as11!.chassis || "", /Freightliner XCR/);
  assert.doesNotMatch(as11!.chassis || "", /Spartan/);
  const as12 = findPowertrainCorrection("2012", "Entegra Coach", "Aspire", "42DEQ");
  assert.equal(as12!.horsepower, 450);
  assert.equal(as12!.torqueLbFt, 1250);
  assert.match(as12!.engine, /ISL/);
  assert.doesNotMatch(as12!.engine, /L9/);
  assert.match(as12!.chassis || "", /Mountain Master/);
  assert.doesNotMatch(as12!.chassis || "", /Freightliner/);

  assert.equal(findPowertrainCorrection("2009", "Entegra Coach", "Cornerstone", "45DL"), null);
  assert.equal(findPowertrainCorrection("2009", "Entegra Coach", "Anthem", "42DL"), null);
  assert.equal(findPowertrainCorrection("2009", "Entegra Coach", "Aspire", "40DRQ"), null);
  assert.equal(findPowertrainCorrection("2010", "Entegra Coach", "Reatta", "37K"), null);
  assert.equal(findPowertrainCorrection("2011", "Entegra Coach", "Vision", "27A"), null);
  assert.equal(findPowertrainCorrection("2012", "Entegra Coach", "Emblem", "36H"), null);
  assert.equal(findPowertrainCorrection("2011", "Entegra Coach", "Insignia", "36CKFL"), null);
  assert.equal(findPowertrainCorrection("2010", "Entegra Coach", "Odyssey", "22J"), null);
  assert.equal(findPowertrainCorrection("2011", "Entegra Coach", "Esteem", "29V"), null);
  assert.equal(findPowertrainCorrection("2012", "Entegra Coach", "Qwest", "24L"), null);
  assert.equal(findPowertrainCorrection("2010", "Entegra Coach", "Accolade", "37L"), null);
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

test("Tiffin 2015–2016 OEM year-first floorplans + powertrain pins", () => {
  const tf = CATALOG_INDEX.Tiffin;
  assert.ok(tf);

  assert.equal(tf["Allegro Bay"]?.yearStart, 2022);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2015), false);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2016), false);

  assert.equal(tf.Zephyr?.years?.includes(2015), true);
  assert.equal(tf.Zephyr?.years?.includes(2016), false);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2015), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2016), true);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2015), false);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2016), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2015), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2016), false);
  assert.equal(tf["Allegro Red"]?.years?.includes(2015), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2016), true);
  assert.equal(tf.Wayfarer?.yearStart, 2017);
  assert.equal(tf.Wayfarer?.years?.includes(2015), false);
  assert.equal(tf.Wayfarer?.years?.includes(2016), false);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2015), false);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2016), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Tiffin: {");
  const t1 = block.indexOf("  Thor: {");
  const tiffin = block.slice(t0, t1);

  const ze = tiffin.slice(tiffin.indexOf("    Zephyr: {"), tiffin.indexOf('    "Allegro Bus": {'));
  assert.match(ze, /"2015": \["45DZ", "45TZ"\]/);
  assert.doesNotMatch(ze, /"2016":/);
  assert.doesNotMatch(ze, /"2015": \["45NZ"/);
  assert.match(ze, /"2017": \["45OZ"\]/);

  const bus = tiffin.slice(tiffin.indexOf('    "Allegro Bus": {'), tiffin.indexOf('    "Allegro Bus 45OPP"'));
  assert.match(bus, /"2015": \["37AP", "40SP", "45LP"\]/);
  assert.match(bus, /"2016": \["37AP", "40AP", "40SP", "45LP", "45OP", "45UP"\]/);
  assert.doesNotMatch(bus, /"2015": \["37AP", "40AP"/);
  assert.doesNotMatch(bus, /"2016": \["37AP", "40AP", "45LP", "45OPP"\]/);
  assert.match(bus, /"2017": \["37AP", "40AP", "40SP", "45OP", "45OPP"\]/);

  const ph = tiffin.slice(tiffin.indexOf("    Phaeton: {"), tiffin.indexOf('    "Allegro Red 340"'));
  assert.match(ph, /"2015": \["36GH", "40AH", "40QBH", "40QKH", "42LH"\]/);
  assert.match(ph, /"2016": \["36GH", "40AH", "40QBH", "40QKH", "42LH", "44OH"\]/);
  assert.doesNotMatch(ph, /"2015": \["36GH", "40AH", "40IH"/);
  assert.match(ph, /"2017": \["36GH", "40AH", "40QBH", "40QKH", "44OH"\]/);

  const red340 = tiffin.slice(tiffin.indexOf('    "Allegro Red 340"'), tiffin.indexOf('    "Allegro Red 360"'));
  assert.doesNotMatch(red340, /"2015":/);
  assert.doesNotMatch(red340, /"2016":/);
  assert.doesNotMatch(red340, /"2014":/);
  assert.match(red340, /"2019": \["33AA"\]/);

  const red360 = tiffin.slice(tiffin.indexOf('    "Allegro Red 360"'), tiffin.indexOf('    "Allegro Red": {'));
  assert.doesNotMatch(red360, /"2015":/);
  assert.doesNotMatch(red360, /"2016":/);
  assert.match(red360, /"2018": \["33AA", "37BA", "37PA", "38QBA", "38QRA"\]/);

  const red = tiffin.slice(tiffin.indexOf('    "Allegro Red": {'), tiffin.indexOf('    "Allegro Breeze"'));
  assert.match(red, /"2015": \["33AA", "36QSA", "37PA", "38QBA", "38QRA"\]/);
  assert.match(red, /"2016": \["33AA", "37PA", "38QBA", "38QRA"\]/);
  assert.doesNotMatch(red, /"2015": \["33AA", "37BA"/);

  const breeze = tiffin.slice(tiffin.indexOf('    "Allegro Breeze"'), tiffin.indexOf('    "Open Road"'));
  assert.match(breeze, /"2015": \["28BR", "32BR"\]/);
  assert.match(breeze, /"2016": \["32BR"\]/);
  assert.doesNotMatch(breeze, /"2015": \["28BR", "31BR"/);
  assert.match(breeze, /"2017": \["31BR", "32BR"\]/);

  const or = tiffin.slice(tiffin.indexOf('    "Open Road": {'), tiffin.indexOf("    Wayfarer: {"));
  assert.match(or, /"2015": \["31SA", "32CA", "32SA", "34TGA", "35QBA", "36LA"\]/);
  assert.match(or, /"2016": \["31SA", "32SA", "34PA", "34TGA", "35QBA", "36LA"\]/);
  assert.doesNotMatch(or, /"2015": \["32SA", "34PA", "36LA"\]/);
  assert.match(or, /"2017": \["31MA", "31SA", "32SA", "34PA", "35QBA", "36LA", "36UA"\]/);

  const wf = tiffin.slice(tiffin.indexOf("    Wayfarer: {"), tiffin.indexOf('    "Wayfarer 25"'));
  assert.doesNotMatch(wf, /"2015":/);
  assert.doesNotMatch(wf, /"2016":/);
  assert.match(wf, /"2017": \["24QW"\]/);

  const z15 = findPowertrainCorrection("2015", "Tiffin", "Zephyr", "45DZ");
  assert.equal(z15!.horsepower, 500);
  assert.equal(z15!.torqueLbFt, 1645);
  assert.match(z15!.engine, /ISX 11\.9/);
  assert.match(z15!.chassis || "", /Spartan/);
  assert.equal(findPowertrainCorrection("2016", "Tiffin", "Zephyr", "45DZ"), null);

  const bus15 = findPowertrainCorrection("2015", "Tiffin", "Allegro Bus", "37AP");
  assert.equal(bus15!.horsepower, 450);
  assert.equal(bus15!.torqueLbFt, 1250);
  assert.match(bus15!.engine, /ISL 450/);
  assert.doesNotMatch(bus15!.engine, /600|ISX15|X15|L9/);
  const bus16short = findPowertrainCorrection("2016", "Tiffin", "Allegro Bus", "37AP");
  assert.equal(bus16short!.horsepower, 450);
  assert.doesNotMatch(bus16short!.engine, /600/);
  const bus16op = findPowertrainCorrection("2016", "Tiffin", "Allegro Bus", "45OP");
  assert.equal(bus16op!.horsepower, 0);
  assert.match(bus16op!.engine, /600/);
  const bus16up = findPowertrainCorrection("2016", "Tiffin", "Allegro Bus", "45UP");
  assert.equal(bus16up!.horsepower, 0);
  assert.match(bus16up!.engine, /600/);

  const ph15 = findPowertrainCorrection("2015", "Tiffin", "Phaeton", "40AH");
  assert.equal(ph15!.horsepower, 380);
  assert.match(ph15!.engine, /ISL/);
  assert.doesNotMatch(ph15!.engine, /L9/);
  const ph15lh = findPowertrainCorrection("2015", "Tiffin", "Phaeton", "42LH");
  assert.equal(ph15lh!.horsepower, 450);
  const ph16 = findPowertrainCorrection("2016", "Tiffin", "Phaeton", "40AH");
  assert.equal(ph16!.horsepower, 380);
  assert.doesNotMatch(ph16!.engine, /L9/);
  const ph16oh = findPowertrainCorrection("2016", "Tiffin", "Phaeton", "44OH");
  assert.equal(ph16oh!.horsepower, 450);
  const ph17 = findPowertrainCorrection("2017", "Tiffin", "Phaeton", "40AH");
  assert.equal(ph17!.horsepower, 0);

  const red15 = findPowertrainCorrection("2015", "Tiffin", "Allegro Red", "33AA");
  assert.equal(red15!.horsepower, 340);
  assert.equal(red15!.torqueLbFt, 660);
  assert.equal(red15!.fuelType, "Diesel");
  assert.doesNotMatch(red15!.engine, /360|L9|V10|F53/i);
  const red16 = findPowertrainCorrection("2016", "Tiffin", "Allegro Red", "37PA");
  assert.equal(red16!.horsepower, 0);
  assert.match(red16!.engine, /340/);
  assert.match(red16!.engine, /360/);
  assert.equal(findPowertrainCorrection("2015", "Tiffin", "Allegro Red 340", "33AA"), null);
  assert.equal(findPowertrainCorrection("2016", "Tiffin", "Allegro Red 340", "33AA"), null);
  assert.equal(findPowertrainCorrection("2015", "Tiffin", "Allegro Red 360", "33AA"), null);

  const breeze15 = findPowertrainCorrection("2015", "Tiffin", "Allegro Breeze", "28BR");
  assert.equal(breeze15!.horsepower, 240);
  assert.equal(breeze15!.torqueLbFt, 620);
  assert.match(breeze15!.engine, /MaxxForce/);
  assert.doesNotMatch(breeze15!.engine, /ISV|B6\.7|Cummins/);
  const breeze16 = findPowertrainCorrection("2016", "Tiffin", "Allegro Breeze", "32BR");
  assert.equal(breeze16!.horsepower, 275);
  assert.equal(breeze16!.torqueLbFt, 560);
  assert.match(breeze16!.engine, /ISV5\.0/);
  assert.doesNotMatch(breeze16!.engine, /MaxxForce|B6\.7|340/);

  const or15 = findPowertrainCorrection("2015", "Tiffin", "Open Road", "32SA");
  assert.equal(or15!.horsepower, 362);
  assert.equal(or15!.torqueLbFt, 457);
  assert.equal(or15!.fuelType, "Gas");
  assert.doesNotMatch(or15!.engine, /7\.3|diesel|320/i);
  const or16 = findPowertrainCorrection("2016", "Tiffin", "Open Road", "36LA");
  assert.equal(or16!.horsepower, 320);
  assert.equal(or16!.torqueLbFt, 460);
  assert.equal(or16!.fuelType, "Gas");
  const alg15 = findPowertrainCorrection("2015", "Tiffin", "Allegro", "31SA");
  assert.equal(alg15!.fuelType, "Gas");
  assert.equal(alg15!.horsepower, 362);
  const alg16 = findPowertrainCorrection("2016", "Tiffin", "Allegro", "34PA");
  assert.equal(alg16!.fuelType, "Gas");
  assert.equal(alg16!.horsepower, 320);

  assert.equal(findPowertrainCorrection("2015", "Tiffin", "Wayfarer", "24QW"), null);
  assert.equal(findPowertrainCorrection("2016", "Tiffin", "Wayfarer", "24BW"), null);
  assert.equal(findPowertrainCorrection("2015", "Tiffin", "Allegro Bay", "38AB"), null);
  assert.equal(findPowertrainCorrection("2016", "Tiffin", "Allegro Bay", "38AB"), null);
});

test("Tiffin 2013–2014 OEM year-first floorplans + powertrain pins", () => {
  const tf = CATALOG_INDEX.Tiffin;
  assert.ok(tf);

  assert.equal(tf["Allegro Bay"]?.yearStart, 2022);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2013), false);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2014), false);

  assert.equal(tf.Zephyr?.years?.includes(2013), true);
  assert.equal(tf.Zephyr?.years?.includes(2014), true);
  assert.equal(tf["Allegro Bus"]?.years?.includes(2013), false);
  assert.equal(tf["Allegro Bus"]?.years?.includes(2014), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2013), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2014), true);
  assert.equal(tf["Allegro Red 340"]?.yearStart, 2019);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2013), false);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2014), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2013), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2014), false);
  assert.equal(tf["Allegro Red"]?.years?.includes(2013), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2014), true);
  assert.equal(tf.Wayfarer?.yearStart, 2017);
  assert.equal(tf.Wayfarer?.years?.includes(2013), false);
  assert.equal(tf.Wayfarer?.years?.includes(2014), false);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2013), false);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2014), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Tiffin: {");
  const t1 = block.indexOf("  Thor: {");
  const tiffin = block.slice(t0, t1);

  const ze = tiffin.slice(tiffin.indexOf("    Zephyr: {"), tiffin.indexOf('    "Allegro Bus": {'));
  assert.match(ze, /"2013": \["45LZ", "45TZ"\]/);
  assert.match(ze, /"2014": \["45LZ", "45TZ"\]/);
  assert.doesNotMatch(ze, /"2013": \["45NZ"/);
  assert.doesNotMatch(ze, /"2014": \["45NZ"/);
  assert.match(ze, /"2015": \["45DZ", "45TZ"\]/);

  const bus = tiffin.slice(tiffin.indexOf('    "Allegro Bus": {'), tiffin.indexOf('    "Allegro Bus 45OPP"'));
  assert.doesNotMatch(bus, /"2013":/);
  assert.match(bus, /"2014": \["37AP", "40QBP", "43QGP", "45LP"\]/);
  assert.doesNotMatch(bus, /"2014": \["37AP", "40AP"/);
  assert.match(bus, /"2015": \["37AP", "40SP", "45LP"\]/);

  const ph = tiffin.slice(tiffin.indexOf("    Phaeton: {"), tiffin.indexOf('    "Allegro Red 340"'));
  assert.match(ph, /"2013": \["36GH", "36QSH", "40QBH", "40QKH", "40QTH", "42LH", "42QBH"\]/);
  assert.match(ph, /"2014": \["36GH", "40QBH", "40QKH", "40QTH", "42LH"\]/);
  assert.doesNotMatch(ph, /"2013": \["36GH", "40AH"/);
  assert.doesNotMatch(ph, /"2014": \["36GH", "40AH"/);
  assert.match(ph, /"2015": \["36GH", "40AH", "40QBH", "40QKH", "42LH"\]/);

  const red340 = tiffin.slice(tiffin.indexOf('    "Allegro Red 340"'), tiffin.indexOf('    "Allegro Red 360"'));
  assert.doesNotMatch(red340, /"2013":/);
  assert.doesNotMatch(red340, /"2014":/);
  assert.match(red340, /"2019": \["33AA"\]/);

  const red360 = tiffin.slice(tiffin.indexOf('    "Allegro Red 360"'), tiffin.indexOf('    "Allegro Red": {'));
  assert.doesNotMatch(red360, /"2013":/);
  assert.doesNotMatch(red360, /"2014":/);

  const red = tiffin.slice(tiffin.indexOf('    "Allegro Red": {'), tiffin.indexOf('    "Allegro Breeze"'));
  assert.match(red, /"2013": \["34QFA", "36QSA", "38QBA", "38QRA"\]/);
  assert.match(red, /"2014": \["33AA", "34QFA", "36QSA", "38QBA", "38QRA"\]/);
  assert.doesNotMatch(red, /"2013": \["33AA"/);
  assert.match(red, /"2015": \["33AA", "36QSA", "37PA", "38QBA", "38QRA"\]/);

  const breeze = tiffin.slice(tiffin.indexOf('    "Allegro Breeze"'), tiffin.indexOf('    "Open Road"'));
  assert.match(breeze, /"2013": \["28BR", "32BR"\]/);
  assert.match(breeze, /"2014": \["28BR", "32BR"\]/);
  assert.doesNotMatch(breeze, /"2013": \["28BR", "31BR"/);
  assert.match(breeze, /"2015": \["28BR", "32BR"\]/);

  const or = tiffin.slice(tiffin.indexOf('    "Open Road": {'), tiffin.indexOf("    Wayfarer: {"));
  assert.match(or, /"2013": \["30GA", "31SA", "32CA", "34TGA", "35QBA", "36LA"\]/);
  assert.match(or, /"2014": \["30GA", "31SA", "32CA", "34TGA", "35QBA", "36LA"\]/);
  assert.doesNotMatch(or, /"2013": \["32SA", "34PA", "36LA"\]/);
  assert.match(or, /"2015": \["31SA", "32CA", "32SA", "34TGA", "35QBA", "36LA"\]/);

  const wf = tiffin.slice(tiffin.indexOf("    Wayfarer: {"), tiffin.indexOf('    "Wayfarer 25"'));
  assert.doesNotMatch(wf, /"2013":/);
  assert.doesNotMatch(wf, /"2014":/);
  assert.match(wf, /"2017": \["24QW"\]/);

  const z13 = findPowertrainCorrection("2013", "Tiffin", "Zephyr", "45LZ");
  assert.equal(z13!.horsepower, 500);
  assert.equal(z13!.torqueLbFt, 1645);
  assert.match(z13!.engine, /ISX 11\.9/);
  assert.match(z13!.chassis || "", /Spartan/);
  const z14 = findPowertrainCorrection("2014", "Tiffin", "Zephyr", "45TZ");
  assert.equal(z14!.horsepower, 500);
  assert.doesNotMatch(z14!.engine, /ISL 600|X15/);

  assert.equal(findPowertrainCorrection("2013", "Tiffin", "Allegro Bus", "37AP"), null);
  const bus14 = findPowertrainCorrection("2014", "Tiffin", "Allegro Bus", "37AP");
  assert.equal(bus14!.horsepower, 450);
  assert.equal(bus14!.torqueLbFt, 1250);
  assert.match(bus14!.engine, /ISL 450/);
  assert.doesNotMatch(bus14!.engine, /600|ISX15|X15|L9/);

  const ph13 = findPowertrainCorrection("2013", "Tiffin", "Phaeton", "40QBH");
  assert.equal(ph13!.horsepower, 380);
  assert.match(ph13!.engine, /ISC/);
  assert.doesNotMatch(ph13!.engine, /ISL|L9/);
  const ph13lh = findPowertrainCorrection("2013", "Tiffin", "Phaeton", "42LH");
  assert.equal(ph13lh!.horsepower, 400);
  assert.match(ph13lh!.engine, /ISL 400/);
  const ph13qbh = findPowertrainCorrection("2013", "Tiffin", "Phaeton", "42QBH");
  assert.equal(ph13qbh!.horsepower, 400);
  const ph14 = findPowertrainCorrection("2014", "Tiffin", "Phaeton", "40QBH");
  assert.equal(ph14!.horsepower, 380);
  assert.match(ph14!.engine, /ISL/);
  assert.doesNotMatch(ph14!.engine, /ISC|L9/);
  const ph14lh = findPowertrainCorrection("2014", "Tiffin", "Phaeton", "42LH");
  assert.equal(ph14lh!.horsepower, 450);
  const ph15 = findPowertrainCorrection("2015", "Tiffin", "Phaeton", "40AH");
  assert.equal(ph15!.horsepower, 380);

  const red13 = findPowertrainCorrection("2013", "Tiffin", "Allegro Red", "34QFA");
  assert.equal(red13!.horsepower, 340);
  assert.equal(red13!.torqueLbFt, 660);
  assert.equal(red13!.fuelType, "Diesel");
  assert.doesNotMatch(red13!.engine, /360|L9|V10|F53/i);
  const red14 = findPowertrainCorrection("2014", "Tiffin", "Allegro Red", "33AA");
  assert.equal(red14!.horsepower, 340);
  assert.equal(red14!.torqueLbFt, 660);
  assert.doesNotMatch(red14!.engine, /360/);
  assert.equal(findPowertrainCorrection("2013", "Tiffin", "Allegro Red 340", "33AA"), null);
  assert.equal(findPowertrainCorrection("2014", "Tiffin", "Allegro Red 340", "33AA"), null);
  assert.equal(findPowertrainCorrection("2013", "Tiffin", "Allegro Red 360", "33AA"), null);

  const breeze13 = findPowertrainCorrection("2013", "Tiffin", "Allegro Breeze", "28BR");
  assert.equal(breeze13!.horsepower, 240);
  assert.equal(breeze13!.torqueLbFt, 620);
  assert.match(breeze13!.engine, /MaxxForce/);
  assert.doesNotMatch(breeze13!.engine, /ISV|B6\.7|Cummins/);
  const breeze14 = findPowertrainCorrection("2014", "Tiffin", "Allegro Breeze", "32BR");
  assert.equal(breeze14!.horsepower, 240);
  assert.match(breeze14!.engine, /MaxxForce/);

  const or13 = findPowertrainCorrection("2013", "Tiffin", "Open Road", "32CA");
  assert.equal(or13!.horsepower, 362);
  assert.equal(or13!.torqueLbFt, 457);
  assert.equal(or13!.fuelType, "Gas");
  assert.doesNotMatch(or13!.engine, /7\.3|diesel|320/i);
  const or14 = findPowertrainCorrection("2014", "Tiffin", "Open Road", "36LA");
  assert.equal(or14!.horsepower, 362);
  assert.equal(or14!.fuelType, "Gas");
  const alg13 = findPowertrainCorrection("2013", "Tiffin", "Allegro", "31SA");
  assert.equal(alg13!.fuelType, "Gas");
  assert.equal(alg13!.horsepower, 362);
  const alg14 = findPowertrainCorrection("2014", "Tiffin", "Allegro", "30GA");
  assert.equal(alg14!.fuelType, "Gas");
  assert.equal(alg14!.horsepower, 362);

  assert.equal(findPowertrainCorrection("2013", "Tiffin", "Wayfarer", "24QW"), null);
  assert.equal(findPowertrainCorrection("2014", "Tiffin", "Wayfarer", "24BW"), null);
  assert.equal(findPowertrainCorrection("2013", "Tiffin", "Allegro Bay", "38AB"), null);
  assert.equal(findPowertrainCorrection("2014", "Tiffin", "Allegro Bay", "38AB"), null);
});

test("Tiffin 2010–2012 OEM year-first floorplans + powertrain pins", () => {
  const tf = CATALOG_INDEX.Tiffin;
  assert.ok(tf);

  assert.equal(tf["Allegro Bay"]?.yearStart, 2022);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2010), false);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2011), false);
  assert.equal(tf["Allegro Bay"]?.years?.includes(2012), false);

  assert.equal(tf.Zephyr?.years?.includes(2010), true);
  assert.equal(tf.Zephyr?.years?.includes(2011), true);
  assert.equal(tf.Zephyr?.years?.includes(2012), false);
  assert.equal(tf["Allegro Bus"]?.years?.includes(2010), true);
  assert.equal(tf["Allegro Bus"]?.years?.includes(2011), true);
  assert.equal(tf["Allegro Bus"]?.years?.includes(2012), true);
  assert.equal(tf["Allegro Bus 45OPP"]?.yearStart, 2017);
  assert.equal(tf["Allegro Bus 45OPP"]?.years?.includes(2010), false);
  assert.equal(tf["Allegro Bus 45OPP"]?.years?.includes(2011), false);
  assert.equal(tf["Allegro Bus 45OPP"]?.years?.includes(2012), false);
  assert.equal(tf["Allegro 45OPP"]?.years?.includes(2009), true);
  assert.equal(tf["Allegro 45OPP"]?.years?.includes(2010), false);
  assert.equal(tf["Allegro 45OPP"]?.years?.includes(2011), false);
  assert.equal(tf["Allegro 45OPP"]?.years?.includes(2012), false);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2010), false);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2011), true);
  assert.equal(tf["Allegro Breeze"]?.years?.includes(2012), true);
  assert.equal(tf["Allegro Red 340"]?.yearStart, 2019);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2010), false);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2011), false);
  assert.equal(tf["Allegro Red 340"]?.years?.includes(2012), false);
  assert.equal(tf["Allegro Red 360"]?.yearStart, 2018);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2010), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2011), false);
  assert.equal(tf["Allegro Red 360"]?.years?.includes(2012), false);
  assert.equal(tf["Allegro Red"]?.years?.includes(2010), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2011), true);
  assert.equal(tf["Allegro Red"]?.years?.includes(2012), true);
  assert.equal(tf.Phaeton?.years?.includes(2010), true);
  assert.equal(tf.Phaeton?.years?.includes(2011), true);
  assert.equal(tf.Phaeton?.years?.includes(2012), true);
  assert.equal(tf["Open Road"]?.years?.includes(2010), true);
  assert.equal(tf["Open Road"]?.years?.includes(2011), true);
  assert.equal(tf["Open Road"]?.years?.includes(2012), true);
  assert.equal(tf.Wayfarer?.yearStart, 2017);
  assert.equal(tf.Wayfarer?.years?.includes(2010), false);
  assert.equal(tf.Wayfarer?.years?.includes(2011), false);
  assert.equal(tf.Wayfarer?.years?.includes(2012), false);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2010), false);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2011), false);
  assert.equal(tf["Wayfarer 25"]?.years?.includes(2012), false);

  const block = src("rvData.ts");
  const t0 = block.indexOf("  Tiffin: {");
  const t1 = block.indexOf("  Thor: {");
  const tiffin = block.slice(t0, t1);

  const ze = tiffin.slice(tiffin.indexOf("    Zephyr: {"), tiffin.indexOf('    "Allegro Bus": {'));
  assert.match(ze, /"2010": \["45QBZ", "45QEZ"\]/);
  assert.match(ze, /"2011": \["45QBZ"\]/);
  assert.doesNotMatch(ze, /"2012":/);
  assert.doesNotMatch(ze, /"2010": \["45NZ"/);
  assert.doesNotMatch(ze, /"2011": \["45NZ"/);
  assert.match(ze, /"2009": \["45NZ", "45FZ"\]/);
  assert.match(ze, /"2013": \["45LZ", "45TZ"\]/);

  const bus = tiffin.slice(tiffin.indexOf('    "Allegro Bus": {'), tiffin.indexOf('    "Allegro Bus 45OPP"'));
  assert.match(bus, /"2010": \["36QSP", "40QXP", "43QBP", "43QGP", "43QRP"\]/);
  assert.match(bus, /"2011": \["36QSP", "40QXP", "43QBP", "43QGP", "43QRP"\]/);
  assert.match(bus, /"2012": \["36QSP", "40QBP", "40QXP", "43QGP", "43QRP"\]/);
  assert.doesNotMatch(bus, /"2010": \["37AP"/);
  assert.doesNotMatch(bus, /"2011": \["37AP"/);
  assert.doesNotMatch(bus, /"2012": \["37AP"/);
  assert.doesNotMatch(bus, /"2010": \[.*"45OPP"/);
  assert.doesNotMatch(bus, /"2011": \[.*"45OPP"/);
  assert.doesNotMatch(bus, /"2012": \[.*"45OPP"/);
  assert.match(bus, /"2009": \["37AP", "40AP", "45LP", "45OPP"\]/);
  assert.doesNotMatch(bus, /"2013":/);
  assert.match(bus, /"2014": \["37AP", "40QBP", "43QGP", "45LP"\]/);

  const ph = tiffin.slice(tiffin.indexOf("    Phaeton: {"), tiffin.indexOf('    "Allegro Red 340"'));
  assert.match(ph, /"2010": \["36QSH", "40QTH", "42QRH", "42QBH"\]/);
  assert.match(ph, /"2011": \["36QSH", "40QBH", "40QKH", "40QTH", "42QBH"\]/);
  assert.match(ph, /"2012": \["36QSH", "40QBH", "40QKH", "40QTH", "42QBH"\]/);
  assert.doesNotMatch(ph, /"2010": \["36GH"/);
  assert.doesNotMatch(ph, /"2011": \["36GH"/);
  assert.match(ph, /"2013": \["36GH", "36QSH", "40QBH", "40QKH", "40QTH", "42LH", "42QBH"\]/);

  const red340 = tiffin.slice(tiffin.indexOf('    "Allegro Red 340"'), tiffin.indexOf('    "Allegro Red 360"'));
  assert.doesNotMatch(red340, /"2010":/);
  assert.doesNotMatch(red340, /"2011":/);
  assert.doesNotMatch(red340, /"2012":/);
  assert.match(red340, /"2019": \["33AA"\]/);

  const red360 = tiffin.slice(tiffin.indexOf('    "Allegro Red 360"'), tiffin.indexOf('    "Allegro Red": {'));
  assert.doesNotMatch(red360, /"2010":/);
  assert.doesNotMatch(red360, /"2011":/);
  assert.doesNotMatch(red360, /"2012":/);

  const red = tiffin.slice(tiffin.indexOf('    "Allegro Red": {'), tiffin.indexOf('    "Allegro Breeze"'));
  assert.match(red, /"2010": \["34QFA", "36QSA", "38QBA"\]/);
  assert.match(red, /"2011": \["34QFA", "36QSA", "38QBA"\]/);
  assert.match(red, /"2012": \["34QFA", "36QSA", "38QBA", "38QRA"\]/);
  assert.doesNotMatch(red, /"2010": \["33AA"/);
  assert.doesNotMatch(red, /"2012": \["33AA"/);
  assert.match(red, /"2013": \["34QFA", "36QSA", "38QBA", "38QRA"\]/);

  const breeze = tiffin.slice(tiffin.indexOf('    "Allegro Breeze"'), tiffin.indexOf('    "Open Road"'));
  assert.doesNotMatch(breeze, /"2010":/);
  assert.match(breeze, /"2011": \["28BR"\]/);
  assert.match(breeze, /"2012": \["28BR", "32BR"\]/);
  assert.match(breeze, /"2009": \["28BR", "31BR", "32BR"\]/);
  assert.match(breeze, /"2013": \["28BR", "32BR"\]/);

  const or = tiffin.slice(tiffin.indexOf('    "Open Road": {'), tiffin.indexOf("    Wayfarer: {"));
  assert.match(or, /"2010": \["30DA", "32BA", "34TGA", "35QBA"\]/);
  assert.match(or, /"2011": \["30GA", "32BA", "34TGA", "35QBA"\]/);
  assert.match(or, /"2012": \["30GA", "32CA", "34TGA", "35QBA"\]/);
  assert.doesNotMatch(or, /"2010": \["32SA"/);
  assert.doesNotMatch(or, /"2011": \["32SA"/);
  assert.doesNotMatch(or, /"2012": \["32SA"/);
  assert.match(or, /"2013": \["30GA", "31SA", "32CA", "34TGA", "35QBA", "36LA"\]/);

  const alg = tiffin.slice(tiffin.indexOf("    Allegro: {"));
  // Bare Allegro alias tracks the Open Road brochure for 2010–2012
  assert.match(alg, /"2010": \["30DA", "32BA", "34TGA", "35QBA"\]/);
  assert.match(alg, /"2011": \["30GA", "32BA", "34TGA", "35QBA"\]/);
  assert.match(alg, /"2012": \["30GA", "32CA", "34TGA", "35QBA"\]/);

  const wf = tiffin.slice(tiffin.indexOf("    Wayfarer: {"), tiffin.indexOf('    "Wayfarer 25"'));
  assert.doesNotMatch(wf, /"2010":/);
  assert.doesNotMatch(wf, /"2011":/);
  assert.doesNotMatch(wf, /"2012":/);
  assert.match(wf, /"2017": \["24QW"\]/);

  const z10 = findPowertrainCorrection("2010", "Tiffin", "Zephyr", "45QBZ");
  assert.equal(z10!.horsepower, 500);
  assert.equal(z10!.torqueLbFt, 1550);
  assert.match(z10!.engine, /ISM 10\.8/);
  assert.match(z10!.chassis || "", /Spartan/);
  assert.doesNotMatch(z10!.engine, /ISX 11\.9|X15|ISL 600/);
  const z11 = findPowertrainCorrection("2011", "Tiffin", "Zephyr", "45QBZ");
  assert.equal(z11!.horsepower, 500);
  assert.equal(z11!.torqueLbFt, 1550);
  assert.match(z11!.engine, /ISM 10\.8/);
  assert.equal(findPowertrainCorrection("2012", "Tiffin", "Zephyr", "45QBZ"), null);

  const bus10 = findPowertrainCorrection("2010", "Tiffin", "Allegro Bus", "36QSP");
  assert.equal(bus10!.horsepower, 425);
  assert.equal(bus10!.torqueLbFt, undefined);
  assert.match(bus10!.engine, /ISL 425/);
  assert.doesNotMatch(bus10!.engine, /450|600|ISX|X15|L9/);
  const bus11 = findPowertrainCorrection("2011", "Tiffin", "Allegro Bus", "40QXP");
  assert.equal(bus11!.horsepower, 450);
  assert.equal(bus11!.torqueLbFt, 1250);
  assert.match(bus11!.engine, /ISL 450/);
  const bus12 = findPowertrainCorrection("2012", "Tiffin", "Allegro Bus", "40QBP");
  assert.equal(bus12!.horsepower, 450);
  assert.equal(bus12!.torqueLbFt, 1250);
  assert.match(bus12!.engine, /ISL 450/);
  assert.doesNotMatch(bus12!.engine, /600|ISX|X15|L9/);

  const ph10 = findPowertrainCorrection("2010", "Tiffin", "Phaeton", "36QSH");
  assert.equal(ph10!.horsepower, 360);
  assert.equal(ph10!.torqueLbFt, 1050);
  assert.match(ph10!.engine, /ISC 360/);
  assert.doesNotMatch(ph10!.engine, /380|ISL|L9/);
  const ph11 = findPowertrainCorrection("2011", "Tiffin", "Phaeton", "40QBH");
  assert.equal(ph11!.horsepower, 380);
  assert.match(ph11!.engine, /ISC 380/);
  assert.doesNotMatch(ph11!.engine, /ISL|L9/);
  const ph12 = findPowertrainCorrection("2012", "Tiffin", "Phaeton", "40QBH");
  assert.equal(ph12!.horsepower, 380);
  assert.match(ph12!.engine, /ISC 380/);
  assert.doesNotMatch(ph12!.engine, /ISL|L9/);
  const ph12qbh = findPowertrainCorrection("2012", "Tiffin", "Phaeton", "42QBH");
  assert.equal(ph12qbh!.horsepower, 400);
  assert.equal(ph12qbh!.torqueLbFt, 1250);
  assert.match(ph12qbh!.engine, /ISL 400/);

  const red10 = findPowertrainCorrection("2010", "Tiffin", "Allegro Red", "34QFA");
  assert.equal(red10!.horsepower, 340);
  assert.equal(red10!.torqueLbFt, 660);
  assert.equal(red10!.fuelType, "Diesel");
  assert.match(red10!.engine, /ISB 6\.7/);
  assert.doesNotMatch(red10!.engine, /360|L9|V10|F53/i);
  const red11 = findPowertrainCorrection("2011", "Tiffin", "Allegro Red", "36QSA");
  assert.equal(red11!.horsepower, 340);
  assert.equal(red11!.torqueLbFt, 660);
  const red12 = findPowertrainCorrection("2012", "Tiffin", "Allegro Red", "38QRA");
  assert.equal(red12!.horsepower, 340);
  assert.equal(red12!.torqueLbFt, 660);
  assert.match(red12!.transmission || "", /Allison 2500/);
  assert.equal(findPowertrainCorrection("2010", "Tiffin", "Allegro Red 340", "33AA"), null);
  assert.equal(findPowertrainCorrection("2011", "Tiffin", "Allegro Red 340", "33AA"), null);
  assert.equal(findPowertrainCorrection("2012", "Tiffin", "Allegro Red 360", "33AA"), null);

  assert.equal(findPowertrainCorrection("2010", "Tiffin", "Allegro Breeze", "28BR"), null);
  const breeze11 = findPowertrainCorrection("2011", "Tiffin", "Allegro Breeze", "28BR");
  assert.equal(breeze11!.horsepower, 215);
  assert.equal(breeze11!.torqueLbFt, 560);
  assert.match(breeze11!.engine, /MaxxForce/);
  assert.doesNotMatch(breeze11!.engine, /240|620|ISV|B6\.7|Cummins/);
  const breeze12 = findPowertrainCorrection("2012", "Tiffin", "Allegro Breeze", "32BR");
  assert.equal(breeze12!.horsepower, 215);
  assert.equal(breeze12!.torqueLbFt, 560);
  assert.match(breeze12!.engine, /MaxxForce/);

  const or10 = findPowertrainCorrection("2010", "Tiffin", "Open Road", "32BA");
  assert.equal(or10!.horsepower, 0);
  assert.match(or10!.engine, /Ford/);
  assert.match(or10!.engine, /Workhorse|FRED|Cummins/);
  const or11 = findPowertrainCorrection("2011", "Tiffin", "Open Road", "30GA");
  assert.equal(or11!.horsepower, 0);
  assert.match(or11!.engine, /Ford/);
  assert.match(or11!.engine, /Workhorse/);
  const or12 = findPowertrainCorrection("2012", "Tiffin", "Open Road", "32CA");
  assert.equal(or12!.horsepower, 362);
  assert.equal(or12!.torqueLbFt, 457);
  assert.equal(or12!.fuelType, "Gas");
  assert.doesNotMatch(or12!.engine, /7\.3|diesel|320|Workhorse/i);
  const alg10 = findPowertrainCorrection("2010", "Tiffin", "Allegro", "30DA");
  assert.equal(alg10!.horsepower, 0);
  assert.equal(alg10!.fuelType, "Gas");
  const alg12 = findPowertrainCorrection("2012", "Tiffin", "Allegro", "30GA");
  assert.equal(alg12!.fuelType, "Gas");
  assert.equal(alg12!.horsepower, 362);
  // Bare allegro must not steal diesel lines
  const busViaAllegro = findPowertrainCorrection("2012", "Tiffin", "Allegro Bus", "36QSP");
  assert.equal(busViaAllegro!.fuelType, "Diesel");
  assert.equal(busViaAllegro!.horsepower, 450);

  assert.equal(findPowertrainCorrection("2010", "Tiffin", "Wayfarer", "24QW"), null);
  assert.equal(findPowertrainCorrection("2011", "Tiffin", "Wayfarer", "24QW"), null);
  assert.equal(findPowertrainCorrection("2012", "Tiffin", "Wayfarer", "24BW"), null);
  assert.equal(findPowertrainCorrection("2010", "Tiffin", "Allegro Bay", "38AB"), null);
  assert.equal(findPowertrainCorrection("2011", "Tiffin", "Allegro Bay", "38AB"), null);
  assert.equal(findPowertrainCorrection("2012", "Tiffin", "Allegro Bay", "38AB"), null);
});
