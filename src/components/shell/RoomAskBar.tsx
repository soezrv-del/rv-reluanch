import { useState } from "react";
import { Mic } from "lucide-react";
import type { AppTab } from "./BottomTabs";
import { roomAskMic, roomAskSend } from "@/lib/rvgrok/roomAsk";

/** Questions for the open RV Grok thread. Not stats. */
const QUICK_ASKS = ["Tanks", "Payment", "Diesels under 40", "36-foot"] as const;

/**
 * Shared ask bar on every room, directly above the existing dock.
 * Room names live only in that dock. Mic starts Live Voice.
 * A typed ask is appended to the open RV Grok thread.
 */
export function RoomAskBar({
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

  const ask = (q: string) => {
    roomAskSend(q);
    onOpen("rvgrok");
  };

  return (
    <div
      data-room-ask
      data-no-swipe
      className="relative z-[70] shrink-0 bg-black px-3 pt-2 pb-2"
    >
      <div
        data-quick-asks
        className="mx-auto flex w-full max-w-lg gap-2 overflow-x-auto pb-2"
      >
        {QUICK_ASKS.map((q) => (
          <button
            key={q}
            type="button"
            data-quick-ask={q}
            onClick={() => ask(q)}
            className="grok-chip inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[13px] font-semibold whitespace-nowrap text-fg"
          >
            {q}
          </button>
        ))}
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
