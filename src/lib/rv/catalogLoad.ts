import type { RVSpec } from "./rvTypes";

export type CatalogModule = {
  RV_DATA: Record<string, Record<string, RVSpec>>;
  MAKES: string[];
};

let loaded: CatalogModule | null = null;
let pending: Promise<CatalogModule> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const fn of listeners) fn();
}

/** Full live catalog, or null until the first successful dynamic import. */
export function peekCatalog(): CatalogModule | null {
  return loaded;
}

export function isCatalogLoaded(): boolean {
  return loaded !== null;
}

export function getRVData(): Record<string, Record<string, RVSpec>> {
  return loaded?.RV_DATA ?? {};
}

/**
 * Load the full live catalog (`rvData.ts`) once. Safe to call from Facts,
 * search, compare, Trips, or Share — the first caller pays the parse.
 * Launchpad / cold start must not import `rvData` statically.
 */
export function ensureCatalogLoaded(): Promise<CatalogModule> {
  if (loaded) return Promise.resolve(loaded);
  pending ??= import("./rvData").then((m) => {
    loaded = { RV_DATA: m.RV_DATA, MAKES: m.MAKES };
    notify();
    return loaded;
  });
  return pending;
}

export function subscribeCatalogLoaded(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

