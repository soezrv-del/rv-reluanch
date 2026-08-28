import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";

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
  short: string;
  iconSrc: string;
}[] = [
  {
    id: "rvfax",
    label: "RvFACTS",
    short: "Facts",
    iconSrc: "/assets/brand/icon-rvfax.png",
  },
  {
    id: "rvcal",
    label: "RvCAL",
    short: "Cal",
    iconSrc: "/assets/brand/icon-rvcal.png",
  },
  {
    id: "rvtow",
    label: "RvTOW",
    short: "Tow",
    iconSrc: "/assets/brand/icon-rvtow.png",
  },
  {
    id: "rvtrips",
    label: "RvTRIPS",
    short: "Trips",
    iconSrc: "/assets/brand/icon-rvtrips.png",
  },
  {
    id: "rvgrok",
    label: "RvGROK",
    short: "Grok",
    iconSrc: "/assets/brand/icon-rvgrok.png",
  },
];

/** Floating platinum-glass dock — icons + short labels, sliding active capsule */
export function BottomTabs({
  tab,
  onChange,
}: {
  tab: AppTab;
  onChange: (t: AppTab) => void;
}) {
  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.id === tab),
  );
  const grokActive = tab === "rvgrok";

  return (
    <nav
      className="bottom-tabs-nav pointer-events-none relative z-50 w-full px-3 pt-1 sm:px-4"
      data-bottom-dock
      data-active-tab={tab}
      style={{ paddingBottom: "max(0.45rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className={cn(
          "bottom-tabs-dock pointer-events-auto relative mx-auto grid w-full max-w-md grid-cols-5 items-stretch gap-0 overflow-hidden rounded-[1.7rem] p-1 sm:max-w-lg",
          grokActive && "bottom-tabs-dock-ruby",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-[1px] z-0 rounded-[1.55rem] border border-white/[0.08]"
        />
        <span
          aria-hidden
          className="bottom-tabs-ambient pointer-events-none absolute inset-0 z-[1]"
        />
        <span
          aria-hidden
          className="bottom-tabs-edge-light pointer-events-none absolute inset-x-4 top-0 z-[1] h-px"
        />
        <span
          aria-hidden
          className="bottom-tabs-shine bottom-tabs-shine-primary pointer-events-none absolute inset-y-0 left-0 z-[2] w-[38%]"
        />

        <span
          aria-hidden
          className={cn(
            "bottom-tab-indicator pointer-events-none absolute top-1 bottom-1 z-[1] rounded-[1.25rem]",
            grokActive
              ? "bottom-tab-indicator-ruby"
              : "bottom-tab-indicator-sapphire",
          )}
          style={{
            width: "calc((100% - 0.5rem) / 5)",
            left: "0.25rem",
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {TABS.map(({ id, label, short, iconSrc }) => {
          const active = tab === id;
          const isGrok = id === "rvgrok";
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                void hapticLight();
                onChange(id);
              }}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "bottom-tab-btn group relative z-[3] flex min-h-[56px] w-full flex-col items-center justify-center gap-0.5 rounded-[1.25rem] px-0.5 py-1.5",
                "transition-[transform,opacity] duration-200 ease-out",
                "active:scale-[0.94] touch-manipulation select-none",
              )}
            >
              <span
                className={cn(
                  "relative flex size-7 items-center justify-center sm:size-8",
                  active ? "opacity-100" : "opacity-[0.62] group-hover:opacity-90",
                )}
              >
                <img
                  src={iconSrc}
                  alt=""
                  className={cn(
                    "bottom-tab-icon size-[22px] object-contain sm:size-6",
                    active && "drop-shadow-[0_0_10px_rgba(160,210,255,0.55)]",
                    isGrok &&
                      active &&
                      "drop-shadow-[0_0_10px_rgba(255,90,110,0.55)]",
                  )}
                  draggable={false}
                />
              </span>
              <span
                className={cn(
                  "bottom-tab-label text-center text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] sm:text-[10px]",
                  isGrok
                    ? active
                      ? "text-[#ffd0d6]"
                      : "text-white/45"
                    : active
                      ? "text-sky-50"
                      : "text-white/45",
                )}
              >
                {short}
              </span>
              {active ? (
                <span
                  aria-hidden
                  className={cn(
                    "absolute bottom-1 h-[2px] w-3.5 rounded-full",
                    isGrok
                      ? "bg-[#ff8a96] shadow-[0_0_8px_rgba(255,90,110,0.8)]"
                      : "bg-sky-200 shadow-[0_0_8px_rgba(140,200,255,0.75)]",
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
