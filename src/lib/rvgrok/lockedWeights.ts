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
import { isSeriesGvwrEstimate } from "../rv/torqueToWeight.ts";
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
  seriesEstimate?: string | null,
): string {
  if (lbs != null && Number.isFinite(lbs) && lbs > 0) {
    return `- VERIFIED ${label} ${Math.round(lbs)} from OEM pin`;
  }
  if (seriesEstimate && isSeriesGvwrEstimate(seriesEstimate)) {
    const bigger = /smallest in series/i.test(seriesEstimate)
      ? " That's the smallest in the series. A bigger floorplan can be higher."
      : "";
    return `- ${label}: GAP — no OEM pin. ${seriesEstimate}. Not a published GVWR. Do not use it for CCC, hitch, or GCWR.${bigger}`;
  }
  return `- ${label}: GAP — no OEM pin. Conversational answer may give a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin. Do not write EST onto the desk.`;
}

export const SAVED_PIN_MATCH_RULE =
  "SAVED PIN MATCH: this pin covers the ask only when it is this floorplan and this field, and the line is non-GAP. A series pin, a near match, or a different field does not cover it. A weight pin is not a horsepower pin.";

const OTHER_THAN_WEIGHT_RE =
  /\b(horsepower|\bhp\b|engine|chassis|torque|transmission|tanks?|hitch|payload|price|length|ccc|gcwr)\b/i;

/**
 * True only for this floorplan and this asked weight, non-GAP.
 * The model does not set this. A series pin or an HP ask is false.
 */
export function savedPinCoversAskedField(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan"> | null | undefined,
  query: string,
): boolean {
  const floorplan = (identity?.floorplan || "").trim();
  if (!identity || !floorplan) return false;
  const q = query || "";
  if (OTHER_THAN_WEIGHT_RE.test(q)) return false;
  const gvwr = /\b(gvwr|gross\s+vehicle\s+weight)\b/i.test(q);
  const uvw = /\b(uvw|unloaded\s+vehicle\s+weight)\b/i.test(q);
  if (!gvwr && !uvw) return false;
  const weights = resolveLockedOemWeights(identity);
  if (gvwr && !(weights.gvwrLbs != null && weights.gvwrLbs > 0)) return false;
  if (uvw && !(weights.uvwLbs != null && weights.uvwLbs > 0)) return false;
  return true;
}
export const LOCKED_WEIGHTS_SPEECH_RULE =
  "Never claim you lack a VERIFIED or non-GAP desk field. Speak every VERIFIED number (e.g. GVWR 49000). Do not say you lack GVWR when a VERIFIED GVWR line is present. Desk / SPEC REPORT stays on the Facts brochure snapshot — do not write EST onto the desk or re-GAP a Facts number. If a field is GAP on the desk, conversational answers may speak a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin.";

export const NO_DUPLICATE_MARKDOWN_SHEET =
  "WRITTEN COACH REPORT: the chat bubble is the four-section rundown (Overview · Chassis & powertrain · Weights & capacity · Layout & amenities). The desk card copies those numbers. Do not output a second markdown Spec Sheet, Weight ratings table, or GVWR/GCWR/UVW/NCC: GAP block that re-GAPs a named or VERIFIED field.";

export function formatLockedWeightsBlock(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): string {
  const w = resolveLockedOemWeights(identity);
  const brochure = resolveFactsBrochure(identity);
  const seriesGvwr =
    (w.gvwrLbs == null || w.gvwrLbs <= 0) && isSeriesGvwrEstimate(brochure?.gvwr)
      ? brochure?.gvwr
      : null;
  return [
    SAVED_PIN_MATCH_RULE,
    "LOCKED WEIGHTS (OEM pin — speak these; never claim GAP for a VERIFIED field):",
    formatLockedWeightLine("GVWR", w.gvwrLbs, seriesGvwr),
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
