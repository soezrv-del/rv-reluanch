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
import type { LiveDossier } from "./liveDossier.ts";
import {
  planFactsDossierResearch,
  resolveFactsCatalogPins,
  type FactsCatalogCandidate,
  type FactsDossierGapPlan,
  type FactsHardField,
  type FactsResolvedPins,
} from "./factsDossierGapPlan.ts";
import { mergeSharedCapacity, resolveSharedSpec } from "./sharedSpec.ts";

export {
  FACTS_DOSSIER_HARD_FIELDS,
  factsDossierResearchQuery,
  fieldPresent,
  pinsHaveHardFacts,
  planFactsDossierResearch,
  resolveFactsCatalogPins,
  type FactsCatalogCandidate,
  type FactsDossierGapPlan,
  type FactsHardField,
  type FactsResolvedPins,
} from "./factsDossierGapPlan.ts";

/** Gap browse budget — Facts-only; stay under the 180s client wait so extract has room. */
export const FACTS_GAP_RESEARCH_TIMEOUT_MS = 90_000;

/** Soft narrative only — overview / issues / sentiment / market / sources. Cheaper than gap. */
export const FACTS_SOFT_RESEARCH_TIMEOUT_MS = 20_000;

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

/**
 * Browse only for missing / non-pin hard fields. Complete pins → skip.
 * Does not write the Neon sidecar.
 */
export async function researchFactsDossierNotes(
  opts: ResearchFactsDossierNotesOpts,
): Promise<FactsDossierResearchNotes | null> {
  const catalogPins = resolveFactsCatalogPins(opts);
  const snap = await resolveSharedSpec(
    {
      year: opts.year,
      make: opts.make,
      model: opts.model,
      floorplan: opts.floorplan,
    },
    { rvType: catalogPins.rvType },
  );
  const pins = mergeSharedCapacity(catalogPins, snap);
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
