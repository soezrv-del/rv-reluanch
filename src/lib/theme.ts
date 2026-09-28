/** Stored color scheme. White is the default. Auth stays off — localStorage only. */
export const THEME_STORAGE_KEY = "rvfox-theme";

export type ColorScheme = "white" | "blue";

export const THEME_BG: Record<ColorScheme, string> = {
  white: "#f2f2f2",
  blue: "#061228",
};

export function readStoredTheme(): ColorScheme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "blue" ? "blue" : "white";
  } catch {
    return "white";
  }
}

/** Apply immediately so a toggle does not wait for a reload. */
export function applyTheme(theme: ColorScheme) {
  const next: ColorScheme = theme === "blue" ? "blue" : "white";
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* private mode — the attribute still switches this visit */
  }
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  root.style.backgroundColor = THEME_BG[next];
  root.style.colorScheme = next === "blue" ? "dark" : "light";
}
