/**
 * Rv Facts spec and info asks always run a live web search.
 * Lot inventory and pinned Facts data stay available as sources too.
 */

import { looksLikeCoachCompareQuestion } from "./coachCompare.ts";
import { looksLikeOwnLotStockQuestion } from "./ownLotAsk.ts";
import {
  looksLikeCasualNonResearch,
  looksLikeCoachFactAsk,
  looksLikeInventoryOrCountQuestion,
  looksLikeNamedCoachProductQuestion,
  looksLikePureLifestyleOrPayment,
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";

const SCREEN_HOWTO_RE =
  /\b(what screen am i on|what screen is this|how do i use|where is the|what(?:'s| is) this screen)\b/i;

export function activeScreenFromContext(catalogContext?: string): string {
  const match = (catalogContext || "").match(/ACTIVE SCREEN:\s*([^\n.]+)/);
  return (match?.[1] || "").trim();
}

export function isFactsScreen(screenOrContext?: string): boolean {
  const raw = (screenOrContext || "").trim();
  if (!raw) return false;
  if (raw === "Facts") return true;
  return activeScreenFromContext(raw) === "Facts";
}

export function looksLikeFactsSpecOrInfo(text: string): boolean {
  const t = normalizeAskText(text).trim();
  if (!t || looksLikeCasualNonResearch(t)) return false;
  if (SCREEN_HOWTO_RE.test(t)) return false;
  if (looksLikePureLifestyleOrPayment(t)) return false;
  const specCue =
    looksLikeSpecQuestion(t) ||
    looksLikeCoachCompareQuestion(t) ||
    /\b(floor\s*plans?|floorplans?|series|bigger|larger|longer|layout|sleeps|slides?|tanks?)\b/i.test(
      t,
    );
  if (specCue) return true;
  // A pure stock ask stays on the lot. A spec that also mentions stock
  // already returned above, so the lot does not replace the web search.
  if (
    looksLikeOwnLotStockQuestion(t) ||
    looksLikeInventoryOrCountQuestion(t)
  ) {
    return false;
  }
  return (
    looksLikeCoachFactAsk(t) || looksLikeNamedCoachProductQuestion(t)
  );
}

/** Facts spec and info asks search the web. Other screens keep the normal gate. */
export function factsSpecRequestsWebSearch(
  screenOrContext: string,
  text: string,
): boolean {
  return isFactsScreen(screenOrContext) && looksLikeFactsSpecOrInfo(text);
}
