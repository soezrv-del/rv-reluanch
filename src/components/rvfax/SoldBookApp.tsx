import { useCallback, useEffect, useRef, useState } from "react";
import { SHARED_PRESTIGE_BACKDROP } from "@/assets/prestige";
import { ScrollSuiteHeader } from "@/components/shell/ScrollChrome";
import { SuiteBackdrop } from "@/components/shell/SuitePage";
import { PullRefreshLayer } from "@/components/shell/PullResetHint";
import { useAdaptiveGlass } from "@/lib/hooks/useAdaptiveGlass";
import { usePullToReset } from "@/lib/hooks/usePullToReset";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";
import {
  loadSoldDeals,
  persistSoldDeals,
  removeSoldDeal,
  SOLD_CHANGED_EVENT,
  toggleDealPaid,
  type SoldDeal,
} from "@/lib/rv/soldDeals";
import { SoldList } from "./SoldList";

const PRESTIGE_BACKDROP = SHARED_PRESTIGE_BACKDROP;

/** Pro Sold book — same list as Facts, opened from the dock balance tab. */
export function SoldBookApp() {
  const [deals, setDeals] = useState<SoldDeal[]>([]);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const adaptiveGlass = useAdaptiveGlass(PRESTIGE_BACKDROP, scrollRef);
  const nav = useShellNavOptional();

  useEffect(() => {
    setDeals(loadSoldDeals());
    const sync = () => setDeals(loadSoldDeals());
    window.addEventListener(SOLD_CHANGED_EVENT, sync);
    return () => window.removeEventListener(SOLD_CHANGED_EVENT, sync);
  }, []);

  const refreshSold = useCallback(() => {
    setDeals(loadSoldDeals());
    try {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      /* */
    }
  }, []);
  const pull = usePullToReset(scrollRef, refreshSold);

  const persistDeals = (next: SoldDeal[]) => {
    setDeals(persistSoldDeals(next));
  };

  return (
    <div
      className="rvfax-screen adaptive-glass relative flex h-full min-h-0 flex-col overflow-hidden text-white"
      style={adaptiveGlass.style}
      data-glass-l={adaptiveGlass.luminance.toFixed(3)}
      data-readable-cards=""
      data-sold-book=""
    >
      <SuiteBackdrop src={PRESTIGE_BACKDROP} />
      <div
        ref={scrollRef}
        data-app-scroll
        className="rv-scroll relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        <PullRefreshLayer state={pull} label="Release to refresh Sold">
        <ScrollSuiteHeader tab="rvsold" />
        <SoldList>
          deals={deals}
          onBack={() => nav?.setTab("rvfax")}
          onTogglePaid={(id) => persistDeals(toggleDealPaid(deals, id))}
          onRemove={(id) => persistDeals(removeSoldDeal(deals, id))}
        />
        </PullRefreshLayer>
      </div>
    </div>
  );
}
