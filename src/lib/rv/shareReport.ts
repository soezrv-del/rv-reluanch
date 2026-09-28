/**
 * Shareable RvFAX report — the same brochure and lot helpers the
 * in-app Facts and Lot screens use. Missing values are omitted.
 */

import type { RVSpec } from "./rvTypes.ts";
import {
  buildFactsBrochureSpecs,
} from "./factsSheet.ts";
import type { BrochureSpecs } from "./brochureSpecs.ts";
import { motorhomeOmits } from "./brochureSpecs.ts";
import {
  computeTorqueToWeight,
  POWER_TO_WEIGHT_LABEL,
} from "./torqueToWeight.ts";
import {
  LOT_GAP,
  lotLookupRows,
  lotPriceOrGap,
  lotTextOrGap,
  lotUnitPhoto,
  type LotUnit,
} from "../lot/ownLotPage.ts";

export const REPORT_SITE_URL = "https://rvmax.app";
/** Chrome sapphire R on a white rounded tile. Readable on the sapphire header. */
export const REPORT_MARK_URL = "/assets/brand/rvfax-mark.png";
/** 32×32 site icon for a shared /report link. */
export const REPORT_ICON_URL = "/assets/brand/rvfax-mark-32.png";
/** 180×180 apple touch icon for a shared /report link. */
export const REPORT_TOUCH_ICON_URL = "/assets/brand/rvfax-mark-180.png";

export function reportShareIconLinks(): Array<{
  rel: "icon" | "apple-touch-icon";
  href: string;
  type?: string;
  sizes: string;
}> {
  return [
    { rel: "icon", type: "image/png", sizes: "32x32", href: REPORT_ICON_URL },
    { rel: "apple-touch-icon", sizes: "180x180", href: REPORT_TOUCH_ICON_URL },
  ];
}
export const REPORT_SITE_LABEL = "rvmax.app";
export const REPORT_FOOTER_NOTE =
  "Specs should be confirmed on the unit sticker.";
export const REPORT_EYEBROW = "Vehicle report";

export type ReportRow = { label: string; value: string };
export type ReportSection = { title: string; rows: ReportRow[] };

export type ShareReport = {
  kind: "facts" | "unit";
  title: string;
  eyebrow: string;
  generatedLabel: string;
  photoUrl: string | null;
  headlines: ReportRow[];
  sections: ReportSection[];
  sources: string | null;
  path: string;
  shareTitle: string;
  shareText: string;
  footerNote: string;
  siteLabel: string;
  siteUrl: string;
};

const DIMENSION_KEYS = new Set([
  "vehicle_body_length",
  "length_ft",
  "vehicle_body_height",
  "height_ft",
  "vehicle_body_width",
  "width_ft",
  "max_sleeping_count",
  "sleeps",
  "number_of_slideouts",
  "slides",
  "wheelbase",
  "wheel_base",
]);

const CHASSIS_KEYS = new Set([
  "engine",
  "engine_type",
  "chassis",
  "chassis_brand",
  "fuel_type",
  "horsepower",
  "torque",
  "transmission",
  "transmission_type",
]);

const WEIGHT_KEYS = new Set([
  "gvwr",
  "dry_weight",
  "unloaded_vehicle_weight",
  "hitch_weight",
  "tongue_weight",
  "dry_hitch_weight",
  "payload",
  "standard_payload",
  "max_payload",
  "towing_capacity",
  "fuel_tank_capacity",
  "total_fresh_water_tank_capacity",
  "fresh_gal",
  "total_gray_water_tank_capacity",
  "gray_gal",
  "total_black_water_tank_capacity",
  "black_gal",
  "propane_lbs",
  "propane_gal",
]);

const SYSTEM_KEYS = new Set([
  "air_conditioning_btu",
  "air_conditioning_(btu)",
  "heater_btu",
  "heater_(btu)",
  "generator",
  "tire_size",
  "tires",
  "warranty",
]);

/** Empty, GAP, and “confirm brochure” stand-ins are not report values. */
export function isOmittedReportValue(value: string | null | undefined): boolean {
  const t = (value ?? "").trim();
  if (!t) return true;
  if (t === "—" || t === "-" || t === "–" || t === "−") return true;
  if (/^(?:gap|n\/a)$/i.test(t)) return true;
  if (/^confirm brochure/i.test(t)) return true;
  if (/^confirm (?:door|floor) sticker/i.test(t)) return true;
  if (/typ.\s*[—–-]\s*confirm/i.test(t)) return true;
  return false;
}

export function formatReportDate(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);
}

/**
 * TanStack Router JSON-encodes a numeric string, so year "2026" becomes
 * the quoted query value `"2026"`. Unwrap that, and accept a real number.
 */
export function plainQueryText(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value !== "string") return "";
  let text = value.trim();
  for (let i = 0; i < 2; i += 1) {
    if (!(text.length >= 2 && text.startsWith('"') && text.endsWith('"'))) break;
    try {
      const parsed: unknown = JSON.parse(text);
      if (typeof parsed === "number" && Number.isFinite(parsed)) {
        text = String(parsed);
        continue;
      }
      if (typeof parsed === "string") {
        text = parsed.trim();
        continue;
      }
    } catch {
      text = text.slice(1, -1).trim();
      continue;
    }
    break;
  }
  return text;
}

/** Four-digit model year, or null when the link did not include one. */
export function reportYear(value: unknown): number | null {
  const text = plainQueryText(value);
  if (!/^\d{4}$/.test(text)) return null;
  return Number(text);
}

export type FactsReportSearch = {
  make: string;
  series: string;
  year?: number;
  floorplan: string;
};

/** Route search for /report/facts. Year is a number so the URL stays year=2026. */
export function factsReportSearch(search: Record<string, unknown>): FactsReportSearch {
  const year = reportYear(search.year);
  const next: FactsReportSearch = {
    make: plainQueryText(search.make),
    series: plainQueryText(search.series),
    floorplan: plainQueryText(search.floorplan),
  };
  if (year != null) next.year = year;
  return next;
}

export function factsReportPath(q: {
  year: string | number;
  make: string;
  series: string;
  floorplan?: string;
}): string {
  const params = new URLSearchParams();
  params.set("make", plainQueryText(q.make));
  params.set("series", plainQueryText(q.series));
  params.set("year", plainQueryText(q.year));
  const floorplan = plainQueryText(q.floorplan);
  if (floorplan) params.set("floorplan", floorplan);
  return `/report/facts?${params.toString()}`;
}

export function unitReportId(unit: Pick<LotUnit, "stock_number" | "vin">): string {
  const stock = unit.stock_number.trim();
  if (stock) return stock;
  return unit.vin.trim();
}

export function unitReportPath(id: string): string {
  return `/report/unit/${encodeURIComponent(id.trim())}`;
}

export function findLotUnit(units: readonly LotUnit[], id: string): LotUnit | null {
  const want = decodeURIComponent(id).trim().toLowerCase();
  if (!want) return null;
  const byStock = units.find(
    (unit) => unit.stock_number.trim().toLowerCase() === want,
  );
  if (byStock) return byStock;
  return (
    units.find((unit) => unit.vin.trim().toLowerCase() === want) ?? null
  );
}

function pushRow(
  rows: ReportRow[],
  label: string,
  value: string | null | undefined,
) {
  if (isOmittedReportValue(value)) return;
  rows.push({ label, value: String(value).trim() });
}

function section(title: string, rows: ReportRow[]): ReportSection | null {
  if (!rows.length) return null;
  return { title, rows };
}

function takeHeadlines(candidates: Array<ReportRow | null>, max = 4): ReportRow[] {
  const out: ReportRow[] = [];
  for (const row of candidates) {
    if (!row || isOmittedReportValue(row.value)) continue;
    out.push({ label: row.label, value: row.value.trim() });
    if (out.length >= max) break;
  }
  return out;
}

function finishReport(
  partial: Omit<
    ShareReport,
    "eyebrow" | "shareTitle" | "shareText" | "footerNote" | "siteLabel" | "siteUrl"
  >,
): ShareReport {
  return {
    ...partial,
    eyebrow: REPORT_EYEBROW,
    shareTitle: partial.title,
    shareText: `${partial.title} — RvFAX vehicle report`,
    footerNote: REPORT_FOOTER_NOTE,
    siteLabel: REPORT_SITE_LABEL,
    siteUrl: REPORT_SITE_URL,
  };
}

function powerToWeightValue(specs: BrochureSpecs): string | null {
  const result = computeTorqueToWeight({
    torqueRaw: specs.torque,
    gvwrRaw: specs.gvwr,
    gvwrLbs: specs.gvwrLbs,
    uvwRaw: specs.uvwEstimated ? null : specs.uvw,
    uvwLbs: specs.uvwEstimated ? null : specs.uvwLbs,
    rvType: specs.type,
    fuelType: specs.fuelType,
    chassis: specs.chassis,
  });
  if (result.na || result.gap || result.ratio == null) return null;
  return result.ratio.toFixed(1);
}

function factsSources(specs: BrochureSpecs): string | null {
  if (specs.dataSource === "estimated") return null;
  const note = specs.accuracyNote.trim();
  if (!note || isOmittedReportValue(note)) return null;
  return note;
}

export function buildFactsShareReport(input: {
  year: string | number;
  make: string;
  series: string;
  floorplan?: string;
  spec: RVSpec;
  now?: Date;
}): ShareReport {
  const year = plainQueryText(input.year);
  const make = plainQueryText(input.make);
  const series = plainQueryText(input.series);
  const floorplan = plainQueryText(input.floorplan);
  const specs = buildFactsBrochureSpecs(
    input.spec,
    year,
    make,
    series,
    floorplan,
  );
  const omits = motorhomeOmits({
    type: specs.type,
    fuelType: specs.fuelType,
  });
  const title = [year, make, series, floorplan].filter(Boolean).join(" ");
  const power = powerToWeightValue(specs);

  const dimensions: ReportRow[] = [];
  pushRow(dimensions, "Length", specs.lengthFt);
  pushRow(dimensions, "Width", specs.exteriorWidth);
  pushRow(dimensions, "Height", specs.exteriorHeight);
  pushRow(dimensions, "Ceiling", specs.interiorHeight);
  pushRow(dimensions, "Slideouts", specs.slideouts);
  pushRow(dimensions, "Sleeps", specs.sleeps);

  const garage: ReportRow[] = [];
  if (specs.isToyHauler) {
    pushRow(garage, "Garage depth", specs.garageLength);
    pushRow(garage, "Garage width", specs.garageWidth);
    pushRow(garage, "Garage height", specs.garageHeight);
    pushRow(garage, "Ramp door", specs.rampWidth);
    pushRow(garage, "Cargo rating", specs.garageCapacity);
    pushRow(garage, "Fits", specs.garageFits);
    pushRow(garage, "Fuel station", specs.fuelStation);
  }

  const chassis: ReportRow[] = [];
  pushRow(chassis, "Fuel", specs.fuelType);
  pushRow(chassis, "Engine", specs.engine);
  pushRow(chassis, "Horsepower", specs.horsepower);
  pushRow(chassis, "Torque", specs.torque);
  pushRow(chassis, "Transmission", specs.transmission);
  pushRow(chassis, "Chassis", specs.chassis);
  pushRow(chassis, "Tow capacity", specs.hitchOrPin);
  if (!omits.mpg) pushRow(chassis, "Highway MPG", specs.mpgHighway);

  const weights: ReportRow[] = [];
  pushRow(weights, "GVWR", specs.gvwr);
  if (!specs.uvwEstimated) pushRow(weights, "UVW", specs.uvw);
  pushRow(weights, "CCC", specs.ccc);
  pushRow(weights, "Fuel capacity", specs.fuelCapacity);
  pushRow(weights, "Fresh water", specs.freshWater);
  pushRow(weights, "Gray water", specs.grayWater);
  pushRow(weights, "Black water", specs.blackWater);
  if (!omits.propane) pushRow(weights, "Propane", specs.propane);

  const systems: ReportRow[] = [];
  pushRow(systems, "Generator", specs.generator);
  pushRow(systems, "A/C", specs.acUnits);
  pushRow(systems, "Tires", specs.tireSize);
  pushRow(systems, "Warranty", specs.warranty);

  const sections = [
    section("Dimensions", dimensions),
    section("Garage", garage),
    section("Chassis and Engine", chassis),
    section("Weights and Capacities", weights),
    section("Systems", systems),
  ].filter((item): item is ReportSection => item != null);

  return finishReport({
    kind: "facts",
    title,
    generatedLabel: formatReportDate(input.now),
    photoUrl: null,
    headlines: takeHeadlines([
      valueRow("GVWR", specs.gvwr),
      valueRow("Length", specs.lengthFt),
      valueRow("Horsepower", specs.horsepower),
      power ? { label: POWER_TO_WEIGHT_LABEL, value: power } : null,
      valueRow("Engine", specs.engine),
      valueRow("Sleeps", specs.sleeps),
    ]),
    sections,
    sources: factsSources(specs),
    path: factsReportPath({ year, make, series, floorplan }),
  });
}

function valueRow(label: string, value: string | null | undefined): ReportRow | null {
  if (isOmittedReportValue(value)) return null;
  return { label, value: String(value).trim() };
}

const HEADLINE_LABELS = ["GVWR", "Length", "Horsepower", "Sleeps"] as const;

export function buildUnitShareReport(
  unit: LotUnit,
  now: Date = new Date(),
): ShareReport {
  const title =
    [unit.year, unit.make, unit.model, unit.trim]
      .map((part) => part.trim())
      .filter((part) => part && !isOmittedReportValue(part))
      .join(" ") || unit.title.trim();
  const lookup = lotLookupRows(unit);
  const identity: ReportRow[] = [];
  pushRow(identity, "VIN", lotTextOrGap(unit.vin) === LOT_GAP ? "" : unit.vin);
  pushRow(
    identity,
    "Condition",
    lotTextOrGap(unit.condition) === LOT_GAP ? "" : unit.condition,
  );
  pushRow(
    identity,
    "Location",
    lotTextOrGap(unit.location) === LOT_GAP ? "" : unit.location,
  );
  pushRow(identity, "Type", unit.body_type);

  const dimensions: ReportRow[] = [];
  const chassis: ReportRow[] = [];
  const weights: ReportRow[] = [];
  const systems: ReportRow[] = [];
  const details: ReportRow[] = [];
  for (const row of lookup) {
    if (isOmittedReportValue(row.value)) continue;
    const next = { label: row.label, value: row.value };
    if (DIMENSION_KEYS.has(row.key)) dimensions.push(next);
    else if (CHASSIS_KEYS.has(row.key)) chassis.push(next);
    else if (WEIGHT_KEYS.has(row.key)) weights.push(next);
    else if (SYSTEM_KEYS.has(row.key)) systems.push(next);
    else details.push(next);
  }

  const byLabel = new Map(lookup.map((row) => [row.label, row.value]));
  const price = lotPriceOrGap(unit.price);
  const stock = lotTextOrGap(unit.stock_number);
  const id = unitReportId(unit);

  return finishReport({
    kind: "unit",
    title,
    generatedLabel: formatReportDate(now),
    photoUrl: lotUnitPhoto(unit),
    headlines: takeHeadlines([
      valueRow("Price", price),
      valueRow("Stock number", stock),
      ...HEADLINE_LABELS.map((label) => valueRow(label, byLabel.get(label))),
    ]),
    sections: [
      section("Unit", identity),
      section("Dimensions", dimensions),
      section("Chassis and Engine", chassis),
      section("Weights and Capacities", weights),
      section("Systems", systems),
      section("Details", details),
    ].filter((item): item is ReportSection => item != null),
    sources: null,
    path: id ? unitReportPath(id) : "/report/unit",
  });
}

export function reportDescription(report: ShareReport): string {
  const bits = report.headlines.slice(0, 3).map((row) => `${row.label} ${row.value}`);
  const lead = bits.join(" · ");
  return lead ? `${report.title}. ${lead}.` : `${report.title}. RvFAX vehicle report.`;
}
