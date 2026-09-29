import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RV_GROK_SESSION_INTRO } from "@/lib/rvgrok/speechPolicy";
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
  onChip,
  toolbar,
  history,
  hasHistory = false,
  composer,
  hint,
  greeting = RV_GROK_SESSION_INTRO,
  welcomeBack,
  avatarSrc,
}: {
  status: string;
  speaking: boolean;
  lotChip: GrokStarter | null;
  onChip: (prompt: string) => void;
  toolbar?: ReactNode;
  history?: ReactNode;
  hasHistory?: boolean;
  composer: ReactNode;
  hint?: string;
  /** Session heading. Hello, {name} after sign-in; I'm RvGrok before a name. */
  greeting?: string;
  /** UI-only welcome chip. Hidden when the heading is already Hello, {name}. */
  welcomeBack?: string;
  avatarSrc?: string;
}) {
  return (
    <div
      data-rvgrok-landing=""
      className="grok-landing mx-auto flex w-full max-w-xl flex-col items-stretch px-1 sm:max-w-2xl"
    >
      <div className="grok-landing-glow" aria-hidden />
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

      <section className="grok-frost grok-landing-card relative flex flex-col items-center px-5 pb-5 pt-16 text-center sm:px-10 sm:pb-7">
        {toolbar ? (
          <div
            data-grok-top-chrome
            className="absolute right-3 top-3 flex items-center gap-1"
          >
            {toolbar}
          </div>
        ) : null}

        <GrokAvatar size="lg" speaking={speaking} src={avatarSrc} />

        {hasHistory ? (
          <p className="grok-last-note">Continue where you left off</p>
        ) : null}
        {history}

        <div className="mt-5">
          <p className="grok-display text-[1.35rem] font-semibold leading-none text-fg">
            Grok
          </p>
          <GrokStatusWord label={status} />
        </div>

        <h1
          data-rvgrok-greeting=""
          className="grok-display mt-6 max-w-[18ch] text-[2rem] font-semibold leading-[1.12] tracking-[-0.03em] text-fg sm:text-[2.35rem]"
        >
          {greeting}
        </h1>

        {welcomeBack && greeting === RV_GROK_SESSION_INTRO ? (
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
        ) : null}
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
        active && "border-[#1648c8]/70 bg-[#1648c8]/15 text-sapphire",
      )}
      aria-label={label}
      title={label}
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-sapphire text-[9px] font-bold text-white" data-on-dark="">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
