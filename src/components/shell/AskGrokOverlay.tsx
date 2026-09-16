import {
  lazy,
  Suspense,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { hapticLight } from "@/lib/haptics";
import type { AppTab } from "./BottomTabs";

/**
 * Overlay-only Ask Grok chrome (restored from #239 / #240).
 *
 * Owns: badge, slide-over shell, show/hide, z-index, close, a11y.
 * Does not own chat. Same stack as the Grok tab:
 *
 *   <RvGrokApp variant="embedded" active={…} seedPrompt={…} onSeedConsumed={…} />
 */
const RvGrokApp = lazy(() =>
  import("@/components/rvgrok/RvGrokApp").then((m) => ({ default: m.RvGrokApp })),
);

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    if (el.getAttribute("aria-hidden") === "true") return false;
    const style = window.getComputedStyle(el);
    return style.visibility !== "hidden" && style.display !== "none";
  });
}

export function AskGrokOverlay({
  tab,
  launchOpen,
  open,
  onOpenChange,
  seedPrompt,
  onSeedConsumed,
  entryToken = 0,
}: {
  tab: AppTab;
  launchOpen: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Facts Ask Grok handoff — chrome passes through; do not invent a seed. */
  seedPrompt?: string;
  onSeedConsumed?: () => void;
  entryToken?: number;
}) {
  const [chatMounted, setChatMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const badgeRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const onGrokRoute = tab === "rvgrok";
  const showBadge = !onGrokRoute && !launchOpen;

  useEffect(() => {
    if ((onGrokRoute || launchOpen) && open) onOpenChange(false);
  }, [onGrokRoute, launchOpen, open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    setChatMounted(true);
    const previously = document.activeElement;
    if (previously instanceof HTMLElement && previously !== badgeRef.current) {
      restoreFocusRef.current = previously;
    } else {
      restoreFocusRef.current = badgeRef.current;
    }
    const t = window.setTimeout(() => closeRef.current?.focus(), 40);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
        return;
      }
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;
      const nodes = focusables(root);
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !root.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) return;
    const target = restoreFocusRef.current ?? badgeRef.current;
    if (target && document.contains(target)) {
      const t = window.setTimeout(() => target.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  const openPanel = () => {
    void hapticLight();
    setChatMounted(true);
    onOpenChange(true);
  };

  const closePanel = () => onOpenChange(false);

  if (!showBadge && !open) return null;

  return (
    <div className="ask-grok-chrome" data-ask-grok-chrome data-no-swipe>
      {showBadge ? (
        <button
          ref={badgeRef}
          type="button"
          className="ask-grok-badge"
          data-ask-grok-badge
          data-no-swipe
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="ask-grok-panel"
          onClick={open ? closePanel : openPanel}
        >
          <Sparkles className="ask-grok-badge-icon" aria-hidden />
          <span className="ask-grok-badge-label">Ask Grok</span>
        </button>
      ) : null}

      <div
        className={cn("ask-grok-layer", open && "is-open")}
        aria-hidden={!open}
        data-ask-grok-layer={open ? "open" : "closed"}
      >
        <button
          type="button"
          className="ask-grok-scrim"
          tabIndex={open ? 0 : -1}
          aria-label="Dismiss Ask Grok"
          onClick={closePanel}
        />
        <aside
          ref={panelRef}
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
              tabIndex={open ? 0 : -1}
              onClick={closePanel}
            >
              <X className="size-5" aria-hidden />
            </button>
          </header>

          <div className="ask-grok-mount" data-ask-grok-mount>
            {chatMounted ? (
              <Suspense
                fallback={
                  <div className="ask-grok-mount-fallback" aria-hidden>
                    <span className="ask-grok-mount-pulse" />
                  </div>
                }
              >
                <RvGrokApp
                  variant="embedded"
                  active={open}
                  entryToken={entryToken}
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
