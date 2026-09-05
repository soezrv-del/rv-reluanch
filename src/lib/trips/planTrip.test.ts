import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  canSubmitPlan,
  clearLastKnownOrigin,
  GEOCODE_DEBOUNCE_MS,
  isFiniteCoord,
  LAST_ORIGIN_KEY,
  loadLastKnownOrigin,
  originIsDevice,
  placeFromUnknown,
  PLAN_DEST_CHIPS,
  saveLastKnownOrigin,
  shouldTypeahead,
  type PlanPlace,
} from "./planTrip.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO: PlanPlace = {
  label: "Reno, NV",
  lat: 39.5296,
  lng: -119.8138,
  kind: "city",
};
const HERE: PlanPlace = {
  label: "Near Seattle, WA",
  lat: 47.6062,
  lng: -122.3321,
  kind: "current",
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

test("isFiniteCoord rejects junk", () => {
  assert.equal(isFiniteCoord(47.6, -122.3), true);
  assert.equal(isFiniteCoord(91, -122), false);
  assert.equal(isFiniteCoord(47, 200), false);
  assert.equal(isFiniteCoord(Number.NaN, -122), false);
});

test("placeFromUnknown requires label + coords", () => {
  assert.equal(placeFromUnknown(null), null);
  assert.equal(placeFromUnknown({ lat: 47, lng: -122 }), null);
  assert.equal(placeFromUnknown({ label: "X", lat: 99, lng: 0 }), null);
  const ok = placeFromUnknown({ label: "  Seattle  ", lat: 47.6, lng: -122.3 });
  assert.ok(ok);
  assert.equal(ok.label, "Seattle");
  assert.equal(ok.kind, "place");
});

test("last-known origin persists and rejects corrupt rows", () => {
  const { mem, restore } = stubStorage();
  try {
    assert.equal(loadLastKnownOrigin(), null);
    saveLastKnownOrigin(HERE);
    const loaded = loadLastKnownOrigin();
    assert.ok(loaded);
    assert.equal(loaded.label, HERE.label);
    assert.equal(loaded.lat, HERE.lat);
    assert.equal(loaded.kind, "current");
    assert.ok(mem.has(LAST_ORIGIN_KEY));

    saveLastKnownOrigin({ label: "", lat: 1, lng: 2, kind: "x" });
    assert.equal(loadLastKnownOrigin()?.label, HERE.label);

    mem.set(LAST_ORIGIN_KEY, "{not json");
    assert.equal(loadLastKnownOrigin(), null);

    saveLastKnownOrigin(RENO);
    clearLastKnownOrigin();
    assert.equal(loadLastKnownOrigin(), null);
  } finally {
    restore();
  }
});

test("canSubmitPlan: origin + dest, places or typed text", () => {
  assert.equal(
    canSubmitPlan({
      originPlace: null,
      originText: "",
      destPlace: null,
      destText: "",
    }),
    false,
  );
  assert.equal(
    canSubmitPlan({
      originPlace: HERE,
      originText: HERE.label,
      destPlace: null,
      destText: "S",
    }),
    false,
  );
  assert.equal(
    canSubmitPlan({
      originPlace: HERE,
      originText: HERE.label,
      destPlace: null,
      destText: "Seattle, WA",
    }),
    true,
  );
  assert.equal(
    canSubmitPlan({
      originPlace: null,
      originText: "Reno, NV",
      destPlace: RENO,
      destText: RENO.label,
    }),
    true,
  );
  assert.equal(
    canSubmitPlan({
      originPlace: null,
      originText: "",
      destPlace: RENO,
      destText: RENO.label,
    }),
    false,
  );
});

test("shouldTypeahead skips short queries and already-picked labels", () => {
  assert.equal(shouldTypeahead("S", null), false);
  assert.equal(shouldTypeahead("Se", null), true);
  assert.equal(shouldTypeahead(RENO.label, RENO), false);
  assert.equal(shouldTypeahead("Reno, NV — airport", RENO), true);
});

test("originIsDevice is current-location only", () => {
  assert.equal(originIsDevice(HERE), true);
  assert.equal(originIsDevice(RENO), false);
  assert.equal(originIsDevice(null), false);
});

test("dest chips carry coords so a tap can route without Search", () => {
  assert.ok(PLAN_DEST_CHIPS.length >= 4);
  for (const c of PLAN_DEST_CHIPS) {
    assert.ok(c.label.length > 2);
    assert.ok(isFiniteCoord(c.lat, c.lng));
  }
  assert.ok(PLAN_DEST_CHIPS.some((c) => c.label.startsWith("Seattle")));
  assert.ok(GEOCODE_DEBOUNCE_MS >= 200 && GEOCODE_DEBOUNCE_MS <= 600);
});

test("Navigate plan-trip: dest-first, profile after route, no Search tap required", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /loadLastKnownOrigin/);
  assert.match(ui, /saveLastKnownOrigin/);
  assert.match(ui, /canSubmitPlan/);
  assert.match(ui, /shouldTypeahead/);
  assert.match(ui, /PLAN_DEST_CHIPS/);
  assert.match(ui, /Use my location/);
  assert.match(ui, /Add an RV profile\?/);
  assert.match(ui, /Where to\?/);
  assert.doesNotMatch(ui, /SET PROFILE/);
  assert.doesNotMatch(ui, /Set your RV profile first/);
  assert.doesNotMatch(ui, /Calculate RV Route/);
  assert.doesNotMatch(ui, /Search origin/);
  assert.doesNotMatch(ui, /Search destination/);

  const routeBtn = ui.search(/\n\s+Route\n/);
  const profilePrompt = ui.indexOf("Add an RV profile?");
  const startTbt = ui.indexOf("Start Turn-by-Turn");
  assert.ok(routeBtn > 0, "Route button");
  assert.ok(profilePrompt > routeBtn, "profile prompt after Route");
  assert.ok(profilePrompt > startTbt, "profile prompt after Start Turn-by-Turn");
  assert.ok(
    ui.includes('routeStatus === "live" && !displayCoach'),
    "soft profile only after a live route when unknown",
  );
  assert.match(ui, /fetchNavigateRoute/);
  assert.doesNotMatch(ui, /\/api\/route/);
});
