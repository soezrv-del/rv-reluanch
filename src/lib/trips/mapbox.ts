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
/** Classic streets — kept for the raster (Static Tiles) fallback only. */
export const MAPBOX_STYLE_STREETS = "mapbox://styles/mapbox/streets-v12";
/**
 * GL streets view. Billed per GL JS map load exactly like streets-v12
 * (a map load includes unlimited vector/raster tile requests). The Static
 * Tiles API cannot render Standard, so the raster path stays streets-v12.
 */
export const MAPBOX_STYLE_STANDARD = "mapbox://styles/mapbox/standard";
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
  return style === "satellite" ? MAPBOX_STYLE_SATELLITE : MAPBOX_STYLE_STANDARD;
}

/** Only the GL streets view is Standard; satellite stays satellite-streets-v12. */
export function isStandardStyle(style: MapboxStyleId): boolean {
  return mapboxStyleUrl(style) === MAPBOX_STYLE_STANDARD;
}

export type MapboxLightPreset = "day" | "night";

export function standardLightPreset(theme: "light" | "dark"): MapboxLightPreset {
  return theme === "dark" ? "night" : "day";
}

/**
 * Standard `basemap` config. Restrained look: no POI clutter, faded theme.
 * `showIndoor` stays false on purpose — indoor airport tiles are a
 * separately billed Mapbox product; everything else rides the map load.
 */
export function mapboxStandardConfig(
  theme: "light" | "dark",
): Record<string, string | boolean> {
  return {
    lightPreset: standardLightPreset(theme),
    theme: "faded",
    showPointOfInterestLabels: false,
    showIndoor: false,
  };
}

/**
 * Route line on the Trips map: soft blue with a white casing in both themes
 * so it stays crisp on Standard day / night and on satellite. Widths scale
 * with zoom (thin at a multi-state overview, bolder in town).
 */
export const ROUTE_LINE_COLOR = { light: "#3e6ae1", dark: "#5b83ec" } as const;
export const ROUTE_CASING_COLOR = "#ffffff";

export type RouteLineStyle = {
  lineColor: string;
  casingColor: string;
  casingOpacity: number;
  lineWidth: unknown[];
  casingWidth: unknown[];
};

export function routeLineStyle(theme: "light" | "dark"): RouteLineStyle {
  return {
    lineColor: ROUTE_LINE_COLOR[theme],
    casingColor: ROUTE_CASING_COLOR,
    casingOpacity: theme === "dark" ? 0.9 : 1,
    lineWidth: ["interpolate", ["linear"], ["zoom"], 4, 3.75, 8, 4.5, 12, 6, 16, 8.5],
    casingWidth: ["interpolate", ["linear"], ["zoom"], 4, 7, 8, 8, 12, 10, 16, 13.5],
  };
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
