/**
 * Coach identity for RV Grok grounding.
 *
 * Isolated so Node tests can resolve a named ask vs a sticky Facts lock
 * without loading the full catalog / brochure graph.
 */

import { CATALOG_INDEX, MAKES } from "../rv/rvCatalogIndex.ts";
import { peekCatalog } from "../rv/catalogLoad.ts";
import type { ActiveCoach } from "../rv/activeCoach.ts";
import {
  catalogYearIsListed,
  findKnownSeries,
  matchCatalogModelName,
  parseCoachFromText,
  seriesAliasEquals,
} from "./parseCoach.ts";

export type CoachIdentity = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
  /** How we picked this coach */
  source: "message" | "facts" | "mixed";
};

const MAKE_ALIASES: Record<string, string> = {
  integra: "Entegra Coach",
  "integra coach": "Entegra Coach",
  entegra: "Entegra Coach",
  "entegra coach": "Entegra Coach",
  "american coach": "American Coach",
  "forest river": "Forest River",
  fr: "Forest River",
  jayco: "Jayco",
  newmar: "Newmar",
  tiffin: "Tiffin",
  winnebago: "Winnebago",
  thor: "Thor",
  fleetwood: "Fleetwood",
  "holiday rambler": "Holiday Rambler",
  coachmen: "Coachmen",
  airstream: "Airstream",
  dynamax: "Dynamax",
  "grand design": "Grand Design",
};

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

/** Map a spoken/typed make onto a catalog make key. */
export function resolveCatalogMake(raw: string): string {
  const n = norm(raw);
  if (!n) return raw.trim();
  if (MAKE_ALIASES[n]) return MAKE_ALIASES[n]!;
  const exact = MAKES.find((m) => norm(m) === n);
  if (exact) return exact;
  const contains = MAKES.find(
    (m) => norm(m).includes(n) || n.includes(norm(m)),
  );
  return contains || raw.trim();
}

/**
 * Dated unique Lineage floorplans — Super C 31ZW / 31ZW5 are Series F only
 * (OEM Class C brochure + RVUSA m10876). Bare "Lineage" must not stay a
 * family ghost when the floorplan already names the series.
 */
const LINEAGE_UNIQUE_FLOORPLAN_SERIES: Record<string, string> = {
  "31zw": "Lineage Series F",
  "31zw5": "Lineage Series F",
  // Spoken/typed swap: "31W Z" / "31WZ" is the Super C 31ZW.
  "31wz": "Lineage Series F",
  "31wz5": "Lineage Series F",
};

function compactFp(s: string): string {
  return (s || "").toLowerCase().replace(/[\s-]+/g, "");
}

/** OEM code is 31ZW. "31W Z" / "31WZ" is the same Super C. */
function canonicalizeLineageFloorplan(floorplan: string): string {
  const n = compactFp(floorplan);
  if (n === "31wz") return "31ZW";
  if (n === "31wz5") return "31ZW5";
  return floorplan;
}

function isBareLineageFamily(model: string): boolean {
  const n = norm(model);
  return n === "lineage" || n === "lineages";
}

/** Unique sibling series for a family + floorplan. Empty if ambiguous. */
function uniqueFamilySeriesForFloorplan(
  make: string,
  rawModel: string,
  floorplan: string,
): string {
  const fp = compactFp(canonicalizeLineageFloorplan(floorplan));
  if (!fp || !isBareLineageFamily(rawModel)) return "";
  const catalogMake = resolveCatalogMake(make || "Grand Design");
  if (catalogMake && !/grand design/i.test(catalogMake)) return "";

  const dated = LINEAGE_UNIQUE_FLOORPLAN_SERIES[fp];
  if (dated) return dated;

  const live = peekCatalog()?.RV_DATA?.[catalogMake] || {};
  const listedFp = canonicalizeLineageFloorplan(floorplan);
  const hits = lineageFamilyModels(catalogMake).filter((name) => {
    if (!/^lineage\s+series\b/i.test(name)) return false;
    const spec = live[name];
    return (
      floorplanListed(spec?.floorplans, listedFp) ||
      Object.values(spec?.floorplansByYear || {}).some((list) =>
        floorplanListed(list, listedFp),
      )
    );
  });
  return hits.length === 1 ? hits[0]! : "";
}

/** Best catalog model name under a make. Floorplan disambiguates a family. */
export function resolveCatalogModel(
  make: string,
  rawModel: string,
  floorplan = "",
): string {
  const catalogMake = resolveCatalogMake(make);
  const live = peekCatalog()?.RV_DATA?.[catalogMake];
  const index = CATALOG_INDEX[catalogMake];
  const matched = matchCatalogModelName(rawModel, [
    ...Object.keys(live || {}),
    ...Object.keys(index || {}),
  ]);
  const pinned = uniqueFamilySeriesForFloorplan(
    catalogMake,
    rawModel || matched,
    floorplan,
  );
  return pinned || matched;
}

/** Current ask has enough identity to ignore history / extraText. */
export function askNamesCoachIdentity(parsed: {
  year?: string;
  make?: string;
  model?: string;
  floorplan?: string;
}): boolean {
  const year = (parsed.year || "").trim();
  const make = (parsed.make || "").trim();
  const model = (parsed.model || "").trim();
  const floorplan = (parsed.floorplan || "").trim();
  if (make && model) return true;
  if (make && floorplan) return true;
  if (year && make) return true;
  if (model && floorplan) return true;
  return false;
}

function modelsAlign(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  if (!na || !nb) return false;
  if (distinctKnownSeries(a, b)) return false;
  if (na === nb) return true;
  if (seriesAliasEquals(a, b)) return true;
  return na.includes(nb) || nb.includes(na);
}

/** Ventana ≠ Dutch Star even when both are Newmar 4369. */
function distinctKnownSeries(a: string, b: string): boolean {
  const sa = findKnownSeries(a);
  const sb = findKnownSeries(b);
  if (!sa?.model || !sb?.model) return false;
  return norm(sa.model) !== norm(sb.model);
}

/**
 * Year from earlier turns only when that history named THIS series.
 * Never inherit 2018 Ventana onto a Dutch Star ask.
 */
export function yearFromSameSeriesHistory(
  extraText: string,
  make: string,
  model: string,
): string {
  if (!extraText?.trim() || !model?.trim()) return "";
  let year = "";
  for (const chunk of extraText.split(/[\n.!?]+/)) {
    const p = parseCoachFromText(chunk);
    if (!p.year || !p.model) continue;
    if (
      make &&
      p.make &&
      norm(resolveCatalogMake(p.make)) !== norm(resolveCatalogMake(make))
    ) {
      continue;
    }
    if (
      modelsAlign(p.model, model) ||
      modelsAlign(
        resolveCatalogModel(make || p.make, p.model, p.floorplan),
        model,
      )
    ) {
      year = p.year;
    }
  }
  return year;
}

export type CatalogPresence =
  | {
      status: "exact";
      year: string;
      make: string;
      model: string;
      floorplan: string;
    }
  | {
      status: "year-series";
      year: string;
      make: string;
      model: string;
      floorplan: string;
    }
  | {
      status: "floorplan-gap";
      year: string;
      make: string;
      model: string;
      floorplan: string;
    }
  | {
      status: "series";
      make: string;
      model: string;
      years: number[];
    }
  | {
      status: "missing-year";
      make: string;
      model: string;
      floorplan: string;
      askedYear?: string;
    }
  | { status: "missing-series"; make: string; model: string };

function floorplanListed(
  listed: readonly string[] | undefined,
  floorplan: string,
): boolean {
  const want = compactFp(floorplan);
  if (!want || !listed?.length) return false;
  return listed.some((fp) => compactFp(fp) === want);
}

const PRESENCE_COACHING_RE =
  /\s*(?:Say the series is missing\.?|Do not substitute[^.]*\.?|Tell the truth[^.]*\.?|\(do not fill in a gap\)\.?)+/gi;

/** Desk banner — honesty label only, never injected coaching copy. */
export function sanitizePresenceNote(note: string): string {
  return (note || "")
    .replace(PRESENCE_COACHING_RE, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function lineageFamilyModels(make: string): string[] {
  const catalogMake = resolveCatalogMake(make || "Grand Design");
  const live = peekCatalog()?.RV_DATA?.[catalogMake] || {};
  const index = CATALOG_INDEX[catalogMake] || {};
  return [
    ...new Set([...Object.keys(live), ...Object.keys(index)]),
  ].filter((n) => /^lineage\b/i.test(n));
}

/** Grand Design Lineage is a real family even without a Series letter. */
function lineageFamilyKnown(make: string, model: string): boolean {
  if (!/lineage/i.test(model || "")) return false;
  const catalogMake = resolveCatalogMake(make || "Grand Design");
  if (catalogMake && !/grand design/i.test(catalogMake)) return false;
  return lineageFamilyModels(catalogMake).length > 0;
}

function lineageFamilyYears(make: string): number[] {
  const catalogMake = resolveCatalogMake(make || "Grand Design");
  const live = peekCatalog()?.RV_DATA?.[catalogMake];
  const index = CATALOG_INDEX[catalogMake] || {};
  const years: number[] = [];
  for (const name of lineageFamilyModels(catalogMake)) {
    years.push(...(index[name]?.years || []));
    const byYear = live?.[name]?.floorplansByYear;
    if (byYear) {
      years.push(
        ...Object.keys(byYear).map((y) => parseInt(y, 10)),
      );
    }
  }
  return [...new Set(years.filter((y) => Number.isFinite(y)))].sort(
    (a, b) => a - b,
  );
}

/**
 * Honest catalog presence — never substitute a sibling series because
 * a floorplan code collides (4369 on Ventana and Dutch Star).
 */
export function inspectCatalogPresence(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): CatalogPresence {
  const rawModel = (identity.model || "").trim();
  let make = resolveCatalogMake(identity.make || "");
  if (!make && lineageFamilyKnown("", rawModel)) {
    make = "Grand Design";
  }
  const year = (identity.year || "").trim();
  const floorplan = canonicalizeLineageFloorplan(
    (identity.floorplan || "").trim(),
  );
  const model = rawModel
    ? resolveCatalogModel(make, rawModel, floorplan)
    : "";
  if (!make || !model) {
    if (lineageFamilyKnown(make, rawModel || model)) {
      const familyMake = make || "Grand Design";
      const familyModel = rawModel || model || "Lineage";
      const familyYears = lineageFamilyYears(familyMake);
      if (year) {
        return {
          status: "year-series",
          year,
          make: familyMake,
          model: familyModel,
          floorplan,
        };
      }
      return familyYears.length
        ? { status: "series", make: familyMake, model: familyModel, years: familyYears }
        : { status: "missing-year", make: familyMake, model: familyModel, floorplan };
    }
    return { status: "missing-series", make: identity.make || "", model };
  }

  const live = peekCatalog()?.RV_DATA?.[make]?.[model];
  const index = CATALOG_INDEX[make]?.[model];
  const years = [
    ...(index?.years || []),
    ...Object.keys(live?.floorplansByYear || {}).map((y) => parseInt(y, 10)),
  ].filter((y) => Number.isFinite(y));
  const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
  const seriesKnown = Boolean(live || index);

  if (!seriesKnown) {
    if (lineageFamilyKnown(make, rawModel || model)) {
      const years = lineageFamilyYears(make);
      if (!year) {
        return years.length
          ? { status: "series", make, model: rawModel || model, years }
          : { status: "missing-year", make, model: rawModel || model, floorplan };
      }
      return { status: "year-series", year, make, model: rawModel || model, floorplan };
    }
    return { status: "missing-series", make, model };
  }
  if (!year) {
    return uniqueYears.length
      ? { status: "series", make, model, years: uniqueYears }
      : { status: "missing-year", make, model, floorplan };
  }

  const yearListed =
    catalogYearIsListed(year, index?.years) ||
    Boolean(live?.floorplansByYear?.[year]);
  if (!yearListed && uniqueYears.length && !uniqueYears.includes(parseInt(year, 10))) {
    return { status: "missing-year", make, model, floorplan, askedYear: year };
  }

  if (floorplan) {
    const byYear = live?.floorplansByYear?.[year];
    if (byYear?.length) {
      if (floorplanListed(byYear, floorplan)) {
        return { status: "exact", year, make, model, floorplan };
      }
      return { status: "floorplan-gap", year, make, model, floorplan };
    }
    if (floorplanListed(live?.floorplans, floorplan)) {
      return { status: "exact", year, make, model, floorplan };
    }
  }

  return { status: "year-series", year, make, model, floorplan };
}

export function formatCatalogPresenceNote(presence: CatalogPresence): string {
  return sanitizePresenceNote(formatCatalogPresenceNoteRaw(presence));
}

function formatCatalogPresenceNoteRaw(presence: CatalogPresence): string {
  switch (presence.status) {
    case "exact":
      return "";
    case "year-series":
      return "";
    case "floorplan-gap":
      return `FLOORPLAN GAP — ${presence.year} ${presence.make} ${presence.model} is in the catalog; ${presence.floorplan} is not listed for that year.`;
    case "series":
      return `YEAR MISSING — ${presence.make} ${presence.model} is in the catalog.`;
    case "missing-year":
      if (presence.askedYear) {
        return `YEAR GAP — ${presence.askedYear} ${presence.make} ${presence.model} is not a catalog year for that series.`;
      }
      return presence.floorplan
        ? `YEAR MISSING — ${presence.make} ${presence.model} ${presence.floorplan} needs a model year.`
        : `YEAR MISSING — ${presence.make} ${presence.model} is a known series.`;
    case "missing-series":
      return `SERIES MISSING — ${[presence.make, presence.model].filter(Boolean).join(" ") || "that series"} is not in the verified catalog.`;
    default:
      return "";
  }
}

/**
 * True when this turn names a different year / make / model than the sticky
 * Facts / verified-catalog lock. Floorplan-only is not a lock break.
 */
export function namedCoachConflictsLock(
  parsed: { year: string; make: string; model: string; floorplan: string },
  facts?: ActiveCoach | null,
): boolean {
  if (!facts?.make?.trim() || !facts.model?.trim()) return false;
  if (!askNamesCoachIdentity(parsed)) return false;

  if (parsed.make) {
    const pMake = norm(resolveCatalogMake(parsed.make));
    const fMake = norm(resolveCatalogMake(facts.make));
    if (pMake && fMake && pMake !== fMake) return true;
  }

  if (parsed.model) {
    const pModel = resolveCatalogModel(
      parsed.make || facts.make,
      parsed.model,
      parsed.floorplan,
    );
    const fModel = resolveCatalogModel(
      facts.make,
      facts.model,
      facts.floorplan,
    );
    if (!modelsAlign(pModel, fModel) && !modelsAlign(parsed.model, facts.model)) {
      return true;
    }
  }

  if (parsed.year && facts.year && parsed.year !== facts.year) {
    return true;
  }

  return false;
}

/**
 * Keep "Lineage Series M" when the hint only locked the family "Lineage".
 * Dutch Star / Ventana stay the unique series name.
 */
function preferSpecificKnownModel(current: string, known: string): string {
  const c = norm(current);
  const k = norm(known);
  if (!c) return known;
  if (!k) return current;
  if (c === k) return known;
  if (c.includes(k) && c.length > k.length) return current.trim();
  if (k.includes(c) && k.length > c.length) return known;
  return known;
}

/**
 * Known series is a single tuple. Dutch Star → Newmar only — never keep a
 * leftover Grand Design (or any other) make on that model.
 * Lineage → Grand Design — never blank the make or treat the family as a ghost.
 */
export function lockIdentityTuple(id: CoachIdentity): CoachIdentity {
  const known =
    findKnownSeries(id.model) ||
    findKnownSeries([id.year, id.make, id.model, id.floorplan].filter(Boolean).join(" "));
  const model = known
    ? preferSpecificKnownModel(id.model, known.model)
    : id.model;
  const make = known?.make ?? id.make;
  const lineage = /lineage/i.test(model) || /lineage/i.test(id.model);
  return {
    ...id,
    make,
    model,
    floorplan: lineage
      ? canonicalizeLineageFloorplan(id.floorplan)
      : id.floorplan,
  };
}

function identityFromAsk(
  parsed: { year: string; make: string; model: string; floorplan: string },
  source: CoachIdentity["source"],
): CoachIdentity {
  const make = parsed.make ? resolveCatalogMake(parsed.make) : "";
  return lockIdentityTuple({
    year: parsed.year,
    make,
    model: parsed.model
      ? resolveCatalogModel(
          parsed.make || make,
          parsed.model,
          parsed.floorplan,
        )
      : parsed.model,
    floorplan: parsed.floorplan,
    source,
  });
}

/**
 * History is discrete asks — never one blob that fills year / make / model /
 * floorplan independently (2020 + Grand Design + Dutch Star + 25FW).
 * Last complete coach tuple wins.
 */
export function lastCompleteParseFromHistory(extraText: string): {
  year: string;
  make: string;
  model: string;
  floorplan: string;
} | null {
  if (!extraText?.trim()) return null;
  let last: {
    year: string;
    make: string;
    model: string;
    floorplan: string;
  } | null = null;
  for (const chunk of extraText.split(/[\n.!?]+/)) {
    const parsed = parseCoachFromText(chunk);
    if (!askNamesCoachIdentity(parsed)) continue;
    last = parsed;
  }
  return last;
}

/**
 * Prefer an explicit year/make/model in the user's words.
 * Fall back to the open Facts selection when the question is "this coach."
 * A newly named different coach breaks the sticky verified-catalog lock
 * even when the ask omits a year (Integra Vision after a Lineage lock).
 */
export function resolveCoachIdentity(
  query: string,
  facts?: ActiveCoach | null,
  extraText = "",
): CoachIdentity | null {
  // Current ask wins. History is last complete coach tuple — never a blob
  // that fills year / make / model / floorplan independently.
  const fromQuery = parseCoachFromText(query);
  const queryNamesCoach = askNamesCoachIdentity(fromQuery);
  const parsed = queryNamesCoach
    ? fromQuery
    : lastCompleteParseFromHistory(`${query}\n${extraText}`) || fromQuery;
  const factsOk = Boolean(
    facts?.year?.trim() && facts.make?.trim() && facts.model?.trim(),
  );

  if (queryNamesCoach && namedCoachConflictsLock(fromQuery, facts)) {
    const asked = identityFromAsk(fromQuery, "message");
    if (!asked.year) {
      asked.year = yearFromSameSeriesHistory(
        extraText,
        asked.make,
        asked.model,
      );
    }
    return lockIdentityTuple(asked);
  }

  if (parsed.year && parsed.make && parsed.model) {
    const sameFamily =
      factsOk &&
      parsed.year === facts!.year &&
      norm(resolveCatalogMake(parsed.make)) ===
        norm(resolveCatalogMake(facts!.make));
    const sameModel =
      Boolean(sameFamily) &&
      (modelsAlign(
        resolveCatalogModel(parsed.make, parsed.model, parsed.floorplan),
        facts!.model,
      ) ||
        modelsAlign(parsed.model, facts!.model));
    return lockIdentityTuple({
      year: parsed.year,
      make: resolveCatalogMake(parsed.make),
      model: resolveCatalogModel(parsed.make, parsed.model, parsed.floorplan),
      floorplan:
        parsed.floorplan ||
        (sameModel ? facts!.floorplan || "" : ""),
      source: sameModel && !parsed.floorplan && facts!.floorplan ? "mixed" : "message",
    });
  }

  // Yearless named coach. Same lock → inherit year; otherwise ground on the ask.
  if (parsed.make && parsed.model) {
    const sameMake =
      factsOk &&
      norm(resolveCatalogMake(parsed.make)) ===
        norm(resolveCatalogMake(facts!.make));
    const catalogModel = resolveCatalogModel(
      parsed.make,
      parsed.model,
      parsed.floorplan,
    );
    const sameModel =
      Boolean(sameMake) &&
      (modelsAlign(catalogModel, facts!.model) ||
        modelsAlign(parsed.model, facts!.model));
    const year =
      parsed.year ||
      (sameModel
        ? facts!.year
        : yearFromSameSeriesHistory(extraText, parsed.make, catalogModel));
    return lockIdentityTuple({
      year,
      make: resolveCatalogMake(parsed.make),
      model: catalogModel,
      floorplan:
        parsed.floorplan || (sameModel ? facts!.floorplan || "" : ""),
      source: sameModel && !parsed.year ? "mixed" : "message",
    });
  }

  if (parsed.year && parsed.make && factsOk && parsed.year === facts!.year) {
    const sameMake =
      norm(resolveCatalogMake(parsed.make)) ===
      norm(resolveCatalogMake(facts!.make));
    if (sameMake) {
      return lockIdentityTuple({
        year: facts!.year,
        make: resolveCatalogMake(facts!.make),
        model: facts!.model,
        floorplan: parsed.floorplan || facts!.floorplan || "",
        source: "mixed",
      });
    }
  }

  if (factsOk) {
    return lockIdentityTuple({
      year: facts!.year,
      make: resolveCatalogMake(facts!.make),
      model: facts!.model,
      floorplan: facts!.floorplan || "",
      source: "facts",
    });
  }

  if (parsed.year && parsed.make) {
    return lockIdentityTuple({
      year: parsed.year,
      make: resolveCatalogMake(parsed.make),
      model: parsed.model,
      floorplan: parsed.floorplan,
      source: "message",
    });
  }

  if (parsed.make && parsed.floorplan) {
    return identityFromAsk(parsed, "message");
  }

  return null;
}
