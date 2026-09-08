/**
 * Shared iOS-feel math for pull-to-refresh and adjacent-tab swipe.
 * Pure helpers — hooks apply these; tests cover the numbers.
 */

/** Diminishing travel so a hard yank never jumps the page. */
export function rubberband(distance: number, limit = 120): number {
  if (distance <= 0) return 0;
  const t = distance / (limit * 2.15);
  return limit * (1 - 1 / (1 + t));
}

export function pullProgress(dy: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return Math.min(1, Math.max(0, dy / threshold));
}

export function shouldArmPull(dy: number, hintAt: number): boolean {
  return dy >= hintAt;
}

export function shouldFirePull(
  dy: number,
  threshold: number,
  scrollTop: number,
): boolean {
  return scrollTop <= 0 && dy > threshold;
}

/** Lock axis after a small deadzone; slight horizontal bias for tab swipe. */
export function swipeAxisLock(
  dx: number,
  dy: number,
  deadzone = 6,
): "h" | "v" | null {
  if (Math.abs(dx) < deadzone && Math.abs(dy) < deadzone) return null;
  return Math.abs(dx) > Math.abs(dy) * 0.62 ? "h" : "v";
}

/**
 * iOS-like commit: a short flick or ~38% of width, else the base threshold.
 * Velocity is px/ms.
 */
export function swipeCommitDistance(
  velocity: number,
  threshold: number,
  width = 390,
): number {
  if (velocity > 0.55) return Math.max(14, Math.min(threshold * 0.35, width * 0.12));
  if (velocity > 0.28) return Math.max(18, Math.min(threshold * 0.55, width * 0.22));
  return Math.min(threshold, width * 0.38);
}

export function shouldCommitSwipe(opts: {
  dx: number;
  dy: number;
  dt: number;
  threshold: number;
  locked: "h" | "v" | null;
  width?: number;
}): boolean {
  const absX = Math.abs(opts.dx);
  const absY = Math.abs(opts.dy);
  const clearlyHorizontal = absX > absY * 1.12 && absX >= 16;
  if (opts.locked === "v" && !clearlyHorizontal) return false;
  if (opts.locked !== "h" && !clearlyHorizontal) return false;
  if (opts.dt > 1400) return false;
  if (absX < absY * 0.92 && !clearlyHorizontal) return false;
  const velocity = absX / Math.max(opts.dt, 1);
  const needed = swipeCommitDistance(velocity, opts.threshold, opts.width);
  return absX >= needed;
}

/** -1 previous tab, +1 next tab, 0 stay (edge rubber-band). */
export function swipeStep(
  dx: number,
  index: number,
  length: number,
): -1 | 0 | 1 {
  if (dx < 0 && index < length - 1) return 1;
  if (dx > 0 && index > 0) return -1;
  return 0;
}

/** Follow-the-finger offset; rubber-band when there is no adjacent tab. */
export function swipeFollowDx(
  rawDx: number,
  index: number,
  length: number,
  width: number,
): number {
  const atStart = index <= 0;
  const atEnd = index >= length - 1;
  if (atStart && rawDx > 0) return rubberband(rawDx, Math.min(72, width * 0.22));
  if (atEnd && rawDx < 0) return -rubberband(-rawDx, Math.min(72, width * 0.22));
  return rawDx;
}

export const IOS_SWIPE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
export const IOS_SWIPE_MS = 340;
export const IOS_PULL_HOLD_MS = 380;
