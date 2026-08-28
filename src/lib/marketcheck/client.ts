import type { McSearchError, McSearchResult } from "./types";

const ZIP_KEY = "rvfax_inventory_zip_v1";

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

export async function fetchLocalInventory(opts: {
  year: number | string;
  make: string;
  model: string;
  zip: string;
  radius?: number;
  rows?: number;
  signal?: AbortSignal;
}): Promise<McSearchResult | McSearchError> {
  const params = new URLSearchParams({
    year: String(opts.year),
    make: opts.make,
    model: opts.model,
    zip: opts.zip.trim(),
    radius: String(opts.radius ?? 250),
    rows: String(opts.rows ?? 8),
  });
  try {
    const res = await fetch(`/api/marketcheck/search?${params}`, {
      signal: opts.signal,
      headers: { Accept: "application/json" },
    });
    const data = (await res.json()) as McSearchResult | McSearchError;
    if (!res.ok && !("ok" in data)) {
      return {
        ok: false,
        error: (data as { error?: string }).error || `HTTP ${res.status}`,
        code: "upstream",
      };
    }
    return data;
  } catch (e) {
    if ((e as Error)?.name === "AbortError") {
      return { ok: false, error: "cancelled", code: "empty" };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Network error",
      code: "upstream",
    };
  }
}
