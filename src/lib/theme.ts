export type SuiteTheme = "light" | "dark";

export function setTheme(next: SuiteTheme) {
  document.documentElement.dataset.theme = next;
  localStorage.setItem("rvfox-theme", next);
  const color = next === "light" ? "#f4f6f8" : "#050505";
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", color);
  document
    .querySelector('meta[name="color-scheme"]')
    ?.setAttribute("content", next);
}

/** Read before first paint. Keep in sync with RootDocument. */
export const THEME_BOOT_SCRIPT = `(function(){try{var t=localStorage.getItem("rvfox-theme");if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;var c=t==="light"?"#f4f6f8":"#050505";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",c);var s=document.querySelector('meta[name="color-scheme"]');if(s)s.setAttribute("content",t);}}catch(e){}})();`;
