import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { planSpecFallbackKnowledgeWrite } from "./specFallbackKnowledge.ts";

const root = dirname(fileURLToPath(import.meta.url));

test("voice spec-fallback fills plan the same coach-knowledge write", () => {
  const identity = {
    year: "2022",
    make: "Newmar",
    model: "Dutch Star",
    floorplan: "4369",
  };
  const plan = planSpecFallbackKnowledgeWrite({
    identity,
    query: "tell me about the 2022 Newmar Dutch Star 4369",
    fills: [
      {
        field: "gvwr",
        value: 51000,
        unit: "lbs",
        sourceUrl: "https://www.rvguide.com/specs/newmar/dutch-star/4369",
      },
      {
        field: "freshWater",
        value: 72,
        unit: "gal",
        sourceUrl: "https://www.rvguide.com/specs/newmar/dutch-star/4369",
      },
      {
        field: "fuelCapacity",
        value: 100,
        unit: "gal",
        sourceUrl: "https://www.rvguide.com/specs/newmar/dutch-star/4369",
      },
    ],
  });
  assert.ok(plan);
  assert.equal(plan!.key.make, "newmar");
  assert.equal(plan!.key.floorplan, "4369");
  assert.match(plan!.fields.gvwr?.value || "", /51,000|51000/);
  assert.match(plan!.fields.tanks?.value || "", /fresh 72 gal/);
  assert.equal(plan!.fields.fuel, undefined);
  assert.ok(plan!.sources.some((s) => /rvguide\.com/.test(s)));

  assert.equal(
    planSpecFallbackKnowledgeWrite({
      identity,
      query: "gvwr",
      fills: [
        {
          field: "fuelCapacity",
          value: 100,
          unit: "gal",
          sourceUrl: "https://www.rvusa.com/x",
        },
      ],
    }),
    null,
  );
});

test("spec-fallback route static graph skips the telemetry module that crashed SSR", () => {
  const routePath = join(root, "../../routes/api/rvfax.spec-fallback.ts");
  const leanPath = join(root, "specFallbackKnowledge.ts");
  const route = readFileSync(routePath, "utf8");
  const lean = readFileSync(leanPath, "utf8");

  const leanCode = stripComments(lean);
  assert.match(route, /from "@\/lib\/rvgrok\/specFallbackKnowledge"/);
  assert.match(route, /persistSpecFallbackKnowledge/);
  assert.match(route, /pinCoachKnowledge === true/);
  assert.doesNotMatch(route, /webResearchTelemetry/);
  assert.doesNotMatch(leanCode, /webResearchTelemetry/);
  assert.doesNotMatch(leanCode, /ownLotInventory/);
  assert.doesNotMatch(leanCode, /executeWebResearch/);
  assert.doesNotMatch(leanCode, /from ["']\.\/webSearch/);
  assert.doesNotMatch(leanCode, /coachReport/);
  assert.match(leanCode, /planCoachKnowledgeWrite/);
  assert.match(leanCode, /upsertCoachKnowledgePlan/);

  const banned = new Set([
    "webResearchTelemetry.ts",
    "ownLotInventory.ts",
  ]);
  const seen = new Set<string>();
  const queue = [routePath];
  while (queue.length) {
    const file = queue.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    const base = basenameOf(file);
    assert.equal(
      banned.has(base),
      false,
      `${base} is statically reachable from the spec-fallback route`,
    );
    if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
    let src = "";
    try {
      src = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    const body = src
      .replace(/import\s*\(\s*["'][^"']+["']\s*\)/g, "")
      .replace(/import\s+type\s+[\s\S]*?from\s+["'][^"']+["']/g, "");
    for (const match of body.matchAll(/from\s+["']([^"']+)["']/g)) {
      const spec = match[1]!;
      const next = resolveImport(file, spec);
      if (next) queue.push(next);
    }
  }
});

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function basenameOf(file: string): string {
  return file.split("/").pop() || file;
}

function resolveImport(fromFile: string, spec: string): string | null {
  let base: string | null = null;
  if (spec.startsWith("@/")) {
    base = resolve(root, "../..", spec.slice(2));
  } else if (spec.startsWith(".")) {
    base = resolve(dirname(fromFile), spec);
  }
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`]) {
    try {
      readFileSync(candidate);
      return candidate;
    } catch {
      /* try the next suffix */
    }
  }
  return null;
}
