import assert from "node:assert/strict";
import test from "node:test";
import {
  factsDossierResearchQuery,
  fieldsToSearch,
  planFactsDossierResearch,
  visibleSpecHoles,
} from "./factsDossierGapPlan.ts";

test("diesel pusher search is UVW and CCC only", () => {
  const holes = fieldsToSearch(
    {
      uvw: "",
      uvwLbs: null,
      ccc: "Confirm brochure",
      cccLbs: null,
      propane: "Confirm brochure",
      fuelType: "Diesel",
    },
    { type: "Class A Diesel", fuelType: "Diesel", model: "Anthem" },
  );
  assert.deepEqual(holes, ["UVW", "CCC"]);
});

test("highway MPG is never a search hole", () => {
  const holes = visibleSpecHoles(
    {
      fuelType: "Gas",
      type: "Class A Gas",
      mpgHighway: "Confirm brochure",
      propane: "Confirm brochure",
      ccc: "",
      uvw: "16,200 lbs",
      uvwLbs: 16200,
    },
    { type: "Class A Gas", fuelType: "Gas", model: "Pace Arrow" },
  );
  assert.deepEqual(holes, ["CCC", "propane"]);
  assert.ok(!holes.includes("highway MPG"));
});

test("Anthem gap query does not hunt propane or miles per gallon", () => {
  const plan = planFactsDossierResearch({
    year: "2026",
    make: "Entegra Coach",
    model: "Anthem",
    floorplan: "37K",
    candidate: {
      engine: "Cummins L9",
      horsepower: 450,
      torque: "1250 lb-ft",
      chassis: "Spartan",
      transmission: "Allison 3000",
      fuelType: "Diesel",
      type: "Class A Diesel",
      lengthFt: "38' 0\"",
      gvwr: "45,000 lbs",
      gvwrLbs: 45000,
      uvw: "",
      uvwLbs: null,
      freshWater: "100 gal",
      grayWater: "60 gal",
      blackWater: "40 gal",
      ccc: "",
      propane: "Confirm brochure",
      mpgHighway: "Confirm brochure",
    },
  });
  assert.equal(plan.skipLive, false);
  assert.ok(plan.gaps.includes("uvw"));
  assert.match(plan.query || "", /UVW/);
  assert.match(plan.query || "", /CCC/);
  assert.doesNotMatch(plan.query || "", /propane/i);
  assert.doesNotMatch(plan.query || "", /highway mpg/i);
  assert.doesNotMatch(plan.query || "", /catalog says confirm brochure/i);
});

test("a finished diesel pin does not open a propane or MPG hunt", () => {
  const query = factsDossierResearchQuery({
    year: "2026",
    make: "Entegra Coach",
    model: "Anthem",
    floorplan: "37K",
    gaps: [],
    holes: ["propane", "highway MPG", "CCC"],
  });
  assert.doesNotMatch(query, /propane/i);
  assert.doesNotMatch(query, /highway mpg/i);
  assert.match(query, /CCC/);
  assert.match(query, /Never send the reader to a brochure/);
  assert.doesNotMatch(query, /confirm brochure/i);
});
