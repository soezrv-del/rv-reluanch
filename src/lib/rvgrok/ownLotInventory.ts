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
 * Override: OWN_LOT_INVENTORY_PATH or OWN_LOT_INVENTORY_URL (Vercel / remote).
 */

import { readFile, stat } from "node:fs/promises";
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

/** body_type labels that count as diesel when the scrape has no fuel field. */
export const DIESEL_BODY_TYPES = ["Class A Diesel", "Class Super C"] as const;

export const OWN_LOT_CACHE_TTL_MS = 5 * 60 * 1000;
const MATCH_LIST_MAX = 12;

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
};

export type OwnLotFilter = {
  year?: string;
  make?: string;
  model?: string;
  location?: string;
  dieselOnly?: boolean;
  gasOnly?: boolean;
  bodyType?: string;
};

export type OwnLotCounts = {
  total: number;
  matched: number;
  diesel: number;
  dieselByBodyType: Record<string, number>;
  byBodyType: Record<string, number>;
  byMake: Record<string, number>;
  byLocation: Record<string, number>;
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

export function looksLikeOwnLotStockQuestion(text: string): boolean {
  return looksLikeInventoryOrCountQuestion(text);
}

/** Own-lot answers the ask — do not burn a public-web search. */
export function shouldSkipWebForOwnLot(text: string): boolean {
  return (
    looksLikeOwnLotStockQuestion(text) &&
    !looksLikeMarketValueQuestion(text) &&
    !looksLikeRepairQuestion(text)
  );
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
  return filter;
}

export function matchLocationFromAsk(
  query: string,
  locations: string[],
): string {
  const t = norm(query);
  let best = "";
  for (const loc of locations) {
    const n = norm(loc);
    if (n.length >= 3 && t.includes(n) && n.length > best.length) {
      best = loc;
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
    if (!ul || !ul.includes(fl)) return false;
  }
  if (filter.dieselOnly && !isDieselBodyType(unit.body_type)) return false;
  if (filter.gasOnly && !isGasBodyType(unit.body_type)) return false;
  if (filter.bodyType && !bodyTypeMatches(unit.body_type, filter.bodyType)) {
    return false;
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

export function aggregateOwnLot(
  units: OwnLotUnit[],
  filter: OwnLotFilter = {},
): OwnLotCounts {
  const matched = units.filter((u) => unitMatchesFilter(u, filter));
  const dieselByBodyType: Record<string, number> = {};
  const byBodyType: Record<string, number> = {};
  const byMake: Record<string, number> = {};
  const byLocation: Record<string, number> = {};
  let diesel = 0;
  for (const u of matched) {
    tally(byBodyType, u.body_type);
    tally(byMake, u.make);
    tally(byLocation, u.location);
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
  };
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
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : "all units";
}

export function formatOwnLotBlock(
  snapshot: OwnLotSnapshot,
  query: string,
): string {
  if (!snapshot.ok) {
    return [
      "OWN-LOT INVENTORY UNAVAILABLE.",
      snapshot.reason || "Own-lot snapshot could not be read.",
      snapshot.pathTried ? `Tried: ${snapshot.pathTried}` : "",
      "Do not invent a diesel count, VIN, stock number, or unit. Say the RV Country own-lot snapshot is not loaded this turn.",
    ]
      .filter(Boolean)
      .join("\n");
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
    "Answer from these counts. Never invent a VIN, stock number, or unit that is not in this snapshot. Brochure catalog is not lot stock.",
  ];

  const specific =
    Boolean(filter.make || filter.model || filter.year || filter.location) &&
    counts.matched > 0 &&
    counts.matched <= MATCH_LIST_MAX;
  if (specific) {
    const rows = snapshot.units
      .filter((u) => unitMatchesFilter(u, filter))
      .slice(0, MATCH_LIST_MAX)
      .map((u) => {
        const id = u.stock_number ? `stk ${u.stock_number}` : "stk unknown";
        return `- ${[u.year, u.make, u.model, u.trim, u.body_type, u.location, id]
          .filter(Boolean)
          .join(" · ")}`;
      });
    lines.push("Matching units (from file only):", ...rows);
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

export async function loadOwnLotSnapshot(opts?: {
  path?: string;
  url?: string;
  json?: unknown;
}): Promise<OwnLotSnapshot> {
  if (opts?.json !== undefined) {
    return snapshotFromJson(opts.json, { pathTried: "inline" });
  }

  const url = (opts?.url ?? ownLotUrl()).trim();
  const path = (opts?.path ?? ownLotPath()).trim();
  const cacheKey = url ? `url:${url}` : `path:${path}`;
  const hit = cache.get(cacheKey);
  if (hit && Date.now() - hit.at < OWN_LOT_CACHE_TTL_MS) {
    return hit.snapshot;
  }

  if (url) {
    try {
      const resp = await fetch(url, {
        signal: AbortSignal.timeout(8_000),
        headers: { Accept: "application/json,text/csv,text/plain" },
      });
      if (!resp.ok) {
        return {
          ok: false,
          reason: `Own-lot URL HTTP ${resp.status}`,
          asOf: "",
          source: "own",
          dealer: "RV Country",
          fuelFieldPresent: false,
          pathTried: url,
          units: [],
        };
      }
      const ctype = resp.headers.get("content-type") || "";
      const text = await resp.text();
      const snapshot = ctype.includes("csv") || url.endsWith(".csv")
        ? snapshotFromJson({ units: parseOwnLotCsv(text) }, {
            pathTried: url,
            asOf: new Date().toISOString(),
          })
        : snapshotFromJson(JSON.parse(text) as unknown, {
            pathTried: url,
          });
      if (!snapshot.asOf) snapshot.asOf = new Date().toISOString();
      cache.set(cacheKey, { at: Date.now(), mtimeMs: Date.now(), snapshot });
      return snapshot;
    } catch (e) {
      const reason = e instanceof Error ? e.message : "own-lot URL fetch failed";
      return {
        ok: false,
        reason,
        asOf: "",
        source: "own",
        dealer: "RV Country",
        fuelFieldPresent: false,
        pathTried: url,
        units: [],
      };
    }
  }

  try {
    const file = await readJsonOrCsvFile(path);
    if (hit && hit.mtimeMs === Date.parse(file.asOf)) {
      hit.at = Date.now();
      return hit.snapshot;
    }
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
    cache.set(cacheKey, {
      at: Date.now(),
      mtimeMs: Date.parse(file.asOf) || Date.now(),
      snapshot,
    });
    return snapshot;
  } catch (e) {
    const reason = e instanceof Error ? e.message : "own-lot file unreadable";
    return {
      ok: false,
      reason: `Own-lot snapshot not loaded (${reason}).`,
      asOf: "",
      source: "own",
      dealer: "RV Country",
      fuelFieldPresent: false,
      pathTried: path,
      units: [],
    };
  }
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
