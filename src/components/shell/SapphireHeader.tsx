import { cn } from "@/lib/utils";
import type { AppTab } from "./BottomTabs";
import { PAGE_COPY } from "./shellConstants";

/** Suite tools that carry the sapphire “VERIFIED AND TRUE” line. */
const VERIFIED_TABS = new Set<AppTab>([
  "rvfax",
  "rvcal",
  "rvtow",
  "rvtrips",
  "rvshare",
  "rvgrok",
  "rvsold",
  "rvlot",
  "more",
]);

/**
 * Big black titles. Premium is the light-suite layout on the page.
 * Tool screens sit that same type inside a frosted card.
 * Sapphire is only “VERIFIED AND TRUE”, not the title and not FACTS.
 */
export function SapphireHeader({ tab }: { tab: AppTab }) {
  const copy = PAGE_COPY[tab] ?? PAGE_COPY.rvgrok;
  const premium = tab === "more";
  const verified = VERIFIED_TABS.has(tab);

  return (
    <header
      className={cn(
        "suite-hero tesla-page-head",
        premium ? "suite-hero-plain" : "suite-hero-card glass-prestige",
      )}
      data-suite-title={tab}
    >
      {copy.badge ? <p className="suite-hero-eyebrow">{copy.badge}</p> : null}
      <h1 className="tesla-page-title">{copy.title}</h1>
      {verified ? <p className="suite-verified">VERIFIED AND TRUE</p> : null}
      {copy.line ? <p className="tesla-page-line">{copy.line}</p> : null}
    </header>
  );
}
