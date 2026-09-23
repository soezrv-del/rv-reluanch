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
import { findOemFloorplanSpec, findOemGvwrLbs, findOemUvwLbs } from "./floorplanSpecs.ts";
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

test("Airstream MY2027: model GVWR stamps gone; brochure pins only exact codes", () => {
  const trade = RV_DATA.Airstream?.["Trade Wind"];
  const world = RV_DATA.Airstream?.["World Traveler"];
  const classic = RV_DATA.Airstream?.Classic;
  assert.ok(trade && world && classic);
  assert.equal(trade.gvwrLbs, undefined);
  assert.equal(world.gvwrLbs, undefined);
  assert.equal(classic.gvwrLbs, undefined);

  // 2027 RVUSA Trade Wind brochure: 23FB 6,500; 25FB 7,600; 27FB 8,300.
  // 27FB is on the Trade Wind floorplans list — pin it. Twin / Dublin / 28RB GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "23FB"), 6500);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "25FB"), 7600);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "27FB"), 8300);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "25FB Twin"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "25FB Dublin Slate"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "28RB"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "Trade Wind", "23FB"), null);

  const tw23 = factsFor("2027", "Airstream", "Trade Wind", "23FB");
  const tw25 = factsFor("2027", "Airstream", "Trade Wind", "25FB");
  const tw27 = factsFor("2027", "Airstream", "Trade Wind", "27FB");
  const twTwin = factsFor("2027", "Airstream", "Trade Wind", "25FB Twin");
  const tw28 = factsFor("2027", "Airstream", "Trade Wind", "28RB");
  assert.equal(tw23.snap.gvwrLbs, undefined);
  assert.equal(tw25.snap.gvwrLbs, undefined);
  assert.equal(tw23.brochure.gvwrLbs, 6500);
  assert.equal(tw25.brochure.gvwrLbs, 7600);
  assert.equal(tw27.brochure.gvwrLbs, 8300);
  assert.equal(twTwin.brochure.gvwrLbs, null);
  assert.equal(tw28.brochure.gvwrLbs, null);
  assert.match(tw23.brochure.gvwr, /6,?500/);
  assert.match(tw25.brochure.gvwr, /7,?600/);
  assert.doesNotMatch(tw23.brochure.gvwr, /7,?600|8,?300/);
  assert.doesNotMatch(tw25.brochure.gvwr, /6,?500|8,?300/);

  // 2027 RVUSA World Traveler brochure table: 17RB 3,500; 22RB 4,500.
  // Marketing copy says 22FB — do not pin the typo.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "World Traveler", "17RB"), 3500);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "World Traveler", "22RB"), 4500);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "World Traveler", "22FB"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "World Traveler", "22RB"), null);
  const wt17 = factsFor("2027", "Airstream", "World Traveler", "17RB");
  const wt22 = factsFor("2027", "Airstream", "World Traveler", "22RB");
  assert.equal(wt17.snap.gvwrLbs, undefined);
  assert.equal(wt22.snap.gvwrLbs, undefined);
  assert.equal(wt17.brochure.gvwrLbs, 3500);
  assert.equal(wt22.brochure.gvwrLbs, 4500);
  assert.match(wt17.brochure.gvwr, /3,?500/);
  assert.match(wt22.brochure.gvwr, /4,?500/);
  assert.doesNotMatch(wt17.brochure.gvwr, /4,?500/);

  // 2027 RVUSA Classic brochure: 28RB 8,800; 30RB / 33FB 10,000.
  // Resolver does not strip Twin — Twin stays GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Classic", "28RB"), 8800);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Classic", "30RB"), 10000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Classic", "33FB"), 10000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Classic", "30RB Twin"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Classic", "33FB Twin"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "Classic", "30RB"), null);
  const cl28 = factsFor("2027", "Airstream", "Classic", "28RB");
  const cl30 = factsFor("2027", "Airstream", "Classic", "30RB");
  const cl33 = factsFor("2027", "Airstream", "Classic", "33FB");
  const clTwin = factsFor("2027", "Airstream", "Classic", "30RB Twin");
  assert.equal(cl28.snap.gvwrLbs, undefined);
  assert.equal(cl30.snap.gvwrLbs, undefined);
  assert.equal(cl28.brochure.gvwrLbs, 8800);
  assert.equal(cl30.brochure.gvwrLbs, 10000);
  assert.equal(cl33.brochure.gvwrLbs, 10000);
  assert.equal(clTwin.brochure.gvwrLbs, null);
  assert.match(cl28.brochure.gvwr, /8,?800/);
  assert.match(cl30.brochure.gvwr, /10,?000/);
  assert.doesNotMatch(cl28.brochure.gvwr, /10,?000/);

  // Wave 1 siblings that stay unpinned here (Caravel is wave 3; Bambi wave 2).
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Interstate", "24GT"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Atlas", "25MS"), null);
});

test("Airstream MY2027 wave 2: printed brochure pins only; Twin / décor GAP", () => {
  const bambi = RV_DATA.Airstream?.Bambi;
  const basecamp = RV_DATA.Airstream?.Basecamp;
  const flying = RV_DATA.Airstream?.["Flying Cloud"];
  const intl = RV_DATA.Airstream?.International;
  const globe = RV_DATA.Airstream?.Globetrotter;
  assert.ok(bambi && basecamp && flying && intl && globe);
  assert.equal(bambi.gvwrLbs, undefined);
  assert.equal(basecamp.gvwrLbs, undefined);
  assert.equal(flying.gvwrLbs, undefined);
  assert.equal(intl.gvwrLbs, undefined);
  assert.equal(globe.gvwrLbs, undefined);

  // 2027 RVUSA Bambi brochure: 16RB 3,500; 20FB / 22FB 5,000. Dublin Slate GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Bambi", "16RB"), 3500);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Bambi", "20FB"), 5000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Bambi", "22FB"), 5000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Bambi", "16RB Dublin Slate"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "Bambi", "16RB"), null);
  const b16 = factsFor("2027", "Airstream", "Bambi", "16RB");
  const b22 = factsFor("2027", "Airstream", "Bambi", "22FB");
  const bDublin = factsFor("2027", "Airstream", "Bambi", "16RB Dublin Slate");
  assert.equal(b16.snap.gvwrLbs, undefined);
  assert.equal(b16.brochure.gvwrLbs, 3500);
  assert.equal(b22.brochure.gvwrLbs, 5000);
  assert.equal(bDublin.brochure.gvwrLbs, null);
  assert.match(b16.brochure.gvwr, /3,?500/);
  assert.match(b22.brochure.gvwr, /5,?000/);
  assert.doesNotMatch(b16.brochure.gvwr, /5,?000/);

  // 2027 RVUSA Basecamp brochure: 20X 4,300 only. 16 / 16X / 20 / Xe GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Basecamp", "20X"), 4300);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Basecamp", "16"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Basecamp", "16X"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Basecamp", "20"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Basecamp Xe", "20X"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "Basecamp", "20X"), null);
  const bc20x = factsFor("2027", "Airstream", "Basecamp", "20X");
  const bc16x = factsFor("2027", "Airstream", "Basecamp", "16X");
  assert.equal(bc20x.snap.gvwrLbs, undefined);
  assert.equal(bc20x.brochure.gvwrLbs, 4300);
  assert.equal(bc16x.brochure.gvwrLbs, null);
  assert.match(bc20x.brochure.gvwr, /4,?300/);

  // 2027 RVUSA Flying Cloud brochure. Twin / Dublin Slate / 30FB GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "23FB"), 6000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "25FB"), 7300);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "27FB"), 7600);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "28RB"), 7600);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "30FB Bunk"), 8800);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "25FB Twin"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "25FB Dublin Slate"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Flying Cloud", "30FB"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "Flying Cloud", "25FB"), null);
  const fc25 = factsFor("2027", "Airstream", "Flying Cloud", "25FB");
  const fcBunk = factsFor("2027", "Airstream", "Flying Cloud", "30FB Bunk");
  const fcTwin = factsFor("2027", "Airstream", "Flying Cloud", "25FB Twin");
  assert.equal(fc25.snap.gvwrLbs, undefined);
  assert.equal(fc25.brochure.gvwrLbs, 7300);
  assert.equal(fcBunk.brochure.gvwrLbs, 8800);
  assert.equal(fcTwin.brochure.gvwrLbs, null);
  assert.match(fc25.brochure.gvwr, /7,?300/);
  assert.match(fcBunk.brochure.gvwr, /8,?800/);
  assert.doesNotMatch(fc25.brochure.gvwr, /8,?800|6,?000/);

  // 2027 RVUSA International brochure. Coastal Cove GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "International", "23FB"), 6000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "International", "28RB"), 7600);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "International", "30RB"), 8800);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "International", "25FB Coastal Cove"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "International", "28RB"), null);
  const in28 = factsFor("2027", "Airstream", "International", "28RB");
  const inCove = factsFor("2027", "Airstream", "International", "25FB Coastal Cove");
  assert.equal(in28.snap.gvwrLbs, undefined);
  assert.equal(in28.brochure.gvwrLbs, 7600);
  assert.equal(inCove.brochure.gvwrLbs, null);
  assert.match(in28.brochure.gvwr, /7,?600/);

  // 2027 RVUSA Globetrotter brochure. Color / Dublin variants GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Globetrotter", "25FB"), 7300);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Globetrotter", "27FB"), 7600);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Globetrotter", "30RB"), 8800);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Globetrotter", "25FB Dublin Slate"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Globetrotter", "27FB Copenhagen Cream"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "Globetrotter", "30RB"), null);
  const gt25 = factsFor("2027", "Airstream", "Globetrotter", "25FB");
  const gtDublin = factsFor("2027", "Airstream", "Globetrotter", "25FB Dublin Slate");
  assert.equal(gt25.snap.gvwrLbs, undefined);
  assert.equal(gt25.brochure.gvwrLbs, 7300);
  assert.equal(gtDublin.brochure.gvwrLbs, null);
  assert.match(gt25.brochure.gvwr, /7,?300/);

  // Wave 1 isolation — no bleed. Caravel is wave 3.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "25FB"), 7600);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Classic", "28RB"), 8800);
});

test("Airstream MY2027 wave 3: Caravel printed GVWR only; Dublin Slate GAP", () => {
  const caravel = RV_DATA.Airstream?.Caravel;
  const bambi = RV_DATA.Airstream?.Bambi;
  assert.ok(caravel && bambi);
  // No model-level GVWR stamp — #408/#412 already omitted one; do not invent.
  assert.equal(caravel.gvwrLbs, undefined);
  assert.equal(bambi.gvwrLbs, undefined);

  // 2027 Airstream Caravel brochure compare + spec: 16RB 4,300; 20FB / 22FB 5,000.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Caravel", "16RB"), 4300);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Caravel", "20FB"), 5000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Caravel", "22FB"), 5000);
  // Dublin Slate is décor, not a printed GVWR code. Exact-match resolver.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Caravel", "16RB Dublin Slate"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Caravel", "20FB Dublin Slate"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Caravel", "22FB Dublin Slate"), null);
  // Unprinted / other-year / retired codes stay GAP.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Caravel", "19CB"), null);
  assert.equal(findOemGvwrLbs("2026", "Airstream", "Caravel", "16RB"), null);
  assert.equal(findOemUvwLbs("2027", "Airstream", "Caravel", "16RB"), null);
  assert.equal(findOemUvwLbs("2027", "Airstream", "Caravel", "20FB"), null);
  assert.equal(findOemUvwLbs("2027", "Airstream", "Caravel", "22FB"), null);

  const c16 = factsFor("2027", "Airstream", "Caravel", "16RB");
  const c20 = factsFor("2027", "Airstream", "Caravel", "20FB");
  const c22 = factsFor("2027", "Airstream", "Caravel", "22FB");
  const cDublin = factsFor("2027", "Airstream", "Caravel", "16RB Dublin Slate");
  assert.equal(c16.snap.gvwrLbs, undefined);
  assert.equal(c16.brochure.gvwrLbs, 4300);
  assert.equal(c20.brochure.gvwrLbs, 5000);
  assert.equal(c22.brochure.gvwrLbs, 5000);
  assert.equal(cDublin.brochure.gvwrLbs, null);
  assert.equal(c16.brochure.uvwLbs, null);
  assert.equal(c20.brochure.uvwLbs, null);
  assert.match(c16.brochure.gvwr, /4,?300/);
  assert.match(c20.brochure.gvwr, /5,?000/);
  assert.doesNotMatch(c16.brochure.gvwr, /5,?000/);

  // Isolation — Bambi 16RB stays 3,500 (not Caravel 4,300). Waves 1–2 untouched.
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Bambi", "16RB"), 3500);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Bambi", "20FB"), 5000);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Bambi", "16RB Dublin Slate"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Trade Wind", "25FB"), 7600);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Classic", "28RB"), 8800);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Interstate", "24GT"), null);
  assert.equal(findOemGvwrLbs("2027", "Airstream", "Atlas", "25MS"), null);
});

test("Audit E 2027 brochure path: Forest River Cardinal pins; 41DUB GAP", () => {
  const chill = factsFor("2027", "Forest River", "Cardinal", "32CHILL");
  assert.equal(chill.brochure.gvwrLbs, 12188);
  assert.equal(chill.brochure.uvwLbs, 9688);

  const chef = factsFor("2027", "Forest River", "Cardinal", "33CHEF");
  assert.equal(chef.brochure.gvwrLbs, 13885);
  assert.equal(chef.brochure.uvwLbs, 10558);

  const dub = factsFor("2027", "Forest River", "Cardinal", "41DUB");
  assert.equal(dub.brochure.gvwrLbs, null);
  assert.equal(dub.brochure.uvwLbs, null);

  const fr3 = factsFor("2026", "Forest River", "FR3", "31DS");
  assert.notEqual(fr3.brochure.gvwrLbs, 12188);
});

test("Audit E 2027 brochure path: Jayco Seneca Super C pins; XT GAP", () => {
  const j = factsFor("2027", "Jayco", "Seneca Super C", "33J");
  const k = factsFor("2027", "Jayco", "Seneca Super C", "37K");
  assert.equal(j.brochure.gvwrLbs, 31000);
  assert.equal(k.brochure.gvwrLbs, 31000);
  assert.equal(j.brochure.uvwLbs, null);
  assert.equal(findOemGvwrLbs("2027", "Jayco", "Seneca Super C", "33J"), 31000);
  assert.equal(findOemGvwrLbs("2027", "Jayco", "Seneca Super C", "37K"), 31000);
  assert.equal(findOemFloorplanSpec("2027", "Jayco", "Seneca Super C", "33J")?.gvwrLbs, 31000);
  assert.equal(findOemFloorplanSpec("2027", "Jayco", "Seneca Super C", "33J")?.uvwLbs, undefined);

  const xt = factsFor("2027", "Jayco", "Seneca XT", "32U");
  assert.equal(xt.brochure.gvwrLbs, null);
  assert.equal(findOemGvwrLbs("2027", "Jayco", "Seneca XT", "32U"), null);
  assert.equal(findOemGvwrLbs("2027", "Jayco", "Seneca XT", "35L"), null);

  // Prestige 37K/37L/37M have their own exact 2027 pin; 33J stays GAP.
  // Bare-Seneca floorplan UVW must not bleed into Prestige.
  assert.equal(findOemGvwrLbs("2027", "Jayco", "Seneca Prestige", "37K"), 31000);
  assert.equal(findOemGvwrLbs("2027", "Jayco", "Seneca Prestige", "33J"), null);
  assert.equal(findOemUvwLbs("2027", "Jayco", "Seneca Prestige", "37K"), null);
  assert.equal(findOemFloorplanSpec("2027", "Jayco", "Seneca Prestige", "37K"), null);
});

test("Audit E 2027 brochure path: Jayco Solstice / Swift / Terrain / Prestige pins", () => {
  const so21l = factsFor("2027", "Jayco", "Solstice", "21L");
  const so21t = factsFor("2027", "Jayco", "Solstice", "21T");
  const so21b = factsFor("2027", "Jayco", "Solstice", "21B");
  assert.equal(so21l.brochure.gvwrLbs, 11000);
  assert.equal(so21t.brochure.gvwrLbs, 11000);
  assert.equal(so21b.brochure.gvwrLbs, null);
  assert.equal(so21l.brochure.uvwLbs, null);
  assert.equal(so21t.brochure.uvwLbs, null);
  assert.equal(findOemGvwrLbs("2027", "Jayco", "Solstice", "20L"), null);
  assert.equal(findOemGvwrLbs("2026", "Jayco", "Solstice", "21L"), null);

  const sw20e = factsFor("2027", "Jayco", "Swift", "20E");
  const sw20t = factsFor("2027", "Jayco", "Swift", "20T");
  const sw20l = factsFor("2027", "Jayco", "Swift", "20L");
  assert.equal(sw20e.brochure.gvwrLbs, 9350);
  assert.equal(sw20t.brochure.gvwrLbs, 9350);
  assert.equal(sw20l.brochure.gvwrLbs, null);
  assert.equal(sw20e.brochure.uvwLbs, null);
  assert.equal(sw20t.brochure.uvwLbs, null);
  assert.equal(findOemGvwrLbs("2026", "Jayco", "Swift", "20E"), null);

  const te19a = factsFor("2027", "Jayco", "Terrain", "19A");
  const te19ag = factsFor("2027", "Jayco", "Terrain", "19AG");
  const te19y = factsFor("2027", "Jayco", "Terrain", "19Y");
  const te19yg = factsFor("2027", "Jayco", "Terrain", "19YG");
  assert.equal(te19a.brochure.gvwrLbs, 9050);
  assert.equal(te19ag.brochure.gvwrLbs, 9050);
  assert.equal(te19y.brochure.gvwrLbs, 9050);
  assert.equal(te19yg.brochure.gvwrLbs, 9050);
  assert.equal(te19a.brochure.uvwLbs, null);
  assert.equal(te19y.brochure.uvwLbs, null);
  assert.equal(findOemGvwrLbs("2026", "Jayco", "Terrain", "19A"), null);

  const pk = factsFor("2027", "Jayco", "Seneca Prestige", "37K");
  const pl = factsFor("2027", "Jayco", "Seneca Prestige", "37L");
  const pm = factsFor("2027", "Jayco", "Seneca Prestige", "37M");
  const p33 = factsFor("2027", "Jayco", "Seneca Prestige", "33J");
  assert.equal(pk.brochure.gvwrLbs, 31000);
  assert.equal(pl.brochure.gvwrLbs, 31000);
  assert.equal(pm.brochure.gvwrLbs, 31000);
  assert.equal(p33.brochure.gvwrLbs, null);
  assert.equal(pk.brochure.uvwLbs, null);
  assert.equal(pl.brochure.uvwLbs, null);
  assert.equal(pm.brochure.uvwLbs, null);
  assert.equal(findOemGvwrLbs("2026", "Jayco", "Seneca Prestige", "37K"), null);

  // #414 Super C / XT unchanged.
  const sc = factsFor("2027", "Jayco", "Seneca Super C", "33J");
  const xt = factsFor("2027", "Jayco", "Seneca XT", "32U");
  assert.equal(sc.brochure.gvwrLbs, 31000);
  assert.equal(xt.brochure.gvwrLbs, null);
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
  assert.equal(zw.snap.freshWater, 79);
  assert.equal(zw.snap.grayWater, 66);
  assert.equal(zw.snap.blackWater, 45);
  assert.equal(zw.snap.fuelCapacityGal, 66.5);
  assert.equal(zw.brochure.freshWater, "79 gal");
  assert.equal(zw.brochure.grayWater, "66 gal");
  assert.equal(zw.brochure.blackWater, "45 gal");
  // 2026 31ZW dry weight / UVW — dealer + spec consensus. OEM brochure omits UVW.
  // Payload (CCC) is GVWR − dry weight. Do not stamp 31ZW5 or other years.
  assert.equal(findOemUvwLbs("2026", "Grand Design", "Lineage Series F", "31ZW"), 18186);
  assert.equal(zw.brochure.uvwLbs, 18186);
  assert.equal(zw.brochure.uvw, "18,186 lbs");
  assert.equal(zw.brochure.uvwEstimated, false);
  assert.equal(zw.brochure.cccLbs, 3814);
  assert.equal(zw.brochure.ccc, "3,814 lbs");
  assert.equal(findOemUvwLbs("2026", "Grand Design", "Lineage Series F", "31ZW5"), null);
  assert.equal(zw5.brochure.uvwLbs, null);
  assert.equal(findOemUvwLbs("2025", "Grand Design", "Lineage Series F", "31ZW"), null);
  assert.equal(findOemUvwLbs("2027", "Grand Design", "Lineage Series F", "31ZW"), null);
  assert.equal(findOemUvwLbs("2026", "Grand Design", "Lineage Series M", "25FW"), null);
});

test("resolution path is shared — no coach-specific Ambassador/Jayco/Thor invent", () => {
  const honesty = src("catalogHonesty.ts");
  const brochure = src("brochureSpecs.ts");
  const reviews = src("rvReviews.ts");
  const videos = src("rvVideos.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const shared = src("sharedSpec.ts");
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
  assert.match(detail, /applySharedSpecToBrochure/);
  assert.match(shared, /resolveSharedSpecSync/);
  assert.doesNotMatch(detail, /No sample notes for this brand/);

  assert.match(
    RV_DATA["Holiday Rambler"]?.Ambassador?.powertrainByYear?.find(
      (b) => b.from <= 2023 && b.to >= 2023,
    )?.engine || "",
    /L9 \/ B6\.7 class/,
  );
});
