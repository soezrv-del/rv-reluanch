import { useSyncExternalStore } from "react";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import "./home-truth.css";

/**
 * Home's Ask RV Grok pill, carried to every other screen right above the
 * dock. Same classes as Home: copper (dark-home-ask) in dark, graphite
 * (light-home-ask) in light. Opens the RV Grok room.
 */
export function AskGrokPill({ onOpen }: { onOpen: () => void }) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  return (
    <div className="shell-ask-wrap" data-shell-ask data-no-swipe>
      <button
        type="button"
        className={theme === "dark" ? "dark-home-ask" : "light-home-ask"}
        data-ask-grok
        onClick={onOpen}
      >
        Ask RV Grok
      </button>
    </div>
  );
}
