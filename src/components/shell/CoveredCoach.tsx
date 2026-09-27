import { useId } from "react";

/**
 * A coach under a ceremony cover. Not a photo of the unit.
 * Three drape shapes so a row of missing photos does not repeat.
 * The coach stays dark; the cloth is a separate sheet with a hanging hem.
 */
const DRAPES = [
  {
    cloth: "var(--color-gold)",
    fold: "var(--color-ink-black)",
    sheen: "var(--color-gold-bright)",
    glow: "var(--color-gold-bright)",
    cx: 78,
    sheet:
      "M32 34 C48 18 66 12 84 16 C104 20 118 16 126 28 L128 36 C112 48 96 34 82 46 C68 56 50 42 36 50 C30 40 30 38 32 34 Z",
    folds: "M84 16 L78 46 M104 18 L98 40 M58 22 L52 48",
    sheenPath: "M48 26 C66 14 96 14 118 24",
  },
  {
    cloth: "var(--color-ink-foam)",
    fold: "var(--color-sapphire-deep)",
    sheen: "var(--color-ink-ink)",
    glow: "var(--color-sapphire-glow)",
    cx: 34,
    sheet:
      "M30 40 C42 22 58 14 70 26 C80 36 88 18 104 14 C120 10 130 22 132 34 L130 40 C116 52 100 36 86 48 C70 58 52 44 38 52 C28 46 26 44 30 40 Z",
    folds: "M70 26 L64 50 M104 14 L108 42 M48 24 L44 48",
    sheenPath: "M42 28 C58 16 78 20 92 30",
  },
  {
    cloth: "var(--color-sapphire-glow)",
    fold: "var(--color-ink-black)",
    sheen: "var(--color-ink-foam)",
    glow: "var(--color-gold-bright)",
    cx: 120,
    sheet:
      "M34 46 C46 36 58 24 74 18 C92 12 112 10 128 20 L132 34 C124 46 108 34 96 44 C82 54 62 40 46 50 C36 46 32 48 34 46 Z",
    folds: "M74 18 L70 48 M108 14 L112 42 M52 28 L48 50",
    sheenPath: "M60 24 C84 12 114 12 130 22",
  },
] as const;

export function CoveredCoach({ variant }: { variant: 0 | 1 | 2 }) {
  const drape = DRAPES[variant];
  const glowId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 144 80"
      role="img"
      aria-label="Photo coming soon"
      className="h-20 w-full"
      data-covered-coach={variant}
    >
      <defs>
        <radialGradient id={glowId} cx={drape.cx} cy="2" r="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={drape.glow} stopOpacity="0.95" />
          <stop offset="55%" stopColor={drape.glow} stopOpacity="0.28" />
          <stop offset="100%" stopColor={drape.glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="144" height="80" fill="var(--color-ink-black)" />
      <ellipse cx={drape.cx} cy="6" rx="42" ry="22" fill={`url(#${glowId})`} />
      <path
        d="M14 50 L20 38 Q28 30 42 34 L36 50 Z"
        fill="var(--color-ink-surface-2)"
      />
      <path d="M18 36 L26 32" stroke="var(--color-sapphire-glow)" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M32 48 H126 Q132 48 132 42 V38 H40 L32 48 Z"
        fill="var(--color-ink-surface)"
      />
      <path d={drape.sheet} fill={drape.cloth} />
      <path
        d={drape.sheenPath}
        fill="none"
        stroke={drape.sheen}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d={drape.folds}
        fill="none"
        stroke={drape.fold}
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="48" cy="52" r="7" fill="var(--color-ink-black)" stroke="var(--color-ink-foam)" strokeOpacity="0.7" strokeWidth="1.4" />
      <circle cx="48" cy="52" r="2.2" fill="var(--color-ink-foam)" opacity="0.5" />
      <circle cx="110" cy="52" r="7" fill="var(--color-ink-black)" stroke="var(--color-ink-foam)" strokeOpacity="0.7" strokeWidth="1.4" />
      <circle cx="110" cy="52" r="2.2" fill="var(--color-ink-foam)" opacity="0.5" />
    </svg>
  );
}
