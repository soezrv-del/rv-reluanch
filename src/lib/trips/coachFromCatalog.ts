import type { RVSpec } from "@/lib/rv/rvTypes";
import { getSpec, buildCustomSpec } from "@/lib/rv/catalog";
import { resolveYearSnapshot } from "@/lib/rv/brochureSpecs";
import { findOemFloorplanSpec } from "@/lib/rv/floorplanSpecs";
import {
  dimsFromKnownSources,
  EMPTY_COACH_PROFILE,
  resolveTripsProfileSeed as resolveSeed,
  type CoachProfile,
  type CoachSeedIdentity,
} from "./coachProfile";

export type {
  CoachProfile,
  CoachSeedIdentity,
  CoachSeedSource,
  DimSource,
  DimSources,
  SuggestCoachFn,
} from "./coachProfile";
export {
  anyDimEstimated,
  clearLockedProfile,
  coachIdentityKey,
  coachIsReady,
  dimsFromKnownSources,
  EMPTY_COACH_PROFILE,
  EMPTY_DIM_SOURCES,
  loadLockedProfile,
  profileIsComplete,
  saveLockedProfile,
  TRIP_YEARS,
} from "./coachProfile";

/**
 * Suggested dimensions from year / make / model / optional floorplan.
 * Prefers brochure + catalog numeric fields; class heuristic is last resort.
 */
export function suggestCoachFromSelection(opts: {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  gvwrLbs?: number;
  uvwLbs?: number;
  rvType?: string;
}): CoachProfile {
  const make = opts.make.trim();
  const model = opts.model.trim();
  const floorplan = opts.floorplan.trim();

  if (!make || !model) {
    return {
      ...EMPTY_COACH_PROFILE,
      year: opts.year,
      make,
      model,
      floorplan,
    };
  }

  const spec: RVSpec =
    getSpec(make, model) ||
    buildCustomSpec(make, model, floorplan, opts.rvType);
  const oem = findOemFloorplanSpec(opts.year, make, model, floorplan);
  const snap = resolveYearSnapshot(spec, opts.year, floorplan);
  const type = snap.type || spec.type;
  const dims = dimsFromKnownSources({
    type,
    floorplan,
    make,
    model,
    lengthRange: spec.lengthRange,
    weightRange: spec.weightRange,
    oem,
    catalog: {
      overallLengthIn: snap.overallLengthIn ?? spec.overallLengthIn,
      exteriorHeightIn: snap.exteriorHeightIn ?? spec.exteriorHeightIn,
      exteriorWidthIn: snap.exteriorWidthIn ?? spec.exteriorWidthIn,
      gvwrLbs: snap.gvwrLbs ?? spec.gvwrLbs,
    },
    facts: { gvwrLbs: opts.gvwrLbs, uvwLbs: opts.uvwLbs },
  });

  return {
    year: opts.year,
    make,
    model,
    floorplan,
    type,
    heightFt: dims.heightFt,
    lengthFt: dims.lengthFt,
    widthFt: dims.widthFt,
    weightLbs: dims.weightLbs,
    engine: spec.engine,
    fuelType: spec.fuelType,
    locked: false,
    dimSources: dims.dimSources,
    seedSource: "manual",
  };
}

export function resolveTripsProfileSeed(input: {
  locked?: CoachProfile | null;
  activeCoach?: CoachSeedIdentity | null;
  savedCoach?: CoachSeedIdentity | null;
}) {
  return resolveSeed(input, suggestCoachFromSelection);
}
