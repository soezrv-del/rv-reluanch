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
  isTimeoutFailureReason,
  readWebSearchCache,
  researchCacheKey,
  WEB_SEARCH_MAX_TOOL_CALLS,
  type WebSearchNotes,
  type WebSearchProfile,
} from "./webSearch.ts";
import {
  formatCatalogPinTimeoutNotes,
  looksLikeCoachReportAsk,
} from "./coachReport.ts";
import {
  planCoachKnowledgeRead,
  planCoachKnowledgeWrite,
  resolveKnowledgeIdentity,
  type CoachKnowledgeRecord,
  type CoachKnowledgeWritePlan,
} from "./coachKnowledge.ts";
import type { CoachIdentity } from "./coachIdentity.ts";
import { planCatalogFirstSkip } from "./researchOrder.ts";

export type WebResearchKind =
  | "success"
  | "cache_hit"
  | "knowledge_hit"
  | "catalog_hit"
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
  /** Caller-provided own-lot snapshot. When omitted, load on stock asks. */
  ownLotSnapshot?: OwnLotSnapshot;
  /** Same-origin host for the deploy-bundled public snapshot. */
  requestOrigin?: string;
  /** Research-loop attempt cap. Defaults to WEB_SEARCH_MAX_TOOL_CALLS (2). */
  maxAttempts?: number;
  /** Override process.env.GEMINI_API_KEY (tests). */
  geminiApiKey?: string;
  /** Override RVGROK_RESEARCH_PROVIDER (auto | gemini | xai). */
  researchProvider?: string;
  /** Access-admin research order (search-first default | catalog-first). */
  researchOrder?: string;
  /** Desk lock from buildChatGrounding when the caller already resolved it. */
  identity?: CoachIdentity | null;
  /**
   * Test seam for the shared Neon sidecar. Production uses the store.
   * node:test skips Neon unless these hooks are passed.
   */
  knowledge?: {
    load?: (
      identity: CoachIdentity,
    ) => Promise<CoachKnowledgeRecord | null> | CoachKnowledgeRecord | null;
    upsert?: (
      plan: CoachKnowledgeWritePlan,
    ) => Promise<unknown> | unknown;
  };
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
  if (opts.ok || opts.kind === "cache_hit" || opts.kind === "catalog_hit") {
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

/** Timeout / empty browse: still answer from catalog pins. Never invent. */
function salvageCoachReportResearch(
  result: WebSearchNotes,
  catalogBlock: string | undefined,
  query: string,
): WebSearchNotes {
  if (result.ok) return result;
  if (/access required|research blocked/i.test(result.reason || "")) {
    return result;
  }
  if (!looksLikeCoachReportAsk(query)) return result;
  if (
    !isTimeoutFailureReason(result.reason) &&
    !/empty notes/i.test(result.reason || "")
  ) {
    return result;
  }
  const notes = formatCatalogPinTimeoutNotes({ catalogBlock, query });
  if (!notes) return result;
  return {
    ok: true,
    notes,
    model: "catalog-pin",
    confirmed: true,
    attempts: result.attempts ?? 0,
    exhausted: true,
    queries: result.queries,
    query,
  };
}

async function loadSharedCoachKnowledge(
  identity: CoachIdentity,
  hooks?: ExecuteWebResearchOpts["knowledge"],
): Promise<CoachKnowledgeRecord | null> {
  if (hooks?.load) {
    try {
      return (await hooks.load(identity)) ?? null;
    } catch {
      return null;
    }
  }
  if (process.env.NODE_TEST_CONTEXT) return null;
  try {
    const { loadCoachKnowledge } = await import("./coachKnowledgeStore.ts");
    return await loadCoachKnowledge(identity);
  } catch {
    return null;
  }
}

async function writeSharedCoachKnowledge(
  plan: CoachKnowledgeWritePlan,
  hooks?: ExecuteWebResearchOpts["knowledge"],
): Promise<void> {
  if (hooks?.upsert) {
    try {
      await hooks.upsert(plan);
    } catch {
      /* fail-soft */
    }
    return;
  }
  if (process.env.NODE_TEST_CONTEXT) return;
  try {
    const { upsertCoachKnowledgePlan } = await import("./coachKnowledgeStore.ts");
    await upsertCoachKnowledgePlan(plan);
  } catch {
    /* fail-soft — research already succeeded */
  }
}

function toApiBody(
  result: WebSearchNotes,
  meta: { kind: WebResearchKind; durationMs: number; cached?: boolean },
): WebResearchApiBody {
  if (result.ok) {
    const kind =
      meta.kind === "knowledge_hit" ||
      meta.kind === "cache_hit" ||
      meta.kind === "catalog_hit"
        ? meta.kind
        : meta.cached
          ? "cache_hit"
          : "success";
    return {
      ...result,
      kind,
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

  const identity = resolveKnowledgeIdentity(
    query,
    opts.catalogBlock,
    opts.identity,
  );
  const stored = identity
    ? await loadSharedCoachKnowledge(identity, opts.knowledge)
    : null;
  const knowledgeRead = identity
    ? planCoachKnowledgeRead({ identity, query, record: stored })
    : null;

  if (knowledgeRead?.skipLive && knowledgeRead.notes) {
    const durationMs = Date.now() - t0;
    const hit: WebSearchNotes = {
      ok: true,
      notes: knowledgeRead.notes,
      model: "coach-knowledge",
      confirmed: true,
      attempts: 0,
      exhausted: false,
      query,
    };
    const body = toApiBody(hit, { kind: "knowledge_hit", durationMs });
    logWebResearchEvent({
      kind: "knowledge_hit",
      profile: opts.profile,
      durationMs,
      ok: true,
      query,
      model: "coach-knowledge",
    });
    return body;
  }

  let catalogPinNotes = "";
  try {
    const catalogSkip = planCatalogFirstSkip({
      order: opts.researchOrder,
      query,
      catalogBlock: opts.catalogBlock,
    });
    if (catalogSkip.skipLive) {
      catalogPinNotes =
        formatCatalogPinTimeoutNotes({
          catalogBlock: opts.catalogBlock,
          query,
        }) || catalogSkip.notes;
    }
  } catch {
    catalogPinNotes = "";
  }
  if (catalogPinNotes) {
    const durationMs = Date.now() - t0;
    const hit: WebSearchNotes = {
      ok: true,
      notes: catalogPinNotes,
      model: "catalog-pin",
      confirmed: true,
      attempts: 0,
      exhausted: false,
      query,
    };
    const body = toApiBody(hit, { kind: "catalog_hit", durationMs });
    logWebResearchEvent({
      kind: "catalog_hit",
      profile: opts.profile,
      durationMs,
      ok: true,
      query,
      model: "catalog-pin",
    });
    return body;
  }

  const catalogBlock = knowledgeRead?.catalogAddendum
    ? [opts.catalogBlock, knowledgeRead.catalogAddendum].filter(Boolean).join("\n\n")
    : opts.catalogBlock;

  const result = salvageCoachReportResearch(
    await fetchWebSearchNotes({
      apiKey: opts.apiKey,
      query: query.slice(0, 400),
      catalogBlock,
      timeoutMs: opts.timeoutMs,
      models: opts.models,
      profile: opts.profile,
      maxAttempts: opts.maxAttempts ?? WEB_SEARCH_MAX_TOOL_CALLS,
      geminiApiKey: opts.geminiApiKey,
      researchProvider: opts.researchProvider,
    }),
    catalogBlock,
    query,
  );

  const durationMs = Date.now() - t0;
  const kind = result.ok
    ? "success"
    : classifyWebResearchFailure(result.reason);

  const mergedNotes =
    result.ok && knowledgeRead?.notes
      ? `${knowledgeRead.notes}\n---\n${result.notes}`
      : null;
  const body = toApiBody(
    mergedNotes && result.ok ? { ...result, notes: mergedNotes } : result,
    { kind, durationMs },
  );

  if (body.kind === "success" && result.ok && result.confirmed !== false) {
    const write = planCoachKnowledgeWrite({
      identity,
      query,
      result,
    });
    if (write) await writeSharedCoachKnowledge(write, opts.knowledge);
  }

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
