import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  DUMP_MAX_QUERY_CENTERS,
  OVERPASS_ENDPOINTS,
  buildDumpsQuery,
  chunkDumpCenters,
  curatedStopsOnCorridor,
  dedupDumps,
  dumpPinKind,
  dumpSourceLabel,
  dumpSourceNote,
  emptyDumpResult,
  finalizeDumps,
  mergeDumpStops,
  normalizeOverpassDumps,
  sampleDumpCenters,
  type DumpOverpassEl,
  type DumpStop,
} from "./corridorDumps.ts";
import { feeFromOsmTags } from "./dumpStations.ts";
import { resolveMapPoi } from "./mapPoi.ts";
import type { OsrmLngLat } from "./osrm.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO: OsrmLngLat = { lng: -119.8138, lat: 39.5296 };
const BOISE: OsrmLngLat = { lng: -116.2023, lat: 43.615 };
const SEATTLE: OsrmLngLat = { lng: -122.3321, lat: 47.6062 };
const CORRIDOR = [RENO, BOISE, SEATTLE];

function dump(
  partial: Partial<DumpStop> & Pick<DumpStop, "id" | "name">,
): DumpStop {
  return {
    lat: RENO.lat,
    lng: RENO.lng,
    kind: "dump",
    fee: "unknown",
    feeLabel: "Fee unknown",
    city: "",
    state: "",
    address: "",
    milesOff: 0,
    progress: 0,
    nearDest: false,
    source: "overpass",
    ...partial,
  };
}

test("normalizeOverpassDumps maps fee tags and keeps unnamed dumps", () => {
  const els: DumpOverpassEl[] = [
    {
      type: "node",
      id: 1,
      lat: BOISE.lat,
      lon: BOISE.lng,
      tags: { amenity: "sanitary_dump_station", fee: "no", name: "Boise dump" },
    },
    {
      type: "node",
      id: 2,
      lat: BOISE.lat + 0.02,
      lon: BOISE.lng,
      tags: { amenity: "sanitary_dump_station", fee: "yes" },
    },
    {
      type: "node",
      id: 3,
      lat: BOISE.lat + 0.03,
      lon: BOISE.lng,
      tags: { amenity: "sanitary_dump_station" },
    },
    {
      type: "node",
      id: 99,
      lat: 0,
      lon: 0,
      tags: { amenity: "sanitary_dump_station", name: "Off corridor" },
    },
  ];
  const dumps = normalizeOverpassDumps(els, CORRIDOR, 15);
  assert.equal(dumps.length, 3);
  const free = dumps.find((d) => d.id.includes(":1"));
  const paid = dumps.find((d) => d.id.includes(":2"));
  const unknown = dumps.find((d) => d.id.includes(":3"));
  assert.equal(free?.fee, "free");
  assert.equal(paid?.fee, "paid");
  assert.equal(unknown?.fee, "unknown");
  assert.equal(paid?.name, "Sanitary dump station");
  assert.doesNotMatch(paid?.feeLabel || "", /\$|\d/);
  assert.equal(feeFromOsmTags({ fee: "customers" }), "unknown");
});

test("mergeDumpStops enriches unknown as known-free and never overrides paid", () => {
  const osmPaid = dump({
    id: "osm-paid",
    name: "Sanitary dump station",
    lat: 43.4731,
    lng: -116.0647,
    fee: "paid",
    feeLabel: "Paid",
  });
  const osmUnknown = dump({
    id: "osm-unk",
    name: "Sanitary dump station",
    lat: 43.4732,
    lng: -116.0648,
    fee: "unknown",
    feeLabel: "Fee unknown",
  });
  const curated = curatedStopsOnCorridor(
    [
      { lat: 43.47, lng: -116.07 },
      { lat: 43.48, lng: -116.06 },
    ],
    15,
  );
  assert.ok(curated.some((d) => d.id.includes("id-blacks-creek")));
  const paidMerged = mergeDumpStops([osmPaid], curated);
  const paidHit = paidMerged.find((d) => d.id === "osm-paid");
  assert.equal(paidHit?.fee, "paid");
  const unkMerged = mergeDumpStops([osmUnknown], curated);
  const unkHit = unkMerged.find((d) => d.id === "osm-unk");
  assert.equal(unkHit?.fee, "free");
  assert.equal(unkHit?.source, "curated");
});

test("dump pin kinds and labels stay color-honest", () => {
  assert.equal(dumpPinKind("free"), "dump-free");
  assert.equal(dumpPinKind("paid"), "dump-paid");
  assert.equal(dumpPinKind("unknown"), "dump-unknown");
  assert.equal(dumpSourceLabel("overpass"), "OpenStreetMap Overpass");
  assert.match(dumpSourceNote("overpass"), /Fee unknown/);
  assert.doesNotMatch(dumpSourceNote("overpass"), /\$\d/);
  assert.match(dumpSourceNote("curated"), /Overpass was unavailable/);
  assert.match(dumpSourceNote("curated"), /known-free/);
  assert.doesNotMatch(dumpSourceNote("curated"), /Sample pads/i);
  assert.doesNotMatch(dumpSourceNote("curated"), /\$\d/);
});

test("sampleDumpCenters covers a 1000+ mi corridor with enough Overpass centers", () => {
  const long: OsrmLngLat[] = [
    { lng: -122.2, lat: 47.98 },
    { lng: -102.2, lat: 44.6 },
  ];
  const pts = sampleDumpCenters(long);
  assert.ok(pts.length >= 10, `expected ≥10 centers, got ${pts.length}`);
  assert.ok(pts.length <= DUMP_MAX_QUERY_CENTERS);
  assert.ok(pts[0]!.lng < -121);
  assert.ok(pts[pts.length - 1]!.lng > -104);
  const batches = chunkDumpCenters(pts, 8);
  assert.ok(batches.length >= 2);
  assert.ok(batches.every((b) => b.length <= 8));
});

test("resolveMapPoi names the tapped pin — dump vs campground", () => {
  const rye = dump({
    id: "curated:wa-ryegrass",
    name: "Ryegrass Rest Area · I-90",
    city: "Vantage",
    state: "WA",
    fee: "free",
    feeLabel: "Free",
    source: "curated",
  });
  const dumpHit = resolveMapPoi({
    dumpStops: [rye],
    selectedDumpId: rye.id,
  });
  assert.equal(dumpHit?.typeLabel, "Dump");
  assert.equal(dumpHit?.name, rye.name);
  assert.match(dumpHit?.meta || "", /Vantage/);
  assert.match(dumpHit?.meta || "", /Free/);

  const campHit = resolveMapPoi({
    campStops: [
      {
        id: "camp-1",
        name: "Lakeside RV Park",
        lat: 47.97,
        lng: -122.2,
        kind: "rv-park",
        city: "Everett",
        state: "WA",
        address: "",
        milesOff: 2.5,
        progress: 0.05,
        nearDest: false,
        amenityHint: "",
      },
    ],
    selectedCampId: "camp-1",
  });
  assert.equal(campHit?.typeLabel, "RV park");
  assert.equal(campHit?.name, "Lakeside RV Park");
  assert.match(campHit?.meta || "", /Everett/);
  assert.equal(resolveMapPoi({}), null);
});

test("dedup / finalize prefer along-route and drop far dupes", () => {
  const a = dump({ id: "a", name: "A", lat: 43.6, lng: -116.2, progress: 0.4 });
  const b = dump({
    id: "b",
    name: "B",
    lat: 43.6002,
    lng: -116.2004,
    milesOff: 2,
    progress: 0.4,
  });
  assert.equal(dedupDumps([a, b]).length, 1);
  const many = Array.from({ length: 30 }, (_, i) =>
    dump({
      id: `d${i}`,
      name: `D${i}`,
      lat: 39.5 + i * 0.2,
      lng: -119.8 + i * 0.1,
      progress: i / 30,
      nearDest: i > 25,
    }),
  );
  const fin = finalizeDumps(many, 10);
  assert.ok(fin.length <= 10);
});

test("buildDumpsQuery stays on corridor params", () => {
  const qs = buildDumpsQuery({
    from: RENO,
    to: SEATTLE,
    via: [BOISE],
    path: [RENO, BOISE, SEATTLE],
    widthMi: 15,
  });
  assert.equal(qs.get("from"), `${RENO.lng},${RENO.lat}`);
  assert.equal(qs.get("to"), `${SEATTLE.lng},${SEATTLE.lat}`);
  assert.match(qs.get("via") || "", /116\.2023/);
  assert.match(qs.get("path") || "", /119\.8138/);
});

test("emptyDumpResult does not invent stations", () => {
  const r = emptyDumpResult("overpass", 15, "Overpass timed out");
  assert.equal(r.dumps.length, 0);
  assert.equal(r.sourceLabel, "OpenStreetMap Overpass");
  assert.equal(r.error, "Overpass timed out");
});

test("GET /api/dumps stays on Overpass — no HERE / Places / paid APIs", () => {
  const api = readFileSync(join(root, "../../routes/api/dumps.ts"), "utf8");
  const app = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const ui = readFileSync(
    join(root, "../../components/rvtrips/DumpsAlongRoute.tsx"),
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
  const dumpMap = readFileSync(
    join(root, "../../components/rvtrips/DumpMap.tsx"),
    "utf8",
  );
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.match(api, /createFileRoute\("\/api\/dumps"\)/);
  const lib = readFileSync(join(root, "corridorDumps.ts"), "utf8");
  assert.match(api, /overpass-api\.de/);
  assert.match(api, /sampleDumpCenters/);
  assert.match(api, /OVERPASS_ENDPOINTS/);
  assert.match(lib, /overpass-api\.de/);
  assert.match(lib, /overpass\.kumi\.systems/);
  assert.match(lib, /overpass\.osm\.ch/);
  assert.match(api, /amenity"="sanitary_dump_station/);
  assert.match(api, /never invents stations or prices/i);
  assert.match(api, /no HERE Places/);
  assert.doesNotMatch(api, /browse\.search\.hereapi\.com/);
  assert.doesNotMatch(api, /maps\.googleapis\.com|places\.googleapis\.com/i);
  assert.doesNotMatch(api, /marketcheck/i);
  assert.doesNotMatch(api, /\/api\/route/);
  assert.equal(OVERPASS_ENDPOINTS.length, 3);
  assert.match(app, /\/api\/dumps/);
  assert.match(app, /DumpsAlongRoute/);
  assert.match(app, /dumpStops=/);
  assert.match(app, /onRouteVia=\{routeViaPoi\}/);
  assert.match(app, /data-camp-sample-toggle/);
  assert.ok(
    app.indexOf("data-camp-sample-toggle") < app.indexOf("<DumpsAlongRoute"),
    "Sample pads belongs under camps, not dumps",
  );
  assert.ok(
    app.indexOf("Sample pads — not live") < app.indexOf("<DumpsAlongRoute"),
  );
  const dumpsBlock = app.slice(app.indexOf("<DumpsAlongRoute"));
  assert.doesNotMatch(dumpsBlock, /Sample pads/);
  assert.match(ui, /data-dumps-along-route/);
  assert.match(ui, /DumpFeeLegend/);
  assert.match(ui, /DUMPS ALONG ROUTE/);
  assert.doesNotMatch(ui, /Sample pads/);
  assert.match(map, /dumpStops/);
  assert.match(map, /data-map-poi-detail|MapPoiDetailChip/);
  assert.match(map, /RouteLayerLegend/);
  assert.match(map, /rv-map-dot-camp/);
  assert.match(map, /rv-map-dot-dump-free/);
  assert.match(gl, /dumpStops/);
  assert.match(gl, /MapPoiDetailChip/);
  assert.match(gl, /data-map-pin/);
  assert.match(gl, /rv-map-dot-camp/);
  assert.match(gl, /rv-map-dot-dump-free/);
  assert.match(dumpMap, /data-dump-legend/);
  assert.match(css, /\.rv-map-dot-camp\s*\{[^}]*sapphire/s);
  assert.match(css, /\.rv-map-dot-dump-free\s*\{[^}]*--color-green/s);
  assert.match(css, /\.rv-map-dot-camp\s*\{[^}]*border-radius: 3px/s);
  assert.doesNotMatch(api, /RATEAPI_MODE|rvData/);
});
