import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { RVSpec } from "./rvTypes.ts";
import {
  SAVED_COMPARE_GAP,
  SAVED_COMPARE_MAX,
  buildSavedCompareReport,
  canOpenSavedCompare,
  capSavedCompareItems,
  clearSavedCompare,
  isSavedCompareSelected,
  removeSavedCompare,
  savedCompareGvwr,
  toggleSavedCompare,
  type SavedCompareUnit,
} from "./savedCompare.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(name: string) {
  return readFileSync(join(root, name), "utf8");
}

function ui(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function spec(partial: Partial<RVSpec> = {}): RVSpec {
  return {
    type: "",
    floorplans: [],
    lengthRange: [0, 0],
    weightRange: [0, 0],
    slideouts: 0,
    sleeps: 0,
    msrpRange: [0, 0],
    fuelType: "",
    recalls: 0,
    rating: 0,
    image: "",
    ...partial,
  };
}

function unit(
  year: string,
  make: string,
  model: string,
  floorplan = "",
  data: Partial<RVSpec> = {},
): SavedCompareUnit {
  return {
    year,
    make,
    model,
    floorplan,
    data: spec(data),
  };
}

const dream = unit("2023", "American Coach", "American Dream", "45A", {
  type: "Class A Diesel",
  lengthRange: [45, 45],
  gvwrLbs: 54000,
  engine: "Cummins L9",
  chassis: "Spartan K2",
  msrpRange: [650000, 720000],
  fuelType: "Diesel",
  horsepower: 450,
  sleeps: 6,
  slideouts: 4,
});

const bus = unit("2022", "Tiffin", "Allegro Bus", "45OPP", {
  type: "Class A Diesel",
  lengthRange: [45, 45],
  gvwrLbs: 51000,
  engine: "Cummins L9",
  chassis: "PowerGlide",
  msrpRange: [580000, 640000],
});

const dutch = unit("2021", "Newmar", "Dutch Star", "4369", {
  type: "Class A Diesel",
  overallLengthIn: 524,
  gvwrLbs: 49600,
  engine: "Cummins L9",
  chassis: "Freightliner",
  msrpRange: [560000, 610000],
});

const sparse = unit("2018", "Custom", "Unknown Coach", "", {
  type: "Class A",
  weightRange: [18000, 22000],
});

test("toggleSavedCompare selects up to 3, then no-ops; deselect works", () => {
  let pick: SavedCompareUnit[] = [];
  pick = toggleSavedCompare(pick, dream);
  pick = toggleSavedCompare(pick, bus);
  assert.equal(pick.length, 2);
  assert.equal(canOpenSavedCompare(pick), true);
  pick = toggleSavedCompare(pick, dutch);
  assert.equal(pick.length, 3);
  assert.equal(SAVED_COMPARE_MAX, 3);
  const blocked = toggleSavedCompare(pick, sparse);
  assert.equal(blocked.length, 3);
  assert.equal(
    blocked.some((r) => r.model === "Unknown Coach"),
    false,
  );
  pick = toggleSavedCompare(pick, bus);
  assert.equal(pick.length, 2);
  assert.equal(
    pick.some((r) => r.model === "Allegro Bus"),
    false,
  );
  assert.equal(isSavedCompareSelected(pick, dream), true);
  assert.equal(isSavedCompareSelected(pick, bus), false);
});

test("clearSavedCompare and removeSavedCompare empty the set", () => {
  let pick = [dream, bus, dutch];
  pick = removeSavedCompare(pick, dutch);
  assert.equal(pick.length, 2);
  pick = clearSavedCompare();
  assert.equal(pick.length, 0);
  assert.equal(canOpenSavedCompare(pick), false);
  assert.deepEqual(capSavedCompareItems([dream, dream, bus, dutch, sparse]), [
    dream,
    bus,
    dutch,
  ]);
});

test("saved compare view renders saved specs and GAPs — never invents fields", () => {
  const report = buildSavedCompareReport([dream, sparse]);
  assert.equal(report.columns.length, 2);

  const byId = Object.fromEntries(report.rows.map((r) => [r.id, r]));
  assert.equal(byId.year?.cells[0]?.value, "2023");
  assert.equal(byId.make?.cells[0]?.value, "American Coach");
  assert.equal(byId.model?.cells[0]?.value, "American Dream");
  assert.equal(byId.length?.cells[0]?.value, "45 ft");
  assert.equal(byId.gvwr?.cells[0]?.value, "54,000 lbs");
  assert.equal(byId.engine?.cells[0]?.value, "Cummins L9");
  assert.equal(byId.chassis?.cells[0]?.value, "Spartan K2");
  assert.match(byId.price?.cells[0]?.value ?? "", /\$650,000/);

  assert.equal(byId.engine?.cells[1]?.value, SAVED_COMPARE_GAP);
  assert.equal(byId.engine?.cells[1]?.present, false);
  assert.equal(byId.chassis?.cells[1]?.value, SAVED_COMPARE_GAP);
  assert.equal(byId.gvwr?.cells[1]?.value, SAVED_COMPARE_GAP);
  assert.equal(byId.length?.cells[1]?.value, SAVED_COMPARE_GAP);
  assert.equal(byId.price?.cells[1]?.value, SAVED_COMPARE_GAP);
  assert.equal(byId.year?.cells[1]?.value, "2018");

  // weightRange must never be painted as GVWR
  assert.equal(savedCompareGvwr(sparse.data), null);
  const gvwrCell = byId.gvwr?.cells[1]?.value ?? "";
  assert.doesNotMatch(gvwrCell, /18,000|22000|22,000/);

  const blob = JSON.stringify(report);
  assert.doesNotMatch(blob, /605 HP opt/);
  assert.doesNotMatch(blob, /Catalog estimate/);
  assert.doesNotMatch(blob, /typical/i);
  assert.doesNotMatch(blob, /18,000–22,000/);
});

test("saved compare inches length + extra rows only when a unit has them", () => {
  const report = buildSavedCompareReport([dutch, sparse]);
  const byId = Object.fromEntries(report.rows.map((r) => [r.id, r]));
  assert.equal(byId.length?.cells[0]?.value, "43.7 ft");
  assert.equal(byId.floorplan?.cells[0]?.value, "4369");
  assert.equal(byId.floorplan?.cells[1]?.value, SAVED_COMPARE_GAP);
  assert.ok(byId.type, "type is present on at least one unit");
  assert.equal(byId.hp, undefined, "no horsepower on either unit → omit extra row");
});

test("savedCompare module stays client-side and does not hydrate catalog", () => {
  const text = src("savedCompare.ts");
  assert.match(text, /SAVED_COMPARE_GAP = "GAP"/);
  assert.match(text, /function toggleSavedCompare/);
  assert.match(text, /function clearSavedCompare/);
  assert.match(text, /function buildSavedCompareReport/);
  assert.doesNotMatch(text, /buildBrochureSpecs/);
  assert.doesNotMatch(text, /estimateMarket/);
  assert.doesNotMatch(text, /getSpec\(/);
  assert.doesNotMatch(text, /fetchLiveDossier/);
  assert.doesNotMatch(text, /fetchPublicListingComps/);
  assert.doesNotMatch(text, /\/api\/rvfax\/compare/);
  assert.doesNotMatch(text, /hpDisplayAndRank/);
});

test("Facts saved list + detail expose unlabeled compare; sold green stays", () => {
  const fax = ui("../../components/rvfax/RvFaxApp.tsx");
  const detail = ui("../../components/rvfax/RvDetail.tsx");
  const view = ui("../../components/rvfax/SavedCompare.tsx");

  assert.match(fax, /data-saved-compare-toggle/);
  assert.match(fax, /data-saved-compare-open/);
  assert.match(fax, /data-saved-compare-clear/);
  assert.match(fax, /toggleSavedCompare/);
  assert.match(fax, /setSavedCompareOpen\(true\)/);
  assert.match(fax, /SavedCompare/);
  assert.match(fax, /border-green\/50 bg-green/);
  assert.match(fax, /aria-label=\{`Sold \$\{r\.year\}/);
  assert.doesNotMatch(fax, />\s*Sold\s*</);

  assert.match(detail, /data-saved-compare-toggle/);
  assert.match(detail, /onOpenSavedCompare/);
  assert.match(detail, /data-facts-compare/);
  assert.match(detail, /Compare with another unit/);

  assert.match(view, /data-saved-compare=""/);
  assert.match(view, /buildSavedCompareReport/);
  assert.match(view, /SAVED_COMPARE_GAP/);
  assert.doesNotMatch(view, /fetch\(/);
  assert.doesNotMatch(view, /\/api\/rvfax\/compare/);
  assert.doesNotMatch(view, /fetchLiveDossier/);
});
