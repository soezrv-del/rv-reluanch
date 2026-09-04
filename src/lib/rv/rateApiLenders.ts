/**
 * RateAPI live credit-union RV rates behind GET /api/lenders.
 *
 * Free tier is 20 requests / 30 days — cache hard by state (not by amount,
 * credit, or exact term). Preferred term is applied locally after the fetch.
 * Missing key, no ZIP/state, errors, 429s, and empty payloads fall back to
 * the curated catalog. Never invent live rates.
 */

import {
  badgeLowestApr,
  buildLendersResponse,
  monthlyPayment,
  normalizeLendersQuery,
  sortLenderQuotes,
  type CreditBand,
  type LenderQuote,
  type LendersLookupQuery,
  type LendersLookupResponse,
} from "./lendersCatalog.ts";

export const RATEAPI_BASE = "https://api.rateapi.dev";
export const RATEAPI_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
export const RATEAPI_EMPTY_TTL_MS = 6 * 60 * 60 * 1000;
export const RATEAPI_RATE_LIMIT_TTL_MS = 12 * 60 * 60 * 1000;
export const RATEAPI_ERROR_TTL_MS = 30 * 60 * 1000;
export const RATEAPI_FETCH_TIMEOUT_MS = 8_000;
export const RATEAPI_MAX_QUOTES = 15;
/** Snap requested terms onto RvCal presets so cache keys stay few. */
export const RATEAPI_TERM_BUCKETS = [84, 120, 144, 180, 240] as const;

export const CU_PUBLISHED_RATE_NOTE =
  "Credit union published rate — membership/credit still apply";

export type RateApiRow = {
  lender?: unknown;
  state?: unknown;
  product_type?: unknown;
  product_name?: unknown;
  display_name?: unknown;
  rate?: unknown;
  apr?: unknown;
  term_months?: unknown;
  as_of?: unknown;
  url?: unknown;
};

export type RateApiPayload = {
  rates: RateApiRow[];
  as_of?: string | null;
};

type CacheOk = {
  ok: true;
  fetchedAt: number;
  expires: number;
  payload: RateApiPayload;
};

type CacheFail = {
  ok: false;
  fetchedAt: number;
  expires: number;
  reason: string;
};

type CacheEntry = CacheOk | CacheFail;

const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<RateApiPayload | null>>();

export function snapPreferredTerm(termMonths: number | null): number {
  const target = termMonths != null && termMonths > 0 ? termMonths : 180;
  let best: (typeof RATEAPI_TERM_BUCKETS)[number] = 180;
  let dist = Math.abs(target - best);
  for (const t of RATEAPI_TERM_BUCKETS) {
    const d = Math.abs(target - t);
    if (d < dist) {
      best = t;
      dist = d;
    }
  }
  return best;
}

export function rateApiCacheKey(state: string, termMonths: number): string {
  return `rv:${state.toUpperCase()}:${termMonths}`;
}

export function clearRateApiCache(): void {
  cache.clear();
  inflight.clear();
}

export function rateApiCacheStats(): { size: number; inflight: number } {
  return { size: cache.size, inflight: inflight.size };
}

export function readRateApiKey(
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const key = env.RATEAPI_API_KEY?.trim();
  return key ? key : null;
}

function cacheGet(key: string, now: number): CacheEntry | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (now > hit.expires) {
    cache.delete(key);
    return null;
  }
  return hit;
}

function cacheSet(key: string, entry: CacheEntry): void {
  cache.delete(key);
  cache.set(key, entry);
}

export function seedRateApiCache(
  state: string,
  payload: RateApiPayload,
  now = Date.now(),
  ttlMs = RATEAPI_CACHE_TTL_MS,
  termMonths = 180,
): void {
  cacheSet(rateApiCacheKey(state, termMonths), {
    ok: true,
    fetchedAt: now,
    expires: now + ttlMs,
    payload,
  });
}

function slugId(name: string, state: string, term: number): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `rateapi-${slug || "cu"}-${state.toLowerCase()}-${term}`;
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

export function parseRateApiPayload(json: unknown): RateApiPayload | null {
  if (!json || typeof json !== "object") return null;
  const rec = json as { rates?: unknown; as_of?: unknown };
  if (!Array.isArray(rec.rates)) return null;
  return {
    rates: rec.rates as RateApiRow[],
    as_of: asString(rec.as_of),
  };
}

export function rowApr(row: RateApiRow): number | null {
  const apr = asFiniteNumber(row.apr);
  if (apr != null && apr > 0 && apr < 40) return Math.round(apr * 1000) / 1000;
  const rate = asFiniteNumber(row.rate);
  if (rate != null && rate > 0 && rate < 40) return Math.round(rate * 1000) / 1000;
  return null;
}

export function pickPreferredRow(
  rows: RateApiRow[],
  preferredTerm: number | null,
): RateApiRow | null {
  if (rows.length === 0) return null;
  if (preferredTerm == null) {
    return [...rows].sort((a, b) => {
      const aa = rowApr(a) ?? 99;
      const ba = rowApr(b) ?? 99;
      return aa - ba;
    })[0] ?? null;
  }
  return [...rows].sort((a, b) => {
    const at = asFiniteNumber(a.term_months) ?? preferredTerm;
    const bt = asFiniteNumber(b.term_months) ?? preferredTerm;
    const ad = Math.abs(at - preferredTerm);
    const bd = Math.abs(bt - preferredTerm);
    if (ad !== bd) return ad - bd;
    return (rowApr(a) ?? 99) - (rowApr(b) ?? 99);
  })[0] ?? null;
}

export function mapRateApiRowsToQuotes(
  payload: RateApiPayload,
  opts: {
    amount: number | null;
    termMonths: number | null;
    credit: CreditBand;
    state: string;
  },
): LenderQuote[] {
  const byLender = new Map<string, RateApiRow[]>();
  for (const row of payload.rates) {
    const name = asString(row.lender);
    const apr = rowApr(row);
    if (!name || apr == null) continue;
    const key = name.toLowerCase();
    const list = byLender.get(key);
    if (list) list.push(row);
    else byLender.set(key, [row]);
  }

  const quotes: LenderQuote[] = [];
  for (const rows of byLender.values()) {
    const row = pickPreferredRow(rows, opts.termMonths);
    if (!row) continue;
    const name = asString(row.lender);
    const apr = rowApr(row);
    if (!name || apr == null) continue;
    const termUsed = Math.max(
      1,
      Math.round(asFiniteNumber(row.term_months) ?? opts.termMonths ?? 180),
    );
    const url = asString(row.url) ?? "";
    const asOf = asString(row.as_of) ?? payload.as_of ?? undefined;
    const estimatedMonthly =
      opts.amount != null
        ? monthlyPayment(opts.amount, apr, termUsed)
        : null;

    quotes.push({
      id: slugId(name, opts.state, termUsed),
      name,
      aprLow: apr,
      aprHigh: apr,
      termMin: termUsed,
      termMax: termUsed,
      minLoan: 0,
      minBand: "fair",
      perks: [CU_PUBLISHED_RATE_NOTE],
      badge: "high",
      url,
      estimatedApr: apr,
      estimatedMonthly,
      termUsed,
      eligible: true,
      asOf,
      rateNote: CU_PUBLISHED_RATE_NOTE,
    });
  }

  return badgeLowestApr(sortLenderQuotes(quotes)).slice(0, RATEAPI_MAX_QUOTES);
}

function payloadAsOf(payload: RateApiPayload): string {
  if (payload.as_of) return payload.as_of;
  let latest = "";
  for (const row of payload.rates) {
    const asOf = asString(row.as_of);
    if (asOf && asOf > latest) latest = asOf;
  }
  return latest || new Date().toISOString().slice(0, 10);
}

export function buildRateApiResponse(
  query: LendersLookupQuery,
  payload: RateApiPayload,
  opts?: { cached?: boolean },
): LendersLookupResponse | null {
  const normalized = normalizeLendersQuery(query);
  if (!normalized.state) return null;
  const lenders = mapRateApiRowsToQuotes(payload, {
    amount: normalized.amount,
    termMonths: normalized.termMonths,
    credit: normalized.credit,
    state: normalized.state,
  });
  if (lenders.length === 0) return null;

  return {
    source: "rateapi",
    asOf: payloadAsOf(payload),
    cached: Boolean(opts?.cached),
    disclaimer:
      `Live credit-union RV rates from RateAPI for ${normalized.state}. Not a loan offer or prequalification. ${CU_PUBLISHED_RATE_NOTE}. Confirm the current rate with the credit union.`,
    query: normalized,
    lenders,
  };
}

export type RateApiFetch = (
  url: string,
  init: RequestInit,
) => Promise<Pick<Response, "ok" | "status" | "json">>;

async function fetchRateApiPayload(opts: {
  apiKey: string;
  state: string;
  termMonths: number;
  fetchImpl: RateApiFetch;
  timeoutMs: number;
}): Promise<{ payload: RateApiPayload | null; status: number; reason: string }> {
  const url = new URL(`${RATEAPI_BASE}/v1/rates`);
  url.searchParams.set("product_type", "rv");
  url.searchParams.set("state", opts.state);
  url.searchParams.set("term_months", String(opts.termMonths));
  url.searchParams.set("sort", "apr_asc");
  url.searchParams.set("limit", "100");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs);
  try {
    const res = await opts.fetchImpl(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        Accept: "application/json",
      },
      signal: ctrl.signal,
    });
    if (res.status === 429) {
      return { payload: null, status: 429, reason: "rate_limited" };
    }
    if (!res.ok) {
      return { payload: null, status: res.status, reason: `http_${res.status}` };
    }
    const parsed = parseRateApiPayload(await res.json());
    if (!parsed) {
      return { payload: null, status: res.status, reason: "bad_payload" };
    }
    if (parsed.rates.length === 0) {
      return { payload: parsed, status: res.status, reason: "empty" };
    }
    return { payload: parsed, status: res.status, reason: "ok" };
  } catch (err) {
    const aborted =
      err instanceof Error && (err.name === "AbortError" || /abort/i.test(err.message));
    return {
      payload: null,
      status: 0,
      reason: aborted ? "timeout" : "network",
    };
  } finally {
    clearTimeout(timer);
  }
}

function failTtl(reason: string): number {
  if (reason === "rate_limited") return RATEAPI_RATE_LIMIT_TTL_MS;
  if (reason === "empty") return RATEAPI_EMPTY_TTL_MS;
  return RATEAPI_ERROR_TTL_MS;
}

/**
 * One RateAPI call per state + snapped term, cached 24h. Amount and credit
 * never appear in the cache key — they are applied locally after the fetch.
 */
async function loadRateApiPayload(opts: {
  apiKey: string;
  state: string;
  termMonths: number;
  fetchImpl: RateApiFetch;
  now: number;
}): Promise<{ payload: RateApiPayload | null; cached: boolean }> {
  const key = rateApiCacheKey(opts.state, opts.termMonths);
  const hit = cacheGet(key, opts.now);
  if (hit) {
    return { payload: hit.ok ? hit.payload : null, cached: true };
  }

  const existing = inflight.get(key);
  if (existing) {
    const payload = await existing;
    return { payload, cached: false };
  }

  const pending = (async () => {
    const result = await fetchRateApiPayload({
      apiKey: opts.apiKey,
      state: opts.state,
      termMonths: opts.termMonths,
      fetchImpl: opts.fetchImpl,
      timeoutMs: RATEAPI_FETCH_TIMEOUT_MS,
    });

    const now = Date.now();
    if (result.payload && result.payload.rates.length > 0) {
      cacheSet(key, {
        ok: true,
        fetchedAt: now,
        expires: now + RATEAPI_CACHE_TTL_MS,
        payload: result.payload,
      });
      return result.payload;
    }

    cacheSet(key, {
      ok: false,
      fetchedAt: now,
      expires: now + failTtl(result.reason),
      reason: result.reason,
    });
    return null;
  })().finally(() => {
    inflight.delete(key);
  });

  inflight.set(key, pending);
  const payload = await pending;
  return { payload, cached: false };
}

export type ResolveLendersOptions = {
  apiKey?: string | null;
  fetchImpl?: RateApiFetch;
  now?: number;
  env?: NodeJS.ProcessEnv;
};

export async function resolveLendersResponse(
  query: LendersLookupQuery,
  options: ResolveLendersOptions = {},
): Promise<LendersLookupResponse> {
  const curated = () => buildLendersResponse(query);
  const apiKey =
    options.apiKey !== undefined
      ? options.apiKey?.trim() || null
      : readRateApiKey(options.env ?? process.env);
  if (!apiKey) return curated();

  const normalized = normalizeLendersQuery(query);
  if (!normalized.state) return curated();

  try {
    const { payload, cached } = await loadRateApiPayload({
      apiKey,
      state: normalized.state,
      termMonths: snapPreferredTerm(normalized.termMonths),
      fetchImpl: options.fetchImpl ?? fetch,
      now: options.now ?? Date.now(),
    });
    if (!payload) return curated();
    return buildRateApiResponse(query, payload, { cached }) ?? curated();
  } catch {
    return curated();
  }
}
