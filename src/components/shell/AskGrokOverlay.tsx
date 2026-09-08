import { lazy, Suspense, useEffect, useId, useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import type { AppTab } from "./BottomTabs";

/**
 * Overlay-only Ask Grok chrome (David 2026-09-08).
 *
 * Owns: badge, slide-over shell, show/hide, z-index, close.
 * Does not own chat. Grok compact/embedded mode lands on the same mount.
 *
 * GROK MOUNT POINT — do not fork chat:
 *   import { RvGrokApp } from "@/components/rvgrok/RvGrokApp"
 *   <RvGrokApp variant="embedded" active={panelOpen} seedPrompt={seedPrompt} onSeedConsumed={onSeedConsumed} />
 */
const RvGrokApp = lazy(() =>
  import("@/components/rvgrok/RvGrokApp").then((m) => ({ default: m.RvGrokApp })),
);

export function AskGrokOverlay({
  tab,
  launchOpen,
  seedPrompt,
  onSeedConsumed,
}: {
  tab: AppTab;
  launchOpen: boolean;
  /** Facts Ask Grok handoff — chrome passes through; do not invent a seed. */
  seedPrompt?: string;
  onSeedConsumed?: () => void;
}) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();

  const onGrokRoute = tab === "rvgrok";
  const showBadge = !onGrokRoute && !launchOpen;

  useEffect(() => {
    if (onGrokRoute || launchOpen) setPanelOpen(false);
  }, [onGrokRoute, launchOpen]);

  useEffect(() => {
    if (!panelOpen) return;
    setMounted(true);
    const t = window.setTimeout(() => closeRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [panelOpen]);

  const openPanel = () => {
    void hapticLight();
    setMounted(true);
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  if (!showBadge && !panelOpen) return null;

  return (
    <div className="ask-grok-chrome" data-ask-grok-chrome data-no-swipe>
      {showBadge && !panelOpen ? (
        <button
          type="button"
          className="ask-grok-badge"
          data-ask-grok-badge
          data-no-swipe
          aria-haspopup="dialog"
          aria-expanded={false}
          onClick={openPanel}
        >
          <Sparkles className="ask-grok-badge-icon" aria-hidden />
          <span className="ask-grok-badge-label">Ask Grok</span>
        </button>
      ) : null}

      <div
        className={cn("ask-grok-layer", panelOpen && "is-open")}
        hidden={!panelOpen}
        aria-hidden={!panelOpen}
      >
        <button
          type="button"
          className="ask-grok-scrim"
          tabIndex={panelOpen ? 0 : -1}
          aria-label="Dismiss Ask Grok"
          onClick={closePanel}
        />
        <aside
          id="ask-grok-panel"
          className="ask-grok-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-ask-grok-panel
          data-no-swipe
        >
          <header className="ask-grok-panel-bar">
            <p id={titleId} className="ask-grok-panel-title">
              Ask Grok
            </p>
            <button
              ref={closeRef}
              type="button"
              className="ask-grok-close"
              data-ask-grok-close
              aria-label="Close Ask Grok"
              onClick={closePanel}
            >
              <X className="size-5" aria-hidden />
            </button>
          </header>

          {/* GROK MOUNT POINT — compact/embedded mode on this RvGrokApp. */}
          <div className="ask-grok-mount" data-ask-grok-mount>
            {mounted ? (
              <Suspense
                fallback={
                  <div className="ask-grok-mount-fallback" aria-hidden>
                    <span className="ask-grok-mount-pulse" />
                  </div>
                }
              >
                <RvGrokApp
                  variant="embedded"
                  active={panelOpen}
                  seedPrompt={seedPrompt}
                  onSeedConsumed={onSeedConsumed}
                />
              </Suspense>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
