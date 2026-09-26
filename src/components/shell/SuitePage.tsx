import {
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import { RAIDHO_R_MARK, SHARED_PRESTIGE_BACKDROP } from "@/assets/prestige";
import type { AppTab } from "./BottomTabs";
import { ScrollSuiteHeader } from "./ScrollChrome";
import { ActiveCoachChip } from "./ActiveCoachChip";
import { PullRefreshLayer } from "./PullResetHint";
import { useAdaptiveGlass } from "@/lib/hooks/useAdaptiveGlass";
import { useKeyboardInset } from "@/lib/hooks/useKeyboardInset";
import { usePullToReset } from "@/lib/hooks/usePullToReset";

/**
 * One tinted-glass veil above the mark. No blur — the R stays sharp.
 * Darken and desaturate only, so the black ground stays black.
 * Inline so both the standard property and the WebKit prefix survive CSS
 * minification (it otherwise keeps only -webkit-backdrop-filter).
 */
export const RAIDHO_FROST_FILTER = "saturate(0.5) brightness(0.5)";

function RaidhoFrostVeil() {
  return (
    <div
      className="suite-raidho-frost"
      style={{
        backdropFilter: RAIDHO_FROST_FILTER,
        WebkitBackdropFilter: RAIDHO_FROST_FILTER,
      }}
    />
  );
}

/** Full-viewport Raidho R watermark — same seal as compare, suite-wide. */
export function SuiteRaidhoBackdrop({
  className,
  bleed,
}: {
  className?: string;
  /** Logo only, full-bleed — no photo, field, or scrim. */
  bleed?: boolean;
}) {
  return (
    <div
      className={cn(
        "suite-raidho-backdrop pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
      data-raidho-bleed={bleed ? "" : undefined}
    >
      <div className="suite-raidho-stack">
        {bleed ? null : <div className="suite-raidho-field" />}
        <img
          src={RAIDHO_R_MARK}
          alt=""
          className={bleed ? "suite-raidho-bleed" : "suite-raidho-mark"}
        />
        <RaidhoFrostVeil />
      </div>
    </div>
  );
}

/** Soft-scrim prestige backdrop — photo + Raidho R watermark + scrim. */
export function SuiteBackdrop({
  src = SHARED_PRESTIGE_BACKDROP,
  objectPosition = "center",
  className,
}: {
  src?: string;
  objectPosition?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <div className="suite-raidho-stack">
        <img
          src={src}
          alt=""
          className="page-backdrop-bright absolute inset-0 size-full object-cover"
          style={{ objectPosition }}
        />
        <div className="suite-raidho-field" />
        <div className="page-scrim-soft" />
        <img src={RAIDHO_R_MARK} alt="" className="suite-raidho-mark" />
        <RaidhoFrostVeil />
      </div>
    </div>
  );
}

const KB_PAD_DEFAULT = 96;

export type SuitePageProps = {
  /** Suite tab for sapphire banner; omit for sub-screens (detail, compare). */
  tab?: AppTab;
  backdrop?: string;
  objectPosition?: string;
  /** Adaptive glass CSS vars from backdrop luminance. */
  adaptiveGlass?: boolean;
  /** Pull-to-reset handler; omit to disable. */
  onPullReset?: () => void;
  pullLabel?: string;
  /** Extra bottom pad when keyboard open (added to inset). */
  kbPad?: number;
  /** Block horizontal swipe-tab gestures on this screen. */
  noSwipeScroll?: boolean;
  className?: string;
  scrollClassName?: string;
  /** Optional fixed chrome above the scroll region (rare). */
  topSlot?: ReactNode;
  /** Content under the suite header, inside the scroll region. */
  children: ReactNode;
  /** Portals / sheets rendered as siblings of the scroll root (outside overflow). */
  overlays?: ReactNode;
  /** Expose scroll node to parent (lenders, focus, etc.). */
  scrollRef?: RefObject<HTMLDivElement | null>;
  style?: CSSProperties;
  /** Landing chrome hook (Tow). Photo landings are gone — Raidho only. */
  landing?: "tow";
  /** Full-bleed Raidho logo, no family / camping photo plate. Default on. */
  raidhoOnly?: boolean;
};

/**
 * Shared suite screen shell.
 * Backdrop + soft scrim + optional sapphire header + pull hint + keyboard pad.
 * Feature apps only own their content — chrome changes land here once.
 */
export function SuitePage({
  tab,
  backdrop = SHARED_PRESTIGE_BACKDROP,
  objectPosition = "center",
  adaptiveGlass = true,
  onPullReset,
  pullLabel,
  kbPad = KB_PAD_DEFAULT,
  noSwipeScroll,
  className,
  scrollClassName,
  topSlot,
  children,
  overlays,
  scrollRef: scrollRefProp,
  style,
  landing,
  raidhoOnly = true,
}: SuitePageProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = scrollRefProp ?? localRef;
  const kb = useKeyboardInset();
  const glass = useAdaptiveGlass(backdrop, scrollRef);
  const pull = usePullToReset(
    scrollRef,
    onPullReset ?? (() => undefined),
    { enabled: Boolean(onPullReset) },
  );

  const usePhotoGlass = adaptiveGlass && !raidhoOnly;
  const rootStyle: CSSProperties = {
    ...(usePhotoGlass ? glass.style : null),
    ...style,
  };

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-bg text-white",
        usePhotoGlass && "adaptive-glass",
        className,
      )}
      data-readable-cards=""
      style={rootStyle}
      data-glass-l={
        usePhotoGlass ? glass.luminance.toFixed(3) : undefined
      }
      data-no-swipe-scroll={noSwipeScroll ? "" : undefined}
      data-tow-landing={landing === "tow" ? "" : undefined}
      data-sold-book={tab === "rvsold" ? "" : undefined}
      data-premium-screen={tab === "more" ? "" : undefined}
      data-cal-screen={tab === "rvcal" ? "" : undefined}
      data-raidho-only={raidhoOnly ? "" : undefined}
    >
      {raidhoOnly ? (
        <SuiteRaidhoBackdrop bleed />
      ) : (
        <SuiteBackdrop src={backdrop} objectPosition={objectPosition} />
      )}
      {topSlot}
      <div
        ref={scrollRef}
        data-app-scroll
        className={cn(
          "rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain",
          scrollClassName,
        )}
        style={{
          paddingBottom: kb.open
            ? `max(6rem, ${kb.inset + kbPad}px)`
            : undefined,
        }}
      >
        {onPullReset ? (
          <PullRefreshLayer state={pull} label={pullLabel}>
            {tab ? <ScrollSuiteHeader tab={tab} /> : null}
            {tab === "rvcal" ? <ActiveCoachChip /> : null}
            {children}
          </PullRefreshLayer>
        ) : (
          <>
            {tab ? <ScrollSuiteHeader tab={tab} /> : null}
            {tab === "rvcal" ? <ActiveCoachChip /> : null}
            {children}
          </>
        )}
      </div>
      {overlays}
    </div>
  );
}
