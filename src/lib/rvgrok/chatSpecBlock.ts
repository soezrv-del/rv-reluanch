/**
 * Last assistant spec block → desk numbers.
 *
 * Chat reply is source of truth. Catalog is a cache. Paint a desk field
 * only when the assistant already named that number. Never invent.
 * Source is the spoken/written Grok reply only.
 */

export type ChatSpecFigures = {
  gvwr?: string;
  uvw?: string;
  fuelCapacity?: string;
  towCapacity?: string;
  freshWater?: string;
  grayWater?: string;
  blackWater?: string;
};

export const CHAT_SPEC_DESK_LABELS: Record<keyof ChatSpecFigures, string> = {
  gvwr: "GVWR",
  uvw: "UVW",
  fuelCapacity: "Fuel capacity",
  towCapacity: "Tow capacity",
  freshWater: "Fresh",
  grayWater: "Gray",
  blackWater: "Black",
};

const TANK_KEYS = ["freshWater", "grayWater", "blackWater"] as const;

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
    /fuel(?:\s+tank|\s+capacity)[^.\n]{0,28}(\d{2,3})\s*(?:gal(?:lon)?s?)?/i,
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

/** Pull labeled spec numbers from the last assistant reply. Empty = do not invent. */
export function extractChatSpecFigures(text: string): ChatSpecFigures {
  const raw = (text || "").trim();
  if (!raw) return {};
  const out: ChatSpecFigures = {};
  const gvwr = firstLabeledLbs(raw, /\bgvwr\b/i);
  if (gvwr) out.gvwr = gvwr.value;
  const uvw = firstLabeledLbs(raw, /\buvw\b/i);
  if (uvw) out.uvw = uvw.value;
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

export function chatSpecHasNumber(figures: ChatSpecFigures): boolean {
  return Boolean(
    figures.gvwr ||
      figures.uvw ||
      figures.fuelCapacity ||
      figures.towCapacity ||
      figures.freshWater ||
      figures.grayWater ||
      figures.blackWater,
  );
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
  // Chat named a tank the catalog row list omitted — append, never invent.
  for (const key of TANK_KEYS) {
    const next = (figures[key] || "").trim();
    if (!next) continue;
    const label = CHAT_SPEC_DESK_LABELS[key];
    if (painted.some((row) => row.label === label)) continue;
    painted.push({ label, value: next, gap: false } as T);
  }
  return painted;
}
