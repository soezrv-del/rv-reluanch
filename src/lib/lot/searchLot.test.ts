import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  filterLotBrowse,
  lotPriceOrGap,
  lotTextOrGap,
  lotTypeChips,
  lotTypeFamily,
  lotUnitPhoto,
  pillLotTypeLabel,
  parseLotSnapshotJson,
  searchLotUnits,
  tokenizeLotQuery,
} from "./ownLotPage.ts";
import {
  floorplanTokensAlign,
  isFloorplanLikeToken,
  normalizeLotSearchToken,
} from "./lotSearch.ts";

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
  {
    year: 2026,
    make: "Entegra Coach",
    model: "Vision SE",
    trim: "27ASE",
    price: 109995,
    stock_number: "47034",
    body_type: "Class A",
    location: "Fife WA",
    vin: "1F65F5DNXS0A05266",
    title: "2026 Entegra Coach Vision SE 27ASE",
    dealer: "RV Country",
    source: "own",
  },
  {
    year: 2005,
    make: "S&S",
    model: "BITTERROOT",
    trim: "9SL",
    price: 7995,
    stock_number: "UCO9527A",
    body_type: "Truck Camper",
    location: "Coburg OR",
    vin: "9SC9087",
    title: "2005 S&S BITTERROOT 9SL",
    dealer: "RV Country",
    source: "own",
  },
]);

test("empty search returns the full lot in snapshot order", () => {
  assert.equal(tokenizeLotQuery("   ").length, 0);
  const all = searchLotUnits(sample.units, "");
  assert.equal(all.length, 4);
  assert.equal(all[0]?.stock_number, "47529");
  assert.equal(all[1]?.stock_number, "45282");
  assert.deepEqual(
    searchLotUnits(sample.units, "   ").map((u) => u.stock_number),
    ["47529", "45282", "47034", "UCO9527A"],
  );
});

test("search narrows by year, make, model, stock, type, location", () => {
  assert.equal(searchLotUnits(sample.units, "Impression").length, 1);
  assert.equal(searchLotUnits(sample.units, "47529")[0]?.model, "Impression");
  assert.equal(searchLotUnits(sample.units, "2026 Entegra").length, 2);
  assert.equal(searchLotUnits(sample.units, "fife").length, 2);
  assert.equal(searchLotUnits(sample.units, "fifth wheel").length, 1);
  assert.equal(searchLotUnits(sample.units, "Class A").length, 2);
  assert.equal(searchLotUnits(sample.units, "Impression Fresno").length, 0);
});

test("floorplan 27A / 27As match Vision SE 27ASE and do not hitch UCO9527A", () => {
  assert.equal(normalizeLotSearchToken("27As"), "27a");
  assert.equal(normalizeLotSearchToken("27A's"), "27a");
  assert.equal(normalizeLotSearchToken("27ASE"), "27ase");
  assert.equal(normalizeLotSearchToken("29S"), "29s");
  assert.equal(isFloorplanLikeToken("27A"), true);
  assert.equal(isFloorplanLikeToken("27As"), true);
  assert.equal(isFloorplanLikeToken("UCO9527A"), false);
  assert.equal(isFloorplanLikeToken("47034"), false);
  assert.equal(floorplanTokensAlign("27A", "27ASE"), true);
  assert.equal(floorplanTokensAlign("27ASE", "27A"), true);

  for (const q of ["27A", "27a", "27As"]) {
    const rows = searchLotUnits(sample.units, q);
    assert.ok(
      rows.some((u) => u.stock_number === "47034"),
      q,
    );
    assert.ok(
      rows.every((u) => u.model === "Vision SE" && u.trim === "27ASE"),
      q,
    );
    assert.ok(
      !rows.some((u) => u.stock_number === "UCO9527A"),
      `${q} must not hitch stk UCO9527A`,
    );
  }

  const byStock = searchLotUnits(sample.units, "UCO9527A");
  assert.equal(byStock.length, 1);
  assert.equal(byStock[0]?.stock_number, "UCO9527A");
  assert.equal(searchLotUnits(sample.units, "uco9527a")[0]?.model, "BITTERROOT");

  const byNum = searchLotUnits(sample.units, "47034");
  assert.equal(byNum.length, 1);
  assert.equal(byNum[0]?.trim, "27ASE");
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

  for (const q of ["27A", "27a", "27As"]) {
    const rows = searchLotUnits(snap.units, q);
    assert.ok(
      rows.some((u) => u.stock_number === "47034" && u.trim === "27ASE"),
      q,
    );
    assert.ok(
      !rows.some((u) => u.stock_number === "UCO9527A"),
      `${q} must not hitch stk UCO9527A`,
    );
    assert.ok(
      rows.every((u) => /27a/i.test(`${u.model} ${u.trim} ${u.title}`)),
      q,
    );
  }
  assert.equal(searchLotUnits(snap.units, "UCO9527A")[0]?.stock_number, "UCO9527A");
  assert.equal(searchLotUnits(snap.units, "47034")[0]?.trim, "27ASE");
});

test("type chips come from the lot snapshot and filter without catalog bleed", () => {
  const chips = lotTypeChips(sample.units);
  assert.deepEqual(
    chips.map((c) => c.type).sort(),
    ["Class A", "Class A Diesel", "Fifth Wheel", "Truck Camper"],
  );
  assert.equal(filterLotBrowse(sample.units, { type: "Fifth Wheel" }).length, 1);
  assert.equal(
    filterLotBrowse(sample.units, { query: "Entegra", type: "Fifth Wheel" })
      .length,
    0,
  );
  assert.equal(
    filterLotBrowse(sample.units, { query: "45282", type: "Class A Diesel" })
      .length,
    1,
  );

  const snap = parseLotSnapshotJson(
    JSON.parse(
      readFileSync(
        join(root, "../../../public/inventory/own-lot-latest.json"),
        "utf8",
      ),
    ),
  );
  const lotChips = lotTypeChips(snap.units);
  assert.ok(lotChips.some((c) => c.type === "Travel Trailer"));
  assert.ok(lotChips.every((c) => snap.units.some((u) => u.body_type === c.type)));
  const diesel = filterLotBrowse(snap.units, { type: "Class A Diesel" });
  assert.ok(diesel.length > 0);
  assert.ok(diesel.every((u) => u.body_type === "Class A Diesel"));
  assert.equal(lotTypeFamily("Class A Diesel"), "a");
  assert.equal(lotTypeFamily("Class Super C"), "c");
  assert.equal(lotTypeFamily("Fifth Wheel Toy Hauler"), "toy");
  assert.equal(lotTypeFamily("Travel Trailer"), "tt");
  assert.equal(pillLotTypeLabel("Fifth Wheel"), "FW");
  assert.equal(pillLotTypeLabel("Travel Trailer"), "TT");
  assert.equal(lotUnitPhoto(sample.units[0]!), null);
  assert.equal(
    lotUnitPhoto({
      ...sample.units[0]!,
      photo: "https://rvcountry.com/inventory/2027-forest-river-impression-318rl-47529",
    }),
    null,
  );
  assert.equal(
    lotUnitPhoto({
      ...sample.units[0]!,
      photo: "https://cdn.example.com/units/47529.jpg",
    }),
    "https://cdn.example.com/units/47529.jpg",
  );
});
