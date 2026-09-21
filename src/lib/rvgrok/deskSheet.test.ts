import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCoachIdentity } from "./coachIdentity.ts";
import {
  DESK_SHEET_FORBIDDEN_LINE,
  DESK_SHEET_PHRASE,
  buildDeskSheetPayload,
  claimsDeskSpecSheet,
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
