import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  extractEmbeddedUnits,
  inventoryUrlsFromSitemap,
  isApiUrl,
  isBlockedResponse,
  mapUnit,
  productionFieldDiff,
  scrapeOwnLot,
} from "./scrape-rvcountry.mjs";

function richItem() {
  return {
    id: 168635,
    stock_number: "47492",
    vin: "4UZADVFC7VCWZ8275",
    year: 2027,
    title: "2027 Thor Motor Coach Inception 38DX",
    trim: "38DX",
    description: "King Bed mentioned only in the listing text",
    taglines: ["Website Tag"],
    price_msrp: 378889,
    price_current: 305995,
    price_lowest: 305995,
    price_monthly: 2173.93,
    document_fee: 399,
    mileage: 0,
    fuel_type: "Regular Diesel",
    unit_make: { name: "Thor Motor Coach" },
    unit_model: { name: "Inception" },
    unit_classification: {
      name: "Class Super C",
      vehicle_type: { name: "Motorhome" },
    },
    condition: { name: "New" },
    lotStatus: "Available",
    display_image: "https://example.com/photo.jpg",
    floorplan_image: "https://example.com/floor.jpg",
    images: [{ url: "https://example.com/photo.jpg" }],
    exterior_colors: [{ name: "Phantom Falls" }],
    company_location: {
      name: "Mesa AZ",
      city: "Mesa",
      state: "AZ",
      phone: "480-464-9724",
    },
    website_inventory_collections: ["Clearance"],
    _raw: {
      id: 168635,
      stock_number: "47492",
      vin: "4UZADVFC7VCWZ8275",
      year: 2027,
      title: "2027 Thor Motor Coach Inception 38DX",
      odometer: 0,
      received_date: "2026-04-30",
      lot: "PEZ",
      lot_status: "Available",
      price_msrp: 378889,
      price_current: 305995,
      price_hidden: null,
      price_lowest: 305995,
      price_monthly: 2173.93,
      price_biweekly: 1003.35,
      price_current_incl_fees: 310389,
      on_special: 0,
      is_certified: 0,
      unit_trim: { name: "38DX" },
      hitch_weight: 15000,
      gvwr: 0,
      vehicle_body_length: 39.83,
      vehicle_body_height: 13.25,
      vehicle_body_width: 8.42,
      max_sleeping_count: 4,
      number_of_slideouts: 3,
      total_fresh_water_tank_capacity: 100,
      total_gray_water_tank_capacity: 40,
      total_black_water_tank_capacity: 40,
      fuel_type: "Regular Diesel",
      fuel_tank_capacity: 100,
      awning_length: 20,
      heater_btu: 35000,
      towing_capacity: 15000,
      horsepower: 360,
      engine: "Cummins / In-line",
      chassis_brand: "Freightliner",
      document_fee: 399,
      dealer_prep_fee: 3995,
      display_image: "https://example.com/photo.jpg",
      floorplan_image: "https://example.com/floor.jpg",
      images: [{ url: "https://example.com/photo.jpg" }, { url: "https://example.com/2.jpg" }],
      floorplan_feature: ["King Bed", "Pantry"],
      floorplan_lifestyle: ["Family Friendly"],
      floorplan_style: ["Rear Bath"],
      custom_fields: { cf_age_in_days: "153" },
      exterior_color_name: ["Phantom Falls"],
      inventory_unit_attributes: [
        { name: "Number of King Size Beds", value: "1", brand_value: "1", measure_unit: null },
        { name: "Number of Bunk Beds", value: "0", brand_value: "0", measure_unit: null },
        {
          name: "Bluetooth® Audio",
          value: "Bluetooth® Audio",
          brand_value: "Bluetooth® Audio",
          measure_unit: null,
        },
        { name: "Awning Length", value: "20", brand_value: "20", measure_unit: "ft" },
        { name: "Awning Length", value: "240", brand_value: "240", measure_unit: "in" },
        {
          name: "Total Propane Tank Capacity",
          value: "105",
          brand_value: "105 lbs",
          measure_unit: "lbs",
        },
        {
          name: "Total Propane Tank Capacity",
          value: "24.8",
          brand_value: "24.8",
          measure_unit: "gal",
        },
        { name: "Transmission Type", value: "6", brand_value: "6", measure_unit: "Speed" },
        { name: "Generator Type", value: "Diesel", brand_value: "Diesel", measure_unit: null },
        { name: "Number of Axles", value: "1", brand_value: "1", measure_unit: null },
      ],
      feature_list: ["Listing feature that is not a spec flag"],
      website_inventory_collections: ["Clearance"],
    },
  };
}

test("sitemap keeps inventory slugs and drops /api/", () => {
  const xml = `
    <url><loc>https://rvcountry.com/inventory/2027-thor-47492</loc></url>
    <url><loc>https://rvcountry.com/api/inventory/secret</loc></url>
    <url><loc>https://rvcountry.com/class-a</loc></url>
    <url><loc>https://rvcountry.com/inventory/2027-thor-47492?sort=price</loc></url>
  `;
  assert.deepEqual(inventoryUrlsFromSitemap(xml), [
    "https://rvcountry.com/inventory/2027-thor-47492",
  ]);
  assert.equal(isApiUrl("https://rvcountry.com/api/inventory"), true);
});

test("block statuses and a Cloudflare challenge stop the scrape", () => {
  assert.equal(isBlockedResponse(403, "nope"), true);
  assert.equal(isBlockedResponse(429, ""), true);
  assert.equal(isBlockedResponse(503, ""), true);
  assert.equal(isBlockedResponse(200, "<title>Just a moment...</title>"), true);
  assert.equal(isBlockedResponse(200, '<html>"initialItem":{"stock_number":"1"}'), false);
});

test("embedded initialItem survives a split flight payload", () => {
  const item = richItem();
  const payload = `6:["$","div",null,{"slug":"2027-thor","initialItem":${JSON.stringify(item)}}]`;
  const mid = Math.floor(payload.length / 2);
  const html = [payload.slice(0, mid), payload.slice(mid)]
    .map((part) => `<script>self.__next_f.push(${JSON.stringify([1, part])})</script>`)
    .join("");
  const units = extractEmbeddedUnits(html);
  assert.equal(units.length, 1);
  assert.equal(units[0].stock_number, "47492");
  assert.equal(units[0]._raw.inventory_unit_attributes[0].name, "Number of King Size Beds");
});

test("units array is read when the page has no initialItem", () => {
  const html = `<script>self.__next_f.push(${JSON.stringify([
    1,
    `{"units":[{"id":9,"stock_number":"1","title":"One"},{"id":8,"stock_number":"2","title":"Two"}]}`,
  ])})</script>`;
  const units = extractEmbeddedUnits(html);
  assert.deepEqual(
    units.map((unit) => unit.stock_number),
    ["1", "2"],
  );
});

test("mapped row keeps spec-sheet fields and matches production keys", () => {
  const row = mapUnit(richItem(), {
    scrapedAt: "2026-10-03T01:00:00-07:00",
    pageUrl: "https://rvcountry.com/inventory/2027-thor-motor-coach-inception-47492",
  });
  assert.equal(row.raw.attributes["Number of King Size Beds"], "1");
  assert.equal(row.raw.attributes["Number of Bunk Beds"], "0");
  assert.equal(row.raw.attributes["Awning Length"], "20 | 240");
  assert.equal(row.transmission, "6");
  assert.equal(row.generator, "Diesel");
  assert.equal(row.propane_lbs, 105);
  assert.equal(row.propane_gal, 24.8);
  assert.deepEqual(row.raw.floorplan_feature, ["King Bed", "Pantry"]);
  assert.deepEqual(row.raw.flags, ["Bluetooth® Audio"]);
  assert.deepEqual(row.raw.collections, ["Clearance"]);
  assert.equal(row.price, 305995);
  assert.equal(row.dealer_prep_fee, 3995);
  assert.equal(row.photo, "https://example.com/photo.jpg");
  const blob = JSON.stringify(row);
  assert.equal(blob.includes("King Bed mentioned only in the listing text"), false);
  assert.equal(blob.includes("Website Tag"), false);
  assert.equal(blob.includes("Listing feature that is not a spec flag"), false);
  assert.equal(Object.hasOwn(row.raw.attributes, "Clearance"), false);
  assert.equal(row.raw.flags.includes("Clearance"), false);

  const production = JSON.parse(
    readFileSync(join(import.meta.dirname, "../public/inventory/own-lot-latest.json"), "utf8"),
  );
  const diff = productionFieldDiff(row, production);
  assert.deepEqual(diff.unknownTop, []);
  assert.deepEqual(diff.unknownRaw, []);
  assert.deepEqual(diff.missingTop, []);
});

test("price falls through to MSRP when no sale price is listed", () => {
  const item = richItem();
  item.price_current = null;
  item.price_lowest = null;
  item._raw.price_current = null;
  item._raw.price_hidden = null;
  item._raw.price_lowest = null;
  item._raw.price_msrp = 189955;
  item.price_msrp = 189955;
  const row = mapUnit(item, { scrapedAt: "2026-10-03T01:00:00-07:00", pageUrl: "https://rvcountry.com/inventory/x" });
  assert.equal(row.price, 189955);
  assert.equal(row.price_current, null);
  assert.equal(row.price_msrp, 189955);
});

test("scrape stops on a block and never requests /api/", async () => {
  const pages = {
    "https://rvcountry.com/vehicle-sitemap.xml": `<?xml version="1.0"?><urlset>
      <url><loc>https://rvcountry.com/inventory/unit-a</loc></url>
      <url><loc>https://rvcountry.com/api/inventory</loc></url>
    </urlset>`,
    "https://rvcountry.com/srp-sitemap.xml": `<?xml version="1.0"?><urlset>
      <url><loc>https://rvcountry.com/class-a</loc></url>
    </urlset>`,
    "https://rvcountry.com/inventory/unit-a": "Just a moment",
  };
  const requested = [];
  await assert.rejects(
    () =>
      scrapeOwnLot({
        max: 1,
        paceMs: 0,
        fetchImpl: async (url) => {
          requested.push(url);
          const body = pages[url] ?? "";
          const status = body.includes("Just a moment") ? 403 : 200;
          return { status, text: async () => body };
        },
      }),
    /scrape blocked/,
  );
  assert.equal(requested.some((url) => isApiUrl(url)), false);
});
