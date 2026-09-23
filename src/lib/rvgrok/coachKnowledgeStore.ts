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
  mergeConfirmedFields,
  mergeKnowledgeSources,
  normalizeCoachKnowledgeKey,
  type CoachKnowledgeFields,
  type CoachKnowledgeKey,
  type CoachKnowledgeRecord,
  type CoachKnowledgeWritePlan,
} from "./coachKnowledge.ts";
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
    const field = value as { value?: unknown; kind?: unknown; researchedAt?: unknown };
    if (typeof field.value !== "string" || !field.value.trim()) continue;
    out[name] = {
      value: field.value.trim(),
      kind: field.kind === "price" ? "price" : "spec",
      researchedAt:
        typeof field.researchedAt === "string" ? field.researchedAt : "",
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
             researched_at, confidence, schema_version, updated_at
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
  const incoming = mergeConfirmedFields({}, input.fields);
  if (!Object.keys(incoming).length) return null;

  try {
    const existing = await loadCoachKnowledge(key);
    const fields = mergeConfirmedFields(existing?.fields, incoming);
    const sources = mergeKnowledgeSources(existing?.sources, input.sources);
    const confidence = input.confidence || existing?.confidence || "medium";
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
                 researched_at, confidence, schema_version, updated_at`,
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
  } catch {
    return null;
  }
}

export async function upsertCoachKnowledgePlan(
  plan: CoachKnowledgeWritePlan,
): Promise<CoachKnowledgeRecord | null> {
  return upsertCoachKnowledge(plan);
}
