#!/usr/bin/env node
/**
 * Coverage table for PR #358. Uses OEM GVWR pins + catalog source SoT
 * for torque (never invents a number that is not in rvData.ts).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  americanDream39rkPin,
  findCatalogMakeModel,
  listEstimatedUvwFromGvwrPins,
} from "../src/lib/rv/uvwEstimateCoverage.ts";
import {
  computeTorqueToWeight,
  estimateUvwFromGvwrDetailed,
  estimateUvwFromGvwrFlat835,
  parseTorqueLbFt,
  scoreFromTorqueToWeightRatio,
  torqueToWeightRatio,
} from "../src/lib/rv/torqueToWeight.ts";
import { findOemGvwrLbs } from "../src/lib/rv/floorplanSpecs.ts";
import { CATALOG_INDEX } from "../src/lib/rv/rvCatalogIndex.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rvData = readFileSync(join(root, "src/lib/rv/rvData.ts"), "utf8");

function extractModelBlock(make, model) {
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const makeRe = new RegExp(
    `(?:^|\\n)\\s*"?${esc(make)}"?\\s*:\\s*\\{`,
  );
  const makeHit = makeRe.exec(rvData);
  if (!makeHit) return "";
  const from = makeHit.index;
  const modelRe = new RegExp(
    `\\n\\s*"?${esc(model)}"?\\s*:\\s*\\{`,
  );
  const slice = rvData.slice(from, from + 900_000);
  const modelHit = modelRe.exec(slice);
  if (!modelHit) return "";
  const start = modelHit.index;
  const rest = slice.slice(start + 1);
  const nextModel = rest.search(/\n    "[A-Za-z0-9][^"]*": \{\n      type:/);
  const end = nextModel >= 0 ? start + 1 + nextModel : start + 80_000;
  return slice.slice(start, end);
}

function fieldFromBlock(block, year, field) {
  if (!block) return null;
  const re = new RegExp(
    `from:\\s*(\\d{4})[\\s\\S]{0,800}?to:\\s*(\\d{4})[\\s\\S]{0,1200}?${field}:\\s*([^,\\n]+)`,
    "g",
  );
  const bands = [...block.matchAll(re)];
  const y = Number(year);
  for (const m of bands) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (y >= a && y <= b) return String(m[3]).replace(/^["']|["']$/g, "").trim();
  }
  const top = block.match(new RegExp(`${field}:\\s*([^,\\n]+)`));
  return top ? String(top[1]).replace(/^["']|["']$/g, "").trim() : null;
}

function torqueFromBlock(block, year) {
  const raw = fieldFromBlock(block, year, "torqueLbFt");
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function chassisFromBlock(block, year) {
  const raw = fieldFromBlock(block, year, "chassis");
  return raw && raw !== "undefined" ? raw : null;
}

function rvTypeFromSpec(spec) {
  return spec?.type || "Class A";
}

function isTowable(type, fuel) {
  const t = `${type || ""} ${fuel || ""}`.toLowerCase();
  if (/class\s*[abc]|super\s*c|motorhome|diesel\s*pusher/.test(t)) return false;
  return /travel\s*trailer|fifth\s*wheel|5th\s*wheel|toy\s*hauler|truck\s*camper|pop-?up|teardrop|\btowable\b/.test(
    t,
  );
}

function titleModel(modelIncludes) {
  return modelIncludes
    .split(" ")
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(" ");
}

function scoreAtWeight(torqueLbFt, weightLb) {
  if (torqueLbFt == null || weightLb == null) return { score: null, color: null };
  const ratio = torqueToWeightRatio(torqueLbFt, weightLb);
  const score = scoreFromTorqueToWeightRatio(ratio);
  return {
    score,
    color:
      score == null ? null : score < 6 ? "red" : score < 7.5 ? "yellow" : "green",
  };
}

const estimated = listEstimatedUvwFromGvwrPins();
const table = [];
for (const row of estimated) {
  const hit = findCatalogMakeModel(row.makeIncludes, row.modelIncludes);
  const block = hit ? extractModelBlock(hit.make, hit.model) : "";
  const torqueLbFt = torqueFromBlock(block, row.yearMax);
  const chassis = chassisFromBlock(block, row.yearMax);
  const parsed = parseTorqueLbFt(torqueLbFt);
  const rvType = rvTypeFromSpec(hit?.spec) ?? row.rvType;
  const fuelType = hit?.spec?.fuelType ?? row.fuelType;
  const hint = { rvType, fuelType, chassis };
  const detail = estimateUvwFromGvwrDetailed(row.gvwrLbs, hint);
  const scored = computeTorqueToWeight({
    torqueLbFt: parsed,
    gvwrLbs: row.gvwrLbs,
    rvType,
    fuelType,
    chassis,
  });
  const oldUvw = estimateUvwFromGvwrFlat835(row.gvwrLbs);
  const oldScored = scoreAtWeight(scored.torqueLbFt, oldUvw);
  table.push({
    make: hit?.make ?? row.makeIncludes,
    model: titleModel(row.modelIncludes),
    floorplan: row.floorplan,
    years: row.yearMin === row.yearMax ? String(row.yearMin) : `${row.yearMin}–${row.yearMax}`,
    gvwrLbs: row.gvwrLbs,
    estimatedUvwLbs: scored.uvwLb ?? row.estimatedUvwLbs,
    oldEstimatedUvwLbs: oldUvw,
    tier: scored.uvwEstimateTier ?? detail?.tier ?? row.tier,
    factor: detail?.factor ?? row.factor,
    thinCcc: scored.thinCcc,
    chassis,
    torqueLbFt: scored.torqueLbFt,
    score: scored.score == null ? "GAP" : scored.score.toFixed(1),
    color: scored.color ?? "—",
    oldScore: oldScored.score == null ? "GAP" : oldScored.score.toFixed(1),
    oldColor: oldScored.color ?? "—",
  });
}

const unscoreable = [];
for (const [make, models] of Object.entries(CATALOG_INDEX)) {
  for (const [model, spec] of Object.entries(models)) {
    if (isTowable(spec.type, spec.fuelType)) continue;
    const years = spec.years?.length
      ? spec.years
      : spec.floorplansByYear
        ? Object.keys(spec.floorplansByYear).map(Number)
        : [];
    const fpsByYear = spec.floorplansByYear || {};
    const fallbackFps = spec.floorplans || [];
    const yearList = years.length ? years : [];
    if (!yearList.length) continue;
    let anyGvwr = false;
    const missing = [];
    for (const y of yearList) {
      const fps = fpsByYear[String(y)] || fallbackFps;
      if (!fps.length) {
        if (findOemGvwrLbs(y, make, model, "") == null) {
          missing.push(`${y} (no floorplan)`);
        }
        continue;
      }
      for (const fp of fps) {
        const gvwr = findOemGvwrLbs(y, make, model, fp);
        if (gvwr != null) {
          anyGvwr = true;
          continue;
        }
        missing.push(`${y} ${fp}`);
      }
    }
    if (!anyGvwr && missing.length) {
      unscoreable.push({
        make,
        model,
        type: spec.type,
        gapPaths: missing.length,
        sample: missing.slice(0, 6).join(", "),
      });
    }
  }
}

const grouped = new Map();
for (const row of table) {
  const key = `${row.make}|${row.model}|${row.years}|${row.gvwrLbs}|${row.estimatedUvwLbs}|${row.tier}|${row.torqueLbFt}|${row.score}|${row.color}`;
  const prev = grouped.get(key);
  if (prev) {
    prev.floorplans.push(row.floorplan);
  } else {
    grouped.set(key, { ...row, floorplans: [row.floorplan] });
  }
}

const condensed = [...grouped.values()].map((r) => ({
  make: r.make,
  model: r.model,
  floorplans: r.floorplans.join(", "),
  years: r.years,
  gvwrLbs: r.gvwrLbs,
  estimatedUvwLbs: r.estimatedUvwLbs,
  oldEstimatedUvwLbs: r.oldEstimatedUvwLbs,
  tier: r.tier,
  factor: r.factor,
  thinCcc: r.thinCcc,
  chassis: r.chassis,
  torqueLbFt: r.torqueLbFt,
  score: r.score,
  color: r.color,
  oldScore: r.oldScore,
  oldColor: r.oldColor,
}));

const delta = condensed.filter(
  (r) => r.oldEstimatedUvwLbs != null && r.oldEstimatedUvwLbs !== r.estimatedUvwLbs,
);

const pin39 = americanDream39rkPin();

const out = {
  estimatedRowCount: table.length,
  condensedGroupCount: condensed.length,
  deltaGroupCount: delta.length,
  unscoreableModelCount: unscoreable.length,
  samples: {
    anthem44r: table.filter((r) => /anthem/i.test(r.model) && r.floorplan === "44R"),
    precept31ul: table.filter((r) => /precept/i.test(r.model) && r.floorplan === "31UL"),
    alante27a: table.filter((r) => /alante/i.test(r.model) && r.floorplan === "27A"),
    openRoad34pa: table.filter(
      (r) => /open road/i.test(r.model) && r.floorplan === "34PA",
    ),
    americanDream39rk: {
      pinnedUvwLbs: pin39.uvwLbs,
      dieselEstimateFrom47000: pin39.estimateFrom47000,
    },
    exactly25kGas: estimateUvwFromGvwrDetailed(25_000, {
      rvType: "Class A Gas",
      chassis: "Ford F-53",
    }),
  },
  condensed,
  delta,
  unscoreable,
};

const dest = join(root, "screenshots", "ttw-uvw-estimate-report.json");
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(
  JSON.stringify(
    {
      estimatedRowCount: out.estimatedRowCount,
      condensedGroupCount: out.condensedGroupCount,
      deltaGroupCount: out.deltaGroupCount,
      unscoreableModelCount: out.unscoreableModelCount,
      samples: out.samples,
    },
    null,
    2,
  ) + "\n",
);
