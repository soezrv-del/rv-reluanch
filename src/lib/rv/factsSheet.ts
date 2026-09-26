/**
 * Facts report sheet: brochure pins first, then agreeing lot numbers
 * on empty cells. RvDetail should call this instead of buildBrochureSpecs.
 */

import { buildBrochureSpecs, type BrochureSpecs } from "./brochureSpecs.ts";
import type { RVSpec } from "./rvTypes.ts";
import { fillBrochureHolesFromLot } from "./lotCatalogFill.ts";
import { getLotCatalogUnits } from "./lotCatalogUnits.ts";
import {
  fillWeightGapsFromWebSearch,
  weightGapsAfterLotAndCatalog,
  weightPinsFromBrochure,
  type WebWeightField,
  type WebWeightFill,
} from "./webWeightFill.ts";

export function buildFactsBrochureSpecs(
  spec: RVSpec,
  year: string,
  make = "",
  model = "",
  floorplan = "",
): BrochureSpecs {
  // 1. Catalog / OEM pins (floorplanSpecs + rvData via buildBrochureSpecs).
  const catalogSheet = buildBrochureSpecs(spec, year, make, model, floorplan);
  // 2. Lot overrides. Flagged lot numbers replace a pin; unflagged numbers fill holes.
  const lotMerged = fillBrochureHolesFromLot(
    catalogSheet,
    getLotCatalogUnits(),
    year,
    make,
    model,
    floorplan,
  );
  // 3. Web search is async and server-side. applyFactsWebWeightStep fills only
  //    the weight cells this sheet left empty. It never writes the catalog.
  return lotMerged.specs;
}

/** Weight fields still GAP after catalog pins and lot overrides. */
export function factsWeightGapsAfterLotAndCatalog(
  brochure: BrochureSpecs,
): WebWeightField[] {
  return weightGapsAfterLotAndCatalog(brochure);
}

/**
 * Facts weight step 3. Lot and catalog pins win. Web hits fill empty cells only.
 */
export function applyFactsWebWeightStep(
  brochure: BrochureSpecs,
  fills: readonly WebWeightFill[],
): WebWeightFill[] {
  return fillWeightGapsFromWebSearch(weightPinsFromBrochure(brochure), fills);
}
