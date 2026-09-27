import { useEffect, useRef, useState } from "react";
import {
  Calculator,
  FileText,
  LayoutGrid,
  MessageCircle,
  Mic,
  Radio,
  Truck,
} from "lucide-react";
import type { AppTab } from "./BottomTabs";
import {
  nextPillScroll,
  PILL_LOOP_PX_PER_SEC,
  PILL_LOOP_RESUME_MS,
  roomAskMic,
  roomAskSend,
  shouldLoopPills,
  subscribeRoomVoice,
  type RoomVoicePhase,
} from "@/lib/rvgrok/roomAsk";
import { markAskBarGrokEntry } from "@/lib/rvgrok/screenContext";

/** Floating pill tabs. RV GPS stays in Premium. */
const ROOM_CHIPS: {
  id: AppTab;
  label: string;
  icon: typeof FileText;
}[] = [
  { id: "rvfax", label: "Rv Facts", icon: FileText },
  { id: "rvlot", label: "Lot Inventory", icon: LayoutGrid },
  { id: "rvcal", label: "Calculator", icon: Calculator },
  { id: "rvgrok", label: "RV Grok", icon: MessageCircle },
  { id: "rvtow", label: "Tow Guide", icon: Truck },
];

/**
 * Shared ask bar. Mic starts Live Voice on the current screen.
 * A typed ask is appended to the open RV Grok thread.
 */
export function RoomAskBar({
  tab,
  homeOpen = false,
  onOpen,
}: {
  tab: AppTab;
  homeOpen?: boolean;
  onOpen: (tab: AppTab) => void;
}) {
  const [draft, setDraft] = useState("");
  const [voice, setVoice] = useState<RoomVoicePhase>("idle");
  const hidePinnedAsk = !homeOpen && tab === "rvgrok";
  const live = voice !== "idle";
  const scrollerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const dupRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const heldRef = useRef(false);
  const resumeTimer = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const loop = shouldLoopPills({ reducedMotion, overflows });

  useEffect(() => subscribeRoomVoice(setVoice), []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const set = setRef.current;
    if (!scroller || !set) return;
    const measure = () => {
      const styles = getComputedStyle(scroller);
      const pad =
        (Number.parseFloat(styles.paddingLeft) || 0) +
        (Number.parseFloat(styles.paddingRight) || 0);
      const next = set.offsetWidth > scroller.clientWidth - pad + 1;
      setOverflows(next);
      if (!shouldLoopPills({ reducedMotion, overflows: next })) {
        scroller.scrollLeft = 0;
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    observer.observe(set);
    return () => observer.disconnect();
  }, [reducedMotion, loop]);

  useEffect(() => {
    if (!loop) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let raf = 0;
    let last = 0;
    // Keep the position here. Reading scrollLeft back each frame rounds
    // subpixel steps up to 1px and runs the row too fast.
    let pos = scroller.scrollLeft;
    let wasPaused = pausedRef.current;
    const frame = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const set = setRef.current;
      const dup = dupRef.current;
      if (pausedRef.current) {
        wasPaused = true;
      } else if (set && dup) {
        if (wasPaused) {
          pos = scroller.scrollLeft;
          wasPaused = false;
        }
        const distance = dup.offsetLeft - set.offsetLeft;
        pos = nextPillScroll(pos, distance, PILL_LOOP_PX_PER_SEC * dt);
        scroller.scrollLeft = pos;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [loop]);

  useEffect(() => {
    const release = () => {
      if (!heldRef.current) return;
      heldRef.current = false;
      window.clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => {
        pausedRef.current = false;
      }, PILL_LOOP_RESUME_MS);
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
      window.clearTimeout(resumeTimer.current);
    };
  }, []);

  const holdRow = () => {
    heldRef.current = true;
    pausedRef.current = true;
    window.clearTimeout(resumeTimer.current);
  };

  const pauseThenResume = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      if (!heldRef.current) pausedRef.current = false;
    }, PILL_LOOP_RESUME_MS);
  };

  const send = () => {
    const q = draft.trim();
    if (!q) return;
    setDraft("");
    roomAskSend(q);
    markAskBarGrokEntry();
    onOpen("rvgrok");
  };

  const openRoom = (id: AppTab) => {
    if (id === "rvfax") onOpen("rvfax");
    else if (id === "rvcal") onOpen("rvcal");
    else if (id === "rvtow") onOpen("rvtow");
    else if (id === "rvlot") onOpen("rvlot");
    else if (id === "rvgrok") onOpen("rvgrok");
  };

  return (
    <div data-room-ask data-no-swipe className="showroom-dock">
      {hidePinnedAsk ? null : (
        <form
          data-room-ask-bar
          className="showroom-ask-row"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <div className="showroom-ask showroom-float">
            <input
              data-room-ask-input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's up?"
              aria-label="What's up?"
              enterKeyHint="send"
            />
            {live ? (
              <span data-room-voice={voice} className="showroom-live">
                {voice === "speaking" ? "Speaking" : "Listening"}
              </span>
            ) : null}
            <button
              type="button"
              data-room-ask-mic
              className={
                "showroom-mic" +
                (live ? " is-live" : "") +
                (voice === "speaking" ? " is-armed" : "")
              }
              aria-pressed={live}
              aria-label={
                voice === "speaking"
                  ? "Speaking, tap to stop"
                  : live
                    ? "Listening, tap to stop"
                    : "Start live voice"
              }
              title={live ? "Stop Live Voice" : "Start Live Voice"}
              onClick={() => {
                roomAskMic();
              }}
            >
              {live ? (
                <Radio className="size-5" aria-hidden />
              ) : (
                <Mic className="size-5" aria-hidden />
              )}
            </button>
          </div>
        </form>
      )}
      <div
        ref={scrollerRef}
        data-room-tabs
        data-pill-loop={loop ? "on" : "off"}
        className="showroom-rail showroom-pills"
        onPointerDown={holdRow}
        onWheel={pauseThenResume}
      >
        <div ref={setRef} className="showroom-pill-set" data-room-chip-set="primary">
            {ROOM_CHIPS.map((chip) => (
              <RoomChip
                key={chip.id}
                chip={chip}
                active={!homeOpen && tab === chip.id}
                onOpen={() => openRoom(chip.id)}
              />
            ))}
        </div>
        {loop ? (
          <div
            ref={dupRef}
            className="showroom-pill-set"
            data-room-chip-set="duplicate"
            aria-hidden="true"
          >
            {ROOM_CHIPS.map((chip) => (
              <RoomChip
                key={chip.id}
                chip={chip}
                active={!homeOpen && tab === chip.id}
                onOpen={() => openRoom(chip.id)}
                mirror
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RoomChip({
  chip,
  active,
  onOpen,
  mirror = false,
}: {
  chip: (typeof ROOM_CHIPS)[number];
  active: boolean;
  onOpen: () => void;
  mirror?: boolean;
}) {
  const Icon = chip.icon;
  return (
    <button
      type="button"
      data-room-chip={chip.id}
      data-room-tab={chip.id}
      tabIndex={mirror ? -1 : undefined}
      aria-pressed={active}
      aria-current={active ? "page" : undefined}
      onClick={onOpen}
      className="showroom-tab showroom-float min-h-11"
    >
      <Icon
        className="showroom-tab-icon"
        aria-hidden
        strokeWidth={1.6}
        fill="currentColor"
      />
      {chip.label}
    </button>
  );
}
