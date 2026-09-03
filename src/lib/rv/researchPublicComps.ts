/**
 * Server helper: year-range public listing research via xAI web_search.
 *
 * Never imports MarketCheck. Never claims NADA / J.D. Power.
 * Callers must treat a missing key or failed search as "no comps"
 * and fall back to live dossier / catalog estimate.
 */

import { fetchWebSearch } from "@/lib/rvgrok/webSearch";
import {
  DEFAULT_YEAR_PAD,
  buildListingCompsPrompt,
  coachYearRange,
  extractListingAsks,
  reducePublicComps,
  type PublicListingComps,
} from "./publicListingComps";

export type ResearchPublicCompsInput = {
  year: string | number;
  make: string;
  model: string;
  floorplan?: string;
  yearPad?: number;
  asOfYear?: number;
};

export type ResearchPublicCompsResult =
  | { ok: true; data: PublicListingComps; model: string }
  | { ok: false; reason: string; data: PublicListingComps | null };

export async function researchPublicListingComps(
  input: ResearchPublicCompsInput,
): Promise<ResearchPublicCompsResult> {
  const yearNum = typeof input.year === "number"
    ? input.year
    : parseInt(String(input.year), 10);
  if (!Number.isFinite(yearNum) || !input.make.trim() || !input.model.trim()) {
    return { ok: false, reason: "year, make, and model are required", data: null };
  }

  const yearRange = coachYearRange(
    yearNum,
    input.yearPad ?? DEFAULT_YEAR_PAD,
    input.asOfYear,
  );
  const prompt = buildListingCompsPrompt({
    year: yearNum,
    make: input.make.trim(),
    model: input.model.trim(),
    floorplan: input.floorplan?.trim() || undefined,
    yearRange,
  });

  const search = await fetchWebSearch({
    apiKey: process.env.XAI_API_KEY,
    system: prompt.system,
    user: prompt.user,
    maxOutputTokens: 1200,
    timeoutMs: 22_000,
  });

  if (!search.ok) {
    return { ok: false, reason: search.reason, data: null };
  }

  const asks = extractListingAsks(search.notes);
  const reduced = reducePublicComps(asks, yearRange, search.notes.slice(0, 400));
  if (!reduced) {
    return {
      ok: false,
      reason: "no usable public asking prices in the year window",
      data: null,
    };
  }

  return { ok: true, data: reduced, model: search.model };
}
