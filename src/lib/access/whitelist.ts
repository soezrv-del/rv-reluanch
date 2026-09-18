import { normalizePhoneE164 } from "./phone.ts";

/** True when `phone` matches any listed number after E.164 normalize. */
export function isPhoneWhitelisted(
  phone: unknown,
  listed: readonly string[],
): boolean {
  const normalized = normalizePhoneE164(phone);
  if (!normalized) return false;
  for (const entry of listed) {
    if (normalizePhoneE164(entry) === normalized) return true;
  }
  return false;
}
