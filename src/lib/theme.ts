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
  const root = document.documentElement;
  root.dataset.theme = next;
  root.classList.toggle("dark", next === "dark");
  localStorage.setItem("rvfox-theme", next);
  document.querySelectorAll<HTMLImageElement>("[data-mark-light]").forEach((img) => {
    const light = img.dataset.markLight;
    const dark = img.dataset.markDark;
    const light3 = img.dataset.markLight3x;
    if (!light || !dark) return;
    const src = next === "light" ? light : dark;
    img.src = src;
    img.srcset = light3 ? `${src} 2x, ${light3} 3x` : "";
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
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("rvfox-theme");if(t==="light"||t==="dark"){var r=document.documentElement;r.dataset.theme=t;r.classList.toggle("dark",t==="dark");var c=t==="light"?"#ffffff":"#050505";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",c);var s=document.querySelector('meta[name="color-scheme"]');if(s)s.setAttribute("content",t);}}catch(e){}})();`;
