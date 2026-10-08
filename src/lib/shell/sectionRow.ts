/** The one swipe row under Home. Order is the visual order. */
export const SECTION_ROW = [
  { id: "rvfax", label: "Facts" },
  { id: "rvlot", label: "Inventory" },
  { id: "rvgrok", label: "Chat" },
  { id: "rvcal", label: "Cal" },
  { id: "rvtow", label: "Tow" },
  { id: "more", label: "More" },
] as const;

export type SectionId = (typeof SECTION_ROW)[number]["id"];

export function sectionIndex(id: string): number {
  return SECTION_ROW.findIndex((page) => page.id === id);
}

export function isSectionId(id: string): id is SectionId {
  return sectionIndex(id) >= 0;
}

/**
 * Finger moving down on Home opens the row.
 * A sideways drag does not. Short moves do not.
 */
export function planHomeSwipeDown(dx: number, dy: number): "open" | "ignore" {
  if (dy < 72) return "ignore";
  if (Math.abs(dx) > dy * 0.75) return "ignore";
  return "open";
}

/**
 * Sideways only when the drag is clearly horizontal, so a vertical
 * scroll inside a page keeps the page. Once vertical wins, it stays.
 */
export function planSectionAxis(dx: number, dy: number): "h" | "v" | null {
  if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return null;
  if (Math.abs(dx) > Math.abs(dy) * 1.35 && Math.abs(dx) >= 12) return "h";
  return "v";
}

/** One page per flick. No wrap. */
export function sectionStep(dx: number, index: number, length: number): -1 | 0 | 1 {
  if (dx <= -48 && index < length - 1) return 1;
  if (dx >= 48 && index > 0) return -1;
  return 0;
}
