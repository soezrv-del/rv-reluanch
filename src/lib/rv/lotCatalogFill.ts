/**
 * Fill empty catalog / Facts fields from RV Country lot unit records.
 *
 * Year + make + model + floorplan only. Units must agree on a printed number.
 * One 337RLS does not become a Reflection class average. OEM / brochure pins
 * win. Tank counts 1–4 never become gallons or pounds. Never convert lb ↔ gal.
 */

import { floorplanTokensAlign } from "../lot/lotSearch.ts";
import {
  applyLotSpecsToBrochure,
  lotPublishedFromRow,
  type LotFactsMerge,
  type LotPublishedSpecs,
} from "./lotFactsFallback.ts";
import type { BrochureSpecs } from "./brochureSpecs.ts";

export type LotCoachIdentity = {
  year?: string | number | null;
  make?: string | null;
  model?: string | null;
  trim?: string | null;
  title?: string | null;
};

const NUM_FIELDS = [
  "gvwrLbs",
  "dryWeightLbs",
  "hitchLbs",
  "payloadLbs",
  "lengthFt",
  "heightFt",
  "widthFt",
  "sleeps",
  "slides",
  "freshGal",
  "grayGal",
  "blackGal",
  "propaneLbs",
  "propaneGal",
] as const satisfies readonly (keyof LotPublishedSpecs)[];

const TEXT_FIELDS = ["engine", "chassis", "fuelType"] as const satisfies readonly (keyof LotPublishedSpecs)[];

function norm(value: string | null | undefined): string {
  return (value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function compact(value: string | null | undefined): string {
  return (value || "").toLowerCase().replace(/[\s\-_/]/g, "");
}

function yearOf(value: string | number | null | undefined): string {
  return String(value ?? "").trim();
}

function nameOverlaps(haystack: string, needle: string): boolean {
  const h = norm(haystack);
  const n = norm(needle);
  if (!h || !n) return false;
  if (h === n || h.includes(n) || n.includes(h)) return true;
  const ht = new Set(h.split(" ").filter((t) => t.length >= 3));
  return n.split(" ").filter((t) => t.length >= 3).some((t) => ht.has(t));
}

export function coachMatchesLotUnit(
  unit: LotCoachIdentity,
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): boolean {
  if (yearOf(unit.year) !== yearOf(year)) return false;
  const blob = `${unit.make || ""} ${unit.model || ""} ${unit.title || ""}`;
  if (!nameOverlaps(blob, make)) return false;
  if (!nameOverlaps(`${unit.model || ""} ${unit.title || ""}`, model)) return false;
  const fp = compact(floorplan);
  if (!fp) return false;
  const trim = compact(unit.trim);
  const modelTrim = compact(`${unit.model || ""}${unit.trim || ""}`);
  if (floorplanTokensAlign(fp, unit.trim || "")) return true;
  if (trim && (trim === fp || trim.endsWith(fp) || fp.endsWith(trim))) return true;
  if (modelTrim.includes(fp)) return true;
  return false;
}

export function findLotRowsForCoach<T extends LotCoachIdentity>(
  units: T[],
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): T[] {
  if (!yearOf(year) || !norm(make) || !norm(model) || !compact(floorplan)) {
    return [];
  }
  return units.filter((unit) =>
    coachMatchesLotUnit(unit, year, make, model, floorplan),
  );
}

function rounded(value: number): number {
  return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
}

function agreeNumber(values: Array<number | null | undefined>): number | null {
  const nums = values.filter((n): n is number => n != null && Number.isFinite(n));
  if (!nums.length) return null;
  const first = rounded(nums[0]!);
  return nums.every((n) => rounded(n) === first) ? first : null;
}

function agreeText(values: Array<string | null | undefined>): string | null {
  const texts = values.map((v) => (v || "").trim()).filter(Boolean);
  if (!texts.length) return null;
  const first = texts[0]!.toLowerCase();
  return texts.every((t) => t.toLowerCase() === first) ? texts[0]! : null;
}

/** Same printed number across matching lot units — else leave the hole. */
export function agreeingLotSpecs(
  units: Array<LotCoachIdentity & Record<string, unknown>>,
): LotPublishedSpecs | null {
  if (!units.length) return null;
  const rows = units.map((unit) => lotPublishedFromRow(unit));
  const out: LotPublishedSpecs = {};
  let any = false;
  for (const key of NUM_FIELDS) {
    const n = agreeNumber(rows.map((row) => row[key] as number | null | undefined));
    if (n != null) {
      (out as Record<string, number | null>)[key] = n;
      any = true;
    }
  }
  for (const key of TEXT_FIELDS) {
    const t = agreeText(rows.map((row) => row[key] as string | null | undefined));
    if (t) {
      (out as Record<string, string | null>)[key] = t;
      any = true;
    }
  }
  return any ? out : null;
}

export function lotSpecsForCoach(
  units: Array<LotCoachIdentity & Record<string, unknown>>,
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): LotPublishedSpecs | null {
  return agreeingLotSpecs(findLotRowsForCoach(units, year, make, model, floorplan));
}

/** Apply agreeing lot numbers onto a brochure sheet. Pins still win. */
export function fillBrochureHolesFromLot(
  specs: BrochureSpecs,
  units: Array<LotCoachIdentity & Record<string, unknown>>,
  year: string | number,
  make: string,
  model: string,
  floorplan: string,
): LotFactsMerge {
  return applyLotSpecsToBrochure(
    specs,
    lotSpecsForCoach(units, year, make, model, floorplan),
  );
}
