import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  lotPriceOrGap,
  lotTextOrGap,
  parseLotSnapshotJson,
  searchLotUnits,
  tokenizeLotQuery,
} from "./ownLotPage.ts";

const root = dirname(fileURLToPath(import.meta.url));

const sample = parseLotSnapshotJson([
  {
    year: 2027,
    make: "Forest River",
    model: "Impression",
    trim: "318RL",
    price: 110111.3,
    stock_number: "47529",
    body_type: "Fifth Wheel",
    location: "Fife WA",
    vin: "5ZT3MPXB4VD006013",
    title: "2027 Forest River Impression 318RL",
    dealer: "RV Country",
    source: "own",
  },
  {
    year: 2026,
    make: "Entegra Coach",
    model: "Cornerstone",
    trim: "45D",
    price: null,
    stock_number: "45282",
    body_type: "Class A Diesel",
    location: "Fresno CA",
    vin: "",
    dealer: "RV Country",
    source: "own",
  },
]);

test("empty search returns the full lot in snapshot order", () => {
  assert.equal(tokenizeLotQuery("   ").length, 0);
  const all = searchLotUnits(sample.units, "");
  assert.equal(all.length, 2);
  assert.equal(all[0]?.stock_number, "47529");
  assert.equal(all[1]?.stock_number, "45282");
  assert.deepEqual(
    searchLotUnits(sample.units, "   ").map((u) => u.stock_number),
    ["47529", "45282"],
  );
});

test("search narrows by year, make, model, stock, type, location", () => {
  assert.equal(searchLotUnits(sample.units, "Impression").length, 1);
  assert.equal(searchLotUnits(sample.units, "47529")[0]?.model, "Impression");
  assert.equal(searchLotUnits(sample.units, "2026 Entegra").length, 1);
  assert.equal(searchLotUnits(sample.units, "fife").length, 1);
  assert.equal(searchLotUnits(sample.units, "fifth wheel").length, 1);
  assert.equal(searchLotUnits(sample.units, "Class A").length, 1);
  assert.equal(searchLotUnits(sample.units, "Impression Fresno").length, 0);
});

test("missing fields stay GAP — never invent a price or stock", () => {
  assert.equal(lotPriceOrGap(null), "GAP");
  assert.equal(lotPriceOrGap(0), "GAP");
  assert.equal(lotPriceOrGap(110111.3), "$110,111");
  assert.equal(lotTextOrGap(""), "GAP");
  assert.equal(lotTextOrGap("  "), "GAP");
  assert.equal(lotTextOrGap("Fife WA"), "Fife WA");
  assert.equal(lotTextOrGap(sample.units[1]?.vin), "GAP");
});

test("bundled own-lot snapshot: empty search is the lot; no catalog bleed", () => {
  const snap = parseLotSnapshotJson(
    JSON.parse(
      readFileSync(
        join(root, "../../../public/inventory/own-lot-latest.json"),
        "utf8",
      ),
    ),
  );
  assert.ok(snap.units.length >= 1000, "own-lot snapshot is the smaller lot");
  assert.equal(snap.source, "own");
  assert.equal(snap.dealer, "RV Country");

  const open = searchLotUnits(snap.units, "");
  assert.equal(open.length, snap.units.length);

  const stock = searchLotUnits(snap.units, "45282");
  assert.equal(stock.length, 1);
  assert.equal(stock[0]?.make, "Entegra Coach");
  assert.equal(stock[0]?.location, "Fresno CA");

  const impression = searchLotUnits(snap.units, "Impression");
  assert.ok(impression.length > 0);
  assert.ok(impression.every((u) => /impression/i.test(`${u.model} ${u.title}`)));

  const ghost = searchLotUnits(snap.units, "ZZZNOMATCH-CATALOG-BLEED");
  assert.equal(ghost.length, 0);
});
