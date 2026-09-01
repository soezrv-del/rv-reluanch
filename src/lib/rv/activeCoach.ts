/**
 * Last Facts (RvFACTS) coach the user actually selected.
 * Chat / Live Voice read this so “what’s the HP?” uses the open report
 * instead of inventing a sibling powertrain.
 *
 * Not a Facts cache. Chat answers never write here.
 */

export type ActiveCoach = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  rvType?: string;
  updatedAt: string;
};

const STORAGE_KEY = "rvfax.activeCoach.v1";

function canUseStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function readActiveCoach(): ActiveCoach | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as ActiveCoach;
    if (!p?.year?.trim() || !p?.make?.trim() || !p?.model?.trim()) return null;
    return {
      year: String(p.year).trim(),
      make: String(p.make).trim(),
      model: String(p.model).trim(),
      floorplan: String(p.floorplan || "").trim(),
      rvType: p.rvType ? String(p.rvType).trim() : undefined,
      updatedAt: p.updatedAt || "",
    };
  } catch {
    return null;
  }
}

export function writeActiveCoach(
  sel: {
    year?: string;
    make?: string;
    model?: string;
    floorplan?: string;
    rvType?: string;
  } | null,
): void {
  if (!canUseStorage()) return;
  try {
    if (!sel?.year?.trim() || !sel.make?.trim() || !sel.model?.trim()) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const next: ActiveCoach = {
      year: sel.year.trim(),
      make: sel.make.trim(),
      model: sel.model.trim(),
      floorplan: (sel.floorplan || "").trim(),
      rvType: sel.rvType?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota / private */
  }
}

export function clearActiveCoach(): void {
  writeActiveCoach(null);
}
