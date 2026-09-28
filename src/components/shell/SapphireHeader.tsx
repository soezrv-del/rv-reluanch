import { cn } from "@/lib/utils";
import type { AppTab } from "./BottomTabs";
import { PremiumMenuButton } from "./PremiumMenuButton";
import { PAGE_COPY } from "./shellConstants";
import { SapphireIceHeader } from "./SapphireIceHeader";

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
 * Big black titles on white. Tool screens sit that type inside a frosted card.
 * Sapphire is only “VERIFIED AND TRUE”, not the title.
 * Blue uses the ice banner beside this one.
 */
export function SapphireHeader({ tab }: { tab: AppTab }) {
  const copy = PAGE_COPY[tab] ?? PAGE_COPY.rvgrok;
  const premium = tab === "more";
  const verified = VERIFIED_TABS.has(tab);

  return (
    <>
      <header
        className={cn(
          "home-theme-white suite-hero tesla-page-head",
          premium ? "suite-hero-plain" : "suite-hero-card glass-prestige",
        )}
        data-suite-title={tab}
      >
        <PremiumMenuButton size="sm" className="suite-hero-menu" />
        {copy.badge ? <p className="suite-hero-eyebrow">{copy.badge}</p> : null}
        <h1 className="tesla-page-title">{copy.title}</h1>
        {verified ? <p className="suite-verified">VERIFIED AND TRUE</p> : null}
        {copy.line ? <p className="tesla-page-line">{copy.line}</p> : null}
      </header>
      <SapphireIceHeader tab={tab} />
    </>
  );
}
