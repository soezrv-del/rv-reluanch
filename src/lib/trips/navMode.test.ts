import assert from "node:assert/strict";
import test from "node:test";
import {
  cameraChanged,
  derivedSpeedMps,
  formatArrivalClock,
  formatManeuverDistance,
  formatRemainingMiles,
  formatRemainingTime,
  formatSpeedMph,
  maneuverArrow,
  maneuverFocus,
  navCameraFor,
  NAV_APPROACH_M,
  NAV_CLOSE_M,
  NAV_CRUISE_PITCH,
  NAV_CRUISE_ZOOM,
  NAV_EXIT_M,
  NAV_TURN_PITCH,
  NAV_TURN_ZOOM,
  pickSpeedMps,
  smoothstep,
  splitRouteAtFix,
  tripRemaining,
} from "./navMode.ts";

test("smoothstep clamps and eases", () => {
  assert.equal(smoothstep(-1), 0);
  assert.equal(smoothstep(0), 0);
  assert.equal(smoothstep(0.5), 0.5);
  assert.equal(smoothstep(1), 1);
  assert.equal(smoothstep(4), 1);
  assert.ok(smoothstep(0.1) < 0.1, "slow start");
});

test("maneuverFocus: cruise far away, full at the turn, eases out after", () => {
  assert.equal(maneuverFocus(null), 0);
  assert.equal(maneuverFocus(NaN), 0);
  assert.equal(maneuverFocus(5_000), 0);
  assert.equal(maneuverFocus(NAV_APPROACH_M), 0);
  assert.equal(maneuverFocus(NAV_CLOSE_M), 1);
  assert.equal(maneuverFocus(0), 1);
  const mid = maneuverFocus((NAV_APPROACH_M + NAV_CLOSE_M) / 2);
  assert.ok(mid > 0.4 && mid < 0.6, `mid ${mid}`);
  // Monotonic on approach.
  let prev = -1;
  for (let m = NAV_APPROACH_M; m >= NAV_CLOSE_M; m -= 20) {
    const f = maneuverFocus(m);
    assert.ok(f >= prev, `focus must not drop at ${m}m`);
    prev = f;
  }
  // Just passed: still mostly in; past the exit band: back to cruise.
  assert.ok(maneuverFocus(-10) > 0.9);
  assert.ok(maneuverFocus(-NAV_EXIT_M / 2) < maneuverFocus(-10));
  assert.equal(maneuverFocus(-NAV_EXIT_M), 0);
  assert.equal(maneuverFocus(-NAV_EXIT_M * 3), 0);
});

test("navCameraFor: zoom + pitch curve", () => {
  assert.deepEqual(navCameraFor(null), { zoom: NAV_CRUISE_ZOOM, pitch: NAV_CRUISE_PITCH });
  assert.deepEqual(navCameraFor(3_000), { zoom: NAV_CRUISE_ZOOM, pitch: NAV_CRUISE_PITCH });
  assert.deepEqual(navCameraFor(20), { zoom: NAV_TURN_ZOOM, pitch: NAV_TURN_PITCH });
  const mid = navCameraFor(250);
  assert.ok(mid.zoom > NAV_CRUISE_ZOOM && mid.zoom < NAV_TURN_ZOOM);
  assert.ok(mid.pitch > NAV_CRUISE_PITCH && mid.pitch < NAV_TURN_PITCH);
  assert.ok(navCameraFor(80).zoom > navCameraFor(300).zoom, "closer = tighter");
  // Never past the turn zoom or a 60° pitch.
  for (const m of [-200, -50, 0, 10, 100, 400, 900]) {
    const c = navCameraFor(m, 30);
    assert.ok(c.zoom <= NAV_TURN_ZOOM && c.pitch <= NAV_TURN_PITCH);
    assert.ok(c.pitch >= NAV_CRUISE_PITCH);
  }
});

test("navCameraFor: highway speed pulls the cruise camera back", () => {
  const slow = navCameraFor(5_000, 5);
  const fast = navCameraFor(5_000, 30);
  assert.ok(fast.zoom < slow.zoom, `${fast.zoom} < ${slow.zoom}`);
  assert.equal(fast.zoom, NAV_CRUISE_ZOOM - 1);
  // At the turn speed does not matter — we are fully in.
  assert.equal(navCameraFor(10, 30).zoom, NAV_TURN_ZOOM);
});

test("cameraChanged skips tiny nudges", () => {
  assert.equal(cameraChanged(null, { zoom: 15, pitch: 45 }), true);
  assert.equal(cameraChanged({ zoom: 15, pitch: 45 }, { zoom: 15.05, pitch: 46 }), false);
  assert.equal(cameraChanged({ zoom: 15, pitch: 45 }, { zoom: 15.3, pitch: 45 }), true);
  assert.equal(cameraChanged({ zoom: 15, pitch: 45 }, { zoom: 15, pitch: 50 }), true);
});

test("formatManeuverDistance is imperial and rounded", () => {
  assert.equal(formatManeuverDistance(null), "");
  assert.equal(formatManeuverDistance(NaN), "");
  assert.equal(formatManeuverDistance(10), "Now");
  assert.equal(formatManeuverDistance(20), "50 ft");
  assert.equal(formatManeuverDistance(100), "350 ft");
  assert.equal(formatManeuverDistance(152), "500 ft");
  assert.equal(formatManeuverDistance(161), "0.1 mi");
  assert.equal(formatManeuverDistance(800), "0.5 mi");
  assert.equal(formatManeuverDistance(1609.344 * 2.04), "2.0 mi");
  assert.equal(formatManeuverDistance(1609.344 * 12.6), "13 mi");
  for (const m of [20, 100, 500, 5_000, 50_000]) {
    assert.doesNotMatch(formatManeuverDistance(m), /\bm\b|km|meter/);
  }
});

test("remaining strip copy", () => {
  assert.equal(formatRemainingMiles(50), "< 0.1 mi");
  assert.equal(formatRemainingMiles(1609.344 * 3.26), "3.3 mi");
  assert.equal(formatRemainingMiles(1609.344 * 212.4), "212 mi");
  assert.equal(formatRemainingMiles(-1), "");
  assert.equal(formatRemainingTime(20), "< 1 min");
  assert.equal(formatRemainingTime(12 * 60), "12 min");
  assert.equal(formatRemainingTime(65 * 60), "1 hr 05 min");
  assert.equal(formatRemainingTime(null), "");
  const now = Date.UTC(2026, 9, 4, 3, 0, 0); // 8:00 PM PT
  assert.equal(formatArrivalClock(now, 42 * 60, "America/Los_Angeles"), "8:42 PM");
  assert.equal(formatArrivalClock(now, -5), "");
});

test("tripRemaining scales router duration by distance left", () => {
  assert.equal(tripRemaining({ routeDistanceM: 0, routeDurationS: 10, alongM: 0 }), null);
  assert.deepEqual(
    tripRemaining({ routeDistanceM: 10_000, routeDurationS: 600, alongM: 2_500 }),
    { remainM: 7_500, remainS: 450 },
  );
  // No fix yet → whole trip; past the end → zero.
  assert.deepEqual(
    tripRemaining({ routeDistanceM: 10_000, routeDurationS: 600, alongM: null }),
    { remainM: 10_000, remainS: 600 },
  );
  assert.deepEqual(
    tripRemaining({ routeDistanceM: 10_000, routeDurationS: 600, alongM: 99_000 }),
    { remainM: 0, remainS: 0 },
  );
});

test("maneuverArrow reads HERE / OSRM instruction text", () => {
  assert.equal(maneuverArrow("turn", "Turn left onto Main St"), "left");
  assert.equal(maneuverArrow("turn", "Turn right onto I-5 S"), "right");
  assert.equal(maneuverArrow("continue", "Keep left toward Portland"), "slight-left");
  assert.equal(maneuverArrow("turn", "Turn slightly right onto US-101"), "slight-right");
  assert.equal(maneuverArrow("turn", "Make a slight right onto US-101"), "slight-right");
  assert.equal(maneuverArrow("turn", "Make a sharp left"), "sharp-left");
  assert.equal(maneuverArrow("exit", "Take exit 42 on the right"), "ramp-right");
  assert.equal(maneuverArrow("off ramp", "Take the ramp on the left"), "ramp-left");
  assert.equal(maneuverArrow("roundabout", "Enter the roundabout and take the 2nd exit"), "roundabout");
  assert.equal(maneuverArrow("uTurn", "Make a U-turn"), "uturn");
  assert.equal(maneuverArrow("arrive", "Arrive at destination"), "arrive");
  assert.equal(maneuverArrow("continue", "Continue on SR-20"), "straight");
});

test("speed: device speed wins, otherwise derived from fixes", () => {
  const a = { lat: 45, lng: -122, ts: 0 };
  const b = { lat: 45.0009, lng: -122, ts: 4_000 }; // ~100 m in 4 s
  const v = derivedSpeedMps(a, b);
  assert.ok(v != null && v > 24 && v < 26, `${v}`);
  assert.equal(derivedSpeedMps(a, { ...b, ts: 100 }), null, "too close in time");
  assert.equal(derivedSpeedMps(a, { lat: 46, lng: -122, ts: 4_000 }), null, "GPS jump");
  assert.equal(pickSpeedMps({ ...b, speed: 10 }, a), 10);
  assert.ok(Math.abs((pickSpeedMps({ ...b, speed: null }, a) ?? 0) - (v ?? 0)) < 1e-9);
  assert.equal(formatSpeedMph(null), "--");
  assert.equal(formatSpeedMph(0.2), "0");
  assert.equal(formatSpeedMph(26.8224), "60");
});

test("splitRouteAtFix cuts traveled vs remaining at the snapped point", () => {
  const line: [number, number][] = [
    [-122, 45],
    [-122, 45.01],
    [-122, 45.02],
  ];
  assert.equal(splitRouteAtFix(line, null), null);
  assert.equal(splitRouteAtFix([[-122, 45]], { lat: 45, lng: -122 }), null);
  const s = splitRouteAtFix(line, { lat: 45.015, lng: -121.9999 })!;
  assert.equal(s.traveled.length, 3);
  assert.equal(s.remaining.length, 2);
  assert.deepEqual(s.traveled[2], s.remaining[0], "lines touch");
  assert.ok(Math.abs(s.remaining[0]![1] - 45.015) < 1e-9);
  assert.ok(s.metersOff < 10);
  assert.ok(s.bearing != null && (s.bearing < 1 || s.bearing > 359), "heading north");
  const start = splitRouteAtFix(line, { lat: 44.99, lng: -122 })!;
  assert.equal(start.traveled.length, 2);
  assert.equal(start.remaining.length, 3);
});
