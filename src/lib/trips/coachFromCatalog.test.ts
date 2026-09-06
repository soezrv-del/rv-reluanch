import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  anyDimEstimated,
  anyFilledDimEstimated,
  coachIdentityKey,
  coachIsReady,
  dimsFromKnownSources,
  EMPTY_COACH_PROFILE,
  loadLockedProfile,
  profileIsComplete,
  resolveTripsProfileSeed,
  saveLockedProfile,
  type CoachProfile,
  type SuggestCoachFn,
} from "./coachProfile.ts";
import { findOemFloorplanSpec } from "../rv/floorplanSpecs.ts";

const root = dirname(fileURLToPath(import.meta.url));

const stubSuggest: SuggestCoachFn = (opts) => ({
  ...EMPTY_COACH_PROFILE,
  year: opts.year,
  make: opts.make,
  model: opts.model,
  floorplan: opts.floorplan,
  type: opts.rvType || "",
  heightFt: 13,
  lengthFt: 40,
  widthFt: 8.5,
  weightLbs: opts.gvwrLbs || opts.uvwLbs || 10000,
  dimSources: {
    height: "estimate",
    length: "estimate",
    width: "estimate",
    weight: opts.gvwrLbs || opts.uvwLbs ? "facts" : "estimate",
  },
});

function stubStorage() {
  const mem = new Map<string, string>();
  const store = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
  };
  const g = globalThis as { localStorage?: typeof store };
  const prev = g.localStorage;
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: store,
  });
  return {
    restore() {
      if (prev) {
        Object.defineProperty(globalThis, "localStorage", {
          configurable: true,
          value: prev,
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (globalThis as any).localStorage;
      }
    },
  };
}

test("dimsFromKnownSources: brochure pins beat catalog and class heuristic", () => {
  const dims = dimsFromKnownSources({
    type: "Class A Diesel",
    floorplan: "3250",
    oem: {
      overallLengthIn: 37 * 12 + 11,
      exteriorHeightIn: 13 * 12 + 4,
      exteriorWidthIn: 101,
      gvwrLbs: 22000,
    },
    catalog: {
      overallLengthIn: 480,
      exteriorHeightIn: 150,
      gvwrLbs: 30000,
    },
  });
  assert.equal(dims.heightFt, 13.3);
  assert.equal(dims.lengthFt, 37.9);
  assert.equal(dims.widthFt, 8.4);
  assert.equal(dims.weightLbs, 22000);
  assert.equal(dims.dimSources.height, "brochure");
  assert.equal(dims.dimSources.length, "brochure");
  assert.equal(dims.dimSources.width, "brochure");
  assert.equal(dims.dimSources.weight, "brochure");
  assert.equal(anyDimEstimated(dims.dimSources), false);
});

test("dimsFromKnownSources: catalog SoT beats Facts weight; catalog height when no OEM", () => {
  const dims = dimsFromKnownSources({
    type: "Class A Diesel",
    floorplan: "45A",
    catalog: { exteriorHeightIn: 162, overallLengthIn: 540, gvwrLbs: 49900 },
    facts: { gvwrLbs: 52000 },
  });
  assert.equal(dims.heightFt, 13.5);
  assert.equal(dims.lengthFt, 45);
  assert.equal(dims.weightLbs, 49900);
  assert.equal(dims.dimSources.height, "catalog");
  assert.equal(dims.dimSources.length, "catalog");
  assert.equal(dims.dimSources.weight, "catalog");
});

test("dimsFromKnownSources: Facts weight only when brochure/catalog GVWR is missing", () => {
  const dims = dimsFromKnownSources({
    type: "Class A Diesel",
    floorplan: "45A",
    facts: { gvwrLbs: 52000 },
  });
  assert.equal(dims.weightLbs, 52000);
  assert.equal(dims.dimSources.weight, "facts");
  assert.equal(dims.heightFt, 13.5);
  assert.equal(dims.dimSources.height, "estimate");
});

test("dimsFromKnownSources: class heuristic is labeled estimate", () => {
  const dims = dimsFromKnownSources({
    type: "Class A Diesel",
    floorplan: "",
  });
  assert.equal(dims.heightFt, 13.5);
  assert.equal(dims.widthFt, 8.5);
  assert.equal(dims.lengthFt, 0);
  assert.equal(dims.weightLbs, 0);
  assert.equal(dims.dimSources.height, "estimate");
  assert.equal(anyDimEstimated(dims.dimSources), true);
  assert.equal(
    anyFilledDimEstimated({ ...dims, dimSources: dims.dimSources }),
    true,
  );
});

test("dimsFromKnownSources: unknown type and dummy ranges invent nothing", () => {
  const dims = dimsFromKnownSources({
    type: "RV (custom entry)",
    floorplan: "",
    lengthRange: [20, 45],
    weightRange: [5000, 45000],
  });
  assert.equal(dims.heightFt, 0);
  assert.equal(dims.widthFt, 0);
  assert.equal(dims.lengthFt, 0);
  assert.equal(dims.weightLbs, 0);
  assert.equal(
    anyFilledDimEstimated({ ...dims, dimSources: dims.dimSources }),
    false,
  );
});

test("dimsFromKnownSources: floorplan length code is estimate; no range midpoint", () => {
  const dims = dimsFromKnownSources({
    type: "Class A Diesel",
    floorplan: "37BH",
    make: "Tiffin",
    model: "Phaeton",
    lengthRange: [34, 40],
    weightRange: [28000, 36000],
  });
  assert.equal(dims.lengthFt, 37);
  assert.equal(dims.dimSources.length, "estimate");
  assert.ok(dims.weightLbs > 0);
  assert.equal(dims.dimSources.weight, "estimate");

  const noCode = dimsFromKnownSources({
    type: "Class A Diesel",
    floorplan: "LXE",
    lengthRange: [34, 40],
    weightRange: [28000, 36000],
  });
  assert.equal(noCode.lengthFt, 0);
  assert.equal(noCode.weightLbs, 0);
});

test("brochure OEM for Brinkley Model T 3250 is used, not invented", () => {
  const oem = findOemFloorplanSpec("2024", "Brinkley", "Model T", "3250");
  assert.ok(oem, "OEM row must exist — do not invent specs in the test");
  const dims = dimsFromKnownSources({
    type: "Fifth Wheel",
    floorplan: "3250",
    make: "Brinkley",
    model: "Model T",
    oem,
  });
  assert.equal(dims.heightFt, 13.3);
  assert.equal(dims.lengthFt, 37.9);
  assert.equal(dims.weightLbs, 22000);
  assert.equal(dims.dimSources.height, "brochure");
  assert.equal(dims.dimSources.length, "brochure");
  assert.equal(dims.dimSources.weight, "brochure");
  const p: CoachProfile = {
    ...EMPTY_COACH_PROFILE,
    year: "2024",
    make: "Brinkley",
    model: "Model T",
    floorplan: "3250",
    ...dims,
  };
  assert.equal(coachIsReady(p), true);
  assert.equal(profileIsComplete(p), true);
});

test("profile lock does not require floorplan when dims are known", () => {
  const p = {
    ...EMPTY_COACH_PROFILE,
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "",
    heightFt: 13.5,
    lengthFt: 45,
    weightLbs: 52000,
  };
  assert.equal(profileIsComplete(p), true);
  assert.equal(coachIsReady(p), true);
  assert.equal(coachIsReady(EMPTY_COACH_PROFILE), false);
});

test("resolveTripsProfileSeed: locked > Facts > saved; empty invents nothing", () => {
  const facts = {
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
    gvwrLbs: 52000,
    rvType: "Class A Diesel",
  };
  const saved = {
    year: "2022",
    make: "Keystone",
    model: "Montana",
    floorplan: "3855BR",
    rvType: "Fifth Wheel",
  };
  const locked = {
    ...EMPTY_COACH_PROFILE,
    year: "2021",
    make: "Tiffin",
    model: "Phaeton",
    floorplan: "37BH",
    heightFt: 12.8,
    lengthFt: 37,
    weightLbs: 34000,
    locked: true,
  };

  assert.equal(resolveTripsProfileSeed({}, stubSuggest), null);
  assert.equal(
    resolveTripsProfileSeed({ activeCoach: null, savedCoach: null }, stubSuggest),
    null,
  );

  const fromFacts = resolveTripsProfileSeed(
    { activeCoach: facts, savedCoach: saved },
    stubSuggest,
  );
  assert.ok(fromFacts);
  assert.equal(fromFacts.source, "facts");
  assert.equal(fromFacts.profile.make, "American Coach");
  assert.equal(fromFacts.profile.model, "American Dream");
  assert.equal(fromFacts.profile.floorplan, "45A");
  assert.equal(fromFacts.profile.weightLbs, 52000);
  assert.equal(fromFacts.profile.dimSources?.weight, "facts");

  const fromSaved = resolveTripsProfileSeed({ savedCoach: saved }, stubSuggest);
  assert.ok(fromSaved);
  assert.equal(fromSaved.source, "saved");
  assert.equal(fromSaved.profile.make, "Keystone");
  assert.equal(fromSaved.profile.model, "Montana");

  const fromLocked = resolveTripsProfileSeed(
    {
      locked,
      activeCoach: facts,
      savedCoach: saved,
    },
    stubSuggest,
  );
  assert.ok(fromLocked);
  assert.equal(fromLocked.source, "locked");
  assert.equal(fromLocked.profile.make, "Tiffin");
  assert.equal(fromLocked.profile.lengthFt, 37);
  assert.equal(fromLocked.profile.weightLbs, 34000);
});

test("coachFromCatalog: custom spec ranges are not treated as catalog SoT", () => {
  const src = readFileSync(join(root, "coachFromCatalog.ts"), "utf8");
  assert.match(src, /const catalogSpec = getSpec/);
  assert.match(src, /lengthRange: catalogSpec\?\.lengthRange/);
  assert.match(src, /weightRange: catalogSpec\?\.weightRange/);
  assert.match(src, /catalog: catalogSpec/);
  assert.doesNotMatch(
    src,
    /lengthRange: spec\.lengthRange/,
    "dummy buildCustomSpec [20,45] must not feed length",
  );
});

test("Trips Navigate no longer forces SET PROFILE when a coach is known", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /resolveTripsProfileSeed/);
  assert.match(ui, /readActiveCoach/);
  assert.match(ui, /loadLatestSavedUnit/);
  assert.match(ui, /FROM FACTS/);
  assert.match(ui, /Add an RV profile\?/);
  assert.doesNotMatch(ui, /SET PROFILE/);
  assert.doesNotMatch(ui, /Set your RV profile first/);
  assert.ok(
    ui.indexOf("Add an RV profile?") > ui.indexOf("Start Turn-by-Turn"),
    "unknown-coach prompt stays after a route, not a gate",
  );
});

test("Profile labels brochure/catalog/estimate; Pack is sample-opt-in", () => {
  const ui = readFileSync(
    join(root, "../../components/rvtrips/RvTripsApp.tsx"),
    "utf8",
  );
  assert.match(ui, /dimSourceTag/);
  assert.match(ui, /["']catalog["']/);
  assert.match(ui, /["']brochure["']/);
  assert.match(ui, /["']estimate["']/);
  assert.match(ui, /SAMPLE_PACK/);
  assert.match(ui, /showSamplePack/);
  assert.match(ui, /Sample list — not your gear/);
  assert.match(ui, /label: "Pack"/);
  assert.doesNotMatch(ui, /Pack List/);
  assert.doesNotMatch(ui, /DEMO_PACK/);
  assert.doesNotMatch(ui, /useState\(DEMO_PACK\)/);
  assert.match(ui, /rank: "primary"/);
  assert.match(ui, /rank: "tool"/);
});

test("loadLockedProfile keeps a coach without floorplan", () => {
  const { restore } = stubStorage();
  try {
    saveLockedProfile({
      ...EMPTY_COACH_PROFILE,
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "",
      heightFt: 13.5,
      lengthFt: 45,
      weightLbs: 52000,
    });
    const loaded = loadLockedProfile();
    assert.ok(loaded);
    assert.equal(loaded.make, "American Coach");
    assert.equal(loaded.floorplan, "");
    assert.equal(loaded.locked, true);
    assert.equal(coachIdentityKey(loaded), "2023|American Coach|American Dream|");
  } finally {
    restore();
  }
});
