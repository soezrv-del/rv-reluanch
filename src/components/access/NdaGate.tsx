import { useEffect, useState, type ReactNode } from "react";
import { readStoredPhone } from "@/lib/access/client";
import { acceptNda, hasAcceptedNda } from "@/lib/access/nda";
import { NDA_TEXT, NDA_TITLE } from "@/lib/access/ndaText";

/**
 * First screen. Same field as home: void or paper, serif title, one Continue.
 * The agreement row stays the check. Continue is the only button.
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
    paddingTop: "var(--safe-top, 0px)",
    paddingLeft: "var(--safe-left, 0px)",
    paddingRight: "var(--safe-right, 0px)",
  } as const;

  if (!ready) {
    return (
      <div
        data-nda-state="loading"
        className="nda-gate fixed inset-0 z-[200] flex items-center justify-center"
        style={frameStyle}
      >
        <p className="home-truth-line">RvFOX</p>
      </div>
    );
  }

  if (!accepted) {
    return (
      <div
        data-nda-gate
        data-nda-state="prompt"
        className="nda-gate fixed inset-0 z-[200] flex flex-col overflow-hidden"
        style={frameStyle}
      >
        <div
          data-app-scroll
          className="rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto px-6 py-8"
        >
          <div className="mx-auto max-w-lg">
            <p className="home-truth-line">RvFOX</p>
            <h1 className="nda-gate-title">{NDA_TITLE}</h1>
            <p className="nda-gate-body">{NDA_TEXT}</p>
          </div>
        </div>
        <div
          data-nda-accept-bar
          className="nda-accept-bar relative z-10 shrink-0 px-6 pt-3"
        >
          <div className="mx-auto max-w-lg">
            <AgreeRow checked={checked} onToggle={toggleAgree} />
            <button
              type="button"
              data-nda-accept
              disabled={!checked}
              onClick={confirm}
              className="showroom-hero-primary"
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

function AgreeRow({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
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
      <button
        type="button"
        data-nda-agree-row
        aria-pressed={checked}
        onClick={onToggle}
        className="flex min-h-14 w-full touch-manipulation select-none items-center gap-3 border-0 bg-transparent px-0 py-3 text-left"
      >
        <span
          data-nda-check-glyph
          data-checked={checked ? "true" : "false"}
          className="nda-accept-glyph flex size-5 shrink-0 items-center justify-center rounded-full border"
          aria-hidden
        >
          {checked ? (
            <span className="block size-2.5 rounded-full bg-current" />
          ) : null}
        </span>
        <span className="min-w-0 flex-1 text-[15px] font-medium leading-snug">
          I have read this agreement and accept it.
        </span>
      </button>
    </div>
  );
}
