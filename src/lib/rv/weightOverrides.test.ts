import assert from "node:assert/strict";
import test from "node:test";
import {
  clearWeightField,
  clearWeightOverrides,
  findWeightOverride,
  saveWeightOverride,
  weightOverrideId,
} from "./weightOverrides.ts";
import {
  computeTorqueToWeight,
  formatTorqueToWeightScore,
} from "./torqueToWeight.ts";

test("weight override id is year|make|model|floorplan", () => {
  assert.equal(
    weightOverrideId(2025, "Entegra Coach", "Anthem", "44R"),
    "2025|entegra coach|anthem|44r",
  );
});

test("save / find / clear UVW and GVWR independently", () => {
  clearWeightOverrides();
  const saved = saveWeightOverride({
    year: 2025,
    make: "Jayco",
    model: "Precept",
    floorplan: "31UL",
    uvwLbs: 18_200,
  });
  assert.ok(saved);
  assert.equal(saved?.uvwLbs, 18_200);
  assert.equal(saved?.gvwrLbs, undefined);

  const hit = findWeightOverride(2025, "Jayco", "Precept", "31UL");
  assert.equal(hit?.uvwLbs, 18_200);

  const withGvwr = saveWeightOverride({
    year: 2025,
    make: "Jayco",
    model: "Precept",
    floorplan: "31UL",
    gvwrLbs: 22_000,
  });
  assert.equal(withGvwr?.uvwLbs, 18_200);
  assert.equal(withGvwr?.gvwrLbs, 22_000);

  const afterUvwClear = clearWeightField(
    2025,
    "Jayco",
    "Precept",
    "31UL",
    "uvwLbs",
  );
  assert.equal(afterUvwClear?.uvwLbs, undefined);
  assert.equal(afterUvwClear?.gvwrLbs, 22_000);

  const gone = clearWeightField(2025, "Jayco", "Precept", "31UL", "gvwrLbs");
  assert.equal(gone, null);
  assert.equal(findWeightOverride(2025, "Jayco", "Precept", "31UL"), null);
});

test("override UVW wins over published UVW and GVWR for TTW", () => {
  const scored = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 18_040,
    gvwrLbs: 22_000,
    overrideUvwLbs: 17_000,
    rvType: "Class A Gas",
  });
  assert.equal(scored.weightBasis, "UVW");
  assert.equal(scored.weightOverridden, true);
  assert.equal(scored.weightLb, 17_000);
  assert.equal(
    formatTorqueToWeightScore(scored),
    `${scored.score?.toFixed(1)}/10`,
  );
});

test("override GVWR feeds the tiered estimate; published UVW still wins", () => {
  const gvwrOverride = computeTorqueToWeight({
    torqueLbFt: 468,
    gvwrLbs: 24_000,
    overrideGvwrLbs: 22_000,
    rvType: "Class A Gas",
    chassis: "Ford F-53",
  });
  assert.equal(gvwrOverride.weightBasis, "UVW_EST");
  assert.equal(gvwrOverride.weightEstimated, true);
  assert.equal(gvwrOverride.weightOverridden, false);
  assert.equal(gvwrOverride.weightLb, 18_000);
  assert.equal(gvwrOverride.gvwrLb, 22_000);

  const uvwStillWins = computeTorqueToWeight({
    torqueLbFt: 468,
    uvwLbs: 18_000,
    gvwrLbs: 24_000,
    overrideGvwrLbs: 22_000,
    rvType: "Class A Gas",
  });
  assert.equal(uvwStillWins.weightBasis, "UVW");
  assert.equal(uvwStillWins.weightOverridden, false);
  assert.equal(uvwStillWins.weightEstimated, false);
  assert.equal(uvwStillWins.weightLb, 18_000);
});
