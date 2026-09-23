/**
 * Coach-knowledge identity key. No research, search, or Neon imports.
 * Live Voice can cache a desk sheet by this key without pulling the
 * research graph into the client session (that split the SSR router).
 */

import {
  lockIdentityTuple,
  resolveCatalogMake,
  resolveCatalogModel,
  type CoachIdentity,
} from "./coachIdentity.ts";

export type CoachKnowledgeKey = {
  year: string;
  make: string;
  model: string;
  floorplan: string;
};

function keyPart(s: string): string {
  return (s || "")
    .toLowerCase()
    .replace(/[_/,]+/g, " ")
    .replace(/[\s-]+/g, " ")
    .trim();
}

function yearPart(s: string): string {
  const m = String(s || "").match(/\b(19|20)\d{2}\b/);
  return m?.[0] || "";
}

/** Stable unique tuple. Dutch Star → Newmar. Floorplan may be empty. */
export function normalizeCoachKnowledgeKey(
  identity: Pick<CoachIdentity, "year" | "make" | "model" | "floorplan">,
): CoachKnowledgeKey | null {
  const locked = lockIdentityTuple({
    year: yearPart(identity.year) || (identity.year || "").trim(),
    make: resolveCatalogMake(identity.make || ""),
    model: identity.model
      ? resolveCatalogModel(
          identity.make || "",
          identity.model,
          identity.floorplan || "",
        )
      : "",
    floorplan: (identity.floorplan || "").trim(),
    source: "message",
  });
  const year = yearPart(locked.year);
  const make = keyPart(locked.make);
  const model = keyPart(locked.model);
  if (!year || !make || !model) return null;
  return {
    year,
    make,
    model,
    floorplan: keyPart(locked.floorplan),
  };
}

export function coachKnowledgeKeyEquals(
  a: CoachKnowledgeKey | null | undefined,
  b: CoachKnowledgeKey | null | undefined,
): boolean {
  if (!a || !b) return false;
  return (
    a.year === b.year &&
    a.make === b.make &&
    a.model === b.model &&
    a.floorplan === b.floorplan
  );
}
