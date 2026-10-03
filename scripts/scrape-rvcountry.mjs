#!/usr/bin/env node
/**
 * Free RV Country own-lot scrape. Plain HTTP only. No paid services, no /api/.
 *
 * Reads https://rvcountry.com/vehicle-sitemap.xml and srp-sitemap.xml, then
 * each /inventory/{slug} page, and copies the embedded unit (initialItem or
 * units) into the rich snapshot the publisher already commits.
 *
 * Spec-sheet fields stay in raw.attributes (including "Number of King Size
 * Beds"). Flags are spec rows whose value is the label. Listing text,
 * taglines, and website collections are not features.
 *
 *   node scripts/scrape-rvcountry.mjs --max 5 --out /tmp/own-lot-smoke.json
 *   node scripts/scrape-rvcountry.mjs
 *
 * Default output is OWN_LOT_INVENTORY_PATH, else the publisher upstream path.
 * Then: node scripts/publish-own-lot.mjs
 * Publishing also writes public/inventory/own-lot-fulltext.json.
 *
 * Polite UA, 2.5s between requests. Stops on 403, 429, 503, or a Cloudflare
 * challenge and does not write a partial file.
 */

import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { DEFAULT_UPSTREAM } from "./publish-own-lot.mjs";

export const USER_AGENT = "RVMaxLotBot/1.0 (+https://rvmax.app; own-lot inventory)";
export const PACE_MS = 2500;
export const VEHICLE_SITEMAP = "https://rvcountry.com/vehicle-sitemap.xml";
export const SRP_SITEMAP = "https://rvcountry.com/srp-sitemap.xml";

const TOP_KEYS = [
  "source",
  "dealer",
  "year",
  "make",
  "model",
  "trim",
  "title",
  "price",
  "price_msrp",
  "price_current",
  "price_hidden",
  "price_lowest",
  "vin",
  "stock_number",
  "condition",
  "body_type",
  "mileage",
  "location",
  "lot_status",
  "url",
  "source_page",
  "scraped_at",
  "id",
  "hitch_weight",
  "vehicle_body_length",
  "vehicle_body_height",
  "vehicle_body_width",
  "max_sleeping_count",
  "number_of_slideouts",
  "total_fresh_water_tank_capacity",
  "total_gray_water_tank_capacity",
  "total_black_water_tank_capacity",
  "propane_lbs",
  "propane_gal",
  "engine",
  "chassis_brand",
  "fuel_type",
  "transmission",
  "fuel_tank_capacity",
  "awning_length",
  "generator",
  "heater_btu",
  "towing_capacity",
  "horsepower",
  "number_of_axles",
  "lot_code",
  "received_date",
  "price_monthly",
  "price_biweekly",
  "price_current_incl_fees",
  "document_fee",
  "dealer_prep_fee",
  "on_special",
  "is_certified",
  "photo",
  "floorplan_image",
  "image_count",
  "location_city",
  "location_state",
  "location_phone",
  "detail_fetched",
  "raw",
];

export function isApiUrl(url) {
  try {
    const path = new URL(url).pathname;
    return path === "/api" || path.startsWith("/api/");
  } catch {
    return /\/api(\/|$)/.test(String(url));
  }
}

export function inventoryUrlsFromSitemap(xml) {
  const urls = [];
  const seen = new Set();
  for (const match of String(xml).matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)) {
    let parsed;
    try {
      parsed = new URL(match[1].trim());
    } catch {
      continue;
    }
    if (parsed.hostname !== "rvcountry.com" && parsed.hostname !== "www.rvcountry.com") {
      continue;
    }
    if (isApiUrl(parsed.href)) continue;
    if (!/^\/inventory\/[^/]+$/.test(parsed.pathname)) continue;
    parsed.hash = "";
    parsed.search = "";
    const href = parsed.toString();
    if (seen.has(href)) continue;
    seen.add(href);
    urls.push(href);
  }
  return urls;
}

export function isBlockedResponse(status, body = "") {
  if (status === 403 || status === 429 || status === 503) return true;
  const text = String(body || "");
  const challenge =
    /Just a moment|cf-browser-verification|Attention Required|challenge-platform|cdn-cgi\/challenge/i.test(
      text,
    );
  return challenge && !/initialItem|stock_number/.test(text);
}

export function flightText(html) {
  const parts = [];
  const re = /self\.__next_f\.push\((\[.*?\])\)\s*<\/script>/gs;
  for (const match of String(html).matchAll(re)) {
    try {
      const arr = JSON.parse(match[1]);
      if (Array.isArray(arr) && typeof arr[1] === "string") parts.push(arr[1]);
    } catch {
      /* a chunk that is not JSON is not a unit */
    }
  }
  return parts.length ? parts.join("") : String(html);
}

export function sliceJsonValue(text, start) {
  let i = start;
  while (i < text.length && /\s/.test(text[i])) i += 1;
  const open = text[i];
  if (open !== "{" && open !== "[") return null;
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let j = i; j < text.length; j += 1) {
    const ch = text[j];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(i, j + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function pushUnit(found, seen, unit) {
  if (!unit || typeof unit !== "object" || Array.isArray(unit)) return;
  const stock = String(unit.stock_number || unit.id || "").trim();
  if (!stock || seen.has(stock)) return;
  seen.add(stock);
  found.push(unit);
}

export function extractEmbeddedUnits(html) {
  const text = flightText(html);
  const found = [];
  const seen = new Set();
  for (const match of text.matchAll(/"initialItem"\s*:/g)) {
    const value = sliceJsonValue(text, match.index + match[0].length);
    if (value && typeof value === "object" && !Array.isArray(value)) pushUnit(found, seen, value);
  }
  for (const match of text.matchAll(/"units"\s*:/g)) {
    const value = sliceJsonValue(text, match.index + match[0].length);
    if (!Array.isArray(value)) continue;
    for (const unit of value) pushUnit(found, seen, unit);
  }
  return found;
}

function nameOf(value) {
  if (typeof value === "string") return value.startsWith("$") ? "" : value.trim();
  if (value && typeof value === "object" && typeof value.name === "string") {
    return value.name.startsWith("$") ? "" : value.name.trim();
  }
  return "";
}

function pickName(...values) {
  for (const value of values) {
    const name = nameOf(value);
    if (name) return name;
  }
  return "";
}

function num(value) {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function positive(value) {
  const n = num(value);
  return n != null && n > 0 ? n : null;
}

function countOrNull(value) {
  const n = num(value);
  return n != null && n >= 0 ? n : null;
}

function textOrNull(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text || text.startsWith("$")) return null;
  return text;
}

function rawOf(item) {
  const raw = item?._raw;
  return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
}

function locationOf(item, raw) {
  for (const candidate of [item.company_location, raw.company_location]) {
    if (!candidate || typeof candidate !== "object") continue;
    const name = nameOf(candidate.name ?? candidate);
    if (candidate.city || candidate.state || candidate.phone || name) return candidate;
  }
  return {};
}

function specSheet(raw) {
  const groups = new Map();
  const list = Array.isArray(raw.inventory_unit_attributes) ? raw.inventory_unit_attributes : [];
  for (const attr of list) {
    if (!attr || typeof attr !== "object") continue;
    const name = String(attr.name ?? "").trim();
    if (!name) continue;
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(attr);
  }
  const attributes = {};
  const flags = [];
  for (const [name, items] of groups) {
    const pieces = [];
    for (const attr of items) {
      const brand = attr.brand_value;
      const piece = brand == null || brand === "" ? attr.value : brand;
      if (piece == null) continue;
      const text = String(piece).trim();
      if (text && !pieces.includes(text)) pieces.push(text);
    }
    if (pieces.length && pieces.every((piece) => piece === name)) {
      flags.push(name);
      continue;
    }
    if (pieces.length) attributes[name] = pieces.join(" | ");
  }
  flags.sort((a, b) => a.localeCompare(b));
  return { attributes, flags };
}

function attrValue(raw, name) {
  const list = Array.isArray(raw.inventory_unit_attributes) ? raw.inventory_unit_attributes : [];
  for (const attr of list) {
    if (attr?.name !== name || attr.value == null) continue;
    const text = String(attr.value).trim();
    if (text) return text;
  }
  return "";
}

function propaneOf(raw) {
  let propane_lbs = null;
  let propane_gal = null;
  const list = Array.isArray(raw.inventory_unit_attributes) ? raw.inventory_unit_attributes : [];
  for (const attr of list) {
    if (attr?.name !== "Total Propane Tank Capacity") continue;
    const n = num(attr.value);
    if (n == null || n <= 0) continue;
    const unit = String(attr.measure_unit || "").toLowerCase();
    if (unit.startsWith("lb")) propane_lbs = n;
    else if (unit.startsWith("gal")) propane_gal = n;
  }
  return { propane_lbs, propane_gal };
}

function stringList(value) {
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const item of value) {
    const text = typeof item === "string" ? item.trim() : "";
    if (text && !text.startsWith("$") && !out.includes(text)) out.push(text);
  }
  return out;
}

function collectionsOf(item, raw) {
  const out = [];
  const lists = [
    item.website_inventory_collections,
    raw.website_inventory_collections,
    raw.inventory_collections,
  ];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
      const name = typeof entry === "string" ? entry.trim() : nameOf(entry?.name ?? entry);
      if (name && !name.startsWith("$") && !out.includes(name)) out.push(name);
    }
  }
  return out;
}

function colorsOf(item, raw) {
  const out = [];
  const add = (name) => {
    const text = String(name ?? "").trim();
    if (text && !text.startsWith("$") && !out.includes(text)) out.push(text);
  };
  if (Array.isArray(item.exterior_colors)) {
    for (const color of item.exterior_colors) add(typeof color === "string" ? color : color?.name);
  }
  if (Array.isArray(raw.exterior_color_name)) {
    for (const color of raw.exterior_color_name) add(color);
  }
  return out;
}

function pageUrlOf(item, raw, pageUrl) {
  const candidates = [];
  if (pageUrl) candidates.push(pageUrl);
  if (typeof item.url === "string") candidates.push(item.url);
  if (Array.isArray(raw.urls)) candidates.push(...raw.urls);
  for (const candidate of candidates) {
    if (typeof candidate !== "string" || isApiUrl(candidate)) continue;
    if (/rvcountry\.com\/inventory\/[^/?#]+/.test(candidate)) return candidate.split("?")[0];
  }
  return "";
}

function salePrice(raw, item) {
  // MSRP is the listed price when the page has no sale price. That is intentional.
  return (
    positive(raw.price_current ?? item.price_current) ??
    positive(raw.price_hidden ?? item.price_hidden) ??
    positive(raw.price_lowest ?? item.price_lowest) ??
    positive(raw.price_msrp ?? item.price_msrp)
  );
}

function receivedDate(value) {
  const text = textOrNull(typeof value === "string" ? value : "");
  if (!text) return null;
  const day = text.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

export function formatScrapedAt(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}-07:00`;
}

/** Map one embedded unit onto the production snapshot fields. */
export function mapUnit(item, { scrapedAt, pageUrl } = {}) {
  const raw = rawOf(item);
  const spec = specSheet(raw);
  const propane = propaneOf(raw);
  const loc = locationOf(item, raw);
  const images = Array.isArray(raw.images) ? raw.images : Array.isArray(item.images) ? item.images : [];
  const photo = textOrNull(raw.display_image) || textOrNull(item.display_image);
  const floorplan = textOrNull(raw.floorplan_image) || textOrNull(item.floorplan_image);
  const url = pageUrlOf(item, raw, pageUrl);
  const axle = num(attrValue(raw, "Number of Axles"));
  const attrNum = (name) => positive(attrValue(raw, name));
  const row = {
    source: "own",
    dealer: "RV Country",
    year: num(raw.year ?? item.year),
    make: pickName(item.unit_make, raw.unit_make),
    model: pickName(item.unit_model, raw.unit_model),
    trim: pickName(item.trim, raw.unit_trim, item.unit_trim),
    title: textOrNull(raw.title) || textOrNull(item.title) || "",
    price: salePrice(raw, item),
    price_msrp: positive(raw.price_msrp ?? item.price_msrp),
    price_current: positive(raw.price_current ?? item.price_current),
    price_hidden: positive(raw.price_hidden ?? item.price_hidden),
    price_lowest: positive(raw.price_lowest ?? item.price_lowest),
    vin: textOrNull(raw.vin) || textOrNull(item.vin) || "",
    stock_number: textOrNull(String(raw.stock_number ?? item.stock_number ?? "")) || "",
    condition: pickName(item.condition, raw.condition),
    body_type: pickName(item.unit_classification, raw.unit_classification) || null,
    mileage: countOrNull(raw.odometer ?? item.mileage) ?? 0,
    location: nameOf(loc.name) || nameOf(loc),
    lot_status: textOrNull(raw.lot_status) || textOrNull(item.lotStatus) || "",
    url,
    source_page: url,
    scraped_at: scrapedAt || "",
    id: num(raw.id ?? item.id),
    hitch_weight: positive(raw.hitch_weight ?? item.hitch_weight),
    gvwr: positive(raw.gvwr ?? item.gvwr),
    dry_weight: positive(raw.dry_weight),
    payload: positive(raw.standard_payload ?? raw.payload),
    cargo_carrying_capacity:
      positive(raw.cargo_carrying_capacity) ?? attrNum("Cargo Carrying Capacity"),
    air_conditioning_btu: positive(raw.air_conditioning_btu),
    number_of_ac_units: positive(raw.number_of_ac_units) ?? attrNum("Number of AC Units"),
    torque: positive(raw.torque),
    water_heater_tank_capacity: positive(raw.water_heater_tank_capacity),
    vehicle_body_length: positive(raw.vehicle_body_length ?? item.vehicle_body_length),
    vehicle_body_height: positive(raw.vehicle_body_height ?? item.exterior_height),
    vehicle_body_width: positive(raw.vehicle_body_width ?? item.exterior_width),
    max_sleeping_count: countOrNull(raw.max_sleeping_count ?? item.max_sleeping_count),
    number_of_slideouts: countOrNull(raw.number_of_slideouts ?? item.number_of_slideouts),
    total_fresh_water_tank_capacity: positive(raw.total_fresh_water_tank_capacity),
    total_gray_water_tank_capacity: positive(raw.total_gray_water_tank_capacity),
    total_black_water_tank_capacity: positive(raw.total_black_water_tank_capacity),
    propane_lbs: propane.propane_lbs,
    propane_gal: propane.propane_gal,
    engine: textOrNull(raw.engine),
    chassis_brand: textOrNull(raw.chassis_brand),
    fuel_type: textOrNull(raw.fuel_type) || textOrNull(item.fuel_type),
    transmission: textOrNull(attrValue(raw, "Transmission Type")),
    fuel_tank_capacity: positive(raw.fuel_tank_capacity),
    awning_length: positive(raw.awning_length),
    generator: textOrNull(attrValue(raw, "Generator Type")),
    heater_btu: positive(raw.heater_btu),
    towing_capacity: positive(raw.towing_capacity),
    horsepower: positive(raw.horsepower),
    number_of_axles: axle != null && axle > 0 ? axle : null,
    lot_code: textOrNull(raw.lot),
    received_date: receivedDate(raw.received_date),
    price_monthly: positive(raw.price_monthly ?? item.price_monthly),
    price_biweekly: positive(raw.price_biweekly),
    price_current_incl_fees: positive(raw.price_current_incl_fees),
    document_fee: positive(raw.document_fee ?? item.document_fee),
    dealer_prep_fee: positive(raw.dealer_prep_fee),
    on_special: Boolean(raw.on_special ?? item.on_special),
    is_certified: Boolean(raw.is_certified ?? item.is_certified),
    photo,
    floorplan_image: floorplan,
    image_count: images.length,
    location_city: textOrNull(loc.city),
    location_state: textOrNull(loc.state),
    location_phone: textOrNull(loc.phone),
    detail_fetched: true,
    raw: compactRaw(spec, raw, item),
  };
  const ordered = {};
  for (const key of Object.keys(row)) {
    if (row[key] == null && !KEEP_NULL.has(key)) continue;
    ordered[key] = row[key];
  }
  return ordered;
}

const KEEP_NULL = new Set(["price", "price_msrp", "price_current", "price_hidden", "price_lowest"]);

function compactRaw(spec, raw, item) {
  const out = {};
  if (Object.keys(spec.attributes).length) out.attributes = spec.attributes;
  if (spec.flags.length) out.flags = spec.flags;
  const feature = stringList(raw.floorplan_feature);
  const lifestyle = stringList(raw.floorplan_lifestyle);
  const style = stringList(raw.floorplan_style);
  if (feature.length) out.floorplan_feature = feature;
  if (lifestyle.length) out.floorplan_lifestyle = lifestyle;
  if (style.length) out.floorplan_style = style;
  const colors = colorsOf(item, raw);
  if (colors.length) out.exterior_colors = colors;
  if (raw.custom_fields && typeof raw.custom_fields === "object" && !Array.isArray(raw.custom_fields)) {
    if (Object.keys(raw.custom_fields).length) out.custom_fields = raw.custom_fields;
  }
  const unitType = pickName(item.unit_classification?.vehicle_type, raw.unit_classification?.vehicle_type);
  if (unitType) out.unit_type = unitType;
  const collections = collectionsOf(item, raw);
  if (collections.length) out.collections = collections;
  return out;
}

export function productionFieldDiff(row, productionRows) {
  const top = new Set();
  const rawKeys = new Set();
  for (const production of productionRows) {
    if (!production || typeof production !== "object") continue;
    for (const key of Object.keys(production)) top.add(key);
    if (production.raw && typeof production.raw === "object") {
      for (const key of Object.keys(production.raw)) rawKeys.add(key);
    }
  }
  return {
    unknownTop: Object.keys(row).filter((key) => !top.has(key)),
    unknownRaw: Object.keys(row.raw || {}).filter((key) => !rawKeys.has(key)),
    missingTop: TOP_KEYS.filter((key) => !(key in row)),
  };
}

function dedupeRows(rows) {
  const byStock = new Map();
  for (const row of rows) {
    const stock = row.stock_number || String(row.id || "");
    const prev = byStock.get(stock);
    if (!prev) {
      byStock.set(stock, row);
      continue;
    }
    const prevN = Object.keys(prev.raw?.attributes || {}).length;
    const nextN = Object.keys(row.raw?.attributes || {}).length;
    if (nextN > prevN) byStock.set(stock, row);
  }
  return [...byStock.values()];
}

async function fetchText(url, { fetchImpl, sleepImpl, paceMs, state }) {
  if (isApiUrl(url)) throw Object.assign(new Error(`refusing /api/ url ${url}`), { code: "FAILED" });
  if (state.last) {
    const wait = paceMs - (Date.now() - state.last);
    if (wait > 0) await sleepImpl(wait);
  }
  state.last = Date.now();
  state.urls.push(url);
  const res = await fetchImpl(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
  });
  const body = await res.text();
  if (isBlockedResponse(res.status, body)) {
    throw Object.assign(new Error(`scrape blocked (${res.status}) ${url}`), { code: "BLOCKED" });
  }
  return { status: res.status, body };
}

export async function scrapeOwnLot({
  max = Infinity,
  fetchImpl = globalThis.fetch,
  sleepImpl = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  paceMs = PACE_MS,
  now = Date.now(),
} = {}) {
  const state = { last: 0, urls: [] };
  const get = (url) => fetchText(url, { fetchImpl, sleepImpl, paceMs, state });
  const vehicle = await get(VEHICLE_SITEMAP);
  const srp = await get(SRP_SITEMAP);
  const urls = inventoryUrlsFromSitemap(vehicle.body);
  const seen = new Set(urls);
  for (const url of inventoryUrlsFromSitemap(srp.body)) {
    if (seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }
  const limited = Number.isFinite(max) ? urls.slice(0, max) : urls;
  const scrapedAt = formatScrapedAt(new Date(now));
  const rows = [];
  for (const url of limited) {
    const page = await get(url);
    if (page.status === 404) continue;
    if (page.status >= 400) {
      throw Object.assign(new Error(`scrape failed (${page.status}) ${url}`), { code: "FAILED" });
    }
    const units = extractEmbeddedUnits(page.body);
    if (!units.length) {
      throw Object.assign(new Error(`scrape failed (no embedded unit) ${url}`), { code: "FAILED" });
    }
    for (const unit of units) rows.push(mapUnit(unit, { scrapedAt, pageUrl: url }));
  }
  const deduped = dedupeRows(rows);
  if (!deduped.length) {
    throw Object.assign(new Error("scrape failed (no units)"), { code: "FAILED" });
  }
  return { rows: deduped, scrapedAt, requested: state.urls };
}

function snapshotText(rows) {
  return `[\n${rows.map((row) => JSON.stringify(row)).join(",\n")}\n]\n`;
}

function writeSnapshot(path, rows) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp-${process.pid}`;
  writeFileSync(tmp, snapshotText(rows));
  renameSync(tmp, path);
}

function argValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

async function main() {
  const maxRaw = argValue("--max");
  const max = maxRaw ? Number(maxRaw) : Infinity;
  if (maxRaw && (!Number.isInteger(max) || max < 1)) {
    console.error("[scrape-rvcountry] --max needs a positive integer");
    process.exitCode = 1;
    return;
  }
  const out =
    argValue("--out") || process.env.OWN_LOT_INVENTORY_PATH || DEFAULT_UPSTREAM;
  try {
    const scraped = await scrapeOwnLot({ max });
    writeSnapshot(out, scraped.rows);
    const partial = Number.isFinite(max) ? ` (max ${max})` : "";
    console.log(
      `own-lot scrape: ${scraped.rows.length} units, scraped ${scraped.scrapedAt}${partial} -> ${out}`,
    );
  } catch (err) {
    console.error(`[scrape-rvcountry] ${err?.message || err}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
