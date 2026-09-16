import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mcStr } from "./map";

/**
 * Server-only MarketCheck helpers. API key never leaves the route handlers.
 */

export const MC_BASE =
  process.env.MARKETCHECK_BASE_URL?.trim() || "https://api.marketcheck.com";

const FETCH_MS = 15000;

/** Read key from process env or .env file (Vite sometimes blanks non-VITE_ secrets). */
export function getMarketcheckKey(): string | null {
  const fromEnv = (
    process.env.MARKETCHECK_API_KEY ||
    process.env.MC_API_KEY ||
    ""
  ).trim();
  if (fromEnv) return fromEnv;

  try {
    const envPath = resolve(process.cwd(), ".env");
    const text = readFileSync(envPath, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const m = trimmed.match(
        /^(?:export\s+)?(?:MARKETCHECK_API_KEY|MC_API_KEY)\s*=\s*(.*)$/,
      );
      if (!m) continue;
      let v = m[1]!.trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (v) return v;
    }
  } catch {
    /* no file */
  }
  return null;
}

export function missingKeyResponse() {
  return Response.json(
    {
      ok: false,
      error: "MarketCheck not configured. Add MARKETCHECK_API_KEY on the server.",
      code: "missing_key",
    },
    { status: 503 },
  );
}

export function badRequest(error: string) {
  return Response.json({ ok: false, error, code: "bad_request" }, { status: 400 });
}

export function upstreamError(error: string, status = 502) {
  return Response.json({ ok: false, error, code: "upstream" }, { status });
}

export async function fetchMarketcheckJson(
  url: URL,
): Promise<
  | { ok: true; json: Record<string, unknown>; status: number }
  | { ok: false; response: Response }
> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_MS);
  try {
    const resp = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: ctrl.signal,
    });
    const text = await resp.text();
    let json: Record<string, unknown> = {};
    try {
      json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    } catch {
      return {
        ok: false,
        response: upstreamError(`MarketCheck returned non-JSON (${resp.status})`),
      };
    }

    if (!resp.ok) {
      const msg =
        mcStr(json.message || json.error || json.msg) ||
        `MarketCheck HTTP ${resp.status}`;
      const friendly = /radius limit/i.test(msg)
        ? "Your MarketCheck plan allows up to 100 miles radius. Try 100 mi or less."
        : msg;
      return { ok: false, response: upstreamError(friendly) };
    }

    return { ok: true, json, status: resp.status };
  } catch (e) {
    const msg =
      (e as Error)?.name === "AbortError"
        ? "MarketCheck timed out"
        : e instanceof Error
          ? e.message
          : "MarketCheck request failed";
    return { ok: false, response: upstreamError(msg) };
  } finally {
    clearTimeout(t);
  }
}

export function withPrivateCache(body: unknown, maxAge = 300) {
  return Response.json(body, {
    headers: { "Cache-Control": `private, max-age=${maxAge}` },
  });
}
