/**
 * Coverage helpers for catalog-wide UVW estimates.
 * Pins / published UVW stay untouched; this only classifies paths that
 * receive the runtime tiered GVWR stand-in.
 */

import { CATALOG_INDEX } from "./rvCatalogIndex.ts";
import {
  findOemFloorplanSpec,
  findOemUvwLbs,
  listOemGvwrPins,
  listOemUvwPins,
  type OemGvwrPinRow,
} from "./floorplanSpecs.ts";
import {
  computeTorqueToWeight,
  estimateUvwFromGvwr,
  estimateUvwFromGvwrDetailed,
  type UvwEstimateHint,
  type UvwEstimateTier,
} from "./torqueToWeight.ts";

export type EstimatedUvwRow = {
  makeIncludes: string;
  modelIncludes: string;
  floorplan: string;
  yearMin: number;
  yearMax: number;
  gvwrLbs: number;
  estimatedUvwLbs: number;
  tier: UvwEstimateTier;
  factor: number;
  thinCcc: boolean;
  rvType: string | null;
  fuelType: string | null;
};

export function siblingBlocked(modelIncludes: string, modelNorm: string): boolean {
  const md = modelIncludes;
  if (md === "vision" && (modelNorm.includes("xl") || modelNorm.includes("se"))) return true;
  if (md === "precept" && modelNorm.includes("prestige")) return true;
  if (
    (md === "seneca" || md === "seneca super c") &&
    (modelNorm.includes("xt") || modelNorm.includes("prestige"))
  ) {
    return true;
  }
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

export function findCatalogMakeModel(
  makeIncludes: string,
  modelIncludes: string,
): {
  make: string;
  model: string;
  spec: { type?: string; fuelType?: string };
} | null {
  const mk = makeIncludes.toLowerCase();
  const md = modelIncludes.toLowerCase();
  let best: { make: string; model: string; spec: { type?: string; fuelType?: string } } | null =
    null;
  let bestScore = -1;
  for (const [make, models] of Object.entries(CATALOG_INDEX)) {
    if (!make.toLowerCase().includes(mk)) continue;
    for (const [model, spec] of Object.entries(models)) {
      const ml = model.toLowerCase();
      if (!ml.includes(md)) continue;
      if (siblingBlocked(md, ml)) continue;
      const score = 1000 - model.length + make.length;
      if (score > bestScore) {
        bestScore = score;
        best = { make, model, spec };
      }
    }
  }
  return best;
}

export function catalogHintForPin(
  makeIncludes: string,
  modelIncludes: string,
): UvwEstimateHint {
  const hit = findCatalogMakeModel(makeIncludes, modelIncludes);
  return {
    rvType: hit?.spec.type ?? null,
    fuelType: hit?.spec.fuelType ?? null,
  };
}

function fpKey(fp: string): string {
  return fp.trim().toUpperCase().replace(/\s+/g, "");
}

function pinHasUvwInYear(pin: OemGvwrPinRow, year: number): boolean {
  for (const uvw of listOemUvwPins()) {
    if (uvw.makeIncludes !== pin.makeIncludes) continue;
    if (uvw.modelIncludes !== pin.modelIncludes) continue;
    if (fpKey(uvw.floorplan) !== fpKey(pin.floorplan)) continue;
    if (year < uvw.yearMin || year > uvw.yearMax) continue;
    return true;
  }
  if (
    findOemUvwLbs(year, pin.makeIncludes, pin.modelIncludes, pin.floorplan) !=
    null
  ) {
    return true;
  }
  const oem = findOemFloorplanSpec(
    year,
    pin.makeIncludes,
    pin.modelIncludes,
    pin.floorplan,
  );
  return oem?.uvwLbs != null && oem.uvwLbs > 0;
}

/** True when a published / pinned UVW covers every year of this GVWR pin. */
export function gvwrPinHasPublishedUvw(pin: OemGvwrPinRow): boolean {
  for (let y = pin.yearMin; y <= pin.yearMax; y++) {
    if (!pinHasUvwInYear(pin, y)) return false;
  }
  return true;
}

function collapseYears(
  years: number[],
): Array<{ yearMin: number; yearMax: number }> {
  if (years.length === 0) return [];
  const sorted = [...years].sort((a, b) => a - b);
  const bands: Array<{ yearMin: number; yearMax: number }> = [];
  let start = sorted[0]!;
  let prev = sorted[0]!;
  for (let i = 1; i < sorted.length; i++) {
    const y = sorted[i]!;
    if (y === prev + 1) {
      prev = y;
      continue;
    }
    bands.push({ yearMin: start, yearMax: prev });
    start = prev = y;
  }
  bands.push({ yearMin: start, yearMax: prev });
  return bands;
}

/**
 * OEM GVWR pin rows (or year-sliced remainders) with no published UVW.
 * These receive the runtime estimate.
 */
export function listEstimatedUvwFromGvwrPins(): EstimatedUvwRow[] {
  const rows: EstimatedUvwRow[] = [];
  for (const pin of listOemGvwrPins()) {
    const openYears: number[] = [];
    for (let y = pin.yearMin; y <= pin.yearMax; y++) {
      if (!pinHasUvwInYear(pin, y)) openYears.push(y);
    }
    if (openYears.length === 0) continue;
    const hint = catalogHintForPin(pin.makeIncludes, pin.modelIncludes);
    const detail = estimateUvwFromGvwrDetailed(pin.gvwrLbs, hint);
    if (detail == null) continue;
    for (const band of collapseYears(openYears)) {
      rows.push({
        makeIncludes: pin.makeIncludes,
        modelIncludes: pin.modelIncludes,
        floorplan: pin.floorplan,
        yearMin: band.yearMin,
        yearMax: band.yearMax,
        gvwrLbs: pin.gvwrLbs,
        estimatedUvwLbs: detail.uvwLbs,
        tier: detail.tier,
        factor: detail.factor,
        thinCcc: detail.thinCcc,
        rvType: hint.rvType ?? null,
        fuelType: hint.fuelType ?? null,
      });
    }
  }
  return rows;
}

export function scoreEstimatedTtw(opts: {
  torqueLbFt: number | null;
  gvwrLbs: number;
  rvType?: string | null;
  chassis?: string | null;
  fuelType?: string | null;
  cccLbs?: number | null;
}): {
  estimatedUvwLbs: number | null;
  score: number | null;
  color: "red" | "yellow" | "green" | null;
  gap: boolean;
  thinCcc: boolean;
  tier: UvwEstimateTier | null;
} {
  const hint: UvwEstimateHint = {
    rvType: opts.rvType,
    chassis: opts.chassis,
    fuelType: opts.fuelType,
    cccLbs: opts.cccLbs,
  };
  const estimatedUvwLbs = estimateUvwFromGvwr(opts.gvwrLbs, hint);
  const ttw = computeTorqueToWeight({
    torqueLbFt: opts.torqueLbFt,
    gvwrLbs: opts.gvwrLbs,
    rvType: opts.rvType ?? "Class A",
    chassis: opts.chassis,
    fuelType: opts.fuelType,
    cccLbs: opts.cccLbs,
  });
  return {
    estimatedUvwLbs,
    score: ttw.score,
    color: ttw.color,
    gap: ttw.gap,
    thinCcc: ttw.thinCcc,
    tier: ttw.uvwEstimateTier,
  };
}

/** Confirm the Family RVing 39RK pin is not replaced by the diesel-pusher estimate. */
export function americanDream39rkPin(): {
  uvwLbs: number | null;
  estimateFrom47000: number | null;
} {
  return {
    uvwLbs: findOemUvwLbs(
      "2022",
      "American Coach",
      "American Dream",
      "39RK",
    ),
    estimateFrom47000: estimateUvwFromGvwr(47_000, {
      rvType: "Class A Diesel",
      chassis: "Spartan",
    }),
  };
}
