/**
 * Shared Lot search — token AND-match on own-lot fields.
 * Browser-safe. Used by the Lot page and RV Grok so “27A” matches “27ASE”
 * the same way in both places. No Node, no ownLotInventory, no catalog.
 */

export type LotSearchable = {
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  stock_number?: string;
  body_type?: string;
  location?: string;
  vin?: string;
  title?: string;
  condition?: string;
  lot_status?: string;
  dealer?: string;
};

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

export function lotUnitSearchText(unit: LotSearchable): string {
  return SEARCH_FIELDS.map((k) => String(unit[k] ?? ""))
    .join(" ")
    .toLowerCase();
}

/** Empty search returns the full lot. Tokens are AND-matched on own-lot fields. */
export function searchLotUnits<T extends LotSearchable>(
  units: T[],
  query: string,
): T[] {
  const tokens = tokenizeLotQuery(query);
  if (!tokens.length) return units;
  return units.filter((unit) => {
    const hay = lotUnitSearchText(unit);
    return tokens.every((t) => hay.includes(t));
  });
}
