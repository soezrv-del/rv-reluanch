#!/usr/bin/env node
/**
 * Catalog integrity gate — run after any rvData change.
 * Fails the process on hallucinated years, cross-line floorplans, empty series, etc.
 * Humans should not have to spot-check every OEM line.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA = resolve(ROOT, "src/lib/rv/rvData.ts");
const CURRENT_YEAR = 2026;

/** Hard OEM / company epoch floors (inclusive). Pre-floor years are hallucinations. */
const BRAND_EPOCH = {
  Brinkley: 2022, // announced May 2022; production ~2022/2023
  "Alliance RV": 2019,
  "Grand Design": 2012,
  "Prime Time": 2009,
  "East to West": 2018,
  "KZ RV": 1972,
  Heartland: 2003,
  Crossroads: 1996,
  Entegra: 2008,
  "Entegra Coach": 2008,
};

/**
 * Floorplan codes that must NOT appear on the listed series (they belong elsewhere).
 * Key: make|model (exact catalog names)
 */
const FORBIDDEN_FLOORPLANS = {
  "Brinkley|Model Z": {
    codes: ["3500", "3700", "3250", "3520", "3950", "3970", "4000", "4100", "4120"],
    reason: "3500/3xxx garage codes are Model G toy-hauler plans, not Model Z fifth wheels",
  },
  "Brinkley|Model Z Air": {
    codes: ["250", "280", "295", "2900", "3100", "3500"],
    reason: "Model Z Air OEM plans are 285/297/310/315 travel trailers",
  },
};

/** Series expected type substring (case-insensitive). */
const EXPECTED_TYPE = {
  "Brinkley|Model Z": "fifth wheel",
  "Brinkley|Model Z Air": "travel trailer",
  "Brinkley|Model G": "toy hauler",
  "Brinkley|Model T": "toy hauler",
  "Fleetwood|Discovery": "diesel",
  "Fleetwood|Fortis": "gas",
  "Fleetwood|Frontier": "diesel",
  "Fleetwood|Southwind": "gas",
};

/** Phantom / non-OEM series that must not exist. */
const BANNED_SERIES = [
  "Brinkley|Model Z Expand",
  "Brinkley|Model T Air",
];

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function parseCatalog(src) {
  // Split into make blocks: "Make": { ... },
  const makes = new Map();
  // Find export const RV_DATA = {
  const start = src.indexOf("export const RV_DATA");
  if (start < 0) throw new Error("RV_DATA export not found");
  const brace = src.indexOf("{", start);
  // Walk top-level make keys only (2-space indent + quoted key)
  const reMake = /\n  "([^"]+)": \{/g;
  const makeStarts = [];
  let m;
  while ((m = reMake.exec(src)) !== null) {
    if (m.index < brace) continue;
    // stop at injectYearStart / CLASSIC / MAKES
    if (m.index > src.indexOf("\n(function injectYearStart") && src.indexOf("\n(function injectYearStart") > 0) break;
    if (src.indexOf("\nexport const CLASSIC_BRANDS") > 0 && m.index > src.indexOf("\nexport const CLASSIC_BRANDS")) break;
    makeStarts.push({ make: m[1], index: m.index });
  }

  for (let i = 0; i < makeStarts.length; i++) {
    const { make, index } = makeStarts[i];
    const end = i + 1 < makeStarts.length ? makeStarts[i + 1].index : src.indexOf("\nexport const CLASSIC_BRANDS", index);
    const block = src.slice(index, end > index ? end : index + 500000);
    const series = new Map();
    const reSeries = /\n    "([^"]+)": \{/g;
    const seriesStarts = [];
    let s;
    while ((s = reSeries.exec(block)) !== null) {
      seriesStarts.push({ name: s[1], index: s.index });
    }
    for (let j = 0; j < seriesStarts.length; j++) {
      const { name, index: si } = seriesStarts[j];
      const se = j + 1 < seriesStarts.length ? seriesStarts[j + 1].index : block.length;
      const sb = block.slice(si, se);
      const type = (sb.match(/\n      type: "([^"]+)"/) || [])[1] || "";
      const yearStart = num(sb.match(/\n      yearStart: (\d+)/)?.[1]);
      const yearEnd = num(sb.match(/\n      yearEnd: (\d+)/)?.[1]);
      const floorplans = parseStringArray(sb.match(/\n      floorplans: \[([^\]]*)\]/)?.[1] || "");
      const fby = {};
      const fbyBlock = sb.match(/\n      floorplansByYear: \{([\s\S]*?)\n      \},/);
      if (fbyBlock) {
        const yrRe = /"(\d{4})": \[([^\]]*)\]/g;
        let ym;
        while ((ym = yrRe.exec(fbyBlock[1])) !== null) {
          fby[ym[1]] = parseStringArray(ym[2]);
        }
      }
      series.set(name, { type, yearStart, yearEnd, floorplans, floorplansByYear: fby, raw: sb });
    }
    makes.set(make, series);
  }
  return makes;
}

function num(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseStringArray(inner) {
  const out = [];
  const re = /"([^"]+)"/g;
  let m;
  while ((m = re.exec(inner)) !== null) out.push(m[1]);
  return out;
}

function main() {
  const src = readFileSync(DATA, "utf8");
  const makes = parseCatalog(src);

  if (makes.size < 20) fail(`Parsed only ${makes.size} makes — parser likely broken`);

  let seriesCount = 0;
  for (const [make, seriesMap] of makes) {
    const epoch = BRAND_EPOCH[make];

    for (const [name, spec] of seriesMap) {
      seriesCount++;
      const key = `${make}|${name}`;

      if (BANNED_SERIES.includes(key)) {
        fail(`Banned phantom series still present: ${key}`);
      }

      if (!spec.type) fail(`${key}: missing type`);
      if (!spec.floorplans.length) fail(`${key}: empty floorplans[]`);
      if (!Object.keys(spec.floorplansByYear).length) {
        warn(`${key}: no floorplansByYear map`);
      }

      // year keys must respect yearStart / yearEnd / brand epoch
      for (const yStr of Object.keys(spec.floorplansByYear)) {
        const y = Number(yStr);
        if (y < 1980 || y > CURRENT_YEAR + 2) {
          fail(`${key}: absurd year key ${y}`);
        }
        if (spec.yearStart != null && y < spec.yearStart) {
          fail(`${key}: floorplansByYear ${y} is before yearStart ${spec.yearStart}`);
        }
        if (spec.yearEnd != null && y > spec.yearEnd) {
          fail(`${key}: floorplansByYear ${y} is after yearEnd ${spec.yearEnd}`);
        }
        if (epoch != null && y < epoch) {
          fail(`${key}: year ${y} is before brand epoch ${make}=${epoch} (company did not build yet)`);
        }
        if (!spec.floorplansByYear[yStr].length) {
          fail(`${key}: empty plan list for ${y}`);
        }
      }

      if (spec.yearStart != null && epoch != null && spec.yearStart < epoch) {
        fail(`${key}: yearStart ${spec.yearStart} is before brand epoch ${epoch}`);
      }

      // forbidden floorplans
      const forbid = FORBIDDEN_FLOORPLANS[key];
      if (forbid) {
        const allPlans = new Set([
          ...spec.floorplans,
          ...Object.values(spec.floorplansByYear).flat(),
        ]);
        for (const code of forbid.codes) {
          if (allPlans.has(code)) {
            fail(`${key}: forbidden floorplan "${code}" — ${forbid.reason}`);
          }
        }
      }

      // expected type
      const exp = EXPECTED_TYPE[key];
      if (exp && !spec.type.toLowerCase().includes(exp)) {
        fail(`${key}: type "${spec.type}" does not include expected "${exp}"`);
      }

      // floorplans[] should be union of by-year (warn if orphan codes only in top list with no year)
      const byYear = new Set(Object.values(spec.floorplansByYear).flat());
      for (const p of spec.floorplans) {
        if (byYear.size && !byYear.has(p)) {
          warn(`${key}: floorplan "${p}" in floorplans[] but not in any floorplansByYear year`);
        }
      }
    }
  }

  // Brand-level: Brinkley must not offer pre-epoch via any series
  if (makes.has("Brinkley")) {
    for (const [name, spec] of makes.get("Brinkley")) {
      for (const y of Object.keys(spec.floorplansByYear)) {
        if (Number(y) < 2022) fail(`Brinkley|${name}: pre-2022 year ${y} must not exist`);
      }
    }
    // Model Z must be fifth wheel
    const z = makes.get("Brinkley").get("Model Z");
    if (!z) fail("Brinkley|Model Z missing");
    else if (z.yearStart !== 2022 && z.yearStart !== 2023) {
      warn(`Brinkley|Model Z yearStart is ${z.yearStart} (expected 2022 or 2023)`);
    }
  }

  // Fleetwood must include core modern lines (regression gate after prior skip)
  if (makes.has("Fleetwood")) {
    for (const required of ["Fortis", "Frontier", "Southwind", "Discovery", "Bounder", "Altitude", "Insight", "Palisade", "Flex"]) {
      if (!makes.get("Fleetwood").has(required)) {
        fail(`Fleetwood missing required series: ${required}`);
      }
    }
  }

  // Heartland modern towables (regression gate)
  if (makes.has("Heartland")) {
    for (const required of ["Mallard", "North Trail", "Milestone", "Cyclone", "Bighorn", "Sundance Ultra-Lite"]) {
      if (!makes.get("Heartland").has(required)) {
        fail(`Heartland missing required series: ${required}`);
      }
    }
  }

  // KZ core 2022–2026 lines
  if (makes.has("KZ RV")) {
    for (const required of ["Connect", "Sportsmen Classic", "Sportsmen SE", "Durango", "Durango Gold", "Venom"]) {
      if (!makes.get("KZ RV").has(required)) {
        fail(`KZ RV missing required series: ${required}`);
      }
    }
  }

  // CrossRoads core
  if (makes.has("Crossroads")) {
    for (const required of ["Sunset Trail", "Zinger", "Zinger Lite", "Redwood", "Hampton"]) {
      if (!makes.get("Crossroads").has(required)) {
        fail(`Crossroads missing required series: ${required}`);
      }
    }
  }

  // New makes must stay present once added
  for (const make of ["Prime Time", "East to West"]) {
    if (!makes.has(make)) fail(`Missing make after expansion: ${make}`);
  }
  if (makes.has("Prime Time")) {
    for (const required of ["Avenger", "Tracer", "Crusader", "Sanibel", "LaCrosse"]) {
      if (!makes.get("Prime Time").has(required)) fail(`Prime Time missing: ${required}`);
    }
  }
  if (makes.has("East to West")) {
    for (const required of ["Della Terra", "Alta", "Tandara", "Ahara"]) {
      if (!makes.get("East to West").has(required)) fail(`East to West missing: ${required}`);
    }
  }

  console.log(`Catalog integrity: ${makes.size} makes, ${seriesCount} series`);
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    for (const w of warnings.slice(0, 40)) console.log("  WARN  " + w);
    if (warnings.length > 40) console.log(`  … +${warnings.length - 40} more`);
  }
  if (errors.length) {
    console.log(`\nFAILURES (${errors.length}):`);
    for (const e of errors) console.log("  FAIL  " + e);
    console.log("\nCatalog integrity FAILED — fix before shipping reports.");
    process.exit(1);
  }
  console.log("\nCatalog integrity PASSED.");
  process.exit(0);
}

main();
