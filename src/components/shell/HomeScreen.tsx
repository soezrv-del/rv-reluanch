import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fetchLotSnapshot, type LotUnit } from "@/lib/lot/ownLotPage";
import { MetalVerifiedTrue } from "@/components/shell/Launchpad";
import { Sun } from "lucide-react";
import { readTheme, serverTheme, setTheme, subscribeTheme } from "@/lib/theme";
import type { AppTab } from "@/components/shell/BottomTabs";

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
}: {
  onOpen: (tab: AppTab, opts?: { skipVoice?: boolean }) => void;
}) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
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
        data-no-swipe
        className="showroom-home dark-home absolute inset-0 z-30 flex flex-col overflow-hidden"
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
            className="dark-home-ask"
            data-ask-grok
            onClick={() => onOpen("rvgrok")}
          >
            Ask RV Grok
          </button>
          <nav className="dark-home-nav" aria-label="Home">
            <button type="button" className="is-on" onClick={() => onOpen("rvfax")}>
              <img src="/assets/showroom/tab-facts.png" alt="" width="28" height="27" />
              <span>Facts</span>
            </button>
            <button type="button" onClick={() => onOpen("rvlot")}>
              <img src="/assets/showroom/tab-inventory.png" alt="" width="40" height="25" />
              <span>Inventory</span>
            </button>
            <button type="button" onClick={() => onOpen("rvgrok")}>
              <img src="/assets/showroom/tab-chat.png" alt="" width="26" height="27" />
              <span>Chat</span>
            </button>
            <button type="button" onClick={() => onOpen("more")}>
              <img src="/assets/showroom/tab-more.png" alt="" width="28" height="15" />
              <span>More</span>
            </button>
          </nav>
        </section>
      </div>
    );
  }

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-home-theme={theme}
      data-no-swipe
      className="showroom-home absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
    >
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
          className="light-home-ask"
          data-ask-grok
          onClick={() => onOpen("rvgrok")}
        >
          Ask RV Grok
        </button>
      </div>
    </div>
  );
}
