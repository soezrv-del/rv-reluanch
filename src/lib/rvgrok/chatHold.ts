import { looksLikeCoachReportAsk } from "./coachReport.ts";
import {
  looksLikeOwnLotCountOrRankAsk,
  looksLikeOwnLotSearchAsk,
  looksLikeOwnLotStockQuestion,
} from "./ownLotAsk.ts";
import {
  looksLikeInventoryOrCountQuestion,
  looksLikeMarketValueQuestion,
  looksLikeSpecQuestion,
  normalizeAskText,
} from "./webIntent.ts";

const FOLLOW_NOISE = new Set([
  "a",
  "an",
  "the",
  "just",
  "only",
  "its",
  "it's",
  "i",
  "mean",
  "meant",
]);

const FOLLOW_STOP =
  /^(?:thanks|thank you|hi|hey|hello|ok|okay|cool|nice|yes|yeah|yep|no|nope|sure|please|what|why|how)$/i;

/** "A Navion." after a lot question is the coach, not a new topic. */
export function looksLikeNamedCoachFollowUp(text: string): boolean {
  const t = normalizeAskText(text).trim().replace(/[?.!]+$/g, "").trim();
  if (!t || t.length > 40) return false;
  if (looksLikeSpecQuestion(t) || looksLikeMarketValueQuestion(t)) return false;
  const words = t.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 3) return false;
  const content = words.filter((word) => !FOLLOW_NOISE.has(word));
  if (content.length < 1) return false;
  return !FOLLOW_STOP.test(content.join(" "));
}

function lotCue(text: string): boolean {
  return (
    looksLikeOwnLotStockQuestion(text) ||
    looksLikeOwnLotCountOrRankAsk(text) ||
    looksLikeOwnLotSearchAsk(text) ||
    looksLikeInventoryOrCountQuestion(text)
  );
}

/**
 * This turn should read the lot from the whole sentence.
 * A short name after a lot question counts too.
 */
export function chatReadsLot(text: string, priorUser: string[] = []): boolean {
  const t = text.trim();
  if (!t) return false;
  if (lotCue(t)) return true;
  if (!looksLikeNamedCoachFollowUp(t)) return false;
  return priorUser.some((prev) => lotCue(prev));
}

/**
 * The first line of a typed reply, same job as the Live Voice hold.
 * Empty when the answer can start immediately.
 */
export function chatHoldLine(text: string, priorUser: string[] = []): string {
  const t = text.trim();
  if (!t) return "";
  const spec =
    looksLikeSpecQuestion(t) ||
    looksLikeCoachReportAsk(t) ||
    looksLikeMarketValueQuestion(t);
  if (spec) return "Give me one second.";
  if (chatReadsLot(t, priorUser)) return "I'll check the lot.";
  return "";
}
