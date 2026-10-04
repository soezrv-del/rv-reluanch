/**
 * One status bar above the RV Grok composer.
 *
 * Presentation only. It reads the state RvGrokApp already keeps
 * (realtimeStatus / realtimeDetail from the live session, plus the typed-chat
 * and push-to-talk flags) and says what is happening in one line. It never
 * starts, stops or gates audio; the bar's buttons call the handlers the old
 * three bars called (session.interrupt() and handleStop).
 */

export type VoiceBarStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "error";

export type VoiceBarPhase =
  | "connecting"
  | "listening"
  | "hears"
  | "thinking"
  | "speaking"
  | "recording";

export type VoiceBarInput = {
  realtimeStatus: VoiceBarStatus;
  realtimeDetail: string | null;
  liveActive: boolean;
  isRecording: boolean;
  isLoading: boolean;
  streaming: boolean;
  speaking: boolean;
  continuousArmed: boolean;
  voiceMode: boolean;
  /** Selected voice's display name. Eve is the default voice. */
  voiceName?: string;
};

export type VoiceBarView = {
  phase: VoiceBarPhase;
  /** Main line, e.g. "Eve's listening to you". */
  text: string;
  /** Optional second clause while she works (lot check, photo, research). */
  detail: string | null;
  /** Show Interrupt: cut her off, keep listening. Live Voice only. */
  canInterrupt: boolean;
  /** Label for the button wired to handleStop. */
  endLabel: "End" | "Stop" | "Cancel";
  live: boolean;
};

/** Same test the old black "Interrupt — stop her, keep listening" bar used. */
export function voiceBarCanInterrupt(
  input: Pick<VoiceBarInput, "realtimeStatus" | "realtimeDetail" | "liveActive">,
): boolean {
  return (
    input.liveActive &&
    (input.realtimeStatus === "speaking" ||
      /speaking|finishing reply/i.test(input.realtimeDetail || ""))
  );
}

/** Generic thinking lines the main text already covers. */
const GENERIC_THINKING =
  /^(processing|grok is responding|answering|thinking)\W*$/i;

export function voiceBarLines(name = "Eve") {
  return {
    listening: `${name}'s listening to you`,
    hears: `${name} hears you`,
    thinking: `${name}'s thinking`,
    speaking: `${name}'s speaking`,
    connecting: `Connecting to ${name}…`,
  } as const;
}

/**
 * What the bar shows right now, or null when the old STOP bar was hidden too
 * (same visibility test, so nothing appears or disappears that did not before).
 */
export function voiceStatusBarView(input: VoiceBarInput): VoiceBarView | null {
  const show =
    input.isLoading ||
    input.streaming ||
    input.isRecording ||
    input.liveActive ||
    input.speaking ||
    input.continuousArmed;
  if (!show) return null;

  const lines = voiceBarLines(input.voiceName?.trim() || "Eve");
  const detail = (input.realtimeDetail || "").trim();
  const canInterrupt = voiceBarCanInterrupt(input);

  if (input.liveActive) {
    const base = { canInterrupt, endLabel: "End" as const, live: true };
    if (canInterrupt) {
      return { ...base, phase: "speaking", text: lines.speaking, detail: null };
    }
    switch (input.realtimeStatus) {
      case "connecting":
        return { ...base, phase: "connecting", text: lines.connecting, detail: null };
      case "thinking":
        return {
          ...base,
          phase: "thinking",
          text: lines.thinking,
          detail: detail && !GENERIC_THINKING.test(detail) ? detail : null,
        };
      case "listening":
      default:
        if (/hearing you/i.test(detail)) {
          return { ...base, phase: "hears", text: lines.hears, detail: null };
        }
        return { ...base, phase: "listening", text: lines.listening, detail: null };
    }
  }

  // Not in Live Voice: push-to-talk, typed reply, or read-aloud.
  if (input.isRecording) {
    return {
      phase: "recording",
      text: input.voiceMode ? `${lines.listening} · hands-free` : lines.listening,
      detail: null,
      canInterrupt: false,
      endLabel: "Stop",
      live: false,
    };
  }
  if (input.isLoading || input.streaming) {
    return {
      phase: "thinking",
      text: lines.thinking,
      detail: null,
      canInterrupt: false,
      endLabel: "Cancel",
      live: false,
    };
  }
  return {
    phase: "speaking",
    text: lines.speaking,
    detail: null,
    canInterrupt: false,
    endLabel: "Stop",
    live: false,
  };
}
