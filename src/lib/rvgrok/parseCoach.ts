/** Shared year / make / model parse — no storage, safe for Node tests. */

export const COACH_BRANDS = [
  "Leisure Travel Vans",
  "American Coach",
  "Entegra Coach",
  "Forest River",
  "Grand Design",
  "Newmar",
  "Tiffin",
  "Winnebago",
  "Airstream",
  "Fleetwood",
  "Jayco",
  "Thor",
  "Coachmen",
  "Holiday Rambler",
  "Heartland",
  "Keystone",
  "Lance",
  "Renegade",
  "Pleasure-Way",
  "Roadtrek",
  "Enova",
  "Brinkley",
  "Alliance",
  "Outdoors RV",
  "Northwood",
  "Oliver",
  "Nexus",
  "Dynamax",
  "Entegra",
].sort((a, b) => b.length - a.length);

/**
 * Spoken/typed names that resolve to a catalog brand. Never a make of their
 * own — salesmen say "Integra" for Entegra Coach / Vision.
 * Longer aliases first so "Integra Coach" wins over "Integra".
 */
export const COACH_BRAND_ALIASES: ReadonlyArray<readonly [string, string]> = [
  ["Integra Coach", "Entegra Coach"],
  ["Integra", "Entegra Coach"],
];

/** True when this model year is on the thin catalog year list. */
export function catalogYearIsListed(
  year: string,
  years?: readonly number[] | null,
): boolean {
  const y = parseInt(year, 10);
  if (!Number.isFinite(y) || !years?.length) return false;
  return years.includes(y);
}

function normName(s: string): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeBrandRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Floorplan / trim token: 27A, 27ASE, 45A, 337RLS, 25FW.
 * Skips budget leftovers like 50k so a price ask is not a floorplan.
 */
const FLOORPLAN_TOKEN_RE =
  /\b(\d{2,3}\s?[A-Za-z]{1,4}|[A-Za-z]{1,3}\d{2,3}[A-Za-z]?)\b/g;

export function extractFloorplanToken(text: string): string {
  if (!text) return "";
  const re = new RegExp(FLOORPLAN_TOKEN_RE.source, "g");
  for (const m of text.matchAll(re)) {
    const token = (m[1] || "").replace(/\s+/g, "");
    if (!token) continue;
    if (/k$/i.test(token)) continue;
    return token;
  }
  return "";
}

/** False-friend English words that shape-collide with a brand (Entegra). */
const WEAK_BRAND_WORDS = new Set([
  "integrity",
  "integral",
  "integrate",
  "integrated",
  "integration",
  "interest",
  "interior",
  "intent",
  "intense",
]);

function lettersOnly(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z]/g, "");
}

/**
 * Consonant skeleton for brand typos: strip vowels, fold c/k and s/z,
 * collapse double letters. Tifin / Tiffin → tfn. Not a per-typo list.
 */
export function consonantBrandShape(s: string): string {
  const folded = lettersOnly(s)
    .replace(/[aeiouy]/g, "")
    .replace(/k/g, "c")
    .replace(/z/g, "s");
  return folded.replace(/(.)\1+/g, "$1");
}

function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const next = new Array<number>(n + 1);
    next[0] = i;
    const ca = a[i - 1];
    for (let j = 1; j <= n; j++) {
      const cost = ca === b[j - 1] ? 0 : 1;
      next[j] = Math.min(
        prev[j]! + 1,
        next[j - 1]! + 1,
        prev[j - 1]! + cost,
      );
    }
    prev = next;
  }
  return prev[n]!;
}

function fuzzyBrandFromText(lower: string): { make: string; spoken: string } {
  const tokens = lower.split(/[^a-z0-9]+/).filter(Boolean);
  const windows: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i] || "";
    if (WEAK_BRAND_WORDS.has(tok) || tok.length < 4 || /^\d/.test(tok)) continue;
    windows.push(tok);
    if (i + 1 < tokens.length && (tokens[i + 1] || "").length >= 3) {
      windows.push(`${tok} ${tokens[i + 1]}`);
    }
    if (i + 2 < tokens.length && (tokens[i + 2] || "").length >= 3) {
      windows.push(`${tok} ${tokens[i + 1]} ${tokens[i + 2]}`);
    }
  }

  type Hit = { make: string; spoken: string; len: number };
  const hits: Hit[] = [];
  for (const brand of COACH_BRANDS) {
    const bn = brand.toLowerCase();
    const bLetters = lettersOnly(bn);
    const bShape = consonantBrandShape(bn);
    const bFirst = bLetters[0] || "";
    if (bShape.length < 3 || !bFirst) continue;
    for (const spoken of windows) {
      const sLetters = lettersOnly(spoken);
      if (sLetters.length < 4) continue;
      if ((sLetters[0] || "") !== bFirst) continue;
      const sShape = consonantBrandShape(spoken);
      const shapeHit = sShape === bShape && sShape.length >= 3;
      const dist = editDistance(sLetters, bLetters);
      const maxDist = sLetters.length >= 6 ? 2 : 1;
      const editHit = dist > 0 && dist <= maxDist;
      if (shapeHit || editHit) {
        hits.push({ make: brand, spoken, len: brand.length });
      }
    }
  }
  if (!hits.length) return { make: "", spoken: "" };
  hits.sort((a, b) => b.len - a.len || a.make.localeCompare(b.make));
  const best = hits[0]!;
  const sameSpoken = hits.filter((h) => h.spoken === best.spoken);
  const makes = [...new Set(sameSpoken.map((h) => h.make))];
  if (makes.length === 1) return { make: best.make, spoken: best.spoken };
  const longest = [...makes].sort((a, b) => b.length - a.length)[0]!;
  const nested = makes.every(
    (m) => m === longest || longest.toLowerCase().includes(m.toLowerCase()),
  );
  if (nested) return { make: longest, spoken: best.spoken };
  return { make: "", spoken: "" };
}

function findSpokenBrand(lower: string): { make: string; spoken: string } {
  // Integra → Entegra Coach stays an exact fast path (fuzzy would land on Entegra).
  for (const [alias, canonical] of COACH_BRAND_ALIASES) {
    const re = new RegExp(`\\b${escapeBrandRe(alias)}\\b`, "i");
    if (re.test(lower)) return { make: canonical, spoken: alias };
  }
  for (const b of COACH_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      return { make: b, spoken: b };
    }
  }
  return fuzzyBrandFromText(lower);
}

export type NormalizedCoachAsk = {
  year: string;
  make: string;
  spokenBrand: string;
  model: string;
  seriesFamily: string;
  seriesCode: string;
  floorplan: string;
};

const SERIES_FAMILY_STOP = new Set([
  "the",
  "a",
  "an",
  "uh",
  "um",
  "er",
  "ah",
  "oh",
  "hmm",
  "do",
  "we",
  "have",
  "any",
  "got",
  "our",
  "in",
  "on",
  "at",
  "for",
  "and",
  "but",
  "or",
  "this",
  "that",
  "with",
  "from",
  "about",
  "class",
  "diesel",
  "gas",
]);

/**
 * Series phrase in a full ask or a model string.
 * Empty family is a code-only wildcard ("M series") so Series M ≠ Series E.
 */
export function parseSpokenSeries(
  s: string,
): { family: string; code: string } | null {
  const t = normName(s);
  if (!t) return null;
  let m = t.match(/\b([a-z][a-z0-9]+)\s+series\s+([a-z]{1,3})\b/);
  if (m?.[1] && m[2] && !SERIES_FAMILY_STOP.has(m[1])) {
    return { family: m[1], code: m[2] };
  }
  m = t.match(/\b([a-z][a-z0-9]+)\s+([a-z]{1,3})\s+series\b/);
  if (m?.[1] && m[2] && !SERIES_FAMILY_STOP.has(m[1])) {
    return { family: m[1], code: m[2] };
  }
  m = t.match(/\bseries\s+([a-z]{1,3})\b/);
  if (m?.[1]) return { family: "", code: m[1] };
  m = t.match(/\b([a-z]{1,3})\s+series\b/);
  if (m?.[1]) return { family: "", code: m[1] };
  // "Lineage M 25FW" / "Vision SE 27A" — short code immediately before a floorplan.
  m = t.match(/\b([a-z][a-z0-9]+)\s+([a-z]{1,3})(?=\s+\d{2,3}[a-z])/);
  if (m?.[1] && m[2] && !SERIES_FAMILY_STOP.has(m[1])) {
    return { family: m[1], code: m[2] };
  }
  return null;
}

function formatSeriesModel(series: { family: string; code: string }): string {
  if (series.family) return `${series.family} ${series.code}`;
  return `${series.code} series`;
}

/** Floorplan + brand/model/series — salesman designation, not a spec sentence. */
export function looksLikeCoachDesignationAsk(text: string): boolean {
  const n = normalizeCoachAsk(text);
  if (!n.floorplan) return false;
  return Boolean(n.make || n.model || n.seriesCode);
}

/**
 * Spoken "Lineage M" / "Lineage M series" ↔ catalog "Lineage Series M".
 * Letter/code must match so Series M never collapses onto Series E/F/VT/VP.
 */
export function parseSeriesAlias(
  s: string,
): { family: string; code: string } | null {
  const t = normName(s);
  if (!t) return null;
  const spoken = parseSpokenSeries(t);
  if (spoken) return spoken;
  let m = t.match(/^(.+?)\s+series\s+([a-z]{1,3})$/);
  if (m?.[1] && m[2]) return { family: m[1], code: m[2] };
  m = t.match(/^(.+?)\s+([a-z]{1,3})\s+series$/);
  if (m?.[1] && m[2]) return { family: m[1], code: m[2] };
  m = t.match(/^series\s+([a-z]{1,3})$/);
  if (m?.[1]) return { family: "", code: m[1] };
  m = t.match(/^([a-z]{1,3})\s+series$/);
  if (m?.[1]) return { family: "", code: m[1] };
  m = t.match(/^(.+?)\s+([a-z]{1,2})$/);
  if (m?.[1] && m[2]) return { family: m[1], code: m[2] };
  // "Lineage M have" / "Lineage M, thanks" — keep the series letter, drop the tail.
  m = t.match(/^(.+?)\s+([a-z]{1,2})\s+\S+/);
  if (m?.[1] && m[2]) return { family: m[1], code: m[2] };
  return null;
}

/** Spoken "Lineage M series" is the same series as catalog "Lineage Series M". */
export function seriesAliasEquals(a: string, b: string): boolean {
  const sa = parseSeriesAlias(normName(a));
  const sb = parseSeriesAlias(normName(b));
  if (!sa || !sb || sa.code !== sb.code) return false;
  // Empty family is a code-only wildcard ("M series" ↔ any Series M).
  if (!sa.family || !sb.family) return true;
  return sa.family === sb.family;
}

/** Pick the catalog model key for a spoken/typed name. Catalog-free. */
export function matchCatalogModelName(
  rawModel: string,
  names: Iterable<string>,
): string {
  const n = normName(rawModel);
  if (!n) return rawModel.trim();
  const list = [...new Set(names)];

  for (const name of list) {
    if (normName(name) === n) return name;
  }

  const spokenSeries = parseSeriesAlias(n);
  if (spokenSeries) {
    const hits = list.filter((name) => {
      const catalogSeries = parseSeriesAlias(normName(name));
      return (
        !!catalogSeries &&
        catalogSeries.code === spokenSeries.code &&
        (!spokenSeries.family ||
          catalogSeries.family === spokenSeries.family)
      );
    });
    if (hits.length === 1) return hits[0]!;
    if (hits.length > 1) {
      return hits.find((h) => /\bseries\b/i.test(h)) || hits[0]!;
    }
  }

  let best = rawModel.trim();
  let bestLen = -1;
  for (const name of list) {
    const nn = normName(name);
    if (nn.includes(n) || n.includes(nn)) {
      if (nn.length > bestLen) {
        best = name;
        bestLen = nn.length;
      }
    }
  }
  return best;
}

function collectModelWords(after: string, floorplan: string): string {
  const chunk = after
    .replace(/[.,;:!?]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4);
  const skip = new Set([
    "the",
    "a",
    "an",
    "rv",
    "class",
    "diesel",
    "gas",
    "motorhome",
    "coach",
    "uh",
    "um",
    "er",
    "ah",
    "oh",
    "hmm",
  ]);
  // Predicate / question tail — "Lineage M have?" must not become "Lineage M have".
  const stopAfterModel = new Set([
    "have",
    "has",
    "had",
    "having",
    "does",
    "do",
    "did",
    "is",
    "are",
    "was",
    "were",
    "with",
    "for",
    "that",
    "which",
    "what",
    "when",
    "and",
    "but",
    "or",
    "please",
    "thanks",
    "thank",
  ]);
  const words: string[] = [];
  for (const w of chunk) {
    if (
      floorplan &&
      w.replace(/\s+/g, "").toLowerCase() === floorplan.toLowerCase()
    ) {
      break;
    }
    if (/^\d{4}$/.test(w)) continue;
    const lowerW = w.toLowerCase();
    if (skip.has(lowerW)) continue;
    if (words.length > 0 && stopAfterModel.has(lowerW)) break;
    // Keep "M" / "E" / "F" series letters — `w.length < 2` used to drop them
    // so "Lineage M series" collapsed to "Lineage series".
    if (w.length < 2 && !/^[A-Za-z]$/.test(w)) continue;
    words.push(w);
    if (words.join(" ").length > 28) break;
  }
  return words.join(" ").trim();
}

/**
 * Structural year / brand / series / floorplan parse.
 * Brand: exact COACH_BRANDS, Integra alias, else consonant-shape + edit
 * distance onto that seed set. Series + floorplan work with no brand
 * ("M series 25FW", "Lineage M 25FW").
 */
export function normalizeCoachAsk(text: string): NormalizedCoachAsk {
  const raw = text || "";
  const yearM = raw.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const year = yearM?.[1] ?? "";
  const lower = raw.toLowerCase();
  const brand = findSpokenBrand(lower);
  const make = brand.make;
  const spokenBrand = brand.spoken;
  let model = "";
  let floorplan = "";
  if (make) {
    // Last mention wins — people self-correct ("Grand Design Limin, uh, Grand Design Lineage M").
    const spoken = spokenBrand.toLowerCase();
    const idx = lower.lastIndexOf(spoken);
    const after = idx >= 0 ? raw.slice(idx + spoken.length) : raw;
    floorplan = extractFloorplanToken(after);
    // "27A Integra Vision" / "36L Tifin Phaeton" — floorplan sits before the brand.
    if (!floorplan) floorplan = extractFloorplanToken(raw);
    model = collectModelWords(after, floorplan);
  } else {
    floorplan = extractFloorplanToken(raw);
  }

  const series =
    parseSpokenSeries(model) ||
    parseSeriesAlias(normName(model)) ||
    parseSpokenSeries(raw);
  if (!model && series) model = formatSeriesModel(series);

  return {
    year,
    make,
    spokenBrand,
    model,
    seriesFamily: series?.family || "",
    seriesCode: series?.code || "",
    floorplan,
  };
}

export function parseCoachFromText(text: string): {
  year: string;
  make: string;
  model: string;
  floorplan: string;
} {
  const n = normalizeCoachAsk(text);
  return {
    year: n.year,
    make: n.make,
    model: n.model,
    floorplan: n.floorplan,
  };
}

/**
 * Coach-vs-coach / product compare phrasing. Lifestyle "vs hotels"
 * stays a pitch, not a catalog compare.
 */
const COACH_COMPARE_RE =
  /\b(compare|comparison|comparing|vs\.?|versus|side[- ]by[- ]side|difference(?:s)?\s+between|which\s+(?:is|one(?:'s|\s+is))\s+better|better\s+than)\b/i;

const LIFESTYLE_VS_RE =
  /\b(vs\.?\s+hotels?|van\s+life\s+vs|lifestyle\s+vs|worth\s+it)\b/i;

export function looksLikeCoachCompareQuestion(text: string): boolean {
  const t = (text || "").replace(/[\u2018\u2019\u201B\u2032]/g, "'").trim();
  if (!t) return false;
  if (LIFESTYLE_VS_RE.test(t)) return false;
  return COACH_COMPARE_RE.test(t);
}
