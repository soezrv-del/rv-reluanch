#!/usr/bin/env node
// RvGrok eval harness: runs the 63-item test set through the real
// /api/rvgrok POST handler in-process (real xAI calls, local lot JSON),
// then grades each reply deterministically.
//
//   node evals/rvgrok/run-eval.mjs [--root DIR] [--out FILE] [--only R01,R02] [--concurrency 4]
//
// Needs XAI_API_KEY. DATABASE_URL is ignored (memory/lessons stay local).
// Voice items run through the chat pipeline (the realtime voice path is not
// covered; a voice smoke pass is a later PR).
import { createJiti } from "jiti";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gradeItem, summarize } from "./grade.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : dflt;
};
const root = resolve(arg("root", resolve(here, "../..")));
const out = arg("out", "");
const only = (arg("only", "") || "").split(",").filter(Boolean);
const concurrency = Number(arg("concurrency", "4"));

if (!process.env.XAI_API_KEY) {
  console.error("XAI_API_KEY is not set; the harness needs the real xAI API.");
  process.exit(2);
}
delete process.env.DATABASE_URL;

const items = JSON.parse(readFileSync(resolve(here, "test-set.json"), "utf8"))
  .filter((it) => !only.length || only.includes(it.id));
const context = JSON.parse(readFileSync(resolve(here, "context.json"), "utf8"));
const lot = JSON.parse(readFileSync(resolve(root, "public/inventory/own-lot-latest.json"), "utf8"));

// Capture every xAI chat request so the grader sees exactly what the model saw.
const realFetch = globalThis.fetch;
let current = null;
globalThis.fetch = async (input, init) => {
  const url = typeof input === "string" ? input : input?.url || String(input);
  if (current && /api\.x\.ai\/v1\/chat\/completions/.test(url) && init?.body) {
    try { current.requests.push(JSON.parse(String(init.body))); } catch { /* ignore */ }
  }
  return realFetch(input, init);
};
const realInfo = console.info;
console.info = (...a) => {
  const line = a.map(String).join(" ");
  if (current && line.startsWith("[rvgrok] tool ")) current.toolLog.push(line);
  if (process.env.EVAL_VERBOSE) realInfo(...a);
};
console.warn = () => {};
console.error = () => {};

const jiti = createJiti(root + "/", { alias: { "@": root + "/src" } });
const { HARD_ADMIN } = await jiti.import(root + "/src/lib/access/constants.ts");
const mod = await jiti.import(root + "/src/routes/api/rvgrok.ts");
const POST = mod.Route.options.server.handlers.POST;

function parseSse(text) {
  let reply = "";
  const steps = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
    let ev;
    try { ev = JSON.parse(line.slice(6)); } catch { continue; }
    const delta = ev?.choices?.[0]?.delta?.content;
    if (typeof delta === "string") reply += delta;
    else if (ev?.type === "replace") reply = String(ev.text || "");
    else if (ev?.type === "step" && ev.status === "done") steps.push({ tool: ev.tool, input: ev.input, result: ev.result });
  }
  return { reply, steps };
}

// Serialize turns: the fetch/console capture is process-global.
async function runOne(item) {
  const prior = (context[item.id] || []).map(([role, content]) => ({ role, content }));
  const rec = { requests: [], toolLog: [] };
  current = rec;
  const t0 = Date.now();
  let text = "";
  try {
    const req = new Request("http://localhost:8080/api/rvgrok", {
      method: "POST",
      headers: { "content-type": "application/json", "x-rvfox-phone": HARD_ADMIN.e164 },
      body: JSON.stringify({ messages: [...prior, { role: "user", content: item.question }] }),
    });
    const res = await POST({ request: req });
    text = await res.text();
  } catch (err) {
    text = `data: ${JSON.stringify({ type: "replace", text: `HARNESS ERROR ${err?.message}` })}`;
  }
  current = null;
  const { reply, steps } = parseSse(text);
  return { id: item.id, ms: Date.now() - t0, reply, steps, requests: rec.requests, toolLog: rec.toolLog, prior };
}

// Concurrency would mix captures, so items run one at a time; --concurrency
// is accepted for later use but capped at 1 while capture is global.
void concurrency;
const results = [];
const raw = [];
for (const item of items) {
  const run = await runOne(item);
  raw.push(run);
  const graded = gradeItem(item, run, lot);
  results.push(graded);
  process.stderr.write(`${item.id} ${graded.pass ? "PASS" : "FAIL"} ${graded.fails.join("; ")} (${run.ms}ms)\n`);
}
const summary = summarize(results);
console.log(JSON.stringify(summary, null, 2));
if (out) {
  writeFileSync(out, JSON.stringify({ summary, results }, null, 2));
  // Raw runs (requests, tool steps) so the grader can be re-run offline.
  writeFileSync(out.replace(/\.json$/, "") + ".raw.json", JSON.stringify(raw));
}
process.exit(0);
