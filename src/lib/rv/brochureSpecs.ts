import type { RVSpec } from "./rvTypes";
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
import {
  honestAcUnits,
  honestElectricalService,
  honestGenerator,
  honestHorsepowerForCoach,
  honestTireSize,
  honestTorqueForCoach,
  horsepowerIsOptionBand,
  parseHp,
} from "./catalogHonesty";

export { parseHp } from "./catalogHonesty";

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

/** Honest stand-in when a field has no OEM / catalog pin — never hash-invented. */
export const CONFIRM_BROCHURE = "Confirm brochure";

function mid([a, b]: [number, number]) {
  return (a + b) / 2;
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
  acUnits?: string;
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
  fuelType?: string;
  type?: string;
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
    acUnits: band?.acUnits ?? spec.acUnits,
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
    fuelType: band?.fuelType,
    type: band?.type,
    band,
    yearTruePowertrain,
    resolvedYear,
  };
}

function economy(
  spec: RVSpec,
  mpgOverride?: number,
): {
  city: number;
  hwy: number;
  combined: number;
  note: string;
} {
  const t = spec.type.toLowerCase();

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
    };
  }

  // Catalog / OEM highway estimate only — never invent class-average MPG or fuel.
  if (mpgOverride && mpgOverride > 0) {
    const hwy = Math.round(mpgOverride);
    const city = Math.max(4, Math.round(mpgOverride * 0.85));
    const combined = Math.round(((city + hwy) / 2) * 10) / 10;
    const diesel =
      /diesel/i.test(spec.fuelType) || /diesel/i.test(spec.engine ?? "");
    return {
      city,
      hwy,
      combined,
      note: diesel
        ? "Est. loaded highway MPG — diesel; terrain & load vary"
        : "Est. loaded highway MPG — gas; terrain & load vary",
    };
  }

  return {
    city: 0,
    hwy: 0,
    combined: 0,
    note: CONFIRM_BROCHURE,
  };
}

function tankOrConfirm(n?: number | null): string {
  return n != null && n > 0 ? fmtGal(n) : CONFIRM_BROCHURE;
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
        fuelType: correction.fuelType ?? snapBase.fuelType,
        yearTruePowertrain: true,
        notes: correction.note
          ? [snapBase.notes, correction.note].filter(Boolean).join(" · ")
          : snapBase.notes,
      }
    : snapBase;
  // Year-first fuel: MY11–12 Canyon Star Gas (F-53/Workhorse) must not inherit FED Diesel.
  // Inverse of Pace Arrow: a diesel year pin must not inherit F53 Gas.
  const engineBlob = snap.engine || "";
  const yearFuel = snap.fuelType || "";
  const engineIsGas =
    /gas|triton|godzilla|workhorse|f-?53|7\.3l/i.test(engineBlob) &&
    !/diesel|cummins|isb|isl|l9|b6\.7/i.test(engineBlob);
  const engineIsDiesel = /diesel|cummins|isb|isl|l9|b6\.7/i.test(engineBlob);
  const diesel =
    /^diesel$/i.test(yearFuel) ||
    (!/^gas$/i.test(yearFuel) &&
      !engineIsGas &&
      (engineIsDiesel || /diesel/i.test(spec.fuelType)));

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
  // Year-first fuel: a 2023 Pace Arrow diesel pin must not inherit F53 "Gas";
  // MY11–12 Canyon Star Gas must not inherit FED B6.7 Diesel.
  const resolvedFuel = isTowable
    ? spec.fuelType
    : /^gas$/i.test(yearFuel) || engineIsGas
      ? "Gas"
      : /^diesel$/i.test(yearFuel) || diesel
        ? "Diesel"
        : spec.fuelType;
  const resolvedType =
    snap.type ||
    (/class\s*a/i.test(spec.type) && resolvedFuel === "Gas"
      ? "Class A Gas"
      : /class\s*a/i.test(spec.type) && resolvedFuel === "Diesel"
        ? spec.type.includes("Diesel")
          ? spec.type
          : "Class A Diesel"
        : spec.type);
  const classAGasNoTag =
    /class\s*a/i.test(resolvedType) &&
    !/diesel/i.test(resolvedType) &&
    (/gas/i.test(resolvedType) || /gas/i.test(resolvedFuel));
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

  const eco = economy(spec, snap.mpgHighwayEst);
  const fuelGal =
    !isTowable && snap.fuelCapacityGal && snap.fuelCapacityGal > 0
      ? snap.fuelCapacityGal
      : 0;

  const range =
    eco.combined > 0 && fuelGal > 0
      ? Math.round(eco.combined * fuelGal)
      : 0;

  const electrical = /fifth|toy/i.test(spec.type)
    ? "50 amp"
    : honestElectricalService({
        type: spec.type,
        chassis: snap.chassis ?? spec.chassis,
      });

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
    : honestHorsepowerForCoach({
        engine: snap.engine,
        horsepower: snap.horsepower,
        chassis: snap.chassis ?? spec.chassis,
        type: spec.type,
      });

  // Dual-rating engines (L9 450 / X15 605) must not lock a lone 450.
  // "by year" + a catalog number is SoT — keep the number.
  const safeHpDisplay =
    !isTowable &&
    /^450\s*HP$/i.test(hpDisplay.trim()) &&
    horsepowerIsOptionBand(snap.engine)
      ? parseHp(snap.engine, snap.horsepower)
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
  const noBandNote =
    !isTowable &&
    !snap.band &&
    !correction &&
    snap.engine
      ? `No year-band powertrain for ${yearLabel} — showing catalog default; confirm brochure for this model year.`
      : null;

  const typicalGearNote =
    "Tire / A/C / generator are class-typical when no brochure pin — confirm door sticker.";
  const accuracyNote = [
    oem?.note ||
      snap.notes ||
      (local
        ? `Local correction for ${yearLabel}${local.note ? ` · ${local.note}` : ""} · exportable pin.`
        : null) ||
      noBandNote ||
      (dataSource === "estimated"
        ? "Some fields estimated from class averages — verify against OEM brochure / VIN."
        : dataSource === "oem-year"
          ? `Year-true OEM facts for ${yearLabel}${floorplan ? ` · floorplan ${floorplan}` : ""}${correction ? " · verified powertrain patch" : ""}${snap.band ? ` · band ${snap.band.from}–${snap.band.to}` : ""}${oem?.source ? ` · ${oem.source}` : ""}.`
          : `Catalog brochure fields for ${yearLabel}.`),
    oem?.tireSize ? null : typicalGearNote,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    lengthFt: lengthDisplay,
    lengthIn: lengthDisplay,
    exteriorWidth: fmtInchesAsFtIn(widthIn),
    exteriorHeight: fmtInchesAsFtIn(heightIn),
    interiorHeight: `${intH}" (${fmtFtIn(intH / 12)})`,
    wheelbase: isTowable ? "N/A (towable)" : CONFIRM_BROCHURE,

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

    fuelType: resolvedFuel,
    engine: engineLabel,
    horsepower: safeHpDisplay,
    torque: isTowable
      ? "N/A"
      : honestTorqueForCoach({
          engine: snap.engine,
          chassis: snap.chassis ?? spec.chassis,
          type: spec.type,
          torqueLbFt: snap.torqueLbFt,
          diesel,
          horsepower: snap.horsepower,
        }),
    transmission: transmissionFor(spec, diesel, snap.transmission),
    chassis:
      snap.chassis ??
      (isTowable ? "Towable frame" : "Manufacturer chassis"),

    mpgCity: eco.city ? `${eco.city}` : isTowable ? "—" : CONFIRM_BROCHURE,
    mpgHighway: eco.hwy ? `${eco.hwy}` : isTowable ? "—" : CONFIRM_BROCHURE,
    mpgCombined: eco.combined
      ? `${eco.combined}`
      : isTowable
        ? "Tow vehicle"
        : CONFIRM_BROCHURE,
    mpgNote: eco.note,
    fuelCapacity: isTowable
      ? "N/A (towable)"
      : fuelGal
        ? fmtGal(fuelGal)
        : CONFIRM_BROCHURE,
    rangeMiles: isTowable
      ? "Tow vehicle"
      : range
        ? `~${range.toLocaleString()} mi`
        : CONFIRM_BROCHURE,

    sleeps: String(oem?.sleeps ?? snap.sleeps ?? spec.sleeps),
    slideouts: String(oem?.slideouts ?? snap.slideouts ?? spec.slideouts),
    seatBelts: CONFIRM_BROCHURE,
    awning: spec.awningLength
      ? `${spec.awningLength} ft power awning`
      : `${Math.max(12, Math.round(lenMid * 0.45))} ft (typ.)`,

    freshWater: tankOrConfirm(oem?.freshWater ?? snap.freshWater),
    grayWater: tankOrConfirm(oem?.grayWater ?? snap.grayWater),
    blackWater: tankOrConfirm(oem?.blackWater ?? snap.blackWater),
    propane: oem?.propaneLbs
      ? `${oem.propaneLbs} lb`
      : CONFIRM_BROCHURE,
    waterHeater: CONFIRM_BROCHURE,

    generator: honestGenerator({
      generator:
        snap.generator ??
        (isToyHauler
          ? "Generator prep / optional Onan 4–5.5kW"
          : isTowable
            ? "Optional"
            : "See options"),
      fuelType: resolvedFuel,
      chassis: snap.chassis ?? spec.chassis,
      engine: snap.engine,
      type: spec.type,
    }),
    electricalService: electrical,
    acUnits: honestAcUnits({
      oem: snap.acUnits,
      type: spec.type,
      lengthFt: lenMid,
      chassis: snap.chassis ?? spec.chassis,
    }),
    furnaceBtu:
      /class c/i.test(spec.type) && !/super/i.test(spec.type)
        ? "30,000 BTU (typ. — confirm brochure)"
        : /class b/i.test(spec.type)
          ? "20,000 BTU (typ. — confirm brochure)"
          : "35,000 BTU (typ. — confirm brochure)",
    converter: CONFIRM_BROCHURE,

    axles: classAGasNoTag
      ? "Steer + dual rear (no tag)"
      : oem?.axles
      ? oem.axles
      : isTowable
        ? gvwrMid > 10000
          ? "Triple axle"
          : "Tandem axle"
        : /class b/i.test(spec.type)
          ? "Single rear"
          : /class c/i.test(spec.type) && !/super/i.test(spec.type)
            ? "Steer + dual rear (no tag)"
            : "Tag axle (when equipped)",
    tireSize: honestTireSize({
      oem: oem?.tireSize,
      type: spec.type,
      chassis: snap.chassis ?? spec.chassis,
    }),

    type: resolvedType,
    warranty: spec.warrantyYears
      ? `${spec.warrantyYears}-yr limited / structural varies`
      : CONFIRM_BROCHURE,
    construction: CONFIRM_BROCHURE,
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
