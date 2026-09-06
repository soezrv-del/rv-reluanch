/** Year-aware trim helpers for RvTow. Does not edit the OEM table. */

import {
  getRating,
  getTrims,
  type TowTrim,
} from "./towVehicles.ts";

export const DEFAULT_TOW_YEAR = "2024";
export const DEFAULT_TOW_MAKE = "Ford";
export const DEFAULT_TOW_MODEL = "F-350 Super Duty";

/** Broken first-paint string from the pre-fix default — never restore it. */
export const LEGACY_FAKE_TOW_TRIM = "XL — 6.7L Power Stroke Diesel (SRW)";

export type TowYearSpan = { start: number; end: number };

const YEAR_SPAN_RE =
  /\((\d{4})(?:\s*[–-]\s*(\d{4}))?[^)]*\)\s*$/;

export function parseTrimYears(label: string): TowYearSpan | null {
  const m = YEAR_SPAN_RE.exec(label);
  if (!m) return null;
  const start = Number(m[1]);
  const end = m[2] ? Number(m[2]) : start;
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  return start <= end ? { start, end } : { start: end, end: start };
}

export function formatTrimYearRange(label: string): string | undefined {
  const span = parseTrimYears(label);
  if (!span) return undefined;
  return span.start === span.end
    ? String(span.start)
    : `${span.start}–${span.end}`;
}

/** Strip the trailing `(2018–2021)` / `(2018 last year)` year note. */
export function trimStem(label: string): string {
  return label.replace(YEAR_SPAN_RE, "").trim();
}

export function parseTowYear(year: string | number | null | undefined): number | null {
  if (year === "" || year == null) return null;
  const n = typeof year === "number" ? year : parseInt(String(year).trim(), 10);
  return Number.isFinite(n) && n >= 1900 && n <= 2100 ? n : null;
}

export function trimCoversYear(
  label: string,
  year: string | number | null | undefined,
): boolean {
  const y = parseTowYear(year);
  if (y == null) return true;
  const span = parseTrimYears(label);
  if (!span) return false;
  return y >= span.start && y <= span.end;
}

/**
 * When the model has year-banded rows, keep only rows that cover `year`.
 * Unlabeled “current” rows are hidden so they don’t shadow the year-specific
 * rating. Models with no year notes stay unfiltered (we don’t invent years).
 * Empty year → all rows.
 */
export function filterTrimsForYear(
  trims: TowTrim[],
  year: string | number | null | undefined,
): TowTrim[] {
  if (!trims.length) return [];
  const y = parseTowYear(year);
  if (y == null) return trims;

  const tagged = trims.filter((t) => parseTrimYears(t.label));
  if (!tagged.length) return trims;

  return tagged.filter((t) => trimCoversYear(t.label, y));
}

export function getTrimsForYear(
  make: string,
  model: string,
  year: string | number | null | undefined,
): TowTrim[] {
  if (!make || !model) return [];
  return filterTrimsForYear(getTrims(make, model), year);
}

export function isCatalogTrimForYear(
  make: string,
  model: string,
  trim: string,
  year: string | number | null | undefined,
): boolean {
  if (!make || !model || !trim) return false;
  return getTrimsForYear(make, model, year).some((t) => t.label === trim);
}

/**
 * Keep the same powertrain/config when Year changes.
 * Exact label wins; else same stem (year note stripped). No SRW→DRW guesses.
 */
export function pickSuccessorTrim(
  currentLabel: string,
  nextTrims: TowTrim[],
): TowTrim | undefined {
  if (!nextTrims.length) return undefined;
  if (!currentLabel) return undefined;
  const exact = nextTrims.find((t) => t.label === currentLabel);
  if (exact) return exact;
  const stem = trimStem(currentLabel);
  if (!stem) return undefined;
  return nextTrims.find((t) => trimStem(t.label) === stem);
}

export type DefaultTowVehicle = {
  year: string;
  make: string;
  model: string;
  trim: string;
};

/**
 * Lot-desk sample: a real 2024-catalog Super Duty, not an invented XL diesel.
 * Resolves from the table so Reset cannot drift back to a fake label.
 */
export function resolveDefaultTowVehicle(): DefaultTowVehicle {
  const year = DEFAULT_TOW_YEAR;
  const make = DEFAULT_TOW_MAKE;
  const model = DEFAULT_TOW_MODEL;
  const trims = getTrimsForYear(make, model, year);
  const preferred =
    trims.find(
      (t) => /Lariat SRW/i.test(t.label) && /Power Stroke/i.test(t.label),
    ) ??
    trims.find((t) => /SRW/i.test(t.label)) ??
    trims[0];

  return {
    year,
    make,
    model,
    trim: preferred?.label ?? "",
  };
}

export const DEFAULT_TOW_VEHICLE = resolveDefaultTowVehicle();

export function defaultTowRating() {
  const d = DEFAULT_TOW_VEHICLE;
  if (!d.trim) return null;
  return getRating(d.make, d.model, d.trim);
}
