/**
 * Facts live dossier — shared RV Grok web-research stack.
 *
 * Catalog search stays brochure-only. Opening a coach always attempts
 * internet research (Gemini Google Search / xAI web_search) before the
 * existing JSON extract. Soft-fail returns null so catalog paint stays.
 */

import { getResearchProviderOverride } from "@/lib/rvgrok/researchProviderStore";
import {
  executeWebResearch,
  type ExecuteWebResearchOpts,
  type WebResearchApiBody,
} from "@/lib/rvgrok/webResearchTelemetry";
import {
  researchTimeoutMs,
  WEB_SEARCH_MAX_TOOL_CALLS,
  WEB_SEARCH_MODELS,
} from "@/lib/rvgrok/webSearch";

export type FactsDossierResearchNotes = {
  text: string;
  model: string;
};

export type ResearchFactsDossierNotesOpts = {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  /** Year-band / brochure candidate — lock only, never a skip. */
  catalogBlock?: string;
  /** Tests inject a stub. Production uses executeWebResearch. */
  execute?: (
    opts: ExecuteWebResearchOpts,
  ) => Promise<WebResearchApiBody>;
  /** Tests inject; production reads the access-admin override. */
  researchProvider?: string;
};

/** Coach-report phrasing so Grok research uses the 45–60s spec budget. */
export function factsDossierResearchQuery(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
}): string {
  const plan = (input.floorplan || "").trim();
  const coach = `${input.year} ${input.make} ${input.model}${
    plan ? ` ${plan}` : ""
  }`.replace(/\s+/g, " ").trim();
  return `Give me the full specs report for ${coach} — engine HP torque chassis GVWR UVW tanks length market reliability`;
}

/**
 * Always browse. Catalog having a row is not a skip — skipGate is required
 * so needsWebFallback cannot gate a Facts open.
 */
export async function researchFactsDossierNotes(
  opts: ResearchFactsDossierNotesOpts,
): Promise<FactsDossierResearchNotes | null> {
  const query = factsDossierResearchQuery(opts);
  const execute = opts.execute ?? executeWebResearch;
  const researchProvider =
    opts.researchProvider !== undefined
      ? opts.researchProvider
      : ((await getResearchProviderOverride()) ?? undefined);

  const researched = await execute({
    query,
    catalogBlock: opts.catalogBlock,
    apiKey: process.env.XAI_API_KEY,
    timeoutMs: researchTimeoutMs("chat", query),
    models: WEB_SEARCH_MODELS,
    profile: "chat",
    skipGate: true,
    maxAttempts: WEB_SEARCH_MAX_TOOL_CALLS,
    researchProvider,
  });

  if (!researched.ok || !researched.notes.trim()) return null;
  return {
    text: researched.notes,
    model: researched.model || "web-research",
  };
}
