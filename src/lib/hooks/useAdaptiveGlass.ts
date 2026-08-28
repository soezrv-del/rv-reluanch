import { useEffect, useState, type CSSProperties, type RefObject } from "react";

/** sRGB channel → linear */
function toLinear(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Relative luminance (WCAG) 0..1 */
export function relativeLuminance(r: number, g: number, b: number) {
  return (
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  );
}

/**
 * Level-3 glass α from backdrop luminance.
 * Darker backdrop → clearer glass; bright backdrop → slightly denser fill
 * so white/sapphire type stays punchy.
 */
export function glassAlphaFromLuminance(L: number) {
  const clear = 0.01;
  const dense = 0.085;
  const t = Math.pow(Math.min(1, Math.max(0, L)), 1.15);
  return clear + (dense - clear) * t;
}

export function glassBlurFromLuminance(L: number) {
  // Slightly more frost on bright areas
  return Math.round(5 + L * 5); // 5–10px
}

type SampleCache = {
  url: string;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
};

const cache = new Map<string, SampleCache | "loading" | "error">();
const waiters = new Map<string, Array<(c: SampleCache | null) => void>>();

function loadSample(url: string): Promise<SampleCache | null> {
  const hit = cache.get(url);
  if (hit && hit !== "loading" && hit !== "error") return Promise.resolve(hit);
  if (hit === "error") return Promise.resolve(null);

  return new Promise((resolve) => {
    const list = waiters.get(url) ?? [];
    list.push(resolve);
    waiters.set(url, list);
    if (hit === "loading") return;

    cache.set(url, "loading");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        // Downsample for cheap region averages
        const maxW = 64;
        const scale = Math.min(1, maxW / img.naturalWidth);
        const w = Math.max(8, Math.round(img.naturalWidth * scale));
        const h = Math.max(8, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          cache.set(url, "error");
          for (const fn of waiters.get(url) ?? []) fn(null);
          waiters.delete(url);
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const entry: SampleCache = { url, canvas, ctx, w, h };
        cache.set(url, entry);
        for (const fn of waiters.get(url) ?? []) fn(entry);
        waiters.delete(url);
      } catch {
        cache.set(url, "error");
        for (const fn of waiters.get(url) ?? []) fn(null);
        waiters.delete(url);
      }
    };
    img.onerror = () => {
      cache.set(url, "error");
      for (const fn of waiters.get(url) ?? []) fn(null);
      waiters.delete(url);
    };
    img.src = url;
  });
}

/** Average luminance of a vertical band (y0..y1 as 0..1 of image height). */
function bandLuminance(sample: SampleCache, y0: number, y1: number): number {
  const top = Math.max(0, Math.floor(sample.h * y0));
  const bot = Math.min(sample.h, Math.ceil(sample.h * y1));
  const height = Math.max(1, bot - top);
  let data: ImageData;
  try {
    data = sample.ctx.getImageData(0, top, sample.w, height);
  } catch {
    return 0.25; // CORS fallback — mid-dark showroom default
  }
  const px = data.data;
  let sum = 0;
  let n = 0;
  // stride sample for speed
  for (let i = 0; i < px.length; i += 16) {
    sum += relativeLuminance(px[i]!, px[i + 1]!, px[i + 2]!);
    n++;
  }
  return n ? sum / n : 0.25;
}

export type AdaptiveGlassVars = {
  /** Main card body α */
  alpha: number;
  /** Deep panel α */
  alphaDeep: number;
  /** Specular highlight α */
  alphaSpec: number;
  /** Depth foot α */
  alphaDepth: number;
  blurPx: number;
  luminance: number;
  style: CSSProperties;
};

const DEFAULT: AdaptiveGlassVars = {
  alpha: 0.02,
  alphaDeep: 0.05,
  alphaSpec: 0.05,
  alphaDepth: 0.03,
  blurPx: 6,
  luminance: 0.22,
  style: {
    ["--rv-glass-a" as string]: "0.02",
    ["--rv-glass-a-deep" as string]: "0.05",
    ["--rv-glass-a-spec" as string]: "0.05",
    ["--rv-glass-a-depth" as string]: "0.03",
    ["--rv-glass-blur" as string]: "6px",
    ["--rv-glass-L" as string]: "0.22",
  },
};

function buildVars(L: number): AdaptiveGlassVars {
  const alpha = glassAlphaFromLuminance(L);
  const alphaDeep = Math.min(0.14, alpha * 2.2);
  const alphaSpec = Math.min(0.12, alpha * 2.4 + 0.02);
  const alphaDepth = Math.min(0.1, alpha * 1.6 + 0.01);
  const blurPx = glassBlurFromLuminance(L);
  return {
    alpha,
    alphaDeep,
    alphaSpec,
    alphaDepth,
    blurPx,
    luminance: L,
    style: {
      ["--rv-glass-a" as string]: alpha.toFixed(4),
      ["--rv-glass-a-deep" as string]: alphaDeep.toFixed(4),
      ["--rv-glass-a-spec" as string]: alphaSpec.toFixed(4),
      ["--rv-glass-a-depth" as string]: alphaDepth.toFixed(4),
      ["--rv-glass-blur" as string]: `${blurPx}px`,
      ["--rv-glass-L" as string]: L.toFixed(3),
    },
  };
}

/**
 * Level-3 adaptive glass: samples backdrop luminance (scroll-aware band)
 * and exposes CSS variables for multi-layer transparent cards.
 */
export function useAdaptiveGlass(
  backdropUrl: string,
  scrollRef?: RefObject<HTMLElement | null>,
): AdaptiveGlassVars {
  const [vars, setVars] = useState<AdaptiveGlassVars>(DEFAULT);

  useEffect(() => {
    let cancelled = false;
    let raf = 0;

    const recompute = async () => {
      const sample = await loadSample(backdropUrl);
      if (cancelled || !sample) {
        if (!cancelled) setVars(DEFAULT);
        return;
      }

      // Cover-style vertical band: top of viewport ≈ upper image when scrolled 0
      const el = scrollRef?.current;
      const maxScroll = el
        ? Math.max(1, el.scrollHeight - el.clientHeight)
        : 1;
      const progress = el ? Math.min(1, Math.max(0, el.scrollTop / maxScroll)) : 0;
      // Cards sit mid-screen; shift sample band with scroll
      const bandCenter = 0.28 + progress * 0.45;
      const half = 0.18;
      const L = bandLuminance(
        sample,
        Math.max(0, bandCenter - half),
        Math.min(1, bandCenter + half),
      );
      if (!cancelled) setVars(buildVars(L));
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        void recompute();
      });
    };

    void recompute();
    const el = scrollRef?.current;
    el?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      el?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [backdropUrl, scrollRef]);

  return vars;
}
