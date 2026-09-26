import { useRef, type ReactNode } from "react";
import { Calculator, ClipboardCheck, Map, Store } from "lucide-react";
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
  | "rvlot"
  | "more";

/** Dock tabs only — Share is inline on Facts; Sold and Premium live in ⋯ */
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
  { id: "rvlot", label: "Lot", short: "Lot" },
];

type DockTabId = (typeof TABS)[number]["id"];

type GlyphProps = {
  className?: string;
  strokeWidth?: number | string;
  "aria-hidden"?: boolean | "true" | "false";
};

/**
 * Side-profile pickup: cab with windows, open bed, two wheels.
 * 24×24, stroke currentColor, round caps/joins, no fill.
 */
function PickupIcon({
  className,
  strokeWidth = 2,
  "aria-hidden": ariaHidden = true,
}: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={ariaHidden}
    >
      <path d="M2.5 15.5V11h7.25V8h4.6L18 12h3.5v3.5" />
      <path d="M10.6 11.15V9.15h2.4v2z" />
      <path d="M13.4 9.15H14.5L16.3 11.15h-2.9z" />
      <circle cx="6.25" cy="16.5" r="2" />
      <circle cx="17.6" cy="16.5" r="2" />
    </svg>
  );
}

const DOCK_ICONS: Record<
  Exclude<DockTabId, "rvgrok">,
  (props: GlyphProps) => ReactNode
> = {
  rvfax: ClipboardCheck,
  rvcal: Calculator,
  rvtow: PickupIcon,
  rvtrips: Map,
  rvlot: Store,
};

function DockIcon({ id }: { id: DockTabId }) {
  if (id === "rvgrok") return null;
  const Icon = DOCK_ICONS[id];
  return <Icon className="bottom-tab-icon" strokeWidth={2} aria-hidden />;
}

/**
 * Dock blends into the Raidho mark ground (#000000) so the tab
 * square disappears. Icons only. One highlight: a small
 * --color-sapphire dot under the active tab.
 *
 * Android WebView: do NOT put pointer-events-none on this nav. Parent
 * none + child auto + backdrop-filter fails hit-testing on Chromium
 * WebView, so Facts/Cal/Tow/Trips/Grok/Lot never fire. iOS still uses
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
        className="bottom-tabs-dock pointer-events-auto relative isolate mx-auto grid w-full max-w-lg grid-cols-6 items-stretch gap-0 overflow-hidden rounded-[16px] p-1"
        style={{ touchAction: "manipulation" }}
      >
        {TABS.map(({ id, label }) => {
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
                "bottom-tab-btn group relative z-[3] flex min-h-11 w-full min-w-0 flex-col items-center justify-center gap-1 rounded-none px-0.5 py-1",
                "transition-[transform,opacity] duration-200 ease-out",
                "pointer-events-auto active:scale-[0.94] touch-manipulation select-none",
                isLive && "bottom-tab-live",
                active && "is-active",
              )}
            >
              <span className="bottom-tab-glyph">
                {isLive ? (
                  /* Live slot: Einstein icon only — no Grok / Live / RvGROK text. */
                  <img
                    src="/assets/brand/icon-rvgrok.png"
                    alt=""
                    className="bottom-tab-einstein"
                  />
                ) : (
                  <DockIcon id={id} />
                )}
              </span>
              <span className="bottom-tab-active-dot" aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
