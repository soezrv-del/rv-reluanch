import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { OsrmRouteResult } from "./osrm.ts";
import {
  geometryToSvgPath,
  liveProviderNote,
  liveRouteStats,
  tripRouteFromLive,
} from "./routeResults.ts";
import { DEMO_ROUTE } from "./tripData.ts";

const root = dirname(fileURLToPath(import.meta.url));

const LIVE: OsrmRouteResult = {
  source: "here",
  engine: "RV-SAFE · HERE Truck",
  baseUrl: "https://router.hereapi.com",
  profile: "truck",
  code: "Ok",
  distanceM: 1_126_000,
  durationS: 42_120,
  miles: 699.7,
  driveHours: 11,
  driveMinutes: 42,
  geometry: {
    type: "LineString",
    coordinates: [
      [-119.8138, 39.5296],
      [-122.3321, 47.6062],
    ],
  },
  steps: [],
  waypoints: [],
  origin: { lng: -119.8138, lat: 39.5296 },
  destination: { lng: -122.3321, lat: 47.6062 },
  fetchedAt: "2026-09-05T00:00:00.000Z",
  routingMode: "rv_safe",
  providerNote: "Truck dims 411cm H · 1372cm L · 19958kg",
};

test("liveRouteStats reads API miles/time only — never DEMO_ROUTE", () => {
  const stats = liveRouteStats(LIVE);
  assert.deepEqual(stats, { miles: 699.7, driveHours: 11, driveMinutes: 42 });
  assert.notEqual(stats?.miles, DEMO_ROUTE.miles);
  assert.equal(liveRouteStats(null), null);
  assert.equal(liveRouteStats(undefined), null);
  assert.equal(liveRouteStats({ ...LIVE, miles: Number.NaN }), null);
  assert.equal(liveRouteStats({ ...LIVE, miles: -1 }), null);
});

test("liveRouteStats can split durationS when hours/mins missing", () => {
  const stats = liveRouteStats({
    miles: 12.4,
    durationS: 90 * 60 + 15,
    driveHours: Number.NaN,
    driveMinutes: Number.NaN,
  });
  assert.deepEqual(stats, { miles: 12.4, driveHours: 1, driveMinutes: 30 });
  assert.equal(
    liveRouteStats({
      miles: 12.4,
      durationS: Number.NaN,
      driveHours: Number.NaN,
      driveMinutes: Number.NaN,
    }),
    null,
  );
});

test("tripRouteFromLive does not spread DEMO_ROUTE fields", () => {
  const trip = tripRouteFromLive(LIVE, "Reno, NV", "Seattle, WA");
  assert.ok(trip);
  assert.equal(trip.miles, LIVE.miles);
  assert.equal(trip.driveHours, LIVE.driveHours);
  assert.equal(trip.driveMinutes, LIVE.driveMinutes);
  assert.equal(trip.origin.label, "Reno, NV");
  assert.equal(trip.destination.label, "Seattle, WA");
  assert.equal(trip.engine, "RV-SAFE · HERE Truck");
  assert.equal(trip.alertCount, 0);
  assert.notEqual(trip.miles, DEMO_ROUTE.miles);
  assert.notEqual(trip.destination.label, DEMO_ROUTE.destination.label);
  assert.equal(tripRouteFromLive({ ...LIVE, miles: Number.NaN }, "A", "B"), null);
});

test("liveProviderNote is API text only — hides key-setup copy", () => {
  assert.equal(liveProviderNote(LIVE), "Truck dims 411cm H · 1372cm L · 19958kg");
  assert.equal(liveProviderNote({ providerNote: "  " }), "");
  assert.equal(liveProviderNote(null), "");
  assert.equal(
    liveProviderNote({
      providerNote:
        "HERE key not configured — using OSRM RV-weighted fallback. Add HERE_API_KEY for true truck height/weight avoidance.",
    }),
    "",
  );
});

test("geometryToSvgPath draws the API polyline", () => {
  const d = geometryToSvgPath(LIVE.geometry, 200, 80);
  assert.ok(d);
  assert.match(d, /^M/);
  assert.match(d, / L/);
  assert.equal(geometryToSvgPath(null, 200, 80), null);
  assert.equal(geometryToSvgPath({ type: "LineString", coordinates: [] }, 200, 80), null);
});

test("Navigate results sheet uses live stats and labels demo camps/map", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /liveRouteStats/);
  assert.match(ui, /tripRouteFromLive/);
  assert.match(ui, /data-route-results/);
  assert.match(ui, /routeEngineLabel/);
  assert.match(ui, /not a clearance/);
  assert.match(ui, /Sample pads — not live inventory/);
  assert.match(ui, /\bDEMO\b/);
  assert.doesNotMatch(ui, /useState\(DEMO_ROUTE\)/);
  assert.doesNotMatch(ui, /\.\.\.DEMO_ROUTE/);
  assert.doesNotMatch(ui, /RVTRIPS_MAP_PANEL/);
  assert.doesNotMatch(ui, /DEMO_ALERTS/);
  assert.doesNotMatch(ui, /DEMO_DIRECTIONS/);
  assert.doesNotMatch(ui, /clearance DB/);
});
