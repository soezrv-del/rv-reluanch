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
};

export const CHAT_SPEC_DESK_LABELS: Record<keyof ChatSpecFigures, string> = {
  gvwr: "GVWR",
  uvw: "UVW",
  fuelCapacity: "Fuel capacity",
  towCapacity: "Tow capacity",
};

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
    figures.gvwr || figures.uvw || figures.fuelCapacity || figures.towCapacity,
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
  return rows.map((row) => {
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
}
