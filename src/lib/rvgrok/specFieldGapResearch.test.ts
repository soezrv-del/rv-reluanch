import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { planSpecFallbackKnowledgeWrite } from "./specFallbackKnowledge.ts";
import {
  researchRemainingSpecGaps,
  specGapResearchQuery,
} from "./specFieldGapResearch.ts";
import type { WebResearchApiBody } from "./webResearchTelemetry.ts";

const root = dirname(fileURLToPath(import.meta.url));

const CORNERSTONE = {
  year: "2026",
  make: "Entegra Coach",
  model: "Cornerstone",
  floorplan: "45B",
};

test("GVWR gap query names the locked Cornerstone and the field", () => {
  assert.match(
    specGapResearchQuery(CORNERSTONE, ["gvwr"]),
    /2026 Entegra Coach Cornerstone 45B GVWR/,
  );
});

test("GVWR gap calls live research and pins coach knowledge on a real fill", async () => {
  let seen = "";
  const fills = await researchRemainingSpecGaps({
    identity: CORNERSTONE,
    empty: ["gvwr"],
    execute: async (query) => {
      seen = query;
      const body: WebResearchApiBody = {
        ok: true,
        notes: "CONFIRMED: yes.\nGVWR 54,000 lb.",
        model: "grok-4.7",
        confirmed: true,
        kind: "success",
        durationMs: 1200,
      };
      return body;
    },
  });
  assert.match(seen, /Cornerstone 45B GVWR/);
  assert.equal(fills.length, 1);
  assert.equal(fills[0]?.field, "gvwr");
  assert.equal(fills[0]?.value, 54000);

  const plan = planSpecFallbackKnowledgeWrite({
    identity: CORNERSTONE,
    query: "2026 Entegra Coach Cornerstone 45B GVWR",
    fills,
  });
  assert.ok(plan);
  assert.match(plan!.fields.gvwr?.value || "", /54,000|54000/);
  assert.match(plan!.key.make, /entegra/i);
  assert.match(plan!.key.floorplan, /45b/i);

  const missed = await researchRemainingSpecGaps({
    identity: CORNERSTONE,
    empty: ["gvwr"],
    execute: async () => ({
      ok: true,
      notes: "CONFIRMED: no.",
      model: "grok-4.7",
      confirmed: false,
      kind: "success",
      durationMs: 800,
    }),
  });
  assert.deepEqual(missed, []);

  const helper = readFileSync(join(root, "specFieldGapResearch.ts"), "utf8");
  assert.match(helper, /researchProvider:\s*"xai"/);
  assert.match(helper, /geminiApiKey:\s*""/);
  assert.match(helper, /executeWebResearch/);
});
