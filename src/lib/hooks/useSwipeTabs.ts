import { useEffect, type RefObject } from "react";

/**
 * Capture-phase swipe must not claim the bottom dock. Android WebView
 * often fails to synthesize `click` when an ancestor is tracking the
 * same touch — even with passive listeners.
 */
export const SWIPE_BLOCK_SELECTOR =
  "input, textarea, select, [contenteditable='true'], [role='dialog'], [data-no-swipe], [data-no-swipe-scroll], [data-bottom-dock], .bottom-tabs-nav, .bottom-tab-btn, .price-slider-wrap, .price-slider, video";

export function isSwipeBlockedTarget(t: EventTarget | null): boolean {
  if (!(t instanceof Element)) return false;
  return Boolean(t.closest(SWIPE_BLOCK_SELECTOR));
}

/**
 * Easy left/right swipe to change tabs.
 * Attach to the suite <main>, not the shell — the dock must stay out of
 * the gesture target so Android tab taps fire.
 */
export function useSwipeTabs<T extends string>({
  order,
  active,
  onChange,
  targetRef,
  /** Min horizontal travel (px). Lower = easier. */
  threshold = 28,
  edgeOnly = false,
  /** When false, listeners still attach but never switch tabs. */
  enabled = true,
}: {
  order: readonly T[];
  active: T;
  onChange: (next: T) => void;
  targetRef: RefObject<HTMLElement | null>;
  threshold?: number;
  edgeOnly?: boolean;
  enabled?: boolean;
}) {
  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;

    let startX = 0;
    let startY = 0;
    let startT = 0;
    let tracking = false;
    let locked: "h" | "v" | null = null;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0]!;
      if (isSwipeBlockedTarget(e.target)) {
        tracking = false;
        return;
      }
      if (edgeOnly) {
        const w = window.innerWidth;
        if (touch.clientX > 40 && touch.clientX < w - 40) {
          tracking = false;
          return;
        }
      }
      startX = touch.clientX;
      startY = touch.clientY;
      startT = Date.now();
      tracking = true;
      locked = null;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking || e.touches.length !== 1) return;
      const touch = e.touches[0]!;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!locked) {
        // Very small deadzone + strong horizontal bias
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        locked = Math.abs(dx) > Math.abs(dy) * 0.55 ? "h" : "v";
      }
      if (locked === "v") {
        tracking = false;
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startT;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // If we never locked horizontal but gesture is clearly horizontal, allow it
      const clearlyHorizontal = absX > absY * 1.15 && absX >= 18;
      if (locked === "v" && !clearlyHorizontal) return;
      if (locked !== "h" && !clearlyHorizontal) return;

      const velocity = absX / Math.max(dt, 1);
      // Short flicks OK
      const needed =
        velocity > 0.3
          ? Math.max(16, threshold * 0.45)
          : velocity > 0.18
            ? Math.max(20, threshold * 0.7)
            : threshold;

      if (absX < needed) return;
      if (absX < absY * 0.95 && !clearlyHorizontal) return;
      if (dt > 1400) return;

      const idx = order.indexOf(active);
      if (idx < 0) return;
      if (dx < 0 && idx < order.length - 1) onChange(order[idx + 1]!);
      else if (dx > 0 && idx > 0) onChange(order[idx - 1]!);
    };

    // Capture phase so we see events even if children scroll
    el.addEventListener("touchstart", onStart, { passive: true, capture: true });
    el.addEventListener("touchmove", onMove, { passive: true, capture: true });
    el.addEventListener("touchend", onEnd, { passive: true, capture: true });
    el.addEventListener(
      "touchcancel",
      () => {
        tracking = false;
      },
      { capture: true },
    );

    return () => {
      el.removeEventListener("touchstart", onStart, true);
      el.removeEventListener("touchmove", onMove, true);
      el.removeEventListener("touchend", onEnd, true);
    };
  }, [active, edgeOnly, enabled, onChange, order, targetRef, threshold]);
}
