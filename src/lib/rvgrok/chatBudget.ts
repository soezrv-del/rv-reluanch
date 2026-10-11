/**
 * Chat cost guards: one web search per reply, and a per-phone daily token
 * budget. Request-scoped state rides AsyncLocalStorage so deep tool code can
 * read it without threading a parameter through every call.
 */
import { AsyncLocalStorage } from "node:async_hooks";
import {
  CHAT_BUDGET_MESSAGE,
  DEFAULT_CHAT_DAILY_TOKEN_BUDGET,
  createDailyCounter,
  envCap,
} from "./usageCaps.ts";

export { CHAT_BUDGET_MESSAGE };

/** Web searches allowed in one chat reply (prefetch + model tool calls combined). */
export const CHAT_WEB_SEARCHES_PER_REPLY = 1;
/** One search = one query phrasing; no rephrase retry inside a reply. */
export const CHAT_WEB_SEARCH_ATTEMPTS = 1;

export const WEB_SEARCH_ALREADY_USED =
  "Already searched the web once this reply. Answer from the notes you have, and say plainly if a number is still unconfirmed.";

export type ChatTurnState = { webSearchesLeft: number; tokens: number };

export const chatTurnStore = new AsyncLocalStorage<ChatTurnState>();

export function newChatTurnState(): ChatTurnState {
  return { webSearchesLeft: CHAT_WEB_SEARCHES_PER_REPLY, tokens: 0 };
}

/** True if this reply may run a web search (and consumes it). */
export function takeChatWebSearch(): boolean {
  const s = chatTurnStore.getStore();
  if (!s) return true;
  if (s.webSearchesLeft <= 0) return false;
  s.webSearchesLeft -= 1;
  return true;
}

/** Rough token estimate: ~4 chars/token; inline base64 images are not text tokens. */
export function estimateTokens(text: string): number {
  const stripped = String(text || "").replace(
    /data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/gi,
    "[image]",
  );
  return Math.ceil(stripped.length / 4);
}

export function addChatTokens(n: number): void {
  const s = chatTurnStore.getStore();
  if (s) s.tokens += Math.max(0, n);
}

export function chatDailyTokenBudget(): number {
  return envCap(process.env.CHAT_DAILY_TOKEN_BUDGET, DEFAULT_CHAT_DAILY_TOKEN_BUDGET);
}

export function createChatTokenLedger(opts: { now?: () => number } = {}) {
  const counter = createDailyCounter(opts);
  return {
    exceeded(phone: string | null | undefined, budget = chatDailyTokenBudget()): boolean {
      if (!phone) return false;
      return counter.get(phone) >= budget;
    },
    charge(phone: string | null | undefined, tokens: number): number {
      if (!phone) return 0;
      return counter.add(phone, tokens);
    },
    used(phone: string): number {
      return counter.get(phone);
    },
  };
}

export const chatTokenLedger = createChatTokenLedger();
