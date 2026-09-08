/**
 * Facts → Tow one-shot handoff.
 *
 * Dock / swipe / launchpad open a clean truck form (saved last truck only).
 * Facts owns “Check tow” and sends this narrow payload. Tow consumes once
 * and clears. Motorhome toad mode is this path only — never activeCoach,
 * cal seeds, or other suite session state.
 */

import {
  coachTowRole,
  parseWeightLbs,
  towableRvType,
} from "../rv/activeCoach.ts";

export type FactsTowHandoffOffer = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  rvType?: string;
  gvwrLbs?: number;
  towingCapacityLbs?: number;
};

export type FactsTowPrefill =
  | { kind: "motorhome"; offer: FactsTowHandoffOffer }
  | {
      kind: "towable";
      offer: FactsTowHandoffOffer;
      rvType: "Fifth Wheel" | "Travel Trailer";
      gvwrLbs: number;
    }
  | { kind: "none" };

function cleanText(v?: string | null): string {
  return String(v ?? "").trim();
}

function cleanLbs(v?: number | null): number | undefined {
  if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) return undefined;
  return Math.round(v);
}

/** Drop price / UVW / session extras — Tow only needs identity + tow role. */
export function normalizeFactsTowOffer(
  raw: Partial<FactsTowHandoffOffer> | null | undefined,
): FactsTowHandoffOffer | null {
  if (!raw) return null;
  const year = cleanText(raw.year);
  const make = cleanText(raw.make);
  const model = cleanText(raw.model);
  if (!year || !make || !model) return null;
  return {
    year,
    make,
    model,
    floorplan: cleanText(raw.floorplan) || undefined,
    rvType: cleanText(raw.rvType) || undefined,
    gvwrLbs: cleanLbs(raw.gvwrLbs),
    towingCapacityLbs: cleanLbs(raw.towingCapacityLbs),
  };
}

/** Facts report → narrow Tow payload. No market price, no UVW, no Cal seed. */
export function offerFromFactsReport(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  rvType?: string;
  gvwr?: string | number | null;
  towingCapacityLbs?: number | null;
}): FactsTowHandoffOffer | null {
  return normalizeFactsTowOffer({
    year: input.year,
    make: input.make,
    model: input.model,
    floorplan: input.floorplan,
    rvType: input.rvType,
    gvwrLbs: parseWeightLbs(input.gvwr),
    towingCapacityLbs: input.towingCapacityLbs ?? undefined,
  });
}

export type TowHandoffFormPatch =
  | {
      kind: "motorhome";
      shopMode: "match";
      year: "";
      make: "";
      model: "";
      trim: "";
      rvType: "Travel Trailer";
      gvwr: "";
      pin: "";
    }
  | {
      kind: "towable";
      shopMode: "reverse";
      rvType: "Fifth Wheel" | "Travel Trailer";
      gvwr?: string;
    }
  | { kind: "none" };

export function towPrefillFromOffer(
  offer: FactsTowHandoffOffer | null,
): FactsTowPrefill {
  if (!offer) return { kind: "none" };
  const role = coachTowRole(offer.rvType);
  if (role === "motorhome") return { kind: "motorhome", offer };
  if (role === "towable") {
    return {
      kind: "towable",
      offer,
      rvType: towableRvType(offer.rvType),
      gvwrLbs: offer.gvwrLbs && offer.gvwrLbs > 0 ? offer.gvwrLbs : 0,
    };
  }
  return { kind: "none" };
}

export function towFormPatchFromPrefill(
  prefill: FactsTowPrefill,
): TowHandoffFormPatch {
  if (prefill.kind === "motorhome") {
    return {
      kind: "motorhome",
      shopMode: "match",
      year: "",
      make: "",
      model: "",
      trim: "",
      rvType: "Travel Trailer",
      gvwr: "",
      pin: "",
    };
  }
  if (prefill.kind === "towable") {
    return {
      kind: "towable",
      shopMode: "reverse",
      rvType: prefill.rvType,
      gvwr: prefill.gvwrLbs > 0 ? String(prefill.gvwrLbs) : undefined,
    };
  }
  return { kind: "none" };
}

export function decideFactsTowHandoff(
  raw: Partial<FactsTowHandoffOffer> | null | undefined,
): { prefill: FactsTowPrefill; patch: TowHandoffFormPatch } {
  const offer = normalizeFactsTowOffer(raw);
  const prefill = towPrefillFromOffer(offer);
  return { prefill, patch: towFormPatchFromPrefill(prefill) };
}
