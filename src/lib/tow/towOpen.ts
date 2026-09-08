/**
 * Tow landing cascade.
 *
 * Default view is the Truck / SUV toggle only. Each pick unlocks the next
 * field (year → make → model → trim). Trim stays optional in the form and
 * is the trigger for AnswerHero. Empty catalog rows stay empty — we never
 * invent OEM ratings.
 */

import { getModels } from "./towVehicles.ts";

export type TowKindChoice = "truck" | "suv" | "";

export type TowCascadeSel = {
  kind: TowKindChoice;
  year: string;
  make: string;
  model: string;
  trim: string;
};

export type TowCascadeReveal = {
  year: boolean;
  make: boolean;
  model: boolean;
  trim: boolean;
  answer: boolean;
};

/** Fields that exist on the landing — hidden until earned, never empty/disabled. */
export function towCascadeReveal(sel: {
  kind: string;
  year: string;
  make: string;
  model: string;
  trim: string;
}): TowCascadeReveal {
  const kindPicked = sel.kind === "truck" || sel.kind === "suv";
  const yearOn = kindPicked;
  const makeOn = yearOn && Boolean(sel.year);
  const modelOn = makeOn && Boolean(sel.make);
  const trimOn = modelOn && Boolean(sel.model);
  return {
    year: yearOn,
    make: makeOn,
    model: modelOn,
    trim: trimOn,
    answer: Boolean(sel.trim),
  };
}

/**
 * Restore a saved kind. "all" / missing stays unset on a blank landing.
 * A saved make+model infers truck/SUV from the catalog so dock clean-open
 * still shows the earned cascade.
 */
export function inferTowKind(
  kindFilter: string | undefined | null,
  make?: string,
  model?: string,
): TowKindChoice {
  if (kindFilter === "suv" || kindFilter === "truck") return kindFilter;
  if (make && model) {
    return getModels(make, "all").find((m) => m.name === model)?.kind ?? "truck";
  }
  return "";
}
