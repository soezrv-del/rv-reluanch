/**
 * Scroll-vs-tap for SelectSheet list rows.
 *
 * Capacitor WebViews (iOS + Android) synthesize click / pointerup on the
 * row that received touchstart even after the user scrolled the list.
 * Only a short press with little movement and no list scroll is a tap.
 */

/** Finger travel at or above this is a scroll, not a tap. */
export const SHEET_TAP_SLOP_PX = 10;

/** scrollTop delta that means the list moved under the finger. */
export const SHEET_TAP_SCROLL_PX = 2;

export type SheetTapGesture = {
  pointerId: number | null;
  x: number;
  y: number;
  scrollTop: number;
  moved: boolean;
};

export function beginSheetTap(input: {
  x: number;
  y: number;
  scrollTop?: number;
  pointerId?: number | null;
}): SheetTapGesture {
  return {
    pointerId: input.pointerId ?? null,
    x: input.x,
    y: input.y,
    scrollTop: input.scrollTop ?? 0,
    moved: false,
  };
}

export function noteSheetTapSample(
  gesture: SheetTapGesture,
  sample: { x?: number; y?: number; scrollTop?: number },
  slop = SHEET_TAP_SLOP_PX,
): boolean {
  if (sample.x != null && Math.abs(sample.x - gesture.x) > slop) {
    gesture.moved = true;
  }
  if (sample.y != null && Math.abs(sample.y - gesture.y) > slop) {
    gesture.moved = true;
  }
  if (
    sample.scrollTop != null &&
    Math.abs(sample.scrollTop - gesture.scrollTop) > SHEET_TAP_SCROLL_PX
  ) {
    gesture.moved = true;
  }
  return gesture.moved;
}

/**
 * True only for a short press with little movement and no list scroll.
 * A missing gesture is never a pointer tap (keyboard uses click.detail).
 */
export function isSheetTap(
  gesture: SheetTapGesture | null | undefined,
  sample?: {
    x?: number;
    y?: number;
    scrollTop?: number;
    pointerId?: number;
  },
  slop = SHEET_TAP_SLOP_PX,
): boolean {
  if (!gesture || gesture.moved) return false;
  if (
    sample?.pointerId != null &&
    gesture.pointerId != null &&
    sample.pointerId !== gesture.pointerId
  ) {
    return false;
  }
  if (sample) noteSheetTapSample(gesture, sample, slop);
  return !gesture.moved;
}

/**
 * Row `click` after a pointer gesture: suppress if that gesture scrolled.
 * Keyboard / assistive tech typically fire click with detail 0 and no
 * pointer gesture — those must still commit.
 */
export function shouldCommitSheetItemClick(opts: {
  detail: number;
  suppressPointerClick: boolean;
}): boolean {
  if (opts.detail === 0) return true;
  return !opts.suppressPointerClick;
}
