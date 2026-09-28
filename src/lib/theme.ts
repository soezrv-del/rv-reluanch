export type SuiteTheme = "light" | "dark";

export function serverTheme(): SuiteTheme {
  return "dark";
}

export function readTheme(): SuiteTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export function subscribeTheme(onStoreChange: () => void) {
  const node = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(node, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

export function setTheme(next: SuiteTheme) {
  document.documentElement.dataset.theme = next;
  localStorage.setItem("rvfox-theme", next);
  document.querySelectorAll<HTMLImageElement>("[data-mark-light]").forEach((img) => {
    const light = img.dataset.markLight;
    const dark = img.dataset.markDark;
    if (!light || !dark) return;
    img.src = next === "light" ? light : dark;
  });
  const color = next === "light" ? "#ffffff" : "#050505";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", color);
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", next);
}

/** Read before first paint. Keep in sync with RootDocument. */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("rvfox-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;var c=t==="light"?"#ffffff":"#050505";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",c);var s=document.querySelector('meta[name="color-scheme"]');if(s)s.setAttribute("content",t);}}catch(e){}})();`;
