import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  amenityHintFromTags,
  buildCampsQuery,
  campSourceLabel,
  campSourceNote,
  classifyCampKind,
  dedupCamps,
  emptyCampResult,
  finalizeCamps,
  HERE_CAMP_CATEGORIES,
  HERE_CAMPGROUND_CATEGORY,
  HERE_RV_PARK_CATEGORY,
  keepCampPoi,
  looksLikeRvPark,
  normalizeHereCamps,
  normalizeOverpassCamps,
  type CampOverpassEl,
  type CampStop,
} from "./corridorCamps.ts";
import { haversineMiles } from "./corridorFuel.ts";
import type { OsrmLngLat } from "./osrm.ts";

const root = dirname(fileURLToPath(import.meta.url));

const RENO: OsrmLngLat = { lng: -119.8138, lat: 39.5296 };
const BOISE: OsrmLngLat = { lng: -116.2023, lat: 43.615 };
const SEATTLE: OsrmLngLat = { lng: -122.3321, lat: 47.6062 };
const CORRIDOR = [RENO, BOISE, SEATTLE];

function camp(
  partial: Partial<CampStop> & Pick<CampStop, "id" | "name">,
): CampStop {
  return {
    lat: RENO.lat,
    lng: RENO.lng,
    kind: "campground",
    city: "",
    state: "",
    address: "",
    milesOff: 0,
    progress: 0,
    nearDest: false,
    amenityHint: "",
    ...partial,
  };
}

test("HERE camp categories are official camping / RV park IDs", () => {
  assert.equal(HERE_CAMPGROUND_CATEGORY, "500-5100-0056");
  assert.equal(HERE_RV_PARK_CATEGORY, "900-9200-0220");
  assert.match(HERE_CAMP_CATEGORIES, /500-5100-0056/);
  assert.match(HERE_CAMP_CATEGORIES, /900-9200-0220/);
});

test("keepCampPoi: corridor Boise stays, Miami drops, dest-area Seattle stays", () => {
  const on = keepCampPoi(BOISE, CORRIDOR, 15);
  assert.ok(on);
  assert.ok(on.milesOff < 1);

  const miami = keepCampPoi({ lat: 25.76, lng: -80.19 }, CORRIDOR, 15);
  assert.equal(miami, null);

  const nearSeattle = keepCampPoi(
    { lat: 47.55, lng: -122.25 },
    CORRIDOR,
    8,
  );
  assert.ok(nearSeattle);
  assert.equal(nearSeattle.nearDest, true);
  assert.ok(haversineMiles({ lat: 47.55, lng: -122.25 }, SEATTLE) < 18);
});

test("normalizeHereCamps keeps corridor RV parks, drops far / nameless", () => {
  const items = [
    {
      id: "here:koa-boise",
      title: "Boise KOA Journey",
      position: { lat: 43.58, lng: -116.18 },
      address: { city: "Boise", stateCode: "ID", label: "KOA, Boise, ID" },
      categories: [{ id: HERE_RV_PARK_CATEGORY, primary: true }],
    },
    {
      id: "here:miami",
      title: "Miami Beach Camp",
      position: { lat: 25.76, lng: -80.19 },
      address: { city: "Miami", stateCode: "FL" },
      categories: [{ id: HERE_CAMPGROUND_CATEGORY }],
    },
    {
      id: "here:noname",
      title: "",
      position: { lat: 43.6, lng: -116.2 },
    },
  ];
  const camps = normalizeHereCamps(items, CORRIDOR, 15);
  assert.equal(camps.length, 1);
  assert.equal(camps[0]!.kind, "rv-park");
  assert.equal(camps[0]!.name, "Boise KOA Journey");
});

test("normalizeOverpassCamps requires a name and corridor / dest filter", () => {
  const els: CampOverpassEl[] = [
    {
      type: "node",
      id: 1,
      lat: 43.59,
      lon: -116.21,
      tags: {
        tourism: "caravan_site",
        name: "Fiesta RV Park",
        sanitary_dump_station: "yes",
      },
    },
    {
      type: "node",
      id: 2,
      lat: 43.6,
      lon: -116.2,
      tags: { tourism: "camp_site" },
    },
    {
      type: "node",
      id: 3,
      lat: 34.05,
      lon: -118.24,
      tags: { tourism: "camp_site", name: "LA Tent City" },
    },
    {
      type: "node",
      id: 4,
      lat: 47.62,
      lon: -122.35,
      tags: { tourism: "camp_site", name: "Golden Gardens Camp" },
    },
  ];
  const camps = normalizeOverpassCamps(els, CORRIDOR, 15);
  assert.equal(camps.length, 2);
  assert.equal(camps[0]!.kind, "rv-park");
  assert.equal(camps[0]!.name, "Fiesta RV Park");
  assert.match(camps[0]!.amenityHint, /dump tagged/);
  assert.ok(camps.some((c) => c.name === "Golden Gardens Camp" && c.nearDest));
});

test("dedup + rank: RV parks first, then along-route, no dupes", () => {
  const camps = finalizeCamps([
    camp({
      id: "a",
      name: "Forest Camp",
      kind: "campground",
      progress: 0.1,
      milesOff: 1,
      lat: 40,
      lng: -119,
    }),
    camp({
      id: "b",
      name: "KOA",
      kind: "rv-park",
      progress: 0.5,
      milesOff: 2,
      lat: 43,
      lng: -116,
    }),
    camp({
      id: "c",
      name: "Forest Camp",
      kind: "campground",
      progress: 0.1,
      milesOff: 0.4,
      lat: 40.0004,
      lng: -119.0003,
    }),
  ]);
  assert.equal(camps.length, 2);
  assert.equal(camps[0]!.kind, "rv-park");
  assert.equal(camps[1]!.name, "Forest Camp");
  assert.equal(camps[1]!.milesOff, 0.4);
});

test("classifyCampKind is honest — generic camp vs RV park", () => {
  assert.equal(classifyCampKind({ name: "National Forest Campground" }), "campground");
  assert.equal(classifyCampKind({ name: "Sun Outdoors Bend" }), "rv-park");
  assert.equal(
    classifyCampKind({ name: "Lakeside", categories: [HERE_RV_PARK_CATEGORY] }),
    "rv-park",
  );
  assert.equal(
    looksLikeRvPark({ name: "Dispersed Camp", tags: { tourism: "camp_site" } }),
    false,
  );
});

test("amenityHintFromTags never invents hookups", () => {
  assert.equal(amenityHintFromTags({}), "");
  assert.equal(amenityHintFromTags({ hookups: "full" }), "");
  assert.equal(
    amenityHintFromTags({ sanitary_dump_station: "yes", power_supply: "yes" }),
    "dump tagged · power tagged",
  );
});

test("emptyCampResult never invents pads", () => {
  const r = emptyCampResult("overpass", 15, "Overpass timed out");
  assert.equal(r.camps.length, 0);
  assert.equal(r.sourceLabel, "OpenStreetMap Overpass");
  assert.match(r.sourceNote, /not live pad inventory/i);
  assert.doesNotMatch(r.sourceNote, /DEMO/i);
  assert.equal(r.error, "Overpass timed out");
});

test("source labels stay honest", () => {
  assert.equal(campSourceLabel("here"), "HERE Places");
  assert.equal(campSourceLabel("overpass"), "OpenStreetMap Overpass");
  assert.match(campSourceNote("here"), /HERE Places/);
  assert.doesNotMatch(campSourceNote("here"), /DEMO/i);
  assert.match(campSourceNote("overpass"), /tourism=camp_site/);
});

test("buildCampsQuery uses /api/camps shape, not /api/route", () => {
  const qs = buildCampsQuery({
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

test("dedupCamps collapses near-identical names", () => {
  const a = camp({ id: "1", name: "KOA", lat: 43.6, lng: -116.2 });
  const b = camp({
    id: "2",
    name: "KOA",
    lat: 43.6002,
    lng: -116.2004,
    milesOff: 2,
  });
  assert.equal(dedupCamps([a, b]).length, 1);
});

test("camp helpers do not invent a pad catalog", () => {
  const src = readFileSync(join(root, "corridorCamps.ts"), "utf8");
  assert.doesNotMatch(src, /DEMO_CAMPS|FAKE_CAMP|invented pad/i);
  assert.match(src, /Never invents pads/);
});

test("GET /api/camps stays on HERE/Overpass and never /api/route", () => {
  const api = readFileSync(join(root, "../../routes/api/camps.ts"), "utf8");
  const app = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  const ui = readFileSync(
    join(root, "../../components/rvtrips/CampsAlongRoute.tsx"),
    "utf8",
  );
  assert.match(api, /createFileRoute\("\/api\/camps"\)/);
  assert.match(api, /browse\.search\.hereapi\.com/);
  assert.match(api, /overpass-api\.de/);
  assert.match(api, /tourism"="camp_site/);
  assert.match(api, /never invents pads/i);
  assert.doesNotMatch(api, /\/api\/route/);
  assert.match(app, /\/api\/camps/);
  assert.doesNotMatch(app, /\/api\/route/);
  assert.match(app, /label: "Camps"/);
  assert.doesNotMatch(app, /label: "Demo camps"/);
  assert.match(ui, /data-camps-along-route/);
  assert.doesNotMatch(ui, /DEMO_CAMPS/);
  assert.doesNotMatch(api, /RATEAPI_MODE|rvData/);
});

test("DEMO_CAMPS is quarantined behind sample — not the default camps path", () => {
  const app = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(app, /showSampleCamps/);
  assert.match(app, /SAMPLE_CAMPS/);
  const liveBlock = app.slice(
    app.indexOf("sub === \"campgrounds\""),
    app.indexOf("sub === \"dumps\""),
  );
  assert.match(liveBlock, /CampsAlongRoute/);
  assert.match(liveBlock, /Sample pads/);
  assert.doesNotMatch(
    liveBlock.slice(0, liveBlock.indexOf("showSampleCamps")),
    /SAMPLE_CAMPS\.map|DEMO_CAMPS\.filter/,
  );
});
