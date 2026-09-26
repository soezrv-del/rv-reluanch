/**
 * Ask-side class/fuel and row-side fuel. No imports — the lot page chrome
 * (lotTypeFamily) stays separate; it paints a pill, it does not parse an ask.
 *
 * Gas means motorized and not diesel. A plain "Class A" label is gas unless
 * the series is a diesel pusher the live feed still prints as "Class A".
 */

/** body_type labels that count as diesel when the scrape has no fuel field. */
export const DIESEL_BODY_TYPES = ["Class A Diesel", "Class Super C"] as const;

/** Gas word on an ask or a body label. "gasser" / "gasoline" count; F-53 does not. */
export const GAS_WORD_RE = /\bgas(?:oline|ser)?s?\b/i;

const DIESEL_WORD_RE = /\b(?:diesels?|pushers?)\b/i;
const F53_CHASSIS_RE = /\bf[\s-]?53\b/i;

/**
 * Diesel pushers this feed sometimes labels "Class A" instead of
 * "Class A Diesel": Mountain Aire 4551, Allegro Bus 45 OP / 43 QGP,
 * Ventana 4369, Discovery 38K. Same series also has correctly labeled rows.
 */
const KNOWN_DIESEL_SERIES_RE =
  /\b(?:mountain\s+aires?|allegro\s+bus(?:es)?|ventanas?|discover(?:y|ies))\b/i;

function norm(s: string | null | undefined): string {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function isDieselBodyType(bodyType: string): boolean {
  const n = norm(bodyType);
  if (!n) return false;
  if (DIESEL_BODY_TYPES.some((label) => norm(label) === n)) return true;
  if (/^class\s*a\s*[-/]?\s*diesel\b/.test(n)) return true;
  if (/^class\s*super\s*c\b/.test(n)) return true;
  return false;
}

export function isKnownDieselSeries(model: string, trim = ""): boolean {
  return KNOWN_DIESEL_SERIES_RE.test(`${model || ""} ${trim || ""}`);
}

export function isMotorizedBodyType(bodyType: string): boolean {
  const n = norm(bodyType);
  if (!n) return false;
  if (/\bclass\s*[abc]\b/.test(n)) return true;
  if (/\bsuper\s*c\b/.test(n)) return true;
  if (/\bmotorhomes?\b/.test(n) || /\bmotor\s*homes?\b/.test(n)) return true;
  return false;
}

/**
 * Label-only gas check. Bare "Class A" counts; a known diesel series is
 * decided by unitIsGas, which can see the model.
 */
export function isGasBodyType(bodyType: string): boolean {
  const n = norm(bodyType);
  if (!n || isDieselBodyType(n)) return false;
  if (GAS_WORD_RE.test(n)) return true;
  return isMotorizedBodyType(n) && !/\bdiesel\b/.test(n);
}

type FuelUnit = { body_type?: string; model?: string; trim?: string };

/** Diesel label, or a plain Class A whose series is a known diesel pusher. */
export function unitIsDiesel(unit: FuelUnit): boolean {
  if (isDieselBodyType(unit.body_type || "")) return true;
  if (norm(unit.body_type || "") !== "class a") return false;
  return isKnownDieselSeries(unit.model || "", unit.trim || "");
}

/** Motorized and not diesel. Towables and known diesel series stay out. */
export function unitIsGas(unit: FuelUnit): boolean {
  if (unitIsDiesel(unit)) return false;
  return isGasBodyType(unit.body_type || "");
}

/**
 * "not a diesel" / "non-diesel" / "diesel excluded" is a rejection.
 * Drop those spans before looking for a positive diesel cue — a hyphen
 * is a word boundary, so "non-diesel" would otherwise match "diesel".
 */
function withoutDieselExclusions(text: string): string {
  return text
    .replace(/\bnon[-\s]?diesels?\b/gi, " ")
    .replace(
      /\b(?:not|no|without|exclude|excluding|except)\b[^.]{0,48}?\b(?:diesel(?:\s+pushers?)?|diesels?|pushers?)\b/gi,
      " ",
    )
    .replace(/\b(?:diesels?|pushers?)\b[^.]{0,24}?\bexcluded\b/gi, " ");
}

function dieselWasNegated(text: string): boolean {
  return (
    /\bnon[-\s]?diesels?\b/i.test(text) ||
    /\b(?:not|no|without|exclude|excluding|except)\b[^.]{0,48}?\b(?:diesels?|pushers?)\b/i.test(
      text,
    ) ||
    /\b(?:diesels?|pushers?)\b[^.]{0,24}?\bexcluded\b/i.test(text)
  );
}

/**
 * One ask-side class and fuel read. "class a gas" is Class A plus gas,
 * not a body label the scrape never prints. A positive diesel cue wins
 * when both fuels are asked and diesel was not only excluded.
 */
export function parseAskedClassAndFuel(text: string): {
  bodyType?: string;
  gasOnly?: boolean;
  dieselOnly?: boolean;
  toyHauler?: boolean;
} {
  const t = text || "";
  const negated = dieselWasNegated(t);
  const dieselPositive = DIESEL_WORD_RE.test(withoutDieselExclusions(t));
  const gasCue = GAS_WORD_RE.test(t) || F53_CHASSIS_RE.test(t) || negated;
  const fuel: { gasOnly?: boolean; dieselOnly?: boolean } = {};
  if (dieselPositive) fuel.dieselOnly = true;
  else if (gasCue) fuel.gasOnly = true;

  const toyHauler = /\btoy[- ]?haul(?:er|ers)?\b/i.test(t);
  const fifthWheel = /\bfifth[- ]?wheels?\b/i.test(t);
  const travelTrailer = /\btravel\s+trailers?\b/i.test(t);

  let bodyType: string | undefined;
  if (/\bsuper\s*c\b/i.test(t)) bodyType = "Class Super C";
  else if (/\bclass\s*as?\b/i.test(t)) bodyType = "Class A";
  else if (/\bclass\s*bs?\b/i.test(t)) bodyType = "Class B";
  else if (/\bclass\s*cs?\b/i.test(t)) bodyType = "Class C";
  else if (fifthWheel && toyHauler) bodyType = "Fifth Wheel Toy Hauler";
  else if (fifthWheel) bodyType = "Fifth Wheel";
  else if (travelTrailer && toyHauler) bodyType = "Travel Trailer Toy Hauler";
  else if (travelTrailer) bodyType = "Travel Trailer";

  return {
    ...fuel,
    ...(bodyType ? { bodyType } : {}),
    ...(toyHauler && !fifthWheel && !travelTrailer ? { toyHauler: true } : {}),
  };
}
