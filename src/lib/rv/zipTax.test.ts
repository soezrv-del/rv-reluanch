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
