/**
 * Home hero: last Facts lookup, otherwise the newest lot-sheet unit.
 * Photos come only from lotUnitPhoto — never a stock or generated image.
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

export function lotCoachName(unit: LotUnit): string {
  const title = unit.title.trim();
  if (title) return title;
  return [unit.year, unit.make, unit.model, unit.trim].filter((p) => p.trim()).join(" ");
}

export function formatHomePrice(price: number | null): string {
  if (price == null) return "";
  return `$${price.toLocaleString("en-US")}`;
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
