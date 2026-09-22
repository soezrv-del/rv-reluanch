/**
 * RV Grok keyboard lift — keep the composer / ask field above the IME.
 *
 * Capacitor sets Keyboard.resize = none, so WKWebView often reports a full
 * visualViewport while --kb-inset is the keyboard height. Safari usually
 * shrinks visualViewport; .app-shell already follows --vv-height, so extra
 * footer pad there would double-count and crush the thread.
 */
export function grokComposerKeyboardLift(opts: {
  open: boolean;
  inset: number;
  vvHeight: number;
  vvOffsetTop: number;
  layoutHeight: number;
}): number {
  if (!opts.open || opts.inset <= 0) return 0;
  const vvBottom = opts.vvHeight + opts.vvOffsetTop;
  const shellTracksVv =
    opts.vvHeight > 80 && opts.layoutHeight - vvBottom > 40;
  return shellTracksVv ? 0 : Math.round(opts.inset);
}

/** Extra scroll room so a mid-card landing composer can scroll above the IME. */
export function grokScrollKeyboardPad(open: boolean): number {
  return open ? 88 : 0;
}
