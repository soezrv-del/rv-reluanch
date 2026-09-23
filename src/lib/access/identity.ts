/**
 * First-name helpers for identify / welcome-back / sparse RV Grok warmth.
 * Phone still drives the whitelist. A typed first name is stored locally
 * and is not written back to the admin list.
 */

import { ACCESS_WELCOME_SESSION_KEY } from "./constants.ts";

/** First whitespace token, letters / mark / hyphen / apostrophe only. */
export function normalizeFirstName(raw: string): string {
  const token = String(raw ?? "")
    .trim()
    .split(/\s+/)[0];
  if (!token) return "";
  const cleaned = token.replace(/[^\p{L}\p{M}'-]/gu, "");
  if (!cleaned) return "";
  return cleaned.charAt(0).toLocaleUpperCase() + cleaned.slice(1);
}

/**
 * Prefer what they typed at identify; otherwise first token of the
 * whitelist / check `name` (e.g. "David Hansen" → "David").
 */
export function resolvePersonalFirstName(
  typedName: string | undefined,
  listName: string | undefined,
): string {
  return (
    normalizeFirstName(typedName || "") || normalizeFirstName(listName || "")
  );
}

export function welcomeBackLine(firstName: string): string {
  const n = normalizeFirstName(firstName);
  return n ? `Welcome back, ${n}` : "";
}

export function takeSessionWelcome(firstName: string): boolean {
  const n = normalizeFirstName(firstName);
  if (!n) return false;
  try {
    if (typeof sessionStorage === "undefined") return true;
    if (sessionStorage.getItem(ACCESS_WELCOME_SESSION_KEY)) return false;
    sessionStorage.setItem(ACCESS_WELCOME_SESSION_KEY, n);
    return true;
  } catch {
    return true;
  }
}
