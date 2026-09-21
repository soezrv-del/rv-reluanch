/**
 * Salesman Lot stock page — RV Country own-lot snapshot only.
 * Browser-safe: does not import RV Grok's Node own-lot loader.
 * Does not read the brochure catalog. Does not change RV Grok resolve.
 */

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

const SEARCH_FIELDS = [
  "year",
  "make",
  "model",
  "trim",
  "stock_number",
  "body_type",
  "location",
  "vin",
  "title",
  "condition",
  "lot_status",
  "dealer",
] as const;

export function tokenizeLotQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,/|]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function lotUnitSearchText(unit: LotUnit): string {
  return SEARCH_FIELDS.map((k) => String(unit[k] ?? ""))
    .join(" ")
    .toLowerCase();
}

/** Empty search returns the full lot. Tokens are AND-matched on own-lot fields. */
export function searchLotUnits(units: LotUnit[], query: string): LotUnit[] {
  const tokens = tokenizeLotQuery(query);
  if (!tokens.length) return units;
  return units.filter((unit) => {
    const hay = lotUnitSearchText(unit);
    return tokens.every((t) => hay.includes(t));
  });
}
