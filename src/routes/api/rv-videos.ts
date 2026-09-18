import { createFileRoute } from "@tanstack/react-router";
import {
  buildRvVideoCoreQuery,
  buildRvVideoMakeModelQuery,
  buildRvVideoQuery,
  calmVideoLookupError,
  EMPTY_MATCH_MESSAGE,
  isRvVideoLibraryYear,
  matchRvVideos,
  MISSING_KEY_MESSAGE,
  RELATED_NOTE,
  RV_VIDEO_LIBRARY_CHANNEL_ID,
  RV_VIDEO_LIBRARY_URL,
  rvVideoTierSatisfied,
  youtubeWatchUrl,
  type RvVideoCoach,
  type RvVideoHit,
  type RvVideoYearTier,
  type RvVideosOk,
} from "@/lib/rv/rvVideos";

/**
 * GET /api/rv-videos?year=2023&make=Tiffin&model=Allegro%20Bus&floorplan=45OPP
 *
 * Opt-in only. Facts must never call this on report open.
 * Known model years before 2016 return empty — no YouTube call
 * (channel coverage is ~2016+). Unknown year is allowed through.
 * YouTube Data API v3 search.list scoped to the fixed @RVVideoLibrary
 * channelId UCaAH7nANvUhdPWN93uQ6mcA (David-confirmed). No handle resolve.
 *
 * Year-tier lookup (credit-tight — at most 3 searches, never per-year spam):
 * 1. Exact: year + make + model (+ optional series/floorplan)
 * 2. If no exact: core year + make + model, then one make+model search
 *    (no year) so title-year ±2–±3 can surface. Prefer closer years.
 * 3. If still none: accept title-year ±5 from those hits.
 * Make + model always required. Hard make-in-title + competing-make reject
 * at every tier — American Coach never wins for Liberty.
 *
 * Server-only key: process.env.YOUTUBE_API_KEY (Vercel Production + Preview).
 * Never VITE_ — that would leak the key to the client.
 * Read at request time so the vault/Vercel value is live, not baked at build.
 */

const YT_SEARCH = "https://www.googleapis.com/youtube/v3/search";
const CACHE_TTL_MS = 20 * 60 * 1000;
const MAX_RESULTS = 8;
const SHOW_RESULTS = 5;

const cache = new Map<string, { at: number; data: RvVideosOk }>();

function getKey(): string | null {
  const key = String(process.env.YOUTUBE_API_KEY ?? "").trim();
  return key || null;
}

function clean(v: string | null): string {
  return (v || "").trim().replace(/\s+/g, " ");
}

async function fetchJson(
  url: string,
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const resp = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    const text = await resp.text();
    let json: Record<string, unknown> = {};
    try {
      json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      json = {};
    }
    return { ok: resp.ok, status: resp.status, json };
  } finally {
    clearTimeout(timer);
  }
}

function pickThumb(snippet: Record<string, unknown>): string {
  const thumbs = snippet.thumbnails;
  if (!thumbs || typeof thumbs !== "object") return "";
  const t = thumbs as Record<string, { url?: unknown }>;
  for (const key of ["medium", "high", "default", "standard"]) {
    const url = t[key]?.url;
    if (typeof url === "string" && url) return url;
  }
  return "";
}

function mapItems(raw: unknown[]): RvVideoHit[] {
  const out: RvVideoHit[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const rec = row as {
      id?: { videoId?: unknown; kind?: unknown };
      snippet?: Record<string, unknown>;
    };
    const videoId = String(rec.id?.videoId || "").trim();
    const title = String(rec.snippet?.title || "").trim();
    if (!videoId || !title || seen.has(videoId)) continue;
    seen.add(videoId);
    out.push({
      videoId,
      title,
      thumbnailUrl: pickThumb(rec.snippet ?? {}),
      youtubeUrl: youtubeWatchUrl(videoId),
    });
  }
  return out;
}

async function searchChannel(apiKey: string, q: string): Promise<RvVideoHit[]> {
  const url = new URL(YT_SEARCH);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", RV_VIDEO_LIBRARY_CHANNEL_ID);
  url.searchParams.set("q", q);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(MAX_RESULTS));
  url.searchParams.set("key", apiKey);

  const { ok, json } = await fetchJson(url.toString());
  if (!ok) {
    const err = json.error;
    const msg =
      err && typeof err === "object"
        ? String((err as { message?: unknown }).message || "")
        : "";
    throw new Error(msg || "YouTube search failed.");
  }
  const items = Array.isArray(json.items) ? json.items : [];
  return mapItems(items);
}

function payload(
  query: string,
  videos: RvVideoHit[],
  cached: boolean,
  note = videos.length ? RELATED_NOTE : EMPTY_MATCH_MESSAGE,
  yearTier: RvVideoYearTier | null = null,
): RvVideosOk {
  return {
    ok: true,
    source: "RV Video Library",
    channel: RV_VIDEO_LIBRARY_URL,
    query,
    videos,
    cached,
    note,
    yearTier,
  };
}

function mergeHits(...lists: RvVideoHit[][]): RvVideoHit[] {
  const out: RvVideoHit[] = [];
  const seen = new Set<string>();
  for (const list of lists) {
    for (const hit of list) {
      if (seen.has(hit.videoId)) continue;
      seen.add(hit.videoId);
      out.push(hit);
    }
  }
  return out;
}

export const Route = createFileRoute("/api/rv-videos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const year = clean(url.searchParams.get("year"));
        const make = clean(url.searchParams.get("make"));
        const model = clean(url.searchParams.get("model"));
        const floorplan = clean(url.searchParams.get("floorplan"));
        const series = clean(url.searchParams.get("series"));

        if (!year || !make || !model) {
          return Response.json(
            {
              ok: false,
              error: "Year, make, and model are required.",
              code: "bad_request",
            },
            { status: 400 },
          );
        }
        if (!/^\d{4}$/.test(year)) {
          return Response.json(
            {
              ok: false,
              error: "Year must be a 4-digit model year.",
              code: "bad_request",
            },
            { status: 400 },
          );
        }
        if (!isRvVideoLibraryYear(year)) {
          const query = buildRvVideoQuery({
            year,
            make,
            model,
            floorplan,
            series,
          });
          return Response.json(payload(query, [], false), {
            headers: { "Cache-Control": "private, max-age=300" },
          });
        }

        const apiKey = getKey();
        if (!apiKey) {
          return Response.json(
            {
              ok: false,
              error: MISSING_KEY_MESSAGE,
              code: "missing_key",
            },
            { status: 200 },
          );
        }

        const coach: RvVideoCoach = { year, make, model, floorplan, series };
        const query = buildRvVideoQuery(coach);
        const core = buildRvVideoCoreQuery(coach);
        const makeModel = buildRvVideoMakeModelQuery(coach);
        const cacheKey = `${year}|${make}|${model}|${floorplan}|${series}`.toLowerCase();
        const hit = cache.get(cacheKey);
        if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
          return Response.json(
            { ...hit.data, cached: true },
            { headers: { "Cache-Control": "private, max-age=300" } },
          );
        }

        try {
          let pool: RvVideoHit[] = [];
          const take = (needed: RvVideoYearTier) => {
            const matched = matchRvVideos(pool, coach);
            return rvVideoTierSatisfied(matched.tier, needed) ? matched : null;
          };

          pool = mergeHits(pool, await searchChannel(apiKey, query));
          let matched = take("exact");
          if (!matched && core && core !== query) {
            pool = mergeHits(pool, await searchChannel(apiKey, core));
            matched = take("exact");
          }
          if (!matched) matched = take("near");
          if (!matched && makeModel && makeModel !== query && makeModel !== core) {
            pool = mergeHits(pool, await searchChannel(apiKey, makeModel));
            matched =
              take("exact") ?? take("near") ?? take("wide");
          }
          if (!matched) matched = matchRvVideos(pool, coach);

          const ranked = matched.videos.slice(0, SHOW_RESULTS);
          const data = payload(
            query,
            ranked,
            false,
            matched.note,
            matched.tier,
          );
          cache.set(cacheKey, { at: Date.now(), data });
          return Response.json(data, {
            headers: { "Cache-Control": "private, max-age=300" },
          });
        } catch (err) {
          const raw =
            (err as Error)?.name === "AbortError"
              ? "timeout"
              : err instanceof Error
                ? err.message
                : "upstream";
          const calm = calmVideoLookupError(raw);
          return Response.json(
            { ok: false, error: calm.error, code: calm.code },
            { status: 200 },
          );
        }
      },
    },
  },
});
