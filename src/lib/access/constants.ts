/**
 * Hard admin seed. Founder KB / origin story stay "David Hansen".
 * This whitelist row uses the name David stated for the seed: David Hanson.
 */
export const HARD_ADMIN = {
  id: "admin-david-hanson",
  name: "David Hanson",
  displayPhone: "702-266-5918",
  digits: "7022665918",
  e164: "+17022665918",
  notes: "Hard admin seed — full access, can manage the list",
} as const;

export const ACCESS_PHONE_STORAGE_KEY = "rvfox_access_phone_v1";
export const ACCESS_ADMIN_TOKEN_KEY = "rvfox_access_admin_token_v1";
/** Device-local one-time NDA accept. Bump NDA_VERSION in ndaText.ts to re-prompt. */
export const NDA_STORAGE_KEY = "rvfox_nda_accepted_v1";
export const ACCESS_PHONE_HEADER = "x-access-phone";
export const ACCESS_ADMIN_COOKIE = "rvfox_wl_admin";
export const ACCESS_REQUEST_EVENT = "rvfox-access-required";

export const ACCESS_ADMIN_PASSWORD_ENV = "WHITELIST_ADMIN_PASSWORD";
