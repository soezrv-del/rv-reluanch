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

/** Six independent rooms. Platinum on each chip. The row slides. */
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
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (id === "rvfax") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <circle cx="12" cy="12" r="8.25" {...stroke} />
        <path d="M8 12.2 10.9 15.1 16.2 8.9" {...stroke} />
      </svg>
    );
  }
  if (id === "rvcal") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <rect x="5" y="2.8" width="14" height="18.4" rx="2.2" {...stroke} />
        <rect x="7.3" y="5.1" width="9.4" height="3" rx="0.6" {...stroke} />
        <g fill="currentColor" stroke="none">
          <circle cx="8.4" cy="11.3" r="0.85" />
          <circle cx="12" cy="11.3" r="0.85" />
          <circle cx="15.6" cy="11.3" r="0.85" />
          <circle cx="8.4" cy="14.5" r="0.85" />
          <circle cx="12" cy="14.5" r="0.85" />
          <circle cx="15.6" cy="14.5" r="0.85" />
          <circle cx="8.4" cy="17.7" r="0.85" />
          <circle cx="12" cy="17.7" r="0.85" />
          <circle cx="15.6" cy="17.7" r="0.85" />
        </g>
      </svg>
    );
  }
  if (id === "rvgrok") {
    return (
      <span className="bottom-tab-grok" aria-hidden>
        <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
          <circle cx="12" cy="12" r="2.1" {...stroke} />
          <path
            d="M12 3.5v2.4M12 18.1v2.4M3.5 12h2.4M18.1 12h2.4M6 6l1.7 1.7M16.3 16.3 18 18M18 6l-1.7 1.7M7.7 16.3 6 18"
            {...stroke}
          />
        </svg>
      </span>
    );
  }
  if (id === "rvtow") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <path
          d="M2.6 15.1h1.8M8.5 15.1h6.2M18.7 15.1h2.7M2.6 15.1V11.8h6.8V8.4h4.2l2.7 3.4h4.9v3.3"
          {...stroke}
        />
        <path d="M10 12V9.2h2.9l1.7 2.8" {...stroke} />
        <circle cx="6.4" cy="16.8" r="1.8" {...stroke} />
        <circle cx="16.7" cy="16.8" r="1.8" {...stroke} />
      </svg>
    );
  }
  if (id === "rvtrips") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <path
          d="M12 21s6.2-5.4 6.2-10a6.2 6.2 0 1 0-12.4 0C5.8 15.6 12 21 12 21z"
          {...stroke}
        />
        <circle cx="12" cy="11" r="2" {...stroke} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
      <path d="M3.5 20.5V10L8 7.6V20.5M8 20.5V6.2L16 3.5v17M16 20.5V8.2l4.5 2.1v10.2M3.5 20.5h17" {...stroke} />
    </svg>
  );
}

/** Sliding rooms. The selected tab centers in the strip. */
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
      className="bottom-tabs-nav pointer-events-auto relative z-[80] w-full px-3 pt-1"
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
                "bottom-tab-btn group relative z-[3] flex flex-col items-center justify-center px-3 py-2",
                "transition-[transform,opacity] duration-200 ease-out",
                "pointer-events-auto active:scale-[0.94] touch-manipulation select-none",
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
