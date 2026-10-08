import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  isAndroidNativeWebView,
  isStationaryDockTap,
} from "@/lib/hooks/nativeWebView";
import "./dock.css";
import { dockActiveTab } from "./dockActiveTab";
import { useRoomVoiceOpen } from "./useRoomVoiceOpen";
import { chatTabFace } from "@/lib/rvgrok/roomAsk";

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

/**
 * Runtime dock room ids. Types that other modules need MUST be derived from
 * this value (see DockRoomId). Do not reintroduce a cross-module type-only
 * name that can be stripped while a runtime reference remains (Safari:
 * "Can't find variable" for that type name).
 */
export const DOCK_ROOM_IDS = ["rvfax", "rvlot", "rvgrok", "more"] as const;
export type DockRoomId = (typeof DOCK_ROOM_IDS)[number];

/** The original bar, same as dark Home's row: Facts · Inventory · Chat · More. */
const TABS: {
  id: DockRoomId;
  label: string;
  short: string;
}[] = [
  { id: "rvfax", label: "Facts", short: "Facts" },
  { id: "rvlot", label: "Inventory", short: "Inventory" },
  { id: "rvgrok", label: "Chat", short: "Chat" },
  { id: "more", label: "More", short: "More" },
];

/** Same raster icons as dark Home's row (HomeScreen dark-home-nav). */
export const DOCK_TAB_ICON: Record<DockRoomId, string> = {
  rvfax: "/assets/showroom/tab-facts.png",
  rvlot: "/assets/showroom/tab-inventory.png",
  rvgrok: "/assets/showroom/tab-chat.png",
  more: "/assets/showroom/tab-more.png",
};

/**
 * Dark: the white icon as-is. Light: the same icon used as a mask so it
 * takes the dock ink (graphite, white when lit) instead of vanishing on white.
 */
function DockGlyph({ id }: { id: DockRoomId }) {
  const icon = DOCK_TAB_ICON[id];
  const mask = `url("${icon}") center / contain no-repeat`;
  return (
    <span
      className="bottom-tab-glyph bottom-tab-mask"
      aria-hidden
      style={{ WebkitMask: mask, mask }}
    />
  );
}

/** The RV glyph the Inventory tab always used. */
export function InventoryGlyph({ className = "bottom-tab-glyph" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
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

/** The hitch glyph Tow shortcuts reuse. */
export function TowGlyph({ className = "bottom-tab-glyph" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
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

export { dockActiveTab };

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
 * Four tabs: Facts · Inventory · Chat · More (the original bar).
 * Chat opens the RV Grok room (rvgrok). More toggles the More sheet.
 * Home is the RvFOX logo in the header.
 * Android WebView: do NOT put pointer-events-none on this nav.
 */
export function BottomTabs({
  tab,
  onChange,
  homeOpen = false,
  moreOpen = false,
  children,
}: {
  tab: AppTab;
  onChange: (t: DockRoomId) => void;
  homeOpen?: boolean;
  moreOpen?: boolean;
  children?: ReactNode;
}) {
  const lastFire = useRef({ id: "" as DockRoomId | "", at: 0 });
  const press = useRef<{ id: DockRoomId; x: number; y: number } | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const fire = (id: DockRoomId) => {
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
  }, [tab, homeOpen, moreOpen]);

  const live = useRoomVoiceOpen();
  const lit = dockActiveTab(tab, homeOpen, moreOpen);

  return (
    <nav
      className="bottom-tabs-nav pointer-events-auto relative z-[80] w-full px-0 pt-0"
      data-bottom-dock
      data-dock-icons="platinum"
      data-no-swipe
      data-active-tab={homeOpen ? "home" : tab}
      data-more-open={moreOpen ? "" : undefined}
      style={{ touchAction: "manipulation" }}
    >
      {children}
      <div
        ref={dockRef}
        className="bottom-tabs-dock pointer-events-auto relative isolate flex w-full items-stretch overflow-x-auto overflow-y-hidden"
        style={{ touchAction: "manipulation" }}
      >
        {TABS.map(({ id, label, short }) => {
          const active = lit === id;
          const chatLive = id === "rvgrok" && live;
          // "End" only when the next tap actually stops Live Voice (already on Chat).
          const face = chatLive
            ? chatTabFace(true, tab === "rvgrok" && !homeOpen)
            : { label: short, aria: label };
          return (
            <button
              key={id}
              type="button"
              data-bottom-tab={id}
              data-live-chat={chatLive ? "" : undefined}
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
              aria-expanded={id === "more" ? moreOpen : undefined}
              aria-haspopup={id === "more" ? "dialog" : undefined}
              aria-label={face.aria}
              title={face.aria}
              className={cn(
                "bottom-tab-btn group relative z-[3] flex flex-col items-center justify-center",
                "transition-[background-color,color,opacity] duration-200 ease-out",
                "pointer-events-auto active:opacity-70 touch-manipulation select-none",
                active && "is-active",
                chatLive && "is-live",
              )}
            >
              {chatLive ? <span className="bottom-tab-live-dot" aria-hidden /> : null}
              <DockGlyph id={id} />
              <span className="bottom-tab-caption">{face.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
