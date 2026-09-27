import { useEffect, useMemo, useState } from "react";
import { fetchLotSnapshot, lotUnitPhoto, type LotUnit } from "@/lib/lot/ownLotPage";
import type { ActiveCoach } from "@/lib/rv/activeCoach";
import {
  arrivalLabel,
  formatHomePrice,
  lotArrivalQuery,
  newestArrivals,
  requestLotUnit,
  resolveHomeCoach,
  type HomeCoach,
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

  const hero: HomeCoach | null = useMemo(
    () => resolveHomeCoach(coach, units ?? []),
    [coach, units],
  );
  const arrivals = useMemo(() => newestArrivals(units ?? []), [units]);
  const count = useCountUp(units ? units.length : null);
  const price = formatHomePrice(hero?.price ?? null);
  const photo = hero?.photo && photoOk ? hero.photo : null;

  return (
    <div
      data-home-screen
      data-no-swipe
      className="absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto bg-black"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-2">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="max-h-[38vh] w-full object-contain"
            onError={() => setPhotoOk(false)}
          />
        ) : (
          <h1 className="max-w-[16ch] text-center text-[clamp(1.7rem,7.5vw,2.5rem)] font-semibold leading-tight text-fg">
            {hero?.name || (units ? "On the lot" : "")}
          </h1>
        )}
        <p
          data-home-count
          className="mt-6 text-[clamp(3.4rem,18vw,4.75rem)] font-semibold leading-none tracking-tight text-fg tabular-nums"
        >
          {count == null ? "" : count.toLocaleString("en-US")}
        </p>
        <p className="mt-3 max-w-[28ch] text-center text-[15px] leading-snug text-muted">
          on the lot
          {hero?.name ? ` · ${hero.name}` : ""}
          {price ? ` · ${price}` : ""}
        </p>
      </div>
      {arrivals.length > 0 ? (
        <section data-home-arrivals className="w-full shrink-0 pb-3">
          <p className="px-5 text-[11px] font-semibold tracking-[0.14em] text-muted">
            Newest arrivals
          </p>
          <div className="mt-2 flex w-full snap-x gap-2 overflow-x-auto px-5 pb-1">
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
  const name = arrivalLabel(unit);
  const amount =
    typeof unit.price === "number" && unit.price > 0
      ? formatHomePrice(Math.round(unit.price))
      : "";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-36 shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-surface text-left"
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          className="h-16 w-full object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <span className="block h-16 w-full bg-surface-2" aria-hidden />
      )}
      <span className="flex min-h-11 flex-col justify-center px-2.5 py-2">
        <span className="line-clamp-2 text-[13px] font-medium leading-snug text-fg">
          {name}
        </span>
        {amount ? (
          <span className="mt-0.5 text-[12px] text-muted">{amount}</span>
        ) : null}
      </span>
    </button>
  );
}
