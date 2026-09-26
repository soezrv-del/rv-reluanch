import assert from "node:assert/strict";
import test from "node:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { findOemUvwLbs } from "./floorplanSpecs.ts";
import {
  formatCatalogTorqueScoreMarkdown,
  listCatalogTorqueToWeightScores,
} from "./torqueToWeightCatalog.ts";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";

const root = dirname(fileURLToPath(import.meta.url));

test("catalog helper scores published UVW, else published GVWR", async () => {
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

  const lineageUvw = findOemUvwLbs(
    "2026",
    "Grand Design",
    "Lineage Series F",
    "31ZW",
  );
  assert.equal(lineageUvw, 18_186);
  const lineage = report.scored.find(
    (r) =>
      /grand design/i.test(r.make) &&
      /lineage series f/i.test(r.model) &&
      r.torqueLbFt === 950 &&
      r.floorplan === "31ZW" &&
      r.weightBasis === "UVW",
  );
  assert.ok(lineage, "Lineage Series F 31ZW scores its published UVW");
  assert.equal(lineage.formula, "super-c");
  assert.equal(lineage.weightLb, lineageUvw);
  assert.notEqual(lineage.weightLb, lineage.gvwrLbs);
  const uvwRatio = (lineage.torqueLbFt / lineage.weightLb) * 1000;
  assert.ok(Math.abs(lineage.ratio - uvwRatio) < 0.05);
  assert.equal(
    lineage.color,
    lineage.score >= 8 ? "green" : lineage.score >= 6 ? "yellow" : "red",
  );

  const gvwrOnly = report.scored.find((r) => r.weightBasis === "GVWR");
  assert.ok(gvwrOnly, "a row with no printed UVW falls back to GVWR");
  assert.equal(gvwrOnly.weightLb, gvwrOnly.gvwrLbs);
  const gvwrRatio = (gvwrOnly.torqueLbFt / gvwrOnly.gvwrLbs) * 1000;
  assert.ok(Math.abs(gvwrOnly.ratio - gvwrRatio) < 0.05);
  assert.equal(
    gvwrOnly.color,
    gvwrOnly.score >= 8 ? "green" : gvwrOnly.score >= 6 ? "yellow" : "red",
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
