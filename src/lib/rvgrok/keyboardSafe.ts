/**
 * RV Grok keyboard lift — keep the composer / ask field above the IME.
 *
 * The shell is pinned to the visual viewport (`top: --vv-offset-top`,
 * `height: --vv-height`). The ask bar lives at the bottom of that shell.
 * Lift only the distance between that bottom and the top of the keyboard.
 * If the viewport already shrank, that distance is 0 — translating by the
 * full keyboard height parks the bar in the middle of the screen.
 *
 * `layoutHeight` must be the pre-keyboard height. iOS often shrinks
 * `innerHeight` together with `visualViewport`, which used to look like
 * "the shell did not move" and applied the inset a second time.
 *
 * Page fields (lot search) pass `pinChrome: false`. The keyboard is not
 * for the ask bar, so the bar stays on the shell bottom: flush with the
 * keyboard when the viewport shrank, or under it when the keyboard overlays.
 */
let restingLayoutPx = 0;

export function syncRestingLayout(
  innerHeight: number,
  keyboardOpen: boolean,
  fieldFocused = false,
): number {
  // A focused field can make iOS shrink innerHeight before the keyboard
  // inset is measurable. Don't record that short height as "resting".
  if (!keyboardOpen && !fieldFocused) {
    if (innerHeight > 0) restingLayoutPx = innerHeight;
    return innerHeight;
  }
  if (innerHeight > restingLayoutPx) restingLayoutPx = innerHeight;
  return restingLayoutPx || innerHeight;
}

export function currentRestingLayout(fallback = 0): number {
  return restingLayoutPx || fallback;
}

export function grokComposerKeyboardLift(opts: {
  open: boolean;
  inset: number;
  vvHeight: number;
  vvOffsetTop: number;
  layoutHeight: number;
  /** False when focus is a page field, not the ask bar or Grok composer. */
  pinChrome?: boolean;
}): number {
  if (!opts.open || opts.inset <= 0) return 0;
  if (opts.pinChrome === false) return 0;
  const shellBottom = opts.vvOffsetTop + opts.vvHeight;
  const keyboardTop = opts.layoutHeight - opts.inset;
  const gap = Math.round(shellBottom - keyboardTop);
  // Already sitting on the keyboard (or above it). Do not lift again.
  if (gap <= 40) return 0;
  return Math.min(gap, Math.round(opts.inset));
}

/** Extra scroll room so a mid-card landing composer can scroll above the IME. */
export function grokScrollKeyboardPad(open: boolean): number {
  return open ? 88 : 0;
}
