/**
 * Live Voice acknowledgment opener.
 * Every user question starts with one short phrase from the pool,
 * then the answer. The same phrase never plays twice in a row.
 * The research hold stays its own beat; this prefixes the answer.
 */

export const LIVE_VOICE_ACK_POOL = [
  "Of course, right away.",
  "Absolutely, one moment.",
  "Sure thing, I'll be right back.",
  "On it.",
  "You got it, give me a second.",
  "Right away.",
  "Happy to — one moment.",
  "Got it.",
  "Coming right up.",
  "Sure, here we go.",
  "Okay, one moment.",
  "Yep — right away.",
] as const;

export type LiveVoiceAckCursor = {
  last: string | null;
};

export type LiveVoiceAckState = {
  cursor: LiveVoiceAckCursor;
  /** Phrase this question should open with. */
  armed: string;
  /** Drawn for the following question; not armed until the turn ends. */
  queued: string | null;
  /** This question already took `armed`. */
  taken: boolean;
};

export function nextAckFromPool(
  pool: readonly string[],
  cursor: LiveVoiceAckCursor,
): string {
  const size = pool.length;
  if (size === 0) return "";
  const prevAt = cursor.last ? pool.indexOf(cursor.last) : -1;
  let idx = prevAt >= 0 ? (prevAt + 1) % size : 0;
  if (pool[idx] === cursor.last && size > 1) idx = (idx + 1) % size;
  const phrase = pool[idx] ?? "";
  cursor.last = phrase || cursor.last;
  return phrase;
}

/** Next pool phrase. Skips a candidate that matches the previous one. */
export function nextLiveVoiceAck(cursor: LiveVoiceAckCursor): string {
  return nextAckFromPool(LIVE_VOICE_ACK_POOL, cursor);
}

export function createLiveVoiceAckState(): LiveVoiceAckState {
  const cursor: LiveVoiceAckCursor = { last: null };
  return {
    cursor,
    armed: nextLiveVoiceAck(cursor),
    queued: null,
    taken: false,
  };
}

/**
 * Opener for this question. A second take in the same turn returns ""
 * so the answer cannot stack two acknowledgments.
 */
export function takeLiveVoiceAck(state: LiveVoiceAckState): string {
  if (state.taken) return "";
  state.taken = true;
  if (!state.queued) state.queued = nextLiveVoiceAck(state.cursor);
  return state.armed;
}

/**
 * The coach/spec choice line already opened with this pool phrase.
 * Move off it so the report that follows does not say it again.
 */
export function disarmLiveVoiceAck(state: LiveVoiceAckState, phrase: string): void {
  if (state.taken || state.armed !== phrase.trim()) return;
  advanceLiveVoiceAck(state);
}

/** Arm the following phrase after this question's answer (or a barge-in). */
export function advanceLiveVoiceAck(state: LiveVoiceAckState): string {
  if (state.queued) {
    state.armed = state.queued;
    state.queued = null;
  } else {
    state.armed = nextLiveVoiceAck(state.cursor);
  }
  state.taken = false;
  return state.armed;
}

/** Spoken substance, acknowledgment first. */
export function prefixLiveVoiceAck(body: string, ack: string): string {
  const phrase = ack.trim();
  const substance = body.trim();
  if (!phrase) return substance;
  if (!substance) return phrase;
  if (substance === phrase || substance.startsWith(`${phrase} `)) return substance;
  return `${phrase} ${substance}`;
}

/** Generated replies: the model must speak this opener, then the answer. */
export function withLiveVoiceAckInstructions(base: string, ack: string): string {
  const phrase = ack.trim();
  if (!phrase) return base;
  return `THIS RESPONSE: Your first spoken words are exactly "${phrase}" Then answer. Do not skip that acknowledgment and do not add a second one.\n\n${base}`;
}

/**
 * Autonomous VAD replies have no exact script. Pin the opener here.
 * Exact scripts and THIS RESPONSE instructions already include it.
 */
export function liveVoiceAckSessionLine(ack: string): string {
  const phrase = ack.trim();
  if (!phrase) return "";
  return `LIVE VOICE ACKNOWLEDGMENT: When the user asks a question and this response has no exact script and no THIS RESPONSE opener, your first spoken words are exactly "${phrase}" Then answer. Never jump straight into the substance. Never use the same acknowledgment as the previous question. The one-time intro cue is not a question — when cued to introduce yourself, say only that intro line and do not add this acknowledgment. If response instructions already include this acknowledgment or a SPEC ENGINE SCRIPT, do not say it twice.`;
}
