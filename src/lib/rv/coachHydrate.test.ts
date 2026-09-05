/**
 * Shared coach rehydrate: stale saved snapshot missing torqueLbFt
 * must pick up live catalog SoT for BOTH Facts Powertrain and Share POWER.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { buildBrochureSpecs } from "./brochureSpecs.ts";
import { formatFactsTorque } from "./catalogHonesty.ts";
import { sharePowerLines } from "./shareCardPolicy.ts";
import {
  hydrateSavedCoachList,
  hydrateShareCoachResult,
} from "./shareCoachHydrate.ts";
import type { RVSpec } from "./rvTypes.ts";

const root = dirname(fileURLToPath(import.meta.url));

function georgetownShapedSpec(opts: { torqueOnBand: boolean }): RVSpec {
  return {
    type: "Class A Gas",
    floorplans: ["328DS"],
    lengthRange: [32, 37],
    weightRange: [16000, 22000],
    slideouts: 2,
    sleeps: 8,
    msrpRange: [139000, 229000],
    engine: "Ford 7.3L / V10 (by year)",
    horsepower: 350,
    chassis: "Ford F53",
    fuelType: "Gas",
    recalls: 0,
    rating: 4.3,
    image: "",
    powertrainByYear: [
      {
        from: 2020,
        to: 2026,
        engine: "Ford 7.3L V8 Godzilla",
        horsepower: 350,
        chassis: "Ford F53",
        ...(opts.torqueOnBand ? { torqueLbFt: 468 } : {}),
      },
    ],
  };
}

function factsAndShareFromCoach(result: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  data: RVSpec;
}) {
  const brochure = buildBrochureSpecs(
    result.data,
    result.year,
    result.make,
    result.model,
    result.floorplan || "",
  );
  const factsTorque = formatFactsTorque({
    engine: brochure.engine,
    torqueLbFt: brochure.torque,
  });
  return {
    brochure,
    factsTorque,
    sharePower: sharePowerLines(brochure.horsepower, brochure.torque),
  };
}

test("stale saved snapshot missing torqueLbFt → Facts + Share both get 468 from live SoT", () => {
  const stale = georgetownShapedSpec({ torqueOnBand: false });
  const live = georgetownShapedSpec({ torqueOnBand: true });
  const saved = {
    year: "2022",
    make: "Forest River",
    model: "Georgetown",
    floorplan: "328DS",
    data: stale,
  };

  const before = factsAndShareFromCoach(saved);
  assert.equal(before.factsTorque, "—");
  assert.match(before.sharePower.join("\n"), /350\s*HP/);
  assert.doesNotMatch(before.sharePower.join("\n"), /468/);
  assert.doesNotMatch(before.sharePower.join("\n"), /lb-?ft/i);

  const hydrated = hydrateShareCoachResult(
    saved,
    (make, model) =>
      make === "Forest River" && model === "Georgetown" ? live : null,
  );
  assert.equal(hydrated.year, "2022");
  assert.equal(hydrated.make, "Forest River");
  assert.equal(hydrated.model, "Georgetown");
  assert.equal(hydrated.floorplan, "328DS");
  assert.equal(hydrated.data, live);
  assert.notEqual(hydrated.data, stale);

  const after = factsAndShareFromCoach(hydrated);
  assert.equal(after.factsTorque, "468 lb-ft");
  assert.equal(after.brochure.horsepower, "350 HP");
  assert.equal(after.brochure.torque, "468 lb-ft");
  assert.deepEqual(after.sharePower, ["POWER", "350 HP", "468 lb-ft"]);
});

test("saved list rehydrate merges live torque onto each in-memory coach", () => {
  const stale = georgetownShapedSpec({ torqueOnBand: false });
  const live = georgetownShapedSpec({ torqueOnBand: true });
  const units = [
    {
      year: "2022",
      make: "Forest River",
      model: "Georgetown",
      floorplan: "328DS",
      data: stale,
    },
  ];
  const hydrated = hydrateSavedCoachList(
    units,
    (make, model) =>
      make === "Forest River" && model === "Georgetown" ? live : null,
  );
  const after = factsAndShareFromCoach(hydrated[0]!);
  assert.equal(after.factsTorque, "468 lb-ft");
  assert.deepEqual(after.sharePower, ["POWER", "350 HP", "468 lb-ft"]);
});

test("missing live catalog SoT does not invent torque on Facts or Share", () => {
  const stale = georgetownShapedSpec({ torqueOnBand: false });
  const saved = {
    year: "2021",
    make: "Homebuilt",
    model: "One-Off",
    floorplan: "Custom",
    data: stale,
  };
  const hydrated = hydrateShareCoachResult(saved, () => null);
  assert.equal(hydrated.data, stale);
  assert.equal(hydrated.year, "2021");
  assert.equal(hydrated.floorplan, "Custom");

  const after = factsAndShareFromCoach(hydrated);
  assert.equal(after.factsTorque, "—");
  assert.match(after.sharePower.join("\n"), /350\s*HP/);
  assert.doesNotMatch(after.sharePower.join("\n"), /468/);
  assert.doesNotMatch(after.sharePower.join("\n"), /lb-?ft/i);
});

test("Facts + Share bind the shared hydrate on saved-coach open / load", () => {
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  const kit = readFileSync(join(root, "shareKit.ts"), "utf8");
  const hydrate = readFileSync(join(root, "shareCoachHydrate.ts"), "utf8");

  assert.match(hydrate, /Shared coach rehydrate \(Facts \+ Share\)/);
  assert.match(hydrate, /export function hydrateSavedCoachList/);
  assert.match(kit, /hydrateSavedCoachList\(parsed as RVResult\[\]\)/);
  assert.match(fax, /loadSavedUnits\(\)/);
  assert.match(fax, /setDetail\(hydrateShareCoachResult\(r\)\)/);
  assert.match(detail, /hydrateShareCoachResult\(result\)/);
  assert.match(detail, /useCatalogReady/);
});
