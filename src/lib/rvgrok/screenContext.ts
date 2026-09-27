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

/**
 * One short usage line per screen the hook names. Kept here so room files
 * stay untouched. Only the active screen's line is sent with an ask.
 */
export const SCREEN_GUIDANCE: Record<string, string> = {
  Home: "Shows the last looked-up coach, or the newest lot unit, with the lot count. Ask below, or open Facts, Lot, Cal, or Tow.",
  Facts:
    "Look up a coach by year, make, model, and floorplan for specs, market value, ratings, and recalls.",
  Cal: "Enter price, down payment, rate, and term to get a payment. ZIP and credit score adjust tax and the rate.",
  Tow: "Enter tow vehicle and trailer weights to check towing capacity. Use payload, max tow, RV GVWR, and pin or tongue.",
  Lot: "Search the dealer in-stock lot by type or text. This is the lot snapshot, not the brochure catalog.",
  "RV GPS":
    "Enter a start and destination to route the trip, with overnight stops, campgrounds, and dump stations.",
  Grok: "Ask in text, tap the mic for Live Voice, or send a photo of the coach.",
  Premium:
    "Opens voice settings, RV GPS, financing, tow match, share, help, and an NHTSA recall lookup.",
  Sold: "Enter buyer name, gross, and split to log a deal and see salesman net and what is owed.",
  Share: "Turn the open coach report into a brochure summary, then send or copy it.",
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
  const base = (catalogContext || "").replace(SCREEN_LINE, "").trim();
  if (!screen) return base || undefined;
  const guidance = SCREEN_GUIDANCE[screen];
  const line = guidance
    ? `ACTIVE SCREEN: ${screen}. ${guidance}`
    : `ACTIVE SCREEN: ${screen}. Answer this ask in that screen's context.`;
  return base ? `${base}\n\n${line}` : line;
}
