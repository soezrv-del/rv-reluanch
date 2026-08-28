import type { CapacitorConfig } from "@capacitor/cli";

/**
 * RVFAX iOS shell (Capacitor → Xcode → TestFlight)
 *
 * Before syncing on your Mac:
 *   export CAP_SERVER_URL="https://YOUR-LIVE-APP.vercel.app"
 *   npm run cap:sync
 *   npm run cap:open
 *
 * Without CAP_SERVER_URL the WebView shows a local shell (no live APIs).
 * Chat, voice, VIN, ZIP tax, OSRM need the hosted app + Cloudflare worker.
 */
const serverUrl = process.env.CAP_SERVER_URL?.trim().replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "com.markclass.rvfax",
  appName: "RVFAX",
  webDir: "cap-www",
  backgroundColor: "#050508",
  loggingBehavior: "production",
  ios: {
    contentInset: "automatic",
    preferredContentMode: "mobile",
    scheme: "RVFAX",
    allowsLinkPreview: false,
    scrollEnabled: true,
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#050508",
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    SplashScreen: {
      // Keep native splash until Launchpad calls SplashScreen.hide()
      // (avoids black gap while remote WebView JS + video buffer).
      launchShowDuration: 0,
      launchAutoHide: false,
      backgroundColor: "#050508",
      showSpinner: false,
      androidSplashResourceName: "splash",
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#050508",
    },
    Keyboard: {
      // Let us position UI with visualViewport / --kb-inset (more reliable for
      // fixed bottom sheets & dock on iOS than body resize alone).
      resize: "none",
      resizeOnFullScreen: true,
    },
    App: {
      // deep links can be added later: rvfax://
    },
  },
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
          allowNavigation: [
            serverUrl,
            "https://*.vercel.app",
            "https://*.x.ai",
            "https://api.x.ai",
            "wss://api.x.ai",
            "https://*.workers.dev",
            "https://*.cloudflare.com",
            "https://vpic.nhtsa.dot.gov",
            "https://api.nhtsa.gov",
            "https://nominatim.openstreetmap.org",
            "https://router.project-osrm.org",
          ],
        },
      }
    : {}),
};

export default config;
