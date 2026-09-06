import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { DEFAULT_TOW_VEHICLE, LEGACY_FAKE_TOW_TRIM } from "./towYear.ts";
import {
  clearLastTowVehicle,
  formatSavedTowVehicle,
  loadLastTowVehicle,
  normalizeSavedTowVehicle,
  SAVED_TOW_VEHICLE_KEY,
  sameTowVehicle,
  saveLastTowVehicle,
} from "./savedTowVehicle.ts";

const root = dirname(fileURLToPath(import.meta.url));

function stubStorage() {
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
  return {
    mem,
    restore() {
      if (prev) {
        Object.defineProperty(globalThis, "localStorage", {
          configurable: true,
          value: prev,
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (globalThis as any).localStorage;
      }
    },
  };
}

test("normalizeSavedTowVehicle requires make + model — no invented truck", () => {
  assert.equal(normalizeSavedTowVehicle({ year: "2024", make: "Ford" }), null);
  assert.equal(normalizeSavedTowVehicle({ make: "", model: "F-350 Super Duty" }), null);
  const ok = normalizeSavedTowVehicle({
    year: "2016",
    make: "Ford",
    model: "F-350 Super Duty",
    trim: "XL SRW — 6.2L Gas V8 (2015–2016)",
    kindFilter: "truck",
    gvwr: "14,000",
  });
  assert.ok(ok);
  assert.equal(ok.year, "2016");
  assert.equal(ok.make, "Ford");
  assert.equal(ok.model, "F-350 Super Duty");
  assert.equal(ok.gvwr, "14000");
  assert.equal(ok.kindFilter, "truck");
  assert.equal("heightFt" in ok, false);
  assert.equal("lengthFt" in ok, false);
});

test("legacy fake XL diesel trim is not restored as a catalog row", () => {
  const next = normalizeSavedTowVehicle({
    year: "2024",
    make: "Ford",
    model: "F-350 Super Duty",
    trim: LEGACY_FAKE_TOW_TRIM,
  });
  assert.ok(next);
  assert.notEqual(next.trim, LEGACY_FAKE_TOW_TRIM);
});

test("save / load / clear last tow vehicle", () => {
  const { mem, restore } = stubStorage();
  try {
    assert.equal(loadLastTowVehicle(), null);
    const saved = saveLastTowVehicle({
      year: "2024",
      make: DEFAULT_TOW_VEHICLE.make,
      model: DEFAULT_TOW_VEHICLE.model,
      trim: DEFAULT_TOW_VEHICLE.trim,
      kindFilter: "truck",
      bed: "8 ft (Long Bed)",
    });
    assert.ok(saved);
    assert.ok(mem.has(SAVED_TOW_VEHICLE_KEY));
    const loaded = loadLastTowVehicle();
    assert.ok(loaded);
    assert.equal(sameTowVehicle(loaded, DEFAULT_TOW_VEHICLE), true);
    assert.equal(loaded.bed, "8 ft (Long Bed)");
    assert.match(
      formatSavedTowVehicle(loaded),
      /2024 Ford F-350 Super Duty/,
    );
    clearLastTowVehicle();
    assert.equal(loadLastTowVehicle(), null);
  } finally {
    restore();
  }
});

test("RvTowApp persists last truck and offers a Trips handoff", () => {
  const src = readFileSync(
    join(root, "../../components/rvtow/RvTowApp.tsx"),
    "utf8",
  );
  assert.match(src, /saveLastTowVehicle/);
  assert.match(src, /loadLastTowVehicle/);
  assert.match(src, /Use for trip alerts/);
  assert.match(src, /openTripsProfile/);
  assert.match(src, /door sticker/);
  assert.doesNotMatch(src, /heightFt:\s*12\.5/);
  assert.doesNotMatch(src, /RATEAPI/);
});
