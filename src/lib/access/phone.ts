/**
 * Phone normalize for the access whitelist.
 * Stores both NANP digits (7022665918) and E.164 (+17022665918).
 */

export type NormalizedPhone = {
  digits: string;
  e164: string;
};

export function digitsOnly(raw: string): string {
  return String(raw ?? "").replace(/\D/g, "");
}

/**
 * Accept common US forms: 702-266-5918, (702) 266-5918, 17022665918, +17022665918.
 * Non-US E.164 (11–15 digits after +) is kept as-is.
 */
export function normalizePhone(raw: string): NormalizedPhone | null {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return null;
  let digits = digitsOnly(trimmed);
  if (!digits) return null;

  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    return { digits, e164: `+1${digits}` };
  }

  if (digits.length >= 11 && digits.length <= 15) {
    return { digits, e164: `+${digits}` };
  }

  return null;
}

export function formatPhoneDisplay(digits: string): string {
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits ? `+${digits}` : "";
}
