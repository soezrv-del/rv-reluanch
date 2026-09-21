import { useEffect, useState } from "react";
import { SuitePage } from "@/components/shell/SuitePage";
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

/** Pro Sold book — same list as Facts, opened from the Premium menu. */
export function SoldBookApp() {
  const [deals, setDeals] = useState<SoldDeal[]>([]);
  const nav = useShellNavOptional();

  useEffect(() => {
    setDeals(loadSoldDeals());
    const sync = () => setDeals(loadSoldDeals());
    window.addEventListener(SOLD_CHANGED_EVENT, sync);
    return () => window.removeEventListener(SOLD_CHANGED_EVENT, sync);
  }, []);

  const persistDeals = (next: SoldDeal[]) => {
    setDeals(persistSoldDeals(next));
  };

  return (
    <SuitePage
      tab="rvsold"
      raidhoOnly
      adaptiveGlass={false}
      onPullReset={() => setDeals(loadSoldDeals())}
      pullLabel="Release to refresh Sold"
      className="rvfax-screen"
    >
      <SoldList
        deals={deals}
        onBack={() => nav?.setTab("rvfax")}
        onTogglePaid={(id) => persistDeals(toggleDealPaid(deals, id))}
        onRemove={(id) => persistDeals(removeSoldDeal(deals, id))}
        onOpenMarket={() => nav?.openFactsMarket()}
      />
    </SuitePage>
  );
}
