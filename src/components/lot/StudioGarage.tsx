import { lotPriceOrGap, lotUnitPhoto, type LotUnit } from "@/lib/lot/ownLotPage";
import { homeStudioPlate, studioCardName, studioLength } from "@/lib/home/homeCoach";

/**
 * Saved lot coaches, stacked the way the studio pictures show them.
 * Every card is a real stock number. An empty garage stays empty.
 */
export function StudioGarage({
  units,
  comparing,
  onOpen,
  onRemove,
  onToggleCompare,
}: {
  units: LotUnit[];
  comparing: boolean;
  onOpen: (unit: LotUnit) => void;
  onRemove: (stock: string) => void;
  onToggleCompare: () => void;
}) {
  const front = units[0] ?? null;
  const back = units[1] ?? null;
  const rest = units.slice(2);

  return (
    <div className="studio-garage" data-studio-garage>
      {units.length === 0 ? (
        <p className="studio-garage-empty">
          Nothing saved yet. Tap Save on a coach in Search and it lands here with its real price.
        </p>
      ) : (
        <div className={`studio-garage-stage${back ? " has-back" : ""}`}>
          {back ? (
            <GarageCard unit={back} place="back" onOpen={onOpen} onRemove={onRemove} />
          ) : null}
          {front ? (
            <GarageCard unit={front} place="front" onOpen={onOpen} onRemove={onRemove} />
          ) : null}
          {units.length >= 2 ? (
            <button
              type="button"
              className="studio-compare-btn"
              aria-pressed={comparing}
              onClick={onToggleCompare}
            >
              Compare
            </button>
          ) : null}
        </div>
      )}

      {rest.length ? (
        <ul className="studio-garage-rest">
          {rest.map((unit) => (
            <li key={unit.stock_number}>
              <button type="button" onClick={() => onOpen(unit)}>
                <span>{studioCardName(unit)}</span>
                <span>{lotPriceOrGap(unit.price)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {comparing && units.length >= 2 ? (
        <div className="studio-compare" data-studio-compare>
          {units.map((unit) => {
            const plate = homeStudioPlate(unit);
            const where = unit.location.trim();
            return (
              <article key={unit.stock_number} className="studio-compare-card">
                <h2>{studioCardName(unit)}</h2>
                <p className="studio-compare-price">{lotPriceOrGap(unit.price)}</p>
                {where ? <p className="studio-compare-where">{where}</p> : null}
                <p className="studio-compare-sub">
                  {[unit.year.trim(), studioLength(unit.length_ft), unit.stock_number.trim()]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {plate.length ? (
                  <div className="showroom-plate">
                    {plate.map((cell) => (
                      <div className="showroom-plate-cell" key={cell.label}>
                        <p className="showroom-plate-label">{cell.label}</p>
                        <p className="showroom-plate-value">{cell.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function GarageCard({
  unit,
  place,
  onOpen,
  onRemove,
}: {
  unit: LotUnit;
  place: "front" | "back";
  onOpen: (unit: LotUnit) => void;
  onRemove: (stock: string) => void;
}) {
  const photo = lotUnitPhoto(unit);
  const name = studioCardName(unit);
  return (
    <article className={`studio-garage-card is-${place}`}>
      <button type="button" className="studio-garage-hit" onClick={() => onOpen(unit)}>
        <span className="studio-garage-glow" aria-hidden />
        {photo ? <img src={photo} alt="" className="studio-garage-photo" /> : null}
        <span className="studio-garage-plaque">
          <span className="studio-garage-name">{name}</span>
          <span className="studio-garage-price">{lotPriceOrGap(unit.price)}</span>
        </span>
      </button>
      <button
        type="button"
        className="studio-garage-remove"
        aria-label={`Remove ${name} from your garage`}
        onClick={() => onRemove(unit.stock_number.trim())}
      >
        Remove
      </button>
    </article>
  );
}
