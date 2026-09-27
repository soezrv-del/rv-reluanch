/**
 * One-direction seamless scroll for a duplicated strip (Newest Arrivals).
 * The room pill row does not use this — it is a native horizontal scroller.
 */

export const SEAMLESS_LOOP_PX_PER_SEC = 36;

/** Resume the loop this long after the finger or pointer lets go. */
export const SEAMLESS_LOOP_RESUME_MS = 3000;

/** Loop only when the primary set overflows and motion is allowed. */
export function shouldSeamlessLoop(opts: {
  reducedMotion: boolean;
  overflows: boolean;
}): boolean {
  return !opts.reducedMotion && opts.overflows;
}

/**
 * Advance scroll by `deltaPx` and wrap once the first copy has fully
 * passed, so the duplicate sits where the first copy started.
 */
export function nextSeamlessScroll(
  scrollLeft: number,
  distance: number,
  deltaPx: number,
): number {
  if (!(distance > 0) || !(deltaPx > 0) || !Number.isFinite(scrollLeft)) {
    return scrollLeft;
  }
  let next = scrollLeft + deltaPx;
  if (next >= distance) {
    next -= Math.floor(next / distance) * distance;
  }
  return next;
}
