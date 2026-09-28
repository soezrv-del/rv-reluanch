/** Owner R mark. Shared shell chrome — not a room header. */
import { useSyncExternalStore } from "react";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import { PremiumMenuButton } from "./PremiumMenuButton";
import { ThemeSwitch } from "./ThemeSwitch";

/** David's finished cutout. 60px file is 2x, 90px file is 3x, for a 30px header. */
export const RAIDHO_SHELL_MARK = "/assets/brand/r-mark-final-60.png";
export const RAIDHO_SHELL_MARK_LIGHT = "/assets/brand/r-mark-final-60.png";
export const RAIDHO_SHELL_MARK_LIGHT_WEBP = "/assets/brand/r-mark-final-60.webp";
export const RAIDHO_SHELL_MARK_LIGHT_3X = "/assets/brand/r-mark-final-90.png";

export function SuiteBrand({
  onHome,
  showMenu = false,
}: {
  onHome: () => void;
  showMenu?: boolean;
}) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);

  return (
    <div className="showroom-header" data-suite-header>
      <button
        type="button"
        data-suite-brand
        aria-label="Home"
        onClick={onHome}
        className="showroom-brand"
      >
        <picture>
          <source
            type="image/webp"
            srcSet={`${RAIDHO_SHELL_MARK_LIGHT_WEBP} 2x`}
            media="(max-resolution: 2.5dppx)"
          />
          <img
            key={theme}
            src={RAIDHO_SHELL_MARK}
            srcSet={`${RAIDHO_SHELL_MARK_LIGHT} 2x, ${RAIDHO_SHELL_MARK_LIGHT_3X} 3x`}
            alt=""
            className="showroom-mark"
            data-mark-dark={RAIDHO_SHELL_MARK}
            data-mark-light={RAIDHO_SHELL_MARK_LIGHT}
            data-mark-light-3x={RAIDHO_SHELL_MARK_LIGHT_3X}
          />
        </picture>
        <span className="showroom-word">RvFOX</span>
      </button>
      {showMenu ? (
        <div className="showroom-header-tools">
          <ThemeSwitch />
          <PremiumMenuButton variant="showroom" />
        </div>
      ) : null}
    </div>
  );
}
