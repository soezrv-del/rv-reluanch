/** Owner R mark. Shared shell chrome — not a room header. */
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { readTheme, serverTheme, setTheme, subscribeTheme } from "@/lib/theme";
import "./tool-rail.css";

export const RAIDHO_SHELL_MARK = "/assets/brand/r-mark-final-60.png";
export const RAIDHO_SHELL_MARK_LIGHT = "/assets/brand/r-mark-final-60.png";
export const RAIDHO_SHELL_MARK_LIGHT_WEBP = "/assets/brand/r-mark-final-60.webp";
export const RAIDHO_SHELL_MARK_LIGHT_3X = "/assets/brand/r-mark-final-90.png";

/**
 * Logo returns Home. Theme stays on every section page.
 * Tow, Cal, and Settings live in the section row, not this rail.
 */
export function SuiteBrand({
  onHome,
}: {
  onHome: () => void;
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
          className="tool-rail-btn is-settings"
          data-tool-rail="theme"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="tool-rail-glyph" strokeWidth={1.75} aria-hidden />
          ) : (
            <Moon className="tool-rail-glyph" strokeWidth={1.75} aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
