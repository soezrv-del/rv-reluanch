import { useEffect, useState, type ReactNode } from "react";
import { Check, Scale } from "lucide-react";
import { readStoredPhone } from "@/lib/access/client";
import { acceptNda, hasAcceptedNda } from "@/lib/access/nda";
import { NDA_TEXT, NDA_TITLE } from "@/lib/access/ndaText";

/**
 * First-run legal gate. Must stay pinned to the visible viewport.
 *
 * html/body are overflow:hidden (suite chrome). A min-h-dvh column
 * pushed the accept chrome below the preview fold. Dark color-scheme
 * also painted a native checkbox invisible. Phone: a 24px box next to
 * a disabled Continue reads as "no place to check off" — the whole
 * agreement row must be the tap target.
 */
export function NdaGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAccepted(hasAcceptedNda());
    setReady(true);
  }, []);

  const toggleAgree = () => setChecked((v) => !v);
  const confirm = () => {
    acceptNda(readStoredPhone());
    setAccepted(true);
  };

  const frameStyle = {
    top: "var(--vv-offset-top, 0px)",
    height: "var(--vv-height, 100%)",
    maxHeight: "var(--vv-height, 100%)",
  } as const;

  if (!ready) {
    return (
      <div
        data-nda-state="loading"
        className="fixed inset-0 z-[200] flex items-center justify-center bg-bg text-fg"
        style={frameStyle}
      >
        <p className="text-[13px] font-semibold text-muted">RvFOX</p>
      </div>
    );
  }

  if (!accepted) {
    return (
      <div
        data-nda-gate
        data-nda-state="prompt"
        className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-bg text-fg"
        style={frameStyle}
      >
        <div className="shrink-0 border-b border-border px-4 py-3">
          <p className="text-[10px] font-bold tracking-[0.16em] text-gold">
            REQUIRED
          </p>
          <h1 className="mt-1 text-[18px] font-bold leading-snug text-fg">
            {NDA_TITLE}
          </h1>
        </div>
        <div
          data-app-scroll
          className="rv-scroll min-h-0 flex-1 overflow-y-auto px-4 py-4"
        >
          <div className="mx-auto max-w-lg">
            <div className="glass-prestige rounded-[1.25rem] p-4">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gold-dim">
                <Scale className="size-5 text-gold" />
              </div>
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted">
                {NDA_TEXT}
              </p>
              <AgreeRow
                checked={checked}
                onToggle={toggleAgree}
                className="mt-4"
              />
            </div>
          </div>
        </div>
        <div
          data-nda-accept-bar
          className="nda-accept-bar shrink-0 border-t border-border bg-bg-elevated px-4 pt-3"
        >
          <div className="mx-auto max-w-lg space-y-3">
            <AgreeRow
              checked={checked}
              onToggle={toggleAgree}
              primary
            />
            <button
              type="button"
              data-nda-accept
              disabled={!checked}
              onClick={confirm}
              className={
                checked
                  ? "min-h-14 w-full touch-manipulation rounded-xl bg-sapphire py-3.5 text-[16px] font-bold text-white shadow-[0_0_24px_rgba(74,134,240,0.35)]"
                  : "min-h-14 w-full touch-manipulation rounded-xl bg-sapphire/40 py-3.5 text-[16px] font-bold text-white/70 disabled:cursor-not-allowed"
              }
            >
              {checked ? "Accept & Continue" : "Continue"}
            </button>
            {!checked ? (
              <p className="pb-1 text-center text-[12px] font-semibold leading-snug text-gold-bright">
                Tap the agreement row to check it off, then Continue unlocks.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AgreeRow({
  checked,
  onToggle,
  primary = false,
  className = "",
}: {
  checked: boolean;
  onToggle: () => void;
  primary?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      {primary ? (
        <input
          id="nda-accept-check"
          type="checkbox"
          checked={checked}
          readOnly
          tabIndex={-1}
          aria-hidden
          className="nda-accept-check"
          data-nda-checkbox
        />
      ) : null}
      <button
        type="button"
        data-nda-agree-row
        aria-pressed={checked}
        onClick={onToggle}
        className={[
          "flex min-h-14 w-full touch-manipulation select-none items-center gap-3 rounded-xl border px-3.5 py-3 text-left active:scale-[0.99]",
          checked
            ? "border-sapphire bg-[rgba(74,134,240,0.22)]"
            : "border-gold-bright bg-surface",
        ].join(" ")}
      >
        <span
          data-nda-check-glyph
          data-checked={checked ? "true" : "false"}
          className="nda-accept-glyph flex size-9 shrink-0 items-center justify-center"
          aria-hidden
        >
          {checked ? <Check className="size-5 text-white" strokeWidth={3} /> : null}
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-semibold leading-snug text-fg">
          I have read this agreement and accept it. Accepting does not
          unlock restricted tools.
        </span>
      </button>
    </div>
  );
}
