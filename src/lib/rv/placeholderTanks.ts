/**
 * Model-level catalog clone seed (fresh/gray/black 60/40/40).
 * Not brochure truth — year-scoped / OEM / dated snaps may replace it.
 */
export function isPlaceholderTankTrio(
  fresh?: number | null,
  gray?: number | null,
  black?: number | null,
): boolean {
  return fresh === 60 && gray === 40 && black === 40;
}

/** Drop the untrusted 60/40/40 seed so display can GAP instead of confirming it. */
export function omitPlaceholderCatalogTanks(spec: {
  freshWater?: number | null;
  grayWater?: number | null;
  blackWater?: number | null;
}): {
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
} {
  if (isPlaceholderTankTrio(spec.freshWater, spec.grayWater, spec.blackWater)) {
    return {};
  }
  return {
    freshWater: spec.freshWater ?? undefined,
    grayWater: spec.grayWater ?? undefined,
    blackWater: spec.blackWater ?? undefined,
  };
}
