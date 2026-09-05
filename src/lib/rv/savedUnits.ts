/**
 * Facts Saved list — same identity + storage the heart / Save toggle uses.
 * Motorhome reports auto-save here; towables stay manual.
 */

import { coachTowRole } from "./activeCoach.ts";

export const SAVED_UNITS_KEY = "rvfax_saved_v1";
export const SAVED_UNITS_CAP = 40;

export type SavedUnitIdentity = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
};

export type SavedUnitLike = SavedUnitIdentity & {
  saved?: boolean;
  data?: { type?: string | null };
};

export function sameSavedUnit(
  a: SavedUnitIdentity,
  b: SavedUnitIdentity,
): boolean {
  return (
    a.year === b.year &&
    a.make === b.make &&
    a.model === b.model &&
    (a.floorplan || "") === (b.floorplan || "")
  );
}

export function isSavedUnit<T extends SavedUnitIdentity>(
  saved: T[],
  result: SavedUnitIdentity,
): boolean {
  return saved.some((s) => sameSavedUnit(s, result));
}

/** Class A/B/C / Super C / diesel motorhome — same classifier as Tow toad mode. */
export function isMotorhomeFactsType(type?: string | null): boolean {
  return coachTowRole(type) === "motorhome";
}

export function shouldAutoSaveFacts(result: SavedUnitLike): boolean {
  return isMotorhomeFactsType(result.data?.type);
}

export function autoSaveFactsUnit<T extends SavedUnitLike>(
  saved: T[],
  result: T,
): { next: T[]; added: boolean } {
  if (!shouldAutoSaveFacts(result)) {
    return { next: saved, added: false };
  }
  if (isSavedUnit(saved, result)) {
    return { next: saved, added: false };
  }
  return {
    next: [{ ...result, saved: true }, ...saved].slice(0, SAVED_UNITS_CAP),
    added: true,
  };
}

export function toggleSavedUnit<T extends SavedUnitLike>(
  saved: T[],
  result: T,
): T[] {
  if (isSavedUnit(saved, result)) {
    return saved.filter((s) => !sameSavedUnit(s, result));
  }
  return [{ ...result, saved: true }, ...saved].slice(0, SAVED_UNITS_CAP);
}

/** Most recently saved Facts unit (list is newest-first). */
export function loadLatestSavedUnit(): SavedUnitLike | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(SAVED_UNITS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const u = row as SavedUnitLike;
      if (u.year && u.make && u.model) return u;
    }
    return null;
  } catch {
    return null;
  }
}
