#!/usr/bin/env node
/**
 * Seed Neon `rvgrok_coach_knowledge` from verified brochure OEM GVWR pins.
 *
 * Default = dry-run (print YMMF + gvwr + key + counts). No DATABASE_URL needed.
 * `--apply` writes via upsertCoachKnowledge (requires DATABASE_URL). Never
 * auto-apply. Optional `--makes=winnebago,jayco` for a later pilot.
 *
 * Sources: brochure-pin + floorplanSpecs:OEM_GVWR_PINS.
 * Store upsert only. Phone bot, live research, and brochure SoT stay untouched.
 *
 *   npm run seed:coach-knowledge-pins
 *   npm run seed:coach-knowledge-pins -- --makes=jayco
 *   npm run seed:coach-knowledge-pins -- --apply
 */
import { register } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BROCHURE_PIN_SOURCES,
  collectBrochurePinSeedCandidates,
  formatSeedCandidateLine,
  listStrictMy2027OemGvwrPins,
  parseMakesFlag,
  type BrochurePinSeedCandidate,
} from "../src/lib/rvgrok/brochurePinSeed.ts";

type CliOpts = {
  apply: boolean;
  makes: string[];
};

export function parseSeedCliArgs(argv: string[]): CliOpts {
  let apply = false;
  let makesRaw = "";
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i] || "";
    if (arg === "--apply") {
      apply = true;
      continue;
    }
    if (arg.startsWith("--makes=")) {
      makesRaw = arg.slice("--makes=".length);
      continue;
    }
    if (arg === "--makes") {
      makesRaw = argv[i + 1] || "";
      i += 1;
    }
  }
  return { apply, makes: parseMakesFlag(makesRaw) };
}

function countByMake(rows: BrochurePinSeedCandidate[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    out[row.make] = (out[row.make] || 0) + 1;
  }
  return out;
}

function printDryRun(rows: BrochurePinSeedCandidate[], makes: string[]): void {
  const pins = listStrictMy2027OemGvwrPins().filter((p) => {
    if (!makes.length) return true;
    const hay = p.makeIncludes.toLowerCase();
    return makes.some((m) => hay === m || hay.includes(m) || m.includes(hay));
  });
  const keys = new Set(
    rows.map((r) => [r.key.year, r.key.make, r.key.model, r.key.floorplan].join("|")),
  );
  const gvwr = new Set(rows.map((r) => r.gvwrLbs));
  const byMake = countByMake(rows);

  for (const row of rows) {
    console.log(formatSeedCandidateLine(row));
  }
  console.log("---");
  console.log(`strict MY2027 pins: ${pins.length}`);
  console.log(`candidates (YMMF): ${rows.length}`);
  console.log(`keys: ${keys.size}`);
  console.log(`gvwr values: ${gvwr.size}`);
  console.log(
    `makes: ${Object.entries(byMake)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([make, n]) => `${make}=${n}`)
      .join(", ")}`,
  );
  console.log(`sources: ${BROCHURE_PIN_SOURCES.join(", ")}`);
  console.log("mode: dry-run — no Neon write. Pass --apply to upsert (requires DATABASE_URL).");
}

async function applyRows(rows: BrochurePinSeedCandidate[]): Promise<void> {
  const databaseUrl = (process.env.DATABASE_URL || "").trim();
  if (!databaseUrl) {
    console.error("--apply requires DATABASE_URL (Neon). Refusing to write PGLite or invent a backend.");
    process.exit(1);
  }

  register(
    new URL("./seed-coach-knowledge-hooks.mjs", import.meta.url).href,
    import.meta.url,
  );
  const { upsertCoachKnowledge } = await import(
    "../src/lib/rvgrok/coachKnowledgeStore.ts"
  );

  let ok = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      const written = await upsertCoachKnowledge({
        key: row.key,
        fields: row.fields,
        sources: row.sources,
        confidence: row.confidence,
      });
      if (written) ok += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }
  console.log(`applied: ${ok}  failed: ${failed}  candidates: ${rows.length}`);
  if (failed && !ok) process.exit(1);
}

async function main(): Promise<void> {
  const opts = parseSeedCliArgs(process.argv.slice(2));
  const rows = collectBrochurePinSeedCandidates({ makes: opts.makes });
  if (!opts.apply) {
    printDryRun(rows, opts.makes);
    return;
  }
  await applyRows(rows);
}

const isCli =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  main().catch((err) => {
    console.error(err?.message || err);
    process.exit(1);
  });
}
