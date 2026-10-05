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
  lotSheetConfirms,
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
import {
  garageAskFeet,
  garageFitSentence,
  garageSourceSentence,
  splitPinnedGarages,
  unpinnedGarageLine,
  type GaragePinBook,
} from "./garagePins.ts";

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
  /**
   * Floorplan pins. When set, a garage ask uses high-confidence pins
   * at or above the spoken length. It does not estimate the rest.
   */
  garage_pins?: GaragePinBook;
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
  /** Printed chassis. Blank when the sheet left it blank. */
  chassis: string;
  /** Printed GVWR. Blank when the sheet left it blank. */
  gvwr: string;
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
  /** Feature words in this ask ("residential", "refrigerator", "fireplace"). */
  feature_words?: string[];
  /** Of `matched`, units whose spec-sheet field confirms every feature word. */
  feature_confirmed?: number;
  /** Real feature words on some coach but none in this set, dropped to keep the filters. */
  dropped_words?: string[];
  /** Filters the search actually applied. Memory and filter_label read this. */
  applied: LotQueryApplied;
  /**
   * Every motorhome in the same store and filter, with sheet label, chassis,
   * and GVWR. The sheet count stays `matched`. Empty on a ranked or measured ask.
   */
  name_roster?: string[];
  /** The coach a likeness ask ("anything like a View") was measured against. */
  similar_to?: string;
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
  // "Similar units", "comparable to", "like a View": how close, never a name
  // or a feature ("Did you mean Salem?" for "same").
  "similar",
  "same",
  "comparable",
  "alternative",
  "alternatives",
  "equivalent",
  "like",
  "a",
  "able",
  "unable",
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
  "had",
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
  "look",
  "lookup",
  "up",
  "bigger",
  "larger",
  "is",
  "isnt",
  "arent",
  "wasnt",
  "werent",
  "dont",
  "doesnt",
  "didnt",
  "cant",
  "wont",
  "wouldnt",
  "couldnt",
  "shouldnt",
  "hasnt",
  "havent",
  "aint",
  "not",
  "em",
  "store",
  "even",
  "close",
  "talking",
  "talk",
  "see",
  "saw",
  "was",
  "were",
  "notice",
  "figure",
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
  "said",
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
  "told",
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
  if (toy.hit || garage.hit) {
    // "Trailers" means every towable, and every toy hauler is a towable. Without
    // travel trailer or fifth wheel named, "trailers, toy haulers" is all toy
    // haulers, so the leftover word must not narrow the match.
    return { spec: { kind: "toy" }, rest: take(rest, /\b(?:towable|pull behind|trailer)\b/g).rest };
  }
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

/** "five" in "a five" / "Isata five" is the series digit. "Four Winds" stays a name. */
const SERIES_DIGIT: Record<string, string> = {
  two: "2",
  three: "3",
  four: "4",
  five: "5",
  six: "6",
  seven: "7",
  eight: "8",
  nine: "9",
  ten: "10",
};

function isSeriesOnlyTokens(raw: string[]): boolean {
  if (raw.includes("top") || raw.includes("first")) return false;
  const content = raw.filter((word) => word !== "series" && !STOP.has(word));
  if (!content.length) return false;
  return content.every((word) => SERIES_DIGIT[word] != null || /^\d{1,2}$/.test(word));
}

function identityTokens(phrase: string, places: Set<string>): string[] {
  const cleaned = stripLengthTalk(phrase);
  const raw = cleaned.split(/\s+/).filter(Boolean);
  const seriesOnly = isSeriesOnlyTokens(raw);
  const out: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const token = raw[i] || "";
    if (!token || STOP.has(token)) continue;
    if (places.has(token)) continue;
    // "5" in "Isata 5" is the series. A bare "five" is that same digit.
    // "top 10" is a list size. "Four Winds" is a name.
    const seriesDigit = SERIES_DIGIT[token];
    if (seriesDigit || /^\d{1,2}$/.test(token)) {
      const prev = raw[i - 1] || "";
      const next = raw[i + 1] || "";
      const nextIsName = Boolean(seriesDigit) && gluedToCoachName(next) && next !== "series";
      if (nextIsName) {
        out.push(token);
        continue;
      }
      const glued =
        (gluedToCoachName(prev) && prev !== "series") ||
        gluedToCoachName(next) ||
        next === "series" ||
        prev === "series";
      if (glued || seriesOnly) out.push(seriesDigit || token);
      continue;
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

function tokenIsCoachName(unit: LotQueryUnit, token: string, modelOnly = false): boolean {
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
    make: modelOnly ? "" : unit.make,
    model: unit.model,
    trim: unit.trim,
    series: unit.series,
    stock_number: modelOnly ? "" : unit.stock_number,
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
    if (token.length < 4 || exact.has(token) || isLotFillerWord(token) || SERIES_DIGIT[token]) continue;
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

function sheetChassis(unit: LotQueryUnit): string {
  return (
    unit.chassis_brand ||
    unit.chassis ||
    unit.printed?.chassis_brand ||
    unit.printed?.chassis ||
    ""
  ).trim();
}

function sheetGvwr(unit: LotQueryUnit): string {
  return (unit.printed?.gvwr || "").trim();
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
    chassis: sheetChassis(unit),
    gvwr: sheetGvwr(unit),
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
  // A Class C ask counts the Super Cs in it. A class with none is not said.
  const classCAsk =
    body.kind === "labels" &&
    body.labels.includes("Class C") &&
    body.labels.includes("Class Super C") &&
    classC + superC === matched.length;
  if (classCAsk && classC && superC) {
    return `Matching units: ${matched.length} Class C, ${classC} Class C and ${superC} Class Super C.${topBit}`;
  }
  const classLabel = classCAsk ? (superC ? "Class Super C" : "Class C") : "";
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
  const label = name ? ` ${name}` : classLabel ? ` ${classLabel}` : "";
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
  const found = consumeGarageLength(t.split(/\s+/).filter(Boolean));
  return found.min == null && found.max == null ? {} : { min: found.min, max: found.max };
}

const FEET_WORD = /^(?:foot|feet|ft)$/;
const OPEN_ENDED = /^(?:bigger|larger|longer|more|greater|up|plus|better)$/;
/** Garages run about 8 to 18 feet. A bigger number away from "garage" is the coach length. */
const LOOSE_GARAGE_MAX_FT = 20;

function feetNumber(token: string): number | undefined {
  if (/^\d{1,2}(?:\.\d+)?$/.test(token)) return Number(token);
  if (token === "a" || token === "an") return undefined;
  const word = SMALL_NUMBER[token];
  return word != null && word >= 6 && word <= 30 ? word : undefined;
}

export function consumeGarageLength(tokens: string[]): {
  tokens: string[];
  min?: number;
  max?: number;
} {
  // "ten-foot" arrives as "ten foot", or glued as "10ft". Split glued feet first.
  const split: string[] = [];
  for (const token of tokens) {
    const glued = token.match(/^(\d{1,2}(?:\.\d+)?)(foot|feet|ft)$/);
    if (glued) split.push(glued[1]!, glued[2]!);
    else split.push(token);
  }
  const saidGarage = split.includes("garage");
  const kept: string[] = [];
  let feet: number | undefined;
  let adjacent = false;
  let open = false;
  let loose: { index: number; feet: number; open: boolean } | undefined;
  const drop = new Set<number>();
  for (let i = 0; i < split.length; i++) {
    const token = split[i] || "";
    if (token === "garage") {
      drop.add(i);
      continue;
    }
    const n = feetNumber(token);
    if (n == null || !FEET_WORD.test(split[i + 1] || "")) continue;
    // Optional "or bigger" / "and up" / "plus" right after the feet word.
    let j = i + 2;
    let isOpen = false;
    if ((split[j] === "or" || split[j] === "and") && OPEN_ENDED.test(split[j + 1] || "")) {
      isOpen = true;
      j += 2;
    } else if (OPEN_ENDED.test(split[j] || "") && split[j] !== "up") {
      isOpen = true;
      j += 1;
    }
    const before = split[i - 1] || "";
    const before2 = split[i - 2] || "";
    if (/^(?:over|above)$/.test(before) || (before === "least" && before2 === "at")) isOpen = true;
    const touchesGarage =
      split[j] === "garage" ||
      split[i - 1] === "garage" ||
      (split[i - 1] === "of" && split[i - 2] === "garage");
    if (touchesGarage) {
      feet = n;
      adjacent = true;
      open = isOpen;
      for (let k = i; k < j; k++) drop.add(k);
      break;
    }
    if (saidGarage && !loose && n <= LOOSE_GARAGE_MAX_FT) {
      loose = { index: i, feet: n, open: isOpen };
      for (let k = i; k < j; k++) drop.add(k);
    }
  }
  if (!adjacent && loose) {
    feet = loose.feet;
    open = loose.open;
  } else if (adjacent && loose) {
    // The loose number was not the garage after all; keep its words.
    for (let k = loose.index; k < loose.index + 2; k++) drop.delete(k);
  }
  split.forEach((token, i) => {
    if (!drop.has(i)) kept.push(token);
  });
  if (feet == null || !Number.isFinite(feet)) {
    return { tokens: split.filter((t) => t !== "garage") };
  }
  if (open) {
    const rest = kept.filter((t, i) => !(OPEN_ENDED.test(t) && (kept[i - 1] === "or" || kept[i - 1] === "and")));
    return { tokens: rest, min: feet };
  }
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
 * "Not even close, I was talking about the Isata" is a question about the Isata.
 * The complaint around it is not a coach name.
 */
export function stripLotAside(raw: string): string {
  let s = normalizeLotQueryText(raw);
  if (!s) return "";
  s = s.replace(/\bnot even close\b/g, " ");
  s = s.replace(/\bi (?:was|am) talking about\b/g, " ");
  s = s.replace(/\bwhy cant you see(?: that)?\b/g, " ");
  s = s.replace(/\bwhy didnt you(?: see(?: that)?| notice(?: that)?| find (?:that|it|this))?\b/g, " ");
  s = s.replace(/\b(?:yeah|yep|yup|nah|nope)\b/g, " ");
  s = s.replace(/\bno i mean\b/g, " ");
  s = s.replace(/\bi mean\b/g, " ");
  return s.replace(/\s+/g, " ").trim();
}

/** "In inventory" and "all the stores" are the whole company, not the last lot. */
function asksWholeCompany(raw: string): boolean {
  const t = normalizeLotQueryText(raw);
  if (/\binventory\b/.test(t)) return true;
  return /\b(?:all|every|across)\b(?:\s+\w+){0,3}\s+store\b/.test(t);
}

/**
 * Spoken words fill filters the model left blank. They replace only the
 * filter they name. Body, fuel, location, year, length, and price the
 * model passed stay when the words do not name a different one.
 * A make or model that is not in the words is dropped. A follow-up keeps
 * the carried make, not a new word he did not say.
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
  const hadUtterance = Boolean(str(args.utterance));
  const spoken = stripLotAside(str(args.utterance));
  const queryText = stripLotAside(str(args.query));
  // "Yes", "go ahead", "are you looking for it?" name no coach. The tool
  // query carries the coach she offered ("Navion or EKKO"). Search that, not
  // the word yes, and do not rerun the last coach.
  const goAhead =
    hadUtterance &&
    isLotGoAhead(str(args.utterance)) &&
    Boolean(queryText) &&
    !isLotGoAhead(queryText) &&
    lotQueryHasSubject(queryText);
  // No separate spoken line: keep the tool filters and search the stripped question.
  if (!hadUtterance || goAhead) {
    const stripped = stripCarry({ ...base, query: queryText });
    return args.follow_up ? { ...stripped, follow_up: true } : stripped;
  }
  const utterance = spoken || queryText;
  if (!utterance) {
    const stripped = stripCarry({ ...base, query: "" });
    return args.follow_up ? { ...stripped, follow_up: true } : stripped;
  }

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
  if (str(next.location) && asksWholeCompany(utterance)) {
    const head =
      normalizeLotQueryText(str(next.location))
        .split(/\s+/)
        .find((word) => word.length >= 4) || "";
    if (!head || !normalizeLotQueryText(utterance).includes(head)) next.location = "";
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
    next.make = followUp ? str(args.carry_make) : "";
  }
  const model = str(base.model);
  if (model && !said.includes(normalizeLotQueryText(model))) {
    next.model = followUp ? str(args.carry_model) : "";
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
  if (likeCoachAsk(query)) return false;
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

/**
 * Talk around a lot question: "testing", "so", "okay", "what's a good
 * question", "sitting on the lot right now". None of these name a coach, and
 * none of them may filter the lot to zero or turn into a "Did you mean Destiny?".
 */
const LOT_FILLER = new Set([
  "actually", "again", "ago", "alright", "also", "anyway", "approx", "approximately",
  "ask", "asking", "ballpark", "basically", "bunch", "can", "check", "cool", "curious",
  "dealer", "dealership", "dollar", "dollars", "bucks", "entire", "estimate", "exactly", "gonna", "good", "got",
  "gotta", "great", "guess", "hand", "hmm", "honestly", "idea", "just", "kind", "kinds",
  "know", "let", "lets", "listen", "lot", "lots", "many", "maybe", "me", "mean",
  "moment", "much", "need", "nice", "ok", "okay", "okey", "on", "our", "overall",
  "please", "pretty", "question", "questions", "quick", "quickly", "real", "really",
  "right", "rough", "roughly", "say", "see", "sit", "sitting", "so", "sort", "still",
  "stock", "sure", "tell", "test", "testing", "thank", "thanks", "that", "the", "then",
  "there", "these", "they", "think", "this", "total", "totally", "type", "types", "uh",
  "um", "umm", "us", "wanna", "want", "we", "well", "what", "whats", "which", "wonder",
  "wondering", "yeah", "yep", "yes", "you", "your",
  // Function words and search talk: "look through our inventory and see if".
  "anything", "as", "browse", "by", "find", "finding", "from", "get", "getting",
  "give", "go", "going", "having", "if", "into", "it", "its", "look", "looking",
  "of", "search", "searching", "see", "seeing", "show", "some", "something",
  "through", "thru", "to", "whether", "with", "without",
]);

function isLotFillerWord(token: string): boolean {
  // Tokens arrive singular: "curious" reads as "curiou".
  return LOT_FILLER.has(token) || LOT_FILLER.has(`${token}s`) || STOP.has(token);
}

/** "how many", "inventory", "in stock", "on the lot", "total". */
const WHOLE_LOT_CUE =
  /\b(?:how many|inventory|in stock|on (?:the|our|a) lots?|total|count|number of|whole lot|entire lot)\b/;
/** A word for the lot itself, not a kind of coach. "Coaches" means RVs, not Coachmen. */
const WHOLE_LOT_NOUN = /\b(?:coach(?:es)?|rvs?|units?|rigs?|vehicles?|inventory)\b/;

function wholeLotWords(text: string): boolean {
  return WHOLE_LOT_CUE.test(text) && WHOLE_LOT_NOUN.test(text);
}

/**
 * "How many coaches do we have on the lot right now", "testing, how many
 * coaches are sitting on the lot", "what's a good question... how many coaches
 * we have on the lot right now": a count word, a lot word, and no class,
 * price, length, year, fuel, feature, place, sort, or coach name. That is the
 * whole lot. Spare words in the sentence do not shrink it.
 */
function wholeLotAsk(units: LotQueryUnit[], parsed: Parsed, text: string): boolean {
  const said = normalizeLotQueryText(text);
  if (!said || !wholeLotWords(said)) return false;
  if (isToyHaulerRejection(said) || isLotListExpansion(said)) return false;
  const lengthBounded = parsed.lengthMin != null || parsed.lengthMax != null;
  if (parsed.sort || parsed.close || parsed.listAll) return false;
  if (hasRecognizedFilter(parsed, lengthBounded)) return false;
  if (
    parsed.features?.length ||
    parsed.engine ||
    parsed.generator ||
    parsed.slidesMin != null ||
    parsed.slidesMax != null
  ) {
    return false;
  }
  if (likeCoachAsk(said)) return false;
  return parsed.tokens.every(
    (token) =>
      isLotFillerWord(token) ||
      (modelWordMiss(token, units) && !suggestName([token], units)),
  );
}

/**
 * The words in a lot question that could name a coach: what is left after
 * class, price, place, and spare talk are read off. Empty when he named no coach.
 */
export function lotQueryNamedWords(text: string, units: LotQueryUnit[]): string[] {
  if (!text) return [];
  return parseArgs(units, { query: text }).tokens.filter((token) => !isLotFillerWord(token));
}

/** Named words that are on no sheet coach at all ("Zorbatron" in "Winnebago Zorbatron"). */
export function lotQueryMissWords(text: string, units: LotQueryUnit[]): string[] {
  return lotQueryNamedWords(text, units).filter(
    (token) => !units.some((unit) => tokenHitsIdentity(unit, token)),
  );
}

/** True for a whole-lot count question with no filter in it (see wholeLotAsk). */
export function lotQueryIsWholeLotAsk(text: string, units: LotQueryUnit[]): boolean {
  if (!text) return false;
  return wholeLotAsk(units, parseArgs(units, { query: text }), text);
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

/**
 * Brand families. A model name is the coach, so a sister-brand make in the
 * same sentence does not hide it. "Winnebago Navion" is the Itasca Navion on
 * the sheet, and "Thor Four Winds" is the Thor Motor Coach Four Winds.
 */
const MAKE_FAMILIES: string[][] = [
  ["winnebago", "itasca", "grand design", "newmar"],
  ["thor", "thor motor coach", "thor ca", "four winds", "jayco", "entegra", "entegra coach", "tiffin", "airstream"],
  ["forest river", "coachmen", "dynamax", "dynamax corp", "east to west", "prime time", "palomino", "shasta"],
  ["fleetwood", "holiday rambler", "american coach", "monaco", "monaco rv"],
];

function makeFamilyOf(token: string): string[] | undefined {
  if (token.length < 4) return undefined;
  return MAKE_FAMILIES.find((family) =>
    family.some((make) => make.split(" ").some((word) => word === token || (word.length > 4 && word.startsWith(token)))),
  );
}

function unitInMakeFamily(unit: LotQueryUnit, token: string): boolean {
  const family = makeFamilyOf(token);
  if (!family) return false;
  const make = normalizeLotQueryText(unit.make || "");
  return family.some((member) => make === member || make.startsWith(`${member} `));
}

/** A make word, or a sister brand of it when the sentence also names a model. */
function makeTokenHits(unit: LotQueryUnit, token: string, family?: Set<string>): boolean {
  return tokenHitsMake(unit, token) || Boolean(family?.has(token) && unitInMakeFamily(unit, token));
}

/**
 * Make words that may stand for a sister brand. Only when the same sentence
 * names a model on the sheet: "Winnebago Navion" yes, "Winnebago" alone no.
 */
function familyMakeTokens(units: LotQueryUnit[], tokens: string[]): Set<string> | undefined {
  const models = tokens.filter((token) => units.some((unit) => tokenIsCoachName(unit, token, true)));
  if (!models.length) return undefined;
  const makes = tokens.filter(
    (token) =>
      !models.includes(token) &&
      Boolean(makeFamilyOf(token)) &&
      units.some((unit) => tokenHitsMake(unit, token) || unitInMakeFamily(unit, token)),
  );
  return makes.length ? new Set(makes) : undefined;
}

type ModelAlias = { spoken: string; key: string; display: string; distance: number };

/**
 * A model word that is not on the sheet, mapped to the sheet word.
 * Make-scoped when a make token already hit, so Ascenta is Isata on a
 * Dynamax row and not Aspen on the rest of the book.
 */
function modelAlias(units: LotQueryUnit[], tokens: string[]): ModelAlias | undefined {
  const misses = tokens.filter(
    (token) =>
      /^[a-z]{4,}$/.test(token) &&
      !SERIES_DIGIT[token] &&
      // "Testing" is not one sound off Destiny. Spare talk is not a coach.
      !isLotFillerWord(token) &&
      !units.some((unit) => tokenHitsIdentity(unit, token)),
  );
  if (!misses.length) return undefined;
  // The sentence already names a model on the sheet. A spare word is not
  // a second coach: "check" is not Creek, and "page" is not Pines.
  // A miss with no sheet model still maps (Asada → Isata, Ascenta → Isata).
  if (tokens.some((token) => units.some((unit) => tokenIsCoachName(unit, token, true)))) {
    return undefined;
  }
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

function tokenSatisfied(
  unit: LotQueryUnit,
  token: string,
  alias?: ModelAlias,
  family?: Set<string>,
): boolean {
  if (/^\d{1,2}$/.test(token)) return seriesDigitHits(unit, token);
  if (tokenHitsIdentity(unit, token)) return true;
  if (family?.has(token) && unitInMakeFamily(unit, token)) return true;
  return Boolean(alias && alias.spoken === token && nameHasWord(unit, alias.key));
}

function passesTokens(
  unit: LotQueryUnit,
  tokens: string[],
  alias?: ModelAlias,
  family?: Set<string>,
): boolean {
  return tokens.every((token) => tokenSatisfied(unit, token, alias, family));
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
    strongContentFilter(parsed, lengthRequired)
  );
}

/** Fuel, type, price, year, length, and the sheet specs. Not condition, status, or store. */
function strongContentFilter(parsed: Parsed, lengthRequired: boolean): boolean {
  return (
    parsed.body.kind !== "any" ||
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

/** A coach-shaped word that is not on any sheet row. "Looking" is not one of these. */
function modelWordMiss(token: string, units: LotQueryUnit[]): boolean {
  if (!/^[a-z]{4,}$/.test(token) || STOP.has(token)) return false;
  return !units.some((unit) => tokenHitsIdentity(unit, token));
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

/** The unpinned-garage line names the toy-hauler body the ask narrowed to. */
function garageBodyNoun(body: BodySpec): string {
  if (body.kind === "labels" && body.labels.length === 1) {
    if (body.labels[0] === "Fifth Wheel Toy Hauler") return "fifth wheel toy haulers";
    if (body.labels[0] === "Travel Trailer Toy Hauler") return "travel trailer toy haulers";
  }
  return "toy haulers";
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
    garagePinMode?: boolean;
    garageNoun?: string;
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
  if (notes.garagePinMode && notes.garageSkipped) {
    bits.push(unpinnedGarageLine(notes.garageSkipped, notes.garageNoun).replace(/\.$/, ""));
  } else if (notes.garageMissingSheet) {
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
function dropUnspokenCoachNarrowing(input: LotQueryArgs): LotQueryArgs {
  if (input.follow_up) return input;
  const text = normalizeLotQueryText(`${str(input.query)} ${str(input.utterance)}`);
  // "How many coaches" means RVs. A make of Coachmen (or a model of "coaches")
  // that he never said is not a filter.
  let args = input;
  const saidCoachmen = /\bcoachm[ae]n\b/.test(text);
  const coachish = (value: unknown) => /^coach(?:es|men|man)?$/.test(normalizeLotQueryText(str(value)));
  if (text && !saidCoachmen && (coachish(args.make) || coachish(args.model))) {
    args = {
      ...args,
      ...(coachish(args.make) ? { make: "" } : {}),
      ...(coachish(args.model) ? { model: "" } : {}),
    };
  }
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

const MOTORHOME_CLASS_LABELS = new Set([
  "Class A",
  "Class A Gas",
  "Class A Diesel",
  "Class B",
  "Class C",
  "Class Super C",
]);

/**
 * Motorhome class questions keep the sheet count, and also list every
 * motorhome in that same store and filter. The sheet label is a filing.
 * She reads the names and the chassis.
 */
function measuredClassAsk(parsed: Parsed): boolean {
  return Boolean(
    parsed.sort ||
      parsed.listAll ||
      parsed.lengthMin != null ||
      parsed.lengthMax != null ||
      parsed.priceMin != null ||
      parsed.priceMax != null ||
      parsed.milesMin != null ||
      parsed.milesMax != null ||
      parsed.horsepower != null ||
      parsed.displacement ||
      parsed.bed ||
      parsed.sleepsMin != null ||
      parsed.garageMin != null ||
      parsed.garageMax != null ||
      parsed.slidesMin != null ||
      parsed.slidesMax != null ||
      parsed.generator ||
      parsed.generatorFuel ||
      parsed.engine ||
      parsed.features?.length,
  );
}

function motorhomeRoster(units: LotQueryUnit[], parsed: Parsed): LotQueryUnit[] {
  if (parsed.body.kind !== "labels") return [];
  if (!parsed.body.labels.every((label) => MOTORHOME_CLASS_LABELS.has(label))) return [];
  if (measuredClassAsk(parsed)) return [];
  const namedCoach = parsed.tokens.some((token) =>
    units.some((unit) => tokenIsCoachName(unit, token)),
  );
  if (namedCoach) return [];
  const open: Parsed = { ...parsed, body: { kind: "motorhome" } };
  return units.filter((unit) => passesStructured(unit, open, false));
}

/** A named coach the sheet filed under a different motorhome class stays in the answer. */
function sameNameMotorhomes(
  units: LotQueryUnit[],
  matched: LotQueryUnit[],
  parsed: Parsed,
): LotQueryUnit[] {
  if (parsed.body.kind !== "labels") return matched;
  if (!parsed.body.labels.every((label) => MOTORHOME_CLASS_LABELS.has(label))) return matched;
  const names = parsed.tokens.filter((token) =>
    units.some((unit) => tokenIsCoachName(unit, token, true)),
  );
  if (!names.length) return matched;
  const seen = new Set(matched.map((unit) => unit.stock_number || ""));
  const extra = units.filter((unit) => {
    const stock = unit.stock_number || "";
    if (stock && seen.has(stock)) return false;
    if (!isMotorhome(unit.body_type || "")) return false;
    if (!names.every((token) => tokenIsCoachName(unit, token, true))) return false;
    if (!conditionMatches(unit, parsed.condition)) return false;
    if (!statusMatches(unit, parsed.status)) return false;
    if (!locationMatches(unit, parsed.location, parsed.places)) return false;
    if (!yearMatches(unit, parsed.yearMin, parsed.yearMax)) return false;
    if (!priceMatches(unit, parsed.priceMin, parsed.priceMax)) return false;
    if (!fuelMatches(unit, parsed.fuel)) return false;
    if (!powerMatches(unit, parsed.horsepower, parsed.displacement)) return false;
    if (parsed.bed && listingFeatureState(unit, parsed.bed) !== "yes") return false;
    return true;
  });
  return extra.length ? matched.concat(extra) : matched;
}

function sheetDisagreement(units: LotQueryUnit[], body: BodySpec): string {
  if (body.kind !== "labels" || !units.length) return "";
  const asked = new Set(body.labels);
  const off = units.filter((unit) => {
    const label = (unit.body_type || "").trim();
    return Boolean(label) && !asked.has(label);
  });
  if (!off.length) return "";
  return `Sheet label disagrees with the question.\n${off
    .slice(0, 6)
    .map((unit) => rosterLine(unit))
    .join("\n")}\nThe name and the chassis are the coach.`;
}

function rosterLine(unit: LotQueryUnit): string {
  const name = [unit.year, unit.make, unit.model, unit.trim].filter(Boolean).join(" ");
  const chassis = sheetChassis(unit);
  const gvwr = sheetGvwr(unit);
  return [
    name,
    `sheet ${unit.body_type || "unlabeled"}`,
    chassis ? `chassis ${chassis}` : "chassis blank",
    gvwr ? `gvwr ${gvwr}` : "",
    unit.location || "",
    unit.stock_number ? `stk ${unit.stock_number}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}

type ListedName = {
  /** The name as said: "Navion", "EKKO 23B". */
  label: string;
  tokens: string[];
  /** Words that are a model on the sheet. */
  models: string[];
  /** Other words on some coach (make, floorplan, stock). Spare words are dropped. */
  rest: string[];
  family?: Set<string>;
};

const LIST_SPLIT = /\s*(?:\bor\b|\band\b|\bvs\.?\b|\bversus\b|\bplus\b|[,/&+])\s*/i;

function labelFromWords(part: string, keep: string[], cased = ""): string {
  const split = (text: string) =>
    text
      .split(/\s+/)
      .map((word) => word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ""))
      .filter(Boolean);
  const words = split(part);
  const casedWords = split(cased);
  const hits = (word: string, token: string) => {
    const said = normalizeLotQueryText(word);
    return token === said || singularizeLotToken(said) === token;
  };
  // Spoken case wins: "EKKO", not "ekko".
  const picked = keep.map(
    (token) =>
      casedWords.find((word) => hits(word, token) && /[A-Z]/.test(word)) ||
      words.find((word) => hits(word, token)) ||
      token,
  );
  const label = (picked.length ? picked : words).join(" ");
  return label
    .split(" ")
    .map((word) =>
      /[A-Z]/.test(word)
        ? word
        : /\d/.test(word)
          ? word.toUpperCase()
          : word.replace(/^[a-z]/, (c) => c.toUpperCase()),
    )
    .join(" ");
}

/**
 * "Navion or EKKO 23B", "the Lineage and the Isata". Two or more names in one
 * question. Empty when the sentence is one coach plus features
 * ("Lineage with slides and solar"): a part with no model on the sheet only
 * counts when none of its words are on any coach.
 */
function listedCoachNames(units: LotQueryUnit[], query: string, cased = ""): ListedName[] {
  const raw = str(query);
  if (!raw || !LIST_SPLIT.test(raw)) return [];
  const parts = raw.split(LIST_SPLIT).map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return [];
  const places = locationWords(units);
  const out: ListedName[] = [];
  for (const part of parts) {
    const said = normalizeLotQueryText(part);
    if (!said) continue;
    const tokens = identityTokens(consumeListingAliases(said.split(/\s+/)).join(" "), places).filter(
      (token) => !STOP.has(token),
    );
    if (!tokens.length) continue;
    // A floorplan code ("23B") is not a coach name on its own.
    const models = tokens.filter(
      (token) => /^[a-z]{4,}$/.test(token) && units.some((unit) => tokenIsCoachName(unit, token, true)),
    );
    const family = familyMakeTokens(units, tokens);
    const rest = tokens.filter(
      (token) =>
        !models.includes(token) &&
        (units.some((unit) => tokenHitsIdentity(unit, token)) || Boolean(family?.has(token))),
    );
    if (!models.length) {
      // A coach-shaped name that is on no sheet row: "EKKO", "EKKO 23B".
      const alpha = tokens.filter((token) => /^[a-z]+$/.test(token));
      const offSheet =
        alpha.length > 0 && alpha.every((token) => !units.some((unit) => tokenHitsIdentity(unit, token)));
      const makeOnly = tokens.every((token) => units.some((unit) => tokenHitsMake(unit, token)));
      if (!offSheet || makeOnly) {
        if (makeOnly) continue;
        return [];
      }
    }
    out.push({
      label: labelFromWords(part, models.length ? models : tokens, cased),
      tokens,
      models,
      rest,
      family,
    });
  }
  const withModels = out.filter((name) => name.models.length);
  if (out.length < 2 || !withModels.length) return [];
  return out;
}

const NOT_A_COACH_NAME = new Set([
  "class",
  "super",
  "sprinter",
  "mercedes",
  "benz",
  "ford",
  "transit",
  "ram",
  "promaster",
  "chevy",
  "chevrolet",
  "freightliner",
  "spartan",
  "rv",
  "rvs",
  "i",
  "ok",
  "okay",
  "yes",
  "no",
  "the",
  "lot",
  "want",
]);

function sheetModelWord(units: LotQueryUnit[], token: string): boolean {
  if (token.length < 3 || STOP.has(token) || NOT_A_COACH_NAME.has(token)) return false;
  return units.some((unit) =>
    normalizeLotQueryText(`${unit.model || ""} ${unit.series || ""}`).split(/\s+/).includes(token),
  );
}

function isMakeWord(units: LotQueryUnit[], token: string): boolean {
  return units.some((unit) => normalizeLotQueryText(unit.make || "").split(/\s+/).includes(token));
}

/**
 * Coach names she just offered: "Winnebago also builds the Navion and the
 * EKKO 23B." A name is a model word on the sheet, or an all-caps or
 * capitalized name listed with one ("EKKO 23B" next to "Navion").
 * Makes and chassis words are not names.
 */
export function offeredCoachNames(text: string, units: LotQueryUnit[]): string[] {
  const raw = str(text);
  if (!raw) return [];
  const words = raw.split(/\s+/);
  type Group = { words: string[]; sheet: boolean; caps: boolean; start: number; end: number };
  const groups: Group[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = (words[i] || "").replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, "");
    if (!word || !/^[A-Z]/.test(word)) continue;
    const token = normalizeLotQueryText(word);
    if (!token || NOT_A_COACH_NAME.has(token) || STOP.has(token)) continue;
    const sheet = sheetModelWord(units, token);
    const caps = /^[A-Z][A-Z0-9]{2,}$/.test(word);
    if (!sheet && isMakeWord(units, token)) continue;
    if (!sheet && !caps && !/^[A-Z][a-z]{3,}$/.test(word)) continue;
    const group: Group = { words: [word], sheet, caps, start: i, end: i };
    // A floorplan code right after the name: "EKKO 23B", "View 24D".
    const next = (words[i + 1] || "").replace(/[^A-Za-z0-9]+$/g, "");
    if (/^\d{2,3}[A-Za-z]{0,3}$/.test(next) && !/[.,;:!?]$/.test(words[i] || "")) {
      group.words.push(next);
      group.end = i + 1;
      i += 1;
    }
    groups.push(group);
  }
  const joined = (a: Group, b: Group): boolean => {
    const between = words
      .slice(a.end + 1, b.start)
      .join(" ")
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .trim();
    return /^(?:(?:and|or|plus)(?:\s+(?:the|a|an))?|the)?$/.test(between) &&
      (between !== "" || /,$/.test(words[a.end] || ""));
  };
  const keep = groups.map((group) => group.sheet);
  for (let i = 0; i < groups.length; i++) {
    if (keep[i]) continue;
    const group = groups[i]!;
    if (!group.caps && !/^[A-Z][a-z]{3,}$/.test(group.words[0] || "")) continue;
    const prev = groups[i - 1];
    const next = groups[i + 1];
    if ((prev && keep[i - 1] && joined(prev, group)) || (next && next.sheet && joined(group, next))) {
      keep[i] = true;
    }
  }
  const out: string[] = [];
  groups.forEach((group, index) => {
    if (!keep[index]) return;
    const name = group.words.join(" ");
    if (!out.some((seen) => seen.toLowerCase() === name.toLowerCase())) out.push(name);
  });
  return out;
}

/**
 * "Yes", "go ahead", "are you looking for it?", "did you check?". The
 * salesman said go, not which coach. The coach is in the tool query or in
 * what she just offered.
 */
export function isLotGoAhead(text: string): boolean {
  const said = normalizeLotQueryText(text);
  if (!said) return false;
  const words = said.split(/\s+/);
  const allowed = new Set([
    "yes", "yeah", "yep", "yup", "sure", "ok", "okay", "please", "go", "ahead", "do", "it", "that",
    "this", "check", "checking", "look", "looking", "search", "searching", "find", "see", "are", "you",
    "did", "can", "could", "would", "will", "for", "them", "those", "these", "one", "ones", "the", "our",
    "lot", "on", "in", "stock", "inventory", "if", "we", "have", "any", "up", "still", "now", "right",
    "thanks", "thank", "both", "of", "and", "to", "me", "a", "let", "lets", "s",
  ]);
  if (!words.every((word) => allowed.has(word))) return false;
  return words.some((word) =>
    /^(?:yes|yeah|yep|yup|sure|ok|okay|please|go|check|checking|look|looking|search|searching|find)$/.test(word),
  );
}

/**
 * "Anything on the lot that's like a View", "comparable to a View", "what's
 * close to a View", "alternatives to a View", "similar units": other coaches,
 * not another count of that View.
 */
function likeCoachAsk(text: string): boolean {
  const said = normalizeLotQueryText(text);
  return (
    /\b(?:anything|something)\s+(?:else\s+)?(?:(?:kind|sort) of\s+)?like\b/.test(said) ||
    /\b(?:anything|something|one|other)\b(?:\s+\w+){0,6}?\s+(?:that|which|is|are|look)\s+(?:\w+\s+)?like\s+(?:the|a|an|that|our|this)\b/.test(said) ||
    /\b(?:other|others|else|unit|coach|one|rig)\s+(?:\w+\s+){0,2}like\s+(?:the|a|an|that|our)\b/.test(said) ||
    /\b(?:similar|comparable|alternative|equivalent)\b/.test(said) ||
    /\b(?:what|anything|something)\s+(?:\w+\s+){0,3}close to\s+(?:a|an|the|that|our)\s+(?!\d)/.test(said)
  );
}

/** True for "anything like a View", "similar units", "comparable to a View". */
export function lotQueryIsLikeAsk(text: string): boolean {
  return Boolean(text) && likeCoachAsk(text);
}

function chassisFamily(unit: LotQueryUnit): string {
  const raw = sheetChassis(unit).toLowerCase();
  if (raw.includes("sprinter")) return "sprinter";
  if (raw.includes("freightliner")) return "freightliner";
  if (raw.includes("spartan")) return "spartan";
  if (raw.includes("promaster")) return "promaster";
  if (raw.includes("transit")) return "transit";
  if (raw.includes("prevost")) return "prevost";
  return "";
}

function chassisFamilyLabel(family: string): string {
  if (family === "sprinter") return "Sprinter";
  if (family === "freightliner") return "Freightliner";
  if (family === "spartan") return "Spartan";
  if (family === "promaster") return "ProMaster";
  if (family === "transit") return "Transit";
  if (family === "prevost") return "Prevost";
  return family;
}

/**
 * Other coaches on the same chassis, near the same length, with the same
 * sheet body. The named coach stays out. A class the salesman did not say
 * stays out, so this does not become a Super C count.
 */
function similarCoaches(
  units: LotQueryUnit[],
  anchors: LotQueryUnit[],
  parsed: Parsed,
  modelTokens: string[],
): LotQueryUnit[] {
  const families = new Set(anchors.map(chassisFamily).filter(Boolean));
  if (!families.size) return [];
  const bodies = new Set(anchors.map((unit) => (unit.body_type || "").trim()).filter(Boolean));
  const lengths = anchors
    .map((unit) => lotUnitLength(unit).ft)
    .filter((feet): feet is number => feet != null);
  const seen = new Set(anchors.map((unit) => unit.stock_number || ""));
  return units.filter((unit) => {
    const stock = unit.stock_number || "";
    if (stock && seen.has(stock)) return false;
    if (modelTokens.some((token) => tokenIsCoachName(unit, token, true))) return false;
    const family = chassisFamily(unit);
    if (!family || !families.has(family)) return false;
    const body = (unit.body_type || "").trim();
    if (bodies.size && !bodies.has(body)) return false;
    if (lengths.length) {
      const feet = lotUnitLength(unit).ft;
      if (feet == null) return false;
      if (!lengths.some((anchor) => Math.abs(anchor - feet) <= 2)) return false;
    }
    if (!conditionMatches(unit, parsed.condition)) return false;
    if (!statusMatches(unit, parsed.status)) return false;
    if (!locationMatches(unit, parsed.location, parsed.places)) return false;
    if (!yearMatches(unit, parsed.yearMin, parsed.yearMax)) return false;
    if (!priceMatches(unit, parsed.priceMin, parsed.priceMax)) return false;
    if (!fuelMatches(unit, parsed.fuel)) return false;
    return true;
  });
}

/**
 * Search the caller's own-lot units. `matched` is the full hit count.
 * `units` is the top N rows. A close make/model miss returns those sheet
 * units and sets `did_you_mean`. It does not open the rest of the book.
 */
/** Content words that hit some coach (not spare talk, not a word on no coach). */
function realWordsOnSomeCoach(tokens: string[], units: LotQueryUnit[]): string[] {
  return tokens.filter(
    (token) =>
      !isLotFillerWord(token) &&
      /[a-z]{3,}/.test(token) &&
      !units.some((unit) => tokenIsCoachName(unit, token)) &&
      units.some((unit) => tokenHitsIdentity(unit, token)),
  );
}

/** Words that are not a coach name or a make: a feature ("residential", "refrigerator"). */
function featureTokensOf(tokens: string[], units: LotQueryUnit[]): string[] {
  return tokens.filter(
    (token) =>
      /^[a-z]{4,}$/.test(token) &&
      !isLotFillerWord(token) &&
      !units.some((unit) => tokenIsCoachName(unit, token) || tokenHitsMake(unit, token)),
  );
}

function featurePhrase(words: string[]): string {
  return words.join(" ").replace(/\bwasher\b/, "washer and dryer");
}

export function searchLot(units: LotQueryUnit[], args: LotQueryArgs = {}): LotQueryResult {
  const clean = dropUnspokenCoachNarrowing(reconcileLotArgs(args));
  const parsedArgs = parseArgs(units, clean);
  // "Testing, how many coaches are sitting on the lot right now" is the whole
  // lot. The spare words are not a model name and do not zero it out.
  const wholeLot =
    !str(clean.make) &&
    !str(clean.model) &&
    !clean.follow_up &&
    wholeLotAsk(units, parsedArgs, `${str(clean.query)} ${str(clean.utterance)}`);
  // "Look through our inventory and see if we have any Super Cs that have
  // residential refrigerators": "through" and "if" are spare talk. They do not
  // AND the feature words down to zero (and then open the whole class).
  const contentTokens = parsedArgs.tokens.filter((token) => !isLotFillerWord(token));
  const parsed = wholeLot
    ? { ...parsedArgs, tokens: [] }
    : contentTokens.length && contentTokens.length < parsedArgs.tokens.length
      ? { ...parsedArgs, tokens: contentTokens }
      : parsedArgs;
  const lengthBounded = parsed.lengthMin != null || parsed.lengthMax != null;
  const lengthRequired = lengthBounded || parsed.sort === "length";
  const structured = units.filter((unit) => passesStructured(unit, parsed, lengthRequired));
  const alias = modelAlias(units, parsed.tokens);
  // "Winnebago Navion": the sheet files the Navion under Itasca. A make word
  // next to a model name also accepts its sister brands.
  const family = familyMakeTokens(units, parsed.tokens);
  let matched = parsed.tokens.length
    ? structured.filter((unit) => passesTokens(unit, parsed.tokens, alias, family))
    : structured;
  // "Check the lot for a Navion" names Navion. "check" is not on a coach.
  // Keep the named model, a make in the same sentence (or its sister brand),
  // and any other word that is on some coach (a stock number, a floorplan).
  // Only words that are on no coach at all are dropped. Class, price, year,
  // store, fuel, and bed still apply.
  if (!matched.length && !alias && parsed.tokens.length) {
    const models = parsed.tokens.filter((token) =>
      units.some((unit) => tokenIsCoachName(unit, token, true)),
    );
    if (models.length) {
      const makes = parsed.tokens.filter(
        (token) =>
          !models.includes(token) &&
          units.some((unit) => makeTokenHits(unit, token, family)),
      );
      const kept = parsed.tokens.filter(
        (token) =>
          !models.includes(token) &&
          !makes.includes(token) &&
          units.some((unit) => tokenHitsIdentity(unit, token)),
      );
      const named = units.filter(
        (unit) =>
          models.every((token) => tokenIsCoachName(unit, token, true)) &&
          makes.every((token) => makeTokenHits(unit, token, family)) &&
          passesTokens(unit, kept) &&
          passesStructured(unit, parsed, lengthRequired),
      );
      if (named.length) matched = named;
    }
  }
  // Spare talk ("okay", "testing", "sitting", "what's a good question") is
  // on no coach name. When it is the only thing left, it does not zero out a
  // search that is otherwise unfiltered (or filtered only by class, price, used).
  if (
    !matched.length &&
    !alias &&
    parsed.tokens.length &&
    parsed.tokens.every((token) => isLotFillerWord(token))
  ) {
    matched = structured;
  }
  // "Navion or EKKO 23B" is two coaches. Search each name and return both
  // sets, so one name that is not on the sheet does not hide the other.
  const listed = listedCoachNames(
    units,
    str(clean.query),
    [args.utterance, args.query].map((value) => str(value)).join(" "),
  );
  let listedNote = "";
  if (listed.length) {
    const sets = listed.map((name) =>
      units.filter(
        (unit) =>
          passesStructured(unit, parsed, lengthRequired) &&
          (name.models.length
            ? name.models.every((token) => tokenIsCoachName(unit, token, true)) &&
              name.rest.every((token) => tokenSatisfied(unit, token, undefined, name.family))
            : passesTokens(unit, name.tokens, undefined, name.family)),
      ),
    );
    const seen = new Set<LotQueryUnit>();
    matched = [];
    for (const set of sets) {
      for (const unit of set) {
        if (seen.has(unit)) continue;
        seen.add(unit);
        matched.push(unit);
      }
    }
    listedNote = listed
      .map((name, index) =>
        sets[index]!.length
          ? `${name.label}: ${sets[index]!.length} on the lot.`
          : `${name.label}: not on the lot.`,
      )
      .join(" ");
  }
  // Spare words ("looking", "right", "try again", "anything") are not a coach name.
  // If used / diesel / class / price already picked a set, keep that set.
  // A real name that the class filter missed (Class A Lineage) still returns that coach.
  // A model word that is one sound off stays on that sheet coach. It does not open the book.
  const recognized = hasRecognizedFilter(parsed, lengthRequired);
  // Feature words ("residential refrigerator") that are on some coach but on
  // none in this set, thrown away to keep the class. Reported, never hidden.
  let droppedWords: string[] = [];
  if (!matched.length && parsed.tokens.length && recognized && !alias) {
    const names = parsed.tokens.filter((token) =>
      units.some((unit) => tokenIsCoachName(unit, token)),
    );
    // Condition, status, and store are not enough to throw away a model word.
    // "New Qwertyplugh" is none, not the new book. Diesel plus a junk token
    // still keeps the diesel set.
    const misses = parsed.tokens.filter((token) => modelWordMiss(token, units));
    const openBook = misses.length === 0 || strongContentFilter(parsed, lengthRequired);
    if (openBook && names.length) {
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
      if (byName.length) {
        matched = byName;
        droppedWords = realWordsOnSomeCoach(
          parsed.tokens.filter((token) => !names.includes(token)),
          units,
        );
      }
    } else if (openBook) {
      matched = structured;
      droppedWords = realWordsOnSomeCoach(parsed.tokens, units);
    }
  }
  // A name with no class, fuel, or price can still use the plain bar.
  // Do not run that bar over a sentence that already named a real filter,
  // and do not use it to throw away a model word that missed.
  if (!matched.length && !recognized && !alias) {
    // Spare talk ("anything", "look", "see") is not a name on the plain bar either.
    const plainTokens = plainTypeaheadTokens(
      [clean.query, clean.make, clean.model].filter(Boolean).join(" "),
    ).filter((token) => !isLotFillerWord(token));
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
  matched = sameNameMotorhomes(units, matched, parsed);
  const likeAsk = likeCoachAsk(`${str(clean.query)} ${str(clean.utterance)}`);
  let similarNote = "";
  // Sister-brand makes of the coach he named sort first ("like the View" →
  // the Itasca Navion before a Thor Siesta).
  let similarFamilyMakes: string[] = [];
  let similarTo = "";
  if (likeAsk && matched.length) {
    const modelTokens = parsed.tokens.filter((token) =>
      units.some((unit) => tokenIsCoachName(unit, token, true)),
    );
    const anchors = modelTokens.length
      ? matched.filter((unit) => modelTokens.some((token) => tokenIsCoachName(unit, token, true)))
      : [];
    const others = anchors.length ? similarCoaches(units, anchors, parsed, modelTokens) : [];
    if (anchors.length) {
      similarTo = parsed.tokens
        .filter((token) =>
          anchors.some((unit) => tokenIsCoachName(unit, token, true) || tokenHitsMake(unit, token)),
        )
        .join(" ");
    }
    if (others.length) {
      matched = others;
      const family = chassisFamily(anchors.find((unit) => chassisFamily(unit)) || anchors[0]!);
      similarNote = family
        ? `Other ${chassisFamilyLabel(family)} coaches near that size.`
        : "Other coaches near that size.";
      const anchorMakes = [...new Set(anchors.map((unit) => normalizeLotQueryText(unit.make || "")))];
      similarFamilyMakes = anchorMakes.flatMap((make) => {
        const word = make.split(/\s+/)[0] || "";
        return makeFamilyOf(word) || [make];
      });
      // Name the coach he asked about and the closest sister-brand match.
      const anchorLine = oneLine(anchors, countsFor(anchors), { kind: "any" })
        .replace(/\s*Top:.*$/, "")
        .replace(/^Matching units:\s*/, "")
        .replace(/,\s*all \w+\.?$/, "")
        .replace(/\.$/, "");
      const sisters = others.filter((unit) =>
        similarFamilyMakes.some((member) => {
          const make = normalizeLotQueryText(unit.make || "");
          return make === member || make.startsWith(`${member} `);
        }),
      );
      const sisterLine = sisters.length
        ? oneLine(sisters, countsFor(sisters), { kind: "any" })
            .replace(/\s*Top:.*$/, "")
            .replace(/^Matching units:\s*/, "")
            .replace(/\.$/, "")
        : "";
      similarNote = `${similarNote.replace(/\.$/, "")}, not counting the ${anchorLine}.${
        sisterLine ? ` Closest: ${sisterLine}, same family.` : ""
      }`;
    } else if (anchors.length) {
      matched = [];
      similarNote = "None like that on the lot.";
    }
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
  let garagePinMode = false;
  const pinBook = args.garage_pins;
  if (garageBounded && pinBook && Object.keys(pinBook).length) {
    garagePinMode = true;
    const ask = garageAskFeet(parsed.garageMin, parsed.garageMax);
    if (ask != null) {
      const split = splitPinnedGarages(matched, pinBook, ask);
      garageSkipped = split.unpinned;
      matched = split.pinned;
    }
  } else if (garageBounded) {
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
    if (garageBounded && !garageMissingSheet && !garagePinMode) {
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
  // Base layer: the dumb type-ahead bar. If a model name in the question or
  // the tool call is on the sheet, the answer is never none. Filters narrow
  // that set; when they would empty it, say so and give the set.
  let baseNote = "";
  let byNameNote = "";
  if (!matched.length && !similarNote && !featureBlank && !featureNo) {
    const askText = [args.query, args.model, args.utterance, clean.query, clean.model]
      .map((value) => str(value))
      .filter(Boolean)
      .join(" ");
    const baseTokens = [
      ...new Set([
        ...parsed.tokens,
        ...parseArgs(units, { query: askText }).tokens,
      ]),
    ].filter((token) => units.some((unit) => tokenIsCoachName(unit, token, true)));
    // A model word beats a floorplan code: "Navion EKKO 23B" is the Navion,
    // not every 23B on the lot.
    const words = baseTokens.filter((token) => /^[a-z]{4,}$/.test(token));
    if (words.length) baseTokens.splice(0, baseTokens.length, ...words);
    if (baseTokens.length) {
      const all = units.filter((unit) =>
        baseTokens.every((token) => tokenIsCoachName(unit, token, true)),
      );
      const base = all.length
        ? all
        : units.filter((unit) => baseTokens.some((token) => tokenIsCoachName(unit, token, true)));
      // Filters he said in this sentence narrow the name set. A filter he did
      // not say (a carried store, a class the model added) does not empty it.
      const spokenText = str(args.utterance) || str(args.query);
      const spoken = parseArgs(units, { query: spokenText });
      const saidLocationHead =
        normalizeLotQueryText(parsed.location)
          .split(/\s+/)
          .find((word) => word.length >= 4) || "";
      const said: Parsed = {
        ...parsed,
        body: spoken.body.kind !== "any" ? parsed.body : { kind: "any" },
        condition: spoken.condition ? parsed.condition : "",
        status: spoken.status ? parsed.status : "",
        location:
          saidLocationHead && normalizeLotQueryText(spokenText).includes(saidLocationHead)
            ? parsed.location
            : "",
        places: spoken.places.length ? parsed.places : [],
        yearMin: spoken.yearMin != null || spoken.yearMax != null ? parsed.yearMin : undefined,
        yearMax: spoken.yearMin != null || spoken.yearMax != null ? parsed.yearMax : undefined,
        priceMin: spoken.priceMin != null || spoken.priceMax != null ? parsed.priceMin : undefined,
        priceMax: spoken.priceMin != null || spoken.priceMax != null ? parsed.priceMax : undefined,
        lengthMin: spoken.lengthMin != null || spoken.lengthMax != null ? parsed.lengthMin : undefined,
        lengthMax: spoken.lengthMin != null || spoken.lengthMax != null ? parsed.lengthMax : undefined,
        fuel: spoken.fuel ? parsed.fuel : "",
      };
      const saidLength = said.lengthMin != null || said.lengthMax != null;
      const narrowed = base.filter((unit) => passesStructured(unit, parsed, lengthRequired));
      const saidNarrowed = narrowed.length
        ? narrowed
        : base.filter((unit) => passesStructured(unit, said, saidLength));
      if (saidNarrowed.length) {
        matched = saidNarrowed;
        if (!narrowed.length) baseNote = "Not with every filter named.";
      } else if (base.length) {
        // He said the filter ("how many of those are used"). The count is
        // zero, but the name is on the lot. Say both. Never a bare none.
        const line = oneLine(base, countsFor(base), { kind: "any" }).replace(/\s*Top:.*$/, "");
        byNameNote = `None with those filters. By name, the lot has ${line.replace(/^Matching units:\s*/, "").replace(/\.$/, "")}.`;
      }
    }
  }
  // "Winnebago Navion" landed on Itasca rows. Say the sheet make.
  let makeNote = "";
  if (matched.length && family?.size && !similarNote) {
    const missed = [...family].filter((token) => !matched.some((unit) => tokenHitsMake(unit, token)));
    if (missed.length) {
      const sheetMakes = [...new Set(matched.map((unit) => unit.make).filter(Boolean))];
      if (sheetMakes.length) {
        makeNote = `The sheet lists ${sheetMakes.length === 1 ? "it" : "them"} under ${sheetMakes.join(" and ")}, a ${capitalizeWord(missed[0]!)} family brand.`;
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
      if (similarNote && parsed.sort == null) {
        const inFamily = (unit: LotQueryUnit) => {
          const make = normalizeLotQueryText(unit.make || "");
          return similarFamilyMakes.some((member) => make === member || make.startsWith(`${member} `))
            ? 0
            : 1;
        };
        const byFamily = inFamily(a.unit) - inFamily(b.unit);
        if (byFamily !== 0) return byFamily;
        const ap = a.unit.price ?? Number.POSITIVE_INFINITY;
        const bp = b.unit.price ?? Number.POSITIVE_INFINITY;
        if (ap !== bp) return ap - bp;
      } else if (parsed.tokens.length) {
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
          similarNote ? { kind: "any" } : parsed.body,
          similarNote.startsWith("None") ? undefined : didYouMean,
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
      garagePinMode,
      garageNoun: garageBodyNoun(parsed.body),
      lengthMin: parsed.lengthMin,
      lengthMax: parsed.lengthMax,
    },
  );
  if (baseNote && matched.length) {
    // Lead with the miss on the filters, then the name hits. Never "None."
    summary = `${baseNote} By name on the lot: ${summary.replace(/^Matching units:\s*/, "")}`;
  }
  for (const note of [makeNote, listedNote]) {
    if (note && matched.length && !summary.includes(note)) {
      summary = `${summary.replace(/\s+$/, "").replace(/\.$/, "")}. ${note}`;
    }
  }
  if (listedNote && !matched.length) summary = `None. ${listedNote}`;
  if (byNameNote && !matched.length) summary = byNameNote;
  if (similarNote.startsWith("None")) {
    summary = similarNote.endsWith(".") ? similarNote : `${similarNote}.`;
  } else if (similarNote && matched.length && !summary.includes(similarNote)) {
    summary = summary.replace(/^([^.]*\.)/, `$1 ${similarNote}`);
  }
  if (garagePinMode && matched.length) {
    const ask = garageAskFeet(parsed.garageMin, parsed.garageMax);
    const extra = [garageSourceSentence(), garageFitSentence(ask)]
      .filter(Boolean)
      .join(" ");
    if (extra && !summary.includes(extra)) summary = `${summary.replace(/\s+$/, "")} ${extra}`;
  }
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
  const disagreed = sheetDisagreement(sorted, parsed.body);
  if (disagreed) summary += `\n${disagreed}`;
  // A feature on the spec sheet counts. One only in the listing details, the
  // page text, or the site's feature tags "may" be there: check the floorplan.
  const featureWords = droppedWords.length
    ? [...(parsed.features || [])]
    : [...(parsed.features || []), ...featureTokensOf(parsed.tokens, units)];
  let featureConfirmed: number | undefined;
  if (featureWords.length && matched.length) {
    featureConfirmed = matched.filter((unit) =>
      featureWords.every((word) => lotSheetConfirms(unit, word)),
    ).length;
    const label = featurePhrase(featureWords);
    const mentioned = matched.length - featureConfirmed;
    let note = "";
    if (featureConfirmed === 0) {
      note = `The ${label} is mentioned in ${matched.length === 1 ? "that listing" : "these listings"}, not confirmed on the spec sheet, so ${matched.length === 1 ? "it may have one" : "they may have one"}. Check the floorplan.`;
    } else if (mentioned > 0) {
      note = `${featureConfirmed} ${featureConfirmed === 1 ? "has" : "have"} the ${label} on the spec sheet. ${mentioned} more only mention it in the listing, so they may have one. Check the floorplan.`;
    } else {
      note = `The spec sheet confirms the ${label}.`;
    }
    summary = `${summary.replace(/\s+$/, "").replace(/\.$/, "")}. ${note}`;
  }
  if (droppedWords.length && matched.length) {
    summary = `${summary.replace(/\s+$/, "").replace(/\.$/, "")}. No listing in this set mentions ${droppedWords.join(" ")}.`;
  }
  const nameRoster = (featureWords.length || droppedWords.length ? [] : motorhomeRoster(units, parsed)).map(rosterLine);
  if (nameRoster.length) {
    summary += `\nNAME ROSTER (${nameRoster.length} motorhomes in this search). The sheet count above is only how the dealer filed them. A Super C is a Class C body on a truck, not a van. You know these names. Count the ones you know fit what he asked. When the sheet disagrees, say both. If the chassis is blank and you do not know the name, say you are not sure. Do not invent a coach that is not on this roster.`;
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
    ...(nameRoster.length ? { name_roster: nameRoster } : {}),
    ...(featureBlank ? { feature_blank: featureBlank } : {}),
    ...(featureWords.length && featureConfirmed != null
      ? { feature_words: featureWords, feature_confirmed: featureConfirmed }
      : {}),
    ...(droppedWords.length ? { dropped_words: droppedWords } : {}),
    ...(didYouMean && !similarNote ? { did_you_mean: didYouMean } : {}),
    ...(parsed.close && matched.length ? { close: parsed.close } : {}),
    ...(similarTo ? { similar_to: similarTo } : {}),
  };
}

/** Chat context block. One summary line, then the top rows. */
export function formatLotQueryNotes(result: LotQueryResult): string {
  const lines = [result.summary];
  if (result.name_roster?.length) lines.push(result.name_roster.join("\n"));
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
        unit.chassis ? `chassis ${unit.chassis}` : "",
        unit.gvwr ? `gvwr ${unit.gvwr}` : "",
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
