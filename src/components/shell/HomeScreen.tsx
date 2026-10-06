import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fetchLotSnapshot, type LotUnit } from "@/lib/lot/ownLotPage";
import { MetalVerifiedTrue } from "@/components/shell/Launchpad";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import type { AppTab } from "@/components/shell/BottomTabs";
import {
  SHOWROOM_SPOTLIGHT,
  lotArrivalQuery,
  requestLotUnit,
  spotlightLotUnit,
  spotlightSpecs,
} from "@/lib/home/homeCoach";
import { roomAskSend } from "@/lib/rvgrok/roomAsk";
import { markAskBarGrokEntry } from "@/lib/rvgrok/screenContext";

const EMPTY_UNITS: LotUnit[] = [];

/** Static brochure specs for the locked Cornerstone spotlight. */
const SPOTLIGHT_STRIP = [
  { value: "44 ft 11 in", label: "LENGTH" },
  { value: "4 slides", label: "FLOORPLAN" },
  { value: "605 hp", label: "ENGINE" },
  { value: "54,000", label: "GVWR" },
] as const;

export function HomeScreen({
  onOpen,
}: {
  onOpen: (tab: AppTab, opts?: { skipVoice?: boolean }) => void;
}) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const [units, setUnits] = useState<LotUnit[] | null>(null);

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
  const model = specs?.model || `${SHOWROOM_SPOTLIGHT.series} 45D`;
  const spotYear = (spotUnit?.year || SHOWROOM_SPOTLIGHT.year).trim();
  const spotMake = (spotUnit?.make || SHOWROOM_SPOTLIGHT.make).trim();
  const place = (spotUnit?.location || "Fresno, CA").trim();
  const who = [spotYear, spotMake.toUpperCase().includes("ENTEGRA") ? "ENTEGRA COACH" : spotMake.toUpperCase()]
    .filter(Boolean)
    .join(" · ");
  const heroSrc = SHOWROOM_SPOTLIGHT.image;
  const price = specs?.price || "$1,124,963";
  const stock = specs?.stock || SHOWROOM_SPOTLIGHT.stockNumber;

  const openSpot = () => {
    if (!spotUnit) return;
    requestLotUnit(lotArrivalQuery(spotUnit));
    onOpen("rvlot");
  };

  const askGrok = () => {
    const q = `Tell me about the ${spotYear} ${spotMake} ${model}`;
    roomAskSend(q);
    markAskBarGrokEntry();
    onOpen("rvgrok", { skipVoice: true });
  };

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-home-theme={theme}
      data-no-swipe
      className="showroom-home absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
    >
      <section className="showroom-hero" data-hero-kind="cutout">
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

        <div className="showroom-placard" data-home-placard>
          {who ? <p className="showroom-spotyear">{who}</p> : null}
          <p className="showroom-spotmodel">{model}</p>
          {price ? <p className="showroom-spotprice">{price}</p> : null}
          <p className="showroom-spotstock">
            {place}
            {stock ? <span className="showroom-spotplace"> · Stock {stock}</span> : null}
          </p>
        </div>
      </section>

      {/* Glass card: specs · copper Ask CTA */}
      <div className="showroom-home-card">
        <div className="showroom-spec-strip" role="list">
          {SPOTLIGHT_STRIP.map((row) => (
            <div key={row.label} className="showroom-spec" role="listitem">
              <div className="showroom-spec-value">{row.value}</div>
              <div className="showroom-spec-label">{row.label}</div>
            </div>
          ))}
        </div>

        <div className="showroom-cta-wrap">
          <button type="button" className="showroom-cta-copper" onClick={askGrok}>
            Ask RV Grok
          </button>
        </div>

        {spotUnit ? (
          <button type="button" className="showroom-hero-secondary" onClick={openSpot}>
            Open coach on lot
          </button>
        ) : null}
      </div>

      <div className="home-truth">
        <MetalVerifiedTrue size="md" />
      </div>
    </div>
  );
}
