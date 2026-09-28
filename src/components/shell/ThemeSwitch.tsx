import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  applyTheme,
  readStoredTheme,
  THEME_CHANGE_EVENT,
  type ColorScheme,
} from "@/lib/theme";

/** White / Blue switch. One storage key, shared by the main menu and Premium. */
export function ThemeSwitch({
  className,
  onChoose,
}: {
  className?: string;
  onChoose?: (next: ColorScheme) => void;
}) {
  const [scheme, setScheme] = useState<ColorScheme>("white");

  useEffect(() => {
    const sync = () => setScheme(readStoredTheme());
    sync();
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, sync);
  }, []);

  const choose = (next: ColorScheme) => {
    setScheme(next);
    applyTheme(next);
    onChoose?.(next);
  };

  return (
    <div className={cn("theme-switch", className)} role="group" aria-label="Appearance">
      <button
        type="button"
        className="theme-choice"
        data-theme-choice="white"
        aria-pressed={scheme === "white"}
        onClick={() => choose("white")}
      >
        White
      </button>
      <button
        type="button"
        className="theme-choice"
        data-theme-choice="blue"
        aria-pressed={scheme === "blue"}
        onClick={() => choose("blue")}
      >
        Blue
      </button>
    </div>
  );
}
