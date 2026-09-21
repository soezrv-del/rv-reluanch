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
  resolveYearSnapshot,
} from "./brochureSpecs.ts";
import {
  honestEngineLabel,
  honestHorsepowerLabel,
  honestTorqueLabel,
  isExactEnginePin,
  isUnpinnedEngineLabel,
} from "./catalogHonesty.ts";
import { ensureCatalogLoaded, peekCatalog } from "./catalogLoad.ts";
import { getSpec } from "./catalog.ts";
import { getMockReviews, reviewMentionsModel } from "./rvReviews.ts";
import { rankRvVideos } from "./rvVideos.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

await ensureCatalogLoaded();

function factsFor(
  year: string,
  make: string,
  model: string,
  floorplan: string,
) {
  const spec = getSpec(make, model);
  assert.ok(spec, `expected catalog spec for ${make} ${model}`);
  return {
    spec,
    snap: resolveYearSnapshot(spec, year, floorplan),
    brochure: buildBrochureSpecs(spec, year, make, model, floorplan),
  };
}

test("shared helpers: dual-family / class / by-year labels are unpinned", () => {
  assert.equal(isUnpinnedEngineLabel("Cummins L9 / B6.7 class"), true);
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

test("2023 Holiday Rambler Ambassador 40B: thin pin → GAP, not class blends", () => {
  const { snap, brochure } = factsFor(
    "2023",
    "Holiday Rambler",
    "Ambassador",
    "40B",
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

test("resolution path is shared — no coach-specific Ambassador/Jayco/Thor invent", () => {
  const honesty = src("catalogHonesty.ts");
  const brochure = src("brochureSpecs.ts");
  const reviews = src("rvReviews.ts");
  const videos = src("rvVideos.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");
  const api = src("../../routes/api/rv-videos.ts");

  assert.match(honesty, /export function isUnpinnedEngineLabel/);
  assert.match(honesty, /export function isExactEnginePin/);
  assert.match(brochure, /isExactEnginePin/);
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

  const catalog = peekCatalog()?.RV_DATA;
  assert.ok(catalog);
  assert.match(
    catalog["Holiday Rambler"]?.Ambassador?.powertrainByYear?.find(
      (b) => b.from <= 2023 && b.to >= 2023,
    )?.engine || "",
    /L9 \/ B6\.7 class/,
  );
});
