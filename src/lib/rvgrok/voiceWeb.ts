/**
 * Live Voice rendering of the shared chat web-research path.
 *
 * Detection follows `needsWebFallback`. A shopper payment and a shopper
 * buying digit search. An owner skips search only when the pin covers
 * this floorplan and this field. The spoken hold is
 * VOICE_RESEARCH_HOLD_PHRASE ("give me one second") only while that search runs.
 */

import {
  looksLikeCarfaxQuestion,
  looksLikeImageOnlyAsk,
  looksLikeInventoryOrCountQuestion,
  looksLikeOriginQuestion,
  looksLikeSpecQuestion,
  needsWebFallback,
  type WebFallbackOpts,
  type WebFallbackSpecs,
} from "./webIntent.ts";
import { savedPinCoversAskedField } from "./lockedWeights.ts";
import type { Audience } from "./speechPolicy.ts";
import {
  factsSpecRequestsWebSearch,
  isFactsScreen,
} from "./factsScreenPolicy.ts";
import {
  isOwnLotResearchNotes,
  looksLikeLotInventoryPhrase,
  looksLikeOwnLotCountOrRankAsk,
  mentionsPrintedLotSpec,
  looksLikeOwnLotStockQuestion,
  ownLotNotesForSpeech,
} from "./ownLotAsk.ts";

export { isOwnLotResearchNotes, ownLotNotesForSpeech };
import {
  evaluateResearchQuality,
  type WebSearchNotes,
  SPEC_REPORT_RESEARCH_TIMEOUT_MS,
  VOICE_WEB_SEARCH_TIMEOUT_MS,
} from "./webSearch.ts";
import {
  buildCoachReportFromNotes,
  formatCoachReportTimeoutReply,
  formatCoachReportVoiceCue,
  looksLikeCoachReportAsk,
} from "./coachReport.ts";
import {
  formatCatalogPinWinsSearchMiss,
  LOW_CONFIDENCE_EST_RULE,
  searchMissHasCatalogPins,
} from "./estimatePolicy.ts";
import {
  VOICE_RESEARCH_HOLD_INSTRUCTIONS,
  VOICE_RESEARCH_HOLD_PHRASE,
} from "./speechPolicy.ts";
import {
  fetchWithResearchAccess,
  isResearchAccessBlocked,
  readAccessRequiredError,
  researchAccessHeaders,
  RESEARCH_ACCESS_BLOCKED_REASON,
} from "../access/researchUnlock.ts";

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

/** Spec / report sidecar — chat-class window, not the talk-only 25s client abort. */
export const SPEC_REPORT_RESEARCH_CLIENT_BUDGET_MS =
  SPEC_REPORT_RESEARCH_TIMEOUT_MS + 1_000;

/** Talk-only stays short; a specs / report ask must not abort at the 10s / 25s window. */
export function voiceWebSearchClientBudgetMs(query: string): number {
  return looksLikeCoachReportAsk(query)
    ? SPEC_REPORT_RESEARCH_CLIENT_BUDGET_MS
    : VOICE_WEB_SEARCH_CLIENT_BUDGET_MS;
}

/** Sidecar 403 `{ error: "access_required" }` — not an empty search. */
export const VOICE_WEB_ACCESS_BLOCKED_REASON = RESEARCH_ACCESS_BLOCKED_REASON;

export function isVoiceWebAccessBlocked(reason: string): boolean {
  return isResearchAccessBlocked(reason);
}

export const VOICE_RESEARCH_ANSWER_INSTRUCTIONS =
  "Same standing voice: fun and playful. The first sentence is the answer. Answer the user's last spoken question now. Spoken only — short, under 20 seconds. Year / make / model reports synthesize live WEB RESEARCH (OEM / factory brochure / dealer first) plus the CATALOG / BROCHURE lock — never training data alone. Use WEB RESEARCH notes if they are present and successful. Never claim search failed, timed out, or came back empty unless WEB RESEARCH NOTES or WEB SEARCH NOT AVAILABLE were injected this turn. If notes say access or research is blocked, say that — do not claim search came back empty. If catalog is UNKNOWN / GAP on a specs ask, use the browse notes — never EST / low confidence when live notes confirm a fact; if a VERIFIED catalog pin is in context, speak those OEM numbers FIRST and do not lead with search timed out or returned nothing after a retry; if there is no saved pin for this coach, use the closest saved pin, otherwise the closest web figure. For a GVWR or other spec pin, aim for 85 to 90 percent accuracy. Never refuse or stall a spec pin because the match is not perfect. Lot inventory is exact: name only units printed in the lot block or returned by query_lot. If none match, say none. Do not invent a unit, price, stock number, or store. Do not invent brochure numbers from training. Do not stop at I don't know. Speak every VERIFIED LOCKED WEIGHTS number — never say you don't have a VERIFIED GVWR. Never read a URL, markdown, or citation list. If notes say WEB SEARCH NOT AVAILABLE, do not claim you looked it up and do not invent a part location. If this is a nationwide market value ask: speak Low / Average / High from live nationwide asking prices (year ±2). Never quote a nightly scrape, RVcountry competitor-latest, sample listings CSV, or a stale comps table. If this is a repair / diagnose ask (or a REPAIR PLAYBOOK is in context): symptoms → uncertain causes → safety (LP, 120V, CO, brakes, tires, structure) → DIY vs pro. Not a certified RV tech. Never invent a torque spec, part number, wiring color, or sensor bypass.";

export type VoiceWebDecision =
  | { action: "pass" }
  | {
      action: "research";
      query: string;
      catalogBlock: string;
      speakHold: boolean;
    };

/**
 * Hold only while a tool is about to run. A greeting does not hold.
 * A payment holds, because a shopper payment searches.
 */
export function shouldSpeakVoiceResearchHold(
  transcript: string,
  specs?: WebFallbackSpecs,
  opts?: WebFallbackOpts,
): boolean {
  const t = (transcript || "").trim();
  if (!t) return false;
  if (looksLikeOriginQuestion(t) || looksLikeCarfaxQuestion(t)) return false;
  if (looksLikeImageOnlyAsk(t)) return false;
  // Lot questions use query_lot. That tool has its own hold. This one is web.
  if (
    looksLikeLotInventoryPhrase(t) ||
    looksLikeInventoryOrCountQuestion(t) ||
    looksLikeOwnLotStockQuestion(t) ||
    looksLikeOwnLotCountOrRankAsk(t)
  ) {
    return false;
  }
  return needsWebFallback(specs ?? null, t, opts);
}

/**
 * Same trigger as text chat: `needsWebFallback` from `webIntent.ts`.
 * Shopper searches a buying digit. Owner skips only when the caller set
 * pinCoversAskedField for this floorplan and this field.
 * Hold only while that search is actually about to run.
 */
export function decideVoiceWebResearch(opts: {
  transcript: string;
  specs?: WebFallbackSpecs & {
    identity?: Parameters<typeof savedPinCoversAskedField>[0];
  };
  catalogBlock?: string;
  screen?: string;
  /** A prior lot filter is in the session and this sentence refers back to it. */
  lotFollowUp?: boolean;
  /** Missing tag is shopper. */
  audience?: Audience;
  /** Caller sets this. Shopper ignores it. */
  pinCoversAskedField?: boolean;
}): VoiceWebDecision {
  const transcript = (opts.transcript || "").trim();
  if (!transcript) return { action: "pass" };
  const gate: WebFallbackOpts = {
    audience: opts.audience,
    pinCoversAskedField:
      opts.pinCoversAskedField ??
      savedPinCoversAskedField(opts.specs?.identity, transcript),
  };
  const screen = (opts.screen || "").trim();
  if (isFactsScreen(screen) && factsSpecRequestsWebSearch(screen, transcript)) {
    return {
      action: "research",
      query: transcript.slice(0, 400),
      catalogBlock: (opts.catalogBlock || "").trim(),
      speakHold: shouldSpeakVoiceResearchHold(transcript, opts.specs, gate),
    };
  }
  // Our lot. The query_lot tool answers a count, a cheapest, availability,
  // or a stock number. Web notes are not added. A spec question still
  // researches. A Facts spec that also asks stock already returned above.
  const lotOnly =
    looksLikeOwnLotCountOrRankAsk(transcript) ||
    looksLikeOwnLotStockQuestion(transcript) ||
    looksLikeInventoryOrCountQuestion(transcript) ||
    Boolean(opts.lotFollowUp);
  if (
    lotOnly &&
    (!looksLikeSpecQuestion(transcript) || mentionsPrintedLotSpec(transcript))
  ) {
    return { action: "pass" };
  }
  if (!needsWebFallback(opts.specs ?? null, transcript, gate)) {
    return { action: "pass" };
  }
  // needsWebFallback already opted in. External asks always run the sidecar.
  return {
    action: "research",
    query: transcript.slice(0, 400),
    catalogBlock: (opts.catalogBlock || "").trim(),
    speakHold: shouldSpeakVoiceResearchHold(transcript, opts.specs, gate),
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
  if (result.ok && isOwnLotResearchNotes(result.notes || "")) {
    return ownLotNotesForSpeech(result.notes);
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
      "Do not read URLs, markdown, or citation lists. A saved pin is the best available answer. Use the closest saved pin when one exists, and otherwise use these web notes. Never skip the answer because the match is not perfect.",
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
  const pinRule = formatCatalogPinWinsSearchMiss(opts?.catalogBlock);
  if (searchMissHasCatalogPins(opts?.catalogBlock)) {
    const report = looksLikeCoachReportAsk(result.query || "")
      ? buildCoachReportFromNotes({
          notes: "",
          catalogBlock: opts?.catalogBlock,
          query: result.query,
        })
      : null;
    const spoken = report
      ? formatCoachReportVoiceCue(report) || formatCoachReportTimeoutReply({
          catalogBlock: opts?.catalogBlock,
          query: result.query,
        })
      : "";
    return [
      "VERIFIED CATALOG PINS (speak these FIRST — do not lead with a search timeout):",
      spoken ? stripNotesForSpeech(spoken) : pinRule,
      pinRule,
      "Do not invent an OEM pin. Do not lead with \"search timed out\" or \"returned nothing after a retry.\" Timeout is secondary if mentioned at all.",
    ]
      .filter(Boolean)
      .join("\n");
  }
  const failEst = gate.exhausted
    ? `Search returned nothing after a retry. Say so plainly. ${LOW_CONFIDENCE_EST_RULE} Do not invent an OEM pin. ${pinRule}`
    : `Do NOT give a labeled EST / typical class range — another rephrased search is required. Do not invent an OEM pin. ${pinRule}`;
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

export async function fetchVoiceWebResearchNotes(opts: {
  query: string;
  catalogContext?: string;
  signal?: AbortSignal;
  /** Session whitelist phone — same credential chat + token send. */
  accessPhone?: string;
  screen?: string;
  /** Last lot filter. The server keeps it when this sentence names no new one. */
  lotMemory?: import("./lotMemory.ts").LotMemory | null;
}): Promise<WebSearchNotes & { lotMemory?: import("./lotMemory.ts").LotMemory }> {
  try {
    const post = (phoneForHeader: string) =>
      fetch("/api/rvgrok/web-research", {
        method: "POST",
        headers: researchAccessHeaders(
          {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          phoneForHeader,
        ),
        body: JSON.stringify({
          query: opts.query,
          catalogContext: opts.catalogContext || undefined,
          screen: opts.screen || undefined,
          lotMemory: opts.lotMemory || undefined,
        }),
        signal:
          opts.signal ??
          AbortSignal.timeout(voiceWebSearchClientBudgetMs(opts.query)),
      });

    const res = await fetchWithResearchAccess(post, {
      accessPhone: opts.accessPhone,
      signal: opts.signal,
    });
    if (!res.ok && (await readAccessRequiredError(res))) {
      return { ok: false, reason: VOICE_WEB_ACCESS_BLOCKED_REASON };
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
