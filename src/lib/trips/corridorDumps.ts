/**
 * Sanitary dump / sewer stations along a live corridor.
 * Never invents stations or prices — OSM Overpass tags + curated known-free only.
 */

import {
  encodePathParam,
  finitePlace,
  haversineMiles,
  sampleCorridorPoints,
  type FuelOverpassEl,
} from "./corridorFuel.ts";
import { keepCampPoi } from "./corridorCamps.ts";
import {
  DUMP_FEE_LABEL,
  FREE_DUMP_STATIONS,
  curatedDumpFee,
  feeFromOsmTags,
  nearestCuratedDump,
  type DumpFee,
} from "./dumpStations.ts";
import type { OsrmLngLat } from "./osrm.ts";

export const DEFAULT_DUMP_WIDTH_MI = 15;
export const MAX_DUMPS = 20;
/** ~20 mi — pairs with 40 mi center spacing so 1000+ mi corridors stay covered. */
export const DUMP_QUERY_RADIUS_M = 32_000;
export const DUMP_DEST_QUERY_RADIUS_M = 36_000;
export const DUMP_SAMPLE_SPACING_MI = 40;
export const DUMP_MAX_QUERY_CENTERS = 16;
export const DUMP_QUERY_BATCH = 8;
export const CURATED_MATCH_MI = 0.4;

/** Public OSM Overpass interpreters — free, no key. Primary then mirrors. */
export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.osm.ch/api/interpreter",
] as const;

export function sampleDumpCenters(corridor: OsrmLngLat[]): OsrmLngLat[] {
  return sampleCorridorPoints(corridor, {
    targetSpacingMiles: DUMP_SAMPLE_SPACING_MI,
    maxPoints: DUMP_MAX_QUERY_CENTERS,
    minPoints: 3,
  });
}

export function chunkDumpCenters(
  centers: OsrmLngLat[],
  size = DUMP_QUERY_BATCH,
): OsrmLngLat[][] {
  const n = Math.max(1, Math.floor(size));
  const out: OsrmLngLat[][] = [];
  for (let i = 0; i < centers.length; i += n) {
    out.push(centers.slice(i, i + n));
  }
  return out;
}

export type DumpKind = "dump";
export type DumpSource = "overpass" | "curated";

export type DumpStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  kind: DumpKind;
  fee: DumpFee;
  feeLabel: string;
  city: string;
  state: string;
  address: string;
  milesOff: number;
  progress: number;
  nearDest: boolean;
  source: DumpSource;
};

export type DumpSearchResult = {
  source: DumpSource;
  sourceLabel: string;
  sourceNote: string;
  corridorMiles: number;
  dumps: DumpStop[];
  error?: string;
};

export type DumpOverpassEl = FuelOverpassEl;

export function dumpSourceLabel(source: DumpSource): string {
  return source === "curated"
    ? "Curated known-free dumps"
    : "OpenStreetMap Overpass";
}

export function dumpSourceNote(source: DumpSource): string {
  if (source === "curated") {
    return "Curated western known-free dumps on this corridor — Overpass was unavailable. Hours change; confirm before you dump.";
  }
  return "OpenStreetMap Overpass (amenity=sanitary_dump_station) along this corridor. Fee from OSM fee=yes / fee=no only — missing tag is Fee unknown, not a price. Hours and access change; confirm before you dump.";
}

function cleanName(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

function dumpNameFromTags(tags: Record<string, string>): string {
  return (
    cleanName(
      tags.name || tags.brand || tags.operator || tags["name:en"] || "",
    ) || "Sanitary dump station"
  );
}

export function dumpPinKind(
  fee: DumpFee,
): "dump-free" | "dump-paid" | "dump-unknown" {
  if (fee === "free") return "dump-free";
  if (fee === "paid") return "dump-paid";
  return "dump-unknown";
}

export function normalizeOverpassDumps(
  elements: DumpOverpassEl[],
  corridor: OsrmLngLat[],
  widthMi: number,
): DumpStop[] {
  const dumps: DumpStop[] = [];
  for (const el of elements) {
    const lat = Number(el.lat ?? el.center?.lat);
    const lng = Number(el.lon ?? el.center?.lon);
    if (!finitePlace({ lat, lng })) continue;
    const tags = el.tags ?? {};
    const kept = keepCampPoi({ lat, lng }, corridor, widthMi);
    if (!kept) continue;
    const fee = feeFromOsmTags(tags);
    dumps.push({
      id: `osm-dump:${el.type || "n"}:${el.id ?? `${lat.toFixed(4)},${lng.toFixed(4)}`}`,
      name: dumpNameFromTags(tags),
      lat,
      lng,
      kind: "dump",
      fee,
      feeLabel: DUMP_FEE_LABEL[fee],
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
      source: "overpass",
    });
  }
  return dumps;
}

export function curatedStopsOnCorridor(
  corridor: OsrmLngLat[],
  widthMi: number,
): DumpStop[] {
  const dumps: DumpStop[] = [];
  const fee = curatedDumpFee();
  for (const d of FREE_DUMP_STATIONS) {
    const kept = keepCampPoi({ lat: d.lat, lng: d.lng }, corridor, widthMi);
    if (!kept) continue;
    dumps.push({
      id: `curated:${d.id}`,
      name: d.name,
      lat: d.lat,
      lng: d.lng,
      kind: "dump",
      fee,
      feeLabel: DUMP_FEE_LABEL[fee],
      city: d.city,
      state: d.state,
      address: d.address,
      milesOff: Math.round(kept.milesOff * 10) / 10,
      progress: kept.progress,
      nearDest: kept.nearDest,
      source: "curated",
    });
  }
  return dumps;
}

/**
 * Overlay curated known-free rows onto Overpass dumps on the same corridor.
 * Never override an OSM fee=yes (paid) with curated free.
 */
export function mergeDumpStops(
  osm: DumpStop[],
  curated: DumpStop[],
): DumpStop[] {
  const merged = osm.map((s) => ({ ...s }));
  for (const c of curated) {
    const hit = merged.find((s) => haversineMiles(s, c) <= CURATED_MATCH_MI);
    if (hit) {
      if (hit.fee === "unknown") {
        hit.fee = "free";
        hit.feeLabel = DUMP_FEE_LABEL.free;
        hit.source = "curated";
      }
      if (/^sanitary dump/i.test(hit.name)) hit.name = c.name;
      if (!hit.city) hit.city = c.city;
      if (!hit.state) hit.state = c.state;
      if (!hit.address) hit.address = c.address;
    } else {
      merged.push({ ...c });
    }
  }
  return merged;
}

export function enrichOsmWithCuratedName(stop: DumpStop): DumpStop {
  if (stop.fee === "paid") return stop;
  const near = nearestCuratedDump(stop.lat, stop.lng, CURATED_MATCH_MI);
  if (!near) return stop;
  const next = { ...stop };
  if (stop.fee === "unknown") {
    next.fee = "free";
    next.feeLabel = DUMP_FEE_LABEL.free;
    next.source = "curated";
  }
  if (/^sanitary dump/i.test(next.name)) next.name = near.name;
  if (!next.city) next.city = near.city;
  if (!next.state) next.state = near.state;
  return next;
}

export function dedupDumps(dumps: DumpStop[]): DumpStop[] {
  const seen = new Map<string, DumpStop>();
  for (const d of dumps) {
    const key = `${d.lat.toFixed(3)}|${d.lng.toFixed(3)}`;
    const prev = seen.get(key);
    if (!prev || d.milesOff < prev.milesOff) seen.set(key, d);
  }
  return [...seen.values()];
}

export function rankDumps(dumps: DumpStop[]): DumpStop[] {
  return [...dumps].sort((a, b) => {
    if (a.nearDest !== b.nearDest && Math.abs(a.progress - b.progress) > 0.08) {
      return a.nearDest ? 1 : -1;
    }
    if (Math.abs(a.progress - b.progress) > 0.02) return a.progress - b.progress;
    if (a.fee !== b.fee) {
      const order: Record<DumpFee, number> = { free: 0, paid: 1, unknown: 2 };
      return order[a.fee] - order[b.fee];
    }
    return a.milesOff - b.milesOff;
  });
}

export function finalizeDumps(
  dumps: DumpStop[],
  limit = MAX_DUMPS,
): DumpStop[] {
  const unique = rankDumps(dedupDumps(dumps.map(enrichOsmWithCuratedName)));
  if (unique.length <= limit) return unique;
  const dest = unique.filter((d) => d.nearDest);
  const rest = unique.filter((d) => !d.nearDest);
  const destSlots = Math.min(dest.length, Math.max(3, Math.round(limit * 0.25)));
  const alongSlots = limit - destSlots;
  return rankDumps([...rest.slice(0, alongSlots), ...dest.slice(0, destSlots)]);
}

export function emptyDumpResult(
  source: DumpSource,
  widthMi: number,
  error?: string,
): DumpSearchResult {
  return {
    source,
    sourceLabel: dumpSourceLabel(source),
    sourceNote: dumpSourceNote(source),
    corridorMiles: widthMi,
    dumps: [],
    ...(error ? { error } : {}),
  };
}

export function dumpMapsUrl(dump: Pick<DumpStop, "lat" | "lng" | "name">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${dump.lat},${dump.lng}`,
  )}`;
}

export function buildDumpsQuery(opts: {
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

export { feeFromOsmTags, DUMP_FEE_LABEL };
