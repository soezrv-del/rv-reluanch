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
  /** Printed scrape, including raw.attributes flattened by the loader. */
  printed?: Record<string, string>;
  length_ft?: number | null;
  lengthFt?: number | null;
  price?: number | null;
  year_num?: number | null;
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
  s = s.replace(/(\d)\.(?=\d)/g, "$1\u0000");
  s = s.replace(/[?!.,;:()]+/g, " ");
  s = s.replace(/\u0000/g, ".");
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

function compactId(value: string | undefined): string {
  return (value || "").toLowerCase().replace(/^#/, "").trim();
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
  if (BED_WORDS.has(t)) return cacheLotSearchIndex(unit).bedSet.has(t === "bunks" ? "bunk" : t);
  if (stock.startsWith(t) && !isEngineCode(t)) return true;
  return tokenTier(cacheLotSearchIndex(unit), t) > 0;
}

/** Empty search returns the full lot. A query AND-matches, then ranks. */
export function searchLotUnits<T extends LotSearchable>(
  units: T[],
  query: string,
): T[] {
  const tokens = tokenizeLotQuery(query);
  if (!tokens.length) return units;
  return searchLotHits(units, query)
    .filter((hit) => hit.full)
    .map((hit) => hit.unit);
}

/**
 * Full-text lot search. The haystack is built once per unit object and
 * reused. Horsepower and displacement use the same sheet parser as query_lot.
 *
 * A unit that matches every term outranks a partial. Identity (make, model,
 * title) outranks attributes, which outrank notes. Equal scores keep
 * snapshot order, which is the same tie the lot query uses when no sort is set.
 */

export type LotSearchTier = "identity" | "attributes" | "notes";

export type LotSnippet = {
  field: string;
  text: string;
  tier: LotSearchTier;
};

export type LotTextHit<T> = {
  unit: T;
  score: number;
  /** Every leftover term hit. Spec filters (hp, liters, length, fuel) are required either way. */
  full: boolean;
  snippets: LotSnippet[];
};

export type ParsedLotText = {
  tokens: string[];
  horsepower?: number;
  displacement?: string;
  fuel: "" | "diesel" | "gas";
  lengthMin?: number;
  lengthMax?: number;
};

const BED_WORDS = new Set(["king", "queen", "bunk", "bunks"]);

const IDENTITY_KEYS = new Set([
  "year",
  "make",
  "model",
  "trim",
  "title",
  "series",
  "body_type",
  "location",
  "condition",
  "lot_status",
  "dealer",
]);

const NOTES_KEY_RE =
  /description|notes|comment|lifestyle|floorplan_style|^flags$|collections/;

const BED_KEY_RE = /bed|bunk|floorplan_feature/;

const SKIP_PRINT_RE =
  /^(?:url|photo|image|images|floorplan_image|source_page|location_phone|id|scraped_at|received_date|paint_swatch|vin|stock_number)$/;

type LotSearchIndex = {
  identity: string;
  attributes: string;
  notes: string;
  bed: string;
  identityWords: string[];
  attributeWords: string[];
  identitySet: Set<string>;
  attributeSet: Set<string>;
  noteSet: Set<string>;
  bedSet: Set<string>;
  horsepower: number | null;
  displacement: string;
  fields: { field: string; text: string; tier: LotSearchTier }[];
};

const INDEXES = new WeakMap<object, LotSearchIndex>();
const SNIPPETS = new WeakMap<object, LotSnippet[]>();

export function lotSearchSnippets(unit: object): LotSnippet[] {
  return SNIPPETS.get(unit) || [];
}

/** Build (or reuse) the haystack. Call at snapshot load so queries do not rebuild it. */
export function cacheLotSearchIndex(unit: LotSearchable): LotSearchIndex {
  const cached = INDEXES.get(unit);
  if (cached) return cached;
  const built = buildLotSearchIndex(unit);
  INDEXES.set(unit, built);
  return built;
}

export function indexLotUnits(units: object[]): void {
  for (const unit of units) {
    if (unit && typeof unit === "object") cacheLotSearchIndex(unit as LotSearchable);
  }
}

function wordsOf(text: string): string[] {
  return text.split(/[^a-z0-9.]+/).filter(Boolean);
}

function pushField(
  fields: LotSearchIndex["fields"],
  buckets: Record<LotSearchTier, string[]>,
  bed: string[],
  field: string,
  value: string,
  tier: LotSearchTier,
) {
  const text = value.trim();
  if (!text) return;
  const line = `${field.replace(/_/g, " ")} ${text}`.toLowerCase();
  buckets[tier].push(line);
  fields.push({ field, text, tier });
  if (BED_KEY_RE.test(field) || BED_WORDS.has(field)) bed.push(line);
}

function buildLotSearchIndex(unit: LotSearchable): LotSearchIndex {
  const buckets: Record<LotSearchTier, string[]> = {
    identity: [],
    attributes: [],
    notes: [],
  };
  const bed: string[] = [];
  const fields: LotSearchIndex["fields"] = [];
  const printed = unit.printed || {};
  const seen = new Set<string>();
  const add = (field: string, value: string | undefined, tier: LotSearchTier) => {
    const key = field.toLowerCase();
    if (!value || seen.has(key)) return;
    if (/number_of_.*bed/.test(key)) {
      const count = Number(String(value).replace(/[^0-9.]/g, ""));
      if (!(count > 0)) return;
    }
    seen.add(key);
    pushField(fields, buckets, bed, key, value, tier);
  };
  add("year", unit.year, "identity");
  add("make", unit.make, "identity");
  add("model", unit.model, "identity");
  add("trim", unit.trim, "identity");
  add("title", unit.title, "identity");
  add("body_type", unit.body_type, "identity");
  add("location", unit.location, "identity");
  add("condition", unit.condition, "identity");
  add("lot_status", unit.lot_status, "identity");
  add("dealer", unit.dealer, "identity");
  add("stock_number", unit.stock_number, "identity");
  add("vin", unit.vin, "identity");
  add("fuel_type", unit.fuel_type, "attributes");
  add("engine", unit.engine, "attributes");
  add("chassis", unit.chassis || unit.chassis_brand, "attributes");
  add("transmission", unit.transmission, "attributes");
  add("features", unit.features, "attributes");
  for (const [key, value] of Object.entries(printed)) {
    if (!value || SKIP_PRINT_RE.test(key)) continue;
    const tier: LotSearchTier = IDENTITY_KEYS.has(key)
      ? "identity"
      : NOTES_KEY_RE.test(key)
        ? "notes"
        : "attributes";
    add(key, value, tier);
  }
  const identity = buckets.identity.join(" \n ");
  const attributes = buckets.attributes.join(" \n ");
  const notes = buckets.notes.join(" \n ");
  const identityWords = wordsOf(identity);
  const attributeWords = wordsOf(attributes);
  const noteWords = wordsOf(notes);
  const bedWords = wordsOf(bed.join(" \n "));
  const hpRaw = printed.horsepower || "";
  return {
    identity,
    attributes,
    notes,
    bed: bed.join(" \n "),
    identityWords,
    attributeWords,
    identitySet: new Set(identityWords),
    attributeSet: new Set(attributeWords),
    noteSet: new Set(noteWords),
    bedSet: new Set(bedWords),
    horsepower: parseSheetHorsepower(hpRaw),
    displacement: `${printed.displacement || ""} ${printed.engine || ""} ${printed.engine_type || ""} ${unit.engine || ""}`.toLowerCase(),
    fields,
  };
}

/** Same sheet rule query_lot already uses. "400", "400 HP", and a single labeled figure. */
export function parseSheetHorsepower(raw: string): number | null {
  const text = (raw || "").trim();
  if (!text) return null;
  const plain = Number(text.replace(/,/g, ""));
  if (Number.isFinite(plain) && plain >= 100 && plain <= 800) return Math.round(plain);
  const labeled = [...text.matchAll(/\b(\d{2,4})\s*hp\b/gi)]
    .map((hit) => Number(hit[1]))
    .filter((n) => n >= 100 && n <= 800);
  const unique = [...new Set(labeled)];
  return unique.length === 1 ? unique[0]! : null;
}

export function displacementHits(blob: string, displacement: string): boolean {
  return new RegExp(`(?<!\\d)${displacement.replace(".", "\\.")}(?!\\d)`).test(blob);
}

function takeHp(raw: string): number | undefined {
  const n = Number(raw);
  return n >= 100 && n <= 800 ? n : undefined;
}

/**
 * Pull horsepower and displacement out of already-normalized tokens.
 * "300 hp", "300hp", and "300 horsepower" are the same figure.
 * "8.9", "8.9l", and "8.9 liter" are the same displacement.
 */
export function consumeSheetSpec(tokens: string[]): {
  tokens: string[];
  horsepower?: number;
  displacement?: string;
} {
  const kept: string[] = [];
  let horsepower: number | undefined;
  let displacement: string | undefined;
  const hpWord = (token: string) => token === "horsepower" || token === "hp";
  const literWord = (token: string) => /^(?:liters?|litres?|l)$/.test(token);
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    const next = tokens[i + 1] || "";
    const gluedHp = token.match(/^(\d{2,4})hp$/);
    if (gluedHp) {
      const n = takeHp(gluedHp[1]!);
      if (n != null) horsepower = n;
      i += 1;
      continue;
    }
    const decimal = token.match(/^(\d{1,2}\.\d)l?$/);
    if (decimal) {
      displacement = decimal[1];
      i += 1;
      if (literWord(next)) i += 1;
      continue;
    }
    const leading = token.match(/^(\d{2,4})$/);
    if (leading && hpWord(next)) {
      const n = takeHp(leading[1]!);
      if (n != null) horsepower = n;
      i += 2;
      continue;
    }
    if (hpWord(token)) {
      const following = next.match(/^(\d{2,4})$/);
      if (following) {
        const n = takeHp(following[1]!);
        if (n != null) horsepower = n;
        i += 2;
        continue;
      }
      const previous = kept[kept.length - 1];
      if (previous && /^\d{2,4}$/.test(previous)) {
        const n = takeHp(previous);
        if (n != null) {
          horsepower = n;
          kept.pop();
        }
      }
      i += 1;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, horsepower, displacement };
}

/** "40 ft" / "40 foot" → [N-2, N+2]. Shared by the page and query_lot. */
export function spokenLengthBand(phrase: string): { min?: number; max?: number } {
  const match = (phrase || "").toLowerCase().match(/\b(\d{2})\s*(?:ft|foot|feet|footer|footers)\b/);
  if (!match) return {};
  const n = Number(match[1]);
  if (n < 18 || n > 50) return {};
  return { min: n - 2, max: n + 2 };
}

export function parseLotTextQuery(query: string): ParsedLotText {
  const band = spokenLengthBand(query);
  let fuel: "" | "diesel" | "gas" = "";
  const spec = consumeSheetSpec(tokenizeLotQuery(query));
  const tokens: string[] = [];
  for (let i = 0; i < spec.tokens.length; ) {
    const token = spec.tokens[i] || "";
    const next = spec.tokens[i + 1] || "";
    if (/^\d{2}$/.test(token) && /^(?:ft|foot|feet|footer|footers)$/.test(next)) {
      i += 2;
      continue;
    }
    if (/^(?:ft|foot|feet|footer|footers)$/.test(token)) {
      i += 1;
      continue;
    }
    if (/^\d{2}(?:ft|foot|feet|footer|footers)$/.test(token)) {
      i += 1;
      continue;
    }
    if (token === "diesel" || token === "gas" || token === "gasoline") {
      fuel = token === "diesel" ? "diesel" : "gas";
      i += 1;
      continue;
    }
    if (BED_WORDS.has(token) && next === "bed") {
      tokens.push(token);
      i += 2;
      continue;
    }
    tokens.push(token);
    i += 1;
  }
  return {
    tokens,
    horsepower: spec.horsepower,
    displacement: spec.displacement,
    fuel,
    lengthMin: band.min,
    lengthMax: band.max,
  };
}

export function withoutCompanionBed(tokens: string[]): string[] {
  if (!tokens.some((token) => BED_WORDS.has(token))) return tokens;
  return tokens.filter((token) => token !== "bed");
}

function isEngineCode(token: string): boolean {
  return /^[a-z]{1,4}\d[a-z0-9]{0,3}$/.test(token) || /^\d\.\d$/.test(token);
}

function wordHit(set: Set<string>, words: string[], token: string): boolean {
  if (set.has(token)) return true;
  if (token.length < 3 || isEngineCode(token)) return false;
  return words.some((word) => word.startsWith(token));
}

function tokenTier(index: LotSearchIndex, token: string): number {
  if (BED_WORDS.has(token)) {
    const needle = token === "bunks" ? "bunk" : token;
    return index.bedSet.has(needle) ? 2 : 0;
  }
  if (wordHit(index.identitySet, index.identityWords, token)) return 3;
  if (wordHit(index.attributeSet, index.attributeWords, token)) return 2;
  if (index.noteSet.has(token)) return 1;
  return 0;
}

function snippetFor(index: LotSearchIndex, token: string): LotSnippet | null {
  const needle = token === "bunks" ? "bunk" : token;
  const ranked = [...index.fields].sort((a, b) => tierRank(b.tier) - tierRank(a.tier));
  for (const field of ranked) {
    if (BED_WORDS.has(token) && !BED_KEY_RE.test(field.field)) continue;
    const hay = `${field.field.replace(/_/g, " ")} ${field.text}`.toLowerCase();
    const words = wordsOf(hay);
    if (words.includes(needle) || (needle.length >= 3 && words.some((word) => word.startsWith(needle)))) {
      return { field: field.field, text: field.text, tier: field.tier };
    }
  }
  return null;
}

function tierRank(tier: LotSearchTier): number {
  if (tier === "identity") return 3;
  if (tier === "attributes") return 2;
  return 1;
}

function unitFeet(unit: LotSearchable): number | null {
  if (typeof unit.length_ft === "number" && unit.length_ft > 0) return unit.length_ft;
  if (typeof unit.lengthFt === "number" && unit.lengthFt > 0) return unit.lengthFt;
  const printed = unit.printed?.vehicle_body_length || unit.printed?.length || "";
  const match = printed.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
}

function fuelOk(unit: LotSearchable, fuel: "" | "diesel" | "gas"): boolean {
  if (!fuel) return true;
  const blob = [
    unit.body_type,
    unit.fuel_type,
    unit.engine,
    unit.printed?.fuel_type,
    unit.printed?.fuel,
    unit.printed?.engine,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (fuel === "diesel") return /\bdiesel\b/.test(blob);
  return /\bgas/.test(blob) && !/\bdiesel\b/.test(blob);
}

export function searchLotHits<T extends LotSearchable>(
  units: T[],
  query: string,
): LotTextHit<T>[] {
  const parsed = parseLotTextQuery(query);
  const specced =
    parsed.horsepower != null ||
    Boolean(parsed.displacement) ||
    Boolean(parsed.fuel) ||
    parsed.lengthMin != null;
  if (!parsed.tokens.length && !specced) {
    return units.map((unit) => ({ unit, score: 0, full: true, snippets: [] }));
  }
  const hits: LotTextHit<T>[] = [];
  for (const unit of units) {
    const index = cacheLotSearchIndex(unit);
    if (parsed.horsepower != null && index.horsepower !== parsed.horsepower) continue;
    if (parsed.displacement && !displacementHits(index.displacement, parsed.displacement)) continue;
    if (!fuelOk(unit, parsed.fuel)) continue;
    if (parsed.lengthMin != null || parsed.lengthMax != null) {
      const feet = unitFeet(unit);
      if (feet == null) continue;
      if (parsed.lengthMin != null && feet < parsed.lengthMin) continue;
      if (parsed.lengthMax != null && feet > parsed.lengthMax) continue;
    }
    let matched = 0;
    let score = 0;
    const snippets: LotSnippet[] = [];
    if (parsed.horsepower != null) {
      snippets.push({
        field: "horsepower",
        text: `${parsed.horsepower} HP`,
        tier: "attributes",
      });
      score += 2;
    }
    if (parsed.displacement) {
      snippets.push({
        field: "displacement",
        text: `${parsed.displacement} L`,
        tier: "attributes",
      });
      score += 2;
    }
    for (const token of parsed.tokens) {
      const tier = tokenTier(index, token);
      if (!tier) continue;
      matched += 1;
      score += tier;
      const snippet = snippetFor(index, token);
      if (snippet) snippets.push(snippet);
    }
    if (parsed.tokens.length && matched === 0) continue;
    const full = matched === parsed.tokens.length;
    if (full) score += 1000;
    else score += matched;
    hits.push({ unit, score, full, snippets });
  }
  hits.sort((a, b) => {
    if (a.full !== b.full) return a.full ? -1 : 1;
    return b.score - a.score;
  });
  for (const hit of hits) SNIPPETS.set(hit.unit, hit.snippets);
  return hits;
}

