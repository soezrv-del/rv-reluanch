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
  | "rvsold"
  | "more";

/** Dock tabs only — Share is inline on Facts; Sold + Premium live in ⋯ */
const TABS: {
  id: Exclude<AppTab, "more" | "rvshare" | "rvsold">;
  label: string;
  short: string;
}[] = [
  { id: "rvfax", label: "RvFACTS", short: "Facts" },
  { id: "rvcal", label: "RvCAL", short: "Cal" },
  { id: "rvgrok", label: "RvGROK", short: "Grok" },
  { id: "rvtow", label: "RvTOW", short: "Tow" },
  { id: "rvtrips", label: "RV GPS", short: "RV GPS" },
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
 * Dock blends into the Raidho mark ground (#000000) so the tab
 * square disappears. One highlight: 2px --color-sapphire top rule
 * on the active tab.
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
        // Bottom inset lives in CSS (.bottom-tabs-nav) so env() + the
        // phone fallback floor win. html.android-native uses --dock-safe-bottom.
        touchAction: "manipulation",
      }}
    >
      <div
        className="bottom-tabs-dock pointer-events-auto relative isolate mx-auto grid w-full max-w-lg grid-cols-5 items-stretch gap-0 overflow-hidden rounded-[16px] p-1"
        style={{ touchAction: "manipulation" }}
      >
        {TABS.map(({ id, label, short }) => {
          const active = tab === id;
          const isLive = id === "rvgrok";
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
                "bottom-tab-btn group relative z-[3] flex min-h-[48px] w-full items-center justify-center rounded-none px-0.5 py-2 sm:min-h-[52px]",
                "transition-[transform,opacity] duration-200 ease-out",
                "pointer-events-auto active:scale-[0.94] touch-manipulation select-none",
                isLive && "bottom-tab-live",
                active && "is-active",
              )}
            >
              {isLive ? (
                /* Live slot: Einstein icon only — no Grok / Live / RvGROK text. */
                <img
                  src="/assets/brand/icon-rvgrok.png"
                  alt=""
                  className="bottom-tab-einstein"
                />
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
