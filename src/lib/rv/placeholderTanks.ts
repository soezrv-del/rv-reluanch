/**
 * Model-level catalog clone seed (fresh/gray/black 60/40/40).
 * Not brochure truth — year-scoped / OEM / dated snaps may replace it.
 */

export type TankTrio = {
  freshWater?: number | null;
  grayWater?: number | null;
  blackWater?: number | null;
};

export function isPlaceholderTankTrio(
  fresh?: number | null,
  gray?: number | null,
  black?: number | null,
): boolean {
  return fresh === 60 && gray === 40 && black === 40;
}

function firstPositive(
  ...vals: Array<number | null | undefined>
): number | undefined {
  for (const n of vals) {
    if (n != null && n > 0) return n;
  }
  return undefined;
}

/** Drop the untrusted 60/40/40 seed so display can GAP instead of confirming it. */
export function omitPlaceholderCatalogTanks(spec: TankTrio): {
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

/**
 * Display-honest gallons: OEM floorplan, then year-band / dated snap,
 * then catalog — except the cloned 60/40/40 seed, which is omitted.
 * Never invents gallons.
 */
export function resolveHonestTanks(
  spec: TankTrio,
  band?: TankTrio | null,
  oem?: TankTrio | null,
): {
  freshWater?: number;
  grayWater?: number;
  blackWater?: number;
} {
  const catalog = omitPlaceholderCatalogTanks(spec);
  return {
    freshWater: firstPositive(oem?.freshWater, band?.freshWater, catalog.freshWater),
    grayWater: firstPositive(oem?.grayWater, band?.grayWater, catalog.grayWater),
    blackWater: firstPositive(oem?.blackWater, band?.blackWater, catalog.blackWater),
  };
}
