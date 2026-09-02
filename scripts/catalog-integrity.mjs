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
  "Grand Design|Reflection Travel Trailer": {
    codes: ["303RLS", "311BHS", "320MKS", "337RLS"],
    reason: "FW codes belong on Reflection, not the travel-trailer twin",
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
  "Grand Design|Reflection Travel Trailer": "travel trailer",
  "Grand Design|Lineage Series E": "class c",
  "Grand Design|Lineage Series M": "class c",
  "Grand Design|Lineage Series F": "super c",
  "Grand Design|Lineage Series VT": "class b",
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
      const accTt0 = wgo.indexOf("    Access: {");
      const accTt1 = wgo.indexOf("    Thrive: {");
      const attTwin = accTt0 >= 0 && accTt1 > accTt0 ? wgo.slice(accTt0, accTt1) : "";
      if (/"2010":/.test(attTwin) || /"2011":/.test(attTwin) || /"2012":/.test(attTwin)) {
        fail("Winnebago|Access TT must not list 2010–2012 (wiring Access is Class C, not this travel-trailer key)");
      }
      if (/"24V"/.test(attTwin) || /"29T"/.test(attTwin) || /"31J"/.test(attTwin) || /"31N"/.test(attTwin) || /"26Q"/.test(attTwin) || /"31R"/.test(attTwin)) {
        fail("Winnebago|Access TT must not absorb 2010–12 Access Class C plans (24V/29T/31J/31N/26Q/31R)");
      }
      const sc0 = wgo.indexOf("    Suncruiser: {");
      const sc1 = wgo.indexOf("    ARKA: {");
      const sc = sc0 >= 0 && sc1 > sc0 ? wgo.slice(sc0, sc1) : "";
      if (/"2010":/.test(sc) || /"2011":/.test(sc) || /"2012":/.test(sc)) {
        fail("Winnebago|Suncruiser must not list 2010–2012 (historic Itasca Suncruiser is Class A, not this 2026 Class C key)");
      }
      if (/"32H"/.test(sc) || /"35P"/.test(sc) || /"37F"/.test(sc)) {
        fail("Winnebago|Suncruiser must not absorb historic Itasca Suncruiser Class A plans (32H/35P/37F)");
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

  // Grand Design recent OEM years (2020–2026 + Lineage as printed).
  // Quoted-make parser sees `"Grand Design": {`; next make is unquoted Fleetwood.
  {
    const g0 = src.indexOf('\n  "Grand Design": {');
    const g1 = src.indexOf("\n  Fleetwood: {");
    if (g0 < 0 || g1 < g0) {
      fail('Grand Design block not found between "Grand Design": and Fleetwood:');
    } else {
      const gd = src.slice(g0, g1);
      for (const required of [
        "Solitude",
        "Solitude S-Class",
        "Influence",
        "Reflection",
        "Reflection Travel Trailer",
        "Reflection 100 Series",
        "Reflection 150 Series",
        "Imagine",
        "Imagine XLS",
        "Imagine AIM",
        "Transcend",
        "Transcend One",
        "Transcend Xplor",
        "Momentum",
        "Momentum M-Class",
        "Momentum G-Class",
        "Momentum G-Class Fifth Wheel",
        "Momentum MAV",
        "Lineage Series E",
        "Lineage Series M",
        "Lineage Series F",
        "Lineage Series VT",
      ]) {
        const hit =
          gd.includes(`    ${required}: {`) ||
          gd.includes(`    "${required}": {`);
        if (!hit) fail(`Grand Design missing required series: ${required}`);
      }
      if (
        /\n    Serenova: \{/.test(gd) ||
        /\n    "Serenova": \{/.test(gd) ||
        /\n    Foundation: \{/.test(gd) ||
        /\n    "Foundation": \{/.test(gd) ||
        /\n    "Lineage Series VP": \{/.test(gd) ||
        /\n    "Transcend Lite": \{/.test(gd)
      ) {
        fail("Grand Design must not invent Serenova / Foundation / Lineage VP / Transcend Lite without extractable OEM codes (GAP this slice)");
      }
      if (/"2010":/.test(gd) || /"2011":/.test(gd) || /"2012":/.test(gd)) {
        fail("Grand Design must not list MY2010–2012 (founded 2012; first retail ~MY2013)");
      }

      const slice = (name, next) => {
        const a = gd.includes(`    "${name}": {`)
          ? gd.indexOf(`    "${name}": {`)
          : gd.indexOf(`    ${name}: {`);
        const b = gd.includes(`    "${next}": {`)
          ? gd.indexOf(`    "${next}": {`)
          : gd.indexOf(`    ${next}: {`);
        return a >= 0 && b > a ? gd.slice(a, b) : "";
      };

      const sc = slice("Solitude S-Class", "Influence");
      if (!/yearEnd:\s*2023/.test(sc)) {
        fail("Grand Design|Solitude S-Class yearEnd must be 2023 (RVUSA 2019–2023; no 2024–26 OEM card)");
      }
      if (!/"2020": \["2930RL", "3550BH", "3740BH", "3950BH"\]/.test(sc)) {
        fail("Grand Design|Solitude S-Class MY20 RVUSA plans missing (3550BH/3950BH; no leftover 3800FL)");
      }
      if (/"2020": .*"3800FL"/.test(sc) || /"2020": .*"3540GK"/.test(sc) || /"2020": .*"3330RE"/.test(sc) || /"2020": .*"3460FL"/.test(sc)) {
        fail("Grand Design|Solitude S-Class must not keep leftover 3800FL or stamp MY21 3540GK / MY22 3330RE / MY23 3460FL onto 2020");
      }
      if (!/"2021": \["2930RL", "3540GK", "3550BH", "3740BH", "3950BH"\]/.test(sc)) {
        fail("Grand Design|Solitude S-Class MY21 RVUSA plans missing (3540GK; no leftover 3800FL)");
      }
      if (/"2021": .*"3800FL"/.test(sc) || /"2021": .*"3330RE"/.test(sc) || /"2021": .*"3460FL"/.test(sc)) {
        fail("Grand Design|Solitude S-Class must not keep leftover 3800FL or stamp MY22 3330RE / MY23 3460FL onto 2021");
      }
      if (!/"2022": \["2930RL", "3330RE", "3540GK", "3550BH", "3740BH", "3950BH"\]/.test(sc)) {
        fail("Grand Design|Solitude S-Class MY22 RVUSA plans missing (3330RE; no leftover 3800FL)");
      }
      if (/"2022": .*"3800FL"/.test(sc) || /"2022": .*"3460FL"/.test(sc)) {
        fail("Grand Design|Solitude S-Class must not keep leftover 3800FL or stamp MY23 3460FL onto 2022");
      }
      if (!/"2023": \["2930RL", "3460FL", "3740BH", "3950BH"\]/.test(sc)) {
        fail("Grand Design|Solitude S-Class MY23 RVUSA plans missing (3460FL/3950BH; no leftover 3800FL)");
      }
      if (/"2023": .*"3800FL"/.test(sc)) {
        fail("Grand Design|Solitude S-Class must not keep leftover 3800FL on 2023");
      }
      if (/"2024":/.test(sc) || /"2025":/.test(sc) || /"2026":/.test(sc)) {
        fail("Grand Design|Solitude S-Class must not list 2024–2026");
      }

      const imag = slice("Imagine", "Imagine XLS");
      if (!/yearStart:\s*2016/.test(imag)) {
        fail("Grand Design|Imagine yearStart must be 2016 (RVUSA; do not invent 2014–2015)");
      }
      if (/"2014":/.test(imag) || /"2015":/.test(imag)) {
        fail("Grand Design|Imagine must not list 2014–2015");
      }
      if (!/"2020": \["2250RK", "2400BH", "2450RL", "2500RL", "2600RB", "2670MK", "2800BH", "2970RL", "3000QB", "3100RD", "3250BH"\]/.test(imag)) {
        fail("Grand Design|Imagine MY20 RVUSA plans missing (2250RK/2450RL/3000QB/3250BH; no leftover 2150RB)");
      }
      if (/"2020": .*"2150RB"/.test(imag) || /"2020": .*"2910BH"/.test(imag) || /"2020": .*"3210BH"/.test(imag) || /"2020": .*"2660BS"/.test(imag)) {
        fail("Grand Design|Imagine must not keep leftover 2150RB or stamp MY21 2910BH / MY23 3210BH / MY24 2660BS onto 2020");
      }
      if (!/"2021": \["2400BH", "2500RL", "2600RB", "2670MK", "2800BH", "2910BH", "2970RL", "3100RD", "3250BH"\]/.test(imag)) {
        fail("Grand Design|Imagine MY21 RVUSA plans missing (2910BH; no leftover 2150RB / 2250RK)");
      }
      if (/"2021": .*"2150RB"/.test(imag) || /"2021": .*"2250RK"/.test(imag) || /"2021": .*"3210BH"/.test(imag) || /"2021": .*"2660BS"/.test(imag)) {
        fail("Grand Design|Imagine must not keep leftover 2150RB/2250RK or stamp MY23 3210BH / MY24 2660BS onto 2021");
      }
      if (!/"2022": \["2400BH", "2500RL", "2600RB", "2670MK", "2800BH", "2910BH", "2970RL", "3100RD", "3250BH"\]/.test(imag)) {
        fail("Grand Design|Imagine MY22 RVUSA plans missing (3250BH; no 3210BH)");
      }
      if (/"2022": .*"3210BH"/.test(imag) || /"2022": .*"2660BS"/.test(imag) || /"2022": .*"2920BS"/.test(imag) || /"2022": .*"2300MK"/.test(imag)) {
        fail("Grand Design|Imagine must not stamp MY23 3210BH / MY24 2660BS/2920BS / MY25 2300MK onto 2022");
      }
      if (!/"2023": \["2400BH", "2500RL", "2600RB", "2670MK", "2800BH", "2910BH", "2970RL", "3100RD", "3210BH"\]/.test(imag)) {
        fail("Grand Design|Imagine MY23 RVUSA plans missing (2400BH/2910BH; no 2660BS/2920BS)");
      }
      if (/"2023": .*"2660BS"/.test(imag) || /"2023": .*"2920BS"/.test(imag) || /"2023": .*"2300MK"/.test(imag) || /"2023": .*"2700BS"/.test(imag)) {
        fail("Grand Design|Imagine must not stamp MY24 2660BS/2920BS or MY25 2300MK onto 2023");
      }
      if (!/"2024": \["2500RL", "2600RB", "2660BS", "2670MK", "2800BH", "2920BS", "2970RL", "3100RD", "3210BH"\]/.test(imag)) {
        fail("Grand Design|Imagine MY24 OEM plans missing (2500RL–3210BH; 2660BS/2920BS NEW)");
      }
      if (/"2024": .*"2300MK"/.test(imag) || /"2024": .*"2470BH"/.test(imag) || /"2024": .*"2700BS"/.test(imag)) {
        fail("Grand Design|Imagine must not stamp MY25 2300MK/2470BH or MY26 2700BS onto 2024");
      }
      if (!/"2025": \["2300MK", "2470BH", "2500RL", "2600RB", "2670MK", "2800BH", "2920BS", "2970RL", "3100RD", "3210BH"\]/.test(imag)) {
        fail("Grand Design|Imagine MY25 OEM plans missing");
      }
      if (!/"2026": \["2300MK", "2470BH", "2500RL", "2600RB", "2670MK", "2700BS", "2800BH", "2810BH", "2970RL", "3100RD", "3210BH"\]/.test(imag)) {
        fail("Grand Design|Imagine MY26 OEM plans missing");
      }
      if (/"2025": .*"2700BS"/.test(imag) || /"2025": .*"2810BH"/.test(imag)) {
        fail("Grand Design|Imagine must not stamp MY26 2700BS/2810BH onto 2025");
      }
      if (/"2026": .*"2920BS"/.test(imag) || /"2026": .*"3000RD"/.test(imag) || /"2026": .*"2150RB"/.test(imag)) {
        fail("Grand Design|Imagine MY26 must not keep leftover invent 2920BS/3000RD/2150RB");
      }

      const xls = slice("Imagine XLS", "Imagine AIM");
      if (!/yearStart:\s*2019/.test(xls)) {
        fail("Grand Design|Imagine XLS yearStart must be 2019 (RVUSA; do not invent 2015–2018)");
      }
      if (/"2015":/.test(xls) || /"2016":/.test(xls) || /"2017":/.test(xls) || /"2018":/.test(xls)) {
        fail("Grand Design|Imagine XLS must not list 2015–2018");
      }
      if (!/"2020": \["17MKE", "19BWE", "21BHE", "22MLE", "22RBE", "23BHE", "24MPR"\]/.test(xls)) {
        fail("Grand Design|Imagine XLS MY20 RVUSA plans missing (19BWE/24MPR)");
      }
      if (/"2020": .*"22BHE"/.test(xls) || /"2020": .*"24BSE"/.test(xls) || /"2020": .*"21MBE"/.test(xls)) {
        fail("Grand Design|Imagine XLS must not stamp MY24 22BHE/24BSE or MY26 21MBE onto 2020");
      }
      if (!/"2021": \["17MKE", "21BHE", "22MLE", "22RBE", "23BHE"\]/.test(xls)) {
        fail("Grand Design|Imagine XLS MY21 RVUSA plans missing (5 plans; no 19BWE/24MPR/23LDE)");
      }
      if (/"2021": .*"19BWE"/.test(xls) || /"2021": .*"23LDE"/.test(xls) || /"2021": .*"22BHE"/.test(xls) || /"2021": .*"25BHE"/.test(xls)) {
        fail("Grand Design|Imagine XLS must not keep 19BWE/24MPR or stamp MY22 23LDE / MY23 25BHE / MY24 22BHE onto 2021");
      }
      if (!/"2022": \["17MKE", "21BHE", "22MLE", "22RBE", "23BHE", "23LDE"\]/.test(xls)) {
        fail("Grand Design|Imagine XLS MY22 RVUSA plans missing (23LDE; no 25BHE)");
      }
      if (/"2022": .*"25BHE"/.test(xls) || /"2022": .*"22BHE"/.test(xls) || /"2022": .*"24BSE"/.test(xls) || /"2022": .*"21MBE"/.test(xls)) {
        fail("Grand Design|Imagine XLS must not stamp MY23 25BHE / MY24 22BHE/24BSE / MY26 21MBE onto 2022");
      }
      if (!/"2023": \["17MKE", "21BHE", "22MLE", "22RBE", "23BHE", "23LDE", "25BHE"\]/.test(xls)) {
        fail("Grand Design|Imagine XLS MY23 RVUSA plans missing (23BHE/25BHE; no 22BHE/24BSE)");
      }
      if (/"2023": .*"22BHE"/.test(xls) || /"2023": .*"24BSE"/.test(xls) || /"2023": .*"25DBE"/.test(xls) || /"2023": .*"21MBE"/.test(xls)) {
        fail("Grand Design|Imagine XLS must not stamp MY24 22BHE/24BSE/25DBE or MY26 21MBE onto 2023");
      }
      if (!/"2024": \["17MKE", "21BHE", "22BHE", "22MLE", "22RBE", "23LDE", "24BSE", "25DBE"\]/.test(xls)) {
        fail("Grand Design|Imagine XLS MY24 OEM plans missing");
      }
      if (/"2024": .*"24SDE"/.test(xls) || /"2024": .*"21MBE"/.test(xls) || /"2024": .*"25RLE"/.test(xls)) {
        fail("Grand Design|Imagine XLS must not invent 24SDE or stamp MY26 21MBE/25RLE onto 2024");
      }
      if (!/"2026": \["17MKE", "21MBE", "22BHE", "22MLE", "22RBE", "23LDE", "25DBE", "25RLE"\]/.test(xls)) {
        fail("Grand Design|Imagine XLS MY26 OEM plans missing");
      }
      if (/"2025": .*"21MBE"/.test(xls) || /"2025": .*"25RLE"/.test(xls)) {
        fail("Grand Design|Imagine XLS must not stamp MY26 21MBE/25RLE onto 2025");
      }
      if (/"2026": .*"25RKE"/.test(xls) || /"2026": .*"21BHE"/.test(xls) || /"2026": .*"24BSE"/.test(xls)) {
        fail("Grand Design|Imagine XLS MY26 must not keep leftover 25RKE / MY25-only 21BHE/24BSE");
      }

      const aim = slice("Imagine AIM", "Transcend");
      if (!/yearStart:\s*2023/.test(aim)) {
        fail("Grand Design|Imagine AIM yearStart must be 2023 (RVUSA; first locked card MY24)");
      }
      if (/"2020":/.test(aim) || /"2021":/.test(aim) || /"2022":/.test(aim)) {
        fail("Grand Design|Imagine AIM must omit 2020–2022 (line starts ~2023; do not invent)");
      }
      if (/"2023":/.test(aim)) {
        fail("Grand Design|Imagine AIM must omit 2023 fby (first locked card is MY2024; do not invent or copy MY24–26 AIM codes back)");
      }
      if (!/"2024": \["14MS", "15BH", "15RB", "16BL", "16ML", "18BH"\]/.test(aim)) {
        fail("Grand Design|Imagine AIM MY24 OEM plans missing (15BH/18BH on 2024 card)");
      }
      if (/"2025": .*"15BH"/.test(aim) || /"2025": .*"18BH"/.test(aim)) {
        fail("Grand Design|Imagine AIM must not copy 2024-only 15BH/18BH onto 2025");
      }
      if (!/"2025": \["14MS", "15RB", "16BL", "16ML"\]/.test(aim)) {
        fail("Grand Design|Imagine AIM MY25 OEM plans missing");
      }
      if (!/"2026": \["15RBA", "16MLA", "19MLA", "20BHA"\]/.test(aim)) {
        fail("Grand Design|Imagine AIM MY26 OEM plans missing");
      }
      if (/"2025": .*"15RBA"/.test(aim) || /"2025": .*"19MLA"/.test(aim) || /"2026": .*"14MS"/.test(aim)) {
        fail("Grand Design|Imagine AIM must not copy 2026 codes onto 2025 or 2025 codes onto 2026");
      }

      const r150 = slice("Reflection 150 Series", "Imagine");
      if (!/yearStart:\s*2018/.test(r150)) {
        fail("Grand Design|Reflection 150 Series yearStart must be 2018 (RVUSA; do not invent 2015–2017)");
      }
      if (/"2015":/.test(r150) || /"2016":/.test(r150) || /"2017":/.test(r150)) {
        fail("Grand Design|Reflection 150 Series must not list 2015–2017");
      }
      if (!/"2020": \["240RL", "260RD", "268BH", "290BH", "295RL"\]/.test(r150)) {
        fail("Grand Design|Reflection 150 Series MY20 RVUSA plans missing (240RL/268BH/290BH; no leftover prefixes)");
      }
      if (/"2020": .*"150 Series"/.test(r150) || /"2020": .*"226RK"/.test(r150) || /"2020": .*"250ML"/.test(r150)) {
        fail("Grand Design|Reflection 150 must not keep leftover prefixes or stamp MY22 226RK / MY26 250ML onto 2020");
      }
      if (!/"2021": \["260RD", "268BH", "278BH", "280RS", "295RL"\]/.test(r150)) {
        fail("Grand Design|Reflection 150 Series MY21 RVUSA plans missing");
      }
      if (/"2021": .*"150 Series"/.test(r150) || /"2021": .*"226RK"/.test(r150) || /"2021": .*"240RL"/.test(r150) || /"2021": .*"250ML"/.test(r150)) {
        fail("Grand Design|Reflection 150 must not keep leftover prefixes or stamp MY20 240RL / MY22 226RK / MY26 250ML onto 2021");
      }
      if (!/"2022": \["226RK", "260RD", "268BH", "278BH", "280RS", "295RL"\]/.test(r150)) {
        fail("Grand Design|Reflection 150 Series MY22 RVUSA plans missing (226RK; no 270BN/298BH)");
      }
      if (/"2022": .*"150 Series"/.test(r150) || /"2022": .*"270BN"/.test(r150) || /"2022": .*"298BH"/.test(r150) || /"2022": .*"250ML"/.test(r150)) {
        fail("Grand Design|Reflection 150 must not keep leftover prefixes or stamp MY23 270BN/298BH / MY26 250ML onto 2022");
      }
      if (!/"2023": \["226RK", "260RD", "270BN", "278BH", "280RS", "295RL", "298BH"\]/.test(r150)) {
        fail("Grand Design|Reflection 150 Series MY23 RVUSA plans missing");
      }
      if (/"2023": .*"150 Series"/.test(r150) || /"2023": .*"250ML"/.test(r150) || /"2023": .*"280RL"/.test(r150)) {
        fail("Grand Design|Reflection 150 must not keep leftover prefixes or stamp MY26 250ML/280RL onto 2023");
      }
      if (!/"2024": \["260RD", "270BN", "295RL", "298BH"\]/.test(r150)) {
        fail("Grand Design|Reflection 150 Series MY24 OEM plans missing");
      }
      if (/"2024": .*"150 Series"/.test(r150) || /"2024": .*"250ML"/.test(r150) || /"2024": .*"280RL"/.test(r150)) {
        fail("Grand Design|Reflection 150 must not keep leftover prefixes or stamp MY26 250ML/280RL onto 2024");
      }
      if (!/"2026": \["250ML", "260RD", "270BN", "280RL", "298BH"\]/.test(r150)) {
        fail("Grand Design|Reflection 150 Series MY26 OEM plans missing");
      }
      if (/"2025": .*"250ML"/.test(r150) || /"2025": .*"280RL"/.test(r150) || /"2026": .*"295RL"/.test(r150)) {
        fail("Grand Design|Reflection 150 must not copy MY26 250ML/280RL onto 2025 or keep MY25 295RL on 2026");
      }
      if (/"2026": .*"320MKS"/.test(r150)) {
        fail("Grand Design|Reflection 150 must not absorb Reflection FW 320MKS");
      }

      const rfw = slice("Reflection", "Reflection Travel Trailer");
      if (!/"2020": \["28BH", "29RS", "303RLS", "311BHS", "31MB", "320MKS", "337RLS", "367BHS"\]/.test(rfw)) {
        fail("Grand Design|Reflection FW MY20 RVUSA plans missing (29RS/31MB; no *TS)");
      }
      if (/"2020": .*"315RLTS"/.test(rfw) || /"2020": .*"312BHTS"/.test(rfw) || /"2020": .*"340RDS"/.test(rfw) || /"2020": .*"362TBS"/.test(rfw)) {
        fail("Grand Design|Reflection FW must not stamp TT *TS, MY21 340RDS, or MY24 362TBS onto 2020");
      }
      if (!/"2021": \["28BH", "303RLS", "311BHS", "31MB", "320MKS", "337RLS", "340RDS", "367BHS"\]/.test(rfw)) {
        fail("Grand Design|Reflection FW MY21 RVUSA plans missing (340RDS; no 29RS)");
      }
      if (/"2021": .*"29RS"/.test(rfw) || /"2021": .*"315RLTS"/.test(rfw) || /"2021": .*"341RDS"/.test(rfw) || /"2021": .*"362TBS"/.test(rfw)) {
        fail("Grand Design|Reflection FW must not keep 29RS or stamp TT *TS / MY22 341RDS / MY24 362TBS onto 2021");
      }
      if (!/"2022": \["28BH", "303RLS", "311BHS", "31MB", "320MKS", "337RLS", "341RDS", "367BHS"\]/.test(rfw)) {
        fail("Grand Design|Reflection FW MY22 RVUSA plans missing (341RDS; no 324MBS/370FLS)");
      }
      if (/"2022": .*"315RLTS"/.test(rfw) || /"2022": .*"324MBS"/.test(rfw) || /"2022": .*"370FLS"/.test(rfw) || /"2022": .*"362TBS"/.test(rfw)) {
        fail("Grand Design|Reflection FW must not stamp TT *TS, MY23 324MBS/370FLS, or MY24 362TBS onto 2022");
      }
      if (!/"2023": \["303RLS", "311BHS", "320MKS", "324MBS", "337RLS", "341RDS", "367BHS", "370FLS"\]/.test(rfw)) {
        fail("Grand Design|Reflection FW MY23 RVUSA plans missing (341RDS/370FLS; no 362TBS)");
      }
      if (/"2023": .*"362TBS"/.test(rfw) || /"2023": .*"360FLS"/.test(rfw) || /"2023": .*"315RLTS"/.test(rfw) || /"2023": .*"296RDTS"/.test(rfw)) {
        fail("Grand Design|Reflection FW must not stamp MY24 362TBS, MY25 360FLS, or TT *TS onto 2023");
      }
      if (!/"2024": \["303RLS", "311BHS", "320MKS", "324MBS", "337RLS", "362TBS", "367BHS"\]/.test(rfw)) {
        fail("Grand Design|Reflection FW MY24 OEM plans missing (362TBS NEW; no 360FLS)");
      }
      if (/"2024": .*"360FLS"/.test(rfw) || /"2024": .*"315RLTS"/.test(rfw) || /"2024": .*"28BH"/.test(rfw)) {
        fail("Grand Design|Reflection FW must not stamp MY25 360FLS, TT codes, or leftover 28BH onto 2024");
      }
      if (!/"2026": \["303RLS", "311BHS", "320MKS", "324MBS", "337RLS", "360FLS", "362TBS", "367BHS"\]/.test(rfw)) {
        fail("Grand Design|Reflection FW MY26 OEM plans missing");
      }
      if (/"2026": .*"315RLTS"/.test(rfw) || /"2026": .*"317RSTS"/.test(rfw) || /"2025": .*"315RLTS"/.test(rfw)) {
        fail("Grand Design|Reflection FW must not absorb Reflection TT codes");
      }
      if (/"2026": .*"311BH"/.test(rfw) && !/"2026": .*"311BHS"/.test(rfw)) {
        fail("Grand Design|Reflection FW MY26 must use 311BHS (not leftover 311BH)");
      }

      const rtt = slice("Reflection Travel Trailer", "Reflection 100 Series");
      if (!/type: "Travel Trailer"/.test(rtt)) {
        fail("Grand Design|Reflection Travel Trailer must stay Travel Trailer (not FW)");
      }
      if (!/yearStart:\s*2024/.test(rtt)) {
        fail("Grand Design|Reflection Travel Trailer yearStart must be 2024 (OEM 2024 Reflection TT page)");
      }
      if (/"2020":/.test(rtt) || /"2021":/.test(rtt) || /"2022":/.test(rtt) || /"2023":/.test(rtt)) {
        fail("Grand Design|Reflection Travel Trailer must omit 2020–2023 (tight slice; yearStart 2024 — do not invent TT from mixed Reflection family cards)");
      }
      if (!/"2024": \["296RDTS", "297RSTS", "310MKTS", "312BHTS", "315RLTS"\]/.test(rtt)) {
        fail("Grand Design|Reflection Travel Trailer MY24 OEM plans missing");
      }
      if (/"2024": .*"322FKTS"/.test(rtt) || /"2024": .*"345RLTS"/.test(rtt) || /"2024": .*"317RSTS"/.test(rtt)) {
        fail("Grand Design|Reflection TT must not stamp MY25 322FKTS/345RLTS or MY26 317RSTS onto 2024");
      }
      if (!/"2026": \["317RSTS", "322FKTS", "342BHTS", "345RLTS"\]/.test(rtt)) {
        fail("Grand Design|Reflection Travel Trailer MY26 OEM plans missing");
      }
      if (/"2025": .*"317RSTS"/.test(rtt) || /"2025": .*"342BHTS"/.test(rtt)) {
        fail("Grand Design|Reflection TT must not stamp MY26 317RSTS/342BHTS onto 2025");
      }

      const r100 = slice("Reflection 100 Series", "Reflection 150 Series");
      if (/"2020":/.test(r100) || /"2021":/.test(r100) || /"2022":/.test(r100) || /"2023":/.test(r100)) {
        fail("Grand Design|Reflection 100 Series must omit 2020–2023 (first card MY2024)");
      }
      if (!/"2024": \["22RK", "27BH", "28RL"\]/.test(r100)) {
        fail("Grand Design|Reflection 100 Series MY24 OEM plans missing (22RK/27BH/28RL NEW)");
      }
      if (/"2024": .*"24RL"/.test(r100) || /"2024": .*"29RL"/.test(r100) || /"2024": .*"32BH"/.test(r100)) {
        fail("Grand Design|Reflection 100 must not stamp MY25 24RL or MY26 29RL/32BH onto 2024");
      }
      if (!/"2026": \["22RK", "24RL", "27BH", "29RL", "32BH"\]/.test(r100)) {
        fail("Grand Design|Reflection 100 Series MY26 OEM plans missing");
      }
      if (/"2025": .*"29RL"/.test(r100) || /"2025": .*"32BH"/.test(r100) || /"2026": .*"28RL"/.test(r100)) {
        fail("Grand Design|Reflection 100 must not copy 29RL/32BH onto 2025 or keep 28RL on 2026");
      }

      const inf = slice("Influence", "Reflection");
      if (/"2020":/.test(inf) || /"2021":/.test(inf) || /"2022":/.test(inf) || /"2023":/.test(inf)) {
        fail("Grand Design|Influence must omit 2020–2023 (first card MY2024)");
      }
      if (!/"2024": \["2903RL", "3503GK", "3704BH"\]/.test(inf)) {
        fail("Grand Design|Influence MY24 OEM plans missing (2903RL/3503GK/3704BH)");
      }
      if (/"2024": .*"3203GK"/.test(inf) || /"2024": .*"3804DS"/.test(inf) || /"2024": .*"3003RL"/.test(inf) || /"2024": .*"3904BH"/.test(inf) || /"2024": .*"3803GK"/.test(inf)) {
        fail("Grand Design|Influence must not invent 3803GK or stamp MY25 3203GK/3804DS / MY26 3003RL/3904BH onto 2024");
      }
      if (!/"2025": \["2903RL", "3203GK", "3503GK", "3704BH", "3804DS"\]/.test(inf)) {
        fail("Grand Design|Influence MY25 OEM plans missing (3704BH is 2025-only)");
      }
      if (!/"2026": \["2903RL", "3003RL", "3203GK", "3503GK", "3804DS", "3904BH"\]/.test(inf)) {
        fail("Grand Design|Influence MY26 OEM plans missing");
      }
      if (/"2025": .*"3003RL"/.test(inf) || /"2025": .*"3904BH"/.test(inf) || /"2026": .*"3704BH"/.test(inf)) {
        fail("Grand Design|Influence must not copy 2026 3003RL/3904BH onto 2025 or keep 3704BH on 2026");
      }

      const sol = slice("Solitude", "Solitude S-Class");
      if (!/"2020": \["310GK", "344GK", "372WB", "373FB", "375RES", "377MBS", "380FL", "382WB", "385GK", "390RK"\]/.test(sol)) {
        fail("Grand Design|Solitude MY20 RVUSA plans missing (344GK/385GK; drop -R twins)");
      }
      if (/"2020": .*"345GK"/.test(sol) || /"2020": .*"280RK"/.test(sol) || /"2020": .*"370DV"/.test(sol) || /"2020": .*"414LJMJ"/.test(sol)) {
        fail("Grand Design|Solitude must not stamp MY21 345GK / MY22 280RK / MY24 370DV / MY26 414LJMJ onto 2020");
      }
      if (!/"2021": \["310GK", "345GK", "372WB", "373FB", "375RES", "378MBS", "380FL", "382WB", "390RK"\]/.test(sol)) {
        fail("Grand Design|Solitude MY21 RVUSA plans missing (345GK/378MBS; no 344GK/385GK)");
      }
      if (/"2021": .*"344GK"/.test(sol) || /"2021": .*"280RK"/.test(sol) || /"2021": .*"370DV"/.test(sol) || /"2021": .*"388MBS"/.test(sol)) {
        fail("Grand Design|Solitude must not keep 344GK/385GK or stamp MY22 280RK / MY24 370DV / MY25 388MBS onto 2021");
      }
      if (!/"2022": \["280RK", "310GK", "345GK", "346FLS", "372WB", "373FB", "375RES", "378MBS", "380FL", "382WB", "390RK"\]/.test(sol)) {
        fail("Grand Design|Solitude MY22 RVUSA plans missing (280RK/346FLS)");
      }
      if (/"2022": .*"370DV"/.test(sol) || /"2022": .*"388MBS"/.test(sol) || /"2022": .*"417KB"/.test(sol) || /"2022": .*"414LJMJ"/.test(sol)) {
        fail("Grand Design|Solitude must not stamp MY24 370DV/417KB / MY25 388MBS / MY26 414LJMJ onto 2022");
      }
      if (!/"2023": \["310GK", "345GK", "373FB", "376RD", "378MBS", "380FL", "382WB", "390RK", "391DL"\]/.test(sol)) {
        fail("Grand Design|Solitude MY23 RVUSA plans missing (345GK/373FB; no 375RES/370DV)");
      }
      if (/"2023": .*"375RES"/.test(sol) || /"2023": .*"370DV"/.test(sol) || /"2023": .*"388MBS"/.test(sol) || /"2023": .*"417KB"/.test(sol) || /"2023": .*"414LJMJ"/.test(sol)) {
        fail("Grand Design|Solitude must not keep leftover 375RES or stamp MY24 370DV/417KB / MY25 388MBS / MY26 414LJMJ onto 2023");
      }
      if (!/"2024": \["310GK", "370DV", "376RD", "378MBS", "380FL", "382WB", "390RK", "391DL", "417KB"\]/.test(sol)) {
        fail("Grand Design|Solitude MY24 OEM plans missing");
      }
      if (/"2024": .*"375RES"/.test(sol) || /"2024": .*"388MBS"/.test(sol) || /"2024": .*"414LJMJ"/.test(sol)) {
        fail("Grand Design|Solitude must not keep leftover 375RES or stamp MY25 388MBS / MY26 414LJMJ onto 2024");
      }
      if (!/"2026": \["310GK", "370DV", "376RD", "380FL", "382WB", "388MBS", "390RK", "391DL", "414LJMJ", "417KB"\]/.test(sol)) {
        fail("Grand Design|Solitude MY26 OEM plans missing");
      }
      if (/"2025": .*"414LJMJ"/.test(sol) || /"2026": .*"375RES"/.test(sol)) {
        fail("Grand Design|Solitude must not stamp 414LJMJ onto 2025 or keep leftover 375RES on 2026");
      }

      const t1 = slice("Transcend One", "Transcend Xplor");
      if (/"2024":/.test(t1)) {
        fail("Grand Design|Transcend One yearStart 2025 — omit 2024 (no OEM 2024 One card)");
      }
      if (!/"2026": \["131DL", "151BH", "151RB", "161BH", "161DB"\]/.test(t1)) {
        fail("Grand Design|Transcend One MY26 OEM plans missing");
      }
      if (/"2025": .*"131DL"/.test(t1) || /"2025": .*"161DB"/.test(t1) || /"2026": .*"171RB"/.test(t1)) {
        fail("Grand Design|Transcend One must not copy 131DL/161DB onto 2025 or keep 171RB on 2026");
      }

      const tx = slice("Transcend Xplor", "Momentum");
      if (!/"2020": \["187MK", "221RB", "245RL", "247BH", "260RB", "261BH", "265BH"\]/.test(tx)) {
        fail("Grand Design|Transcend Xplor MY20 RVUSA plans missing (187MK/221RB; no *X)");
      }
      if (/"2020": .*"20MKX"/.test(tx) || /"2020": .*"200MK"/.test(tx) || /"2020": .*"231RK"/.test(tx) || /"2020": .*"235BH"/.test(tx)) {
        fail("Grand Design|Transcend Xplor must not stamp MY25 *X, MY21 200MK, MY22 231RK, or MY24 235BH onto 2020");
      }
      if (!/"2021": \["200MK", "221RB", "240ML", "245RL", "247BH", "260RB", "261BH", "265BH"\]/.test(tx)) {
        fail("Grand Design|Transcend Xplor MY21 RVUSA plans missing (200MK/240ML; no leftover 187MK)");
      }
      if (/"2021": .*"187MK"/.test(tx) || /"2021": .*"20MKX"/.test(tx) || /"2021": .*"231RK"/.test(tx) || /"2021": .*"235BH"/.test(tx)) {
        fail("Grand Design|Transcend Xplor must not keep leftover 187MK or stamp MY25 *X / MY22 231RK / MY24 235BH onto 2021");
      }
      if (!/"2022": \["200MK", "221RB", "231RK", "240ML", "245RL", "247BH", "251BH", "260RB", "261BH", "265BH", "297QB", "321BH"\]/.test(tx)) {
        fail("Grand Design|Transcend Xplor MY22 RVUSA plans missing (231RK/251BH/297QB/321BH; no *X)");
      }
      if (/"2022": .*"20MKX"/.test(tx) || /"2022": .*"187MK"/.test(tx) || /"2022": .*"235BH"/.test(tx) || /"2022": .*"331BH"/.test(tx)) {
        fail("Grand Design|Transcend Xplor must not keep leftover 187MK or stamp MY25 *X / MY24 235BH/331BH onto 2022");
      }
      if (/"2023":/.test(tx)) {
        fail("Grand Design|Transcend Xplor must omit 2023 fby (first locked card is MY2024 numeric; do not invent a 15-plan list)");
      }
      if (!/"2024": \["200MK", "221RB", "235BH", "240ML", "245RL", "247BH", "251BH", "260RB", "261BH", "265BH", "297QB", "315BH", "321BH", "331BH"\]/.test(tx)) {
        fail("Grand Design|Transcend Xplor MY24 OEM plans missing (numeric 200MK–331BH)");
      }
      if (/"2024": .*"20MKX"/.test(tx) || /"2024": .*"245RLT"/.test(tx) || /"2024": .*"19BHX"/.test(tx)) {
        fail("Grand Design|Transcend Xplor must not stamp MY25 *X / premium T-suffix codes onto 2024");
      }
      if (!/"2026": \["19BHX", "20MKX", "21RLX", "22RBX", "23BHX", "24BHX", "25MLX", "26BHX", "26RBX", "27DBX"\]/.test(tx)) {
        fail("Grand Design|Transcend Xplor MY26 OEM plans missing");
      }
      if (/"2025": .*"19BHX"/.test(tx) || /"2025": .*"21RLX"/.test(tx)) {
        fail("Grand Design|Transcend Xplor must not stamp MY26 19BHX/21RLX onto 2025");
      }

      const tr = slice("Transcend", "Transcend One");
      if (!/"2020": \["27BHS", "28MKS", "29TBS", "30RBS", "31RLK", "32BHS"\]/.test(tr)) {
        fail("Grand Design|Transcend premium MY20 RVUSA plans missing (27BHS/28MKS/29TBS; no leftover Xplor 245RL/265BH)");
      }
      if (/"2020": .*"245RL"/.test(tr) || /"2020": .*"265BH"/.test(tr) || /"2020": .*"297QB"/.test(tr) || /"2020": .*"247BH"/.test(tr)) {
        fail("Grand Design|Transcend premium MY2020 must not list leftover Xplor 245RL/265BH/297QB/247BH");
      }
      if (!/"2021": \["30RBS", "31RLK", "32BHS"\]/.test(tr)) {
        fail("Grand Design|Transcend premium MY21 RVUSA plans missing (30RBS/31RLK/32BHS; no leftover 27BHS)");
      }
      if (/"2021": .*"27BHS"/.test(tr) || /"2021": .*"28MKS"/.test(tr) || /"2021": .*"245RL"/.test(tr) || /"2021": .*"265BH"/.test(tr)) {
        fail("Grand Design|Transcend premium MY2021 must not list dropped 27BHS/28MKS or leftover Xplor 245RL/265BH");
      }
      if (/"2022":/.test(tr) || /"2023":/.test(tr) || /"2024":/.test(tr)) {
        fail("Grand Design|Transcend premium must omit 2022–2024 (mid-gap; 2024 brochure is the Xplor card; T-suffix line starts MY25)");
      }
      if (!/"2026": \["245RLT", "265BHT", "285RKT", "295QBT", "305BHT", "315RKT", "325BHT", "335BHT"\]/.test(tr)) {
        fail("Grand Design|Transcend MY26 OEM plans missing");
      }
      if (/"2026": .*"20MK"/.test(tr) || /"2026": .*"21RL"/.test(tr) || /"2026": .*"25ML"/.test(tr)) {
        fail("Grand Design|Transcend must not invent 20MK/21RL/25ML (those are Xplor 20MKX/21RLX/25MLX)");
      }

      const mav = slice("Momentum MAV", "Lineage Series E");
      if (!/yearStart:\s*2024/.test(mav)) {
        fail("Grand Design|Momentum MAV yearStart must be 2024 (RVUSA; do not invent 2022–2023)");
      }
      if (/"2022":/.test(mav) || /"2023":/.test(mav)) {
        fail("Grand Design|Momentum MAV must not list 2022–2023");
      }
      if (!/"2024": \["22MAV", "27MAV"\]/.test(mav)) {
        fail("Grand Design|Momentum MAV MY24 OEM plans missing (22MAV / 27MAV)");
      }
      if (/"2024": .*"24MAV"/.test(mav) || /"2024": .*"17MAV"/.test(mav) || /"2024": .*"28MAV"/.test(mav)) {
        fail("Grand Design|Momentum MAV must not stamp MY25 24MAV or MY26 17MAV/28MAV onto 2024");
      }
      if (!/"2026": \["17MAV", "22MAV", "24MAV", "27MAV", "28MAV"\]/.test(mav)) {
        fail("Grand Design|Momentum MAV MY26 OEM plans missing");
      }
      if (/"2025": .*"17MAV"/.test(mav) || /"2025": .*"28MAV"/.test(mav)) {
        fail("Grand Design|Momentum MAV must not stamp MY26 17MAV/28MAV onto 2025");
      }

      const mom = slice("Momentum", "Momentum M-Class");
      if (!/"2020": \["376THS", "397TH", "399TH"\]/.test(mom)) {
        fail("Grand Design|Momentum MY20 RVUSA flagship plans missing (376THS/397TH/399TH; no 397THS)");
      }
      if (/"2020": .*"397THS"/.test(mom) || /"2020": .*"349M"/.test(mom) || /"2020": .*"395M"/.test(mom) || /"2020": .*"410TH"/.test(mom)) {
        fail("Grand Design|Momentum flagship 2020 must not list later 397THS, leftover M-Class 349M/395M, or MY23 410TH");
      }
      if (!/"2021": \["376THS", "397THS", "399TH"\]/.test(mom)) {
        fail("Grand Design|Momentum MY21 RVUSA flagship plans missing (397THS replaces 397TH)");
      }
      if (/"2021": .*"397TH"/.test(mom) || /"2021": .*"351MS"/.test(mom) || /"2021": .*"349M"/.test(mom) || /"2021": .*"410TH"/.test(mom)) {
        fail("Grand Design|Momentum flagship 2021 must not keep leftover 397TH, absorb M-Class 351MS/349M, or stamp MY23 410TH");
      }
      if (!/"2022": \["376THS", "397THS", "399TH"\]/.test(mom)) {
        fail("Grand Design|Momentum MY22 RVUSA flagship plans missing (376THS/397THS/399TH; no 410TH)");
      }
      if (/"2022": .*"397TH"/.test(mom) || /"2022": .*"395M"/.test(mom) || /"2022": .*"351MS"/.test(mom) || /"2022": .*"410TH"/.test(mom)) {
        fail("Grand Design|Momentum flagship 2022 must not keep leftover 397TH, absorb M-Class 395M/351MS, or stamp MY23 410TH");
      }
      if (!/"2023": \["376THS", "397THS", "399TH", "410TH"\]/.test(mom)) {
        fail("Grand Design|Momentum MY23 RVUSA flagship plans missing (376THS/397THS/399TH/410TH)");
      }
      if (/"2023": .*"395M"/.test(mom) || /"2023": .*"351MS"/.test(mom) || /"2023": .*"336M"/.test(mom) || /"2023": .*"414M"/.test(mom)) {
        fail("Grand Design|Momentum flagship 2023 must not absorb M-Class 336M/351MS/395M/414M");
      }
      if (!/"2024": \["397THS", "399TH", "410TH"\]/.test(mom)) {
        fail("Grand Design|Momentum MY24 OEM flagship plans missing (397THS/399TH/410TH)");
      }
      if (/"2024": .*"395MS"/.test(mom) || /"2024": .*"414M"/.test(mom) || /"2024": .*"395M"/.test(mom)) {
        fail("Grand Design|Momentum flagship 2024 must not absorb M-Class 395MS/414M or leftover 395M");
      }
      if (!/"2026": \["395MT", "396DB", "399M"\]/.test(mom)) {
        fail("Grand Design|Momentum MY26 OEM flagship plans missing (395MT/396DB/399M)");
      }
      if (/"2026": .*"349G"/.test(mom) || /"2026": .*"381MS"/.test(mom) || /"2026": .*"344M"/.test(mom)) {
        fail("Grand Design|Momentum flagship must not absorb M-Class 344M/381MS or leftover 349G");
      }

      const mm = slice("Momentum M-Class", "Momentum G-Class");
      if (!/"2020": \["349M", "351M", "381M", "395M", "398M"\]/.test(mm)) {
        fail("Grand Design|Momentum M-Class MY20 RVUSA plans missing (351M/381M/395M; no leftover 328M)");
      }
      if (/"2020": .*"328M"/.test(mm) || /"2020": .*"351MS"/.test(mm) || /"2020": .*"336M"/.test(mm) || /"2020": .*"376THS"/.test(mm)) {
        fail("Grand Design|Momentum M-Class must not keep leftover 328M or stamp MY21 351MS / MY23 336M / flagship 376THS onto 2020");
      }
      if (!/"2021": \["349M", "351MS", "381MS", "395MS", "398M"\]/.test(mm)) {
        fail("Grand Design|Momentum M-Class MY21 RVUSA plans missing (351MS/381MS/395MS)");
      }
      if (/"2021": .*"328M"/.test(mm) || /"2021": .*"351M"/.test(mm) || /"2021": .*"336M"/.test(mm) || /"2021": .*"376THS"/.test(mm)) {
        fail("Grand Design|Momentum M-Class must not keep leftover 328M/351M or stamp MY23 336M / flagship 376THS onto 2021");
      }
      if (!/"2022": \["349M", "351MS", "381MS", "395MS", "398M"\]/.test(mm)) {
        fail("Grand Design|Momentum M-Class MY22 RVUSA plans missing (same five as MY21; no 336M)");
      }
      if (/"2022": .*"328M"/.test(mm) || /"2022": .*"336M"/.test(mm) || /"2022": .*"351M"/.test(mm) || /"2022": .*"376THS"/.test(mm)) {
        fail("Grand Design|Momentum M-Class must not keep leftover 328M/351M or stamp MY23 336M / flagship 376THS onto 2022");
      }
      if (!/"2023": \["336M", "349M", "351MS", "381MS", "395MS", "398M"\]/.test(mm)) {
        fail("Grand Design|Momentum M-Class MY23 RVUSA plans missing (336M; no 414M)");
      }
      if (/"2023": .*"414M"/.test(mm) || /"2023": .*"344M"/.test(mm) || /"2023": .*"392M"/.test(mm) || /"2023": .*"376THS"/.test(mm)) {
        fail("Grand Design|Momentum M-Class must not stamp MY24 414M / MY25 344M/392M or absorb flagship 376THS onto 2023");
      }
      if (!/"2024": \["349M", "351MS", "381MS", "395MS", "398M", "414M"\]/.test(mm)) {
        fail("Grand Design|Momentum M-Class MY24 OEM plans missing (395MS/414M print on the 2024 M-Class card)");
      }
      if (/"2024": .*"344M"/.test(mm) || /"2024": .*"392M"/.test(mm) || /"2024": .*"21M"/.test(mm)) {
        fail("Grand Design|Momentum M-Class must not stamp MY25 344M/392M or leftover 21M onto 2024");
      }
      if (!/"2026": \["344M", "351MS", "381MS", "392M"\]/.test(mm)) {
        fail("Grand Design|Momentum M-Class MY26 OEM plans missing");
      }
      if (/"2026": .*"21M"/.test(mm) || /"2026": .*"25M"/.test(mm)) {
        fail("Grand Design|Momentum M-Class must not invent leftover 21M/25M");
      }

      const gtt = slice("Momentum G-Class", "Momentum G-Class Fifth Wheel");
      if (!/"2020": \["21G", "25G", "28G", "29G"\]/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT MY20 RVUSA plans missing (21G/25G/28G/29G; no 23G)");
      }
      if (/"2020": .*"23G"/.test(gtt) || /"2020": .*"30G"/.test(gtt) || /"2020": .*"32G"/.test(gtt) || /"2020": .*"320G"/.test(gtt) || /"2020": .*"29G0"/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT must not stamp later 23G/30G/32G, absorb FW 320G, or invent OCR 29G0 onto 2020");
      }
      if (!/"2021": \["21G", "23G", "25G", "28G", "29G", "30G", "31G"\]/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT MY21 RVUSA plans missing (23G/30G/31G; no 32G)");
      }
      if (/"2021": .*"32G"/.test(gtt) || /"2021": .*"320G"/.test(gtt) || /"2021": .*"29G0"/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT must not stamp MY23 32G, absorb FW 320G, or invent OCR 29G0 onto 2021");
      }
      if (!/"2022": \["21G", "23G", "25G", "28G", "29G", "30G", "31G"\]/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT MY22 RVUSA plans missing (same seven as MY21; no 32G)");
      }
      if (/"2022": .*"32G"/.test(gtt) || /"2022": .*"320G"/.test(gtt) || /"2022": .*"27G"/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT must not stamp MY23 32G / MY25 27G or absorb FW 320G onto 2022");
      }
      if (!/"2023": \["21G", "23G", "25G", "28G", "29G", "30G", "31G", "32G"\]/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT MY23 RVUSA plans missing (32G; no 27G/29GS)");
      }
      if (/"2023": .*"27G"/.test(gtt) || /"2023": .*"29GS"/.test(gtt) || /"2023": .*"320G"/.test(gtt) || /"2023": .*"315G"/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT must not stamp MY25 27G/29GS or absorb FW 315G/320G onto 2023");
      }
      if (!/"2024": \["21G", "23G", "25G", "28G", "29G", "30G", "31G"\]/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT MY24 OEM plans missing");
      }
      if (/"2024": .*"27G"/.test(gtt) || /"2024": .*"29GS"/.test(gtt) || /"2024": .*"320G"/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT must not stamp MY25 27G/29GS or absorb FW 320G onto 2024");
      }
      if (!/"2026": \["21G", "25G", "27G", "29GS", "31G"\]/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT MY26 OEM plans missing");
      }
      if (/"2026": .*"320G"/.test(gtt) || /"2026": .*"394G"/.test(gtt) || /"2026": .*"24G"/.test(gtt)) {
        fail("Grand Design|Momentum G-Class TT must not absorb FW codes or leftover 24G");
      }

      const gfw = slice("Momentum G-Class Fifth Wheel", "Momentum MAV");
      if (/"2020":/.test(gfw) || /"2021":/.test(gfw) || /"2022":/.test(gfw) || /"2023":/.test(gfw)) {
        fail("Grand Design|Momentum G-Class Fifth Wheel must omit 2020–2023 fby (tight slice; first locked FW card is MY2024)");
      }
      if (!/"2024": \["320G", "325G", "350G", "355G", "415G"\]/.test(gfw)) {
        fail("Grand Design|Momentum G-Class Fifth Wheel MY24 OEM plans missing (355G 2024-only; 415G NEW)");
      }
      if (/"2024": .*"394G"/.test(gfw) || /"2025": .*"355G"/.test(gfw)) {
        fail("Grand Design|G-Class FW must not stamp MY26 394G onto 2024 or keep 355G on 2025");
      }
      if (!/"2026": \["320G", "325G", "350G", "394G"\]/.test(gfw)) {
        fail("Grand Design|Momentum G-Class Fifth Wheel MY26 OEM plans missing");
      }
      if (/"2025": .*"394G"/.test(gfw) || /"2026": .*"415G"/.test(gfw)) {
        fail("Grand Design|G-Class FW must not copy 394G onto 2025 or keep 415G on 2026");
      }

      const le = slice("Lineage Series E", "Lineage Series M");
      if (/"2024":/.test(le) || /"2025":/.test(le) || /"2026":/.test(le)) {
        fail("Grand Design|Lineage Series E must not list 2024–2026 (provisional MY2027; no 2026 OEM card)");
      }
      if (!/yearStart:\s*2027/.test(le) || !/fuelType: "Gas"/.test(le)) {
        fail("Grand Design|Lineage Series E must be MY2027 gas E-450 (not Sprinter diesel)");
      }

      const lm = slice("Lineage Series M", "Lineage Series F");
      if (/"2024":/.test(lm)) {
        fail("Grand Design|Lineage Series M yearStart 2025 — omit 2024 (no OEM 2024 Lineage card)");
      }
      if (!/"2025": \["25FW", "25TK"\]/.test(lm) || !/"2026": \["25FW", "25TK"\]/.test(lm)) {
        fail("Grand Design|Lineage Series M must print 25FW/25TK on 2025–2026");
      }
      if (/"2027":/.test(lm)) {
        fail("Grand Design|Lineage Series M must not invent 2027 without an OEM card");
      }
      if (!/horsepower:\s*208/.test(lm) || !/fuelType: "Diesel"/.test(lm)) {
        fail("Grand Design|Lineage Series M must stay Sprinter diesel 208/332");
      }
      if (/towingCapacity: 5000/.test(lm)) {
        fail("Grand Design|Lineage Series M hitch is 3,500 (OEM), not leftover 5,000");
      }

      const lf = slice("Lineage Series F", "Lineage Series VT");
      if (!/fuelType: "Diesel"/.test(lf) || !/Power Stroke/.test(lf)) {
        fail("Grand Design|Lineage Series F must stay Super C Power Stroke diesel");
      }
      if (/"2027":/.test(lf)) {
        fail("Grand Design|Lineage Series F must not invent 2027 without an OEM card");
      }

      const lvt = slice("Lineage Series VT", "Lineage Series VT");
      const lvtBlock = gd.slice(gd.indexOf('    "Lineage Series VT": {'));
      if (!/"2026": \["LVT1", "LVT2"\]/.test(lvtBlock)) {
        fail("Grand Design|Lineage Series VT MY26 must print LVT1 + LVT2");
      }
      if (/"2025":/.test(lvtBlock) || /"2027":/.test(lvtBlock)) {
        fail("Grand Design|Lineage Series VT must not invent 2025/2027 without a printed card");
      }
      if (!/fuelType: "Gas"/.test(lvtBlock) || !/EcoBoost/.test(lvtBlock)) {
        fail("Grand Design|Lineage Series VT must stay Transit EcoBoost gas (not diesel)");
      }

      const towable2027 = [
        slice("Solitude", "Solitude S-Class"),
        slice("Imagine", "Imagine XLS"),
        slice("Transcend", "Transcend One"),
        slice("Momentum", "Momentum M-Class"),
        slice("Influence", "Reflection"),
      ];
      for (const block of towable2027) {
        if (/"2027":/.test(block)) {
          fail("Grand Design towables must not invent 2027 (current OEM cards are MY2026)");
        }
      }

      if (/\n    Keystone: \{/.test(gd) || /\n    Winnebago: \{/.test(gd) || /\n    Coachmen: \{/.test(gd)) {
        fail("Grand Design block must not absorb other-make keys");
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
