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

/**
 * Spoken plurals for lot questions. Plain words of 4+ letters drop a
 * trailing s ("lineages" → "lineage"). Class-letter plurals drop s too
 * ("cs" → "c") so "super cs" is "super c". Floorplans stay intact.
 */
export function singularizeLotToken(token: string): string {
  const t = normalizeLotSearchToken(token);
  if (!t) return "";
  if (isFloorplanLikeToken(t) || /\d/.test(t)) return t;
  if (/^[abc]s$/.test(t)) return t[0] || t;
  if (t.length < 4 || !/^[a-z]+$/.test(t)) return t;
  if (t.endsWith("ss")) return t;
  if (t.endsWith("ies") && t.length > 4) return `${t.slice(0, -3)}y`;
  if (/(?:ch|sh|x|z)es$/.test(t)) return t.slice(0, -2);
  if (t.endsWith("s")) return t.slice(0, -1);
  return t;
}

export function isFloorplanLikeToken(token: string): boolean {
  return FLOORPLAN_LIKE_TOKEN_RE.test(normalizeLotSearchToken(token));
}

/**
 * Shared query normalizer for the Lot page bar and searchLot.
 * Lowercase, drop possessives and punctuation, glue "29 V" / "29-V" into
 * 29V, then singularize (lineages → lineage, super cs → super c).
 */
export function normalizeLotSearchQuery(raw: string): string {
  let s = (raw || "").toLowerCase();
  s = s.replace(/['’]s\b/g, "").replace(/['’]/g, "");
  s = s.replace(/[?!.,;:()]+/g, " ");
  s = s.replace(/\b(\d{2,3})\s*-\s*([a-z]{1,4})\b/g, "$1$2");
  s = s.replace(/\b(\d{2,3})\s+([a-z]{1,4})\b/g, "$1$2");
  s = s.replace(/-/g, " ");
  s = s.replace(/\s+/g, " ").trim();
  return s
    .split(/[\s,/|]+/)
    .map((token) => singularizeLotToken(token))
    .filter(Boolean)
    .join(" ");
}

export function tokenizeLotQuery(query: string): string[] {
  const normalized = normalizeLotSearchQuery(query);
  return normalized ? normalized.split(" ") : [];
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
 * 27A ↔ 27ASE, 31Z ↔ 31ZW / 31ZW5. The ask is a prefix of the unit code,
 * or the unit code is a prefix of the ask with only series letters left.
 */
export function floorplanTokensAlign(ask: string, unitToken: string): boolean {
  const a = normalizeLotSearchToken(ask).replace(/[\s-]+/g, "");
  const u = normalizeLotSearchToken(unitToken).replace(/[\s-]+/g, "");
  if (!a || !u) return false;
  if (a === u) return true;
  if (u.startsWith(a)) return true;
  if (a.startsWith(u) && /^[a-z]+$/.test(a.slice(u.length))) return true;
  return false;
}

const TYPEAHEAD_FIELDS = [
  "year",
  "make",
  "model",
  "trim",
  "stock_number",
  "title",
  "body_type",
  "location",
  "condition",
  "lot_status",
  "dealer",
] as const satisfies readonly (keyof LotSearchable)[];

function compactId(value: string | undefined): string {
  return (value || "").toLowerCase().replace(/^#/, "").trim();
}

function typeaheadWords(unit: LotSearchable): string[] {
  const words: string[] = [];
  for (const key of TYPEAHEAD_FIELDS) {
    for (const word of String(unit[key] ?? "").toLowerCase().split(/[^a-z0-9]+/)) {
      if (word) words.push(word);
    }
  }
  return words;
}

function typeaheadBlob(unit: LotSearchable): string {
  return TYPEAHEAD_FIELDS.map((key) => String(unit[key] ?? ""))
    .join(" ")
    .toLowerCase();
}

function tokenMatchesFloorplanFields(unit: LotSearchable, token: string): boolean {
  if (floorplanTokensAlign(token, unit.trim || "")) return true;
  const blob = `${unit.model || ""} ${unit.trim || ""}`.trim();
  if (blob && floorplanTokensAlign(token, blob.replace(/\s+/g, ""))) return true;
  return lotUnitFloorplanText(unit).includes(token);
}

/**
 * Type-ahead token. After singularize: a prefix of any word in make, model,
 * trim, stock, year, title, or body, or a substring when the token is long
 * enough ("Linea" in Lineage, "31Z" in 31ZW / 31ZW5). A floorplan token
 * matches the floorplan fields only, so 27A does not hitch stock UCO9527A.
 */
export function lotTokenMatchesUnit(
  unit: LotSearchable,
  token: string,
): boolean {
  const t = singularizeLotToken(token);
  if (!t) return true;
  const stock = compactId(unit.stock_number);
  const vin = compactId(unit.vin);
  if (stock === t || vin === t) return true;
  if (isFloorplanLikeToken(t)) {
    return tokenMatchesFloorplanFields(unit, t);
  }
  if (stock.startsWith(t)) return true;
  if (typeaheadWords(unit).some((word) => word.startsWith(t))) return true;
  if (t.length >= 4 || /\d/.test(t)) return typeaheadBlob(unit).includes(t);
  return false;
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
