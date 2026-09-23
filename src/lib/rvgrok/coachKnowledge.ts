/**
 * Shared compounding coach knowledge — validated research facts keyed by
 * the desk identity tuple (year + make + model + floorplan).
 *
 * Not the per-browser Facts cache (CHAT_MAY_WRITE_FACTS_CACHE stays false).
 * Not a per-query process cache. Brochure SoT remains rvData / catalog load.
 *
 * Pure logic lives here so Node tests can cover normalize / merge / reject
 * without touching Neon. The store is server-only.
 */

import { validateCatalogPatch } from "../rv/catalogPatch.ts";
import { validateLivePowertrain } from "../rv/livePowertrainGuard.ts";
import { peekCatalog } from "../rv/catalogLoad.ts";
import { findPowertrainCorrection } from "../rv/powertrainCorrections.ts";
import {
  lockIdentityTuple,
  resolveCatalogMake,
  resolveCatalogModel,
  resolveCoachIdentity,
  type CoachIdentity,
} from "./coachIdentity.ts";
import {
  inferQueriedField,
  notesConfirmQueriedField,
  type QueriedResearchField,
  type WebSearchNotes,
} from "./webSearch.ts";

export const COACH_KNOWLEDGE_SCHEMA_VERSION = 1;

/** Asking-price band goes stale fast. */
export const PRICE_FIELD_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** OEM-ish specs stay until TTL or a schema bump. */
export const SPEC_FIELD_TTL_MS = 90 * 24 * 60 * 60 * 1000;

export type CoachKnowledgeFieldKind = "spec" | "price";

export type CoachKnowledgeField = {
  value: string;
  kind: CoachKnowledgeFieldKind;
  researchedAt: string;
};

export type CoachKnowledgeFields = Record<string, CoachKnowledgeField>;

export type CoachKnowledgeKey = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
};

export type CoachKnowledgeRecord = {
  key: CoachKnowledgeKey;
  fields: CoachKnowledgeFields;
  sources: string[];
  researchedAt: string;
  confidence: "high" | "medium" | "low";
  schemaVersion: number;
  updatedAt: string;
};

export type CoachKnowledgeReadPlan = {
  key: CoachKnowledgeKey;
  fresh: CoachKnowledgeFields;
  stale: string[];
  skipLive: boolean;
  notes: string;
  catalogAddendum: string;
};

export type CoachKnowledgeWritePlan = {
  key: CoachKnowledgeKey;
  fields: CoachKnowledgeFields;
  sources: string[];
  confidence: "high" | "medium";
};

const PRICE_FIELDS = new Set(["price", "priceLow", "priceAvg", "priceHigh"]);

const STOREABLE_FIELDS = new Set([
  "gvwr",
  "uvw",
  "gcwr",
  "ncc",
  "ccc",
  "hitch",
  "payload",
  "tow",
  "horsepower",
  "engine",
  "chassis",
  "torque",
  "transmission",
  "fuel",
  "length",
  "mpg",
  "tanks",
  "price",
]);

const POWERTRAIN_FIELDS = [
  "engine",
  "horsepower",
  "torque",
  "chassis",
  "transmission",
  "fuel",
] as const;

const REJECT_VALUE_RE =
  /\b(EST\.?|typical class range|low confidence|UNAVAILABLE|WEB SEARCH NOT AVAILABLE|unknown|insufficient|confirmed:\s*no|n\/a|not (?:found|published)|could not find)\b/i;

function keyPart(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[_/,]+/g, " ")
    .replace(/[\s-]+/g, " ")
    .trim();
}

function yearPart(s: string): string {
  const m = String(s || "").match(/\b(19|20)\d{2}\b/);
  return m?.[0] || "";
}

/** Stable unique tuple. Dutch Star → Newmar. Floorplan may be empty. */
export function normalizeCoachKnowledgeKey(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): CoachKnowledgeKey | null {
  const locked = lockIdentityTuple({
    year: yearPart(identity.year) || (identity.year || "").trim(),
    make: resolveCatalogMake(identity.make || ""),
    model: identity.model
      ? resolveCatalogModel(
          identity.make || "",
          identity.model,
          identity.floorplan || "",
        )
      : "",
    floorplan: (identity.floorplan || "").trim(),
    source: "message",
  });
  const year = yearPart(locked.year);
  const make = keyPart(locked.make);
  const model = keyPart(locked.model);
  if (!year || !make || !model) return null;
  return {
    year,
    make,
    model,
    floorplan: keyPart(locked.floorplan),
  };
}

export function coachKnowledgeKeyEquals(
  a: CoachKnowledgeKey | null | undefined,
  b: CoachKnowledgeKey | null | undefined,
): boolean {
  if (!a || !b) return false;
  return (
    a.year === b.year &&
    a.make === b.make &&
    a.model === b.model &&
    a.floorplan === b.floorplan
  );
}

export function formatCoachKnowledgeLabel(key: CoachKnowledgeKey): string {
  return [key.year, key.make, key.model, key.floorplan]
    .filter(Boolean)
    .join(" ");
}

export function isRejectedKnowledgeValue(value: string | null | undefined): boolean {
  const v = (value || "").trim();
  if (!v || v === "—" || v === "-") return true;
  if (REJECT_VALUE_RE.test(v)) return true;
  return false;
}

function fieldKind(name: string): CoachKnowledgeFieldKind {
  return PRICE_FIELDS.has(name) ? "price" : "spec";
}

function fieldTtlMs(kind: CoachKnowledgeFieldKind): number {
  return kind === "price" ? PRICE_FIELD_TTL_MS : SPEC_FIELD_TTL_MS;
}

export function isKnowledgeFieldFresh(
  field: CoachKnowledgeField,
  now = Date.now(),
  schemaVersion = COACH_KNOWLEDGE_SCHEMA_VERSION,
): boolean {
  if (schemaVersion !== COACH_KNOWLEDGE_SCHEMA_VERSION) return false;
  if (isRejectedKnowledgeValue(field.value)) return false;
  const at = Date.parse(field.researchedAt);
  if (!Number.isFinite(at)) return false;
  return now - at <= fieldTtlMs(field.kind);
}

/** Merge incoming confirmed non-null fields onto the existing bag. */
export function mergeConfirmedFields(
  existing: CoachKnowledgeFields | null | undefined,
  incoming: CoachKnowledgeFields | null | undefined,
): CoachKnowledgeFields {
  const out: CoachKnowledgeFields = { ...(existing || {}) };
  for (const [name, field] of Object.entries(incoming || {})) {
    if (!STOREABLE_FIELDS.has(name)) continue;
    if (!field?.value || isRejectedKnowledgeValue(field.value)) continue;
    out[name] = {
      value: field.value.trim(),
      kind: field.kind || fieldKind(name),
      researchedAt: field.researchedAt || new Date().toISOString(),
    };
  }
  return out;
}

export function splitFreshKnowledgeFields(
  fields: CoachKnowledgeFields | null | undefined,
  now = Date.now(),
  schemaVersion = COACH_KNOWLEDGE_SCHEMA_VERSION,
): { fresh: CoachKnowledgeFields; stale: string[] } {
  const fresh: CoachKnowledgeFields = {};
  const stale: string[] = [];
  for (const [name, field] of Object.entries(fields || {})) {
    if (isKnowledgeFieldFresh(field, now, schemaVersion)) fresh[name] = field;
    else stale.push(name);
  }
  return { fresh, stale };
}

function queriedFieldIsStoreable(field: QueriedResearchField): boolean {
  return STOREABLE_FIELDS.has(field);
}

export function shouldSkipLiveForAsk(
  query: string,
  fresh: CoachKnowledgeFields,
): boolean {
  const field = inferQueriedField(query);
  if (field === "repair" || field === "generic") return false;
  if (!queriedFieldIsStoreable(field)) return false;
  return Boolean(fresh[field]?.value);
}

export function formatCoachKnowledgeNotes(
  key: CoachKnowledgeKey,
  fields: CoachKnowledgeFields,
): string {
  const lines = Object.entries(fields)
    .filter(([, f]) => f?.value && !isRejectedKnowledgeValue(f.value))
    .map(([name, f]) => `${name}: ${f.value}`);
  if (!lines.length) return "";
  return [
    `SHARED COACH KNOWLEDGE for ${formatCoachKnowledgeLabel(key)} (validated, fresh):`,
    ...lines,
  ].join("\n");
}

export function planCoachKnowledgeRead(opts: {
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">;
  query: string;
  record: CoachKnowledgeRecord | null;
  now?: number;
}): CoachKnowledgeReadPlan | null {
  const key = normalizeCoachKnowledgeKey(opts.identity);
  if (!key) return null;
  if (opts.record && !coachKnowledgeKeyEquals(opts.record.key, key)) {
    return {
      key,
      fresh: {},
      stale: [],
      skipLive: false,
      notes: "",
      catalogAddendum: "",
    };
  }
  const { fresh, stale } = splitFreshKnowledgeFields(
    opts.record?.fields,
    opts.now,
    opts.record?.schemaVersion ?? COACH_KNOWLEDGE_SCHEMA_VERSION,
  );
  const notes = formatCoachKnowledgeNotes(key, fresh);
  const skipLive = shouldSkipLiveForAsk(opts.query, fresh);
  return {
    key,
    fresh,
    stale,
    skipLive,
    notes,
    catalogAddendum: notes
      ? `${notes}\nAlready confirmed for THIS year/make/model/floorplan — do not re-search these fields.`
      : "",
  };
}

function cleanExtracted(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .replace(/[.;,]+$/g, "")
    .trim();
}

function parseHpNum(v: string | null | undefined): number | null {
  if (!v) return null;
  const m = String(v).replace(/,/g, "").match(/(\d{2,4})/);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  return n > 0 ? n : null;
}

function parseLbNum(v: string | null | undefined): number | null {
  if (!v) return null;
  const m = String(v).replace(/,/g, "").match(/(\d{4,6})/);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  return n > 0 ? n : null;
}

const EXTRACTORS: Array<{
  name: string;
  re: RegExp;
}> = [
  { name: "gvwr", re: /\bgvwr\b[^\d]{0,24}([\d,]{4,7})\s*(?:lb|lbs|pounds|#)?/i },
  { name: "uvw", re: /\buvw\b[^\d]{0,24}([\d,]{4,7})\s*(?:lb|lbs|pounds|#)?/i },
  { name: "gcwr", re: /\bgcwr\b[^\d]{0,24}([\d,]{4,7})\s*(?:lb|lbs|pounds|#)?/i },
  { name: "ncc", re: /\bncc\b[^\d]{0,24}([\d,]{3,7})\s*(?:lb|lbs|pounds|#)?/i },
  { name: "ccc", re: /\bccc\b[^\d]{0,24}([\d,]{3,7})\s*(?:lb|lbs|pounds|#)?/i },
  {
    name: "hitch",
    re: /\bhitch\b[^\d]{0,28}([\d,]{3,7})\s*(?:lb|lbs|pounds|#)?/i,
  },
  {
    name: "payload",
    re: /\bpayload\b[^\d]{0,24}([\d,]{3,7})\s*(?:lb|lbs|pounds|#)?/i,
  },
  {
    name: "tow",
    re: /\btow(?:ing)?(?:\s+(?:capacity|rating))?\b[^\d]{0,24}([\d,]{3,7})\s*(?:lb|lbs)?/i,
  },
  {
    name: "horsepower",
    re: /\b(?:horsepower|hp)\b[^\d]{0,16}(\d{2,4})\s*(?:hp|horsepower)?/i,
  },
  { name: "torque", re: /\btorque\b[^\d]{0,16}([\d,]{3,5})\s*(?:lb-?ft)?/i },
  { name: "engine", re: /\bengine\b[:\s]+([^\n.]{4,80})/i },
  { name: "chassis", re: /\bchassis\b[:\s]+([^\n.]{4,80})/i },
  { name: "transmission", re: /\btransmission\b[:\s]+([^\n.]{3,60})/i },
  { name: "fuel", re: /\bfuel(?:\s*type)?\b[:\s]+([^\n.]{3,40})/i },
  { name: "length", re: /\blength\b[:\s]+([^\n.]{2,40})/i },
  { name: "mpg", re: /\b(\d{1,2}(?:\.\d+)?)\s*mpg\b/i },
  {
    name: "tanks",
    re: /\b(?:holding\s+tanks?|fresh|gr[ae]y|black)\b[:\s]+([^\n.]{4,80})/i,
  },
  {
    name: "price",
    re: /\b(?:low\s*\/\s*average\s*\/\s*high|asking(?:\s*price)?)\b[:\s]+([^\n]{6,80})/i,
  },
];

function extractSources(notes: string): string[] {
  const urls = [...notes.matchAll(/https?:\/\/[^\s)>\]]+/gi)].map((m) =>
    m[0]!.replace(/[.,;]+$/g, ""),
  );
  const labels: string[] = [];
  if (/\bbrochure\b/i.test(notes)) labels.push("oem brochure");
  if (/\boem\b|factory/i.test(notes)) labels.push("oem");
  if (/\bdealer\b/i.test(notes)) labels.push("dealer listing");
  return [...new Set([...labels, ...urls])].slice(0, 12);
}

/**
 * Parse OEM-ish confirmed fields from live research notes.
 * EST / UNAVAILABLE / miss language never become stored truth.
 */
export function parseConfirmedFieldsFromNotes(
  notes: string,
  query: string,
  researchedAt = new Date().toISOString(),
): CoachKnowledgeFields {
  const n = (notes || "").trim();
  if (!n || /WEB SEARCH NOT AVAILABLE/i.test(n)) return {};
  if (isRejectedKnowledgeValue(n) && !/\bconfirmed:\s*yes\b/i.test(n)) {
    return {};
  }

  const out: CoachKnowledgeFields = {};
  for (const { name, re } of EXTRACTORS) {
    const m = n.match(re);
    if (!m?.[1]) continue;
    const value = cleanExtracted(m[1]);
    if (isRejectedKnowledgeValue(value)) continue;
    if (name === "engine" && value.length < 4) continue;
    if (
      (name === "gvwr" ||
        name === "uvw" ||
        name === "gcwr" ||
        name === "ncc" ||
        name === "ccc" ||
        name === "hitch" ||
        name === "payload" ||
        name === "tow") &&
      parseLbNum(value) == null
    ) {
      continue;
    }
    if (name === "horsepower" && parseHpNum(value) == null) continue;
    out[name] = {
      value,
      kind: fieldKind(name),
      researchedAt,
    };
  }

  const queried = inferQueriedField(query);
  if (queried !== "generic" && queried !== "repair" && out[queried]) {
    return out;
  }
  if (notesConfirmQueriedField(n, query) || /\bconfirmed:\s*yes\b/i.test(n)) {
    return out;
  }
  return {};
}

function dropPowertrain(fields: CoachKnowledgeFields): CoachKnowledgeFields {
  const out = { ...fields };
  for (const name of POWERTRAIN_FIELDS) delete out[name];
  return out;
}

/** Drop EST leftovers and sibling-series / fuel-family theft. */
export function gateKnowledgeFields(
  key: CoachKnowledgeKey,
  fields: CoachKnowledgeFields,
  sources: string[] = [],
): CoachKnowledgeFields {
  let next = mergeConfirmedFields({}, fields);
  if (!Object.keys(next).length) return {};

  const engine = next.engine?.value || "";
  const hp = parseHpNum(next.horsepower?.value);
  const fuel = next.fuel?.value || "";
  const chassis = next.chassis?.value || "";
  const transmission = next.transmission?.value || "";
  const torque = parseLbNum(next.torque?.value);

  if (engine || hp != null || fuel) {
    const catalogMake = resolveCatalogMake(key.make);
    const catalogModel = resolveCatalogModel(
      catalogMake,
      key.model,
      key.floorplan,
    );
    const spec = peekCatalog()?.RV_DATA?.[catalogMake]?.[catalogModel];
    const pin = findPowertrainCorrection(
      key.year,
      catalogMake,
      catalogModel,
      key.floorplan,
    );
    const reasons = validateLivePowertrain({
      year: key.year,
      make: catalogMake,
      model: catalogModel,
      floorplan: key.floorplan,
      catalogFuelType: spec?.fuelType,
      catalogType: spec?.type,
      catalogEngine: spec?.engine,
      catalogHp: spec?.horsepower,
      live: {
        engine: engine || null,
        horsepower: hp,
        chassis: chassis || null,
        transmission: transmission || null,
        fuelType: fuel || null,
        torqueLbFt: torque,
        confidence: "high",
      },
      pin,
    });
    if (reasons.length) next = dropPowertrain(next);

    if (engine) {
      const yearNum = parseInt(key.year, 10);
      const patch = validateCatalogPatch({
        make: catalogMake,
        model: catalogModel,
        yearFrom: yearNum,
        yearTo: yearNum,
        floorplan: key.floorplan || null,
        engine,
        horsepower: hp,
        torqueLbFt: torque,
        chassis: chassis || null,
        transmission: transmission || null,
        fuelType: fuel || spec?.fuelType || null,
        confidence: sources.length ? "high" : "medium",
        sources,
        notes: null,
      }, spec?.fuelType);
      if (!patch.ok) next = dropPowertrain(next);
    }
  }

  return next;
}

export function resolveKnowledgeIdentity(
  query: string,
  catalogBlock?: string,
  explicit?: CoachIdentity | null,
): CoachIdentity | null {
  if (explicit?.year && explicit.make && explicit.model) {
    return lockIdentityTuple(explicit);
  }
  return resolveCoachIdentity(query, null, catalogBlock || "");
}

export function planCoachKnowledgeWrite(opts: {
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan"> | null;
  query: string;
  result: WebSearchNotes;
  researchedAt?: string;
}): CoachKnowledgeWritePlan | null {
  if (!opts.result.ok) return null;
  if (/catalog-pin/i.test(opts.result.model || "")) return null;
  if (/WEB SEARCH NOT AVAILABLE/i.test(opts.result.notes)) return null;
  if (!notesConfirmQueriedField(opts.result.notes, opts.query)) return null;
  if (!opts.identity) return null;
  const key = normalizeCoachKnowledgeKey(opts.identity);
  if (!key) return null;

  const researchedAt = opts.researchedAt || new Date().toISOString();
  const parsed = parseConfirmedFieldsFromNotes(
    opts.result.notes,
    opts.query,
    researchedAt,
  );
  const sources = extractSources(opts.result.notes);
  const fields = gateKnowledgeFields(key, parsed, sources);
  if (!Object.keys(fields).length) return null;

  return {
    key,
    fields,
    sources,
    confidence: sources.some((s) => /oem|brochure|http/i.test(s))
      ? "high"
      : "medium",
  };
}

export function mergeKnowledgeSources(
  existing: string[] | null | undefined,
  incoming: string[] | null | undefined,
): string[] {
  return [...new Set([...(existing || []), ...(incoming || [])])]
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
}
