import { useRef } from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  isAndroidNativeWebView,
  isStationaryDockTap,
} from "@/lib/hooks/nativeWebView";

export type AppTab =
  | "home"
  | "rvgrok"
  | "rvfax"
  | "rvcal"
  | "rvtow"
  | "rvtrips"
  | "rvshare"
  | "rvsold"
  | "rvlot"
  | "more";

/** Dock rooms only. Home is not a square. Grok is the ask box. RV GPS is the mark menu. */
type DockTab = "rvfax" | "rvcal" | "rvtow" | "rvlot";
const TABS: { id: DockTab; label: string }[] = [
  { id: "rvfax", label: "Facts" },
  { id: "rvcal", label: "Cal" },
  { id: "rvtow", label: "Tow" },
  { id: "rvlot", label: "Lot" },
];

/**
 * Flat black strip. Facts, Cal, Tow, Lot — that order, always.
 * Active label turns white. No icons, no dock pill.
 *
 * Android WebView: do NOT put pointer-events-none on this nav. Parent
 * none + child auto + backdrop-filter fails hit-testing on Chromium
 * WebView. iOS still uses onClick only.
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
      className="bottom-tabs-nav fox-dock pointer-events-auto relative z-[80] w-full"
      data-bottom-dock
      data-no-swipe
      data-active-tab={tab}
      style={{ touchAction: "manipulation" }}
    >
      <div
        className="fox-dock-row pointer-events-auto relative isolate mx-auto grid w-full max-w-lg grid-cols-4 items-stretch"
        style={{ touchAction: "manipulation" }}
      >
        {TABS.map(({ id, label }) => {
          const active = tab === id;
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
              className={cn(
                "bottom-tab-btn fox-tab pointer-events-auto min-h-12 touch-manipulation select-none",
                active && "is-active",
              )}
            >
              <span className="fox-dock-label">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
