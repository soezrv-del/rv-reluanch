import { useEffect, useMemo, useState } from "react";
import { fetchLotSnapshot, lotUnitPhoto, type LotUnit } from "@/lib/lot/ownLotPage";
import type { ActiveCoach } from "@/lib/rv/activeCoach";
import { CoveredCoach } from "@/components/shell/CoveredCoach";

const EMPTY_UNITS: LotUnit[] = [];
import {
  arrivalsForHome,
  coverVariant,
  formatHomePrice,
  lotArrivalQuery,
  pickShowroomStage,
  requestLotUnit,
  resolveHomeCoach,
  showroomUnitLabel,
} from "@/lib/home/homeCoach";

function useCountUp(target: number | null): number | null {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    if (target == null) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
    if (reduce || target === 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      setValue(Math.round(target * (1 - (1 - t) ** 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

export function HomeScreen({
  coach,
  onOpenLot,
}: {
  coach: ActiveCoach | null;
  onOpenLot: () => void;
}) {
  const [units, setUnits] = useState<LotUnit[] | null>(null);
  const [photoOk, setPhotoOk] = useState(true);

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
  const fallback = useMemo(
    () => resolveHomeCoach(coach, listed),
    [coach, listed],
  );
  const stage = useMemo(() => pickShowroomStage(coach, listed), [coach, listed]);
  useEffect(() => {
    setPhotoOk(true);
  }, [stage.photo]);
  const arrivals = useMemo(
    () => arrivalsForHome(listed, stage.unit),
    [listed, stage.unit],
  );
  const count = useCountUp(units ? units.length : null);
  const name = stage.name || fallback?.name || "";
  const price = formatHomePrice(stage.price ?? fallback?.price ?? null);
  const photo = stage.photo && photoOk ? stage.photo : null;

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-no-swipe
      className="showroom-home absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
    >
      <div className="showroom-hero">
        {photo ? (
          <>
            <img src={photo} alt="" className="showroom-coach" onError={() => setPhotoOk(false)} />
            <div className="showroom-contact" aria-hidden />
            <div className="showroom-floor" aria-hidden />
            <div className="showroom-reflect-clip" aria-hidden>
              <img src={photo} alt="" className="showroom-reflect" />
            </div>
          </>
        ) : (
          <div className="showroom-coach-fallback">
            {stage.unit ? (
              <CoveredCoach variant={coverVariant(stage.unit)} />
            ) : (
              <p className="showroom-coachline">{units ? name : ""}</p>
            )}
          </div>
        )}
      </div>

      <section className="showroom-placard showroom-card" data-home-placard>
        <p data-home-count className="showroom-count">
          {count == null ? "" : count.toLocaleString("en-US")}
        </p>
        <p className="showroom-onlot">on the lot</p>
        {name ? (
          <p className="showroom-coachline">
            <b>{name}</b>
            {price ? <span> · {price}</span> : null}
          </p>
        ) : null}
      </section>

      {arrivals.length > 0 ? (
        <section data-home-arrivals className="showroom-arrivals">
          <p className="showroom-kicker">
            <i className="showroom-kicker-dot" aria-hidden />
            Newest arrivals
          </p>
          <div className="showroom-rail overflow-x-auto">
            {arrivals.map((unit, index) => (
              <ArrivalCard
                key={`${unit.printed.id ?? ""}-${unit.vin}-${index}`}
                unit={unit}
                onOpen={() => {
                  requestLotUnit(lotArrivalQuery(unit));
                  onOpenLot();
                }}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
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
    <button type="button" onClick={onOpen} className="showroom-arrival showroom-card">
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
