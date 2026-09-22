/**
 * OEM / Facts brochure weights for RV Grok speech + desk sheet.
 *
 * Same published numbers Facts uses (buildBrochureSpecs gvwrLbs / uvwLbs).
 * Pin-only findOem* is the fallback when the live catalog is not loaded.
 * Never claim GAP / "I don't have GVWR" when Facts already shows a number.
 */

import {
  findOemFloorplanSpec,
  findOemGvwrLbs,
  findOemUvwLbs,
} from "../rv/floorplanSpecs.ts";
import type { CoachIdentity } from "./coachIdentity.ts";
import { resolveFactsBrochure } from "./factsBrochure.ts";

export type LockedOemWeights = {
  gvwrLbs: number | null;
  uvwLbs: number | null;
};

function publishedWeightsFromPins(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): LockedOemWeights {
  const oem = findOemFloorplanSpec(
    identity.year,
    identity.make,
    identity.model,
    identity.floorplan,
  );
  return {
    gvwrLbs:
      oem?.gvwrLbs ??
      findOemGvwrLbs(
        identity.year,
        identity.make,
        identity.model,
        identity.floorplan,
      ),
    uvwLbs:
      findOemUvwLbs(
        identity.year,
        identity.make,
        identity.model,
        identity.floorplan,
      ) ?? oem?.uvwLbs ?? null,
  };
}

export function resolveLockedOemWeights(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): LockedOemWeights {
  const brochure = resolveFactsBrochure(identity);
  if (brochure) {
    return {
      gvwrLbs: brochure.gvwrLbs ?? null,
      uvwLbs: brochure.uvwLbs ?? null,
    };
  }
  return publishedWeightsFromPins(identity);
}

export function formatLockedWeightLine(
  label: "GVWR" | "UVW",
  lbs: number | null,
): string {
  if (lbs != null && Number.isFinite(lbs) && lbs > 0) {
    return `- VERIFIED ${label} ${Math.round(lbs)} from OEM pin`;
  }
  return `- ${label}: GAP — no OEM pin. Conversational answer may give a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin. Do not write EST onto the desk.`;
}

/** Standing rule injected whenever a desk sheet mounts or a catalog lock exists. */
export const LOCKED_WEIGHTS_SPEECH_RULE =
  "Never claim you lack a VERIFIED or non-GAP desk field. Speak every VERIFIED number (e.g. GVWR 49000). Do not say you lack GVWR when a VERIFIED GVWR line is present. Desk / SPEC REPORT stays on the Facts brochure snapshot — do not write EST onto the desk or re-GAP a Facts number. If a field is GAP on the desk, conversational answers may speak a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin.";

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
