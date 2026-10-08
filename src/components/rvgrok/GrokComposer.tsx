import type { FocusEvent, KeyboardEvent, RefObject } from "react";
import { Camera, Loader2, Mic, Send, Video, X } from "lucide-react";
import { scrollFieldIntoVisibleArea } from "@/lib/hooks/useKeyboardInset";
import {
  voiceStatusPillLabel,
  type VoiceBarView,
} from "@/lib/rvgrok/voiceStatusBar";
import { cn } from "@/lib/utils";

function keepComposerFieldVisible(e: FocusEvent<HTMLTextAreaElement>) {
  const el = e.currentTarget;
  const kb =
    Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--kb-inset",
      ) || "0",
    ) || 0;
  scrollFieldIntoVisibleArea(el, kb);
  window.setTimeout(() => {
    if (document.activeElement === el) scrollFieldIntoVisibleArea(el, kb);
  }, 280);
}

export function GrokComposer({
  displayInput,
  onChange,
  onKeyDown,
  onSend,
  onMic,
  canSend,
  isLoading,
  isRecording,
  liveActive,
  waitingToResumeLive,
  pendingImage,
  onClearImage,
  placeholder,
  density = "thread",
  cameraInputRef,
  libraryInputRef,
  onPickImage,
  imageBusy,
  liveCam,
  onToggleLiveCam,
  voice,
  onInterrupt,
  onStop,
}: {
  displayInput: string;
  onChange: (value: string) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onMic: () => void;
  canSend: boolean;
  isLoading: boolean;
  isRecording: boolean;
  liveActive: boolean;
  waitingToResumeLive: boolean;
  pendingImage: string | null;
  onClearImage: () => void;
  placeholder: string;
  density?: "landing" | "thread";
  cameraInputRef?: RefObject<HTMLInputElement | null>;
  libraryInputRef?: RefObject<HTMLInputElement | null>;
  onPickImage?: (file: File | null) => void;
  imageBusy?: boolean;
  liveCam?: boolean;
  onToggleLiveCam?: () => void;
  /** Same view the old status bar used. Null keeps the idle mic. */
  voice?: VoiceBarView | null;
  onInterrupt?: () => void;
  /** Full stop. Same handler as the old bar's End / Stop / Cancel. */
  onStop?: () => void;
}) {
  const landing = density === "landing";

  return (
    <div data-rvgrok-composer="" data-density={density} className="w-full">
      {pendingImage && !landing ? (
        <div className="grok-frost mb-2 flex items-center gap-2 rounded-[var(--radius-lg)] px-2 py-2">
          <img
            src={pendingImage}
            alt="Ready to send"
            className="size-14 shrink-0 rounded-md object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-fg">Photo ready</p>
            <p className="text-[11px] text-muted">
              Add a question or send to analyze
            </p>
          </div>
          <button
            type="button"
            onClick={onClearImage}
            className="flex size-10 items-center justify-center rounded-full border border-border text-fg"
            aria-label="Remove photo"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-2 sm:gap-2.5">
        <div className="grok-composer-pill relative flex min-h-12 min-w-0 flex-1 items-end gap-1 rounded-full px-1.5 py-1">
          {!landing && cameraInputRef && libraryInputRef && onPickImage ? (
            <>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="pointer-events-none absolute size-px overflow-hidden opacity-0"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  onPickImage(f);
                }}
              />
              <input
                ref={libraryInputRef}
                type="file"
                accept="image/*"
                className="pointer-events-none absolute size-px overflow-hidden opacity-0"
                tabIndex={-1}
                aria-hidden
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  onPickImage(f);
                }}
              />
              <button
                type="button"
                disabled={liveActive || imageBusy}
                onClick={() => cameraInputRef.current?.click()}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (liveActive || imageBusy) return;
                  libraryInputRef.current?.click();
                }}
                className={cn(
                  "mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full text-fg transition hover:bg-white/5",
                  pendingImage && "text-sapphire",
                  (liveActive || imageBusy) && "opacity-40",
                )}
                aria-label="Take a photo for Grok"
                title="Take photo · hold for library"
              >
                {imageBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Camera className="size-4" />
                )}
              </button>
              {onToggleLiveCam ? (
                <button
                  type="button"
                  disabled={imageBusy}
                  onClick={onToggleLiveCam}
                  className={cn(
                    "mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-full transition",
                    liveCam ? "bg-ruby/80 text-white" : "text-fg hover:bg-white/5",
                  )}
                  aria-label={
                    liveCam ? "Close live camera" : "Live camera with Grok"
                  }
                  title="Live camera"
                >
                  <Video className="size-4" />
                </button>
              ) : null}
            </>
          ) : null}

          <textarea
            value={displayInput}
            onChange={(e) => {
              if (!isRecording) onChange(e.target.value);
            }}
            onFocus={keepComposerFieldVisible}
            onKeyDown={onKeyDown}
            rows={1}
            maxLength={2000}
            placeholder={placeholder}
            className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] text-fg outline-none placeholder:text-muted"
            readOnly={isRecording || liveActive}
          />

          <div
            className={cn("grok-voice-slot", voice && "is-status")}
            data-rvgrok-voice-slot=""
          >
            {voice ? (
              <button
                type="button"
                data-rvgrok-voice-pill=""
                data-phase={voice.phase}
                onClick={onInterrupt}
                className="grok-status-pill"
                aria-label={`Interrupt: ${voiceStatusPillLabel(voice.phase)}`}
              >
                {voiceStatusPillLabel(voice.phase)}
              </button>
            ) : (
              <button
                type="button"
                data-rvgrok-mic=""
                onClick={onMic}
                className={cn(
                  "grok-mic-btn flex size-full items-center justify-center rounded-full",
                  waitingToResumeLive && "is-armed",
                  isRecording && "is-rec",
                )}
                aria-label="Start live voice"
                title="Start Live Voice"
              >
                <Mic className="size-5" />
              </button>
            )}
          </div>
          {voice && onStop ? (
            <button
              type="button"
              data-rvgrok-voice-stop=""
              onClick={onStop}
              className="grok-voice-stop"
              aria-label={`${voice.endLabel} voice`}
            >
              {voice.endLabel}
            </button>
          ) : null}
        </div>

        <button
          type="button"
          disabled={!canSend}
          onClick={onSend}
          className={cn(
            "grok-send-btn flex size-12 shrink-0 items-center justify-center rounded-full transition",
            canSend ? "is-ready" : "is-idle",
          )}
          aria-label="Send"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}
