/**
 * Field-only spec fallback — empty catalog cells only.
 *
 * Catalog / OEM pins stay SoT. When a capacity or weight field is empty,
 * scrape that field (not the whole coach) in this order:
 *   1. RVUSA.com inventory / spec pages
 *   2. RV Guide
 *   3. Dealer listings (RVTrader / dealer sites)
 *   4. Official OEM brochure PDF
 *
 * Dry weight may paint as UVW with an asterisk + source URL. Never invent.
 * No Gemini. No new bots. DialaBot stays out.
 */

export type SpecFieldKey =
  | "uvw"
  | "gvwr"
  | "ccc"
  | "fuelCapacity"
  | "freshWater"
  | "grayWater"
  | "blackWater";

export type SpecFallbackSource =
  | "rvusa"
  | "rvguide"
  | "dealer"
  | "oem-brochure";

export type SpecCoachIdentity = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
};

export type SpecFieldFill = {
  field: SpecFieldKey;
  value: number;
  unit: "lbs" | "gal";
  /** True when UVW was printed as dry weight, not UVW. */
  asDryWeight?: boolean;
  source: SpecFallbackSource;
  sourceUrl: string;
};

export type SpecFallbackCandidate = {
  source: SpecFallbackSource;
  url: string;
};

export const SPEC_FALLBACK_CHAIN: readonly SpecFallbackSource[] = [
  "rvusa",
  "rvguide",
  "dealer",
  "oem-brochure",
] as const;

export const SPEC_ENGINE_OWNED_FIELDS: readonly SpecFieldKey[] = [
  "uvw",
  "gvwr",
  "ccc",
  "fuelCapacity",
  "freshWater",
  "grayWater",
  "blackWater",
] as const;

/** Desk / chat labels the shared engine owns — chat must not compete. */
export const SPEC_ENGINE_OWNED_LABELS: readonly string[] = [
  "UVW",
  "GVWR",
  "CCC",
  "Fuel capacity",
  "Fresh",
  "Gray",
  "Black",
] as const;

const LBS_MIN = 2_000;
const LBS_MAX = 60_000;
const GAL_MIN = 1;
const GAL_MAX = 300;

const RVGUIDE_ORIGIN = "https://www.rvguide.com";
const RVUSA_ORIGIN = "https://www.rvusa.com";
const RVTRADER_ORIGIN = "https://www.rvtrader.com";
const RVUSA_LIBRARY = "http://library.rvusa.com";
const JD_POWER_ORIGIN = "https://www.jdpower.com";

export function slugSpecToken(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function specClassSlug(rvClass?: string): string {
  const t = String(rvClass || "").toLowerCase();
  if (/\bclass\s*b\b/.test(t)) return "class-b";
  if (/\bfifth\b/.test(t)) return "fifth-wheel";
  if (/\btravel\s*trailer\b/.test(t)) return "travel-trailer";
  if (/\btoy\s*hauler\b/.test(t)) return "toy-hauler";
  if (/\bclass\s*a\b/.test(t)) return "class-a";
  return "class-c";
}

function titleSlug(raw: string): string {
  return String(raw || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isLineageSeriesF31Zw(id: SpecCoachIdentity): boolean {
  const year = String(id.year || "").trim();
  const make = (id.make || "").toLowerCase();
  const model = (id.model || "").toLowerCase();
  const fp = (id.floorplan || "").toUpperCase().replace(/\s+/g, "");
  return (
    year === "2026" &&
    make.includes("grand design") &&
    model.includes("lineage") &&
    model.includes("series f") &&
    fp === "31ZW"
  );
}

/**
 * Same-year scrape candidates. Known Lineage 2026 URLs are discovery
 * helpers (not a value pin). 2025 RVUSA is not a 2026 candidate.
 */
export function specFallbackUrls(
  identity: SpecCoachIdentity,
  rvClass?: string,
): SpecFallbackCandidate[] {
  const year = String(identity.year || "").trim();
  const make = slugSpecToken(identity.make);
  const model = slugSpecToken(identity.model);
  const fp = slugSpecToken(identity.floorplan);
  if (!year || !make || !model || !fp) return [];

  const classSlug = specClassSlug(rvClass);
  const q = encodeURIComponent(
    `${year} ${identity.make} ${identity.model} ${identity.floorplan}`.replace(
      /\s+/g,
      " ",
    ),
  );
  const out: SpecFallbackCandidate[] = [];

  out.push({
    source: "rvusa",
    url: `${RVUSA_ORIGIN}/rv-guide/${year}-${make}-${model}-${fp}-${classSlug}-specs`,
  });
  out.push({
    source: "rvusa",
    url: `${RVUSA_ORIGIN}/rvs-for-sale?search=${q}`,
  });

  out.push({
    source: "rvguide",
    url: `${RVGUIDE_ORIGIN}/specs/${make}/${classSlug}/${year}/${model}/${fp}.html`,
  });
  if (isLineageSeriesF31Zw(identity)) {
    out.push({
      source: "rvguide",
      url: `${RVGUIDE_ORIGIN}/specs/grand-design/class-c/2026/lineage-series-f/31zw.html`,
    });
  }

  out.push({
    source: "dealer",
    url: `${RVTRADER_ORIGIN}/search-results?search=${q}`,
  });
  out.push({
    source: "dealer",
    url: `${JD_POWER_ORIGIN}/rvs-for-sale/inventory/${year}/${make}/${model}`,
  });

  out.push({
    source: "oem-brochure",
    url: `${RVUSA_LIBRARY}/brochure/${year}-${titleSlug(identity.make)}-${titleSlug(identity.model)}.pdf`,
  });
  if (isLineageSeriesF31Zw(identity)) {
    out.push({
      source: "oem-brochure",
      url: `${RVUSA_LIBRARY}/brochure/2026-Grand-Design-Lineage-Series-F.pdf`,
    });
  }

  const seen = new Set<string>();
  return out.filter((row) => {
    const key = `${row.source}|${row.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function htmlToSpecText(html: string): string {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseBoundedNumber(
  raw: string,
  kind: "lbs" | "gal",
): number | null {
  const n = Number(String(raw || "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (kind === "lbs") {
    if (n < LBS_MIN || n > LBS_MAX) return null;
    return Math.round(n);
  }
  if (n < GAL_MIN || n > GAL_MAX) return null;
  return Math.round(n * 10) / 10;
}

function firstLabeledNumber(
  text: string,
  label: RegExp,
  kind: "lbs" | "gal",
): number | null {
  const re = new RegExp(
    `${label.source}[^\\d]{0,56}(\\d{1,3}(?:,\\d{3}){1,2}|\\d{1,5}(?:\\.\\d+)?)`,
    "i",
  );
  const m = text.match(re);
  if (!m?.[1]) return null;
  return parseBoundedNumber(m[1], kind);
}

function pushFill(
  out: SpecFieldFill[],
  field: SpecFieldKey,
  value: number | null,
  unit: "lbs" | "gal",
  meta: { source: SpecFallbackSource; url: string },
  extra?: { asDryWeight?: boolean },
): void {
  if (value == null) return;
  if (out.some((row) => row.field === field)) return;
  out.push({
    field,
    value,
    unit,
    source: meta.source,
    sourceUrl: meta.url,
    ...(extra?.asDryWeight ? { asDryWeight: true } : {}),
  });
}

/**
 * Extract labeled capacity / weight fields only. Never invent.
 * Dry weight fills UVW when UVW is not printed.
 */
export function parseSpecFieldsFromHtml(
  html: string,
  meta: { source: SpecFallbackSource; url: string },
): SpecFieldFill[] {
  const text = htmlToSpecText(html);
  if (!text) return [];
  const out: SpecFieldFill[] = [];

  const uvw = firstLabeledNumber(
    text,
    /\b(?:uvw|unloaded\s+(?:vehicle\s+)?weight|unloaded\s+wt)\b/,
    "lbs",
  );
  const dry = firstLabeledNumber(text, /\bdry\s+weight\b/, "lbs");
  if (uvw != null) {
    pushFill(out, "uvw", uvw, "lbs", meta);
  } else if (dry != null) {
    pushFill(out, "uvw", dry, "lbs", meta, { asDryWeight: true });
  }

  pushFill(
    out,
    "gvwr",
    firstLabeledNumber(text, /\bgvwr\b/, "lbs"),
    "lbs",
    meta,
  );
  pushFill(
    out,
    "ccc",
    firstLabeledNumber(
      text,
      /\b(?:payload(?:\s+capacity)?|ccc|cargo\s+carrying\s+capacity|occc|ncc)\b/,
      "lbs",
    ),
    "lbs",
    meta,
  );
  pushFill(
    out,
    "fuelCapacity",
    firstLabeledNumber(
      text,
      /\b(?:fuel\s+capacity|fuel\s+tank(?:\s+capacity)?)\b/,
      "gal",
    ),
    "gal",
    meta,
  );
  pushFill(
    out,
    "freshWater",
    firstLabeledNumber(
      text,
      /\b(?:total\s+)?fresh(?:\s+water)?(?:\s+tank)?(?:\s+capacity)?\b/,
      "gal",
    ),
    "gal",
    meta,
  );
  pushFill(
    out,
    "grayWater",
    firstLabeledNumber(
      text,
      /\b(?:total\s+)?gr[ae]y(?:\s+water)?(?:\s+tank)?(?:\s+capacity)?\b/,
      "gal",
    ),
    "gal",
    meta,
  );
  pushFill(
    out,
    "blackWater",
    firstLabeledNumber(
      text,
      /\b(?:total\s+)?black(?:\s+water)?(?:\s+tank)?(?:\s+capacity)?\b/,
      "gal",
    ),
    "gal",
    meta,
  );

  return out;
}

/** Best-effort PDF text scrape — no extra dependency. */
export function parseSpecFieldsFromPdf(
  binary: string,
  meta: { source: SpecFallbackSource; url: string },
): SpecFieldFill[] {
  const ascii = String(binary || "")
    .replace(/[^\x09\x0a\x0d\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ");
  if (!/\b(dry\s+weight|uvw|gvwr|fresh|fuel\s+capacity)\b/i.test(ascii)) {
    return [];
  }
  return parseSpecFieldsFromHtml(ascii, meta);
}

export type FetchSpecPage = (url: string) => Promise<{
  ok: boolean;
  text: string;
  url: string;
  contentType?: string;
}>;

const DEFAULT_TIMEOUT_MS = 8_000;

export async function fetchSpecPage(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  signal?: AbortSignal,
): Promise<{ ok: boolean; text: string; url: string; contentType?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const resp = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        Accept: "text/html,application/xhtml+xml,application/pdf,*/*",
        "User-Agent":
          "Mozilla/5.0 (compatible; RVFaxSpecEngine/1.0; +https://www.rvmax.app)",
      },
      signal: ctrl.signal,
    });
    if (!resp.ok) {
      return { ok: false, text: "", url, contentType: resp.headers.get("content-type") || "" };
    }
    const contentType = resp.headers.get("content-type") || "";
    if (/pdf/i.test(contentType) || /\.pdf(\?|$)/i.test(url)) {
      const buf = await resp.arrayBuffer();
      const text = new TextDecoder("latin1").decode(buf);
      return { ok: true, text, url: resp.url || url, contentType };
    }
    const text = await resp.text();
    if (!text.trim()) return { ok: false, text: "", url, contentType };
    return { ok: true, text, url: resp.url || url, contentType };
  } catch {
    return { ok: false, text: "", url };
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

function parsePage(
  page: { text: string; url: string; contentType?: string },
  source: SpecFallbackSource,
): SpecFieldFill[] {
  const meta = { source, url: page.url };
  if (/pdf/i.test(page.contentType || "") || /\.pdf(\?|$)/i.test(page.url)) {
    return parseSpecFieldsFromPdf(page.text, meta);
  }
  return parseSpecFieldsFromHtml(page.text, meta);
}

/**
 * Walk the source chain for empty fields only. First hit per field wins.
 * Catalog values are never overwritten — caller passes the empty set.
 */
export async function runSpecFieldFallback(opts: {
  identity: SpecCoachIdentity;
  empty: readonly SpecFieldKey[];
  rvClass?: string;
  fetchPage?: FetchSpecPage;
  signal?: AbortSignal;
}): Promise<SpecFieldFill[]> {
  const empty = new Set(
    opts.empty.filter((k) => SPEC_ENGINE_OWNED_FIELDS.includes(k)),
  );
  if (!empty.size) return [];
  const fetchPage = opts.fetchPage ?? ((url) => fetchSpecPage(url, DEFAULT_TIMEOUT_MS, opts.signal));
  const candidates = specFallbackUrls(opts.identity, opts.rvClass);
  const found: SpecFieldFill[] = [];

  for (const source of SPEC_FALLBACK_CHAIN) {
    if (!empty.size) break;
    const pages = candidates.filter((c) => c.source === source);
    for (const cand of pages) {
      if (!empty.size || opts.signal?.aborted) break;
      const page = await fetchPage(cand.url);
      if (!page.ok || !page.text.trim()) continue;
      const parsed = parsePage(page, source);
      for (const fill of parsed) {
        if (!empty.has(fill.field)) continue;
        found.push({ ...fill, sourceUrl: fill.sourceUrl || page.url });
        empty.delete(fill.field);
      }
    }
  }

  return found;
}

export function mergeSpecFills(
  existing: readonly SpecFieldFill[],
  incoming: readonly SpecFieldFill[],
): SpecFieldFill[] {
  const out = [...existing];
  for (const fill of incoming) {
    if (out.some((row) => row.field === fill.field)) continue;
    out.push(fill);
  }
  return out;
}
