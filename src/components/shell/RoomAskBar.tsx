import type { AppTab } from "./BottomTabs";
import { AskGrokPill } from "./AskGrokPill";
import { useRoomVoiceOpen } from "./useRoomVoiceOpen";

/**
 * Ask RV Grok on every section page except Chat.
 * Home keeps its own pill. Chat is the general conversation, so this
 * pill stays hidden there unless Live Voice is on (tap turns it off).
 * The pill opens Chat locked to the page you're on.
 */
export function RoomAskBar({
  tab,
  homeOpen = false,
  onOpen,
}: {
  tab: AppTab;
  homeOpen?: boolean;
  onOpen: (tab: AppTab, opts?: { skipVoice?: boolean; pageScope?: boolean; startAssistant?: boolean }) => void;
}) {
  const live = useRoomVoiceOpen();
  const showAsk = !homeOpen && (tab !== "rvgrok" || live);
  if (!showAsk) return null;
  return (
    <div data-room-ask data-no-swipe className="showroom-dock">
      <AskGrokPill onOpen={() => onOpen("rvgrok", { pageScope: true, startAssistant: true })} />
    </div>
  );
}
