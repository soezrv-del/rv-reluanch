import type { RVSpec } from "@/lib/rv/rvData";
import { getSpec, buildCustomSpec } from "@/lib/rv/catalog";
import type { TripCoach } from "@/lib/trips/tripData";

export type CoachProfile = TripCoach & {
  year: string;
  floorplan: string;
  type: string;
  engine?: string;
  fuelType: string;
  locked?: boolean;
};

export const EMPTY_COACH_PROFILE: CoachProfile = {
  year: "",
  make: "",
  model: "",
  floorplan: "",
  type: "",
  heightFt: 0,
  lengthFt: 0,
  widthFt: 0,
  weightLbs: 0,
  fuelType: "",
  locked: false,
};

const PROFILE_STORAGE_KEY = "rvfax_trips_profile_v1";

export function loadLockedProfile(): CoachProfile | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as CoachProfile;
    if (!p?.make || !p?.model || !p?.floorplan) return null;
    return { ...p, locked: true };
  } catch {
    return null;
  }
}

export function saveLockedProfile(p: CoachProfile) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ ...p, locked: true }),
    );
  } catch {
    /* quota */
  }
}

export function clearLockedProfile() {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    /* */
  }
}

function heightForType(type: string): number {
  const t = type.toLowerCase();
  if (t.includes("super c")) return 13.0;
  if (
    t.includes("class a") ||
    t.includes("diesel pusher") ||
    (t.includes("diesel") && t.includes("class"))
  )
    return 13.5;
  if (t.includes("class c")) return 11.5;
  if (t.includes("class b")) return 9.8;
  if (t.includes("5th") || t.includes("fifth")) return 13.2;
  if (t.includes("toy")) return 13.0;
  if (t.includes("trailer") || t.includes("travel")) return 11.2;
  return 12.5;
}

function widthForType(type: string): number {
  const t = type.toLowerCase();
  if (t.includes("class b")) return 7.5;
  return 8.5;
}

/**
 * Parse floorplan codes that embed length (e.g. 4551 → ~45 ft, 37BA → 37 ft).
 * Falls back to catalog length range midpoint.
 */
function lengthFromFloorplan(
  floorplan: string,
  lengthRange: [number, number] | undefined,
): number {
  const mid = Math.round(
    ((lengthRange?.[0] ?? 30) + (lengthRange?.[1] ?? 40)) / 2,
  );
  const fp = floorplan.trim();
  if (!fp) return 0;
  // Leading 2 digits often = feet on highline floorplans (45AHQ, 4551, 37BA)
  const m = fp.match(/^(\d{2})/);
  if (m) {
    const n = parseInt(m[1], 10);
    if (n >= 16 && n <= 55) return n;
  }
  return mid;
}

function weightFromFloorplan(
  floorplan: string,
  weightRange: [number, number] | undefined,
  lengthFt: number,
): number {
  const lo = weightRange?.[0] ?? 8000;
  const hi = weightRange?.[1] ?? 40000;
  const mid = Math.round((lo + hi) / 2);
  if (!floorplan || !lengthFt) return 0;
  // Bias weight toward longer floorplans within range
  const span = Math.max(1, hi - lo);
  const t = Math.min(1, Math.max(0, (lengthFt - 20) / 30));
  return Math.round(lo + span * t * 0.5 + mid * 0.5);
}

/**
 * Suggested dimensions — only after year + make + model + floorplan.
 * User can then manually edit before locking.
 */
export function suggestCoachFromSelection(opts: {
  year: string;
  make: string;
  model: string;
  floorplan: string;
}): CoachProfile {
  const make = opts.make.trim();
  const model = opts.model.trim();
  const floorplan = opts.floorplan.trim();

  if (!make || !model || !floorplan) {
    return {
      ...EMPTY_COACH_PROFILE,
      year: opts.year,
      make,
      model,
      floorplan,
    };
  }

  const spec: RVSpec =
    getSpec(make, model) || buildCustomSpec(make, model, floorplan, undefined);

  const lengthFt = lengthFromFloorplan(floorplan, spec.lengthRange);
  const weightLbs = weightFromFloorplan(
    floorplan,
    spec.weightRange,
    lengthFt,
  );

  return {
    year: opts.year,
    make,
    model,
    floorplan,
    type: spec.type,
    heightFt: heightForType(spec.type),
    lengthFt,
    widthFt: widthForType(spec.type),
    weightLbs,
    engine: spec.engine,
    fuelType: spec.fuelType,
    locked: false,
  };
}

export const TRIP_YEARS: string[] = Array.from(
  { length: 2026 - 2002 + 1 },
  (_, i) => String(2026 - i),
);

export function profileIsComplete(p: CoachProfile): boolean {
  return Boolean(
    p.year &&
      p.make &&
      p.model &&
      p.floorplan &&
      p.lengthFt > 0 &&
      p.heightFt > 0 &&
      p.weightLbs > 0,
  );
}
