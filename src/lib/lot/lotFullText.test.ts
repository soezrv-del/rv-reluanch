import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "../rvgrok/ownLotInventory.ts";
import { searchLot } from "./lotQuery.ts";
import {
  parseSheetHorsepower,
  searchLotHits,
  type LotSearchable,
} from "./lotSearch.ts";

function snap() {
  return snapshotFromJson(
    JSON.parse(
      readFileSync(join(process.cwd(), "public/inventory/own-lot-latest.json"), "utf8"),
    ),
  );
}

test("400 hp, 400hp, and 400 horsepower are the two sheet units", () => {
  const units = snap().units;
  for (const query of ["400 hp", "400hp", "400 horsepower"]) {
    const voice = searchLot(units, { query });
    const page = searchLotHits(units, query).filter((hit) => hit.full);
    const stocks = voice.units.map((unit) => unit.stock_number).sort();
    assert.deepEqual(stocks, ["46539A", "UCO9965"], query);
    assert.deepEqual(
      page.map((hit) => hit.unit.stock_number).sort(),
      ["46539A", "UCO9965"],
      query,
    );
    assert.ok(
      page.every((hit) =>
        hit.snippets.some((row) => row.field === "horsepower" && /400/.test(row.text)),
      ),
      query,
    );
  }
  assert.equal(parseSheetHorsepower("400"), 400);
  assert.equal(parseSheetHorsepower("400 HP"), 400);
});

test("8.9 liter matches only units that list 8.9 L", () => {
  const units = snap().units;
  for (const query of ["8.9", "8.9L", "8.9 liter"]) {
    const voice = searchLot(units, { query });
    const page = searchLotHits(units, query).filter((hit) => hit.full);
    assert.equal(voice.matched, page.length, query);
    assert.ok(page.length > 0, query);
    assert.ok(
      page.every((hit) =>
        hit.snippets.some((row) => row.field === "displacement" && /8\.9/.test(row.text)),
      ),
      query,
    );
  }
});

test("king bed diesel 40 ft skips Viking and still returns coaches", () => {
  const units = snap().units;
  const voice = searchLot(units, { query: "king bed diesel 40 ft" });
  const page = searchLotHits(units, "king bed diesel 40 ft").filter((hit) => hit.full);
  assert.ok(voice.matched > 0);
  assert.ok(page.length > 0);
  const stocks = new Set([
    ...voice.units.map((unit) => unit.stock_number),
    ...page.map((hit) => hit.unit.stock_number),
  ]);
  assert.equal(stocks.has("UPAUH9433"), false);
  assert.equal(stocks.has("UPB9025A"), false);

  const viking: LotSearchable = {
    make: "Coachmen",
    model: "Viking",
    stock_number: "UCL9540A",
    body_type: "Travel Trailer",
    printed: { floorplan_feature: "Outdoor Kitchen" },
  };
  const king: LotSearchable = {
    make: "Thor",
    model: "Ace",
    stock_number: "KING1",
    body_type: "Class A Diesel",
    length_ft: 40,
    fuel_type: "Diesel",
    printed: { floorplan_feature: "King Bed", fuel_type: "Diesel" },
  };
  const kingHits = searchLotHits([viking, king], "king").filter((hit) => hit.full);
  assert.deepEqual(
    kingHits.map((hit) => hit.unit.stock_number),
    ["KING1"],
  );
});

test("L9 does not match a stock number that merely contains those letters", () => {
  const decoy: LotSearchable = {
    make: "Fleetwood",
    model: "Bounder",
    stock_number: "UCL9540A",
    printed: { engine: "Ford V10" },
  };
  const real: LotSearchable = {
    make: "Newmar",
    model: "Dutch Star",
    stock_number: "L9REAL",
    printed: { engine: "Cummins L9" },
  };
  const hits = searchLotHits([decoy, real], "L9").filter((hit) => hit.full);
  assert.deepEqual(
    hits.map((hit) => hit.unit.stock_number),
    ["L9REAL"],
  );
});

test("all terms matched outrank a partial, and the title outranks notes", () => {
  const title: LotSearchable = {
    make: "Newmar",
    model: "Ventana",
    stock_number: "TITLE",
    printed: {},
  };
  const notes: LotSearchable = {
    make: "Other",
    model: "Coach",
    stock_number: "NOTES",
    printed: { description: "someone mentioned ventana in the notes" },
  };
  const partial: LotSearchable = {
    make: "Ventana",
    model: "Only",
    stock_number: "PART",
    printed: {},
  };
  const both: LotSearchable = {
    make: "Ventana",
    model: "King",
    stock_number: "BOTH",
    body_type: "Class A Diesel",
    printed: { floorplan_feature: "King Bed" },
  };
  const ranked = searchLotHits([notes, title], "ventana");
  assert.equal(ranked[0]?.unit.stock_number, "TITLE");
  assert.ok((ranked[0]?.score || 0) > (ranked[1]?.score || 0));

  const mixed = searchLotHits([partial, both], "ventana king").filter((hit) => hit.full);
  assert.deepEqual(
    mixed.map((hit) => hit.unit.stock_number),
    ["BOTH"],
  );
  const withPartial = searchLotHits([partial, both], "ventana king");
  assert.equal(withPartial[0]?.unit.stock_number, "BOTH");
  assert.equal(withPartial[0]?.full, true);
  assert.equal(withPartial.some((hit) => hit.unit.stock_number === "PART" && !hit.full), true);
});

test("a warm full-text query stays under 20ms", () => {
  const units = snap().units;
  searchLotHits(units, "400 hp");
  const started = performance.now();
  searchLotHits(units, "king bed");
  const elapsed = performance.now() - started;
  assert.ok(elapsed < 20, `query took ${elapsed.toFixed(1)}ms`);
});
