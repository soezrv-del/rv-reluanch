import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { fetchNavigateRoute, type RvSafeCoachInput } from "./navigateRoute.ts";
import type { OsrmLngLat, OsrmRouteResult } from "./osrm.ts";
import {
  createOffRouteGate,
  decideOffRouteReroute,
  metersToRoutePolyline,
  navigateParamsForReroute,
  OFF_ROUTE_METERS,
  remainingViaStops,
  REROUTE_COOLDOWN_MS,
  rerouteUsesRvSafe,
} from "./offRouteReroute.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO: OsrmLngLat = { lng: -119.8138, lat: 39.5296 };
const NORTH: OsrmLngLat = { lng: -119.8138, lat: 39.5396 };
const DEST: OsrmLngLat = { lng: -119.8138, lat: 39.5496 };
const VIA: OsrmLngLat = { lng: -119.8138, lat: 39.5396 };

/** ~1.1 km north-south corridor through Reno. */
const LINE: OsrmLngLat[] = [RENO, NORTH, DEST];
const LINE_GEOJSON: [number, number][] = LINE.map((p) => [p.lng, p.lat]);

const LOCKED: RvSafeCoachInput = {
  locked: true,
  heightFt: 13.5,
  widthFt: 8.5,
  lengthFt: 45,
  weightLbs: 44000,
  type: "Class A Diesel",
};

/** 1° lat ≈ 111_195 m. */
function shiftMeters(
  p: OsrmLngLat,
  northM: number,
  eastM: number,
): OsrmLngLat {
  const latRad = (p.lat * Math.PI) / 180;
  return {
    lat: p.lat + northM / 111_195,
    lng: p.lng + eastM / (111_195 * Math.cos(latRad)),
  };
}

function stubRoute(partial: Partial<OsrmRouteResult> = {}): OsrmRouteResult {
  return {
    source: "here",
    engine: "RV-SAFE · HERE Truck",
    baseUrl: "https://router.hereapi.com",
    profile: "truck",
    code: "Ok",
    distanceM: 1000,
    durationS: 60,
    miles: 12.4,
    driveHours: 0,
    driveMinutes: 18,
    geometry: { type: "LineString", coordinates: LINE_GEOJSON },
    steps: [],
    waypoints: [],
    origin: RENO,
    destination: DEST,
    fetchedAt: "2026-09-07T00:00:00.000Z",
    routingMode: "rv_safe",
    ...partial,
  };
}

test("metersToRoutePolyline: on the line is ~0; 80m east is ~80", () => {
  const mid = shiftMeters(RENO, 550, 0);
  const on = metersToRoutePolyline(mid, LINE);
  assert.ok(on.metersOff < 2, `on-route ${on.metersOff}`);
  assert.ok(on.progress > 0.2 && on.progress < 0.8, `progress ${on.progress}`);

  const off = metersToRoutePolyline(shiftMeters(mid, 0, 80), LINE_GEOJSON);
  assert.ok(off.metersOff > 70 && off.metersOff < 95, `off ${off.metersOff}`);
});

test("on-route (<50m) does not reroute", () => {
  const mid = shiftMeters(RENO, 400, 0);
  const near = shiftMeters(mid, 0, 20);
  assert.ok(metersToRoutePolyline(near, LINE).metersOff < OFF_ROUTE_METERS);

  const d = decideOffRouteReroute({
    armed: true,
    liveRoute: true,
    here: near,
    dest: DEST,
    vias: [VIA],
    polyline: LINE_GEOJSON,
    lastRerouteAt: 0,
    now: 10_000,
  });
  assert.equal(d.action, "none");
  assert.equal(d.reason, "on-route");
});

test("off-route (>50m) triggers one reroute from the live fix", () => {
  const mid = shiftMeters(RENO, 400, 0);
  const off = shiftMeters(mid, 0, 80);
  assert.ok(metersToRoutePolyline(off, LINE).metersOff > OFF_ROUTE_METERS);

  const gate = createOffRouteGate();
  const first = gate.consider({
    armed: true,
    liveRoute: true,
    here: off,
    dest: DEST,
    vias: [VIA],
    polyline: LINE,
    now: 10_000,
  });
  assert.equal(first.action, "reroute");
  if (first.action !== "reroute") return;
  assert.equal(first.from.lat, off.lat);
  assert.equal(first.from.lng, off.lng);
  assert.equal(first.to.lat, DEST.lat);
  assert.equal(first.to.lng, DEST.lng);
  assert.ok(first.metersOff > OFF_ROUTE_METERS);

  const burst = gate.consider({
    armed: true,
    liveRoute: true,
    here: shiftMeters(off, 0, 20),
    dest: DEST,
    vias: [VIA],
    polyline: LINE,
    now: 10_400,
  });
  assert.equal(burst.action, "none");
  assert.ok(burst.reason === "in-flight" || burst.reason === "cooldown");
});

test("cooldown prevents a burst after the first reroute finishes", () => {
  const off = shiftMeters(shiftMeters(RENO, 400, 0), 0, 90);
  const gate = createOffRouteGate({ cooldownMs: REROUTE_COOLDOWN_MS });

  const a = gate.consider({
    armed: true,
    liveRoute: true,
    here: off,
    dest: DEST,
    polyline: LINE,
    now: 1_000,
  });
  assert.equal(a.action, "reroute");
  gate.finish();

  const tooSoon = gate.consider({
    armed: true,
    liveRoute: true,
    here: off,
    dest: DEST,
    polyline: LINE,
    now: 1_000 + REROUTE_COOLDOWN_MS - 1,
  });
  assert.equal(tooSoon.action, "none");
  assert.equal(tooSoon.reason, "cooldown");

  const later = gate.consider({
    armed: true,
    liveRoute: true,
    here: off,
    dest: DEST,
    polyline: LINE,
    now: 1_000 + REROUTE_COOLDOWN_MS,
  });
  assert.equal(later.action, "reroute");
});

test("truck dims stay on the reroute request when the coach is locked", async () => {
  const off = shiftMeters(shiftMeters(RENO, 400, 0), 0, 80);
  const decision = decideOffRouteReroute({
    armed: true,
    liveRoute: true,
    here: off,
    dest: DEST,
    polyline: LINE,
    lastRerouteAt: 0,
    now: 5_000,
  });
  assert.equal(decision.action, "reroute");
  if (decision.action !== "reroute") return;
  assert.equal(rerouteUsesRvSafe(LOCKED), true);
  assert.equal(rerouteUsesRvSafe({ ...LOCKED, locked: false }), false);

  const params = navigateParamsForReroute(decision, LOCKED);
  assert.equal(params.coach, LOCKED);
  assert.equal(params.from.lat, off.lat);
  assert.equal(params.to.lng, DEST.lng);
  assert.equal(params.via, undefined);

  const calls: string[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    return new Response(JSON.stringify(stubRoute()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const data = await fetchNavigateRoute(params);
    assert.equal(data.source, "here");
    assert.equal(data.routingMode, "rv_safe");
    assert.equal(calls.length, 1);
    assert.match(calls[0]!, /\/api\?/);
    assert.doesNotMatch(calls[0]!, /\/api\/route/);
    assert.doesNotMatch(calls[0]!, /api\.mapbox\.com\/directions/);
    assert.match(calls[0]!, /mode=rv_safe/);
    assert.match(calls[0]!, /heightFt=13\.5/);
    assert.match(calls[0]!, /lengthFt=45/);
    assert.match(calls[0]!, /weightLbs=44000/);
    assert.match(calls[0]!, /widthFt=8\.5/);
    assert.match(calls[0]!, /coachType=Class/);
  } finally {
    globalThis.fetch = prev;
  }
});

test("remaining vias drop a passed stop and keep dest as the planner does", () => {
  const pastVia = shiftMeters(VIA, 80, 0);
  const kept = remainingViaStops(pastVia, [VIA], DEST, LINE);
  assert.equal(kept.length, 0);

  const beforeVia = shiftMeters(RENO, 200, 80);
  const still = remainingViaStops(beforeVia, [VIA], DEST, LINE);
  assert.equal(still.length, 1);
  assert.equal(still[0]?.lat, VIA.lat);

  const atDest = shiftMeters(DEST, 0, 10);
  const d = decideOffRouteReroute({
    armed: true,
    liveRoute: true,
    here: atDest,
    dest: DEST,
    polyline: LINE,
    lastRerouteAt: 0,
    now: 1,
  });
  assert.equal(d.action, "none");
  assert.equal(d.reason, "arrived");
});

test("disarmed follow / missing polyline never hits the router", () => {
  const off = shiftMeters(shiftMeters(RENO, 400, 0), 0, 80);
  assert.equal(
    decideOffRouteReroute({
      armed: false,
      liveRoute: true,
      here: off,
      dest: DEST,
      polyline: LINE,
      lastRerouteAt: 0,
      now: 1,
    }).reason,
    "follow-off",
  );
  assert.equal(
    decideOffRouteReroute({
      armed: true,
      liveRoute: false,
      here: off,
      dest: DEST,
      polyline: LINE,
      lastRerouteAt: 0,
      now: 1,
    }).reason,
    "no-live-route",
  );
  assert.equal(
    decideOffRouteReroute({
      armed: true,
      liveRoute: true,
      here: off,
      dest: DEST,
      polyline: [RENO],
      lastRerouteAt: 0,
      now: 1,
    }).reason,
    "no-polyline",
  );
});

test("locked reroute with a remaining via still sends truck dims on every hop", async () => {
  const beforeVia = shiftMeters(RENO, 200, 80);
  const decision = decideOffRouteReroute({
    armed: true,
    liveRoute: true,
    here: beforeVia,
    dest: DEST,
    vias: [VIA],
    polyline: LINE,
    lastRerouteAt: 0,
    now: 8_000,
  });
  assert.equal(decision.action, "reroute");
  if (decision.action !== "reroute") return;
  assert.equal(decision.via.length, 1);

  const params = navigateParamsForReroute(decision, LOCKED);
  const calls: string[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    return new Response(
      JSON.stringify(
        stubRoute({
          miles: 50,
          driveHours: 1,
          driveMinutes: 0,
          distanceM: 80_467,
          durationS: 3_600,
        }),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    await fetchNavigateRoute(params);
    assert.equal(calls.length, 2);
    for (const url of calls) {
      assert.match(url, /\/api\?/);
      assert.match(url, /mode=rv_safe/);
      assert.match(url, /heightFt=13\.5/);
      assert.match(url, /weightLbs=44000/);
      assert.doesNotMatch(url, /api\.mapbox\.com\/directions/);
    }
  } finally {
    globalThis.fetch = prev;
  }
});

test("Trips follow reroute stays on HERE Truck / OSRM — not Mapbox Directions", () => {
  const helper = readFileSync(join(root, "offRouteReroute.ts"), "utf8");
  const hook = readFileSync(join(root, "useOffRouteReroute.ts"), "utf8");
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const map = readFileSync(
    join(root, "../../components/rvtrips/RouteBasemap.tsx"),
    "utf8",
  );
  const gl = readFileSync(
    join(root, "../../components/rvtrips/RouteMapboxGl.tsx"),
    "utf8",
  );

  assert.match(helper, /HERE Truck/);
  assert.match(helper, /mode=rv_safe/);
  assert.match(helper, /Never Mapbox Directions/);
  assert.match(helper, /fetchNavigateRoute|navigateParamsForReroute/);
  assert.doesNotMatch(helper, /api\.mapbox\.com\/directions/);
  assert.doesNotMatch(helper, /["'`]\/api\/route/);

  assert.match(hook, /createOffRouteGate/);
  assert.match(hook, /navigateParamsForReroute/);
  assert.match(hook, /fetchNavigateRoute/);
  assert.doesNotMatch(hook, /api\.mapbox\.com\/directions/);
  assert.doesNotMatch(hook, /["'`]\/api\/route/);
  assert.doesNotMatch(hook, /sapphire-header|data-trips-tools/);

  assert.match(ui, /useOffRouteReroute/);
  assert.match(ui, /fetchNavigateRoute/);
  assert.doesNotMatch(ui, /api\.mapbox\.com\/directions/);
  assert.doesNotMatch(ui, /["'`]\/api\/route/);

  const tools = ui.slice(
    ui.indexOf("data-trips-tools"),
    ui.indexOf("</header>"),
  );
  assert.match(tools, /Dumps/);
  assert.match(tools, /Pack/);
  assert.match(tools, /Profile/);
  assert.doesNotMatch(tools, /pointer-events-none/);

  assert.doesNotMatch(map, /api\.mapbox\.com\/directions/);
  assert.doesNotMatch(gl, /api\.mapbox\.com\/directions/);
  assert.doesNotMatch(gl, /mapbox-gl-directions/i);
  assert.match(gl, /overflow-hidden/);
  assert.doesNotMatch(gl, /fixed inset-0/);
});
