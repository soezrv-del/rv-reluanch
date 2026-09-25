/**
 * Salesman Lot stock page — RV Country own-lot snapshot only.
 * Browser-safe: does not import RV Grok's Node own-lot loader.
 * Does not read the brochure catalog. Does not change RV Grok resolve.
 * Token search lives in lotSearch.ts so Grok can share it.
 *
 * Spec fields are lot-unit data from the dealer feed. They never overwrite
 * OEM brochure pins. 0 / blank weights and tanks stay GAP.
 */

import {
  floorplanTokensAlign,
  isFloorplanLikeToken,
  lotUnitSearchText,
  normalizeLotSearchToken,
  searchLotUnits,
  tokenizeLotQuery,
} from "./lotSearch.ts";

export {
  floorplanTokensAlign,
  isFloorplanLikeToken,
  lotUnitSearchText,
  normalizeLotSearchToken,
  searchLotUnits,
  tokenizeLotQuery,
};
export type { LotSearchable } from "./lotSearch.ts";

export const LOT_SNAPSHOT_URL = "/inventory/own-lot-latest.json";
export const LOT_GAP = "GAP";

const PRICE_KEYS = [
  "price",
  "price_current",
  "price_hidden",
  "price_lowest",
  "price_msrp",
] as const;

export type LotUnit = {
  year: string;
  make: string;
  model: string;
  trim: string;
  body_type: string;
  location: string;
  stock_number: string;
  vin: string;
  source: string;
  dealer: string;
  price: number | null;
  title: string;
  condition: string;
  url: string;
  lot_status: string;
  photo: string;
  mileage: string;
  gvwr: number | null;
  dry_weight: number | null;
  hitch_weight: number | null;
  payload: number | null;
  length_ft: number | null;
  height_ft: number | null;
  width_ft: number | null;
  sleeps: number | null;
  slides: number | null;
  fresh_gal: number | null;
  gray_gal: number | null;
  black_gal: number | null;
  propane_lbs: number | null;
  propane_gal: number | null;
  engine: string;
  chassis: string;
  fuel_type: string;
};

export type LotSnapshotView = {
  units: LotUnit[];
  asOf: string;
  dealer: string;
  source: string;
};

function asText(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function lowerKeyMap(row: Record<string, unknown>): Record<string, unknown> {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    lower[k.toLowerCase().replace(/[\s-]+/g, "_")] = v;
  }
  return lower;
}

function pickStr(row: Record<string, unknown>, ...keys: string[]): string {
  const lower = lowerKeyMap(row);
  for (const k of keys) {
    const v = lower[k.toLowerCase().replace(/[\s-]+/g, "_")];
    if (asText(v)) return asText(v);
  }
  return "";
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") return null;
  const cleaned = value.replace(/[,\s]/g, "").replace(/[a-z'′″"]+$/i, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function pickNum(row: Record<string, unknown>, ...keys: string[]): number | null {
  const lower = lowerKeyMap(row);
  for (const k of keys) {
    const n = parseNumber(lower[k.toLowerCase().replace(/[\s-]+/g, "_")]);
    if (n != null) return n;
  }
  return null;
}

/** Weights / tanks / propane: 0 means unpublished, not a printed zero. */
function pickPositive(
  row: Record<string, unknown>,
  ...keys: string[]
): number | null {
  const n = pickNum(row, ...keys);
  return n != null && n > 0 ? n : null;
}

/** Slides / sleeps: 0 is a real printed count. */
function pickCount(
  row: Record<string, unknown>,
  ...keys: string[]
): number | null {
  const n = pickNum(row, ...keys);
  return n != null && n >= 0 ? n : null;
}

function parsePrice(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const k = /k$/i.test(raw.replace(/[\s,]/g, ""));
  const cleaned = raw.replace(/[$,\s]/g, "").replace(/k$/i, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return k ? n * 1000 : n;
}

function pickPrice(row: Record<string, unknown>): number | null {
  const lower = lowerKeyMap(row);
  for (const k of PRICE_KEYS) {
    const n = parsePrice(lower[k]);
    if (n != null) return n;
  }
  return null;
}

function formatUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function firstImageUrl(value: unknown): string {
  if (!Array.isArray(value) || !value.length) return "";
  const first = value[0];
  if (!first || typeof first !== "object") return asText(first);
  return asText((first as Record<string, unknown>).url);
}

function pickPhoto(row: Record<string, unknown>): string {
  const direct = pickStr(
    row,
    "photo",
    "photo_url",
    "image",
    "image_url",
    "thumbnail",
    "thumb",
    "img",
    "display_image",
  );
  if (direct) return direct;
  return firstImageUrl(row.images) || firstImageUrl(row.media);
}

function extractRows(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  if (!json || typeof json !== "object") return [];
  const o = json as Record<string, unknown>;
  for (const k of [
    "units",
    "inventory",
    "items",
    "listings",
    "rows",
    "data",
    "coaches",
    "rvs",
    "vehicles",
  ]) {
    if (Array.isArray(o[k])) return o[k] as unknown[];
  }
  return [];
}

function composedTitle(unit: LotUnit): string {
  return [unit.year, unit.make, unit.model, unit.trim]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

function emptySpecs(): Pick<
  LotUnit,
  | "mileage"
  | "gvwr"
  | "dry_weight"
  | "hitch_weight"
  | "payload"
  | "length_ft"
  | "height_ft"
  | "width_ft"
  | "sleeps"
  | "slides"
  | "fresh_gal"
  | "gray_gal"
  | "black_gal"
  | "propane_lbs"
  | "propane_gal"
  | "engine"
  | "chassis"
  | "fuel_type"
> {
  return {
    mileage: "",
    gvwr: null,
    dry_weight: null,
    hitch_weight: null,
    payload: null,
    length_ft: null,
    height_ft: null,
    width_ft: null,
    sleeps: null,
    slides: null,
    fresh_gal: null,
    gray_gal: null,
    black_gal: null,
    propane_lbs: null,
    propane_gal: null,
    engine: "",
    chassis: "",
    fuel_type: "",
  };
}

function rowToLotUnit(row: Record<string, unknown>): LotUnit {
  const unit: LotUnit = {
    year: pickStr(row, "year", "model_year", "my"),
    make: pickStr(row, "make", "brand", "manufacturer", "unit_make"),
    model: pickStr(row, "model", "series", "unit_model"),
    trim: pickStr(row, "trim", "floorplan", "plan", "unit_trim"),
    body_type: pickStr(
      row,
      "body_type",
      "bodytype",
      "rv_type",
      "class",
      "type",
      "category",
      "unit_classification",
    ),
    location: pickStr(row, "location", "store", "lot", "branch", "city"),
    stock_number: pickStr(
      row,
      "stock_number",
      "stock",
      "stock_no",
      "stockno",
      "stk",
    ),
    vin: pickStr(row, "vin", "vehicle_identification_number"),
    source: pickStr(row, "source") || "own",
    dealer: pickStr(row, "dealer") || "RV Country",
    price: pickPrice(row),
    title: pickStr(row, "title"),
    condition: pickStr(row, "condition"),
    url: pickStr(row, "url"),
    lot_status: pickStr(row, "lot_status"),
    photo: pickPhoto(row),
    ...emptySpecs(),
    mileage: pickStr(row, "mileage", "odometer", "mileage_from_odometer"),
    gvwr: pickPositive(row, "gvwr"),
    dry_weight: pickPositive(row, "dry_weight", "uvw", "dry"),
    hitch_weight: pickPositive(row, "hitch_weight", "hitch", "tongue_weight"),
    payload: pickPositive(row, "payload", "standard_payload", "ccc"),
    length_ft: pickPositive(
      row,
      "length_ft",
      "vehicle_body_length",
      "length",
    ),
    height_ft: pickPositive(
      row,
      "height_ft",
      "vehicle_body_height",
      "height",
    ),
    width_ft: pickPositive(row, "width_ft", "vehicle_body_width", "width"),
    sleeps: pickCount(row, "sleeps", "max_sleeping_count"),
    slides: pickCount(row, "slides", "number_of_slideouts", "slideouts"),
    fresh_gal: pickPositive(
      row,
      "fresh_gal",
      "total_fresh_water_tank_capacity",
    ),
    gray_gal: pickPositive(
      row,
      "gray_gal",
      "total_gray_water_tank_capacity",
    ),
    black_gal: pickPositive(
      row,
      "black_gal",
      "total_black_water_tank_capacity",
    ),
    propane_lbs: pickPositive(row, "propane_lbs", "propane_lb"),
    propane_gal: pickPositive(row, "propane_gal"),
    engine: pickStr(row, "engine"),
    chassis: pickStr(row, "chassis", "chassis_brand"),
    fuel_type: pickStr(row, "fuel_type", "fuel"),
  };
  if (!unit.title) unit.title = composedTitle(unit);
  return unit;
}

export function parseLotSnapshotJson(json: unknown): LotSnapshotView {
  const rows = extractRows(json);
  const units: LotUnit[] = [];
  let asOf = "";
  let dealer = "RV Country";
  let source = "own";

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const unit = rowToLotUnit(rec);
    if (!unit.make && !unit.model && !unit.body_type && !unit.stock_number) {
      continue;
    }
    units.push(unit);
    if (!asOf) asOf = pickStr(rec, "scraped_at", "generated_at");
    if (unit.dealer) dealer = unit.dealer;
    if (unit.source) source = unit.source;
  }

  return { units, asOf, dealer, source };
}

export async function fetchLotSnapshot(): Promise<LotSnapshotView> {
  const res = await fetch(LOT_SNAPSHOT_URL);
  if (!res.ok) {
    throw new Error("Lot snapshot unavailable");
  }
  const kind = res.headers.get("content-type") ?? "";
  if (kind.includes("text/html")) {
    throw new Error("Lot snapshot unavailable");
  }
  const json: unknown = await res.json();
  return parseLotSnapshotJson(json);
}

export function lotTextOrGap(value: string | null | undefined): string {
  const t = (value ?? "").trim();
  return t ? t : LOT_GAP;
}

export function lotPriceOrGap(price: number | null | undefined): string {
  return price != null && price > 0 ? formatUsd(price) : LOT_GAP;
}

export function lotLbsOrGap(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return LOT_GAP;
  return `${Math.round(n).toLocaleString("en-US")} lb`;
}

export function lotGalOrGap(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n <= 0) return LOT_GAP;
  const shown = Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
  return `${shown} gal`;
}

export function lotCountOrGap(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n) || n < 0) return LOT_GAP;
  return String(n);
}

export function lotLengthOrGap(ft: number | null | undefined): string {
  if (ft == null || !Number.isFinite(ft) || ft <= 0) return LOT_GAP;
  const whole = Math.floor(ft + 1e-9);
  let inches = Math.round((ft - whole) * 12);
  if (inches === 12) return `${whole + 1}′`;
  if (inches <= 0) return `${whole}′`;
  return `${whole}′${inches}″`;
}

/** Printed propane only — lbs if present, else gal. Never convert. */
export function lotPropaneOrGap(unit: Pick<LotUnit, "propane_lbs" | "propane_gal">): string {
  if (unit.propane_lbs != null && unit.propane_lbs > 0) {
    return `${Math.round(unit.propane_lbs)} lb`;
  }
  if (unit.propane_gal != null && unit.propane_gal > 0) {
    return lotGalOrGap(unit.propane_gal);
  }
  return LOT_GAP;
}

export function lotSpecLine(unit: LotUnit): string {
  const parts: string[] = [];
  const length = lotLengthOrGap(unit.length_ft);
  if (length !== LOT_GAP) parts.push(length);
  if (unit.slides != null && unit.slides >= 0) {
    parts.push(`${unit.slides} slide${unit.slides === 1 ? "" : "s"}`);
  }
  if (unit.sleeps != null && unit.sleeps >= 0) {
    parts.push(`sleeps ${unit.sleeps}`);
  }
  const gvwr = lotLbsOrGap(unit.gvwr);
  if (gvwr !== LOT_GAP) parts.push(`GVWR ${gvwr}`);
  return parts.join(" · ");
}

/** Snapshot photo only — listing page URLs are not images. */
export function lotUnitPhoto(unit: LotUnit): string | null {
  const raw = unit.photo.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) && !/\.(html?)($|\?)/i.test(raw)) {
    if (
      /\.(avif|gif|jpe?g|png|webp)($|\?)/i.test(raw) ||
      /\/image|\/photo|\/media\//i.test(raw)
    ) {
      return raw;
    }
    return null;
  }
  if (raw.startsWith("/") && /\.(avif|gif|jpe?g|png|webp)($|\?)/i.test(raw)) {
    return raw;
  }
  return null;
}

export function lotUnitKey(unit: LotUnit, index: number): string {
  return [
    unit.stock_number,
    unit.vin,
    unit.year,
    unit.make,
    unit.model,
    unit.trim,
    String(index),
  ].join("|");
}

const TYPE_LABELS: Record<string, string> = {
  "Travel Trailer": "Travel trailer",
  "Fifth Wheel": "Fifth wheel",
  "Class A Diesel": "Diesel",
  "Class Super C": "Super C",
  "Class A": "Class A",
  "Class B": "Class B",
  "Class C": "Class C",
  "Fifth Wheel Toy Hauler": "FW toy",
  "Travel Trailer Toy Hauler": "TT toy",
  "Destination Trailer": "Destination",
  "Truck Camper": "Camper",
  Popup: "Popup",
  "Popup Trailer": "Popup",
  "Expandable Trailer": "Expandable",
};

export type LotTypeChip = {
  type: string;
  label: string;
  count: number;
};

export function shortLotTypeLabel(type: string): string {
  const t = type.trim();
  if (!t) return LOT_GAP;
  return TYPE_LABELS[t] ?? t;
}

const PILL_TYPE_LABELS: Record<string, string> = {
  "Travel Trailer": "TT",
  "Fifth Wheel": "FW",
  "Class A Diesel": "Diesel",
  "Class Super C": "Super C",
  "Class A": "A",
  "Class B": "B",
  "Class C": "C",
  "Fifth Wheel Toy Hauler": "FW toy",
  "Travel Trailer Toy Hauler": "TT toy",
  "Destination Trailer": "Destination",
  "Truck Camper": "Camper",
  Popup: "Popup",
  "Popup Trailer": "Popup",
  "Expandable Trailer": "Exp",
};

export function pillLotTypeLabel(type: string): string {
  const t = type.trim();
  if (!t) return LOT_GAP;
  return PILL_TYPE_LABELS[t] ?? shortLotTypeLabel(t);
}

/** Visual family for lot chrome only — never a catalog class list. */
export type LotTypeFamily = "a" | "b" | "c" | "fw" | "tt" | "toy" | "camper";

export function lotTypeFamily(type: string): LotTypeFamily {
  const t = type.toLowerCase();
  if (t.includes("toy")) return "toy";
  if (t.includes("fifth")) return "fw";
  if (t.includes("super c") || t.includes("class c")) return "c";
  if (t.includes("class b") || t.includes("b+")) return "b";
  if (t.includes("class a") || t.includes("diesel")) return "a";
  if (t.includes("camper") || t.includes("truck")) return "camper";
  return "tt";
}

/** Type chips from the snapshot only — never a brochure class list. */
export function lotTypeChips(units: LotUnit[]): LotTypeChip[] {
  const counts = new Map<string, number>();
  for (const unit of units) {
    const type = unit.body_type.trim();
    if (!type) continue;
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([type, count]) => ({
      type,
      label: shortLotTypeLabel(type),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function filterLotBrowse(
  units: LotUnit[],
  opts: { query?: string; type?: string } = {},
): LotUnit[] {
  let rows = searchLotUnits(units, opts.query ?? "");
  const type = (opts.type ?? "").trim();
  if (type) {
    rows = rows.filter((unit) => unit.body_type === type);
  }
  return rows;
}
