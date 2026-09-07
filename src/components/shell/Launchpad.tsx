import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  Calculator,
  FileText,
  MapPin,
  MessageCircle,
  Share2,
  Shield,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticLight, hapticMedium } from "@/lib/haptics";
import { DOCK_TAP_SLOP, isStationaryDockTap } from "@/lib/hooks/nativeWebView";
import type { AppTab } from "./BottomTabs";
import { PAGE_COPY } from "./shellConstants";
import sealPoster from "@/assets/splash/rvfox-launch-seal-poster.jpg";

/** Cover open / page-turn budgets — keep both under 500ms. */
export const COVER_FLIP_MS = 380;
export const PAGE_TURN_MS = 320;

const LAUNCH_PAGES: {
  id: AppTab;
  title: string;
  blurb: string;
  Icon: typeof MessageCircle;
}[] = [
  { id: "rvfax", title: "RvFacts", blurb: PAGE_COPY.rvfax.line, Icon: FileText },
  { id: "rvgrok", title: "RvGrok", blurb: PAGE_COPY.rvgrok.line, Icon: MessageCircle },
  { id: "rvcal", title: "RvCal", blurb: PAGE_COPY.rvcal.line, Icon: Calculator },
  { id: "rvtow", title: "RvTow", blurb: PAGE_COPY.rvtow.line, Icon: Truck },
  { id: "rvtrips", title: "RvTrips", blurb: PAGE_COPY.rvtrips.line, Icon: MapPin },
  { id: "rvshare", title: "RvShare", blurb: PAGE_COPY.rvshare.line, Icon: Share2 },
  { id: "more", title: "Premium", blurb: PAGE_COPY.more.line, Icon: Shield },
];

function hideNativeSplash() {
  void (async () => {
    try {
      const mod = await import("@capacitor/splash-screen");
      await mod.SplashScreen.hide({ fadeOutDuration: 200 });
    } catch {
      /* */
    }
  })();
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/**
 * Forged steel wordmark — hammered / embossed into the plate.
 * Dual-layer: deep strike shadow + hard metal face.
 */
export function MetalVerifiedTrue({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeCls =
    size === "lg"
      ? "text-[clamp(1.4rem,5.6vw,1.85rem)] tracking-[0.26em]"
      : size === "sm"
        ? "text-[0.82rem] tracking-[0.2em]"
        : "text-[clamp(1.2rem,4.6vw,1.48rem)] tracking-[0.24em]";

  const label = "Verified and True";

  return (
    <span
      className={cn(
        "metal-hammered relative inline-block select-none text-center font-black uppercase leading-none",
        sizeCls,
        className,
      )}
      aria-label={label}
    >
      <span
        aria-hidden
        className="absolute inset-0 translate-x-[1.5px] translate-y-[2px] blur-[0.4px]"
        style={{
          color: "rgba(4, 6, 10, 0.78)",
          textShadow: "0 2px 6px rgba(0,0,0,0.55), 0 0 14px rgba(0,0,0,0.35)",
        }}
      >
        {label}
      </span>
      <span
        className="relative"
        style={{
          backgroundImage:
            "linear-gradient(162deg," +
            "#f7f9fc 0%," +
            "#b8c0cc 9%," +
            "#6a7384 18%," +
            "#e8edf4 28%," +
            "#4a5260 38%," +
            "#d0d7e2 47%," +
            "#8b94a4 56%," +
            "#f2f5f9 66%," +
            "#5c6574 76%," +
            "#c5cdd8 86%," +
            "#9aa3b2 93%," +
            "#eef2f7 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextStroke: "0.45px rgba(12, 14, 20, 0.4)",
          filter:
            "drop-shadow(0 -0.5px 0 rgba(255,255,255,0.45)) drop-shadow(0 1px 0 rgba(0,0,0,0.5)) drop-shadow(0 3px 8px rgba(0,0,0,0.55))",
        }}
      >
        {label}
      </span>
    </span>
  );
}

/**
 * Field-guide launch — chestnut cover + original suite golds, then a book pager.
 * Cover tap/swipe-left flips to page one (RvFacts). Each leaf opens that tool.
 */
export function Launchpad({
  onSelect,
  onSkip: _onSkip,
  menuImageSrc,
  videoSrc: _videoSrc,
}: {
  onSelect: (tab: AppTab) => void;
  onSkip: () => void;
  menuImageSrc?: string;
  videoSrc?: string;
}) {
  const [opened, setOpened] = useState(false);
  const [flipping, setFlipping] = useState(false);
  const [page, setPage] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const flipTimer = useRef<number>(0);
  const fireLock = useRef(0);
  const swipeConsumed = useRef(false);
  const gesture = useRef<{
    id: number;
    x: number;
    y: number;
    t: number;
    swiping: boolean;
    lastX: number;
    lastT: number;
  } | null>(null);
  const emblem = menuImageSrc ?? sealPoster;

  useEffect(() => {
    hideNativeSplash();
  }, []);

  useEffect(() => {
    return () => {
      if (flipTimer.current) window.clearTimeout(flipTimer.current);
    };
  }, []);

  const once = (fn: () => void) => {
    const now = performance.now();
    if (now - fireLock.current < 400) return;
    fireLock.current = now;
    fn();
  };

  const openBook = () => {
    if (opened || flipping) return;
    void hapticMedium();
    if (prefersReducedMotion()) {
      setOpened(true);
      setPage(0);
      return;
    }
    setFlipping(true);
    flipTimer.current = window.setTimeout(() => {
      setOpened(true);
      setFlipping(false);
      setPage(0);
    }, COVER_FLIP_MS);
  };

  const closeBook = () => {
    if (!opened || flipping) return;
    void hapticLight();
    setPage(0);
    setDragX(0);
    setOpened(false);
    setFlipping(false);
  };

  const pickTool = (id: AppTab) => {
    if (swipeConsumed.current) return;
    once(() => {
      void hapticMedium();
      onSelect(id);
    });
  };

  const markSwipe = () => {
    swipeConsumed.current = true;
    window.setTimeout(() => {
      swipeConsumed.current = false;
    }, 420);
  };

  const goPage = (next: number) => {
    const clamped = Math.max(0, Math.min(LAUNCH_PAGES.length - 1, next));
    if (clamped === page) {
      setDragX(0);
      return;
    }
    void hapticLight();
    setPage(clamped);
    setDragX(0);
  };

  const onCoverPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    gesture.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      swiping: false,
      lastX: e.clientX,
      lastT: performance.now(),
    };
  };

  const onCoverPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (isStationaryDockTap(dx, dy) || dx < -40) openBook();
  };

  const onPagerPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      swiping: false,
      lastX: e.clientX,
      lastT: performance.now(),
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* */
    }
  };

  const onPagerPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.swiping) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dx) <= Math.abs(dy) * 0.85) return;
      g.swiping = true;
      setDragging(true);
    }
    g.lastX = e.clientX;
    g.lastT = performance.now();
    const width = viewportRef.current?.clientWidth ?? window.innerWidth;
    const atStart = page <= 0 && dx > 0;
    const atEnd = page >= LAUNCH_PAGES.length - 1 && dx < 0;
    const rubber = atStart || atEnd ? 0.35 : 1;
    setDragX(dx * rubber);
    if (Math.abs(dx) > width) {
      setDragX(Math.sign(dx) * width);
    }
  };

  const finishPagerGesture = (e: ReactPointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    setDragging(false);
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const dt = Math.max(1, performance.now() - g.t);
    const vx = dx / dt;

    if (g.swiping) {
      markSwipe();
      const width = viewportRef.current?.clientWidth ?? window.innerWidth;
      const needed = Math.abs(vx) > 0.35 ? 18 : width * 0.18;
      if (dx < -needed) goPage(page + 1);
      else if (dx > needed) {
        if (page <= 0) closeBook();
        else goPage(page - 1);
      } else setDragX(0);
      return;
    }

    if (!isStationaryDockTap(dx, dy, DOCK_TAP_SLOP)) {
      setDragX(0);
      return;
    }
    const dest = LAUNCH_PAGES[page];
    if (dest) pickTool(dest.id);
  };

  const onPagerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging || swipeConsumed.current || gesture.current?.swiping) {
      e.preventDefault();
      return;
    }
    const dest = LAUNCH_PAGES[page];
    if (dest) pickTool(dest.id);
  };

  useEffect(() => {
    if (!opened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (page <= 0) closeBook();
        else goPage(page - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goPage(page + 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const dest = LAUNCH_PAGES[page];
        if (dest) pickTool(dest.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeBook();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // page is enough — goPage/closeBook/pickTool are stable enough for this overlay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, page]);

  const stripX = `calc(${-page * 100}% + ${dragX}px)`;

  return (
    <div
      className="leather-launch fixed inset-0 z-[100] flex flex-col overflow-hidden bg-bg text-fg"
      data-no-swipe
      data-magazine-open={opened ? "true" : "false"}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="leather-stage flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.65rem,env(safe-area-inset-top))] sm:px-5">
        <div
          className="leather-book relative mx-auto flex h-full w-full max-w-md"
          onPointerUp={(e) => {
            if (opened || flipping) return;
            const dx = gesture.current ? e.clientX - gesture.current.x : 0;
            const dy = gesture.current ? e.clientY - gesture.current.y : 0;
            if (!gesture.current || isStationaryDockTap(dx, dy) || dx < -40) {
              openBook();
            }
          }}
        >
          <div className="leather-spine" data-book-spine aria-hidden>
            <span className="leather-spine-fillet" />
            <span className="leather-spine-band leather-spine-band-a" />
            <span className="leather-spine-band leather-spine-band-b" />
          </div>
          <div
            ref={viewportRef}
            className="leather-viewport relative flex min-h-0 min-w-0 flex-1 overflow-hidden"
          >
            <div
              className={cn(
                "leather-strip flex h-full",
                dragging ? "leather-strip-dragging" : "leather-strip-snap",
              )}
              style={{ transform: `translate3d(${stripX}, 0, 0)` }}
              onPointerDown={opened ? onPagerPointerDown : undefined}
              onPointerMove={opened ? onPagerPointerMove : undefined}
              onPointerUp={opened ? finishPagerGesture : undefined}
              onPointerCancel={opened ? finishPagerGesture : undefined}
              onClick={opened ? onPagerClick : undefined}
              role={opened ? "group" : undefined}
              aria-label={opened ? "RvFOX book pages" : undefined}
            >
              {LAUNCH_PAGES.map((item, index) => {
                const Icon = item.Icon;
                return (
                  <section
                    key={item.id}
                    className="leather-page"
                    data-magazine-page={item.id}
                    data-launch-tool={item.id}
                    aria-hidden={!opened || index !== page}
                  >
                    <p className="leather-folio">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(LAUNCH_PAGES.length).padStart(2, "0")}
                    </p>
                    <div className="leather-page-icon" aria-hidden>
                      <Icon className="size-7" strokeWidth={1.75} />
                    </div>
                    <h2 className="leather-page-title">{item.title}</h2>
                    <p className="leather-page-blurb">{item.blurb}</p>
                    <p className="leather-page-cue">Tap to open</p>
                  </section>
                );
              })}
            </div>

            <button
              type="button"
              data-magazine-cover
              data-book-cover
              aria-label="Open RvFOX — Verified and True"
              disabled={opened && !flipping}
              onPointerDown={onCoverPointerDown}
              onPointerUp={onCoverPointerUp}
              onPointerCancel={() => {
                gesture.current = null;
              }}
              onClick={() => {
                if (!opened && !flipping) openBook();
              }}
              className={cn(
                "leather-cover",
                flipping && "is-flipping",
                opened && !flipping && "is-gone",
              )}
            >
              <span aria-hidden className="leather-cover-plate" />
              <span aria-hidden className="leather-cover-grain" />
              <span aria-hidden className="leather-cover-frame" />
              <span aria-hidden className="leather-cover-crease" />

              <span className="leather-emblem-well">
                <span className="leather-emblem-die">
                  <img
                    src={emblem}
                    alt=""
                    className="leather-emblem-stamp"
                    draggable={false}
                    decoding="async"
                    fetchPriority="high"
                  />
                </span>
              </span>

              <span className="leather-cover-copy">
                <span className="leather-title">RvFOX — Verified and True</span>
                <span className="leather-tagline">Know before you buy.</span>
                <span className="leather-cover-cue">Tap anywhere to open</span>
              </span>
            </button>
          </div>
          <div className="leather-page-edge" data-book-page-edge aria-hidden>
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
