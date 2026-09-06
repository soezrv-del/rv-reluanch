/**
 * Opt-in RV Video Library match for a Facts coach.
 *
 * Catalog remains SoT. Videos are optional media — never facts.
 * The client must not call YouTube (or this proxy) until the user taps Yes.
 */

import { coachTowRole } from "./activeCoach.ts";

export const RV_VIDEO_LIBRARY_HANDLE = "RVVideoLibrary";
export const RV_VIDEO_LIBRARY_URL = "https://www.youtube.com/@RVVideoLibrary";
/** Verified from youtube.com/@RVVideoLibrary (browseId / externalId). */
export const RV_VIDEO_LIBRARY_CHANNEL_ID = "UCaAH7nANvUhdPWN93uQ6mcA";

export const MISSING_KEY_MESSAGE = "Video lookup not configured.";
export const LOOKUP_FAILED_MESSAGE = "Video lookup failed. Try again shortly.";
export const EMPTY_MATCH_MESSAGE =
  "No RV Video Library videos matched this coach.";
export const RELATED_NOTE =
  "Related walkthroughs from RV Video Library on YouTube — not a confirmed match for this exact unit.";

/** After-tap only. Never surface raw YouTube / key errors. */
export function calmVideoLookupError(raw: string): {
  error: string;
  code: "missing_key" | "upstream";
} {
  const m = (raw || "").toLowerCase();
  if (
    /api[\s_-]?key|keyinvalid|keyexpired|unauthorized|forbidden|permission|credentials?/.test(
      m,
    )
  ) {
    return { error: MISSING_KEY_MESSAGE, code: "missing_key" };
  }
  return { error: LOOKUP_FAILED_MESSAGE, code: "upstream" };
}

const QUERY_STOP = new Set([
  "the",
  "and",
  "for",
  "of",
  "a",
  "an",
  "to",
  "in",
  "on",
  "rv",
  "inc",
  "llc",
]);

export type RvVideoCoach = {
  year?: string | null;
  make?: string | null;
  model?: string | null;
  floorplan?: string | null;
  series?: string | null;
  type?: string | null;
};

export type RvVideoHit = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  youtubeUrl: string;
};

export type RvVideosOk = {
  ok: true;
  source: "RV Video Library";
  channel: string;
  query: string;
  videos: RvVideoHit[];
  cached: boolean;
  note: string;
};

export type RvVideosErr = {
  ok: false;
  error: string;
  code: "missing_key" | "bad_request" | "upstream";
};

export type RvVideosResponse = RvVideosOk | RvVideosErr;

function clean(v?: string | null): string {
  return String(v ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

/** Quiet prompt only for a selected RV with year / make / model. */
export function shouldShowRvVideoPrompt(coach: RvVideoCoach): boolean {
  if (!clean(coach.year) || !clean(coach.make) || !clean(coach.model)) {
    return false;
  }
  const type = clean(coach.type);
  if (!type) return true;
  const role = coachTowRole(type);
  if (role === "motorhome" || role === "towable") return true;
  return /\b(rv|motorhome|coach|class\s*[abc]|super\s*c|trailer|fifth|hauler|camper)\b/i.test(
    type,
  );
}

function uniqueParts(parts: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of parts) {
    const t = clean(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    if (out.some((p) => p.toLowerCase().includes(key) && p.length > t.length)) {
      continue;
    }
    seen.add(key);
    out.push(t);
  }
  return out;
}

/** YouTube q from the Facts coach — year + make + model, plus series/floorplan. */
export function buildRvVideoQuery(coach: RvVideoCoach): string {
  return uniqueParts([
    clean(coach.year),
    clean(coach.make),
    clean(coach.model),
    clean(coach.series),
    clean(coach.floorplan),
  ]).join(" ");
}

/** Broader search when a floorplan/series token over-constrains YouTube. */
export function buildRvVideoCoreQuery(coach: RvVideoCoach): string {
  return uniqueParts([
    clean(coach.year),
    clean(coach.make),
    clean(coach.model),
  ]).join(" ");
}

export function tokenizeCoachQuery(q: string): string[] {
  return clean(q)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !QUERY_STOP.has(t));
}

export function scoreTitleOverlap(title: string, tokens: string[]): number {
  const hay = clean(title).toLowerCase();
  if (!hay || !tokens.length) return 0;
  let score = 0;
  for (const t of tokens) {
    if (!hay.includes(t)) continue;
    score += t.length >= 4 ? 2 : 1;
    if (/^\d{4}$/.test(t)) score += 1;
  }
  return score;
}

/** Rank by title overlap. Zero-overlap rows are dropped — no invented matches. */
export function rankRvVideos<T extends { title: string }>(
  videos: T[],
  query: string,
): T[] {
  const tokens = tokenizeCoachQuery(query);
  return videos
    .map((v) => ({ v, score: scoreTitleOverlap(v.title, tokens) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.v.title.localeCompare(b.v.title))
    .map((row) => row.v);
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

/** Client → /api/rv-videos. Call only after the user opts in. */
export async function fetchRvVideos(
  coach: RvVideoCoach,
  signal?: AbortSignal,
): Promise<RvVideosResponse> {
  const year = clean(coach.year);
  const make = clean(coach.make);
  const model = clean(coach.model);
  if (!year || !make || !model) {
    return {
      ok: false,
      error: "Year, make, and model are required.",
      code: "bad_request",
    };
  }

  const qs = new URLSearchParams({ year, make, model });
  const floorplan = clean(coach.floorplan);
  const series = clean(coach.series);
  if (floorplan) qs.set("floorplan", floorplan);
  if (series) qs.set("series", series);

  try {
    const resp = await fetch(`/api/rv-videos?${qs}`, {
      headers: { Accept: "application/json" },
      signal,
    });
    const json = (await resp.json()) as RvVideosResponse;
    if (!json || typeof json !== "object" || !("ok" in json)) {
      return {
        ok: false,
        error: `Video lookup failed (${resp.status})`,
        code: "upstream",
      };
    }
    return json;
  } catch (e) {
    if ((e as Error)?.name === "AbortError") {
      return { ok: false, error: "cancelled", code: "upstream" };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Video lookup failed.",
      code: "upstream",
    };
  }
}
