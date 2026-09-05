import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  anyDimEstimated,
  coachIdentityKey,
  coachIsReady,
  dimsFromKnownSources,
  EMPTY_COACH_PROFILE,
  loadLockedProfile,
  profileIsComplete,
  resolveTripsProfileSeed,
  saveLockedProfile,
  suggestCoachFromSelection,
} from "./coachFromCatalog.ts";
import { findOemFloorplanSpec } from "../rv/floorplanSpecs.ts";

const root = dirname(fileURLToPath(import.meta.url));

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
    store,
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

test("dimsFromKnownSources: Facts GVWR wins weight; catalog height when no OEM", () => {
  const dims = dimsFromKnownSources({
    type: "Class A Diesel",
    floorplan: "45A",
    catalog: { exteriorHeightIn: 162, overallLengthIn: 540, gvwrLbs: 49900 },
    facts: { gvwrLbs: 52000 },
  });
  assert.equal(dims.heightFt, 13.5);
  assert.equal(dims.lengthFt, 45);
  assert.equal(dims.weightLbs, 52000);
  assert.equal(dims.dimSources.height, "catalog");
  assert.equal(dims.dimSources.length, "catalog");
  assert.equal(dims.dimSources.weight, "facts");
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
});

test("suggestCoachFromSelection uses brochure OEM for Brinkley Model T 3250", () => {
  const oem = findOemFloorplanSpec("2024", "Brinkley", "Model T", "3250");
  assert.ok(oem, "OEM row must exist — do not invent specs in the test");
  const p = suggestCoachFromSelection({
    year: "2024",
    make: "Brinkley",
    model: "Model T",
    floorplan: "3250",
  });
  assert.equal(p.year, "2024");
  assert.equal(p.make, "Brinkley");
  assert.equal(p.model, "Model T");
  assert.equal(p.floorplan, "3250");
  assert.equal(p.heightFt, 13.3);
  assert.equal(p.lengthFt, 37.9);
  assert.equal(p.weightLbs, 22000);
  assert.equal(p.dimSources?.height, "brochure");
  assert.equal(p.dimSources?.length, "brochure");
  assert.equal(p.dimSources?.weight, "brochure");
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

  assert.equal(resolveTripsProfileSeed({}), null);
  assert.equal(
    resolveTripsProfileSeed({ activeCoach: null, savedCoach: null }),
    null,
  );

  const fromFacts = resolveTripsProfileSeed({ activeCoach: facts, savedCoach: saved });
  assert.ok(fromFacts);
  assert.equal(fromFacts.source, "facts");
  assert.equal(fromFacts.profile.make, "American Coach");
  assert.equal(fromFacts.profile.model, "American Dream");
  assert.equal(fromFacts.profile.floorplan, "45A");
  assert.equal(fromFacts.profile.weightLbs, 52000);
  assert.equal(fromFacts.profile.dimSources?.weight, "facts");

  const fromSaved = resolveTripsProfileSeed({ savedCoach: saved });
  assert.ok(fromSaved);
  assert.equal(fromSaved.source, "saved");
  assert.equal(fromSaved.profile.make, "Keystone");
  assert.equal(fromSaved.profile.model, "Montana");

  const fromLocked = resolveTripsProfileSeed({
    locked,
    activeCoach: facts,
    savedCoach: saved,
  });
  assert.ok(fromLocked);
  assert.equal(fromLocked.source, "locked");
  assert.equal(fromLocked.profile.make, "Tiffin");
  assert.equal(fromLocked.profile.lengthFt, 37);
  assert.equal(fromLocked.profile.weightLbs, 34000);
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
