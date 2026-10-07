import { useEffect, type ComponentType } from "react";
import { SHOWROOM_SPOTLIGHT, requestLotUnit } from "@/lib/home/homeCoach";
import type { AppTab, DockRoomId } from "@/components/shell/BottomTabs";
import { dockActiveTab } from "@/components/shell/dockActiveTab";
import { MoreSheet, type MorePick } from "@/components/shell/MoreSheet";
import "./home-showroom.css";

/**
 * Home (rvmax.app "/"): the approved showroom mockup, full screen.
 *
 * The backdrop is a "showroom plate" cut from the mockup: textured wall,
 * glossy floor, the 2026 Entegra Cornerstone 45D and its reflection, with
 * every baked-in UI element removed. It is 1008px wide; mockup rows 0-1791
 * sit at plate y=160-1951 and the extra rows extend wall and floor for
 * phones taller than 9:16. All UI on top is live HTML laid out in mockup
 * pixels (see home-showroom.css).
 *
 * Navigation is the shell's own: the tab bar calls the dock handler
 * (Facts / Inventory / Chat / More sheet), Ask RV Grok opens the Chat room,
 * and Open coach asks Inventory to open stock 45282 (requestLotUnit).
 */
const PLATE_IMAGE = "/assets/showroom/home-showroom.webp";
const PLATE_WIDTH = 1008;
const PLATE_HEIGHT = 2400;
/** The status bar over this screen is the showroom wall, not the light theme's white. */
const HOME_THEME_COLOR = "#07090d";

function RvMark() {
  return (
    <svg className="home-showroom__mark" viewBox="0 0 30 66" aria-hidden="true">
      <path d="M3.5 2v62M3.5 3.5 26 22 7 34.5 28 52" />
    </svg>
  );
}

function FactsIcon() {
  return (
    <svg viewBox="0 0 80 66" aria-hidden="true" className="home-showroom__icon home-showroom__icon--facts">
      <defs>
        <linearGradient id="home-tab-check" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="0.55" stopColor="#c9ccd1" />
          <stop offset="1" stopColor="#8f939a" />
        </linearGradient>
      </defs>
      <path d="M1.5 36.5 8 31l17.5 19.5L73.5 1.5 79 4.5 28.5 64.5h-5.5z" fill="url(#home-tab-check)" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg viewBox="0 0 130 76" aria-hidden="true" className="home-showroom__icon home-showroom__icon--inventory">
      <defs>
        <linearGradient id="home-tab-rv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9dce1" />
          <stop offset="1" stopColor="#8d9097" />
        </linearGradient>
      </defs>
      <path
        className="rv-body"
        d="M5 58V27c0-7 3-11 10-12l44-6c22-3 38-2 48 1 10 3 15 10 17 20l3 16c1 8-2 12-9 12H5z"
        fill="url(#home-tab-rv)"
      />
      <path className="rv-roof" d="M7 17C24 7 52 2 84 2c16 0 28 3 36 11" />
      <path className="rv-glass" d="M14 24h22v12H14zM42 21h40v15H42zM90 18h13c8 0 13 5 15 14l1 6H90z" />
      <path className="rv-stripe" d="M6 46c26-8 54-8 82 0" />
      <path className="rv-glass" d="M88 41h9v15h-9z" />
      <circle className="rv-wheel" cx="29" cy="60" r="9.5" />
      <circle className="rv-wheel" cx="100" cy="60" r="9.5" />
      <circle className="rv-hub" cx="29" cy="60" r="3.2" />
      <circle className="rv-hub" cx="100" cy="60" r="3.2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 72 74" aria-hidden="true" className="home-showroom__icon home-showroom__icon--chat">
      <path className="chat-bubble" d="M20 66.5A32 32 0 1 0 8.6 54.5L3 71z" />
      <circle cx="24" cy="36" r="4.6" />
      <circle cx="36" cy="36" r="4.6" />
      <circle cx="48" cy="36" r="4.6" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 68 16" aria-hidden="true" className="home-showroom__icon home-showroom__icon--more">
      <circle cx="8" cy="8" r="7.5" />
      <circle cx="34" cy="8" r="7.5" />
      <circle cx="60" cy="8" r="7.5" />
    </svg>
  );
}

/** Same rooms, order and labels as the shell dock (BottomTabs). */
const HOME_TABS: { id: DockRoomId; label: string; icon: ComponentType }[] = [
  { id: "rvfax", label: "Facts", icon: FactsIcon },
  { id: "rvlot", label: "Inventory", icon: InventoryIcon },
  { id: "rvgrok", label: "Chat", icon: ChatIcon },
  { id: "more", label: "More", icon: MoreIcon },
];

export function HomeScreen({
  tab,
  onOpen,
  onDockTap,
  moreOpen = false,
  onMorePick,
  onMoreClose,
}: {
  tab: AppTab;
  onOpen: (tab: AppTab, opts?: { skipVoice?: boolean }) => void;
  /** The shell dock handler: Facts / Inventory / Chat, More toggles the sheet. */
  onDockTap: (tab: DockRoomId) => void;
  moreOpen?: boolean;
  onMorePick: (id: MorePick) => void;
  onMoreClose: () => void;
}) {
  const lit = dockActiveTab(tab, true, moreOpen);

  // Dark status bar while the showroom is up; the theme's own color comes back after.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    meta.setAttribute("content", HOME_THEME_COLOR);
    return () => {
      // Same colors setTheme / THEME_BOOT_SCRIPT use (lib/theme).
      const dark = document.documentElement.dataset.theme === "dark";
      meta.setAttribute("content", dark ? "#050505" : "#ffffff");
    };
  }, []);

  // Inventory opens the spotlight unit (stock 45282) the same way any lot search does.
  const openCoach = () => {
    requestLotUnit(SHOWROOM_SPOTLIGHT.stockNumber);
    onOpen("rvlot");
  };

  return (
    <div data-home-screen data-showroom-home="" data-no-swipe className="home-showroom">
      <img
        className="home-showroom__plate"
        src={PLATE_IMAGE}
        width={PLATE_WIDTH}
        height={PLATE_HEIGHT}
        alt="2026 Entegra Cornerstone 45D in the RvFOX showroom"
        decoding="async"
        fetchPriority="high"
        draggable={false}
      />

      <div className="home-showroom__stage">
        <p className="home-showroom__brand" aria-label="RvFOX">
          <RvMark />
          <span>RvFOX</span>
        </p>

        <section className="home-showroom__details" aria-labelledby="home-showroom-title">
          <p className="home-showroom__eyebrow">2026 Entegra Coach</p>
          <h1 id="home-showroom-title" className="home-showroom__title">
            Cornerstone 45D
          </h1>
          <p className="home-showroom__price">$1,124,963</p>
          <p className="home-showroom__stock home-showroom__stock--1">1,420 in stock</p>
          <p className="home-showroom__stock home-showroom__stock--2">
            Stock {SHOWROOM_SPOTLIGHT.stockNumber}
          </p>
          <p className="home-showroom__stock home-showroom__stock--3">• Fresno CA</p>
        </section>

        <button
          type="button"
          className="home-showroom__open"
          data-open-coach
          data-on-dark=""
          onClick={openCoach}
        >
          Open coach
        </button>
        <p className="home-showroom__verified">VERIFIED AND TRUE</p>

        <button
          type="button"
          className="home-showroom__ask"
          data-ask-grok
          data-on-dark=""
          onClick={() => onOpen("rvgrok")}
        >
          Ask RV Grok
        </button>

        <div className="home-showroom__dock" data-no-swipe>
          <MoreSheet open={moreOpen} tab={tab} onPick={onMorePick} onClose={onMoreClose} />
          <nav className="home-showroom__tabs" aria-label="Sections">
            {HOME_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                data-home-tab={id}
                data-on-dark=""
                className={`home-showroom__tab${lit === id ? " is-active" : ""}`}
                aria-current={lit === id ? "page" : undefined}
                aria-expanded={id === "more" ? moreOpen : undefined}
                onClick={() => onDockTap(id)}
              >
                <span className="home-showroom__tab-icon">
                  <Icon />
                </span>
                <span className="home-showroom__tab-label">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
