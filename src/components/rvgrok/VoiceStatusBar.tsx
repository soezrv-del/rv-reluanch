import type { VoiceBarView } from "@/lib/rvgrok/voiceStatusBar";

/**
 * The single status bar above the composer. Replaces the stacked
 * Interrupt / "Live continuous" / "RvGrok speaking…" bars.
 *
 * onInterrupt and onEnd are the exact handlers the old bars used; this
 * component only renders.
 */
export function VoiceStatusBar({
  view,
  onInterrupt,
  onEnd,
}: {
  view: VoiceBarView;
  onInterrupt: () => void;
  onEnd: () => void;
}) {
  return (
    <div
      data-voice-status-bar=""
      data-phase={view.phase}
      data-live={view.live ? "" : undefined}
      className="voice-status-bar mx-auto mb-2 max-w-2xl"
    >
      <span className="voice-status-dot" aria-hidden />
      <p className="voice-status-text" role="status" aria-live="polite">
        <span className="voice-status-main">{view.text}</span>
        {view.detail ? (
          <span className="voice-status-detail"> · {view.detail}</span>
        ) : null}
      </p>
      {view.canInterrupt ? (
        <button
          type="button"
          onClick={onInterrupt}
          className="voice-status-btn voice-status-interrupt"
          data-on-dark=""
          aria-label="Interrupt: stop her and keep listening"
          title="Stop her, keep listening"
        >
          Interrupt
        </button>
      ) : null}
      <button
        type="button"
        onClick={onEnd}
        className="voice-status-btn voice-status-end"
        data-on-dark=""
        aria-label={view.live ? "End Live Voice" : view.endLabel}
      >
        {view.endLabel}
      </button>
    </div>
  );
}
