import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  isAndroidNativeWebView,
  isStationaryDockTap,
} from "@/lib/hooks/nativeWebView";
import { isProfessionalTier } from "@/lib/rv/proEntitlement";
import {
  formatSoldDockAria,
  formatSoldDockMoney,
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

function DockLabel({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "bottom-tab-label pointer-events-none text-center uppercase leading-none",
        className,
      )}
      data-label={text}
    >
      {text}
    </span>
  );
}

/**
 * Floating true-glass dock — 2026-09-08 tokens (blur/saturate plate,
 * 16px radius, 2px brand-blue top rule on the active tab).
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
          "bottom-tabs-dock pointer-events-auto relative isolate mx-auto grid w-full max-w-lg items-stretch gap-0 overflow-hidden rounded-[16px] p-1",
          pro ? "grid-cols-6" : "grid-cols-5",
        )}
        style={{ touchAction: "manipulation" }}
      >
        {tabs.map(({ id, label, short }) => {
          const active = tab === id;
          const isSold = id === "rvsold";
          const soldLabel = formatSoldDockAria(owedNet);
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
                "bottom-tab-btn group relative z-[3] flex min-h-[48px] w-full items-center justify-center rounded-none px-0.5 py-2 sm:min-h-[52px]",
                "transition-[transform,opacity] duration-200 ease-out",
                "pointer-events-auto active:scale-[0.94] touch-manipulation select-none",
                active && "is-active",
              )}
            >
              {isSold ? (
                <span className="pointer-events-none flex flex-col items-center justify-center gap-0.5 leading-none">
                  <DockLabel text="Sold" className="bottom-tab-label-sold" />
                  <DockLabel
                    text={short}
                    className="bottom-tab-label-sold-owed"
                  />
                </span>
              ) : (
                <DockLabel text={short} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
