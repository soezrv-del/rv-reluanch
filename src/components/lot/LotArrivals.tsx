import { useState } from "react";
import { CoveredCoach } from "@/components/shell/CoveredCoach";
import {
  lotCardMiles,
  lotPriceOrGap,
  lotTextOrGap,
  lotUnitPhoto,
  shortLotTypeLabel,
  type LotUnit,
} from "@/lib/lot/ownLotPage";
import { cn } from "@/lib/utils";
import {
  arrivalsForHome,
  coverVariant,
  showroomUnitLabel,
} from "@/lib/home/homeCoach";

export function LotArrivals({
  units,
  onOpenUnit,
}: {
  units: LotUnit[];
  onOpenUnit: (unit: LotUnit) => void;
}) {
  const arrivals = arrivalsForHome(units);
  if (arrivals.length === 0) return null;
  return (
    <section data-lot-arrivals className="showroom-arrivals lot-arrivals">
      <p className="showroom-kicker">Newest arrivals</p>
      <div data-arrival-loop="off" className="showroom-rail overflow-x-auto">
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

/**
 * Same face as the lot list cards in LotStockApp (`LotUnitCard`, rail size):
 * lot-card shell, lot-well photo, type badge, price on the photo, then the
 * lot-unit-title / lot-unit-meta pair. Only the row width differs (cards.css).
 * No photo → the covered-coach drawing, never a stand-in photo.
 */
function ArrivalCard({
  unit,
  onOpen,
}: {
  unit: LotUnit;
  onOpen: () => void;
}) {
  const [ok, setOk] = useState(true);
  const photo = ok ? lotUnitPhoto(unit) : null;
  const name = showroomUnitLabel(unit).trim() || "GAP";
  const price = lotPriceOrGap(unit.price);
  const miles = lotCardMiles(unit);
  const meta = [
    lotTextOrGap(unit.stock_number),
    lotTextOrGap(unit.location),
    lotTextOrGap(unit.condition),
    ...(miles ? [miles] : []),
  ].join(" · ");

  return (
    <article
      className="lot-card lot-arrival glass-prestige overflow-hidden rounded-[var(--radius-2xl)]"
      data-lot-arrival
    >
      <button
        type="button"
        onClick={onOpen}
        className="lot-card-hit w-full text-left transition duration-200 ease-out active:scale-[0.995]"
      >
        <div
          className="lot-well relative overflow-hidden is-rail"
          data-lot-scene={photo ? "photo" : "empty"}
        >
          {photo ? (
            <img
              src={photo}
              alt=""
              className="lot-photo"
              loading="lazy"
              decoding="async"
              onError={() => setOk(false)}
            />
          ) : (
            <span className="lot-arrival-cover">
              <CoveredCoach variant={coverVariant(unit)} />
            </span>
          )}
          <span className="lot-arrival-badge absolute left-3 top-3 rounded-full bg-sapphire px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
            {shortLotTypeLabel(unit.body_type)}
          </span>
          <span
            className={cn(
              "absolute right-3 top-3 text-[15px] font-bold tabular-nums text-prestige",
              price === "GAP" && "text-white/55",
            )}
          >
            {price}
          </span>
        </div>
        <div className="min-w-0 space-y-1.5 px-4 py-3">
          <p className="lot-unit-title is-rail lot-arrival-title">
            {name}
          </p>
          <p className="lot-unit-meta lot-arrival-meta">{meta}</p>
        </div>
      </button>
    </article>
  );
}
