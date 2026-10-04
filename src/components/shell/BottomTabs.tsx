import { useLayoutEffect, useRef } from "react";
import { Calculator, FileText, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  isAndroidNativeWebView,
  isStationaryDockTap,
} from "@/lib/hooks/nativeWebView";
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

const glyph = {
  className: "bottom-tab-glyph",
  strokeWidth: 1.75,
  "aria-hidden": true as const,
};

function DockGlyph({ id }: { id: (typeof TABS)[number]["id"] }) {
  if (id === "rvfax") return <FileText {...glyph} />;
  if (id === "rvgrok") return <Sparkles {...glyph} />;
  if (id === "rvcal") return <Calculator {...glyph} />;
  if (id === "rvtrips") return <MapPin {...glyph} />;
  if (id === "rvtow") {
    return (
      <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
        <path
          d="M3 12h8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M11 9.25h3.25v5.5H11z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle
          cx="17.7"
          cy="12"
          r="2.15"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="bottom-tab-glyph" aria-hidden>
      <path
        d="M3.4 16.2V8.5C3.4 6.4 5.1 5.1 7.2 5.1h12.6c.9 0 1.7.8 1.7 1.7v9.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.1 13.8V8.7c.45-1.35 1.7-2.05 2.9-1.55V13.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M10.4 7.6h8.5v2.3h-8.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="7.6" cy="16.9" r="1.55" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.8" cy="16.9" r="1.55" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function placeDock(dock: HTMLDivElement, smooth: boolean) {
  const active = dock.querySelector<HTMLElement>(".is-active");
  const left = active
    ? active.offsetLeft - (dock.clientWidth - active.offsetWidth) / 2
    : 0;
  dock.scrollTo({
    left: Math.max(0, left),
    behavior: smooth ? "smooth" : "auto",
  });
}

/**
 * Six tabs share the row at equal width.
 * placeDock still centers a tab if the row ever overflows.
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

  const fire = (id: AppTab) => {
    const now = performance.now();
    if (lastFire.current.id === id && now - lastFire.current.at < 400) return;
    lastFire.current = { id, at: now };
    void hapticLight();
    onChange(id);
  };

  useLayoutEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = requestAnimationFrame(() => placeDock(dock, !reduced && !homeOpen));
    const observer = new ResizeObserver(() => placeDock(dock, false));
    observer.observe(dock);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [tab, homeOpen]);

  return (
    <nav
      className="bottom-tabs-nav pointer-events-auto relative z-[80] w-full px-0 pt-0"
      data-bottom-dock
      data-dock-icons="platinum"
      data-no-swipe
      data-active-tab={homeOpen ? "home" : tab}
      style={{ touchAction: "pan-x" }}
    >
      <div
        ref={dockRef}
        className="bottom-tabs-dock pointer-events-auto relative isolate flex w-full items-stretch overflow-x-auto overflow-y-hidden"
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
