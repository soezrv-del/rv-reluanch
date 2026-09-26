/**
 * Walk every catalog unit in floorplanSpecs (year-range pins included)
 * and write blank spec fields to data/batch-fill/gaps.json and gaps.csv.
 *
 * A unit is one make / model / floorplan / year-range. Rows that share
 * that key are merged. A field is a gap when it is missing, empty, or 0.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  listOemFloorplanRows,
  listOemGvwrPins,
  listOemTankPins,
  listOemUvwPins,
} from "../../src/lib/rv/floorplanSpecs.ts";

const SPEC_FIELDS = [
  "uvwLbs",
  "gvwrLbs",
  "length",
  "exteriorHeightIn",
  "exteriorWidthIn",
  "interiorHeightIn",
  "sleeps",
  "dryWeightLbs",
  "hitchLbs",
  "fuelCapacityGal",
  "freshWater",
  "grayWater",
  "blackWater",
  "propaneLbs",
  "propaneGal",
  "waterHeaterGal",
  "cargoLbs",
  "garageLengthFt",
  "garageWidthFt",
  "garageHeightIn",
  "garageCapacityLbs",
  "rampPatioLbs",
  "fuelStationGal",
  "axles",
  "tireSize",
  "slideouts",
] as const;

type SpecField = (typeof SPEC_FIELDS)[number];

type Unit = {
  make: string;
  model: string;
  floorplan: string;
  yearMin: number;
  yearMax: number;
  values: Partial<Record<SpecField, unknown>>;
};

export type GapRow = {
  year: number | "";
  yearRange: string;
  make: string;
  model: string;
  floorplan: string;
  field: SpecField;
  currentValue: "";
};

export type GapReport = {
  unitCount: number;
  gapCount: number;
  byField: Record<string, number>;
  gaps: GapRow[];
};

function isBlank(value: unknown): boolean {
  if (value == null) return true;
  if (typeof value === "number") return !Number.isFinite(value) || value <= 0;
  if (typeof value === "string") return value.trim() === "";
  return false;
}

function unitKey(unit: Pick<Unit, "make" | "model" | "floorplan" | "yearMin" | "yearMax">): string {
  return [
    unit.make.trim().toLowerCase(),
    unit.model.trim().toLowerCase(),
    unit.floorplan.trim().toUpperCase().replace(/[\s-]+/g, ""),
    unit.yearMin,
    unit.yearMax,
  ].join("|");
}

function blankValues(): Partial<Record<SpecField, unknown>> {
  return {};
}

function put(values: Partial<Record<SpecField, unknown>>, field: SpecField, value: unknown) {
  if (isBlank(value)) return;
  if (!isBlank(values[field])) return;
  values[field] = value;
}

export function collectCatalogUnits(): Unit[] {
  const map = new Map<string, Unit>();
  const ensure = (
    make: string,
    model: string,
    floorplan: string,
    yearMin: number,
    yearMax: number,
  ): Unit => {
    const draft = { make, model, floorplan, yearMin, yearMax, values: blankValues() };
    const key = unitKey(draft);
    const hit = map.get(key);
    if (hit) return hit;
    map.set(key, draft);
    return draft;
  };

  for (const row of listOemFloorplanRows()) {
    const unit = ensure(
      row.makeIncludes,
      row.modelIncludes,
      row.floorplan,
      row.yearMin,
      row.yearMax,
    );
    const spec = row.spec;
    put(unit.values, "uvwLbs", spec.uvwLbs);
    put(unit.values, "gvwrLbs", spec.gvwrLbs);
    put(unit.values, "length", spec.overallLengthIn || spec.lengthDisplay);
    put(unit.values, "exteriorHeightIn", spec.exteriorHeightIn);
    put(unit.values, "exteriorWidthIn", spec.exteriorWidthIn);
    put(unit.values, "interiorHeightIn", spec.interiorHeightIn);
    put(unit.values, "sleeps", spec.sleeps);
    put(unit.values, "dryWeightLbs", spec.dryWeightLbs);
    put(unit.values, "hitchLbs", spec.hitchLbs);
    put(unit.values, "fuelCapacityGal", spec.fuelCapacityGal);
    put(unit.values, "freshWater", spec.freshWater);
    put(unit.values, "grayWater", spec.grayWater);
    put(unit.values, "blackWater", spec.blackWater);
    put(unit.values, "propaneLbs", spec.propaneLbs);
    put(unit.values, "propaneGal", spec.propaneGal);
    put(unit.values, "waterHeaterGal", spec.waterHeaterGal);
    put(unit.values, "cargoLbs", spec.cargoLbs);
    put(unit.values, "garageLengthFt", spec.garageLengthFt);
    put(unit.values, "garageWidthFt", spec.garageWidthFt);
    put(unit.values, "garageHeightIn", spec.garageHeightIn);
    put(unit.values, "garageCapacityLbs", spec.garageCapacityLbs);
    put(unit.values, "rampPatioLbs", spec.rampPatioLbs);
    put(unit.values, "fuelStationGal", spec.fuelStationGal);
    put(unit.values, "axles", spec.axles);
    put(unit.values, "tireSize", spec.tireSize);
    put(unit.values, "slideouts", spec.slideouts);
  }

  for (const row of listOemUvwPins()) {
    const unit = ensure(row.makeIncludes, row.modelIncludes, row.floorplan, row.yearMin, row.yearMax);
    put(unit.values, "uvwLbs", row.uvwLbs);
  }
  for (const row of listOemGvwrPins()) {
    const unit = ensure(row.makeIncludes, row.modelIncludes, row.floorplan, row.yearMin, row.yearMax);
    put(unit.values, "gvwrLbs", row.gvwrLbs);
  }
  for (const row of listOemTankPins()) {
    const unit = ensure(row.makeIncludes, row.modelIncludes, row.floorplan, row.yearMin, row.yearMax);
    put(unit.values, "freshWater", row.freshWater);
    put(unit.values, "grayWater", row.grayWater);
    put(unit.values, "blackWater", row.blackWater);
    put(unit.values, "fuelCapacityGal", row.fuelCapacityGal);
  }

  const units = [...map.values()].sort((a, b) => unitKey(a).localeCompare(unitKey(b)));
  inheritCoveringValues(units);
  return units;
}

/**
 * A narrower pin often stores only one field. Length / UVW / tanks that
 * already live on a year range covering that pin are not gaps.
 */
function inheritCoveringValues(units: Unit[]) {
  const groups = new Map<string, Unit[]>();
  for (const unit of units) {
    const key = [
      unit.make.trim().toLowerCase(),
      unit.model.trim().toLowerCase(),
      unit.floorplan.trim().toUpperCase().replace(/[\s-]+/g, ""),
    ].join("|");
    const list = groups.get(key) ?? [];
    list.push(unit);
    groups.set(key, list);
  }
  const own = new Map(units.map((unit) => [unitKey(unit), { ...unit.values }]));
  for (const list of groups.values()) {
    for (const unit of list) {
      for (const field of SPEC_FIELDS) {
        if (!isBlank(unit.values[field])) continue;
        let bestKey = "";
        let bestSpan = Infinity;
        for (const other of list) {
          if (other === unit) continue;
          if (other.yearMin > unit.yearMin || other.yearMax < unit.yearMax) continue;
          const stored = own.get(unitKey(other))?.[field];
          if (isBlank(stored)) continue;
          const span = other.yearMax - other.yearMin;
          if (span < bestSpan) {
            bestSpan = span;
            bestKey = unitKey(other);
          }
        }
        if (bestKey) unit.values[field] = own.get(bestKey)?.[field];
      }
    }
  }
}

export function buildGapReport(units = collectCatalogUnits()): GapReport {
  const gaps: GapRow[] = [];
  const byField: Record<string, number> = {};
  for (const field of SPEC_FIELDS) byField[field] = 0;

  for (const unit of units) {
    const year = unit.yearMin === unit.yearMax ? unit.yearMin : "";
    const yearRange = unit.yearMin === unit.yearMax ? "" : `${unit.yearMin}-${unit.yearMax}`;
    for (const field of SPEC_FIELDS) {
      if (!isBlank(unit.values[field])) continue;
      byField[field] = (byField[field] ?? 0) + 1;
      gaps.push({
        year,
        yearRange,
        make: unit.make,
        model: unit.model,
        floorplan: unit.floorplan,
        field,
        currentValue: "",
      });
    }
  }

  return {
    unitCount: units.length,
    gapCount: gaps.length,
    byField,
    gaps,
  };
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function gapReportToCsv(report: GapReport): string {
  const header = ["year", "yearRange", "make", "model", "floorplan", "field", "currentValue"];
  const lines = [header.join(",")];
  for (const row of report.gaps) {
    lines.push(
      [
        csvCell(row.year),
        csvCell(row.yearRange),
        csvCell(row.make),
        csvCell(row.model),
        csvCell(row.floorplan),
        csvCell(row.field),
        csvCell(row.currentValue),
      ].join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

function defaultOutDir(): string {
  return join(dirname(fileURLToPath(import.meta.url)), "../../data/batch-fill");
}

export function writeGapReport(outDir = defaultOutDir()): GapReport {
  const report = buildGapReport();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "gaps.json"), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(join(outDir, "gaps.csv"), gapReportToCsv(report));
  return report;
}

const isDirect =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirect) {
  const report = writeGapReport();
  console.log(
    JSON.stringify(
      { unitCount: report.unitCount, gapCount: report.gapCount, byField: report.byField },
      null,
      2,
    ),
  );
}
