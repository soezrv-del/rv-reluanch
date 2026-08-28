import { createFileRoute } from "@tanstack/react-router";
import {
  formatOsrmCoords,
  normalizeOsrmResponse,
  parseLngLat,
  type OsrmLngLat,
  type OsrmRouteResult,
} from "@/lib/trips/osrm";
import {
  cacheGet,
  cacheKey,
  cacheSet,
  withInflight,
} from "@/lib/trips/osrmCache";
import {
  profileCacheSig,
  resolveOsrmProfile,
  softenExcludes,
  softenRadiuses,
  toOsrmQuery,
  type OsrmProfileParams,
} from "@/lib/trips/osrmProfile";
import {
  rankOsrmRoutes,
  type RouteWeightMode,
} from "@/lib/trips/osrmWeights";

/**
 * GET /api/osrm
 *
 * RV-tuned OSRM proxy. Defaults favor Class A / campground routing.
 *
 * Core: from, to = lng,lat
 * Knobs: profile, overview, steps, alternatives, radius,
 *        continue_straight, approach, exclude, snapping
 * Presets: preset=light | scenic
 *
 * Env: OSRM_BASE_URL
 */

const DEFAULT_OSRM = "https://router.project-osrm.org";
const UPSTREAM_TIMEOUT_MS = 12_000;

function osrmBase(): string {
  const raw = process.env.OSRM_BASE_URL?.trim() || DEFAULT_OSRM;
  return raw.replace(/\/$/, "");
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

function jsonResponse(
  data: unknown,
  init?: { status?: number; cache?: string; extra?: Record<string, string> },
) {
  return Response.json(data, {
    status: init?.status ?? 200,
    headers: {
      "Cache-Control":
        init?.cache ?? "public, max-age=300, stale-while-revalidate=3600",
      "X-OSRM-Proxy": "rvfax",
      ...init?.extra,
    },
  });
}

async function fetchUpstream(opts: {
  from: OsrmLngLat;
  to: OsrmLngLat;
  params: OsrmProfileParams;
  base: string;
  weightMode?: RouteWeightMode;
}): Promise<OsrmRouteResult> {
  const coords = formatOsrmCoords([opts.from, opts.to]);
  const profilePath =
    opts.params.profile === "car" ? "driving" : opts.params.profile;
  const qs = toOsrmQuery(opts.params);
  // Pull alternatives so we can re-rank with RV weights
  const wm = opts.weightMode || "rv";
  if (wm === "rv" || wm === "scenic") {
    qs.set("alternatives", "true");
  }
  // Steps needed for turn/road-class weight features
  if (wm === "rv" || wm === "scenic") {
    qs.set("steps", "true");
  }
  const osrmUrl = `${opts.base}/route/v1/${profilePath}/${coords}?${qs}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const resp = await fetch(osrmUrl, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "RVFAX-RvTrips/1.0 (OSRM proxy; +https://rvfax.app)",
      },
    });
    const text = await resp.text();
    let json: Record<string, unknown>;
    try {
      json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      throw new Error("OSRM returned non-JSON");
    }

    if (!resp.ok) {
      const err = new Error(
        (json.message as string) ||
          (json.code as string) ||
          `OSRM HTTP ${resp.status}`,
      ) as Error & {
        status?: number;
        code?: unknown;
        retryableExclude?: boolean;
      };
      err.status = resp.status;
      err.code = json.code;
      const msg = String(json.message ?? json.code ?? "");
      if (
        opts.params.exclude.length > 0 &&
        (resp.status === 400 ||
          /Invalid|Exclude/i.test(msg) ||
          String(json.code ?? "").includes("Invalid"))
      ) {
        err.retryableExclude = true;
      }
      throw err;
    }

    const code = String(json.code ?? "");
    if (code && code !== "Ok") {
      const err = new Error(
        String((json.message as string) || `OSRM: ${code}`),
      ) as Error & {
        status?: number;
        code?: string;
        retryableExclude?: boolean;
      };
      err.status = 422;
      err.code = code;
      err.retryableExclude = /InvalidQuery/i.test(code);
      throw err;
    }

    const routes = (json.routes as Record<string, unknown>[]) || [];
    const weightMode = (opts.weightMode || "rv") as RouteWeightMode;
    const { bestIndex, rankings } = rankOsrmRoutes(routes, weightMode);
    const best = rankings[0];

    const data = normalizeOsrmResponse(json, {
      origin: opts.from,
      destination: opts.to,
      profile: profilePath,
      baseUrl: opts.base,
      routeIndex: bestIndex,
    });

    const excl =
      opts.params.exclude.length > 0
        ? ` · -${opts.params.exclude.join(",")}`
        : "";
    const modeTag = weightMode === "rv" ? "RV-w" : weightMode;
    return {
      ...data,
      engine: `REAL ROUTE · OSRM · ${modeTag} · r${opts.params.radiusM}${excl}`,
      weightMode,
      routeScore: best ? Math.round(best.score) : undefined,
      avgSpeedMph: best?.avgSpeedMph,
      alternativesConsidered: routes.length,
      scoreBreakdown: best
        ? {
            turns: best.turns,
            minorRoadM: Math.round(best.minorRoadM),
            highwayM: Math.round(best.highwayM),
            parts: {
              duration: Math.round(best.parts.duration),
              distance: Math.round(best.parts.distance),
              turns: Math.round(best.parts.turns),
              minor: Math.round(best.parts.minor),
              highway: Math.round(best.parts.highway),
              lowSpeed: Math.round(best.parts.lowSpeed),
            },
          }
        : undefined,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(opts: {
  from: OsrmLngLat;
  to: OsrmLngLat;
  params: OsrmProfileParams;
  base: string;
  weightMode?: RouteWeightMode;
}): Promise<{ data: OsrmRouteResult; params: OsrmProfileParams }> {
  let params = opts.params;
  try {
    const data = await fetchUpstream({ ...opts, params });
    return { data, params };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code?: unknown }).code ?? "")
        : "";
    const retryExclude =
      e &&
      typeof e === "object" &&
      "retryableExclude" in e &&
      Boolean((e as { retryableExclude?: boolean }).retryableExclude);

    // 1) Drop unsupported exclude flags
    if (retryExclude && params.exclude.length) {
      params = softenExcludes(params);
      try {
        const data = await fetchUpstream({ ...opts, params });
        return { data, params };
      } catch {
        /* fall through */
      }
    }

    // 2) NoSegment → unlimited snap radius (rural / park pins)
    if (/NoSegment|matching segment/i.test(msg + code)) {
      const softR = softenRadiuses(params);
      if (profileCacheSig(softR) !== profileCacheSig(params)) {
        const data = await fetchUpstream({ ...opts, params: softR });
        return { data, params: softR };
      }
    }

    throw e;
  }
}

export const Route = createFileRoute("/api/osrm")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const from = parseLngLat(url.searchParams.get("from"));
        const to = parseLngLat(url.searchParams.get("to"));

        if (!isValidPoint(from) || !isValidPoint(to)) {
          return jsonResponse(
            {
              error:
                "from and to are required as coordinates (lng,lat), e.g. from=-119.77,39.53&to=-113.72,48.76",
            },
            { status: 400, cache: "no-store" },
          );
        }

        const params = resolveOsrmProfile(url.searchParams);
        const weightRaw = (url.searchParams.get("weight") || "rv").toLowerCase();
        const weightMode = (
          ["rv", "fastest", "shortest", "scenic"].includes(weightRaw)
            ? weightRaw
            : "rv"
        ) as RouteWeightMode;
        const base = osrmBase();
        const key = cacheKey({
          from,
          to,
          profileSig: `${profileCacheSig(params)}|w:${weightMode}`,
        });

        const cached = cacheGet(key);
        if (cached?.fresh) {
          return jsonResponse(
            { ...cached.data, profile: params },
            { extra: { "X-OSRM-Cache": "HIT" } },
          );
        }

        try {
          const { data, params: usedParams } = await withInflight(key, async () => {
            const r = await fetchWithRetry({
              from,
              to,
              params,
              base,
              weightMode,
            });
            cacheSet(key, r.data);
            return r;
          });

          return jsonResponse(
            { ...data, profile: usedParams },
            {
              extra: {
                "X-OSRM-Cache": cached ? "REFRESH" : "MISS",
                "X-OSRM-Profile": profileCacheSig(usedParams),
              },
            },
          );
        } catch (e) {
          if (cached && !cached.fresh) {
            return jsonResponse(
              {
                ...cached.data,
                engine: "REAL ROUTE · OSRM (cached)",
                profile: params,
              },
              { extra: { "X-OSRM-Cache": "STALE" } },
            );
          }

          const msg = e instanceof Error ? e.message : "OSRM request failed";
          const statusCode =
            e && typeof e === "object" && "status" in e
              ? Number((e as { status?: number }).status) || 502
              : /abort/i.test(msg)
                ? 504
                : 502;

          return jsonResponse(
            {
              error:
                statusCode === 504
                  ? "OSRM route timed out — try again or use offline demo"
                  : msg,
              code:
                e && typeof e === "object" && "code" in e
                  ? (e as { code?: unknown }).code
                  : undefined,
              profile: params,
            },
            {
              status:
                statusCode >= 400 && statusCode < 600 ? statusCode : 502,
              cache: "no-store",
              extra: { "X-OSRM-Cache": "ERROR" },
            },
          );
        }
      },
    },
  },
});
