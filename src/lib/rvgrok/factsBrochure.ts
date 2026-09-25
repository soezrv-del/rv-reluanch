/**
 * Shared Facts brochure snapshot for RV Grok.
 *
 * Facts paints brochure pins first, then agreeing RV Country lot numbers
 * on empty cells. The desk and locked-weight speech use that same resolver.
 */
import { buildFactsBrochureSpecs } from "../rv/factsSheet.ts";
import type { BrochureSpecs } from "../rv/brochureSpecs.ts";
import { peekCatalog } from "../rv/catalogLoad.ts";
import {
  resolveCatalogMake,
  resolveCatalogModel,
  type CoachIdentity,
} from "./coachIdentity.ts";

export function resolveFactsBrochure(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): BrochureSpecs | null {
  const year = (identity.year || "").trim();
  const make = resolveCatalogMake(identity.make || "");
  const model = identity.model
    ? resolveCatalogModel(make, identity.model, identity.floorplan)
    : "";
  if (!make || !model) return null;
  const spec = peekCatalog()?.RV_DATA?.[make]?.[model] ?? null;
  if (!spec) return null;
  return buildFactsBrochureSpecs(
    spec,
    year,
    make,
    model,
    identity.floorplan || "",
  );
}