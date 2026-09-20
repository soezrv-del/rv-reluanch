import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  autoSaveFactsUnit,
  isConcreteFactsCoach,
  isMotorhomeFactsType,
  isSavedUnit,
  loadLatestSavedUnit,
  SAVED_UNITS_KEY,
  shouldAutoSaveFacts,
  removeSavedUnit,
  toggleSavedUnit,
  type SavedUnitLike,
} from "./savedUnits.ts";

const root = dirname(fileURLToPath(import.meta.url));

function unit(
  year: string,
  make: string,
  model: string,
  type: string,
  floorplan = "",
): SavedUnitLike {
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
  assert.equal(isConcreteFactsCoach(dream), true);
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

test("fifth wheel / travel trailer Facts reports auto-save once like motorhomes", () => {
  assert.equal(shouldAutoSaveFacts(montana), true);
  const fw = autoSaveFactsUnit([], montana);
  assert.equal(fw.added, true);
  assert.equal(fw.next.length, 1);
  assert.equal(fw.next[0]!.model, "Montana");
  assert.equal(isSavedUnit(fw.next, montana), true);

  const tt = unit("2021", "Jayco", "Jay Feather", "Travel Trailer", "260RKSLE");
  const savedTt = autoSaveFactsUnit(fw.next, tt);
  assert.equal(savedTt.added, true);
  assert.equal(savedTt.next.length, 2);
  assert.equal(savedTt.next[0]!.model, "Jay Feather");
  assert.equal(autoSaveFactsUnit(savedTt.next, montana).added, false);
});

test("empty picker identity does not auto-save", () => {
  assert.equal(isConcreteFactsCoach({ year: "", make: "", model: "" }), false);
  assert.equal(shouldAutoSaveFacts({ year: "2023", make: "", model: "Montana" }), false);
  const empty = autoSaveFactsUnit([], { year: "", make: "Keystone", model: "Montana" });
  assert.equal(empty.added, false);
  assert.equal(empty.next.length, 0);
});

test("Facts report chrome wires auto-save + unsave + Sold log", () => {
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  const detail = readFileSync(join(root, "../../components/rvfax/RvDetail.tsx"), "utf8");
  assert.match(fax, /autoSaveFactsUnit/);
  assert.match(fax, /Remove \$\{r\.year\}/);
  assert.match(fax, /onSell=\{isPro \? \(\) => beginSell\(detail\) : undefined\}/);
  assert.match(detail, /Remove from Saved/);
  assert.match(detail, /Save to list/);
  assert.match(detail, /aria-label=\{saved \? "Remove from saved"/);
  assert.match(detail, /onSell/);
  assert.match(detail, /Log as Sold/);
});

test("removeSavedUnit drops a coach without toggling others back in", () => {
  const saved = [dream, montana];
  const next = removeSavedUnit(saved, dream);
  assert.equal(next.length, 1);
  assert.equal(next[0]!.model, "Montana");
  assert.equal(removeSavedUnit(next, dream).length, 1);
});

test("toggle removes an auto-saved motorhome and can re-add", () => {
  const saved = autoSaveFactsUnit([], dream).next;
  const unsaved = toggleSavedUnit(saved, dream);
  assert.equal(unsaved.length, 0);
  const resaved = toggleSavedUnit(unsaved, dream);
  assert.equal(resaved.length, 1);
  assert.equal(resaved[0]!.make, "American Coach");
});

test("loadLatestSavedUnit returns newest-first saved coach identity", () => {
  const mem = new Map<string, string>();
  const store = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  const g = globalThis as { localStorage?: typeof store };
  const prev = g.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  try {
    assert.equal(loadLatestSavedUnit(), null);
    store.setItem(
      SAVED_UNITS_KEY,
      JSON.stringify([dream, montana]),
    );
    const latest = loadLatestSavedUnit();
    assert.ok(latest);
    assert.equal(latest.make, "American Coach");
    assert.equal(latest.model, "American Dream");
    assert.equal(latest.floorplan, "45A");
  } finally {
    if (prev) {
      Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        value: prev,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;
    }
  }
});
