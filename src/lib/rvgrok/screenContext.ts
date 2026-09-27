/**
 * Which suite screen is on top. The shell updates this on a tab change.
 * The next RV Grok ask attaches it as request context. It is not a chat message.
 */

const TAB_SCREEN: Record<string, string> = {
  rvfax: "Facts",
  rvcal: "Cal",
  rvtow: "Tow",
  rvlot: "Lot",
  rvtrips: "RV GPS",
  rvgrok: "Grok",
  more: "Premium",
  rvsold: "Sold",
  rvshare: "Share",
};

const SCREEN_LINE = /^ACTIVE SCREEN:[^\n]*$/gm;

let activeScreen = "";

export function screenNameForTab(tab: string, homeOpen: boolean): string {
  if (homeOpen) return "Home";
  return TAB_SCREEN[tab] || "Grok";
}

export function setActiveScreen(name: string): void {
  activeScreen = name.trim();
}

export function readActiveScreen(): string {
  return activeScreen;
}

/** Catalog/system context for one ask. Previous screen lines are replaced. */
export function withActiveScreen(catalogContext?: string): string | undefined {
  const screen = activeScreen.trim();
  const base = (catalogContext || "").replace(SCREEN_LINE, "").trim();
  if (!screen) return base || undefined;
  const line = `ACTIVE SCREEN: ${screen}. Answer this ask in that screen's context.`;
  return base ? `${base}\n\n${line}` : line;
}
