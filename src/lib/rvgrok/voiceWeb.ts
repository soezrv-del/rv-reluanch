/**
 * Live Voice rendering of the shared chat web-research path.
 *
 * Detection is NOT forked: `decideVoiceWebResearch` calls `needsWebFallback`
 * from `webIntent.ts` (same function chat uses via `buildChatGrounding`).
 * The spoken hold is narrower than browse: repair / market / off-catalog /
 * specs / GVWR / engine / pricing / year-make-model speak
 * VOICE_RESEARCH_HOLD_PHRASE ("give me one second") while live search runs.
 * Catalog compares without spec keywords stay offline. Inventory /
 * own-lot inject researches without a stall. Spec asks and catalog miss
 * still research even when the hold is off — search is required, not optional.
 */

import {
  catalogGapNeedsWeb,
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeCasualNonResearch,
  looksLikeCoachFactAsk,
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
  evaluateResearchQuality,
  type WebSearchNotes,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
} from "./webSearch.ts";
import {
  formatCatalogPinWinsSearchMiss,
  LOW_CONFIDENCE_EST_RULE,
} from "./estimatePolicy.ts";
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

/** Sidecar 403 `{ error: "access_required" }` — not an empty search. */
export const VOICE_WEB_ACCESS_BLOCKED_REASON =
  "voice web research blocked (access required)";

export function isVoiceWebAccessBlocked(reason: string): boolean {
  return /access required|research blocked/i.test(reason || "");
}

export const VOICE_RESEARCH_ANSWER_INSTRUCTIONS =
  "Answer the user's last spoken question now. Spoken only — short, conversational, under 20 seconds. Year / make / model reports synthesize live WEB RESEARCH (OEM / factory brochure / dealer first) plus the CATALOG / BROCHURE lock — never training data alone, never say not in listings because own-lot has no unit or only a sibling series. Use WEB RESEARCH notes if they are present and successful. Never claim search failed, timed out, or came back empty unless WEB RESEARCH NOTES or WEB SEARCH NOT AVAILABLE were injected this turn. If notes say access or research is blocked, say that — do not claim search came back empty. If an OWN-LOT INVENTORY block is a hit, speak those lot counts, any listing prices / Low-Avg-High, and Matching units rows printed there — diesel is Class A Diesel + Class Super C (no fuel field); do not invent a VIN, unit, or price; never say the snapshot has no price data when prices are in the block; never say you can't pull specific units or that the snapshot doesn't break out a list when Matching units rows are present or Matched > 0 with prices. Catalog GAP does not apply to inventory / in-stock asks — never say catalog gap, never say check your own lot listing, never ask them to share a year. If Matched is 0, say none on our lot snapshot — never not in listings for a catalog-known coach, never swap a sibling series. If the block says UNAVAILABLE, say unavailable — never speak 0 as a stock count. If catalog is UNKNOWN / GAP on a specs ask (not inventory) or own-lot missed, use the browse notes — never EST / low confidence when live notes confirm a fact; if search returned nothing after a retry, say so plainly and do not invent brochure numbers from training. Do not stop at I don't know. Speak every VERIFIED LOCKED WEIGHTS number — never say you don't have a VERIFIED GVWR. Never read a URL, markdown, or citation list. If notes say WEB SEARCH NOT AVAILABLE, do not claim you looked it up and do not invent a part location. If this is a nationwide market value ask (not our own-lot listing prices): speak Low / Average / High from live nationwide asking prices (year ±2). Never quote a nightly scrape, RVcountry competitor-latest, sample inventory CSV, or a stale comps table. If this is a repair / diagnose ask (or a REPAIR PLAYBOOK is in context): symptoms → uncertain causes → safety (LP, 120V, CO, brakes, tires, structure) → DIY vs pro. Not a certified RV tech. Never invent a torque spec, part number, wiring color, or sensor bypass.";

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
  // Specs / GVWR / engine / pricing / YMM — hold while live search runs.
  if (looksLikeCoachFactAsk(t)) return true;
  if (looksLikeCatalogAnswerableCoachCompare(t)) return false;
  if (looksLikeOffCatalogQuestion(t)) return true;
  if (catalogGapNeedsWeb(specs ?? null, t)) {
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
 * Catalog miss always researches — hold is optional, search is not.
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
  // Catalog miss / GAP / live research: always run the sidecar.
  // Do not skip because the spoken hold is off.
  // Do not skip because a catalog pin exists — first YMM/spec ask
  // still researches (catalog may paint the desk while search runs).
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

export function formatVoiceWebSearchInjection(
  result: WebSearchNotes,
  opts?: { catalogBlock?: string },
): string {
  if (result.ok && /own-lot/i.test(result.model || "")) {
    return [
      "OWN-LOT INVENTORY (RV Country source=own snapshot):",
      stripNotesForSpeech(result.notes),
      "Speak the counts, listing prices, and Matching units rows when present. Diesel is Class A Diesel + Class Super C (no fuel field).",
      "This block is only for an explicit stock ask. Catalog GAP does not apply. Never say catalog gap. Never say check your own lot listing. Never ask them to share a year for inventory.",
      "Do not invent a VIN, stock number, or unit. Never say you can't pull specific units or that the snapshot doesn't break out a list when Matching units rows are present. Brochure catalog is not the lot.",
    ].join("\n");
  }
  const gate = evaluateResearchQuality({ result, query: result.query });
  if (result.ok) {
    const estLine = gate.confirmed
      ? "Notes CONFIRM the queried field — speak that live OEM / brochure / dealer fact. Do not replace it with a labeled EST / typical class range / low confidence."
      : gate.exhausted
        ? `Research loop exhausted (${gate.attempts} genuine rephrased attempts, all unconfirmed). Use ONLY what these notes actually contain. ${LOW_CONFIDENCE_EST_RULE}`
        : "Notes do not confirm the queried field. Do NOT speak a labeled EST / typical class range. Another rephrased search is required.";
    return [
      "WEB RESEARCH NOTES (live this turn — you DID look this up):",
      stripNotesForSpeech(result.notes),
      "Speak a short conversational answer. Do not claim you have no internet.",
      "Do not read URLs, markdown, or citation lists. Catalog lock still wins on numbers.",
      estLine,
    ].join("\n");
  }
  if (isVoiceWebAccessBlocked(result.reason)) {
    return [
      `WEB SEARCH NOT AVAILABLE this turn (${result.reason}).`,
      "Do not claim you looked this up or browsed the web.",
      "Do not claim search came back empty or returned nothing after a retry.",
      "Say access or research is blocked.",
      `Do not invent an OEM pin. ${formatCatalogPinWinsSearchMiss(opts?.catalogBlock)}`,
    ].join(" ");
  }
  const failEst = gate.exhausted
    ? `Search returned nothing after a retry. Say so plainly. ${LOW_CONFIDENCE_EST_RULE} Do not invent an OEM pin. ${formatCatalogPinWinsSearchMiss(opts?.catalogBlock)}`
    : `Do NOT give a labeled EST / typical class range — another rephrased search is required. Do not invent an OEM pin. ${formatCatalogPinWinsSearchMiss(opts?.catalogBlock)}`;
  return [
    `WEB SEARCH NOT AVAILABLE this turn (${result.reason}).`,
    "Do not claim you looked this up or browsed the web.",
    "Do not assert a specific part location you do not have.",
    "Speak a short honest answer.",
    failEst,
  ].join(" ");
}

export function voiceInjectionClaimsLookedUp(injection: string): boolean {
  return (
    /WEB RESEARCH NOTES/.test(injection) &&
    !/WEB SEARCH NOT AVAILABLE/.test(injection)
  );
}

async function readAccessRequiredError(res: Response): Promise<boolean> {
  try {
    const data = (await res.clone().json()) as { error?: string };
    return data?.error === "access_required";
  } catch {
    return false;
  }
}

export async function fetchVoiceWebResearchNotes(opts: {
  query: string;
  catalogContext?: string;
  signal?: AbortSignal;
  /** Session whitelist phone — same credential chat + token send. */
  accessPhone?: string;
}): Promise<WebSearchNotes> {
  try {
    const { accessHeaders, readStoredPhone } = await import(
      "@/lib/access/client"
    );
    const phone = (opts.accessPhone || readStoredPhone() || "").trim();
    const post = (phoneForHeader: string) =>
      fetch("/api/rvgrok/web-research", {
        method: "POST",
        headers: accessHeaders(
          {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          phoneForHeader,
        ),
        body: JSON.stringify({
          query: opts.query,
          catalogContext: opts.catalogContext || undefined,
        }),
        signal:
          opts.signal ?? AbortSignal.timeout(VOICE_WEB_SEARCH_CLIENT_BUDGET_MS),
      });

    let res = await post(phone);
    if (res.status === 403 && (await readAccessRequiredError(res))) {
      const retryPhone = (phone || readStoredPhone() || "").trim();
      if (retryPhone) {
        res = await post(retryPhone);
      }
      if (!res.ok && (await readAccessRequiredError(res))) {
        return { ok: false, reason: VOICE_WEB_ACCESS_BLOCKED_REASON };
      }
    }
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
