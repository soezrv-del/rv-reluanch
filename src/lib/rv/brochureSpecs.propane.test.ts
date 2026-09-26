import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const factsRoot = join(root, "../../components/rvfax");

function src(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8");
}

test("formatPropane prints published lb or gal and never invents", () => {
  const file = src(root, "brochureSpecs.ts");
  assert.match(file, /export function formatPropane/);
  assert.match(file, /propaneLbs/);
  assert.match(file, /propaneGal/);
  assert.match(file, /\$\{Math\.round\(lbs\)\} lb/);
  assert.match(file, /return CONFIRM_BROCHURE/);
  assert.match(file, /paintOrBlank\(formatPropane\(oem\)\)/);
  assert.doesNotMatch(file, /class-average propane|typical propane|32 gal \/\//i);
  assert.doesNotMatch(file, /lbs\s*\*\s*4\.2|\/\s*4\.2/);
});

test("Facts paints PROPANE after BLACK WATER from brochure propane", () => {
  const detail = src(factsRoot, "RvDetail.tsx");
  const black = detail.indexOf('label="BLACK WATER"');
  const propane = detail.indexOf('label="PROPANE"');
  assert.ok(black >= 0, "BLACK WATER row missing");
  assert.ok(propane > black, "PROPANE row must follow BLACK WATER");
  assert.match(detail, /value=\{specs\.propane\}/);
  assert.match(detail, /propane: brochure\.propane/);
});

test("OemFloorplanSpec accepts published lb or gal — no conversion field", () => {
  const typeSrc = src(root, "floorplanSpecs.ts");
  assert.match(typeSrc, /propaneGal\?: number/);
  assert.match(typeSrc, /propaneLbs\?: number/);
  assert.match(typeSrc, /Never convert from pounds/);
});
