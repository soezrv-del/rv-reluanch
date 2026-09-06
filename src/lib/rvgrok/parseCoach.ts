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

/**
 * Spoken "Lineage M" / "Lineage M series" ↔ catalog "Lineage Series M".
 * Letter/code must match so Series M never collapses onto Series E/F/VT/VP.
 */
export function parseSeriesAlias(
  s: string,
): { family: string; code: string } | null {
  const t = normName(s);
  if (!t) return null;
  let m = t.match(/^(.+?)\s+series\s+([a-z]{1,3})$/);
  if (m?.[1] && m[2]) return { family: m[1], code: m[2] };
  m = t.match(/^(.+?)\s+([a-z]{1,3})\s+series$/);
  if (m?.[1] && m[2]) return { family: m[1], code: m[2] };
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
  return Boolean(
    sa && sb && sa.family === sb.family && sa.code === sb.code,
  );
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
        catalogSeries.family === spokenSeries.family &&
        catalogSeries.code === spokenSeries.code
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

export function parseCoachFromText(text: string): {
  year: string;
  make: string;
  model: string;
  floorplan: string;
} {
  const raw = text || "";
  const yearM = raw.match(/\b(19[89]\d|20[0-2]\d)\b/);
  const year = yearM?.[1] ?? "";
  const lower = raw.toLowerCase();
  let make = "";
  for (const b of COACH_BRANDS) {
    if (lower.includes(b.toLowerCase())) {
      make = b;
      break;
    }
  }
  let model = "";
  let floorplan = "";
  if (make) {
    // Last mention wins — people self-correct ("Grand Design Limin, uh, Grand Design Lineage M").
    const after = raw.slice(lower.lastIndexOf(make.toLowerCase()) + make.length);
    const fp = after.match(
      /\b(\d{2,3}\s?[A-Z]{1,4}|[A-Z]{1,3}\d{2,3}[A-Z]?)\b/,
    );
    if (fp) floorplan = fp[1]!.replace(/\s+/g, "");
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
      if (fp && w.replace(/\s+/g, "") === floorplan) break;
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
    model = words.join(" ").trim();
  }
  return { year, make, model, floorplan };
}
