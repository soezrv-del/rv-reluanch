/**
 * Plan-trip helpers: last-known origin, dest chips with coords, and
 * cheap gates for as-you-type geocode. No routing, no profile.
 */

export type PlanPlace = {
  label: string;
  lat: number;
  lng: number;
  kind: string;
};

export const LAST_ORIGIN_KEY = "rvfax_trips_last_origin_v1";
export const GEOCODE_DEBOUNCE_MS = 350;
export const GEOCODE_MIN_CHARS = 2;

/** One-tap destinations — coords match /api/geocode presets. */
export const PLAN_DEST_CHIPS: PlanPlace[] = [
  { label: "Seattle, WA", lat: 47.6062, lng: -122.3321, kind: "city" },
  { label: "Portland, OR", lat: 45.5152, lng: -122.6784, kind: "city" },
  {
    label: "Glacier National Park, MT",
    lat: 48.7596,
    lng: -113.787,
    kind: "park",
  },
  {
    label: "Yellowstone National Park, WY",
    lat: 44.428,
    lng: -110.5885,
    kind: "park",
  },
  { label: "Quartzsite, AZ", lat: 33.6639, lng: -114.2297, kind: "rv" },
];

export function isFiniteCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function placeFromUnknown(raw: unknown): PlanPlace | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const lat = Number(o.lat);
  const lng = Number(o.lng);
  const label = typeof o.label === "string" ? o.label.trim() : "";
  if (!label || !isFiniteCoord(lat, lng)) return null;
  const kind = typeof o.kind === "string" && o.kind.trim() ? o.kind : "place";
  return { label, lat, lng, kind };
}

export function loadLastKnownOrigin(): PlanPlace | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_ORIGIN_KEY);
    if (!raw) return null;
    return placeFromUnknown(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveLastKnownOrigin(place: PlanPlace): void {
  if (typeof localStorage === "undefined") return;
  const next = placeFromUnknown(place);
  if (!next) return;
  try {
    localStorage.setItem(LAST_ORIGIN_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function clearLastKnownOrigin(): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(LAST_ORIGIN_KEY);
  } catch {
    /* */
  }
}

/** Enough to fire Calculate / Route — places or typed text both count. */
export function canSubmitPlan(opts: {
  originPlace: PlanPlace | null;
  originText: string;
  destPlace: PlanPlace | null;
  destText: string;
}): boolean {
  const hasOrigin =
    Boolean(opts.originPlace && isFiniteCoord(opts.originPlace.lat, opts.originPlace.lng)) ||
    opts.originText.trim().length >= GEOCODE_MIN_CHARS;
  const hasDest =
    Boolean(opts.destPlace && isFiniteCoord(opts.destPlace.lat, opts.destPlace.lng)) ||
    opts.destText.trim().length >= GEOCODE_MIN_CHARS;
  return hasOrigin && hasDest;
}

/** As-you-type: skip empty, short, or already-picked labels. */
export function shouldTypeahead(
  text: string,
  selected: PlanPlace | null,
): boolean {
  const q = text.trim();
  if (q.length < GEOCODE_MIN_CHARS) return false;
  if (selected && selected.label === text) return false;
  return true;
}

export function originIsDevice(place: PlanPlace | null): boolean {
  return place?.kind === "current";
}
