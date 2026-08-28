import { createFileRoute } from "@tanstack/react-router";
import {
  formatOsrmCoords,
  normalizeOsrmResponse,
  parseLngLat,
  type OsrmLngLat,
  type OsrmRouteResult,
} from "@/lib/trips/osrm";
import {
  buildHereRouteUrl,
  coachToTruckVehicle,
  normalizeHereRoute,
} from "@/lib/trips/hereRouting";
import {
  RV_OSRM_DEFAULTS,
  toOsrmQuery,
} from "@/lib/trips/osrmProfile";
import { rankOsrmRoutes } from "@/lib/trips/osrmWeights";

/**
 * GET /api/route
 *
 * Hybrid routing:
 *   mode=standard  → OSRM RV weights
 *   mode=rv_safe   → HERE Truck when HERE_API_KEY is set, else OSRM fallback
 *
 * Coach dims: heightFt, widthFt, lengthFt, weightLbs, coachType, propane
 */

const DEFAULT_OSRM = "https://router.project-osrm.org";
const TIMEOUT_MS = 14_000;

function osrmBase(): string {
  return (process.env.OSRM_BASE_URL?.trim() || DEFAULT_OSRM).replace(/\/$/, "");
}

function hereKey(): string {
  return (
    process.env.HERE_API_KEY?.trim() ||
    process.env.VITE_HERE_API_KEY?.trim() ||
    ""
  );
}

function isValidPoint(p: OsrmLngLat | null): p is OsrmLngLat {
  if (!p) return false;
  return (
    Number.isFinite(p.lng) &&
    Number.isFinite(p.lat) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

function numParam(v: string | null, fallback = 0): number {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

async function fetchOsrmRv(
  from: OsrmLngLat,
  to: OsrmLngLat,
  label: "standard" | "rv_safe",
): Promise<OsrmRouteResult> {
  const base = osrmBase();
  const profileParams = {
    ...RV_OSRM_DEFAULTS,
    steps: true,
    alternatives: true,
  };
  const coords = formatOsrmCoords([from, to]);
  const profilePath =
    profileParams.profile === "car" ? "driving" : profileParams.profile;
  const qs = toOsrmQuery(profileParams);
  qs.set("alternatives", "true");
  qs.set("steps", "true");
  const url = `${base}/route/v1/${profilePath}/${coords}?${qs}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "RVFAX-RvTrips/1.0 (hybrid route)",
      },
    });
    const json = (await resp.json()) as Record<string, unknown>;
    if (!resp.ok || String(json.code ?? "") !== "Ok") {
      throw new Error(
        String(json.message || json.code || `OSRM HTTP ${resp.status}`),
      );
    }
    const routes = (json.routes as Record<string, unknown>[]) || [];
    const { bestIndex, rankings } = rankOsrmRoutes(routes, "rv");
    const best = rankings[0];
    const data = normalizeOsrmResponse(json, {
      origin: from,
      destination: to,
      profile: profilePath,
      baseUrl: base,
      routeIndex: bestIndex,
    });

    if (label === "standard") {
      return {
        ...data,
        source: "osrm",
        engine: "STANDARD · OSRM · RV-w",
        routingMode: "standard",
        weightMode: "rv",
        routeScore: best ? Math.round(best.score) : undefined,
        providerNote: "Standard route · OSRM (free)",
      };
    }

    return {
      ...data,
      source: "osrm",
      engine: "RV-SAFE fallback · OSRM · RV-w",
      routingMode: "rv_safe",
      weightMode: "rv",
      routeScore: best ? Math.round(best.score) : undefined,
      providerNote:
        "HERE key not configured — using OSRM RV-weighted fallback. Add HERE_API_KEY for true truck height/weight avoidance.",
      fallbackFrom: "here",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchHereTruck(
  from: OsrmLngLat,
  to: OsrmLngLat,
  coach: {
    heightFt: number;
    widthFt: number;
    lengthFt: number;
    weightLbs: number;
    type?: string;
    propaneRestricted?: boolean;
  },
  apiKey: string,
): Promise<OsrmRouteResult> {
  const vehicle = coachToTruckVehicle(coach);
  const url = buildHereRouteUrl({
    origin: from,
    destination: to,
    vehicle,
    apiKey,
  });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const resp = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    const json = (await resp.json()) as Record<string, unknown>;
    if (!resp.ok) {
      const title =
        (json.title as string) ||
        (json.cause as string) ||
        (json.action as string) ||
        `HERE HTTP ${resp.status}`;
      throw new Error(title);
    }
    const data = normalizeHereRoute(json, {
      origin: from,
      destination: to,
      vehicle,
    });
    return {
      ...data,
      providerNote: `${data.providerNote || ""} · Premium truck routing`.trim(),
    };
  } finally {
    clearTimeout(timer);
  }
}

export const Route = createFileRoute("/api")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = (url.searchParams.get("mode") || "standard").toLowerCase();
        const from = parseLngLat(url.searchParams.get("from"));
        const to = parseLngLat(url.searchParams.get("to"));

        if (!isValidPoint(from) || !isValidPoint(to)) {
          return Response.json(
            { error: "from and to required as lng,lat" },
            { status: 400 },
          );
        }

        const coach = {
          heightFt: numParam(url.searchParams.get("heightFt"), 12.5),
          widthFt: numParam(url.searchParams.get("widthFt"), 8.5),
          lengthFt: numParam(url.searchParams.get("lengthFt"), 35),
          weightLbs: numParam(url.searchParams.get("weightLbs"), 20000),
          type: url.searchParams.get("coachType") || undefined,
          propaneRestricted: url.searchParams.get("propane") === "1",
        };

        try {
          if (mode === "rv_safe" || mode === "premium" || mode === "here") {
            const key = hereKey();
            if (key) {
              try {
                const data = await fetchHereTruck(from, to, coach, key);
                return Response.json(data, {
                  headers: {
                    "Cache-Control": "private, max-age=120",
                    "X-Route-Engine": "here-truck",
                  },
                });
              } catch (hereErr) {
                const data = await fetchOsrmRv(from, to, "rv_safe");
                return Response.json(
                  {
                    ...data,
                    providerNote: `HERE unavailable (${hereErr instanceof Error ? hereErr.message : "error"}) · OSRM RV fallback`,
                    fallbackFrom: "here",
                  },
                  {
                    headers: {
                      "Cache-Control": "private, max-age=60",
                      "X-Route-Engine": "osrm-fallback",
                    },
                  },
                );
              }
            }
            const data = await fetchOsrmRv(from, to, "rv_safe");
            return Response.json(data, {
              headers: {
                "Cache-Control": "private, max-age=120",
                "X-Route-Engine": "osrm-rv-safe",
                "X-Here-Configured": "0",
              },
            });
          }

          const data = await fetchOsrmRv(from, to, "standard");
          return Response.json(data, {
            headers: {
              "Cache-Control": "public, max-age=300",
              "X-Route-Engine": "osrm",
            },
          });
        } catch (e) {
          return Response.json(
            {
              error: e instanceof Error ? e.message : "Routing failed",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
