#!/usr/bin/env node
/**
 * One-shot coverage table for PR #358: estimated UVW from GVWR pins,
 * plus motorized catalog paths with no usable GVWR (still unscoreable).
 */
import { pathToFileURL } from "node:url";

async function load() {
  const coverage = await import(
    pathToFileURL(new URL("../src/lib/rv/uvwEstimateCoverage.ts", import.meta.url)).href
  );
  const ttw = await import(
    pathToFileURL(new URL("../src/lib/rv/torqueToWeight.ts", import.meta.url)).href
  );
  const catalogLoad = await import(
    pathToFileURL(new URL("../src/lib/rv/catalogLoad.ts", import.meta.url)).href
  );
  const catalog = await import(
    pathToFileURL(new URL("../src/lib/rv/catalog.ts", import.meta.url)).href
  );
  const honesty = await import(
    pathToFileURL(new URL("../src/lib/rv/catalogHonesty.ts", import.meta.url)).href
  );
  const brochure = await import(
    pathToFileURL(new URL("../src/lib/rv/brochureSpecs.ts", import.meta.url)).href
  );
  const index = await import(
    pathToFileURL(new URL("../src/lib/rv/rvCatalogIndex.ts", import.meta.url)).href
  );
  const floor = await import(
    pathToFileURL(new URL("../src/lib/rv/floorplanSpecs.ts", import.meta.url)).href
  );
  return { coverage, ttw, catalogLoad, catalog, honesty, brochure, index, floor };
}

function parseTorque(raw) {
  if (raw == null) return null;
  const s = String(raw);
  const m = s.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  return m ? Math.round(Number(m[1])) : null;
}

function isTowable(type, fuel) {
  const t = `${type || ""} ${fuel || ""}`.toLowerCase();
  if (/class\s*[abc]|super\s*c|motorhome|diesel\s*pusher/.test(t)) return false;
  return /travel\s*trailer|fifth\s*wheel|5th\s*wheel|toy\s*hauler|truck\s*camper|pop-?up|teardrop|\btowable\b/.test(
    t,
  );
}

function findCatalogMakeModel(index, makeIncludes, modelIncludes) {
  const mk = makeIncludes.toLowerCase();
  const md = modelIncludes.toLowerCase();
  let best = null;
  let bestScore = -1;
  for (const [make, models] of Object.entries(index.CATALOG_INDEX)) {
    if (!make.toLowerCase().includes(mk)) continue;
    for (const model of Object.keys(models)) {
      const ml = model.toLowerCase();
      if (!ml.includes(md)) continue;
      if (
        md === "vision" &&
        (ml.includes("xl") || ml.includes("se")) &&
        !md.includes("xl") &&
        !md.includes("se")
      ) {
        continue;
      }
      if (md === "precept" && ml.includes("prestige")) continue;
      if (md === "alante" && ml.includes("se") && !md.includes("se")) continue;
      if (md === "bay star" && ml.includes("sport") && !md.includes("sport")) {
        continue;
      }
      const score = model.length * 10 + make.length;
      if (score > bestScore) {
        bestScore = score;
        best = { make, model };
      }
    }
  }
  return best;
}

async function main() {
  const { coverage, ttw, catalogLoad, catalog, honesty, brochure, index, floor } =
    await load();
  await catalogLoad.ensureCatalogLoaded();

  const estimated = coverage.listEstimatedUvwFromGvwrPins();
  const table = [];
  for (const row of estimated) {
    const hit = findCatalogMakeModel(
      index,
      row.makeIncludes,
      row.modelIncludes,
    );
    let torqueLbFt = null;
    let rvType = "Class A";
    if (hit) {
      const spec = catalog.getSpec(hit.make, hit.model);
      if (spec) {
        const year = String(row.yearMax);
        const sheet = brochure.buildBrochureSpecs(
          spec,
          year,
          hit.make,
          hit.model,
          row.floorplan,
        );
        torqueLbFt =
          ttw.parseTorqueLbFt(sheet.torque) ??
          parseTorque(
            honesty.honestTorqueForCoach({
              engine: spec.engine,
              chassis: spec.chassis,
              type: spec.type,
              torqueLbFt: spec.torqueLbFt,
            }),
          );
        rvType = sheet.type || spec.type || rvType;
      }
    }
    const scored = ttw.computeTorqueToWeight({
      torqueLbFt,
      gvwrLbs: row.gvwrLbs,
      rvType,
    });
    table.push({
      make: row.makeIncludes,
      model: row.modelIncludes,
      floorplan: row.floorplan,
      years: `${row.yearMin}–${row.yearMax}`,
      gvwrLbs: row.gvwrLbs,
      estimatedUvwLbs: row.estimatedUvwLbs,
      torqueLbFt: scored.torqueLbFt,
      score: scored.score == null ? "GAP" : scored.score.toFixed(1),
      color: scored.color ?? "—",
    });
  }

  const unscoreable = [];
  for (const [make, models] of Object.entries(index.CATALOG_INDEX)) {
    for (const [model, spec] of Object.entries(models)) {
      if (isTowable(spec.type, spec.fuelType)) continue;
      const years = spec.years?.length
        ? spec.years
        : spec.floorplansByYear
          ? Object.keys(spec.floorplansByYear).map(Number)
          : [];
      const fpsByYear = spec.floorplansByYear || {};
      const fallbackFps = spec.floorplans || [];
      const yearList = years.length ? years : [2025];
      let anyGvwr = false;
      const missing = [];
      for (const y of yearList) {
        const fps = fpsByYear[String(y)] || fpsByYear[y] || fallbackFps;
        for (const fp of fps) {
          const live = catalog.getSpec(make, model);
          const sheet = live
            ? brochure.buildBrochureSpecs(live, String(y), make, model, fp)
            : null;
          const gvwr =
            floor.findOemGvwrLbs(y, make, model, fp) ??
            sheet?.gvwrLbs ??
            live?.gvwrLbs ??
            null;
          if (gvwr != null && gvwr > 0) {
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
          sample: missing.slice(0, 8).join(", "),
          gapYears: missing.length,
        });
      }
    }
  }

  const pin39 = coverage.americanDream39rkPin();
  const anthem = table.find((r) => r.model === "anthem" && r.floorplan === "44R");
  const precept = table.find((r) => r.model === "precept" && r.floorplan === "31UL");

  const out = {
    estimatedCount: table.length,
    gvwrPinCount: floor.oemGvwrPinCount(),
    uvwPinCount: floor.oemUvwPinCount(),
    unscoreableModelCount: unscoreable.length,
    pin39rk: pin39,
    anthem44r: anthem,
    precept31ul: precept,
    estimated: table,
    unscoreable,
  };
  process.stdout.write(`${JSON.stringify(out, null, 2)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
