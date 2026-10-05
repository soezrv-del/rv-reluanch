import { useEffect, useState } from "react";
import { Mic, Radio } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import { BottomTabs } from "./BottomTabs";
import { MoreSheet, type MorePick } from "./MoreSheet";
import {
  roomAskMic,
  roomAskSend,
  subscribeRoomVoice,
  type RoomVoicePhase,
} from "@/lib/rvgrok/roomAsk";
import { markAskBarGrokEntry } from "@/lib/rvgrok/screenContext";

/**
 * Ask bar plus the four-tab dock (Facts · Inventory · Ask · More).
 * The dock does not slide. More opens the tools sheet above the dock.
 * A typed ask is appended to the open RV Grok thread.
 */
export function RoomAskBar({
  tab,
  homeOpen = false,
  onOpen,
  onDockTap,
  moreOpen = false,
  onMorePick,
  onMoreClose,
}: {
  tab: AppTab;
  homeOpen?: boolean;
  onOpen: (tab: AppTab, opts?: { skipVoice?: boolean }) => void;
  /** Dock taps — More toggles the sheet. Defaults to onOpen. */
  onDockTap?: (tab: AppTab) => void;
  moreOpen?: boolean;
  onMorePick?: (id: MorePick) => void;
  onMoreClose?: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [voice, setVoice] = useState<RoomVoicePhase>("idle");
  const hidePinnedAsk = !homeOpen && tab === "rvgrok";
  const live = voice !== "idle";

  useEffect(() => subscribeRoomVoice(setVoice), []);

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    roomAskSend(q);
    markAskBarGrokEntry();
    onOpen("rvgrok", { skipVoice: true });
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
        moreOpen={moreOpen}
        onChange={(id) => (onDockTap ? onDockTap(id) : onOpen(id))}
      >
        <MoreSheet
          open={moreOpen}
          tab={tab}
          onPick={(id) => onMorePick?.(id)}
          onClose={() => onMoreClose?.()}
        />
      </BottomTabs>
    </div>
  );
}
