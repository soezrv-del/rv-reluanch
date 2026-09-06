import { useEffect } from "react";
import { SuitePage } from "@/components/shell/SuitePage";
import type { AppTab } from "@/components/shell/BottomTabs";
import { useShellNavOptional } from "@/components/shell/ShellNavContext";

/**
 * Dock / launch / More still expose Share. The kit itself is inline on
 * the Facts coach report — this pane only deep-links there.
 */
export function RvShareApp({
  active = true,
  onNavigate,
}: {
  active?: boolean;
  onNavigate?: (tab: AppTab) => void;
  onOpenGrok?: (prompt?: string) => void;
}) {
  const nav = useShellNavOptional();

  useEffect(() => {
    if (!active) return;
    if (nav?.openFactsShare) {
      nav.openFactsShare();
      return;
    }
    onNavigate?.("rvfax");
  }, [active, nav, onNavigate]);

  return (
    <SuitePage tab="rvshare">
      <div className="mx-auto w-full max-w-lg px-3 pt-6">
        <p className="text-[13px] font-semibold text-white/80">
          Opening the coach report to Share…
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-white/55">
          Share lives at the bottom of each Facts report. Powered by Grok.
        </p>
      </div>
    </SuitePage>
  );
}
