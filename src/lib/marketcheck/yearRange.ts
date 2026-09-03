/** MarketCheck RV `year_range` is inclusive `min-max`. Docs default lower bound is 1981. */
export const YEAR_MIN = 1981;

export const DEFAULT_YEAR_PAD = 2;

/** Ignore placeholder / junk asking prices when computing a median. */
export const MIN_MEDIAN_PRICE = 1000;

export type YearRange = { min: number; max: number };

export function yearMaxBound(now = new Date()): number {
  return now.getFullYear() + 1;
}

export function clampYear(year: number, now = new Date()): number {
  if (!Number.isFinite(year)) return YEAR_MIN;
  return Math.min(yearMaxBound(now), Math.max(YEAR_MIN, Math.trunc(year)));
}

export function parseFourDigitYear(
  raw: string | number | null | undefined,
): number | null {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  if (!/^\d{4}$/.test(s)) return null;
  return Number(s);
}

export function formatYearRange(range: YearRange): string {
  return `${range.min}-${range.max}`;
}

export function parseYearRangeString(raw: string): YearRange | null {
  const m = raw.trim().match(/^(\d{4})-(\d{4})$/);
  if (!m) return null;
  const min = Number(m[1]);
  const max = Number(m[2]);
  if (min > max) return null;
  return { min: clampYear(min), max: clampYear(max) };
}

export function yearRangeFromCenter(
  year: number,
  pad = DEFAULT_YEAR_PAD,
  now = new Date(),
): YearRange {
  const y = clampYear(year, now);
  const p = Number.isFinite(pad) ? Math.max(0, Math.min(20, Math.trunc(pad))) : DEFAULT_YEAR_PAD;
  return {
    min: clampYear(y - p, now),
    max: clampYear(y + p, now),
  };
}

export type ResolvedYears =
  | { ok: true; year: string | null; range: YearRange; useRange: boolean }
  | { ok: false; error: string };

/**
 * Resolve proxy year filters.
 * Range params win: `year_range` or `year_min`+`year_max` → send `year_range`
 * to MarketCheck and do not also send `year`. A lone `year` stays exact-year.
 */
export function resolveSearchYears(params: {
  year?: string | null;
  yearRange?: string | null;
  yearMin?: string | null;
  yearMax?: string | null;
}): ResolvedYears {
  const rangeRaw = params.yearRange?.trim() || "";
  const minRaw = params.yearMin?.trim() || "";
  const maxRaw = params.yearMax?.trim() || "";
  const yearRaw = params.year?.trim() || "";
  const coachYear = parseFourDigitYear(yearRaw);

  if (rangeRaw) {
    const parsed = parseYearRangeString(rangeRaw);
    if (!parsed) {
      return {
        ok: false,
        error: "year_range must be YYYY-YYYY with min ≤ max",
      };
    }
    return {
      ok: true,
      year: coachYear != null ? String(clampYear(coachYear)) : null,
      range: parsed,
      useRange: true,
    };
  }

  if (minRaw || maxRaw) {
    const min = parseFourDigitYear(minRaw);
    const max = parseFourDigitYear(maxRaw);
    if (min == null || max == null || min > max) {
      return {
        ok: false,
        error: "year_min and year_max must be 4-digit years with min ≤ max",
      };
    }
    return {
      ok: true,
      year: coachYear != null ? String(clampYear(coachYear)) : null,
      range: { min: clampYear(min), max: clampYear(max) },
      useRange: true,
    };
  }

  if (yearRaw) {
    if (coachYear == null) {
      return { ok: false, error: "year must be a 4-digit year" };
    }
    const cy = clampYear(coachYear);
    return {
      ok: true,
      year: String(cy),
      range: { min: cy, max: cy },
      useRange: false,
    };
  }

  return { ok: false, error: "year or year_range is required" };
}

/** Client helper: coach year ± pad, or an explicit window. */
export function inventoryYearQuery(opts: {
  year: number | string;
  yearPad?: number;
  yearMin?: number | string;
  yearMax?: number | string;
}): { year: string; yearRange: YearRange; year_range: string } {
  const parsedYear = parseFourDigitYear(opts.year);
  const year = parsedYear != null ? clampYear(parsedYear) : YEAR_MIN;

  if (opts.yearMin != null && opts.yearMax != null) {
    const resolved = resolveSearchYears({
      year: String(year),
      yearMin: String(opts.yearMin),
      yearMax: String(opts.yearMax),
    });
    if (resolved.ok) {
      return {
        year: String(year),
        yearRange: resolved.range,
        year_range: formatYearRange(resolved.range),
      };
    }
  }

  const range = yearRangeFromCenter(year, opts.yearPad ?? DEFAULT_YEAR_PAD);
  return {
    year: String(year),
    yearRange: range,
    year_range: formatYearRange(range),
  };
}

export function medianListingPrice(
  prices: Array<number | null | undefined>,
): number | null {
  const clean = prices
    .filter(
      (p): p is number =>
        typeof p === "number" && Number.isFinite(p) && p >= MIN_MEDIAN_PRICE,
    )
    .sort((a, b) => a - b);
  if (!clean.length) return null;
  const mid = Math.floor(clean.length / 2);
  return clean.length % 2
    ? clean[mid]!
    : Math.round((clean[mid - 1]! + clean[mid]!) / 2);
}
