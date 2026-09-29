import { useRef } from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  isAndroidNativeWebView,
  isStationaryDockTap,
} from "@/lib/hooks/nativeWebView";
import { useCenterSelectedTab } from "@/lib/hooks/useCenterSelectedTab";
import "./dock.css";

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

/** Six rooms. The row slides. The active tab eases to the center. */
const TABS: {
  id: Exclude<AppTab, "more" | "rvshare" | "rvsold">;
  label: string;
  short: string;
}[] = [
  { id: "rvfax", label: "RvFACTS", short: "Facts" },
  { id: "rvlot", label: "Lot", short: "Lot" },
  { id: "rvgrok", label: "RvGROK", short: "Grok" },
  { id: "rvtow", label: "RvTOW", short: "Tow" },
  { id: "rvcal", label: "RvCAL", short: "Cal" },
  { id: "rvtrips", label: "RV GPS", short: "RV GPS" },
];

function DockGlyph({ id }: { id: (typeof TABS)[number]["id"] }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (id === "rvfax") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <rect x="5" y="3" width="14" height="18" rx="1.5" {...stroke} />
        <path d="M8 9.2h8M8 13h8" {...stroke} />
      </svg>
    );
  }
  if (id === "rvlot") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <path d="M2.5 17.2V10.2h8.8l2.6-4.2h6.4a1.2 1.2 0 0 1 1.2 1.2v10" {...stroke} />
        <path d="M2.5 17.2h19" {...stroke} />
        <circle cx="7" cy="17.2" r="1.7" {...stroke} strokeWidth={1.6} />
        <circle cx="16.2" cy="17.2" r="1.7" {...stroke} strokeWidth={1.6} />
      </svg>
    );
  }
  if (id === "rvgrok") {
    return (
      <span className="bottom-tab-grok">
        <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
          <path
            d="M12 3.2 13.15 10.15 20.8 12 13.15 13.85 12 20.8 10.85 13.85 3.2 12 10.85 10.15Z"
            {...stroke}
          />
        </svg>
      </span>
    );
  }
  if (id === "rvtow") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <path d="M2.8 13h8.4" {...stroke} />
        <path d="M11.2 9.2h3.2v7.6h-3.2" {...stroke} />
        <circle cx="18.2" cy="13" r="2.7" {...stroke} strokeWidth={1.6} />
      </svg>
    );
  }
  if (id === "rvcal") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <rect x="6" y="2.8" width="12" height="18.4" rx="2" {...stroke} />
        <path d="M8.4 7h7.2" {...stroke} />
        <path
          d="M8.6 11.2h2.2M13.2 11.2h2.2M8.6 14.6h2.2M13.2 14.6h2.2"
          {...stroke}
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
      <path
        d="M12 20.5s5.6-4.8 5.6-9.1a5.6 5.6 0 1 0-11.2 0c0 4.3 5.6 9.1 5.6 9.1z"
        {...stroke}
      />
      <circle cx="12" cy="11.2" r="1.7" {...stroke} />
    </svg>
  );
}

/**
 * Sliding dock. Side padding lets Facts and RV GPS reach the middle.
 * Android WebView: do NOT put pointer-events-none on this nav.
 */
export function BottomTabs({
  tab,
  onChange,
  homeOpen = false,
}: {
  tab: AppTab;
  onChange: (t: AppTab) => void;
  homeOpen?: boolean;
}) {
  const lastFire = useRef({ id: "" as AppTab | "", at: 0 });
  const press = useRef<{ id: AppTab; x: number; y: number } | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  useCenterSelectedTab(dockRef, homeOpen ? "home" : tab);

  const fire = (id: AppTab) => {
    const now = performance.now();
    if (lastFire.current.id === id && now - lastFire.current.at < 400) return;
    lastFire.current = { id, at: now };
    void hapticLight();
    onChange(id);
  };

  return (
    <nav
      className="bottom-tabs-nav pointer-events-auto relative z-[80] w-full px-0 pt-1"
      data-bottom-dock
      data-dock-icons="platinum"
      data-no-swipe
      data-active-tab={homeOpen ? "home" : tab}
      style={{ touchAction: "pan-x" }}
    >
      <div
        ref={dockRef}
        className="bottom-tabs-dock pointer-events-auto relative isolate mx-auto flex w-full items-stretch overflow-x-auto overflow-y-hidden"
        style={{ touchAction: "pan-x" }}
      >
        {TABS.map(({ id, label, short }) => {
          const active = !homeOpen && tab === id;
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
                if (!isStationaryDockTap(e.clientX - p.x, e.clientY - p.y)) return;
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
                "bottom-tab-btn group relative z-[3] flex flex-col items-center justify-center",
                "transition-[background-color,color,opacity] duration-200 ease-out",
                "pointer-events-auto active:opacity-70 touch-manipulation select-none",
                active && "is-active",
              )}
            >
              <DockGlyph id={id} />
              <span className="bottom-tab-caption">{short}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
