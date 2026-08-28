import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  hapticSnap,
  hapticSnapEnd,
  hapticSnapStart,
  preloadHaptics,
} from "@/lib/haptics";

export type RollOption<T extends string | number = string | number> = {
  value: T;
  label: string;
  sublabel?: string;
};

type Props<T extends string | number> = {
  options: RollOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible name */
  "aria-label": string;
  className?: string;
  /** Item height in px — each stop is exactly this tall */
  itemHeight?: number;
  /** Visible rows (odd looks best) */
  visible?: number;
};

/**
 * Physical dial / drum picker — swipe vertically, snaps hard to each defined value.
 * Haptic tick on every stop (Capacitor selection/impact, or vibrate fallback).
 */
export function RollPicker<T extends string | number>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  className,
  itemHeight = 36,
  visible = 3,
}: Props<T>) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const settleTimer = useRef<number | null>(null);
  const lastIdxRef = useRef(-1);
  const lastHapticAt = useRef(0);
  const height = itemHeight * visible;
  const pad = itemHeight * Math.floor(visible / 2);

  useEffect(() => {
    preloadHaptics();
  }, []);

  const tickHaptic = useCallback(() => {
    // Throttle so a wild fling doesn’t stack 20 buzzes
    const now = Date.now();
    if (now - lastHapticAt.current < 28) return;
    lastHapticAt.current = now;
    void hapticSnap();
  }, []);

  const indexOfValue = useCallback(
    (v: T) => {
      const i = options.findIndex((o) => o.value === v);
      return i >= 0 ? i : 0;
    },
    [options],
  );

  const snapToIndex = useCallback(
    (idx: number, behavior: ScrollBehavior = "smooth", withHaptic = true) => {
      const el = scrollerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(options.length - 1, idx));
      const top = clamped * itemHeight;
      el.scrollTo({ top, behavior });
      const next = options[clamped];
      if (!next) return;
      if (lastIdxRef.current !== clamped) {
        lastIdxRef.current = clamped;
        if (withHaptic) tickHaptic();
      } else if (withHaptic) {
        // Even landing on the same stop after a drag should feel like a click
        tickHaptic();
      }
      if (next.value !== value) onChange(next.value);
    },
    [itemHeight, onChange, options, tickHaptic, value],
  );

  const nearestIndex = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 0;
    return Math.max(
      0,
      Math.min(options.length - 1, Math.round(el.scrollTop / itemHeight)),
    );
  }, [itemHeight, options.length]);

  const settle = useCallback(() => {
    if (settleTimer.current != null) {
      window.clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    snapToIndex(nearestIndex(), "smooth", true);
    draggingRef.current = false;
    void hapticSnapEnd();
  }, [nearestIndex, snapToIndex]);

  // External value → hard snap (no haptic — not a user gesture)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || draggingRef.current) return;
    const idx = indexOfValue(value);
    const top = idx * itemHeight;
    if (Math.abs(el.scrollTop - top) > 1) {
      el.scrollTo({ top, behavior: "auto" });
    }
    lastIdxRef.current = idx;
  }, [value, options, itemHeight, indexOfValue]);

  // Mid-scroll: tick when crossing a stop
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      if (!draggingRef.current) {
        draggingRef.current = true;
        void hapticSnapStart();
      }
      if (settleTimer.current != null) {
        window.clearTimeout(settleTimer.current);
      }
      settleTimer.current = window.setTimeout(() => settle(), 90);

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const idx = nearestIndex();
        if (idx !== lastIdxRef.current) {
          lastIdxRef.current = idx;
          tickHaptic();
          const next = options[idx];
          if (next && next.value !== value) onChange(next.value);
        }
      });
    };

    const onScrollEnd = () => settle();

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("scrollend", onScrollEnd as EventListener);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("scrollend", onScrollEnd as EventListener);
      cancelAnimationFrame(raf);
      if (settleTimer.current != null) window.clearTimeout(settleTimer.current);
    };
  }, [nearestIndex, onChange, options, settle, tickHaptic, value]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-md)] border border-white/20 bg-black/40 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
        className,
      )}
      style={{ height }}
      data-no-swipe
      data-no-swipe-scroll
      data-picker
    >
      <div
        className="pointer-events-none absolute inset-x-1 z-10 rounded-lg border border-gold/45 bg-gold/12 shadow-[0_0_12px_rgba(201,162,39,0.15)]"
        style={{ top: pad, height: itemHeight }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-7 bg-gradient-to-b from-black/80 via-black/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-7 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
        aria-hidden
      />

      <div
        ref={scrollerRef}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={`roll-${String(value)}`}
        tabIndex={0}
        className={cn(
          "h-full overflow-y-auto overscroll-contain",
          "snap-y snap-mandatory",
          "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
        style={{
          paddingTop: pad,
          paddingBottom: pad,
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "y mandatory",
        }}
        onTouchStart={() => {
          void hapticSnapStart();
          void preloadHaptics();
        }}
        onTouchEnd={() => {
          window.setTimeout(() => settle(), 40);
        }}
        onMouseUp={() => {
          window.setTimeout(() => settle(), 20);
        }}
        onKeyDown={(e) => {
          const idx = indexOfValue(value);
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            snapToIndex(idx + 1);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            snapToIndex(idx - 1);
          } else if (e.key === "Home") {
            e.preventDefault();
            snapToIndex(0);
          } else if (e.key === "End") {
            e.preventDefault();
            snapToIndex(options.length - 1);
          }
        }}
      >
        {options.map((o, i) => {
          const selected = o.value === value;
          return (
            <button
              key={`${String(o.value)}-${i}`}
              id={`roll-${String(o.value)}`}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => snapToIndex(i, "smooth", true)}
              className={cn(
                "flex w-full snap-center snap-always flex-col items-center justify-center px-1.5 text-center transition-colors duration-150",
                selected ? "text-white" : "text-white/40",
              )}
              style={{
                height: itemHeight,
                minHeight: itemHeight,
                scrollSnapAlign: "center",
                scrollSnapStop: "always",
              }}
            >
              <span
                className={cn(
                  "max-w-full truncate px-0.5 text-[11px] font-bold leading-tight tabular-nums sm:text-[13px]",
                  selected &&
                    "text-gold-bright drop-shadow-[0_0_6px_rgba(201,162,39,0.35)]",
                )}
              >
                {o.label}
              </span>
              {o.sublabel ? (
                <span className="max-w-full truncate text-[8px] font-semibold tabular-nums text-white/65 sm:text-[9px]">
                  {o.sublabel}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
