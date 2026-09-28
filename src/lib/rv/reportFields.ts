/**
 * Buyer-facing RvFAX vehicle report rows.
 * Page, PDF, and share/OG text all read this list — one formatter.
 * Lot-card lookup stays on the full scrape; this allowlist does not.
 */

import {
  LOT_GAP,
  lotPriceOrGap,
  lotTextOrGap,
  type LotUnit,
} from "../lot/ownLotPage.ts";

export type BuyerReportRow = { label: string; value: string };
export type BuyerReportSection = { title: string; rows: BuyerReportRow[] };

export type BuyerUnitReport = {
  headlines: BuyerReportRow[];
  sections: BuyerReportSection[];
};

const HEADLINE_LIMIT = 4;

/** Blank, GAP, and a printed zero are not buyer rows. */
export function isHiddenReportValue(value: string | null | undefined): boolean {
  const t = (value ?? "").trim();
  if (!t) return true;
  if (t === "—" || t === "-" || t === "–" || t === "−") return true;
  if (/^(?:gap|n\/a|none)$/i.test(t)) return true;
  if (/^confirm brochure/i.test(t)) return true;
  if (/^confirm (?:door|floor) sticker/i.test(t)) return true;
  if (/^0+(?:\.0+)?(?:\s*(?:gal(?:lons?)?|lbs?|pounds?|hp|ft|feet|in|inches|'|"|″))?$/i.test(t)) {
    return true;
  }
  return false;
}

function firstNumber(value: string): number | null {
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  return Number.isFinite(n) ? n : null;
}

function pipeParts(value: string): string[] {
  return value
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** A transmission of "6" is a gear count, not a buyer fact. */
export function isBareNumber(value: string): boolean {
  return /^[\d,]+(?:\.\d+)?$/.test(value.trim());
}

function inchesToFeetInches(totalInches: number): string | null {
  if (!Number.isFinite(totalInches) || totalInches <= 0) return null;
  const inches = Math.round(totalInches);
  if (inches <= 0) return null;
  const feet = Math.floor(inches / 12);
  const inch = inches % 12;
  return inch ? `${feet}'${inch}"` : `${feet}'`;
}

/**
 * Feet-inches only. "478 | 39'10"" and "13'3\" | 159" keep the quote form.
 * A lone decimal foot or inch figure is converted. Bare zeros are hidden.
 */
export function formatReportFeetInches(raw: string): string | null {
  const text = raw.trim();
  if (isHiddenReportValue(text)) return null;
  const parts = pipeParts(text);
  const pool = parts.length ? parts : [text];
  for (const part of pool) {
    const hit = part.match(/(\d+)\s*'\s*(\d+)?\s*(?:"|″)?/);
    if (!hit) continue;
    const feet = Number(hit[1]);
    const inch = hit[2] ? Number(hit[2]) : 0;
    if (feet === 0 && inch === 0) continue;
    return inch ? `${feet}'${inch}"` : `${feet}'`;
  }
  for (const part of pool) {
    const feet = part.match(/(\d+(?:\.\d+)?)\s*(?:ft|feet)\b/i);
    if (!feet) continue;
    const formatted = inchesToFeetInches(Number(feet[1]) * 12);
    if (formatted) return formatted;
  }
  for (const part of pool) {
    const inches = part.match(/(\d+(?:\.\d+)?)\s*(?:in|inches)\b/i);
    if (!inches) continue;
    const formatted = inchesToFeetInches(Number(inches[1]));
    if (formatted) return formatted;
  }
  if (pool.length === 1) {
    const n = firstNumber(pool[0] ?? "");
    if (n != null && n > 0) {
      return inchesToFeetInches(n >= 80 ? n : n * 12);
    }
  }
  return null;
}

/**
 * Pipe-joined scrape numbers collapse to one unit value.
 * "2600 | 360 HP" → "360 HP". "1800 | 800 | 800 lb-ft" → "800 lb-ft".
 * The part that carries the unit wins; otherwise the last sane number.
 */
export function formatReportMeasured(
  raw: string,
  unitPattern: RegExp,
  unitLabel: string,
  sane: (n: number) => boolean,
): string | null {
  const parts = pipeParts(raw);
  if (!parts.length || isHiddenReportValue(raw)) return null;
  const withUnit = parts.filter((part) => unitPattern.test(part));
  const pool = withUnit.length ? withUnit : parts;
  for (let i = pool.length - 1; i >= 0; i -= 1) {
    const n = firstNumber(pool[i] ?? "");
    if (n == null || n <= 0 || !sane(n)) continue;
    return `${Math.round(n).toLocaleString("en-US")} ${unitLabel}`;
  }
  return null;
}

export function formatReportHorsepower(raw: string): string | null {
  return formatReportMeasured(raw, /\bhp\b/i, "HP", (n) => n >= 50 && n <= 1200);
}

export function formatReportTorque(raw: string): string | null {
  return formatReportMeasured(
    raw,
    /\blb-?\s*ft\b|\bft-?\s*lb\b/i,
    "lb-ft",
    (n) => n >= 50 && n <= 4000,
  );
}

/** Thousands separators and a single "lb". "32700" and "15,000 lbs" both qualify. */
export function formatReportPounds(raw: string): string | null {
  const parts = pipeParts(raw);
  if (!parts.length || isHiddenReportValue(raw)) return null;
  const withUnit = parts.filter((part) => /\blbs?\b|\bpounds?\b/i.test(part));
  const pool = withUnit.length ? withUnit : parts;
  const n = firstNumber(pool[pool.length - 1] ?? "");
  if (n == null || n <= 0) return null;
  return `${Math.round(n).toLocaleString("en-US")} lb`;
}

/** Fresh, gray, black, and fuel tank. Split tanks keep their F/R marks plus "gal". */
export function formatReportGallons(raw: string): string | null {
  const text = raw.trim();
  if (isHiddenReportValue(text)) return null;
  if (/\d+\s*[FR]\b/i.test(text)) {
    const body = text.replace(/\s*gal(?:lons?)?\s*$/i, "").trim();
    if (isHiddenReportValue(body)) return null;
    return `${body} gal`;
  }
  const parts = pipeParts(text);
  const withUnit = parts.filter((part) => /\bgal(?:lons?)?\b/i.test(part));
  const pool = withUnit.length ? withUnit : parts;
  const n = firstNumber(pool[pool.length - 1] ?? "");
  if (n == null || n <= 0) return null;
  const shown = Number.isInteger(n)
    ? Math.round(n).toLocaleString("en-US")
    : String(Math.round(n * 10) / 10);
  return `${shown} gal`;
}

function propaneUnit(value: string): "lb" | "gal" | null {
  if (/\b(?:lbs?|pounds?)\b/i.test(value)) return "lb";
  if (/\bgal(?:lons?)?\b/i.test(value)) return "gal";
  return null;
}

function formatPropaneAmount(raw: string, unit: "lb" | "gal"): string | null {
  const n = firstNumber(raw);
  if (n == null || n <= 0) return null;
  const shown = Number.isInteger(n)
    ? Math.round(n).toLocaleString("en-US")
    : String(Math.round(n * 10) / 10);
  return `${shown} ${unit}`;
}

/**
 * One propane row. Use the unit the source printed (lb or gal).
 * A combined "105 lbs | 24.8" is the same tank twice — keep the labeled one.
 */
export function formatReportPropane(
  sources: { lbs?: string; gal?: string; combined?: string },
): string | null {
  const combined = (sources.combined ?? "").trim();
  if (combined && !isHiddenReportValue(combined)) {
    const labeled = pipeParts(combined).filter((part) => propaneUnit(part));
    const chosen = labeled[0];
    if (chosen) {
      const unit = propaneUnit(chosen);
      if (unit) return formatPropaneAmount(chosen, unit);
    }
  }
  const lbs = (sources.lbs ?? "").trim();
  if (lbs && !isHiddenReportValue(lbs)) return formatPropaneAmount(lbs, "lb");
  const gal = (sources.gal ?? "").trim();
  if (gal && !isHiddenReportValue(gal)) return formatPropaneAmount(gal, "gal");
  return null;
}

/** "Regular Diesel" → "Diesel". "Gasoline" → "Gas". */
export function formatReportFuel(raw: string): string | null {
  const text = raw.trim();
  if (isHiddenReportValue(text)) return null;
  if (/diesel/i.test(text)) return "Diesel";
  if (/\bgas(?:oline)?\b|\bunleaded\b|\bpetrol\b/i.test(text)) return "Gas";
  return null;
}

/** "Cummins / In-Line" is a chassis layout, not the engine buyers ask for. */
export function isInlineEngineDump(value: string): boolean {
  return /^[a-z0-9][a-z0-9 .'-]*\s\/\s*in[\s-]*line$/i.test(value.trim());
}

function cleanDescribed(raw: string): string {
  const parts = pipeParts(raw);
  if (parts.length <= 1) return raw.trim();
  const words = parts.filter((part) => /[a-z]/i.test(part) && !isBareNumber(part));
  return (words[words.length - 1] ?? parts[parts.length - 1] ?? "").trim();
}

export function formatReportEngine(engineType: string, engine: string): string | null {
  const typed = cleanDescribed(engineType);
  if (typed && !isHiddenReportValue(typed) && !isInlineEngineDump(typed)) return typed;
  const named = cleanDescribed(engine);
  if (!named || isHiddenReportValue(named) || isInlineEngineDump(named)) return null;
  return named;
}

function formatReportTransmission(...candidates: string[]): string | null {
  for (const candidate of candidates) {
    const text = cleanDescribed(candidate);
    if (!text || isHiddenReportValue(text) || isBareNumber(text)) continue;
    return text;
  }
  return null;
}

function formatMoney(raw: string): string | null {
  const text = raw.trim();
  if (isHiddenReportValue(text)) return null;
  const n = firstNumber(text.replace(/\$/g, ""));
  if (n == null || n <= 0) return null;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

function formatCount(raw: string): string | null {
  const n = firstNumber(raw);
  if (n == null || n <= 0) return null;
  return String(Math.round(n));
}

type BedSpec = {
  keys: string[];
  one: string;
  many: (count: number) => string;
  alwaysNumber?: boolean;
};

const BED_SPECS: readonly BedSpec[] = [
  {
    keys: ["number_of_king_size_beds", "number_of_king_beds", "king_beds"],
    one: "King",
    many: (count) => `${count} Kings`,
  },
  {
    keys: ["number_of_queen_size_beds", "number_of_queen_beds", "queen_beds"],
    one: "Queen",
    many: (count) => `${count} Queens`,
  },
  {
    keys: ["number_of_full_size_beds", "number_of_full_beds", "full_beds"],
    one: "Full",
    many: (count) => `${count} Full`,
  },
  {
    keys: ["number_of_double_beds", "number_of_double_size_beds"],
    one: "Double",
    many: (count) => `${count} Doubles`,
  },
  {
    keys: ["number_of_twin_beds", "number_of_twin_size_beds"],
    one: "Twin",
    many: (count) => `${count} Twins`,
  },
  {
    keys: [
      "number_of_convertible_/_sofa_beds",
      "number_of_convertible_sofa_beds",
      "number_of_sofa_beds",
    ],
    one: "Sofa bed",
    many: (count) => `${count} sofa beds`,
  },
  {
    keys: ["number_of_bunk_beds", "number_of_bunks", "bunks"],
    one: "1 bunk",
    many: (count) => `${count} bunks`,
    alwaysNumber: true,
  },
];

function bedCount(printed: Record<string, string>, keys: readonly string[]): number {
  for (const key of keys) {
    const raw = printed[key];
    if (raw == null || !raw.trim()) continue;
    const n = firstNumber(raw);
    if (n == null || n <= 0) continue;
    return Math.round(n);
  }
  return 0;
}

/** One Beds line. Zero counts drop out. "King · 2 bunks", "Queen", "King". */
export function formatReportBeds(printed: Record<string, string>): string | null {
  const bits: string[] = [];
  for (const spec of BED_SPECS) {
    const count = bedCount(printed, spec.keys);
    if (count <= 0) continue;
    if (spec.alwaysNumber || count > 1) bits.push(spec.many(count));
    else bits.push(spec.one);
  }
  return bits.length ? bits.join(" · ") : null;
}

function pick(printed: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = printed[key];
    if (value && value.trim()) return value.trim();
  }
  return "";
}

function pushRow(rows: BuyerReportRow[], label: string, value: string | null) {
  if (!value || isHiddenReportValue(value)) return;
  rows.push({ label, value: value.trim() });
}

function section(title: string, rows: BuyerReportRow[]): BuyerReportSection | null {
  return rows.length ? { title, rows } : null;
}

/** Sale Pending / Pending stays. Available and other lot states do not. */
export function formatReportStatus(raw: string): string | null {
  const text = raw.trim();
  if (isHiddenReportValue(text)) return null;
  if (/^sale\s+pending$/i.test(text)) return "Sale Pending";
  if (/^pending$/i.test(text)) return "Pending";
  return null;
}

function preferLonger(a: string, b: string): string {
  const left = cleanDescribed(a);
  const right = cleanDescribed(b);
  if (!left || isHiddenReportValue(left)) return right;
  if (!right || isHiddenReportValue(right)) return left;
  return right.length > left.length ? right : left;
}

/**
 * Buyer rows for one lot unit. Headlines and sections share these values,
 * so the report page, the PDF, and OG text cannot drift.
 */
export function buildBuyerUnitReport(unit: LotUnit): BuyerUnitReport {
  const printed = unit.printed ?? {};
  const price = lotPriceOrGap(unit.price);
  const stock = lotTextOrGap(unit.stock_number);

  const unitRows: BuyerReportRow[] = [];
  pushRow(unitRows, "VIN", lotTextOrGap(unit.vin) === LOT_GAP ? "" : unit.vin.trim());
  pushRow(
    unitRows,
    "Condition",
    lotTextOrGap(unit.condition) === LOT_GAP ? "" : unit.condition.trim(),
  );
  pushRow(
    unitRows,
    "Location",
    lotTextOrGap(unit.location) === LOT_GAP ? "" : unit.location.trim(),
  );
  pushRow(unitRows, "Type", unit.body_type.trim());
  pushRow(unitRows, "Status", formatReportStatus(pick(printed, "lot_status") || unit.lot_status));

  const priceRows: BuyerReportRow[] = [];
  pushRow(priceRows, "MSRP", formatMoney(pick(printed, "price_msrp")));
  pushRow(priceRows, "Price Monthly", formatMoney(pick(printed, "price_monthly")));

  const dimensionRows: BuyerReportRow[] = [];
  pushRow(
    dimensionRows,
    "Length",
    formatReportFeetInches(pick(printed, "vehicle_body_length", "length_ft")),
  );
  pushRow(
    dimensionRows,
    "Height",
    formatReportFeetInches(pick(printed, "vehicle_body_height", "height_ft")),
  );
  pushRow(
    dimensionRows,
    "Width",
    formatReportFeetInches(pick(printed, "vehicle_body_width", "width_ft")),
  );
  pushRow(
    dimensionRows,
    "Wheelbase",
    formatReportFeetInches(pick(printed, "wheelbase", "wheel_base")),
  );
  pushRow(dimensionRows, "Sleeps", formatCount(pick(printed, "max_sleeping_count", "sleeps")));
  pushRow(dimensionRows, "Slides", formatCount(pick(printed, "number_of_slideouts", "slides")));
  pushRow(dimensionRows, "Beds", formatReportBeds(printed));

  const chassisRows: BuyerReportRow[] = [];
  pushRow(
    chassisRows,
    "Chassis",
    preferLonger(pick(printed, "chassis_brand", "chassis"), pick(printed, "chassis_model")),
  );
  pushRow(
    chassisRows,
    "Engine Type",
    formatReportEngine(pick(printed, "engine_type"), pick(printed, "engine")),
  );
  pushRow(chassisRows, "Horsepower", formatReportHorsepower(pick(printed, "horsepower")));
  pushRow(chassisRows, "Torque", formatReportTorque(pick(printed, "torque")));
  pushRow(
    chassisRows,
    "Transmission",
    formatReportTransmission(
      pick(printed, "transmission_brand"),
      pick(printed, "transmission"),
      pick(printed, "transmission_type"),
    ),
  );
  pushRow(chassisRows, "Fuel", formatReportFuel(pick(printed, "fuel_type", "fuel")));

  const weightRows: BuyerReportRow[] = [];
  pushRow(weightRows, "GVWR", formatReportPounds(pick(printed, "gvwr")));
  pushRow(weightRows, "Towing", formatReportPounds(pick(printed, "towing_capacity", "towing")));
  pushRow(
    weightRows,
    "Hitch",
    formatReportPounds(pick(printed, "hitch_weight", "tongue_weight", "dry_hitch_weight", "hitch")),
  );
  pushRow(
    weightRows,
    "Fresh",
    formatReportGallons(
      pick(printed, "total_fresh_water_tank_capacity", "fresh_water_tank_capacity", "fresh_gal"),
    ),
  );
  pushRow(
    weightRows,
    "Gray",
    formatReportGallons(pick(printed, "total_gray_water_tank_capacity", "gray_gal")),
  );
  pushRow(
    weightRows,
    "Black",
    formatReportGallons(pick(printed, "total_black_water_tank_capacity", "black_gal")),
  );
  pushRow(
    weightRows,
    "Fuel tank",
    formatReportGallons(pick(printed, "fuel_tank_capacity", "fuel_capacity")),
  );
  pushRow(
    weightRows,
    "Propane",
    formatReportPropane({
      combined: pick(printed, "total_propane_tank_capacity"),
      lbs: pick(printed, "propane_lbs", "propane_lb"),
      gal: pick(printed, "propane_gal"),
    }),
  );

  const systemRows: BuyerReportRow[] = [];
  pushRow(
    systemRows,
    "Generator",
    preferLonger(pick(printed, "generator"), pick(printed, "generator_type")),
  );

  const sections = [
    section("Unit", unitRows),
    section("Price", priceRows),
    section("Dimensions", dimensionRows),
    section("Chassis and Engine", chassisRows),
    section("Weights and Capacities", weightRows),
    section("Systems", systemRows),
  ].filter((item): item is BuyerReportSection => item != null);

  const byLabel = new Map(
    sections.flatMap((item) => item.rows.map((row) => [row.label, row.value])),
  );
  const headlines: BuyerReportRow[] = [];
  const consider = (label: string, value: string | null | undefined) => {
    if (headlines.length >= HEADLINE_LIMIT) return;
    if (!value || isHiddenReportValue(value)) return;
    headlines.push({ label, value: value.trim() });
  };
  consider("Price", price === LOT_GAP ? "" : price);
  consider("Stock number", stock === LOT_GAP ? "" : stock);
  consider("GVWR", byLabel.get("GVWR"));
  consider("Length", byLabel.get("Length"));
  consider("Horsepower", byLabel.get("Horsepower"));
  consider("Sleeps", byLabel.get("Sleeps"));

  return { headlines, sections };
}
