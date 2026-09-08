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
 * No All / Class A Gas on this step. Type is required to enter the cascade.
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
 * Year unlocks after Type. Cascade path cannot skip Type.
 */
export function revealFactsYear(sel: { rvType?: string | null }): boolean {
  return Boolean(sel.rvType?.trim());
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
