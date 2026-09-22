/**
 * Shared recovery when chat or Live Voice research gets 403 access_required.
 * Voice can connect without a phone (Cloudflare token fallback). Research
 * cannot — open the unlock sheet, store an approved number, then retry.
 */

import {
  ACCESS_PHONE_CHANGED_EVENT,
  ACCESS_REQUEST_EVENT,
} from "./constants.ts";
import { accessHeaders, readStoredPhone } from "./client.ts";

export const RESEARCH_ACCESS_BLOCKED_REASON =
  "research blocked (access required)";

export function isResearchAccessBlocked(reason: string): boolean {
  return /access required|research blocked/i.test(reason || "");
}

/** Storage first, then the in-memory session override — never a stale empty. */
export function resolveResearchPhone(override?: string): string {
  return (readStoredPhone() || override || "").trim();
}

function accessWindow(): (EventTarget & {
  setTimeout: typeof setTimeout;
  clearTimeout: typeof clearTimeout;
}) | null {
  const w = (globalThis as { window?: Window }).window;
  return w ?? null;
}

export function requestResearchUnlock(reason?: string): void {
  const w = accessWindow();
  if (!w) return;
  w.dispatchEvent(
    new CustomEvent(ACCESS_REQUEST_EVENT, {
      detail: {
        reason:
          reason ||
          "Live research needs your approved number. Enter it to unlock this device.",
      },
    }),
  );
}

export async function readAccessRequiredError(res: Response): Promise<boolean> {
  try {
    const data = (await res.clone().json()) as { error?: string };
    return data?.error === "access_required";
  } catch {
    return false;
  }
}

/**
 * Resolve after storePhone (or ACCESS_PHONE_CHANGED_EVENT).
 * No window / already stored → return immediately so Node tests do not hang.
 */
export async function waitForAccessPhone(opts?: {
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<string> {
  const existing = readStoredPhone().trim();
  if (existing) return existing;
  const target = accessWindow();
  if (!target) return "";
  const timeoutMs = opts?.timeoutMs ?? 120_000;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (phone: string) => {
      if (settled) return;
      settled = true;
      target.removeEventListener(ACCESS_PHONE_CHANGED_EVENT, onPhone);
      target.clearTimeout(timer);
      opts?.signal?.removeEventListener("abort", onAbort);
      resolve(phone);
    };
    const onPhone = (ev: Event) => {
      const fromDetail =
        ev instanceof CustomEvent ? String(ev.detail?.phone || "") : "";
      const phone = (fromDetail || readStoredPhone()).trim();
      if (phone) finish(phone);
    };
    const onAbort = () => finish(readStoredPhone().trim());
    const timer = target.setTimeout(
      () => finish(readStoredPhone().trim()),
      timeoutMs,
    );
    target.addEventListener(ACCESS_PHONE_CHANGED_EVENT, onPhone);
    opts?.signal?.addEventListener("abort", onAbort);
  });
}

export async function recoverPhoneAfterAccessRequired(opts?: {
  accessPhone?: string;
  signal?: AbortSignal;
}): Promise<string> {
  const again = resolveResearchPhone(opts?.accessPhone);
  if (again) return again;
  requestResearchUnlock();
  return waitForAccessPhone({ signal: opts?.signal });
}

/**
 * POST with x-access-phone. On 403 access_required: re-read storage,
 * or open unlock and wait, then retry once.
 */
export async function fetchWithResearchAccess(
  post: (phone: string) => Promise<Response>,
  opts?: { accessPhone?: string; signal?: AbortSignal },
): Promise<Response> {
  let phone = resolveResearchPhone(opts?.accessPhone);
  let res = await post(phone);
  if (res.status === 403 && (await readAccessRequiredError(res))) {
    const recovered = await recoverPhoneAfterAccessRequired({
      accessPhone: phone || opts?.accessPhone,
      signal: opts?.signal,
    });
    if (recovered) {
      res = await post(recovered);
    }
  }
  return res;
}

export function researchAccessHeaders(
  init?: HeadersInit,
  override?: string,
): Headers {
  return accessHeaders(init, resolveResearchPhone(override));
}
