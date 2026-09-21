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

/** Best catalog model name under a make. */
export function resolveCatalogModel(make: string, rawModel: string): string {
  const catalogMake = resolveCatalogMake(make);
  const live = peekCatalog()?.RV_DATA?.[catalogMake];
  const index = CATALOG_INDEX[catalogMake];
  return matchCatalogModelName(rawModel, [
    ...Object.keys(live || {}),
    ...Object.keys(index || {}),
  ]);
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
      modelsAlign(resolveCatalogModel(make || p.make, p.model), model)
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

function compactFp(s: string): string {
  return (s || "").toLowerCase().replace(/[\s-]+/g, "");
}

function floorplanListed(
  listed: readonly string[] | undefined,
  floorplan: string,
): boolean {
  const want = compactFp(floorplan);
  if (!want || !listed?.length) return false;
  return listed.some((fp) => compactFp(fp) === want);
}

/**
 * Honest catalog presence — never substitute a sibling series because
 * a floorplan code collides (4369 on Ventana and Dutch Star).
 */
export function inspectCatalogPresence(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): CatalogPresence {
  const make = resolveCatalogMake(identity.make || "");
  const model = identity.model
    ? resolveCatalogModel(make, identity.model)
    : "";
  const year = (identity.year || "").trim();
  const floorplan = (identity.floorplan || "").trim();
  if (!make || !model) {
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
  switch (presence.status) {
    case "exact":
      return "";
    case "year-series":
      return "";
    case "floorplan-gap":
      return `FLOORPLAN GAP — ${presence.year} ${presence.make} ${presence.model} is in the catalog; ${presence.floorplan} is not listed for that year. Say the floorplan is unverified. Do not substitute a sibling series that shares the code.`;
    case "series":
      return `YEAR MISSING — ${presence.make} ${presence.model} is in the catalog. Ask which year. Do not substitute a sibling series.`;
    case "missing-year":
      if (presence.askedYear) {
        return `YEAR GAP — ${presence.askedYear} ${presence.make} ${presence.model} is not a catalog year for that series. Do not say the series is missing. Do not substitute a sibling series.`;
      }
      return presence.floorplan
        ? `YEAR MISSING — ${presence.make} ${presence.model} ${presence.floorplan} needs a model year. Do not say the series is missing. Do not substitute a sibling series.`
        : `YEAR MISSING — ${presence.make} ${presence.model} is a known series. Ask which year. Do not substitute a sibling series.`;
    case "missing-series":
      return `SERIES MISSING — ${[presence.make, presence.model].filter(Boolean).join(" ") || "that series"} is not in the verified catalog. Say the series is missing. Do not substitute another series.`;
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
    const pModel = resolveCatalogModel(parsed.make || facts.make, parsed.model);
    const fModel = resolveCatalogModel(facts.make, facts.model);
    if (!modelsAlign(pModel, fModel) && !modelsAlign(parsed.model, facts.model)) {
      return true;
    }
  }

  if (parsed.year && facts.year && parsed.year !== facts.year) {
    return true;
  }

  return false;
}

function identityFromAsk(
  parsed: { year: string; make: string; model: string; floorplan: string },
  source: CoachIdentity["source"],
): CoachIdentity {
  const make = parsed.make ? resolveCatalogMake(parsed.make) : "";
  return {
    year: parsed.year,
    make,
    model: parsed.model
      ? resolveCatalogModel(parsed.make || make, parsed.model)
      : parsed.model,
    floorplan: parsed.floorplan,
    source,
  };
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
  // Current ask wins. History/extraText used to steal the last brand mention
  // ("Grand Design fifth-wheels…") and dump a named Lineage M lock.
  const fromQuery = parseCoachFromText(query);
  const queryNamesCoach = askNamesCoachIdentity(fromQuery);
  const parsed = queryNamesCoach
    ? fromQuery
    : parseCoachFromText(`${query}\n${extraText}`);
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
    return asked;
  }

  if (parsed.year && parsed.make && parsed.model) {
    const sameFamily =
      factsOk &&
      parsed.year === facts!.year &&
      norm(resolveCatalogMake(parsed.make)) ===
        norm(resolveCatalogMake(facts!.make));
    return {
      year: parsed.year,
      make: resolveCatalogMake(parsed.make),
      model: resolveCatalogModel(parsed.make, parsed.model),
      floorplan:
        parsed.floorplan ||
        (sameFamily ? facts!.floorplan || "" : ""),
      source: sameFamily && !parsed.floorplan && facts!.floorplan ? "mixed" : "message",
    };
  }

  // Yearless named coach. Same lock → inherit year; otherwise ground on the ask.
  if (parsed.make && parsed.model) {
    const sameMake =
      factsOk &&
      norm(resolveCatalogMake(parsed.make)) ===
        norm(resolveCatalogMake(facts!.make));
    const catalogModel = resolveCatalogModel(parsed.make, parsed.model);
    const sameModel =
      Boolean(sameMake) &&
      (modelsAlign(catalogModel, facts!.model) ||
        modelsAlign(parsed.model, facts!.model));
    const year =
      parsed.year ||
      (sameModel
        ? facts!.year
        : yearFromSameSeriesHistory(extraText, parsed.make, catalogModel));
    return {
      year,
      make: resolveCatalogMake(parsed.make),
      model: catalogModel,
      floorplan:
        parsed.floorplan || (sameModel ? facts!.floorplan || "" : ""),
      source: sameModel && !parsed.year ? "mixed" : "message",
    };
  }

  if (parsed.year && parsed.make && factsOk && parsed.year === facts!.year) {
    const sameMake =
      norm(resolveCatalogMake(parsed.make)) ===
      norm(resolveCatalogMake(facts!.make));
    if (sameMake) {
      return {
        year: facts!.year,
        make: resolveCatalogMake(facts!.make),
        model: facts!.model,
        floorplan: parsed.floorplan || facts!.floorplan || "",
        source: "mixed",
      };
    }
  }

  if (factsOk) {
    return {
      year: facts!.year,
      make: resolveCatalogMake(facts!.make),
      model: facts!.model,
      floorplan: facts!.floorplan || "",
      source: "facts",
    };
  }

  if (parsed.year && parsed.make) {
    return {
      year: parsed.year,
      make: resolveCatalogMake(parsed.make),
      model: parsed.model,
      floorplan: parsed.floorplan,
      source: "message",
    };
  }

  if (parsed.make && parsed.floorplan) {
    return identityFromAsk(parsed, "message");
  }

  return null;
}
