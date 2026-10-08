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

/**
 * Facts Type-first cascade labels. Map onto catalog class ids only —
 * Class A is any Class A (`class-a`); Class A Diesel is diesel-only.
 * No All / Class A Gas on this step. Type is an optional filter —
 * empty Type means type-agnostic Year → Make → Model → Floorplan lists.
 */
export const FACTS_TYPE_OPTIONS = [
  { id: "class-a", label: "Class A" },
  { id: "class-a-diesel", label: "Class A Diesel" },
  { id: "class-b", label: "Class B" },
  { id: "class-c", label: "Class C" },
  { id: "super-c", label: "Super C" },
  { id: "fifth-wheel", label: "Fifth Wheel" },
  { id: "travel-trailer", label: "Travel Trailer" },
  { id: "toy-hauler", label: "Toy Hauler" },
] as const;

export type FactsTypeId = (typeof FACTS_TYPE_OPTIONS)[number]["id"];

export function factsTypeLabel(classId: string | undefined | null): string {
  if (!classId) return "";
  return FACTS_TYPE_OPTIONS.find((t) => t.id === classId)?.label ?? "";
}

export function isFactsTypeId(v: string | undefined | null): v is FactsTypeId {
  return Boolean(v && FACTS_TYPE_OPTIONS.some((t) => t.id === v));
}

/**
 * Year is always unlocked. Type is an optional narrow, not a gate.
 * Empty Type still shows type-agnostic Year → Make → Model → Floorplan.
 */
export function revealFactsYear(_sel?: { rvType?: string | null }): boolean {
  return true;
}

/**
 * Model follows the cascade, not a Search click.
 * Year + Make (or an already-chosen model/floorplan) is enough.
 * Floorplan stays hidden until Model is selected.
 */
export function revealFactsModel(sel: {
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

/**
 * Floorplan is its own step. Model (or a restored floorplan) unlocks it.
 * Year + Make alone must not reveal Floorplan — that collapsed the cascade.
 */
export function revealFactsFloorplan(sel: {
  model?: string | null;
  floorplan?: string | null;
}): boolean {
  return Boolean(sel.model?.trim() || sel.floorplan?.trim());
}

/**
 * Search is always on the empty RV Search landing (Type / Year / Make).
 * Clickable only when year + make can actually search. Type is not a gate.
 */
export function factsSearchEnabled(sel: {
  year?: string | null;
  make?: string | null;
}): boolean {
  return Boolean(sel.year?.trim() && sel.make?.trim());
}

/**
 * Auto-fetch / auto-open fires on Floorplan, never on Model alone.
 * Concrete floorplan → search (single-hit opens the report).
 * Explicit "Any floorplan" (empty value + field === "floorplan") → fetch the
 * list; Search stays the year+make override. Single-hit honesty still applies.
 */
export function shouldCascadeAutoSearch(
  sel: {
    year?: string | null;
    make?: string | null;
    model?: string | null;
    floorplan?: string | null;
  },
  field?: string | null,
): boolean {
  const year = sel.year?.trim();
  const make = sel.make?.trim();
  const model = sel.model?.trim();
  if (!year || !make || !model) return false;
  if (sel.floorplan?.trim()) return true;
  return field === "floorplan";
}

/**
 * Concrete floorplan = a real trim string after trim.
 * Year + make + model alone is not enough. The picker sentinel for
 * "Any floorplan" is an empty value — also reject that label if it
 * ever lands in the field.
 */
export function hasConcreteFloorplan(floorplan?: string | null): boolean {
  const fp = String(floorplan ?? "").trim();
  if (!fp) return false;
  if (/^any(\s+floorplan)?$/i.test(fp)) return false;
  return true;
}

/** Concrete code or "" — never keep "Any" / "Any floorplan" in coach state. */
export function concreteFloorplanOrEmpty(floorplan?: string | null): string {
  const fp = String(floorplan ?? "").trim();
  return hasConcreteFloorplan(fp) ? fp : "";
}

/**
 * Catalog search fills `fps[0]` when the picker is Any. Facts must not
 * treat that as a chosen floorplan — specs / header stay model-only.
 * The picker value wins. Result / catalog floorplan is never promoted
 * when the picker is empty / "Any".
 */
export function resultForFactsPicker<T extends { floorplan?: string | null }>(
  result: T,
  pickerFloorplan?: string | null,
): T {
  if (!hasConcreteFloorplan(pickerFloorplan)) {
    return { ...result, floorplan: "" };
  }
  return { ...result, floorplan: String(pickerFloorplan).trim() };
}

/**
 * Open-report handoff: picker floorplan, not the catalog row's.
 * Single-hit Any still arrives as `r.floorplan === "45A"` (fps[0]).
 * `cascadeFromResult(r)` would keep that — this strips it first.
 */
export function prepareFactsOpen<T extends ResultLike>(
  result: T,
  pickerFloorplan?: string | null,
): { sel: FactsCascadeSel; unit: T } {
  const unit = resultForFactsPicker(result, pickerFloorplan);
  return { sel: cascadeFromResult(unit), unit };
}

export function cascadeFromResult(r: ResultLike): FactsCascadeSel {
  return {
    year: String(r.year ?? "").trim(),
    make: String(r.make ?? "").trim(),
    model: String(r.model ?? "").trim(),
    floorplan: concreteFloorplanOrEmpty(r.floorplan),
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
      floorplan: concreteFloorplanOrEmpty(sel.floorplan),
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

/** Catalog lists the Lot → Facts seed is matched against (injected for tests). */
export type FactsSeedLookups = {
  makes: (year: string) => string[];
  models: (year: string, make: string) => string[];
  floorplans: (year: string, make: string, model: string) => string[];
};

function seedKey(value: string | null | undefined): string {
  return String(value ?? "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Letters and digits only. "31 FK" and "31FK" are the same code; "40PDQ" is not "40P". */
function compactKey(value: string | null | undefined): string {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

const MAKE_DROP = new Set(["rv", "coach", "motor", "motorhomes", "industries"]);

/** Drop dealer suffixes and punctuation. "Thor Motor Coach" and "Thor" both become "thor". */
function normMakeKey(value: string | null | undefined): string {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((token) => token && !MAKE_DROP.has(token))
    .join(" ");
}

/** Ignore spaces and punctuation. "Cougar Half-Ton" and "Cougar Half Ton" match. */
function normModelKey(value: string | null | undefined): string {
  return compactKey(value);
}

/** One catalog row, or "" when the key is empty or hits more than one row. */
function uniqueBy(
  list: string[],
  keyOf: (item: string) => string,
  want: string,
): string {
  if (!want) return "";
  const hits = list.filter((item) => keyOf(item) === want);
  return hits.length === 1 ? hits[0]! : "";
}

/**
 * Floorplan code for a lot trim.
 * Exact (case/space), then the same code with punctuation removed,
 * then `trim + "-" + model` (210 + Popular → 210-Popular),
 * then the trim's first word when that word is a numbered code (2401W MBS → 2401W).
 * A name prefix is not a code: View Profile does not become View, and 40PDQ does not become 40P.
 * Two different catalog rows → no floorplan.
 */
function pickSeedFloorplan(
  floorplans: string[],
  trim: string | null | undefined,
  model: string | null | undefined,
): string {
  const raw = String(trim ?? "").trim();
  if (!raw || !floorplans.length) return "";
  const hits = new Set<string>();
  const exact = uniqueBy(floorplans, seedKey, seedKey(raw));
  if (exact) hits.add(exact);
  const compact = uniqueBy(floorplans, compactKey, compactKey(raw));
  if (compact) hits.add(compact);
  const joined = compactKey(`${raw}-${model ?? ""}`);
  const joinHit = uniqueBy(floorplans, compactKey, joined);
  if (joinHit) hits.add(joinHit);
  const word = raw.split(/\s+/)[0] ?? "";
  if (/\d/.test(word) && seedKey(word) !== seedKey(raw)) {
    const wordHit = uniqueBy(floorplans, seedKey, seedKey(word));
    if (wordHit) hits.add(wordHit);
  }
  return hits.size === 1 ? [...hits][0]! : "";
}

/**
 * Lot “Check RV Facts” → Facts.
 * Make drops RV / Coach / Motor / Motorhomes / Industries and punctuation.
 * Model ignores punctuation and spaces. Floorplan accepts the trim, the
 * trim with spaces/punctuation removed, `trim-model`, or the trim's first
 * numbered word. Every step requires one catalog row — a prefix or a tie
 * does not open a report. `open` is true only when all four resolve;
 * otherwise the picker pre-fills what did resolve.
 */
export function resolveFactsUnitSeed(
  seed: ResultLike,
  look: FactsSeedLookups,
): { sel: FactsCascadeSel; open: boolean } {
  const rawYear = String(seed.year ?? "").trim();
  const year = /^\d{4}$/.test(rawYear) ? rawYear : "";
  const makes = year ? look.makes(year) : [];
  const make = uniqueBy(makes, normMakeKey, normMakeKey(seed.make));
  const models = make ? look.models(year, make) : [];
  const model = uniqueBy(models, normModelKey, normModelKey(seed.model));
  const floorplan = model
    ? concreteFloorplanOrEmpty(
        pickSeedFloorplan(look.floorplans(year, make, model), seed.floorplan, model),
      )
    : "";
  return {
    sel: { year, make, model, floorplan },
    open: Boolean(year && make && model && floorplan),
  };
}
