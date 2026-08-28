/**
 * Process-local OSRM route cache + in-flight dedupe.
 */

import type { OsrmLngLat, OsrmRouteResult } from "@/lib/trips/osrm";

const TTL_MS = 10 * 60 * 1000;
const STALE_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 128;

type Entry = {
  data: OsrmRouteResult;
  expires: number;
  staleUntil: number;
};

const cache = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();

export function roundCoord(n: number, places = 4): number {
  const f = 10 ** places;
  return Math.round(n * f) / f;
}

export function cacheKey(opts: {
  from: OsrmLngLat;
  to: OsrmLngLat;
  profileSig: string;
}): string {
  const f = `${roundCoord(opts.from.lng)},${roundCoord(opts.from.lat)}`;
  const t = `${roundCoord(opts.to.lng)},${roundCoord(opts.to.lat)}`;
  return `${opts.profileSig}|${f}|${t}`;
}

function touch(key: string, entry: Entry) {
  cache.delete(key);
  cache.set(key, entry);
  while (cache.size > MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest == null) break;
    cache.delete(oldest);
  }
}

export function cacheGet(
  key: string,
): { data: OsrmRouteResult; fresh: boolean } | null {
  const hit = cache.get(key);
  if (!hit) return null;
  const now = Date.now();
  if (now > hit.staleUntil) {
    cache.delete(key);
    return null;
  }
  touch(key, hit);
  return { data: hit.data, fresh: now <= hit.expires };
}

export function cacheSet(key: string, data: OsrmRouteResult) {
  const now = Date.now();
  touch(key, {
    data: { ...data, fetchedAt: data.fetchedAt || new Date().toISOString() },
    expires: now + TTL_MS,
    staleUntil: now + STALE_MS,
  });
}

export async function withInflight<T>(
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = factory().finally(() => {
    inflight.delete(key);
  });
  inflight.set(key, p);
  return p;
}

export function cacheStats() {
  return { size: cache.size, inflight: inflight.size };
}
