/**
 * Catalog honesty for customer Facts.
 *
 * Exact year / floorplan pin → show it. Missing or thin pin → GAP /
 * Confirm brochure — never brand averages, dual-family class blends,
 * or a neighboring year's engine painted as this coach.
 *
 * Dual-rating brochure strings (L9 450 std / X15 605 opt) stay in the
 * HP cell as an option string — never a lone invented 450, never the
 * blended label as a locked engine fact.
 * Missing SoT → omit (—). Never invent typicals.
 */

const AMBIGUOUS_RE =
  /\b(opt(?:ional)?|std|standard|by option|by year|by plan|by build|by chassis|typical|varies|confirm|class|era)\b/i;

const OPTION_SLASH_RE = /\/\s*(x15|x12|l9|isl|isx|isb|b6\.7|\d{2,4})/i;

const L9_AND_X15_RE = /\b(l9|isl)\b[\s\S]{0,48}\b(x15|x12)\b/i;

const STD_AND_OPT_RE = /\b(?:std|standard)\b/i;

const CLASS_OR_ERA_RE = /\b(class|era)\b/i;

const BY_VARIANT_RE =
  /\b(by year|by option|by plan|by floorplan|by chassis|by build)\b/i;

/** Distinct powertrain families. Aliases collapse to one id. */
const ENGINE_FAMILY_DEFS: ReadonlyArray<{ id: string; re: RegExp }> = [
  { id: "b67", re: /\b(b6\.7l?|isb)\b/i },
  { id: "l9", re: /\bl9\b/i },
  { id: "isl", re: /\bisl\b/i },
  { id: "x15", re: /\b(x15|isx)\b/i },
  { id: "x12", re: /\bx12\b/i },
  { id: "godzilla", re: /\b(7\.3l?|godzilla)\b/i },
  { id: "v10", re: /\b(v10|6\.8l?|triton)\b/i },
  { id: "v8_62", re: /\b6\.2l?\b/i },
  { id: "powerstroke", re: /\bpower\s*stroke\b/i },
  { id: "duramax", re: /\bduramax\b/i },
  { id: "mercedes", re: /\b(mercedes|sprinter|om\d+)\b/i },
];

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

/** Engine families named in a catalog label (L9 + B6.7 → two). */
export function extractEngineFamilies(
  engine: string | null | undefined,
): string[] {
  const e = (engine || "").trim();
  if (!e) return [];
  const found = new Set<string>();
  for (const { id, re } of ENGINE_FAMILY_DEFS) {
    if (re.test(e)) found.add(id);
  }
  return [...found];
}

/**
 * Dual-family / class / era / by-year blend with no single OEM pin.
 * Brochure std/opt option strings (L9 450 std / X15 605 opt) are not
 * this — those stay as option-band HP, not a locked engine fact.
 */
export function isUnpinnedEngineLabel(
  engine: string | null | undefined,
): boolean {
  const e = (engine || "").trim();
  if (!e || e === "—") return false;
  if (CLASS_OR_ERA_RE.test(e)) return true;
  if (BY_VARIANT_RE.test(e)) return true;
  const families = extractEngineFamilies(e);
  if (families.length < 2) return false;
  const optionBand =
    extractOptionHpClasses(e).length >= 2 &&
    STD_AND_OPT_RE.test(e) &&
    /\b(?:opt|optional)\b/i.test(e);
  return !optionBand;
}

/** Single-family catalog engine with no class / era / by-year hedge. */
export function isExactEnginePin(
  engine: string | null | undefined,
): boolean {
  const e = (engine || "").trim();
  if (!e || e === "—") return false;
  if (isInventPolicyProse(e)) return false;
  if (isUnpinnedEngineLabel(e)) return false;
  if (isAmbiguousCatalogValue(e)) return false;
  return true;
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
  if (extractEngineFamilies(s).length >= 2) return true;
  return false;
}

/**
 * Coder / invent-lock essays. These are internal policy — never customer Facts.
 * "by year" on an engine label is not a reason to emit these.
 */
export const INVENT_POLICY_PROSE_RE =
  /do not invent|HP varies\s*\/\s*confirm brochure|Torque varies by option|Horsepower not fixed for|HP varies by option\s*—\s*EST|Varies by option\s*\/\s*year\s*—\s*confirm brochure/i;

export function isInventPolicyProse(
  text: string | number | null | undefined,
): boolean {
  if (text == null || text === "") return false;
  return INVENT_POLICY_PROSE_RE.test(String(text));
}

export function omitInventPolicyProse(
  text: string | null | undefined,
): string | null {
  if (text == null) return null;
  const s = String(text).trim();
  if (!s || s === "—") return null;
  if (isInventPolicyProse(s)) return null;
  return s;
}

/** Engine lists two+ brochure HP ratings (L9 450 / X15 605). Not merely "by year". */
export function horsepowerIsOptionBand(
  engine: string | null | undefined,
  _horsepower?: string | number | null,
): boolean {
  return extractOptionHpClasses(engine).length >= 2;
}

/**
 * Omit a lone catalog torque only on a true brochure option band
 * (L9 450 std / X15 605 opt). Two HP mentions that are year or
 * floorplan variants still show SoT torque when present — that is
 * the same class of wipe as treating "by year" as unknown HP.
 */
export function engineOmitsLoneTorque(
  engine: string | null | undefined,
): boolean {
  const e = (engine || "").trim();
  if (!e) return false;
  if (extractOptionHpClasses(e).length < 2) return false;
  if (L9_AND_X15_RE.test(e)) return true;
  if (STD_AND_OPT_RE.test(e) && /\b(?:opt|optional)\b/i.test(e)) return true;
  return false;
}

function catalogNumericHp(
  horsepower: string | number | null | undefined,
): number | null {
  if (horsepower == null || horsepower === "") return null;
  if (typeof horsepower === "number") {
    return Number.isFinite(horsepower) && horsepower > 0
      ? Math.round(horsepower)
      : null;
  }
  const s = String(horsepower).trim();
  if (!s || s === "—" || isInventPolicyProse(s)) return null;
  const m = s.replace(/,/g, "").match(/(\d{2,4})/);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  return n >= 150 && n <= 800 ? n : null;
}

function catalogNumericTorque(
  torqueLbFt: string | number | null | undefined,
): number | null {
  if (torqueLbFt == null || torqueLbFt === "") return null;
  if (typeof torqueLbFt === "number") {
    return Number.isFinite(torqueLbFt) && torqueLbFt > 0
      ? Math.round(torqueLbFt)
      : null;
  }
  const s = String(torqueLbFt).trim();
  if (!s || s === "—" || isInventPolicyProse(s)) return null;
  const m = s.replace(/,/g, "").match(/(\d{2,5})/);
  if (!m) return null;
  const n = parseInt(m[1]!, 10);
  return n >= 200 && n <= 3000 ? n : null;
}

function brochureOptionHpLabel(engine: string, classes: number[]): string {
  if (
    (/450/.test(engine) && /605/.test(engine)) ||
    (classes.includes(450) && classes.includes(605))
  ) {
    return "450 std / 605 opt";
  }
  return `${classes.join(" / ")} HP`;
}

/**
 * Customer Facts HP: catalog / brochure SoT when present.
 * Dual-rating engine text (L9 + X15) surfaces the brochure option string —
 * never a lone invented 450, never "do not invent" essays.
 * Missing SoT → null (caller shows —).
 */
export function honestHorsepowerLabel(opts: {
  engine?: string | null;
  horsepower?: string | number | null;
}): string | null {
  const engine = (opts.engine || "").trim();
  // Dual-family / class / by-year blend is not a pin — never "320 / 350 HP".
  // Brochure L9 450 std / X15 605 opt is not unpinned; that stays below.
  if (isUnpinnedEngineLabel(engine)) {
    return null;
  }
  const classes = extractOptionHpClasses(engine);
  if (classes.length >= 2) {
    return brochureOptionHpLabel(engine, classes);
  }

  if (typeof opts.horsepower === "string") {
    const raw = omitInventPolicyProse(opts.horsepower);
    if (raw && /\d/.test(raw) && !/varies/i.test(raw)) {
      return /\bhp\b/i.test(raw) ? raw : `${raw} HP`;
    }
  }

  const sot = catalogNumericHp(opts.horsepower);
  if (sot != null) return `${sot} HP`;

  const range = engine.match(/(\d{2,4})\s*[–—\-to]+\s*(\d{2,4})\s*HP/i);
  if (range) return `${range[1]}–${range[2]} HP`;

  const mentions = [...engine.matchAll(/(\d{2,4})\s*HP\b/gi)].map((m) => m[1]!);
  if (mentions.length === 1) return `${mentions[0]} HP`;

  return null;
}

/**
 * Customer Facts torque: SoT number when present.
 * True option-band engines (L9 std / X15 opt) omit a lone figure — do not
 * invent option-band torque. Year or floorplan HP pairs still show SoT.
 */
export function honestTorqueLabel(opts: {
  engine?: string | null;
  torqueLbFt?: string | number | null;
}): string | null {
  const engine = (opts.engine || "").trim();
  if (isUnpinnedEngineLabel(engine) || engineOmitsLoneTorque(engine)) {
    return null;
  }

  if (typeof opts.torqueLbFt === "string") {
    const raw = omitInventPolicyProse(opts.torqueLbFt);
    if (raw && /\d/.test(raw) && !/varies/i.test(raw)) {
      return /lb-?ft/i.test(raw) ? raw : `${raw} lb-ft`;
    }
  }

  const sot = catalogNumericTorque(opts.torqueLbFt);
  if (sot != null) return `${sot.toLocaleString()} lb-ft`;
  return null;
}

/** Customer Facts cell — SoT or em dash, never invent-policy prose. */
export function formatFactsHorsepower(opts: {
  engine?: string | null;
  horsepower?: string | number | null;
}): string {
  return omitInventPolicyProse(honestHorsepowerLabel(opts)) || "—";
}

export function formatFactsTorque(opts: {
  engine?: string | null;
  torqueLbFt?: string | number | null;
}): string {
  return omitInventPolicyProse(honestTorqueLabel(opts)) || "—";
}

/**
 * Brochure / Facts HP line.
 * Dual-rating engine text wins over a lone catalog 450. Otherwise the
 * catalog/brochure number. Missing → "—" — never a policy essay.
 */
export function parseHp(engine?: string, hp?: number): string {
  return formatFactsHorsepower({ engine, horsepower: hp });
}

export function honestEngineLabel(engine: string | null | undefined): {
  text: string | null;
  locked: boolean;
} {
  const e = (engine || "").trim();
  if (!e || e === "—") return { text: null, locked: false };
  // Dual-family / class / era / by-year blends are not this coach.
  // Brochure option-band strings are also not a single locked pin.
  if (isUnpinnedEngineLabel(e) || isAmbiguousCatalogValue(e)) {
    return { text: null, locked: false };
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
function chassisLooksSprinterish(chassis?: string | null): boolean {
  return /sprinter|mercedes/i.test(chassis || "");
}

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
      return chassisLooksSprinterish(opts.chassis)
        ? "LT215/85SR16 (typ. Sprinter Class C — confirm door sticker)"
        : "LT225/75R16E (typ. Class C cutaway — confirm door sticker)";
    }
    return oem;
  }
  const kind = coachClassKind(opts.type);
  if (chassisLooksSprinterish(opts.chassis)) {
    return "LT215/85SR16 (typ. Sprinter Class C — confirm door sticker)";
  }
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
  chassis?: string | null;
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
  if (chassisLooksSprinterish(opts.chassis) && kind === "class-c") {
    return "13,500 BTU w/ heat pump (typ. Sprinter — confirm brochure)";
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
 * Facts torque for a motorized coach: catalog/brochure SoT only.
 * Do not invent chassis-typical 468 / 450 / V10 ranges.
 */
export function honestTorqueForCoach(opts: {
  engine?: string | null;
  chassis?: string | null;
  type?: string | null;
  torqueLbFt?: string | number | null;
  diesel?: boolean;
  horsepower?: number | null;
}): string {
  return formatFactsTorque({
    engine: opts.engine,
    torqueLbFt: opts.torqueLbFt,
  });
}

export function honestHorsepowerForCoach(opts: {
  engine?: string | null;
  horsepower?: string | number | null;
  chassis?: string | null;
  type?: string | null;
}): string {
  return formatFactsHorsepower({
    engine: opts.engine,
    horsepower: opts.horsepower,
  });
}

/** Class C cutaway is typically 50A; Sprinter / van Class C is typically 30A. Never hash-pick. */
export function honestElectricalService(opts: {
  type?: string | null;
  chassis?: string | null;
  oem?: string | null;
}): string {
  const oem = (opts.oem || "").trim();
  if (oem && oem !== "—") return oem;
  const kind = coachClassKind(opts.type);
  if (kind === "class-a" || kind === "super-c") return "50 amp";
  if (kind === "class-b" || chassisLooksSprinterish(opts.chassis)) return "30 amp";
  if (kind === "class-c" || isCutawayChassis(opts.chassis)) return "50 amp";
  return "Confirm brochure";
}
