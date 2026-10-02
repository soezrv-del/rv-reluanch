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
  /** Printed odometer when the loader lifted it off the sheet. */
  miles?: number | null;
  mileage?: number | string | null;
  /** 0 is a real slide count. Null means the sheet left it blank. */
  slides?: number | null;
  generator?: string;
  /** Server-only listing dump. The Lot page never sets this. */
  fulltext?: string;
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
  // "5s" is the series digit, not a floorplan.
  if (/^\d{1,2}s$/.test(t)) return t.slice(0, -1);
  if (isFloorplanLikeToken(t) || /\d/.test(t)) return t;
  if (/^[abc]s$/.test(t)) return t[0] || t;
  // "series" is already singular. Stripping the s made "5 series" a
  // different coach (Terry, Wolf) instead of the series on the name.
  if (t === "series") return t;
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
  // "$50,000" and "50,000" are one number. Collapse them before a comma
  // becomes a space and "000 that" is glued into a fake floorplan.
  s = s.replace(
    /\$\s*(\d{1,3}(?:,\d{3})+|\d{4,7})\b/g,
    (_, n: string) => String(n).replace(/,/g, ""),
  );
  s = s.replace(/\b(\d{1,3}(?:,\d{3})+)\b/g, (_, n: string) =>
    String(n).replace(/,/g, ""),
  );
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
  // "Isata 5" / "Asada 5". A 1–2 digit token is a series on the name,
  // not a stock or VIN prefix (those match half the book).
  if (/^\d{1,2}$/.test(t)) return seriesDigitMatchesUnit(unit, t);
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

/** Series digit glued to a coach name. Make, model, trim, and title only. */
export function seriesDigitMatchesUnit(unit: LotSearchable, token: string): boolean {
  if (!/^\d{1,2}$/.test(token)) return false;
  const words = [unit.make, unit.model, unit.trim, unit.title]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9]+/);
  return words.includes(token);
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
  bed?: "king" | "queen" | "bunk" | "full";
  lengthMin?: number;
  lengthMax?: number;
  milesMin?: number;
  milesMax?: number;
  slidesMin?: number;
  slidesMax?: number;
  generator?: boolean;
  generatorFuel?: "" | "gas" | "diesel" | "propane";
  engine?: string;
  features?: string[];
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

const BED_COUNT_KEYS: Record<string, "king" | "queen" | "bunk" | "full"> = {
  number_of_king_size_beds: "king",
  number_of_queen_size_beds: "queen",
  number_of_bunk_beds: "bunk",
  number_of_full_size_beds: "full",
};

const BED_FIELD: Record<string, string> = {
  king: "number_of_king_size_beds",
  queen: "number_of_queen_size_beds",
  bunk: "number_of_bunk_beds",
  full: "number_of_full_size_beds",
};

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
  bedCounts: Record<string, number>;
  horsepower: number | null;
  displacement: string;
  fields: { field: string; text: string; tier: LotSearchTier }[];
  fulltextWords: string[];
  fulltextSet: Set<string>;
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
  return text
    .replace(/,/g, "")
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter(Boolean);
}

function pushField(
  fields: LotSearchIndex["fields"],
  buckets: Record<LotSearchTier, string[]>,
  field: string,
  value: string,
  tier: LotSearchTier,
) {
  const text = value.trim();
  if (!text) return;
  buckets[tier].push(text.toLowerCase());
  fields.push({ field, text, tier });
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
  const bedCounts: Record<string, number> = {};
  const add = (field: string, value: string | undefined, tier: LotSearchTier) => {
    const key = field.toLowerCase();
    if (!value || seen.has(key)) return;
    seen.add(key);
    const bedKind = BED_COUNT_KEYS[key];
    if (bedKind) {
      const count = Number(String(value).replace(/[^0-9.]/g, ""));
      if (count > 0) {
        bedCounts[bedKind] = count;
        bed.push(bedKind);
      }
      return;
    }
    pushField(fields, buckets, key, value, tier);
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
  const fulltextWords = wordsOfListing(unit.fulltext);
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
    bedSet: new Set(bed),
    bedCounts,
    horsepower: parseSheetHorsepower(printed.horsepower || unit.engine || ""),
    displacement: `${printed.displacement || ""} ${printed.engine || ""} ${printed.engine_type || ""} ${unit.engine || ""}`.toLowerCase(),
    fields,
    fulltextWords,
    fulltextSet: new Set(fulltextWords),
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

const LENGTH_UNIT = String.raw`(?:-?\s*)?(?:ft|foot|feet|footer|footers)`;

/**
 * "around 40 ft" is 38–42. "40 foot and under" and "under 40 foot" are a
 * ceiling at 40, not that band. "over 40 foot" is a floor. Shared by the
 * Lot page and query_lot.
 */
export function spokenLengthBand(phrase: string): { min?: number; max?: number } {
  const t = (phrase || "").toLowerCase();
  const take = (raw: string | undefined): number | undefined => {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 18 || n > 50) return undefined;
    return n;
  };
  const ceiling =
    t.match(
      new RegExp(
        String.raw`\b(?:under|below|less than|no more than|at most|up to)\s+(\d{2})\s*${LENGTH_UNIT}\b`,
      ),
    ) ||
    t.match(
      new RegExp(
        String.raw`\b(\d{2})\s*${LENGTH_UNIT}\s+(?:and|or)\s+(?:under|less|shorter|below)\b`,
      ),
    );
  if (ceiling) {
    const n = take(ceiling[1]);
    if (n != null) return { max: n };
  }
  const floor =
    t.match(
      new RegExp(
        String.raw`\b(?:over|above|more than|at least|no less than)\s+(\d{2})\s*${LENGTH_UNIT}\b`,
      ),
    ) ||
    t.match(
      new RegExp(
        String.raw`\b(\d{2})\s*${LENGTH_UNIT}\s+(?:and|or)\s+(?:over|longer|above|more)\b`,
      ),
    );
  if (floor) {
    const n = take(floor[1]);
    if (n != null) return { min: n };
  }
  const match = t.match(new RegExp(String.raw`\b(\d{2})\s*${LENGTH_UNIT}\b`));
  if (!match) return {};
  const n = take(match[1]);
  if (n == null) return {};
  return { min: n - 2, max: n + 2 };
}

const LIST_EXPANSION_WORDS = new Set([
  "yeah",
  "yes",
  "yep",
  "yup",
  "ok",
  "okay",
  "please",
  "give",
  "me",
  "show",
  "read",
  "name",
  "tell",
  "see",
  "the",
  "a",
  "an",
  "of",
  "them",
  "those",
  "these",
  "full",
  "whole",
  "entire",
  "complete",
  "rest",
  "list",
  "all",
  "more",
  "every",
  "one",
  "ones",
  "everyone",
  "just",
  "can",
  "you",
  "i",
  "want",
  "wanna",
]);

/**
 * "Give me the full list" asks for the units already matched.
 * It is not a search for the Full House.
 */
export function isLotListExpansion(text: string): boolean {
  const tokens = normalizeLotSearchQuery(text).split(/\s+/).filter(Boolean);
  if (tokens.length < 2 || tokens.length > 24) return false;
  if (!tokens.every((token) => LIST_EXPANSION_WORDS.has(token))) return false;
  return (
    tokens.includes("list") ||
    tokens.includes("rest") ||
    (tokens.includes("all") && (tokens.includes("them") || tokens.includes("ones"))) ||
    (tokens.includes("name") && tokens.includes("more")) ||
    (tokens.includes("read") && tokens.includes("them"))
  );
}

const MILE_WORDS = new Set(["mile", "miles", "mi"]);

function readMileCount(
  tokens: string[],
  start: number,
): { value: number; end: number } | null {
  const token = tokens[start] || "";
  const word: Record<string, number> = {
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
  };
  if (word[token] && tokens[start + 1] === "thousand") {
    return { value: word[token]! * 1000, end: start + 2 };
  }
  const k = token.match(/^(\d+(?:\.\d+)?)k$/);
  if (k) return { value: Math.round(Number(k[1]) * 1000), end: start + 1 };
  if (/^\d{1,3}$/.test(token) && tokens[start + 1] === "000") {
    return { value: Number(token) * 1000, end: start + 2 };
  }
  if (/^\d{4,7}$/.test(token)) return { value: Number(token), end: start + 1 };
  return null;
}

/**
 * "around 50,000 miles" is an odometer band (±15%), not a price.
 * A dollar amount with no mile / miles / mi is left for the price parser.
 */
export function consumeMiles(tokens: string[]): {
  tokens: string[];
  min?: number;
  max?: number;
} {
  const kept: string[] = [];
  let min: number | undefined;
  let max: number | undefined;
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    if (token === "between") {
      const left = readMileCount(tokens, i + 1);
      if (left && tokens[left.end] === "and") {
        const right = readMileCount(tokens, left.end + 1);
        if (right && MILE_WORDS.has(tokens[right.end] || "")) {
          min = Math.min(left.value, right.value);
          max = Math.max(left.value, right.value);
          i = right.end + 1;
          continue;
        }
      }
    }
    const around = token === "around" || token === "about" || token === "roughly";
    const under = token === "under" || token === "below" || token === "less";
    const over = token === "over" || token === "above" || token === "more";
    let start = i;
    let mode: "around" | "under" | "over" | "exact" = "exact";
    if (around || under || over) {
      mode = around ? "around" : under ? "under" : "over";
      start = i + 1;
      if ((token === "less" || token === "more") && tokens[start] === "than") start += 1;
    }
    const count = readMileCount(tokens, start);
    const after = count ? tokens[count.end] || "" : "";
    if (count && MILE_WORDS.has(after) && count.value >= 1000) {
      if (mode === "under") max = count.value;
      else if (mode === "over") min = count.value;
      else {
        const span = Math.round(count.value * 0.15);
        min = Math.max(0, count.value - span);
        max = count.value + span;
      }
      i = count.end + 1;
      continue;
    }
    if (MILE_WORDS.has(token) || token === "mileage") {
      i += 1;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, min, max };
}

const SLIDE_COUNT: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
};

function slideSpan(tokens: string[], index: number): number {
  const token = tokens[index] || "";
  if (token === "slideout") return 1;
  if (token === "slide" && tokens[index + 1] === "out") return 2;
  if (token === "slide") return 1;
  return 0;
}

function readSlideCount(
  tokens: string[],
  start: number,
): { value: number; end: number } | null {
  const token = tokens[start] || "";
  if (SLIDE_COUNT[token] != null) return { value: SLIDE_COUNT[token]!, end: start + 1 };
  if (/^\d{1,2}$/.test(token)) return { value: Number(token), end: start + 1 };
  return null;
}

export function consumeSlides(tokens: string[]): {
  tokens: string[];
  slidesMin?: number;
  slidesMax?: number;
} {
  const kept: string[] = [];
  let slidesMin: number | undefined;
  let slidesMax: number | undefined;
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    if (token === "at" && tokens[i + 1] === "least") {
      const count = readSlideCount(tokens, i + 2);
      const span = count ? slideSpan(tokens, count.end) : 0;
      if (count && span) {
        slidesMin = count.value;
        slidesMax = undefined;
        i = count.end + span;
        continue;
      }
    }
    if (token === "no" || token === "zero" || token === "without") {
      const span = slideSpan(tokens, i + 1);
      if (span) {
        slidesMin = 0;
        slidesMax = 0;
        i += 1 + span;
        continue;
      }
    }
    if (token === "with" || token === "has" || token === "have") {
      const span = slideSpan(tokens, i + 1);
      if (span) {
        slidesMin = Math.max(slidesMin ?? 1, 1);
        i += 1 + span;
        continue;
      }
    }
    const count = readSlideCount(tokens, i);
    const span = count ? slideSpan(tokens, count.end) : 0;
    if (count && span && count.value <= 12) {
      const after = count.end + span;
      if (tokens[after] === "or" && tokens[after + 1] === "more") {
        slidesMin = count.value;
        slidesMax = undefined;
        i = after + 2;
        continue;
      }
      slidesMin = count.value;
      slidesMax = count.value;
      i = after;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, slidesMin, slidesMax };
}

export function consumeGenerator(tokens: string[]): {
  tokens: string[];
  generator: boolean;
  generatorFuel: "" | "gas" | "diesel" | "propane";
} {
  const kept: string[] = [];
  let generator = false;
  let generatorFuel: "" | "gas" | "diesel" | "propane" = "";
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    const next = tokens[i + 1] || "";
    const fuel =
      token === "diesel" || token === "gas" || token === "gasoline" || token === "propane"
        ? token === "gasoline" || token === "gas"
          ? "gas"
          : token === "propane"
            ? "propane"
            : "diesel"
        : "";
    if (fuel && (next === "generator" || next === "genset")) {
      generator = true;
      generatorFuel = fuel;
      i += 2;
      continue;
    }
    if (token === "generator" || token === "genset") {
      generator = true;
      i += 1;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, generator, generatorFuel };
}

const FEATURE_PHRASES: { tokens: string[]; id: string }[] = [
  { tokens: ["outdoor", "kitchen"], id: "outdoor kitchen" },
  { tokens: ["washer", "dryer"], id: "washer" },
  { tokens: ["washer"], id: "washer" },
  { tokens: ["fireplace"], id: "fireplace" },
  { tokens: ["theater", "seating"], id: "theater" },
  { tokens: ["theater"], id: "theater" },
  { tokens: ["solar", "prep"], id: "solar" },
  { tokens: ["solar"], id: "solar" },
  { tokens: ["bunk", "house"], id: "bunkhouse" },
  { tokens: ["bunkhouse"], id: "bunkhouse" },
];

const ENGINE_PHRASES: { tokens: string[]; id: string }[] = [
  { tokens: ["power", "stroke"], id: "power stroke" },
  { tokens: ["powerstroke"], id: "powerstroke" },
  { tokens: ["eco", "boost"], id: "ecoboost" },
  { tokens: ["ecoboost"], id: "ecoboost" },
  { tokens: ["cummins"], id: "cummins" },
  { tokens: ["triton"], id: "triton" },
  { tokens: ["mercedes"], id: "mercedes" },
  { tokens: ["duramax"], id: "duramax" },
  { tokens: ["vortec"], id: "vortec" },
  { tokens: ["maxxforce"], id: "maxxforce" },
  { tokens: ["pentastar"], id: "pentastar" },
];

function takePhrase(tokens: string[], start: number, phrase: string[]): boolean {
  for (let i = 0; i < phrase.length; i++) {
    if (tokens[start + i] !== phrase[i]) return false;
  }
  return true;
}

export function consumePhrases(tokens: string[]): {
  tokens: string[];
  engine: string;
  features: string[];
} {
  const kept: string[] = [];
  let engine = "";
  const features: string[] = [];
  for (let i = 0; i < tokens.length; ) {
    const feature = FEATURE_PHRASES.find((phrase) => takePhrase(tokens, i, phrase.tokens));
    if (feature) {
      if (!features.includes(feature.id)) features.push(feature.id);
      i += feature.tokens.length;
      continue;
    }
    const motor = ENGINE_PHRASES.find((phrase) => takePhrase(tokens, i, phrase.tokens));
    if (motor) {
      engine = motor.id;
      i += motor.tokens.length;
      continue;
    }
    kept.push(tokens[i] || "");
    i += 1;
  }
  return { tokens: kept, engine, features };
}

function printedNumber(value: string | number | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

/** Printed odometer. Blank and 0 are missing. Never guessed. */
export function unitOdometerMiles(unit: LotSearchable): number | null {
  if (typeof unit.miles === "number" && unit.miles > 0) return Math.round(unit.miles);
  const direct = printedNumber(unit.mileage);
  if (direct != null && direct > 0) return direct;
  const printed = unit.printed || {};
  const fromSheet =
    printedNumber(printed.mileage) ??
    printedNumber(printed.odometer) ??
    printedNumber(printed.miles);
  return fromSheet != null && fromSheet > 0 ? fromSheet : null;
}

/** 0 is a real slide count. Null means the sheet did not say. */
export function unitSlideCount(unit: LotSearchable): number | null {
  if (typeof unit.slides === "number" && Number.isFinite(unit.slides) && unit.slides >= 0) {
    return Math.round(unit.slides);
  }
  const printed = unit.printed || {};
  const n =
    printedNumber(printed.number_of_slideouts) ??
    printedNumber(printed.slides) ??
    printedNumber(printed.slideouts);
  if (n == null || n < 0 || n > 12) return null;
  return n;
}

function unitGeneratorText(unit: LotSearchable): string {
  return [unit.generator, unit.printed?.generator, unit.printed?.generator_type]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function unitEngineText(unit: LotSearchable): string {
  return [unit.engine, unit.printed?.engine, unit.printed?.engine_type]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function unitFeatureText(unit: LotSearchable): string {
  return [
    unit.features,
    unit.printed?.floorplan_feature,
    unit.printed?.features,
    unit.printed?.flags,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function unitMatchesSalesman(
  unit: LotSearchable,
  filter: {
    milesMin?: number;
    milesMax?: number;
    slidesMin?: number;
    slidesMax?: number;
    generator?: boolean;
    generatorFuel?: "" | "gas" | "diesel" | "propane";
    engine?: string;
    features?: string[];
  },
): boolean {
  if (filter.milesMin != null || filter.milesMax != null) {
    const miles = unitOdometerMiles(unit);
    if (miles == null) return false;
    if (filter.milesMin != null && miles < filter.milesMin) return false;
    if (filter.milesMax != null && miles > filter.milesMax) return false;
  }
  if (filter.slidesMin != null || filter.slidesMax != null) {
    const slides = unitSlideCount(unit);
    if (slides == null) return false;
    if (filter.slidesMin != null && slides < filter.slidesMin) return false;
    if (filter.slidesMax != null && slides > filter.slidesMax) return false;
  }
  if (filter.generator) {
    const text = unitGeneratorText(unit);
    if (!text.trim()) return false;
    if (filter.generatorFuel && !text.includes(filter.generatorFuel)) return false;
  }
  if (filter.engine) {
    const needle = filter.engine === "powerstroke" ? "power stroke" : filter.engine;
    const text = unitEngineText(unit).replace(/powerstroke/g, "power stroke");
    if (!text.includes(needle)) return false;
  }
  for (const feature of filter.features || []) {
    if (!unitFeatureText(unit).includes(feature)) return false;
  }
  return true;
}

export function salesmanFilterActive(filter: {
  milesMin?: number;
  milesMax?: number;
  slidesMin?: number;
  slidesMax?: number;
  generator?: boolean;
  engine?: string;
  features?: string[];
}): boolean {
  return (
    filter.milesMin != null ||
    filter.milesMax != null ||
    filter.slidesMin != null ||
    filter.slidesMax != null ||
    Boolean(filter.generator) ||
    Boolean(filter.engine) ||
    Boolean(filter.features && filter.features.length)
  );
}

export function parseLotTextQuery(query: string): ParsedLotText {
  const band = spokenLengthBand(query);
  const milled = consumeMiles(tokenizeLotQuery(query));
  const slides = consumeSlides(milled.tokens);
  const generated = consumeGenerator(slides.tokens);
  const phrases = consumePhrases(generated.tokens);
  let fuel: "" | "diesel" | "gas" = "";
  let bed: ParsedLotText["bed"];
  const spec = consumeSheetSpec(phrases.tokens);
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
    if (token === "king" || token === "queen" || token === "bunk" || token === "bunks") {
      bed = token === "bunks" ? "bunk" : token;
      i += next === "bed" ? 2 : 1;
      continue;
    }
    if (token === "full" && next === "bed") {
      bed = "full";
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
    bed,
    lengthMin: band.min,
    lengthMax: band.max,
    milesMin: milled.min,
    milesMax: milled.max,
    slidesMin: slides.slidesMin,
    slidesMax: slides.slidesMax,
    generator: generated.generator,
    generatorFuel: generated.generatorFuel,
    engine: phrases.engine,
    features: phrases.features,
  };
}

export function consumeBedTokens(tokens: string[]): {
  tokens: string[];
  bed?: "king" | "queen" | "bunk" | "full";
} {
  const kept: string[] = [];
  let bed: "king" | "queen" | "bunk" | "full" | undefined;
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    const next = tokens[i + 1] || "";
    if (token === "full" && next === "bed") {
      bed = "full";
      i += 2;
      continue;
    }
    const named = bedAlias(token, next);
    if (named) {
      bed = named.bed;
      let skip = named.skip;
      if (tokens[i + skip] === "size") skip += 1;
      const after = tokens[i + skip] || "";
      if (after === "bed" || after === "beds") skip += 1;
      i += skip;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, bed };
}

function bedAlias(
  token: string,
  next: string,
): { bed: "king" | "queen" | "bunk"; skip: number } | null {
  if (token === "bh" || token === "bunkhouse") return { bed: "bunk", skip: 1 };
  if (token === "bunk" && next === "house") return { bed: "bunk", skip: 2 };
  if (token === "qb") return { bed: "queen", skip: 1 };
  if (
    token.length >= 5 &&
    !/\d/.test(token) &&
    !isFloorplanLikeToken(token) &&
    !isEngineCode(token) &&
    oneLetterOff(token, "bunkhouse")
  ) {
    return { bed: "bunk", skip: 1 };
  }
  if (token === "king" || token === "queen" || token === "bunk" || token === "bunks") {
    return { bed: token === "bunks" ? "bunk" : token, skip: 1 };
  }
  return null;
}

export function unitHasBed(unit: LotSearchable, bed: string): boolean {
  return (cacheLotSearchIndex(unit).bedCounts[bed] || 0) > 0;
}

const FINANCE_SENTENCE_RE =
  /\b(?:apr|financing|down payment|monthly payment|interest rate)\b/i;

/** Drop payment sentences. They are not a feature and she does not read them. */
export function listingSearchText(raw: string | undefined): string {
  if (!raw) return "";
  return raw
    .split(/[.!?\n]+/)
    .filter((sentence) => !FINANCE_SENTENCE_RE.test(sentence))
    .join(" ");
}

function wordsOfListing(raw: string | undefined): string[] {
  const cleaned = listingSearchText(raw).replace(
    /\b(?:no|without|not|zero)\s+(?:\w+\s+){0,3}(?:bunk\s*houses?|bunk\s*beds?|bunks?|king(?:\s|-)?(?:size\s+)?beds?|queen(?:\s|-)?(?:size\s+)?beds?|slides?)\b/gi,
    " ",
  );
  return wordsOf(cleaned);
}

/** One substitution, insertion, or deletion. Equal strings are not a typo. */
export function oneLetterOff(a: string, b: string): boolean {
  if (a === b) return false;
  const delta = a.length - b.length;
  if (Math.abs(delta) > 1) return false;
  if (a.length === b.length) {
    let diffs = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diffs += 1;
    return diffs === 1;
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

/** Cap the walk. A longer gap is not a close coach name. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 4) return 9;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    row[0] = i;
    const ca = a[i - 1];
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]!;
      const cost = ca === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j]! + 1, row[j - 1]! + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n]!;
}

/**
 * Consonant skeleton. Vowels drop, c/k and s/z fold, doubles collapse.
 * Ascenta → scnt, Isata → st. Not a list of nicknames.
 */
function consonantShape(s: string): string {
  return s
    .toLowerCase()
    .replace(/[aeiouy]/g, "")
    .replace(/k/g, "c")
    .replace(/z/g, "s")
    .replace(/(.)\1+/g, "$1");
}

const GENERIC_MODEL_WORDS = new Set([
  "series",
  "corp",
  "motor",
  "coach",
  "class",
  "diesel",
  "super",
  "wheel",
  "trailer",
  "fifth",
  "travel",
  "model",
  "type",
  "line",
  "plus",
  "sport",
  "available",
]);

/**
 * Closest make/model/trim word on these units.
 * A one- or two-edit miss is enough on its own (Asada → Isata, Linage → Lineage).
 * When the make already matched, a shared consonant shape still counts
 * (Ascenta → Isata). The word is the sheet's, not a hardcoded coach.
 */
export function bestCloseModelWord(
  token: string,
  units: readonly LotSearchable[],
  loose: boolean,
): { key: string; display: string; distance: number } | undefined {
  const spoken = singularizeLotToken(token);
  if (!/^[a-z]{4,}$/.test(spoken)) return undefined;
  const counts = new Map<string, { display: string; count: number }>();
  const take = (raw: string | undefined) => {
    for (const part of (raw || "").split(/[^A-Za-z0-9]+/)) {
      const key = singularizeLotToken(part);
      if (!/^[a-z]{4,}$/.test(key) || GENERIC_MODEL_WORDS.has(key) || key === spoken) continue;
      const hit = counts.get(key);
      if (hit) hit.count += 1;
      else counts.set(key, { display: part, count: 1 });
    }
  };
  for (const unit of units) {
    take(unit.make);
    take(unit.model);
    take(unit.trim);
  }
  const shapeA = consonantShape(spoken);
  let best: { key: string; display: string; count: number; d: number; sd: number } | undefined;
  for (const [key, info] of counts) {
    const d = editDistance(spoken, key);
    if (d === 0 || d > 4) continue;
    const shapeB = consonantShape(key);
    const sd = shapeA && shapeB ? editDistance(shapeA, shapeB) : 9;
    const lenDelta = Math.abs(spoken.length - key.length);
    const strict = d <= 2 && lenDelta <= 1;
    const phonetic =
      loose && d <= 4 && sd <= 2 && lenDelta <= 2 && Boolean(shapeA) && shapeA[0] === shapeB[0];
    if (!strict && !phonetic) continue;
    const row = { key, display: info.display, count: info.count, d, sd };
    if (
      !best ||
      row.d < best.d ||
      (row.d === best.d && row.sd < best.sd) ||
      (row.d === best.d && row.sd === best.sd && row.count > best.count) ||
      (row.d === best.d &&
        row.sd === best.sd &&
        row.count === best.count &&
        row.display.localeCompare(best.display) < 0)
    ) {
      best = row;
    }
  }
  return best ? { key: best.key, display: best.display, distance: best.d } : undefined;
}

const BED_PHRASE: Record<string, RegExp> = {
  king: /\bking(?:\s|-)?(?:size\s+)?beds?\b/gi,
  queen: /\bqueen(?:\s|-)?(?:size\s+)?beds?\b/gi,
  bunk: /\bbunk\s*houses?\b|\bbunk\s*beds?\b|\bbunks\b/gi,
  full: /\bfull(?:\s|-)?(?:size\s+)?beds?\b/gi,
};

const FEATURE_TEXT_RE =
  /feature|flag|description|notes|comment|lifestyle|option|amenity|interior|bedroom|sleep|floorplan_style/;

function listingBlob(unit: LotSearchable): string {
  const parts: string[] = [];
  if (unit.features) parts.push(unit.features);
  const dumped = listingSearchText(unit.fulltext);
  if (dumped) parts.push(dumped);
  for (const [key, value] of Object.entries(unit.printed || {})) {
    if (!value || SKIP_PRINT_RE.test(key) || BED_COUNT_KEYS[key]) continue;
    if (FEATURE_TEXT_RE.test(key)) parts.push(value);
  }
  return parts.join(" \n ").toLowerCase();
}

function mentionState(blob: string, phrase: RegExp): "yes" | "no" | "unknown" {
  phrase.lastIndex = 0;
  let yes = false;
  let no = false;
  for (const match of blob.matchAll(phrase)) {
    const start = match.index ?? 0;
    const before = blob.slice(Math.max(0, start - 32), start);
    if (/\b(?:no|without|not|zero)\s+(?:\w+\s+){0,3}$/i.test(before)) no = true;
    else yes = true;
  }
  if (yes) return "yes";
  if (no) return "no";
  return "unknown";
}

function floorplanIsBunkhouse(unit: LotSearchable): boolean {
  const blob = [
    unit.model,
    unit.trim,
    unit.title,
    unit.printed?.trim,
    unit.printed?.floorplan,
    unit.printed?.model,
  ]
    .filter(Boolean)
    .join(" ");
  return /\b\d{2,3}bhs?\b/i.test(blob);
}

/**
 * Sheet count, then listing text, then a bunkhouse floorplan code.
 * "no bunkhouse" is no. A blank field is unknown, not a no.
 * The Lot page does not call this. It keeps the structured bed count.
 */
export function listingFeatureState(
  unit: LotSearchable,
  bed: string,
): "yes" | "no" | "unknown" {
  const key = BED_FIELD[bed];
  if (key) {
    const raw = unit.printed?.[key];
    if (raw != null && String(raw).trim() !== "") {
      const n = Number(String(raw).replace(/[^0-9.]/g, ""));
      if (Number.isFinite(n) && n > 0) return "yes";
      if (n === 0) return "no";
    }
  }
  const phrase = BED_PHRASE[bed];
  if (phrase) {
    const heard = mentionState(listingBlob(unit), phrase);
    if (heard !== "unknown") return heard;
  }
  if (bed === "bunk" && floorplanIsBunkhouse(unit)) return "yes";
  return "unknown";
}

/** King, queen, or bunkhouse. Not a repair and not a lot-page filter. */
export function looksLikeListingFeatureAsk(text: string): boolean {
  return /\b(?:king(?:\s|-)?(?:size\s+)?beds?|queen(?:\s|-)?(?:size\s+)?beds?|bunk\s*houses?|bunk\s*beds?|bunks|\bbh\b)\b/i.test(
    text || "",
  );
}

export function lotTextScore(unit: LotSearchable, tokens: string[]): number {
  const index = cacheLotSearchIndex(unit);
  let score = 0;
  for (const token of tokens) score += tokenTier(index, token);
  return score;
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
  if (index.fulltextSet.has(token)) return 1;
  if (fulltextTypo(index, token)) return 1;
  return 0;
}

function fulltextTypo(index: LotSearchIndex, token: string): boolean {
  if (token.length < 5 || /\d/.test(token) || isEngineCode(token) || isFloorplanLikeToken(token)) {
    return false;
  }
  for (const word of index.fulltextWords) {
    if (word.length < 5 || word[0] !== token[0]) continue;
    if (Math.abs(word.length - token.length) > 1) continue;
    if (oneLetterOff(token, word)) return true;
  }
  return false;
}

function snippetFor(index: LotSearchIndex, token: string): LotSnippet | null {
  const needle = token === "bunks" ? "bunk" : token;
  const ranked = [...index.fields].sort((a, b) => tierRank(b.tier) - tierRank(a.tier));
  for (const field of ranked) {
    const words = wordsOf(field.text);
    if (words.includes(needle) || (needle.length >= 3 && !isEngineCode(needle) && words.some((word) => word.startsWith(needle)))) {
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
  if (typeof unit.lengthFt === "number" && unit.lengthFt > 0) return unit.lengthFt;
  if (typeof unit.length_ft === "number" && unit.length_ft > 0 && unit.length_ft <= 50) {
    return unit.length_ft;
  }
  const trim = (unit.trim || unit.printed?.trim || "").trim();
  const match = trim.match(/^(\d{2})(?!\d)/);
  if (match) {
    const n = Number(match[1]);
    if (Number.isInteger(n) && n >= 18 && n <= 45) return n;
  }
  return null;
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
  const sales = salesmanFilterActive(parsed);
  const specced =
    parsed.horsepower != null ||
    Boolean(parsed.displacement) ||
    Boolean(parsed.fuel) ||
    Boolean(parsed.bed) ||
    parsed.lengthMin != null ||
    sales;
  if (!parsed.tokens.length && !specced) {
    return units.map((unit) => ({ unit, score: 0, full: true, snippets: [] }));
  }
  const hits: LotTextHit<T>[] = [];
  for (const unit of units) {
    const index = cacheLotSearchIndex(unit);
    if (parsed.horsepower != null && index.horsepower !== parsed.horsepower) continue;
    if (parsed.displacement && !displacementHits(index.displacement, parsed.displacement)) continue;
    if (parsed.bed && !(index.bedCounts[parsed.bed] > 0)) continue;
    if (!fuelOk(unit, parsed.fuel)) continue;
    if (!unitMatchesSalesman(unit, parsed)) continue;
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
    if (parsed.bed) {
      snippets.push({
        field: BED_FIELD[parsed.bed],
        text: `${parsed.bed} bed`,
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

