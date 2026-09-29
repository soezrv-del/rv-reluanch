import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  filterLotBrowse,
  lotCardMiles,
  lotListingHref,
  lotPriceOrGap,
  lotTextOrGap,
  lotTypeChips,
  lotTypeFamily,
  lotUnitPhoto,
  shortLotTypeLabel,
  parseLotSnapshotJson,
  searchLotUnits,
  tokenizeLotQuery,
} from "./ownLotPage.ts";
import { lotOpenSections } from "./lotDetail.ts";
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

test("lot lookup shows every printed scrape field and does not invent blanks", () => {
  const snap = parseLotSnapshotJson([
    {
      year: 2022,
      make: "Tiffin",
      model: "Allegro Red 360",
      trim: "33 AA",
      stock_number: "UPF9963",
      condition: "Used",
      lot_status: "Available",
      location: "Fresno CA",
      mileage: 6870,
      price: 229995,
      gvwr: 37320,
      engine: "Cummins / I6 Diesel Pusher",
      chassis_brand: "Freightliner",
      fuel_type: "Regular Diesel",
      raw: {
        attributes: {
          Wheelbase: "16.5 ft | 198 in",
          GVWR: "37320 lbs",
          Engine: "Cummins / I6 Diesel Pusher",
        },
        flags: ["King Bed"],
      },
    },
    {
      year: 2026,
      make: "New",
      model: "Coach",
      stock_number: "N1",
      condition: "New",
      mileage: 0,
    },
    {
      year: 2020,
      make: "Used",
      model: "Zero",
      stock_number: "U0",
      condition: "Used",
      mileage: 0,
    },
  ]);
  const unit = snap.units[0]!;
  assert.equal(unit.printed.mileage, "6,870 mi");
  assert.equal(unit.printed.gvwr, "37320 lbs");
  assert.equal(unit.printed.wheelbase, "16.5 ft | 198 in");
  assert.equal(unit.printed.engine, "Cummins / I6 Diesel Pusher");
  assert.equal(unit.printed.chassis_brand, "Freightliner");
  assert.equal(unit.printed.fuel_type, "Regular Diesel");
  assert.equal(unit.printed.flags, "King Bed");
  assert.equal(unit.printed.payload, undefined);
  assert.equal(unit.printed.dry_weight, undefined);
  assert.equal(unit.printed.hitch_weight, undefined);
  assert.equal(unit.printed.photo, undefined);

  assert.equal(snap.units[1]?.printed.mileage, undefined);
  assert.equal(snap.units[2]?.printed.mileage, "0 mi");
  assert.equal(lotCardMiles(unit), "6,870 mi");
  assert.equal(lotCardMiles(snap.units[1]!), "");
  assert.equal(lotCardMiles(snap.units[2]!), "");
  assert.equal(
    lotListingHref("https://rvcountry.com/inventory/2026-entegra-coach-cornerstone-45282"),
    "https://rvcountry.com/inventory/2026-entegra-coach-cornerstone-45282",
  );
  assert.equal(lotListingHref("javascript:alert(1)"), "");
  assert.equal(lotListingHref(""), "");
  assert.equal(
    lotOpenSections(unit).flatMap((part) => part.rows).find((row) => row.label === "Miles")?.value,
    "6,870 mi",
  );
});

test("lot details drop source and website and do not repeat header facts", () => {
  const snap = parseLotSnapshotJson([
    {
      year: 2026,
      make: "Entegra Coach",
      model: "Cornerstone",
      trim: "45D",
      stock_number: "45282",
      price: 729995,
      price_current: 729995,
      price_lowest: 729995,
      price_msrp: 1124963,
      vin: "4UZFCTFG3TCWE7168",
      location: "Fresno CA",
      location_city: "Fresno",
      location_state: "CA",
      source: "own",
      source_page: "https://rvcountry.com/class-a-diesel",
      url: "https://rvcountry.com/inventory/2026-entegra-coach-cornerstone-45282",
      website: "https://rvcountry.com/",
      gvwr: 54000,
      vehicle_body_length: 44.92,
      engine: "Cummins",
      chassis_brand: "Freightliner",
      heater_btu: 35000,
      raw: {
        attributes: {
          "Heater (Btu)": "35000",
          GVWR: "54,000 lbs",
          Engine: "Cummins",
        },
      },
    },
    {
      year: 2024,
      make: "Tiffin",
      model: "Allegro",
      trim: "32",
      stock_number: "LOW",
      price: 164995,
      price_lowest: 169995,
      price_msrp: 169995,
      hitch_weight: 5000,
      tongue_weight: 226,
      propane_lbs: 105,
      propane_gal: 24.8,
      engine: "Cummins / In-Line",
      engine_type: "Cummins B6.7L",
    },
  ]);

  const labels = new Set(
    lotOpenSections(snap.units[0]!).flatMap((part) => part.rows.map((row) => row.label)),
  );
  for (const label of [
    "Source",
    "Website",
    "Source Page",
    "Listing",
    "Heater Btu",
    "Price Current",
    "Price Lowest",
    "Location City",
  ]) {
    assert.equal(labels.has(label), false, label);
  }
  assert.equal(labels.has("MSRP"), true);
  assert.equal(labels.has("Price"), true);
  assert.equal(labels.has("Chassis"), true);

  const other = new Set(
    lotOpenSections(snap.units[1]!).flatMap((part) => part.rows.map((row) => row.label)),
  );
  assert.equal([...other].filter((label) => label === "Propane").length, 1);
  assert.equal(other.has("Price Lowest"), false);
  assert.equal(other.has("Hitch"), false);
});

test("back-office scrape fields stay on the unit and stay off the details grid", () => {
  const snap = parseLotSnapshotJson([
    {
      year: 2026,
      make: "Entegra Coach",
      model: "Cornerstone",
      trim: "45D",
      stock_number: "45282",
      price: 729995,
      gvwr: 54000,
      "Scraped At": "2026-09-25T19:23:55-07:00",
      ID: 37829,
      "Detail-Fetched": true,
      "Image Count": 34,
      "Lot Code": "PEF",
      "Received Date": "2025-07-03",
      "Location Phone": "559-486-1000",
      "On Special": true,
      "Paint Swatch File Name": "cornerstone-red.png",
    },
  ]);
  const unit = snap.units[0]!;
  assert.equal(unit.printed.scraped_at, "2026-09-25T19:23:55-07:00");
  assert.equal(unit.printed.id, "37,829");
  assert.equal(unit.printed.detail_fetched, "yes");
  assert.equal(unit.printed.image_count, "34");
  assert.equal(unit.printed.lot_code, "PEF");
  assert.equal(unit.printed.received_date, "2025-07-03");
  assert.equal(unit.printed.location_phone, "559-486-1000");
  assert.equal(unit.printed.on_special, "yes");
  assert.equal(unit.printed.paint_swatch_file_name, "cornerstone-red.png");
  assert.equal(unit.printed.gvwr, "54,000");

  const labels = lotOpenSections(unit).flatMap((part) => part.rows.map((row) => row.label));
  for (const label of [
    "Scraped At",
    "Id",
    "Detail Fetched",
    "Image Count",
    "Lot Code",
    "Received Date",
    "Location Phone",
    "On Special",
    "Paint Swatch File Name",
  ]) {
    assert.equal(labels.includes(label), false, label);
  }

  const live = parseLotSnapshotJson(
    JSON.parse(
      readFileSync(
        join(root, "../../../public/inventory/own-lot-latest.json"),
        "utf8",
      ),
    ),
  );
  const stock = live.units.find((unit) => unit.stock_number === "45282");
  assert.ok(stock);
  assert.ok(stock.printed.received_date);
  assert.ok(stock.printed.id);
  const liveLabels = new Set(
    lotOpenSections(stock).flatMap((part) => part.rows.map((row) => row.label)),
  );
  for (const label of [
    "Scraped At",
    "Id",
    "Detail Fetched",
    "Image Count",
    "Lot Code",
    "Received Date",
    "Location Phone",
    "On Special",
    "Paint Swatch File Name",
  ]) {
    assert.equal(liveLabels.has(label), false, label);
  }
  assert.equal(liveLabels.has("Price"), true);
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
  assert.equal(filterLotBrowse(snap.units, { query: "Lineage" }).length, 27);

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
  assert.equal(lotChips.filter((chip) => chip.label === "Popup").length, 1);
  const popup = lotChips.find((chip) => chip.label === "Popup");
  assert.ok(popup);
  assert.equal(popup.type, "Popup|Popup Trailer");
  const popupUnits = filterLotBrowse(snap.units, { type: popup.type });
  assert.ok(popupUnits.some((unit) => unit.body_type === "Popup"));
  assert.ok(popupUnits.some((unit) => unit.body_type === "Popup Trailer"));
  assert.equal(popupUnits.length, popup.count);
  assert.ok(lotChips.some((c) => c.type === "Travel Trailer"));
  assert.ok(
    lotChips.every((c) =>
      c.type.split("|").every((type) => snap.units.some((u) => u.body_type === type)),
    ),
  );
  const diesel = filterLotBrowse(snap.units, { type: "Class A Diesel" });
  assert.ok(diesel.length > 0);
  assert.ok(diesel.every((u) => u.body_type === "Class A Diesel"));
  const used = filterLotBrowse(snap.units, { condition: "used" });
  const fresh = filterLotBrowse(snap.units, { condition: "New" });
  assert.ok(used.length > 0 && fresh.length > 0);
  assert.ok(used.every((unit) => unit.condition === "Used"));
  assert.ok(fresh.every((unit) => unit.condition === "New"));
  assert.equal(used.length + fresh.length, snap.units.length);
  const usedDiesel = filterLotBrowse(snap.units, {
    condition: "Used",
    type: "Class A Diesel",
  });
  assert.ok(usedDiesel.length > 0);
  assert.ok(
    usedDiesel.every(
      (unit) => unit.condition === "Used" && unit.body_type === "Class A Diesel",
    ),
  );
  assert.equal(lotTypeFamily("Class A Diesel"), "a");
  assert.equal(lotTypeFamily("Class Super C"), "c");
  assert.equal(lotTypeFamily("Fifth Wheel Toy Hauler"), "toy");
  assert.equal(lotTypeFamily("Travel Trailer"), "tt");
  assert.equal(shortLotTypeLabel("Fifth Wheel"), "Fifth wheel");
  assert.equal(shortLotTypeLabel("Class A Diesel"), "Diesel");
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
