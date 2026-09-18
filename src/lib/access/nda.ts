import { NDA_STORAGE_KEY } from "./constants.ts";
import { NDA_VERSION } from "./ndaText.ts";
import { normalizePhone } from "./phone.ts";

export type NdaAcceptance = {
  v: number;
  at: string;
  phone?: string;
};

export type NdaStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
};

function defaultStorage(): NdaStorage | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch {
    /* Capacitor private mode / SSR */
  }
  return null;
}

export function readNdaAcceptance(
  storage: NdaStorage | null = defaultStorage(),
): NdaAcceptance | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(NDA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NdaAcceptance;
    if (!parsed || typeof parsed.v !== "number" || typeof parsed.at !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** True only when this device has accepted the current NDA_VERSION. */
export function hasAcceptedNda(
  storage: NdaStorage | null = defaultStorage(),
): boolean {
  const rec = readNdaAcceptance(storage);
  return Boolean(rec && rec.v === NDA_VERSION);
}

/**
 * Remember accept on this device. Optional phone is stored with the
 * record when already known — it does not unlock tools.
 */
export function acceptNda(
  phone?: string,
  storage: NdaStorage | null = defaultStorage(),
): NdaAcceptance {
  const n = phone ? normalizePhone(phone) : null;
  const rec: NdaAcceptance = {
    v: NDA_VERSION,
    at: new Date().toISOString(),
    ...(n ? { phone: n.digits } : {}),
  };
  if (storage) {
    try {
      storage.setItem(NDA_STORAGE_KEY, JSON.stringify(rec));
    } catch {
      /* Capacitor private mode */
    }
  }
  return rec;
}

/** NDA accept never unlocks tools. Whitelist still controls functional access. */
export function ndaAcceptanceGrantsAccess(): false {
  return false;
}
