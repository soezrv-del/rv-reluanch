import { createFileRoute } from "@tanstack/react-router";
import { parseLngLat, type OsrmLngLat } from "@/lib/trips/osrm";
import {
  clampCorridorWidthMi,
  emptyFuelResult,
  encodePathParam,
  finalizeFuelStops,
  HERE_FUEL_CATEGORIES,
  normalizeHereItems,
  normalizeOverpassElements,
  parsePathParam,
  QUERY_RADIUS_M,
  resolveCorridor,
  sampleCorridorPoints,
  sourceLabel,
  sourceNote,
  type FuelHereItem,
  type FuelOverpassEl,
  type FuelSearchResult,
  type FuelSource,
  type FuelStop,
} from "@/lib/trips/corridorFuel";

/**
 * GET /api/fuel
 *
 * Live fuel / truck stops near the planned corridor (origin → vias → dest).
 * HERE Places when HERE_API_KEY is set; else OpenStreetMap Overpass.
 * Empty list on failure — never invents stations.
 *
 * from,to = lng,lat
 * via,path = lng,lat|lng,lat
 * widthMi = corridor half-width (default 8)
 */

const HERE_TIMEOUT_MS = 8_000;
const OVERPASS_TIMEOUT_MS = 20_000;
const CACHE_TTL_MS = 15 * 60 * 1000;

const cache = new Map<string, { at: number; data: FuelSearchResult }>();

function hereKey(): string {
  return (
    process.env.HERE_API_KEY?.trim() ||
    process.env.VITE_HERE_API_KEY?.trim() ||
    ""
  );
}

function jsonResponse(data: FuelSearchResult, extra?: Record<string, string>) {
  return Response.json(data, {
    headers: {
      "Cache-Control": "private, max-age=120",
      "X-Fuel-Source": data.source,
      ...extra,
    },
  });
}

async function fetchHereCircle(
  center: OsrmLngLat,
  apiKey: string,
): Promise<FuelHereItem[]> {
  const qs = new URLSearchParams({
    at: `${center.lat},${center.lng}`,
    in: `circle:${center.lat},${center.lng};r=${QUERY_RADIUS_M}`,
    categories: HERE_FUEL_CATEGORIES,
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
      items?: FuelHereItem[];
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
  apiKey: string,
): Promise<FuelHereItem[]> {
  const batches = await Promise.allSettled(
    centers.map((c) => fetchHereCircle(c, apiKey)),
  );
  const items: FuelHereItem[] = [];
  let failures = 0;
  for (const b of batches) {
    if (b.status === "fulfilled") items.push(...b.value);
    else failures += 1;
  }
  if (items.length === 0 && failures === centers.length) {
    throw new Error("HERE Places unavailable");
  }
  return items;
}

function overpassQuery(centers: OsrmLngLat[]): string {
  const clauses = centers
    .flatMap((c) => {
      const around = `(around:${QUERY_RADIUS_M},${c.lat},${c.lng})`;
      return [
        `node["amenity"="fuel"]${around};`,
        `way["amenity"="fuel"]${around};`,
        `node["amenity"="truck_stop"]${around};`,
      ];
    })
    .join("\n  ");
  return `[out:json][timeout:18];
(
  ${clauses}
);
out center tags 80;`;
}

async function fetchOverpass(centers: OsrmLngLat[]): Promise<FuelOverpassEl[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), OVERPASS_TIMEOUT_MS);
  try {
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "RVFAX-RvTrips/1.0 (fuel corridor; +https://rvfax.app)",
      },
      body: `data=${encodeURIComponent(overpassQuery(centers))}`,
    });
    const json = (await resp.json()) as {
      elements?: FuelOverpassEl[];
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
  source: FuelSource,
  widthMi: number,
  stops: FuelStop[],
  error?: string,
): FuelSearchResult {
  return {
    source,
    sourceLabel: sourceLabel(source),
    sourceNote: sourceNote(source),
    corridorMiles: widthMi,
    stops: finalizeFuelStops(stops),
    ...(error ? { error } : {}),
  };
}

export const Route = createFileRoute("/api/fuel")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = parseLngLat(url.searchParams.get("from"));
        const to = parseLngLat(url.searchParams.get("to"));
        const via = parsePathParam(url.searchParams.get("via"));
        const path = parsePathParam(url.searchParams.get("path"));
        const widthMi = clampCorridorWidthMi(url.searchParams.get("widthMi"));

        const corridor = resolveCorridor({ from, to, via, path });
        if (!corridor || corridor.length < 2) {
          return Response.json(
            { error: "from and to required as lng,lat (optional path/via)" },
            { status: 400 },
          );
        }

        const centers = sampleCorridorPoints(corridor);
        const cacheKey = `${encodePathParam(centers)}|w${widthMi}|${hereKey() ? "h" : "o"}`;
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
          return jsonResponse(cached.data, { "X-Fuel-Cache": "HIT" });
        }

        const key = hereKey();
        try {
          if (key) {
            try {
              const items = await fetchHereAlongCorridor(centers, key);
              const data = packResult(
                "here",
                widthMi,
                normalizeHereItems(items, corridor, widthMi),
              );
              cache.set(cacheKey, { at: Date.now(), data });
              return jsonResponse(data, { "X-Fuel-Cache": "MISS" });
            } catch (hereErr) {
              const elements = await fetchOverpass(centers);
              const data = packResult(
                "overpass",
                widthMi,
                normalizeOverpassElements(elements, corridor, widthMi),
                `HERE Places unavailable (${hereErr instanceof Error ? hereErr.message : "error"}) · OpenStreetMap Overpass`,
              );
              cache.set(cacheKey, { at: Date.now(), data });
              return jsonResponse(data, {
                "X-Fuel-Cache": "MISS",
                "X-Fuel-Fallback": "overpass",
              });
            }
          }

          const elements = await fetchOverpass(centers);
          const data = packResult(
            "overpass",
            widthMi,
            normalizeOverpassElements(elements, corridor, widthMi),
          );
          cache.set(cacheKey, { at: Date.now(), data });
          return jsonResponse(data, { "X-Fuel-Cache": "MISS" });
        } catch (e) {
          const source: FuelSource = key ? "here" : "overpass";
          return jsonResponse(
            emptyFuelResult(
              source,
              widthMi,
              e instanceof Error ? e.message : "Fuel search failed",
            ),
            { "X-Fuel-Cache": "ERROR" },
          );
        }
      },
    },
  },
});
