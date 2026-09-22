import { createFileRoute } from "@tanstack/react-router";
import { denyUnlessWhitelisted } from "@/lib/access/httpGate";
import {
  executeWebResearch,
  webResearchJsonResponse,
} from "@/lib/rvgrok/webResearchTelemetry";
import {
  VOICE_WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
  WEB_SEARCH_MAX_TOOL_CALLS,
} from "@/lib/rvgrok/webSearch";

/**
 * POST /api/rvgrok/web-research
 *
 * Sidecar for Live Voice only. Same research stack as text chat.
 * Returns soft-fail HTTP 200 with `{ ok, kind, durationMs, ... }` so voice
 * degrades gracefully; failures are observable via logs + response headers.
 */

type Body = {
  query?: string;
  catalogContext?: string;
};

async function handleResearch(request: Request): Promise<Response> {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  if (!query) {
    return Response.json({ error: "query is required" }, { status: 400 });
  }

  let requestOrigin = "";
  try {
    requestOrigin = new URL(request.url).origin;
  } catch {
    requestOrigin = "";
  }

  const researched = await executeWebResearch({
    query,
    catalogBlock:
      typeof body.catalogContext === "string" ? body.catalogContext : undefined,
    apiKey: process.env.XAI_API_KEY,
    timeoutMs: VOICE_WEB_SEARCH_TIMEOUT_MS,
    models: VOICE_WEB_SEARCH_MODELS,
    profile: "voice",
    requestOrigin,
    // Live Voice already decided via needsWebFallback — do not re-gate
    // with null specs and skip a catalog miss.
    skipGate: true,
    maxAttempts: WEB_SEARCH_MAX_TOOL_CALLS,
  });

  return webResearchJsonResponse(researched);
}

export const Route = createFileRoute("/api/rvgrok/web-research")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await denyUnlessWhitelisted(request);
        if (denied) return denied;
        return handleResearch(request);
      },
    },
  },
});
