/**
 * Navigate route picker: locked coach + dims → /api/route?mode=rv_safe
 * (HERE Truck when the server has HERE_API_KEY). Everything else stays on
 * fetchOsrmRoute. No invented specs — only pass profile fields the API
 * already accepts.
 */

import {
  fetchOsrmRoute,
  type OsrmLngLat,
  type OsrmRouteError,
  type OsrmRouteResult,
} from "./osrm.ts";

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

/** Query string for GET /api/route — existing params only. */
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

/**
 * Locked + dims → /api/route?mode=rv_safe. Unlocked, missing dims, or a
 * failed/empty hybrid response → existing fetchOsrmRoute. Abort is not
 * treated as a fallback (caller is tearing down).
 */
export async function fetchNavigateRoute(params: {
  from: OsrmLngLat;
  to: OsrmLngLat;
  coach?: RvSafeCoachInput | null;
  signal?: AbortSignal;
}): Promise<OsrmRouteResult> {
  if (canUseRvSafe(params.coach) && params.coach) {
    try {
      const qs = buildRvSafeQuery(params.from, params.to, params.coach);
      const res = await fetch(`/api/route?${qs}`, {
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
