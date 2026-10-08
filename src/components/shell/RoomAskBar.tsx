import type { AppTab, DockRoomId } from "./BottomTabs";
import { BottomTabs } from "./BottomTabs";
import { AskGrokPill } from "./AskGrokPill";
import { SuiteVoiceFloat } from "./SuiteVoiceFloat";
import { MoreSheet, type MorePick } from "./MoreSheet";

/**
 * The original dock (Facts · Inventory · Chat · More) with the More sheet
 * anchored above it. Home's Ask RV Grok pill sits right above the dock on
 * every other screen; Home keeps its own pill, and Chat (the RV Grok room,
 * with its own composer and live voice) shows none.
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
  /** Dock taps — Facts / Inventory / Chat / More. */
  onDockTap?: (tab: DockRoomId) => void;
  moreOpen?: boolean;
  onMorePick?: (id: MorePick) => void;
  onMoreClose?: () => void;
}) {
  const showAsk = !homeOpen && tab !== "rvgrok";
  const showVoice = homeOpen || tab !== "rvgrok";
  return (
    <div data-room-ask data-no-swipe className="showroom-dock">
      {showVoice ? <SuiteVoiceFloat /> : null}
      {showAsk ? <AskGrokPill onOpen={() => onOpen("rvgrok")} /> : null}
      <BottomTabs
        tab={tab}
        homeOpen={homeOpen}
        moreOpen={moreOpen}
        onChange={(id) => {
          if (onDockTap) onDockTap(id);
          else onOpen(id);
        }}
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
