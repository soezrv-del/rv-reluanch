/**
 * Live GPS follow while Turn-by-Turn is armed.
 * Origin / Plan trip still uses one-shot getCurrentPosition — this
 * module is watchPosition only, and never invents a moving pin.
 */

import { useEffect, useState } from "react";
import {
  finiteLngLat,
  projectMercator,
  TILE_SIZE,
  type BasemapLngLat,
  type TileView,
} from "./basemap.ts";

export type GeoFix = BasemapLngLat & {
  heading: number | null;
  accuracy: number | null;
  ts: number;
};

export type FollowStatus = "off" | "waiting" | "live" | "denied";

/** Ignore jitter under this (WebView + battery). */
export const FOLLOW_DISTANCE_FILTER_M = 15;
/** Recenter tiles only after a meaningful move. */
export const FOLLOW_RECENTER_M = 45;
/** Light lag so WKWebView is not retiling every tick. */
export const FOLLOW_RECENTER_MS = 2000;
export const FOLLOW_MAX_AGE_MS = 8000;
export const FOLLOW_TIMEOUT_MS = 20_000;
/** Street-ish zoom — still under MAX_TILES on a phone-width map. */
export const FOLLOW_ZOOM = 13;

export const FOLLOW_WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: FOLLOW_TIMEOUT_MS,
  maximumAge: FOLLOW_MAX_AGE_MS,
};

const EARTH_M = 6_371_000;

export function haversineMeters(a: BasemapLngLat, b: BasemapLngLat): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function headingDeg(raw: number | null | undefined): number | null {
  if (raw == null || !Number.isFinite(raw) || raw < 0) return null;
  return ((raw % 360) + 360) % 360;
}

export function fixFromCoords(
  coords: {
    latitude: number;
    longitude: number;
    heading?: number | null;
    accuracy?: number | null;
  },
  ts = Date.now(),
): GeoFix | null {
  const lat = Number(coords.latitude);
  const lng = Number(coords.longitude);
  if (!finiteLngLat({ lat, lng })) return null;
  const acc = Number(coords.accuracy);
  return {
    lat,
    lng,
    heading: headingDeg(coords.heading),
    accuracy: Number.isFinite(acc) && acc > 0 ? acc : null,
    ts: Number.isFinite(ts) ? ts : Date.now(),
  };
}

export function shouldAcceptFix(
  prev: GeoFix | null,
  next: GeoFix | null,
  minM = FOLLOW_DISTANCE_FILTER_M,
): next is GeoFix {
  if (!next || !finiteLngLat(next)) return false;
  if (!prev) return true;
  return haversineMeters(prev, next) >= minM;
}

export function shouldRecenterFollow(
  center: BasemapLngLat | null,
  next: BasemapLngLat,
  lastAt: number,
  now: number,
  opts?: { minM?: number; minMs?: number },
): boolean {
  if (!finiteLngLat(next)) return false;
  if (!center || !finiteLngLat(center)) return true;
  const moved = haversineMeters(center, next);
  const waited = now - lastAt;
  const minM = opts?.minM ?? FOLLOW_RECENTER_M;
  const minMs = opts?.minMs ?? FOLLOW_RECENTER_MS;
  if (moved >= minM) return true;
  if (moved >= FOLLOW_DISTANCE_FILTER_M && waited >= minMs) return true;
  return false;
}

export function followTileView(
  center: BasemapLngLat,
  w: number,
  h: number,
  z = FOLLOW_ZOOM,
): TileView | null {
  if (!finiteLngLat(center) || !(w > 0) || !(h > 0)) return null;
  if (!Number.isInteger(z) || z < 3 || z > 15) return null;
  const p = projectMercator(center.lat, center.lng, z);
  return {
    z,
    minX: p.x - w / 2 / TILE_SIZE,
    minY: p.y - h / 2 / TILE_SIZE,
    w,
    h,
  };
}

export function followErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = Number((err as GeolocationPositionError).code);
    if (code === 1) {
      return "Location permission denied — map stays on the route.";
    }
    if (code === 2) {
      return "GPS unavailable — map stays on the route.";
    }
    if (code === 3) {
      return "Waiting for GPS…";
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return "Location unavailable — map stays on the route.";
}

export function useNavFollow(armed: boolean): {
  fix: GeoFix | null;
  error: string | null;
  status: FollowStatus;
} {
  const [fix, setFix] = useState<GeoFix | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    if (!armed) {
      setFix(null);
      setError(null);
      setDenied(false);
      return;
    }
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setFix(null);
      setDenied(false);
      setError("Location is not available on this device.");
      return;
    }

    let last: GeoFix | null = null;
    setError(null);
    setDenied(false);

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const next = fixFromCoords(pos.coords, pos.timestamp);
        if (!shouldAcceptFix(last, next)) return;
        last = next;
        setFix(next);
        setError(null);
        setDenied(false);
      },
      (err) => {
        const msg = followErrorMessage(err);
        if (err.code === 1) {
          last = null;
          setFix(null);
          setDenied(true);
          setError(msg);
          return;
        }
        setError(msg);
      },
      FOLLOW_WATCH_OPTIONS,
    );

    return () => {
      navigator.geolocation.clearWatch(id);
      last = null;
      setFix(null);
      setError(null);
      setDenied(false);
    };
  }, [armed]);

  const status: FollowStatus = !armed
    ? "off"
    : denied
      ? "denied"
      : fix
        ? "live"
        : "waiting";

  return { fix, error, status };
}
