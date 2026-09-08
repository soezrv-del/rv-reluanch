import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import { DAVID_BOOK_SPLASH, DAVID_BOOK_SPLASH_POSTER } from "@/assets/launchMedia";
import type { AppTab } from "./BottomTabs";

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
      <span aria-hidden className="metal-hammered-strike">
        {label}
      </span>
      <span className="metal-hammered-face">{label}</span>
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
 * After it ends or skip, the app opens on RvFacts — no chooser in between.
 */
export function Launchpad({
  onSelect,
  onSkip: _onSkip,
  videoSrc,
}: {
  onSelect: (tab: AppTab) => void;
  onSkip: () => void;
  menuImageSrc?: string;
  videoSrc?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const entered = useRef(false);
  const clip = videoSrc || DAVID_BOOK_SPLASH;

  const enterFacts = () => {
    if (entered.current) return;
    entered.current = true;
    const node = videoRef.current;
    if (node) {
      silenceVideo(node);
      node.pause();
    }
    void hapticLight();
    onSelect("rvfax");
  };

  useEffect(() => {
    hideNativeSplash();
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      enterFacts();
      return;
    }
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
    const failSafe = window.setTimeout(enterFacts, 8000);
    return () => {
      node.removeEventListener("volumechange", keepSilent);
      node.removeEventListener("canplay", play);
      window.clearTimeout(failSafe);
    };
    // enterFacts is stable for this overlay lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clip]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enterFacts();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="lp-launch fixed inset-0 z-[100] flex flex-col overflow-hidden text-fg"
      data-no-swipe
      data-splash-phase="video"
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div
        className="lp-video-stage"
        onClick={enterFacts}
        role="presentation"
      >
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
          onEnded={enterFacts}
          onError={enterFacts}
          onVolumeChange={(e) => silenceVideo(e.currentTarget)}
        />
        <button
          type="button"
          data-launch-skip
          className="lp-video-skip"
          onClick={(e) => {
            e.stopPropagation();
            enterFacts();
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
