/**
 * Shell ask bar → the already-mounted RV Grok chat.
 * No new agent, route, or backend. RvGrokApp registers the live handlers.
 */

import type { VoiceBarView } from "./voiceStatusBar.ts";

export type RoomAskBridge = {
  send: (text: string) => void;
  /** Existing Live Voice mic (start, or stop if a session is already up). */
  mic: () => void;
  /** Open Live Voice with a capture that already started in the tab tap. */
  greet?: (prewarm: GrokVoicePrewarm) => void;
  /** Shut Live Voice off from the RV Grok tab. */
  stop?: () => void;
  /** Cut her off and keep listening. Same as the composer pill. */
  interrupt?: () => void;
  /** Full stop. Same as the composer's End / Stop / Cancel control. */
  end?: () => void;
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
let voiceView: VoiceBarView | null = null;
let pendingGreet: GrokVoicePrewarm | null = null;
const voiceListeners = new Set<(phase: RoomVoicePhase) => void>();
const viewListeners = new Set<() => void>();

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

export function roomVoiceInterrupt(): boolean {
  if (!bridge?.interrupt) return false;
  bridge.interrupt();
  return true;
}

export function roomVoiceEnd(): boolean {
  if (!bridge?.end) return false;
  bridge.end();
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

function voiceViewKey(view: VoiceBarView | null): string {
  if (!view) return "";
  return [
    view.phase,
    view.text,
    view.detail ?? "",
    view.endLabel,
    view.canInterrupt ? "1" : "0",
    view.live ? "1" : "0",
  ].join("|");
}

/** The view RvGrokApp already built with voiceStatusBarView. */
export function publishVoiceBar(next: VoiceBarView | null): void {
  if (voiceViewKey(voiceView) === voiceViewKey(next)) return;
  voiceView = next;
  for (const listener of viewListeners) listener();
}

export function readVoiceBar(): VoiceBarView | null {
  return voiceView;
}

export function subscribeVoiceBar(listener: () => void): () => void {
  viewListeners.add(listener);
  return () => {
    viewListeners.delete(listener);
  };
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
