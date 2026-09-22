import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";
import { buildBrochureSpecs } from "../rv/brochureSpecs.ts";
import { installCatalog } from "../rv/catalogLoad.ts";
import {
  findOemFloorplanSpec,
  findOemGvwrLbs,
  findOemHoldingTanks,
  findOemUvwLbs,
} from "../rv/floorplanSpecs.ts";
import {
  DESK_SHEET_FORBIDDEN_LINE,
  DESK_SHEET_PHRASE,
  buildDeskSheetPayload,
  claimsDeskSpecSheet,
  deskSheetIsTowable,
  formatLockedWeightsBlock,
  looksLikeDeskSheetAsk,
  looksLikeLineupOverviewAsk,
  queryNamesYearMakeModel,
  resolveDeskSheet,
  shouldMountDeskSheet,
  stripDuplicateMarkdownSpecSheet,
  withDeskSheetSpeechRule,
} from "./deskSheet.ts";
import { extractChatSpecFigures } from "./chatSpecBlock.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8");
}

const VENTANA_LOCK = {
  year: "2018",
  make: "Newmar",
  model: "Ventana",
  floorplan: "4369",
  updatedAt: "2018-06-01T00:00:00.000Z",
};

test("desk speech claim matches on-the-desk wording", () => {
  assert.equal(claimsDeskSpecSheet("Spec sheet is on the desk."), true);
  assert.equal(claimsDeskSpecSheet("I've put the spec sheet on the desk"), true);
  assert.equal(claimsDeskSpecSheet("Cummins L9 450 on the Freightliner"), false);
});

test("Dutch Star report after Ventana mounts Dutch Star sheet — not Ventana", () => {
  const q = "look up 2022 Dutch Star 4369";
  const history =
    "Give me a report on the 2018 Newmar Ventana 4369.\nVERIFIED CATALOG LOCK is 2018 Newmar Ventana 4369.";
  const identity = resolveCoachIdentity(q, VENTANA_LOCK, history);
  assert.ok(identity);
  assert.match(identity!.model, /dutch star/i);
  assert.doesNotMatch(identity!.model, /ventana/i);
  assert.equal(identity!.year, "2022");
  assert.equal(identity!.floorplan, "4369");
  assert.equal(shouldMountDeskSheet(q, identity), true);

  const mounted = withDeskSheetSpeechRule("CATALOG", q, identity);
  assert.match(mounted, /DESK SPEC SHEET MOUNTED/);
  assert.match(mounted, /Dutch Star/i);
  assert.doesNotMatch(mounted, /DESK SPEC SHEET NOT MOUNTED/);
  assert.doesNotMatch(mounted, /Ventana/i);

  const sheet = resolveDeskSheet({
    query: q,
    identity,
    specs: null,
  });
  assert.ok(sheet);
  assert.match(sheet!.model, /dutch star/i);
  assert.doesNotMatch(sheet!.title, /Ventana/i);
  assert.equal(sheet!.year, "2022");
  assert.equal(sheet!.floorplan, "4369");
  const uvw = sheet!.rows.find((r) => r.label === "UVW");
  const gvwr = sheet!.rows.find((r) => r.label === "GVWR");
  assert.ok(uvw?.gap, "2022 Dutch Star 4369 UVW is GAP — do not invent");
  assert.ok(gvwr?.gap, "2022 Dutch Star 4369 GVWR is GAP — do not invent");
});

test("speech may claim the desk only when the sheet is mounted", () => {
  const id = resolveCoachIdentity("2018 Newmar Ventana 4369 spec report", null, "");
  assert.ok(id);
  assert.equal(
    shouldMountDeskSheet("2018 Newmar Ventana 4369 spec report", id),
    true,
  );
  const mounted = withDeskSheetSpeechRule(
    "CATALOG",
    "2018 Newmar Ventana 4369 spec report",
    id,
  );
  assert.match(mounted, /DESK SPEC SHEET MOUNTED/);
  assert.match(
    mounted,
    new RegExp(DESK_SHEET_PHRASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );

  const hidden = withDeskSheetSpeechRule("hello", "hi", null);
  assert.match(hidden, new RegExp(DESK_SHEET_FORBIDDEN_LINE.slice(0, 24)));
  assert.equal(shouldMountDeskSheet("hi", null), false);
});

test("spoken desk claim still mounts a sheet so speech never lies", () => {
  const id = resolveCoachIdentity("2018 Newmar Ventana 4369", null, "");
  assert.ok(id);
  const sheet = resolveDeskSheet({
    query: "thanks",
    identity: id,
    specs: null,
    spokenText: "Spec sheet is on the desk.",
  });
  assert.ok(sheet);
  assert.match(sheet!.title, /Ventana/);
});

test("2019 Grand Design Solitude 310GK mounts desk sheet with floorplan; towable motors N/A", () => {
  const q =
    "Give me the spec report on the 2019 Grand Design Solitude 310GK. Name the year, make, model, and floorplan. Put the spec sheet on the desk.";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(identity!.floorplan, "310GK");
  assert.equal(identity!.year, "2019");
  assert.equal(identity!.make, "Grand Design");
  assert.match(identity!.model, /solitude/i);
  assert.equal(shouldMountDeskSheet(q, identity), true);

  assert.equal(
    findOemFloorplanSpec("2019", "Grand Design", "Solitude", "310GK"),
    null,
    "Solitude OEM weight pins are not in the book yet",
  );
  assert.equal(findOemGvwrLbs("2019", "Grand Design", "Solitude", "310GK"), null);
  assert.equal(findOemUvwLbs("2019", "Grand Design", "Solitude", "310GK"), null);
  assert.ok(findOemFloorplanSpec("2024", "Grand Design", "Imagine", "2800BH"));
  assert.ok(findOemFloorplanSpec("2023", "Grand Design", "Reflection", "260RD"));
  assert.ok(
    findOemGvwrLbs("2026", "Grand Design", "Lineage Series M", "25FW"),
  );

  const specs = {
    rvType: { value: "Fifth Wheel", trust: "catalog" as const },
    fuelType: { value: "N/A (towable)", trust: "catalog" as const },
    chassis: { value: "N/A (towable)", trust: "catalog" as const },
    engine: { value: null, trust: "empty" as const },
    horsepower: { value: null, trust: "empty" as const },
    torque: { value: null, trust: "empty" as const },
    transmission: { value: null, trust: "empty" as const },
  };
  assert.equal(deskSheetIsTowable(identity!, specs), true);

  const sheet = resolveDeskSheet({
    query: q,
    identity,
    specs,
  });
  assert.ok(sheet);
  assert.equal(sheet!.floorplan, "310GK");
  assert.match(sheet!.title, /310GK/);
  assert.match(sheet!.title, /2019 Grand Design Solitude/);
  const engine = sheet!.rows.find((r) => r.label === "Engine");
  const hp = sheet!.rows.find((r) => r.label === "Horsepower");
  const torque = sheet!.rows.find((r) => r.label === "Torque");
  const trans = sheet!.rows.find((r) => r.label === "Transmission");
  const gvwr = sheet!.rows.find((r) => r.label === "GVWR");
  const uvw = sheet!.rows.find((r) => r.label === "UVW");
  assert.equal(engine?.value, "N/A");
  assert.equal(engine?.gap, false);
  assert.equal(hp?.value, "N/A");
  assert.equal(hp?.gap, false);
  assert.equal(torque?.value, "N/A");
  assert.equal(torque?.gap, false);
  assert.equal(trans?.value, "N/A");
  assert.equal(trans?.gap, false);
  assert.ok(gvwr?.gap, "Solitude 310GK GVWR is GAP — no OEM pin");
  assert.ok(uvw?.gap, "Solitude 310GK UVW is GAP — no OEM pin");
});

test("bare year/make/model (no spec-report prompt) does not mount the desk", () => {
  for (const q of [
    "2019 Grand Design Solitude 310GK",
    "2022 Newmar Dutch Star",
    "2025 Entegra Coach Aspire 44R",
  ]) {
    assert.equal(queryNamesYearMakeModel(q), true, q);
    assert.equal(looksLikeDeskSheetAsk(q), false, q);
    const identity = resolveCoachIdentity(q, null, "");
    assert.ok(identity, q);
    assert.equal(shouldMountDeskSheet(q, identity), false, q);
    assert.equal(resolveDeskSheet({ query: q, identity, specs: null }), null, q);
  }

  const synthesized = resolveDeskSheet({
    query: "2018 Newmar Ventana 4369 spec report",
    identity: null,
    specs: null,
  });
  assert.ok(synthesized, "Y/M/M/FP + spec ask synthesizes identity when grounding missed");
  assert.match(synthesized!.title, /2018 Newmar Ventana/);
  assert.equal(synthesized!.floorplan, "4369");

  assert.equal(queryNamesYearMakeModel("Match me to a coach"), false);
  assert.equal(queryNamesYearMakeModel("Troubleshoot my RV"), false);
  assert.equal(shouldMountDeskSheet("hi", null), false);
  assert.equal(
    resolveDeskSheet({ query: "Match me to a coach", identity: null, specs: null }),
    null,
  );
});

test("lineup / series overview does not mount the desk sheet", () => {
  for (const q of [
    "Tell me about Grand Design's motorized Lineage lineup — how many floorplans?",
    "What's the Grand Design Lineage series overview?",
    "Grand Design Lineage — is that their motorized series?",
    "Grand Design Lineage",
    "what series are in Grand Design Lineage",
    "motorized Lineage lineup",
    "Which series are in the motorized Lineage lineup?",
  ]) {
    assert.equal(looksLikeDeskSheetAsk(q), false, q);
    const identity = resolveCoachIdentity(q, null, "");
    assert.equal(shouldMountDeskSheet(q, identity), false, q);
    assert.equal(resolveDeskSheet({ query: q, identity, specs: null }), null, q);
    const speech = withDeskSheetSpeechRule("CATALOG", q, identity);
    assert.match(speech, /DESK SPEC SHEET NOT MOUNTED/);
  }
  for (const q of [
    "what series are in Grand Design Lineage",
    "motorized Lineage lineup",
    "Which series are in the motorized Lineage lineup?",
    "series in Grand Design's motorized lineup",
  ]) {
    assert.equal(looksLikeLineupOverviewAsk(q), true, q);
  }
});

test("live FAIL: What series are in Grand Design's motorized Lineage lineup? does not mount desk", () => {
  const q = "What series are in Grand Design's motorized Lineage lineup?";
  assert.equal(looksLikeLineupOverviewAsk(q), true);
  assert.equal(looksLikeDeskSheetAsk(q), false);
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity, "make+model extract still names Grand Design Lineage");
  assert.match(identity!.make, /grand design/i);
  assert.match(identity!.model, /lineage/i);
  assert.equal(identity!.year, "");
  assert.equal(identity!.floorplan, "");
  assert.equal(shouldMountDeskSheet(q, identity), false);
  assert.equal(resolveDeskSheet({ query: q, identity, specs: null }), null);

  const sot =
    "That's the confirmed book: M, F, E, VT, and VP. Class C and Class B. No other Lineage series on the OEM pages. Example weights are a 9,950 GVWR and a 12,600 GCWR. Spec sheet is on the desk.";
  assert.equal(claimsDeskSpecSheet(sot), true);
  assert.equal(
    resolveDeskSheet({
      query: q,
      identity,
      specs: null,
      spokenText: sot,
      chatSpecBlock: sot,
    }),
    null,
    "chat SoT / on-the-desk speech must not remount a lineup ask",
  );
  const speech = withDeskSheetSpeechRule("CATALOG", q, identity);
  assert.match(speech, /DESK SPEC SHEET NOT MOUNTED/);
});

test("explicit spec report / GVWR still mounts the desk after lineup gate", () => {
  const full =
    "full specs report for 2021 American Coach American Dream 42Q — GVWR UVW fuel tanks engine";
  const short = "American Dream 42Q GVWR";
  for (const q of [full, short]) {
    assert.equal(looksLikeLineupOverviewAsk(q), false, q);
    assert.equal(looksLikeDeskSheetAsk(q), true, q);
    const identity = resolveCoachIdentity(q, null, "");
    assert.ok(identity, q);
    assert.match(identity!.make, /american coach/i);
    assert.match(identity!.model, /american dream/i);
    assert.equal(shouldMountDeskSheet(q, identity), true, q);
    const sheet = resolveDeskSheet({ query: q, identity, specs: null });
    assert.ok(sheet, q);
    assert.match(sheet!.title, /American Dream/i);
    assert.ok(sheet!.rows.some((r) => r.label === "GVWR"));
  }
});

test("2022 Lineage 31ZW GVWR / full report mounts the desk sheet", () => {
  const q = "2022 Lineage 31ZW GVWR / full report";
  assert.equal(looksLikeDeskSheetAsk(q), true);
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.match(identity!.model, /lineage/i);
  assert.equal(shouldMountDeskSheet(q, identity), true);
  const sheet = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(sheet);
  assert.match(sheet!.title, /Lineage/i);
  assert.ok(sheet!.rows.some((r) => r.label === "GVWR"));
});

test("non-spec follow-up after a locked coach does not remount the desk", () => {
  const lock = resolveCoachIdentity(
    "2022 Lineage 31ZW GVWR / full report",
    null,
    "",
  );
  assert.ok(lock);
  const q = "how many floorplans does that lineup have?";
  assert.equal(looksLikeDeskSheetAsk(q), false);
  assert.equal(shouldMountDeskSheet(q, lock), false);
  assert.equal(resolveDeskSheet({ query: q, identity: lock, specs: null }), null);
});

test("misspelled but clear spec ask still mounts the desk", () => {
  const q = "whats the gvwr on the 2022 lineage 31zw";
  assert.equal(looksLikeDeskSheetAsk(q), true);
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(shouldMountDeskSheet(q, identity), true);
  assert.ok(resolveDeskSheet({ query: q, identity, specs: null }));

  const spek = "2022 lineage 31zw spek report";
  assert.equal(looksLikeDeskSheetAsk(spek), true);
  const spekId = resolveCoachIdentity(spek, null, "");
  assert.ok(spekId);
  assert.equal(shouldMountDeskSheet(spek, spekId), true);
});

test("desk sheet still renders with GAP rows when powertrain is thin", () => {
  const id = {
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
    source: "message" as const,
  };
  const sheet = buildDeskSheetPayload(id, null);
  assert.match(sheet.title, /Dutch Star/);
  assert.ok(sheet.rows.some((r) => r.gap));
  assert.equal(
    sheet.rows.find((r) => r.label === "UVW")?.value,
    "GAP",
  );
});

test("last assistant spec block paints GVWR/UVW/fuel — never Confirm brochure over a spoken number", () => {
  const q = "2019 Newmar Dutch Star 4369 spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  const chat = `2019 Newmar Dutch Star 4369 — Class A diesel. Live notes put GVWR at 51,000 pounds, UVW around 40,000 to 40,700, 150-gallon fuel tank, 15,000-pound tow.`;
  const figs = extractChatSpecFigures(chat);
  assert.match(figs.gvwr || "", /51,000/);

  const before = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(before);
  const gvwrBefore = before!.rows.find((r) => r.label === "GVWR");
  assert.ok(
    gvwrBefore?.gap || /confirm brochure|gap/i.test(gvwrBefore?.value || ""),
    "catalog pin is missing — desk starts empty",
  );

  const after = resolveDeskSheet({
    query: q,
    identity,
    specs: null,
    chatSpecBlock: chat,
  });
  assert.ok(after);
  const val = (label: string) =>
    after!.rows.find((r) => r.label === label)?.value;
  const gap = (label: string) =>
    after!.rows.find((r) => r.label === label)?.gap;
  assert.equal(gap("GVWR"), false);
  assert.match(val("GVWR") || "", /51,000/);
  assert.doesNotMatch(val("GVWR") || "", /Confirm brochure/i);
  assert.match(val("UVW") || "", /40,000/);
  assert.equal(val("Fuel capacity"), "150 gal");
  assert.doesNotMatch(val("Fuel capacity") || "", /100/);
  assert.doesNotMatch(after!.presenceNote, /SERIES MISSING/i);
  assert.doesNotMatch(after!.presenceNote, /Say the series is missing/i);
  assert.equal(after!.presenceNote, "");
  assert.equal(after!.gaps.length, 0, "hide GAP lecture once chat named a number");
  assert.match(src(root, "deskSheet.ts"), /chatSpecBlock/);
  assert.match(src(root, "chatSpecBlock.ts"), /last assistant/i);
});

test("desk paints holding tanks from chat — never Confirm brochure over spoken gallons", () => {
  const q = "2019 Newmar Dutch Star 4369 spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  const chat =
    "2019 Newmar Dutch Star 4369. Holding tanks: fresh ~35, gray/black ~34.";

  const before = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(before);
  assert.ok(before!.rows.some((r) => r.label === "Fresh"));
  assert.ok(before!.rows.some((r) => r.label === "Gray"));
  assert.ok(before!.rows.some((r) => r.label === "Black"));

  const after = resolveDeskSheet({
    query: q,
    identity,
    specs: null,
    chatSpecBlock: chat,
  });
  assert.ok(after);
  const val = (label: string) =>
    after!.rows.find((r) => r.label === label)?.value;
  const gap = (label: string) =>
    after!.rows.find((r) => r.label === label)?.gap;
  assert.equal(val("Fresh"), "35 gal");
  assert.equal(gap("Fresh"), false);
  assert.equal(val("Gray"), "34 gal");
  assert.equal(val("Black"), "34 gal");
  assert.doesNotMatch(val("Fresh") || "", /Confirm brochure|GAP/i);
  assert.doesNotMatch(val("Gray") || "", /Confirm brochure|GAP/i);
  assert.equal(after!.presenceNote, "");
  assert.equal(after!.gaps.length, 0, "hide GAP lecture once chat named tank gallons");
});

test("2026 Lineage 31ZW chat prose paints Super C / F-600 / 6.7 / 330 / 950 / tanks and hides GAP lecture", () => {
  const q = "2026 Grand Design Lineage 31ZW spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(identity!.year, "2026");
  assert.match(identity!.make, /grand design/i);
  assert.match(identity!.model, /lineage/i);
  assert.equal(identity!.floorplan, "31ZW");
  assert.doesNotMatch(identity!.make, /newmar/i);
  assert.doesNotMatch(identity!.model, /dutch star/i);

  const chat = `2026 Grand Design Lineage 31ZW is a Super C on a Ford F-600 4x4. 6.7-liter diesel putting out 330 horsepower and 950 pound-feet of torque, 10-speed. GVWR 22,000, GCWR 43,500. Holding tanks: fresh 79, gray 66, black 45.`;

  const after = resolveDeskSheet({
    query: q,
    identity,
    specs: null,
    chatSpecBlock: chat,
  });
  assert.ok(after);
  const val = (label: string) =>
    after!.rows.find((r) => r.label === label)?.value || "";
  const gap = (label: string) =>
    after!.rows.find((r) => r.label === label)?.gap;
  assert.equal(val("Class"), "Super C");
  assert.equal(gap("Class"), false);
  assert.match(val("Chassis"), /F-?600/i);
  assert.match(val("Chassis"), /4x4/i);
  assert.match(val("Engine"), /6\.7/);
  assert.match(val("Fuel"), /diesel/i);
  assert.match(val("Horsepower"), /330/);
  assert.match(val("Torque"), /950/);
  assert.match(val("Transmission"), /10-speed/i);
  assert.match(val("GVWR"), /22,000/);
  assert.match(val("GCWR"), /43,500/);
  assert.equal(val("Fresh"), "79 gal");
  assert.equal(val("Gray"), "66 gal");
  assert.equal(val("Black"), "45 gal");
  assert.equal(after!.presenceNote, "");
  assert.equal(after!.gaps.length, 0);
  assert.doesNotMatch(after!.presenceNote, /SERIES MISSING|YEAR GAP|FLOORPLAN GAP|GAP over invent/i);
});

test("2026 Lineage Series F 31ZW pin tanks/fuel paint without live catalog — chat only named GVWR", () => {
  const tanks = findOemHoldingTanks(
    "2026",
    "Grand Design",
    "Lineage Series F",
    "31ZW",
  );
  assert.equal(tanks.freshWater, 79);
  assert.equal(tanks.grayWater, 66);
  assert.equal(tanks.blackWater, 45);
  assert.equal(tanks.fuelCapacityGal, 66.5);
  assert.equal(findOemUvwLbs("2026", "Grand Design", "Lineage Series F", "31ZW"), null);

  const q = "2026 Grand Design Lineage 31ZW spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(identity!.model, "Lineage Series F");
  assert.equal(identity!.floorplan, "31ZW");

  const chat =
    "The 2026 Grand Design Lineage 31ZW has a factory GVWR of 22,000 pounds. Web search timed out on this one, but the verified catalog weight is locked in.";
  const sheet = resolveDeskSheet({
    query: q,
    identity,
    specs: null,
    chatSpecBlock: chat,
  });
  assert.ok(sheet);
  const val = (label: string) =>
    sheet!.rows.find((r) => r.label === label)?.value || "";
  const gap = (label: string) =>
    sheet!.rows.find((r) => r.label === label)?.gap;
  assert.match(val("GVWR"), /22,000/);
  assert.equal(val("Fresh"), "79 gal");
  assert.equal(val("Gray"), "66 gal");
  assert.equal(val("Black"), "45 gal");
  assert.match(val("Fuel capacity"), /67\s*gal/i);
  assert.equal(gap("Fresh"), false);
  assert.equal(gap("Fuel capacity"), false);
  assert.ok(gap("UVW"), "no published UVW — do not invent");
  assert.equal(val("UVW"), "GAP");
});

test("2026 Lineage Series F 31ZW catalog tanks/fuel paint when chat only names GVWR", async () => {
  const live = await loadLiveCatalog();
  installCatalog({ RV_DATA: live.RV_DATA, MAKES: live.MAKES });
  const spec = live.RV_DATA["Grand Design"]?.["Lineage Series F"];
  assert.ok(spec, "Series F catalog row exists");
  assert.equal(spec.freshWater, 79);
  assert.equal(spec.grayWater, 66);
  assert.equal(spec.blackWater, 45);
  assert.equal(spec.fuelCapacityGal, 66.5);
  assert.equal(spec.uvwLbs, undefined, "no published UVW — do not invent");

  const q = "2026 Grand Design Lineage 31ZW spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(identity!.year, "2026");
  assert.match(identity!.make, /grand design/i);
  assert.equal(identity!.model, "Lineage Series F");
  assert.equal(identity!.floorplan, "31ZW");

  const brochure = buildBrochureSpecs(
    spec,
    "2026",
    "Grand Design",
    "Lineage Series F",
    "31ZW",
  );
  assert.equal(brochure.freshWater, "79 gal");
  assert.equal(brochure.grayWater, "66 gal");
  assert.equal(brochure.blackWater, "45 gal");
  assert.match(brochure.fuelCapacity, /67\s*gal/i);
  assert.equal(brochure.uvwLbs, null);

  const chat =
    "The 2026 Grand Design Lineage 31ZW has a factory GVWR of 22,000 pounds. Search came back empty again.";
  const sheet = resolveDeskSheet({
    query: q,
    identity,
    specs: null,
    chatSpecBlock: chat,
  });
  assert.ok(sheet);
  const val = (label: string) =>
    sheet!.rows.find((r) => r.label === label)?.value || "";
  const gap = (label: string) =>
    sheet!.rows.find((r) => r.label === label)?.gap;
  assert.equal(val("Class"), "Super C");
  assert.match(val("GVWR"), /22,000/);
  assert.equal(gap("GVWR"), false);
  assert.equal(val("Fresh"), "79 gal");
  assert.equal(val("Gray"), "66 gal");
  assert.equal(val("Black"), "45 gal");
  assert.equal(gap("Fresh"), false);
  assert.match(val("Fuel capacity"), /67\s*gal/i);
  assert.equal(gap("Fuel capacity"), false);
  assert.ok(gap("UVW"), "UVW stays GAP — catalog has no published UVW");
  assert.equal(val("UVW"), "GAP");
  assert.equal(sheet!.floorplan, "31ZW");
  assert.match(sheet!.model, /lineage series f/i);
});

test("catalog tank pins stay when chat does not name gallons", () => {
  const q = "2025 Entegra Coach Aspire 44R spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  const sheet = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(sheet);
  const fresh = sheet!.rows.find((r) => r.label === "Fresh");
  const gray = sheet!.rows.find((r) => r.label === "Gray");
  const black = sheet!.rows.find((r) => r.label === "Black");
  assert.ok(fresh);
  assert.ok(gray);
  assert.ok(black);
  if (fresh && !fresh.gap && !/confirm brochure|gap/i.test(fresh.value)) {
    assert.match(fresh.value, /\d+\s*gal/i);
  }
});

test("no chat spec numbers → do not invent over a catalog miss", () => {
  const id = {
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
    source: "message" as const,
  };
  const sheet = buildDeskSheetPayload(id, null, "What do you want to know next?");
  const gvwr = sheet.rows.find((r) => r.label === "GVWR");
  assert.ok(gvwr?.gap || /gap|confirm brochure/i.test(gvwr?.value || ""));
  assert.doesNotMatch(gvwr?.value || "", /51,000/);
});

test("2025 Entegra Aspire 44R pins GVWR 49000 — desk and speech never GAP it; UVW stays GAP", () => {
  assert.equal(findOemGvwrLbs("2025", "Entegra Coach", "Aspire", "44R"), 49000);
  assert.equal(findOemUvwLbs("2025", "Entegra Coach", "Aspire", "44R"), null);

  const q = "2025 Entegra Coach Aspire 44R spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(identity!.year, "2025");
  assert.match(identity!.make, /entegra/i);
  assert.match(identity!.model, /aspire/i);
  assert.equal(identity!.floorplan, "44R");

  const sheet = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(sheet);
  const gvwr = sheet!.rows.find((r) => r.label === "GVWR");
  const uvw = sheet!.rows.find((r) => r.label === "UVW");
  assert.equal(gvwr?.gap, false, "desk payload GVWR must not be GAP");
  assert.match(gvwr?.value || "", /49,000/);
  assert.ok(uvw?.gap, "Aspire UVW stays GAP — no OEM UVW pin");
  assert.equal(uvw?.value, "GAP");

  const locked = formatLockedWeightsBlock(identity!);
  assert.match(locked, /LOCKED WEIGHTS/);
  assert.match(locked, /VERIFIED GVWR 49000 from OEM pin/);
  assert.match(locked, /UVW: GAP — no OEM pin/);
  assert.match(locked, /Do not say you lack GVWR/i);

  const spoken = withDeskSheetSpeechRule("CATALOG", q, identity);
  assert.match(spoken, /DESK SPEC SHEET MOUNTED/);
  assert.match(spoken, /VERIFIED GVWR 49000 from OEM pin/);
  assert.match(spoken, /Do not say you lack GVWR/i);
  assert.match(spoken, /do not output a second markdown Spec Sheet/i);
  assert.doesNotMatch(
    spoken,
    /I don't have GVWR/,
    "spoken instruction must not teach 'I don't have GVWR' when the pin is present",
  );
});

test("duplicate markdown spec sheet is stripped when the desk card is the written sheet", () => {
  const spoken =
    "The 2025 Aspire 44R is a 49,000 pound GVWR diesel pusher. Spec sheet is on the desk.";
  const dup = `${spoken}

## Spec Sheet
Weight ratings GVWR/GCWR/UVW/NCC: GAP
`;
  assert.equal(stripDuplicateMarkdownSpecSheet(dup), spoken);
  assert.equal(stripDuplicateMarkdownSpecSheet(spoken), spoken);
});

test("2022 Tiffin Phaeton 40IH: Grok desk paints the same Facts brochure snapshot", async () => {
  const live = await loadLiveCatalog();
  installCatalog({ RV_DATA: live.RV_DATA, MAKES: live.MAKES });
  const spec = live.RV_DATA.Tiffin?.Phaeton;
  assert.ok(spec, "expected Tiffin Phaeton in the live catalog");
  const brochure = buildBrochureSpecs(spec, "2022", "Tiffin", "Phaeton", "40IH");

  // Pin-only tables do not cover 2022 — that was the desk GAP bug.
  assert.equal(findOemGvwrLbs("2022", "Tiffin", "Phaeton", "40IH"), null);
  assert.equal(findOemUvwLbs("2022", "Tiffin", "Phaeton", "40IH"), null);
  assert.equal(brochure.gvwrLbs, 39_600);
  assert.equal(brochure.uvwLbs, 33_500);
  assert.equal(brochure.cccLbs, 6_100);

  const q = "2022 Tiffin Phaeton 40IH spec report";
  const identity = resolveCoachIdentity(q, null, "");
  assert.ok(identity);
  assert.equal(identity!.year, "2022");
  assert.match(identity!.make, /tiffin/i);
  assert.match(identity!.model, /phaeton/i);
  assert.equal(identity!.floorplan, "40IH");

  const sheet = resolveDeskSheet({ query: q, identity, specs: null });
  assert.ok(sheet);
  const val = (label: string) =>
    sheet!.rows.find((r) => r.label === label)?.value;
  const gap = (label: string) =>
    sheet!.rows.find((r) => r.label === label)?.gap;

  assert.equal(val("GVWR"), brochure.gvwr);
  assert.equal(gap("GVWR"), false);
  assert.equal(val("UVW"), brochure.uvw);
  assert.equal(gap("UVW"), false);
  assert.equal(val("CCC"), brochure.ccc);
  assert.equal(val("Generator"), brochure.generator);
  assert.equal(val("Fuel capacity"), brochure.fuelCapacity);
  assert.equal(val("Tow capacity"), brochure.hitchOrPin);
  assert.equal(val("A/C"), brochure.acUnits);
  assert.equal(val("Engine"), brochure.engine);
  assert.equal(val("Horsepower"), brochure.horsepower);
  assert.equal(val("Torque"), brochure.torque);
  assert.equal(val("Chassis"), brochure.chassis);
  assert.equal(val("Class"), brochure.type);
  assert.equal(val("Fuel"), brochure.fuelType);
  assert.match(val("GVWR") || "", /39,?600/);
  assert.match(val("UVW") || "", /33,?500/);
  assert.match(val("CCC") || "", /6,?100/);
  assert.match(val("Generator") || "", /Onan 10\.0 kW/i);
  assert.match(val("Fuel capacity") || "", /100\s*gal/i);
  assert.match(val("Tow capacity") || "", /10,?000/);

  const locked = formatLockedWeightsBlock(identity!);
  assert.match(locked, /VERIFIED GVWR 39600/);
  assert.match(locked, /VERIFIED UVW 33500/);
  assert.doesNotMatch(src(root, "factsBrochure.ts"), /[Dd]ialaBot/);
  assert.match(src(root, "deskSheet.ts"), /resolveFactsBrochure/);
  assert.match(src(root, "deskSheet.ts"), /buildBrochureSpecs/);
});

test("desk remount after Lineage history is not Grand Design Dutch Star", () => {
  const extra = [
    "2020 tiffin phaeton 40ih",
    "2025 grand design lineage 25fw",
    "what about the holding tanks",
  ].join("\n");
  const identity = resolveCoachIdentity(
    "put the spec sheet on the desk",
    {
      year: "2025",
      make: "Grand Design",
      model: "Lineage Series M",
      floorplan: "25FW",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    extra,
  );
  assert.ok(identity);
  const sheet = resolveDeskSheet({
    query: "put the spec sheet on the desk",
    identity,
    specs: null,
  });
  assert.ok(sheet);
  assert.equal(sheet!.make, "Grand Design");
  assert.match(sheet!.model, /lineage/i);
  assert.doesNotMatch(sheet!.title, /Dutch Star/i);
  assert.doesNotMatch(sheet!.make, /Newmar/i);
  assert.doesNotMatch(sheet!.title, /Grand Design Dutch Star/i);
  assert.doesNotMatch(sheet!.presenceNote, /Grand Design Dutch Star/i);
});

test("desk sheet is wired through chat, live voice, and speech policy", () => {
  const app = src(join(root, "../../components/rvgrok"), "RvGrokApp.tsx");
  const bubble = src(join(root, "../../components/rvgrok"), "MessageBubble.tsx");
  const realtime = src(root, "realtime.ts");
  const voice = src(root, "voice.ts");
  const prompts = src(root, "prompts.ts");
  const grounding = src(root, "grounding.ts");
  assert.match(app, /resolveDeskSheet/);
  assert.match(app, /onDeskSheet/);
  assert.match(app, /DeskSpecSheet/);
  assert.match(app, /liveDeskSheet/);
  assert.match(app, /chatSpecBlock/);
  assert.match(app, /deskRevealAfterIndex/);
  assert.match(app, /data-rvgrok-desk-after-reply/);
  assert.match(src(root, "deskSheetPolicy.ts"), /queryNamesYearMakeModel/);
  assert.match(src(root, "deskSheetPolicy.ts"), /looksLikeDeskSheetAsk/);
  assert.match(src(root, "deskSheetPolicy.ts"), /looksLikeLineupOverviewAsk/);
  assert.match(src(root, "deskSheetPolicy.ts"), /looksLikeSpecQuestion/);
  assert.match(src(root, "deskSheet.ts"), /looksLikeLineupOverviewAsk\(query\)/);
  assert.doesNotMatch(app, /deskSheet: paintedDesk \|\| m\.deskSheet/);
  assert.doesNotMatch(
    app,
    /claimsDeskSpecSheet\(text\) \? sheet/,
  );
  assert.doesNotMatch(realtime, /if \(painted\) this\.handlers\.onDeskSheet/);
  assert.doesNotMatch(app, /2019 Grand Design Solitude 310GK/);
  assert.match(bubble, /DeskSpecSheet/);
  assert.match(bubble, /deskSheet/);
  assert.match(bubble, /stripDuplicateMarkdownSpecSheet/);
  assert.match(bubble, /data-rvgrok-desk-after-reply/);
  assert.match(realtime, /onDeskSheet/);
  assert.match(realtime, /resolveDeskSheet/);
  assert.match(voice, /DESK SPEC SHEET/);
  assert.match(voice, /Spec sheet is on the desk/);
  assert.match(prompts, /DESK SPEC SHEET/);
  assert.match(prompts, /LOCKED WEIGHTS/);
  assert.match(grounding, /withDeskSheetSpeechRule/);
  assert.match(grounding, /formatLockedWeightsBlock/);
  assert.match(grounding, /resolveLockedOemWeights/);
  assert.match(grounding, /VERIFIED GVWR/);
  assert.match(grounding, /never say you don't have GVWR/i);
  assert.match(src(root, "lockedWeights.ts"), /VERIFIED GVWR/);
  assert.match(src(root, "lockedWeights.ts"), /resolveFactsBrochure/);
  assert.match(src(root, "liveVoice.ts"), /never say you don't have GVWR/i);
  assert.match(src(root, "voice.ts"), /LOCKED WEIGHTS/);
  assert.match(src(root, "speechPolicy.ts"), /LOCKED WEIGHTS/);
  assert.doesNotMatch(src(root, "deskSheet.ts"), /[Dd]ialaBot/);
  assert.match(src(root, "deskSheet.ts"), /brochureRow\("Fresh"/);
  assert.match(src(root, "deskSheet.ts"), /brochureRow\("Gray"/);
  assert.match(src(root, "deskSheet.ts"), /brochureRow\("Black"/);
  assert.match(src(root, "deskSheet.ts"), /uvwLbs != null && !brochure\.uvwEstimated/);
  assert.match(src(root, "chatSpecBlock.ts"), /firstTankGallons/);
  assert.match(prompts, /holding tanks/);
  assert.match(realtime, /ensureCatalogLoaded/);
  assert.match(app, /await ensureCatalogLoaded\(\)/);
  assert.doesNotMatch(
    app,
    /if \(facts\?\.year && facts\.make && facts\.model\) \{\s*try \{\s*await ensureCatalogLoaded/,
  );
});
