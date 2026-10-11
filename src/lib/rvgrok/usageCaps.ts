/**
 * Per-phone daily usage caps (voice sessions, chat tokens).
 *
 * In-memory per serverless instance: a soft cap that stops runaway loops and
 * one phone burning credits all day, not a billing-grade quota. Day rolls at
 * midnight Pacific. Hard admin phones are exempt. Env-configurable.
 */

/** Default new Live Voice sessions per phone per day. Env: VOICE_DAILY_SESSION_CAP. */
export const DEFAULT_VOICE_DAILY_SESSION_CAP = 20;
/** Default chat tokens per phone per day (~130 typical replies). Env: CHAT_DAILY_TOKEN_BUDGET. */
export const DEFAULT_CHAT_DAILY_TOKEN_BUDGET = 1_000_000;

/** Live Voice auto-stop: silence and total session length (client side). */
export const VOICE_IDLE_LIMIT_MS = 2 * 60 * 1000;
export const VOICE_MAX_SESSION_MS = 15 * 60 * 1000;

export const VOICE_CAP_MESSAGE =
  "You've hit today's Live Voice limit. Chat still works, and voice resets at midnight Pacific.";
export const CHAT_BUDGET_MESSAGE =
  "You've used today's RvGrok chat allowance. It resets at midnight Pacific. Live lot search and the Facts screens still work.";

export function envCap(
  raw: string | undefined,
  fallback: number,
): number {
  const n = Number(String(raw ?? "").replace(/[_,\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function pacificDay(now: number = Date.now()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(now));
}

export function createDailyCounter(opts: { now?: () => number; max?: number } = {}) {
  const now = opts.now ?? Date.now;
  const max = opts.max ?? 5000;
  const map = new Map<string, number>();
  const k = (id: string) => `${pacificDay(now())}|${id}`;
  return {
    get(id: string): number {
      return map.get(k(id)) ?? 0;
    },
    add(id: string, n: number): number {
      const key = k(id);
      const v = (map.get(key) ?? 0) + Math.max(0, n);
      map.delete(key);
      map.set(key, v);
      while (map.size > max) {
        const oldest = map.keys().next().value;
        if (oldest === undefined) break;
        map.delete(oldest);
      }
      return v;
    },
  };
}

/** Why a Live Voice session should end now, or null. */
export function voiceSessionLimitReason(s: {
  startedAt: number;
  lastActivityAt: number;
  now: number;
}): "idle" | "max" | null {
  if (s.now - s.startedAt >= VOICE_MAX_SESSION_MS) return "max";
  if (s.now - s.lastActivityAt >= VOICE_IDLE_LIMIT_MS) return "idle";
  return null;
}

export function voiceLimitMessage(reason: "idle" | "max"): string {
  return reason === "idle"
    ? "Voice ended after 2 minutes of silence. Tap the mic to start again."
    : "Voice ended after 15 minutes. Tap the mic to start a new session.";
}
