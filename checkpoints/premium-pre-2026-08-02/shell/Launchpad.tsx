import { useEffect, useState } from "react";
import {
  Calculator,
  FileText,
  MapPin,
  MessageCircle,
  Shield,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppTab } from "./BottomTabs";

const LAUNCH_ITEMS: {
  id: AppTab;
  title: string;
  blurb: string;
  Icon: typeof MessageCircle;
}[] = [
  {
    id: "rvgrok",
    title: "RvGrok",
    blurb: "Ask anything RV-related",
    Icon: MessageCircle,
  },
  {
    id: "rvfax",
    title: "RvFACTS",
    blurb: "Specs, floorplans & used market",
    Icon: FileText,
  },
  {
    id: "rvcal",
    title: "RvCal",
    blurb: "Payments, scenarios & options",
    Icon: Calculator,
  },
  {
    id: "rvtow",
    title: "RvTow",
    blurb: "Match your tow vehicle",
    Icon: Truck,
  },
  {
    id: "rvtrips",
    title: "RvTrips",
    blurb: "Plan RV-ready routes",
    Icon: MapPin,
  },
  {
    id: "more",
    title: "Premium / More",
    blurb: "Suite settings & more",
    Icon: Shield,
  },
];

function FoxMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 88"
      className={className}
      aria-hidden
      fill="none"
    >
      <path
        d="M60 8c-6 10-18 18-30 22 4 14 12 26 30 40 18-14 26-26 30-40C78 26 66 18 60 8Z"
        fill="url(#foxBody)"
      />
      <path
        d="M28 18 12 4c10 2 18 8 22 16M92 18l16-14c-10 2-18 8-22 16"
        stroke="#ff7a2f"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 52c8 10 18 16 38 20 20-4 30-10 38-20"
        stroke="#ff9a4a"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="foxBody" x1="30" y1="10" x2="90" y2="70">
          <stop stopColor="#ff9a3c" />
          <stop offset="0.55" stopColor="#f05a12" />
          <stop offset="1" stopColor="#c43a08" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Brand launchpad — orange front door before sapphire suite tools.
 * Highlight crawls automatically; every row is tappable immediately.
 */
export function Launchpad({
  onSelect,
  onSkip,
  backdropSrc,
}: {
  onSelect: (tab: AppTab) => void;
  onSkip: () => void;
  backdropSrc?: string;
}) {
  const [hi, setHi] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setHi((i) => (i + 1) % LAUNCH_ITEMS.length);
    }, 1100);
    return () => window.clearInterval(t);
  }, [paused]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-[#050814] text-white">
      {/* Scenic brand field */}
      <div className="pointer-events-none absolute inset-0">
        {backdropSrc ? (
          <img
            src={backdropSrc}
            alt=""
            className="absolute inset-0 size-full object-cover object-[center_35%]"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-[#040812]/88 via-[#06101f]/55 to-[#03060f]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(255,120,40,0.14),transparent_55%)]" />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
        {/* Brand lockup */}
        <div className="flex shrink-0 flex-col items-center pt-2 text-center">
          <FoxMark className="mb-2 h-14 w-20 drop-shadow-[0_8px_24px_rgba(255,100,30,0.45)] sm:h-16 sm:w-24" />
          <h1 className="text-[clamp(2.4rem,11vw,3.15rem)] font-bold leading-none tracking-tight">
            <span className="text-white">Rv</span>
            <span className="bg-gradient-to-b from-[#ffb06a] via-[#ff7a2f] to-[#e04a0a] bg-clip-text text-transparent">
              Fox
            </span>
          </h1>
          <p className="mt-1 text-[15px] font-semibold tracking-wide text-white/90">
            App
          </p>
          <p className="mt-3 max-w-[18rem] text-[13.5px] font-medium leading-snug text-white/85 sm:text-[14.5px]">
            RV Intelligence.{" "}
            <span className="font-semibold text-[#ff8a3d]">Real Decisions.</span>
            <br />
            Everywhere.
          </p>
        </div>

        {/* Feature list */}
        <div className="mx-auto mt-5 flex w-full max-w-sm min-h-0 flex-1 flex-col justify-center">
          <div
            className="overflow-hidden rounded-[1.35rem] border border-white/20 bg-black/35 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            onPointerDown={() => setPaused(true)}
          >
            {LAUNCH_ITEMS.map((item, index) => {
              const active = index === hi;
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-[1.05rem] px-3 py-2.5 text-left transition-all duration-300 ease-out touch-manipulation",
                    active
                      ? "bg-gradient-to-r from-[#ff8a2e]/95 via-[#ff6a12]/90 to-[#e85a10]/88 shadow-[0_0_28px_rgba(255,110,30,0.45)] scale-[1.02]"
                      : "bg-transparent hover:bg-white/[0.06]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                      active
                        ? "border-white/30 bg-white/15 text-white"
                        : "border-white/10 bg-white/5 text-[#ff8a3d]",
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[15px] font-bold leading-tight",
                        active ? "text-white" : "text-white/95",
                      )}
                    >
                      {item.title}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[11.5px] leading-snug",
                        active ? "text-white/90" : "text-white/55",
                      )}
                    >
                      {item.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[11px] leading-relaxed text-white/55">
            <span className="text-[#ff8a3d]">✓</span> No account required for
            core tools.
            <br />
            Explore. Compare. Decide with confidence.
          </p>
        </div>

        <div className="mt-3 flex shrink-0 flex-col items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-white backdrop-blur-md active:scale-[0.98]"
          >
            Enter suite
          </button>
          <p className="text-[10px] text-white/40">
            Or tap any tool above — highlight is just a guide
          </p>
        </div>
      </div>
    </div>
  );
}
