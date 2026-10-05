import type { AppTab } from "./BottomTabs";
import { DOCK_ROOM_IDS, type DockRoomId } from "./BottomTabs";

/**
 * Every suite screen that renders as a pane — Facts, Inventory, Ask, Tow, Cal,
 * RV GPS. Panes come from this list, not the dock.
 */
export const TAB_ORDER = [
  "rvfax",
  "rvlot",
  "rvgrok",
  "rvtow",
  "rvcal",
  "rvtrips",
] as const satisfies readonly AppTab[];

/** The four dock rooms — Home · Facts · Inventory · Ask. */
export const DOCK_TABS = DOCK_ROOM_IDS;

/** Swipe-between-tabs removed. */
export const SWIPE_ORDER = [] as const satisfies readonly AppTab[];

/** Tools reachable from the settings sheet (and Tow/Cal header shortcuts). */
export const MORE_SHEET_TOOLS = [
  "rvtow",
  "rvcal",
  "rvtrips",
] as const satisfies readonly AppTab[];

const UNDER_MORE: readonly AppTab[] = [...MORE_SHEET_TOOLS, "more", "rvsold"];

export function isUnderMore(tab: AppTab): boolean {
  return UNDER_MORE.includes(tab);
}

export function isSwipeTab(_tab: AppTab): boolean {
  return false;
}

export function dockTabOrder(_pro?: boolean): readonly DockRoomId[] {
  return DOCK_TABS;
}

/** Active pane at 0; no swipe neighbors. */
export function paneSlot(
  id: AppTab,
  active: AppTab,
): { shift: number; peek: boolean } {
  if (id === active) return { shift: 0, peek: true };
  return { shift: 1, peek: false };
}

export const PAGE_ACCENT: Record<AppTab, "sapphire" | "ruby" | "gold"> = {
  rvfax: "sapphire",
  rvcal: "sapphire",
  rvtow: "sapphire",
  rvtrips: "gold",
  rvshare: "sapphire",
  rvgrok: "sapphire",
  rvsold: "sapphire",
  rvlot: "sapphire",
  more: "sapphire",
};

export const PAGE_COPY: Record<
  AppTab,
  { title: string; line: string; badge?: string }
> = {
  rvgrok: {
    title: "Ask",
    line: "Name the year, make, and model — spec reports on the lot.",
    badge: "HOME",
  },
  rvfax: {
    title: "Facts",
    line: "Get specs, market value, ratings, NHTSA recalls, and more.",
  },
  rvcal: {
    title: "Cal",
    line: "",
  },
  rvtow: {
    title: "Tow",
    line: "Truck · SUV · VIN decode for safe tow math.",
  },
  rvtrips: {
    title: "RV GPS",
    line: "RV GPS with campgrounds, dump stations, and more.",
  },
  rvshare: {
    title: "Share",
    line: "Send a brochure summary from the coach report.",
    badge: "SEND",
  },
  rvsold: {
    title: "SOLD",
    line: "Deals · gross · split · net · owed.",
    badge: "PRO",
  },
  rvlot: {
    title: "Inventory",
    line: "",
    badge: "STOCK",
  },
  more: {
    title: "Settings",
    line: "Voice settings · NHTSA · suite tools.",
    badge: "SUITE",
  },
};
