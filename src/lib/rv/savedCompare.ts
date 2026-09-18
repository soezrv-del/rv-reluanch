/**
 * Facts saved-motorhome compare — client-side only.
 * Reads fields already on the saved unit. Missing → GAP. Never hydrates
 * catalog, live dossier, or market estimates at compare time.
 */

import type { RVSpec } from "./rvTypes.ts";

export const SAVED_COMPARE_MAX = 3;
export const SAVED_COMPARE_GAP = "GAP";

export type SavedCompareIdentity = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
};

export type SavedCompareUnit = SavedCompareIdentity & {
  data?: Partial<RVSpec> | null;
};

export type SavedCompareCell = {
  value: string;
  present: boolean;
};

export type SavedCompareRow = {
  id: string;
  label: string;
  cells: SavedCompareCell[];
};

export type SavedCompareColumn<T extends SavedCompareUnit = SavedCompareUnit> = {
  key: string;
  year: string;
  make: string;
  model: string;
  floorplan: string;
  result: T;
};

export type SavedCompareReport<T extends SavedCompareUnit = SavedCompareUnit> = {
  columns: SavedCompareColumn<T>[];
  rows: SavedCompareRow[];
};

/** Same identity string Facts already uses for a year/make/model/floorplan. */
export function savedCompareKey(r: SavedCompareIdentity): string {
  return `${r.year}|${r.make}|${r.model}|${r.floorplan || ""}`;
}

export function toggleSavedCompare<T extends SavedCompareIdentity>(
  pick: T[],
  unit: T,
): T[] {
  const key = savedCompareKey(unit);
  const idx = pick.findIndex((c) => savedCompareKey(c) === key);
  if (idx >= 0) return pick.filter((_, i) => i !== idx);
  if (pick.length >= SAVED_COMPARE_MAX) return pick;
  return [...pick, unit];
}

export function removeSavedCompare<T extends SavedCompareIdentity>(
  pick: T[],
  unit: T,
): T[] {
  const key = savedCompareKey(unit);
  return pick.filter((c) => savedCompareKey(c) !== key);
}

export function clearSavedCompare<T = SavedCompareIdentity>(): T[] {
  return [];
}

export function isSavedCompareSelected(
  pick: SavedCompareIdentity[],
  unit: SavedCompareIdentity,
): boolean {
  const key = savedCompareKey(unit);
  return pick.some((c) => savedCompareKey(c) === key);
}

export function canOpenSavedCompare(pick: { length: number }): boolean {
  return pick.length >= 2 && pick.length <= SAVED_COMPARE_MAX;
}

export function capSavedCompareItems<T extends SavedCompareIdentity>(
  items: T[],
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of items) {
    const k = savedCompareKey(r);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
    if (out.length >= SAVED_COMPARE_MAX) break;
  }
  return out;
}

function blank(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === "number") return !Number.isFinite(v);
  const s = String(v).trim();
  return !s || s === "—" || s === "–" || s === "-" || /^gap$/i.test(s);
}

function presentText(v: unknown): string | null {
  if (blank(v)) return null;
  return String(v).trim();
}

function positiveNumber(n: unknown): number | null {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  return n;
}

function formatUsd(n: number): string {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

function formatLbs(n: number): string {
  return `${n.toLocaleString("en-US")} lbs`;
}

/** Length from saved overall inches or saved lengthRange only. */
export function savedCompareLength(
  data: Partial<RVSpec> | null | undefined,
): string | null {
  if (!data) return null;
  const inches = positiveNumber(data.overallLengthIn);
  if (inches != null) {
    const ft = Math.round((inches / 12) * 10) / 10;
    return `${ft} ft`;
  }
  const range = data.lengthRange;
  if (!Array.isArray(range) || range.length < 2) return null;
  const a = positiveNumber(range[0]);
  const b = positiveNumber(range[1]);
  if (a != null && b != null) return a === b ? `${a} ft` : `${a}–${b} ft`;
  if (a != null) return `${a} ft`;
  if (b != null) return `${b} ft`;
  return null;
}

/** GVWR only — never weightRange (that is not GVWR). */
export function savedCompareGvwr(
  data: Partial<RVSpec> | null | undefined,
): string | null {
  const n = positiveNumber(data?.gvwrLbs);
  return n != null ? formatLbs(n) : null;
}

export function savedComparePrice(
  data: Partial<RVSpec> | null | undefined,
): string | null {
  const range = data?.msrpRange;
  if (!Array.isArray(range) || range.length < 2) return null;
  const lo = positiveNumber(range[0]);
  const hi = positiveNumber(range[1]);
  if (lo != null && hi != null) {
    return lo === hi ? formatUsd(lo) : `${formatUsd(lo)}–${formatUsd(hi)}`;
  }
  if (lo != null) return formatUsd(lo);
  if (hi != null) return formatUsd(hi);
  return null;
}

function cell(value: string | null): SavedCompareCell {
  return value
    ? { value, present: true }
    : { value: SAVED_COMPARE_GAP, present: false };
}

type FieldReader = (r: SavedCompareUnit) => string | null;

const KEY_FIELDS: { id: string; label: string; read: FieldReader }[] = [
  { id: "year", label: "Year", read: (r) => presentText(r.year) },
  { id: "make", label: "Make", read: (r) => presentText(r.make) },
  { id: "model", label: "Model", read: (r) => presentText(r.model) },
  { id: "length", label: "Length", read: (r) => savedCompareLength(r.data) },
  { id: "gvwr", label: "GVWR", read: (r) => savedCompareGvwr(r.data) },
  { id: "engine", label: "Engine", read: (r) => presentText(r.data?.engine) },
  { id: "chassis", label: "Chassis", read: (r) => presentText(r.data?.chassis) },
  { id: "price", label: "Price", read: (r) => savedComparePrice(r.data) },
];

const EXTRA_FIELDS: { id: string; label: string; read: FieldReader }[] = [
  { id: "floorplan", label: "Floorplan", read: (r) => presentText(r.floorplan) },
  { id: "type", label: "Type", read: (r) => presentText(r.data?.type) },
  { id: "fuel", label: "Fuel", read: (r) => presentText(r.data?.fuelType) },
  {
    id: "hp",
    label: "Horsepower",
    read: (r) => {
      const n = positiveNumber(r.data?.horsepower);
      return n != null ? `${n} HP` : null;
    },
  },
  {
    id: "uvw",
    label: "UVW",
    read: (r) => {
      const n = positiveNumber(r.data?.uvwLbs);
      return n != null ? formatLbs(n) : null;
    },
  },
  {
    id: "sleeps",
    label: "Sleeps",
    read: (r) => {
      const n = positiveNumber(r.data?.sleeps);
      return n != null ? String(n) : null;
    },
  },
  {
    id: "slides",
    label: "Slideouts",
    read: (r) => {
      const n = r.data?.slideouts;
      if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return null;
      return String(n);
    },
  },
  {
    id: "transmission",
    label: "Transmission",
    read: (r) => presentText(r.data?.transmission),
  },
];

function rowFromField(
  field: { id: string; label: string; read: FieldReader },
  cols: SavedCompareUnit[],
): SavedCompareRow {
  return {
    id: field.id,
    label: field.label,
    cells: cols.map((r) => cell(field.read(r))),
  };
}

/** Side-by-side matrix from saved objects only. Missing cells are GAP. */
export function buildSavedCompareReport<T extends SavedCompareUnit>(
  items: T[],
): SavedCompareReport<T> {
  const cols = capSavedCompareItems(items);
  const columns: SavedCompareColumn<T>[] = cols.map((r) => ({
    key: savedCompareKey(r),
    year: r.year,
    make: r.make,
    model: r.model,
    floorplan: r.floorplan || "",
    result: r,
  }));

  const keyRows = KEY_FIELDS.map((field) => rowFromField(field, cols));
  const extraRows = EXTRA_FIELDS.map((field) =>
    rowFromField(field, cols),
  ).filter((row) => row.cells.some((c) => c.present));

  return { columns, rows: [...keyRows, ...extraRows] };
}
