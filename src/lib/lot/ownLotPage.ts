/**
 * Salesman Lot stock page — RV Country own-lot snapshot only.
 * Browser-safe: does not import RV Grok's Node own-lot loader.
 * Does not read the brochure catalog. Does not change RV Grok resolve.
 * Token search lives in lotSearch.ts so Grok can share it.
 */

import { searchLotUnits } from "./lotSearch.ts";

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

function rowToLotUnit(row: Record<string, unknown>): LotUnit {
  const unit: LotUnit = {
    year: pickStr(row, "year", "model_year", "my"),
    make: pickStr(row, "make", "brand", "manufacturer"),
    model: pickStr(row, "model", "series"),
    trim: pickStr(row, "trim", "floorplan", "plan"),
    body_type: pickStr(
      row,
      "body_type",
      "bodytype",
      "rv_type",
      "class",
      "type",
      "category",
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
    photo: pickStr(
      row,
      "photo",
      "photo_url",
      "image",
      "image_url",
      "thumbnail",
      "thumb",
      "img",
    ),
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
    if (!asOf) asOf = pickStr(rec, "scraped_at");
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

/** Snapshot photo only — listing page URLs are not images. */
export function lotUnitPhoto(unit: LotUnit): string | null {
  const raw = unit.photo.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw) && !/\.(html?)($|\?)/i.test(raw)) {
    if (/\.(avif|gif|jpe?g|png|webp)($|\?)/i.test(raw) || /\/image|\/photo|\/media\//i.test(raw)) {
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

export {
  floorplanTokensAlign,
  isFloorplanLikeToken,
  lotUnitSearchText,
  normalizeLotSearchToken,
  searchLotUnits,
  tokenizeLotQuery,
  type LotSearchable,
} from "./lotSearch.ts";

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
  "Destination Trailer": "Dest",
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
