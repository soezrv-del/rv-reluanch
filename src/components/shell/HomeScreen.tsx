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
  spotlightLotUnit,
  spotlightSpecs,
} from "@/lib/home/homeCoach";

function darkPlace(place: string): string {
  return place.trim().replace(/([A-Za-z])\s+([A-Z]{2})$/, "$1, $2");
}

/**
 * Home showroom — light-side mockup layout in both themes:
 * placard (year/make, model, price, stock, location) → Open coach →
 * coach hero + reflection → VERIFIED AND TRUE → Ask RV Grok pill.
 * Dock (Facts · Inventory · Chat · More) is RoomAskBar / BottomTabs.
 */
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
  const where = darkPlace(place);
  const stockLine = [
    specs?.stock ? `Stock ${specs.stock}` : "",
    where ? `· ${where}` : "",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/^·\s*/, "");

  const openSpot = () => {
    if (!spotUnit) return;
    requestLotUnit(lotArrivalQuery(spotUnit));
    onOpen("rvlot");
  };

  const share = () => {
    const text = [who, model, specs?.price, stockLine].filter(Boolean).join("\n");
    const nav = navigator as Navigator & {
      share?: (data: { title?: string; text?: string }) => Promise<void>;
    };
    if (nav.share) {
      void nav.share({ title: "RVFOX", text }).catch(() => undefined);
    }
  };

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-home-theme={theme}
      data-no-swipe
      className={
        theme === "dark"
          ? "showroom-home dark-home absolute inset-0 z-30 flex flex-col overflow-hidden"
          : "showroom-home absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
      }
    >
      {theme === "dark" ? (
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
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={saved ? "#fff" : "none"}
                aria-hidden="true"
              >
                <path
                  d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="dark-home-tool"
              aria-label="Share"
              onClick={share}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="16 6 12 2 8 6"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="12"
                  y1="2"
                  x2="12"
                  y2="15"
                  stroke="#fff"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
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
      ) : null}

      <section className="showroom-hero" data-hero-kind="cutout">
        <div className="showroom-placard" data-home-placard>
          {who ? <p className="showroom-spotyear">{who}</p> : null}
          <p className="showroom-spotmodel">{model}</p>
          {specs?.price ? <p className="showroom-spotprice">{specs.price}</p> : null}
          {listed.length > 0 ? (
            <p className="showroom-lotcount">
              {listed.length.toLocaleString("en-US")} in stock
            </p>
          ) : null}
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
            draggable={false}
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

      <div
        className={
          theme === "dark" ? "dark-home-ask-wrap light-home-ask-wrap" : "light-home-ask-wrap"
        }
      >
        <button
          type="button"
          className={theme === "dark" ? "dark-home-ask" : "light-home-ask"}
          data-ask-grok
          onClick={() => onOpen("rvgrok")}
        >
          Ask RV Grok
        </button>
      </div>
    </div>
  );
}
