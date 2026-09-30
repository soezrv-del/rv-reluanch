import assert from "node:assert/strict";
import test from "node:test";
import { listingDumpRows } from "./build-own-lot-fulltext.mjs";

test("listing dump keeps floorplan lists and skips a blank row", () => {
  const rows = listingDumpRows([
    {
      stock_number: "47515",
      vin: "VIN47515",
      raw: {
        attributes: { "Number of King Size Beds": "0" },
        flags: ["Cable Prewiring"],
        floorplan_feature: ["King Bed", "Pantry"],
        floorplan_lifestyle: ["Family Friendly"],
        floorplan_style: ["Rear Bath"],
      },
    },
    { stock_number: "BLANK", vin: "VINBLANK", raw: { attributes: { GVWR: "10000" } } },
    {
      stock_number: "",
      vin: "VINONLY",
      raw: { floorplan_feature: ["Bunkhouse"] },
    },
  ]);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].stock_number, "47515");
  assert.equal(rows[0].vin, "");
  assert.match(rows[0].fulltext, /King Bed/);
  assert.doesNotMatch(rows[0].fulltext, /Cable Prewiring/);
  assert.doesNotMatch(rows[0].fulltext, /GVWR/);
  assert.equal(rows[1].stock_number, "");
  assert.equal(rows[1].vin, "VINONLY");
  assert.match(rows[1].fulltext, /Bunkhouse/);
});
