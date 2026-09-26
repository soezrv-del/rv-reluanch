/**
 * When chat should fire the web-research sidecar.
 * Spec-catalog-free (no rvData). Coach-vs-coach compare skip uses the
 * thin CATALOG_INDEX names in coachCompare.ts.
 *
 * Memory first. The model answers from its own knowledge (and a catalog
 * pin already in hand) before any browse. Catalog, search, and internet
 * are fallbacks — not a step before the first token.
 * Browse only when the ask needs something memory cannot honestly pin:
 * repair / forum / manual / TSB, live market value, inventory counts,
 * an OEM spec the catalog does not already pin (no row, UNKNOWN hard
 * fields, missing OEM weight pin on a weight ask), or a live condition
 * (weather, road closures). A locked pin does not wait on search.
 * Do not invent OEM numbers. If search returns nothing, say so — never
 * EST when a live OEM / brochure / dealer source exists.
 * Inventory / diesel-count / in-stock still trip this detector so voice+chat
 * can inject the own-lot snapshot; a *hit* skips public web, a miss browses.
 * Skip hi / lifestyle / payment / image-only turns, named-coach small talk,
 * and catalog-answerable coach-vs-coach compares.
 * Market value / pricing always browses (live nationwide asking, year ±2).
 * Repair / forum / manual asks still browse even on a compare.
 */

import { askNamesCoachIdentity } from "./coachIdentity.ts";
import { parseCoachFromText } from "./parseCoach.ts";
import { looksLikeCarfaxQuestion } from "./carfaxPositioning.ts";
import { looksLikeOriginQuestion } from "./originStory.ts";
import { looksLikeRepairQuestion } from "./repairMode.ts";
import { looksLikeCatalogAnswerableCoachCompare } from "./coachCompare.ts";

export { looksLikeCarfaxQuestion } from "./carfaxPositioning.ts";
export { looksLikeOriginQuestion } from "./originStory.ts";

export { looksLikeRepairQuestion } from "./repairMode.ts";
export {
  looksLikeCatalogAnswerableCoachCompare,
  looksLikeCoachCompareQuestion,
} from "./coachCompare.ts";

export type WebFallbackSpecs = {
  missingHard: boolean;
  /** True when GVWR or UVW has no Facts / OEM published number. */
  missingOemWeightPin?: boolean;
  oemGvwrLbs?: number | null;
  oemUvwLbs?: number | null;
} | null;

export type WebFallbackOpts = {
  /** Agent mode may browse a bit more often — still skips hi / lifestyle / payment. */
  agentMode?: boolean;
};
