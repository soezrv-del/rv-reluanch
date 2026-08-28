/**
 * Haptic feedback engine.
 * Native Capacitor when present, Vibration API on Android, Web Audio click
 * everywhere else (iOS Safari / desktop) so dials still “tick.”
 */

export type HapticKind =
  | "tick"
  | "detent"
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "warn"
  | "start"
  | "end";

type HapticsMod = {
  impact?: (opts: { style: string }) => Promise<void>;
  selectionChanged?: () => Promise<void>;
  selectionStart?: () => Promise<void>;
  selectionEnd?: () => Promise<void>;
  notification?: (opts: { type: string }) => Promise<void>;
};

const MIN_GAP: Record<HapticKind, number> = {
  tick: 28,
  detent: 36,
  light: 40,
  medium: 48,
  heavy: 70,
  success: 120,
  warn: 120,
  start: 80,
  end: 80,
};

let cached: HapticsMod | null | undefined;
let impactStyles: { Light?: string; Medium?: string; Heavy?: string } | null =
  null;
let loadPromise: Promise<HapticsMod | null> | null = null;
let enabled = true;
let audioCtx: AudioContext | null = null;
let lastAt: Partial<Record<HapticKind, number>> = {};
let armed = false;

function canVibrate() {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  );
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function vibrateTick(ms = 8) {
  try {
    if (canVibrate()) navigator.vibrate(ms);
  } catch {
    /* */
  }
}

function vibratePattern(pattern: number[]) {
  try {
    if (canVibrate()) navigator.vibrate(pattern);
  } catch {
    /* */
  }
}

function getAudio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AC();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

/** Resume audio on a real gesture so iOS will play the click. */
export function armHaptics() {
  if (armed) return;
  armed = true;
  const ctx = getAudio();
  if (ctx && ctx.state === "suspended") void ctx.resume();
  void loadHaptics();
}

function playClick(kind: HapticKind) {
  const ctx = getAudio();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 180;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  const spec =
    kind === "heavy"
      ? { freq: 140, peak: 0.07, dur: 0.045 }
      : kind === "medium" || kind === "detent"
        ? { freq: 190, peak: 0.055, dur: 0.032 }
        : kind === "success"
          ? { freq: 420, peak: 0.045, dur: 0.05 }
          : kind === "warn"
            ? { freq: 110, peak: 0.06, dur: 0.06 }
            : { freq: 240, peak: 0.04, dur: 0.022 };

  osc.type = "triangle";
  osc.frequency.setValueAtTime(spec.freq, t);
  osc.frequency.exponentialRampToValueAtTime(spec.freq * 0.7, t + spec.dur);
  gain.gain.setValueAtTime(spec.peak, t);
  gain.gain.exponentialRampToValueAtTime(0.0008, t + spec.dur);
  osc.start(t);
  osc.stop(t + spec.dur + 0.01);
  osc.onended = () => {
    try {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    } catch {
      /* */
    }
  };
}

async function loadHaptics(): Promise<HapticsMod | null> {
  if (cached !== undefined) return cached;
  if (loadPromise) return loadPromise;
  loadPromise = (async () => {
    if (typeof window === "undefined") {
      cached = null;
      return null;
    }
    try {
      const mod = (await (
        Function('return import("@capacitor/haptics")')() as Promise<{
          Haptics?: HapticsMod;
          ImpactStyle?: { Light?: string; Medium?: string; Heavy?: string };
        }>
      ).catch(() => null));
      if (mod?.Haptics) {
        impactStyles = mod.ImpactStyle ?? null;
        cached = mod.Haptics;
        return cached;
      }
    } catch {
      /* */
    }
    cached = null;
    return null;
  })();
  return loadPromise;
}

function gated(kind: HapticKind) {
  if (!enabled || prefersReducedMotion()) return false;
  const now = performance.now();
  const gap = MIN_GAP[kind] ?? 40;
  if (now - (lastAt[kind] ?? 0) < gap) return false;
  lastAt[kind] = now;
  return true;
}

async function fire(kind: HapticKind) {
  if (!gated(kind)) return;
  armHaptics();

  const H = await loadHaptics();
  try {
    if (kind === "start" && H?.selectionStart) {
      await H.selectionStart();
      return;
    }
    if (kind === "end" && H?.selectionEnd) {
      await H.selectionEnd();
      return;
    }
    if ((kind === "tick" || kind === "detent") && H?.selectionChanged) {
      await H.selectionChanged();
      playClick(kind);
      return;
    }
    if (kind === "success" && H?.notification) {
      await H.notification({ type: "SUCCESS" });
      playClick(kind);
      return;
    }
    if (kind === "warn" && H?.notification) {
      await H.notification({ type: "WARNING" });
      playClick(kind);
      return;
    }
    if (H?.impact) {
      const style =
        kind === "heavy"
          ? (impactStyles?.Heavy ?? "HEAVY")
          : kind === "medium" || kind === "detent"
            ? (impactStyles?.Medium ?? "MEDIUM")
            : (impactStyles?.Light ?? "LIGHT");
      await H.impact({ style });
      playClick(kind);
      return;
    }
  } catch {
    /* fall through */
  }

  if (kind === "heavy") vibratePattern([16, 12, 10]);
  else if (kind === "medium" || kind === "detent") vibrateTick(14);
  else if (kind === "success") vibratePattern([10, 30, 14]);
  else if (kind === "warn") vibratePattern([20, 20, 20]);
  else vibrateTick(8);

  playClick(kind);
}

/** Warm native + audio so the first click isn’t late. */
export function preloadHaptics() {
  void loadHaptics();
  if (typeof window !== "undefined" && !armed) {
    const kick = () => {
      armHaptics();
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("touchstart", kick);
      window.removeEventListener("keydown", kick);
    };
    window.addEventListener("pointerdown", kick, { once: true, passive: true });
    window.addEventListener("touchstart", kick, { once: true, passive: true });
    window.addEventListener("keydown", kick, { once: true });
  }
}

export function setHapticsEnabled(on: boolean) {
  enabled = on;
}

export function isHapticsEnabled() {
  return enabled && !prefersReducedMotion();
}

export function hapticLight() {
  return fire("light");
}

export function hapticMedium() {
  return fire("medium");
}

export function hapticHeavy() {
  return fire("heavy");
}

/** Dial / picker snap — one mechanical click per number. */
export function hapticSnap() {
  return fire("tick");
}

/**
 * Detent click for money / year wheels.
 * intensity 0–1 maps soft tick → hard click (use step size).
 */
export function hapticDetent(intensity = 0.45) {
  const n = Number.isFinite(intensity) ? Math.max(0, Math.min(1, intensity)) : 0.45;
  if (n >= 0.75) return fire("heavy");
  if (n >= 0.4) return fire("detent");
  return fire("tick");
}

export function hapticSuccess() {
  return fire("success");
}

export function hapticWarn() {
  return fire("warn");
}

export function hapticSnapStart() {
  return fire("start");
}

export function hapticSnapEnd() {
  return fire("end");
}
