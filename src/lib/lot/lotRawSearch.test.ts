import assert from "node:assert/strict";
import test from "node:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { searchLot } from "./lotQuery.ts";
import { searchLotHits, type LotSearchable } from "./lotSearch.ts";
import {
  applyOwnLotFulltext,
  fulltextIndexFromJson,
  readOwnLotFulltextFile,
  type OwnLotUnit,
} from "../rvgrok/ownLotInventory.ts";

function unit(
  stock: string,
  extra: Partial<LotSearchable> & { printed?: Record<string, string> },
): LotSearchable {
  return {
    year: "2022",
    make: "Jayco",
    model: "Redhawk",
    trim: "",
    stock_number: stock,
    body_type: "Class C",
    location: "Fife WA",
    ...extra,
  };
}

function six(): LotSearchable[] {
  return [
    unit("BH1", { make: "Forest River", model: "Salem", trim: "240BH", fulltext: "Front kitchen. No mention of beds." }),
    unit("NOBH", {
      make: "Cruiser",
      model: "Fun Finder",
      trim: "25RS",
      fulltext: "This floorplan has no bunkhouse.",
    }),
    unit("KING1", { fulltext: "Rear king size bed and a sofa." }),
    unit("PLAIN", { fulltext: "Sofa and a dinette." }),
    unit("KINGCOUNT", { printed: { number_of_king_size_beds: "1" } }),
    unit("FINANCE", { fulltext: "Financing example with a king bed at 6.9 APR and a monthly payment." }),
  ];
}

test("BH and bunkhouse find a 240BH with no bunk wording", () => {
  const units = six();
  for (const query of ["BH", "bunkhouse", "bunk house"]) {
    const found = searchLot(units, { query });
    assert.equal(found.units.some((row) => row.stock_number === "BH1"), true, query);
    assert.equal(found.units.some((row) => row.stock_number === "NOBH"), false, query);
  }
});

test("no bunkhouse text is not a bunkhouse hit", () => {
  const found = searchLot(six(), { query: "bunkhouse" });
  assert.equal(found.units.some((row) => row.stock_number === "NOBH"), false);
});

test("bunkhose typo still finds the 240BH", () => {
  const found = searchLot(six(), { query: "bunkhose" });
  assert.equal(found.units[0]?.stock_number, "BH1");
  assert.equal(found.feature_blank, undefined);
});

test("the lot page bed filter does not treat 240BH as a bunk count", () => {
  const hits = searchLotHits(six(), "bunk").filter((hit) => hit.full);
  assert.equal(hits.some((hit) => hit.unit.stock_number === "BH1"), false);
});

test("king size bed reads the dump and not a financing sentence", () => {
  const found = searchLot(six(), { query: "king size bed" });
  const stocks = found.units.map((row) => row.stock_number).sort();
  assert.deepEqual(stocks, ["KING1", "KINGCOUNT"]);
});

test("one coach with no king on the sheet is feature_blank, not none", () => {
  const found = searchLot(six(), { query: "Redhawk PLAIN king bed" });
  assert.equal(found.matched, 1);
  assert.equal(found.feature_blank, "king");
  assert.equal(found.units[0]?.stock_number, "PLAIN");
  assert.match(found.summary, /not on our listing/);
  assert.doesNotMatch(found.summary, /^None/);
});

test("a listing that says no king does not ask for the brochure", () => {
  const coach = unit("NOKING", { fulltext: "This coach has no king bed." });
  const found = searchLot([coach], { query: "king bed" });
  assert.equal(found.feature_blank, undefined);
  assert.match(found.summary, /No king bed/);
  assert.doesNotMatch(found.summary, /not on our listing/);
});

test("a sold dump row is not added, and a missing dump does not throw", async () => {
  const index = fulltextIndexFromJson([
    { stock_number: "SOLD1", vin: "VINSOLD", fulltext: "bunkhouse garage", url: "https://example.test/sold" },
    { stock_number: "", vin: "VINKEEP", fulltext: "rear king size bed" },
  ]);
  const units: OwnLotUnit[] = [
    {
      year: "2020",
      make: "Thor",
      model: "Palazzo",
      trim: "",
      body_type: "Class A",
      location: "Fife WA",
      stock_number: "KEEP",
      vin: "VINKEEP",
      source: "own",
      dealer: "RV Country",
      price: 100000,
      lengthFt: 40,
    },
  ];
  assert.equal(applyOwnLotFulltext(units, index), 1);
  assert.equal(units.length, 1);
  assert.match(units[0]!.fulltext || "", /king size bed/);
  assert.equal(units.some((row) => row.stock_number === "SOLD1"), false);

  const missing = await readOwnLotFulltextFile(join(tmpdir(), "no-such-own-lot-fulltext.json"));
  assert.equal(missing.byStock.size, 0);
  const dir = mkdtempSync(join(tmpdir(), "fulltext-bad-"));
  const broken = join(dir, "own-lot-fulltext.json");
  writeFileSync(broken, "{not json");
  const bad = await readOwnLotFulltextFile(broken);
  assert.equal(bad.byStock.size, 0);
});

test("the lot page does not load the dump", () => {
  const page = readFileSync(new URL("./ownLotPage.ts", import.meta.url), "utf8");
  assert.doesNotMatch(page, /own-lot-fulltext/);
  assert.doesNotMatch(page, /fulltext/);
});

test("the committed dump carries King Bed for a sheet that did not print it", () => {
  const dump = JSON.parse(
    readFileSync(join(process.cwd(), "public/inventory/own-lot-fulltext.json"), "utf8"),
  );
  const index = fulltextIndexFromJson(dump);
  const text = index.byStock.get("47515") || "";
  assert.match(text, /King Bed/);
  const unit = {
    year: "2027",
    make: "Thor Motor Coach",
    model: "Four Winds",
    trim: "",
    stock_number: "47515",
    body_type: "Class C",
    location: "Fife WA",
    fulltext: text,
  };
  const found = searchLot([unit], { query: "king bed" });
  assert.equal(found.units[0]?.stock_number, "47515");
  assert.equal(found.feature_blank, undefined);
});

