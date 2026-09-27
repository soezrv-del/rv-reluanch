import type { ActiveCoach } from "@/lib/rv/activeCoach";
import type { LotUnit } from "@/lib/lot/ownLotPage";
import { formatMoney } from "@/lib/rv/rvCal";

/** Lot filters the chips already name. Missing length never counts as a foot class. */
export type LotFilter = "all" | "diesel-under-40" | "ft-36" | "this-store";

export function isDieselUnit(unit: LotUnit): boolean {
  const blob = [unit.fuel_type, unit.body_type, unit.engine, unit.title]
    .join(" ")
    .toLowerCase();
  return /\bdiesel\b/.test(blob);
}

export function isUnder40Feet(unit: LotUnit): boolean {
  return unit.length_ft != null && unit.length_ft > 0 && unit.length_ft < 40;
}

export function is36Footer(unit: LotUnit): boolean {
  return unit.length_ft != null && unit.length_ft >= 36 && unit.length_ft < 37;
}

export function filterLotUnits(
  units: LotUnit[],
  filter: LotFilter,
  store: string,
): LotUnit[] {
  if (filter === "all") return units;
  if (filter === "diesel-under-40") {
    return units.filter((unit) => isDieselUnit(unit) && isUnder40Feet(unit));
  }
  if (filter === "ft-36") return units.filter(is36Footer);
  const place = store.trim().toLowerCase();
  if (!place) return [];
  return units.filter(
    (unit) => unit.location.trim().toLowerCase() === place,
  );
}

export function lotFilterLabel(filter: LotFilter): string {
  if (filter === "diesel-under-40") return "Diesels under 40";
  if (filter === "ft-36") return "36-footers";
  if (filter === "this-store") return "This store";
  return "";
}

function printed(unit: LotUnit, ...keys: string[]): string {
  for (const key of keys) {
    const value = unit.printed?.[key]?.trim();
    if (value) return value;
  }
  return "";
}

/**
 * Miles the lot lookup already printed.
 * A raw 0 is unpublished (the lookup leaves it blank). Dash only then.
 */
export function unitMiles(unit: LotUnit): string {
  return printed(unit, "mileage", "odometer", "miles") || "—";
}

export function unitLength(unit: LotUnit): string {
  const fromPrint = printed(
    unit,
    "vehicle_body_length",
    "length",
    "length_ft",
  );
  if (fromPrint) return fromPrint;
  if (unit.length_ft != null && unit.length_ft > 0) {
    const n = unit.length_ft;
    const text = Number.isInteger(n)
      ? String(n)
      : String(Math.round(n * 100) / 100);
    return `${text} ft`;
  }
  return "—";
}

export function unitEngine(unit: LotUnit): string {
  return printed(unit, "engine") || unit.engine.trim() || "—";
}

export function unitRecalls(unit: LotUnit): string {
  return printed(unit, "recalls", "nhtsa_recalls") || "—";
}

export function unitOwner(unit: LotUnit): string {
  return printed(unit, "owner", "owners") || "—";
}

export function unitPrice(unit: LotUnit): string {
  if (unit.price == null || !Number.isFinite(unit.price) || unit.price <= 0) {
    return "—";
  }
  return formatMoney(unit.price);
}

export function stockLine(unit: LotUnit): string {
  const stock = unit.stock_number.trim() || "—";
  const store = unit.location.trim() || "—";
  return `${stock} · ${store}`;
}

export function lotRowTitle(unit: LotUnit): string {
  const name = [unit.model.trim(), unit.trim.trim()].filter(Boolean).join(" ");
  const place = unit.location.trim();
  const price = unitPrice(unit);
  return [name, place, price !== "—" ? price : ""].filter(Boolean).join(" · ");
}

/** Year, floorplan, stock, price — only fields the sheet actually has. */
export function deskWhisper(unit: LotUnit | null): string {
  if (!unit) return "on the lot";
  const bits = [
    unit.year.trim(),
    unit.trim.trim(),
    unit.stock_number.trim(),
    unitPrice(unit) !== "—" ? unitPrice(unit) : "",
  ].filter(Boolean);
  return bits.length ? `on the lot · ${bits.join(" · ")}` : "on the lot";
}

export function matchDeskUnit(
  units: LotUnit[],
  coach: ActiveCoach | null,
): LotUnit | null {
  if (!coach) return null;
  const floor = coach.floorplan.trim().toLowerCase();
  return (
    units.find((unit) => {
      return (
        unit.year.trim() === coach.year.trim() &&
        unit.make.trim().toLowerCase() === coach.make.trim().toLowerCase() &&
        unit.model.trim().toLowerCase() === coach.model.trim().toLowerCase() &&
        unit.trim.trim().toLowerCase() === floor
      );
    }) ?? null
  );
}
