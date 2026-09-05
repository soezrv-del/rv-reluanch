import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { pointToPixel } from "./basemap.ts";
import {
  FOLLOW_DISTANCE_FILTER_M,
  FOLLOW_MAX_AGE_MS,
  FOLLOW_RECENTER_M,
  FOLLOW_RECENTER_MS,
  FOLLOW_TIMEOUT_MS,
  FOLLOW_WATCH_OPTIONS,
  FOLLOW_ZOOM,
  fixFromCoords,
  followErrorMessage,
  followTileView,
  haversineMeters,
  headingDeg,
  shouldAcceptFix,
  shouldRecenterFollow,
  type GeoFix,
} from "./geoFollow.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO = { lat: 39.5296, lng: -119.8138 };
const SEATTLE = { lat: 47.6062, lng: -122.3321 };

function fix(
  lat: number,
  lng: number,
  extra: Partial<Omit<GeoFix, "lat" | "lng">> = {},
): GeoFix {
  return {
    lat,
    lng,
    heading: extra.heading ?? null,
    accuracy: extra.accuracy ?? 12,
    ts: extra.ts ?? 1_000,
  };
}

test("haversineMeters: same point is 0; Reno→Seattle is hundreds of km", () => {
  assert.equal(haversineMeters(RENO, RENO), 0);
  const m = haversineMeters(RENO, SEATTLE);
  assert.ok(m > 900_000 && m < 1_300_000, `got ${m}`);
});

test("fixFromCoords rejects junk and keeps a real heading", () => {
  assert.equal(fixFromCoords({ latitude: 91, longitude: -119 }), null);
  assert.equal(fixFromCoords({ latitude: 39.5, longitude: 200 }), null);
  assert.equal(
    fixFromCoords({ latitude: Number.NaN, longitude: -119.8 }),
    null,
  );
  const ok = fixFromCoords(
    { latitude: 39.5296, longitude: -119.8138, heading: 45, accuracy: 8 },
    99,
  );
  assert.ok(ok);
  assert.equal(ok.lat, 39.5296);
  assert.equal(ok.lng, -119.8138);
  assert.equal(ok.heading, 45);
  assert.equal(ok.accuracy, 8);
  assert.equal(ok.ts, 99);
});

test("headingDeg drops stationary / unknown values", () => {
  assert.equal(headingDeg(null), null);
  assert.equal(headingDeg(-1), null);
  assert.equal(headingDeg(Number.NaN), null);
  assert.equal(headingDeg(0), 0);
  assert.equal(headingDeg(370), 10);
});

test("shouldAcceptFix: first fix wins; jitter under the filter is dropped", () => {
  const a = fix(RENO.lat, RENO.lng);
  assert.equal(shouldAcceptFix(null, a), true);
  assert.equal(shouldAcceptFix(a, null), false);
  const near = fix(RENO.lat + 0.00002, RENO.lng);
  assert.ok(haversineMeters(a, near) < FOLLOW_DISTANCE_FILTER_M);
  assert.equal(shouldAcceptFix(a, near), false);
  const far = fix(RENO.lat + 0.0003, RENO.lng);
  assert.ok(haversineMeters(a, far) >= FOLLOW_DISTANCE_FILTER_M);
  assert.equal(shouldAcceptFix(a, far), true);
});

test("shouldRecenterFollow: first center, then lag / distance", () => {
  const a = fix(RENO.lat, RENO.lng);
  assert.equal(shouldRecenterFollow(null, a, 0, 1_000), true);
  assert.equal(
    shouldRecenterFollow(a, a, 1_000, 1_000 + FOLLOW_RECENTER_MS),
    false,
  );
  const hop = fix(RENO.lat + 0.0006, RENO.lng);
  assert.ok(haversineMeters(a, hop) >= FOLLOW_RECENTER_M);
  assert.equal(shouldRecenterFollow(a, hop, 1_000, 1_100), true);
  const mid = fix(RENO.lat + 0.00025, RENO.lng);
  const midM = haversineMeters(a, mid);
  assert.ok(midM >= FOLLOW_DISTANCE_FILTER_M && midM < FOLLOW_RECENTER_M);
  assert.equal(shouldRecenterFollow(a, mid, 1_000, 1_100), false);
  assert.equal(
    shouldRecenterFollow(a, mid, 1_000, 1_000 + FOLLOW_RECENTER_MS),
    true,
  );
});

test("followTileView centers the puck in pixel space", () => {
  const view = followTileView(RENO, 320, 300);
  assert.ok(view);
  assert.equal(view.z, FOLLOW_ZOOM);
  const px = pointToPixel(RENO.lat, RENO.lng, view);
  assert.ok(Math.abs(px.left - 160) < 0.6);
  assert.ok(Math.abs(px.top - 150) < 0.6);
  assert.equal(followTileView(RENO, 0, 300), null);
});

test("watch options are high-accuracy and battery-aware", () => {
  assert.equal(FOLLOW_WATCH_OPTIONS.enableHighAccuracy, true);
  assert.equal(FOLLOW_WATCH_OPTIONS.maximumAge, FOLLOW_MAX_AGE_MS);
  assert.equal(FOLLOW_WATCH_OPTIONS.timeout, FOLLOW_TIMEOUT_MS);
  assert.ok(FOLLOW_MAX_AGE_MS >= 4000);
  assert.ok(FOLLOW_DISTANCE_FILTER_M >= 10);
});

test("followErrorMessage is honest — no fake motion copy", () => {
  assert.match(
    followErrorMessage({ code: 1 }),
    /permission denied/i,
  );
  assert.match(followErrorMessage({ code: 2 }), /unavailable/i);
  assert.match(followErrorMessage({ code: 3 }), /Waiting for GPS/i);
  assert.doesNotMatch(followErrorMessage({ code: 1 }), /simulate|demo|fake/i);
});

test("guidance follow uses watchPosition; origin stays one-shot", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const map = readFileSync(
    join(root, "../../components/rvtrips/RouteBasemap.tsx"),
    "utf8",
  );
  const follow = readFileSync(join(root, "geoFollow.ts"), "utf8");

  assert.match(ui, /useNavFollow\(navArmed\)/);
  assert.match(ui, /getCurrentPosition/);
  assert.match(ui, /readDevicePosition/);
  assert.match(ui, /follow=\{follow\.fix\}/);
  assert.match(ui, /followActive=\{navArmed\}/);
  assert.match(ui, /followStatus=\{follow\.status\}/);
  assert.match(ui, /data-follow-note/);
  assert.doesNotMatch(ui, /["'`]\/api\/route/);
  assert.doesNotMatch(ui, /RATEAPI|rvData\.live/);

  assert.match(map, /data-follow-puck/);
  assert.match(map, /data-follow-status/);
  assert.match(map, /data-follow-chip/);
  assert.match(map, /followTileView/);
  assert.match(map, /shouldRecenterFollow/);
  assert.doesNotMatch(map, /["'`]\/api\/route/);

  assert.match(follow, /watchPosition/);
  assert.match(follow, /clearWatch/);
  assert.match(follow, /FOLLOW_WATCH_OPTIONS/);
  assert.match(follow, /distanceFilter|FOLLOW_DISTANCE_FILTER_M/);
  assert.doesNotMatch(follow, /["'`]\/api\/route/);
  assert.doesNotMatch(follow, /RATEAPI|rvData/);
});
