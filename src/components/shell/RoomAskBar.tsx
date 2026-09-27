import { useEffect, useState } from "react";
import { Calculator, FileText, LayoutGrid, Mic, Radio, Truck } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import {
  roomAskMic,
  roomAskSend,
  subscribeRoomVoice,
  type RoomVoicePhase,
} from "@/lib/rvgrok/roomAsk";
import { markAskBarGrokEntry } from "@/lib/rvgrok/screenContext";

/** Floating pill tabs. RV GPS stays in Premium. */
const ROOM_CHIPS: {
  id: AppTab;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: "rvfax", label: "Rv Facts", icon: FileText },
  { id: "rvlot", label: "Lot Inventory", icon: LayoutGrid },
  { id: "rvcal", label: "Calculator", icon: Calculator },
  { id: "rvtow", label: "Tow Guide", icon: Truck },
];

/**
 * Shared ask bar. Mic starts Live Voice on the current screen.
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

  useEffect(() => subscribeRoomVoice(setVoice), []);

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    roomAskSend(q);
    markAskBarGrokEntry();
    onOpen("rvgrok");
  };

  const openRoom = (id: AppTab) => {
    if (id === "rvfax") onOpen("rvfax");
    else if (id === "rvcal") onOpen("rvcal");
    else if (id === "rvtow") onOpen("rvtow");
    else if (id === "rvlot") onOpen("rvlot");
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
              placeholder="What's up?"
              aria-label="What's up?"
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
      <div data-room-tabs className="showroom-rail showroom-pills">
        {ROOM_CHIPS.map((chip) => {
          const active = !homeOpen && tab === chip.id;
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              type="button"
              data-room-chip={chip.id}
              data-room-tab={chip.id}
              aria-pressed={active}
              aria-current={active ? "page" : undefined}
              onClick={() => openRoom(chip.id)}
              className="showroom-tab showroom-float min-h-11"
            >
              <Icon
                className="showroom-tab-icon"
                aria-hidden
                strokeWidth={1.6}
                fill="currentColor"
              />
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
