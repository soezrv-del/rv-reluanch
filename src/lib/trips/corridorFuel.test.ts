import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  buildFuelQuery,
  classifyFuelKind,
  clampCorridorWidthMi,
  effectiveCorridorWidthMi,
  dedupFuelStops,
  downsampleByDistance,
  emptyFuelResult,
  encodePathParam,
  finalizeFuelStops,
  haversineMiles,
  HERE_FUEL_CATEGORIES,
  HERE_TRUCK_STOP_CATEGORY,
  looksLikeTruckStop,
  milesToPolyline,
  normalizeHereItems,
  normalizeOverpassElements,
  parsePathParam,
  resolveCorridor,
  sampleCorridorPoints,
  sortAlongCorridor,
  sourceLabel,
  sourceNote,
  type FuelOverpassEl,
  type FuelStop,
} from "./corridorFuel.ts";
import type { OsrmLngLat } from "./osrm.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO: OsrmLngLat = { lng: -119.8138, lat: 39.5296 };
const BOISE: OsrmLngLat = { lng: -116.2023, lat: 43.615 };
const SEATTLE: OsrmLngLat = { lng: -122.3321, lat: 47.6062 };

function stop(partial: Partial<FuelStop> & Pick<FuelStop, "id" | "name">): FuelStop {
  return {
    lat: RENO.lat,
    lng: RENO.lng,
    kind: "fuel",
    city: "",
    state: "",
    address: "",
    milesOff: 0,
    progress: 0,
    brand: "",
    ...partial,
  };
}

test("parse/encode path stays lng,lat and drops junk", () => {
  const raw = encodePathParam([RENO, BOISE, SEATTLE]);
  assert.match(raw, /^-119\.8138,39\.5296/);
  assert.equal(parsePathParam(raw).length, 3);
  assert.equal(parsePathParam("nope|1,2,3").length, 0);
  assert.equal(parsePathParam("39.53,-119.81").length, 1); // lat,lng tolerated
});

test("sampleCorridorPoints spaces Reno→Boise→Seattle — not world-wide", () => {
  const pts = sampleCorridorPoints([RENO, BOISE, SEATTLE], {
    targetSpacingMiles: 80,
    maxPoints: 6,
    minPoints: 2,
  });
  assert.ok(pts.length >= 3 && pts.length <= 6);
  assert.ok(haversineMiles(pts[0]!, RENO) < 5);
  assert.ok(haversineMiles(pts[pts.length - 1]!, SEATTLE) < 5);
  for (const p of pts) {
    assert.ok(p.lat > 38 && p.lat < 49);
    assert.ok(p.lng > -124 && p.lng < -114);
  }
});

test("downsampleByDistance keeps ends on a long polyline", () => {
  const dense: OsrmLngLat[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    dense.push({
      lng: RENO.lng + (SEATTLE.lng - RENO.lng) * t,
      lat: RENO.lat + (SEATTLE.lat - RENO.lat) * t,
    });
  }
  const slim = downsampleByDistance(dense, 8);
  assert.equal(slim.length, 8);
  assert.ok(haversineMiles(slim[0]!, RENO) < 1);
  assert.ok(haversineMiles(slim[7]!, SEATTLE) < 1);
});

test("milesToPolyline: on-corridor ~0, far point is dropped", () => {
  const corridor = [RENO, BOISE, SEATTLE];
  const on = milesToPolyline(BOISE, corridor);
  assert.ok(on.milesOff < 1);
  assert.ok(on.progress > 0.2 && on.progress < 0.8);

  const miami = milesToPolyline({ lat: 25.76, lng: -80.19 }, corridor);
  assert.ok(miami.milesOff > 100);
});

test("normalizeHereItems keeps corridor truck stops, drops far / nameless", () => {
  const items = [
    {
      id: "here:pilot-boise",
      title: "Pilot Travel Center",
      position: { lat: 43.58, lng: -116.18 },
      address: { city: "Boise", stateCode: "ID", label: "Pilot, Boise, ID" },
      categories: [{ id: HERE_TRUCK_STOP_CATEGORY, primary: true }],
    },
    {
      id: "here:miami",
      title: "Shell",
      position: { lat: 25.76, lng: -80.19 },
      address: { city: "Miami", stateCode: "FL" },
      categories: [{ id: "700-7600-0000" }],
    },
    {
      id: "here:noname",
      title: "",
      position: { lat: 43.6, lng: -116.2 },
    },
  ];
  const stops = normalizeHereItems(items, [RENO, BOISE, SEATTLE], 8);
  assert.equal(stops.length, 1);
  assert.equal(stops[0]!.kind, "truck-stop");
  assert.equal(stops[0]!.name, "Pilot Travel Center");
});

test("normalizeOverpassElements requires a name and corridor filter", () => {
  const els: FuelOverpassEl[] = [
    {
      type: "node",
      id: 1,
      lat: 43.59,
      lon: -116.21,
      tags: { amenity: "fuel", name: "Love's Travel Stop", hgv: "yes" },
    },
    {
      type: "node",
      id: 2,
      lat: 43.6,
      lon: -116.2,
      tags: { amenity: "fuel" },
    },
    {
      type: "node",
      id: 3,
      lat: 34.05,
      lon: -118.24,
      tags: { amenity: "fuel", name: "LA Station" },
    },
  ];
  const stops = normalizeOverpassElements(els, [RENO, BOISE, SEATTLE], 8);
  assert.equal(stops.length, 1);
  assert.equal(stops[0]!.kind, "truck-stop");
  assert.equal(stops[0]!.name, "Love's Travel Stop");
});

test("dedup + rank: truck stops first, then along-route, no dupes", () => {
  const stops = finalizeFuelStops([
    stop({
      id: "a",
      name: "Shell",
      kind: "fuel",
      progress: 0.1,
      milesOff: 1,
      lat: 40,
      lng: -119,
    }),
    stop({
      id: "b",
      name: "Pilot",
      kind: "truck-stop",
      progress: 0.5,
      milesOff: 2,
      lat: 43,
      lng: -116,
    }),
    stop({
      id: "c",
      name: "Shell",
      kind: "fuel",
      progress: 0.1,
      milesOff: 0.4,
      lat: 40.0004,
      lng: -119.0003,
    }),
  ]);
  assert.equal(stops.length, 2);
  assert.equal(stops[0]!.kind, "truck-stop");
  assert.equal(stops[1]!.name, "Shell");
  assert.equal(stops[1]!.milesOff, 0.4);
});

test("classifyFuelKind is honest — random gas is fuel, not truck", () => {
  assert.equal(classifyFuelKind({ name: "Chevron" }), "fuel");
  assert.equal(classifyFuelKind({ name: "Flying J Travel Center" }), "truck-stop");
  assert.equal(
    classifyFuelKind({ name: "Shell", categories: [HERE_TRUCK_STOP_CATEGORY] }),
    "truck-stop",
  );
  assert.equal(looksLikeTruckStop({ name: "City Pump" }), false);
  assert.equal(
    classifyFuelKind({ name: "ARCO (Marathon Petroleum)" }),
    "fuel",
  );
});

test("emptyFuelResult never invents stations", () => {
  const r = emptyFuelResult("overpass", 8, "Overpass timed out");
  assert.equal(r.stops.length, 0);
  assert.equal(r.sourceLabel, "OpenStreetMap Overpass");
  assert.match(r.sourceNote, /not a live pump inventory/i);
  assert.equal(r.error, "Overpass timed out");
});

test("source labels stay honest", () => {
  assert.equal(sourceLabel("here"), "HERE Places");
  assert.equal(sourceLabel("overpass"), "OpenStreetMap Overpass");
  assert.match(sourceNote("here"), /HERE Places/);
  assert.doesNotMatch(sourceNote("here"), /DEMO/i);
});

test("clampCorridorWidthMi and resolveCorridor", () => {
  assert.equal(clampCorridorWidthMi(1), 3);
  assert.equal(clampCorridorWidthMi(99), 15);
  assert.equal(clampCorridorWidthMi("nope"), 8);
  assert.equal(effectiveCorridorWidthMi(8, 3), 12);
  assert.equal(effectiveCorridorWidthMi(8, 24), 8);
  assert.deepEqual(resolveCorridor({ from: RENO, to: SEATTLE, via: [BOISE] }), [
    RENO,
    BOISE,
    SEATTLE,
  ]);
  assert.equal(resolveCorridor({ from: null, to: SEATTLE }), null);
});

test("buildFuelQuery uses /api/fuel shape, not /api/route", () => {
  const qs = buildFuelQuery({
    from: RENO,
    to: SEATTLE,
    via: [BOISE],
    path: [RENO, BOISE, SEATTLE],
  });
  assert.equal(qs.get("from"), `${RENO.lng},${RENO.lat}`);
  assert.equal(qs.get("to"), `${SEATTLE.lng},${SEATTLE.lat}`);
  assert.match(qs.get("via") || "", /116\.2023/);
  assert.match(qs.get("path") || "", /119\.8138/);
});

test("dedupFuelStops collapses near-identical names", () => {
  const a = stop({ id: "1", name: "Pilot", lat: 43.6, lng: -116.2 });
  const b = stop({ id: "2", name: "Pilot", lat: 43.6002, lng: -116.2004, milesOff: 2 });
  assert.equal(dedupFuelStops([a, b]).length, 1);
});

test("sortAlongCorridor orders Reno then Boise then Seattle", () => {
  const ordered = sortAlongCorridor([SEATTLE, RENO, BOISE], [RENO, BOISE, SEATTLE]);
  assert.deepEqual(
    ordered.map((p) => p.lat),
    [RENO.lat, BOISE.lat, SEATTLE.lat],
  );
});

test("fuel helpers do not invent a station catalog", () => {
  const src = readFileSync(join(root, "corridorFuel.ts"), "utf8");
  assert.doesNotMatch(src, /DEMO_FUEL|FAKE_STATION|invented/i);
  assert.match(src, /Never invents stations/);
});

test("GET /api/fuel stays on HERE/Overpass and never /api/route", () => {
  const api = readFileSync(join(root, "../../routes/api/fuel.ts"), "utf8");
  const app = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(api, /createFileRoute\("\/api\/fuel"\)/);
  assert.match(api, /browse\.search\.hereapi\.com/);
  assert.match(api, /overpass-api\.de/);
  assert.match(api, /never invents stations/i);
  assert.doesNotMatch(api, /\/api\/route/);
  assert.match(app, /\/api\/fuel/);
  assert.doesNotMatch(app, /\/api\/route/);
  assert.doesNotMatch(api, /RATEAPI_MODE|rvData/);
});
