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
  campWebsiteFromHere,
  campWebsiteFromTags,
  classifyCampKind,
  dedupCamps,
  emptyCampResult,
  finalizeCamps,
  HERE_CAMP_CATEGORIES,
  HERE_CAMPGROUND_CATEGORY,
  HERE_RV_PARK_CATEGORY,
  keepCampPoi,
  looksLikeRvPark,
  normalizeCampWebsite,
  normalizeHereCamps,
  normalizeOverpassCamps,
  parseOsmLengthToFt,
  siteLengthFtFromTags,
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
      contacts: [{ www: [{ value: "https://koa.com/campgrounds/boise/" }] }],
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
  assert.equal(camps[0]!.website, "https://koa.com/campgrounds/boise/");
  assert.equal(camps[0]!.siteLengthFt, undefined);
  assert.equal(camps[0]!.amenityHint, "");
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
        "maxlength:motorhome": "12 m",
        fee: "yes",
        opening_hours: "Mo-Su 08:00-20:00",
        website: "https://fiestarv.example/book",
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
  assert.equal(camps[0]!.siteLengthFt, 39);
  assert.match(camps[0]!.amenityHint, /dump tagged/);
  assert.match(camps[0]!.amenityHint, /fee tagged/);
  assert.match(camps[0]!.amenityHint, /Mo-Su 08:00-20:00/);
  assert.equal(camps[0]!.website, "https://fiestarv.example/book");
  assert.equal(
    camps.find((c) => c.name === "Golden Gardens Camp")?.website,
    undefined,
  );
  assert.equal(
    camps.find((c) => c.name === "Golden Gardens Camp")?.siteLengthFt,
    undefined,
  );
  assert.ok(camps.some((c) => c.name === "Golden Gardens Camp" && c.nearDest));
});

test("dedup + rank: along-route first, closer dupe wins", () => {
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
  assert.equal(camps[0]!.name, "Forest Camp");
  assert.equal(camps[0]!.milesOff, 0.4);
  assert.equal(camps[1]!.kind, "rv-park");
});

test("finalizeCamps spreads mid-corridor and dest when origin parks are dense", () => {
  const many: CampStop[] = [];
  for (let i = 0; i < 24; i++) {
    many.push(
      camp({
        id: `o${i}`,
        name: `Reno Park ${i}`,
        kind: "rv-park",
        progress: 0.02,
        milesOff: 1,
        lat: 39.5 + i * 0.02,
        lng: -119.8,
        nearDest: false,
      }),
    );
  }
  many.push(
    camp({
      id: "boise",
      name: "Boise RV Park",
      kind: "rv-park",
      progress: 0.45,
      milesOff: 2,
      lat: 43.6,
      lng: -116.2,
      nearDest: false,
    }),
  );
  many.push(
    camp({
      id: "seattle",
      name: "Seattle KOA",
      kind: "rv-park",
      progress: 0.98,
      milesOff: 4,
      lat: 47.6,
      lng: -122.3,
      nearDest: true,
    }),
  );
  const out = finalizeCamps(many, 20);
  assert.ok(out.some((c) => c.name === "Seattle KOA"));
  assert.ok(out.some((c) => c.name === "Boise RV Park"));
  assert.ok(out.length <= 20);
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
  assert.equal(
    looksLikeRvPark({ name: "Silver Crown Mobile Home Park" }),
    false,
  );
});

test("normalize drops mobile-home parks that are not RV", () => {
  const items = [
    {
      id: "here:mh",
      title: "Silver Crown Mobile Home Park",
      position: { lat: 43.58, lng: -116.18 },
      address: { city: "Reno", stateCode: "NV" },
      categories: [{ id: HERE_RV_PARK_CATEGORY }],
    },
    {
      id: "here:koa",
      title: "Reno KOA",
      position: { lat: 43.59, lng: -116.2 },
      address: { city: "Reno", stateCode: "NV" },
      categories: [{ id: HERE_RV_PARK_CATEGORY }],
    },
  ];
  const camps = normalizeHereCamps(items, CORRIDOR, 15);
  assert.equal(camps.length, 1);
  assert.equal(camps[0]!.name, "Reno KOA");
  assert.equal(camps[0]!.website, undefined);
});

test("normalizeCampWebsite only keeps real http(s) sites", () => {
  assert.equal(normalizeCampWebsite(""), undefined);
  assert.equal(normalizeCampWebsite("   "), undefined);
  assert.equal(normalizeCampWebsite("javascript:alert(1)"), undefined);
  assert.equal(normalizeCampWebsite("data:text/html,hi"), undefined);
  assert.equal(normalizeCampWebsite("/local/path"), undefined);
  assert.equal(normalizeCampWebsite("not a url"), undefined);
  assert.equal(
    normalizeCampWebsite("https://fiestarv.example/book"),
    "https://fiestarv.example/book",
  );
  assert.equal(
    normalizeCampWebsite("www.nps.gov/glac/planyourvisit/camping.htm"),
    "https://www.nps.gov/glac/planyourvisit/camping.htm",
  );
});

test("campWebsiteFromTags prefers website, then contact:website, then url", () => {
  assert.equal(campWebsiteFromTags({}), undefined);
  assert.equal(
    campWebsiteFromTags({
      website: "https://park.example/",
      "contact:website": "https://other.example/",
      url: "https://third.example/",
    }),
    "https://park.example/",
  );
  assert.equal(
    campWebsiteFromTags({
      "contact:website": "https://contact.example/",
      url: "https://third.example/",
    }),
    "https://contact.example/",
  );
  assert.equal(
    campWebsiteFromTags({ url: "https://only-url.example/" }),
    "https://only-url.example/",
  );
});

test("campWebsiteFromHere reads contacts.www.value only", () => {
  assert.equal(campWebsiteFromHere({}), undefined);
  assert.equal(
    campWebsiteFromHere({
      contacts: [{ www: [{ value: "javascript:void(0)" }] }],
    }),
    undefined,
  );
  assert.equal(
    campWebsiteFromHere({
      contacts: [{ www: [{ value: "https://koa.com/campgrounds/reno/" }] }],
    }),
    "https://koa.com/campgrounds/reno/",
  );
});

test("amenityHintFromTags never invents hookups", () => {
  assert.equal(amenityHintFromTags({}), "");
  assert.equal(amenityHintFromTags({ hookups: "full" }), "");
  assert.equal(amenityHintFromTags({ fee: "customers" }), "");
  assert.equal(
    amenityHintFromTags({ sanitary_dump_station: "yes", power_supply: "yes" }),
    "dump tagged · power tagged",
  );
  assert.equal(
    amenityHintFromTags({ fee: "no", opening_hours: "24/7" }),
    "no fee tagged · 24/7 tagged",
  );
  assert.equal(
    amenityHintFromTags({
      opening_hours: "Mo-Fr 08:00-18:00; Sa 09:00-12:00",
    }),
    "hours tagged",
  );
});

test("parseOsmLengthToFt is honest — units only, no invented pad feet", () => {
  assert.equal(parseOsmLengthToFt(""), undefined);
  assert.equal(parseOsmLengthToFt("   "), undefined);
  assert.equal(parseOsmLengthToFt("40 ft"), 40);
  assert.equal(parseOsmLengthToFt("40ft"), 40);
  assert.equal(parseOsmLengthToFt("12 m"), 39);
  assert.equal(parseOsmLengthToFt("12"), 39);
  assert.equal(parseOsmLengthToFt("45"), undefined);
  assert.equal(parseOsmLengthToFt("10-12"), undefined);
  assert.equal(parseOsmLengthToFt("12; motorhome"), undefined);
  assert.equal(parseOsmLengthToFt("huge"), undefined);
  assert.equal(parseOsmLengthToFt("200 ft"), undefined);
});

test("siteLengthFtFromTags prefers RV-specific maxlength and never invents", () => {
  assert.equal(siteLengthFtFromTags({}), undefined);
  assert.equal(siteLengthFtFromTags({ site_length: "40 ft" }), undefined);
  assert.equal(siteLengthFtFromTags({ pad: "60" }), undefined);
  assert.equal(
    siteLengthFtFromTags({
      maxlength: "10 m",
      "maxlength:motorhome": "40 ft",
    }),
    40,
  );
  assert.equal(siteLengthFtFromTags({ maxlength: "12 m" }), 39);
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
  assert.match(app, /CampsAlongRoute/);
  assert.doesNotMatch(app, /label: "Demo camps"/);
  assert.match(ui, /data-camps-along-route/);
  assert.match(ui, /data-along-open/);
  assert.match(ui, /useState\(false\)/);
  assert.match(ui, /Reserve a Space/);
  assert.match(ui, /data-reserve-space/);
  assert.match(ui, /c\.website \?/);
  assert.match(ui, /c\.siteLengthFt/);
  assert.match(ui, /max \$\{c\.siteLengthFt\} ft/);
  assert.match(ui, /noopener noreferrer/);
  assert.doesNotMatch(ui, /DEMO_CAMPS/);
  assert.doesNotMatch(ui, /recreation\.gov|reserveamerica|koa\.com\/search/i);
  assert.doesNotMatch(api, /RATEAPI_MODE|rvData/);
});

test("camp website helpers never invent booking search URLs", () => {
  const src = readFileSync(join(root, "corridorCamps.ts"), "utf8");
  assert.match(src, /contact:website/);
  assert.match(src, /item\.contacts/);
  assert.match(src, /contact\.www/);
  assert.match(src, /contacts\[\]\.www\[\]\.value/);
  assert.doesNotMatch(src, /recreation\.gov|reserveamerica|koa\.com\/search/i);
});

test("DEMO_CAMPS is quarantined behind sample — not the default camps path", () => {
  const app = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(app, /showSampleCamps/);
  assert.match(app, /SAMPLE_CAMPS/);
  const liveBlock = app.slice(
    app.indexOf("<CampsAlongRoute"),
    app.indexOf("data-sample-camps"),
  );
  assert.match(liveBlock, /CampsAlongRoute/);
  assert.match(liveBlock, /Sample pads/);
  assert.doesNotMatch(
    liveBlock.slice(0, liveBlock.indexOf("showSampleCamps")),
    /SAMPLE_CAMPS\.map|DEMO_CAMPS\.filter/,
  );
});
