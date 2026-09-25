/**
 * Lot-unit rows available for catalog hole-fill.
 * Seed is always on. Runtime snapshot can register richer Coast rows.
 */

import { LOT_CATALOG_SEED } from "./lotCatalogSeed.ts";
import type { LotCoachIdentity } from "./lotCatalogFill.ts";

let extra: Array<LotCoachIdentity & Record<string, unknown>> = [];

export function registerLotCatalogUnits(
  units: Array<LotCoachIdentity & Record<string, unknown>>,
): void {
  extra = Array.isArray(units) ? units.slice() : [];
}

export function getLotCatalogUnits(): Array<
  LotCoachIdentity & Record<string, unknown>
> {
  return extra.length ? [...LOT_CATALOG_SEED, ...extra] : [...LOT_CATALOG_SEED];
}
