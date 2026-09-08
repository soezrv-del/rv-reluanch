/**
 * Cal / payment tab entry.
 *
 * Plain dock / swipe / launch into RvCAL is always a clean calculator.
 * The only pre-fill is an explicit Facts "Check payment" handoff:
 * price + optional unit label. Never invent catalog data. Never read
 * Facts / Tow / Trips / Grok activeCoach or other shared session.
 */

export type CalHandoffPayload = {
  price: number;
  /** Unit chip from Facts, e.g. "2023 American Coach American Dream · 45A" */
  label?: string;
};

export type CalSeed = CalHandoffPayload & { token: number };

export function normalizeCalHandoff(
  raw: { price?: number; label?: string } | null | undefined,
): CalHandoffPayload | null {
  const price = Number(raw?.price);
  if (!Number.isFinite(price) || price <= 0) return null;
  const label = String(raw?.label ?? "").trim();
  return label
    ? { price: Math.round(price), label }
    : { price: Math.round(price) };
}

export type CalOpenDecision =
  | { action: "noop" }
  | { action: "reset" }
  | { action: "apply"; payload: CalHandoffPayload };

/**
 * Resolve one Cal tab open / remount.
 *
 * A new clean-open token always wins (plain Cal tap), even if a leftover
 * seed is still sitting. A new handoff token applies only when this open
 * is not a clean tap.
 */
export function decideCalOpen(input: {
  seed: CalSeed | null;
  lastSeedToken: number;
  cleanToken: number;
  lastCleanToken: number;
}): CalOpenDecision {
  const cleanPending =
    input.cleanToken > 0 && input.cleanToken !== input.lastCleanToken;
  if (cleanPending) return { action: "reset" };

  const seedPending =
    input.seed != null &&
    input.seed.token > 0 &&
    input.seed.token !== input.lastSeedToken;
  if (!seedPending) return { action: "noop" };

  const payload = normalizeCalHandoff(input.seed);
  if (!payload) return { action: "noop" };
  return { action: "apply", payload };
}
