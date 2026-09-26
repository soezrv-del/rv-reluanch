/**
 * Lot-unit rows available for catalog hole-fill.
 * Seed is always on. Runtime snapshot can register richer Coast rows.
 */

import { GRAND_DESIGN_LOT_SEED } from "./grandDesignLotSeed.ts";
import { LOT_CATALOG_SEED } from "./lotCatalogSeed.ts";
import type { LotCoachIdentity } from "./lotCatalogFill.ts";

let extra: Array<LotCoachIdentity & Record<string, unknown>> = [];

export function registerLotCatalogUnits(
  units: Array<LotCoachIdentity & Record<string, unknown>>,
): void {
  extra = Array.isArray(units) ? units.slice() : [];
}

export function getLotCatalogUnits(): Array<LotCoachIdentity & Record<string, unknown>> {
  const seed = [...LOT_CATALOG_SEED, ...GRAND_DESIGN_LOT_SEED];
  return extra.length ? [...seed, ...extra] : seed;
}
