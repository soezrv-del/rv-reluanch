import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLiveCatalog } from "../../../scripts/load-live-catalog.mjs";
import { cascadeFromResult } from "./factsOpen.ts";
import { resolveFactsFloorplanOptions } from "./floorplanOptions.ts";
import { toggleSavedUnit } from "./savedUnits.ts";
import type { CatalogIndexSpec, RVSpec } from "./rvTypes.ts";

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
): string[] {
  const y = parseInt(year, 10);
  if (!year || !Number.isFinite(y)) return [];
  return resolveFactsFloorplanOptions(floorplansForYearFromSpec(year, spec));
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

test("floorplansForSelectedYear: empty catalog year ignores a live floorplan list", () => {
  assert.deepEqual(floorplansForSelectedYearFromSpec("2026", catalinaLikeSpec), []);
  assert.notDeepEqual(
    floorplansForSelectedYearFromSpec("2026", catalinaLikeSpec),
    ["243RBS", "283RKS"],
  );
});

test("floorplansForSelectedYear: no year is never a current-year lineup", () => {
  assert.deepEqual(floorplansForSelectedYearFromSpec("", catalinaLikeSpec), []);
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
  assert.match(fax, /Floorplans · \$\{model\} · all years/);
  assert.doesNotMatch(fax, /yearsForFloorplanCode/);
  assert.match(fax, /loadSavedUnits\(\)/);
  assert.match(
    fax,
    /applySel\(sel\);\s*setDetail\(hydrateShareCoachResult\(unit\)\)/,
  );
});

test("suggest.ts offers catalog alternatives for parent models missing a year lineup", () => {
  const suggestSrc = readFileSync(join(root, "suggest.ts"), "utf8");
  assert.match(suggestSrc, /suggestCatalogAlternatives/);
  assert.match(suggestSrc, /relatedModelsWithFloorplansInYear/);
});

const liveCatalog = await loadLiveCatalog();

function yearRow(make: string, model: string, year: string): string[] {
  const spec = liveCatalog.RV_DATA[make]?.[model] as RVSpec | undefined;
  const row = spec?.floorplansByYear?.[year];
  assert.ok(row?.length, `${year} ${make} ${model} has a catalog year row`);
  return [...row!];
}

test("Facts floorplan options equal the catalog year row, including lists longer than 8", () => {
  const catalogSrc = readFileSync(join(root, "catalog.ts"), "utf8");
  assert.doesNotMatch(catalogSrc, /live\.floorplansThisYear/);
  const dossier = readFileSync(
    join(root, "../../routes/api/rvfax.dossier.ts"),
    "utf8",
  );
  assert.match(dossier, /floorplansThisYear: list\("floorplansThisYear"\)/);
  assert.doesNotMatch(dossier, /floorplansThisYear: arr\(/);

  const admiral = yearRow("Holiday Rambler", "Admiral", "2026");
  const imagine = yearRow("Grand Design", "Imagine", "2026");
  assert.ok(admiral.length > 0 && admiral.length <= 8);
  assert.ok(imagine.length > 8, "Imagine 2026 is the combo an 8-cap used to cut");

  assert.deepEqual(resolveFactsFloorplanOptions(admiral), admiral);
  assert.deepEqual(resolveFactsFloorplanOptions(imagine), imagine);
  assert.notDeepEqual(resolveFactsFloorplanOptions(imagine), imagine.slice(0, 8));

  const cornerstone = yearRow("Entegra Coach", "Cornerstone", "2026");
  const allegro = yearRow("Tiffin", "Allegro", "2017");
  const redhawk = yearRow("Jayco", "Redhawk SE", "2027");
  assert.deepEqual(resolveFactsFloorplanOptions(cornerstone), cornerstone);
  assert.deepEqual(resolveFactsFloorplanOptions(allegro), allegro);
  assert.deepEqual(resolveFactsFloorplanOptions(redhawk), redhawk);
  assert.ok(redhawk.length > 8);
});

test("floorplan sheet list is the scrollport above the dock", () => {
  const sheet = readFileSync(
    join(root, "../../components/rvfax/SelectSheet.tsx"),
    "utf8",
  );
  const css = readFileSync(join(root, "../../styles.css"), "utf8");
  assert.match(sheet, /data-sheet-list/);
  assert.match(sheet, /overflow-y-auto/);
  assert.match(sheet, /touchAction: "pan-y"/);
  assert.match(sheet, /min-h-0 flex-1/);
  assert.doesNotMatch(sheet, /100dvh/);
  assert.doesNotMatch(sheet, /70dvh/);
  assert.doesNotMatch(sheet, /7\.25rem/);
  assert.doesNotMatch(sheet, /createPortal/);
  assert.doesNotMatch(sheet, /sheet-rise/);
  assert.doesNotMatch(css, /@keyframes sheet-rise/);
  assert.doesNotMatch(css, /\.select-sheet-panel \{\s*max-height: 88dvh/);
});
