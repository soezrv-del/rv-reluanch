/**
 * Home: one fixed spotlight coach, then newest lot arrivals under it.
 * Spotlight art is a committed asset. Arrival photos come only from
 * lotUnitPhoto — never a stock or generated image.
 */
import { lotUnitPhoto, type LotUnit } from "../lot/ownLotPage.ts";
import {
  formatActiveCoachChip,
  type ActiveCoach,
} from "../rv/activeCoach.ts";

export type HomeCoach = {
  name: string;
  price: number | null;
  photo: string | null;
};

function looseName(a: string, b: string): boolean {
  const x = a.trim().toLowerCase();
  const y = b.trim().toLowerCase();
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

function sameCoach(unit: LotUnit, coach: ActiveCoach): boolean {
  if (unit.year.trim() !== coach.year.trim()) return false;
  if (!looseName(unit.make, coach.make)) return false;
  if (!looseName(unit.model, coach.model)) return false;
  const floor = coach.floorplan.trim();
  if (!floor) return true;
  return looseName(unit.trim, floor) || looseName(unit.title, floor);
}

function positivePrice(n: number | null | undefined): number | null {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

function recency(unit: LotUnit): [number, number] {
  const date = Date.parse(unit.printed.received_date ?? "");
  const id = Number(String(unit.printed.id ?? "").replace(/,/g, ""));
  return [Number.isFinite(date) ? date : 0, Number.isFinite(id) ? id : 0];
}

/** Later received_date wins; id breaks ties. Array order is not recency. */
export function newestLotUnit(units: LotUnit[]): LotUnit | null {
  let best: LotUnit | null = null;
  let bestKey: [number, number] = [-1, -1];
  for (const unit of units) {
    const key = recency(unit);
    if (key[0] > bestKey[0] || (key[0] === bestKey[0] && key[1] > bestKey[1])) {
      best = unit;
      bestKey = key;
    }
  }
  return best;
}

/**
 * Locked showroom spotlight. Swap this object to change the hero.
 * `make` is the card name ("Entegra"); Facts resolves it to the catalog make.
 * No price, GVWR, length, or engine — those stay on the Facts report.
 */
export const SHOWROOM_SPOTLIGHT = {
  year: "2026",
  make: "Entegra",
  series: "Cornerstone",
  image: "/assets/showroom/2026-entegra-cornerstone.webp",
  alt: "2026 Entegra Cornerstone",
} as const;

export function spotlightLabel(
  spot: { year: string; make: string; series: string } = SHOWROOM_SPOTLIGHT,
): string {
  return [spot.year, spot.make, spot.series].filter(Boolean).join(" ");
}

/** JPEG sibling of the webp hero, used as the picture fallback. */
export function spotlightJpegPath(image = SHOWROOM_SPOTLIGHT.image): string {
  return image.replace(/\.webp$/i, ".jpg");
}

export type SpotlightFacts = {
  year: string;
  make: string;
  model: string;
};

type SpotlightIndex = Record<string, Record<string, { years?: number[] } | undefined>>;

/** Catalog year + make + series, or null when that coach is not listed. */
export function spotlightFactsTarget(
  spot: { year: string; make: string; series: string } = SHOWROOM_SPOTLIGHT,
  index: SpotlightIndex,
): SpotlightFacts | null {
  const raw = spot.make.trim();
  const wanted = raw.toLowerCase();
  const make = index[raw]
    ? raw
    : Object.keys(index).find((key) => {
        const name = key.toLowerCase();
        return name === wanted || name.startsWith(`${wanted} `);
      });
  if (!make) return null;
  const spec = index[make]?.[spot.series];
  if (!spec) return null;
  const year = Number(spot.year);
  if (!Number.isFinite(year) || !spec.years?.includes(year)) return null;
  return { year: spot.year, make, model: spot.series };
}

export const SPOTLIGHT_FACTS_EVENT = "rvfox-open-spotlight-facts";

let pendingSpotlightFacts: SpotlightFacts | null = null;

export function requestSpotlightFacts(target: SpotlightFacts): void {
  pendingSpotlightFacts = target;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SPOTLIGHT_FACTS_EVENT));
  }
}

export function takePendingSpotlightFacts(): SpotlightFacts | null {
  const target = pendingSpotlightFacts;
  pendingSpotlightFacts = null;
  return target;
}

/** How many recent lot arrivals Home shows under the hero. */
export const NEWEST_ARRIVALS = 6;

/** Newest received_date first. Same clock as newestLotUnit. Capped. */
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

export function arrivalLabel(unit: LotUnit): string {
  const parts = [unit.year, unit.make, unit.model]
    .map((part) => part.trim())
    .filter(Boolean);
  return parts.join(" ") || lotCoachName(unit);
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

/** Year, make, model, and floorplan — the line under the lot count. */
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

export function sameLotUnit(a: LotUnit, b: LotUnit): boolean {
  const stock = a.stock_number.trim();
  if (stock && stock === b.stock_number.trim()) return true;
  const vin = a.vin.trim();
  if (vin && vin === b.vin.trim()) return true;
  const id = String(a.printed.id ?? "").trim();
  if (id && id === String(b.printed.id ?? "").trim()) return true;
  return false;
}

export type ShowroomStage = {
  name: string;
  price: number | null;
  photo: string | null;
  unit: LotUnit | null;
};

/**
 * Spotlight coach: the last lookup when that unit has a lot photo,
 * otherwise the newest own-lot unit that has a real photo.
 * The label is always that unit's year / make / model.
 */
export function pickShowroomStage(
  active: ActiveCoach | null,
  units: LotUnit[],
): ShowroomStage {
  const resolved = resolveHomeCoach(active, units);
  if (active) {
    const matches = units.filter((unit) => sameCoach(unit, active));
    const withPhoto = matches.find((unit) => lotUnitPhoto(unit));
    if (withPhoto) {
      return {
        name: showroomUnitLabel(withPhoto),
        price: positivePrice(withPhoto.price) ?? resolved?.price ?? null,
        photo: lotUnitPhoto(withPhoto),
        unit: withPhoto,
      };
    }
  }
  const photographed = newestArrivals(units, units.length).find((unit) =>
    lotUnitPhoto(unit),
  );
  if (photographed) {
    return {
      name: showroomUnitLabel(photographed),
      price: positivePrice(photographed.price),
      photo: lotUnitPhoto(photographed),
      unit: photographed,
    };
  }
  const newest = newestLotUnit(units);
  if (newest) {
    return {
      name: showroomUnitLabel(newest),
      price: positivePrice(newest.price),
      photo: null,
      unit: newest,
    };
  }
  return {
    name: resolved?.name ?? "",
    price: resolved?.price ?? null,
    photo: resolved?.photo ?? null,
    unit: null,
  };
}

/** Newest arrivals, skipping the coach already standing in the spotlight. */
export function arrivalsForHome(units: LotUnit[], hero: LotUnit | null): LotUnit[] {
  const rows = newestArrivals(units, NEWEST_ARRIVALS + (hero ? 1 : 0));
  const next = hero ? rows.filter((unit) => !sameLotUnit(unit, hero)) : rows;
  return next.slice(0, NEWEST_ARRIVALS);
}

export function resolveHomeCoach(
  active: ActiveCoach | null,
  units: LotUnit[],
): HomeCoach | null {
  if (active) {
    const matches = units.filter((unit) => sameCoach(unit, active));
    const withPhoto = matches.find((unit) => lotUnitPhoto(unit));
    const match = withPhoto ?? matches[0] ?? null;
    return {
      name: formatActiveCoachChip(active),
      price: positivePrice(active.price) ?? positivePrice(match?.price),
      photo: match ? lotUnitPhoto(match) : null,
    };
  }
  const unit = newestLotUnit(units);
  if (!unit) return null;
  return {
    name: lotCoachName(unit),
    price: positivePrice(unit.price),
    photo: lotUnitPhoto(unit),
  };
}
