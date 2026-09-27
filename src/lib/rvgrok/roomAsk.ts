/**
 * Shell ask bar → the already-mounted RV Grok chat.
 * No new agent, route, or backend. RvGrokApp registers the live handlers.
 */

export type RoomAskBridge = {
  send: (text: string) => void;
  /** Existing Live Voice mic (start, or stop if a session is already up). */
  mic: () => void;
};

/** Ask-bar mic while a call is up on a room that is not the Grok screen. */
export type RoomVoicePhase = "idle" | "listening" | "speaking";

export function roomVoicePhaseFromStatus(status: string): RoomVoicePhase {
  if (status === "speaking") return "speaking";
  if (
    status === "connecting" ||
    status === "listening" ||
    status === "thinking"
  ) {
    return "listening";
  }
  return "idle";
}

let bridge: RoomAskBridge | null = null;
let voicePhase: RoomVoicePhase = "idle";
const voiceListeners = new Set<(phase: RoomVoicePhase) => void>();

export function registerRoomAsk(next: RoomAskBridge | null): void {
  bridge = next;
}

export function roomAskSend(text: string): boolean {
  const q = text.trim();
  if (!q || !bridge) return false;
  bridge.send(q);
  return true;
}

export function roomAskMic(): boolean {
  if (!bridge) return false;
  bridge.mic();
  return true;
}

export function publishRoomVoice(phase: RoomVoicePhase): void {
  voicePhase = phase;
  for (const listener of voiceListeners) listener(phase);
}

/** Pill-row auto-scroll. Slow enough to read, fast enough to reveal Tow Guide. */
export const PILL_LOOP_PX_PER_SEC = 36;

/** Resume the loop this long after the finger or pointer lets go. */
export const PILL_LOOP_RESUME_MS = 3000;

/** One direction, only when the chips overflow and motion is allowed. */
export function shouldLoopPills(opts: {
  reducedMotion: boolean;
  overflows: boolean;
}): boolean {
  return !opts.reducedMotion && opts.overflows;
}

/**
 * Advance scroll by `deltaPx` and wrap once the first chip copy has
 * fully passed, so the duplicate sits where the first copy started.
 */
export function nextPillScroll(
  scrollLeft: number,
  distance: number,
  deltaPx: number,
): number {
  if (!(distance > 0) || !(deltaPx > 0) || !Number.isFinite(scrollLeft)) {
    return scrollLeft;
  }
  let next = scrollLeft + deltaPx;
  if (next >= distance) {
    next -= Math.floor(next / distance) * distance;
  }
  return next;
}

export function subscribeRoomVoice(
  listener: (phase: RoomVoicePhase) => void,
): () => void {
  voiceListeners.add(listener);
  listener(voicePhase);
  return () => {
    voiceListeners.delete(listener);
  };
}
