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
 * Bottom padding for the tab dock (Android CSS `--dock-safe-bottom` only).
 * iOS/web chrome padding is CSS-owned (`.bottom-tabs-nav` env() + slack).
 * This iOS branch stays a tight unused cap — do not drive dock CSS with it.
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

/** iPhone / iPod — Display Zoom slack is iOS-only. */
export function isIosPhoneClient(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  if (/iPhone|iPod/.test(ua)) return true;
  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "ios") {
      return true;
    }
  } catch {
    /* web / no bridge */
  }
  return false;
}

/**
 * Extra iOS chrome slack when Display Zoom / Larger Text cramps the layout.
 * Cheap: visual viewport (or innerHeight) vs screen.height. No native plugin.
 * Leaves `--safe-top` / `--safe-bottom` as raw env() so tap-bias probes stay honest.
 */
export function computeIosZoomSafeSlackPx(opts: {
  ios: boolean;
  innerH: number;
  screenH: number;
  visualH?: number;
}): { top: number; bottom: number } {
  if (!opts.ios) return { top: 0, bottom: 0 };
  const layoutH =
    opts.visualH && opts.visualH > 0 ? opts.visualH : opts.innerH;
  const screenH = opts.screenH > 0 ? opts.screenH : layoutH;
  if (!(layoutH > 0 && screenH > 0)) return { top: 0, bottom: 0 };
  const used = layoutH / screenH;
  const cramped = used <= 0.88 || layoutH <= 740;
  if (!cramped) return { top: 0, bottom: 0 };
  return { top: 10, bottom: 12 };
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

/** Install --dock-safe-bottom (Android) + --zoom-safe-* (iOS) for CSS. */
export function useDockSafeInset() {
  useEffect(() => {
    const apply = () => {
      const android = isAndroidNativeWebView();
      const root = document.documentElement;
      root.classList.toggle("android-native", android);
      if (android) {
        root.style.removeProperty("--zoom-safe-top");
        root.style.removeProperty("--zoom-safe-bottom");
        const px = computeDockSafeBottomPx({
          android: true,
          cssSafe: readSafeBottomPx(),
          innerH: window.innerHeight,
          screenH: window.screen?.height ?? window.innerHeight,
        });
        root.style.setProperty("--dock-safe-bottom", `${px}px`);
        return;
      }
      root.style.removeProperty("--dock-safe-bottom");
      if (isIosPhoneClient()) {
        const slack = computeIosZoomSafeSlackPx({
          ios: true,
          innerH: window.innerHeight,
          screenH: window.screen?.height ?? window.innerHeight,
          visualH: window.visualViewport?.height,
        });
        root.style.setProperty("--zoom-safe-top", `${slack.top}px`);
        root.style.setProperty("--zoom-safe-bottom", `${slack.bottom}px`);
      } else {
        root.style.removeProperty("--zoom-safe-top");
        root.style.removeProperty("--zoom-safe-bottom");
      }
    };
    apply();
    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
      vv?.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("--dock-safe-bottom");
      document.documentElement.style.removeProperty("--zoom-safe-top");
      document.documentElement.style.removeProperty("--zoom-safe-bottom");
      document.documentElement.classList.remove("android-native");
    };
  }, []);
}
