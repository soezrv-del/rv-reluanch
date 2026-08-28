import { CLASSIC_BRANDS, MAKES, RV_CARD_IMAGE, RV_DATA, YEARS, type RVSpec } from "./rvData";
import { computeRating } from "./ratingSystem";

export type { RVSpec };
export { MAKES, YEARS, RV_DATA, CLASSIC_BRANDS };

/** Top-of-RvFax class filter tabs */
export type RvClassId =
  | ""
  | "class-a"
  | "class-b"
  | "class-c"
  | "super-c"
  | "fifth-wheel"
  | "travel-trailer"
  | "toy-hauler";

export const RV_CLASS_TABS: {
  id: RvClassId;
  label: string;
  short: string;
}[] = [
  { id: "", label: "All", short: "All" },
  { id: "class-a", label: "Class A", short: "A" },
  { id: "class-b", label: "Class B", short: "B" },
  { id: "class-c", label: "Class C", short: "C" },
  { id: "super-c", label: "Super C", short: "SC" },
  { id: "fifth-wheel", label: "Fifth Wheel", short: "5th" },
  { id: "travel-trailer", label: "Travel Trailer", short: "TT" },
  { id: "toy-hauler", label: "Toy Hauler", short: "Toy" },
];

/** Match catalog type strings to a class tab */
export function matchesRvClass(spec: RVSpec, classId: string | undefined): boolean {
  if (!classId) return true;
  const t = (spec.type || "").toLowerCase();
  switch (classId as RvClassId) {
    case "class-a":
      return t.includes("class a");
    case "class-b":
      return t.includes("class b");
    case "class-c":
      return t.includes("class c") && !t.includes("super");
    case "super-c":
      return t.includes("super c");
    case "fifth-wheel":
      return t.includes("fifth");
    case "travel-trailer":
      return t.includes("travel trailer");
    case "toy-hauler":
      return t.includes("toy hauler");
    default:
      return true;
  }
}

export function rvClassLabel(classId: string): string {
  return RV_CLASS_TABS.find((t) => t.id === classId)?.label ?? "All";
}

export interface RVSelection {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  /** Class tab id (class-a, fifth-wheel, …) or legacy exact type string */
  rvType?: string;
}

export interface RVResult extends RVSelection {
  data: RVSpec;
  saved?: boolean;
  /** True when make/model/floorplan was typed manually (not in catalog) */
  custom?: boolean;
}

export function compareSelectionKey(r: Pick<RVResult, "year" | "make" | "model" | "floorplan">) {
  return `${r.year}|${r.make}|${r.model}|${r.floorplan || ""}`;
}

export type CascadeField = "year" | "make" | "model" | "floorplan" | "rvType";

export interface CascadeOptions {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  rvType: string;
  years: string[];
  makes: string[];
  models: string[];
  floorplans: string[];
  rvTypes: string[];
  locks: {
    make: string | null;
    model: string | null;
    floorplan: string | null;
  };
  counts: {
    makes: number;
    models: number;
    floorplans: number;
  };
  canSearch: boolean;
  /** Which fields are custom free-text (not in catalog lists) */
  custom: {
    make: boolean;
    model: boolean;
    floorplan: boolean;
  };
}

function isClassTabId(v: string | undefined): boolean {
  if (!v) return false;
  return RV_CLASS_TABS.some((t) => t.id === v && t.id !== "");
}

export function matchesTypeFilter(
  spec: RVSpec,
  filter: string | undefined,
): boolean {
  if (!filter) return true;
  if (isClassTabId(filter)) return matchesRvClass(spec, filter);
  return spec.type === filter;
}

/** Years listed in floorplansByYear (OEM lineup years), sorted ascending */
export function yearsFromFloorplansByYear(spec: RVSpec): number[] {
  const map = spec.floorplansByYear;
  if (!map) return [];
  return Object.keys(map)
    .map((y) => parseInt(y, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
}

/**
 * Is this model offered in `year`?
 *
 * Priority:
 * 1. Explicit floorplansByYear keys → year must be one of those keys
 * 2. Else yearStart / yearEnd window
 * 3. Else treat as available (catalog default window)
 */
export function modelAvailableInYear(spec: RVSpec, year: number): boolean {
  if (!Number.isFinite(year)) return true;

  const fbyYears = yearsFromFloorplansByYear(spec);
  if (fbyYears.length > 0) {
    // OEM year lineup is the source of truth when present
    if (!fbyYears.includes(year)) return false;
    // Still respect hard end/start if they exclude the year
    if (spec.yearStart != null && year < spec.yearStart) return false;
    if (spec.yearEnd != null && year > spec.yearEnd) return false;
    return true;
  }

  if (spec.yearStart != null && year < spec.yearStart) return false;
  if (spec.yearEnd != null && year > spec.yearEnd) return false;
  return true;
}

export function modelYearWindow(spec: RVSpec): { start: number; end: number } {
  const fbyYears = yearsFromFloorplansByYear(spec);
  if (fbyYears.length > 0) {
    return {
      start: spec.yearStart ?? fbyYears[0]!,
      end: spec.yearEnd ?? fbyYears[fbyYears.length - 1]!,
    };
  }
  return {
    start: spec.yearStart ?? 2002,
    end: spec.yearEnd ?? 2027,
  };
}

/**
 * Floorplan available for a year?
 * - floorplansByYear[year] → only those codes
 * - else full floorplans list when model is available that year
 */
export function floorplanAvailableInYear(
  spec: RVSpec,
  floorplan: string,
  year: number,
): boolean {
  if (!modelAvailableInYear(spec, year)) return false;
  const byYear = spec.floorplansByYear?.[String(year)];
  if (byYear?.length) return byYear.includes(floorplan);
  const fps = spec.floorplans ?? [];
  if (fps.length === 0) return false;
  return fps.includes(floorplan);
}

/**
 * Makes available for a model year.
 * No year selected → all catalog brands (optional type filter still applies).
 */
export function getMakesForYear(year: string, rvType?: string): string[] {
  const y = parseInt(year, 10);
  const hasYear = Boolean(year && Number.isFinite(y));

  return MAKES.filter((make) => {
    const models = RV_DATA[make];
    if (!models) return false;
    return Object.values(models).some((spec) => {
      if (!matchesTypeFilter(spec, rvType)) return false;
      if (!hasYear) return true;
      return modelAvailableInYear(spec, y);
    });
  });
}

/**
 * Models for year + make.
 * - year + make → models offered that year for that brand
 * - make only (no year) → all models for that brand
 * - neither → every model name across the catalog (sorted, unique by "Make · Model" not needed — just model keys per make when make empty = all model names could collide; return "Make · Model" pairs? Wizard always has make. Return all model names with duplicates from different makes as separate if we only have names.)
 *
 * When make is empty and year is set: all models across brands for that year (rare).
 * When both empty: all model names in catalog (flat list of model key strings; may not be unique globally — wizard requires make first).
 */
export function getModelsForYearMake(
  year: string,
  make: string,
  rvType?: string,
): string[] {
  const y = parseInt(year, 10);
  const hasYear = Boolean(year && Number.isFinite(y));
  const hasMake = Boolean(make && RV_DATA[make]);

  if (hasMake) {
    const models = RV_DATA[make]!;
    return Object.keys(models)
      .filter((model) => {
        const spec = models[model];
        if (!spec) return false;
        if (!matchesTypeFilter(spec, rvType)) return false;
        if (hasYear && !modelAvailableInYear(spec, y)) return false;
        return true;
      })
      .sort((a, b) => a.localeCompare(b));
  }

  // No make: all models for year (or entire catalog if no year)
  const names: string[] = [];
  const seen = new Set<string>();
  for (const mk of MAKES) {
    const map = RV_DATA[mk];
    if (!map) continue;
    for (const [model, spec] of Object.entries(map)) {
      if (!matchesTypeFilter(spec, rvType)) continue;
      if (hasYear && !modelAvailableInYear(spec, y)) continue;
      // Prefer unique model names; if collision, keep first (wizard uses make+model)
      if (seen.has(model)) continue;
      seen.add(model);
      names.push(model);
    }
  }
  return names.sort((a, b) => a.localeCompare(b));
}

/**
 * Floorplans for year + make + model.
 * - Full selection with floorplansByYear[year] → that list only
 * - Full selection without by-year map → full floorplans array if model available
 * - Missing year but model known → all floorplans for model
 * - Missing model → []
 */
export function getFloorplansForYear(
  year: string,
  make: string,
  model: string,
): string[] {
  const spec = RV_DATA[make]?.[model];
  if (!spec) return [];

  const y = parseInt(year, 10);
  const hasYear = Boolean(year && Number.isFinite(y));
  const all = [...(spec.floorplans ?? [])];

  if (!hasYear) {
    // No year prior → full floorplan list for this model
    return all;
  }

  if (!modelAvailableInYear(spec, y)) return [];

  // Explicit OEM year lineup when we have it — do NOT fall back to the full
  // multi-year floorplan dump (that was showing layouts from other years).
  const byYearMap = spec.floorplansByYear;
  if (byYearMap && Object.keys(byYearMap).length > 0) {
    const byYear = byYearMap[year] ?? byYearMap[String(y)];
    return byYear?.length ? [...byYear] : [];
  }

  return all;
}

export function getFloorplans(make: string, model: string): string[] {
  return RV_DATA[make]?.[model]?.floorplans ?? [];
}

export function getSpec(make: string, model: string): RVSpec | null {
  return RV_DATA[make]?.[model] ?? null;
}

/** Synthetic brochure card for user-entered coaches not in catalog */
export function buildCustomSpec(
  make: string,
  model: string,
  floorplan: string,
  rvType?: string,
): RVSpec {
  const typeLabel =
    (rvType && rvClassLabel(rvType) !== "All" ? rvClassLabel(rvType) : null) ||
    "Custom Entry";
  return {
    type: typeLabel === "Custom Entry" ? "RV (custom entry)" : typeLabel,
    floorplans: floorplan ? [floorplan] : ["Custom"],
    lengthRange: [20, 45],
    weightRange: [5000, 45000],
    slideouts: 0,
    sleeps: 4,
    msrpRange: [0, 0],
    chassis: "—",
    fuelType: "—",
    recalls: 0,
    rating: 4.0,
    image: RV_CARD_IMAGE,
    towingCapacity: 0,
    freshWater: 0,
    grayWater: 0,
    blackWater: 0,
    generator: "—",
    awningLength: 0,
    ceilingHeight: 0,
    founded: 0,
    warrantyYears: 0,
    yearStart: 2002,
    description: `Custom search entry for ${make}${model ? ` ${model}` : ""}${floorplan ? ` · floorplan ${floorplan}` : ""}. Not found in the local catalog — ask RvGrok for live specs, market value, and recalls.`,
  };
}

export function countModelsForClass(year: string, classId: RvClassId): number {
  if (!year) {
    let n = 0;
    for (const make of MAKES) {
      for (const spec of Object.values(RV_DATA[make] || {})) {
        if (matchesRvClass(spec, classId)) n++;
      }
    }
    return n;
  }
  const y = parseInt(year, 10);
  if (!Number.isFinite(y)) return 0;
  let n = 0;
  for (const make of MAKES) {
    for (const spec of Object.values(RV_DATA[make] || {})) {
      if (!modelAvailableInYear(spec, y)) continue;
      if (!matchesRvClass(spec, classId)) continue;
      n++;
    }
  }
  return n;
}

export function getRvTypesForFilters(year: string, make?: string): string[] {
  const y = parseInt(year, 10);
  const hasYear = Boolean(year && Number.isFinite(y));

  const types = new Set<string>();
  const makes =
    make && RV_DATA[make]
      ? [make]
      : hasYear
        ? getMakesForYear(year)
        : [...MAKES];

  for (const m of makes) {
    const map = RV_DATA[m];
    if (!map) continue;
    for (const spec of Object.values(map)) {
      if (hasYear && !modelAvailableInYear(spec, y)) continue;
      types.add(spec.type);
    }
  }
  return [...types].sort((a, b) => a.localeCompare(b));
}

/**
 * Cascade lists for the search wizard.
 *
 * Filtering rules:
 * - Makes: only brands with ≥1 model available in selected year (or all if no year)
 * - Models: only models for selected year + make (or all for make if no year; or all if neither)
 * - Floorplans: only plans for year + make + model (or all for model if no year)
 */
export function buildCascadeOptions(sel: {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  rvType?: string;
}): CascadeOptions {
  const year = (sel.year || "").trim();
  const rvType = sel.rvType ?? "";
  const years = [...YEARS];

  // --- Makes (filter by year when set) ---
  const makes = getMakesForYear(year, rvType || undefined);
  const makeCustom = Boolean(sel.make && !makes.includes(sel.make));
  // Keep custom free-text make; drop invalid catalog make for this year
  const make =
    sel.make && (makes.includes(sel.make) || makeCustom) ? sel.make : "";

  // --- Models (filter by year + make when both set) ---
  const models =
    make && !makeCustom
      ? getModelsForYearMake(year, make, rvType || undefined)
      : !make
        ? year
          ? getModelsForYearMake(year, "", rvType || undefined)
          : getModelsForYearMake("", "", rvType || undefined)
        : [];
  const modelCustom = Boolean(
    sel.model && (makeCustom || !models.includes(sel.model)),
  );
  const model =
    sel.model && (models.includes(sel.model) || modelCustom) ? sel.model : "";

  // --- Floorplans (filter by year + make + model) ---
  const floorplans =
    make && model && !makeCustom && !modelCustom
      ? getFloorplansForYear(year, make, model)
      : [];
  const floorplanCustom = Boolean(
    sel.floorplan &&
      (makeCustom || modelCustom || !floorplans.includes(sel.floorplan)),
  );
  const floorplan =
    sel.floorplan && (floorplans.includes(sel.floorplan) || floorplanCustom)
      ? sel.floorplan
      : "";

  const rvTypes =
    year && make && !makeCustom
      ? getRvTypesForFilters(year, make)
      : year
        ? getRvTypesForFilters(year)
        : getRvTypesForFilters("");

  const rvTypeValid =
    !rvType || isClassTabId(rvType) || rvTypes.includes(rvType);

  return {
    year,
    make,
    model,
    floorplan,
    rvType: rvTypeValid ? rvType : "",
    years,
    makes,
    models,
    floorplans,
    rvTypes,
    locks: {
      // Wizard unlocks freely; locks are hints for legacy UI
      make: null,
      model: year && !make ? "Select a manufacturer first" : null,
      floorplan: !model ? "Select a model first" : null,
    },
    counts: {
      makes: makes.length,
      models: models.length,
      floorplans: floorplans.length,
    },
    canSearch: Boolean(year && make && model),
    custom: {
      make: makeCustom,
      model: modelCustom,
      floorplan: floorplanCustom,
    },
  };
}

export function applyCascadeChange(
  current: {
    year: string;
    make: string;
    model: string;
    floorplan: string;
    rvType?: string;
  },
  field: CascadeField,
  value: string,
): {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  rvType: string;
} {
  const trimmed = value.trim();
  let next = {
    year: current.year,
    make: current.make,
    model: current.model,
    floorplan: current.floorplan,
    rvType: current.rvType ?? "",
  };

  switch (field) {
    case "year":
      // Changing year clears type → make → model → floorplan
      next = {
        year: trimmed,
        make: "",
        model: "",
        floorplan: "",
        rvType: "",
      };
      break;
    case "make":
      next = { ...next, make: trimmed, model: "", floorplan: "" };
      break;
    case "model":
      next = { ...next, model: trimmed, floorplan: "" };
      break;
    case "floorplan":
      next = { ...next, floorplan: trimmed };
      break;
    case "rvType":
      next = {
        ...next,
        rvType: trimmed,
        make: "",
        model: "",
        floorplan: "",
      };
      break;
  }

  // Re-validate downstream against filtered lists (drops invalid leftovers)
  const opts = buildCascadeOptions(next);
  return {
    year: opts.year,
    make: opts.make,
    model: opts.model,
    floorplan: opts.floorplan,
    rvType: opts.rvType,
  };
}

export function searchCatalog(sel: Partial<RVSelection>): RVResult[] {
  if (!sel.year || !sel.make) return [];
  const y = parseInt(sel.year, 10);
  if (!Number.isFinite(y)) return [];

  const make = sel.make;
  const map = RV_DATA[make];

  // Entirely custom make — one synthetic result
  if (!map) {
    return [
      {
        year: sel.year,
        make,
        model: sel.model || "Custom model",
        floorplan: sel.floorplan || "",
        rvType: sel.rvType,
        data: buildCustomSpec(
          make,
          sel.model || "Custom model",
          sel.floorplan || "",
          sel.rvType,
        ),
        custom: true,
      },
    ];
  }

  const out: RVResult[] = [];
  const modelNames = sel.model
    ? [sel.model]
    : getModelsForYearMake(sel.year, make, sel.rvType);

  for (const model of modelNames) {
    const data = map[model];
    if (!data) {
      // Custom model under a known make
      out.push({
        year: sel.year,
        make,
        model,
        floorplan: sel.floorplan || "",
        rvType: sel.rvType,
        data: buildCustomSpec(make, model, sel.floorplan || "", sel.rvType),
        custom: true,
      });
      continue;
    }
    if (!modelAvailableInYear(data, y)) continue;
    if (!matchesTypeFilter(data, sel.rvType)) continue;

    if (sel.floorplan) {
      const fps = getFloorplansForYear(sel.year, make, model);
      const inCatalog = fps.includes(sel.floorplan);
      if (!inCatalog) {
        // Custom floorplan on known model — still return the coach, tag custom
        out.push({
          year: sel.year,
          make,
          model,
          floorplan: sel.floorplan,
          rvType: data.type,
          data: {
            ...data,
            floorplans: [sel.floorplan, ...data.floorplans],
          },
          custom: true,
        });
        continue;
      }
      if (!floorplanAvailableInYear(data, sel.floorplan, y)) continue;
    }

    const fps = getFloorplansForYear(sel.year, make, model);
    out.push({
      year: sel.year,
      make,
      model,
      floorplan: sel.floorplan || fps[0] || data.floorplans[0] || "",
      rvType: data.type,
      data,
    });
  }

  // If model filter was set but nothing matched year/type, still surface custom
  if (out.length === 0 && sel.model) {
    out.push({
      year: sel.year,
      make,
      model: sel.model,
      floorplan: sel.floorplan || "",
      rvType: sel.rvType,
      data: buildCustomSpec(make, sel.model, sel.floorplan || "", sel.rvType),
      custom: true,
    });
  }

  return out.slice(0, 24);
}

export function countCatalogMatches(sel: Partial<RVSelection>): number {
  return searchCatalog(sel).length;
}

export type MarketEstimate = {
  tradeIn: number;
  retailLow: number;
  retailHigh: number;
  msrpLo: number;
  msrpHi: number;
  segment: string;
  ageYears: number;
};

export function estimateMarket(
  spec: RVSpec,
  year: string,
  floorplan?: string,
): MarketEstimate {
  const y = parseInt(year, 10) || new Date().getFullYear();
  const age = Math.max(0, new Date().getFullYear() - y);
  const [msrpLo0, msrpHi0] = spec.msrpRange || [80000, 200000];
  let msrpLo = msrpLo0;
  let msrpHi = msrpHi0;

  // Mild floorplan length bias when code encodes length
  if (floorplan) {
    const m = floorplan.match(/(\d{2})/);
    if (m) {
      const ft = parseInt(m[1]!, 10);
      if (ft >= 20 && ft <= 50) {
        const mid = (msrpLo + msrpHi) / 2;
        const bias = (ft - 32) * 1200;
        const half = (msrpHi - msrpLo) / 2;
        msrpLo = Math.max(20000, Math.round(mid + bias - half));
        msrpHi = Math.round(mid + bias + half);
      }
    }
  }

  if (!msrpLo && !msrpHi) {
    return {
      tradeIn: 0,
      retailLow: 0,
      retailHigh: 0,
      msrpLo: 0,
      msrpHi: 0,
      segment: spec.type || "RV",
      ageYears: age,
    };
  }

  const mid = (msrpLo + msrpHi) / 2;
  const retain = Math.max(0.38, 0.92 - age * 0.045);
  const retailHigh = Math.round((msrpHi * retain) / 1000) * 1000;
  const retailLow = Math.round((msrpLo * retain * 0.88) / 1000) * 1000;
  const tradeIn = Math.round((mid * retain * 0.78) / 1000) * 1000;

  const segment =
    /diesel/i.test(spec.fuelType) || /diesel/i.test(spec.type)
      ? "Diesel motorhome"
      : /fifth/i.test(spec.type)
        ? "Fifth wheel"
        : /trailer/i.test(spec.type)
          ? "Travel trailer"
          : /class b/i.test(spec.type)
            ? "Class B"
            : "Motorhome";

  return {
    tradeIn,
    retailLow: Math.min(retailLow, retailHigh),
    retailHigh: Math.max(retailLow, retailHigh),
    msrpLo,
    msrpHi,
    segment,
    ageYears: age,
  };
}

export function formatMoney(n: number) {
  if (!n) return "—";
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function ratingFor(make: string, model: string, year: string): number {
  return computeRating(make, model, year);
}

export function modelPickerMeta(
  make: string,
  model: string,
  year: string,
): string {
  const spec = getSpec(make, model);
  if (!spec) return "Custom entry";
  const { start, end } = modelYearWindow(spec);
  const fps = year ? getFloorplansForYear(year, make, model) : getFloorplans(make, model);
  const endLabel =
    end >= 2026 && !spec.yearEnd ? "present" : String(end);
  return `${spec.type} · ${start}–${endLabel} · ${fps.length} FP`;
}

export function getMakesForYearCount(year: string): number {
  return getMakesForYear(year).length;
}
