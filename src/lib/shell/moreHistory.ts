/**
 * History entries for screens under More (Tow, Cal, RV GPS, Premium, Sold)
 * and for the More sheet / VIN overlay.
 *
 * Main rooms (Home, Facts, Inventory, Ask) never push. Opening the sheet,
 * the VIN Decoder, or a tool pushes one entry, so Android back
 * (MainActivity → webView.goBack()) closes the sheet or returns to the
 * screen the tool was opened from instead of leaving the app. Going back
 * to a main tab unwinds every entry in one traversal.
 */

export type NavView = { tab: string; home: boolean };

export type NavKind = "sheet" | "vin" | "tool";

export type NavMarker = {
  rvfoxNav: 1;
  kind: NavKind;
  /** Tool shown at this entry, or the screen under the sheet / VIN. */
  tab: string;
  home: boolean;
  /** How many of our entries sit above the base entry, this one included. */
  d: number;
};

export function makeNavMarker(kind: NavKind, view: NavView, d: number): NavMarker {
  return { rvfoxNav: 1, kind, tab: view.tab, home: view.home, d };
}

export function readNavMarker(state: unknown): NavMarker | null {
  if (!state || typeof state !== "object") return null;
  const m = state as Partial<NavMarker>;
  if (m.rvfoxNav !== 1) return null;
  if (m.kind !== "sheet" && m.kind !== "vin" && m.kind !== "tool") return null;
  if (typeof m.tab !== "string" || typeof m.d !== "number") return null;
  return { rvfoxNav: 1, kind: m.kind, tab: m.tab, home: Boolean(m.home), d: m.d };
}

export function sameView(a: NavView, b: NavView): boolean {
  return a.home === b.home && (a.home || a.tab === b.tab);
}

export type TabHistoryStep = "push" | "replace" | "unwind" | "none";

/**
 * What a screen change does to history (changes that came from a popstate
 * are skipped by the caller).
 * - into a tool: push, or replace the sheet entry it was picked from
 * - back to a main tab or Home: unwind everything we pushed
 */
export function planTabHistory({
  prev,
  next,
  nextUnderMore,
  depth,
  pickedFromSheet,
}: {
  prev: NavView;
  next: NavView;
  nextUnderMore: boolean;
  depth: number;
  pickedFromSheet: boolean;
}): TabHistoryStep {
  if (sameView(prev, next)) return "none";
  if (!next.home && nextUnderMore) {
    return pickedFromSheet && depth > 0 ? "replace" : "push";
  }
  return depth > 0 ? "unwind" : "none";
}

/**
 * Where a back (popstate) lands. `null` = nothing for the shell to do
 * (another sheet's marker, or we never pushed).
 */
export function popTarget(
  state: unknown,
  depth: number,
  base: NavView,
): { view: NavView; depth: number } | null {
  const m = readNavMarker(state);
  if (!m) {
    if (depth === 0) return null;
    return { view: base, depth: 0 };
  }
  return { view: { tab: m.tab, home: m.kind === "tool" ? false : m.home }, depth: m.d };
}
