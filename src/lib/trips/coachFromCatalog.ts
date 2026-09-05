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
  anyFilledDimEstimated,
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

  const catalogSpec = getSpec(make, model);
  const spec: RVSpec =
    catalogSpec || buildCustomSpec(make, model, floorplan, opts.rvType);
  const oem = findOemFloorplanSpec(opts.year, make, model, floorplan);
  const snap = catalogSpec
    ? resolveYearSnapshot(catalogSpec, opts.year, floorplan)
    : null;
  const type = snap?.type || (catalogSpec ? spec.type : opts.rvType || "");
  const dims = dimsFromKnownSources({
    type,
    floorplan,
    make,
    model,
    // Dummy custom ranges ([20,45] / [5k,45k]) look like OEM — only real catalog spans.
    lengthRange: catalogSpec?.lengthRange,
    weightRange: catalogSpec?.weightRange,
    oem,
    catalog: catalogSpec
      ? {
          overallLengthIn: snap?.overallLengthIn ?? catalogSpec.overallLengthIn,
          exteriorHeightIn:
            snap?.exteriorHeightIn ?? catalogSpec.exteriorHeightIn,
          exteriorWidthIn: snap?.exteriorWidthIn ?? catalogSpec.exteriorWidthIn,
          gvwrLbs: snap?.gvwrLbs ?? catalogSpec.gvwrLbs,
        }
      : null,
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
