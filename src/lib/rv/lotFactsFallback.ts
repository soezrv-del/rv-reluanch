/**
 * Fill empty Facts rows from a specific RV Country lot unit.
 *
 * Unflagged lot numbers paint holes only (blank or "Confirm brochure").
 * Catalog digit heuristics may also be replaced when dataSource is
 * catalog/estimated. A field flagged `overridesCatalog` ranks above the
 * OEM / brochure value for that coach and field. dataSource is left as
 * the brochure sheet had it — the lot tag is appended, never relabeled OEM.
 * 0 / null / tank-count values stay blank.
 * Never convert lb ↔ gal. Never invent a class average.
 */

import { CONFIRM_BROCHURE, type BrochureSpecs } from "./brochureSpecs.ts";
import type { LotOverrideField } from "./lotCatalogSeed.ts";

export const LOT_FACTS_SOURCE = "RV Country lot unit record";

/** Tank counts on dealer HTML (1–4) must never be treated as gallons or pounds. */
const TANK_COUNT_MAX = 4;

export type LotPublishedSpecs = {
  gvwrLbs?: number | null;
  dryWeightLbs?: number | null;
  hitchLbs?: number | null;
  payloadLbs?: number | null;
  lengthFt?: number | null;
  heightFt?: number | null;
  widthFt?: number | null;
  sleeps?: number | null;
  slides?: number | null;
  freshGal?: number | null;
  grayGal?: number | null;
  blackGal?: number | null;
  propaneLbs?: number | null;
  propaneGal?: number | null;
  engine?: string | null;
  chassis?: string | null;
  fuelType?: string | null;
  stockNumber?: string | null;
  /** Published keys whose lot number replaces a filled catalog cell. */
  overrides?: Partial<Record<LotPublishedKey, true>>;
};

type LotPublishedKey =
  | "gvwrLbs"
  | "dryWeightLbs"
  | "hitchLbs"
  | "payloadLbs"
  | "lengthFt"
  | "heightFt"
  | "widthFt"
  | "sleeps"
  | "slides"
  | "freshGal"
  | "grayGal"
  | "blackGal"
  | "propaneLbs"
  | "propaneGal";

const SEED_OVERRIDE_TO_PUBLISHED: Record<LotOverrideField, LotPublishedKey> = {
  gvwr: "gvwrLbs",
  dry_weight: "dryWeightLbs",
  hitch_weight: "hitchLbs",
  payload: "payloadLbs",
  vehicle_body_length: "lengthFt",
  vehicle_body_height: "heightFt",
  vehicle_body_width: "widthFt",
  max_sleeping_count: "sleeps",
  number_of_slideouts: "slides",
  total_fresh_water_tank_capacity: "freshGal",
  total_gray_water_tank_capacity: "grayGal",
  total_black_water_tank_capacity: "blackGal",
  propane_lbs: "propaneLbs",
  propane_gal: "propaneGal",
};

const PUBLISHED_OVERRIDE_KEYS = new Set<LotPublishedKey>(Object.values(SEED_OVERRIDE_TO_PUBLISHED));

function publishedOverrides(row: Record<string, unknown>): LotPublishedSpecs["overrides"] {
  const raw = row.overridesCatalog ?? row.overrides;
  if (!raw || typeof raw !== "object") return undefined;
  const out: Partial<Record<LotPublishedKey, true>> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (value !== true) continue;
    const fromSeed = SEED_OVERRIDE_TO_PUBLISHED[key as LotOverrideField];
    if (fromSeed) {
      out[fromSeed] = true;
      continue;
    }
    if (PUBLISHED_OVERRIDE_KEYS.has(key as LotPublishedKey)) {
      out[key as LotPublishedKey] = true;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export type LotFactsMerge = {
  specs: BrochureSpecs;
  filled: string[];
};

export function isFactsGap(value: string | number | null | undefined): boolean {
  if (value == null) return true;
  if (typeof value === "number") return !Number.isFinite(value) || value <= 0;
  const t = value.trim();
  return !t || t === CONFIRM_BROCHURE || t === "GAP" || t === "—";
}

function catalogGuess(specs: BrochureSpecs): boolean {
  return specs.dataSource === "catalog" || specs.dataSource === "estimated";
}

function finitePositive(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value !== "string") return null;
  const n = Number(value.replace(/[,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Capacities. Reject 1–4 — those are dealer tank *counts*, not gallons/pounds. */
export function publishedCapacity(value: unknown): number | null {
  const n = finitePositive(value);
  if (n == null || n <= TANK_COUNT_MAX) return null;
  return n;
}

/** Counts that may legally be 0 (slides on a 0-slide trailer). */
export function publishedCount(value: unknown, allowZero = false): number | null {
  if (typeof value === "number" && value === 0 && allowZero) return 0;
  if (typeof value === "string" && value.trim() === "0" && allowZero) return 0;
  const n = finitePositive(value);
  return n;
}

function publishedText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const t = value.trim();
  if (!t || t === "0" || /^n\/?a$/i.test(t)) return null;
  return t;
}

function pickNum(
  row: Record<string, unknown>,
  keys: string[],
  kind: "capacity" | "weight" | "count" | "count0",
): number | null {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    lower[k.toLowerCase().replace(/[\s-]+/g, "_")] = v;
  }
  for (const key of keys) {
    const raw = lower[key.toLowerCase().replace(/[\s-]+/g, "_")];
    const n =
      kind === "capacity"
        ? publishedCapacity(raw)
        : kind === "count0"
          ? publishedCount(raw, true)
          : kind === "count"
            ? publishedCount(raw, false)
            : finitePositive(raw);
    if (n != null) return n;
  }
  return null;
}

function pickText(row: Record<string, unknown>, keys: string[]): string | null {
  const lower: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) {
    lower[k.toLowerCase().replace(/[\s-]+/g, "_")] = v;
  }
  for (const key of keys) {
    const raw = lower[key.toLowerCase().replace(/[\s-]+/g, "_")];
    const t = publishedText(raw);
    if (t) return t;
  }
  return null;
}

function fmtLbs(n: number): string {
  return `${Math.round(n).toLocaleString("en-US")} lbs`;
}

function fmtGal(n: number): string {
  return `${Math.round(n)} gal`;
}

function fmtFt(n: number): string {
  const whole = Math.floor(n);
  const inches = Math.round((n - whole) * 12);
  if (inches === 0) return `${whole}' 0"`;
  if (inches === 12) return `${whole + 1}' 0"`;
  return `${whole}' ${inches}"`;
}

function fmtPropane(lbs: number | null, gal: number | null): string | null {
  if (lbs != null) return `${Math.round(lbs)} lb`;
  if (gal != null) return `${Math.round(gal)} gal`;
  return null;
}

function noteLotFill(existing: string, filled: string[]): string {
  if (!filled.length) return existing;
  const stamp = `${LOT_FACTS_SOURCE} (${filled.join(", ")})`;
  if (!existing || existing === CONFIRM_BROCHURE) return stamp;
  if (existing.includes(LOT_FACTS_SOURCE)) return existing;
  return `${existing} · ${stamp}`;
}

/**
 * Read printed specs off a snapshot / Coast / LotUnit row.
 * Tank-count keys are ignored. 0 / null weights and tanks stay empty.
 */
export function lotPublishedFromRow(
  row: Record<string, unknown> | null | undefined,
): LotPublishedSpecs {
  if (!row || typeof row !== "object") return {};
  const propaneLbs = pickNum(
    row,
    ["propane_lbs", "propaneLbs", "total_propane_tank_capacity"],
    "capacity",
  );
  const propaneGal = pickNum(row, ["propane_gal", "propaneGal"], "capacity");
  const overrides = publishedOverrides(row);
  return {
    gvwrLbs: pickNum(row, ["gvwr", "gvwr_lbs", "gvwrLbs"], "weight"),
    dryWeightLbs: pickNum(row, ["dry_weight", "dryWeight", "uvw", "uvw_lbs", "uvwLbs"], "weight"),
    hitchLbs: pickNum(row, ["hitch_weight", "hitchWeight", "hitch_lbs", "hitchLbs"], "weight"),
    payloadLbs: pickNum(row, ["payload", "standard_payload", "ccc", "ccc_lbs"], "weight"),
    lengthFt: pickNum(row, ["vehicle_body_length", "length_ft", "length", "lengthFt"], "weight"),
    heightFt: pickNum(
      row,
      ["vehicle_body_height", "height_ft", "height", "exterior_height"],
      "weight",
    ),
    widthFt: pickNum(row, ["vehicle_body_width", "width_ft", "width", "exterior_width"], "weight"),
    sleeps: pickNum(row, ["max_sleeping_count", "sleeps"], "count"),
    slides: pickNum(row, ["number_of_slideouts", "slides"], "count0"),
    freshGal: pickNum(
      row,
      ["total_fresh_water_tank_capacity", "fresh_gal", "freshWater", "fresh_water"],
      "capacity",
    ),
    grayGal: pickNum(
      row,
      ["total_gray_water_tank_capacity", "gray_gal", "grey_gal", "grayWater", "gray_water"],
      "capacity",
    ),
    blackGal: pickNum(
      row,
      ["total_black_water_tank_capacity", "black_gal", "blackWater", "black_water"],
      "capacity",
    ),
    propaneLbs,
    propaneGal,
    engine: pickText(row, ["engine"]),
    chassis: pickText(row, ["chassis_brand", "chassis"]),
    fuelType: pickText(row, ["fuel_type", "fuelType", "fuel"]),
    stockNumber: pickText(row, ["stock_number", "stockNumber", "stock"]),
    ...(overrides ? { overrides } : {}),
  };
}

/**
 * Apply lot numbers onto a brochure sheet. Gap rows always move.
 * Catalog digit heuristics may move. A flagged override replaces the
 * filled cell for that field. Unflagged OEM-year pins stay.
 */
export function applyLotSpecsToBrochure(
  specs: BrochureSpecs,
  lot: LotPublishedSpecs | null | undefined,
): LotFactsMerge {
  if (!lot) return { specs, filled: [] };
  const next: BrochureSpecs = { ...specs };
  const filled: string[] = [];
  const guess = catalogGuess(next);
  const forced = (key: LotPublishedKey) => lot.overrides?.[key] === true;

  const paint = (
    label: string,
    key: keyof BrochureSpecs,
    value: string,
    replaceGuess = false,
    force = false,
  ) => {
    const cur = next[key] as string | number | null | undefined;
    if (!force && !isFactsGap(cur) && !(replaceGuess && guess)) return;
    if (force && !isFactsGap(cur) && String(cur) === value) return;
    (next as unknown as Record<string, unknown>)[key] = value;
    filled.push(label);
  };

  if (lot.gvwrLbs != null) {
    const force = forced("gvwrLbs");
    paint("GVWR", "gvwr", fmtLbs(lot.gvwrLbs), false, force);
    if (force || isFactsGap(next.gvwrLbs)) next.gvwrLbs = Math.round(lot.gvwrLbs);
  }
  if (lot.dryWeightLbs != null) {
    const force = forced("dryWeightLbs");
    paint("UVW", "uvw", fmtLbs(lot.dryWeightLbs), false, force);
    if (force || isFactsGap(next.uvwLbs)) next.uvwLbs = Math.round(lot.dryWeightLbs);
  }
  if (lot.hitchLbs != null) {
    paint("HITCH", "hitchOrPin", fmtLbs(lot.hitchLbs), false, forced("hitchLbs"));
  }
  if (lot.payloadLbs != null && (forced("payloadLbs") || isFactsGap(next.ccc))) {
    const nextCcc = fmtLbs(lot.payloadLbs);
    if (forced("payloadLbs") && next.ccc === nextCcc) {
      /* identical catalog CCC — leave the cell */
    } else {
      next.ccc = nextCcc;
      filled.push("CCC");
    }
    if (forced("payloadLbs") || isFactsGap(next.cccLbs)) next.cccLbs = Math.round(lot.payloadLbs);
  }
  if (lot.lengthFt != null) {
    const force = forced("lengthFt");
    paint("LENGTH", "lengthFt", fmtFt(lot.lengthFt), true, force);
    if (force || isFactsGap(next.lengthIn) || guess) next.lengthIn = fmtFt(lot.lengthFt);
  }
  if (lot.heightFt != null) {
    paint("HEIGHT", "exteriorHeight", fmtFt(lot.heightFt), true, forced("heightFt"));
  }
  // Coast often stores width as a rounded 8. Do not replace 8'6" with 8'0".
  if (lot.widthFt != null && (forced("widthFt") || Math.abs(lot.widthFt - 8) > 0.2)) {
    paint("WIDTH", "exteriorWidth", fmtFt(lot.widthFt), true, forced("widthFt"));
  }
  if (lot.sleeps != null) {
    paint("SLEEPS", "sleeps", String(lot.sleeps), true, forced("sleeps"));
  }
  if (lot.slides != null) {
    paint("SLIDES", "slideouts", String(lot.slides), true, forced("slides"));
  }
  if (lot.freshGal != null) {
    paint("FRESH WATER", "freshWater", fmtGal(lot.freshGal), false, forced("freshGal"));
  }
  if (lot.grayGal != null) {
    paint("GRAY WATER", "grayWater", fmtGal(lot.grayGal), false, forced("grayGal"));
  }
  if (lot.blackGal != null) {
    paint("BLACK WATER", "blackWater", fmtGal(lot.blackGal), false, forced("blackGal"));
  }

  const propane = fmtPropane(lot.propaneLbs ?? null, lot.propaneGal ?? null);
  if (propane) {
    paint("PROPANE", "propane", propane, false, forced("propaneLbs") || forced("propaneGal"));
  }

  if (lot.engine) paint("ENGINE", "engine", lot.engine);
  if (lot.chassis) paint("CHASSIS", "chassis", lot.chassis);
  if (lot.fuelType) paint("FUEL", "fuelType", lot.fuelType);

  if (filled.length) {
    next.accuracyNote = noteLotFill(next.accuracyNote, filled);
  }
  return { specs: next, filled };
}

/** Convenience: snapshot row → merge. */
export function applyLotRowToBrochure(
  specs: BrochureSpecs,
  row: Record<string, unknown> | null | undefined,
): LotFactsMerge {
  return applyLotSpecsToBrochure(specs, lotPublishedFromRow(row));
}
