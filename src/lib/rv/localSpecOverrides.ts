/**
 * Phase 5.3 — dealer/user "Correct this spec" local overrides.
 * Stored on-device; exportable; wins over catalog + Live for hard powertrain
 * on the matching year/make/model/floorplan.
 */

import type { PowertrainCorrection } from "./powertrainCorrections";

const STORAGE_KEY = "rvfax.localSpecOverrides.v1";
const MAX = 300;

export type LocalSpecOverride = {
  id: string;
  year: string;
  make: string;
  model: string;
  floorplan: string;
  engine?: string;
  horsepower?: number;
  torqueLbFt?: number;
  chassis?: string;
  transmission?: string;
  fuelType?: "Diesel" | "Gas" | "Propane" | string;
  note?: string;
  savedAt: string;
  source: "user";
};

type Store = {
  version: 1;
  overrides: LocalSpecOverride[];
};

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function emptyStore(): Store {
  return { version: 1, overrides: [] };
}

function readStore(): Store {
  if (!canUseStorage()) return emptyStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const p = JSON.parse(raw) as Store;
    if (!p || p.version !== 1 || !Array.isArray(p.overrides)) return emptyStore();
    return p;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store) {
  if (!canUseStorage()) return;
  try {
    // Cap size — newest first
    store.overrides = store.overrides
      .sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
      .slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota */
  }
}

function norm(s: string) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchKey(
  o: LocalSpecOverride,
  year: string,
  make: string,
  model: string,
  floorplan?: string,
): boolean {
  if (String(o.year) !== String(year).trim()) return false;
  if (norm(o.make) !== norm(make)) return false;
  if (norm(o.model) !== norm(model)) return false;
  const fp = norm(floorplan || "");
  const ofp = norm(o.floorplan || "");
  // Empty floorplan override matches any; specific matches exact
  if (!ofp) return true;
  return ofp === fp;
}

export function listLocalSpecOverrides(): LocalSpecOverride[] {
  return readStore().overrides.slice();
}

export function findLocalSpecOverride(
  year: string | number,
  make: string,
  model: string,
  floorplan?: string,
): LocalSpecOverride | null {
  const y = String(year).trim();
  const store = readStore();
  // Prefer exact floorplan match over empty
  const hits = store.overrides.filter((o) =>
    matchKey(o, y, make, model, floorplan),
  );
  if (!hits.length) return null;
  hits.sort((a, b) => {
    const af = (a.floorplan || "").length;
    const bf = (b.floorplan || "").length;
    if (bf !== af) return bf - af;
    return Date.parse(b.savedAt) - Date.parse(a.savedAt);
  });
  return hits[0] ?? null;
}

export function saveLocalSpecOverride(
  input: Omit<LocalSpecOverride, "id" | "savedAt" | "source"> & {
    id?: string;
  },
): LocalSpecOverride {
  const store = readStore();
  const id =
    input.id ||
    `${input.year}|${norm(input.make)}|${norm(input.model)}|${norm(input.floorplan || "")}`;
  const entry: LocalSpecOverride = {
    id,
    year: String(input.year).trim(),
    make: input.make.trim(),
    model: input.model.trim(),
    floorplan: (input.floorplan || "").trim(),
    engine: input.engine?.trim() || undefined,
    horsepower:
      input.horsepower != null && input.horsepower > 0
        ? Math.round(input.horsepower)
        : undefined,
    torqueLbFt:
      input.torqueLbFt != null && input.torqueLbFt > 0
        ? Math.round(input.torqueLbFt)
        : undefined,
    chassis: input.chassis?.trim() || undefined,
    transmission: input.transmission?.trim() || undefined,
    fuelType: input.fuelType?.trim() || undefined,
    note: input.note?.trim() || undefined,
    savedAt: new Date().toISOString(),
    source: "user",
  };
  store.overrides = store.overrides.filter((o) => o.id !== id);
  store.overrides.unshift(entry);
  writeStore(store);
  return entry;
}

export function removeLocalSpecOverride(id: string): boolean {
  const store = readStore();
  const before = store.overrides.length;
  store.overrides = store.overrides.filter((o) => o.id !== id);
  writeStore(store);
  return store.overrides.length < before;
}

export function clearLocalSpecOverrides(): number {
  const n = readStore().overrides.length;
  writeStore(emptyStore());
  return n;
}

/** Map to PowertrainCorrection-shaped pin for existing pin pipelines */
export function localOverrideAsPin(
  o: LocalSpecOverride,
): PowertrainCorrection | null {
  if (!o.engine && o.horsepower == null) return null;
  const y = parseInt(o.year, 10) || 2020;
  return {
    yearMin: y,
    yearEnd: y,
    makeIncludes: o.make.toLowerCase(),
    modelIncludes: o.model.toLowerCase(),
    floorplanIncludes: o.floorplan || undefined,
    engine: o.engine || "Corrected engine",
    horsepower: o.horsepower && o.horsepower > 0 ? o.horsepower : 0,
    torqueLbFt: o.torqueLbFt,
    chassis: o.chassis,
    transmission: o.transmission,
    fuelType:
      o.fuelType === "Diesel" || o.fuelType === "Gas" || o.fuelType === "Propane"
        ? o.fuelType
        : undefined,
    note: o.note || "Local user correction",
  };
}

/** JSON export for ops / sharing truth */
export function exportLocalSpecOverridesJson(): string {
  const store = readStore();
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      count: store.overrides.length,
      overrides: store.overrides,
    },
    null,
    2,
  );
}

export function importLocalSpecOverridesJson(raw: string): number {
  const parsed = JSON.parse(raw) as {
    overrides?: LocalSpecOverride[];
  };
  if (!parsed?.overrides?.length) return 0;
  const store = readStore();
  let n = 0;
  for (const o of parsed.overrides) {
    if (!o.year || !o.make || !o.model) continue;
    saveLocalSpecOverride(o);
    n++;
  }
  void store;
  return n;
}
