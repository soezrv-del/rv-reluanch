import { useState } from "react";
import { CoveredCoach } from "@/components/shell/CoveredCoach";
import { lotTextOrGap, lotUnitPhoto, type LotUnit } from "@/lib/lot/ownLotPage";
import {
  arrivalsForHome,
  coverVariant,
  formatHomePrice,
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
  const meta = [
    lotTextOrGap(unit.stock_number),
    lotTextOrGap(unit.location),
    lotTextOrGap(unit.condition),
  ].join(" · ");
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
        <span className="showroom-arrival-sub">{meta}</span>
        {amount ? <span className="showroom-arrival-price">{amount}</span> : null}
      </span>
    </button>
  );
}
