import { createFileRoute } from "@tanstack/react-router";
import {
  buildRvVideoCoreQuery,
  buildRvVideoQuery,
  calmVideoLookupError,
  EMPTY_MATCH_MESSAGE,
  MISSING_KEY_MESSAGE,
  rankRvVideos,
  RELATED_NOTE,
  RV_VIDEO_LIBRARY_CHANNEL_ID,
  RV_VIDEO_LIBRARY_HANDLE,
  RV_VIDEO_LIBRARY_URL,
  youtubeWatchUrl,
  type RvVideoHit,
  type RvVideosOk,
} from "@/lib/rv/rvVideos";

/**
 * GET /api/rv-videos?year=2023&make=Tiffin&model=Allegro%20Bus&floorplan=45OPP
 *
 * Opt-in only. Facts must never call this on report open.
 * YouTube Data API v3 search.list scoped to @RVVideoLibrary.
 *
 * Server-only key: process.env.YOUTUBE_API_KEY (Vercel Production + Preview).
 * Never VITE_ — that would leak the key to the client.
 * Read at request time so the vault/Vercel value is live, not baked at build.
 */

const YT_SEARCH = "https://www.googleapis.com/youtube/v3/search";
const YT_CHANNELS = "https://www.googleapis.com/youtube/v3/channels";
const CACHE_TTL_MS = 20 * 60 * 1000;
const MAX_RESULTS = 8;
const SHOW_RESULTS = 5;

const cache = new Map<string, { at: number; data: RvVideosOk }>();
let channelIdCache: string | null = null;

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

/** Resolve @RVVideoLibrary once per process; fall back to the verified UC id. */
async function resolveChannelId(apiKey: string): Promise<string> {
  if (channelIdCache) return channelIdCache;
  try {
    const url = new URL(YT_CHANNELS);
    url.searchParams.set("part", "id");
    url.searchParams.set("forHandle", RV_VIDEO_LIBRARY_HANDLE);
    url.searchParams.set("key", apiKey);
    const { ok, json } = await fetchJson(url.toString());
    const items = Array.isArray(json.items) ? json.items : [];
    const first = items[0];
    const id =
      first && typeof first === "object"
        ? String((first as { id?: unknown }).id || "")
        : "";
    if (ok && /^UC[\w-]{20,}$/.test(id)) {
      channelIdCache = id;
      return id;
    }
  } catch {
    /* use known id */
  }
  channelIdCache = RV_VIDEO_LIBRARY_CHANNEL_ID;
  return channelIdCache;
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

async function searchChannel(
  apiKey: string,
  channelId: string,
  q: string,
): Promise<RvVideoHit[]> {
  const url = new URL(YT_SEARCH);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", channelId);
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
): RvVideosOk {
  return {
    ok: true,
    source: "RV Video Library",
    channel: RV_VIDEO_LIBRARY_URL,
    query,
    videos,
    cached,
    note: videos.length ? RELATED_NOTE : EMPTY_MATCH_MESSAGE,
  };
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

        const coach = { year, make, model, floorplan, series };
        const query = buildRvVideoQuery(coach);
        const core = buildRvVideoCoreQuery(coach);
        const cacheKey = `${year}|${make}|${model}|${floorplan}|${series}`.toLowerCase();
        const hit = cache.get(cacheKey);
        if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
          return Response.json(
            { ...hit.data, cached: true },
            { headers: { "Cache-Control": "private, max-age=300" } },
          );
        }

        try {
          const channelId = await resolveChannelId(apiKey);
          let hits = await searchChannel(apiKey, channelId, query);
          if (!hits.length && core && core !== query) {
            hits = await searchChannel(apiKey, channelId, core);
          }
          const ranked = rankRvVideos(hits, query).slice(0, SHOW_RESULTS);
          const data = payload(query, ranked, false);
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
