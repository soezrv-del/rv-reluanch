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
import { DAVID_BOOK_SPLASH, DAVID_BOOK_SPLASH_POSTER } from "@/assets/launchMedia";
import type { AppTab } from "./BottomTabs";
import { PAGE_COPY } from "./shellConstants";

/** Feature-page swipe budget — keep under 500ms. */
export const PAGE_TURN_MS = 320;

const LAUNCH_PAGES: {
  id: AppTab;
  title: string;
  blurb: string;
  Icon: typeof MessageCircle;
}[] = [
  { id: "rvfax", title: "RvFACTS", blurb: PAGE_COPY.rvfax.line, Icon: FileText },
  { id: "rvcal", title: "RvCal", blurb: PAGE_COPY.rvcal.line, Icon: Calculator },
  { id: "rvtow", title: "RvTow", blurb: "Tow match", Icon: Truck },
  { id: "rvtrips", title: "RvTrips", blurb: PAGE_COPY.rvtrips.line, Icon: MapPin },
  { id: "rvshare", title: "RvShare", blurb: PAGE_COPY.rvshare.line, Icon: Share2 },
  { id: "rvgrok", title: "RvGrok", blurb: PAGE_COPY.rvgrok.line, Icon: MessageCircle },
  { id: "more", title: "Premium", blurb: "Settings", Icon: Shield },
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

function silenceVideo(el: HTMLVideoElement) {
  el.defaultMuted = true;
  el.muted = true;
  el.volume = 0;
  el.setAttribute("muted", "");
  el.playsInline = true;
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "true");
}

/**
 * Cold open is David’s whole book video — cover open + page flips.
 * After it ends or skip, the suite picker (Facts → … → Premium) is the app door.
 */
export function Launchpad({
  onSelect,
  onSkip,
  videoSrc,
}: {
  onSelect: (tab: AppTab) => void;
  onSkip: () => void;
  menuImageSrc?: string;
  videoSrc?: string;
}) {
  const [phase, setPhase] = useState<"video" | "pages">(() =>
    prefersReducedMotion() ? "pages" : "video",
  );
  const [page, setPage] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fireLock = useRef(0);
  const entered = useRef(false);
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

  const clip = videoSrc || DAVID_BOOK_SPLASH;

  useEffect(() => {
    hideNativeSplash();
  }, []);

  const enterPages = () => {
    if (entered.current) return;
    entered.current = true;
    const node = videoRef.current;
    if (node) {
      silenceVideo(node);
      node.pause();
    }
    setPhase("pages");
    setPage(0);
    setDragX(0);
  };

  useEffect(() => {
    if (phase !== "video") return;
    const node = videoRef.current;
    if (!node) return;
    silenceVideo(node);
    const keepSilent = () => silenceVideo(node);
    node.addEventListener("volumechange", keepSilent);
    const play = () => {
      silenceVideo(node);
      void node.play().catch(() => {
        /* autoplay can be blocked — tap still skips */
      });
    };
    if (node.readyState >= 2) play();
    else node.addEventListener("canplay", play, { once: true });
    const failSafe = window.setTimeout(enterPages, 8000);
    return () => {
      node.removeEventListener("volumechange", keepSilent);
      node.removeEventListener("canplay", play);
      window.clearTimeout(failSafe);
    };
    // enterPages is stable for this overlay lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, clip]);

  const once = (fn: () => void) => {
    const now = performance.now();
    if (now - fireLock.current < 400) return;
    fireLock.current = now;
    fn();
  };

  const pickTool = (id: AppTab) => {
    if (swipeConsumed.current) return;
    once(() => {
      void hapticMedium();
      onSelect(id);
    });
  };

  const skipSplash = () => {
    void hapticLight();
    enterPages();
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
      else if (dx > needed) goPage(page - 1);
      else setDragX(0);
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
    const onKey = (e: KeyboardEvent) => {
      if (phase === "video") {
        if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          skipSplash();
        }
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPage(page - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goPage(page + 1);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const dest = LAUNCH_PAGES[page];
        if (dest) pickTool(dest.id);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onSkip();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // page/phase is enough for this overlay
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, page]);

  const stripX = `calc(${-page * 100}% + ${dragX}px)`;

  return (
    <div
      className="lp-launch fixed inset-0 z-[100] flex flex-col overflow-hidden text-fg"
      data-no-swipe
      data-magazine-open={phase === "pages" ? "true" : "false"}
      data-splash-phase={phase}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {phase === "video" ? (
        <div className="lp-video-stage" onClick={skipSplash} role="presentation">
          <video
            ref={videoRef}
            data-david-book-splash
            className="lp-video"
            src={clip}
            poster={DAVID_BOOK_SPLASH_POSTER}
            muted
            playsInline
            autoPlay
            preload="auto"
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            aria-label="RvFOX book splash"
            onEnded={enterPages}
            onError={enterPages}
            onVolumeChange={(e) => silenceVideo(e.currentTarget)}
          />
          <button
            type="button"
            data-launch-skip
            className="lp-video-skip"
            onClick={(e) => {
              e.stopPropagation();
              skipSplash();
            }}
          >
            Skip
          </button>
        </div>
      ) : (
        <div
          ref={viewportRef}
          className="lp-deck"
          data-launch-deck
          onPointerDown={onPagerPointerDown}
          onPointerMove={onPagerPointerMove}
          onPointerUp={finishPagerGesture}
          onPointerCancel={finishPagerGesture}
          onClick={onPagerClick}
          role="group"
          aria-label="RvFOX tools"
        >
          <div
            className={cn("lp-strip flex h-full", dragging ? "lp-strip-dragging" : "lp-strip-snap")}
            style={{ transform: `translate3d(${stripX}, 0, 0)` }}
          >
            {LAUNCH_PAGES.map((item, index) => {
              const Icon = item.Icon;
              return (
                <section
                  key={item.id}
                  className="lp-page"
                  data-magazine-page={item.id}
                  data-launch-tool={item.id}
                  aria-hidden={index !== page}
                >
                  <p className="lp-folio">
                    {String(index + 1).padStart(2, "0")} / {String(LAUNCH_PAGES.length).padStart(2, "0")}
                  </p>
                  <div className="lp-page-icon" aria-hidden>
                    <Icon className="size-7" strokeWidth={1.75} />
                  </div>
                  <h2 className="lp-page-title">{item.title}</h2>
                  <p className="lp-page-blurb">{item.blurb}</p>
                  <p className="lp-page-cue">Tap to open</p>
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
