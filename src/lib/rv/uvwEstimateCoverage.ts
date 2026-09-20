/**
 * Coverage helpers for catalog-wide UVW estimates.
 * Pins / published UVW stay untouched; this only classifies paths that
 * receive the runtime GVWR×0.835 stand-in.
 */

import {
  findOemFloorplanSpec,
  findOemUvwLbs,
  listOemGvwrPins,
  listOemUvwPins,
  type OemGvwrPinRow,
} from "./floorplanSpecs";
import {
  computeTorqueToWeight,
  estimateUvwFromGvwr,
} from "./torqueToWeight";

export type EstimatedUvwRow = {
  makeIncludes: string;
  modelIncludes: string;
  floorplan: string;
  yearMin: number;
  yearMax: number;
  gvwrLbs: number;
  estimatedUvwLbs: number;
};

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
    const estimatedUvwLbs = estimateUvwFromGvwr(pin.gvwrLbs);
    if (estimatedUvwLbs == null) continue;
    for (const band of collapseYears(openYears)) {
      rows.push({
        makeIncludes: pin.makeIncludes,
        modelIncludes: pin.modelIncludes,
        floorplan: pin.floorplan,
        yearMin: band.yearMin,
        yearMax: band.yearMax,
        gvwrLbs: pin.gvwrLbs,
        estimatedUvwLbs,
      });
    }
  }
  return rows;
}

export function scoreEstimatedTtw(opts: {
  torqueLbFt: number | null;
  gvwrLbs: number;
  rvType?: string | null;
}): {
  estimatedUvwLbs: number | null;
  score: number | null;
  color: "red" | "yellow" | "green" | null;
  gap: boolean;
} {
  const estimatedUvwLbs = estimateUvwFromGvwr(opts.gvwrLbs);
  const ttw = computeTorqueToWeight({
    torqueLbFt: opts.torqueLbFt,
    gvwrLbs: opts.gvwrLbs,
    rvType: opts.rvType ?? "Class A",
  });
  return {
    estimatedUvwLbs,
    score: ttw.score,
    color: ttw.color,
    gap: ttw.gap,
  };
}

/** Confirm the Family RVing 39RK pin is not replaced by the 0.835 estimate. */
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
    estimateFrom47000: estimateUvwFromGvwr(47_000),
  };
}
