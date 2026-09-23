/**
 * Facts live dossier — catalog / brochure pins first, internet only for gaps.
 *
 * Brochure catalog is the months-built SoT. Live browse runs only for hard
 * fields that are missing or not a real pin. Narrow query + dedicated timeout.
 * Soft-fail keeps catalog paint. Pins still win. No invented OEM numbers.
 *
 * Separate from the RV Grok Neon sidecar. Does not flip the Grok
 * access-admin search-first / catalog-first toggle.
 */

import {
  executeWebResearch,
  type ExecuteWebResearchOpts,
  type WebResearchApiBody,
} from "../rvgrok/webResearchTelemetry.ts";
import { WEB_SEARCH_MODELS } from "../rvgrok/webSearch.ts";
import { applyPublishedEngineTorque } from "./engineTorqueByVariant.ts";
import { findOemFloorplanSpec } from "./floorplanSpecs.ts";
import type { LiveDossier } from "./liveDossier.ts";
import { findPowertrainCorrection } from "./powertrainCorrections.ts";

/** Gap browse budget — Facts-only; stay under the 180s client wait so extract has room. */
export const FACTS_GAP_RESEARCH_TIMEOUT_MS = 90_000;

/** Soft narrative only — overview / issues / sentiment / market / sources. Cheaper than gap. */
export const FACTS_SOFT_RESEARCH_TIMEOUT_MS = 20_000;

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
};

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

export type FactsDossierResearchNotes = {
  text: string;
  model: string;
  skipped: boolean;
  gaps: FactsHardField[];
  pins: FactsResolvedPins;
};

export type FactsSoftFields = {
  overview: string | null;
  commonIssues: string[];
  ownerSentiment: string | null;
  marketNotes: string | null;
  sourcesNote: string | null;
};

export type FactsSoftResearchNotes = {
  text: string;
  model: string;
  fields: FactsSoftFields;
};

export type ResearchFactsDossierNotesOpts = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  /** Year-band / brochure candidate — lock + gap source. */
  candidate?: FactsCatalogCandidate;
  catalogBlock?: string;
  execute?: (
    opts: ExecuteWebResearchOpts,
  ) => Promise<WebResearchApiBody>;
  /** Access-admin research *provider* override only. */
  researchProvider?: string;
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

function fieldPresent(
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
  uvw: "UVW",
  tanks: "holding tanks",
  length: "length",
};

/** Narrow query — avoid the 52s coach-report research budget. */
export function factsDossierResearchQuery(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  gaps?: readonly FactsHardField[];
}): string {
  const plan = (input.floorplan || "").trim();
  const coach = `${input.year} ${input.make} ${input.model}${
    plan ? ` ${plan}` : ""
  }`.replace(/\s+/g, " ").trim();
  const gaps = input.gaps?.length
    ? input.gaps
    : FACTS_DOSSIER_HARD_FIELDS;
  const needed = gaps.map((g) => GAP_QUERY_LABEL[g]).join(", ");
  return `OEM published ${needed} for ${coach} only. Brochure / factory number. Do not gather overview, market, or reliability.`;
}

/** Soft-field query — no hardware words that trip the 52s report classifier. */
export function factsDossierSoftQuery(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
}): string {
  const plan = (input.floorplan || "").trim();
  const coach = `${input.year} ${input.make} ${input.model}${
    plan ? ` ${plan}` : ""
  }`.replace(/\s+/g, " ").trim();
  return `Owner chatter and used-market notes for ${coach}. Labeled lines only: OVERVIEW / ISSUES / SENTIMENT / MARKET / SOURCES. Narrative only. No hardware numbers.`;
}

const SOFT_LABEL_RE =
  /^(overview|issues?|common\s+issues?|sentiment|owner\s+sentiment|market|market\s+notes?|sources?)\s*:\s*/i;

function nextSoftLabelIndex(lines: string[], from: number): number {
  for (let i = from; i < lines.length; i++) {
    if (SOFT_LABEL_RE.test(lines[i]!.trim())) return i;
  }
  return -1;
}

function splitSoftList(raw: string): string[] {
  return raw
    .split(/\n|;|•|\u2022|(?:^|\s)[-–]\s+/)
    .map((s) => s.replace(/^[\s*•\-–]+/, "").trim())
    .filter((s) => s.length >= 3)
    .slice(0, 5);
}

function clipSoftLine(raw: string, max = 280): string | null {
  const s = raw.replace(/\s+/g, " ").trim();
  if (s.length < 8) return null;
  return s.length > max ? `${s.slice(0, max - 1).trim()}…` : s;
}

/** Parse labeled soft notes. Unlabeled hardware dumps are ignored. */
export function parseFactsSoftNotes(text: string): FactsSoftFields {
  const empty: FactsSoftFields = {
    overview: null,
    commonIssues: [],
    ownerSentiment: null,
    marketNotes: null,
    sourcesNote: null,
  };
  const raw = (text || "").trim();
  if (!raw) return empty;

  const lines = raw.split(/\n/);
  const buckets: Record<string, string[]> = {
    overview: [],
    issues: [],
    sentiment: [],
    market: [],
    sources: [],
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    const m = line.match(SOFT_LABEL_RE);
    if (!m) continue;
    const key = m[1]!.toLowerCase();
    const bucket = key.startsWith("issue")
      ? "issues"
      : key.includes("sentiment")
        ? "sentiment"
        : key.startsWith("market")
          ? "market"
          : key.startsWith("source")
            ? "sources"
            : "overview";
    const rest = line.slice(m[0].length).trim();
    const stop = nextSoftLabelIndex(lines, i + 1);
    const block = [
      rest,
      ...lines
        .slice(i + 1, stop === -1 ? undefined : stop)
        .map((l) => l.trim()),
    ]
      .filter(Boolean)
      .join("\n");
    if (block) buckets[bucket]!.push(block);
  }

  return {
    overview: clipSoftLine(buckets.overview.join(" ")),
    commonIssues: splitSoftList(buckets.issues.join("\n")),
    ownerSentiment: clipSoftLine(buckets.sentiment.join(" ")),
    marketNotes: clipSoftLine(buckets.market.join(" ")),
    sourcesNote: clipSoftLine(buckets.sources.join(" · "), 360),
  };
}

export function mergeSoftFieldsIntoDossier(
  d: LiveDossier,
  soft: FactsSoftFields,
): LiveDossier {
  const sourcesNote = [d.sourcesNote, soft.sourcesNote]
    .filter(Boolean)
    .join(" · ");
  return {
    ...d,
    overview: soft.overview || d.overview,
    commonIssues: soft.commonIssues.length ? soft.commonIssues : d.commonIssues,
    ownerSentiment: soft.ownerSentiment || d.ownerSentiment,
    marketNotes: soft.marketNotes || d.marketNotes,
    sourcesNote: sourcesNote || d.sourcesNote,
  };
}

export function softFieldsHaveNarrative(soft: FactsSoftFields): boolean {
  return Boolean(
    soft.overview ||
      soft.ownerSentiment ||
      soft.marketNotes ||
      soft.sourcesNote ||
      soft.commonIssues.length,
  );
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
  const skipLive = gaps.length === 0;
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
        }),
  };
}

/**
 * In-memory dossier cache is a final answer only when catalog pins are
 * complete (`skipLive`). Hard gaps must fall through to gap browse.
 */
export function shouldServeFactsDossierCache(
  plan: Pick<FactsDossierGapPlan, "skipLive">,
): boolean {
  return plan.skipLive === true;
}

/**
 * Persist cache for complete-pin skips, or after browse leaves no hard gaps.
 * Incomplete extracts must not pin a coach for the 6h TTL.
 */
export function shouldStoreFactsDossierCache(opts: {
  skipLive: boolean;
  remainingHardGaps?: readonly FactsHardField[];
}): boolean {
  if (opts.skipLive) return true;
  return (
    Array.isArray(opts.remainingHardGaps) &&
    opts.remainingHardGaps.length === 0
  );
}

export function catalogPinsToLiveDossier(opts: {
  year: number;
  make: string;
  model: string;
  floorplan?: string;
  pins: FactsResolvedPins;
}): LiveDossier {
  const note =
    opts.pins.sourcesNote ||
    "Catalog / brochure pins — hard fields already present, live browse skipped.";
  return {
    year: opts.year,
    make: opts.make,
    model: opts.model,
    floorplan: opts.floorplan || null,
    rvType: opts.pins.rvType,
    engine: opts.pins.engine,
    horsepower: opts.pins.horsepower,
    torqueLbFt: opts.pins.torqueLbFt,
    transmission: opts.pins.transmission,
    chassis: opts.pins.chassis,
    fuelType: opts.pins.fuelType,
    towingCapacityLbs: null,
    fuelCapacityGal: null,
    overallLength: opts.pins.lengthFt,
    exteriorWidth: null,
    exteriorHeight: null,
    interiorHeight: null,
    gvwrLbs: opts.pins.gvwrLbs,
    uvwLbs: opts.pins.uvwLbs,
    cccLbs:
      opts.pins.gvwrLbs != null && opts.pins.uvwLbs != null
        ? Math.max(0, opts.pins.gvwrLbs - opts.pins.uvwLbs)
        : null,
    slideouts: null,
    sleeps: null,
    freshWaterGal: opts.pins.freshWaterGal,
    grayWaterGal: opts.pins.grayWaterGal,
    blackWaterGal: opts.pins.blackWaterGal,
    generator: null,
    mpgHighwayEst: null,
    warranty: null,
    floorplansThisYear: [],
    overview: null,
    keyFeatures: [],
    reliabilitySummary: null,
    commonIssues: [],
    servicePriorities: [],
    ownerSentiment: null,
    ratingEstimate: null,
    marketNotes: null,
    tradeInUsd: null,
    retailLowUsd: null,
    retailHighUsd: null,
    msrpLowUsd: null,
    msrpHighUsd: null,
    confidence: "high",
    sourcesNote: note,
    fetchedAt: new Date().toISOString(),
    live: true,
  };
}

export function pinsHaveHardFacts(pins: FactsResolvedPins): boolean {
  return FACTS_DOSSIER_HARD_FIELDS.some((field) => fieldPresent(field, pins));
}

/**
 * Browse only for missing / non-pin hard fields. Complete pins → skip.
 * Does not write the Neon sidecar.
 */
export async function researchFactsDossierNotes(
  opts: ResearchFactsDossierNotesOpts,
): Promise<FactsDossierResearchNotes | null> {
  const pins = resolveFactsCatalogPins(opts);
  const plan = planFactsDossierResearch({
    year: opts.year,
    make: opts.make,
    model: opts.model,
    floorplan: opts.floorplan,
    pins,
  });

  if (plan.skipLive || !plan.query) {
    return {
      text: "",
      model: "catalog-pin",
      skipped: true,
      gaps: [],
      pins,
    };
  }

  const execute = opts.execute ?? executeWebResearch;
  const researched = await execute({
    query: plan.query,
    catalogBlock: opts.catalogBlock,
    apiKey: process.env.XAI_API_KEY,
    timeoutMs: FACTS_GAP_RESEARCH_TIMEOUT_MS,
    models: WEB_SEARCH_MODELS,
    profile: "chat",
    skipGate: true,
    maxAttempts: 1,
    researchProvider: opts.researchProvider,
  });

  if (!researched.ok || !researched.notes.trim()) {
    return null;
  }

  // Catalog-pin salvage from a timed-out browse — do not extract.
  if (researched.model === "catalog-pin") {
    return {
      text: "",
      model: "catalog-pin",
      skipped: true,
      gaps: plan.gaps,
      pins,
    };
  }

  return {
    text: researched.notes,
    model: researched.model || "web-research",
    skipped: false,
    gaps: plan.gaps,
    pins,
  };
}

/**
 * Cheap soft-field pass. Never re-asks hard powertrain / weights.
 * Fail / timeout → null; caller keeps catalog or gap-filled hard pins.
 */
export async function researchFactsSoftNotes(
  opts: ResearchFactsDossierNotesOpts,
): Promise<FactsSoftResearchNotes | null> {
  const query = factsDossierSoftQuery(opts);
  const execute = opts.execute ?? executeWebResearch;
  const researched = await execute({
    query,
    catalogBlock: opts.catalogBlock,
    apiKey: process.env.XAI_API_KEY,
    timeoutMs: FACTS_SOFT_RESEARCH_TIMEOUT_MS,
    models: WEB_SEARCH_MODELS,
    profile: "chat",
    skipGate: true,
    maxAttempts: 1,
    researchProvider: opts.researchProvider,
  });

  if (!researched.ok || !researched.notes.trim()) return null;
  if (researched.model === "catalog-pin") return null;

  const fields = parseFactsSoftNotes(researched.notes);
  if (!softFieldsHaveNarrative(fields)) return null;
  return {
    text: researched.notes,
    model: researched.model || "web-research",
    fields,
  };
}
