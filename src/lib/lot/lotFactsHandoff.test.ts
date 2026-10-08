import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lotDecodableVin, lotFactsSeed, lotOpenSections } from "./lotDetail.ts";
import { parseLotSnapshotJson, type LotUnit } from "./ownLotPage.ts";
import { resolveFactsUnitSeed, type FactsSeedLookups } from "../rv/factsOpen.ts";

const root = dirname(fileURLToPath(import.meta.url));

function read(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

function snapshotUnits(): LotUnit[] {
  return parseLotSnapshotJson(
    JSON.parse(read("../../../public/inventory/own-lot-latest.json")),
  ).units;
}

/** Tiny stand-in for the catalog lists Facts matches the seed against. */
const look: FactsSeedLookups = {
  makes: (year) => (year === "2018" ? ["Keystone", "Grand Design"] : []),
  models: (_year, make) => (make === "Keystone" ? ["Montana", "Cougar"] : []),
  floorplans: (_year, _make, model) =>
    model === "Montana" ? ["3820FK", "3854BR"] : [],
};

test("Check RV Facts seed: lot trim is the floorplan code", () => {
  const unit = {
    year: 2018 as unknown as string, // snapshot JSON stores year as a number
    make: "Keystone",
    model: "Montana",
    trim: " 3820FK ",
  } as LotUnit;
  assert.deepEqual(lotFactsSeed(unit), {
    year: "2018",
    make: "Keystone",
    model: "Montana",
    floorplan: "3820FK",
  });
});

test("exact year/make/model/floorplan match → Facts auto-opens the report", () => {
  const { sel, open } = resolveFactsUnitSeed(
    { year: "2018", make: "KEYSTONE", model: "montana", floorplan: "3820fk" },
    look,
  );
  assert.equal(open, true);
  // Catalog spelling wins so openFactsUnit lands on the real catalog row.
  assert.deepEqual(sel, {
    year: "2018",
    make: "Keystone",
    model: "Montana",
    floorplan: "3820FK",
  });
});

test("a missing or unmatched field pre-fills what matched and stays on the picker", () => {
  const noFp = resolveFactsUnitSeed(
    { year: "2018", make: "Keystone", model: "Montana", floorplan: "" },
    look,
  );
  assert.equal(noFp.open, false);
  assert.deepEqual(noFp.sel, {
    year: "2018",
    make: "Keystone",
    model: "Montana",
    floorplan: "",
  });

  const unknownFp = resolveFactsUnitSeed(
    { year: "2018", make: "Keystone", model: "Montana", floorplan: "9999ZZ" },
    look,
  );
  assert.equal(unknownFp.open, false);
  assert.equal(unknownFp.sel.floorplan, "");

  const badModel = resolveFactsUnitSeed(
    { year: "2018", make: "Keystone", model: "Montana High Country", floorplan: "3820FK" },
    look,
  );
  assert.equal(badModel.open, false);
  assert.deepEqual(badModel.sel, { year: "2018", make: "Keystone", model: "", floorplan: "" });

  const noYear = resolveFactsUnitSeed(
    { year: "", make: "Keystone", model: "Montana", floorplan: "3820FK" },
    look,
  );
  assert.equal(noYear.open, false);
  assert.deepEqual(noYear.sel, { year: "", make: "", model: "", floorplan: "" });
});

test("unique normalized make, model, and floorplan open the catalog row", () => {
  const branded = resolveFactsUnitSeed(
    { year: "2018", make: "Keystone RV", model: "Montana", floorplan: "3820FK" },
    look,
  );
  assert.equal(branded.open, true);
  assert.deepEqual(branded.sel, {
    year: "2018",
    make: "Keystone",
    model: "Montana",
    floorplan: "3820FK",
  });

  const mbs = resolveFactsUnitSeed(
    { year: "2018", make: "Keystone", model: "Montana", floorplan: "3820FK MBS" },
    look,
  );
  assert.equal(mbs.open, true, "first numbered word of the trim");
  assert.equal(mbs.sel.floorplan, "3820FK");

  const spaced = resolveFactsUnitSeed(
    { year: "2018", make: "Keystone", model: "Cougar Half Ton", floorplan: "3820 FK" },
    {
      makes: () => ["Keystone"],
      models: () => ["Cougar Half-Ton"],
      floorplans: () => ["3820FK", "3854BR"],
    },
  );
  assert.equal(spaced.open, true);
  assert.deepEqual(spaced.sel, {
    year: "2018",
    make: "Keystone",
    model: "Cougar Half-Ton",
    floorplan: "3820FK",
  });

  const popular = resolveFactsUnitSeed(
    { year: "2008", make: "Roadtrek", model: "POPULAR", floorplan: "210" },
    {
      makes: () => ["Roadtrek"],
      models: () => ["Popular"],
      floorplans: () => ["170-Popular", "190-Popular", "210-Popular"],
    },
  );
  assert.equal(popular.open, true);
  assert.equal(popular.sel.model, "Popular");
  assert.equal(popular.sel.floorplan, "210-Popular");
});

test("prefix and ties do not open the wrong report", () => {
  const view = resolveFactsUnitSeed(
    { year: "2012", make: "Winnebago", model: "View Profile", floorplan: "24J" },
    {
      makes: () => ["Winnebago"],
      models: () => ["View"],
      floorplans: () => ["24J"],
    },
  );
  assert.equal(view.open, false);
  assert.equal(view.sel.model, "");

  const knight = resolveFactsUnitSeed(
    { year: "2013", make: "Monaco RV", model: "Knight", floorplan: "40PDQ" },
    {
      makes: () => ["Monaco Coach"],
      models: () => ["Knight"],
      floorplans: () => ["36P", "40P"],
    },
  );
  assert.equal(knight.open, false);
  assert.equal(knight.sel.make, "Monaco Coach");
  assert.equal(knight.sel.model, "Knight");
  assert.equal(knight.sel.floorplan, "");

  const tie = resolveFactsUnitSeed(
    { year: "2018", make: "Thor", model: "ACE", floorplan: "29D" },
    {
      makes: () => ["Thor", "Thor Motor Coach"],
      models: () => ["ACE"],
      floorplans: () => ["29D"],
    },
  );
  assert.equal(tie.open, false);
  assert.equal(tie.sel.make, "");
});

test("Check RV Facts calls openFactsPicker with the unit; Facts consumes the seed once", () => {
  const lot = read("../../components/lot/LotStockApp.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const nav = read("../../components/shell/ShellNavContext.ts");
  const fax = read("../../components/rvfax/RvFaxApp.tsx");

  assert.match(
    lot,
    /data-lot-facts[\s\S]{0,80}onClick=\{\(\) => nav\?\.openFactsPicker\(lotFactsSeed\(unit\)\)\}/,
  );

  assert.match(nav, /openFactsPicker: \(unit\?: FactsCascadeSel \| null\) => void/);
  assert.match(nav, /factsUnitSeed: FactsCascadeSel \| null/);
  assert.match(nav, /clearFactsUnitSeed: \(\) => void/);

  // Same token as the dock (clean search), plus the seed. A plain Facts tap
  // passes nothing, so any unconsumed seed is dropped → picker.
  const picker = shell.match(
    /const openFactsPicker = useCallback\([\s\S]*?\}, \[markVisited\]\);/,
  );
  assert.ok(picker, "openFactsPicker present");
  assert.match(picker[0], /setFactsUnitSeed\(unit \?\? null\)/);
  assert.match(picker[0], /setFactsPickerToken\(\(n\) => n \+ 1\)/);
  assert.match(shell, /const clearFactsUnitSeed = useCallback\(\(\) => setFactsUnitSeed\(null\), \[\]\)/);

  const seedEffect = fax.match(
    /useEffect\(\(\) => \{\s*if \(!factsUnitSeed\) return;[\s\S]*?\}, \[factsUnitSeed, clearFactsUnitSeed, openFactsUnit, applySel\]\);/,
  );
  assert.ok(seedEffect, "Facts seed effect present");
  const body = seedEffect[0];
  assert.match(body, /await ensureCatalogLoaded\(\)/);
  assert.match(body, /resolveFactsUnitSeed\(factsUnitSeed/);
  // Exact single catalog hit → report via the shared openFactsUnit.
  assert.match(
    body,
    /shouldOpenSingleHitReport\(found\)\) \{\s*openFactsUnit\(found\[0\]!, sel\.floorplan\);\s*\} else \{\s*applySel\(sel\);/,
  );
  // Consumed once: cleared after use, and a superseded seed is cancelled.
  assert.match(body, /clearFactsUnitSeed\?\.\(\);\s*\}\)\(\);/);
  assert.match(body, /cancelled = true/);
  // Dock token effect still resets to clean search first.
  assert.match(fax, /resetFax\(\);\s*\}, \[factsPickerToken, resetFax\]\);/);
});

test("only a 17-char VIN is tappable", () => {
  assert.equal(lotDecodableVin("4ydf38225j4701302"), "4YDF38225J4701302");
  assert.equal(lotDecodableVin(" 4YDF38225J4701302 "), "4YDF38225J4701302");
  assert.equal(lotDecodableVin("175562"), null, "short stock-style id");
  assert.equal(lotDecodableVin("4YDF38225J47013O2"), null, "O is not a VIN char");
  assert.equal(lotDecodableVin("4YDF38225J47013022"), null, "18 chars");
  assert.equal(lotDecodableVin(""), null);
  assert.equal(lotDecodableVin(undefined), null);

  const units = snapshotUnits();
  const vinRow = (unit: LotUnit) =>
    lotOpenSections(unit)
      .flatMap((part) => part.rows)
      .find((row) => row.label === "VIN");
  const real = units.find((unit) => unit.vin.trim().length === 17);
  assert.ok(real);
  assert.ok(lotDecodableVin(vinRow(real)?.value));
  const short = units.find((unit) => unit.vin.trim() && unit.vin.trim().length !== 17);
  if (short) assert.equal(lotDecodableVin(vinRow(short)?.value ?? ""), null);
});

test("VIN tap opens the VIN Decoder pre-filled and decodes once", () => {
  const lot = read("../../components/lot/LotStockApp.tsx");
  const shell = read("../../components/shell/AppShell.tsx");
  const nav = read("../../components/shell/ShellNavContext.ts");
  const vin = read("../../components/rvfax/VinDecoder.tsx");

  // Button only for the VIN row with a decodable VIN; plain text otherwise.
  assert.match(lot, /const vin = label === "VIN" && onDecodeVin \? lotDecodableVin\(value\) : null/);
  assert.match(
    lot,
    /\{vin && onDecodeVin \? \(\s*<button[\s\S]*?type="button"[\s\S]*?className="lot-vin-link"[\s\S]*?data-lot-vin[\s\S]*?aria-label=\{`Decode VIN \$\{vin\}`\}[\s\S]*?onClick=\{\(\) => onDecodeVin\(vin\)\}[\s\S]*?\) : \(\s*value\s*\)\}/,
  );
  assert.match(lot, /onDecodeVin=\{nav\?\.openVinDecoder\}/);

  assert.match(nav, /openVinDecoder: \(vin: string\) => void/);
  const open = shell.match(/const openVinDecoder = useCallback\([\s\S]*?\[pushNav\],\s*\);/);
  assert.ok(open, "openVinDecoder present");
  assert.match(open[0], /pushNav\("vin", navView\.current\)/);
  assert.match(open[0], /setVinSeed\(vin\)/);
  assert.match(open[0], /setVinOpen\(true\)/);
  // More → VIN Decoder still opens blank.
  assert.match(shell, /setMoreOpen\(false\);\s*setVinSeed\(""\);\s*setVinOpen\(true\);/);
  assert.match(shell, /<VinDecoder open=\{vinOpen\} onClose=\{closeVin\} initialVin=\{vinSeed\} \/>/);

  // Pre-filled, and the existing NHTSA decode runs once per handed-in VIN.
  assert.match(vin, /useState\(\(\) => normalizeVin\(initialVin \?\? ""\)\)/);
  const auto = vin.match(/useEffect\(\(\) => \{\s*if \(!open\) return;\s*const seed[\s\S]*?\}, \[open, initialVin\]\);/);
  assert.ok(auto, "auto-decode effect present");
  assert.match(auto[0], /!isValidVinFormat\(seed\) \|\| autoDecodedRef\.current === seed\) return;/);
  assert.match(auto[0], /autoDecodedRef\.current = seed;\s*void runDecode\(seed\);/);
  assert.match(vin, /decodeVinViaApi\(cleaned, ctrl\.signal\)/);
});
