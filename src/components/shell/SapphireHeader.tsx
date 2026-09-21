import { cn } from "@/lib/utils";
import type { AppTab } from "./BottomTabs";
import { PremiumMenuButton } from "./PremiumMenuButton";
import { MetalVerifiedTrue } from "./Launchpad";
import { PAGE_ACCENT, PAGE_COPY } from "./shellConstants";

/** Suite tools that share sapphire shell + forged mark */
const VERIFIED_TABS = new Set<AppTab>([
  "rvfax",
  "rvcal",
  "rvtow",
  "rvtrips",
  "rvshare",
  "rvgrok",
]);

export function SapphireHeader({ tab }: { tab: AppTab }) {
  const copy = PAGE_COPY[tab] ?? PAGE_COPY.rvgrok;
  const showVerified = VERIFIED_TABS.has(tab);
  // Main suite tools → sapphire; Premium (more) → gold
  const accent = showVerified ? "sapphire" : (PAGE_ACCENT[tab] ?? "sapphire");

  return (
    <header
      className="sapphire-header relative z-30 shrink-0 px-4 pb-3 sm:px-5"
      data-page-accent={accent}
    >
      <div className="sapphire-header-inner relative overflow-hidden rounded-[1.5rem] px-5 py-5 sm:px-7 sm:py-6">
        <div className="absolute right-3 top-3 z-[4] sm:right-3.5 sm:top-3.5">
          <PremiumMenuButton size="sm" />
        </div>

        <div className="relative z-[2] flex flex-col items-center text-center">
          {copy.badge ? (
            <span
              className={cn(
                "sapphire-header-badge mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[8px] font-semibold tracking-[0.2em]",
              )}
            >
              {copy.badge}
            </span>
          ) : null}

          <div className="flex flex-col items-center gap-1.5">
            <div className="sapphire-title-stage relative inline-flex max-w-full items-center justify-center overflow-visible px-2 py-1">
              <h1
                className={cn(
                  "sapphire-header-title relative z-[2] max-w-[20ch] font-semibold leading-[1.05] tracking-tight sm:max-w-none",
                  copy.title.length <= 8
                    ? "text-[clamp(2.4rem,11vw,3.25rem)]"
                    : "text-[clamp(2rem,9vw,2.85rem)]",
                )}
                data-text={copy.title}
              >
                {copy.title}
              </h1>
            </div>

            {showVerified ? (
              <div className="w-full px-2 leading-none">
                <MetalVerifiedTrue size="sm" />
              </div>
            ) : null}
          </div>

          {copy.line ? (
            <p
              className={cn(
                "sapphire-header-line mt-3 max-w-md text-[12px] font-medium leading-relaxed sm:text-[13px]",
              )}
            >
              {copy.line}
            </p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
