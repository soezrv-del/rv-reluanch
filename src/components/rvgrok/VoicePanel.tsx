import { useRef } from "react";
import {
  Check,
  Mic,
  Radio,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import type { GrokVoice } from "@/lib/rvgrok/voice";
import { GROK_VOICES, SPEED_OPTIONS } from "@/lib/rvgrok/voice";
import { cn } from "@/lib/utils";
import { useKeyboardInset } from "@/lib/hooks/useKeyboardInset";

export function VoicePanel({
  open,
  onClose,
  selectedId,
  onSelect,
  voiceMode,
  onVoiceModeChange,
  liveVoice,
  onLiveVoiceChange,
  playbackSpeed,
  onSpeedChange,
  onPreview,
  previewingId,
}: {
  open: boolean;
  onClose: () => void;
  selectedId: string;
  onSelect: (id: string) => void;
  voiceMode: boolean;
  onVoiceModeChange: (v: boolean) => void;
  liveVoice: boolean;
  onLiveVoiceChange: (v: boolean) => void;
  playbackSpeed: number;
  onSpeedChange: (s: number) => void;
  onPreview: (voice: GrokVoice) => void;
  previewingId: string | null;
}) {
  const kb = useKeyboardInset();
  const backdropTap = useRef<{ x: number; y: number } | null>(null);
  const sheetGesture = useRef(false);
  if (!open) return null;

  const sheetCap = kb.open
    ? `min(88dvh, calc(var(--vv-height, 100dvh) - ${kb.inset + 32}px))`
    : "min(88dvh, var(--vv-height, 88dvh))";

  return (
    <div
      data-voice-panel=""
      className="fixed inset-x-0 top-0 z-50 box-border flex items-end justify-center overflow-hidden overscroll-none sm:items-center"
      style={{
        top: kb.open ? kb.vvOffsetTop || 0 : 0,
        bottom: kb.open ? "auto" : 0,
        height: kb.open
          ? kb.vvHeight > 0
            ? `${kb.vvHeight}px`
            : "100dvh"
          : "auto",
        overscrollBehavior: "none",
        paddingTop: "var(--safe-top, 0px)",
        paddingLeft: "max(0.75rem, var(--safe-left, 0px))",
        paddingRight: "max(0.75rem, var(--safe-right, 0px))",
        paddingBottom: kb.open
          ? `max(var(--safe-bottom, 0px), ${kb.inset + 12}px)`
          : "max(0.75rem, var(--safe-bottom, env(safe-area-inset-bottom)))",
      }}
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        data-voice-backdrop=""
        aria-label="Dismiss voice settings"
        onPointerDown={(e) => {
          if (e.target !== e.currentTarget) return;
          backdropTap.current = { x: e.clientX, y: e.clientY };
        }}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          if (sheetGesture.current) return;
          const start = backdropTap.current;
          backdropTap.current = null;
          if (!start) return;
          if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) return;
          onClose();
        }}
      />
      <div
        className="relative z-10 flex w-full max-w-md min-h-0 flex-col overflow-hidden rounded-t-[var(--radius-2xl)] border border-border-strong bg-bg-elevated shadow-[var(--shadow-panel)] sm:rounded-[var(--radius-2xl)]"
        data-voice-sheet=""
        style={{
          height: `min(${sheetCap}, 100%)`,
          maxHeight: `min(${sheetCap}, 100%)`,
        }}
        onPointerDown={() => {
          sheetGesture.current = true;
        }}
        onPointerUp={() => {
          window.setTimeout(() => {
            sheetGesture.current = false;
          }, 400);
        }}
        onPointerCancel={() => {
          window.setTimeout(() => {
            sheetGesture.current = false;
          }, 400);
        }}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15 sm:hidden" data-voice-handle="" />

        <div className="flex items-center gap-2 border-b border-border px-4 py-3" data-voice-header="">
          <Volume2 className="size-4 text-ruby" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold" data-voice-title="">RvGrok Voice</h2>
            <p className="text-[11px] text-white" data-voice-sub="">
              Continuous auto listen + auto play
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-white transition hover:bg-white/5 hover:text-white"
            data-voice-close=""
            aria-label="Close voice settings"
          >
            <X className="size-4" />
          </button>
        </div>

        <div
          data-voice-scroll=""
          className="rv-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            touchAction: "pan-y",
          }}
        >
          <button
            type="button"
            onClick={() => onLiveVoiceChange(!liveVoice)}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition",
              liveVoice
                ? "border-ruby-border bg-ruby-soft"
                : "border-border bg-surface/60",
            )}
            data-voice-card=""
            data-selected={liveVoice ? "" : undefined}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                liveVoice ? "bg-ruby text-white" : "bg-black/40 text-white",
              )}
              data-voice-mark=""
            >
              <Radio className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  liveVoice ? "text-ruby" : "text-white",
                )}
              >
                Live Grok Voice
              </p>
              <p className="text-[11px] text-white" data-voice-muted="">
                Mic starts a live talk-and-listen call. First tap may ask for Microphone.
              </p>

            </div>
            <Toggle on={liveVoice} />
          </button>

          <button
            type="button"
            onClick={() => onVoiceModeChange(!voiceMode)}
            className={cn(
              "flex w-full items-center gap-3 rounded-[var(--radius-lg)] border px-3 py-3 text-left transition",
              voiceMode
                ? "border-ruby-border bg-ruby-soft"
                : "border-border bg-surface/60",
            )}
            data-voice-card=""
            data-selected={voiceMode ? "" : undefined}
          >
            <span
              className={cn(
                "flex size-9 items-center justify-center rounded-full",
                voiceMode ? "bg-ruby text-white" : "bg-black/40 text-white",
              )}
              data-voice-mark=""
            >
              <Mic className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  voiceMode ? "text-ruby" : "text-white",
                )}
              >
                Voice Mode
              </p>
              <p className="text-[11px] text-white" data-voice-muted="">
                Auto-record → chat → auto-play → re-open mic
              </p>
            </div>
            <Toggle on={voiceMode} />
          </button>

          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-white" data-voice-label="">
              PLAYBACK SPEED
            </p>
            <div className="flex gap-2">
              {SPEED_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onSpeedChange(opt.value)}
                  className={cn(
                    "flex-1 rounded-full border py-2 text-[12px] font-semibold transition",
                    playbackSpeed === opt.value
                      ? "border-ruby-border bg-ruby-mid text-ruby"
                      : "border-border bg-surface/50 text-white hover:text-white",
                  )}
                  data-voice-chip=""
                  data-selected={playbackSpeed === opt.value ? "" : undefined}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.14em] text-white" data-voice-label="">
              GROK VOICE
            </p>
            <div className="space-y-1.5">
              {GROK_VOICES.map((v) => {
                const selected = selectedId === v.id;
                const previewing = previewingId === v.id;
                return (
                  <div
                    key={v.id}
                    className={cn(
                      "flex items-center gap-2 rounded-[var(--radius-md)] border px-2.5 py-2.5 transition",
                      selected
                        ? "border-ruby-border bg-ruby-soft/60"
                        : "border-transparent bg-surface/50 hover:border-border",
                    )}
                    data-voice-row=""
                    data-selected={selected ? "" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(v.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase",
                          selected
                            ? "bg-ruby text-white"
                            : "bg-black/40 text-ruby",
                        )}
                        data-voice-mark=""
                      >
                        {v.name.slice(0, 1)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              selected && "text-ruby",
                            )}
                          >
                            {v.name}
                          </span>
                          <span className="rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white" data-voice-gender="">
                            {v.gender}
                          </span>
                          {selected && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-ruby px-1.5 py-0.5 text-[9px] font-bold text-white" data-voice-active="">
                              <Check className="size-2.5" />
                              Active
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-white" data-voice-muted="">
                          {v.description}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onPreview(v)}
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full border transition",
                        previewing
                          ? "border-ruby bg-ruby text-white"
                          : "border-ruby-border text-ruby hover:bg-ruby-soft",
                      )}
                      data-voice-play=""
                      data-on={previewing ? "" : undefined}
                      aria-label={`Preview ${v.name}`}
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-border bg-black/30 px-3 py-2.5" data-voice-note="">
            <Sparkles className="mt-0.5 size-3.5 shrink-0 text-ruby" />
            <p className="text-[11px] leading-relaxed text-white" data-voice-muted="">
              <strong className="text-white">Live Grok Voice</strong> starts when
              you tap the mic (Grok hears + speaks hands-free).{" "}
              <strong className="text-white">Voice Mode</strong> is the text
              loop: record → chat → speak reply → record again. Use Settings to
              toggle Voice Mode; the mic always prefers Live Voice.

            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition",
        on ? "bg-ruby" : "bg-white/15",
      )}
      data-voice-toggle=""
      data-on={on ? "" : undefined}
    >
      <span
        className={cn(
          "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
          on ? "left-[22px]" : "left-0.5",
        )}
      />
    </span>
  );
}
