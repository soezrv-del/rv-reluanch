/**
 * Web-Mercator basemap under the live route polyline.
 * Same LineString as miles/time — never a stock photo.
 * HERE raster when the routing key also unlocks tiles; else OSM.
 */

import type { OsrmLineString } from "./osrm.ts";

export type TileProvider = "here" | "osm" | "svg";

export type BasemapLngLat = { lat: number; lng: number };

export type BasemapPinKind = "origin" | "via" | "dest" | "fuel" | "truck-stop";

export type BasemapPin = BasemapLngLat & {
  id: string;
  kind: BasemapPinKind;
  label?: string;
};

export type TileView = {
  z: number;
  minX: number;
  minY: number;
  w: number;
  h: number;
};

export type TileCell = {
  key: string;
  z: number;
  x: number;
  y: number;
  left: number;
  top: number;
};

export type TileCatalog = {
  provider: "here" | "osm";
  tileTemplate: string;
  attribution: string;
  note: string;
};

export type BasemapBBox = {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
};

export const TILE_SIZE = 256;
export const MAX_TILES = 24;
export const MAX_OVERLAY_POINTS = 160;
export const MAP_PROBE_PATH = "/api/map-tiles";
export const OSM_TILE_TEMPLATE = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
export const HERE_PROXY_TEMPLATE = "/api/map-tiles?z={z}&x={x}&y={y}";
export const OSM_ATTRIBUTION = "© OpenStreetMap";
export const HERE_ATTRIBUTION = "© HERE";

/** Western US probe tile (covers Reno–Seattle corridor at z=4). */
export const PROBE_TILE = { z: 4, x: 2, y: 6 } as const;

export function osmCatalog(note?: string): TileCatalog {
  return {
    provider: "osm",
    tileTemplate: OSM_TILE_TEMPLATE,
    attribution: OSM_ATTRIBUTION,
    note:
      note ||
      "OpenStreetMap raster — roads and terrain from OSM, not a photo.",
  };
}

export function hereCatalog(): TileCatalog {
  return {
    provider: "here",
    tileTemplate: HERE_PROXY_TEMPLATE,
    attribution: HERE_ATTRIBUTION,
    note: "HERE map tiles — same account as truck routing.",
  };
}

export function catalogAfterHereProbe(
  ok: boolean,
  reason?: string,
): TileCatalog {
  if (ok) return hereCatalog();
  const why = (reason || "").trim();
  return osmCatalog(
    why
      ? `OpenStreetMap — HERE map tiles unavailable (${why})`
      : "OpenStreetMap — HERE map tiles need a map product; the routing key was not enough.",
  );
}

export function fillTileTemplate(
  template: string,
  z: number,
  x: number,
  y: number,
): string {
  return template
    .replaceAll("{z}", String(z))
    .replaceAll("{x}", String(x))
    .replaceAll("{y}", String(y));
}

export function hereRasterV3Url(
  z: number,
  x: number,
  y: number,
  apiKey: string,
): string {
  const qs = new URLSearchParams({
    apiKey,
    style: "explore.day",
    size: "256",
  });
  return `https://maps.hereapi.com/v3/base/mc/${z}/${x}/${y}/png?${qs}`;
}

export function hereRasterV2Url(
  z: number,
  x: number,
  y: number,
  apiKey: string,
): string {
  const qs = new URLSearchParams({ apiKey });
  return `https://1.base.maps.ls.hereapi.com/maptile/2.1/maptile/newest/normal.day/${z}/${x}/${y}/256/png8?${qs}`;
}

export function parseTileCoord(raw: string | null, max: number): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0 || n > max) return null;
  return n;
}

export function isValidTile(z: number, x: number, y: number): boolean {
  if (!Number.isInteger(z) || z < 0 || z > 15) return false;
  const n = 2 ** z;
  return (
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    x >= 0 &&
    y >= 0 &&
    x < n &&
    y < n
  );
}

export function finiteLngLat(p: BasemapLngLat | null | undefined): p is BasemapLngLat {
  return (
    !!p &&
    Number.isFinite(p.lat) &&
    Number.isFinite(p.lng) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

export function projectMercator(
  lat: number,
  lng: number,
  z: number,
): { x: number; y: number } {
  const n = 2 ** z;
  const x = ((lng + 180) / 360) * n;
  const s = Math.sin((lat * Math.PI) / 180);
  const clamped = Math.min(0.9999, Math.max(-0.9999, s));
  const y = (0.5 - Math.log((1 + clamped) / (1 - clamped)) / (4 * Math.PI)) * n;
  return { x, y };
}

export function emptyBBox(): BasemapBBox {
  return { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity };
}

export function expandBBox(box: BasemapBBox, lng: number, lat: number): void {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;
  if (lng < box.minLng) box.minLng = lng;
  if (lng > box.maxLng) box.maxLng = lng;
  if (lat < box.minLat) box.minLat = lat;
  if (lat > box.maxLat) box.maxLat = lat;
}

export function bboxFromGeometry(
  geometry: OsrmLineString | null | undefined,
): BasemapBBox | null {
  const coords = geometry?.coordinates;
  if (!coords?.length) return null;
  const box = emptyBBox();
  for (const [lng, lat] of coords) expandBBox(box, lng, lat);
  return Number.isFinite(box.minLng) ? box : null;
}

export function bboxFromPoints(points: BasemapLngLat[]): BasemapBBox | null {
  const box = emptyBBox();
  for (const p of points) {
    if (finiteLngLat(p)) expandBBox(box, p.lng, p.lat);
  }
  return Number.isFinite(box.minLng) ? box : null;
}

export function mergeBboxes(
  ...boxes: Array<BasemapBBox | null | undefined>
): BasemapBBox | null {
  const box = emptyBBox();
  for (const b of boxes) {
    if (!b || !Number.isFinite(b.minLng)) continue;
    expandBBox(box, b.minLng, b.minLat);
    expandBBox(box, b.maxLng, b.maxLat);
  }
  return Number.isFinite(box.minLng) ? box : null;
}

export function downsampleCoords(
  coords: [number, number][],
  maxPoints: number,
): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  if (maxPoints < 2) return coords.slice(0, 1);
  const out: [number, number][] = [];
  const last = coords.length - 1;
  for (let i = 0; i < maxPoints; i++) {
    const idx = i === maxPoints - 1 ? last : Math.round((i * last) / (maxPoints - 1));
    const pt = coords[idx];
    if (pt) out.push(pt);
  }
  return out;
}

function tileCountFor(z: number, box: BasemapBBox, w: number, h: number): number {
  const a = projectMercator(box.minLat, box.minLng, z);
  const b = projectMercator(box.maxLat, box.maxLng, z);
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  const viewMinX = (minX + maxX) / 2 - w / 2 / TILE_SIZE;
  const viewMinY = (minY + maxY) / 2 - h / 2 / TILE_SIZE;
  const x0 = Math.floor(viewMinX);
  const y0 = Math.floor(viewMinY);
  const x1 = Math.floor(viewMinX + w / TILE_SIZE);
  const y1 = Math.floor(viewMinY + h / TILE_SIZE);
  return (x1 - x0 + 1) * (y1 - y0 + 1);
}

export function fitTileView(
  box: BasemapBBox,
  w: number,
  h: number,
): TileView | null {
  if (!(w > 0) || !(h > 0)) return null;
  if (!Number.isFinite(box.minLng) || !Number.isFinite(box.minLat)) return null;

  const pad = 0.08;
  for (let z = 12; z >= 3; z--) {
    const a = projectMercator(box.minLat, box.minLng, z);
    const b = projectMercator(box.maxLat, box.maxLng, z);
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);
    const spanX = Math.max(0.08, maxX - minX) * (1 + pad * 2);
    const spanY = Math.max(0.08, maxY - minY) * (1 + pad * 2);
    if (spanX * TILE_SIZE <= w && spanY * TILE_SIZE <= h) {
      if (tileCountFor(z, box, w, h) > MAX_TILES) continue;
      const cx = (minX + maxX) / 2;
      const cy = (minY + maxY) / 2;
      return {
        z,
        minX: cx - w / 2 / TILE_SIZE,
        minY: cy - h / 2 / TILE_SIZE,
        w,
        h,
      };
    }
  }

  const z = 3;
  const a = projectMercator(box.minLat, box.minLng, z);
  const b = projectMercator(box.maxLat, box.maxLng, z);
  const cx = (Math.min(a.x, b.x) + Math.max(a.x, b.x)) / 2;
  const cy = (Math.min(a.y, b.y) + Math.max(a.y, b.y)) / 2;
  return {
    z,
    minX: cx - w / 2 / TILE_SIZE,
    minY: cy - h / 2 / TILE_SIZE,
    w,
    h,
  };
}

export function enumerateTiles(view: TileView): TileCell[] {
  const { z, minX, minY, w, h } = view;
  const maxX = minX + w / TILE_SIZE;
  const maxY = minY + h / TILE_SIZE;
  const x0 = Math.floor(minX);
  const y0 = Math.floor(minY);
  const x1 = Math.floor(maxX);
  const y1 = Math.floor(maxY);
  const n = 2 ** z;
  const out: TileCell[] = [];
  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      const tx = ((x % n) + n) % n;
      if (y < 0 || y >= n) continue;
      out.push({
        key: `${z}-${tx}-${y}`,
        z,
        x: tx,
        y,
        left: (x - minX) * TILE_SIZE,
        top: (y - minY) * TILE_SIZE,
      });
      if (out.length >= MAX_TILES) return out;
    }
  }
  return out;
}

export function pointToPixel(
  lat: number,
  lng: number,
  view: TileView,
): { left: number; top: number } {
  const p = projectMercator(lat, lng, view.z);
  return {
    left: (p.x - view.minX) * TILE_SIZE,
    top: (p.y - view.minY) * TILE_SIZE,
  };
}

/** SVG path in the same Mercator pixels as the tiles. */
export function geometryToOverlayPath(
  geometry: OsrmLineString | null | undefined,
  view: TileView,
  maxPoints = MAX_OVERLAY_POINTS,
): string | null {
  const raw = geometry?.coordinates;
  if (!raw || raw.length < 2) return null;
  const coords = downsampleCoords(raw, maxPoints);
  const parts: string[] = [];
  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    const { left, top } = pointToPixel(lat, lng, view);
    parts.push(
      `${parts.length === 0 ? "M" : "L"}${left.toFixed(1)} ${top.toFixed(1)}`,
    );
  }
  return parts.length >= 2 ? parts.join(" ") : null;
}

export function nextProviderAfterTileFail(
  current: TileProvider,
): TileProvider {
  if (current === "here") return "osm";
  return "svg";
}

export function attributionFor(provider: TileProvider): string {
  if (provider === "here") return HERE_ATTRIBUTION;
  if (provider === "osm") return OSM_ATTRIBUTION;
  return "Route line · map tiles unavailable";
}
