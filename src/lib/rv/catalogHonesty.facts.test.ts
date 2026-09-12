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

test("Coachmen Sportscoach SRS Super C Facts SoT is Class A diesel / ISB 340 — never F-550 invent", () => {
  const block = src("rvData.ts");
  const start = block.indexOf('    "Sportscoach SRS Super C": {');
  assert.ok(start > 0, "expected Sportscoach SRS Super C catalog key");
  const srs = block.slice(start, start + 4500);
  assert.match(srs, /type: "Class A Diesel"/);
  assert.doesNotMatch(srs, /type: "Super C"/);
  assert.match(srs, /Cummins ISB 6\.7L 340HP @ 2600/);
  assert.match(srs, /Straight Rail Freightliner Chassis/);
  assert.match(srs, /torqueLbFt:\s*700/);
  assert.doesNotMatch(srs, /engine: "Ford Power Stroke/);
  assert.doesNotMatch(srs, /chassis: "Ford F-550"/);
  assert.doesNotMatch(srs, /"350RB"|"376DB"/);
  const shown = formatFactsHorsepower({
    engine: "Cummins ISB 6.7L 340HP @ 2600",
    horsepower: 340,
  });
  const shownTq = formatFactsTorque({
    engine: "Cummins ISB 6.7L 340HP @ 2600",
    torqueLbFt: 700,
  });
  assert.equal(shown, "340 HP");
  assert.equal(shownTq, "700 lb-ft");
  assertCustomerFacts(shown, shownTq);
});

test("Forest River fifth-wheel Facts SoT: 2026 spec-table quarantine + dated 2027 only where a family card exists", () => {
  const block = src("rvData.ts");
  const f0 = block.indexOf('\n  "Forest River": {');
  const f1 = block.indexOf('\n  "Keystone": {');
  const fr = block.slice(f0, f1);
  const aw = fr.slice(fr.indexOf('    "Cherokee Arctic Wolf": {'), fr.indexOf("    Sandstorm: {"));
  assert.match(aw, /"2026": \["27SGS", "285OPT", "287BH", "289PANO", "3250SUITE", "331BH", "3650SUITE", "3750SUITE", "387ML", "38DST", "38LEAH.G", "3950SUITE"\]/);
  assert.doesNotMatch(aw, /"2026": .*"3800DECK"/);
  assert.doesNotMatch(aw, /"2027":/);
  const sab = fr.slice(fr.indexOf("    Sabre: {"), fr.indexOf('    "Cherokee Arctic Wolf": {'));
  assert.match(sab, /yearStart:\s*2025/);
  assert.match(sab, /"2025": \["25RLS", "26BBR", "32BHT"/);
  assert.match(sab, /"2027": \["32GKS", "32RK"/);
  assert.doesNotMatch(sab, /"2027": .*"38DBL"/);
  assert.doesNotMatch(sab, /"2010":|"2024":/);
  const col = fr.slice(fr.indexOf("    Columbus: {"), fr.indexOf("    Cardinal: {"));
  assert.match(col, /yearStart:\s*2025/);
  assert.match(col, /"2025": \["376DS", "379MBL", "380RL"/);
  assert.doesNotMatch(col, /"2027":/);
  assert.doesNotMatch(col, /"2010":|"2024":/);
  const card = fr.slice(fr.indexOf("    Cardinal: {"), fr.indexOf('    "Cedar Creek": {'));
  assert.match(card, /yearStart:\s*2025/);
  assert.match(card, /"2025": \["32LIVE", "33CHEF", "35FL", "35FUN", "36MB", "37BEST", "402BEDS", "41DREAM"\]/);
  assert.match(card, /"2027": \["32CHILL", "33CHEF", "35CRIB", "36FL", "36FUN", "37GALLEY", "38DEN", "41DUB"\]/);
  assert.doesNotMatch(card, /"2010":|"2024":/);
  const cc = fr.slice(fr.indexOf('    "Cedar Creek": {'), fr.indexOf("    Sabre: {"));
  assert.match(cc, /yearStart:\s*2025/);
  assert.match(cc, /"2025": \["361RL", "370FL", "379BHO", "381MUD", "395WOW"\]/);
  assert.doesNotMatch(cc, /"2010":|"2024":/);
  const sig = fr.slice(fr.indexOf('    "Rockwood Signature": {'), fr.indexOf("    Columbus: {"));
  assert.match(sig, /yearStart:\s*2025/);
  assert.match(sig, /"2025": \["R281RK", "R282RK", "R301RKS"/);
  assert.doesNotMatch(sig, /"2010":|"2024":/);
});

test("Forest River thin-line Facts SoT: 2010–2014 dated locks + empty GAP years", () => {
  const block = src("rvData.ts");
  const f0 = block.indexOf('\n  "Forest River": {');
  const f1 = block.indexOf("\n  Airstream: {");
  const fr = block.slice(f0, f1);
  const mini = fr.slice(fr.indexOf('    "Rockwood Mini Lite": {'), fr.indexOf('    "Rockwood Ultra Lite": {'));
  assert.match(mini, /yearStart:\s*2013/);
  assert.match(mini, /"2013": \["1809S", "2104S", "2109S", "2304", "2306", "2502S", "2503S", "2504"\]/);
  assert.doesNotMatch(mini, /"2014":/);
  assert.match(mini, /"2027": \["2108RB", "2109S", "2205S", "2213S"/);
  const micro = fr.slice(fr.indexOf('    "Flagstaff Micro Lite": {'), fr.indexOf('    "Salem Cruise Lite": {'));
  assert.match(micro, /yearStart:\s*2015/);
  assert.doesNotMatch(micro, /"2010":|"2011":|"2012":|"2013":|"2014":/);
  const cruise = fr.slice(fr.indexOf('    "Salem Cruise Lite": {'), fr.indexOf('    "Salem Hemisphere": {'));
  assert.match(cruise, /yearStart:\s*2013/);
  assert.match(cruise, /"2013": \["221RB", "241QB", "251RL", "261BH", "271BH", "281BH", "281QB", "291FB"\]/);
  assert.doesNotMatch(cruise, /"2010":|"2011":|"2012":/);
  const wild = fr.slice(fr.indexOf("    Wildwood: {"), fr.indexOf('    "r-Pod": {'));
  assert.match(wild, /yearStart:\s*2014/);
  assert.doesNotMatch(wild, /"2010":|"2011":|"2012":|"2013":/);
  const rpod = fr.slice(fr.indexOf('    "r-Pod": {'));
  assert.match(rpod, /yearStart:\s*2010/);
  assert.match(rpod, /"2010": \["RP-151"/);
  assert.doesNotMatch(rpod, /"2022":/);
  assert.doesNotMatch(rpod, /"2027":/);
  assert.doesNotMatch(rpod, /"22RB"/);
});

test("Alliance RV Facts SoT: dated 2026 brochure + RVUSA 2027 locks; V-Series GAP", () => {
  const block = src("rvData.ts");
  const a0 = block.indexOf('\n  "Alliance RV": {');
  const a1 = block.indexOf('\n  "Highland Ridge": {');
  assert.ok(a0 > 0 && a1 > a0, "expected Alliance RV block");
  const alli = block.slice(a0, a1);

  const paradigm = alli.slice(alli.indexOf("    Paradigm: {"), alli.indexOf("    Avenue: {"));
  assert.match(
    paradigm,
    /"2026": \[\s*"295MK",\s*"310RL",\s*"312RK",\s*"340RL",\s*"370FB",\s*"375RD",\s*"382RK",\s*"385FL",\s*"388SP",\s*"395DS"\s*\]/,
  );
  assert.match(
    paradigm,
    /"2027": \[\s*"310RL",\s*"312RK",\s*"340RL",\s*"370FB",\s*"375RD",\s*"382RK",\s*"385FL",\s*"386FL",\s*"388SP",\s*"395DS"\s*\]/,
  );
  assert.doesNotMatch(paradigm, /"2026": .*"395MK"/);
  assert.doesNotMatch(paradigm, /"373FB"/);
  assert.match(paradigm, /hitchType: "king pin"/);

  const avenue = alli.slice(alli.indexOf("    Avenue: {"), alli.indexOf("    Valor: {"));
  assert.match(avenue, /"2026": \["32RLS", "33RKS", "35RKS", "38DBL", "39MBR"\]/);
  assert.match(avenue, /"2027": \["32RLS", "34RLS", "35RKS", "38DBL", "39MBR"\]/);
  assert.doesNotMatch(avenue, /"332RL"|"333BH"|"25RL"/);
  assert.match(avenue, /type: "Fifth Wheel"/);

  const valor = alli.slice(alli.indexOf("    Valor: {"), alli.indexOf('    "Valor V-Series": {'));
  assert.match(valor, /"2026": \["36V11", "37V11", "40V13", "41V13", "41V16", "42V14", "44V14"\]/);
  assert.match(
    valor,
    /"2027": \[\s*"23T15",\s*"27T14",\s*"32T13",\s*"36V11",\s*"37V11",\s*"41V13",\s*"4213",\s*"4216",\s*"44V14"\s*\]/,
  );
  assert.doesNotMatch(valor, /"32A10"|"35A14"|"36A10"/);

  const vseries = alli.slice(alli.indexOf('    "Valor V-Series": {'), alli.indexOf("    Delta: {"));
  assert.doesNotMatch(vseries, /"2026":|"2027":/);
  assert.match(vseries, /yearEnd:\s*2025/);

  const delta = alli.slice(alli.indexOf("    Delta: {"), alli.indexOf("    Benchmark: {"));
  assert.match(delta, /type: "Travel Trailer"/);
  assert.match(delta, /hitchType: "bumper-pull"/);
  assert.doesNotMatch(delta, /"2022":|"2023":|"2024":/);
  assert.doesNotMatch(delta, /"282RK"|"294RL"|"312BH"|"RB152"/);
  assert.match(delta, /"274RKW"/);
  assert.match(delta, /yearStart:\s*2023/);

  const bench = alli.slice(alli.indexOf("    Benchmark: {"));
  assert.match(bench, /type: "Travel Trailer"/);
  assert.match(bench, /"2026": \["42LFT", "44LFT", "44RKL"\]/);
  assert.match(bench, /"2027": \["42LFT", "44LFT", "44RKL"\]/);
  assert.doesNotMatch(bench, /"2023":|"2024":|"2025":/);
  assert.doesNotMatch(bench, /"29BH"|"37FL"/);
  assert.match(bench, /yearStart:\s*2025/);
});

test("Palomino Facts SoT: Sabre quarantined; SolAire MY2026 brochure lock; MY2027 GAP", () => {
  const block = src("rvData.ts");
  const p0 = block.indexOf("\n  Palomino: {");
  const p1 = block.indexOf("\n  Dutchmen: {");
  assert.ok(p0 > 0 && p1 > p0, "expected Palomino block");
  const pal = block.slice(p0, p1);
  assert.doesNotMatch(pal, /\n    Sabre: \{/);
  assert.doesNotMatch(pal, /\n    "Sabre": \{/);
  const solaire = pal.slice(pal.indexOf("    SolAire: {"), pal.indexOf("    Columbus: {"));
  assert.match(
    solaire,
    /"2026": \["232UD", "235BH", "237RK", "302BHS", "2420RBS", "2430BHS", "2580RBSS", "2750BHS", "3060RKTS", "3070RKLS", "3150TBSS", "3200TSBH", "3300FLBS", "3380RLBT"\]/,
  );
  assert.doesNotMatch(solaire, /"2027":/);
  assert.match(solaire, /yearEnd:\s*2026/);
  const puma = pal.slice(pal.indexOf("    Puma: {"), pal.indexOf("    SolAire: {"));
  assert.match(puma, /type: "Travel Trailer"/);
  assert.match(
    puma,
    /"2005": \["19FS", "25BH", "25RKS", "26FBS", "26RLSS", "27RLS", "27FQ", "28BHS", "29BHSS", "29FKSS", "29FQS", "30DBSS", "30FQSS", "31DSBH"\]/,
  );
  assert.match(
    puma,
    /"2006": \["19FS", "25RS", "25RKS", "26RB", "26FBSS", "26RLSS", "27FQ", "27RBSS", "27RLS", "28BHS", "29FBS", "29FKSS", "29FQS", "29RKSS", "30DBSS", "30FQSS", "30QBSS", "31DSBH", "31FKBS", "32RDSS"\]/,
  );
  assert.doesNotMatch(puma, /"2007":|"2008":|"2009":/);
  assert.doesNotMatch(puma, /"2026":|"2027":/);
  assert.doesNotMatch(
    puma,
    /"243RESS"|"249RBSS"|"253FBS"|"255RKS"|"259RGSS"|"275RLSS"|"282RKSS"|"285BHSS"|"301RESS"|"311QBSS"|"39PRLSS"|"39PTBSS"/,
  );
  const columbus = pal.slice(pal.indexOf("    Columbus: {"), pal.indexOf('    "Columbus Compass": {'));
  assert.doesNotMatch(columbus, /"2026":|"2027":/);
  assert.doesNotMatch(columbus, /377DS|379MBL|384RKH|389FLH/);
  const realLite = pal.slice(pal.indexOf('    "Real-Lite": {'), pal.indexOf('    "Real-Lite FW": {'));
  assert.match(realLite, /type: "Truck Camper"/);
  assert.doesNotMatch(realLite, /"2006":|"2007":|"2008":|"2009":/);
  assert.doesNotMatch(realLite, /"2026":|"2027":/);

  const fr0 = block.indexOf('\n  "Forest River": {');
  const fr1 = block.indexOf('\n  "Keystone": {');
  const frSab = block.slice(fr0, fr1).slice(
    block.slice(fr0, fr1).indexOf("    Sabre: {"),
    block.slice(fr0, fr1).indexOf('    "Cherokee Arctic Wolf": {'),
  );
  assert.match(frSab, /not Palomino/);
});

test("Chinook Facts SoT: dated 2025–2026 library PDFs + RVUSA year cards; 2027/Destiny GAP", () => {
  const block = src("rvData.ts");
  const c0 = block.indexOf('\n  "Chinook": {');
  const c1 = block.indexOf('\n  "Pleasure-Way": {');
  assert.ok(c0 > 0 && c1 > c0, "expected Chinook block");
  const chinook = block.slice(c0, c1);

  assert.doesNotMatch(chinook, /\n    Destiny: \{/);
  assert.doesNotMatch(chinook, /\n    "Destiny": \{/);
  assert.doesNotMatch(chinook, /horsepower:\s*\d/);
  assert.doesNotMatch(chinook, /torqueLbFt:\s*\d/);

  const summit = chinook.slice(chinook.indexOf('    "Summit": {'), chinook.indexOf('    "Maverick": {'));
  assert.match(summit, /type: "Class B\+"/);
  assert.match(summit, /fuelType: "Diesel"/);
  assert.match(summit, /yearStart:\s*2021/);
  assert.match(summit, /"2025": \[\s*"DS",\s*"EB",\s*"SS"\s*\]/);
  assert.match(summit, /"2026": \[\s*"EB",\s*"SS"\s*\]/);
  assert.doesNotMatch(summit, /"2027":|"2024":|"2021":|"FTB"|"MT"/);

  const maverick = chinook.slice(chinook.indexOf('    "Maverick": {'), chinook.indexOf('    "Bayside": {'));
  assert.match(maverick, /type: "Class B\+"/);
  assert.match(maverick, /fuelType: "Gas"/);
  assert.match(maverick, /yearStart:\s*2022/);
  assert.match(maverick, /"2025": \[\s*"DS",\s*"EB",\s*"SS"\s*\]/);
  assert.match(maverick, /"2026": \[\s*"EB",\s*"SS"\s*\]/);
  assert.doesNotMatch(maverick, /"2027":|"2024":|"FTB"|"MT"/);

  const bayside = chinook.slice(chinook.indexOf('    "Bayside": {'), chinook.indexOf('    "Concourse": {'));
  assert.match(bayside, /type: "Class B"/);
  assert.doesNotMatch(bayside, /type: "Class B\+"/);
  assert.match(bayside, /fuelType: "Gas"/);
  assert.match(bayside, /yearStart:\s*2021/);
  assert.match(bayside, /"2025": \[\s*"RS",\s*"SS",\s*"TB"\s*\]/);
  assert.match(bayside, /"2026": \[\s*"RS",\s*"RT",\s*"SS",\s*"TB"\s*\]/);
  assert.doesNotMatch(bayside, /"2027":|"2024":/);

  const concourse = chinook.slice(chinook.indexOf('    "Concourse": {'));
  assert.match(concourse, /type: "Class B\+"/);
  assert.match(concourse, /fuelType: "Diesel"/);
  assert.match(concourse, /yearStart:\s*2026/);
  assert.match(concourse, /"2026": \[\s*"MT"\s*\]/);
  assert.doesNotMatch(concourse, /"2025":|"2027":|"FTB"/);
});

test("Roadtrek Facts SoT: dated library PDFs + RVUSA year cards; ghosts quarantined", () => {
  const block = src("rvData.ts");
  const r0 = block.indexOf("\n  Roadtrek: {");
  const r1 = block.indexOf('\n  "Nexus RV": {');
  assert.ok(r0 > 0 && r1 > r0, "expected Roadtrek block");
  const roadtrek = block.slice(r0, r1);

  assert.doesNotMatch(roadtrek, /\n    Pivot: \{/);
  assert.doesNotMatch(roadtrek, /"170"|"190P"|"136"|"170D"|"170P"|"Chase Plus"/);

  const zion = roadtrek.slice(roadtrek.indexOf("    Zion: {"), roadtrek.indexOf('    "Zion Slumber": {'));
  assert.match(zion, /type: "Class B"/);
  assert.match(zion, /fuelType: "Gas"/);
  assert.match(zion, /yearStart:\s*2015/);
  assert.match(zion, /"2017": \[\s*"Zion",\s*"Zion SRT"\s*\]/);
  assert.match(zion, /"2026": \[\s*"Zion"\s*\]/);
  assert.match(zion, /"2027": \[\s*"Zion"\s*\]/);
  assert.doesNotMatch(zion, /"2020":|"2015":|"Sleeper"|"SL"/);

  const slumber = roadtrek.slice(roadtrek.indexOf('    "Zion Slumber": {'), roadtrek.indexOf("    Play: {"));
  assert.match(slumber, /yearStart:\s*2021/);
  assert.match(slumber, /"2021": \[\s*"Zion Slumber"\s*\]/);
  assert.match(slumber, /"2027": \[\s*"Zion Slumber"\s*\]/);
  assert.doesNotMatch(slumber, /"2015":|"2020":/);

  const play = roadtrek.slice(roadtrek.indexOf("    Play: {"), roadtrek.indexOf('    "SS Agile": {'));
  assert.match(play, /fuelType: "Gas"/);
  assert.match(play, /yearStart:\s*2021/);
  assert.match(play, /"2025": \[\s*"Play",\s*"Play Slumber",\s*"Play SRT",\s*"Play\+",\s*"Play\+ Slumber"\s*\]/);
  assert.match(play, /"2026": \[\s*"Play",\s*"Play Slumber",\s*"Play\+",\s*"Play\+ Slumber"\s*\]/);
  assert.match(play, /"2027": \[\s*"Play Slumber"\s*\]/);
  assert.doesNotMatch(play, /"2018":|"2024":|"136"/);

  const agile = roadtrek.slice(roadtrek.indexOf('    "SS Agile": {'), roadtrek.indexOf("    Chase: {"));
  assert.match(agile, /fuelType: "Diesel"/);
  assert.match(agile, /yearStart:\s*2007/);
  assert.match(agile, /"2007": \[\s*"SS-Agile"\s*\]/);
  assert.match(agile, /"2008": \[\s*"SS-Agile"\s*\]/);
  assert.match(agile, /"2011": \[\s*"SS-Agile"\s*\]/);
  assert.match(agile, /"2026": \[\s*"SS Agile"\s*\]/);
  assert.doesNotMatch(agile, /"2009":|"2010":|"2027":|"2020":|"2023":/);

  const chase = roadtrek.slice(roadtrek.indexOf("    Chase: {"), roadtrek.indexOf('    "CS Adventurous": {'));
  assert.match(chase, /fuelType: "Gas"/);
  assert.match(chase, /yearStart:\s*2021/);
  assert.match(chase, /"2024": \[\s*"Chase 50"\s*\]/);
  assert.match(chase, /"2027": \[\s*"Chase"\s*\]/);
  assert.doesNotMatch(chase, /"2016":|"Chase Plus"/);

  const cs = roadtrek.slice(roadtrek.indexOf('    "CS Adventurous": {'), roadtrek.indexOf("    Popular: {"));
  assert.match(cs, /fuelType: "Diesel"/);
  assert.match(cs, /yearStart:\s*2008/);
  assert.match(cs, /yearEnd:\s*2019/);
  assert.match(cs, /"2019": \[\s*"CS Adventurous"\s*\]/);
  assert.doesNotMatch(cs, /"2000":|"2005":|"2008":|"2009":|"2010":|"2026":|"2027":/);

  const popular = roadtrek.slice(roadtrek.indexOf("    Popular: {"));
  assert.match(popular, /fuelType: "Gas"/);
  assert.match(popular, /yearStart:\s*2000/);
  assert.match(popular, /yearEnd:\s*2018/);
  assert.match(popular, /"2000": \[\s*"170-Popular",\s*"190-Popular",\s*"200-Popular"\s*\]/);
  assert.match(popular, /"2004": \[\s*"170-Popular",\s*"190-Popular",\s*"210-Popular"\s*\]/);
  assert.match(popular, /"2008": \[\s*"170-Popular",\s*"190-Popular",\s*"210-Popular"\s*\]/);
  assert.match(popular, /"2011": \[\s*"190-Popular",\s*"210-Popular"\s*\]/);
  assert.match(popular, /"2017": \[\s*"190 Popular",\s*"210 Popular"\s*\]/);
  assert.doesNotMatch(popular, /"2009":|"2010":|"2026":|"170D"|"190-Versatile"|"200-Versatile"|"210-Versatile"/);
});

test("Holiday Rambler Facts SoT: MY2027 OEM+PDF locks; GAP Ambassador/Navigator/Augusta/Xpedition", () => {
  const block = src("rvData.ts");
  const h0 = block.indexOf('\n  "Holiday Rambler": {');
  const h1 = block.indexOf("\n  Heartland: {");
  assert.ok(h0 > 0 && h1 > h0, "expected Holiday Rambler block");
  const hr = block.slice(h0, h1);

  assert.doesNotMatch(hr, /\n    Fleetwood: \{/);
  assert.doesNotMatch(hr, /\n    "American Coach": \{/);

  const armada = hr.slice(hr.indexOf("    Armada: {"), hr.indexOf("    Vacationer: {"));
  assert.match(armada, /type: "Class A Diesel"/);
  assert.match(armada, /"2027": \["40M", "40P", "44B", "44LE"\]/);
  assert.match(armada, /"2026": \["40M", "40P", "44B", "44LE"\]/);
  assert.doesNotMatch(armada, /"44E"|"45EL"|"45F"/);
  assert.doesNotMatch(armada, /"2026": .*"38F"/);

  const invicta = hr.slice(hr.indexOf("    Invicta: {"), hr.indexOf("    Augusta: {"));
  assert.match(invicta, /type: "Class A Gas"/);
  assert.match(invicta, /"2027": \["32RW", "33HB", "34MB", "35R", "36Y"\]/);
  assert.match(invicta, /"2026": \["32RW", "33HB", "34MB", "36T", "36Y"\]/);
  assert.doesNotMatch(invicta, /"2027": .*"36T"/);
  assert.doesNotMatch(invicta, /"34RB"|"36TX"|"36U"/);

  const vacationer = hr.slice(hr.indexOf("    Vacationer: {"), hr.indexOf("    Invicta: {"));
  assert.match(vacationer, /type: "Class A Gas"/);
  assert.match(vacationer, /"2027": \["33C", "35GL", "35K", "36F"\]/);
  assert.doesNotMatch(vacationer, /"2026": .*"32A"|"2026": .*"35P"/);

  const admiral = hr.slice(hr.indexOf("    Admiral: {"), hr.indexOf("    Endeavor: {"));
  assert.match(admiral, /type: "Class A Gas"/);
  assert.match(admiral, /yearStart:\s*2026/);
  assert.match(admiral, /"2027": \["28A", "29M", "32N", "34J"\]/);

  const endeavor = hr.slice(hr.indexOf("    Endeavor: {"), hr.indexOf("    Nautica: {"));
  assert.match(endeavor, /type: "Class A Diesel"/);
  assert.match(endeavor, /"2027": \["38K", "38N", "38W"\]/);
  assert.match(endeavor, /"2026": \["38N", "38W"\]/);
  assert.doesNotMatch(endeavor, /"38L"/);

  const nautica = hr.slice(hr.indexOf("    Nautica: {"), hr.indexOf("    Incline: {"));
  assert.match(nautica, /type: "Class A Diesel"/);
  assert.match(nautica, /"2027": \["33TL", "34RX", "37S"\]/);

  const incline = hr.slice(hr.indexOf("    Incline: {"), hr.indexOf('    "Incline FS550": {'));
  assert.match(incline, /type: "Class C"/);
  assert.match(incline, /fuelType: "Gas"/);
  assert.match(incline, /"2027": \["27U", "29H", "31W"\]/);
  assert.doesNotMatch(incline, /"25M"|"26ME"|"32DBH"/);

  const fs550 = hr.slice(hr.indexOf('    "Incline FS550": {'), hr.indexOf('    "Incline FS600D": {'));
  assert.match(fs550, /type: "Super C"/);
  assert.match(fs550, /fuelType: "Gas"/);
  assert.match(fs550, /"2027": \["30SB", "30WM", "32AW"\]/);

  const fs600 = hr.slice(hr.indexOf('    "Incline FS600D": {'));
  assert.match(fs600, /type: "Super C"/);
  assert.match(fs600, /fuelType: "Diesel"/);
  assert.match(fs600, /"2027": \["36CS", "36FW"\]/);

  const ambassador = hr.slice(hr.indexOf("    Ambassador: {"), hr.indexOf("    Armada: {"));
  assert.doesNotMatch(ambassador, /"2027":/);

  const navigator = hr.slice(hr.indexOf("    Navigator: {"), hr.indexOf("    Ambassador: {"));
  assert.doesNotMatch(navigator, /"2027":/);

  const augusta = hr.slice(hr.indexOf("    Augusta: {"), hr.indexOf("    Xpedition: {"));
  assert.doesNotMatch(augusta, /"2027":/);
  assert.doesNotMatch(augusta, /"27U"|"29H"|"31W"/);

  const xpedition = hr.slice(hr.indexOf("    Xpedition: {"), hr.indexOf("    Admiral: {"));
  assert.doesNotMatch(xpedition, /"2027":/);
});

test("Fleetwood Facts SoT: MY2027 OEM+PDF locks; GAP Insight; retired shells closed", () => {
  const block = src("rvData.ts");
  const f0 = block.indexOf("\n  Fleetwood: {");
  const f1 = block.indexOf("\n  Jayco: {");
  assert.ok(f0 > 0 && f1 > f0, "expected Fleetwood block");
  const fw = block.slice(f0, f1);

  assert.doesNotMatch(fw, /\n    "Holiday Rambler": \{/);
  assert.doesNotMatch(fw, /\n    "American Coach": \{/);

  const bounder = fw.slice(fw.indexOf("    Bounder: {"), fw.indexOf('    "Bounder Classic"'));
  assert.match(bounder, /type: "Class A Gas"/);
  assert.match(bounder, /"2027": \["33C", "35GL", "35K", "36F"\]/);

  const discovery = fw.slice(fw.indexOf("    Discovery: {"), fw.indexOf('    "Discovery LXE": {'));
  assert.match(discovery, /type: "Class A Diesel"/);
  assert.match(discovery, /"2027": \["38K", "38N", "38W"\]/);
  assert.doesNotMatch(discovery, /"38L"/);
  assert.doesNotMatch(discovery, /"2026": .*"38K"/);

  const lxe = fw.slice(fw.indexOf('    "Discovery LXE": {'), fw.indexOf("    Frontier: {"));
  assert.match(lxe, /type: "Class A Diesel"/);
  assert.match(lxe, /"2027": \["40G", "40M", "44B", "44S"\]/);

  const flair = fw.slice(fw.indexOf("    Flair: {"), fw.indexOf("    Fortis: {"));
  assert.match(flair, /type: "Class A Gas"/);
  assert.match(flair, /"2027": \["28A", "29M", "32S", "33B6"\]/);

  const frontier = fw.slice(fw.indexOf("    Frontier: {"), fw.indexOf('    "Frontier GTX"'));
  assert.match(frontier, /type: "Class A Diesel"/);
  assert.match(frontier, /"2027": \["33TL", "37S", "38RT", "39B"\]/);
  assert.doesNotMatch(frontier, /"2026": .*"39B"/);

  const palisade = fw.slice(fw.indexOf("    Palisade: {"), fw.indexOf("    Bounder: {"));
  assert.match(palisade, /type: "Class A Diesel"/);
  assert.match(palisade, /"2027": \["40H", "45CS", "45DS", "45FS"\]/);

  const altitude = fw.slice(fw.indexOf("    Altitude: {"), fw.indexOf("    Insight: {"));
  assert.match(altitude, /type: "Class C"/);
  assert.match(altitude, /"2027": \["27U", "29F", "29H", "31W"\]/);

  const fs550 = fw.slice(fw.indexOf('    "Altitude FS550": {'), fw.indexOf('    "Altitude FS600D": {'));
  assert.match(fs550, /type: "Super C"/);
  assert.match(fs550, /fuelType: "Gas"/);
  assert.match(fs550, /"2027": \["30SB", "30WM", "32AW"\]/);

  const fs600 = fw.slice(fw.indexOf('    "Altitude FS600D": {'), fw.indexOf("    Xcursion: {"));
  assert.match(fs600, /type: "Super C"/);
  assert.match(fs600, /fuelType: "Diesel"/);
  assert.match(fs600, /"2027": \["36CS", "36FW"\]/);

  const fortis = fw.slice(fw.indexOf("    Fortis: {"), fw.indexOf("    Flex: {"));
  assert.match(fortis, /type: "Class A Gas"/);
  assert.match(fortis, /"2027": \["32RW", "33HB", "34MB", "35R", "36Y"\]/);
  assert.match(fortis, /"2026": \["32RW", "33HB", "34MB", "36T", "36Y"\]/);
  assert.doesNotMatch(fortis, /"2027": .*"36T"/);

  const insight = fw.slice(fw.indexOf("    Insight: {"), fw.indexOf('    "Altitude FS550": {'));
  assert.doesNotMatch(insight, /"2027":/);

  const gtx = fw.slice(fw.indexOf('    "Frontier GTX": {'), fw.indexOf("    Palisade: {"));
  assert.doesNotMatch(gtx, /"2027":/);
  const flex = fw.slice(fw.indexOf("    Flex: {"), fw.indexOf("    Jamboree: {"));
  assert.doesNotMatch(flex, /"2027":/);
  const xcursion = fw.slice(fw.indexOf("    Xcursion: {"));
  assert.doesNotMatch(xcursion, /"2027":/);
});

test("American Coach Facts SoT: MY2027 OEM+PDF locks; GAP Tradition", () => {
  const block = src("rvData.ts");
  const a0 = block.indexOf('\n  "American Coach": {');
  const a1 = block.indexOf('\n  "Entegra Coach": {');
  assert.ok(a0 > 0 && a1 > a0, "expected American Coach block");
  const ac = block.slice(a0, a1);

  assert.doesNotMatch(ac, /\n    Fleetwood: \{/);
  assert.doesNotMatch(ac, /\n    "Holiday Rambler": \{/);

  const dream = ac.slice(ac.indexOf('    "American Dream": {'));
  assert.match(dream, /type: "Class A Diesel"/);
  assert.match(dream, /"2027": \["42Q", "45A", "45P"\]/);
  assert.match(dream, /"2026": \["45A", "45B", "42C", "44Q"\]/);
  assert.doesNotMatch(dream, /"45Q"/);
  assert.doesNotMatch(dream, /"2027": .*"45B"/);
  assert.doesNotMatch(dream, /"2026": .*"42Q"/);

  const eagle = ac.slice(ac.indexOf('    "American Eagle": {'), ac.indexOf('    "American Dream": {'));
  assert.match(eagle, /type: "Class A Diesel"/);
  assert.match(eagle, /"2027": \["45FW", "45J", "45K"\]/);
  assert.match(eagle, /"2026": \["45B", "45J", "42X", "45A", "45T"\]/);
  assert.doesNotMatch(eagle, /"2027": .*"45B"/);
  assert.doesNotMatch(eagle, /"2026": .*"45FW"/);

  const tradition = ac.slice(ac.indexOf('    "American Tradition": {'), ac.indexOf('    "American Eagle": {'));
  assert.match(tradition, /type: "Class A Diesel"/);
  assert.match(tradition, /"2026": \["42Q", "42V", "42B", "42X", "45T"\]/);
  assert.doesNotMatch(tradition, /"2027":/);
});

test("Renegade RV Facts SoT: MY2027 OEM+PDF locks; Villagio reopen; GAP Villager/Ikon", () => {
  const block = src("rvData.ts");
  const r0 = block.indexOf('\n  "Renegade RV": {');
  const r1 = block.indexOf("\n  Dynamax: {");
  assert.ok(r0 > 0 && r1 > r0, "expected Renegade RV block");
  const rg = block.slice(r0, r1);

  assert.doesNotMatch(rg, /\n    "American Coach": \{/);
  assert.doesNotMatch(rg, /\n    Fleetwood: \{/);
  assert.doesNotMatch(rg, /\n    "Holiday Rambler": \{/);

  const valencia = rg.slice(rg.indexOf("    Valencia: {"), rg.indexOf("    Verona: {"));
  assert.match(valencia, /type: "Class C Diesel"/);
  assert.match(valencia, /"2027": \["36SB", "39BB", "39FW", "39RB"\]/);
  assert.match(valencia, /"2026": \["35MB", "38RW", "38RBB", "40RBB", "45RB", "45RBB"\]/);
  assert.doesNotMatch(valencia, /"2026": .*"36SB"/);

  const verona = rg.slice(rg.indexOf("    Verona: {"), rg.indexOf('    "Verona LE": {'));
  assert.match(verona, /type: "Super C Diesel"/);
  assert.match(verona, /"2027": \["36VSB", "40VTB", "40VTR", "40VTS"\]/);
  assert.doesNotMatch(verona, /"2027": .*"38LDG"/);
  assert.doesNotMatch(verona, /"2026": .*"40VTB"/);

  const le = rg.slice(rg.indexOf('    "Verona LE": {'), rg.indexOf('    "Classic Super C": {'));
  assert.match(le, /type: "Super C Diesel"/);
  assert.match(le, /"2027": \["38LDG", "40LBH", "40LRB", "40LTS"\]/);
  assert.doesNotMatch(le, /"2027": .*"36VSB"/);
  assert.doesNotMatch(le, /"2026": .*"38LDG"/);

  const classic = rg.slice(rg.indexOf('    "Classic Super C": {'), rg.indexOf("    Ikon: {"));
  assert.match(classic, /type: "Super C Diesel"/);
  assert.match(classic, /"2027": \["38CSB", "41CMB", "41CRB", "41CRW", "43CMD", "45CBF", "45CME", "45CMR", "45CRS"\]/);
  assert.doesNotMatch(classic, /"CS150"/);
  assert.doesNotMatch(classic, /"CS170"/);
  assert.doesNotMatch(classic, /"CS172"/);
  assert.doesNotMatch(classic, /"2509"/);
  assert.doesNotMatch(classic, /"2509GS"/);
  assert.doesNotMatch(classic, /"2026": .*"38CSB"/);

  const ikon = rg.slice(rg.indexOf("    Ikon: {"), rg.indexOf("    Villagio: {"));
  assert.doesNotMatch(ikon, /"2027":/);

  const villagio = rg.slice(rg.indexOf("    Villagio: {"), rg.indexOf("    Villager: {"));
  assert.match(villagio, /type: "Class C Diesel"/);
  assert.doesNotMatch(villagio, /type: "Class A Diesel"/);
  assert.doesNotMatch(villagio, /yearEnd: 2024/);
  assert.match(villagio, /"2027": \["25FWC", "25RMC", "25TBC"\]/);
  assert.doesNotMatch(villagio, /"25FW"/);
  assert.doesNotMatch(villagio, /"25RM"/);
  assert.doesNotMatch(villagio, /"25TB"/);

  const villager = rg.slice(rg.indexOf("    Villager: {"), rg.indexOf("    Vienna: {"));
  assert.doesNotMatch(villager, /"2027":/);

  const vienna = rg.slice(rg.indexOf("    Vienna: {"), rg.indexOf("    XL: {"));
  assert.match(vienna, /type: "Class C Diesel"/);
  assert.match(vienna, /"2027": \["25DLC", "25DLN", "25FWC", "25FWS", "25RMC", "25RML", "25TBC", "25TBN"\]/);
  assert.doesNotMatch(vienna, /"25DNL"/);
  assert.doesNotMatch(vienna, /"2026": .*"25DLN"/);

  const xl = rg.slice(rg.indexOf("    XL: {"), rg.indexOf("    Explorer: {"));
  assert.match(xl, /type: "Super C Diesel"/);
  assert.match(xl, /"2027": \["X43DB", "X45BBC", "X45DBM", "X45QBH", "X45QS"\]/);

  const explorer = rg.slice(rg.indexOf("    Explorer: {"), rg.indexOf('    "Explorer TS": {'));
  assert.match(explorer, /type: "Super C Diesel"/);
  assert.match(explorer, /"2027": \["38EMB", "40EBH", "40ERB"\]/);
  assert.doesNotMatch(explorer, /"42RB"/);

  const ts = rg.slice(rg.indexOf('    "Explorer TS": {'), rg.indexOf("    Veracruz: {"));
  assert.match(ts, /type: "Super C Diesel"/);
  assert.match(ts, /"2027": \["42RB"\]/);
  assert.doesNotMatch(ts, /"38EMB"/);

  const veracruz = rg.slice(rg.indexOf("    Veracruz: {"));
  assert.match(veracruz, /type: "Class C Diesel"/);
  assert.match(veracruz, /"2027": \["30VRM", "33VDS", "33VRS"\]/);
  assert.doesNotMatch(veracruz, /"33TBR"/);
});

test("Midwest Automotive Designs Facts SoT: MY2027 OEM+RVUSA locks; GAP Passage/Weekender", () => {
  const block = src("rvData.ts");
  const m0 = block.indexOf('\n  "Midwest Automotive Designs": {');
  const m1 = block.indexOf('\n  "Outdoors RV": {');
  assert.ok(m0 > 0 && m1 > m0, "expected Midwest Automotive Designs block");
  const mw = block.slice(m0, m1);

  assert.doesNotMatch(mw, /\n    "Renegade RV": \{/);
  assert.doesNotMatch(mw, /\n    "American Coach": \{/);
  assert.doesNotMatch(mw, /\n    Fleetwood: \{/);
  assert.doesNotMatch(mw, /\n    Legend: \{/);
  assert.doesNotMatch(mw, /\n    "Patriot Cruiser": \{/);

  const passage = mw.slice(mw.indexOf("    Passage: {"), mw.indexOf("    Weekender: {"));
  assert.doesNotMatch(passage, /"2027":/);
  assert.match(passage, /"2026": \["FD2", "MD2", "MD3", "MD4", "MD2F"\]/);

  const weekender = mw.slice(mw.indexOf("    Weekender: {"), mw.indexOf('    "Passage Daycruiser": {'));
  assert.doesNotMatch(weekender, /"2027":/);
  assert.doesNotMatch(weekender, /"2005":/);

  const day = mw.slice(mw.indexOf('    "Passage Daycruiser": {'), mw.indexOf("    Heritage: {"));
  assert.doesNotMatch(day, /"2027":/);
  assert.doesNotMatch(day, /"D4"/);
  assert.doesNotMatch(day, /"LD4"/);

  const heritage = mw.slice(mw.indexOf("    Heritage: {"), mw.indexOf('    "Luxe Cruiser": {'));
  assert.match(heritage, /type: "Class B Diesel"/);
  assert.match(heritage, /"2027": \["FD2", "MD2", "MD3", "MD4"\]/);
  assert.doesNotMatch(heritage, /"MD2S"/);
  assert.doesNotMatch(heritage, /"2026":/);

  const luxe = mw.slice(mw.indexOf('    "Luxe Cruiser": {'), mw.indexOf("    Patriot: {"));
  assert.match(luxe, /type: "Class B Diesel"/);
  assert.match(luxe, /"2027": \["D4", "D6", "LD4", "S5"\]/);
  assert.doesNotMatch(luxe, /"D6 Full Partition"/);
  assert.doesNotMatch(luxe, /"D6 Arched Partition"/);
  assert.doesNotMatch(luxe, /"2026":/);

  const patriot = mw.slice(mw.indexOf("    Patriot: {"));
  assert.match(patriot, /type: "Class B Diesel"/);
  assert.match(patriot, /"2027": \["FD2", "MD2", "MD2S", "MD3", "MD4"\]/);
  assert.match(patriot, /"MD2S"/);
  assert.doesNotMatch(patriot, /"2026":/);
});

test("Monaco Coach Facts SoT: Cayman NEW KEY 2011 LOCK; Camelot/Dynasty MY2010–2019 honesty; Knight skip", () => {
  const block = src("rvData.ts");
  const m0 = block.indexOf('\n  "Monaco Coach": {');
  const m1 = block.indexOf('\n  "Holiday Rambler": {');
  assert.ok(m0 > 0 && m1 > m0, "expected Monaco Coach block");
  const mc = block.slice(m0, m1);

  assert.doesNotMatch(mc, /\n    "American Coach": \{/);
  assert.doesNotMatch(mc, /\n    Fleetwood: \{/);
  assert.doesNotMatch(mc, /\n    "Holiday Rambler": \{/);
  assert.doesNotMatch(mc, /\n    Signature: \{/);
  assert.doesNotMatch(mc, /\n    Windsor: \{/);
  assert.doesNotMatch(mc, /\n    "La Palma": \{/);
  assert.doesNotMatch(mc, /\n    Montclair: \{/);
  assert.doesNotMatch(mc, /\n    Riptide: \{/);
  assert.doesNotMatch(mc, /\n    Vesta: \{/);
  assert.doesNotMatch(mc, /\n    Executive: \{/);

  const cayman = mc.slice(mc.indexOf("    Cayman: {"), mc.indexOf("    Diplomat: {"));
  assert.match(cayman, /type: "Class A Diesel"/);
  assert.match(cayman, /fuelType: "Diesel"/);
  assert.match(cayman, /yearStart:\s*2002/);
  assert.match(cayman, /yearEnd:\s*2011/);
  assert.match(cayman, /"2010": \[\]/);
  assert.match(
    cayman,
    /"2011": \["36PBD", "36PFT", "40PBT", "40PBQ"\]/,
  );
  assert.doesNotMatch(cayman, /"2012":|"2019":|"2020":|"2027":/);

  const diplomat = mc.slice(mc.indexOf("    Diplomat: {"), mc.indexOf("    Marquis: {"));
  assert.match(diplomat, /type: "Class A Diesel"/);
  assert.match(diplomat, /yearStart:\s*2005/);
  assert.match(diplomat, /yearEnd:\s*2017/);
  assert.match(diplomat, /"2010": \["38PDQ", "42PAQ", "42SKQ"\]/);
  assert.match(diplomat, /"2011": \["42PAQ", "43DFT", "43PD5", "43PKQ"\]/);
  assert.match(diplomat, /"2012": \[\]/);
  assert.match(
    diplomat,
    /"2013": \["36PFT", "40PDQ", "43DFT", "43PDQ", "43PKQ", "43RFT"\]/,
  );
  assert.match(diplomat, /"2014": \[\]/);
  assert.match(diplomat, /"2015": \[\]/);
  assert.match(diplomat, /"2016": \[\]/);
  assert.match(diplomat, /"2017": \["43D", "43G", "43Q", "43S"\]/);
  assert.doesNotMatch(diplomat, /"2018":|"2019":|"2020":|"2027":/);

  const marquis = mc.slice(mc.indexOf("    Marquis: {"), mc.indexOf("    Monarch: {"));
  assert.match(marquis, /type: "Class A Diesel"/);
  assert.match(marquis, /yearStart:\s*2018/);
  assert.match(marquis, /yearEnd:\s*2019/);
  assert.match(marquis, /"2018": \[\]/);
  assert.match(marquis, /"2019": \["40J", "40L", "44B", "44M"\]/);
  assert.doesNotMatch(marquis, /"2010":|"2017":|"2020":|"2027":/);

  const monarch = mc.slice(mc.indexOf("    Monarch: {"), mc.indexOf("    Dynasty: {"));
  assert.match(monarch, /type: "Class A Gas"/);
  assert.match(monarch, /fuelType: "Gas"/);
  assert.match(monarch, /yearEnd:\s*2014/);
  assert.match(
    monarch,
    /"2010": \["30SFS", "33SDD", "33SFS", "34SBD", "35SFD"\]/,
  );
  assert.match(
    monarch,
    /"2011": \["30SFS", "33SDD", "33SFS", "34SBD", "35SFD"\]/,
  );
  assert.match(monarch, /"2012": \[\]/);
  assert.match(monarch, /"2013": \[\]/);
  assert.match(monarch, /"2014": \[\]/);
  assert.doesNotMatch(monarch, /"2015":|"2019":|"2020":|"2027":/);

  const dynasty = mc.slice(mc.indexOf("    Dynasty: {"), mc.indexOf("    Camelot: {"));
  assert.match(dynasty, /type: "Class A Diesel"/);
  assert.match(dynasty, /yearEnd:\s*2019/);
  assert.match(
    dynasty,
    /"2010": \["Cheshire IV", "Majestic V", "Regal IV", "Yorkshire IV"\]/,
  );
  assert.match(dynasty, /"2011": \["Majestic V", "Regal IV", "Yorkshire IV"\]/);
  assert.match(dynasty, /"2012": \[\]/);
  assert.match(dynasty, /"2013": \[\]/);
  assert.match(dynasty, /"2014": \["44PDQ", "44RFT"\]/);
  assert.match(dynasty, /"2015": \[\]/);
  assert.match(dynasty, /"2016": \["45D", "45P"\]/);
  assert.match(dynasty, /"2017": \[\]/);
  assert.match(dynasty, /"2018": \[\]/);
  assert.match(dynasty, /"2019": \[\]/);
  assert.doesNotMatch(dynasty, /"2010": \["36P"/);
  assert.doesNotMatch(dynasty, /"2011": \["36P"/);
  assert.doesNotMatch(dynasty, /"2019": \["36P", "38P", "42P"\]/);
  assert.doesNotMatch(dynasty, /"2010": \[[^\]]*44PDQ/);
  assert.doesNotMatch(dynasty, /"2011": \[[^\]]*44PDQ/);
  assert.doesNotMatch(dynasty, /"2020":|"2021":|"2022":|"2023":|"2024":|"2025":|"2026":|"2027":/);
  assert.doesNotMatch(dynasty, /"42Q"|"45A"|"45FW"|"45J"|"45K"|"44BT"|"44SE"|"44TQ"/);

  const camelot = mc.slice(mc.indexOf("    Camelot: {"), mc.indexOf("    Knight: {"));
  assert.match(camelot, /type: "Class A Diesel"/);
  assert.match(camelot, /yearEnd:\s*2019/);
  assert.match(camelot, /"2010": \["38PDQ", "42DFT", "42PDQ"\]/);
  assert.match(camelot, /"2011": \["43DFT", "43PKQ"\]/);
  assert.match(camelot, /"2012": \[\]/);
  assert.match(camelot, /"2019": \[\]/);
  assert.doesNotMatch(camelot, /"2010": \["36M"/);
  assert.doesNotMatch(camelot, /"2019": \["36M", "40M"\]/);
  assert.doesNotMatch(camelot, /"2020":|"2021":|"2022":|"2023":|"2024":|"2025":|"2026":|"2027":/);
  assert.doesNotMatch(camelot, /"42Q"|"45A"|"45P"|"45FW"|"45J"|"45K"|"40PRDQ"/);

  const knight = mc.slice(mc.indexOf("    Knight: {"));
  assert.match(knight, /type: "Class A Diesel"/);
  assert.match(knight, /yearEnd:\s*2023/);
  assert.doesNotMatch(knight, /"2027":/);
  assert.doesNotMatch(knight, /36PBD|36PFT|40PBT|40PBQ/);
});

test("Leisure Travel Vans Facts SoT: Unity yearStart 2010 + MY2010 U24MB/U24CB; Serenity/Free GAP", () => {
  const block = src("rvData.ts");
  const l0 = block.indexOf('\n  "Leisure Travel Vans": {');
  const l1 = block.indexOf('\n  "Renegade RV": {');
  assert.ok(l0 > 0 && l1 > l0, "expected Leisure Travel Vans block");
  const ltv = block.slice(l0, l1);

  assert.doesNotMatch(ltv, /\n    Freedom: \{/);
  assert.doesNotMatch(ltv, /\n    "Freedom II": \{/);
  assert.doesNotMatch(ltv, /\n    Libero: \{/);
  assert.doesNotMatch(ltv, /\n    "Free Spirit": \{/);
  assert.doesNotMatch(ltv, /\n    "Free Flight": \{/);

  const unity = ltv.slice(ltv.indexOf("    Unity: {"), ltv.indexOf("    Wonder: {"));
  assert.match(unity, /type: "Class B\+"/);
  assert.match(unity, /fuelType: "Diesel"/);
  assert.match(unity, /yearStart:\s*2010/);
  assert.doesNotMatch(unity, /yearStart:\s*1993/);
  assert.match(unity, /"2010": \[\s*"U24MB",\s*"U24CB"\s*\]/);
  assert.match(unity, /"2012": \[\s*"24CB",\s*"24MB",\s*"24TB"\s*\]/);
  assert.doesNotMatch(unity, /"2000":|"2009":|"2011":/);
  assert.doesNotMatch(unity, /from:\s*2000/);

  const serenity = ltv.slice(ltv.indexOf("    Serenity: {"), ltv.indexOf("    Free: {"));
  assert.match(serenity, /type: "Class B"/);
  assert.match(serenity, /yearStart:\s*2010/);
  assert.match(serenity, /"2012": \[\s*"24CB"\s*\]/);
  assert.doesNotMatch(serenity, /"2000":|"2006":|"2008":|"2009":|"2010":/);

  const free = ltv.slice(ltv.indexOf("    Free: {"));
  assert.match(free, /yearStart:\s*2018/);
  assert.match(free, /"2018": \[\s*"25TBS"\s*\]/);
  assert.doesNotMatch(free, /"2003":|"2008":|"2009":|"210A"|"210B"|"LSS"/);
});

