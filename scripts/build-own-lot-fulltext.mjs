#!/usr/bin/env node
/**
 * Build public/inventory/own-lot-fulltext.json from the lot sheet.
 *
 * The sheet printer keeps raw.attributes and flags. It drops the floorplan
 * lists (feature, lifestyle, style). Those lists are the listing dump:
 * "King Bed", "Bunkhouse", and the rest. Voice searches that text after the
 * sheet and before a brochure. Rows with no floorplan list are omitted.
 * A stock number wins; VIN is stored only when the stock is blank.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const FULLTEXT_REPO_PATH = "public/inventory/own-lot-fulltext.json";
export const SNAPSHOT_REPO_PATH = "public/inventory/own-lot-latest.json";

const FLOORPLAN_LISTS = ["floorplan_feature", "floorplan_lifestyle", "floorplan_style"];

export function listingDumpRows(units) {
  if (!Array.isArray(units)) return [];
  const rows = [];
  for (const unit of units) {
    if (!unit || typeof unit !== "object") continue;
    const raw = unit.raw;
    if (!raw || typeof raw !== "object") continue;
    const parts = [];
    for (const key of FLOORPLAN_LISTS) {
      const value = raw[key];
      if (!Array.isArray(value)) continue;
      for (const item of value) {
        const text = String(item ?? "").trim();
        if (text) parts.push(text);
      }
    }
    if (!parts.length) continue;
    const stock = String(unit.stock_number ?? "").trim();
    const vin = String(unit.vin ?? "").trim();
    if (!stock && !vin) continue;
    rows.push({
      stock_number: stock,
      vin: stock ? "" : vin,
      fulltext: parts.join(". "),
    });
  }
  return rows;
}

export function listingDumpBytes(snapshotBytes) {
  const text = Buffer.isBuffer(snapshotBytes)
    ? snapshotBytes.toString("utf8")
    : String(snapshotBytes);
  const json = JSON.parse(text);
  const units = Array.isArray(json) ? json : [];
  return Buffer.from(`${JSON.stringify(listingDumpRows(units))}\n`);
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const snapshotPath = join(root, SNAPSHOT_REPO_PATH);
  const dest = join(root, FULLTEXT_REPO_PATH);
  const bytes = listingDumpBytes(readFileSync(snapshotPath));
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, bytes);
  const rows = JSON.parse(bytes.toString("utf8"));
  console.log(`own-lot fulltext: ${rows.length} rows -> ${FULLTEXT_REPO_PATH}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
