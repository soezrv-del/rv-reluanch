/**
 * Device-local last tow vehicle. Truck/SUV only — never a coach, never dims.
 * Reopen Tow restores this so the calculator is not a one-off.
 */

import {
  DEFAULT_TOW_VEHICLE,
  LEGACY_FAKE_TOW_TRIM,
  pickSuccessorTrim,
  getTrimsForYear,
} from "./towYear.ts";

export const SAVED_TOW_VEHICLE_KEY = "rvfax_tow_vehicle_v1";

export type TowKindFilter = "all" | "truck" | "suv";

export type SavedTowVehicle = {
  year: string;
  make: string;
  model: string;
  trim: string;
  kindFilter: TowKindFilter;
  bed: string;
  /** Trailer side of the last match — not a Trips coach. */
  rvType: string;
  gvwr: string;
  pin: string;
  manualMaxTow: string;
  manualPayload: string;
  manualGcwr: string;
  savedAt: string;
};

const KINDS = new Set<TowKindFilter>(["all", "truck", "suv"]);

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function digits(v: unknown): string {
  return clean(v).replace(/\D/g, "");
}

/** Enough identity to restore a truck/SUV. Empty / coach-only rows are dropped. */
export function normalizeSavedTowVehicle(
  raw: Partial<SavedTowVehicle> | null | undefined,
): SavedTowVehicle | null {
  if (!raw) return null;
  const make = clean(raw.make);
  const model = clean(raw.model);
  if (!make || !model) return null;

  let trim = clean(raw.trim);
  if (trim === LEGACY_FAKE_TOW_TRIM) {
    const year = clean(raw.year) || DEFAULT_TOW_VEHICLE.year;
    const next = getTrimsForYear(make, model, year);
    trim = pickSuccessorTrim(trim, next)?.label ?? "";
  }

  const kind = clean(raw.kindFilter);
  const kindFilter: TowKindFilter = KINDS.has(kind as TowKindFilter)
    ? (kind as TowKindFilter)
    : "all";

  return {
    year: clean(raw.year),
    make,
    model,
    trim,
    kindFilter,
    bed: clean(raw.bed) || "6.5 ft (Standard Bed)",
    rvType: clean(raw.rvType) || "Travel Trailer",
    gvwr: digits(raw.gvwr),
    pin: digits(raw.pin),
    manualMaxTow: digits(raw.manualMaxTow),
    manualPayload: digits(raw.manualPayload),
    manualGcwr: digits(raw.manualGcwr),
    savedAt:
      typeof raw.savedAt === "string" && raw.savedAt
        ? raw.savedAt
        : new Date().toISOString(),
  };
}

export function loadLastTowVehicle(): SavedTowVehicle | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(SAVED_TOW_VEHICLE_KEY);
    if (!raw) return null;
    return normalizeSavedTowVehicle(JSON.parse(raw) as Partial<SavedTowVehicle>);
  } catch {
    return null;
  }
}

export function saveLastTowVehicle(
  input: Partial<SavedTowVehicle>,
): SavedTowVehicle | null {
  const next = normalizeSavedTowVehicle({
    ...input,
    savedAt: new Date().toISOString(),
  });
  if (!next || !canUseStorage()) return next;
  try {
    localStorage.setItem(SAVED_TOW_VEHICLE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}

export function clearLastTowVehicle(): void {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(SAVED_TOW_VEHICLE_KEY);
  } catch {
    /* */
  }
}

export function formatSavedTowVehicle(
  v: Pick<SavedTowVehicle, "year" | "make" | "model" | "trim">,
): string {
  const core = [v.year, v.make, v.model].filter(Boolean).join(" ");
  return v.trim ? `${core} · ${v.trim}` : core;
}

export function sameTowVehicle(
  a: Pick<SavedTowVehicle, "year" | "make" | "model" | "trim">,
  b: Pick<SavedTowVehicle, "year" | "make" | "model" | "trim">,
): boolean {
  return (
    a.year === b.year &&
    a.make === b.make &&
    a.model === b.model &&
    a.trim === b.trim
  );
}
