import type { AppTab } from "./BottomTabs";

/** Dock + swipe order — Facts home, Grok centered. Share is not a dock tab. */
export const TAB_ORDER = [
  "rvfax",
  "rvcal",
  "rvgrok",
  "rvtow",
  "rvtrips",
] as const satisfies readonly AppTab[];

/** Pros get Sold on the dock (owed balance). Consumer stays the 5-tab order. */
export function dockTabOrder(pro: boolean): readonly AppTab[] {
  return pro ? [...TAB_ORDER, "rvsold"] : TAB_ORDER;
}

/** One hero accent per page — premium color discipline */
export const PAGE_ACCENT: Record<AppTab, "sapphire" | "ruby" | "gold"> = {
  rvfax: "sapphire",
  rvcal: "sapphire",

  rvtow: "sapphire",
  rvtrips: "sapphire",
  rvshare: "sapphire",
  rvgrok: "sapphire",
  rvsold: "gold",

  more: "gold",
};

export const PAGE_COPY: Record<
  AppTab,
  { title: string; line: string; badge?: string }
> = {
  rvgrok: {
    title: "RvGROK",
    line: "Your RV expert — from the best fishing spots to troubleshooting your RV.",
    badge: "HOME",
  },
  rvfax: {
    title: "RvFACTS",
    line: "Get specs, market value, ratings, NHTSA recalls, and more.",
    badge: "LIVE",
  },
  rvcal: {
    title: "RvCAL",
    line: "ZIP-based calculator with lender comparisons.",
    badge: "LIVE",
  },
  rvtow: {
    title: "RvTOW",
    line: "Truck · SUV · VIN decode for safe tow math.",
    badge: "LIVE",
  },
  rvtrips: {
    title: "RvTRIPS",
    line: "RV GPS with campgrounds, dump stations, and more.",
    badge: "LIVE",
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
  more: {
    title: "PREMIUM",
    line: "Voice settings · NHTSA · suite tools.",
    badge: "SUITE",
  },
};
