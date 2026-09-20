/**
 * Facts standout chips: catalog solar / lithium / inverter fill gaps
 * when live research is empty. Lineage brochure backfill lock.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  chipsFromCatalogFeatures,
  FEATURE_CHIP_CAP,
  standoutFeatureChips,
} from "./catalogFeatureChips.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function lineageBlock(model: string, nextModel?: string): string {
  const g = src("rvData.ts");
  const start = g.indexOf(`    "${model}": {`);
  assert.ok(start > 0, `missing ${model}`);
  const end = nextModel
    ? g.indexOf(`    "${nextModel}": {`, start)
    : g.indexOf("\n  Fleetwood: {", start);
  assert.ok(end > start, `could not slice ${model}`);
  return g.slice(start, end);
}

test("catalog chips from structured solar / lithium / inverter — no invent", () => {
  assert.deepEqual(
    chipsFromCatalogFeatures({
      solarWatts: 540,
      lithiumAh: 310,
      batteryType: "Lithionics 310Ah",
      inverterWatts: 1800,
    }),
    ["540W solar", "Lithionics 310Ah", "1800W inverter"],
  );
  assert.deepEqual(
    chipsFromCatalogFeatures({
      lithiumWh: 8448,
      batteryType: "Lithionics 51V",
      inverterWatts: 3000,
    }),
    ["8448Wh Lithionics", "3000W inverter"],
  );
  assert.deepEqual(chipsFromCatalogFeatures({}), []);
  assert.deepEqual(chipsFromCatalogFeatures(null), []);
});

test("Facts chips surface catalog solar/lithium/inverter when live is empty", () => {
  const chips = standoutFeatureChips({
    liveFeatures: [],
    spec: {
      solarWatts: 900,
      lithiumAh: 310,
      batteryType: "Lithionics 310Ah",
      inverterWatts: 2000,
      keyFeatures: ["900W solar", "Lithionics 310Ah", "2000W inverter"],
    },
  });
  assert.deepEqual(chips, [
    "900W solar",
    "Lithionics 310Ah",
    "2000W inverter",
  ]);
});

test("catalog chips fill live gaps; do not duplicate solar/lithium/inverter", () => {
  const chips = standoutFeatureChips({
    liveFeatures: ["Residential fridge", "540 watt solar array"],
    spec: {
      solarWatts: 540,
      lithiumAh: 310,
      batteryType: "Lithionics 310Ah",
      inverterWatts: 1800,
    },
  });
  assert.ok(chips.includes("Residential fridge"));
  assert.ok(chips.some((c) => /solar/i.test(c)));
  assert.ok(chips.includes("Lithionics 310Ah"));
  assert.ok(chips.includes("1800W inverter"));
  assert.equal(chips.filter((c) => /solar/i.test(c)).length, 1);
  assert.ok(chips.length <= FEATURE_CHIP_CAP);
});

test("live-only chips still work when catalog electrical is empty", () => {
  assert.deepEqual(
    standoutFeatureChips({
      liveFeatures: ["King bed", "Outdoor kitchen"],
      spec: {},
    }),
    ["King bed", "Outdoor kitchen"],
  );
});

test("chip cap stays at 6; pin sanitizer still drops wrong-engine chips", () => {
  const chips = standoutFeatureChips({
    liveFeatures: [
      "Cummins X15 605",
      "King bed",
      "Outdoor shower",
      "Theater seats",
      "Washer dryer",
      "Fireplace",
      "Extra leftover",
    ],
    spec: {
      solarWatts: 180,
      inverterWatts: 1800,
    },
    pin: {
      yearMin: 2027,
      yearEnd: 2027,
      makeIncludes: "grand design",
      modelIncludes: "lineage series e",
      engine: "Ford 7.3L V8 gas 325HP",
      horsepower: 325,
      fuelType: "Gas",
    },
  });
  assert.ok(!chips.some((c) => /x15|cummins/i.test(c)));
  assert.ok(chips.length <= 6);
  assert.ok(chips.includes("180W solar"));
});

test("RvDetail Facts chips call standoutFeatureChips (not live-only)", () => {
  const detail = src("../components/rvfax/RvDetail.tsx");
  assert.match(detail, /standoutFeatureChips/);
  assert.match(detail, /liveFeatures:\s*live\?\.live \? live\.keyFeatures : \[\]/);
  assert.match(detail, /spec:\s*data/);
  assert.doesNotMatch(
    detail,
    /if \(!live\?\.live \|\| !live\.keyFeatures\?\.length\) return \[\]/,
  );
});

test("brochureSpecs accuracyNote appends electricalNotes", () => {
  assert.match(src("brochureSpecs.ts"), /spec\.electricalNotes/);
});

test("Lineage Series M brochure backfill — 540 / 310Ah / 1800", () => {
  const m = lineageBlock("Lineage Series M", "Lineage Series F");
  assert.match(m, /solarWatts:\s*540/);
  assert.match(m, /lithiumAh:\s*310/);
  assert.match(m, /inverterWatts:\s*1800/);
  assert.match(m, /batteryType:\s*"Lithionics 310Ah"/);
  assert.match(m, /"540W solar"/);
  assert.match(m, /brochure backfill/i);
  assert.match(m, /not early dual-130Ah/);
  assert.doesNotMatch(m, /lithiumAh:\s*130/);
});

test("Lineage Series F brochure backfill — 900 / 310Ah / 2000", () => {
  const f = lineageBlock("Lineage Series F", "Lineage Series VT");
  assert.match(f, /solarWatts:\s*900/);
  assert.match(f, /lithiumAh:\s*310/);
  assert.match(f, /inverterWatts:\s*2000/);
  assert.match(f, /"900W solar"/);
  assert.match(f, /up to 1000W/);
  assert.doesNotMatch(f, /solarWatts:\s*1000/);
});

test("Lineage Series E brochure backfill — 180 / 310Ah / 1800", () => {
  const e = lineageBlock("Lineage Series E", "Lineage Series M");
  assert.match(e, /solarWatts:\s*180/);
  assert.match(e, /lithiumAh:\s*310/);
  assert.match(e, /inverterWatts:\s*1800/);
  assert.match(e, /brochure backfill/i);
});

test("Lineage Series VP brochure backfill — 180 / 3968Wh / 3000", () => {
  const vp = lineageBlock("Lineage Series VP");
  assert.match(vp, /solarWatts:\s*180/);
  assert.match(vp, /lithiumWh:\s*3968/);
  assert.match(vp, /lithiumAh:\s*310/);
  assert.match(vp, /batteryType:\s*"Lithionics 12V"/);
  assert.match(vp, /inverterWatts:\s*3000/);
  assert.match(vp, /"3968Wh Lithionics"/);
});

test("Lineage Series VT — 8448Wh / 3000; solarWatts GAP", () => {
  const vt = lineageBlock("Lineage Series VT", "Lineage Series VP");
  assert.match(vt, /lithiumWh:\s*8448/);
  assert.match(vt, /batteryType:\s*"Lithionics 51V"/);
  assert.match(vt, /inverterWatts:\s*3000/);
  assert.match(vt, /GAP/);
  assert.doesNotMatch(vt, /solarWatts:/);
  assert.match(vt, /brochure backfill/i);
});

test("Grand Design non-Lineage models were not given electrical backfill", () => {
  const g = src("rvData.ts");
  const g0 = g.indexOf('  "Grand Design": {');
  const g1 = g.indexOf("\n  Fleetwood: {");
  const block = g.slice(g0, g1);
  const imagine = block.slice(
    block.indexOf("    Imagine: {"),
    block.indexOf('    "Lineage Series E"'),
  );
  assert.doesNotMatch(imagine, /solarWatts:/);
  assert.doesNotMatch(imagine, /inverterWatts:/);
  assert.doesNotMatch(imagine, /lithiumWh:/);
});
