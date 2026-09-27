/**
 * Which suite screen is on top. The shell updates this on a tab change.
 * The next RV Grok ask attaches it as request context. It is not a chat message.
 */

import { formatScreenContext, stripScreenContext } from "./screenGuides.ts";

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

let activeScreen = "";
let askBarGrokEntry = false;
const screenListeners = new Set<(name: string) => void>();

export function screenNameForTab(tab: string, homeOpen: boolean): string {
  if (homeOpen) return "Home";
  return TAB_SCREEN[tab] || "Grok";
}

/** Ask-bar send/mic opens Grok. That hop is not a room change. */
export function markAskBarGrokEntry(): void {
  askBarGrokEntry = true;
}

/** Fires when the screen changes, except the ask bar opening Grok. */
export function onActiveScreenChange(listener: (name: string) => void): () => void {
  screenListeners.add(listener);
  return () => {
    screenListeners.delete(listener);
  };
}

export function setActiveScreen(name: string): void {
  const next = name.trim();
  const fromAskBar = askBarGrokEntry && next === "Grok";
  askBarGrokEntry = false;
  if (next === activeScreen) return;
  activeScreen = next;
  if (fromAskBar) return;
  for (const listener of screenListeners) listener(next);
}

export function readActiveScreen(): string {
  return activeScreen;
}

/**
 * Catalog/system context for one ask. Previous screen lines are replaced.
 * `screenAtAsk` is the screen captured when the user sent the ask. Later
 * tab changes must not replace it.
 */
export function withActiveScreen(
  catalogContext?: string,
  screenAtAsk?: string,
): string | undefined {
  const screen = (screenAtAsk !== undefined ? screenAtAsk : activeScreen).trim();
  const base = stripScreenContext(catalogContext || "");
  if (!screen) return base || undefined;
  const block = formatScreenContext(screen);
  return base ? `${base}\n\n${block}` : block;
}
