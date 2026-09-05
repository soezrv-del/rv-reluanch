import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  customerFacingPitch,
  DEFAULT_SHARE_INCLUDE,
  effectiveShareInclude,
  hasOptionalShareSections,
  isSharePlaceholder,
} from "./shareCardPolicy.ts";

const src = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "shareKit.ts"),
  "utf8",
);

test("default include is all extras off", () => {
  assert.equal(hasOptionalShareSections(DEFAULT_SHARE_INCLUDE), false);
  for (const v of Object.values(DEFAULT_SHARE_INCLUDE)) {
    assert.equal(v, false);
  }
});

test("zero extras falls back to market + payment", () => {
  const next = effectiveShareInclude(DEFAULT_SHARE_INCLUDE);
  assert.equal(next.market, true);
  assert.equal(next.payment, true);
  assert.equal(next.rating, false);
  assert.equal(next.powertrain, false);
});

test("any extra on disables the market/payment fallback", () => {
  const next = effectiveShareInclude({
    ...DEFAULT_SHARE_INCLUDE,
    rating: true,
  });
  assert.equal(next.market, false);
  assert.equal(next.payment, false);
  assert.equal(next.rating, true);
});

test("kit always writes Summary and only writes rating when toggled", () => {
  assert.match(src, /effectiveShareInclude\(opts\.include\)/);
  assert.match(src, /lines\.push\("SUMMARY"\)/);
  assert.match(src, /if \(include\.rating && snap\.rating\)/);
  assert.doesNotMatch(src, /include\.specs/);
});

test("summary uses curated description and never invents specs", () => {
  const pitch = customerFacingPitch(
    "Newmar Essex — limited-production flagship diesel. Do not invent 2028 plans. yearEnd 2027.",
  );
  assert.match(pitch, /limited-production flagship diesel/);
  assert.doesNotMatch(pitch, /Do not invent/);
  assert.doesNotMatch(pitch, /yearEnd/);
});

test("legacy catalog notes are not used as brochure pitch", () => {
  const pitch = customerFacingPitch(
    "Legacy search alias for Allegro Bus floorplan 45 OPP — yearEnd 2026. Prefer Allegro Bus + 45OPP.",
  );
  assert.equal(pitch, "");
});

test("Confirm brochure clauses are stripped from pitch", () => {
  const pitch = customerFacingPitch(
    "Hand-built residential interiors. Confirm brochure for solar.",
  );
  assert.equal(pitch, "Hand-built residential interiors.");
});

test("isSharePlaceholder catches typical confirm tags", () => {
  assert.equal(isSharePlaceholder("Confirm brochure"), true);
  assert.equal(isSharePlaceholder("Confirm brochure (van chassis tire)"), true);
  assert.equal(isSharePlaceholder("30,000 BTU (typ. — confirm brochure)"), true);
  assert.equal(isSharePlaceholder("Cummins X15 605"), false);
});

test("kit filters placeholder lines from the shared card", () => {
  assert.match(src, /lines\.filter\(\(line\) => !isSharePlaceholder\(line\)\)/);
  assert.match(src, /if \(isSharePlaceholder\(row\.value\)\) continue/);
});
