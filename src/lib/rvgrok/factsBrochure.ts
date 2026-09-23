/**
 * Shared Facts brochure snapshot for RV Grok.
 *
 * Both surfaces import `resolveSharedSpecSync` — catalog / OEM pin first,
 * same paint numbers. Do not keep a second Grok-only weight parser.
 */
import { type BrochureSpecs } from "../rv/brochureSpecs.ts";
import {
  applySharedSpecToBrochure,
  resolveSharedSpecSync,
} from "../rv/sharedSpec.ts";
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
  const snap = resolveSharedSpecSync({
    year,
    make,
    model,
    floorplan: identity.floorplan || "",
  });
  if (!snap.brochure) return null;
  return applySharedSpecToBrochure(snap.brochure, snap);
}
