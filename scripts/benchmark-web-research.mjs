#!/usr/bin/env node
/**
 * Benchmark RV Grok web research latency.
 *
 * Usage:
 *   node scripts/benchmark-web-research.mjs production
 *   XAI_API_KEY=… node scripts/benchmark-web-research.mjs direct
 *   XAI_API_KEY=… node scripts/benchmark-web-research.mjs local http://127.0.0.1:8080
 *
 * Prints JSON rows: { query, endpoint, ms, ok, model, notesLen, reason }
 */
import { performance } from "node:perf_hooks";

const QUERIES = [
  "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
  "How do I reset the check engine light on a Ford E450 chassis?",
  "My RV generator won't start — what should I check first?",
  "Where is the water heater bypass valve on my motorhome?",
];

async function timeFetch(label, url, init) {
  const t0 = performance.now();
  let ok = false;
  let model;
  let notesLen = 0;
  let reason;
  let status = 0;
  try {
    const res = await fetch(url, init);
    status = res.status;
    const ms = Math.round(performance.now() - t0);
    const ctype = res.headers.get("content-type") || "";
    if (ctype.includes("json")) {
      const data = await res.json();
      ok = Boolean(data?.ok);
      model = data?.model;
      notesLen = typeof data?.notes === "string" ? data.notes.length : 0;
      reason = data?.reason;
      return { query: label, endpoint: url, ms, ok, status, model, notesLen, reason };
    }
    const text = await res.text();
    ok = res.ok && text.length > 0;
    notesLen = text.length;
    return { query: label, endpoint: url, ms, ok, status, model, notesLen, reason: text.slice(0, 120) };
  } catch (e) {
    const ms = Math.round(performance.now() - t0);
    reason = e instanceof Error ? e.message : String(e);
    return { query: label, endpoint: url, ms, ok: false, status, model, notesLen, reason };
  }
}

async function benchProduction() {
  const rows = [];
  for (const query of QUERIES) {
    rows.push(
      await timeFetch(query, "https://www.rvmax.app/api/rvgrok/web-research", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(90_000),
      }),
    );
  }
  return rows;
}

async function benchLocal(base) {
  const rows = [];
  for (const query of QUERIES) {
    rows.push(
      await timeFetch(query, `${base.replace(/\/$/, "")}/api/rvgrok/web-research`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30_000),
      }),
    );
  }
  return rows;
}

async function benchDirect() {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    console.error("XAI_API_KEY required for direct mode");
    process.exit(2);
  }
  const { buildWebSearchRequest, extractResponsesText, WEB_SEARCH_MODELS } =
    await import("../src/lib/rvgrok/webSearch.ts");
  const rows = [];
  for (const query of QUERIES) {
    for (const model of WEB_SEARCH_MODELS) {
      const t0 = performance.now();
      const body = buildWebSearchRequest({
        model,
        query,
        profile: "voice",
      });
      try {
        const res = await fetch("https://api.x.ai/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(15_000),
        });
        const ms = Math.round(performance.now() - t0);
        if (!res.ok) {
          const raw = await res.text().catch(() => "");
          rows.push({
            query,
            endpoint: `direct:${model}`,
            ms,
            ok: false,
            status: res.status,
            model,
            notesLen: 0,
            reason: raw.slice(0, 160),
          });
          continue;
        }
        const data = await res.json();
        const notes = extractResponsesText(data);
        rows.push({
          query,
          endpoint: `direct:${model}`,
          ms,
          ok: Boolean(notes),
          status: res.status,
          model,
          notesLen: notes.length,
          reason: notes ? undefined : "empty",
        });
      } catch (e) {
        rows.push({
          query,
          endpoint: `direct:${model}`,
          ms: Math.round(performance.now() - t0),
          ok: false,
          model,
          notesLen: 0,
          reason: e instanceof Error ? e.message : String(e),
        });
      }
    }
  }
  return rows;
}

const mode = process.argv[2] || "production";
let rows;
if (mode === "production") rows = await benchProduction();
else if (mode === "direct") rows = await benchDirect();
else if (mode === "local") rows = await benchLocal(process.argv[3] || "http://127.0.0.1:8080");
else {
  console.error("mode must be production | direct | local");
  process.exit(2);
}

console.log(JSON.stringify({ mode, at: new Date().toISOString(), rows }, null, 2));
