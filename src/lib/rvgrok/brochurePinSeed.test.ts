import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listOemGvwrPins } from "../rv/floorplanSpecs.ts";
import {
  isRejectedKnowledgeValue,
  mergeConfirmedFields,
} from "./coachKnowledge.ts";
import {
  BROCHURE_PIN_SOURCES,
  collectBrochurePinSeedCandidates,
  isStrictMy2027OemGvwrPin,
  listStrictMy2027OemGvwrPins,
  parseMakesFlag,
} from "./brochurePinSeed.ts";

const root = dirname(fileURLToPath(import.meta.url));
const workspace = join(root, "../../..");

function src(rel: string) {
  return readFileSync(join(workspace, rel), "utf8");
}

test("strict MY2027 filter is ~230 pins and drops wide year-bands", () => {
  const all = listOemGvwrPins();
  const strict = listStrictMy2027OemGvwrPins();
  const wide2027 = all.filter((p) => p.yearMin <= 2024 && p.yearMax >= 2027);

  assert.ok(strict.length >= 220 && strict.length <= 260, `expected ~230 strict pins, got ${strict.length}`);
  assert.ok(wide2027.length >= 10, "SoT still has the wide bands David asked to exclude");
  assert.ok(strict.every(isStrictMy2027OemGvwrPin));
  assert.ok(strict.every((p) => p.yearMin >= 2027 && p.yearMax >= 2027));
  assert.ok(!strict.some((p) => p.yearMin <= 2024));
  assert.ok(
    wide2027.every((p) => !isStrictMy2027OemGvwrPin(p)),
    "2020–2027 Vision XL-style bands must not seed",
  );
});

test("candidates key YMMF, store gvwr only, sources include brochure-pin", () => {
  const nowIso = "2026-09-23T00:00:00.000Z";
  const rows = collectBrochurePinSeedCandidates({ nowIso });
  const strict = listStrictMy2027OemGvwrPins();

  assert.equal(rows.length, strict.length);
  assert.ok(rows.length >= 220);

  for (const row of rows) {
    assert.ok(row.key.year);
    assert.ok(row.key.make);
    assert.ok(row.key.model);
    assert.equal(row.fields.gvwr?.value, String(row.gvwrLbs));
    assert.equal(row.fields.gvwr?.kind, "spec");
    assert.equal(row.fields.gvwr?.researchedAt, nowIso);
    assert.equal(Object.keys(row.fields).join(","), "gvwr");
    assert.ok(row.sources.includes("brochure-pin"));
    assert.deepEqual(row.sources, [...BROCHURE_PIN_SOURCES]);
    assert.equal(row.confidence, "high");
    assert.equal(isRejectedKnowledgeValue(row.fields.gvwr!.value), false);
  }

  const jayco = collectBrochurePinSeedCandidates({
    makes: parseMakesFlag("jayco"),
    nowIso,
  });
  assert.ok(jayco.length > 0 && jayco.length < rows.length);
  assert.ok(jayco.every((r) => /jayco/i.test(r.make)));
});

test("rejects invent / EST values; merge does not wipe organic non-gvwr fields", () => {
  assert.equal(isRejectedKnowledgeValue("32000 typical class range (EST)"), true);
  assert.equal(isRejectedKnowledgeValue("UNAVAILABLE"), true);
  const dropped = mergeConfirmedFields(
    {
      engine: {
        value: "Cummins L9",
        kind: "spec",
        researchedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    {
      gvwr: {
        value: "32000 typical class range (EST)",
        kind: "spec",
        researchedAt: "2026-09-23T00:00:00.000Z",
      },
    },
  );
  assert.equal(dropped.gvwr, undefined);
  assert.equal(dropped.engine?.value, "Cummins L9");

  const kept = mergeConfirmedFields(
    {
      engine: {
        value: "Cummins L9",
        kind: "spec",
        researchedAt: "2026-01-01T00:00:00.000Z",
      },
      uvw: {
        value: "40700",
        kind: "spec",
        researchedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    {
      gvwr: {
        value: "31000",
        kind: "spec",
        researchedAt: "2026-09-23T00:00:00.000Z",
      },
    },
  );
  assert.equal(kept.gvwr?.value, "31000");
  assert.equal(kept.engine?.value, "Cummins L9");
  assert.equal(kept.uvw?.value, "40700");

  const rows = collectBrochurePinSeedCandidates();
  const pinKeys = new Set(
    listStrictMy2027OemGvwrPins().map(
      (p) => `${p.yearMin}|${p.makeIncludes}|${p.modelIncludes}|${p.floorplan}|${p.gvwrLbs}`,
    ),
  );
  for (const row of rows) {
    assert.ok(
      pinKeys.has(`${row.year}|${row.make}|${row.model}|${row.floorplan}|${row.gvwrLbs}`),
      "seed must not invent OEM rows",
    );
  }
});

test("CLI is dry-run default; store upsert only; no live-research imports", () => {
  const cli = src("scripts/seed-coach-knowledge-brochure-pins.mts");
  const helper = src("src/lib/rvgrok/brochurePinSeed.ts");
  assert.match(cli, /--apply/);
  assert.match(cli, /dry-run/);
  assert.match(cli, /upsertCoachKnowledge/);
  assert.match(cli, /brochure-pin/);
  assert.match(helper, /listOemGvwrPins/);
  assert.match(helper, /normalizeCoachKnowledgeKey/);
  assert.doesNotMatch(cli, /from ["'][^"']*planCoachKnowledgeWrite/);
  assert.doesNotMatch(helper, /from ["'][^"']*planCoachKnowledgeWrite/);
  assert.doesNotMatch(cli, /executeWebResearch|fetchGeminiResearchNotes|dial_phonebook/);
  assert.doesNotMatch(helper, /executeWebResearch|fetchGeminiResearchNotes|dial_phonebook/);
  assert.doesNotMatch(helper, /from ["'][^"']*rvData/);
});
