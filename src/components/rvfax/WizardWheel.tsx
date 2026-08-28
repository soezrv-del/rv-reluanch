import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Keyboard,
  List,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticSnap } from "@/lib/haptics";

export type WizardWheelItem =
  | string
  | {
      value: string;
      label?: string;
      meta?: string;
      disabled?: boolean;
    };

type Normalized = {
  value: string;
  label: string;
  meta?: string;
  disabled: boolean;
};

/** Tall iOS drum — ~3 rows above, selected, ~3 below */
const ROW_H = 42;
const VISIBLE = 7;
const CENTER = Math.floor(VISIBLE / 2);
const DRUM_H = ROW_H * VISIBLE;
/** Top spacer so index 0 centers in the selection band */
const PAD = ROW_H * CENTER;

/** Friction (1/s) — exponential decay v *= e^(-k·dt) */
const FRICTION = 5.2;
/** px/ms — below this, settle to nearest row */
const SNAP_V = 0.05;
/** Cap release velocity (px/ms) */
const MAX_V = 4.0;
/** Rubber-band factor past ends while dragging */
const RUBBER = 0.28;
/** Snap ease duration */
const SNAP_MS = 220;
/** Movement before we treat gesture as a drag (not a tap) */
const DRAG_SLOP = 6;

function normalize(items: WizardWheelItem[]): Normalized[] {
  return items.map((item) =>
    typeof item === "string"
      ? { value: item, label: item, meta: undefined, disabled: false }
      : {
          value: item.value,
          label: item.label ?? item.value,
          meta: item.meta,
          disabled: item.disabled ?? false,
        },
  );
}

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return Math.max(0, Math.min(len - 1, i));
}

function indexFromY(y: number, len: number) {
  if (len <= 0) return 0;
  return clampIndex(Math.round(y / ROW_H), len);
}

function yFromIndex(i: number) {
  return i * ROW_H;
}

function maxY(len: number) {
  return Math.max(0, (len - 1) * ROW_H);
}

function applyRubber(y: number, max: number) {
  if (y < 0) return y * RUBBER;
  if (y > max) return max + (y - max) * RUBBER;
  return y;
}

/**
 * iOS-style picker wheel with real touch + inertia.
 * Seven visible rows (~3 above / selected / ~3 below). Tap a row to lock it in.
 * “Type / list” switches to the classic manual list + text entry.
 */
export function WizardWheel({
  title,
  subtitle,
  items,
  selected,
  onSelect,
  emptyHint = "No options for this step",
  allowCustom = false,
  customLabel = "Use custom entry",
  customPlaceholder = "Type your own…",
  stepIndex = 0,
  stepCount = 4,
  stepLabels,
  mode,
  onModeChange,
  hideModeTabs = false,
}: {
  title: string;
  subtitle?: string;
  items: WizardWheelItem[];
  selected: string;
  onSelect: (value: string) => void;
  emptyHint?: string;
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
  stepIndex?: number;
  stepCount?: number;
  stepLabels?: string[];
  /** Controlled wheel vs manual. Uncontrolled if omitted. */
  mode?: "wheel" | "manual";
  onModeChange?: (mode: "wheel" | "manual") => void;
  /** Hide Wheel/Manual tabs when the parent already has a mode switch */
  hideModeTabs?: boolean;
}) {
  const [q, setQ] = useState("");
  const [keyboardOn, setKeyboardOn] = useState(false);
  const [internalMode, setInternalMode] = useState<"wheel" | "manual">("wheel");
  const entryMode = mode ?? internalMode;
  const setEntryMode = useCallback(
    (next: "wheel" | "manual") => {
      if (mode == null) setInternalMode(next);
      onModeChange?.(next);
    },
    [mode, onModeChange],
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pickGuard = useRef(false);

  const [focusIdx, setFocusIdx] = useState(0);
  const focusIdxRef = useRef(0);

  /** Scroll position (px). Item i is centered when y ≈ i * ROW_H */
  const yRef = useRef(0);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef(0);

  // Gesture state (all refs — no re-renders mid-drag)
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const activeTouchId = useRef<number | null>(null);
  const dragStartClientY = useRef(0);
  const dragStartScrollY = useRef(0);
  const movedRef = useRef(false);
  const samplesRef = useRef<{ y: number; t: number }[]>([]);
  /** 'pointer' | 'touch' — avoid double-driving when both fire */
  const inputModeRef = useRef<"none" | "pointer" | "touch">("none");

  const normalized = useMemo(() => normalize(items), [items]);
  const itemsSig = useMemo(
    () =>
      `${normalized.length}:${normalized[0]?.value ?? ""}:${normalized[normalized.length - 1]?.value ?? ""}`,
    [normalized],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return normalized;
    return normalized.filter(
      (i) =>
        i.label.toLowerCase().includes(needle) ||
        i.value.toLowerCase().includes(needle) ||
        (i.meta?.toLowerCase().includes(needle) ?? false),
    );
  }, [normalized, q]);

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  const exactMatch = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return false;
    return normalized.some(
      (i) =>
        i.value.toLowerCase() === needle || i.label.toLowerCase() === needle,
    );
  }, [normalized, q]);

  const canUseCustom = allowCustom && q.trim().length > 0 && !exactMatch;

  const stopRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  /** Apply scroll Y to DOM immediately; React only when center index changes */
  const applyY = useCallback((y: number, len: number, haptic = true) => {
    yRef.current = y;
    const node = contentRef.current;
    if (node) {
      node.style.transform = `translate3d(0, ${PAD - y}px, 0)`;
    }
    const idx = indexFromY(y, len);
    if (idx !== focusIdxRef.current) {
      focusIdxRef.current = idx;
      setFocusIdx(idx);
      if (haptic) void hapticSnap();
    }
  }, []);

  const snapTo = useCallback(
    (index: number, animate: boolean) => {
      const len = filteredRef.current.length;
      const target = yFromIndex(clampIndex(index, len));
      stopRaf();

      if (!animate || !contentRef.current) {
        applyY(target, len, false);
        return;
      }

      const from = yRef.current;
      const dist = target - from;
      if (Math.abs(dist) < 0.5) {
        applyY(target, len, false);
        return;
      }

      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / SNAP_MS);
        const e = 1 - (1 - t) ** 3; // easeOutCubic
        applyY(from + dist * e, len, t < 1);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = 0;
          applyY(target, len, false);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [applyY, stopRaf],
  );

  const startInertia = useCallback(
    (v0: number) => {
      const len = filteredRef.current.length;
      const max = maxY(len);
      let v = Math.max(-MAX_V, Math.min(MAX_V, v0));
      stopRaf();

      if (Math.abs(v) < SNAP_V) {
        snapTo(indexFromY(yRef.current, len), true);
        return;
      }

      let last = performance.now();
      const loop = (now: number) => {
        const dtMs = Math.min(34, Math.max(0, now - last));
        last = now;
        const dt = dtMs / 1000;

        let y = yRef.current + v * dtMs;
        v *= Math.exp(-FRICTION * dt);

        if (y < 0 || y > max) {
          v *= 0.78;
          const bound = y < 0 ? 0 : max;
          y += (bound - y) * Math.min(1, 16 * dt);
          if (Math.abs(y - bound) < 1 && Math.abs(v) < SNAP_V * 2) {
            snapTo(bound <= 0 ? 0 : len - 1, true);
            return;
          }
        } else if (Math.abs(v) < SNAP_V) {
          snapTo(indexFromY(y, len), true);
          return;
        }

        applyY(y, len);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    },
    [applyY, snapTo, stopRaf],
  );

  // ── Seed when list / selection / step title changes ─────────────────────
  useEffect(() => {
    setQ("");
    setKeyboardOn(entryMode === "manual");
    pickGuard.current = false;
    stopRaf();
    draggingRef.current = false;
    inputModeRef.current = "none";
    const list = filteredRef.current;
    const idx = list.findIndex((i) => i.value === selected);
    const i = idx >= 0 ? idx : 0;
    focusIdxRef.current = i;
    setFocusIdx(i);
    yRef.current = yFromIndex(i);
    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(0, ${PAD - yRef.current}px, 0)`;
    }
  }, [itemsSig, selected, title, stopRaf]);

  // Filter typing → jump to top of filtered list
  const qPrev = useRef(q);
  useEffect(() => {
    if (q === qPrev.current) return;
    qPrev.current = q;
    stopRaf();
    focusIdxRef.current = 0;
    setFocusIdx(0);
    yRef.current = 0;
    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(0, ${PAD}px, 0)`;
    }
  }, [q, stopRaf]);

  useEffect(() => {
    if (!keyboardOn && entryMode !== "manual") return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 40);
    return () => window.clearTimeout(t);
  }, [keyboardOn, entryMode]);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const commit = useCallback(
    (value: string) => {
      if (pickGuard.current) return;
      pickGuard.current = true;
      stopRaf();
      void hapticSnap();
      onSelect(value);
      window.setTimeout(() => {
        pickGuard.current = false;
      }, 450);
    },
    [onSelect, stopRaf],
  );

  const commitRef = useRef(commit);
  commitRef.current = commit;

  const stepBy = useCallback(
    (delta: number) => {
      const len = filteredRef.current.length;
      if (!len) return;
      stopRaf();
      snapTo(clampIndex(focusIdxRef.current + delta, len), true);
    },
    [snapTo, stopRaf],
  );

  const stepByRef = useRef(stepBy);
  stepByRef.current = stepBy;

  // ── Native gesture engine (touch + pointer) — wheel mode only ───────────
  useEffect(() => {
    if (entryMode !== "wheel") return;
    const el = trackRef.current;
    if (!el) return;

    const begin = (clientY: number, mode: "pointer" | "touch") => {
      stopRaf();
      draggingRef.current = true;
      movedRef.current = false;
      inputModeRef.current = mode;
      dragStartClientY.current = clientY;
      dragStartScrollY.current = yRef.current;
      samplesRef.current = [{ y: clientY, t: performance.now() }];
    };

    const move = (clientY: number) => {
      if (!draggingRef.current) return;
      const dy = clientY - dragStartClientY.current;
      if (Math.abs(dy) > DRAG_SLOP) movedRef.current = true;

      const len = filteredRef.current.length;
      const max = maxY(len);
      const raw = dragStartScrollY.current - dy;
      applyY(applyRubber(raw, max), len);

      const now = performance.now();
      samplesRef.current.push({ y: clientY, t: now });
      while (
        samplesRef.current.length > 2 &&
        now - samplesRef.current[0]!.t > 90
      ) {
        samplesRef.current.shift();
      }
    };

    const end = (clientY: number) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      inputModeRef.current = "none";
      pointerIdRef.current = null;
      activeTouchId.current = null;

      const len = filteredRef.current.length;
      if (!len) return;

      const samples = samplesRef.current;
      let v = 0;
      if (samples.length >= 2) {
        const a = samples[0]!;
        const b = samples[samples.length - 1]!;
        const dt = b.t - a.t;
        if (dt > 4) v = -(b.y - a.y) / dt;
      }
      samplesRef.current = [];

      // Clean tap → commit the option under the finger
      if (!movedRef.current) {
        const rect = el.getBoundingClientRect();
        const rel = clientY - rect.top;
        const tappedRow = Math.max(
          0,
          Math.min(VISIBLE - 1, Math.floor(rel / ROW_H)),
        );
        const idx = clampIndex(
          focusIdxRef.current + (tappedRow - CENTER),
          len,
        );
        const item = filteredRef.current[idx];
        if (item && !item.disabled) {
          // Snap visual then commit so the pick feels locked
          focusIdxRef.current = idx;
          setFocusIdx(idx);
          yRef.current = yFromIndex(idx);
          if (contentRef.current) {
            contentRef.current.style.transform = `translate3d(0, ${PAD - yRef.current}px, 0)`;
          }
          commitRef.current(item.value);
          return;
        }
        snapTo(focusIdxRef.current, true);
        return;
      }

      startInertia(v);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (inputModeRef.current === "pointer") return;
      const t = e.touches[0]!;
      activeTouchId.current = t.identifier;
      begin(t.clientY, "touch");
    };

    const onTouchMove = (e: TouchEvent) => {
      if (inputModeRef.current !== "touch" || !draggingRef.current) return;
      const t = [...e.touches].find(
        (x) => x.identifier === activeTouchId.current,
      );
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      move(t.clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (inputModeRef.current !== "touch") return;
      const t = [...e.changedTouches].find(
        (x) => x.identifier === activeTouchId.current,
      );
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      end(t.clientY);
    };

    const onTouchCancel = () => {
      if (inputModeRef.current !== "touch") return;
      draggingRef.current = false;
      inputModeRef.current = "none";
      activeTouchId.current = null;
      snapTo(indexFromY(yRef.current, filteredRef.current.length), true);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      if (e.button !== 0) return;
      pointerIdRef.current = e.pointerId;
      begin(e.clientY, "pointer");
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* */
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (inputModeRef.current !== "pointer") return;
      if (pointerIdRef.current !== e.pointerId) return;
      e.preventDefault();
      move(e.clientY);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (inputModeRef.current !== "pointer") return;
      if (pointerIdRef.current !== e.pointerId) return;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
      end(e.clientY);
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (inputModeRef.current !== "pointer") return;
      if (pointerIdRef.current !== e.pointerId) return;
      draggingRef.current = false;
      inputModeRef.current = "none";
      pointerIdRef.current = null;
      snapTo(indexFromY(yRef.current, filteredRef.current.length), true);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      stopRaf();
      const len = filteredRef.current.length;
      if (!len) return;
      const max = maxY(len);
      const next = Math.max(0, Math.min(max, yRef.current + e.deltaY));
      applyY(next, len);
      window.clearTimeout((onWheel as unknown as { _t?: number })._t);
      (onWheel as unknown as { _t?: number })._t = window.setTimeout(() => {
        snapTo(indexFromY(yRef.current, len), true);
      }, 80);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: false });
    el.addEventListener("touchcancel", onTouchCancel, { passive: true });
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
      el.removeEventListener("wheel", onWheel);
      stopRaf();
    };
  }, [applyY, snapTo, startInertia, stopRaf, itemsSig, title, entryMode]);

  const focused = filtered[focusIdx] ?? null;
  const prevItem = focusIdx > 0 ? filtered[focusIdx - 1]! : null;
  const nextItem =
    focusIdx < filtered.length - 1 ? filtered[focusIdx + 1]! : null;

  const submitCustom = () => {
    const v = q.trim();
    if (!v) return;
    commit(v);
  };

  const openManual = () => {
    stopRaf();
    setEntryMode("manual");
    setKeyboardOn(true);
    setQ("");
  };

  const openWheel = () => {
    setEntryMode("wheel");
    setKeyboardOn(false);
    setQ("");
    // re-seed drum to current selection
    const list = filteredRef.current;
    const idx = list.findIndex((i) => i.value === selected);
    const i = idx >= 0 ? idx : focusIdxRef.current;
    focusIdxRef.current = clampIndex(i, list.length);
    setFocusIdx(focusIdxRef.current);
    yRef.current = yFromIndex(focusIdxRef.current);
    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.style.transform = `translate3d(0, ${PAD - yRef.current}px, 0)`;
      }
    });
  };

  return (
    <div
      className="flex min-h-0 flex-col"
      data-wizard-wheel
      data-picker
      data-no-pull-reset
    >
      {/* Step dots */}
      <div className="mb-1.5 flex items-center justify-center gap-1.5 px-1">
        {Array.from({ length: stepCount }).map((_, i) => {
          const label = stepLabels?.[i];
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "h-1 w-full max-w-[4.5rem] rounded-full transition-colors",
                  active ? "bg-gold" : done ? "bg-blue/70" : "bg-white/15",
                )}
              />
              {label ? (
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-wide",
                    active
                      ? "text-gold-bright"
                      : done
                        ? "text-blue"
                        : "text-white/45",
                  )}
                >
                  {label}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {!hideModeTabs ? (
      <div className="mb-3 grid grid-cols-2 rounded-full border border-white/15 bg-black/40 p-1" role="tablist" aria-label="Search entry">
        <button
          type="button"
          role="tab"
          aria-selected={entryMode === "wheel"}
          onClick={openWheel}
          className={cn(
            "inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full text-[12px] font-bold transition active:scale-[0.98]",
            entryMode === "wheel"
              ? "bg-gold-dim/45 text-gold-bright shadow-[inset_0_0_0_1px_rgba(212,168,72,0.45)]"
              : "text-white/70",
          )}
        >
          <List className="size-3.5" />
          Wheel
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={entryMode === "manual"}
          onClick={openManual}
          className={cn(
            "inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full text-[12px] font-bold transition active:scale-[0.98]",
            entryMode === "manual"
              ? "bg-gold-dim/45 text-gold-bright shadow-[inset_0_0_0_1px_rgba(212,168,72,0.45)]"
              : "text-white/70",
          )}
        >
          <Keyboard className="size-3.5" />
          Manual
        </button>
      </div>
      ) : null}

      <div className="mb-1.5 text-center sm:text-left">
        <h2 className="text-[17px] font-bold tracking-tight text-white">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-[12px] text-white/70">{subtitle}</p>
        ) : (
          <p className="mt-0.5 text-[12px] text-white/70">
            {entryMode === "wheel"
              ? "Tap an option to lock it in"
              : "Type a value or tap a row"}
          </p>
        )}
      </div>

      {/* ── Manual list + text entry (classic) ─────────────────────────── */}
      {entryMode === "manual" ? (
        <div className="space-y-2" data-no-pull-reset>
          <div className="glass-field flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5">
            {allowCustom && keyboardOn ? (
              <Keyboard className="size-4 shrink-0 text-blue" />
            ) : (
              <Search className="size-4 shrink-0 text-white/70" />
            )}
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setKeyboardOn(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (canUseCustom) submitCustom();
                  else if (filtered[0]) commit(filtered[0].value);
                }
              }}
              inputMode="search"
              enterKeyHint={canUseCustom ? "done" : "search"}
              placeholder={
                allowCustom ? customPlaceholder : "Filter or search…"
              }
              className="w-full min-w-0 bg-transparent text-[14px] text-white outline-none placeholder:text-white/50"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="flex size-8 shrink-0 items-center justify-center text-white/70"
                aria-label="Clear"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          {canUseCustom ? (
            <button
              type="button"
              onClick={submitCustom}
              className="flex min-h-[48px] w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-blue/50 bg-blue/20 px-3 py-2.5 text-left active:scale-[0.99]"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue text-white">
                <Plus className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-white">{customLabel}</p>
                <p className="truncate text-[12px] text-white/85">
                  “{q.trim()}”
                </p>
              </div>
            </button>
          ) : null}

          <div
            className="rv-scroll max-h-[min(42dvh,320px)] min-h-[180px] overflow-y-auto overscroll-contain rounded-[1.1rem] border border-white/15 bg-black/35 p-1.5"
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
            role="listbox"
            aria-label={title}
          >
            {filtered.length === 0 ? (
              <div className="px-3 py-10 text-center">
                <p className="text-sm text-white/90">{emptyHint}</p>
                {allowCustom ? (
                  <p className="mt-2 text-[12px] text-white/65">
                    Type above to enter a custom value.
                  </p>
                ) : null}
              </div>
            ) : (
              filtered.map((item) => {
                const active = selected === item.value;
                return (
                  <button
                    key={item.value || "__empty__"}
                    type="button"
                    role="option"
                    aria-selected={active}
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.disabled) return;
                      commit(item.value);
                    }}
                    className={cn(
                      "mb-1 flex min-h-[48px] w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition active:scale-[0.99] touch-manipulation",
                      active
                        ? "border border-gold-border bg-gold-dim/40"
                        : "border border-transparent bg-white/[0.03] hover:bg-white/[0.07]",
                      item.disabled && "opacity-40",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-[15px] font-semibold tabular-nums leading-tight",
                          active ? "text-gold-bright" : "text-white",
                        )}
                      >
                        {item.label}
                      </p>
                      {item.meta ? (
                        <p className="mt-0.5 truncate text-[11px] text-white/65">
                          {item.meta}
                        </p>
                      ) : null}
                    </div>
                    {active ? (
                      <Check className="size-4 shrink-0 text-gold" />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>

          <p className="text-center text-[10px] font-semibold tracking-wide text-white/45">
            {filtered.length} option{filtered.length === 1 ? "" : "s"} · tap a
            row
            {allowCustom ? " · or type your own" : ""}
          </p>
        </div>
      ) : (
        /* ── Wheel drum ───────────────────────────────────────────────── */
        <>
          {filtered.length === 0 ? (
            <div className="rounded-[1.1rem] border border-white/12 bg-black/35 px-3 py-8 text-center">
              <p className="text-sm text-white/90">{emptyHint}</p>
              <button
                type="button"
                onClick={openManual}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-blue/40 bg-blue/20 px-4 py-2 text-[12px] font-bold text-white active:scale-[0.98]"
              >
                <Keyboard className="size-3.5" />
                Type a value instead
              </button>
            </div>
          ) : (
            <div className="flex items-stretch gap-2" data-no-pull-reset>
              <div className="flex shrink-0 flex-col justify-center gap-1">
                <button
                  type="button"
                  aria-label="Previous option"
                  disabled={!prevItem}
                  onClick={() => stepBy(-1)}
                  className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white disabled:opacity-25 active:scale-95"
                >
                  <ChevronUp className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next option"
                  disabled={!nextItem}
                  onClick={() => stepBy(1)}
                  className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-white/8 text-white disabled:opacity-25 active:scale-95"
                >
                  <ChevronDown className="size-5" />
                </button>
              </div>

              <div
                ref={trackRef}
                className="relative min-w-0 flex-1 select-none overflow-hidden rounded-[1.15rem] border border-white/18 bg-black/45"
                style={{
                  height: DRUM_H,
                  touchAction: "none",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                }}
                role="listbox"
                aria-label={title}
                aria-activedescendant={
                  focused ? `wheel-opt-${focusIdx}` : undefined
                }
                data-no-pull-reset
                data-wheel-track
              >
                <div
                  className="pointer-events-none absolute inset-x-2 top-1/2 z-[2] -translate-y-1/2 rounded-xl border border-gold-border/55 bg-gold-dim/25 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]"
                  style={{ height: ROW_H }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 z-[3] bg-gradient-to-b from-black/80 via-black/35 to-transparent"
                  style={{ height: ROW_H }}
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] bg-gradient-to-t from-black/80 via-black/35 to-transparent"
                  style={{ height: ROW_H }}
                  aria-hidden
                />

                <div
                  ref={contentRef}
                  className="relative z-[1] will-change-transform"
                  style={{
                    transform: `translate3d(0, ${PAD - yRef.current}px, 0)`,
                  }}
                >
                  {filtered.map((item, i) => {
                    const dist = Math.abs(focusIdx - i);
                    const active = i === focusIdx;
                    const opacity =
                      dist === 0
                        ? 1
                        : dist === 1
                          ? 0.78
                          : dist === 2
                            ? 0.52
                            : dist === 3
                              ? 0.34
                              : 0.14;
                    const scale =
                      active ? 1 : dist === 1 ? 0.97 : dist === 2 ? 0.93 : 0.9;
                    return (
                      <div
                        key={`${item.value}__${i}`}
                        id={active ? `wheel-opt-${i}` : undefined}
                        role="option"
                        aria-selected={active}
                        data-wheel-value={item.value}
                        className="flex flex-col items-center justify-center px-3 text-center"
                        style={{
                          height: ROW_H,
                          opacity,
                          transform: `scale(${scale})`,
                        }}
                      >
                        <span
                          className={cn(
                            "flex max-w-full items-center gap-1.5",
                            active
                              ? "text-[18px] font-bold text-gold-bright"
                              : "text-[15px] font-medium text-white/80",
                          )}
                        >
                          <span className="truncate tabular-nums leading-none">
                            {item.label}
                          </span>
                          {active && selected === item.value ? (
                            <Check className="size-3.5 shrink-0 text-gold" />
                          ) : null}
                        </span>
                        {active && item.meta ? (
                          <span className="mt-0.5 max-w-full truncate text-[10px] font-medium text-white/55">
                            {item.meta}
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <p className="mt-2 text-center text-[10px] font-semibold tracking-wide text-white/45">
            {filtered.length > 0
              ? `${focusIdx + 1} of ${filtered.length} · tap to choose · swipe to spin`
              : "No options"}
          </p>
        </>
      )}
    </div>
  );
}
