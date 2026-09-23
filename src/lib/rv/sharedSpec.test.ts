import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildBrochureSpecs } from "./brochureSpecs.ts";
import { RV_DATA } from "./rvData.ts";
import {
  applySharedSpecToBrochure,
  paintSharedUvw,
  resolveSharedSpec,
  resolveSharedSpecSync,
} from "./sharedSpec.ts";
import { resolveFactsBrochure } from "../rvgrok/factsBrochure.ts";
import { resolveLockedOemWeights } from "../rvgrok/lockedWeights.ts";
import { installCatalog } from "./catalogLoad.ts";
import { buildDeskSheetPayload } from "../rvgrok/deskSheet.ts";

const root = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(root, rel), "utf8");
}

const LINEAGE = {
  year: "2026",
  make: "Grand Design",
  model: "Lineage Series F",
  floorplan: "31ZW",
};

test("shared spec paints Lineage F 31ZW dry-weight UVW 18,186", () => {
  const snap = resolveSharedSpecSync(LINEAGE);
  assert.equal(snap.uvwLbs, 18186);
  assert.equal(snap.uvwEstimated, false);
  assert.equal(snap.uvwIsDryWeight, true);
  assert.equal(snap.gvwrLbs, 22000);
  assert.equal(snap.cccLbs, 3814);
  assert.equal(snap.freshWaterGal, 79);
  assert.equal(snap.grayWaterGal, 66);
  assert.equal(snap.blackWaterGal, 45);
  assert.equal(snap.fuelCapacityGal, 66.5);
  const paint = paintSharedUvw(snap);
  assert.equal(paint.gap, false);
  assert.match(paint.value, /18,186/);
  assert.match(paint.value, /\*/);
  assert.match(paint.note || "", /dry weight/i);
  assert.match(paint.note || "", /rvguide\.com/i);
});

test("Lineage pin does not leak to 31ZW5 / other years / Series M", () => {
  assert.equal(
    resolveSharedSpecSync({ ...LINEAGE, floorplan: "31ZW5" }).uvwLbs,
    null,
  );
  assert.equal(resolveSharedSpecSync({ ...LINEAGE, year: "2025" }).uvwLbs, null);
  assert.equal(resolveSharedSpecSync({ ...LINEAGE, year: "2027" }).uvwLbs, null);
  assert.equal(
    resolveSharedSpecSync({
      year: "2026",
      make: "Grand Design",
      model: "Lineage Series M",
      floorplan: "25FW",
    }).uvwLbs,
    null,
  );
});

test("Facts brochure overlay and Grok lock/desk share the same 18,186", () => {
  const spec = RV_DATA["Grand Design"]?.["Lineage Series F"];
  assert.ok(spec);
  installCatalog({ RV_DATA, MAKES: Object.keys(RV_DATA) });
  const raw = buildBrochureSpecs(
    spec,
    LINEAGE.year,
    LINEAGE.make,
    LINEAGE.model,
    LINEAGE.floorplan,
  );
  const snap = resolveSharedSpecSync(LINEAGE);
  const facts = applySharedSpecToBrochure(raw, snap);
  const locked = resolveLockedOemWeights(LINEAGE);
  const desk = buildDeskSheetPayload(LINEAGE, null, "");
  const uvw = desk.rows.find((r) => r.label === "UVW");

  assert.equal(facts.uvwLbs, 18186);
  assert.equal(facts.uvwEstimated, false);
  assert.match(facts.uvw || "", /18,186/);
  const grok = resolveFactsBrochure(LINEAGE);
  if (grok) {
    assert.equal(grok.uvwLbs, 18186);
    assert.match(grok.uvw || "", /18,186/);
  }
  assert.equal(locked.uvwLbs, 18186);
  assert.equal(locked.gvwrLbs, 22000);
  assert.ok(uvw);
  assert.equal(uvw!.gap, false);
  assert.match(uvw!.value, /18,186/);
});

test("resolveSharedSpec does not scrape when pins already fill capacity", async () => {
  let fetches = 0;
  const snap = await resolveSharedSpec(LINEAGE, {
    fetch: async (url) => {
      fetches += 1;
      return { ok: true, url, text: "", contentType: "text/html" };
    },
  });
  assert.equal(snap.uvwLbs, 18186);
  assert.equal(fetches, 0, "catalog / pin hit — do not scrape");
});

test("shared module is the only spec fetch+paint path — no Gemini", () => {
  const shared = src("sharedSpec.ts");
  const scrape = src("specFieldScrape.ts");
  const grokBrochure = src("../rvgrok/factsBrochure.ts");
  const locked = src("../rvgrok/lockedWeights.ts");
  const desk = src("../rvgrok/deskSheet.ts");
  const gap = src("factsDossierGapPlan.ts");
  const research = src("factsDossierResearch.ts");
  const detail = src("../../components/rvfax/RvDetail.tsx");

  assert.match(shared, /resolveSharedSpecSync/);
  assert.match(shared, /scrapeEmptySpecFields/);
  assert.match(grokBrochure, /resolveSharedSpecSync/);
  assert.match(locked, /resolveSharedSpecSync/);
  assert.match(desk, /resolveSharedSpecSync/);
  assert.doesNotMatch(desk, /findOemUvwLbs|findOemHoldingTanks|publishedWeightLbs/);
  assert.match(gap, /findOemUvwPin/);
  assert.match(research, /resolveSharedSpec/);
  assert.match(detail, /applySharedSpecToBrochure/);
  for (const text of [shared, scrape, grokBrochure, locked, desk, research]) {
    assert.doesNotMatch(text, /geminiResearch|google.?genai|GoogleGenerative/i);
  }
});
