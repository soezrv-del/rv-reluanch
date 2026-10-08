/**
 * Shell ask bar → the already-mounted RV Grok chat.
 * No new agent, route, or backend. RvGrokApp registers the live handlers.
 */

export type RoomAskBridge = {
  send: (text: string) => void;
  /** Existing Live Voice mic (start, or stop if a session is already up). */
  mic: () => void;
  /** Open Live Voice with a capture that already started in the tab tap. */
  greet?: (prewarm: GrokVoicePrewarm) => void;
  /** Shut Live Voice off from the RV Grok tab. */
  stop?: () => void;
};

/** Capture started inside the tab tap, before RV Grok finishes loading. */
export type GrokVoicePrewarm = {
  audioCtx: AudioContext | null;
  streamPromise: Promise<MediaStream> | null;
  gestureAt: number;
  error: Error | null;
};

/**
 * Opening RV Grok says hello only when she is not already on.
 * Pressing the RV Grok tab while she is on shuts her off.
 * A typed ask must not start her.
 */
export function planGrokTabVoice(args: {
  alreadyOnGrok: boolean;
  voiceOpen: boolean;
  skipVoice?: boolean;
}): "greet" | "stop" | "keep" {
  if (args.skipVoice) return "keep";
  if (args.alreadyOnGrok) return args.voiceOpen ? "stop" : "keep";
  if (args.voiceOpen) return "keep";
  return "greet";
}

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
let pendingGreet: GrokVoicePrewarm | null = null;
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

export function roomVoiceIsOpen(): boolean {
  return voicePhase !== "idle";
}

export function greetRoomVoice(prewarm: GrokVoicePrewarm): void {
  if (bridge?.greet) {
    bridge.greet(prewarm);
    return;
  }
  pendingGreet = prewarm;
}

export function takePendingGrokGreeting(): GrokVoicePrewarm | null {
  const pending = pendingGreet;
  pendingGreet = null;
  return pending;
}

export function stopRoomVoice(): void {
  bridge?.stop?.();
}

/** Ask pill copy. Idle stays "Ask RV Grok". Live is the way back. */
export function askPillFace(live: boolean): { label: string; aria: string } {
  if (!live) return { label: "Ask RV Grok", aria: "Ask RV Grok" };
  return {
    label: "Live chat",
    aria: "Live chat is on. Tap to return to Chat, then tap again to turn it off.",
  };
}

/**
 * Chat tab copy. The first tap from another screen returns to Chat.
 * A second tap, once Chat is open, turns Live Voice off — that tap reads "End".
 */
export function chatTabFace(
  live: boolean,
  onChat: boolean,
): { label: string; aria: string } {
  if (!live) return { label: "Chat", aria: "Chat" };
  if (onChat) return { label: "End", aria: "Live chat is on. Tap to turn it off." };
  return {
    label: "Live",
    aria: "Live chat is on. Tap to return, then tap again to turn it off.",
  };
}

export function publishRoomVoice(phase: RoomVoicePhase): void {
  voicePhase = phase;
  for (const listener of voiceListeners) listener(phase);
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
