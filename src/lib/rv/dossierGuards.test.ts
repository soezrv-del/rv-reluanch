import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  DOSSIER_EXTRACT_CALL_MAX_MS,
  DOSSIER_SERVER_BUDGET_MS,
  createDeadline,
  createDossierClientCoordinator,
  createInflightDeduper,
  createTtlCache,
  dossierRequestKey,
  shouldRetryDossier,
  stableStringify,
  withStageTimeout,
  type DossierAttemptResult,
} from "./dossierGuards.ts";
import { FACTS_GAP_RESEARCH_TIMEOUT_MS } from "./factsDossierResearch.ts";

const here = dirname(fileURLToPath(import.meta.url));
type R = DossierAttemptResult & { error?: string };
const ABORTED: R = { ok: false, aborted: true, error: "cancelled" };

test("retry cap: at most one retry on a transient 503", async () => {
  const c = createDossierClientCoordinator<R>();
  let calls = 0;
  const res = await c.request(
    "k",
    async () => {
      calls++;
      return { ok: false, status: 503 };
    },
    { abortedResult: ABORTED },
  );
  assert.equal(res.ok, false);
  assert.equal(calls, 2);
});

test("never retries a timeout, 504 or abort", async () => {
  for (const r of [
    { ok: false, timedOut: true },
    { ok: false, status: 504 },
    { ok: false, status: 408 },
    { ok: false, aborted: true },
  ] as R[]) {
    const c = createDossierClientCoordinator<R>();
    let calls = 0;
    await c.request(
      "k",
      async () => {
        calls++;
        return r;
      },
      { abortedResult: ABORTED },
    );
    assert.equal(calls, 1, JSON.stringify(r));
  }
  assert.equal(shouldRetryDossier({ attempt: 0, networkError: true }), true);
  assert.equal(shouldRetryDossier({ attempt: 1, networkError: true }), false);
  assert.equal(shouldRetryDossier({ attempt: 0, status: 500 }), false);
});

test("failed report is memoized until forced (stops re-render loops)", async () => {
  const c = createDossierClientCoordinator<R>();
  let calls = 0;
  const attempt = async () => {
    calls++;
    return { ok: false, timedOut: true } as R;
  };
  await c.request("k", attempt, { abortedResult: ABORTED });
  await c.request("k", attempt, { abortedResult: ABORTED });
  await c.request("k", attempt, { abortedResult: ABORTED });
  assert.equal(calls, 1);
  await c.request("k", attempt, { abortedResult: ABORTED, force: true });
  assert.equal(calls, 2);
});

test("client in-flight dedupe: concurrent callers share one request; abort detaches only that caller", async () => {
  const c = createDossierClientCoordinator<R>();
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const attempt = async () => {
    calls++;
    await gate;
    return { ok: true } as R;
  };
  const ctrl = new AbortController();
  const a = c.request("k", attempt, { abortedResult: ABORTED, signal: ctrl.signal });
  const b = c.request("k", attempt, { abortedResult: ABORTED });
  ctrl.abort();
  assert.deepEqual(await a, ABORTED);
  // Remount after abort joins the same request instead of re-POSTing.
  const d = c.request("k", attempt, { abortedResult: ABORTED });
  release();
  assert.equal((await b).ok, true);
  assert.equal((await d).ok, true);
  assert.equal(calls, 1);
});

test("server in-flight dedupe collapses identical concurrent work", async () => {
  const d = createInflightDeduper<number>();
  let calls = 0;
  const fn = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 10));
    return 42;
  };
  const out = await Promise.all([d.run("x", fn), d.run("x", fn), d.run("x", fn)]);
  assert.deepEqual(out, [42, 42, 42]);
  assert.equal(calls, 1);
  assert.equal(d.size(), 0);
  await d.run("x", fn);
  assert.equal(calls, 2);
});

test("cache hit within TTL, miss after; LRU evicts oldest", () => {
  let t = 0;
  const c = createTtlCache<string>({ ttlMs: 1000, max: 2, now: () => t });
  c.set("a", "A");
  t = 999;
  assert.equal(c.get("a"), "A");
  t = 2000;
  assert.equal(c.get("a"), undefined);
  c.set("a", "A");
  c.set("b", "B");
  c.set("c", "C");
  assert.equal(c.get("a"), undefined);
  assert.equal(c.get("c"), "C");
  c.set("f", "F", 10);
  t = 2011;
  assert.equal(c.get("f"), undefined);
});

test("request key normalizes coach text and is stable across candidate key order", () => {
  const k1 = dossierRequestKey({
    year: "2020 ",
    make: "Tiffin",
    model: "Phaeton  37BH",
    candidate: { a: 1, b: "x" },
    day: "2026-10-10",
  });
  const k2 = dossierRequestKey({
    year: "2020",
    make: "tiffin",
    model: "phaeton 37bh",
    candidate: { b: "x", a: 1, c: undefined },
    day: "2026-10-10",
  });
  assert.equal(k1, k2);
  assert.notEqual(k1, dossierRequestKey({ year: "2020", make: "tiffin", model: "phaeton 37bh", candidate: { a: 1, b: "x" }, day: "2026-10-11" }));
  assert.equal(stableStringify({ b: 1, a: [2, { d: 1, c: 0 }] }), '{"a":[2,{"c":0,"d":1}],"b":1}');
});

test("stage timeout aborts a hung stage and returns null instead of hanging", async () => {
  let aborted = false;
  const t0 = Date.now();
  const res = await withStageTimeout(30, (signal) => {
    signal.addEventListener("abort", () => (aborted = true));
    return new Promise<string>(() => {});
  });
  assert.equal(res, null);
  assert.equal(aborted, true);
  assert.ok(Date.now() - t0 < 1000);
  assert.equal(await withStageTimeout(50, async () => "ok"), "ok");
  assert.equal(await withStageTimeout(0, async () => "never"), null);
});

test("deadline: stages share one budget and stop when it runs out", () => {
  let t = 0;
  const d = createDeadline(100_000, 10_000, () => t);
  assert.equal(d.stageMs(45_000), 45_000);
  t = 60_000;
  assert.equal(d.stageMs(45_000), 30_000);
  t = 86_000;
  assert.equal(d.stageMs(45_000), 0);
  assert.equal(d.expired(), true);
});

test("worst-case chain fits well under Vercel's 300s and under the 180s client wait", () => {
  assert.ok(DOSSIER_SERVER_BUDGET_MS < 180_000);
  assert.ok(FACTS_GAP_RESEARCH_TIMEOUT_MS + 5_000 + DOSSIER_EXTRACT_CALL_MAX_MS < DOSSIER_SERVER_BUDGET_MS);
});

test("wiring: route and client use budgets, cache, dedupe; RvDetail keys on candidate value", () => {
  const route = readFileSync(join(here, "../../routes/api/rvfax.dossier.ts"), "utf8");
  assert.match(route, /AbortSignal\.timeout\(budget\)/);
  assert.match(route, /dossierInflight\.run\(reqKey/);
  assert.match(route, /resultCache\.get\(reqKey\)/);
  assert.match(route, /withStageTimeout\(/);
  const live = readFileSync(join(here, "liveDossier.ts"), "utf8");
  assert.match(live, /dossierClient\.request\(/);
  const detail = readFileSync(join(here, "../../components/rvfax/RvDetail.tsx"), "utf8");
  assert.match(detail, /liveRetry, catalogCandidateKey\]\);/);
  assert.doesNotMatch(detail, /liveRetry, catalogCandidate\]\);/);
});
