import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  buildRvSafeQuery,
  canUseRvSafe,
  fetchNavigateRoute,
  mergeLiveLegs,
  routeEngineLabel,
  routeEngineNote,
  routeStopOrder,
  type RvSafeCoachInput,
} from "./navigateRoute.ts";
import type { OsrmLngLat, OsrmRouteResult } from "./osrm.ts";

const root = dirname(fileURLToPath(import.meta.url));

const FROM: OsrmLngLat = { lng: -119.8, lat: 39.5 };
const TO: OsrmLngLat = { lng: -122.3, lat: 47.6 };

const LOCKED: RvSafeCoachInput = {
  locked: true,
  heightFt: 13.5,
  widthFt: 8.5,
  lengthFt: 45,
  weightLbs: 44000,
  type: "Class A Diesel",
};

function stubRoute(partial: Partial<OsrmRouteResult> = {}): OsrmRouteResult {
  return {
    source: "osrm",
    engine: "REAL ROUTE · OSRM",
    baseUrl: "https://router.project-osrm.org",
    profile: "driving",
    code: "Ok",
    distanceM: 1000,
    durationS: 60,
    miles: 12.4,
    driveHours: 0,
    driveMinutes: 18,
    geometry: { type: "LineString", coordinates: [[-119.8, 39.5], [-122.3, 47.6]] },
    steps: [],
    waypoints: [],
    origin: FROM,
    destination: TO,
    fetchedAt: "2026-09-05T00:00:00.000Z",
    ...partial,
  };
}

test("canUseRvSafe: only locked coaches with real height/length/weight", () => {
  assert.equal(canUseRvSafe(null), false);
  assert.equal(canUseRvSafe({ ...LOCKED, locked: false }), false);
  assert.equal(canUseRvSafe({ ...LOCKED, locked: undefined }), false);
  assert.equal(canUseRvSafe({ ...LOCKED, heightFt: 0 }), false);
  assert.equal(canUseRvSafe({ ...LOCKED, lengthFt: 0 }), false);
  assert.equal(canUseRvSafe({ ...LOCKED, weightLbs: 0 }), false);
  assert.equal(canUseRvSafe(LOCKED), true);
  // Width is optional — missing width still qualifies
  assert.equal(canUseRvSafe({ ...LOCKED, widthFt: 0 }), true);
});

test("buildRvSafeQuery: mode=rv_safe + profile dims, no invented defaults", () => {
  const qs = buildRvSafeQuery(FROM, TO, LOCKED);
  assert.equal(qs.get("mode"), "rv_safe");
  assert.equal(qs.get("from"), "-119.8,39.5");
  assert.equal(qs.get("to"), "-122.3,47.6");
  assert.equal(qs.get("heightFt"), "13.5");
  assert.equal(qs.get("lengthFt"), "45");
  assert.equal(qs.get("weightLbs"), "44000");
  assert.equal(qs.get("widthFt"), "8.5");
  assert.equal(qs.get("coachType"), "Class A Diesel");
  assert.equal(qs.get("propane"), null);

  const slim = buildRvSafeQuery(FROM, TO, {
    locked: true,
    heightFt: 12,
    lengthFt: 30,
    weightLbs: 18000,
  });
  assert.equal(slim.get("widthFt"), null);
  assert.equal(slim.get("coachType"), null);
  assert.equal(slim.get("heightFt"), "12");
});

test("routeEngineLabel: Truck vs car fallback vs OSRM", () => {
  assert.equal(routeEngineLabel(null), "OSRM");
  assert.equal(
    routeEngineLabel({ source: "here", routingMode: "rv_safe" }),
    "HERE Truck",
  );
  assert.equal(
    routeEngineLabel({
      source: "osrm",
      routingMode: "rv_safe",
      fallbackFrom: "here",
    }),
    "OSRM · car fallback",
  );
  assert.equal(
    routeEngineLabel({ source: "osrm", routingMode: "rv_safe" }),
    "OSRM · car fallback",
  );
  assert.equal(
    routeEngineLabel({ source: "osrm", routingMode: "standard" }),
    "OSRM",
  );
});

test("routeEngineNote prefers providerNote", () => {
  assert.equal(
    routeEngineNote(
      stubRoute({
        source: "here",
        providerNote: "Truck dims 427cm H · 1372cm L · 19958kg",
      }),
    ),
    "Truck dims 427cm H · 1372cm L · 19958kg",
  );
  assert.match(
    routeEngineNote(stubRoute({ source: "here", providerNote: undefined })),
    /HERE Truck/,
  );
});

test("fetchNavigateRoute: unlocked stays on /api/osrm", async () => {
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
    const data = await fetchNavigateRoute({
      from: FROM,
      to: TO,
      coach: { ...LOCKED, locked: false },
    });
    assert.equal(data.source, "osrm");
    assert.equal(calls.length, 1);
    assert.match(calls[0]!, /\/api\/osrm/);
    assert.doesNotMatch(calls[0]!, /\/api\?/);
  } finally {
    globalThis.fetch = prev;
  }
});

test("fetchNavigateRoute: locked prefers /api?mode=rv_safe with dims", async () => {
  const calls: string[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    return new Response(
      JSON.stringify(
        stubRoute({
          source: "here",
          engine: "RV-SAFE · HERE Truck",
          routingMode: "rv_safe",
          profile: "truck",
        }),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const data = await fetchNavigateRoute({ from: FROM, to: TO, coach: LOCKED });
    assert.equal(data.source, "here");
    assert.equal(data.engine, "RV-SAFE · HERE Truck");
    assert.equal(calls.length, 1);
    assert.match(calls[0]!, /\/api\?/);
    assert.doesNotMatch(calls[0]!, /\/api\/route/);
    assert.match(calls[0]!, /mode=rv_safe/);
    assert.match(calls[0]!, /heightFt=13\.5/);
    assert.match(calls[0]!, /weightLbs=44000/);
    assert.match(calls[0]!, /lengthFt=45/);
    assert.match(calls[0]!, /coachType=Class/);
  } finally {
    globalThis.fetch = prev;
  }
});

test("fetchNavigateRoute: server OSRM fallback (no HERE key) is not a second /api/osrm hop", async () => {
  const calls: string[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    return new Response(
      JSON.stringify(
        stubRoute({
          source: "osrm",
          engine: "RV-SAFE fallback · OSRM · RV-w",
          routingMode: "rv_safe",
          fallbackFrom: "here",
          providerNote: "HERE key not configured — using OSRM RV-weighted fallback.",
        }),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const data = await fetchNavigateRoute({ from: FROM, to: TO, coach: LOCKED });
    assert.equal(data.source, "osrm");
    assert.equal(data.fallbackFrom, "here");
    assert.equal(routeEngineLabel(data), "OSRM · car fallback");
    assert.equal(calls.length, 1);
    assert.match(calls[0]!, /\/api\?/);
    assert.doesNotMatch(calls[0]!, /\/api\/osrm/);
  } finally {
    globalThis.fetch = prev;
  }
});

test("fetchNavigateRoute: HERE/hybrid failure falls back to fetchOsrmRoute", async () => {
  const calls: string[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    if (url.includes("/api?")) {
      return new Response(JSON.stringify({ error: "HERE HTTP 503" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify(stubRoute()), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;
  try {
    const data = await fetchNavigateRoute({ from: FROM, to: TO, coach: LOCKED });
    assert.equal(data.source, "osrm");
    assert.equal(data.miles, 12.4);
    assert.equal(calls.length, 2);
    assert.match(calls[0]!, /\/api\?/);
    assert.match(calls[1]!, /\/api\/osrm/);
  } finally {
    globalThis.fetch = prev;
  }
});

test("fetchNavigateRoute: abort on hybrid fetch is not an OSRM fallback", async () => {
  const ctrl = new AbortController();
  ctrl.abort();
  const prev = globalThis.fetch;
  let osrmHits = 0;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/osrm")) osrmHits += 1;
    const err = new Error("Aborted");
    err.name = "AbortError";
    throw err;
  }) as typeof fetch;
  try {
    await assert.rejects(
      () =>
        fetchNavigateRoute({
          from: FROM,
          to: TO,
          coach: LOCKED,
          signal: ctrl.signal,
        }),
    );
    assert.equal(osrmHits, 0);
  } finally {
    globalThis.fetch = prev;
  }
});

test("routeStopOrder inserts vias between origin and dest", () => {
  const via = { lng: -116.2, lat: 43.6 };
  assert.deepEqual(routeStopOrder(FROM, TO, [via]), [FROM, via, TO]);
  assert.deepEqual(routeStopOrder(FROM, TO, []), [FROM, TO]);
  assert.deepEqual(
    routeStopOrder(FROM, TO, [{ lng: Number.NaN, lat: 43 }]),
    [FROM, TO],
  );
});

test("mergeLiveLegs sums live API miles/time only", () => {
  const a = stubRoute({
    miles: 100,
    driveHours: 2,
    driveMinutes: 0,
    distanceM: 160_934.4,
    durationS: 7_200,
    geometry: {
      type: "LineString",
      coordinates: [
        [-119.8, 39.5],
        [-116.2, 43.6],
      ],
    },
    destination: { lng: -116.2, lat: 43.6 },
  });
  const b = stubRoute({
    miles: 50.2,
    driveHours: 1,
    driveMinutes: 6,
    distanceM: 80_467.2,
    durationS: 3_960,
    origin: { lng: -116.2, lat: 43.6 },
    geometry: {
      type: "LineString",
      coordinates: [
        [-116.2, 43.6],
        [-122.3, 47.6],
      ],
    },
  });
  const merged = mergeLiveLegs([a, b]);
  assert.ok(merged);
  assert.equal(merged.miles, 150);
  assert.equal(merged.driveHours, 3);
  assert.equal(merged.driveMinutes, 6);
  assert.equal(merged.origin.lng, FROM.lng);
  assert.equal(merged.destination.lng, TO.lng);
  assert.equal(merged.geometry?.coordinates.length, 3);
  assert.equal(mergeLiveLegs([]), null);
  assert.equal(mergeLiveLegs([stubRoute({ miles: Number.NaN })]), null);
});

test("fetchNavigateRoute: via hops stitch two helper calls, never /api/route", async () => {
  const via = { lng: -116.2, lat: 43.6 };
  const calls: string[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    const isFirst = calls.length === 1;
    return new Response(
      JSON.stringify(
        stubRoute({
          miles: isFirst ? 400 : 457.6,
          driveHours: isFirst ? 7 : 8,
          driveMinutes: isFirst ? 10 : 28,
          distanceM: isFirst ? 643_700 : 736_500,
          durationS: isFirst ? 25_800 : 30_480,
        }),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const data = await fetchNavigateRoute({
      from: FROM,
      to: TO,
      via: [via],
    });
    assert.equal(calls.length, 2);
    assert.match(calls[0]!, /\/api\/osrm/);
    assert.match(calls[1]!, /\/api\/osrm/);
    assert.doesNotMatch(calls.join("\n"), /\/api\/route/);
    assert.match(calls[0]!, /from=-119\.8(%2C|,)39\.5/);
    assert.match(calls[0]!, /to=-116\.2(%2C|,)43\.6/);
    assert.match(calls[1]!, /from=-116\.2(%2C|,)43\.6/);
    assert.match(calls[1]!, /to=-122\.3(%2C|,)47\.6/);
    assert.equal(data.miles, 857.6);
    assert.equal(data.driveHours, 15);
    assert.equal(data.driveMinutes, 38);
  } finally {
    globalThis.fetch = prev;
  }
});

test("fetchNavigateRoute: locked via hop still uses /api?mode=rv_safe", async () => {
  const via = { lng: -116.2, lat: 43.6 };
  const calls: string[] = [];
  const prev = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input);
    calls.push(url);
    return new Response(
      JSON.stringify(
        stubRoute({
          source: "osrm",
          routingMode: "rv_safe",
          fallbackFrom: "here",
          miles: 100,
          driveHours: 2,
          driveMinutes: 0,
          distanceM: 160_934,
          durationS: 7_200,
        }),
      ),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;
  try {
    const data = await fetchNavigateRoute({
      from: FROM,
      to: TO,
      via: [via],
      coach: LOCKED,
    });
    assert.equal(calls.length, 2);
    assert.match(calls[0]!, /\/api\?/);
    assert.match(calls[1]!, /\/api\?/);
    assert.match(calls[0]!, /mode=rv_safe/);
    assert.doesNotMatch(calls.join("\n"), /\/api\/route/);
    assert.doesNotMatch(calls.join("\n"), /\/api\/osrm/);
    assert.equal(routeEngineLabel(data), "OSRM · car fallback");
    assert.equal(data.miles, 200);
  } finally {
    globalThis.fetch = prev;
  }
});

test("Navigate wires fetchNavigateRoute and honest engine labels", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /fetchNavigateRoute/);
  assert.match(ui, /routeEngineLabel/);
  assert.match(ui, /liveRouteStats/);
  assert.doesNotMatch(ui, /["']OSRM live["']/);
  assert.doesNotMatch(ui, /\/api\/route/);
});
