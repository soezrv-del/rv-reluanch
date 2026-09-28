import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { fetchLotSnapshot, lotUnitPhoto, type LotUnit } from "@/lib/lot/ownLotPage";
import { CoveredCoach } from "@/components/shell/CoveredCoach";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";

const EMPTY_UNITS: LotUnit[] = [];
/** Dealer lot photo. Light mode only — dark uses the studio cutout. */
const LIGHT_LOT_HERO = "/assets/showroom/spotlight-lot.jpg";
import {
  SHOWROOM_SPOTLIGHT,
  arrivalsForHome,
  coverVariant,
  formatHomePrice,
  lotArrivalQuery,
  requestLotUnit,
  showroomUnitLabel,
  spotlightLotUnit,
  spotlightSpecs,
} from "@/lib/home/homeCoach";

export function HomeScreen({
  onOpenLot,
}: {
  onOpenLot: () => void;
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
  const arrivals = useMemo(() => arrivalsForHome(listed), [listed]);
  const spotUnit = useMemo(() => spotlightLotUnit(listed), [listed]);
  const specs = spotUnit ? spotlightSpecs(spotUnit) : null;
  const model = specs?.model || SHOWROOM_SPOTLIGHT.series;
  const spotYear = (spotUnit?.year || SHOWROOM_SPOTLIGHT.year).trim();
  const spotMake = (spotUnit?.make || SHOWROOM_SPOTLIGHT.make).trim();
  const heroSrc = theme === "light" ? LIGHT_LOT_HERO : SHOWROOM_SPOTLIGHT.image;
  const heroKind = theme === "light" ? "photo" : "cutout";
  const lotTotal =
    units && units.length > 0 ? units.length.toLocaleString("en-US") : "";
  const openSpot = () => {
    if (!spotUnit) return;
    requestLotUnit(lotArrivalQuery(spotUnit));
    onOpenLot();
  };

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-no-swipe
      className="showroom-home absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
    >
      <section className="showroom-hero" data-hero-kind={heroKind}>
        {theme === "dark" ? <div className="showroom-hero-beam" aria-hidden /> : null}
        <img
          src={heroSrc}
          alt={SHOWROOM_SPOTLIGHT.alt}
          className="showroom-coach"
          data-hero-kind={heroKind}
        />
        {theme === "dark" ? <div className="showroom-hero-pool" aria-hidden /> : null}
        <div className="showroom-placard" data-home-placard>
          <p className="showroom-spotyear">{spotYear}</p>
          <p className="showroom-spotmake">{spotMake}</p>
          <p className="showroom-spotmodel">{model}</p>
          {specs?.price ? <p className="showroom-spotprice">{specs.price}</p> : null}
          {specs?.stock ? (
            <p className="showroom-spotstock">Stock {specs.stock}</p>
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

      {lotTotal ? (
        <p className="showroom-lot-whisper" data-lot-whisper>
          {lotTotal}
        </p>
      ) : null}

      {arrivals.length > 0 ? (
        <NewestArrivals
          arrivals={arrivals}
          onOpenUnit={(unit) => {
            requestLotUnit(lotArrivalQuery(unit));
            onOpenLot();
          }}
        />
      ) : null}
    </div>
  );
}

function NewestArrivals({
  arrivals,
  onOpenUnit,
}: {
  arrivals: LotUnit[];
  onOpenUnit: (unit: LotUnit) => void;
}) {
  return (
    <section data-home-arrivals className="showroom-arrivals">
      <p className="showroom-kicker">Newest arrivals</p>
      <div
        data-arrival-loop="off"
        className="showroom-rail overflow-x-auto"
      >
        <div className="showroom-arrival-set" data-arrival-set="primary">
          {arrivals.map((unit, index) => (
            <ArrivalCard
              key={`${unit.printed.id ?? ""}-${unit.vin}-${index}`}
              unit={unit}
              onOpen={() => onOpenUnit(unit)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrivalCard({
  unit,
  onOpen,
}: {
  unit: LotUnit;
  onOpen: () => void;
}) {
  const [ok, setOk] = useState(true);
  const photo = ok ? lotUnitPhoto(unit) : null;
  const name = showroomUnitLabel(unit);
  const amount =
    typeof unit.price === "number" && unit.price > 0
      ? formatHomePrice(Math.round(unit.price))
      : "";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="showroom-arrival showroom-card"
    >
      {photo ? (
        <span className="showroom-arrival-photo">
          <img src={photo} alt="" onError={() => setOk(false)} />
        </span>
      ) : (
        <span className="showroom-arrival-photo">
          <CoveredCoach variant={coverVariant(unit)} />
        </span>
      )}
      <span className="showroom-arrival-meta">
        <span className="showroom-arrival-name">{name}</span>
        {amount ? <span className="showroom-arrival-price">{amount}</span> : null}
      </span>
    </button>
  );
}
