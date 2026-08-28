import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Pull down at scrollTop≈0 → call onReset (iOS-style refresh).
 * Returns pullHint for sticky banner — pair with `@/components/shell/PullResetHint`.
 *
 * Touches that start inside `[data-no-pull-reset]` (e.g. wizard wheels) are ignored
 * so nested scrollers don't wipe the page.
 */
export function usePullToReset(
  scrollRef: RefObject<HTMLElement | null>,
  onReset: () => void,
  opts?: { threshold?: number; hintAt?: number; enabled?: boolean },
) {
  const threshold = opts?.threshold ?? 72;
  const hintAt = opts?.hintAt ?? 54;
  const enabled = opts?.enabled ?? true;
  const [pullHint, setPullHint] = useState(false);
  const pullStartY = useRef(0);
  const pulling = useRef(false);
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !enabled) return;

    const isBlockedTarget = (t: EventTarget | null) => {
      if (!(t instanceof Element)) return false;
      return Boolean(
        t.closest(
          "[data-no-pull-reset], [data-wizard-wheel], .select-sheet-root, input, textarea",
        ),
      );
    };

    const onStart = (e: TouchEvent) => {
      if (el.scrollTop > 2) return;
      if (e.touches.length !== 1) return;
      if (isBlockedTarget(e.target)) {
        pulling.current = false;
        return;
      }
      pullStartY.current = e.touches[0]!.clientY;
      pulling.current = true;
    };
    const onMove = (e: TouchEvent) => {
      if (!pulling.current) return;
      const dy = e.touches[0]!.clientY - pullStartY.current;
      if (el.scrollTop <= 0 && dy > hintAt) setPullHint(true);
      else setPullHint(false);
    };
    const onEnd = (e: TouchEvent) => {
      if (!pulling.current) return;
      pulling.current = false;
      const dy = (e.changedTouches[0]?.clientY ?? 0) - pullStartY.current;
      if (el.scrollTop <= 0 && dy > threshold) {
        onResetRef.current();
      }
      setPullHint(false);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", () => {
      pulling.current = false;
      setPullHint(false);
    });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [scrollRef, enabled, threshold, hintAt]);

  return pullHint;
}
