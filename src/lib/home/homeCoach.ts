/**
 * Home: one fixed spotlight coach, then newest lot arrivals under it.
 * Spotlight art is a committed asset. The placard reads model number, price,
 * and stock number from the lot snapshot for `stockNumber` (or `vin`).
 * Arrival cards and the Lot listing keep each unit's own dealer photo.
 */
import {
  LOT_GAP,
  lotPriceOrGap,
  lotTextOrGap,
  type LotUnit,
} from "../lot/ownLotPage.ts";

function recency(unit: LotUnit): [number, number] {
  const date = Date.parse(unit.printed.received_date ?? "");
  const id = Number(String(unit.printed.id ?? "").replace(/,/g, ""));
  return [Number.isFinite(date) ? date : 0, Number.isFinite(id) ? id : 0];
}

/**
 * Locked showroom spotlight. The art is Entegra's factory cutout of the
 * coach, trimmed to the silhouette. `stockNumber` / `vin` point at the lot
 * unit. Model, price, and stock are read from that unit; they are not stored here.
 */
export const SHOWROOM_SPOTLIGHT = {
  year: "2026",
  make: "Entegra",
  series: "Cornerstone",
  image: "/assets/showroom/2026-entegra-cornerstone-cutout.webp",
  alt: "2026 Entegra Cornerstone",
  stockNumber: "45282",
  vin: "4UZFCTFG3TCWE7168",
} as const;

export type SpotlightIdentity = {
  year: string;
  make: string;
  series: string;
  stockNumber: string;
  vin: string;
};

/** Lot unit for the spotlight, by stock number, then VIN. */
export function spotlightLotUnit(
  units: LotUnit[],
  spot: Pick<SpotlightIdentity, "stockNumber" | "vin"> = SHOWROOM_SPOTLIGHT,
): LotUnit | null {
  const stock = spot.stockNumber.trim();
  if (stock) {
    const byStock = units.find((unit) => unit.stock_number.trim() === stock);
    if (byStock) return byStock;
  }
  const vin = spot.vin.trim().toUpperCase();
  if (!vin) return null;
  return units.find((unit) => unit.vin.trim().toUpperCase() === vin) ?? null;
}

/** Model and floorplan only. Year and make stay off the placard. */
function spotlightModelNumber(unit: LotUnit, series: string): string {
  const model = unit.model.trim() || series.trim();
  const trim = unit.trim.trim();
  const trimInModel =
    trim.length > 0 && model.toLowerCase().includes(trim.toLowerCase());
  return [model, trimInModel ? "" : trim].filter(Boolean).join(" ");
}

export type SpotlightSpecs = {
  model: string;
  price: string;
  stock: string;
};

function shown(value: string): string {
  return value && value !== LOT_GAP ? value : "";
}

/**
 * Placard lines from the lot record. Empty price or stock means that line
 * is omitted. Model falls back to the spotlight series when the unit has none.
 */
export function spotlightSpecs(
  unit: LotUnit,
  spot: Pick<SpotlightIdentity, "series"> = SHOWROOM_SPOTLIGHT,
): SpotlightSpecs {
  return {
    model: spotlightModelNumber(unit, spot.series),
    price: shown(lotPriceOrGap(unit.price)),
    stock: shown(lotTextOrGap(unit.stock_number)),
  };
}

export type SpotlightCardCell = { value: string; label: string };

function feetInches(ft: number): string {
  const whole = Math.floor(ft + 1e-9);
  let inches = Math.round((ft - whole) * 12);
  if (inches === 12) return `${whole + 1} ft`;
  if (inches <= 0) return `${whole} ft`;
  return `${whole} ft ${inches} in`;
}

/** Dark home spec card. Locked 2×2: Length, Engine, Slides, Fuel. */
export function spotlightCard(unit: LotUnit): SpotlightCardCell[] {
  const year = Number(unit.year);
  const plan = `${unit.trim} ${unit.model}`;
  const cornerstone =
    year === 2026 &&
    /entegra/i.test(unit.make) &&
    /cornerstone/i.test(unit.model) &&
    /\b45d\b/i.test(plan);

  const length =
    unit.length_ft != null && unit.length_ft > 0 ? feetInches(unit.length_ft) : "";
  const hpRaw = `${unit.printed.horsepower || ""} ${unit.engine || ""}`;
  const hpHit = hpRaw.match(/(\d{2,4})\s*hp\b/i);
  const hp = hpHit ? Number(hpHit[1]) : NaN;
  const engine = hp >= 100 && hp <= 800 ? `${hp} hp` : cornerstone ? "605 hp" : "";
  const slides =
    unit.slides != null && unit.slides > 0
      ? String(unit.slides)
      : cornerstone
        ? "4"
        : "";
  const fuel = unit.fuel_type.trim() || (cornerstone ? "Diesel" : "");

  const cells: SpotlightCardCell[] = [];
  if (length) cells.push({ value: length, label: "LENGTH" });
  if (engine) cells.push({ value: engine, label: "ENGINE" });
  if (slides) cells.push({ value: slides, label: "SLIDES" });
  if (fuel) cells.push({ value: fuel, label: "FUEL" });
  return cells;
}

/** How many recent lot arrivals Home shows under the hero. */
export const NEWEST_ARRIVALS = 6;

/** Newest received_date first. Id breaks ties. Capped. */
export function newestArrivals(
  units: LotUnit[],
  limit = NEWEST_ARRIVALS,
): LotUnit[] {
  const n = Math.max(0, Math.floor(limit));
  return [...units]
    .sort((a, b) => {
      const ka = recency(a);
      const kb = recency(b);
      if (kb[0] !== ka[0]) return kb[0] - ka[0];
      return kb[1] - ka[1];
    })
    .slice(0, n);
}

/** Search text that finds this unit on the existing lot page. */
export function lotArrivalQuery(unit: LotUnit): string {
  const stock = unit.stock_number.trim();
  if (stock) return stock;
  const vin = unit.vin.trim();
  if (vin) return vin;
  return [unit.year, unit.make, unit.model, unit.trim]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

/** Which covered-coach drawing to use when a unit has no photo. Stable per unit. */
export function coverVariant(unit: LotUnit): 0 | 1 | 2 {
  const key = `${unit.stock_number}|${unit.vin}|${unit.printed.id ?? ""}`;
  let hash = 2166136261;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 3) as 0 | 1 | 2;
}

export const LOT_UNIT_OPEN_EVENT = "rvfox-open-lot-unit";

let pendingLotQuery = "";

export function requestLotUnit(query: string): void {
  pendingLotQuery = query.trim();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LOT_UNIT_OPEN_EVENT));
  }
}

export function takePendingLotQuery(): string {
  const query = pendingLotQuery;
  pendingLotQuery = "";
  return query;
}

export function lotCoachName(unit: LotUnit): string {
  const title = unit.title.trim();
  if (title) return title;
  return [unit.year, unit.make, unit.model, unit.trim].filter((p) => p.trim()).join(" ");
}

export function formatHomePrice(price: number | null): string {
  if (price == null) return "";
  return `$${price.toLocaleString("en-US")}`;
}

/** Year, make, model, and floorplan — the line on a Newest Arrival card. */
export function showroomUnitLabel(unit: LotUnit): string {
  const year = unit.year.trim();
  const make = unit.make.trim();
  const model = unit.model.trim();
  const trim = unit.trim.trim();
  const trimInModel =
    trim.length > 0 && model.toLowerCase().includes(trim.toLowerCase());
  const parts = [year, make, model, trimInModel ? "" : trim].filter(Boolean);
  return parts.join(" ") || lotCoachName(unit);
}

/** Newest arrivals under the locked spotlight. The strip does not drop a unit for the hero. */
export function arrivalsForHome(units: LotUnit[]): LotUnit[] {
  return newestArrivals(units, NEWEST_ARRIVALS);
}
