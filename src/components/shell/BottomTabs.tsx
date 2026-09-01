import { useRef } from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  isAndroidNativeWebView,
  isStationaryDockTap,
} from "@/lib/hooks/nativeWebView";

export type AppTab =
  | "rvgrok"
  | "rvfax"
  | "rvcal"
  | "rvtow"
  | "rvtrips"
  | "rvshare"
  | "more";

/** Dock tabs only — Premium lives in the top-right ⋯ menu */
const TABS: {
  id: Exclude<AppTab, "more">;
  label: string;
  short: string;
}[] = [
  { id: "rvfax", label: "RvFACTS", short: "Facts" },
  { id: "rvcal", label: "RvCAL", short: "Cal" },
  { id: "rvtow", label: "RvTOW", short: "Tow" },
  { id: "rvtrips", label: "RvTRIPS", short: "Trips" },
  { id: "rvshare", label: "RvSHARE", short: "Share" },
  { id: "rvgrok", label: "RvGROK", short: "Grok" },
];

/**
 * Floating platinum-glass dock — text labels, sliding active capsule.
 *
 * Android WebView: do NOT put pointer-events-none on this nav. Parent
 * none + child auto + backdrop-filter fails hit-testing on Chromium
 * WebView, so Facts/Cal/Tow/Trips/Share/Grok never fire. iOS still uses
 * onClick only (no extra pointer path).
 */
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
  const lastFire = useRef({ id: "" as AppTab | "", at: 0 });
  const press = useRef<{ id: AppTab; x: number; y: number } | null>(null);

  const fire = (id: AppTab) => {
    const now = performance.now();
    if (lastFire.current.id === id && now - lastFire.current.at < 400) return;
    lastFire.current = { id, at: now };
    void hapticLight();
    onChange(id);
  };

  return (
    <nav
      className="bottom-tabs-nav pointer-events-auto relative z-[80] w-full px-3 pt-1 sm:px-4"
      data-bottom-dock
      data-no-swipe
      data-active-tab={tab}
      style={{
        // iOS/web keep the tight inset (home-indicator taps still work).
        // html.android-native overrides this with --dock-safe-bottom.
        paddingBottom: "min(10px, max(6px, env(safe-area-inset-bottom, 0px)))",
        touchAction: "manipulation",
      }}
    >
      <div
        className={cn(
          "bottom-tabs-dock pointer-events-auto relative isolate mx-auto grid w-full max-w-lg grid-cols-6 items-stretch gap-0 overflow-hidden rounded-[1.7rem] p-1",
          grokActive && "bottom-tabs-dock-ruby",
        )}
        style={{ touchAction: "manipulation" }}
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
            width: "calc((100% - 0.5rem) / 6)",
            left: "0.25rem",
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {TABS.map(({ id, label, short }) => {
          const active = tab === id;
          const isGrok = id === "rvgrok";
          return (
            <button
              key={id}
              type="button"
              data-bottom-tab={id}
              onPointerDown={(e) => {
                if (!isAndroidNativeWebView()) return;
                press.current = { id, x: e.clientX, y: e.clientY };
              }}
              onPointerUp={(e) => {
                if (!isAndroidNativeWebView()) return;
                const p = press.current;
                press.current = null;
                if (!p || p.id !== id) return;
                if (!isStationaryDockTap(e.clientX - p.x, e.clientY - p.y)) {
                  return;
                }
                fire(id);
              }}
              onPointerCancel={() => {
                press.current = null;
              }}
              onClick={() => {
                fire(id);
              }}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              title={label}
              className={cn(
                "bottom-tab-btn group relative z-[3] flex min-h-[48px] w-full items-center justify-center rounded-[1.25rem] px-0.5 py-2 sm:min-h-[52px]",
                "transition-[transform,opacity] duration-200 ease-out",
                "pointer-events-auto active:scale-[0.94] touch-manipulation select-none",
              )}
            >
              <span
                className={cn(
                  "bottom-tab-label pointer-events-none text-center text-[12px] font-bold uppercase leading-none tracking-[0.06em] sm:text-[13px] sm:tracking-[0.08em]",
                  isGrok
                    ? active
                      ? "text-[#ffd0d6]"
                      : "text-white/55"
                    : active
                      ? "text-sky-50"
                      : "text-white/55",
                )}
              >
                {short}
              </span>
              {active ? (
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute bottom-1.5 h-[2px] w-3.5 rounded-full",
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
