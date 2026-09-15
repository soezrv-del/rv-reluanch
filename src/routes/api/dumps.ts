import { createFileRoute } from "@tanstack/react-router";
import { parseLngLat, type OsrmLngLat } from "@/lib/trips/osrm";
import {
  clampCorridorWidthMi,
  effectiveCorridorWidthMi,
  encodePathParam,
  parsePathParam,
  resolveCorridor,
  sampleCorridorPoints,
} from "@/lib/trips/corridorFuel";
import {
  DEFAULT_DUMP_WIDTH_MI,
  DUMP_DEST_QUERY_RADIUS_M,
  DUMP_QUERY_RADIUS_M,
  curatedStopsOnCorridor,
  dumpSourceLabel,
  dumpSourceNote,
  emptyDumpResult,
  finalizeDumps,
  mergeDumpStops,
  normalizeOverpassDumps,
  type DumpOverpassEl,
  type DumpSearchResult,
  type DumpSource,
  type DumpStop,
} from "@/lib/trips/corridorDumps";

/**
 * GET /api/dumps
 *
 * Sanitary dump / sewer stations near the planned corridor and dest.
 * OpenStreetMap Overpass only — no HERE Places, no paid dump APIs.
 * Empty list on failure — never invents stations or prices.
 *
 * from,to = lng,lat
 * via,path = lng,lat|lng,lat
 * widthMi = corridor half-width (default 15)
 */

const OVERPASS_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 15 * 60 * 1000;

const cache = new Map<string, { at: number; data: DumpSearchResult }>();

function jsonResponse(data: DumpSearchResult, extra?: Record<string, string>) {
  return Response.json(data, {
    headers: {
      "Cache-Control": "private, max-age=120",
      "X-Dumps-Source": data.source,
      ...extra,
    },
  });
}

function overpassQuery(centers: OsrmLngLat[], dest?: OsrmLngLat): string {
  const spots = dest ? [...centers, dest] : centers;
  const clauses = spots
    .flatMap((c, i) => {
      const r =
        dest && i === spots.length - 1
          ? DUMP_DEST_QUERY_RADIUS_M
          : DUMP_QUERY_RADIUS_M;
      const around = `(around:${r},${c.lat},${c.lng})`;
      return [
        `node["amenity"="sanitary_dump_station"]${around};`,
        `way["amenity"="sanitary_dump_station"]${around};`,
        `node["sanitary_dump_station"="yes"]${around};`,
        `way["sanitary_dump_station"="yes"]${around};`,
        `node["waterway"="sanitary_dump_station"]${around};`,
      ];
    })
    .join("\n  ");
  return `[out:json][timeout:18];
(
  ${clauses}
);
out center tags 80;`;
}

async function fetchOverpass(
  centers: OsrmLngLat[],
  dest?: OsrmLngLat,
): Promise<DumpOverpassEl[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "RVFAX-RvTrips/1.0 (dumps corridor; +https://rvfax.app)",
      },
      body: `data=${encodeURIComponent(overpassQuery(centers, dest))}`,
    });
    const json = (await resp.json()) as {
      elements?: DumpOverpassEl[];
      remark?: string;
    };
    if (!resp.ok) {
      throw new Error(`Overpass HTTP ${resp.status}`);
    }
    return Array.isArray(json.elements) ? json.elements : [];
  } finally {
    clearTimeout(timer);
  }
}

function packResult(
  source: DumpSource,
  widthMi: number,
  dumps: DumpStop[],
  error?: string,
): DumpSearchResult {
  return {
    source,
    sourceLabel: dumpSourceLabel(source),
    sourceNote: dumpSourceNote(source),
    corridorMiles: widthMi,
    dumps: finalizeDumps(dumps),
    ...(error ? { error } : {}),
  };
}

export const Route = createFileRoute("/api/dumps")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = parseLngLat(url.searchParams.get("from"));
        const to = parseLngLat(url.searchParams.get("to"));
        const via = parsePathParam(url.searchParams.get("via"));
        const path = parsePathParam(url.searchParams.get("path"));
        const requestedWidth = clampCorridorWidthMi(
          url.searchParams.get("widthMi") ?? DEFAULT_DUMP_WIDTH_MI,
        );

        const corridor = resolveCorridor({ from, to, via, path });
        if (!corridor || corridor.length < 2) {
          return Response.json(
            { error: "from and to required as lng,lat (optional path/via)" },
            { status: 400 },
          );
        }

        const widthMi = effectiveCorridorWidthMi(requestedWidth, corridor.length);
        const centers = sampleCorridorPoints(corridor);
        const dest = corridor[corridor.length - 1];
        const cacheKey = `${encodePathParam(centers)}|w${widthMi}|d`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
          return jsonResponse(cached.data, { "X-Dumps-Cache": "HIT" });
        }

        const curated = curatedStopsOnCorridor(corridor, widthMi);

        try {
          const elements = await fetchOverpass(centers, dest);
          const osm = normalizeOverpassDumps(elements, corridor, widthMi);
          const data = packResult(
            "overpass",
            widthMi,
            mergeDumpStops(osm, curated),
          );
          cache.set(cacheKey, { at: Date.now(), data });
          return jsonResponse(data, { "X-Dumps-Cache": "MISS" });
        } catch (e) {
          if (curated.length > 0) {
            const data = packResult(
              "curated",
              widthMi,
              curated,
              `Overpass unavailable (${e instanceof Error ? e.message : "error"}) · curated known-free on this corridor`,
            );
            cache.set(cacheKey, { at: Date.now(), data });
            return jsonResponse(data, {
              "X-Dumps-Cache": "MISS",
              "X-Dumps-Fallback": "curated",
            });
          }
          return jsonResponse(
            emptyDumpResult(
              "overpass",
              widthMi,
              e instanceof Error ? e.message : "Dump search failed",
            ),
            { "X-Dumps-Cache": "ERROR" },
          );
        }
      },
    },
  },
});
