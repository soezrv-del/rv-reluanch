import { useSyncExternalStore } from "react";
import { readTheme, serverTheme, setTheme, subscribeTheme } from "@/lib/theme";
import "./theme-switch.css";

/** Header switch. The word under the knob is the theme that is on. */
export function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);
  const dark = theme === "dark";
  const label = dark ? "Dark" : "Light";

  return (
    <button
      type="button"
      className="theme-switch"
      data-theme-switch={theme}
      aria-pressed={dark}
      aria-label={`${label}. Switch to ${dark ? "light" : "dark"}.`}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <span className="theme-switch-track" data-on={theme}>
        <span className="theme-switch-knob" />
      </span>
      <span className="theme-switch-label">{label}</span>
    </button>
  );
}
