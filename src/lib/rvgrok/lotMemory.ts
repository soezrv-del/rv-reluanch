/**
 * Live Voice lot memory.
 *
 * The realtime model fills query_lot from the conversation. This module
 * is the same merge the enrichment path uses, so a follow-up that names
 * no new filter keeps the last one, and a newly named identity replaces it.
 */

import {
  ownLotIsUnavailable,
  parseOwnLotAsk,
  type OwnLotFilter,
  type OwnLotSnapshot,
  type OwnLotUnit,
} from "./ownLotInventory.ts";
import {
  isLotGoAhead,
  lotQueryHasSubject,
  lotQueryIsBareCount,
  lotQueryIsWholeLotAsk,
  lotQueryMissWords,
  lotQueryNamedWords,
  offeredCoachNames,
  reconcileLotArgs,
  searchLot,
  type LotQueryApplied,
  type LotQueryCounts,
  type LotQueryUnit,
} from "../lot/lotQuery.ts";
import { lotMissLine } from "./voiceTurnGate.ts";
import type { GaragePinBook } from "../lot/garagePins.ts";
import {
  looksLikeBareLotConfirm,
  looksLikeOwnLotFollowUp,
  parseLotRank,
  type OwnLotSort,
} from "./ownLotAsk.ts";
import { isLotListExpansion } from "../lot/lotSearch.ts";
import { parseCoachFromText } from "./parseCoach.ts";

export type LotMemory = {
  filter: OwnLotFilter;
  sort?: OwnLotSort;
  limit?: number;
  condition?: string;
  /** Fuel carried across follow-ups. Not the Class A Diesel body proxy. */
  fuel?: "" | "diesel" | "gas";
  milesMin?: number;
  milesMax?: number;
  garageFtMin?: number;
  garageFtMax?: number;
  /** The one unit the last question landed on. "You just told me we had one." */
  pinnedStock?: string;
};

export type LotTurn = LotMemory & {
  carried: boolean;
  replaced: boolean;
};

const LENGTH_KEYS = [
  "maxLengthFt",
  "maxLengthInclusive",
  "minLengthFt",
  "aroundLengthFt",
  "lengthFtMin",
  "lengthFtMax",
] as const;

const PRICE_KEYS = ["minPrice", "maxPrice", "aroundPrice"] as const;

function definedFilter(filter: OwnLotFilter): OwnLotFilter {
  const out: OwnLotFilter = {};
  for (const [key, value] of Object.entries(filter) as [
    keyof OwnLotFilter,
    OwnLotFilter[keyof OwnLotFilter],
  ][]) {
    if (value === undefined || value === false || value === "") continue;
    (out as Record<string, unknown>)[key] = value;
  }
  return out;
}

function hasIdentity(filter: OwnLotFilter): boolean {
  return Boolean(
    filter.stockNumber ||
      filter.year ||
      filter.yearMin != null ||
      filter.yearMax != null ||
      filter.make ||
      filter.model ||
      filter.trim ||
      filter.bodyType ||
      filter.location ||
      filter.dieselOnly ||
      filter.gasOnly ||
      filter.toyHauler,
  );
}

function hasConstraint(filter: OwnLotFilter): boolean {
  return Boolean(
    filter.minPrice != null ||
      filter.maxPrice != null ||
      filter.aroundPrice != null ||
      filter.maxLengthFt != null ||
      filter.minLengthFt != null ||
      filter.aroundLengthFt != null ||
      filter.lengthFtMin != null ||
      filter.lengthFtMax != null,
  );
}

function overlayFilter(previous: OwnLotFilter, parsed: OwnLotFilter): OwnLotFilter {
  const next: OwnLotFilter = { ...previous };
  if (LENGTH_KEYS.some((key) => parsed[key] != null)) {
    for (const key of LENGTH_KEYS) delete next[key];
  }
  if (PRICE_KEYS.some((key) => parsed[key] != null)) {
    for (const key of PRICE_KEYS) delete next[key];
  }
  if (parsed.bodyType) {
    delete next.dieselOnly;
    delete next.gasOnly;
  }
  if (parsed.dieselOnly) delete next.gasOnly;
  if (parsed.gasOnly) delete next.dieselOnly;
  return { ...next, ...parsed };
}

/**
 * Follow-ups that name no identity keep the last filter and overlay a
 * new length, price, or sort. A new body type, make, model, or store
 * replaces the previous filter.
 */
export function resolveLotTurn(
  text: string,
  previous: LotMemory | null,
  locations: string[] = [],
  units: OwnLotUnit[] = [],
): LotTurn {
  const parsed = definedFilter(parseOwnLotAsk(text, locations, units));
  const rank = parseLotRank(text);
  const anaphoric = looksLikeOwnLotFollowUp(text);
  const identity = hasIdentity(parsed);
  const constraint = hasConstraint(parsed);

  if (!previous) {
    return {
      filter: parsed,
      sort: rank.sort,
      limit: rank.limit,
      carried: false,
      replaced: false,
    };
  }

  if (identity && !anaphoric) {
    return {
      filter: parsed,
      sort: rank.sort,
      limit: rank.limit,
      carried: false,
      replaced: true,
    };
  }

  if (anaphoric || constraint || rank.sort || rank.limit != null) {
    return {
      filter: overlayFilter(previous.filter, parsed),
      sort: rank.sort ?? previous.sort,
      limit: rank.limit ?? previous.limit,
      carried: true,
      replaced: false,
    };
  }

  return {
    filter: parsed,
    sort: rank.sort,
    limit: rank.limit,
    carried: false,
    replaced: false,
  };
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function num(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export function filterFromToolArgs(args: Record<string, unknown>): OwnLotFilter {
  const filter: OwnLotFilter = {};
  const body = str(args.body_type);
  if (body) filter.bodyType = body;
  const make = str(args.make);
  if (make) filter.make = make;
  const model = str(args.model);
  if (model) filter.model = model;
  const location = str(args.location);
  if (location) filter.location = location;
  const yearMin = num(args.year_min);
  const yearMax = num(args.year_max);
  if (yearMin != null) filter.yearMin = yearMin;
  if (yearMax != null) filter.yearMax = yearMax;
  const priceMin = num(args.price_min);
  const priceMax = num(args.price_max);
  if (priceMin != null) filter.minPrice = priceMin;
  if (priceMax != null) filter.maxPrice = priceMax;
  const lengthMin = num(args.length_ft_min);
  const lengthMax = num(args.length_ft_max);
  if (lengthMin != null) filter.lengthFtMin = lengthMin;
  if (lengthMax != null) filter.lengthFtMax = lengthMax;
  return filter;
}

function rankFromToolArgs(args: Record<string, unknown>): {
  sort?: OwnLotSort;
  limit?: number;
} {
  const by = str(args.sort);
  const dir = str(args.order) === "desc" ? "desc" : "asc";
  const sort: OwnLotSort | undefined =
    by === "price" || by === "length" || by === "year" ? { by, dir } : undefined;
  const rawLimit = num(args.limit);
  const limit =
    rawLimit != null ? Math.min(24, Math.max(1, Math.round(rawLimit))) : undefined;
  return { sort, limit };
}

/** Tool args that name an identity replace the session filter. Sort-only calls keep it. */
export function mergeToolCall(
  args: Record<string, unknown>,
  previous: LotMemory | null,
): LotTurn {
  const parsed = filterFromToolArgs(args);
  const rank = rankFromToolArgs(args);
  const identity = hasIdentity(parsed);
  const constraint = hasConstraint(parsed);
  if (!previous || identity) {
    return {
      filter: parsed,
      sort: rank.sort,
      limit: rank.limit,
      carried: false,
      replaced: Boolean(previous && identity),
    };
  }
  if (constraint || rank.sort || rank.limit != null) {
    return {
      filter: overlayFilter(previous.filter, parsed),
      sort: rank.sort ?? previous.sort,
      limit: rank.limit ?? previous.limit,
      carried: true,
      replaced: false,
    };
  }
  return {
    filter: { ...previous.filter },
    sort: previous.sort,
    limit: previous.limit,
    carried: true,
    replaced: false,
  };
}

export type QueryLotUnit = {
  year: string;
  make: string;
  model: string;
  trim: string;
  body_type: string;
  condition: string;
  lot_status: string;
  location: string;
  stock_number: string;
  price: number | null;
  length_ft: number | null;
  length_source: "printed" | "floorplan" | "none";
  chassis?: string;
  gvwr?: string;
};

export type QueryLotAnswer = {
  ok: boolean;
  none: boolean;
  unavailable?: boolean;
  reason?: string;
  matched: number;
  filter_label: string;
  counts?: LotQueryCounts;
  units: QueryLotUnit[];
  no_length: QueryLotUnit[];
  summary?: string;
  /** Motorhome names with sheet label, chassis, and GVWR. The sheet count stays `matched`. */
  name_roster?: string[];
  did_you_mean?: string;
  close?: string;
  /** On a miss: up to 3 real sheet units that are closest. Not a match count. */
  closest_units?: string[];
  speech: string;
  lotMemory: LotMemory | null;
  /** Units in the snapshot before this question's filters. */
  lot_total?: number;
};

function closestUnitLine(unit: LotQueryUnit): string {
  const name = [unit.year, unit.make, unit.model, unit.trim].filter(Boolean).join(" ");
  const price = typeof unit.price === "number" && unit.price > 0 ? `$${Math.round(unit.price).toLocaleString("en-US")}` : "";
  const town = (unit.location || "").replace(/\s+[A-Z]{2}$/, "");
  return [name, price, town].filter(Boolean).join(", ");
}

function structuredSubject(args: Record<string, unknown>): boolean {
  return Boolean(
    str(args.make) ||
      str(args.model) ||
      str(args.body_type) ||
      str(args.condition) ||
      str(args.status) ||
      str(args.location) ||
      str(args.fuel) ||
      num(args.year_min) != null ||
      num(args.year_max) != null ||
      num(args.price_min) != null ||
      num(args.price_max) != null ||
      num(args.length_ft_min) != null ||
      num(args.length_ft_max) != null,
  );
}

function coachRecallFromAside(prior: string, previous: LotMemory | null): string {
  const text = prior.trim();
  if (!text || /^matching units\b/i.test(text) || /^none\b/i.test(text)) return "";
  const parsed = parseCoachFromText(text);
  const make = parsed.make.trim();
  const model = (parsed.model.trim().split(/\s+/)[0] || "").replace(/[^a-z0-9]/gi, "");
  if (!make || model.length < 3) return "";
  const carried = `${previous?.filter.make || ""} ${previous?.filter.model || ""}`.toLowerCase();
  if (carried.includes(model.toLowerCase())) return "";
  return [parsed.year.trim(), make, model].filter(Boolean).join(" ");
}

/** "Any of those in stock" after a spec answer, not after a lot readout. */
function looksLikeThoseStockAsk(text: string): boolean {
  const t = text.trim();
  if (!/\b(?:those|these|them|that one|the one)\b/i.test(t)) return false;
  return /\b(?:in stock|on (?:the |our )?lot|inventory|do we have|have any)\b/i.test(t);
}

function queryFilterLabel(applied: LotQueryApplied): string {
  const bits = [
    applied.condition,
    applied.fuel,
    applied.body_type,
    applied.make,
    applied.model,
    applied.location,
    applied.year_min != null ? `year ≥ ${applied.year_min}` : "",
    applied.year_max != null ? `year ≤ ${applied.year_max}` : "",
    applied.price_min != null ? `min $${applied.price_min}` : "",
    applied.price_max != null ? `max $${applied.price_max}` : "",
    applied.length_ft_min != null ? `length ≥ ${applied.length_ft_min} ft` : "",
    applied.length_ft_max != null ? `length ≤ ${applied.length_ft_max} ft` : "",
    applied.horsepower != null ? `${applied.horsepower} horsepower` : "",
    applied.displacement ? `displacement ${applied.displacement}` : "",
    applied.miles_min != null && applied.miles_max != null
      ? `${applied.miles_min} to ${applied.miles_max} miles`
      : "",
  ].filter(Boolean);
  return bits.length ? bits.join(" · ") : "all units";
}

export function answerQueryLotFromSnapshot(
  snapshot: OwnLotSnapshot,
  args: Record<string, unknown>,
  previous: LotMemory | null,
  utterance = "",
  priorAssistant = "",
  garagePins?: GaragePinBook,
): QueryLotAnswer {
  if (ownLotIsUnavailable(snapshot)) {
    return {
      ok: false,
      none: true,
      unavailable: true,
      reason: snapshot.reason || "lot snapshot unavailable",
      matched: 0,
      filter_label: "",
      units: [],
      no_length: [],
      speech:
        "None. The lot snapshot is unavailable. Do not invent a unit or a count of zero.",
      lotMemory: previous,
    };
  }
  if (args.body_type == null && args.bodyType != null) args.body_type = args.bodyType;
  if (args.price_min == null && (args.minPrice != null || args.priceMin != null)) {
    args.price_min = args.minPrice ?? args.priceMin;
  }
  if (args.price_max == null && (args.maxPrice != null || args.priceMax != null)) {
    args.price_max = args.maxPrice ?? args.priceMax;
  }
  let query = str(args.query);
  let spoken = str(utterance) || str(args.utterance);
  let prior = previous;
  const recalled = coachRecallFromAside(priorAssistant, prior);
  if (recalled && looksLikeThoseStockAsk(spoken || query)) {
    spoken = recalled;
    query = recalled;
    prior = null;
    args = { ...args, query: recalled, make: "", model: "", body_type: "" };
  }
  if (prior?.pinnedStock && /\byou (?:just )?(?:told|said)\b/i.test(`${spoken} ${query}`)) {
    const stock = prior.pinnedStock;
    spoken = stock;
    query = stock;
    prior = null;
    args = { ...args, query: stock, make: "", model: "", body_type: "" };
  }
  // "Yes" after she offered to check the lot for the Navion and the EKKO 23B
  // is a search for those names. It is not the last coach again, and it is
  // not a reason to answer from memory.
  const goAheadText = spoken || query;
  if (goAheadText && isLotGoAhead(goAheadText)) {
    const carriedNames = normalizeName(
      `${prior?.filter.make || ""} ${prior?.filter.model || ""} ${prior?.filter.trim || ""}`,
    );
    const isNew = (name: string) => {
      const head = normalizeName(name).split(" ")[0] || "";
      return Boolean(head) && !carriedNames.split(" ").includes(head);
    };
    const offered = offeredCoachNames(priorAssistant, snapshot.units).filter(isNew);
    const toolQuery = str(args.query);
    const toolNames =
      toolQuery && !isLotGoAhead(toolQuery) && lotQueryHasSubject(toolQuery) ? toolQuery : "";
    const titled = toolNames.replace(/\b[a-z]/g, (c) => c.toUpperCase());
    const toolOffered = toolNames ? offeredCoachNames(titled, snapshot.units).filter(isNew) : [];
    const names = offered.length
      ? offered.join(" or ")
      : toolOffered.length
        ? toolNames
        : "";
    if (names) {
      spoken = names;
      query = names;
      prior = null;
      args = { ...args, query: names, make: "", model: "", body_type: "" };
    }
  }
  const text = spoken || query;
  const saidRank = parseLotRank(text);
  const toolRank = rankFromToolArgs(args);
  const sort = toolRank.sort ?? saidRank.sort;
  const hasIdentityArg = Boolean(
    str(args.make) ||
      str(args.model) ||
      str(args.body_type) ||
      str(args.location) ||
      str(args.fuel),
  );
  const hasConstraintArg =
    num(args.year_min) != null ||
    num(args.year_max) != null ||
    num(args.price_min) != null ||
    num(args.price_max) != null ||
    num(args.length_ft_min) != null ||
    num(args.length_ft_max) != null ||
    Boolean(str(args.condition));
  const textHasSubject = Boolean(
    (query && lotQueryHasSubject(query)) || (spoken && lotQueryHasSubject(spoken)),
  );
  // "in inventory" is the same full-lot count as "in stock" / "on the lot".
  // A model price or make stuffed onto that sentence does not shrink it.
  const referBack = looksLikeOwnLotFollowUp(text);
  // "Testing, how many coaches are sitting on the lot right now" is the same
  // whole-lot count. Spare words are not a model filter.
  const wordsBare =
    Boolean(text) &&
    (lotQueryIsBareCount(text) || lotQueryIsWholeLotAsk(text, snapshot.units)) &&
    !referBack;
  const listAll = isLotListExpansion(text);
  const isBare =
    !listAll &&
    !referBack &&
    (wordsBare ||
      (!hasIdentityArg &&
        !hasConstraintArg &&
        !sort &&
        !saidRank.sort &&
        lotQueryIsBareCount(query || text) &&
        (!text || lotQueryIsBareCount(text))));
  // A follow-up, or a sort/length/price tool call with no new coach, keeps
  // the last filter. A bare "how many RVs" does not. "The full list" keeps it.
  const followUp = Boolean(
    prior &&
      !isBare &&
      (listAll || looksLikeOwnLotFollowUp(text) || (!textHasSubject && !hasIdentityArg)),
  );
  const limit =
    toolRank.limit ?? saidRank.limit ?? (followUp ? prior?.limit : undefined) ?? 12;
  const fresh = !followUp && !isBare && (textHasSubject || structuredSubject(args));
  // A bare count ("how many RVs do we have on the lot right now") names no
  // filter and does not follow up on the last one: count the whole lot, as
  // before #556. Do not search the spoken words or carry a stale filter.
  const bareCount = isBare && Boolean(text || !prior);
  const carried = followUp ? prior : null;
  const carriedCoach = Boolean(
    carried?.filter.make || carried?.filter.model || carried?.filter.bodyType,
  );
  // "Yes" after a miss is not permission to read every coach on the lot.
  if (looksLikeBareLotConfirm(text) && !carriedCoach) {
    const speech = "Which coach? Yes does not open the whole lot.";
    return {
      ok: true,
      none: true,
      matched: 0,
      filter_label: "",
      units: [],
      no_length: [],
      summary: speech,
      speech,
      lotMemory: prior ?? { filter: {}, limit },
      lot_total: snapshot.units.length,
    };
  }
  const searchArgs = reconcileLotArgs({
    query: bareCount ? "" : text,
    make: str(args.make) || carried?.filter.make,
    model:
      str(args.model) ||
      [carried?.filter.model, carried?.filter.trim].filter(Boolean).join(" "),
    body_type: str(args.body_type) || carried?.filter.bodyType,
    condition: str(args.condition) || (followUp ? carried?.condition : ""),
    status: str(args.status),
    location: str(args.location) || carried?.filter.location,
    fuel: str(args.fuel) || (followUp ? carried?.fuel : ""),
    year_min:
      num(args.year_min) ??
      carried?.filter.yearMin ??
      (carried?.filter.year ? Number(carried.filter.year) : undefined),
    year_max:
      num(args.year_max) ??
      carried?.filter.yearMax ??
      (carried?.filter.year ? Number(carried.filter.year) : undefined),
    price_min: num(args.price_min) ?? carried?.filter.minPrice,
    price_max: num(args.price_max) ?? carried?.filter.maxPrice,
    length_ft_min:
      num(args.length_ft_min) ??
      carried?.filter.lengthFtMin ??
      (carried?.filter.aroundLengthFt != null
        ? carried.filter.aroundLengthFt - 2
        : carried?.filter.minLengthFt),
    length_ft_max:
      num(args.length_ft_max) ??
      carried?.filter.lengthFtMax ??
      (carried?.filter.aroundLengthFt != null
        ? carried.filter.aroundLengthFt + 2
        : carried?.filter.maxLengthFt),
    sort: sort?.by,
    order: sort?.dir,
    limit,
    ...(text && !bareCount
      ? {
          utterance: text,
          follow_up: followUp,
          carry_body_type: carried?.filter.bodyType,
          carry_condition: carried?.condition,
          carry_price_min: carried?.filter.minPrice,
          carry_price_max: carried?.filter.maxPrice,
          carry_make: carried?.filter.make,
          carry_model: carried?.filter.model,
          carry_fuel: carried?.fuel,
          carry_location: carried?.filter.location,
          carry_year_min: carried?.filter.yearMin,
          carry_year_max: carried?.filter.yearMax,
          carry_length_ft_min: carried?.filter.lengthFtMin,
          carry_length_ft_max: carried?.filter.lengthFtMax,
          carry_miles_min: carried?.milesMin,
          carry_miles_max: carried?.milesMax,
          carry_garage_ft_min: carried?.garageFtMin,
          carry_garage_ft_max: carried?.garageFtMax,
        }
      : {}),
  });
  let found = searchLot(snapshot.units, bareCount ? { limit } : { ...searchArgs, garage_pins: garagePins });
  // A miss is never a terminal "None." Search once more on only the filters
  // (class, price, year, length, store, make) without the spoken words or a
  // model. Spare words that zeroed the search give way to that result. A real
  // name that is not on the sheet gets a friendly line, then the closest real
  // units or an honest "can't find one". Counts still come only from the sheet.
  let missSpeech = "";
  let closest: string[] = [];
  if (!bareCount && found.matched === 0 && !found.name_roster?.length) {
    const named = lotQueryNamedWords(text, snapshot.units);
    const modelArg = str(searchArgs.model);
    // Keep the class, price, year, store, and make he said; drop only the
    // words that are on no coach (or every name word when none of them miss).
    const misses = lotQueryMissWords(text, snapshot.units);
    const dropped = misses.length ? misses : named;
    const kept = named.filter((word) => !dropped.includes(word));
    const remainder = text
      .split(/\s+/)
      .filter((word) => {
        const w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
        return !dropped.includes(w) && !dropped.includes(w.replace(/e?s$/, ""));
      })
      .join(" ");
    const retry = searchLot(snapshot.units, {
      query: remainder,
      utterance: remainder,
      make: searchArgs.make,
      body_type: searchArgs.body_type,
      condition: searchArgs.condition,
      status: searchArgs.status,
      location: searchArgs.location,
      fuel: searchArgs.fuel,
      year_min: searchArgs.year_min,
      year_max: searchArgs.year_max,
      price_min: searchArgs.price_min,
      price_max: searchArgs.price_max,
      length_ft_min: searchArgs.length_ft_min,
      length_ft_max: searchArgs.length_ft_max,
      sort: searchArgs.sort,
      order: searchArgs.order,
      limit,
      garage_pins: garagePins,
    });
    if (retry.matched > 0 && !named.length && !modelArg) {
      found = retry;
    } else {
      const line = lotMissLine(text || str(searchArgs.query) || modelArg);
      const nameAsk = found.did_you_mean || found.close;
      if (nameAsk) {
        missSpeech = `${line} It's not on our sheet by that name. Did you mean ${nameAsk}?`;
      } else if (
        retry.matched > 0 &&
        retry.matched < retry.lot_total &&
        Boolean(
          kept.length ||
            retry.applied.body_type ||
            retry.applied.make ||
            retry.applied.price_min != null ||
            retry.applied.price_max != null ||
            retry.applied.length_ft_min != null ||
            retry.applied.length_ft_max != null,
        )
      ) {
        closest = retry.units.slice(0, 3).map(closestUnitLine);
        missSpeech = `${line} I can't find that exact one. Closest on our lot: ${closest.join("; ")}.`;
      } else {
        missSpeech = `${line} ${named.length || modelArg ? "I can't find that one on our sheet." : "I can't find one on our sheet with those filters."}`;
      }
    }
  }
  const applied = found.applied;
  const memory: LotMemory = bareCount
    ? { filter: {}, limit }
    : {
        filter: {
          ...(str(searchArgs.make) || applied.make
            ? { make: str(searchArgs.make) || applied.make }
            : {}),
          ...(str(searchArgs.model) || applied.model
            ? { model: str(searchArgs.model) || applied.model }
            : {}),
          ...(applied.body_type ? { bodyType: applied.body_type } : {}),
          ...(applied.location ? { location: applied.location } : {}),
          ...(applied.year_min != null ? { yearMin: applied.year_min } : {}),
          ...(applied.year_max != null ? { yearMax: applied.year_max } : {}),
          ...(applied.price_min != null ? { minPrice: applied.price_min } : {}),
          ...(applied.price_max != null ? { maxPrice: applied.price_max } : {}),
          ...(applied.length_ft_min != null ? { lengthFtMin: applied.length_ft_min } : {}),
          ...(applied.length_ft_max != null ? { lengthFtMax: applied.length_ft_max } : {}),
        },
        ...(applied.fuel ? { fuel: applied.fuel } : {}),
        ...(applied.condition ? { condition: applied.condition } : {}),
        ...(applied.miles_min != null || applied.miles_max != null
          ? { milesMin: applied.miles_min, milesMax: applied.miles_max }
          : {}),
        ...(applied.garage_skipped != null ||
        (searchArgs.garage_ft_min != null || searchArgs.garage_ft_max != null)
          ? {
              garageFtMin: searchArgs.garage_ft_min,
              garageFtMax: searchArgs.garage_ft_max,
            }
          : {}),
        ...(searchArgs.sort === "price" ||
        searchArgs.sort === "length" ||
        searchArgs.sort === "year" ||
        searchArgs.sort === "type"
          ? {
              sort: {
                by: searchArgs.sort,
                dir: searchArgs.order === "desc" ? ("desc" as const) : ("asc" as const),
              },
            }
          : followUp && prior?.sort
            ? { sort: prior.sort }
            : {}),
        limit,
        ...(found.matched === 1 && found.units[0]?.stock_number
          ? { pinnedStock: found.units[0].stock_number }
          : {}),
      };
  let speech = missSpeech || found.summary;
  if (found.no_length.length) {
    const stocks = found.no_length.map((unit) => `stk ${unit.stock_number}`).join(", ");
    speech = `${speech} No length on file (not guessed): ${stocks}.`;
  }
  let filter_label = bareCount ? "all units" : queryFilterLabel(applied);
  if (!bareCount && filter_label === "all units" && found.matched !== found.lot_total) {
    filter_label = applied.model || applied.body_type || "filtered";
  }
  return {
    ok: true,
    none: found.matched === 0,
    matched: found.matched,
    filter_label,
    counts: found.counts,
    units: found.units.map((unit) => ({
      ...unit,
      length_ft: unit.length_ft,
      length_source: unit.length_source,
    })),
    no_length: found.no_length,
    summary: missSpeech || found.summary,
    ...(closest.length ? { closest_units: closest } : {}),
    ...(found.name_roster?.length ? { name_roster: found.name_roster } : {}),
    ...(found.did_you_mean ? { did_you_mean: found.did_you_mean } : {}),
    ...(found.close ? { close: found.close } : {}),
    ...(found.feature_blank ? { feature_blank: found.feature_blank } : {}),
    speech,
    lotMemory: memory,
    lot_total: found.lot_total,
  };
}
