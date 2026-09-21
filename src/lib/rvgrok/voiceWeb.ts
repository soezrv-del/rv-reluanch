/**
 * Live Voice rendering of the shared chat web-research path.
 *
 * Detection is NOT forked: `decideVoiceWebResearch` calls `needsWebFallback`
 * from `webIntent.ts` (same function chat uses via `buildChatGrounding`).
 * The spoken hold is narrower than browse: only true last-resort research
 * (repair / market / off-catalog / named-coach or spec + catalog GAP)
 * speaks VOICE_RESEARCH_HOLD_PHRASE ("give me one second"). Catalog
 * compares, inventory/own-lot inject, and generic "what's a good Class A"
 * answers now — no stall.
 */

import {
  catalogGapNeedsWeb,
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeCasualNonResearch,
  looksLikeImageOnlyAsk,
  looksLikeInventoryOrCountQuestion,
  looksLikeLiveResearchQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikeOffCatalogQuestion,
  looksLikeCarfaxQuestion,
  looksLikeOriginQuestion,
  looksLikeSpecQuestion,
  needsWebFallback,
  type WebFallbackSpecs,
} from "./webIntent.ts";
import { looksLikeOwnLotStockQuestion } from "./ownLotInventory.ts";
import {
  type WebSearchNotes,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
} from "./webSearch.ts";
import {
  VOICE_RESEARCH_HOLD_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_PHRASE,
} from "./speechPolicy.ts";

export {
  VOICE_WEB_SEARCH_MODELS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
} from "./webSearch.ts";

export {
  VOICE_RESEARCH_HOLD_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_PHRASE,
} from "./speechPolicy.ts";

/** Client abort slightly above the server voice budget so we receive an honest body. */
export const VOICE_WEB_SEARCH_CLIENT_BUDGET_MS =
  VOICE_WEB_SEARCH_TIMEOUT_MS + 1_000;

export const VOICE_RESEARCH_ANSWER_INSTRUCTIONS =
  "Answer the user's last spoken question now. Spoken only — short, conversational, under 20 seconds. Year / make / model reports speak the CATALOG / BROCHURE lock first — never say not in listings because own-lot has no unit. Use WEB RESEARCH notes if they are present and successful. If an OWN-LOT INVENTORY block is a hit, speak those lot counts, any listing prices / Low-Avg-High, and Matching units rows printed there — diesel is Class A Diesel + Class Super C (no fuel field); do not invent a VIN, unit, or price; never say the snapshot has no price data when prices are in the block; never say you can't pull specific units or that the snapshot doesn't break out a list when Matching units rows are present or Matched > 0 with prices. Catalog GAP does not apply to inventory / in-stock asks — never say catalog gap, never say check your own lot listing, never ask them to share a year. If Matched is 0, say none on our lot snapshot. If the block says UNAVAILABLE, say unavailable — never speak 0 as a stock count. If catalog is UNKNOWN / GAP on a specs ask (not inventory) or own-lot missed, use the browse notes — do not guess, do not stop at I don't know. Never read a URL, markdown, or citation list. If notes say WEB SEARCH NOT AVAILABLE, do not claim you looked it up and do not invent a part location. If this is a nationwide market value ask (not our own-lot listing prices): speak Low / Average / High from live nationwide asking prices (year ±2). Never quote a nightly scrape, RVcountry competitor-latest, sample inventory CSV, or a stale comps table. If this is a repair / diagnose ask (or a REPAIR PLAYBOOK is in context): symptoms → uncertain causes → safety (LP, 120V, CO, brakes, tires, structure) → DIY vs pro. Not a certified RV tech. Never invent a torque spec, part number, wiring color, or sensor bypass.";

export type VoiceWebDecision =
  | { action: "pass" }
  | {
      action: "research";
      query: string;
      catalogBlock: string;
      speakHold: boolean;
    };

/**
 * Spoken hold only when Grok genuinely does not know and must wait on
 * a web search. Inventory / own-lot still fetches (no public web) but
 * does not stall. Generic catalog-gap small talk answers now.
 */
export function shouldSpeakVoiceResearchHold(
  transcript: string,
  specs?: WebFallbackSpecs,
): boolean {
  const t = (transcript || "").trim();
  if (!t) return false;
  if (looksLikeCasualNonResearch(t) || looksLikeImageOnlyAsk(t)) return false;
  if (looksLikeOriginQuestion(t)) return false;
  if (looksLikeCarfaxQuestion(t)) return false;
  if (looksLikeOwnLotStockQuestion(t) || looksLikeInventoryOrCountQuestion(t)) {
    return false;
  }
  // Forum / repair / manual still hold even when both coaches are known.
  if (looksLikeLiveResearchQuestion(t)) return true;
  if (looksLikeCatalogAnswerableCoachCompare(t)) return false;
  if (looksLikeOffCatalogQuestion(t)) return true;
  if (catalogGapNeedsWeb(specs ?? null)) {
    if (looksLikeNamedCoachProductQuestion(t) || looksLikeSpecQuestion(t)) {
      return true;
    }
  }
  return false;
}

/**
 * Same trigger as text chat: `needsWebFallback` from `webIntent.ts`.
 * Callers pass specs from `buildChatGrounding` when a coach is in context.
 * Greetings / lifestyle / payment stay on the catalog-only voice path.
 * Non-true-research asks (except inventory inject) pass — answer now.
 */
export function decideVoiceWebResearch(opts: {
  transcript: string;
  specs?: WebFallbackSpecs;
  catalogBlock?: string;
}): VoiceWebDecision {
  const transcript = (opts.transcript || "").trim();
  if (!transcript) return { action: "pass" };
  if (!needsWebFallback(opts.specs ?? null, transcript)) {
    return { action: "pass" };
  }
  const speakHold = shouldSpeakVoiceResearchHold(transcript, opts.specs);
  const inventory =
    looksLikeInventoryOrCountQuestion(transcript) ||
    looksLikeOwnLotStockQuestion(transcript);
  if (!speakHold && !inventory) {
    return { action: "pass" };
  }
  return {
    action: "research",
    query: transcript.slice(0, 400),
    catalogBlock: (opts.catalogBlock || "").trim(),
    speakHold,
  };
}

/** Strip URLs / markdown so Live Voice does not read citations aloud. */
export function stripNotesForSpeech(notes: string): string {
  return notes
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\[[^\]]*\]\(/g, "")
    .replace(/[#*_`>]+/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim()
    .slice(0, 1200);
}

export function formatVoiceWebSearchInjection(result: WebSearchNotes): string {
  if (result.ok && /own-lot/i.test(result.model || "")) {
    return [
      "OWN-LOT INVENTORY (RV Country source=own snapshot):",
      stripNotesForSpeech(result.notes),
      "Speak the counts, listing prices, and Matching units rows when present. Diesel is Class A Diesel + Class Super C (no fuel field).",
      "This block is only for an explicit stock ask. Catalog GAP does not apply. Never say catalog gap. Never say check your own lot listing. Never ask them to share a year for inventory.",
      "Do not invent a VIN, stock number, or unit. Never say you can't pull specific units or that the snapshot doesn't break out a list when Matching units rows are present. Brochure catalog is not the lot.",
    ].join("\n");
  }
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
    const { accessHeaders } = await import("@/lib/access/client");
    const res = await fetch("/api/rvgrok/web-research", {
      method: "POST",
      headers: accessHeaders({
        "Content-Type": "application/json",
        Accept: "application/json",
      }),
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
    if (opts.signal?.aborted) {
      return { ok: false, reason: "web search timed out" };
    }
    const msg = e instanceof Error ? e.message : "voice web research error";
    if (/abort|timeout/i.test(msg)) {
      return { ok: false, reason: "web search timed out" };
    }
    return { ok: false, reason: msg };
  }
}
