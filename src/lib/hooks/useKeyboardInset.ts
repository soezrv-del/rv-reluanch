import { useEffect, useState } from "react";

export type KeyboardInset = {
  /** Keyboard height overlapping the layout (px) */
  inset: number;
  /** True when keyboard is meaningfully open */
  open: boolean;
  /** visualViewport height if available */
  vvHeight: number;
  /** visualViewport offsetTop (iOS rubber-band) */
  vvOffsetTop: number;
};

const THRESHOLD = 40;
/** Extra breathing room above keyboard for focused fields */
const FOCUS_GAP = 28;

function measure(): KeyboardInset {
  if (typeof window === "undefined") {
    return { inset: 0, open: false, vvHeight: 0, vvOffsetTop: 0 };
  }
  const vv = window.visualViewport;
  const layoutH = window.innerHeight;
  if (!vv) {
    return {
      inset: 0,
      open: false,
      vvHeight: layoutH,
      vvOffsetTop: 0,
    };
  }
  // Covered region below the visual viewport (classic iOS keyboard measure)
  const covered = Math.max(0, layoutH - vv.height - vv.offsetTop);
  const inset = covered > THRESHOLD ? Math.round(covered) : 0;
  return {
    inset,
    open: inset > 0,
    vvHeight: vv.height,
    vvOffsetTop: vv.offsetTop,
  };
}

function applyCssVars(k: KeyboardInset) {
  const root = document.documentElement;
  root.style.setProperty("--kb-inset", `${k.inset}px`);
  root.style.setProperty("--vv-height", `${k.vvHeight || window.innerHeight}px`);
  root.style.setProperty("--vv-offset-top", `${k.vvOffsetTop}px`);
  root.classList.toggle("kb-open", k.open);
  root.dataset.kbOpen = k.open ? "1" : "0";
}

function isTextField(el: EventTarget | null): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  if (tag === "INPUT") {
    const type = ((el as HTMLInputElement).type || "text").toLowerCase();
    if (
      type === "button" ||
      type === "checkbox" ||
      type === "radio" ||
      type === "file" ||
      type === "submit" ||
      type === "reset" ||
      type === "image" ||
      type === "hidden" ||
      type === "range" ||
      type === "color"
    ) {
      return false;
    }
    return true;
  }
  return tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

function findScrollParent(el: HTMLElement): HTMLElement | null {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node);
    const oy = style.overflowY;
    const canScroll =
      (oy === "auto" || oy === "scroll" || oy === "overlay") &&
      node.scrollHeight > node.clientHeight + 4;
    if (canScroll || node.hasAttribute("data-app-scroll") || node.classList.contains("rv-scroll")) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

/**
 * Scroll a focused field so it sits in the visible visual viewport,
 * above the keyboard and any bottom chrome. Works for nested sheets.
 */
export function scrollFieldIntoVisibleArea(el: HTMLElement, keyboardInset = 0) {
  if (typeof window === "undefined") return;

  const vv = window.visualViewport;
  const vvTop = vv?.offsetTop ?? 0;
  const vvHeight = vv?.height ?? window.innerHeight;
  const kb =
    keyboardInset > 0
      ? keyboardInset
      : Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--kb-inset") ||
            "0",
        ) || 0;

  // Visible band inside the visual viewport (leave room above keyboard)
  const visibleTop = vvTop + 12;
  const visibleBottom = vvTop + vvHeight - Math.max(kb, 0) - FOCUS_GAP;

  const rect = el.getBoundingClientRect();
  // Prefer scrolling the nearest scroll parent so fixed overlays keep working
  const scroller = findScrollParent(el);

  if (scroller) {
    const sRect = scroller.getBoundingClientRect();
    const current = scroller.scrollTop;
    // Target: place field ~35% from top of visible area inside scroller
    const fieldCenter = rect.top + rect.height / 2;
    const desiredCenter = (visibleTop + visibleBottom) / 2;
    let delta = fieldCenter - desiredCenter;

    // Clamp so we don't overscroll past field still being below visible bottom
    if (rect.bottom > visibleBottom - 8) {
      delta = Math.max(delta, rect.bottom - visibleBottom + 16);
    }
    if (rect.top < visibleTop + 8) {
      delta = Math.min(delta, rect.top - visibleTop - 16);
    }

    // Only scroll if field is outside comfortable band
    const needs =
      rect.bottom > visibleBottom - 4 ||
      rect.top < Math.max(sRect.top, visibleTop) + 4 ||
      Math.abs(delta) > 8;

    if (needs) {
      const next = Math.max(0, current + delta);
      try {
        scroller.scrollTo({ top: next, behavior: "smooth" });
      } catch {
        scroller.scrollTop = next;
      }
    }
    return;
  }

  // Fallback: native scrollIntoView
  try {
    el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  } catch {
    try {
      el.scrollIntoView(true);
    } catch {
      /* */
    }
  }
}

/**
 * Global keyboard inset for iOS Capacitor + Safari.
 * Sets CSS vars: --kb-inset, --vv-height, --vv-offset-top
 * Adds html.kb-open when keyboard is up.
 */
export function useKeyboardInset(): KeyboardInset {
  // SSR + first client paint must match (zeros). Measuring here hydrates
  // a pixel height that React 19 will not patch — blank iframe preview.
  const [state, setState] = useState<KeyboardInset>({
    inset: 0,
    open: false,
    vvHeight: 0,
    vvOffsetTop: 0,
  });

  useEffect(() => {
    let raf = 0;
    const publish = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const next = measure();
        setState((prev) =>
          prev.inset === next.inset &&
          prev.open === next.open &&
          Math.abs(prev.vvHeight - next.vvHeight) < 1 &&
          Math.abs(prev.vvOffsetTop - next.vvOffsetTop) < 1
            ? prev
            : next,
        );
        applyCssVars(next);
      });
    };

    publish();

    const vv = window.visualViewport;
    vv?.addEventListener("resize", publish);
    vv?.addEventListener("scroll", publish);
    window.addEventListener("resize", publish);
    window.addEventListener("orientationchange", publish);
    // focus/blur catch WebKit cases where visualViewport lags
    window.addEventListener("focusin", publish);
    window.addEventListener("focusout", publish);

    // Capacitor Keyboard plugin (native) — more accurate on iOS WebView
    let removeCap: (() => void) | undefined;
    void (async () => {
      try {
        const { Keyboard } = await import("@capacitor/keyboard");
        const applyNative = (h: number) => {
          const next: KeyboardInset = {
            inset: h > THRESHOLD ? h : 0,
            open: h > THRESHOLD,
            vvHeight: window.visualViewport?.height ?? window.innerHeight,
            vvOffsetTop: window.visualViewport?.offsetTop ?? 0,
          };
          setState(next);
          applyCssVars(next);
        };
        const show = await Keyboard.addListener("keyboardWillShow", (info) => {
          applyNative(Math.round(info.keyboardHeight || 0));
        });
        const shown = await Keyboard.addListener("keyboardDidShow", (info) => {
          applyNative(Math.round(info.keyboardHeight || 0));
        });
        const hide = await Keyboard.addListener("keyboardWillHide", () => {
          const closed: KeyboardInset = {
            ...measure(),
            inset: 0,
            open: false,
          };
          setState(closed);
          applyCssVars(closed);
        });
        const hidden = await Keyboard.addListener("keyboardDidHide", () => {
          const closed: KeyboardInset = {
            ...measure(),
            inset: 0,
            open: false,
          };
          setState(closed);
          applyCssVars(closed);
        });
        removeCap = () => {
          void show.remove();
          void shown.remove();
          void hide.remove();
          void hidden.remove();
        };
      } catch {
        /* web / no plugin */
      }
    })();

    return () => {
      cancelAnimationFrame(raf);
      vv?.removeEventListener("resize", publish);
      vv?.removeEventListener("scroll", publish);
      window.removeEventListener("resize", publish);
      window.removeEventListener("orientationchange", publish);
      window.removeEventListener("focusin", publish);
      window.removeEventListener("focusout", publish);
      removeCap?.();
      document.documentElement.classList.remove("kb-open");
      document.documentElement.style.removeProperty("--kb-inset");
    };
  }, []);

  return state;
}

/**
 * When an input/textarea gains focus, keep it visible above the keyboard.
 * Retries across the keyboard animation window (iOS is slow ~250–400ms).
 */
export function useFocusScrollIntoView(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let timers: number[] = [];
    const clearTimers = () => {
      for (const t of timers) window.clearTimeout(t);
      timers = [];
    };

    const runScroll = (t: HTMLElement) => {
      const kb =
        Number.parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--kb-inset") ||
            "0",
        ) || 0;
      scrollFieldIntoVisibleArea(t, kb);
    };

    const onFocusIn = (e: FocusEvent) => {
      const t = e.target;
      if (!isTextField(t)) return;
      clearTimers();
      // Immediate attempt (some keyboards already up)
      runScroll(t);
      // Retries through keyboard animation + layout settle
      for (const delay of [80, 180, 320, 480, 700]) {
        timers.push(
          window.setTimeout(() => {
            if (document.activeElement === t) runScroll(t);
          }, delay),
        );
      }
    };

    const onFocusOut = () => {
      // Don't clear mid-transition if focus moves to another field
      window.setTimeout(() => {
        if (!isTextField(document.activeElement)) clearTimers();
      }, 50);
    };

    // Also re-scroll when keyboard size changes while focused
    const onVv = () => {
      const t = document.activeElement;
      if (isTextField(t)) runScroll(t);
    };
    window.visualViewport?.addEventListener("resize", onVv);
    window.visualViewport?.addEventListener("scroll", onVv);

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);
    return () => {
      clearTimers();
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      window.visualViewport?.removeEventListener("resize", onVv);
      window.visualViewport?.removeEventListener("scroll", onVv);
    };
  }, [enabled]);
}
