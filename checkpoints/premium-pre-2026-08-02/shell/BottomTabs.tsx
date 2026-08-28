import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type AppTab =
  | "rvgrok"
  | "rvfax"
  | "rvcal"
  | "rvtow"
  | "rvtrips"
  | "more";

/** Dock tabs only — Premium lives in the top-right ⋯ menu */
const TABS: {
  id: Exclude<AppTab, "more">;
  label: string;
  iconSrc: string;
}[] = [
  {
    id: "rvfax",
    label: "RvFACTS",
    iconSrc: "/assets/brand/icon-rvfax.png",
  },
  {
    id: "rvcal",
    label: "RvCAL",
    iconSrc: "/assets/brand/icon-rvcal.png",
  },
  {
    id: "rvtow",
    label: "RvTOW",
    iconSrc: "/assets/brand/icon-rvtow.png",
  },
  {
    id: "rvtrips",
    label: "RvTRIPS",
    iconSrc: "/assets/brand/icon-rvtrips.png",
  },
  {
    id: "rvgrok",
    label: "RvGROK",
    iconSrc: "/assets/brand/icon-rvgrok.png",
  },
];

const ALL_BRAND: Record<AppTab, string> = {
  rvfax: "/assets/brand/icon-rvfax.png",
  rvcal: "/assets/brand/icon-rvcal.png",
  rvtow: "/assets/brand/icon-rvtow.png",
  rvtrips: "/assets/brand/icon-rvtrips.png",
  rvgrok: "/assets/brand/icon-rvgrok.png",
  more: "/assets/brand/icon-premium.png",
};

/** Floating frosted-glass text dock — five main tools (Premium = top ⋯) */
export function BottomTabs({
  tab,
  onChange,
}: {
  tab: AppTab;
  onChange: (t: AppTab) => void;
}) {
  return (
    <nav
      className="bottom-tabs-nav pointer-events-none relative z-50 w-full px-2 pt-1 sm:px-3"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
    >
      <div className="bottom-tabs-dock pointer-events-auto relative mx-auto grid w-full max-w-xl grid-cols-5 items-stretch gap-0.5 overflow-hidden rounded-[1.35rem] border border-white/45 p-1 sm:gap-1 sm:rounded-full sm:p-1.5">
        <span
          aria-hidden
          className="bottom-tabs-ambient pointer-events-none absolute inset-0 z-[1]"
        />
        <span
          aria-hidden
          className="bottom-tabs-edge-light pointer-events-none absolute inset-x-0 top-0 z-[1] h-px"
        />
        <span
          aria-hidden
          className="bottom-tabs-shine bottom-tabs-shine-primary pointer-events-none absolute inset-y-0 left-0 z-[2] w-[42%]"
        />
        {TABS.map(({ id, label }, index) => {
          const active = tab === id;
          const isGrok = id === "rvgrok";
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "bottom-tab-btn group relative flex min-h-[48px] w-full items-center justify-center overflow-hidden rounded-[1.1rem] px-0.5 py-2 transition-all duration-200 ease-out sm:min-h-[52px] sm:rounded-full sm:px-1",
                "active:scale-[0.94] touch-manipulation select-none",
                !isGrok &&
                  !active &&
                  "bg-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] hover:bg-white/[0.18]",
                !isGrok &&
                  active &&
                  "bg-gradient-to-b from-white/40 via-sky-300/30 to-blue/35 shadow-[0_0_26px_rgba(100,180,255,0.5),inset_0_1px_0_rgba(255,255,255,0.75),inset_0_-1px_0_rgba(40,100,200,0.25)] ring-1 ring-white/55",
                isGrok &&
                  !active &&
                  "bg-gradient-to-b from-[rgba(255,90,110,0.42)] via-[rgba(200,25,50,0.4)] to-[rgba(120,8,28,0.55)] shadow-[0_0_16px_rgba(212,37,53,0.35),inset_0_1px_0_rgba(255,200,210,0.45)]",
                isGrok &&
                  active &&
                  "bg-gradient-to-b from-[#ff8a96]/55 via-[rgba(220,40,60,0.55)] to-[rgba(130,10,30,0.65)] shadow-[0_0_28px_rgba(255,60,90,0.65),inset_0_1px_0_rgba(255,220,225,0.7),inset_0_-1px_0_rgba(80,0,20,0.4)] ring-1 ring-[#ff7a8a]/65",
              )}
              style={
                {
                  "--tab-glint-delay": `${index * 0.35}s`,
                } as CSSProperties
              }
            >
              <span
                aria-hidden
                className="bottom-tab-specular pointer-events-none absolute inset-0 z-0"
              />
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute inset-x-0.5 top-0 z-0 h-[55%] rounded-t-[1rem] bg-gradient-to-b to-transparent sm:rounded-t-full",
                  isGrok
                    ? "from-white/50 via-[#ffc0c8]/25 opacity-90"
                    : "from-white/50 via-sky-100/20 opacity-90",
                )}
              />
              {active ? (
                <span
                  aria-hidden
                  className={cn(
                    "bottom-tab-active-glow pointer-events-none absolute inset-0 z-0 rounded-[inherit]",
                    isGrok
                      ? "bottom-tab-active-glow-ruby"
                      : "bottom-tab-active-glow-sapphire",
                  )}
                />
              ) : null}
              <span
                className={cn(
                  "bottom-tab-label relative z-[1] text-center font-bold leading-none tracking-[0.03em]",
                  "text-[12.5px] sm:text-[14px]",
                  isGrok
                    ? active
                      ? "tab-glass-text-ruby-active"
                      : "tab-glass-text-ruby"
                    : active
                      ? "tab-glass-text-active"
                      : "tab-glass-text",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function BrandIcon({
  tab,
  size = 28,
  className,
}: {
  tab: AppTab;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={ALL_BRAND[tab] ?? ALL_BRAND.rvfax}
      alt=""
      width={size}
      height={size}
      draggable={false}
      className={cn("object-contain object-center", className)}
      style={{ width: size, height: size }}
    />
  );
}

export const BRAND_ICONS = ALL_BRAND;
