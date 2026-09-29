/**
 * Server-only Neon load / upsert for shared RV Grok coach knowledge.
 * Never import from client components.
 *
 * Fail-soft: a missing table / DB blip must not take research down.
 * Unowned shared rows (no visitor column, no auth gate). Phone bot stays out.
 */

import { getSql } from "@/lib/db";
import {
  COACH_KNOWLEDGE_SCHEMA_VERSION,
  confidenceRank,
  formatCoachKnowledgeLabel,
  mergeConfirmedFields,
  mergeKnowledgeSources,
  normalizeCoachKnowledgeKey,
  type CoachKnowledgeConfidence,
  type CoachKnowledgeFields,
  type CoachKnowledgeKey,
  type CoachKnowledgeRecord,
  type CoachKnowledgeWritePlan,
} from "./coachKnowledge.ts";
import { logCoachKnowledgeWriteFailed } from "./webResearchTelemetry.ts";
import type { CoachIdentity } from "./coachIdentity.ts";

type KnowledgeRow = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  fields: unknown;
  sources: unknown;
  researched_at: string;
  confidence: string;
  schema_version: number | string;
  updated_at: string;
  promoted?: boolean | null;
};

function parseFields(raw: unknown): CoachKnowledgeFields {
  if (!raw) return {};
  let obj = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return {};
    }
  }
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return {};
  const out: CoachKnowledgeFields = {};
  for (const [name, value] of Object.entries(obj as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const field = value as {
      value?: unknown;
      kind?: unknown;
      researchedAt?: unknown;
      confidence?: unknown;
      sourceUrl?: unknown;
    };
    if (typeof field.value !== "string" || !field.value.trim()) continue;
    const confidence =
      field.confidence === "high" ||
      field.confidence === "medium" ||
      field.confidence === "low"
        ? field.confidence
        : undefined;
    out[name] = {
      value: field.value.trim(),
      kind: field.kind === "price" ? "price" : "spec",
      researchedAt:
        typeof field.researchedAt === "string" ? field.researchedAt : "",
      ...(confidence ? { confidence } : {}),
      ...(typeof field.sourceUrl === "string" && field.sourceUrl
        ? { sourceUrl: field.sourceUrl }
        : {}),
    };
  }
  return out;
}

function parseSources(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((s) => String(s || "").trim()).filter(Boolean).slice(0, 12);
  }
  if (typeof raw === "string") {
    try {
      return parseSources(JSON.parse(raw));
    } catch {
      return [];
    }
  }
  return [];
}

function mapRow(row: KnowledgeRow): CoachKnowledgeRecord {
  const schemaVersion = Number(row.schema_version) || COACH_KNOWLEDGE_SCHEMA_VERSION;
  return {
    key: {
      year: String(row.year || ""),
      make: String(row.make || ""),
      model: String(row.model || ""),
      floorplan: String(row.floorplan || ""),
    },
    fields: parseFields(row.fields),
    sources: parseSources(row.sources),
    researchedAt: String(row.researched_at || ""),
    confidence:
      row.confidence === "high" || row.confidence === "low"
        ? row.confidence
        : "medium",
    schemaVersion,
    updatedAt: String(row.updated_at || ""),
    promoted: row.promoted === true,
  };
}

export async function loadCoachKnowledge(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): Promise<CoachKnowledgeRecord | null> {
  const key = normalizeCoachKnowledgeKey(identity);
  if (!key) return null;
  try {
    const sql = await getSql();
    const rows = await sql<KnowledgeRow>`
      select year, make, model, floorplan, fields, sources,
             researched_at, confidence, schema_version, updated_at, promoted
      from rvgrok_coach_knowledge
      where year = ${key.year}
        and make = ${key.make}
        and model = ${key.model}
        and floorplan = ${key.floorplan}
      limit 1
    `;
    return rows[0] ? mapRow(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function upsertCoachKnowledge(input: {
  key: CoachKnowledgeKey;
  fields: CoachKnowledgeFields;
  sources?: string[];
  confidence?: "high" | "medium" | "low";
}): Promise<CoachKnowledgeRecord | null> {
  const key = normalizeCoachKnowledgeKey(input.key);
  if (!key) return null;
  const incomingConfidence: CoachKnowledgeConfidence =
    input.confidence === "high" || input.confidence === "low"
      ? input.confidence
      : "medium";
  const incoming = mergeConfirmedFields({}, input.fields, {
    incomingConfidence,
  });
  if (!Object.keys(incoming).length) return null;

  try {
    const existing = await loadCoachKnowledge(key);
    const fields = mergeConfirmedFields(existing?.fields, incoming, {
      incomingConfidence,
      existingConfidence:
        existing?.confidence === "high" || existing?.confidence === "low"
          ? existing.confidence
          : "medium",
    });
    const sources = mergeKnowledgeSources(existing?.sources, input.sources);
    const confidence =
      confidenceRank(existing?.confidence) >= confidenceRank(incomingConfidence)
        ? existing?.confidence || incomingConfidence
        : incomingConfidence;
    const sql = await getSql();
    const rows = await sql.query<KnowledgeRow>(
      `insert into rvgrok_coach_knowledge (
         year, make, model, floorplan, fields, sources,
         researched_at, confidence, schema_version, updated_at
       ) values ($1, $2, $3, $4, $5::jsonb, $6::jsonb, now(), $7, $8, now())
       on conflict (year, make, model, floorplan) do update set
         fields = excluded.fields,
         sources = excluded.sources,
         researched_at = now(),
         confidence = excluded.confidence,
         schema_version = excluded.schema_version,
         updated_at = now()
       returning year, make, model, floorplan, fields, sources,
                 researched_at, confidence, schema_version, updated_at, promoted`,
      [
        key.year,
        key.make,
        key.model,
        key.floorplan,
        JSON.stringify(fields),
        JSON.stringify(sources),
        confidence,
        COACH_KNOWLEDGE_SCHEMA_VERSION,
      ],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  } catch (err) {
    logCoachKnowledgeWriteFailed({
      coachKey: formatCoachKnowledgeLabel(key),
      fields: Object.keys(incoming),
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

export async function listCoachKnowledge(limit = 40): Promise<CoachKnowledgeRecord[]> {
  try {
    const sql = await getSql();
    const rows = await sql<KnowledgeRow>`
      select year, make, model, floorplan, fields, sources,
             researched_at, confidence, schema_version, updated_at, promoted
      from rvgrok_coach_knowledge
      order by updated_at desc
      limit ${Math.max(1, Math.min(limit, 80))}
    `;
    return rows.map(mapRow);
  } catch {
    return [];
  }
}

export async function promoteCoachKnowledge(
  identity: Pick<CoachKnowledgeKey, "year" | "make" | "model" | "floorplan">,
): Promise<boolean> {
  const key = normalizeCoachKnowledgeKey(identity);
  if (!key) return false;
  try {
    const sql = await getSql();
    const rows = await sql<{ year: string }>`
      update rvgrok_coach_knowledge
      set promoted = true, updated_at = now()
      where year = ${key.year}
        and make = ${key.make}
        and model = ${key.model}
        and floorplan = ${key.floorplan}
      returning year
    `;
    return Boolean(rows[0]);
  } catch (err) {
    logCoachKnowledgeWriteFailed({
      coachKey: formatCoachKnowledgeLabel(key),
      fields: ["promoted"],
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export async function upsertCoachKnowledgePlan(
  plan: CoachKnowledgeWritePlan,
): Promise<CoachKnowledgeRecord | null> {
  return upsertCoachKnowledge(plan);
}
