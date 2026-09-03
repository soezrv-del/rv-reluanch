/**
 * Live Voice rendering of the shared chat web-research path.
 *
 * Detection is NOT forked: `decideVoiceWebResearch` calls `buildChatGrounding`
 * (same `needsWebFallback` / `webIntent.ts` chat uses). This module only
 * shapes notes for speech, bounds latency, and fetches the sidecar.
 */

import type { ActiveCoach } from "../rv/activeCoach";
import { buildChatGrounding } from "./grounding";
import {
  type WebSearchNotes,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
} from "./webSearch";

export {
  VOICE_WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
} from "./webSearch";

/** Client abort slightly above the server 7s budget so we receive an honest body. */
export const VOICE_WEB_SEARCH_CLIENT_BUDGET_MS =
  VOICE_WEB_SEARCH_TIMEOUT_MS + 1_000;

export const VOICE_RESEARCH_HOLD_INSTRUCTIONS =
  "Say only this one short beat, then stop: Let me check that. Do not answer the question. Do not guess a location or spec.";

export const VOICE_RESEARCH_ANSWER_INSTRUCTIONS =
  "Answer the user's last spoken question now. Spoken only — short, conversational, under 20 seconds. Use WEB RESEARCH notes if they are present and successful. Never read a URL, markdown, or citation list. If notes say WEB SEARCH NOT AVAILABLE, do not claim you looked it up and do not invent a part location.";

export type VoiceWebDecision =
  | { action: "pass" }
  | { action: "research"; query: string; catalogBlock: string };

/**
 * Same trigger as text chat: `buildChatGrounding` → `needsWebFallback`.
 * Greetings / lifestyle / payment stay on the catalog-only voice path.
 */
export function decideVoiceWebResearch(opts: {
  transcript: string;
  facts?: ActiveCoach | null;
}): VoiceWebDecision {
  const transcript = (opts.transcript || "").trim();
  if (!transcript) return { action: "pass" };
  const grounded = buildChatGrounding({
    query: transcript,
    facts: opts.facts ?? null,
  });
  if (!grounded.needsWeb) return { action: "pass" };
  return {
    action: "research",
    query: transcript.slice(0, 400),
    catalogBlock: grounded.block,
  };
}

/** Strip URLs / markdown so Live Voice does not read citations aloud. */
export function stripNotesForSpeech(notes: string): string {
  return notes
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/[#*_`>]+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, 1200);
}

export function formatVoiceWebSearchInjection(result: WebSearchNotes): string {
  if (result.ok) {
    return [
      "WEB RESEARCH NOTES (live this turn — you DID look this up):",
      stripNotesForSpeech(result.notes),
      "Speak a short conversational answer. Do not claim you have no internet.",
      "Do not read URLs, markdown, or citation lists. Catalog lock still wins on numbers.",
      "If notes do not confirm a fact, say you are not sure — do not invent a location or spec.",
    ].join("\n");
  }
  return [
    `WEB SEARCH NOT AVAILABLE this turn (${result.reason}).`,
    "Do not claim you looked this up or browsed the web.",
    "Do not assert a specific part location you do not have.",
    "Speak a short honest catalog-only answer and what to verify. Do not invent.",
  ].join(" ");
}

export function voiceInjectionClaimsLookedUp(injection: string): boolean {
  return (
    /WEB RESEARCH NOTES/.test(injection) &&
    !/WEB SEARCH NOT AVAILABLE/.test(injection)
  );
}

export async function fetchVoiceWebResearchNotes(opts: {
  query: string;
  catalogContext?: string;
  signal?: AbortSignal;
}): Promise<WebSearchNotes> {
  try {
    const res = await fetch("/api/rvgrok/web-research", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: opts.query,
        catalogContext: opts.catalogContext || undefined,
      }),
      signal:
        opts.signal ?? AbortSignal.timeout(VOICE_WEB_SEARCH_CLIENT_BUDGET_MS),
    });
    if (!res.ok) {
      return { ok: false, reason: `voice web research HTTP ${res.status}` };
    }
    const data = (await res.json()) as WebSearchNotes;
    if (data && typeof data.ok === "boolean") return data;
    return { ok: false, reason: "voice web research returned an invalid body" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "voice web research error";
    if (/abort|timeout/i.test(msg)) {
      return { ok: false, reason: "web search timed out" };
    }
    return { ok: false, reason: msg };
  }
}
