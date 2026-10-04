/**
 * Full-screen navigation mode on Mapbox GL JS — pure helpers only.
 *
 * Mapbox has no browser Navigation SDK (iOS / Android only), so the
 * "GPS look" is built here on the Maps SDK we already load: camera curve,
 * maneuver banner copy, traveled vs remaining split, ETA strip, speed.
 * Routing stays HERE Truck (OSRM fallback). Nothing here calls an API.
 * All copy is US customary (ft / mi / mph).
 */

import { haversineMeters } from "./geoFollow.ts";

const M_PER_MI = 1609.344;
const FT_PER_M = 3.28084;
const MPH_PER_MPS = 2.236936;

/* ------------------------------------------------------------------ */
/* Camera                                                              */
/* ------------------------------------------------------------------ */

/** Cruising between turns: street-level, gently pitched. */
export const NAV_CRUISE_ZOOM = 15.25;
export const NAV_CRUISE_PITCH = 45;
/** At the maneuver: closest, steepest. */
export const NAV_TURN_ZOOM = 17.25;
export const NAV_TURN_PITCH = 60;
/** Start easing in this far from the next maneuver. */
export const NAV_APPROACH_M = 500;
/** Fully zoomed in at this distance. */
export const NAV_CLOSE_M = 60;
/** After passing the maneuver, ease back out over this distance. */
export const NAV_EXIT_M = 120;
/** Highway speed pulls the cruise camera back so the road ahead fits. */
export const NAV_FAST_MPS = 24; // ~54 mph
export const NAV_FAST_ZOOM_DROP = 1;

export type NavCamera = { zoom: number; pitch: number };

function clamp01(n: number): number {
  return n <= 0 ? 0 : n >= 1 ? 1 : n;
}

/** Smoothstep 0..1 — no camera snaps at the band edges. */
export function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/**
 * 0 = cruise, 1 = fully on the turn.
 * `remainM` is distance to the next maneuver along the route; negative
 * means it was just passed (we ease back out over NAV_EXIT_M).
 */
export function maneuverFocus(remainM: number | null | undefined): number {
  if (remainM == null || !Number.isFinite(remainM)) return 0;
  if (remainM < 0) return smoothstep(1 + remainM / NAV_EXIT_M);
  if (remainM <= NAV_CLOSE_M) return 1;
  if (remainM >= NAV_APPROACH_M) return 0;
  return smoothstep((NAV_APPROACH_M - remainM) / (NAV_APPROACH_M - NAV_CLOSE_M));
}

/**
 * Zoom + pitch for the follow camera. Pitches and zooms in as the turn
 * nears, eases back out after it. Fast cruising pulls back one zoom.
 */
export function navCameraFor(
  remainM: number | null | undefined,
  speedMps?: number | null,
): NavCamera {
  const f = maneuverFocus(remainM);
  const fast =
    speedMps != null && Number.isFinite(speedMps)
      ? smoothstep((speedMps - NAV_FAST_MPS / 2) / (NAV_FAST_MPS / 2))
      : 0;
  const cruiseZoom = NAV_CRUISE_ZOOM - NAV_FAST_ZOOM_DROP * fast;
  const zoom = cruiseZoom + (NAV_TURN_ZOOM - cruiseZoom) * f;
  const pitch = NAV_CRUISE_PITCH + (NAV_TURN_PITCH - NAV_CRUISE_PITCH) * f;
  return {
    zoom: Math.round(zoom * 100) / 100,
    pitch: Math.round(pitch * 10) / 10,
  };
}

/** Skip tiny camera nudges so WKWebView is not re-easing every tick. */
export function cameraChanged(
  a: NavCamera | null,
  b: NavCamera,
  minZoom = 0.15,
  minPitch = 2,
): boolean {
  if (!a) return true;
  return Math.abs(a.zoom - b.zoom) >= minZoom || Math.abs(a.pitch - b.pitch) >= minPitch;
}

/* ------------------------------------------------------------------ */
/* Banner + strip copy                                                 */
/* ------------------------------------------------------------------ */

/**
 * Distance to the next maneuver for the banner. Imperial, rounded the way
 * an in-car display does: 50 ft steps under 0.1 mi, tenths under 10 mi.
 */
export function formatManeuverDistance(m: number | null | undefined): string {
  if (m == null || !Number.isFinite(m)) return "";
  if (m <= 15) return "Now";
  const miles = m / M_PER_MI;
  if (miles < 0.1) {
    const ft = Math.max(50, Math.round((m * FT_PER_M) / 50) * 50);
    return `${ft} ft`;
  }
  if (miles < 10) return `${(Math.round(miles * 10) / 10).toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}

/** Remaining trip distance for the ETA strip. */
export function formatRemainingMiles(m: number | null | undefined): string {
  if (m == null || !Number.isFinite(m) || m < 0) return "";
  const miles = m / M_PER_MI;
  if (miles < 0.1) return "< 0.1 mi";
  return miles < 10 ? `${miles.toFixed(1)} mi` : `${Math.round(miles)} mi`;
}

/** "1 hr 05 min" / "12 min" / "< 1 min". */
export function formatRemainingTime(s: number | null | undefined): string {
  if (s == null || !Number.isFinite(s) || s < 0) return "";
  const mins = Math.round(s / 60);
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${h} hr ${String(mm).padStart(2, "0")} min`;
}

/** Local arrival clock, e.g. "9:42 PM". */
export function formatArrivalClock(nowMs: number, remainS: number, timeZone?: string): string {
  if (!Number.isFinite(nowMs) || !Number.isFinite(remainS) || remainS < 0) return "";
  try {
    return new Date(nowMs + remainS * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      ...(timeZone ? { timeZone } : {}),
    });
  } catch {
    return "";
  }
}

export type TripRemaining = {
  remainM: number;
  remainS: number;
};

/**
 * Remaining distance / time from progress along the route. Time scales the
 * router's own duration by the share of distance left — no traffic model.
 */
export function tripRemaining(input: {
  routeDistanceM: number | null | undefined;
  routeDurationS: number | null | undefined;
  alongM: number | null | undefined;
}): TripRemaining | null {
  const total = Number(input.routeDistanceM);
  const dur = Number(input.routeDurationS);
  if (!(total > 0) || !Number.isFinite(dur) || dur < 0) return null;
  const along = Number.isFinite(input.alongM as number)
    ? Math.min(total, Math.max(0, input.alongM as number))
    : 0;
  const remainM = total - along;
  return { remainM, remainS: dur * (remainM / total) };
}

/* ------------------------------------------------------------------ */
/* Maneuver arrow                                                      */
/* ------------------------------------------------------------------ */

export type ManeuverArrow =
  | "straight"
  | "left"
  | "right"
  | "slight-left"
  | "slight-right"
  | "sharp-left"
  | "sharp-right"
  | "uturn"
  | "merge"
  | "ramp-left"
  | "ramp-right"
  | "roundabout"
  | "arrive";

/**
 * Arrow for the banner. Our steps carry only the maneuver *type* (OSRM) or
 * HERE action name, so the side comes from the instruction text.
 */
export function maneuverArrow(maneuver: string, instruction: string): ManeuverArrow {
  const blob = `${maneuver} ${instruction}`.toLowerCase();
  if (/\barriv/.test(blob)) return "arrive";
  if (/u-?turn/.test(blob)) return "uturn";
  if (/roundabout|rotary/.test(blob)) return "roundabout";
  const left = /\bleft\b/.test(blob);
  const right = /\bright\b/.test(blob);
  if (/ramp|exit/.test(blob) && (left || right)) return left ? "ramp-left" : "ramp-right";
  if (/merge/.test(blob)) return "merge";
  if (/sharp/.test(blob) && (left || right)) return left ? "sharp-left" : "sharp-right";
  if (/slight|keep|bear|fork/.test(blob) && (left || right)) {
    return left ? "slight-left" : "slight-right";
  }
  if (left) return "left";
  if (right) return "right";
  return "straight";
}

/* ------------------------------------------------------------------ */
/* Speed                                                               */
/* ------------------------------------------------------------------ */

export type SpeedFix = { lat: number; lng: number; ts: number; speed?: number | null };

/** Speed from two fixes when the device does not report coords.speed. */
export function derivedSpeedMps(prev: SpeedFix | null, next: SpeedFix | null): number | null {
  if (!prev || !next) return null;
  const dt = (next.ts - prev.ts) / 1000;
  if (!(dt >= 0.5) || dt > 30) return null;
  const d = haversineMeters(prev, next);
  const v = d / dt;
  // Above ~110 mph is a GPS jump, not an RV.
  return Number.isFinite(v) && v >= 0 && v < 50 ? v : null;
}

/** Device speed wins; derived speed is the fallback. */
export function pickSpeedMps(next: SpeedFix | null, prev: SpeedFix | null): number | null {
  const own = next?.speed;
  if (own != null && Number.isFinite(own) && own >= 0) return own;
  return derivedSpeedMps(prev, next);
}

export function formatSpeedMph(mps: number | null | undefined): string {
  if (mps == null || !Number.isFinite(mps) || mps < 0) return "--";
  const mph = mps * MPH_PER_MPS;
  return String(mph < 1 ? 0 : Math.round(mph));
}

/* ------------------------------------------------------------------ */
/* Traveled vs remaining line                                          */
/* ------------------------------------------------------------------ */

export type RouteSplit = {
  traveled: [number, number][];
  remaining: [number, number][];
  /** Bearing (deg from north) of the route where the driver is. */
  bearing: number | null;
  /** Meters from the fix to the snapped point. */
  metersOff: number;
};

function bearingDeg(a: [number, number], b: [number, number]): number | null {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(a[1]);
  const φ2 = toRad(b[1]);
  const Δλ = toRad(b[0] - a[0]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  if (x === 0 && y === 0) return null;
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * Snap the fix to the closest segment and cut the line there. Traveled ends
 * and remaining starts at the snapped point, so the two lines touch.
 */
export function splitRouteAtFix(
  coords: [number, number][],
  fix: { lat: number; lng: number } | null | undefined,
): RouteSplit | null {
  if (!fix || coords.length < 2) return null;
  const EARTH_M = 6_371_000;
  let best = Infinity;
  let bestI = 1;
  let bestT = 0;
  for (let i = 1; i < coords.length; i++) {
    const a = coords[i - 1]!;
    const b = coords[i]!;
    const lat0 = (a[1] * Math.PI) / 180;
    const x = (lng: number) => ((lng * Math.PI) / 180) * Math.cos(lat0) * EARTH_M;
    const y = (lat: number) => ((lat * Math.PI) / 180) * EARTH_M;
    const ax = x(a[0]);
    const ay = y(a[1]);
    const dx = x(b[0]) - ax;
    const dy = y(b[1]) - ay;
    const px = x(fix.lng) - ax;
    const py = y(fix.lat) - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 <= 0 ? 0 : Math.min(1, Math.max(0, (px * dx + py * dy) / len2));
    const ex = px - dx * t;
    const ey = py - dy * t;
    const d = Math.sqrt(ex * ex + ey * ey);
    if (d < best) {
      best = d;
      bestI = i;
      bestT = t;
    }
  }
  const a = coords[bestI - 1]!;
  const b = coords[bestI]!;
  const snap: [number, number] = [a[0] + (b[0] - a[0]) * bestT, a[1] + (b[1] - a[1]) * bestT];
  return {
    traveled: [...coords.slice(0, bestI), snap],
    remaining: [snap, ...coords.slice(bestI)],
    bearing: bearingDeg(a, b),
    metersOff: best,
  };
}
