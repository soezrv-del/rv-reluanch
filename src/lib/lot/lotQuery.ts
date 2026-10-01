/**
 * One own-lot search for Live Voice `query_lot` and text chat.
 * Browser-safe: no disk IO. Callers pass units already read from the scrape.
 */

import {
  bestCloseModelWord,
  consumeBedTokens,
  consumeGenerator,
  consumeMiles,
  consumePhrases,
  consumeSheetSpec,
  consumeSlides,
  displacementHits,
  lotTextScore,
  lotTokenMatchesUnit,
  listingFeatureState,
  normalizeLotSearchQuery,
  parseSheetHorsepower,
  salesmanFilterActive,
  singularizeLotToken,
  spokenLengthBand,
  isLotListExpansion,
  tokenizeLotQuery,
  unitMatchesSalesman,
  unitOdometerMiles,
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
  /** Server-only listing dump. Not shown on the Lot page. */
  fulltext?: string;
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
  /** Odometer band. "around 50,000 miles" is miles, never a price. */
  miles_min?: number;
  miles_max?: number;
  /** Garage length in feet. Not the coach's overall length. */
  garage_ft_min?: number;
  garage_ft_max?: number;
  sort?: string;
  order?: string;
  limit?: number;
  /**
   * The salesman's raw words. They add a filter the model left blank.
   * They do not drop body, fuel, location, year, length, or price the
   * model already set. Make and model still have to be in the words on a
   * fresh ask, so "coaches" cannot stick as Coachmen.
   */
  utterance?: string;
  follow_up?: boolean;
  carry_body_type?: string;
  carry_condition?: string;
  carry_price_min?: number;
  carry_price_max?: number;
  carry_make?: string;
  carry_model?: string;
  carry_fuel?: string;
  carry_location?: string;
  carry_year_min?: number;
  carry_year_max?: number;
  carry_length_ft_min?: number;
  carry_length_ft_max?: number;
  carry_miles_min?: number;
  carry_miles_max?: number;
  carry_garage_ft_min?: number;
  carry_garage_ft_max?: number;
  /** "Give me the full list" names the units already matched. Not a new model. */
  list_all?: boolean;
  /** diesel or gas. Spoken fuel fills this when the model left it blank. */
  fuel?: string;
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
  /** Printed odometer. Null when the sheet has none. Never guessed. */
  mileage: number | null;
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
  /** Units in the snapshot that was searched, before filters. */
  lot_total: number;
  /** Set when one named coach is silent on the feature. Brochure only, not a lot count. */
  feature_blank?: string;
  /** Filters the search actually applied. Memory and filter_label read this. */
  applied: LotQueryApplied;
};

export type LotQueryApplied = {
  body_type: string;
  condition: string;
  location: string;
  fuel: "" | "diesel" | "gas";
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  length_ft_min?: number;
  length_ft_max?: number;
  miles_min?: number;
  miles_max?: number;
  /** Fifth-wheel toy haulers (or the body set) with no garage length on the sheet. */
  garage_skipped?: number;
  /** Class-matched units left out because the sheet has no odometer. */
  miles_skipped?: number;
  make: string;
  model: string;
  horsepower?: number;
  displacement?: string;
};

type BodySpec =
  | { kind: "any" }
  | { kind: "motorhome" }
  | { kind: "toy" }
  | { kind: "labels"; labels: string[] };

const STOP = new Set([
  // Broad-count words. "How many RVs do we have on the lot right now" names no
  // coach, so none of these may filter the lot to zero (#556 regression).
  // A make that contains one ("Cruiser RV", "Thor Motor Coach") still matches
  // on its other word.
  "all",
  "altogether",
  "coach",
  "coaches",
  "count",
  "currently",
  "everything",
  "now",
  "number",
  "rig",
  "rigs",
  "rv",
  "rvs",
  "today",
  "unit",
  "units",
  "vehicle",
  "vehicles",
  "whole",
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
  "family",
  "find",
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
  "kid",
  "know",
  "least",
  "list",
  "looking",
  "longest",
  "older",
  "couple",
  "couples",
  "uh",
  "um",
  "thats",
  "mean",
  "newer",
  "later",
  "under",
  "over",
  "below",
  "above",
  "shorter",
  "longer",
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
  "one",
  "or",
  "order",
  "our",
  "people",
  "person",
  "please",
  "price",
  "priciest",
  "probably",
  "recommendation",
  "right",
  "shortest",
  "show",
  "showed",
  "sleep",
  "sleeping",
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
  "trying",
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

const TOWABLE_LABELS = [
  "Travel Trailer",
  "Fifth Wheel",
  "Travel Trailer Toy Hauler",
  "Fifth Wheel Toy Hauler",
  "Destination Trailer",
  "Popup",
  "Popup Trailer",
];

const POPUP_LABELS = ["Popup", "Popup Trailer"];

function sameLabelSet(labels: string[], expected: string[]): boolean {
  if (labels.length !== expected.length) return false;
  const have = new Set(labels);
  return expected.every((label) => have.has(label));
}

function dropMotorhome(rest: string): string {
  return rest.replace(/\bmotorhome\b/g, " ").replace(/\s+/g, " ").trim();
}

export function bodySpecFromText(raw: string): { spec: BodySpec; rest: string } {
  let rest = normalizeLotQueryText(raw);
  if (isToyHaulerRejection(raw)) {
    rest = rest
      .replace(/\btoy hauler\b/g, " ")
      .replace(/\b(?:arent|not|isnt|those|these|they|them)\b/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // A garage in a fifth wheel is a fifth-wheel toy hauler, not every fifth wheel
  // and not a travel trailer that happens to mention a garage.
  const garage = take(rest, /\bgarage\b/);
  const toy = take(garage.rest, /\btoy hauler\b/);
  const fifth = take(toy.rest, /\b(?:fifth wheel|5th wheel|fiver)\b/);
  const travel = take(fifth.rest, /\btravel trailer\b/);
  rest = travel.rest;
  const toyish = toy.hit || garage.hit;
  if (toyish && fifth.hit) {
    return { spec: { kind: "labels", labels: ["Fifth Wheel Toy Hauler"] }, rest };
  }
  if (toyish && travel.hit) {
    return { spec: { kind: "labels", labels: ["Travel Trailer Toy Hauler"] }, rest };
  }
  if (toy.hit) return { spec: { kind: "toy" }, rest };
  if (garage.hit) return { spec: { kind: "toy" }, rest };
  if (fifth.hit) return { spec: { kind: "labels", labels: ["Fifth Wheel"] }, rest };
  if (travel.hit) return { spec: { kind: "labels", labels: ["Travel Trailer"] }, rest };

  const popup = take(rest, /\b(?:popup|pop ups|pop up)\b/);
  if (popup.hit) {
    return { spec: { kind: "labels", labels: [...POPUP_LABELS] }, rest: popup.rest };
  }

  const superC = take(rest, /\b(?:class\s+)?super c\b/);
  if (superC.hit) {
    return { spec: { kind: "labels", labels: ["Class Super C"] }, rest: dropMotorhome(superC.rest) };
  }
  const diesel = take(rest, /\b(?:class a diesel|diesel pusher)\b/);
  if (diesel.hit) {
    return { spec: { kind: "labels", labels: ["Class A Diesel"] }, rest: dropMotorhome(diesel.rest) };
  }
  const gas = take(rest, /\bclass a gas\b/);
  if (gas.hit) {
    // The scrape prints a gas Class A as "Class A", not "Class A Gas".
    return { spec: { kind: "labels", labels: ["Class A"] }, rest: dropMotorhome(gas.rest) };
  }
  const classA = take(rest, /\bclass a\b/);
  if (classA.hit) {
    return {
      spec: { kind: "labels", labels: ["Class A", "Class A Gas", "Class A Diesel"] },
      rest: dropMotorhome(classA.rest),
    };
  }
  const classB = take(rest, /\bclass b\b/);
  if (classB.hit) {
    return { spec: { kind: "labels", labels: ["Class B"] }, rest: dropMotorhome(classB.rest) };
  }
  const classC = take(rest, /\bclass c\b/);
  if (classC.hit) {
    return {
      spec: { kind: "labels", labels: ["Class C", "Class Super C"] },
      rest: dropMotorhome(classC.rest),
    };
  }

  const motor = take(rest, /\bmotorhome\b/);
  if (motor.hit) return { spec: { kind: "motorhome" }, rest: motor.rest };

  const towable = take(rest, /\b(?:towable|pull behind|trailer)\b/);
  if (towable.hit) {
    return { spec: { kind: "labels", labels: [...TOWABLE_LABELS] }, rest: towable.rest };
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

function gluedToCoachName(token: string): boolean {
  if (!token || STOP.has(token)) return false;
  return /^[a-z]{3,}$/.test(token);
}

function coachWordIn(text: string): boolean {
  return text.split(/\s+/).some((word) => {
    const token = singularizeLotToken(word);
    return /^[a-z]{4,}$/.test(token) && !STOP.has(token);
  });
}

function identityTokens(phrase: string, places: Set<string>): string[] {
  const cleaned = stripLengthTalk(phrase);
  const raw = cleaned.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const token = raw[i] || "";
    if (!token || STOP.has(token)) continue;
    if (places.has(token)) continue;
    // "5" in "Isata 5" / "Asada 5" is the series, not a length.
    if (/^\d{1,2}$/.test(token)) {
      const prev = raw[i - 1] || "";
      const next = raw[i + 1] || "";
      if (!gluedToCoachName(prev) && !gluedToCoachName(next)) continue;
    }
    if (/^\d{2}(?:ft|foot|feet|footer|footers)$/.test(token)) continue;
    if (/^\d{1,2}(?:\.\d+)?(?:ft|foot|feet)$/.test(token)) continue;
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

function sheetDisplacement(unit: LotQueryUnit): string {
  return `${unit.printed?.displacement || ""} ${unit.printed?.engine || ""} ${unit.printed?.engine_type || ""}`.toLowerCase();
}

function powerMatches(unit: LotQueryUnit, horsepower?: number, displacement?: string): boolean {
  if (horsepower == null && !displacement) return true;
  if (horsepower != null && parseSheetHorsepower(unit.printed?.horsepower || "") !== horsepower) {
    return false;
  }
  if (displacement && !displacementHits(sheetDisplacement(unit), displacement)) return false;
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
  return lotTokenMatchesUnit(unit, token);
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
    mileage: unitOdometerMiles(unit),
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

function formatUsd(price: number | null | undefined): string {
  if (price == null || !Number.isFinite(price)) return "";
  const rounded = Math.round(price);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  const withCommas = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${withCommas}`;
}

function topClause(unit: LotQueryUnit | undefined): string {
  if (!unit) return "";
  const name = [unit.year, unit.make, unit.model].filter(Boolean).join(" ");
  const stock = unit.stock_number ? `stk ${unit.stock_number}` : "";
  const price = formatUsd(unit.price);
  const town = unit.location || "";
  const bits = [name, stock, price, town].filter(Boolean);
  if (!bits.length) return "";
  return ` Top: ${bits.join(", ")}.`;
}

function namedClause(units: LotQueryUnit[]): string {
  const shown = units.slice(0, 8);
  const lines = shown.map((unit) => {
    const name = [unit.year, unit.make, unit.model].filter(Boolean).join(" ");
    const price = formatUsd(unit.price);
    const town = unit.location || "";
    return [name, price, town].filter(Boolean).join(", ");
  });
  const more = units.length > shown.length ? ` And ${units.length - shown.length} more.` : "";
  return ` Named: ${lines.join(". ")}.${more}`;
}

function oneLine(
  matched: LotQueryUnit[],
  counts: LotQueryCounts,
  body: BodySpec,
  didYouMean?: string,
  sort?: Parsed["sort"],
  top?: LotQueryUnit,
  named?: LotQueryUnit[],
): string {
  if (!matched.length && didYouMean) return `None. Did you mean ${didYouMean}?`;
  if (!matched.length) return "None.";
  const topBit =
    named && named.length > 1
      ? namedClause(named)
      : matched.length > 1
        ? topClause(top)
        : "";
  if (body.kind === "labels" && sameLabelSet(body.labels, TOWABLE_LABELS) && matched.length > 1) {
    const travel = counts.body_type["Travel Trailer"] || 0;
    const fifth = counts.body_type["Fifth Wheel"] || 0;
    const travelToy = counts.body_type["Travel Trailer Toy Hauler"] || 0;
    const fifthToy = counts.body_type["Fifth Wheel Toy Hauler"] || 0;
    const others = matched.length - (travel + fifth + travelToy + fifthToy);
    return `Matching units: ${matched.length}. ${travel} travel trailers, ${fifth} fifth wheels, ${travelToy} travel trailer toy haulers, ${fifthToy} fifth wheel toy haulers, plus ${others} others.${topBit}`;
  }
  if (sort === "type" && matched.length > 1) {
    const rows = Object.entries(counts.body_type).sort((a, b) => {
      const rank = typeRank(a[0]) - typeRank(b[0]);
      return rank !== 0 ? rank : b[1] - a[1];
    });
    const list = rows.map(([name, n]) => `${n} ${name}`).join(", ");
    return `Matching units: ${matched.length}. By type: ${list}.${topBit}`;
  }
  if (matched.length === 1) {
    const unit = matched[0]!;
    const name = [unit.year, unit.make, unit.model, unit.trim].filter(Boolean).join(" ");
    const price = formatUsd(unit.price);
    const priceBit = price ? `, ${price}` : "";
    const town = unit.location ? `, ${unit.location}` : "";
    const status = unit.lot_status ? `, ${unit.lot_status}` : "";
    return `Matching units: 1 ${name}, stk ${unit.stock_number}${priceBit}${town}${status}.`;
  }
  const classC = counts.body_type["Class C"] || 0;
  const superC = counts.body_type["Class Super C"] || 0;
  if (
    body.kind === "labels" &&
    body.labels.includes("Class C") &&
    body.labels.includes("Class Super C") &&
    classC + superC === matched.length
  ) {
    return `Matching units: ${matched.length} Class C on the lot, ${classC} Class C and ${superC} Class Super C.${topBit}`;
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
  return `Matching units: ${matched.length}${label}${cond}.${topBit}`;
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

/**
 * "Those aren't toy haulers" drops toy haulers.
 * It does not apply the toy-hauler filter.
 */
export function isToyHaulerRejection(text: string): boolean {
  const t = normalizeLotQueryText(text);
  if (!/\btoy hauler\b/.test(t)) return false;
  if (/\b(?:those|these|they|that|them)\b.*\b(?:arent|not|no)\b.*\btoy hauler\b/.test(t)) {
    return true;
  }
  return /\b(?:arent|not|no|isnt)\b(?:\s+\w+){0,2}\s+toy hauler\b/.test(t);
}

function plainBodyAfterToyRejection(carry: string): string {
  const c = (carry || "").toLowerCase();
  if (/travel/.test(c)) return "Travel Trailer";
  return "Fifth Wheel";
}

/** "12-foot garage" on the original sentence, even after body words are stripped. */
export function spokenGarageBand(raw: string): { min?: number; max?: number } {
  const t = normalizeLotQueryText(raw);
  const ahead = t.match(/\b(\d{1,2}(?:\.\d+)?)(?:\s+|-)?(?:foot|feet|ft)\s+garage\b/);
  const behind = t.match(/\bgarage\s+(?:of\s+)?(\d{1,2}(?:\.\d+)?)(?:\s+|-)?(?:foot|feet|ft)\b/);
  const feet = Number(ahead?.[1] || behind?.[1]);
  if (!Number.isFinite(feet) || feet <= 0) return {};
  return { min: feet - 1, max: feet + 1 };
}
export function consumeGarageLength(tokens: string[]): {
  tokens: string[];
  min?: number;
  max?: number;
} {
  const kept: string[] = [];
  let feet: number | undefined;
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    const next = tokens[i + 1] || "";
    const after = tokens[i + 2] || "";
    const glued = token.match(/^(\d{1,2}(?:\.\d+)?)(?:foot|feet|ft)$/);
    if (glued && next === "garage") {
      feet = Number(glued[1]);
      i += 2;
      continue;
    }
    if (/^\d{1,2}(?:\.\d+)?$/.test(token) && /^(?:foot|feet|ft)$/.test(next) && after === "garage") {
      feet = Number(token);
      i += 3;
      continue;
    }
    if (token === "garage" && /^(?:foot|feet|ft)$/.test(next) && /^\d{1,2}(?:\.\d+)?$/.test(after)) {
      feet = Number(after);
      i += 3;
      continue;
    }
    if (token === "garage") {
      i += 1;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  if (feet == null || !Number.isFinite(feet)) return { tokens: kept };
  return { tokens: kept, min: feet - 1, max: feet + 1 };
}

/** Sheet garage length: 12 ft, 13' 6", or inches when the cell is "144 | 3657". */
export function parseGarageFeet(raw: string): number | undefined {
  const s = (raw || "").trim();
  if (!s) return undefined;
  const marked = s.match(
    /(\d+(?:\.\d+)?)\s*(?:ft|foot|feet|')\s*(?:(\d+(?:\.\d+)?)\s*(?:in|inch|inches|"))?/i,
  );
  if (marked) {
    const ft = Number(marked[1]);
    const inches = marked[2] ? Number(marked[2]) : 0;
    if (!Number.isFinite(ft)) return undefined;
    return ft + (Number.isFinite(inches) ? inches / 12 : 0);
  }
  const nums = [...s.matchAll(/(\d+(?:\.\d+)?)/g)]
    .map((hit) => Number(hit[1]))
    .filter((n) => Number.isFinite(n));
  const inches = nums.find((n) => n >= 48 && n <= 360);
  if (inches != null) return inches / 12;
  const bare = nums.find((n) => n >= 4 && n <= 30);
  return bare;
}

export function sheetGarageFeet(unit: LotQueryUnit): number | undefined {
  return parseGarageFeet(
    unit.printed?.garage_length || unit.printed?.cargo_area_length || "",
  );
}

function unitSleeps(unit: LotQueryUnit): number | undefined {
  const raw = unit.printed?.max_sleeping_count || unit.printed?.sleeps || "";
  const n = Number(String(raw).replace(/[^\d]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return n;
}

/** "2020 or newer" is a year floor. The last bound in the sentence wins. */
export function consumeYear(tokens: string[]): {
  tokens: string[];
  yearMin?: number;
  yearMax?: number;
} {
  const kept: string[] = [];
  let yearMin: number | undefined;
  let yearMax: number | undefined;
  const isYear = (token: string) => /^(?:19[8-9]\d|20[0-3]\d)$/.test(token);
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    const next = tokens[i + 1] || "";
    const third = tokens[i + 2] || "";
    if (
      (token === "newer" || token === "later" || token === "after") &&
      (next === "than" ? isYear(third) : isYear(next))
    ) {
      const year = Number(next === "than" ? third : next);
      yearMin = token === "after" ? year + 1 : year;
      yearMax = undefined;
      i += next === "than" ? 3 : 2;
      continue;
    }
    if (
      (token === "older" || token === "before") &&
      (next === "than" ? isYear(third) : isYear(next))
    ) {
      const year = Number(next === "than" ? third : next);
      yearMax = token === "before" ? year - 1 : year;
      yearMin = undefined;
      i += next === "than" ? 3 : 2;
      continue;
    }
    if (
      isYear(token) &&
      (next === "or" || next === "and") &&
      (third === "newer" || third === "later" || third === "up")
    ) {
      yearMin = Number(token);
      yearMax = undefined;
      i += 3;
      continue;
    }
    if (isYear(token) && next === "plus") {
      yearMin = Number(token);
      yearMax = undefined;
      i += 2;
      continue;
    }
    if (
      isYear(token) &&
      (next === "or" || next === "and") &&
      (third === "older" || third === "earlier")
    ) {
      yearMax = Number(token);
      yearMin = undefined;
      i += 3;
      continue;
    }
    if ((token === "i" || token === "im") && next === "mean") {
      i += 2;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, yearMin, yearMax };
}

/** "Family of five" and "sleeps five" rank the sheet. They are not a model name. */
function consumeSleeps(tokens: string[]): { tokens: string[]; sleepsMin?: number } {
  const kept: string[] = [];
  let sleepsMin: number | undefined;
  for (let i = 0; i < tokens.length; ) {
    const token = tokens[i] || "";
    const next = tokens[i + 1] || "";
    const third = tokens[i + 2] || "";
    if (
      (token === "family" || token === "sleep" || token === "sleeps") &&
      (next === "of" || next === "for") &&
      SMALL_NUMBER[third] != null
    ) {
      sleepsMin = SMALL_NUMBER[third];
      i += 3;
      continue;
    }
    if ((token === "family" || token === "sleep" || token === "sleeps") && SMALL_NUMBER[next] != null) {
      sleepsMin = SMALL_NUMBER[next];
      i += 2;
      continue;
    }
    if (
      SMALL_NUMBER[token] != null &&
      (next === "people" || next === "person" || next === "kid" || next === "sleep" || next === "sleeps")
    ) {
      sleepsMin = SMALL_NUMBER[token];
      i += 2;
      continue;
    }
    if (
      token === "family" ||
      token === "sleep" ||
      token === "sleeps" ||
      token === "sleeping" ||
      token === "recommendation"
    ) {
      i += 1;
      continue;
    }
    kept.push(token);
    i += 1;
  }
  return { tokens: kept, sleepsMin };
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
  horsepower?: number;
  displacement?: string;
  bed?: "king" | "queen" | "bunk" | "full";
  sleepsMin?: number;
  milesMin?: number;
  milesMax?: number;
  garageMin?: number;
  garageMax?: number;
  slidesMin?: number;
  slidesMax?: number;
  generator?: boolean;
  generatorFuel?: "" | "gas" | "diesel" | "propane";
  engine?: string;
  features?: string[];
  sort?: "price" | "length" | "year" | "type";
  order: "asc" | "desc";
  limit: number;
  listAll?: boolean;
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
    carry_fuel: _fuel,
    carry_location: _location,
    carry_year_min: _yearMin,
    carry_year_max: _yearMax,
    carry_length_ft_min: _lengthMin,
    carry_length_ft_max: _lengthMax,
    carry_miles_min: _milesMin,
    carry_miles_max: _milesMax,
    carry_garage_ft_min: _garageMin,
    carry_garage_ft_max: _garageMax,
    ...rest
  } = args;
  return rest;
}

/** A token bodySpecFromText can parse back into the same set. */
function bodySpecLabel(spec: BodySpec): string {
  if (spec.kind === "labels") {
    if (sameLabelSet(spec.labels, TOWABLE_LABELS)) return "towable";
    if (sameLabelSet(spec.labels, POPUP_LABELS)) return "popup";
    if (spec.labels.length === 1 && spec.labels[0] === "Class A") return "Class A gas";
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

/** Body class the salesman actually said. Empty when they named none. */
export function spokenLotBody(raw: string): string {
  return bodySpecLabel(bodySpecFromText(raw).spec);
}

/**
 * Spoken words fill filters the model left blank. They replace only the
 * filter they name. Body, fuel, location, year, length, and price the
 * model passed stay when the words do not name a different one.
 * A fresh make or model that is not in the words is still dropped so
 * "coaches" and "RVs" cannot stick as Coachmen.
 */
export function reconcileLotArgs(args: LotQueryArgs = {}): LotQueryArgs {
  const loose = args as LooseArgs;
  const base: LotQueryArgs = {
    ...args,
    body_type: looseStr(loose, "body_type", "bodyType"),
    fuel: looseStr(loose, "fuel"),
    location: looseStr(loose, "location"),
    price_min: looseNum(loose, "price_min", "minPrice", "priceMin"),
    price_max: looseNum(loose, "price_max", "maxPrice", "priceMax"),
    year_min: looseNum(loose, "year_min", "yearMin"),
    year_max: looseNum(loose, "year_max", "yearMax"),
    length_ft_min: looseNum(loose, "length_ft_min", "lengthFtMin"),
    length_ft_max: looseNum(loose, "length_ft_max", "lengthFtMax"),
  };
  const utterance = str(args.utterance);
  if (!utterance) return stripCarry(base);

  const followUp = Boolean(args.follow_up);
  const words = normalizeLotQueryText(utterance).split(/\s+/).filter(Boolean);
  const saidBody = bodySpecFromText(utterance).spec.kind !== "any";
  const saidCondition = consumeCondition(normalizeLotQueryText(utterance), "").condition;
  const milled = consumeMiles(words);
  const saidMiles = milled.min != null || milled.max != null;
  const garaged = consumeGarageLength(milled.tokens);
  const saidGarage = garaged.min != null || garaged.max != null;
  const priced = consumePrice(garaged.tokens);
  const saidPrice = priced.priceMin != null || priced.priceMax != null;
  const sorted = consumeSort(priced.tokens);
  const fueled = consumeFuel(sorted.tokens);
  const band = spokenLengthBand(utterance);
  const said = normalizeLotQueryText(utterance);
  const next: LotQueryArgs = { ...stripCarry(base), query: utterance };
  const toyRejection = isToyHaulerRejection(utterance);

  if (toyRejection) {
    const carry = `${str(args.carry_body_type)} ${str(base.body_type)}`.toLowerCase();
    if (/travel|fifth|5th|fiver|toy/.test(carry)) {
      next.body_type = plainBodyAfterToyRejection(carry);
    } else {
      next.body_type = "";
    }
  } else if (saidBody) next.body_type = "";
  else if (!str(next.body_type) && followUp && str(args.carry_body_type)) {
    next.body_type = str(args.carry_body_type);
  }

  if (saidCondition === "new" || saidCondition === "used") next.condition = saidCondition;
  else if (
    !str(next.condition) &&
    followUp &&
    (args.carry_condition === "new" || args.carry_condition === "used")
  ) {
    next.condition = args.carry_condition;
  }

  if (saidMiles) {
    next.price_min = undefined;
    next.price_max = undefined;
    next.miles_min = milled.min;
    next.miles_max = milled.max;
  } else if (saidPrice) {
    next.price_min = priced.priceMin;
    next.price_max = priced.priceMax;
    next.miles_min = undefined;
    next.miles_max = undefined;
  } else if (next.price_min == null && next.price_max == null && followUp) {
    next.price_min = args.carry_price_min;
    next.price_max = args.carry_price_max;
  }
  if (!saidMiles) {
    if (followUp && (args.carry_miles_min != null || args.carry_miles_max != null)) {
      next.miles_min = args.carry_miles_min;
      next.miles_max = args.carry_miles_max;
    } else {
      next.miles_min = undefined;
      next.miles_max = undefined;
    }
  }

  if (saidGarage) {
    next.garage_ft_min = garaged.min;
    next.garage_ft_max = garaged.max;
    next.length_ft_min = undefined;
    next.length_ft_max = undefined;
  } else if (
    next.garage_ft_min == null &&
    next.garage_ft_max == null &&
    followUp &&
    (args.carry_garage_ft_min != null || args.carry_garage_ft_max != null)
  ) {
    next.garage_ft_min = args.carry_garage_ft_min;
    next.garage_ft_max = args.carry_garage_ft_max;
  }

  if (fueled.fuel) next.fuel = fueled.fuel;
  else if (
    !str(next.fuel) &&
    followUp &&
    (args.carry_fuel === "diesel" || args.carry_fuel === "gas")
  ) {
    next.fuel = args.carry_fuel;
  }

  if (!str(next.location) && followUp && str(args.carry_location)) {
    next.location = str(args.carry_location);
  }

  if (saidGarage) {
    // The foot figure belongs to the garage, not the coach.
  } else if (band.min != null || band.max != null) {
    next.length_ft_min = band.min;
    next.length_ft_max = band.max;
  } else if (next.length_ft_min == null && next.length_ft_max == null && followUp) {
    next.length_ft_min = args.carry_length_ft_min;
    next.length_ft_max = args.carry_length_ft_max;
  }

  const yeared = consumeYear(words);
  const saidYear = yeared.yearMin != null || yeared.yearMax != null;
  if (saidYear) {
    next.year_min = yeared.yearMin;
    next.year_max = yeared.yearMax;
  } else {
    if (next.year_min == null && followUp && args.carry_year_min != null) {
      next.year_min = args.carry_year_min;
    }
    if (next.year_max == null && followUp && args.carry_year_max != null) {
      next.year_max = args.carry_year_max;
    }
  }

  if (sorted.sort) {
    next.sort = sorted.sort;
    next.order = sorted.order;
  }

  const make = str(base.make);
  if (make && !said.includes(normalizeLotQueryText(make))) {
    next.make = followUp ? str(args.carry_make) || make : "";
  }
  const model = str(base.model);
  if (model && !said.includes(normalizeLotQueryText(model))) {
    next.model = followUp ? str(args.carry_model) || model : "";
  }
  if (isLotListExpansion(utterance)) {
    next.list_all = true;
    next.make = followUp ? str(args.carry_make) : "";
    next.model = followUp ? str(args.carry_model) : "";
    if (followUp) {
      next.body_type = str(args.carry_body_type);
      next.length_ft_min = args.carry_length_ft_min;
      next.length_ft_max = args.carry_length_ft_max;
      next.year_min = args.carry_year_min;
      next.year_max = args.carry_year_max;
      next.price_min = args.carry_price_min;
      next.price_max = args.carry_price_max;
      next.miles_min = args.carry_miles_min;
      next.miles_max = args.carry_miles_max;
      if (args.carry_fuel === "diesel" || args.carry_fuel === "gas") {
        next.fuel = args.carry_fuel;
      }
    }
  }
  return { ...next, ...(followUp ? { follow_up: true } : {}) };
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
  const milled = consumeMiles(statused.rest.split(/\s+/).filter(Boolean));
  const garaged = consumeGarageLength(milled.tokens);
  const slides = consumeSlides(garaged.tokens);
  const generated = consumeGenerator(slides.tokens);
  const bedded = consumeBedTokens(generated.tokens);
  const phrases = consumePhrases(bedded.tokens);
  const garageSpoken = spokenGarageBand(`${str(args.query)} ${str(args.utterance)}`);
  const saidMiles = milled.min != null || milled.max != null;
  const saidGarage =
    garaged.min != null || garaged.max != null || garageSpoken.min != null || garageSpoken.max != null;
  const priced = consumePrice(phrases.tokens);
  const sortedWords = consumeSort(priced.tokens);
  const fueled = consumeFuel(sortedWords.tokens);
  const spec = consumeSheetSpec(fueled.tokens);
  const slept = consumeSleeps(spec.tokens);
  const yeared = consumeYear(slept.tokens);
  const expansion = Boolean(args.list_all) || isLotListExpansion(str(args.query));
  const band = saidGarage || expansion ? {} : spokenLengthBand(statused.rest);
  const queryTokens = expansion ? [] : identityTokens(consumeListingAliases(yeared.tokens).join(" "), places);
  const tokens = expansion ? [] : [...new Set([...queryTokens, ...fieldTokens])];
  const namedPlaces = mentionedPlaces(statused.rest, places);
  const argFuel = str(args.fuel).toLowerCase();
  const carriedFuel = argFuel === "diesel" || argFuel === "gas" ? argFuel : "";
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
  const milesMin = saidMiles ? milled.min : num(args.miles_min);
  const milesMax = saidMiles ? milled.max : num(args.miles_max);
  const garageMin = garageSpoken.min ?? (saidGarage ? garaged.min : num(args.garage_ft_min) ?? garaged.min);
  const garageMax = garageSpoken.max ?? (saidGarage ? garaged.max : num(args.garage_ft_max) ?? garaged.max);
  return {
    body,
    condition: conditioned.condition,
    status: statused.status,
    // A place named in this question replaces a carried store. Otherwise keep it.
    location: namedPlaces.length ? "" : str(args.location),
    places: namedPlaces,
    tokens,
    yearMin: yeared.yearMin != null || yeared.yearMax != null ? yeared.yearMin : num(args.year_min),
    yearMax: yeared.yearMin != null || yeared.yearMax != null ? yeared.yearMax : num(args.year_max),
    // A spoken odometer wins over a model price band on the same number.
    priceMin: saidMiles ? priced.priceMin : num(args.price_min) ?? priced.priceMin,
    priceMax: saidMiles ? priced.priceMax : num(args.price_max) ?? priced.priceMax,
    lengthMin: saidGarage ? undefined : num(args.length_ft_min) ?? band.min,
    lengthMax: saidGarage ? undefined : num(args.length_ft_max) ?? band.max,
    milesMin,
    milesMax,
    garageMin,
    garageMax,
    slidesMin: slides.slidesMin,
    slidesMax: slides.slidesMax,
    generator: generated.generator,
    generatorFuel: generated.generatorFuel,
    engine: phrases.engine,
    features: phrases.features,
    sleepsMin: slept.sleepsMin,
    fuel: fueled.fuel || carriedFuel,
    close: fueled.close,
    horsepower: spec.horsepower,
    displacement: spec.displacement,
    bed: bedded.bed,
    sort,
    order,
    limit,
    listAll: expansion,
  };
}

/**
 * True when the words name nothing to filter on: no coach, type, condition,
 * status, place, year, price, length, fuel, spec, bed, or sort.
 * "How many RVs do we have on the lot right now" is a bare count.
 */
export function lotQueryIsBareCount(query: string): boolean {
  if (isToyHaulerRejection(query)) return false;
  if (isLotListExpansion(query)) return false;
  const parsed = parseArgs([], { query });
  const lengthBounded = parsed.lengthMin != null || parsed.lengthMax != null;
  return (
    parsed.tokens.length === 0 &&
    !parsed.sort &&
    !parsed.close &&
    !hasRecognizedFilter(parsed, lengthBounded)
  );
}

/** True when the free-text question names a coach, type, condition, or status. */
export function lotQueryHasSubject(query: string): boolean {
  if (isToyHaulerRejection(query)) return true;
  if (isLotListExpansion(query)) return false;
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
  if (!powerMatches(unit, parsed.horsepower, parsed.displacement)) return false;
  if (parsed.bed && listingFeatureState(unit, parsed.bed) !== "yes") return false;
  if (parsed.sleepsMin != null) {
    const sleeps = unitSleeps(unit);
    if (sleeps != null && sleeps < parsed.sleepsMin) return false;
  }
  if (
    !unitMatchesSalesman(unit, {
      slidesMin: parsed.slidesMin,
      slidesMax: parsed.slidesMax,
      generator: parsed.generator,
      generatorFuel: parsed.generatorFuel,
      engine: parsed.engine,
      features: parsed.features,
    })
  ) {
    return false;
  }
  if (lengthRequired) {
    const length = lotUnitLength(unit).ft;
    if (length == null) return false;
    if (parsed.lengthMin != null && length < parsed.lengthMin) return false;
    if (parsed.lengthMax != null && length > parsed.lengthMax) return false;
  }
  return true;
}

function consumeListingAliases(tokens: string[]): string[] {
  const out: string[] = [];
  for (const token of tokens) {
    if (token === "rl") out.push("rear", "living");
    else if (token === "rk") out.push("rear", "kitchen");
    else if (token === "fl") out.push("front", "living");
    else if (token === "mk") out.push("mid", "kitchen");
    else if (token === "ds") out.push("double", "slide");
    else if (token === "th") out.push("toy", "hauler");
    else out.push(token);
  }
  return out;
}

function bedLabel(bed: string): string {
  if (bed === "bunk") return "Bunkhouse";
  if (bed === "queen") return "Queen bed";
  if (bed === "full") return "Full bed";
  return "King bed";
}

function nameWords(unit: LotQueryUnit): string[] {
  return normalizeLotQueryText(
    `${unit.make || ""} ${unit.model || ""} ${unit.series || ""} ${unit.trim || ""} ${unit.title || ""}`,
  )
    .split(/\s+/)
    .filter(Boolean);
}

/** "5" in Isata 5 is a series word. It is not a stock-number prefix. */
function seriesDigitHits(unit: LotQueryUnit, digit: string): boolean {
  return nameWords(unit).includes(digit);
}

function nameHasWord(unit: LotQueryUnit, token: string): boolean {
  const words = nameWords(unit);
  if (words.includes(token)) return true;
  if (token.length >= 4) return words.some((word) => word.startsWith(token));
  return false;
}

function tokenHitsMake(unit: LotQueryUnit, token: string): boolean {
  const words = normalizeLotQueryText(unit.make || "").split(/\s+/);
  return words.some((word) => word === token || (token.length >= 4 && word.startsWith(token)));
}

type ModelAlias = { spoken: string; key: string; display: string; distance: number };

/**
 * A model word that is not on the sheet, mapped to the sheet word.
 * Make-scoped when a make token already hit, so Ascenta is Isata on a
 * Dynamax row and not Aspen on the rest of the book.
 */
function modelAlias(units: LotQueryUnit[], tokens: string[]): ModelAlias | undefined {
  const misses = tokens.filter(
    (token) => /^[a-z]{4,}$/.test(token) && !units.some((unit) => tokenHitsIdentity(unit, token)),
  );
  if (!misses.length) return undefined;
  const makeAnchors = tokens.filter((token) => units.some((unit) => tokenHitsMake(unit, token)));
  const pool = makeAnchors.length
    ? units.filter((unit) => makeAnchors.every((token) => tokenHitsMake(unit, token)))
    : units;
  const loose = makeAnchors.length > 0 && pool.length > 0 && pool.length < units.length;
  for (const miss of misses) {
    const close = bestCloseModelWord(miss, pool.length ? pool : units, loose);
    if (close) {
      return { spoken: miss, key: close.key, display: close.display, distance: close.distance };
    }
  }
  return undefined;
}

function tokenSatisfied(unit: LotQueryUnit, token: string, alias?: ModelAlias): boolean {
  if (/^\d{1,2}$/.test(token)) return seriesDigitHits(unit, token);
  if (tokenHitsIdentity(unit, token)) return true;
  return Boolean(alias && alias.spoken === token && nameHasWord(unit, alias.key));
}

function passesTokens(unit: LotQueryUnit, tokens: string[], alias?: ModelAlias): boolean {
  return tokens.every((token) => tokenSatisfied(unit, token, alias));
}

/** Series digit on the model line. Year and floorplan stay out. */
function modelSeriesNumber(unit: LotQueryUnit): number | undefined {
  const words = normalizeLotQueryText(`${unit.model || ""} ${unit.series || ""}`).split(/\s+/);
  const nums = words.filter((word) => /^\d{1,2}$/.test(word)).map(Number);
  if (!nums.length) return undefined;
  return Math.max(...nums);
}

/**
 * A one- or two-edit miss returns every sheet unit of that model.
 * A looser sound-alike (Ascenta → Isata) is one series: the highest on
 * the sheet. The other series is similar, not this match.
 */
function keepCloseSeries(units: LotQueryUnit[], alias: ModelAlias | undefined): LotQueryUnit[] {
  if (!alias || alias.distance <= 2 || units.length < 2) return units;
  let best = -1;
  for (const unit of units) {
    const n = modelSeriesNumber(unit);
    if (n != null && n > best) best = n;
  }
  if (best < 0) return units;
  const narrowed = units.filter((unit) => modelSeriesNumber(unit) === best);
  return narrowed.length ? narrowed : units;
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
    parsed.horsepower != null ||
    Boolean(parsed.displacement) ||
    Boolean(parsed.bed) ||
    parsed.milesMin != null ||
    parsed.milesMax != null ||
    parsed.garageMin != null ||
    parsed.garageMax != null ||
    parsed.sleepsMin != null ||
    salesmanFilterActive(parsed) ||
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

function specSummary(summary: string, parsed: Parsed, matched: number): string {
  const bits: string[] = [];
  if (parsed.displacement) bits.push(`displacement ${parsed.displacement}`);
  if (parsed.horsepower != null) bits.push(`${parsed.horsepower} horsepower`);
  if (!bits.length) return summary;
  const spec = bits.join(", ");
  if (!matched) return `None. No own-lot hit for ${spec}.`;
  return `${summary.replace(/\.$/, "")}. ${spec}.`.replace(/\.\./g, ".");
}

function withSheetNotes(
  summary: string,
  notes: {
    matched: number;
    milesMin?: number;
    milesMax?: number;
    milesSkipped: number;
    garageMin?: number;
    garageMax?: number;
    garageSkipped: number;
    garageMissingSheet: boolean;
    lengthMin?: number;
    lengthMax?: number;
  },
): string {
  const bits: string[] = [];
  if (notes.lengthMax != null && notes.lengthMin == null) {
    bits.push(`${notes.lengthMax} foot and under`);
  } else if (notes.lengthMin != null && notes.lengthMax == null) {
    bits.push(`${notes.lengthMin} foot and over`);
  }
  if (notes.milesMin != null || notes.milesMax != null) {
    const band =
      notes.milesMin != null && notes.milesMax != null
        ? `${notes.milesMin.toLocaleString("en-US")} to ${notes.milesMax.toLocaleString("en-US")} miles on the sheet`
        : notes.milesMax != null
          ? `under ${notes.milesMax.toLocaleString("en-US")} miles on the sheet`
          : `over ${(notes.milesMin ?? 0).toLocaleString("en-US")} miles on the sheet`;
    bits.push(band);
    if (notes.milesSkipped) {
      bits.push(`Skipped ${notes.milesSkipped} with no mileage on the sheet`);
    }
  }
  if (notes.garageMissingSheet) {
    bits.push("Garage length isn't on the sheet");
  } else if ((notes.garageMin != null || notes.garageMax != null) && notes.garageSkipped) {
    bits.push(`Skipped ${notes.garageSkipped} with no garage length on the sheet`);
  }
  let line = summary.trim();
  if (notes.matched > 0) line = line.replace(/^None\.\s*/i, "");
  if (!bits.length) return line;
  const extra = `${bits.join(". ")}.`;
  if (!notes.matched) return /^none\b/i.test(line) ? `None. ${extra}` : `None. ${extra}`;
  return `${line.replace(/\s+$/, "").replace(/\.$/, "")}. ${extra}`.replace(/\.\./g, ".");
}

/**
 * A fresh coach question searches the whole snapshot.
 * "In stock" is not "new", and a store the salesman did not name is not a filter.
 * A follow-up keeps the filters it carried.
 */
function dropUnspokenCoachNarrowing(args: LotQueryArgs): LotQueryArgs {
  if (args.follow_up) return args;
  const text = normalizeLotQueryText(`${str(args.query)} ${str(args.utterance)}`);
  if (!coachWordIn(text)) return args;
  const next: LotQueryArgs = { ...args };
  if (!/\bnew\b/.test(text) && !/\bused\b/.test(text)) next.condition = "";
  if (!STATUS_PHRASES.some((phrase) => text.includes(phrase))) next.status = "";
  if (str(next.location)) {
    const head =
      normalizeLotQueryText(str(next.location))
        .split(/\s+/)
        .find((word) => word.length >= 4) || "";
    if (head && !text.includes(head)) next.location = "";
  }
  return next;
}

function capitalizeWord(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function cityOnly(location: string): string {
  const parts = location.trim().split(/\s+/);
  const last = parts[parts.length - 1] || "";
  if (parts.length >= 2 && /^[A-Za-z]{2}$/.test(last)) return parts.slice(0, -1).join(" ");
  return location;
}

function oneCloseLine(unit: LotQueryUnit, sheet: string, spoken: string): string {
  const make = (unit.make || "").replace(/\s+corp\.?$/i, "");
  const model = (unit.model || "").replace(/\s+series$/i, "");
  const name = [unit.year, make, model, unit.trim].filter(Boolean).join(" ");
  const bits = [name, formatUsd(unit.price), cityOnly(unit.location || ""), (unit.lot_status || "").toLowerCase()]
    .filter(Boolean);
  return `One close match. ${bits.join(", ")}. Sheet says ${sheet}, not ${capitalizeWord(spoken)}.`;
}

/**
 * Search the caller's own-lot units. `matched` is the full hit count.
 * `units` is the top N rows. A close make/model miss returns those sheet
 * units and sets `did_you_mean`. It does not open the rest of the book.
 */
export function searchLot(units: LotQueryUnit[], args: LotQueryArgs = {}): LotQueryResult {
  const clean = dropUnspokenCoachNarrowing(reconcileLotArgs(args));
  const parsed = parseArgs(units, clean);
  const lengthBounded = parsed.lengthMin != null || parsed.lengthMax != null;
  const lengthRequired = lengthBounded || parsed.sort === "length";
  const structured = units.filter((unit) => passesStructured(unit, parsed, lengthRequired));
  const alias = modelAlias(units, parsed.tokens);
  let matched = parsed.tokens.length
    ? structured.filter((unit) => passesTokens(unit, parsed.tokens, alias))
    : structured;
  // Spare words ("looking", "right", "try again", "anything") are not a coach name.
  // If used / diesel / class / price already picked a set, keep that set.
  // A real name that the class filter missed (Class A Lineage) still returns that coach.
  // A model word that is one sound off stays on that sheet coach. It does not open the book.
  const recognized = hasRecognizedFilter(parsed, lengthRequired);
  if (!matched.length && parsed.tokens.length && recognized && !alias) {
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
          fuelMatches(unit, parsed.fuel) &&
          powerMatches(unit, parsed.horsepower, parsed.displacement) &&
          (!parsed.bed || listingFeatureState(unit, parsed.bed) === "yes"),
      );
      if (byName.length) matched = byName;
    } else {
      matched = structured;
    }
  }
  // A name with no class, fuel, or price can still use the plain bar.
  // Do not run that bar over a sentence that already named a real filter,
  // and do not use it to throw away a model word that missed.
  if (!matched.length && !recognized && !alias) {
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
  // A blank length is unknown, not a miss, when class, price, or sleeps
  // already picked a coach. Known lengths outside the band stay out.
  if (
    !matched.length &&
    lengthRequired &&
    (parsed.body.kind !== "any" ||
      parsed.priceMin != null ||
      parsed.priceMax != null ||
      parsed.sleepsMin != null)
  ) {
    const blanks = units.filter(
      (unit) => passesStructured(unit, parsed, false) && lotUnitLength(unit).ft == null,
    );
    if (blanks.length) matched = blanks;
  }
  const milesBounded = parsed.milesMin != null || parsed.milesMax != null;
  let milesSkipped = 0;
  if (milesBounded) {
    const missing = matched.filter((unit) => unitOdometerMiles(unit) == null);
    milesSkipped = missing.length;
    matched = matched.filter((unit) => {
      const miles = unitOdometerMiles(unit);
      if (miles == null) return false;
      if (parsed.milesMin != null && miles < parsed.milesMin) return false;
      if (parsed.milesMax != null && miles > parsed.milesMax) return false;
      return true;
    });
  }
  const garageBounded = parsed.garageMin != null || parsed.garageMax != null;
  let garageSkipped = 0;
  let garageMissingSheet = false;
  if (garageBounded) {
    const known = matched.filter((unit) => sheetGarageFeet(unit) != null);
    garageSkipped = matched.length - known.length;
    if (!known.length) {
      garageMissingSheet = true;
    } else {
      matched = known.filter((unit) => {
        const feet = sheetGarageFeet(unit);
        if (feet == null) return false;
        if (parsed.garageMin != null && feet < parsed.garageMin) return false;
        if (parsed.garageMax != null && feet > parsed.garageMax) return false;
        return true;
      });
    }
  }
  let featureBlank: string | undefined;
  let featureNo = false;
  if (parsed.bed && !matched.length) {
    let pool = units.filter((unit) =>
      passesStructured(unit, { ...parsed, bed: undefined }, lengthRequired),
    );
    if (parsed.tokens.length) pool = pool.filter((unit) => passesTokens(unit, parsed.tokens, alias));
    else if (pool.length !== 1) pool = [];
    if (milesBounded) {
      pool = pool.filter((unit) => {
        const miles = unitOdometerMiles(unit);
        if (miles == null) return false;
        if (parsed.milesMin != null && miles < parsed.milesMin) return false;
        if (parsed.milesMax != null && miles > parsed.milesMax) return false;
        return true;
      });
    }
    if (garageBounded && !garageMissingSheet) {
      pool = pool.filter((unit) => {
        const feet = sheetGarageFeet(unit);
        if (feet == null) return false;
        if (parsed.garageMin != null && feet < parsed.garageMin) return false;
        if (parsed.garageMax != null && feet > parsed.garageMax) return false;
        return true;
      });
    }
    if (pool.length === 1) {
      const state = listingFeatureState(pool[0]!, parsed.bed);
      if (state === "unknown") {
        matched = pool;
        featureBlank = parsed.bed;
      } else if (state === "no") {
        matched = pool;
        featureNo = true;
      }
    }
  }
  matched = keepCloseSeries(matched, alias);
  const noLength = lengthRequired
    ? units.filter((unit) => {
        if (lotUnitLength(unit).ft != null) return false;
        return passesStructured(unit, { ...parsed, lengthMin: undefined, lengthMax: undefined }, false);
      })
    : [];
  const didYouMean =
    alias?.display ||
    (matched.length || recognized ? undefined : suggestName(parsed.tokens, units));
  const counts = countsFor(matched);
  const sorted = matched
    .map((unit, index) => ({ unit, index }))
    .sort((a, b) => {
      if (parsed.sort !== "length" && parsed.sort !== "price" && parsed.sort !== "year" && parsed.sort !== "type") {
        const lengthRank = (unit: LotQueryUnit): number => {
          if (parsed.lengthMin == null && parsed.lengthMax == null) return 0;
          const length = lotUnitLength(unit);
          if (length.ft == null) return 2;
          const inBand =
            (parsed.lengthMin == null || length.ft >= parsed.lengthMin) &&
            (parsed.lengthMax == null || length.ft <= parsed.lengthMax);
          if (!inBand) return 3;
          return length.source === "printed" ? 0 : 1;
        };
        const byLength = lengthRank(a.unit) - lengthRank(b.unit);
        if (byLength !== 0) return byLength;
        if (parsed.sleepsMin != null) {
          const rank = (unit: LotQueryUnit) => {
            const sleeps = unitSleeps(unit);
            return sleeps != null && sleeps >= (parsed.sleepsMin as number) ? 0 : 1;
          };
          const bySleep = rank(a.unit) - rank(b.unit);
          if (bySleep !== 0) return bySleep;
        }
      }
      if (parsed.tokens.length) {
        const rank = lotTextScore(b.unit, parsed.tokens) - lotTextScore(a.unit, parsed.tokens);
        if (rank !== 0) return rank;
      }
      const cmp = compareUnits(a.unit, b.unit, parsed);
      return cmp !== 0 ? cmp : a.index - b.index;
    })
    .map((row) => row.unit);
  const nameTokens = parsed.tokens.filter((token) =>
    matched.some((unit) => tokenIsCoachName(unit, token)),
  );
  const applied: LotQueryApplied = {
    body_type: bodySpecLabel(parsed.body),
    condition: parsed.condition,
    location: parsed.location || parsed.places.join(" "),
    fuel: parsed.fuel,
    year_min: parsed.yearMin,
    year_max: parsed.yearMax,
    price_min: parsed.priceMin,
    price_max: parsed.priceMax,
    length_ft_min: parsed.lengthMin,
    length_ft_max: parsed.lengthMax,
    miles_min: parsed.milesMin,
    miles_max: parsed.milesMax,
    miles_skipped: milesSkipped || undefined,
    garage_skipped: garageSkipped || undefined,
    make: str(clean.make),
    model:
      str(clean.model) ||
      nameTokens.join(" ") ||
      (matched.length ? "" : parsed.tokens.join(" ")),
    horsepower: parsed.horsepower,
    displacement: parsed.displacement,
  };
  const named = sorted[0];
  let summary = withSheetNotes(
    specSummary(
      closeLine(
        oneLine(
          matched,
          counts,
          parsed.body,
          didYouMean,
          parsed.sort,
          sorted[0],
          parsed.listAll ? sorted : undefined,
        ),
        parsed.close,
        matched.length,
      ),
      parsed,
      matched.length,
    ),
    {
      matched: matched.length,
      milesMin: parsed.milesMin,
      milesMax: parsed.milesMax,
      milesSkipped,
      garageMin: parsed.garageMin,
      garageMax: parsed.garageMax,
      garageSkipped,
      garageMissingSheet,
      lengthMin: parsed.lengthMin,
      lengthMax: parsed.lengthMax,
    },
  );
  if (named && featureBlank) {
    const name = [named.year, named.make, named.model].filter(Boolean).join(" ");
    summary = `${name}, stk ${named.stock_number}. ${bedLabel(featureBlank)} is not on our listing.`;
  } else if (named && featureNo && parsed.bed) {
    const name = [named.year, named.make, named.model].filter(Boolean).join(" ");
    summary = `No ${bedLabel(parsed.bed).toLowerCase()} on the ${name}, stk ${named.stock_number}.`;
  }
  if (alias && matched.length === 1 && sorted[0] && !featureBlank && !featureNo) {
    summary = oneCloseLine(sorted[0], alias.display, alias.spoken);
  } else if (alias && matched.length && !featureBlank && !featureNo) {
    const note = `Sheet says ${alias.display}, not ${capitalizeWord(alias.spoken)}.`;
    if (!summary.includes(note)) {
      summary = `${summary.replace(/\s+$/, "").replace(/\.$/, "")}. ${note}`;
    }
  }
  return {
    ok: true,
    matched: matched.length,
    none: matched.length === 0,
    counts,
    units: sorted.slice(0, parsed.limit).map(toRow),
    no_length: noLength.map(toRow),
    summary,
    lot_total: units.length,
    applied,
    ...(featureBlank ? { feature_blank: featureBlank } : {}),
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
    if (result.matched) {
      lines.push(`Sheet says ${result.did_you_mean}. These units are the match. Do not say none.`);
    } else {
      lines.push(`Did you mean ${result.did_you_mean}? Say none only when matched is 0.`);
    }
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
