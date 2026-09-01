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

export type CoachClassKind =
  | "class-a"
  | "class-c"
  | "super-c"
  | "class-b"
  | "towable"
  | "other";

export function coachClassKind(type?: string | null): CoachClassKind {
  const t = (type || "").toLowerCase();
  if (/travel trailer|fifth|toy hauler|truck camper|towable/.test(t))
    return "towable";
  if (/super\s*c/.test(t)) return "super-c";
  if (/class\s*c/.test(t)) return "class-c";
  if (/class\s*b/.test(t)) return "class-b";
  if (/class\s*a/.test(t)) return "class-a";
  return "other";
}

export function isCutawayChassis(chassis?: string | null): boolean {
  return /E-?350|E-?450|Econoline|cutaway/i.test(chassis || "");
}

export function isGasCoach(opts: {
  fuelType?: string | null;
  engine?: string | null;
  chassis?: string | null;
}): boolean {
  const blob = `${opts.fuelType || ""} ${opts.engine || ""} ${opts.chassis || ""}`;
  if (/diesel/i.test(opts.fuelType || "")) return false;
  if (/diesel|cummins|power stroke|duramax|sprinter/i.test(blob) && !/gas/i.test(opts.fuelType || ""))
    return false;
  return /gas|gasoline|godzilla|triton|f53|f-53|e-?450|e-?350/i.test(blob);
}

export function isDieselCoach(opts: {
  fuelType?: string | null;
  engine?: string | null;
}): boolean {
  const fuel = opts.fuelType || "";
  const engine = opts.engine || "";
  if (/diesel/i.test(fuel)) return true;
  if (/gas/i.test(fuel) && !/diesel/i.test(fuel)) return false;
  return /diesel|cummins|isl|isb|l9|x15|power stroke|duramax/i.test(engine);
}

const BUS_TIRE_RE = /22\.5|275\/70|255\/70|235\/80R22/;

/**
 * Brochure pin wins. Otherwise type-aware typicals — never a hash pick
 * of Class A / bus rubber for a cutaway Class C.
 */
export function honestTireSize(opts: {
  oem?: string | null;
  type?: string | null;
  chassis?: string | null;
}): string {
  const oem = (opts.oem || "").trim();
  if (oem && oem !== "—") {
    const kind = coachClassKind(opts.type);
    if (
      (kind === "class-c" || isCutawayChassis(opts.chassis)) &&
      BUS_TIRE_RE.test(oem)
    ) {
      return "LT225/75R16E (typ. Class C cutaway — confirm door sticker)";
    }
    return oem;
  }
  const kind = coachClassKind(opts.type);
  if (kind === "class-c" || isCutawayChassis(opts.chassis)) {
    return "LT225/75R16E (typ. Class C cutaway — confirm door sticker)";
  }
  if (kind === "class-b") {
    return "Confirm brochure (van chassis tire)";
  }
  if (kind === "super-c") {
    return "Confirm brochure (Super C / truck tire)";
  }
  if (kind === "class-a") {
    return "22.5 commercial (typ. Class A — confirm door sticker)";
  }
  if (kind === "towable") {
    return "ST235/80R16 (typ. towable — confirm door sticker)";
  }
  return "Confirm brochure";
}

/**
 * Never invent 3×15k on a ~26' Class C. Class-typical only when no OEM pin.
 */
export function honestAcUnits(opts: {
  oem?: string | null;
  type?: string | null;
  lengthFt?: number | null;
}): string {
  const oem = (opts.oem || "").trim();
  const kind = coachClassKind(opts.type);
  const len = opts.lengthFt && opts.lengthFt > 0 ? opts.lengthFt : 0;
  if (oem && oem !== "—") {
    if ((kind === "class-c" || kind === "class-b") && /3\s*[×x]/i.test(oem)) {
      return len > 0 && len <= 24
        ? "1 × 13,500 BTU (typ. — confirm brochure)"
        : "1 × 15,000 BTU (typ. — confirm brochure)";
    }
    return oem;
  }
  if (kind === "class-c" || kind === "class-b") {
    if (len > 0 && len <= 24) return "1 × 13,500 BTU (typ. — confirm brochure)";
    return "1 × 15,000 BTU (typ. — confirm brochure)";
  }
  if (kind === "super-c" || kind === "class-a") {
    return "2 × 15,000 BTU (typ. — confirm brochure)";
  }
  return "Confirm brochure";
}

/**
 * Gas chassis must not show diesel gens as a hard fact (and vice versa).
 * "Onan Diesel / Gas" is a catalog dump — rewrite to a type-honest typical.
 */
export function honestGenerator(opts: {
  generator?: string | null;
  fuelType?: string | null;
  chassis?: string | null;
  engine?: string | null;
  type?: string | null;
}): string {
  const raw = (opts.generator || "").trim();
  const gas = isGasCoach(opts);
  const diesel = isDieselCoach(opts);
  const mixedLabel = /diesel\s*\/\s*gas|gas\s*\/\s*diesel/i.test(raw);
  const kind = coachClassKind(opts.type);

  const gasTypical =
    kind === "class-c"
      ? "Onan 4.0 kW gas (typ. — confirm options)"
      : "Onan gas (typ. — confirm kW / options)";
  const dieselTypical = "Onan diesel (typ. — confirm kW)";

  if (!raw || raw === "—" || /^see options$/i.test(raw)) {
    if (gas && !diesel) return gasTypical;
    if (diesel && !gas) return dieselTypical;
    return "Confirm brochure";
  }

  if (mixedLabel) {
    if (gas && !diesel) return gasTypical;
    if (diesel && !gas) return dieselTypical;
    return "Onan — confirm fuel and kW on brochure";
  }

  if (gas && !diesel && /diesel/i.test(raw) && !/gas/i.test(raw)) {
    return gasTypical;
  }
  if (diesel && !gas && /gas/i.test(raw) && !/diesel/i.test(raw)) {
    return dieselTypical;
  }
  return raw;
}

/**
 * Do not present F53 468 lb-ft (or a lone catalog number) as certified
 * when the chassis is an E-450 cutaway / Class C.
 */
export function honestTorqueForCoach(opts: {
  engine?: string | null;
  chassis?: string | null;
  type?: string | null;
  torqueLbFt?: number | null;
  diesel?: boolean;
  horsepower?: number | null;
}): string {
  const engine = (opts.engine || "").trim();
  const cutaway =
    isCutawayChassis(opts.chassis) || coachClassKind(opts.type) === "class-c";
  const option = honestTorqueLabel({
    engine,
    torqueLbFt: opts.torqueLbFt,
  });
  if (option && horsepowerIsOptionBand(engine, null)) return option;

  if (/godzilla|7\.3/i.test(engine)) {
    if (cutaway) {
      return "450 lb-ft (typ. E-450 7.3 — confirm door sticker)";
    }
    return "468 lb-ft (typ. F53 7.3 — confirm door sticker)";
  }
  if (/v10|triton/i.test(engine)) {
    return "420–460 lb-ft (typ. V10 — confirm year)";
  }
  if (opts.torqueLbFt && opts.torqueLbFt > 0 && !cutaway) {
    return `${opts.torqueLbFt.toLocaleString()} lb-ft`;
  }
  if (opts.torqueLbFt && opts.torqueLbFt > 0 && cutaway && opts.torqueLbFt >= 468) {
    return "450 lb-ft (typ. E-450 — confirm door sticker)";
  }
  if (opts.torqueLbFt && opts.torqueLbFt > 0) {
    return `${opts.torqueLbFt.toLocaleString()} lb-ft (typ. — confirm door sticker)`;
  }
  return option || "Varies by option / year — confirm brochure";
}

export function honestHorsepowerForCoach(opts: {
  engine?: string | null;
  horsepower?: string | number | null;
  chassis?: string | null;
  type?: string | null;
}): string {
  const engine = (opts.engine || "").trim();
  const parsed = parseHp(
    engine,
    typeof opts.horsepower === "number" ? opts.horsepower : undefined,
  );
  const cutaway =
    isCutawayChassis(opts.chassis) || coachClassKind(opts.type) === "class-c";
  if (cutaway && /7\.3|godzilla/i.test(engine)) {
    if (/^350\s*HP$/i.test(parsed) || opts.horsepower === 350) {
      return "325–350 HP (E-450 7.3 by year — confirm door sticker)";
    }
  }
  return parsed;
}
