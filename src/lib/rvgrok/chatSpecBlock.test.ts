import assert from "node:assert/strict";
import test from "node:test";
import {
  chatSpecCoversPaintedFields,
  extractChatSpecFigures,
  paintChatSpecOntoRows,
} from "./chatSpecBlock.ts";

const DUTCH_STAR_CHAT = `2019 Newmar Dutch Star 4369 — Class A diesel. Cummins L9, 450 horsepower, 1,250 pound-feet of torque, Allison 3000 MH. Chassis is Freightliner XCR or Spartan K2 tagged by length. Live notes put GVWR at 51,000 pounds, UVW around 40,000 to 40,700, length about 43 feet 9 inches, 150-gallon fuel tank, 15,000-pound tow, three slides. Layout details unconfirmed on the 4369.`;

test("extracts labeled GVWR / UVW / fuel / tow from the assistant spec block", () => {
  const figs = extractChatSpecFigures(DUTCH_STAR_CHAT);
  assert.match(figs.gvwr || "", /51,000/);
  assert.match(figs.uvw || "", /40,000/);
  assert.match(figs.uvw || "", /40,700/);
  assert.equal(figs.fuelCapacity, "150 gal");
});

test("does not invent when the reply has no labeled specs", () => {
  assert.deepEqual(extractChatSpecFigures(""), {});
  assert.deepEqual(
    extractChatSpecFigures("Nice coach. What do you want to know next?"),
    {},
  );
  const est = extractChatSpecFigures("GVWR 32,000 typical class range (EST)");
  assert.equal(est.gvwr, undefined);
});

const TANK_CHAT =
  "Holding tanks: fresh ~35, gray/black ~34. 150-gallon fuel tank.";

test("extracts fresh / gray / black from 'fresh ~35, gray/black ~34'", () => {
  const figs = extractChatSpecFigures(TANK_CHAT);
  assert.equal(figs.freshWater, "35 gal");
  assert.equal(figs.grayWater, "34 gal");
  assert.equal(figs.blackWater, "34 gal");
  assert.equal(figs.fuelCapacity, "150 gal");
});

test("grey spelling and labeled gallons still parse; EST tanks stay empty", () => {
  const spoken = extractChatSpecFigures(
    "Fresh water 72 gal, grey 40, black 50.",
  );
  assert.equal(spoken.freshWater, "72 gal");
  assert.equal(spoken.grayWater, "40 gal");
  assert.equal(spoken.blackWater, "50 gal");

  const est = extractChatSpecFigures(
    "fresh ~35 typical class range (EST), gray/black ~34 typical class range",
  );
  assert.equal(est.freshWater, undefined);
  assert.equal(est.grayWater, undefined);
  assert.equal(est.blackWater, undefined);

  const fuelOnly = extractChatSpecFigures("150-gallon fuel tank. Nice coach.");
  assert.equal(fuelOnly.freshWater, undefined);
  assert.equal(fuelOnly.grayWater, undefined);
  assert.equal(fuelOnly.blackWater, undefined);

  const labeled = extractChatSpecFigures("Fuel tank: 150 gal. Fuel capacity 150.");
  assert.equal(labeled.fuelCapacity, "150 gal");
});

test("chat numbers overwrite Confirm brochure; untouched rows stay", () => {
  const rows = paintChatSpecOntoRows(
    [
      { label: "GVWR", value: "Confirm brochure", gap: true },
      { label: "UVW", value: "Confirm brochure", gap: true },
      { label: "Fuel capacity", value: "100 gal", gap: false },
      { label: "CCC", value: "Confirm brochure", gap: true },
      { label: "Class", value: "Class A Diesel", gap: false },
      { label: "Engine", value: "GAP", gap: true },
      { label: "Horsepower", value: "GAP", gap: true },
      { label: "Torque", value: "GAP", gap: true },
      { label: "Chassis", value: "GAP", gap: true },
      { label: "Transmission", value: "GAP", gap: true },
      { label: "Fuel", value: "GAP", gap: true },
    ],
    extractChatSpecFigures(DUTCH_STAR_CHAT),
  );
  assert.equal(rows.find((r) => r.label === "GVWR")?.gap, false);
  assert.match(rows.find((r) => r.label === "GVWR")?.value || "", /51,000/);
  assert.match(rows.find((r) => r.label === "UVW")?.value || "", /40,000/);
  assert.equal(
    rows.find((r) => r.label === "Fuel capacity")?.value,
    "100 gal",
    "catalog fuel stays — chat does not stomp a painted row",
  );
  assert.equal(rows.find((r) => r.label === "CCC")?.value, "Confirm brochure");
  assert.match(rows.find((r) => r.label === "Class")?.value || "", /Class A/i);
  assert.match(rows.find((r) => r.label === "Engine")?.value || "", /Cummins L9/i);
  assert.match(rows.find((r) => r.label === "Horsepower")?.value || "", /450/);
  assert.match(rows.find((r) => r.label === "Torque")?.value || "", /1,250|1250/);
  assert.match(rows.find((r) => r.label === "Chassis")?.value || "", /Freightliner/i);
  assert.match(rows.find((r) => r.label === "Transmission")?.value || "", /Allison/i);
});

test("chat tank gallons overwrite Confirm brochure / GAP on the desk rows", () => {
  const rows = paintChatSpecOntoRows(
    [
      { label: "Fresh", value: "Confirm brochure", gap: true },
      { label: "Gray", value: "GAP", gap: true },
      { label: "Black", value: "Confirm brochure", gap: true },
      { label: "Fuel capacity", value: "100 gal", gap: false },
    ],
    extractChatSpecFigures(TANK_CHAT),
  );
  assert.equal(rows.find((r) => r.label === "Fresh")?.value, "35 gal");
  assert.equal(rows.find((r) => r.label === "Fresh")?.gap, false);
  assert.equal(rows.find((r) => r.label === "Gray")?.value, "34 gal");
  assert.equal(rows.find((r) => r.label === "Black")?.value, "34 gal");
  assert.doesNotMatch(
    rows.find((r) => r.label === "Fresh")?.value || "",
    /Confirm brochure/i,
  );
  assert.equal(
    rows.find((r) => r.label === "Fuel capacity")?.value,
    "100 gal",
    "catalog fuel stays — chat fills GAP tanks only",
  );
});

const LINEAGE_PROSE = `2026 Grand Design Lineage 31ZW is a Super C on a Ford F-600 4x4. 6.7-liter diesel putting out 330 horsepower and 950 pound-feet of torque, 10-speed. GVWR 22,000, GCWR 43,500. Holding tanks: fresh 79, gray 66, black 45.`;

const LINEAGE_LABELED = `2026 Grand Design Lineage 31ZW
Class: Super C
Engine: 6.7 diesel
Horsepower: 330
Torque: 950 lb-ft
Chassis: Ford F-600 4x4
Transmission: 10-speed
Fuel: Diesel
GVWR: 22,000
GCWR: 43,500
Fresh: 79
Gray: 66
Black: 45`;

function assertLineageFigures(figs: ReturnType<typeof extractChatSpecFigures>) {
  assert.equal(figs.rvClass, "Super C");
  assert.match(figs.engine || "", /6\.7/);
  assert.match(figs.engine || "", /diesel/i);
  assert.match(figs.horsepower || "", /330/);
  assert.match(figs.torque || "", /950/);
  assert.match(figs.chassis || "", /F-?600/i);
  assert.match(figs.chassis || "", /4x4/i);
  assert.match(figs.transmission || "", /10-speed/i);
  assert.match(figs.fuel || "", /diesel/i);
  assert.match(figs.gvwr || "", /22,000/);
  assert.match(figs.gcwr || "", /43,500/);
  assert.equal(figs.freshWater, "79 gal");
  assert.equal(figs.grayWater, "66 gal");
  assert.equal(figs.blackWater, "45 gal");
  assert.equal(chatSpecCoversPaintedFields(figs), true);
}

test("extracts Super C / F-600 / 6.7 diesel / 330 hp / 950 lb-ft / 10-speed from prose", () => {
  assertLineageFigures(extractChatSpecFigures(LINEAGE_PROSE));
});

test("extracts the same Lineage figures from labeled rows", () => {
  assertLineageFigures(extractChatSpecFigures(LINEAGE_LABELED));
});

test("Lineage chat figures paint every desk field; catalog GAP stays only when unnamed", () => {
  const rows = paintChatSpecOntoRows(
    [
      { label: "Class", value: "GAP", gap: true },
      { label: "Engine", value: "GAP", gap: true },
      { label: "Horsepower", value: "GAP", gap: true },
      { label: "Torque", value: "GAP", gap: true },
      { label: "Chassis", value: "GAP", gap: true },
      { label: "Transmission", value: "GAP", gap: true },
      { label: "Fuel", value: "GAP", gap: true },
      { label: "GVWR", value: "22,000 lb", gap: false },
      { label: "UVW", value: "GAP", gap: true },
      { label: "CCC", value: "Confirm brochure", gap: true },
      { label: "Fresh", value: "GAP", gap: true },
      { label: "Gray", value: "GAP", gap: true },
      { label: "Black", value: "GAP", gap: true },
    ],
    extractChatSpecFigures(LINEAGE_PROSE),
  );
  const val = (label: string) => rows.find((r) => r.label === label)?.value || "";
  const gap = (label: string) => rows.find((r) => r.label === label)?.gap;
  assert.equal(val("Class"), "Super C");
  assert.equal(gap("Class"), false);
  assert.match(val("Engine"), /6\.7/);
  assert.match(val("Horsepower"), /330/);
  assert.match(val("Torque"), /950/);
  assert.match(val("Chassis"), /F-?600/i);
  assert.match(val("Transmission"), /10-speed/i);
  assert.match(val("Fuel"), /diesel/i);
  assert.match(val("GVWR"), /22,000/);
  assert.match(val("GCWR"), /43,500/);
  assert.equal(gap("GCWR"), false);
  assert.equal(val("Fresh"), "79 gal");
  assert.equal(val("Gray"), "66 gal");
  assert.equal(val("Black"), "45 gal");
  assert.equal(val("UVW"), "GAP", "chat did not name UVW — do not invent");
  assert.equal(val("CCC"), "Confirm brochure", "chat did not name CCC — catalog stays");
});

test("does not invent class / engine / hp from a GVWR-only reply", () => {
  const figs = extractChatSpecFigures("Live notes put GVWR at 22,000 pounds.");
  assert.match(figs.gvwr || "", /22,000/);
  assert.equal(figs.rvClass, undefined);
  assert.equal(figs.engine, undefined);
  assert.equal(figs.horsepower, undefined);
  assert.equal(figs.torque, undefined);
  assert.equal(figs.chassis, undefined);
  assert.equal(figs.transmission, undefined);
  assert.equal(chatSpecCoversPaintedFields(figs), false);
});
