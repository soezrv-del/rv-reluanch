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

/**
 * Resolve access from a stored whitelist row (or none).
 * Self-service requests are NOT a row and never reach this helper.
 */
export function resolveAccess(
  rawPhone: string,
  row: AccessRow | null | undefined,
): AccessDecision {
  if (isHardAdminPhone(rawPhone)) {
    return { allowed: true, isAdmin: true, matched: true };
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
