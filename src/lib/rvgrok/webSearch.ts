/**
 * Optional xAI web search sidecar for chat when the turn needs live notes
 * (troubleshooting / OEM / forum / manual, or a missing hard spec).
 *
 * Confirmed: Live Search `search_parameters` on chat completions is retired
 * (410 Gone). The working path is POST /v1/responses with { type: "web_search" }.
 *
 * SPEED: grok-4.6 + default reasoning.effort "high" + unbounded tool loops is
 * the 60–70s path. Research uses a fast model, one search, a short prompt,
 * a clipped catalog lock, and a process cache for repeated demo questions.
 * Extra Responses knobs are best-effort — HTTP 400 falls back to the #113
 * minimal shape (model + user input + tools) on the same model.
 *
 * If the key is missing or the call fails, callers must say so honestly —
 * never pretend a brochure or bulletin was fetched.
 */

import { normalizeAskText } from "./webIntent.ts";

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

/** Chat: one primary attempt. HTTP errors may try the next id; timeouts do not stack. */
export const CHAT_WEB_SEARCH_TIMEOUT_MS = 12_000;

/** Live Voice: one model, 7s — fast-path budget, not a 60s hang. */
export const VOICE_WEB_SEARCH_TIMEOUT_MS = 7_000;
export const VOICE_WEB_SEARCH_MODELS = [WEB_SEARCH_MODELS[0]] as const;

/** Bound sequential search/browse loops. One lookup, then write notes. */
export const WEB_SEARCH_MAX_TOOL_CALLS = 1;

/** Catalog lock only — drop the long GROUNDING_RULES essay. */
export const WEB_SEARCH_CATALOG_MAX = 700;

/** Repeated lot-demo questions stay instant on a warm instance. */
export const WEB_SEARCH_CACHE_TTL_MS = 30 * 60 * 1000;
const WEB_SEARCH_CACHE_MAX = 80;

const ERROR_SNIPPET_MAX = 200;

export type WebSearchProfile = "chat" | "voice";

export type WebSearchNotes =
  | { ok: true; notes: string; model: string }
  | { ok: false; reason: string };

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
}): string {
  const lengthRule =
    opts.profile === "voice"
      ? "VOICE: 1–3 spoken sentences. No bullets, no URLs, no markdown, no campaign numbers you cannot support."
      : "CHAT: 4–8 short bullets. No essay. No URLs unless they uniquely identify a bulletin.";
  return [
    "Research ONE RV question for RVFAX. Return short RESEARCH NOTES only — no JSON.",
    "Search ONCE, then write. Do not run a second search or browse extra pages.",
    lengthRule,
    "Match the ask:",
    "- Specs/powertrain: OEM brochure / chassis sheet / door-sticker for THAT year + make + model + floorplan. Never invent horsepower (no silent 450). If not found, write UNKNOWN and what to verify.",
    "- Troubleshooting / how-to / error codes / TSB / recall / install: likely symptoms, common OEM/forum/manual fixes, safety caveats. Cite uncertainty. Do not invent a campaign number or a diagnosis you cannot support.",
    "Never steal powertrain from a sibling model. Entegra Vision is gas F-53 Godzilla, not diesel.",
    "Floorplan letters are labels only — do not decode bunks or a half-bath from the code.",
    opts.catalog
      ? `Catalog lock (do not contradict these numbers):\n${opts.catalog}`
      : "No catalog row was available. If the web does not confirm a number, say UNKNOWN.",
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
}): Record<string, unknown> {
  const catalog = clipCatalogBlock(opts.catalogBlock);
  const profile = opts.profile ?? "chat";
  const extras = opts.extras !== false;
  const instructions = researchInstructions({ catalog, profile });

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
    body.max_tool_calls = WEB_SEARCH_MAX_TOOL_CALLS;
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

export function formatWebSearchInjection(result: WebSearchNotes): string {
  if (result.ok) {
    return [
      "WEB RESEARCH NOTES (xAI web_search — may be incomplete):",
      result.notes.slice(0, 3500),
      "You have live web research this turn — do not claim you have no internet or cannot get online.",
      "Catalog lock still wins if it names a number. Use notes for troubleshooting / OEM / forum context. If notes do not confirm a fact, say unknown / EST.",
    ].join("\n");
  }
  return `WEB SEARCH NOT AVAILABLE this turn (${result.reason}). Be honest that you could not browse. Give your best EST. and what to verify — do not invent HP, engine, chassis, fuel, a bulletin, or a campaign number.`;
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

export async function fetchWebSearchNotes(opts: {
  apiKey: string | undefined;
  query: string;
  catalogBlock?: string;
  /** Per-attempt fetch timeout. Chat default 12s; Live Voice passes 7s. */
  timeoutMs?: number;
  /** Model list to try. Chat default is WEB_SEARCH_MODELS; voice uses one shot. */
  models?: readonly string[];
  profile?: WebSearchProfile;
}): Promise<WebSearchNotes> {
  if (!opts.apiKey) {
    return { ok: false, reason: "no XAI_API_KEY on the server" };
  }
  const timeoutMs = opts.timeoutMs ?? CHAT_WEB_SEARCH_TIMEOUT_MS;
  const models = opts.models ?? WEB_SEARCH_MODELS;
  const profile = opts.profile ?? "chat";
  const key = researchCacheKey(opts.query, opts.catalogBlock);
  const cached = readWebSearchCache(key);
  if (cached) return cached;

  let last = "web search request failed";
  for (const model of models) {
    let extras = true;
    // At most two POSTs per model: extras, then #113-minimal on HTTP 400.
    for (let attempt = 0; attempt < 2; attempt++) {
      const posted = await postResponses({
        apiKey: opts.apiKey,
        timeoutMs,
        body: buildWebSearchRequest({
          model,
          query: opts.query,
          catalogBlock: opts.catalogBlock,
          profile,
          extras,
        }),
      });

      if (posted.kind === "abort") {
        return { ok: false, reason: posted.reason };
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
        const result = { ok: true as const, notes, model };
        writeWebSearchCache(key, result);
        return result;
      }
      last = "web search returned empty notes";
      break;
    }
  }
  return { ok: false, reason: last };
}
