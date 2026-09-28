/**
 * Keep every screen opened at the top.
 *
 * iOS Safari restores a layout-viewport scroll (TanStack scrollRestoration)
 * and scrolls the document to reveal a focused field. The ask bar sits at
 * the bottom, so that scroll hides the header. The shell is position:fixed;
 * the document itself must stay at scrollTop 0. Inner lists reset only when
 * the user opens a screen, and only until they touch the page.
 */

let cancelPending: (() => void) | null = null;

export function resetScreenScroll(): void {
  if (typeof window === "undefined") return;
  const zero = (el: Element | null) => {
    if (!el || !("scrollTop" in el)) return;
    const node = el as HTMLElement;
    if (node.scrollTop !== 0) node.scrollTop = 0;
    if ("scrollLeft" in node && node.classList.contains("showroom-home")) {
      node.scrollLeft = 0;
    }
  };
  zero(document.scrollingElement);
  zero(document.documentElement);
  zero(document.body);
  window.scrollTo(0, 0);
  document
    .querySelectorAll("[data-home-screen], [data-app-scroll], .showroom-home")
    .forEach((el) => zero(el));
}

/** Snap scroll to 0 on open, unless the user has already touched the screen. */
export function pinScreenScrollOnOpen(): () => void {
  cancelPending?.();
  let touched = false;
  const mark = () => {
    touched = true;
  };
  window.addEventListener("pointerdown", mark, { passive: true });
  const run = () => {
    if (!touched) resetScreenScroll();
  };
  run();
  const timers = [40, 140, 320].map((ms) => window.setTimeout(run, ms));
  const cancel = () => {
    window.removeEventListener("pointerdown", mark);
    for (const t of timers) window.clearTimeout(t);
    if (cancelPending === cancel) cancelPending = null;
  };
  cancelPending = cancel;
  return cancel;
}
