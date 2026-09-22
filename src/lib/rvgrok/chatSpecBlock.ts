/**
 * Last assistant spec block → desk numbers.
 *
 * Chat reply is source of truth. Catalog is a cache. Paint a desk field
 * only when the assistant already named that number. Never invent.
 * Source is the spoken/written Grok reply only.
 */

export type ChatSpecFigures = {
  rvClass?: string;
  engine?: string;
  horsepower?: string;
  torque?: string;
  chassis?: string;
  transmission?: string;
  fuel?: string;
  gvwr?: string;
  uvw?: string;
  gcwr?: string;
  fuelCapacity?: string;
  towCapacity?: string;
  freshWater?: string;
  grayWater?: string;
  blackWater?: string;
};

export const CHAT_SPEC_DESK_LABELS: Record<keyof ChatSpecFigures, string> = {
  rvClass: "Class",
  engine: "Engine",
  horsepower: "Horsepower",
  torque: "Torque",
  chassis: "Chassis",
  transmission: "Transmission",
  fuel: "Fuel",
  gvwr: "GVWR",
  uvw: "UVW",
  gcwr: "GCWR",
  fuelCapacity: "Fuel capacity",
  towCapacity: "Tow capacity",
  freshWater: "Fresh",
  grayWater: "Gray",
  blackWater: "Black",
};

const CHAT_APPEND_KEYS = Object.keys(CHAT_SPEC_DESK_LABELS) as Array<
  keyof ChatSpecFigures
>;

const EST_NEAR_RE = /\b(EST\.?|typical class range|low confidence)\b/i;

function fmtLbs(n: number): string {
  return `${Math.round(n).toLocaleString("en-US")} lb`;
}

function parseLbsToken(raw: string): number | null {
  const n = Number(String(raw || "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 1_000 || n > 80_000) return null;
  return Math.round(n);
}

function windowAround(text: string, start: number, end: number, pad = 28): string {
  return text.slice(Math.max(0, start - pad), Math.min(text.length, end + pad));
}

function cleanSnippet(raw: string): string {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .replace(/^[\s,:;–—\-]+/, "")
    .replace(/[.;,]+$/, "")
    .trim();
}

function setFigure(
  out: ChatSpecFigures,
  key: keyof ChatSpecFigures,
  value: string | null | undefined,
): void {
  const next = cleanSnippet(value || "");
  if (!next || out[key]) return;
  out[key] = next;
}

function firstLabeledLbs(
  text: string,
  labelRe: RegExp,
): { value: string; index: number } | null {
  const re = new RegExp(
    `${labelRe.source}[^\\d\\n]{0,40}(\\d{2,3}(?:,\\d{3})?)(?:\\s*(?:to|[-–—])\\s*(\\d{2,3}(?:,\\d{3})?))?(?:\\s*(?:lb|lbs|pounds))?`,
    "ig",
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const around = windowAround(text, m.index, m.index + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    const a = parseLbsToken(m[1] || "");
    const b = parseLbsToken(m[2] || "");
    if (a == null) continue;
    if (b != null && b !== a) {
      return { value: `${fmtLbs(a).replace(" lb", "")}–${fmtLbs(b)}`, index: m.index };
    }
    return { value: fmtLbs(a), index: m.index };
  }
  return null;
}

function firstFuelGallons(text: string): string | null {
  const patterns = [
    /(\d{2,3})\s*-\s*gallon\s+fuel(?:\s+tank)?/i,
    /(\d{2,3})\s*gallon\s+fuel(?:\s+tank)?/i,
    /fuel(?:\s+tank|\s+capacity)[^.\n\d]{0,28}(\d{2,3})\s*(?:gal(?:lon)?s?)?/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m?.[1]) continue;
    const around = windowAround(text, m.index ?? 0, (m.index ?? 0) + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    const n = Number(m[1]);
    if (!Number.isFinite(n) || n < 20 || n > 300) continue;
    return `${Math.round(n)} gal`;
  }
  return null;
}

function parseTankGal(raw: string): number | null {
  const n = Number(String(raw || "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 1 || n > 200) return null;
  return Math.round(n);
}

function fmtGal(n: number): string {
  return `${Math.round(n)} gal`;
}

function tankLabelRe(kind: "fresh" | "gray" | "black"): string {
  if (kind === "fresh") return "fresh(?:\\s+water)?(?:\\s+tanks?)?";
  if (kind === "gray") return "gr[ae]y(?:\\s+water)?(?:\\s+tanks?)?";
  return "black(?:\\s+water)?(?:\\s+tanks?)?";
}

/** Skip fuel gallons tagged as fresh, and EST / typical-class guesses. */
function tankWindowOk(
  around: string,
  kind: "fresh" | "gray" | "black",
): boolean {
  if (EST_NEAR_RE.test(around)) return false;
  if (
    kind === "fresh" &&
    /\bfuel\b/i.test(around) &&
    !/\bfresh\s+(?:water|tank)/i.test(around)
  ) {
    return false;
  }
  return true;
}

function firstTankGallons(
  text: string,
  kind: "fresh" | "gray" | "black",
): string | null {
  const label = tankLabelRe(kind);
  const patterns = [
    new RegExp(
      `\\b${label}[^\\d\\n]{0,28}~?\\s*(\\d{1,3})(?!\\d)(?!,\\d)(?:\\s*(?:to|[-–—])\\s*(\\d{1,3})(?!\\d)(?!,\\d))?(?:\\s*(?:gal(?:lon)?s?))?`,
      "ig",
    ),
    new RegExp(
      `(\\d{1,3})(?!\\d)(?!,\\d)\\s*-?\\s*(?:gal(?:lon)?s?)?\\s+${label}`,
      "ig",
    ),
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      const around = windowAround(text, m.index, m.index + m[0].length);
      if (!tankWindowOk(around, kind)) continue;
      const a = parseTankGal(m[1] || "");
      const b = parseTankGal(m[2] || "");
      if (a == null) continue;
      if (b != null && b !== a) return `${a}–${b} gal`;
      return fmtGal(a);
    }
  }
  return null;
}

function firstLabeledSnippet(
  text: string,
  labelRe: RegExp,
): string | null {
  const re = new RegExp(
    `${labelRe.source}\\s*[:–—-]\\s*([^\\n]+)`,
    "ig",
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const around = windowAround(text, m.index, m.index + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    const snippet = cleanSnippet(m[1] || "");
    if (snippet) return snippet;
  }
  return null;
}

function normalizeClass(raw: string): string | null {
  const t = cleanSnippet(raw);
  if (!t || EST_NEAR_RE.test(t)) return null;
  if (/\bsuper\s*c\b/i.test(t)) return "Super C";
  if (/\bfifth\s*wheels?\b/i.test(t)) return "Fifth Wheel";
  if (/\btravel\s*trailers?\b/i.test(t)) return "Travel Trailer";
  if (/\btoy\s*haulers?\b/i.test(t)) return "Toy Hauler";
  const letter = t.match(/\bclass\s*([abc])\b/i) || t.match(/^([abc])\b/i);
  if (letter?.[1]) return `Class ${letter[1].toUpperCase()}`;
  return null;
}

function firstClass(text: string): string | null {
  const labeled = firstLabeledSnippet(text, /\bclass\b/i);
  const fromLabeled = labeled ? normalizeClass(labeled) : null;
  if (fromLabeled) return fromLabeled;

  const patterns = [
    /\bsuper\s*c\b/i,
    /\bclass\s*a\b/i,
    /\bclass\s*b\b/i,
    /\bclass\s*c\b/i,
    /\bfifth\s*wheels?\b/i,
    /\btravel\s*trailers?\b/i,
    /\btoy\s*haulers?\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const around = windowAround(text, m.index ?? 0, (m.index ?? 0) + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    return normalizeClass(m[0]);
  }
  return null;
}

function normalizeFuel(raw: string): string | null {
  const t = cleanSnippet(raw);
  if (/\bdiesel\b/i.test(t)) return "Diesel";
  if (/\bgasoline\b/i.test(t)) return "Gasoline";
  if (/\bpropane\b/i.test(t)) return "Propane";
  if (/\bgas\b/i.test(t)) return "Gas";
  return null;
}

function firstFuel(text: string): string | null {
  const labeled = firstLabeledSnippet(text, /\bfuel(?!\s*(?:tank|cap(?:acity)?))/i);
  const fromLabeled = labeled ? normalizeFuel(labeled) : null;
  if (fromLabeled) return fromLabeled;

  const patterns = [
    /(\d+(?:\.\d+)?)\s*-?\s*(?:l(?:iter)?s?)\s+(diesel|gasoline|gas|propane)/i,
    /\bclass\s*[abc]\s+(diesel|gasoline|gas)\b/i,
    /\bsuper\s*c\s+(diesel|gasoline|gas)\b/i,
    /\bfuel(?:\s+type)?(?:\s+is)?\s*[:–—-]?\s*(diesel|gasoline|gas|propane)\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m) continue;
    const around = windowAround(text, m.index ?? 0, (m.index ?? 0) + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    if (/\bgenerator\b/i.test(around) && !/\bengine\b|\bliter\b|\bclass\b/i.test(around)) {
      continue;
    }
    return normalizeFuel(m[0]);
  }
  return null;
}

function firstEngine(text: string): string | null {
  const labeled = firstLabeledSnippet(text, /\bengine\b/i);
  if (labeled && !EST_NEAR_RE.test(labeled)) return labeled;

  const liter = text.match(
    /(\d+(?:\.\d+)?)\s*-?\s*(?:l(?:iter)?s?)\s+(diesel|gasoline|gas|propane)/i,
  );
  if (liter) {
    const around = windowAround(
      text,
      liter.index ?? 0,
      (liter.index ?? 0) + liter[0].length,
    );
    if (!EST_NEAR_RE.test(around)) {
      const disp = liter[1];
      const fuel = (liter[2] || "").toLowerCase();
      const fuelWord = fuel === "gasoline" ? "gas" : fuel;
      return `${disp} ${fuelWord}`;
    }
  }

  const named = text.match(
    /\b((?:Ford\s+)?(?:\d+(?:\.\d+)?L\s+)?Power\s+Stroke|\bCummins\s+[A-Z0-9]+)\b/i,
  );
  if (named) {
    const around = windowAround(
      text,
      named.index ?? 0,
      (named.index ?? 0) + named[0].length,
    );
    if (!EST_NEAR_RE.test(around)) return cleanSnippet(named[0]);
  }
  return null;
}

function parseHpToken(raw: string): number | null {
  const n = Number(String(raw || "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 80 || n > 800) return null;
  return Math.round(n);
}

function firstHorsepower(text: string): string | null {
  const labeled = firstLabeledSnippet(text, /\b(?:hp|horsepower)\b/i);
  if (labeled) {
    const n = parseHpToken(labeled.match(/(\d{2,3})/)?.[1] || labeled);
    if (n != null) return `${n} HP`;
  }

  const patterns = [
    /(\d{2,3})\s*(?:hp|horsepower)\b/i,
    /\b(?:hp|horsepower)\s*[:–—-]?\s*(\d{2,3})\b/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m?.[1]) continue;
    const around = windowAround(text, m.index ?? 0, (m.index ?? 0) + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    const n = parseHpToken(m[1]);
    if (n == null) continue;
    return `${n} HP`;
  }
  return null;
}

function parseTorqueToken(raw: string): number | null {
  const n = Number(String(raw || "").replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 200 || n > 3_000) return null;
  return Math.round(n);
}

const TORQUE_NUM_RE = "(?<![\\d,])(\\d{1,3},\\d{3}|\\d{2,4})(?![\\d,])";

function firstTorque(text: string): string | null {
  const labeled = firstLabeledSnippet(text, /\btorque\b/i);
  if (labeled) {
    const n = parseTorqueToken(
      labeled.match(new RegExp(TORQUE_NUM_RE))?.[1] || "",
    );
    if (n != null) return `${n.toLocaleString("en-US")} lb-ft`;
  }

  const patterns = [
    new RegExp(
      `${TORQUE_NUM_RE}\\s*(?:lb-?ft|pound-feet|pound feet)(?:\\s+of\\s+torque)?`,
      "i",
    ),
    new RegExp(`\\btorque\\s*[:–—-]?\\s*${TORQUE_NUM_RE}`, "i"),
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (!m?.[1]) continue;
    const around = windowAround(text, m.index ?? 0, (m.index ?? 0) + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    const n = parseTorqueToken(m[1]);
    if (n == null) continue;
    return `${n.toLocaleString("en-US")} lb-ft`;
  }
  return null;
}

function firstChassis(text: string): string | null {
  const labeled = firstLabeledSnippet(text, /\bchassis\b/i);
  if (labeled && !EST_NEAR_RE.test(labeled)) {
    return labeled.replace(/\s*\([^)]*\)\s*$/, "").trim();
  }

  const ford = text.match(
    /\b((?:Ford\s+)?F[-\s]?[456](?:50|00)(?:\s+Super\s+Duty)?(?:\s+4x4)?)\b/i,
  );
  if (ford) {
    const around = windowAround(text, ford.index ?? 0, (ford.index ?? 0) + ford[0].length);
    if (!EST_NEAR_RE.test(around)) {
      return cleanSnippet(
        ford[0].replace(/\s+/g, " ").replace(/\bF\s+([456])/i, "F-$1"),
      );
    }
  }

  const named = text.match(
    /\bchassis(?:\s+is|\s*:)?\s+([^.]+?)(?:\.|$)/i,
  );
  if (named?.[1]) {
    const around = windowAround(text, named.index ?? 0, (named.index ?? 0) + named[0].length);
    if (!EST_NEAR_RE.test(around)) return cleanSnippet(named[1]);
  }
  return null;
}

function firstTransmission(text: string): string | null {
  const labeled = firstLabeledSnippet(text, /\btrans(?:mission)?\b/i);
  if (labeled && !EST_NEAR_RE.test(labeled)) return labeled;

  const speed = text.match(/\b(\d{1,2})\s*-\s*speed(?:\s+automatic)?\b/i);
  if (speed?.[1]) {
    const around = windowAround(text, speed.index ?? 0, (speed.index ?? 0) + speed[0].length);
    if (!EST_NEAR_RE.test(around)) return `${speed[1]}-speed`;
  }

  const allison = text.match(/\b(Allison(?:\s+\d{3,4}(?:\s+MH)?)?)\b/i);
  if (allison) {
    const around = windowAround(
      text,
      allison.index ?? 0,
      (allison.index ?? 0) + allison[0].length,
    );
    if (!EST_NEAR_RE.test(around)) return cleanSnippet(allison[0]);
  }
  return null;
}

function firstNumberThenLabelLbs(
  text: string,
  labelRe: RegExp,
): { value: string; index: number } | null {
  const re = new RegExp(
    `(\\d{2,3}(?:,\\d{3})?)\\s*-?\\s*(?:lb|lbs|pounds)?\\s*${labelRe.source}`,
    "ig",
  );
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const around = windowAround(text, m.index, m.index + m[0].length);
    if (EST_NEAR_RE.test(around)) continue;
    const a = parseLbsToken(m[1] || "");
    if (a == null) continue;
    return { value: fmtLbs(a), index: m.index };
  }
  return null;
}

/** Pull labeled + prose spec figures from the last assistant reply. Empty = do not invent. */
export function extractChatSpecFigures(text: string): ChatSpecFigures {
  const raw = (text || "").trim();
  if (!raw) return {};
  const out: ChatSpecFigures = {};

  setFigure(out, "rvClass", firstClass(raw));
  setFigure(out, "engine", firstEngine(raw));
  setFigure(out, "horsepower", firstHorsepower(raw));
  setFigure(out, "torque", firstTorque(raw));
  setFigure(out, "chassis", firstChassis(raw));
  setFigure(out, "transmission", firstTransmission(raw));
  setFigure(out, "fuel", firstFuel(raw));

  const gvwr = firstLabeledLbs(raw, /\bgvwr\b/i);
  if (gvwr) out.gvwr = gvwr.value;
  const uvw = firstLabeledLbs(raw, /\buvw\b/i);
  if (uvw) out.uvw = uvw.value;
  const gcwr = firstLabeledLbs(raw, /\bgcwr\b/i);
  if (gcwr) out.gcwr = gcwr.value;
  const tow =
    firstLabeledLbs(raw, /\b(?:tow(?:ing)?(?:\s+capacity)?|hitch)\b/i) ||
    firstNumberThenLabelLbs(raw, /\btow\b/i);
  if (tow) out.towCapacity = tow.value;
  const fuel = firstFuelGallons(raw);
  if (fuel) out.fuelCapacity = fuel;
  const fresh = firstTankGallons(raw, "fresh");
  if (fresh) out.freshWater = fresh;
  const gray = firstTankGallons(raw, "gray");
  if (gray) out.grayWater = gray;
  const black = firstTankGallons(raw, "black");
  if (black) out.blackWater = black;
  return out;
}

export function chatSpecHasNumber(figures: ChatSpecFigures): boolean {
  return Object.values(figures).some((v) => Boolean(v && String(v).trim()));
}

/** Chat named the painted coach fields — hide the GAP / honesty lecture. */
export function chatSpecCoversPaintedFields(figures: ChatSpecFigures): boolean {
  const hasClassOrChassis = Boolean(figures.rvClass || figures.chassis);
  const hasEngineOrFuel = Boolean(figures.engine || figures.fuel);
  const hasPower = Boolean(figures.horsepower || figures.torque);
  const hasWeightOrTank = Boolean(
    figures.gvwr ||
      figures.gcwr ||
      figures.uvw ||
      figures.freshWater ||
      figures.grayWater ||
      figures.blackWater,
  );
  return hasClassOrChassis && hasEngineOrFuel && hasPower && hasWeightOrTank;
}

export type ChatPaintRow = { label: string; value: string; gap: boolean };

/**
 * Chat wins when it named the field. Catalog/cache stays when chat did not.
 * Empty only if both miss.
 */
export function paintChatSpecOntoRows<T extends ChatPaintRow>(
  rows: T[],
  figures: ChatSpecFigures,
): T[] {
  if (!chatSpecHasNumber(figures)) return rows;
  const painted = rows.map((row) => {
    for (const key of Object.keys(CHAT_SPEC_DESK_LABELS) as Array<
      keyof ChatSpecFigures
    >) {
      if (row.label !== CHAT_SPEC_DESK_LABELS[key]) continue;
      const next = (figures[key] || "").trim();
      if (!next) continue;
      return { ...row, value: next, gap: false };
    }
    return row;
  });
  // Chat named a field the catalog row list omitted — append, never invent.
  for (const key of CHAT_APPEND_KEYS) {
    const next = (figures[key] || "").trim();
    if (!next) continue;
    const label = CHAT_SPEC_DESK_LABELS[key];
    if (painted.some((row) => row.label === label)) continue;
    painted.push({ label, value: next, gap: false } as T);
  }
  return painted;
}
