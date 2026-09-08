/**
 * Tow landing ↔ calc handoff.
 *
 * Example chips resolve onto the year → make → model cascade, then pick a
 * catalog trim that already covers that year. Empty trim rows stay empty —
 * we never invent OEM ratings.
 */

import { getModels, makesForKind } from "./towVehicles.ts";
import { getTrimsForYear } from "./towYear.ts";

/** First-run example chips — exact labels; each tap runs a real tow calc. */
export const TOW_EXAMPLE_CHIPS = [
  "2024 Ford F-350 Super Duty",
  "2020 Ram 3500",
  "2026 GMC Sierra 2500HD",
] as const;

export type TowCascadeSel = {
  year: string;
  make: string;
  model: string;
  trim: string;
};

/** Longest catalog make that prefixes the remainder. Exact table names only. */
export function matchTowCatalogMake(
  parsed: string,
  makes: readonly string[],
): string {
  const n = parsed.trim().toLowerCase();
  if (!n) return "";
  const prefixed = makes
    .filter((m) => n === m.toLowerCase() || n.startsWith(`${m.toLowerCase()} `))
    .sort((a, b) => b.length - a.length);
  return prefixed[0] ?? "";
}

export function matchTowCatalogModel(
  parsed: string,
  models: readonly string[],
): string {
  const n = parsed.trim().toLowerCase();
  if (!n) return "";
  const exact = models.find((m) => m.toLowerCase() === n);
  if (exact) return exact;
  const starts = models.filter((m) => m.toLowerCase().startsWith(n));
  if (starts.length === 1) return starts[0]!;
  return "";
}

export function parseTowExampleChip(
  label: string,
): Omit<TowCascadeSel, "trim"> {
  const m = label.trim().match(/^(\d{4})\s+(.+)$/);
  const year = m?.[1] ?? "";
  const rest = (m?.[2] ?? label).trim();
  const makes = makesForKind("all");
  const make = matchTowCatalogMake(rest, makes);
  const modelPart = make ? rest.slice(make.length).trim() : rest;
  return { year, make, model: modelPart };
}

/**
 * Prefer a diesel / SRW row that already exists for `year`.
 * First catalog row is the fallback. Empty table → "".
 */
export function pickChipCatalogTrim(
  make: string,
  model: string,
  year: string,
): string {
  const trims = getTrimsForYear(make, model, year);
  if (!trims.length) return "";
  const dieselSrw = trims.find(
    (t) =>
      /Power Stroke|Cummins|Duramax/i.test(t.label) &&
      /SRW|SLE|Big Horn/i.test(t.label),
  );
  if (dieselSrw) return dieselSrw.label;
  const diesel = trims.find((t) =>
    /Power Stroke|Cummins|Duramax/i.test(t.label),
  );
  if (diesel) return diesel.label;
  const srw = trims.find((t) => /SRW/i.test(t.label));
  return (srw ?? trims[0])!.label;
}

/**
 * Resolve a landing chip onto year / make / model / trim from the OEM table.
 * Missing year-banded rows leave trim blank — caller must not invent ratings.
 */
export function selFromTowExampleChip(label: string): TowCascadeSel {
  const parsed = parseTowExampleChip(label);
  const models = parsed.make
    ? getModels(parsed.make, "all").map((m) => m.name)
    : [];
  const model = matchTowCatalogModel(parsed.model, models);
  const trim =
    parsed.make && model
      ? pickChipCatalogTrim(parsed.make, model, parsed.year)
      : "";
  return {
    year: parsed.year,
    make: parsed.make,
    model,
    trim,
  };
}
