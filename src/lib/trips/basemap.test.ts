import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type { OsrmLineString } from "./osrm.ts";
import {
  attributionFor,
  bboxFromGeometry,
  bboxFromPoints,
  catalogAfterHereProbe,
  downsampleCoords,
  enumerateTiles,
  fillTileTemplate,
  fitTileView,
  geometryToOverlayPath,
  HERE_PROXY_TEMPLATE,
  hereCatalog,
  hereRasterV2Url,
  hereRasterV3Url,
  isValidTile,
  MAP_PROBE_PATH,
  MAX_TILES,
  mergeBboxes,
  nextProviderAfterTileFail,
  OSM_TILE_TEMPLATE,
  osmCatalog,
  parseTileCoord,
  pointToPixel,
  projectMercator,
} from "./basemap.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO = { lat: 39.5296, lng: -119.8138 };
const SEATTLE = { lat: 47.6062, lng: -122.3321 };
const BOISE = { lat: 43.615, lng: -116.2023 };

const RENO_SEA: OsrmLineString = {
  type: "LineString",
  coordinates: [
    [RENO.lng, RENO.lat],
    [BOISE.lng, BOISE.lat],
    [SEATTLE.lng, SEATTLE.lat],
  ],
};

test("projectMercator puts west/north toward smaller x / smaller y", () => {
  const reno = projectMercator(RENO.lat, RENO.lng, 5);
  const seattle = projectMercator(SEATTLE.lat, SEATTLE.lng, 5);
  assert.ok(seattle.x < reno.x, "Seattle is west of Reno");
  assert.ok(seattle.y < reno.y, "Seattle is north of Reno");
});

test("fitTileView frames Reno→Seattle without exploding tile count", () => {
  const box = bboxFromGeometry(RENO_SEA);
  assert.ok(box);
  const view = fitTileView(box, 360, 240);
  assert.ok(view);
  assert.ok(view.z >= 3 && view.z <= 8);
  const tiles = enumerateTiles(view);
  assert.ok(tiles.length >= 1);
  assert.ok(tiles.length <= MAX_TILES);
});

test("geometryToOverlayPath uses the same LineString as miles/time", () => {
  const box = bboxFromGeometry(RENO_SEA);
  assert.ok(box);
  const view = fitTileView(box, 320, 220);
  assert.ok(view);
  const d = geometryToOverlayPath(RENO_SEA, view);
  assert.ok(d);
  assert.match(d, /^M/);
  assert.match(d, / L/);
  const first = pointToPixel(RENO.lat, RENO.lng, view);
  assert.match(d, new RegExp(`^M${first.left.toFixed(1)} ${first.top.toFixed(1)}`));
  assert.equal(geometryToOverlayPath(null, view), null);
  assert.equal(
    geometryToOverlayPath({ type: "LineString", coordinates: [] }, view),
    null,
  );
});

test("multi-stop bbox includes the via", () => {
  const geo = bboxFromGeometry(RENO_SEA);
  const pins = bboxFromPoints([RENO, BOISE, SEATTLE]);
  const box = mergeBboxes(geo, pins);
  assert.ok(box);
  assert.ok(box.minLng <= BOISE.lng && box.maxLng >= BOISE.lng);
  assert.ok(box.minLat <= BOISE.lat && box.maxLat >= BOISE.lat);
});

test("downsampleCoords keeps ends on a long polyline", () => {
  const dense: [number, number][] = [];
  for (let i = 0; i <= 400; i++) {
    dense.push([-119.8 + i * 0.01, 39.5 + i * 0.02]);
  }
  const slim = downsampleCoords(dense, 20);
  assert.equal(slim.length, 20);
  assert.deepEqual(slim[0], dense[0]);
  assert.deepEqual(slim[19], dense[400]);
});

test("tile templates stay on live hosts — never /api/route", () => {
  assert.equal(
    fillTileTemplate(OSM_TILE_TEMPLATE, 4, 2, 6),
    "https://tile.openstreetmap.org/4/2/6.png",
  );
  assert.equal(
    fillTileTemplate(HERE_PROXY_TEMPLATE, 4, 2, 6),
    "/api/map-tiles?z=4&x=2&y=6",
  );
  assert.equal(MAP_PROBE_PATH, "/api/map-tiles");
  assert.doesNotMatch(HERE_PROXY_TEMPLATE, /\/api\/route/);
  assert.doesNotMatch(OSM_TILE_TEMPLATE, /\/api\/route/);
});

test("HERE raster URLs use map hosts, not router.hereapi.com", () => {
  const v3 = hereRasterV3Url(4, 2, 6, "test-key");
  const v2 = hereRasterV2Url(4, 2, 6, "test-key");
  assert.match(v3, /maps\.hereapi\.com\/v3\/base\/mc\/4\/2\/6\/png/);
  assert.match(v3, /apiKey=test-key/);
  assert.match(v2, /base\.maps\.ls\.hereapi\.com\/maptile\/2\.1/);
  assert.doesNotMatch(v3, /router\.hereapi\.com/);
  assert.doesNotMatch(v2, /\/api\/route/);
});

test("isValidTile rejects out-of-range coords", () => {
  assert.equal(isValidTile(4, 2, 6), true);
  assert.equal(isValidTile(4, 16, 6), false);
  assert.equal(isValidTile(16, 0, 0), false);
  assert.equal(isValidTile(-1, 0, 0), false);
  assert.equal(parseTileCoord("6", 15), 6);
  assert.equal(parseTileCoord("16", 15), null);
  assert.equal(parseTileCoord("x", 15), null);
});

test("HERE probe failure is honest OSM — never a fake photo", () => {
  const ok = catalogAfterHereProbe(true);
  assert.equal(ok.provider, "here");
  assert.equal(ok.tileTemplate, HERE_PROXY_TEMPLATE);
  const miss = catalogAfterHereProbe(false, "HTTP 403");
  assert.equal(miss.provider, "osm");
  assert.match(miss.note, /OpenStreetMap/);
  assert.match(miss.note, /403/);
  assert.doesNotMatch(miss.note, /photo|glacier|stock/i);
  assert.equal(osmCatalog().provider, "osm");
  assert.equal(hereCatalog().provider, "here");
});

test("tile fail steps HERE → OSM → SVG-only", () => {
  assert.equal(nextProviderAfterTileFail("here"), "osm");
  assert.equal(nextProviderAfterTileFail("osm"), "svg");
  assert.equal(nextProviderAfterTileFail("svg"), "svg");
  assert.equal(attributionFor("here"), "© HERE");
  assert.equal(attributionFor("osm"), "© OpenStreetMap");
  assert.match(attributionFor("svg"), /tiles unavailable/);
});

test("Navigate wires RouteBasemap and never /api/route or stock map photo", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const map = readFileSync(
    join(root, "../../components/rvtrips/RouteBasemap.tsx"),
    "utf8",
  );
  const api = readFileSync(
    join(root, "../../routes/api/map-tiles.ts"),
    "utf8",
  );
  assert.match(ui, /RouteBasemap/);
  assert.match(ui, /fetchNavigateRoute/);
  assert.doesNotMatch(ui, /["'`]\/api\/route/);
  assert.doesNotMatch(ui, /RouteLinePreview/);
  assert.doesNotMatch(ui, /RVTRIPS_MAP_PANEL/);
  assert.match(map, /data-route-basemap/);
  assert.match(map, /data-tile-source/);
  assert.match(map, /geometryToOverlayPath/);
  assert.doesNotMatch(map, /RVTRIPS_MAP_PANEL/);
  assert.doesNotMatch(map, /leaflet|maplibre|mapbox/i);
  assert.match(api, /createFileRoute\("\/api\/map-tiles"\)/);
  assert.match(api, /hereRasterV3Url/);
  assert.doesNotMatch(api, /["'`]\/api\/route/);
  assert.doesNotMatch(api, /from ["']@\/lib\/rv\/|RATEAPI_API_KEY|rvData\.live/);
});
