/**
 * Voice spec-fallback → shared coach knowledge.
 *
 * Lean on purpose. The spec-fallback SSR route imports this module and
 * calls planCoachKnowledgeWrite directly. It must not import the research
 * telemetry module: that static import split the SSR router and crashed
 * Production loadEntries with TypeError: __exportAll is not a function
 * (#494 / #495). Neon upsert stays a dynamic import, same as research.
 */

import type { CoachIdentity } from "./coachIdentity.ts";
import {
  planCoachKnowledgeWrite,
  type CoachKnowledgeWritePlan,
} from "./coachKnowledge.ts";

/** Field-only scrape rows the voice desk may pin. Not a catalog brochure pin. */
export type SpecFallbackKnowledgeFill = {
  field: string;
  value: number;
  unit: "lbs" | "gal";
  sourceUrl?: string;
};

/**
 * Notes the existing research write planner can parse.
 * Weight rows become GVWR / UVW / CCC. Tank fills share one `tanks` field.
 * Fuel capacity is not a storeable knowledge field — omit it so it cannot
 * land in `fuel` as "capacity …".
 */
export function formatSpecFallbackKnowledgeNotes(
  fills: readonly SpecFallbackKnowledgeFill[],
): string {
  const lines: string[] = [];
  const tanks: string[] = [];
  const urls: string[] = [];
  for (const fill of fills) {
    if (!Number.isFinite(fill.value) || fill.value <= 0) continue;
    const n = Math.round(fill.value).toLocaleString("en-US");
    if (fill.field === "gvwr" || fill.field === "uvw" || fill.field === "ccc") {
      lines.push(`${fill.field.toUpperCase()} ${n} lb`);
    } else if (fill.field === "freshWater") tanks.push(`fresh ${n} gal`);
    else if (fill.field === "grayWater") tanks.push(`gray ${n} gal`);
    else if (fill.field === "blackWater") tanks.push(`black ${n} gal`);
    const url = (fill.sourceUrl || "").trim();
    if (/^https?:\/\//i.test(url) && !urls.includes(url)) urls.push(url);
  }
  if (tanks.length) lines.push(`holding tanks: ${tanks.join(", ")}`);
  if (!lines.length) return "";
  return ["CONFIRMED: yes.", ...lines, ...urls].join("\n");
}

/** Same planner Facts/Grok research uses, fed by spec-fallback fills. */
export function planSpecFallbackKnowledgeWrite(opts: {
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan"> | null;
  query: string;
  fills: readonly SpecFallbackKnowledgeFill[];
}): CoachKnowledgeWritePlan | null {
  const notes = formatSpecFallbackKnowledgeNotes(opts.fills);
  if (!notes) return null;
  const query = (opts.query || "").trim() || "gvwr uvw tanks";
  return planCoachKnowledgeWrite({
    identity: opts.identity,
    query,
    result: {
      ok: true,
      notes,
      model: "spec-fallback",
      confirmed: true,
    },
  });
}

/** Server-side pin. Fail-soft, same upsert as a confirmed research write. */
export async function persistSpecFallbackKnowledge(opts: {
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan"> | null;
  query: string;
  fills: readonly SpecFallbackKnowledgeFill[];
}): Promise<void> {
  const write = planSpecFallbackKnowledgeWrite(opts);
  if (!write) return;
  if (process.env.NODE_TEST_CONTEXT) return;
  try {
    const { upsertCoachKnowledgePlan } = await import("./coachKnowledgeStore.ts");
    await upsertCoachKnowledgePlan(write);
  } catch {
    /* fail-soft — desk fills already succeeded */
  }
}
