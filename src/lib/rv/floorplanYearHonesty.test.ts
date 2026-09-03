import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cascadeFromResult } from "./factsOpen.ts";
import type { CatalogIndexSpec } from "./rvTypes.ts";

const root = dirname(fileURLToPath(import.meta.url));

/** Mirrors catalog floorplansForYearFromSpec — kept here so tests run without pulling catalog.ts. */
function floorplansForYearFromSpec(
  year: string,
  spec: CatalogIndexSpec,
): string[] {
  const y = parseInt(year, 10);
  const hasYear = Boolean(year && Number.isFinite(y));
  const all = [...(spec.floorplans ?? [])];

  if (!hasYear) return all;

  const fbyYears = spec.years?.length
    ? [...spec.years]
    : Object.keys(spec.floorplansByYear ?? {})
        .map((k) => parseInt(k, 10))
        .filter((n) => Number.isFinite(n));

  if (fbyYears.length > 0 && !fbyYears.includes(y)) return [];

  const byYearMap = spec.floorplansByYear;
  if (byYearMap && Object.keys(byYearMap).length > 0) {
    const byYear = byYearMap[year] ?? byYearMap[String(y)];
    return byYear?.length ? [...byYear] : [];
  }

  return all;
}

function floorplansForSelectedYearFromSpec(
  year: string,
  spec: CatalogIndexSpec,
  live?: { live?: boolean; floorplansThisYear?: string[] } | null,
): string[] {
  const catalog = floorplansForYearFromSpec(year, spec);
  if (!catalog.length) return [];
  if (live?.live && live.floorplansThisYear?.length) {
    return live.floorplansThisYear;
  }
  return catalog;
}

const catalinaLikeSpec: CatalogIndexSpec = {
  type: "Travel Trailer",
  fuelType: "N/A (towable)",
  floorplans: ["243RBS", "283RKS", "263BHSCK"],
  floorplansByYear: {
    "2024": ["283RKS", "263BHSCK"],
    "2025": ["283RKS"],
    "2026": [],
  },
  years: [2024, 2025, 2026],
};

test("floorplansForYearFromSpec: empty year row stays empty (no aggregate fallback)", () => {
  assert.deepEqual(floorplansForYearFromSpec("2026", catalinaLikeSpec), []);
  assert.ok(catalinaLikeSpec.floorplans!.length > 0);
  assert.notDeepEqual(
    floorplansForYearFromSpec("2026", catalinaLikeSpec),
    catalinaLikeSpec.floorplans,
  );
});

test("floorplansForSelectedYear: empty catalog year ignores live floorplansThisYear", () => {
  assert.deepEqual(
    floorplansForSelectedYearFromSpec("2026", catalinaLikeSpec, {
      live: true,
      floorplansThisYear: ["243RBS", "283RKS"],
    }),
    [],
  );
});

test("saved-unit path: opening a 2026 coach must not substitute aggregate floorplans", () => {
  const savedUnit = {
    year: "2026",
    make: "Coachmen",
    model: "Catalina",
    floorplan: "283RKS",
    data: {
      type: "Travel Trailer",
      floorplans: catalinaLikeSpec.floorplans!,
      floorplansByYear: catalinaLikeSpec.floorplansByYear,
      lengthRange: [26, 36] as [number, number],
      weightRange: [5000, 8500] as [number, number],
      slideouts: 1,
      sleeps: 8,
      msrpRange: [28900, 56000] as [number, number],
      fuelType: "N/A (towable)",
      recalls: 0,
      rating: 4.2,
      image: "",
    },
  };

  const cascade = cascadeFromResult(savedUnit);
  assert.equal(cascade.year, "2026");
  assert.equal(cascade.model, "Catalina");

  const wrongAggregateFallback = savedUnit.data.floorplans;
  assert.ok(wrongAggregateFallback.length > 0);

  const shown = floorplansForSelectedYearFromSpec(
    cascade.year,
    catalinaLikeSpec,
    { live: true, floorplansThisYear: wrongAggregateFallback },
  );
  assert.deepEqual(shown, []);
  assert.notDeepEqual(shown, wrongAggregateFallback);
});

test("RvDetail must not fall back to aggregate data.floorplans", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.doesNotMatch(detail, /return data\.floorplans/);
  assert.match(detail, /floorplansForSelectedYear/);
});

test("catalog search must not default floorplan from aggregate when year row is empty", () => {
  const catalogSrc = readFileSync(join(root, "catalog.ts"), "utf8");
  assert.doesNotMatch(
    catalogSrc,
    /floorplan: sel\.floorplan \|\| fps\[0\] \|\| data\.floorplans\[0\]/,
  );
  assert.match(catalogSrc, /floorplan: sel\.floorplan \|\| fps\[0\] \|\| ""/);
});

test("suggest.ts offers catalog alternatives for parent models missing a year lineup", () => {
  const suggestSrc = readFileSync(join(root, "suggest.ts"), "utf8");
  assert.match(suggestSrc, /suggestCatalogAlternatives/);
  assert.match(suggestSrc, /relatedModelsWithFloorplansInYear/);
});
