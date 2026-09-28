/** David's chrome-edged sapphire R. Shared shell chrome — not a room header. */
import { PremiumMenuButton } from "./PremiumMenuButton";

export const RAIDHO_SHELL_MARK = "/assets/brand/raidho-r-chrome.webp";

export function SuiteBrand({
  onHome,
  showMenu = false,
}: {
  onHome: () => void;
  showMenu?: boolean;
}) {
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
          src={RAIDHO_SHELL_MARK}
          alt=""
          width={15}
          height={30}
          className="showroom-mark home-theme-white"
        />
        <img
          src="/assets/brand/raidho-shell-mark.png"
          alt=""
          width={19}
          height={32}
          className="showroom-mark home-theme-blue"
        />
        <span className="showroom-word">RvFOX</span>
      </button>
      {showMenu ? <PremiumMenuButton variant="showroom" /> : null}
    </div>
  );
}
