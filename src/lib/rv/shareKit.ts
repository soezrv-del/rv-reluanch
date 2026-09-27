/**
 * RvSHARE kit — on-screen brochure cards plus the suite text sheet.
 * The coach report itself is a link and a one-page PDF.
 */

import type { RVResult } from "./catalog";
import { estimateMarket, getSpec } from "./catalog";
import { buildBrochureSpecs, type BrochureSpecs } from "./brochureSpecs";
import {
  hydrateSavedCoachList as hydrateSavedCoachListFromLookup,
  hydrateShareCoachResult as hydrateShareCoachFromLookup,
  type ShareCatalogLookup,
} from "./shareCoachHydrate";
import { computeLoan, defaultAprForTerm } from "./rvCal";
import { resolveShareHost } from "@/lib/og/shareHost";
import { mediaForRvType } from "@/assets/typeMedia";
import { getVerifiedDossier } from "./verifiedCatalogCache";
import {
  isShareableValue,
  resolveShareNotes,
  resolveShareSummary,
  type ShareSpecGroupId,
} from "./shareCardPolicy";
export { resolveFaxShareContact, shareOrCopy } from "./shareCardImage";

export type { ShareCatalogLookup } from "./shareCoachHydrate";

/** Rehydrate saved `data` from live catalog SoT. Custom coaches are unchanged. */
export function hydrateShareCoachResult(
  result: RVResult,
  lookup: ShareCatalogLookup = getSpec,
): RVResult {
  return hydrateShareCoachFromLookup(result, lookup);
}

/** Facts + Share saved-list load: merge live catalog onto each frozen snapshot. */
export function hydrateSavedCoachList(
  units: RVResult[],
  lookup: ShareCatalogLookup = getSpec,
): RVResult[] {
  return hydrateSavedCoachListFromLookup(units, lookup);
}

export {
  DEFAULT_SHARE_INCLUDE,
  DEFAULT_SHARE_MARKET_LINES,
  hasSelectedMarketLines,
  RATE_UPDATED_FLASH,
  RATE_UPDATED_FLASH_MS,
  SHARE_MARKET_LINE_DEFS,
  sharePaymentAfterTermDown,
  sharePaymentPricePills,
  sharePowerLines,
} from "./shareCardPolicy";
export type { ShareInclude, ShareMarketLines } from "./shareCardPolicy";

export const SAVED_UNITS_KEY = "rvfax_saved_v1";
export const SAVED_UNITS_EVENT = "rvfax-saved-changed";

export type SharePayment = {
  price: number;
  downPct: number;
  termMonths: number;
  apr: number;
};

export type ShareMarket = {
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  msrpLo: number;
  msrpHi: number;
};

export function loadSavedUnits(): RVResult[] {
  try {
    const raw = localStorage.getItem(SAVED_UNITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return hydrateSavedCoachList(parsed as RVResult[]);
  } catch {
    return [];
  }
}

export function lifestylePitch(type?: string): string {
  const t = (type || "").toLowerCase();
  if (/toy\s*hauler/.test(t)) {
    return "Garage in the back, camp in the front — dunes, tracks, and a cold fridge waiting after the ride.";
  }
  if (/fifth/.test(t)) {
    return "Residential feel with hitch-and-go weekends. The house that follows the truck.";
  }
  if (/travel\s*trailer|towable/.test(t) && !/motor/.test(t)) {
    return "Hook up Friday, dump Sunday. The easiest on-ramp to the RV lifestyle.";
  }
  if (/class\s*b/.test(t)) {
    return "Park anywhere. Sleep anywhere. The van that turns every weekend into a trip.";
  }
  if (/super\s*c/.test(t)) {
    return "Truck up front, penthouse behind — diesel torque, a real hood, and luxury that tows like it means it.";
  }
  if (/class\s*c/.test(t)) {
    return "Family weekends without hotel math — bunks, a kitchen, and a driveway that moves.";
  }
  if (/class\s*a.*gas|gas\s*pusher|class\s*a gas/.test(t)) {
    return "Front-engine Class A — simpler service, campground-friendly, and a real coach without diesel money.";
  }
  if (/class\s*a|diesel\s*pusher|motor/.test(t)) {
    return "Diesel pusher: sunrise coffee on the lot, national parks as the backyard, and a real bed every night.";
  }
  return "The RV lifestyle — mornings outside, miles when you want them, and a place that's yours at every stop.";
}

export function lifestyleImageFor(type?: string, fuelType?: string, chassis?: string): string {
  return mediaForRvType(type, fuelType, chassis);
}

export function defaultPaymentFor(r: RVResult): SharePayment {
  r = hydrateShareCoachResult(r);
  const market = estimateMarket(r.data, r.year, r.floorplan, {
    make: r.make,
    model: r.model,
  });
  const price = market.retailHigh || market.msrpHi || 150000;
  const termMonths = 144;
  return {
    price,
    downPct: 10,
    termMonths,
    apr: defaultAprForTerm(termMonths),
  };
}

export function defaultMarketFor(r: RVResult): ShareMarket {
  r = hydrateShareCoachResult(r);
  const market = estimateMarket(r.data, r.year, r.floorplan, {
    make: r.make,
    model: r.model,
  });
  return {
    tradeIn: market.tradeIn || 0,
    retailLow: market.retailLow || 0,
    retailHigh: market.retailHigh || 0,
    msrpLo: market.msrpLo || 0,
    msrpHi: market.msrpHi || 0,
  };
}

function hasVal(v?: string | null): boolean {
  return isShareableValue(v);
}

export type BrochureSummary = {
  pitch: string;
  features: string[];
};

function liveShareCopy(r: RVResult): {
  overview: string;
  features: string[];
  options: string[];
  upgrades: string[];
} {
  const empty = { overview: "", features: [], options: [], upgrades: [] };
  if (typeof localStorage === "undefined") return empty;
  try {
    const live = getVerifiedDossier(r.year, r.make, r.model, r.floorplan);
    if (!live?.live) return empty;
    return {
      overview: live.overview || "",
      features: live.keyFeatures || [],
      options: live.options || [],
      upgrades: live.upgrades || [],
    };
  } catch {
    return empty;
  }
}

/**
 * Brochure / sales-pitch highlights only when live brochure copy exists.
 * Never invent. Never dump catalog year-matrix / GAP / honesty ledger.
 * Missing brochure → empty (callers omit the SUMMARY block).
 */
export function brochureSummary(r: RVResult): BrochureSummary {
  r = hydrateShareCoachResult(r);
  const live = liveShareCopy(r);
  return resolveShareSummary({
    liveOverview: live.overview,
    liveFeatures: live.features,
  });
}

/**
 * Options / upgrades only. Catalog description and honesty notes are not NOTES.
 * Missing options → empty (callers omit the NOTES block).
 */
function brochureNotes(r: RVResult): string[] {
  r = hydrateShareCoachResult(r);
  const live = liveShareCopy(r);
  return resolveShareNotes({
    options: [...live.options, ...(r.data.options || [])],
    upgrades: [...live.upgrades, ...(r.data.upgrades || [])],
  });
}

function group(
  id: ShareSpecGroupId,
  title: string,
  pairs: Array<[string, string | undefined]>,
): { id: ShareSpecGroupId; title: string; rows: { label: string; value: string }[] } {
  return {
    id,
    title,
    rows: pairs
      .filter(([, v]) => hasVal(v))
      .map(([label, value]) => ({ label, value: String(value).trim() })),
  };
}

function coachBrochure(r: RVResult, lookup?: ShareCatalogLookup): BrochureSpecs {
  const live = hydrateShareCoachResult(r, lookup);
  return buildBrochureSpecs(
    live.data,
    live.year,
    live.make,
    live.model,
    live.floorplan || "",
  );
}

export function brochureSpecGroups(r: RVResult) {
  r = hydrateShareCoachResult(r);
  const b = coachBrochure(r);
  const hwyOk = hasVal(b.mpgHighway);
  const cityOk = hasVal(b.mpgCity);
  const economy = hwyOk
    ? `${b.mpgHighway} hwy${cityOk ? ` · ${b.mpgCity} city` : ""}`
    : undefined;
  const notes = brochureNotes(r);
  return [
    group(
      "notes",
      "NOTES",
      notes.map((item) => ["Option", item]),
    ),
    group("powertrain", "POWERTRAIN", [
      ["Engine", b.engine],
      ["Horsepower", b.horsepower],
      ["Torque", b.torque],
      ["Transmission", b.transmission],
      ["Chassis", b.chassis],
      ["Fuel", b.fuelType],
      ["Fuel capacity", b.fuelCapacity],
      ["Economy", economy],
      ["Range", b.rangeMiles],
    ]),
    group("weights", "WEIGHTS", [
      ["GVWR", b.gvwr],
      ["UVW", b.uvw],
      ["CCC", b.ccc],
      ["GCWR", b.gcwr],
      [b.hitchLabel || "Hitch / tow", b.hitchOrPin],
    ]),
    group("dimensions", "DIMENSIONS", [
      ["Length", b.lengthFt],
      ["Exterior width", b.exteriorWidth],
      ["Exterior height", b.exteriorHeight],
      ["Interior height", b.interiorHeight],
      ["Wheelbase", b.wheelbase],
    ]),
    group("living", "LIVING", [
      ["Type", r.data.type],
      ["Sleeps", b.sleeps],
      ["Slideouts", b.slideouts],
      ["Seat belts", b.seatBelts],
      ["Awning", b.awning],
      ["Construction", b.construction],
      ["Warranty", b.warranty],
    ]),
    group("tanks", "TANKS", [
      ["Fresh", b.freshWater],
      ["Gray", b.grayWater],
      ["Black", b.blackWater],
      ["Propane", b.propane],
      ["Water heater", b.waterHeater],
    ]),
    group("power", "POWER", [
      ["Generator", b.generator],
      ["Electrical", b.electricalService],
      ["A/C", b.acUnits],
      ["Furnace", b.furnaceBtu],
      ["Converter", b.converter],
    ]),
    group("chassisGear", "CHASSIS GEAR", [
      ["Axles", b.axles],
      ["Tires", b.tireSize],
    ]),
    group("garage", "GARAGE", [
      ["Length", b.garageLength],
      ["Width", b.garageWidth],
      ["Height", b.garageHeight],
      ["Capacity", b.garageCapacity],
      ["Ramp", b.rampWidth],
      ["Fuel station", b.fuelStation],
      ["Fits", b.garageFits],
    ]),
  ].filter((g) => g.rows.length);
}

export function kitStrengths(
  r: RVResult,
  payment?: SharePayment,
  ratingScore?: number,
  includeRating = false,
): string[] {
  r = hydrateShareCoachResult(r);
  const b = coachBrochure(r);
  const out: string[] = [];
  // Rating toggle still writes ★ score in RATING. Never leak breakdown,
  // "out of 5 · tier · confidence", calculation prose, or disclaimer notes.
  void ratingScore;
  void includeRating;
  if (
    /diesel/i.test(b.fuelType) ||
    /diesel|cummins|isl|l9|x15/i.test(b.engine)
  ) {
    out.push("Diesel powertrain — torque for grades and towing");
  }
  const slides = parseInt(b.slideouts, 10);
  if (Number.isFinite(slides) && slides >= 4) {
    out.push(`${slides} slideouts — residential living area`);
  } else if (Number.isFinite(slides) && slides >= 1) {
    out.push(`${slides} slide${slides === 1 ? "" : "s"} for extra living space`);
  }
  const sleeps = parseInt(b.sleeps, 10);
  if (Number.isFinite(sleeps) && sleeps >= 6) {
    out.push(`Sleeps ${sleeps} — family and guest ready`);
  } else if (Number.isFinite(sleeps) && sleeps >= 4) {
    out.push(`Sleeps ${sleeps}`);
  }
  if (hasVal(b.generator) && !/optional|see options|prep/i.test(b.generator)) {
    out.push(`Onboard generator: ${b.generator}`);
  }
  if (hasVal(b.electricalService) && /50/.test(b.electricalService)) {
    out.push("50-amp service — full residential loads");
  }
  if (b.isToyHauler && hasVal(b.garageLength)) {
    out.push(`Toy garage ${b.garageLength}`);
  }
  if (
    b.hitchLabel === "Tow Capacity" &&
    hasVal(b.hitchOrPin) &&
    !/^—/.test(b.hitchOrPin)
  ) {
    out.push(`Tow rating ${b.hitchOrPin}`);
  }
  if (r.data.warrantyYears && r.data.warrantyYears >= 2) {
    out.push(`${r.data.warrantyYears}-year structural warranty`);
  }
  const fresh = parseInt(b.freshWater, 10);
  if (Number.isFinite(fresh) && fresh >= 80) {
    out.push(`${fresh} gal fresh — longer dry camping`);
  }
  // Finance talking points belong in PAYMENT — never mix into STRENGTHS.
  void payment;
  return out;
}

export function paymentBreakdown(payment: SharePayment) {
  const down = Math.round((payment.price * payment.downPct) / 100);
  const loan = computeLoan({
    price: payment.price,
    downPayment: down,
    apr: payment.apr,
    termMonths: payment.termMonths,
    taxRate: 0,
  });
  return {
    down,
    years: payment.termMonths / 12,
    monthly: Math.round(loan.monthlyPayment),
    financed: Math.round(loan.amountFinanced),
    interest: Math.round(loan.totalInterest),
    totalPaid: Math.round(loan.totalPaid),
    loan,
  };
}

export function buildSuitePitch(): string {
  const host = resolveShareHost();
  const lines = [
    "RvFOX Pro — Know before you buy.",
    "",
    "Specs, market, NHTSA, payments, tow match, trips, and Grok — in one suite.",
    "Send a coach kit from the Facts report: full brochure specs, payment strengths, lifestyle, and the report.",
  ];
  if (host) lines.push("", `https://${host}`);
  return lines.join("\n");
}
