/**
 * Which dock tab wears the copper / active mark.
 * Home stays lit while the home screen is open. Coach detail keeps Inventory.
 * Tools under the settings sheet (Tow, Cal, GPS, …) light nothing.
 */
export function dockActiveTab(
  tab: string,
  homeOpen: boolean,
  _moreOpen = false,
): "home" | "rvfax" | "rvlot" | "rvgrok" | null {
  if (homeOpen) return "home";
  if (tab === "rvfax" || tab === "rvlot" || tab === "rvgrok") return tab;
  return null;
}
