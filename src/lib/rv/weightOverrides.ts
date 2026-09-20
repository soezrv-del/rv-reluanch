/**
 * Salesman-device UVW / GVWR overrides for Facts Ratings TTW.
 * Keyed by year + make + model + floorplan. localStorage is fine on
 * the lot tablet — these are labeled overrides, not catalog pins.
 */

const STORAGE_KEY = "rvfax.weightOverrides.v1";
const MAX = 400;

export type WeightOverride = {
  id: string;
  year: string;
  make: string;
  model: string;
  floorplan: string;
  uvwLbs?: number;
  gvwrLbs?: number;
  savedAt: string;
  source: "user";
};

type Store = {
  version: 1;
  overrides: WeightOverride[];
};

let memoryStore: Store = emptyStore();

function emptyStore(): Store {
  return { version: 1, overrides: [] };
}

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function readStore(): Store {
  if (!canUseStorage()) return memoryStore;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryStore;
    const p = JSON.parse(raw) as Store;
    if (!p || p.version !== 1 || !Array.isArray(p.overrides)) return emptyStore();
    memoryStore = p;
    return p;
  } catch {
    return memoryStore;
  }
}

function writeStore(store: Store) {
  store.overrides = store.overrides
    .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
    .slice(0, MAX);
  memoryStore = store;
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

export function weightOverrideId(
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): string {
  return `${String(year).trim()}|${norm(make)}|${norm(model)}|${norm(floorplan || "")}`;
}

function positiveLbs(n: number | null | undefined): number | undefined {
  if (n == null || !Number.isFinite(n) || n <= 0) return undefined;
  return Math.round(n);
}

export function findWeightOverride(
  year: string | number,
  make: string,
  model: string,
  floorplan?: string,
): WeightOverride | null {
  const id = weightOverrideId(year, make, model, floorplan || "");
  return readStore().overrides.find((o) => o.id === id) ?? null;
}

export function saveWeightOverride(input: {
  year: string | number;
  make: string;
  model: string;
  floorplan: string;
  uvwLbs?: number | null;
  gvwrLbs?: number | null;
}): WeightOverride | null {
  const year = String(input.year).trim();
  const make = input.make.trim();
  const model = input.model.trim();
  const floorplan = (input.floorplan || "").trim();
  if (!year || !make || !model || !floorplan) return null;

  const prev = findWeightOverride(year, make, model, floorplan);
  const uvwLbs =
    input.uvwLbs === undefined ? prev?.uvwLbs : positiveLbs(input.uvwLbs);
  const gvwrLbs =
    input.gvwrLbs === undefined ? prev?.gvwrLbs : positiveLbs(input.gvwrLbs);

  if (uvwLbs == null && gvwrLbs == null) {
    removeWeightOverride(year, make, model, floorplan);
    return null;
  }

  const id = weightOverrideId(year, make, model, floorplan);
  const entry: WeightOverride = {
    id,
    year,
    make,
    model,
    floorplan,
    uvwLbs,
    gvwrLbs,
    savedAt: new Date().toISOString(),
    source: "user",
  };
  const store = readStore();
  store.overrides = store.overrides.filter((o) => o.id !== id);
  store.overrides.unshift(entry);
  writeStore(store);
  return entry;
}

export function clearWeightField(
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
  field: "uvwLbs" | "gvwrLbs",
): WeightOverride | null {
  return saveWeightOverride({
    year,
    make,
    model,
    floorplan,
    [field]: null,
  });
}

export function removeWeightOverride(
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): boolean {
  const id = weightOverrideId(year, make, model, floorplan);
  const store = readStore();
  const before = store.overrides.length;
  store.overrides = store.overrides.filter((o) => o.id !== id);
  writeStore(store);
  return store.overrides.length < before;
}

/** Test helper — wipe memory + storage. */
export function clearWeightOverrides(): number {
  const n = readStore().overrides.length;
  writeStore(emptyStore());
  if (canUseStorage()) {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  return n;
}
