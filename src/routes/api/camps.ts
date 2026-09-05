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
  CAMP_QUERY_RADIUS_M,
  DEST_QUERY_RADIUS_M,
  DEFAULT_CAMP_WIDTH_MI,
  HERE_CAMP_CATEGORIES,
  campSourceLabel,
  campSourceNote,
  emptyCampResult,
  finalizeCamps,
  normalizeHereCamps,
  normalizeOverpassCamps,
  type CampHereItem,
  type CampOverpassEl,
  type CampSearchResult,
  type CampSource,
  type CampStop,
} from "@/lib/trips/corridorCamps";

/**
 * GET /api/camps
 *
 * Live campground / RV-park POIs near the planned corridor and dest.
 * HERE Places when HERE_API_KEY is set; else OpenStreetMap Overpass.
 * Empty list on failure — never invents pads.
 *
 * from,to = lng,lat
 * via,path = lng,lat|lng,lat
 * widthMi = corridor half-width (default 15)
 */

const HERE_TIMEOUT_MS = 8_000;
const OVERPASS_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 15 * 60 * 1000;

const cache = new Map<string, { at: number; data: CampSearchResult }>();

function hereKey(): string {
  return (
    process.env.HERE_API_KEY?.trim() ||
    process.env.VITE_HERE_API_KEY?.trim() ||
    ""
  );
}

function jsonResponse(data: CampSearchResult, extra?: Record<string, string>) {
  return Response.json(data, {
    headers: {
      "Cache-Control": "private, max-age=120",
      "X-Camps-Source": data.source,
      ...extra,
    },
  });
}

async function fetchHereCircle(
  center: OsrmLngLat,
  apiKey: string,
  radiusM: number,
): Promise<CampHereItem[]> {
  const qs = new URLSearchParams({
    at: `${center.lat},${center.lng}`,
    in: `circle:${center.lat},${center.lng};r=${radiusM}`,
    categories: HERE_CAMP_CATEGORIES,
    limit: "12",
    lang: "en-US",
    apikey: apiKey,
  });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), HERE_TIMEOUT_MS);
  try {
    const resp = await fetch(
      `https://browse.search.hereapi.com/v1/browse?${qs}`,
      { signal: ctrl.signal, headers: { Accept: "application/json" } },
    );
    const json = (await resp.json()) as {
      items?: CampHereItem[];
      title?: string;
      cause?: string;
    };
    if (!resp.ok) {
      throw new Error(json.title || json.cause || `HERE HTTP ${resp.status}`);
    }
    return Array.isArray(json.items) ? json.items : [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHereAlongCorridor(
  centers: OsrmLngLat[],
  dest: OsrmLngLat | undefined,
  apiKey: string,
): Promise<CampHereItem[]> {
  const jobs = centers.map((c) =>
    fetchHereCircle(c, apiKey, CAMP_QUERY_RADIUS_M),
  );
  if (dest) jobs.push(fetchHereCircle(dest, apiKey, DEST_QUERY_RADIUS_M));
  const batches = await Promise.allSettled(jobs);
  const items: CampHereItem[] = [];
  let failures = 0;
  for (const b of batches) {
    if (b.status === "fulfilled") items.push(...b.value);
    else failures += 1;
  }
  if (items.length === 0 && failures === jobs.length) {
    throw new Error("HERE Places unavailable");
  }
  return items;
}

function overpassQuery(centers: OsrmLngLat[], dest?: OsrmLngLat): string {
  const spots = dest
    ? [...centers, dest]
    : centers;
  const clauses = spots
    .flatMap((c, i) => {
      const r = dest && i === spots.length - 1 ? DEST_QUERY_RADIUS_M : CAMP_QUERY_RADIUS_M;
      const around = `(around:${r},${c.lat},${c.lng})`;
      return [
        `node["tourism"="camp_site"]${around};`,
        `way["tourism"="camp_site"]${around};`,
        `node["tourism"="caravan_site"]${around};`,
        `way["tourism"="caravan_site"]${around};`,
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
): Promise<CampOverpassEl[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "RVFAX-RvTrips/1.0 (camps corridor; +https://rvfax.app)",
      },
      body: `data=${encodeURIComponent(overpassQuery(centers, dest))}`,
    });
    const json = (await resp.json()) as {
      elements?: CampOverpassEl[];
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
  source: CampSource,
  widthMi: number,
  camps: CampStop[],
  error?: string,
): CampSearchResult {
  return {
    source,
    sourceLabel: campSourceLabel(source),
    sourceNote: campSourceNote(source),
    corridorMiles: widthMi,
    camps: finalizeCamps(camps),
    ...(error ? { error } : {}),
  };
}

export const Route = createFileRoute("/api/camps")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = parseLngLat(url.searchParams.get("from"));
        const to = parseLngLat(url.searchParams.get("to"));
        const via = parsePathParam(url.searchParams.get("via"));
        const path = parsePathParam(url.searchParams.get("path"));
        const requestedWidth = clampCorridorWidthMi(
          url.searchParams.get("widthMi") ?? DEFAULT_CAMP_WIDTH_MI,
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
        const cacheKey = `${encodePathParam(centers)}|w${widthMi}|c|${hereKey() ? "h" : "o"}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
          return jsonResponse(cached.data, { "X-Camps-Cache": "HIT" });
        }

        const key = hereKey();
        try {
          if (key) {
            try {
              const items = await fetchHereAlongCorridor(centers, dest, key);
              const data = packResult(
                "here",
                widthMi,
                normalizeHereCamps(items, corridor, widthMi),
              );
              cache.set(cacheKey, { at: Date.now(), data });
              return jsonResponse(data, { "X-Camps-Cache": "MISS" });
            } catch (hereErr) {
              const elements = await fetchOverpass(centers, dest);
              const data = packResult(
                "overpass",
                widthMi,
                normalizeOverpassCamps(elements, corridor, widthMi),
                `HERE Places unavailable (${hereErr instanceof Error ? hereErr.message : "error"}) · OpenStreetMap Overpass`,
              );
              cache.set(cacheKey, { at: Date.now(), data });
              return jsonResponse(data, {
                "X-Camps-Cache": "MISS",
                "X-Camps-Fallback": "overpass",
              });
            }
          }

          const elements = await fetchOverpass(centers, dest);
          const data = packResult(
            "overpass",
            widthMi,
            normalizeOverpassCamps(elements, corridor, widthMi),
          );
          cache.set(cacheKey, { at: Date.now(), data });
          return jsonResponse(data, { "X-Camps-Cache": "MISS" });
        } catch (e) {
          const source: CampSource = key ? "here" : "overpass";
          return jsonResponse(
            emptyCampResult(
              source,
              widthMi,
              e instanceof Error ? e.message : "Campground search failed",
            ),
            { "X-Camps-Cache": "ERROR" },
          );
        }
      },
    },
  },
});
