import { useState } from "react";
import { Mic } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import { roomAskMic, roomAskSend } from "@/lib/rvgrok/roomAsk";

/** Facts, Lot, Cal, Tow only. RV GPS stays in the Premium menu. */
const ROOM_CHIPS: { id: AppTab; label: string }[] = [
  { id: "rvfax", label: "Facts" },
  { id: "rvlot", label: "Lot" },
  { id: "rvcal", label: "Cal" },
  { id: "rvtow", label: "Tow" },
];

/**
 * Shared ask bar on every room, directly above the existing dock.
 * Mic starts Live Voice. A typed ask is appended to the open RV Grok thread.
 */
export function RoomAskBar({
  tab,
  onOpen,
}: {
  tab: AppTab;
  onOpen: (tab: AppTab) => void;
}) {
  const [draft, setDraft] = useState("");

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    roomAskSend(q);
    onOpen("rvgrok");
  };

  return (
    <div
      data-room-ask
      data-no-swipe
      className="relative z-[70] shrink-0 border-t border-white/10 bg-black px-3 pt-2"
    >
      <div
        data-room-chips
        className="mx-auto flex w-full max-w-lg gap-2 overflow-x-auto pb-2"
      >
        {ROOM_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            data-room-chip={chip.id}
            aria-pressed={tab === chip.id}
            onClick={() => onOpen(chip.id)}
            className="grok-chip inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap text-fg"
          >
            {chip.label}
          </button>
        ))}
      </div>
      <form
        data-room-ask-bar
        className="mx-auto flex w-full max-w-lg items-center gap-2 pb-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <button
          type="button"
          data-room-ask-mic
          className="grok-mic-btn flex size-12 shrink-0 items-center justify-center rounded-full"
          aria-label="Start live voice"
          title="Start Live Voice"
          onClick={() => {
            roomAskMic();
            onOpen("rvgrok");
          }}
        >
          <Mic className="size-5" aria-hidden />
        </button>
        <div className="grok-composer-pill flex min-h-12 min-w-0 flex-1 items-center gap-1 rounded-full px-3">
          <input
            data-room-ask-input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask RV Grok"
            aria-label="Ask RV Grok"
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-fg outline-none placeholder:text-muted"
          />
          <button
            type="submit"
            data-room-ask-send
            className="inline-flex min-h-11 shrink-0 items-center px-2 text-[13px] font-semibold text-fg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
