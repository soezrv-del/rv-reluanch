import type { AppTab } from "./BottomTabs";

/** Dock order — Facts home, Grok on the right */
export const TAB_ORDER = [
  "rvfax",
  "rvcal",
  "rvtow",
  "rvtrips",
  "rvgrok",
] as const satisfies readonly AppTab[];

/** One hero accent per page — premium color discipline */
export const PAGE_ACCENT: Record<AppTab, "sapphire" | "ruby" | "gold"> = {
  rvfax: "sapphire",
  rvcal: "sapphire",

  rvtow: "sapphire",
  rvtrips: "sapphire",
  rvgrok: "sapphire",

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
  more: {
    title: "PREMIUM",
    line: "Voice settings · NHTSA · suite tools.",
    badge: "SUITE",
  },
};
