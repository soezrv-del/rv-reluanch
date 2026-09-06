/**
 * Tow → Trips Profile handoff.
 *
 * Tow never invents coach dims. We only pass a known Facts/saved identity
 * (year / make / model / optional floorplan + known weights). Trips fills
 * height/length/width via suggestCoachFromSelection (brochure → catalog →
 * Facts → labeled class heuristic).
 *
 * A locked Trips coach is never overwritten here — the UI must confirm.
 */

import {
  coachIdentityKey,
  type CoachProfile,
  type CoachSeedIdentity,
  type SuggestCoachFn,
} from "./coachProfile.ts";

export const TOW_HANDOFF_KEY = "rvfax_trips_tow_handoff_v1";

export type TowHandoffOffer = CoachSeedIdentity & {
  savedAt?: string;
};

export type TowHandoffDecision =
  | { action: "open-only" }
  | { action: "apply"; profile: CoachProfile }
  | { action: "same-locked"; profile: CoachProfile }
  | {
      action: "confirm-replace";
      locked: CoachProfile;
      incoming: CoachProfile;
    };

function clean(v?: string | null): string {
  return String(v ?? "").trim();
}

export function normalizeTowHandoffOffer(
  raw: Partial<TowHandoffOffer> | null | undefined,
): TowHandoffOffer | null {
  if (!raw) return null;
  const year = clean(raw.year);
  const make = clean(raw.make);
  const model = clean(raw.model);
  if (!year || !make || !model) return null;
  const gvwr =
    typeof raw.gvwrLbs === "number" && Number.isFinite(raw.gvwrLbs) && raw.gvwrLbs > 0
      ? Math.round(raw.gvwrLbs)
      : undefined;
  const uvw =
    typeof raw.uvwLbs === "number" && Number.isFinite(raw.uvwLbs) && raw.uvwLbs > 0
      ? Math.round(raw.uvwLbs)
      : undefined;
  return {
    year,
    make,
    model,
    floorplan: clean(raw.floorplan) || undefined,
    rvType: clean(raw.rvType) || undefined,
    gvwrLbs: gvwr,
    uvwLbs: uvw,
    savedAt:
      typeof raw.savedAt === "string" && raw.savedAt
        ? raw.savedAt
        : new Date().toISOString(),
  };
}

export function offerFromCoach(
  coach: {
    year?: string;
    make?: string;
    model?: string;
    floorplan?: string;
    rvType?: string;
    gvwrLbs?: number;
    uvwLbs?: number;
  } | null,
): TowHandoffOffer | null {
  if (!coach) return null;
  return normalizeTowHandoffOffer({
    year: coach.year,
    make: coach.make,
    model: coach.model,
    floorplan: coach.floorplan,
    rvType: coach.rvType,
    gvwrLbs: coach.gvwrLbs,
    uvwLbs: coach.uvwLbs,
  });
}

/** Never write height/length/width here — suggest owns dims. */
export function decideTowHandoff(
  input: {
    locked?: CoachProfile | null;
    offer?: TowHandoffOffer | null;
  },
  suggest: SuggestCoachFn,
): TowHandoffDecision {
  const offer = normalizeTowHandoffOffer(input.offer);
  if (!offer) return { action: "open-only" };

  const incoming: CoachProfile = {
    ...suggest({
      year: offer.year,
      make: offer.make,
      model: offer.model,
      floorplan: offer.floorplan || "",
      gvwrLbs: offer.gvwrLbs,
      uvwLbs: offer.uvwLbs,
      rvType: offer.rvType,
    }),
    seedSource: "tow",
    locked: false,
  };

  const locked = input.locked?.make && input.locked.model ? input.locked : null;
  if (!locked) {
    return { action: "apply", profile: incoming };
  }

  if (coachIdentityKey(locked) === coachIdentityKey(incoming)) {
    return { action: "same-locked", profile: { ...locked, locked: true, seedSource: "locked" } };
  }

  return { action: "confirm-replace", locked, incoming };
}

export function loadTowHandoffOffer(): TowHandoffOffer | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOW_HANDOFF_KEY);
    if (!raw) return null;
    return normalizeTowHandoffOffer(JSON.parse(raw) as Partial<TowHandoffOffer>);
  } catch {
    return null;
  }
}

export function saveTowHandoffOffer(offer: TowHandoffOffer | null): void {
  if (typeof localStorage === "undefined") return;
  try {
    if (!offer) {
      localStorage.removeItem(TOW_HANDOFF_KEY);
      return;
    }
    const next = normalizeTowHandoffOffer(offer);
    if (!next) {
      localStorage.removeItem(TOW_HANDOFF_KEY);
      return;
    }
    localStorage.setItem(TOW_HANDOFF_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

export function clearTowHandoffOffer(): void {
  saveTowHandoffOffer(null);
}
