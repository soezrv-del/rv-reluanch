/**
 * Opt-in RV Video Library match for a Facts coach.
 *
 * Catalog remains SoT. Videos are optional media — never facts.
 * The client must not call YouTube (or this proxy) on Facts open.
 * Lookups run after Want a video? Yes, or when the inline Share kit is on
 * screen for a 2016+ coach. Channel coverage is ~2016+ — earlier years stay silent.
 */

import { coachTowRole } from "./activeCoach.ts";

export const RV_VIDEO_LIBRARY_HANDLE = "RVVideoLibrary";
export const RV_VIDEO_LIBRARY_URL = "https://www.youtube.com/@RVVideoLibrary";
/** David-confirmed @RVVideoLibrary id — use this constant, do not resolve live. */
export const RV_VIDEO_LIBRARY_CHANNEL_ID = "UCaAH7nANvUhdPWN93uQ6mcA";
/** @RVVideoLibrary walkthroughs start around this model year. */
export const RV_VIDEO_LIBRARY_MIN_YEAR = 2016;

export const MISSING_KEY_MESSAGE = "Video lookup not configured.";
export const LOOKUP_FAILED_MESSAGE = "Video lookup failed. Try again shortly.";
export const EMPTY_MATCH_MESSAGE =
  "No RV Video Library videos matched this coach.";
export const RELATED_NOTE =
  "Related walkthroughs from RV Video Library on YouTube — not a confirmed match for this exact unit.";
/** Only used when every returned title names this make + model. */
export const CONFIRMED_NOTE =
  "RV Video Library walkthroughs that name this coach.";

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

/** 4-digit model year, or null when we cannot tell. */
export function parseCoachModelYear(year?: string | null): number | null {
  const t = clean(year);
  if (!/^\d{4}$/.test(t)) return null;
  return Number(t);
}

/**
 * Channel coverage is ~2016+. A known year before that is out.
 * Unparseable / unknown year stays eligible — do not invent a cutoff.
 */
export function isRvVideoLibraryYear(year?: string | null): boolean {
  const n = parseCoachModelYear(year);
  if (n == null) return true;
  return n >= RV_VIDEO_LIBRARY_MIN_YEAR;
}

function emptyVideosOk(coach: RvVideoCoach, cached = true): RvVideosOk {
  return {
    ok: true,
    source: "RV Video Library",
    channel: RV_VIDEO_LIBRARY_URL,
    query: buildRvVideoQuery(coach),
    videos: [],
    cached,
    note: EMPTY_MATCH_MESSAGE,
  };
}

/** Quiet prompt only for a selected RV with year / make / model. */
export function shouldShowRvVideoPrompt(coach: RvVideoCoach): boolean {
  if (!clean(coach.year) || !clean(coach.make) || !clean(coach.model)) {
    return false;
  }
  if (!isRvVideoLibraryYear(coach.year)) return false;
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

/**
 * Small competing-make list for the hard title gate.
 * Multi-word * Coach brands plus major makes used in tests — not the catalog.
 */
export const RV_VIDEO_KNOWN_MAKES = [
  "American Coach",
  "Liberty Coach",
  "Entegra Coach",
  "Thor Motor Coach",
  "Tiffin",
  "Newmar",
  "Winnebago",
  "Keystone",
] as const;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function makePhraseRe(make: string): RegExp | null {
  const parts = clean(make)
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegExp);
  if (!parts.length) return null;
  // Exact manufacturer phrase; flexible whitespace; not a weak token like "coach".
  return new RegExp(`(?:^|[^a-z0-9])${parts.join("\\s+")}(?![a-z0-9])`, "i");
}

function sameMakeFamily(searched: string, known: string): boolean {
  const a = clean(searched).toLowerCase();
  const b = clean(known).toLowerCase();
  if (!a || !b) return false;
  if (a === b) return true;
  return b.startsWith(`${a} `) || a.startsWith(`${b} `);
}

/** Title contains the exact searched make (case-insensitive, flexible whitespace). */
export function titleHasExactMake(title: string, make: string): boolean {
  const re = makePhraseRe(make);
  if (!re) return false;
  return re.test(clean(title));
}

/** Title contains the exact searched model (same phrase rules as make). */
export function titleHasExactModel(title: string, model: string): boolean {
  const re = makePhraseRe(model);
  if (!re) return false;
  return re.test(clean(title));
}

/** Title names a different known make than the one searched. */
export function titleHasCompetingMake(title: string, make: string): boolean {
  const searched = clean(make);
  if (!searched) return false;
  const hay = clean(title);
  if (!hay) return false;
  for (const known of RV_VIDEO_KNOWN_MAKES) {
    if (sameMakeFamily(searched, known)) continue;
    if (titleHasExactMake(hay, known)) return true;
  }
  return false;
}

/**
 * David 2026-09-17: every returned video must contain the exact manufacturer
 * name. Generic coach/luxury/year tokens are not enough; competing makes fail.
 */
export function titleQualifiesForRvMake(title: string, make: string): boolean {
  if (!titleHasExactMake(title, make)) return false;
  if (titleHasCompetingMake(title, make)) return false;
  return true;
}

/** Confirmed match: exact make + exact model. Brand-only hits are not this coach. */
export function titleQualifiesForRvCoach(
  title: string,
  make: string,
  model?: string | null,
): boolean {
  if (!titleQualifiesForRvMake(title, make)) return false;
  const requiredModel = clean(model);
  if (requiredModel && !titleHasExactModel(title, requiredModel)) return false;
  return true;
}

export function filterRvVideosByMake<T extends { title: string }>(
  videos: T[],
  make: string,
): T[] {
  return videos.filter((v) => titleQualifiesForRvMake(v.title, make));
}

function resolveRankMake(query: string, make?: string | null): string {
  const explicit = clean(make);
  if (explicit) return explicit;
  const hay = clean(query);
  if (!hay) return "";
  const known = [...RV_VIDEO_KNOWN_MAKES].sort((a, b) => b.length - a.length);
  for (const name of known) {
    if (titleHasExactMake(hay, name)) return name;
  }
  return "";
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

/**
 * Rank by title overlap after the hard make-in-title gate.
 * Zero-overlap / wrong-make rows are dropped — no invented matches.
 */
export function rankRvVideos<T extends { title: string }>(
  videos: T[],
  query: string,
  make?: string | null,
  model?: string | null,
): T[] {
  const requiredMake = resolveRankMake(query, make);
  const requiredModel = clean(model);
  const gated = requiredMake
    ? videos.filter((v) =>
        titleQualifiesForRvCoach(v.title, requiredMake, requiredModel),
      )
    : [];
  const tokens = tokenizeCoachQuery(query);
  return gated
    .map((v) => ({ v, score: scoreTitleOverlap(v.title, tokens) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.v.title.localeCompare(b.v.title))
    .map((row) => row.v);
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}

const YT_WATCH_RE = /^https:\/\/www\.youtube\.com\/watch\?v=/i;

/** Same-session cache so Want a video? and Share kit share one lookup. */
const videoSession = new Map<string, RvVideosResponse>();
const videoInflight = new Map<string, Promise<RvVideosResponse>>();
const videoListeners = new Set<() => void>();

export function rvVideoSessionKey(coach: RvVideoCoach): string {
  return [
    clean(coach.year),
    clean(coach.make),
    clean(coach.model),
    clean(coach.floorplan),
    clean(coach.series),
  ]
    .join("|")
    .toLowerCase();
}

export function clearRvVideoSession(): void {
  videoSession.clear();
  videoInflight.clear();
}

export function subscribeRvVideoSession(listener: () => void): () => void {
  videoListeners.add(listener);
  return () => {
    videoListeners.delete(listener);
  };
}

function emitRvVideoSession(): void {
  for (const fn of videoListeners) fn();
}

export function peekRvVideoSession(
  coach: RvVideoCoach,
): RvVideosResponse | null {
  return videoSession.get(rvVideoSessionKey(coach)) ?? null;
}

/** Top ranked hit only — Share kit sends one link, never a file. */
export function shareVideoForCoach(coach: RvVideoCoach): RvVideoHit | null {
  const hit = peekRvVideoSession(coach);
  if (!hit?.ok || !hit.videos.length) return null;
  return hit.videos[0] ?? null;
}

function rememberRvVideoSession(
  coach: RvVideoCoach,
  data: RvVideosResponse,
): void {
  if (!data.ok && data.error === "cancelled") return;
  videoSession.set(rvVideoSessionKey(coach), data);
  emitRvVideoSession();
}

/**
 * Brochure-kit VIDEO block. Title + watch URL only.
 * Rejects anything that is not a YouTube watch link — never a file path.
 */
export function formatShareVideoBlock(
  video?: { title?: string | null; youtubeUrl?: string | null } | null,
): string[] {
  const title = clean(video?.title);
  const url = clean(video?.youtubeUrl);
  if (!title || !url) return [];
  if (!YT_WATCH_RE.test(url)) return [];
  return ["VIDEO", title, url];
}

/** Client → /api/rv-videos. After Want a video? or when Share kit is on screen. */
export async function fetchRvVideos(
  coach: RvVideoCoach,
  signal?: AbortSignal,
): Promise<RvVideosResponse> {
  const key = rvVideoSessionKey(coach);
  const cached = videoSession.get(key);
  if (cached) return cached;
  const pending = videoInflight.get(key);
  if (pending) return pending;

  const run = lookupRvVideos(coach, signal).then((data) => {
    rememberRvVideoSession(coach, data);
    return data;
  });
  videoInflight.set(key, run);
  try {
    return await run;
  } finally {
    if (videoInflight.get(key) === run) videoInflight.delete(key);
  }
}

async function lookupRvVideos(
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
  if (!isRvVideoLibraryYear(year)) {
    return emptyVideosOk({
      year,
      make,
      model,
      floorplan: coach.floorplan,
      series: coach.series,
    });
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
