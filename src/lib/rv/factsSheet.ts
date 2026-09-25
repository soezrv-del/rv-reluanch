/**
 * Facts report sheet: brochure pins first, then agreeing lot numbers
 * on empty cells. RvDetail should call this instead of buildBrochureSpecs.
 */

import { buildBrochureSpecs, type BrochureSpecs } from "./brochureSpecs.ts";
import type { RVSpec } from "./rvTypes.ts";
import { fillBrochureHolesFromLot } from "./lotCatalogFill.ts";
import { getLotCatalogUnits } from "./lotCatalogUnits.ts";

export function buildFactsBrochureSpecs(
  spec: RVSpec,
  year: string,
  make = "",
  model = "",
  floorplan = "",
): BrochureSpecs {
  const sheet = buildBrochureSpecs(spec, year, make, model, floorplan);
  return fillBrochureHolesFromLot(
    sheet,
    getLotCatalogUnits(),
    year,
    make,
    model,
    floorplan,
  ).specs;
}
