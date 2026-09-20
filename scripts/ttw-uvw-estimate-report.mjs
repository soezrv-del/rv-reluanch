#!/usr/bin/env node
/**
 * Coverage table for PR #358. Uses OEM GVWR pins + catalog source SoT
 * for torque (never invents a number that is not in rvData.ts).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { listEstimatedUvwFromGvwrPins } from "../src/lib/rv/uvwEstimateCoverage.ts";
import {
  computeTorqueToWeight,
  parseTorqueLbFt,
} from "../src/lib/rv/torqueToWeight.ts";
import { findOemGvwrLbs } from "../src/lib/rv/floorplanSpecs.ts";
import { CATALOG_INDEX } from "../src/lib/rv/rvCatalogIndex.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const rvData = readFileSync(join(root, "src/lib/rv/rvData.ts"), "utf8");

function siblingBlocked(modelIncludes, modelNorm) {
  const md = modelIncludes;
  if (md === "vision" && (modelNorm.includes("xl") || modelNorm.includes("se"))) return true;
  if (md === "precept" && modelNorm.includes("prestige")) return true;
  if (md === "alante" && modelNorm.includes("se") && !md.includes("se")) return true;
  if (md === "redhawk" && modelNorm.includes("se")) return true;
  if (md === "melbourne" && modelNorm.includes("prestige")) return true;
  if (md === "greyhawk" && (modelNorm.includes("prestige") || modelNorm.includes("xl"))) return true;
  if (md === "bay star" && modelNorm.includes("sport") && !md.includes("sport")) return true;
  if (md === "odyssey" && (modelNorm.includes("odyssey se") || modelNorm.includes("esteem"))) return true;
  if (md === "four winds" && /majestic|siesta|sprinter/.test(modelNorm)) return true;
  if (md === "quantum" && modelNorm.includes("sprinter") && !md.includes("sprinter")) return true;
  if (md === "chateau" && modelNorm.includes("sprinter") && !md.includes("sprinter")) return true;
  if (md === "sunseeker" && /sunseeker le|classic|4x4|mbs|sunseeker pm|sunseeker ts/.test(modelNorm)) return true;
  if (md === "leprechaun" && modelNorm.includes("premier")) return true;
  if (md === "freelander" && modelNorm.includes(" le")) return true;
  if (md === "allegro red" && (modelNorm.includes("340") || modelNorm.includes("360"))) return true;
  if (md === "sunstar" && modelNorm.includes("itasca")) return true;
  return false;
}

function findCatalogMakeModel(makeIncludes, modelIncludes) {
  const mk = makeIncludes.toLowerCase();
  const md = modelIncludes.toLowerCase();
  let best = null;
  let bestScore = -1;
  for (const [make, models] of Object.entries(CATALOG_INDEX)) {
    if (!make.toLowerCase().includes(mk)) continue;
    for (const [model, spec] of Object.entries(models)) {
      const ml = model.toLowerCase();
      if (!ml.includes(md)) continue;
      if (siblingBlocked(md, ml)) continue;
      // Prefer the shortest catalog model that still contains the pin token
      // so "Odyssey" wins over "Odyssey Esteem Edition".
      const score = 1000 - model.length + make.length;
      if (score > bestScore) {
        bestScore = score;
        best = { make, model, spec };
      }
    }
  }
  return best;
}

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

function torqueFromBlock(block, year) {
  if (!block) return null;
  const bands = [
    ...block.matchAll(
      /from:\s*(\d{4})[\s\S]{0,800}?to:\s*(\d{4})[\s\S]{0,1200}?torqueLbFt:\s*(\d+)/g,
    ),
  ];
  const y = Number(year);
  for (const m of bands) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    if (y >= a && y <= b) return Number(m[3]);
  }
  const top = block.match(/torqueLbFt:\s*(\d+)/);
  return top ? Number(top[1]) : null;
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

const estimated = listEstimatedUvwFromGvwrPins();
const table = [];
for (const row of estimated) {
  const hit = findCatalogMakeModel(row.makeIncludes, row.modelIncludes);
  const block = hit ? extractModelBlock(hit.make, hit.model) : "";
  const torqueLbFt = torqueFromBlock(block, row.yearMax);
  const parsed = parseTorqueLbFt(torqueLbFt);
  const rvType = rvTypeFromSpec(hit?.spec);
  const scored = computeTorqueToWeight({
    torqueLbFt: parsed,
    gvwrLbs: row.gvwrLbs,
    rvType,
  });
  table.push({
    make: hit?.make ?? row.makeIncludes,
    model: row.modelIncludes
      .split(" ")
      .map((w) => (w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
      .join(" "),
    floorplan: row.floorplan,
    years: row.yearMin === row.yearMax ? String(row.yearMin) : `${row.yearMin}–${row.yearMax}`,
    gvwrLbs: row.gvwrLbs,
    estimatedUvwLbs: row.estimatedUvwLbs,
    torqueLbFt: scored.torqueLbFt,
    score: scored.score == null ? "GAP" : scored.score.toFixed(1),
    color: scored.color ?? "—",
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
  const key = `${row.make}|${row.model}|${row.years}|${row.gvwrLbs}|${row.estimatedUvwLbs}|${row.torqueLbFt}|${row.score}|${row.color}`;
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
  torqueLbFt: r.torqueLbFt,
  score: r.score,
  color: r.color,
}));

const out = {
  estimatedRowCount: table.length,
  condensedGroupCount: condensed.length,
  unscoreableModelCount: unscoreable.length,
  anthem44r: table.filter((r) => /anthem/i.test(r.model) && r.floorplan === "44R"),
  precept31ul: table.filter((r) => /precept/i.test(r.model) && r.floorplan === "31UL"),
  condensed,
  unscoreable,
};

const dest = join(root, "screenshots", "ttw-uvw-estimate-report.json");
writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
process.stdout.write(
  JSON.stringify(
    {
      estimatedRowCount: out.estimatedRowCount,
      condensedGroupCount: out.condensedGroupCount,
      unscoreableModelCount: out.unscoreableModelCount,
      anthem44r: out.anthem44r,
      precept31ul: out.precept31ul,
    },
    null,
    2,
  ) + "\n",
);
