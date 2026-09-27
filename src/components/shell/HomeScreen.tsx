import { useEffect, useMemo, useState } from "react";
import { fetchLotSnapshot, type LotUnit } from "@/lib/lot/ownLotPage";
import type { ActiveCoach } from "@/lib/rv/activeCoach";
import {
  formatHomePrice,
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

export function HomeScreen({ coach }: { coach: ActiveCoach | null }) {
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
  const count = useCountUp(units ? units.length : null);
  const price = formatHomePrice(hero?.price ?? null);
  const photo = hero?.photo && photoOk ? hero.photo : null;

  return (
    <div
      data-home-screen
      data-no-swipe
      className="absolute inset-0 z-30 flex flex-col bg-black"
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-4">
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
    </div>
  );
}
