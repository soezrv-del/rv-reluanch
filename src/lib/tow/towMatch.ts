/**
 * Honest vehicle-first match math for RvTow.
 * Reads ratings the screen already has — does not invent OEM numbers.
 */

import {
  PIN_WEIGHT_FRACTION,
  TONGUE_WEIGHT_FRACTION,
  hitchLoadLbs,
  normalizeReverseRvType,
  recommendedPayloadLbs,
  recommendedTowLbs,
} from "./towReverse.ts";

export type HitchKind = "pin" | "tongue";

export type BedFitLevel = "needed" | "advisory" | "ok";

export type BedFit = {
  key: "short" | "standard" | "long" | "unknown";
  level: BedFitLevel;
  title: string;
  detail: string;
};

export type TowCheckLevel = "pass" | "fail" | "warn" | "info" | "skip";

export type TowCheck = {
  id: "tow" | "hitch" | "gcwr" | "bed";
  level: TowCheckLevel;
  title: string;
  detail: string;
};

export type TowMatchInput = {
  hasVehicle: boolean;
  rvType: string;
  gvwrLbs: number;
  /** Typed pin or tongue. Blank → estimate (20% 5th / 12% TT). */
  hitchLbs?: number;
  maxTow: number;
  payload: number;
  gcwr: number;
  bed?: string;
  vehicleIsTruck?: boolean;
};

export type CombinedEstimate = {
  combinedLbs: number;
  truckResidual: number;
  gcwr: number;
};

export type TowMatchVerdict = {
  hitchLoad: number;
  hitchKind: HitchKind;
  hitchEstimated: boolean;
  hitchFraction: number;
  recommendedTow: number;
  recommendedPayload: number;
  towOk: boolean;
  hitchOk: boolean;
  hitchSkipped: boolean;
  hitchOverRecommended: boolean;
  gcwrOk: boolean;
  gcwrSkipped: boolean;
  combined: CombinedEstimate | null;
  withinRecommended: boolean;
  overRecommendedUnderMax: boolean;
  overallOk: boolean;
  bed: BedFit | null;
  checks: TowCheck[];
};

export function hitchKindForRvType(rvType: string): HitchKind {
  return normalizeReverseRvType(rvType) === "Fifth Wheel" ? "pin" : "tongue";
}

export function hitchFractionForKind(kind: HitchKind): number {
  return kind === "pin" ? PIN_WEIGHT_FRACTION : TONGUE_WEIGHT_FRACTION;
}

/**
 * Combined estimate without inventing curb or GCWR.
 * Truck residual = GCWR − max tow (weight the rating already put on the truck).
 * Est. combo = residual + trailer GVWR. Trailer alone > GCWR also fails.
 * Missing GCWR → skip. We do not invent maxTow+payload+5000.
 */
export function estimateCombinedLbs(input: {
  gcwr: number;
  maxTow: number;
  gvwrLbs: number;
}): CombinedEstimate | null {
  const gcwr = input.gcwr;
  const gvwrLbs = input.gvwrLbs;
  if (!(gcwr > 0) || !(gvwrLbs > 0)) return null;
  const truckResidual = input.maxTow > 0 ? Math.max(0, gcwr - input.maxTow) : 0;
  return {
    combinedLbs: truckResidual + gvwrLbs,
    truckResidual,
    gcwr,
  };
}

export function combinedExceedsGcwr(est: CombinedEstimate): boolean {
  return est.combinedLbs > est.gcwr || est.combinedLbs - est.truckResidual > est.gcwr;
}

/**
 * 5th-wheel cab-clearance rule. Short bed needs a slider / short-bed hitch;
 * standard bed is an advisory; long bed usually clears. Not a pass/fail rating.
 */
export function bedHitchFit(
  bed: string | undefined,
  rvType: string,
  vehicleIsTruck = true,
): BedFit | null {
  if (!vehicleIsTruck) return null;
  if (normalizeReverseRvType(rvType) !== "Fifth Wheel") return null;
  const text = bed || "";
  if (/5\.5/.test(text)) {
    return {
      key: "short",
      level: "needed",
      title: "Slider / short-bed hitch needed",
      detail:
        "A 5.5 ft bed does not leave cab clearance for a conventional 5th-wheel head in turns. Use a sliding or sidewinder / short-bed hitch.",
    };
  }
  if (/6\.5/.test(text)) {
    return {
      key: "standard",
      level: "advisory",
      title: "Sliding hitch often recommended",
      detail:
        "A 6.5 ft bed can pinch a 5th-wheel pin box in tight turns. A slider is the usual fix — confirm pin-box overhang and cab clearance.",
    };
  }
  if (/\b8\s*ft\b/i.test(text)) {
    return {
      key: "long",
      level: "ok",
      title: "Long bed — conventional hitch usually clears",
      detail:
        "An 8 ft bed typically has turning room for a standard 5th-wheel hitch. Still confirm pin-box and cab clearance on the real pair.",
    };
  }
  if (!text.trim()) return null;
  return {
    key: "unknown",
    level: "advisory",
    title: "Confirm hitch fit for this bed",
    detail:
      "Bed length is for 5th-wheel cab clearance. Short beds need a slider or short-bed hitch.",
  };
}

function emptyVerdict(input: TowMatchInput): TowMatchVerdict {
  const hitchKind = hitchKindForRvType(input.rvType);
  return {
    hitchLoad: 0,
    hitchKind,
    hitchEstimated: true,
    hitchFraction: hitchFractionForKind(hitchKind),
    recommendedTow: 0,
    recommendedPayload: 0,
    towOk: false,
    hitchOk: true,
    hitchSkipped: true,
    hitchOverRecommended: false,
    gcwrOk: true,
    gcwrSkipped: true,
    combined: null,
    withinRecommended: false,
    overRecommendedUnderMax: false,
    overallOk: false,
    bed: bedHitchFit(input.bed, input.rvType, input.vehicleIsTruck !== false),
    checks: [],
  };
}

export function evaluateTowMatch(input: TowMatchInput): TowMatchVerdict {
  if (!input.hasVehicle) return emptyVerdict(input);

  const hitchKind = hitchKindForRvType(input.rvType);
  const hitchFraction = hitchFractionForKind(hitchKind);
  const typed = input.hitchLbs;
  const hitchEstimated = !(typeof typed === "number" && Number.isFinite(typed) && typed > 0);
  const hitchLoad = hitchLoadLbs({
    rvType: input.rvType,
    gvwrLbs: input.gvwrLbs,
    hitchLbs: hitchEstimated ? undefined : typed,
  });

  const recommendedTow = recommendedTowLbs(input.maxTow);
  const recommendedPayload = recommendedPayloadLbs(input.payload);
  const gvwr = input.gvwrLbs;

  const towOk = gvwr > 0 && input.maxTow > 0 && input.maxTow >= gvwr;
  const hitchSkipped = !(input.payload > 0) || !(hitchLoad > 0);
  const hitchOk = hitchSkipped || hitchLoad <= input.payload;
  const hitchOverRecommended =
    !hitchSkipped &&
    recommendedPayload > 0 &&
    hitchLoad > recommendedPayload &&
    hitchLoad <= input.payload;

  const combined = estimateCombinedLbs({
    gcwr: input.gcwr,
    maxTow: input.maxTow,
    gvwrLbs: gvwr,
  });
  const gcwrSkipped = combined == null;
  const gcwrOk = gcwrSkipped || !combinedExceedsGcwr(combined);

  const withinRecommended = gvwr > 0 && recommendedTow > 0 && gvwr <= recommendedTow;
  const overRecommendedUnderMax =
    gvwr > recommendedTow && input.maxTow > 0 && gvwr <= input.maxTow;

  const bed = bedHitchFit(input.bed, input.rvType, input.vehicleIsTruck !== false);
  const overallOk = towOk && hitchOk && gcwrOk && gvwr > 0 && input.maxTow > 0;

  const hitchLabel = hitchKind === "pin" ? "Pin" : "Tongue";
  const fracPct = Math.round(hitchFraction * 100);
  const checks: TowCheck[] = [];

  if (gvwr <= 0) {
    checks.push({
      id: "tow",
      level: "skip",
      title: "Need trailer GVWR",
      detail: "Type the RV door-sticker weight. Empty is honest — we do not invent a match.",
    });
  } else if (!(input.maxTow > 0)) {
    checks.push({
      id: "tow",
      level: "fail",
      title: "No max tow on file",
      detail:
        "Enter the door-sticker max tow. We do not invent an OEM rating for a custom truck.",
    });
  } else if (towOk) {
    const margin = input.maxTow - gvwr;
    checks.push({
      id: "tow",
      level: overRecommendedUnderMax ? "warn" : "pass",
      title: overRecommendedUnderMax
        ? `Trailer under max tow — thin margin (${margin.toLocaleString()} lbs)`
        : `Trailer within max tow — ${margin.toLocaleString()} lb margin`,
      detail: `${gvwr.toLocaleString()} lb GVWR vs ${input.maxTow.toLocaleString()} lb max tow${
        recommendedTow
          ? ` · rec. planning ${recommendedTow.toLocaleString()} lbs (80%)`
          : ""
      }.`,
    });
  } else {
    checks.push({
      id: "tow",
      level: "fail",
      title: "Trailer over max tow",
      detail: `${gvwr.toLocaleString()} lb GVWR exceeds ${input.maxTow.toLocaleString()} lb max tow.`,
    });
  }

  if (hitchSkipped) {
    checks.push({
      id: "hitch",
      level: "skip",
      title: `${hitchLabel} vs payload skipped`,
      detail:
        input.payload > 0
          ? "Need trailer GVWR (or a typed hitch weight) to run the payload budget."
          : "No payload on file — hitch check skipped. We do not invent payload.",
    });
  } else if (!hitchOk) {
    checks.push({
      id: "hitch",
      level: "fail",
      title: `${hitchLabel} over payload`,
      detail: `${hitchEstimated ? "Est. " : ""}${hitchLabel.toLowerCase()} ${hitchLoad.toLocaleString()} lbs exceeds ${input.payload.toLocaleString()} lb payload${
        hitchEstimated ? ` (${fracPct}% of GVWR)` : ""
      }.`,
    });
  } else {
    checks.push({
      id: "hitch",
      level: hitchOverRecommended ? "warn" : "pass",
      title: hitchOverRecommended
        ? `${hitchLabel} under payload — above 85% planning`
        : `${hitchLabel} within payload`,
      detail: `${hitchEstimated ? "Est. " : ""}${hitchLabel.toLowerCase()} ${hitchLoad.toLocaleString()} lbs${
        hitchEstimated ? ` (${fracPct}% of GVWR)` : ""
      } vs ${input.payload.toLocaleString()} lb payload${
        recommendedPayload
          ? ` · rec. ${recommendedPayload.toLocaleString()} lbs (85%)`
          : ""
      }.`,
    });
  }

  if (gcwrSkipped) {
    checks.push({
      id: "gcwr",
      level: "skip",
      title: "GCWR not on file — combo skipped",
      detail:
        "Leave custom GCWR blank if the sticker does not list it. We do not invent max tow + payload + 5,000.",
    });
  } else if (combined && !gcwrOk) {
    const trailerAlone = gvwr > combined.gcwr;
    checks.push({
      id: "gcwr",
      level: "fail",
      title: trailerAlone ? "Trailer alone exceeds GCWR" : "Est. combined over GCWR",
      detail: trailerAlone
        ? `${gvwr.toLocaleString()} lb trailer GVWR is already over ${combined.gcwr.toLocaleString()} lb GCWR.`
        : `Est. combo ${combined.combinedLbs.toLocaleString()} lbs (truck residual ${combined.truckResidual.toLocaleString()} + trailer ${gvwr.toLocaleString()}) exceeds ${combined.gcwr.toLocaleString()} lb GCWR.`,
    });
  } else if (combined) {
    checks.push({
      id: "gcwr",
      level: "pass",
      title: `Est. combo ${combined.combinedLbs.toLocaleString()} ≤ GCWR ${combined.gcwr.toLocaleString()}`,
      detail: `Residual ${combined.truckResidual.toLocaleString()} lbs (GCWR − max tow) + trailer ${gvwr.toLocaleString()} lbs. Residual is the truck weight the rating already assumed — confirm on a scale.`,
    });
  }

  if (bed) {
    checks.push({
      id: "bed",
      level: bed.level === "needed" ? "warn" : bed.level === "ok" ? "info" : "info",
      title: bed.title,
      detail: bed.detail,
    });
  }

  return {
    hitchLoad,
    hitchKind,
    hitchEstimated,
    hitchFraction,
    recommendedTow,
    recommendedPayload,
    towOk,
    hitchOk,
    hitchSkipped,
    hitchOverRecommended,
    gcwrOk,
    gcwrSkipped,
    combined,
    withinRecommended,
    overRecommendedUnderMax,
    overallOk,
    bed,
    checks,
  };
}
