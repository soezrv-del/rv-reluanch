import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { snapshotFromJson } from "../rvgrok/ownLotInventory.ts";
import { lotUnitLength, searchLot } from "./lotQuery.ts";
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

test("400 hp includes real sheet horsepower and skips a longer number", () => {
  const units = snap().units;
  const voice = searchLot(units, { query: "400 horsepower" });
  const page = searchLotHits(units, "400 hp").filter((hit) => hit.full);
  const stocks = new Set(page.map((hit) => hit.unit.stock_number));
  assert.ok(stocks.has("46539A"));
  assert.ok(stocks.has("UCO9965"));
  assert.equal(voice.matched, page.length);
  assert.equal(stocks.has("46374"), false, "6,400 rpm is not 400 hp");
  assert.equal(stocks.has("UCL9540A"), false, "sheet horsepower is 360");
  assert.equal(stocks.has("UCJ9680A"), false);
  assert.equal(stocks.has("UCO9947"), false);
  assert.ok(
    page.every((hit) =>
      hit.snippets.some((row) => row.field === "horsepower" && row.text === "400 HP"),
    ),
  );

  const bare: LotSearchable = {
    stock_number: "BARE400",
    make: "Test",
    model: "Coach",
    printed: { horsepower: "400" },
  };
  const priced: LotSearchable = {
    stock_number: "PRICE400",
    make: "Test",
    model: "4000",
    price: 400000,
    printed: { horsepower: "276", price: "$400,000" },
  };
  const joined = searchLotHits([bare, priced], "400 horsepower").filter((hit) => hit.full);
  assert.deepEqual(
    joined.map((hit) => hit.unit.stock_number),
    ["BARE400"],
  );
  assert.equal(parseSheetHorsepower("300hp"), 300);
  assert.equal(parseSheetHorsepower("400"), 400);
});

test("300hp and 8.9L match the joined forms", () => {
  const units = snap().units;
  const hp = searchLotHits(units, "300hp").filter((hit) => hit.full);
  const stocks = hp.map((hit) => hit.unit.stock_number).sort();
  assert.ok(stocks.includes("UPD9637B"));
  assert.ok(stocks.includes("UPZ9517"));
  const spaced = searchLot(units, { query: "300 horsepower" });
  assert.equal(spaced.matched, hp.length);

  const liters = searchLotHits(units, "8.9L").filter((hit) => hit.full);
  const words = searchLotHits(units, "8.9 liter").filter((hit) => hit.full);
  assert.equal(liters.length, words.length);
  assert.equal(words.length, 10);
  assert.ok(words.every((hit) => hit.snippets.some((row) => row.field === "displacement")));
});

test("king bed does not match Viking, and full is a bed only as full bed", () => {
  const units = snap().units;
  const kings = searchLotHits(units, "king bed").filter((hit) => hit.full);
  assert.ok(kings.length > 0);
  assert.ok(kings.every((hit) => !/viking/i.test(`${hit.unit.make} ${hit.unit.model}`)));
  assert.equal(
    searchLot(units, { query: "king" }).units.some((unit) => /viking/i.test(unit.make)),
    false,
  );

  const sliding: LotSearchable = {
    stock_number: "SLIDE",
    make: "Coachmen",
    model: "Viking",
    printed: { master_bedroom_door_style: "Full Sliding Door", number_of_full_size_beds: "0" },
  };
  const fullBed: LotSearchable = {
    stock_number: "FULLBED",
    make: "Thor",
    model: "Ace",
    printed: { number_of_full_size_beds: "1" },
  };
  const phrase = searchLotHits([sliding, fullBed], "full bed").filter((hit) => hit.full);
  assert.deepEqual(
    phrase.map((hit) => hit.unit.stock_number),
    ["FULLBED"],
  );
  const word = searchLotHits([sliding, fullBed], "full").filter((hit) => hit.full);
  assert.ok(word.some((hit) => hit.unit.stock_number === "SLIDE"));
});

test("L9 does not return stock UCL9540A", () => {
  const units = snap().units;
  const hits = searchLotHits(units, "L9").filter((hit) => hit.full);
  assert.equal(
    hits.some((hit) => hit.unit.stock_number === "UCL9540A"),
    false,
  );
});

test("40 ft uses the length filter and ignores 40 inside a stock number", () => {
  const units = snap().units;
  const voice = searchLot(units, { query: "40 ft" });
  const page = searchLotHits(units, "40 feet").filter((hit) => hit.full);
  assert.equal(voice.matched, page.length);
  assert.ok(page.length > 0);
  assert.equal(
    page.some((hit) => hit.unit.stock_number === "47740"),
    false,
  );
  assert.ok(
    page.every((hit) => {
    const feet = lotUnitLength(hit.unit).ft;
      return feet != null && feet >= 38 && feet <= 42;
    }),
  );
});

test("a title match outranks notes, and a warm query stays under 20ms", () => {
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
  const ranked = searchLotHits([notes, title], "ventana");
  assert.equal(ranked[0]?.unit.stock_number, "TITLE");
  assert.equal(ranked[0]?.snippets[0]?.field, "model");

  const units = snap().units;
  searchLotHits(units, "400 hp");
  const started = performance.now();
  searchLotHits(units, "king bed");
  const elapsed = performance.now() - started;
  assert.ok(elapsed < 20, `query took ${elapsed.toFixed(1)}ms`);
});
