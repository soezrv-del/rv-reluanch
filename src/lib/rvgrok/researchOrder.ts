/**
 * Access-admin research order: search-first (default) vs catalog-first.
 *
 * Default MUST stay search-first so Production specs/YMM still browse.
 * Catalog-first prefers a real Neon / brochure pin for the asked field
 * and only lives when that field is missing, stale, EST, GAP, or the
 * ask is off-catalog (repair, market price, inventory).
 *
 * Brochure catalog stays grounding-only under search-first — do not
 * revive the catalog-skip-empty path for the default mode.
 */

import { inferQueriedField, type QueriedResearchField } from "./webSearch.ts";

export const DEFAULT_RESEARCH_ORDER = "search-first" as const;

export type ResearchOrder = "search-first" | "catalog-first";

export type ResearchOrderStatus = {
  override: ResearchOrder | null;
  effective: ResearchOrder;
};

const ORDER_ALIASES: Record<string, ResearchOrder> = {
  "search-first": "search-first",
  search_first: "search-first",
  searchfirst: "search-first",
  search: "search-first",
  "catalog-first": "catalog-first",
  catalog_first: "catalog-first",
  catalogfirst: "catalog-first",
  catalog: "catalog-first",
};

const FIELD_ALIASES: Record<
  Exclude<QueriedResearchField, "repair" | "generic" | "price">,
  readonly string[]
> = {
  gvwr: ["gvwr"],
  uvw: ["uvw"],
  gcwr: ["gcwr"],
  ncc: ["ncc"],
  ccc: ["ccc"],
  hitch: ["hitch"],
  payload: ["payload"],
  horsepower: ["horsepower", "hp"],
  engine: ["engine"],
  chassis: ["chassis"],
  torque: ["torque"],
  transmission: ["transmission"],
  fuel: ["fuel", "fuel type", "fueltype"],
  length: ["length"],
  mpg: ["mpg"],
  tow: ["tow", "tow rating", "towing"],
  tanks: [
    "tanks",
    "holding tanks",
    "fresh",
    "fresh water",
    "gray",
    "grey",
    "black",
  ],
};

const PIN_MISS_RE =
  /\b(EST\.?|typical class range|low confidence|UNAVAILABLE|GAP|UNKNOWN|WEB SEARCH NOT AVAILABLE|not a single locked number|no OEM pin|confirmed:\s*no|n\/a|not (?:found|published)|could not find|insufficient)\b/i;

const TRUST_EST_RE = /\[(?:EST|est|estimate)\b/i;
const TRUST_OK_RE = /\[(?:catalog|pin|oem|local|index|verified)\]/i;

export function parseResearchOrder(
  raw?: string | null,
): ResearchOrder | null {
  const v = (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-");
  return ORDER_ALIASES[v] ?? null;
}

/** Invalid / empty → Production default. Never invent catalog-first. */
export function resolveResearchOrder(raw?: string | null): ResearchOrder {
  return parseResearchOrder(raw) ?? DEFAULT_RESEARCH_ORDER;
}

export function researchOrderStatus(input: {
  override: ResearchOrder | null;
}): ResearchOrderStatus {
  return {
    override: input.override,
    effective: input.override ?? DEFAULT_RESEARCH_ORDER,
  };
}

export function isCatalogAnswerableField(
  field: QueriedResearchField,
): field is Exclude<QueriedResearchField, "repair" | "generic" | "price"> {
  return field !== "repair" && field !== "generic" && field !== "price";
}

function stripTrustTag(value: string): string {
  return value.replace(/\s*\[[^\]]+\]\s*$/g, "").trim();
}

function isRealCatalogPinValue(value: string): boolean {
  const v = stripTrustTag(value);
  if (!v || v === "—" || v === "-") return false;
  if (PIN_MISS_RE.test(value) || PIN_MISS_RE.test(v)) return false;
  if (TRUST_EST_RE.test(value)) return false;
  return true;
}

function labelMatchesField(
  label: string,
  field: Exclude<QueriedResearchField, "repair" | "generic" | "price">,
): boolean {
  const n = label
    .toLowerCase()
    .replace(/[_/,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return FIELD_ALIASES[field].some(
    (alias) => n === alias || n.startsWith(`${alias} `),
  );
}

/**
 * Real brochure / LOCKED WEIGHTS pin for one asked OEM field.
 * EST / UNAVAILABLE / GAP / UNKNOWN / miss language are not pins.
 */
export function extractCatalogFieldPin(
  catalogBlock: string | undefined,
  field: QueriedResearchField,
): string | null {
  if (!isCatalogAnswerableField(field)) return null;
  const raw = (catalogBlock || "").trim();
  if (!raw) return null;

  const verified = raw.match(
    new RegExp(`VERIFIED\\s+${field}\\s+(\\d{4,6})\\b`, "i"),
  );
  if (verified?.[1] && !PIN_MISS_RE.test(verified[0])) {
    return `${field.toUpperCase()} ${verified[1]}`;
  }

  for (const line of raw.split(/\n+/)) {
    const m = line
      .trim()
      .match(/^[-*]\s*([^:]+):\s*(.+)$/);
    if (!m?.[1] || !m[2]) continue;
    if (!labelMatchesField(m[1], field)) continue;
    const value = m[2].trim();
    if (!isRealCatalogPinValue(value)) continue;
    if (TRUST_EST_RE.test(value)) continue;
    const cleaned = stripTrustTag(value);
    if (!cleaned) continue;
    if (!TRUST_OK_RE.test(value) && !/\d|[A-Za-z]{3,}/.test(cleaned)) continue;
    return cleaned;
  }
  return null;
}

export type CatalogFirstSkipPlan = {
  field: QueriedResearchField;
  skipLive: boolean;
  pin: string | null;
  notes: string;
};

/**
 * Catalog-first skipLive only when the asked field is a real brochure pin.
 * Search-first never skips on brochure pins (grounding-only).
 */
export function planCatalogFirstSkip(opts: {
  order?: string | null;
  query: string;
  catalogBlock?: string;
}): CatalogFirstSkipPlan {
  const field = inferQueriedField(opts.query);
  const empty: CatalogFirstSkipPlan = {
    field,
    skipLive: false,
    pin: null,
    notes: "",
  };
  if (resolveResearchOrder(opts.order) !== "catalog-first") return empty;
  if (!isCatalogAnswerableField(field)) return empty;
  const pin = extractCatalogFieldPin(opts.catalogBlock, field);
  if (!pin) return empty;
  return {
    field,
    skipLive: true,
    pin,
    notes: `CONFIRMED: yes (catalog pin).\n${field}: ${pin}`,
  };
}
