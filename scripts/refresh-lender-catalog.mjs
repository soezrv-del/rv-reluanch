#!/usr/bin/env node
/**
 * Weekly RateAPI / lender-compare probe for Boss Ops.
 *
 * Code-side hook — not a Grok Bot routine. Does not invent or rewrite rates.
 * Hits production GET /api/lenders so the live 24h RateAPI cache is warmed,
 * then verifies compare order: eligible quotes must be sorted by estimatedApr
 * ascending (best rate first). Catalog rows are left alone unless you have
 * live RateAPI numbers in hand.
 *
 * Boss Ops weekly job should:
 *   (a) GET /api/lenders?zip=98001&credit=excellent&amount=150000&termMonths=180
 *       against production (default https://www.rvmax.app)
 *   (b) log source, asOf, and the top-3 APRs in response order
 *   (c) exit non-zero if eligible lenders are not sorted by estimatedApr
 *
 * Usage:
 *   node scripts/refresh-lender-catalog.mjs
 *   LENDERS_PROBE_BASE=https://www.rvmax.app node scripts/refresh-lender-catalog.mjs
 */

import { fileURLToPath } from "node:url";

export const DEFAULT_PROBE_BASE = "https://www.rvmax.app";
export const DEFAULT_PROBE_QUERY =
  "zip=98001&credit=excellent&amount=150000&termMonths=180";

export function probeUrl(base = process.env.LENDERS_PROBE_BASE || DEFAULT_PROBE_BASE) {
  const root = String(base).replace(/\/+$/, "");
  return `${root}/api/lenders?${DEFAULT_PROBE_QUERY}`;
}

/** Eligible quotes must be non-decreasing by estimatedApr (strict compare rank). */
export function eligibleLendersAreAprSorted(lenders) {
  const eligible = (Array.isArray(lenders) ? lenders : []).filter(
    (l) => l && l.eligible !== false,
  );
  if (eligible.length === 0) return false;
  for (let i = 1; i < eligible.length; i++) {
    const prev = eligible[i - 1]?.estimatedApr;
    const next = eligible[i]?.estimatedApr;
    if (typeof prev !== "number" || typeof next !== "number" || next < prev) {
      return false;
    }
  }
  return true;
}

export function formatProbeLog(body, url) {
  const lenders = Array.isArray(body?.lenders) ? body.lenders : [];
  const eligible = lenders.filter((l) => l.eligible !== false);
  const top3Aprs = eligible.slice(0, 3).map((l) => ({
    name: l.name ?? null,
    estimatedApr: l.estimatedApr ?? null,
    estimatedMonthly: l.estimatedMonthly ?? null,
  }));
  return {
    url,
    source: body?.source ?? null,
    asOf: body?.asOf ?? null,
    cached: body?.cached ?? null,
    lenderCount: lenders.length,
    eligibleCount: eligible.length,
    top3Aprs,
  };
}

export async function refreshLenderCatalog(opts = {}) {
  const url = probeUrl(opts.base);
  const fetchImpl = opts.fetchImpl ?? fetch;
  const res = await fetchImpl(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const err = new Error(`refresh-lender-catalog: HTTP ${res.status} from ${url}`);
    err.exitCode = 1;
    throw err;
  }
  const body = await res.json();
  const log = formatProbeLog(body, url);
  const ok = eligibleLendersAreAprSorted(body?.lenders);
  return { ok, log, body };
}

const isDirectRun =
  Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  refreshLenderCatalog()
    .then(({ ok, log }) => {
      console.log(JSON.stringify(log, null, 2));
      if (!ok) {
        console.error(
          "refresh-lender-catalog: eligible lenders are not sorted by estimatedApr",
        );
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error(err?.message ?? err);
      process.exit(err?.exitCode ?? 1);
    });
}
