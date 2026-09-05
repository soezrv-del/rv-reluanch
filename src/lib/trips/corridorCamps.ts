/**
 * Campground / RV-park POIs along a live corridor (and near dest).
 * Never invents pads — only normalizes HERE Places or OSM Overpass rows.
 */

import {
  encodePathParam,
  finitePlace,
  haversineMiles,
  milesToPolyline,
  parsePathParam,
  type FuelHereItem,
  type FuelOverpassEl,
} from "./corridorFuel.ts";
import type { OsrmLngLat } from "./osrm.ts";

export const HERE_CAMPGROUND_CATEGORY = "500-5100-0056";
export const HERE_RV_PARK_CATEGORY = "900-9200-0220";
export const HERE_CAMP_CATEGORIES = `${HERE_CAMPGROUND_CATEGORY},${HERE_RV_PARK_CATEGORY}`;

export const DEFAULT_CAMP_WIDTH_MI = 15;
export const DEST_AREA_MI = 18;
export const MAX_CAMPS = 20;
export const CAMP_QUERY_RADIUS_M = 22_000;
export const DEST_QUERY_RADIUS_M = 28_000;

export type CampKind = "rv-park" | "campground";
export type CampSource = "here" | "overpass";

export type CampStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: CampKind;
  city: string;
  state: string;
  address: string;
  milesOff: number;
  progress: number;
  nearDest: boolean;
  amenityHint: string;
};

export type CampSearchResult = {
  source: CampSource;
  sourceLabel: string;
  sourceNote: string;
  corridorMiles: number;
  camps: CampStop[];
  error?: string;
};

export type CampHereItem = FuelHereItem;
export type CampOverpassEl = FuelOverpassEl;

const RV_NAME_RE =
  /\b(rv park|rv resort|rv campground|koa|thousand trails|good sam|sun outdoors|caravan park|holiday park)\b/i;

export function campSourceLabel(source: CampSource): string {
  return source === "here" ? "HERE Places" : "OpenStreetMap Overpass";
}

export function campSourceNote(source: CampSource): string {
  const who =
    source === "here"
      ? "HERE Places camping / RV parks along this corridor — not live pad inventory."
      : "OpenStreetMap Overpass (tourism=camp_site / caravan_site) — not live pad inventory.";
  return `${who} Availability, hookups, and site length change; confirm before you pull in.`;
}

function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function taggedYes(raw: string | undefined): boolean {
  return /^(yes|true|designated)$/i.test(raw || "");
}

export function looksLikeRvPark(opts: {
  name: string;
  categories?: string[];
  tags?: Record<string, string>;
}): boolean {
  const cats = (opts.categories ?? []).join(" ");
  if (cats.includes(HERE_RV_PARK_CATEGORY)) return true;
  const tags = opts.tags ?? {};
  if ((tags.tourism || "").toLowerCase() === "caravan_site") return true;
  if (RV_NAME_RE.test(opts.name)) return true;
  if (RV_NAME_RE.test(tags.brand || tags.operator || "")) return true;
  return false;
}

export function classifyCampKind(opts: {
  name: string;
  categories?: string[];
  tags?: Record<string, string>;
}): CampKind {
  return looksLikeRvPark(opts) ? "rv-park" : "campground";
}

export function amenityHintFromTags(tags: Record<string, string>): string {
  const bits: string[] = [];
  if (
    taggedYes(tags.sanitary_dump_station) ||
    (tags.amenity || "").toLowerCase() === "sanitary_dump_station"
  ) {
    bits.push("dump tagged");
  }
  if (taggedYes(tags.power_supply) || taggedYes(tags.power)) {
    bits.push("power tagged");
  }
  if (taggedYes(tags.caravans)) bits.push("caravans tagged");
  return bits.join(" · ");
}

export function keepCampPoi(
  p: OsrmLngLat,
  corridor: OsrmLngLat[],
  widthMi: number,
  destAreaMi = DEST_AREA_MI,
): { milesOff: number; progress: number; nearDest: boolean } | null {
  const along = milesToPolyline(p, corridor);
  const dest = corridor[corridor.length - 1];
  const milesToDest = dest ? haversineMiles(p, dest) : Infinity;
  const nearDest = Number.isFinite(milesToDest) && milesToDest <= destAreaMi;
  if (along.milesOff <= widthMi || nearDest) {
    return { milesOff: along.milesOff, progress: along.progress, nearDest };
  }
  return null;
}

export function normalizeHereCamps(
  items: CampHereItem[],
  corridor: OsrmLngLat[],
  widthMi: number,
): CampStop[] {
  const camps: CampStop[] = [];
  for (const item of items) {
    const lat = Number(item.position?.lat);
    const lng = Number(item.position?.lng);
    if (!finitePlace({ lat, lng })) continue;
    const name = cleanName(item.title || item.address?.label || "");
    if (!name) continue;
    const categories = (item.categories ?? [])
      .map((c) => String(c.id || ""))
      .filter(Boolean);
    const kept = keepCampPoi({ lat, lng }, corridor, widthMi);
    if (!kept) continue;
    camps.push({
      id: String(item.id || `here-camp:${lat.toFixed(4)},${lng.toFixed(4)}`),
      name,
      lat,
      lng,
      kind: classifyCampKind({ name, categories }),
      city: cleanName(item.address?.city || ""),
      state: cleanName(item.address?.stateCode || item.address?.state || ""),
      address: cleanName(item.address?.label || ""),
      milesOff: Math.round(kept.milesOff * 10) / 10,
      progress: kept.progress,
      nearDest: kept.nearDest,
      amenityHint: "",
    });
  }
  return camps;
}

export function normalizeOverpassCamps(
  elements: CampOverpassEl[],
  corridor: OsrmLngLat[],
  widthMi: number,
): CampStop[] {
  const camps: CampStop[] = [];
  for (const el of elements) {
    const lat = Number(el.lat ?? el.center?.lat);
    const lng = Number(el.lon ?? el.center?.lon);
    if (!finitePlace({ lat, lng })) continue;
    const tags = el.tags ?? {};
    const name = cleanName(
      tags.name || tags.brand || tags.operator || tags["name:en"] || "",
    );
    if (!name) continue;
    const kept = keepCampPoi({ lat, lng }, corridor, widthMi);
    if (!kept) continue;
    camps.push({
      id: `osm-camp:${el.type || "n"}:${el.id ?? `${lat.toFixed(4)},${lng.toFixed(4)}`}`,
      name,
      lat,
      lng,
      kind: classifyCampKind({ name, tags }),
      city: cleanName(tags.addr_city || tags["addr:city"] || ""),
      state: cleanName(tags["addr:state"] || ""),
      address: cleanName(
        [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
          .filter(Boolean)
          .join(" "),
      ),
      milesOff: Math.round(kept.milesOff * 10) / 10,
      progress: kept.progress,
      nearDest: kept.nearDest,
      amenityHint: amenityHintFromTags(tags),
    });
  }
  return camps;
}

export function dedupCamps(camps: CampStop[]): CampStop[] {
  const seen = new Map<string, CampStop>();
  for (const c of camps) {
    const key = `${c.lat.toFixed(3)}|${c.lng.toFixed(3)}|${c.name.toLowerCase()}`;
    const prev = seen.get(key);
    if (!prev || c.milesOff < prev.milesOff) seen.set(key, c);
  }
  return [...seen.values()];
}

export function rankCamps(camps: CampStop[]): CampStop[] {
  return [...camps].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "rv-park" ? -1 : 1;
    if (a.nearDest !== b.nearDest && Math.abs(a.progress - b.progress) < 0.08) {
      return a.nearDest ? 1 : -1;
    }
    if (Math.abs(a.progress - b.progress) > 0.02) return a.progress - b.progress;
    return a.milesOff - b.milesOff;
  });
}

export function finalizeCamps(
  camps: CampStop[],
  limit = MAX_CAMPS,
): CampStop[] {
  return rankCamps(dedupCamps(camps)).slice(0, limit);
}

export function emptyCampResult(
  source: CampSource,
  widthMi: number,
  error?: string,
): CampSearchResult {
  return {
    source,
    sourceLabel: campSourceLabel(source),
    sourceNote: campSourceNote(source),
    corridorMiles: widthMi,
    camps: [],
    ...(error ? { error } : {}),
  };
}

export function campMapsUrl(camp: Pick<CampStop, "lat" | "lng" | "name">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${camp.lat},${camp.lng}`,
  )}`;
}

export function buildCampsQuery(opts: {
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

export { parsePathParam, encodePathParam };
