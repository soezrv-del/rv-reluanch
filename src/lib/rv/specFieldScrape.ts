/**
 * Per-field HTML scrape for empty capacity / weight specs.
 * No Gemini. No invented numbers. Dry weight may fill UVW.
 */

export type SpecFieldName = "uvw" | "tanks" | "fuel" | "gvwr";

export type SpecFieldScrapeHost = "rvusa" | "rvguide" | "dealer" | "oem-pdf";

export type SpecFieldScrapeHit = {
  uvwLbs?: number;
  uvwIsDryWeight?: boolean;
  payloadLbs?: number;
  fuelCapacityGal?: number;
  freshWaterGal?: number;
  grayWaterGal?: number;
  blackWaterGal?: number;
  gvwrLbs?: number;
  sourceUrl: string;
  sourceHost: SpecFieldScrapeHost;
};

export type SpecFieldScrapeFetch = (
  url: string,
  init?: { signal?: AbortSignal },
) => Promise<{
  ok: boolean;
  url: string;
  text: string;
  contentType: string;
}>;

const WEIGHT_MIN = 500;
const WEIGHT_MAX = 120_000;
const GAL_MIN = 1;
const GAL_MAX = 399;
const DEFAULT_TIMEOUT_MS = 7_000;
const MAX_URLS = 7;

function slug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hostOf(url: string): SpecFieldScrapeHost {
  const u = url.toLowerCase();
  if (/library\.rvusa\.com|\/brochure\/.+\.pdf/.test(u)) return "oem-pdf";
  if (/rvusa\.com/.test(u)) return "rvusa";
  if (/rvguide\.com/.test(u)) return "rvguide";
  return "dealer";
}

function classSlugs(rvType?: string | null): string[] {
  const t = (rvType || "").toLowerCase();
  if (/super\s*c/.test(t)) return ["class-c", "super-c"];
  if (/class\s*b/.test(t)) return ["class-b"];
  if (/class\s*a/.test(t)) return ["class-a"];
  if (/fifth/.test(t)) return ["fifth-wheel"];
  if (/travel\s*trailer|towable/.test(t)) return ["travel-trailer"];
  if (/class\s*c/.test(t)) return ["class-c"];
  return ["class-c", "super-c", "class-a"];
}

/** Source order: RVUSA → RV Guide → dealer listings → OEM brochure PDF. */
export function specFieldScrapeUrls(opts: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  rvType?: string | null;
}): string[] {
  const year = String(opts.year || "").trim();
  const make = slug(opts.make || "");
  const model = slug(opts.model || "");
  const fp = slug(opts.floorplan || "");
  if (!year || !make || !model) return [];

  const qMake = encodeURIComponent(opts.make.trim());
  const qModel = encodeURIComponent(opts.model.trim());
  const qFp = opts.floorplan ? encodeURIComponent(opts.floorplan.trim()) : "";
  const urls: string[] = [];

  if (fp) {
    urls.push(
      `https://www.rvusa.com/rv-guide/${year}-${make}-${model}-${fp}-specs`,
    );
  }
  urls.push(
    `https://www.rvusa.com/rv-search?year=${encodeURIComponent(year)}&make=${qMake}&model=${qModel}${
      qFp ? `&keyword=${qFp}` : ""
    }`,
  );

  for (const cls of classSlugs(opts.rvType)) {
    if (fp) {
      urls.push(
        `https://www.rvguide.com/specs/${make}/${cls}/${year}/${model}/${fp}.html`,
      );
    }
  }

  urls.push(
    `https://www.rvtrader.com/rvs-for-sale?make=${qMake}&model=${qModel}&year=${encodeURIComponent(year)}`,
  );

  const brochureName = [year, opts.make.trim(), opts.model.trim()]
    .filter(Boolean)
    .join("-")
    .replace(/\s+/g, "-");
  urls.push(`http://library.rvusa.com/brochure/${brochureName}.pdf`);

  return [...new Set(urls)].slice(0, MAX_URLS);
}

function parseWeight(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < WEIGHT_MIN || n > WEIGHT_MAX) return undefined;
  return Math.round(n);
}

function parseGal(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(String(raw).replace(/,/g, ""));
  if (!Number.isFinite(n) || n < GAL_MIN || n > GAL_MAX) return undefined;
  return n;
}

function firstMatch(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1];
}

/** Parse a spec HTML page. Dry weight fills UVW when UVW is absent. */
export function parseSpecFieldHtml(
  html: string,
  url: string,
): SpecFieldScrapeHit | null {
  const text = String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/g, " ")
    .replace(/\s+/g, " ");
  if (text.length < 40) return null;

  const uvwLbs = parseWeight(
    firstMatch(
      text,
      /(?:uvw|unloaded\s+vehicle\s+weight)\s*[:|.]?\s*([\d,]{3,7})/i,
    ),
  );
  const dryLbs = parseWeight(
    firstMatch(text, /dry\s*weight\s*[:|.]?\s*([\d,]{3,7})/i),
  );
  const gvwrLbs = parseWeight(
    firstMatch(text, /gvwr\s*[:|.]?\s*([\d,]{3,7})/i),
  );
  const payloadLbs = parseWeight(
    firstMatch(
      text,
      /(?:payload|ccc|occc|ncc|cargo\s+carrying\s+capacity)\s*[:|.]?\s*([\d,]{3,7})/i,
    ),
  );
  const fuelCapacityGal = parseGal(
    firstMatch(
      text,
      /fuel(?:\s*(?:capacity|tank))?\s*[:|.]?\s*([\d.]+)\s*(?:gal(?:lons?)?)?/i,
    ),
  );
  const freshWaterGal = parseGal(
    firstMatch(text, /fresh(?:\s*water)?\s*[:|.]?\s*([\d.]+)/i),
  );
  const grayWaterGal = parseGal(
    firstMatch(text, /gr[ae]y(?:\s*water)?\s*[:|.]?\s*([\d.]+)/i),
  );
  const blackWaterGal = parseGal(
    firstMatch(text, /black(?:\s*water)?\s*[:|.]?\s*([\d.]+)/i),
  );

  const resolvedUvw = uvwLbs ?? dryLbs;
  const uvwIsDryWeight = uvwLbs == null && dryLbs != null;
  if (resolvedUvw != null && gvwrLbs != null && resolvedUvw === gvwrLbs) {
    return null;
  }

  const hit: SpecFieldScrapeHit = {
    ...(resolvedUvw != null ? { uvwLbs: resolvedUvw, uvwIsDryWeight } : {}),
    ...(payloadLbs != null ? { payloadLbs } : {}),
    ...(fuelCapacityGal != null ? { fuelCapacityGal } : {}),
    ...(freshWaterGal != null ? { freshWaterGal } : {}),
    ...(grayWaterGal != null ? { grayWaterGal } : {}),
    ...(blackWaterGal != null ? { blackWaterGal } : {}),
    ...(gvwrLbs != null ? { gvwrLbs } : {}),
    sourceUrl: url,
    sourceHost: hostOf(url),
  };

  if (
    hit.uvwLbs == null &&
    hit.gvwrLbs == null &&
    hit.fuelCapacityGal == null &&
    hit.freshWaterGal == null &&
    hit.grayWaterGal == null &&
    hit.blackWaterGal == null
  ) {
    return null;
  }
  return hit;
}

function hitFills(
  hit: SpecFieldScrapeHit,
  missing: readonly SpecFieldName[],
): boolean {
  return missing.some((field) => {
    if (field === "uvw") return hit.uvwLbs != null && hit.uvwLbs > 0;
    if (field === "gvwr") return hit.gvwrLbs != null && hit.gvwrLbs > 0;
    if (field === "fuel")
      return hit.fuelCapacityGal != null && hit.fuelCapacityGal > 0;
    return (
      (hit.freshWaterGal != null && hit.freshWaterGal > 0) ||
      (hit.grayWaterGal != null && hit.grayWaterGal > 0) ||
      (hit.blackWaterGal != null && hit.blackWaterGal > 0)
    );
  });
}

function mergeHits(
  into: SpecFieldScrapeHit,
  add: SpecFieldScrapeHit,
): SpecFieldScrapeHit {
  return {
    uvwLbs: into.uvwLbs ?? add.uvwLbs,
    uvwIsDryWeight:
      into.uvwLbs != null ? into.uvwIsDryWeight : add.uvwIsDryWeight,
    payloadLbs: into.payloadLbs ?? add.payloadLbs,
    fuelCapacityGal: into.fuelCapacityGal ?? add.fuelCapacityGal,
    freshWaterGal: into.freshWaterGal ?? add.freshWaterGal,
    grayWaterGal: into.grayWaterGal ?? add.grayWaterGal,
    blackWaterGal: into.blackWaterGal ?? add.blackWaterGal,
    gvwrLbs: into.gvwrLbs ?? add.gvwrLbs,
    sourceUrl: into.uvwLbs != null ? into.sourceUrl : add.sourceUrl,
    sourceHost: into.uvwLbs != null ? into.sourceHost : add.sourceHost,
  };
}

function missingStillOpen(
  hit: SpecFieldScrapeHit | null,
  missing: readonly SpecFieldName[],
): SpecFieldName[] {
  if (!hit) return [...missing];
  return missing.filter((field) => !hitFills(hit, [field]));
}

async function defaultFetch(
  url: string,
  init?: { signal?: AbortSignal },
): Promise<{
  ok: boolean;
  url: string;
  text: string;
  contentType: string;
}> {
  const resp = await fetch(url, {
    method: "GET",
    redirect: "follow",
    signal: init?.signal,
    headers: {
      Accept: "text/html,application/xhtml+xml,text/plain;q=0.9",
      "User-Agent": "RvFAX-spec-field/1.0",
    },
  });
  const contentType = resp.headers.get("content-type") || "";
  if (!resp.ok) {
    return { ok: false, url: resp.url || url, text: "", contentType };
  }
  if (/pdf|octet-stream/i.test(contentType) && !/html|text\//i.test(contentType)) {
    return { ok: false, url: resp.url || url, text: "", contentType };
  }
  const text = await resp.text();
  return { ok: true, url: resp.url || url, text, contentType };
}

export async function scrapeEmptySpecFields(opts: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  rvType?: string | null;
  missing: readonly SpecFieldName[];
  fetch?: SpecFieldScrapeFetch;
  timeoutMs?: number;
}): Promise<SpecFieldScrapeHit | null> {
  const missing = opts.missing.filter(Boolean);
  if (!missing.length) return null;
  if (!opts.fetch && process.env.NODE_TEST_CONTEXT) return null;

  const urls = specFieldScrapeUrls(opts);
  if (!urls.length) return null;

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const run = opts.fetch ?? defaultFetch;
  let merged: SpecFieldScrapeHit | null = null;

  for (const url of urls) {
    if (!missingStillOpen(merged, missing).length) break;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await run(url, { signal: ctrl.signal });
      if (!res.ok || !res.text) continue;
      const parsed = parseSpecFieldHtml(res.text, res.url || url);
      if (!parsed || !hitFills(parsed, missing)) continue;
      merged = merged ? mergeHits(merged, parsed) : parsed;
    } catch {
      /* next URL */
    } finally {
      clearTimeout(timer);
    }
  }
  return merged;
}

export function specFieldScrapeNote(hit: SpecFieldScrapeHit): string {
  const dry = hit.uvwIsDryWeight
    ? "dry weight used as UVW"
    : hit.uvwLbs != null
      ? "UVW"
      : "spec fields";
  return `Spec scrape (${hit.sourceHost}) ${dry} · ${hit.sourceUrl}`;
}
