import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  cascadeFromResult,
  FACTS_EXAMPLE_CHIPS,
  matchCatalogMake,
  parseExampleChip,
  pickerCoachWrite,
  resolveShareOpenSel,
  revealFactsFloorplan,
  revealFactsModel,
  selFromExampleChip,
  shouldCascadeAutoSearch,
  shouldOpenSingleHitReport,
  showFactsExampleChips,
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

test("first-run example chips are exactly the three diesel coaches", () => {
  assert.deepEqual([...FACTS_EXAMPLE_CHIPS], [
    "2023 Entegra Cornerstone",
    "Newmar Dutch Star",
    "Tiffin Allegro Bus",
  ]);
  assert.equal(FACTS_EXAMPLE_CHIPS.length, 3);
  const joined = FACTS_EXAMPLE_CHIPS.join(" | ");
  assert.doesNotMatch(joined, /F-250/);
  assert.doesNotMatch(joined, /Keystone Cougar/);
  assert.doesNotMatch(joined, /Winnebago Vista/);
});

test("example chip parse + Entegra maps onto catalog Entegra Coach", () => {
  const parsed = parseExampleChip("2023 Entegra Cornerstone");
  assert.equal(parsed.year, "2023");
  assert.equal(parsed.make, "Entegra");
  assert.equal(parsed.model, "Cornerstone");
  assert.equal(
    matchCatalogMake("Entegra", ["Entegra Coach", "Newmar", "Tiffin"]),
    "Entegra Coach",
  );
  assert.equal(matchCatalogMake("Newmar", ["Entegra Coach", "Newmar"]), "Newmar");
});

test("example chips resolve onto the year make model cascade for a real search", () => {
  const cornerstone = selFromExampleChip("2023 Entegra Cornerstone");
  assert.equal(cornerstone.year, "2023");
  assert.equal(cornerstone.make, "Entegra Coach");
  assert.equal(cornerstone.model, "Cornerstone");

  const dutch = selFromExampleChip("Newmar Dutch Star");
  assert.equal(dutch.make, "Newmar");
  assert.equal(dutch.model, "Dutch Star");
  assert.ok(dutch.year, "year-less chip must pick a catalog year");

  const bus = selFromExampleChip("Tiffin Allegro Bus");
  assert.equal(bus.make, "Tiffin");
  assert.equal(bus.model, "Allegro Bus");
  assert.ok(bus.year, "year-less chip must pick a catalog year");
});

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

test("Model reveal after year+make — Search is not the gate", () => {
  assert.equal(revealFactsModel({ year: "", make: "", model: "", floorplan: "" }), false);
  assert.equal(revealFactsModel({ year: "2023", make: "", model: "", floorplan: "" }), false);
  assert.equal(
    revealFactsModel({ year: "2023", make: "Newmar", model: "", floorplan: "" }),
    true,
    "year + make must show Model without a Search click",
  );
  assert.equal(
    revealFactsModel({ year: "", make: "", model: "Dutch Star", floorplan: "" }),
    true,
  );
  assert.equal(showFactsExampleChips({ year: "", make: "" }), true);
  assert.equal(
    showFactsExampleChips({ year: "2023", make: "Newmar" }),
    false,
    "example chips stay a first-run shortcut, not a Search-gate stand-in",
  );
});

test("Floorplan reveal is its own step after Model — not with Make", () => {
  assert.equal(
    revealFactsFloorplan({ model: "", floorplan: "" }),
    false,
    "year + make must not show Floorplan yet",
  );
  assert.equal(
    revealFactsFloorplan({ model: "Dutch Star", floorplan: "" }),
    true,
    "model unlocks Floorplan",
  );
  assert.equal(
    revealFactsFloorplan({ model: "", floorplan: "45A" }),
    true,
    "restored floorplan still shows the field",
  );
});

test("cascade auto-search fires on floorplan, never on model alone", () => {
  assert.equal(shouldCascadeAutoSearch({ year: "2023", make: "Newmar" }), false);
  assert.equal(
    shouldCascadeAutoSearch({
      year: "2023",
      make: "Newmar",
      model: "Dutch Star",
    }),
    false,
    "model alone must not auto-open the report",
  );
  assert.equal(
    shouldCascadeAutoSearch({
      year: "2023",
      make: "Newmar",
      model: "Dutch Star",
    }, "model"),
    false,
  );
  assert.equal(
    shouldCascadeAutoSearch({
      year: "2023",
      make: "Newmar",
      model: "Dutch Star",
      floorplan: "4551",
    }),
    true,
    "concrete floorplan completes the cascade",
  );
  assert.equal(
    shouldCascadeAutoSearch({
      year: "2023",
      make: "Newmar",
      model: "Dutch Star",
      floorplan: "",
    }, "floorplan"),
    true,
    "explicit Any floorplan fetches the list; Search stays the override",
  );
  assert.equal(
    shouldCascadeAutoSearch({ year: "2023", make: "", model: "Dutch Star", floorplan: "4551" }),
    false,
  );
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

test("Share opens the on-screen report, else Active Coach, else first saved", () => {
  const saved = [
    { year: "2021", make: "Keystone", model: "Montana", floorplan: "3855BR" },
  ];
  const active = {
    year: "2023",
    make: "American Coach",
    model: "American Dream",
    floorplan: "45A",
  };
  assert.deepEqual(
    resolveShareOpenSel({
      detail: dream,
      active,
      saved,
    }),
    {
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
    },
  );
  assert.deepEqual(
    resolveShareOpenSel({
      detail: null,
      active,
      saved,
    }),
    {
      year: "2023",
      make: "American Coach",
      model: "American Dream",
      floorplan: "45A",
    },
  );
  assert.deepEqual(
    resolveShareOpenSel({
      detail: null,
      active: null,
      saved,
    }),
    {
      year: "2021",
      make: "Keystone",
      model: "Montana",
      floorplan: "3855BR",
    },
  );
  assert.equal(
    resolveShareOpenSel({
      detail: null,
      active: { year: "", make: "", model: "" },
      saved: [],
    }),
    null,
  );
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
  assert.match(fax, /resolveShareOpenSel/);
  assert.match(fax, /factsShareToken/);
  assert.match(fax, /setShareFocusToken/);
  assert.match(fax, /ensureCatalogLoaded/);
  assert.match(fax, /if \(!isCatalogLoaded\(\)\) return/);

  // Saved row, result card, compare, and single-hit Open report share openFactsUnit
  assert.match(fax, /setCompareOpen\(false\);\s*openFactsUnit\(r\)/);
  assert.match(fax, /onOpen=\{\(\) => openFactsUnit\(r\)\}/);
  assert.match(fax, /onClick=\{\(\) => openFactsUnit\(r\)\}/);
  assert.match(fax, /shouldOpenSingleHitReport\(found\)[\s\S]{0,80}openFactsUnit\(found\[0\]!\)/);

  // Chip “change” and dock Facts share openFactsPicker → resetFax (clean search)
  assert.match(chip, /openFactsPicker/);
  assert.match(shell, /setFactsPickerToken/);
  const tokenEffect = fax.match(
    /useEffect\(\(\) => \{[\s\S]*?factsPickerToken[\s\S]*?\}, \[factsPickerToken, resetFax\]\);/,
  );
  assert.ok(tokenEffect, "factsPickerToken effect present");
  assert.match(tokenEffect![0], /resetFax\(\)/);
  assert.doesNotMatch(tokenEffect![0], /applySel\(\{ year: ""/);
});

test("Facts first-run hero, year+make default, and chip search stay on the cascade", () => {
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  assert.match(fax, /Know before you buy,/);
  assert.match(fax, /FACTS_EXAMPLE_CHIPS/);
  assert.match(fax, /selFromExampleChip/);
  assert.match(fax, /runExampleChip/);
  assert.match(fax, /runSearchNow\(sel\)/);
  assert.match(fax, /revealFactsModel/);
  assert.match(fax, /revealFactsFloorplan/);
  assert.match(fax, /shouldCascadeAutoSearch/);
  assert.match(fax, /refreshCascadeAfterChange\(next, field\)/);
  assert.match(fax, /refreshCascadeAfterChange/);
  assert.match(fax, /data-facts-example-chip/);
  assert.match(fax, /label="Year"/);
  assert.match(fax, /label="Make"/);
  assert.match(fax, /label="Model"/);
  assert.match(fax, /label="Floorplan"/);
  assert.doesNotMatch(fax, /label="Trim"/);
  assert.match(fax, /year → make → model → floorplan/);
  assert.doesNotMatch(fax, /F-250/);
  assert.doesNotMatch(fax, /Keystone Cougar/);
  assert.doesNotMatch(fax, /Winnebago Vista/);
  assert.doesNotMatch(
    fax,
    /revealModelTrim = hasSearched/,
    "Search must not gate Model/Floorplan",
  );
  assert.doesNotMatch(fax, /revealFactsModelTrim/);
  assert.match(
    fax,
    /shouldCascadeAutoSearch\(next, field\)/,
    "auto-open is floorplan-gated via the helper + changed field",
  );
  assert.match(
    fax,
    /year && make \? \([\s\S]*?\{cascade\.canSearch \? "Open report" : "Search"\}/,
    "Search / Open report stays as the year+make override",
  );
  // Progressive unlock: Year → Make → Model → Floorplan (separate steps)
  const yearAt = fax.indexOf('label="Year"');
  const makeAt = fax.indexOf('label="Make"');
  const revealModelAt = fax.indexOf("{revealModel ? (");
  const modelAt = fax.indexOf('label="Model"');
  const revealFloorplanAt = fax.indexOf("{revealFloorplan ? (");
  const floorplanAt = fax.indexOf('label="Floorplan"');
  assert.ok(yearAt > 0 && makeAt > yearAt);
  assert.ok(revealModelAt > makeAt, "year and make stay visible before Model");
  assert.ok(modelAt > revealModelAt, "Model follows year+make, not a Search click");
  assert.ok(
    revealFloorplanAt > modelAt,
    "Floorplan is a later step than Model — not revealed together",
  );
  assert.ok(floorplanAt > revealFloorplanAt);
});

test("Facts landing uses the showroom motorhome behind glass, cards stay put", () => {
  const fax = readFileSync(join(root, "../../components/rvfax/RvFaxApp.tsx"), "utf8");
  const prestige = readFileSync(join(root, "../../assets/prestige.ts"), "utf8");
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  const asset = join(root, "../../../public/assets/facts-landing-motorhome.jpg");
  assert.match(prestige, /FACTS_LANDING_BACKDROP/);
  assert.match(prestige, /\/assets\/facts-landing-motorhome\.jpg/);
  assert.match(fax, /FACTS_LANDING_BACKDROP/);
  assert.match(fax, /data-facts-landing/);
  assert.match(fax, /facts-hero-panel/);
  assert.match(fax, /SuiteBackdrop src=\{PRESTIGE_BACKDROP\}/);
  assert.match(css, /data-facts-landing/);
  assert.match(css, /opacity: 0\.46/);
  assert.match(fax, /Catalog search/);
  assert.match(fax, /VIN Decoder/);
  assert.match(fax, /Scan or type a VIN · NHTSA decode/);
  assert.ok(existsSync(asset), "facts-landing-motorhome.jpg is in public/assets");
});

test("dock Facts tab always opens clean search via openFactsPicker", () => {
  const shell = readFileSync(
    join(root, "../../components/shell/AppShell.tsx"),
    "utf8",
  );
  const tabs = readFileSync(
    join(root, "../../components/shell/BottomTabs.tsx"),
    "utf8",
  );
  const onTab = shell.match(
    /const onTabChange = useCallback\(\s*\(next: AppTab\) => \{[\s\S]*?\}, \[/,
  );
  assert.ok(onTab, "onTabChange present");
  assert.match(onTab[0], /next === "rvfax"/);
  assert.match(onTab[0], /openFactsPicker/);
  assert.doesNotMatch(onTab[0], /openCalWithPrice/);
  assert.doesNotMatch(onTab[0], /openGrok/);
  assert.doesNotMatch(onTab[0], /openTowWithCoach/);
  assert.doesNotMatch(onTab[0], /openTripsProfile/);
  assert.match(tabs, /onChange\(id\)/);
  assert.doesNotMatch(tabs, /openFactsPicker/);
  assert.doesNotMatch(tabs, /setFactsPickerToken/);
});

test("Facts bridges are Ask Grok, Check tow, Check payment only — no GPS", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  const nav = readFileSync(
    join(root, "../../components/shell/ShellNavContext.ts"),
    "utf8",
  );
  const shell = readFileSync(
    join(root, "../../components/shell/AppShell.tsx"),
    "utf8",
  );

  assert.match(detail, /Ask Grok/);
  assert.match(detail, /Check tow/);
  assert.match(detail, /Check payment/);
  assert.match(detail, /data-facts-check-tow/);
  assert.match(detail, /data-facts-check-payment/);
  assert.match(detail, /openTowWithCoach/);
  assert.match(detail, /openCalWithPrice/);
  assert.match(detail, /factsTowOffer/);
  assert.match(detail, /offerFromFactsReport/);
  assert.doesNotMatch(detail, /setTab\("rvtow"\)/);
  assert.doesNotMatch(detail, /openTripsProfile/);
  assert.doesNotMatch(detail, /setTab\("rvtrips"\)/);
  assert.doesNotMatch(fax, /openTripsProfile/);
  assert.doesNotMatch(fax, /setTab\("rvtrips"\)/);

  assert.match(nav, /openTowWithCoach/);
  assert.match(nav, /towHandoff/);
  assert.match(nav, /FactsTowHandoff/);
  assert.match(nav, /FactsTowHandoffOffer/);
  assert.match(shell, /openTowWithCoach/);
  assert.match(shell, /normalizeFactsTowOffer/);
  assert.match(shell, /setTab\("rvtow"\)/);
});
