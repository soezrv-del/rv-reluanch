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
  isStandardStyle,
  mapboxStandardConfig,
  mapboxStyleUrl,
  readMapboxToken,
  ROUTE_CASING_COLOR,
  ROUTE_LINE_COLOR,
  routeLineStyle,
  standardLightPreset,
} from "./mapbox.ts";
import { mapboxCatalog } from "./basemap.ts";
import {
  POI_OVERVIEW_MAX_ZOOM,
  poiOverview,
  poiThinsAtOverview,
} from "./mapPoi.ts";

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
  assert.equal(mapboxStyleUrl("streets"), "mapbox://styles/mapbox/standard");
  assert.equal(cat.style, "mapbox://styles/mapbox/standard");
  assert.equal(
    mapboxStyleUrl("satellite"),
    "mapbox://styles/mapbox/satellite-streets-v12",
  );
  assert.match(mapboxRasterTemplate(PK, "satellite"), /satellite-streets-v12/);
});

test("GL streets is Mapbox Standard; raster + satellite stay classic", () => {
  assert.equal(isStandardStyle("streets"), true);
  assert.equal(isStandardStyle("satellite"), false);
  // Static Tiles API cannot render Standard — raster fallback stays streets-v12.
  assert.match(mapboxRasterTemplate(PK), /styles\/v1\/mapbox\/streets-v12\/tiles/);
  assert.doesNotMatch(mapboxRasterTemplate(PK), /standard/);
  assert.equal(standardLightPreset("light"), "day");
  assert.equal(standardLightPreset("dark"), "night");
  const light = mapboxStandardConfig("light");
  const dark = mapboxStandardConfig("dark");
  assert.equal(light.lightPreset, "day");
  assert.equal(dark.lightPreset, "night");
  assert.equal(light.showPointOfInterestLabels, false);
  // Indoor airport tiles are billed separately — must stay off.
  assert.equal(light.showIndoor, false);
  assert.equal(dark.showIndoor, false);
});

test("Standard route layers sit in the top slot and re-add on style.load", () => {
  const gl = readFileSync(
    join(root, "../../components/rvtrips/RouteMapboxGl.tsx"),
    "utf8",
  );
  assert.match(gl, /slot: "top"/);
  assert.match(gl, /line-emissive-strength/);
  assert.match(gl, /map\.on\("style\.load"/);
  assert.match(gl, /setConfigProperty\("basemap", "lightPreset"/);
  assert.match(gl, /subscribeTheme/);
  assert.doesNotMatch(gl, /showIndoor:\s*true/);
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
  assert.match(geo, /GEOCODE_UPSTREAM_MS/);
  assert.match(geo, /const GEOCODE_UPSTREAM_MS = 4000/);
  assert.doesNotMatch(nav, /mapbox/i);
  assert.doesNotMatch(here, /mapbox/i);
  assert.match(env, /MAPBOX_ACCESS_TOKEN=/);
  assert.match(env, /VITE_MAPBOX_TOKEN=/);
  assert.match(env, /YOUTUBE_API_KEY/);
  assert.match(env, /Vercel Production \+ Preview/);
  assert.doesNotMatch(env, /browser login|sign in to Mapbox/i);
});

test("Trips header chrome sits above the Mapbox canvas", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const gl = readFileSync(
    join(root, "../../components/rvtrips/RouteMapboxGl.tsx"),
    "utf8",
  );
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.match(ui, /data-trips-chrome/);
  assert.match(ui, /setTool\("dumps"\)/);
  assert.match(ui, /aria-label="Edit trip"/);
  assert.match(gl, /isolate/);
  assert.match(gl, /data-mapbox-canvas-host/);
  assert.match(css, /\[data-trips-chrome\]/);
  assert.match(css, /z-index:\s*40/);
  assert.match(css, /clip-path:\s*inset\(0\)/);
  assert.match(css, /\[data-route-basemap\]/);
});

test("route line is soft blue on a white casing in both themes — never aqua", () => {
  const light = routeLineStyle("light");
  const dark = routeLineStyle("dark");
  assert.equal(light.lineColor, "#3e6ae1");
  assert.equal(ROUTE_CASING_COLOR, "#ffffff");
  assert.equal(light.casingColor, "#ffffff");
  assert.equal(dark.casingColor, "#ffffff");
  assert.equal(light.casingOpacity, 1);
  for (const c of Object.values(ROUTE_LINE_COLOR)) {
    assert.doesNotMatch(c, /#0?0?ff?ff|aqua|cyan|#4a86f0/i);
  }
  assert.equal(light.lineWidth[0], "interpolate");
  assert.equal(light.casingWidth[0], "interpolate");
  const gl = readFileSync(
    join(root, "../../components/rvtrips/RouteMapboxGl.tsx"),
    "utf8",
  );
  assert.match(gl, /routeLineStyle\(theme\)/);
  assert.match(gl, /recolorRoute\(map, theme\)/);
  assert.doesNotMatch(gl, /#0b1a28|#4a86f0/);
});

test("camp / dump / fuel dots thin out below zoom 7; A / B / via pins never do", () => {
  assert.equal(POI_OVERVIEW_MAX_ZOOM, 7);
  assert.equal(poiOverview(4.2), true);
  assert.equal(poiOverview(6.99), true);
  assert.equal(poiOverview(7), false);
  assert.equal(poiOverview(11), false);
  assert.equal(poiOverview(null), false);
  assert.equal(poiOverview(Number.NaN), false);
  for (const k of ["campground", "rv-park", "dump-free", "dump-paid", "dump-unknown", "fuel", "truck-stop"]) {
    assert.equal(poiThinsAtOverview(k), true, k);
  }
  for (const k of ["origin", "dest", "via"]) {
    assert.equal(poiThinsAtOverview(k), false, k);
  }
  const gl = readFileSync(
    join(root, "../../components/rvtrips/RouteMapboxGl.tsx"),
    "utf8",
  );
  const raster = readFileSync(
    join(root, "../../components/rvtrips/RouteBasemap.tsx"),
    "utf8",
  );
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.match(gl, /data-poi-thin/);
  assert.match(gl, /data-map-overview/);
  assert.match(gl, /map\.on\("zoomend"/);
  assert.match(raster, /poiOverview\(view\?\.z\)/);
  assert.match(raster, /overview && !on && poiThinsAtOverview/);
  assert.match(
    css,
    /\[data-map-overview="1"\] \[data-poi-thin\]:not\(\.rv-map-dot-on\)/,
  );
});

test("map POI dots have no native button frame and the key sits below the map", () => {
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  const dot = css.slice(css.indexOf(".rv-map-dot {"), css.indexOf("}", css.indexOf(".rv-map-dot {")));
  for (const rule of [
    /appearance: none/,
    /-webkit-appearance: none/,
    /padding: 0/,
    /margin: 0/,
    /line-height: 0/,
    /font-size: 0/,
    /display: block/,
    /box-sizing: border-box/,
  ]) {
    assert.match(dot, rule);
  }
  // The light-mode global button reset must skip the map and Trips-owned controls.
  const reset = css.slice(
    css.indexOf('html[data-theme="light"] .app-shell button:not(.showroom-brand)'),
  );
  const resetSel = reset.slice(0, reset.indexOf("{"));
  assert.match(resetSel, /:not\(\[data-route-basemap\] \*\)/);
  assert.match(resetSel, /:not\(\[data-trip-btn\]\)/);
  const premium = css.slice(css.indexOf("/* Premium rows that are buttons sit above the card. */"));
  const premiumSel = premium.slice(0, premium.indexOf("{"));
  assert.match(premiumSel, /:not\(\[data-trip-btn\]\):not\(\[data-route-basemap\] \*\)/);
  for (const file of ["RouteMapboxGl.tsx", "RouteBasemap.tsx"]) {
    const src = readFileSync(join(root, `../../components/rvtrips/${file}`), "utf8");
    const mapEnd = src.lastIndexOf("</div>\n      {showCamps || showDumps");
    assert.ok(mapEnd > 0, `${file}: legend renders after the map frame closes`);
    assert.doesNotMatch(src, /bg-black\/55 px-2 py-1/);
  }
});

test("light mode primary is graphite; dark keeps sapphire", () => {
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  const light = css.slice(css.indexOf('html[data-theme="light"] [data-route-results] {'));
  assert.match(light.slice(0, light.indexOf("}")), /--trip-primary-bg: #171a20/);
  const base = css.slice(css.indexOf("[data-route-results] {\n  --trip-fg"));
  assert.match(base.slice(0, base.indexOf("}")), /--trip-primary-bg: #1648c8/);
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const tbt = ui.slice(ui.indexOf("data-start-tbt") - 600, ui.indexOf("Start Turn-by-Turn"));
  assert.match(tbt, /rv-trip-primary/);
  assert.doesNotMatch(tbt, /bg-blue text-white shadow/);
});
