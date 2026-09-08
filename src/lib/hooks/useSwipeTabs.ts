import { useEffect, type RefObject } from "react";
import { hapticLight } from "@/lib/haptics";
import {
  IOS_SWIPE_MS,
  shouldCommitSwipe,
  swipeAxisLock,
  swipeFollowDx,
  swipeStep,
} from "./iosGestures";

/**
 * Capture-phase swipe must not claim the bottom dock. Android WebView
 * often fails to synthesize `click` when an ancestor is tracking the
 * same touch — even with passive listeners.
 */
export const SWIPE_BLOCK_SELECTOR =
  "input, textarea, select, [contenteditable='true'], [role='dialog'], [data-no-swipe], [data-no-swipe-scroll], [data-bottom-dock], .bottom-tabs-nav, .bottom-tab-btn, .price-slider-wrap, .price-slider, video, [data-map-engine], [data-mapbox-canvas-host], [data-route-basemap], .select-sheet-root";

export function isSwipeBlockedTarget(t: EventTarget | null): boolean {
  if (!(t instanceof Element)) return false;
  return Boolean(t.closest(SWIPE_BLOCK_SELECTOR));
}

function writeSwipeVars(
  el: HTMLElement,
  dx: number,
  dragging: boolean,
) {
  el.style.setProperty("--swipe-dx", `${dx}px`);
  if (dragging) el.setAttribute("data-swipe-dragging", "1");
  else el.removeAttribute("data-swipe-dragging");
}

/**
 * Easy left/right swipe to change tabs.
 * Attach to the suite <main>, not the shell — the dock must stay out of
 * the gesture target so Android tab taps fire.
 *
 * Follows the finger (iOS interactive pop feel) by writing `--swipe-dx`
 * on `targetRef`. AppShell panes consume that + `--swipe-i`.
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
  /** Mount the adjacent pane as soon as the finger locks horizontal. */
  onPeek,
}: {
  order: readonly T[];
  active: T;
  onChange: (next: T) => void;
  targetRef: RefObject<HTMLElement | null>;
  threshold?: number;
  edgeOnly?: boolean;
  enabled?: boolean;
  onPeek?: (next: T) => void;
}) {
  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;

    let startX = 0;
    let startY = 0;
    let startT = 0;
    let tracking = false;
    let locked: "h" | "v" | null = null;
    let finishing = false;
    let finishTimer = 0;

    const widthOf = () => el.getBoundingClientRect().width || window.innerWidth;

    const peekToward = (dx: number) => {
      if (!onPeek) return;
      const idx = order.indexOf(active);
      const step = swipeStep(dx, idx, order.length);
      if (step === 0) return;
      const next = order[idx + step];
      if (next) onPeek(next);
    };

    const snapBack = () => {
      writeSwipeVars(el, 0, false);
    };

    const commit = (next: T, destDx: number) => {
      finishing = true;
      writeSwipeVars(el, destDx, false);
      const finish = () => {
        window.clearTimeout(finishTimer);
        el.removeEventListener("transitionend", onEndTransition);
        writeSwipeVars(el, 0, true);
        void hapticLight();
        onChange(next);
        requestAnimationFrame(() => {
          writeSwipeVars(el, 0, false);
          finishing = false;
        });
      };
      const onEndTransition = (e: TransitionEvent) => {
        if (e.propertyName && e.propertyName !== "transform") return;
        finish();
      };
      el.addEventListener("transitionend", onEndTransition);
      finishTimer = window.setTimeout(finish, IOS_SWIPE_MS + 40);
    };

    const onStart = (e: TouchEvent) => {
      if (finishing) return;
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
      if (!tracking || finishing || e.touches.length !== 1) return;
      const touch = e.touches[0]!;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (!locked) {
        locked = swipeAxisLock(dx, dy);
        if (!locked) return;
        if (locked === "h") peekToward(dx);
      }
      if (locked === "v") {
        tracking = false;
        snapBack();
        return;
      }
      const idx = order.indexOf(active);
      const followed = swipeFollowDx(dx, idx, order.length, widthOf());
      writeSwipeVars(el, followed, true);
      if (Math.abs(followed) > 16) peekToward(followed);
    };

    const onEnd = (e: TouchEvent) => {
      if (!tracking || finishing) return;
      tracking = false;
      const touch = e.changedTouches[0];
      if (!touch) {
        snapBack();
        return;
      }
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startT;
      const idx = order.indexOf(active);
      const width = widthOf();
      const followed = swipeFollowDx(dx, idx, order.length, width);

      if (
        !shouldCommitSwipe({
          dx: followed,
          dy,
          dt,
          threshold,
          locked,
          width,
        })
      ) {
        snapBack();
        return;
      }

      const step = swipeStep(followed, idx, order.length);
      if (step === 0) {
        snapBack();
        return;
      }
      const next = order[idx + step];
      if (!next) {
        snapBack();
        return;
      }
      commit(next, step > 0 ? -width : width);
    };

    const onCancel = () => {
      if (finishing) return;
      tracking = false;
      snapBack();
    };

    el.addEventListener("touchstart", onStart, { passive: true, capture: true });
    el.addEventListener("touchmove", onMove, { passive: true, capture: true });
    el.addEventListener("touchend", onEnd, { passive: true, capture: true });
    el.addEventListener("touchcancel", onCancel, { capture: true });

    return () => {
      window.clearTimeout(finishTimer);
      el.removeEventListener("touchstart", onStart, true);
      el.removeEventListener("touchmove", onMove, true);
      el.removeEventListener("touchend", onEnd, true);
      el.removeEventListener("touchcancel", onCancel, true);
      writeSwipeVars(el, 0, false);
    };
  }, [active, edgeOnly, enabled, onChange, onPeek, order, targetRef, threshold]);
}
