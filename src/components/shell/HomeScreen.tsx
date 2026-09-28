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
  spotlightLotUnit,
  spotlightSpecs,
} from "@/lib/home/homeCoach";

export function HomeScreen({
  onOpenLot,
  onAsk,
}: {
  onOpenLot: () => void;
  onAsk: (prompt: string) => void;
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
  const model = specs?.model || SHOWROOM_SPOTLIGHT.series;
  const slides = useMemo(() => heroSlides(listed, spotUnit), [listed, spotUnit]);
  const [slide, setSlide] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const active = slides[slide] ?? slides[0] ?? null;
  const activeIsSpot =
    !!active && !!spotUnit && active.stock_number === spotUnit.stock_number;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return;
    let id = 0;
    const arm = () => {
      window.clearInterval(id);
      id = 0;
      if (document.documentElement.getAttribute("data-theme") !== "blue") return;
      id = window.setInterval(() => {
        setSlide((n) => (n + 1) % slides.length);
      }, 5000);
    };
    arm();
    const obs = new MutationObserver(arm);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      window.clearInterval(id);
      obs.disconnect();
    };
  }, [reducedMotion, slides.length]);

  const openUnit = (unit: LotUnit) => {
    if (spotUnit && unit.stock_number === spotUnit.stock_number) {
      requestLotUnit(lotArrivalQuery(spotUnit));
    } else {
      requestLotUnit(lotArrivalQuery(unit));
    }
    onOpenLot();
  };

  return (
    <div
      data-home-screen
      data-showroom-home=""
      data-no-swipe
      className="showroom-home absolute inset-0 z-30 flex flex-col overflow-x-hidden overflow-y-auto"
    >
      <div className="home-theme-white">
        <WhiteSpotlight
          model={model}
          price={specs?.price ?? ""}
          spotStock={specs?.stock ?? ""}
          onOpen={spotUnit ? () => openUnit(spotUnit) : undefined}
        />
        {arrivals.length > 0 ? (
          <StaticArrivals
            arrivals={arrivals}
            onOpenUnit={(unit) => {
              requestLotUnit(lotArrivalQuery(unit));
              onOpenLot();
            }}
          />
        ) : null}
      </div>

      <div className="home-theme-blue">
        {active ? (
          <HomeHero
            unit={active}
            index={slide}
            count={slides.length}
            spotModel={activeIsSpot ? model : ""}
            spotPrice={activeIsSpot ? (specs?.price ?? "") : ""}
            spotStock={activeIsSpot ? (specs?.stock ?? "") : ""}
            onView={() => openUnit(active)}
            onAsk={() =>
              onAsk(
                `Tell me about the ${showroomUnitLabel(active)}, stock ${active.stock_number}.`,
              )
            }
            onDot={(i) => setSlide(i)}
          />
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
    </div>
  );
}

function WhiteSpotlight({
  model,
  price,
  spotStock,
  onOpen,
}: {
  model: string;
  price: string;
  spotStock: string;
  onOpen?: () => void;
}) {
  const hero = (
    <>
      <div className="showroom-hero-beam" aria-hidden />
      <img
        src={SHOWROOM_SPOTLIGHT.image}
        alt={SHOWROOM_SPOTLIGHT.alt}
        className="showroom-coach"
      />
      <div className="showroom-hero-pool" aria-hidden />
    </>
  );
  const placard = (
    <>
      <p className="showroom-spotmodel">{model}</p>
      {price ? <p className="showroom-spotprice">{price}</p> : null}
      {spotStock ? <p className="showroom-spotstock">Stock {spotStock}</p> : null}
    </>
  );
  return (
    <>
      {onOpen ? (
        <button type="button" className="showroom-hero" onClick={onOpen}>
          {hero}
        </button>
      ) : (
        <div className="showroom-hero">{hero}</div>
      )}
      {onOpen ? (
        <button
          type="button"
          className="showroom-placard showroom-card"
          data-home-placard
          onClick={onOpen}
        >
          {placard}
        </button>
      ) : (
        <section className="showroom-placard showroom-card" data-home-placard>
          {placard}
        </section>
      )}
    </>
  );
}

function StaticArrivals({
  arrivals,
  onOpenUnit,
}: {
  arrivals: LotUnit[];
  onOpenUnit: (unit: LotUnit) => void;
}) {
  return (
    <section data-home-arrivals className="showroom-arrivals">
      <p className="showroom-kicker">
        <i className="showroom-kicker-dot" aria-hidden />
        Newest arrivals
      </p>
      <div className="showroom-rail overflow-x-auto" data-arrival-loop="off">
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

function heroSlides(units: LotUnit[], spot: LotUnit | null): LotUnit[] {
  const withPhoto = units.filter((unit) => lotUnitPhoto(unit));
  if (!spot || !lotUnitPhoto(spot)) return withPhoto.slice(0, 8);
  const rest = withPhoto.filter((unit) => unit.stock_number !== spot.stock_number);
  return [spot, ...rest].slice(0, 8);
}

function HomeHero({
  unit,
  index,
  count,
  spotModel,
  spotPrice,
  spotStock,
  onView,
  onAsk,
  onDot,
}: {
  unit: LotUnit;
  index: number;
  count: number;
  spotModel: string;
  spotPrice: string;
  spotStock: string;
  onView: () => void;
  onAsk: () => void;
  onDot: (index: number) => void;
}) {
  const [ok, setOk] = useState(true);
  const photo = ok ? lotUnitPhoto(unit) : null;
  const name = spotModel || showroomUnitLabel(unit);
  const amount =
    spotPrice ||
    (typeof unit.price === "number" && unit.price > 0
      ? formatHomePrice(Math.round(unit.price))
      : "");

  return (
    <section className="home-hero" data-home-hero>
      <div className="home-hero-frame">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="home-hero-photo"
            onError={() => setOk(false)}
          />
        ) : (
          <span className="home-hero-photo home-hero-fallback">
            <CoveredCoach variant={coverVariant(unit)} />
          </span>
        )}
        <div className="home-hero-scrim">
          <p className="showroom-spotmodel home-hero-name">{name}</p>
          {amount ? (
            <p className="showroom-spotprice home-hero-price">{amount}</p>
          ) : null}
          {spotStock ? (
            <p className="showroom-spotstock">Stock {spotStock}</p>
          ) : null}
          <div className="home-hero-actions">
            <button type="button" className="tesla-main" onClick={onView}>
              View Details
            </button>
            <button type="button" className="tesla-secondary" onClick={onAsk}>
              Ask About It
            </button>
          </div>
        </div>
      </div>
      {count > 1 ? (
        <div className="home-hero-dots" role="tablist" aria-label="Lot photos">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => onDot(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
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
