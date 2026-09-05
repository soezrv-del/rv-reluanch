import {
  lengthFtFromFloorplan,
  weightForFloorplan,
} from "../rv/floorplanSpecs.ts";
import type { TripCoach } from "./tripData.ts";

export type DimSource = "brochure" | "catalog" | "facts" | "estimate";

export type DimSources = {
  height: DimSource;
  length: DimSource;
  width: DimSource;
  weight: DimSource;
};

export type CoachSeedSource = "locked" | "facts" | "saved" | "manual";

export type CoachProfile = TripCoach & {
  year: string;
  floorplan: string;
  type: string;
  engine?: string;
  fuelType: string;
  locked?: boolean;
  dimSources?: DimSources;
  seedSource?: CoachSeedSource;
};

export type CoachSeedIdentity = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  rvType?: string;
  gvwrLbs?: number;
  uvwLbs?: number;
};

export type SuggestCoachFn = (opts: {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  gvwrLbs?: number;
  uvwLbs?: number;
  rvType?: string;
}) => CoachProfile;

export const EMPTY_DIM_SOURCES: DimSources = {
  height: "estimate",
  length: "estimate",
  width: "estimate",
  weight: "estimate",
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
  dimSources: { ...EMPTY_DIM_SOURCES },
  seedSource: "manual",
};

const PROFILE_STORAGE_KEY = "rvfax_trips_profile_v1";

export function loadLockedProfile(): CoachProfile | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as CoachProfile;
    if (!p?.make || !p?.model) return null;
    return { ...p, locked: true, seedSource: "locked" };
  } catch {
    return null;
  }
}

export function saveLockedProfile(p: CoachProfile) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ ...p, locked: true, seedSource: "locked" }),
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

function inchesToFt(inches: number): number {
  return Math.round((inches / 12) * 10) / 10;
}

function positive(n: number | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n > 0;
}

export function anyDimEstimated(sources?: DimSources | null): boolean {
  if (!sources) return false;
  return (
    sources.height === "estimate" ||
    sources.length === "estimate" ||
    sources.width === "estimate" ||
    sources.weight === "estimate"
  );
}

/**
 * Pick height / length / width / weight from brochure → catalog → Facts →
 * existing class/floorplan heuristic. Never invent a number that is not one
 * of those sources.
 */
export function dimsFromKnownSources(opts: {
  type: string;
  floorplan: string;
  make?: string;
  model?: string;
  lengthRange?: [number, number];
  weightRange?: [number, number];
  oem?: {
    overallLengthIn?: number;
    exteriorHeightIn?: number;
    exteriorWidthIn?: number;
    gvwrLbs?: number;
  } | null;
  catalog?: {
    overallLengthIn?: number;
    exteriorHeightIn?: number;
    exteriorWidthIn?: number;
    gvwrLbs?: number;
  } | null;
  facts?: { gvwrLbs?: number; uvwLbs?: number } | null;
}): {
  heightFt: number;
  lengthFt: number;
  widthFt: number;
  weightLbs: number;
  dimSources: DimSources;
} {
  const type = opts.type || "";
  const floorplan = opts.floorplan || "";
  const lengthRange = opts.lengthRange;
  const weightRange = opts.weightRange;
  const oem = opts.oem;
  const catalog = opts.catalog;
  const facts = opts.facts;

  let heightFt = 0;
  let heightSrc: DimSource = "estimate";
  if (positive(oem?.exteriorHeightIn)) {
    heightFt = inchesToFt(oem.exteriorHeightIn);
    heightSrc = "brochure";
  } else if (positive(catalog?.exteriorHeightIn)) {
    heightFt = inchesToFt(catalog.exteriorHeightIn);
    heightSrc = "catalog";
  } else if (type) {
    heightFt = heightForType(type);
    heightSrc = "estimate";
  }

  let widthFt = 0;
  let widthSrc: DimSource = "estimate";
  if (positive(oem?.exteriorWidthIn)) {
    widthFt = inchesToFt(oem.exteriorWidthIn);
    widthSrc = "brochure";
  } else if (positive(catalog?.exteriorWidthIn)) {
    widthFt = inchesToFt(catalog.exteriorWidthIn);
    widthSrc = "catalog";
  } else if (type) {
    widthFt = widthForType(type);
    widthSrc = "estimate";
  }

  let lengthFt = 0;
  let lengthSrc: DimSource = "estimate";
  if (positive(oem?.overallLengthIn)) {
    lengthFt = inchesToFt(oem.overallLengthIn);
    lengthSrc = "brochure";
  } else if (positive(catalog?.overallLengthIn)) {
    lengthFt = inchesToFt(catalog.overallLengthIn);
    lengthSrc = "catalog";
  } else if (floorplan && lengthRange) {
    const fromCode = lengthFtFromFloorplan(floorplan, lengthRange, {
      make: opts.make,
      model: opts.model,
    });
    if (positive(fromCode ?? undefined)) {
      lengthFt = fromCode as number;
      lengthSrc = "estimate";
    } else {
      lengthFt = Math.round((lengthRange[0] + lengthRange[1]) / 2);
      lengthSrc = "estimate";
    }
  } else if (lengthRange) {
    lengthFt = Math.round((lengthRange[0] + lengthRange[1]) / 2);
    lengthSrc = "estimate";
  }

  let weightLbs = 0;
  let weightSrc: DimSource = "estimate";
  if (positive(facts?.gvwrLbs)) {
    weightLbs = Math.round(facts.gvwrLbs);
    weightSrc = "facts";
  } else if (positive(facts?.uvwLbs)) {
    weightLbs = Math.round(facts.uvwLbs);
    weightSrc = "facts";
  } else if (positive(oem?.gvwrLbs)) {
    weightLbs = Math.round(oem.gvwrLbs);
    weightSrc = "brochure";
  } else if (positive(catalog?.gvwrLbs)) {
    weightLbs = Math.round(catalog.gvwrLbs);
    weightSrc = "catalog";
  } else if (weightRange) {
    const w = weightForFloorplan(floorplan, weightRange, lengthRange ?? [20, 40], {
      make: opts.make,
      model: opts.model,
    });
    weightLbs = Math.round(w.mid);
    weightSrc = "estimate";
  }

  return {
    heightFt,
    lengthFt,
    widthFt,
    weightLbs,
    dimSources: {
      height: heightSrc,
      length: lengthSrc,
      width: widthSrc,
      weight: weightSrc,
    },
  };
}

export const TRIP_YEARS: string[] = Array.from(
  { length: 2026 - 2002 + 1 },
  (_, i) => String(2026 - i),
);

/** Enough identity + dims to use on Navigate without the 4-sheet dance. */
export function coachIsReady(p: CoachProfile | null | undefined): boolean {
  if (!p) return false;
  return Boolean(p.make && p.model && p.lengthFt > 0 && p.heightFt > 0);
}

export function profileIsComplete(p: CoachProfile): boolean {
  return Boolean(
    p.year &&
      p.make &&
      p.model &&
      p.lengthFt > 0 &&
      p.heightFt > 0 &&
      p.weightLbs > 0,
  );
}

export function coachIdentityKey(
  p: Pick<CoachSeedIdentity, "year" | "make" | "model" | "floorplan">,
): string {
  return [p.year, p.make, p.model, p.floorplan || ""].join("|");
}

/**
 * Locked Trips profile wins (user overrides). Else active Facts coach.
 * Else most recently saved Facts unit. Nothing invented when all are empty.
 * `suggest` fills dims from catalog/brochure/Facts — inject a stub in tests.
 */
export function resolveTripsProfileSeed(
  input: {
    locked?: CoachProfile | null;
    activeCoach?: CoachSeedIdentity | null;
    savedCoach?: CoachSeedIdentity | null;
  },
  suggest: SuggestCoachFn,
): { profile: CoachProfile; source: CoachSeedSource } | null {
  const locked = input.locked;
  if (locked?.make && locked.model) {
    return { profile: { ...locked, locked: true, seedSource: "locked" }, source: "locked" };
  }

  const facts = input.activeCoach;
  if (facts?.year && facts.make && facts.model) {
    return {
      profile: {
        ...suggest({
          year: facts.year,
          make: facts.make,
          model: facts.model,
          floorplan: facts.floorplan || "",
          gvwrLbs: facts.gvwrLbs,
          uvwLbs: facts.uvwLbs,
          rvType: facts.rvType,
        }),
        seedSource: "facts",
      },
      source: "facts",
    };
  }

  const saved = input.savedCoach;
  if (saved?.year && saved.make && saved.model) {
    return {
      profile: {
        ...suggest({
          year: saved.year,
          make: saved.make,
          model: saved.model,
          floorplan: saved.floorplan || "",
          gvwrLbs: saved.gvwrLbs,
          uvwLbs: saved.uvwLbs,
          rvType: saved.rvType,
        }),
        seedSource: "saved",
      },
      source: "saved",
    };
  }

  return null;
}
