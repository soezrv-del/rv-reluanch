/**
 * Server-side observability for the web-research sidecar.
 *
 * Client contract stays soft-fail HTTP 200 + `{ ok: boolean, reason? }`.
 * Monitors and operators get structured logs plus machine-readable `kind` /
 * `durationMs` on the JSON body and matching response headers.
 */

import { needsWebFallback } from "./webIntent.ts";
import {
  formatOwnLotBlock,
  loadOwnLotSnapshot,
  looksLikeOwnLotStockQuestion,
  OWN_LOT_MODEL,
  shouldSkipWebForOwnLot,
  type OwnLotSnapshot,
} from "./ownLotInventory.ts";
import {
  fetchWebSearchNotes,
  readWebSearchCache,
  researchCacheKey,
  WEB_SEARCH_MAX_TOOL_CALLS,
  type WebSearchNotes,
  type WebSearchProfile,
} from "./webSearch.ts";

export type WebResearchKind =
  | "success"
  | "cache_hit"
  | "gated"
  | "timeout"
  | "missing_key"
  | "upstream_error"
  | "empty_response"
  | "network_error"
  | "unknown_failure";

/** API body: WebSearchNotes plus monitor-friendly fields (client ignores extras). */
export type WebResearchApiBody = WebSearchNotes & {
  kind: WebResearchKind;
  durationMs: number;
  cached?: boolean;
};

export type ExecuteWebResearchOpts = {
  query: string;
  catalogBlock?: string;
  apiKey: string | undefined;
  timeoutMs: number;
  models?: readonly string[];
  profile: WebSearchProfile;
  /** When true, skip needsWebFallback and always attempt research. */
  skipGate?: boolean;
  /** Test / caller-provided own-lot snapshot. When omitted, load on stock asks. */
  ownLotSnapshot?: OwnLotSnapshot;
  /** Same-origin host for the deploy-bundled public snapshot. */
  requestOrigin?: string;
  /** Research-loop attempt cap. Defaults to WEB_SEARCH_MAX_TOOL_CALLS (2). */
  maxAttempts?: number;
  /** Override process.env.GEMINI_API_KEY (tests). */
  geminiApiKey?: string;
  /** Override RVGROK_RESEARCH_PROVIDER (auto | gemini | xai). */
  researchProvider?: string;
};

const LOG_TAG = "rvgrok.web_research";

export function classifyWebResearchFailure(reason: string): WebResearchKind {
  const r = (reason || "").trim();
  if (!r) return "unknown_failure";
  if (/no (?:XAI|GEMINI)_API_KEY/i.test(r)) return "missing_key";
  if (/aborted due to timeout|operation was aborted|timed out/i.test(r)) {
    return "timeout";
  }
  if (/^(?:web search|gemini research) HTTP \d+/i.test(r)) {
    return "upstream_error";
  }
  if (/returned empty notes/i.test(r)) return "empty_response";
  if (/fetch failed|network|ECONN|ENOTFOUND|socket/i.test(r)) {
    return "network_error";
  }
  return "unknown_failure";
}

function queryPreview(query: string, max = 80): string {
  return query.replace(/\s+/g, " ").trim().slice(0, max);
}

/** Structured one-line JSON for Vercel runtime logs — no secrets. */
export function logWebResearchEvent(opts: {
  kind: WebResearchKind;
  profile: WebSearchProfile;
  durationMs: number;
  ok: boolean;
  query?: string;
  reason?: string;
  model?: string;
  cached?: boolean;
}): void {
  const payload = {
    tag: LOG_TAG,
    kind: opts.kind,
    profile: opts.profile,
    durationMs: opts.durationMs,
    ok: opts.ok,
    cached: Boolean(opts.cached),
    ...(opts.model ? { model: opts.model } : {}),
    ...(opts.reason ? { reason: opts.reason.slice(0, 200) } : {}),
    ...(opts.query ? { queryPreview: queryPreview(opts.query) } : {}),
  };

  // Gated traffic is normal — never emit warn/error for it.
  if (opts.kind === "gated") {
    console.info(JSON.stringify(payload));
    return;
  }
  if (opts.ok || opts.kind === "cache_hit") {
    console.info(JSON.stringify(payload));
    return;
  }
  console.warn(JSON.stringify(payload));
}

export function researchResponseHeaders(body: WebResearchApiBody): HeadersInit {
  return {
    "Cache-Control": "no-store",
    "X-RvGrok-Research-Kind": body.kind,
    "X-RvGrok-Research-Ms": String(body.durationMs),
    "X-RvGrok-Research-Ok": body.ok ? "true" : "false",
    ...(body.cached ? { "X-RvGrok-Research-Cached": "true" } : {}),
  };
}

export function webResearchJsonResponse(
  body: WebResearchApiBody,
  status = 200,
): Response {
  return Response.json(body, {
    status,
    headers: researchResponseHeaders(body),
  });
}

function toApiBody(
  result: WebSearchNotes,
  meta: { kind: WebResearchKind; durationMs: number; cached?: boolean },
): WebResearchApiBody {
  if (result.ok) {
    return {
      ...result,
      kind: meta.cached ? "cache_hit" : "success",
      durationMs: meta.durationMs,
      ...(meta.cached ? { cached: true } : {}),
    };
  }
  return {
    ...result,
    kind: meta.kind,
    durationMs: meta.durationMs,
  };
}

/**
 * Run web research with timing, classification, cache detection, and logging.
 * Used by the voice sidecar route and the chat proxy (chat logs only; SSE unchanged).
 */
export async function executeWebResearch(
  opts: ExecuteWebResearchOpts,
): Promise<WebResearchApiBody> {
  const t0 = Date.now();
  const query = (opts.query || "").trim();

  let ownLotSnapshot = opts.ownLotSnapshot;
  if (!ownLotSnapshot && looksLikeOwnLotStockQuestion(query)) {
    ownLotSnapshot = await loadOwnLotSnapshot({
      requestOrigin: opts.requestOrigin,
    });
  }
  if (shouldSkipWebForOwnLot(query, ownLotSnapshot)) {
    const notes = formatOwnLotBlock(ownLotSnapshot!, query);
    const durationMs = Date.now() - t0;
    const body = toApiBody(
      { ok: true, notes, model: OWN_LOT_MODEL },
      { kind: "success", durationMs },
    );
    logWebResearchEvent({
      kind: "success",
      profile: opts.profile,
      durationMs,
      ok: true,
      query,
      model: OWN_LOT_MODEL,
    });
    return body;
  }

  if (!opts.skipGate && !needsWebFallback(null, query)) {
    const durationMs = Date.now() - t0;
    const body: WebResearchApiBody = {
      ok: false,
      reason: "not a research question",
      kind: "gated",
      durationMs,
    };
    logWebResearchEvent({
      kind: "gated",
      profile: opts.profile,
      durationMs,
      ok: false,
      query,
      reason: body.reason,
    });
    return body;
  }

  const cacheKey = researchCacheKey(query, opts.catalogBlock);
  const cachedHit = readWebSearchCache(cacheKey);
  if (cachedHit?.ok) {
    const durationMs = Date.now() - t0;
    const body = toApiBody(cachedHit, {
      kind: "cache_hit",
      durationMs,
      cached: true,
    });
    logWebResearchEvent({
      kind: "cache_hit",
      profile: opts.profile,
      durationMs,
      ok: true,
      query,
      model: cachedHit.model,
      cached: true,
    });
    return body;
  }

  const result = await fetchWebSearchNotes({
    apiKey: opts.apiKey,
    query: query.slice(0, 400),
    catalogBlock: opts.catalogBlock,
    timeoutMs: opts.timeoutMs,
    models: opts.models,
    profile: opts.profile,
    maxAttempts: opts.maxAttempts ?? WEB_SEARCH_MAX_TOOL_CALLS,
    geminiApiKey: opts.geminiApiKey,
    researchProvider: opts.researchProvider,
  });

  const durationMs = Date.now() - t0;
  const kind = result.ok
    ? "success"
    : classifyWebResearchFailure(result.reason);

  const body = toApiBody(result, { kind, durationMs });

  logWebResearchEvent({
    kind: body.kind,
    profile: opts.profile,
    durationMs,
    ok: result.ok,
    query,
    reason: result.ok ? undefined : result.reason,
    model: result.ok ? result.model : undefined,
  });

  return body;
}
