import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";
import { installCatalog } from "./catalogLoad.ts";
import { buildBrochureSpecs } from "./brochureSpecs.ts";
import { buildFactsBrochureSpecs } from "./factsSheet.ts";
import { ENTEGRA_LOT_SEED } from "./entegraLotSeed.ts";
import { fillBrochureHolesFromLot, lengthIsSeriesRangeFallback } from "./lotCatalogFill.ts";
import { displayLengthWithLotLock, lotRecordFilledField } from "./lotFactsFallback.ts";
import { findOemGvwrLbs } from "./floorplanSpecs.ts";
import { resolveFactsBrochure } from "../rvgrok/factsBrochure.ts";
import type { RVSpec } from "./rvTypes.ts";

const root = dirname(fileURLToPath(import.meta.url));

const catalog = await loadLiveCatalog();
installCatalog({ RV_DATA: catalog.RV_DATA, MAKES: catalog.MAKES });
const anthem = catalog.RV_DATA["Entegra Coach"].Anthem as RVSpec;

function row(year: number, trim: string) {
  return ENTEGRA_LOT_SEED.find((r) => r.model === "Anthem" && r.year === year && r.trim === trim);
}

const anthemSeed = ENTEGRA_LOT_SEED.filter((r) => r.model === "Anthem");

test("Anthem lot seed is one record per coach and stays inside the Anthem family", () => {
  assert.equal(anthemSeed.length, 2);
  const keys = anthemSeed.map((r) => `${r.year}|${r.model}|${r.trim}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const seeded of anthemSeed) {
    assert.equal(seeded.make, "Entegra Coach");
    assert.equal(seeded.model, "Anthem");
    assert.equal(seeded.source, "RV Country lot unit record");
    assert.match(seeded.sourceNote, /public\/inventory\/own-lot-latest\.json/);
    assert.match(seeded.sourceNote, /2026-09-25/);
    assert.match(seeded.sourceNote, /id \d+/);
    assert.match(seeded.sourceNote, /stock /);
    assert.equal(seeded.precedence, "factoryFirst");
  }
});

test("every Anthem fill still matches the 2026-09-25 lot row it cites", () => {
  const lot = JSON.parse(
    readFileSync(join(root, "../../../public/inventory/own-lot-latest.json"), "utf8"),
  ) as Array<Record<string, unknown>>;
  const byId = new Map(lot.map((unit) => [String(unit.id), unit]));
  const fields = ["vehicle_body_length", "max_sleeping_count"] as const;
  for (const seeded of anthemSeed) {
    const cites = [...seeded.sourceNote.matchAll(/id (\d+) \/ stock (\S+?)(?=;| ·|$)/g)];
    assert.equal(cites.length, 1, seeded.title);
    const cite = cites[0]!;
    const unit = byId.get(cite[1]!);
    assert.ok(unit, `${seeded.title} missing id ${cite[1]}`);
    assert.equal(String(unit.stock_number), cite[2], seeded.title);
    assert.equal(unit.year, seeded.year);
    assert.equal(unit.model, seeded.model);
    assert.equal(unit.trim, seeded.trim);
    assert.match(String(unit.scraped_at), /^2026-09-25/);
    for (const field of fields) {
      const stored = seeded[field];
      if (stored == null) continue;
      assert.equal(Number(unit[field]), stored, `${seeded.title} ${field}`);
    }
  }
});

test("2025 Anthem 37K length fills the series-range hole on Facts and the Grok desk", () => {
  const seeded = row(2025, "37K");
  assert.ok(seeded);
  assert.equal(seeded.vehicle_body_length, 38.17);
  assert.equal(seeded.gvwr, undefined);
  assert.equal(seeded.overridesCatalog, undefined);
  assert.match(seeded.sourceNote, /id 36556 \/ stock 44497/);
  assert.match(seeded.sourceNote, /41,000 lb/);
  assert.match(seeded.sourceNote, /44,000 lb/);
  assert.match(seeded.sourceNote, /2024–2025/);

  const before = buildBrochureSpecs(anthem, "2025", "Entegra Coach", "Anthem", "37K");
  assert.equal(before.lengthFt, `43' 6"`);
  assert.equal(before.lengthIn, `43' 6"`);
  assert.equal(before.gvwrLbs, 44000);
  assert.equal(
    lengthIsSeriesRangeFallback(before, "2025", "Entegra Coach", "Anthem", "37K"),
    true,
  );

  const facts = buildFactsBrochureSpecs(anthem, "2025", "Entegra Coach", "Anthem", "37K");
  assert.match(facts.lengthFt, /38' 2"/);
  assert.match(facts.lengthIn, /38' 2"/);
  assert.doesNotMatch(facts.lengthFt, /42/);
  assert.doesNotMatch(facts.lengthFt, /43/);
  assert.doesNotMatch(facts.lengthIn, /43\.6/);
  assert.equal(facts.gvwrLbs, 44000);
  assert.match(facts.gvwr, /44,000/);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "LENGTH"), true);
  assert.equal(facts.dataSource, before.dataSource);

  const desk = resolveFactsBrochure({
    year: "2025",
    make: "Entegra Coach",
    model: "Anthem",
    floorplan: "37K",
  });
  assert.ok(desk);
  assert.match(desk.lengthFt, /38' 2"/);
  assert.doesNotMatch(desk.lengthFt, /42/);
  assert.doesNotMatch(desk.lengthFt, /43/);
  assert.equal(desk.gvwrLbs, 44000);
  assert.match(desk.gvwr, /44,000/);
});

test("2025 Anthem 37K GVWR stays on the 2024–2025 OEM pin, not the lot 41,000", () => {
  assert.equal(findOemGvwrLbs("2025", "Entegra Coach", "Anthem", "37K"), 44000);
  assert.equal(findOemGvwrLbs("2024", "Entegra Coach", "Anthem", "37K"), 44000);
  assert.equal(findOemGvwrLbs("2026", "Entegra Coach", "Anthem", "37K"), 41000);
  const facts = buildFactsBrochureSpecs(anthem, "2025", "Entegra Coach", "Anthem", "37K");
  assert.equal(facts.gvwrLbs, 44000);
  const desk = resolveFactsBrochure({
    year: "2025",
    make: "Entegra",
    model: "Anthem",
    floorplan: "37K",
  });
  assert.ok(desk);
  assert.equal(desk.gvwrLbs, 44000);

  const before = buildBrochureSpecs(anthem, "2025", "Entegra Coach", "Anthem", "37K");
  assert.equal(before.sleeps, "6");
  const flaggedRow = {
    year: 2025,
    make: "Entegra Coach",
    model: "Anthem",
    trim: "37K",
    gvwr: 41000,
    vehicle_body_length: 38.17,
    max_sleeping_count: 8,
    overridesCatalog: { gvwr: true, vehicle_body_length: true, max_sleeping_count: true },
    precedence: "factoryFirst" as const,
  };
  const flagged = fillBrochureHolesFromLot(
    before,
    [flaggedRow],
    2025,
    "Entegra Coach",
    "Anthem",
    "37K",
  );
  assert.equal(flagged.specs.gvwrLbs, 44000);
  assert.match(flagged.specs.gvwr, /44,000/);
  assert.ok(!flagged.filled.includes("GVWR"));
  assert.match(flagged.specs.lengthFt, /38' 2"/);
  assert.ok(flagged.filled.includes("LENGTH"));
  assert.equal(flagged.specs.sleeps, "8");
  assert.ok(flagged.filled.includes("SLEEPS"));

  const lotWins = fillBrochureHolesFromLot(
    before,
    [{ ...flaggedRow, precedence: "lotWins" as const }],
    2025,
    "Entegra Coach",
    "Anthem",
    "37K",
  );
  assert.equal(lotWins.specs.gvwrLbs, 41000);
});

test("a live dossier length of 43.6 inches does not replace the lot length", () => {
  const facts = buildFactsBrochureSpecs(anthem, "2025", "Entegra Coach", "Anthem", "37K");
  const ownsLength = lotRecordFilledField(facts.accuracyNote, "LENGTH");
  assert.equal(ownsLength, true);
  assert.equal(displayLengthWithLotLock(facts.lengthFt, "43.6 inches", false), "43.6 inches");
  const locked = displayLengthWithLotLock(facts.lengthFt, "43.6 inches", ownsLength);
  assert.match(locked, /38' 2"/);
  assert.doesNotMatch(locked, /43\.6/);
  const dossier = readFileSync(join(root, "liveDossier.ts"), "utf8");
  assert.match(dossier, /displayLengthWithLotLock\(/);
  assert.match(dossier, /lockLengthFromLot/);
  const detail = readFileSync(join(root, "../../components/rvfax/RvDetail.tsx"), "utf8");
  assert.match(detail, /lockLengthFromLot: lotRecordFilledField\(brochure\.accuracyNote, "LENGTH"\)/);
});

test("2017 Anthem 44DLQ lot sleeps beat the series seed and leave the OEM length and GVWR", () => {
  const seeded = row(2017, "44DLQ");
  assert.ok(seeded);
  assert.equal(seeded.max_sleeping_count, 8);
  assert.equal(seeded.overridesCatalog?.max_sleeping_count, true);
  assert.equal(seeded.overridesCatalog?.gvwr, undefined);
  assert.equal(seeded.vehicle_body_length, undefined);
  assert.match(seeded.sourceNote, /Sleeps 8 replaces 6 \(rvData series seed\)/);

  const before = buildBrochureSpecs(anthem, "2017", "Entegra Coach", "Anthem", "44DLQ");
  assert.equal(before.lengthFt, `44' 11"`);
  assert.equal(before.gvwrLbs, 49000);
  assert.equal(before.sleeps, "6");
  assert.equal(
    lengthIsSeriesRangeFallback(before, "2017", "Entegra Coach", "Anthem", "44DLQ"),
    false,
  );

  const facts = buildFactsBrochureSpecs(anthem, "2017", "Entegra Coach", "Anthem", "44DLQ");
  assert.equal(facts.sleeps, "8");
  assert.equal(facts.lengthFt, `44' 11"`);
  assert.equal(facts.gvwrLbs, 49000);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "SLEEPS"), true);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "LENGTH"), false);
  assert.equal(lotRecordFilledField(facts.accuracyNote, "GVWR"), false);
});
