import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  formatOwnLotBlock,
  ownLotRowsHeading,
  queryOwnLotUnits,
  shouldSkipWebForOwnLot,
  snapshotFromJson,
  type OwnLotSnapshot,
} from "./ownLotInventory.ts";
import { looksLikeMarketValueQuestion } from "./webIntent.ts";
import {
  answerQueryLotFromSnapshot,
  mergeToolCall,
  resolveLotTurn,
  type LotMemory,
} from "./lotMemory.ts";

function productionSnap(): OwnLotSnapshot {
  return snapshotFromJson(
    JSON.parse(
      readFileSync(
        join(process.cwd(), "public/inventory/own-lot-latest.json"),
        "utf8",
      ),
    ),
  );
}

function carry(texts: string[], snap: OwnLotSnapshot) {
  const locations = [
    ...new Set(snap.units.map((unit) => unit.location).filter(Boolean)),
  ];
  let memory: LotMemory | null = null;
  let last = resolveLotTurn(texts[0] || "", null, locations, snap.units);
  for (const text of texts) {
    last = resolveLotTurn(text, memory, locations, snap.units);
    memory = { filter: last.filter, sort: last.sort, limit: last.limit };
  }
  return { turn: last, memory: memory! };
}

function fixture(rows: Record<string, unknown>[]): OwnLotSnapshot {
  return snapshotFromJson({
    source: "own",
    dealer: "RV Country",
    units: rows,
  });
}

const CLASS_C = {
  year: 2016,
  make: "Thor Motor Coach",
  model: "Freedom Elite",
  trim: "23H",
  body_type: "Class C",
  location: "Sequim WA",
  stock_number: "C24",
  price: 40000,
  vehicle_body_length: 24,
};

test("top 10 cheapest after how many Class Cs stays on Class C", () => {
  const snap = productionSnap();
  const { turn, memory } = carry(
    ["How many Class Cs do we have?", "top 10 cheapest"],
    snap,
  );
  assert.equal(turn.carried, true);
  assert.equal(turn.filter.bodyType, "Class C");
  assert.deepEqual(turn.sort, { by: "price", dir: "asc" });
  assert.equal(turn.limit, 10);

  const rows = queryOwnLotUnits(snap.units, turn.filter, turn.limit ?? 10, turn.sort);
  assert.equal(rows.length, 10);
  assert.ok(rows.every((unit) => unit.body_type === "Class C"));
  assert.ok(rows.every((unit) => !/travel trailer/i.test(unit.body_type)));
  const cheapest = rows[0]!;
  assert.equal(cheapest.stock_number, "UCQ9955");
  assert.equal(cheapest.year, "2016");
  assert.match(cheapest.make, /Thor/);
  assert.match(cheapest.model, /Freedom Elite/);
  assert.equal(cheapest.trim, "23H");
  assert.equal(cheapest.price, 33995);
  assert.match(cheapest.location, /Sequim/);
  for (let i = 1; i < rows.length; i++) {
    const prev = rows[i - 1]!.price ?? Number.POSITIVE_INFINITY;
    const next = rows[i]!.price ?? Number.POSITIVE_INFINITY;
    assert.ok(prev <= next);
  }

  const tool = answerQueryLotFromSnapshot(
    snap,
    { sort: "price", order: "asc", limit: 10 },
    memory && { filter: { bodyType: "Class C" } },
  );
  assert.equal(tool.none, false);
  assert.equal(tool.units[0]?.stock_number, "UCQ9955");
  assert.ok(tool.units.every((unit) => unit.body_type === "Class C"));
  assert.match(tool.speech, /Matching units/);
  assert.doesNotMatch(tool.speech, /whole lot, all types/);
});

test("order the shortest keeps the type and reports units with no length", () => {
  const snap = fixture([
    { ...CLASS_C, stock_number: "LONG", trim: "40A", price: 90000, vehicle_body_length: 40 },
    {
      ...CLASS_C,
      stock_number: "PLAN",
      trim: "29S",
      model: "Four Winds",
      price: 50000,
      vehicle_body_length: undefined,
    },
    { ...CLASS_C, stock_number: "SHORT", trim: "22E", price: 30000, vehicle_body_length: 24 },
    {
      ...CLASS_C,
      stock_number: "NOLEN",
      trim: "Special",
      model: "Mystery",
      price: 45000,
      vehicle_body_length: undefined,
    },
    {
      ...CLASS_C,
      stock_number: "TT",
      body_type: "Travel Trailer",
      trim: "18RB",
      price: 4995,
      vehicle_body_length: 18,
    },
  ]);
  const { turn } = carry(
    ["How many Class Cs do we have?", "order the shortest"],
    snap,
  );
  assert.equal(turn.filter.bodyType, "Class C");
  assert.deepEqual(turn.sort, { by: "length", dir: "asc" });
  const rows = queryOwnLotUnits(snap.units, turn.filter, 12, turn.sort);
  assert.deepEqual(
    rows.map((unit) => unit.stock_number),
    ["SHORT", "PLAN", "LONG"],
  );
  const tool = answerQueryLotFromSnapshot(
    snap,
    { sort: "length", order: "asc" },
    { filter: { bodyType: "Class C" } },
  );
  assert.deepEqual(
    tool.units.map((unit) => unit.stock_number),
    ["SHORT", "PLAN", "LONG"],
  );
  assert.equal(tool.units.find((unit) => unit.stock_number === "PLAN")?.length_source, "floorplan");
  assert.equal(tool.units.find((unit) => unit.stock_number === "SHORT")?.length_source, "printed");
  assert.deepEqual(
    tool.no_length.map((unit) => unit.stock_number),
    ["NOLEN"],
  );
  assert.match(tool.speech, /No length on file \(not guessed/);
  assert.match(tool.speech, /stk NOLEN/);
  assert.doesNotMatch(tool.speech, /stk TT/);
  assert.doesNotMatch(
    tool.units.map((unit) => unit.stock_number).join(" "),
    /NOLEN/,
  );
});

test("the ones around 30 foot stays on the prior type and uses a 28 to 32 band", () => {
  const snap = fixture([
    { ...CLASS_C, stock_number: "SHORT", vehicle_body_length: 24, price: 30000 },
    { ...CLASS_C, stock_number: "IN", trim: "29S", vehicle_body_length: 29, price: 50000 },
    { ...CLASS_C, stock_number: "HI", trim: "31B", vehicle_body_length: 31, price: 52000 },
    { ...CLASS_C, stock_number: "OUT", trim: "36C", vehicle_body_length: 36, price: 70000 },
    {
      ...CLASS_C,
      stock_number: "NOLEN",
      trim: "Special",
      model: "Mystery",
      vehicle_body_length: undefined,
      price: 48000,
    },
    {
      ...CLASS_C,
      stock_number: "TT",
      body_type: "Travel Trailer",
      vehicle_body_length: 30,
      price: 4995,
    },
  ]);
  const { turn } = carry(
    ["How many Class Cs do we have?", "the ones around 30 foot"],
    snap,
  );
  assert.equal(turn.carried, true);
  assert.equal(turn.filter.bodyType, "Class C");
  assert.equal(turn.filter.aroundLengthFt, 30);
  const rows = queryOwnLotUnits(snap.units, turn.filter, 12);
  assert.deepEqual(rows.map((unit) => unit.stock_number).sort(), ["HI", "IN"]);

  const tool = answerQueryLotFromSnapshot(
    snap,
    { length_ft_min: 28, length_ft_max: 32 },
    { filter: { bodyType: "Class C" } },
  );
  assert.equal(tool.lotMemory?.filter.bodyType, "Class C");
  assert.equal(tool.lotMemory?.filter.lengthFtMin, 28);
  assert.equal(tool.lotMemory?.filter.lengthFtMax, 32);
  assert.deepEqual(tool.units.map((unit) => unit.stock_number).sort(), ["HI", "IN"]);
  assert.deepEqual(
    tool.no_length.map((unit) => unit.stock_number),
    ["NOLEN"],
  );
  assert.match(tool.speech, /No length on file \(not guessed/);
  assert.doesNotMatch(tool.speech, /stk SHORT/);
  assert.doesNotMatch(tool.speech, /stk OUT/);
  assert.doesNotMatch(tool.speech, /stk TT/);
});

test("unfiltered cheapest rows are never labeled as matches", () => {
  const snap = productionSnap();
  const block = formatOwnLotBlock(snap, "top 10 cheapest");
  assert.match(block, /Cheapest on the whole lot, all types/i);
  assert.match(block, /not a typed match/);
  assert.doesNotMatch(block, /Matching units/);
  assert.equal(
    ownLotRowsHeading({}, 10, 100),
    "Cheapest on the whole lot, all types (10 of 100; not a typed match):",
  );

  const typed = formatOwnLotBlock(snap, "top 10 cheapest", {
    filter: { bodyType: "Class C" },
    sort: { by: "price", dir: "asc" },
    limit: 10,
  });
  assert.match(typed, /Matching units/);
  assert.doesNotMatch(typed, /whole lot, all types/);
  assert.match(typed, /stk UCQ9955/);
});

test("a lot miss says none and does not invent a unit", () => {
  const snap = fixture([
    {
      ...CLASS_C,
      year: 2022,
      make: "Tiffin",
      model: "Allegro",
      trim: "33AA",
      body_type: "Class A",
      stock_number: "REAL1",
      price: 229995,
    },
  ]);
  const block = formatOwnLotBlock(snap, "do we have a 1999 Winnebago View");
  assert.match(block, /None\./);
  assert.match(block, /do not have that coach on the lot/i);
  assert.doesNotMatch(block, /Matching units/);
  assert.doesNotMatch(block, /stk /);
  assert.doesNotMatch(block, /\$49,995/);
  assert.doesNotMatch(block, /Fresno/);

  const tool = answerQueryLotFromSnapshot(
    snap,
    { year_min: 1999, year_max: 1999, make: "Winnebago", model: "View" },
    null,
  );
  assert.equal(tool.none, true);
  assert.equal(tool.matched, 0);
  assert.deepEqual(tool.units, []);
  assert.match(tool.speech, /None\./);
  assert.doesNotMatch(tool.speech, /stk /);
});

test("cheapest and prices-on-those stay on the lot; a worth ask still browses", () => {
  const hit = fixture([CLASS_C]);
  assert.equal(shouldSkipWebForOwnLot("top 10 cheapest", hit), true);
  assert.equal(shouldSkipWebForOwnLot("the lowest priced ones", hit), true);
  assert.equal(shouldSkipWebForOwnLot("prices on those", hit), true);
  assert.equal(looksLikeMarketValueQuestion("top 10 cheapest"), false);
  assert.equal(looksLikeMarketValueQuestion("what's the least expensive"), false);
  assert.equal(looksLikeMarketValueQuestion("prices on those"), false);
  assert.equal(
    shouldSkipWebForOwnLot(
      "How many diesels do we have in stock and what's a 2021 Dutch Star worth?",
      hit,
    ),
    false,
  );
});

test("a tool sort keeps the last filter and a new body type replaces it", () => {
  const carried = mergeToolCall(
    { sort: "price", order: "asc", limit: 10 },
    { filter: { bodyType: "Class C" } },
  );
  assert.equal(carried.carried, true);
  assert.equal(carried.filter.bodyType, "Class C");
  assert.deepEqual(carried.sort, { by: "price", dir: "asc" });
  assert.equal(carried.limit, 10);

  const empty = mergeToolCall({}, { filter: { bodyType: "Class C", location: "Sequim WA" } });
  assert.equal(empty.carried, true);
  assert.equal(empty.filter.bodyType, "Class C");
  assert.equal(empty.filter.location, "Sequim WA");

  const replaced = mergeToolCall(
    { body_type: "Fifth Wheel" },
    { filter: { bodyType: "Class C" } },
  );
  assert.equal(replaced.replaced, true);
  assert.equal(replaced.filter.bodyType, "Fifth Wheel");

  const snap = fixture([
    CLASS_C,
    { ...CLASS_C, stock_number: "FW", body_type: "Fifth Wheel", trim: "28F" },
  ]);
  const spoken = carry(
    ["How many Class Cs do we have?", "how many fifth wheels do we have"],
    snap,
  );
  assert.equal(spoken.turn.replaced, true);
  assert.equal(spoken.turn.filter.bodyType, "Fifth Wheel");
  assert.deepEqual(
    queryOwnLotUnits(snap.units, spoken.turn.filter, 10).map((unit) => unit.stock_number),
    ["FW"],
  );
});
