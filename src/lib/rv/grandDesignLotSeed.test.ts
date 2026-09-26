import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";
import { installCatalog } from "./catalogLoad.ts";
import { buildBrochureSpecs, CONFIRM_BROCHURE } from "./brochureSpecs.ts";
import { buildFactsBrochureSpecs } from "./factsSheet.ts";
import { GRAND_DESIGN_LOT_SEED } from "./grandDesignLotSeed.ts";
import { fillBrochureHolesFromLot } from "./lotCatalogFill.ts";
import { LOT_FACTS_SOURCE } from "./lotFactsFallback.ts";
import { getLotCatalogUnits } from "./lotCatalogUnits.ts";
import { findLocalSpecOverride } from "./localSpecOverrides.ts";
import { findPowertrainCorrection, POWERTRAIN_CORRECTIONS } from "./powertrainCorrections.ts";
import type { RVSpec } from "./rvTypes.ts";
import { findWeightOverride } from "./weightOverrides.ts";
import { resolveFactsBrochure } from "../rvgrok/factsBrochure.ts";

const root = dirname(fileURLToPath(import.meta.url));
const FLOORPLAN_SPECS_SHA256 = "1e76f60bd11994000bcbfde616b71f3f800fdecd52a896f316ea87af323387dc";

const catalog = await loadLiveCatalog();
installCatalog({ RV_DATA: catalog.RV_DATA, MAKES: catalog.MAKES });
const gd = catalog.RV_DATA["Grand Design"] as Record<string, RVSpec>;

function row(year: number, model: string, trim: string) {
  return GRAND_DESIGN_LOT_SEED.find((r) => r.year === year && r.model === model && r.trim === trim);
}

test("floorplanSpecs.ts is unchanged by the Imagine lot-record pilot", () => {
  const hash = createHash("sha256")
    .update(readFileSync(join(root, "floorplanSpecs.ts")))
    .digest("hex");
  assert.equal(hash, FLOORPLAN_SPECS_SHA256);
  assert.doesNotMatch(readFileSync(join(root, "grandDesignLotSeed.ts"), "utf8"), /floorplanSpecs/);
});

test("Imagine lot seed is one record per year + model + floorplan, tagged as a lot record", () => {
  assert.equal(GRAND_DESIGN_LOT_SEED.length, 31);
  const keys = GRAND_DESIGN_LOT_SEED.map((r) => `${r.year}|${r.model}|${r.trim}`);
  assert.equal(new Set(keys).size, keys.length);
  let filled = 0;
  for (const r of GRAND_DESIGN_LOT_SEED) {
    assert.equal(r.make, "Grand Design");
    assert.ok(r.model.startsWith("Imagine"));
    assert.equal(r.source, "RV Country lot unit record");
    assert.match(r.sourceNote, /public\/inventory\/own-lot-latest\.json/);
    assert.match(r.sourceNote, /2026-09-25/);
    assert.match(r.sourceNote, /id \d+/);
    assert.match(r.sourceNote, /stock /);
    for (const n of [
      r.gvwr,
      r.dry_weight,
      r.hitch_weight,
      r.payload,
      r.vehicle_body_length,
      r.total_fresh_water_tank_capacity,
      r.total_gray_water_tank_capacity,
      r.total_black_water_tank_capacity,
      r.propane_lbs,
      r.max_sleeping_count,
      r.number_of_slideouts,
    ]) {
      if (n != null) filled += 1;
    }
  }
  assert.equal(filled, 249);
  const multi = row(2026, "Imagine", "2700BS");
  assert.ok(multi);
  assert.match(multi.stock_number, /46146/);
  assert.match(multi.stock_number, /46149/);
  assert.match(multi.stock_number, /47183/);
  assert.match(multi.sourceNote, /46146/);
  assert.match(multi.sourceNote, /46149/);
  assert.match(multi.sourceNote, /47183/);
});

test("every Imagine fill still matches the 2026-09-25 lot row it cites", () => {
  const lot = JSON.parse(
    readFileSync(join(root, "../../../public/inventory/own-lot-latest.json"), "utf8"),
  ) as Array<Record<string, unknown>>;
  const byId = new Map(lot.map((unit) => [String(unit.id), unit]));
  const fields = [
    "gvwr",
    "dry_weight",
    "hitch_weight",
    "payload",
    "vehicle_body_length",
    "propane_lbs",
    "total_fresh_water_tank_capacity",
    "total_gray_water_tank_capacity",
    "total_black_water_tank_capacity",
    "max_sleeping_count",
    "number_of_slideouts",
  ] as const;
  for (const seeded of GRAND_DESIGN_LOT_SEED) {
    const cites = [...seeded.sourceNote.matchAll(/id (\d+) \/ stock (\S+?)(?=;| ·|$)/g)];
    assert.ok(cites.length > 0, seeded.title);
    for (const cite of cites) {
      const unit = byId.get(cite[1]!);
      assert.ok(unit, `${seeded.title} missing id ${cite[1]}`);
      assert.equal(String(unit.stock_number), cite[2], seeded.title);
      assert.equal(unit.year, seeded.year, seeded.title);
      assert.equal(unit.model, seeded.model, seeded.title);
      assert.equal(unit.trim, seeded.trim, seeded.title);
      assert.match(String(unit.scraped_at), /^2026-09-25/, seeded.title);
      for (const field of fields) {
        const stored = seeded[field];
        if (stored == null) continue;
        assert.equal(Number(unit[field]), stored, `${seeded.title} ${field}`);
      }
    }
  }
});

test("2019 Imagine 2800BH lot numbers paint holes on Facts and on the Grok desk", () => {
  const spec = gd.Imagine!;
  const before = buildBrochureSpecs(spec, "2019", "Grand Design", "Imagine", "2800BH");
  assert.equal(before.gvwr, CONFIRM_BROCHURE);
  assert.equal(before.propane, CONFIRM_BROCHURE);
  assert.notEqual(before.dataSource, "oem-year");

  const facts = buildFactsBrochureSpecs(spec, "2019", "Grand Design", "Imagine", "2800BH");
  assert.equal(facts.gvwrLbs, 7995);
  assert.equal(facts.uvwLbs, 6195);
  assert.match(facts.hitchOrPin, /604/);
  assert.equal(facts.propane, "40 lb");
  assert.match(facts.lengthFt, /32'/);
  assert.match(facts.accuracyNote, new RegExp(LOT_FACTS_SOURCE));
  assert.equal(facts.dataSource, before.dataSource);
  assert.doesNotMatch(facts.accuracyNote, /Year-true OEM/);

  const desk = resolveFactsBrochure({
    year: "2019",
    make: "Grand Design",
    model: "Imagine",
    floorplan: "2800BH",
  });
  assert.ok(desk);
  assert.equal(desk.gvwrLbs, 7995);
  assert.match(desk.accuracyNote, new RegExp(LOT_FACTS_SOURCE));
  assert.equal(desk.dataSource, facts.dataSource);
});

test("2026 Imagine 2500RL and 2800BH keep lot numbers after the own-lot file merges", () => {
  const lot = JSON.parse(
    readFileSync(join(root, "../../../public/inventory/own-lot-latest.json"), "utf8"),
  ) as Array<Record<string, unknown>>;
  const units = [...getLotCatalogUnits(), ...lot];
  const spec = gd.Imagine!;

  const rlBefore = buildBrochureSpecs(spec, "2026", "Grand Design", "Imagine", "2500RL");
  const rl = fillBrochureHolesFromLot(
    rlBefore,
    units,
    2026,
    "Grand Design",
    "Imagine",
    "2500RL",
  );
  assert.equal(rl.specs.gvwrLbs, 7850);
  assert.match(rl.specs.gvwr, /7,850/);
  assert.equal(rl.specs.uvwLbs, 6623);
  assert.match(rl.specs.uvw, /6,623/);
  assert.match(rl.specs.hitchOrPin, /581/);
  assert.equal(rl.specs.sleeps, "6");
  assert.match(rl.specs.accuracyNote, new RegExp(LOT_FACTS_SOURCE));
  assert.equal(rl.specs.dataSource, rlBefore.dataSource);

  const bhBefore = buildBrochureSpecs(spec, "2026", "Grand Design", "Imagine", "2800BH");
  const bh = fillBrochureHolesFromLot(
    bhBefore,
    units,
    2026,
    "Grand Design",
    "Imagine",
    "2800BH",
  );
  assert.equal(bh.specs.gvwrLbs, 8495);
  assert.match(bh.specs.gvwr, /8,495/);
  assert.equal(bh.specs.uvwLbs, 6386);
  assert.match(bh.specs.uvw, /6,386/);
  assert.match(bh.specs.hitchOrPin, /604/);
  assert.match(bh.specs.freshWater, /52/);
  assert.match(bh.specs.accuracyNote, new RegExp(LOT_FACTS_SOURCE));
  assert.equal(bh.specs.dataSource, bhBefore.dataSource);
});

test("flagged lot value overrides the OEM pin on 2026 Imagine 2800BH only", () => {
  const seeded = row(2026, "Imagine", "2800BH");
  assert.ok(seeded);
  assert.equal(seeded.overridesCatalog?.gvwr, true);
  assert.equal(seeded.gvwr, 8495);
  assert.match(seeded.sourceNote, /id 38275 \/ stock 45788/);
  assert.match(seeded.sourceNote, /2026-09-25/);
  assert.match(
    seeded.sourceNote,
    /8,495 lb replaces 10,195 lb \(OEM: Grand Design Imagine 2800BH product page\)/,
  );

  const spec = gd.Imagine!;
  const before = buildBrochureSpecs(spec, "2026", "Grand Design", "Imagine", "2800BH");
  assert.equal(before.gvwrLbs, 10195);
  assert.equal(before.propane, "40 lb");
  const merged = fillBrochureHolesFromLot(
    before,
    [seeded],
    2026,
    "Grand Design",
    "Imagine",
    "2800BH",
  );
  assert.equal(merged.specs.gvwrLbs, 8495);
  assert.match(merged.specs.gvwr, /8,495/);
  assert.ok(merged.filled.includes("GVWR"));
  assert.equal(merged.specs.propane, "40 lb");
  assert.ok(!merged.filled.includes("PROPANE"));
  assert.equal(merged.specs.dataSource, before.dataSource);
  assert.match(merged.specs.accuracyNote, new RegExp(LOT_FACTS_SOURCE));

  const other = buildBrochureSpecs(spec, "2026", "Grand Design", "Imagine", "2500RL");
  const otherMerged = fillBrochureHolesFromLot(
    other,
    [seeded],
    2026,
    "Grand Design",
    "Imagine",
    "2500RL",
  );
  assert.equal(otherMerged.specs.gvwrLbs, other.gvwrLbs);
  assert.ok(!otherMerged.filled.includes("GVWR"));
});

test("override files do not cover Imagine 2800BH, and a sheet that already has the number is not rewritten", () => {
  assert.equal(findWeightOverride(2019, "Grand Design", "Imagine", "2800BH"), null);
  assert.equal(findLocalSpecOverride(2019, "Grand Design", "Imagine", "2800BH"), null);
  assert.equal(findPowertrainCorrection(2019, "Grand Design", "Imagine", "2800BH"), null);
  assert.equal(
    POWERTRAIN_CORRECTIONS.some(
      (c) => c.makeIncludes.includes("grand design") && c.modelIncludes.includes("imagine"),
    ),
    false,
  );
  assert.doesNotMatch(readFileSync(join(root, "weightOverrides.ts"), "utf8"), /Grand Design/);
  assert.doesNotMatch(readFileSync(join(root, "localSpecOverrides.ts"), "utf8"), /Grand Design/);

  const spec = gd.Imagine!;
  const sheet = buildBrochureSpecs(spec, "2019", "Grand Design", "Imagine", "2800BH");
  sheet.gvwr = "7,995 lbs";
  sheet.gvwrLbs = 7995;
  const same = fillBrochureHolesFromLot(
    sheet,
    getLotCatalogUnits(),
    2019,
    "Grand Design",
    "Imagine",
    "2800BH",
  );
  assert.equal(same.specs.gvwrLbs, 7995);
  assert.ok(!same.filled.includes("GVWR"));

  const other = buildBrochureSpecs(spec, "2019", "Grand Design", "Imagine", "2800BH");
  other.gvwr = "8,995 lbs";
  other.gvwrLbs = 8995;
  const gap = fillBrochureHolesFromLot(
    other,
    getLotCatalogUnits(),
    2019,
    "Grand Design",
    "Imagine",
    "2800BH",
  );
  assert.equal(gap.specs.gvwrLbs, 8995);
  assert.ok(!gap.filled.includes("GVWR"));
});

test("flagged lot gray overrides the series seed on 2019 Imagine 2800BH", () => {
  const seeded = row(2019, "Imagine", "2800BH");
  assert.ok(seeded);
  assert.equal(seeded.total_gray_water_tank_capacity, 76);
  assert.equal(seeded.overridesCatalog?.total_gray_water_tank_capacity, true);
  assert.match(seeded.sourceNote, /Gray 76 gal replaces 39 gal \(rvData series seed\)/);

  const spec = gd.Imagine!;
  const before = buildBrochureSpecs(spec, "2019", "Grand Design", "Imagine", "2800BH");
  assert.match(before.grayWater, /39/);
  const merged = fillBrochureHolesFromLot(
    before,
    [seeded],
    2019,
    "Grand Design",
    "Imagine",
    "2800BH",
  );
  assert.ok(merged.filled.includes("GRAY WATER"));
  assert.match(merged.specs.grayWater, /76/);
  assert.equal(merged.specs.dataSource, before.dataSource);
});

test("a floorplan-digit length is a hole an unflagged lot length fills", () => {
  const spec = gd.Imagine!;
  const before = buildBrochureSpecs(spec, "2019", "Grand Design", "Imagine", "2800BH");
  assert.match(before.lengthFt, /28'/);
  const estimated = { ...before, dataSource: "oem-year" as const };
  const unit = {
    year: 2019,
    make: "Grand Design",
    model: "Imagine",
    trim: "2800BH",
    vehicle_body_length: 32,
  };
  const merged = fillBrochureHolesFromLot(
    estimated,
    [unit],
    2019,
    "Grand Design",
    "Imagine",
    "2800BH",
  );
  assert.match(merged.specs.lengthFt, /32'/);
  assert.ok(merged.filled.includes("LENGTH"));
  assert.equal(merged.specs.dataSource, "oem-year");

  const measured = {
    ...before,
    dataSource: "oem-year" as const,
    lengthFt: `34' 0"`,
    lengthIn: `34' 0"`,
  };
  const held = fillBrochureHolesFromLot(
    measured,
    [unit],
    2019,
    "Grand Design",
    "Imagine",
    "2800BH",
  );
  assert.match(held.specs.lengthFt, /34'/);
  assert.ok(!held.filled.includes("LENGTH"));
});

test("every stored Imagine number still paints a hole, and the lot tag is not OEM", () => {
  for (const seeded of GRAND_DESIGN_LOT_SEED) {
    const spec = gd[seeded.model];
    assert.ok(spec, seeded.model);
    const before = buildBrochureSpecs(
      spec,
      String(seeded.year),
      seeded.make,
      seeded.model,
      seeded.trim,
    );
    const merged = fillBrochureHolesFromLot(
      before,
      [seeded],
      seeded.year,
      seeded.make,
      seeded.model,
      seeded.trim,
    );
    assert.equal(merged.specs.dataSource, before.dataSource, seeded.title);
    assert.match(merged.specs.accuracyNote, new RegExp(LOT_FACTS_SOURCE), seeded.title);
    if (seeded.gvwr != null) assert.ok(merged.filled.includes("GVWR"), seeded.title);
    if (seeded.dry_weight != null) assert.ok(merged.filled.includes("UVW"), seeded.title);
    if (seeded.hitch_weight != null) assert.ok(merged.filled.includes("HITCH"), seeded.title);
    if (seeded.payload != null) assert.ok(merged.filled.includes("CCC"), seeded.title);
    if (seeded.vehicle_body_length != null)
      assert.ok(merged.filled.includes("LENGTH"), seeded.title);
    if (seeded.total_fresh_water_tank_capacity != null) {
      assert.ok(merged.filled.includes("FRESH WATER"), seeded.title);
    }
    if (seeded.total_gray_water_tank_capacity != null) {
      assert.ok(merged.filled.includes("GRAY WATER"), seeded.title);
    }
    if (seeded.total_black_water_tank_capacity != null) {
      assert.ok(merged.filled.includes("BLACK WATER"), seeded.title);
    }
    if (seeded.propane_lbs != null) assert.ok(merged.filled.includes("PROPANE"), seeded.title);
    if (seeded.max_sleeping_count != null)
      assert.ok(merged.filled.includes("SLEEPS"), seeded.title);
    if (seeded.number_of_slideouts != null)
      assert.ok(merged.filled.includes("SLIDES"), seeded.title);
  }
});
