import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { planFactsDossierResearch } from "./factsDossierGapPlan.ts";
import {
  FACTS_DETAIL_SPIN_FIELDS,
  factsDetailFieldSearching,
  factsDetailSearchingFields,
} from "./factsDetailGapSpinners.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("spinner fields stay the three David named — GVWR, HP, torque", () => {
  assert.deepEqual([...FACTS_DETAIL_SPIN_FIELDS], [
    "gvwr",
    "horsepower",
    "torque",
  ]);
});

test("no spinner when live is idle or catalog pins skip browse", () => {
  assert.equal(
    factsDetailSearchingFields({
      liveLoading: false,
      skipLive: false,
      gaps: ["gvwr", "horsepower", "torque"],
    }).size,
    0,
  );
  assert.equal(
    factsDetailSearchingFields({
      liveLoading: true,
      skipLive: true,
      gaps: [],
    }).size,
    0,
  );
});

test("only gapped named fields spin while live fetch is in flight", () => {
  const searching = factsDetailSearchingFields({
    liveLoading: true,
    skipLive: false,
    gaps: ["horsepower", "tanks", "length"],
  });
  assert.deepEqual([...searching], ["horsepower"]);
  assert.equal(factsDetailFieldSearching("horsepower", searching, "—"), true);
  assert.equal(factsDetailFieldSearching("horsepower", searching, ""), true);
  assert.equal(
    factsDetailFieldSearching("horsepower", searching, "Confirm brochure"),
    true,
  );
  assert.equal(
    factsDetailFieldSearching("horsepower", searching, "380 HP"),
    false,
    "peek / pin already painted stays static",
  );
  assert.equal(factsDetailFieldSearching("torque", searching, "—"), false);
  assert.equal(factsDetailFieldSearching("gvwr", searching, "—"), false);
});

test("gap planner + spinner share one catalog-first plan", () => {
  const gapped = planFactsDossierResearch({
    year: "1999",
    make: "NoSuchCoach",
    model: "GapSpinner",
    pins: {
      engine: null,
      horsepower: null,
      torqueLbFt: null,
      chassis: null,
      transmission: null,
      fuelType: null,
      gvwrLbs: null,
      uvwLbs: null,
      lengthFt: null,
      freshWaterGal: null,
      grayWaterGal: null,
      blackWaterGal: null,
      rvType: null,
      sourcesNote: null,
    },
  });
  assert.equal(gapped.skipLive, false);
  assert.ok(gapped.gaps.includes("horsepower"));
  assert.ok(gapped.gaps.includes("torque"));
  assert.ok(gapped.gaps.includes("gvwr"));
  const searching = factsDetailSearchingFields({
    liveLoading: true,
    skipLive: gapped.skipLive,
    gaps: gapped.gaps,
  });
  assert.ok(searching.has("horsepower"));
  assert.ok(searching.has("torque"));
  assert.ok(searching.has("gvwr"));

  const complete = planFactsDossierResearch({
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    candidate: {
      engine: "Cummins X15 605HP",
      horsepower: 605,
      torque: "1950 lb-ft",
      chassis: "Spartan K3",
      transmission: "Allison 4000 MH",
      fuelType: "Diesel",
      type: "Class A Diesel",
      lengthFt: `44' 11"`,
      gvwr: "54,000 lbs",
      gvwrLbs: 54000,
      uvw: "42,000 lbs",
      uvwLbs: 42000,
      uvwEstimated: false,
      freshWater: "100 gal",
      grayWater: "75 gal",
      blackWater: "50 gal",
    },
  });
  assert.equal(complete.skipLive, true);
  assert.equal(
    factsDetailSearchingFields({
      liveLoading: true,
      skipLive: complete.skipLive,
      gaps: complete.gaps,
    }).size,
    0,
    "complete pins: soft pass may still run; named hardware stays static",
  );
});

test("Facts detail wires planner + spinner; does not pull research sidecar", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  const styles = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.match(detail, /planFactsDossierResearch/);
  assert.match(detail, /factsDetailSearchingFields/);
  assert.match(detail, /factsDetailFieldSearching/);
  assert.match(detail, /from "@\/lib\/rv\/factsDossierGapPlan"/);
  assert.match(detail, /from "@\/lib\/rv\/factsDetailGapSpinners"/);
  assert.match(detail, /facts-gap-spinner/);
  assert.match(detail, /searching=\{factsDetailFieldSearching\(\s*"horsepower"/);
  assert.match(detail, /searching=\{factsDetailFieldSearching\(\s*"torque"/);
  assert.match(detail, /searching=\{factsDetailFieldSearching\(\s*"gvwr"/);
  assert.match(
    detail,
    /\{shown\}\s*\{searching \? <FactsGapSpinner field=\{label\} \/> : null\}/,
    "SpecRow keeps — / catalog value beside the wheel, never replaces it",
  );
  assert.doesNotMatch(
    detail,
    /searching \? <FactsGapSpinner field=\{label\} \/> : shown/,
  );
  assert.match(
    detail,
    /placeholder=\{published\}/,
    "GVWR empty box keeps — while the wheel spins beside it",
  );
  assert.doesNotMatch(detail, /placeholder=\{searching \? "" : published\}/);
  assert.doesNotMatch(
    detail,
    /\{liveLoading \?\s*\(/,
    "no full-page / section loader gated on LIVE_DOSSIER",
  );
  assert.doesNotMatch(detail, /if \(liveLoading\) return/);
  assert.doesNotMatch(detail, /liveLoading \|\| /);
  assert.match(
    detail,
    /Phase 3\.4: do NOT clear year-band catalog paint/,
    "catalog brochure stays on screen while gap browse runs",
  );
  assert.doesNotMatch(detail, /from "@\/lib\/rv\/factsDossierResearch"/);
  assert.doesNotMatch(
    styles,
    /\.facts-gap-spinner[\s\S]{0,240}--color-blue/,
    "spinner must stay muted steel / soft electric-blue, not loud primary blue",
  );
  assert.match(styles, /\.facts-gap-spinner/);
  assert.match(styles, /prefers-reduced-motion/);
});
