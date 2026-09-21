import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import {
  findOemFloorplanSpec,
  findOemGvwrLbs,
  findOemUvwLbs,
} from "../rv/floorplanSpecs.ts";
import {
  DESK_SHEET_FORBIDDEN_LINE,
  DESK_SHEET_PHRASE,
  buildDeskSheetPayload,
  claimsDeskSpecSheet,
  deskSheetIsTowable,
  resolveDeskSheet,
  shouldMountDeskSheet,
  withDeskSheetSpeechRule,
} from "./deskSheet.ts";

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
  const id = resolveCoachIdentity("2018 Newmar Ventana 4369", null, "");
  assert.ok(id);
  assert.equal(shouldMountDeskSheet("2018 Newmar Ventana 4369", id), true);
  const mounted = withDeskSheetSpeechRule(
    "CATALOG",
    "2018 Newmar Ventana 4369",
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
  assert.match(bubble, /DeskSpecSheet/);
  assert.match(bubble, /deskSheet/);
  assert.match(realtime, /onDeskSheet/);
  assert.match(realtime, /resolveDeskSheet/);
  assert.match(voice, /DESK SPEC SHEET/);
  assert.match(voice, /Spec sheet is on the desk/);
  assert.match(prompts, /DESK SPEC SHEET/);
  assert.match(grounding, /withDeskSheetSpeechRule/);
  assert.doesNotMatch(src(root, "deskSheet.ts"), /[Dd]ialaBot/);
});
