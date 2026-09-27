import { useEffect, useMemo, useRef, useState } from "react";
import { fetchLotSnapshot, lotUnitPhoto, type LotUnit } from "@/lib/lot/ownLotPage";
import { CoveredCoach } from "@/components/shell/CoveredCoach";
import {
  SEAMLESS_LOOP_PX_PER_SEC,
  SEAMLESS_LOOP_RESUME_MS,
  nextSeamlessScroll,
  shouldSeamlessLoop,
} from "@/lib/home/seamlessLoop";

const EMPTY_UNITS: LotUnit[] = [];
import {
  SHOWROOM_SPOTLIGHT,
  arrivalsForHome,
  coverVariant,
  formatHomePrice,
  lotArrivalQuery,
  requestLotUnit,
  showroomUnitLabel,
  spotlightLabel,
  spotlightLotUnit,
  spotlightSpecs,
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

function SpotlightPhoto({
  className,
  alt,
}: {
  className: string;
  alt: string;
}) {
  return (
    <img src={SHOWROOM_SPOTLIGHT.image} alt={alt} className={className} />
  );
}

export function HomeScreen({
  onOpenLot,
}: {
  onOpenLot: () => void;
}) {
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
  const title = specs?.title || spotlightLabel();
  const count = useCountUp(units ? units.length : null);
  const openSpot = () => {
    if (!spotUnit) return;
    requestLotUnit(lotArrivalQuery(spotUnit));
    onOpenLot();
  };

  const hero = (
    <>
      <div className="showroom-hero-beam" aria-hidden />
      <SpotlightPhoto className="showroom-coach" alt={SHOWROOM_SPOTLIGHT.alt} />
      <svg
        className="showroom-hero-glint"
        viewBox="0 0 788 416"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        <defs>
          <linearGradient
            id="showroom-roof-glint"
            gradientUnits="userSpaceOnUse"
            x1="63"
            y1="80"
            x2="693"
            y2="40"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="32%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="58%" stopColor="#ffffff" stopOpacity="0.72" />
            <stop offset="68%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="82%" stopColor="#ffffff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="showroom-roof-glint-soft" x="-3%" y="-40%" width="106%" height="180%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>
        <path
          d="M 63 139.5 L 73 138 L 83 135 L 93 131.7 L 103 128.3 L 113 124.7 L 123 121.3 L 133 118 L 143 114.7 L 153 111.3 L 163 108 L 173 105 L 183 101.7 L 193 98.3 L 203 95 L 213 92 L 223 89 L 233 85.7 L 243 82.3 L 253 79 L 263 76 L 273 73 L 283 70 L 293 67 L 303 63.7 L 313 60.3 L 323 56.7 L 333 53.3 L 343 49.7 L 353 46.3 L 363 43 L 373 39.7 L 383 36 L 393 32.3 L 403 29 L 413 25.7 L 423 22 L 433 18.3 L 443 15.3 L 453 13 L 463 11 L 473 9.7 L 483 8.7 L 493 8.7 L 503 9 L 513 10 L 523 11.3 L 533 13 L 543 15 L 553 16.7 L 563 18 L 573 19.3 L 583 21.3 L 593 24 L 603 27 L 613 30.3 L 623 34 L 633 38.3 L 643 43 L 653 48.7 L 663 55.7 L 673 64 L 683 74 L 693 79"
          fill="none"
          stroke="url(#showroom-roof-glint)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#showroom-roof-glint-soft)"
        />
      </svg>
      <div className="showroom-hero-pool" aria-hidden />
    </>
  );

  const placard = (
    <>
      <p data-home-count className="showroom-count">
        {count == null ? "" : count.toLocaleString("en-US")}
      </p>
      <p className="showroom-onlot">on the lot</p>
      <p className="showroom-coachline">
        <b>{title}</b>
      </p>
      {specs ? (
        <div data-home-spotlight-specs className="showroom-spotfacts">
          {specs.price ? <p className="showroom-spotprice">{specs.price}</p> : null}
          {specs.stock ? (
            <p className="showroom-spotmeta">Stock #{specs.stock}</p>
          ) : null}
          {specs.location ? (
            <p className="showroom-spotmeta">{specs.location}</p>
          ) : null}
          {specs.condition ? (
            <p className="showroom-spotmeta">{specs.condition}</p>
          ) : null}
          {specs.measure ? (
            <p className="showroom-spotmeta">{specs.measure}</p>
          ) : null}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-no-swipe
      className="showroom-home absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
    >
      {spotUnit ? (
        <button type="button" className="showroom-hero" onClick={openSpot}>
          {hero}
        </button>
      ) : (
        <div className="showroom-hero">{hero}</div>
      )}

      {spotUnit ? (
        <button
          type="button"
          className="showroom-placard showroom-card"
          data-home-placard
          onClick={openSpot}
        >
          {placard}
        </button>
      ) : (
        <section className="showroom-placard showroom-card" data-home-placard>
          {placard}
        </section>
      )}

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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const dupRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const heldRef = useRef(false);
  const resumeTimer = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const loop = shouldSeamlessLoop({ reducedMotion, overflows });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const set = setRef.current;
    if (!scroller || !set) return;
    const measure = () => {
      const styles = getComputedStyle(scroller);
      const pad =
        (Number.parseFloat(styles.paddingLeft) || 0) +
        (Number.parseFloat(styles.paddingRight) || 0);
      const next = set.offsetWidth > scroller.clientWidth - pad + 1;
      setOverflows(next);
      if (!shouldSeamlessLoop({ reducedMotion, overflows: next })) {
        scroller.scrollLeft = 0;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(set);
    return () => observer.disconnect();
  }, [reducedMotion, loop, arrivals]);

  useEffect(() => {
    if (!loop) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let raf = 0;
    let last = 0;
    // Keep the position here. Reading scrollLeft back each frame rounds
    // subpixel steps up to 1px and runs the strip too fast.
    let pos = scroller.scrollLeft;
    let wasPaused = pausedRef.current;
    const frame = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const set = setRef.current;
      const dup = dupRef.current;
      if (pausedRef.current) {
        wasPaused = true;
      } else if (set && dup) {
        if (wasPaused) {
          pos = scroller.scrollLeft;
          wasPaused = false;
        }
        const distance = dup.offsetLeft - set.offsetLeft;
        pos = nextSeamlessScroll(pos, distance, SEAMLESS_LOOP_PX_PER_SEC * dt);
        scroller.scrollLeft = pos;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [loop]);

  useEffect(() => {
    const release = () => {
      if (!heldRef.current) return;
      heldRef.current = false;
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => {
        pausedRef.current = false;
      }, SEAMLESS_LOOP_RESUME_MS);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.clearTimeout(resumeTimer.current);
    };
  }, []);

  const holdRow = () => {
    heldRef.current = true;
    pausedRef.current = true;
    window.clearTimeout(resumeTimer.current);
  };

  const pauseThenResume = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      if (!heldRef.current) pausedRef.current = false;
    }, SEAMLESS_LOOP_RESUME_MS);
  };

  const cards = (mirror: boolean) =>
    arrivals.map((unit, index) => (
      <ArrivalCard
        key={`${unit.printed.id ?? ""}-${unit.vin}-${index}`}
        unit={unit}
        mirror={mirror}
        onOpen={() => onOpenUnit(unit)}
      />
    ));

  return (
    <section data-home-arrivals className="showroom-arrivals">
      <p className="showroom-kicker">
        <i className="showroom-kicker-dot" aria-hidden />
        Newest arrivals
      </p>
      <div
        ref={scrollerRef}
        data-arrival-loop={loop ? "on" : "off"}
        className="showroom-rail overflow-x-auto"
        onPointerDown={holdRow}
        onWheel={pauseThenResume}
      >
        <div
          ref={setRef}
          className="showroom-arrival-set"
          data-arrival-set="primary"
        >
          {cards(false)}
        </div>
        {loop ? (
          <div
            ref={dupRef}
            className="showroom-arrival-set"
            data-arrival-set="duplicate"
            aria-hidden="true"
          >
            {cards(true)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ArrivalCard({
  unit,
  onOpen,
  mirror = false,
}: {
  unit: LotUnit;
  onOpen: () => void;
  mirror?: boolean;
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
      tabIndex={mirror ? -1 : undefined}
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
