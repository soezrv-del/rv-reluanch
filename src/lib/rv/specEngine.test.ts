import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildBrochureSpecs } from "./brochureSpecs.ts";
import { peekCatalog } from "./catalogLoad.ts";
import { findOemUvwLbs } from "./floorplanSpecs.ts";
import {
  applySharedPaintToRows,
  applySpecFallback,
  catalogSnapshotFromBrochure,
  emptySpecFields,
  paintHasFallbackNumber,
  publishedUvwLbs,
  resolveSharedSpecPaint,
  stripEngineOwnedChatFigures,
} from "./specEngine.ts";
import { parseSpecFieldsFromHtml } from "./specFieldFallback.ts";
import { RVGUIDE_2026_LINEAGE_31ZW_FIXTURE } from "./specFieldFallback.test.ts";

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

const RVGUIDE_31ZW_URL =
  "https://www.rvguide.com/specs/grand-design/class-c/2026/lineage-series-f/31zw.html";

function lineageFills() {
  return parseSpecFieldsFromHtml(RVGUIDE_2026_LINEAGE_31ZW_FIXTURE, {
    source: "rvguide" as const,
    url: RVGUIDE_31ZW_URL,
  });
}

test("catalog misses Lineage 31ZW UVW — no pin in this branch", () => {
  assert.equal(
    findOemUvwLbs("2026", "Grand Design", "Lineage Series F", "31ZW"),
    null,
  );
});

test("empty-catalog fallback paints Lineage 31ZW UVW 18186 with asterisk + URL", () => {
  const spec = peekCatalog()?.RV_DATA?.["Grand Design"]?.["Lineage Series F"];
  const brochure = spec
    ? buildBrochureSpecs(
        spec,
        "2026",
        "Grand Design",
        "Lineage Series F",
        "31ZW",
      )
    : null;
  if (brochure) {
    assert.equal(publishedUvwLbs(brochure), null);
    assert.equal(brochure.uvwLbs, null);
  }

  const snap = catalogSnapshotFromBrochure(LINEAGE, brochure);
  assert.equal(snap.uvwLbs, null);
  assert.ok(emptySpecFields(snap).includes("uvw"));

  const paint = applySpecFallback(snap, lineageFills());
  assert.equal(paint.uvw.lbs, 18186);
  assert.equal(paint.uvw.gap, false);
  assert.equal(paint.uvw.asterisk, true);
  assert.match(paint.uvw.display, /18,186/);
  assert.match(paint.uvw.display, /\*/);
  assert.doesNotMatch(paint.uvw.display, /Confirm brochure|GAP/i);
  assert.equal(paint.uvw.source, "rvguide");
  assert.equal(paint.uvw.sourceUrl, RVGUIDE_31ZW_URL);
  assert.equal(paintHasFallbackNumber(paint), true);
  assert.equal(paint.ccc.lbs, 3814);
  assert.equal(paint.ccc.gap, false);
});

test("shared paint path — Facts snapshot and desk rows both show 18186", () => {
  const paint = resolveSharedSpecPaint(LINEAGE, lineageFills());
  assert.equal(paint.uvw.lbs, 18186);
  assert.equal(paint.uvw.gap, false);

  const rows = applySharedPaintToRows(
    [
      { label: "UVW", value: "GAP", gap: true },
      { label: "GVWR", value: "22,000 lbs", gap: false },
      { label: "Fresh", value: "79 gal", gap: false },
      { label: "Engine", value: "Ford 6.7L", gap: false },
    ],
    paint,
  );
  const uvw = rows.find((r) => r.label === "UVW");
  assert.equal(uvw?.gap, false);
  assert.match(uvw?.value || "", /18,186/);
  assert.equal(uvw?.asterisk, true);
  assert.equal(uvw?.sourceUrl, RVGUIDE_31ZW_URL);
  assert.equal(rows.find((r) => r.label === "Engine")?.value, "Ford 6.7L");
});

test("catalog published UVW is not overwritten by scrape", () => {
  const paint = applySpecFallback(
    {
      identity: LINEAGE,
      uvwLbs: 20000,
      gvwrLbs: 22000,
      cccLbs: 2000,
      fuelCapacityGal: 66.5,
      freshWater: 79,
      grayWater: 66,
      blackWater: 45,
      uvwEstimated: false,
    },
    lineageFills(),
  );
  assert.equal(paint.uvw.lbs, 20000);
  assert.equal(paint.uvw.asterisk, false);
  assert.equal(paint.uvw.source, "catalog");
});

test("chat figures lose engine-owned weight / tank / fuel keys", () => {
  const stripped = stripEngineOwnedChatFigures({
    gvwr: "51,000 lb",
    uvw: "40,000 lb",
    fuelCapacity: "150 gal",
    freshWater: "35 gal",
    engine: "Cummins L9",
    horsepower: "450 HP",
  });
  assert.equal(stripped.gvwr, undefined);
  assert.equal(stripped.uvw, undefined);
  assert.equal(stripped.fuelCapacity, undefined);
  assert.equal(stripped.freshWater, undefined);
  assert.equal(stripped.engine, "Cummins L9");
  assert.equal(stripped.horsepower, "450 HP");
});

test("Facts and Grok both import the shared engine — DialaBot and pins stay out", () => {
  const engine = src("specEngine.ts");
  const fallback = src("specFieldFallback.ts");
  const desk = src("../rvgrok/deskSheet.ts");
  const facts = src("../../components/rvfax/RvDetail.tsx");
  const grok = src("../../components/rvgrok/RvGrokApp.tsx");
  assert.match(engine, /applySpecFallback/);
  assert.match(engine, /resolveSharedSpecPaint/);
  assert.match(desk, /specEngine/);
  assert.match(facts, /specEngine/);
  assert.match(grok, /specEngine|fetchSpecFieldFallback|fallbackFills/);
  assert.doesNotMatch(engine, /[Dd]ialaBot/);
  assert.doesNotMatch(fallback, /[Dd]ialaBot/);
  assert.doesNotMatch(engine, /OEM_UVW_PINS/);
  assert.doesNotMatch(engine, /[Gg]emini/);
});
