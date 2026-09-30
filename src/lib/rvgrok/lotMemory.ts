/**
 * Live Voice lot memory.
 *
 * The realtime model fills query_lot from the conversation. This module
 * is the same merge the enrichment path uses, so a follow-up that names
 * no new filter keeps the last one, and a newly named identity replaces it.
 */

import {
  filterLabel,
  ownLotIsUnavailable,
  parseOwnLotAsk,
  type OwnLotFilter,
  type OwnLotSnapshot,
  type OwnLotUnit,
} from "./ownLotInventory.ts";
import {
  lotQueryHasSubject,
  lotQueryIsBareCount,
  reconcileLotArgs,
  searchLot,
  spokenLotBody,
  type LotQueryCounts,
} from "../lot/lotQuery.ts";
import {
  looksLikeOwnLotFollowUp,
  parseLotRank,
  type OwnLotSort,
} from "./ownLotAsk.ts";

export type LotMemory = {
  filter: OwnLotFilter;
  sort?: OwnLotSort;
  limit?: number;
  condition?: string;
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
  did_you_mean?: string;
  close?: string;
  speech: string;
  lotMemory: LotMemory | null;
};

function structuredSubject(args: Record<string, unknown>): boolean {
  return Boolean(
    str(args.make) ||
      str(args.model) ||
      str(args.body_type) ||
      str(args.condition) ||
      str(args.status) ||
      str(args.location) ||
      num(args.year_min) != null ||
      num(args.year_max) != null ||
      num(args.price_min) != null ||
      num(args.price_max) != null,
  );
}

export function answerQueryLotFromSnapshot(
  snapshot: OwnLotSnapshot,
  args: Record<string, unknown>,
  previous: LotMemory | null,
  utterance = "",
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
  const query = str(args.query);
  const fresh = lotQueryHasSubject(query) || structuredSubject(args);
  const spoken = str(utterance) || str(args.utterance);
  const followUp = Boolean(spoken && previous && looksLikeOwnLotFollowUp(spoken));
  // A bare count ("how many RVs do we have on the lot right now") names no
  // filter and does not follow up on the last one: count the whole lot, as
  // before #556. Do not search the spoken words or carry a stale filter.
  const bareCount =
    !fresh &&
    !followUp &&
    !rankFromToolArgs(args).sort &&
    lotQueryIsBareCount(query) &&
    (!spoken || lotQueryIsBareCount(spoken)) &&
    Boolean(spoken || !previous);
  const turn = bareCount
    ? { filter: {}, limit: rankFromToolArgs(args).limit, carried: false, replaced: Boolean(previous) }
    : fresh
      ? {
          filter: filterFromToolArgs(args),
          ...rankFromToolArgs(args),
          carried: false,
          replaced: Boolean(previous),
        }
      : mergeToolCall(args, previous);
  const limit = turn.limit ?? 12;
  const searchArgs = reconcileLotArgs({
    query: bareCount ? "" : fresh ? query : spoken || query,
    make: turn.filter.make,
    model: [turn.filter.model, turn.filter.trim].filter(Boolean).join(" "),
    body_type: turn.filter.bodyType,
    condition: str(args.condition),
    status: str(args.status),
    location: turn.filter.location,
    year_min: turn.filter.yearMin ?? (turn.filter.year ? Number(turn.filter.year) : undefined),
    year_max: turn.filter.yearMax ?? (turn.filter.year ? Number(turn.filter.year) : undefined),
    price_min: num(args.price_min) ?? turn.filter.minPrice,
    price_max: num(args.price_max) ?? turn.filter.maxPrice,
    length_ft_min:
      turn.filter.lengthFtMin ??
      (turn.filter.aroundLengthFt != null
        ? turn.filter.aroundLengthFt - 2
        : turn.filter.minLengthFt),
    length_ft_max:
      turn.filter.lengthFtMax ??
      (turn.filter.aroundLengthFt != null
        ? turn.filter.aroundLengthFt + 2
        : turn.filter.maxLengthFt),
    sort: turn.sort?.by,
    order: turn.sort?.dir,
    limit,
    ...(spoken && !bareCount
      ? {
          utterance: spoken,
          follow_up: followUp,
          carry_body_type: previous?.filter.bodyType,
          carry_condition: previous?.condition,
          carry_price_min: previous?.filter.minPrice,
          carry_price_max: previous?.filter.maxPrice,
          carry_make: previous?.filter.make,
          carry_model: previous?.filter.model,
        }
      : {}),
  });
  const saidBody = spokenLotBody(spoken);
  const saidCondition = /\bused\b/i.test(spoken)
    ? "used"
    : /\bnew\b/i.test(spoken)
      ? "new"
      : "";
  const memory: LotMemory = {
    filter: {
      ...turn.filter,
      bodyType: saidBody || (followUp ? previous?.filter.bodyType : searchArgs.body_type) || undefined,
      make: searchArgs.make || undefined,
      model: searchArgs.model || undefined,
      minPrice: searchArgs.price_min,
      maxPrice: searchArgs.price_max,
    },
    sort:
      searchArgs.sort === "price" ||
      searchArgs.sort === "length" ||
      searchArgs.sort === "year" ||
      searchArgs.sort === "type"
        ? { by: searchArgs.sort, dir: searchArgs.order === "desc" ? "desc" : "asc" }
        : turn.sort,
    limit,
    ...(saidCondition
      ? { condition: saidCondition }
      : followUp && previous?.condition
        ? { condition: previous.condition }
        : {}),
  };
  const found = searchLot(snapshot.units, searchArgs);
  let speech = found.summary;
  if (found.no_length.length) {
    const stocks = found.no_length.map((unit) => `stk ${unit.stock_number}`).join(", ");
    speech = `${speech} No length on file (not guessed): ${stocks}.`;
  }
  return {
    ok: true,
    none: found.matched === 0,
    matched: found.matched,
    filter_label: filterLabel(turn.filter),
    counts: found.counts,
    units: found.units.map((unit) => ({
      ...unit,
      length_ft: unit.length_ft,
      length_source: unit.length_source,
    })),
    no_length: found.no_length,
    summary: found.summary,
    ...(found.did_you_mean ? { did_you_mean: found.did_you_mean } : {}),
    ...(found.close ? { close: found.close } : {}),
    speech,
    lotMemory: memory,
  };
}
