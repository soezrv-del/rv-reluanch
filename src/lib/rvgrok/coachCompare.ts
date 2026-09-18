/**
 * Catalog-answerable coach-vs-coach / product compares.
 *
 * webIntent stays free of full specs — this module only matches thin
 * CATALOG_INDEX make/model names so a compare can skip web research
 * (and the Live Voice research hold) when both coaches
 * are identifiable. Repair / forum / manual asks still browse.
 */

import { CATALOG_INDEX } from "../rv/rvCatalogIndex.ts";
import { looksLikeCoachCompareQuestion } from "./parseCoach.ts";

export { looksLikeCoachCompareQuestion } from "./parseCoach.ts";

export type ComparableCatalogCoach = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  start: number;
  end: number;
};

type ModelEntry = {
  make: string;
  model: string;
  norm: string;
};

let cachedEntries: ModelEntry[] | null = null;
let cachedMakesByModel: Map<string, string[]> | null = null;

function normName(s: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function catalogEntries(): ModelEntry[] {
  if (cachedEntries) return cachedEntries;
  const out: ModelEntry[] = [];
  for (const [make, models] of Object.entries(CATALOG_INDEX)) {
    for (const model of Object.keys(models)) {
      const norm = normName(model);
      if (!norm) continue;
      out.push({ make, model, norm });
    }
  }
  out.sort((a, b) => b.norm.length - a.norm.length);
  cachedEntries = out;
  return out;
}

function makesForModel(norm: string): string[] {
  if (!cachedMakesByModel) {
    const map = new Map<string, string[]>();
    for (const entry of catalogEntries()) {
      const list = map.get(entry.norm) || [];
      if (!list.includes(entry.make)) list.push(entry.make);
      map.set(entry.norm, list);
    }
    cachedMakesByModel = map;
  }
  return cachedMakesByModel.get(norm) || [];
}

function mentionedMakes(lower: string): string[] {
  const brands = Object.keys(CATALOG_INDEX).sort((a, b) => b.length - a.length);
  const found: string[] = [];
  for (const brand of brands) {
    if (lower.includes(brand.toLowerCase())) found.push(brand);
  }
  return found;
}

function resolveMake(entry: ModelEntry, mentioned: string[]): string | null {
  const owners = makesForModel(entry.norm);
  if (owners.length === 1) return owners[0]!;
  const hit = owners.find((make) =>
    mentioned.some(
      (named) =>
        named.toLowerCase() === make.toLowerCase() ||
        make.toLowerCase().includes(named.toLowerCase()) ||
        named.toLowerCase().includes(make.toLowerCase()),
    ),
  );
  return hit || null;
}

function isWordBounded(hay: string, start: number, len: number): boolean {
  const before = start === 0 ? " " : hay[start - 1]!;
  const after = start + len >= hay.length ? " " : hay[start + len]!;
  return !/[a-z0-9]/i.test(before) && !/[a-z0-9]/i.test(after);
}

function overlaps(
  start: number,
  end: number,
  used: Array<{ start: number; end: number }>,
): boolean {
  return used.some((span) => start < span.end && end > span.start);
}

/** Forum / owner-consensus / manual — catalog cannot answer these. */
export function looksLikeForumOrManualCompare(text: string): boolean {
  return /\b(forums?|irv2|reddit|owners?\s+(?:say|think|report|reviews?|forums?)|reviews?|manuals?|service\s+manual|owners?\s+manual|consensus|what\s+do\s+owners|compare\s+reviews)\b/i.test(
    text || "",
  );
}

/**
 * Distinct catalog make+model pairs spoken in the text.
 * Ambiguous model names (same name, multiple makes) need a make cue.
 */
export function findComparableCatalogCoaches(
  text: string,
): ComparableCatalogCoach[] {
  const raw = (text || "").replace(/[\u2018\u2019\u201B\u2032]/g, "'");
  if (!raw.trim()) return [];
  const hay = raw.toLowerCase();
  const mentioned = mentionedMakes(hay);
  const used: Array<{ start: number; end: number }> = [];
  const hits: ComparableCatalogCoach[] = [];

  for (const entry of catalogEntries()) {
    const short = entry.norm.length < 5;
    if (short && !mentioned.some((m) => m.toLowerCase() === entry.make.toLowerCase())) {
      continue;
    }
    let from = 0;
    while (from < hay.length) {
      const i = hay.indexOf(entry.norm, from);
      if (i < 0) break;
      const end = i + entry.norm.length;
      if (
        !isWordBounded(hay, i, entry.norm.length) ||
        overlaps(i, end, used)
      ) {
        from = i + 1;
        continue;
      }
      const make = resolveMake(entry, mentioned);
      if (!make) {
        from = i + 1;
        continue;
      }
      used.push({ start: i, end });
      hits.push({
        year: "",
        make,
        model: entry.model,
        floorplan: "",
        start: i,
        end,
      });
      from = end;
    }
  }

  hits.sort((a, b) => a.start - b.start);

  for (const ym of raw.matchAll(/\b(19[89]\d|20[0-2]\d)\b/g)) {
    const yPos = ym.index ?? -1;
    if (yPos < 0) continue;
    let best: ComparableCatalogCoach | null = null;
    let bestDist = Infinity;
    for (const hit of hits) {
      const dist = yPos <= hit.start ? hit.start - yPos : yPos - hit.end;
      if (dist < bestDist) {
        bestDist = dist;
        best = hit;
      }
    }
    if (best && !best.year && bestDist <= 32) {
      best.year = ym[1]!;
    }
  }

  const seen = new Set<string>();
  const unique: ComparableCatalogCoach[] = [];
  for (const hit of hits) {
    const key = `${hit.make.toLowerCase()}|${hit.model.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(hit);
  }
  return unique;
}

/**
 * Two identifiable catalog coaches + compare phrasing, and the catalog
 * can answer class / powertrain now. Forum / manual / review asks stay out.
 */
export function looksLikeCatalogAnswerableCoachCompare(text: string): boolean {
  if (!looksLikeCoachCompareQuestion(text)) return false;
  if (looksLikeForumOrManualCompare(text)) return false;
  return findComparableCatalogCoaches(text).length >= 2;
}
