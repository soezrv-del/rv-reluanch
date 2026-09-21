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

function lettersOnly(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z]/g, "");
}

/** Consonant skeleton — Integra/Entegra → ntgr, Tifin/Tiffin → tfn. */
export function brandConsonantShape(s: string): string {
  return lettersOnly(s)
    .replace(/[aeiou]/g, "")
    .replace(/(.)\1+/g, "$1");
}

export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const prev = new Array<number>(n + 1);
  const cur = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(
        (prev[j] ?? 0) + 1,
        (cur[j - 1] ?? 0) + 1,
        (prev[j - 1] ?? 0) + cost,
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j] ?? 0;
  }
  return prev[n] ?? n;
}

const BRAND_FUZZY_STOP = new Set([
  "the",
  "this",
  "that",
  "these",
  "those",
  "inventory",
  "inventories",
  "diesel",
  "stock",
  "coach",
  "coaches",
  "series",
  "class",
  "motorhome",
  "motorhomes",
  "about",
  "what",
  "which",
  "have",
  "does",
  "many",
  "units",
  "unit",
  "lot",
  "from",
  "with",
  "near",
  "integrity",
  "integer",
  "entire",
  "interest",
  "interior",
]);

function brandFirstWord(brand: string): string {
  return (brand.split(/[\s-]+/)[0] || "").trim();
}

function canonicalBrandForFirstWord(first: string): string {
  const n = first.toLowerCase();
  const family = COACH_BRANDS.filter(
    (b) => brandFirstWord(b).toLowerCase() === n,
  );
  if (!family.length) return "";
  return family.sort((a, b) => b.length - a.length)[0] || "";
}

/**
 * Shape + edit-distance match onto COACH_BRANDS first words.
 * Rejects weak hits (integrity ≠ Entegra). Unique winner only.
 */
export function resolveCoachBrand(token: string): string {
  const a = lettersOnly(token);
  if (!a || BRAND_FUZZY_STOP.has(a)) return "";
  const exactFirst = canonicalBrandForFirstWord(a);
  if (exactFirst && brandFirstWord(exactFirst).toLowerCase() === a) {
    return exactFirst;
  }
  if (a.length < 5) return "";

  const seen = new Set<string>();
  const hits: { brand: string; dist: number }[] = [];
  for (const brand of COACH_BRANDS) {
    const first = lettersOnly(brandFirstWord(brand));
    if (first.length < 4 || seen.has(first)) continue;
    seen.add(first);
    const dist = editDistance(a, first);
    const maxDist = Math.min(a.length, first.length) < 7 ? 1 : 2;
    if (dist > maxDist) continue;
    const sa = brandConsonantShape(a);
    const sb = brandConsonantShape(first);
    if (sa.length < 3 || sb.length < 3 || sa !== sb) continue;
    const canonical = canonicalBrandForFirstWord(first) || brand;
    hits.push({ brand: canonical, dist });
  }
  if (!hits.length) return "";
  hits.sort((x, y) => x.dist - y.dist || y.brand.length - x.brand.length);
  const best = hits[0]!.dist;
  const unique = new Set(hits.filter((h) => h.dist === best).map((h) => h.brand));
  if (unique.size !== 1) return "";
  return hits[0]!.brand;
}

export function coachBrandsMatch(a: string, b: string): boolean {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  if (na === nb || na.includes(nb) || nb.includes(na)) return true;
  const ca = resolveCoachBrand(brandFirstWord(a));
  const cb = resolveCoachBrand(brandFirstWord(b));
  return Boolean(ca && cb && ca === cb);
}

/**
 * Floorplan / trim: number + optional letter suffix (27A, 27ASE, 25FW, 45OPP).
 * Skips budget leftovers like 50k.
 */
export type FloorplanParts = {
  raw: string;
  number: string;
  suffix: string;
  /** number + first suffix letter — 27ASE and 27A share 27A. */
  family: string;
};

const FLOORPLAN_TOKEN_RE =
  /\b(\d{2,3}\s?[A-Za-z]{1,4}|[A-Za-z]{1,3}\d{2,3}[A-Za-z]?)\b/g;

export function parseFloorplanParts(token: string): FloorplanParts | null {
  const raw = (token || "").replace(/[\s-]+/g, "").toUpperCase();
  if (!raw || /K$/.test(raw)) return null;
  let m = raw.match(/^(\d{2,3})([A-Z]{1,4})$/);
  if (m?.[1] && m[2]) {
    return {
      raw,
      number: m[1],
      suffix: m[2],
      family: m[1] + m[2][0],
    };
  }
  m = raw.match(/^([A-Z]{1,3})(\d{2,3})([A-Z]?)$/);
  if (m?.[1] && m[2]) {
    const suffix = `${m[1]}${m[3] || ""}`;
    return {
      raw,
      number: m[2],
      suffix,
      family: m[2] + suffix[0],
    };
  }
  return null;
}

export function extractFloorplanToken(text: string): string {
  if (!text) return "";
  const re = new RegExp(FLOORPLAN_TOKEN_RE.source, "g");
  for (const m of text.matchAll(re)) {
    const token = (m[1] || "").replace(/\s+/g, "");
    if (!parseFloorplanParts(token)) continue;
    return token;
  }
  return "";
}

/** Same floorplan family: 27A ↔ 27ASE, 25FW ↔ 25FWS, not 27A ↔ 29S. */
export function floorplanFamiliesMatch(ask: string, unitToken: string): boolean {
  const a = parseFloorplanParts(ask);
  const b = parseFloorplanParts(unitToken);
  if (!a || !b) return false;
  if (a.number !== b.number) return false;
  if (!a.suffix || !b.suffix) return a.suffix === b.suffix;
  const sa = a.suffix.toLowerCase();
  const sb = b.suffix.toLowerCase();
  return sa[0] === sb[0] && (sa.startsWith(sb) || sb.startsWith(sa) || sa === sb);
}

const SERIES_STOP = new Set([
  "the",
  "a",
  "an",
  "this",
  "that",
  "our",
  "uh",
  "um",
  "class",
  "series",
]);

export type SeriesPhrase = {
  family: string;
  code: string;
  spoken: string;
};

/** "M series" / "series M" / "Lineage M series" / "Lineage Series M". */
export function extractSeriesPhrase(text: string): SeriesPhrase | null {
  const t = (text || "").replace(/[.,;:!?]/g, " ");
  const patterns: Array<{
    re: RegExp;
    familyG: number | null;
    codeG: number;
  }> = [
    { re: /\b([A-Za-z][A-Za-z0-9-]{1,24})\s+series\s+([A-Za-z]{1,3})\b/i, familyG: 1, codeG: 2 },
    { re: /\b([A-Za-z][A-Za-z0-9-]{1,24})\s+([A-Za-z]{1,3})\s+series\b/i, familyG: 1, codeG: 2 },
    { re: /\bseries\s+([A-Za-z]{1,3})\b/i, familyG: null, codeG: 1 },
    { re: /\b([A-Za-z]{1,3})\s+series\b/i, familyG: null, codeG: 1 },
  ];
  for (const p of patterns) {
    const m = t.match(p.re);
    if (!m?.[p.codeG]) continue;
    const code = m[p.codeG]!.toLowerCase();
    if (!/^[a-z]{1,3}$/.test(code)) continue;
    const family =
      p.familyG != null ? normName(m[p.familyG] || "") : "";
    if (family && SERIES_STOP.has(family)) continue;
    return { family, code, spoken: m[0]!.trim() };
  }
  const nearFp = t.match(
    /\b([A-Za-z][A-Za-z0-9-]{1,24})\s+([A-Za-z]{1,3})\s+\d{2,3}[A-Za-z]{1,4}\b/i,
  );
  if (nearFp?.[1] && nearFp[2]) {
    const family = normName(nearFp[1]);
    const code = nearFp[2].toLowerCase();
    if (!SERIES_STOP.has(family) && /^[a-z]{1,3}$/.test(code)) {
      return { family, code, spoken: `${nearFp[1]} ${nearFp[2]}` };
    }
  }
  return null;
}

function findSpokenBrand(raw: string): { make: string; spoken: string } {
  const lower = raw.toLowerCase();
  for (const b of COACH_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      return { make: canonicalBrandForFirstWord(brandFirstWord(b)) || b, spoken: b };
    }
  }
  const tokens = raw.split(/[^A-Za-z0-9]+/).filter(Boolean);
  for (const tok of tokens) {
    if (/^\d{4}$/.test(tok) || parseFloorplanParts(tok)) continue;
    if (BRAND_FUZZY_STOP.has(tok.toLowerCase())) continue;
    const hit = resolveCoachBrand(tok);
    if (hit) return { make: hit, spoken: tok };
  }
  return { make: "", spoken: "" };
}

/**
 * Spoken "Lineage M" / "Lineage M series" ↔ catalog "Lineage Series M".
 * Letter/code must match so Series M never collapses onto Series E/F/VT/VP.
 * Bare "M series" / "series M" has an empty family (code-only wildcard).
 */
export function parseSeriesAlias(
  s: string,
): { family: string; code: string } | null {
  const t = normName(s);
  if (!t) return null;
  let m = t.match(/^(.+?)\s+series\s+([a-z]{1,3})$/);
  if (m?.[1] && m[2] && m[1] !== "series") return { family: m[1], code: m[2] };
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
      if (!catalogSeries || catalogSeries.code !== spokenSeries.code) {
        return false;
      }
      if (!spokenSeries.family) return true;
      return catalogSeries.family === spokenSeries.family;
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

export type NormalizedCoach = {
  year: string;
  make: string;
  spokenMake: string;
  model: string;
  seriesCode: string;
  seriesFamily: string;
  floorplan: string;
  floorplanNumber: string;
  floorplanSuffix: string;
  floorplanFamily: string;
};

function extractModelAfterSpoken(
  raw: string,
  spoken: string,
  floorplan: string,
): string {
  const lower = raw.toLowerCase();
  const needle = spoken.toLowerCase();
  const at = lower.lastIndexOf(needle);
  if (at < 0) return "";
  const after = raw.slice(at + spoken.length);
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
    if (w.length < 2 && !/^[A-Za-z]$/.test(w)) continue;
    words.push(w);
    if (words.join(" ").length > 28) break;
  }
  return words.join(" ").trim();
}

/**
 * Structural RV designation: brand (exact or shape-fuzzy) + optional
 * series/model words + floorplan number + letter suffix.
 */
export function normalizeCoachAsk(text: string): NormalizedCoach {
  const raw = text || "";
  const yearM = raw.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const year = yearM?.[1] ?? "";
  const brand = findSpokenBrand(raw);
  const make = brand.make;
  const spokenMake = brand.spoken;
  const after = spokenMake
    ? raw.slice(raw.toLowerCase().lastIndexOf(spokenMake.toLowerCase()) + spokenMake.length)
    : raw;
  let floorplan = extractFloorplanToken(after);
  if (!floorplan) floorplan = extractFloorplanToken(raw);
  const fp = parseFloorplanParts(floorplan);
  let model = make ? extractModelAfterSpoken(raw, spokenMake, floorplan) : "";
  const series = extractSeriesPhrase(raw);
  if (!model && series) {
    model = series.family
      ? `${series.family} ${series.code}`
      : `${series.code} series`;
  }
  return {
    year,
    make,
    spokenMake,
    model,
    seriesCode: series?.code || "",
    seriesFamily: series?.family || "",
    floorplan,
    floorplanNumber: fp?.number || "",
    floorplanSuffix: fp?.suffix || "",
    floorplanFamily: fp?.family || "",
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
