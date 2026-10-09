import { useEffect, useRef, type ReactNode } from "react";
import {
  SECTION_ROW,
  isSectionId,
  nearestSection,
  planSectionAxis,
  planSectionSettle,
  sectionIndex,
  sectionKeyTarget,
  startsAtBackEdge,
  type SectionId,
} from "@/lib/shell/sectionRow";
import { useRoomVoiceOpen } from "./useRoomVoiceOpen";
import "./section-deck.css";

const BLOCK =
  "input, textarea, select, button, a, [data-no-swipe], [data-lot-arrivals], [data-map-engine], [data-mapbox-canvas-host], [role='slider']";

/** True when the touch starts inside an element that scrolls sideways on its own. */
function insideSideScroller(target: EventTarget | null, row: HTMLElement): boolean {
  let el = target instanceof Element ? target : null;
  while (el && el !== row) {
    if (el instanceof HTMLElement && el.scrollWidth > el.clientWidth + 1) {
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") return true;
    }
    el = el.parentElement;
  }
  return false;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The single row Home reveals. Side swipes move one page.
 * A vertical drag is left alone so the page can scroll.
 */
export function SectionDeck({
  hidden,
  tab,
  onArrive,
  onHome,
  children,
}: {
  hidden: boolean;
  tab: string;
  onArrive: (id: SectionId) => void;
  onHome: () => void;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  // The Ask bar (RoomAskBar) sits under the foot on every page but Chat,
  // and on Chat while Live Voice is up. Whichever is lowest pads the
  // bottom safe area, once.
  const live = useRoomVoiceOpen();
  const askBarBelow = tab !== "rvgrok" || live;
  const tabRef = useRef(tab);
  tabRef.current = tab;
  const onArriveRef = useRef(onArrive);
  onArriveRef.current = onArrive;
  /** Page a released drag is gliding to; the tab effect must not jump over it. */
  const settleTarget = useRef<number | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || hidden) return;
    const index = Math.max(0, sectionIndex(tab));
    if (settleTarget.current === index) {
      settleTarget.current = null;
      return;
    }
    settleTarget.current = null;
    const left = index * row.clientWidth;
    if (Math.abs(row.scrollLeft - left) < 2) return;
    row.scrollTo({ left, behavior: "auto" });
  }, [tab, hidden]);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || hidden) return;

    /** Pointer id for mouse / pen, "touch" for a finger, null when idle. */
    let active: number | "touch" | null = null;
    let startX = 0;
    let startY = 0;
    let startLeft = 0;
    let lastDx = 0;
    let axis: "h" | "v" | null = null;
    let swallowClick = false;
    let settleTimer = 0;

    const width = () => row.clientWidth || 1;

    /** Rest on `index` and make it the active section (dots, tab, Ask scope). */
    const settle = (index: number) => {
      const left = index * width();
      const id = SECTION_ROW[index]?.id;
      if (Math.abs(row.scrollLeft - left) >= 2) {
        const behavior = prefersReducedMotion() ? "auto" : "smooth";
        if (id && id !== tabRef.current && behavior === "smooth") settleTarget.current = index;
        row.scrollTo({ left, behavior });
      }
      if (id && id !== tabRef.current) onArriveRef.current(id);
    };

    const release = () => {
      if (typeof active === "number" && row.hasPointerCapture?.(active)) {
        try {
          row.releasePointerCapture(active);
        } catch {
          /* already released */
        }
      }
      active = null;
      delete row.dataset.dragging;
    };

    const finish = (dx: number, cancelled: boolean) => {
      if (active === null) return;
      const wasH = axis === "h";
      release();
      axis = null;
      if (!wasH) return;
      // A drag ended: never leave the row between pages.
      const current = Math.max(0, sectionIndex(tabRef.current));
      const next = cancelled
        ? nearestSection(row.scrollLeft, width(), SECTION_ROW.length)
        : planSectionSettle("h", dx, current, SECTION_ROW.length);
      // The pointerup of a drag is not a tap on whatever sits under it.
      swallowClick = true;
      window.setTimeout(() => {
        swallowClick = false;
      }, 0);
      settle(next);
    };

    const begin = (x: number, y: number, target: EventTarget | null, id: number | "touch") => {
      if (active !== null) return;
      if (target instanceof Element && target.closest(BLOCK)) return;
      // A carousel or chip row inside the page keeps its own sideways scroll.
      if (insideSideScroller(target, row)) return;
      // Leave the left edge to iOS Safari's back swipe.
      if (startsAtBackEdge(x)) return;
      active = id;
      axis = null;
      startX = x;
      startY = y;
      startLeft = row.scrollLeft;
      lastDx = 0;
      swallowClick = false;
    };

    /** Returns true when the row owns this move (the caller cancels the native pan). */
    const move = (x: number, y: number): boolean => {
      const dx = x - startX;
      const dy = y - startY;
      lastDx = dx;
      if (!axis) {
        axis = planSectionAxis(dx, dy);
        if (axis === "h") {
          // Keep up/cancel on the row even if the pointer ends over the
          // foot or the Ask pill. Captured only once the drag is sideways
          // so plain clicks still reach what is under them. (Touch is
          // implicitly bound to the row already.)
          if (typeof active === "number") {
            try {
              row.setPointerCapture(active);
            } catch {
              /* pointer already gone */
            }
          }
          row.dataset.dragging = "";
        }
      }
      if (axis !== "h") {
        // Until the axis is known, hold a mostly-sideways start so the
        // browser does not begin a native pan of an inner scroller.
        return axis === null && Math.abs(dx) > Math.abs(dy);
      }
      row.scrollLeft = startLeft - dx;
      return true;
    };

    // Mouse and pen: pointer events. Touch: touch events, because a page
    // with its own scroller lets the browser take the pan and cancel the
    // pointer; touchmove can still be held. One input, one handler.
    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      begin(event.clientX, event.clientY, event.target, event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (active === null || event.pointerId !== active) return;
      if (move(event.clientX, event.clientY)) event.preventDefault();
    };
    const onUp = (event: PointerEvent) => {
      if (active === null || event.pointerId !== active) return;
      finish(event.clientX - startX, false);
    };
    const onCancel = (event: PointerEvent) => {
      if (active === null || event.pointerId !== active) return;
      finish(lastDx, true);
    };
    const onLostCapture = (event: PointerEvent) => {
      if (active === null || event.pointerId !== active) return;
      // pointerup also releases capture; finish() already ran in that case.
      finish(lastDx, true);
    };

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (event.touches.length !== 1 || !touch) {
        // A second finger (pinch) is not a page swipe.
        if (active === "touch") finish(lastDx, true);
        return;
      }
      begin(touch.clientX, touch.clientY, event.target, "touch");
    };
    const onTouchMove = (event: TouchEvent) => {
      if (active !== "touch") return;
      const touch = event.touches[0];
      if (!touch) return;
      if (move(touch.clientX, touch.clientY) && event.cancelable) event.preventDefault();
    };
    const onTouchEnd = (event: TouchEvent) => {
      if (active !== "touch") return;
      const touch = event.changedTouches[0];
      finish(touch ? touch.clientX - startX : lastDx, false);
    };
    const onTouchCancel = () => {
      if (active !== "touch") return;
      finish(lastDx, true);
    };

    const onClick = (event: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    /** Trackpad / keyboard scrolls the row natively; sync the section when it rests. */
    const onScroll = () => {
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (active !== null || settleTarget.current !== null) return;
        const index = nearestSection(row.scrollLeft, width(), SECTION_ROW.length);
        if (Math.abs(row.scrollLeft - index * width()) >= 2) return;
        const id = SECTION_ROW[index]?.id;
        if (id && id !== tabRef.current) onArriveRef.current(id);
      }, 140);
    };

    row.addEventListener("pointerdown", onDown);
    row.addEventListener("pointermove", onMove, { passive: false });
    row.addEventListener("lostpointercapture", onLostCapture);
    row.addEventListener("touchstart", onTouchStart, { passive: true });
    row.addEventListener("touchmove", onTouchMove, { passive: false });
    row.addEventListener("touchend", onTouchEnd);
    row.addEventListener("touchcancel", onTouchCancel);
    row.addEventListener("click", onClick, true);
    row.addEventListener("scroll", onScroll, { passive: true });
    // Up / cancel on window too: an uncaptured (vertical) drag can end
    // outside the row and must still stop tracking.
    window.addEventListener("pointerup", onUp, true);
    window.addEventListener("pointercancel", onCancel, true);
    return () => {
      release();
      window.clearTimeout(settleTimer);
      row.removeEventListener("pointerdown", onDown);
      row.removeEventListener("pointermove", onMove);
      row.removeEventListener("lostpointercapture", onLostCapture);
      row.removeEventListener("touchstart", onTouchStart);
      row.removeEventListener("touchmove", onTouchMove);
      row.removeEventListener("touchend", onTouchEnd);
      row.removeEventListener("touchcancel", onTouchCancel);
      row.removeEventListener("click", onClick, true);
      row.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointerup", onUp, true);
      window.removeEventListener("pointercancel", onCancel, true);
    };
  }, [hidden]);

  const current = isSectionId(tab) ? SECTION_ROW[sectionIndex(tab)] : SECTION_ROW[0];
  const dotsRef = useRef<HTMLDivElement>(null);

  /** Dot tap or arrow key: glide to the page and make it active. */
  const goTo = (id: SectionId) => {
    const row = rowRef.current;
    const index = sectionIndex(id);
    if (row && index >= 0) {
      const behavior = prefersReducedMotion() ? "auto" : "smooth";
      if (behavior === "smooth" && id !== tab) settleTarget.current = index;
      row.scrollTo({ left: index * (row.clientWidth || 1), behavior });
    }
    if (id !== tab) onArrive(id);
  };

  return (
    <>
      <div
        ref={rowRef}
        className="section-row"
        data-section-row=""
        hidden={hidden}
        aria-hidden={hidden}
      >
        {children}
      </div>
      {hidden ? null : (
        <div
          className="section-foot"
          data-section-foot
          data-safe-bottom={askBarBelow ? undefined : ""}
        >
          <button type="button" className="section-home" data-section-home onClick={onHome}>
            Home
          </button>
          <p className="section-foot-label">{current?.label}</p>
          <div
            ref={dotsRef}
            className="section-dots"
            role="tablist"
            aria-label="Sections"
            onKeyDown={(event) => {
              const from = Math.max(0, sectionIndex(tab));
              const to = sectionKeyTarget(event.key, from, SECTION_ROW.length);
              if (to === null) return;
              event.preventDefault();
              const page = SECTION_ROW[to];
              if (!page) return;
              goTo(page.id);
              dotsRef.current
                ?.querySelector<HTMLButtonElement>(`[data-section-dot="${page.id}"]`)
                ?.focus();
            }}
          >
            {SECTION_ROW.map((page) => (
              <button
                key={page.id}
                type="button"
                className="section-dot"
                data-section-dot={page.id}
                role="tab"
                aria-label={page.label}
                aria-selected={page.id === tab}
                aria-current={page.id === tab ? "page" : undefined}
                tabIndex={page.id === current?.id ? 0 : -1}
                onClick={() => goTo(page.id)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
