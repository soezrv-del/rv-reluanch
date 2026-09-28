import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fetchLotSnapshot, type LotUnit } from "@/lib/lot/ownLotPage";
import { MetalVerifiedTrue } from "@/components/shell/Launchpad";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import type { AppTab } from "@/components/shell/BottomTabs";

const EMPTY_UNITS: LotUnit[] = [];
import {
  SHOWROOM_SPOTLIGHT,
  lotArrivalQuery,
  requestLotUnit,
  spotlightLotUnit,
  spotlightSpecs,
} from "@/lib/home/homeCoach";

const JUMPS: { id: AppTab; label: string; hint: string }[] = [
  { id: "rvlot", label: "New arrivals", hint: "Lot" },
  { id: "rvfax", label: "Facts", hint: "Specs" },
  { id: "rvgrok", label: "Grok", hint: "Ask" },
  { id: "rvtow", label: "Tow", hint: "Match" },
  { id: "rvcal", label: "Cal", hint: "Payment" },
  { id: "rvtrips", label: "RV GPS", hint: "Route" },
];

export function HomeScreen({
  onOpen,
}: {
  onOpen: (tab: AppTab) => void;
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
  const model = specs?.model || SHOWROOM_SPOTLIGHT.series;
  const spotYear = (spotUnit?.year || SHOWROOM_SPOTLIGHT.year).trim();
  const spotMake = (spotUnit?.make || SHOWROOM_SPOTLIGHT.make).trim();
  const place = (spotUnit?.location || "").trim();
  const who = [spotYear, spotMake].filter(Boolean).join(" ");
  const heroSrc = SHOWROOM_SPOTLIGHT.image;
  const lotTotal =
    units && units.length > 0 ? units.length.toLocaleString("en-US") : "";
  const openSpot = () => {
    if (!spotUnit) return;
    requestLotUnit(lotArrivalQuery(spotUnit));
    onOpen("rvlot");
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
        <div className="showroom-hero-beam" aria-hidden />
        <img
          src={heroSrc}
          alt={SHOWROOM_SPOTLIGHT.alt}
          className="showroom-coach"
          data-hero-kind="cutout"
        />
        <div className="showroom-hero-pool" aria-hidden />
        <div className="showroom-placard" data-home-placard>
          {who ? <p className="showroom-spotyear">{who}</p> : null}
          <p className="showroom-spotmodel">{model}</p>
          {specs?.price ? <p className="showroom-spotprice">{specs.price}</p> : null}
          {specs?.stock ? (
            <p className="showroom-spotstock">
              Stock {specs.stock}
              {place ? <span className="showroom-spotplace"> · {place}</span> : null}
            </p>
          ) : null}
          {spotUnit ? (
            <button
              type="button"
              className="showroom-hero-primary"
              onClick={openSpot}
            >
              Open coach
            </button>
          ) : null}
        </div>
      </section>

      <div className="home-truth">
        <MetalVerifiedTrue size="md" />
      </div>

      {lotTotal ? (
        <p className="showroom-lot-whisper" data-lot-whisper>
          {lotTotal}
        </p>
      ) : null}

      <nav className="home-jumps" aria-label="Go to">
        {JUMPS.map((jump) => (
          <button
            key={jump.id}
            type="button"
            className="home-jump"
            onClick={() => onOpen(jump.id)}
          >
            <span className="home-jump-label">{jump.label}</span>
            <span className="home-jump-hint">{jump.hint}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
