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
  fuel_type?: string;
  engine?: string;
  chassis?: string;
  chassis_brand?: string;
  transmission?: string;
  features?: string;
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
  "fuel_type",
  "engine",
  "chassis",
  "chassis_brand",
  "transmission",
  "features",
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
  "fuel_type",
  "engine",
  "chassis",
  "chassis_brand",
  "transmission",
  "features",
] as const satisfies readonly (keyof LotSearchable)[];

function compactId(value: string | undefined): string {
  return (value || "").toLowerCase().replace(/^#/, "").trim();
}

const PRINTED_SKIP = /^(photo|image|images|url|source_page|floorplan_image|price)/;

type SearchInput = LotSearchable & { printed?: Record<string, string> };

/** Named fields plus printed scrape text and raw feature lines. */
function expandSearchable(unit: SearchInput): LotSearchable {
  const printed = unit.printed || {};
  const pick = (...keys: string[]): string => {
    for (const key of keys) {
      const direct = unit[key as keyof LotSearchable];
      if (typeof direct === "string" && direct.trim()) return direct.trim();
      const fromPrinted = printed[key];
      if (fromPrinted && fromPrinted.trim()) return fromPrinted.trim();
    }
    return "";
  };
  const printedBlob = Object.entries(printed)
    .filter(([key]) => !PRINTED_SKIP.test(key))
    .map(([, value]) => value)
    .join(" ");
  return {
    ...unit,
    fuel_type: pick("fuel_type", "fuel"),
    engine: pick("engine"),
    chassis: pick("chassis", "chassis_brand"),
    chassis_brand: pick("chassis_brand", "chassis"),
    transmission: pick("transmission"),
    features: [unit.features || "", printedBlob].filter(Boolean).join(" "),
  };
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

/** One substitution, insertion, deletion, or adjacent swap. Equals is not close. */
export function editDistanceAtMost1(a: string, b: string): boolean {
  if (a === b) return false;
  const delta = a.length - b.length;
  if (Math.abs(delta) > 1) return false;
  if (a.length === b.length) {
    let diffs = 0;
    let first = -1;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        diffs += 1;
        if (first < 0) first = i;
      }
    }
    if (diffs === 1) return true;
    return (
      diffs === 2 &&
      first >= 0 &&
      first + 1 < a.length &&
      a[first] === b[first + 1] &&
      a[first + 1] === b[first] &&
      a.slice(first + 2) === b.slice(first + 2)
    );
  }
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skips = 0;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
    } else {
      skips++;
      j++;
      if (skips > 1) return false;
    }
  }
  return true;
}

function tokenMatchesFloorplanFields(unit: LotSearchable, token: string): boolean {
  if (floorplanTokensAlign(token, unit.trim || "")) return true;
  const blob = `${unit.model || ""} ${unit.trim || ""}`.trim();
  if (blob && floorplanTokensAlign(token, blob.replace(/\s+/g, ""))) return true;
  return lotUnitFloorplanText(unit).includes(token);
}

export type LotTokenKind = "exact" | "close" | "none";

/**
 * Type-ahead token. After singularize: a prefix of any word in make, model,
 * trim, stock, year, title, body, fuel, engine, chassis, transmission, or
 * features, or a substring when the token is long enough ("Linea" in Lineage,
 * "31Z" in 31ZW / 31ZW5). A floorplan token matches the floorplan fields only,
 * so 27A does not hitch stock UCO9527A. One-edit words are "close", not exact.
 */
export function lotTokenMatchKind(unit: SearchInput, token: string): LotTokenKind {
  const view = expandSearchable(unit);
  const t = singularizeLotToken(token);
  if (!t) return "exact";
  const stock = compactId(view.stock_number);
  const vin = compactId(view.vin);
  if (stock === t || vin === t) return "exact";
  if (isFloorplanLikeToken(t)) {
    return tokenMatchesFloorplanFields(view, t) ? "exact" : "none";
  }
  if (stock.startsWith(t)) return "exact";
  if (typeaheadWords(view).some((word) => word.startsWith(t) || singularizeLotToken(word) === t)) {
    return "exact";
  }
  if ((t.length >= 4 || /\d/.test(t)) && typeaheadBlob(view).includes(t)) return "exact";
  if (t.length < 4 || /\d/.test(t)) return "none";
  for (const word of typeaheadWords(view)) {
    const singular = singularizeLotToken(word);
    if (singular.length < 4) continue;
    if (editDistanceAtMost1(t, singular)) return "close";
  }
  return "none";
}

export function lotTokenMatchesUnit(unit: SearchInput, token: string): boolean {
  return lotTokenMatchKind(unit, token) === "exact";
}

/**
 * Fuel from `fuel_type`. Engine text is used only when that field is blank
 * ("Diesel Pusher"). A generator note that says diesel does not count.
 */
export function lotUnitFuel(unit: SearchInput): "" | "diesel" | "gas" {
  const view = expandSearchable(unit);
  const typed = (view.fuel_type || "").toLowerCase();
  const engine = (view.engine || "").toLowerCase();
  if (/\bdiesel\b/.test(typed)) return "diesel";
  if (/\bgas/.test(typed)) return "gas";
  if (typed.trim()) return "";
  if (/\bdiesel\b/.test(engine)) return "diesel";
  if (/\bgas/.test(engine)) return "gas";
  return "";
}

/** True when a scanned word is exactly `word` after singularize. */
export function lotUnitHasWord(unit: SearchInput, word: string): boolean {
  const ask = singularizeLotToken(word);
  if (!ask) return false;
  return typeaheadWords(expandSearchable(unit)).some((part) => singularizeLotToken(part) === ask);
}

/** The field word a close token almost spells, if the lot has one. */
export function lotCloseWord(units: SearchInput[], token: string): string {
  const ask = singularizeLotToken(token);
  const counts = new Map<string, number>();
  for (const unit of units) {
    const seen = new Set<string>();
    for (const word of typeaheadWords(expandSearchable(unit))) {
      const singular = singularizeLotToken(word);
      if (singular.length < 4 || seen.has(singular)) continue;
      if (!editDistanceAtMost1(ask, singular)) continue;
      seen.add(singular);
      counts.set(singular, (counts.get(singular) || 0) + 1);
    }
  }
  let best = "";
  let n = 0;
  for (const [word, count] of counts) {
    if (count > n) {
      best = word;
      n = count;
    }
  }
  return best;
}

/** Empty search returns the full lot. Tokens are AND-matched. A token with no exact hit may match one edit. */
export function searchLotUnits<T extends SearchInput>(units: T[], query: string): T[] {
  const tokens = tokenizeLotQuery(query);
  if (!tokens.length) return units;
  const modes = tokens.map((token) => {
    let close = false;
    for (const unit of units) {
      const kind = lotTokenMatchKind(unit, token);
      if (kind === "exact") return "exact" as const;
      if (kind === "close") close = true;
    }
    return close ? ("close" as const) : ("none" as const);
  });
  const closeWords = tokens.map((token, index) =>
    modes[index] === "close" ? lotCloseWord(units, token) : "",
  );
  return units.filter((unit) =>
    tokens.every((token, index) => {
      const mode = modes[index];
      if (mode === "exact") return lotTokenMatchKind(unit, token) === "exact";
      if (mode === "close") {
        const word = closeWords[index] || "";
        if (word === "diesel") return lotUnitFuel(unit) === "diesel";
        if (word === "gas" || word === "gasoline") return lotUnitFuel(unit) === "gas";
        return lotUnitHasWord(unit, word);
      }
      return false;
    }),
  );
}

/** Raw attribute, flag, and floorplan feature lines. Not prices or photo URLs. */
export function lotFeatureText(row: Record<string, unknown>): string {
  const raw = row.raw;
  if (!raw || typeof raw !== "object") return "";
  const parts: string[] = [];
  const push = (value: unknown) => {
    if (typeof value === "string") {
      const text = value.trim();
      if (text && !/^https?:/i.test(text)) parts.push(text);
      return;
    }
    if (Array.isArray(value)) {
      for (const item of value) push(item);
      return;
    }
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        if (key === "url" || key === "photo") continue;
        if (key !== "attributes") parts.push(key.replace(/_/g, " "));
        push(child);
      }
    }
  };
  const bag = raw as Record<string, unknown>;
  for (const key of [
    "flags",
    "floorplan_feature",
    "floorplan_lifestyle",
    "floorplan_style",
    "exterior_colors",
    "custom_fields",
    "attributes",
  ]) {
    push(bag[key]);
  }
  return parts.join(" ");
}
