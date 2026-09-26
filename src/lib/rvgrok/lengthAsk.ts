/**
 * One length grammar for lot asks. Strip and parse share it, so
 * "between 28 and 32 feet" cannot be stripped down to "32 feet".
 * No imports — safe to pull into the SSR graph.
 *
 * Printed length still wins over a floorplan. Under / over never borrow
 * a floorplan digit; only an "around" size class or an explicit range does.
 * Floorplan-only rows use the same ±2 band. A tighter band would drop a
 * blank-length 32V and 28A from "around 30".
 */

const LENGTH_UNIT_WORD = "(?:feet|foots|footers|footer|foot|ft)";
const LENGTH_UNIT = `(?:${LENGTH_UNIT_WORD}\\b|['′’])`;
const SPELLED_LENGTH =
  "(?:twenty|thirty|forty)(?:[\\s-](?:one|two|three|four|five|six|seven|eight|nine))?|eighteen|nineteen";
const LENGTH_NUMBER = `(?:\\d{1,2}(?:\\.\\d+)?|${SPELLED_LENGTH})`;
const INCH_MARK = `(?:"|″|in(?:ch(?:es)?)?\\b)`;
const INCH_TAIL = `(?:\\s*\\d{1,2}\\s*${INCH_MARK})?`;
const OR_MORE = `(?:\\s+or\\s+(?:longer|more)\\b)?`;
const LENGTH_QUALIFIER =
  "under|below|less\\s+than|over|above|more\\s+than|at\\s+least|up\\s+to|max(?:imum)?|at\\s+most|no\\s+more\\s+than|around|about";
const LENGTH_ATOM = `${LENGTH_NUMBER}\\s*(?:-\\s*)?${LENGTH_UNIT}${INCH_TAIL}`;

/** Most specific phrase first so a strip cannot keep the first number. */
const LENGTH_MEASURE_SRC = [
  `\\bbetween\\s+${LENGTH_NUMBER}\\s+and\\s+${LENGTH_NUMBER}\\s*(?:-\\s*)?${LENGTH_UNIT}${INCH_TAIL}`,
  `\\b${LENGTH_NUMBER}\\s*(?:-|to\\b)\\s*${LENGTH_NUMBER}\\s*(?:-\\s*)?${LENGTH_UNIT}${INCH_TAIL}`,
  `\\b(?:${LENGTH_QUALIFIER})\\s+${LENGTH_ATOM}${OR_MORE}`,
  `\\b${LENGTH_NUMBER}\\s*\\+\\s*${LENGTH_UNIT}`,
  `\\b${LENGTH_ATOM}\\s+or\\s+(?:longer|more)\\b`,
  `\\b${LENGTH_ATOM}`,
].join("|");

const SPELLED_LENGTH_TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
};
const SPELLED_LENGTH_ONES: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
};

export type LengthMeasure =
  | { kind: "max"; feet: number; inclusive: boolean }
  | { kind: "min"; feet: number; inclusive: boolean }
  | { kind: "around"; feet: number }
  | { kind: "between"; min: number; max: number };

/** "around 30" / "30-foot" / "30-footers" → 28 through 32, inclusive. */
export const NOMINAL_LENGTH_SPAN_FT = 2;

export function nominalLengthBand(center: number): { min: number; max: number } {
  return {
    min: center - NOMINAL_LENGTH_SPAN_FT,
    max: center + NOMINAL_LENGTH_SPAN_FT,
  };
}

/**
 * Floorplan foot when the sheet left length blank: 29S, 30DS, 28A, 32V.
 * Letter-first codes stay blank. A printed length still wins.
 */
export function floorplanLengthFt(trim: string): number | null {
  const m = (trim || "").trim().match(/^(\d{2})(?!\d)/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isInteger(n) || n < 18 || n > 45) return null;
  return n;
}

/**
 * Blank printed length may use the floorplan number only for a size class
 * or an explicit range. Under / over stay on the printed length.
 */
export function lengthAllowsFloorplanFallback(filter: {
  aroundLengthFt?: number;
  minLengthFt?: number;
  maxLengthFt?: number;
}): boolean {
  return (
    filter.aroundLengthFt != null ||
    (filter.minLengthFt != null && filter.maxLengthFt != null)
  );
}

function lengthNumber(raw: string): number | null {
  const t = raw.toLowerCase().replace(/-/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return null;
  if (/^\d{1,2}(?:\.\d+)?$/.test(t)) {
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  if (t === "eighteen") return 18;
  if (t === "nineteen") return 19;
  if (SPELLED_LENGTH_TENS[t] != null) return SPELLED_LENGTH_TENS[t]!;
  const parts = t.split(" ");
  if (
    parts.length === 2 &&
    SPELLED_LENGTH_TENS[parts[0]!] != null &&
    SPELLED_LENGTH_ONES[parts[1]!] != null
  ) {
    return SPELLED_LENGTH_TENS[parts[0]!]! + SPELLED_LENGTH_ONES[parts[1]!]!;
  }
  return null;
}

function combineFeet(feet: number, inchesRaw: string | undefined): number {
  if (!inchesRaw) return feet;
  const inches = Number(inchesRaw);
  if (!Number.isFinite(inches) || inches < 0 || inches >= 12) return feet;
  return Math.round((feet + inches / 12) * 100) / 100;
}

function betweenMeasure(minRaw: string, maxRaw: string): LengthMeasure | null {
  const min = lengthNumber(minRaw);
  const max = lengthNumber(maxRaw);
  if (min == null || max == null || !(min < max) || min < 15 || max > 50) return null;
  return { kind: "between", min, max };
}

/** First length phrase in the ask. "under 40" stays a cap; "30-foot" is a size class. */
export function parseLengthAsk(text: string): LengthMeasure | null {
  const t = text || "";
  const between = t.match(
    new RegExp(
      `\\bbetween\\s+(${LENGTH_NUMBER})\\s+and\\s+(${LENGTH_NUMBER})\\s*(?:-\\s*)?${LENGTH_UNIT}`,
      "i",
    ),
  );
  if (between?.[1] && between[2]) return betweenMeasure(between[1], between[2]);

  const range = t.match(
    new RegExp(
      `\\b(${LENGTH_NUMBER})\\s*(?:-|to\\b)\\s*(${LENGTH_NUMBER})\\s*(?:-\\s*)?${LENGTH_UNIT}`,
      "i",
    ),
  );
  if (range?.[1] && range[2]) {
    const measure = betweenMeasure(range[1], range[2]);
    if (measure) return measure;
  }

  const qualified = t.match(
    new RegExp(
      `\\b(${LENGTH_QUALIFIER})\\s+(${LENGTH_NUMBER})\\s*(?:-\\s*)?${LENGTH_UNIT}(?:\\s*(\\d{1,2})\\s*${INCH_MARK})?`,
      "i",
    ),
  );
  if (qualified?.[1] && qualified[2]) {
    const feet = lengthNumber(qualified[2]);
    if (feet == null) return null;
    const n = combineFeet(feet, qualified[3]);
    const q = qualified[1].toLowerCase().replace(/\s+/g, " ");
    if (q === "under" || q === "below" || q === "less than") {
      return { kind: "max", feet: n, inclusive: false };
    }
    if (
      q === "up to" ||
      q === "max" ||
      q === "maximum" ||
      q === "at most" ||
      q === "no more than"
    ) {
      return { kind: "max", feet: n, inclusive: true };
    }
    if (q === "over" || q === "above" || q === "more than") {
      return { kind: "min", feet: n, inclusive: false };
    }
    if (q === "at least") return { kind: "min", feet: n, inclusive: true };
    return { kind: "around", feet: n };
  }

  const plus = t.match(
    new RegExp(`\\b(${LENGTH_NUMBER})\\s*\\+\\s*${LENGTH_UNIT}`, "i"),
  );
  if (plus?.[1]) {
    const feet = lengthNumber(plus[1]);
    if (feet != null) return { kind: "min", feet, inclusive: true };
  }

  const orLonger = t.match(
    new RegExp(
      `\\b(${LENGTH_NUMBER})\\s*(?:-\\s*)?${LENGTH_UNIT}(?:\\s*(\\d{1,2})\\s*${INCH_MARK})?\\s+or\\s+(?:longer|more)\\b`,
      "i",
    ),
  );
  if (orLonger?.[1]) {
    const feet = lengthNumber(orLonger[1]);
    if (feet != null) return { kind: "min", feet: combineFeet(feet, orLonger[2]), inclusive: true };
  }

  const bare = t.match(
    new RegExp(
      `\\b(${LENGTH_NUMBER})\\s*(?:-\\s*)?${LENGTH_UNIT}(?:\\s*(\\d{1,2})\\s*${INCH_MARK})?`,
      "i",
    ),
  );
  if (bare?.[1]) {
    const feet = lengthNumber(bare[1]);
    if (feet != null) return { kind: "around", feet: combineFeet(feet, bare[2]) };
  }
  return null;
}

export function looksLikeLengthMeasureAsk(text: string): boolean {
  return new RegExp(LENGTH_MEASURE_SRC, "i").test(text || "");
}

export function stripLengthMeasures(text: string): string {
  return (text || "").replace(new RegExp(LENGTH_MEASURE_SRC, "gi"), " ");
}
