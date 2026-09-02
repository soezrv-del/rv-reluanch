/**
 * Facts picker ↔ report handoff.
 *
 * Opening a unit (saved list, result card, or single-hit Open report) must
 * restore year / make / model / floorplan so Back and chip “change” keep
 * the cascade. While a report is open the picker must not publish a null
 * Active Coach — that race cleared the chip mid-report.
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
