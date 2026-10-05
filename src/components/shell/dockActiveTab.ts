/** Pure helper — no DockTab identifier; return type is the room id union. */
export function dockActiveTab(
  tab: string,
  homeOpen: boolean,
  _moreOpen = false,
): "home" | "rvfax" | "rvlot" | "rvgrok" | null {
  if (homeOpen) return "home";
  if (tab === "rvfax" || tab === "rvlot" || tab === "rvgrok") return tab;
  return null;
}
