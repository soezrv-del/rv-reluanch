import { ACCESS_PHONE_HEADER, normalizePhoneE164 } from "./phone.ts";

export { ACCESS_PHONE_HEADER };

export const ACCESS_PHONE_STORAGE_KEY = "rvfox_access_phone_v1";
export const ACCESS_CHANGED_EVENT = "rvfox-access-changed";

export function readDevicePhone(): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(ACCESS_PHONE_STORAGE_KEY);
    return raw && raw.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

export function writeDevicePhone(raw: string | null): string | null {
  const normalized = raw ? normalizePhoneE164(raw) : null;
  try {
    if (typeof localStorage === "undefined") return normalized;
    if (normalized) localStorage.setItem(ACCESS_PHONE_STORAGE_KEY, normalized);
    else localStorage.removeItem(ACCESS_PHONE_STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
  emitAccessChanged();
  return normalized;
}

export function emitAccessChanged(): void {
  try {
    window.dispatchEvent(new Event(ACCESS_CHANGED_EVENT));
  } catch {
    /* */
  }
}

/** Headers to attach on functional API calls. */
export function accessPhoneHeaders(
  extra?: Record<string, string>,
): Record<string, string> {
  const phone = readDevicePhone();
  return {
    ...(extra ?? {}),
    ...(phone ? { [ACCESS_PHONE_HEADER]: phone } : {}),
  };
}
