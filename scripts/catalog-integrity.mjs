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
  "Newmar|Bay Star": "gas",
  "Newmar|Bay Star Sport": "gas",
  "Newmar|Freedom Aire": "class c",
  "Newmar|Super Star": "super c",
  "Newmar|Summit Aire": "super c",
  "Newmar|Supreme Aire": "super c",
  "Newmar|Grand Star": "super c",
  "Newmar|Canyon Star": "diesel",
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

  // Newmar block is unquoted (`Newmar: {`) so the quoted-make parser misses it.
  // Scan the raw Newmar…Tiffin slice for recent-years OEM gates.
  {
    const n0 = src.indexOf("\n  Newmar: {");
    const n1 = src.indexOf("\n  Tiffin: {");
    if (n0 < 0 || n1 < n0) {
      fail("Newmar block not found between Newmar: and Tiffin:");
    } else {
      const newmar = src.slice(n0, n1);
      for (const required of [
        "Essex",
        "King Aire",
        "London Aire",
        "Mountain Aire",
        "Dutch Star",
        "New Aire",
        "Ventana",
        "Northern Star",
        "Bay Star",
        "Bay Star Sport",
        "Canyon Star",
        "Super Star",
        "Summit Aire",
        "Supreme Aire",
        "Grand Star",
        "Freedom Aire",
        "Kountry Star",
      ]) {
        const hit =
          newmar.includes(`    ${required}: {`) ||
          newmar.includes(`    "${required}": {`);
        if (!hit) fail(`Newmar missing required series: ${required}`);
      }
      const ks0 = newmar.indexOf('    "Kountry Star": {');
      const ks1 = newmar.indexOf('    "Bay Star": {');
      const ks = ks0 >= 0 && ks1 > ks0 ? newmar.slice(ks0, ks1) : "";
      if (!/yearEnd:\s*2024/.test(ks)) {
        fail("Newmar|Kountry Star yearEnd must be 2024 (Northern Star from 2025)");
      }
      if (/"2025"/.test(ks) || /"2026"/.test(ks) || /"2027"/.test(ks)) {
        fail("Newmar|Kountry Star must not list 2025–2027 floorplans");
      }
      const la0 = newmar.indexOf('    "London Aire": {');
      const la1 = newmar.indexOf('    "Kountry Star": {');
      const la = la0 >= 0 && la1 > la0 ? newmar.slice(la0, la1) : "";
      if (/yearEnd:\s*\d+/.test(la)) {
        fail("Newmar|London Aire is an active OEM line — do not yearEnd it");
      }
      if (!/"2027": \["4540", "4545", "4551", "4569", "4595"\]/.test(la)) {
        fail("Newmar|London Aire MY27 OEM plans missing (4540/4545/4551/4569/4595)");
      }
      if (!/"2027": \["3836", "4081", "4311", "4325", "4340", "4345", "4369"\]/.test(newmar)) {
        fail("Newmar|Dutch Star MY27 OEM plans missing");
      }
      if (!/"2027": \["4545", "4551", "4569", "4595"\]/.test(newmar)) {
        fail("Newmar|Essex MY27 OEM plans missing");
      }
      const bs0 = newmar.indexOf('    "Bay Star": {');
      const bs1 = newmar.indexOf('    "Bay Star Sport": {');
      const bs = bs0 >= 0 && bs1 > bs0 ? newmar.slice(bs0, bs1) : "";
      if (!/fuelType:\s*"Gas"/.test(bs) || /fuelType:\s*"Diesel"/.test(bs)) {
        fail("Newmar|Bay Star must stay Class A Gas — do not stamp diesel pusher defaults");
      }
      if (/\n    "Dutch Aire": \{/.test(newmar) || /\n    "All Star": \{/.test(newmar)) {
        fail("Newmar live catalog must not re-list Dutch Aire / All Star (last OEM ~2009)");
      }
      const fa0 = newmar.indexOf('    "Freedom Aire": {');
      const fa1 = newmar.indexOf('    "Canyon Star": {');
      const fa = fa0 >= 0 && fa1 > fa0 ? newmar.slice(fa0, fa1) : "";
      if (!/horsepower:\s*211/.test(fa) || !/"2027": \["2515","2512"\]/.test(fa)) {
        fail("Newmar|Freedom Aire MY27 must be Sprinter 211 HP with 2515 + 2512");
      }
      if (/"2021"/.test(fa) || /"2022"/.test(fa) || /"2023"/.test(fa) || /"2024"/.test(fa)) {
        fail("Newmar|Freedom Aire must not list 2021–2024 (OEM from 2026)");
      }
      const nsBlock0 = newmar.indexOf('    "Northern Star": {');
      const nsBlock1 = newmar.indexOf('    "Grand Star": {');
      const nsBlock = nsBlock0 >= 0 && nsBlock1 > nsBlock0 ? newmar.slice(nsBlock0, nsBlock1) : "";
      if (/"2021"/.test(nsBlock) || /"2022"/.test(nsBlock) || /"2023"/.test(nsBlock) || /"2024"/.test(nsBlock)) {
        fail("Newmar|Northern Star must not list 2021–2024 (OEM from 2025)");
      }
      if (!/"2023": \["3412", "3426", "3709", "3717", "4011", "4037", "4068", "4070"\]/.test(ks)) {
        fail("Newmar|Kountry Star MY23 OEM plans missing");
      }
      if (!/"2024": \["3418", "3426", "3709", "3717", "4011", "4037", "4068", "4070"\]/.test(ks)) {
        fail("Newmar|Kountry Star MY24 OEM plans missing (last year before Northern Star)");
      }
      if (!/"2023": \["3709", "3717", "3736", "4071", "4081", "4310", "4311", "4325", "4326", "4328", "4369", "4370"\]/.test(newmar)) {
        fail("Newmar|Dutch Star MY23 OEM plans missing");
      }
      if (!/"2024": \["3817", "3836", "4071", "4081", "4310", "4311", "4325", "4326", "4369", "4370"\]/.test(newmar)) {
        fail("Newmar|Dutch Star MY24 OEM plans missing");
      }
      if (!/"2023": \["3014", "3020", "3124", "3225", "3401", "3408", "3609", "3616", "3626", "3629", "3811"\]/.test(bs)) {
        fail("Newmar|Bay Star MY23 OEM gas plans missing");
      }
      if (!/"2024": \["3014", "3116", "3225", "3423", "3618", "3626", "3629", "3811"\]/.test(bs)) {
        fail("Newmar|Bay Star MY24 OEM gas plans missing");
      }
      const ss0 = newmar.indexOf('    "Super Star": {');
      const ss1 = newmar.indexOf('    "Supreme Aire": {');
      const ss = ss0 >= 0 && ss1 > ss0 ? newmar.slice(ss0, ss1) : "";
      if (!/"2023": \["3727","3729","4059","4061","4065"\]/.test(ss)) {
        fail("Newmar|Super Star MY23 OEM plans missing");
      }
      if (!/yearStart:\s*2020/.test(ss)) {
        fail("Newmar|Super Star yearStart must be 2020 (OEM 2020_Super_Star brochure exists)");
      }
      if (!/"2021": \["3746","4051","4058","4061"\]/.test(ss)) {
        fail("Newmar|Super Star MY21 OEM plans missing");
      }
      if (!/"2022": \["3727","4059","4061","4065"\]/.test(ss)) {
        fail("Newmar|Super Star MY22 OEM plans missing");
      }
      if (!/"2021": \["4533", "4535", "4543", "4551", "4579", "4583"\]/.test(la)) {
        fail("Newmar|London Aire MY21 OEM plans missing");
      }
      if (!/"2022": \["4533", "4535", "4551", "4579", "4589"\]/.test(la)) {
        fail("Newmar|London Aire MY22 OEM plans missing");
      }
      if (!/"2021": \["3709", "3717", "3736", "4020", "4081", "4310", "4311", "4326", "4328", "4354", "4362", "4363", "4369"\]/.test(newmar)) {
        fail("Newmar|Dutch Star MY21 OEM plans missing");
      }
      if (!/"2022": \["3709", "3717", "3736", "4020", "4081", "4310", "4311", "4326", "4328", "4363", "4369"\]/.test(newmar)) {
        fail("Newmar|Dutch Star MY22 OEM plans missing");
      }
      if (!/"2021": \["3005", "3014", "3124", "3226", "3312", "3401", "3408", "3414", "3609", "3616", "3626", "3811"\]/.test(bs)) {
        fail("Newmar|Bay Star MY21 OEM gas plans missing");
      }
      if (!/"2022": \["3005", "3014", "3124", "3226", "3401", "3408", "3416", "3609", "3616", "3626", "3811"\]/.test(bs)) {
        fail("Newmar|Bay Star MY22 OEM gas plans missing");
      }
      if (!/"2019": \["4533", "4534", "4535", "4543", "4550", "4551", "4576", "4579"\]/.test(la)) {
        fail("Newmar|London Aire MY19 OEM plans missing");
      }
      if (!/"2020": \["4533", "4535", "4543", "4551", "4559", "4569", "4579"\]/.test(la)) {
        fail("Newmar|London Aire MY20 OEM plans missing");
      }
      if (!/"2020": \["3746","4051","4058","4061"\]/.test(ss)) {
        fail("Newmar|Super Star MY20 OEM plans missing");
      }
      const sa0 = newmar.indexOf('    "Supreme Aire": {');
      const sa1 = newmar.indexOf('    "Summit Aire": {');
      const sa = sa0 >= 0 && sa1 > sa0 ? newmar.slice(sa0, sa1) : "";
      if (!/yearStart:\s*2020/.test(sa)) {
        fail("Newmar|Supreme Aire yearStart must be 2020 (OEM 2020_Supreme_Aire brochure exists)");
      }
      if (!/"2020": \["4573","4575","4577"\]/.test(sa)) {
        fail("Newmar|Supreme Aire MY20 OEM plans missing");
      }
      const le0 = newmar.indexOf('    "Ventana LE": {');
      const le1 = newmar.indexOf('    "Northern Star": {');
      const le = le0 >= 0 && le1 > le0 ? newmar.slice(le0, le1) : "";
      if (!/yearEnd:\s*2019/.test(le)) {
        fail("Newmar|Ventana LE yearEnd must be 2019");
      }
      if (!/"2019": \["3412","3426","3709","3717","4002","4037","4045","4048"\]/.test(le)) {
        fail("Newmar|Ventana LE MY19 final-year OEM plans missing");
      }
      if (/"2020"/.test(le)) {
        fail("Newmar|Ventana LE must not list 2020 (no OEM brochure)");
      }
    }
  }

  // Winnebago recent-years OEM gates (first walk-back slice ~2025–2027)
  {
    const w0 = src.indexOf("\n  Winnebago: {");
    const w1 = src.indexOf('\n  "Forest River": {');
    if (w0 < 0 || w1 < w0) {
      fail("Winnebago block not found between Winnebago: and Forest River:");
    } else {
      const wgo = src.slice(w0, w1);
      for (const required of [
        "Forza",
        "Journey",
        "Vista",
        "Sunstar",
        "Adventurer",
        "Revel",
        "Revel Sport",
        "Travato",
        "Solis",
        "Solis Pocket",
        "View",
        "Navion",
        "EKKO",
        "Spirit",
        "Minnie Winnie",
        "Sunflyer",
        "Suncruiser",
        "Elora",
        "Resa",
        "ARKA",
        "Access",
        "Access Super C",
        "Thrive",
        "Voyage",
        "M-Series",
        "Micro Minnie",
        "Minnie",
      ]) {
        const hit =
          wgo.includes(`    ${required}: {`) ||
          wgo.includes(`    "${required}": {`);
        if (!hit) fail(`Winnebago missing required series: ${required}`);
      }
      const fz0 = wgo.indexOf("    Forza: {");
      const fz1 = wgo.indexOf("    Journey: {");
      const fz = fz0 >= 0 && fz1 > fz0 ? wgo.slice(fz0, fz1) : "";
      if (!/"2025": \["34T", "36H", "38W"\]/.test(fz)) {
        fail("Winnebago|Forza MY25 OEM plans missing (34T/36H/38W)");
      }
      if (/"2026"/.test(fz) || /"2027"/.test(fz)) {
        fail("Winnebago|Forza must not list 2026–2027 (no OEM card)");
      }
      if (!/"2025": \["34N"\]/.test(wgo)) {
        fail("Winnebago|Journey MY25 OEM 34N missing");
      }
      const hz0 = wgo.indexOf("    Horizon: {");
      const hz1 = wgo.indexOf('    "Grand Tour": {');
      const hz = hz0 >= 0 && hz1 > hz0 ? wgo.slice(hz0, hz1) : "";
      if (/"2021"/.test(hz) || /"2022"/.test(hz) || /"2023"/.test(hz) || /"2024"/.test(hz) || /"2025"/.test(hz) || /"2026"/.test(hz) || /"2027"/.test(hz)) {
        fail("Winnebago|Horizon must not list 2021–2027 (last brochure ~2019; no OEM 2021–24 card)");
      }
      if (!/yearEnd:\s*2020/.test(hz)) {
        fail("Winnebago|Horizon yearEnd must be 2020 (no OEM 2021–24 card)");
      }
      const in0 = wgo.indexOf("    Intent: {");
      const in1 = wgo.indexOf("    Adventurer: {");
      const intent = in0 >= 0 && in1 > in0 ? wgo.slice(in0, in1) : "";
      if (/"2021"/.test(intent) || /"2022"/.test(intent) || /"2023"/.test(intent) || /"2024"/.test(intent) || /"2025"/.test(intent)) {
        fail("Winnebago|Intent must not list 2021–2025 (no OEM 2021–24 card)");
      }
      if (!/yearEnd:\s*2020/.test(intent)) {
        fail("Winnebago|Intent yearEnd must be 2020 (no OEM 2021–24 card)");
      }
      const via0 = wgo.indexOf("    Via: {");
      const via1 = wgo.indexOf("    Vista: {");
      const via = via0 >= 0 && via1 > via0 ? wgo.slice(via0, via1) : "";
      if (/"2019":/.test(via) || /"2020":/.test(via) || /"2021":/.test(via)) {
        fail("Winnebago|Via must not list 2019–2021 (no year-true Via card)");
      }
      if (!/yearEnd:\s*2018/.test(via)) {
        fail("Winnebago|Via yearEnd must be 2018 (no OEM 2019–20 card)");
      }
      const gt0 = wgo.indexOf('    "Grand Tour": {');
      const gt1 = wgo.indexOf("    Via: {");
      const gt = gt0 >= 0 && gt1 > gt0 ? wgo.slice(gt0, gt1) : "";
      if (/"2019":/.test(gt)) {
        fail("Winnebago|Grand Tour must not list 2019 (no year-true card)");
      }
      if (!/yearEnd:\s*2018/.test(gt)) {
        fail("Winnebago|Grand Tour yearEnd must be 2018 (no OEM 2019 card)");
      }
      const it0 = wgo.indexOf('    "Itasca Sunstar": {');
      const it1 = wgo.indexOf("    Revel: {");
      const itasca = it0 >= 0 && it1 > it0 ? wgo.slice(it0, it1) : "";
      if (/"2019":/.test(itasca)) {
        fail("Winnebago|Itasca Sunstar must not list 2019 (2019 Sunstar is Winnebago, not Itasca)");
      }
      if (!/yearEnd:\s*2018/.test(itasca)) {
        fail("Winnebago|Itasca Sunstar yearEnd must be 2018 (no 2019 Itasca card)");
      }
      const jy0 = wgo.indexOf("    Journey: {");
      const jy1 = wgo.indexOf("    Horizon: {");
      const jy = jy0 >= 0 && jy1 > jy0 ? wgo.slice(jy0, jy1) : "";
      if (/"2019":/.test(jy) || /"2020":/.test(jy) || /"2021":/.test(jy)) {
        fail("Winnebago|Journey must not list 2019–2021 (no year-true card; 2022 is L9 34N)");
      }
      const so0 = wgo.indexOf("    Solis: {");
      const so1 = wgo.indexOf("    Boldt: {");
      const so = so0 >= 0 && so1 > so0 ? wgo.slice(so0, so1) : "";
      if (/"2019":/.test(so)) {
        fail("Winnebago|Solis must not list 2019 (first year-true card 2020)");
      }
      if (!/yearStart:\s*2020/.test(so)) {
        fail("Winnebago|Solis yearStart must be 2020 (OEM 2020 flyer 59P)");
      }
      if (/"2017":/.test(so) || /"2018":/.test(so)) {
        fail("Winnebago|Solis must not list 2017–2018 (first year-true card 2020)");
      }
      if (!/"2017": \["34T", "36G", "38W"\]/.test(fz)) {
        fail("Winnebago|Forza MY17 OEM plans missing (34T/36G/38W — no 38F)");
      }
      if (/"2017": .*"38F"/.test(fz)) {
        fail("Winnebago|Forza MY17 must not invent 38F (2018+)");
      }
      if (!/"2018": \["34T", "36G", "38F", "38W"\]/.test(fz)) {
        fail("Winnebago|Forza MY18 OEM plans missing (34T/36G/38F/38W)");
      }
      if (/"2017": .*"34G"/.test(jy) || /"2018": .*"34G"/.test(jy) || /"2018": .*"34H"/.test(jy)) {
        fail("Winnebago|Journey must not invent leftover 34G/34H on 2017–18");
      }
      if (/"2017":/.test(hz)) {
        fail("Winnebago|Horizon must not list 2017 (first year-true card 2018)");
      }
      if (!/"2018": \["40A", "42Q"\]/.test(hz)) {
        fail("Winnebago|Horizon MY18 OEM plans missing (40A/42Q)");
      }
      if (!/yearStart:\s*2018/.test(intent)) {
        fail("Winnebago|Intent yearStart must be 2018 (first year-true card)");
      }
      if (/"2017":/.test(intent)) {
        fail("Winnebago|Intent must not list 2017 (first year-true card 2018)");
      }
      const ss0 = wgo.indexOf("    Sunstar: {");
      const ss1 = wgo.indexOf("    Intent: {");
      const ss = ss0 >= 0 && ss1 > ss0 ? wgo.slice(ss0, ss1) : "";
      if (/"2017":/.test(ss)) {
        fail("Winnebago|Sunstar must not list 2017 (2017 Sunstar is Itasca — do not collide)");
      }
      const vi0 = wgo.indexOf("    Vita: {");
      const vi1 = wgo.indexOf("    EKKO: {");
      const vita = vi0 >= 0 && vi1 > vi0 ? wgo.slice(vi0, vi1) : "";
      if (/"2017":/.test(vita) || /"2018":/.test(vita)) {
        fail("Winnebago|Vita must not list 2017–2018 (first year-true card 2019)");
      }
      const mm0 = wgo.indexOf('    "Micro Minnie": {');
      const mm1 = wgo.indexOf("    Minnie: {");
      const mm = mm0 >= 0 && mm1 > mm0 ? wgo.slice(mm0, mm1) : "";
      if (/"2018":/.test(mm)) {
        fail("Winnebago|Micro Minnie must not list 2018 (RVUSA 2018 file reprints 2017)");
      }
      const mn0 = wgo.indexOf("    Minnie: {");
      const mn1 = wgo.indexOf('    "Revel Sport": {');
      const mn = mn0 >= 0 && mn1 > mn0 ? wgo.slice(mn0, mn1) : "";
      if (/"2018":/.test(mn)) {
        fail("Winnebago|Minnie must not list 2018 (RVUSA 2018 file reprints 2017)");
      }
      if (!/"2027": \["24D", "24R", "24T"\]/.test(wgo)) {
        fail("Winnebago|View/Navion MY27 OEM plans missing (24D/24R/24T)");
      }
      const vw0 = wgo.indexOf("    View: {");
      const vw1 = wgo.indexOf("    Navion: {");
      const vw = vw0 >= 0 && vw1 > vw0 ? wgo.slice(vw0, vw1) : "";
      if (/"2026": .*"24D"/.test(vw) || /"2026": \["24D"/.test(vw)) {
        fail("Winnebago|View MY26 must not copy 24D (OEM 24R/24T only)");
      }
      const nv0 = wgo.indexOf("    Navion: {");
      const nv1 = wgo.indexOf("    Porto: {");
      const nv = nv0 >= 0 && nv1 > nv0 ? wgo.slice(nv0, nv1) : "";
      if (/"2025": .*"24D"/.test(nv)) {
        fail("Winnebago|Navion MY25 must be 24R/24T only (24D is View-only on the 2025 card)");
      }
      const ek0 = wgo.indexOf("    EKKO: {");
      const ek1 = wgo.indexOf("    Spirit: {");
      const ek = ek0 >= 0 && ek1 > ek0 ? wgo.slice(ek0, ek1) : "";
      if (/"2025": .*"23B"/.test(ek) || /"2027": .*"23B"/.test(ek)) {
        fail("Winnebago|EKKO must not copy 23B onto 2025 or 2027");
      }
      const ac0 = wgo.indexOf('    "Access Super C": {');
      const ac1 = wgo.indexOf('    "Micro Minnie": {');
      const ac = ac0 >= 0 && ac1 > ac0 ? wgo.slice(ac0, ac1) : "";
      if (/"2017":/.test(ac) || /"2018":/.test(ac)) {
        fail("Winnebago|Access Super C must not list 2017–2018 (no OEM Super C card)");
      }
      if (/"2021":/.test(ac) || /"2022":/.test(ac) || /"2023"/.test(ac) || /"2024"/.test(ac) || /"2025"/.test(ac) || /"2026"/.test(ac)) {
        fail("Winnebago|Access Super C must not list 2021–2026 (no OEM Super C card; 2024+ Access PDFs are travel trailers)");
      }
      if (!/yearEnd:\s*2022/.test(ac)) {
        fail("Winnebago|Access Super C yearEnd must be 2022 (key kept so Access TT ≠ Super C)");
      }
      const era0 = wgo.indexOf("    Era: {");
      const era1 = wgo.indexOf("    View: {");
      const era = era0 >= 0 && era1 > era0 ? wgo.slice(era0, era1) : "";
      if (/"2022":/.test(era)) {
        fail("Winnebago|Era must not list 2022 (RVUSA 2022 file reprints 2021 captions)");
      }
      if (!/yearEnd:\s*2021/.test(era)) {
        fail("Winnebago|Era yearEnd must be 2021 (no year-true 2022 card)");
      }
      const ol0 = wgo.indexOf("    Outlook: {");
      const ol1 = wgo.indexOf('    "Access Super C": {');
      const ol = ol0 >= 0 && ol1 > ol0 ? wgo.slice(ol0, ol1) : "";
      if (/"2015":/.test(ol) || /"2016":/.test(ol)) {
        fail("Winnebago|Outlook must not list 2015–2016 (no year-true Outlook card)");
      }
      if (/"2017":/.test(ol) || /"2018":/.test(ol)) {
        fail("Winnebago|Outlook must not list 2017–2018 (no year-true Outlook card)");
      }
      if (!/"2015": \["34T", "36G", "38R"\]/.test(fz) || !/"2016": \["34T", "36G", "38R"\]/.test(fz)) {
        fail("Winnebago|Forza MY15–16 OEM plans missing (34T/36G/38R)");
      }
      if (!/yearStart:\s*2014/.test(fz)) {
        fail("Winnebago|Forza yearStart must be 2014 (first year-true Forza card / wiring)");
      }
      if (/"2013":/.test(fz)) {
        fail("Winnebago|Forza must not list 2013 (first year-true card 2014)");
      }
      if (!/"2014": \["34T", "38R"\]/.test(fz)) {
        fail("Winnebago|Forza MY14 OEM plans missing (34T/38R)");
      }
      if (/"2013": .*"34G"/.test(jy) || /"2014": .*"34G"/.test(jy)) {
        fail("Winnebago|Journey must not invent leftover 34G on 2013–14");
      }
      if (/"2013":/.test(hz) || /"2014":/.test(hz)) {
        fail("Winnebago|Horizon must not list 2013–2014 (first year-true card 2018)");
      }
      if (/"2013":/.test(intent) || /"2014":/.test(intent)) {
        fail("Winnebago|Intent must not list 2013–2014 (first year-true card 2018)");
      }
      if (/"2013":/.test(ss) || /"2014":/.test(ss)) {
        fail("Winnebago|Sunstar must not list 2013–2014 (2013–14 Sunstar is Itasca — do not collide)");
      }
      if (/"2013":/.test(vita) || /"2014":/.test(vita)) {
        fail("Winnebago|Vita must not list 2013–2014 (first year-true card 2019)");
      }
      if (/"2013":/.test(so) || /"2014":/.test(so)) {
        fail("Winnebago|Solis must not list 2013–2014 (first year-true card 2020)");
      }
      if (/"2013":/.test(ac) || /"2014":/.test(ac)) {
        fail("Winnebago|Access Super C must not list 2013–2014 (no OEM Super C card)");
      }
      if (/"2013":/.test(ol) || /"2014":/.test(ol)) {
        fail("Winnebago|Outlook must not list 2013–2014 (no year-true Outlook card)");
      }
      if (!/yearStart:\s*2010/.test(ol)) {
        fail("Winnebago|Outlook yearStart must be 2010 (OEM 2010 Outlook card; no 2011–18)");
      }
      if (!/"2010": \["29B", "31C"\]/.test(ol)) {
        fail("Winnebago|Outlook MY10 OEM plans missing (29B/31C)");
      }
      if (/"2011":/.test(ol) || /"2012":/.test(ol)) {
        fail("Winnebago|Outlook must not list 2011–2012 (archive 2010 then 2019)");
      }
      if (/"2010":/.test(fz)) {
        fail("Winnebago|Forza must not list 2010–2012 (first year-true card 2014)");
      }
      if (/"2011":/.test(fz) || /"2012":/.test(fz)) {
        fail("Winnebago|Forza must not list 2010–2012 (first year-true card 2014)");
      }
      if (/"2010":/.test(hz) || /"2011":/.test(hz) || /"2012":/.test(hz)) {
        fail("Winnebago|Horizon must not list 2010–2012 (first year-true card 2018)");
      }
      if (/"2010":/.test(intent) || /"2011":/.test(intent) || /"2012":/.test(intent)) {
        fail("Winnebago|Intent must not list 2010–2012 (first year-true card 2018)");
      }
      if (/"2010":/.test(ss) || /"2011":/.test(ss) || /"2012":/.test(ss)) {
        fail("Winnebago|Sunstar must not list 2010–2012 (2010–12 Sunstar is Itasca — do not collide)");
      }
      if (/"2010":/.test(vita) || /"2011":/.test(vita) || /"2012":/.test(vita)) {
        fail("Winnebago|Vita must not list 2010–2012 (first year-true card 2019)");
      }
      if (/"2010":/.test(so) || /"2011":/.test(so) || /"2012":/.test(so)) {
        fail("Winnebago|Solis must not list 2010–2012 (first year-true card 2020)");
      }
      if (/"2010":/.test(ac) || /"2011":/.test(ac) || /"2012":/.test(ac)) {
        fail("Winnebago|Access Super C must not list 2010–2012 (2010–12 Access on wiring is Class C, not Super C)");
      }
      if (!/"2010": \["34Y", "39N", "40L", "40T"\]/.test(jy)) {
        fail("Winnebago|Journey MY10 OEM plans missing (34Y/39N/40L/40T)");
      }
      if (!/"2011": \["34Y", "39N", "40L", "40U"\]/.test(jy)) {
        fail("Winnebago|Journey MY11 OEM plans missing (34Y/39N/40L/40U)");
      }
      if (!/"2012": \["34Y", "36M", "40U", "42E"\]/.test(jy)) {
        fail("Winnebago|Journey MY12 OEM plans missing (34Y/36M/40U/42E)");
      }
      if (/"2010": .*"34G"/.test(jy) || /"2011": .*"34G"/.test(jy) || /"2012": .*"34G"/.test(jy)) {
        fail("Winnebago|Journey must not invent leftover 34G on 2010–12");
      }
      if (!/"2010": \["40BD", "40CD", "40WD", "42AD"\]/.test(gt)) {
        fail("Winnebago|Grand Tour MY10 OEM plans missing (40BD/40CD/40WD/42AD)");
      }
      if (!/"2011": \["40BD", "40CD", "42AD", "42QD"\]/.test(gt)) {
        fail("Winnebago|Grand Tour MY11 OEM plans missing (40BD/40CD/42AD/42QD)");
      }
      if (!/"2012": \["42AD", "42JD", "42QD"\]/.test(gt)) {
        fail("Winnebago|Grand Tour MY12 OEM plans missing (42AD/42JD/42QD)");
      }
      if (/"2010": .*"42QDP"/.test(gt) || /"2011": .*"45RL"/.test(gt) || /"2012": .*"42QDP"/.test(gt)) {
        fail("Winnebago|Grand Tour must not invent leftover 42QDP/45RL on 2010–12");
      }
      if (!/yearStart:\s*2010/.test(via)) {
        fail("Winnebago|Via yearStart must be 2010 (first year-true Via card)");
      }
      if (!/"2010": \["25R", "25T"\]/.test(via)) {
        fail("Winnebago|Via MY10 OEM plans missing (25R/25T)");
      }
      if (/"2010":/.test(mm) || /"2011":/.test(mm) || /"2012":/.test(mm)) {
        fail("Winnebago|Micro Minnie must not list 2010–2012 (archive starts 2015)");
      }
      if (/"2010":/.test(mn) || /"2011":/.test(mn) || /"2012":/.test(mn)) {
        fail("Winnebago|Minnie must not list 2010–2012 (no year-true 2010–12 Minnie card)");
      }
      if (!/yearStart:\s*2014/.test(mn)) {
        fail("Winnebago|Minnie yearStart must be 2014 (no 2010–13 year-true card)");
      }
      const sp0 = wgo.indexOf("    Spirit: {");
      const sp1 = wgo.indexOf('    "Minnie Winnie": {');
      const sp = sp0 >= 0 && sp1 > sp0 ? wgo.slice(sp0, sp1) : "";
      const mw0 = wgo.indexOf('    "Minnie Winnie": {');
      const mw1 = wgo.indexOf("    Outlook: {");
      const mw = mw0 >= 0 && mw1 > mw0 ? wgo.slice(mw0, mw1) : "";
      if (/"2010":/.test(sp) || /"2011":/.test(sp) || /"2012":/.test(sp)) {
        fail("Winnebago|Spirit must not list 2010–2012 (2010–12 Class C on wiring is Access / Impulse)");
      }
      if (/"2010":/.test(mw) || /"2011":/.test(mw) || /"2012":/.test(mw)) {
        fail("Winnebago|Minnie Winnie must not list 2010–2012 (2010–12 Class C on wiring is Access)");
      }
      const rv0 = wgo.indexOf("    Revel: {");
      const rv1 = wgo.indexOf("    Travato: {");
      const rv = rv0 >= 0 && rv1 > rv0 ? wgo.slice(rv0, rv1) : "";
      const tr0 = wgo.indexOf("    Travato: {");
      const tr1 = wgo.indexOf("    Solis: {");
      const tr = tr0 >= 0 && tr1 > tr0 ? wgo.slice(tr0, tr1) : "";
      if (/"2010":/.test(rv) || /"2011":/.test(rv) || /"2012":/.test(rv)) {
        fail("Winnebago|Revel must not list 2010–2012 (first year-true card 2018)");
      }
      if (/"2010":/.test(tr) || /"2011":/.test(tr) || /"2012":/.test(tr)) {
        fail("Winnebago|Travato must not list 2010–2012 (first year-true card 2014)");
      }
      const era2011 = era.match(/"2011":/);
      if (era2011) {
        fail("Winnebago|Era must not list 2011 (not on 2011 wiring; no 2011 brochure)");
      }
      if (!/"2010": \["170R", "170X"\]/.test(era)) {
        fail("Winnebago|Era MY10 OEM plans missing (170R/170X)");
      }
      if (!/"2012": \["70X"\]/.test(era)) {
        fail("Winnebago|Era MY12 OEM plans missing (70X)");
      }
      if (/"2013":/.test(mm) || /"2014":/.test(mm)) {
        fail("Winnebago|Micro Minnie must not list 2013–2014 (archive starts 2015)");
      }
      if (!/yearStart:\s*2015/.test(mm)) {
        fail("Winnebago|Micro Minnie yearStart must be 2015 (no 2013–14 Micro card)");
      }
      if (/"2013":/.test(mn)) {
        fail("Winnebago|Minnie must not list 2013 (no extractable year-true 2013 card)");
      }
      if (!/"2014": \["1801FB", "2101DS", "2101FBS", "2201DS", "2351DKS", "2451BHS"\]/.test(mn)) {
        fail("Winnebago|Minnie MY14 OEM plans missing (1801FB/2101DS/2101FBS/2201DS/2351DKS/2451BHS)");
      }
      if (/"2014": .*"2201MB"/.test(mn) || /"2014": .*"2500FL"/.test(mn)) {
        fail("Winnebago|Minnie MY14 must not invent leftover 2201MB/2500FL");
      }
      if (/"2015": .*"34G"/.test(jy) || /"2016": .*"34G"/.test(jy)) {
        fail("Winnebago|Journey must not invent leftover 34G on 2015–16");
      }
      if (/"2015":/.test(hz) || /"2016":/.test(hz)) {
        fail("Winnebago|Horizon must not list 2015–2016 (first year-true card 2018)");
      }
      if (/"2015":/.test(intent) || /"2016":/.test(intent)) {
        fail("Winnebago|Intent must not list 2015–2016 (first year-true card 2018)");
      }
      if (/"2015":/.test(ss)) {
        fail("Winnebago|Sunstar must not list 2015 (2015 Sunstar is Itasca — do not collide)");
      }
      if (/"2015":/.test(vita) || /"2016":/.test(vita)) {
        fail("Winnebago|Vita must not list 2015–2016 (first year-true card 2019)");
      }
      if (/"2015":/.test(so) || /"2016":/.test(so)) {
        fail("Winnebago|Solis must not list 2015–2016 (first year-true card 2020)");
      }
      if (/"2015":/.test(ac) || /"2016":/.test(ac)) {
        fail("Winnebago|Access Super C must not list 2015–2016 (no OEM Super C card)");
      }
      if (/"2022":/.test(ol)) {
        fail("Winnebago|Outlook must not list 2022 (no OEM 2022 card)");
      }
      if (!/yearEnd:\s*2021/.test(ol)) {
        fail("Winnebago|Outlook yearEnd must be 2021 (no OEM 2022 card)");
      }
      const att0 = wgo.indexOf("    Access: {");
      const att1 = wgo.indexOf("    Thrive: {");
      const att = att0 >= 0 && att1 > att0 ? wgo.slice(att0, att1) : "";
      if (!/type: "Travel Trailer"/.test(att)) {
        fail("Winnebago|Access current line must stay a travel trailer (not Super C)");
      }
      if (/\n    "Grand Design": \{/.test(wgo) || /\n    Keystone: \{/.test(wgo)) {
        fail("Winnebago block must not absorb other-make keys");
      }
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
