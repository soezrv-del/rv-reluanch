import { useSyncExternalStore } from "react";
import { askPillFace } from "@/lib/rvgrok/roomAsk";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { useRoomVoiceOpen } from "./useRoomVoiceOpen";
import "./home-truth.css";

/** Live Voice is still on. The pill is the way back to Chat. */
export function AskPillLiveLabel({ label }: { label: string }) {
  return (
    <>
      <span className="live-chat-dot" aria-hidden />
      <span className="ask-live-copy">
        <span>{label}</span>
        <small>Tap to return</small>
      </span>
    </>
  );
}

/**
 * Home's Ask RV Grok pill, carried to every other screen right above the
 * dock. Same classes as Home: copper (dark-home-ask) in dark, graphite
 * (light-home-ask) in light. Opens the RV Grok room.
 * While Live Voice is on, the label switches to "Live chat" so the pill
 * is the obvious way back.
 */
export function AskGrokPill({ onOpen }: { onOpen: () => void }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const live = useRoomVoiceOpen();
  const face = askPillFace(live);
  return (
    <div className="shell-ask-wrap" data-shell-ask data-no-swipe>
      <button
        type="button"
        className={cn(theme === "dark" ? "dark-home-ask" : "light-home-ask", live && "is-live")}
        data-ask-grok
        data-live-chat={live ? "" : undefined}
        aria-label={face.aria}
        title={face.aria}
        onClick={onOpen}
      >
        {live ? <AskPillLiveLabel label={face.label} /> : face.label}
      </button>
    </div>
  );
}
