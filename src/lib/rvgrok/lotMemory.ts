/**
 * Live Voice lot memory.
 *
 * The realtime model fills query_lot from the conversation. This module
 * is the same merge the enrichment path uses, so a follow-up that names
 * no new filter keeps the last one, and a newly named identity replaces it.
 */

import {
  aggregateOwnLot,
  filterLabel,
  formatOwnLotBlock,
  ownLotIsUnavailable,
  ownLotUnitsMissingLength,
  parseOwnLotAsk,
  queryOwnLotUnits,
  resolvedUnitLength,
  type OwnLotFilter,
  type OwnLotSnapshot,
  type OwnLotUnit,
} from "./ownLotInventory.ts";
import {
  looksLikeOwnLotFollowUp,
  parseLotRank,
  type OwnLotSort,
} from "./ownLotAsk.ts";

export type LotMemory = {
  filter: OwnLotFilter;
  sort?: OwnLotSort;
  limit?: number;
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

const BODY_ALIASES: Record<string, string> = {
  "class a": "Class A",
  "class a gas": "Class A Gas",
  "class a diesel": "Class A Diesel",
  "class b": "Class B",
  "class c": "Class C",
  "class super c": "Class Super C",
  "super c": "Class Super C",
  "fifth wheel": "Fifth Wheel",
  "fifth wheel toy hauler": "Fifth Wheel Toy Hauler",
  "travel trailer": "Travel Trailer",
  "travel trailer toy hauler": "Travel Trailer Toy Hauler",
  "toy hauler": "Travel Trailer Toy Hauler",
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
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
  if (body) {
    filter.bodyType = BODY_ALIASES[body.toLowerCase()] || body;
  }
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
  location: string;
  stock_number: string;
  price: number | null;
  length_ft: number | null;
  length_source: "printed" | "floorplan" | "none";
};

export type QueryLotAnswer = {
  ok: boolean;
  none: boolean;
  unavailable?: boolean;
  reason?: string;
  matched: number;
  filter_label: string;
  units: QueryLotUnit[];
  no_length: QueryLotUnit[];
  speech: string;
  lotMemory: LotMemory | null;
};

function compactUnit(unit: OwnLotUnit): QueryLotUnit {
  const length = resolvedUnitLength(unit);
  return {
    year: unit.year,
    make: unit.make,
    model: unit.model,
    trim: unit.trim,
    body_type: unit.body_type,
    location: unit.location,
    stock_number: unit.stock_number,
    price: unit.price,
    length_ft: length.ft,
    length_source: length.source,
  };
}

export function answerQueryLotFromSnapshot(
  snapshot: OwnLotSnapshot,
  args: Record<string, unknown>,
  previous: LotMemory | null,
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
  const turn = mergeToolCall(args, previous);
  const limit = turn.limit ?? 12;
  const memory: LotMemory = {
    filter: turn.filter,
    sort: turn.sort,
    limit,
  };
  const counts = aggregateOwnLot(snapshot.units, turn.filter);
  const rows = queryOwnLotUnits(snapshot.units, turn.filter, limit, turn.sort);
  const lengthAsk =
    turn.sort?.by === "length" ||
    turn.filter.lengthFtMin != null ||
    turn.filter.lengthFtMax != null ||
    turn.filter.aroundLengthFt != null ||
    turn.filter.minLengthFt != null ||
    turn.filter.maxLengthFt != null;
  const noLength = lengthAsk
    ? ownLotUnitsMissingLength(snapshot.units, turn.filter)
    : [];
  const speech = formatOwnLotBlock(snapshot, "", {
    filter: turn.filter,
    sort: turn.sort,
    limit,
  });
  return {
    ok: true,
    none: counts.matched === 0,
    matched: counts.matched,
    filter_label: filterLabel(turn.filter),
    units: rows.map(compactUnit),
    no_length: noLength.map(compactUnit),
    speech,
    lotMemory: memory,
  };
}
