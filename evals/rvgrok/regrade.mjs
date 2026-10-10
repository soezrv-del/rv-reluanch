#!/usr/bin/env node
// Re-grade saved raw runs without calling the API:
//   node evals/rvgrok/regrade.mjs RUN.raw.json [--root DIR]
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gradeItem, summarize } from "./grade.mjs";
const here = dirname(fileURLToPath(import.meta.url));
const i = process.argv.indexOf("--root");
const root = resolve(i > 0 ? process.argv[i + 1] : resolve(here, "../.."));
const raw = JSON.parse(readFileSync(process.argv[2], "utf8"));
const items = Object.fromEntries(JSON.parse(readFileSync(resolve(here, "test-set.json"), "utf8")).map((x) => [x.id, x]));
const lot = JSON.parse(readFileSync(resolve(root, "public/inventory/own-lot-latest.json"), "utf8"));
const results = raw.map((run) => gradeItem(items[run.id], run, lot));
for (const r of results) if (!r.pass) console.error(`${r.id} FAIL ${r.fails.join("; ")}`);
console.log(JSON.stringify(summarize(results), null, 2));
