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

test("catalog helper lists published torque+GVWR and scores that GVWR", async () => {
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
      r.gvwrLbs === 54_000,
  );
  assert.equal(
    report.scored.some(
      (r) =>
        /american coach/i.test(r.make) &&
        /american dream/i.test(r.model) &&
        r.gvwrLbs === 51_000,
    ),
    false,
    "Dream 45A must not score the Eagle-bleed 51k pin",
  );

  const lineage = report.scored.find(
    (r) =>
      /grand design/i.test(r.make) &&
      /lineage series f/i.test(r.model) &&
      r.torqueLbFt === 950 &&
      r.floorplan === "31ZW",
  );
  assert.ok(lineage, "Lineage Series F 31ZW scores its published GVWR");
  assert.equal(lineage.formula, "super-c");
  assert.equal(lineage.weightBasis, "GVWR");
  assert.equal(lineage.weightLb, lineage.gvwrLbs);
  assert.ok(lineage.weightLb !== 18_186, "UVW 18,186 must not be the scored weight");
  const ratio = (lineage.torqueLbFt / lineage.gvwrLbs) * 1000;
  assert.ok(Math.abs(lineage.ratio - ratio) < 0.05);
  assert.equal(
    lineage.color,
    ratio >= 28 ? "green" : ratio >= 22 ? "yellow" : "red",
  );

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
