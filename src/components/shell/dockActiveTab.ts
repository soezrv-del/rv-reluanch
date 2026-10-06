/** Screens that live under More (sheet tools, Premium, Sold) light More. */
const UNDER_MORE = ["rvtow", "rvcal", "rvtrips", "more", "rvsold"];

/**
 * Which dock tab is lit. Pure helper — no DockTab identifier.
 * Home lights Facts, the same as dark Home's own row (Facts is-on).
 */
export function dockActiveTab(
  tab: string,
  homeOpen: boolean,
  moreOpen = false,
): "rvfax" | "rvlot" | "rvgrok" | "more" | null {
  if (moreOpen) return "more";
  if (homeOpen) return "rvfax";
  if (UNDER_MORE.includes(tab)) return "more";
  if (tab === "rvfax" || tab === "rvlot" || tab === "rvgrok") return tab;
  return null;
}
