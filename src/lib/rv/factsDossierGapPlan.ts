/**
 * Facts dossier gap planner — client-safe catalog-first pins.
 *
 * Same planner the dossier route / gap browse uses. Safe to import from
 * Facts UI (no web-research sidecar). Do not add a second gap pipeline.
 */

import { applyPublishedEngineTorque } from "./engineTorqueByVariant.ts";
import { findOemFloorplanSpec } from "./floorplanSpecs.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";

export const FACTS_DOSSIER_HARD_FIELDS = [
  "engine",
  "horsepower",
  "torque",
  "chassis",
  "transmission",
  "fuel",
  "gvwr",
  "uvw",
  "tanks",
  "length",
] as const;

export type FactsHardField = (typeof FACTS_DOSSIER_HARD_FIELDS)[number];

export type FactsCatalogCandidate = {
  engine?: string | null;
  horsepower?: string | number | null;
  torque?: string | number | null;
  chassis?: string | null;
  transmission?: string | null;
  fuelType?: string | null;
  type?: string | null;
  dataSource?: string | null;
  accuracyNote?: string | null;
  bandFrom?: number | null;
  bandTo?: number | null;
  floorplan?: string | null;
  lengthFt?: string | null;
  /** LiveDossier / probe alias for lengthFt. */
  overallLength?: string | number | null;
  length?: string | number | null;
  length_ft?: string | number | null;
  gvwr?: string | number | null;
  gvwrLbs?: number | null;
  uvw?: string | number | null;
  uvwLbs?: number | null;
  /** Client must omit estimated / typical-class UVW. */
  uvwEstimated?: boolean | null;
  freshWater?: string | number | null;
  grayWater?: string | number | null;
  blackWater?: string | number | null;
  /** Facts extract / probe often send *Gal keys, not brochure names. */
  freshWaterGal?: string | number | null;
  grayWaterGal?: string | number | null;
  blackWaterGal?: string | number | null;
  /** LiveDossier alias for torque. */
  torqueLbFt?: string | number | null;
  ccc?: string | number | null;
  propane?: string | number | null;
  mpgHighway?: string | number | null;
};

const HOLE_RE =
  /confirm brochure|^gap$|^—$|^-$|^–$|^n\/?a$|^tbd$|^unknown$/i;

/** Sheet lines the catalog left blank. Absent keys are not holes. */
export function visibleSpecHoles(
  candidate?: FactsCatalogCandidate | null,
): string[] {
  if (!candidate) return [];
  const holes: string[] = [];
  const check = (
    key: "ccc" | "propane" | "mpgHighway",
    label: string,
  ) => {
    if (!Object.prototype.hasOwnProperty.call(candidate, key)) return;
    const value = candidate[key];
    const s = value == null ? "" : String(value).trim();
    if (!s || HOLE_RE.test(s)) holes.push(label);
  };
  check("ccc", "CCC");
  check("propane", "propane");
  check("mpgHighway", "highway MPG");
  return holes;
}

export type FactsResolvedPins = {
  engine: string | null;
  horsepower: number | null;
  torqueLbFt: number | null;
  chassis: string | null;
  transmission: string | null;
  fuelType: string | null;
  gvwrLbs: number | null;
  uvwLbs: number | null;
  lengthFt: string | null;
  freshWaterGal: number | null;
  grayWaterGal: number | null;
  blackWaterGal: number | null;
  rvType: string | null;
  sourcesNote: string | null;
};

export type FactsDossierGapPlan = {
  present: FactsHardField[];
  gaps: FactsHardField[];
  skipLive: boolean;
  query: string | null;
};

const BLANK_RE = /^(?:—|-|–|n\/?a|null|none|unknown|tbd|gap)$/i;
const PLACEHOLDER_RE =
  /confirm brochure|manufacturer chassis|see options|class-typical|typical class|low confidence|\bEST\.?\b|invent|unavailable|web search not available/i;
const RANGE_RE = /\d+(?:\.\d+)?\s*[-–—]\s*\d+/;
const TOWABLE_NA_RE = /\bn\/?a\b.*towable|towable.*\bn\/?a\b|towable frame/i;

function textOf(v: string | number | null | undefined): string {
  if (v == null) return "";
  return String(v).trim();
}

function isBlankValue(v: string | number | null | undefined): boolean {
  const s = textOf(v);
  return !s || BLANK_RE.test(s);
}

function parsePositiveNumber(
  v: string | number | null | undefined,
): number | null {
  if (v == null || v === "") return null;
  if (typeof v === "number") {
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  const s = String(v).replace(/,/g, "");
  if (PLACEHOLDER_RE.test(s) || RANGE_RE.test(s)) return null;
  const m = s.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseHpValue(v: string | number | null | undefined): number | null {
  const n = parsePositiveNumber(v);
  if (n == null) return null;
  return n >= 40 && n < 900 ? Math.round(n) : null;
}

function parseTorqueValue(v: string | number | null | undefined): number | null {
  const n = parsePositiveNumber(v);
  if (n == null) return null;
  return n >= 80 && n < 4000 ? Math.round(n) : null;
}

function parseWeightValue(v: string | number | null | undefined): number | null {
  const n = parsePositiveNumber(v);
  if (n == null) return null;
  return n >= 500 && n < 120_000 ? Math.round(n) : null;
}

function parseGalValue(v: string | number | null | undefined): number | null {
  const n = parsePositiveNumber(v);
  if (n == null) return null;
  return n > 0 && n < 400 ? Math.round(n) : null;
}

function isTowableNa(v: string | number | null | undefined): boolean {
  return TOWABLE_NA_RE.test(textOf(v)) || /^n\/?a$/i.test(textOf(v));
}

function isRealPinText(v: string | number | null | undefined): boolean {
  if (isBlankValue(v)) return false;
  const s = textOf(v);
  if (isTowableNa(s)) return true;
  if (PLACEHOLDER_RE.test(s)) return false;
  if (RANGE_RE.test(s)) return false;
  return s.length >= 2;
}

function firstPinText(
  ...vals: Array<string | number | null | undefined>
): string | null {
  for (const v of vals) {
    if (isRealPinText(v)) return textOf(v);
  }
  return null;
}

function firstWeight(
  ...vals: Array<string | number | null | undefined>
): number | null {
  for (const v of vals) {
    const n = parseWeightValue(v);
    if (n != null) return n;
  }
  return null;
}

function firstGal(
  ...vals: Array<string | number | null | undefined>
): number | null {
  for (const v of vals) {
    const n = parseGalValue(v);
    if (n != null) return n;
  }
  return null;
}

/** Brochure pin + OEM floorplan + candidate. Pin wins powertrain. */
export function resolveFactsCatalogPins(opts: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  candidate?: FactsCatalogCandidate | null;
}): FactsResolvedPins {
  const candidate = opts.candidate ?? undefined;
  const pin = findPowertrainCorrection(
    opts.year,
    opts.make,
    opts.model,
    opts.floorplan || undefined,
  );
  const oem = findOemFloorplanSpec(
    opts.year,
    opts.make,
    opts.model,
    opts.floorplan || "",
  );

  const pinHp = pin && pin.horsepower > 0 ? pin.horsepower : null;
  const pinTorque = pin?.torqueLbFt != null && pin.torqueLbFt > 0
    ? pin.torqueLbFt
    : null;

  const engine = firstPinText(pin?.engine, candidate?.engine);
  let horsepower = pinHp ?? parseHpValue(candidate?.horsepower);
  let torqueLbFt =
    pinTorque ??
    parseTorqueValue(candidate?.torque) ??
    parseTorqueValue(candidate?.torqueLbFt);
  const chassis = firstPinText(pin?.chassis, candidate?.chassis);
  const transmission = firstPinText(pin?.transmission, candidate?.transmission);
  const fuelType = firstPinText(pin?.fuelType, candidate?.fuelType);

  if (engine && horsepower != null && !(torqueLbFt != null && torqueLbFt > 0)) {
    const filled = applyPublishedEngineTorque({
      engine,
      horsepower,
      torqueLbFt: undefined,
    });
    if (filled.torqueLbFt != null && filled.torqueLbFt > 0) {
      torqueLbFt = filled.torqueLbFt;
    }
  }

  const skipEstUvw = candidate?.uvwEstimated === true;
  const oemLength = oem?.lengthDisplay || null;

  const sources = [
    pin?.note,
    oem?.source || oem?.note,
    candidate?.accuracyNote,
    candidate?.dataSource ? `catalog ${candidate.dataSource}` : null,
  ].filter(Boolean);

  return {
    engine: engine || null,
    horsepower,
    torqueLbFt,
    chassis,
    transmission,
    fuelType,
    gvwrLbs:
      firstWeight(oem?.gvwrLbs, candidate?.gvwrLbs, candidate?.gvwr) ?? null,
    uvwLbs: skipEstUvw
      ? firstWeight(oem?.uvwLbs) ?? null
      : firstWeight(oem?.uvwLbs, candidate?.uvwLbs, candidate?.uvw) ?? null,
    lengthFt: firstPinText(
      oemLength,
      candidate?.lengthFt,
      candidate?.overallLength,
      candidate?.length,
      candidate?.length_ft,
    ),
    freshWaterGal: firstGal(
      oem?.freshWater,
      candidate?.freshWater,
      candidate?.freshWaterGal,
    ),
    grayWaterGal: firstGal(
      oem?.grayWater,
      candidate?.grayWater,
      candidate?.grayWaterGal,
    ),
    blackWaterGal: firstGal(
      oem?.blackWater,
      candidate?.blackWater,
      candidate?.blackWaterGal,
    ),
    rvType: firstPinText(candidate?.type),
    sourcesNote: sources.length ? sources.join(" · ") : null,
  };
}

export function fieldPresent(
  field: FactsHardField,
  pins: FactsResolvedPins,
): boolean {
  switch (field) {
    case "engine":
      return isRealPinText(pins.engine);
    case "horsepower":
      return pins.horsepower != null && pins.horsepower > 0
        || isTowableNa(pins.engine);
    case "torque":
      return pins.torqueLbFt != null && pins.torqueLbFt > 0
        || isTowableNa(pins.engine);
    case "chassis":
      return isRealPinText(pins.chassis);
    case "transmission":
      return isRealPinText(pins.transmission) || isTowableNa(pins.engine);
    case "fuel":
      return isRealPinText(pins.fuelType);
    case "gvwr":
      return pins.gvwrLbs != null && pins.gvwrLbs > 0;
    case "uvw":
      return pins.uvwLbs != null && pins.uvwLbs > 0;
    case "tanks":
      return (
        (pins.freshWaterGal != null && pins.freshWaterGal > 0) ||
        (pins.grayWaterGal != null && pins.grayWaterGal > 0) ||
        (pins.blackWaterGal != null && pins.blackWaterGal > 0)
      );
    case "length":
      return isRealPinText(pins.lengthFt);
    default:
      return false;
  }
}

const GAP_QUERY_LABEL: Record<FactsHardField, string> = {
  engine: "engine",
  horsepower: "horsepower",
  torque: "torque",
  chassis: "chassis",
  transmission: "transmission",
  fuel: "fuel type",
  gvwr: "GVWR",
  uvw: "average dry weight (UVW / unloaded vehicle weight, not GVWR)",
  tanks: "holding tanks",
  length: "length",
};

/**
 * One xAI web search for a Facts pull that still has holes.
 * Same report a direct Grok ask would write. Named gaps must be filled
 * from a printed source. Catalog pins are not replaced.
 */
export function factsDossierResearchQuery(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  gaps?: readonly FactsHardField[];
  holes?: readonly string[];
}): string {
  const plan = (input.floorplan || "").trim();
  const coach = `${input.year} ${input.make} ${input.model}${
    plan ? ` ${plan}` : ""
  }`.replace(/\s+/g, " ").trim();
  const gaps = input.gaps?.length
    ? input.gaps
    : FACTS_DOSSIER_HARD_FIELDS;
  const needed = gaps.map((g) => GAP_QUERY_LABEL[g]).join(", ");
  const holes = input.holes ?? [];
  const dry =
    gaps.includes("uvw") || holes.length
      ? " When dry weight is missing, search the web for an average published UVW for this year and floorplan. That figure is only for the power-to-weight bar. It is not a certified scale weight and it is not GVWR. Also fill CCC, propane, and highway MPG from a published spec page when the catalog says confirm brochure."
      : "";
  const holeLine = holes.length
    ? ` Sheet lines still blank: ${holes.join(", ")}.`
    : "";
  return `Write the coach report you would give a salesman who asked you directly about ${coach}. Search the live web. Sections: Overview, Chassis and powertrain, Weights and capacity, Layout and amenities, owner issues, sentiment, and market notes. These fields are still empty and must be filled when a brochure, factory sheet, dealer listing, or published spec page names them: ${needed}.${holeLine} Do not replace a number the catalog already pinned.${dry} Label sources.`;
}

/** Average published dry weight from research notes, when JSON omitted it. */
export function dryWeightLbsFromNotes(notes: string): number | null {
  const text = notes || "";
  const patterns = [
    /(?:dry weight|unloaded vehicle weight|\buvw\b)[^\d]{0,32}([\d,]{4,6})/i,
    /([\d,]{4,6})\s*(?:lb|lbs|pounds)\b[^\n]{0,40}(?:dry weight|unloaded vehicle weight|\buvw\b)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m?.[1]) continue;
    const n = Number(m[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n >= 4_000 && n <= 60_000) return Math.round(n);
  }
  return null;
}

export function planFactsDossierResearch(opts: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  pins?: FactsResolvedPins;
  candidate?: FactsCatalogCandidate | null;
}): FactsDossierGapPlan {
  const pins =
    opts.pins ??
    resolveFactsCatalogPins({
      year: opts.year,
      make: opts.make,
      model: opts.model,
      floorplan: opts.floorplan,
      candidate: opts.candidate,
    });
  const present: FactsHardField[] = [];
  const gaps: FactsHardField[] = [];
  for (const field of FACTS_DOSSIER_HARD_FIELDS) {
    if (fieldPresent(field, pins)) present.push(field);
    else gaps.push(field);
  }
  const holes = visibleSpecHoles(opts.candidate);
  const skipLive = gaps.length === 0 && holes.length === 0;
  return {
    present,
    gaps,
    skipLive,
    query: skipLive
      ? null
      : factsDossierResearchQuery({
          year: opts.year,
          make: opts.make,
          model: opts.model,
          floorplan: opts.floorplan,
          gaps,
          holes,
        }),
  };
}

export function pinsHaveHardFacts(pins: FactsResolvedPins): boolean {
  return FACTS_DOSSIER_HARD_FIELDS.some((field) => fieldPresent(field, pins));
}
