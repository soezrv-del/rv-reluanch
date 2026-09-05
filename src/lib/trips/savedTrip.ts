/**
 * Device-local saved trips. Stops only — miles/time come from a live
 * recalculate, never from a cached DEMO_ROUTE.
 */

import {
  placeFromUnknown,
  shortPlaceLabel,
  defaultTripName,
  type PlanPlace,
} from "./planTrip.ts";

export const SAVED_TRIPS_KEY = "rvfax_trips_saved_v1";
export const MAX_SAVED_TRIPS = 8;

export type SavedTrip = {
  id: string;
  name: string;
  origin: PlanPlace;
  vias: PlanPlace[];
  dest: PlanPlace;
  savedAt: string;
};

function coordClose(a: number, b: number, places = 3): boolean {
  const f = 10 ** places;
  return Math.round(a * f) === Math.round(b * f);
}

export function placesMatch(a: PlanPlace, b: PlanPlace): boolean {
  return coordClose(a.lat, b.lat) && coordClose(a.lng, b.lng);
}

export function sameCorridor(
  a: Pick<SavedTrip, "origin" | "vias" | "dest">,
  b: Pick<SavedTrip, "origin" | "vias" | "dest">,
): boolean {
  if (!placesMatch(a.origin, b.origin) || !placesMatch(a.dest, b.dest)) {
    return false;
  }
  if (a.vias.length !== b.vias.length) return false;
  return a.vias.every((v, i) => placesMatch(v, b.vias[i]!));
}

function readList(): SavedTrip[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: SavedTrip[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const o = row as Record<string, unknown>;
      const origin = placeFromUnknown(o.origin);
      const dest = placeFromUnknown(o.dest);
      if (!origin || !dest) continue;
      const vias = Array.isArray(o.vias)
        ? o.vias.map(placeFromUnknown).filter((p): p is PlanPlace => p != null)
        : [];
      const id = typeof o.id === "string" && o.id.trim() ? o.id : `trip-${out.length}`;
      const name =
        typeof o.name === "string" && o.name.trim()
          ? o.name.trim()
          : defaultTripName(origin, dest, vias);
      const savedAt =
        typeof o.savedAt === "string" && o.savedAt ? o.savedAt : new Date().toISOString();
      out.push({ id, name, origin, vias, dest, savedAt });
    }
    return out;
  } catch {
    return [];
  }
}

function writeList(list: SavedTrip[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(list));
  } catch {
    /* quota */
  }
}

export function loadSavedTrips(): SavedTrip[] {
  return readList();
}

export function findSavedTrip(opts: {
  origin: PlanPlace;
  dest: PlanPlace;
  vias?: PlanPlace[];
}): SavedTrip | null {
  const corridor = {
    origin: opts.origin,
    dest: opts.dest,
    vias: opts.vias ?? [],
  };
  return readList().find((t) => sameCorridor(t, corridor)) ?? null;
}

/** Upsert by corridor. Newest first. Drops miles/time on purpose. */
export function saveTrip(input: {
  name?: string;
  origin: PlanPlace;
  dest: PlanPlace;
  vias?: PlanPlace[];
}): SavedTrip | null {
  const origin = placeFromUnknown(input.origin);
  const dest = placeFromUnknown(input.dest);
  if (!origin || !dest) return null;
  const vias = (input.vias ?? [])
    .map(placeFromUnknown)
    .filter((p): p is PlanPlace => p != null);
  const name = (input.name || "").trim() || defaultTripName(origin, dest, vias);
  const existing = readList();
  const match = existing.find((t) => sameCorridor(t, { origin, vias, dest }));
  const next: SavedTrip = {
    id: match?.id ?? `trip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    origin,
    vias,
    dest,
    savedAt: new Date().toISOString(),
  };
  writeList([next, ...existing.filter((t) => t.id !== next.id)].slice(0, MAX_SAVED_TRIPS));
  return next;
}

export function deleteSavedTrip(id: string): SavedTrip[] {
  const next = readList().filter((t) => t.id !== id);
  writeList(next);
  return next;
}

export function savedTripSummary(trip: SavedTrip): string {
  const via = trip.vias.map(shortPlaceLabel).join(" · ");
  return via
    ? `${shortPlaceLabel(trip.origin)} → ${via} → ${shortPlaceLabel(trip.dest)}`
    : `${shortPlaceLabel(trip.origin)} → ${shortPlaceLabel(trip.dest)}`;
}
