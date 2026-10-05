/** Owner R mark. Shared shell chrome — not a room header. */
import { useSyncExternalStore } from "react";
import { Calculator, Settings } from "lucide-react";
import { readTheme, serverTheme, subscribeTheme } from "@/lib/theme";
import { TowGlyph } from "./BottomTabs";
import "./tool-rail.css";

/** David's finished cutout. 60px file is 2x, 90px file is 3x, for a 30px header. */
export const RAIDHO_SHELL_MARK = "/assets/brand/r-mark-final-60.png";
export const RAIDHO_SHELL_MARK_LIGHT = "/assets/brand/r-mark-final-60.png";
export const RAIDHO_SHELL_MARK_LIGHT_WEBP = "/assets/brand/r-mark-final-60.webp";
export const RAIDHO_SHELL_MARK_LIGHT_3X = "/assets/brand/r-mark-final-90.png";

/**
 * Logo + persistent Tow / Cal / Settings controls.
 * No back chevron on Home. Theme lives inside Settings — no standalone switch.
 */
export function SuiteBrand({
  onHome,
  onOpenTow,
  onOpenCal,
  onOpenSettings,
  settingsOpen = false,
}: {
  onHome: () => void;
  onOpenTow?: () => void;
  onOpenCal?: () => void;
  onOpenSettings?: () => void;
  settingsOpen?: boolean;
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
      <div className="showroom-header-tools" data-tool-rail>
        <button
          type="button"
          className="tool-rail-btn"
          data-tool-rail="tow"
          aria-label="Tow"
          title="Tow"
          onClick={() => onOpenTow?.()}
        >
          <TowGlyph className="tool-rail-glyph" />
          <span className="tool-rail-label">Tow</span>
        </button>
        <button
          type="button"
          className="tool-rail-btn"
          data-tool-rail="cal"
          aria-label="Cal"
          title="Cal"
          onClick={() => onOpenCal?.()}
        >
          <Calculator className="tool-rail-glyph" strokeWidth={1.75} aria-hidden />
          <span className="tool-rail-label">Cal</span>
        </button>
        <button
          type="button"
          className="tool-rail-btn is-settings"
          data-tool-rail="settings"
          aria-label="Settings"
          title="Settings"
          aria-expanded={settingsOpen}
          aria-haspopup="dialog"
          onClick={() => onOpenSettings?.()}
        >
          <Settings className="tool-rail-glyph" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
    </div>
  );
}
