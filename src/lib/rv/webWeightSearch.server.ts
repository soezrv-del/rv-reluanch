/**
 * Server-only Facts weight search.
 * Google Programmable Search when GOOGLE_CSE_KEY + GOOGLE_CSE_ID are set,
 * otherwise Serper when SERPER_API_KEY is set. No key and no dev fixture
 * is a no-op — the field stays GAP. Never writes the catalog.
 */

import {
  credibleWeightsFromHits,
  isRecordedAspire44R,
  RECORDED_ASPIRE_44R_HITS,
  WEB_WEIGHT_FIELDS,
  type CoachWeightClass,
  type SearchHit,
  type WebWeightField,
  type WebWeightFill,
} from "./webWeightFill.ts";

export const WEB_WEIGHT_TIMEOUT_MS = 3_000;
export const WEB_WEIGHT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export type WebWeightSearchRequest = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  coachType: CoachWeightClass;
  fields: readonly WebWeightField[];
  gvwrLbs?: number | null;
};

export type WebWeightSearchEnv = {
  GOOGLE_CSE_KEY?: string;
  GOOGLE_CSE_ID?: string;
  SERPER_API_KEY?: string;
  WEB_WEIGHT_FIXTURE?: string;
  NODE_ENV?: string;
};

export type WebWeightSearchResult = {
  ok: true;
  fills: WebWeightFill[];
  skipped?: "no-key";
};

type CacheSlot = { at: number; fill: WebWeightFill | null };

const memoryCache = new Map<string, CacheSlot>();

export function clearWebWeightSearchCache(): void {
  memoryCache.clear();
}

function readEnv(env?: WebWeightSearchEnv): WebWeightSearchEnv {
  return {
    GOOGLE_CSE_KEY: env?.GOOGLE_CSE_KEY ?? process.env.GOOGLE_CSE_KEY,
    GOOGLE_CSE_ID: env?.GOOGLE_CSE_ID ?? process.env.GOOGLE_CSE_ID,
    SERPER_API_KEY: env?.SERPER_API_KEY ?? process.env.SERPER_API_KEY,
    WEB_WEIGHT_FIXTURE: env?.WEB_WEIGHT_FIXTURE ?? process.env.WEB_WEIGHT_FIXTURE,
    NODE_ENV: env?.NODE_ENV ?? process.env.NODE_ENV,
  };
}

export function webWeightFixtureEnabled(env?: WebWeightSearchEnv): boolean {
  const resolved = readEnv(env);
  return resolved.WEB_WEIGHT_FIXTURE === "1" && resolved.NODE_ENV !== "production";
}

export function webWeightProvider(env?: WebWeightSearchEnv): "google" | "serper" | "none" {
  const resolved = readEnv(env);
  const google = Boolean(resolved.GOOGLE_CSE_KEY?.trim() && resolved.GOOGLE_CSE_ID?.trim());
  if (google) return "google";
  if (resolved.SERPER_API_KEY?.trim()) return "serper";
  return "none";
}

function cacheKey(req: WebWeightSearchRequest, field: WebWeightField, mode: string): string {
  const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return [
    mode,
    String(req.year || "").trim(),
    norm(req.make),
    norm(req.model),
    norm(req.floorplan),
    field,
  ].join("|");
}

function knownFields(fields: readonly WebWeightField[]): WebWeightField[] {
  return fields.filter((field) => WEB_WEIGHT_FIELDS.includes(field));
}

async function fetchGoogleHits(
  query: string,
  env: WebWeightSearchEnv,
  fetchImpl: typeof fetch,
  signal: AbortSignal,
): Promise<SearchHit[]> {
  const url = new URL("https://www.googleapis.com/customsearch/v1");
  url.searchParams.set("key", env.GOOGLE_CSE_KEY!.trim());
  url.searchParams.set("cx", env.GOOGLE_CSE_ID!.trim());
  url.searchParams.set("q", query);
  url.searchParams.set("num", "5");
  const resp = await fetchImpl(url, { signal, headers: { Accept: "application/json" } });
  if (!resp.ok) throw new Error(`google cse ${resp.status}`);
  const json = (await resp.json()) as {
    items?: Array<{ title?: string; snippet?: string; link?: string }>;
  };
  return (json.items || [])
    .map((item) => ({
      title: item.title || "",
      snippet: item.snippet || "",
      url: item.link || "",
    }))
    .filter((hit) => hit.url);
}

async function fetchSerperHits(
  query: string,
  env: WebWeightSearchEnv,
  fetchImpl: typeof fetch,
  signal: AbortSignal,
): Promise<SearchHit[]> {
  const resp = await fetchImpl("https://google.serper.dev/search", {
    method: "POST",
    signal,
    headers: {
      "X-API-KEY": env.SERPER_API_KEY!.trim(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ q: query, num: 5 }),
  });
  if (!resp.ok) throw new Error(`serper ${resp.status}`);
  const json = (await resp.json()) as {
    organic?: Array<{ title?: string; snippet?: string; link?: string }>;
  };
  return (json.organic || [])
    .map((item) => ({
      title: item.title || "",
      snippet: item.snippet || "",
      url: item.link || "",
    }))
    .filter((hit) => hit.url);
}

function searchQuery(req: WebWeightSearchRequest): string {
  return [
    req.year,
    req.make,
    req.model,
    req.floorplan,
    'UVW "dry weight" "unloaded" weighed "CAT scale" GVWR GCWR "hitch weight" "pin weight" CCC',
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function resolveWebWeightSearch(
  req: WebWeightSearchRequest,
  deps?: {
    fetch?: typeof fetch;
    env?: WebWeightSearchEnv;
    now?: number;
    timeoutMs?: number;
    cache?: Map<string, CacheSlot>;
  },
): Promise<WebWeightSearchResult> {
  const fields = knownFields(req.fields);
  if (!fields.length) return { ok: true, fills: [] };

  const env = readEnv(deps?.env);
  const provider = webWeightProvider(env);
  const fixture =
    provider === "none" &&
    webWeightFixtureEnabled(env) &&
    isRecordedAspire44R(req);
  if (provider === "none" && !fixture) {
    return { ok: true, fills: [], skipped: "no-key" };
  }

  const mode = fixture ? "fixture" : provider;
  const cache = deps?.cache ?? memoryCache;
  const now = deps?.now ?? Date.now();
  const cached: WebWeightFill[] = [];
  const missing: WebWeightField[] = [];
  for (const field of fields) {
    const slot = cache.get(cacheKey(req, field, mode));
    if (slot && now - slot.at < WEB_WEIGHT_CACHE_TTL_MS) {
      if (slot.fill) cached.push(slot.fill);
    } else {
      missing.push(field);
    }
  }
  if (!missing.length) return { ok: true, fills: cached };

  const timeoutMs = deps?.timeoutMs ?? WEB_WEIGHT_TIMEOUT_MS;
  const fetchImpl = deps?.fetch ?? fetch;
  let hits: SearchHit[] = [];
  let searched = false;
  if (fixture) {
    hits = [...RECORDED_ASPIRE_44R_HITS];
    searched = true;
  } else {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const query = searchQuery(req);
      if (provider === "google") {
        try {
          hits = await fetchGoogleHits(query, env, fetchImpl, ctrl.signal);
          searched = true;
        } catch {
          if (env.SERPER_API_KEY?.trim() && !ctrl.signal.aborted) {
            hits = await fetchSerperHits(query, env, fetchImpl, ctrl.signal);
            searched = true;
          }
        }
      } else {
        hits = await fetchSerperHits(query, env, fetchImpl, ctrl.signal);
        searched = true;
      }
    } catch {
      searched = false;
    } finally {
      clearTimeout(timer);
    }
  }

  if (!searched) return { ok: true, fills: cached };

  const parsed = credibleWeightsFromHits(hits, {
    year: req.year,
    make: req.make,
    model: req.model,
    floorplan: req.floorplan,
    coachType: req.coachType,
    gvwrLbs: req.gvwrLbs,
    fields: missing,
  });
  for (const field of missing) {
    const fill = parsed.find((row) => row.field === field) ?? null;
    cache.set(cacheKey(req, field, mode), { at: now, fill });
  }
  return { ok: true, fills: [...cached, ...parsed] };
}
