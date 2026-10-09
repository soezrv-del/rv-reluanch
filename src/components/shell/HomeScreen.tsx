import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { fetchLotSnapshot, type LotUnit } from "@/lib/lot/ownLotPage";
import { MetalVerifiedTrue } from "@/components/shell/Launchpad";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { readTheme, serverTheme, setTheme, subscribeTheme } from "@/lib/theme";
import type { AppTab } from "@/components/shell/BottomTabs";
import { askPillFace, planAskPillTap, stopRoomVoice } from "@/lib/rvgrok/roomAsk";
import { AskPillLiveLabel } from "@/components/shell/AskGrokPill";
import { useRoomVoiceOpen } from "@/components/shell/useRoomVoiceOpen";
import { planHomeReveal } from "@/lib/shell/sectionRow";
import "./section-deck.css";

const EMPTY_UNITS: LotUnit[] = [];
import {
  SHOWROOM_SPOTLIGHT,
  lotArrivalQuery,
  requestLotUnit,
  spotlightCard,
  spotlightLotUnit,
  spotlightSpecs,
} from "@/lib/home/homeCoach";

function darkEyebrow(year: string, make: string): string {
  const brand = make.replace(/\s+coach$/i, "").trim().toUpperCase();
  if (!year && !brand) return "";
  return `${year} · ${brand} COACH`;
}

function darkPlace(place: string): string {
  return place.trim().replace(/([A-Za-z])\s+([A-Z]{2})$/, "$1, $2");
}

export function HomeScreen({
  onOpen,
  onReveal,
}: {
  onOpen: (tab: AppTab, opts?: { skipVoice?: boolean; pageScope?: boolean; startAssistant?: boolean }) => void;
  onReveal: () => void;
}) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const live = useRoomVoiceOpen();
  const ask = askPillFace(live);
  const onAsk = () => {
    if (planAskPillTap(live) === "stop") {
      stopRoomVoice();
      return;
    }
    onOpen("rvgrok", { pageScope: true, startAssistant: true });
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const onRevealRef = useRef(onReveal);
  onRevealRef.current = onReveal;

  /**
   * Swipe down opens the section row. Light Home scrolls, so the reveal is
   * armed only at the top of Home and only if Home did not scroll during the
   * gesture. Touch uses touch events (a pan cancels pointer events, but
   * touchend still arrives); mouse and pen use pointer events. One input,
   * one handler, so a gesture opens the row at most once.
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    type Drag = { x: number; y: number; top: number; scrolled: boolean; id: number | "touch" };
    let drag: Drag | null = null;
    const blocked = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest("button, a, input, textarea, select"));
    const begin = (x: number, y: number, target: EventTarget | null, id: Drag["id"]) => {
      drag = blocked(target) ? null : { x, y, top: el.scrollTop, scrolled: false, id };
    };
    const end = (x: number, y: number, id: Drag["id"]) => {
      const start = drag;
      if (!start || start.id !== id) return;
      drag = null;
      const scrolled = start.scrolled || el.scrollTop > 1;
      const plan = planHomeReveal({
        dx: x - start.x,
        dy: y - start.y,
        startScrollTop: start.top,
        scrolled,
      });
      if (plan === "open") onRevealRef.current();
    };
    const onScroll = () => {
      if (drag && el.scrollTop > 1) drag.scrolled = true;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      begin(event.clientX, event.clientY, event.target, event.pointerId);
    };
    const onPointerUp = (event: PointerEvent) => end(event.clientX, event.clientY, event.pointerId);
    const onPointerCancel = (event: PointerEvent) => {
      if (drag?.id === event.pointerId) drag = null;
    };
    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (event.touches.length !== 1 || !touch) {
        drag = null;
        return;
      }
      begin(touch.clientX, touch.clientY, event.target, "touch");
    };
    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      if (touch) end(touch.clientX, touch.clientY, "touch");
    };
    const onTouchCancel = () => {
      if (drag?.id === "touch") drag = null;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [theme]);
  const [units, setUnits] = useState<LotUnit[] | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancel = false;
    fetchLotSnapshot()
      .then((snap) => {
        if (!cancel) setUnits(snap.units);
      })
      .catch(() => {
        if (!cancel) setUnits([]);
      });
    return () => {
      cancel = true;
    };
  }, []);

  const listed = units ?? EMPTY_UNITS;
  const spotUnit = useMemo(() => spotlightLotUnit(listed), [listed]);
  const specs = spotUnit ? spotlightSpecs(spotUnit) : null;
  const model = specs?.model || SHOWROOM_SPOTLIGHT.series;
  const spotYear = (spotUnit?.year || SHOWROOM_SPOTLIGHT.year).trim();
  const spotMake = (spotUnit?.make || SHOWROOM_SPOTLIGHT.make).trim();
  const place = (spotUnit?.location || "").trim();
  const who = [spotYear, spotMake].filter(Boolean).join(" ");
  const heroSrc = SHOWROOM_SPOTLIGHT.image;
  const stockLine = [darkPlace(place), specs?.stock ? `Stock ${specs.stock}` : ""]
    .filter(Boolean)
    .join(" · ");
  const openSpot = () => {
    if (!spotUnit) return;
    requestLotUnit(lotArrivalQuery(spotUnit));
    onOpen("rvlot");
  };

  if (theme === "dark") {
    const where = darkPlace(place);
    const meta = [where, specs?.stock ? `Stock ${specs.stock}` : ""]
      .filter(Boolean)
      .join(" · ");
    const cells = spotUnit ? spotlightCard(spotUnit) : [];
    const share = () => {
      const text = [darkEyebrow(spotYear, spotMake), model, specs?.price, meta]
        .filter(Boolean)
        .join("\n");
      const nav = navigator as Navigator & { share?: (data: { title?: string; text?: string }) => Promise<void> };
      if (nav.share) {
        void nav.share({ title: "RVFOX", text }).catch(() => undefined);
      }
    };
    return (
      <div
        data-home-screen
        data-showroom-home=""
        data-home-theme="dark"
        className="showroom-home dark-home absolute inset-0 z-30 flex flex-col overflow-hidden"
        ref={rootRef}
      >
        <header className="dark-home-bar">
          <p className="dark-home-mark">RVFOX</p>
          <div className="dark-home-tools">
            <button
              type="button"
              className="dark-home-tool"
              aria-label="Bookmark"
              aria-pressed={saved}
              onClick={() => setSaved((on) => !on)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? "#fff" : "none"} aria-hidden="true">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="dark-home-tool" aria-label="Share" onClick={share}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 6 12 2 8 6" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="12" y1="2" x2="12" y2="15" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              className="dark-home-tool"
              data-tool-rail="theme"
              aria-label="Switch to light mode"
              title="Switch to light mode"
              onClick={() => setTheme("light")}
            >
              <Sun width={22} height={22} color="#fff" strokeWidth={1.7} aria-hidden />
            </button>
          </div>
        </header>
        <div className="dark-home-stage">
          <div className="dark-home-floor">
            <img
              src="/assets/showroom/cornerstone-hero.jpg?v=5"
              alt={SHOWROOM_SPOTLIGHT.alt}
              className="dark-home-coach"
              draggable={false}
            />
          </div>
        </div>
        <div className="dark-home-copy">
          <p className="dark-home-eyebrow">{darkEyebrow(spotYear, spotMake)}</p>
          <h1 className="dark-home-title">{model}</h1>
          {specs?.price ? <p className="dark-home-price">{specs.price}</p> : null}
          {meta ? <p className="dark-home-where">{meta}</p> : null}
        </div>
        <section className="dark-home-card">
          {cells.length > 0 ? (
            <div className="dark-home-stats">
              {cells.map((cell) => (
                <div key={cell.label} className="dark-home-stat">
                  <b>{cell.value}</b>
                  <span>{cell.label}</span>
                </div>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            className={live ? "dark-home-ask is-live" : "dark-home-ask"}
            data-ask-grok
            data-live-chat={live ? "" : undefined}
            aria-label={ask.aria}
            title={ask.aria}
            onClick={onAsk}
          >
            {live ? <AskPillLiveLabel label={ask.label} /> : ask.label}
          </button>
          <button type="button" className="home-sections-cue" data-open-sections onClick={onReveal}>
            <ChevronDown width={18} height={18} aria-hidden />
            Sections
          </button>
        </section>
      </div>
    );
  }

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-home-theme={theme}
      className="showroom-home home-glass absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
      ref={rootRef}
    >
      <header className="home-glass-bar">
        <p className="home-glass-mark">RVFOX</p>
        <button
          type="button"
          className="home-glass-theme"
          data-tool-rail="theme"
          aria-label="Switch to dark mode"
          title="Switch to dark mode"
          onClick={() => setTheme("dark")}
        >
          <Moon width={20} height={20} strokeWidth={1.7} aria-hidden />
        </button>
      </header>
      <section className="showroom-hero" data-hero-kind="cutout">
        <div className="showroom-placard" data-home-placard>
          {who ? <p className="showroom-spotyear">{who}</p> : null}
          <p className="showroom-spotmodel">{model}</p>
          {specs?.price ? <p className="showroom-spotprice">{specs.price}</p> : null}
          {stockLine ? <p className="showroom-spotstock">{stockLine}</p> : null}
          {spotUnit ? (
            <button
              type="button"
              className="showroom-hero-primary"
              data-open-coach
              onClick={openSpot}
            >
              Open coach
            </button>
          ) : null}
        </div>
        <div className="showroom-floor" data-hero-kind="cutout">
          <img
            src={heroSrc}
            alt={SHOWROOM_SPOTLIGHT.alt}
            className="showroom-coach"
            data-hero-kind="cutout"
          />
          <div className="showroom-floor-mirror" aria-hidden>
            <img src={heroSrc} alt="" className="showroom-coach-reflect" />
          </div>
          <div className="showroom-floor-gloss" aria-hidden />
        </div>
      </section>

      <div className="home-truth">
        <MetalVerifiedTrue size="md" />
      </div>

      <div className="light-home-ask-wrap">
        <button
          type="button"
          className={live ? "light-home-ask is-live" : "light-home-ask"}
          data-ask-grok
          data-live-chat={live ? "" : undefined}
          aria-label={ask.aria}
          title={ask.aria}
          onClick={onAsk}
        >
          {live ? <AskPillLiveLabel label={ask.label} /> : ask.label}
        </button>
        <button type="button" className="home-sections-cue" data-open-sections onClick={onReveal}>
          <ChevronDown width={18} height={18} aria-hidden />
          Sections
        </button>
      </div>
    </div>
  );
}
