#!/usr/bin/env node
/**
 * Batch AI catalog research — scale homework without hand-pasting brochures.
 *
 * Usage:
 *   node scripts/ai-catalog-research.mjs --make Tiffin --model Phaeton
 *   node scripts/ai-catalog-research.mjs --limit 5 --motorized
 *   node scripts/ai-catalog-research.mjs --from-gaps
 *
 * Writes:
 *   exports/proposed-catalog-patches.json
 *   exports/proposed-catalog-pins.ts.txt
 *
 * Does NOT auto-edit rvData.ts — review high-confidence, then apply.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exportsDir = path.join(root, "exports");
fs.mkdirSync(exportsDir, { recursive: true });

const args = process.argv.slice(2);
function arg(name, def = null) {
  const i = args.indexOf(`--${name}`);
  if (i < 0) return def;
  return args[i + 1] ?? true;
}

const BASE =
  process.env.CATALOG_RESEARCH_URL ||
  process.env.APP_URL ||
  "http://127.0.0.1:8080";

const MAKE = arg("make");
const MODEL = arg("model");
const LIMIT = parseInt(String(arg("limit", "3")), 10) || 3;
const FROM_GAPS = args.includes("--from-gaps");
const MOTORIZED = args.includes("--motorized") || FROM_GAPS;

function loadMotorizedFromGaps() {
  const p = path.join(exportsDir, "rvfax-catalog-powertrain-gaps.json");
  if (!fs.existsSync(p)) return [];
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  // Prefer models that still need work; if gaps empty, sample from models list
  const list = (j.gapsOnly?.length ? j.gapsOnly : j.models) || [];
  return list
    .filter((m) => m.make && m.model)
    .map((m) => ({
      make: m.make,
      model: m.model,
      fuelType: m.fuelType,
      type: m.type,
      engine: m.engine,
      horsepower: m.topHorsepower,
    }));
}

function loadMotorizedFromCatalogExport() {
  const p = path.join(exportsDir, "rvfax-catalog-models.json");
  if (!fs.existsSync(p)) return [];
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  const models = j.models || j || [];
  if (!Array.isArray(models)) return [];
  return models
    .filter((m) => /class|super c|motor/i.test(String(m.type || "")))
    .map((m) => ({
      make: m.make,
      model: m.model,
      fuelType: m.fuelType,
      type: m.type,
      engine: m.engine,
      horsepower: m.horsepower,
    }));
}

async function researchOne(coach) {
  const body = {
    make: coach.make,
    model: coach.model,
    yearFrom: coach.yearFrom ?? 2016,
    yearTo: coach.yearTo ?? 2026,
    floorplans: coach.floorplans || [],
    fuelType: coach.fuelType,
    type: coach.type,
    catalogEngine: coach.engine,
    catalogHp: coach.horsepower,
  };
  const resp = await fetch(`${BASE}/api/rvfax/catalog-research`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    return {
      ok: false,
      error: json.error || `HTTP ${resp.status}`,
      coach,
      patches: [],
    };
  }
  return {
    ok: true,
    coach,
    patches: json.data?.patches || [],
    meta: json.meta,
    modelUsed: json.data?.modelUsed,
  };
}

function patchToPin(p) {
  const fp = p.floorplan
    ? `\n    floorplanIncludes: "${String(p.floorplan).toLowerCase().replace(/\s+/g, "")}",`
    : "";
  return `  {
    yearMin: ${p.yearFrom},
    yearEnd: ${p.yearTo},
    makeIncludes: ${JSON.stringify(String(p.make).toLowerCase())},
    modelIncludes: ${JSON.stringify(String(p.model).toLowerCase())},${fp}
    engine: ${JSON.stringify(p.engine)},
    horsepower: ${p.horsepower ?? 0},
    torqueLbFt: ${p.torqueLbFt ?? "undefined"},
    chassis: ${p.chassis ? JSON.stringify(p.chassis) : "undefined"},
    transmission: ${p.transmission ? JSON.stringify(p.transmission) : "undefined"},
    fuelType: ${
      p.fuelType === "Diesel" || p.fuelType === "Gas"
        ? JSON.stringify(p.fuelType)
        : "undefined"
    },
    note: ${JSON.stringify(
      [p.notes, (p.sources || []).join("; ")].filter(Boolean).join(" · ") ||
        "AI catalog research",
    )},
  },`;
}

async function main() {
  let queue = [];
  if (MAKE && MODEL) {
    queue = [{ make: MAKE, model: MODEL }];
  } else if (MOTORIZED) {
    queue = loadMotorizedFromGaps();
    if (!queue.length) queue = loadMotorizedFromCatalogExport();
    queue = queue.slice(0, LIMIT);
  } else {
    console.log(`Usage:
  node scripts/ai-catalog-research.mjs --make Tiffin --model Phaeton
  node scripts/ai-catalog-research.mjs --motorized --limit 5
  APP_URL=http://127.0.0.1:8080 node scripts/ai-catalog-research.mjs --make Newmar --model "Kountry Star"
`);
    process.exit(1);
  }

  console.log(`Researching ${queue.length} coach(es) via ${BASE} ...`);
  const all = [];
  for (const coach of queue) {
    process.stdout.write(`→ ${coach.make} ${coach.model} ... `);
    try {
      const res = await researchOne(coach);
      if (!res.ok) {
        console.log(`FAIL ${res.error}`);
        continue;
      }
      const high = res.patches.filter(
        (p) => p.confidence === "high" && p.validation?.ok,
      ).length;
      console.log(
        `ok patches=${res.patches.length} highOk=${high} model=${res.modelUsed || "?"}`,
      );
      all.push(...res.patches);
    } catch (e) {
      console.log(`ERR ${e instanceof Error ? e.message : e}`);
    }
  }

  const batch = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: BASE,
    patches: all,
    summary: {
      total: all.length,
      highOk: all.filter((p) => p.confidence === "high" && p.validation?.ok)
        .length,
      mediumOk: all.filter(
        (p) => p.confidence === "medium" && p.validation?.ok,
      ).length,
      failedValidation: all.filter((p) => !p.validation?.ok).length,
    },
  };

  const outJson = path.join(exportsDir, "proposed-catalog-patches.json");
  fs.writeFileSync(outJson, JSON.stringify(batch, null, 2));

  const highPins = all
    .filter((p) => p.confidence === "high" && p.validation?.ok)
    .map(patchToPin)
    .join("\n");
  const outPins = path.join(exportsDir, "proposed-catalog-pins.ts.txt");
  fs.writeFileSync(
    outPins,
    `// High-confidence AI pins — review then merge into powertrainCorrections.ts\n// ${batch.generatedAt}\n${highPins}\n`,
  );

  console.log("\nSummary", batch.summary);
  console.log("wrote", outJson);
  console.log("wrote", outPins);
  console.log(
    "\nNext: review highOk patches → merge pins OR run apply when ready.",
  );
  console.log(
    "Human only reviews rejects/medium — AI does the brochure homework.",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
