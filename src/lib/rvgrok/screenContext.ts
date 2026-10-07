/**
 * Which suite screen is on top. The shell updates this on a tab change.
 * The next RV Grok ask attaches it as request context. It is not a chat message.
 */

import { formatScreenContext, stripScreenContext } from "./screenGuides.ts";

const TAB_SCREEN: Record<string, string> = {
  rvfax: "Facts",
  rvcal: "CAL",
  rvtow: "TOW",
  rvlot: "LOT",
  rvtrips: "RV GPS",
  rvgrok: "Grok",
  more: "Premium",
  rvsold: "Sold",
  rvshare: "Share",
};

/**
 * Rooms whose name is pushed into chat context on navigation.
 * RVFACTS → Facts. Calculator → CAL. Tow Guide → TOW. Lot Inventory → LOT.
 * Those are context names, not the pill labels.
 */
export const ROUTED_CHAT_SCREENS = ["Facts", "CAL", "TOW", "LOT"] as const;

export function isRoutedChatScreen(name: string): boolean {
  return (ROUTED_CHAT_SCREENS as readonly string[]).includes(name.trim());
}

/** One line for the Live Voice thread. The next reply reads it; it is not a question. */
export function routeScreenChatNote(name: string): string {
  const screen = name.trim();
  return `ACTIVE SCREEN: ${screen}. He just opened this screen. Use it for the next reply. Do not answer this note.`;
}

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

/** One line in the chat system prompt. The route name is filled in by the caller. */
export function pageContextLine(page: string): string {
  const name = page.trim();
  if (!name) return "";
  return `You are currently on the ${name} page. Use this as context for your answers.`;
}

/**
 * Route-change hook. The shell calls this on every navigation.
 * Facts, CAL, TOW, and LOT become the active screen before the next reply.
 * Opening Grok from the ask bar is still not a room change.
 */
export function onRouteChange(tab: string, homeOpen: boolean): void {
  setActiveScreen(screenNameForTab(tab, homeOpen));
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
