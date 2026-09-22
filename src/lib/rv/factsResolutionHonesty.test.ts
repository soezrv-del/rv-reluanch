/**
 * Facts resolution: exact pin → show it. Missing / thin → GAP.
 * Never brand averages, dual-family class engines, wrong-model notes,
 * or unmatched videos as this coach.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONFIRM_BROCHURE,
  buildBrochureSpecs,
  pickPowertrainBand,
  resolveYearSnapshot,
} from "./brochureSpecs.ts";
import {
  honestEngineLabel,
  honestHorsepowerLabel,
  honestTorqueLabel,
  isExactEnginePin,
  isInventForwardYear,
  isPastCatalogYearEnd,
  isUnpinnedEngineLabel,
  lastExactPowertrainYear,
} from "./catalogHonesty.ts";
import type { RVSpec } from "./rvTypes.ts";
import { RV_DATA } from "./rvData.ts";
import { getMockReviews, reviewMentionsModel } from "./rvReviews.ts";
import { rankRvVideos } from "./rvVideos.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function factsFor(
  year: string,
  make: string,
  model: string,
  floorplan: string,
) {
  const spec = RV_DATA[make]?.[model];
  assert.ok(spec, `expected catalog spec for ${make} ${model}`);
  return {
    spec,
    snap: resolveYearSnapshot(spec, year, floorplan),
    brochure: buildBrochureSpecs(spec, year, make, model, floorplan),
  };
}

test("shared helpers: dual-family / class / by-year labels are unpinned", () => {
  assert.equal(isUnpinnedEngineLabel("Cummins L9 / B6.7 class"), true);
  assert.equal(
    isUnpinnedEngineLabel(
      "Ford F-53 6.8L Triton V10 320HP / 7.3L V8 350HP (option)",
    ),
    true,
  );
  assert.equal(isExactEnginePin("Cummins L9 / B6.7 class"), false);
  assert.equal(honestEngineLabel("Cummins L9 / B6.7 class").text, null);
  assert.equal(
    honestHorsepowerLabel({
      engine: "Cummins L9 / B6.7 class",
      horsepower: 380,
    }),
    null,
  );
  assert.equal(
    honestTorqueLabel({
      engine: "Cummins L9 / B6.7 class",
      torqueLbFt: 1000,
    }),
    null,
  );

  assert.equal(isUnpinnedEngineLabel("Ford 7.3L / V10 (by year)"), true);
  assert.equal(isExactEnginePin("Ford 7.3L V8 Godzilla 335HP"), true);
  assert.equal(honestEngineLabel("Ford 7.3L V8 Godzilla 335HP").locked, true);
  assert.equal(
    honestHorsepowerLabel({
      engine: "Ford 7.3L V8 Godzilla 335HP",
      horsepower: 335,
    }),
    "335 HP",
  );

  const option = "Cummins L9 450 std / X15 605 opt";
  assert.equal(isUnpinnedEngineLabel(option), false);
  assert.equal(isExactEnginePin(option), false);
  assert.equal(honestEngineLabel(option).text, null);
  assert.match(
    honestHorsepowerLabel({ engine: option, horsepower: 450 }) || "",
    /450/,
  );
});

test("2023 Holiday Rambler Ambassador 40B: invent-forward + dual-band → GAP, not a 2015–16 pin", () => {
  const { spec, snap, brochure } = factsFor(
    "2023",
    "Holiday Rambler",
    "Ambassador",
    "40B",
  );
  // Catalog still lists invented FBY years + L9/B6.7 — we do not coach-patch yearEnd.
  assert.ok(spec.floorplansByYear?.["2023"]?.includes("40B"));
  assert.ok(spec.floorplansByYear?.["2026"]);
  assert.equal(spec.yearEnd, undefined);
  assert.equal(lastExactPowertrainYear(spec), null);
  assert.equal(isPastCatalogYearEnd(spec, 2023), false);
  assert.equal(
    isInventForwardYear(
      spec,
      2023,
      spec.powertrainByYear?.find((b) => b.from <= 2023 && b.to >= 2023)
        ?.engine,
    ),
    true,
  );
  assert.equal(snap.yearTruePowertrain, false);
  assert.equal(snap.engine, undefined);
  assert.equal(snap.horsepower, undefined);
  assert.equal(brochure.engine, CONFIRM_BROCHURE);
  assert.equal(brochure.horsepower, "—");
  assert.equal(brochure.torque, "—");
  assert.equal(brochure.gvwr, CONFIRM_BROCHURE);
  assert.equal(brochure.gvwrLbs, null);
  assert.doesNotMatch(brochure.engine, /L9\s*\/\s*B6\.7|B6\.7\s*\/\s*L9/i);
  assert.doesNotMatch(brochure.gvwr, /34,?000|42,?000|34–42|34-42/);
  assert.doesNotMatch(brochure.uvw, /34,?000|42,?000/);
  // Last dated OEM cards (2015–2016 38DBT/38FST ISB 340/700, GVWR 28k) are
  // not this 2023 40B — do not invent that pin forward.
  assert.doesNotMatch(brochure.engine, /ISB|6\.7|340/);
  assert.doesNotMatch(brochure.horsepower, /340/);
  assert.doesNotMatch(brochure.gvwr, /28,?000/);
  assert.doesNotMatch(brochure.lengthFt, /38DBT|38FST/i);
  assert.match(brochure.accuracyNote, /confirm brochure/i);
  assert.doesNotMatch(brochure.accuracyNote, /Year-true OEM facts/);

  const notes = getMockReviews("Holiday Rambler", "Ambassador", 4.5);
  assert.equal(notes.length, 0);
  assert.equal(
    notes.some((r) => /Navigator|Vacationer/i.test(`${r.title} ${r.body}`)),
    false,
  );

  const videos = rankRvVideos(
    [
      { title: "2023 Holiday Rambler Admiral walkthrough" },
      { title: "2023 Holiday Rambler Endeavor 38K" },
      { title: "2023 Holiday Rambler Nautica" },
    ],
    "2023 Holiday Rambler Ambassador 40B",
    "Holiday Rambler",
    "Ambassador",
  );
  assert.equal(videos.length, 0);
});

test("2023 Jayco Precept 31UL: exact year pin + OEM GVWR stay; thin 2019 GAPs", () => {
  const pinned = factsFor("2023", "Jayco", "Precept", "31UL");
  assert.equal(isInventForwardYear(pinned.spec, 2023, pinned.snap.engine), false);
  assert.equal(pinned.snap.yearTruePowertrain, true);
  assert.match(pinned.brochure.engine, /7\.3|Godzilla/i);
  assert.doesNotMatch(pinned.brochure.engine, /V10|by year|class/i);
  assert.equal(pinned.brochure.horsepower, "335 HP");
  assert.match(pinned.brochure.torque, /468/);
  assert.match(pinned.brochure.gvwr, /22,?000/);
  assert.equal(pinned.brochure.gvwrLbs, 22_000);

  const notes = getMockReviews("Jayco", "Precept", 4.4);
  assert.ok(notes.length > 0);
  for (const r of notes) {
    assert.equal(reviewMentionsModel(r, "Precept"), true);
    assert.equal(reviewMentionsModel(r, "Embark"), false);
    assert.equal(reviewMentionsModel(r, "Melbourne"), false);
  }

  const thin = factsFor("2019", "Jayco", "Precept", "31UL");
  assert.equal(thin.snap.yearTruePowertrain, false);
  assert.equal(thin.brochure.engine, CONFIRM_BROCHURE);
  assert.equal(thin.brochure.horsepower, "—");
  assert.doesNotMatch(thin.brochure.engine, /Godzilla|335/);
});

test("2023 Thor ACE 29D: exact year pin + OEM GVWR stay; 2021 option-band GAPs", () => {
  const pinned = factsFor("2023", "Thor", "ACE", "29D");
  assert.equal(isInventForwardYear(pinned.spec, 2023, pinned.snap.engine), false);
  assert.equal(pinned.snap.yearTruePowertrain, true);
  assert.match(pinned.brochure.engine, /7\.3|Godzilla/i);
  assert.doesNotMatch(pinned.brochure.engine, /V10|option|class/i);
  assert.equal(pinned.brochure.horsepower, "350 HP");
  assert.match(pinned.brochure.torque, /468/);
  assert.match(pinned.brochure.gvwr, /18,?000/);
  assert.equal(pinned.brochure.gvwrLbs, 18_000);

  const notes = getMockReviews("Thor", "ACE", 4.0);
  assert.ok(notes.length > 0);
  for (const r of notes) {
    assert.equal(reviewMentionsModel(r, "ACE"), true);
    assert.doesNotMatch(`${r.title} ${r.body}`, /\bTuscany\b|\bPalazzo\b|\bFour Winds\b/);
  }

  const optionYear = factsFor("2021", "Thor", "ACE", "29.5");
  assert.equal(optionYear.snap.yearTruePowertrain, false);
  assert.equal(optionYear.brochure.engine, CONFIRM_BROCHURE);
  assert.equal(optionYear.brochure.horsepower, "—");
  assert.doesNotMatch(optionYear.brochure.engine, /320|350|V10/);
});

test("yearEnd / last-exact-pin clamp is shared — later FBY cannot steal a pin", () => {
  const stub = {
    type: "Class A Diesel",
    floorplans: ["40B"],
    floorplansByYear: {
      "2016": ["38F"],
      "2023": ["40B"],
    },
    lengthRange: [38, 40] as [number, number],
    weightRange: [28000, 34000] as [number, number],
    slideouts: 3,
    sleeps: 6,
    msrpRange: [200000, 400000] as [number, number],
    engine: "Ford 7.3L V8 Godzilla 335HP",
    horsepower: 335,
    torqueLbFt: 468,
    chassis: "Ford F53",
    fuelType: "Diesel",
    recalls: 0,
    rating: 4,
    image: "",
    yearEnd: 2016,
    powertrainByYear: [
      {
        from: 2014,
        to: 2026,
        engine: "Ford 7.3L V8 Godzilla 335HP",
        horsepower: 335,
        torqueLbFt: 468,
      },
    ],
  } satisfies RVSpec;

  assert.equal(isPastCatalogYearEnd(stub, 2016), false);
  assert.equal(isPastCatalogYearEnd(stub, 2023), true);
  assert.equal(isInventForwardYear(stub, 2023, stub.powertrainByYear[0]!.engine), true);
  assert.equal(pickPowertrainBand(stub, 2023, "40B"), null);
  const snap = resolveYearSnapshot(stub, "2023", "40B");
  assert.equal(snap.yearTruePowertrain, false);
  assert.equal(snap.engine, undefined);
  const brochure = buildBrochureSpecs(stub, "2023", "Stub", "Line", "40B");
  assert.equal(brochure.engine, CONFIRM_BROCHURE);
  assert.doesNotMatch(brochure.engine, /Godzilla|335/);
  assert.equal(brochure.horsepower, "—");
});

test("Brinkley Model G/T 3250: OEM 22k floorplan row wins; no model-level 23k stamp", () => {
  const g = factsFor("2024", "Brinkley", "Model G", "3250");
  const t = factsFor("2024", "Brinkley", "Model T", "3250");
  assert.equal(g.spec.gvwrLbs, undefined);
  assert.equal(g.spec.uvwLbs, undefined);
  assert.equal(t.spec.gvwrLbs, undefined);
  assert.equal(t.spec.uvwLbs, undefined);
  assert.equal(g.snap.gvwrLbs, undefined);
  assert.equal(t.snap.gvwrLbs, undefined);
  // Dated OEM_FLOORPLAN_ROWS (source: "Brinkley Model G 3250 brochure") stay SoT.
  assert.equal(g.brochure.gvwrLbs, 22_000);
  assert.equal(t.brochure.gvwrLbs, 22_000);
  assert.match(g.brochure.gvwr, /22,?000/);
  assert.match(t.brochure.gvwr, /22,?000/);
  assert.doesNotMatch(g.brochure.gvwr, /23,?000/);
  assert.doesNotMatch(t.brochure.gvwr, /23,?000/);

  const gx = RV_DATA.Brinkley?.["Model Gx"];
  const z = RV_DATA.Brinkley?.["Model Z"];
  const i = RV_DATA.Brinkley?.["Model I"];
  const ix = RV_DATA.Brinkley?.["Model Ix"];
  const tAir = RV_DATA.Brinkley?.["Model T Air"];
  assert.ok(gx && z && i && ix && tAir);
  assert.equal(gx.gvwrLbs, undefined);
  assert.equal(z.gvwrLbs, undefined);
  assert.equal(i.gvwrLbs, undefined);
  assert.equal(ix.gvwrLbs, undefined);
  assert.equal(tAir.gvwrLbs, undefined);
});

test("Fleetwood Fortis: 26k model stamp is GCWR misread — GAP; KEEP siblings", () => {
  const fortis = factsFor("2026", "Fleetwood", "Fortis", "32RW");
  assert.equal(fortis.spec.gvwrLbs, undefined);
  assert.equal(fortis.snap.gvwrLbs, undefined);
  assert.equal(fortis.brochure.gvwrLbs, null);
  assert.equal(fortis.brochure.gvwr, CONFIRM_BROCHURE);
  assert.doesNotMatch(fortis.brochure.gvwr, /26,?000/);
  assert.deepEqual(fortis.spec.weightRange, [18000, 26000]);

  // Audit E KEEP — do not clear these stamps in this batch.
  assert.equal(RV_DATA.Fleetwood?.Altitude?.gvwrLbs, 14500);
  assert.equal(RV_DATA.Fleetwood?.Insight?.gvwrLbs, 11030);
  assert.equal(RV_DATA["Holiday Rambler"]?.Incline?.gvwrLbs, 14500);
  assert.equal(RV_DATA["Holiday Rambler"]?.["Incline FS550"]?.gvwrLbs, 22000);
});

test("Audit E 2027 brochure path: Altitude / Incline / Incline FS550 pins", () => {
  const altitude = factsFor("2027", "Fleetwood", "Altitude", "27U");
  assert.equal(altitude.brochure.gvwrLbs, 14500);
  assert.equal(altitude.spec.gvwrLbs, 14500);

  const incline = factsFor("2027", "Holiday Rambler", "Incline", "29H");
  assert.equal(incline.brochure.gvwrLbs, 14500);
  assert.equal(incline.spec.gvwrLbs, 14500);

  const fs550 = factsFor("2027", "Holiday Rambler", "Incline FS550", "30WM");
  assert.equal(fs550.brochure.gvwrLbs, 22000);
  assert.equal(fs550.spec.gvwrLbs, 22000);

  const bleed = factsFor("2027", "Holiday Rambler", "Incline FS550", "27U");
  assert.notEqual(bleed.brochure.gvwrLbs, 14500);
});

test("Lineage Series F: no series 22k stamp; 31ZW / 31ZW5 year-bands stay", () => {
  const spec = RV_DATA["Grand Design"]?.["Lineage Series F"];
  assert.ok(spec);
  assert.equal(spec.gvwrLbs, undefined);
  const zw = factsFor("2026", "Grand Design", "Lineage Series F", "31ZW");
  const zw5 = factsFor("2026", "Grand Design", "Lineage Series F", "31ZW5");
  assert.equal(zw.snap.gvwrLbs, 22_000);
  assert.equal(zw5.snap.gvwrLbs, 19_500);
  assert.equal(zw.brochure.gvwrLbs, 22_000);
  assert.equal(zw5.brochure.gvwrLbs, 19_500);
});

test("resolution path is shared — no coach-specific Ambassador/Jayco/Thor invent", () => {
  const honesty = src("catalogHonesty.ts");
  const brochure = src("brochureSpecs.ts");
  const reviews = src("rvReviews.ts");
  const videos = src("rvVideos.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const api = src("../../routes/api/rv-videos.ts");

  assert.match(honesty, /export function isUnpinnedEngineLabel/);
  assert.match(honesty, /export function isExactEnginePin/);
  assert.match(honesty, /export function isInventForwardYear/);
  assert.match(honesty, /export function isPastCatalogYearEnd/);
  assert.match(brochure, /isExactEnginePin/);
  assert.match(brochure, /isInventForwardYear/);
  assert.match(brochure, /isPastCatalogYearEnd/);
  assert.match(brochure, /honestEngineLabel/);
  assert.match(brochure, /No in-year band → GAP/);
  assert.match(brochure, /Never interpolate catalog weightRange/);
  assert.match(reviews, /reviewMentionsModel/);
  const getMock = reviews.slice(reviews.indexOf("export function getMockReviews"));
  assert.match(getMock, /reviewMentionsModel\(r, model\)/);
  assert.match(videos, /titleQualifiesForRvCoach/);
  assert.match(api, /rankRvVideos\(hits, query, make, model\)/);
  assert.match(detail, /ownerReviews\.length \?/);
  assert.doesNotMatch(detail, /No sample notes for this brand/);

  assert.match(
    RV_DATA["Holiday Rambler"]?.Ambassador?.powertrainByYear?.find(
      (b) => b.from <= 2023 && b.to >= 2023,
    )?.engine || "",
    /L9 \/ B6\.7 class/,
  );
});
