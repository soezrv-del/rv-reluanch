/**
 * Mapbox is the Trips *visual* layer (basemap + optional geocode).
 * Truck clearance stays HERE; cheap fallback stays OSRM.
 * Never a Directions / router swap.
 */

export type MapboxStyleId = "streets" | "satellite";

export type MapboxGeoHit = {
  label: string;
  lat: number;
  lng: number;
  kind: string;
};

export const MAPBOX_ATTRIBUTION = "© Mapbox © OpenStreetMap";
export const MAPBOX_STYLE_STREETS = "mapbox://styles/mapbox/streets-v12";
export const MAPBOX_STYLE_SATELLITE =
  "mapbox://styles/mapbox/satellite-streets-v12";
export const MAPBOX_RASTER_STYLE_STREETS = "mapbox/streets-v12";
export const MAPBOX_RASTER_STYLE_SATELLITE = "mapbox/satellite-streets-v12";

export function readMapboxToken(
  env: Record<string, string | undefined> = process.env,
): string {
  return (
    env.MAPBOX_ACCESS_TOKEN?.trim() ||
    env.VITE_MAPBOX_TOKEN?.trim() ||
    ""
  );
}

export function isMapboxPublicToken(token: string): boolean {
  return token.startsWith("pk.");
}

export function mapboxPublicToken(
  env: Record<string, string | undefined> = process.env,
): string {
  const token = readMapboxToken(env);
  return isMapboxPublicToken(token) ? token : "";
}

export function mapboxStyleUrl(style: MapboxStyleId): string {
  return style === "satellite" ? MAPBOX_STYLE_SATELLITE : MAPBOX_STYLE_STREETS;
}

export function mapboxRasterTemplate(
  token: string,
  style: MapboxStyleId = "streets",
): string {
  const id =
    style === "satellite"
      ? MAPBOX_RASTER_STYLE_SATELLITE
      : MAPBOX_RASTER_STYLE_STREETS;
  return `https://api.mapbox.com/styles/v1/${id}/tiles/256/{z}/{x}/{y}?access_token=${encodeURIComponent(token)}`;
}

export function fillMapboxRasterTile(
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

export function mapboxForwardUrl(q: string, token: string): string {
  const path = encodeURIComponent(q);
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${path}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("autocomplete", "true");
  url.searchParams.set("limit", "6");
  url.searchParams.set("country", "us,ca");
  url.searchParams.set(
    "types",
    "address,poi,place,locality,neighborhood,region",
  );
  return url.toString();
}

export function mapboxReverseUrl(
  lng: number,
  lat: number,
  token: string,
): string {
  const path = `${lng},${lat}`;
  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${path}.json`,
  );
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", "1");
  return url.toString();
}

type MapboxFeature = {
  place_name?: string;
  text?: string;
  center?: [number, number];
  place_type?: string[];
};

function hitFromFeature(row: MapboxFeature, fallback: string): MapboxGeoHit | null {
  const center = row.center;
  if (!center || center.length < 2) return null;
  const lng = Number(center[0]);
  const lat = Number(center[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const label = String(row.place_name || row.text || fallback).trim();
  if (!label) return null;
  return {
    label,
    lat,
    lng,
    kind: String(row.place_type?.[0] || "place"),
  };
}

export function hitsFromMapboxForward(
  json: unknown,
  q: string,
): MapboxGeoHit[] {
  const features = (json as { features?: MapboxFeature[] } | null)?.features;
  if (!Array.isArray(features)) return [];
  const hits: MapboxGeoHit[] = [];
  for (const row of features) {
    const hit = hitFromFeature(row, q);
    if (hit) hits.push(hit);
  }
  return hits;
}

export function hitFromMapboxReverse(
  json: unknown,
  lat: number,
  lng: number,
): MapboxGeoHit | null {
  const features = (json as { features?: MapboxFeature[] } | null)?.features;
  const first = Array.isArray(features) ? features[0] : undefined;
  if (!first) return null;
  const hit = hitFromFeature(first, "Current location");
  if (!hit) return null;
  return {
    ...hit,
    lat: Number.isFinite(hit.lat) ? hit.lat : lat,
    lng: Number.isFinite(hit.lng) ? hit.lng : lng,
    kind: "current",
  };
}
