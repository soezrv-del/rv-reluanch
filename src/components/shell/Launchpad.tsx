import { useEffect, useRef, useState } from "react";
import {
  Calculator,
  ChevronDown,
  FileText,
  MapPin,
  MessageCircle,
  Shield,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticMedium } from "@/lib/haptics";
import type { AppTab } from "./BottomTabs";
import sealPoster from "@/assets/splash/rvfox-launch-seal-poster.jpg";
import {
  RVFOX_LAUNCH_SEAL,
  RVFOX_LAUNCH_SEAL_LITE,
  RVFOX_LAUNCH_SEAL_ULTRA,
} from "@/assets/launchMedia";

const TOOLS: {
  id: AppTab;
  title: string;
  blurb: string;
  Icon: typeof MessageCircle;
}[] = [
  { id: "rvfax", title: "RvFACTS", blurb: "Get specs, market value, ratings, NHTSA recalls, and more", Icon: FileText },
  { id: "rvcal", title: "RvCal", blurb: "ZIP-based calculator with lender comparisons", Icon: Calculator },
  { id: "rvtow", title: "RvTow", blurb: "Tow match", Icon: Truck },
  { id: "rvtrips", title: "RvTrips", blurb: "RV GPS with campgrounds, dump stations, and more", Icon: MapPin },
  { id: "rvgrok", title: "RvGrok", blurb: "Your RV expert — from the best fishing spots to troubleshooting your RV", Icon: MessageCircle },
  { id: "more", title: "Premium", blurb: "Settings", Icon: Shield },
];

const LAUNCH_SEAL = RVFOX_LAUNCH_SEAL;
const LAUNCH_SEAL_LITE = RVFOX_LAUNCH_SEAL_LITE;
const LAUNCH_SEAL_ULTRA = RVFOX_LAUNCH_SEAL_ULTRA;

function isNativeOrIOS(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const cap = (
      window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }
    ).Capacitor;
    if (cap?.isNativePlatform?.()) return true;
  } catch {
    /* */
  }
  return /iPhone|iPad|iPod|Capacitor/i.test(navigator.userAgent || "");
}

function pickLaunchVideo(): string {
  if (isNativeOrIOS()) return LAUNCH_SEAL_ULTRA;
  try {
    const conn = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    if (conn?.saveData) return LAUNCH_SEAL_ULTRA;
    const t = conn?.effectiveType;
    if (t === "slow-2g" || t === "2g") return LAUNCH_SEAL_ULTRA;
    if (t === "3g") return LAUNCH_SEAL_LITE;
  } catch {
    /* */
  }
  return LAUNCH_SEAL;
}

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
 * Splash launch — full-bleed seal ray film + transparent tool menu.
 * Any tool button or Enter suite stops the video immediately.
 */
export function Launchpad({
  onSelect,
  onSkip,
  menuImageSrc,
  videoSrc,
}: {
  onSelect: (tab: AppTab) => void;
  onSkip: () => void;
  menuImageSrc?: string;
  videoSrc?: string;
}) {
  const [hi, setHi] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [resolvedSrc, setResolvedSrc] = useState<string | undefined>(
    () => videoSrc,
  );
  const poster = menuImageSrc ?? sealPoster;

  useEffect(() => {
    hideNativeSplash();
  }, []);

  useEffect(() => {
    setResolvedSrc(videoSrc ?? pickLaunchVideo());
  }, [videoSrc]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setHi((i) => (i + 1) % TOOLS.length);
    }, 2400);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !resolvedSrc) return;
    let cancelled = false;
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.loop = true;
    v.setAttribute("playsinline", "true");
    v.setAttribute("webkit-playsinline", "true");

    const onPlaying = () => {
      if (!cancelled) setVideoPlaying(true);
    };
    const onError = () => {
      if (!cancelled) setVideoPlaying(false);
    };
    v.addEventListener("playing", onPlaying);
    v.addEventListener("error", onError);

    void v.play().catch(() => {
      if (!cancelled) setVideoPlaying(false);
    });

    return () => {
      cancelled = true;
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("error", onError);
      try {
        v.pause();
      } catch {
        /* */
      }
    };
  }, [resolvedSrc]);

  /** Stop seal film immediately — call from every exit control. */
  const stopVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.pause();
      v.currentTime = 0;
      v.loop = false;
      // Drop the media source so decode can't continue during fade-out
      v.removeAttribute("src");
      v.load();
    } catch {
      /* */
    }
    setVideoPlaying(false);
  };

  const pickTool = (id: AppTab) => {
    stopVideo();
    void hapticMedium();
    onSelect(id);
  };

  const enterSuite = () => {
    stopVideo();
    void hapticMedium();
    onSkip();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#050508] text-white"
      data-no-swipe
      onTouchMove={(e) => e.stopPropagation()}
    >
      <div className="pointer-events-none absolute inset-0">
        <img
          src={poster}
          alt=""
          className={cn(
            "absolute inset-0 size-full object-cover object-center transition-opacity duration-500",
            videoPlaying ? "opacity-0" : "opacity-100",
          )}
          draggable={false}
          decoding="async"
          fetchPriority="high"
        />
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 size-full object-cover object-center transition-opacity duration-500",
            videoPlaying ? "opacity-100" : "opacity-0",
          )}
          src={resolvedSrc}
          poster={typeof poster === "string" ? poster : undefined}
          muted
          playsInline
          loop
          preload="metadata"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(0.85rem,env(safe-area-inset-top))]">
        <div className="flex shrink-0 flex-col items-center pt-2 text-center">
          <p className="text-[10px] font-extrabold tracking-[0.28em] text-sky-100/90 drop-shadow-[0_1px_8px_rgba(0,0,0,0.65)]">
            RVFOX PRO
          </p>
          <h1 className="mt-1 text-[clamp(2.35rem,11vw,3.1rem)] font-black leading-none tracking-tight drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)]">
            <span className="text-white">Rv</span>
            <span className="bg-gradient-to-b from-sky-100 via-sky-300 to-blue-400 bg-clip-text text-transparent">
              FOX
            </span>
          </h1>
          <div className="mt-3">
            <MetalVerifiedTrue size="lg" />
          </div>
          <p className="mt-2 text-[13px] font-medium text-white/80 drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]">
            Know before you buy.
          </p>
        </div>

        <div className="mx-auto mt-3 flex w-full max-w-sm min-h-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-col items-center gap-0.5 py-1.5">
            <p className="text-[10px] font-bold tracking-[0.28em] text-white/45">
              FEATURES
            </p>
            <ChevronDown className="size-3.5 text-white/35" strokeWidth={2} />
          </div>

          <div className="flex min-h-0 flex-1 flex-col justify-center">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/22 bg-white/[0.03] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-[1.5px]">
              {TOOLS.map((item, index) => {
                const active = index === hi;
                const Icon = item.Icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pickTool(item.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[1.15rem] px-3 py-2.5 text-left transition-all duration-300 ease-out touch-manipulation",
                      active
                        ? "scale-[1.01] bg-gradient-to-r from-sky-500/90 via-blue-500/85 to-blue-600/90 shadow-[0_0_28px_rgba(56,140,255,0.45)]"
                        : "bg-transparent hover:bg-white/[0.07]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border",
                        active
                          ? "border-white/25 bg-white/15 text-white"
                          : "border-white/18 bg-white/[0.06] text-sky-300",
                      )}
                    >
                      <Icon className="size-4" strokeWidth={2.1} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-bold leading-tight text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.7)]">
                        {item.title}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 block text-[11.5px] leading-snug drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]",
                          active ? "text-white/90" : "text-white/72",
                        )}
                      >
                        {item.blurb}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative mt-auto flex shrink-0 flex-col items-center gap-2 pb-1 pt-6">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[-30%] -bottom-4 top-0 -z-0"
            style={{
              background:
                "radial-gradient(ellipse 75% 90% at 50% 75%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.22) 32%, rgba(255,255,255,0.06) 55%, transparent 75%)",
            }}
          />
          <button
            type="button"
            onClick={enterSuite}
            className="relative z-10 w-full max-w-sm rounded-full border border-white/60 bg-white/18 py-3.5 text-[14px] font-semibold tracking-wide text-white shadow-[0_0_28px_rgba(255,255,255,0.55),0_0_56px_rgba(255,255,255,0.28),0_0_90px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-md active:scale-[0.99]"
          >
            Enter suite
          </button>
          <p className="relative z-10 text-[10px] text-white/60">
            Or tap any tool above
          </p>
        </div>
      </div>
    </div>
  );
}
