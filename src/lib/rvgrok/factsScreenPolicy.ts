/**
 * Rv Facts asks: specs and info come from a live web search plus pinned
 * Facts values. Lot inventory is not a spec source. Stock is a follow-up.
 */

import { looksLikeCoachCompareQuestion } from "./coachCompare.ts";
import { looksLikeOwnLotStockQuestion } from "./ownLotAsk.ts";
import {
  looksLikeCasualNonResearch,
  looksLikeCoachFactAsk,
  looksLikeNamedCoachProductQuestion,
  looksLikePureLifestyleOrPayment,
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";

export const OWN_LOT_TOOL = "get_own_lot";

const SCREEN_HOWTO_RE =
  /\b(what screen am i on|what screen is this|how do i use|where is the|what(?:'s| is) this screen)\b/i;

const STOCK_YES_RE =
  /^(?:yeah|yes|yep|yup|sure|ok|okay|please|do that|go ahead|check(?: stock| the lot| if we have(?: one| any)?)?)[.!\s]*$/i;

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
  if (
    looksLikeSpecQuestion(t) ||
    looksLikeCoachFactAsk(t) ||
    looksLikeNamedCoachProductQuestion(t) ||
    looksLikeCoachCompareQuestion(t)
  ) {
    return true;
  }
  return /\b(floor\s*plans?|floorplans?|series|bigger|larger|longer|layout|sleeps|slides?|tanks?)\b/i.test(
    t,
  );
}

/**
 * Stock runs after he says yes to the offer, or when this message is
 * itself an explicit stock ask and not a spec question.
 */
export function factsStockCheckAllowed(
  text: string,
  priorUserTexts: readonly string[],
): boolean {
  const t = normalizeAskText(text).trim();
  if (!t) return false;
  if (STOCK_YES_RE.test(t)) {
    return priorUserTexts.some((prev) => looksLikeFactsSpecOrInfo(prev));
  }
  // "What's the GVWR, and do we have one?" stays a spec turn.
  // "Do we have a 2024 Allegro in stock?" is stock only.
  const specField =
    looksLikeSpecQuestion(t) ||
    looksLikeCoachCompareQuestion(t) ||
    /\b(floor\s*plans?|floorplans?|series|bigger|larger|longer|layout|sleeps|slides?|tanks?)\b/i.test(
      t,
    );
  if (looksLikeOwnLotStockQuestion(t) && !specField) return true;
  if (looksLikeFactsSpecOrInfo(t)) return false;
  return false;
}

export type FactsTurn = "spec" | "stock" | "passthrough";

export function classifyFactsTurn(
  screenOrContext: string,
  text: string,
  priorUserTexts: readonly string[] = [],
): FactsTurn {
  if (!isFactsScreen(screenOrContext)) return "passthrough";
  if (factsStockCheckAllowed(text, priorUserTexts)) return "stock";
  if (looksLikeFactsSpecOrInfo(text)) return "spec";
  return "passthrough";
}

export function factsSpecRequestsWebSearch(
  screenOrContext: string,
  text: string,
  priorUserTexts: readonly string[] = [],
): boolean {
  return classifyFactsTurn(screenOrContext, text, priorUserTexts) === "spec";
}

export function factsChatTools<T extends { function?: { name?: string } }>(
  tools: readonly T[],
  screenOrContext: string,
  turn: FactsTurn,
): T[] {
  if (!isFactsScreen(screenOrContext) || turn === "stock") return [...tools];
  return tools.filter((tool) => tool.function?.name !== OWN_LOT_TOOL);
}

export function factsRequiredTool(
  base: string | null,
  turn: FactsTurn,
  screenOrContext: string,
): string | null {
  if (!isFactsScreen(screenOrContext)) return base;
  if (turn === "stock") return OWN_LOT_TOOL;
  if (base === OWN_LOT_TOOL) return turn === "spec" ? "get_coach_facts" : null;
  return base;
}
