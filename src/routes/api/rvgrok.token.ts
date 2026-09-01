import { createFileRoute } from "@tanstack/react-router";
import { DEFAULT_WORKER_URL } from "@/lib/rvgrok/types";

const XAI_CLIENT_SECRETS = "https://api.x.ai/v1/realtime/client_secrets";

/**
 * GET/POST /api/rvgrok/token
 *
 * Mint an ephemeral xAI Realtime token for the browser / TestFlight WebView.
 * Never returns XAI_API_KEY. Order: xAI client_secrets (when key present),
 * then the Cloudflare worker (legacy / backup).
 */
function workerBase() {
  return (
    process.env.CLOUDFLARE_WORKER_URL ||
    process.env.VITE_CLOUDFLARE_WORKER_URL ||
    DEFAULT_WORKER_URL
  ).replace(/\/$/, "");
}

function jsonHeaders() {
  return {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  };
}

async function mintFromXaiKey(): Promise<Response | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  try {
    const resp = await fetch(XAI_CLIENT_SECRETS, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        expires_after: { seconds: 300 },
      }),
    });
    const text = await resp.text();
    if (!resp.ok) return null;
    return new Response(text, { status: 200, headers: jsonHeaders() });
  } catch {
    return null;
  }
}

async function mintFromWorker(method: "GET" | "POST"): Promise<Response> {
  try {
    const resp = await fetch(`${workerBase()}/get-ephemeral-token`, {
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
      headers: jsonHeaders(),
    });
  } catch (e) {
    return Response.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Failed to reach Cloudflare worker",
      },
      { status: 502, headers: jsonHeaders() },
    );
  }
}

async function mintEphemeralToken(method: "GET" | "POST") {
  const plan: Array<"xai" | "worker"> = process.env.XAI_API_KEY
    ? ["xai", "worker"]
    : ["worker"];
  for (const step of plan) {
    if (step === "xai") {
      const minted = await mintFromXaiKey();
      if (minted) return minted;
      continue;
    }
    return mintFromWorker(method);
  }
  return Response.json(
    { error: "Voice token is not configured" },
    { status: 503, headers: jsonHeaders() },
  );
}

export const Route = createFileRoute("/api/rvgrok/token")({
  server: {
    handlers: {
      GET: async () => mintEphemeralToken("GET"),
      POST: async () => mintEphemeralToken("POST"),
    },
  },
});
