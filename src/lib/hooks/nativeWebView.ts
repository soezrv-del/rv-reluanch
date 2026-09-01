/**
 * Android Capacitor WebView helpers.
 *
 * iOS tap-coordinate bias lives in iosTapPoint.ts and must stay untouched.
 * Android’s failure mode is different: system nav / gesture inset + parent
 * `pointer-events: none` + ancestor touch listeners eat dock clicks.
 */

import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export function isAndroidNativeWebView(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (
      Capacitor.isNativePlatform() &&
      Capacitor.getPlatform() === "android"
    ) {
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
    if (C?.isNativePlatform?.() && C.getPlatform?.() === "android") return true;
  } catch {
    /* */
  }
  // Remote CAP_SERVER_URL pages can miss window.Capacitor for a beat.
  const ua = navigator.userAgent || "";
  if (!/Android/i.test(ua)) return false;
  return /Capacitor/i.test(ua) || /; wv\)/i.test(ua);
}

export function readSafeBottomPx(): number {
  if (typeof window === "undefined") return 0;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--safe-bottom")
    .trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Bottom padding for the tab dock.
 * iOS/web keep the existing tight inset (home-indicator taps still work).
 * Android must lift the dock out of the system nav / gesture dead zone
 * when CSS env(safe-area-inset-bottom) is 0 (common in emulator WebViews).
 */
export function computeDockSafeBottomPx(opts: {
  android: boolean;
  cssSafe: number;
  innerH: number;
  screenH: number;
}): number {
  if (!opts.android) {
    const safe = Number.isFinite(opts.cssSafe) ? opts.cssSafe : 0;
    return Math.min(10, Math.max(6, safe || 8));
  }
  if (opts.cssSafe >= 16) return Math.round(opts.cssSafe);
  const chrome = Math.max(0, opts.screenH - opts.innerH);
  // WebView already laid out above the nav bar — keep a small gap.
  if (chrome > 24) return Math.max(12, Math.round(opts.cssSafe));
  // Edge-to-edge / immersive: typical 3-button or gesture bar.
  return 48;
}

/** Max pointer travel (px) that still counts as a dock tap, not a swipe. */
export const DOCK_TAP_SLOP = 20;

export function isStationaryDockTap(
  dx: number,
  dy: number,
  slop = DOCK_TAP_SLOP,
): boolean {
  return Math.hypot(dx, dy) <= slop;
}

/** Install --dock-safe-bottom + html.android-native for CSS. */
export function useDockSafeInset() {
  useEffect(() => {
    const apply = () => {
      const android = isAndroidNativeWebView();
      const root = document.documentElement;
      root.classList.toggle("android-native", android);
      if (!android) {
        root.style.removeProperty("--dock-safe-bottom");
        return;
      }
      const px = computeDockSafeBottomPx({
        android: true,
        cssSafe: readSafeBottomPx(),
        innerH: window.innerHeight,
        screenH: window.screen?.height ?? window.innerHeight,
      });
      root.style.setProperty("--dock-safe-bottom", `${px}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      document.documentElement.style.removeProperty("--dock-safe-bottom");
      document.documentElement.classList.remove("android-native");
    };
  }, []);
}
