import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  cascadeFromResult,
  pickerCoachWrite,
  shouldOpenSingleHitReport,
} from "./factsOpen.ts";

const root = dirname(fileURLToPath(import.meta.url));

const dream = {
  year: "2023",
  make: "American Coach",
  model: "American Dream",
  floorplan: "45A",
  rvType: "Class A Diesel",
  data: { type: "Class A Diesel" },
};

test("saved / result open restores year make model floorplan cascade", () => {
  const empty = { year: "", make: "", model: "", floorplan: "" };
  const opened = cascadeFromResult(dream);
  assert.deepEqual(opened, {
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
  });
  // Back from report = picker keeps the restored sel (not empty splash)
  const afterBack = { ...opened };
  assert.equal(afterBack.year, "2023");
  assert.equal(afterBack.make, "American Coach");
  assert.equal(afterBack.model, "American Dream");
  assert.equal(afterBack.floorplan, "45A");
  assert.notDeepEqual(afterBack, empty);
});

test("cascadeFromResult keeps a class-tab rvType and ignores catalog type strings", () => {
  assert.equal(
    cascadeFromResult({
      year: "2022",
      make: "Keystone",
      model: "Montana",
      floorplan: "3855BR",
      rvType: "fifth-wheel",
    }).rvType,
    "fifth-wheel",
  );
  assert.equal(
    cascadeFromResult({
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
      rvType: "Class A Diesel",
    }).rvType,
    undefined,
  );
});

test("picker must not publish null Active Coach while a report is open", () => {
  const empty = { year: "", make: "", model: "", floorplan: "" };
  const restored = cascadeFromResult(dream);

  // Dual-writer race: picker identity still empty, report already showing
  assert.equal(
    pickerCoachWrite(empty, { reportOpen: true }),
    undefined,
    "incomplete picker must not clear the chip mid-report",
  );

  // After applySel + setDetail in the same open, still skip — report owns chip
  assert.equal(pickerCoachWrite(restored, { reportOpen: true }), undefined);

  // Back / chip “change” closes the report but keeps cascade → chip stays
  const afterChange = pickerCoachWrite(restored, { reportOpen: false });
  assert.ok(afterChange);
  assert.equal(afterChange!.year, "2023");
  assert.equal(afterChange!.model, "American Dream");
  assert.equal(afterChange!.floorplan, "45A");

  // Empty picker with no report may clear (Reset)
  assert.equal(pickerCoachWrite(empty, { reportOpen: false }), null);
});

test("Open report opens a single non-custom hit and not a multi/custom list", () => {
  assert.equal(shouldOpenSingleHitReport([{ custom: false }]), true);
  assert.equal(shouldOpenSingleHitReport([{ custom: true }]), false);
  assert.equal(
    shouldOpenSingleHitReport([{ custom: false }, { custom: false }]),
    false,
  );
  assert.equal(shouldOpenSingleHitReport([]), false);
});

test("searchCatalog is empty until the live catalog is loaded", () => {
  const catalogSrc = readFileSync(join(root, "catalog.ts"), "utf8");
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  // Open report must wait for the live catalog — index-only search is [].
  assert.match(
    catalogSrc,
    /const live = peekCatalog\(\)\?\.RV_DATA;\s*if \(!live\) return \[\];/,
  );
  assert.match(fax, /await ensureCatalogLoaded\(\)/);
  assert.match(fax, /if \(!isCatalogLoaded\(\)\) return/);
});

test("Facts app restores cascade on every open path and skips coach clear mid-report", () => {
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  const chip = readFileSync(
    join(root, "../../components/shell/ActiveCoachChip.tsx"),
    "utf8",
  );
  const shell = readFileSync(
    join(root, "../../components/shell/AppShell.tsx"),
    "utf8",
  );

  assert.match(fax, /cascadeFromResult/);
  assert.match(fax, /pickerCoachWrite/);
  assert.match(fax, /shouldOpenSingleHitReport/);
  assert.match(fax, /openFactsUnit/);
  assert.match(fax, /ensureCatalogLoaded/);
  assert.match(fax, /if \(!isCatalogLoaded\(\)\) return/);

  // Saved row, result card, compare, and single-hit Open report share openFactsUnit
  assert.match(fax, /setCompareOpen\(false\);\s*openFactsUnit\(r\)/);
  assert.match(fax, /onOpen=\{\(\) => openFactsUnit\(r\)\}/);
  assert.match(fax, /onClick=\{\(\) => openFactsUnit\(r\)\}/);
  assert.match(fax, /shouldOpenSingleHitReport\(found\)[\s\S]{0,80}openFactsUnit\(found\[0\]!\)/);

  // Chip “change” closes the report via token — does not resetFax
  assert.match(chip, /openFactsPicker/);
  assert.match(shell, /setFactsPickerToken/);
  const tokenEffect = fax.match(
    /useEffect\(\(\) => \{[\s\S]*?factsPickerToken[\s\S]*?\}, \[factsPickerToken\]\);/,
  );
  assert.ok(tokenEffect, "factsPickerToken effect present");
  assert.match(tokenEffect![0], /setDetail\(null\)/);
  assert.doesNotMatch(tokenEffect![0], /resetFax/);
  assert.doesNotMatch(tokenEffect![0], /applySel\(\{ year: ""/);
});
