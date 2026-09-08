import { useEffect, useRef, useState, type RefObject } from "react";
import { hapticLight } from "@/lib/haptics";
import {
  IOS_PULL_HOLD_MS,
  pullProgress,
  rubberband,
  shouldArmPull,
  shouldFirePull,
} from "./iosGestures";

export type PullToResetState = {
  /** Past the hint threshold (release will fire). */
  show: boolean;
  armed: boolean;
  dragging: boolean;
  refreshing: boolean;
  /** 0–1 toward the fire threshold. */
  progress: number;
  /** Rubber-band px to shift content down. */
  offset: number;
};

const IDLE: PullToResetState = {
  show: false,
  armed: false,
  dragging: false,
  refreshing: false,
  progress: 0,
  offset: 0,
};

/**
 * Pull down at scrollTop≈0 → call onReset (iOS-style refresh).
 * Pair with `@/components/shell/PullResetHint` / `PullRefreshLayer`.
 *
 * Touches that start inside `[data-no-pull-reset]` (e.g. picker sheets)
 * are ignored so nested scrollers don't wipe the page.
 */
export function usePullToReset(
  scrollRef: RefObject<HTMLElement | null>,
  onReset: () => void,
  opts?: { threshold?: number; hintAt?: number; enabled?: boolean },
): PullToResetState {
  const threshold = opts?.threshold ?? 72;
  const hintAt = opts?.hintAt ?? 54;
  const enabled = opts?.enabled ?? true;
  const [state, setState] = useState<PullToResetState>(IDLE);
  const pullStartY = useRef(0);
  const pullStartX = useRef(0);
  const pulling = useRef(false);
  const armedHaptic = useRef(false);
  const holdTimer = useRef<number>(0);
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;

    const isBlockedTarget = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return false;
      return Boolean(
        t.closest(
          "[data-no-pull-reset], .select-sheet-root, input, textarea, [role='dialog']",
        ),
      );
    };

    const paint = (dy: number, dragging: boolean) => {
      const offset = rubberband(Math.max(0, dy), 108);
      const progress = pullProgress(dy, threshold);
      const armed = shouldArmPull(dy, hintAt);
      if (armed && !armedHaptic.current) {
        armedHaptic.current = true;
        void hapticLight();
      }
      if (!armed) armedHaptic.current = false;
      setState({
        show: armed,
        armed,
        dragging,
        refreshing: false,
        progress,
        offset,
      });
    };

    const finishRefresh = () => {
      window.clearTimeout(holdTimer.current);
      holdTimer.current = window.setTimeout(() => {
        setState(IDLE);
      }, IOS_PULL_HOLD_MS);
    };

    const onStart = (e: TouchEvent) => {
      if (el.scrollTop > 2) return;
      if (e.touches.length !== 1) return;
      if (isBlockedTarget(e.target)) {
        pulling.current = false;
        return;
      }
      pullStartY.current = e.touches[0]!.clientY;
      pullStartX.current = e.touches[0]!.clientX;
      pulling.current = true;
      armedHaptic.current = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const touch = e.touches[0]!;
      const dy = touch.clientY - pullStartY.current;
      const dx = touch.clientX - pullStartX.current;
      if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        pulling.current = false;
        setState(IDLE);
        return;
      }
      if (el.scrollTop <= 0 && dy > 0) {
        if (e.cancelable) e.preventDefault();
        paint(dy, true);
      } else {
        setState(IDLE);
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!pulling.current) return;
      pulling.current = false;
      const dy = (e.changedTouches[0]?.clientY ?? 0) - pullStartY.current;
      if (shouldFirePull(dy, threshold, el.scrollTop)) {
        setState({
          show: true,
          armed: true,
          dragging: false,
          refreshing: true,
          progress: 1,
          offset: 56,
        });
        onResetRef.current();
        finishRefresh();
        return;
      }
      setState(IDLE);
    };

    const onCancel = () => {
      pulling.current = false;
      setState(IDLE);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onCancel);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
      window.clearTimeout(holdTimer.current);
    };
  }, [scrollRef, enabled, threshold, hintAt]);

  return enabled ? state : IDLE;
}
