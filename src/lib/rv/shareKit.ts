/**
 * RvSHARE send-kit — lot-staff / buyer text cards.
 * Native share when the OS sheet is available; clipboard otherwise.
 */

import type { RVResult } from "./catalog";
import { estimateMarket, ratingFor } from "./catalog";
import { buildBrochureSpecs, type BrochureSpecs } from "./brochureSpecs";
import { getRatingMetadata } from "./ratingSystem";
import {
  computeLoan,
  defaultAprForTerm,
  formatMoney,
  formatPct,
} from "./rvCal";
import { resolveShareHost } from "@/lib/og/shareHost";
import { mediaForRvType } from "@/assets/typeMedia";
import { REPORT_CONTACT_KICKER, REPORT_CONTACT_NAME, REPORT_CONTACT_PHONE } from "./reportContact";
import { getVerifiedDossier } from "./verifiedCatalogCache";
import {
  buildShareMarketSection,
  customerFacingPitch,
  DEFAULT_SHARE_MARKET_LINES,
  effectiveShareInclude,
  isShareableValue,
  isSharePlaceholder,
  sharePowerLines,
  type ShareInclude,
  type ShareMarketLines,
  type ShareSpecGroupId,
} from "./shareCardPolicy";
import {
  coerceShareImageType,
  hardenShareImageFileSync,
  isShareImageFile,
} from "./shareCardImage";
export {
  buildShareKitPayload,
  canShareSaysYes,
  captureShareCardFile,
  coerceShareImageType,
  copyKit,
  downloadShareFile,
  elementLooksLikeShareCard,
  hardenShareImageFile,
  hardenShareImageFileSync,
  isShareImageFile,
  orderShareImageFiles,
  SHARE_CARD_FILENAME,
  SHARE_CARD_MIME,
  shareDataAttempts,
  shareOrCopy,
  toShareData,
} from "./shareCardImage";
export type { ShareKitPayload, ShareOutcome } from "./shareCardImage";

export {
  buildShareMarketSection,
  customerFacingPitch,
  DEFAULT_SHARE_INCLUDE,
  DEFAULT_SHARE_MARKET_LINES,
  effectiveShareInclude,
  formatShareMarketText,
  hasOptionalShareSections,
  hasSelectedMarketLines,
  isShareableValue,
  isSharePlaceholder,
  OPTIONAL_SHARE_KEYS,
  RATE_UPDATED_FLASH,
  RATE_UPDATED_FLASH_MS,
  SHARE_MARKET_LINE_DEFS,
  sharePaymentAfterTermDown,
  sharePaymentPricePills,
  sharePowerLines,
} from "./shareCardPolicy";
export type {
  ShareInclude,
  ShareMarketLineId,
  ShareMarketLines,
  ShareSpecGroupId,
} from "./shareCardPolicy";

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

export const SHARE_KIT_HEADER = "RvFOX · Powered by Grok";
export const SHARE_KIT_TAGLINE = "Know before you buy.";
export const SHARE_KIT_FOOTER =
  "Confirm door sticker, PPI, and lender.";

export function loadSavedUnits(): RVResult[] {
  try {
    const raw = localStorage.getItem(SAVED_UNITS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as RVResult[]) : [];
  } catch {
    return [];
  }
}

export function coachTitle(r: RVResult): string {
  const base = [r.year, r.make, r.model].filter(Boolean).join(" ");
  return r.floorplan ? `${base} ${r.floorplan}` : base;
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
  const market = estimateMarket(r.data, r.year, r.floorplan);
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
  const market = estimateMarket(r.data, r.year, r.floorplan);
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

function liveBrochureBits(r: RVResult): BrochureSummary {
  if (typeof localStorage === "undefined") return { pitch: "", features: [] };
  try {
    const live = getVerifiedDossier(r.year, r.make, r.model, r.floorplan);
    if (!live?.live) return { pitch: "", features: [] };
    const features = (live.keyFeatures || [])
      .map((f) => customerFacingPitch(f))
      .filter(Boolean)
      .slice(0, 6);
    return {
      pitch: customerFacingPitch(live.overview),
      features,
    };
  } catch {
    return { pitch: "", features: [] };
  }
}

/**
 * OEM brochure sales pitch for the shared card.
 * Prefer live/cached brochure overview + key features; else curated description.
 * Never invent specs — empty pitch falls back to catalog type only.
 */
export function brochureSummary(r: RVResult): BrochureSummary {
  const live = liveBrochureBits(r);
  const catalogPitch = customerFacingPitch(r.data.description);
  const pitch = live.pitch || catalogPitch || (r.data.type || "").trim();
  const features = live.features.filter(
    (f) => f && !pitch.toLowerCase().includes(f.toLowerCase()),
  );
  return { pitch, features };
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

function coachBrochure(r: RVResult): BrochureSpecs {
  return buildBrochureSpecs(r.data, r.year, r.make, r.model, r.floorplan || "");
}

export function brochureSpecGroups(r: RVResult) {
  const b = coachBrochure(r);
  const hwyOk = hasVal(b.mpgHighway);
  const cityOk = hasVal(b.mpgCity);
  const economy = hwyOk
    ? `${b.mpgHighway} hwy${cityOk ? ` · ${b.mpgCity} city` : ""}`
    : undefined;
  const notesPitch = customerFacingPitch(r.data.description);
  return [
    group("notes", "NOTES", [
      ["Catalog", notesPitch ? notesPitch.slice(0, 280) : undefined],
    ]),
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
  const b = coachBrochure(r);
  const meta = getRatingMetadata(r.make, r.model, r.year);
  const out: string[] = [];
  const score =
    ratingScore != null && Number.isFinite(ratingScore) && ratingScore > 0
      ? ratingScore
      : meta.score;
  if (includeRating) {
    out.push(
      `${meta.tierLabel} · ${score.toFixed(1)} / 5.0 · ${meta.confidence} confidence`,
    );
    if (meta.yearNote && !isSharePlaceholder(meta.yearNote)) {
      out.push(meta.yearNote);
    }
  }
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

export function coachSnapshot(
  r: RVResult,
  ratingOverride?: number,
): {
  type: string;
  rating: string;
  sleeps: string;
  length: string;
  horsepower: string;
  torque: string;
} {
  const b = coachBrochure(r);
  const catalog = ratingFor(r.make, r.model, r.year);
  const rating =
    ratingOverride != null && Number.isFinite(ratingOverride) && ratingOverride > 0
      ? ratingOverride
      : catalog;
  return {
    type: r.data.type || "",
    rating: Number.isFinite(rating) && rating > 0 ? `★ ${rating.toFixed(1)}` : "",
    sleeps: b.sleeps || (r.data.sleeps ? String(r.data.sleeps) : ""),
    length: b.lengthFt || "",
    horsepower: isShareableValue(b.horsepower) ? b.horsepower.trim() : "",
    torque: isShareableValue(b.torque) ? b.torque.trim() : "",
  };
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

export function buildCoachKit(opts: {
  result: RVResult;
  include: ShareInclude;
  payment?: SharePayment;
  market?: ShareMarket;
  marketLines?: ShareMarketLines;
  strengths?: string[];
  rating?: number;
  summary?: BrochureSummary;
}): string {
  const { result: r, payment } = opts;
  const include = effectiveShareInclude(opts.include);
  const lines: string[] = [];
  const title = coachTitle(r);
  const market = opts.market ?? defaultMarketFor(r);
  const marketLines = opts.marketLines ?? DEFAULT_SHARE_MARKET_LINES;
  const snap = coachSnapshot(r, opts.rating);
  const summary = opts.summary ?? brochureSummary(r);

  lines.push(SHARE_KIT_HEADER);
  lines.push(SHARE_KIT_TAGLINE);
  lines.push("");
  lines.push(title);

  if (summary.pitch || summary.features.length) {
    lines.push("");
    lines.push("SUMMARY");
    if (summary.pitch) lines.push(summary.pitch);
    for (const feature of summary.features) {
      lines.push(`• ${feature}`);
    }
  }

  if (include.rating && snap.rating) {
    lines.push("");
    lines.push("RATING");
    lines.push(snap.rating);
  }

  const power = sharePowerLines(snap.horsepower, snap.torque);
  if (power.length) {
    lines.push("");
    lines.push(...power);
  }

  if (include.market) {
    const marketBlock = buildShareMarketSection(market, marketLines, formatMoney);
    if (marketBlock.length) {
      lines.push("");
      lines.push(...marketBlock);
    }
  }

  if (include.payment && payment && payment.price > 0) {
    const p = paymentBreakdown(payment);
    lines.push("");
    lines.push("PAYMENT (estimate)");
    lines.push(`Price ${formatMoney(payment.price)}`);
    if (Number.isFinite(payment.apr) && payment.apr > 0) {
      lines.push(`Rate ${formatPct(payment.apr)}`);
    }
    lines.push(`≈ ${formatMoney(p.monthly)} / mo`);
    lines.push("Not a lender quote — confirm in RvCAL with ZIP tax.");
  }

  if (include.lifestyle) {
    lines.push("");
    lines.push("LIFESTYLE");
    lines.push(lifestylePitch(r.data.type));
  }

  if (include.strengths) {
    const items =
      opts.strengths ??
      kitStrengths(
        r,
        include.payment ? payment : undefined,
        opts.rating,
        include.rating,
      );
    const clean = items
      .map((s) => s.trim())
      .filter((s) => s && !isSharePlaceholder(s));
    if (clean.length) {
      lines.push("");
      lines.push("STRENGTHS");
      for (const item of clean) lines.push(`• ${item}`);
    }
  }

  const groups = brochureSpecGroups(r);
  for (const g of groups) {
    if (!include[g.id]) continue;
    lines.push("");
    lines.push(g.title);
    for (const row of g.rows) {
      if (isSharePlaceholder(row.value)) continue;
      lines.push(`${row.label}: ${row.value}`);
    }
  }

  lines.push("");
  lines.push("—");
  lines.push(REPORT_CONTACT_KICKER.toUpperCase());
  lines.push(REPORT_CONTACT_NAME);
  lines.push(REPORT_CONTACT_PHONE);
  lines.push("RvFOX Pro · Know before you buy.");
  lines.push(SHARE_KIT_FOOTER);
  return lines.filter((line) => !isSharePlaceholder(line)).join("\n");
}

export function buildSuitePitch(): string {
  const host = resolveShareHost();
  const lines = [
    "RvFOX Pro — Know before you buy.",
    "",
    "Specs, market, NHTSA, payments, tow match, trips, and Grok — in one suite.",
    "Send a coach kit from RvSHARE: full brochure specs, payment strengths, lifestyle, and the report.",
  ];
  if (host) lines.push("", `https://${host}`);
  return lines.join("\n");
}

const shareImageCache = new Map<string, File>();

export function peekCachedShareImage(url: string): File | null {
  return shareImageCache.get(url) ?? null;
}

export function prefetchShareImages(urls: string[]): void {
  for (const url of urls) {
    if (shareImageCache.has(url)) continue;
    const base = (url.split("?")[0] || "").split("/").pop() || "lifestyle.jpg";
    void fetchShareImage(url, base);
  }
}

export async function fetchShareImage(
  url: string,
  filename: string,
): Promise<File | null> {
  const hit = shareImageCache.get(url);
  if (hit) return hit;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const type =
      coerceShareImageType(blob.type, filename) ||
      coerceShareImageType(blob.type, url);
    if (!type) return null;
    const name = /\.(png|jpe?g|webp)$/i.test(filename)
      ? filename
      : `${filename}.${type === "image/jpeg" ? "jpg" : type === "image/webp" ? "webp" : "png"}`;
    const file = hardenShareImageFileSync(
      new File([blob], name, { type }),
    );
    if (!file || !isShareImageFile(file)) return null;
    shareImageCache.set(url, file);
    return file;
  } catch {
    return null;
  }
}
