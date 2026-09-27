/**
 * Facts share identity and the suite text sheet.
 * The on-screen signature card is DOM. The coach report is a link and a PDF.
 */

import { formatPhoneDisplay, normalizePhone } from "../access/phone.ts";
import {
  REPORT_CONTACT_KICKER,
  REPORT_CONTACT_MONOGRAM,
  REPORT_CONTACT_NAME,
  REPORT_CONTACT_PHONE,
  REPORT_CONTACT_TEL,
} from "./reportContact.ts";

export type ShareCardContact = {
  monogram: string;
  kicker: string;
  name: string;
  phone: string;
  tel: string;
};

/** Signed-out dealer signature only. Not used while a session is allowed. */
export function defaultShareCardContact(): ShareCardContact {
  return {
    monogram: REPORT_CONTACT_MONOGRAM,
    kicker: REPORT_CONTACT_KICKER,
    name: REPORT_CONTACT_NAME,
    phone: REPORT_CONTACT_PHONE,
    tel: REPORT_CONTACT_TEL,
  };
}

/** Initials for the signature box — first letter of each whitespace token. */
export function monogramFromDisplayName(name: string): string {
  const letters = String(name ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("");
  return letters ? letters.toUpperCase() : REPORT_CONTACT_MONOGRAM;
}

function shareCardPhoneFromSession(raw: string): { phone: string; tel: string } {
  const trimmed = String(raw ?? "").trim();
  const n = normalizePhone(trimmed);
  if (n) {
    return { phone: formatPhoneDisplay(n.digits), tel: n.e164 };
  }
  return { phone: trimmed, tel: trimmed };
}

/**
 * Signed-in share identity. Hard switch at the caller: access.allowed
 * uses this contact; signed-out uses defaultShareCardContact().
 * This builder never returns the dealer name or dealer phone.
 */
export function shareCardContactForSession(
  signedInName: string,
  signedInPhone: string,
): ShareCardContact {
  const name = String(signedInName ?? "").trim();
  const { phone, tel } = shareCardPhoneFromSession(signedInPhone);
  return {
    monogram: name ? monogramFromDisplayName(name) : "",
    kicker: REPORT_CONTACT_KICKER,
    name,
    phone,
    tel,
  };
}

/** Phone-access snapshot the Facts kit can resolve without React context. */
export type FaxShareAccess = {
  allowed: boolean;
  status?: string;
  name: string;
  phone: string;
};

/**
 * Hard switch for the on-screen signature card.
 *
 * - `allowed` → session name + phone. Never Hansen.
 * - Missing / still-hydrating context → persisted approved identity if any.
 * - Explicit browse / signed-out → David Hansen / 702-266-5918 only.
 */
export function resolveFaxShareContact(
  access: FaxShareAccess | null | undefined,
  stored?: { name?: string; phone?: string } | null,
): ShareCardContact {
  if (access?.allowed) {
    return shareCardContactForSession(access.name, access.phone);
  }
  const undecided =
    !access ||
    access.status === "unknown" ||
    access.status === "checking";
  const storedPhone = String(stored?.phone ?? "").trim();
  const storedName = String(stored?.name ?? "").trim();
  if (undecided && storedPhone) {
    return shareCardContactForSession(storedName, storedPhone);
  }
  return defaultShareCardContact();
}

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

type ShareFn = (data: ShareData) => Promise<void>;

type ShareNav = Navigator & {
  share?: ShareFn;
  canShare?: (data?: ShareData) => boolean;
};

/**
 * WebKit sets `m_hasPendingShare` until the native sheet completion fires.
 * On iOS WKWebView that callback often never runs after Messages / a dismiss,
 * so the next `navigator.share()` throws InvalidStateError ("already in
 * progress") until the WebView is destroyed. Track that so a later tap can
 * use a fresh iframe Navigator instead of the stuck parent.
 */
let parentShareInFlight = false;

/** Test hook — production callers never need this. */
export function resetShareSession(): void {
  parentShareInFlight = false;
}

export function isShareAbort(e: unknown): boolean {
  if (typeof DOMException !== "undefined" && e instanceof DOMException) {
    if (e.name === "AbortError") return true;
  }
  const name = e instanceof Error ? e.name : "";
  const msg = e instanceof Error ? e.message : String(e ?? "");
  if (name === "AbortError") return true;
  return /AbortError|due to cancellation|cancelled|canceled/i.test(msg);
}

export function isShareBusyError(e: unknown): boolean {
  if (typeof DOMException !== "undefined" && e instanceof DOMException) {
    if (e.name === "InvalidStateError") return true;
  }
  const name = e instanceof Error ? e.name : "";
  const msg = e instanceof Error ? e.message : String(e ?? "");
  return (
    name === "InvalidStateError" ||
    /already in progress|not yet completed|earlier share/i.test(msg)
  );
}

function isShareNotAllowed(e: unknown): boolean {
  if (typeof DOMException !== "undefined" && e instanceof DOMException) {
    if (e.name === "NotAllowedError") return true;
  }
  const name = e instanceof Error ? e.name : "";
  return name === "NotAllowedError";
}

function nativeShare(nav: ShareNav): ShareFn | null {
  return typeof nav.share === "function" ? nav.share.bind(nav) : null;
}

function makeIframeShare(
  doc: Document | undefined,
): { share: ShareFn; dispose: () => void } | null {
  if (!doc?.body || typeof doc.createElement !== "function") return null;
  try {
    const iframe = doc.createElement("iframe");
    iframe.setAttribute("allow", "web-share");
    iframe.setAttribute("aria-hidden", "true");
    iframe.src = "about:blank";
    iframe.style.cssText =
      "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:0;top:0;";
    doc.body.appendChild(iframe);
    const win = iframe.contentWindow;
    const nav = win?.navigator as ShareNav | undefined;
    if (typeof nav?.share !== "function") {
      iframe.remove();
      return null;
    }
    return {
      share: nav.share.bind(nav),
      dispose: () => {
        try {
          iframe.remove();
        } catch {
          /* iframe already gone */
        }
      },
    };
  } catch {
    return null;
  }
}

/**
 * Open the OS sheet on a Navigator that is not stuck.
 *
 * Prefer a disposable same-origin iframe (own `m_hasPendingShare`). That is
 * the known iOS workaround: after a hung first share, a new iframe still
 * opens the sheet. Fall back to the parent window when the iframe has no
 * share() or rejects NotAllowedError (no user activation in the frame).
 */
async function shareOnAvailableNavigator(
  data: ShareData,
  nav: ShareNav,
  doc: Document | undefined,
): Promise<ShareOutcome | "failed"> {
  const parent = nativeShare(nav);
  const frame = makeIframeShare(doc);

  if (frame) {
    try {
      await frame.share(data);
      return "shared";
    } catch (e) {
      if (isShareAbort(e)) return "cancelled";
      if (!isShareNotAllowed(e) && !isShareBusyError(e)) {
        /* TypeError on this payload — try parent */
      }
    } finally {
      frame.dispose();
    }
  }

  if (parent && !parentShareInFlight) {
    parentShareInFlight = true;
    try {
      await parent(data);
      parentShareInFlight = false;
      return "shared";
    } catch (e) {
      if (isShareAbort(e)) {
        parentShareInFlight = false;
        return "cancelled";
      }
      if (isShareBusyError(e)) {
        parentShareInFlight = true;
      } else {
        parentShareInFlight = false;
      }
    }
  }

  return "failed";
}

export async function copyKit(text: string): Promise<ShareOutcome> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok ? "copied" : "failed";
    } catch {
      return "failed";
    }
  }
}

/** Suite pitch: native share sheet with title and text, else clipboard. */
export async function shareOrCopy(opts: {
  title: string;
  text: string;
}): Promise<ShareOutcome> {
  const nav = navigator as ShareNav;
  const doc = typeof document !== "undefined" ? document : undefined;
  const share = nativeShare(nav);
  if (share) {
    const out = await shareOnAvailableNavigator(
      { title: opts.title, text: opts.text },
      nav,
      doc,
    );
    if (out === "shared" || out === "cancelled") return out;
  }
  return copyKit(opts.text);
}
