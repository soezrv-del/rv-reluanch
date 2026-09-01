/**
 * Catalog rows are not all brochure-locked. Some year-bands say
 * "by option" / "typical" / "L9 or X15". Those must display as EST /
 * unknown — never as a single invented HP.
 *
 * Primary example: 2023 American Coach American Dream
 * (Cummins L9 450 std / X15 605 opt — no floorplan-specific OEM pin).
 */

const AMBIGUOUS_RE =
  /\b(opt(?:ional)?|std|standard|by option|by year|by plan|by build|by chassis|typical|varies|confirm)\b/i;

const OPTION_SLASH_RE = /\/\s*(x15|x12|l9|isl|isx|\d{2,4})/i;

const L9_AND_X15_RE = /\b(l9|isl)\b[\s\S]{0,48}\b(x15|x12)\b/i;

/** HP-class numbers mentioned next to HP / std / opt / engine family. */
export function extractOptionHpClasses(
  engine: string | null | undefined,
): number[] {
  const e = (engine || "").trim();
  if (!e) return [];
  const found = new Set<number>();
  const take = (n: number) => {
    if (n >= 150 && n <= 800) found.add(n);
  };
  for (const m of e.matchAll(/(\d{2,4})\s*HP\b/gi)) {
    take(parseInt(m[1]!, 10));
  }
  for (const m of e.matchAll(/(\d{2,4})\s*(?:std|opt|standard|optional)\b/gi)) {
    take(parseInt(m[1]!, 10));
  }
  for (const m of e.matchAll(/(?:L9|X15|X12|ISL|ISB|ISX|B6\.7)\s*(\d{2,4})/gi)) {
    take(parseInt(m[1]!, 10));
  }
  return [...found].sort((a, b) => a - b);
}

export function isAmbiguousCatalogValue(
  text: string | number | null | undefined,
): boolean {
  if (text == null || text === "") return false;
  const s = String(text);
  if (AMBIGUOUS_RE.test(s)) return true;
  if (OPTION_SLASH_RE.test(s)) return true;
  if (L9_AND_X15_RE.test(s)) return true;
  if (extractOptionHpClasses(s).length >= 2) return true;
  return false;
}

/** True when a catalog HP number must not be spoken as the only factory rating. */
export function horsepowerIsOptionBand(
  engine: string | null | undefined,
  horsepower?: string | number | null,
): boolean {
  if (extractOptionHpClasses(engine).length >= 2) return true;
  return (
    isAmbiguousCatalogValue(engine) || isAmbiguousCatalogValue(horsepower)
  );
}

export function honestHorsepowerLabel(opts: {
  engine?: string | null;
  horsepower?: string | number | null;
}): string | null {
  const engine = (opts.engine || "").trim();
  const classes = extractOptionHpClasses(engine);
  if (horsepowerIsOptionBand(engine, opts.horsepower) || classes.length >= 2) {
    if (
      (/450/.test(engine) && /605/.test(engine)) ||
      (classes.includes(450) && classes.includes(605))
    ) {
      return "450 std / 605 opt";
    }
    if (classes.length >= 2) {
      return `Varies (${classes.join("–")} HP by option) — confirm door sticker`;
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
  if (/^450\s*HP$/i.test(s) && horsepowerIsOptionBand(engine, s)) {
    return "HP varies / confirm brochure — do not invent a single number";
  }
  return /\bhp\b/i.test(s) ? s : `${s} HP`;
}

/**
 * Dual-option diesel (L9 std / X15 opt) must not show L9-only torque.
 * Lone numeric torque is ignored when the engine string is an option band.
 */
export function honestTorqueLabel(opts: {
  engine?: string | null;
  torqueLbFt?: string | number | null;
}): string | null {
  const engine = (opts.engine || "").trim();
  if (horsepowerIsOptionBand(engine, null) || extractOptionHpClasses(engine).length >= 2) {
    if (/l9/i.test(engine) && /x15/i.test(engine)) {
      return "1,250 lb-ft L9 std / 1,850–1,950 lb-ft X15 opt — confirm door sticker";
    }
    return "Torque varies by option — confirm door sticker";
  }
  if (opts.torqueLbFt == null || opts.torqueLbFt === "") return null;
  if (typeof opts.torqueLbFt === "number") {
    return opts.torqueLbFt > 0
      ? `${opts.torqueLbFt.toLocaleString()} lb-ft`
      : null;
  }
  const s = String(opts.torqueLbFt).trim();
  if (!s || s === "—") return null;
  return /lb-?ft/i.test(s) ? s : `${s} lb-ft`;
}

/**
 * Brochure / Facts HP line.
 * Option-band engine text (std/opt, L9 + X15, 450 and 605) always wins
 * over a single catalog/pin number — never return lone "450 HP" when
 * the engine lists more than one rating.
 */
export function parseHp(engine?: string, hp?: number): string {
  const eng = (engine || "").trim();
  const classes = extractOptionHpClasses(eng);
  const optionBand = horsepowerIsOptionBand(eng, hp) || classes.length >= 2;

  if (optionBand) {
    const honest = honestHorsepowerLabel({ engine: eng, horsepower: hp });
    if (honest && !/^450\s*HP$/i.test(honest.trim())) return honest;
    if (classes.length >= 2) {
      return `Varies (${classes.join("–")} HP by option) — confirm door sticker`;
    }
    return "Varies by option / year — confirm brochure";
  }

  if (hp != null && Number.isFinite(hp) && hp > 0) {
    return `${Math.round(hp)} HP`;
  }
  if (!eng) {
    return "Varies by option / year — confirm brochure";
  }

  const hpMentions = [...eng.matchAll(/(\d{2,4})\s*HP/gi)].map((m) => m[1]!);
  const looksMulti =
    /[·|]/.test(eng) ||
    /\bor\b/i.test(eng) ||
    /by (year|option|chassis|floorplan)/i.test(eng) ||
    hpMentions.length >= 2;

  if (looksMulti && hpMentions.length >= 2) {
    const unique = [...new Set(hpMentions)];
    return `Varies (${unique.join("–")} HP by option) — confirm door sticker`;
  }
  if (looksMulti && hpMentions.length === 0) {
    return "Varies by option / year — confirm brochure";
  }

  const range = eng.match(/(\d{2,4})\s*[–—\-to]+\s*(\d{2,4})\s*HP/i);
  if (range) {
    return `${range[1]}–${range[2]} HP (by option)`;
  }

  const m = eng.match(/(\d{2,4})\s*HP/i);
  if (m) return `${m[1]} HP`;

  if (/V10|Triton/i.test(eng)) return "305–362 HP (by year) — confirm brochure";
  if (/7\.3L|Godzilla/i.test(eng))
    return "335–350 HP (by application) — confirm brochure";
  if (/EcoBoost/i.test(eng)) return "Varies by option / year — confirm brochure";

  if (/Cummins|Power Stroke|Duramax|ISB|B6\.7|L9|ISL|X15|X12|Cat /i.test(eng)) {
    return "Varies by option / year — confirm brochure";
  }

  return "Varies by option / year — confirm brochure";
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
