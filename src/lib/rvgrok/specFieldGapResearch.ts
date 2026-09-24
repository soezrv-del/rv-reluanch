/**
 * Desk GAP fields the URL scrape missed — shared web research, then
 * labeled numbers only. Neon is read inside executeWebResearch before
 * a live search. No Gemini on this path. No brochure rvData writes.
 */

import {
  specFillsFromConfirmedNotes,
  type SpecCoachIdentity,
  type SpecFieldFill,
  type SpecFieldKey,
} from "../rv/specFieldFallback.ts";
import type { CoachIdentity } from "./coachIdentity.ts";
import {
  SPEC_REPORT_RESEARCH_TIMEOUT_MS,
  WEB_SEARCH_MODELS,
} from "./webSearch.ts";
import type { WebResearchApiBody } from "./webResearchTelemetry.ts";

const FIELD_LABEL: Record<SpecFieldKey, string> = {
  gvwr: "GVWR",
  uvw: "UVW",
  ccc: "CCC",
  fuelCapacity: "fuel capacity",
  freshWater: "fresh water",
  grayWater: "gray water",
  blackWater: "black water",
};

export function specGapResearchQuery(
  identity: SpecCoachIdentity,
  empty: readonly SpecFieldKey[],
): string {
  const fields = empty.map((field) => FIELD_LABEL[field]).join(" ");
  return `${identity.year} ${identity.make} ${identity.model} ${identity.floorplan} ${fields}`
    .replace(/\s+/g, " ")
    .trim();
}

export function specFillsFromResearchBody(
  body: Pick<WebResearchApiBody, "ok" | "notes" | "confirmed" | "model"> | null,
  empty: readonly SpecFieldKey[],
): SpecFieldFill[] {
  if (!body?.ok || body.confirmed === false) return [];
  const notes = body.notes || "";
  if (body.model === "catalog-pin" && !/CONFIRMED:\s*yes/i.test(notes)) {
    return [];
  }
  return specFillsFromConfirmedNotes(notes, empty, "");
}

export async function researchRemainingSpecGaps(opts: {
  identity: SpecCoachIdentity;
  empty: readonly SpecFieldKey[];
  requestOrigin?: string;
  execute?: (
    query: string,
    identity: CoachIdentity,
  ) => Promise<WebResearchApiBody | null>;
}): Promise<SpecFieldFill[]> {
  if (!opts.empty.length) return [];
  const query = specGapResearchQuery(opts.identity, opts.empty);
  const identity: CoachIdentity = {
    year: opts.identity.year,
    make: opts.identity.make,
    model: opts.identity.model,
    floorplan: opts.identity.floorplan,
    source: "facts",
  };
  const execute = opts.execute ?? researchSpecGapsLive;
  let body: WebResearchApiBody | null = null;
  try {
    body = await execute(query, identity);
  } catch {
    return [];
  }
  return specFillsFromResearchBody(body, opts.empty);
}

async function researchSpecGapsLive(
  query: string,
  identity: CoachIdentity,
): Promise<WebResearchApiBody | null> {
  const { executeWebResearch } = await import("./webResearchTelemetry.ts");
  return executeWebResearch({
    query,
    apiKey: process.env.XAI_API_KEY,
    timeoutMs: SPEC_REPORT_RESEARCH_TIMEOUT_MS,
    models: WEB_SEARCH_MODELS,
    profile: "chat",
    skipGate: true,
    maxAttempts: 2,
    researchProvider: "xai",
    geminiApiKey: "",
    identity,
  });
}
