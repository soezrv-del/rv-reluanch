/**
 * Required xAI web search sidecar when the catalog cannot answer
 * (troubleshooting / OEM / forum / manual, missing hard spec, or a
 * catalog miss). Callers must not skip this path on a catalog miss.
 *
 * Confirmed: Live Search `search_parameters` on chat completions is retired
 * (410 Gone). The working path is POST /v1/responses with { type: "web_search" }.
 *
 * SPEED: grok-4.6 + default reasoning.effort "high" + unbounded tool loops is
 * the 60–70s path. Research uses a fast model, a short prompt, a clipped
 * catalog lock, a process cache for repeated demo questions, and an
 * application-level research loop (search → confirm → rephrase) bounded by
 * WEB_SEARCH_MAX_TOOL_CALLS. Extra Responses knobs are best-effort — HTTP 400
 * falls back to the #113 minimal shape (model + user input + tools) on the
 * same model. Model-list retries stay HTTP-only; a miss rephrases the query.
 *
 * If the key is missing or the call fails, callers must say so honestly —
 * never pretend a brochure or bulletin was fetched.
 */

import { LOW_CONFIDENCE_EST_RULE } from "./estimatePolicy.ts";
import {
  looksLikeLiveResearchQuestion,
  looksLikeMarketValueQuestion,
  looksLikeRepairQuestion,
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";

export const WEB_SEARCH_TOOL = { type: "web_search" } as const;

/**
 * Fast Responses + web_search only. grok-4.6 is intentionally absent:
 * docs default its reasoning effort to "high", and one search-and-reason
 * loop was measured at ~60–70s. Do not put it back as a fallback — a
 * timeout there would eat the whole voice/chat budget.
 */
export const WEB_SEARCH_MODELS = [
  "grok-4-1-fast-reasoning",
  "grok-4-1-fast-non-reasoning",
] as const;

/** Chat wall-clock budget for the whole research loop (search → retry). */
export const CHAT_WEB_SEARCH_TIMEOUT_MS = 12_000;

/**
 * Live Voice research wall-clock budget (server-side fetch timeout).
 *
 * NOT the old "raise timeout to fake a pass" move (60s of dead air is
 * unacceptable in speech). Post–#116 production cold calls land ~5–7s on
 * grok-4-1-fast-reasoning; 10s covers normal upstream variance while the
 * existing "give me one second" hold keeps the pause conversational (~phone
 * lookup time). Chat keeps CHAT_WEB_SEARCH_TIMEOUT_MS (12s).
 */
export const VOICE_WEB_SEARCH_TIMEOUT_MS = 10_000;
export const VOICE_WEB_SEARCH_MODELS = [WEB_SEARCH_MODELS[0]] as const;

/**
 * Research-loop attempt cap — easy to tune. Each attempt is one query
 * phrasing (one web_search tool call). A miss rephrases and retries
 * until this many genuine attempts have failed.
 */
export const WEB_SEARCH_MAX_TOOL_CALLS = 3;

/** One web_search tool call per phrasing. The loop rephrases across attempts. */
export const WEB_SEARCH_TOOL_CALLS_PER_ATTEMPT = 1;

/** Do not start another phrasing if the shared wall-clock budget is this thin. */
export const WEB_SEARCH_MIN_RETRY_BUDGET_MS = 2_000;

/**
 * Hold this much of the shared budget for one rephrased retry so a
 * first-attempt timeout cannot eat the whole turn (David: retry once
 * before giving up — do not jump to EST / training).
 */
export const WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS = 4_500;

/** At most one timeout retry (rephrased query) before an honest miss. */
export const WEB_SEARCH_TIMEOUT_RETRIES = 1;

/** Catalog lock only — drop the long GROUNDING_RULES essay. */
export const WEB_SEARCH_CATALOG_MAX = 700;

/** Repeated lot-demo questions stay instant on a warm instance. */
export const WEB_SEARCH_CACHE_TTL_MS = 30 * 60 * 1000;
const WEB_SEARCH_CACHE_MAX = 80;

const ERROR_SNIPPET_MAX = 200;

export type WebSearchProfile = "chat" | "voice";

/** Coach field the research loop is trying to confirm. */
export type QueriedResearchField =
  | "gvwr"
  | "uvw"
  | "gcwr"
  | "ncc"
  | "ccc"
  | "hitch"
  | "payload"
  | "horsepower"
  | "engine"
  | "chassis"
  | "torque"
  | "transmission"
  | "fuel"
  | "length"
  | "mpg"
  | "tow"
  | "price"
  | "repair"
  | "generic";

export type WebSearchMeta = {
  /** Accumulated notes confirmed the queried field. */
  confirmed?: boolean;
  /** Genuine search attempts completed this turn (rephrased queries). */
  attempts?: number;
  /** No further rephrased attempt will run. */
  exhausted?: boolean;
  /** Query phrasings actually sent, in order. */
  queries?: string[];
  /** Original ask (for the quality gate). */
  query?: string;
};

export type WebSearchNotes =
  | ({ ok: true; notes: string; model: string } & WebSearchMeta)
  | ({ ok: false; reason: string } & WebSearchMeta);

export type ResearchQualityGate = {
  confirmed: boolean;
  attempts: number;
  exhausted: boolean;
  allowEstimate: boolean;
  reason: "confirmed" | "empty" | "unavailable" | "unconfirmed" | "exhausted";
};

type CacheEntry = { at: number; result: Extract<WebSearchNotes, { ok: true }> };

const researchCache = new Map<string, CacheEntry>();

export function truncateApiErrorBody(
  text: string,
  max = ERROR_SNIPPET_MAX,
): string {
  const cleaned = text
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/xai-[A-Za-z0-9_-]{8,}/gi, "[redacted]")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.slice(0, max);
}

export function formatWebSearchHttpFailure(
  status: number,
  bodyText: string,
): string {
  const snippet = truncateApiErrorBody(bodyText);
  return snippet
    ? `web search HTTP ${status}: ${snippet}`
    : `web search HTTP ${status}`;
}

export function isAbortLikeError(err: unknown): boolean {
  if (!err) return false;
  if (typeof err === "object" && "name" in err) {
    const name = String((err as { name?: string }).name || "");
    if (name === "TimeoutError" || name === "AbortError") return true;
  }
  const msg = err instanceof Error ? err.message : String(err);
  return /aborted due to timeout|operation was aborted|aborted|timeout/i.test(
    msg,
  );
}

export function isTimeoutFailureReason(reason: string): boolean {
  return /aborted due to timeout|operation was aborted|timed out/i.test(
    reason || "",
  );
}

/** Cap this attempt so a later rephrase still has budget after a timeout. */
export function perAttemptTimeoutMs(
  remaining: number,
  attemptIndex: number,
  maxAttempts: number,
): number {
  const moreAfter = maxAttempts - attemptIndex - 1;
  if (moreAfter <= 0) return Math.max(remaining, 1);
  const reserve = Math.min(
    WEB_SEARCH_TIMEOUT_RETRY_RESERVE_MS,
    Math.max(WEB_SEARCH_MIN_RETRY_BUDGET_MS, Math.floor(remaining / 2)),
  );
  return Math.max(remaining - reserve, WEB_SEARCH_MIN_RETRY_BUDGET_MS);
}

/** Keep the powertrain lock lines; drop the long non-negotiable rules block. */
export function clipCatalogBlock(catalogBlock?: string, max = WEB_SEARCH_CATALOG_MAX): string {
  const raw = (catalogBlock || "").trim();
  if (!raw) return "";
  const lockOnly = raw.split(/VERIFIED CATALOG LOCK/i)[0]?.trim() || raw;
  if (lockOnly.length <= max) return lockOnly;
  return `${lockOnly.slice(0, max).trim()}…`;
}

export function researchCacheKey(query: string, catalogBlock?: string): string {
  const q = normalizeAskText(query)
    .toLowerCase()
    .replace(/[^\w\s/+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const c = clipCatalogBlock(catalogBlock)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .slice(0, 160);
  return c ? `${q}::${c}` : q;
}

const FIELD_PATTERNS: Array<[QueriedResearchField, RegExp]> = [
  ["gvwr", /\bgvwr\b/i],
  ["gcwr", /\bgcwr\b/i],
  ["uvw", /\buvw\b/i],
  ["ncc", /\bncc\b/i],
  ["ccc", /\bccc\b/i],
  ["hitch", /\bhitch\b/i],
  ["payload", /\bpayload\b/i],
  ["horsepower", /\b(hp|horsepower)\b/i],
  ["torque", /\btorque\b/i],
  ["engine", /\bengine\b/i],
  ["chassis", /\bchassis\b/i],
  ["transmission", /\btransmission\b/i],
  ["fuel", /\b(fuel|diesel|gasoline|gas\b|propane|lp)\b/i],
  ["length", /\b(length|feet long|ft long)\b/i],
  ["mpg", /\bmpg\b/i],
  ["tow", /\b(tow(?:ing)? capacity|tow rating)\b/i],
];

const FIELD_LABEL: Record<QueriedResearchField, string> = {
  gvwr: "GVWR",
  uvw: "UVW",
  gcwr: "GCWR",
  ncc: "NCC",
  ccc: "CCC",
  hitch: "hitch rating",
  payload: "payload",
  horsepower: "horsepower",
  engine: "engine",
  chassis: "chassis",
  torque: "torque",
  transmission: "transmission",
  fuel: "fuel",
  length: "length",
  mpg: "MPG",
  tow: "tow rating",
  price: "asking price Low / Average / High",
  repair: "procedure or part location",
  generic: "the asked fact",
};

const MISS_NOTE_RE =
  /\b(unknown|insufficient|not found|could not find|no (?:oem|brochure|listing|published)|confirmed:\s*no|unable to (?:confirm|find|verify)|no (?:specific|published) (?:number|spec|figure|value))\b/i;
const CONFIRMED_YES_RE = /\bconfirmed:\s*yes\b/i;
const EST_IN_NOTES_RE = /\b(EST\.?|typical class range|low confidence)\b/i;
const NUMBER_RE = /\b\d{2,7}(?:,\d{3})*(?:\.\d+)?\b/;
const LB_RE = /\b\d{2,3}(?:,\d{3})?\s*(?:lb|lbs|pounds|#)\b/i;
const HP_RE = /\b\d{2,4}\s*(?:hp|horsepower)\b/i;

function normalizeQueryPhrase(q: string): string {
  return normalizeAskText(q)
    .toLowerCase()
    .replace(/[^\w\s/+.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Which coach field the ask is trying to pin. */
export function inferQueriedField(query: string): QueriedResearchField {
  const t = normalizeAskText(query || "");
  if (looksLikeMarketValueQuestion(t)) return "price";
  for (const [field, re] of FIELD_PATTERNS) {
    if (re.test(t)) return field;
  }
  if (looksLikeRepairQuestion(t)) return "repair";
  if (looksLikeLiveResearchQuestion(t) && !looksLikeSpecQuestion(t)) {
    return "repair";
  }
  return "generic";
}

/**
 * True when accumulated notes contain a confirming fact for the queried
 * field — a specific number, named powertrain, listing band, or procedure.
 * Empty notes, WEB SEARCH NOT AVAILABLE, miss language, or an EST in the
 * notes do not confirm.
 */
export function notesConfirmQueriedField(notes: string, query: string): boolean {
  const n = (notes || "").trim();
  if (!n) return false;
  if (/WEB SEARCH NOT AVAILABLE/i.test(n)) return false;
  if (CONFIRMED_YES_RE.test(n) && !MISS_NOTE_RE.test(n)) return true;
  if (EST_IN_NOTES_RE.test(n) && !CONFIRMED_YES_RE.test(n)) return false;
  if (MISS_NOTE_RE.test(n) && !NUMBER_RE.test(n) && !HP_RE.test(n)) return false;

  const field = inferQueriedField(query);

  if (field === "repair") {
    if (MISS_NOTE_RE.test(n)) return false;
    return (
      n.length >= 40 &&
      /\b(check|located|near|switch|disconnect|inspect|replace|procedure|manual|owners?|forum|symptom|cause|fuse|breaker|reset)\b/i.test(
        n,
      )
    );
  }
  if (field === "price") {
    if (MISS_NOTE_RE.test(n) && !NUMBER_RE.test(n)) return false;
    return (
      /low\s*\/\s*average\s*\/\s*high/i.test(n) ||
      (NUMBER_RE.test(n) && /\$|ask(?:ing)?|price|avg|average|high|low/i.test(n))
    );
  }
  if (field === "generic") {
    if (MISS_NOTE_RE.test(n)) return false;
    return (
      n.length >= 40 &&
      (NUMBER_RE.test(n) ||
        /\b(brochure|oem|owners?|manual|located|switch|disconnect|procedure)\b/i.test(
          n,
        ))
    );
  }
  if (field === "horsepower" && HP_RE.test(n)) return true;
  if (
    (field === "gvwr" ||
      field === "uvw" ||
      field === "gcwr" ||
      field === "ncc" ||
      field === "ccc" ||
      field === "hitch" ||
      field === "payload" ||
      field === "tow") &&
    LB_RE.test(n)
  ) {
    return true;
  }
  const fieldRe = FIELD_PATTERNS.find(([f]) => f === field)?.[1];
  if (fieldRe?.test(n) && NUMBER_RE.test(n)) return true;
  if (
    field === "engine" ||
    field === "fuel" ||
    field === "chassis" ||
    field === "transmission"
  ) {
    if (MISS_NOTE_RE.test(n)) return false;
    return Boolean(fieldRe?.test(n) && n.length >= 20);
  }
  return false;
}

/**
 * Next phrasing for the research loop. Attempt 0 is the original ask;
 * later attempts must be a genuinely different query, never a repeat.
 */
export function rephraseResearchQuery(
  original: string,
  attemptIndex: number,
  previousQueries: readonly string[] = [],
): string {
  const base = (original || "").trim();
  const field = inferQueriedField(base);
  const label = FIELD_LABEL[field];
  const used = new Set(previousQueries.map(normalizeQueryPhrase));

  const candidates: string[] = [];
  if (attemptIndex <= 0) candidates.push(base);
  candidates.push(
    `OEM brochure spec sheet door-sticker published ${label} for ${base}`,
    `official manufacturer ${label} specification ${base} — not an estimate`,
    `${label} rated pounds horsepower chassis fuel ${base} RVUSA brochure PDF`,
  );

  for (const candidate of candidates) {
    const n = normalizeQueryPhrase(candidate);
    if (n && !used.has(n)) return candidate;
  }

  for (let i = 1; i <= 6; i++) {
    const forced = `${base} (rephrase ${attemptIndex + i}: ${label} OEM published)`;
    const n = normalizeQueryPhrase(forced);
    if (n && !used.has(n)) return forced;
  }
  return `${base} ${label} official ${attemptIndex}`;
}

function joinResearchNotes(prior: string, next: string): string {
  const a = (prior || "").trim();
  const b = (next || "").trim();
  if (!a) return b;
  if (!b) return a;
  if (a.includes(b)) return a;
  return `${a}\n---\n${b}`;
}

/**
 * Quality gate shared by the research loop and formatWebSearchInjection.
 * EST is blocked until the loop is exhausted without a confirming fact.
 */
export function evaluateResearchQuality(opts: {
  result: WebSearchNotes;
  query?: string;
  maxAttempts?: number;
}): ResearchQualityGate {
  const query = opts.query || opts.result.query || "";
  const notes = opts.result.ok ? opts.result.notes : "";
  const unavailable =
    !opts.result.ok || /WEB SEARCH NOT AVAILABLE/i.test(notes);
  const empty = opts.result.ok ? !notes.trim() : /empty notes/i.test(
    opts.result.ok ? "" : opts.result.reason,
  );
  const confirmed =
    opts.result.confirmed === true ||
    (opts.result.ok && notesConfirmQueriedField(notes, query));
  const attempts = opts.result.attempts ?? (opts.result.ok || opts.result.reason ? 1 : 0);
  // Injection-time default: the caller already finished the loop.
  // The loop itself always sets exhausted explicitly before EST is allowed.
  const exhausted =
    typeof opts.result.exhausted === "boolean" ? opts.result.exhausted : true;
  if (confirmed) {
    return {
      confirmed: true,
      attempts,
      exhausted: false,
      allowEstimate: false,
      reason: "confirmed",
    };
  }
  // Live hit already returned above. Timeout / empty / miss: never EST
  // from training — say so plainly after the retry. Catalog option-band
  // EST is a separate catalog-lock path, not this gate.
  const allowEstimate = false;
  let reason: ResearchQualityGate["reason"] = "unconfirmed";
  if (unavailable) reason = exhausted ? "exhausted" : "unavailable";
  else if (empty) reason = exhausted ? "exhausted" : "empty";
  else if (exhausted) reason = "exhausted";
  return {
    confirmed: false,
    attempts,
    exhausted,
    allowEstimate,
    reason,
  };
}

export function clearWebSearchCache(): void {
  researchCache.clear();
}

export function readWebSearchCache(key: string): WebSearchNotes | null {
  const hit = researchCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > WEB_SEARCH_CACHE_TTL_MS) {
    researchCache.delete(key);
    return null;
  }
  return hit.result;
}

export function seedWebSearchCache(
  key: string,
  result: Extract<WebSearchNotes, { ok: true }>,
): void {
  writeWebSearchCache(key, result);
}

function writeWebSearchCache(
  key: string,
  result: Extract<WebSearchNotes, { ok: true }>,
): void {
  if (!key) return;
  if (researchCache.size >= WEB_SEARCH_CACHE_MAX) {
    const oldest = researchCache.keys().next().value;
    if (oldest) researchCache.delete(oldest);
  }
  researchCache.set(key, { at: Date.now(), result });
}

function supportsLowReasoningEffort(model: string): boolean {
  return /^grok-4\.(5|6)\b/.test(model);
}

function researchInstructions(opts: {
  catalog: string;
  profile: WebSearchProfile;
  attempt?: number;
  maxAttempts?: number;
  previousQueries?: string[];
}): string {
  const lengthRule =
    opts.profile === "voice"
      ? "VOICE: 1–3 spoken sentences. No bullets, no URLs, no markdown, no campaign numbers you cannot support."
      : "CHAT: 4–8 short bullets. No essay. No URLs unless they uniquely identify a bulletin.";
  const attempt = opts.attempt ?? 1;
  const maxAttempts = opts.maxAttempts ?? WEB_SEARCH_MAX_TOOL_CALLS;
  const prior = (opts.previousQueries || []).filter(Boolean);
  const priorLine = prior.length
    ? `This is attempt ${attempt} of ${maxAttempts}. Do NOT repeat these queries — rephrase is already applied: ${prior.join(" | ")}`
    : `This is attempt ${attempt} of ${maxAttempts}. Search with THIS query phrasing only.`;
  return [
    "Research ONE RV question for RVFAX. Return short RESEARCH NOTES only — no JSON.",
    "Research loop: search the LIVE web first (OEM / factory brochure / dealer listing), then evaluate whether the results CONFIRM the asked fact (a specific year-matched number, location, procedure, listing band, or OEM pin). Prefer Tiffin, Newmar, Newmar Corp, factory PDF / brochure, and dealer listings over aggregator hedges like 'typically'. If they confirm, write CONFIRMED: yes and the fact plus related specs when found (engine / GCWR / transmission). If they do not confirm, write CONFIRMED: no and what was missing. Do not invent a labeled EST / typical class range / low confidence in these notes — never when a live source exists.",
    priorLine,
    "Never repeat the same query. A later attempt will retry ONCE with a DIFFERENT query phrasing if this one times out or does not confirm.",
    lengthRule,
    "Match the ask:",
    "- Specs/powertrain: search live OEM brochure / factory spec sheet / chassis sheet / dealer listing for THAT year + make + model + floorplan FIRST. Never answer from training data. Never invent horsepower as OEM fact (no silent 450). If a live source exists, quote that year-specific number — never EST / typical class range / low confidence. If not found, write CONFIRMED: no.",
    "- Market value / pricing: live nationwide ASKING prices this turn for THAT exact year + make + model AND two years older and two years newer (year ±2). Real public listings only (RV Trader / RVUSA / classifieds). Average those asks and return Low / Average / High. Never use a nightly competitor scrape, RVcountry competitor-latest, sample inventory CSV, frozen comps table, cached overnight scrape, NADA, J.D. Power, or any paid book. If you cannot find real listings this turn, write INSUFFICIENT — do not invent a band.",
    "- Troubleshooting / how-to / error codes / TSB / recall / install: likely symptoms, common OEM/forum/manual fixes, safety caveats. Cite uncertainty. Do not invent a campaign number, torque spec, part number, wiring color, sensor bypass, or a diagnosis you cannot support. Prefer OEM procedure / NHTSA. If none found, write UNKNOWN / no OEM procedure.",
    "Never steal powertrain from a sibling model. Entegra Vision is gas F-53 Godzilla, not diesel.",
    "Floorplan letters are labels only — do not decode bunks or a half-bath from the code.",
    opts.catalog
      ? `Catalog lock (do not contradict these numbers). If this lock names engine / HP / class, the coach IS in the catalog — do not write "not in catalogs" or "wait for a brochure":\n${opts.catalog}`
      : "No catalog row was available. Search OEM / factory brochure / dealer listings for THAT year + make + model FIRST. If the web does not confirm a number, write CONFIRMED: no — never a labeled EST / typical class range / low confidence, never a training-data year range. Do not tell the user to go check the OEM site instead of researching.",
  ].join("\n");
}

export function buildWebSearchRequest(opts: {
  model: string;
  query: string;
  catalogBlock?: string;
  profile?: WebSearchProfile;
  /**
   * true (default): add documented speed knobs (max_tool_calls, tool_choice,
   * low reasoning on grok-4.5/4.6). false: #113 minimal shape only.
   */
  extras?: boolean;
  /** 1-based attempt in the research loop. */
  attempt?: number;
  maxAttempts?: number;
  previousQueries?: string[];
}): Record<string, unknown> {
  const catalog = clipCatalogBlock(opts.catalogBlock);
  const profile = opts.profile ?? "chat";
  const extras = opts.extras !== false;
  const instructions = researchInstructions({
    catalog,
    profile,
    attempt: opts.attempt,
    maxAttempts: opts.maxAttempts,
    previousQueries: opts.previousQueries,
  });

  const body: Record<string, unknown> = {
    model: opts.model,
    input: [
      {
        role: "user",
        content: `${instructions}\n\nQuestion: ${opts.query}`,
      },
    ],
    tools: [WEB_SEARCH_TOOL],
  };

  if (extras) {
    body.max_tool_calls = WEB_SEARCH_TOOL_CALLS_PER_ATTEMPT;
    body.tool_choice = "required";
    if (supportsLowReasoningEffort(opts.model)) {
      body.reasoning = { effort: "low" };
    }
  }

  return body;
}

export function extractResponsesText(data: unknown): string {
  const d = data as {
    output_text?: string;
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
      text?: string;
    }>;
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (typeof d?.output_text === "string" && d.output_text.trim()) {
    return d.output_text.trim();
  }
  if (Array.isArray(d?.output)) {
    const parts: string[] = [];
    for (const item of d.output) {
      if (item?.type === "message" && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (c?.text) parts.push(c.text);
        }
      } else if (item?.text) {
        parts.push(item.text);
      }
    }
    if (parts.length) return parts.join("\n").trim();
  }
  const chat = d?.choices?.[0]?.message?.content;
  return chat ? String(chat).trim() : "";
}

export function formatWebSearchInjection(
  result: WebSearchNotes,
  opts?: { query?: string },
): string {
  if (result.ok && /own-lot/i.test(result.model || "")) {
    return result.notes.slice(0, 3500);
  }
  const gate = evaluateResearchQuality({
    result,
    query: opts?.query || result.query,
  });
  if (result.ok) {
    if (gate.confirmed) {
      return [
        "WEB RESEARCH NOTES (xAI web_search — may be incomplete):",
        result.notes.slice(0, 3500),
        "You have live web research this turn — do not claim you have no internet or cannot get online.",
        "Catalog lock still wins if it names a number. Notes CONFIRM the queried field — use that live OEM / brochure / dealer fact. Do not replace a confirmed fact with a labeled EST / typical class range / low confidence.",
      ].join("\n");
    }
    if (!gate.exhausted) {
      return [
        "WEB RESEARCH NOTES (xAI web_search — unconfirmed; do not EST yet):",
        result.notes.slice(0, 3500),
        "You have live web research this turn — do not claim you have no internet or cannot get online.",
        "Notes do not confirm the queried field. Do NOT give a labeled EST / typical class range. Another rephrased search is required.",
      ].join("\n");
    }
    return [
      "WEB RESEARCH NOTES (xAI web_search — unconfirmed after the research loop):",
      result.notes.slice(0, 3500),
      "You have live web research this turn — do not claim you have no internet or cannot get online.",
      `Catalog lock still wins if it names a number. Research loop exhausted (${gate.attempts} genuine rephrased attempts, all unconfirmed). Use ONLY what these notes actually contain. ${LOW_CONFIDENCE_EST_RULE} Do not invent brochure numbers from training.`,
    ].join("\n");
  }
  if (!gate.exhausted) {
    return `WEB SEARCH NOT AVAILABLE this turn (${result.reason}). Be honest that you could not browse. Do NOT give a labeled EST / typical class range — another rephrased search is required. Do not invent HP, engine, chassis, fuel, a bulletin, or a campaign number as OEM fact.`;
  }
  return `WEB SEARCH NOT AVAILABLE this turn (${result.reason}). Be honest that you could not browse. Search returned nothing after a retry. Say so plainly. ${LOW_CONFIDENCE_EST_RULE} Do not invent HP, engine, chassis, fuel, a bulletin, or a campaign number as OEM fact.`;
}

async function postResponses(opts: {
  apiKey: string;
  body: Record<string, unknown>;
  timeoutMs: number;
}): Promise<
  | { kind: "ok"; data: unknown }
  | { kind: "http"; status: number; text: string }
  | { kind: "abort"; reason: string }
  | { kind: "error"; reason: string }
> {
  try {
    const resp = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify(opts.body),
      signal: AbortSignal.timeout(opts.timeoutMs),
    });
    if (!resp.ok) {
      const raw = await resp.text().catch(() => "");
      return { kind: "http", status: resp.status, text: raw };
    }
    return { kind: "ok", data: await resp.json() };
  } catch (e) {
    const reason = e instanceof Error ? e.message : "web search error";
    if (isAbortLikeError(e)) return { kind: "abort", reason };
    return { kind: "error", reason };
  }
}

export function buildCustomWebSearchRequest(opts: {
  model: string;
  system: string;
  user: string;
  maxOutputTokens?: number;
}): Record<string, unknown> {
  return {
    model: opts.model,
    input: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    tools: [WEB_SEARCH_TOOL],
    temperature: 0.1,
    max_output_tokens: opts.maxOutputTokens ?? 900,
  };
}

/** One query phrasing: model-list retries stay HTTP-only, not a rephrase. */
async function fetchOnePhrasing(opts: {
  apiKey: string;
  query: string;
  originalQuery: string;
  catalogBlock?: string;
  timeoutMs: number;
  models: readonly string[];
  profile: WebSearchProfile;
  attempt: number;
  maxAttempts: number;
  previousQueries: string[];
}): Promise<WebSearchNotes> {
  let last = "web search request failed";
  for (const model of opts.models) {
    let extras = true;
    // At most two POSTs per model: extras, then #113-minimal on HTTP 400.
    for (let httpAttempt = 0; httpAttempt < 2; httpAttempt++) {
      const posted = await postResponses({
        apiKey: opts.apiKey,
        timeoutMs: opts.timeoutMs,
        body: buildWebSearchRequest({
          model,
          query: opts.query,
          catalogBlock: opts.catalogBlock,
          profile: opts.profile,
          extras,
          attempt: opts.attempt,
          maxAttempts: opts.maxAttempts,
          previousQueries: opts.previousQueries,
        }),
      });

      if (posted.kind === "abort") {
        return {
          ok: false,
          reason: posted.reason,
          confirmed: false,
          attempts: opts.attempt,
          exhausted: false,
          queries: [...opts.previousQueries, opts.query],
          query: opts.originalQuery,
        };
      }
      if (posted.kind === "error") {
        last = posted.reason;
        break;
      }
      if (posted.kind === "http") {
        last = formatWebSearchHttpFailure(posted.status, posted.text);
        if (posted.status === 400 && extras) {
          extras = false;
          continue;
        }
        break;
      }

      const notes = extractResponsesText(posted.data);
      if (notes) {
        return {
          ok: true,
          notes,
          model,
          confirmed: notesConfirmQueriedField(notes, opts.originalQuery),
          attempts: opts.attempt,
          exhausted: false,
          queries: [...opts.previousQueries, opts.query],
          query: opts.originalQuery,
        };
      }
      // Empty notes = this phrasing missed. Rephrase next; do not
      // burn the next model id on the same query (HTTP-only retries).
      return {
        ok: false,
        reason: "web search returned empty notes",
        confirmed: false,
        attempts: opts.attempt,
        exhausted: false,
        queries: [...opts.previousQueries, opts.query],
        query: opts.originalQuery,
      };
    }
  }
  return {
    ok: false,
    reason: last,
    confirmed: false,
    attempts: opts.attempt,
    exhausted: false,
    queries: [...opts.previousQueries, opts.query],
    query: opts.originalQuery,
  };
}

export async function fetchWebSearchNotes(opts: {
  apiKey: string | undefined;
  query: string;
  catalogBlock?: string;
  /**
   * Shared wall-clock budget for the whole research loop.
   * Chat default 12s; Live Voice passes 10s. Timeouts do not stack.
   */
  timeoutMs?: number;
  /** Model list to try. Chat default is WEB_SEARCH_MODELS; voice uses one shot. */
  models?: readonly string[];
  profile?: WebSearchProfile;
  /** Override WEB_SEARCH_MAX_TOOL_CALLS (tests / callers). */
  maxAttempts?: number;
}): Promise<WebSearchNotes> {
  const originalQuery = opts.query;
  if (!opts.apiKey) {
    return {
      ok: false,
      reason: "no XAI_API_KEY on the server",
      confirmed: false,
      attempts: 0,
      exhausted: true,
      queries: [],
      query: originalQuery,
    };
  }
  const budgetMs = opts.timeoutMs ?? CHAT_WEB_SEARCH_TIMEOUT_MS;
  const models = opts.models ?? WEB_SEARCH_MODELS;
  const profile = opts.profile ?? "chat";
  const maxAttempts = opts.maxAttempts ?? WEB_SEARCH_MAX_TOOL_CALLS;
  const key = researchCacheKey(originalQuery, opts.catalogBlock);
  const cached = readWebSearchCache(key);
  if (cached?.ok) {
    const confirmed = notesConfirmQueriedField(cached.notes, originalQuery);
    return {
      ...cached,
      confirmed,
      attempts: cached.attempts ?? 1,
      exhausted: !confirmed,
      query: originalQuery,
    };
  }

  const started = Date.now();
  const queriesUsed: string[] = [];
  let accumulated = "";
  let lastFail = "web search request failed";
  let lastModel = "";
  let lastOk = false;
  let abortReason: string | null = null;
  let timeoutRetries = 0;

  for (let i = 0; i < maxAttempts; i++) {
    const remaining = budgetMs - (Date.now() - started);
    if (i > 0 && remaining < WEB_SEARCH_MIN_RETRY_BUDGET_MS) break;

    const phrasing =
      i === 0
        ? originalQuery
        : rephraseResearchQuery(originalQuery, i, queriesUsed);
    const unique =
      queriesUsed.some((q) => normalizeQueryPhrase(q) === normalizeQueryPhrase(phrasing))
        ? rephraseResearchQuery(originalQuery, i + queriesUsed.length, queriesUsed)
        : phrasing;

    const one = await fetchOnePhrasing({
      apiKey: opts.apiKey,
      query: unique,
      originalQuery,
      catalogBlock: opts.catalogBlock,
      timeoutMs: perAttemptTimeoutMs(remaining, i, maxAttempts),
      models,
      profile,
      attempt: i + 1,
      maxAttempts,
      previousQueries: [...queriesUsed],
    });
    queriesUsed.push(unique);

    if (!one.ok && isTimeoutFailureReason(one.reason)) {
      abortReason = one.reason;
      lastFail = one.reason;
      if (timeoutRetries >= WEB_SEARCH_TIMEOUT_RETRIES) break;
      timeoutRetries += 1;
      continue;
    }

    if (one.ok) {
      lastOk = true;
      lastModel = one.model;
      accumulated = joinResearchNotes(accumulated, one.notes);
      if (notesConfirmQueriedField(accumulated, originalQuery)) {
        const result: Extract<WebSearchNotes, { ok: true }> = {
          ok: true,
          notes: accumulated,
          model: lastModel,
          confirmed: true,
          attempts: queriesUsed.length,
          exhausted: false,
          queries: [...queriesUsed],
          query: originalQuery,
        };
        writeWebSearchCache(key, result);
        return result;
      }
    } else {
      lastFail = one.reason;
    }
  }

  const attempts = queriesUsed.length;
  const exhausted = true;
  if (lastOk && accumulated.trim()) {
    return {
      ok: true,
      notes: accumulated,
      model: lastModel,
      confirmed: false,
      attempts,
      exhausted,
      queries: [...queriesUsed],
      query: originalQuery,
    };
  }
  return {
    ok: false,
    reason: abortReason || lastFail,
    confirmed: false,
    attempts,
    exhausted,
    queries: [...queriesUsed],
    query: originalQuery,
  };
}

/** Custom system/user web_search for public listing comps — not chat research. */
export async function fetchWebSearch(opts: {
  apiKey: string | undefined;
  system: string;
  user: string;
  maxOutputTokens?: number;
  timeoutMs?: number;
  models?: readonly string[];
}): Promise<WebSearchNotes> {
  if (!opts.apiKey) {
    return { ok: false, reason: "no XAI_API_KEY on the server" };
  }
  const timeoutMs = opts.timeoutMs ?? 18_000;
  const models = opts.models ?? WEB_SEARCH_MODELS;
  let last = "web search request failed";
  for (const model of models) {
    const posted = await postResponses({
      apiKey: opts.apiKey,
      timeoutMs,
      body: buildCustomWebSearchRequest({
        model,
        system: opts.system,
        user: opts.user,
        maxOutputTokens: opts.maxOutputTokens,
      }),
    });
    if (posted.kind === "abort") {
      return { ok: false, reason: posted.reason };
    }
    if (posted.kind === "error") {
      last = posted.reason;
      continue;
    }
    if (posted.kind === "http") {
      last = formatWebSearchHttpFailure(posted.status, posted.text);
      continue;
    }
    const notes = extractResponsesText(posted.data);
    if (notes) {
      return { ok: true, notes, model };
    }
    last = "web search returned empty notes";
  }
  return { ok: false, reason: last };
}
