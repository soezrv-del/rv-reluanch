/**
 * OEM weight pins for RV Grok speech + desk sheet.
 *
 * Desk chips already use findOemGvwrLbs / findOemUvwLbs. Spoken report and
 * any model-written "Spec Sheet" must use the same numbers — never claim
 * GAP / "I don't have GVWR" when a pin is present. Unpinned UVW stays GAP.
 */

import { findOemGvwrLbs, findOemUvwLbs } from "../rv/floorplanSpecs.ts";
import type { CoachIdentity } from "./coachIdentity.ts";

export type LockedOemWeights = {
  gvwrLbs: number | null;
  uvwLbs: number | null;
};

export function resolveLockedOemWeights(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): LockedOemWeights {
  return {
    gvwrLbs: findOemGvwrLbs(
      identity.year,
      identity.make,
      identity.model,
      identity.floorplan,
    ),
    uvwLbs: findOemUvwLbs(
      identity.year,
      identity.make,
      identity.model,
      identity.floorplan,
    ),
  };
}

export function formatLockedWeightLine(
  label: "GVWR" | "UVW",
  lbs: number | null,
): string {
  if (lbs != null && Number.isFinite(lbs) && lbs > 0) {
    return `- VERIFIED ${label} ${Math.round(lbs)} from OEM pin`;
  }
  return `- ${label}: GAP — no OEM pin (do not invent)`;
}

/** Standing rule injected whenever a desk sheet mounts or a catalog lock exists. */
export const LOCKED_WEIGHTS_SPEECH_RULE =
  "Never claim you lack a VERIFIED or non-GAP desk field. Speak every VERIFIED number (e.g. GVWR 49000). Do not say you lack GVWR when a VERIFIED GVWR line is present. UVW may stay GAP if there is no OEM UVW pin.";

export const NO_DUPLICATE_MARKDOWN_SHEET =
  "WRITTEN SPEC SHEET: the structured desk sheet already mounted is the only written sheet. Do not output a second markdown Spec Sheet, Weight ratings table, or GVWR/GCWR/UVW/NCC: GAP block that re-GAPs a VERIFIED field.";

export function formatLockedWeightsBlock(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): string {
  const w = resolveLockedOemWeights(identity);
  return [
    "LOCKED WEIGHTS (OEM pin — speak these; never claim GAP for a VERIFIED field):",
    formatLockedWeightLine("GVWR", w.gvwrLbs),
    formatLockedWeightLine("UVW", w.uvwLbs),
    LOCKED_WEIGHTS_SPEECH_RULE,
  ].join("\n");
}

const SPEC_SHEET_HEADING =
  /(?:^|\n)[ \t]*(?:#{1,4}[ \t]*)?(?:\*{0,2}|_{0,2})(?:written[ \t]+)?(?:carfax[- ]style[ \t]+)?spec(?:ification)?[ \t]+sheet(?:\*{0,2}|_{0,2})[ \t]*:?[ \t]*(?:\n|$)/i;

/** Drop a model-written markdown spec sheet when the structured desk card is up. */
export function stripDuplicateMarkdownSpecSheet(text: string): string {
  const raw = text || "";
  const m = raw.match(SPEC_SHEET_HEADING);
  if (m && m.index != null) {
    return raw.slice(0, m.index).trimEnd();
  }
  return raw;
}
