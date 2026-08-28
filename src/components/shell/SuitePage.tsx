import {
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { cn } from "@/lib/utils";
import { SHARED_PRESTIGE_BACKDROP } from "@/assets/prestige";
import type { AppTab } from "./BottomTabs";
import { ScrollSuiteHeader } from "./ScrollChrome";
import { PullResetHint } from "./PullResetHint";
import { useAdaptiveGlass } from "@/lib/hooks/useAdaptiveGlass";
import { useKeyboardInset } from "@/lib/hooks/useKeyboardInset";
import { usePullToReset } from "@/lib/hooks/usePullToReset";

/** Soft-scrim prestige backdrop — single stack (image + scrim only). */
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
      <img
        src={src}
        alt=""
        className="page-backdrop-bright absolute inset-0 size-full object-cover"
        style={{ objectPosition }}
      />
      <div className="page-scrim-soft" />
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
}: SuitePageProps) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = scrollRefProp ?? localRef;
  const kb = useKeyboardInset();
  const glass = useAdaptiveGlass(backdrop, scrollRef);
  const pullHint = usePullToReset(
    scrollRef,
    onPullReset ?? (() => undefined),
    { enabled: Boolean(onPullReset) },
  );

  const rootStyle: CSSProperties = {
    ...(adaptiveGlass ? glass.style : null),
    ...style,
  };

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-bg text-white",
        adaptiveGlass && "adaptive-glass",
        className,
      )}
      style={rootStyle}
      data-glass-l={
        adaptiveGlass ? glass.luminance.toFixed(3) : undefined
      }
      data-no-swipe-scroll={noSwipeScroll ? "" : undefined}
    >
      <SuiteBackdrop src={backdrop} objectPosition={objectPosition} />
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
        {tab ? <ScrollSuiteHeader tab={tab} /> : null}
        {onPullReset ? (
          <PullResetHint show={pullHint} label={pullLabel} />
        ) : null}
        {children}
      </div>
      {overlays}
    </div>
  );
}
