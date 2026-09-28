/**
 * Stored color scheme. White is the default. Blue is the saved navy choice.
 * Auth stays off — localStorage only.
 *
 * Blue page color is `--color-bg` from e76a8cb83fd59b8c76992045684ae0895385f56e.
 */
export const THEME_STORAGE_KEY = "rvfox-theme";
export const THEME_CHANGE_EVENT = "rvfox-theme-change";

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
  const next: ColorScheme = theme === "white" ? "white" : "blue";
  const bg = THEME_BG[next];
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* private mode — the attribute still switches this visit */
  }
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  root.style.backgroundColor = bg;
  root.style.colorScheme = next === "white" ? "light" : "dark";
  if (document.body) document.body.style.backgroundColor = bg;
  const boot = document.getElementById("theme-boot");
  if (boot) boot.textContent = `html,body{background-color:${bg} !important}`;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", bg);
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: next }));
}
