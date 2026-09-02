import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadLiveCatalog } from "./load-live-catalog.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indexSrc = readFileSync(
  resolve(root, "src/lib/rv/rvCatalogIndex.ts"),
  "utf8",
);
const json = indexSrc.match(
  /export const CATALOG_INDEX[^=]*= (\{.*\});/s,
)?.[1];
assert.ok(json, "could not parse CATALOG_INDEX");
const CATALOG_INDEX = JSON.parse(json);

test("thin index covers every live make, model, type, and year window", async () => {
  const { RV_DATA } = await loadLiveCatalog();
  const liveMakes = Object.keys(RV_DATA).sort((a, b) => a.localeCompare(b));
  const indexMakes = Object.keys(CATALOG_INDEX).sort((a, b) =>
    a.localeCompare(b),
  );
  assert.deepEqual(indexMakes, liveMakes);

  let models = 0;
  for (const make of liveMakes) {
    const liveModels = Object.keys(RV_DATA[make] || {}).sort();
    const indexModels = Object.keys(CATALOG_INDEX[make] || {}).sort();
    assert.deepEqual(indexModels, liveModels, make);
    for (const model of liveModels) {
      models += 1;
      const live = RV_DATA[make][model];
      const idx = CATALOG_INDEX[make][model];
      assert.equal(idx.type, live.type, `${make} ${model} type`);
      assert.equal(idx.fuelType, live.fuelType, `${make} ${model} fuel`);
      assert.equal(idx.yearStart, live.yearStart, `${make} ${model} yearStart`);
      assert.equal(idx.yearEnd, live.yearEnd, `${make} ${model} yearEnd`);
      const fuelTypeByYear = {};
      const typeByYear = {};
      for (const b of live.powertrainByYear || []) {
        if (b.from == null || b.to == null) continue;
        for (let y = b.from; y <= b.to; y++) {
          if (b.fuelType && fuelTypeByYear[y] == null) {
            fuelTypeByYear[y] = b.fuelType;
          }
          if (b.type && typeByYear[y] == null) typeByYear[y] = b.type;
        }
      }
      const typeDiffers = Object.entries(typeByYear).some(
        ([, t]) => t !== live.type,
      );
      const expectedType = typeDiffers
        ? Object.fromEntries(Object.entries(typeByYear))
        : undefined;
      const expectedFuel =
        typeDiffers &&
        Object.entries(fuelTypeByYear).some(([, f]) => f !== live.fuelType)
          ? Object.fromEntries(Object.entries(fuelTypeByYear))
          : undefined;
      assert.deepEqual(
        idx.fuelTypeByYear,
        expectedFuel,
        `${make} ${model} fuelTypeByYear`,
      );
      assert.deepEqual(
        idx.typeByYear,
        expectedType,
        `${make} ${model} typeByYear`,
      );
      const liveYears =
        live.floorplansByYear && Object.keys(live.floorplansByYear).length
          ? Object.keys(live.floorplansByYear)
              .map((y) => parseInt(y, 10))
              .sort((a, b) => a - b)
          : undefined;
      assert.deepEqual(idx.years, liveYears, `${make} ${model} years`);
    }
  }
  assert.ok(models >= 300, `expected a full catalog, got ${models} models`);
});
