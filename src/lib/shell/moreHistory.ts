/**
 * History entries for screens under More (Tow, Cal, RV GPS, Premium, Sold)
 * and for the More sheet / VIN overlay.
 *
 * Leaving Home pushes one entry, so Android back (MainActivity →
 * webView.goBack()) returns to Home instead of leaving the app. Section-row
 * swipes never push; they replace our top entry. Opening the sheet, the VIN
 * Decoder, or a tool from a handoff pushes one entry, so back closes the
 * sheet or returns to the screen the tool was opened from. Going Home
 * unwinds every entry in one traversal.
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

export type TabHistoryStep = "push" | "replace" | "unwind" | "unwind-replace" | "none";

/**
 * What a screen change does to history (changes that came from a popstate
 * are skipped by the caller).
 * - to Home: unwind everything we pushed
 * - a section-row swipe or dot: never push; replace our top entry so Back
 *   still returns to where the row was entered from (Home, or the prior view)
 * - off Home: push one entry, so Back returns to Home in one press
 * - into a tool: push, or replace the sheet entry it was picked from
 * - to a main tab: unwind, but keep the entry that leads back to Home
 */
export function planTabHistory({
  prev,
  next,
  base,
  nextUnderMore,
  depth,
  pickedFromSheet,
  viaRow = false,
}: {
  prev: NavView;
  next: NavView;
  /** View under our first entry (only meaningful when depth > 0). */
  base?: NavView;
  nextUnderMore: boolean;
  depth: number;
  pickedFromSheet: boolean;
  /** The change came from the section row (swipe or dot). */
  viaRow?: boolean;
}): TabHistoryStep {
  if (sameView(prev, next)) return "none";
  if (next.home) return depth > 0 ? "unwind" : "none";
  const backToBase = depth > 0 && base !== undefined && sameView(base, next);
  if (viaRow) {
    if (depth === 0) return "none";
    return backToBase ? "unwind" : "replace";
  }
  if (prev.home) return pickedFromSheet && depth > 0 ? "replace" : "push";
  if (nextUnderMore) {
    return pickedFromSheet && depth > 0 ? "replace" : "push";
  }
  if (depth === 0) return "none";
  if (backToBase || base === undefined) return "unwind";
  return depth === 1 ? "replace" : "unwind-replace";
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
