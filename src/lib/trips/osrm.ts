/**
 * OSRM client types + helpers for GET /api/osrm
 */

export type OsrmLngLat = { lng: number; lat: number };

export type OsrmLineString = {
  type: "LineString";
  coordinates: [number, number][];
};

export type OsrmStep = {
  instruction: string;
  name: string;
  distanceM: number;
  durationS: number;
  maneuver: string;
  location: OsrmLngLat | null;
};

export type OsrmRouteResult = {
  source: "osrm" | "here";
  engine: string;
  baseUrl: string;
  profile: string;
  code: string;
  distanceM: number;
  durationS: number;
  miles: number;
  driveHours: number;
  driveMinutes: number;
  geometry: OsrmLineString | null;
  steps: OsrmStep[];
  waypoints: {
    name: string;
    location: OsrmLngLat;
  }[];
  origin: OsrmLngLat;
  destination: OsrmLngLat;
  fetchedAt: string;
  /** RV weight ranking meta */
  weightMode?: string;
  routeScore?: number;
  avgSpeedMph?: number;
  alternativesConsidered?: number;
  scoreBreakdown?: {
    turns: number;
    minorRoadM: number;
    highwayM: number;
    parts: Record<string, number>;
  };
  /** Hybrid routing */
  routingMode?: "standard" | "rv_safe";
  providerNote?: string;
  fallbackFrom?: string;
};

export type OsrmRouteError = {
  error: string;
  code?: string;
};

/** Default demo corridor (NV I-80 corridor → Glacier NP staging) */
export const DEFAULT_ORIGIN: OsrmLngLat = { lng: -119.767, lat: 39.529 };
export const DEFAULT_DESTINATION: OsrmLngLat = { lng: -113.718, lat: 48.759 };

const CLIENT_CACHE_PREFIX = "rvfax_osrm_v1:";
const CLIENT_TTL_MS = 15 * 60 * 1000;

export function parseLngLat(
  raw: string | null | undefined,
): OsrmLngLat | null {
  if (!raw) return null;
  const parts = raw.split(",").map((s) => s.trim());
  if (parts.length !== 2) return null;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (Math.abs(a) <= 90 && Math.abs(b) > 90) {
    return { lat: a, lng: b };
  }
  if (Math.abs(a) > 90 && Math.abs(b) <= 90) {
    return { lng: a, lat: b };
  }
  // Prefer lng,lat (OSRM order) when both look like lng/lat
  return { lng: a, lat: b };
}

export function formatOsrmCoords(points: OsrmLngLat[]): string {
  return points.map((p) => `${p.lng},${p.lat}`).join(";");
}

export function splitDuration(seconds: number): {
  driveHours: number;
  driveMinutes: number;
} {
  const totalMin = Math.max(0, Math.round(seconds / 60));
  return {
    driveHours: Math.floor(totalMin / 60),
    driveMinutes: totalMin % 60,
  };
}

export function metersToMiles(m: number): number {
  return Math.round((m / 1609.344) * 10) / 10;
}

function stepInstruction(step: Record<string, unknown>): string {
  const man = (step.maneuver as Record<string, unknown>) || {};
  const type = String(man.type ?? "continue");
  const modifier = man.modifier ? String(man.modifier) : "";
  const name = String(step.name ?? "").trim();
  const ref = String(step.ref ?? "").trim();
  const road = name || ref || "road";

  const verb = (() => {
    switch (type) {
      case "depart":
        return "Depart";
      case "arrive":
        return "Arrive";
      case "turn":
        return modifier ? `Turn ${modifier}` : "Turn";
      case "new name":
        return "Continue";
      case "merge":
        return modifier ? `Merge ${modifier}` : "Merge";
      case "on ramp":
        return "Take the ramp";
      case "off ramp":
        return modifier ? `Take exit ${modifier}` : "Take the exit";
      case "fork":
        return modifier ? `Keep ${modifier}` : "At the fork";
      case "end of road":
        return modifier ? `Turn ${modifier} at end of road` : "End of road";
      case "roundabout":
      case "rotary":
        return "Enter roundabout";
      case "notification":
        return "Continue";
      default:
        return modifier ? `${type} ${modifier}` : type;
    }
  })();

  if (type === "arrive")
    return name ? `Arrive at ${name}` : "Arrive at destination";
  if (type === "depart") return name ? `Head out on ${road}` : "Depart";
  return name ? `${verb} onto ${road}` : verb;
}

/** Drop noise steps to keep Directions UI snappy */
export function compactSteps(steps: OsrmStep[]): OsrmStep[] {
  return steps.filter(
    (s) =>
      s.maneuver === "depart" ||
      s.maneuver === "arrive" ||
      s.distanceM >= 500 ||
      /turn|ramp|merge|fork|exit|roundabout/i.test(
        `${s.maneuver} ${s.instruction}`,
      ),
  );
}

export function normalizeOsrmResponse(
  json: Record<string, unknown>,
  opts: {
    origin: OsrmLngLat;
    destination: OsrmLngLat;
    profile: string;
    baseUrl: string;
    routeIndex?: number;
  },
): OsrmRouteResult {
  const code = String(json.code ?? "Unknown");
  const routes = (json.routes as Record<string, unknown>[]) || [];
  const idx = Math.min(
    Math.max(0, opts.routeIndex ?? 0),
    Math.max(0, routes.length - 1),
  );
  const route = routes[idx];
  if (!route) {
    throw new Error(code === "Ok" ? "No route returned" : `OSRM: ${code}`);
  }

  const distanceM = Number(route.distance ?? 0);
  const durationS = Number(route.duration ?? 0);
  const { driveHours, driveMinutes } = splitDuration(durationS);

  let geometry: OsrmLineString | null = null;
  const geom = route.geometry as Record<string, unknown> | string | undefined;
  if (
    geom &&
    typeof geom === "object" &&
    geom.type === "LineString" &&
    Array.isArray(geom.coordinates)
  ) {
    const coords = geom.coordinates as [number, number][];
    geometry = {
      type: "LineString",
      coordinates: downsampleLine(coords, 400),
    };
  }

  const steps: OsrmStep[] = [];
  const legs = (route.legs as Record<string, unknown>[]) || [];
  for (const leg of legs) {
    const legSteps = (leg.steps as Record<string, unknown>[]) || [];
    for (const st of legSteps) {
      const man = (st.maneuver as Record<string, unknown>) || {};
      const loc = man.location as number[] | undefined;
      steps.push({
        instruction: stepInstruction(st),
        name: String(st.name ?? ""),
        distanceM: Number(st.distance ?? 0),
        durationS: Number(st.duration ?? 0),
        maneuver: String(man.type ?? ""),
        location:
          loc && loc.length >= 2 ? { lng: loc[0], lat: loc[1] } : null,
      });
    }
  }

  const waypoints = ((json.waypoints as Record<string, unknown>[]) || []).map(
    (w) => {
      const loc = (w.location as number[]) || [0, 0];
      return {
        name: String(w.name ?? ""),
        location: { lng: Number(loc[0]), lat: Number(loc[1]) },
      };
    },
  );

  return {
    source: "osrm",
    engine: "REAL ROUTE · OSRM",
    baseUrl: opts.baseUrl,
    profile: opts.profile,
    code,
    distanceM,
    durationS,
    miles: metersToMiles(distanceM),
    driveHours,
    driveMinutes,
    geometry,
    steps: compactSteps(steps),
    waypoints,
    origin: opts.origin,
    destination: opts.destination,
    fetchedAt: new Date().toISOString(),
  };
}

function downsampleLine(
  coords: [number, number][],
  maxPoints: number,
): [number, number][] {
  if (coords.length <= maxPoints) return coords;
  const out: [number, number][] = [];
  const last = coords.length - 1;
  for (let i = 0; i < maxPoints; i++) {
    const idx =
      i === maxPoints - 1 ? last : Math.round((i * last) / (maxPoints - 1));
    out.push(coords[idx]);
  }
  return out;
}

function clientCacheKey(from: OsrmLngLat, to: OsrmLngLat, overview: string) {
  return `${CLIENT_CACHE_PREFIX}${from.lng.toFixed(4)},${from.lat.toFixed(4)}>${to.lng.toFixed(4)},${to.lat.toFixed(4)}:${overview}`;
}

function readClientCache(key: string): OsrmRouteResult | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: OsrmRouteResult };
    if (Date.now() - parsed.at > CLIENT_TTL_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeClientCache(key: string, data: OsrmRouteResult) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* quota */
  }
}

/** Browser helper — session cache first, then /api/osrm */
export async function fetchOsrmRoute(params: {
  from?: OsrmLngLat;
  to?: OsrmLngLat;
  profile?: string;
  overview?: "simplified" | "full" | "false";
  preset?: "light" | "scenic";
  radius?: number | "unlimited";
  exclude?: string;
  continueStraight?: boolean;
  weight?: "rv" | "fastest" | "shortest" | "scenic";
  signal?: AbortSignal;
  bypassCache?: boolean;
}): Promise<OsrmRouteResult> {
  const from = params.from ?? DEFAULT_ORIGIN;
  const to = params.to ?? DEFAULT_DESTINATION;
  const overview = params.overview ?? "simplified";
  const cacheTag = [
    overview,
    params.preset ?? "",
    params.radius ?? "",
    params.exclude ?? "",
    params.weight ?? "rv",
    params.continueStraight === false ? "cs0" : "cs1",
  ].join(":");
  const key = clientCacheKey(from, to, cacheTag);

  if (!params.bypassCache) {
    const hit = readClientCache(key);
    if (hit) return hit;
  }

  const qs = new URLSearchParams({
    from: `${from.lng},${from.lat}`,
    to: `${to.lng},${to.lat}`,
    overview,
  });
  if (params.profile) qs.set("profile", params.profile);
  if (params.preset) qs.set("preset", params.preset);
  if (params.radius != null) qs.set("radius", String(params.radius));
  if (params.exclude) qs.set("exclude", params.exclude);
  if (params.weight) qs.set("weight", params.weight);
  if (params.continueStraight === false) qs.set("continue_straight", "false");

  const res = await fetch(`/api/osrm?${qs}`, {
    signal: params.signal,
    headers: { Accept: "application/json" },
  });
  const json = (await res.json()) as OsrmRouteResult & OsrmRouteError;
  if (!res.ok) {
    throw new Error(json.error || `Route failed (${res.status})`);
  }
  const data = json as OsrmRouteResult;
  writeClientCache(key, data);
  return data;
}
