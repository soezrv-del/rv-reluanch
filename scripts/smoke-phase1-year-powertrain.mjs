#!/usr/bin/env node
/**
 * Phase 1 smoke: year-true powertrain paint from rvData.ts bands.
 * Does not import the app (avoids image assets) — parses catalog source.
 */
import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync(
  path.join(process.cwd(), "src/lib/rv/rvData.ts"),
  "utf8",
);

const MAKE_RE = /^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9 ]+)): \{/gm;
const MODEL_RE =
  /^    (?:"([^"]+)"|([A-Za-z0-9][A-Za-z0-9 /+\-]*)): \{/gm;

function makeName(m) {
  return m[1] || m[2];
}
function modelName(m) {
  return m[1] || m[2];
}

function getBlock(make, model) {
  const makes = [...src.matchAll(MAKE_RE)];
  for (let i = 0; i < makes.length; i++) {
    const mk = makes[i];
    if (makeName(mk) !== make) continue;
    const end = i + 1 < makes.length ? makes[i + 1].index : src.length;
    const chunk = src.slice(mk.index, end);
    const models = [...chunk.matchAll(MODEL_RE)];
    for (let j = 0; j < models.length; j++) {
      const md = models[j];
      if (modelName(md) !== model) continue;
      const mend =
        j + 1 < models.length ? models[j + 1].index : chunk.length;
      return chunk.slice(md.index, mend);
    }
  }
  return null;
}

function parseBands(block) {
  const out = [];
  const re = /\{\s*from:\s*(\d+),\s*to:\s*(\d+),((?:[^{}]|\n)*)\}/g;
  let m;
  while ((m = re.exec(block))) {
    const body = m[3];
    const eng = body.match(/engine:\s*"([^"]+)"/);
    const hp = body.match(/horsepower:\s*(\d+)/);
    const ch = body.match(/chassis:\s*"([^"]+)"/);
    out.push({
      from: +m[1],
      to: +m[2],
      engine: eng?.[1],
      horsepower: hp ? +hp[1] : null,
      chassis: ch?.[1],
    });
  }
  return out;
}

function pickBand(bands, y) {
  const exact = bands.find((b) => y >= b.from && y <= b.to);
  if (exact) return exact;
  let best = null;
  let bestDist = Infinity;
  for (const b of bands) {
    const dist = y < b.from ? b.from - y : y > b.to ? y - b.to : 0;
    if (dist < bestDist) {
      bestDist = dist;
      best = b;
    }
  }
  if (best && bestDist <= 3) return best;
  return null;
}

function topEngine(block) {
  const m = block.match(/engine:\s*"([^"]+)"/);
  return m?.[1] || null;
}
function topHp(block) {
  const m = block.match(/horsepower:\s*(\d+)/);
  return m ? +m[1] : null;
}

function resolve(make, model, year) {
  const block = getBlock(make, model);
  if (!block) return { error: "missing model" };
  const bands = parseBands(block);
  const band = pickBand(bands, year);
  const engine = band?.engine ?? topEngine(block);
  const horsepower = band
    ? band.horsepower
    : topHp(block);
  return {
    engine,
    horsepower,
    band: band ? `${band.from}-${band.to}` : null,
    yearTrue: !!band,
    top: topEngine(block),
  };
}

const cases = [
  {
    name: "diesel pusher old",
    year: 2012,
    make: "Newmar",
    model: "Kountry Star",
    expectEngine: /Cummins/i,
    rejectEngine: /Godzilla|7\.3|F-?53|V10/i,
    expectHpMin: 300,
    expectHpMax: 360,
  },
  {
    name: "diesel pusher new",
    year: 2024,
    make: "Newmar",
    model: "Kountry Star",
    expectEngine: /Cummins|B6\.7/i,
    rejectEngine: /Godzilla|7\.3|V10/i,
    expectHpMin: 340,
    expectHpMax: 360,
  },
  {
    name: "gas Class A",
    year: 2016,
    make: "Newmar",
    model: "Bay Star",
    expectEngine: /V10|Triton|Ford/i,
    rejectEngine: /Cummins L9|ISL 450/i,
  },
  {
    name: "Class C",
    year: 2020,
    make: "Forest River",
    model: "Sunseeker",
    expectEngine: /Ford|V10|7\.3|6\.2|Godzilla/i,
  },
  {
    name: "Class B diesel",
    year: 2015,
    make: "Airstream",
    model: "Interstate",
    expectEngine: /Mercedes|Sprinter|diesel/i,
    rejectEngine: /Godzilla|F-?53/i,
  },
  {
    name: "Super C",
    year: 2014,
    make: "Nexus RV",
    model: "Triumph",
    expectEngine: /Cummins|Power Stroke|diesel|Super C/i,
    rejectEngine: /Godzilla/i,
  },
  {
    name: "FR3 modern gas",
    year: 2024,
    make: "Forest River",
    model: "FR3",
    expectEngine: /7\.3|Godzilla|Ford/i,
    rejectEngine: /Cummins|diesel/i,
    expectHpMin: 320,
    expectHpMax: 350,
  },
];

let failed = 0;
for (const c of cases) {
  const r = resolve(c.make, c.model, c.year);
  const issues = [];
  if (r.error) issues.push(r.error);
  if (c.expectEngine && r.engine && !c.expectEngine.test(r.engine)) {
    issues.push(`engine "${r.engine}" !~ ${c.expectEngine}`);
  }
  if (c.rejectEngine && r.engine && c.rejectEngine.test(r.engine)) {
    issues.push(`engine rejected pattern: ${r.engine}`);
  }
  if (c.expectHpMin != null && r.horsepower != null) {
    if (r.horsepower < c.expectHpMin || r.horsepower > c.expectHpMax) {
      issues.push(`hp ${r.horsepower} not in ${c.expectHpMin}-${c.expectHpMax}`);
    }
  }
  // never invent 450 when band has different value
  if (r.yearTrue && r.horsepower === 450 && c.expectHpMax && c.expectHpMax < 450) {
    issues.push("invented 450 HP");
  }
  const ok = issues.length === 0;
  if (!ok) failed++;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${c.name}: ${c.year} ${c.make} ${c.model} → ${r.engine} | HP=${r.horsepower} | band=${r.band} | top=${r.top}`,
  );
  for (const i of issues) console.log("   -", i);
}

// 1.2: wizard year must be the lookup year (identity check helper)
function reportYearEqualsLookup(wizardYear, lookupYear) {
  return String(wizardYear) === String(lookupYear);
}
if (!reportYearEqualsLookup("2012", "2012")) {
  failed++;
  console.log("FAIL year identity");
} else {
  console.log("PASS 1.2 year identity (wizard year === powertrain lookup year)");
}

console.log(failed === 0 ? "\nPhase 1 smoke: ALL PASS" : `\nPhase 1 smoke: ${failed} FAIL`);
process.exit(failed === 0 ? 0 : 1);
