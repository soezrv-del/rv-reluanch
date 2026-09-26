import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";
import { installCatalog } from "./catalogLoad.ts";
import { buildBrochureSpecs, CONFIRM_BROCHURE } from "./brochureSpecs.ts";
import { buildFactsBrochureSpecs } from "./factsSheet.ts";
import { ENTEGRA_LOT_SEED } from "./entegraLotSeed.ts";
import { fillBrochureHolesFromLot } from "./lotCatalogFill.ts";
import { displayLengthWithLotLock, lotRecordFilledField } from "./lotFactsFallback.ts";
import { findOemGvwrLbs } from "./floorplanSpecs.ts";
import { findLocalSpecOverride } from "./localSpecOverrides.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";
import { findWeightOverride } from "./weightOverrides.ts";
import { resolveFactsBrochure } from "../rvgrok/factsBrochure.ts";
import type { RVSpec } from "./rvTypes.ts";

const root = dirname(fileURLToPath(import.meta.url));

const catalog = await loadLiveCatalog();
installCatalog({ RV_DATA: catalog.RV_DATA, MAKES: catalog.MAKES });
const entegra = catalog.RV_DATA["Entegra Coach"] as Record<string, RVSpec>;
const odyssey = entegra.Odyssey!;
const odysseySe = entegra["Odyssey SE"]!;

const odysseySeed = ENTEGRA_LOT_SEED.filter(
  (r) => r.model === "Odyssey" || r.model === "Odyssey SE",
);

function row(year: number, model: string, trim: string) {
  return odysseySeed.find((r) => r.year === year && r.model === model && r.trim === trim);
}

const STORED_FIELDS = [
  "gvwr",
  "dry_weight",
  "hitch_weight",
  "payload",
  "vehicle_body_length",
  "vehicle_body_height",
  "vehicle_body_width",
  "max_sleeping_count",
  "number_of_slideouts",
  "total_fresh_water_tank_capacity",
  "total_gray_water_tank_capacity",
  "total_black_water_tank_capacity",
  "propane_lbs",
  "propane_gal",
] as const;

test("Odyssey lot seed is one factory-first record per coach and stays in that family", () => {
  assert.equal(odysseySeed.length, 9);
  const keys = odysseySeed.map((r) => `${r.year}|${r.model}|${r.trim}`);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual(
    keys,
    [
      "2026|Odyssey|29V",
      "2027|Odyssey|24B",
      "2027|Odyssey|30Z",
      "2025|Odyssey SE|22CF",
      "2026|Odyssey SE|22A",
      "2026|Odyssey SE|22AF",
      "2027|Odyssey SE|20LF",
      "2027|Odyssey SE|22C",
      "2027|Odyssey SE|22CF",
    ],
  );
  for (const seeded of odysseySeed) {
    assert.equal(seeded.make, "Entegra Coach");
    assert.equal(seeded.source, "RV Country lot unit record");
    assert.equal(seeded.precedence, "factoryFirst");
    assert.match(seeded.sourceNote, /public\/inventory\/own-lot-latest\.json/);
    assert.match(seeded.sourceNote, /2026-09-25/);
    assert.match(seeded.sourceNote, /id \d+ \/ stock \S+/);
    assert.equal(seeded.model === "Odyssey" || seeded.model === "Odyssey SE", true);
  }
  assert.equal(ENTEGRA_LOT_SEED.some((r) => r.model === "Anthem"), true);
  assert.equal(ENTEGRA_LOT_SEED.some((r) => /esteem/i.test(r.model)), false);
  const grand = readFileSync(join(root, "grandDesignLotSeed.ts"), "utf8");
  assert.doesNotMatch(grand, /Odyssey/);
  assert.doesNotMatch(readFileSync(join(root, "weightOverrides.ts"), "utf8"), /Odyssey/);
  assert.doesNotMatch(readFileSync(join(root, "localSpecOverrides.ts"), "utf8"), /Odyssey/);
});

test("every Odyssey fill still matches the 2026-09-25 lot rows it cites", () => {
  const lot = JSON.parse(
    readFileSync(join(root, "../../../public/inventory/own-lot-latest.json"), "utf8"),
  ) as Array<Record<string, unknown>>;
  const byId = new Map(lot.map((unit) => [String(unit.id), unit]));
  for (const seeded of odysseySeed) {
    const cites = [...seeded.sourceNote.matchAll(/id (\d+) \/ stock (\S+?)(?=;| ·|$)/g)];
    assert.ok(cites.length >= 1, seeded.title);
    for (const cite of cites) {
      const unit = byId.get(cite[1]!);
      assert.ok(unit, `${seeded.title} missing id ${cite[1]}`);
      assert.equal(String(unit.stock_number), cite[2], seeded.title);
      assert.equal(unit.year, seeded.year);
      assert.equal(unit.model, seeded.model);
      assert.equal(unit.trim, seeded.trim);
      assert.notEqual(unit.lot_status, "Sold");
      assert.match(String(unit.scraped_at), /^2026-09-25/);
      for (const field of STORED_FIELDS) {
        const stored = seeded[field];
        if (stored == null) continue;
        assert.equal(Number(unit[field]), stored, `${seeded.title} ${field}`);
      }
    }
  }
  const notes = odysseySeed.map((r) => r.sourceNote).join("\n");
  assert.doesNotMatch(notes, /stock 47621/);
  assert.doesNotMatch(notes, /id 184442/);
  assert.equal(row(2026, "Odyssey SE", "29KF"), undefined);
});

test("2025 Odyssey SE 22CF length fills the digit-estimate hole on Facts and the Grok desk", () => {
  const seeded = row(2025, "Odyssey SE", "22CF");
  assert.ok(seeded);
  assert.equal(seeded.vehicle_body_length, 24.67);
  assert.equal(seeded.gvwr, 12500);
  assert.equal(seeded.overridesCatalog?.vehicle_body_length, undefined);
  assert.equal(seeded.overridesCatalog?.gvwr, undefined);
  assert.match(seeded.sourceNote, /id 206899 \/ stock UPS9877/);

  const before = buildBrochureSpecs(odysseySe, "2025", "Entegra Coach", "Odyssey SE", "22CF");
  assert.equal(before.lengthFt, `22' 10"`);
  assert.equal(before.gvwr, CONFIRM_BROCHURE);
  assert.equal(before.sleeps, "7");
  assert.equal(before.freshWater, "40 gal");
  assert.equal(before.grayWater, "28 gal");
  assert.equal(before.blackWater, "28 gal");
  assert.equal(before.propane, CONFIRM_BROCHURE);

  const facts = buildFactsBrochureSpecs(odysseySe, "2025", "Entegra Coach", "Odyssey SE", "22CF");
  assert.match(facts.lengthFt, /24' 8"/);
  assert.match(facts.lengthIn, /24' 8"/);
  assert.equal(facts.gvwrLbs, 12500);
  assert.match(facts.gvwr, /12,500/);
  assert.equal(facts.sleeps, "6");
  assert.match(facts.freshWater, /44 gal/);
  assert.equal(facts.grayWater, "40 gal");
  assert.equal(facts.blackWater, "31 gal");
  assert.equal(facts.propane, "41 lb");
  assert.equal(lotRecordFilledField(facts.accuracyNote, "LENGTH"), true);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "GVWR"), true);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "SLEEPS"), true);
  assert.equal(facts.dataSource, before.dataSource);

  const desk = resolveFactsBrochure({
    year: "2025",
    make: "Entegra Coach",
    model: "Odyssey SE",
    floorplan: "22CF",
  });
  assert.ok(desk);
  assert.match(desk.lengthFt, /24' 8"/);
  assert.equal(desk.gvwrLbs, 12500);
  assert.equal(desk.sleeps, "6");

  const locked = displayLengthWithLotLock(facts.lengthFt, "43.6 inches", true);
  assert.match(locked, /24' 8"/);
  assert.doesNotMatch(locked, /43\.6/);
});

test("2027 Odyssey 30Z sleeps and slides replace the series seed on Facts and the Grok desk", () => {
  const seeded = row(2027, "Odyssey", "30Z");
  assert.ok(seeded);
  assert.equal(seeded.max_sleeping_count, 7);
  assert.equal(seeded.number_of_slideouts, 2);
  assert.equal(seeded.overridesCatalog?.max_sleeping_count, true);
  assert.equal(seeded.overridesCatalog?.number_of_slideouts, true);
  assert.equal(seeded.gvwr, 14500);
  assert.equal(seeded.overridesCatalog?.gvwr, undefined);
  assert.match(seeded.sourceNote, /Sleeps 7 replaces 8 \(rvData series seed\)/);
  assert.match(seeded.sourceNote, /Slides 2 replaces 1 \(rvData series seed\)/);

  const before = buildBrochureSpecs(odyssey, "2027", "Entegra Coach", "Odyssey", "30Z");
  assert.equal(before.sleeps, "8");
  assert.equal(before.slideouts, "1");
  assert.equal(before.gvwr, "Confirm brochure");
  assert.equal(before.lengthFt, `30' 0"`);
  assert.equal(findOemGvwrLbs("2027", "Entegra Coach", "Odyssey", "30Z"), null);

  const facts = buildFactsBrochureSpecs(odyssey, "2027", "Entegra Coach", "Odyssey", "30Z");
  assert.equal(facts.sleeps, "7");
  assert.equal(facts.slideouts, "2");
  assert.equal(facts.gvwrLbs, 14500);
  assert.match(facts.gvwr, /14,500/);
  assert.match(facts.lengthFt, /32' 6"/);
  assert.equal(facts.propane, "41 lb");
  assert.equal(lotRecordFilledField(facts.accuracyNote, "SLEEPS"), true);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "SLIDES"), true);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "GVWR"), true);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "LENGTH"), true);

  const desk = resolveFactsBrochure({
    year: "2027",
    make: "Entegra",
    model: "Odyssey",
    floorplan: "30Z",
  });
  assert.ok(desk);
  assert.equal(desk.sleeps, "7");
  assert.equal(desk.slideouts, "2");
  assert.equal(desk.gvwrLbs, 14500);
  assert.match(desk.lengthFt, /32' 6"/);
});

test("OEM and dated manufacturer values stay when the lot disagrees or merely agrees", () => {
  assert.equal(findOemGvwrLbs("2026", "Entegra Coach", "Odyssey", "29V"), 14500);
  assert.equal(findOemGvwrLbs("2026", "Entegra Coach", "Odyssey SE", "22A"), null);
  assert.equal(findOemGvwrLbs("2027", "Entegra Coach", "Odyssey SE", "22CF"), null);
  assert.equal(findOemGvwrLbs("2027", "Entegra Coach", "Odyssey SE", "22C"), null);

  const v29 = row(2026, "Odyssey", "29V");
  assert.ok(v29);
  assert.equal(v29.gvwr, undefined);
  assert.match(v29.sourceNote, /14,500 lb/);
  const v29Facts = buildFactsBrochureSpecs(odyssey, "2026", "Entegra Coach", "Odyssey", "29V");
  assert.equal(v29Facts.gvwrLbs, 14500);
  assert.match(v29Facts.gvwr, /14,500/);
  assert.match(v29Facts.lengthFt, /32' 6"/);
  assert.equal(v29Facts.freshWater, "47 gal");
  assert.equal(v29Facts.grayWater, "41 gal");
  assert.equal(v29Facts.blackWater, "32 gal");
  assert.equal(lotRecordFilledField(v29Facts.accuracyNote, "GVWR"), false);
  const v29Desk = resolveFactsBrochure({
    year: "2026",
    make: "Entegra Coach",
    model: "Odyssey",
    floorplan: "29V",
  });
  assert.ok(v29Desk);
  assert.equal(v29Desk.gvwrLbs, 14500);

  const before29 = buildBrochureSpecs(odyssey, "2026", "Entegra Coach", "Odyssey", "29V");
  const flagged = fillBrochureHolesFromLot(
    before29,
    [
      {
        year: 2026,
        make: "Entegra Coach",
        model: "Odyssey",
        trim: "29V",
        gvwr: 14000,
        vehicle_body_length: 32.5,
        overridesCatalog: { gvwr: true, vehicle_body_length: true },
        precedence: "factoryFirst" as const,
      },
    ],
    2026,
    "Entegra Coach",
    "Odyssey",
    "29V",
  );
  assert.equal(flagged.specs.gvwrLbs, 14500);
  assert.ok(!flagged.filled.includes("GVWR"));
  assert.match(flagged.specs.lengthFt, /32' 6"/);
  assert.ok(flagged.filled.includes("LENGTH"));

  const lotWins = fillBrochureHolesFromLot(
    before29,
    [
      {
        year: 2026,
        make: "Entegra Coach",
        model: "Odyssey",
        trim: "29V",
        gvwr: 14000,
        overridesCatalog: { gvwr: true },
        precedence: "lotWins" as const,
      },
    ],
    2026,
    "Entegra Coach",
    "Odyssey",
    "29V",
  );
  assert.equal(lotWins.specs.gvwrLbs, 14000);

  const se22 = row(2027, "Odyssey SE", "22C");
  assert.ok(se22);
  assert.equal(se22.gvwr, undefined);
  assert.match(se22.sourceNote, /14,200 lb/);
  assert.match(se22.sourceNote, /12,500 lb/);
  assert.equal(se22.dry_weight, undefined);
  assert.equal(se22.hitch_weight, undefined);
  const se22Before = buildBrochureSpecs(odysseySe, "2027", "Entegra Coach", "Odyssey SE", "22C");
  assert.equal(se22Before.gvwrLbs, 12500);
  assert.equal(se22Before.freshWater, "44 gal");
  assert.equal(se22Before.sleeps, "7");
  const se22Facts = buildFactsBrochureSpecs(odysseySe, "2027", "Entegra Coach", "Odyssey SE", "22C");
  assert.equal(se22Facts.gvwrLbs, 12500);
  assert.match(se22Facts.gvwr, /12,500/);
  assert.doesNotMatch(se22Facts.gvwr, /14,200/);
  assert.equal(se22Facts.freshWater, "44 gal");
  assert.equal(se22Facts.grayWater, "40 gal");
  assert.equal(se22Facts.blackWater, "31 gal");
  assert.equal(se22Facts.sleeps, "6");
  assert.equal(se22Facts.lengthFt, CONFIRM_BROCHURE);
  assert.equal(se22Facts.propane, "41 lb");
  assert.equal(se22Facts.uvwLbs, null);
  assert.equal(lotRecordFilledField(se22Facts.accuracyNote, "GVWR"), false);
  assert.equal(lotRecordFilledField(se22Facts.accuracyNote, "LENGTH"), false);
  assert.equal(lotRecordFilledField(se22Facts.accuracyNote, "SLEEPS"), true);
  const se22Desk = resolveFactsBrochure({
    year: "2027",
    make: "Entegra Coach",
    model: "Odyssey SE",
    floorplan: "22C",
  });
  assert.ok(se22Desk);
  assert.equal(se22Desk.gvwrLbs, 12500);
  assert.equal(se22Desk.sleeps, "6");

  const se22cfSeed = row(2027, "Odyssey SE", "22CF");
  assert.ok(se22cfSeed);
  assert.equal(se22cfSeed.dry_weight, undefined);
  assert.equal(se22cfSeed.vehicle_body_length, undefined);
  assert.equal(se22cfSeed.gvwr, undefined);
  assert.equal(se22cfSeed.max_sleeping_count, 6);
  const se22cf = buildFactsBrochureSpecs(odysseySe, "2027", "Entegra Coach", "Odyssey SE", "22CF");
  assert.equal(se22cf.gvwrLbs, 12500);
  assert.equal(se22cf.freshWater, "44 gal");
  assert.equal(se22cf.grayWater, "40 gal");
  assert.equal(se22cf.blackWater, "31 gal");
  assert.equal(se22cf.sleeps, "6");
  assert.equal(se22cf.propane, "41 lb");
  assert.equal(se22cf.lengthFt, CONFIRM_BROCHURE);
  assert.equal(se22cf.uvwLbs, null);
  assert.equal(lotRecordFilledField(se22cf.accuracyNote, "GVWR"), false);
  assert.equal(lotRecordFilledField(se22cf.accuracyNote, "SLEEPS"), true);
  const se22cfDesk = resolveFactsBrochure({
    year: "2027",
    make: "Entegra Coach",
    model: "Odyssey SE",
    floorplan: "22CF",
  });
  assert.ok(se22cfDesk);
  assert.equal(se22cfDesk.gvwrLbs, 12500);
  assert.equal(se22cfDesk.sleeps, "6");
  assert.equal(se22cfDesk.propane, "41 lb");

  assert.equal(findWeightOverride(2027, "Entegra Coach", "Odyssey", "30Z"), null);
  assert.equal(findLocalSpecOverride(2027, "Entegra Coach", "Odyssey SE", "22CF"), null);
  const pin = findPowertrainCorrection("2027", "Entegra Coach", "Odyssey", "24B");
  assert.ok(pin);
  assert.equal(pin.horsepower, 325);
});

test("2026 Odyssey SE 22A tank defaults move to the lot and 2027 24B GVWR fills the open year", () => {
  const a22 = row(2026, "Odyssey SE", "22A");
  assert.ok(a22);
  assert.equal(a22.gvwr, undefined);
  assert.equal(a22.vehicle_body_length, undefined);
  assert.equal(a22.overridesCatalog?.total_fresh_water_tank_capacity, true);
  assert.equal(a22.number_of_slideouts, undefined);
  const a22Before = buildBrochureSpecs(odysseySe, "2026", "Entegra Coach", "Odyssey SE", "22A");
  assert.equal(a22Before.gvwr, CONFIRM_BROCHURE);
  assert.equal(a22Before.freshWater, "40 gal");
  assert.equal(a22Before.grayWater, "28 gal");
  assert.equal(a22Before.blackWater, "28 gal");
  assert.equal(a22Before.slideouts, "1");
  const a22Facts = buildFactsBrochureSpecs(odysseySe, "2026", "Entegra Coach", "Odyssey SE", "22A");
  assert.equal(a22Facts.gvwr, CONFIRM_BROCHURE);
  assert.match(a22Facts.freshWater, /44 gal/);
  assert.equal(a22Facts.grayWater, "40 gal");
  assert.equal(a22Facts.blackWater, "32 gal");
  assert.equal(a22Facts.slideouts, "1");
  assert.equal(a22Facts.sleeps, "7");
  assert.equal(a22Facts.lengthFt, CONFIRM_BROCHURE);
  const af = row(2026, "Odyssey SE", "22AF");
  assert.ok(af);
  assert.equal(af.gvwr, undefined);
  assert.equal(af.max_sleeping_count, undefined);
  assert.equal(af.propane_lbs, undefined);
  const afFacts = buildFactsBrochureSpecs(odysseySe, "2026", "Entegra Coach", "Odyssey SE", "22AF");
  assert.equal(afFacts.blackWater, "32 gal");
  assert.equal(afFacts.sleeps, "7");
  assert.equal(afFacts.propane, CONFIRM_BROCHURE);

  const b24 = row(2027, "Odyssey", "24B");
  assert.ok(b24);
  assert.equal(b24.max_sleeping_count, 6);
  assert.equal(b24.overridesCatalog?.max_sleeping_count, true);
  assert.equal(findOemGvwrLbs("2026", "Entegra Coach", "Odyssey", "24B"), 14500);
  assert.equal(findOemGvwrLbs("2027", "Entegra Coach", "Odyssey", "24B"), null);
  const b24Facts = buildFactsBrochureSpecs(odyssey, "2027", "Entegra Coach", "Odyssey", "24B");
  assert.equal(b24Facts.gvwrLbs, 14500);
  assert.equal(b24Facts.sleeps, "6");
  assert.match(b24Facts.lengthFt, /26' 8"/);
  assert.match(b24Facts.freshWater, /43 gal/);
  assert.equal(b24Facts.grayWater, "40 gal");
  assert.equal(b24Facts.blackWater, "31 gal");
  const b24_2026 = buildFactsBrochureSpecs(odyssey, "2026", "Entegra Coach", "Odyssey", "24B");
  assert.equal(b24_2026.gvwrLbs, 14500);
  assert.equal(b24_2026.sleeps, "8");
});

test("2026 Imagine 2800BH GVWR still resolves to the lot 8,495", () => {
  const imagine = catalog.RV_DATA["Grand Design"].Imagine as RVSpec;
  const facts = buildFactsBrochureSpecs(imagine, "2026", "Grand Design", "Imagine", "2800BH");
  assert.equal(facts.gvwrLbs, 8495);
  assert.match(facts.gvwr, /8,495/);
});
