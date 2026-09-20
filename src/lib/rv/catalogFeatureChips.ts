/**
 * Facts standout chips: live research first, catalog structured
 * solar / lithium / inverter (and keyFeatures) fill gaps.
 *
 * General — any coach that has the optional RVSpec fields. Do not invent.
 * Powertrain honesty still runs through sanitizeFeaturesForPin.
 */

import { sanitizeUnverifiedLayout } from "./promptRules.ts";
import {
  sanitizeFeaturesForPin,
  type PowertrainCorrection,
} from "./powertrainCorrections.ts";
import type { RVSpec } from "./rvTypes.ts";

export const FEATURE_CHIP_CAP = 6;

export type CatalogFeatureFields = Pick<
  RVSpec,
  | "solarWatts"
  | "lithiumAh"
  | "lithiumWh"
  | "batteryType"
  | "inverterWatts"
  | "keyFeatures"
>;

type ChipKind = "solar" | "lithium" | "inverter" | "other";

function normChip(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function chipKind(text: string): ChipKind {
  if (/\binverter\b|xantrex/i.test(text)) return "inverter";
  if (/\bsolar\b|merlin/i.test(text)) return "solar";
  if (/lithium|lithionics|\b\d[\d,]*\s*ah\b|\b\d[\d,]*\s*wh\b/i.test(text)) {
    return "lithium";
  }
  return "other";
}

function alreadyCovered(chips: string[], next: string): boolean {
  const n = normChip(next);
  if (!n) return true;
  return chips.some((c) => {
    const cn = normChip(c);
    return cn === n || cn.includes(n) || n.includes(cn);
  });
}

function lithiumBrand(batteryType?: string): string | null {
  const raw = (batteryType || "").trim();
  if (!raw) return "lithium";
  if (/lithionics/i.test(raw)) return "Lithionics";
  const brand = raw.split(/[·•|,]/)[0]?.trim();
  return brand || "lithium";
}

function batteryChip(spec: CatalogFeatureFields): string | null {
  if (typeof spec.lithiumWh === "number" && spec.lithiumWh > 0) {
    const brand = lithiumBrand(spec.batteryType);
    return `${spec.lithiumWh}Wh ${brand}`;
  }
  const typed = spec.batteryType?.trim();
  if (typed) return typed;
  if (typeof spec.lithiumAh === "number" && spec.lithiumAh > 0) {
    return `${spec.lithiumAh}Ah lithium`;
  }
  return null;
}

/** Structured catalog fields → short human chips. No invented numbers. */
export function chipsFromCatalogFeatures(
  spec: CatalogFeatureFields | null | undefined,
): string[] {
  if (!spec) return [];
  const chips: string[] = [];

  if (typeof spec.solarWatts === "number" && spec.solarWatts > 0) {
    chips.push(`${spec.solarWatts}W solar`);
  }

  const battery = batteryChip(spec);
  if (battery) chips.push(battery);

  if (typeof spec.inverterWatts === "number" && spec.inverterWatts > 0) {
    chips.push(`${spec.inverterWatts}W inverter`);
  }

  for (const raw of spec.keyFeatures || []) {
    const t = (raw || "").trim();
    if (!t || alreadyCovered(chips, t)) continue;
    chips.push(t);
  }

  return chips;
}

export function standoutFeatureChips(opts: {
  liveFeatures?: string[] | null;
  spec?: CatalogFeatureFields | null;
  pin?: PowertrainCorrection | null;
  verifiedNotes?: Array<string | null | undefined>;
  cap?: number;
}): string[] {
  const cap = opts.cap ?? FEATURE_CHIP_CAP;
  const live = (opts.liveFeatures || []).map((s) => s.trim()).filter(Boolean);
  const catalog = chipsFromCatalogFeatures(opts.spec);

  const merged: string[] = [];
  const used = new Set<ChipKind>();

  for (const f of [...live, ...catalog]) {
    const kind = chipKind(f);
    if (kind !== "other" && used.has(kind)) continue;
    if (alreadyCovered(merged, f)) continue;
    merged.push(f);
    if (kind !== "other") used.add(kind);
  }

  const afterPin = opts.pin
    ? sanitizeFeaturesForPin(opts.pin, merged)
    : merged;

  return afterPin
    .map((f) => sanitizeUnverifiedLayout(f, opts.verifiedNotes || []))
    .filter((f) => f && !/^layout details unconfirmed/i.test(f))
    .slice(0, cap);
}
