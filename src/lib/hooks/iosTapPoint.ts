/**
 * iPhone WKWebView (Capacitor) reports touch clientY in a different space
 * than position:fixed / overlay layout when the native webview uses
 * contentInsetAdjustmentBehavior = automatic.
 *
 * Symptom: tapping a list row selects the row below it. Preview (Chrome)
 * is fine. Offset ≈ status-bar / safe-area (~47–59px) ≈ one 52px row.
 *
 * When CSS env(safe-area-inset-top) is live, UIKit is NOT eating the inset
 * (contentInset never) and clientY already matches layout → bias 0.
 * When env() is 0 on a notched native iPhone, UIKit already inset the
 * scroll view and touches are still in screen space → apply typical inset.
 */

import { Capacitor } from "@capacitor/core";

export type SheetItemBox = {
  value: string;
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export function isIosNativeWebView(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
      return true;
    }
  } catch {
    /* web / no bridge */
  }
  try {
    const C = (
      window as unknown as {
        Capacitor?: {
          isNativePlatform?: () => boolean;
          getPlatform?: () => string;
        };
      }
    ).Capacitor;
    if (C?.isNativePlatform?.() && C.getPlatform?.() === "ios") return true;
  } catch {
    /* */
  }
  // Remote CAP_SERVER_URL pages can miss window.Capacitor for a beat.
  // WKWebView has messageHandlers and does not expose window.safari.
  const ua = navigator.userAgent || "";
  const ios =
    /iPhone|iPad|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!ios) return false;
  const safari = (window as unknown as { safari?: unknown }).safari;
  const hasSafari = typeof safari === "object" && safari !== null;
  const handlers = (
    window as unknown as {
      webkit?: { messageHandlers?: Record<string, unknown> };
    }
  ).webkit?.messageHandlers;
  return !hasSafari && Boolean(handlers && Object.keys(handlers).length);
}

/** @deprecated use isIosNativeWebView */
export function isCapacitorIos(): boolean {
  return isIosNativeWebView();
}

export function readSafeTopPx(): number {
  if (typeof window === "undefined") return 0;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--safe-top")
    .trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function iosSheetTapBiasFrom(opts: {
  nativeIos: boolean;
  sat: number;
  screenLong: number;
}): number {
  if (!opts.nativeIos) return 0;
  // CSS safe-area is in effect → layout and hits already agree
  if (opts.sat >= 20) return 0;
  // Notch / Dynamic Island phones (iPhone X+). 54 ≈ one dropdown row.
  if (opts.screenLong >= 812) return 54;
  return 20;
}

/** Pixels to subtract from clientY so the probe lands on the painted row. */
export function iosSheetTapBias(): number {
  if (typeof window === "undefined") return 0;
  const long = Math.max(window.screen?.height ?? 0, window.screen?.width ?? 0);
  return iosSheetTapBiasFrom({
    nativeIos: isIosNativeWebView(),
    sat: readSafeTopPx(),
    screenLong: long,
  });
}

/**
 * Pure hit-test used by the sheet and by the offset regression test.
 * `y` must already be in the same space as the boxes (bias applied).
 */
export function hitSheetItemAt(
  x: number,
  y: number,
  boxes: SheetItemBox[],
  slack: { first?: number; last?: number } = {},
): string | null {
  if (!boxes.length) return null;
  for (const b of boxes) {
    if (y >= b.top && y < b.bottom && x >= b.left - 4 && x <= b.right + 4) {
      return b.value;
    }
  }
  const first = boxes[0];
  const last = boxes[boxes.length - 1];
  const firstSlack = slack.first ?? 0;
  const lastSlack = slack.last ?? 12;
  if (y < first.top && y >= first.top - firstSlack - 8) return first.value;
  if (y >= last.bottom && y <= last.bottom + lastSlack) return last.value;
  return null;
}

export function resolveSheetItemValue(
  clientX: number,
  clientY: number,
  list: HTMLElement | null,
): string | null {
  if (!list) return null;
  const vv = typeof window !== "undefined" ? window.visualViewport : null;
  const bias = iosSheetTapBias();
  const x = clientX + (vv?.offsetLeft ?? 0);
  const y = clientY + (vv?.offsetTop ?? 0) - bias;

  const items = list.querySelectorAll<HTMLElement>(
    "[data-sheet-item]:not(:disabled)",
  );
  const boxes: SheetItemBox[] = [];
  for (const el of items) {
    const r = el.getBoundingClientRect();
    boxes.push({
      value: el.getAttribute("data-value") ?? "",
      top: r.top,
      bottom: r.bottom,
      left: r.left,
      right: r.right,
    });
  }
  return hitSheetItemAt(x, y, boxes, { first: Math.max(bias, 12), last: 12 });
}
