import { Check, Keyboard, Plus, Search, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import {
  scrollFieldIntoVisibleArea,
  useKeyboardInset,
} from "@/lib/hooks/useKeyboardInset";

export type SelectSheetItem =
  | string
  | {
      value: string;
      label?: string;
      meta?: string;
      disabled?: boolean;
    };

function normalize(items: SelectSheetItem[]) {
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

/**
 * Floating mobile picker.
 * - Drag handle (top) to dismiss
 * - List scrolls freely — item taps always select (no drag-to-dismiss race)
 * - Keyboard OFF by default; tap Type for search / custom entry
 */
export function SelectSheet({
  open,
  title,
  subtitle,
  items,
  selected,
  onSelect,
  onClose,
  emptyHint = "No options for this selection",
  allowCustom = false,
  customLabel = "Use custom entry",
  customPlaceholder = "Type make, model, or floorplan…",
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  items: SelectSheetItem[];
  selected: string;
  onSelect: (v: string) => void;
  onClose: () => void;
  emptyHint?: string;
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
}) {
  const [q, setQ] = useState("");
  const [keyboardOn, setKeyboardOn] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const dragYRef = useRef(0);
  const selectedGuard = useRef(false);
  const itemTouchRef = useRef<{ id: number; y: number; x: number } | null>(
    null,
  );
  const kb = useKeyboardInset();

  const dragRef = useRef<{
    active: boolean;
    startY: number;
    origin: number;
    lastY: number;
    lastT: number;
    velocity: number;
  }>({
    active: false,
    startY: 0,
    origin: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
  });

  const setDragYBoth = useCallback((y: number | ((prev: number) => number)) => {
    setDragY((prev) => {
      const next = typeof y === "function" ? y(prev) : y;
      dragYRef.current = next;
      return next;
    });
  }, []);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    inputRef.current?.blur();
    const y = Math.max(dragYRef.current, 280);
    dragYRef.current = y;
    setDragY(y);
    window.setTimeout(() => {
      setExiting(false);
      dragYRef.current = 0;
      setDragY(0);
      selectedGuard.current = false;
      onClose();
    }, 200);
  }, [exiting, onClose]);

  const pick = useCallback(
    (value: string) => {
      if (selectedGuard.current || exiting) return;
      selectedGuard.current = true;
      void hapticLight();
      // Apply value first so parent state updates even if sheet unmounts mid-animation
      onSelect(value);
      dismiss();
    },
    [dismiss, exiting, onSelect],
  );

  useEffect(() => {
    if (!open) return;
    setQ("");
    setKeyboardOn(false);
    dragYRef.current = 0;
    setDragY(0);
    setDragging(false);
    setExiting(false);
    selectedGuard.current = false;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  useEffect(() => {
    if (!open || !selected) return;
    const t = window.setTimeout(() => {
      try {
        const el = listRef.current?.querySelector(
          `[data-value="${CSS.escape(selected)}"]`,
        ) as HTMLElement | null;
        el?.scrollIntoView({ block: "center" });
      } catch {
        /* */
      }
    }, 80);
    return () => window.clearTimeout(t);
  }, [open, selected, title]);

  useEffect(() => {
    if (!open || !keyboardOn) return;
    const t = window.setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
      const el = inputRef.current;
      if (!el) return;
      for (const delay of [60, 200, 360, 520]) {
        window.setTimeout(() => scrollFieldIntoVisibleArea(el, kb.inset), delay);
      }
    }, 50);
    return () => window.clearTimeout(t);
  }, [open, keyboardOn, kb.inset]);

  /** Drag only from the handle / header — never from the scroll list */
  const beginHandleDrag = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (exiting || keyboardOn) return;
      const t = e.target as HTMLElement;
      if (t.closest("button, input, a")) return;
      dragRef.current = {
        active: true,
        startY: e.clientY,
        origin: dragY,
        lastY: e.clientY,
        lastT: performance.now(),
        velocity: 0,
      };
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* */
      }
    },
    [dragY, exiting, keyboardOn],
  );

  const moveHandleDrag = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = dragRef.current;
      if (!d.active || exiting) return;
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);
      d.velocity = ((e.clientY - d.lastY) / dt) * 1000;
      d.lastY = e.clientY;
      d.lastT = now;
      let next = d.origin + (e.clientY - d.startY);
      // Only drag down to dismiss (positive y); slight rubber-band up
      if (next < 0) next = next * 0.25;
      next = Math.min(420, Math.max(-40, next));
      setDragYBoth(next);
    },
    [exiting, setDragYBoth],
  );

  const endHandleDrag = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = dragRef.current;
      if (!d.active) return;
      d.active = false;
      setDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }
      const y = dragYRef.current;
      const flickDismiss = d.velocity > 900 && y > 24;
      const distanceDismiss = y > 90;
      if (flickDismiss || distanceDismiss) {
        dismiss();
        return;
      }
      setDragYBoth(0);
    },
    [dismiss, setDragYBoth],
  );

  const normalized = useMemo(() => normalize(items), [items]);

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

  const exactMatch = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return false;
    return normalized.some(
      (i) =>
        i.value.toLowerCase() === needle || i.label.toLowerCase() === needle,
    );
  }, [normalized, q]);

  const canUseCustom = allowCustom && q.trim().length > 0 && !exactMatch;

  const submitCustom = () => {
    const v = q.trim();
    if (!v) return;
    pick(v);
  };

  if (!open) return null;

  const showSearch = allowCustom || normalized.length > 6;
  const enableKeyboard = () => setKeyboardOn(true);
  const disableKeyboard = () => {
    setKeyboardOn(false);
    inputRef.current?.blur();
  };

  const dismissProgress = Math.min(1, Math.max(0, dragY / 160));
  const backdropOpacity = 0.55 * (1 - dismissProgress * 0.65);
  const kbPad =
    kb.open || keyboardOn ? Math.max(kb.inset, keyboardOn ? 12 : 0) : 0;

  return (
    <div
      className="select-sheet-root fixed inset-x-0 top-0 z-[80] flex items-end justify-center px-3 sm:items-center sm:px-4"
      style={{
        height: kb.vvHeight > 0 ? `${kb.vvHeight}px` : "100dvh",
        top: kb.vvOffsetTop > 0 ? kb.vvOffsetTop : 0,
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingBottom:
          kbPad > 0
            ? `max(0.75rem, ${kbPad + 12}px)`
            : "calc(5.75rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black backdrop-blur-[3px] transition-opacity"
        style={{ opacity: backdropOpacity }}
        aria-label="Dismiss"
        onClick={dismiss}
      />

      <div
        className="select-sheet-panel sheet-rise glass-prestige-deep relative z-10 flex w-full max-w-md flex-col overflow-hidden rounded-[1.35rem] border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.55)] sm:rounded-[1.5rem]"
        style={{
          maxHeight:
            kbPad > 0
              ? `min(72dvh, calc(var(--vv-height, 100dvh) - ${kbPad + 48}px))`
              : "min(70dvh, calc(100dvh - 8rem - env(safe-area-inset-top) - env(safe-area-inset-bottom)))",
          minHeight: kbPad > 0 ? "min(40dvh, 320px)" : "min(48dvh, 420px)",
          transform: `translate3d(0, ${dragY}px, 0)`,
          opacity: exiting ? Math.max(0.15, 1 - dismissProgress) : 1,
          transition:
            dragging || exiting
              ? exiting
                ? "transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.18s ease"
                : "none"
              : "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease, max-height 0.2s ease",
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div
          className="select-sheet-handle shrink-0 touch-none select-none"
          onPointerDown={beginHandleDrag}
          onPointerMove={moveHandleDrag}
          onPointerUp={endHandleDrag}
          onPointerCancel={endHandleDrag}
        >
          <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-white/40" />
          <p className="px-4 pb-1.5 pt-1.5 text-center text-[10px] font-semibold tracking-wide text-white/80">
            Drag handle down to close · scroll list to pick
          </p>
        </div>

        <div
          className="flex shrink-0 items-center gap-2 border-b border-white/10 px-4 pb-3"
          onPointerDown={beginHandleDrag}
          onPointerMove={moveHandleDrag}
          onPointerUp={endHandleDrag}
          onPointerCancel={endHandleDrag}
        >
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white">{title}</h2>
            {subtitle ? (
              <p className="truncate text-[11px] text-white/80">{subtitle}</p>
            ) : (
              <p className="text-[11px] text-white/80">
                {normalized.length} option
                {normalized.length === 1 ? "" : "s"}
                {allowCustom ? " · or type your own" : ""}
              </p>
            )}
          </div>
          {showSearch ? (
            <button
              type="button"
              onClick={() =>
                keyboardOn ? disableKeyboard() : enableKeyboard()
              }
              className={cn(
                "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold transition",
                keyboardOn
                  ? "border-ruby-border bg-ruby-soft text-ruby"
                  : "border-white/25 bg-white/10 text-white",
              )}
              aria-label={keyboardOn ? "Hide keyboard" : "Show keyboard"}
              aria-pressed={keyboardOn}
            >
              <Keyboard className="size-3.5" />
              {keyboardOn ? "Hide" : "Type"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {showSearch ? (
          <div className="shrink-0 border-b border-white/10 px-3 py-2">
            <div
              className="glass-field flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2.5"
              onClick={() => {
                if (!keyboardOn) enableKeyboard();
              }}
            >
              {allowCustom ? (
                <Keyboard className="size-4 shrink-0 text-blue" />
              ) : (
                <Search className="size-4 shrink-0 text-white" />
              )}
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canUseCustom) {
                    e.preventDefault();
                    submitCustom();
                  }
                }}
                autoFocus={false}
                readOnly={!keyboardOn}
                inputMode={keyboardOn ? "text" : "none"}
                enterKeyHint={canUseCustom ? "done" : "search"}
                placeholder={
                  keyboardOn
                    ? allowCustom
                      ? customPlaceholder
                      : "Search…"
                    : allowCustom
                      ? "Tap Type to search or enter custom…"
                      : "Tap Type to search…"
                }
                className="w-full bg-transparent text-[14px] text-white outline-none placeholder:text-white/60"
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="text-white"
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
                className="mt-2 flex w-full items-center gap-2.5 rounded-[var(--radius-md)] border border-blue/50 bg-blue/20 px-3 py-3 text-left"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue text-white">
                  <Plus className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-white">
                    {customLabel}
                  </p>
                  <p className="truncate text-[12px] text-white">
                    “{q.trim()}”
                  </p>
                </div>
              </button>
            ) : null}
          </div>
        ) : null}

        <div
          ref={listRef}
          className="rv-scroll select-sheet-list min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
          style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-white">{emptyHint}</p>
              {allowCustom ? (
                <p className="mt-2 text-[12px] text-white">
                  Tap Type above to add a custom entry.
                </p>
              ) : null}
            </div>
          ) : (
            filtered.map((item) => {
              const active = selected === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  data-value={item.value}
                  disabled={item.disabled}
                  onPointerDown={(e) => {
                    if (item.disabled) return;
                    itemTouchRef.current = {
                      id: e.pointerId,
                      x: e.clientX,
                      y: e.clientY,
                    };
                  }}
                  onPointerUp={(e) => {
                    if (item.disabled) return;
                    const start = itemTouchRef.current;
                    itemTouchRef.current = null;
                    if (!start || start.id !== e.pointerId) return;
                    const moved =
                      Math.abs(e.clientX - start.x) > 12 ||
                      Math.abs(e.clientY - start.y) > 12;
                    if (moved) return; // was scrolling
                    // Touch/pen: select here. Mouse uses onClick.
                    if (e.pointerType === "touch" || e.pointerType === "pen") {
                      e.preventDefault();
                      pick(item.value);
                    }
                  }}
                  onPointerCancel={() => {
                    itemTouchRef.current = null;
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (item.disabled) return;
                    pick(item.value);
                  }}
                  className={cn(
                    "mb-1 flex min-h-[52px] w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition active:scale-[0.99]",
                    active
                      ? "border border-gold-border bg-gold-dim"
                      : "border border-transparent bg-white/[0.03] hover:bg-white/8",
                    item.disabled && "opacity-40",
                  )}
                >

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-white">
                      {item.label}
                    </p>
                    {item.meta ? (
                      <p className="truncate text-[11px] text-white/75">
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
          <div
            className="shrink-0"
            style={{ height: kbPad > 0 ? 28 : 20 }}
            aria-hidden
          />
        </div>
      </div>
    </div>
  );
}
