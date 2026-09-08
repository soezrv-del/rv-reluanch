import {
  matchCatalogModelName,
  parseCoachFromText,
} from "../rvgrok/parseCoach.ts";
import { CATALOG_INDEX } from "./rvCatalogIndex.ts";

/**
 * Facts picker ↔ report handoff.
 *
 * Opening a unit (saved list, result card, or single-hit Open report) must
 * restore year / make / model / floorplan so Back keeps the cascade.
 * Dock tap / chip “change” bump `factsPickerToken` → clean catalog search
 * (resetFax). While a report is open the picker must not publish a null
 * Active Coach — that race cleared the chip mid-report.
 *
 * Cross-feature prefill is button-only: Ask Grok, Check tow, Check payment.
 * Facts never hands off to GPS / Trips.
 */

export type FactsCascadeSel = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  rvType?: string;
};

export type ResultLike = {
  year?: string | null;
  make?: string | null;
  model?: string | null;
  floorplan?: string | null;
  rvType?: string | null;
  custom?: boolean;
};

/** First-run example chips — exact labels; each tap runs catalog search. */
export const FACTS_EXAMPLE_CHIPS = [
  "2023 Entegra Cornerstone",
  "Newmar Dutch Star",
  "Tiffin Allegro Bus",
] as const;

/**
 * Model / Trim fields follow the cascade, not a Search click.
 * Year + Make (or an already-chosen model/trim) is enough.
 */
export function revealFactsModelTrim(sel: {
  year?: string | null;
  make?: string | null;
  model?: string | null;
  floorplan?: string | null;
}): boolean {
  return Boolean(
    (sel.year?.trim() && sel.make?.trim()) ||
      sel.model?.trim() ||
      sel.floorplan?.trim(),
  );
}

/** Example chips stay a first-run shortcut — hide once year + make are set. */
export function showFactsExampleChips(sel: {
  year?: string | null;
  make?: string | null;
  model?: string | null;
  floorplan?: string | null;
}): boolean {
  return !revealFactsModelTrim(sel);
}

/**
 * Cascade picks that can fetch results without the Search button.
 * Year / Make still load option lists via ensureCatalogLoaded.
 */
export function shouldCascadeAutoSearch(sel: {
  year?: string | null;
  make?: string | null;
  model?: string | null;
}): boolean {
  return Boolean(sel.year?.trim() && sel.make?.trim() && sel.model?.trim());
}

/** "Entegra" → catalog "Entegra Coach". Exact match wins; no invent. */
export function matchCatalogMake(
  parsed: string,
  makes: readonly string[],
): string {
  const n = parsed.trim().toLowerCase();
  if (!n) return "";
  const exact = makes.find((m) => m.toLowerCase() === n);
  if (exact) return exact;
  const prefixed = makes.filter((m) => m.toLowerCase().startsWith(`${n} `));
  if (prefixed.length === 1) return prefixed[0]!;
  return parsed.trim();
}

export function parseExampleChip(label: string): FactsCascadeSel {
  const parsed = parseCoachFromText(label);
  return {
    year: parsed.year,
    make: parsed.make,
    model: parsed.model,
    floorplan: parsed.floorplan,
  };
}

/**
 * Resolve a first-run chip onto the year → make → model cascade.
 * Missing year uses the newest catalog year already listed for that model.
 */
export function selFromExampleChip(label: string): FactsCascadeSel {
  const parsed = parseExampleChip(label);
  const makes = Object.keys(CATALOG_INDEX);
  const make = matchCatalogMake(parsed.make, makes);
  const models = make ? Object.keys(CATALOG_INDEX[make] ?? {}) : [];
  const y = parseInt(parsed.year, 10);
  const inYear =
    parsed.year && Number.isFinite(y)
      ? models.filter((m) => {
          const years = CATALOG_INDEX[make]?.[m]?.years;
          return !years?.length || years.includes(y);
        })
      : models;
  const model = parsed.model
    ? matchCatalogModelName(
        parsed.model,
        inYear.length ? inYear : models.length ? models : [parsed.model],
      )
    : "";
  let year = parsed.year;
  if (!year && make && model) {
    const listed = [...(CATALOG_INDEX[make]?.[model]?.years ?? [])].sort(
      (a, b) => b - a,
    );
    year = listed[0] != null ? String(listed[0]) : "";
  }
  return {
    year,
    make,
    model,
    floorplan: parsed.floorplan,
  };
}

export function cascadeFromResult(r: ResultLike): FactsCascadeSel {
  return {
    year: String(r.year ?? "").trim(),
    make: String(r.make ?? "").trim(),
    model: String(r.model ?? "").trim(),
    floorplan: String(r.floorplan ?? "").trim(),
    // Only a wizard class-tab id belongs here. Catalog type strings
    // ("Class A Diesel") are not picker filters — omit so applySel
    // leaves the current type chip alone.
    ...(r.rvType &&
    /^(class-a|class-a-diesel|class-a-gas|class-b|class-c|super-c|fifth-wheel|travel-trailer|toy-hauler)$/.test(
      r.rvType,
    )
      ? { rvType: r.rvType }
      : {}),
  };
}

/** Exact single catalog hit → open the report immediately. */
export function shouldOpenSingleHitReport(
  found: Array<{ custom?: boolean }>,
): boolean {
  return found.length === 1 && !found[0]!.custom;
}

/**
 * What the picker should write to Active Coach.
 * `undefined` = do not write (report owns the chip).
 */
export function pickerCoachWrite(
  sel: FactsCascadeSel,
  opts: { reportOpen: boolean },
): FactsCascadeSel | null | undefined {
  if (opts.reportOpen) return undefined;
  if (sel.year && sel.make && sel.model) {
    return {
      year: sel.year,
      make: sel.make,
      model: sel.model,
      floorplan: sel.floorplan,
      rvType: sel.rvType,
    };
  }
  return null;
}

/**
 * Which coach Share should open. Prefer the report already on screen,
 * then Active Coach, then the first saved unit. No catalog invent.
 */
export function resolveShareOpenSel(opts: {
  detail: ResultLike | null;
  active: ResultLike | null;
  saved: ResultLike[];
}): FactsCascadeSel | null {
  const pick = opts.detail ?? opts.active ?? opts.saved[0] ?? null;
  if (!pick?.year || !pick.make || !pick.model) return null;
  return cascadeFromResult(pick);
}
