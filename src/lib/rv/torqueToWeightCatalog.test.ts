import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatCatalogTorqueScoreMarkdown,
  listCatalogTorqueToWeightScores,
} from "./torqueToWeightCatalog.ts";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";

const root = dirname(fileURLToPath(import.meta.url));

test("catalog helper lists published torque+GVWR; scores #358 weight; champions ~10.0", async () => {
  const { RV_DATA } = await loadLiveCatalog();
  const report = listCatalogTorqueToWeightScores(RV_DATA);

  assert.ok(report.motorized > 0, "expected motorized catalog models");
  assert.ok(report.naTowable > 0, "towables stay N/A");
  assert.ok(
    report.gapMissingTorque + report.gapMissingGvwr + report.gapMissingBoth >
      0,
    "GAP counts must be reported — do not invent torque/GVWR",
  );

  const dream = report.scored.find(
    (r) =>
      /american coach/i.test(r.make) &&
      /american dream/i.test(r.model) &&
      r.torqueLbFt === 1950 &&
      r.gvwrLbs === 51_000,
  );
  assert.ok(dream, "American Dream 45A 1950/51000 must score from published pin");
  assert.equal(dream.formula, "class-a-diesel");
  assert.ok(Math.abs(dream.score - 10) <= 0.05, `Dream score ${dream.score}`);

  const alante = report.scored.find(
    (r) =>
      /jayco/i.test(r.make) &&
      /^alante$/i.test(r.model) &&
      r.torqueLbFt === 468 &&
      r.gvwrLbs === 18_000,
  );
  assert.ok(alante, "Alante 27A 468/18000 OEM pin");
  assert.equal(alante.formula, "class-a-gas");
  assert.ok(Math.abs(alante.score - 10) <= 0.05, `Alante score ${alante.score}`);

  const lineage = report.scored.find(
    (r) =>
      /grand design/i.test(r.make) &&
      /lineage series f/i.test(r.model) &&
      r.torqueLbFt === 950 &&
      r.gvwrLbs === 22_000,
  );
  assert.ok(lineage, "Lineage Series F 950/22000");
  assert.equal(lineage.formula, "super-c");
  assert.ok(Math.abs(lineage.score - 10) <= 0.05, `Lineage score ${lineage.score}`);

  const ts = report.scored.find(
    (r) =>
      /forest river/i.test(r.make) &&
      /sunseeker ts/i.test(r.model) &&
      r.torqueLbFt === 400 &&
      r.gvwrLbs === 10_360,
  );
  assert.ok(ts, "Sunseeker TS 400/10360");
  assert.equal(ts.formula, "class-c");
  assert.ok(Math.abs(ts.score - 10) <= 0.05, `Sunseeker TS score ${ts.score}`);

  const precept = report.scored.find(
    (r) =>
      /jayco/i.test(r.make) &&
      /^precept$/i.test(r.model) &&
      r.torqueLbFt === 468 &&
      r.gvwrLbs === 22_000,
  );
  assert.ok(precept, "Precept 31UL 468/22000 on gas formula");
  assert.equal(precept.formula, "class-a-gas");

  const seneca = report.scored.filter(
    (r) => /jayco/i.test(r.make) && /^seneca$/i.test(r.model),
  );
  for (const row of seneca) {
    assert.equal(row.formula, "super-c", `${row.source} should stay Super C`);
  }

  const greyhawk = report.scored.filter(
    (r) => /jayco/i.test(r.make) && /^greyhawk$/i.test(r.model),
  );
  for (const row of greyhawk) {
    assert.equal(row.formula, "class-c");
  }

  const md = formatCatalogTorqueScoreMarkdown(report);
  const outDir = join(root, "../../../screenshots");
  mkdirSync(outDir, { recursive: true });
  const artifact = join(outDir, "torque-to-weight-catalog.md");
  writeFileSync(artifact, md);
  assert.match(md, /Class A Diesel/);
  assert.match(md, /GAP missing/);

  const catalogSrc = readFileSync(join(root, "torqueToWeightCatalog.ts"), "utf8");
  assert.doesNotMatch(catalogSrc, /DialaBot|Bland|twilio/i);
  const scoreSrc = readFileSync(join(root, "torqueToWeight.ts"), "utf8");
  assert.doesNotMatch(scoreSrc, /DialaBot|Bland|twilio/i);
});
