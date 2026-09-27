/** Owner Raidho mark. Shared shell chrome — not a room header. */
import { PremiumMenuButton } from "./PremiumMenuButton";

export const RAIDHO_SHELL_MARK = "/assets/brand/raidho-shell-mark.png";

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
          width={19}
          height={32}
          className="showroom-mark"
        />
        <span className="showroom-word">RvFOX</span>
      </button>
      {showMenu ? <PremiumMenuButton variant="showroom" /> : null}
    </div>
  );
}
