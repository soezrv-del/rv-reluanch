import { SapphireHeader } from "./SapphireHeader";
import type { AppTab } from "./BottomTabs";
import { cn } from "@/lib/utils";

/**
 * Suite sapphire header in document flow — scrolls with page content.
 */
export function ScrollSuiteHeader({
  tab,
  className,
}: {
  tab: AppTab;
  className?: string;
}) {
  return (
    <div className={cn("relative z-20 shrink-0", className)}>
      <SapphireHeader tab={tab} />
    </div>
  );
}
