/**
 * Off-route reroute while Turn-by-Turn / GPS follow is armed.
 *
 * Mapbox is visual-only. Recalc uses the same hybrid as Plan / Navigate:
 * locked coach + dims → HERE Truck (`/api?mode=rv_safe`); else OSRM.
 * Never Mapbox Directions / Navigation.
 */

import { haversineMeters } from "./geoFollow.ts";
import {
  canUseRvSafe,
  type RvSafeCoachInput,
} from "./navigateRoute.ts";
import type { OsrmLngLat } from "./osrm.ts";

/** Leave the corridor by more than this → one truck-aware recalc. */
export const OFF_ROUTE_METERS = 50;
/** Do not spam HERE / OSRM while the puck jitters off the line. */
export const REROUTE_COOLDOWN_MS = 20_000;
/** Via already reached — drop it so we do not loop back. */
export const VIA_PASSED_METERS = 150;
/** Close enough to dest that a recalc is noise. */
export const ARRIVE_METERS = 80;

export type LngLatLike = OsrmLngLat | [number, number];

export type RerouteDecision =
  | { action: "none"; reason: string }
  | {
      action: "reroute";
      from: OsrmLngLat;
      via: OsrmLngLat[];
      to: OsrmLngLat;
      metersOff: number;
    };

function finiteLngLat(p: OsrmLngLat | null | undefined): p is OsrmLngLat {
  return (
    !!p &&
    Number.isFinite(p.lng) &&
    Number.isFinite(p.lat) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

export function asLngLat(p: LngLatLike | null | undefined): OsrmLngLat | null {
  if (!p) return null;
  if (Array.isArray(p)) {
    const lng = Number(p[0]);
    const lat = Number(p[1]);
    return finiteLngLat({ lng, lat }) ? { lng, lat } : null;
  }
  return finiteLngLat(p) ? { lng: p.lng, lat: p.lat } : null;
}

export function polylineLngLats(
  raw: LngLatLike[] | null | undefined,
): OsrmLngLat[] {
  if (!raw?.length) return [];
  const out: OsrmLngLat[] = [];
  for (const p of raw) {
    const hit = asLngLat(p);
    if (hit) out.push(hit);
  }
  return out;
}

const EARTH_M = 6_371_000;

function projectOnSegment(
  p: OsrmLngLat,
  a: OsrmLngLat,
  b: OsrmLngLat,
): { point: OsrmLngLat; t: number } {
  const lat0 = (a.lat * Math.PI) / 180;
  const x = (lng: number) => ((lng * Math.PI) / 180) * Math.cos(lat0) * EARTH_M;
  const y = (lat: number) => ((lat * Math.PI) / 180) * EARTH_M;
  const ax = x(a.lng);
  const ay = y(a.lat);
  const bx = x(b.lng);
  const by = y(b.lat);
  const px = x(p.lng);
  const py = y(p.lat);
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t =
    len2 <= 0
      ? 0
      : Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / len2));
  return {
    t,
    point: {
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t,
    },
  };
}

function cumulativeMeters(pts: OsrmLngLat[]): { total: number; cum: number[] } {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1]! + haversineMeters(pts[i - 1]!, pts[i]!));
  }
  return { total: cum[cum.length - 1] ?? 0, cum };
}

/** Distance (m) from a fix to the closest point on the live route polyline. */
export function metersToRoutePolyline(
  point: LngLatLike,
  corridor: LngLatLike[] | null | undefined,
): { metersOff: number; progress: number } {
  const p = asLngLat(point);
  const pts = polylineLngLats(corridor);
  if (!p) return { metersOff: Infinity, progress: 0 };
  if (pts.length === 0) return { metersOff: Infinity, progress: 0 };
  if (pts.length === 1) {
    return { metersOff: haversineMeters(p, pts[0]!), progress: 0 };
  }
  const { total, cum } = cumulativeMeters(pts);
  let best = Infinity;
  let along = 0;
  for (let i = 1; i < pts.length; i++) {
    const hit = projectOnSegment(p, pts[i - 1]!, pts[i]!);
    const d = haversineMeters(p, hit.point);
    if (d < best) {
      best = d;
      along = (cum[i - 1] ?? 0) + hit.t * ((cum[i] ?? 0) - (cum[i - 1] ?? 0));
    }
  }
  return {
    metersOff: best,
    progress: total > 0 ? along / total : 0,
  };
}

/**
 * Keep dest; drop vias already passed so the recalc does not U-turn.
 * Same stop order as the planner: remaining vias → dest.
 */
export function remainingViaStops<T extends { lat: number; lng: number }>(
  here: { lat: number; lng: number },
  vias: T[] | undefined,
  dest: { lat: number; lng: number },
  corridor?: LngLatLike[] | null,
): T[] {
  const rows = (vias ?? []).filter((v) => finiteLngLat(v));
  if (!rows.length) return [];
  const destPt = asLngLat(dest);
  if (destPt && haversineMeters(here, destPt) < ARRIVE_METERS) return [];

  const line = polylineLngLats(corridor);
  const hereProg = line.length ? metersToRoutePolyline(here, line).progress : null;

  return rows.filter((via) => {
    if (haversineMeters(here, via) < VIA_PASSED_METERS) return false;
    if (hereProg == null) return true;
    const viaProg = metersToRoutePolyline(via, line).progress;
    return viaProg > hereProg + 0.002;
  });
}

export type DecideOffRouteInput = {
  armed: boolean;
  liveRoute: boolean;
  here: { lat: number; lng: number } | null;
  dest: { lat: number; lng: number } | null;
  vias?: { lat: number; lng: number }[];
  polyline?: LngLatLike[] | null;
  lastRerouteAt: number;
  now: number;
  inFlight?: boolean;
  thresholdM?: number;
  cooldownMs?: number;
};

export function decideOffRouteReroute(
  input: DecideOffRouteInput,
): RerouteDecision {
  if (!input.armed) return { action: "none", reason: "follow-off" };
  if (!input.liveRoute) return { action: "none", reason: "no-live-route" };
  if (input.inFlight) return { action: "none", reason: "in-flight" };

  const here = asLngLat(input.here);
  const dest = asLngLat(input.dest);
  if (!here) return { action: "none", reason: "no-fix" };
  if (!dest) return { action: "none", reason: "no-dest" };

  const line = polylineLngLats(input.polyline);
  if (line.length < 2) return { action: "none", reason: "no-polyline" };

  if (haversineMeters(here, dest) < ARRIVE_METERS) {
    return { action: "none", reason: "arrived" };
  }

  const cooldown = input.cooldownMs ?? REROUTE_COOLDOWN_MS;
  if (
    input.lastRerouteAt > 0 &&
    input.now - input.lastRerouteAt < cooldown
  ) {
    return { action: "none", reason: "cooldown" };
  }

  const { metersOff } = metersToRoutePolyline(here, line);
  const threshold = input.thresholdM ?? OFF_ROUTE_METERS;
  if (!(metersOff > threshold)) {
    return { action: "none", reason: "on-route" };
  }

  const via = remainingViaStops(here, input.vias, dest, line).map((v) => ({
    lng: v.lng,
    lat: v.lat,
  }));

  return {
    action: "reroute",
    from: here,
    via,
    to: dest,
    metersOff,
  };
}

/** Same args Plan / Navigate already send — HERE Truck when locked. */
export function navigateParamsForReroute(
  decision: Extract<RerouteDecision, { action: "reroute" }>,
  coach?: RvSafeCoachInput | null,
): {
  from: OsrmLngLat;
  to: OsrmLngLat;
  via?: OsrmLngLat[];
  coach?: RvSafeCoachInput | null;
} {
  return {
    from: decision.from,
    to: decision.to,
    via: decision.via.length ? decision.via : undefined,
    coach: coach ?? undefined,
  };
}

export function rerouteUsesRvSafe(
  coach: RvSafeCoachInput | null | undefined,
): boolean {
  return canUseRvSafe(coach);
}

export type OffRouteGate = {
  consider: (
    input: Omit<
      DecideOffRouteInput,
      "lastRerouteAt" | "inFlight" | "cooldownMs" | "thresholdM"
    >,
  ) => RerouteDecision;
  finish: () => void;
  reset: () => void;
};

/** Shared burst guard: one in-flight request + cooldown after a fire. */
export function createOffRouteGate(opts?: {
  cooldownMs?: number;
  thresholdM?: number;
}): OffRouteGate {
  let lastAt = 0;
  let inFlight = false;
  return {
    consider(input) {
      const decision = decideOffRouteReroute({
        ...input,
        lastRerouteAt: lastAt,
        inFlight,
        cooldownMs: opts?.cooldownMs ?? REROUTE_COOLDOWN_MS,
        thresholdM: opts?.thresholdM ?? OFF_ROUTE_METERS,
      });
      if (decision.action === "reroute") {
        lastAt = input.now;
        inFlight = true;
      }
      return decision;
    },
    finish() {
      inFlight = false;
    },
    reset() {
      lastAt = 0;
      inFlight = false;
    },
  };
}
