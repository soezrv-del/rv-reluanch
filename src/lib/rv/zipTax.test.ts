import assert from "node:assert/strict";
import test from "node:test";
import { lookupTaxByZip } from "./zipTax.ts";

const ADDED_CA_ZIP3 = [
  "909", "910", "911", "914", "915", "916", "917", "918", "919", "923",
  "924", "925", "926", "927", "928", "929", "930", "931", "932", "933",
  "934", "935", "936", "937", "938", "939", "940", "942", "943", "944",
  "946", "947", "948", "949", "950", "951", "952", "953", "954", "955",
  "956", "957", "958", "959", "960", "961",
] as const;

const KEPT_CA = [
  ["900", 7.25],
  ["901", 10.25],
  ["902", 9.5],
  ["903", 9.5],
  ["904", 9.5],
  ["905", 10.25],
  ["906", 10.25],
  ["907", 10.25],
  ["908", 10.25],
  ["912", 10.25],
  ["913", 9],
  ["920", 7.75],
  ["921", 7.75],
  ["922", 7.75],
  ["941", 8.625],
  ["945", 9.25],
] as const;

const SAMPLE_ZIPS = ["91001", "91701", "92602", "94025", "94601", "95110"] as const;

test("kept CA ZIP3 rates are unchanged, including 902 / 90210 at 9.50", () => {
  for (const [prefix, tax] of KEPT_CA) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "CA");
    assert.equal(info.taxRate, tax);
    assert.equal(info.zipPrefix, prefix);
  }
  const beverly = lookupTaxByZip("90210");
  assert.ok(beverly);
  assert.equal(beverly.taxRate, 9.5);
  assert.equal(beverly.zipPrefix, "902");
});

test("added CA ZIP3 prefixes hit ZIP_TO_STATE, not the 7.25 range fallback", () => {
  assert.equal(ADDED_CA_ZIP3.length, 46);
  for (const prefix of ADDED_CA_ZIP3) {
    const info = lookupTaxByZip(`${prefix}01`);
    assert.ok(info, `${prefix} should resolve`);
    assert.equal(info.abbr, "CA");
    assert.equal(info.zipPrefix, prefix, `${prefix} must not fall through to 900-961`);
    assert.notEqual(info.zipPrefix, "900-961");
  }
});

test("called-out sample ZIPs no longer use the 7.25 CA fallback", () => {
  for (const zip of SAMPLE_ZIPS) {
    const info = lookupTaxByZip(zip);
    assert.ok(info, `${zip} should resolve`);
    assert.equal(info.abbr, "CA");
    assert.equal(info.zipPrefix, zip.slice(0, 3));
    assert.notEqual(info.zipPrefix, "900-961");
    assert.notEqual(info.taxRate, 7.25, `${zip} should not be the statewide fallback`);
  }
});
