import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lotOpenSections } from "./lotDetail.ts";
import {
  formatLotUpdated,
  lotDetailPhoto,
  parseLotSnapshotJson,
} from "./ownLotPage.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("formatLotUpdated is a plain month and day", () => {
  assert.equal(formatLotUpdated("2026-09-28T19:23:55-07:00"), "Updated Sep 28");
  assert.equal(formatLotUpdated("2026-09-25T19:23:55-07:00"), "Updated Sep 25");
  assert.equal(formatLotUpdated(""), "");
});

test("stock 47492 opens as the short buyer report, not the scrape dump", () => {
  const snap = parseLotSnapshotJson(
    JSON.parse(
      readFileSync(join(root, "../../../public/inventory/own-lot-latest.json"), "utf8"),
    ),
  );
  const coach = snap.units.find((unit) => unit.stock_number === "47492");
  assert.ok(coach);
  const sections = lotOpenSections(coach);
  const rows = sections.flatMap((part) => part.rows);
  assert.ok(rows.length > 0);
  assert.ok(rows.length <= 30, `too many rows: ${rows.length}`);
  const blob = rows.map((row) => `${row.label} ${row.value}`).join("\n");
  assert.equal(blob.includes("Live"), false);
  assert.equal(blob.includes("|"), false);
  assert.equal(/Monthly|Biweekly|Fee/i.test(blob), false);
  assert.equal(
    rows.some((row) => row.value.trim() === "0"),
    false,
  );
  assert.equal(rows.find((row) => row.label === "Price")?.value, "$305,995");
  assert.equal(rows.find((row) => row.label === "MSRP")?.value, "$378,889");
  assert.equal(
    sections.map((part) => part.title).join(" > "),
    [
      "Unit",
      "Price",
      "Dimensions",
      "Chassis and Engine",
      "Weights and Capacities",
      "Living",
      "Features",
    ].filter((title) => sections.some((part) => part.title === title)).join(" > "),
  );
  const floor = rows.find((row) => row.label === "Floorplan")?.value ?? "";
  assert.match(floor, /Two Baths/);
  assert.match(floor, /King Bed/);
  const options = (rows.find((row) => row.label === "Options")?.value ?? "").split(" · ");
  assert.ok(options.length > 0 && options.length <= 8);
  assert.equal(formatLotUpdated(snap.asOf).startsWith("Updated "), true);
});

test("details image uses the floorplan, then the exterior photo", () => {
  const exterior = "https://cdn.example.com/units/47529.jpg";
  const floorplan =
    "https://cdn.coasttechnology.org/vehicle_images/plan/2026_plan.jpg";
  const [base] = parseLotSnapshotJson([
    {
      year: 2026,
      make: "Thor",
      model: "Inception",
      trim: "38DX",
      stock_number: "47492",
      photo: exterior,
      floorplan_image: floorplan,
    },
  ]).units;
  assert.ok(base);
  assert.equal(lotDetailPhoto(base), floorplan);
  assert.equal(lotDetailPhoto({ ...base, floorplan_image: undefined }), exterior);
  assert.equal(lotDetailPhoto({ ...base, floorplan_image: "" }), exterior);
  assert.equal(lotDetailPhoto({ ...base, floorplan_image: "   " }), exterior);
});
