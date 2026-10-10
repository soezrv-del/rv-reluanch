/**
 * Coach-report (dossier) cost guards — shared by the client fetch and the
 * /api/rvfax/dossier route. Pure helpers so node --test can cover them.
 *
 * Why: one Facts screen fired the same dossier POST many times a minute
 * (effect re-fires on a new catalogCandidate object each render, aborting
 * the old fetch while the server kept burning grok-4.7). The extract step
 * had no per-call timeout and walked 4 models × 2 passes + 3 worker URLs,
 * stacking past Vercel's 300s limit.
 */

/** Server wall-clock budget for the whole dossier chain. Below the 180s client wait and far below Vercel's 300s. */
export const DOSSIER_SERVER_BUDGET_MS = 170_000;
/** Leave this much for parse/merge/response after the last model call. */
export const DOSSIER_SERVER_MARGIN_MS = 8_000;
/** One extract model call never gets more than this. */
export const DOSSIER_EXTRACT_CALL_MAX_MS = 45_000;
/** Below this much remaining time, skip optional stages and return partial. */
export const DOSSIER_MIN_STAGE_MS = 5_000;

/** Identical requests reuse a result for 1h. */
export const DOSSIER_RESULT_TTL_MS = 60 * 60 * 1000;
/** A failed request is not re-tried for this long (unless forced). */
export const DOSSIER_FAILURE_TTL_MS = 2 * 60 * 1000;

/** Client: at most one retry, only for transient network / 502 / 503. */
export const DOSSIER_MAX_RETRIES = 1;

export type Deadline = {
  /** ms left before the total budget (minus margin) runs out. */
  remaining(): number;
  expired(): boolean;
  /** Budget for one stage: min(stageMax, remaining). 0 when out of time. */
  stageMs(stageMax: number): number;
};

export function createDeadline(
  totalMs: number,
  marginMs = 0,
  now: () => number = Date.now,
): Deadline {
  const end = now() + totalMs - marginMs;
  const remaining = () => Math.max(0, end - now());
  return {
    remaining,
    expired: () => remaining() < DOSSIER_MIN_STAGE_MS,
    stageMs: (stageMax: number) => {
      const r = remaining();
      if (r < DOSSIER_MIN_STAGE_MS) return 0;
      return Math.min(stageMax, r);
    },
  };
}

/**
 * Run fn with its own AbortController that fires after ms.
 * Resolves null on timeout instead of hanging (partial results win).
 */
export async function withStageTimeout<T>(
  ms: number,
  fn: (signal: AbortSignal) => Promise<T>,
): Promise<T | null> {
  if (ms <= 0) return null;
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      ctrl.abort();
      resolve(null);
    }, ms);
  });
  try {
    return await Promise.race([
      fn(ctrl.signal).catch(() => null),
      timeout,
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Collapse concurrent calls with the same key onto one promise. */
export function createInflightDeduper<T>() {
  const inflight = new Map<string, Promise<T>>();
  return {
    run(key: string, fn: () => Promise<T>): Promise<T> {
      const existing = inflight.get(key);
      if (existing) return existing;
      const p = (async () => {
        try {
          return await fn();
        } finally {
          inflight.delete(key);
        }
      })();
      inflight.set(key, p);
      return p;
    },
    size: () => inflight.size,
  };
}

/** Small TTL + LRU map (per serverless instance / per tab). */
export function createTtlCache<T>(opts: {
  ttlMs: number;
  max?: number;
  now?: () => number;
}) {
  const max = opts.max ?? 200;
  const now = opts.now ?? Date.now;
  const map = new Map<string, { at: number; ttl: number; value: T }>();
  return {
    get(key: string): T | undefined {
      const hit = map.get(key);
      if (!hit) return undefined;
      if (now() - hit.at >= hit.ttl) {
        map.delete(key);
        return undefined;
      }
      map.delete(key);
      map.set(key, hit);
      return hit.value;
    },
    set(key: string, value: T, ttlMs = opts.ttlMs) {
      map.delete(key);
      map.set(key, { at: now(), ttl: ttlMs, value });
      while (map.size > max) {
        const oldest = map.keys().next().value;
        if (oldest === undefined) break;
        map.delete(oldest);
      }
    },
    delete(key: string) {
      map.delete(key);
    },
    clear() {
      map.clear();
    },
    size: () => map.size,
  };
}

/** Stable JSON (sorted keys) so equal candidates make equal keys. */
export function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v ?? null);
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`)
    .join(",")}}`;
}

/** Normalized request key: coach + candidate + UTC day (lot snapshot date). */
export function dossierRequestKey(input: {
  year: string;
  make: string;
  model: string;
  floorplan?: string;
  candidate?: unknown;
  day?: string;
}): string {
  const norm = (s: string | undefined) =>
    String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  const day = input.day ?? new Date().toISOString().slice(0, 10);
  return [
    norm(input.year),
    norm(input.make),
    norm(input.model),
    norm(input.floorplan),
    stableStringify(input.candidate ?? null),
    day,
  ].join("|");
}

/**
 * Client retry policy. Never retry an abort or a timeout (408/504 or our
 * own timer) — the server is probably still burning the first call.
 */
export function shouldRetryDossier(r: {
  attempt: number;
  status?: number;
  aborted?: boolean;
  timedOut?: boolean;
  networkError?: boolean;
}): boolean {
  if (r.attempt >= DOSSIER_MAX_RETRIES) return false;
  if (r.aborted || r.timedOut) return false;
  if (r.status === 408 || r.status === 504) return false;
  if (r.networkError) return true;
  return r.status === 502 || r.status === 503;
}

export type DossierAttemptResult = {
  ok: boolean;
  status?: number;
  aborted?: boolean;
  timedOut?: boolean;
  networkError?: boolean;
};

/**
 * Client coordinator: shared in-flight promise per key, ≤1 retry, short
 * failure memo so a re-rendering screen can't re-fire a failed report.
 * A caller abort only detaches that caller; the shared request keeps one
 * owner so the server is not hit again by the next mount.
 */
export function createDossierClientCoordinator<R extends DossierAttemptResult>(opts: {
  failureTtlMs?: number;
  now?: () => number;
} = {}) {
  const dedupe = createInflightDeduper<R>();
  const failures = createTtlCache<R>({
    ttlMs: opts.failureTtlMs ?? DOSSIER_FAILURE_TTL_MS,
    now: opts.now,
  });
  let attemptsMade = 0;

  return {
    async request(
      key: string,
      attempt: () => Promise<R>,
      callOpts: { force?: boolean; signal?: AbortSignal; abortedResult: R },
    ): Promise<R> {
      if (callOpts.signal?.aborted) return callOpts.abortedResult;
      if (callOpts.force) failures.delete(key);
      const memo = failures.get(key);
      if (memo) return memo;

      const shared = dedupe.run(key, async () => {
        let res: R;
        let n = 0;
        for (;;) {
          attemptsMade++;
          res = await attempt();
          if (res.ok || !shouldRetryDossier({ attempt: n, ...res })) break;
          n++;
        }
        if (!res.ok && !res.aborted) failures.set(key, res);
        return res;
      });

      const signal = callOpts.signal;
      if (!signal) return shared;
      return new Promise<R>((resolve) => {
        const onAbort = () => resolve(callOpts.abortedResult);
        signal.addEventListener("abort", onAbort, { once: true });
        shared.then(
          (r) => {
            signal.removeEventListener("abort", onAbort);
            resolve(r);
          },
          () => {
            signal.removeEventListener("abort", onAbort);
            resolve(callOpts.abortedResult);
          },
        );
      });
    },
    attempts: () => attemptsMade,
    inflight: () => dedupe.size(),
  };
}
