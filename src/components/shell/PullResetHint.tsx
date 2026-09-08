import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { PullToResetState } from "@/lib/hooks/usePullToReset";
import { IOS_SWIPE_EASE } from "@/lib/hooks/iosGestures";

/** iOS-style refresh spinner + optional release label. */
export function PullResetHint({
  show,
  label = "Release to refresh",
  progress = 0,
  refreshing = false,
}: {
  show: boolean;
  label?: string;
  progress?: number;
  refreshing?: boolean;
}) {
  const visible = show || refreshing || progress > 0.08;
  if (!visible) return null;
  const turn = refreshing ? 0 : progress;
  const caption = refreshing
    ? "Refreshing…"
    : show
      ? label
      : "Pull to refresh";

  return (
    <div
      className={cn(
        "pointer-events-none sticky top-0 z-30 flex flex-col items-center justify-center gap-1.5 pt-1 pb-2",
        refreshing || show ? "opacity-100" : "opacity-80",
      )}
      data-pull-refresh=""
      aria-hidden
    >
      <span
        className={cn(
          "ios-pull-spinner",
          refreshing && "ios-pull-spinner-spin",
        )}
        style={
          refreshing
            ? undefined
            : { transform: `rotate(${turn * 220 - 40}deg)` }
        }
      />
      <span className="text-[10px] font-semibold tracking-[0.04em] text-sky-100/90">
        {caption}
      </span>
    </div>
  );
}

/**
 * Shared rubber-band layer — spinner sits above content, whole column
 * tracks the pull offset. Use inside any `[data-app-scroll]` root.
 */
export function PullRefreshLayer({
  state,
  label,
  children,
}: {
  state: PullToResetState;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div
      className="pull-refresh-layer relative"
      data-pull-dragging={state.dragging ? "" : undefined}
      style={{
        transform: `translate3d(0, ${state.offset}px, 0)`,
        transition: state.dragging
          ? "none"
          : `transform 320ms ${IOS_SWIPE_EASE}`,
      }}
    >
      <PullResetHint
        show={state.show}
        progress={state.progress}
        refreshing={state.refreshing}
        label={label}
      />
      {children}
    </div>
  );
}
