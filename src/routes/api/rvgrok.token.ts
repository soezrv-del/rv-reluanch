import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_WORKER_URL } from "@/lib/rvgrok/types";

/**
 * GET /api/rvgrok/token
 * Proxies Cloudflare Worker ephemeral token for xAI Grok Voice realtime.
 */
async function proxyEphemeralToken(method: "GET" | "POST") {
  const base = (
    process.env.CLOUDFLARE_WORKER_URL ||
    process.env.VITE_CLOUDFLARE_WORKER_URL ||
    DEFAULT_WORKER_URL
  ).replace(/\/$/, "");

  try {
    const resp = await fetch(`${base}/get-ephemeral-token`, {
      method,
      headers:
        method === "POST"
          ? {
              Accept: "application/json",
              "Content-Type": "application/json",
            }
          : { Accept: "application/json" },
      body: method === "POST" ? "{}" : undefined,
    });
    const text = await resp.text();
    return new Response(text, {
      status: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to reach Cloudflare worker",
      },
      { status: 502 },
    );
  }
}

export const Route = createFileRoute("/api/rvgrok/token")({
  server: {
    handlers: {
      GET: async () => proxyEphemeralToken("GET"),
      POST: async () => proxyEphemeralToken("POST"),
    },
  },
});
