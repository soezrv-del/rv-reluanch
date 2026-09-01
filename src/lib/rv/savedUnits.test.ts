import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  autoSaveFactsUnit,
  isMotorhomeFactsType,
  isSavedUnit,
  shouldAutoSaveFacts,
  toggleSavedUnit,
} from "./savedUnits.ts";

const root = dirname(fileURLToPath(import.meta.url));

function unit(
  year: string,
  make: string,
  model: string,
  type: string,
  floorplan = "",
) {
  return { year, make, model, floorplan, data: { type } };
}

const dream = unit(
  "2023",
  "American Coach",
  "American Dream",
  "Class A Diesel",
  "45A",
);
const montana = unit(
  "2022",
  "Keystone",
  "Montana",
  "Fifth Wheel",
  "3855BR",
);

test("motorhome classifier matches Tow toad mode (Class A/B/C / Super C)", () => {
  assert.equal(isMotorhomeFactsType("Class A Diesel"), true);
  assert.equal(isMotorhomeFactsType("Class B"), true);
  assert.equal(isMotorhomeFactsType("Class C"), true);
  assert.equal(isMotorhomeFactsType("Super C"), true);
  assert.equal(isMotorhomeFactsType("Diesel motorhome"), true);
  assert.equal(isMotorhomeFactsType("Fifth Wheel"), false);
  assert.equal(isMotorhomeFactsType("Travel Trailer"), false);
  assert.equal(isMotorhomeFactsType("Toy Hauler"), false);
});

test("opening a 2023 American Dream Facts report auto-saves once", () => {
  assert.equal(shouldAutoSaveFacts(dream), true);
  const first = autoSaveFactsUnit([], dream);
  assert.equal(first.added, true);
  assert.equal(first.next.length, 1);
  assert.equal(first.next[0]!.model, "American Dream");
  assert.equal(first.next[0]!.saved, true);
  assert.equal(isSavedUnit(first.next, dream), true);

  const again = autoSaveFactsUnit(first.next, dream);
  assert.equal(again.added, false);
  assert.equal(again.next, first.next);
});

test("fifth wheel / travel trailer Facts reports do not auto-save", () => {
  assert.equal(shouldAutoSaveFacts(montana), false);
  const fw = autoSaveFactsUnit([], montana);
  assert.equal(fw.added, false);
  assert.equal(fw.next.length, 0);

  const tt = autoSaveFactsUnit(
    [],
    unit("2021", "Jayco", "Jay Feather", "Travel Trailer", "260RKSLE"),
  );
  assert.equal(tt.added, false);
  assert.equal(tt.next.length, 0);
});

test("Facts report chrome wires auto-save + unsave controls", () => {
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  const detail = readFileSync(join(root, "../../components/rvfax/RvDetail.tsx"), "utf8");
  assert.match(fax, /autoSaveFactsUnit/);
  assert.match(fax, /Remove \$\{r\.year\}/);
  assert.match(detail, /Remove from Saved/);
  assert.match(detail, /Save to list/);
  assert.match(detail, /aria-label=\{saved \? "Remove from saved"/);
});

test("toggle removes an auto-saved motorhome and can re-add", () => {
  const saved = autoSaveFactsUnit([], dream).next;
  const unsaved = toggleSavedUnit(saved, dream);
  assert.equal(unsaved.length, 0);
  const resaved = toggleSavedUnit(unsaved, dream);
  assert.equal(resaved.length, 1);
  assert.equal(resaved[0]!.make, "American Coach");
});
