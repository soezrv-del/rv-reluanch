import { useEffect, useId, useRef, useState } from "react";
import { RAIDHO_R_MARK } from "@/assets/prestige";

export type FoxChip = {
  id: string;
  label: string;
  on?: boolean;
  onClick: () => void;
};

export function FoxChips({ chips }: { chips: FoxChip[] }) {
  return (
    <div className="fox-chips" data-fox-chips>
      {chips.map((chip) => (
        <button
          key={chip.id}
          type="button"
          className={chip.on ? "fox-chip is-on" : "fox-chip"}
          data-fox-chip={chip.id}
          aria-pressed={chip.on ? true : undefined}
          onClick={chip.onClick}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

export function FoxAsk({
  placeholder,
  value,
  onChange,
  onSubmit,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}) {
  const fieldId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const listen = () => {
    const w = window as Window & {
      SpeechRecognition?: new () => SpeechRec;
      webkitSpeechRecognition?: new () => SpeechRec;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      inputRef.current?.focus();
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (event) => {
      const said = event.results?.[0]?.[0]?.transcript?.trim();
      if (!said) return;
      onChange(said);
      inputRef.current?.focus();
    };
    try {
      rec.start();
    } catch {
      inputRef.current?.focus();
    }
  };

  return (
    <form
      className="fox-ask"
      data-fox-ask
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(value);
      }}
    >
      <label className="sr-only" htmlFor={fieldId}>
        Ask
      </label>
      <input
        id={fieldId}
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        enterKeyHint="send"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      <button
        type="button"
        className="fox-mic"
        aria-label="Microphone"
        onClick={listen}
      >
        <MicIcon />
      </button>
    </form>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden width="18" height="18">
      <path
        fill="currentColor"
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V20H9v2h6v-2h-2v-2.08A7 7 0 0 0 19 11h-2z"
      />
    </svg>
  );
}

type SpeechRec = {
  lang: string;
  interimResults: boolean;
  start: () => void;
  onresult: ((event: {
    results: ArrayLike<ArrayLike<{ transcript: string }>>;
  }) => void) | null;
};

export function FoxMark({
  onHome,
  onGps,
  onCatalog,
  onPremium,
}: {
  onHome: () => void;
  onGps: () => void;
  onCatalog: () => void;
  onPremium: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [open]);

  const pick = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="fox-mark" ref={rootRef}>
      <button
        type="button"
        className="fox-mark-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu"
        onClick={() => setOpen((v) => !v)}
      >
        <img src={RAIDHO_R_MARK} alt="" />
      </button>
      <button type="button" className="fox-word" onClick={onHome}>
        RvFOX
      </button>
      {open ? (
        <div className="fox-menu" role="menu" data-fox-menu>
          <button type="button" role="menuitem" onClick={() => pick(onHome)}>
            Home
          </button>
          <button
            type="button"
            role="menuitem"
            data-fox-menu-item="rvtrips"
            onClick={() => pick(onGps)}
          >
            RV GPS
          </button>
          <button type="button" role="menuitem" onClick={() => pick(onCatalog)}>
            Catalog
          </button>
          <button type="button" role="menuitem" onClick={() => pick(onPremium)}>
            Premium
          </button>
        </div>
      ) : null}
    </div>
  );
}
