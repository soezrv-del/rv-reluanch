import { createFileRoute } from "@tanstack/react-router";
import { needsWebFallback } from "@/lib/rvgrok/webIntent";
import {
  fetchWebSearchNotes,
  VOICE_WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
  type WebSearchNotes,
} from "@/lib/rvgrok/webSearch";

/**
 * POST /api/rvgrok/web-research
 *
 * Sidecar for Live Voice only. Same `fetchWebSearchNotes` + `needsWebFallback`
 * as text chat. Returns raw notes JSON — the client voice-shapes them.
 * Tighter timeout (7s, one model) so a spoken turn does not hang.
 */

type Body = {
  query?: string;
  catalogContext?: string;
};

function json(data: WebSearchNotes, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

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

  if (!needsWebFallback(null, query)) {
    return json({ ok: false, reason: "not a research question" });
  }

  const researched = await fetchWebSearchNotes({
    apiKey: process.env.XAI_API_KEY,
    query: query.slice(0, 400),
    catalogBlock:
      typeof body.catalogContext === "string" ? body.catalogContext : undefined,
    timeoutMs: VOICE_WEB_SEARCH_TIMEOUT_MS,
    models: VOICE_WEB_SEARCH_MODELS,
    profile: "voice",
  });
  return json(researched);
}

export const Route = createFileRoute("/api/rvgrok/web-research")({
  server: {
    handlers: {
      POST: async ({ request }) => handleResearch(request),
    },
  },
});
