/**
 * Brochure OEM GVWR pins → coach-knowledge seed candidates.
 *
 * Reads `listOemGvwrPins()` only (floorplanSpecs SoT). Does not invent OEM,
 * does not live-research, does not write Neon. The CLI applies via
 * upsertCoachKnowledge — never the live-research write planner (that
 * rejects catalog-pin salvage and expects research notes).
 */

import { listOemGvwrPins, type OemGvwrPinRow } from "../rv/floorplanSpecs.ts";
import {
  isRejectedKnowledgeValue,
  mergeConfirmedFields,
  normalizeCoachKnowledgeKey,
  type CoachKnowledgeFields,
  type CoachKnowledgeKey,
} from "./coachKnowledge.ts";

export const BROCHURE_PIN_SOURCES = [
  "brochure-pin",
  "floorplanSpecs:OEM_GVWR_PINS",
] as const;

/** Strict MY2027: both bounds start at 2027. Drops wide 2020–2027 bands. */
export function isStrictMy2027OemGvwrPin(pin: Pick<OemGvwrPinRow, "yearMin" | "yearMax">): boolean {
  return pin.yearMin >= 2027 && pin.yearMax >= 2027;
}

export function parseMakesFlag(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function pinMatchesMakes(pin: Pick<OemGvwrPinRow, "makeIncludes">, makes: string[]): boolean {
  if (!makes.length) return true;
  const hay = (pin.makeIncludes || "").toLowerCase();
  if (!hay) return false;
  return makes.some((m) => hay === m || hay.includes(m) || m.includes(hay));
}

export type BrochurePinSeedCandidate = {
  year: number;
  make: string;
  model: string;
  floorplan: string;
  gvwrLbs: number;
  key: CoachKnowledgeKey;
  fields: CoachKnowledgeFields;
  sources: string[];
  confidence: "high";
};

export function listStrictMy2027OemGvwrPins(): OemGvwrPinRow[] {
  return listOemGvwrPins().filter(isStrictMy2027OemGvwrPin);
}

export function collectBrochurePinSeedCandidates(opts?: {
  makes?: string[];
  nowIso?: string;
}): BrochurePinSeedCandidate[] {
  const nowIso = opts?.nowIso || new Date().toISOString();
  const makes = opts?.makes || [];
  const out: BrochurePinSeedCandidate[] = [];

  for (const pin of listOemGvwrPins()) {
    if (!isStrictMy2027OemGvwrPin(pin)) continue;
    if (!pinMatchesMakes(pin, makes)) continue;
    const gvwr = String(pin.gvwrLbs);
    if (!Number.isFinite(pin.gvwrLbs) || pin.gvwrLbs <= 0) continue;
    if (isRejectedKnowledgeValue(gvwr)) continue;

    for (let year = pin.yearMin; year <= pin.yearMax; year += 1) {
      const key = normalizeCoachKnowledgeKey({
        year: String(year),
        make: pin.makeIncludes,
        model: pin.modelIncludes,
        floorplan: pin.floorplan,
      });
      if (!key) continue;

      const fields = mergeConfirmedFields(
        {},
        {
          gvwr: {
            value: gvwr,
            kind: "spec",
            researchedAt: nowIso,
          },
        },
      );
      if (!fields.gvwr?.value) continue;

      out.push({
        year,
        make: pin.makeIncludes,
        model: pin.modelIncludes,
        floorplan: pin.floorplan,
        gvwrLbs: pin.gvwrLbs,
        key,
        fields,
        sources: [...BROCHURE_PIN_SOURCES],
        confidence: "high",
      });
    }
  }

  return out;
}

export function formatSeedCandidateLine(row: BrochurePinSeedCandidate): string {
  const ymmf = [row.year, row.make, row.model, row.floorplan].filter(Boolean).join(" ");
  const key = [row.key.year, row.key.make, row.key.model, row.key.floorplan]
    .filter(Boolean)
    .join("|");
  return `${ymmf}  gvwr=${row.gvwrLbs}  key=${key}`;
}
