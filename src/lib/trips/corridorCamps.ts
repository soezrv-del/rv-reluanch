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
  /**
   * OSM vehicle/site maxlength only (see OSM_SITE_LENGTH_KEYS), in feet.
   * Omitted when untagged, unparseable, or no nearby OSM match.
   * HERE Places has no pad length — filled only from nearby OSM maxlength*.
   * Never from capacity, tents, SAMPLE_CAMPS, or guessed US feet.
   */
  siteLengthFt?: number;
  /** Official booking / park site when the source already has one. Never invented. */
  website?: string;
};

export type CampSearchResult = {
  source: CampSource;
  sourceLabel: string;
  sourceNote: string;
  corridorMiles: number;
  camps: CampStop[];
  error?: string;
};

export type CampHereContact = {
  www?: { value?: string }[];
};

export type CampHereItem = FuelHereItem & {
  contacts?: CampHereContact[];
};
export type CampOverpassEl = FuelOverpassEl;

const CAMP_WEBSITE_TAG_KEYS = ["website", "contact:website", "url"] as const;

const RV_NAME_RE =
  /\b(rv park|rv resort|rv campground|koa|thousand trails|good sam|sun outdoors|caravan park|holiday park)\b/i;

const MOBILE_HOME_RE = /\bmobile home\b/i;

export function campSourceLabel(source: CampSource): string {
  return source === "here" ? "HERE Places" : "OpenStreetMap Overpass";
}

export function campSourceNote(source: CampSource): string {
  const who =
    source === "here"
      ? "HERE Places camping / RV parks along this corridor — not live pad inventory. Site length from nearby OSM maxlength* when tagged."
      : "OpenStreetMap Overpass (tourism=camp_site / caravan_site) — not live pad inventory.";
  return `${who} Availability, hookups, and site length change; confirm before you pull in.`;
}

function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function taggedYes(raw: string | undefined): boolean {
  return /^(yes|true|designated)$/i.test(raw || "");
}

export function looksLikeResidentialPark(name: string): boolean {
  return MOBILE_HOME_RE.test(name) && !/\brv\b/i.test(name);
}

export function looksLikeRvPark(opts: {
  name: string;
  categories?: string[];
  tags?: Record<string, string>;
}): boolean {
  if (looksLikeResidentialPark(opts.name)) return false;
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

/**
 * Honest website only — OSM `website` / `contact:website` / `url`,
 * or HERE `contacts[].www[].value`. No generated booking search URLs.
 */
export function normalizeCampWebsite(
  raw: string | undefined | null,
): string | undefined {
  const s = (raw || "").trim();
  if (!s || /\s/.test(s)) return undefined;
  let candidate = s;
  if (!/^https?:\/\//i.test(candidate)) {
    if (!/^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i.test(candidate)) return undefined;
    candidate = `https://${candidate}`;
  }
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    if (!u.hostname.includes(".")) return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

export function campWebsiteFromTags(
  tags: Record<string, string> | undefined,
): string | undefined {
  if (!tags) return undefined;
  for (const key of CAMP_WEBSITE_TAG_KEYS) {
    const found = normalizeCampWebsite(tags[key]);
    if (found) return found;
  }
  return undefined;
}

export function campWebsiteFromHere(item: CampHereItem): string | undefined {
  for (const contact of item.contacts ?? []) {
    for (const www of contact.www ?? []) {
      const found = normalizeCampWebsite(www.value);
      if (found) return found;
    }
  }
  return undefined;
}

const OSM_FT_PER_M = 3.28084;
const SITE_LENGTH_MIN_FT = 10;
const SITE_LENGTH_MAX_FT = 90;
/** OSM default unit is metres. Unitless values above this are not assumed to be feet. */
const SITE_LENGTH_MAX_UNITLESS_M = 27;

const OSM_LENGTH_RE =
  /^(\d+(?:\.\d+)?)\s*(ft|feet|foot|'|′|m|meter|meters|metre|metres)?$/i;

/** Honest size sources only — not capacity (site count) or tents (amenity). */
export const OSM_SITE_LENGTH_KEYS = [
  "maxlength:motorhome",
  "maxlength:motor_caravan",
  "maxlength:motorcaravan",
  "maxlength:rv",
  "maxlength:caravans",
  "maxlength",
] as const;

/**
 * Parse one OSM length tag to feet. Never guesses ranges, conditionals,
 * or unitless US pad-feet (e.g. `45` with no unit is rejected).
 */
export function parseOsmLengthToFt(
  raw: string | undefined | null,
): number | undefined {
  const s = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/,$/, "")
    .replace(/\.$/, "");
  if (!s) return undefined;
  const match = s.match(OSM_LENGTH_RE);
  if (!match) return undefined;
  const n = Number(match[1]);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  const unit = (match[2] || "").toLowerCase();
  let ft: number;
  if (unit === "ft" || unit === "feet" || unit === "foot" || unit === "'" || unit === "′") {
    ft = n;
  } else if (
    unit === "m" ||
    unit === "meter" ||
    unit === "meters" ||
    unit === "metre" ||
    unit === "metres"
  ) {
    ft = n * OSM_FT_PER_M;
  } else if (!unit) {
    if (n > SITE_LENGTH_MAX_UNITLESS_M) return undefined;
    ft = n * OSM_FT_PER_M;
  } else {
    return undefined;
  }
  const rounded = Math.round(ft);
  if (rounded < SITE_LENGTH_MIN_FT || rounded > SITE_LENGTH_MAX_FT) return undefined;
  return rounded;
}

/** First parseable RV-specific maxlength* tag wins. Missing tags stay omitted. */
export function siteLengthFtFromTags(
  tags: Record<string, string> | undefined,
): number | undefined {
  if (!tags) return undefined;
  for (const key of OSM_SITE_LENGTH_KEYS) {
    const ft = parseOsmLengthToFt(tags[key]);
    if (ft != null) return ft;
  }
  return undefined;
}

const METERS_PER_MILE = 1609.344;

/** Query halo around each HERE pin so one Overpass call covers nearby OSM amenities. */
export const OSM_SITE_LENGTH_QUERY_M = 800;
/** Assign OSM maxlength only when the amenity is this close to the HERE pin. */
export const OSM_SITE_LENGTH_MATCH_M = 600;
/** Collapse HERE pins this close so we do not send duplicate around-clauses. */
export const OSM_SITE_LENGTH_CLUSTER_M = 400;

/** Overpass key regex — only the RV maxlength* tags we actually parse. */
export const OSM_SITE_LENGTH_KEY_RE =
  "^maxlength(:motorhome|:motor_caravan|:motorcaravan|:rv|:caravans)?$";

function metersBetween(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  return haversineMiles(a, b) * METERS_PER_MILE;
}

/**
 * Keep one query center per cluster so 20 HERE camps do not become 20 arounds
 * when several parks sit in the same town.
 */
export function clusterOsmLengthCenters(
  camps: Array<{ lat: number; lng: number }>,
  clusterM = OSM_SITE_LENGTH_CLUSTER_M,
): Array<{ lat: number; lng: number }> {
  const out: Array<{ lat: number; lng: number }> = [];
  for (const c of camps) {
    if (!finitePlace(c)) continue;
    if (out.some((kept) => metersBetween(kept, c) <= clusterM)) continue;
    out.push({ lat: c.lat, lng: c.lng });
  }
  return out;
}

/**
 * One batched Overpass query: camp_site / caravan_site with maxlength* near
 * clustered HERE pins. Empty input → empty query (caller skips the fetch).
 */
export function osmSiteLengthOverpassQuery(
  camps: Array<{ lat: number; lng: number }>,
): string {
  const centers = clusterOsmLengthCenters(camps);
  if (centers.length === 0) return "";
  const keyFilter = `[~"${OSM_SITE_LENGTH_KEY_RE}"~"."]`;
  const clauses = centers
    .flatMap((c) => {
      const around = `(around:${OSM_SITE_LENGTH_QUERY_M},${c.lat},${c.lng})`;
      return [
        `node["tourism"~"^(camp_site|caravan_site)$"]${keyFilter}${around};`,
        `way["tourism"~"^(camp_site|caravan_site)$"]${keyFilter}${around};`,
      ];
    })
    .join("\n  ");
  return `[out:json][timeout:6];
(
  ${clauses}
);
out center tags;`;
}

/**
 * Closest nearby OSM amenity with a parseable maxlength*. Missing = undefined.
 * Never invents; never uses capacity / tents / pitch length.
 */
export function nearestOsmSiteLengthFt(
  camp: { lat: number; lng: number },
  elements: CampOverpassEl[],
  maxM = OSM_SITE_LENGTH_MATCH_M,
): number | undefined {
  if (!finitePlace(camp)) return undefined;
  let bestFt: number | undefined;
  let bestM = Infinity;
  for (const el of elements) {
    const lat = Number(el.lat ?? el.center?.lat);
    const lng = Number(el.lon ?? el.center?.lon);
    if (!finitePlace({ lat, lng })) continue;
    const ft = siteLengthFtFromTags(el.tags);
    if (ft == null) continue;
    const m = metersBetween(camp, { lat, lng });
    if (m <= maxM && m < bestM) {
      bestM = m;
      bestFt = ft;
    }
  }
  return bestFt;
}

/**
 * Fill HERE `siteLengthFt` from nearby OSM maxlength*. Never renames the
 * HERE row. Already-set lengths and misses stay as they are.
 */
export function enrichHereCampsWithOsmSiteLength(
  camps: CampStop[],
  elements: CampOverpassEl[],
): CampStop[] {
  if (camps.length === 0 || elements.length === 0) return camps;
  return camps.map((camp) => {
    if (camp.siteLengthFt != null) return camp;
    const siteLengthFt = nearestOsmSiteLengthFt(camp, elements);
    if (siteLengthFt == null) return camp;
    return { ...camp, siteLengthFt };
  });
}

/**
 * Soft-fail wrapper: Overpass timeout / throw leaves HERE camps unchanged.
 * Does not invent sizes. Does not block on an empty list.
 */
export async function withOsmSiteLengthOrUnchanged(
  camps: CampStop[],
  fetchElements: (camps: CampStop[]) => Promise<CampOverpassEl[]>,
): Promise<CampStop[]> {
  if (camps.length === 0) return camps;
  try {
    const els = await fetchElements(camps);
    return enrichHereCampsWithOsmSiteLength(camps, els);
  } catch {
    return camps;
  }
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
    if (!name || looksLikeResidentialPark(name)) continue;
    const categories = (item.categories ?? [])
      .map((c) => String(c.id || ""))
      .filter(Boolean);
    const kept = keepCampPoi({ lat, lng }, corridor, widthMi);
    if (!kept) continue;
    const website = campWebsiteFromHere(item);
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
      ...(website ? { website } : {}),
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
    if (!name || looksLikeResidentialPark(name)) continue;
    const kept = keepCampPoi({ lat, lng }, corridor, widthMi);
    if (!kept) continue;
    const website = campWebsiteFromTags(tags);
    const siteLengthFt = siteLengthFtFromTags(tags);
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
      ...(siteLengthFt != null ? { siteLengthFt } : {}),
      ...(website ? { website } : {}),
    });
  }
  return camps;
}

export function dedupCamps(camps: CampStop[]): CampStop[] {
  const seen = new Map<string, CampStop>();
  for (const c of camps) {
    const key = `${c.name.toLowerCase()}|${c.city.toLowerCase()}|${c.lat.toFixed(2)}|${c.lng.toFixed(2)}`;
    const prev = seen.get(key);
    if (!prev || c.milesOff < prev.milesOff) seen.set(key, c);
  }
  return [...seen.values()];
}

export function rankCamps(camps: CampStop[]): CampStop[] {
  return [...camps].sort((a, b) => {
    if (Math.abs(a.progress - b.progress) > 0.02) return a.progress - b.progress;
    if (a.kind !== b.kind) return a.kind === "rv-park" ? -1 : 1;
    return a.milesOff - b.milesOff;
  });
}

export function finalizeCamps(
  camps: CampStop[],
  limit = MAX_CAMPS,
): CampStop[] {
  const unique = rankCamps(dedupCamps(camps));
  if (unique.length <= limit) return unique;
  const dest = unique.filter((c) => c.nearDest);
  const rest = unique.filter((c) => !c.nearDest);
  const destSlots = Math.min(dest.length, Math.max(4, Math.round(limit * 0.3)));
  const alongSlots = limit - destSlots;
  const buckets: CampStop[][] = [[], [], [], [], []];
  for (const c of rest) {
    const i = Math.min(4, Math.max(0, Math.floor(c.progress * 5)));
    buckets[i]!.push(c);
  }
  const along: CampStop[] = [];
  let cursor = 0;
  while (along.length < alongSlots && buckets.some((b) => b.length)) {
    const bucket = buckets[cursor % 5]!;
    const next = bucket.shift();
    if (next) along.push(next);
    cursor += 1;
  }
  return rankCamps([...along, ...dest.slice(0, destSlots)]);
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
