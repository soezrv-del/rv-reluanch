/**
 * Spec-fallback can scrape a length/width as gallons (24.1) or a placeholder
 * 100 gal black. Printed brochure / lot tanks are whole gallons or .5.
 */

import type { SpecFieldFill, SpecFieldKey } from "./specFieldFallback.ts";

const WATER_FIELDS: readonly SpecFieldKey[] = [
  "freshWater",
  "grayWater",
  "blackWater",
];

export function tankGallonLooksPrinted(value: number): boolean {
  if (!Number.isFinite(value) || value <= 4) return false;
  const tenths = Math.round((value - Math.floor(value)) * 10);
  return tenths === 0 || tenths === 5;
}

export function isImplausibleWaterFill(
  field: SpecFieldKey,
  value: number,
): boolean {
  if (!WATER_FIELDS.includes(field)) return false;
  return !tankGallonLooksPrinted(value);
}

/** 100 gal black next to a tiny/implausible gray is a scrape placeholder. */
export function isPlaceholderBlackHundred(
  fills: readonly SpecFieldFill[],
): boolean {
  const black = fills.find((f) => f.field === "blackWater" && f.unit === "gal");
  if (!black || black.value !== 100) return false;
  const gray = fills.find((f) => f.field === "grayWater" && f.unit === "gal");
  if (!gray) return true;
  return isImplausibleWaterFill("grayWater", gray.value) || gray.value < 30;
}

export function rejectImplausibleSpecFills(
  fills: readonly SpecFieldFill[],
): SpecFieldFill[] {
  const dropBlack100 = isPlaceholderBlackHundred(fills);
  return fills.filter((fill) => {
    if (fill.unit === "gal" && isImplausibleWaterFill(fill.field, fill.value)) {
      return false;
    }
    if (dropBlack100 && fill.field === "blackWater") return false;
    return true;
  });
}
