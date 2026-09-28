/** Owner Raidho mark. Shared shell chrome — not a room header. */
import { PremiumMenuButton } from "./PremiumMenuButton";

export const RAIDHO_SHELL_MARK = "/assets/brand/raidho-shell-mark.png";
/** Same tight crop as the shell mark, on the light paper ground. */
export const RAIDHO_SHELL_MARK_LIGHT = "/assets/brand/raidho-r-mark-light.png";

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
          data-suite-mark="dark"
        />
        <img
          src={RAIDHO_SHELL_MARK_LIGHT}
          alt=""
          width={19}
          height={32}
          className="showroom-mark"
          data-suite-mark="light"
        />
        <span className="showroom-word">RvFOX</span>
      </button>
      {showMenu ? <PremiumMenuButton variant="showroom" /> : null}
    </div>
  );
}
