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

export const FACTS_STOCK_OFFER = "Want me to check if we have one in stock?";

export const FACTS_WEB_NUMBER_RULE =
  "Tag each web-found spec in a few words, such as per the Entegra brochure or per rvguide.com. An exact pinned Facts value wins when this turn has that value. A web-found number is for this answer only and is never used for payment, CCC, hitch, or tow math.";

export const FACTS_SPEC_INSTRUCTION = `FACTS ANSWER. This turn is Rv Facts. Always run a live web search for specs and information. ${FACTS_WEB_NUMBER_RULE} The first sentence is the answer. Speak as someone in command of the facts. Never invent or guess a number. Do not describe the lookup, a miss, a timeout, or a partial result. If one value is not published anywhere after the search, give the specs that are known and add one short line pointing to the door sticker or the dealer for that single value. Do not apologize. Do not use lot inventory, stock counts, or "we have one in stock" inside the spec answer. After the answer, you may ask once: ${FACTS_STOCK_OFFER} Do not check the lot unless he says yes.`;

/** Sentences that make a Facts answer narrate a miss. Removed from the Facts prompt. */
const FACTS_HEDGE_CUTS = [
  "If both are empty, say that field is unverified. ",
  "If the notes do not cover it, say so. ",
  "If you cannot do what he asked, say so in one or two plain sentences and offer the closest useful next step. No lecture.",
  "If search returns nothing after a retry, say so plainly — then still speak every VERIFIED / non-GAP catalog pin. ",
  "If search returns nothing after a retry, say so plainly — do not invent brochure numbers from training. ",
  "If there is no catalog pin and search returned nothing after a retry, say so plainly — do not invent brochure numbers from training. ",
  "If UVW (or another field) is GAP, conversational answers may give a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin. ",
  "Conversational answers may give a labeled EST / typical class range after WEB RESEARCH — never as an OEM pin. ",
  "then YOU answer with a labeled EST if still unpinned. ",
  'Never send them to a brochure, door sticker, dealer, or website. Never say "check the website", "look it up yourself", or "go check the OEM site". ',
  "Do not say the coach is not in the catalog and stop. ",
  "If a line is still empty after the web notes, a labeled EST / typical class range is allowed and is never an OEM pin. Never stop at I don't know. ",
  "CATALOG GAP — no locked numbers for this identity. WEB RESEARCH is required this turn, then answer with a labeled EST / typical class range if still unpinned. Never present that as an OEM pin. Do not stop at I don't know. Never send the user to the OEM site, a website, or a dealer as the answer.",
  "UNKNOWN / CATALOG GAP — WEB RESEARCH is required this turn, then YOU answer with a labeled EST / typical class range if still unpinned. Never present that number as an OEM pin. Do not stop at I don't know. Never send the user to a brochure, door sticker, dealer, or the OEM site as the answer.",
  "UNKNOWN / CATALOG GAP: WEB RESEARCH this turn, then a labeled EST / typical class range. ",
  "No year, no pin, and no web note: say that field is unverified. ",
  "Do not stop at I don't know. ",
  "Never stop at I don't know. ",
  "Mark missing once. ",
  "Tell him to check the brochure or door sticker, and never fill in a number. ",
];

/**
 * Phrases that make the model narrate a miss or echo a catalog gap.
 * A sentence that still contains one of these is dropped from the Facts prompt.
 */
const FACTS_HEDGE_SENTENCE =
  /not in (?:our |the )?catalogs?|\bcatalog gap\b|couldn'?t find|could not find|could not browse|\bunverified\b|say so plainly|if the notes do not cover it, say so|i don't know|you don't have|search timed out|returned nothing|labeled est|typical class range|low confidence|never send (?:them|the user) to|tell him to check the brochure|check the website|look it up yourself|go check the oem site/i;

/** Drop miss-narration from whatever the Facts turn already inherited. */
export function applyFactsDelivery(text: string): string {
  let out = text || "";
  for (const cut of FACTS_HEDGE_CUTS) {
    if (out.includes(cut)) out = out.split(cut).join("");
  }
  out = out
    .split("\n")
    .map((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .filter((part) => part.trim() && !FACTS_HEDGE_SENTENCE.test(part))
        .join(" "),
    )
    .join("\n");
  return out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export const FACTS_STOCK_INSTRUCTION = `FACTS STOCK CHECK. He asked for a stock check. Report how many, the stock number, the store, and the price if it is printed. Do not answer GVWR, engine, tanks, length, or other specs from the lot row. Do not replace a pinned Facts value with a lot number.`;

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

/** Live Voice browse sentence. Lot and the other screens keep the lot line. */
export function voiceBrowseLine(screen?: string): string {
  if (isFactsScreen(screen || "")) {
    return FACTS_SPEC_INSTRUCTION;
  }
  return `When a turn injects a lot snapshot, speak that total. Never replace it with a website count. This session has native web_search. Use it for coach facts the catalog does not already pin, not to override an injected lot snapshot.`;
}
