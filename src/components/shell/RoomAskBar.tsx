import { useState } from "react";
import { Mic } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import { roomAskMic, roomAskSend } from "@/lib/rvgrok/roomAsk";

/** One chip row above the ask box. RV GPS stays in Premium. */
const ROOM_CHIPS: { id: AppTab; label: string }[] = [
  { id: "rvfax", label: "Rv Facts" },
  { id: "rvcal", label: "Calculator" },
  { id: "rvtow", label: "Tow Guide" },
  { id: "rvlot", label: "Lot Inventory" },
];

/**
 * Shared ask bar. Mic starts Live Voice.
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

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    roomAskSend(q);
    onOpen("rvgrok");
  };

  const openRoom = (id: AppTab) => {
    if (id === "rvfax") onOpen("rvfax");
    else if (id === "rvcal") onOpen("rvcal");
    else if (id === "rvtow") onOpen("rvtow");
    else if (id === "rvlot") onOpen("rvlot");
  };

  return (
    <div
      data-room-ask
      data-no-swipe
      className="relative z-[70] shrink-0 bg-black px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]"
    >
      <div
        data-room-tabs
        className="mx-auto flex w-full max-w-lg gap-2 overflow-x-auto pb-2"
      >
        {ROOM_CHIPS.map((chip) => {
          const active = !homeOpen && tab === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              data-room-chip={chip.id}
              data-room-tab={chip.id}
              aria-pressed={active}
              aria-current={active ? "page" : undefined}
              onClick={() => openRoom(chip.id)}
              className={
                "inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap " +
                (active
                  ? "bg-white/15 text-fg ring-1 ring-white/45"
                  : "grok-chip text-fg")
              }
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      <form
        data-room-ask-bar
        className="mx-auto flex w-full max-w-lg pb-1"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <div className="grok-composer-pill flex min-h-12 min-w-0 flex-1 items-center gap-1 rounded-full px-3">
          <input
            data-room-ask-input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about this coach"
            aria-label="Ask about this coach"
            enterKeyHint="send"
            className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-fg outline-none placeholder:text-muted"
          />
          <button
            type="button"
            data-room-ask-mic
            className="grok-mic-btn flex size-11 shrink-0 items-center justify-center rounded-full"
            aria-label="Start live voice"
            title="Start Live Voice"
            onClick={() => {
              roomAskMic();
              onOpen("rvgrok");
            }}
          >
            <Mic className="size-5" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}
