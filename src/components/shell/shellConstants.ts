import type { AppTab } from "./BottomTabs";

/**
 * Every suite screen that renders as a pane — Facts, Lot, Grok, Tow, Cal,
 * RV GPS. Panes come from this list, not the dock, so Tow, Cal and RV GPS
 * still mount after they moved under More. Share is not a pane.
 */
export const TAB_ORDER = [
  "rvfax",
  "rvlot",
  "rvgrok",
  "rvtow",
  "rvcal",
  "rvtrips",
] as const satisfies readonly AppTab[];

/** The four dock tabs — Facts · Inventory · Ask · More. */
export const DOCK_TABS = [
  "rvfax",
  "rvlot",
  "rvgrok",
  "more",
] as const satisfies readonly AppTab[];

/** Page swipe moves between the three main tabs only. */
export const SWIPE_ORDER = [
  "rvfax",
  "rvlot",
  "rvgrok",
] as const satisfies readonly AppTab[];

/** Big tiles in the More sheet. */
export const MORE_SHEET_TOOLS = [
  "rvtow",
  "rvcal",
  "rvtrips",
] as const satisfies readonly AppTab[];

/** Screens that live under More. The More tab stays lit on these. */
const UNDER_MORE: readonly AppTab[] = [...MORE_SHEET_TOOLS, "more", "rvsold"];

export function isUnderMore(tab: AppTab): boolean {
  return UNDER_MORE.includes(tab);
}

export function isSwipeTab(tab: AppTab): boolean {
  return (SWIPE_ORDER as readonly AppTab[]).includes(tab);
}

/** Dock tabs. Sold lives in Premium, never a dock square. */
export function dockTabOrder(_pro?: boolean): readonly AppTab[] {
  return DOCK_TABS;
}

/**
 * Pane slot relative to the active screen. Main tabs keep their swipe
 * neighbors at ±1. Anything under More sits one slot right of the main
 * tabs (a push), and main tabs sit one slot left while a tool is open.
 * Only a ±1 neighbor of a swipe tab ever peeks during a drag.
 */
export function paneSlot(
  id: AppTab,
  active: AppTab,
): { shift: number; peek: boolean } {
  if (id === active) return { shift: 0, peek: true };
  const swipe = SWIPE_ORDER as readonly AppTab[];
  const a = swipe.indexOf(active);
  const i = swipe.indexOf(id);
  if (a >= 0 && i >= 0) return { shift: i - a, peek: true };
  if (a >= 0) return { shift: 1, peek: false };
  return { shift: i >= 0 ? -1 : 1, peek: false };
}

/** One hero accent per page — premium color discipline */
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
    title: "RvGROK",
    line: "Name the year, make, and model — spec reports on the lot.",
    badge: "HOME",
  },
  rvfax: {
    title: "RvFACTS",
    line: "Get specs, market value, ratings, NHTSA recalls, and more.",
  },
  rvcal: {
    title: "RvCAL",
    line: "",
  },
  rvtow: {
    title: "RvTOW",
    line: "Truck · SUV · VIN decode for safe tow math.",
  },
  rvtrips: {
    title: "RV GPS",
    line: "RV GPS with campgrounds, dump stations, and more.",
  },
  rvshare: {
    title: "RvSHARE",
    line: "Send a brochure summary from the coach report.",
    badge: "SEND",
  },
  rvsold: {
    title: "SOLD",
    line: "Deals · gross · split · net · owed.",
    badge: "PRO",
  },
  rvlot: {
    title: "LOT",
    line: "",
    badge: "STOCK",
  },
  more: {
    title: "PREMIUM",
    line: "Voice settings · NHTSA · suite tools.",
    badge: "SUITE",
  },
};
