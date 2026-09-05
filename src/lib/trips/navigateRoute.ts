/**
 * Navigate route picker: locked coach + dims → /api?mode=rv_safe
 * (HERE Truck when the server has HERE_API_KEY). File route
 * src/routes/api/route.ts is registered at GET /api, not /api/route.
 * Everything else stays on fetchOsrmRoute. No invented specs — only pass
 * profile fields the API already accepts.
 */

import {
  fetchOsrmRoute,
  metersToMiles,
  splitDuration,
  type OsrmLngLat,
  type OsrmRouteError,
  type OsrmRouteResult,
} from "./osrm.ts";
import { liveRouteStats } from "./routeResults.ts";

/** Thin coach shape — avoid pulling the catalog graph into route tests. */
export type RvSafeCoachInput = {
  locked?: boolean;
  heightFt?: number;
  widthFt?: number;
  lengthFt?: number;
  weightLbs?: number;
  type?: string;
};

function positive(n: number | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

/** Locked profile with real height / length / weight — no class defaults. */
export function canUseRvSafe(coach: RvSafeCoachInput | null | undefined): boolean {
  if (!coach?.locked) return false;
  return positive(coach.heightFt) && positive(coach.lengthFt) && positive(coach.weightLbs);
}

/** Query string for GET /api — existing params only. */
export function buildRvSafeQuery(
  from: OsrmLngLat,
  to: OsrmLngLat,
  coach: RvSafeCoachInput,
): URLSearchParams {
  const qs = new URLSearchParams({
    mode: "rv_safe",
    from: `${from.lng},${from.lat}`,
    to: `${to.lng},${to.lat}`,
  });
  if (positive(coach.heightFt)) qs.set("heightFt", String(coach.heightFt));
  if (positive(coach.lengthFt)) qs.set("lengthFt", String(coach.lengthFt));
  if (positive(coach.weightLbs)) qs.set("weightLbs", String(coach.weightLbs));
  if (positive(coach.widthFt)) qs.set("widthFt", String(coach.widthFt));
  const type = (coach.type || "").trim();
  if (type) qs.set("coachType", type);
  return qs;
}

function looksLikeRoute(json: OsrmRouteResult & OsrmRouteError): boolean {
  if (json.error && !json.geometry && !(json.miles > 0) && !json.steps?.length) {
    return false;
  }
  return (
    json.geometry != null ||
    (typeof json.miles === "number" && Number.isFinite(json.miles)) ||
    Boolean(json.steps?.length)
  );
}

/** Short header chip — Truck vs car fallback vs plain OSRM. */
export function routeEngineLabel(
  route: Pick<
    OsrmRouteResult,
    "source" | "fallbackFrom" | "routingMode"
  > | null,
): string {
  if (!route) return "OSRM";
  if (route.source === "here" && !route.fallbackFrom) return "HERE Truck";
  if (route.fallbackFrom === "here" || route.routingMode === "rv_safe") {
    return "OSRM · car fallback";
  }
  return "OSRM";
}

export function routeEngineNote(route: OsrmRouteResult | null): string {
  if (!route) return "";
  const note = (route.providerNote || "").trim();
  if (note) return note;
  if (route.source === "here") return "HERE Truck — height/weight applied to the polyline";
  return route.engine || "";
}

function finiteLngLat(p: OsrmLngLat | null | undefined): p is OsrmLngLat {
  return (
    !!p &&
    Number.isFinite(p.lng) &&
    Number.isFinite(p.lat) &&
    Math.abs(p.lat) <= 90 &&
    Math.abs(p.lng) <= 180
  );
}

function finiteNonNeg(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0;
}

/** Ordered origin → vias → dest. Drops invalid vias. */
export function routeStopOrder(
  from: OsrmLngLat,
  to: OsrmLngLat,
  via: OsrmLngLat[] | undefined,
): OsrmLngLat[] {
  const mids = (via ?? []).filter(finiteLngLat);
  return [from, ...mids, to];
}

/**
 * Sum live API legs only. Missing miles/time on any hop → null.
 * Never invents a corridor or DEMO_ROUTE numbers.
 */
export function mergeLiveLegs(legs: OsrmRouteResult[]): OsrmRouteResult | null {
  if (legs.length === 0) return null;
  const stats = legs.map((leg) => liveRouteStats(leg));
  if (stats.some((s) => !s)) return null;
  if (legs.length === 1) return legs[0] ?? null;

  let distanceM = 0;
  let durationS = 0;
  let hasM = true;
  let hasS = true;
  for (const leg of legs) {
    if (finiteNonNeg(leg.distanceM)) distanceM += leg.distanceM;
    else hasM = false;
    if (finiteNonNeg(leg.durationS)) durationS += leg.durationS;
    else hasS = false;
  }

  const miles = hasM
    ? metersToMiles(distanceM)
    : Math.round(stats.reduce((sum, s) => sum + s!.miles, 0) * 10) / 10;
  const split = hasS
    ? splitDuration(durationS)
    : (() => {
        const mins = stats.reduce(
          (sum, s) => sum + s!.driveHours * 60 + s!.driveMinutes,
          0,
        );
        return {
          driveHours: Math.floor(mins / 60),
          driveMinutes: mins % 60,
        };
      })();

  const coords: [number, number][] = [];
  for (const leg of legs) {
    const c = leg.geometry?.coordinates;
    if (!c?.length) continue;
    if (coords.length) {
      const last = coords[coords.length - 1]!;
      const first = c[0]!;
      const skip = last[0] === first[0] && last[1] === first[1];
      coords.push(...(skip ? c.slice(1) : c));
    } else {
      coords.push(...c);
    }
  }

  const first = legs[0]!;
  const last = legs[legs.length - 1]!;
  const labels = legs.map((leg) => routeEngineLabel(leg));
  const sameEngine = labels.every((label) => label === labels[0]);
  const engineFields = sameEngine
    ? {
        source: first.source,
        engine: first.engine,
        fallbackFrom: first.fallbackFrom,
        routingMode: first.routingMode,
        providerNote: first.providerNote,
      }
    : {
        source: "osrm" as const,
        engine: first.engine,
        fallbackFrom: legs.some((leg) => leg.fallbackFrom === "here")
          ? "here"
          : first.fallbackFrom,
        routingMode: legs.some((leg) => leg.routingMode === "rv_safe")
          ? ("rv_safe" as const)
          : first.routingMode,
        providerNote: undefined,
      };

  return {
    ...first,
    ...engineFields,
    distanceM: hasM ? distanceM : first.distanceM,
    durationS: hasS ? durationS : first.durationS,
    miles,
    driveHours: split.driveHours,
    driveMinutes: split.driveMinutes,
    geometry:
      coords.length >= 2
        ? { type: "LineString", coordinates: coords }
        : first.geometry,
    steps: legs.flatMap((leg) => leg.steps ?? []),
    waypoints: legs.flatMap((leg, i) =>
      i === 0 ? leg.waypoints : (leg.waypoints ?? []).slice(1),
    ),
    origin: first.origin,
    destination: last.destination,
    fetchedAt: last.fetchedAt || first.fetchedAt,
  };
}

async function fetchOneLeg(params: {
  from: OsrmLngLat;
  to: OsrmLngLat;
  coach?: RvSafeCoachInput | null;
  signal?: AbortSignal;
}): Promise<OsrmRouteResult> {
  if (canUseRvSafe(params.coach) && params.coach) {
    try {
      const qs = buildRvSafeQuery(params.from, params.to, params.coach);
      const res = await fetch(`/api?${qs}`, {
        signal: params.signal,
        headers: { Accept: "application/json" },
      });
      const json = (await res.json()) as OsrmRouteResult & OsrmRouteError;
      if (res.ok && looksLikeRoute(json)) {
        return json as OsrmRouteResult;
      }
    } catch (e) {
      if (params.signal?.aborted) throw e;
      /* HERE/hybrid failed — fall through to OSRM */
    }
  }

  return fetchOsrmRoute({
    from: params.from,
    to: params.to,
    signal: params.signal,
  });
}

/**
 * Locked + dims → /api?mode=rv_safe. Unlocked, missing dims, or a
 * failed/empty hybrid response → existing fetchOsrmRoute. Abort is not
 * treated as a fallback (caller is tearing down).
 *
 * Optional `via` hops stitch consecutive legs with the same helpers —
 * never `/api/route`. Totals are the live-leg sum only.
 */
export async function fetchNavigateRoute(params: {
  from: OsrmLngLat;
  to: OsrmLngLat;
  via?: OsrmLngLat[];
  coach?: RvSafeCoachInput | null;
  signal?: AbortSignal;
}): Promise<OsrmRouteResult> {
  const stops = routeStopOrder(params.from, params.to, params.via);
  if (stops.length === 2) {
    return fetchOneLeg({
      from: params.from,
      to: params.to,
      coach: params.coach,
      signal: params.signal,
    });
  }

  const legs: OsrmRouteResult[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    legs.push(
      await fetchOneLeg({
        from: stops[i]!,
        to: stops[i + 1]!,
        coach: params.coach,
        signal: params.signal,
      }),
    );
  }
  const merged = mergeLiveLegs(legs);
  if (!merged) {
    throw new Error("Route returned no miles or time");
  }
  return merged;
}
