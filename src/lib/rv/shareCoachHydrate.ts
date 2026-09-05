/**
 * Shared coach rehydrate (Facts + Share).
 *
 * Saved coaches freeze `data` at heart-save time (`rvfax_saved_v1`).
 * Facts Powertrain SpecRow and Share POWER both read that in-memory coach.
 * Later catalog fills (e.g. torqueLbFt on Godzilla bands) must come from
 * live catalog SoT — not the frozen snapshot.
 *
 * Keeps year / floorplan identity. Custom / missing catalog entries keep
 * the saved `data`. Never invents torque when SoT is empty.
 *
 * Lookup is injected so unit tests do not import the live catalog module.
 * Production callers default the lookup in shareKit (`getSpec`).
 */

import type { RVSpec } from "./rvTypes";

export type ShareCatalogLookup = (
  make: string,
  model: string,
) => RVSpec | null | undefined;

export type ShareCoachSnapshot = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  data: RVSpec;
};

/** Merge live catalog `data` onto a saved coach. Year / floorplan stay. */
export function hydrateShareCoachResult<T extends ShareCoachSnapshot>(
  result: T,
  lookup: ShareCatalogLookup,
): T {
  const make = (result.make || "").trim();
  const model = (result.model || "").trim();
  if (!make || !model) return result;
  const live = lookup(make, model);
  if (!live) return result;
  if (live === result.data) return result;
  return { ...result, data: live };
}

/** Rehydrate every saved unit. Used by Facts list load and Share list load. */
export function hydrateSavedCoachList<T extends ShareCoachSnapshot>(
  units: T[],
  lookup: ShareCatalogLookup,
): T[] {
  return units.map((unit) => hydrateShareCoachResult(unit, lookup));
}
