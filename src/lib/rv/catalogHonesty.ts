/**
 * Catalog rows are not all brochure-locked. Some year-bands say
 * "by option" / "typical" / "L9 or X15". Those must display as EST /
 * unknown — never as a single invented HP.
 *
 * Primary example: 2023 American Coach American Dream
 * (Cummins L9 450 std / X15 605 opt — no floorplan-specific OEM pin).
 */

const AMBIGUOUS_RE =
  /\b(opt(?:ional)?|by option|by year|by plan|by build|by chassis|typical|varies|confirm|or |\/|std\s*\/)\b/i;

export function isAmbiguousCatalogValue(
  text: string | number | null | undefined,
): boolean {
  if (text == null || text === "") return false;
  return AMBIGUOUS_RE.test(String(text));
}

/** True when a catalog HP number must not be spoken as the only factory rating. */
export function horsepowerIsOptionBand(
  engine: string | null | undefined,
  horsepower?: string | number | null,
): boolean {
  return (
    isAmbiguousCatalogValue(engine) || isAmbiguousCatalogValue(horsepower)
  );
}

export function honestHorsepowerLabel(opts: {
  engine?: string | null;
  horsepower?: string | number | null;
}): string | null {
  const engine = (opts.engine || "").trim();
  if (horsepowerIsOptionBand(engine, opts.horsepower)) {
    if (/450/.test(engine) && /605/.test(engine)) {
      return "450 HP std / 605 HP opt — EST, confirm door sticker";
    }
    if (/360/.test(engine) && /450/.test(engine)) {
      return "HP varies by option — EST, confirm brochure";
    }
    return "HP varies / confirm brochure — do not invent a single number";
  }
  if (opts.horsepower == null || opts.horsepower === "") return null;
  if (typeof opts.horsepower === "number") {
    return opts.horsepower > 0 ? `${Math.round(opts.horsepower)} HP` : null;
  }
  const s = String(opts.horsepower).trim();
  if (!s || s === "—") return null;
  return /\bhp\b/i.test(s) ? s : `${s} HP`;
}

export function honestEngineLabel(engine: string | null | undefined): {
  text: string | null;
  locked: boolean;
} {
  const e = (engine || "").trim();
  if (!e || e === "—") return { text: null, locked: false };
  if (isAmbiguousCatalogValue(e)) {
    return { text: `${e} (EST — confirm build sheet)`, locked: false };
  }
  return { text: e, locked: true };
}
