import { findBetaSeed } from "./betaWhitelist.ts";
import { HARD_ADMIN } from "./constants.ts";
import { normalizePhone } from "./phone.ts";

export type AccessRow = {
  phoneDigits: string;
  phoneE164: string;
  isAdmin: boolean;
};

export type AccessDecision = {
  allowed: boolean;
  isAdmin: boolean;
  matched: boolean;
};

/** David's number is always admin + full access, even if the row is missing. */
export function isHardAdminPhone(raw: string): boolean {
  const n = normalizePhone(raw);
  if (!n) return false;
  return n.digits === HARD_ADMIN.digits || n.e164 === HARD_ADMIN.e164;
}

export type HardAdminAccessResult = {
  ok: true;
  allowed: true;
  isAdmin: true;
  name: string;
  phoneDigits: string;
  phoneE164: string;
};

export type HardAdminRequestResult = {
  ok: true;
  requested: false;
  granted: true;
  alreadyAdmin: true;
  phoneE164: string;
};

/**
 * Offline hard-admin identity. Callers must return this before getSql /
 * ensureAdminSeed so Neon being unset cannot 500 check or request.
 */
export function hardAdminAccessResult(
  raw: string,
): HardAdminAccessResult | null {
  const n = normalizePhone(raw);
  if (!n || !isHardAdminPhone(n.digits)) return null;
  return {
    ok: true,
    allowed: true,
    isAdmin: true,
    name: HARD_ADMIN.name,
    phoneDigits: n.digits,
    phoneE164: n.e164,
  };
}

/** Same offline short-circuit for the notify-only request form. */
export function hardAdminRequestResult(
  raw: string,
): HardAdminRequestResult | null {
  const n = normalizePhone(raw);
  if (!n || !isHardAdminPhone(n.digits)) return null;
  return {
    ok: true,
    requested: false,
    granted: true,
    alreadyAdmin: true,
    phoneE164: n.e164,
  };
}

export type BetaSeedAccessResult = {
  ok: true;
  allowed: true;
  isAdmin: false;
  name: string;
  phoneDigits: string;
  phoneE164: string;
};

/**
 * Offline static beta-seed identity. Call after hard-admin, before getSql /
 * ensureAdminSeed so Neon being unset cannot 503 a seeded tester.
 * Never admin — HARD_ADMIN is the only admin short-circuit.
 */
export function betaSeedAccessResult(
  raw: string,
): BetaSeedAccessResult | null {
  const n = normalizePhone(raw);
  if (!n || isHardAdminPhone(n.digits)) return null;
  const seed = findBetaSeed(n.digits);
  if (!seed) return null;
  return {
    ok: true,
    allowed: true,
    isAdmin: false,
    name: seed.contactName,
    phoneDigits: n.digits,
    phoneE164: n.e164,
  };
}

/**
 * Resolve access from hard-admin, the static beta seed, or a stored row.
 * Self-service requests are NOT a row and never reach this helper.
 */
export function resolveAccess(
  rawPhone: string,
  row: AccessRow | null | undefined,
): AccessDecision {
  if (isHardAdminPhone(rawPhone)) {
    return { allowed: true, isAdmin: true, matched: true };
  }
  if (findBetaSeed(rawPhone)) {
    return { allowed: true, isAdmin: false, matched: true };
  }
  if (!row) {
    return { allowed: false, isAdmin: false, matched: false };
  }
  return {
    allowed: true,
    isAdmin: Boolean(row.isAdmin),
    matched: true,
  };
}

/**
 * A pending request never grants access. Callers must not treat this
 * as a whitelist insert — it is notify-only.
 */
export function requestGrantsAccess(): false {
  return false;
}

export function canRemoveWhitelistRow(digits: string): boolean {
  return !isHardAdminPhone(digits);
}
