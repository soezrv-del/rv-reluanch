import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  hitFromMapboxReverse,
  hitsFromMapboxForward,
  isMapboxPublicToken,
  mapboxForwardUrl,
  mapboxPublicToken,
  mapboxRasterTemplate,
  mapboxReverseUrl,
  mapboxStyleUrl,
  readMapboxToken,
} from "./mapbox.ts";
import { mapboxCatalog } from "./basemap.ts";

const root = dirname(fileURLToPath(import.meta.url));

const PK = "pk.eyJ1IjoidGVzdCIsImEiOiJ0ZXN0In0.test";

test("readMapboxToken prefers MAPBOX_ACCESS_TOKEN over VITE_", () => {
  assert.equal(readMapboxToken({}), "");
  assert.equal(
    readMapboxToken({ VITE_MAPBOX_TOKEN: "pk.vite", MAPBOX_ACCESS_TOKEN: "pk.main" }),
    "pk.main",
  );
  assert.equal(readMapboxToken({ VITE_MAPBOX_TOKEN: " pk.vite " }), "pk.vite");
  assert.equal(isMapboxPublicToken("pk.abc"), true);
  assert.equal(isMapboxPublicToken("sk.abc"), false);
  assert.equal(isMapboxPublicToken(""), false);
  assert.equal(mapboxPublicToken({ MAPBOX_ACCESS_TOKEN: "sk.secret" }), "");
  assert.equal(mapboxPublicToken({ MAPBOX_ACCESS_TOKEN: PK }), PK);
});

test("mapbox catalog is GL-first and never a stock photo", () => {
  assert.equal(mapboxCatalog("sk.nope"), null);
  const cat = mapboxCatalog(PK);
  assert.ok(cat);
  assert.equal(cat.provider, "mapbox");
  assert.equal(cat.engine, "gl");
  assert.equal(cat.token, PK);
  assert.match(cat.tileTemplate, /api\.mapbox\.com\/styles\/v1\/mapbox\/streets-v12\/tiles/);
  assert.match(cat.tileTemplate, /access_token=/);
  assert.doesNotMatch(cat.note, /photo|glacier|stock/i);
  assert.match(cat.note, /HERE/);
  assert.equal(mapboxStyleUrl("streets"), "mapbox://styles/mapbox/streets-v12");
  assert.equal(
    mapboxStyleUrl("satellite"),
    "mapbox://styles/mapbox/satellite-streets-v12",
  );
  assert.match(mapboxRasterTemplate(PK, "satellite"), /satellite-streets-v12/);
});

test("Mapbox geocode URLs stay on api.mapbox.com — not Directions / /api/route", () => {
  const fwd = mapboxForwardUrl("Seattle, WA", PK);
  const rev = mapboxReverseUrl(-122.33, 47.6, PK);
  assert.match(fwd, /api\.mapbox\.com\/geocoding\/v5\/mapbox\.places\/Seattle/);
  assert.match(fwd, /autocomplete=true/);
  assert.match(fwd, /country=us%2Cca/);
  assert.doesNotMatch(fwd, /directions|\/api\/route/);
  assert.match(rev, /mapbox\.places\/-122\.33,47\.6/);
  assert.doesNotMatch(rev, /directions|\/api\/route/);
});

test("hitsFromMapboxForward maps place_name + center", () => {
  const hits = hitsFromMapboxForward(
    {
      features: [
        {
          place_name: "Seattle, Washington, United States",
          center: [-122.3321, 47.6062],
          place_type: ["place"],
        },
        { place_name: "broken", center: ["x", "y"] },
      ],
    },
    "Seattle",
  );
  assert.equal(hits.length, 1);
  assert.equal(hits[0]!.label, "Seattle, Washington, United States");
  assert.equal(hits[0]!.lat, 47.6062);
  assert.equal(hits[0]!.lng, -122.3321);
  assert.equal(hitsFromMapboxForward({}, "x").length, 0);
  const rev = hitFromMapboxReverse(
    {
      features: [
        {
          place_name: "Pine St, Seattle",
          center: [-122.33, 47.61],
          place_type: ["address"],
        },
      ],
    },
    47.6,
    -122.3,
  );
  assert.ok(rev);
  assert.equal(rev.kind, "current");
  assert.equal(rev.label, "Pine St, Seattle");
});

test("Trips wires Mapbox as visual layer; truck routing stays HERE", () => {
  const map = readFileSync(
    join(root, "../../components/rvtrips/RouteBasemap.tsx"),
    "utf8",
  );
  const gl = readFileSync(
    join(root, "../../components/rvtrips/RouteMapboxGl.tsx"),
    "utf8",
  );
  const tiles = readFileSync(join(root, "../../routes/api/map-tiles.ts"), "utf8");
  const geo = readFileSync(join(root, "../../routes/api/geocode.ts"), "utf8");
  const nav = readFileSync(join(root, "navigateRoute.ts"), "utf8");
  const here = readFileSync(join(root, "hereRouting.ts"), "utf8");
  const env = readFileSync(join(root, "../../../.env.example"), "utf8");

  assert.match(map, /RouteMapboxGl/);
  assert.match(map, /glFailed/);
  assert.match(gl, /mapbox-gl/);
  assert.match(gl, /data-map-engine="mapbox-gl"/);
  assert.match(gl, /data-follow-puck/);
  assert.match(gl, /shouldRecenterFollow/);
  assert.doesNotMatch(gl, /\/api\/route/);
  assert.doesNotMatch(gl, /leaflet/i);
  assert.match(tiles, /mapboxCatalog/);
  assert.match(tiles, /mapboxPublicToken/);
  assert.match(geo, /mapboxForwardUrl/);
  assert.match(geo, /Nominatim/);
  assert.doesNotMatch(nav, /mapbox/i);
  assert.doesNotMatch(here, /mapbox/i);
  assert.match(env, /MAPBOX_ACCESS_TOKEN=/);
  assert.match(env, /VITE_MAPBOX_TOKEN=/);
  assert.match(env, /YOUTUBE_API_KEY/);
  assert.match(env, /Vercel Production \+ Preview/);
  assert.doesNotMatch(env, /browser login|sign in to Mapbox/i);
});
