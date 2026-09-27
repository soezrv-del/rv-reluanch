/**
 * Plain-text share for the Facts report and an open lot unit.
 * Only values the caller marks as on screen are included.
 */

import {
  lotLookupRows,
  lotPriceOrGap,
  lotUnitPhoto,
  shortLotTypeLabel,
  type LotUnit,
} from "../lot/ownLotPage.ts";

export type ShareLine = {
  label: string;
  value: string | null | undefined;
};

export type ShareDocument = {
  title: string;
  text: string;
  url: string;
};

export type FactsShareSelection = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
};

export type FactsShareInput = {
  year: string;
  make: string;
  model: string;
  floorplan?: string | null;
  className?: string | null;
  rating?: string | null;
  specsOpen: boolean;
  /** Hero tiles. Used when the spec sheet is not on screen. */
  overview: ShareLine[];
  /** Vehicle specification rows, in on-screen order. */
  specs: ShareLine[];
  powerToWeight?: ShareLine | null;
  origin?: string;
};

export type ShareOutcome = "shared" | "copied" | "cancelled";

export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
};

export type ShareEnv = {
  share?: (data: SharePayload) => Promise<void>;
  canShare?: (data: SharePayload) => boolean;
  writeText?: (text: string) => Promise<void>;
  fetch?: typeof fetch;
  photoTimeoutMs?: number;
};

const DEFAULT_ORIGIN = "https://rvmax.app";
const PHOTO_TIMEOUT_MS = 1500;

const capturedBootSearch =
  typeof globalThis !== "undefined" &&
  typeof (globalThis as { location?: { search?: string } }).location?.search ===
    "string"
    ? (globalThis as { location: { search: string } }).location.search
    : "";

/** Query string from the first page load, before the router rewrites it. */
export function bootSearchQuery(): string {
  return capturedBootSearch;
}

const BACK_OFFICE_LABELS = new Set([
  "scrapedat",
  "id",
  "detailfetched",
  "imagecount",
  "lotcode",
  "receiveddate",
  "locationphone",
  "onspecial",
  "paintswatchfilename",
  "paintswatch",
]);

/** Blank, dash, GAP, and loading placeholders are not facts on screen. */
export function shareableDisplayValue(
  value: string | null | undefined,
): string | null {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (
    /^(?:—|-|–|gap|n\/?a|tbd|unknown|none|null|checking…|checking\.\.\.|\.\.\.)$/i.test(
      text,
    )
  ) {
    return null;
  }
  if (/^sticker lbs$/i.test(text)) return null;
  return text;
}

export function isBackOfficeShareLabel(label: string): boolean {
  const key = label.toLowerCase().replace(/[^a-z0-9]/g, "");
  return BACK_OFFICE_LABELS.has(key);
}

export function shareLines(
  rows: ShareLine[],
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  const out: Array<{ label: string; value: string }> = [];
  for (const row of rows) {
    const label = String(row.label ?? "").replace(/\s+/g, " ").trim();
    if (!label || isBackOfficeShareLabel(label)) continue;
    const value = shareableDisplayValue(row.value);
    if (!value) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ label, value });
  }
  return out;
}

export function shareTitle(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => shareableDisplayValue(part) ?? "")
    .filter(Boolean)
    .join(" ");
}

export function buildShareDocument(opts: {
  title: string;
  lines: ShareLine[];
  url: string;
}): ShareDocument {
  const title = shareTitle([opts.title]) || opts.title.trim();
  const body = [
    title,
    ...shareLines(opts.lines).map((row) => `${row.label}: ${row.value}`),
  ]
    .filter(Boolean)
    .join("\n");
  const url = opts.url.trim();
  const text = url ? `${body}\n\n${url}` : body;
  return { title, text, url };
}

export function encodeFactsShareParam(sel: FactsShareSelection): string {
  return JSON.stringify({
    year: sel.year.trim(),
    make: sel.make.trim(),
    model: sel.model.trim(),
    floorplan: sel.floorplan.trim(),
  });
}

export function parseFactsShareParam(
  raw: string | null | undefined,
): FactsShareSelection | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const year = String(parsed.year ?? "").trim();
    const make = String(parsed.make ?? "").trim();
    const model = String(parsed.model ?? "").trim();
    const floorplan = String(parsed.floorplan ?? "").trim();
    if (!year || !make || !model) return null;
    return { year, make, model, floorplan };
  } catch {
    return null;
  }
}

export function readFactsShareSearch(
  search: string,
): FactsShareSelection | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  return parseFactsShareParam(params.get("facts"));
}

export function factsShareUrl(
  sel: FactsShareSelection,
  origin = DEFAULT_ORIGIN,
): string {
  const url = new URL("/", origin || DEFAULT_ORIGIN);
  url.searchParams.set("facts", encodeFactsShareParam(sel));
  return url.toString();
}

export function readLotUnitParam(search: string): string | null {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const id = (params.get("unit") || "").trim();
  return id || null;
}

export function lotShareUnitId(
  unit: Pick<LotUnit, "stock_number" | "vin">,
): string {
  const stock = shareableDisplayValue(unit.stock_number);
  if (stock) return stock;
  return shareableDisplayValue(unit.vin) ?? "";
}

export function lotUnitMatchesShareId(
  unit: Pick<LotUnit, "stock_number" | "vin">,
  id: string,
): boolean {
  const want = id.trim().toLowerCase();
  if (!want) return false;
  const stock = (unit.stock_number || "").trim().toLowerCase();
  const vin = (unit.vin || "").trim().toLowerCase();
  return stock === want || vin === want;
}

export function lotShareUrl(unitId: string, origin = DEFAULT_ORIGIN): string {
  const url = new URL("/lot", origin || DEFAULT_ORIGIN);
  url.searchParams.set("unit", unitId.trim());
  return url.toString();
}

export function buildFactsShare(input: FactsShareInput): ShareDocument {
  const floorplan = String(input.floorplan ?? "").trim();
  const selection: FactsShareSelection = {
    year: input.year.trim(),
    make: input.make.trim(),
    model: input.model.trim(),
    floorplan,
  };
  const lines: ShareLine[] = [
    { label: "Class", value: input.className },
    { label: "RvFOX rating", value: input.rating },
    ...(input.specsOpen ? input.specs : input.overview),
  ];
  if (input.powerToWeight) lines.push(input.powerToWeight);
  return buildShareDocument({
    title: shareTitle([
      selection.year,
      selection.make,
      selection.model,
      selection.floorplan,
    ]),
    lines,
    url: factsShareUrl(selection, input.origin || shareOrigin()),
  });
}

export function buildLotUnitShare(
  unit: LotUnit,
  origin = shareOrigin(),
): ShareDocument {
  const id = lotShareUnitId(unit);
  const lines: ShareLine[] = [
    { label: "Type", value: shortLotTypeLabel(unit.body_type) },
    { label: "Price", value: lotPriceOrGap(unit.price) },
    { label: "Stock", value: unit.stock_number },
    { label: "Location", value: unit.location },
    { label: "Condition", value: unit.condition },
    { label: "VIN", value: unit.vin },
    ...lotLookupRows(unit).map((row) => ({
      label: row.label,
      value: row.value,
    })),
  ];
  return buildShareDocument({
    title: shareTitle([unit.year, unit.make, unit.model, unit.trim]),
    lines,
    url: id ? lotShareUrl(id, origin) : new URL("/lot", origin || DEFAULT_ORIGIN).toString(),
  });
}

/**
 * On-screen weight row. A series sentence such as
 * "18,000 lbs · smallest in series · confirm sticker" stays intact.
 * The empty "Sticker lbs" placeholder is not a spec.
 */
export function weightShareValue(opts: {
  overrideLbs?: number | null;
  catalogValue?: string | null;
  seriesEstimate?: boolean;
  estimatedLbs?: number | null;
}): string | null {
  if (opts.overrideLbs != null && opts.overrideLbs > 0) {
    return `${Math.round(opts.overrideLbs).toLocaleString("en-US")} lbs · Override`;
  }
  if (opts.seriesEstimate) return shareableDisplayValue(opts.catalogValue);
  const catalog = shareableDisplayValue(opts.catalogValue);
  if (catalog) return catalog;
  if (opts.estimatedLbs != null && opts.estimatedLbs > 0) {
    return `${Math.round(opts.estimatedLbs).toLocaleString("en-US")} lbs`;
  }
  return null;
}

export function shareOrigin(fallback = DEFAULT_ORIGIN): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return fallback;
}

export function lotUnitSharePhoto(unit: LotUnit): string | null {
  return lotUnitPhoto(unit);
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err != null &&
    "name" in err &&
    (err as { name?: string }).name === "AbortError"
  );
}

function defaultEnv(): ShareEnv {
  const nav =
    typeof navigator !== "undefined"
      ? navigator
      : undefined;
  return {
    share:
      nav && typeof nav.share === "function"
        ? (data) => nav.share(data as ShareData)
        : undefined,
    canShare:
      nav && typeof nav.canShare === "function"
        ? (data) => nav.canShare(data as ShareData)
        : undefined,
    writeText:
      nav?.clipboard && typeof nav.clipboard.writeText === "function"
        ? (text) => nav.clipboard.writeText(text)
        : undefined,
    fetch: typeof fetch === "function" ? fetch : undefined,
    photoTimeoutMs: PHOTO_TIMEOUT_MS,
  };
}

async function loadPhotoFile(
  url: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<File | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { signal: ctrl.signal });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith("image/")) return null;
    const ext = blob.type.includes("png")
      ? "png"
      : blob.type.includes("webp")
        ? "webp"
        : "jpg";
    return new File([blob], `lot-unit.${ext}`, { type: blob.type });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Never waits longer than the photo timeout, even if fetch ignores abort. */
async function photoFileOrNull(
  url: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<File | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), timeoutMs);
  });
  try {
    return await Promise.race([
      loadPhotoFile(url, fetchImpl, timeoutMs),
      timeout,
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function shareBody(text: string, url: string): string {
  const plain = text.trim();
  const link = url.trim();
  if (link && plain.endsWith(link)) {
    return plain.slice(0, -link.length).trim();
  }
  return plain;
}

/**
 * Web Share sheet when the browser has it. Otherwise copy the same
 * plain text (summary plus link). Cancelling the sheet is not an error.
 * A lot photo is attached only when canShare accepts the file. Fetch
 * failures and a short timeout fall through to text and the link.
 */
export async function shareScreen(
  doc: ShareDocument & { photoUrl?: string | null },
  env: ShareEnv = defaultEnv(),
): Promise<ShareOutcome> {
  const text = doc.text.trim();
  const url = doc.url.trim();
  const title = doc.title.trim();
  const timeoutMs = env.photoTimeoutMs ?? PHOTO_TIMEOUT_MS;
  let files: File[] | undefined;

  const photoUrl = doc.photoUrl?.trim();
  if (photoUrl && env.canShare && env.fetch) {
    const file = await photoFileOrNull(photoUrl, env.fetch, timeoutMs);
    if (file) {
      try {
        if (env.canShare({ files: [file] })) files = [file];
      } catch {
        files = undefined;
      }
    }
  }

  if (env.share) {
    const payload: SharePayload = {
      title,
      text: shareBody(text, url),
      url,
      ...(files ? { files } : {}),
    };
    try {
      await env.share(payload);
      return "shared";
    } catch (err) {
      if (isAbortError(err)) return "cancelled";
      if (files) {
        try {
          await env.share({ title, text: shareBody(text, url), url });
          return "shared";
        } catch (retryErr) {
          if (isAbortError(retryErr)) return "cancelled";
        }
      }
    }
  }

  if (env.writeText) {
    await env.writeText(text);
    return "copied";
  }
  throw new Error("Share is unavailable");
}
