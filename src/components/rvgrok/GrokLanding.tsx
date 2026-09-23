import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { GrokAvatar } from "./GrokAvatar";

export type GrokStarter = {
  title: string;
  line: string;
  prompt: string;
};

export function GrokStatusWord({
  label,
}: {
  label: string;
}) {
  return (
    <p
      data-rvgrok-status={label}
      className="grok-status-word mt-1 text-[11px] font-semibold tracking-[0.22em] text-muted"
    >
      {label}
    </p>
  );
}

export function GrokLanding({
  status,
  speaking,
  lotChip,
  starters,
  onChip,
  toolbar,
  composer,
  hint,
  welcomeBack,
}: {
  status: string;
  speaking: boolean;
  lotChip: GrokStarter | null;
  starters: GrokStarter[];
  onChip: (prompt: string) => void;
  toolbar?: ReactNode;
  composer: ReactNode;
  hint?: string;
  /** UI-only welcome chip. Separate from the session identity heading. */
  welcomeBack?: string;
}) {
  return (
    <div
      data-rvgrok-landing=""
      className="grok-landing mx-auto flex w-full max-w-xl flex-col items-stretch px-1 pb-4 sm:max-w-2xl"
    >
      {lotChip ? (
        <aside
          data-rvgrok-lot-rail=""
          className="grok-lot-rail mb-3 hidden w-full sm:block"
        >
          <p className="px-1 text-[10px] font-semibold tracking-[0.18em] text-muted">
            ON THE LOT
          </p>
          <button
            type="button"
            onClick={() => onChip(lotChip.prompt)}
            className="grok-frost grok-lot-chip mt-2 flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-xl)] px-3.5 py-2.5 text-left"
          >
            <span className="grok-lot-dot size-2 shrink-0 rounded-full" />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-fg">
                {lotChip.title}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-muted">
                {lotChip.line}
              </span>
            </span>
          </button>
        </aside>
      ) : null}

      <section className="grok-frost grok-landing-card relative flex flex-col items-center px-5 pb-5 pt-8 text-center sm:px-10 sm:pb-7 sm:pt-10">
        {toolbar ? (
          <div className="absolute right-3 top-3 flex items-center gap-1">
            {toolbar}
          </div>
        ) : null}

        <GrokAvatar size="lg" speaking={speaking} />

        <div className="mt-5">
          <p className="grok-display text-[1.35rem] font-semibold leading-none text-fg">
            Grok
          </p>
          <GrokStatusWord label={status} />
        </div>

        <h1 className="grok-display mt-6 max-w-[18ch] text-[2rem] font-semibold leading-[1.12] tracking-[-0.03em] text-fg sm:text-[2.35rem]">
          I'm RvGrok
        </h1>

        {welcomeBack ? (
          <p
            data-rvgrok-welcome=""
            className="grok-chip mt-3 rounded-full px-3.5 py-1.5 text-[13px] font-semibold text-fg"
          >
            {welcomeBack}
          </p>
        ) : null}

        <div className="mt-7 w-full text-left">{composer}</div>

        {hint ? (
          <p className="mt-3 text-[12px] text-muted">{hint}</p>
        ) : (
          <div className="grok-starters mt-4 w-full">
            <div className="grok-starters-list flex flex-wrap justify-center gap-2">
              {starters.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  data-rvgrok-chip={s.title}
                  onClick={() => onChip(s.prompt)}
                  className="grok-starter grok-chip flex min-h-11 items-center rounded-full px-3.5 py-2 text-left"
                >
                  <span className="grok-starter-title block text-[13px] font-semibold leading-snug text-fg">
                    Try {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export function grokStatusLabel(opts: {
  liveActive: boolean;
  realtimeStatus: string;
  isRecording: boolean;
  isLoading: boolean;
  speaking: boolean;
}): string {
  if (opts.realtimeStatus === "connecting") return "CONNECTING";
  if (opts.realtimeStatus === "listening") return "LISTENING";
  if (opts.realtimeStatus === "thinking") return "THINKING";
  if (opts.realtimeStatus === "speaking") return "SPEAKING";
  if (opts.isRecording) return "LISTENING";
  if (opts.isLoading) return "WORKING";
  if (opts.speaking) return "SPEAKING";
  if (opts.liveActive) return "LIVE";
  return "READY";
}

export function GrokToolbarButton({
  label,
  onClick,
  active,
  badge,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/25 text-fg transition hover:bg-white/10",
        active && "border-gold-border/60 bg-gold-dim text-gold-bright",
      )}
      aria-label={label}
      title={label}
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-ink-black">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
