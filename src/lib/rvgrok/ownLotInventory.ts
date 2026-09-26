/**
 * RV Country own-lot stock for in-app RV Grok.
 *
 * Brochure catalog (`rvData`) is the default SoT for year/make/model reports.
 * The midnight own-lot scrape (source=own) is SoT only for explicit stock
 * asks ("do we have", on the lot, in stock, inventory, diesel count) and
 * lot *search* (look/find/search + floorplan/stock, bare "27A"). Never
 * treat a coach designation or "tell me about" product report as a lot miss.
 *
 * File has no fuel field. Diesel ≈ body_type "Class A Diesel" + "Class Super C",
 * plus a plain "Class A" row in a known diesel series (Mountain Aire,
 * Allegro Bus, Ventana, Discovery).
 * Listing prices are on the scrape (`price`, then price_current / price_hidden /
 * price_lowest / price_msrp). Grounding must pass those through — never tell
 * the model the snapshot has no price data when priced units exist.
 *
 * Path default: /home/box/agent-data/projects/rvfox/inventory/own-lot-latest.json
 * Override: OWN_LOT_INVENTORY_URL (exclusive) or OWN_LOT_INVENTORY_PATH.
 * When URL is unset, Vercel/serverless tries the deploy-bundled public file
 * (createRequire / fileURL / cwd) then same-origin /inventory/own-lot-latest.json
 * BEFORE failing. A failed snapshot is UNAVAILABLE — never a stock count of 0.
 *
 * Disk and createRequire stay inside the loaders. Ask detection lives in ownLotAsk.ts.
 * Grok-only lot-ask stopwords are not used by the Lot page search box.
 */

import {
  extractFloorplanToken,
  isBudgetThousandsToken,
  fuzzyMatchCatalogName,
  looksLikeLengthMeasureAsk,
  normalizeCoachAsk,
  parseCoachFromText,
  parseSeriesAlias,
  parseSpokenSeries,
  seriesAliasEquals,
  stripLengthMeasures,
} from "./parseCoach.ts";
import {
  floorplanLengthFt,
  lengthAllowsFloorplanFallback,
  nominalLengthBand,
  parseLengthAsk,
} from "./lengthAsk.ts";
import { parseAskedClassAndFuel, unitIsDiesel, unitIsGas } from "./fuelClass.ts";
import {
  looksLikeMarketValueQuestion,
  looksLikeRepairQuestion,
  normalizeAskText,
} from "./webIntent.ts";
import {
  LOT_ASK_STOP,
  looksLikeOwnLotListingPriceQuestion,
  looksLikeOwnLotSearchAsk,
  looksLikeOwnLotStockQuestion,
  looksLikeOwnLotUnitListQuestion,
  lotSearchQueryFromAsk,
  parseOwnLotStockNumber,
} from "./ownLotAsk.ts";
import { searchLotUnits } from "../lot/lotSearch.ts";

export {
  isBareFloorplanCode,
  looksLikeOwnLotListingPriceQuestion,
  looksLikeOwnLotSearchAsk,
  looksLikeOwnLotStockQuestion,
  looksLikeOwnLotUnitListQuestion,
  lotSearchQueryFromAsk,
  parseOwnLotStockNumber,
} from "./ownLotAsk.ts";
export {
  DIESEL_BODY_TYPES,
  isDieselBodyType,
  isGasBodyType,
  unitIsDiesel,
  unitIsGas,
} from "./fuelClass.ts";

export const OWN_LOT_MODEL = "own-lot-inventory";

export const DEFAULT_OWN_LOT_JSON_PATH =
  "/home/box/agent-data/projects/rvfox/inventory/own-lot-latest.json";

/** Deploy-bundled snapshot (Vite copies public/ to the site root). */
export const OWN_LOT_PUBLIC_URL_PATH = "/inventory/own-lot-latest.json";
export const OWN_LOT_BUNDLED_RELATIVE = "public/inventory/own-lot-latest.json";
/** Relative to this module — createRequire / fileURL resolve it in-repo. */
export const OWN_LOT_MODULE_PUBLIC_SPEC =
  "../../../public/inventory/own-lot-latest.json";

export const OWN_LOT_CACHE_TTL_MS = 5 * 60 * 1000;
const MATCH_LIST_MAX = 12;
/** Same cap as listings — bands stay compact even on a 1k-unit lot. */
const PRICE_BAND_MAP_MAX = 8;
/** "around $100k" window: ±20%, never tighter than $15k (lot $50k asks). */
const AROUND_PRICE_PCT = 0.2;
const AROUND_PRICE_MIN_WINDOW = 15_000;

export const OWN_LOT_PRICE_KEYS = [
  "price",
  "price_current",
  "price_hidden",
  "price_lowest",
  "price_msrp",
] as const;

export type OwnLotUnit = {
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
  /** Dealer listing price from the scrape. Null when every price field is missing or ≤ 0. */
  price: number | null;
  /** Printed length in feet. Null when the sheet has no length. Never a floorplan. */
  lengthFt: number | null;
};

export type OwnLotFilter = {
  year?: string;
  make?: string;
  model?: string;
  /** Spoken floorplan / trim (27A, 27ASE). Matched against unit.trim. */
  trim?: string;
  location?: string;
  dieselOnly?: boolean;
  gasOnly?: boolean;
  bodyType?: string;
  /** Match body_type / model / trim that look like a toy hauler. */
  toyHauler?: boolean;
  /** Snapshot `stock_number` — exact, case-insensitive. */
  stockNumber?: string;
  minPrice?: number;
  maxPrice?: number;
  aroundPrice?: number;
  /** Printed-length cap. Inclusive only when maxLengthInclusive is true. */
  maxLengthFt?: number;
  maxLengthInclusive?: boolean;
  /** Printed length must be greater than this, or ≥ when minLengthInclusive. */
  minLengthFt?: number;
  minLengthInclusive?: boolean;
  /**
   * Spoken size class. "around 30" / "30-foot" / "30-footers" is
   * [N-2, N+2] feet, not the single foot [N, N+1).
   */
  aroundLengthFt?: number;
};

export type OwnLotPriceBand = {
  count: number;
  low: number;
  avg: number;
  high: number;
};

export type OwnLotCounts = {
  total: number;
  matched: number;
  diesel: number;
  dieselByBodyType: Record<string, number>;
  byBodyType: Record<string, number>;
  byMake: Record<string, number>;
  byLocation: Record<string, number>;
  priced: number;
  unpriced: number;
  priceBand: OwnLotPriceBand | null;
  priceByBodyType: Record<string, OwnLotPriceBand>;
  priceByLocation: Record<string, OwnLotPriceBand>;
};

export type OwnLotSnapshot = {
  ok: boolean;
  reason?: string;
  asOf: string;
  source: string;
  dealer: string;
  fuelFieldPresent: boolean;
  pathTried: string;
  units: OwnLotUnit[];
};

type CacheEntry = { at: number; mtimeMs: number; snapshot: OwnLotSnapshot };

const cache = new Map<string, CacheEntry>();

export function clearOwnLotCache(): void {
  cache.clear();
}


/** Snapshot loaded with units — we can answer lot counts from the file. */
export function ownLotHasHit(snapshot: OwnLotSnapshot | null | undefined): boolean {
  return Boolean(snapshot?.ok && snapshot.units.length > 0);
}

/** Failed or empty load — never treat as a real zero-unit lot. */
export function ownLotIsUnavailable(
  snapshot: OwnLotSnapshot | null | undefined,
): boolean {
  return !ownLotHasHit(snapshot);
}

/**
 * Skip public web only when own-lot actually answered.
 * Miss / UNAVAILABLE / empty → browse, then answer. Pricing + repair still browse.
 */
export function shouldSkipWebForOwnLot(
  text: string,
  snapshot?: OwnLotSnapshot | null,
): boolean {
  if (!looksLikeOwnLotStockQuestion(text)) return false;
  if (looksLikeMarketValueQuestion(text) || looksLikeRepairQuestion(text)) {
    return false;
  }
  return ownLotHasHit(snapshot);
}

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function str(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function pickStr(row: Record<string, unknown>, ...keys: string[]): string {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    lower[k.toLowerCase().replace(/[\s-]+/g, "_")] = v;
  }
  for (const k of keys) {
    const v = lower[k.toLowerCase().replace(/[\s-]+/g, "_")];
    if (str(v)) return str(v);
  }
  return "";
}

function lowerKeyMap(row: Record<string, unknown>): Record<string, unknown> {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    lower[k.toLowerCase().replace(/[\s-]+/g, "_")] = v;
  }
  return lower;
}

/** Parse a scrape price. Rejects ≤ 0, NaN, and empty strings. Does not invent. */
export function parseOwnLotPrice(value: unknown): number | null {
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

/**
 * Listing price from the scrape. Prefer `price`, then the scraper's fallbacks.
 * Never invent — missing / ≤ 0 stays null.
 */
export function pickOwnLotPrice(row: Record<string, unknown>): number | null {
  const lower = lowerKeyMap(row);
  for (const k of OWN_LOT_PRICE_KEYS) {
    const n = parseOwnLotPrice(lower[k]);
    if (n != null) return n;
  }
  return null;
}

const PRINTED_LENGTH_KEYS = [
  "length_ft",
  "vehicle_body_length",
  "overall_length",
  "exterior_length",
  "body_length",
  "vehicle_length",
  "length",
] as const;

/** 35' 7" → 35 + 7/12. A bare number above 80 is inches. No print stays null. */
function parsePrintedFeet(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    return value > 80 ? value / 12 : value;
  }
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const feetInches = raw.match(
    /^(\d{1,2}(?:\.\d+)?)\s*(?:'|′|ft|feet|foot)\s*(\d{1,2}(?:\.\d+)?)?\s*(?:"|″|in(?:ch(?:es)?)?)?$/i,
  );
  if (feetInches) {
    const feet = Number(feetInches[1]);
    const inches = feetInches[2] ? Number(feetInches[2]) : 0;
    if (!Number.isFinite(feet) || feet <= 0 || !Number.isFinite(inches)) return null;
    return feet + inches / 12;
  }
  const cleaned = raw.replace(/,/g, "");
  if (!/^\d+(?:\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n > 80 ? n / 12 : n;
}

/** Printed length only. Never trim, floorplan, or a guessed foot. */
function pickPrintedLengthFt(row: Record<string, unknown>): number | null {
  const lower = lowerKeyMap(row);
  for (const k of PRINTED_LENGTH_KEYS) {
    const n = parsePrintedFeet(lower[k]);
    if (n != null) return n;
  }
  return null;
}

function parseOwnLotLength(
  text: string,
): Pick<
  OwnLotFilter,
  | "maxLengthFt"
  | "maxLengthInclusive"
  | "minLengthFt"
  | "minLengthInclusive"
  | "aroundLengthFt"
> {
  const measure = parseLengthAsk(normalizeAskText(text));
  if (!measure) return {};
  if (measure.kind === "max") {
    return { maxLengthFt: measure.feet, maxLengthInclusive: measure.inclusive };
  }
  if (measure.kind === "min") {
    return measure.inclusive
      ? { minLengthFt: measure.feet, minLengthInclusive: true }
      : { minLengthFt: measure.feet };
  }
  if (measure.kind === "around") return { aroundLengthFt: measure.feet };
  return {
    minLengthFt: measure.min,
    minLengthInclusive: true,
    maxLengthFt: measure.max,
    maxLengthInclusive: true,
  };
}

function hasLengthBound(filter: OwnLotFilter): boolean {
  return (
    filter.maxLengthFt != null ||
    filter.minLengthFt != null ||
    filter.aroundLengthFt != null
  );
}

function withoutLength(filter: OwnLotFilter): OwnLotFilter {
  const next = { ...filter };
  delete next.maxLengthFt;
  delete next.maxLengthInclusive;
  delete next.minLengthFt;
  delete next.minLengthInclusive;
  delete next.aroundLengthFt;
  return next;
}

function feetText(n: number): string {
  return String(n);
}

/** Length clause only. "under 40 feet" is exactly `length < 40 ft`. */
function lengthFilterClause(filter: OwnLotFilter): string {
  if (
    filter.minLengthFt != null &&
    filter.maxLengthFt != null &&
    filter.aroundLengthFt == null
  ) {
    const minOp = filter.minLengthInclusive ? ">=" : ">";
    const maxOp = filter.maxLengthInclusive ? "<=" : "<";
    return `length ${minOp} ${feetText(filter.minLengthFt)} ft and ${maxOp} ${feetText(filter.maxLengthFt)} ft`;
  }
  if (
    filter.maxLengthFt != null &&
    filter.minLengthFt == null &&
    filter.aroundLengthFt == null
  ) {
    const op = filter.maxLengthInclusive ? "<=" : "<";
    return `length ${op} ${feetText(filter.maxLengthFt)} ft`;
  }
  if (
    filter.minLengthFt != null &&
    filter.maxLengthFt == null &&
    filter.aroundLengthFt == null
  ) {
    const op = filter.minLengthInclusive ? ">=" : ">";
    return `length ${op} ${feetText(filter.minLengthFt)} ft`;
  }
  if (filter.aroundLengthFt != null) {
    const band = nominalLengthBand(filter.aroundLengthFt);
    return `around ${feetText(filter.aroundLengthFt)} ft (${feetText(band.min)}–${feetText(band.max)})`;
  }
  return "";
}

export function formatOwnLotUsd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatOwnLotPriceBand(band: OwnLotPriceBand): string {
  return `Low ${formatOwnLotUsd(band.low)} / Avg ${formatOwnLotUsd(band.avg)} / High ${formatOwnLotUsd(band.high)} (${band.count} priced)`;
}

function priceBandFrom(prices: number[]): OwnLotPriceBand | null {
  const clean = prices.filter((p) => Number.isFinite(p) && p > 0);
  if (!clean.length) return null;
  const low = Math.min(...clean);
  const high = Math.max(...clean);
  const avg = clean.reduce((sum, p) => sum + p, 0) / clean.length;
  return { count: clean.length, low, avg, high };
}

function aroundPriceWindow(around: number): number {
  return Math.max(AROUND_PRICE_MIN_WINDOW, around * AROUND_PRICE_PCT);
}

export function rowToUnit(row: Record<string, unknown>): OwnLotUnit {
  return {
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
    price: pickOwnLotPrice(row),
    lengthFt: pickPrintedLengthFt(row),
  };
}

export function extractOwnLotRows(json: unknown): unknown[] {
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

export function parseOwnLotUnits(json: unknown): OwnLotUnit[] {
  const rows = extractOwnLotRows(json);
  const units: OwnLotUnit[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const unit = rowToUnit(row as Record<string, unknown>);
    if (!unit.make && !unit.model && !unit.body_type && !unit.stock_number) {
      continue;
    }
    units.push(unit);
  }
  return units;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQ = !inQ;
      }
    } else if ((ch === "," || ch === "\t") && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function parseOwnLotCsv(text: string): OwnLotUnit[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]!).map((h) => h.trim());
  const units: OwnLotUnit[] = [];
  for (const line of lines.slice(1)) {
    const cols = splitCsvLine(line);
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      row[h] = cols[i] ?? "";
    });
    const unit = rowToUnit(row);
    if (!unit.make && !unit.model && !unit.body_type && !unit.stock_number) {
      continue;
    }
    units.push(unit);
  }
  return units;
}

function metaFromJson(json: unknown): {
  asOf: string;
  source: string;
  dealer: string;
  fuelFieldPresent: boolean;
} {
  const empty = {
    asOf: "",
    source: "own",
    dealer: "RV Country",
    fuelFieldPresent: false,
  };
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    const rows = extractOwnLotRows(json);
    const fuelFieldPresent = rows.some(
      (r) =>
        r &&
        typeof r === "object" &&
        Boolean(pickStr(r as Record<string, unknown>, "fuel", "fuel_type")),
    );
    return { ...empty, fuelFieldPresent };
  }
  const o = json as Record<string, unknown>;
  const asOf = pickStr(
    o,
    "as_of",
    "asOf",
    "generated_at",
    "generatedAt",
    "updated_at",
    "updatedAt",
    "scraped_at",
    "scrapedAt",
    "mtime",
  );
  const rows = extractOwnLotRows(json);
  const fuelFieldPresent = rows.some(
    (r) =>
      r &&
      typeof r === "object" &&
      Boolean(pickStr(r as Record<string, unknown>, "fuel", "fuel_type")),
  );
  return {
    asOf,
    source: pickStr(o, "source") || "own",
    dealer: pickStr(o, "dealer") || "RV Country",
    fuelFieldPresent,
  };
}

export function snapshotFromJson(
  json: unknown,
  opts?: { asOf?: string; pathTried?: string },
): OwnLotSnapshot {
  const meta = metaFromJson(json);
  return {
    ok: true,
    asOf: opts?.asOf || meta.asOf,
    source: meta.source,
    dealer: meta.dealer,
    fuelFieldPresent: meta.fuelFieldPresent,
    pathTried: opts?.pathTried || "",
    units: parseOwnLotUnits(json),
  };
}

/**
 * parseCoach leftover / question-tail tokens. "Entegra Coach" is a substring
 * of "Entegra coaches", so the model parser sees `"es do we have in Fresno?"`
 * and keeps first word `es`. That is a plural leftover, not a floorplan.
 */
const OWN_LOT_MODEL_JUNK = new Set([
  "es",
  "s",
  "in",
  "at",
  "near",
  "on",
  "the",
  "a",
  "an",
  "our",
  "we",
  "do",
  "have",
  "has",
  "how",
  "many",
  "lot",
  "inventory",
  "stock",
  "unit",
  "units",
  "coach",
  "coaches",
  "ones",
  "any",
  "some",
  "available",
  "from",
  "with",
  "for",
  "there",
  "here",
  "this",
  "that",
  "those",
  "these",
  "what",
  "which",
  "where",
  "your",
  "you",
  "me",
  "my",
  "please",
  "thanks",
  "look",
  "looking",
  "find",
  "finding",
  "search",
  "searching",
  "pull",
  "pulling",
  "check",
  "checking",
  "got",
  "diesel",
  "diesels",
  "around",
  "chassis",
  "ford",
  "gasser",
  "gassers",
  "gasoline",
  "pusher",
  "pushers",
  "excluded",
  "under",
  "over",
  "below",
  "above",
  "between",
  "longer",
  "inch",
  "inches",
  "least",
  "non",
  "not",
  "than",
  "non-diesel",
  "nondiesel",
  "and",
  "to",
]);

/** Series letters parseCoach must keep (Lineage M). Not plural leftovers. */
const OWN_LOT_SERIES_LETTER = /^[mef]$/;

function locationTokenSet(locations: string[]): Set<string> {
  const out = new Set<string>();
  for (const loc of locations) {
    const n = norm(loc);
    if (!n) continue;
    out.add(n);
    for (const part of n.split(/[\s,]+/)) {
      if (part.length >= 3) out.add(part);
    }
  }
  return out;
}

/**
 * "Entegra Coach" / "American Coach" / "Coachmen" matched as a prefix of
 * the spoken plural — leftover `es` / `s` is not a model.
 */
export function stripCoachBrandPluralLeftover(
  make: string,
  model: string,
): string {
  const mk = norm(make);
  const mo = norm(model);
  if (!mo) return "";
  if (/(?:coach|men)$/.test(mk) && /^(e?s)(?:\s|$)/.test(mo)) {
    return mo.replace(/^(e?s)\s*/, "").trim();
  }
  return mo;
}

/** 1–2 letter junk (`es`) or a leftover plural — not a lot/catalog model. */
export function looksLikeGhostOwnLotModel(model: string): boolean {
  const n = norm(model);
  if (!n) return true;
  if (/^(e?s)$/.test(n)) return true;
  if (n.length <= 2 && !OWN_LOT_SERIES_LETTER.test(n)) return true;
  const tokens = n.split(/\s+/);
  return tokens.every(
    (tok) => OWN_LOT_MODEL_JUNK.has(tok) || (tok.length <= 2 && !OWN_LOT_SERIES_LETTER.test(tok)),
  );
}

function lotHasModel(units: OwnLotUnit[], model: string): boolean {
  if (!norm(model) || !units.length) return false;
  return units.some((u) => unitModelMatchesAsk(u, model));
}

/**
 * Live-voice hears Phaeton as Faten / Fayton / Phantom. Only rewrite when
 * the lot actually has a Phaeton and no row uses the spoken word as a model.
 */
const PHAETON_SPEECH_RE =
  /^(?:ph[ae]{2}tons?|fayt[eo]ns?|faetons?|fatens?|paytons?|paitons?|phantoms?)$/;

const PHAETON_SPEECH_ASK_RE =
  /\b(ph[ae]{2}tons?|fayt[eo]ns?|faetons?|fatens?|paytons?|paitons?|phantoms?)\b/;

function lotHasPhaeton(units: OwnLotUnit[]): boolean {
  return units.some((u) => /\bphaetons?\b/i.test(u.model));
}

function spokenWordIsOnLot(units: OwnLotUnit[], spoken: string): boolean {
  const n = norm(spoken);
  if (!n) return false;
  return units.some((u) => {
    const blob = norm(`${u.model} ${u.trim}`);
    return blob === n || blob.includes(n);
  });
}

/** "fatens" with no brand still means the Phaeton that is actually on the lot. */
export function phaetonSpeechInAsk(text: string, units: OwnLotUnit[]): boolean {
  const m = norm(text).match(PHAETON_SPEECH_ASK_RE);
  if (!m?.[1] || !lotHasPhaeton(units)) return false;
  return !spokenWordIsOnLot(units, m[1]);
}

export function canonicalOwnLotModel(
  model: string,
  units: OwnLotUnit[],
): string {
  const n = norm(model);
  if (!n) return "";
  if (!units.length || lotHasModel(units, n)) return n;
  if (PHAETON_SPEECH_RE.test(n)) {
    const hasPhaeton = units.some((u) => /\bphaetons?\b/i.test(u.model));
    const literal = units.some((u) => {
      const blob = norm(`${u.model} ${u.trim}`);
      return blob === n || blob.includes(n);
    });
    if (hasPhaeton && !literal) return "phaeton";
  }
  const names = [...new Set(units.map((u) => u.model).filter(Boolean))];
  const fuzzy = fuzzyMatchCatalogName(n, names);
  return fuzzy ? norm(fuzzy) : n;
}

/**
 * Drop parseCoach leftovers ("es" after "Entegra coaches") so make+location
 * asks are not zeroed by a ghost model that no lot row actually has.
 */
export function sanitizeOwnLotParsedModel(
  model: string,
  locations: string[] = [],
  opts?: { make?: string; units?: OwnLotUnit[] },
): string | undefined {
  const stripped = stripCoachBrandPluralLeftover(opts?.make || "", model);
  const tokens = norm(stripped).split(/\s+/).filter(Boolean);
  if (!tokens.length) return undefined;
  const locTokens = locationTokenSet(locations);
  const kept = tokens.filter(
    (tok) =>
      !OWN_LOT_MODEL_JUNK.has(tok) &&
      !locTokens.has(tok) &&
      !(tok.length <= 2 && !OWN_LOT_SERIES_LETTER.test(tok)),
  );
  if (!kept.length) return undefined;
  const cleaned = kept.join(" ");
  if (looksLikeGhostOwnLotModel(cleaned)) return undefined;
  const units = opts?.units || [];
  if (units.length && !lotHasModel(units, cleaned) && looksLikeGhostOwnLotModel(cleaned)) {
    return undefined;
  }
  if (units.length && !lotHasModel(units, cleaned) && cleaned.length <= 3) {
    return undefined;
  }
  return cleaned;
}

function unitLooksLikeToyHauler(unit: OwnLotUnit): boolean {
  return /toy\s*haul/i.test(
    [unit.body_type, unit.model, unit.trim, unit.make].join(" "),
  );
}

/** "under 150k" / "over 50k" is a budget, not a model or a floorplan. */
function stripBudgetPhrases(text: string): string {
  return text
    .replace(
      /\b(?:under|below|less\s+than|over|above|more\s+than|at\s+least|up\s+to|max(?:imum)?|around|about|near)\s+\$?\s*\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/gi,
      " ",
    )
    .replace(
      /\b(?:under|below|less\s+than|over|above|more\s+than|at\s+least|up\s+to|max(?:imum)?|around|about|near)\s+\$?\s*\d+(?:\.\d+)?\s*k\b/gi,
      " ",
    )
    .replace(/\$\s*\d[\d,]*(?:\.\d+)?\s*k?\b/gi, " ");
}

export function parseOwnLotAsk(
  text: string,
  locations: string[] = [],
  units: OwnLotUnit[] = [],
): OwnLotFilter {
  const t = normalizeAskText(text);
  const stripped = stripLengthMeasures(t);
  const coachText = stripBudgetPhrases(stripped);
  const parsed = parseCoachFromText(coachText);
  const normalized = normalizeCoachAsk(coachText);
  const filter: OwnLotFilter = {};
  if (parsed.year) filter.year = parsed.year;
  if (parsed.make) filter.make = parsed.make;
  // "coaches" is the whole lot. It is not the Coachmen brand.
  // A spoken "Coachmen" stays.
  if (
    filter.make &&
    /^coachmen$/i.test(filter.make) &&
    /\bcoaches\b/i.test(t) &&
    !/\bcoachmen\b/i.test(t)
  ) {
    delete filter.make;
  }
  const spokenModel =
    parsed.model ||
    (normalized.seriesCode
      ? normalized.seriesFamily
        ? `${normalized.seriesFamily} ${normalized.seriesCode}`
        : `${normalized.seriesCode} series`
      : "");
  let model = canonicalOwnLotModel(
    sanitizeOwnLotParsedModel(spokenModel, locations, {
      make: parsed.make,
      units,
    }) || "",
    units,
  );
  if ((!model || !lotHasModel(units, model)) && phaetonSpeechInAsk(coachText, units)) {
    model = "phaeton";
  }
  if (model) filter.model = model;
  if (model === "phaeton" && !filter.make) filter.make = "Tiffin";
  const trim =
    (parsed.floorplan || normalized.floorplan || "").replace(/\s+/g, "") ||
    extractFloorplanToken(coachText);
  if (
    trim &&
    !isBudgetThousandsToken(trim) &&
    (filter.make ||
      filter.model ||
      parsed.make ||
      normalized.seriesCode ||
      parsed.floorplan)
  ) {
    filter.trim = trim;
  }

  const length = parseOwnLotLength(t);
  if (length.maxLengthFt != null) filter.maxLengthFt = length.maxLengthFt;
  if (length.maxLengthInclusive != null) {
    filter.maxLengthInclusive = length.maxLengthInclusive;
  }
  if (length.minLengthFt != null) filter.minLengthFt = length.minLengthFt;
  if (length.minLengthInclusive) filter.minLengthInclusive = true;
  if (length.aroundLengthFt != null) filter.aroundLengthFt = length.aroundLengthFt;
  if (
    looksLikeLengthMeasureAsk(t) &&
    filter.model &&
    units.length > 0 &&
    !lotHasModel(units, filter.model)
  ) {
    delete filter.model;
  }

  const stockNumber = parseOwnLotStockNumber(t);
  if (stockNumber) filter.stockNumber = stockNumber;

  const asked = parseAskedClassAndFuel(t);
  if (asked.dieselOnly) filter.dieselOnly = true;
  if (asked.gasOnly) filter.gasOnly = true;
  if (asked.toyHauler) filter.toyHauler = true;
  if (asked.bodyType) filter.bodyType = asked.bodyType;

  const fromList = matchLocationFromAsk(t, locations);
  if (fromList) filter.location = fromList;

  const budget = parseOwnLotBudget(stripped);
  if (budget.minPrice != null) filter.minPrice = budget.minPrice;
  if (budget.maxPrice != null) filter.maxPrice = budget.maxPrice;
  if (budget.aroundPrice != null) filter.aroundPrice = budget.aroundPrice;
  return filter;
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseMoneyToken(raw: string, hadK: boolean): number | null {
  const n = Number(raw.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return hadK ? n * 1000 : n;
}

function parseMoneyMatch(m: RegExpMatchArray): number | null {
  const raw = m[1] || "";
  const hadK = Boolean(m[2]);
  const n = parseMoneyToken(raw, hadK);
  if (n == null) return null;
  const hadDollar = m[0].includes("$");
  const hadComma = raw.includes(",");
  if (hadK || hadDollar || hadComma || n >= 10_000) return n;
  return null;
}

const OWN_LOT_MONEY_CHUNK =
  "\\$?\\s*(\\d{1,3}(?:,\\d{3})+|\\d+(?:\\.\\d+)?)(\\s*k)?\\b";

const SPELLED_ONES: Record<string, number> = {
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
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const SPELLED_TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function parseSpelledSmallNumber(raw: string): number | null {
  const t = raw.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (SPELLED_ONES[t] != null) return SPELLED_ONES[t]!;
  if (SPELLED_TENS[t] != null) return SPELLED_TENS[t]!;
  const parts = t.split(" ");
  if (
    parts.length === 2 &&
    SPELLED_TENS[parts[0]!] != null &&
    SPELLED_ONES[parts[1]!] != null
  ) {
    return SPELLED_TENS[parts[0]!]! + SPELLED_ONES[parts[1]!]!;
  }
  if (/^\d{1,3}$/.test(t)) return Number(t);
  return null;
}

const SPELLED_THOUSANDS_RE =
  /\b((?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:[-\s]+(?:one|two|three|four|five|six|seven|eight|nine))?|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|one|two|three|four|five|six|seven|eight|nine|\d{1,3})\s+thousand\b/i;

/** "fifty thousand" / "fifty-thousand" / "80 thousand" → 50000 / 80000. */
export function parseSpelledThousands(text: string): number | null {
  const m = normalizeAskText(text).match(SPELLED_THOUSANDS_RE);
  if (!m?.[1]) return null;
  const n = parseSpelledSmallNumber(m[1]);
  return n != null && n > 0 ? n * 1000 : null;
}

function budgetFromAmount(
  t: string,
  amount: number,
): Pick<OwnLotFilter, "minPrice" | "maxPrice" | "aroundPrice"> {
  if (
    /(?:under|below|less\s+than|up\s+to|max(?:imum)?)\s+(?:\$\s*)?(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d)/i.test(
      t,
    )
  ) {
    return { maxPrice: amount };
  }
  if (
    /(?:over|above|more\s+than|at\s+least|min(?:imum)?)\s+(?:\$\s*)?(?:twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|\d)/i.test(
      t,
    )
  ) {
    return { minPrice: amount };
  }
  return { aroundPrice: amount };
}

/**
 * Budget / "around $X" from the ask. Years (2024) are not money unless
 * they carry $ or k. Spelled "fifty thousand dollar" counts as around $50k.
 */
export function parseOwnLotBudget(text: string): Pick<
  OwnLotFilter,
  "minPrice" | "maxPrice" | "aroundPrice"
> {
  const t = normalizeAskText(text);
  const around = t.match(
    new RegExp(
      `(?:around|about|near|approx(?:imately)?)\\s+${OWN_LOT_MONEY_CHUNK}`,
      "i",
    ),
  );
  if (around) {
    const n = parseMoneyMatch(around);
    if (n != null) return { aroundPrice: n };
  }
  const under = t.match(
    new RegExp(
      `(?:under|below|less\\s+than|up\\s+to|max(?:imum)?)\\s+${OWN_LOT_MONEY_CHUNK}`,
      "i",
    ),
  );
  if (under) {
    const n = parseMoneyMatch(under);
    if (n != null) return { maxPrice: n };
  }
  const over = t.match(
    new RegExp(
      `(?:over|above|more\\s+than|at\\s+least|min(?:imum)?)\\s+${OWN_LOT_MONEY_CHUNK}`,
      "i",
    ),
  );
  if (over) {
    const n = parseMoneyMatch(over);
    if (n != null) return { minPrice: n };
  }
  const spelled = parseSpelledThousands(t);
  if (spelled != null) return budgetFromAmount(t, spelled);
  return {};
}

export function matchLocationFromAsk(
  query: string,
  locations: string[],
): string {
  const t = norm(query);
  let best = "";
  let bestScore = 0;
  for (const loc of locations) {
    const n = norm(loc);
    if (n.length < 3) continue;
    if (t.includes(n) && n.length > bestScore) {
      best = loc;
      bestScore = n.length;
      continue;
    }
    const city = n.split(/[\s,]+/)[0] || "";
    if (
      city.length >= 4 &&
      new RegExp(`\\b${escapeRe(city)}\\b`).test(t) &&
      city.length > bestScore
    ) {
      best = loc;
      bestScore = city.length;
    }
  }
  return best;
}

function bodyLooksLikeToyHauler(s: string): boolean {
  return /toy\s*haul/.test(norm(s));
}

function bodyTypeMatches(unitType: string, wanted: string): boolean {
  const u = norm(unitType);
  const w = norm(wanted);
  if (!u || !w) return false;
  if (u === w) return true;
  // Distinct scrape labels — do not let "Fifth Wheel" swallow "Fifth Wheel Toy Hauler".
  if (bodyLooksLikeToyHauler(u) !== bodyLooksLikeToyHauler(w)) return false;
  return u.includes(w) || w.includes(u);
}

export function compactFloorplanToken(s: string): string {
  return (s || "").toLowerCase().replace(/[\s-]+/g, "");
}

/**
 * 27A ↔ 27ASE: ask is a prefix of the unit trim (or the reverse) and the
 * leftover is trailing series letters only (SE, XL). Do not invent plans.
 */
export function floorplanTokensAlign(ask: string, unitToken: string): boolean {
  const a = compactFloorplanToken(ask);
  const u = compactFloorplanToken(unitToken);
  if (!a || !u) return false;
  if (a === u) return true;
  if (u.startsWith(a) && /^[a-z]+$/.test(u.slice(a.length))) return true;
  if (a.startsWith(u) && /^[a-z]+$/.test(a.slice(u.length))) return true;
  return false;
}

function unitTrimMatchesAsk(unit: OwnLotUnit, ask: string): boolean {
  if (floorplanTokensAlign(ask, unit.trim)) return true;
  const blob = `${unit.model} ${unit.trim}`.trim();
  const blobFp = extractFloorplanToken(blob);
  if (blobFp && floorplanTokensAlign(ask, blobFp)) return true;
  return false;
}

function seriesCodesAlign(ask: string, unitModel: string): boolean {
  const spoken = parseSpokenSeries(ask) || parseSeriesAlias(norm(ask));
  const unit = parseSeriesAlias(norm(unitModel));
  if (!spoken?.code || !unit?.code) return false;
  if (spoken.code !== unit.code) return false;
  if (!spoken.family || !unit.family) return true;
  return spoken.family === unit.family;
}

function visionSpeechAligns(unitModel: string, ask: string): boolean {
  const u = norm(unitModel);
  const a = norm(ask);
  if (!u || !a) return false;
  if (!/\bvision\b/.test(u)) return false;
  return /\b(?:s?e\s+)?visions?(?:\s+s?e)?\b/.test(a) || /\be\s+visions?\b/.test(a);
}

function unitModelMatchesAsk(unit: OwnLotUnit, wanted: string): boolean {
  const um = norm(unit.model);
  const fm = norm(wanted);
  if (!fm) return true;
  if (um && (um.includes(fm) || fm.includes(um))) return true;
  if (seriesAliasEquals(um, fm) || seriesCodesAlign(fm, um)) return true;
  if (visionSpeechAligns(um, fm)) return true;
  const blob = norm(`${unit.model} ${unit.trim}`);
  if (blob && (blob.includes(fm) || fm.includes(blob))) return true;
  return false;
}

export function unitMatchesFilter(
  unit: OwnLotUnit,
  filter: OwnLotFilter,
): boolean {
  if (filter.stockNumber) {
    const us = norm(unit.stock_number).replace(/^#/, "");
    const fs = norm(filter.stockNumber).replace(/^#/, "");
    if (!us || us !== fs) return false;
  }
  if (filter.year && unit.year && unit.year !== filter.year) return false;
  if (filter.year && !unit.year) return false;
  if (filter.make) {
    const um = norm(unit.make);
    const fm = norm(filter.make);
    if (!um || (!um.includes(fm) && !fm.includes(um))) return false;
  }
  if (filter.model && !unitModelMatchesAsk(unit, filter.model)) return false;
  if (filter.trim && !unitTrimMatchesAsk(unit, filter.trim)) return false;
  if (filter.location) {
    const ul = norm(unit.location);
    const fl = norm(filter.location);
    if (!ul || (!ul.includes(fl) && !fl.includes(ul))) return false;
  }
  if (filter.dieselOnly && !unitIsDiesel(unit)) return false;
  if (filter.gasOnly && !unitIsGas(unit)) return false;
  if (filter.bodyType && !bodyTypeMatches(unit.body_type, filter.bodyType)) {
    return false;
  }
  if (filter.toyHauler && !unitLooksLikeToyHauler(unit)) return false;
  if (filter.maxPrice != null) {
    if (unit.price == null || unit.price > filter.maxPrice) return false;
  }
  if (filter.minPrice != null) {
    if (unit.price == null || unit.price < filter.minPrice) return false;
  }
  if (filter.aroundPrice != null) {
    if (unit.price == null) return false;
    const window = aroundPriceWindow(filter.aroundPrice);
    if (
      unit.price < filter.aroundPrice - window ||
      unit.price > filter.aroundPrice + window
    ) {
      return false;
    }
  }
  if (hasLengthBound(filter)) {
    const printed = unit.lengthFt;
    const fromPlan =
      printed == null && lengthAllowsFloorplanFallback(filter)
        ? floorplanLengthFt(unit.trim)
        : null;
    const lengthFt = printed != null ? printed : fromPlan;
    if (lengthFt == null) return false;
    if (filter.aroundLengthFt != null) {
      const band = nominalLengthBand(filter.aroundLengthFt);
      if (lengthFt < band.min || lengthFt > band.max) return false;
    }
    if (filter.maxLengthFt != null) {
      if (filter.maxLengthInclusive) {
        if (lengthFt > filter.maxLengthFt) return false;
      } else if (!(lengthFt < filter.maxLengthFt)) {
        return false;
      }
    }
    if (filter.minLengthFt != null) {
      if (filter.minLengthInclusive) {
        if (lengthFt < filter.minLengthFt) return false;
      } else if (!(lengthFt > filter.minLengthFt)) {
        return false;
      }
    }
  }
  return true;
}

function tally(map: Record<string, number>, key: string): void {
  const k = key.trim() || "(unlabeled)";
  map[k] = (map[k] || 0) + 1;
}

function sortCountMap(map: Record<string, number>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(map).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  );
}

function pushPrice(
  map: Record<string, number[]>,
  key: string,
  price: number | null | undefined,
): void {
  if (price == null || !(price > 0)) return;
  const k = key.trim() || "(unlabeled)";
  (map[k] ||= []).push(price);
}

function bandsFromPriceMap(
  map: Record<string, number[]>,
): Record<string, OwnLotPriceBand> {
  const bands: Record<string, OwnLotPriceBand> = {};
  for (const [k, prices] of Object.entries(map)) {
    const band = priceBandFrom(prices);
    if (band) bands[k] = band;
  }
  return Object.fromEntries(
    Object.entries(bands).sort(
      (a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]),
    ),
  );
}

export function aggregateOwnLot(
  units: OwnLotUnit[],
  filter: OwnLotFilter = {},
): OwnLotCounts {
  const matched = units.filter((u) => unitMatchesFilter(u, filter));
  const dieselByBodyType: Record<string, number> = {};
  const byBodyType: Record<string, number> = {};
  const byMake: Record<string, number> = {};
  const byLocation: Record<string, number> = {};
  const pricesByBodyType: Record<string, number[]> = {};
  const pricesByLocation: Record<string, number[]> = {};
  const prices: number[] = [];
  let diesel = 0;
  let priced = 0;
  for (const u of matched) {
    tally(byBodyType, u.body_type);
    tally(byMake, u.make);
    tally(byLocation, u.location);
    if (u.price != null && u.price > 0) {
      priced += 1;
      prices.push(u.price);
      pushPrice(pricesByBodyType, u.body_type, u.price);
      pushPrice(pricesByLocation, u.location, u.price);
    }
    if (unitIsDiesel(u)) {
      diesel += 1;
      tally(dieselByBodyType, u.body_type || "Class A Diesel");
    }
  }
  return {
    total: units.length,
    matched: matched.length,
    diesel,
    dieselByBodyType: sortCountMap(dieselByBodyType),
    byBodyType: sortCountMap(byBodyType),
    byMake: sortCountMap(byMake),
    byLocation: sortCountMap(byLocation),
    priced,
    unpriced: matched.length - priced,
    priceBand: priceBandFrom(prices),
    priceByBodyType: bandsFromPriceMap(pricesByBodyType),
    priceByLocation: bandsFromPriceMap(pricesByLocation),
  };
}

/** Query-time retrieval — matching units, cheapest first (or closest to around $X). */
export function queryOwnLotUnits(
  units: OwnLotUnit[],
  filter: OwnLotFilter = {},
  limit = MATCH_LIST_MAX,
): OwnLotUnit[] {
  const matched = units.filter((u) => unitMatchesFilter(u, filter));
  const around = filter.aroundPrice;
  matched.sort((a, b) => {
    const ap = a.price;
    const bp = b.price;
    if (around != null) {
      const ad = ap == null ? Number.POSITIVE_INFINITY : Math.abs(ap - around);
      const bd = bp == null ? Number.POSITIVE_INFINITY : Math.abs(bp - around);
      return ad - bd;
    }
    if (ap == null && bp == null) return 0;
    if (ap == null) return 1;
    if (bp == null) return -1;
    return ap - bp;
  });
  return matched.slice(0, Math.max(0, limit));
}

function formatCountMap(map: Record<string, number>, max = 12): string {
  const entries = Object.entries(map).slice(0, max);
  if (!entries.length) return "(none)";
  return entries.map(([k, n]) => `${k}: ${n}`).join("; ");
}

function filterLabel(filter: OwnLotFilter): string {
  const bits = [
    filter.stockNumber ? `stk ${filter.stockNumber}` : "",
    filter.year,
    filter.make,
    filter.model,
    filter.trim,
    filter.bodyType,
    filter.toyHauler ? "toy hauler" : "",
    filter.location,
    filter.dieselOnly ? "diesel (body_type proxy)" : "",
    filter.gasOnly ? "gas (body_type label)" : "",
    filter.aroundPrice != null
      ? `around ${formatOwnLotUsd(filter.aroundPrice)} (±${formatOwnLotUsd(aroundPriceWindow(filter.aroundPrice))})`
      : "",
    filter.minPrice != null ? `over ${formatOwnLotUsd(filter.minPrice)}` : "",
    filter.maxPrice != null ? `under ${formatOwnLotUsd(filter.maxPrice)}` : "",
    lengthFilterClause(filter),
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : "all units";
}

function formatPriceBandMap(
  map: Record<string, OwnLotPriceBand>,
  max = PRICE_BAND_MAP_MAX,
): string {
  const entries = Object.entries(map).slice(0, max);
  if (!entries.length) return "(none)";
  return entries
    .map(([k, band]) => `${k}: ${formatOwnLotPriceBand(band)}`)
    .join("; ");
}

function voiceCoachLockLine(unit: OwnLotUnit): string {
  return `VOICE COACH LOCK: ${unit.year || ""} | ${unit.make || ""} | ${unit.model || ""} | ${unit.trim || ""}`;
}

function appendSingleUnitLock(
  lines: string[],
  rows: OwnLotUnit[],
  matched: number,
) {
  if (matched === 1 && rows.length === 1) {
    lines.push(voiceCoachLockLine(rows[0]!));
  }
}

function formatUnitListing(unit: OwnLotUnit): string {
  const id = unit.stock_number ? `stk ${unit.stock_number}` : "stk unknown";
  const price =
    unit.price != null && unit.price > 0
      ? formatOwnLotUsd(unit.price)
      : "price not on row";
  const length =
    unit.lengthFt != null
      ? `${feetText(Math.round(unit.lengthFt * 10) / 10)} ft`
      : (() => {
          const fromPlan = floorplanLengthFt(unit.trim);
          return fromPlan != null ? `floorplan ${fromPlan} ft` : "";
        })();
  return `- ${[
    unit.year,
    unit.make,
    unit.model,
    unit.trim,
    length,
    unit.body_type,
    unit.location,
    id,
    price,
  ]
    .filter(Boolean)
    .join(" · ")}`;
}

export function formatOwnLotUnavailable(snapshot: OwnLotSnapshot): string {
  return [
    "OWN-LOT INVENTORY UNAVAILABLE.",
    snapshot.reason || "Own-lot snapshot could not be read.",
    snapshot.pathTried ? `Tried: ${snapshot.pathTried}` : "",
    "Do not answer a stock count of 0. Do not say we have zero diesels or zero units.",
    "Say UNAVAILABLE only — never a fake zero from a failed snapshot.",
    "No own-lot hit. Do not invent a diesel count, VIN, stock number, or unit, and do not claim these are our lot counts from the public web.",
    "WEB RESEARCH should run this turn — then answer. Do not stop at I don't know. Never send the user to check a website themselves.",
  ]
    .filter(Boolean)
    .join("\n");
}

function withLotSearchTitle(unit: OwnLotUnit): OwnLotUnit & { title: string } {
  return {
    ...unit,
    title: [unit.year, unit.make, unit.model, unit.trim]
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * Use Lot's token AND-search when the ask is a search (look/find/27A)
 * and parseCoach does not already have a make/model/class filter that
 * needs Integra→Entegra aliases. Brand/class/budget stays on unitMatchesFilter.
 */
function isSearchVerbLeftover(value: string | undefined): boolean {
  if (!value) return true;
  const tokens = norm(value).split(/\s+/).filter(Boolean);
  return (
    tokens.length > 0 &&
    tokens.every((t) => LOT_ASK_STOP.has(t) || OWN_LOT_MODEL_JUNK.has(t))
  );
}

export function shouldUseLotPageSearch(
  query: string,
  filter: OwnLotFilter,
  lotQuery: string,
): boolean {
  if (!lotQuery.trim()) return false;
  if (
    (filter.make && !isSearchVerbLeftover(filter.make)) ||
    (filter.model && !isSearchVerbLeftover(filter.model)) ||
    filter.bodyType ||
    filter.dieselOnly ||
    filter.gasOnly ||
    filter.toyHauler ||
    filter.stockNumber ||
    filter.minPrice != null ||
    filter.maxPrice != null ||
    filter.aroundPrice != null ||
    hasLengthBound(filter)
  ) {
    return false;
  }
  return looksLikeOwnLotSearchAsk(query) || Boolean(filter.trim);
}

function countsForMatchedUnits(
  allUnits: OwnLotUnit[],
  matched: OwnLotUnit[],
): OwnLotCounts {
  const inner = aggregateOwnLot(matched, {});
  return { ...inner, total: allUnits.length, matched: matched.length };
}

export function formatOwnLotBlock(
  snapshot: OwnLotSnapshot,
  query: string,
): string {
  if (ownLotIsUnavailable(snapshot)) {
    return formatOwnLotUnavailable(snapshot);
  }

  const locations = [
    ...new Set(snapshot.units.map((u) => u.location).filter(Boolean)),
  ];
  const filter = parseOwnLotAsk(query, locations, snapshot.units);
  let active = filter;
  let lengthCutoff = "";
  if (hasLengthBound(filter)) {
    const classFilter = withoutLength(filter);
    const classRows = snapshot.units.filter((u) =>
      unitMatchesFilter(u, classFilter),
    );
    if (!classRows.some((u) => u.lengthFt != null)) {
      const asked = lengthFilterClause(filter);
      lengthCutoff = `LENGTH CUTOFF NOT ON FILE. Asked ${asked}. No matched row has length_ft or vehicle_body_length. Do not say 0 diesels. Do not invent feet.`;
      active = classFilter;
    }
  }
  const lotQuery = lotSearchQueryFromAsk(query);
  const useLotSearch = shouldUseLotPageSearch(query, filter, lotQuery);
  const lotHits = useLotSearch
    ? searchLotUnits(snapshot.units.map(withLotSearchTitle), lotQuery)
    : [];
  const counts = useLotSearch
    ? countsForMatchedUnits(snapshot.units, lotHits)
    : aggregateOwnLot(snapshot.units, active);
  const asOf = snapshot.asOf || "unknown (no timestamp on file)";
  const dieselNote = snapshot.fuelFieldPresent
    ? "Fuel field is present on some rows — still prefer body_type Class A Diesel + Class Super C for diesel counts unless the ask names fuel."
    : 'No fuel field on this scrape. Diesel count = body_type "Class A Diesel" + "Class Super C", plus a Class A row in a known diesel series (Mountain Aire, Allegro Bus, Ventana, Discovery). Do not invent a fuel type for any other row.';

  const lines = [
    `RV Country own-lot snapshot (source=${snapshot.source || "own"}, dealer=${snapshot.dealer || "RV Country"}). As of: ${asOf}.`,
    dieselNote,
    `Lot total: ${counts.total} units. Filter: ${
      useLotSearch
        ? `lot search "${lotQuery}"`
        : filterLabel(lengthCutoff ? active : filter)
    }. Matched: ${counts.matched}.`,
    `Diesel (Class A Diesel + Class Super C): ${counts.diesel}${
      Object.keys(counts.dieselByBodyType).length
        ? ` [${formatCountMap(counts.dieselByBodyType)}]`
        : ""
    }.`,
  ];
  if (lengthCutoff) lines.push(lengthCutoff);
  if (
    (filter.make || filter.model || filter.trim) &&
    counts.matched > 0 &&
    counts.matched <= 24
  ) {
    const named = queryOwnLotUnits(snapshot.units, active, counts.matched);
    const byPlan: Record<string, number> = {};
    for (const unit of named) {
      const key = [unit.model, unit.trim].filter(Boolean).join(" ") || "(no trim)";
      byPlan[key] = (byPlan[key] || 0) + 1;
    }
    const tally = Object.entries(byPlan)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([key, n]) => `${key} × ${n}`)
      .join("; ");
    if (tally) {
      lines.push(
        `Floorplan breakdown (say once, do not recount): ${tally}.`,
      );
    }
  }
  if (active.aroundLengthFt != null) {
    const band = nominalLengthBand(active.aroundLengthFt);
    lines.push(
      `Size class around ${feetText(active.aroundLengthFt)} ft is ${feetText(band.min)}–${feetText(band.max)} ft inclusive. A printed length in that band counts. If length_ft and vehicle_body_length are blank, the floorplan number is the foot (29S, 29M, 29D, 30DS, 28A, 32V) and uses that same band. Do not drop those rows. A printed length still wins over the floorplan.`,
    );
  }
  if (
    active.aroundLengthFt == null &&
    (active.minLengthFt != null || active.maxLengthFt != null) &&
    !(active.minLengthFt != null && active.maxLengthFt != null)
  ) {
    lines.push(
      "Under/over length uses the printed length only. A blank length does not borrow the floorplan number.",
    );
  }

  const listingAsk = looksLikeOwnLotListingPriceQuestion(query);
  const listAsk = looksLikeOwnLotUnitListQuestion(query);
  const stockAsk = Boolean(filter.stockNumber);
  const narrowIdentity = Boolean(
    filter.make || filter.model || filter.trim || filter.year || filter.location,
  );
  const budgetFilter =
    filter.minPrice != null ||
    filter.maxPrice != null ||
    filter.aroundPrice != null;
  const classFilter = Boolean(
    filter.dieselOnly ||
      filter.gasOnly ||
      filter.bodyType ||
      filter.toyHauler,
  );
  const lengthClassList =
    hasLengthBound(active) && (classFilter || Boolean(active.aroundLengthFt));
  const listCap = lengthClassList ? 24 : MATCH_LIST_MAX;
  const wantListings =
    counts.matched > 0 &&
    (stockAsk ||
      listAsk ||
      useLotSearch ||
      lengthClassList ||
      ((listingAsk || budgetFilter) &&
        (narrowIdentity || classFilter || budgetFilter)) ||
      (narrowIdentity && counts.matched <= MATCH_LIST_MAX));

  // Unit rows go next to the count. A later voice trim must still see the
  // stock number — policy paragraphs used to push them past the cut.
  if (wantListings) {
    const rows = useLotSearch
      ? lotHits.slice(0, listCap)
      : queryOwnLotUnits(snapshot.units, active, listCap);
    if (rows.length) {
      lines.push(
        `Matching units (from file only, ${rows.length} of ${counts.matched}; year/make/model/trim/stock/location/price):`,
        ...rows.map(formatUnitListing),
        "Specific units ARE listed above. If a unit line is printed, that coach IS on this lot. Never say it is missing, and never say you cannot pull specific units.",
      );
      appendSingleUnitLock(lines, rows, counts.matched);
    }
  } else if (
    (listingAsk || listAsk || budgetFilter) &&
    counts.matched > MATCH_LIST_MAX
  ) {
    const rows = queryOwnLotUnits(snapshot.units, active, MATCH_LIST_MAX);
    if (rows.length) {
      lines.push(
        `Matching units (from file only, first ${rows.length} of ${counts.matched}; year/make/model/trim/stock/location/price):`,
        ...rows.map(formatUnitListing),
        "Specific units ARE listed above. Never say you cannot pull specific units or that the snapshot does not break out a list.",
      );
      appendSingleUnitLock(lines, rows, counts.matched);
    }
  } else if (counts.matched === 0 && !lengthCutoff) {
    const sameAtStore =
      filter.location && filter.trim && (filter.make || filter.model)
        ? queryOwnLotUnits(
            snapshot.units,
            { ...active, trim: undefined },
            6,
          )
        : [];
    const trimElsewhere =
      filter.location && filter.trim
        ? queryOwnLotUnits(
            snapshot.units,
            { ...active, location: undefined },
            8,
          )
        : [];
    if (sameAtStore.length || trimElsewhere.length) {
      if (sameAtStore.length) {
        lines.push(
          `No ${filter.trim} at ${filter.location}. Same make and model at that store, different floorplan: ${sameAtStore
            .map((unit) =>
              [unit.model, unit.trim, unit.stock_number ? `stk ${unit.stock_number}` : ""]
                .filter(Boolean)
                .join(" "),
            )
            .join("; ")}. Do not rename that floorplan.`,
        );
      }
      if (trimElsewhere.length) {
        lines.push(
          `${filter.trim} is on the lot at: ${trimElsewhere
            .map((unit) =>
              `${unit.location || "unknown store"} stk ${unit.stock_number || "unknown"}`,
            )
            .join("; ")}. Do not say the floorplan is missing from the lot.`,
        );
      }
    } else {
      lines.push(
        "No own-lot hit for this exact series. Say we do not have that coach on the lot snapshot this turn — briefly. Do not say it is missing from the catalog or not in listings. Do not mention catalog gap. Do not send them to check their own lot listing. Do not swap in a sibling series that shares the floorplan code.",
      );
    }
  }

  lines.push(
    `By body_type: ${formatCountMap(counts.byBodyType)}.`,
    `By make: ${formatCountMap(counts.byMake)}.`,
    `By location: ${formatCountMap(counts.byLocation)}.`,
  );

  if (counts.priceBand && counts.priced > 0) {
    lines.push(
      `Listing prices (dealer asks on this snapshot — price, else price_current / price_hidden / price_lowest / price_msrp): ${formatOwnLotPriceBand(counts.priceBand)}.`,
      `By location prices: ${formatPriceBandMap(counts.priceByLocation)}.`,
      `By body_type prices: ${formatPriceBandMap(counts.priceByBodyType)}.`,
      "Listing prices ARE in this snapshot. Never say it has no price data, that prices have not come through, or that the snapshot only has counts. Quote only prices printed here — do not invent a price.",
    );
  } else {
    lines.push(
      "No priced units in this matched set (price / price_current / price_hidden / price_lowest / price_msrp missing or ≤ 0). Do not invent a price.",
    );
  }

  lines.push(
    "Answer from these counts and listing prices. Never invent a VIN, stock number, unit, or price that is not in this snapshot. Brochure catalog is not lot stock. Own-lot listing prices are what WE ask on the lot — not nationwide market-value comps.",
    "This is an explicit inventory / in-stock ask only. Year/make/model reports use the big brochure catalog — not this block. Catalog GAP does not apply to stock counts. Never say catalog gap. Never say check your own lot listing. Never ask them to share a year for inventory.",
    "Never substitute a sibling series because a floorplan code matches (Dutch Star 4369 ≠ Ventana 4369). Never say a catalog-known coach is not in listings.",
    "Speak the Lot total above. Do not replace it with a website total or an older scrape.",
  );

  return lines.join("\n");
}

function ownLotUrl(): string {
  return (process.env.OWN_LOT_INVENTORY_URL || "").trim();
}

function ownLotPath(): string {
  return (
    (process.env.OWN_LOT_INVENTORY_PATH || "").trim() ||
    DEFAULT_OWN_LOT_JSON_PATH
  );
}

function pathJoin(...parts: string[]): string {
  return parts
    .map((part, index) => {
      const trimmed =
        index === 0 ? part.replace(/[/\\]+$/g, "") : part.replace(/^[/\\]+|[/\\]+$/g, "");
      return trimmed;
    })
    .filter((part, index) => index === 0 || part.length > 0)
    .join("/");
}

function fileUrlToPath(spec: string): string {
  const url = new URL(spec, import.meta.url);
  let pathname = decodeURIComponent(url.pathname);
  if (/^\/[A-Za-z]:\//.test(pathname)) pathname = pathname.slice(1);
  return pathname;
}

export function ownLotPublicFileCandidates(): string[] {
  const out: string[] = [];
  try {
    out.push(fileUrlToPath(OWN_LOT_MODULE_PUBLIC_SPEC));
  } catch {
    // ignore invalid URL resolution in odd bundles
  }
  const cwd = process.cwd();
  out.push(pathJoin(cwd, OWN_LOT_BUNDLED_RELATIVE));
  out.push(pathJoin(cwd, OWN_LOT_PUBLIC_URL_PATH.replace(/^\//, "")));
  return [...new Set(out.filter(Boolean))];
}

export function sameOriginOwnLotUrls(opts?: { requestOrigin?: string }): string[] {
  const urls: string[] = [];
  const origin = (opts?.requestOrigin || "").trim().replace(/\/$/, "");
  if (origin && /^https?:\/\//i.test(origin)) {
    urls.push(`${origin}${OWN_LOT_PUBLIC_URL_PATH}`);
  }
  for (const raw of [
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]) {
    const host = (raw || "").trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    if (host) urls.push(`https://${host}${OWN_LOT_PUBLIC_URL_PATH}`);
  }
  return [...new Set(urls)];
}

function unavailableSnapshot(reason: string, pathTried: string): OwnLotSnapshot {
  return {
    ok: false,
    reason,
    asOf: "",
    source: "own",
    dealer: "RV Country",
    fuelFieldPresent: false,
    pathTried,
    units: [],
  };
}

function snapshotIfPopulated(snapshot: OwnLotSnapshot): OwnLotSnapshot | null {
  return snapshot.units.length > 0 ? snapshot : null;
}

async function readJsonOrCsvFile(
  jsonPath: string,
): Promise<{ text: string; asOf: string; kind: "json" | "csv"; path: string }> {
  const { readFile, stat } = await import("node:fs/promises");
  try {
    const [text, st] = await Promise.all([
      readFile(jsonPath, "utf8"),
      stat(jsonPath),
    ]);
    return {
      text,
      asOf: st.mtime.toISOString(),
      kind: "json",
      path: jsonPath,
    };
  } catch {
    const csvPath = jsonPath.replace(/\.json$/i, ".csv");
    const [text, st] = await Promise.all([
      readFile(csvPath, "utf8"),
      stat(csvPath),
    ]);
    return {
      text,
      asOf: st.mtime.toISOString(),
      kind: "csv",
      path: csvPath,
    };
  }
}

async function fetchOwnLotUrl(url: string): Promise<OwnLotSnapshot> {
  try {
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(8_000),
      headers: { Accept: "application/json,text/csv,text/plain" },
    });
    if (!resp.ok) {
      return unavailableSnapshot(`Own-lot URL HTTP ${resp.status}`, url);
    }
    const ctype = resp.headers.get("content-type") || "";
    const text = await resp.text();
    const snapshot =
      ctype.includes("csv") || url.endsWith(".csv")
        ? snapshotFromJson({ units: parseOwnLotCsv(text) }, {
            pathTried: url,
            asOf: new Date().toISOString(),
          })
        : snapshotFromJson(JSON.parse(text) as unknown, {
            pathTried: url,
          });
    if (!snapshot.asOf) snapshot.asOf = new Date().toISOString();
    return snapshotIfPopulated(snapshot) ??
      unavailableSnapshot("Own-lot URL returned no units.", url);
  } catch (e) {
    const reason = e instanceof Error ? e.message : "own-lot URL fetch failed";
    return unavailableSnapshot(reason, url);
  }
}

async function readOwnLotFile(path: string): Promise<OwnLotSnapshot> {
  const file = await readJsonOrCsvFile(path);
  const snapshot =
    file.kind === "csv"
      ? snapshotFromJson({ units: parseOwnLotCsv(file.text) }, {
          pathTried: file.path,
          asOf: file.asOf,
        })
      : snapshotFromJson(JSON.parse(file.text) as unknown, {
          pathTried: file.path,
          asOf: file.asOf,
        });
  if (!snapshot.asOf) snapshot.asOf = file.asOf;
  return snapshotIfPopulated(snapshot) ??
    unavailableSnapshot("Own-lot file had no units.", file.path);
}

async function tryRequireBundledPublic(): Promise<OwnLotSnapshot | null> {
  try {
    const { createRequire } = await import("node:module");
    const require = createRequire(import.meta.url);
    // Vite/SSR keeps the first JSON it required. A refreshed
    // public/inventory file must not stay stuck at the old unit count.
    try {
      const resolved = require.resolve(OWN_LOT_MODULE_PUBLIC_SPEC);
      delete require.cache[resolved];
    } catch {
      // resolve can fail in some bundles; require below still tries
    }
    const json = require(OWN_LOT_MODULE_PUBLIC_SPEC) as unknown;
    const snapshot = snapshotFromJson(json, {
      pathTried: `require:${OWN_LOT_MODULE_PUBLIC_SPEC}`,
    });
    return snapshotIfPopulated(snapshot);
  } catch {
    return null;
  }
}

function remember(cacheKey: string, snapshot: OwnLotSnapshot, mtimeMs = Date.now()): OwnLotSnapshot {
  cache.set(cacheKey, { at: Date.now(), mtimeMs, snapshot });
  return snapshot;
}

async function fileMtimeMs(path: string): Promise<number | null> {
  try {
    const { stat } = await import("node:fs/promises");
    const st = await stat(path);
    return st.mtimeMs;
  } catch {
    return null;
  }
}

/** Larger own-lot snapshot wins over a stale smaller file. Same size: newer mtime. */
export function pickRicherOwnLot<T extends { units: number; mtime: number }>(
  rows: T[],
): T | null {
  let best: T | null = null;
  for (const row of rows) {
    if (
      !best ||
      row.units > best.units ||
      (row.units === best.units && row.mtime > best.mtime)
    ) {
      best = row;
    }
  }
  return best;
}

/** Larger readable snapshot among disk candidates. Public file beats a stale smaller require(). */
async function readBestOwnLotFile(
  paths: string[],
): Promise<{ snapshot: OwnLotSnapshot; mtime: number } | null> {
  const found: Array<{ units: number; mtime: number; snapshot: OwnLotSnapshot }> = [];
  const seen = new Set<string>();
  for (const path of paths) {
    if (!path || seen.has(path)) continue;
    seen.add(path);
    const mtime = await fileMtimeMs(path);
    if (mtime == null) continue;
    try {
      const snapshot = await readOwnLotFile(path);
      if (!snapshot.ok || snapshot.units.length === 0) continue;
      found.push({ units: snapshot.units.length, mtime, snapshot });
    } catch {
      // unreadable candidate — try the next path
    }
  }
  const best = pickRicherOwnLot(found);
  return best ? { snapshot: best.snapshot, mtime: best.mtime } : null;
}

export async function loadOwnLotSnapshot(opts?: {
  path?: string;
  url?: string;
  json?: unknown;
  requestOrigin?: string;
  /** Test-only: skip disk/require so same-origin fetch can be asserted. */
  skipFiles?: boolean;
}): Promise<OwnLotSnapshot> {
  if (opts?.json !== undefined) {
    const snapshot = snapshotFromJson(opts.json, { pathTried: "inline" });
    return snapshotIfPopulated(snapshot) ??
      unavailableSnapshot("Inline own-lot JSON had no units.", "inline");
  }

  const url = (opts?.url ?? ownLotUrl()).trim();
  const explicitPath = (opts?.path || "").trim();
  const path = (explicitPath || ownLotPath()).trim();
  const cacheKey = url
    ? `url:${url}`
    : explicitPath
      ? `path:${explicitPath}`
      : "default";
  const diskPaths = explicitPath
    ? [explicitPath]
    : [path, ...ownLotPublicFileCandidates()];
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < OWN_LOT_CACHE_TTL_MS) {
    let stale = false;
    if (!url && !opts?.skipFiles) {
      for (const candidate of diskPaths) {
        const mtime = await fileMtimeMs(candidate);
        if (mtime != null && mtime > hit.mtimeMs + 1) {
          stale = true;
          break;
        }
      }
    }
    if (!stale) return hit.snapshot;
  }

  // Exclusive override — do not mix with the public fallback.
  if (url) {
    const snapshot = await fetchOwnLotUrl(url);
    if (snapshot.ok) return remember(cacheKey, snapshot);
    return snapshot;
  }

  const tried: string[] = [];

  if (!opts?.skipFiles) {
    if (explicitPath) {
      try {
        const snapshot = await readOwnLotFile(explicitPath);
        if (snapshot.ok) {
          return remember(cacheKey, snapshot, Date.parse(snapshot.asOf) || Date.now());
        }
        return snapshot;
      } catch (e) {
        const reason = e instanceof Error ? e.message : "own-lot file unreadable";
        return unavailableSnapshot(
          `Own-lot snapshot not loaded (${reason}).`,
          explicitPath,
        );
      }
    }

    // Larger own-lot snapshot wins — a stale smaller file must not hide
    // the public snapshot the Lot page is showing.
    const best = await readBestOwnLotFile(diskPaths);
    if (best) return remember(cacheKey, best.snapshot, best.mtime);
    tried.push(diskPaths.join(" | ") || path);

    const required = await tryRequireBundledPublic();
    if (required) return remember(cacheKey, required);
  } else {
    tried.push("files skipped");
  }

  const publicUrls = sameOriginOwnLotUrls({ requestOrigin: opts?.requestOrigin });
  for (const publicUrl of publicUrls) {
    const snapshot = await fetchOwnLotUrl(publicUrl);
    if (snapshot.ok) return remember(cacheKey, snapshot);
    tried.push(snapshot.pathTried || publicUrl);
  }

  return unavailableSnapshot(
    `Own-lot snapshot not loaded (public fallback missed). ${tried.join(" → ")}`,
    tried.join(" | ") || path,
  );
}

/** Grounding block for chat / voice. Loads the latest file unless a snapshot is passed. */
export async function formatOwnLotInjection(
  query: string,
  opts?: { snapshot?: OwnLotSnapshot; json?: unknown },
): Promise<string> {
  const snapshot =
    opts?.snapshot ??
    (await loadOwnLotSnapshot(opts?.json !== undefined ? { json: opts.json } : undefined));
  return formatOwnLotBlock(snapshot, query);
}
