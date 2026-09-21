/**
 * Salesman Lot stock page — RV Country own-lot snapshot only.
 * Does not read the brochure catalog. Does not change RV Grok resolve.
 */
import {
  extractOwnLotRows,
  formatOwnLotUsd,
  OWN_LOT_PUBLIC_URL_PATH,
  rowToUnit,
  type OwnLotUnit,
} from "../rvgrok/ownLotInventory.ts";

export const LOT_SNAPSHOT_URL = OWN_LOT_PUBLIC_URL_PATH;
export const LOT_GAP = "GAP";

export type LotUnit = OwnLotUnit & {
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

function str(row: Record<string, unknown>, key: string): string {
  const v = row[key];
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

function composedTitle(unit: OwnLotUnit): string {
  return [unit.year, unit.make, unit.model, unit.trim]
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

export function parseLotSnapshotJson(json: unknown): LotSnapshotView {
  const rows = extractOwnLotRows(json);
  const units: LotUnit[] = [];
  let asOf = "";
  let dealer = "RV Country";
  let source = "own";

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const rec = row as Record<string, unknown>;
    const unit = rowToUnit(rec);
    if (!unit.make && !unit.model && !unit.body_type && !unit.stock_number) {
      continue;
    }
    const title = str(rec, "title") || composedTitle(unit);
    units.push({
      ...unit,
      title,
      condition: str(rec, "condition"),
      url: str(rec, "url"),
      lot_status: str(rec, "lot_status"),
    });
    if (!asOf) asOf = str(rec, "scraped_at");
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
  return price != null && price > 0 ? formatOwnLotUsd(price) : LOT_GAP;
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
