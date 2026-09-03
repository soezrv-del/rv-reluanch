#!/usr/bin/env node
/** Benchmark one host's /api/rvgrok/web-research for the four dealer-lot queries. */
import { performance } from "node:perf_hooks";

const host = process.argv[2] || "https://rv-reluanch-onzf6gr25-rvfox.vercel.app";
const QUERIES = [
  "Where is the battery disconnect on a 2005 Winnebago Adventurer?",
  "How do I reset the check engine light on a Ford E450 chassis?",
  "My RV generator won't start — what should I check first?",
  "Where is the water heater bypass valve on my motorhome?",
];

const rows = [];
for (const query of QUERIES) {
  const t0 = performance.now();
  const res = await fetch(`${host.replace(/\/$/, "")}/api/rvgrok/web-research`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query }),
    signal: AbortSignal.timeout(30_000),
  });
  const ms = Math.round(performance.now() - t0);
  const data = await res.json();
  rows.push({
    query,
    ms,
    ok: Boolean(data?.ok),
    model: data?.model,
    notesLen: typeof data?.notes === "string" ? data.notes.length : 0,
    reason: data?.reason,
    notesPreview: typeof data?.notes === "string" ? data.notes.slice(0, 120) : undefined,
  });
}
console.log(JSON.stringify({ host, at: new Date().toISOString(), rows }, null, 2));
