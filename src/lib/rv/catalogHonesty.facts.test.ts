/**
 * Facts Powertrain: catalog/brochure SoT HP + torque must render as numbers
 * (or exact brochure option strings). Invent-policy essays never appear
 * in customer-facing cells when SoT has values; missing SoT is omitted.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  engineOmitsLoneTorque,
  formatFactsHorsepower,
  formatFactsTorque,
  honestHorsepowerForCoach,
  honestHorsepowerLabel,
  honestTorqueForCoach,
  honestTorqueLabel,
  isInventPolicyProse,
  parseHp,
} from "./catalogHonesty.ts";
import { sharePowerLines } from "./shareCardPolicy.ts";

const POLICY =
  /do not invent|HP varies\s*\/\s*confirm brochure|Torque varies by option/i;

const DREAM_ENGINE = "Cummins L9 450 std / X15 605 opt";
const BY_YEAR_ENGINE = "Ford 7.3L / V10 (by year)";
const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function assertCustomerFacts(hp: string, tq: string) {
  assert.doesNotMatch(hp, POLICY);
  assert.doesNotMatch(tq, POLICY);
  assert.equal(isInventPolicyProse(hp), false);
  assert.equal(isInventPolicyProse(tq), false);
}

test("Facts: catalog HP on a 'by year' engine shows the SoT number (David screenshot)", () => {
  const hp = formatFactsHorsepower({
    engine: BY_YEAR_ENGINE,
    horsepower: 350,
  });
  const tq = formatFactsTorque({
    engine: BY_YEAR_ENGINE,
    torqueLbFt: null,
  });
  assert.equal(hp, "350 HP");
  assert.equal(tq, "—");
  assertCustomerFacts(hp, tq);
  assert.notEqual(
    honestHorsepowerLabel({ engine: BY_YEAR_ENGINE, horsepower: 350 }),
    "HP varies / confirm brochure — do not invent a single number",
  );
});

test("Facts: year-band brochure HP + torque render as catalog numbers", () => {
  const hp = formatFactsHorsepower({
    engine: "Ford 7.3L V8 Godzilla 335HP",
    horsepower: 335,
  });
  const tq = formatFactsTorque({
    engine: "Ford 7.3L V8 Godzilla 335HP",
    torqueLbFt: 468,
  });
  assert.equal(hp, "335 HP");
  assert.equal(tq, "468 lb-ft");
  assertCustomerFacts(hp, tq);
});

test("Facts: Class C / B / Super C SoT HP+torque are not replaced with essays", () => {
  const classCHp = honestHorsepowerForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 325,
    chassis: "Ford E-450",
    type: "Class C",
  });
  const classCTq = honestTorqueForCoach({
    engine: "Ford 7.3L V8 Godzilla",
    chassis: "Ford E-450",
    type: "Class C",
    torqueLbFt: 450,
  });
  assert.equal(classCHp, "325 HP");
  assert.equal(classCTq, "450 lb-ft");
  assertCustomerFacts(classCHp, classCTq);

  const classBHp = formatFactsHorsepower({
    engine: "Mercedes-Benz 2.0L I4 turbo diesel",
    horsepower: 208,
  });
  const classBTq = formatFactsTorque({
    engine: "Mercedes-Benz 2.0L I4 turbo diesel",
    torqueLbFt: 332,
  });
  assert.equal(classBHp, "208 HP");
  assert.equal(classBTq, "332 lb-ft");
  assertCustomerFacts(classBHp, classBTq);

  const superCHp = formatFactsHorsepower({
    engine: "Ford 6.7L Power Stroke",
    horsepower: 330,
  });
  const superCTq = formatFactsTorque({
    engine: "Ford 6.7L Power Stroke",
    torqueLbFt: 825,
  });
  assert.equal(superCHp, "330 HP");
  assert.equal(superCTq, "825 lb-ft");
  assertCustomerFacts(superCHp, superCTq);
});

test("Facts: year/floorplan HP pairs do not wipe catalog torque", () => {
  assert.equal(
    engineOmitsLoneTorque(
      "Mercedes-Benz 2.0L turbo diesel 211HP (MY27) / 208HP (MY26)",
    ),
    false,
  );
  assert.equal(
    engineOmitsLoneTorque("Cummins B6.7 360HP or L9 400HP (by floorplan length)"),
    false,
  );
  assert.equal(engineOmitsLoneTorque(DREAM_ENGINE), true);
  const yearPair = formatFactsTorque({
    engine: "Mercedes-Benz 2.0L turbo diesel 211HP (MY27) / 208HP (MY26)",
    torqueLbFt: 332,
  });
  assert.equal(yearPair, "332 lb-ft");
  assert.equal(
    formatFactsTorque({ engine: DREAM_ENGINE, torqueLbFt: 1250 }),
    "—",
  );
});

test("Facts: missing SoT omits HP/torque — never invent numbers or policy essays", () => {
  const hp = formatFactsHorsepower({
    engine: BY_YEAR_ENGINE,
    horsepower: 0,
  });
  const tq = formatFactsTorque({
    engine: BY_YEAR_ENGINE,
    torqueLbFt: null,
  });
  assert.equal(hp, "—");
  assert.equal(tq, "—");
  assert.equal(honestHorsepowerLabel({ engine: BY_YEAR_ENGINE, horsepower: 0 }), null);
  assert.equal(honestTorqueLabel({ engine: BY_YEAR_ENGINE, torqueLbFt: null }), null);
  assert.equal(parseHp(BY_YEAR_ENGINE), "—");
  assert.doesNotMatch(parseHp("Ford 7.3L V8 Godzilla"), /335|350|confirm/i);
  assert.equal(parseHp("Ford 7.3L V8 Godzilla"), "—");
});

test("Facts: dual-rating brochure engine keeps option string, never lone 450 or do-not-invent", () => {
  const hp = formatFactsHorsepower({
    engine: DREAM_ENGINE,
    horsepower: 450,
  });
  const tq = formatFactsTorque({
    engine: DREAM_ENGINE,
    torqueLbFt: 1250,
  });
  assert.notEqual(hp, "450 HP");
  assert.match(hp, /450/);
  assert.match(hp, /605|opt/i);
  assert.equal(tq, "—");
  assertCustomerFacts(hp, tq);
});

test("Coachmen Pursuit catalog still has SoT 350 on the by-year engine (screenshot case)", () => {
  const block = src("rvData.ts");
  const start = block.indexOf("    Pursuit: {");
  assert.ok(start > 0, "expected Coachmen Pursuit in catalog");
  const next = block.indexOf("    Chaparral:", start);
  const pursuit = block.slice(start, next > start ? next : start + 4000);
  assert.match(pursuit, /Ford 7\.3L \/ V10 \(by year\)/);
  assert.match(pursuit, /horsepower:\s*350/);
  assert.match(pursuit, /torqueLbFt:\s*468/);
  assert.match(pursuit, /Onan 4000W Gas MicroQuiet/);
  assert.match(pursuit, /sleeps:\s*8/);
  const shown = formatFactsHorsepower({
    engine: BY_YEAR_ENGINE,
    horsepower: 350,
  });
  const shownTq = formatFactsTorque({
    engine: "Ford 7.3L V8 Godzilla",
    torqueLbFt: 468,
  });
  assert.equal(shown, "350 HP");
  assert.equal(shownTq, "468 lb-ft");
  assert.doesNotMatch(shown, POLICY);
  assert.doesNotMatch(shownTq, POLICY);
});

test("Forest River Georgetown Godzilla band has brochure 350 / 468 SoT", () => {
  const block = src("rvData.ts");
  const start = block.indexOf("    Georgetown: {");
  assert.ok(start > 0, "expected Forest River Georgetown in catalog");
  const next = block.indexOf("    FR3:", start);
  const georgetown = block.slice(start, next > start ? next : start + 6000);
  assert.match(georgetown, /from:\s*2020/);
  assert.match(georgetown, /horsepower:\s*350/);
  assert.match(georgetown, /torqueLbFt:\s*468/);
  const five = block.slice(
    block.indexOf('    "Georgetown 5 Series": {'),
    block.indexOf('    "Georgetown XL": {'),
  );
  const xl = block.slice(
    block.indexOf('    "Georgetown XL": {'),
    start,
  );
  assert.match(five, /torqueLbFt:\s*468/);
  assert.match(xl, /torqueLbFt:\s*468/);
  const hp = formatFactsHorsepower({
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 350,
  });
  const tq = formatFactsTorque({
    engine: "Ford 7.3L V8 Godzilla",
    torqueLbFt: 468,
  });
  assert.equal(hp, "350 HP");
  assert.equal(tq, "468 lb-ft");
  assertCustomerFacts(hp, tq);
  const power = sharePowerLines(hp, tq);
  assert.deepEqual(power, ["POWER", "350 HP", "468 lb-ft"]);
});

test("Thor Challenger MY23–24 catalog/pin SoT is 335 / 468", () => {
  const data = src("rvData.ts");
  const start = data.indexOf("    Challenger: {");
  assert.ok(start > 0, "expected Thor Challenger in catalog");
  const next = data.indexOf("    Miramar:", start);
  const challenger = data.slice(start, next > start ? next : start + 8000);
  assert.match(challenger, /from:\s*2023/);
  assert.match(challenger, /horsepower:\s*335/);
  assert.match(challenger, /torqueLbFt:\s*468/);
  const pins = src("powertrainCorrections.ts");
  assert.match(pins, /OEM MY23–24 Challenger: F-53 7\.3 335\/468/);
  const shownHp = formatFactsHorsepower({
    engine: "Ford 7.3L V8 Godzilla 335HP",
    horsepower: 335,
  });
  const shownTq = formatFactsTorque({
    engine: "Ford 7.3L V8 Godzilla 335HP",
    torqueLbFt: 468,
  });
  assert.equal(shownHp, "335 HP");
  assert.equal(shownTq, "468 lb-ft");
  assertCustomerFacts(shownHp, shownTq);
});

test("display paths wire Facts HP/torque to SoT formatters — no honesty wipe on by-year", () => {
  const honesty = src("catalogHonesty.ts");
  assert.doesNotMatch(
    honesty,
    /return "HP varies \/ confirm brochure — do not invent a single number"/,
  );
  assert.doesNotMatch(
    honesty,
    /return "Torque varies by option — confirm door sticker"/,
  );
  assert.match(honesty, /export function formatFactsHorsepower/);
  assert.match(honesty, /export function formatFactsTorque/);
  assert.match(honesty, /export function engineOmitsLoneTorque/);
  assert.doesNotMatch(
    honesty,
    /if \(extractOptionHpClasses\(engine\)\.length >= 2\) \{\s*return null;/,
  );

  const brochure = src("brochureSpecs.ts");
  assert.match(brochure, /honestHorsepowerForCoach/);
  assert.match(brochure, /honestTorqueForCoach/);
  assert.doesNotMatch(brochure, /hpMissingNote/);

  const guard = src("livePowertrainGuard.ts");
  assert.match(guard, /extractOptionHpClasses/);
  assert.match(guard, /engineOmitsLoneTorque/);
  assert.doesNotMatch(
    guard,
    /horsepower:\s*isAmbiguousCatalogValue\(base\.engine\) \? null/,
  );
  assert.doesNotMatch(guard, /torqueLbFt: dualRating \? null/);

  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.match(detail, /formatFactsHorsepower/);
  assert.match(detail, /formatFactsTorque/);
  assert.match(detail, /omitInventPolicyProse/);

  const compare = src("compare.ts");
  assert.match(compare, /formatFactsHorsepower/);
  assert.match(compare, /formatFactsTorque/);
});
