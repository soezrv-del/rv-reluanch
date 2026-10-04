import type { ReactNode } from "react";
import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import { resolveShareHost } from "@/lib/og/shareHost";
import appCss from "../styles.css?url";
import buttonsCss from "../styles/buttons.css?url";

const APP_NAME = "RvFOX · Know before you buy.";

export const Route = createRootRoute({
  head: () => {
    const host = resolveShareHost();
    const xBanner = host ? `https://${host}/x-banner.jpg` : "";
    return {
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
      { name: "theme-color", content: "#ffffff" },
      { name: "color-scheme", content: "light" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
      ...(xBanner ? [{ property: "x:game:image", content: xBanner }] : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: buttonsCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", href: "/assets/brand/icon-rvfax.png" },
      { rel: "apple-touch-icon", href: "/assets/brand/icon-rvfax.png" },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
    ],
    };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="bg-bg text-white antialiased">
        <PreviewHostBridge />
        <AuthProvider>{children}</AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
