/**
 * OSRM profile + route parameter tuning for RvTrips.
 *
 * Public demo only ships `driving`. Self-hosted OSRM can add custom
 * profiles (e.g. truck). Query params still apply across profiles.
 */

export type OsrmProfileName = "driving" | "car";

export type OsrmOverview = "simplified" | "full" | "false";

export type OsrmExcludeClass =
  | "motorway"
  | "toll"
  | "ferry"
  | "tunnel"
  | string;

/** Full set of knobs we send upstream / use for cache keys */
export type OsrmProfileParams = {
  profile: OsrmProfileName;
  overview: OsrmOverview;
  steps: boolean;
  alternatives: boolean;
  /**
   * Snap radius (meters) per waypoint.
   * Must be generous for remote park / campground pins — 500m often
   * fails NoSegment on rural destinations. 5000m is the safe default.
   */
  radiusM: number | "unlimited";
  continueStraight: boolean;
  approach: "unrestricted" | "curb";
  /**
   * Classes to avoid. Public demo often rejects exclude — proxy retries
   * without it. Prefer self-hosted OSRM for ferry/motorway avoidance.
   */
  exclude: OsrmExcludeClass[];
  snapping: "default" | "any";
  generateHints: boolean;
  annotations: Array<
    "duration" | "distance" | "speed" | "weight" | "nodes" | "datasources"
  >;
};

/**
 * Default RvTrips / Class A oriented parameters.
 */
export const RV_OSRM_DEFAULTS: OsrmProfileParams = {
  profile: "driving",
  overview: "simplified",
  steps: true,
  alternatives: false,
  // 5 km snap — rural parks / Glacier staging need more than 500–2k
  radiusM: 5000,
  continueStraight: true,
  approach: "unrestricted",
  // empty: public demo rejects exclude=ferry|motorway
  exclude: [],
  snapping: "any",
  generateHints: false,
  annotations: [],
};

export const RV_OSRM_LIGHT: OsrmProfileParams = {
  ...RV_OSRM_DEFAULTS,
  steps: false,
  overview: "false",
  annotations: [],
};

export const RV_OSRM_NO_MOTORWAY: OsrmProfileParams = {
  ...RV_OSRM_DEFAULTS,
  exclude: ["ferry", "motorway"],
  overview: "full",
  radiusM: "unlimited",
};

const PROFILE_ALLOW = new Set(["driving", "car"]);
const OVERVIEW_ALLOW = new Set(["simplified", "full", "false"]);
const EXCLUDE_ALLOW = new Set(["motorway", "toll", "ferry", "tunnel"]);

function parseBool(raw: string | null, fallback: boolean): boolean {
  if (raw == null || raw === "") return fallback;
  const v = raw.toLowerCase();
  if (v === "true" || v === "1" || v === "yes") return true;
  if (v === "false" || v === "0" || v === "no") return false;
  return fallback;
}

function parseRadius(raw: string | null, fallback: number | "unlimited") {
  if (raw == null || raw === "") return fallback;
  if (raw.toLowerCase() === "unlimited") return "unlimited" as const;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(50_000, Math.round(n));
}

export function resolveOsrmProfile(
  search: URLSearchParams,
  base: OsrmProfileParams = RV_OSRM_DEFAULTS,
): OsrmProfileParams {
  const profileRaw = (search.get("profile") || base.profile).toLowerCase();
  const profile: OsrmProfileName = PROFILE_ALLOW.has(profileRaw)
    ? (profileRaw as OsrmProfileName)
    : base.profile;

  const overviewRaw = (search.get("overview") || base.overview).toLowerCase();
  const overview: OsrmOverview = OVERVIEW_ALLOW.has(overviewRaw)
    ? (overviewRaw as OsrmOverview)
    : base.overview;

  const hasExcludeParam = search.has("exclude");
  const excludeRaw = hasExcludeParam
    ? search.get("exclude") || ""
    : base.exclude.join(",");
  const exclude = excludeRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s && EXCLUDE_ALLOW.has(s));

  const approachRaw = (search.get("approach") || base.approach).toLowerCase();
  const approach: "unrestricted" | "curb" =
    approachRaw === "curb" ? "curb" : "unrestricted";

  const snappingRaw = (search.get("snapping") || base.snapping).toLowerCase();
  const snapping: "default" | "any" =
    snappingRaw === "default" ? "default" : "any";

  const annRaw = search.get("annotations") || base.annotations.join(",");
  const annotations = annRaw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as OsrmProfileParams["annotations"];

  const preset = (search.get("preset") || "").toLowerCase();
  if (preset === "light") return { ...RV_OSRM_LIGHT, profile };
  if (preset === "scenic") return { ...RV_OSRM_NO_MOTORWAY, profile };

  return {
    profile,
    overview,
    steps: parseBool(search.get("steps"), base.steps),
    alternatives: parseBool(search.get("alternatives"), base.alternatives),
    radiusM: parseRadius(search.get("radius"), base.radiusM),
    continueStraight: parseBool(
      search.get("continue_straight") ?? search.get("continueStraight"),
      base.continueStraight,
    ),
    approach,
    exclude,
    snapping,
    generateHints: parseBool(
      search.get("generate_hints") ?? search.get("generateHints"),
      base.generateHints,
    ),
    annotations,
  };
}

export function toOsrmQuery(params: OsrmProfileParams): URLSearchParams {
  const qs = new URLSearchParams({
    overview: params.overview,
    geometries: "geojson",
    steps: params.steps ? "true" : "false",
    alternatives: params.alternatives ? "true" : "false",
    generate_hints: params.generateHints ? "true" : "false",
    continue_straight: params.continueStraight ? "true" : "false",
    snapping: params.snapping,
  });

  const r =
    params.radiusM === "unlimited" ? "unlimited" : String(params.radiusM);
  qs.set("radiuses", `${r};${r}`);
  qs.set("approaches", `${params.approach};${params.approach}`);

  if (params.exclude.length) {
    qs.set("exclude", params.exclude.join(","));
  }
  if (params.annotations.length) {
    qs.set("annotations", params.annotations.join(","));
  }
  return qs;
}

export function profileCacheSig(params: OsrmProfileParams): string {
  return [
    params.profile,
    params.overview,
    params.steps ? "s1" : "s0",
    params.alternatives ? "a1" : "a0",
    params.radiusM,
    params.continueStraight ? "cs1" : "cs0",
    params.approach,
    params.exclude.slice().sort().join("+") || "ex0",
    params.snapping,
    params.annotations.slice().sort().join("+") || "an0",
  ].join("|");
}

/** Drop exclude flags for public-demo compatibility retry */
export function softenExcludes(params: OsrmProfileParams): OsrmProfileParams {
  return { ...params, exclude: [] };
}

/**
 * If NoSegment, retry with unlimited radiuses (common for park pins).
 */
export function softenRadiuses(params: OsrmProfileParams): OsrmProfileParams {
  return { ...params, radiusM: "unlimited" };
}
