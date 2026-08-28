import { MAKES, RV_DATA } from "./rvData";
import {
  getMakesForYear,
  getModelsForYearMake,
  modelAvailableInYear,
} from "./catalog";

export type SuggestHit = {
  kind: "make" | "model" | "combo";
  make: string;
  model?: string;
  label: string;
  score: number;
  reason: string;
};

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Lightweight edit distance (capped). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const m = a.length;
  const n = b.length;
  if (Math.abs(m - n) > 8) return 99;
  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[n];
}

function scoreName(query: string, candidate: string): number {
  const q = norm(query);
  const c = norm(candidate);
  if (!q || !c) return 0;
  if (q === c) return 100;
  if (c.startsWith(q) || q.startsWith(c)) return 90;
  if (c.includes(q) || q.includes(c)) return 75;
  // token overlap
  const qt = new Set(q.split(" "));
  const ct = c.split(" ");
  let hit = 0;
  for (const t of ct) if (qt.has(t)) hit++;
  const overlap = hit / Math.max(qt.size, 1);
  if (overlap >= 0.5) return 55 + overlap * 30;
  const d = levenshtein(q, c);
  if (d <= 1) return 85;
  if (d <= 2) return 70;
  if (d <= 3) return 55;
  // first token close
  const q0 = q.split(" ")[0] || "";
  const c0 = c.split(" ")[0] || "";
  if (q0 && c0 && levenshtein(q0, c0) <= 2) return 50;
  return 0;
}

/** “Did you mean?” makes for a year (or all years if empty). */
export function suggestMakes(
  query: string,
  year?: string,
  limit = 5,
): SuggestHit[] {
  if (!query.trim()) return [];
  const pool = year ? getMakesForYear(year) : [...MAKES];
  return pool
    .map((make) => ({
      kind: "make" as const,
      make,
      label: make,
      score: scoreName(query, make),
      reason: year ? `Sold in ${year}` : "Catalog brand",
    }))
    .filter((h) => h.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** “Did you mean?” models for year + make. */
export function suggestModels(
  query: string,
  year: string,
  make: string,
  limit = 6,
): SuggestHit[] {
  if (!query.trim() || !make) return [];
  // Prefer year-scoped models; fall back to all models for that make
  let names = year ? getModelsForYearMake(year, make) : [];
  if (!names.length && RV_DATA[make]) {
    names = Object.keys(RV_DATA[make]!).filter((m) => {
      const sp = RV_DATA[make]![m]!;
      if (!year) return true;
      const y = parseInt(year, 10);
      return modelAvailableInYear(sp, y);
    });
  }
  // Also search across makes if make itself is fuzzy
  const cross: SuggestHit[] = [];
  if (names.length < 2) {
    const y = parseInt(year, 10);
    for (const mk of MAKES) {
      const map = RV_DATA[mk];
      if (!map) continue;
      for (const [md, sp] of Object.entries(map)) {
        if (year && Number.isFinite(y) && !modelAvailableInYear(sp, y)) continue;
        const sc = scoreName(query, md) * 0.9 + scoreName(query, `${mk} ${md}`) * 0.1;
        if (sc < 50) continue;
        cross.push({
          kind: "combo",
          make: mk,
          model: md,
          label: `${mk} ${md}`,
          score: sc,
          reason: year ? `Available around ${year}` : "Catalog match",
        });
      }
    }
  }

  const local = names
    .map((model) => ({
      kind: "model" as const,
      make,
      model,
      label: `${make} ${model}`,
      score: scoreName(query, model),
      reason: year ? `${year} · ${make}` : make,
    }))
    .filter((h) => h.score >= 40);

  return [...local, ...cross]
    .sort((a, b) => b.score - a.score)
    .filter(
      (h, i, arr) =>
        arr.findIndex(
          (x) => x.make === h.make && x.model === h.model,
        ) === i,
    )
    .slice(0, limit);
}

/** Combined suggestions when search misses or custom entry looks off. */
export function didYouMean(opts: {
  year: string;
  make: string;
  model: string;
}): SuggestHit[] {
  const { year, make, model } = opts;
  const out: SuggestHit[] = [];

  const makeInCatalog = Boolean(RV_DATA[make]);
  if (make && !makeInCatalog) {
    out.push(...suggestMakes(make, year, 4));
  }

  if (model) {
    if (makeInCatalog) {
      const models = year ? getModelsForYearMake(year, make) : Object.keys(RV_DATA[make] || {});
      const exact = models.some((m) => norm(m) === norm(model));
      if (!exact) {
        out.push(...suggestModels(model, year, make, 5));
      }
    } else {
      // typo on both — search model string globally
      out.push(...suggestModels(model, year, make || "Tiffin", 5));
    }
  }

  // de-dupe
  const seen = new Set<string>();
  return out.filter((h) => {
    const k = `${h.make}|${h.model || ""}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).slice(0, 6);
}
