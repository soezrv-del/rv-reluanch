/**
 * E.164 phone normalize — shared by client + server.
 * US 10-digit numbers become +1…; already-international stay +digits.
 */

const MIN_DIGITS = 10;
const MAX_DIGITS = 15;

export function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

/** Normalize a typed / CSV phone to E.164, or null if unusable. */
export function normalizePhoneE164(
  raw: unknown,
  defaultCountry = "1",
): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = digitsOnly(trimmed);
  if (digits.length < MIN_DIGITS || digits.length > MAX_DIGITS) return null;

  if (trimmed.startsWith("+")) return `+${digits}`;

  if (digits.length === 10) return `+${defaultCountry}${digits}`;
  if (digits.length === 11 && digits.startsWith(defaultCountry)) {
    return `+${digits}`;
  }
  if (digits.length >= 11) return `+${digits}`;
  return null;
}

/** Functional API calls send the device phone in this header. */
export const ACCESS_PHONE_HEADER = "x-rvfox-access-phone";

export function formatPhoneDisplay(e164: string): string {
  const n = normalizePhoneE164(e164) ?? e164;
  if (/^\+1\d{10}$/.test(n)) {
    return `+1 (${n.slice(2, 5)}) ${n.slice(5, 8)}-${n.slice(8)}`;
  }
  return n;
}
