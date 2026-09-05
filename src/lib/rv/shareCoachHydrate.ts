/**
 * Share-lane rehydrate: saved coaches freeze `data` at heart-save time.
 * Kit POWER / brochure rows must read live catalog SoT for that make+model
 * so later fills (e.g. torqueLbFt) are not stuck on the snapshot.
 * Custom / missing catalog entries keep the saved `data`.
 */

import type { RVSpec } from "./rvTypes";
import { getSpec } from "./catalog";

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

export function hydrateShareCoachResult<T extends ShareCoachSnapshot>(
  result: T,
  lookup: ShareCatalogLookup = getSpec,
): T {
  const make = (result.make || "").trim();
  const model = (result.model || "").trim();
  if (!make || !model) return result;
  const live = lookup(make, model);
  if (!live) return result;
  if (live === result.data) return result;
  return { ...result, data: live };
}
