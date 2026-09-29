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
  fuel_type?: string;
  engine?: string;
  chassis?: string;
  chassis_brand?: string;
  transmission?: string;
  features?: string;
  /** Full printed scrape. Search reads fuel, engine, chassis, and features from here. */
  printed?: Record<string, string>;
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
  /**
   * The salesman's raw words. When set, they win over model-invented
   * class, condition, price, make, and sort.
   */
  utterance?: string;
  follow_up?: boolean;
  carry_body_type?: string;
  carry_condition?: string;
  carry_price_min?: number;
  carry_price_max?: number;
  carry_make?: string;
  carry_model?: string;
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
  /** Set when a one-edit fuel word (deisel → diesel) returned those units. */
  close?: string;
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
  "im",
  "in",
  "inventory",
  "is",
  "it",
  "its",
  "just",
  "know",
  "least",
  "list",
  "looking",
  "longest",
  "lot",
  "many",
  "mean",
  "me",
  "more",
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
  "probably",
  "right",
  "shortest",
  "show",
  "showed",
  "sort",
  "stock",
  "tell",
  "that",
  "the",
  "them",
  "there",
  "these",
  "think",
  "this",
  "those",
  "thousand",
  "time",
  "to",
  "top",
  "total",
  "try",
  "type",
  "want",
  "we",
  "what",
  "which",
  "why",
  "with",
  "yeah",
  "yes",
  "you",
  "your",
  "youre",
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
  const printed = unit.printed || {};
  const pick = (...keys: string[]): string => {
    for (const key of keys) {
      const direct = (unit as Record<string, unknown>)[key];
      if (typeof direct === "string" && direct.trim()) return direct.trim();
      const fromPrinted = printed[key];
      if (fromPrinted && fromPrinted.trim()) return fromPrinted.trim();
    }
    return "";
  };
  const fuel = pick("fuel_type", "fuel");
  const engine = pick("engine");
  const chassis = pick("chassis_brand", "chassis");
  const transmission = pick("transmission");
  const features = pick("features");
  const title = pick("title");
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
    fuel_type: fuel,
    engine,
    chassis,
    chassis_brand: chassis,
    transmission,
    features,
    title: [
      unit.year,
      unit.make,
      unit.model,
      series,
      unit.trim,
      unit.body_type,
      title,
      fuel,
      engine,
      chassis,
      transmission,
      features,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function tokenHitsIdentity(unit: LotQueryUnit, token: string): boolean {
  return lotTokenMatchesUnit(asSearchable(unit), token);
}

function tokenIsCoachName(unit: LotQueryUnit, token: string): boolean {
  if (/^\d+$/.test(token)) return false;
  if (token.length < 4 && !/\d/.test(token)) return false;
  if (
    token === "class" ||
    token === "diesel" ||
    token === "gas" ||
    token === "gasoline" ||
    token === "super" ||
    token === "motorhome" ||
    token === "fifth" ||
    token === "wheel" ||
    token === "travel" ||
    token === "trailer" ||
    token === "toy" ||
    token === "hauler" ||
    token === "used" ||
    token === "new"
  ) {
    return false;
  }
  const named = asSearchable({
    year: "",
    make: unit.make,
    model: unit.model,
    trim: unit.trim,
    series: unit.series,
    stock_number: unit.stock_number,
  });
  return lotTokenMatchesUnit(named, token);
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
    let first = -1;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) {
        diffs += 1;
        if (first < 0) first = i;
      }
    }
    if (diffs === 1) return true;
    // One adjacent swap: deisel → diesel.
    return (
      diffs === 2 &&
      first >= 0 &&
      first + 1 < a.length &&
      a[first] === b[first + 1] &&
      a[first + 1] === b[first]
    );
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
  sort?: Parsed["sort"],
): string {
  if (!matched.length && didYouMean) return `None. Did you mean ${didYouMean}?`;
  if (!matched.length) return "None. No own-lot hit.";
  if (sort === "type" && matched.length > 1) {
    const rows = Object.entries(counts.body_type).sort((a, b) => {
      const rank = typeRank(a[0]) - typeRank(b[0]);
      return rank !== 0 ? rank : b[1] - a[1];
    });
    const list = rows.map(([name, n]) => `${n} ${name}`).join(", ");
    return `Matching units: ${matched.length}. By type: ${list}.`;
  }
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

const SMALL_NUMBER: Record<string, number> = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

function tryReadMoney(
  tokens: string[],
  start: number,
): { value: number; end: number } | null {
  let value = 0;
  let seen = false;
  let j = start;
  while (j < tokens.length) {
    const token = (tokens[j] || "").replace(/^\$/, "");
    const kMatch = /^(\d+(?:\.\d+)?)k$/.exec(token);
    if (kMatch) {
      value += Number(kMatch[1]) * 1000;
      seen = true;
      j += 1;
      break;
    }
    if (/^\d+(?:\.\d+)?$/.test(token)) {
      const n = Number(token);
      const next = tokens[j + 1];
      if (next === "grand" || next === "k") {
        value += n * 1000;
        seen = true;
        j += 2;
        break;
      }
      if (next === "thousand") {
        value += n * 1000;
        seen = true;
        j += 2;
        continue;
      }
      if (next === "000" && n < 1000) {
        value += n * 1000;
        seen = true;
        j += 2;
        break;
      }
      if (next === "hundred") {
        value += n * 100;
        seen = true;
        j += 2;
        continue;
      }
      if (n >= 1000) {
        value += n;
        seen = true;
        j += 1;
        break;
      }
      if (seen) {
        value += n;
        j += 1;
        break;
      }
      return null;
    }
    const small = SMALL_NUMBER[token];
    if (small != null) {
      const next = tokens[j + 1];
      const article = token === "a" || token === "an";
      if (article && next !== "hundred") return null;
      if (next === "hundred") {
        value += small * 100;
        seen = true;
        j += 2;
        continue;
      }
      if (next === "thousand" || next === "grand") {
        value += small * 1000;
        seen = true;
        j += 2;
        break;
      }
      if (seen && !article) {
        value += small;
        j += 1;
        break;
      }
      return null;
    }
    if ((token === "thousand" || token === "grand") && seen) {
      value *= 1000;
      j += 1;
      break;
    }
    break;
  }
  if (!seen || !Number.isFinite(value) || value <= 0) return null;
  return { value, end: j };
}

function consumePrice(tokens: string[]): {
  tokens: string[];
  priceMin?: number;
  priceMax?: number;
} {
  const kept: string[] = [];
  let priceMin: number | undefined;
  let priceMax: number | undefined;
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    if (token === "between") {
      const left = tryReadMoney(tokens, i + 1);
      if (left && tokens[left.end] === "and") {
        const right = tryReadMoney(tokens, left.end + 1);
        if (right) {
          priceMin = Math.min(left.value, right.value);
          priceMax = Math.max(left.value, right.value);
          i = right.end;
          continue;
        }
      }
    }
    const under = token === "under" || token === "below" || token === "less";
    const over = token === "over" || token === "above" || token === "more";
    const around = token === "around" || token === "about" || token === "roughly";
    if (under || over || around) {
      let start = i + 1;
      if ((token === "less" || token === "more") && tokens[start] === "than") start += 1;
      const money = tryReadMoney(tokens, start);
      if (money && money.value >= 1000) {
        if (under) priceMax = money.value;
        else if (over) priceMin = money.value;
        else {
          priceMin = Math.round(money.value * 0.85);
          priceMax = Math.round(money.value * 1.15);
        }
      }
      if (money) {
        i = money.end;
        continue;
      }
    }
    const bare = tryReadMoney(tokens, i);
    const next = tokens[i + 1];
    const explicitMoney =
      /k$/.test(token) ||
      next === "grand" ||
      next === "thousand" ||
      next === "hundred" ||
      token === "hundred";
    // A bare model year (2026) is not a price. 100k / 100 grand / 10000+ is.
    if (
      bare &&
      bare.value >= 1000 &&
      priceMin == null &&
      priceMax == null &&
      (explicitMoney || bare.value >= 10000)
    ) {
      priceMin = Math.round(bare.value * 0.85);
      priceMax = Math.round(bare.value * 1.15);
      i = bare.end;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, priceMin, priceMax };
}

function consumeSort(tokens: string[]): {
  tokens: string[];
  sort?: "price" | "length" | "year" | "type";
  order?: "asc" | "desc";
} {
  const kept: string[] = [];
  let sort: "price" | "length" | "year" | "type" | undefined;
  let order: "asc" | "desc" | undefined;
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    const next = tokens[i + 1];
    if ((token === "sort" || token === "group" || token === "order") && next === "by") {
      const which = tokens[i + 2];
      if (which === "type" || which === "class") {
        sort = "type";
        i += 3;
        continue;
      }
      if (which === "price" || which === "length" || which === "year") {
        sort = which;
        i += 3;
        continue;
      }
    }
    if (token === "by" && (next === "type" || next === "class")) {
      sort = "type";
      i += 2;
      continue;
    }
    if (token === "cheapest" || token === "priciest") {
      sort = "price";
      order = token === "priciest" ? "desc" : "asc";
      i += 1;
      continue;
    }
    if (token === "lowest" && next !== "expensive" && next !== "price" && next !== "priced") {
      sort = "price";
      order = "asc";
      i += 1;
      continue;
    }
    if ((token === "least" || token === "most" || token === "lowest" || token === "highest") && (next === "expensive" || next === "price" || next === "priced")) {
      sort = "price";
      order = token === "most" || token === "highest" ? "desc" : "asc";
      i += 2;
      continue;
    }
    if (token === "expensive") {
      i += 1;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, sort, order };
}

function fuelAlias(token: string): { fuel: "diesel" | "gas"; close?: string } | null {
  const word = singularizeLotToken(token);
  if (word === "diesel") return { fuel: "diesel" };
  if (word === "gas" || word === "gasoline") return { fuel: "gas" };
  if (word.length >= 5 && editDistanceAtMost1(word, "diesel")) {
    return { fuel: "diesel", close: "diesel" };
  }
  return null;
}

function consumeFuel(tokens: string[]): {
  tokens: string[];
  fuel: "" | "diesel" | "gas";
  close?: string;
} {
  const kept: string[] = [];
  let fuel: "" | "diesel" | "gas" = "";
  let close: string | undefined;
  for (const token of tokens) {
    const alias = fuelAlias(token);
    if (!alias) {
      kept.push(token);
      continue;
    }
    fuel = alias.fuel;
    if (alias.close) close = alias.close;
  }
  return { tokens: kept, fuel, close };
}

function fuelText(unit: LotQueryUnit, key: string): string {
  const direct = (unit as Record<string, unknown>)[key];
  if (typeof direct === "string" && direct.trim()) return direct.toLowerCase();
  return (unit.printed?.[key] || "").toLowerCase();
}

function fuelMatches(unit: LotQueryUnit, fuel: "" | "diesel" | "gas"): boolean {
  if (!fuel) return true;
  const typed = `${fuelText(unit, "fuel_type")} ${fuelText(unit, "fuel")} ${unit.body_type || ""}`.toLowerCase();
  const engine = fuelText(unit, "engine");
  if (fuel === "diesel") {
    return /\bdiesel\b/.test(typed) || /\bdiesel\b/.test(engine);
  }
  if (/\bdiesel\b/.test(typed)) return false;
  return /\bgas/.test(typed) || (/\bgas/.test(engine) && !/\bdiesel\b/.test(engine));
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
  fuel: "" | "diesel" | "gas";
  close?: string;
  sort?: "price" | "length" | "year" | "type";
  order: "asc" | "desc";
  limit: number;
};

type LooseArgs = LotQueryArgs & Record<string, unknown>;

function looseNum(args: LooseArgs, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const n = num(args[key]);
    if (n != null) return n;
  }
  return undefined;
}

function looseStr(args: LooseArgs, ...keys: string[]): string {
  for (const key of keys) {
    const s = str(args[key]);
    if (s) return s;
  }
  return "";
}

function stripCarry(args: LotQueryArgs): LotQueryArgs {
  const {
    utterance: _utterance,
    follow_up: _follow,
    carry_body_type: _body,
    carry_condition: _condition,
    carry_price_min: _priceMin,
    carry_price_max: _priceMax,
    carry_make: _make,
    carry_model: _model,
    ...rest
  } = args;
  return rest;
}

/** Body class the salesman actually said. Empty when they named none. */
export function spokenLotBody(raw: string): string {
  const spec = bodySpecFromText(raw).spec;
  if (spec.kind === "labels") {
    if (
      spec.labels.includes("Class C") &&
      spec.labels.includes("Class Super C") &&
      spec.labels.length === 2
    ) {
      return "Class C";
    }
    if (spec.labels.includes("Class A") && spec.labels.length > 1) return "Class A";
    return spec.labels[0] || "";
  }
  if (spec.kind === "motorhome") return "motorhome";
  if (spec.kind === "toy") return "toy hauler";
  return "";
}

/**
 * Raw words win. A class, condition, price band, make, or sort the model
 * added on its own is dropped. A follow-up that names no new class keeps
 * the class already in the conversation.
 */
export function reconcileLotArgs(args: LotQueryArgs = {}): LotQueryArgs {
  const loose = args as LooseArgs;
  const base: LotQueryArgs = {
    ...args,
    body_type: looseStr(loose, "body_type", "bodyType"),
    price_min: looseNum(loose, "price_min", "minPrice", "priceMin"),
    price_max: looseNum(loose, "price_max", "maxPrice", "priceMax"),
  };
  const utterance = str(args.utterance);
  if (!utterance) return stripCarry(base);

  const followUp = Boolean(args.follow_up);
  const words = normalizeLotQueryText(utterance).split(/\s+/).filter(Boolean);
  const saidBody = bodySpecFromText(utterance).spec.kind !== "any";
  const saidCondition = consumeCondition(normalizeLotQueryText(utterance), "").condition;
  const priced = consumePrice(words);
  const saidPrice = priced.priceMin != null || priced.priceMax != null;
  const sorted = consumeSort(priced.tokens);
  const said = normalizeLotQueryText(utterance);
  const next: LotQueryArgs = { ...stripCarry(base), query: utterance };

  if (saidBody) next.body_type = "";
  else if (followUp && str(args.carry_body_type)) next.body_type = str(args.carry_body_type);
  else next.body_type = "";

  if (saidCondition === "new" || saidCondition === "used") next.condition = saidCondition;
  else if (followUp && (args.carry_condition === "new" || args.carry_condition === "used")) {
    next.condition = args.carry_condition;
  } else next.condition = "";

  if (saidPrice) {
    next.price_min = priced.priceMin;
    next.price_max = priced.priceMax;
  } else if (followUp && (args.carry_price_min != null || args.carry_price_max != null)) {
    next.price_min = args.carry_price_min;
    next.price_max = args.carry_price_max;
  } else {
    next.price_min = undefined;
    next.price_max = undefined;
  }

  if (sorted.sort) {
    next.sort = sorted.sort;
    next.order = sorted.order;
  }

  const make = str(base.make);
  if (make && !said.includes(normalizeLotQueryText(make))) {
    next.make = followUp && !saidBody ? str(args.carry_make) : "";
  }
  const model = str(base.model);
  if (model && !said.includes(normalizeLotQueryText(model))) {
    next.model = followUp && !saidBody ? str(args.carry_model) : "";
  }
  return next;
}

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
  const priced = consumePrice(statused.rest.split(/\s+/).filter(Boolean));
  const sortedWords = consumeSort(priced.tokens);
  const fueled = consumeFuel(sortedWords.tokens);
  const queryTokens = identityTokens(fueled.tokens.join(" "), places);
  const tokens = [...new Set([...queryTokens, ...fieldTokens])];
  const namedPlaces = mentionedPlaces(statused.rest, places);
  const sortBy = str(args.sort) || sortedWords.sort || "";
  const sort =
    sortBy === "price" || sortBy === "length" || sortBy === "year" || sortBy === "type"
      ? sortBy
      : undefined;
  const rawLimit = num(args.limit);
  const limit = rawLimit != null ? Math.min(24, Math.max(1, Math.round(rawLimit))) : 12;
  const argOrder = str(args.order);
  const order: "asc" | "desc" =
    argOrder === "desc" || argOrder === "asc"
      ? argOrder
      : sortedWords.order || "asc";
  return {
    body,
    condition: conditioned.condition,
    status: statused.status,
    location: str(args.location),
    places: namedPlaces,
    tokens,
    yearMin: num(args.year_min),
    yearMax: num(args.year_max),
    priceMin: num(args.price_min) ?? priced.priceMin,
    priceMax: num(args.price_max) ?? priced.priceMax,
    lengthMin: num(args.length_ft_min),
    lengthMax: num(args.length_ft_max),
    fuel: fueled.fuel,
    close: fueled.close,
    sort,
    order,
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

function passesStructured(unit: LotQueryUnit, parsed: Parsed, lengthRequired: boolean): boolean {
  if (!bodyMatches(unit.body_type || "", parsed.body)) return false;
  if (!conditionMatches(unit, parsed.condition)) return false;
  if (!statusMatches(unit, parsed.status)) return false;
  if (!locationMatches(unit, parsed.location, parsed.places)) return false;
  if (!yearMatches(unit, parsed.yearMin, parsed.yearMax)) return false;
  if (!priceMatches(unit, parsed.priceMin, parsed.priceMax)) return false;
  if (!fuelMatches(unit, parsed.fuel)) return false;
  if (lengthRequired) {
    const length = lotUnitLength(unit).ft;
    if (length == null) return false;
    if (parsed.lengthMin != null && length < parsed.lengthMin) return false;
    if (parsed.lengthMax != null && length > parsed.lengthMax) return false;
  }
  return true;
}

function passesTokens(unit: LotQueryUnit, tokens: string[]): boolean {
  return tokens.every((token) => tokenHitsIdentity(unit, token));
}

function hasRecognizedFilter(parsed: Parsed, lengthRequired: boolean): boolean {
  return (
    parsed.body.kind !== "any" ||
    Boolean(parsed.condition) ||
    Boolean(parsed.status) ||
    Boolean(parsed.location) ||
    parsed.places.length > 0 ||
    parsed.yearMin != null ||
    parsed.yearMax != null ||
    parsed.priceMin != null ||
    parsed.priceMax != null ||
    Boolean(parsed.fuel) ||
    lengthRequired
  );
}

const TYPE_ORDER = [
  "Class A Diesel",
  "Class A Gas",
  "Class A",
  "Class B",
  "Class C",
  "Class Super C",
  "Fifth Wheel",
  "Fifth Wheel Toy Hauler",
  "Travel Trailer",
  "Travel Trailer Toy Hauler",
  "Truck Camper",
  "Destination Trailer",
  "Popup",
  "Popup Trailer",
];

function typeRank(body: string): number {
  const i = TYPE_ORDER.indexOf(body);
  return i < 0 ? TYPE_ORDER.length : i;
}

function compareUnits(a: LotQueryUnit, b: LotQueryUnit, parsed: Parsed): number {
  if (parsed.sort === "type") {
    const rank = typeRank(a.body_type || "") - typeRank(b.body_type || "");
    if (rank !== 0) return rank;
    const ap = a.price ?? null;
    const bp = b.price ?? null;
    if (ap == null && bp == null) return 0;
    if (ap == null) return 1;
    if (bp == null) return -1;
    return ap - bp;
  }
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

function closeLine(summary: string, close: string | undefined, matched: number): string {
  if (!close || !matched) return summary;
  return `${summary} Close match: ${close}.`;
}

/**
 * Search the caller's own-lot units. `matched` is the full hit count.
 * `units` is the top N rows. A one-edit make/model miss sets `did_you_mean`
 * instead of a bare zero.
 */
export function searchLot(units: LotQueryUnit[], args: LotQueryArgs = {}): LotQueryResult {
  const clean = reconcileLotArgs(args);
  const parsed = parseArgs(units, clean);
  const lengthBounded = parsed.lengthMin != null || parsed.lengthMax != null;
  const lengthRequired = lengthBounded || parsed.sort === "length";
  const structured = units.filter((unit) => passesStructured(unit, parsed, lengthRequired));
  let matched = parsed.tokens.length
    ? structured.filter((unit) => passesTokens(unit, parsed.tokens))
    : structured;
  // Spare words ("looking", "right", "try again") are not a coach name.
  // If used / diesel / class / price already picked a set, keep that set.
  // A real name that the class filter missed (Class A Lineage) still returns that coach.
  const recognized = hasRecognizedFilter(parsed, lengthRequired);
  if (!matched.length && parsed.tokens.length && recognized) {
    const names = parsed.tokens.filter((token) =>
      units.some((unit) => tokenIsCoachName(unit, token)),
    );
    if (names.length) {
      const byName = units.filter(
        (unit) =>
          names.every((token) => tokenIsCoachName(unit, token)) &&
          conditionMatches(unit, parsed.condition) &&
          statusMatches(unit, parsed.status) &&
          locationMatches(unit, parsed.location, parsed.places) &&
          yearMatches(unit, parsed.yearMin, parsed.yearMax) &&
          priceMatches(unit, parsed.priceMin, parsed.priceMax) &&
          fuelMatches(unit, parsed.fuel),
      );
      if (byName.length) matched = byName;
    } else {
      matched = structured;
    }
  }
  // A name with no class, fuel, or price can still use the plain bar.
  // Do not run that bar over a sentence that already named a real filter.
  if (!matched.length && !recognized) {
    const plainTokens = plainTypeaheadTokens(
      [clean.query, clean.make, clean.model].filter(Boolean).join(" "),
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
        return passesStructured(unit, { ...parsed, lengthMin: undefined, lengthMax: undefined }, false);
      })
    : [];
  const didYouMean =
    matched.length || recognized ? undefined : suggestName(parsed.tokens, units);
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
    summary: closeLine(oneLine(matched, counts, parsed.body, didYouMean, parsed.sort), parsed.close, matched.length),
    ...(didYouMean ? { did_you_mean: didYouMean } : {}),
    ...(parsed.close && matched.length ? { close: parsed.close } : {}),
  };
}

/** Chat context block. One summary line, then the top rows. */
export function formatLotQueryNotes(result: LotQueryResult): string {
  const lines = [result.summary];
  if (result.close) {
    lines.push(`Close match: ${result.close}.`);
  }
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
