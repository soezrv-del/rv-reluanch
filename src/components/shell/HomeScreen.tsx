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
      <div className="showroom-hero-wash" aria-hidden />
      <SpotlightPhoto className="showroom-coach" alt={SHOWROOM_SPOTLIGHT.alt} />
      <svg
        className="showroom-hero-glint"
        viewBox="0 0 796 423"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        <defs>
          <filter
            id="showroom-roof-glint"
            x="-6%"
            y="-10%"
            width="112%"
            height="124%"
            colorInterpolationFilters="sRGB"
          >
            <feMorphology in="SourceAlpha" operator="erode" radius="4" result="inset" />
            <feMorphology in="SourceAlpha" operator="erode" radius="20" result="deep" />
            <feComposite in="inset" in2="deep" operator="out" result="band" />
            <feGaussianBlur in="band" stdDeviation="2.4" result="soft" />
            <feFlood floodColor="#ffffff" floodOpacity="0.46" result="wash" />
            <feComposite in="wash" in2="soft" operator="in" />
          </filter>
        </defs>
        <image
          href={SHOWROOM_SPOTLIGHT.image}
          width="796"
          height="423"
          filter="url(#showroom-roof-glint)"
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
