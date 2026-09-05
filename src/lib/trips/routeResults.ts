/**
 * Honest post-route numbers. Only surface fields the routing API returned.
 * Never fall back to DEMO_ROUTE / DEMO_ALERTS / invented clearance DBs.
 */

import { splitDuration, type OsrmLineString, type OsrmRouteResult } from "./osrm.ts";
import type { TripRoute } from "./tripData.ts";

export type LiveRouteStats = {
  miles: number;
  driveHours: number;
  driveMinutes: number;
};

function finiteNonNeg(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

/**
 * Miles + drive time from a live route payload.
 * Time may come from driveHours/driveMinutes or durationS (same API body).
 * Missing / NaN miles → null. Never invent a corridor.
 */
export function liveRouteStats(
  route: Pick<
    OsrmRouteResult,
    "miles" | "driveHours" | "driveMinutes" | "durationS"
  > | null | undefined,
): LiveRouteStats | null {
  if (!route) return null;
  if (!finiteNonNeg(route.miles)) return null;

  if (finiteNonNeg(route.driveHours) && finiteNonNeg(route.driveMinutes)) {
    return {
      miles: route.miles,
      driveHours: route.driveHours,
      driveMinutes: route.driveMinutes,
    };
  }

  if (finiteNonNeg(route.durationS)) {
    const split = splitDuration(route.durationS);
    return {
      miles: route.miles,
      driveHours: split.driveHours,
      driveMinutes: split.driveMinutes,
    };
  }

  return null;
}

/** Build UI trip summary from API fields only — no DEMO_ROUTE spread. */
export function tripRouteFromLive(
  data: OsrmRouteResult,
  originLabel: string,
  destLabel: string,
  opts?: { id?: string; engineExtra?: string },
): TripRoute | null {
  const stats = liveRouteStats(data);
  if (!stats) return null;
  const engine = (data.engine || "").trim();
  return {
    id: opts?.id ?? `route-${data.fetchedAt || "live"}`,
    origin: { id: "origin", label: originLabel },
    destination: { id: "dest", label: destLabel },
    miles: stats.miles,
    driveHours: stats.driveHours,
    driveMinutes: stats.driveMinutes,
    alertCount: 0,
    engine: opts?.engineExtra
      ? [engine, opts.engineExtra].filter(Boolean).join(" · ")
      : engine,
  };
}

/** Provider / dim note only when the API sent one. */
export function liveProviderNote(
  route: Pick<OsrmRouteResult, "providerNote"> | null | undefined,
): string {
  return (route?.providerNote || "").trim();
}

/** SVG path from the same LineString the numbers came from. */
export function geometryToSvgPath(
  geometry: OsrmLineString | null | undefined,
  width: number,
  height: number,
  pad = 14,
): string | null {
  const coords = geometry?.coordinates;
  if (!coords || coords.length < 2) return null;
  if (!(width > 0) || !(height > 0)) return null;

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  if (!Number.isFinite(minLng) || !Number.isFinite(minLat)) return null;

  const spanLng = Math.max(maxLng - minLng, 1e-5);
  const spanLat = Math.max(maxLat - minLat, 1e-5);
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const scale = Math.min(innerW / spanLng, innerH / spanLat);
  const ox = pad + (innerW - spanLng * scale) / 2;
  const oy = pad + (innerH - spanLat * scale) / 2;

  const parts: string[] = [];
  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    const x = ox + (lng - minLng) * scale;
    const y = oy + (maxLat - lat) * scale;
    parts.push(`${parts.length === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return parts.length >= 2 ? parts.join(" ") : null;
}
