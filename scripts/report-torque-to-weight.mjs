#!/usr/bin/env node
/**
 * Print per-type torque-to-weight scores for catalog coaches that have
 * published torque + published GVWR. Used for the PR score report.
 *
 * Run: node --experimental-strip-types --experimental-transform-types scripts/report-torque-to-weight.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadLiveCatalog } from "./load-live-catalog.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const helperHref = pathToFileURL(
  resolve(root, "src/lib/rv/torqueToWeightCatalog.ts"),
).href;
const helper = await import(helperHref);
const catalog = await loadLiveCatalog();
const report = helper.listCatalogTorqueToWeightScores(catalog.RV_DATA);
const md = helper.formatCatalogTorqueScoreMarkdown(report);
const outDir = join(root, "screenshots");
mkdirSync(outDir, { recursive: true });
const out = join(outDir, "torque-to-weight-catalog.md");
writeFileSync(out, md);
process.stdout.write(md);
process.stdout.write(`\n\nWrote ${out}\n`);
process.stdout.write(
  `scoredRows=${report.scored.length} motorized=${report.motorized} ` +
    `gapT=${report.gapMissingTorque} gapG=${report.gapMissingGvwr} ` +
    `gapBoth=${report.gapMissingBoth} na=${report.naTowable}\n`,
);
