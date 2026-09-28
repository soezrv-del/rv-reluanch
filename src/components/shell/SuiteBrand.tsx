/** Owner Raidho mark. Shared shell chrome — not a room header. */
import { useSyncExternalStore } from "react";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import { PremiumMenuButton } from "./PremiumMenuButton";

export const RAIDHO_SHELL_MARK = "/assets/brand/raidho-shell-mark.png";
/** Transparent sapphire R for light mode. 2x is 60px tall, 3x is 90px, for a 30px header. */
export const RAIDHO_SHELL_MARK_LIGHT = "/assets/brand/raidho-r-mark-light.png";
export const RAIDHO_SHELL_MARK_LIGHT_3X = "/assets/brand/raidho-r-mark-light-3x.png";

export function SuiteBrand({
  onHome,
  showMenu = false,
}: {
  onHome: () => void;
  showMenu?: boolean;
}) {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const src = theme === "light" ? RAIDHO_SHELL_MARK_LIGHT : RAIDHO_SHELL_MARK;

  return (
    <div className="showroom-header" data-suite-header>
      <button
        type="button"
        data-suite-brand
        aria-label="Home"
        onClick={onHome}
        className="showroom-brand"
      >
        <img
          key={theme}
          src={src}
          srcSet={
            theme === "light"
              ? `${RAIDHO_SHELL_MARK_LIGHT} 2x, ${RAIDHO_SHELL_MARK_LIGHT_3X} 3x`
              : undefined
          }
          alt=""
          className="showroom-mark"
          data-mark-dark={RAIDHO_SHELL_MARK}
          data-mark-light={RAIDHO_SHELL_MARK_LIGHT}
          data-mark-light-3x={RAIDHO_SHELL_MARK_LIGHT_3X}
        />
        <span className="showroom-word">RvFOX</span>
      </button>
      {showMenu ? <PremiumMenuButton variant="showroom" /> : null}
    </div>
  );
}
