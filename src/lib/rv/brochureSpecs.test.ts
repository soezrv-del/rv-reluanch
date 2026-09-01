import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  honestAcUnits,
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
