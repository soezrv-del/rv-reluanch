import { useEffect, useState } from "react";
import { Mic, Radio } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import { BottomTabs } from "./BottomTabs";
import {
  roomAskMic,
  roomAskSend,
  subscribeRoomVoice,
  subscribeRoomVoiceError,
  type RoomVoicePhase,
} from "@/lib/rvgrok/roomAsk";
import { markAskBarGrokEntry } from "@/lib/rvgrok/screenContext";

/**
 * Ask bar plus the six-icon dock. The dock does not slide.
 * A typed ask is appended to the open RV Grok thread.
 */
export function RoomAskBar({
  tab,
  homeOpen = false,
  onOpen,
}: {
  tab: AppTab;
  homeOpen?: boolean;
  onOpen: (tab: AppTab) => void;
}) {
  const [draft, setDraft] = useState("");
  const [voice, setVoice] = useState<RoomVoicePhase>("idle");
  const hidePinnedAsk = !homeOpen && tab === "rvgrok";
  const live = voice !== "idle";

  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => subscribeRoomVoice(setVoice), []);
  // A Live Voice failure (e.g. mic permission) started from this bar would
  // otherwise only render inside the hidden Grok pane. Show it briefly here.
  useEffect(() => subscribeRoomVoiceError(setVoiceError), []);
  useEffect(() => {
    if (!voiceError) return;
    const t = window.setTimeout(() => setVoiceError(null), 8000);
    return () => window.clearTimeout(t);
  }, [voiceError]);

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    roomAskSend(q);
    markAskBarGrokEntry();
    onOpen("rvgrok");
  };

  return (
    <div data-room-ask data-no-swipe className="showroom-dock">
      {hidePinnedAsk ? null : (
        <form
          data-room-ask-bar
          className="showroom-ask-row"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          {voiceError && !live ? (
            <p
              role="alert"
              data-room-voice-error
              className="showroom-voice-error"
            >
              {voiceError}
            </p>
          ) : null}
          <div className="showroom-ask showroom-float">
            <input
              data-room-ask-input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask RV Grok"
              aria-label="Ask RV Grok"
              enterKeyHint="send"
            />
            {live ? (
              <span data-room-voice={voice} className="showroom-live">
                {voice === "speaking" ? "Speaking" : "Listening"}
              </span>
            ) : null}
            <button
              type="button"
              data-room-ask-mic
              className={
                "showroom-mic" +
                (live ? " is-live" : "") +
                (voice === "speaking" ? " is-armed" : "")
              }
              aria-pressed={live}
              aria-label={
                voice === "speaking"
                  ? "Speaking, tap to stop"
                  : live
                    ? "Listening, tap to stop"
                    : "Start live voice"
              }
              title={live ? "Stop Live Voice" : "Start Live Voice"}
              onClick={() => {
                setVoiceError(null);
                roomAskMic();
              }}
            >
              {live ? (
                <Radio className="size-5" aria-hidden />
              ) : (
                <Mic className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </form>
      )}
      <BottomTabs
        tab={tab}
        homeOpen={homeOpen}
        onChange={(id) => onOpen(id)}
      />
    </div>
  );
}
