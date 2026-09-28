import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
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
 * Default is white. A saved "blue" choice paints navy on the first frame.
 */
const THEME_BOOT = `(function(){var t="white";try{if(localStorage.getItem("rvfox-theme")==="blue")t="blue";}catch(e){}var bg=t==="blue"?"#061228":"#f2f2f2";var h=document.documentElement;h.setAttribute("data-theme",t);h.style.backgroundColor=bg;h.style.colorScheme=t==="blue"?"dark":"light";var css="html,body{background-color:"+bg+" !important}";if(t!=="blue"){css+="html,body,#root{background:#f2f2f2 !important;background-image:none !important}";var paint=function(){var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content","#f2f2f2");var bars=document.querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]');for(var i=0;i<bars.length;i++)bars[i].setAttribute("content","default");};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",paint);else paint();}var s=document.createElement("style");s.id="theme-boot";s.textContent=css;(document.head||h).appendChild(s);})();`;

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <HeadContent />
      </head>
      <body className="bg-bg text-fg antialiased">
        <PreviewHostBridge />
        <AuthProvider>{children}</AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
