import assert from "node:assert/strict";
import test from "node:test";
import { lookupTaxByZip } from "./zipTax.ts";

const FL_ZIP3 = [
  "320", "321", "322", "323", "324", "325", "326", "327", "328", "329",
  "330", "331", "332", "333", "334", "335", "336", "337", "338", "339",
  "340", "341", "342", "343", "344", "345", "346", "347", "348", "349",
] as const;

const ADDED_FL_ZIP3 = ["323", "324", "340", "343", "344", "345", "348"] as const;

const ADDED_FL_RATES: Record<(typeof ADDED_FL_ZIP3)[number], number> = {
  "323": 7.5,
  "324": 7,
  "340": 6.5,
  "343": 7,
  "344": 7.5,
  "345": 7.5,
  "348": 7.5,
};

const RAISED_FL = [
  ["320", 6.5],
  ["321", 6.5],
  ["322", 7.5],
  ["325", 7.5],
  ["326", 7.5],
  ["342", 7],
  ["346", 7],
  ["347", 7.5],
  ["349", 7],
] as const;

const KEPT_FL = [
  ["327", 8],
  ["328", 7.5],
  ["329", 7.5],
  ["330", 7],
  ["331", 7],
  ["332", 7],
  ["333", 7],
  ["334", 7.5],
  ["335", 7.5],
  ["336", 7.5],
  ["337", 7.5],
  ["338", 7.5],
  ["339", 7],
  ["341", 6.5],
] as const;

const SAMPLE_ZIPS = [
  ["32301", 7.5],
  ["32401", 7],
  ["34001", 6.5],
  ["34301", 7],
  ["34470", 7.5],
  ["34501", 7.5],
  ["34801", 7.5],
] as const;

test("every FL ZIP3 320-349 resolves via ZIP_TO_STATE, not the 6.00 range fallback", () => {
  assert.equal(FL_ZIP3.length, 30);
  for (const prefix of FL_ZIP3) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "FL");
    assert.equal(info.zipPrefix, prefix, `${prefix} must not fall through to 320-349`);
    assert.notEqual(info.zipPrefix, "320-349");
    assert.ok(info.registrationFees > 0);
  }
});

test("added FL ZIP3 prefixes hit ZIP_TO_STATE at the sourced county combined rate", () => {
  assert.equal(ADDED_FL_ZIP3.length, 7);
  for (const prefix of ADDED_FL_ZIP3) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "FL");
    assert.equal(info.zipPrefix, prefix);
    assert.equal(info.taxRate, ADDED_FL_RATES[prefix]);
    assert.notEqual(info.zipPrefix, "320-349");
  }
});

test("understated existing FL ZIP3s were raised to the primary-county combined rate", () => {
  for (const [prefix, tax] of RAISED_FL) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "FL");
    assert.equal(info.taxRate, tax);
    assert.equal(info.zipPrefix, prefix);
  }
});

test("kept FL ZIP3 rates that were not understated stay unchanged", () => {
  for (const [prefix, tax] of KEPT_FL) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "FL");
    assert.equal(info.taxRate, tax);
    assert.equal(info.zipPrefix, prefix);
  }
});

test("sample lookups for the 7 missing prefixes are not the 6.00 FL fallback", () => {
  for (const [zip, tax] of SAMPLE_ZIPS) {
    const info = lookupTaxByZip(zip);
    assert.ok(info, `${zip} should resolve`);
    assert.equal(info.abbr, "FL");
    assert.equal(info.zipPrefix, zip.slice(0, 3));
    assert.equal(info.taxRate, tax);
    assert.notEqual(info.zipPrefix, "320-349");
  }
});

const AZ_ZIP3 = [
  "850", "851", "852", "853", "854", "855", "856", "857",
  "858", "859", "860", "861", "862", "863", "864", "865",
] as const;

const ADDED_AZ_ZIP3 = ["854", "858", "861", "862"] as const;

const ADDED_AZ_RATES: Record<(typeof ADDED_AZ_ZIP3)[number], number> = {
  "854": 9.2,
  "858": 8.7,
  "861": 9.386,
  "862": 9.3,
};

const RAISED_AZ = [
  ["850", 9.1],
  ["851", 8.95],
  ["852", 8.3],
  ["853", 9.2],
  ["855", 10.48],
  ["856", 8.55],
  ["857", 8.7],
  ["859", 8.43],
  ["860", 9.386],
  ["863", 9.3],
  ["864", 8.6],
  ["865", 6.1],
] as const;

const SAMPLE_AZ_ZIPS = [
  ["85003", 9.1],
  ["85142", 8.95],
  ["85201", 8.3],
  ["85301", 9.2],
  ["85401", 9.2],
  ["85541", 10.48],
  ["85635", 8.55],
  ["85701", 8.7],
  ["85801", 8.7],
  ["85901", 8.43],
  ["86001", 9.386],
  ["86101", 9.386],
  ["86201", 9.3],
  ["86301", 9.3],
  ["86401", 8.6],
  ["86515", 6.1],
] as const;

test("every AZ ZIP3 850-865 resolves via ZIP_TO_STATE, not the 5.60 range fallback", () => {
  assert.equal(AZ_ZIP3.length, 16);
  for (const prefix of AZ_ZIP3) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "AZ");
    assert.equal(info.zipPrefix, prefix, `${prefix} must not fall through to 850-865`);
    assert.notEqual(info.zipPrefix, "850-865");
    assert.ok(info.registrationFees > 0);
  }
});

test("added AZ ZIP3 prefixes hit ZIP_TO_STATE at the sourced city+county combined rate", () => {
  assert.equal(ADDED_AZ_ZIP3.length, 4);
  for (const prefix of ADDED_AZ_ZIP3) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "AZ");
    assert.equal(info.zipPrefix, prefix);
    assert.equal(info.taxRate, ADDED_AZ_RATES[prefix]);
    assert.notEqual(info.zipPrefix, "850-865");
  }
});

test("understated existing AZ ZIP3s were raised to the primary-metro combined rate", () => {
  assert.equal(RAISED_AZ.length, 12);
  for (const [prefix, tax] of RAISED_AZ) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "AZ");
    assert.equal(info.taxRate, tax);
    assert.equal(info.zipPrefix, prefix);
  }
});

test("sample lookups for AZ prefixes are not the 5.60 AZ fallback", () => {
  for (const [zip, tax] of SAMPLE_AZ_ZIPS) {
    const info = lookupTaxByZip(zip);
    assert.ok(info, `${zip} should resolve`);
    assert.equal(info.abbr, "AZ");
    assert.equal(info.zipPrefix, zip.slice(0, 3));
    assert.equal(info.taxRate, tax);
    assert.notEqual(info.zipPrefix, "850-865");
  }
});
