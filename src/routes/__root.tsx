import { useEffect, type ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { THEME_BG, readStoredTheme } from "@/lib/theme";
import appCss from "../styles.css?url";

const APP_NAME = "RvFOX · Know before you buy.";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content",
      },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "RvGrok — professional RV intelligence powered by xAI Grok. Specs, pricing, recalls, financing, and multi-step Agent research.",
      },
      { name: "theme-color", content: "#f2f2f2" },
      { name: "color-scheme", content: "light" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/assets/brand/icon-rvfax.png" },
      { rel: "apple-touch-icon", href: "/assets/brand/icon-rvfax.png" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

/**
 * Runs in the document head before the body is painted.
 * Unset or white paints #f2f2f2 before the body.
 * A saved "blue" choice paints the original sapphire navy (#061228).
 */
const THEME_BOOT = `(function(){var t="white";try{var stored=localStorage.getItem("rvfox-theme");if(stored==="white"||stored==="blue")t=stored;}catch(e){}var bg=t==="blue"?"#061228":"#f2f2f2";var h=document.documentElement;h.setAttribute("data-theme",t);h.style.backgroundColor=bg;h.style.colorScheme=t==="white"?"light":"dark";var s=document.createElement("style");s.id="theme-boot";s.textContent="html,body{background-color:"+bg+" !important}";(document.head||h).appendChild(s);var m=document.querySelector('meta[name="theme-color"]');if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");(document.head||h).appendChild(m);}m.setAttribute("content",bg);})();`;

/** Re-apply after hydration so the head meta matches the stored scheme. */
function ThemeChromeSync() {
  useEffect(() => {
    const theme = readStoredTheme();
    const bg = THEME_BG[theme];
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    root.style.backgroundColor = bg;
    root.style.colorScheme = theme === "white" ? "light" : "dark";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", bg);
    const boot = document.getElementById("theme-boot");
    if (boot) boot.textContent = `html,body{background-color:${bg} !important}`;
  }, []);
  return null;
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <HeadContent />
      </head>
      <body className="bg-bg text-fg antialiased">
        <ThemeChromeSync />
        <PreviewHostBridge />
        <AuthProvider>{children}</AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
