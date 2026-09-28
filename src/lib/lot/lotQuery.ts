/**
 * One own-lot search for Live Voice `query_lot` and text chat.
 * Browser-safe: no disk IO. Callers pass units already read from the scrape.
 */

import {
  lotTokenMatchesUnit,
  normalizeLotSearchQuery,
  singularizeLotToken,
  tokenizeLotQuery,
  type LotSearchable,
} from "./lotSearch.ts";

export type LotQueryUnit = {
  year?: string;
  make?: string;
  model?: string;
  trim?: string;
  series?: string;
  body_type?: string;
  location?: string;
  stock_number?: string;
  vin?: string;
  price?: number | null;
  lengthFt?: number | null;
  condition?: string;
  lot_status?: string;
  title?: string;
};

export type LotQueryArgs = {
  query?: string;
  make?: string;
  model?: string;
  body_type?: string;
  condition?: string;
  status?: string;
  location?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  length_ft_min?: number;
  length_ft_max?: number;
  sort?: string;
  order?: string;
  limit?: number;
};

export type LotQueryRow = {
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

export type LotQueryCounts = {
  body_type: Record<string, number>;
  condition: Record<string, number>;
  location: Record<string, number>;
  model: Record<string, number>;
  status: Record<string, number>;
};

export type LotQueryResult = {
  ok: true;
  matched: number;
  none: boolean;
  counts: LotQueryCounts;
  units: LotQueryRow[];
  no_length: LotQueryRow[];
  summary: string;
  did_you_mean?: string;
};

type BodySpec =
  | { kind: "any" }
  | { kind: "motorhome" }
  | { kind: "toy" }
  | { kind: "labels"; labels: string[] };

const STOP = new Set([
  "a",
  "about",
  "an",
  "and",
  "any",
  "are",
  "around",
  "at",
  "be",
  "can",
  "cheapest",
  "could",
  "did",
  "do",
  "does",
  "first",
  "foot",
  "footer",
  "footers",
  "feet",
  "for",
  "ft",
  "got",
  "have",
  "has",
  "hello",
  "hey",
  "hi",
  "how",
  "i",
  "in",
  "inventory",
  "is",
  "it",
  "its",
  "just",
  "least",
  "longest",
  "lot",
  "many",
  "me",
  "newest",
  "of",
  "oldest",
  "on",
  "ones",
  "or",
  "order",
  "our",
  "please",
  "price",
  "priciest",
  "shortest",
  "show",
  "stock",
  "tell",
  "that",
  "the",
  "them",
  "there",
  "these",
  "this",
  "those",
  "to",
  "top",
  "we",
  "what",
  "which",
  "with",
  "you",
]);

const STATUS_PHRASES = ["sale pending", "on order", "in transit", "available", "sold"];

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

/** Lowercase, drop possessives, keep "29 V" / "29-V" as 29V. Shared with the Lot page. */
export function normalizeLotQueryText(raw: string): string {
  return normalizeLotSearchQuery(raw);
}

function take(phrase: string, re: RegExp): { hit: boolean; rest: string } {
  if (!re.test(phrase)) return { hit: false, rest: phrase };
  return {
    hit: true,
    rest: phrase.replace(re, " ").replace(/\s+/g, " ").trim(),
  };
}

export function bodySpecFromText(raw: string): { spec: BodySpec; rest: string } {
  let rest = normalizeLotQueryText(raw);
  const motor = take(rest, /\bmotorhome\b/);
  if (motor.hit) return { spec: { kind: "motorhome" }, rest: motor.rest };

  const toy = take(rest, /\btoy hauler\b/);
  const fifth = take(toy.rest, /\bfifth wheel\b/);
  const travel = take(fifth.rest, /\btravel trailer\b/);
  rest = travel.rest;
  if (toy.hit && fifth.hit) {
    return { spec: { kind: "labels", labels: ["Fifth Wheel Toy Hauler"] }, rest };
  }
  if (toy.hit && travel.hit) {
    return { spec: { kind: "labels", labels: ["Travel Trailer Toy Hauler"] }, rest };
  }
  if (toy.hit) return { spec: { kind: "toy" }, rest };
  if (fifth.hit) return { spec: { kind: "labels", labels: ["Fifth Wheel"] }, rest };
  if (travel.hit) return { spec: { kind: "labels", labels: ["Travel Trailer"] }, rest };

  const superC = take(rest, /\b(?:class\s+)?super c\b/);
  if (superC.hit) {
    return { spec: { kind: "labels", labels: ["Class Super C"] }, rest: superC.rest };
  }
  const diesel = take(rest, /\bclass a diesel\b/);
  if (diesel.hit) {
    return { spec: { kind: "labels", labels: ["Class A Diesel"] }, rest: diesel.rest };
  }
  const gas = take(rest, /\bclass a gas\b/);
  if (gas.hit) {
    return { spec: { kind: "labels", labels: ["Class A Gas"] }, rest: gas.rest };
  }
  const classA = take(rest, /\bclass a\b/);
  if (classA.hit) {
    return {
      spec: { kind: "labels", labels: ["Class A", "Class A Gas", "Class A Diesel"] },
      rest: classA.rest,
    };
  }
  const classB = take(rest, /\bclass b\b/);
  if (classB.hit) {
    return { spec: { kind: "labels", labels: ["Class B"] }, rest: classB.rest };
  }
  const classC = take(rest, /\bclass c\b/);
  if (classC.hit) {
    return {
      spec: { kind: "labels", labels: ["Class C", "Class Super C"] },
      rest: classC.rest,
    };
  }
  return { spec: { kind: "any" }, rest };
}

function labelsOf(spec: BodySpec, present: string[]): string[] | null {
  if (spec.kind === "any") return null;
  if (spec.kind === "motorhome") {
    return present.filter((label) => isMotorhome(label));
  }
  if (spec.kind === "toy") {
    return present.filter((label) => /toy\s*hauler/i.test(label));
  }
  return spec.labels;
}

function intersectBody(a: BodySpec, b: BodySpec, present: string[]): BodySpec {
  if (a.kind === "any") return b;
  if (b.kind === "any") return a;
  const left = new Set((labelsOf(a, present) || []).map((label) => label.toLowerCase()));
  const right = labelsOf(b, present) || [];
  const labels = right.filter((label) => left.has(label.toLowerCase()));
  return { kind: "labels", labels };
}

function isMotorhome(body: string): boolean {
  const n = body.toLowerCase();
  return (
    /^class a\b/.test(n) ||
    /^class b\b/.test(n) ||
    /^class c\b/.test(n) ||
    /^class super c\b/.test(n)
  );
}

function bodyMatches(body: string, spec: BodySpec): boolean {
  const n = (body || "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!n) return spec.kind === "any";
  if (spec.kind === "any") return true;
  if (spec.kind === "motorhome") return isMotorhome(n);
  if (spec.kind === "toy") return /toy hauler/.test(n);
  return spec.labels.some((label) => n === label.toLowerCase());
}

function consumeCondition(phrase: string, arg: string): { condition: string; rest: string } {
  let rest = phrase;
  let condition = arg.toLowerCase();
  if (condition !== "new" && condition !== "used") condition = "";
  if (/\bused\b/.test(rest)) {
    rest = rest.replace(/\bused\b/g, " ");
    if (!condition) condition = "used";
  } else if (/\bnew\b/.test(rest)) {
    rest = rest.replace(/\bnew\b/g, " ");
    if (!condition) condition = "new";
  }
  return { condition, rest: rest.replace(/\s+/g, " ").trim() };
}

function consumeStatus(phrase: string, arg: string): { status: string; rest: string } {
  let rest = phrase;
  let status = arg.toLowerCase();
  for (const phraseStatus of STATUS_PHRASES) {
    if (rest.includes(phraseStatus)) {
      rest = rest.replace(phraseStatus, " ");
      if (!status) status = phraseStatus;
    }
  }
  return { status, rest: rest.replace(/\s+/g, " ").trim() };
}

function stripLengthTalk(phrase: string): string {
  return phrase
    .replace(
      /\b(?:around|about|under|over|below|above)?\s*\d{1,2}\s*(?:foot|feet|ft|footer|footers)\b/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function identityTokens(phrase: string, places: Set<string>): string[] {
  const cleaned = stripLengthTalk(phrase);
  const out: string[] = [];
  for (const token of cleaned.split(/\s+/)) {
    if (!token || STOP.has(token)) continue;
    if (places.has(token)) continue;
    if (/^\d{1,2}$/.test(token)) continue;
    if (token.length < 2 && !/\d/.test(token)) continue;
    out.push(token);
  }
  return out;
}

function mentionedPlaces(phrase: string, places: Set<string>): string[] {
  return [
    ...new Set(
      stripLengthTalk(phrase)
        .split(/\s+/)
        .filter((token) => token.length >= 4 && places.has(token) && !STOP.has(token)),
    ),
  ];
}

function locationWords(units: LotQueryUnit[]): Set<string> {
  const words = new Set<string>();
  for (const unit of units) {
    for (const word of (unit.location || "").toLowerCase().split(/[^a-z]+/)) {
      if (word.length >= 4) words.add(singularizeLotToken(word));
    }
  }
  return words;
}

function conditionMatches(unit: LotQueryUnit, condition: string): boolean {
  if (!condition) return true;
  return (unit.condition || "").toLowerCase() === condition;
}

function statusMatches(unit: LotQueryUnit, status: string): boolean {
  if (!status) return true;
  return (unit.lot_status || "").toLowerCase().includes(status);
}

function locationMatches(unit: LotQueryUnit, location: string, places: string[]): boolean {
  const ul = (unit.location || "").toLowerCase();
  if (location) {
    const fl = location.toLowerCase();
    if (!ul || (!ul.includes(fl) && !fl.includes(ul))) return false;
  }
  return places.every((place) => ul.includes(place));
}

function yearMatches(unit: LotQueryUnit, min?: number, max?: number): boolean {
  if (min == null && max == null) return true;
  const year = Number(unit.year);
  if (!Number.isFinite(year) || year <= 0) return false;
  if (min != null && year < min) return false;
  if (max != null && year > max) return false;
  return true;
}

function priceMatches(unit: LotQueryUnit, min?: number, max?: number): boolean {
  if (min == null && max == null) return true;
  if (unit.price == null) return false;
  if (min != null && unit.price < min) return false;
  if (max != null && unit.price > max) return false;
  return true;
}

export function lotUnitLength(unit: LotQueryUnit): {
  ft: number | null;
  source: "printed" | "floorplan" | "none";
} {
  if (unit.lengthFt != null && unit.lengthFt > 0) {
    return { ft: unit.lengthFt, source: "printed" };
  }
  const m = (unit.trim || "").trim().match(/^(\d{2})(?!\d)/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isInteger(n) && n >= 18 && n <= 45) {
      return { ft: n, source: "floorplan" };
    }
  }
  return { ft: null, source: "none" };
}

function asSearchable(unit: LotQueryUnit): LotSearchable {
  const series = unit.series || "";
  return {
    year: unit.year || "",
    make: unit.make || "",
    model: [unit.model, series].filter(Boolean).join(" "),
    trim: unit.trim || "",
    stock_number: unit.stock_number || "",
    body_type: unit.body_type || "",
    location: unit.location || "",
    vin: unit.vin || "",
    condition: unit.condition || "",
    lot_status: unit.lot_status || "",
    title: [
      unit.year,
      unit.make,
      unit.model,
      series,
      unit.trim,
      unit.body_type,
      unit.title,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function tokenHitsIdentity(unit: LotQueryUnit, token: string): boolean {
  return lotTokenMatchesUnit(asSearchable(unit), token);
}

/** Stop-word-free tokens for the dumb bar. Same matcher the Lot page uses. */
function plainTypeaheadTokens(text: string): string[] {
  return tokenizeLotQuery(text).filter((token) => !STOP.has(token));
}

function editDistanceAtMost1(a: string, b: string): boolean {
  if (a === b) return false;
  const delta = a.length - b.length;
  if (Math.abs(delta) > 1) return false;
  if (a.length === b.length) {
    let diffs = 0;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diffs++;
    return diffs === 1;
  }
  const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
  let i = 0;
  let j = 0;
  let skips = 0;
  while (i < shorter.length && j < longer.length) {
    if (shorter[i] === longer[j]) {
      i++;
      j++;
    } else {
      skips++;
      j++;
      if (skips > 1) return false;
    }
  }
  return true;
}

type CatalogName = { key: string; display: string; count: number };

function catalogNames(units: LotQueryUnit[]): CatalogName[] {
  const map = new Map<string, CatalogName>();
  const bump = (display: string) => {
    const pretty = display.trim();
    if (!pretty) return;
    const key = normalizeLotQueryText(pretty);
    if (key.length < 4 || /\d/.test(key)) return;
    const hit = map.get(key);
    if (hit) hit.count += 1;
    else map.set(key, { key, display: pretty, count: 1 });
    for (const word of key.split(" ")) {
      if (word.length < 4 || STOP.has(word)) continue;
      const wordHit = map.get(word);
      if (wordHit) wordHit.count += 1;
      else {
        const shown = pretty
          .split(/\s+/)
          .find((part) => normalizeLotQueryText(part) === word);
        map.set(word, { key: word, display: shown || pretty, count: 1 });
      }
    }
  };
  for (const unit of units) {
    bump(unit.model || "");
    bump(unit.make || "");
  }
  return [...map.values()];
}

function suggestName(tokens: string[], units: LotQueryUnit[]): string | undefined {
  const names = catalogNames(units);
  const exact = new Set(names.map((name) => name.key));
  let best: CatalogName | undefined;
  for (const token of tokens) {
    if (token.length < 4 || exact.has(token) || STOP.has(token)) continue;
    for (const name of names) {
      if (!editDistanceAtMost1(token, name.key)) continue;
      if (
        !best ||
        name.count > best.count ||
        (name.count === best.count && name.display.localeCompare(best.display) < 0)
      ) {
        best = name;
      }
    }
  }
  return best?.display;
}

function tally(units: LotQueryUnit[], pick: (unit: LotQueryUnit) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const unit of units) {
    const key = pick(unit).trim();
    if (!key) continue;
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}

function countsFor(units: LotQueryUnit[]): LotQueryCounts {
  return {
    body_type: tally(units, (unit) => unit.body_type || ""),
    condition: tally(units, (unit) => unit.condition || ""),
    location: tally(units, (unit) => unit.location || ""),
    model: tally(units, (unit) => unit.model || ""),
    status: tally(units, (unit) => unit.lot_status || ""),
  };
}

function toRow(unit: LotQueryUnit): LotQueryRow {
  const length = lotUnitLength(unit);
  return {
    year: unit.year || "",
    make: unit.make || "",
    model: unit.model || "",
    trim: unit.trim || "",
    body_type: unit.body_type || "",
    condition: unit.condition || "",
    lot_status: unit.lot_status || "",
    location: unit.location || "",
    stock_number: unit.stock_number || "",
    price: unit.price ?? null,
    length_ft: length.ft,
    length_source: length.source,
  };
}

function sharedLeadingWord(models: string[]): string {
  const heads = models.map((model) => model.split(/\s+/)[0] || "").filter(Boolean);
  if (!heads.length || heads.length !== models.length) return "";
  const first = heads[0]!;
  return heads.every((head) => head.toLowerCase() === first.toLowerCase()) ? first : "";
}

function oneLine(
  matched: LotQueryUnit[],
  counts: LotQueryCounts,
  body: BodySpec,
  didYouMean?: string,
): string {
  if (!matched.length && didYouMean) return `None. Did you mean ${didYouMean}?`;
  if (!matched.length) return "None. No own-lot hit.";
  if (matched.length === 1) {
    const unit = matched[0]!;
    const name = [unit.year, unit.make, unit.model, unit.trim].filter(Boolean).join(" ");
    const status = unit.lot_status ? `, ${unit.lot_status}` : "";
    return `Matching units: 1 ${name}, stk ${unit.stock_number}${status}.`;
  }
  const classC = counts.body_type["Class C"] || 0;
  const superC = counts.body_type["Class Super C"] || 0;
  if (
    body.kind === "labels" &&
    body.labels.includes("Class C") &&
    body.labels.includes("Class Super C") &&
    classC + superC === matched.length
  ) {
    return `Matching units: ${matched.length} Class C on the lot, ${classC} Class C and ${superC} Class Super C.`;
  }
  const models = Object.keys(counts.model);
  const makes = tally(matched, (unit) => unit.make || "");
  const makeNames = Object.keys(makes);
  const conditions = Object.keys(counts.condition);
  const family = sharedLeadingWord(models);
  const name =
    models.length === 1
      ? `${makeNames.length === 1 ? `${makeNames[0]} ` : ""}${models[0]}`
      : family
        ? `${makeNames.length === 1 ? `${makeNames[0]} ` : ""}${family}`
        : "";
  const cond = conditions.length === 1 ? `, all ${conditions[0]!.toLowerCase()}` : "";
  const label = name ? ` ${name}` : "";
  return `Matching units: ${matched.length}${label}${cond}.`;
}

type Parsed = {
  body: BodySpec;
  condition: string;
  status: string;
  location: string;
  places: string[];
  tokens: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  lengthMin?: number;
  lengthMax?: number;
  sort?: "price" | "length" | "year";
  order: "asc" | "desc";
  limit: number;
};

function parseArgs(units: LotQueryUnit[], args: LotQueryArgs): Parsed {
  const present = [...new Set(units.map((unit) => (unit.body_type || "").trim()).filter(Boolean))];
  const fromQuery = bodySpecFromText(str(args.query));
  const fromArg = bodySpecFromText(str(args.body_type));
  const body = intersectBody(fromQuery.spec, fromArg.spec, present);
  const conditioned = consumeCondition(fromQuery.rest, str(args.condition));
  const statused = consumeStatus(conditioned.rest, str(args.status));
  const places = locationWords(units);
  const fieldTokens = identityTokens(
    normalizeLotQueryText(`${str(args.make)} ${str(args.model)}`),
    places,
  );
  const queryTokens = identityTokens(statused.rest, places);
  const tokens = [...new Set([...queryTokens, ...fieldTokens])];
  const namedPlaces = mentionedPlaces(statused.rest, places);
  const sortBy = str(args.sort);
  const sort = sortBy === "price" || sortBy === "length" || sortBy === "year" ? sortBy : undefined;
  const rawLimit = num(args.limit);
  const limit = rawLimit != null ? Math.min(24, Math.max(1, Math.round(rawLimit))) : 12;
  return {
    body,
    condition: conditioned.condition,
    status: statused.status,
    location: str(args.location),
    places: namedPlaces,
    tokens,
    yearMin: num(args.year_min),
    yearMax: num(args.year_max),
    priceMin: num(args.price_min),
    priceMax: num(args.price_max),
    lengthMin: num(args.length_ft_min),
    lengthMax: num(args.length_ft_max),
    sort,
    order: str(args.order) === "desc" ? "desc" : "asc",
    limit,
  };
}

/** True when the free-text question names a coach, type, condition, or status. */
export function lotQueryHasSubject(query: string): boolean {
  const parsed = parseArgs([], { query });
  return (
    parsed.tokens.length > 0 ||
    parsed.body.kind !== "any" ||
    Boolean(parsed.condition) ||
    Boolean(parsed.status)
  );
}

function passes(unit: LotQueryUnit, parsed: Parsed, lengthRequired: boolean): boolean {
  if (!bodyMatches(unit.body_type || "", parsed.body)) return false;
  if (!conditionMatches(unit, parsed.condition)) return false;
  if (!statusMatches(unit, parsed.status)) return false;
  if (!locationMatches(unit, parsed.location, parsed.places)) return false;
  if (!yearMatches(unit, parsed.yearMin, parsed.yearMax)) return false;
  if (!priceMatches(unit, parsed.priceMin, parsed.priceMax)) return false;
  if (parsed.tokens.some((token) => !tokenHitsIdentity(unit, token))) return false;
  if (lengthRequired) {
    const length = lotUnitLength(unit).ft;
    if (length == null) return false;
    if (parsed.lengthMin != null && length < parsed.lengthMin) return false;
    if (parsed.lengthMax != null && length > parsed.lengthMax) return false;
  }
  return true;
}

function compareUnits(a: LotQueryUnit, b: LotQueryUnit, parsed: Parsed): number {
  const dir = parsed.order === "desc" ? -1 : 1;
  const value = (unit: LotQueryUnit): number | null => {
    if (parsed.sort === "price") return unit.price ?? null;
    if (parsed.sort === "year") {
      const year = Number(unit.year);
      return Number.isFinite(year) ? year : null;
    }
    if (parsed.sort === "length") return lotUnitLength(unit).ft;
    return null;
  };
  const av = value(a);
  const bv = value(b);
  if (av == null && bv == null) return 0;
  if (av == null) return 1;
  if (bv == null) return -1;
  return (av - bv) * dir;
}

/**
 * Search the caller's own-lot units. `matched` is the full hit count.
 * `units` is the top N rows. A one-edit make/model miss sets `did_you_mean`
 * instead of a bare zero.
 */
export function searchLot(units: LotQueryUnit[], args: LotQueryArgs = {}): LotQueryResult {
  const parsed = parseArgs(units, args);
  const lengthBounded = parsed.lengthMin != null || parsed.lengthMax != null;
  const lengthRequired = lengthBounded || parsed.sort === "length";
  let matched = units.filter((unit) => passes(unit, parsed, lengthRequired));
  if (!matched.length) {
    const plainTokens = plainTypeaheadTokens(
      [args.query, args.make, args.model].filter(Boolean).join(" "),
    );
    if (plainTokens.length) {
      const plain = units.filter((unit) =>
        plainTokens.every((token) => tokenHitsIdentity(unit, token)),
      );
      if (plain.length) matched = plain;
    }
  }
  const noLength = lengthRequired
    ? units.filter((unit) => {
        if (lotUnitLength(unit).ft != null) return false;
        return passes(unit, { ...parsed, lengthMin: undefined, lengthMax: undefined }, false);
      })
    : [];
  const didYouMean = matched.length ? undefined : suggestName(parsed.tokens, units);
  const counts = countsFor(matched);
  const sorted = matched
    .map((unit, index) => ({ unit, index }))
    .sort((a, b) => {
      const cmp = compareUnits(a.unit, b.unit, parsed);
      return cmp !== 0 ? cmp : a.index - b.index;
    })
    .map((row) => row.unit);
  return {
    ok: true,
    matched: matched.length,
    none: matched.length === 0,
    counts,
    units: sorted.slice(0, parsed.limit).map(toRow),
    no_length: noLength.map(toRow),
    summary: oneLine(matched, counts, parsed.body, didYouMean),
    ...(didYouMean ? { did_you_mean: didYouMean } : {}),
  };
}

/** Chat context block. One summary line, then the top rows. */
export function formatLotQueryNotes(result: LotQueryResult): string {
  const lines = [result.summary];
  if (result.did_you_mean) {
    lines.push(`Did you mean ${result.did_you_mean}? Say none only when matched is 0.`);
  }
  for (const unit of result.units) {
    lines.push(
      [
        unit.year,
        unit.make,
        unit.model,
        unit.trim,
        unit.body_type,
        unit.condition,
        unit.lot_status,
        unit.location,
        unit.stock_number ? `stk ${unit.stock_number}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    );
  }
  if (result.no_length.length) {
    const stocks = result.no_length.map((unit) => `stk ${unit.stock_number}`).join(", ");
    lines.push(`No length on file (not guessed): ${stocks}.`);
  }
  return lines.filter(Boolean).join("\n");
}
