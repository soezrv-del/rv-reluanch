/**
 * Reverse tow match: trailer GVWR → ranked catalog trucks/SUVs.
 * Reads the OEM table; does not edit it or invent ratings.
 */

import { TOW_MAKES, type VehicleKind } from "./towVehicles.ts";
import {
  filterTrimsForYear,
  formatTrimYearRange,
  trimStem,
} from "./towYear.ts";

/** Same planning band as the vehicle-first match screen. */
export const RECOMMENDED_TOW_FACTOR = 0.8;
export const RECOMMENDED_PAYLOAD_FACTOR = 0.85;

/** Existing 5th-wheel pin estimate (vehicle-first already uses 20%). */
export const PIN_WEIGHT_FRACTION = 0.2;
/** Mid-band conventional tongue (10–15%) — ranking only, not full #4 math. */
export const TONGUE_WEIGHT_FRACTION = 0.12;

export const REVERSE_SHORTLIST = 8;
export const REVERSE_PER_MODEL = 1;
export const REVERSE_EXPAND_PER_MODEL = 2;
export const REVERSE_LIST_CAP = 24;

export type ReverseRvType = "Fifth Wheel" | "Travel Trailer";

export type ReverseQuery = {
  gvwrLbs: number;
  rvType: string;
  year?: string | number | null;
  kind?: VehicleKind | "all";
  pinLbs?: number;
  limit?: number;
};

export type ReverseHit = {
  make: string;
  model: string;
  trim: string;
  stem: string;
  kind: VehicleKind;
  hitch: string;
  maxTow: number;
  payload: number;
  gcwr: number;
  recommendedTow: number;
  recommendedPayload: number;
  towMargin: number;
  hitchLoad: number;
  payloadChecked: boolean;
  yearRange?: string;
};

export type ReverseResult = {
  hits: ReverseHit[];
  total: number;
  hitchLoad: number;
  gvwrLbs: number;
};

export function normalizeReverseRvType(type?: string | null): ReverseRvType {
  return /fifth/i.test(type || "") ? "Fifth Wheel" : "Travel Trailer";
}

export function recommendedTowLbs(maxTow: number): number {
  if (!(maxTow > 0)) return 0;
  return Math.round(maxTow * RECOMMENDED_TOW_FACTOR);
}

export function recommendedPayloadLbs(payload: number): number {
  if (!(payload > 0)) return 0;
  return Math.round(payload * RECOMMENDED_PAYLOAD_FACTOR);
}

export function hitchLoadLbs(input: {
  rvType: string;
  gvwrLbs: number;
  pinLbs?: number;
}): number {
  const gvwr = input.gvwrLbs;
  if (!(gvwr > 0)) return 0;
  if (normalizeReverseRvType(input.rvType) === "Fifth Wheel") {
    const pin = input.pinLbs;
    if (typeof pin === "number" && Number.isFinite(pin) && pin > 0) {
      return Math.round(pin);
    }
    return Math.round(gvwr * PIN_WEIGHT_FRACTION);
  }
  return Math.round(gvwr * TONGUE_WEIGHT_FRACTION);
}

export function trimQualifiesForTrailer(
  trim: { maxTow: number; payload: number },
  input: { gvwrLbs: number; hitchLoad: number },
): boolean {
  if (!(trim.maxTow > 0) || !(input.gvwrLbs > 0)) return false;
  const recTow = recommendedTowLbs(trim.maxTow);
  if (recTow < input.gvwrLbs) return false;
  if (trim.payload > 0) {
    const recPayload = recommendedPayloadLbs(trim.payload);
    if (input.hitchLoad > recPayload) return false;
  }
  return true;
}

function modelKey(make: string, model: string): string {
  return `${make}|${model}`;
}

function diversifyHits(sorted: ReverseHit[], limit: number): ReverseHit[] {
  const cap = Math.max(1, Math.min(limit, REVERSE_LIST_CAP));
  const perModel = cap <= REVERSE_SHORTLIST ? REVERSE_PER_MODEL : REVERSE_EXPAND_PER_MODEL;
  const counts = new Map<string, number>();
  const out: ReverseHit[] = [];
  for (const hit of sorted) {
    const key = modelKey(hit.make, hit.model);
    const n = counts.get(key) ?? 0;
    if (n >= perModel) continue;
    out.push(hit);
    counts.set(key, n + 1);
    if (out.length >= cap) break;
  }
  return out;
}

function isChassisCab(hit: ReverseHit): boolean {
  return /chassis\s*cab/i.test(`${hit.model} ${hit.stem}`);
}

function compareHits(a: ReverseHit, b: ReverseHit): number {
  // Same numbers, but buyers shop pickups first — chassis cabs still qualify.
  const cab = Number(isChassisCab(a)) - Number(isChassisCab(b));
  if (cab) return cab;
  if (a.recommendedTow !== b.recommendedTow) return a.recommendedTow - b.recommendedTow;
  if (a.payload !== b.payload) return b.payload - a.payload;
  const makeCmp = a.make.localeCompare(b.make);
  if (makeCmp) return makeCmp;
  const modelCmp = a.model.localeCompare(b.model);
  if (modelCmp) return modelCmp;
  return a.stem.localeCompare(b.stem);
}

/**
 * Rank catalog rows that can tow this trailer at the 80% planning band.
 * Fifth wheels need a truck. Missing payload skips the pin/tongue check
 * (we do not invent a rating). Empty / no-match is a valid result.
 */
export function rankTowVehiclesForTrailer(query: ReverseQuery): ReverseResult {
  const gvwrLbs = query.gvwrLbs;
  const hitchLoad = hitchLoadLbs({
    rvType: query.rvType,
    gvwrLbs,
    pinLbs: query.pinLbs,
  });
  const empty: ReverseResult = { hits: [], total: 0, hitchLoad, gvwrLbs };

  if (!(gvwrLbs > 0)) return empty;

  const rvType = normalizeReverseRvType(query.rvType);
  const kind = query.kind ?? "all";
  if (rvType === "Fifth Wheel" && kind === "suv") return empty;
  const wantKind: VehicleKind | "all" =
    rvType === "Fifth Wheel" ? "truck" : kind;

  const byStem = new Map<string, ReverseHit>();

  for (const make of TOW_MAKES) {
    for (const model of make.models) {
      if (wantKind !== "all" && model.kind !== wantKind) continue;
      const trims = filterTrimsForYear(model.trims, query.year);
      for (const trim of trims) {
        if (!trimQualifiesForTrailer(trim, { gvwrLbs, hitchLoad })) continue;
        const stem = trimStem(trim.label) || trim.label;
        const key = `${make.name}|${model.name}|${stem}`;
        const recTow = recommendedTowLbs(trim.maxTow);
        const recPayload = recommendedPayloadLbs(trim.payload);
        const hit: ReverseHit = {
          make: make.name,
          model: model.name,
          trim: trim.label,
          stem,
          kind: model.kind,
          hitch: trim.hitch,
          maxTow: trim.maxTow,
          payload: trim.payload,
          gcwr: trim.gcwr,
          recommendedTow: recTow,
          recommendedPayload: recPayload,
          towMargin: recTow - gvwrLbs,
          hitchLoad,
          payloadChecked: trim.payload > 0,
          yearRange: formatTrimYearRange(trim.label),
        };
        const prev = byStem.get(key);
        if (!prev || compareHits(hit, prev) < 0) byStem.set(key, hit);
      }
    }
  }

  const ranked = [...byStem.values()].sort(compareHits);
  const limit = query.limit ?? REVERSE_SHORTLIST;
  return {
    hits: diversifyHits(ranked, limit),
    total: ranked.length,
    hitchLoad,
    gvwrLbs,
  };
}
