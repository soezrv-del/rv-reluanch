import type { RVSpec } from "./rvData";
import {
  formatFloorplanLength,
  lengthFtFromFloorplan,
  overallInchesFromFloorplan,
  formatInchesAsFtIn,
  weightForFloorplan,
  findOemFloorplanSpec,
} from "./floorplanSpecs";
import { findPowertrainCorrection } from "./powertrainCorrections";
import {
  findLocalSpecOverride,
  localOverrideAsPin,
} from "./localSpecOverrides";
import {
  bandFitsCoach,
  chassisLooksSprinter,
} from "./powertrainFamily";

/** Full brochure-style specification sheet (derived + source fields) */
export interface BrochureSpecs {
  lengthFt: string;
  lengthIn: string;
  exteriorWidth: string;
  exteriorHeight: string;
  interiorHeight: string;
  wheelbase: string;
  gvwr: string;
  uvw: string;
  ccc: string;
  gcwr: string;
  hitchOrPin: string;
  hitchLabel: string;
  fuelType: string;
  engine: string;
  horsepower: string;
  torque: string;
  transmission: string;
  chassis: string;
  mpgCity: string;
  mpgHighway: string;
  mpgCombined: string;
  mpgNote: string;
  fuelCapacity: string;
  rangeMiles: string;
  sleeps: string;
  slideouts: string;
  seatBelts: string;
  awning: string;
  freshWater: string;
  grayWater: string;
  blackWater: string;
  propane: string;
  waterHeater: string;
  generator: string;
  electricalService: string;
  acUnits: string;
  furnaceBtu: string;
  converter: string;
  axles: string;
  tireSize: string;
  type: string;
  warranty: string;
  construction: string;
  accuracyNote: string;
  dataSource: "oem-year" | "catalog" | "estimated";
  isToyHauler: boolean;
  garageLength: string;
  garageWidth: string;
  garageHeight: string;
  garageCapacity: string;
  rampWidth: string;
  fuelStation: string;
  generatorFuel: string;
  garageFits: string;
}

function mid([a, b]: [number, number]) {
  return (a + b) / 2;
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(seed: number, arr: T[]): T {
  return arr[seed % arr.length]!;
}

function fmtLbs(n: number) {
  return `${Math.round(n).toLocaleString()} lbs`;
}

function fmtGal(n: number) {
  return `${Math.round(n)} gal`;
}

function fmtFtIn(ft: number) {
  const whole = Math.floor(ft);
  const inches = Math.round((ft - whole) * 12);
  if (inches === 0) return `${whole}' 0"`;
  if (inches === 12) return `${whole + 1}' 0"`;
  return `${whole}' ${inches}"`;
}

function fmtInchesAsFtIn(totalIn: number) {
  const whole = Math.floor(totalIn / 12);
  const inches = Math.round(totalIn - whole * 12);
  if (inches === 0) return `${whole}' 0"`;
  if (inches === 12) return `${whole + 1}' 0"`;
  return `${whole}' ${inches}"`;
}

type YearBand = NonNullable<RVSpec["powertrainByYear"]>[number];

function normFp(fp: string | undefined | null): string {
  return (fp || "").toLowerCase().replace(/[\s\-_/]/g, "");
}

function bandMatchesFloorplan(b: YearBand, floorplan: string): boolean {
  const fp = normFp(floorplan);
  if (b.excludeFloorplans?.length && fp) {
    if (
      b.excludeFloorplans.some(
        (x) => fp.includes(normFp(x)) || normFp(x).includes(fp),
      )
    ) {
      return false;
    }
  }
  if (!b.floorplans?.length) return true; // model-wide default
  if (!fp) return false; // floorplan-specific band needs a floorplan selected
  return b.floorplans.some((x) => {
    const n = normFp(x);
    if (!n) return false;
    // Exact match always wins
    if (fp === n) return true;
    // Full code contains plan token only when token is long enough to be a real plan
    // (avoid "40" matching "4037" AND "37" also matching "4037")
    if (n.length >= 3 && (fp.includes(n) || n.includes(fp))) return true;
    // 2-digit length codes: match only as LEADING length of Newmar-style codes
    if (n.length === 2 && /^\d{2}$/.test(n) && /^\d{2}/.test(fp)) {
      return fp.startsWith(n);
    }
    // Alpha plans like 37BH
    if (/[a-z]/i.test(n) && (fp.includes(n) || n.includes(fp))) return true;
    return false;
  });
}

/**
 * Pick the powertrain year band for a model year (+ optional floorplan).
 * 1) Floorplan-specific exact year match (preferred)
 * 2) Model-wide exact year match
 * 3) Nearest band within 3 years (floorplan-specific first)
 * Never silently invents a modern top-level engine as "this year".
 */
export function pickPowertrainBand(
  spec: RVSpec,
  year: string | number,
  floorplan?: string,
): YearBand | null {
  const bands = spec.powertrainByYear;
  if (!bands?.length) return null;
  const y = typeof year === "number" ? year : parseInt(String(year), 10);
  if (!Number.isFinite(y)) return null;

  const usable = bands.filter((b) => bandFitsCoach(spec, b));
  if (!usable.length) return null;

  const inYear = usable.filter((b) => y >= b.from && y <= b.to);
  if (inYear.length) {
    // Prefer floorplan-specific bands over model-wide
    const fpHits = inYear.filter(
      (b) => b.floorplans?.length && bandMatchesFloorplan(b, floorplan || ""),
    );
    if (fpHits.length) {
      // Prefer the band whose matching floorplan token is most specific (longest)
      const scored = fpHits.map((b) => {
        const fp = normFp(floorplan || "");
        let best = 0;
        for (const x of b.floorplans || []) {
          const n = normFp(x);
          if (!n) continue;
          if (fp === n) best = Math.max(best, 100 + n.length);
          else if (fp.startsWith(n) && n.length === 2) best = Math.max(best, 50);
          else if (n.length >= 3 && fp.includes(n)) best = Math.max(best, 80 + n.length);
        }
        return { b, best };
      });
      scored.sort((a, c) => c.best - a.best);
      return scored[0]!.b;
    }
    const wide = inYear.filter(
      (b) => !b.floorplans?.length && bandMatchesFloorplan(b, floorplan || ""),
    );
    if (wide.length) return wide[0]!;
  }

  // Nearest band by distance — floorplan-aware
  let best: YearBand | null = null;
  let bestDist = Infinity;
  let bestScore = -1; // higher = more specific
  for (const b of usable) {
    if (!bandMatchesFloorplan(b, floorplan || "")) continue;
    const dist = y < b.from ? b.from - y : y > b.to ? y - b.to : 0;
    const score = b.floorplans?.length ? 2 : 1;
    if (dist < bestDist || (dist === bestDist && score > bestScore)) {
      bestDist = dist;
      bestScore = score;
      best = b;
    }
  }
  if (best && bestDist <= 3 && bandFitsCoach(spec, best)) return best;
  return null;
}

/** Merge year-banded OEM facts onto a resolved snapshot */
export function resolveYearSnapshot(
  spec: RVSpec,
  year: string,
  floorplan?: string,
): {
  engine?: string;
  chassis?: string;
  horsepower?: number;
  torqueLbFt?: number;
  transmission?: string;
  towingCapacity?: number;
  fuelCapacityGal?: number;
  generator?: string;
  gvwrLbs?: number;
  exteriorHeightIn?: number;
  exteriorWidthIn?: number;
  overallLengthIn?: number;
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
  ceilingHeight?: number;
  slideouts?: number;
  sleeps?: number;
  mpgHighwayEst?: number;
  uvwLbs?: number;
  cccLbs?: number;
  notes?: string;
  band: YearBand | null;
  /** True when engine/HP came from a year band (not bare top-level modern default) */
  yearTruePowertrain: boolean;
  /** Model year used for band lookup */
  resolvedYear: number;
} {
  const y = parseInt(year, 10);
  const resolvedYear = Number.isFinite(y) && y >= 1980 && y <= 2100 ? y : 2020;
  const band = pickPowertrainBand(spec, resolvedYear, floorplan);

  // Year-true: band fields win. Top-level only fills gaps when no band.
  const yearTruePowertrain = !!band;

  return {
    engine: band?.engine ?? spec.engine,
    chassis: band?.chassis ?? spec.chassis,
    // Band wins when it sets a value; otherwise fall through to catalog top-level
    // (old bug: band without torqueLbFt wiped catalog 800 → invent 936)
    horsepower:
      band?.horsepower != null && band.horsepower > 0
        ? band.horsepower
        : spec.horsepower,
    torqueLbFt:
      band?.torqueLbFt != null && band.torqueLbFt > 0
        ? band.torqueLbFt
        : spec.torqueLbFt,
    transmission: band?.transmission ?? spec.transmission,
    towingCapacity: band?.towingCapacity ?? spec.towingCapacity,
    fuelCapacityGal: band?.fuelCapacityGal ?? spec.fuelCapacityGal,
    generator: band?.generator ?? spec.generator,
    gvwrLbs: band?.gvwrLbs ?? spec.gvwrLbs,
    exteriorHeightIn: band?.exteriorHeightIn ?? spec.exteriorHeightIn,
    exteriorWidthIn: band?.exteriorWidthIn ?? spec.exteriorWidthIn,
    overallLengthIn: band?.overallLengthIn ?? spec.overallLengthIn,
    freshWater: band?.freshWater ?? spec.freshWater,
    grayWater: band?.grayWater ?? spec.grayWater,
    blackWater: band?.blackWater ?? spec.blackWater,
    ceilingHeight: band?.ceilingHeight ?? spec.ceilingHeight,
    slideouts: band?.slideouts ?? spec.slideouts,
    sleeps: band?.sleeps ?? spec.sleeps,
    mpgHighwayEst: spec.mpgHighwayEst,
    uvwLbs: spec.uvwLbs,
    cccLbs: spec.cccLbs,
    notes: band?.notes,
    band,
    yearTruePowertrain,
    resolvedYear,
  };
}

function economy(
  spec: RVSpec,
  seed: number,
  gvwr: number,
  mpgOverride?: number,
): {
  city: number;
  hwy: number;
  combined: number;
  note: string;
  fuelGal: number;
} {
  const t = spec.type.toLowerCase();
  const diesel =
    /diesel/i.test(spec.fuelType) || /diesel/i.test(spec.engine ?? "");

  if (
    t.includes("travel trailer") ||
    t.includes("fifth") ||
    t.includes("toy hauler") ||
    t.includes("truck camper") ||
    /towable/i.test(spec.fuelType)
  ) {
    return {
      city: 0,
      hwy: 0,
      combined: 0,
      note: "Tow vehicle dependent — MPG set by tow vehicle + load",
      fuelGal: 0,
    };
  }

  let city = 8;
  let hwy = 10;
  let fuelGal = 80;

  if (t.includes("class b")) {
    city = diesel ? 16 + (seed % 3) : 14 + (seed % 3);
    hwy = diesel ? 20 + (seed % 3) : 17 + (seed % 3);
    fuelGal = diesel ? 24 + (seed % 6) : 25 + (seed % 5);
  } else if (t.includes("class c") && !t.includes("super")) {
    city = diesel ? 12 + (seed % 2) : 9 + (seed % 2);
    hwy = diesel ? 16 + (seed % 2) : 12 + (seed % 2);
    fuelGal = diesel ? 26 + (seed % 4) : 55 + (seed % 10);
  } else if (t.includes("super c")) {
    if (diesel) {
      if (gvwr > 36000) {
        city = 7 + (seed % 2);
        hwy = 9 + (seed % 2);
        fuelGal = 90 + (seed % 20);
      } else {
        city = 8 + (seed % 2);
        hwy = 11 + (seed % 2);
        fuelGal = 70 + (seed % 15);
      }
    } else {
      city = 7;
      hwy = 9;
      fuelGal = 68 + (seed % 12);
    }
  } else if (t.includes("class a")) {
    if (diesel) {
      if (gvwr > 52000) {
        city = 5 + (seed % 2);
        hwy = 7 + (seed % 2);
        fuelGal = 140 + (seed % 20);
      } else if (gvwr > 40000) {
        city = 6 + (seed % 2);
        hwy = 8 + (seed % 2);
        fuelGal = 120 + (seed % 20);
      } else {
        city = 7 + (seed % 2);
        hwy = 9 + (seed % 2);
        fuelGal = 100 + (seed % 20);
      }
    } else {
      city = 6 + (seed % 2);
      hwy = 8 + (seed % 2);
      fuelGal = 80 + (seed % 20);
    }
  } else {
    city = diesel ? 10 : 8;
    hwy = diesel ? 13 : 10;
    fuelGal = 60;
  }

  if (mpgOverride && mpgOverride > 0) {
    hwy = Math.round(mpgOverride);
    city = Math.max(4, Math.round(mpgOverride * 0.85));
  }

  const combined = Math.round(((city + hwy) / 2) * 10) / 10;
  return {
    city,
    hwy,
    combined,
    note: diesel
      ? "Est. loaded highway MPG — diesel; terrain & load vary"
      : "Est. loaded highway MPG — gas; terrain & load vary",
    fuelGal,
  };
}

function parseHp(engine?: string, hp?: number): string {
  // Prefer explicit year-band / catalog numeric HP when present
  if (hp != null && Number.isFinite(hp) && hp > 0) {
    return `${Math.round(hp)} HP`;
  }
  if (!engine || !engine.trim()) {
    return "Varies by option / year — confirm brochure";
  }

  const eng = engine.trim();

  // Multi-option powertrains (e.g. "EcoBoost · Mercedes") — never invent a single HP
  const hpMentions = [...eng.matchAll(/(\d{2,4})\s*HP/gi)].map((m) => m[1]!);
  const looksMulti =
    /[·|]/.test(eng) ||
    /\bor\b/i.test(eng) ||
    /by (year|option|chassis|floorplan)/i.test(eng) ||
    hpMentions.length >= 2;

  if (looksMulti && hpMentions.length >= 2) {
    const unique = [...new Set(hpMentions)];
    return `Varies (${unique.join("–")} HP by option)`;
  }
  if (looksMulti && hpMentions.length === 0) {
    return "Varies by option / year — confirm brochure";
  }

  // Explicit range in the engine string — surface the range, not a single default
  const range = eng.match(/(\d{2,4})\s*[–—\-to]+\s*(\d{2,4})\s*HP/i);
  if (range) {
    return `${range[1]}–${range[2]} HP (by option)`;
  }

  const m = eng.match(/(\d{2,4})\s*HP/i);
  if (m) return `${m[1]} HP`;

  // Known gas chassis families — brochure-typical ranges only (never invent 450)
  if (/V10|Triton/i.test(eng)) return "305–362 HP (by year) — confirm brochure";
  if (/7\.3L|Godzilla/i.test(eng)) return "335–350 HP (by application) — confirm brochure";
  if (/EcoBoost/i.test(eng)) return "Varies by option / year — confirm brochure";

  // Diesel / chassis without a numeric HP in catalog — do NOT invent 450 HP
  if (/Cummins|Power Stroke|Duramax|ISB|B6\.7|L9|ISL|X15|X12|Cat /i.test(eng)) {
    return "Varies by option / year — confirm brochure";
  }

  return "Varies by option / year — confirm brochure";
}

function torqueFor(
  engine?: string,
  diesel?: boolean,
  torqueLbFt?: number,
  hpNum?: number,
): string {
  if (torqueLbFt && torqueLbFt > 0) {
    return `${torqueLbFt.toLocaleString()} lb-ft`;
  }
  if (!engine) return "—";

  // Family tables first — never invent 936 from HP×2.6
  if (/x15/i.test(engine)) return "1,850–1,950 lb-ft (X15 class)";
  if (/x12/i.test(engine)) return "1,700 lb-ft (typ. X12)";
  if (/l9/i.test(engine) && /450/i.test(engine)) return "1,250 lb-ft (L9 450)";
  if (/l9/i.test(engine) && /380/i.test(engine)) return "1,150 lb-ft (L9 380)";
  if (/l9/i.test(engine)) return "1,150–1,250 lb-ft (L9 class — confirm option)";
  if (/isl\s*8|isl\b/i.test(engine) && !/isb/i.test(engine))
    return "1,050–1,250 lb-ft (ISL class — confirm year)";
  if (/b6\.7|isb/i.test(engine)) return "800 lb-ft (B6.7 / ISB class)";
  if (/godzilla|7\.3/i.test(engine)) return "468 lb-ft (typ. 7.3 Godzilla)";
  if (/v10|triton/i.test(engine)) return "460 lb-ft (typ. V10)";
  if (/power\s*stroke|6\.7/i.test(engine) && /ford/i.test(engine))
    return "750–1,050 lb-ft (Power Stroke — confirm)";
  if (/sprinter|mercedes|2\.0l/i.test(engine)) return "332–350 lb-ft (Sprinter class)";

  // Multi-option engine string without family hit
  if (
    /[·|]/.test(engine) ||
    /\bor\b/i.test(engine) ||
    /by (year|option)/i.test(engine) ||
    /\d+\s*[–—\-]\s*\d+\s*HP/i.test(engine)
  ) {
    return "Varies by option / year — confirm brochure";
  }

  const m = engine.match(/(\d{3,4})\s*HP/i);
  const hp =
    hpNum != null && hpNum > 0
      ? hpNum
      : m
        ? parseInt(m[1]!, 10)
        : null;
  if (hp == null) {
    return "Varies by option / year — confirm brochure";
  }
  if (diesel) {
    if (hp >= 580) return "1,950 lb-ft (typ. X15 class)";
    if (hp >= 480) return "1,700 lb-ft (typ. X12 class)";
    if (hp >= 400) return "1,250 lb-ft (typ. L9 class)";
    if (hp >= 340 && hp <= 380) return "800 lb-ft (typ. B6.7 / ISB)";
    // Do NOT invent HP×2.6 (360→936 was a bug)
    return "Varies by option / year — confirm brochure";
  }
  if (/7\.3L|Godzilla/i.test(engine)) return "468 lb-ft (typ.)";
  if (/V10|Triton/i.test(engine)) return "460 lb-ft (typ. V10)";
  return "Varies by option / year — confirm brochure";
}

function transmissionFor(
  spec: RVSpec,
  diesel: boolean,
  override?: string,
): string {
  if (override) return override;
  const t = spec.type.toLowerCase();
  if (t.includes("travel") || t.includes("fifth") || t.includes("toy"))
    return "N/A (towable)";
  if (/Sprinter|Mercedes/i.test(spec.chassis ?? "") || /Mercedes/i.test(spec.engine ?? ""))
    return "9G-Tronic Auto";
  if (/Ford F53|F-53/i.test(spec.chassis ?? "")) return "TorqShift 6-spd Auto";
  if (diesel && t.includes("class a")) return "Allison 3000/4000 6-spd";
  if (/F-550|F-600|Super C/i.test(spec.chassis ?? "") || t.includes("super c"))
    return "TorqShift 10-spd Auto";
  return diesel ? "Allison Automatic" : "6-spd Automatic";
}

export function buildBrochureSpecs(
  spec: RVSpec,
  year: string,
  make = "",
  model = "",
  floorplan = "",
): BrochureSpecs {
  const seed = hashSeed(`${make}|${model}|${year}|${floorplan}|${spec.type}`);
  const snapBase = resolveYearSnapshot(spec, year, floorplan);
  // Local user correction > brochure pin > year-band catalog
  const local = findLocalSpecOverride(year, make, model, floorplan);
  const localPin = local ? localOverrideAsPin(local) : null;
  const correction =
    localPin || findPowertrainCorrection(year, make, model, floorplan);
  const snap = correction
    ? {
        ...snapBase,
        engine: correction.engine ?? snapBase.engine,
        horsepower:
          correction.horsepower > 0
            ? correction.horsepower
            : snapBase.horsepower,
        torqueLbFt: correction.torqueLbFt ?? snapBase.torqueLbFt,
        chassis: correction.chassis ?? snapBase.chassis,
        transmission: correction.transmission ?? snapBase.transmission,
        yearTruePowertrain: true,
        notes: correction.note
          ? [snapBase.notes, correction.note].filter(Boolean).join(" · ")
          : snapBase.notes,
      }
    : snapBase;
  const diesel =
    /diesel/i.test(spec.fuelType) || /diesel/i.test(snap.engine ?? "");

  // Brochure-backed OEM floorplan (e.g. Brinkley 3950) beats digit heuristics
  const oem = findOemFloorplanSpec(year, make, model, floorplan);

  const fpLen = oem
    ? Math.round(oem.overallLengthIn / 12)
    : lengthFtFromFloorplan(floorplan, spec.lengthRange, { make, model });
  const fpInches = oem
    ? oem.overallLengthIn
    : overallInchesFromFloorplan(floorplan, spec.lengthRange, {
        make,
        model,
        type: spec.type,
      });
  const w = weightForFloorplan(floorplan, spec.weightRange, spec.lengthRange, {
    make,
    model,
  });
  const gvwrMid = oem?.gvwrLbs ?? snap.gvwrLbs ?? w.mid;
  const uvw = oem?.uvwLbs ?? snap.uvwLbs ?? w.uvwEst;
  const ccc =
    oem != null
      ? Math.max(800, oem.gvwrLbs - oem.uvwLbs)
      : (snap.cccLbs ?? w.cccEst);

  const lenMid =
    fpInches != null
      ? fpInches / 12
      : fpLen ?? (floorplan ? mid(spec.lengthRange) : mid(spec.lengthRange));
  const sprinterCoach = chassisLooksSprinter(spec.chassis, spec.engine);
  const widthIn =
    oem?.exteriorWidthIn ??
    snap.exteriorWidthIn ??
    (sprinterCoach || /class b/i.test(spec.type) ? 90.5 : 101.5);
  const heightIn =
    oem?.exteriorHeightIn ??
    snap.exteriorHeightIn ??
    Math.round(
      (/class b/i.test(spec.type)
        ? 9.6
        : sprinterCoach
          ? 11.0
          : /class a|super c/i.test(spec.type)
            ? 12.75
            : 11.5) * 12,
    );
  const intH =
    oem?.interiorHeightIn ??
    snap.ceilingHeight ??
    (spec.ceilingHeight ?? 80);


  const isTowable =
    /travel trailer|fifth|toy hauler|truck camper/i.test(spec.type) ||
    /towable/i.test(spec.fuelType);
  const hasGarageData = Boolean(
    oem?.garageLengthFt ||
      spec.garageLengthFt ||
      spec.garageWidthFt ||
      spec.garageHeightIn ||
      spec.garageFits,
  );
  const isToyHauler = /toy hauler/i.test(spec.type) || hasGarageData;

  const hitchPct = /fifth/i.test(spec.type) || isToyHauler ? 0.2 : 0.12;
  const towCap = snap.towingCapacity ?? 0;
  const hitch = oem?.hitchLbs
    ? oem.hitchLbs
    : isTowable
      ? gvwrMid * hitchPct
      : towCap;

  const propane = oem?.propaneLbs
    ? oem.propaneLbs
    : isTowable
      ? 40 + (seed % 40)
      : /class b/i.test(spec.type)
        ? 16 + (seed % 10)
        : 40 + (seed % 40);


  const eco = economy(spec, seed, gvwrMid, snap.mpgHighwayEst);
  const fuelGal = isTowable
    ? 0
    : snap.fuelCapacityGal && snap.fuelCapacityGal > 0
      ? snap.fuelCapacityGal
      : eco.fuelGal || (diesel ? 100 : 80);

  const range =
    eco.combined > 0 && fuelGal > 0
      ? Math.round(eco.combined * fuelGal)
      : 0;

  const wb =
    lenMid > 40
      ? 266 + (seed % 20)
      : lenMid > 32
        ? 228 + (seed % 16)
        : lenMid > 24
          ? 178 + (seed % 14)
          : 144 + (seed % 12);

  const electrical = /class a|super c|fifth|toy/i.test(spec.type)
    ? "50 amp"
    : /class b/i.test(spec.type)
      ? "30 amp"
      : pick(seed, ["30 amp", "50 amp"]);

  const gLen = oem?.garageLengthFt ?? spec.garageLengthFt ?? 0;
  const gWidth = oem?.garageWidthFt ?? spec.garageWidthFt ?? 0;
  const gHeight = oem?.garageHeightIn ?? spec.garageHeightIn ?? 0;
  const gCap = oem?.garageCapacityLbs ?? spec.garageCapacityLbs ?? 0;
  const ramp = spec.rampWidthFt ?? 0;
  const fuelStation = oem?.fuelStationGal ?? spec.fuelStationGal ?? 0;
  const genFuel = spec.generatorFuelGal ?? 0;

  // Single actual measurement when a floorplan is selected — never "34–44 ft"
  const lengthDisplay = oem?.lengthDisplay
    ? oem.lengthDisplay
    : fpInches != null
      ? formatInchesAsFtIn(fpInches)
      : snap.overallLengthIn
        ? fmtInchesAsFtIn(snap.overallLengthIn)
        : floorplan
          ? formatFloorplanLength(floorplan, spec.lengthRange, {
              make,
              model,
              type: spec.type,
            })
          : spec.lengthRange[0] === spec.lengthRange[1]
            ? fmtInchesAsFtIn(spec.lengthRange[0] * 12)
            : `${spec.lengthRange[0]}–${spec.lengthRange[1]} ft`;

  const gvwrDisplay = oem?.gvwrLbs
    ? fmtLbs(oem.gvwrLbs)
    : snap.gvwrLbs
      ? fmtLbs(snap.gvwrLbs)
      : floorplan
        ? w.gvwr
        : `${spec.weightRange[0].toLocaleString()}–${spec.weightRange[1].toLocaleString()} lbs`;


  // Clean engine labels for year (drop "or prior…" parenthetical noise when year is clear)
  let engineLabel =
    snap.engine ?? (isTowable ? "N/A (towable)" : "See chassis");
  if (engineLabel.includes("(or prior") && parseInt(year, 10) >= 2021) {
    engineLabel = engineLabel.replace(/\s*\(or prior[^)]*\)/i, "").trim();
  }

  const hpDisplay = isTowable
    ? "N/A"
    : parseHp(snap.engine, snap.horsepower);

  // Never surface a bare invented 450 from old code paths
  const safeHpDisplay =
    !isTowable &&
    /^450\s*HP$/i.test(hpDisplay.trim()) &&
    !(snap.horsepower === 450) &&
    !/450\s*HP/i.test(snap.engine || "")
      ? "Varies by option / year — confirm brochure"
      : hpDisplay;

  const dataSource: BrochureSpecs["dataSource"] = oem
    ? "oem-year"
    : local
      ? "oem-year"
      : correction
        ? "oem-year"
        : snap.band
          ? "oem-year"
          : snap.engine || snap.fuelCapacityGal || snap.gvwrLbs
            ? "catalog"
            : "estimated";

  const yearLabel = String(snap.resolvedYear || year);
  const hpMissingNote =
    !isTowable &&
    (snap.horsepower == null ||
      !Number.isFinite(snap.horsepower) ||
      (snap.horsepower as number) <= 0) &&
    /varies|confirm brochure/i.test(safeHpDisplay)
      ? `Horsepower not fixed for ${yearLabel} — engine shown; HP varies by option or year. Confirm OEM brochure / door sticker.`
      : null;

  const noBandNote =
    !isTowable &&
    !snap.band &&
    !correction &&
    snap.engine
      ? `No year-band powertrain for ${yearLabel} — showing catalog default; confirm brochure for this model year.`
      : null;

  const accuracyNote =
    oem?.note ||
    snap.notes ||
    (local
      ? `Local correction for ${yearLabel}${local.note ? ` · ${local.note}` : ""} · exportable pin.`
      : null) ||
    hpMissingNote ||
    noBandNote ||
    (dataSource === "estimated"
      ? "Some fields estimated from class averages — verify against OEM brochure / VIN."
      : dataSource === "oem-year"
        ? `Year-true OEM facts for ${yearLabel}${floorplan ? ` · floorplan ${floorplan}` : ""}${correction ? " · verified powertrain patch" : ""}${snap.band ? ` · band ${snap.band.from}–${snap.band.to}` : ""}${oem?.source ? ` · ${oem.source}` : ""}.`
        : `Catalog brochure fields for ${yearLabel}.`);

  return {
    lengthFt: lengthDisplay,
    lengthIn: lengthDisplay,
    exteriorWidth: fmtInchesAsFtIn(widthIn),
    exteriorHeight: fmtInchesAsFtIn(heightIn),
    interiorHeight: `${intH}" (${fmtFtIn(intH / 12)})`,
    wheelbase: isTowable ? "N/A (towable)" : `${wb}"`,

    gvwr: gvwrDisplay,
    uvw: fmtLbs(uvw),
    ccc: fmtLbs(ccc),
    gcwr: isTowable
      ? "Set by tow vehicle"
      : fmtLbs(gvwrMid + (towCap || (diesel ? 10000 : 5000))),
    hitchOrPin: isTowable
      ? fmtLbs(hitch)
      : towCap
        ? fmtLbs(towCap)
        : "—",
    hitchLabel: isTowable
      ? /fifth/i.test(spec.type) || isToyHauler
        ? oem?.hitchLbs
          ? "Pin Weight (brochure)"
          : "Pin Weight (est.)"
        : oem?.hitchLbs
          ? "Tongue Weight (brochure)"
          : "Tongue Weight (est.)"
      : "Tow Capacity",

    fuelType: spec.fuelType,
    engine: engineLabel,
    horsepower: safeHpDisplay,
    torque: isTowable
      ? "N/A"
      : torqueFor(snap.engine, diesel, snap.torqueLbFt, snap.horsepower),
    transmission: transmissionFor(spec, diesel, snap.transmission),
    chassis:
      snap.chassis ??
      (isTowable ? "Towable frame" : "Manufacturer chassis"),

    mpgCity: eco.city ? `${eco.city}` : "—",
    mpgHighway: eco.hwy ? `${eco.hwy}` : "—",
    mpgCombined: eco.combined ? `${eco.combined}` : "Tow vehicle",
    mpgNote: eco.note,
    fuelCapacity: fuelGal ? fmtGal(fuelGal) : "N/A (towable)",
    rangeMiles: range ? `~${range.toLocaleString()} mi` : "Tow vehicle",

    sleeps: String(oem?.sleeps ?? snap.sleeps ?? spec.sleeps),
    slideouts: String(oem?.slideouts ?? snap.slideouts ?? spec.slideouts),
    seatBelts: String(
      Math.min(
        (snap.sleeps ?? spec.sleeps) + 1,
        /class b/i.test(spec.type) ? 4 : (snap.sleeps ?? spec.sleeps) + 2,
      ),
    ),
    awning: spec.awningLength
      ? `${spec.awningLength} ft power awning`
      : `${Math.max(12, Math.round(lenMid * 0.45))} ft (typ.)`,

    freshWater: fmtGal(
      oem?.freshWater ?? snap.freshWater ?? 40 + (seed % 40),
    ),
    grayWater: fmtGal(oem?.grayWater ?? snap.grayWater ?? 30 + (seed % 30)),
    blackWater: fmtGal(
      oem?.blackWater ?? snap.blackWater ?? 28 + (seed % 28),
    ),
    propane: `${propane} lb`,
    waterHeater: pick(seed, [
      "6 gal gas/electric",
      "10 gal gas/electric",
      "Tankless on-demand",
      "16 gal gas/electric",
    ]),

    generator:
      snap.generator ??
      (isToyHauler
        ? "Generator prep / optional Onan 4–5.5kW"
        : isTowable
          ? "Optional"
          : "See options"),
    electricalService: electrical,
    acUnits: pick(seed, [
      "1 × 13,500 BTU",
      "1 × 15,000 BTU",
      "2 × 15,000 BTU",
      "3 × 15,000 BTU",
    ]),
    furnaceBtu: pick(seed, [
      "20,000 BTU",
      "30,000 BTU",
      "35,000 BTU",
      "40,000 BTU",
    ]),
    converter: electrical.includes("50") ? "60–80 amp" : "45–55 amp",

    axles: oem?.axles
      ? oem.axles
      : isTowable
        ? gvwrMid > 10000
          ? "Triple axle"
          : "Tandem axle"
        : /class b/i.test(spec.type)
          ? "Single rear"
          : "Tag axle (when equipped)",
    tireSize: oem?.tireSize
      ? oem.tireSize
      : pick(seed, [
          "225/75R16",
          "235/80R22.5",
          "255/70R22.5",
          "275/70R22.5",
          "ST235/80R16",
        ]),

    type: spec.type,
    warranty: spec.warrantyYears
      ? `${spec.warrantyYears}-yr limited / structural varies`
      : "1-yr limited · structural per OEM",
    construction: pick(seed, [
      "Aluminum frame · laminated walls",
      "Vacuum-bonded walls · aluminum framing",
      "Steel cage · composite walls",
      "Welded aluminum superstructure",
    ]),
    accuracyNote,
    dataSource,

    isToyHauler,
    garageLength: gLen
      ? `${fmtFtIn(gLen)} deep`
      : isToyHauler
        ? "Varies by floorplan — confirm brochure"
        : "—",
    garageWidth: gWidth
      ? `${fmtFtIn(gWidth)} clear`
      : isToyHauler
        ? "Varies — confirm brochure"
        : "—",
    garageHeight: gHeight
      ? `${gHeight}" clear`
      : isToyHauler
        ? "Varies — confirm brochure"
        : "—",
    garageCapacity: gCap
      ? fmtLbs(gCap)
      : isToyHauler
        ? "Varies by floorplan — confirm brochure"
        : "—",
    rampWidth: ramp
      ? `${fmtFtIn(ramp)} ramp door`
      : isToyHauler
        ? "Ramp door — confirm brochure"
        : "—",
    fuelStation: isToyHauler
      ? fuelStation
        ? `${fuelStation} gal fuel station`
        : "Confirm fuel-station option"
      : "—",
    generatorFuel: isToyHauler
      ? genFuel
        ? `${genFuel} gal (gen / station shared often)`
        : "See generator package"
      : "—",
    garageFits:
      spec.garageFits ??
      (isToyHauler ? "See floorplan — typically 1 UTV or dual bikes" : "—"),
  };
}
