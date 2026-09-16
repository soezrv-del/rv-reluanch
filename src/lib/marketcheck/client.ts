import type {
  McAutocompleteField,
  McAutocompleteResult,
  McDealersResult,
  McListingResult,
  McSearchError,
  McSearchResult,
} from "./types";
import {
  AUTOCOMPLETE_CACHE_TTL_MS,
  autocompleteCacheKey,
  clampRadius,
  createTtlCache,
  isZip5,
  parseZip5,
  sanitizeMcId,
  shouldFetchAutocomplete,
} from "./guards";
import { DEFAULT_YEAR_PAD, inventoryYearQuery } from "./yearRange";

const ZIP_KEY = "rvfax_inventory_zip_v1";

const acCache = createTtlCache<McAutocompleteResult>(AUTOCOMPLETE_CACHE_TTL_MS);
const acInflight = new Map<string, Promise<McAutocompleteResult | McSearchError>>();
const listingCache = createTtlCache<McListingResult>(12 * 60 * 60 * 1000);
const listingInflight = new Map<string, Promise<McListingResult | McSearchError>>();

export function loadInventoryZip(): string {
  try {
    return localStorage.getItem(ZIP_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

export function saveInventoryZip(zip: string) {
  try {
    localStorage.setItem(ZIP_KEY, zip.trim());
  } catch {
    /* */
  }
}

async function readMcJson<T extends { ok: true }>(
  res: Response,
): Promise<T | McSearchError> {
  const data = (await res.json()) as T | McSearchError;
  if (!res.ok && !("ok" in data)) {
    return {
      ok: false,
      error: (data as { error?: string }).error || `HTTP ${res.status}`,
      code: "upstream",
    };
  }
  return data;
}

function aborted(): McSearchError {
  return { ok: false, error: "cancelled", code: "empty" };
}

function networkErr(e: unknown): McSearchError {
  return {
    ok: false,
    error: e instanceof Error ? e.message : "Network error",
    code: "upstream",
  };
}

export async function fetchLocalInventory(opts: {
  year: number | string;
  make: string;
  model: string;
  zip: string;
  radius?: number;
  rows?: number;
  /** Years on either side of `year`. Default 2. Ignored when min/max are set. */
  yearPad?: number;
  yearMin?: number | string;
  yearMax?: number | string;
  /** Scope to one lot after `/v2/dealers/rv`. Uses existing active search. */
  dealerId?: string;
  /** When true + dealerId, omit make/model to list that lot's full inventory. */
  allDealerInventory?: boolean;
  signal?: AbortSignal;
}): Promise<McSearchResult | McSearchError> {
  const years = inventoryYearQuery({
    year: opts.year,
    yearPad: opts.yearPad ?? DEFAULT_YEAR_PAD,
    yearMin: opts.yearMin,
    yearMax: opts.yearMax,
  });
  const dealerId = sanitizeMcId(opts.dealerId);
  const params = new URLSearchParams({
    year: years.year,
    year_range: years.year_range,
    zip: parseZip5(opts.zip),
    // Server / personal plans cap radius at 100 mi — never advertise more.
    radius: String(clampRadius(opts.radius)),
    rows: String(opts.rows ?? 8),
  });
  if (!opts.allDealerInventory) {
    params.set("make", opts.make);
    params.set("model", opts.model);
  } else if (opts.make && opts.model) {
    /* lot-wide: year_range + dealer_id only */
  }
  if (dealerId) params.set("dealer_id", dealerId);
  try {
    const res = await fetch(`/api/marketcheck/search?${params}`, {
      signal: opts.signal,
      headers: { Accept: "application/json" },
    });
    return await readMcJson<McSearchResult>(res);
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return aborted();
    return networkErr(e);
  }
}

/**
 * Cheap make/model/city suggestions. Caller must debounce (400ms).
 * Cached + coalesced so repeat keystrokes do not hit the proxy.
 */
export async function fetchAutocomplete(opts: {
  field: McAutocompleteField;
  input: string;
  make?: string;
  signal?: AbortSignal;
}): Promise<McAutocompleteResult | McSearchError> {
  const input = opts.input.trim();
  if (!shouldFetchAutocomplete(input)) {
    return {
      ok: true,
      field: opts.field,
      input,
      terms: [],
      cached: true,
    };
  }
  const key = autocompleteCacheKey({
    field: opts.field,
    input,
    make: opts.make,
  });
  const hit = acCache.get(key);
  if (hit) return { ...hit, cached: true };

  const existing = acInflight.get(key);
  if (existing) return existing;

  const run = (async () => {
    const params = new URLSearchParams({
      field: opts.field,
      input,
    });
    if (opts.field === "model" && opts.make) params.set("make", opts.make);
    try {
      const res = await fetch(`/api/marketcheck/autocomplete?${params}`, {
        signal: opts.signal,
        headers: { Accept: "application/json" },
      });
      const data = await readMcJson<McAutocompleteResult>(res);
      if (data.ok) acCache.set(key, data);
      return data;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return aborted();
      return networkErr(e);
    } finally {
      acInflight.delete(key);
    }
  })();

  acInflight.set(key, run);
  return run;
}

/** Nearby RV lots. Then load inventory via fetchLocalInventory({ dealerId }). */
export async function fetchNearbyDealers(opts: {
  zip: string;
  radius?: number;
  rows?: number;
  signal?: AbortSignal;
}): Promise<McDealersResult | McSearchError> {
  const zip = parseZip5(opts.zip);
  if (!isZip5(zip)) {
    return { ok: false, error: "Enter a 5-digit ZIP", code: "bad_request" };
  }
  const params = new URLSearchParams({
    zip,
    radius: String(clampRadius(opts.radius)),
    rows: String(opts.rows ?? 8),
  });
  try {
    const res = await fetch(`/api/marketcheck/dealers?${params}`, {
      signal: opts.signal,
      headers: { Accept: "application/json" },
    });
    return await readMcJson<McDealersResult>(res);
  } catch (e) {
    if ((e as Error)?.name === "AbortError") return aborted();
    return networkErr(e);
  }
}

/**
 * Full listing — ONLY when the user opens a shortlisted card.
 * Never call in a search-results map/loop.
 */
export async function fetchListingDetail(opts: {
  listingId: string;
  signal?: AbortSignal;
}): Promise<McListingResult | McSearchError> {
  const id = sanitizeMcId(opts.listingId);
  if (!id) {
    return { ok: false, error: "listing id is required", code: "bad_request" };
  }
  const hit = listingCache.get(id);
  if (hit) return { ...hit, cached: true };

  const existing = listingInflight.get(id);
  if (existing) return existing;

  const run = (async () => {
    try {
      const res = await fetch(
        `/api/marketcheck/listing?id=${encodeURIComponent(id)}`,
        {
          signal: opts.signal,
          headers: { Accept: "application/json" },
        },
      );
      const data = await readMcJson<McListingResult>(res);
      if (data.ok) listingCache.set(id, data);
      return data;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return aborted();
      return networkErr(e);
    } finally {
      listingInflight.delete(id);
    }
  })();

  listingInflight.set(id, run);
  return run;
}
