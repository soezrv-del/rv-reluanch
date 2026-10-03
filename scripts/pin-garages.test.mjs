import assert from "node:assert/strict";
import test from "node:test";
import {
  extractLabeledGarageInches,
  floorplanKey,
  parseGarageInches,
  pinFloorplans,
} from "./pin-garages.mjs";

function unit(extra) {
  return {
    year: "2027",
    make: "Grand Design",
    model: "Momentum",
    trim: "350G",
    body_type: "Fifth Wheel Toy Hauler",
    stock_number: "1",
    url: "https://rvcountry.com/inventory/example",
    floorplan_image: "https://cdn.example.com/350g.jpg",
    raw: { attributes: {} },
    ...extra,
  };
}

test("floorplan key is year, make, model, and code", () => {
  assert.equal(
    floorplanKey(unit({ make: "Grand-Design", model: "Momentum  ", trim: "350g" })),
    "2027|grand design|momentum|350g",
  );
  assert.equal(floorplanKey(unit({ trim: "" })), "");
});

test("inch parsing reads feet, inches, and feed pairs", () => {
  assert.equal(parseGarageInches("14'"), 168);
  assert.equal(parseGarageInches("14 ft"), 168);
  assert.equal(parseGarageInches("16'-6\""), 198);
  assert.equal(parseGarageInches("168\""), 168);
  assert.equal(parseGarageInches("13' 6\""), 162);
  assert.equal(parseGarageInches("13 ft | 156 in | 3962"), 156);
  assert.equal(parseGarageInches("168 | 4267"), 168);
  assert.equal(parseGarageInches("4267 | 168"), 168);
  assert.equal(parseGarageInches("15"), null);
  assert.equal(parseGarageInches(""), null);
});

test("spec field wins, and a disagreeing feed is a low-confidence note", async () => {
  const { pins } = await pinFloorplans([
    unit({
      stock_number: "A",
      raw: { attributes: { "Garage Length": "14'", "Cargo Area Length": "180 | 4572" } },
    }),
  ]);
  const pin = pins["2027|grand design|momentum|350g"];
  assert.equal(pin.garage_length_in, 168);
  assert.equal(pin.source, "spec_field");
  assert.equal(pin.confidence, "low");
  assert.match(pin.notes, /feed says 180/);
});

test("a bare garage number is not invented", async () => {
  const { pins, report } = await pinFloorplans([
    unit({
      floorplan_image: "",
      raw: { attributes: { "Garage Length": "15" } },
    }),
  ]);
  assert.equal(pins["2027|grand design|momentum|350g"], undefined);
  assert.equal(report.needsWebFloorplans, 1);
  assert.equal(report.byTier.spec_field.floorplans, 0);
});

test("a labeled garage callout is read, an unlabeled length is not", () => {
  assert.equal(extractLabeledGarageInches("Sleeps 8. 14' GARAGE."), 168);
  assert.equal(extractLabeledGarageInches("printed 16'-6\" with NO garage label"), null);
  assert.equal(extractLabeledGarageInches("overall length 44 ft"), null);
});

test("unknowns only, and vision or web are skipped when no client is set", async () => {
  const existing = {
    "2027|grand design|momentum|350g": {
      garage_length_in: 168,
      source: "spec_field",
      source_url: "kept",
      confidence: "high",
      notes: "",
      checked_at: "2026-09-30",
    },
  };
  const held = await pinFloorplans(
    [
      unit({ raw: { attributes: { "Garage Length": "11'" } } }),
      unit({
        trim: "395MS",
        stock_number: "2",
        floorplan_image: "https://cdn.example.com/395.jpg",
        raw: { attributes: {} },
      }),
      unit({
        trim: "44V14",
        stock_number: "3",
        floorplan_image: "",
        raw: { attributes: {} },
      }),
    ],
    { existing },
  );
  assert.equal(held.pins["2027|grand design|momentum|350g"].garage_length_in, 168);
  assert.equal(held.pins["2027|grand design|momentum|350g"].source_url, "kept");
  assert.equal(held.report.needsVisionFloorplans, 1);
  assert.equal(held.report.needsWebFloorplans, 1);
  assert.equal(held.pins["2027|grand design|momentum|395ms"], undefined);

  let visionCalls = 0;
  const refreshed = await pinFloorplans(
    [
      unit({ raw: { attributes: {} } }),
    ],
    {
      refreshAll: true,
      vision: async () => {
        visionCalls += 1;
        return { labeled: true, inches: 132 };
      },
    },
  );
  assert.equal(visionCalls, 1);
  assert.equal(refreshed.pins["2027|grand design|momentum|350g"].source, "floorplan_label");
  assert.equal(refreshed.pins["2027|grand design|momentum|350g"].garage_length_in, 132);

  const unlabeled = await pinFloorplans(
    [unit({ raw: { attributes: {} } })],
    {
      vision: async () => ({ labeled: false, note: "16'-6\" with no garage label" }),
    },
  );
  const low = unlabeled.pins["2027|grand design|momentum|350g"];
  assert.equal(low.garage_length_in, null);
  assert.equal(low.confidence, "low");
  assert.match(low.notes, /no garage label/);
});
