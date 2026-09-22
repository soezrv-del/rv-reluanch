/**
 * Optional Google-grounded research sidecar for RV Grok.
 *
 * Chat personality and Live Voice Realtime stay on xAI Grok. Only the
 * browse step (needsWebFallback research turns) may call Gemini +
 * Google Search grounding so OEM GVWR / specs / pricing land closer to
 * Chrome. Missing GEMINI_API_KEY is not an error — callers fall back to
 * the existing xAI web_search loop.
 *
 * This module must not import webSearch.ts at runtime (provider chain
 * lives there and would cycle).
 */

import type { WebSearchNotes, WebSearchProfile } from "./webSearch.ts";

export const GEMINI_RESEARCH_MODEL = "gemini-2.5-flash";
export const GEMINI_RESEARCH_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
] as const;

/** Chat first-shot budget so the xAI loop still has a real window. */
export const GEMINI_CHAT_RESEARCH_TIMEOUT_MS = 10_000;

/** Voice first-shot budget — keep the spoken pause a phone lookup. */
export const GEMINI_VOICE_RESEARCH_TIMEOUT_MS = 4_500;

export const GEMINI_GENERATE_HOST = "generativelanguage.googleapis.com";

const CATALOG_MAX = 700;
const ERROR_SNIPPET_MAX = 200;

export type ResearchProvider = "auto" | "gemini" | "xai";
export type ResolvedResearchProvider = "gemini" | "xai";

export function readGeminiApiKey(explicit?: string): string {
  return (explicit ?? process.env.GEMINI_API_KEY ?? "").trim();
}

export function readResearchProviderPref(explicit?: string): ResearchProvider {
  const raw = (explicit ?? process.env.RVGROK_RESEARCH_PROVIDER ?? "auto")
    .trim()
    .toLowerCase();
  if (raw === "gemini" || raw === "xai") return raw;
  return "auto";
}

/**
 * auto → Gemini when a key is present, else xAI.
 * gemini without a key → xAI (no crash, same as today).
 * xai → always the existing Responses web_search loop.
 */
export function resolveResearchProvider(opts?: {
  provider?: string;
  geminiApiKey?: string;
}): ResolvedResearchProvider {
  const pref = readResearchProviderPref(opts?.provider);
  const key = readGeminiApiKey(opts?.geminiApiKey);
  if (pref === "xai") return "xai";
  if (key) return "gemini";
  return "xai";
}

export function geminiResearchTimeoutMs(profile: WebSearchProfile): number {
  return profile === "voice"
    ? GEMINI_VOICE_RESEARCH_TIMEOUT_MS
    : GEMINI_CHAT_RESEARCH_TIMEOUT_MS;
}

export function geminiGenerateContentUrl(model: string): string {
  return `https://${GEMINI_GENERATE_HOST}/v1beta/models/${model}:generateContent`;
}

export function isGeminiResearchUrl(url: string): boolean {
  return /generativelanguage\.googleapis\.com/i.test(url || "");
}

export function isGeminiResearchModel(model: string): boolean {
  return /^gemini/i.test(model || "");
}

/** Shared injection label — Gemini notes vs xAI notes. */
export function researchNotesSourceLabel(model: string): string {
  return isGeminiResearchModel(model)
    ? "Gemini Google Search grounding"
    : "xAI web_search";
}

function clipCatalog(catalogBlock?: string, max = CATALOG_MAX): string {
  const raw = (catalogBlock || "").trim();
  if (!raw) return "";
  const lockOnly = raw.split(/VERIFIED CATALOG LOCK/i)[0]?.trim() || raw;
  if (lockOnly.length <= max) return lockOnly;
  return `${lockOnly.slice(0, max).trim()}…`;
}

function truncateError(text: string): string {
  return text
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/xai-[A-Za-z0-9_-]{8,}/gi, "[redacted]")
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, ERROR_SNIPPET_MAX);
}

function formatHttpFailure(status: number, bodyText: string): string {
  const snippet = truncateError(bodyText);
  return snippet
    ? `gemini research HTTP ${status}: ${snippet}`
    : `gemini research HTTP ${status}`;
}

function isAbortLike(err: unknown): boolean {
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

/**
 * Same OEM-first research contract as xAI web_search, plus an explicit
 * Google Search tool. Open-web hits are allowed — not factory-PDF-only.
 */
export function geminiResearchInstructions(opts: {
  catalog: string;
  profile: WebSearchProfile;
}): string {
  const lengthRule =
    opts.profile === "voice"
      ? "VOICE: 1–3 spoken sentences. No bullets, no URLs, no markdown, no campaign numbers you cannot support."
      : "CHAT: 4–8 short bullets. No essay. No URLs unless they uniquely identify a bulletin.";
  return [
    "Research ONE RV question for RVFAX. Return short RESEARCH NOTES only — no JSON.",
    "Use the google_search tool. Search the LIVE web first. Prefer OEM / factory brochure / dealer listings (Tiffin, Newmar, Newmar Corp, factory PDF / brochure, dealer listings) over aggregator hedges like 'typically'. Open-web hits are allowed — not factory-PDF-only.",
    "Evaluate whether the results CONFIRM the asked fact (a specific year-matched number, location, procedure, listing band, or OEM pin). If they confirm, write CONFIRMED: yes and the fact plus related specs when found (engine / GCWR / transmission). If they do not confirm, write CONFIRMED: no and what was missing. Do not invent a labeled EST / typical class range / low confidence in these notes — never when a live source exists.",
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

export function buildGeminiResearchRequest(opts: {
  query: string;
  catalogBlock?: string;
  profile?: WebSearchProfile;
  extras?: boolean;
}): Record<string, unknown> {
  const catalog = clipCatalog(opts.catalogBlock);
  const profile = opts.profile ?? "chat";
  const extras = opts.extras !== false;
  const instructions = geminiResearchInstructions({ catalog, profile });

  const body: Record<string, unknown> = {
    systemInstruction: {
      parts: [{ text: instructions }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: `Question: ${opts.query}` }],
      },
    ],
    tools: [{ google_search: {} }],
  };

  if (extras) {
    body.generationConfig = {
      temperature: 0.2,
      maxOutputTokens: profile === "voice" ? 400 : 800,
      // 2.5 Flash thinking adds seconds we cannot spend on a browse sidecar.
      thinkingConfig: { thinkingBudget: 0 },
    };
  }

  return body;
}

export function extractGeminiText(data: unknown): string {
  const d = data as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      text?: string;
    }>;
    text?: string;
  };
  if (typeof d?.text === "string" && d.text.trim()) return d.text.trim();
  const candidate = d?.candidates?.[0];
  if (typeof candidate?.text === "string" && candidate.text.trim()) {
    return candidate.text.trim();
  }
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p) => p?.text || "")
    .join("\n")
    .trim();
}

async function postGemini(opts: {
  apiKey: string;
  model: string;
  body: Record<string, unknown>;
  timeoutMs: number;
}): Promise<
  | { kind: "ok"; data: unknown }
  | { kind: "http"; status: number; text: string }
  | { kind: "abort"; reason: string }
  | { kind: "error"; reason: string }
> {
  try {
    const resp = await fetch(geminiGenerateContentUrl(opts.model), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": opts.apiKey,
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
    const reason = e instanceof Error ? e.message : "gemini research error";
    if (isAbortLike(e)) return { kind: "abort", reason };
    return { kind: "error", reason };
  }
}

/**
 * One Google-grounded generateContent call. Not a Grok replacement —
 * notes only, same WebSearchNotes shape. `confirmed` is filled by the
 * caller via notesConfirmQueriedField.
 */
export async function fetchGeminiResearchNotes(opts: {
  apiKey: string | undefined;
  query: string;
  catalogBlock?: string;
  timeoutMs: number;
  profile?: WebSearchProfile;
  models?: readonly string[];
}): Promise<WebSearchNotes> {
  const originalQuery = opts.query;
  const profile = opts.profile ?? "chat";
  if (!opts.apiKey) {
    return {
      ok: false,
      reason: "no GEMINI_API_KEY on the server",
      confirmed: false,
      attempts: 0,
      exhausted: true,
      queries: [],
      query: originalQuery,
    };
  }

  const models = opts.models ?? GEMINI_RESEARCH_MODELS;
  let last = "gemini research request failed";

  for (const model of models) {
    let extras = true;
    for (let httpAttempt = 0; httpAttempt < 2; httpAttempt++) {
      const posted = await postGemini({
        apiKey: opts.apiKey,
        model,
        timeoutMs: opts.timeoutMs,
        body: buildGeminiResearchRequest({
          query: originalQuery,
          catalogBlock: opts.catalogBlock,
          profile,
          extras,
        }),
      });

      if (posted.kind === "abort") {
        return {
          ok: false,
          reason: posted.reason,
          confirmed: false,
          attempts: 1,
          exhausted: false,
          queries: [originalQuery],
          query: originalQuery,
        };
      }
      if (posted.kind === "error") {
        last = posted.reason;
        break;
      }
      if (posted.kind === "http") {
        last = formatHttpFailure(posted.status, posted.text);
        if (posted.status === 400 && extras) {
          extras = false;
          continue;
        }
        if (posted.status === 404) break;
        return {
          ok: false,
          reason: last,
          confirmed: false,
          attempts: 1,
          exhausted: false,
          queries: [originalQuery],
          query: originalQuery,
        };
      }

      const notes = extractGeminiText(posted.data);
      if (notes) {
        return {
          ok: true,
          notes,
          model,
          confirmed: false,
          attempts: 1,
          exhausted: false,
          queries: [originalQuery],
          query: originalQuery,
        };
      }
      return {
        ok: false,
        reason: "gemini research returned empty notes",
        confirmed: false,
        attempts: 1,
        exhausted: false,
        queries: [originalQuery],
        query: originalQuery,
      };
    }
  }

  return {
    ok: false,
    reason: last,
    confirmed: false,
    attempts: 1,
    exhausted: true,
    queries: [originalQuery],
    query: originalQuery,
  };
}
