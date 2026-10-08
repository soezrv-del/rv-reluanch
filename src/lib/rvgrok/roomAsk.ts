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
 * Opening the chat screen does not start the assistant.
 * The Ask pill and the Chat tab arm the session. A typed ask does not.
 * Pressing Chat while she is already on shuts Live Voice off.
 */
export function planGrokTabVoice(args: {
  alreadyOnGrok: boolean;
  voiceOpen: boolean;
  skipVoice?: boolean;
}): "greet" | "stop" | "keep" {
  if (args.skipVoice) return "keep";
  if (args.alreadyOnGrok && args.voiceOpen) return "stop";
  return "keep";
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
