import { createFileRoute } from "@tanstack/react-router";
import {
  catalogAfterHereProbe,
  hereRasterV2Url,
  hereRasterV3Url,
  isValidTile,
  osmCatalog,
  parseTileCoord,
  PROBE_TILE,
  type TileCatalog,
} from "@/lib/trips/basemap";

/**
 * GET /api/map-tiles
 *
 * No z/x/y → probe which raster source the Production key can actually
 * fetch. HERE Raster Tile API is a different product than Truck routing;
 * a 403/401 falls back to OSM. Never a stock photo.
 *
 * z,x,y → proxy one HERE PNG (key stays server-side). OSM tiles are
 * loaded by the browser directly.
 *
 * Tiles only — no rates, no catalog dump, no dead hybrid path.
 */

const PROBE_TIMEOUT_MS = 4_000;
const TILE_TIMEOUT_MS = 6_000;
const CACHE_OK_MS = 30 * 60 * 1000;
const CACHE_MISS_MS = 10 * 60 * 1000;

type HereKind = "v3" | "v2";
type ProbeCache = {
  at: number;
  ok: boolean;
  kind: HereKind | null;
  reason?: string;
  catalog: TileCatalog;
};

let probeCache: ProbeCache | null = null;

function hereKey(): string {
  return (
    process.env.HERE_API_KEY?.trim() ||
    process.env.VITE_HERE_API_KEY?.trim() ||
    ""
  );
}

function cacheFresh(row: ProbeCache | null): row is ProbeCache {
  if (!row) return false;
  const ttl = row.ok ? CACHE_OK_MS : CACHE_MISS_MS;
  return Date.now() - row.at < ttl;
}

function hereTileUrl(kind: HereKind, z: number, x: number, y: number, key: string) {
  return kind === "v3"
    ? hereRasterV3Url(z, x, y, key)
    : hereRasterV2Url(z, x, y, key);
}

async function fetchHereTile(
  kind: HereKind,
  z: number,
  x: number,
  y: number,
  key: string,
  timeoutMs: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(hereTileUrl(kind, z, x, y, key), {
      signal: ctrl.signal,
      headers: { Accept: "image/png,image/*;q=0.8,*/*;q=0.1" },
    });
  } finally {
    clearTimeout(timer);
  }
}

function looksLikeImage(resp: Response): boolean {
  if (!resp.ok) return false;
  const type = (resp.headers.get("content-type") || "").toLowerCase();
  if (type.includes("json") || type.includes("text/html")) return false;
  if (type.includes("image")) return true;
  return type === "" || type.includes("octet-stream");
}

async function probeHere(key: string): Promise<ProbeCache> {
  if (cacheFresh(probeCache)) return probeCache;
  const { z, x, y } = PROBE_TILE;
  const kinds: HereKind[] = ["v3", "v2"];
  let reason = "no response";
  for (const kind of kinds) {
    try {
      const resp = await fetchHereTile(kind, z, x, y, key, PROBE_TIMEOUT_MS);
      if (looksLikeImage(resp)) {
        probeCache = {
          at: Date.now(),
          ok: true,
          kind,
          catalog: catalogAfterHereProbe(true),
        };
        return probeCache;
      }
      reason = `HTTP ${resp.status}`;
    } catch (e) {
      reason = e instanceof Error && e.name === "AbortError" ? "timeout" : "error";
    }
  }
  probeCache = {
    at: Date.now(),
    ok: false,
    kind: null,
    reason,
    catalog: catalogAfterHereProbe(false, reason),
  };
  return probeCache;
}

function jsonCatalog(catalog: TileCatalog, extra?: Record<string, string>) {
  return Response.json(catalog, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "X-Map-Tiles": catalog.provider,
      ...extra,
    },
  });
}

export const Route = createFileRoute("/api/map-tiles")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const zRaw = url.searchParams.get("z");
        const xRaw = url.searchParams.get("x");
        const yRaw = url.searchParams.get("y");
        const wantsTile = zRaw != null || xRaw != null || yRaw != null;

        if (wantsTile) {
          const z = parseTileCoord(zRaw, 15);
          const n = z == null ? 0 : 2 ** z - 1;
          const x = parseTileCoord(xRaw, n);
          const y = parseTileCoord(yRaw, n);
          if (z == null || x == null || y == null || !isValidTile(z, x, y)) {
            return Response.json(
              { error: "z, x, y required as integer tile coords" },
              { status: 400 },
            );
          }
          const key = hereKey();
          if (!key) {
            return Response.json(
              { error: "HERE map tiles not configured" },
              { status: 404 },
            );
          }
          const probed = await probeHere(key);
          if (!probed.ok || !probed.kind) {
            return Response.json(
              { error: probed.catalog.note },
              { status: 404 },
            );
          }
          try {
            const up = await fetchHereTile(
              probed.kind,
              z,
              x,
              y,
              key,
              TILE_TIMEOUT_MS,
            );
            if (!looksLikeImage(up)) {
              probeCache = {
                at: Date.now(),
                ok: false,
                kind: null,
                reason: `HTTP ${up.status}`,
                catalog: catalogAfterHereProbe(false, `HTTP ${up.status}`),
              };
              return Response.json(
                { error: "HERE tile fetch failed" },
                { status: 502 },
              );
            }
            return new Response(up.body, {
              status: 200,
              headers: {
                "Content-Type": up.headers.get("content-type") || "image/png",
                "Cache-Control": "public, max-age=86400",
                "X-Map-Tiles": "here",
              },
            });
          } catch {
            return Response.json(
              { error: "HERE tile proxy failed" },
              { status: 502 },
            );
          }
        }

        const key = hereKey();
        if (!key) {
          return jsonCatalog(osmCatalog(), { "X-Here-Configured": "0" });
        }
        const probed = await probeHere(key);
        return jsonCatalog(probed.catalog, {
          "X-Here-Configured": "1",
          "X-Here-Tiles": probed.ok ? "1" : "0",
        });
      },
    },
  },
});
