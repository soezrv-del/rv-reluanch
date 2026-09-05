/**
 * Fuel / truck-stop layer along a live corridor.
 * Never invents stations — only normalizes HERE Places or OSM Overpass rows.
 */

import { parseLngLat, type OsrmLngLat } from "./osrm.ts";

export const HERE_FUEL_CATEGORY = "700-7600-0000";
export const HERE_TRUCK_STOP_CATEGORY = "700-7600-0116";
export const HERE_FUEL_CATEGORIES = `${HERE_FUEL_CATEGORY},${HERE_TRUCK_STOP_CATEGORY}`;

export const DEFAULT_CORRIDOR_WIDTH_MI = 8;
export const MIN_CORRIDOR_WIDTH_MI = 3;
export const MAX_CORRIDOR_WIDTH_MI = 15;
export const MAX_FUEL_STOPS = 24;
export const MAX_PATH_POINTS = 40;
export const MAX_QUERY_CENTERS = 6;
export const TARGET_CENTER_SPACING_MI = 80;
export const QUERY_RADIUS_M = 13_000;

export type FuelKind = "truck-stop" | "fuel";

export type FuelStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: FuelKind;
  city: string;
  state: string;
  address: string;
  milesOff: number;
  progress: number;
  brand: string;
};

export type FuelSource = "here" | "overpass";

export type FuelSearchResult = {
  source: FuelSource;
  sourceLabel: string;
  sourceNote: string;
  corridorMiles: number;
  stops: FuelStop[];
  error?: string;
};

export type FuelHereItem = {
  title?: string;
  id?: string;
  resultType?: string;
  address?: {
    label?: string;
    city?: string;
    stateCode?: string;
    state?: string;
  };
  position?: { lat?: number; lng?: number };
  categories?: { id?: string; name?: string; primary?: boolean }[];
};

export type FuelOverpassEl = {
  type?: string;
  id?: number;
  lat?: number;
  lon?: number;
  center?: { lat?: number; lon?: number };
  tags?: Record<string, string>;
};

const EARTH_MI = 3958.8;

const TRUCK_NAME_RE =
  /\b(truck stop|travel center|travel plaza|flying j|pilot|love'?s|\bpetro\b|travelcenters|\bta\b|ambest)\b/i;

export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_MI * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function clampCorridorWidthMi(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return DEFAULT_CORRIDOR_WIDTH_MI;
  return Math.min(MAX_CORRIDOR_WIDTH_MI, Math.max(MIN_CORRIDOR_WIDTH_MI, n));
}

/** City-only paths (no live polyline) bow away from the interstate. */
export function effectiveCorridorWidthMi(
  widthMi: number,
  corridorPointCount: number,
): number {
  const w = clampCorridorWidthMi(widthMi);
  if (corridorPointCount <= 4) return Math.min(MAX_CORRIDOR_WIDTH_MI, Math.max(w, 12));
  return w;
}

export function finitePlace(p: {
  lat: number;
  lng: number;
}): p is OsrmLngLat {
  return (
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

export function parsePathParam(raw: string | null | undefined): OsrmLngLat[] {
  if (!raw) return [];
  const out: OsrmLngLat[] = [];
  for (const part of raw.split("|")) {
    const p = parseLngLat(part.trim());
    if (p && finitePlace(p)) out.push(p);
    if (out.length >= MAX_PATH_POINTS) break;
  }
  return out;
}

export function encodePathParam(points: OsrmLngLat[]): string {
  return points
    .filter(finitePlace)
    .slice(0, MAX_PATH_POINTS)
    .map((p) => `${p.lng},${p.lat}`)
    .join("|");
}

export function sourceLabel(source: FuelSource): string {
  return source === "here" ? "HERE Places" : "OpenStreetMap Overpass";
}

export function sourceNote(source: FuelSource): string {
  const who =
    source === "here"
      ? "HERE Places along this corridor — not a live pump inventory."
      : "OpenStreetMap Overpass along this corridor — not a live pump inventory.";
  return `${who} Hours and diesel change; confirm at the stop.`;
}

export function downsampleByDistance(
  coords: OsrmLngLat[],
  maxPoints: number,
): OsrmLngLat[] {
  const pts = coords.filter(finitePlace);
  if (pts.length <= maxPoints) return pts;
  if (maxPoints < 2) return pts.slice(0, 1);
  const { total, cum } = cumulativeMiles(pts);
  if (total <= 0) return [pts[0]!, pts[pts.length - 1]!];
  const out: OsrmLngLat[] = [];
  for (let i = 0; i < maxPoints; i++) {
    const target = (i * total) / (maxPoints - 1);
    out.push(pointAtDistance(pts, cum, target));
  }
  return out;
}

export function sampleCorridorPoints(
  coords: OsrmLngLat[],
  opts?: { targetSpacingMiles?: number; maxPoints?: number; minPoints?: number },
): OsrmLngLat[] {
  const pts = coords.filter(finitePlace);
  if (pts.length === 0) return [];
  if (pts.length === 1) return pts;
  const spacing = opts?.targetSpacingMiles ?? TARGET_CENTER_SPACING_MI;
  const maxPts = opts?.maxPoints ?? MAX_QUERY_CENTERS;
  const minPts = opts?.minPoints ?? 2;
  const { total, cum } = cumulativeMiles(pts);
  const n = Math.min(
    maxPts,
    Math.max(minPts, Math.round(total / Math.max(20, spacing)) + 1),
  );
  if (n <= 2) return [pts[0]!, pts[pts.length - 1]!];
  const out: OsrmLngLat[] = [];
  for (let i = 0; i < n; i++) {
    const target = (i * total) / (n - 1);
    out.push(pointAtDistance(pts, cum, target));
  }
  return out;
}

function cumulativeMiles(pts: OsrmLngLat[]): {
  total: number;
  cum: number[];
} {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    cum.push(cum[i - 1]! + haversineMiles(pts[i - 1]!, pts[i]!));
  }
  return { total: cum[cum.length - 1] ?? 0, cum };
}

function pointAtDistance(
  pts: OsrmLngLat[],
  cum: number[],
  target: number,
): OsrmLngLat {
  if (target <= 0) return pts[0]!;
  const last = pts[pts.length - 1]!;
  const total = cum[cum.length - 1] ?? 0;
  if (target >= total) return last;
  for (let i = 1; i < pts.length; i++) {
    if (cum[i]! >= target) {
      const span = cum[i]! - cum[i - 1]!;
      const t = span <= 0 ? 0 : (target - cum[i - 1]!) / span;
      const a = pts[i - 1]!;
      const b = pts[i]!;
      return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      };
    }
  }
  return last;
}

function projectOnSegment(
  p: OsrmLngLat,
  a: OsrmLngLat,
  b: OsrmLngLat,
): { point: OsrmLngLat; t: number } {
  const lat0 = (a.lat * Math.PI) / 180;
  const x = (lng: number) =>
    ((lng * Math.PI) / 180) * Math.cos(lat0) * EARTH_MI;
  const y = (lat: number) => (lat * Math.PI) / 180 * EARTH_MI;
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
    len2 <= 0 ? 0 : Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / len2));
  return {
    t,
    point: {
      lat: a.lat + (b.lat - a.lat) * t,
      lng: a.lng + (b.lng - a.lng) * t,
    },
  };
}

export function milesToPolyline(
  p: OsrmLngLat,
  corridor: OsrmLngLat[],
): { milesOff: number; progress: number } {
  const pts = corridor.filter(finitePlace);
  if (pts.length === 0) return { milesOff: Infinity, progress: 0 };
  if (pts.length === 1) {
    return { milesOff: haversineMiles(p, pts[0]!), progress: 0 };
  }
  const { total, cum } = cumulativeMiles(pts);
  let best = Infinity;
  let along = 0;
  for (let i = 1; i < pts.length; i++) {
    const hit = projectOnSegment(p, pts[i - 1]!, pts[i]!);
    const d = haversineMiles(p, hit.point);
    if (d < best) {
      best = d;
      along = (cum[i - 1] ?? 0) + hit.t * ((cum[i] ?? 0) - (cum[i - 1] ?? 0));
    }
  }
  return {
    milesOff: best,
    progress: total > 0 ? along / total : 0,
  };
}

export function looksLikeTruckStop(opts: {
  name: string;
  categories?: string[];
  tags?: Record<string, string>;
}): boolean {
  const cats = (opts.categories ?? []).join(" ");
  if (cats.includes(HERE_TRUCK_STOP_CATEGORY)) return true;
  const tags = opts.tags ?? {};
  if (/^(yes|true|designated)$/i.test(tags.hgv || tags.truck || "")) return true;
  if ((tags.amenity || "").toLowerCase() === "truck_stop") return true;
  if (TRUCK_NAME_RE.test(opts.name)) return true;
  if (TRUCK_NAME_RE.test(tags.brand || tags.operator || "")) return true;
  return false;
}

export function classifyFuelKind(opts: {
  name: string;
  categories?: string[];
  tags?: Record<string, string>;
}): FuelKind {
  return looksLikeTruckStop(opts) ? "truck-stop" : "fuel";
}

function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function normalizeHereItems(
  items: FuelHereItem[],
  corridor: OsrmLngLat[],
  widthMi: number,
): FuelStop[] {
  const stops: FuelStop[] = [];
  for (const item of items) {
    const lat = Number(item.position?.lat);
    const lng = Number(item.position?.lng);
    if (!finitePlace({ lat, lng })) continue;
    const name = cleanName(item.title || item.address?.label || "");
    if (!name) continue;
    const categories = (item.categories ?? [])
      .map((c) => String(c.id || ""))
      .filter(Boolean);
    const { milesOff, progress } = milesToPolyline({ lat, lng }, corridor);
    if (!(milesOff <= widthMi)) continue;
    stops.push({
      id: String(item.id || `here:${lat.toFixed(4)},${lng.toFixed(4)}`),
      name,
      lat,
      lng,
      kind: classifyFuelKind({ name, categories }),
      city: cleanName(item.address?.city || ""),
      state: cleanName(item.address?.stateCode || item.address?.state || ""),
      address: cleanName(item.address?.label || ""),
      milesOff: Math.round(milesOff * 10) / 10,
      progress,
      brand: "",
    });
  }
  return stops;
}

export function normalizeOverpassElements(
  elements: FuelOverpassEl[],
  corridor: OsrmLngLat[],
  widthMi: number,
): FuelStop[] {
  const stops: FuelStop[] = [];
  for (const el of elements) {
    const lat = Number(el.lat ?? el.center?.lat);
    const lng = Number(el.lon ?? el.center?.lon);
    if (!finitePlace({ lat, lng })) continue;
    const tags = el.tags ?? {};
    const name = cleanName(
      tags.name || tags.brand || tags.operator || tags["name:en"] || "",
    );
    if (!name) continue;
    const { milesOff, progress } = milesToPolyline({ lat, lng }, corridor);
    if (!(milesOff <= widthMi)) continue;
    stops.push({
      id: `osm:${el.type || "n"}:${el.id ?? `${lat.toFixed(4)},${lng.toFixed(4)}`}`,
      name,
      lat,
      lng,
      kind: classifyFuelKind({ name, tags }),
      city: cleanName(tags.addr_city || tags["addr:city"] || ""),
      state: cleanName(tags["addr:state"] || ""),
      address: cleanName(
        [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
          .filter(Boolean)
          .join(" "),
      ),
      milesOff: Math.round(milesOff * 10) / 10,
      progress,
      brand: cleanName(tags.brand || ""),
    });
  }
  return stops;
}

export function dedupFuelStops(stops: FuelStop[]): FuelStop[] {
  const seen = new Map<string, FuelStop>();
  for (const s of stops) {
    const key = `${s.lat.toFixed(3)}|${s.lng.toFixed(3)}|${s.name.toLowerCase()}`;
    const prev = seen.get(key);
    if (!prev || s.milesOff < prev.milesOff) seen.set(key, s);
  }
  return [...seen.values()];
}

export function rankFuelStops(stops: FuelStop[]): FuelStop[] {
  return [...stops].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "truck-stop" ? -1 : 1;
    if (Math.abs(a.progress - b.progress) > 0.02) return a.progress - b.progress;
    return a.milesOff - b.milesOff;
  });
}

export function finalizeFuelStops(
  stops: FuelStop[],
  limit = MAX_FUEL_STOPS,
): FuelStop[] {
  return rankFuelStops(dedupFuelStops(stops)).slice(0, limit);
}

export function emptyFuelResult(
  source: FuelSource,
  widthMi: number,
  error?: string,
): FuelSearchResult {
  return {
    source,
    sourceLabel: sourceLabel(source),
    sourceNote: sourceNote(source),
    corridorMiles: widthMi,
    stops: [],
    ...(error ? { error } : {}),
  };
}

export function fuelMapsUrl(stop: Pick<FuelStop, "lat" | "lng" | "name">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${stop.lat},${stop.lng}`,
  )}`;
}

export function buildFuelQuery(opts: {
  from: OsrmLngLat;
  to: OsrmLngLat;
  via?: OsrmLngLat[];
  path?: OsrmLngLat[];
  widthMi?: number;
}): URLSearchParams {
  const qs = new URLSearchParams({
    from: `${opts.from.lng},${opts.from.lat}`,
    to: `${opts.to.lng},${opts.to.lat}`,
  });
  if (opts.via?.length) qs.set("via", encodePathParam(opts.via));
  if (opts.path?.length) qs.set("path", encodePathParam(opts.path));
  if (opts.widthMi) qs.set("widthMi", String(opts.widthMi));
  return qs;
}

export function sortAlongCorridor<T extends { lat: number; lng: number }>(
  items: T[],
  corridor: OsrmLngLat[],
): T[] {
  return [...items].sort(
    (a, b) =>
      milesToPolyline(a, corridor).progress -
      milesToPolyline(b, corridor).progress,
  );
}

export function resolveCorridor(opts: {
  from: OsrmLngLat | null;
  to: OsrmLngLat | null;
  via?: OsrmLngLat[];
  path?: OsrmLngLat[];
}): OsrmLngLat[] | null {
  const path = (opts.path ?? []).filter(finitePlace);
  if (path.length >= 2) return downsampleByDistance(path, MAX_PATH_POINTS);
  if (!opts.from || !opts.to || !finitePlace(opts.from) || !finitePlace(opts.to)) {
    return null;
  }
  const mids = (opts.via ?? []).filter(finitePlace);
  return [opts.from, ...mids, opts.to];
}
