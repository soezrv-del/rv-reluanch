/**
 * Shared own-lot search (Lot stock page + RV Grok inventory asks).
 * Browser-safe — no Node, no brochure catalog.
 *
 * Floorplan-like tokens (27A, 27ASE, 29S) match coach fields / trim alignment.
 * They must not hitch a ride as a substring of stock_number or VIN
 * (UCO9527A is not a 27A). A full stock # or VIN still matches exactly.
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

export type LotSearchUnit = LotSearchable;

/** 27A / 29S / 27ASE / 318RL — short spoken floorplan / trim codes. */
export const FLOORPLAN_LIKE_TOKEN_RE = /^\d{2,3}[a-z]{1,4}$/i;

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

const FLOORPLAN_FIELDS = ["year", "make", "model", "trim", "title"] as const;

export function normalizeLotSearchToken(token: string): string {
  const t = (token || "").toLowerCase().replace(/['’]/g, "").trim();
  if (!t) return "";
  // Spoken plural "27As" / "27A's" → 27A. Leaves 27ASE / 29S alone.
  if (/^\d{2,3}[a-z]s$/i.test(t) && !/se$/i.test(t)) {
    return t.slice(0, -1);
  }
  return t;
}

export function isFloorplanLikeToken(token: string): boolean {
  return FLOORPLAN_LIKE_TOKEN_RE.test(normalizeLotSearchToken(token));
}

export function tokenizeLotQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,/|]+/)
    .map((t) => normalizeLotSearchToken(t))
    .filter(Boolean);
}

function fieldText(
  unit: LotSearchable,
  keys: readonly (keyof LotSearchable)[],
): string {
  return keys
    .map((k) => String(unit[k] ?? ""))
    .join(" ")
    .toLowerCase();
}

export function lotUnitSearchText(unit: LotSearchable): string {
  return fieldText(unit, SEARCH_FIELDS);
}

export function lotUnitFloorplanText(unit: LotSearchable): string {
  return fieldText(unit, FLOORPLAN_FIELDS);
}

/**
 * 27A ↔ 27ASE: ask is a prefix of the unit trim (or the reverse) and the
 * leftover is trailing series letters only (SE, XL). Do not invent plans.
 */
export function floorplanTokensAlign(ask: string, unitToken: string): boolean {
  const a = normalizeLotSearchToken(ask).replace(/[\s-]+/g, "");
  const u = normalizeLotSearchToken(unitToken).replace(/[\s-]+/g, "");
  if (!a || !u) return false;
  if (a === u) return true;
  if (u.startsWith(a) && /^[a-z]+$/.test(u.slice(a.length))) return true;
  if (a.startsWith(u) && /^[a-z]+$/.test(a.slice(u.length))) return true;
  return false;
}

function compactId(value: string | undefined): string {
  return (value || "").toLowerCase().replace(/^#/, "").trim();
}

function tokenMatchesFloorplanFields(unit: LotSearchable, token: string): boolean {
  if (floorplanTokensAlign(token, unit.trim || "")) return true;
  const blob = `${unit.model || ""} ${unit.trim || ""}`.trim();
  if (blob && floorplanTokensAlign(token, blob.replace(/\s+/g, ""))) return true;
  return lotUnitFloorplanText(unit).includes(token);
}

export function lotTokenMatchesUnit(
  unit: LotSearchable,
  token: string,
): boolean {
  const t = normalizeLotSearchToken(token);
  if (!t) return true;
  const stock = compactId(unit.stock_number);
  const vin = compactId(unit.vin);
  if (stock === t || vin === t) return true;
  if (isFloorplanLikeToken(t)) {
    return tokenMatchesFloorplanFields(unit, t);
  }
  return lotUnitSearchText(unit).includes(t);
}

/** Empty search returns the full lot. Tokens are AND-matched. */
export function searchLotUnits<T extends LotSearchable>(
  units: T[],
  query: string,
): T[] {
  const tokens = tokenizeLotQuery(query);
  if (!tokens.length) return units;
  return units.filter((unit) => tokens.every((t) => lotTokenMatchesUnit(unit, t)));
}
