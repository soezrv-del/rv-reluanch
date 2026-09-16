import type { McAutocompleteField } from "./types";

/** Personal / free-tier MarketCheck RV: radius ≤ 100 mi, 500 rows/page, 5 RPS, 500 calls/mo. */
export const MC_RADIUS_MIN = 10;
export const MC_RADIUS_MAX = 100;
export const MC_ROWS_DEFAULT = 8;
export const MC_ROWS_SEARCH_MAX = 20;
export const MC_ROWS_DEALERS_MAX = 20;
export const MC_PAGE_MAX = 500;
export const AUTOCOMPLETE_MIN_CHARS = 2;
export const AUTOCOMPLETE_MAX_CHARS = 40;
export const AUTOCOMPLETE_DEBOUNCE_MS = 400;
export const AUTOCOMPLETE_CACHE_TTL_MS = 30 * 60 * 1000;
export const AUTOCOMPLETE_FIELDS = ["make", "model", "city"] as const;

export type AutocompleteField = (typeof AUTOCOMPLETE_FIELDS)[number];

export function clampRadius(raw: unknown, fallback = MC_RADIUS_MAX): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  const base = Number.isFinite(n) && n > 0 ? n : fallback;
  return Math.min(MC_RADIUS_MAX, Math.max(MC_RADIUS_MIN, Math.trunc(base)));
}

export function clampRows(
  raw: unknown,
  max = MC_ROWS_SEARCH_MAX,
  fallback = MC_ROWS_DEFAULT,
): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  const base = Number.isFinite(n) && n > 0 ? n : fallback;
  return Math.min(max, Math.max(1, Math.trunc(base)));
}

/** Pagination offset — free-tier max page is 500 rows. */
export function clampStart(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(MC_PAGE_MAX, Math.trunc(n));
}

export function parseZip5(raw: string | null | undefined): string {
  return String(raw ?? "").replace(/\D/g, "").slice(0, 5);
}

export function isZip5(zip: string): boolean {
  return /^\d{5}$/.test(zip);
}

/** MarketCheck listing / dealer ids — hex + hyphens / dots. Reject path junk. */
export function sanitizeMcId(raw: string | null | undefined): string {
  const s = String(raw ?? "").trim();
  if (!s || s.length > 128) return "";
  if (!/^[A-Za-z0-9._-]+$/.test(s)) return "";
  return s;
}

export function parseAutocompleteField(
  raw: string | null | undefined,
): McAutocompleteField | null {
  const s = String(raw ?? "").trim().toLowerCase();
  return (AUTOCOMPLETE_FIELDS as readonly string[]).includes(s)
    ? (s as McAutocompleteField)
    : null;
}

export function normalizeAutocompleteInput(raw: string | null | undefined): string {
  return String(raw ?? "").trim().replace(/\s+/g, " ").slice(0, AUTOCOMPLETE_MAX_CHARS);
}

export function shouldFetchAutocomplete(input: string): boolean {
  return normalizeAutocompleteInput(input).length >= AUTOCOMPLETE_MIN_CHARS;
}

export function autocompleteCacheKey(opts: {
  field: string;
  input: string;
  make?: string;
}): string {
  const field = String(opts.field || "").trim().toLowerCase();
  const input = normalizeAutocompleteInput(opts.input).toLowerCase();
  const make = String(opts.make ?? "").trim().toLowerCase();
  return `${field}|${input}|${make}`;
}

type CacheEntry<T> = { at: number; data: T };

/** In-memory TTL cache — client autocomplete + server proxies. */
export function createTtlCache<T>(ttlMs: number) {
  const map = new Map<string, CacheEntry<T>>();
  return {
    get(key: string): T | undefined {
      const hit = map.get(key);
      if (!hit) return undefined;
      if (Date.now() - hit.at >= ttlMs) {
        map.delete(key);
        return undefined;
      }
      return hit.data;
    },
    set(key: string, data: T) {
      map.set(key, { at: Date.now(), data });
    },
    hasFresh(key: string): boolean {
      return this.get(key) !== undefined;
    },
    size() {
      return map.size;
    },
    clear() {
      map.clear();
    },
  };
}

export type DebouncedFn<T> = ((...args: T[]) => void) & { cancel: () => void };

/** Debounce so autocomplete does not fire on every keystroke (quota). */
export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  waitMs = AUTOCOMPLETE_DEBOUNCE_MS,
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const wrapped = ((...args: T) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, waitMs);
  }) as DebouncedFn<T>;
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return wrapped;
}
