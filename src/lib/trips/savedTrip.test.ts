import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  defaultTripName,
  type PlanPlace,
} from "./planTrip.ts";
import {
  deleteSavedTrip,
  findSavedTrip,
  loadSavedTrips,
  MAX_SAVED_TRIPS,
  placesMatch,
  sameCorridor,
  SAVED_TRIPS_KEY,
  saveTrip,
} from "./savedTrip.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO: PlanPlace = {
  label: "Reno, NV",
  lat: 39.5296,
  lng: -119.8138,
  kind: "city",
};
const BOISE: PlanPlace = {
  label: "Boise, ID",
  lat: 43.615,
  lng: -116.2023,
  kind: "city",
};
const SEATTLE: PlanPlace = {
  label: "Seattle, WA",
  lat: 47.6062,
  lng: -122.3321,
  kind: "city",
};

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

test("defaultTripName is city-first corridor", () => {
  assert.equal(defaultTripName(RENO, SEATTLE), "Reno → Seattle");
  assert.equal(
    defaultTripName(RENO, SEATTLE, [BOISE]),
    "Reno → Boise → Seattle",
  );
});

test("sameCorridor matches rounded coords, not labels", () => {
  assert.equal(
    sameCorridor(
      { origin: RENO, vias: [BOISE], dest: SEATTLE },
      {
        origin: { ...RENO, label: "Reno" },
        vias: [{ ...BOISE, label: "Boise" }],
        dest: { ...SEATTLE, label: "SEA" },
      },
    ),
    true,
  );
  assert.equal(
    sameCorridor(
      { origin: RENO, vias: [BOISE], dest: SEATTLE },
      { origin: RENO, vias: [], dest: SEATTLE },
    ),
    false,
  );
  assert.equal(placesMatch(RENO, { ...RENO, lat: 39.5299 }), true);
});

test("saveTrip persists stops only and reopens the same corridor", () => {
  const { mem, restore } = stubStorage();
  try {
    assert.equal(loadSavedTrips().length, 0);
    const saved = saveTrip({
      origin: RENO,
      dest: SEATTLE,
      vias: [BOISE],
    });
    assert.ok(saved);
    assert.equal(saved.name, "Reno → Boise → Seattle");
    assert.equal("miles" in saved, false);
    assert.ok(mem.has(SAVED_TRIPS_KEY));

    const loaded = loadSavedTrips();
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0]!.vias[0]!.label, BOISE.label);
    assert.equal(loaded[0]!.origin.lat, RENO.lat);
    assert.equal(loaded[0]!.dest.lng, SEATTLE.lng);

    const again = saveTrip({
      origin: RENO,
      dest: SEATTLE,
      vias: [BOISE],
      name: "West loop",
    });
    assert.equal(again?.id, saved.id);
    assert.equal(loadSavedTrips().length, 1);
    assert.equal(loadSavedTrips()[0]!.name, "West loop");

    const found = findSavedTrip({
      origin: RENO,
      dest: SEATTLE,
      vias: [BOISE],
    });
    assert.equal(found?.id, saved.id);

    deleteSavedTrip(saved.id);
    assert.equal(loadSavedTrips().length, 0);
  } finally {
    restore();
  }
});

test("saveTrip rejects junk and caps the list", () => {
  const { restore } = stubStorage();
  try {
    assert.equal(
      saveTrip({
        origin: { label: "", lat: 1, lng: 2, kind: "x" },
        dest: SEATTLE,
      }),
      null,
    );
    for (let i = 0; i < MAX_SAVED_TRIPS + 3; i++) {
      saveTrip({
        origin: RENO,
        dest: { ...SEATTLE, lat: SEATTLE.lat + i * 0.2 },
      });
    }
    assert.equal(loadSavedTrips().length, MAX_SAVED_TRIPS);
  } finally {
    restore();
  }
});

test("Navigate wires save/reopen and never /api/route", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /saveTrip/);
  assert.match(ui, /loadSavedTrips/);
  assert.match(ui, /openSavedTrip/);
  assert.match(ui, /PLAN_VIA_CHIPS/);
  assert.match(ui, /Overnight/);
  assert.match(ui, /data-save-trip/);
  assert.match(ui, /fetchNavigateRoute/);
  assert.match(ui, /via:/);
  assert.doesNotMatch(ui, /\/api\/route/);
  assert.doesNotMatch(ui, /RATEAPI_MODE/);
});
