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
  let line = (summary || "").replace(/\s+/g, " ").trim();
  if (matched > 0) {
    line = line.replace(/^none\.\s*/i, "");
    line = line.replace(/\bnone\.\s+(?=matching units\b)/i, "");
  } else if (line && !/^none\b/i.test(line)) {
    line = `None. ${line}`;
  }
  if (!line) return matched > 0 ? "" : "None.";
  return line;
}

export const SPOKEN_LOT_UNIT_CAP = 3;

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
  if (matched > SPOKEN_LOT_UNIT_CAP && !/i can name more/i.test(summary)) {
    summary = `${summary.replace(/\.$/, "")}. I can name more.`;
  }
  summary = summary.replace(/,?\s*\bstk\s+[a-z0-9]+\b/gi, "");
  summary = summary.replace(/\s{2,}/g, " ").replace(/\s+,/g, ",").replace(/,\s*\./g, ".").trim();
  return {
    ...answer,
    units: answer.units.slice(0, SPOKEN_LOT_UNIT_CAP),
    no_length: (answer.no_length || []).slice(0, SPOKEN_LOT_UNIT_CAP),
    summary,
    speech: summary,
    none: matched === 0,
  };
}
