/**
 * Route-aware restriction notes.
 * HERE Truck → real notices from the hybrid response.
 * OSRM / car fallback → no invented clearance DB. Ferry word-match
 * only, and only when labeled as a text hint.
 */

import type { TripAlert } from "@/lib/trips/tripData";
import type { CoachProfile } from "@/lib/trips/coachFromCatalog";
import type { OsrmRouteResult, RouteNotice } from "@/lib/trips/osrm";
import { canUseRvSafe } from "@/lib/trips/navigateRoute";

export type RestrictionSource = "here" | "heuristic" | "none";

export type RestrictionAnalysis = {
  alerts: TripAlert[];
  canSuggestSafer: boolean;
  summary: string;
  banner: string;
  source: RestrictionSource;
};

export type SaferRouteIntent = "here_truck" | "osrm_rerank" | "none";

const FERRY_RE = /\b(ferry|boat)\b/i;
const LOCAL_RE =
  /\b(residential|service|alley|drive|lane|court|circle|trail|farm|forest)\b/i;

const empty: RestrictionAnalysis = {
  alerts: [],
  canSuggestSafer: false,
  summary: "",
  banner: "",
  source: "none",
};

export function isHereTruckRoute(
  route: Pick<OsrmRouteResult, "source" | "fallbackFrom"> | null | undefined,
): boolean {
  return route?.source === "here" && !route.fallbackFrom;
}

function kindFromNotice(n: RouteNotice): string {
  const blob = `${n.code} ${n.title} ${n.cause || ""}`.toLowerCase();
  if (/height|overpass|clearance/.test(blob)) return "HEIGHT CLEARANCE";
  if (/width|narrow/.test(blob)) return "WIDTH RESTRICTION";
  if (/\blength\b/.test(blob)) return "LENGTH RESTRICTION";
  if (/weight|axle|gross/.test(blob)) return "WEIGHT RESTRICTION";
  if (/tunnel|propane|hazard|hazmat/.test(blob)) return "TUNNEL / HAZMAT";
  if (/ferry/.test(blob)) return "FERRY ON ROUTE";
  if (/seasonal|closure|blocked/.test(blob)) return "ROAD CLOSURE";
  if (/zone/.test(blob)) return "ZONE RESTRICTION";
  if (/vehicle/i.test(n.code)) return "VEHICLE RESTRICTION";
  return "HERE NOTICE";
}

function noticeSeverity(n: RouteNotice): TripAlert["severity"] {
  if (n.severity === "critical") return "critical";
  if (/violated/i.test(n.code)) return "caution";
  return "info";
}

function alertsFromHereNotices(notices: RouteNotice[]): TripAlert[] {
  return notices.map((n, i) => ({
    id: `here-${i}-${n.code}`,
    severity: noticeSeverity(n),
    kind: kindFromNotice(n),
    title: n.title || n.code,
    body:
      n.cause ||
      "HERE Truck flagged this segment for the locked coach dimensions.",
  }));
}

function fromHereNotices(notices: RouteNotice[]): RestrictionAnalysis {
  const alerts = alertsFromHereNotices(notices);
  return {
    alerts,
    canSuggestSafer: false,
    summary:
      alerts.length === 0
        ? "HERE Truck reported no restriction notices."
        : `${alerts.length} HERE Truck notice${alerts.length === 1 ? "" : "s"} on this path.`,
    banner: alerts.length ? "HERE Truck notices" : "",
    source: alerts.length ? "here" : "none",
  };
}

/**
 * Analyze the live route. HERE Truck uses API notices only.
 * OSRM never pretends we have a clearance database.
 */
export function analyzeRouteRestrictions(opts: {
  coach: CoachProfile | null;
  route: OsrmRouteResult | null;
  hasRoute: boolean;
  destLabel?: string;
  originLabel?: string;
}): RestrictionAnalysis {
  const coach = opts.coach;
  if (!coach?.make || !coach.lengthFt || !coach.heightFt) return empty;
  if (!opts.hasRoute || !opts.route) return empty;

  const route = opts.route;
  if ((!route.steps || route.steps.length === 0) && route.miles <= 0) {
    return empty;
  }

  if (isHereTruckRoute(route)) {
    return fromHereNotices(route.notices ?? []);
  }

  const steps = route.steps || [];
  const hasFerry = steps.some((s) =>
    FERRY_RE.test(`${s.instruction} ${s.name}`),
  );
  const localHeavy =
    steps.filter((s) => LOCAL_RE.test(`${s.name} ${s.instruction}`)).length >=
    4;
  const highwayM = route.scoreBreakdown?.highwayM;
  const canUseShare =
    typeof highwayM === "number" &&
    Number.isFinite(highwayM) &&
    (route.distanceM || 0) > 0;
  const lowHighway =
    canUseShare && highwayM / Math.max(1, route.distanceM) < 0.4;

  const alerts: TripAlert[] = [];
  if (hasFerry) {
    alerts.push({
      id: "ferry-text",
      severity: "info",
      kind: "TEXT HINT",
      title: "Ferry mentioned in directions",
      body: "Instruction text mentions a ferry. Word match only — not a clearance database. Confirm before you roll.",
    });
  }

  const canSuggestSafer = hasFerry || localHeavy || lowHighway;

  return {
    alerts,
    canSuggestSafer,
    summary: alerts.length
      ? "Text hint from directions — not a clearance database."
      : "OSRM path — no clearance database. Lock a coach for HERE Truck notices.",
    banner: alerts.length ? "Text hints — not a clearance database" : "",
    source: alerts.length ? "heuristic" : "none",
  };
}

/** Locked + dims, but current path is still plain OSRM (not a hybrid fallback). */
export function lockedNeedsHereTruck(
  coach: Parameters<typeof canUseRvSafe>[0],
  route: OsrmRouteResult | null,
): boolean {
  if (!canUseRvSafe(coach) || !route) return false;
  if (isHereTruckRoute(route)) return false;
  if (route.fallbackFrom === "here" || route.routingMode === "rv_safe") {
    return false;
  }
  return route.source !== "here";
}

export function saferRouteIntent(opts: {
  coach: Parameters<typeof canUseRvSafe>[0];
  route: OsrmRouteResult | null;
  canSuggestSafer: boolean;
}): SaferRouteIntent {
  if (!opts.route) return "none";
  if (isHereTruckRoute(opts.route)) return "none";
  if (lockedNeedsHereTruck(opts.coach, opts.route)) return "here_truck";
  if (!opts.canSuggestSafer) return "none";
  return "osrm_rerank";
}

export function saferCtaLabel(intent: SaferRouteIntent): string {
  if (intent === "here_truck") return "Safer RV · HERE Truck";
  if (intent === "osrm_rerank") return "OSRM highway re-rank";
  return "";
}

export function saferBusyLabel(intent: SaferRouteIntent): string {
  if (intent === "here_truck") return "Requesting HERE Truck…";
  if (intent === "osrm_rerank") return "Re-ranking on OSRM…";
  return "";
}

export function saferAppliedNote(
  intent: SaferRouteIntent,
  route: OsrmRouteResult | null,
): string {
  if (intent === "here_truck") {
    if (isHereTruckRoute(route)) {
      return "Applied HERE Truck path — height and weight on the polyline.";
    }
    return "HERE Truck unavailable — OSRM RV-weighted fallback. Not truck routing.";
  }
  return "Applied OSRM highway re-rank — not truck routing.";
}

export function saferOsrmParams(coach: CoachProfile | null): {
  weight: "rv";
  exclude?: string;
} {
  if (coach && coach.heightFt >= 12) {
    return { weight: "rv", exclude: "ferry" };
  }
  return { weight: "rv" };
}
