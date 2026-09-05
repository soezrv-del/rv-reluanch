import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cascadeFromResult } from "./factsOpen.ts";
import { toggleSavedUnit } from "./savedUnits.ts";
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
  const y = parseInt(year, 10);
  if (!year || !Number.isFinite(y)) return [];
  const catalog = floorplansForYearFromSpec(year, spec);
  if (!catalog.length) return [];
  if (live?.live && live.floorplansThisYear?.length) {
    return live.floorplansThisYear;
  }
  return catalog;
}

function floorplanAvailableInYearFromSpec(
  spec: CatalogIndexSpec,
  floorplan: string,
  year: number,
): boolean {
  const fbyYears = spec.years?.length
    ? [...spec.years]
    : Object.keys(spec.floorplansByYear ?? {})
        .map((k) => parseInt(k, 10))
        .filter((n) => Number.isFinite(n));
  if (fbyYears.length > 0 && !fbyYears.includes(year)) return false;

  const byYearMap = spec.floorplansByYear;
  if (byYearMap && Object.keys(byYearMap).length > 0) {
    const byYear = byYearMap[String(year)] ?? byYearMap[year as unknown as string];
    return Boolean(byYear?.includes(floorplan));
  }
  const fps = spec.floorplans ?? [];
  if (fps.length === 0) return false;
  return fps.includes(floorplan);
}

function formatYearRanges(years: number[]): string {
  if (!years.length) return "";
  const sorted = [...years]
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  if (!sorted.length) return "";
  const parts: string[] = [];
  let start = sorted[0]!;
  let prev = start;
  for (let i = 1; i <= sorted.length; i++) {
    const n = sorted[i];
    if (n === prev + 1) {
      prev = n;
      continue;
    }
    parts.push(start === prev ? String(start) : `${start}–${prev}`);
    if (n != null) {
      start = prev = n;
    }
  }
  return parts.join(", ");
}

function yearsForFloorplanCodeFromSpec(
  spec: CatalogIndexSpec,
  code: string,
): number[] {
  const fby = spec.floorplansByYear;
  if (!fby) return [];
  return Object.entries(fby)
    .filter(([, fps]) => fps?.includes(code))
    .map(([y]) => parseInt(y, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
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

test("floorplansForYearFromSpec: no year returns the historical union", () => {
  assert.deepEqual(
    floorplansForYearFromSpec("", catalinaLikeSpec),
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

test("floorplansForSelectedYear: no year is never a current-year lineup", () => {
  assert.deepEqual(
    floorplansForSelectedYearFromSpec("", catalinaLikeSpec, {
      live: true,
      floorplansThisYear: catalinaLikeSpec.floorplans,
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

test("saved unit restore stores the full result snapshot and reopens with that year", () => {
  const snapshot = {
    year: "2026",
    make: "Coachmen",
    model: "Catalina",
    floorplan: "283RKS",
    data: { type: "Travel Trailer", floorplans: catalinaLikeSpec.floorplans },
  };
  const stored = toggleSavedUnit([], snapshot);
  assert.equal(stored.length, 1);
  assert.equal(stored[0]!.year, "2026");
  assert.equal(stored[0]!.floorplan, "283RKS");
  assert.deepEqual(stored[0]!.data.floorplans, catalinaLikeSpec.floorplans);

  const restored = cascadeFromResult(stored[0]!);
  assert.equal(restored.year, "2026");
  assert.equal(restored.make, "Coachmen");
  assert.equal(restored.model, "Catalina");
  assert.equal(restored.floorplan, "283RKS");

  const shown = floorplansForSelectedYearFromSpec(
    restored.year,
    catalinaLikeSpec,
  );
  assert.deepEqual(shown, []);
});

test("RvDetail must not fall back to aggregate data.floorplans", () => {
  const detail = readFileSync(
    join(root, "../../components/rvfax/RvDetail.tsx"),
    "utf8",
  );
  assert.doesNotMatch(detail, /return data\.floorplans/);
  assert.match(detail, /floorplansForSelectedYear/);
  assert.match(detail, /Floorplans across model years/);
});

test("catalog search must not default floorplan from aggregate when year row is empty", () => {
  const catalogSrc = readFileSync(join(root, "catalog.ts"), "utf8");
  assert.doesNotMatch(
    catalogSrc,
    /floorplan: sel\.floorplan \|\| fps\[0\] \|\| data\.floorplans\[0\]/,
  );
  assert.match(catalogSrc, /floorplan: sel\.floorplan \|\| fps\[0\] \|\| ""/);
  assert.match(
    catalogSrc,
    /if \(!year \|\| !Number\.isFinite\(y\)\) return \[\]/,
  );
});

test("floorplanAvailableInYear: empty year row does not consult the union", () => {
  assert.equal(
    floorplanAvailableInYearFromSpec(catalinaLikeSpec, "283RKS", 2026),
    false,
  );
  assert.equal(
    floorplanAvailableInYearFromSpec(catalinaLikeSpec, "283RKS", 2025),
    true,
  );
  const catalogSrc = readFileSync(join(root, "catalog.ts"), "utf8");
  assert.doesNotMatch(
    catalogSrc,
    /if \(byYear\?\.length\) return byYear\.includes\(floorplan\)/,
  );
});

test("no-year union codes are labeled with their own years, not as current", () => {
  assert.deepEqual(yearsForFloorplanCodeFromSpec(catalinaLikeSpec, "283RKS"), [
    2024, 2025,
  ]);
  assert.deepEqual(yearsForFloorplanCodeFromSpec(catalinaLikeSpec, "243RBS"), []);
  assert.equal(formatYearRanges([2012, 2013, 2014, 2016, 2019, 2020, 2021]), "2012–2014, 2016, 2019–2021");
});

test("floorplan picker copy does not imply currency on a no-year browse", () => {
  const fax = readFileSync(
    join(root, "../../components/rvfax/RvFaxApp.tsx"),
    "utf8",
  );
  assert.doesNotMatch(fax, /layouts for this year/);
  assert.doesNotMatch(fax, /Available for this coach/);
  assert.match(fax, /not a current-year lineup/);
  assert.match(fax, /yearsForFloorplanCode/);
  assert.match(fax, /loadSavedUnits\(\)/);
  assert.match(
    fax,
    /applySel\(cascadeFromResult\(r\)\);\s*setDetail\(hydrateShareCoachResult\(r\)\)/,
  );
});

test("suggest.ts offers catalog alternatives for parent models missing a year lineup", () => {
  const suggestSrc = readFileSync(join(root, "suggest.ts"), "utf8");
  assert.match(suggestSrc, /suggestCatalogAlternatives/);
  assert.match(suggestSrc, /relatedModelsWithFloorplansInYear/);
});
