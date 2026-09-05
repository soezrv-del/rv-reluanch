import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  autoSaveFactsUnit,
  isMotorhomeFactsType,
  isSavedUnit,
  loadLatestSavedUnit,
  SAVED_UNITS_KEY,
  shouldAutoSaveFacts,
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
