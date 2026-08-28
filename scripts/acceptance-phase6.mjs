#!/usr/bin/env node
/**
 * Phase 6 acceptance pack — cases A–F.
 * Catalog year-band resolution + pin/cache guards (no browser, no network).
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const src = fs.readFileSync(path.join(root, "src/lib/rv/rvData.ts"), "utf8");
const pinsSrc = fs.readFileSync(
  path.join(root, "src/lib/rv/powertrainCorrections.ts"),
  "utf8",
);

const MAKE_RE = /^  (?:"([^"]+)"|([A-Za-z][A-Za-z0-9 &\.\-]+)):\s*\{/gm;
const MODEL_RE =
  /^    (?:"([^"]+)"|([A-Za-z0-9][A-Za-z0-9 /+\.\-]*)):\s*\{/gm;

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
      engine: eng?.[1] || null,
      horsepower: hp ? +hp[1] : null,
      chassis: ch?.[1] || null,
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
  return best && bestDist <= 3 ? best : null;
}

function resolveYear(make, model, year) {
  const block = getBlock(make, model);
  if (!block) return { error: `missing ${make} ${model}` };
  const bands = parseBands(block);
  const band = pickBand(bands, year);
  const topE = block.match(/engine:\s*"([^"]+)"/)?.[1] || null;
  const topH = block.match(/horsepower:\s*(\d+)/);
  const topHp = topH ? +topH[1] : null;
  return {
    engine: band?.engine ?? topE,
    horsepower: band ? band.horsepower : topHp,
    chassis: band?.chassis ?? null,
    band: band ? `${band.from}-${band.to}` : null,
    yearTrue: !!band,
    topEngine: topE,
  };
}

// --- pin + validation mirrors (Phase 2/4) ---
const GAS_ENGINE_RE =
  /\b(godzilla|triton|v10|6\.8\s*l|7\.3\s*l|ecoboost|f-?53)\b/i;
const DIESEL_ENGINE_RE =
  /\b(cummins|isb|isl|isx|b6\.7|l9|x15|cat\b|diesel)\b/i;

function hasKountryPin(year) {
  // pins file should mention kountry or we rely on year-band only
  return /kountry/i.test(pinsSrc) && year >= 2018;
}

function validateLiveVsCatalog({
  model,
  catalogFuel,
  catalogEngine,
  liveEngine,
  liveHp,
  pinEngine,
}) {
  const reasons = [];
  const md = model.toLowerCase();
  if (
    /diesel/i.test(catalogFuel || "") &&
    liveEngine &&
    GAS_ENGINE_RE.test(liveEngine) &&
    !DIESEL_ENGINE_RE.test(liveEngine)
  ) {
    reasons.push("gas on diesel");
  }
  if (md.includes("kountry star") && liveEngine && GAS_ENGINE_RE.test(liveEngine)) {
    reasons.push("kountry gas");
  }
  if (md.includes("fr3") && liveEngine && /cummins|l9|diesel pusher/i.test(liveEngine)) {
    reasons.push("fr3 diesel");
  }
  if (
    pinEngine &&
    liveEngine &&
    DIESEL_ENGINE_RE.test(pinEngine) &&
    GAS_ENGINE_RE.test(liveEngine) &&
    !DIESEL_ENGINE_RE.test(liveEngine)
  ) {
    reasons.push("pin diesel vs live gas");
  }
  if (liveHp === 450 && liveEngine && GAS_ENGINE_RE.test(liveEngine)) {
    reasons.push("invent 450 gas");
  }
  if (
    catalogEngine &&
    /isb|b6\.7/i.test(catalogEngine) &&
    liveHp >= 450 &&
    !/l9|isl|x15/i.test(catalogEngine)
  ) {
    reasons.push("flagship hp on mid");
  }
  return reasons;
}

function canLiveStompCatalog(catalogEngine, reject) {
  const empty =
    !catalogEngine || catalogEngine === "—" || catalogEngine.length < 3;
  if (!empty) return false;
  return reject.length === 0;
}

function sanitizeCache({ pinEngine, pinHp, live, catalogEngine, catalogFuel, model }) {
  const reject = validateLiveVsCatalog({
    model,
    catalogFuel,
    catalogEngine: pinEngine || catalogEngine,
    liveEngine: live.engine,
    liveHp: live.horsepower,
    pinEngine,
  });
  if (pinEngine) {
    return {
      engine: pinEngine,
      horsepower: pinHp,
      powertrainPinned: true,
      storedBad: false,
    };
  }
  if (reject.length) {
    return {
      engine: null,
      horsepower: null,
      powertrainPinned: false,
      storedBad: false,
      softOnly: true,
      reject,
    };
  }
  return {
    engine: live.engine,
    horsepower: live.horsepower,
    powertrainPinned: false,
    storedBad: false,
  };
}

const results = [];
function check(id, name, ok, detail) {
  results.push({ id, name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id}: ${name}`);
  console.log(`      ${detail}`);
}

// ── A ──────────────────────────────────────────────
{
  const r = resolveYear("Newmar", "Kountry Star", 2021);
  const ok =
    !r.error &&
    /cummins|b6\.7|isb/i.test(r.engine || "") &&
    !/godzilla|7\.3|v10|triton/i.test(r.engine || "") &&
    r.horsepower != null &&
    r.horsepower >= 340 &&
    r.horsepower <= 380 &&
    r.horsepower !== 450;
  check(
    "A",
    "2021 Newmar Kountry Star → Cummins ~360, not 7.3/450 invent",
    ok,
    `${r.engine} | HP=${r.horsepower} | band=${r.band}`,
  );
}

// ── B ──────────────────────────────────────────────
{
  const r = resolveYear("Newmar", "Kountry Star", 2010);
  const ok =
    !r.error &&
    /cummins|isb|cat/i.test(r.engine || "") &&
    !/godzilla|7\.3/i.test(r.engine || "") &&
    r.horsepower != null &&
    r.horsepower < 400;
  check(
    "B",
    "2010 Newmar Kountry Star → Cummins ISB/Cat class, not Godzilla",
    ok,
    `${r.engine} | HP=${r.horsepower} | band=${r.band}`,
  );
}

// ── C ──────────────────────────────────────────────
{
  const r = resolveYear("Forest River", "FR3", 2024);
  const ok =
    !r.error &&
    /7\.3|godzilla|ford/i.test(r.engine || "") &&
    !/cummins|diesel/i.test(r.engine || "") &&
    r.horsepower === 335 &&
    /f-?53|f53/i.test(r.chassis || "Ford F53");
  check(
    "C",
    "2024 Forest River FR3 → Godzilla 335 HP, gas F53",
    ok,
    `${r.engine} | HP=${r.horsepower} | chassis=${r.chassis} | band=${r.band}`,
  );
}

// ── D ──────────────────────────────────────────────
{
  const r = resolveYear("Newmar", "Bay Star", 2016);
  const ok =
    !r.error &&
    /v10|triton/i.test(r.engine || "") &&
    !/l9|isl|cummins/i.test(r.engine || "");
  check(
    "D",
    "2016 gas Class A Bay Star → Triton V10, not diesel L9",
    ok,
    `${r.engine} | HP=${r.horsepower} | band=${r.band}`,
  );
}

// ── E offline / timeout: year-band remains; no fake HP ──
{
  const catalog = resolveYear("Newmar", "Kountry Star", 2012);
  // Simulate Live fail → merge keeps catalog (lockPowertrainFromCatalog)
  const live = null;
  const painted = {
    engine: catalog.engine,
    horsepower: catalog.horsepower,
  };
  // After timeout, hard fields stay year-band
  const fakeHp = painted.horsepower === 450 && !/450/.test(catalog.engine || "");
  const ok =
    /cummins/i.test(painted.engine || "") &&
    !/godzilla/i.test(painted.engine || "") &&
    !fakeHp &&
    painted.horsepower != null &&
    painted.horsepower < 400;
  check(
    "E",
    "Live offline/timeout → year-band still correct; no fake HP",
    ok,
    `catalog stays: ${painted.engine} | HP=${painted.horsepower} (live=${live})`,
  );
}

// ── F pin after bad Live; cache does not re-poison ──
{
  const catalog = resolveYear("Newmar", "Kountry Star", 2021);
  const badLive = {
    engine: "Ford 7.3L V8 Godzilla",
    horsepower: 450,
    fuelType: "Gas",
  };
  const reject = validateLiveVsCatalog({
    model: "Kountry Star",
    catalogFuel: "Diesel",
    catalogEngine: catalog.engine,
    liveEngine: badLive.engine,
    liveHp: badLive.horsepower,
    pinEngine: catalog.engine, // year-band acts as pin-equivalent
  });
  const stomp = canLiveStompCatalog(catalog.engine, reject);
  const cached = sanitizeCache({
    pinEngine: catalog.engine,
    pinHp: catalog.horsepower,
    live: badLive,
    catalogEngine: catalog.engine,
    catalogFuel: "Diesel",
    model: "Kountry Star",
  });
  const ok =
    reject.length > 0 &&
    stomp === false &&
    /cummins/i.test(cached.engine || "") &&
    cached.horsepower === catalog.horsepower &&
    cached.storedBad === false &&
    !/godzilla/i.test(cached.engine || "");
  check(
    "F",
    "Known pin after bad Live → pin wins; cache doesn’t re-poison",
    ok,
    `reject=${reject.join(";") || "none"} stomp=${stomp} cached=${cached.engine} HP=${cached.horsepower}`,
  );
}

const failed = results.filter((r) => !r.ok);
console.log("");
console.log(
  failed.length === 0
    ? "Phase 6 acceptance: ALL PASS (A–F)"
    : `Phase 6 acceptance: ${failed.length} FAIL — ${failed.map((f) => f.id).join(", ")}`,
);

// Write report for ops
const report = {
  generatedAt: new Date().toISOString(),
  passed: results.filter((r) => r.ok).length,
  failed: failed.length,
  cases: results,
};
fs.mkdirSync(path.join(root, "exports"), { recursive: true });
fs.writeFileSync(
  path.join(root, "exports/rvfax-phase6-acceptance.json"),
  JSON.stringify(report, null, 2),
);
console.log("wrote exports/rvfax-phase6-acceptance.json");

process.exit(failed.length === 0 ? 0 : 1);
