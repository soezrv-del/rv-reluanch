import { useEffect, useState, type ReactNode } from "react";
import { Scale } from "lucide-react";
import { readStoredPhone } from "@/lib/access/client";
import { acceptNda, hasAcceptedNda } from "@/lib/access/nda";
import { NDA_TEXT, NDA_TITLE } from "@/lib/access/ndaText";
import { SuiteRaidhoBackdrop } from "@/components/shell/SuitePage";

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
        className="relative flex h-full min-h-dvh items-center justify-center overflow-hidden bg-bg text-fg"
      >
        <SuiteRaidhoBackdrop />
        <p className="relative z-10 text-[13px] font-semibold text-muted">
          RvFOX
        </p>
      </div>
    );
  }

  if (!accepted) {
    return (
      <div
        data-nda-gate
        data-nda-state="prompt"
        className="relative flex h-full min-h-dvh flex-col overflow-hidden bg-bg text-fg"
      >
        <SuiteRaidhoBackdrop />
        <div className="relative z-10 border-b border-border px-4 py-3">
          <p className="text-[10px] font-bold tracking-[0.16em] text-gold">
            REQUIRED
          </p>
          <h1 className="mt-1 text-[18px] font-bold leading-snug text-fg">
            {NDA_TITLE}
          </h1>
        </div>
        <div data-app-scroll className="rv-scroll flex-1 overflow-y-auto px-4 py-4">
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
        <div className="border-t border-border px-4 py-3">
          <div className="mx-auto max-w-lg space-y-3">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-1 size-5 shrink-0 accent-sapphire"
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
              className="w-full rounded-xl bg-sapphire py-3 text-[14px] font-bold text-fg disabled:opacity-50"
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
