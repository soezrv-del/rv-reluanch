import { Mic } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  readVoiceBar,
  roomAskMic,
  roomVoiceEnd,
  roomVoiceInterrupt,
  subscribeVoiceBar,
} from "@/lib/rvgrok/roomAsk";
import {
  voiceControlActive,
  voiceStatusPillLabel,
} from "@/lib/rvgrok/voiceStatusBar";

/**
 * The composer's mic slot, carried above the dock on every screen that
 * does not already show the chat composer. Same view, same handlers.
 */
export function SuiteVoiceFloat() {
  const voice = useSyncExternalStore(subscribeVoiceBar, readVoiceBar, () => null);
  const active = voiceControlActive(voice);

  return (
    <div className="suite-voice" data-suite-voice data-no-swipe>
      {active && voice ? (
        <>
          <button
            type="button"
            data-suite-voice-pill=""
            data-phase={voice.phase}
            className="grok-status-pill"
            onClick={() => {
              roomVoiceInterrupt();
            }}
            aria-label={`Interrupt: ${voiceStatusPillLabel(voice.phase)}`}
          >
            {voiceStatusPillLabel(voice.phase)}
          </button>
          <button
            type="button"
            data-suite-voice-stop=""
            className="grok-voice-stop"
            onClick={() => {
              roomVoiceEnd();
            }}
            aria-label={`${voice.endLabel} voice`}
          >
            {voice.endLabel}
          </button>
        </>
      ) : (
        <button
          type="button"
          data-suite-voice-mic=""
          className="grok-mic-btn"
          onClick={() => {
            roomAskMic();
          }}
          aria-label="Start live voice"
          title="Start Live Voice"
        >
          <Mic className="size-5" />
        </button>
      )}
    </div>
  );
}
