/**
 * Route-aware RV restriction analysis.
 * Only fires with a coach profile AND a calculated route.
 */

import type { TripAlert } from "@/lib/trips/tripData";
import type { CoachProfile } from "@/lib/trips/coachFromCatalog";
import type { OsrmRouteResult, OsrmStep } from "@/lib/trips/osrm";

export type RestrictionAnalysis = {
  alerts: TripAlert[];
  canSuggestSafer: boolean;
  summary: string;
};

const TUNNEL_RE =
  /\b(tunnel|underpass|tube|bore|subway|zion|carmel|newfound)\b/i;
const GRADE_RE =
  /\b(pass|summit|canyon|mountain|grade|sierra|cascade|rockies|glacier|yellowstone|banff|steep)\b/i;
const FERRY_RE = /\b(ferry|boat)\b/i;
const PARK_RE =
  /\b(national park|state park|\bnp\b|going-to-the-sun|scenic|parkway)\b/i;
const LOCAL_RE =
  /\b(residential|service|alley|drive|lane|court|circle|trail|farm|forest)\b/i;
const BRIDGE_RE = /\b(bridge|viaduct|overpass|causeway)\b/i;

function corpusFromRoute(
  route: OsrmRouteResult,
  destLabel: string,
  originLabel: string,
): { text: string; steps: OsrmStep[] } {
  const steps = route.steps || [];
  const parts = [
    destLabel,
    originLabel,
    route.engine,
    ...steps.map((s) => `${s.instruction} ${s.name} ${s.maneuver}`),
  ];
  return { text: parts.join(" · "), steps };
}

function stepMatches(steps: OsrmStep[], re: RegExp): boolean {
  return steps.some((s) => re.test(`${s.instruction} ${s.name}`));
}

/**
 * Analyze live OSRM route against locked coach dimensions.
 * Returns empty if no locked profile or no route.
 */
export function analyzeRouteRestrictions(opts: {
  coach: CoachProfile | null;
  route: OsrmRouteResult | null;
  hasRoute: boolean;
  destLabel?: string;
  originLabel?: string;
}): RestrictionAnalysis {
  const empty: RestrictionAnalysis = {
    alerts: [],
    canSuggestSafer: false,
    summary: "",
  };

  const coach = opts.coach;
  // Only locked profiles feed restriction analysis
  if (!coach?.locked) return empty;
  if (!coach.make || !coach.lengthFt || !coach.heightFt) return empty;
  if (!opts.hasRoute || !opts.route) return empty;

  const route = opts.route;
  // Need either steps or a real distance
  if ((!route.steps || route.steps.length === 0) && route.miles <= 0) {
    return empty;
  }

  const { text, steps } = corpusFromRoute(
    route,
    opts.destLabel || "",
    opts.originLabel || "",
  );

  const hasTunnel = TUNNEL_RE.test(text) || stepMatches(steps, TUNNEL_RE);
  const hasGrade =
    GRADE_RE.test(text) ||
    stepMatches(steps, GRADE_RE) ||
    (route.miles > 200 && (route.avgSpeedMph ?? 55) < 48);
  const hasFerry = FERRY_RE.test(text) || stepMatches(steps, FERRY_RE);
  const hasPark = PARK_RE.test(text);
  const hasBridge = BRIDGE_RE.test(text) || stepMatches(steps, BRIDGE_RE);
  const localHeavy =
    steps.filter((s) => LOCAL_RE.test(`${s.name} ${s.instruction}`)).length >=
    4;
  const highwayShare =
    (route.scoreBreakdown?.highwayM ?? 0) /
    Math.max(1, route.distanceM || 1);

  const alerts: TripAlert[] = [];
  const h = coach.heightFt;
  const L = coach.lengthFt;
  const w = coach.widthFt;

  if (hasTunnel || (hasPark && /zion|carmel|newfound|glacier/i.test(text))) {
    alerts.push({
      id: "propane",
      severity: "critical",
      kind: "PROPANE RESTRICTION",
      title: "Propane tanks OFF in tunnels",
      body: `Route includes tunnel / park corridor language. Shut propane OFF before entry. Your ${coach.year} ${coach.make} ${coach.model} still needs local rules verified.`,
    });
  }

  if (h >= 12.5 && (hasTunnel || hasBridge || localHeavy || highwayShare < 0.45)) {
    alerts.push({
      id: "bridge",
      severity: h >= 13.2 ? "caution" : "info",
      kind: "HEIGHT CLEARANCE",
      title: "Verify overpass / tunnel clearance",
      body: `Coach height ${h} ft — route has ${hasTunnel ? "tunnels" : hasBridge ? "bridges/overpasses" : "more local roads"}. Prefer freeways; check posted clearances before committing.`,
    });
  } else if (h >= 13.5 && route.miles > 50 && localHeavy) {
    alerts.push({
      id: "bridge-soft",
      severity: "info",
      kind: "HEIGHT ADVISORY",
      title: "High coach · local roads on path",
      body: `${h} ft overall height — avoid GPS shortcuts onto farm roads.`,
    });
  }

  if (hasGrade && L >= 28) {
    alerts.push({
      id: "grade",
      severity: "caution",
      kind: "GRADE RESTRICTION",
      title: "Mountain grades ahead",
      body: `Your ${L} ft coach may hit steep grades on this corridor. Use engine braking, watch runaway ramps, and verify campsite length before arrival.`,
    });
  }

  if (w >= 8.0 && (localHeavy || (hasPark && L >= 35))) {
    alerts.push({
      id: "width",
      severity: "caution",
      kind: "WIDTH RESTRICTION",
      title: "Narrow corridors",
      body: `Width ${w} ft — park roads / local approaches on this route may feel tight. Take wide turns; avoid sub-9 ft bridges.`,
    });
  }

  if (hasFerry) {
    alerts.push({
      id: "ferry",
      severity: "critical",
      kind: "FERRY ON ROUTE",
      title: "Ferry segment detected",
      body: "This path includes ferry language. Many high coaches prefer a land detour — try Safer RV route.",
    });
  }

  if (L >= 35 && (hasPark || (route.miles > 80 && hasGrade))) {
    alerts.push({
      id: "length",
      severity: "info",
      kind: "LENGTH ADVISORY",
      title: "Campsite length",
      body: `${L} ft overall — filter pads for ${Math.ceil(L + 5)} ft+. Short sites near park gates may not fit.`,
    });
  }

  const canSuggestSafer =
    alerts.some((a) => a.severity === "critical" || a.severity === "caution") ||
    localHeavy ||
    hasFerry ||
    highwayShare < 0.4;

  const summary =
    alerts.length === 0
      ? "No route-specific restrictions found for this coach and path."
      : `${alerts.length} restriction${alerts.length === 1 ? "" : "s"} matched this route + profile.`;

  return { alerts, canSuggestSafer, summary };
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
