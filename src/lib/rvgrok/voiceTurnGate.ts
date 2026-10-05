/**
 * Live Voice turn gate. Stops the lot line from looping while the mic is open.
 * Empty or noise transcripts are not a question. The same lot line is not
 * spoken twice. "None." never introduces a list of units.
 */

const FILLER =
  /^(?:uh+|um+|hmm+|mm+|ah+|er+|huh+|oh+|hm+)[\s.!?,-]*$/i;

export function isIgnorableVoiceTranscript(text: string): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return true;
  if (t.length < 2) return true;
  if (/^[\s.!?,\-…]+$/.test(t)) return true;
  if (FILLER.test(t)) return true;
  if (/^\[?(?:noise|silence|inaudible|blank|unintelligible)\]?$/i.test(t)) return true;
  return false;
}

/** The opening of a spoken lot line ("We've got 2 on the lot"), or a miss. */
const LOT_LINE_MARK = /matching units|we ve got (?:\d+|one)(?: class cs)? on the lot|none/;
const LOT_LINE_OPEN = /matching units|we ve got (?:\d+|one)(?: class cs)? on the lot/g;

function lotKey(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** The same lot sentence, including an echo of it picked up by the mic. */
export function isSameLotLine(previous: string, next: string): boolean {
  const left = lotKey(previous);
  const right = lotKey(next);
  if (!left || !right) return false;
  if (!LOT_LINE_MARK.test(left) && !LOT_LINE_MARK.test(right)) {
    return false;
  }
  if (left === right) return true;
  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;
  return shorter.length > 24 && longer.includes(shorter);
}

/** One reply that says the lot line twice. */
export function repeatsLotLine(text: string): boolean {
  return (lotKey(text).match(LOT_LINE_OPEN) || []).length >= 2;
}

/**
 * Matched units are the answer. Do not say None and then list them.
 * A real miss stays "None."
 */
/**
 * A lot miss is never a bare "None." She says one of these (picked from the
 * question, so the same question gets the same line, once), then the closest
 * real units or an honest "can't find one". Counts still come only from the sheet.
 */
export const LOT_MISS_LINES = [
  "Hang on bud, it's not in our sheet, so I'm looking a little harder.",
  "Give me a sec, that one's not jumping out of our sheet, so I dug a little deeper.",
  "Hmm, I'm not seeing that one on our sheet, so I looked a little wider.",
] as const;

/** Same question, same line. */
export function lotMissLine(question: string): string {
  const key = (question || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return LOT_MISS_LINES[hash % LOT_MISS_LINES.length]!;
}

/** True when the line already opens with a friendly miss line. */
export function startsWithLotMissLine(line: string): boolean {
  const t = (line || "").trim();
  return LOT_MISS_LINES.some((miss) => t.startsWith(miss));
}

/** Spoken for a miss with nothing else to say. Never a bare "None." */
export const LOT_MISS_EMPTY_LINE = "I can't find one on our sheet.";

export function lotSummaryForSpeech(summary: string, matched: number): string {
  let line = (summary || "")
    .replace(/\nNAME ROSTER\b[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (matched > 0) {
    // Said like a person: "We've got 2 on the lot: Winnebago View, all used."
    line = line
      .replace(/^none\.\s*/i, "")
      .replace(/\bnone\.\s+(?=matching units\b)/i, "")
      .replace(
        /^Matching units:\s*(\d+) Class C, (\d+) Class C and (\d+) Class Super C\b/i,
        "We've got $1 Class Cs on the lot, $2 regular and $3 Super C",
      )
      .replace(/^Matching units:\s*1\s+/i, "We've got one on the lot: ")
      .replace(/^Matching units:\s*(\d+)\.\s*/i, "We've got $1 on the lot. ")
      .replace(/^Matching units:\s*(\d+),\s*/i, "We've got $1 on the lot, ")
      .replace(/^Matching units:\s*(\d+)\s+/i, "We've got $1 on the lot: ")
      .trim();
  } else if (startsWithLotMissLine(line)) {
    return line;
  } else if (line && !/^none\b/i.test(line)) {
    line = `None. ${line}`;
  }
  if (!line) return matched > 0 ? "" : LOT_MISS_EMPTY_LINE;
  if (/^none\.?$/i.test(line)) return LOT_MISS_EMPTY_LINE;
  return line;
}

/** Spoken when the lot lookup itself failed. Never "None.": that is a real zero. */
export const LOT_LOOKUP_FAILED_LINE =
  "I can't reach the lot sheet right now, so I won't guess on stock.";

/** Tool instructions for a failed lookup: the fixed line, no zero, no invented coach. */
export const LOT_LOOKUP_FAILED_SPEAK = `The lot lookup failed. Do not say none or zero. Do not name a coach, a price, or a store. Speak only these words, then stop: ${LOT_LOOKUP_FAILED_LINE}`;

/**
 * Why a /api/rvgrok/query-lot response is not a search result, or null when
 * it is one. A 403 access_required or a 500 body has no matched count; read
 * as matched 0 it was spoken as "None." for coaches that are on the lot.
 */
export function queryLotFailure(
  httpOk: boolean,
  status: number,
  data: unknown,
): string | null {
  const body =
    data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const error = typeof body?.error === "string" && body.error ? body.error : "";
  if (!httpOk) return error || `http ${status}`;
  if (!body || Object.keys(body).length === 0) return "empty result";
  if (error) return error;
  if (body.unavailable === true || body.ok === false) {
    return typeof body.reason === "string" && body.reason ? body.reason : "lot unavailable";
  }
  if (typeof body.matched !== "number" || !Number.isFinite(body.matched)) {
    return "no match count";
  }
  return null;
}

/** The spoken lot line ends by offering more, so the caller can say "yes". */
export function lotLineWithDetailsAsk(line: string): string {
  const t = (line || "").trim().replace(/[,;:\s]+$/, "");
  if (!t) return t;
  if (/\?\s*$/.test(t)) return t;
  const ended = /[.!]$/.test(t) ? t : `${t}.`;
  if (/^none\.?$/i.test(ended)) return ended;
  return `${ended} Want more details?`;
}

export const SPOKEN_LOT_UNIT_CAP = 3;

/** Spoken when the tool result includes a motorhome name roster. Not a verbatim script. */
export const NAME_ROSTER_SPEAK =
  "The first sentence is the answer. Fun and playful. The sheet count is only how the dealer filed them. name_roster lists every motorhome in this search with the sheet label, the chassis, and the GVWR. A Super C is a Class C body on a truck, not a van. You know these names. Name the ones that fit what he asked, and say when the sheet disagrees. If the chassis is blank and you do not know the name, say you are not sure. Do not invent a coach that is not on this roster. Do not read the whole roster out loud. Do not stop at the sheet count.";

export function spokenLotPayload<
  T extends {
    matched: number;
    units: unknown[];
    no_length?: unknown[];
    summary?: string;
    speech: string;
    none: boolean;
  },
>(answer: T): T {
  const matched = answer.matched;
  let summary = lotSummaryForSpeech(answer.summary || answer.speech, matched);
  summary = summary
    .replace(/\s*No length on file \(not guessed\):.*$/i, "")
    .trim();
  const named = /\bNamed:/i.test(summary);
  if (matched > SPOKEN_LOT_UNIT_CAP && !/i can name more/i.test(summary) && !named) {
    summary = `${summary.replace(/\.$/, "")}. I can name more.`;
  }
  summary = summary.replace(/,?\s*\bstk\s+[a-z0-9]+\b/gi, "");
  summary = summary.replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").replace(/,\s*\./g, ".").trim();
  const cap = named ? Math.min(8, Math.max(matched, 1)) : SPOKEN_LOT_UNIT_CAP;
  return {
    ...answer,
    units: answer.units.slice(0, cap),
    no_length: (answer.no_length || []).slice(0, cap),
    summary,
    speech: summary,
    none: matched === 0,
  };
}

/**
 * The hold ("I'll check the lot") is still an open Realtime response when
 * query_lot returns. response.create during that response is rejected, and
 * she goes quiet. Queue the answer and speak it when that response ends.
 */
export type ToolSpeakGate = {
  responseOpen: boolean;
  queued: string | null;
  /** Just sent. A rejected create puts it back on the queue. */
  sent: string | null;
};

export function initialToolSpeakGate(): ToolSpeakGate {
  return { responseOpen: false, queued: null, sent: null };
}

export type ToolSpeakEvent =
  | { type: "response-start" }
  | { type: "response-end" }
  | { type: "tool-ready"; instructions: string }
  | { type: "create-rejected" };

export function reduceToolSpeak(
  state: ToolSpeakGate,
  event: ToolSpeakEvent,
): { state: ToolSpeakGate; speak: string | null } {
  switch (event.type) {
    case "response-start":
      return {
        state: { responseOpen: true, queued: state.queued, sent: null },
        speak: null,
      };
    case "response-end": {
      if (!state.queued) {
        return {
          state: { responseOpen: false, queued: null, sent: null },
          speak: null,
        };
      }
      return {
        state: { responseOpen: false, queued: null, sent: state.queued },
        speak: state.queued,
      };
    }
    case "tool-ready":
      if (state.responseOpen) {
        return {
          state: { ...state, queued: event.instructions },
          speak: null,
        };
      }
      return {
        state: { ...state, queued: null, sent: event.instructions },
        speak: event.instructions,
      };
    case "create-rejected":
      if (!state.sent) return { state, speak: null };
      return {
        state: { responseOpen: true, queued: state.sent, sent: null },
        speak: null,
      };
    default:
      return { state, speak: null };
  }
}
