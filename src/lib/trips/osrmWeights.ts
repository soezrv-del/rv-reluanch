/**
 * RV-oriented route weights.
 *
 * Public OSRM only exposes a fixed `driving` cost function. We re-rank
 * returned routes (and optional alternatives) with coach-friendly weights.
 *
 * For self-hosted OSRM, mirror these priorities in a custom Lua profile
 * (see SELF_HOST_LUA_HINTS at bottom).
 */

export type RouteWeightMode = "fastest" | "shortest" | "rv" | "scenic";

/** Tunable cost coefficients — lower score wins */
export type RvRouteWeights = {
  /** Seconds of driving time */
  durationSec: number;
  /** Meters of distance (0.02 ≈ 50s per mile) */
  distanceM: number;
  /** Per major turn / ramp / merge */
  turnCount: number;
  /** Per meter on local / service / residential-like steps */
  minorRoadM: number;
  /** Flat penalty when average speed < floor (mph) */
  lowSpeedPenalty: number;
  /** Average speed floor in mph */
  avgSpeedMphFloor: number;
  /** Prefer slightly longer if much smoother (bonus = negative cost) */
  highwayBias: number;
};

/** Class A / Super C: fewer turns, prefer free-flow highways */
export const WEIGHTS_RV: RvRouteWeights = {
  durationSec: 1.0,
  distanceM: 0.015,
  turnCount: 55,
  minorRoadM: 0.09,
  lowSpeedPenalty: 900,
  avgSpeedMphFloor: 38,
  highwayBias: -0.012, // reward meters on motorway/trunk-like steps
};

/** Pure OSRM-like: duration only */
export const WEIGHTS_FASTEST: RvRouteWeights = {
  durationSec: 1.0,
  distanceM: 0,
  turnCount: 0,
  minorRoadM: 0,
  lowSpeedPenalty: 0,
  avgSpeedMphFloor: 0,
  highwayBias: 0,
};

/** Minimize miles (tighter for fuel) */
export const WEIGHTS_SHORTEST: RvRouteWeights = {
  durationSec: 0.15,
  distanceM: 0.12,
  turnCount: 20,
  minorRoadM: 0.02,
  lowSpeedPenalty: 200,
  avgSpeedMphFloor: 25,
  highwayBias: 0,
};

/** Prefer surface / avoid freeways (higher turn OK, less highway bias) */
export const WEIGHTS_SCENIC: RvRouteWeights = {
  durationSec: 0.7,
  distanceM: 0.02,
  turnCount: 15,
  minorRoadM: 0.01,
  lowSpeedPenalty: 0,
  avgSpeedMphFloor: 0,
  highwayBias: 0.04, // penalize highway meters
};

export function weightsForMode(mode: RouteWeightMode): RvRouteWeights {
  switch (mode) {
    case "shortest":
      return WEIGHTS_SHORTEST;
    case "scenic":
      return WEIGHTS_SCENIC;
    case "fastest":
      return WEIGHTS_FASTEST;
    case "rv":
    default:
      return WEIGHTS_RV;
  }
}

export type RouteScoreBreakdown = {
  index: number;
  score: number;
  durationS: number;
  distanceM: number;
  turns: number;
  minorRoadM: number;
  highwayM: number;
  avgSpeedMph: number;
  parts: {
    duration: number;
    distance: number;
    turns: number;
    minor: number;
    highway: number;
    lowSpeed: number;
  };
};

const HIGHWAY_RE =
  /\b(I-|Interstate|US-|Hwy|Highway|Freeway|Expressway|Thruway|Parkway|Motorway|Trunk)\b/i;
const MINOR_RE =
  /\b(Residential|Service|Alley|Drive|Lane|Court|Circle|Place|Trail|Road|Ave|Street|St\.?)\b/i;
const MAJOR_MANEUVER =
  /turn|ramp|merge|fork|exit|roundabout|rotary|end of road/i;

function stepRoadClass(name: string, ref: string): "highway" | "minor" | "other" {
  const label = `${name} ${ref}`.trim();
  if (!label) return "other";
  if (HIGHWAY_RE.test(label) || /^[A-Z]{0,2}-?\d{1,3}$/.test(ref)) {
    return "highway";
  }
  // Named local streets often match MINOR; bare numbers less so
  if (MINOR_RE.test(label) && !HIGHWAY_RE.test(label)) return "minor";
  return "other";
}

export type RawOsrmRoute = Record<string, unknown>;

/**
 * Score a single OSRM route object (pre-normalize).
 */
export function scoreOsrmRoute(
  route: RawOsrmRoute,
  weights: RvRouteWeights,
  index: number,
): RouteScoreBreakdown {
  const durationS = Number(route.duration ?? 0);
  const distanceM = Number(route.distance ?? 0);
  let turns = 0;
  let minorRoadM = 0;
  let highwayM = 0;

  const legs = (route.legs as Record<string, unknown>[]) || [];
  for (const leg of legs) {
    const steps = (leg.steps as Record<string, unknown>[]) || [];
    for (const st of steps) {
      const man = (st.maneuver as Record<string, unknown>) || {};
      const type = String(man.type ?? "");
      const modifier = String(man.modifier ?? "");
      if (MAJOR_MANEUVER.test(`${type} ${modifier}`)) turns += 1;

      const name = String(st.name ?? "");
      const ref = String(st.ref ?? "");
      const d = Number(st.distance ?? 0);
      const cls = stepRoadClass(name, ref);
      if (cls === "highway") highwayM += d;
      else if (cls === "minor") minorRoadM += d;
    }
  }

  const miles = distanceM / 1609.344;
  const hours = durationS / 3600;
  const avgSpeedMph = hours > 0 ? miles / hours : 0;

  const parts = {
    duration: weights.durationSec * durationS,
    distance: weights.distanceM * distanceM,
    turns: weights.turnCount * turns,
    minor: weights.minorRoadM * minorRoadM,
    highway: weights.highwayBias * highwayM,
    lowSpeed:
      weights.avgSpeedMphFloor > 0 && avgSpeedMph < weights.avgSpeedMphFloor
        ? weights.lowSpeedPenalty *
          (1 - avgSpeedMph / Math.max(weights.avgSpeedMphFloor, 1))
        : 0,
  };

  const score =
    parts.duration +
    parts.distance +
    parts.turns +
    parts.minor +
    parts.highway +
    parts.lowSpeed;

  return {
    index,
    score,
    durationS,
    distanceM,
    turns,
    minorRoadM,
    highwayM,
    avgSpeedMph: Math.round(avgSpeedMph * 10) / 10,
    parts,
  };
}

/**
 * Pick best route index under RV weights.
 * Returns scores for all candidates (sorted best-first).
 */
export function rankOsrmRoutes(
  routes: RawOsrmRoute[],
  mode: RouteWeightMode = "rv",
): { bestIndex: number; rankings: RouteScoreBreakdown[]; weights: RvRouteWeights } {
  const weights = weightsForMode(mode);
  if (!routes.length) {
    return { bestIndex: 0, rankings: [], weights };
  }
  const rankings = routes
    .map((r, i) => scoreOsrmRoute(r, weights, i))
    .sort((a, b) => a.score - b.score);
  return {
    bestIndex: rankings[0]?.index ?? 0,
    rankings,
    weights,
  };
}

/**
 * Self-host Lua hints — map our priorities into osrm-backend profile.lua
 * (not executed here; documentation for production OSRM builds).
 */
export const SELF_HOST_LUA_HINTS = `
-- RVFAX suggested driving profile bias (osrm-backend profiles/car.lua style)
-- Prefer free-flow multi-lane; penalize residential for 40ft+ coaches.

local speed_profile = {
  motorway = 90, motorway_link = 45,
  trunk = 85, trunk_link = 40,
  primary = 65, primary_link = 30,
  secondary = 55, tertiary = 40,
  residential = 20,  -- was ~25; lower for Class A
  service = 15, living_street = 10,
  track = 10, path = 0,
}

-- turn penalties (seconds-equivalent)
local turn_penalty = 12          -- base
local u_turn_penalty = 40
local traffic_light_penalty = 8

-- access: avoid ferry by default for high coaches
-- ferry = false in access rules when height > 3.5m
`.trim();
