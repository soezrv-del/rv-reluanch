/**
 * RV Country own-lot stock for in-app RV Grok.
 *
 * Brochure catalog (`rvData`) is not lot stock. The midnight own-lot scrape
 * (source=own) is the count SoT. Loaded only when the ask looks like
 * inventory / in-stock — never stuffed into every chat turn.
 *
 * File has no fuel field. Diesel ≈ body_type "Class A Diesel" + "Class Super C".
 *
 * Path default: /home/box/agent-data/projects/rvfox/inventory/own-lot-latest.json
 * Override: OWN_LOT_INVENTORY_URL (exclusive) or OWN_LOT_INVENTORY_PATH.
 * When URL is unset, Vercel/serverless tries the deploy-bundled public file
 * (createRequire / fileURL / cwd) then same-origin /inventory/own-lot-latest.json
 * BEFORE failing. A failed snapshot is UNAVAILABLE — never a stock count of 0.
 */

import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseCoachFromText } from "./parseCoach.ts";
import {
  looksLikeInventoryOrCountQuestion,
  looksLikeMarketValueQuestion,
  looksLikeRepairQuestion,
  normalizeAskText,
} from "./webIntent.ts";

export const OWN_LOT_MODEL = "own-lot-inventory";

export const DEFAULT_OWN_LOT_JSON_PATH =
  "/home/box/agent-data/projects/rvfox/inventory/own-lot-latest.json";

/** Deploy-bundled snapshot (Vite copies public/ to the site root). */
export const OWN_LOT_PUBLIC_URL_PATH = "/inventory/own-lot-latest.json";
export const OWN_LOT_BUNDLED_RELATIVE = "public/inventory/own-lot-latest.json";
/** Relative to this module — createRequire / fileURL resolve it in-repo. */
export const OWN_LOT_MODULE_PUBLIC_SPEC =
  "../../../public/inventory/own-lot-latest.json";

/** body_type labels that count as diesel when the scrape has no fuel field. */
export const DIESEL_BODY_TYPES = ["Class A Diesel", "Class Super C"] as const;

export const OWN_LOT_CACHE_TTL_MS = 5 * 60 * 1000;
const MATCH_LIST_MAX = 12;
/** Same cap as listings — bands stay compact even on a 1k-unit lot. */
const PRICE_BAND_MAP_MAX = 8;
/** "around $100k" window: ±20%, never tighter than $10k. */
const AROUND_PRICE_PCT = 0.2;
const AROUND_PRICE_MIN_WINDOW = 10_000;

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
};

export type OwnLotFilter = {
  year?: string;
  make?: string;
  model?: string;
  location?: string;
  dieselOnly?: boolean;
  gasOnly?: boolean;
  bodyType?: string;
  minPrice?: number;
  maxPrice?: number;
  aroundPrice?: number;
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

/**
 * Own-lot listing prices / budget / "show prices too" — not nationwide
 * market-value comps (those stay on looksLikeMarketValueQuestion).
 */
const OWN_LOT_LISTING_PRICE_RE =
  /\b((?:show|include|have|with|see|need|want|any|should).{0,40}prices?|prices?\s+(?:too|data|as well|also|included|please)|(?:unit|listing|lot|inventory|stock|our)\s+prices?|prices?\s+(?:on|for|of|in|from)\b|(?:around|about|near|approx(?:imately)?|under|below|over|above|less\s+than|more\s+than|up\s+to)\s+\$?\s*\d|budget\b|\$\d|\d{2,3}\s*k\b)/i;

export function looksLikeOwnLotListingPriceQuestion(text: string): boolean {
  const t = normalizeAskText(text);
  if (!t.trim()) return false;
  return OWN_LOT_LISTING_PRICE_RE.test(t);
}

export function looksLikeOwnLotStockQuestion(text: string): boolean {
  return (
    looksLikeInventoryOrCountQuestion(text) ||
    looksLikeOwnLotListingPriceQuestion(text)
  );
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

export function isDieselBodyType(bodyType: string): boolean {
  const n = norm(bodyType);
  if (!n) return false;
  if (n === "class a diesel" || n === "class super c") return true;
  if (/^class\s*a\s*[-/]?\s*diesel/.test(n)) return true;
  if (/^class\s*super\s*c\b/.test(n)) return true;
  return false;
}

export function isGasBodyType(bodyType: string): boolean {
  const n = norm(bodyType);
  if (!n || isDieselBodyType(n)) return false;
  return /\bgas\b/.test(n);
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

export function parseOwnLotAsk(
  text: string,
  locations: string[] = [],
): OwnLotFilter {
  const t = normalizeAskText(text);
  const parsed = parseCoachFromText(t);
  const filter: OwnLotFilter = {};
  if (parsed.year) filter.year = parsed.year;
  if (parsed.make) filter.make = parsed.make;
  if (parsed.model) filter.model = parsed.model;

  if (/\b(diesels?|pusher|pushers)\b/i.test(t)) filter.dieselOnly = true;
  if (/\bgas\b/i.test(t) && !filter.dieselOnly) filter.gasOnly = true;

  if (/\bsuper\s*c\b/i.test(t)) filter.bodyType = "Class Super C";
  else if (/\bclass\s*a\s*diesel\b/i.test(t)) filter.bodyType = "Class A Diesel";
  else if (/\bclass\s*a\s*gas\b/i.test(t)) filter.bodyType = "Class A Gas";
  else if (/\bclass\s*b\b/i.test(t)) filter.bodyType = "Class B";
  else if (/\bclass\s*c\b/i.test(t) && !/\bsuper\s*c\b/i.test(t)) {
    filter.bodyType = "Class C";
  } else if (/\bfifth[- ]?wheels?\b/i.test(t)) filter.bodyType = "Fifth Wheel";
  else if (/\btravel\s+trailers?\b/i.test(t)) filter.bodyType = "Travel Trailer";

  const fromList = matchLocationFromAsk(t, locations);
  if (fromList) filter.location = fromList;

  const budget = parseOwnLotBudget(t);
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

/**
 * Budget / "around $X" from the ask. Years (2024) are not money unless
 * they carry $ or k.
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

function bodyTypeMatches(unitType: string, wanted: string): boolean {
  const u = norm(unitType);
  const w = norm(wanted);
  if (!u || !w) return false;
  return u === w || u.includes(w) || w.includes(u);
}

export function unitMatchesFilter(
  unit: OwnLotUnit,
  filter: OwnLotFilter,
): boolean {
  if (filter.year && unit.year && unit.year !== filter.year) return false;
  if (filter.year && !unit.year) return false;
  if (filter.make) {
    const um = norm(unit.make);
    const fm = norm(filter.make);
    if (!um || (!um.includes(fm) && !fm.includes(um))) return false;
  }
  if (filter.model) {
    const um = norm(unit.model);
    const fm = norm(filter.model);
    if (!um || (!um.includes(fm) && !fm.includes(um))) return false;
  }
  if (filter.location) {
    const ul = norm(unit.location);
    const fl = norm(filter.location);
    if (!ul || (!ul.includes(fl) && !fl.includes(ul))) return false;
  }
  if (filter.dieselOnly && !isDieselBodyType(unit.body_type)) return false;
  if (filter.gasOnly && !isGasBodyType(unit.body_type)) return false;
  if (filter.bodyType && !bodyTypeMatches(unit.body_type, filter.bodyType)) {
    return false;
  }
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
    if (isDieselBodyType(u.body_type)) {
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
    filter.year,
    filter.make,
    filter.model,
    filter.bodyType,
    filter.location,
    filter.dieselOnly ? "diesel (body_type proxy)" : "",
    filter.gasOnly ? "gas (body_type label)" : "",
    filter.aroundPrice != null
      ? `around ${formatOwnLotUsd(filter.aroundPrice)} (±${formatOwnLotUsd(aroundPriceWindow(filter.aroundPrice))})`
      : "",
    filter.minPrice != null ? `over ${formatOwnLotUsd(filter.minPrice)}` : "",
    filter.maxPrice != null ? `under ${formatOwnLotUsd(filter.maxPrice)}` : "",
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

function formatUnitListing(unit: OwnLotUnit): string {
  const id = unit.stock_number ? `stk ${unit.stock_number}` : "stk unknown";
  const price =
    unit.price != null && unit.price > 0
      ? formatOwnLotUsd(unit.price)
      : "price not on row";
  return `- ${[
    unit.year,
    unit.make,
    unit.model,
    unit.trim,
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
  const filter = parseOwnLotAsk(query, locations);
  const counts = aggregateOwnLot(snapshot.units, filter);
  const asOf = snapshot.asOf || "unknown (no timestamp on file)";
  const dieselNote = snapshot.fuelFieldPresent
    ? "Fuel field is present on some rows — still prefer body_type Class A Diesel + Class Super C for diesel counts unless the ask names fuel."
    : 'No fuel field on this scrape. Diesel count = body_type "Class A Diesel" + "Class Super C" only. Do not invent a fuel type.';

  const lines = [
    `RV Country own-lot snapshot (source=${snapshot.source || "own"}, dealer=${snapshot.dealer || "RV Country"}). As of: ${asOf}.`,
    dieselNote,
    `Lot total: ${counts.total} units. Filter: ${filterLabel(filter)}. Matched: ${counts.matched}.`,
    `Diesel (Class A Diesel + Class Super C): ${counts.diesel}${
      Object.keys(counts.dieselByBodyType).length
        ? ` [${formatCountMap(counts.dieselByBodyType)}]`
        : ""
    }.`,
    `By body_type: ${formatCountMap(counts.byBodyType)}.`,
    `By make: ${formatCountMap(counts.byMake)}.`,
    `By location: ${formatCountMap(counts.byLocation)}.`,
  ];

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
  );

  const listingAsk = looksLikeOwnLotListingPriceQuestion(query);
  const narrowIdentity = Boolean(
    filter.make || filter.model || filter.year || filter.location,
  );
  const budgetFilter =
    filter.minPrice != null ||
    filter.maxPrice != null ||
    filter.aroundPrice != null;
  const classFilter = Boolean(
    filter.dieselOnly || filter.gasOnly || filter.bodyType,
  );
  const wantListings =
    counts.matched > 0 &&
    (
      ((listingAsk || budgetFilter) &&
        (narrowIdentity || classFilter || budgetFilter)) ||
      (narrowIdentity && counts.matched <= MATCH_LIST_MAX)
    );

  if (wantListings) {
    const rows = queryOwnLotUnits(snapshot.units, filter, MATCH_LIST_MAX);
    if (rows.length) {
      lines.push(
        `Matching units (from file only, ${rows.length} of ${counts.matched}; year/make/model/trim/stock/location/price):`,
        ...rows.map(formatUnitListing),
      );
    }
  } else if (listingAsk && counts.matched > MATCH_LIST_MAX) {
    lines.push(
      "Too many matched units to list. Narrow by location, class, make, or budget for specific priced units.",
    );
  }

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

export function ownLotPublicFileCandidates(): string[] {
  const out: string[] = [];
  try {
    out.push(fileURLToPath(new URL(OWN_LOT_MODULE_PUBLIC_SPEC, import.meta.url)));
  } catch {
    // ignore invalid URL resolution in odd bundles
  }
  const cwd = process.cwd();
  out.push(join(cwd, OWN_LOT_BUNDLED_RELATIVE));
  out.push(join(cwd, OWN_LOT_PUBLIC_URL_PATH.replace(/^\//, "")));
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

function tryRequireBundledPublic(): OwnLotSnapshot | null {
  try {
    const require = createRequire(import.meta.url);
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
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < OWN_LOT_CACHE_TTL_MS) {
    return hit.snapshot;
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

    try {
      const snapshot = await readOwnLotFile(path);
      if (snapshot.ok) {
        return remember(cacheKey, snapshot, Date.parse(snapshot.asOf) || Date.now());
      }
      tried.push(snapshot.pathTried || path);
    } catch (e) {
      const reason = e instanceof Error ? e.message : "own-lot file unreadable";
      tried.push(`${path} (${reason})`);
    }

    const required = tryRequireBundledPublic();
    if (required) return remember(cacheKey, required);

    for (const candidate of ownLotPublicFileCandidates()) {
      if (candidate === path) continue;
      try {
        const snapshot = await readOwnLotFile(candidate);
        if (snapshot.ok) {
          return remember(cacheKey, snapshot, Date.parse(snapshot.asOf) || Date.now());
        }
        tried.push(snapshot.pathTried || candidate);
      } catch (e) {
        const reason = e instanceof Error ? e.message : "unreadable";
        tried.push(`${candidate} (${reason})`);
      }
    }
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
