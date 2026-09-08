import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  isAndroidNativeWebView,
  isStationaryDockTap,
} from "@/lib/hooks/nativeWebView";
import { isProfessionalTier } from "@/lib/rv/proEntitlement";
import {
  formatSoldDockMoney,
  formatSoldMoney,
  readOwedNet,
  SOLD_CHANGED_EVENT,
} from "@/lib/rv/soldDeals";

export type AppTab =
  | "rvgrok"
  | "rvfax"
  | "rvcal"
  | "rvtow"
  | "rvtrips"
  | "rvshare"
  | "rvsold"
  | "more";

/** Dock tabs only — Share is inline on Facts; Premium lives in ⋯ */
const TABS: {
  id: Exclude<AppTab, "more" | "rvshare" | "rvsold">;
  label: string;
  short: string;
}[] = [
  { id: "rvfax", label: "RvFACTS", short: "Facts" },
  { id: "rvcal", label: "RvCAL", short: "Cal" },
  { id: "rvgrok", label: "RvGROK", short: "Grok" },
  { id: "rvtow", label: "RvTOW", short: "Tow" },
  { id: "rvtrips", label: "RvTRIPS", short: "Trips" },
];

/**
 * Floating etched-glass dock — text labels, sliding active capsule.
 *
 * Android WebView: do NOT put pointer-events-none on this nav. Parent
 * none + child auto + backdrop-filter fails hit-testing on Chromium
 * WebView, so Facts/Cal/Tow/Trips/Grok never fire. iOS still uses
 * onClick only (no extra pointer path).
 */
export function BottomTabs({
  tab,
  onChange,
}: {
  tab: AppTab;
  onChange: (t: AppTab) => void;
}) {
  const pro = isProfessionalTier();
  const [owedNet, setOwedNet] = useState(0);
  useEffect(() => {
    const sync = () => setOwedNet(readOwedNet());
    sync();
    window.addEventListener(SOLD_CHANGED_EVENT, sync);
    return () => window.removeEventListener(SOLD_CHANGED_EVENT, sync);
  }, []);

  const tabs: {
    id: Exclude<AppTab, "more" | "rvshare">;
    label: string;
    short: string;
  }[] = pro
    ? [
        ...TABS,
        {
          id: "rvsold",
          label: "Sold",
          short: formatSoldDockMoney(owedNet),
        },
      ]
    : TABS;

  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === tab),
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
          "bottom-tabs-dock pointer-events-auto relative isolate mx-auto grid w-full max-w-lg items-stretch gap-0 overflow-hidden rounded-[1.7rem] p-1",
          pro ? "grid-cols-6" : "grid-cols-5",
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
          className="bottom-tabs-frost pointer-events-none absolute inset-0 z-[1]"
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
            width: `calc((100% - 0.5rem) / ${tabs.length})`,
            left: "0.25rem",
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {tabs.map(({ id, label, short }) => {
          const active = tab === id;
          const isGrok = id === "rvgrok";
          const isSold = id === "rvsold";
          const soldLabel = `Sold · ${formatSoldMoney(owedNet)} owed`;
          return (
            <button
              key={id}
              type="button"
              data-bottom-tab={id}
              data-sold-owed={isSold ? String(owedNet) : undefined}
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
              aria-label={isSold ? soldLabel : label}
              title={isSold ? soldLabel : label}
              className={cn(
                "bottom-tab-btn group relative z-[3] flex min-h-[48px] w-full items-center justify-center rounded-[1.25rem] px-0.5 py-2 sm:min-h-[52px]",
                "transition-[transform,opacity] duration-200 ease-out",
                "pointer-events-auto active:scale-[0.94] touch-manipulation select-none",
              )}
            >
              {isSold ? (
                <span className="pointer-events-none flex flex-col items-center justify-center gap-0.5 leading-none">
                  <span className="text-[8px] font-extrabold tracking-[0.16em] text-amber">
                    SOLD
                  </span>
                  <span className="text-[11px] font-extrabold tabular-nums text-white sm:text-[12px]">
                    {short}
                  </span>
                </span>
              ) : (
                <span
                  className={cn(
                    "bottom-tab-label pointer-events-none text-center font-extrabold uppercase leading-none",
                    isGrok && "bottom-tab-label-grok",
                    active && "is-etched-active",
                  )}
                  data-label={short}
                >
                  <span aria-hidden className="bottom-tab-etch-halo">
                    {short}
                  </span>
                  <span aria-hidden className="bottom-tab-etch-core">
                    {short}
                  </span>
                  <span aria-hidden className="bottom-tab-etch-bevel">
                    {short}
                  </span>
                  <span className="bottom-tab-etch-face">{short}</span>
                </span>
              )}
              {active ? (
                <span
                  aria-hidden
                  className={cn(
                    "bottom-tab-mark pointer-events-none absolute bottom-1.5",
                    isGrok && "bottom-tab-mark-ruby",
                    isSold && "bottom-tab-mark-gold",
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
