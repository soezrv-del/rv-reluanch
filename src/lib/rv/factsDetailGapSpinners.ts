/**
 * Facts dossier detail — per-field gap-search spinner.
 *
 * Uses the same catalog-first gap plan as LIVE_DOSSIER browse.
 * Only GVWR / horsepower / torque spin, and only when that field is
 * still a catalog gap and live fetch is in flight.
 */

import type { FactsHardField } from "./factsDossierGapPlan.ts";

export const FACTS_DETAIL_SPIN_FIELDS = [
  "gvwr",
  "horsepower",
  "torque",
] as const satisfies readonly FactsHardField[];

export type FactsDetailSpinField = (typeof FACTS_DETAIL_SPIN_FIELDS)[number];

const EMPTY_DISPLAY_RE =
  /^(?:—|-|–|n\/?a|null|none|unknown|tbd|gap|confirm brochure)$/i;

export function factsDetailSearchingFields(opts: {
  liveLoading: boolean;
  skipLive: boolean;
  gaps: readonly FactsHardField[];
}): ReadonlySet<FactsDetailSpinField> {
  if (!opts.liveLoading || opts.skipLive) return new Set();
  const gapSet = new Set(opts.gaps);
  return new Set(
    FACTS_DETAIL_SPIN_FIELDS.filter((field) => gapSet.has(field)),
  );
}

/** True only when the catalog gap is still empty on screen. */
export function factsDetailFieldSearching(
  field: FactsDetailSpinField,
  searching: ReadonlySet<FactsDetailSpinField>,
  displayed?: string | number | null,
): boolean {
  if (!searching.has(field)) return false;
  if (displayed == null) return true;
  const s = String(displayed).trim();
  return !s || EMPTY_DISPLAY_RE.test(s);
}
