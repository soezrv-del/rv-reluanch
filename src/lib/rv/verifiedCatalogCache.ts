/**
 * Verified catalog cache — learns from successful Live Grok dossiers.
 *
 * Phase 4 rules:
 * 4.1 Save only after pin + validation (bad powertrain never stored)
 * 4.2 Never keep powertrain that conflicts with pin; pin always reapplied on read
 * 4.3 clearVerifiedDossier / clearAll — user can bust a bad entry
 * 4.4 CACHE_SCHEMA_VERSION bumps invalidate old bad dossiers
 *
 * Static rvData.ts stays as the dropdown index + first paint.
 * This is NOT Grok model training — local "learned brochure" layer only.
 * Models (Grok, Gemini, or demo) NEVER persist engine / HP / chassis /
 * transmission / fuel. Pin stamps brochure truth; otherwise hard fields are
 * stripped on save and on read.
 */

import type { LiveDossier } from "./liveDossier";
import { dossierCacheKey } from "./liveDossier";
import {
  findPowertrainCorrection,
  powertrainConflictsWithPin,
  sanitizeFeaturesForPin,
  sanitizeNarrativeForPin,
  type PowertrainCorrection,
} from "./powertrainCorrections";
import { validateLivePowertrain } from "./livePowertrainGuard";

/**
 * Bump when pins, validators, or merge rules change so stale localStorage
 * entries are ignored (Phase 4.4).
 */
export const VERIFIED_CACHE_SCHEMA = 9;
const STORAGE_KEY = `rvfax.verifiedCatalog.v${VERIFIED_CACHE_SCHEMA}`;
/** Legacy keys to wipe on load so old bad dossiers cannot resurface */
const LEGACY_STORAGE_KEYS = [
  "rvfax.verifiedCatalog.v1",
  "rvfax.verifiedCatalog.v2",
  "rvfax.verifiedCatalog.v3",
  "rvfax.verifiedCatalog.v4",
  "rvfax.verifiedCatalog.v5",
  "rvfax.verifiedCatalog.v6",
  "rvfax.verifiedCatalog.v7",
  "rvfax.verifiedCatalog.v8",
];
const MAX_ENTRIES = 200;
/** 14 days — re-verify sooner after rule changes */
const TTL_MS = 14 * 24 * 60 * 60 * 1000;

export type VerifiedEntry = {
  key: string;
  year: string;
  make: string;
  model: string;
  floorplan: string;
  dossier: LiveDossier;
  savedAt: string;
  hits: number;
  /** Schema at save time */
  schema: number;
  /** True if hard powertrain was pin-locked when saved */
  powertrainPinned?: boolean;
  /** True if hard powertrain passed Phase 2 validators when saved */
  powertrainValidated?: boolean;
};

type Store = {
  version: typeof VERIFIED_CACHE_SCHEMA;
  entries: Record<string, VerifiedEntry>;
};

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function purgeLegacyKeys() {
  if (!canUseStorage()) return;
  for (const k of LEGACY_STORAGE_KEYS) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* */
    }
  }
}

function emptyStore(): Store {
  return { version: VERIFIED_CACHE_SCHEMA, entries: {} };
}

function readStore(): Store {
  if (!canUseStorage()) return emptyStore();
  purgeLegacyKeys();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    if (
      !parsed ||
      parsed.version !== VERIFIED_CACHE_SCHEMA ||
      !parsed.entries
    ) {
      return emptyStore();
    }
    return parsed;
  } catch {
    return emptyStore();
  }
}

function writeStore(store: Store) {
  if (!canUseStorage()) return;
  try {
    store.version = VERIFIED_CACHE_SCHEMA;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota / private mode — ignore
  }
}

function isFresh(entry: VerifiedEntry): boolean {
  if (entry.schema !== VERIFIED_CACHE_SCHEMA) return false;
  const t = Date.parse(entry.savedAt);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t < TTL_MS;
}

function applyPinFields(
  pin: PowertrainCorrection,
  dossier: LiveDossier,
): LiveDossier {
  const engine = pin.engine;
  const overview = sanitizeNarrativeForPin(pin, dossier.overview);
  const keyFeatures = sanitizeFeaturesForPin(pin, dossier.keyFeatures);
  const reliabilitySummary = sanitizeNarrativeForPin(
    pin,
    dossier.reliabilitySummary,
  );
  const marketNotes = sanitizeNarrativeForPin(pin, dossier.marketNotes);
  return {
    ...dossier,
    engine,
    horsepower: pin.horsepower,
    torqueLbFt: pin.torqueLbFt ?? dossier.torqueLbFt,
    chassis: pin.chassis ?? dossier.chassis,
    transmission: pin.transmission ?? dossier.transmission,
    fuelType:
      pin.fuelType ??
      (/diesel|cummins|isb|b6\.7|l9|isl|power stroke/i.test(engine)
        ? "Diesel"
        : dossier.fuelType),
    rvType:
      pin.fuelType === "Diesel"
        ? dossier.rvType?.toLowerCase().includes("gas")
          ? "Class A Diesel"
          : dossier.rvType || "Class A Diesel"
        : pin.fuelType === "Gas"
          ? dossier.rvType?.toLowerCase().includes("diesel")
            ? "Class A Gas"
            : dossier.rvType || "Class A Gas"
          : dossier.rvType,
    overview,
    keyFeatures,
    reliabilitySummary,
    marketNotes,
    sourcesNote: [
      dossier.sourcesNote,
      pin.note ? `Brochure pin: ${pin.note}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

/** Apply brochure powertrain pin onto a live dossier (always on read/save). */
export function applyPowertrainPin(
  year: string,
  make: string,
  model: string,
  floorplan: string | undefined,
  dossier: LiveDossier,
): LiveDossier {
  const pin = findPowertrainCorrection(year, make, model, floorplan);
  if (!pin) return dossier;
  return applyPinFields(pin, dossier);
}

function conflictsWithPin(
  year: string,
  make: string,
  model: string,
  floorplan: string | undefined,
  d: LiveDossier,
): boolean {
  const pin = findPowertrainCorrection(year, make, model, floorplan);
  if (!pin || !d.engine) return false;
  return powertrainConflictsWithPin(pin, d.engine, d.horsepower);
}

/**
 * Soft-only slice: market + narrative. Used when hard powertrain is rejected
 * so we can still cache useful Live text without poisoning engine/HP.
 */
function softFieldsOnly(
  d: LiveDossier,
  hard: {
    engine: string | null;
    horsepower: number | null;
    torqueLbFt: number | null;
    chassis: string | null;
    transmission: string | null;
    fuelType: string | null;
  },
): LiveDossier {
  return {
    ...d,
    engine: hard.engine,
    horsepower: hard.horsepower,
    torqueLbFt: hard.torqueLbFt,
    chassis: hard.chassis,
    transmission: hard.transmission,
    fuelType: hard.fuelType,
  };
}

/** True if dossier has enough signal to cache (soft and/or hard). */
export function isDossierWorthCaching(
  d: LiveDossier | null | undefined,
): boolean {
  if (!d?.live) return false;
  const hasEngine = Boolean(d.engine && d.engine.trim().length > 3);
  const hasHp = d.horsepower != null && d.horsepower > 0;
  const hasChassis = Boolean(d.chassis && d.chassis.trim().length > 2);
  const hasSoft =
    Boolean(d.overview?.trim()) ||
    Boolean(d.reliabilitySummary?.trim()) ||
    (d.commonIssues?.length ?? 0) > 0 ||
    (d.tradeInUsd != null && d.tradeInUsd > 0) ||
    (d.retailHighUsd != null && d.retailHighUsd > 0);
  // Cache soft-only if narrative/market present; hard needs engine+(hp|chassis)
  return hasSoft || (hasEngine && (hasHp || hasChassis));
}

/**
 * Phase 4.1 — build a cache-safe dossier: pin wins; invalid Live powertrain stripped.
 */
export function sanitizeDossierForCache(
  year: string,
  make: string,
  model: string,
  floorplan: string | undefined,
  dossier: LiveDossier,
): {
  dossier: LiveDossier;
  powertrainPinned: boolean;
  powertrainValidated: boolean;
  rejectedReasons: string[];
} | null {
  if (!isDossierWorthCaching(dossier)) return null;

  const pin = findPowertrainCorrection(year, make, model, floorplan);
  const reject = validateLivePowertrain({
    year,
    make,
    model,
    floorplan,
    catalogFuelType: dossier.fuelType,
    catalogType: dossier.rvType,
    catalogEngine: pin?.engine ?? null,
    catalogHp: pin?.horsepower ?? null,
    live: dossier,
    pin,
  });

  let out = { ...dossier };
  let powertrainPinned = false;
  let powertrainValidated = false;

  // Never persist model-written drivetrain. Pin may stamp brochure truth.
  // Soft fields (overview, issues, market) stay.
  if (pin) {
    out = applyPinFields(pin, out);
    powertrainPinned = true;
    powertrainValidated = true;
  } else {
    out = softFieldsOnly(out, {
      engine: null,
      horsepower: null,
      torqueLbFt: null,
      chassis: null,
      transmission: null,
      fuelType: null,
    });
    powertrainValidated = false;
    if (!isDossierWorthCaching(out)) return null;
  }

  // Never persist invent-450 without pin
  if (
    out.horsepower === 450 &&
    !pin &&
    out.engine &&
    /godzilla|v10|triton|isb|b6\.7/i.test(out.engine)
  ) {
    out = { ...out, horsepower: null };
  }

  return {
    dossier: {
      ...out,
      live: true,
    },
    powertrainPinned,
    powertrainValidated,
    rejectedReasons: reject,
  };
}

export function getVerifiedDossier(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
): LiveDossier | null {
  const key = dossierCacheKey(year, make, model, floorplan);
  const store = readStore();
  const entry = store.entries[key];
  if (!entry || !isFresh(entry)) {
    if (entry && !isFresh(entry)) {
      delete store.entries[key];
      writeStore(store);
    }
    return null;
  }

  // Phase 4.2 — drop or re-pin entries that conflict with current pins
  if (conflictsWithPin(year, make, model, floorplan, entry.dossier)) {
    const pin = findPowertrainCorrection(year, make, model, floorplan);
    if (pin) {
      // Repair in place with pin (keep soft fields)
      entry.dossier = applyPinFields(pin, entry.dossier);
      entry.powertrainPinned = true;
      entry.powertrainValidated = true;
      entry.savedAt = new Date().toISOString();
      store.entries[key] = entry;
      writeStore(store);
    } else {
      delete store.entries[key];
      writeStore(store);
      return null;
    }
  }

  // Always re-apply pin on read so rule updates win without waiting for TTL.
  // Without a pin: never surface model-written drivetrain from cache.
  let dossier = applyPowertrainPin(
    year,
    make,
    model,
    floorplan,
    entry.dossier,
  );

  const pin = findPowertrainCorrection(year, make, model, floorplan);
  if (!pin) {
    dossier = softFieldsOnly(dossier, {
      engine: null,
      horsepower: null,
      torqueLbFt: null,
      chassis: null,
      transmission: null,
      fuelType: null,
    });
  }

  entry.hits = (entry.hits || 0) + 1;
  store.entries[key] = entry;
  writeStore(store);

  return {
    ...dossier,
    live: true,
    cached: true,
    fetchedAt: entry.dossier.fetchedAt || entry.savedAt,
  };
}

export function saveVerifiedDossier(
  year: string,
  make: string,
  model: string,
  floorplan: string | undefined,
  dossier: LiveDossier,
): void {
  const safe = sanitizeDossierForCache(
    year,
    make,
    model,
    floorplan,
    dossier,
  );
  if (!safe) return;

  // Phase 4.1 — never store conflicting powertrain (sanitize already pinned/stripped)
  if (
    conflictsWithPin(year, make, model, floorplan, safe.dossier) &&
    !safe.powertrainPinned
  ) {
    return;
  }

  const key = dossierCacheKey(year, make, model, floorplan);
  const store = readStore();

  store.entries[key] = {
    key,
    year: year.trim(),
    make: make.trim(),
    model: model.trim(),
    floorplan: (floorplan || "").trim(),
    dossier: safe.dossier,
    savedAt: new Date().toISOString(),
    hits: (store.entries[key]?.hits || 0) + 1,
    schema: VERIFIED_CACHE_SCHEMA,
    powertrainPinned: safe.powertrainPinned,
    powertrainValidated: safe.powertrainValidated,
  };

  const keys = Object.keys(store.entries);
  if (keys.length > MAX_ENTRIES) {
    const sorted = keys
      .map((k) => store.entries[k]!)
      .sort((a, b) => Date.parse(a.savedAt) - Date.parse(b.savedAt));
    for (let i = 0; i < sorted.length - MAX_ENTRIES; i++) {
      delete store.entries[sorted[i]!.key];
    }
  }
  writeStore(store);
}

/** Phase 4.3 — remove one coach from local verified cache */
export function clearVerifiedDossier(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
): boolean {
  const key = dossierCacheKey(year, make, model, floorplan);
  const store = readStore();
  if (!store.entries[key]) return false;
  delete store.entries[key];
  writeStore(store);
  return true;
}

/** Phase 4.3 — wipe entire verified catalog cache */
export function clearAllVerifiedDossiers(): number {
  const store = readStore();
  const n = Object.keys(store.entries).length;
  writeStore(emptyStore());
  purgeLegacyKeys();
  return n;
}

export function hasVerifiedDossier(
  year: string,
  make: string,
  model: string,
  floorplan?: string,
): boolean {
  return getVerifiedDossier(year, make, model, floorplan) != null;
}

export function countVerifiedDossiers(): number {
  return Object.keys(readStore().entries).length;
}
