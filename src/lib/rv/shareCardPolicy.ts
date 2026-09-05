/**
 * Share-card include policy + customer-facing copy filters.
 * Kept free of catalog / path-alias imports so node:test can load it.
 */

/** Optional dump sections — default OFF. Header + Summary are always on. */
export type ShareInclude = {
  rating: boolean;
  market: boolean;
  payment: boolean;
  lifestyle: boolean;
  strengths: boolean;
  notes: boolean;
  powertrain: boolean;
  weights: boolean;
  dimensions: boolean;
  living: boolean;
  tanks: boolean;
  power: boolean;
  chassisGear: boolean;
  garage: boolean;
};

export type ShareSpecGroupId = Exclude<
  keyof ShareInclude,
  "rating" | "market" | "payment" | "lifestyle" | "strengths"
>;

export const DEFAULT_SHARE_INCLUDE: ShareInclude = {
  rating: false,
  market: false,
  payment: false,
  lifestyle: false,
  strengths: false,
  notes: false,
  powertrain: false,
  weights: false,
  dimensions: false,
  living: false,
  tanks: false,
  power: false,
  chassisGear: false,
  garage: false,
};

export const OPTIONAL_SHARE_KEYS = Object.keys(
  DEFAULT_SHARE_INCLUDE,
) as (keyof ShareInclude)[];

export function hasOptionalShareSections(include: ShareInclude): boolean {
  return OPTIONAL_SHARE_KEYS.some((k) => include[k]);
}

/**
 * Price lines the salesman can opt into after Market is on.
 * Default all OFF — force an intentional pick (never dump the stack).
 */
export type ShareMarketAmounts = {
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  msrpLo: number;
  msrpHi: number;
};

export type ShareMarketLineId = keyof ShareMarketAmounts;
export type ShareMarketLines = Record<ShareMarketLineId, boolean>;

export const SHARE_MARKET_LINE_DEFS: {
  id: ShareMarketLineId;
  /** Label printed on the shared card. */
  shareLabel: string;
  /** Compact field label in the Share editor. */
  fieldLabel: string;
  /** Spoken name for include/remove + aria. */
  name: string;
}[] = [
  {
    id: "tradeIn",
    shareLabel: "Trade-in est.",
    fieldLabel: "TRADE-IN / WHOLESALE",
    name: "trade-in",
  },
  {
    id: "retailLow",
    shareLabel: "Retail low",
    fieldLabel: "RETAIL LOW",
    name: "retail low",
  },
  {
    id: "retailHigh",
    shareLabel: "Asking",
    fieldLabel: "ASKING / RETAIL HIGH",
    name: "asking",
  },
  {
    id: "msrpLo",
    shareLabel: "MSRP low",
    fieldLabel: "MSRP LOW",
    name: "MSRP low",
  },
  {
    id: "msrpHi",
    shareLabel: "MSRP high",
    fieldLabel: "MSRP HIGH",
    name: "MSRP high",
  },
];

export const DEFAULT_SHARE_MARKET_LINES: ShareMarketLines = {
  tradeIn: false,
  retailLow: false,
  retailHigh: false,
  msrpLo: false,
  msrpHi: false,
};

export function hasSelectedMarketLines(lines?: ShareMarketLines | null): boolean {
  if (!lines) return false;
  return SHARE_MARKET_LINE_DEFS.some((d) => lines[d.id]);
}

export function selectedShareMarketEntries(
  market: ShareMarketAmounts,
  lines?: ShareMarketLines | null,
): { id: ShareMarketLineId; shareLabel: string; amount: number }[] {
  if (!lines) return [];
  return SHARE_MARKET_LINE_DEFS.filter(
    (d) => lines[d.id] && Number.isFinite(market[d.id]) && market[d.id] > 0,
  ).map((d) => ({
    id: d.id,
    shareLabel: d.shareLabel,
    amount: market[d.id],
  }));
}

/** Shared-card MARKET block — empty when nothing was picked (no dump). */
export function buildShareMarketSection(
  market: ShareMarketAmounts,
  lines: ShareMarketLines | undefined,
  money: (n: number) => string,
): string[] {
  const rows = selectedShareMarketEntries(market, lines).map(
    (e) => `${e.shareLabel} ${money(e.amount)}`,
  );
  if (!rows.length) return [];
  return ["MARKET", ...rows];
}

export function formatShareMarketText(
  market: ShareMarketAmounts,
  lines: ShareMarketLines | undefined,
  money: (n: number) => string,
): string {
  return buildShareMarketSection(market, lines, money).join("\n");
}

/** Zero extras → header + Summary + Payment. Never inject a Market dump. */
export function effectiveShareInclude(include: ShareInclude): ShareInclude {
  if (hasOptionalShareSections(include)) return include;
  return { ...include, payment: true };
}

/** Customer-facing share must never leak catalog placeholder tags. */
export function isSharePlaceholder(v?: string | null): boolean {
  if (!v) return false;
  return /confirm brochure|confirm oem brochure|typ\.\s*[—–-]\s*confirm/i.test(
    v,
  );
}

export function isShareableValue(v?: string | null): boolean {
  if (!v) return false;
  const t = v.trim();
  if (!t || t === "—" || t === "-" || t === "–") return false;
  if (/^n\/a\b/i.test(t)) return false;
  if (isSharePlaceholder(t)) return false;
  return true;
}

/** Internal catalog ops language — not manufacturer brochure copy. */
const INTERNAL_PITCH_RE =
  /do not invent|do not copy|do not stamp|do not merge|do not globalize|yearEnd|yearStart|legacy search alias|kept so older|prefer [a-z0-9 .+-]+ \+|no \d{4}(?:[–-]\d{2,4})? (?:oem )?(?:brochure|card|page)|floorplans still absent|floorplans still unsourced|not copied onto|not a separate (?:make|brand)|use [a-z].+ for my/i;

export function customerFacingPitch(raw?: string | null): string {
  if (!raw) return "";
  const clauses = raw
    .split(/(?<=\.)\s+| · /)
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((c) => isShareableValue(c) && !INTERNAL_PITCH_RE.test(c));
  return clauses.join(" ").replace(/\s+/g, " ").trim();
}
