/**
 * Fill blank catalog spec fields from data/batch-fill/research-values.json.
 *
 * Writes into the catalog file only where the target field is blank.
 * Never overwrites a stored value. Does not run unless you point it at a
 * research file — research-values.json is not in the repo yet.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { modelPinBlocked } from "../../src/lib/rv/floorplanSpecs.ts";

export type ResearchSourceType = "oem" | "owner-reported" | "dealer" | "other";
export type ResearchConfidence = "high" | "low";

export type ResearchEntry = {
  year?: number;
  yearRange?: string;
  make: string;
  model: string;
  floorplan: string;
  field: string;
  value: number | string;
  unit?: string;
  sourceUrl: string;
  sourceType: ResearchSourceType;
  confidence: ResearchConfidence;
  note?: string;
};

export type ChangelogRow = {
  year: number | null;
  yearRange: string | null;
  make: string;
  model: string;
  floorplan: string;
  field: string;
  previous: null;
  value: number | string;
  unit: string;
  sourceUrl: string;
  sourceType: ResearchSourceType;
  confidence: ResearchConfidence;
  lowConfidence: boolean;
  note: string | null;
};

export type UnresolvedRow = {
  entry: ResearchEntry;
  reason: string;
};

type YearSpan = { yearMin: number; yearMax: number };

type SpecBlock = {
  make: string;
  model: string;
  floorplan: string;
  yearMin: number;
  yearMax: number;
  specOpen: number;
  specClose: number;
  body: string;
};

const FIELD_ALIASES: Record<string, string> = {
  uvw: "uvwLbs",
  uvwlbs: "uvwLbs",
  dryweight: "dryWeightLbs",
  dryweightlbs: "dryWeightLbs",
  "dry weight": "dryWeightLbs",
  gvwr: "gvwrLbs",
  gvwrlbs: "gvwrLbs",
  length: "overallLengthIn",
  lengthft: "overallLengthIn",
  overallengthin: "overallLengthIn",
  sleeps: "sleeps",
  hitch: "hitchLbs",
  hitchlbs: "hitchLbs",
  pin: "hitchLbs",
  tongue: "hitchLbs",
  fuel: "fuelCapacityGal",
  fuelcapacity: "fuelCapacityGal",
  fuelcapacitygal: "fuelCapacityGal",
  fresh: "freshWater",
  freshwater: "freshWater",
  grey: "grayWater",
  gray: "grayWater",
  graywater: "grayWater",
  greywater: "grayWater",
  black: "blackWater",
  blackwater: "blackWater",
  cargo: "cargoLbs",
  ccc: "cargoLbs",
  cargolbs: "cargoLbs",
  propane: "propaneLbs",
  propanelbs: "propaneLbs",
};

const LBS_FIELDS = new Set([
  "uvwLbs",
  "gvwrLbs",
  "hitchLbs",
  "dryWeightLbs",
  "cargoLbs",
  "garageCapacityLbs",
  "rampPatioLbs",
  "propaneLbs",
]);
const GAL_FIELDS = new Set([
  "fuelCapacityGal",
  "freshWater",
  "grayWater",
  "blackWater",
  "propaneGal",
  "waterHeaterGal",
  "fuelStationGal",
]);
const COUNT_FIELDS = new Set(["sleeps", "slideouts"]);

const SOURCE_TYPES = new Set<ResearchSourceType>(["oem", "owner-reported", "dealer", "other"]);

export function canonicalField(field: string): string | null {
  const key = field.trim().toLowerCase().replace(/[\s_-]+/g, "");
  if (FIELD_ALIASES[field.trim().toLowerCase()]) return FIELD_ALIASES[field.trim().toLowerCase()]!;
  if (FIELD_ALIASES[key]) return FIELD_ALIASES[key]!;
  if (/^[a-zA-Z][a-zA-Z0-9]*$/.test(field.trim())) return field.trim();
  return null;
}

function parseYearSpan(entry: ResearchEntry): YearSpan | { error: string } {
  if (entry.yearRange != null && String(entry.yearRange).trim() !== "") {
    const m = String(entry.yearRange).trim().match(/^(\d{4})\s*[-–]\s*(\d{4})$/);
    if (!m) return { error: "bad-year-range" };
    const yearMin = Number(m[1]);
    const yearMax = Number(m[2]);
    if (yearMax < yearMin) return { error: "bad-year-range" };
    return { yearMin, yearMax };
  }
  if (entry.year != null && Number.isFinite(Number(entry.year))) {
    const year = Number(entry.year);
    return { yearMin: year, yearMax: year };
  }
  return { error: "missing-year" };
}

function floorplanKey(value: string): string {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "");
}

export function convertValue(
  field: string,
  value: number | string,
  unit: string | undefined,
): { value: number; unit: string } | { error: string } {
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  if (!Number.isFinite(numeric)) return { error: "bad-value" };
  const u = (unit || "").trim().toLowerCase();
  if (LBS_FIELDS.has(field)) {
    if (u === "" || u === "lb" || u === "lbs" || u === "pound" || u === "pounds") {
      return { value: Math.round(numeric), unit: "lbs" };
    }
    if (u === "kg" || u === "kgs" || u === "kilogram" || u === "kilograms") {
      return { value: Math.round(numeric * 2.2046226218), unit: "lbs" };
    }
    return { error: "bad-unit" };
  }
  if (field === "overallLengthIn") {
    if (u === "in" || u === "inch" || u === "inches") {
      return { value: Math.round(numeric), unit: "in" };
    }
    if (u === "" || u === "ft" || u === "feet" || u === "foot") {
      return { value: Math.round(numeric * 12), unit: "ft" };
    }
    return { error: "bad-unit" };
  }
  if (GAL_FIELDS.has(field)) {
    if (u === "" || u === "gal" || u === "gallon" || u === "gallons") {
      return { value: Math.round(numeric * 10) / 10, unit: "gal" };
    }
    if (u === "l" || u === "liter" || u === "liters" || u === "litre" || u === "litres") {
      return { value: Math.round(numeric * 0.2641720524 * 10) / 10, unit: "gal" };
    }
    return { error: "bad-unit" };
  }
  if (COUNT_FIELDS.has(field)) {
    return { value: Math.round(numeric), unit: "count" };
  }
  if (u === "kg" || u === "kgs") return { value: Math.round(numeric * 2.2046226218), unit: "lbs" };
  return { value: numeric, unit: u || "number" };
}

function plausible(field: string, value: number, gvwr: number | null): string | null {
  if (field === "uvwLbs" || field === "dryWeightLbs") {
    if (value < 800 || value > 70_000) return "implausible-weight";
    if (gvwr != null && value >= gvwr) return "uvw-gte-gvwr";
    if (gvwr != null && value < gvwr * 0.3) return "implausible-for-gvwr";
  }
  if (field === "gvwrLbs" && (value < 1_000 || value > 80_000)) return "implausible-gvwr";
  if (field === "hitchLbs") {
    if (value < 40 || value > 25_000) return "implausible-hitch";
    if (gvwr != null && value >= gvwr) return "hitch-gte-gvwr";
  }
  if (field === "overallLengthIn" && (value < 8 * 12 || value > 55 * 12)) return "implausible-length";
  if (field === "sleeps" && (value < 1 || value > 13)) return "implausible-sleeps";
  if (GAL_FIELDS.has(field) && (value < 1 || value > 300)) return "implausible-capacity";
  if (field === "cargoLbs" && (value < 50 || value > 20_000)) return "implausible-cargo";
  return null;
}

function matchBrace(source: string, openIndex: number): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = openIndex; i < source.length; i++) {
    const c = source[i]!;
    if (quote) {
      if (c === "\\") {
        i += 1;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      quote = c;
      continue;
    }
    if (c === "{") depth += 1;
    else if (c === "}") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function readSimpleNumber(raw: string): number | null {
  const text = raw.trim().replace(/_/g, "").replace(/,$/, "");
  if (/^\d+(\.\d+)?$/.test(text)) return Number(text);
  const inches = text.match(/^(\d+)\s*\*\s*12\s*\+\s*(\d+)$/);
  if (inches) return Number(inches[1]) * 12 + Number(inches[2]);
  return null;
}

export function readSpecField(
  body: string,
  field: string,
): { present: boolean; blank: boolean; numeric: number | null } {
  const re = new RegExp(`(?:^|\\n)\\s*${field}\\s*:\\s*([^,\\n]+)`);
  const match = body.match(re);
  if (!match) return { present: false, blank: true, numeric: null };
  const raw = match[1]!.trim();
  if (raw === "null" || raw === "undefined" || raw === '""' || raw === "''") {
    return { present: true, blank: true, numeric: null };
  }
  return { present: true, blank: false, numeric: readSimpleNumber(raw) };
}

function listSpecBlocks(source: string): SpecBlock[] {
  const blocks: SpecBlock[] = [];
  const re = /makeIncludes:\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const start = match.index;
    const next = source.indexOf("makeIncludes:", start + match[0].length);
    const window = source.slice(start, next === -1 ? start + 4000 : next);
    const model = window.match(/modelIncludes:\s*"([^"]+)"/);
    const yearMin = window.match(/yearMin:\s*(\d+)/);
    const yearMax = window.match(/yearMax:\s*(\d+)/);
    const floorplan = window.match(/floorplan:\s*"([^"]+)"/);
    const spec = window.match(/spec:\s*\{/);
    if (!model || !yearMin || !yearMax || !floorplan || !spec || spec.index == null) continue;
    const specOpen = start + spec.index + spec[0].length - 1;
    const specClose = matchBrace(source, specOpen);
    if (specClose < 0) continue;
    blocks.push({
      make: match[1]!,
      model: model[1]!,
      floorplan: floorplan[1]!,
      yearMin: Number(yearMin[1]),
      yearMax: Number(yearMax[1]),
      specOpen,
      specClose,
      body: source.slice(specOpen + 1, specClose),
    });
  }
  return blocks;
}

type PinHit = {
  make: string;
  model: string;
  floorplan: string;
  yearMin: number;
  yearMax: number;
  field: "uvwLbs" | "gvwrLbs";
  value: number;
};

function listPins(source: string, kind: "uvwPins" | "gvwrPins", field: "uvwLbs" | "gvwrLbs"): PinHit[] {
  const re = new RegExp(
    `${kind}\\(\\s*"([^"]+)"\\s*,\\s*"([^"]+)"\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)\\s*,\\s*\\[([^\\]]+)\\]\\s*,\\s*(\\d+)`,
    "g",
  );
  const hits: PinHit[] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    const plans = [...match[5]!.matchAll(/"([^"]+)"/g)].map((m) => m[1]!);
    for (const floorplan of plans) {
      hits.push({
        make: match[1]!,
        model: match[2]!,
        floorplan,
        yearMin: Number(match[3]),
        yearMax: Number(match[4]),
        field,
        value: Number(match[6]),
      });
    }
  }
  return hits;
}

function identityMatches(
  rowMake: string,
  rowModel: string,
  rowFloorplan: string,
  entry: ResearchEntry,
): boolean {
  const make = entry.make.toLowerCase();
  const model = entry.model.toLowerCase();
  if (!make.includes(rowMake.toLowerCase()) && !rowMake.toLowerCase().includes(make)) return false;
  if (!model.includes(rowModel.toLowerCase())) return false;
  if (modelPinBlocked(rowModel.toLowerCase(), model)) return false;
  return floorplanKey(rowFloorplan) === floorplanKey(entry.floorplan);
}

function exactSpan(row: { yearMin: number; yearMax: number }, span: YearSpan): boolean {
  return row.yearMin === span.yearMin && row.yearMax === span.yearMax;
}

function isProtectedSeneca2025(entry: ResearchEntry, field: string, span: YearSpan): boolean {
  if (field !== "uvwLbs") return false;
  if (floorplanKey(entry.floorplan) !== "37K") return false;
  if (span.yearMin !== 2025 || span.yearMax !== 2025) return false;
  const model = entry.model.toLowerCase();
  if (!entry.make.toLowerCase().includes("jayco")) return false;
  if (!model.includes("seneca")) return false;
  if (model.includes("xt") || model.includes("prestige")) return false;
  return true;
}

function sourceProse(entry: ResearchEntry): string {
  const note = entry.note?.trim();
  return note
    ? `${entry.sourceType}: ${note} ${entry.sourceUrl}`
    : `${entry.sourceType}: ${entry.sourceUrl}`;
}

function formatInsertedValue(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

function insertLines(source: string, specOpen: number, lines: string[]): string {
  const newline = source.indexOf("\n", specOpen);
  const at = newline === -1 ? specOpen + 1 : newline + 1;
  const nextBreak = source.indexOf("\n", at);
  const nextLine = source.slice(at, nextBreak === -1 ? at : nextBreak);
  const indent = nextLine.match(/^(\s+)/)?.[1] ?? "      ";
  const block = lines.map((line) => `${indent}${line}`).join("\n");
  return `${source.slice(0, at)}${block}\n${source.slice(at)}`;
}

export function applyResearchEntries(
  catalogSource: string,
  entries: ResearchEntry[],
): { catalogSource: string; changelog: ChangelogRow[]; unresolved: UnresolvedRow[] } {
  let source = catalogSource;
  const changelog: ChangelogRow[] = [];
  const unresolved: UnresolvedRow[] = [];

  for (const entry of entries) {
    if (!SOURCE_TYPES.has(entry.sourceType)) {
      unresolved.push({ entry, reason: "bad-source-type" });
      continue;
    }
    if (entry.confidence !== "high" && entry.confidence !== "low") {
      unresolved.push({ entry, reason: "bad-confidence" });
      continue;
    }
    if (!entry.sourceUrl || !/^https?:\/\//i.test(entry.sourceUrl)) {
      unresolved.push({ entry, reason: "missing-source-url" });
      continue;
    }
    const field = canonicalField(entry.field);
    if (!field) {
      unresolved.push({ entry, reason: "unknown-field" });
      continue;
    }
    const span = parseYearSpan(entry);
    if ("error" in span) {
      unresolved.push({ entry, reason: span.error });
      continue;
    }
    const converted = convertValue(field, entry.value, entry.unit);
    if ("error" in converted) {
      unresolved.push({ entry, reason: converted.error });
      continue;
    }

    const blocks = listSpecBlocks(source).filter(
      (row) => identityMatches(row.make, row.model, row.floorplan, entry) && exactSpan(row, span),
    );
    const pins = [
      ...listPins(source, "uvwPins", "uvwLbs"),
      ...listPins(source, "gvwrPins", "gvwrLbs"),
    ].filter(
      (row) =>
        row.field === field &&
        identityMatches(row.make, row.model, row.floorplan, entry) &&
        exactSpan(row, span),
    );

    if (isProtectedSeneca2025(entry, field, span) && (pins.some((pin) => pin.value === 24820) || blocks.some((block) => readSpecField(block.body, field).numeric === 24820))) {
      unresolved.push({
        entry,
        reason: "protected-seneca-2025-uvw-24820",
      });
      continue;
    }

    if (pins.length > 0) {
      unresolved.push({ entry, reason: "overwrite" });
      continue;
    }
    if (blocks.length === 0) {
      unresolved.push({ entry, reason: "unmatched" });
      continue;
    }
    if (blocks.length > 1) {
      unresolved.push({ entry, reason: "ambiguous" });
      continue;
    }

    const block = blocks[0]!;
    const existing = readSpecField(block.body, field);
    if (existing.present && !existing.blank) {
      unresolved.push({ entry, reason: "overwrite" });
      continue;
    }

    const gvwr = readSpecField(block.body, "gvwrLbs").numeric;
    const rangeError = plausible(field, converted.value, gvwr);
    if (rangeError) {
      unresolved.push({ entry, reason: rangeError });
      continue;
    }

    const lines = [`${field}: ${formatInsertedValue(converted.value)},`];
    if (!readSpecField(block.body, "sourceLabel").present) {
      lines.push(`sourceLabel: ${JSON.stringify(entry.sourceType)},`);
    }
    if (!readSpecField(block.body, "sourceUrl").present) {
      lines.push(`sourceUrl: ${JSON.stringify(entry.sourceUrl)},`);
    }
    if (entry.confidence === "low" && !readSpecField(block.body, "lowConfidence").present) {
      lines.push("lowConfidence: true,");
    }
    if (!readSpecField(block.body, "source").present) {
      lines.push(`source: ${JSON.stringify(sourceProse(entry))},`);
    }

    source = insertLines(source, block.specOpen, lines);
    changelog.push({
      year: span.yearMin === span.yearMax ? span.yearMin : null,
      yearRange: span.yearMin === span.yearMax ? null : `${span.yearMin}-${span.yearMax}`,
      make: entry.make,
      model: entry.model,
      floorplan: entry.floorplan,
      field,
      previous: null,
      value: converted.value,
      unit: converted.unit,
      sourceUrl: entry.sourceUrl,
      sourceType: entry.sourceType,
      confidence: entry.confidence,
      lowConfidence: entry.confidence === "low",
      note: entry.note?.trim() || null,
    });
  }

  return { catalogSource: source, changelog, unresolved };
}

export type ApplyPaths = {
  researchPath: string;
  catalogPath: string;
  changelogPath: string;
  unresolvedPath: string;
};

export function applyResearchFill(paths: ApplyPaths): {
  changelog: ChangelogRow[];
  unresolved: UnresolvedRow[];
} {
  const entries = JSON.parse(readFileSync(paths.researchPath, "utf8")) as ResearchEntry[];
  if (!Array.isArray(entries)) throw new Error("research-values.json must be an array");
  const catalogSource = readFileSync(paths.catalogPath, "utf8");
  const result = applyResearchEntries(catalogSource, entries);
  if (result.catalogSource !== catalogSource) {
    writeFileSync(paths.catalogPath, result.catalogSource);
  }
  mkdirSync(dirname(paths.changelogPath), { recursive: true });
  writeFileSync(paths.changelogPath, `${JSON.stringify(result.changelog, null, 2)}\n`);
  writeFileSync(paths.unresolvedPath, `${JSON.stringify(result.unresolved, null, 2)}\n`);
  return { changelog: result.changelog, unresolved: result.unresolved };
}

const isDirect =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirect) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  applyResearchFill({
    researchPath: resolve(root, "data/batch-fill/research-values.json"),
    catalogPath: resolve(root, "src/lib/rv/floorplanSpecs.ts"),
    changelogPath: resolve(root, "data/batch-fill/changelog.json"),
    unresolvedPath: resolve(root, "data/batch-fill/unresolved.json"),
  });
}
