import type { AppTab, DockRoomId } from "./BottomTabs";
import { BottomTabs } from "./BottomTabs";
import { MoreSheet, type MorePick } from "./MoreSheet";

/**
 * The original dock (Facts · Inventory · Chat · More) with the More sheet
 * anchored above it. No separate Ask bar — Chat opens the RV Grok room,
 * which has its own composer and live voice.
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
  return (
    <div data-room-ask data-no-swipe className="showroom-dock">
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
