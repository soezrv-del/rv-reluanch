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

/** Zero extras → keep the card commercially useful. */
export function effectiveShareInclude(include: ShareInclude): ShareInclude {
  if (hasOptionalShareSections(include)) return include;
  return { ...include, market: true, payment: true };
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
