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
  if (!/matching units|none/.test(left) && !/matching units|none/.test(right)) {
    return false;
  }
  if (left === right) return true;
  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;
  return shorter.length > 24 && longer.includes(shorter);
}

/** One reply that says the lot line twice. */
export function repeatsLotLine(text: string): boolean {
  const t = lotKey(text);
  const marker = "matching units";
  const first = t.indexOf(marker);
  if (first < 0) return false;
  return t.indexOf(marker, first + marker.length) >= 0;
}

/**
 * Matched units are the answer. Do not say None and then list them.
 * A real miss stays "None."
 */
export function lotSummaryForSpeech(summary: string, matched: number): string {
  let line = (summary || "")
    .replace(/\nNAME ROSTER\b[\s\S]*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (matched > 0) {
    line = line.replace(/^none\.\s*/i, "");
    line = line.replace(/\bnone\.\s+(?=matching units\b)/i, "");
  } else if (line && !/^none\b/i.test(line)) {
    line = `None. ${line}`;
  }
  if (!line) return matched > 0 ? "" : "None.";
  return line;
}

/**
 * She said the lot has none of a coach ("no Navion or EKKO in stock", "the
 * lot search came back with just the two Views"). That claim needs a real
 * query_lot behind it.
 */
export function claimsLotMiss(text: string): boolean {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (!t) return false;
  if (/\blot search came back\b/i.test(t)) return true;
  if (/\b(?:came back with|only found|just found)\b[^.?!]{0,80}\b(?:lot|stock|inventory)\b/i.test(t)) {
    return true;
  }
  return /\b(?:no|none|not any|zero|don't have|do not have|didn't find|did not find|aren't any|are no|isn't|is not|not)\b[^.?!]{0,80}\b(?:in stock|on the lot|on our lot|in inventory|in our inventory)\b/i.test(
    t,
  );
}

/**
 * One spoken answer per lot result. After query_lot returns, the first reply
 * is her answer. Any other reply that starts before he says something new
 * (her own echo, a second auto-reply, a queued "speak these words") is
 * dropped, so the lot answer is never said twice.
 */
export type LotReplyGate = {
  owed: boolean;
  answeredAt: number;
  suppressed: boolean;
};

export const initialLotReplyGate: LotReplyGate = {
  owed: false,
  answeredAt: 0,
  suppressed: false,
};

/** After this long, a new reply is never treated as a repeat. */
export const LOT_REPLY_WINDOW_MS = 15_000;

export type LotReplyEvent =
  | { type: "tool-output" }
  | { type: "response-created"; now: number }
  | { type: "user-turn" };

export function reduceLotReply(
  state: LotReplyGate,
  event: LotReplyEvent,
): { state: LotReplyGate; action: "allow" | "cancel" | "reask" | null } {
  switch (event.type) {
    case "tool-output":
      return { state: { owed: true, answeredAt: 0, suppressed: false }, action: null };
    case "response-created":
      if (!state.owed) return { state, action: "allow" };
      if (!state.answeredAt) {
        return { state: { ...state, answeredAt: event.now }, action: "allow" };
      }
      if (event.now - state.answeredAt > LOT_REPLY_WINDOW_MS) {
        return { state: initialLotReplyGate, action: "allow" };
      }
      return { state: { ...state, suppressed: true }, action: "cancel" };
    case "user-turn":
      return {
        state: initialLotReplyGate,
        action: state.suppressed ? "reask" : null,
      };
    default:
      return { state, action: null };
  }
}

/** True once the lot answer has started, so a queued second one is dropped. */
export function lotAnswerAlreadyGiven(state: LotReplyGate): boolean {
  return state.owed && state.answeredAt > 0;
}

/** Her lot answer: the facts, in her own words, said once. */
export function lotAnswerInstructions(summary: string): string {
  return (
    "Answer his lot question once, in your own words, in one or two short sentences, from these facts: " +
    summary +
    " Do not say the words \"Matching units\" and do not read the facts word for word. " +
    "Say the year, model, town and rough price the way a salesperson would. " +
    "Do not add any unit, price or store that is not in the facts. " +
    "End by asking if he wants the details. Then stop."
  );
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
