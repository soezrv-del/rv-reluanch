import { useEffect, useState, type ReactNode } from "react";
import { Scale } from "lucide-react";
import { readStoredPhone } from "@/lib/access/client";
import { acceptNda, hasAcceptedNda } from "@/lib/access/nda";
import { NDA_TEXT, NDA_TITLE } from "@/lib/access/ndaText";

/**
 * First-run legal gate. Must stay pinned to the visible viewport.
 *
 * html/body are overflow:hidden (suite chrome). The old `min-h-dvh`
 * column was taller than the preview iframe, so the checkbox + Continue
 * sat below the fold with no page scroll — David could not accept.
 * Dark `color-scheme` also painted the native checkbox invisible.
 */
export function NdaGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setAccepted(hasAcceptedNda());
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div
        data-nda-state="loading"
        className="fixed inset-0 z-[200] flex items-center justify-center bg-bg text-fg"
        style={{
          top: "var(--vv-offset-top, 0px)",
          height: "var(--vv-height, 100%)",
          maxHeight: "var(--vv-height, 100%)",
        }}
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
        style={{
          top: "var(--vv-offset-top, 0px)",
          height: "var(--vv-height, 100%)",
          maxHeight: "var(--vv-height, 100%)",
        }}
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
            </div>
          </div>
        </div>
        <div
          data-nda-accept-bar
          className="shrink-0 border-t border-border bg-bg-elevated px-4 pt-3"
          style={{
            paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="mx-auto max-w-lg space-y-3">
            <label
              htmlFor="nda-accept-check"
              className="flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-gold-border bg-surface px-3 py-3"
            >
              <input
                id="nda-accept-check"
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="nda-accept-check mt-0.5 size-6 shrink-0"
                data-nda-checkbox
              />
              <span className="text-[13px] leading-relaxed text-fg">
                I have read this agreement and accept it. Accepting does not
                unlock restricted tools.
              </span>
            </label>
            <button
              type="button"
              data-nda-accept
              disabled={!checked}
              onClick={() => {
                acceptNda(readStoredPhone());
                setAccepted(true);
              }}
              className="min-h-12 w-full rounded-xl bg-sapphire py-3 text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
