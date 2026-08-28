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
  "rvgrok",
]);

export function SapphireHeader({ tab }: { tab: AppTab }) {
  const copy = PAGE_COPY[tab] ?? PAGE_COPY.rvgrok;
  const showVerified = VERIFIED_TABS.has(tab);
  // Main suite tools → sapphire; Premium (more) → gold
  const accent = showVerified ? "sapphire" : (PAGE_ACCENT[tab] ?? "sapphire");

  const shellGlow =
    accent === "gold"
      ? {
          background:
            "linear-gradient(165deg, rgba(18,14,8,0.88) 0%, rgba(28,22,12,0.82) 40%, rgba(10,8,4,0.92) 100%)",
          boxShadow:
            "0 16px 48px rgba(20,12,0,0.5), inset 0 1px 0 rgba(232,220,192,0.26), inset 0 -1px 0 rgba(100,80,40,0.22)",
        }
      : {
          background:
            "linear-gradient(165deg, rgba(4,10,28,0.82) 0%, rgba(8,18,48,0.78) 40%, rgba(2,6,20,0.88) 100%)",
          boxShadow:
            "0 16px 48px rgba(0,10,40,0.55), inset 0 1px 0 rgba(160,210,255,0.28), inset 0 -1px 0 rgba(40,80,160,0.25)",
        };

  const badgeTone =
    accent === "gold"
      ? "border-gold/40 bg-gold-dim text-gold-bright"
      : "border-sky-300/35 bg-white/8 text-sky-100";

  return (
    <header
      className="sapphire-header relative z-30 shrink-0 px-3 pb-1.5 pt-[max(0.35rem,env(safe-area-inset-top))] sm:px-4"
      data-page-accent={accent}
    >
      <div
        className={cn(
          "sapphire-header-inner relative overflow-hidden rounded-[1.35rem] border border-white/20 px-3 py-3.5 sm:px-6 sm:py-4",
        )}
        style={{
          ...shellGlow,
          backdropFilter: "blur(24px) saturate(1.45)",
          WebkitBackdropFilter: "blur(24px) saturate(1.45)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              accent === "gold"
                ? "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,184,150,0.18) 0%, transparent 55%)"
                : "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(60,120,255,0.22) 0%, transparent 55%)",
          }}
        />
        <span
          aria-hidden
          className="sapphire-banner-ambient pointer-events-none absolute inset-0 z-[1]"
        />
        <span
          aria-hidden
          className="sapphire-banner-edge pointer-events-none absolute inset-x-0 top-0 z-[1] h-px"
        />
        <span
          aria-hidden
          className="sapphire-banner-shine sapphire-banner-shine-primary pointer-events-none absolute inset-y-0 left-0 z-[1] w-[45%]"
        />
        <div className="pointer-events-none absolute inset-[1px] rounded-[1.3rem] border border-white/10" />

        <div className="absolute right-2.5 top-2.5 z-[4] sm:right-3 sm:top-3">
          <PremiumMenuButton size="sm" />
        </div>

        <div className="relative z-[2] flex flex-col items-center text-center">
          {copy.badge ? (
            <span
              className={cn(
                "sapphire-header-badge mb-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[8px] font-bold tracking-[0.22em]",
                badgeTone,
              )}
            >
              {copy.badge}
            </span>
          ) : null}

          <div className="flex flex-col items-center gap-0">
            <div className="sapphire-title-stage relative inline-flex max-w-full items-center justify-center overflow-visible px-2 py-0.5">
              <span
                aria-hidden
                className="sapphire-title-ambient pointer-events-none absolute -inset-x-8 -inset-y-3 z-0"
              />
              <span
                aria-hidden
                className="sapphire-title-shine sapphire-title-shine-primary pointer-events-none absolute inset-y-0 left-0 z-[1] w-[55%]"
              />

              <h1
                className={cn(
                  "sapphire-header-title sapphire-title-3d relative z-[2] max-w-[20ch] font-bold leading-[0.9] tracking-tight sm:max-w-none",
                  "ice-text-sapphire ice-text-live",
                  copy.title.length <= 8
                    ? "text-[clamp(3rem,13vw,4.1rem)]"
                    : "text-[clamp(2.35rem,10.5vw,3.35rem)]",
                )}
                data-text={copy.title}
              >
                {copy.title}
              </h1>

              <span
                aria-hidden
                className={cn(
                  "sapphire-title-sheen pointer-events-none absolute inset-0 z-[3] flex items-center justify-center font-bold leading-[0.9] tracking-tight",
                  copy.title.length <= 8
                    ? "text-[clamp(3rem,13vw,4.1rem)]"
                    : "text-[clamp(2.35rem,10.5vw,3.35rem)]",
                )}
              >
                {copy.title}
              </span>
            </div>

            {showVerified ? (
              <div className="-mt-0.5 w-full px-2 leading-none">
                <MetalVerifiedTrue size="sm" />
              </div>
            ) : null}
          </div>

          <p
            className={cn(
              "sapphire-header-line mt-2.5 max-w-md text-[11px] font-medium leading-relaxed sm:text-[12.5px]",
              accent === "gold" ? "text-gold-bright/90" : "text-sky-50/90",
            )}
          >
            {copy.line}
          </p>
        </div>
      </div>
    </header>
  );
}
