import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCoachFromText } from "./parseCoach.ts";
import {
  askNamesCoachIdentity,
  namedCoachConflictsLock,
  resolveCatalogMake,
  resolveCoachIdentity,
} from "./coachIdentity.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(dir: string, name: string) {
  return readFileSync(join(dir, name), "utf8");
}

const LINEAGE_LOCK = {
  year: "2026",
  make: "Grand Design",
  model: "Lineage Series M",
  floorplan: "25FW",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function catalogLabel(id: {
  year: string;
  make: string;
  model: string;
  floorplan: string;
}): string {
  return [id.year, id.make, id.model, id.floorplan].filter(Boolean).join(" ");
}

test("Integra is Entegra Coach and conflicts with a Lineage lock", () => {
  assert.equal(resolveCatalogMake("Integra"), "Entegra Coach");
  assert.equal(resolveCatalogMake("Entegra"), "Entegra Coach");
  for (const q of ["27A Integra Vision", "Entegra Vision 27ASE"]) {
    const parsed = parseCoachFromText(q);
    assert.equal(askNamesCoachIdentity(parsed), true, q);
    assert.equal(namedCoachConflictsLock(parsed, LINEAGE_LOCK), true, q);
  }
  assert.equal(
    namedCoachConflictsLock(parseCoachFromText("What's the HP?"), LINEAGE_LOCK),
    false,
  );
  assert.equal(
    namedCoachConflictsLock(
      parseCoachFromText("What engine does the Lineage M have?"),
      LINEAGE_LOCK,
    ),
    false,
  );
});

test("a newly named Integra / Entegra Vision ask breaks a sticky Lineage lock", () => {
  const lineageHistory =
    "I'd like to know about the 2026 Grand Design Lineage M series.\nVERIFIED CATALOG LOCK is 2026 Grand Design Lineage Series M.";

  for (const q of ["27A Integra Vision", "Entegra Vision 27ASE"]) {
    const id = resolveCoachIdentity(q, LINEAGE_LOCK, lineageHistory);
    assert.ok(id, q);
    assert.match(id!.make, /Entegra/i, q);
    assert.match(id!.model, /vision/i, q);
    assert.doesNotMatch(id!.make, /Grand Design/i, q);
    assert.doesNotMatch(id!.model, /lineage/i, q);
    assert.equal(id!.source, "message", q);
    assert.match(id!.floorplan, /27A/i, q);
    const label = catalogLabel(id!);
    assert.match(label, /Vision/i, q);
    assert.doesNotMatch(label, /Lineage/i, q);
  }
});

test("same-coach Lineage follow-up without renaming keeps the lock", () => {
  const hp = resolveCoachIdentity("What's the HP on this coach?", LINEAGE_LOCK);
  assert.ok(hp);
  assert.equal(hp!.year, "2026");
  assert.equal(hp!.make, "Grand Design");
  assert.match(hp!.model, /lineage/i);
  assert.equal(hp!.source, "facts");
  assert.doesNotMatch(catalogLabel(hp!), /Vision/i);

  const named = resolveCoachIdentity(
    "What engine does the Lineage M have?",
    LINEAGE_LOCK,
  );
  assert.ok(named);
  assert.equal(named!.year, "2026");
  assert.equal(named!.make, "Grand Design");
  assert.match(named!.model, /lineage/i);
  assert.doesNotMatch(named!.model, /vision/i);
});

test("yearless Vision ask without a lock still resolves Vision, not null", () => {
  const id = resolveCoachIdentity("27A Integra Vision", null, "");
  assert.ok(id);
  assert.match(id!.make, /Entegra/i);
  assert.match(id!.model, /vision/i);
  assert.equal(id!.floorplan, "27A");
  assert.equal(id!.source, "message");
});

test("lock-break is wired through chat, voice, and the API stream", () => {
  const identity = src(root, "coachIdentity.ts");
  const grounding = src(root, "grounding.ts");
  const app = src(join(root, "../../components/rvgrok"), "RvGrokApp.tsx");
  const api = src(join(root, "../../routes/api"), "rvgrok.ts");
  assert.match(identity, /namedCoachConflictsLock/);
  assert.match(identity, /queryNamesCoach/);
  assert.match(grounding, /resolveCoachIdentity/);
  assert.match(grounding, /THIS turn's lock/);
  assert.match(app, /filter\(\(m\) => m\.role === "user"\)/);
  assert.match(api, /lastNamesCoach/);
  assert.match(api, /askNamesCoachIdentity/);
  const realtime = src(root, "realtime.ts");
  assert.match(realtime, /namedCoachConflictsLock/);
});
