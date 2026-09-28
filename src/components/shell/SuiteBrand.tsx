/** Owner Raidho mark. Shared shell chrome — not a room header. */
import { useSyncExternalStore } from "react";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import { PremiumMenuButton } from "./PremiumMenuButton";

export const RAIDHO_SHELL_MARK = "/assets/brand/raidho-shell-mark.png";
/** Tight crop of the light-ground Raidho R. Dark shell mark stays untouched. */
export const RAIDHO_SHELL_MARK_LIGHT = "/assets/brand/raidho-r-mark-light.png";

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
          alt=""
          width={19}
          height={32}
          className="showroom-mark"
          data-mark-dark={RAIDHO_SHELL_MARK}
          data-mark-light={RAIDHO_SHELL_MARK_LIGHT}
        />
        <span className="showroom-word">RvFOX</span>
      </button>
      {showMenu ? <PremiumMenuButton variant="showroom" /> : null}
    </div>
  );
}
